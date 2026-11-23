// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20, IPriceSource, IFlashBorrower, IRewardsSink} from "./Interfaces.sol";

/// @title FlashDesk
/// @notice Liquidity desk. Depositors earn flash-loan fees. Borrowers open credit lines against collateral.
/// @dev Deployed behind FlashDeskProxy. The upgrade function lives in this implementation.
contract FlashDesk {
    bytes32 internal constant IMPLEMENTATION_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    uint256 internal constant BPS = 10_000;
    uint256 internal constant LTV_BPS = 7_000;

    address public owner;
    bool public initialized;
    IERC20 public asset;
    IERC20 public collateral;
    IPriceSource public oracle;
    IRewardsSink public rewards;
    uint256 public feeBps;
    uint256 public totalShares;
    uint256 public totalDeposits;
    mapping(address => uint256) public shares;
    mapping(address => uint256) public collateralOf;
    mapping(address => uint256) public debtOf;
    uint256 private lock;

    event Deposited(address indexed user, uint256 amount, uint256 sharesMinted);
    event Withdrawn(address indexed user, uint256 amount, uint256 sharesBurned);
    event FlashLoan(address indexed receiver, uint256 amount, uint256 fee);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);

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

    function initialize(
        address owner_,
        IERC20 asset_,
        IERC20 collateral_,
        IPriceSource oracle_,
        IRewardsSink rewards_,
        uint256 feeBps_
    ) external {
        require(!initialized, "already initialized");
        initialized = true;
        owner = owner_;
        asset = asset_;
        collateral = collateral_;
        oracle = oracle_;
        rewards = rewards_;
        feeBps = feeBps_;
        asset_.approve(address(rewards_), type(uint256).max);
    }

    // --- admin ---

    function setFeeBps(uint256 newFeeBps) external onlyOwner {
        feeBps = newFeeBps;
    }

    function setOracle(IPriceSource newOracle) external onlyOwner {
        oracle = newOracle;
    }

    function upgradeTo(address newImplementation) external onlyOwner {
        require(newImplementation.code.length > 0, "no code");
        assembly {
            sstore(IMPLEMENTATION_SLOT, newImplementation)
        }
    }

    // --- liquidity ---

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

    // --- flash loans ---

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
        if (partnerCut > 0) rewards.notifyFee(partnerCut);
        emit FlashLoan(address(receiver), amount, fee);
    }

    // --- credit lines ---

    function depositCollateral(uint256 amount) external {
        collateralOf[msg.sender] += amount;
        require(collateral.transferFrom(msg.sender, address(this), amount), "transfer failed");
    }

    function maxBorrow(address user) public view returns (uint256) {
        uint256 value = (collateralOf[user] * oracle.price()) / 1e18;
        return (value * LTV_BPS) / BPS;
    }

    function borrow(uint256 amount) external {
        require(debtOf[msg.sender] + amount <= maxBorrow(msg.sender), "over limit");
        debtOf[msg.sender] += amount;
        require(asset.transfer(msg.sender, amount), "transfer failed");
        emit Borrowed(msg.sender, amount);
    }

    function repay(uint256 amount) external {
        debtOf[msg.sender] -= amount;
        require(asset.transferFrom(msg.sender, address(this), amount), "transfer failed");
        emit Repaid(msg.sender, amount);
    }
}
