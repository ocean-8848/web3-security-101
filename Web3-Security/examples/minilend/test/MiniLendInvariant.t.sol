// SPDX-License-Identifier: MIT
// 配套章节：audit/R25 实战项目 ｜ 只针对 MiniLendFixed
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MiniLendFixed} from "../src/MiniLendFixed.sol";
import {MiniLendProxy} from "../src/MiniLendProxy.sol";
import {IMiniLend, ToyUSD, ToyPriceFeed} from "./MiniLendHelpers.sol";

contract MiniLendHandler is Test {
    IMiniLend public immutable lend;
    ToyUSD public immutable usd;
    ToyPriceFeed public immutable feed;
    address[3] public actors;
    uint256 public immutable usdSeed;

    uint256 public ghostUsdIn;
    uint256 public ghostUsdOut;
    uint256 public ghostPrincipal; // 借出减去偿还，不计利息
    uint256 public ghostBorrows;
    uint256 public ghostWithdraws;
    uint256 public ghostLiquidations;
    bool public ghostFreeBorrow;
    bool public ghostUnsafeExit;

    constructor(IMiniLend _lend, ToyUSD _usd, ToyPriceFeed _feed, uint256 _usdSeed) {
        lend = _lend;
        usd = _usd;
        feed = _feed;
        usdSeed = _usdSeed;
        for (uint256 i; i < 3; i++) {
            actors[i] = address(uint160(0xB000 + i));
            vm.deal(actors[i], 1_000_000 ether);
            usd.mint(actors[i], 1e30);
            vm.prank(actors[i]);
            usd.approve(address(lend), type(uint256).max);
        }
        usd.mint(address(this), 1e30);
        usd.approve(address(lend), type(uint256).max);
    }

    function actorAt(uint256 i) external view returns (address) {
        return actors[i];
    }

    function deposit(uint256 who, uint256 amt) external {
        amt = bound(amt, 1, 100 ether);
        vm.prank(actors[who % 3]);
        lend.deposit{value: amt}();
    }

    function borrow(uint256 who, uint256 amt) external {
        address a = actors[who % 3];
        lend.accrue();
        uint256 debt = lend.debtOf(a);
        uint256 cap = lend.maxBorrow(a);
        if (cap <= debt + 2) return;
        amt = bound(amt, 1, cap - debt - 2);
        vm.prank(a);
        lend.borrow(amt);
        ghostBorrows++;
        ghostUsdOut += amt;
        ghostPrincipal += amt;
        if (lend.debtOf(a) < debt + amt) ghostFreeBorrow = true;
        if (lend.debtOf(a) > lend.maxBorrow(a)) ghostUnsafeExit = true;
    }

    function repay(uint256 who, uint256 amt) external {
        address a = actors[who % 3];
        lend.accrue();
        uint256 debt = lend.debtOf(a);
        if (debt == 0) return;
        amt = bound(amt, 1, debt + 1e18);
        uint256 paid = amt >= debt ? debt : amt;
        if (amt < debt && amt * 1e27 / lend.borrowIndex() == 0) return; // 小于 1 份额的还款会回滚
        vm.prank(a);
        lend.repay(amt);
        ghostUsdIn += paid;
        ghostPrincipal -= paid > ghostPrincipal ? ghostPrincipal : paid;
    }

    function withdraw(uint256 who, uint256 amt) external {
        address a = actors[who % 3];
        uint256 c = lend.collateral(a);
        if (c == 0) return;
        amt = bound(amt, 1, c);
        vm.prank(a);
        lend.withdraw(amt); // 不健康的取款在此回滚，框架丢弃这次调用
        ghostWithdraws++;
        if (lend.debtShares(a) > 0 && lend.debtOf(a) > lend.maxBorrow(a)) ghostUnsafeExit = true;
    }

    function setPrice(uint256 p) external {
        feed.set(int256(bound(p, 500e8, 4_000e8)), block.timestamp);
    }

    function elapse(uint256 dt) external {
        vm.warp(block.timestamp + bound(dt, 1, 30 days));
        feed.set(feed.answer(), block.timestamp);
    }

    function liquidate(uint256 who) external {
        address a = actors[who % 3];
        lend.accrue();
        uint256 usdBefore = usd.balanceOf(address(this));
        try lend.liquidate(a) {
            ghostLiquidations++;
            uint256 paid = usdBefore - usd.balanceOf(address(this));
            ghostUsdIn += paid;
            ghostPrincipal -= paid > ghostPrincipal ? ghostPrincipal : paid;
        } catch {}
    }

    receive() external payable {}
}

contract MiniLendInvariantTest is Test {
    uint256 constant SEED = 1e30;
    IMiniLend lend;
    ToyUSD usd;
    ToyPriceFeed feed;
    MiniLendHandler handler;

    function setUp() public {
        vm.warp(1_000_000);
        usd = new ToyUSD();
        feed = new ToyPriceFeed(2_000e8);
        bytes memory init = abi.encodeCall(IMiniLend.initialize, (address(usd), address(feed), address(this)));
        lend = IMiniLend(address(new MiniLendProxy(address(new MiniLendFixed()), init)));
        usd.mint(address(lend), SEED);
        handler = new MiniLendHandler(lend, usd, feed, SEED);
        for (uint256 i; i < 3; i++) handler.deposit(i, 50 ether); // 每个账户先有抵押品，避免调用空跑
        targetContract(address(handler));
        bytes4[] memory selectors = new bytes4[](7);
        selectors[0] = MiniLendHandler.deposit.selector;
        selectors[1] = MiniLendHandler.borrow.selector;
        selectors[2] = MiniLendHandler.repay.selector;
        selectors[3] = MiniLendHandler.withdraw.selector;
        selectors[4] = MiniLendHandler.setPrice.selector;
        selectors[5] = MiniLendHandler.elapse.selector;
        selectors[6] = MiniLendHandler.liquidate.selector;
        targetSelector(FuzzSelector({addr: address(handler), selectors: selectors}));
    }

    function _sum() internal view returns (uint256 coll, uint256 shares, uint256 debt) {
        for (uint256 i; i < 3; i++) {
            address a = handler.actorAt(i);
            coll += lend.collateral(a);
            shares += lend.debtShares(a);
            debt += lend.debtOf(a);
        }
    }

    /// @dev ETH 余额等于抵押品账本，重入和记账错误都会打破它
    function invariant_EthBalanceEqualsCollateralLedger() public view {
        (uint256 coll, , ) = _sum();
        assertEq(address(lend).balance, coll);
    }

    function invariant_DebtSharesSumToTotal() public view {
        (, uint256 shares, ) = _sum();
        assertEq(shares, lend.totalDebtShares());
    }

    function invariant_UsdBalanceMatchesFlows() public view {
        assertEq(usd.balanceOf(address(lend)), SEED + handler.ghostUsdIn() - handler.ghostUsdOut());
    }

    /// @dev 取整偏向协议：记录的债务不低于未偿本金
    function invariant_RecordedDebtCoversPrincipal() public view {
        (, , uint256 debt) = _sum();
        assertGe(debt, handler.ghostPrincipal());
    }

    function invariant_NoFreeBorrowNoUnsafeExit() public view {
        assertFalse(handler.ghostFreeBorrow());
        assertFalse(handler.ghostUnsafeExit());
    }
}
