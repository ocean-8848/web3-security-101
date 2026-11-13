// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title NoteBox
/// @notice A personal on-chain notebook with one secret note and a tip jar.
/// @dev Local teaching target. Never deploy it to a public network.
contract NoteBox {
    /// @notice The owner can edit the secret note at most once every 24 hours.
    uint256 public constant EDIT_COOLDOWN = 1 hours;
    uint256 public constant MIN_TIP = 0.001 ether;

    address public owner;
    uint256 public lastEdit;
    string private secretNote;
    string public publicNote;
    uint256 public totalTips;
    mapping(address => uint256) public tipsBy;

    event SecretChanged(address indexed by, uint256 at);
    event PublicNoteChanged(string text);
    event Tipped(address indexed from, uint256 amount);
    event TipsWithdrawn(address indexed to, uint256 amount);

    error NotOwner();
    error TooSoon(uint256 nextEditAt);
    error TipTooSmall();
    error NothingToWithdraw();
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(string memory initialSecret) {
        owner = msg.sender;
        secretNote = initialSecret;
    }

    /// @notice Replaces the secret note. Only the owner can do this.
    function setSecret(string calldata newSecret) external {
        if (block.timestamp < lastEdit + EDIT_COOLDOWN) revert TooSoon(lastEdit + EDIT_COOLDOWN);
        lastEdit = block.timestamp;
        secretNote = newSecret;
        emit SecretChanged(msg.sender, block.timestamp);
    }

    /// @notice Returns the secret note. Only the owner can read it.
    function getSecret() external view onlyOwner returns (string memory) {
        return secretNote;
    }

    /// @notice Replaces the note that everybody can read.
    function setPublicNote(string calldata text) external onlyOwner {
        publicNote = text;
        emit PublicNoteChanged(text);
    }

    /// @notice Sends a tip to the notebook.
    function tip() external payable {
        if (msg.value < MIN_TIP) revert TipTooSmall();
        tipsBy[msg.sender] += msg.value;
        totalTips += msg.value;
        emit Tipped(msg.sender, msg.value);
    }

    /// @notice Sends all tips to the owner.
    function withdrawTips() external onlyOwner {
        uint256 amount = address(this).balance;
        if (amount == 0) revert NothingToWithdraw();
        (bool ok, ) = owner.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit TipsWithdrawn(owner, amount);
    }
}
