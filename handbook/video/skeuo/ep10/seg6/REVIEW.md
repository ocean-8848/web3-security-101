start: CAMS.F
end: CAMS.world (static, end card)

# ep10 seg6 自审

- 术语卡 report：`术语卡 1 张：存储布局@14.32s×3.6s`
- `npx hyperframes check`：0 error；warning 2 条（composition_file_too_large，narration 68.58s vs slot 68.64s，均为 segbase 通用）；info 为结束卡 endveil 遮住胶囊（有意）
- `layout_lint`：版面检查通过（每 0.5s，到 68.6s）
- 看图：2 张（contact-sheet-1 / contact-sheet-2）

## 镜头
F → roles（L0–L5）→ A（L6）→ door（L7）→ gate（L8）→ B（L9）→ world（L10，结束卡）。grid/box 由世界画布 [-7600,-2200,11800,3500] 换算，盖住 F（X ≈ −7110）到 D/E（X ≈ 3760）。

## 结束卡
标题 = script.json title（全长，`#endcard .e-main` 字号降到 66px 以免溢出），收束句「谁能换规则，谁就拥有这笔钱」，下一集 · DeFi 经济安全。

## 简化 / 未解决
- L2 审计：没有在世界里放两本 `manual`，改成屏幕卡「存储布局比对」+「初始化参数（解码）」卡，红虚线连到审计手里的放大镜。
- L1 代码卡 D 的两行没有画红虚线连到挂锁 / 信封，用行高亮 + 物件同时出现代替。
- C / D / E 区只放了几台售货机和档案柜，供结尾全景用（k 0.166 下只是剪影）。
- 修复后（升级钥匙标签改为 bump、代码卡加宽）没有再截图，只用 check + lint 确认。
