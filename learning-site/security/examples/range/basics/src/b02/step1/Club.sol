// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Club {
    string public name = "Book Club";
    uint256 public memberCount;

    function addMember() external {
        memberCount = memberCount + 1;
    }
}
