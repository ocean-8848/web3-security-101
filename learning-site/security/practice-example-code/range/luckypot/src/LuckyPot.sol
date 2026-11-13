// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title LuckyPot
/// @notice A ticket raffle that runs in rounds. Local teaching target only.
contract LuckyPot {
    enum Status {
        None,
        Open,
        Cancelled,
        Settled
    }

    struct Round {
        uint64 closesAt;
        Status status;
        uint256 pot;
        uint256 ticketsSold;
        address winner;
    }

    struct Entry {
        address player;
        uint256 tickets;
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
    mapping(uint256 => mapping(address => uint256)) public ticketsOf;
    mapping(uint256 => address[]) private earlyBirds;
    mapping(uint256 => mapping(address => bool)) public isEarlyBird;
    mapping(address => uint256) public pendingPrize;

    event RoundOpened(uint256 indexed roundId, uint64 closesAt);
    event TicketsBought(uint256 indexed roundId, address indexed player, uint256 quantity, uint256 cost);
    event RoundSettled(uint256 indexed roundId, address indexed winner, uint256 prize);
    event RoundCancelled(uint256 indexed roundId);
    event Refunded(uint256 indexed roundId, address indexed player, uint256 amount);
    event PrizeClaimed(address indexed player, uint256 amount);
    event ConfigChanged(uint256 ticketPrice, uint256 feeBps, uint256 minTickets, uint256 roundDuration);

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

    // ---------- owner ----------

    function setConfig(uint256 price, uint256 fee, uint256 minimum, uint256 duration) external onlyOwner {
        if (rounds[currentRoundId].status == Status.Open) revert RoundStillActive();
        _setConfig(price, fee, minimum, duration);
    }

    function openRound() external onlyOwner returns (uint256 roundId) {
        if (rounds[currentRoundId].status == Status.Open) revert RoundStillActive();
        roundId = ++currentRoundId;
        uint64 closesAt = uint64(block.timestamp + roundDuration);
        rounds[roundId].closesAt = closesAt;
        rounds[roundId].status = Status.Open;
        emit RoundOpened(roundId, closesAt);
    }

    function withdrawFees(address to) external onlyOwner {
        uint256 amount = accruedFees;
        if (amount == 0) revert NothingToClaim();
        accruedFees = 0;
        _send(to, amount);
    }

    function transferOwnership(address next) external onlyOwner {
        pendingOwner = next;
    }

    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert NotPendingOwner();
        owner = pendingOwner;
        pendingOwner = address(0);
    }

    // ---------- players ----------

    /// @notice Buys `quantity` tickets in the current round.
    function buyTickets(uint256 quantity) external payable {
        Round storage round = rounds[currentRoundId];
        if (round.status != Status.Open) revert RoundNotOpen();
        if (block.timestamp >= round.closesAt) revert SalesClosed();
        if (quantity == 0) revert ZeroQuantity();

        uint256 cost = quote(uint8(quantity));
        if (msg.value != cost) revert WrongPayment();

        uint256 fee = (cost * feeBps) / BPS;
        accruedFees += fee;
        round.pot += cost - fee;
        round.ticketsSold += quantity;
        ticketsOf[currentRoundId][msg.sender] += quantity;
        entriesOf[currentRoundId].push(Entry({player: msg.sender, tickets: quantity}));

        if (earlyBirds[currentRoundId].length < EARLY_BIRD_SLOTS && !isEarlyBird[currentRoundId][msg.sender]) {
            isEarlyBird[currentRoundId][msg.sender] = true;
            earlyBirds[currentRoundId].push(msg.sender);
        }
        emit TicketsBought(currentRoundId, msg.sender, quantity, cost);
    }

    /// @notice Draws the winner of the current round after sales close. Anyone can call it.
    function draw() external {
        uint256 roundId = currentRoundId;
        Round storage round = rounds[roundId];
        if (round.status != Status.Open) revert RoundNotOpen();
        if (block.timestamp < round.closesAt) revert SalesNotClosed();
        if (round.ticketsSold < minTickets) revert NotEnoughTickets();

        round.status = Status.Settled;
        uint256 ticket = uint256(
            keccak256(abi.encode(blockhash(block.number - 1), block.timestamp, roundId, round.ticketsSold))
        ) % round.ticketsSold;
        address winner = _ownerOfTicket(roundId, ticket);
        round.winner = winner;

        uint256 bonus = (round.pot * EARLY_BIRD_BPS) / BPS;
        address[] memory birds = earlyBirds[roundId];
        for (uint256 i = 0; i < birds.length; i++) {
            (bool ok, ) = birds[i].call{value: bonus}("");
            if (!ok) revert TransferFailed();
        }

        uint256 prize = round.pot - bonus * birds.length;
        pendingPrize[winner] += prize;
        emit RoundSettled(roundId, winner, prize);
    }

    /// @notice Withdraws the caller's prize.
    function claimPrize() external {
        uint256 amount = pendingPrize[msg.sender];
        if (amount == 0) revert NothingToClaim();
        pendingPrize[msg.sender] = 0;
        _send(msg.sender, amount);
        emit PrizeClaimed(msg.sender, amount);
    }

    /// @notice Cancels a round. The owner can cancel during sales.
    ///         Anyone can cancel after the grace period if too few tickets sold.
    function cancelRound() external {
        uint256 roundId = currentRoundId;
        Round storage round = rounds[roundId];
        if (round.status != Status.Open) revert RoundNotOpen();

        bool ownerDuringSales = msg.sender == owner && block.timestamp < round.closesAt;
        bool expired = block.timestamp >= round.closesAt + CANCEL_GRACE && round.ticketsSold < minTickets;
        if (!ownerDuringSales && !expired) revert CannotCancelYet();

        round.status = Status.Cancelled;
        emit RoundCancelled(roundId);
    }

    /// @notice Returns the full ticket price of the caller's tickets in a cancelled round.
    function claimRefund(uint256 roundId) external {
        if (rounds[roundId].status != Status.Cancelled) revert RoundNotCancelled();
        uint256 tickets = ticketsOf[roundId][msg.sender];
        if (tickets == 0) revert NothingToClaim();

        uint256 amount = tickets * ticketPrice;
        _send(msg.sender, amount);
        ticketsOf[roundId][msg.sender] = 0;
        emit Refunded(roundId, msg.sender, amount);
    }

    // ---------- views ----------

    function quote(uint8 quantity) public view returns (uint256) {
        return uint256(quantity) * ticketPrice;
    }

    function entryCount(uint256 roundId) external view returns (uint256) {
        return entriesOf[roundId].length;
    }

    function earlyBirdCount(uint256 roundId) external view returns (uint256) {
        return earlyBirds[roundId].length;
    }

    function chanceBps(uint256 roundId, address player) external view returns (uint256) {
        uint256 sold = rounds[roundId].ticketsSold;
        if (sold == 0) return 0;
        return (ticketsOf[roundId][player] * BPS) / sold;
    }

    // ---------- internal ----------

    function _ownerOfTicket(uint256 roundId, uint256 ticket) internal view returns (address) {
        uint256 cursor;
        for (uint256 i = 0; i < entriesOf[roundId].length; i++) {
            cursor += entriesOf[roundId][i].tickets;
            if (ticket < cursor) return entriesOf[roundId][i].player;
        }
        revert NotEnoughTickets();
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
