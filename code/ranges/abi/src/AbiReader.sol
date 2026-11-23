// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice 教学合约：Solidity 高层 ABI 解码器接受和拒绝什么。
contract AbiReader {
    function takeBytes(bytes calldata data) external pure returns (bytes32) {
        return keccak256(data);
    }

    function takeTwo(bytes calldata a, bytes calldata b) external pure returns (bytes32, bytes32) {
        return (keccak256(a), keccak256(b));
    }

    function takeAddress(address a) external pure returns (address) {
        return a;
    }

    function takeSmall(uint8 x) external pure returns (uint8) {
        return x;
    }

    function sumNested(uint256[][] calldata x) external pure returns (uint256 total) {
        for (uint256 i; i < x.length; i++) {
            for (uint256 j; j < x[i].length; j++) {
                total += x[i][j];
            }
        }
    }

    /// @notice calldatacopy 读到 calldata 末尾之外时不回滚，只补零。
    function rawCopy(uint256 offset) external pure returns (bytes32 w) {
        assembly {
            calldatacopy(0, offset, 0x20)
            w := mload(0)
        }
    }
}

/// @notice 用 msg.data 的哈希做防重放标记。
contract CalldataHashGuard {
    mapping(bytes32 => bool) public used;
    uint256 public runs;

    function once(bytes calldata order) external {
        bytes32 id = keccak256(msg.data);
        require(!used[id], "already used");
        used[id] = true;
        order;
        runs++;
    }

    /// @notice 对解码后的内容做防重放标记。
    function onceByContent(bytes calldata order) external {
        bytes32 id = keccak256(order);
        require(!used[id], "already used");
        used[id] = true;
        runs++;
    }
}

/// @notice 只允许转发 ping() 的网关。两个入口的检查方式不同。
contract SelectorGate {
    bool public drained;
    uint256 public pings;

    function ping() external {
        pings++;
    }

    function drain() external {
        require(msg.sender == address(this), "only self");
        drained = true;
    }

    /// @notice 假定 payload 的偏移量总是 0x20，从固定位置读内层选择器。
    function forwardFixedOffset(bytes calldata payload) external {
        bytes4 inner;
        assembly { inner := and(calldataload(0x44), shl(224, 0xffffffff)) }
        require(inner == this.ping.selector, "only ping");
        (bool ok,) = address(this).call(payload);
        require(ok, "inner failed");
    }

    /// @notice 从解码后的 payload 读内层选择器。
    function forwardDecoded(bytes calldata payload) external {
        require(payload.length >= 4 && bytes4(payload[:4]) == this.ping.selector, "only ping");
        (bool ok,) = address(this).call(payload);
        require(ok, "inner failed");
    }
}
