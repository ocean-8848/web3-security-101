// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// 本手册示例：求最高有效位（most significant bit）。
library BitMath {
    function msbBuggy(uint256 x) internal pure returns (uint256 r) {
        require(x > 0, "zero");
        if (x >= 2 ** 128) { x >>= 128; r += 128; }
        if (x > 2 ** 64) { x >>= 64; r += 64; } // ❌ 漏洞：边界值 2**64 落入错误分支
        if (x >= 2 ** 32) { x >>= 32; r += 32; }
        if (x >= 2 ** 16) { x >>= 16; r += 16; }
        if (x >= 2 ** 8) { x >>= 8; r += 8; }
        if (x >= 2 ** 4) { x >>= 4; r += 4; }
        if (x >= 2 ** 2) { x >>= 2; r += 2; }
        if (x >= 2 ** 1) { r += 1; }
    }

    function msbFixed(uint256 x) internal pure returns (uint256 r) {
        require(x > 0, "zero");
        if (x >= 2 ** 128) { x >>= 128; r += 128; }
        if (x >= 2 ** 64) { x >>= 64; r += 64; } // ✅ 修复
        if (x >= 2 ** 32) { x >>= 32; r += 32; }
        if (x >= 2 ** 16) { x >>= 16; r += 16; }
        if (x >= 2 ** 8) { x >>= 8; r += 8; }
        if (x >= 2 ** 4) { x >>= 4; r += 4; }
        if (x >= 2 ** 2) { x >>= 2; r += 2; }
        if (x >= 2 ** 1) { r += 1; }
    }
}
