// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20, IFlashBorrower, IRewardsSink} from "../src/Interfaces.sol";

/// @notice Price feed interface with an update timestamp. A real deployment uses a decentralized feed.
interface IPriceFeed {
    function latest() external view returns (uint256 price, uint256 updatedAt);
}

/// @notice Fixed V1. Each change is tagged with the finding it closes.
contract FlashDeskFixed {
    bytes32 internal constant IMPLEMENTATION_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    uint256 internal constant BPS = 10_000;
    uint256 internal constant LTV_BPS = 7_000;
    uint256 public constant MAX_FEE_BPS = 100;          // FD-ACC-7: fee cap
    uint256 public constant UPGRADE_DELAY = 2 days;     // FD-ACC-7: upgrade timelock
    uint256 public constant MAX_PRICE_AGE = 1 hours;    // FD-ORA-1

    address public owner;
    bool public initialized;
    IERC20 public asset;
    IERC20 public collateral;
    IPriceFeed public oracle;
    IRewardsSink public rewards;
    uint256 public feeBps;
    uint256 public totalShares;
    uint256 public totalDeposits;
    mapping(address => uint256) public shares;
    mapping(address => uint256) public collateralOf;
    mapping(address => uint256) public debtOf;
    uint256 private lock;
    address public pendingImplementation;
    uint256 public upgradeReadyAt;

    event Deposited(address indexed user, uint256 amount, uint256 sharesMinted);
    event Withdrawn(address indexed user, uint256 amount, uint256 sharesBurned);
    event FlashLoan(address indexed receiver, uint256 amount, uint256 fee);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);
    // FD-EVT: every privileged change is visible to monitors.
    event FeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);
    event UpgradeProposed(address indexed implementation, uint256 readyAt);
    event Upgraded(address indexed implementation);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier nonReentrant() {
        require(lock == 0, "locked");
        lock = 1;
        _;
        lock = 0;
    }

    /// FD-UPG-3: the implementation can never be initialized directly.
    constructor() {
        initialized = true;
    }

    function initialize(
        address owner_,
        IERC20 asset_,
        IERC20 collateral_,
        IPriceFeed oracle_,
        IRewardsSink rewards_,
        uint256 feeBps_
    ) external {
        require(!initialized, "already initialized");
        require(feeBps_ <= MAX_FEE_BPS, "fee too high");
        initialized = true;
        owner = owner_;
        asset = asset_;
        collateral = collateral_;
        oracle = oracle_;
        rewards = rewards_;
        feeBps = feeBps_;
        // FD-EXT-1: no standing approval to the partner contract.
    }

    function setFeeBps(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= MAX_FEE_BPS, "fee too high");
        emit FeeUpdated(feeBps, newFeeBps);
        feeBps = newFeeBps;
    }

    function setOracle(IPriceFeed newOracle) external onlyOwner {
        emit OracleUpdated(address(oracle), address(newOracle));
        oracle = newOracle;
    }

    function proposeUpgrade(address newImplementation) external onlyOwner {
        require(newImplementation.code.length > 0, "no code");
        pendingImplementation = newImplementation;
        upgradeReadyAt = block.timestamp + UPGRADE_DELAY;
        emit UpgradeProposed(newImplementation, upgradeReadyAt);
    }

    function executeUpgrade() external onlyOwner {
        address impl = pendingImplementation;
        require(impl != address(0) && block.timestamp >= upgradeReadyAt, "not ready");
        pendingImplementation = address(0);
        assembly {
            sstore(IMPLEMENTATION_SLOT, impl)
        }
        emit Upgraded(impl);
    }

    function deposit(uint256 amount) external nonReentrant returns (uint256 minted) {
        minted = totalShares == 0 ? amount : (amount * totalShares) / totalDeposits;
        require(minted > 0, "zero shares");
        totalShares += minted;
        totalDeposits += amount;
        shares[msg.sender] += minted;
        require(asset.transferFrom(msg.sender, address(this), amount), "transfer failed");
        emit Deposited(msg.sender, amount, minted);
    }

    function withdraw(uint256 shareAmount) external nonReentrant returns (uint256 amount) {
        amount = (shareAmount * totalDeposits) / totalShares;
        shares[msg.sender] -= shareAmount;
        totalShares -= shareAmount;
        totalDeposits -= amount;
        require(asset.transfer(msg.sender, amount), "transfer failed");
        emit Withdrawn(msg.sender, amount, shareAmount);
    }

    function flashFee(uint256 amount) public view returns (uint256) {
        return (amount * feeBps) / BPS;
    }

    function flashLoan(IFlashBorrower receiver, uint256 amount, bytes calldata data) external nonReentrant {
        uint256 fee = flashFee(amount);
        require(asset.transfer(address(receiver), amount), "transfer failed");
        receiver.onFlashLoan(msg.sender, amount, fee, data);
        require(asset.transferFrom(address(receiver), address(this), amount + fee), "repay failed");

        uint256 partnerCut = fee / 5;
        totalDeposits += fee - partnerCut;
        if (partnerCut > 0) {
            // FD-EXT-1: the partner receives exactly its cut. It holds no allowance.
            require(asset.transfer(address(rewards), partnerCut), "transfer failed");
            rewards.notifyFee(partnerCut);
        }
        emit FlashLoan(address(receiver), amount, fee);
    }

    function depositCollateral(uint256 amount) external nonReentrant {
        collateralOf[msg.sender] += amount;
        require(collateral.transferFrom(msg.sender, address(this), amount), "transfer failed");
    }

    function maxBorrow(address user) public view returns (uint256) {
        (uint256 price, uint256 updatedAt) = oracle.latest();
        require(price > 0 && block.timestamp - updatedAt <= MAX_PRICE_AGE, "stale price"); // FD-ORA-1
        return (((collateralOf[user] * price) / 1e18) * LTV_BPS) / BPS;
    }

    /// FD-ORA-1: nonReentrant also blocks borrowing inside a flash-loan callback.
    function borrow(uint256 amount) external nonReentrant {
        require(debtOf[msg.sender] + amount <= maxBorrow(msg.sender), "over limit");
        debtOf[msg.sender] += amount;
        require(asset.transfer(msg.sender, amount), "transfer failed");
        emit Borrowed(msg.sender, amount);
    }

    function repay(uint256 amount) external nonReentrant {
        debtOf[msg.sender] -= amount;
        require(asset.transferFrom(msg.sender, address(this), amount), "transfer failed");
        emit Repaid(msg.sender, amount);
    }
}

/// @notice FD-UPG-2: V2 keeps every V1 slot and appends the new variable at the end.
contract FlashDeskV2Fixed is FlashDeskFixed {
    uint256 public maxFlashBps;

    function setMaxFlashBps(uint256 newMaxFlashBps) external onlyOwner {
        maxFlashBps = newMaxFlashBps;
    }
}

/// @notice FD-UPG-4: deployment and initialization happen in one transaction.
contract FlashDeskProxyFixed {
    bytes32 internal constant IMPLEMENTATION_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    constructor(address implementation, bytes memory initData) {
        assembly {
            sstore(IMPLEMENTATION_SLOT, implementation)
        }
        (bool ok, bytes memory err) = implementation.delegatecall(initData);
        if (!ok) {
            assembly {
                revert(add(err, 0x20), mload(err))
            }
        }
    }

    fallback() external payable {
        assembly {
            let impl := sload(IMPLEMENTATION_SLOT)
            calldatacopy(0, 0, calldatasize())
            let ok := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch ok
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}
