// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Club {
    string public name = "Book Club";
    uint256 public memberCount;

    function addMember() external {
        _increase();
    }

    function isEmpty() public view returns (bool) {
        return memberCount == 0;
    }

    function _increase() private {
        memberCount = memberCount + 1;
    }
}
