// SPDX-License-Identifier: MIT
// 配套章节：08 预言机与闪电贷 ｜ 靶场公用的玩具喂价
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

/// @notice Chainlink 风格的本地喂价。测试直接设置价格和更新时间。
contract ToyFeed {
    uint8 public immutable decimals;
    int256 public answer;
    uint256 public startedAt;
    uint256 public updatedAt;

    constructor(uint8 _decimals, int256 _answer) {
        decimals = _decimals;
        answer = _answer;
        startedAt = block.timestamp;
        updatedAt = block.timestamp;
    }

    function set(int256 _answer, uint256 _updatedAt) external {
        answer = _answer;
        updatedAt = _updatedAt;
    }

    function setStartedAt(uint256 _startedAt) external {
        startedAt = _startedAt;
    }

    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80) {
        return (1, answer, startedAt, updatedAt, 1);
    }
}
