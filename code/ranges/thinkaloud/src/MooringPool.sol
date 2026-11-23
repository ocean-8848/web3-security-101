// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20Lite {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @title MooringPool
/// @notice Stake one token, earn a second token over time. Stakers leave through a
/// seven-day cooldown, or leave at once and pay a penalty to the remaining stakers.
contract MooringPool {
    struct Berth {
        uint256 staked;
        uint256 rewardDebt;
        uint256 penaltyDebt;
        uint256 rewardCredit;
        uint256 penaltyCredit;
        uint256 exitAmount;
        uint64 exitReadyAt;
    }

    uint256 private constant ACC = 1e18;
    uint256 public constant COOLDOWN = 7 days;
    uint256 public constant PENALTY_BPS = 1_000;
    uint256 public constant REWARD_PERIOD = 30 days;

    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");
    bytes32 private constant EXIT_TYPEHASH =
        keccak256("CompleteExit(address owner,uint256 nonce,uint256 deadline)");

    IERC20Lite public immutable stakeToken;
    IERC20Lite public immutable rewardToken;

    address public owner;
    address public pendingOwner;
    bool public paused;
    uint256 private lock = 1;

    uint256 public totalStaked;
    uint256 public accRewardPerShare;
    uint256 public accPenaltyPerShare;
    uint256 public rewardRate;
    uint256 public periodEnd;
    uint256 public lastUpdate;

    mapping(address => Berth) public berths;
    mapping(address => uint256) public nonces;

    event Staked(address indexed user, uint256 amount);
    event ExitRequested(address indexed user, uint256 amount, uint64 readyAt);
    event ExitCompleted(address indexed user, address indexed receiver, uint256 amount);
    event InstantExit(address indexed user, uint256 amount, uint256 penalty);
    event PositionMoved(address indexed from, address indexed to, uint256 amount);
    event Claimed(address indexed user, uint256 reward, uint256 penaltyShare);
    event RewardAdded(uint256 amount, uint256 rate, uint256 periodEnd);

    modifier nonReentrant() {
        require(lock == 1, "locked");
        lock = 2;
        _;
        lock = 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier whenActive() {
        require(!paused, "paused");
        _;
    }

    constructor(IERC20Lite stakeToken_, IERC20Lite rewardToken_, address owner_) {
        require(address(stakeToken_) != address(rewardToken_), "same token");
        require(owner_ != address(0), "zero owner");
        stakeToken = stakeToken_;
        rewardToken = rewardToken_;
        owner = owner_;
    }

    function domainSeparator() public view returns (bytes32) {
        return keccak256(abi.encode(DOMAIN_TYPEHASH, keccak256("MooringPool"), block.chainid, address(this)));
    }

    function lastApplicable() public view returns (uint256) {
        return block.timestamp < periodEnd ? block.timestamp : periodEnd;
    }

    function _accrue() internal {
        uint256 until = lastApplicable();
        if (totalStaked > 0 && until > lastUpdate) {
            accRewardPerShare += ((until - lastUpdate) * rewardRate * ACC) / totalStaked;
        }
        lastUpdate = until;
    }

    function _settle(address user) internal {
        Berth storage b = berths[user];
        b.rewardCredit += (b.staked * accRewardPerShare) / ACC - b.rewardDebt;
        b.penaltyCredit += (b.staked * accPenaltyPerShare) / ACC - b.penaltyDebt;
    }

    function _sync(address user) internal {
        Berth storage b = berths[user];
        b.rewardDebt = (b.staked * accRewardPerShare) / ACC;
        b.penaltyDebt = (b.staked * accPenaltyPerShare) / ACC;
    }

    function stake(uint256 amount) external nonReentrant whenActive {
        require(amount > 0, "zero amount");
        _accrue();
        _settle(msg.sender);
        berths[msg.sender].staked += amount;
        totalStaked += amount;
        _sync(msg.sender);
        require(stakeToken.transferFrom(msg.sender, address(this), amount), "transfer failed");
        emit Staked(msg.sender, amount);
    }

    function requestExit(uint256 amount) external nonReentrant {
        Berth storage b = berths[msg.sender];
        require(amount > 0 && amount <= b.staked, "bad amount");
        _accrue();
        _settle(msg.sender);
        b.staked -= amount;
        totalStaked -= amount;
        b.exitAmount += amount;
        if (b.exitReadyAt == 0) {
            b.exitReadyAt = uint64(block.timestamp + COOLDOWN);
        }
        _sync(msg.sender);
        emit ExitRequested(msg.sender, amount, b.exitReadyAt);
    }

    function cancelExit() external nonReentrant whenActive {
        Berth storage b = berths[msg.sender];
        uint256 amount = b.exitAmount;
        require(amount > 0, "no exit");
        _accrue();
        _settle(msg.sender);
        b.exitAmount = 0;
        b.exitReadyAt = 0;
        b.staked += amount;
        totalStaked += amount;
        _sync(msg.sender);
    }

    function completeExit() external nonReentrant {
        _completeExit(msg.sender, msg.sender);
    }

    function completeExitBySig(address user, address receiver, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        external
        nonReentrant
    {
        require(block.timestamp <= deadline, "expired");
        bytes32 structHash = keccak256(abi.encode(EXIT_TYPEHASH, user, nonces[user]++, deadline));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator(), structHash));
        address signer = ecrecover(digest, v, r, s);
        require(signer != address(0) && signer == user, "bad signature");
        _completeExit(user, receiver);
    }

    function _completeExit(address user, address receiver) internal {
        Berth storage b = berths[user];
        uint256 amount = b.exitAmount;
        require(amount > 0, "no exit");
        require(block.timestamp >= b.exitReadyAt, "cooling down");
        b.exitAmount = 0;
        b.exitReadyAt = 0;
        require(stakeToken.transfer(receiver, amount), "transfer failed");
        emit ExitCompleted(user, receiver, amount);
    }

    function instantExit(uint256 amount) external nonReentrant {
        Berth storage b = berths[msg.sender];
        require(amount > 0 && amount <= b.staked, "bad amount");
        _accrue();
        _settle(msg.sender);
        b.staked -= amount;
        totalStaked -= amount;
        uint256 penalty = (amount * PENALTY_BPS) / 10_000;
        accPenaltyPerShare += (penalty * ACC) / totalStaked;
        _sync(msg.sender);
        require(stakeToken.transfer(msg.sender, amount - penalty), "transfer failed");
        emit InstantExit(msg.sender, amount, penalty);
    }

    function movePosition(address to, uint256 amount) external nonReentrant whenActive {
        Berth storage from = berths[msg.sender];
        require(to != address(0) && to != msg.sender, "bad receiver");
        require(amount > 0 && amount <= from.staked, "bad amount");
        _accrue();
        _settle(msg.sender);
        from.staked -= amount;
        berths[to].staked += amount;
        _sync(msg.sender);
        emit PositionMoved(msg.sender, to, amount);
    }

    function claim() external nonReentrant {
        _accrue();
        _settle(msg.sender);
        _sync(msg.sender);
        Berth storage b = berths[msg.sender];
        uint256 reward = b.rewardCredit;
        uint256 share = b.penaltyCredit;
        b.rewardCredit = 0;
        b.penaltyCredit = 0;
        if (reward > 0) require(rewardToken.transfer(msg.sender, reward), "transfer failed");
        if (share > 0) require(stakeToken.transfer(msg.sender, share), "transfer failed");
        emit Claimed(msg.sender, reward, share);
    }

    /// @notice Anyone may sponsor the reward stream.
    function notifyReward(uint256 amount) external nonReentrant whenActive {
        require(amount > 0, "zero amount");
        _accrue();
        uint256 leftover = block.timestamp < periodEnd ? (periodEnd - block.timestamp) * rewardRate : 0;
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "transfer failed");
        rewardRate = (amount + leftover) / REWARD_PERIOD;
        periodEnd = block.timestamp + REWARD_PERIOD;
        lastUpdate = block.timestamp;
        emit RewardAdded(amount, rewardRate, periodEnd);
    }

    function setPaused(bool value) external onlyOwner {
        paused = value;
    }

    function rescue(IERC20Lite token, address to, uint256 amount) external onlyOwner {
        require(address(token) != address(stakeToken) && address(token) != address(rewardToken), "protected");
        require(token.transfer(to, amount), "transfer failed");
    }

    function proposeOwner(address next) external onlyOwner {
        pendingOwner = next;
    }

    function acceptOwner() external {
        require(msg.sender == pendingOwner, "not pending");
        owner = pendingOwner;
        pendingOwner = address(0);
    }
}
