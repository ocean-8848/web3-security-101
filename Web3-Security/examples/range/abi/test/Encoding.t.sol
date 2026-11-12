// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";

contract EncodingTest is Test {
    struct Pair {
        uint256 id;
        bytes tag;
    }

    function word(bytes memory data, uint256 i) internal pure returns (uint256 w) {
        assembly { w := mload(add(add(data, 0x20), mul(i, 0x20))) }
    }

    function dump(string memory name, bytes memory data) internal pure {
        console2.log(name);
        for (uint256 i; i * 32 < data.length; i++) {
            console2.logBytes32(bytes32(word(data, i)));
        }
    }

    function test_StaticIsInline() public pure {
        bytes memory e = abi.encode(uint256(7), address(0xA11CE), true);
        dump("static (uint256,address,bool)", e);
        assertEq(e.length, 96);
        assertEq(word(e, 0), 7);
        assertEq(word(e, 1), 0xA11CE);
        assertEq(word(e, 2), 1);
    }

    function test_DynamicUsesOffset() public pure {
        bytes memory e = abi.encode(uint256(7), bytes("hi"));
        dump("dynamic (uint256,bytes)", e);
        assertEq(e.length, 128);
        assertEq(word(e, 1), 0x40, "offset counted from start of args");
        assertEq(word(e, 2), 2, "length");
        assertEq(bytes32(word(e, 3)), bytes32(bytes2("hi")), "right padded");
    }

    function test_NestedArrayOffsetsAreRelative() public pure {
        uint256[][] memory x = new uint256[][](2);
        x[0] = new uint256[](1);
        x[0][0] = 5;
        x[1] = new uint256[](2);
        x[1][0] = 6;
        x[1][1] = 7;
        bytes memory e = abi.encode(x);
        dump("nested uint256[][]", e);
        assertEq(word(e, 0), 0x20, "outer offset");
        assertEq(word(e, 1), 2, "outer length");
        assertEq(word(e, 2), 0x40, "x[0] offset, from word 2");
        assertEq(word(e, 3), 0x80, "x[1] offset, from word 2");
        assertEq(word(e, 4), 1, "x[0] length");
        assertEq(word(e, 5), 5);
        assertEq(word(e, 6), 2, "x[1] length");
    }

    function test_StructWithDynamicMemberIsDynamic() public pure {
        bytes memory e = abi.encode(Pair(9, bytes("abc")));
        dump("struct (uint256,bytes)", e);
        assertEq(word(e, 0), 0x20, "the struct itself sits behind an offset");
        assertEq(word(e, 1), 9);
        assertEq(word(e, 2), 0x40, "tag offset, from the struct start");
        assertEq(word(e, 3), 3);
    }

    function test_PackedCollides() public pure {
        bytes memory a = abi.encodePacked(bytes("ab"), bytes("c"));
        bytes memory b = abi.encodePacked(bytes("a"), bytes("bc"));
        assertEq(keccak256(a), keccak256(b));
        assertTrue(keccak256(abi.encode(bytes("ab"), bytes("c"))) != keccak256(abi.encode(bytes("a"), bytes("bc"))));
    }
}
