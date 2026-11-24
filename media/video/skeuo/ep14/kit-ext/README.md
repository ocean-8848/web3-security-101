# ep14 补充拟物物件（kit-ext）

本集 BRIEF 第 2 节"需要新补的拟物物件"表里的 2 个物件：答题卡 `answerSheet`、阅卷机 / 验证器 `gradingMachine`。它们和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `broken` / `attacker` 之一，`opts.glow` 控制地光（默认关），`opts.scale` 以地面原点等比缩放（anchors 已换算）。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，`KIT.grow` 可以直接用；骨架里多一层 `ID-mv`（整件包一层）。坐标约定、颜色语义见 `../../kit/README.md`。

**注意**：
- broken 只标"坏的那一处"（答题卡：卡面红虚线框；阅卷机：正面显示窗 + 灯一圈红虚线框），各带红叉，整件不变虚，所以 `ID-wire` 是空的。不要对它们用 `KIT.broke`，改用 `KITX14.sheetBad` / `KITX14.machineBad`。
- **id 不要取 `cam`**（舞台的镜头容器就是 `#cam`）。建议答题卡 `sheet`、阅卷机 `gm` / 验证器 `vf`。A 区和 D 区同款机器用两个不同 id。

样张：`showcase.png`，来自 `demo/`（8 秒，两屏）。每行是一屏，左列是动作前，右列是动作后。第一屏：答题卡逐行涂格 → 阅卷机进卡口升起一张卡 → 下沉读入 → 绿灯"通过" → 答题卡盖绿勾；右边一张 0.8 的答题卡最后一行多涂 3 格红色、仍盖绿勾；kit `person` 0.7 做比例对照。第二屏：attacker 验证器（外圈红虚线，绿灯"满足电路"）改回红灯"不通过"；broken 阅卷机 0.8、broken 答题卡 0.7 修回。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | `answerSheet`、`gradingMachine`，另有 `CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX14`**。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时样张工程：`node src/build.mjs`，然后 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { answerSheet, gradingMachine, runtimeExtJs as rt14 } from "../../kit-ext/objects-ext.mjs";
// segbase 写法：import * as X from "../../kit-ext/objects-ext.mjs"; segInit(…, { ext: [X, …] }) 后在 SHOTS 里用 X14.xxx
// 手写 <script>：先 kit 的 runtime，再其他集的 ext，最后本集的
//   ${runtimeJs()}
//   ${rt02()}
//   ${rt14()}
//   KITX14.grade(tl, "gm", 2.0, "green");
```

- **调用名一律用 `KITX14.xxx`**（segbase 里是 `X14.xxx`）。它也会合并进 `window.KITX`，但合并时**已存在的名字一律不覆盖**（`lamp`、`card`、`ring` 之类很可能已被别集占用）。
- 所有助手签名都是 `(tl, id, t, …)`；同一部件多次调用按时间顺序写，每次从上一次的终值开始。
- 运行时直接写属性的部件只交给助手去动，不要再对它们用 GSAP 的 x/y/rotation/scale：`ID-card`（transform）、`ID-scr-t`（文字 / 颜色 / 字号）。

## 物件清单

### `answerSheet(o, opts)`：答题卡

约 90×20×140（卡面 90×120，黑色夹座 z 0–18）。米白卡面、青蓝边框，顶部青蓝页眉（"答题卡"）；`rows` 行 × `cols` 个椭圆涂格，每行左侧题号。卡面在 v = 1.5 的竖直面里，**正面朝 +v**（看向观众）。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `rows` / `cols` | `5` / `4` | 行数、每行格数 |
| `filled` | 每行 1 格（`[[1],[2],[0],[3],[1]]` 循环） | 每行涂了哪几格：数组的数组，或每行一个数字 |
| `blank` | `false` | `true` = 正常涂格先隐藏，用 `sheetFill` 按行逐个出现 |
| `mark` | attacker `"ok"`，其他 `"none"` | 右上角判分章：`"ok"` 绿勾 / `"bad"` 红叉 / `"none"` |
| `title` | `"答题卡"` | 页眉字，`""` 不画 |
| `scale` | `1` | 支持，anchors 已换算 |

- 状态：normal 每行 1 格墨色；attacker 最后一行其余格涂成红色（`ID-extra` 显示 = 4 格全涂），判分章仍是绿勾（= 照样判对）；broken 卡面红虚线框 + 红叉。
- 可动：
  - `KITX14.sheetFill(tl, ID, t, rows=全部, gap=0.22, dur=0.18)`：正常涂格逐行出现（配 `blank: true`），返回结束时间。`ID-fill-0..`。
  - `KITX14.sheetRow(tl, ID, t, row, on=true)`：单独显示 / 隐藏一行的正常涂格（"反复改填"时可配 `wlab` 数字）。
  - `KITX14.sheetExtra(tl, ID, t, on=true, gap=0.15)`：最后一行多涂的红格逐个出现 / 全部消失，返回结束时间。`ID-extra-0..`。
  - `KITX14.sheetMark(tl, ID, t, "ok" | "bad" | "none")`：判分章。`ID-mark-ok` / `ID-mark-bad`。
  - `KITX14.sheetBad(tl, ID, t, on=true)`：卡面红虚线框 + 红叉。`ID-bad`。
- anchors：`top`、`center`、`ground`、`rows[0..rows-1]`（每行涂格区中心，红虚线连线用）、`mark`（右上角判分章）、`extra`（最后一行多涂格的中心）。

### `gradingMachine(o, opts)`：阅卷机 / 验证器

约 160×120×100（机身 u ±80、v −45..45，出卡托盘伸到 v 74；后半斜面顶 z 100 → 70）。浅灰机身，斜面上一道横向进卡口；正面（+v）深色显示窗 + 判定灯 + 出卡缝，前方出卡托盘；−u 侧面铭牌写 `title`。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `title` | `"阅卷机"` | 侧面铭牌（D 区写 `"验证器"`） |
| `lamp` | `"off"`（attacker `"green"`） | `"green"` / `"red"` / `"off"` |
| `fed` | `false` | `true` = 进卡口露出一张卡的上沿 |
| `screen` | 绿灯 `"通过"`，红灯 `"不通过"`，否则空 | 显示窗文字 |
| `scale` | `1` | 支持，anchors 已换算 |

- 状态：normal 灯灭或绿灯"通过"；attacker 灯仍是绿的"通过"，机身外一圈红虚线（= 判对了错的东西）；broken 正面显示窗 + 灯一圈红虚线框 + 红叉，灯灭。
- 可动：
  - `KITX14.card(tl, ID, t, up=true, dur=0.5)`：进卡口的卡升起露出 / 下沉读入（被进卡口裁掉），返回结束时间。`ID-card`。要表现"答题卡 / 证明卡送进来"：段里把卡片物件走到 `anchors.slot` 并淡出，同时 `card(…, true)` 再 `card(…, false)`。
  - `KITX14.lamp(tl, ID, t, "green" | "red" | "off")`：判定灯。`ID-lamp-g` / `ID-lamp-r`。
  - `KITX14.scr(tl, ID, t, text, tone)`：显示窗换字；`tone` `"red"` 红字、`"white"` 白字，否则绿字；字号按长度自动缩（7 字以上 10px，"对这些公开输入成立"这种长句建议改用 `wlab` 贴 `anchors.scr` 上方）。`ID-scr-t`。
  - `KITX14.ring(tl, ID, t, on=true)`：外圈红虚线。`ID-ring`。
  - `KITX14.machineBad(tl, ID, t, on=true)`：正面红虚线框 + 红叉。`ID-bad`。
  - `KITX14.grade(tl, ID, t, tone="green", text, dur=0.5)`：一次判卷 = 卡下沉 → 灯 + 屏幕字（默认"通过" / "不通过"），返回结束时间。
- anchors：`top`、`center`、`ground`、`slot`（进卡口）、`lamp`、`tray`（出卡托盘中心）、`scr`（显示窗中心）、`plate`（侧面铭牌中心）。

## runtime-ext.js · window.KITX14

| 调用 | 物件 |
| --- | --- |
| `sheetFill` / `sheetRow` / `sheetExtra` / `sheetMark` / `sheetBad` | 答题卡 |
| `card` / `lamp` / `scr` / `ring` / `machineBad` / `grade` | 阅卷机 / 验证器 |

离散切换（屏幕换字）在 seek 回去时会恢复成之前的状态。

## 已知不足

- `hyperframes check` 报 `dead_stretch`，原因同 kit：动作都在 `#cam` 里的 SVG 属性上，取样器看不到，snapshot 可确认在动。
- 东西小：倍率 1 左右答题卡题号、阅卷机铭牌刚好能认；要观众读的字（"漏写""照样判对"等）用 `wlab` 贴 anchors。
- 答题卡只有正面朝 +v；阅卷机铭牌在 −u 侧面，镜头从右侧看时看不到，必要时 `wlab` 贴 `anchors.plate`。
