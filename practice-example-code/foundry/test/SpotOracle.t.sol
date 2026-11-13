// SPDX-License-Identifier: MIT
// 配套章节：08 预言机与闪电贷 ｜ 被测合约：practice-example-code/04-SpotOracle.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {SpotPriceLending, FeedPriceLending, IPairLike, IAggregatorLike} from "handbook/04-SpotOracle.sol";
import {ToyERC20} from "../src/ToyERC20.sol";
import {ToyFeed} from "../src/ToyFeed.sol";

/// @notice 无手续费的恒定乘积玩具池。token0 = 抵押代币，token1 = 稳定币。
contract ToyPair is IPairLike {
    ToyERC20 public immutable col;
    ToyERC20 public immutable stable;
    uint112 r0;
    uint112 r1;

    constructor(ToyERC20 _col, ToyERC20 _stable, uint112 _r0, uint112 _r1) {
        col = _col;
        stable = _stable;
        r0 = _r0;
        r1 = _r1;
    }

    function getReserves() external view returns (uint112, uint112, uint32) {
        return (r0, r1, 0);
    }

    function buyCollateral(uint256 stableIn) external returns (uint256 out) {
        out = uint256(r0) - uint256(r0) * r1 / (uint256(r1) + stableIn);
        stable.transferFrom(msg.sender, address(this), stableIn);
        col.transfer(msg.sender, out);
        r1 += uint112(stableIn);
        r0 -= uint112(out);
    }

    function sellCollateral(uint256 colIn) external returns (uint256 out) {
        out = uint256(r1) - uint256(r0) * r1 / (uint256(r0) + colIn);
        col.transferFrom(msg.sender, address(this), colIn);
        stable.transfer(msg.sender, out);
        r0 += uint112(colIn);
        r1 -= uint112(out);
    }
}

interface IMaxBorrow {
    function maxBorrow(uint256 collateralAmt) external view returns (uint256);
}

/// @notice 示例合约只给出 maxBorrow。本借贷台把它接到真实放款上，才能观察资金损失。
contract ToyLendingDesk {
    IMaxBorrow public immutable source;
    ToyERC20 public immutable col;
    ToyERC20 public immutable stable;

    constructor(IMaxBorrow _source, ToyERC20 _col, ToyERC20 _stable) {
        source = _source;
        col = _col;
        stable = _stable;
    }

    function borrow(uint256 collateralAmt, uint256 amt) external {
        require(amt <= source.maxBorrow(collateralAmt), "exceeds max borrow");
        col.transferFrom(msg.sender, address(this), collateralAmt);
        stable.transfer(msg.sender, amt);
    }
}

contract SpotOracleTest is Test {
    uint256 constant FLASH = 900_000e18; // 示例：闪电贷规模；在测试中用铸造模拟
    uint256 constant POOL_COL = 1_000e18;
    uint256 constant POOL_STABLE = 100_000e18;

    ToyERC20 col;
    ToyERC20 stable;
    ToyPair pair;
    ToyFeed feed;
    SpotPriceLending spot;
    FeedPriceLending safe;
    ToyLendingDesk spotDesk;
    ToyLendingDesk feedDesk;
    address attacker = makeAddr("attacker");

    function setUp() public {
        vm.warp(1_000_000);
        col = new ToyERC20();
        stable = new ToyERC20();
        pair = new ToyPair(col, stable, uint112(POOL_COL), uint112(POOL_STABLE));
        col.mint(address(pair), POOL_COL);
        stable.mint(address(pair), POOL_STABLE);

        feed = new ToyFeed(8, 100e8);
        spot = new SpotPriceLending(pair);
        safe = new FeedPriceLending(IAggregatorLike(address(feed)), IAggregatorLike(address(0)), 3600, 1e8, 1_000_000e8);

        spotDesk = new ToyLendingDesk(IMaxBorrow(address(spot)), col, stable);
        feedDesk = new ToyLendingDesk(IMaxBorrow(address(safe)), col, stable);
        stable.mint(address(spotDesk), 200_000e18);
        stable.mint(address(feedDesk), 200_000e18);

        col.mint(attacker, 20e18);
        stable.mint(attacker, FLASH);
        vm.startPrank(attacker);
        col.approve(address(pair), type(uint256).max);
        stable.approve(address(pair), type(uint256).max);
        col.approve(address(spotDesk), type(uint256).max);
        col.approve(address(feedDesk), type(uint256).max);
        vm.stopPrank();
    }

    function test_PoC_FlashSwapInflatesCollateralAndDrainsDesk() public {
        vm.startPrank(attacker);
        uint256 bought = pair.buyCollateral(FLASH);
        spotDesk.borrow(20e18, 150_000e18); // 抵押真实价值 2,000，示例
        pair.sellCollateral(bought);
        vm.stopPrank();
        assertGe(stable.balanceOf(attacker), FLASH + 150_000e18 - 1e18, "flash loan repaid, desk loan kept");
        assertEq(stable.balanceOf(address(spotDesk)), 50_000e18, "desk lost 150k");
    }

    function test_Fixed_FeedPriceIgnoresManipulatedReserves() public {
        vm.startPrank(attacker);
        pair.buyCollateral(FLASH);
        vm.expectRevert("exceeds max borrow");
        feedDesk.borrow(20e18, 150_000e18);
        vm.stopPrank();
        assertEq(stable.balanceOf(address(feedDesk)), 200_000e18);
    }

    function test_Fixed_RejectsStalePrice() public {
        vm.warp(block.timestamp + 3601);
        vm.expectRevert("stale price");
        safe.collateralPrice();
    }

    function test_Fixed_RejectsNonPositivePrice() public {
        feed.set(0, block.timestamp);
        vm.expectRevert("invalid price");
        safe.collateralPrice();
    }

    function test_Fixed_RejectsCircuitBound() public {
        feed.set(1e8, block.timestamp);
        vm.expectRevert("price at circuit bound");
        safe.collateralPrice();
    }

    function test_Fixed_SequencerDownAndGracePeriod() public {
        ToyFeed uptime = new ToyFeed(0, 0);
        FeedPriceLending l2 = new FeedPriceLending(IAggregatorLike(address(feed)), IAggregatorLike(address(uptime)), 3600, 1e8, 1_000_000e8);
        vm.expectRevert("grace period");
        l2.collateralPrice();
        uptime.set(1, block.timestamp);
        vm.expectRevert("sequencer down");
        l2.collateralPrice();
    }

    function testFuzz_SpotPriceMovesWithSwap(uint256 stableIn) public {
        stableIn = bound(stableIn, 1e18, FLASH);
        uint256 beforePrice = spot.collateralPrice();
        vm.prank(attacker);
        pair.buyCollateral(stableIn);
        assertGt(spot.collateralPrice(), beforePrice, "spot price is attacker controlled");
    }

    function testFuzz_FeedMaxBorrowIgnoresSwap(uint256 stableIn, uint256 amt) public {
        stableIn = bound(stableIn, 1e18, FLASH);
        amt = bound(amt, 1, 1_000_000e18);
        uint256 quoted = safe.maxBorrow(amt);
        vm.prank(attacker);
        pair.buyCollateral(stableIn);
        assertEq(safe.maxBorrow(amt), quoted);
    }
}
