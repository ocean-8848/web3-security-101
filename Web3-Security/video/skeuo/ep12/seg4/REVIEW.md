start: upgrade
end: eRpc

# seg4 ④ 根因与案例 · 自审

- 起始镜头 `CAMS.upgrade`，按统筹的接续说明复现 seg3 段尾的状态：新实现 `core`（ver 新实现，scale 0.6）在 t=0 推到 `CORE_TO`、拉杆已拉下；ZK 证明卡不放（seg3 段尾已隐去）；电路板透明度 30%；“升级权限”“绕过证明系统”“证明系统 ＋ 升级权限”三个标签开场就在，L0 第一次运镜时淡出。屏幕层 `kw-end` 没带过来（属于 seg3 的屏幕卡）。
- 段尾静止在 `CAMS.eRpc`，等于 seg5 的 cam0。
- 术语卡 report：`术语卡 5 张：社会工程@21.18s×3.6s，IAVL@37.22s×3.6s，守护者@68.16s×3.6s，可信根@106.78s×3.6s，RPC@147.01s×3.6s`（没有推迟或偏短的卡）
- `hyperframes check`：0 error；警告只剩标题卡副标题 line_unread（segbase 生成的部分）和 4 处 dead_stretch（动作在 #cam 的 SVG 属性上，取样器看不到）。
- `layout_lint`：版面检查通过。
- 看过的图：1 张联系表（8 帧：1.8 / 27 / 45 / 74 / 86 / 111 / 160 / 190 秒）。

## 和 BRIEF 不一样的地方 / 未解决
- L7 没有拍 C 区 `mintPress` 远景，200 万枚 BNB 的红点阵放在 Merkle 树旁边（E 区）。
- L13 没做“B 区平台小窗 9 把钥匙变红”，只做了选择器钥匙推向特权合约 + 特权合约闪烁。
- L17 叶子没有随机变色，改成四块叶子依次弹出 ✓ + 根旁“0x00 → 全部通过”。
- L18 没放账本物件，用红色标签“+ ETH 存款（不存在）”代替。
- L9 闸刀和 L24 闸刀都是段内新增的 kit `knifeSwitch`（wrap 0.6 / 0.5），分别放在 E 区树左侧和 rsETH 右侧（`ePt(-840,20)`、`ePt(720,330)`）。L26 新增的 RPC / 验证者放在 `ePt(-260,330)`、`ePt(260/420,470)`。
- 段内镜头：`eTreeW`、`eSigW`、`eKeyR`（在 src 里用 L.fit 算出），没有改 shared/layout.mjs。
- 第二封红信封在段尾还停在 rsETH 前面（表示被拦下），seg5 起始画面里会看到它。
