// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// 本手册示例：外部接口与 TallySol 相同，函数分发由 fallback 中的内联汇编完成。
contract TallyAsm {
    // keccak256("Added(address,uint256)")
    bytes32 private constant ADDED = keccak256("Added(address,uint256)");

    fallback() external {
        bytes32 topic = ADDED;
        assembly {
            if callvalue() { revert(0, 0) }
            if lt(calldatasize(), 4) { revert(0, 0) }
            let selector := shr(224, calldataload(0))

            // get()
            if eq(selector, 0x6d4ce63c) {
                mstore(0x00, sload(0))
                return(0x00, 0x20)
            }

            // add(uint256)
            if eq(selector, 0x1003e2d2) {
                if lt(calldatasize(), 36) { revert(0, 0) }
                let amount := calldataload(4)
                let oldTotal := sload(0)
                let newTotal := add(oldTotal, amount)
                // 溢出检查：无符号加法回绕后，结果小于任一操作数
                if lt(newTotal, oldTotal) { revert(0, 0) }
                sstore(0, newTotal)
                mstore(0x00, amount)
                log2(0x00, 0x20, topic, caller())
                return(0, 0)
            }

            revert(0, 0)
        }
    }
}
