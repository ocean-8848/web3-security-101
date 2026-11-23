// SPDX-License-Identifier: MIT
// 配套章节：07 外部调用、C02 TRON ｜ 被测合约：code/snippets/05-SafeTokenOps.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {SafeTokenOps, MultiChainVault, IERC20Min} from "snippets/05-SafeTokenOps.sol";
import {NaiveTokenVault} from "../src/NaiveTokenVault.sol";
import {ToyERC20, ReturnFalseToken, FeeOnTransferToken, TronStyleToken, NoReturnToken} from "../src/ToyERC20.sol";

/// @dev 把 internal 的库函数暴露给 expectRevert
contract SafeOpsHarness {
    function pull(IERC20Min token, address from, uint256 amt) external {
        SafeTokenOps.safeTransferFrom(token, from, address(this), amt);
    }
}

contract SafeTokenOpsTest is Test {
    address attacker = makeAddr("attacker");
    address victim = makeAddr("victim");

    function _approve(address owner, ToyERC20 token, address spender) internal {
        vm.prank(owner);
        token.approve(spender, type(uint256).max);
    }

    function test_PoC_FalseReturnCreditsWithoutPayment() public {
        ReturnFalseToken token = new ReturnFalseToken();
        NaiveTokenVault vault = new NaiveTokenVault(address(token));
        token.mint(victim, 100e18);
        _approve(victim, token, address(vault));
        vm.prank(victim);
        vault.deposit(100e18);
        // 攻击者没有余额，transferFrom 返回 false
        vm.startPrank(attacker);
        vault.deposit(100e18);
        vault.withdraw(100e18);
        vm.stopPrank();
        assertEq(token.balanceOf(attacker), 100e18, "attacker took victim tokens");
        assertEq(token.balanceOf(address(vault)), 0);
    }

    function test_Fixed_FalseReturnReverts() public {
        ReturnFalseToken token = new ReturnFalseToken();
        MultiChainVault vault = new MultiChainVault(IERC20Min(address(token)), false);
        vm.prank(attacker);
        vm.expectRevert(SafeTokenOps.ReturnedFalse.selector);
        vault.deposit(100e18);
        assertEq(vault.deposits(attacker), 0);
    }

    function test_PoC_FeeOnTransferOvercredits() public {
        FeeOnTransferToken token = new FeeOnTransferToken(1_000); // 10%，示例
        NaiveTokenVault vault = new NaiveTokenVault(address(token));
        token.mint(victim, 100e18);
        _approve(victim, token, address(vault));
        vm.prank(victim);
        vault.deposit(100e18);
        assertEq(vault.deposits(victim), 100e18);
        assertEq(token.balanceOf(address(vault)), 90e18, "ledger exceeds balance");
        vm.prank(victim);
        vm.expectRevert(); // 账本大于实际余额，最后取款的人失败
        vault.withdraw(100e18);
    }

    function test_Fixed_FeeOnTransferCreditsReceived() public {
        FeeOnTransferToken token = new FeeOnTransferToken(1_000);
        MultiChainVault vault = new MultiChainVault(IERC20Min(address(token)), false);
        token.mint(victim, 100e18);
        _approve(victim, token, address(vault));
        vm.prank(victim);
        vault.deposit(100e18);
        assertEq(vault.deposits(victim), 90e18);
    }

    function test_PoC_NoCodeTokenCreditsPhantomDeposit() public {
        address notDeployed = makeAddr("notDeployedYet");
        NaiveTokenVault vault = new NaiveTokenVault(notDeployed);
        vm.prank(attacker);
        vault.deposit(1_000e18);
        assertEq(vault.deposits(attacker), 1_000e18, "credit with no token at all");
    }

    function test_Fixed_NoCodeTokenReverts() public {
        address notDeployed = makeAddr("notDeployedYet");
        SafeOpsHarness harness = new SafeOpsHarness();
        vm.expectRevert(SafeTokenOps.NoCode.selector);
        harness.pull(IERC20Min(notDeployed), attacker, 1);
        // 金库先读 balanceOf，高级调用在无代码地址上直接回滚
        MultiChainVault vault = new MultiChainVault(IERC20Min(notDeployed), false);
        vm.prank(attacker);
        vm.expectRevert();
        vault.deposit(1_000e18);
    }

    function test_Fixed_NoReturnTokenSupported() public {
        NoReturnToken token = new NoReturnToken();
        MultiChainVault vault = new MultiChainVault(IERC20Min(address(token)), false);
        token.mint(victim, 5e18);
        vm.startPrank(victim);
        token.approve(address(vault), 5e18);
        vault.deposit(5e18);
        vault.withdraw(5e18);
        vm.stopPrank();
        assertEq(token.balanceOf(victim), 5e18);
    }

    function test_TronStyle_StandardPushRevertsBalanceCheckWorks() public {
        TronStyleToken token = new TronStyleToken();
        MultiChainVault standard = new MultiChainVault(IERC20Min(address(token)), false);
        MultiChainVault tron = new MultiChainVault(IERC20Min(address(token)), true);
        token.mint(victim, 20e18);
        vm.startPrank(victim);
        token.approve(address(standard), type(uint256).max);
        token.approve(address(tron), type(uint256).max);
        standard.deposit(10e18);
        tron.deposit(10e18);
        vm.expectRevert(SafeTokenOps.ReturnedFalse.selector);
        standard.withdraw(10e18);
        tron.withdraw(10e18);
        vm.stopPrank();
        assertEq(token.balanceOf(victim), 10e18);
    }

    function testFuzz_CreditEqualsReceived(uint256 feeBps, uint256 amt) public {
        feeBps = bound(feeBps, 0, 9_999);
        amt = bound(amt, 1, 1e30);
        FeeOnTransferToken token = new FeeOnTransferToken(feeBps);
        MultiChainVault vault = new MultiChainVault(IERC20Min(address(token)), false);
        token.mint(victim, amt);
        _approve(victim, token, address(vault));
        vm.prank(victim);
        vault.deposit(amt);
        assertEq(vault.deposits(victim), token.balanceOf(address(vault)));
    }
}
