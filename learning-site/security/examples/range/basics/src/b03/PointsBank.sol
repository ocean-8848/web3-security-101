// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice B03 的练习对象：一个积分账本。任何人都可以给自己铸造积分。
contract PointsBank {
    uint256 public totalPoints;
    mapping(address => uint256) public balances;

    error NotEnoughPoints(uint256 have, uint256 want);

    function mint(uint256 amount) external {
        balances[msg.sender] += amount;
        totalPoints += amount;
    }

    function burn(uint256 amount) external {
        uint256 have = balances[msg.sender];
        if (have < amount) revert NotEnoughPoints(have, amount);
        balances[msg.sender] = have - amount;
        totalPoints -= amount;
    }

    function move(address to, uint256 amount) external {
        uint256 have = balances[msg.sender];
        if (have < amount) revert NotEnoughPoints(have, amount);
        balances[msg.sender] -= amount; // ✅ 修复：每次写入都基于当前存储值
        balances[to] += amount;
    }

    /// @notice 按 3% 计算手续费，向下取整。
    function feeOf(uint256 amount) external pure returns (uint256) {
        return (amount * 3) / 100;
    }
}
