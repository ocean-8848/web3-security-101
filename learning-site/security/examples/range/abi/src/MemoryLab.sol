// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice 教学合约：观察空闲内存指针（0x40）和内存分配。
contract MemoryLab {
    function pointerAtEntry() external pure returns (uint256 p) {
        assembly { p := mload(0x40) }
    }

    function zeroSlotValue() external pure returns (uint256 z) {
        assembly { z := mload(0x60) }
    }

    /// @notice 分配 len 字节的 bytes，返回分配前后的指针。
    function allocate(uint256 len) external pure returns (uint256 before_, uint256 after_) {
        assembly { before_ := mload(0x40) }
        bytes memory b = new bytes(len);
        assembly { after_ := mload(0x40) }
        b;
    }

    /// @notice 汇编写入空闲内存，但不移动指针。后续分配覆盖这个位置。
    function writeWithoutReserve() external pure returns (uint256 seen) {
        uint256 p;
        assembly {
            p := mload(0x40)
            mstore(p, 0xBEEF)
        }
        uint256[] memory a = new uint256[](1);
        a[0] = 7;
        assembly { seen := mload(p) }
    }

    /// @notice 汇编写入空闲内存，并移动指针。后续分配不碰这个位置。
    function writeWithReserve() external pure returns (uint256 seen) {
        uint256 p;
        assembly {
            p := mload(0x40)
            mstore(p, 0xBEEF)
            mstore(0x40, add(p, 0x20))
        }
        uint256[] memory a = new uint256[](1);
        a[0] = 7;
        assembly { seen := mload(p) }
    }
}
