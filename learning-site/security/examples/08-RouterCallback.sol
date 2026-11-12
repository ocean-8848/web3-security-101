// SPDX-License-Identifier: MIT
// 配套章节：chains/C00 以太坊 4.7 节（Sushi RouteProcessor2）、05 访问控制、07 外部调用
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

interface IERC20Min {
    function transferFrom(address from, address to, uint256 amt) external returns (bool);
}

interface IPoolLike {
    /// @dev 池子在 swap 中回调 router.swapCallback(amountToPay, data)
    function swap(address recipient, bool zeroForOne, uint256 amountIn, bytes calldata data) external;
}

/// @notice ❌ 漏洞版：池子地址来自用户输入；回调只检查"是不是刚才调用的那个地址"；付款人来自回调数据
contract VulnerableRouter {
    address private lastCalledPool;

    function swapVia(address pool, address tokenIn, uint256 amountIn) external {
        lastCalledPool = pool;                                      // ❌ pool 由用户任意指定
        IPoolLike(pool).swap(msg.sender, true, amountIn, abi.encode(tokenIn, msg.sender));
        lastCalledPool = address(0);
    }

    function swapCallback(uint256 amountToPay, bytes calldata data) external {
        require(msg.sender == lastCalledPool, "unknown pool");     // ❌ 恶意池子就是 lastCalledPool
        (address tokenIn, address payer) = abi.decode(data, (address, address));
        // ❌ 恶意池子可以伪造 data，把 payer 换成任何授权过本合约的用户
        require(IERC20Min(tokenIn).transferFrom(payer, msg.sender, amountToPay), "pay failed");
    }
}

/// @notice ✅ 修复版：
///   1. 池子地址由工厂 + 代币对 + 费率"计算"得出（CREATE2），不接受用户直接给出的地址；
///   2. 付款人保存在本合约自己的状态里，不从回调数据中读取；
///   3. 回调期间加锁，且只允许一次支付。
contract SafeRouter {
    address public immutable factory;
    bytes32 public immutable poolInitCodeHash;

    // 本次交换的上下文（也可以用 0.8.24+ 的 transient 存储）
    address private expectedPool;
    address private payer;
    address private tokenInCtx;
    bool private paid;

    constructor(address _factory, bytes32 _poolInitCodeHash) {
        factory = _factory;
        poolInitCodeHash = _poolInitCodeHash;
    }

    /// @dev Uniswap V3 风格的池子地址计算：只有工厂用 CREATE2 部署的真实池子才会落在这个地址
    function computePool(address tokenA, address tokenB, uint24 fee) public view returns (address) {
        (address t0, address t1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        bytes32 salt = keccak256(abi.encode(t0, t1, fee));
        return address(uint160(uint256(keccak256(abi.encodePacked(hex"ff", factory, salt, poolInitCodeHash)))));
    }

    function swapExact(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn) external {
        require(expectedPool == address(0), "reentrant");
        address pool = computePool(tokenIn, tokenOut, fee);        // ✅ 地址由规则计算
        expectedPool = pool;
        payer = msg.sender;                                         // ✅ 付款人就是发起交换的人
        tokenInCtx = tokenIn;
        paid = false;
        IPoolLike(pool).swap(msg.sender, tokenIn < tokenOut, amountIn, "");
        require(paid, "pool did not request payment");
        expectedPool = address(0);
        payer = address(0);
        tokenInCtx = address(0);
    }

    function swapCallback(uint256 amountToPay, bytes calldata) external {
        require(msg.sender == expectedPool && expectedPool != address(0), "unknown pool"); // ✅
        require(!paid, "already paid");                                                    // ✅
        paid = true;
        require(IERC20Min(tokenInCtx).transferFrom(payer, msg.sender, amountToPay), "pay failed");
    }
}
