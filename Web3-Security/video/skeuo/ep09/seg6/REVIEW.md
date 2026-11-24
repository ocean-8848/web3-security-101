start: CAMS.F
end: CAMS.world (static, end card over it)

# ep09 seg6 · 自审

- 术语卡 report：`术语卡 1 张：盲签@42.87s×3.6s`
- `npx hyperframes check`：0 error。剩 1 条 warning `composition_file_too_large`（2843 行，全世界物件都摆上了，L5 / L10–L12 的全景要用）
- `node ../../tools/layout_lint.mjs .`：版面检查通过
- 看图：5 张（两张 contact sheet + 一张 contact sheet + 两张 20.8s 单帧，用于校准复印件落点）

## 镜头路线
F → roles（L0–L4）→ world → A（L5，经全景过渡，不直接横移 1 万像素）→ A（L6–L8）→ poolSorter（L9）→ world（L10–L12，66.2s 起静止）

## 本段局部位置（未改 layout.mjs）
- `CHQ6` P(9230,150) scale 2.0：F 区左侧工作台的五格支票
- `CLAIM6` P(9480,-40) scale 0.55：同一工作台的小号领取合约
- `HW6` P(-530,70) scale 0.6：A 区"你"左侧的硬件钱包

## 未解决 / 取舍
- L5"把量筒刻度线调紧"没有做刻度移动：BRIEF 要求结尾量筒停在 19000，再加一个新数字会和讲稿口径冲突。改成量筒 bump 加"合理的滑点"标签
- L1 代码卡的"调用者传入" chip 稍微伸出卡片右边，lint 没报
- `KITX09.copyTo` 实测：复印件的位移被支票的 `scale`（2.0）放大，落点不是 README 说的"世界画布点"。`SLOT` 按实测反算（见 build-story 注释），落点已确认在领取合约上
- 全景 k 0.14 下各区物件都很小，只用来表示"这是同一个世界"；关键词卡和绿圈放在屏幕层，从 `S.scr("world", …)` 求位置
