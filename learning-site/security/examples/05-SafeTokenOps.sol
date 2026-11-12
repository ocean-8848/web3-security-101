// SPDX-License-Identifier: MIT
// 配套章节：07 外部调用与代币兼容性、chains/C02 TRON
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

interface IERC20Min {
    function transfer(address to, uint256 amt) external returns (bool);
    function transferFrom(address from, address to, uint256 amt) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
}

/// @notice 安全代币操作库：覆盖"无返回值""返回 false 但成功（TRON USDT）""目标无代码"三种情况
library SafeTokenOps {
    error CallFailed();
    error NoCode();
    error ReturnedFalse();
    error NotCredited(uint256 expected, uint256 actual);

    /// @dev 以太坊风格：兼容"不返回值"的代币（如以太坊 USDT），并拒绝无代码地址（Qubit 教训）
    function safeTransferFrom(IERC20Min token, address from, address to, uint256 amt) internal {
        _callOptionalReturn(token, abi.encodeCall(IERC20Min.transferFrom, (from, to, amt)));
    }

    function safeTransfer(IERC20Min token, address to, uint256 amt) internal {
        _callOptionalReturn(token, abi.encodeCall(IERC20Min.transfer, (to, amt)));
    }

    function _callOptionalReturn(IERC20Min token, bytes memory data) private {
        // ✅ 无代码地址的低级调用会"成功"，必须显式检查
        if (address(token).code.length == 0) revert NoCode();
        (bool ok, bytes memory ret) = address(token).call(data);
        if (!ok) revert CallFailed();
        // ✅ 有返回值时必须为 true；无返回值视为成功（兼容非标准代币）
        if (ret.length > 0 && !abi.decode(ret, (bool))) revert ReturnedFalse();
    }

    /// @dev TRON USDT 推送：成功时也可能返回 false，因此忽略返回值，改用接收方余额差判断
    ///      假设：代币未开启转账手续费。若开启，本函数会回滚（选择"失败即回滚"策略）。
    function balanceCheckedTransfer(IERC20Min token, address to, uint256 amt) internal {
        if (address(token).code.length == 0) revert NoCode();
        uint256 before = token.balanceOf(to);
        (bool ok, ) = address(token).call(abi.encodeCall(IERC20Min.transfer, (to, amt)));
        if (!ok) revert CallFailed();
        uint256 credited = token.balanceOf(to) - before;
        if (credited != amt) revert NotCredited(amt, credited);
    }

    /// @dev 拉取并按实收金额记账：兼容收税代币。调用方必须加重入锁。
    function pullReceived(IERC20Min token, address from, uint256 amt) internal returns (uint256 received) {
        uint256 before = token.balanceOf(address(this));
        safeTransferFrom(token, from, address(this), amt);
        received = token.balanceOf(address(this)) - before;
    }
}

/// @notice 演示：一个可以在以太坊和 TRON 上使用不同推送策略的金库
contract MultiChainVault {
    using SafeTokenOps for IERC20Min;

    IERC20Min public immutable token;
    bool public immutable useBalanceCheckForPush; // TRON USDT 部署时设为 true
    mapping(address => uint256) public deposits;
    uint256 private _lock = 1;

    modifier nonReentrant() {
        require(_lock == 1, "reentrant");
        _lock = 2;
        _;
        _lock = 1;
    }

    constructor(IERC20Min _token, bool _useBalanceCheckForPush) {
        token = _token;
        useBalanceCheckForPush = _useBalanceCheckForPush;
    }

    function deposit(uint256 amt) external nonReentrant {
        uint256 received = token.pullReceived(msg.sender, amt); // ✅ 按实收记账
        deposits[msg.sender] += received;
    }

    function withdraw(uint256 amt) external nonReentrant {
        deposits[msg.sender] -= amt; // ✅ 先改状态（0.8 下不足会回滚）
        if (useBalanceCheckForPush) {
            token.balanceCheckedTransfer(msg.sender, amt); // ✅ TRON USDT
        } else {
            token.safeTransfer(msg.sender, amt);           // ✅ EVM 链
        }
    }
}
