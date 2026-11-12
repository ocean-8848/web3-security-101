// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MemoryLab} from "../src/MemoryLab.sol";

contract MemoryTest is Test {
    MemoryLab lab = new MemoryLab();

    function test_PointerStartsAt0x80() public view {
        assertEq(lab.pointerAtEntry(), 0x80);
    }

    function test_ZeroSlotIsZero() public view {
        assertEq(lab.zeroSlotValue(), 0);
    }

    function test_AllocationRoundsUpToWords() public view {
        (uint256 b1, uint256 a1) = lab.allocate(1);
        assertEq(a1 - b1, 0x40, "1 byte: length word + 1 data word");
        (uint256 b32, uint256 a32) = lab.allocate(32);
        assertEq(a32 - b32, 0x40, "32 bytes: length word + 1 data word");
        (uint256 b33, uint256 a33) = lab.allocate(33);
        assertEq(a33 - b33, 0x60, "33 bytes: length word + 2 data words");
    }

    function test_UnreservedWriteIsOverwritten() public view {
        assertEq(lab.writeWithoutReserve(), 1, "the array length replaced 0xBEEF");
    }

    function test_ReservedWriteSurvives() public view {
        assertEq(lab.writeWithReserve(), 0xBEEF);
    }
}
