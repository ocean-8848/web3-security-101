start: vaultA
end: walletsA

# ep18 seg1 自审

- 镜头：vaultA (L0–L1) → signersA (L2–L4) → A (L5–L7) → walletsA (L8–L11，静止到段尾)。
- 术语卡 3 张：多签@4.74s×3.6s，冷钱包@8.56s×3.6s，硬件钱包@38.02s×3.6s
- hyperframes check：0 error（警告只有 composition_file_too_large、narration 时长差 0.06s）；初版 "先猜" 对比度警告已改色修掉。
- layout_lint：版面检查通过（每 0.5s，到 46.5s）。
- 抽帧：两张拼图（8 帧 + 5 帧）。L0 点阵 + 图例、L6 六把钥匙绿地光 + 金库门开且柜内空、L9 六台硬件钱包"✓ 未泄露"、L11 题卡缩到右上，都能认出。

## 偏离 / 待定
- 金库用 `gold: false`：kit `safe` 的 `gold` 选项控制的是柜内金条，不是外观颜色。L6 要求柜内空，所以去掉金条。
- L4 签名：只放一个公章（签名界面旁，缩到 0.5），在第 4 次签名时落章；四个签名人依次 bump，门槛表液位 1→4 上升（不是每人一个公章）。
- L1 "灯红"：直接把 `meter-lamp` 设成红色，加标签"一把不够"；L2 开始前恢复为 off。
- 段内补了三个位置：LONE（L1 单独那把钥匙）、DIAL（L7 密码转盘，缩到 0.55）、SEALP（公章）。
- 衔接：BRIEF 第 2 节写 seg2 从 A 区起、L0 再摇到 B，但 seg2 starter 的 `cam0` 是 `schemesB`。如果 seg2 不改，seg1 结尾（walletsA）到 seg2 开头（schemesB）会跳一下。需要统筹决定。
- L7 的"没被破解 ✓ 解读"标签挨着门槛表顶灯，lint 没有报，但看着有点挤。
