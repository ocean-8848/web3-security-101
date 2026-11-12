// SPDX-License-Identifier: MIT
// 配套章节：audit/R25 实战项目 ｜ 审计靶场：本合约故意包含 8 个漏洞。
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

interface IUSD {
    function transfer(address to, uint256 amt) external returns (bool);
    function transferFrom(address from, address to, uint256 amt) external returns (bool);
}

interface IPriceFeed {
    function decimals() external view returns (uint8);
    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80);
}

/// @notice 用 ETH 作抵押借 USD。部署在 MiniLendProxy 后面。
contract MiniLend {
    bytes32 private constant IMPLEMENTATION_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    uint256 private constant RAY = 1e27;
    uint256 public constant LTV = 75; // 最大借款比例，百分比
    uint256 public constant LIQ_THRESHOLD = 80; // 清算阈值，百分比
    uint256 public constant RATE_PER_SECOND = 1585489599188229400; // 约 5% 年化，RAY 精度，示例

    IUSD public usd;
    IPriceFeed public feed;
    address public owner;
    uint256 public borrowIndex;
    uint256 public lastAccrual;
    uint256 public totalDebtShares;
    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debtShares;

    // ❌ 漏洞 F-01：没有初始化保护，任何人可以重复调用
    function initialize(address _usd, address _feed, address _owner) external {
        usd = IUSD(_usd);
        feed = IPriceFeed(_feed);
        owner = _owner;
        borrowIndex = RAY;
        lastAccrual = block.timestamp;
    }

    // ❌ 漏洞 F-02：没有权限检查，任何人可以替换实现合约
    function upgradeTo(address newImpl) external {
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

    // ❌ 漏洞 F-05：没有检查价格为正，也没有检查更新时间
    function price() public view returns (uint256) {
        (, int256 answer, , , ) = feed.latestRoundData();
        return uint256(answer);
    }

    function debtOf(address user) public view returns (uint256) {
        return debtShares[user] * borrowIndex / RAY;
    }

    function maxBorrow(address user) public view returns (uint256) {
        return collateral[user] * price() * LTV / 100 / 1e8;
    }

    function deposit() external payable {
        collateral[msg.sender] += msg.value;
    }

    function borrow(uint256 amt) external {
        accrue();
        require(debtOf(msg.sender) + amt <= maxBorrow(msg.sender), "LTV");
        // ❌ 漏洞 F-08：份额向下取整。小额借款可以铸造 0 份额债务
        uint256 shares = amt * RAY / borrowIndex;
        debtShares[msg.sender] += shares;
        totalDebtShares += shares;
        // ❌ 漏洞 F-06：没有检查 transfer 的返回值
        usd.transfer(msg.sender, amt);
    }

    function repay(uint256 amt) external {
        accrue();
        // ❌ 漏洞 F-06：没有检查 transferFrom 的返回值
        usd.transferFrom(msg.sender, address(this), amt);
        // ❌ 漏洞 F-08：烧毁份额时向上取整，用户少还
        uint256 shares = (amt * RAY + borrowIndex - 1) / borrowIndex;
        if (shares > debtShares[msg.sender]) shares = debtShares[msg.sender];
        debtShares[msg.sender] -= shares;
        totalDebtShares -= shares;
    }

    function withdraw(uint256 amt) external {
        accrue();
        require(collateral[msg.sender] >= amt, "balance");
        // ❌ 漏洞 F-04：取走抵押品后没有检查健康度
        uint256 remaining = collateral[msg.sender] - amt;
        // ❌ 漏洞 F-03：先转 ETH，后写入用调用前数值算出的余额
        (bool ok, ) = msg.sender.call{value: amt}("");
        require(ok, "send");
        collateral[msg.sender] = remaining;
    }

    function liquidate(address user) external {
        accrue();
        uint256 debt = debtOf(user);
        require(debt * 1e8 * 100 > collateral[user] * price() * LIQ_THRESHOLD, "healthy");
        // ❌ 漏洞 F-06：同样没有检查返回值
        usd.transferFrom(msg.sender, address(this), debt);
        // ❌ 漏洞 F-07：没有清算比例和奖励上限，清算人拿走全部抵押品
        uint256 seized = collateral[user];
        collateral[user] = 0;
        totalDebtShares -= debtShares[user];
        debtShares[user] = 0;
        payable(msg.sender).transfer(seized);
    }
}
