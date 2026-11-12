// SPDX-License-Identifier: MIT
// 配套章节：audit/R25 实战项目 ｜ 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

/// @notice 最小 ERC-1967 代理。升级逻辑在实现合约里（UUPS 模式）。
contract MiniLendProxy {
    bytes32 private constant IMPLEMENTATION_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    constructor(address impl, bytes memory initData) {
        assembly {
            sstore(IMPLEMENTATION_SLOT, impl)
        }
        (bool ok, ) = impl.delegatecall(initData);
        require(ok, "init failed");
    }

    receive() external payable {
        _forward();
    }

    fallback() external payable {
        _forward();
    }

    function _forward() private {
        assembly {
            let impl := sload(IMPLEMENTATION_SLOT)
            calldatacopy(0, 0, calldatasize())
            let ok := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch ok
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}
