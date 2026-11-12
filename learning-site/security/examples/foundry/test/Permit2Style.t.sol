// SPDX-License-Identifier: MIT
// 配套章节：09 MEV 与签名、19 用户诈骗 ｜ 被测合约：src/ToyPermit2.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ToyPermit2Vulnerable, ToyPermit2Safe} from "../src/ToyPermit2.sol";
import {ToyERC20} from "../src/ToyERC20.sol";

contract Permit2StyleTest is Test {
    uint256 constant OWNER_PK = 0xA11CE;
    address owner;
    address spender = makeAddr("spender");
    address attacker = makeAddr("attacker");
    ToyERC20 token;
    ToyPermit2Vulnerable vuln;
    ToyPermit2Safe safe;
    uint256 expiry;

    function setUp() public {
        vm.warp(1_000_000);
        expiry = block.timestamp + 1 days;
        owner = vm.addr(OWNER_PK);
        token = new ToyERC20();
        vuln = new ToyPermit2Vulnerable();
        safe = new ToyPermit2Safe();
        token.mint(owner, 1_000e18);
        vm.startPrank(owner);
        token.approve(address(vuln), type(uint256).max);
        token.approve(address(safe), type(uint256).max);
        vm.stopPrank();
    }

    function _vulnSig(uint256 amount) internal view returns (uint8, bytes32, bytes32) {
        return vm.sign(OWNER_PK, vuln.hashPermit(address(token), amount, expiry));
    }

    function _safePermit(uint256 amount, uint256 nonce, uint256 deadline) internal {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(OWNER_PK, safe.hashPermit(address(token), amount, expiry, nonce, spender, deadline));
        safe.permit(owner, address(token), spender, amount, expiry, nonce, deadline, v, r, s);
    }

    function test_PoC_RevokedSignatureReplayed() public {
        (uint8 v, bytes32 r, bytes32 s) = _vulnSig(100e18);
        vuln.permit(owner, address(token), spender, 100e18, expiry, v, r, s);
        vm.prank(spender);
        vuln.transferFrom(owner, spender, 100e18, address(token));
        vm.prank(owner);
        vuln.revoke(address(token), spender);
        // 同一签名再次提交
        vuln.permit(owner, address(token), spender, 100e18, expiry, v, r, s);
        vm.prank(spender);
        vuln.transferFrom(owner, spender, 100e18, address(token));
        assertEq(token.balanceOf(spender), 200e18, "one signature spent twice");
    }

    function test_Fixed_ReplayedSignatureReverts() public {
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(OWNER_PK, safe.hashPermit(address(token), 100e18, expiry, 0, spender, deadline));
        safe.permit(owner, address(token), spender, 100e18, expiry, 0, deadline, v, r, s);
        vm.expectRevert(ToyPermit2Safe.InvalidNonce.selector);
        safe.permit(owner, address(token), spender, 100e18, expiry, 0, deadline, v, r, s);
    }

    function test_Fixed_LockdownKillsUnusedSignature() public {
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(OWNER_PK, safe.hashPermit(address(token), 100e18, expiry, 0, spender, deadline));
        vm.prank(owner);
        safe.lockdown(address(token), spender);
        vm.expectRevert(ToyPermit2Safe.InvalidNonce.selector);
        safe.permit(owner, address(token), spender, 100e18, expiry, 0, deadline, v, r, s);
    }

    function test_PoC_SpenderNotBoundToSignature() public {
        (uint8 v, bytes32 r, bytes32 s) = _vulnSig(100e18);
        // 攻击者抢先提交，把 spender 换成自己
        vm.prank(attacker);
        vuln.permit(owner, address(token), attacker, 100e18, expiry, v, r, s);
        vm.prank(attacker);
        vuln.transferFrom(owner, attacker, 100e18, address(token));
        assertEq(token.balanceOf(attacker), 100e18);
    }

    function test_Fixed_SpenderSubstitutionReverts() public {
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(OWNER_PK, safe.hashPermit(address(token), 100e18, expiry, 0, spender, deadline));
        vm.prank(attacker);
        vm.expectRevert(ToyPermit2Safe.BadSignature.selector);
        safe.permit(owner, address(token), attacker, 100e18, expiry, 0, deadline, v, r, s);
    }

    function test_PoC_ExpiredAllowanceStillSpends() public {
        (uint8 v, bytes32 r, bytes32 s) = _vulnSig(100e18);
        vuln.permit(owner, address(token), spender, 100e18, expiry, v, r, s);
        vm.warp(expiry + 365 days);
        vm.prank(spender);
        vuln.transferFrom(owner, spender, 100e18, address(token));
        assertEq(token.balanceOf(spender), 100e18, "spent one year after expiry");
    }

    function test_Fixed_ExpiredAllowanceReverts() public {
        _safePermit(100e18, 0, block.timestamp + 1 hours);
        vm.warp(expiry + 1);
        vm.prank(spender);
        vm.expectRevert(ToyPermit2Safe.AllowanceExpired.selector);
        safe.transferFrom(owner, spender, 1, address(token));
    }

    function test_Fixed_ExpiredSignatureReverts() public {
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(OWNER_PK, safe.hashPermit(address(token), 100e18, expiry, 0, spender, deadline));
        vm.warp(deadline + 1);
        vm.expectRevert(ToyPermit2Safe.SignatureExpired.selector);
        safe.permit(owner, address(token), spender, 100e18, expiry, 0, deadline, v, r, s);
    }

    function test_Fixed_ChainReplayReverts() public {
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(OWNER_PK, safe.hashPermit(address(token), 100e18, expiry, 0, spender, deadline));
        vm.chainId(block.chainid + 1);
        vm.expectRevert(ToyPermit2Safe.BadSignature.selector);
        safe.permit(owner, address(token), spender, 100e18, expiry, 0, deadline, v, r, s);
    }

    function testFuzz_AnyTimeAfterExpiryReverts(uint256 delay, uint256 amount) public {
        delay = bound(delay, 1, 3650 days);
        amount = bound(amount, 1, 100e18);
        _safePermit(100e18, 0, block.timestamp + 1 hours);
        vm.warp(expiry + delay);
        vm.prank(spender);
        vm.expectRevert(ToyPermit2Safe.AllowanceExpired.selector);
        safe.transferFrom(owner, spender, amount, address(token));
    }

    function testFuzz_WrongNonceReverts(uint256 nonce) public {
        vm.assume(nonce != 0);
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(OWNER_PK, safe.hashPermit(address(token), 1e18, expiry, nonce, spender, deadline));
        vm.expectRevert(ToyPermit2Safe.InvalidNonce.selector);
        safe.permit(owner, address(token), spender, 1e18, expiry, nonce, deadline, v, r, s);
    }
}
