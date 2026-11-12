// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Club {
    struct Member {
        string nickname;
        uint256 paid;
        bool active;
    }

    address public immutable owner;
    uint256 public immutable fee;
    string public name = "Book Club";
    uint256 public memberCount;
    mapping(address => Member) public members;

    event Joined(address indexed who, string nickname, uint256 paid);
    event Renamed(string newName);
    event Withdrawn(address indexed to, uint256 amount);

    error AlreadyMember(address who);
    error NotOwner(address caller);
    error WrongFee(uint256 sent, uint256 expected);
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _;
    }

    constructor(uint256 _fee) {
        owner = msg.sender;
        fee = _fee;
    }

    function join(string calldata nickname) external payable {
        if (members[msg.sender].active) revert AlreadyMember(msg.sender);
        if (msg.value != fee) revert WrongFee(msg.value, fee);
        members[msg.sender] = Member(nickname, msg.value, true);
        memberCount = memberCount + 1;
        emit Joined(msg.sender, nickname, msg.value);
    }

    function rename(string calldata newName) external onlyOwner {
        name = newName;
        emit Renamed(newName);
    }

    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;
        emit Withdrawn(owner, amount);
        (bool ok, ) = owner.call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    function isMember(address who) external view returns (bool) {
        return members[who].active;
    }
}
