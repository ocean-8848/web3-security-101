start: verifD
end: l2F

# ep14 seg5 自审

- **镜头**：verifD → aztecE（L0–L1）→ settleE（L2–L5）→ aztecE（L6）→ settleE（L7–L8）→ aztecE（L9）→ EF（L10）→ l2F（L11–L15）→ stageL（段内专用镜头，L16–L17）→ l2F（最后 2.5 秒，静止收尾）。
  - BRIEF 写的是 seg5 收在 F 区的 Stage 台阶。seg6 的 starter `cam0` 是 `l2F`，所以 L17 讲完后拉回 `l2F`。代价是 L17 的关键画面（委员会量筒 + Stage 0 高亮）只停约 2 秒。
- **termCards**：`术语卡 2 张：Rollup@60.75s×3.6s，许可模式@86.16s×3.6s`。没有被推迟的卡，也没有偏短的卡。
- **hyperframes check**：0 error。剩下的 warning：
  - `composition_file_too_large`：segbase 的通病。
  - 标题卡副标题 `line_unread`：segbase 默认标题卡只停 1.6 秒。
  - 3 处 `dead_stretch`（30.5、53.3、81.1 秒）：这几段的动作是点阵移动、警报灯转动、闸刀闪烁，都在 `#cam` 里，取样器看不到。
- **layout_lint**：通过。
- **看过的图**：1 张拼图，9 个时刻：2、8、24、34、47、64、78、101.5、107 秒。

## 未解决 / 留意

- L2 链和 D 区 L1 链之间的虚线（L10）从左下穿过 E 区，在 l2F 里看是一条长斜线，能读懂。
- `stageL` 镜头里，F 区的闸刀 `mode` 占在画面正中，没有挡住台阶和牌子。
- L12 的证明卡"有效性证明"只是长出来，没有画"送到 L1"的移动，靠 L10 那条 L2 → L1 虚线表达去向。
