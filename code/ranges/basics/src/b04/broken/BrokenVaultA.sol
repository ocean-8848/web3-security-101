// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice 破坏 A：把“取谁的钱”变成调用者可控的参数。
contract BrokenVaultA {
    IERC20 public immutable token;
    mapping(address => uint256) public balanceOf;

    constructor(IERC20 _token) {
        token = _token;
    }

    function deposit(uint256 amount) external {
        token.transferFrom(msg.sender, address(this), amount);
        balanceOf[msg.sender] += amount;
    }

    // ❌ 漏洞：from 由调用者传入，没有检查 from == msg.sender
    function withdraw(address from, uint256 amount) external {
        balanceOf[from] -= amount;
        token.transfer(msg.sender, amount);
    }
}
