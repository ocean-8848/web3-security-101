// SPDX-License-Identifier: MIT
// 配套章节：12 跨链桥安全
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

/// @notice 跨链消息：在来源链锁定，在目标链放款
struct BridgeMessage {
    uint256 srcChainId;
    uint256 dstChainId;
    uint256 nonce;
    address recipient;
    uint256 amount;
}

/// @notice ❌ 漏洞版：一把验证者私钥决定全部放款；摘要不绑定目标链和桥地址
contract SingleVerifierBridge {
    address public immutable verifier;
    mapping(bytes32 => bool) public consumed;

    constructor(address _verifier) {
        verifier = _verifier;
    }

    receive() external payable {}

    function digest(BridgeMessage calldata m) public pure returns (bytes32) {
        // ❌ 漏洞：没有 dstChainId 和 address(this)，同一条消息可以在别的部署上执行
        return keccak256(abi.encode(m.srcChainId, m.nonce, m.recipient, m.amount));
    }

    function execute(BridgeMessage calldata m, uint8 v, bytes32 r, bytes32 s) external {
        bytes32 id = digest(m);
        require(!consumed[id], "consumed");
        // ❌ 漏洞：单点信任。这把私钥泄露，攻击者可以伪造任意消息。
        require(ecrecover(id, v, r, s) == verifier, "bad verifier");
        consumed[id] = true;
        (bool ok, ) = m.recipient.call{value: m.amount}("");
        require(ok, "pay failed");
    }
}

/// @notice ✅ 修复版：M-of-N 验证者 + 目标链绑定 + 消息只消费一次
contract MultiVerifierBridge {
    mapping(address => bool) public isVerifier;
    uint256 public immutable threshold;
    mapping(bytes32 => bool) public consumed;

    struct Sig {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    constructor(address[] memory verifiers, uint256 _threshold) {
        require(_threshold > verifiers.length / 2 && _threshold <= verifiers.length, "bad threshold"); // ✅ 修复
        for (uint256 i; i < verifiers.length; i++) {
            require(verifiers[i] != address(0) && !isVerifier[verifiers[i]], "bad verifier set");
            isVerifier[verifiers[i]] = true;
        }
        threshold = _threshold;
    }

    receive() external payable {}

    function digest(BridgeMessage calldata m) public view returns (bytes32) {
        return keccak256(abi.encode(block.chainid, address(this), m.srcChainId, m.dstChainId, m.nonce, m.recipient, m.amount)); // ✅ 修复
    }

    function execute(BridgeMessage calldata m, Sig[] calldata sigs) external {
        require(m.dstChainId == block.chainid, "wrong destination"); // ✅ 修复
        bytes32 id = digest(m);
        require(!consumed[id], "consumed");
        require(sigs.length >= threshold, "not enough signatures"); // ✅ 修复
        address last;
        for (uint256 i; i < sigs.length; i++) {
            address signer = ecrecover(id, sigs[i].v, sigs[i].r, sigs[i].s);
            require(isVerifier[signer], "unknown verifier");
            require(signer > last, "unsorted or duplicate"); // ✅ 修复：同一验证者不能计两次
            last = signer;
        }
        consumed[id] = true;
        (bool ok, ) = m.recipient.call{value: m.amount}("");
        require(ok, "pay failed");
    }
}
