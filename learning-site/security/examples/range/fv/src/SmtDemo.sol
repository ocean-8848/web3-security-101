// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// 本手册示例：用 SMTChecker 检查的小合约。
contract SmtDemo {
    uint256 public total;
    uint256 public cap = 100;

    function addBuggy(uint256 x) external {
        require(x <= cap);
        total += x;
        assert(total <= cap); // ❌ 漏洞：没有限制累计值
    }

    function addFixed(uint256 x) external {
        require(x <= cap);
        require(total + x <= cap); // ✅ 修复
        total += x;
        assert(total <= cap);
    }
}
