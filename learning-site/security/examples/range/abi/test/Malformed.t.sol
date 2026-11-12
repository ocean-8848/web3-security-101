// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AbiReader, CalldataHashGuard, SelectorGate} from "../src/AbiReader.sol";

contract MalformedTest is Test {
    AbiReader reader = new AbiReader();
    CalldataHashGuard guard = new CalldataHashGuard();
    SelectorGate gate = new SelectorGate();

    function send(address to, bytes memory data) internal returns (bool ok) {
        (ok,) = to.call(data);
    }

    function test_HighLevelAcceptsNonCanonicalOffset() public {
        bytes memory raw = abi.encodePacked(
            AbiReader.takeBytes.selector,
            uint256(0x40), // 规范编码是 0x20
            uint256(0xdead), // 没有任何参数指向这个字
            uint256(2),
            bytes32(bytes2("hi"))
        );
        (bool ok, bytes memory ret) = address(reader).call(raw);
        assertTrue(ok);
        assertEq(abi.decode(ret, (bytes32)), keccak256("hi"));
    }

    function test_TwoArgsMayShareOneTail() public {
        bytes memory raw = abi.encodePacked(
            AbiReader.takeTwo.selector, uint256(0x40), uint256(0x40), uint256(2), bytes32(bytes2("hi"))
        );
        (bool ok, bytes memory ret) = address(reader).call(raw);
        assertTrue(ok);
        (bytes32 a, bytes32 b) = abi.decode(ret, (bytes32, bytes32));
        assertEq(a, b, "both parameters decode to the same bytes");
    }

    function test_OffsetOutOfBoundsReverts() public {
        bytes memory raw = abi.encodePacked(AbiReader.takeBytes.selector, uint256(0xffff));
        assertFalse(send(address(reader), raw));
    }

    function test_LengthPastEndReverts() public {
        bytes memory raw = abi.encodePacked(AbiReader.takeBytes.selector, uint256(0x20), uint256(1000), bytes32("x"));
        assertFalse(send(address(reader), raw));
    }

    function test_DirtyAddressReverts() public {
        bytes memory raw = abi.encodePacked(AbiReader.takeAddress.selector, (uint256(1) << 160) | 0xA11CE);
        assertFalse(send(address(reader), raw));
    }

    function test_DirtyUint8Reverts() public {
        bytes memory raw = abi.encodePacked(AbiReader.takeSmall.selector, uint256(256));
        assertFalse(send(address(reader), raw));
    }

    function test_DirtyTailPaddingIsAccepted() public {
        bytes memory raw = abi.encodePacked(
            AbiReader.takeBytes.selector, uint256(0x20), uint256(2), bytes32(abi.encodePacked(bytes2("hi"), bytes30(uint240(1))))
        );
        (bool ok, bytes memory ret) = address(reader).call(raw);
        assertTrue(ok);
        assertEq(abi.decode(ret, (bytes32)), keccak256("hi"));
    }

    function test_CalldataCopyPastEndFillsZero() public view {
        assertEq(reader.rawCopy(1_000_000), bytes32(0));
    }

    function test_Exploit_HashGuardBypassedByTrailingByte() public {
        bytes memory canonical = abi.encodeCall(CalldataHashGuard.once, (bytes("order-1")));
        assertTrue(send(address(guard), canonical));
        assertFalse(send(address(guard), canonical), "exact replay is blocked");
        assertTrue(send(address(guard), abi.encodePacked(canonical, uint8(1))), "one extra byte passes");
        assertEq(guard.runs(), 2, "same order ran twice");
    }

    function test_Fix_ContentGuardBlocksVariant() public {
        bytes memory canonical = abi.encodeCall(CalldataHashGuard.onceByContent, (bytes("order-1")));
        assertTrue(send(address(guard), canonical));
        assertFalse(send(address(guard), abi.encodePacked(canonical, uint8(1))));
        assertEq(guard.runs(), 1);
    }

    function smuggled(bytes4 entry) internal pure returns (bytes memory) {
        return abi.encodePacked(
            entry,
            uint256(0x60), // 真实 payload 在后面
            uint256(0),
            bytes32(SelectorGate.ping.selector), // 0x44 处的诱饵
            uint256(4),
            bytes32(SelectorGate.drain.selector)
        );
    }

    function test_FixedOffset_BlocksCanonicalDrain() public {
        bytes memory payload = abi.encodeCall(SelectorGate.drain, ());
        assertFalse(send(address(gate), abi.encodeCall(SelectorGate.forwardFixedOffset, (payload))));
    }

    function test_Exploit_FixedOffsetSmuggling() public {
        assertTrue(send(address(gate), smuggled(SelectorGate.forwardFixedOffset.selector)));
        assertTrue(gate.drained(), "drain ran although the check saw ping");
    }

    function test_Fix_DecodedCheckStopsSmuggling() public {
        assertFalse(send(address(gate), smuggled(SelectorGate.forwardDecoded.selector)));
        assertFalse(gate.drained());
    }
}
