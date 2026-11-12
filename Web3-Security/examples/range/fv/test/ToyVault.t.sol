// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {ToyVault} from "../src/ToyVault.sol";

contract ToyVaultSymbolic is Test {
    address constant ALICE = address(0xA11CE);
    address constant BOB = address(0xB0B);

    // 性质 1：两名用户的份额之和等于总份额。无乘除，求解很快。
    function check_SharesConserved(uint64 a, uint64 b, uint64 c) public {
        ToyVault v = new ToyVault(false);
        vm.prank(ALICE);
        v.deposit(a);
        vm.prank(BOB);
        v.deposit(b);
        vm.prank(ALICE);
        v.redeem(c);
        assert(v.sharesOf(ALICE) + v.sharesOf(BOB) == v.totalShares());
    }

    function _roundTrip(bool roundUp, uint8 seed, uint8 gift, uint8 amount) internal returns (uint256 out) {
        ToyVault v = new ToyVault(roundUp);
        vm.prank(ALICE);
        v.deposit(seed);
        v.donate(gift);
        vm.prank(BOB);
        uint256 s = v.deposit(amount);
        vm.prank(BOB);
        out = v.redeem(s);
    }

    // 性质 2：存入再立刻赎回，用户不能获利。金额限制为 uint8，让求解器能完成乘除。
    function check_NoProfit_Buggy(uint8 seed, uint8 gift, uint8 amount) public {
        assert(_roundTrip(true, seed, gift, amount) <= amount);
    }

    function check_NoProfit_Fixed(uint8 seed, uint8 gift, uint8 amount) public {
        assert(_roundTrip(false, seed, gift, amount) <= amount);
    }

    // 缩小取值范围，让求解器能在限时内完成乘除证明
    function check_NoProfit_Fixed_Small(uint8 seed, uint8 gift, uint8 amount) public {
        vm.assume(seed < 16 && gift < 16 && amount < 16);
        assert(_roundTrip(false, seed, gift, amount) <= amount);
    }

    // 复现 Halmos 给出的反例：seed=0xc6, gift=0xee, amount=0xc0
    function test_CounterexampleReplay() public {
        uint256 out = _roundTrip(true, 0xc6, 0xee, 0xc0);
        console.log("deposit 192, redeem gives", out);
        assertGt(out, 0xc0);
    }
}
