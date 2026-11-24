// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "../src/Interfaces.sol";
import {WrappedEcho} from "../src/EchoMinter.sol";

/// @notice Fixed signature check. Each change is tagged with the finding it closes.
abstract contract EchoSigCheckFixed {
    uint256 internal constant HALF_N =
        0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0;
    bytes32 public constant MESSAGE_TYPEHASH = keccak256(
        "EchoMessage(uint8 direction,address token,address to,uint256 amount,uint256 nonce)"
    );
    bytes32 public constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");

    mapping(address => bool) public isSigner;
    uint256 public immutable threshold;

    constructor(address[] memory signers, uint256 threshold_) {
        require(threshold_ > 0 && threshold_ <= signers.length, "bad threshold");
        threshold = threshold_;
        for (uint256 i = 0; i < signers.length; i++) {
            isSigner[signers[i]] = true;
        }
    }

    /// EB-BRG-1: computed per call, so the value follows chainId and this contract.
    function domainSeparator() public view returns (bytes32) {
        return keccak256(abi.encode(DOMAIN_TYPEHASH, keccak256("EchoBridge"), block.chainid, address(this)));
    }

    function digestOf(uint8 direction, address token, address to, uint256 amount, uint256 nonce)
        public
        view
        returns (bytes32)
    {
        bytes32 structHash = keccak256(abi.encode(MESSAGE_TYPEHASH, direction, token, to, amount, nonce));
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator(), structHash));
    }

    function _verify(bytes32 digest, bytes calldata signatures) internal view {
        require(signatures.length == threshold * 65, "bad length");
        address last;
        for (uint256 i = 0; i < threshold; i++) {
            bytes32 r;
            bytes32 s;
            uint8 v;
            assembly {
                let entry := add(signatures.offset, mul(i, 65))
                r := calldataload(entry)
                s := calldataload(add(entry, 32))
                v := byte(0, calldataload(add(entry, 64)))
            }
            require(uint256(s) <= HALF_N, "high s"); // EB-MEV-3
            address signer = ecrecover(digest, v, r, s);
            require(signer > last && isSigner[signer], "bad signer order"); // EB-BRG-8: strictly ascending
            last = signer;
        }
    }
}

contract EchoVaultFixed is EchoSigCheckFixed {
    uint8 public constant RELEASE = 1;
    uint256 public lockNonce;
    mapping(uint256 => bool) public nonceUsed; // EB-BRG-2: tracks the signed nonce

    event Locked(address indexed token, address indexed from, address indexed recipient, uint256 amount, uint256 nonce);
    event Released(address indexed token, address indexed to, uint256 amount, uint256 nonce);

    constructor(address[] memory signers, uint256 threshold_) EchoSigCheckFixed(signers, threshold_) {}

    /// EB-ACC-4: lockAndCall is removed. The vault makes no caller-chosen calls.
    function lock(address token, uint256 amount, address recipient) external {
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "transfer failed");
        emit Locked(token, msg.sender, recipient, amount, lockNonce++);
    }

    function release(address token, address to, uint256 amount, uint256 nonce, bytes calldata signatures) external {
        require(!nonceUsed[nonce], "nonce used");
        nonceUsed[nonce] = true;
        _verify(digestOf(RELEASE, token, to, amount, nonce), signatures);
        require(IERC20(token).transfer(to, amount), "transfer failed");
        emit Released(token, to, amount, nonce);
    }
}

contract EchoMinterFixed is EchoSigCheckFixed {
    uint8 public constant MINT = 2;
    uint256 public constant WINDOW = 1 days;
    address public immutable owner;
    uint256 public immutable mintCapPerWindow; // EB-BRG-7: limits loss after a signer compromise
    mapping(address => WrappedEcho) public wrappedOf;
    mapping(uint256 => bool) public nonceUsed;
    uint256 public windowStart;
    uint256 public mintedInWindow;

    event Minted(address indexed token, address indexed to, uint256 amount, uint256 nonce);

    constructor(address[] memory signers, uint256 threshold_, uint256 cap) EchoSigCheckFixed(signers, threshold_) {
        owner = msg.sender;
        mintCapPerWindow = cap;
    }

    function setWrapped(address token, WrappedEcho wrapped) external {
        require(msg.sender == owner, "not owner");
        wrappedOf[token] = wrapped;
    }

    function mint(address token, address to, uint256 amount, uint256 nonce, bytes calldata signatures) external {
        require(!nonceUsed[nonce], "nonce used");
        nonceUsed[nonce] = true;
        _verify(digestOf(MINT, token, to, amount, nonce), signatures);
        if (block.timestamp >= windowStart + WINDOW) {
            windowStart = block.timestamp;
            mintedInWindow = 0;
        }
        mintedInWindow += amount;
        require(mintedInWindow <= mintCapPerWindow, "rate limit");
        wrappedOf[token].mint(to, amount);
        emit Minted(token, to, amount, nonce);
    }
}

/// @notice EB-L2-1: uses `new`, which the compiler lowers for each target VM.
/// The contract does not assert an EVM address formula. Off-chain tooling records each chain's address.
contract EchoFactoryFixed {
    event Deployed(address indexed token, bytes32 indexed salt);

    function deploy(string calldata name, address minter, bytes32 salt) external returns (WrappedEcho token) {
        token = new WrappedEcho{salt: salt}(name, minter);
        emit Deployed(address(token), salt);
    }
}
