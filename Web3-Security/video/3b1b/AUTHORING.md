# 制作规范：一集 3b1b 风格学习视频

本规范来自 EP01 的实际做法。EP01（`EP01-security-landscape/`）是参考实现：动手前先读它的 `STORYBOARD.md`、`narration.json`、`index.html` 和 `compositions/*.html`。

## 1. 交付物（每集）

```
EPNN-<slug>/
  STORYBOARD.md        概要、颜色语义表、叙事结构、分镜表、材料观点 vs 解读者判断、成立条件与风险
  narration.json       旁白（按场景、按句）
  cues.json            tools/tts.py 生成
  index.html           根合成：场景宿主 + <audio id="narration">
  compositions/*.html  每个场景一个文件
  assets/fonts/noto-sc.woff2   tools/subset_font.py 生成
output/EPNN-<slug>.mp4 与 .srt
```

`<slug>` 取章节文件名去掉序号，例如 `04-reentrancy.md` → `EP04-reentrancy`。

## 2. 内容规则（来自 AI解读 skill）

- 来源：`Web3-Security/NN-*.md`。先完整读完本章，再写。读不到或不确定的地方不要猜。
- 先在 `STORYBOARD.md` 写骨架：一句话核心观点、支撑结构、关键术语、成立条件 / 例外 / 风险、不确定之处。
- 叙事结构：**钩子**（本章"开场"的真实案例，抛出一个问题）→ **铺垫**（最简单的具体例子）→ **逐步构建**（每个场景只加一个想法）→ **关键洞见**（"看懂了"的那一刻）→ **回顾**（回到钩子的问题，给出答案和成立条件）。结尾一句预告下一集（EP30 改为系列收尾）。
- 先直觉、后形式：公式、定义、清单放在最后。
- 忠于原文：数字、日期、金额只用章节里写了的；金额是"事发时美元估值约数"；示例数值说明是示例。不要把材料没说的写成材料的观点。`STORYBOARD.md` 第 5 节分开列出"材料的观点"和"解读者的判断"（取舍、归类、示意数值）。
- 只讲防御与机制，不给针对真实系统的攻击步骤。
- 时长 5–8 分钟。中文约每秒 4 个字：旁白总字数约 1,300–2,000。8–10 个场景，每场景 4–7 句。
- 旁白是口语，短句，一句一个意思，同一个概念始终同一个名字。比喻先给准确表述，再给比喻，并说一句比喻哪里不成立。旁白不念屏幕上的字。

## 3. 颜色语义（全系列固定）

| 概念 | 颜色 |
|---|---|
| 合约 / 代码（类别 ①–⑤） | 蓝 `#58C4DD` |
| 资产 / 资金 / 交易 | 金 `#F0B90B` |
| 攻击者 / 损失 / 失守 | 红 `#FC6255` |
| 信任边界 / 警示 / 待回答的问题 | 橙 `#FF9F43` |
| 不变量 / 成立 / 修复后 | 绿 `#83C167` |
| 代码之外（类别 ⑥：私钥、人、流程、基础设施） | 紫 `#B48EF0` |
| 中性对象 / 对照组 | 灰 `#8a8f99`；正文 `#e8e6df`；弱文字 `#6b6f7a`；背景 `#0f1117` |

一集里新出现的概念若需要颜色，从上表选最接近的含义，并在该集颜色语义表里写明。

## 4. 画面规则（3b1b）

- 深色背景，画面上只留当前要讲的对象，屏幕文字少。
- 一次只引入一个新对象；新对象从已有对象长出或变形，不要整张图一次出现。
- 画面承担论证：机制要画出来（余额条变化、调用栈叠起、箭头回调、签名字段……），不要做成"要点列表幻灯片"。避免一排三张卡片、图标套圆圈。
- 每集至少有一处"具体数字一步步算"（取自章节或标明示例）。
- 镜头转场：场景结尾 0.4–0.5 s 模糊淡出；有条件时让下一场景的第一个对象出现在上一场景最后对象的位置。

## 5. 技术约定（HyperFrames）

1. 新建：`tools/new_episode.sh EPNN-<slug>`（复制 EP01 骨架）。
2. 写 `narration.json`（格式同 EP01；`voice` `zh-CN-YunxiNeural`，`rate` `+5%`，`pitch` `+3Hz` 不要改）。
3. 先写 `index.html`（照抄 EP01，换场景 id）和各场景文件（`/*CUES*/{}/*END*/` 占位），再跑：
   `python3 tools/tts.py EPNN-<slug>` —— 合成云希旁白、生成 `cues.json`、把每句时间写进场景文件的 CUES 块，并改写 `index.html` 里各宿主的 `data-start` / `data-duration` 与总时长。改了旁白就重跑。
4. 场景文件写法（照 EP01）：
   - 所有内容在 `<template>` 里；根元素 `id="root"`、`data-composition-id` 与 `index.html` 里宿主 id 相同；`data-duration` 写在根上（tts.py 会改写）。
   - 每个场景开头复制 EP01 的 `<style>`（`@font-face NotoSC`、`#root`、`.h{opacity:0}`、`.dr{stroke-dasharray:1;stroke-dashoffset:1}`）。
   - 全部 id 加场景前缀（`#m-box`），整集唯一。
   - 用 SVG `viewBox="0 0 1920 1080"` 画。脚本里复制 EP01 的 `C / L / at(i, f) / IN / OUT / DRAW` 助手；动画只用 `tl.fromTo` / `tl.to`，时间写成 `at(句号, 句内比例)`，让画面在旁白说到它时出现。
   - 线条"画出来"：`pathLength="1"` + `class="dr"` + `DRAW`。**带 `marker-end` 箭头的路径必须同时 `class="h"`，并在 DRAW 里把 opacity 0→1**，否则箭头头部会提前出现。
   - 不要用 CSS `transform`；不要 `Math.random()`（需要随机就用 EP01 invariant 场景的固定种子 LCG）；不要 `repeat: -1`；可以 `repeat: 1..3`。
   - 结尾：`tl.to("#X-all", {opacity:0, filter:"blur(6px)", duration:0.4}, C.d - 0.5)`；`window.__timelines["<id>"] = tl`。
   - 字号 ≥ 28 px（阅读文字），标题 44–96 px。内容留在 1920×1080 内，左右各留 ≥ 60 px。
   - SVG 元素缩放 / 旋转的中心用 **`svgOrigin: "x y"`**（画布坐标）。`transformOrigin: "960px 540px"` 在 SVG 上是相对元素自身包围盒的，入场动画会从错误的位置长出来；`transformOrigin` 只用百分比（`"50% 50%"`）。
   - 等宽代码：给 `<text>` 加 `class="mono"`，并在场景 `<style>` 里写 `#root .mono { font-family: "JetBrains Mono", monospace; }`（照 EP01 attacker 场景）。直接写 `font-family` 属性会被 `#root text` 规则覆盖。中文一律 `NotoSC`；**`.mono` 元素里不要放中文**（会回退到子集外的字体）。
   - `tl.fromTo` 一创建就把"起始状态"立即渲染出来（GSAP 默认 `immediateRender: true`）。对**已经可见**的元素做后段的状态变化（计数器、移位、换色）时，用 `tl.to`，或在 fromTo 的第三个参数里加 `immediateRender: false`，否则元素会提前跳到起始状态。
   - `tools/tts.py` 联网合成，一集可能要 3 分钟以上，可以放后台跑。`check` / `snapshot` 加 `--json` 时把 stderr 重定向掉（`2>/dev/null`）再解析。
5. 裁字体（每次改了屏幕文字都要重跑）：
   `python3 tools/subset_font.py tools/.cache/NotoSansSC.ttf EPNN-<slug>`
6. 检查：在集目录里 `npx hyperframes check --json`。**error 必须为 0**。`text_below_floor` 修到只剩缩放过渡中的瞬时项。`dead_stretch` 超过 6 秒的要补一个与旁白对应的动作。
7. 看帧：`npx hyperframes snapshot --at <每句旁白结束前 0.2 s 的绝对时间，逗号分隔>`，读 contact sheet。逐张检查：文字重叠、出框、箭头提前出现、元素该消失没消失、画面与旁白不符。修完再看一次改过的时刻。
8. 渲染（同一账户一次只跑一个渲染，命令会自动排队等待，正常）：
   `npx hyperframes render . -o ../output/raw/EPNN-<slug>.mp4 --skill=hyperframes --quiet`
9. 压字幕（画面缩到 88% 放在上方，字幕在下方 130 px 的条带里，不遮挡画面；同时写出同步的 .srt）：
   `python3 tools/burn_subs.py EPNN-<slug> output/raw/EPNN-<slug>.mp4 output/EPNN-<slug>.mp4 output/EPNN-<slug>.srt`（在 video/3b1b/ 下运行）。
10. 验收：`ffprobe` 时长 ≈ `cues.json` 的 duration，有 h264 + aac 两路流；从成片抽 6–9 帧拼图看一眼。

## 6. 多音字

- 云希会把不常见的词读错，例如"重入"读成 zhòng rù、"回调"读成 huí tiáo。
- 修正办法：在 `tools/pronounce.json` 里加一条 `[原词, 同音字]`，替换字选只有一个读音的字（重入 → 虫入）。只影响送给 TTS 的文字，字幕和 narration.json 保持原文。改完重跑 `tools/tts.py`，只有受影响的句子会重新合成。
- 没有单读音同音字的（如表示"必须"的"得 děi"），直接改写旁白（"得先" → "先要"）。
- 写新一集时，先检查旁白里的多音字：用 pypinyin 看默认读音，默认读音错的词，TTS 多半也会读错。`tools/check_pron.py` 用语音识别辅助检查，但识别会偏向预期的词，查不出所有错误。

## 7. 完成标准

- [ ] 第一句旁白就进入钩子；结尾回到钩子的问题并给出答案和成立条件。
- [ ] 每个场景只讲一个想法；颜色语义与第 3 节一致。
- [ ] 数字与章节一致；示例数值已标"示例"或写进第 5 节。
- [ ] `STORYBOARD.md` 分镜表各镜时长相加 = 成片时长（可照 EP01 用脚本由 cues.json 生成表格骨架）。
- [ ] check 无 error；看过整集的帧；MP4 与 SRT 在 `output/`。
