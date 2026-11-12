// SPDX-License-Identifier: MIT
// 配套章节：05 算术与精度 ｜ 交互实验：interactive/vault-inflation-lab.html
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

interface IERC20Min {
    function transfer(address to, uint256 amt) external returns (bool);
    function transferFrom(address from, address to, uint256 amt) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
}

/// @notice ❌ 漏洞版：份额价格读取 balanceOf，空金库可被"捐赠"抬价
contract NaiveVault {
    IERC20Min public immutable asset;
    uint256 public totalSupply;
    mapping(address => uint256) public sharesOf;

    constructor(IERC20Min _asset) { asset = _asset; }

    // ❌ 漏洞：totalAssets 可被任何人直接转账改变
    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    function deposit(uint256 assets) external returns (uint256 shares) {
        uint256 ta = totalAssets();
        // ❌ 空金库时 1:1；之后按比例向下取整，可能得到 0 份额，且没有检查
        shares = totalSupply == 0 ? assets : assets * totalSupply / ta;
        require(asset.transferFrom(msg.sender, address(this), assets), "transferFrom");
        totalSupply += shares;
        sharesOf[msg.sender] += shares;
    }

    function redeem(uint256 shares) external returns (uint256 assets) {
        assets = shares * totalAssets() / totalSupply; // 向下取整：对协议有利
        sharesOf[msg.sender] -= shares;
        totalSupply -= shares;
        require(asset.transfer(msg.sender, assets), "transfer");
    }
}

/// @notice ✅ 修复版：虚拟份额 + 偏移（OpenZeppelin ERC4626 ≥ 4.9 的思路）+ 最小输出检查
contract OffsetVault {
    IERC20Min public immutable asset;
    uint8 public immutable decimalsOffset; // 例如 3 或 6
    uint256 public totalSupply;
    mapping(address => uint256) public sharesOf;

    constructor(IERC20Min _asset, uint8 _offset) {
        asset = _asset;
        decimalsOffset = _offset;
    }

    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    // ✅ shares = assets × (supply + 10^offset) / (assets_total + 1)，向下取整
    function previewDeposit(uint256 assets) public view returns (uint256) {
        return mulDivDown(assets, totalSupply + 10 ** decimalsOffset, totalAssets() + 1);
    }

    // ✅ assets = shares × (assets_total + 1) / (supply + 10^offset)，向下取整
    function previewRedeem(uint256 shares) public view returns (uint256) {
        return mulDivDown(shares, totalAssets() + 1, totalSupply + 10 ** decimalsOffset);
    }

    // ✅ 用户提供最小份额，防止被抢跑后得到 0 份额
    function deposit(uint256 assets, uint256 minShares) external returns (uint256 shares) {
        shares = previewDeposit(assets);
        require(shares > 0 && shares >= minShares, "slippage: shares too low");
        require(asset.transferFrom(msg.sender, address(this), assets), "transferFrom");
        totalSupply += shares;
        sharesOf[msg.sender] += shares;
    }

    function redeem(uint256 shares, uint256 minAssets) external returns (uint256 assets) {
        assets = previewRedeem(shares);
        require(assets >= minAssets, "slippage: assets too low");
        sharesOf[msg.sender] -= shares;
        totalSupply -= shares;
        require(asset.transfer(msg.sender, assets), "transfer");
    }

    /// @dev 简化版 mulDiv：示例中假设 a*b 不溢出；生产环境请用 OpenZeppelin Math.mulDiv
    function mulDivDown(uint256 a, uint256 b, uint256 d) internal pure returns (uint256) {
        return a * b / d;
    }
}
