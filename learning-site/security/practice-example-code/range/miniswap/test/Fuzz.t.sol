// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MiniSwap, IERC20Minimal} from "../src/MiniSwap.sol";
import {MiniSwapFixed, IERC20Minimal as FixedERC20} from "../solution/MiniSwapFixed.sol";
import {MockToken} from "./mocks/MockTokens.sol";

interface IQuoter {
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external view returns (uint256);
    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) external view returns (uint256);
}

/// Stateless fuzz: each run is one fresh call with random arguments.
abstract contract QuoteFuzzBase is Test {
    IQuoter quoter;

    function testFuzz_QuotesAgree(uint256 amountIn) public view {
        uint256 reserve = 1_000_000e18;
        amountIn = bound(amountIn, 1e15, reserve / 2);
        uint256 out = quoter.getAmountOut(amountIn, reserve, reserve);
        uint256 needed = quoter.getAmountIn(out, reserve, reserve);
        // Both directions charge one fee, so buying `out` must cost about `amountIn`.
        assertGe(needed + amountIn / 100_000, amountIn, "exact-out is cheaper than exact-in");
    }
}

contract QuoteFuzzVulnerable is QuoteFuzzBase {
    function setUp() public {
        MockToken a = new MockToken("A");
        MockToken b = new MockToken("B");
        quoter = IQuoter(address(new MiniSwap(IERC20Minimal(address(a)), IERC20Minimal(address(b)), address(1))));
    }
}

contract QuoteFuzzFixed is QuoteFuzzBase {
    function setUp() public {
        MockToken a = new MockToken("A");
        MockToken b = new MockToken("B");
        quoter = IQuoter(address(new MiniSwapFixed(FixedERC20(address(a)), FixedERC20(address(b)), address(1))));
    }
}
