// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {PointsBank} from "../src/b03/PointsBank.sol";

contract FeeFuzzDemo is Test {
    PointsBank bank = new PointsBank();

    /// 这个性质是错的：小额的手续费向下取整后等于 0。
    function testFuzz_FeeIsNeverZero(uint256 amount) public view {
        amount = bound(amount, 1, 1e24);
        assertGt(bank.feeOf(amount), 0);
    }
}
