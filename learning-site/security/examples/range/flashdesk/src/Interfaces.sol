// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

/// @notice Returns the price of 1 collateral token, in asset tokens, scaled by 1e18.
interface IPriceSource {
    function price() external view returns (uint256);
}

interface IFlashBorrower {
    function onFlashLoan(address initiator, uint256 amount, uint256 fee, bytes calldata data) external;
}

/// @notice Rewards distributor maintained by a partner team. See README for scope.
interface IRewardsSink {
    function notifyFee(uint256 amount) external;
}
