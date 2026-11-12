// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ClammMath
/// @notice 集中流动性的最小教学实现。只用于理解原理，不能用于生产。
/// @dev tick 范围限制在 ±200000。价格精度由重复平方决定，低于 Uniswap 的 TickMath。
library ClammMath {
    uint256 internal constant Q96 = 2 ** 96;
    int24 internal constant MAX_DEMO_TICK = 200_000;
    uint256 internal constant SQRT_1_0001_Q96 = 79232123823359799118286999567;

    /// @notice 返回 sqrt(1.0001^tick) * 2^96
    function sqrtPriceAtTick(int24 tick) internal pure returns (uint160) {
        require(tick >= -MAX_DEMO_TICK && tick <= MAX_DEMO_TICK, "tick");
        uint256 n = tick < 0 ? uint256(uint24(-tick)) : uint256(uint24(tick));
        uint256 result = Q96;
        uint256 base = SQRT_1_0001_Q96;
        while (n > 0) {
            if (n & 1 == 1) result = (result * base) >> 96;
            base = (base * base) >> 96;
            n >>= 1;
        }
        if (tick < 0) result = (Q96 * Q96) / result;
        return uint160(result);
    }

    /// @notice 返回满足 sqrtPriceAtTick(t) <= p 的最大 t
    function tickAtSqrtPrice(uint160 p) internal pure returns (int24) {
        int24 lo = -MAX_DEMO_TICK;
        int24 hi = MAX_DEMO_TICK;
        while (lo < hi) {
            int24 mid = int24((int256(lo) + int256(hi) + 1) / 2);
            if ((int256(lo) + int256(hi) + 1) < 0 && (int256(lo) + int256(hi) + 1) % 2 != 0) mid -= 1;
            if (sqrtPriceAtTick(mid) <= p) lo = mid;
            else hi = mid - 1;
        }
        return lo;
    }

    /// @notice 512 位中间值的 a*b/d，向下取整
    function mulDiv(uint256 a, uint256 b, uint256 d) internal pure returns (uint256 result) {
        unchecked {
            uint256 lo = a * b;
            uint256 mm = mulmod(a, b, type(uint256).max);
            uint256 hi = mm - lo - (mm < lo ? 1 : 0);
            if (hi == 0) return lo / d;
            require(d > hi, "overflow");
            uint256 r = mulmod(a, b, d);
            hi -= r > lo ? 1 : 0;
            lo -= r;
            uint256 twos = d & (0 - d);
            d /= twos;
            lo /= twos;
            lo |= hi * ((0 - twos) / twos + 1);
            uint256 inv = (3 * d) ^ 2;
            for (uint256 i; i < 6; i++) inv *= 2 - d * inv;
            result = lo * inv;
        }
    }

    function mulDivUp(uint256 a, uint256 b, uint256 d) internal pure returns (uint256 result) {
        result = mulDiv(a, b, d);
        if (mulmod(a, b, d) > 0) result += 1;
    }

    /// @notice 价格区间 [pa, pb] 内的 token0 数量
    function amount0(uint160 pa, uint160 pb, uint128 L, bool roundUp) internal pure returns (uint256) {
        if (pa > pb) (pa, pb) = (pb, pa);
        uint256 num = uint256(L) << 96;
        uint256 diff = pb - pa;
        if (roundUp) {
            uint256 x = mulDivUp(num, diff, pb);
            return x / pa + (x % pa > 0 ? 1 : 0);
        }
        return mulDiv(num, diff, pb) / pa;
    }

    /// @notice 价格区间 [pa, pb] 内的 token1 数量
    function amount1(uint160 pa, uint160 pb, uint128 L, bool roundUp) internal pure returns (uint256) {
        if (pa > pb) (pa, pb) = (pb, pa);
        return roundUp ? mulDivUp(L, pb - pa, Q96) : mulDiv(L, pb - pa, Q96);
    }

    /// @notice 用 token0 换 token1 后的价格。价格向上取整，池子少付
    function nextPriceToken0In(uint160 p, uint128 L, uint256 amountIn) internal pure returns (uint160) {
        uint256 num = uint256(L) << 96;
        return uint160(mulDivUp(num, p, num + amountIn * p));
    }

    /// @notice 取整方向错误的版本。只用于对比实验
    function nextPriceToken0InWrong(uint160 p, uint128 L, uint256 amountIn) internal pure returns (uint160) {
        uint256 num = uint256(L) << 96;
        return uint160(mulDiv(num, p, num + amountIn * p));
    }

    /// @notice 手续费增长的区间内部值。减法故意允许回绕
    function feeGrowthInside(
        uint256 global,
        uint256 outsideLower,
        uint256 outsideUpper,
        bool currentAboveLower,
        bool currentBelowUpper
    ) internal pure returns (uint256 inside) {
        unchecked {
            uint256 below = currentAboveLower ? outsideLower : global - outsideLower;
            uint256 above = currentBelowUpper ? outsideUpper : global - outsideUpper;
            inside = global - below - above;
        }
    }

    /// @notice 由累计 tick 算时间加权平均 tick，向负无穷取整
    function meanTick(int56 cumulativeStart, int56 cumulativeEnd, uint32 elapsed) internal pure returns (int24) {
        int56 delta = cumulativeEnd - cumulativeStart;
        int56 span = int56(uint56(elapsed));
        int24 mean = int24(delta / span);
        if (delta < 0 && delta % span != 0) mean--;
        return mean;
    }
}
