// SPDX-License-Identifier: MIT
// 配套章节：06 算术与精度、R24 ERC-4626 ｜ 被测合约：src/ERC4626Rounding.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IAsset, Toy4626, BadRounding4626, NaiveVaultAdapter, SafeVaultAdapter} from "../src/ERC4626Rounding.sol";
import {ToyERC20} from "../src/ToyERC20.sol";

contract ERC4626RoundingTest is Test {
    ToyERC20 token;
    address alice = makeAddr("alice");
    address attacker = makeAddr("attacker");

    function setUp() public {
        token = new ToyERC20();
    }

    function _seed(address spender, uint256 who) internal {
        address a = who == 0 ? alice : attacker;
        token.mint(a, 1e30);
        vm.prank(a);
        token.approve(spender, type(uint256).max);
    }

    /// @dev 把每份额价格抬高到约 1e6 wei，放大取整差
    function _pump(address vault) internal {
        token.mint(vault, 1e12);
    }

    function test_PoC_BadVaultWithdrawBurnsZeroShares() public {
        BadRounding4626 vault = new BadRounding4626(IAsset(address(token)));
        _seed(address(vault), 0);
        vm.prank(alice);
        vault.deposit(1e6);
        _pump(address(vault));
        uint256 taken;
        vm.startPrank(attacker); // 攻击者没有任何份额
        for (uint256 i; i < 10; i++) {
            uint256 dust = vault.convertToAssets(1) - 1; // 每轮之后每份额价格下降，重新读取
            vault.withdraw(dust);
            taken += dust;
        }
        vm.stopPrank();
        assertGt(taken, 0);
        assertEq(token.balanceOf(attacker), taken, "assets taken for free");
        assertEq(vault.balanceOf(attacker), 0);
    }

    function test_Fixed_WithdrawRoundsUpAndReverts() public {
        Toy4626 vault = new Toy4626(IAsset(address(token)));
        _seed(address(vault), 0);
        vm.prank(alice);
        vault.deposit(1e6);
        _pump(address(vault));
        uint256 dust = vault.convertToAssets(1) - 1;
        assertEq(vault.previewWithdraw(dust), 1, "at least one share");
        vm.prank(attacker);
        vm.expectRevert();
        vault.withdraw(dust);
    }

    function test_PoC_BadVaultMintUnderpays() public {
        BadRounding4626 vault = new BadRounding4626(IAsset(address(token)));
        _seed(address(vault), 0);
        vm.prank(alice);
        vault.deposit(1e6);
        _pump(address(vault));
        uint256 price = vault.previewMint(3);
        // 比例价值 = 3 × (资产 + 1) / (供应 + 1)。交叉相乘，避免再次取整。
        assertLt(price * (vault.totalSupply() + 1), 3 * (vault.totalAssets() + 1), "paid less than proportional value");
    }

    function test_PoC_NaiveAdapterLedgerUnderDebits() public {
        Toy4626 vault = new Toy4626(IAsset(address(token)));
        NaiveVaultAdapter adapter = new NaiveVaultAdapter(vault);
        _seed(address(adapter), 0);
        _seed(address(adapter), 1);
        vm.prank(alice);
        adapter.deposit(1e6);
        _pump(address(vault));

        uint256 before = token.balanceOf(attacker);
        vm.startPrank(attacker);
        adapter.deposit(3e6);
        uint256 ledger = adapter.sharesOf(attacker);
        uint256 dust = vault.convertToAssets(1) - 1;
        for (uint256 i; i < 50; i++) adapter.withdraw(dust); // 账本每次扣 0，金库每次烧 1 份额
        vm.stopPrank();

        assertEq(adapter.sharesOf(attacker), ledger, "ledger never debited");
        assertGt(token.balanceOf(attacker), before, "attacker profits");
        assertLt(vault.balanceOf(address(adapter)), adapter.sharesOf(alice) + adapter.sharesOf(attacker), "adapter insolvent");
    }

    function test_Fixed_SafeAdapterDebitsActualShares() public {
        Toy4626 vault = new Toy4626(IAsset(address(token)));
        SafeVaultAdapter adapter = new SafeVaultAdapter(vault);
        _seed(address(adapter), 0);
        _seed(address(adapter), 1);
        vm.prank(alice);
        adapter.deposit(1e6, 0);
        _pump(address(vault));

        uint256 before = token.balanceOf(attacker);
        vm.startPrank(attacker);
        adapter.deposit(3e6, 0);
        uint256 ledger = adapter.sharesOf(attacker);
        uint256 dust = vault.convertToAssets(1) - 1;
        for (uint256 i; i < ledger; i++) adapter.withdraw(dust, 1);
        assertEq(adapter.sharesOf(attacker), 0);
        vm.expectRevert(); // 账本已经扣完，同样的循环不能继续
        adapter.withdraw(dust, 1);
        vm.stopPrank();

        assertLe(token.balanceOf(attacker), before, "no profit");
        assertGe(vault.balanceOf(address(adapter)), adapter.sharesOf(alice), "alice remains backed");
    }

    function test_Fixed_SafeAdapterMaxSharesSlippage() public {
        Toy4626 vault = new Toy4626(IAsset(address(token)));
        SafeVaultAdapter adapter = new SafeVaultAdapter(vault);
        _seed(address(adapter), 0);
        vm.startPrank(alice);
        adapter.deposit(1e6, 0);
        vm.expectRevert("slippage");
        adapter.withdraw(1e5, 1);
        vm.stopPrank();
    }

    function testFuzz_PreviewsRoundAgainstUser(uint256 seed, uint256 yield_, uint256 amount) public {
        seed = bound(seed, 1, 1e24);
        yield_ = bound(yield_, 0, 1e24);
        amount = bound(amount, 1, 1e24);
        Toy4626 vault = new Toy4626(IAsset(address(token)));
        _seed(address(vault), 0);
        vm.prank(alice);
        vault.deposit(seed);
        token.mint(address(vault), yield_);
        assertGe(vault.previewWithdraw(amount), vault.convertToShares(amount));
        assertGe(vault.previewMint(amount), vault.convertToAssets(amount));
    }

    function testFuzz_DepositRedeemRoundTripNeverProfits(uint256 seed, uint256 yield_, uint256 amount) public {
        seed = bound(seed, 1, 1e24);
        yield_ = bound(yield_, 0, 1e24);
        amount = bound(amount, 1, 1e24);
        Toy4626 vault = new Toy4626(IAsset(address(token)));
        _seed(address(vault), 0);
        _seed(address(vault), 1);
        vm.prank(alice);
        vault.deposit(seed);
        token.mint(address(vault), yield_);
        uint256 before = token.balanceOf(attacker);
        vm.startPrank(attacker);
        uint256 shares = vault.deposit(amount);
        vault.redeem(shares);
        vm.stopPrank();
        assertLe(token.balanceOf(attacker), before);
    }
}

contract AdapterHandler is Test {
    SafeVaultAdapter public immutable adapter;
    Toy4626 public immutable vault;
    ToyERC20 public immutable token;
    address[3] public actors;

    constructor(SafeVaultAdapter _adapter, Toy4626 _vault, ToyERC20 _token) {
        adapter = _adapter;
        vault = _vault;
        token = _token;
        for (uint256 i; i < 3; i++) {
            actors[i] = address(uint160(0xA000 + i));
            token.mint(actors[i], 1e27);
            vm.prank(actors[i]);
            token.approve(address(adapter), type(uint256).max);
        }
    }

    function actorAt(uint256 i) external view returns (address) {
        return actors[i];
    }

    function deposit(uint256 who, uint256 amount) external {
        amount = bound(amount, 1, 1e24);
        vm.prank(actors[who % 3]);
        adapter.deposit(amount, 0);
    }

    function withdraw(uint256 who, uint256 amount) external {
        address a = actors[who % 3];
        uint256 bal = vault.convertToAssets(adapter.sharesOf(a));
        if (bal == 0) return;
        amount = bound(amount, 1, bal);
        vm.prank(a);
        adapter.withdraw(amount, type(uint256).max);
    }

    function addYield(uint256 amount) external {
        token.mint(address(vault), bound(amount, 0, 1e24));
    }
}

contract ERC4626AdapterInvariant is Test {
    ToyERC20 token;
    Toy4626 vault;
    SafeVaultAdapter adapter;
    AdapterHandler handler;

    function setUp() public {
        token = new ToyERC20();
        vault = new Toy4626(IAsset(address(token)));
        adapter = new SafeVaultAdapter(vault);
        handler = new AdapterHandler(adapter, vault, token);
        targetContract(address(handler));
        bytes4[] memory selectors = new bytes4[](3);
        selectors[0] = AdapterHandler.deposit.selector;
        selectors[1] = AdapterHandler.withdraw.selector;
        selectors[2] = AdapterHandler.addYield.selector;
        targetSelector(FuzzSelector({addr: address(handler), selectors: selectors}));
    }

    function invariant_LedgerFullyBackedByVaultShares() public view {
        uint256 sum;
        for (uint256 i; i < 3; i++) sum += adapter.sharesOf(handler.actorAt(i));
        assertEq(sum, adapter.totalLedgerShares());
        assertEq(vault.balanceOf(address(adapter)), sum);
    }
}
