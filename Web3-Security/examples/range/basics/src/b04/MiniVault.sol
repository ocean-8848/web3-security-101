// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice 小金库：用户存入一种代币，之后取回自己的部分。
contract MiniVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    uint256 public totalDeposits;
    mapping(address => uint256) public balanceOf;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    error ZeroAmount();
    error InsufficientBalance(uint256 have, uint256 want);

    constructor(IERC20 _token) {
        token = _token;
    }

    function deposit(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        uint256 before = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = token.balanceOf(address(this)) - before; // 按实际到账记账
        balanceOf[msg.sender] += received;
        totalDeposits += received;
        emit Deposited(msg.sender, received);
    }

    function withdraw(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        uint256 have = balanceOf[msg.sender];
        if (have < amount) revert InsufficientBalance(have, amount);
        balanceOf[msg.sender] = have - amount; // 先记账
        totalDeposits -= amount;
        token.safeTransfer(msg.sender, amount); // 后转账
        emit Withdrawn(msg.sender, amount);
    }
}
