// SPDX-License-Identifier: MIT
// 配套章节：03 EVM 基础、10 可升级合约与代理 ｜ 交互实验：interactive/storage-proxy-lab.html
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

/// @notice ❌ 朴素代理：implementation 放在 slot 0，与实现合约的第一个变量冲突
contract NaiveProxy {
    address public implementation; // slot 0 ❌

    constructor(address impl) { implementation = impl; }

    fallback() external payable {
        address impl = implementation;
        assembly {
            calldatacopy(0, 0, calldatasize())
            let ok := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch ok case 0 { revert(0, returndatasize()) } default { return(0, returndatasize()) }
        }
    }
}

/// @notice ✅ EIP-1967 代理：实现地址存放在伪随机槽位
contract EIP1967Proxy {
    // bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1)
    bytes32 internal constant IMPLEMENTATION_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    // bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1)
    bytes32 internal constant ADMIN_SLOT =
        0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

    /// @param initData 部署时同一笔交易内调用 initialize，防止被抢跑
    constructor(address impl, address admin, bytes memory initData) {
        assembly {
            sstore(IMPLEMENTATION_SLOT, impl)
            sstore(ADMIN_SLOT, admin)
        }
        if (initData.length > 0) {
            (bool ok, ) = impl.delegatecall(initData);
            require(ok, "init failed");
        }
    }

    function _admin() internal view returns (address a) {
        assembly { a := sload(ADMIN_SLOT) }
    }

    function _impl() internal view returns (address i) {
        assembly { i := sload(IMPLEMENTATION_SLOT) }
    }

    /// @dev 透明代理的简化：只有 admin 能升级，且 admin 的调用不转发
    function upgradeTo(address newImpl) external {
        require(msg.sender == _admin(), "not admin");
        require(newImpl.code.length > 0, "not a contract");
        assembly { sstore(IMPLEMENTATION_SLOT, newImpl) }
    }

    fallback() external payable {
        require(msg.sender != _admin(), "admin cannot fallback");
        address impl = _impl();
        assembly {
            calldatacopy(0, 0, calldatasize())
            let ok := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch ok case 0 { revert(0, returndatasize()) } default { return(0, returndatasize()) }
        }
    }
}

/// @notice 实现 V1
contract BankV1 {
    address public owner;                        // slot 0
    uint256 public totalDeposits;                // slot 1
    mapping(address => uint256) public balances; // slot 2
    bool private initialized;                    // slot 3

    function initialize(address _owner) external {
        require(!initialized, "initialized");
        initialized = true;
        owner = _owner;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;
    }
}

/// @notice ❌ V2 错误升级：在最前面插入一个 uint256，全部槽位错位
/// @dev 注意：如果插入的是 bool，它会和 owner 打包进 slot 0，错位方式不同（owner 的字节被平移）。
///      用 `forge inspect` 或 solc 的 storageLayout 输出确认，而不是靠肉眼数。
contract BankV2Broken {
    uint256 public feeBps;                       // slot 0 ❌ 读到的是旧 owner 地址（被当作整数）
    address public owner;                        // slot 1 ❌ 读到的是 totalDeposits 的低 20 字节
    uint256 public totalDeposits;                // slot 2 ❌ 读到的是 mapping 占位槽（恒为 0）
    mapping(address => uint256) public balances; // slot 3 ❌ 映射基址变化，所有余额"消失"
}

/// @notice ✅ V2 正确升级：只在末尾追加
contract BankV2Good {
    address public owner;                        // slot 0
    uint256 public totalDeposits;                // slot 1
    mapping(address => uint256) public balances; // slot 2
    bool private initialized;                    // slot 3
    bool public paused;                          // slot 3（与 initialized 打包，二者都是 1 字节）✅ 追加
    uint256[49] private __gap;                   // ✅ 为未来升级预留槽位
}
