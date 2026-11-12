// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title LuckyPotFixed
/// @notice Remediated LuckyPot. The commit-reveal seed is a teaching stand-in for a verifiable
///         randomness service: the operator can still refuse to reveal, which cancels the round.
contract LuckyPotFixed {
    enum Status {
        None,
        Open,
        Cancelled,
        Settled
    }

    struct Round {
        uint64 closesAt;
        Status status;
        bytes32 seedCommit;
        uint256 pot;
        uint256 ticketsSold;
        address winner;
    }

    struct Entry {
        address player;
        uint256 endTicket; // ✅ fix LP-06: cumulative end allows binary search
    }

    uint256 public constant BPS = 10_000;
    uint256 public constant MAX_FEE_BPS = 1_500;
    uint256 public constant EARLY_BIRD_SLOTS = 3;
    uint256 public constant EARLY_BIRD_BPS = 100;
    uint256 public constant CANCEL_GRACE = 1 days;

    address public owner;
    address public pendingOwner;
    uint256 public ticketPrice;
    uint256 public feeBps;
    uint256 public minTickets;
    uint256 public roundDuration;
    uint256 public accruedFees;
    uint256 public currentRoundId;

    mapping(uint256 => Round) public rounds;
    mapping(uint256 => Entry[]) private entriesOf;
    mapping(uint256 => mapping(address => uint256)) public paidBy; // ✅ fix LP-05: the exact amount to return
    mapping(uint256 => address[]) private earlyBirds;
    mapping(uint256 => mapping(address => bool)) public isEarlyBird;
    mapping(address => uint256) public pendingPrize;

    event RoundOpened(uint256 indexed roundId, uint64 closesAt, bytes32 seedCommit);
    event TicketsBought(uint256 indexed roundId, address indexed player, uint256 quantity, uint256 cost);
    event RoundSettled(uint256 indexed roundId, address indexed winner, uint256 prize);
    event RoundCancelled(uint256 indexed roundId);
    event Refunded(uint256 indexed roundId, address indexed player, uint256 amount);
    event PrizeClaimed(address indexed player, uint256 amount);
    event ConfigChanged(uint256 ticketPrice, uint256 feeBps, uint256 minTickets, uint256 roundDuration);
    event OwnershipTransferStarted(address indexed next); // ✅ fix LP-07

    error NotOwner();
    error NotPendingOwner();
    error BadConfig();
    error RoundStillActive();
    error RoundNotOpen();
    error SalesClosed();
    error SalesNotClosed();
    error WrongPayment();
    error ZeroQuantity();
    error NotEnoughTickets();
    error BadSeed();
    error CannotCancelYet();
    error RoundNotCancelled();
    error NothingToClaim();
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(uint256 price, uint256 fee, uint256 minimum, uint256 duration) {
        owner = msg.sender;
        _setConfig(price, fee, minimum, duration);
    }

    function setConfig(uint256 price, uint256 fee, uint256 minimum, uint256 duration) external onlyOwner {
        if (rounds[currentRoundId].status == Status.Open) revert RoundStillActive();
        _setConfig(price, fee, minimum, duration);
    }

    function openRound(bytes32 seedCommit) external onlyOwner returns (uint256 roundId) {
        if (rounds[currentRoundId].status == Status.Open) revert RoundStillActive();
        roundId = ++currentRoundId;
        uint64 closesAt = uint64(block.timestamp + roundDuration);
        rounds[roundId].closesAt = closesAt;
        rounds[roundId].status = Status.Open;
        rounds[roundId].seedCommit = seedCommit;
        emit RoundOpened(roundId, closesAt, seedCommit);
    }

    function withdrawFees(address to) external onlyOwner {
        uint256 amount = accruedFees;
        if (amount == 0) revert NothingToClaim();
        accruedFees = 0;
        _send(to, amount);
    }

    function transferOwnership(address next) external onlyOwner {
        pendingOwner = next;
        emit OwnershipTransferStarted(next);
    }

    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert NotPendingOwner();
        owner = pendingOwner;
        pendingOwner = address(0);
    }

    function buyTickets(uint256 quantity) external payable {
        uint256 roundId = currentRoundId;
        Round storage round = rounds[roundId];
        if (round.status != Status.Open) revert RoundNotOpen();
        if (block.timestamp >= round.closesAt) revert SalesClosed();
        if (quantity == 0) revert ZeroQuantity();

        uint256 cost = quote(quantity); // ✅ fix LP-02: no narrowing cast
        if (msg.value != cost) revert WrongPayment();

        // ✅ fix LP-05: the pot holds the gross amount; the fee is taken only when the round settles
        round.pot += cost;
        round.ticketsSold += quantity;
        paidBy[roundId][msg.sender] += cost;
        entriesOf[roundId].push(Entry({player: msg.sender, endTicket: round.ticketsSold}));

        if (earlyBirds[roundId].length < EARLY_BIRD_SLOTS && !isEarlyBird[roundId][msg.sender]) {
            isEarlyBird[roundId][msg.sender] = true;
            earlyBirds[roundId].push(msg.sender);
        }
        emit TicketsBought(roundId, msg.sender, quantity, cost);
    }

    /// @notice Settles the round with the seed that the owner committed before sales opened.
    function draw(bytes32 seed) external {
        uint256 roundId = currentRoundId;
        Round storage round = rounds[roundId];
        if (round.status != Status.Open) revert RoundNotOpen();
        if (block.timestamp < round.closesAt) revert SalesNotClosed();
        if (round.ticketsSold < minTickets) revert NotEnoughTickets();
        if (keccak256(abi.encode(seed)) != round.seedCommit) revert BadSeed(); // ✅ fix LP-03

        round.status = Status.Settled;
        uint256 ticket = uint256(keccak256(abi.encode(seed, roundId, round.ticketsSold))) % round.ticketsSold;
        address winner = _ownerOfTicket(roundId, ticket);
        round.winner = winner;

        uint256 fee = (round.pot * feeBps) / BPS;
        accruedFees += fee;
        uint256 pool = round.pot - fee;
        uint256 bonus = (pool * EARLY_BIRD_BPS) / BPS;
        address[] memory birds = earlyBirds[roundId];
        for (uint256 i = 0; i < birds.length; i++) {
            pendingPrize[birds[i]] += bonus; // ✅ fix LP-04: credit, do not push
        }
        uint256 prize = pool - bonus * birds.length;
        pendingPrize[winner] += prize;
        emit RoundSettled(roundId, winner, prize);
    }

    function claimPrize() external {
        uint256 amount = pendingPrize[msg.sender];
        if (amount == 0) revert NothingToClaim();
        pendingPrize[msg.sender] = 0;
        _send(msg.sender, amount);
        emit PrizeClaimed(msg.sender, amount);
    }

    function cancelRound() external {
        uint256 roundId = currentRoundId;
        Round storage round = rounds[roundId];
        if (round.status != Status.Open) revert RoundNotOpen();

        bool ownerDuringSales = msg.sender == owner && block.timestamp < round.closesAt;
        // ✅ fix LP-03: a seed that is never revealed cannot lock the pot
        bool expired = block.timestamp >= round.closesAt + CANCEL_GRACE;
        if (!ownerDuringSales && !expired) revert CannotCancelYet();

        round.status = Status.Cancelled;
        emit RoundCancelled(roundId);
    }

    function claimRefund(uint256 roundId) external {
        if (rounds[roundId].status != Status.Cancelled) revert RoundNotCancelled();
        uint256 amount = paidBy[roundId][msg.sender];
        if (amount == 0) revert NothingToClaim();

        paidBy[roundId][msg.sender] = 0; // ✅ fix LP-01: effects before interaction
        rounds[roundId].pot -= amount;
        _send(msg.sender, amount);
        emit Refunded(roundId, msg.sender, amount);
    }

    function quote(uint256 quantity) public view returns (uint256) {
        return quantity * ticketPrice;
    }

    function entryCount(uint256 roundId) external view returns (uint256) {
        return entriesOf[roundId].length;
    }

    function _ownerOfTicket(uint256 roundId, uint256 ticket) internal view returns (address) {
        Entry[] storage entries = entriesOf[roundId];
        uint256 low;
        uint256 high = entries.length - 1;
        while (low < high) {
            uint256 mid = (low + high) / 2;
            if (ticket < entries[mid].endTicket) high = mid;
            else low = mid + 1;
        }
        return entries[low].player;
    }

    function _setConfig(uint256 price, uint256 fee, uint256 minimum, uint256 duration) internal {
        if (price == 0 || fee > MAX_FEE_BPS || minimum == 0 || duration == 0) revert BadConfig();
        ticketPrice = price;
        feeBps = fee;
        minTickets = minimum;
        roundDuration = duration;
        emit ConfigChanged(price, fee, minimum, duration);
    }

    function _send(address to, uint256 amount) internal {
        (bool ok, ) = to.call{value: amount}("");
        if (!ok) revert TransferFailed();
    }
}
