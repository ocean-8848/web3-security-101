start: rangeD
end: voteE

# ep16 seg5 自审

- 术语卡 report：术语卡 3 张：排序器@42.31s×3.6s，unsafe 头@46.49s×3.6s，见证人@87.31s×3.6s
- `npx hyperframes check`：0 error。警告：composition_file_too_large；标题卡 line_unread（segbase 默认 1.6 s 标题卡）；dead_stretch ×3（7.2–10.2、12.2–15.4、65.7–69.1 s，动作在 #cam 内 SVG 属性上，取样器看不到：洪泛信封 walk、时钟、信号柱灯）。
- `layout_lint`：版面检查通过。
- 看图：2 张 contact sheet（12 帧：3.5/9/14/29/36/48/62/68/72/84/92/99.5 s）。

## 镜头
rangeD →（L0）haltE →（L9）seqE →（L17）voteE，段尾静止在 voteE。

## 说明 / 未解决
- D 区 rangeD 物件（主链、改写的历史、旧私钥、新节点、两份检查点、放大镜）以静态布景放入，只为开场衔接；状态未必与 seg4 段尾完全一致。
- 石板路用原生 polyline 自画（ROAD 点），宽度/颜色可能与别段不同。
- L17 "别人的动机"用屏幕关键词卡代替 roleBoard 小图标闪烁（去掉了 flash，避免 line_unread）。
- L18 金条为原生 SVG 三块，从保险柜门口平移到投票箱投信口后淡出；箱内金条仍在（只是质感）。
- 区块箱"掀回"用 GSAP 平移 + 变淡 #sorter-block 实现，L11 两次、L13 一次。
