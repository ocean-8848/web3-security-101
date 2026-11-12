// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {ReturnLab, ReturnsWord, ReturnsNothing, BigReverter} from "../src/ReturnLab.sol";

contract ReturndataTest is Test {
    ReturnLab lab = new ReturnLab();
    address word = address(new ReturnsWord());
    address nothing = address(new ReturnsNothing());
    address noCode = address(0xC0DE);

    function test_NormalReturnFillsBuffer() public view {
        (bool ok, uint256 w) = lab.readWithStaleBuffer(word);
        assertTrue(ok);
        assertEq(w, 42);
    }

    function test_EmptyReturnLeavesStaleBuffer() public view {
        (bool ok, uint256 w) = lab.readWithStaleBuffer(nothing);
        assertTrue(ok, "the call succeeded");
        assertTrue(w != 0, "the word is the old selector, not a return value");
        assertEq(bytes4(bytes32(w)), bytes4(0x3fa4f245), "selector of value()");
    }

    function test_NoCodeAlsoLeavesStaleBuffer() public view {
        (bool ok, uint256 w) = lab.readWithStaleBuffer(noCode);
        assertTrue(ok, "calling an address without code succeeds");
        assertEq(bytes4(bytes32(w)), bytes4(0x3fa4f245));
    }

    function test_Fix_ChecksReturnSize() public {
        assertEq(lab.readChecked(word), 42);
        vm.expectRevert();
        lab.readChecked(nothing);
    }

    function test_LowLevelCallToNoCodeSucceeds() public {
        (bool ok, uint256 size) = lab.lowLevelCall(noCode);
        assertTrue(ok);
        assertEq(size, 0);
    }

    function test_HighLevelCallToNoCodeReverts() public {
        vm.expectRevert();
        lab.highLevelCall(noCode);
    }

    function test_AbiDecodeOfShortReturnReverts() public {
        vm.expectRevert();
        lab.decodeReturn(nothing);
    }

    function test_ReturndatacopyPastEndReverts() public {
        vm.expectRevert();
        lab.copyPastEnd(word);
    }

    function test_ReturnBombCostMeasured() public {
        address bomb = address(new BigReverter(200_000));
        uint256 cap = 500_000;

        uint256 g0 = gasleft();
        bool okCopy = lab.callIgnoring(bomb, cap);
        uint256 copyCost = g0 - gasleft();

        g0 = gasleft();
        bool okNoCopy = lab.callNoCopy(bomb, cap);
        uint256 noCopyCost = g0 - gasleft();

        console2.log("gas with Solidity (ok,) call:", copyCost);
        console2.log("gas with assembly out=0 call:", noCopyCost);
        assertFalse(okCopy);
        assertFalse(okNoCopy);
    }
}
