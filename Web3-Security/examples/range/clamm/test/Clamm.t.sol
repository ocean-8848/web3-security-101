// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import {ClammMath} from "../src/ClammMath.sol";
import {ToyBoundary} from "../src/ToyBoundary.sol";

contract ClammTest is Test {
    uint256 internal constant Q96 = 2 ** 96;

    function _near(uint256 got, uint256 want) internal pure {
        uint256 diff = got > want ? got - want : want - got;
        assertLe(diff, want >> 60, "relative error above 2^-60");
    }

    /// 期望值来自 Python Decimal 的 120 位精度计算
    function test_sqrtPriceMatchesHighPrecisionValues() public pure {
        assertEq(uint256(ClammMath.sqrtPriceAtTick(0)), Q96);
        _near(ClammMath.sqrtPriceAtTick(1), 79232123823359799118286999567);
        _near(ClammMath.sqrtPriceAtTick(-1), 79224201403219477170569942573);
        _near(ClammMath.sqrtPriceAtTick(1000), 83290069058676223003182343269);
        _near(ClammMath.sqrtPriceAtTick(-1000), 75364347830767020784054125654);
        _near(ClammMath.sqrtPriceAtTick(69082), 2505538923316343871269983126943);
        _near(ClammMath.sqrtPriceAtTick(200000), 1744244129640337381386292603617837);
        _near(ClammMath.sqrtPriceAtTick(-200000), 3598751819609688046946418);
    }

    function test_tickAtSqrtPriceFloors() public pure {
        uint160 p = ClammMath.sqrtPriceAtTick(1000);
        assertEq(int256(ClammMath.tickAtSqrtPrice(p)), int256(1000));
        assertEq(int256(ClammMath.tickAtSqrtPrice(p + 1)), int256(1000));
        assertEq(int256(ClammMath.tickAtSqrtPrice(p - 1)), int256(999));
        uint160 q = ClammMath.sqrtPriceAtTick(-1000);
        assertEq(int256(ClammMath.tickAtSqrtPrice(q)), int256(-1000));
    }

    function test_mulDivKeepsFullPrecision() public pure {
        assertEq(ClammMath.mulDiv(type(uint256).max, type(uint256).max, type(uint256).max), type(uint256).max);
        assertEq(ClammMath.mulDiv(2 ** 255, 2 ** 255, 2 ** 256 - 1), 2 ** 254);
    }

    function testFuzz_amountRoundingFavorsPool(uint160 pa, uint160 pb, uint128 L) public pure {
        pa = uint160(bound(pa, Q96 / 2, Q96 * 2));
        pb = uint160(bound(pb, Q96 / 2, Q96 * 2));
        L = uint128(bound(L, 1, type(uint96).max));
        assertLe(ClammMath.amount0(pa, pb, L, false), ClammMath.amount0(pa, pb, L, true));
        assertLe(ClammMath.amount1(pa, pb, L, false), ClammMath.amount1(pa, pb, L, true));
    }

    /// 正确取整：用户付的 token0 总能覆盖价格移动所需的 token0
    function testFuzz_correctRoundingNeverOwesPool(uint128 L, uint96 amountIn) public pure {
        L = uint128(bound(L, 1e12, 1e24));
        uint256 amt = bound(amountIn, 1, 1e18);
        uint160 p = uint160(Q96);
        uint160 next = ClammMath.nextPriceToken0In(p, L, amt);
        assertLe(ClammMath.amount0(next, p, L, true), amt);
    }

    /// 取整方向反过来：找到一个具体的数额，池子应收的 token0 超过用户实付
    function test_wrongRoundingUnderchargesUser() public pure {
        uint128 L = 1e18;
        uint160 p = uint160(Q96);
        uint256 worst;
        uint256 worstAmt;
        for (uint256 amt = 1; amt <= 2_000; amt++) {
            uint160 next = ClammMath.nextPriceToken0InWrong(p, L, amt);
            uint256 needed = ClammMath.amount0(next, p, L, true);
            if (needed > amt && needed - amt > worst) {
                worst = needed - amt;
                worstAmt = amt;
            }
        }
        console2.log("wrong rounding: amountIn", worstAmt);
        console2.log("wrong rounding: shortfall in wei", worst);
        assertGt(worst, 0);
    }

    function test_boundaryEqualityCheckDoubleCountsLiquidity() public {
        uint160 boundary = ClammMath.sqrtPriceAtTick(1000);
        uint128 base = 1_000e18;
        uint128 n = 500e18;
        ToyBoundary pool = new ToyBoundary(boundary, n, base + n, boundary - 1000, false);

        pool.moveUp(boundary + 1); // 价格越过边界 1 wei，但判断是 ==
        assertEq(uint256(pool.liquidity()), uint256(base) + n, "not crossed");
        pool.moveDown(boundary - 1000); // 回到边界以下，又加一次 net

        console2.log("buggy liquidity after round trip", pool.liquidity());
        assertEq(uint256(pool.liquidity()), uint256(base) + 2 * uint256(n), "double counted");
    }

    function test_boundaryGteCheckKeepsLiquidity() public {
        uint160 boundary = ClammMath.sqrtPriceAtTick(1000);
        uint128 base = 1_000e18;
        uint128 n = 500e18;
        ToyBoundary pool = new ToyBoundary(boundary, n, base + n, boundary - 1000, true);

        pool.moveUp(boundary + 1);
        assertEq(uint256(pool.liquidity()), uint256(base), "crossed");
        pool.moveDown(boundary - 1000);
        assertEq(uint256(pool.liquidity()), uint256(base) + n, "restored once");
    }

    function test_feeGrowthInsideSurvivesWraparound() public pure {
        unchecked {
            // 全局值已经回绕过一次，内部差值仍然正确
            uint256 outsideLower = type(uint256).max - 10;
            uint256 outsideUpper = 0;
            uint256 global = 89; // 相当于 max + 90
            uint256 inside = ClammMath.feeGrowthInside(global, outsideLower, outsideUpper, true, true);
            assertEq(inside, 100);
        }
    }

    function test_feeGrowthInsideFreezesOutOfRange() public pure {
        // 价格已到区间上方。上边界的 outside 记录跨越时的全局值
        uint256 inside = ClammMath.feeGrowthInside(500, 100, 200, true, false);
        assertEq(inside, 100, "fees earned before crossing");
        // 全局继续增长，区间内部值不变
        assertEq(ClammMath.feeGrowthInside(900, 100, 200, true, false), 100, "frozen");
    }

    function test_twapDampsOneBlockSpike() public pure {
        // 窗口 1800 秒：1788 秒 tick 0，最后 12 秒 tick 10000（示例）
        int56 end = 12 * 10_000;
        assertEq(int256(ClammMath.meanTick(0, end, 1800)), int256(66));
        // 窗口 60 秒：同样的尖峰影响放大 30 倍
        assertEq(int256(ClammMath.meanTick(0, end, 60)), int256(2000));
    }

    function test_twapRoundsTowardNegativeInfinity() public pure {
        assertEq(int256(ClammMath.meanTick(0, -1, 2)), int256(-1));
        assertEq(int256(ClammMath.meanTick(0, 1, 2)), int256(0));
    }

    function test_hookPermissionBitsExample() public pure {
        // v4 用地址低 14 位声明回调。BEFORE_SWAP = 1<<7，AFTER_SWAP = 1<<6
        uint160 hook = uint160(0x1234) << 14 | (1 << 7);
        assertTrue(hook & (1 << 7) != 0, "beforeSwap on");
        assertTrue(hook & (1 << 6) == 0, "afterSwap off");
    }
}
