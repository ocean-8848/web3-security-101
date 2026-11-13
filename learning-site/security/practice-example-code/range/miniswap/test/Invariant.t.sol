// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {MiniSwap, IERC20Minimal} from "../src/MiniSwap.sol";
import {MiniSwapFixed, IERC20Minimal as FixedERC20} from "../solution/MiniSwapFixed.sol";
import {MockToken} from "./mocks/MockTokens.sol";

interface IPool {
    function reserve0() external view returns (uint256);
    function reserve1() external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function addLiquidity(uint256, uint256, uint256, uint256) external returns (uint256, uint256, uint256);
    function removeLiquidity(uint256, uint256, uint256, uint256) external returns (uint256, uint256);
    function swapExactIn(address, uint256, uint256, address, uint256) external returns (uint256);
    function swapExactOut(address, uint256, uint256, address, uint256) external returns (uint256);
    function collectProtocolFees() external;
}

/// The handler plays the roles of an LP, a trader and the fee collector with valid inputs.
contract MiniSwapHandler is Test {
    IPool public immutable pool;
    MockToken public immutable token0;
    MockToken public immutable token1;
    address public immutable collector;
    address public constant LP = address(0x1111);
    address public constant TRADER = address(0x2222);
    uint256 constant FAR = type(uint256).max;

    bool public kDropped;
    uint256 public swaps;
    uint256 public collects;

    constructor(IPool p, MockToken t0, MockToken t1, address feeCollector) {
        pool = p;
        token0 = t0;
        token1 = t1;
        collector = feeCollector;
        vm.startPrank(TRADER);
        t0.approve(address(p), FAR);
        t1.approve(address(p), FAR);
        vm.stopPrank();
        vm.startPrank(LP);
        t0.approve(address(p), FAR);
        t1.approve(address(p), FAR);
        vm.stopPrank();
    }

    function _k() internal view returns (uint256) {
        return pool.reserve0() * pool.reserve1();
    }

    function swapIn(bool zeroForOne, uint256 amount) external {
        MockToken tokenIn = zeroForOne ? token0 : token1;
        uint256 reserveIn = zeroForOne ? pool.reserve0() : pool.reserve1();
        if (reserveIn < 2) return;
        amount = bound(amount, 1, reserveIn / 2);
        tokenIn.mint(TRADER, amount);
        uint256 kBefore = _k();
        vm.prank(TRADER);
        pool.swapExactIn(address(tokenIn), amount, 0, TRADER, FAR);
        if (_k() < kBefore) kDropped = true;
        swaps++;
    }

    function swapOut(bool zeroForOne, uint256 amount) external {
        MockToken tokenIn = zeroForOne ? token0 : token1;
        uint256 reserveOut = zeroForOne ? pool.reserve1() : pool.reserve0();
        if (reserveOut < 2) return;
        amount = bound(amount, 1, reserveOut / 1_000_000 + 1);
        tokenIn.mint(TRADER, type(uint128).max);
        uint256 kBefore = _k();
        vm.prank(TRADER);
        pool.swapExactOut(address(tokenIn), amount, FAR, TRADER, FAR);
        if (_k() < kBefore) kDropped = true;
        swaps++;
    }

    function addLiquidity(uint256 amount0, uint256 amount1) external {
        amount0 = bound(amount0, 1e6, 1e27);
        amount1 = bound(amount1, 1e6, 1e27);
        token0.mint(LP, amount0);
        token1.mint(LP, amount1);
        vm.prank(LP);
        pool.addLiquidity(amount0, amount1, 0, FAR);
    }

    function removeLiquidity(uint256 shares) external {
        uint256 held = pool.balanceOf(LP);
        if (held == 0) return;
        shares = bound(shares, 1, held);
        vm.prank(LP);
        pool.removeLiquidity(shares, 0, 0, FAR);
    }

    function collectFees() external {
        vm.prank(collector);
        pool.collectProtocolFees();
        collects++;
    }
}

abstract contract InvariantBase is StdInvariant, Test {
    IPool pool;
    MockToken token0;
    MockToken token1;
    MiniSwapHandler handler;
    address constant COLLECTOR = address(0xC011);
    address constant SEEDER = address(0x3333);

    function _deployPool(address t0, address t1) internal virtual returns (IPool);

    function setUp() public {
        token0 = new MockToken("LOW");
        token1 = new MockToken("HIGH");
        pool = _deployPool(address(token0), address(token1));
        // Skewed on purpose: one side behaves like a 6-decimal token, the other like an 18-decimal token.
        token0.mint(SEEDER, 1e12);
        token1.mint(SEEDER, 1e24);
        vm.startPrank(SEEDER);
        token0.approve(address(pool), type(uint256).max);
        token1.approve(address(pool), type(uint256).max);
        pool.addLiquidity(1e12, 1e24, 0, type(uint256).max);
        vm.stopPrank();
        handler = new MiniSwapHandler(pool, token0, token1, COLLECTOR);
        targetContract(address(handler));
    }

    /// The pool must hold at least what its books say it holds.
    function invariant_BalanceCoversReserves() public view {
        assertGe(token0.balanceOf(address(pool)), pool.reserve0(), "reserve0 is not backed");
        assertGe(token1.balanceOf(address(pool)), pool.reserve1(), "reserve1 is not backed");
    }

    /// A swap must never shrink x * y.
    function invariant_SwapNeverShrinksK() public view {
        assertFalse(handler.kDropped(), "a swap reduced k");
    }

    /// LP shares: the dead shares, seeder and LP account for the whole supply.
    function invariant_SharesAddUp() public view {
        uint256 sum = pool.balanceOf(address(0xdEaD)) + pool.balanceOf(SEEDER) + pool.balanceOf(handler.LP());
        assertEq(sum, pool.totalSupply());
    }
}

contract HandlerInvariantVulnerable is InvariantBase {
    function _deployPool(address t0, address t1) internal override returns (IPool) {
        return IPool(address(new MiniSwap(IERC20Minimal(t0), IERC20Minimal(t1), COLLECTOR)));
    }
}

contract HandlerInvariantFixed is InvariantBase {
    function _deployPool(address t0, address t1) internal override returns (IPool) {
        return IPool(address(new MiniSwapFixed(FixedERC20(t0), FixedERC20(t1), COLLECTOR)));
    }
}

/// Open invariant test: no handler; the fuzzer calls the pool directly with random inputs.
contract OpenInvariant is StdInvariant, Test {
    MiniSwap pool;
    MockToken token0;
    MockToken token1;

    function setUp() public {
        token0 = new MockToken("A");
        token1 = new MockToken("B");
        pool = new MiniSwap(IERC20Minimal(address(token0)), IERC20Minimal(address(token1)), address(0xC011));
        token0.mint(address(this), 1_000e18);
        token1.mint(address(this), 1_000e18);
        token0.approve(address(pool), type(uint256).max);
        token1.approve(address(pool), type(uint256).max);
        pool.addLiquidity(1_000e18, 1_000e18, 0, type(uint256).max);
        targetContract(address(pool));
    }

    function invariant_open_BalanceCoversReserves() public view {
        assertGe(token0.balanceOf(address(pool)), pool.reserve0());
        assertGe(token1.balanceOf(address(pool)), pool.reserve1());
    }
}
