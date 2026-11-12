// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {BootToken} from "../../src/b04/BootToken.sol";
import {MiniVault} from "../../src/b04/MiniVault.sol";
import {FeeToken} from "../../src/b04/mocks/FeeToken.sol";

contract MiniVaultTest is Test {
    BootToken token;
    MiniVault vault;
    address alice = makeAddr("alice");

    function setUp() public {
        token = new BootToken(1_000 ether);
        vault = new MiniVault(token);
        token.transfer(alice, 100 ether);
    }

    function test_DepositNeedsApprove() public {
        vm.prank(alice);
        vm.expectRevert();
        vault.deposit(10 ether);
    }

    function test_ApproveDepositWithdraw() public {
        vm.startPrank(alice);
        token.approve(address(vault), 10 ether);
        vault.deposit(10 ether);
        assertEq(vault.balanceOf(alice), 10 ether);
        assertEq(token.allowance(alice, address(vault)), 0);

        vault.withdraw(4 ether);
        vm.stopPrank();

        assertEq(vault.balanceOf(alice), 6 ether);
        assertEq(token.balanceOf(alice), 94 ether);
    }

    function test_RevertWhen_WithdrawTooMuch() public {
        vm.startPrank(alice);
        token.approve(address(vault), 1 ether);
        vault.deposit(1 ether);
        vm.expectRevert(abi.encodeWithSelector(MiniVault.InsufficientBalance.selector, 1 ether, 2 ether));
        vault.withdraw(2 ether);
        vm.stopPrank();
    }

    function test_FeeTokenCreditsReceivedAmount() public {
        FeeToken fee = new FeeToken(1_000 ether);
        MiniVault feeVault = new MiniVault(fee);
        fee.approve(address(feeVault), 100 ether);
        feeVault.deposit(100 ether);
        assertEq(feeVault.balanceOf(address(this)), 99 ether);
        assertEq(fee.balanceOf(address(feeVault)), 99 ether);
    }
}
