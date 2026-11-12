// SPDX-License-Identifier: MIT
// 配套章节：12 跨链桥安全 ｜ 被测合约：src/CrossChainMessaging.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {BridgeMessage, SingleVerifierBridge, MultiVerifierBridge} from "../src/CrossChainMessaging.sol";

contract CrossChainTest is Test {
    uint256 constant SRC = 1111;
    uint256[] pks;
    address[] verifiers;
    SingleVerifierBridge single;
    MultiVerifierBridge multi;
    address payable attacker = payable(makeAddr("attacker"));
    address payable user = payable(makeAddr("user"));

    function setUp() public {
        // 按地址升序排列私钥，签名提交时需要这个顺序
        for (uint256 i = 1; i <= 5; i++) pks.push(0xB00 + i);
        for (uint256 i; i < pks.length; i++) {
            for (uint256 j = i + 1; j < pks.length; j++) {
                if (vm.addr(pks[j]) < vm.addr(pks[i])) (pks[i], pks[j]) = (pks[j], pks[i]);
            }
        }
        for (uint256 i; i < pks.length; i++) verifiers.push(vm.addr(pks[i]));
        single = new SingleVerifierBridge(verifiers[0]);
        multi = new MultiVerifierBridge(verifiers, 3);
        vm.deal(address(single), 100 ether);
        vm.deal(address(multi), 100 ether);
    }

    function _msg(address to, uint256 amount, uint256 nonce) internal view returns (BridgeMessage memory) {
        return BridgeMessage(SRC, block.chainid, nonce, to, amount);
    }

    function _sigs(BridgeMessage memory m, uint256[] memory keys) internal view returns (MultiVerifierBridge.Sig[] memory out) {
        out = new MultiVerifierBridge.Sig[](keys.length);
        bytes32 id = multi.digest(m);
        for (uint256 i; i < keys.length; i++) {
            (uint8 v, bytes32 r, bytes32 s) = vm.sign(keys[i], id);
            out[i] = MultiVerifierBridge.Sig(v, r, s);
        }
    }

    function _keys(uint256 n) internal view returns (uint256[] memory keys) {
        keys = new uint256[](n);
        for (uint256 i; i < n; i++) keys[i] = pks[i];
    }

    function test_PoC_OneLeakedKeyForgesMessage() public {
        BridgeMessage memory forged = _msg(attacker, 100 ether, 999); // 来源链没有对应的锁定记录
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pks[0], single.digest(forged));
        single.execute(forged, v, r, s);
        assertEq(attacker.balance, 100 ether, "bridge drained by one key");
    }

    function test_PoC_MessageReplaysOnSecondDeployment() public {
        SingleVerifierBridge other = new SingleVerifierBridge(verifiers[0]);
        vm.deal(address(other), 1 ether);
        BridgeMessage memory m = _msg(user, 1 ether, 1);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pks[0], single.digest(m));
        single.execute(m, v, r, s);
        other.execute(m, v, r, s);
        assertEq(user.balance, 2 ether);
    }

    function test_Fixed_OneLeakedKeyCannotForge() public {
        BridgeMessage memory forged = _msg(attacker, 100 ether, 999);
        MultiVerifierBridge.Sig[] memory sigs = _sigs(forged, _keys(1));
        vm.expectRevert("not enough signatures");
        multi.execute(forged, sigs);
        assertEq(address(multi).balance, 100 ether);
    }

    function test_Fixed_DuplicateSignatureCannotReachThreshold() public {
        BridgeMessage memory forged = _msg(attacker, 100 ether, 999);
        uint256[] memory keys = new uint256[](3);
        keys[0] = pks[0];
        keys[1] = pks[0];
        keys[2] = pks[0];
        MultiVerifierBridge.Sig[] memory sigs = _sigs(forged, keys);
        vm.expectRevert("unsorted or duplicate");
        multi.execute(forged, sigs);
    }

    function test_Fixed_OutsiderSignatureRejected() public {
        BridgeMessage memory forged = _msg(attacker, 100 ether, 999);
        uint256[] memory keys = new uint256[](3);
        keys[0] = 0xBAD1;
        keys[1] = 0xBAD2;
        keys[2] = 0xBAD3;
        MultiVerifierBridge.Sig[] memory sigs = _sigs(forged, keys);
        vm.expectRevert("unknown verifier");
        multi.execute(forged, sigs);
    }

    function test_Fixed_HonestMessageExecutesOnce() public {
        BridgeMessage memory m = _msg(user, 1 ether, 1);
        MultiVerifierBridge.Sig[] memory sigs = _sigs(m, _keys(3));
        multi.execute(m, sigs);
        assertEq(user.balance, 1 ether);
        vm.expectRevert("consumed");
        multi.execute(m, sigs);
    }

    function test_Fixed_WrongDestinationReverts() public {
        BridgeMessage memory m = BridgeMessage(SRC, block.chainid + 1, 1, user, 1 ether);
        MultiVerifierBridge.Sig[] memory sigs = _sigs(m, _keys(3));
        vm.expectRevert("wrong destination");
        multi.execute(m, sigs);
    }

    function test_Fixed_SecondDeploymentRejectsMessage() public {
        MultiVerifierBridge other = new MultiVerifierBridge(verifiers, 3);
        vm.deal(address(other), 1 ether);
        BridgeMessage memory m = _msg(user, 1 ether, 1);
        MultiVerifierBridge.Sig[] memory sigs = _sigs(m, _keys(3));
        // 摘要包含桥地址，恢复出的地址不是验证者
        vm.expectRevert("unknown verifier");
        other.execute(m, sigs);
    }

    function test_Limit_ThresholdKeysCanForge() public {
        // M-of-N 只抬高门槛。M 把私钥全部泄露时，桥仍然失守。
        BridgeMessage memory forged = _msg(attacker, 100 ether, 999);
        multi.execute(forged, _sigs(forged, _keys(3)));
        assertEq(attacker.balance, 100 ether);
    }

    function testFuzz_FewerThanThresholdAlwaysFails(uint8 leaked, uint256 amount, uint256 nonce) public {
        uint256 n = bound(leaked, 0, 2);
        amount = bound(amount, 1, 100 ether);
        BridgeMessage memory forged = _msg(attacker, amount, nonce);
        MultiVerifierBridge.Sig[] memory sigs = _sigs(forged, _keys(n));
        vm.expectRevert("not enough signatures");
        multi.execute(forged, sigs);
        assertEq(attacker.balance, 0);
    }
}
