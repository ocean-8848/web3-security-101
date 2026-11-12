// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {EchoSigCheck} from "./EchoSigCheck.sol";

/// @notice Wrapped token on the destination chain. Only the minter can mint.
contract WrappedEcho {
    string public name;
    address public immutable minter;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(string memory name_, address minter_) {
        name = name_;
        minter = minter_;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "not minter");
        balanceOf[to] += amount;
        totalSupply += amount;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

/// @title EchoMinter
/// @notice Destination-chain side of the bridge. Mints wrapped tokens on signer approval.
contract EchoMinter is EchoSigCheck {
    address public immutable owner;
    mapping(address => WrappedEcho) public wrappedOf;
    mapping(uint256 => bool) public nonceUsed;

    event Minted(address indexed token, address indexed to, uint256 amount, uint256 nonce);

    constructor(address[] memory signers, uint256 threshold_) EchoSigCheck(signers, threshold_) {
        owner = msg.sender;
    }

    function setWrapped(address token, WrappedEcho wrapped) external {
        require(msg.sender == owner, "not owner");
        wrappedOf[token] = wrapped;
    }

    function mint(address token, address to, uint256 amount, uint256 nonce, bytes calldata signatures) external {
        require(!nonceUsed[nonce], "nonce used");
        nonceUsed[nonce] = true;
        _verify(messageHash(token, to, amount, nonce), signatures);
        wrappedOf[token].mint(to, amount);
        emit Minted(token, to, amount, nonce);
    }
}
