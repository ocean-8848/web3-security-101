// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Club {
    string public name = "Book Club";
    uint256 public memberCount;
    mapping(address => bool) public isMember;

    function join() external {
        require(!isMember[msg.sender], "already member");
        isMember[msg.sender] = true;
        memberCount = memberCount + 1;
    }
}
