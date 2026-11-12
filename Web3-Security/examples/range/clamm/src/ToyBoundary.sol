// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice 只保留一个 tick 边界的玩具池。展示跨越判断的边界条件。
/// @dev 一个头寸的上边界在 boundary。价格向上越过时，L 减去 net；向下回到边界时，L 加上 net。
contract ToyBoundary {
    uint160 public immutable boundary;
    uint128 public immutable net;
    bool public immutable strictFixed;

    uint160 public price;
    uint128 public liquidity;
    bool public boundaryIsBelowPrice;

    constructor(uint160 boundary_, uint128 net_, uint128 startLiquidity, uint160 startPrice, bool fixedLogic) {
        boundary = boundary_;
        net = net_;
        liquidity = startLiquidity;
        price = startPrice;
        strictFixed = fixedLogic;
    }

    /// @notice 价格上行到 next
    function moveUp(uint160 next) external {
        require(next > price, "up");
        price = next;
        bool crossed = strictFixed ? next >= boundary : next == boundary;
        if (crossed && !boundaryIsBelowPrice) {
            liquidity -= net;
            boundaryIsBelowPrice = true;
        }
    }

    /// @notice 价格下行到 next。低于边界时恢复头寸流动性
    function moveDown(uint160 next) external {
        require(next < price, "down");
        price = next;
        if (next < boundary) {
            if (strictFixed && !boundaryIsBelowPrice) return;
            liquidity += net;
            boundaryIsBelowPrice = false;
        }
    }
}
