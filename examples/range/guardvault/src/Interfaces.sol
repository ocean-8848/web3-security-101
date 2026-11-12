// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IStrategy {
    function totalAssets() external view returns (uint256);
    function deployFunds(uint256 amount) external;
    function freeFunds(uint256 amount) external;
    function harvest() external returns (uint256 gained);
}

interface ICredit {
    function debtOf(address user) external view returns (uint256);
}

interface ITokenReceiver {
    function onTokenReceived(address from, uint256 amount) external;
}
