start: CAMS.bridge
end: CAMS.mintB (static, last action "信谁？" at ~110.5s; seg3 cam0 = mintB)

# ep12 seg2 自审

- 术语卡 report：术语卡 3 张：中继者@32.28s×3.6s，Merkle 证明@43.42s×3.6s，映射代币@54.23s×3.6s
- `hyperframes check`：通过，0 error。剩余 warning：composition_file_too_large（segbase 通病）、dead_stretch 22.35–25.38s（L5→L6 之间金库门关好、"锁定"标签有 bump，只差 0.03s）、text_below_floor（代码卡 24px 等宽，是代码卡，非阅读正文）。
- `layout_lint`：版面检查通过（每 0.5s 一次，共检查到 113.5s）。
- 截图：3 张 contact sheet（2/14/30/45/54/69/90/113s；9/31/50/70/96/104s；20/38/55.5/81/100.5/112.5s）。

## 做法要点
- 段内镜头 `boothT`（岗亭 + 证明卡 + 门限表 + 信任边界竖幕，右侧留给代码卡 A），L12–L15 用它代替 `booth`。
- B 区按 seg1 同几何重建（平台、Sky Mavis 虚线框、9 人 + 小钥匙、两块牌、桥、门限表、竖幕），但全部是正常态：钥匙全青蓝、门限表液位 0、岗亭正常、竖幕 L3 才出现。seg1 结尾是红钥匙飞到岗亭 + 岗亭攻破 + 门限表红；中间有标题卡隔开，视为新章节重置。
- 代码卡 A 第 1、2 行（msg 拆成两行）→ A 区消息支票；第 4 行（processed）→ C 区铸币机；第 3 行（verifyProof）→ 岗亭证明卡；L15 第 3–5 行依次打绿 chip"有效 / 没处理过 / 来源正确"。
- 中继者 + 信封沿 `bridge.deck` 过桥（relmv 外层 GSAP keyframes + X1.walk）。
- 比喻：`doc`"提货单"从 A 金库过桥到 C，放大、盖章，L19 KIT.broke（整张红虚线 + 红叉，代替"只章变红"）；铸币机 spill = 不存在的金子。
- L22 反向：C 区 100 点回流过桥到 A 金库，金库门打开；铸币机硬币清空、spill 收回，段尾铸币机为干净正常态。

## 未解决 / 留意
- A 链用 n 6 的 chain，后两块开场隐藏、L7 淡入（不是"长出"）；第 4、5 块之间的链环在隐藏时仍可见一小段。
- 铸币机在 mintB 里偏小（layout 的 mintB 框含 B 链和点阵），未改 shared/layout。
- 段尾 B 区竖幕、证明卡仍可见（seg3 从 mintB 开始，不在画面里）。
