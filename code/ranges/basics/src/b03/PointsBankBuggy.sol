// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice 与 PointsBank 只差一处。B03 用不变量测试找出这一处。
contract PointsBankBuggy {
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
        uint256 toHave = balances[to];
        if (have < amount) revert NotEnoughPoints(have, amount);
        balances[msg.sender] = have - amount; // ❌ 漏洞：to 等于 msg.sender 时，下一行覆盖这次扣减
        balances[to] = toHave + amount;
    }
}
