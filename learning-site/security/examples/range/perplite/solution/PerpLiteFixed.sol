// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MockOracle} from "../src/mocks/MockOracle.sol";

interface IERC20Lite {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @title PerpLiteFixed
/// @notice PerpLite 的修复版。每处修复用 ✅ 和发现编号标注。
contract PerpLiteFixed {
    struct Position {
        uint256 size;
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

    error StalePrice();
    error WrongRound();

    uint256 public constant MAX_LEVERAGE = 10;
    uint256 public constant MAX_UTIL_BPS = 8_000;
    uint256 public constant OPEN_FEE_BPS = 10;
    uint256 public constant MAINT_BPS = 100;
    uint256 public constant LIQ_FEE_BPS = 500;
    uint256 public constant KEEPER_FEE = 0.001 ether;
    int256 public constant FUNDING_PER_SEC = 3e11;
    uint256 public constant MAX_PRICE_AGE = 1 hours;
    uint256 public constant ORDER_TTL = 1 hours;

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
    uint256 public badDebt;

    uint256 public head;
    uint256 public tail;
    mapping(uint256 => Order) public orders;
    mapping(address => uint256) public shares;
    mapping(address => mapping(bool => Position)) public positions;
    mapping(address => uint256) public ethOwed;

    event Liquidated(address indexed owner, bool isLong, int256 equity);
    event OrderCancelled(uint256 indexed id, string reason);
    event BadDebt(address indexed owner, bool isLong, uint256 amount);

    constructor(IERC20Lite usd_, MockOracle oracle_) {
        usd = usd_;
        oracle = oracle_;
        lastFundingAt = block.timestamp;
    }

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

    function executeNext(uint256 roundId) external {
        require(head < tail, "empty");
        uint256 id = head;
        Order memory o = orders[id];

        // ✅ F-03：过期订单直接取消，队列继续前进
        if (block.timestamp > o.createdAt + ORDER_TTL) {
            _finish(id, o, false, "expired");
            return;
        }

        // ✅ F-02：只接受订单创建之后的第一轮价格
        (uint256 price, uint256 updatedAt) = oracle.getRound(roundId);
        if (price == 0 || updatedAt <= o.createdAt) revert WrongRound();
        (, uint256 previousAt) = oracle.getRound(roundId - 1);
        if (previousAt > o.createdAt) revert WrongRound();

        // ✅ F-03：业务失败不回滚，订单被取消
        (bool ok, string memory reason) = o.isClose ? _executeClose(o, price) : _executeIncrease(o, price);
        _finish(id, o, ok, reason);
    }

    function _finish(uint256 id, Order memory o, bool ok, string memory reason) internal {
        delete orders[id];
        head = id + 1;
        if (!ok) {
            if (o.collateral > 0) {
                pendingCollateral -= o.collateral;
                usd.transfer(o.owner, o.collateral);
            }
            emit OrderCancelled(id, reason);
        }
        // ✅ F-03：ETH 退款改为拉取，收款方无法让 Keeper 回滚
        ethOwed[msg.sender] += KEEPER_FEE;
        if (o.ethFee > KEEPER_FEE) ethOwed[o.owner] += o.ethFee - KEEPER_FEE;
    }

    function claimEth() external {
        uint256 amount = ethOwed[msg.sender];
        ethOwed[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "claim");
    }

    function _executeIncrease(Order memory o, uint256 price) internal returns (bool, string memory) {
        if (o.isLong ? price > o.acceptablePrice : price < o.acceptablePrice) return (false, "slippage");

        // ✅ F-04：先按旧的多空偏斜结算资金费，再改变 OI
        accrueFunding();

        uint256 nextOi = (o.isLong ? longOI : shortOI) + o.size;
        if (nextOi > (poolAmount * MAX_UTIL_BPS) / 10_000) return (false, "oi cap");

        Position storage p = positions[o.owner][o.isLong];
        uint256 fee = (o.size * OPEN_FEE_BPS) / 10_000;
        if (p.collateral + o.collateral <= fee) return (false, "leverage");

        // ✅ F-04：已有仓位先把资金费记入保证金，再重设快照
        int256 settled = int256(p.collateral + o.collateral - fee);
        if (p.size > 0) {
            int256 owed = (int256(p.size) * (cumFunding - p.entryFunding)) / 1e18;
            settled -= o.isLong ? owed : -owed;
        }
        if (settled <= 0) return (false, "funding");
        uint256 newCollateral = uint256(settled);
        uint256 newSize = p.size + o.size;
        if (newSize > newCollateral * MAX_LEVERAGE) return (false, "leverage");
        if (newCollateral > poolAmount + p.collateral + o.collateral) return (false, "pool");

        // ✅ F-07：名义价值计价时，均价是调和平均
        if (p.size == 0) {
            p.entryPrice = price;
        } else {
            uint256 tokens = (p.size * 1e18) / p.entryPrice + (o.size * 1e18) / price;
            p.entryPrice = o.isLong ? (newSize * 1e18 + tokens - 1) / tokens : (newSize * 1e18) / tokens;
        }

        uint256 oldCollateral = p.collateral;
        p.entryFunding = cumFunding;
        p.size = newSize;
        p.collateral = newCollateral;
        if (o.isLong) longOI = nextOi;
        else shortOI = nextOi;

        pendingCollateral -= o.collateral;
        totalCollateral = totalCollateral - oldCollateral + newCollateral;
        // 手续费和结算的资金费都进出 LP 池；两边保持总额相等
        poolAmount = poolAmount + oldCollateral + o.collateral - newCollateral;
        return (true, "");
    }

    function _executeClose(Order memory o, uint256 price) internal returns (bool, string memory) {
        if (o.isLong ? price < o.acceptablePrice : price > o.acceptablePrice) return (false, "slippage");
        accrueFunding();
        Position memory p = positions[o.owner][o.isLong];
        if (p.size == 0) return (false, "no position");

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
        return (true, "");
    }

    function removeCollateral(bool isLong, uint256 amount) external {
        accrueFunding();
        Position storage p = positions[msg.sender][isLong];
        require(p.size > 0, "no position");
        uint256 left = p.collateral - amount;
        require(p.size <= left * MAX_LEVERAGE, "leverage");

        // ✅ F-06：取走后，含未实现盈亏和资金费的权益仍要满足初始保证金
        p.collateral = left;
        int256 equity = _equity(p, isLong, _freshPrice());
        require(equity >= int256(p.size / MAX_LEVERAGE), "equity");

        totalCollateral -= amount;
        usd.transfer(msg.sender, amount);
    }

    function liquidate(address owner, bool isLong) external {
        accrueFunding();
        Position memory p = positions[owner][isLong];
        require(p.size > 0, "no position");
        uint256 price = _freshPrice();

        int256 equity = _equity(p, isLong, price);
        require(equity < int256((p.size * MAINT_BPS) / 10_000), "healthy");

        // ✅ F-05：权益为负时按 0 处理，并记录坏账
        uint256 remaining = equity > 0 ? uint256(equity) : 0;
        if (remaining > p.collateral) remaining = p.collateral;
        if (equity < 0) {
            badDebt += uint256(-equity);
            emit BadDebt(owner, isLong, uint256(-equity));
        }
        uint256 fee = (remaining * LIQ_FEE_BPS) / 10_000;

        delete positions[owner][isLong];
        // ✅ F-08：清算同步减少 OI
        if (isLong) longOI -= p.size;
        else shortOI -= p.size;
        totalCollateral -= p.collateral;
        poolAmount += p.collateral - remaining;

        usd.transfer(msg.sender, fee);
        usd.transfer(owner, remaining - fee);
        emit Liquidated(owner, isLong, equity);
    }

    // ✅ F-01：所有使用最新价的路径都检查新鲜度
    function _freshPrice() internal view returns (uint256 price) {
        uint256 updatedAt;
        (price, updatedAt) = oracle.latest();
        if (price == 0 || block.timestamp - updatedAt > MAX_PRICE_AGE) revert StalePrice();
    }

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
