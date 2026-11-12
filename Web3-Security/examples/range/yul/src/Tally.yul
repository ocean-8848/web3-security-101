// 本手册示例：纯 Yul 的计数器。外部行为与 TallySol 相同。
object "Tally" {
    code {
        // 部署代码（init code）：把 runtime 复制到内存，然后返回
        if callvalue() { revert(0, 0) }
        datacopy(0, dataoffset("runtime"), datasize("runtime"))
        return(0, datasize("runtime"))
    }
    object "runtime" {
        code {
            if callvalue() { revert(0, 0) }
            if lt(calldatasize(), 4) { revert(0, 0) }
            switch shr(224, calldataload(0))
            case 0x6d4ce63c /* get() */ {
                mstore(0x00, sload(0))
                return(0x00, 0x20)
            }
            case 0x1003e2d2 /* add(uint256) */ {
                if lt(calldatasize(), 36) { revert(0, 0) }
                let amount := calldataload(4)
                let oldTotal := sload(0)
                let newTotal := add(oldTotal, amount)
                if lt(newTotal, oldTotal) { revert(0, 0) }
                sstore(0, newTotal)
                mstore(0x00, amount)
                // keccak256("Added(address,uint256)")
                log2(0x00, 0x20, 0x446e00ad56f9b887844f390c87a128507b991ea0499375f13ecb115288c2df7d, caller())
                return(0, 0)
            }
            default { revert(0, 0) }
        }
    }
}
