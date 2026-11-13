// SPDX-License-Identifier: MIT
// 配套章节：06 算术与精度 ｜ 被测合约：practice-example-code/03-VaultInflation.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {NaiveVault, OffsetVault, IERC20Min} from "handbook/03-VaultInflation.sol";
import {ToyERC20} from "../src/ToyERC20.sol";

contract VaultInflationTest is Test {
    ToyERC20 token;
    NaiveVault naive;
    OffsetVault offset;
    address attacker = makeAddr("attacker");
    address victim = makeAddr("victim");

    function setUp() public {
        token = new ToyERC20();
        naive = new NaiveVault(IERC20Min(address(token)));
        offset = new OffsetVault(IERC20Min(address(token)), 6);
        _fund(address(naive));
        _fund(address(offset));
    }

    function _fund(address vault) internal {
        token.mint(attacker, 1e30);
        token.mint(victim, 1e30);
        vm.prank(attacker);
        token.approve(vault, type(uint256).max);
        vm.prank(victim);
        token.approve(vault, type(uint256).max);
    }

    function test_PoC_FirstDepositorStealsVictimDeposit() public {
        uint256 start = token.balanceOf(attacker);
        vm.prank(attacker);
        naive.deposit(1);
        vm.prank(attacker);
        token.transfer(address(naive), 1e18); // 捐赠抬高份额价格
        vm.prank(victim);
        naive.deposit(1e18);
        assertEq(naive.sharesOf(victim), 0, "victim got zero shares");
        vm.prank(attacker);
        naive.redeem(1);
        assertEq(token.balanceOf(attacker), start + 1e18, "attacker gained victim deposit");
    }

    function test_Fixed_SameDonationIsUnprofitable() public {
        uint256 start = token.balanceOf(attacker);
        uint256 victimStart = token.balanceOf(victim);
        vm.startPrank(attacker);
        uint256 attackerShares = offset.deposit(1, 0);
        token.transfer(address(offset), 1e18);
        vm.stopPrank();
        vm.prank(victim);
        uint256 victimShares = offset.deposit(1e18, 0);
        assertGt(victimShares, 0);
        vm.prank(attacker);
        offset.redeem(attackerShares, 0);
        vm.prank(victim);
        offset.redeem(victimShares, 0);
        assertLt(token.balanceOf(attacker), start, "attacker loses money");
        assertApproxEqRel(token.balanceOf(victim), victimStart, 1e15, "victim loses under 0.1%");
    }

    function test_Fixed_MinSharesRejectsFrontRun() public {
        vm.prank(victim);
        uint256 quoted = offset.previewDeposit(1e18);
        vm.startPrank(attacker);
        offset.deposit(1, 0);
        token.transfer(address(offset), 1e18);
        vm.stopPrank();
        vm.prank(victim);
        vm.expectRevert("slippage: shares too low");
        offset.deposit(1e18, quoted);
    }

    function testFuzz_OffsetVaultAttackerNeverProfits(uint256 donation, uint256 deposit) public {
        donation = bound(donation, 1, 1e24);
        deposit = bound(deposit, 1, 1e24);
        vm.startPrank(attacker);
        uint256 s = offset.deposit(1, 0);
        token.transfer(address(offset), donation);
        vm.stopPrank();
        if (offset.previewDeposit(deposit) > 0) {
            vm.prank(victim);
            offset.deposit(deposit, 0);
        }
        vm.prank(attacker);
        uint256 back = offset.redeem(s, 0);
        assertLe(back, donation + 1, "attacker never gets back more than spent");
    }
}
