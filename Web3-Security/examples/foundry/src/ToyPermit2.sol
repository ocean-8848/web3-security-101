// SPDX-License-Identifier: MIT
// 配套章节：09 MEV 与签名安全、19 用户诈骗 ｜ 交互实验：interactive/phishing-signature-lab.html
// 玩具实现，接口只借用 Permit2 的思路，不是 Uniswap 的 Permit2 代码。
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

interface IToken {
    function transferFrom(address from, address to, uint256 amt) external returns (bool);
}

/// @notice ❌ 漏洞版
contract ToyPermit2Vulnerable {
    struct Allowance {
        uint256 amount;
        uint256 expiration;
    }

    bytes32 public constant TYPEHASH = keccak256("Permit(address token,uint256 amount,uint256 expiration)");

    mapping(address => mapping(address => mapping(address => Allowance))) public allowance;

    function hashPermit(address token, uint256 amount, uint256 expiration) public pure returns (bytes32) {
        return keccak256(abi.encode(TYPEHASH, token, amount, expiration));
    }

    /// @dev ❌ 漏洞：无 nonce、无 spender、无 sigDeadline、无链和合约绑定
    function permit(address owner, address token, address spender, uint256 amount, uint256 expiration, uint8 v, bytes32 r, bytes32 s)
        external
    {
        require(ecrecover(hashPermit(token, amount, expiration), v, r, s) == owner, "bad sig");
        allowance[owner][token][spender] = Allowance(amount, expiration);
    }

    function revoke(address token, address spender) external {
        delete allowance[msg.sender][token][spender];
    }

    function transferFrom(address owner, address to, uint256 amount, address token) external {
        Allowance storage a = allowance[owner][token][msg.sender];
        // ❌ 漏洞：没有检查 a.expiration
        a.amount -= amount;
        require(IToken(token).transferFrom(owner, to, amount), "transfer failed");
    }
}

/// @notice ✅ 修复版：EIP-712 域、spender 绑定、递增 nonce、签名与额度双重过期、紧急撤销
contract ToyPermit2Safe {
    struct Allowance {
        uint256 amount;
        uint256 expiration;
        uint256 nonce;
    }

    error SignatureExpired();
    error AllowanceExpired();
    error InvalidNonce();
    error BadSignature();

    bytes32 private constant DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");
    bytes32 public constant TYPEHASH =
        keccak256("PermitSingle(address token,uint256 amount,uint256 expiration,uint256 nonce,address spender,uint256 sigDeadline)");

    mapping(address => mapping(address => mapping(address => Allowance))) public allowance;

    function domainSeparator() public view returns (bytes32) {
        return keccak256(abi.encode(DOMAIN_TYPEHASH, keccak256("ToyPermit2"), block.chainid, address(this)));
    }

    function hashPermit(address token, uint256 amount, uint256 expiration, uint256 nonce, address spender, uint256 sigDeadline)
        public
        view
        returns (bytes32)
    {
        bytes32 structHash = keccak256(abi.encode(TYPEHASH, token, amount, expiration, nonce, spender, sigDeadline));
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator(), structHash));
    }

    function permit(
        address owner,
        address token,
        address spender,
        uint256 amount,
        uint256 expiration,
        uint256 nonce,
        uint256 sigDeadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        if (block.timestamp > sigDeadline) revert SignatureExpired(); // ✅ 修复
        Allowance storage a = allowance[owner][token][spender];
        if (nonce != a.nonce) revert InvalidNonce(); // ✅ 修复：一次性
        address recovered = ecrecover(hashPermit(token, amount, expiration, nonce, spender, sigDeadline), v, r, s);
        if (recovered == address(0) || recovered != owner) revert BadSignature();
        a.amount = amount;
        a.expiration = expiration;
        a.nonce = nonce + 1;
    }

    /// @notice ✅ 修复：撤销额度，同时作废尚未使用的旧签名
    function lockdown(address token, address spender) external {
        Allowance storage a = allowance[msg.sender][token][spender];
        a.amount = 0;
        a.expiration = 0;
        a.nonce += 1;
    }

    function transferFrom(address owner, address to, uint256 amount, address token) external {
        Allowance storage a = allowance[owner][token][msg.sender];
        if (block.timestamp > a.expiration) revert AllowanceExpired(); // ✅ 修复
        a.amount -= amount;
        require(IToken(token).transferFrom(owner, to, amount), "transfer failed");
    }
}
