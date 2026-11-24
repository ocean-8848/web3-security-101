start: CAMS.nodesA
end: CAMS.hallA

# ep30 seg1 review

- 镜头：L0–L3 nodesA → L4 hashA → L11 hallA，末尾静止在 hallA（题卡在 L14 收起，只剩 A 区物件基础状态：灯绿、工牌挂上、账本恢复、扳道器扳回）。
- 术语卡 report：`术语卡 2 张：联盟链@2.01s×3.6s，世界状态@35.03s×3.6s`
- `hyperframes check`：0 error；警告 3 条：composition 文件行数、标题卡副标题 line_unread（segbase 标题卡固定 1.6 s）、dead_stretch 54.07–57.19（快照里 55.1 s 题卡已出现，属误报或可忽略）。
- `layout_lint`：版面检查通过。
- 看图：1 张 contact sheet（9 帧）。

## 偏离分镜 / 未解决
- L14"右侧 B 区联盟大厦牌和闸机淡入"未做：hallA 看不到 B 区，交给 seg2 L0 右移时出现；"题卡缩到右上"改成题卡淡出，保证末帧 = seg2 起始帧。
- 题卡用世界标签（lb）而不是原生 SVG，字号固定；标题"风险在哪里？"渲染出来和三行小牌差不多大，未强调。
- 工牌 0.5 倍在 nodesA 下很小，主要靠绿勾标签读出"有效证书"。
- 攻击者用灰色身体（`color` #9a958c），头部仍是 kit 攻击者红色。
- 事件卡与来源卡合并成一张（同位置两张会报错）。
