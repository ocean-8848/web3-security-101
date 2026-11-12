// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20, IPriceSource} from "./Interfaces.sol";

/// @title SpotPool
/// @notice Constant-product pool for the asset/collateral pair. It has no swap fee in this local range.
contract SpotPool is IPriceSource {
    IERC20 public immutable asset;
    IERC20 public immutable collateral;
    uint256 public reserveAsset;
    uint256 public reserveCollateral;

    constructor(IERC20 asset_, IERC20 collateral_) {
        asset = asset_;
        collateral = collateral_;
    }

    function addLiquidity(uint256 assetAmount, uint256 collateralAmount) external {
        reserveAsset += assetAmount;
        reserveCollateral += collateralAmount;
        require(asset.transferFrom(msg.sender, address(this), assetAmount), "transfer failed");
        require(collateral.transferFrom(msg.sender, address(this), collateralAmount), "transfer failed");
    }

    function price() external view returns (uint256) {
        return (reserveAsset * 1e18) / reserveCollateral;
    }

    function swapAssetForCollateral(uint256 amountIn) external returns (uint256 amountOut) {
        amountOut = reserveCollateral - (reserveAsset * reserveCollateral) / (reserveAsset + amountIn);
        reserveAsset += amountIn;
        reserveCollateral -= amountOut;
        require(asset.transferFrom(msg.sender, address(this), amountIn), "transfer failed");
        require(collateral.transfer(msg.sender, amountOut), "transfer failed");
    }

    function swapCollateralForAsset(uint256 amountIn) external returns (uint256 amountOut) {
        amountOut = reserveAsset - (reserveAsset * reserveCollateral) / (reserveCollateral + amountIn);
        reserveCollateral += amountIn;
        reserveAsset -= amountOut;
        require(collateral.transferFrom(msg.sender, address(this), amountIn), "transfer failed");
        require(asset.transfer(msg.sender, amountOut), "transfer failed");
    }
}
