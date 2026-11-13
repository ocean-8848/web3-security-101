// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {PointsBank} from "../../src/b03/PointsBank.sol";

/// @notice 处理器（Handler）：把随机输入收窄成合法操作，并记账。
contract PointsHandler is Test {
    PointsBank public bank;
    address[3] public actors = [address(0xA1), address(0xA2), address(0xA3)];
    uint256 public ghostMinted;
    uint256 public ghostBurned;

    constructor(PointsBank _bank) {
        bank = _bank;
    }

    function _actor(uint256 seed) internal view returns (address) {
        return actors[seed % actors.length];
    }

    function mint(uint256 seed, uint256 amount) external {
        amount = bound(amount, 0, 1e24);
        vm.prank(_actor(seed));
        bank.mint(amount);
        ghostMinted += amount;
    }

    function burn(uint256 seed, uint256 amount) external {
        address who = _actor(seed);
        amount = bound(amount, 0, bank.balances(who));
        vm.prank(who);
        bank.burn(amount);
        ghostBurned += amount;
    }

    function move(uint256 fromSeed, uint256 toSeed, uint256 amount) external {
        address from = _actor(fromSeed);
        amount = bound(amount, 0, bank.balances(from));
        vm.prank(from);
        bank.move(_actor(toSeed), amount);
    }
}

contract PointsBankFuzzTest is Test {
    PointsBank bank;

    function setUp() public {
        bank = new PointsBank();
    }

    /// 无状态模糊测试：手续费永远不超过金额。
    function testFuzz_FeeNeverExceedsAmount(uint256 amount) public view {
        amount = bound(amount, 0, type(uint256).max / 3);
        assertLe(bank.feeOf(amount), amount);
    }

    /// 无状态模糊测试：转移后，双方余额之和不变。
    function testFuzz_MoveKeepsSum(address to, uint96 start, uint96 amount) public {
        vm.assume(to != address(this));
        amount = uint96(bound(amount, 0, start));
        bank.mint(start);
        bank.move(to, amount);
        assertEq(bank.balances(address(this)) + bank.balances(to), start);
    }
}

contract PointsBankInvariantTest is Test {
    PointsBank bank;
    PointsHandler handler;

    function setUp() public {
        bank = new PointsBank();
        handler = new PointsHandler(bank);
        targetContract(address(handler)); // 只让模糊器调用处理器
    }

    /// 不变量 1：所有用户余额之和等于总量。
    function invariant_SumOfBalancesEqualsTotal() public view {
        uint256 sum;
        for (uint256 i; i < 3; i++) {
            sum += bank.balances(handler.actors(i));
        }
        assertEq(sum, bank.totalPoints());
    }

    /// 不变量 2：总量等于累计铸造减累计销毁。
    function invariant_TotalMatchesGhost() public view {
        assertEq(bank.totalPoints(), handler.ghostMinted() - handler.ghostBurned());
    }
}
