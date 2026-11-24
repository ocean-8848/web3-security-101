start: reward
end: D

# ep11 seg4 自审

- 镜头路线：reward → D（L0）→ offchain（L3）→ D（L6–L7）→ offchain（L8）→ market（L9）→ spiralC（L10，段内专用，fit 螺旋 / USDC 价格 / 铸币机 / 门限表）→ mint（L11–L14）→ offchain（L15）→ market（L16–L18）→ D（L19，静止到结尾）。
- 术语卡 report：`术语卡 3 张：赎回@13.41s×3.6s，死亡螺旋@70.45s×3.6s，订单簿@124.38s×3.6s`（无推迟、无偏短）。
- `npx hyperframes check`：0 error。警告：composition_file_too_large（kit 结构决定）；3 处 dead_stretch（50.2–53.5、77.6–80.9、86.6–89.6 s），这几段的动作在 `#cam` 内的 SVG 上（bump / wheel / flash），取样器看不到，同 kit-ext README "已知不足"。
- `layout_lint`：版面检查通过（每 0.5 s，共 140.5 s）。
- 看图：contact-sheet 2 张（11 帧：1, 9, 25, 34, 58, 72, 79, 96, 107, 127, 139.5 s）。物件可认，L4 提货单金边 / 作废、L5 两张对照卡、L19 三路红流 + 红框都在。

## 段内本地补充
- `LBOT`（E08 liqBot 0.6，第三个摊位右边，L18 夹走抵押品）。
- 镜头 `spiralC`。
- SVB（safe 0.7）与链下管理人（desk 0.6）按常见坑 1 包一层并换算 anchors。

## 未解决 / 取舍
- 储备保险柜用 `gold:false` 表示"货不够"（safe 没有"半仓金条"选项），开门后显示空仓 + 红标签"货不够"。
- 仓库被封用红标签表示，没有单独封条物件。
- USDC 价格曲线用 twapRecorder 走纸 + 读数窗红字"0.87"，曲线形状是物件自带的，不是真实下探形状；DAI 是标签。
- L19 储备管 → 铸币机的流没有变红（那根管是青蓝流，L3 起已收起），红色只走铸币机 → 三路下游。
- 画面左下角在 D / offchain / market 镜头里会露出一点 C 前排奖励站的物件（世界连续，不是错误）。
