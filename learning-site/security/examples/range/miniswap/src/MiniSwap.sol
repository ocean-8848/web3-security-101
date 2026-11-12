// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20Minimal {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @title MiniSwap
/// @notice A constant-product pool for one token pair. Local teaching target only.
/// @dev LP fee: 0.30% of the input on every swap. Protocol fee: 0.05% of the input.
///      Every swap and liquidity function reverts after its `deadline`.
contract MiniSwap {
    uint256 public constant BPS = 10_000;
    uint256 public constant SWAP_FEE_BPS = 30;
    uint256 public constant PROTOCOL_FEE_BPS = 5;
    uint256 public constant MINIMUM_LIQUIDITY = 1_000;
    address public constant DEAD = address(0xdEaD);

    string public constant name = "MiniSwap LP";
    string public constant symbol = "MLP";
    uint8 public constant decimals = 18;

    IERC20Minimal public immutable token0;
    IERC20Minimal public immutable token1;

    address public owner;
    address public pendingOwner;
    address public feeCollector;
    bool public paused;
    bool private entered;

    uint256 public reserve0;
    uint256 public reserve1;
    uint256 public protocolFees0;
    uint256 public protocolFees1;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);
    event LiquidityAdded(address indexed provider, uint256 amount0, uint256 amount1, uint256 shares);
    event LiquidityRemoved(address indexed provider, uint256 amount0, uint256 amount1, uint256 shares);
    event Swapped(address indexed trader, address indexed tokenIn, uint256 amountIn, uint256 amountOut, address to);
    event ProtocolFeesCollected(address indexed collector, uint256 amount0, uint256 amount1);
    event FeeCollectorChanged(address indexed collector);
    event PausedChanged(bool paused);

    error NotOwner();
    error NotPendingOwner();
    error IsPaused();
    error Reentered();
    error Expired();
    error ZeroAmount();
    error ZeroAddress();
    error UnknownToken();
    error InsufficientLiquidity();
    error InsufficientShares();
    error SlippageExceeded();
    error TokenTransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier guarded() {
        if (paused) revert IsPaused();
        if (entered) revert Reentered();
        entered = true;
        _;
        entered = false;
    }

    modifier beforeDeadline(uint256 deadline) {
        if (block.timestamp > deadline) revert Expired();
        _;
    }

    constructor(IERC20Minimal tokenA, IERC20Minimal tokenB, address collector) {
        if (address(tokenA) == address(0) || address(tokenB) == address(0) || collector == address(0)) {
            revert ZeroAddress();
        }
        token0 = tokenA;
        token1 = tokenB;
        owner = msg.sender;
        feeCollector = collector;
    }

    // ---------- liquidity ----------

    function addLiquidity(
        uint256 amount0Max,
        uint256 amount1Max,
        uint256 minShares,
        uint256 deadline
    ) external guarded returns (uint256 shares, uint256 amount0, uint256 amount1) {
        if (amount0Max == 0 || amount1Max == 0) revert ZeroAmount();

        if (totalSupply == 0) {
            amount0 = amount0Max;
            amount1 = amount1Max;
            uint256 root = _sqrt(amount0 * amount1);
            if (root <= MINIMUM_LIQUIDITY) revert InsufficientLiquidity();
            shares = root - MINIMUM_LIQUIDITY;
            _mint(DEAD, MINIMUM_LIQUIDITY);
        } else {
            amount0 = amount0Max;
            amount1 = (amount0 * reserve1) / reserve0;
            if (amount1 > amount1Max) {
                amount1 = amount1Max;
                amount0 = (amount1 * reserve0) / reserve1;
            }
            shares = _min((amount0 * totalSupply) / reserve0, (amount1 * totalSupply) / reserve1);
        }
        if (shares == 0 || shares < minShares) revert SlippageExceeded();

        _pull(token0, amount0);
        _pull(token1, amount1);
        reserve0 += amount0;
        reserve1 += amount1;
        _mint(msg.sender, shares);
        emit LiquidityAdded(msg.sender, amount0, amount1, shares);
    }

    function removeLiquidity(
        uint256 shares,
        uint256 amount0Min,
        uint256 amount1Min,
        uint256 deadline
    ) external guarded beforeDeadline(deadline) returns (uint256 amount0, uint256 amount1) {
        if (shares == 0) revert ZeroAmount();
        if (balanceOf[msg.sender] < shares) revert InsufficientShares();

        amount0 = (shares * reserve0) / totalSupply;
        amount1 = (shares * reserve1) / totalSupply;
        if (amount0 < amount0Min || amount1 < amount1Min) revert SlippageExceeded();

        _burn(msg.sender, shares);
        reserve0 -= amount0;
        reserve1 -= amount1;
        _push(token0, msg.sender, amount0);
        _push(token1, msg.sender, amount1);
        emit LiquidityRemoved(msg.sender, amount0, amount1, shares);
    }

    // ---------- swaps ----------

    /// @notice Sells exactly `amountIn` of `tokenIn`.
    function swapExactIn(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut,
        address to,
        uint256 deadline
    ) external guarded beforeDeadline(deadline) returns (uint256 amountOut) {
        if (amountIn == 0) revert ZeroAmount();
        (bool zeroForOne, uint256 reserveIn, uint256 reserveOut) = _route(tokenIn);
        amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
        if (amountOut < minAmountOut) revert SlippageExceeded();
        _settleSwap(zeroForOne, amountIn, amountOut, to);
    }

    /// @notice Buys exactly `amountOut`, selling at most `maxAmountIn` of `tokenIn`.
    function swapExactOut(
        address tokenIn,
        uint256 amountOut,
        uint256 maxAmountIn,
        address to,
        uint256 deadline
    ) external guarded returns (uint256 amountIn) {
        if (amountOut == 0) revert ZeroAmount();
        (bool zeroForOne, uint256 reserveIn, uint256 reserveOut) = _route(tokenIn);
        amountIn = getAmountIn(amountOut, reserveIn, reserveOut);
        if (amountIn > maxAmountIn) revert SlippageExceeded();
        _settleSwap(zeroForOne, amountIn, amountOut, to);
    }

    /// @notice Quotes the output for an exact input, after the swap fee.
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        if (reserveIn == 0 || reserveOut == 0) revert InsufficientLiquidity();
        uint256 amountInWithFee = amountIn * (BPS - SWAP_FEE_BPS);
        return (amountInWithFee * reserveOut) / (reserveIn * BPS + amountInWithFee);
    }

    /// @notice Quotes the input for an exact output, after the swap fee.
    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        if (reserveIn == 0 || reserveOut == 0) revert InsufficientLiquidity();
        if (amountOut >= reserveOut) revert InsufficientLiquidity();
        return (reserveIn * amountOut * BPS) / ((reserveOut - amountOut) * (BPS - 3));
    }

    // ---------- admin ----------

    function collectProtocolFees() external {
        if (msg.sender != feeCollector && msg.sender != owner) revert NotOwner();
        uint256 amount0 = protocolFees0;
        uint256 amount1 = protocolFees1;
        protocolFees0 = 0;
        protocolFees1 = 0;
        _push(token0, feeCollector, amount0);
        _push(token1, feeCollector, amount1);
        emit ProtocolFeesCollected(feeCollector, amount0, amount1);
    }

    function setFeeCollector(address collector) external onlyOwner {
        if (collector == address(0)) revert ZeroAddress();
        feeCollector = collector;
        emit FeeCollectorChanged(collector);
    }

    function setPaused(bool value) external onlyOwner {
        paused = value;
        emit PausedChanged(value);
    }

    function transferOwnership(address next) external onlyOwner {
        pendingOwner = next;
    }

    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert NotPendingOwner();
        owner = pendingOwner;
        pendingOwner = address(0);
    }

    // ---------- LP token ----------

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) allowance[from][msg.sender] = allowed - amount;
        _transfer(from, to, amount);
        return true;
    }

    // ---------- internal ----------

    function _route(address tokenIn) internal view returns (bool zeroForOne, uint256 reserveIn, uint256 reserveOut) {
        if (tokenIn == address(token0)) return (true, reserve0, reserve1);
        if (tokenIn == address(token1)) return (false, reserve1, reserve0);
        revert UnknownToken();
    }

    function _settleSwap(bool zeroForOne, uint256 amountIn, uint256 amountOut, address to) internal {
        if (to == address(0)) revert ZeroAddress();
        uint256 protocolFee = (amountIn * PROTOCOL_FEE_BPS) / BPS;
        if (zeroForOne) {
            _pull(token0, amountIn);
            protocolFees0 += protocolFee;
            reserve0 += amountIn;
            reserve1 -= amountOut;
            _push(token1, to, amountOut);
            emit Swapped(msg.sender, address(token0), amountIn, amountOut, to);
        } else {
            _pull(token1, amountIn);
            protocolFees1 += protocolFee;
            reserve1 += amountIn;
            reserve0 -= amountOut;
            _push(token0, to, amountOut);
            emit Swapped(msg.sender, address(token1), amountIn, amountOut, to);
        }
    }

    function _pull(IERC20Minimal token, uint256 amount) internal {
        if (!token.transferFrom(msg.sender, address(this), amount)) revert TokenTransferFailed();
    }

    function _push(IERC20Minimal token, address to, uint256 amount) internal {
        if (!token.transfer(to, amount)) revert TokenTransferFailed();
    }

    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) internal {
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        if (to == address(0)) revert ZeroAddress();
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
