// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {BitMath} from "../src/BitMath.sol";

contract BitMathTest is Test {
    function _isMsb(uint256 x, uint256 r) internal pure returns (bool) {
        return r < 256 && (x >> r) == 1;
    }

    // forge test 用随机输入跑；halmos 用符号输入跑（前缀 check_）
    function testFuzz_MsbBuggy(uint256 x) public pure {
        vm.assume(x > 0);
        assert(_isMsb(x, BitMath.msbBuggy(x)));
    }

    function check_MsbBuggy(uint256 x) public pure {
        vm.assume(x > 0);
        assert(_isMsb(x, BitMath.msbBuggy(x)));
    }

    function check_MsbFixed(uint256 x) public pure {
        vm.assume(x > 0);
        assert(_isMsb(x, BitMath.msbFixed(x)));
    }

    // 复现 Halmos 的反例
    function test_CounterexampleReplay() public {
        uint256 r = BitMath.msbBuggy(2 ** 64);
        console.log("msbBuggy(2**64) =", r);
        assertFalse(_isMsb(2 ** 64, r));
    }
}
