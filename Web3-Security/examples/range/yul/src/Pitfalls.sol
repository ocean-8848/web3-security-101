// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// 本手册示例：内联汇编的四类审计陷阱。每一对都有 ❌ 与 ✅ 版本。
/// 这些合约只用于本地 forge test。

// ---- 1. 脏高位（dirty bits）----
contract DirtyLedger {
    mapping(address => uint256) public balanceOf;

    // ❌ 漏洞：直接用 calldata 的 32 字节作为 mapping 键，没有清理高 96 位
    function creditRaw() external {
        assembly {
            mstore(0x00, calldataload(4))
            mstore(0x20, balanceOf.slot)
            let slot := keccak256(0x00, 0x40)
            sstore(slot, add(sload(slot), calldataload(36)))
        }
    }

    // ✅ 修复：先用掩码清理高位
    function creditMasked() external {
        assembly {
            mstore(0x00, and(calldataload(4), 0xffffffffffffffffffffffffffffffffffffffff))
            mstore(0x20, balanceOf.slot)
            let slot := keccak256(0x00, 0x40)
            sstore(slot, add(sload(slot), calldataload(36)))
        }
    }
}

// ---- 2. 内存安全（memory safety）----
contract MemoryDemo {
    // ❌ 漏洞：写入空闲内存后没有更新空闲内存指针 0x40
    function clobbered() external pure returns (uint256 kept) {
        uint256 ptr;
        assembly {
            ptr := mload(0x40)
            mstore(ptr, 0xAAAA)
        }
        bytes memory other = abi.encodePacked(uint256(0xBBBB));
        other; // 只为触发内存分配
        assembly {
            kept := mload(ptr)
        }
    }

    // ✅ 修复：分配后把 0x40 向后移动
    function reserved() external pure returns (uint256 kept) {
        uint256 ptr;
        assembly {
            ptr := mload(0x40)
            mstore(ptr, 0xAAAA)
            mstore(0x40, add(ptr, 0x20))
        }
        bytes memory other = abi.encodePacked(uint256(0xBBBB));
        other;
        assembly {
            kept := mload(ptr)
        }
    }
}

// ---- 3. 返回数据（returndata）----
contract SilentFeed {
    // 接受任何调用，成功，但不返回数据
    fallback() external {}
}

contract HonestFeed {
    function latest() external pure returns (uint256) {
        return 2_000e8;
    }
}

contract FeedReader {
    bytes4 private constant LATEST = bytes4(keccak256("latest()"));

    // ❌ 漏洞：输入区和输出区都是 0x00，并且没有检查 returndatasize
    function readUnchecked(address feed) external view returns (uint256 price) {
        bytes4 sel = LATEST;
        assembly {
            mstore(0x00, shr(224, sel))
            // 选择器在第 0x1c 字节起的 4 字节，也就是这个字的低 4 字节
            let ok := staticcall(gas(), feed, 0x1c, 0x04, 0x00, 0x20)
            if iszero(ok) { revert(0, 0) }
            price := mload(0x00)
        }
    }

    // ✅ 修复：要求返回数据至少 32 字节
    function readChecked(address feed) external view returns (uint256 price) {
        bytes4 sel = LATEST;
        assembly {
            mstore(0x00, shr(224, sel))
            let ok := staticcall(gas(), feed, 0x1c, 0x04, 0x00, 0x20)
            if or(iszero(ok), lt(returndatasize(), 0x20)) { revert(0, 0) }
            price := mload(0x00)
        }
    }
}

// ---- 4. 汇编 return 跳过修饰器尾部 ----
contract LockDemo {
    uint256 private locked = 1;

    modifier nonReentrant() {
        require(locked == 1, "locked");
        locked = 2;
        _;
        locked = 1;
    }

    // ❌ 漏洞：assembly 的 return 结束整个调用，修饰器的尾部不执行
    function exitEarly() external nonReentrant returns (uint256) {
        assembly {
            mstore(0x00, 7)
            return(0x00, 0x20)
        }
    }

    // ✅ 修复：给返回变量赋值，让函数正常结束
    function exitNormally() external nonReentrant returns (uint256 v) {
        assembly {
            v := 7
        }
    }
}
