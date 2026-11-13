// SPDX-License-Identifier: MIT
// 配套章节：09 MEV 与签名安全 ｜ 交互实验：interactive/signature-replay-lab.html
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

/// @notice ❌ 漏洞版：签名只绑定 (to, amount)
contract VulnerableClaim {
    address public signer; // ❌ 若忘记初始化则为 address(0)
    mapping(bytes32 => bool) public usedSig;

    constructor(address _signer) { signer = _signer; }

    function claim(address to, uint256 amount, uint8 v, bytes32 r, bytes32 s) external {
        // ❌ 无 nonce、无 chainId、无合约地址、无 deadline、无函数意图
        bytes32 h = keccak256(abi.encodePacked(to, amount));
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", h));
        // ❌ 以签名字节作为已使用标记：翻转 s 值即可得到"新"签名（可塑性）
        bytes32 sigId = keccak256(abi.encodePacked(v, r, s));
        require(!usedSig[sigId], "used");
        usedSig[sigId] = true;
        // ❌ 无效签名时 ecrecover 返回 address(0)；若 signer 也为 0 则通过
        require(ecrecover(digest, v, r, s) == signer, "bad sig");
        payable(to).transfer(amount);
    }

    receive() external payable {}
}

/// @notice ✅ 修复版：EIP-712 域分隔符 + typehash + nonce + deadline + 低 s 检查
contract SafeClaim {
    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 public constant CLAIM_TYPEHASH =
        keccak256("Claim(address to,uint256 amount,uint256 nonce,uint256 deadline)");
    // secp256k1 曲线阶 n 的一半：s 必须 ≤ 该值（拒绝高 s，消除可塑性）
    uint256 private constant HALF_N =
        0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0;

    address public immutable signer;
    uint256 private immutable cachedChainId;
    bytes32 private immutable cachedDomainSeparator;
    mapping(address => uint256) public nonces;

    constructor(address _signer) {
        require(_signer != address(0), "zero signer"); // ✅
        signer = _signer;
        cachedChainId = block.chainid;
        cachedDomainSeparator = _buildDomainSeparator();
    }

    function _buildDomainSeparator() private view returns (bytes32) {
        return keccak256(abi.encode(
            DOMAIN_TYPEHASH, keccak256("SafeClaim"), keccak256("1"), block.chainid, address(this)));
    }

    /// @dev ✅ 链分叉后 chainid 变化时重新计算，防止分叉链重放
    function domainSeparator() public view returns (bytes32) {
        return block.chainid == cachedChainId ? cachedDomainSeparator : _buildDomainSeparator();
    }

    function claim(address to, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(block.timestamp <= deadline, "expired");                           // ✅ deadline
        bytes32 structHash = keccak256(abi.encode(CLAIM_TYPEHASH, to, amount, nonces[to], deadline));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator(), structHash));
        require(uint256(s) <= HALF_N, "high s");                                   // ✅ 可塑性
        require(v == 27 || v == 28, "bad v");
        address recovered = ecrecover(digest, v, r, s);
        require(recovered != address(0) && recovered == signer, "bad sig");        // ✅ 零地址
        nonces[to]++;                                                              // ✅ nonce（先改状态）
        (bool ok, ) = payable(to).call{value: amount}("");
        require(ok, "send failed");
    }

    receive() external payable {}
}
