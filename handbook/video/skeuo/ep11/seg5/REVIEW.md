start: CAMS.D
end: CAMS.E (static from ~95.0s; seg6 cam0 = E)

# ep11 seg5 自审

- 术语卡 report：`术语卡 2 张：熔断@44.34s×3.6s，cmETH@67.11s×3.6s`（无推迟、无偏短）
- `npx hyperframes check`：0 error。warning：composition_file_too_large（segbase 单文件，正常）、narration 98.14s vs 98.22s、标题副标题 line_unread（segbase 标题卡固定 1.15s 收起）、dead_stretch 33.45–36.73s（L6 期间动作在 #cam 内 SVG 上，取样器看不到；实际有红签出现 / 闪烁）
- `layout_lint`：版面检查通过（每 0.5s，到 98.2s）
- 抽帧：一次 snapshot（13 帧），只看了 2 张 contact-sheet

## 镜头路线
D → world（L0）→ worldHi（段内镜头，全景下移给上空旋钮留位，L1–L2）→ donate（L3–L4）→ xvs（L5）→ liq（L6）→ mint（L7–L8）→ market（L9）→ Cwide（L10）→ E（L11–L12）→ queue（L13–L15）→ E（L16–L17，静止）

## 未解决 / 留意
- E 区 `mempool` 在截图里看不到排队的普通信封（n=6），只有攻击者红信封会 walk 进去再退回；如需"信封排队"要查 mempool 的信封显示。
- L0 红框是屏幕层框（按 world 镜头换算），镜头到位后才淡入。
- 排队用户头顶小沙漏离头略高（约 40px），可接受。
- funcPanel 用 5 个按钮（第 5 个"新函数"按钮帽开场隐藏），面板比 4 键宽约 85px，donate 镜头内未出框；铭牌"新函数"开场就在（小字）。
