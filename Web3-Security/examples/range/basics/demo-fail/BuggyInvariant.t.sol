// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {PointsBankBuggy} from "../src/b03/PointsBankBuggy.sol";

contract BuggyHandler is Test {
    PointsBankBuggy public bank;
    address[3] public actors = [address(0xA1), address(0xA2), address(0xA3)];

    constructor(PointsBankBuggy _bank) {
        bank = _bank;
    }

    function mint(uint256 seed, uint256 amount) external {
        amount = bound(amount, 1, 1e24);
        vm.prank(actors[seed % 3]);
        bank.mint(amount);
    }

    function move(uint256 fromSeed, uint256 toSeed, uint256 amount) external {
        address from = actors[fromSeed % 3];
        amount = bound(amount, 0, bank.balances(from));
        vm.prank(from);
        bank.move(actors[toSeed % 3], amount);
    }
}

contract BuggyInvariantDemo is Test {
    PointsBankBuggy bank;
    BuggyHandler handler;

    function setUp() public {
        bank = new PointsBankBuggy();
        handler = new BuggyHandler(bank);
        targetContract(address(handler));
    }

    function invariant_SumOfBalancesEqualsTotal() public view {
        uint256 sum;
        for (uint256 i; i < 3; i++) {
            sum += bank.balances(handler.actors(i));
        }
        assertEq(sum, bank.totalPoints());
    }
}
