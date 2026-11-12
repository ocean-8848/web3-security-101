// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice 破坏 C：先转账，后记账。
contract BrokenVaultC {
    IERC20 public immutable token;
    mapping(address => uint256) public balanceOf;

    constructor(IERC20 _token) {
        token = _token;
    }

    function deposit(uint256 amount) external {
        token.transferFrom(msg.sender, address(this), amount);
        balanceOf[msg.sender] += amount;
    }

    // ❌ 漏洞：转账带回调时，回调发生在余额清零之前
    function withdrawAll() external {
        uint256 amount = balanceOf[msg.sender];
        token.transfer(msg.sender, amount);
        balanceOf[msg.sender] = 0;
    }
}
