// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20, IStrategy, ICredit} from "../src/Interfaces.sol";
import {SimpleToken} from "../src/Tokens.sol";
import {MiniSwap} from "../src/MiniSwap.sol";

/// @notice GV-DFI-5: governance token with balance checkpoints.
contract GuardTokenFixed is SimpleToken {
    struct Checkpoint {
        uint256 blockNumber;
        uint256 balance;
    }

    mapping(address => Checkpoint[]) private checkpoints;

    constructor(string memory name_) SimpleToken(name_) {}

    function mintFixed(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        _write(to);
    }

    function _move(address from, address to, uint256 amount) internal override {
        super._move(from, to, amount);
        _write(from);
        _write(to);
    }

    function _write(address account) private {
        Checkpoint[] storage list = checkpoints[account];
        if (list.length > 0 && list[list.length - 1].blockNumber == block.number) {
            list[list.length - 1].balance = balanceOf[account];
        } else {
            list.push(Checkpoint(block.number, balanceOf[account]));
        }
    }

    function balanceAt(address account, uint256 blockNumber) external view returns (uint256) {
        Checkpoint[] storage list = checkpoints[account];
        for (uint256 i = list.length; i > 0; i--) {
            if (list[i - 1].blockNumber <= blockNumber) return list[i - 1].balance;
        }
        return 0;
    }
}

/// @notice GV-DFI-5: votes use a past snapshot; execution waits for a delay.
contract GuardGovernorFixed {
    uint256 public constant QUORUM_BPS = 3_000;
    uint256 public constant EXECUTION_DELAY = 3 days;

    struct Proposal {
        address[] targets;
        bytes[] payloads;
        uint256 snapshotBlock;
        uint256 executableAt;
        uint256 votes;
        bool executed;
    }

    GuardTokenFixed public immutable guard;
    Proposal[] private proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    constructor(GuardTokenFixed guard_) {
        guard = guard_;
    }

    function propose(address[] calldata targets, bytes[] calldata payloads) external returns (uint256 id) {
        require(targets.length == payloads.length && targets.length > 0, "bad proposal");
        id = proposals.length;
        proposals.push(Proposal(targets, payloads, block.number - 1, block.timestamp + EXECUTION_DELAY, 0, false));
    }

    function vote(uint256 id) external {
        Proposal storage p = proposals[id];
        require(block.timestamp < p.executableAt, "voting closed");
        require(!hasVoted[id][msg.sender], "already voted");
        hasVoted[id][msg.sender] = true;
        p.votes += guard.balanceAt(msg.sender, p.snapshotBlock);
    }

    function execute(uint256 id) external {
        Proposal storage p = proposals[id];
        require(!p.executed, "executed");
        require(block.timestamp >= p.executableAt, "delay active");
        require(p.votes * 10_000 >= guard.totalSupply() * QUORUM_BPS, "quorum not met");
        p.executed = true;
        for (uint256 i = 0; i < p.targets.length; i++) {
            (bool ok, ) = p.targets[i].call(p.payloads[i]);
            require(ok, "action failed");
        }
    }
}

interface IStrategyFixed is IStrategy {
    function harvestWithLimits(uint256 minOut, uint256 deadline) external returns (uint256);
}

contract StrategyManagerFixed {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant STRATEGIST_ROLE = keccak256("STRATEGIST");
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER");

    GuardVaultFixed public vault;
    mapping(bytes32 => mapping(address => bool)) public hasRole;
    mapping(bytes32 => bytes32) public roleAdmin;
    mapping(address => bool) public approved;
    IStrategyFixed[] public strategies;

    modifier onlyRole(bytes32 role) {
        require(hasRole[role][msg.sender], "missing role");
        _;
    }

    constructor(address admin) {
        hasRole[ADMIN_ROLE][admin] = true;
        roleAdmin[ADMIN_ROLE] = ADMIN_ROLE;
        roleAdmin[KEEPER_ROLE] = ADMIN_ROLE;
        roleAdmin[STRATEGIST_ROLE] = ADMIN_ROLE; // GV-ACC-7: only the admin grants strategist
    }

    function setVault(GuardVaultFixed vault_) external onlyRole(ADMIN_ROLE) {
        require(address(vault) == address(0), "already set");
        vault = vault_;
    }

    function grantRole(bytes32 role, address account) external onlyRole(roleAdmin[role]) {
        hasRole[role][account] = true;
    }

    function addStrategy(IStrategyFixed strategy) external onlyRole(ADMIN_ROLE) {
        approved[address(strategy)] = true;
        strategies.push(strategy);
    }

    function allocate(IStrategyFixed strategy, uint256 amount) external onlyRole(STRATEGIST_ROLE) {
        require(approved[address(strategy)], "not approved");
        vault.pushToStrategy(address(strategy), amount);
        strategy.deployFunds(amount);
    }

    /// GV-MEV-1 and GV-MEV-2: the keeper supplies an absolute deadline and a minimum output.
    function harvest(IStrategyFixed strategy, uint256 minOut, uint256 deadline)
        external
        onlyRole(KEEPER_ROLE)
        returns (uint256)
    {
        require(approved[address(strategy)], "not approved");
        return strategy.harvestWithLimits(minOut, deadline);
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

contract GuardVaultFixed {
    IERC20 public immutable asset;
    StrategyManagerFixed public immutable manager;
    ICredit public credit;
    address public immutable deployer;

    uint256 public idle;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    uint256 private entered;

    modifier nonReentrant() {
        require(entered == 0, "reentrant");
        entered = 1;
        _;
        entered = 0;
    }

    constructor(IERC20 asset_, StrategyManagerFixed manager_) {
        asset = asset_;
        manager = manager_;
        deployer = msg.sender;
    }

    function setCredit(ICredit credit_) external {
        require(msg.sender == deployer && address(credit) == address(0), "denied");
        credit = credit_;
    }

    /// GV-REN-3: lets other contracts refuse to act during a vault operation.
    function isLocked() external view returns (bool) {
        return entered == 1;
    }

    function totalAssets() public view returns (uint256) {
        return idle + manager.deployedAssets();
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        return totalSupply == 0 ? assets : (assets * totalSupply) / totalAssets();
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        return totalSupply == 0 ? shares : (shares * totalAssets()) / totalSupply;
    }

    function _divUp(uint256 a, uint256 b, uint256 c) private pure returns (uint256) {
        uint256 product = a * b;
        return product == 0 ? 0 : (product - 1) / c + 1;
    }

    function previewDeposit(uint256 assets) public view returns (uint256) {
        return convertToShares(assets);
    }

    /// GV-ARI-2: rounds up, in favor of the vault.
    function previewMint(uint256 shares) public view returns (uint256) {
        return totalSupply == 0 ? shares : _divUp(shares, totalAssets(), totalSupply);
    }

    /// GV-ARI-2: rounds up, in favor of the vault.
    function previewWithdraw(uint256 assets) public view returns (uint256) {
        return totalSupply == 0 ? assets : _divUp(assets, totalSupply, totalAssets());
    }

    function previewRedeem(uint256 shares) public view returns (uint256) {
        return convertToAssets(shares);
    }

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

    function transfer(address to, uint256 shares) external nonReentrant returns (bool) {
        require(address(credit) == address(0) || credit.debtOf(msg.sender) == 0, "has debt");
        balanceOf[msg.sender] -= shares;
        balanceOf[to] += shares;
        return true;
    }

    function pushToStrategy(address strategy, uint256 amount) external {
        require(msg.sender == address(manager), "not manager");
        idle -= amount;
        require(asset.transfer(strategy, amount), "transfer failed");
    }

    function receiveFromStrategy(uint256 amount) external {
        require(manager.approved(msg.sender), "not strategy");
        idle += amount;
    }

    function _enter(uint256 assets, uint256 shares, address receiver) internal {
        idle += assets;
        totalSupply += shares;
        balanceOf[receiver] += shares;
        require(asset.transferFrom(msg.sender, address(this), assets), "transfer failed");
    }

    function _exit(uint256 assets, uint256 shares, address receiver, address owner) internal {
        require(msg.sender == owner, "not owner");
        require(address(credit) == address(0) || credit.debtOf(owner) == 0, "has debt");

        // GV-REN-2: burn before the external transfer.
        balanceOf[owner] -= shares;
        totalSupply -= shares;

        if (assets > idle) manager.recall(assets - idle);
        idle -= assets;
        require(asset.transfer(receiver, assets), "transfer failed");
    }
}

contract GuardCreditFixed is ICredit {
    uint256 public constant LTV_BPS = 5_000;

    GuardVaultFixed public immutable vault;
    IERC20 public immutable asset;
    mapping(address => uint256) public debtOf;

    constructor(GuardVaultFixed vault_, IERC20 asset_) {
        vault = vault_;
        asset = asset_;
    }

    function maxBorrow(address user) public view returns (uint256) {
        return (vault.convertToAssets(vault.balanceOf(user)) * LTV_BPS) / 10_000;
    }

    function borrow(uint256 amount) external {
        require(!vault.isLocked(), "vault busy"); // GV-REN-3
        require(debtOf[msg.sender] + amount <= maxBorrow(msg.sender), "over limit");
        debtOf[msg.sender] += amount;
        require(asset.transfer(msg.sender, amount), "transfer failed");
    }

    function repay(uint256 amount) external {
        debtOf[msg.sender] -= amount;
        require(asset.transferFrom(msg.sender, address(this), amount), "transfer failed");
    }
}

contract YieldStrategyFixed is IStrategyFixed {
    IERC20 public immutable asset;
    IERC20 public immutable reward;
    GuardVaultFixed public immutable vault;
    address public immutable manager;
    MiniSwap public immutable swapPool;
    uint256 public deployed;

    constructor(IERC20 asset_, IERC20 reward_, GuardVaultFixed vault_, address manager_, MiniSwap pool_) {
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

    function harvest() external pure returns (uint256) {
        revert("use harvestWithLimits");
    }

    function harvestWithLimits(uint256 minOut, uint256 deadline) external onlyManager returns (uint256 gained) {
        uint256 amount = reward.balanceOf(address(this));
        reward.approve(address(swapPool), amount);
        gained = swapPool.swap(address(reward), amount, minOut, deadline);
        deployed += gained;
    }
}
