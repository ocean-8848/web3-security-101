// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {NoteBox} from "../src/NoteBox.sol";

/// Added in the "are we done?" step: exercises what the PoCs never touched.
contract NoteBoxCoverageTest is Test {
    NoteBox box;
    address owner = makeAddr("owner");
    address fan = makeAddr("fan");

    function setUp() public {
        vm.warp(1_000_000);
        vm.prank(owner);
        box = new NoteBox("my diary password");
        vm.deal(fan, 1 ether);
    }

    function test_TipThenWithdraw() public {
        vm.prank(fan);
        box.tip{value: 0.5 ether}();
        assertEq(box.tipsBy(fan), 0.5 ether);

        vm.prank(owner);
        box.withdrawTips();
        assertEq(owner.balance, 0.5 ether);
        assertEq(address(box).balance, 0);
    }

    function test_SmallTipReverts() public {
        vm.prank(fan);
        vm.expectRevert(NoteBox.TipTooSmall.selector);
        box.tip{value: 1 wei}();
    }

    function test_FanCannotWithdraw() public {
        vm.prank(fan);
        vm.expectRevert(NoteBox.NotOwner.selector);
        box.withdrawTips();
    }

    function test_FanCannotReadThroughGetter() public {
        vm.prank(fan);
        vm.expectRevert(NoteBox.NotOwner.selector);
        box.getSecret();
    }

    function test_FanCannotSetPublicNote() public {
        vm.prank(fan);
        vm.expectRevert(NoteBox.NotOwner.selector);
        box.setPublicNote("spam");
    }

    function test_OwnerSetsPublicNote() public {
        vm.prank(owner);
        box.setPublicNote("hello");
        assertEq(box.publicNote(), "hello");
    }

    function test_EmptyWithdrawReverts() public {
        vm.prank(owner);
        vm.expectRevert(NoteBox.NothingToWithdraw.selector);
        box.withdrawTips();
    }

    function test_SecondEditTooSoonReverts() public {
        vm.startPrank(owner);
        box.setSecret("first");
        vm.expectRevert(abi.encodeWithSelector(NoteBox.TooSoon.selector, block.timestamp + 1 hours));
        box.setSecret("second");
        vm.stopPrank();
    }
}
