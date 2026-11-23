// SPDX-License-Identifier: MIT
// 配套章节：06 算术与精度、R24 ERC-4626 金库 ｜ 交互实验：interactive/audit-rounding.html
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

interface IAsset {
    function balanceOf(address who) external view returns (uint256);
    function transfer(address to, uint256 amt) external returns (bool);
    function transferFrom(address from, address to, uint256 amt) external returns (bool);
    function approve(address spender, uint256 amt) external returns (bool);
}

/// @notice ✅ 取整方向正确的玩具 ERC-4626 金库（份额不是 ERC20，只保留记账）
contract Toy4626 {
    IAsset public immutable asset;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(IAsset _asset) {
        asset = _asset;
    }

    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    function _down(uint256 a, uint256 b, uint256 d) internal pure returns (uint256) {
        return a * b / d;
    }

    function _up(uint256 a, uint256 b, uint256 d) internal pure returns (uint256) {
        uint256 p = a * b;
        return p == 0 ? 0 : (p - 1) / d + 1;
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        return _down(assets, totalSupply + 1, totalAssets() + 1);
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        return _down(shares, totalAssets() + 1, totalSupply + 1);
    }

    function previewDeposit(uint256 assets) public view returns (uint256) {
        return convertToShares(assets);
    }

    /// @dev ✅ 修复：铸造份额时向上取整，用户多付
    function previewMint(uint256 shares) public view virtual returns (uint256) {
        return _up(shares, totalAssets() + 1, totalSupply + 1);
    }

    /// @dev ✅ 修复：取出资产时向上取整，用户多烧份额
    function previewWithdraw(uint256 assets) public view virtual returns (uint256) {
        return _up(assets, totalSupply + 1, totalAssets() + 1);
    }

    function previewRedeem(uint256 shares) public view returns (uint256) {
        return convertToAssets(shares);
    }

    function deposit(uint256 assets) external returns (uint256 shares) {
        shares = previewDeposit(assets);
        _mint(msg.sender, shares, assets);
    }

    function mint(uint256 shares) external returns (uint256 assets) {
        assets = previewMint(shares);
        _mint(msg.sender, shares, assets);
    }

    function withdraw(uint256 assets) external returns (uint256 shares) {
        shares = previewWithdraw(assets);
        _burn(msg.sender, shares, assets);
    }

    function redeem(uint256 shares) external returns (uint256 assets) {
        assets = previewRedeem(shares);
        _burn(msg.sender, shares, assets);
    }

    function _mint(address to, uint256 shares, uint256 assets) private {
        require(asset.transferFrom(msg.sender, address(this), assets), "pull failed");
        totalSupply += shares;
        balanceOf[to] += shares;
    }

    function _burn(address from, uint256 shares, uint256 assets) private {
        balanceOf[from] -= shares;
        totalSupply -= shares;
        require(asset.transfer(from, assets), "push failed");
    }
}

/// @notice ❌ 漏洞版金库：previewWithdraw 和 previewMint 向下取整
contract BadRounding4626 is Toy4626 {
    constructor(IAsset _asset) Toy4626(_asset) {}

    // ❌ 漏洞：小额取款烧 0 份额
    function previewWithdraw(uint256 assets) public view override returns (uint256) {
        return _down(assets, totalSupply + 1, totalAssets() + 1);
    }

    // ❌ 漏洞：少付资产也能铸造份额
    function previewMint(uint256 shares) public view override returns (uint256) {
        return _down(shares, totalAssets() + 1, totalSupply + 1);
    }
}

/// @notice ❌ 漏洞版集成方：用 convertToShares 记账，实际由金库按向上取整烧份额
contract NaiveVaultAdapter {
    Toy4626 public immutable vault;
    IAsset public immutable asset;
    mapping(address => uint256) public sharesOf;

    constructor(Toy4626 _vault) {
        vault = _vault;
        asset = _vault.asset();
        asset.approve(address(_vault), type(uint256).max);
    }

    function deposit(uint256 assets) external {
        require(asset.transferFrom(msg.sender, address(this), assets), "pull failed");
        sharesOf[msg.sender] += vault.deposit(assets);
    }

    function withdraw(uint256 assets) external {
        // ❌ 漏洞：convertToShares 向下取整，账本少扣；金库实际多烧
        sharesOf[msg.sender] -= vault.convertToShares(assets);
        vault.withdraw(assets);
        require(asset.transfer(msg.sender, assets), "push failed");
    }
}

/// @notice ✅ 修复版集成方：账本扣减金库实际烧掉的份额，并设置滑点上限
contract SafeVaultAdapter {
    Toy4626 public immutable vault;
    IAsset public immutable asset;
    mapping(address => uint256) public sharesOf;
    uint256 public totalLedgerShares;

    constructor(Toy4626 _vault) {
        vault = _vault;
        asset = _vault.asset();
        asset.approve(address(_vault), type(uint256).max);
    }

    function deposit(uint256 assets, uint256 minShares) external returns (uint256 shares) {
        require(asset.transferFrom(msg.sender, address(this), assets), "pull failed");
        shares = vault.deposit(assets);
        require(shares > 0 && shares >= minShares, "slippage");
        sharesOf[msg.sender] += shares;
        totalLedgerShares += shares;
    }

    function withdraw(uint256 assets, uint256 maxShares) external returns (uint256 shares) {
        shares = vault.previewWithdraw(assets);
        require(shares <= maxShares, "slippage");
        // ✅ 修复：按向上取整的实际份额扣账，且在交互之前扣账
        sharesOf[msg.sender] -= shares;
        totalLedgerShares -= shares;
        require(vault.withdraw(assets) == shares, "share mismatch");
        require(asset.transfer(msg.sender, assets), "push failed");
    }
}
