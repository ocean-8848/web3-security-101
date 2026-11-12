// SPDX-License-Identifier: MIT
// 配套章节：07 外部调用与代币兼容性 ｜ 靶场公用的玩具代币
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

/// @notice 行为规范的玩具 ERC20：失败时回滚，任何人可以铸造
contract ToyERC20 {
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amt) external {
        totalSupply += amt;
        balanceOf[to] += amt;
    }

    function approve(address spender, uint256 amt) external returns (bool) {
        allowance[msg.sender][spender] = amt;
        return true;
    }

    function transfer(address to, uint256 amt) external virtual returns (bool) {
        _move(msg.sender, to, amt);
        return true;
    }

    function transferFrom(address from, address to, uint256 amt) external virtual returns (bool) {
        _spend(from, amt);
        _move(from, to, amt);
        return true;
    }

    function _spend(address from, uint256 amt) internal {
        if (allowance[from][msg.sender] != type(uint256).max) allowance[from][msg.sender] -= amt;
    }

    function _move(address from, address to, uint256 amt) internal virtual {
        balanceOf[from] -= amt;
        balanceOf[to] += amt;
    }
}

/// @notice 失败时返回 false，不回滚
contract ReturnFalseToken is ToyERC20 {
    function transfer(address to, uint256 amt) external override returns (bool) {
        if (balanceOf[msg.sender] < amt) return false;
        _move(msg.sender, to, amt);
        return true;
    }

    function transferFrom(address from, address to, uint256 amt) external override returns (bool) {
        if (balanceOf[from] < amt || allowance[from][msg.sender] < amt) return false;
        _spend(from, amt);
        _move(from, to, amt);
        return true;
    }
}

/// @notice 转账时收取固定比例手续费
contract FeeOnTransferToken is ToyERC20 {
    uint256 public immutable feeBps;

    constructor(uint256 _feeBps) {
        feeBps = _feeBps;
    }

    function _move(address from, address to, uint256 amt) internal override {
        uint256 fee = amt * feeBps / 10_000;
        balanceOf[from] -= amt;
        balanceOf[to] += amt - fee;
        totalSupply -= fee;
    }
}

/// @notice 模拟 TRON USDT：转账成功，但 transfer 返回 false
contract TronStyleToken is ToyERC20 {
    function transfer(address to, uint256 amt) external override returns (bool) {
        _move(msg.sender, to, amt);
        return false;
    }
}

/// @notice 模拟以太坊 USDT：不返回任何值
contract NoReturnToken {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amt) external {
        balanceOf[to] += amt;
    }

    function approve(address spender, uint256 amt) external {
        allowance[msg.sender][spender] = amt;
    }

    function transfer(address to, uint256 amt) external {
        balanceOf[msg.sender] -= amt;
        balanceOf[to] += amt;
    }

    function transferFrom(address from, address to, uint256 amt) external {
        allowance[from][msg.sender] -= amt;
        balanceOf[from] -= amt;
        balanceOf[to] += amt;
    }
}
