// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "snippets/03-VaultInflation.sol";

/// @notice 本地最小化测试代币（无外部依赖）
contract MockAsset is IERC20Min {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amt) external {
        balanceOf[to] += amt;
    }

    function approve(address spender, uint256 amt) external returns (bool) {
        allowance[msg.sender][spender] = amt;
        return true;
    }

    function transfer(address to, uint256 amt) external returns (bool) {
        require(balanceOf[msg.sender] >= amt, "bal");
        balanceOf[msg.sender] -= amt;
        balanceOf[to] += amt;
        return true;
    }

    function transferFrom(address from, address to, uint256 amt) external returns (bool) {
        require(balanceOf[from] >= amt, "bal");
        if (allowance[from][msg.sender] != type(uint256).max) {
            require(allowance[from][msg.sender] >= amt, "allow");
            allowance[from][msg.sender] -= amt;
        }
        balanceOf[from] -= amt;
        balanceOf[to] += amt;
        return true;
    }
}

/// @notice Echidna 风格属性测试合约（所有 `echidna_*` 函数返回 true 表示属性成立）
/// 用法：echidna test/FormalAndFuzzVault.t.sol --contract EchidnaVaultProperties --config echidna.yaml
contract EchidnaVaultProperties {
    MockAsset public asset;
    OffsetVault public vault;
    uint256 public ghostDeposited;
    uint256 public ghostWithdrawn;

    constructor() {
        asset = new MockAsset();
        vault = new OffsetVault(asset, 3);
        asset.mint(address(this), 1_000_000_000 ether);
        asset.approve(address(vault), type(uint256).max);
    }

    function action_deposit(uint96 rawAmount) external {
        uint256 amount = uint256(rawAmount) % 1_000_000 ether;
        if (amount == 0) return;
        vault.deposit(amount, 1);
        ghostDeposited += amount;
    }

    function action_redeem(uint96 rawShares) external {
        uint256 userShares = vault.sharesOf(address(this));
        if (userShares == 0) return;
        uint256 sharesToBurn = uint256(rawShares) % (userShares + 1);
        if (sharesToBurn == 0) return;
        uint256 assetsOut = vault.redeem(sharesToBurn, 0);
        ghostWithdrawn += assetsOut;
    }

    /// @notice 核心偿付不变量：累计取出资产绝不能超过累计存入资产
    function echidna_solvency_never_profit_from_rounding() public view returns (bool) {
        return ghostWithdrawn <= ghostDeposited;
    }

    /// @notice 账本一致不变量：金库总资产始终覆盖净存入
    function echidna_assets_cover_net_deposits() public view returns (bool) {
        return vault.totalAssets() + ghostWithdrawn >= ghostDeposited;
    }
}

/// @notice 兼容 Foundry (`forge test`) 与 Halmos 符号执行 (`halmos --contract FormalAndFuzzVaultTest`)
/// 约定：`check_*` 前缀函数可由 Halmos 直接做符号验证，同时可被 `forge test` 作为模糊测试执行
contract FormalAndFuzzVaultTest is Test {
    MockAsset internal asset;
    OffsetVault internal vault;
    EchidnaVaultProperties internal echidnaHarness;

    function setUp() public {
        asset = new MockAsset();
        vault = new OffsetVault(asset, 3);
        echidnaHarness = new EchidnaVaultProperties();
    }

    /// ✅ Halmos 符号执行 + Foundry Fuzz：单人“存入再全额赎回”绝不能靠舍入套利多拿资产
    function check_deposit_then_redeem_no_free_money(uint64 depositAmount) public {
        vm.assume(depositAmount > 0);
        asset.mint(address(this), depositAmount);
        asset.approve(address(vault), depositAmount);
        uint256 minted = vault.deposit(depositAmount, 1);
        uint256 returnedAssets = vault.redeem(minted, 0);
        assertLe(returnedAssets, depositAmount, "rounding profit detected");
    }

    /// ✅ Halmos 符号执行 + Foundry Fuzz：两人依次存入后各自全额赎回，总取回绝不超过总存入
    function check_two_users_solvency(uint64 aDeposit, uint64 bDeposit) public {
        vm.assume(aDeposit > 0 && bDeposit > 0);
        address alice = address(0xA11CE);
        address bob = address(0xB0B);

        asset.mint(alice, aDeposit);
        asset.mint(bob, bDeposit);

        vm.startPrank(alice);
        asset.approve(address(vault), aDeposit);
        uint256 sharesA = vault.deposit(aDeposit, 1);
        vm.stopPrank();

        vm.startPrank(bob);
        asset.approve(address(vault), bDeposit);
        uint256 sharesB = vault.deposit(bDeposit, 1);
        vm.stopPrank();

        vm.prank(alice);
        uint256 outA = vault.redeem(sharesA, 0);

        vm.prank(bob);
        uint256 outB = vault.redeem(sharesB, 0);

        assertLe(outA + outB, uint256(aDeposit) + uint256(bDeposit), "insolvent vault");
    }

    /// ✅ 验证 Echidna 属性桩在随机动作序列下成立
    function testFuzz_echidnaPropertiesHold(uint96 amt1, uint96 amt2, uint96 burn1) public {
        echidnaHarness.action_deposit(amt1);
        echidnaHarness.action_deposit(amt2);
        echidnaHarness.action_redeem(burn1);
        assertTrue(echidnaHarness.echidna_solvency_never_profit_from_rounding());
        assertTrue(echidnaHarness.echidna_assets_cover_net_deposits());
    }
}
