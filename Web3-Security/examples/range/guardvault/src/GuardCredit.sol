// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20, ICredit} from "./Interfaces.sol";
import {GuardVault} from "./GuardVault.sol";

/// @title GuardCredit
/// @notice Credit line against vault shares. A user with debt cannot move or redeem shares.
contract GuardCredit is ICredit {
    uint256 public constant LTV_BPS = 5_000;

    GuardVault public immutable vault;
    IERC20 public immutable asset;
    mapping(address => uint256) public debtOf;

    constructor(GuardVault vault_, IERC20 asset_) {
        vault = vault_;
        asset = asset_;
    }

    function maxBorrow(address user) public view returns (uint256) {
        return (vault.convertToAssets(vault.balanceOf(user)) * LTV_BPS) / 10_000;
    }

    function borrow(uint256 amount) external {
        require(debtOf[msg.sender] + amount <= maxBorrow(msg.sender), "over limit");
        debtOf[msg.sender] += amount;
        require(asset.transfer(msg.sender, amount), "transfer failed");
    }

    function repay(uint256 amount) external {
        debtOf[msg.sender] -= amount;
        require(asset.transferFrom(msg.sender, address(this), amount), "transfer failed");
    }
}
