// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {MiniSwap, IERC20Minimal} from "../src/MiniSwap.sol";
import {MiniSwapFixed, IERC20Minimal as FixedERC20} from "../solution/MiniSwapFixed.sol";
import {MockToken, FeeOnTransferToken, RebasingToken} from "./mocks/MockTokens.sol";

contract MiniSwapPoC is Test {
    MockToken tokenA;
    MockToken tokenB;
    MiniSwap pool;
    address lp = makeAddr("lp");
    address trader = makeAddr("trader");
    address collector = makeAddr("collector");
    uint256 constant FAR = type(uint256).max;

    function setUp() public {
        vm.warp(1_000_000);
        tokenA = new MockToken("A");
        tokenB = new MockToken("B");
        pool = _deploy(tokenA, tokenB, 1_000e18, 1_000e18);
    }

    function _deploy(MockToken a, MockToken b, uint256 amountA, uint256 amountB) internal returns (MiniSwap p) {
        p = new MiniSwap(IERC20Minimal(address(a)), IERC20Minimal(address(b)), collector);
        a.mint(lp, amountA);
        b.mint(lp, amountB);
        vm.startPrank(lp);
        a.approve(address(p), FAR);
        b.approve(address(p), FAR);
        p.addLiquidity(amountA, amountB, 0, FAR);
        vm.stopPrank();
    }

    function _fundTrader(MockToken t, address p, uint256 amount) internal {
        t.mint(trader, amount);
        vm.prank(trader);
        t.approve(p, FAR);
    }

    /// MS-01: exact-out charges 0.03% instead of 0.30%.
    function test_MS01_ExactOutUndercharges() public view {
        uint256 amountOut = 10e18;
        uint256 charged = pool.getAmountIn(amountOut, 1_000e18, 1_000e18);
        uint256 correct = (1_000e18 * amountOut * 10_000) / ((1_000e18 - amountOut) * 9_970);
        console2.log("charged by getAmountIn:", charged);
        console2.log("correct at 0.30% fee  :", correct);
        console2.log("LP fee lost per swap  :", correct - charged);
        assertLt(charged, correct);
        assertApproxEqRel(correct - charged, (correct * 27) / 10_000, 0.01e18);
    }

    /// MS-02: collecting protocol fees removes tokens that the reserves still count.
    function test_MS02_CollectBreaksReserveBacking() public {
        _fundTrader(tokenA, address(pool), 100e18);
        vm.prank(trader);
        pool.swapExactIn(address(tokenA), 100e18, 0, trader, FAR);

        assertEq(tokenA.balanceOf(address(pool)), pool.reserve0()); // still in sync

        vm.prank(collector);
        pool.collectProtocolFees();

        assertLt(tokenA.balanceOf(address(pool)), pool.reserve0()); // the books now overstate
        console2.log("reserve0 :", pool.reserve0());
        console2.log("balance0 :", tokenA.balanceOf(address(pool)));

        // The last LP cannot exit: the pool tries to pay out more than it holds.
        uint256 shares = pool.balanceOf(lp);
        vm.prank(lp);
        vm.expectRevert();
        pool.removeLiquidity(shares, 0, 0, FAR);
    }

    /// MS-03: getAmountIn rounds down; a thin-side input can round to zero.
    function test_MS03_RoundingGivesFreeOutput() public {
        // The same shape as a 6-decimal token paired with an 18-decimal token.
        MockToken low = new MockToken("LOW");
        MockToken high = new MockToken("HIGH");
        MiniSwap skewed = _deploy(low, high, 1e12, 1e24);

        uint256 kBefore = skewed.reserve0() * skewed.reserve1();
        vm.prank(trader);
        uint256 paid = skewed.swapExactOut(address(low), 1e11, 0, trader, FAR);

        assertEq(paid, 0);
        assertEq(high.balanceOf(trader), 1e11);
        assertLt(skewed.reserve0() * skewed.reserve1(), kBefore);
    }

    /// MS-04: an expired exact-out swap and an expired deposit both succeed.
    function test_MS04_DeadlineIgnored() public {
        uint256 expired = block.timestamp - 1;
        _fundTrader(tokenA, address(pool), 100e18);

        vm.prank(trader);
        pool.swapExactOut(address(tokenA), 1e18, FAR, trader, expired);
        assertEq(tokenB.balanceOf(trader), 1e18);

        tokenA.mint(lp, 1e18);
        tokenB.mint(lp, 2e18);
        vm.prank(lp);
        pool.addLiquidity(1e18, 2e18, 0, expired);
    }

    /// MS-05: a fee-on-transfer token leaves reserves above real balance.
    function test_MS05_FeeOnTransferOverstatesReserve() public {
        FeeOnTransferToken fee = new FeeOnTransferToken();
        MockToken other = new MockToken("O");
        MiniSwap p = _deploy(MockToken(address(fee)), other, 1_000e18, 1_000e18);

        console2.log("reserve0 :", p.reserve0());
        console2.log("balance0 :", fee.balanceOf(address(p)));
        assertEq(p.reserve0() - fee.balanceOf(address(p)), 10e18);

        uint256 shares = p.balanceOf(lp);
        vm.prank(lp);
        vm.expectRevert();
        p.removeLiquidity(shares, 0, 0, FAR);
    }

    /// MS-06: a negative rebase traps LPs; a positive rebase is never credited.
    function test_MS06_RebaseDesyncsReserve() public {
        RebasingToken rebasing = new RebasingToken();
        MockToken other = new MockToken("O");
        MiniSwap p = _deploy(MockToken(address(rebasing)), other, 1_000e18, 1_000e18);

        rebasing.rebase(address(p), 900e18); // -10%
        assertEq(p.reserve0(), 1_000e18);

        uint256 shares = p.balanceOf(lp);
        vm.prank(lp);
        vm.expectRevert();
        p.removeLiquidity(shares, 0, 0, FAR);

        rebasing.rebase(address(p), 1_100e18); // +22%: the extra 100e18 belongs to nobody
        vm.prank(lp);
        p.removeLiquidity(shares, 0, 0, FAR);
        console2.log("stuck in pool after the LP left:", rebasing.balanceOf(address(p)));
        assertGt(rebasing.balanceOf(address(p)), 100e18 - 1);
    }
}

contract MiniSwapFixTest is Test {
    MockToken tokenA;
    MockToken tokenB;
    MiniSwapFixed pool;
    address lp = makeAddr("lp");
    address trader = makeAddr("trader");
    address collector = makeAddr("collector");
    uint256 constant FAR = type(uint256).max;

    function setUp() public {
        vm.warp(1_000_000);
        tokenA = new MockToken("A");
        tokenB = new MockToken("B");
        pool = _deploy(tokenA, tokenB, 1_000e18, 1_000e18);
    }

    function _deploy(MockToken a, MockToken b, uint256 amountA, uint256 amountB) internal returns (MiniSwapFixed p) {
        p = new MiniSwapFixed(FixedERC20(address(a)), FixedERC20(address(b)), collector);
        a.mint(lp, amountA);
        b.mint(lp, amountB);
        vm.startPrank(lp);
        a.approve(address(p), FAR);
        b.approve(address(p), FAR);
        p.addLiquidity(amountA, amountB, 0, FAR);
        vm.stopPrank();
    }

    function _fundTrader(MockToken t, address p, uint256 amount) internal {
        t.mint(trader, amount);
        vm.prank(trader);
        t.approve(p, FAR);
    }

    function test_Fix_MS01_ExactOutChargesFullFee() public view {
        uint256 amountOut = 10e18;
        uint256 correct = (1_000e18 * amountOut * 10_000) / ((1_000e18 - amountOut) * 9_970);
        assertEq(pool.getAmountIn(amountOut, 1_000e18, 1_000e18), correct + 1);
    }

    function test_Fix_MS02_CollectKeepsBacking() public {
        _fundTrader(tokenA, address(pool), 100e18);
        vm.prank(trader);
        pool.swapExactIn(address(tokenA), 100e18, 0, trader, FAR);
        vm.prank(collector);
        pool.collectProtocolFees();
        assertEq(tokenA.balanceOf(address(pool)), pool.reserve0());

        uint256 shares = pool.balanceOf(lp);
        vm.prank(lp);
        pool.removeLiquidity(shares, 0, 0, FAR);
    }

    function test_Fix_MS03_NoFreeOutput() public {
        MockToken low = new MockToken("LOW");
        MockToken high = new MockToken("HIGH");
        MiniSwapFixed skewed = _deploy(low, high, 1e12, 1e24);
        vm.prank(trader);
        vm.expectRevert(MiniSwapFixed.SlippageExceeded.selector);
        skewed.swapExactOut(address(low), 1e11, 0, trader, FAR);
    }

    function test_Fix_MS04_DeadlineEnforced() public {
        uint256 expired = block.timestamp - 1;
        vm.prank(trader);
        vm.expectRevert(MiniSwapFixed.Expired.selector);
        pool.swapExactOut(address(tokenA), 1e18, FAR, trader, expired);
        vm.prank(lp);
        vm.expectRevert(MiniSwapFixed.Expired.selector);
        pool.addLiquidity(1e18, 1e18, 0, expired);
    }

    function test_Fix_MS05_FeeOnTransferRejected() public {
        FeeOnTransferToken fee = new FeeOnTransferToken();
        MockToken other = new MockToken("O");
        MiniSwapFixed p = new MiniSwapFixed(FixedERC20(address(fee)), FixedERC20(address(other)), collector);
        fee.mint(lp, 1_000e18);
        other.mint(lp, 1_000e18);
        vm.startPrank(lp);
        fee.approve(address(p), FAR);
        other.approve(address(p), FAR);
        vm.expectRevert(MiniSwapFixed.UnsupportedToken.selector);
        p.addLiquidity(1_000e18, 1_000e18, 0, FAR);
        vm.stopPrank();
    }

    function test_Fix_MS06_SyncRecoversAfterRebase() public {
        RebasingToken rebasing = new RebasingToken();
        MockToken other = new MockToken("O");
        MiniSwapFixed p = _deploy(MockToken(address(rebasing)), other, 1_000e18, 1_000e18);
        rebasing.rebase(address(p), 900e18);
        p.sync();
        assertEq(p.reserve0(), 900e18);

        uint256 shares = p.balanceOf(lp);
        vm.prank(lp);
        p.removeLiquidity(shares, 0, 0, FAR);
    }
}
