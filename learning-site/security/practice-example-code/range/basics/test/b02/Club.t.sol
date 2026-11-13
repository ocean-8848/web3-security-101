// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, Vm} from "forge-std/Test.sol";
import {Club} from "../../src/b02/step8/Club.sol";

/// @notice B03 用这个文件练习 cheatcode 和读 trace。
contract ClubTest is Test {
    Club club;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    uint256 constant FEE = 0.01 ether;

    event Joined(address indexed who, string nickname, uint256 paid);

    // 测试合约是 owner，需要能收 ETH
    receive() external payable {}

    function setUp() public {
        club = new Club(FEE);
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);
    }

    function test_JoinRecordsMember() public {
        vm.prank(alice);
        club.join{value: FEE}("alice");

        assertTrue(club.isMember(alice));
        assertEq(club.memberCount(), 1);
        assertEq(address(club).balance, FEE);
    }

    function test_JoinEmitsEvent() public {
        vm.expectEmit(true, false, false, true, address(club));
        emit Joined(alice, "alice", FEE);
        vm.prank(alice);
        club.join{value: FEE}("alice");
    }

    function test_RevertWhen_WrongFee() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Club.WrongFee.selector, 1 wei, FEE));
        club.join{value: 1 wei}("alice");
    }

    function test_RevertWhen_JoinTwice() public {
        vm.startPrank(alice);
        club.join{value: FEE}("alice");
        vm.expectRevert(abi.encodeWithSelector(Club.AlreadyMember.selector, alice));
        club.join{value: FEE}("alice2");
        vm.stopPrank();
    }

    function test_RevertWhen_StrangerWithdraws() public {
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Club.NotOwner.selector, bob));
        club.withdraw();
    }

    function test_OwnerWithdraws() public {
        vm.prank(alice);
        club.join{value: FEE}("alice");
        uint256 before = address(this).balance;

        club.withdraw();

        assertEq(address(club).balance, 0);
        assertEq(address(this).balance, before + FEE);
    }

    function test_WarpMovesTime() public {
        uint256 start = block.timestamp;
        vm.warp(start + 1 days);
        assertEq(block.timestamp, start + 1 days);
    }
}
