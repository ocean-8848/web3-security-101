// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20, IStrategy} from "./Interfaces.sol";
import {GuardVault} from "./GuardVault.sol";
import {MiniSwap} from "./MiniSwap.sol";

/// @title YieldStrategy
/// @notice Holds vault funds. Sells reward tokens for the vault asset on harvest.
contract YieldStrategy is IStrategy {
    IERC20 public immutable asset;
    IERC20 public immutable reward;
    GuardVault public immutable vault;
    address public immutable manager;
    MiniSwap public immutable swapPool;
    uint256 public deployed;

    constructor(IERC20 asset_, IERC20 reward_, GuardVault vault_, address manager_, MiniSwap pool_) {
        asset = asset_;
        reward = reward_;
        vault = vault_;
        manager = manager_;
        swapPool = pool_;
    }

    modifier onlyManager() {
        require(msg.sender == manager, "not manager");
        _;
    }

    function totalAssets() external view returns (uint256) {
        return deployed;
    }

    function deployFunds(uint256 amount) external onlyManager {
        deployed += amount;
    }

    function freeFunds(uint256 amount) external onlyManager {
        deployed -= amount;
        vault.receiveFromStrategy(amount);
        require(asset.transfer(address(vault), amount), "transfer failed");
    }

    function harvest() external onlyManager returns (uint256 gained) {
        uint256 amount = reward.balanceOf(address(this));
        reward.approve(address(swapPool), amount);
        gained = swapPool.swap(address(reward), amount, 0, block.timestamp);
        deployed += gained;
    }
}
