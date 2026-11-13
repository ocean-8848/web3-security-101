// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {NoteBox} from "../src/NoteBox.sol";
import {NoteBoxFixed} from "../solution/NoteBoxFixed.sol";

contract NoteBoxPoC is Test {
    NoteBox box;
    address owner = makeAddr("owner");
    address stranger = makeAddr("stranger");

    function setUp() public {
        vm.warp(1_000_000);
        vm.prank(owner);
        box = new NoteBox("my diary password");
    }

    /// NB-01: a stranger replaces the owner's secret note.
    function test_NB01_StrangerOverwritesSecret() public {
        vm.prank(stranger);
        box.setSecret("hacked");

        vm.prank(owner);
        assertEq(box.getSecret(), "hacked");
    }

    /// NB-02: anyone reads the "private" note straight from storage.
    function test_NB02_AnyoneReadsPrivateNote() public view {
        bytes32 raw = vm.load(address(box), bytes32(uint256(2)));

        // Short string layout: data in the high bytes, length * 2 in the lowest byte.
        uint256 length = uint256(raw) & 0xff;
        assertEq(length / 2, 17);

        bytes memory text = new bytes(length / 2);
        for (uint256 i; i < text.length; i++) text[i] = raw[i];
        assertEq(string(text), "my diary password");
    }

    /// NB-03: the docs promise one edit per 24 hours; the code allows one per hour.
    function test_NB03_CooldownIsOneHourNotOneDay() public {
        vm.startPrank(owner);
        box.setSecret("first");
        vm.warp(block.timestamp + 1 hours);
        box.setSecret("second, only one hour later");
        vm.stopPrank();
        assertEq(box.EDIT_COOLDOWN(), 1 hours);
    }
}

contract NoteBoxFixTest is Test {
    NoteBoxFixed box;
    address owner = makeAddr("owner");
    address stranger = makeAddr("stranger");
    bytes ciphertext = hex"8f3a51c07e92";

    function setUp() public {
        vm.warp(1_000_000);
        vm.prank(owner);
        box = new NoteBoxFixed(ciphertext);
    }

    function test_Fix_NB01_StrangerIsRejected() public {
        vm.prank(stranger);
        vm.expectRevert(NoteBoxFixed.NotOwner.selector);
        box.setSecret(hex"00");
    }

    function test_Fix_NB02_ChainHoldsOnlyCiphertext() public view {
        // The chain still shows the bytes. The bytes are useless without the off-chain key.
        assertEq(box.encryptedNote(), ciphertext);
    }

    function test_Fix_NB03_CooldownIs24Hours() public {
        vm.startPrank(owner);
        box.setSecret(hex"01");
        vm.warp(block.timestamp + 1 hours);
        vm.expectRevert(abi.encodeWithSelector(NoteBoxFixed.TooSoon.selector, block.timestamp - 1 hours + 24 hours));
        box.setSecret(hex"02");
        vm.warp(block.timestamp + 23 hours);
        box.setSecret(hex"03");
        vm.stopPrank();
        assertEq(box.encryptedNote(), hex"03");
    }
}
