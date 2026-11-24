start: CAMS.wide
end: CAMS.signD

# ep21 seg3 自审

- 术语卡 report：术语卡 4 张：后门@21.52s×3.6s，SSH 密钥@26.35s×3.6s(左下)，多因素认证@35.68s×3.6s，交易模拟@110.33s×3.6s
- hyperframes check：0 error。警告只有这些：composition 文件太大、旁白比槽位短 0.08 s、标题卡副标题停留 1.53 s（segbase 默认时序）、5 处 3.0–3.4 s 的 dead_stretch（22.8、31.6、58.0、76.0、98.4 s）
- layout_lint：版面检查通过
- 看过的图：2 张 contact sheet（1、9、20、34、47、60、72、86、94、106、113、119 s）

## 镜头
wide（开场，A–G 各区主要物件都摆上了，所以标题卡下面不是空网格）→ L0 inviteA → L3 laptopC → L4 stealC（段内自定义：浏览器 + 工作电脑 + 机柜 + 硬件密钥）→ L8 deskC → L13 C → L15 cardC（段内自定义：C 区整体右移，给左侧代码卡 A 留位）→ L16 inviteA → L18（"3 名"）signD，最后静止在 signD。

## 未解决 / 注意
- 开场全景的各区状态是按 layout.mjs 的主物件推断的，没读 seg2。seg2 结尾"五样东西点亮"的高亮状态可能和这里对不上，统筹拼接时请核对 seg2 末帧和本段首帧。
- 工作电脑在 L3 变红后，本段一直保持红色（表示已被攻破）。
- D 区三名签名人缩放 0.5 后在 signD 里显得很小。
- 剩下 5 处 dead_stretch 警告还没处理。
