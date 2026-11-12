// SPDX-License-Identifier: MIT
// 配套章节：audit/R25 实战项目 ｜ MiniLend.sol 的全部修复（对外接口不变）
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

import {IUSD, IPriceFeed} from "./MiniLend.sol";

contract MiniLendFixed {
    bytes32 private constant IMPLEMENTATION_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    uint256 private constant RAY = 1e27;
    uint256 public constant LTV = 75;
    uint256 public constant LIQ_THRESHOLD = 80;
    uint256 public constant RATE_PER_SECOND = 1585489599188229400;
    uint256 public constant MAX_PRICE_DELAY = 3600; // 按喂价心跳设置，示例
    uint256 public constant CLOSE_FACTOR_PCT = 50; // 单次最多清算 50% 债务，示例
    uint256 public constant LIQ_BONUS_PCT = 105; // 清算奖励 5%，示例

    IUSD public usd;
    IPriceFeed public feed;
    address public owner;
    uint256 public borrowIndex;
    uint256 public lastAccrual;
    uint256 public totalDebtShares;
    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debtShares;

    bool private initialized; // ✅ 修复 F-01
    uint256 private lock = 1; // 代理部署时为 0，由 initialize 设为 1

    modifier nonReentrant() {
        require(lock == 1, "reentrant");
        lock = 2;
        _;
        lock = 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        initialized = true; // ✅ 修复 F-01：锁死实现合约
    }

    // ✅ 修复 F-01：只能初始化一次
    function initialize(address _usd, address _feed, address _owner) external {
        require(!initialized, "initialized");
        require(_usd != address(0) && _feed != address(0) && _owner != address(0), "zero address");
        require(IPriceFeed(_feed).decimals() == 8, "feed decimals");
        initialized = true;
        lock = 1;
        usd = IUSD(_usd);
        feed = IPriceFeed(_feed);
        owner = _owner;
        borrowIndex = RAY;
        lastAccrual = block.timestamp;
    }

    // ✅ 修复 F-02：只有 owner 可以升级；生产环境由多签加时间锁持有
    function upgradeTo(address newImpl) external onlyOwner {
        require(newImpl.code.length > 0, "not a contract");
        assembly {
            sstore(IMPLEMENTATION_SLOT, newImpl)
        }
    }

    function accrue() public {
        uint256 dt = block.timestamp - lastAccrual;
        if (dt == 0) return;
        borrowIndex += borrowIndex * RATE_PER_SECOND * dt / RAY;
        lastAccrual = block.timestamp;
    }

    // ✅ 修复 F-05：拒绝非正价格和过期价格
    function price() public view returns (uint256) {
        (, int256 answer, , uint256 updatedAt, ) = feed.latestRoundData();
        require(answer > 0, "bad price");
        require(updatedAt != 0 && block.timestamp - updatedAt <= MAX_PRICE_DELAY, "stale price");
        return uint256(answer);
    }

    // ✅ 修复 F-08：债务展示和健康度检查都向上取整
    function debtOf(address user) public view returns (uint256) {
        return _ceilMul(debtShares[user], borrowIndex);
    }

    function maxBorrow(address user) public view returns (uint256) {
        return collateral[user] * price() * LTV / 100 / 1e8;
    }

    function deposit() external payable nonReentrant {
        collateral[msg.sender] += msg.value;
    }

    function borrow(uint256 amt) external nonReentrant {
        accrue();
        // ✅ 修复 F-08：铸造债务份额时向上取整
        uint256 shares = _ceilDiv(amt * RAY, borrowIndex);
        require(shares > 0, "zero borrow");
        debtShares[msg.sender] += shares;
        totalDebtShares += shares;
        require(debtOf(msg.sender) <= maxBorrow(msg.sender), "LTV");
        _pushUSD(msg.sender, amt);
    }

    function repay(uint256 amt) external nonReentrant {
        accrue();
        uint256 owed = debtOf(msg.sender);
        uint256 shares;
        if (amt >= owed) {
            amt = owed; // 全额还款：清零全部份额，只收取欠款
            shares = debtShares[msg.sender];
        } else {
            shares = amt * RAY / borrowIndex; // ✅ 修复 F-08：烧毁份额时向下取整
        }
        require(shares > 0, "zero repay");
        debtShares[msg.sender] -= shares;
        totalDebtShares -= shares;
        _pullUSD(msg.sender, amt); // ✅ 修复 F-06
    }

    function withdraw(uint256 amt) external nonReentrant {
        accrue();
        require(collateral[msg.sender] >= amt, "balance");
        collateral[msg.sender] -= amt; // ✅ 修复 F-03：先记账
        // ✅ 修复 F-04：有债务时检查健康度；无债务时不依赖预言机，用户可以离场
        if (debtShares[msg.sender] > 0) {
            require(debtOf(msg.sender) <= maxBorrow(msg.sender), "LTV");
        }
        _sendETH(msg.sender, amt); // ✅ 修复 F-03：最后转账，并由 nonReentrant 保护
    }

    function liquidate(address user) external nonReentrant {
        accrue();
        uint256 debt = debtOf(user);
        uint256 p = price();
        require(debt * 1e8 * 100 > collateral[user] * p * LIQ_THRESHOLD, "healthy");

        // ✅ 修复 F-07：单次只清算一部分，奖励固定比例
        uint256 repayAmt = debt * CLOSE_FACTOR_PCT / 100;
        if (repayAmt == 0) repayAmt = debt;
        uint256 seized = repayAmt * 1e8 * LIQ_BONUS_PCT / (p * 100);
        if (seized > collateral[user]) {
            seized = collateral[user]; // 抵押品不足：按实际抵押品反算应还金额
            repayAmt = _ceilDiv(seized * p * 100, 1e8 * LIQ_BONUS_PCT);
        }
        uint256 shares = repayAmt * RAY / borrowIndex;
        if (shares > debtShares[user]) shares = debtShares[user];
        require(shares > 0, "zero repay");

        collateral[user] -= seized;
        debtShares[user] -= shares;
        totalDebtShares -= shares;
        _pullUSD(msg.sender, repayAmt); // ✅ 修复 F-06
        _sendETH(msg.sender, seized); // ✅ 修复 F-07：用 call，兼容合约钱包
    }

    function _ceilDiv(uint256 a, uint256 b) private pure returns (uint256) {
        return a == 0 ? 0 : (a - 1) / b + 1;
    }

    function _ceilMul(uint256 shares, uint256 index) private pure returns (uint256) {
        return _ceilDiv(shares * index, RAY);
    }

    function _sendETH(address to, uint256 amt) private {
        (bool ok, ) = to.call{value: amt}("");
        require(ok, "send");
    }

    function _pushUSD(address to, uint256 amt) private {
        _checkedCall(abi.encodeCall(IUSD.transfer, (to, amt)));
    }

    function _pullUSD(address from, uint256 amt) private {
        _checkedCall(abi.encodeCall(IUSD.transferFrom, (from, address(this), amt)));
    }

    /// @dev ✅ 修复 F-06：拒绝无代码地址；有返回值时必须为 true
    function _checkedCall(bytes memory data) private {
        require(address(usd).code.length > 0, "usd no code");
        (bool ok, bytes memory ret) = address(usd).call(data);
        require(ok && (ret.length == 0 || abi.decode(ret, (bool))), "usd transfer failed");
    }
}
