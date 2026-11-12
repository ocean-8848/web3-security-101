// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IStrategy} from "./Interfaces.sol";
import {GuardVault} from "./GuardVault.sol";

/// @title StrategyManager
/// @notice Holds protocol roles and moves vault funds into approved strategies.
contract StrategyManager {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant STRATEGIST_ROLE = keccak256("STRATEGIST");
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER");

    GuardVault public vault;
    mapping(bytes32 => mapping(address => bool)) public hasRole;
    mapping(bytes32 => bytes32) public roleAdmin;
    mapping(address => bool) public approved;
    IStrategy[] public strategies;

    event RoleGranted(bytes32 indexed role, address indexed account);
    event StrategyAdded(address indexed strategy);
    event Allocated(address indexed strategy, uint256 amount);

    modifier onlyRole(bytes32 role) {
        require(hasRole[role][msg.sender], "missing role");
        _;
    }

    constructor(address admin) {
        hasRole[ADMIN_ROLE][admin] = true;
        roleAdmin[ADMIN_ROLE] = ADMIN_ROLE;
        roleAdmin[KEEPER_ROLE] = ADMIN_ROLE;
        roleAdmin[STRATEGIST_ROLE] = KEEPER_ROLE;
    }

    function setVault(GuardVault vault_) external onlyRole(ADMIN_ROLE) {
        require(address(vault) == address(0), "already set");
        vault = vault_;
    }

    function grantRole(bytes32 role, address account) external onlyRole(roleAdmin[role]) {
        hasRole[role][account] = true;
        emit RoleGranted(role, account);
    }

    function addStrategy(IStrategy strategy) external {
        require(hasRole[STRATEGIST_ROLE][msg.sender] || hasRole[ADMIN_ROLE][msg.sender], "missing role");
        approved[address(strategy)] = true;
        strategies.push(strategy);
        emit StrategyAdded(address(strategy));
    }

    function allocate(IStrategy strategy, uint256 amount) external {
        require(hasRole[STRATEGIST_ROLE][msg.sender] || hasRole[ADMIN_ROLE][msg.sender], "missing role");
        require(approved[address(strategy)], "not approved");
        vault.pushToStrategy(address(strategy), amount);
        strategy.deployFunds(amount);
        emit Allocated(address(strategy), amount);
    }

    function harvest(IStrategy strategy) external onlyRole(KEEPER_ROLE) returns (uint256) {
        require(approved[address(strategy)], "not approved");
        return strategy.harvest();
    }

    function strategyCount() external view returns (uint256) {
        return strategies.length;
    }

    function deployedAssets() external view returns (uint256 total) {
        for (uint256 i = 0; i < strategies.length; i++) {
            total += strategies[i].totalAssets();
        }
    }

    function recall(uint256 amount) external {
        require(msg.sender == address(vault), "not vault");
        uint256 remaining = amount;
        for (uint256 i = 0; i < strategies.length && remaining > 0; i++) {
            uint256 held = strategies[i].totalAssets();
            uint256 take = held < remaining ? held : remaining;
            if (take > 0) {
                strategies[i].freeFunds(take);
                remaining -= take;
            }
        }
        require(remaining == 0, "insufficient liquidity");
    }
}
