start: CAMS.hallA (L0 pans to gateB)
end: CAMS.roninB (static from ~92.1 s; seg3 cam0 = roninB)

# ep30 seg2 自审

- 术语卡 report：术语卡 4 张：许可链@3.58s×3.6s，链码@69.38s×3s，根 CA@72.53s×3s，背书@75.68s×3.6s；注意：根 CA 推迟 2.28s，背书 推迟 1.05s
- hyperframes check：0 error；警告 = 标题卡副标题停留 1.54 s（segbase 标准标题卡）、8.2–11.2 s 与 52–55 s dead_stretch（已加 bump，仍报；属轻微）、文件行数、音频长度差 0.06 s
- layout_lint：版面检查通过
- 看图：2 张拼图（9 帧 + 4 帧）

## 实现要点
- 段首 hallA：按 layout.mjs 摆好 A 区物件（4 机柜 Org1–4 + 绿工牌 + 账本、区块链、解析漏斗、扳道器、证明卡、门禁 + 灰攻击者、哈希签 / 两路签、题卡"风险在哪里？"、区牌）。题卡只写标题，未知 seg1 是否另有三行字。
- 段内专用镜头：frontB（L8 关键画面：前台 + 工牌堆 + 万能钥匙 + 物业，红虚线框 + "最值得攻击"）、breakB（L9–L12 比方不成立角）、rolesL（L13–L17 资源阶梯靠左，右侧四张入口卡 ck0–ck3）。
- L5"几家成员共谋"红框圈的是闸机后的四机构铭牌环（gateB 镜头里看不到三名 signer）。
- Ronin：5 把钥匙叠红色覆盖版淡入，门槛表红液升到 5，事件卡带"公开报道"。

## 未解决 / 待统筹确认
- hallA 首帧 A 区物件偏小，机柜大多被标题卡挡住；右侧两台机柜在缩略图里只辨认出一台（未逐帧核实）。
- 门槛表到 5 时顶灯按物件逻辑变绿（BRIEF 写"门槛灯红"），用 flash 强调，没改物件。
- 账本"翻页"用 bump 代替（ledgerBook 无翻页动画）。
