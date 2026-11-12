// SPDX-License-Identifier: MIT
// 配套章节：08 预言机与闪电贷 ｜ 交互实验：interactive/oracle-manipulation-lab.html
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

interface IPairLike {
    function getReserves() external view returns (uint112 r0, uint112 r1, uint32 ts);
}

/// @dev Chainlink 风格聚合器接口（仅列出示例需要的函数）
interface IAggregatorLike {
    function decimals() external view returns (uint8);
    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

/// @notice ❌ 漏洞版：用 AMM 储备比例作为抵押品价格
contract SpotPriceLending {
    IPairLike public immutable pair; // token0 = 抵押代币，token1 = 稳定币（均 18 位，示例）
    uint256 public constant LTV_BPS = 7_500; // 75%（示例）

    constructor(IPairLike _pair) { pair = _pair; }

    // ❌ 漏洞：一笔交易内可被闪电贷任意改写
    function collateralPrice() public view returns (uint256) {
        (uint112 r0, uint112 r1, ) = pair.getReserves();
        return uint256(r1) * 1e18 / uint256(r0);
    }

    function maxBorrow(uint256 collateralAmt) public view returns (uint256) {
        return collateralAmt * collateralPrice() / 1e18 * LTV_BPS / 10_000;
    }
}

/// @notice ✅ 修复版：链下聚合喂价 + 完整检查；L2 上额外检查排序器状态
contract FeedPriceLending {
    IAggregatorLike public immutable priceFeed;
    IAggregatorLike public immutable sequencerUptimeFeed; // L1 上部署时传 address(0)
    uint256 public immutable maxDelay;      // 按喂价心跳设置，例如 3600 秒（示例）
    uint256 public immutable minPrice;      // 熔断下限（与喂价精度一致）
    uint256 public immutable maxPrice;      // 熔断上限
    uint256 public constant GRACE_PERIOD = 3600; // 排序器恢复后的宽限期（示例）
    uint256 public constant LTV_BPS = 7_500;

    constructor(
        IAggregatorLike _feed,
        IAggregatorLike _uptime,
        uint256 _maxDelay,
        uint256 _minPrice,
        uint256 _maxPrice
    ) {
        priceFeed = _feed;
        sequencerUptimeFeed = _uptime;
        maxDelay = _maxDelay;
        minPrice = _minPrice;
        maxPrice = _maxPrice;
    }

    /// @return price 18 位精度的价格
    function collateralPrice() public view returns (uint256 price) {
        // ✅ L2：排序器宕机或刚恢复时拒绝使用价格（Mantle 等 L2 部署时启用）
        if (address(sequencerUptimeFeed) != address(0)) {
            (, int256 status, uint256 startedAt, , ) = sequencerUptimeFeed.latestRoundData();
            require(status == 0, "sequencer down");              // 0 = 在线
            require(block.timestamp - startedAt > GRACE_PERIOD, "grace period");
        }

        (, int256 answer, , uint256 updatedAt, ) = priceFeed.latestRoundData();
        require(answer > 0, "invalid price");                               // ✅ 正值
        require(block.timestamp - updatedAt <= maxDelay, "stale price");    // ✅ 时效
        uint256 p = uint256(answer);
        require(p > minPrice && p < maxPrice, "price at circuit bound");    // ✅ 未触及熔断上下限
        uint8 dec = priceFeed.decimals();                                   // ✅ 不写死 8
        price = dec <= 18 ? p * 10 ** (18 - dec) : p / 10 ** (dec - 18);
    }

    function maxBorrow(uint256 collateralAmt) public view returns (uint256) {
        return collateralAmt * collateralPrice() / 1e18 * LTV_BPS / 10_000;
    }
}
