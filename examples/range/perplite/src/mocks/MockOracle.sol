// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice 教学用预言机。价格 8 位小数，按轮次保存历史。
contract MockOracle {
    struct Round {
        uint256 price;
        uint256 updatedAt;
    }

    Round[] private _rounds;

    constructor() {
        _rounds.push(Round(0, 0)); // 轮次编号从 1 开始
    }

    function push(uint256 price) external {
        _rounds.push(Round(price, block.timestamp));
    }

    function latestRoundId() public view returns (uint256) {
        return _rounds.length - 1;
    }

    function getRound(uint256 id) public view returns (uint256 price, uint256 updatedAt) {
        Round memory r = _rounds[id];
        return (r.price, r.updatedAt);
    }

    function latest() external view returns (uint256 price, uint256 updatedAt) {
        return getRound(latestRoundId());
    }
}
