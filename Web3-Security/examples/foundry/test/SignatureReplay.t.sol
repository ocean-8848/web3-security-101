// SPDX-License-Identifier: MIT
// 配套章节：09 MEV 与签名安全 ｜ 被测合约：examples/06-SignatureReplay.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VulnerableClaim, SafeClaim} from "handbook/06-SignatureReplay.sol";

contract SignatureReplayTest is Test {
    uint256 constant SECP_N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141;
    uint256 signerPk = 0xA11CE;
    address signer;
    address payable claimer = payable(makeAddr("claimer"));
    VulnerableClaim vuln;
    SafeClaim safe;

    function setUp() public {
        vm.warp(1_000_000);
        signer = vm.addr(signerPk);
        vuln = new VulnerableClaim(signer);
        safe = new SafeClaim(signer);
        vm.deal(address(vuln), 10 ether);
        vm.deal(address(safe), 10 ether);
    }

    function _vulnSig(address to, uint256 amount) internal view returns (uint8, bytes32, bytes32) {
        bytes32 h = keccak256(abi.encodePacked(to, amount));
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", h));
        return vm.sign(signerPk, digest);
    }

    function _digest(SafeClaim c, address to, uint256 amount, uint256 nonce, uint256 deadline) internal view returns (bytes32) {
        bytes32 structHash = keccak256(abi.encode(c.CLAIM_TYPEHASH(), to, amount, nonce, deadline));
        return keccak256(abi.encodePacked("\x19\x01", c.domainSeparator(), structHash));
    }

    function _flip(uint8 v, bytes32 s) internal pure returns (uint8, bytes32) {
        return (v == 27 ? 28 : 27, bytes32(SECP_N - uint256(s)));
    }

    function test_PoC_MalleableSignatureClaimsTwice() public {
        (uint8 v, bytes32 r, bytes32 s) = _vulnSig(claimer, 1 ether);
        vuln.claim(claimer, 1 ether, v, r, s);
        (uint8 v2, bytes32 s2) = _flip(v, s);
        vuln.claim(claimer, 1 ether, v2, r, s2);
        assertEq(claimer.balance, 2 ether, "one signature paid twice");
    }

    function test_PoC_ReplayOnAnotherDeployment() public {
        VulnerableClaim other = new VulnerableClaim(signer);
        vm.deal(address(other), 1 ether);
        (uint8 v, bytes32 r, bytes32 s) = _vulnSig(claimer, 1 ether);
        vuln.claim(claimer, 1 ether, v, r, s);
        other.claim(claimer, 1 ether, v, r, s);
        assertEq(claimer.balance, 2 ether);
    }

    function test_PoC_ZeroSignerAcceptsInvalidSignature() public {
        VulnerableClaim zero = new VulnerableClaim(address(0));
        vm.deal(address(zero), 1 ether);
        zero.claim(claimer, 1 ether, 0, bytes32(0), bytes32(0));
        assertEq(claimer.balance, 1 ether, "garbage signature accepted");
    }

    function test_Fixed_ReplayAndMalleabilityRevert() public {
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, _digest(safe, claimer, 1 ether, 0, deadline));
        safe.claim(claimer, 1 ether, deadline, v, r, s);
        (uint8 v2, bytes32 s2) = _flip(v, s);
        vm.expectRevert("high s");
        safe.claim(claimer, 1 ether, deadline, v2, r, s2);
        vm.expectRevert("bad sig"); // nonce 已变化，同一签名不再匹配
        safe.claim(claimer, 1 ether, deadline, v, r, s);
        assertEq(claimer.balance, 1 ether);
    }

    function test_Fixed_CrossDeploymentReverts() public {
        SafeClaim other = new SafeClaim(signer);
        vm.deal(address(other), 1 ether);
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, _digest(safe, claimer, 1 ether, 0, deadline));
        vm.expectRevert("bad sig");
        other.claim(claimer, 1 ether, deadline, v, r, s);
    }

    function test_Fixed_ChainForkReverts() public {
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, _digest(safe, claimer, 1 ether, 0, deadline));
        vm.chainId(block.chainid + 1);
        vm.expectRevert("bad sig");
        safe.claim(claimer, 1 ether, deadline, v, r, s);
    }

    function test_Fixed_ExpiredReverts() public {
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, _digest(safe, claimer, 1 ether, 0, deadline));
        vm.warp(deadline + 1);
        vm.expectRevert("expired");
        safe.claim(claimer, 1 ether, deadline, v, r, s);
    }

    function test_Fixed_ZeroSignerRejectedAtDeploy() public {
        vm.expectRevert("zero signer");
        new SafeClaim(address(0));
    }

    function testFuzz_WrongKeyNeverClaims(uint256 pk, uint96 amount) public {
        pk = bound(pk, 1, SECP_N - 1);
        vm.assume(pk != signerPk);
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, _digest(safe, claimer, amount, 0, deadline));
        vm.expectRevert("bad sig");
        safe.claim(claimer, amount, deadline, v, r, s);
    }
}
