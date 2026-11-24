start: mintB
end: upgrade

# ep12 seg3 自审

- 术语卡 report：术语卡 5 张：MPC@8.68s×3.6s，区块头@28.97s×3.6s，欺诈证明@48.89s×3.6s，Rollup@59.01s×3.6s，可信设置@72.58s×3.6s（无推迟、无偏短）
- `hyperframes check`：0 error。warnings：composition_file_too_large；clip_media_fit（音频比 slot 短 0.06s）；line_unread（标题卡副标题 1.54s，starter / segbase 管）；dead_stretch 108.4–111.6s（L21 末尾，世界层 bump 取样器看不到）
- `layout_lint`：版面检查通过
- 看图：2 张 contact sheet（8 帧 + 2 帧）

## 镜头路线
L0 mintB → hallD（四块摊名依次长出，"差别在于：你信任谁？"）→ L1–L4 dMulti → L5–L8 dLight → L9–L12 dOpt → L13–L15 dZk → L16–L22 upgrade（段尾静止）。

## 做法备注
- 摊 1 门限表、摊 4 电路板按 layout 用 wrap 缩放；coreModule 本身支持 opts.scale，直接传 0.6（没包 wrap）。
- L14 额外放了一本 0.5 倍 ledgerBook（grow 长出、红叉划掉），L15 结束前淡出，避免进入 upgrade 镜头和 coreModule 位置重叠。
- L18 关键画面：coreModule"新实现"用 X10.push 推到 ZK 摊证明卡位置，证明卡淡出、电路板降到 0.3 透明度（表示被绕过），随后 X10.pull 拉杆；L19 墨底标签"证明系统 ＋ 升级权限"留到段尾。
- 来源卡 L20 "L2BEAT 页面 · 截至 2026 年"标"第三方分析"。

## 未解决 / 交给后续段
- L4 brief 写"红虚线连回 B 区平台（远景）"：未做远景连线，只在摊 1 贴了 "Ronin（2022）" 红描边签。
- 段尾 coreModule 已被推离 L.COREM（停在 ZK 摊证明卡位置附近），seg4 起于 upgrade：若 seg4 在 COREM 原位放 coreModule，会有一次跳变。
- 展台尽头没放 timeLock（brief 说 seg5 L10 才出现），upgrade 镜头右上留空。
