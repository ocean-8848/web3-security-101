// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "./Interfaces.sol";
import {EchoSigCheck} from "./EchoSigCheck.sol";

/// @title EchoVault
/// @notice Source-chain side of the bridge. Locks tokens and releases them on signer approval.
contract EchoVault is EchoSigCheck {
    uint256 public lockNonce;
    mapping(bytes32 => bool) public spent;

    event Locked(address indexed token, address indexed from, address indexed recipient, uint256 amount, uint256 nonce);
    event Released(address indexed token, address indexed to, uint256 amount, uint256 nonce);

    constructor(address[] memory signers, uint256 threshold_) EchoSigCheck(signers, threshold_) {}

    function lock(address token, uint256 amount, address recipient) public {
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "transfer failed");
        emit Locked(token, msg.sender, recipient, amount, lockNonce++);
    }

    /// @notice Locks tokens, then runs a follow-up call. Front ends use this for gas top-ups.
    function lockAndCall(address token, uint256 amount, address recipient, address target, bytes calldata data)
        external
    {
        lock(token, amount, recipient);
        (bool ok, ) = target.call(data);
        require(ok, "follow-up failed");
    }

    function release(address token, address to, uint256 amount, uint256 nonce, bytes calldata signatures) external {
        bytes32 id = keccak256(signatures);
        require(!spent[id], "already processed");
        spent[id] = true;
        _verify(messageHash(token, to, amount, nonce), signatures);
        require(IERC20(token).transfer(to, amount), "transfer failed");
        emit Released(token, to, amount, nonce);
    }
}
