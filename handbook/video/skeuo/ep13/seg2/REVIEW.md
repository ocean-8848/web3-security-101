start: solB
end: passB

# ep13 seg2 自审

- 镜头路线：solB → wide（L0–L4）→ evmA（L5）→ solB（L6）→ moveC（L7）→ btcD（L8）→ cosmosE（L9）→ wide（L10–L16）→ passB（L17，段尾静止，= seg3 cam0）。
- 术语卡 report：`术语卡 2 张：索引器@45.69s×3.45s，IBC@49.29s×3.6s`（无推迟）。
- `hyperframes check`：通过，0 error。剩余 warning：composition 文件行数多（所有段共有）、narration 87.74s 比 slot 87.82s 短 0.08s（音频侧，不在本段处理）。
- `layout_lint`：版面检查通过（修过：E 关名标签出右框 → 改成锚在道闸左侧；检查项卡字号提到 28px）。
- 抽帧：一次 snapshot，10 帧，只看了 2 张拼图。物件都认得出，每镜都对得上台词。

## 做法备注
- 五关全景下的屏幕层元素（放大小圈、红色走私者、金色资产方块 + 检查项叠卡）的位置都用 `S.scr("wide", …)` 算，所以只在 wide 镜头期间出现。
- PASS[3]"系统账户"护照用 broken 状态（接 seg1 L11 被拒收）；守护者签名证明卡用正常状态。
- 世界 box / grid 由本段用到的镜头的可视范围算出（加 300px 边距）。

## 未解决
- 段尾 passB 画面里，mintB 铸币机顶部压在右上胶囊附近（世界物件，layout 未报）。
- L14 走私者用的是屏幕层红色圆角块，不是 kit person（全景下 person 太小）。
