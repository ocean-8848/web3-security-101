start: CAMS.donate
end: CAMS.A (static from 69.9 s; hold 1 s)

# ep11 seg1 自审

- 术语卡 report：`术语卡 2 张：储备@16.14s×3s，抵押品@19.29s×3.6s；注意：抵押品 推迟 0.36s`
- `npx hyperframes check`：0 error（Lint 1 warning = composition_file_too_large；Craft 3 warning，见下）
- `layout_lint`：版面检查通过（每 0.5s 一次，共检查到 72.3s）
- 看图：3 张 contact-sheet（9 帧 + 2 帧 + 1 帧），共 3 张图

## 镜头
donate（L0–L1）→ 段内 codeA（L2–L4，代码卡在右，入口/售货机/储备/天平在左，曲线期间镜头不动）→ balance（L5–L6）→ A（L7–L10）→ donate（L11–L12）→ A（L13，段尾静止）。

## 与 BRIEF 的出入
- L3 没有单独推到天平：L2–L4 共用 codeA 一镜，保证 cv1 / cv3 曲线不随镜头漂移；天平倾斜 + "抵押品 ↓" + 红虚线在同一镜内完成。
- L5 题卡直接写"先猜：缺口？"（L7 只 bump 一下），没有分两行出现。
- "金币沿 pipe 滚进储备"用管道金色流动虚线 + 保险柜门开合表示，没有单独的硬币沿管滚动。
- 左盘硬币堆没有变矮（balance 无此部件），用倾斜 + 标签表达。
- L7–L10 在 A 中景（k 0.534），点阵较小但可辨；关键画面里入口面板、天平、红点、坏账框同框。

## 未解决
- Craft `dead_stretch` 43.8–47.3 s、53.5–57.9 s：这两段的动作（天平倾斜、红点闪、坏账框闪、标签 bump）都在 `#cam` 里的 SVG 上，取样器看不到（kit 已知不足）。
- Craft `line_unread`：标题卡副标题 1.53 s，来自 segbase 标题卡，段内未改。
- L9 天平 -16° 倾斜在缩略图里不算很醒目（67 s 帧可见左盘抬起）。
