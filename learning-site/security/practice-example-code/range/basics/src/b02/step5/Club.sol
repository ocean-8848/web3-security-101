// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Club {
    struct Member {
        string nickname;
        uint256 paid;
        bool active;
    }

    string public name = "Book Club";
    uint256 public memberCount;
    mapping(address => Member) public members;

    event Joined(address indexed who, string nickname, uint256 paid);

    function join(string calldata nickname) external {
        require(!members[msg.sender].active, "already member");
        members[msg.sender] = Member(nickname, 0, true);
        memberCount = memberCount + 1;
        emit Joined(msg.sender, nickname, 0);
    }

    function isMember(address who) external view returns (bool) {
        return members[who].active;
    }
}
