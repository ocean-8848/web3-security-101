// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// 本手册示例：Solidity 写法的计数器，作为 gas 对照基线。
contract TallySol {
    uint256 private total;

    event Added(address indexed who, uint256 amount);

    function get() external view returns (uint256) {
        return total;
    }

    function add(uint256 amount) external {
        total += amount;
        emit Added(msg.sender, amount);
    }
}
