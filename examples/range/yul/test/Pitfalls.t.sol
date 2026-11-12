// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Pitfalls.sol";

contract PitfallsTest is Test {
    address alice = address(0xA11CE);

    function _dirty(address a) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(a)) | (uint256(0xff) << 248));
    }

    function test_DirtyBits_VulnerableLosesCredit() public {
        DirtyLedger l = new DirtyLedger();
        (bool ok,) = address(l).call(abi.encodePacked(l.creditRaw.selector, _dirty(alice), uint256(100)));
        assertTrue(ok);
        assertEq(l.balanceOf(alice), 0, "credit landed in an unreachable slot");
    }

    function test_DirtyBits_MaskedIsCorrect() public {
        DirtyLedger l = new DirtyLedger();
        (bool ok,) = address(l).call(abi.encodePacked(l.creditMasked.selector, _dirty(alice), uint256(100)));
        assertTrue(ok);
        assertEq(l.balanceOf(alice), 100);
    }

    function test_Memory_VulnerableValueOverwritten() public {
        // abi.encodePacked 把新 bytes 的长度 32 写到同一地址
        assertEq(new MemoryDemo().clobbered(), 32);
    }

    function test_Memory_FixedValueKept() public {
        assertEq(new MemoryDemo().reserved(), 0xAAAA);
    }

    function test_Returndata_SilentFeedYieldsSelectorAsPrice() public {
        FeedReader r = new FeedReader();
        uint256 price = r.readUnchecked(address(new SilentFeed()));
        assertEq(price, uint256(uint32(bytes4(keccak256("latest()")))));
        console.log("garbage price:", price);
    }

    function test_Returndata_NoCodeAddressYieldsSelectorAsPrice() public {
        FeedReader r = new FeedReader();
        assertEq(r.readUnchecked(address(0xDEAD0001)), uint256(uint32(bytes4(keccak256("latest()")))));
    }

    function test_Returndata_CheckedRejectsSilentFeed() public {
        FeedReader r = new FeedReader();
        address silent = address(new SilentFeed());
        vm.expectRevert();
        r.readChecked(silent);
    }

    function test_Returndata_CheckedRejectsNoCode() public {
        FeedReader r = new FeedReader();
        vm.expectRevert();
        r.readChecked(address(0xDEAD0001));
    }

    function test_Returndata_CheckedAcceptsHonestFeed() public {
        assertEq(new FeedReader().readChecked(address(new HonestFeed())), 2_000e8);
    }

    function test_AsmReturn_LeavesLockStuck() public {
        LockDemo d = new LockDemo();
        assertEq(d.exitEarly(), 7);
        vm.expectRevert("locked");
        d.exitEarly();
    }

    function test_NormalExit_ReleasesLock() public {
        LockDemo d = new LockDemo();
        assertEq(d.exitNormally(), 7);
        assertEq(d.exitNormally(), 7);
    }
}
