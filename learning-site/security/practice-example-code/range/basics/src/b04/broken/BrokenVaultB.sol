// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice 破坏 B：按“请求金额”记账，而不是按“实际到账”记账。
contract BrokenVaultB {
    IERC20 public immutable token;
    mapping(address => uint256) public balanceOf;

    constructor(IERC20 _token) {
        token = _token;
    }

    function deposit(uint256 amount) external {
        token.transferFrom(msg.sender, address(this), amount);
        balanceOf[msg.sender] += amount; // ❌ 漏洞：转账收费时，到账金额小于 amount
    }

    function withdraw(uint256 amount) external {
        balanceOf[msg.sender] -= amount;
        token.transfer(msg.sender, amount);
    }
}
