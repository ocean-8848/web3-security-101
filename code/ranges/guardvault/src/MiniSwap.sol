// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "./Interfaces.sol";

/// @title MiniSwap
/// @notice Constant-product pool used by strategies to sell reward tokens.
contract MiniSwap {
    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;
    uint256 public reserveA;
    uint256 public reserveB;

    constructor(IERC20 a, IERC20 b) {
        tokenA = a;
        tokenB = b;
    }

    function addLiquidity(uint256 a, uint256 b) external {
        reserveA += a;
        reserveB += b;
        require(tokenA.transferFrom(msg.sender, address(this), a), "transfer failed");
        require(tokenB.transferFrom(msg.sender, address(this), b), "transfer failed");
    }

    function swap(address tokenIn, uint256 amountIn, uint256 minOut, uint256 deadline)
        external
        returns (uint256 amountOut)
    {
        require(block.timestamp <= deadline, "expired");
        bool aIn = tokenIn == address(tokenA);
        require(aIn || tokenIn == address(tokenB), "bad token");
        (uint256 rIn, uint256 rOut) = aIn ? (reserveA, reserveB) : (reserveB, reserveA);
        amountOut = rOut - (rIn * rOut) / (rIn + amountIn);
        require(amountOut >= minOut, "slippage");
        if (aIn) {
            reserveA += amountIn;
            reserveB -= amountOut;
            require(tokenA.transferFrom(msg.sender, address(this), amountIn), "transfer failed");
            require(tokenB.transfer(msg.sender, amountOut), "transfer failed");
        } else {
            reserveB += amountIn;
            reserveA -= amountOut;
            require(tokenB.transferFrom(msg.sender, address(this), amountIn), "transfer failed");
            require(tokenA.transfer(msg.sender, amountOut), "transfer failed");
        }
    }
}
