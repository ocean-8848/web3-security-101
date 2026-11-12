// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title NoteBoxFixed
/// @notice Fixed NoteBox. The chain stores only ciphertext that the owner encrypts off-chain.
contract NoteBoxFixed {
    uint256 public constant EDIT_COOLDOWN = 24 hours; // ✅ fix NB-03: code now matches the docs
    uint256 public constant MIN_TIP = 0.001 ether;

    address public owner;
    uint256 public lastEdit;
    bytes public encryptedNote; // ✅ fix NB-02: ciphertext only; the name and visibility do not promise secrecy
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

    constructor(bytes memory initialCiphertext) {
        owner = msg.sender;
        encryptedNote = initialCiphertext;
    }

    function setSecret(bytes calldata newCiphertext) external onlyOwner { // ✅ fix NB-01
        if (block.timestamp < lastEdit + EDIT_COOLDOWN) revert TooSoon(lastEdit + EDIT_COOLDOWN);
        lastEdit = block.timestamp;
        encryptedNote = newCiphertext;
        emit SecretChanged(msg.sender, block.timestamp);
    }

    function setPublicNote(string calldata text) external onlyOwner {
        publicNote = text;
        emit PublicNoteChanged(text);
    }

    function tip() external payable {
        if (msg.value < MIN_TIP) revert TipTooSmall();
        tipsBy[msg.sender] += msg.value;
        totalTips += msg.value;
        emit Tipped(msg.sender, msg.value);
    }

    function withdrawTips() external onlyOwner {
        uint256 amount = address(this).balance;
        if (amount == 0) revert NothingToWithdraw();
        (bool ok, ) = owner.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit TipsWithdrawn(owner, amount);
    }
}
