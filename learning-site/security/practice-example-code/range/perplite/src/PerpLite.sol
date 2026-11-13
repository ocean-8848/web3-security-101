// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MockOracle} from "./mocks/MockOracle.sol";

interface IERC20Lite {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @title PerpLite
/// @notice 单市场永续合约。LP 金库是所有交易者的对手方。
/// @dev 金额 6 位小数，价格 8 位小数，资金费累计值 18 位小数。
contract PerpLite {
    struct Position {
        uint256 size; // 名义价值
        uint256 collateral;
        uint256 entryPrice;
        int256 entryFunding;
    }

    struct Order {
        address owner;
        bool isLong;
        bool isClose;
        uint256 size;
        uint256 collateral;
        uint256 acceptablePrice;
        uint256 createdAt;
        uint256 ethFee;
    }

    uint256 public constant MAX_LEVERAGE = 10;
    uint256 public constant MAX_UTIL_BPS = 8_000;
    uint256 public constant OPEN_FEE_BPS = 10;
    uint256 public constant MAINT_BPS = 100;
    uint256 public constant LIQ_FEE_BPS = 500;
    uint256 public constant KEEPER_FEE = 0.001 ether;
    int256 public constant FUNDING_PER_SEC = 3e11;

    IERC20Lite public immutable usd;
    MockOracle public immutable oracle;

    uint256 public poolAmount;
    uint256 public totalShares;
    uint256 public totalCollateral;
    uint256 public pendingCollateral;
    uint256 public longOI;
    uint256 public shortOI;
    int256 public cumFunding;
    uint256 public lastFundingAt;

    uint256 public head;
    uint256 public tail;
    mapping(uint256 => Order) public orders;
    mapping(address => uint256) public shares;
    mapping(address => mapping(bool => Position)) public positions;

    event Liquidated(address indexed owner, bool isLong, int256 equity);

    constructor(IERC20Lite usd_, MockOracle oracle_) {
        usd = usd_;
        oracle = oracle_;
        lastFundingAt = block.timestamp;
    }

    // ---------- LP ----------

    function deposit(uint256 amount) external {
        uint256 minted = totalShares == 0 ? amount : (amount * totalShares) / poolAmount;
        require(minted > 0, "zero shares");
        usd.transferFrom(msg.sender, address(this), amount);
        poolAmount += amount;
        totalShares += minted;
        shares[msg.sender] += minted;
    }

    function withdraw(uint256 shareAmount) external {
        uint256 amount = (shareAmount * poolAmount) / totalShares;
        uint256 biggest = longOI > shortOI ? longOI : shortOI;
        require(((poolAmount - amount) * MAX_UTIL_BPS) / 10_000 >= biggest, "reserved");
        shares[msg.sender] -= shareAmount;
        totalShares -= shareAmount;
        poolAmount -= amount;
        usd.transfer(msg.sender, amount);
    }

    // ---------- 第一步：提交订单 ----------

    function requestIncrease(bool isLong, uint256 size, uint256 collateral, uint256 acceptablePrice)
        external
        payable
        returns (uint256 id)
    {
        require(msg.value >= KEEPER_FEE, "fee");
        require(size > 0, "size");
        usd.transferFrom(msg.sender, address(this), collateral);
        pendingCollateral += collateral;
        id = tail++;
        orders[id] = Order(msg.sender, isLong, false, size, collateral, acceptablePrice, block.timestamp, msg.value);
    }

    function requestClose(bool isLong, uint256 acceptablePrice) external payable returns (uint256 id) {
        require(msg.value >= KEEPER_FEE, "fee");
        id = tail++;
        orders[id] = Order(msg.sender, isLong, true, 0, 0, acceptablePrice, block.timestamp, msg.value);
    }

    // ---------- 第二步：Keeper 执行 ----------

    function executeNext(uint256 roundId) external {
        require(head < tail, "empty");
        Order memory o = orders[head];
        (uint256 price, ) = oracle.getRound(roundId);
        require(price > 0, "round");

        delete orders[head];
        head++;

        if (o.isClose) {
            _executeClose(o, price);
        } else {
            _executeIncrease(o, price);
        }

        (bool ok, ) = msg.sender.call{value: KEEPER_FEE}("");
        require(ok, "keeper");
        if (o.ethFee > KEEPER_FEE) {
            (ok, ) = o.owner.call{value: o.ethFee - KEEPER_FEE}("");
            require(ok, "refund");
        }
    }

    function _executeIncrease(Order memory o, uint256 price) internal {
        require(o.isLong ? price <= o.acceptablePrice : price >= o.acceptablePrice, "slippage");

        if (o.isLong) longOI += o.size;
        else shortOI += o.size;
        require((o.isLong ? longOI : shortOI) <= (poolAmount * MAX_UTIL_BPS) / 10_000, "oi cap");
        accrueFunding();

        Position storage p = positions[o.owner][o.isLong];
        uint256 fee = (o.size * OPEN_FEE_BPS) / 10_000;
        uint256 newCollateral = p.collateral + o.collateral - fee;
        uint256 newSize = p.size + o.size;
        require(newSize <= newCollateral * MAX_LEVERAGE, "leverage");

        p.entryPrice = (p.entryPrice * p.size + price * o.size) / newSize;
        p.entryFunding = cumFunding;
        p.size = newSize;
        p.collateral = newCollateral;

        pendingCollateral -= o.collateral;
        totalCollateral += o.collateral - fee;
        poolAmount += fee;
    }

    function _executeClose(Order memory o, uint256 price) internal {
        require(o.isLong ? price >= o.acceptablePrice : price <= o.acceptablePrice, "slippage");
        accrueFunding();
        Position memory p = positions[o.owner][o.isLong];
        require(p.size > 0, "no position");

        int256 equity = _equity(p, o.isLong, price);
        uint256 payout = equity > 0 ? uint256(equity) : 0;
        uint256 available = poolAmount + p.collateral;
        if (payout > available) payout = available;

        delete positions[o.owner][o.isLong];
        if (o.isLong) longOI -= p.size;
        else shortOI -= p.size;
        totalCollateral -= p.collateral;
        poolAmount = available - payout;
        usd.transfer(o.owner, payout);
    }

    // ---------- 保证金 ----------

    function removeCollateral(bool isLong, uint256 amount) external {
        accrueFunding();
        Position storage p = positions[msg.sender][isLong];
        require(p.size > 0, "no position");
        uint256 left = p.collateral - amount;
        require(p.size <= left * MAX_LEVERAGE, "leverage");
        p.collateral = left;
        totalCollateral -= amount;
        usd.transfer(msg.sender, amount);
    }

    // ---------- 清算 ----------

    function liquidate(address owner, bool isLong) external {
        accrueFunding();
        Position memory p = positions[owner][isLong];
        require(p.size > 0, "no position");
        (uint256 price, ) = oracle.latest();

        int256 equity = _equity(p, isLong, price);
        require(equity < int256((p.size * MAINT_BPS) / 10_000), "healthy");

        uint256 remaining = uint256(equity);
        uint256 fee = (remaining * LIQ_FEE_BPS) / 10_000;

        delete positions[owner][isLong];
        totalCollateral -= p.collateral;
        poolAmount += p.collateral - remaining;

        usd.transfer(msg.sender, fee);
        usd.transfer(owner, remaining - fee);
        emit Liquidated(owner, isLong, equity);
    }

    // ---------- 资金费与视图 ----------

    function accrueFunding() public {
        uint256 dt = block.timestamp - lastFundingAt;
        lastFundingAt = block.timestamp;
        uint256 total = longOI + shortOI;
        if (dt == 0 || total == 0) return;
        int256 skew = int256(longOI) - int256(shortOI);
        cumFunding += (FUNDING_PER_SEC * skew * int256(dt)) / int256(total);
    }

    function _equity(Position memory p, bool isLong, uint256 price) internal view returns (int256) {
        int256 diff = isLong ? int256(price) - int256(p.entryPrice) : int256(p.entryPrice) - int256(price);
        int256 pnl = (int256(p.size) * diff) / int256(p.entryPrice);
        int256 owed = (int256(p.size) * (cumFunding - p.entryFunding)) / 1e18;
        if (!isLong) owed = -owed;
        return int256(p.collateral) + pnl - owed;
    }

    function equityAt(address owner, bool isLong, uint256 price) external view returns (int256) {
        return _equity(positions[owner][isLong], isLong, price);
    }

    receive() external payable {}
}
