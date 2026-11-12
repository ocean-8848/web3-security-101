// 本手册示例：ToyVault 的 CVL 规格。
methods {
    function totalAssets() external returns (uint256) envfree;
    function totalShares() external returns (uint256) envfree;
    function sharesOf(address) external returns (uint256) envfree;
    function roundUp() external returns (bool) envfree;
}

// 规则 1：赎回不改变其他用户的份额
rule redeemDoesNotTouchOthers(env e, address other, uint256 shares) {
    require other != e.msg.sender;
    uint256 before = sharesOf(other);
    redeem(e, shares);
    assert sharesOf(other) == before, "redeem changed another user";
}

// 规则 2：存入后立刻赎回，用户不能获利
rule noProfitRoundTrip(env e, uint256 assets) {
    require totalShares() > 0 && totalAssets() > 0;
    uint256 minted = deposit(e, assets);
    uint256 out = redeem(e, minted);
    assert out <= assets, "round trip profit";
}

// 规则 3：任何函数都不能让总份额为 0 时总资产下降
rule noAssetsLeakWhenEmpty(env e, method f, calldataarg args) {
    require totalShares() == 0;
    uint256 before = totalAssets();
    f(e, args);
    assert totalAssets() >= before, "assets left an empty vault";
}
