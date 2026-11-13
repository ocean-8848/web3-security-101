// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20, ICredit} from "./Interfaces.sol";
import {StrategyManager} from "./StrategyManager.sol";

/// @title GuardVault
/// @notice ERC-4626 style yield vault. The share token lives in this contract.
contract GuardVault {
    string public constant name = "Guard Vault Share";

    IERC20 public immutable asset;
    StrategyManager public immutable manager;
    ICredit public credit;
    address public immutable deployer;

    uint256 public idle;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    uint256 private entered;

    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event Transfer(address indexed from, address indexed to, uint256 amount);

    modifier nonReentrant() {
        require(entered == 0, "reentrant");
        entered = 1;
        _;
        entered = 0;
    }

    constructor(IERC20 asset_, StrategyManager manager_) {
        asset = asset_;
        manager = manager_;
        deployer = msg.sender;
    }

    function setCredit(ICredit credit_) external {
        require(msg.sender == deployer && address(credit) == address(0), "denied");
        credit = credit_;
    }

    // --- views ---

    function totalAssets() public view returns (uint256) {
        return idle + manager.deployedAssets();
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        return totalSupply == 0 ? assets : (assets * totalSupply) / totalAssets();
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        return totalSupply == 0 ? shares : (shares * totalAssets()) / totalSupply;
    }

    function previewDeposit(uint256 assets) public view returns (uint256) {
        return convertToShares(assets);
    }

    function previewMint(uint256 shares) public view returns (uint256) {
        return convertToAssets(shares);
    }

    function previewWithdraw(uint256 assets) public view returns (uint256) {
        return convertToShares(assets);
    }

    function previewRedeem(uint256 shares) public view returns (uint256) {
        return convertToAssets(shares);
    }

    // --- user actions ---

    function deposit(uint256 assets, address receiver) external nonReentrant returns (uint256 shares) {
        shares = previewDeposit(assets);
        require(shares > 0, "zero shares");
        _enter(assets, shares, receiver);
    }

    function mint(uint256 shares, address receiver) external nonReentrant returns (uint256 assets) {
        assets = previewMint(shares);
        _enter(assets, shares, receiver);
    }

    function withdraw(uint256 assets, address receiver, address owner) external nonReentrant returns (uint256 shares) {
        shares = previewWithdraw(assets);
        _exit(assets, shares, receiver, owner);
    }

    function redeem(uint256 shares, address receiver, address owner) external nonReentrant returns (uint256 assets) {
        assets = previewRedeem(shares);
        _exit(assets, shares, receiver, owner);
    }

    function transfer(address to, uint256 shares) external returns (bool) {
        require(address(credit) == address(0) || credit.debtOf(msg.sender) == 0, "has debt");
        balanceOf[msg.sender] -= shares;
        balanceOf[to] += shares;
        emit Transfer(msg.sender, to, shares);
        return true;
    }

    // --- manager ---

    function pushToStrategy(address strategy, uint256 amount) external {
        require(msg.sender == address(manager), "not manager");
        idle -= amount;
        require(asset.transfer(strategy, amount), "transfer failed");
    }

    function receiveFromStrategy(uint256 amount) external {
        require(manager.approved(msg.sender), "not strategy");
        idle += amount;
    }

    // --- internal ---

    function _enter(uint256 assets, uint256 shares, address receiver) internal {
        idle += assets;
        totalSupply += shares;
        balanceOf[receiver] += shares;
        require(asset.transferFrom(msg.sender, address(this), assets), "transfer failed");
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    function _exit(uint256 assets, uint256 shares, address receiver, address owner) internal {
        require(msg.sender == owner, "not owner");
        require(address(credit) == address(0) || credit.debtOf(owner) == 0, "has debt");

        if (assets > idle) manager.recall(assets - idle);
        idle -= assets;
        require(asset.transfer(receiver, assets), "transfer failed");

        balanceOf[owner] -= shares;
        totalSupply -= shares;
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }
}
