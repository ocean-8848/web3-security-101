start: ruleA
end: verifD

# ep14 seg4「④ 规则之外」自审

- 术语卡 report：`术语卡 4 张：zkVM@51.82s×3.48s，查找表@55.45s×3.6s，承诺@63.54s×3.6s，安全委员会@68.76s×3.6s`
- `npx hyperframes check`：0 error。剩下的 warning 是 composition_file_too_large，以及标题卡副标题 line_unread（1.54 s）。后者来自 segbase 的标题卡时长，不是本段代码造成的。
- `layout_lint`：版面检查通过。
- 看过的图：4 张 contact sheet（不超过 4 张）。

## 镜头路线
ruleA → L0 本段专用的 `ABCD`（A–D 全貌，B/C/D 牌子依次弹出"一""二""三"）→ L1 setupB → L5 zcashB → L8 proverC → L10 committeeC → L12 verifD → L14 clockD（L14–L17 不动，因为代码卡 C 的红虚线连到登记簿）→ L18 verifD，静止到段尾。

## 实现说明
- 世界里放了 A（静态，为了和 seg3 衔接）、B、C、D 四区的物件，外加传送路、链下|链上分界线和小牌子。E、F 不在任何镜头里，没有画。
- slotCabinet、thresholdMeter、clock 按常见坑 1 包了一层缩放（putW），并换算了 anchors。coreModule、mintPress、dispatchDesk、burnBox、person 直接传 scale。
- 证明卡上的"陈述 A/B"和"x""x + r"是卡片 hid 组里的原生 SVG 字牌，会跟着卡片一起移动。

## 未解决 / 可留意
- L15 第 1 行整行变淡时，行尾"缺这一行"红 chip 也跟着变淡，还能看清但不够醒目。
- 时间条卡（L7）宽 1180，后两步淡入前，卡片右半边留白。
- 证明卡走进进卡口用的是屏幕位移（x/y），没有接 walk 助手。
- 没有任何物件用 id `cam` 或 `root`。
