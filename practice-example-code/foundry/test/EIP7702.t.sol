// SPDX-License-Identifier: MIT
// 配套章节：15 账户抽象与新型钱包 ｜ 被测合约：src/EIP7702Demo.sol
pragma solidity ^0.8.20;

import {Test, Vm} from "forge-std/Test.sol";
import {SweeperDelegate, SafeDelegate, DelegationGate, IERC20Lite} from "../src/EIP7702Demo.sol";
import {ToyERC20} from "../src/ToyERC20.sol";

/// @dev 委托在 setUp 中完成。setUp 的状态由框架保存，再进入各测试函数。
///      这是 Foundry 内最接近"下一笔交易"的做法；vm.roll 用来表示后续区块。
contract EIP7702Test is Test {
    uint256 constant ALICE_PK = 0xA11CE;
    address payable alice;
    address payable drainer = payable(makeAddr("drainer"));
    address attacker = makeAddr("attacker");
    SweeperDelegate sweeper;
    SafeDelegate safeImpl;
    DelegationGate gate;
    ToyERC20 token;

    function setUp() public {
        alice = payable(vm.addr(ALICE_PK));
        sweeper = new SweeperDelegate(drainer);
        safeImpl = new SafeDelegate();
        address[] memory ok = new address[](1);
        ok[0] = address(safeImpl);
        gate = new DelegationGate(ok);
        token = new ToyERC20();
        token.mint(alice, 100e18);
        vm.deal(alice, 10 ether);
        vm.signAndAttachDelegation(address(sweeper), ALICE_PK); // 钓鱼：受害者签了一次委托授权
    }

    function _tokens() internal view returns (IERC20Lite[] memory list) {
        list = new IERC20Lite[](1);
        list[0] = IERC20Lite(address(token));
    }

    function _designator(address impl) internal pure returns (bytes memory) {
        return abi.encodePacked(hex"ef0100", impl);
    }

    function test_PoC_AnyoneSweepsDelegatedEOA() public {
        vm.prank(attacker);
        SweeperDelegate(alice).sweep(_tokens());
        assertEq(alice.balance, 0, "ETH swept");
        assertEq(token.balanceOf(alice), 0, "token swept");
        assertEq(drainer.balance, 10 ether);
        assertEq(token.balanceOf(drainer), 100e18);
    }

    function test_PoC_DelegationPersistsAfterTheAuthorizingTx() public {
        // setUp 中的授权已经结束，委托标记仍在。
        assertEq(alice.code, _designator(address(sweeper)), "delegation persisted from setUp");
        vm.roll(block.number + 100);
        vm.warp(block.timestamp + 30 days);
        assertEq(alice.code, _designator(address(sweeper)), "still delegated later");
        // 之后转入的资金也被转走
        vm.deal(address(this), 1 ether);
        (bool ok, ) = alice.call{value: 1 ether}("");
        assertTrue(ok);
        assertEq(drainer.balance, 1 ether, "later deposit forwarded");
        assertEq(alice.balance, 10 ether);
    }

    function test_Fixed_ClearDelegationWithAddressZero() public {
        vm.signAndAttachDelegation(address(0), ALICE_PK);
        assertEq(alice.code.length, 0, "delegation cleared");
        vm.deal(address(this), 1 ether);
        (bool ok, ) = alice.call{value: 1 ether}("");
        assertTrue(ok);
        assertEq(alice.balance, 11 ether, "deposit stays");
        // 清除后，sweep 调用落在无代码账户上，什么也不发生
        vm.prank(attacker);
        (bool called, ) = alice.call(abi.encodeCall(SweeperDelegate.sweep, (_tokens())));
        assertTrue(called, "no code, no effect");
        assertEq(alice.balance, 11 ether);
        assertEq(token.balanceOf(alice), 100e18);
    }

    function _delegateSafe() internal {
        vm.signAndAttachDelegation(address(safeImpl), ALICE_PK);
    }

    function test_Fixed_SafeDelegateRejectsStrangerSweep() public {
        _delegateSafe();
        assertEq(alice.code, _designator(address(safeImpl)));
        bytes memory data = abi.encodeCall(ToyERC20.transfer, (attacker, 100e18));
        vm.startPrank(attacker);
        vm.expectRevert("not self");
        SafeDelegate(alice).executeSelf(address(token), 0, data);
        // 不是 alice 的签名
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(0xBAD, SafeDelegate(alice).digest(address(token), 0, data, block.timestamp));
        vm.expectRevert("not account owner");
        SafeDelegate(alice).execute(address(token), 0, data, block.timestamp, v, r, s);
        vm.stopPrank();
        assertEq(token.balanceOf(alice), 100e18);
    }

    function test_Fixed_SafeDelegateSignatureCannotReplay() public {
        _delegateSafe();
        address bob = makeAddr("bob");
        bytes memory data = abi.encodeCall(ToyERC20.transfer, (bob, 1e18));
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ALICE_PK, SafeDelegate(alice).digest(address(token), 0, data, deadline));
        vm.prank(attacker);
        SafeDelegate(alice).execute(address(token), 0, data, deadline, v, r, s);
        assertEq(token.balanceOf(bob), 1e18);
        assertEq(SafeDelegate(alice).nonce(), 1);
        vm.prank(attacker);
        vm.expectRevert("not account owner"); // nonce 变化后，恢复出的地址不再是 alice
        SafeDelegate(alice).execute(address(token), 0, data, deadline, v, r, s);
    }

    function test_Fixed_SafeDelegateRejectsExpiredSignature() public {
        _delegateSafe();
        bytes memory data = abi.encodeCall(ToyERC20.transfer, (attacker, 1e18));
        uint256 deadline = block.timestamp + 1;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ALICE_PK, SafeDelegate(alice).digest(address(token), 0, data, deadline));
        vm.warp(deadline + 1);
        vm.expectRevert("expired");
        SafeDelegate(alice).execute(address(token), 0, data, deadline, v, r, s);
    }

    function test_Gate_ReadsDelegationDesignator() public {
        assertEq(gate.delegateOf(alice), address(sweeper));
        assertFalse(gate.isAcceptable(alice), "unknown delegate rejected");
        _delegateSafe();
        assertTrue(gate.isAcceptable(alice), "approved delegate accepted");
        vm.signAndAttachDelegation(address(0), ALICE_PK);
        assertEq(gate.delegateOf(alice), address(0));
        assertTrue(gate.isAcceptable(alice), "plain EOA accepted");
    }

    function testFuzz_SafeDelegateRejectsAnyNonOwnerKey(uint256 pk, uint256 amt) public {
        pk = bound(pk, 1, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140);
        vm.assume(pk != ALICE_PK);
        amt = bound(amt, 1, 100e18);
        _delegateSafe();
        bytes memory data = abi.encodeCall(ToyERC20.transfer, (attacker, amt));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, SafeDelegate(alice).digest(address(token), 0, data, block.timestamp));
        vm.expectRevert("not account owner");
        SafeDelegate(alice).execute(address(token), 0, data, block.timestamp, v, r, s);
    }

    function testFuzz_SweeperTakesEverything(uint96 eth, uint96 tok) public {
        vm.deal(alice, eth);
        token.mint(alice, tok);
        uint256 total = token.balanceOf(alice);
        vm.prank(attacker);
        SweeperDelegate(alice).sweep(_tokens());
        assertEq(drainer.balance, eth);
        assertEq(token.balanceOf(drainer), total);
    }
}
