// SPDX-License-Identifier: MIT
// 配套章节：05 访问控制与权限
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

/// @notice ❌ 漏洞版：集中展示四种常见权限缺陷
contract VulnerableWallet {
    address public owner;
    bool private initialized;

    // ❌ 漏洞 1：初始化函数没有保护，部署后任何人都能抢先调用；且可重复调用
    function initWallet(address _owner) external {
        owner = _owner;
        initialized = true;
    }

    // ❌ 漏洞 2：用 tx.origin 鉴权。owner 调用恶意合约时，恶意合约可以冒充 owner
    function withdrawAll(address payable to) external {
        require(tx.origin == owner, "not owner");
        to.transfer(address(this).balance);
    }

    // ❌ 漏洞 3：任意外部调用。若本合约持有代币授权，攻击者可构造 transferFrom
    function execute(address target, bytes calldata data) external returns (bytes memory) {
        (bool ok, bytes memory ret) = target.call(data);
        require(ok, "call failed");
        return ret;
    }

    // ❌ 漏洞 4：单步转移所有权。输错地址则权限永久丢失
    function transferOwnership(address newOwner) external {
        require(msg.sender == owner, "not owner");
        owner = newOwner;
    }

    receive() external payable {}
}

/// @notice 极简的一次性初始化修饰器（与 OpenZeppelin Initializable 原理相同）
abstract contract SimpleInitializable {
    bool private _initialized;

    modifier initializer() {
        require(!_initialized, "already initialized");
        _initialized = true;
        _;
    }

    /// @dev 实现合约在构造函数里调用，锁死实现合约本身
    function _disableInitializers() internal {
        _initialized = true;
    }
}

/// @notice ✅ 修复版
contract SafeWallet is SimpleInitializable {
    address public owner;
    address public pendingOwner;
    mapping(address => bool) public allowedTargets; // ✅ 调用目标白名单

    event OwnershipTransferStarted(address indexed from, address indexed to);
    event OwnershipTransferred(address indexed from, address indexed to);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner"); // ✅ 使用 msg.sender
        _;
    }

    constructor() {
        _disableInitializers(); // ✅ 作为实现合约时，自身不可被初始化
    }

    // ✅ 只能调用一次；代理部署时应在同一笔交易里调用
    function initialize(address _owner) external initializer {
        require(_owner != address(0), "zero owner");
        owner = _owner;
    }

    function withdrawAll(address payable to) external onlyOwner {
        (bool ok, ) = to.call{value: address(this).balance}("");
        require(ok, "send failed");
    }

    function setAllowedTarget(address target, bool allowed) external onlyOwner {
        allowedTargets[target] = allowed;
    }

    // ✅ 只有 owner 能调用，且目标必须在白名单中
    function execute(address target, bytes calldata data) external onlyOwner returns (bytes memory) {
        require(allowedTargets[target], "target not allowed");
        (bool ok, bytes memory ret) = target.call(data);
        require(ok, "call failed");
        return ret;
    }

    // ✅ 两步转移所有权
    function transferOwnership(address newOwner) external onlyOwner {
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "not pending owner");
        emit OwnershipTransferred(owner, pendingOwner);
        owner = pendingOwner;
        pendingOwner = address(0);
    }

    receive() external payable {}
}
