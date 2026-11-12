// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// 本手册示例：只记账、不转真实代币的份额金库。
/// roundUp = true 时存款向上取整（❌ 漏洞），false 时向下取整（✅ 修复）。
contract ToyVault {
    bool public immutable roundUp;
    uint256 public totalAssets;
    uint256 public totalShares;
    mapping(address => uint256) public sharesOf;

    constructor(bool roundUp_) {
        roundUp = roundUp_;
    }

    function donate(uint256 assets) external {
        totalAssets += assets;
    }

    function deposit(uint256 assets) external returns (uint256 shares) {
        if (totalShares == 0) {
            shares = assets;
        } else if (roundUp) {
            shares = (assets * totalShares + totalAssets - 1) / totalAssets;
        } else {
            shares = (assets * totalShares) / totalAssets;
        }
        require(shares > 0, "zero shares");
        totalAssets += assets;
        totalShares += shares;
        sharesOf[msg.sender] += shares;
    }

    function redeem(uint256 shares) external returns (uint256 assets) {
        require(shares > 0 && sharesOf[msg.sender] >= shares, "bad shares");
        assets = (shares * totalAssets) / totalShares;
        sharesOf[msg.sender] -= shares;
        totalShares -= shares;
        totalAssets -= assets;
    }
}
