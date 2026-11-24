// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title EchoSigCheck
/// @notice Shared m-of-n signature verification for the vault and the minter.
abstract contract EchoSigCheck {
    mapping(address => bool) public isSigner;
    uint256 public immutable threshold;

    constructor(address[] memory signers, uint256 threshold_) {
        require(threshold_ > 0 && threshold_ <= signers.length, "bad threshold");
        threshold = threshold_;
        for (uint256 i = 0; i < signers.length; i++) {
            isSigner[signers[i]] = true;
        }
    }

    /// @dev Message layout: token, recipient, amount, nonce. Each field takes 32 bytes.
    function messageHash(address token, address to, uint256 amount, uint256 nonce)
        public
        pure
        returns (bytes32 digest)
    {
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, token)
            mstore(add(ptr, 0x20), to)
            mstore(add(ptr, 0x40), amount)
            mstore(add(ptr, 0x60), nonce)
            digest := keccak256(ptr, 0x80)
        }
    }

    /// @dev `signatures` is a tight concatenation of 65-byte (r, s, v) entries.
    function _recoverAt(bytes calldata signatures, uint256 index, bytes32 digest)
        internal
        pure
        returns (address)
    {
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            let entry := add(signatures.offset, mul(index, 65))
            r := calldataload(entry)
            s := calldataload(add(entry, 32))
            v := byte(0, calldataload(add(entry, 64)))
        }
        return ecrecover(digest, v, r, s);
    }

    function _verify(bytes32 digest, bytes calldata signatures) internal view {
        require(signatures.length == threshold * 65, "bad length");
        uint256 approvals;
        for (uint256 i = 0; i < threshold; i++) {
            if (isSigner[_recoverAt(signatures, i, digest)]) approvals++;
        }
        require(approvals >= threshold, "not enough signers");
    }
}
