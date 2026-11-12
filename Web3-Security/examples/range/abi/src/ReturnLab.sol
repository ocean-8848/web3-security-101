// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IValue {
    function value() external view returns (uint256);
}

contract ReturnsWord {
    function value() external pure returns (uint256) {
        return 42;
    }
}

contract ReturnsNothing {
    fallback() external {}
}

/// @notice 回滚时返回 size 字节。
contract BigReverter {
    uint256 public immutable size;

    constructor(uint256 size_) {
        size = size_;
    }

    fallback() external {
        uint256 s = size;
        assembly { revert(0, s) }
    }
}

/// @notice 教学合约：返回数据（returndata）的读取方式。
contract ReturnLab {
    /// @notice 输出缓冲区写在 0 处。被调用方没有返回数据时，缓冲区保留旧值。
    function readWithStaleBuffer(address target) external view returns (bool ok, uint256 word) {
        bytes4 sel = IValue.value.selector;
        assembly {
            mstore(0, sel)
            ok := staticcall(gas(), target, 0, 4, 0, 0x20)
            word := mload(0)
        }
    }

    /// @notice 同样的读取，先检查 returndatasize。
    function readChecked(address target) external view returns (uint256 word) {
        bytes4 sel = IValue.value.selector;
        assembly {
            mstore(0, sel)
            let ok := staticcall(gas(), target, 0, 4, 0, 0x20)
            if or(iszero(ok), lt(returndatasize(), 0x20)) { revert(0, 0) }
            word := mload(0)
        }
    }

    function lowLevelCall(address target) external returns (bool ok, uint256 size) {
        bytes memory data;
        (ok, data) = target.call(abi.encodeCall(IValue.value, ()));
        size = data.length;
    }

    function highLevelCall(address target) external view returns (uint256) {
        return IValue(target).value();
    }

    function decodeReturn(address target) external view returns (uint256) {
        (bool ok, bytes memory data) = target.staticcall(abi.encodeCall(IValue.value, ()));
        require(ok, "call failed");
        return abi.decode(data, (uint256));
    }

    /// @notice returndatacopy 超过 returndatasize 时回滚。
    function copyPastEnd(address target) external view {
        bytes4 sel = IValue.value.selector;
        assembly {
            mstore(0, sel)
            let ok := staticcall(gas(), target, 0, 4, 0, 0)
            ok := ok
            returndatacopy(0, 0, add(returndatasize(), 1))
        }
    }

    /// @notice Solidity 低级调用，忽略返回数据变量。
    function callIgnoring(address target, uint256 gasCap) external returns (bool ok) {
        (ok,) = target.call{gas: gasCap}("");
    }

    /// @notice 汇编调用，输出长度为 0，不复制返回数据。
    function callNoCopy(address target, uint256 gasCap) external returns (bool ok) {
        assembly {
            ok := call(gasCap, target, 0, 0, 0, 0, 0)
        }
    }
}
