# ep16 补充拟物物件（kit-ext）

本集 BRIEF 第 2 节"需要新补的拟物物件"表里的 2 个物件：最终性信号柱 `finalitySignal`、道岔扳道器 `forkSwitch`。它们和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 见各物件，`opts.glow` 控制地光（默认关），`opts.scale` 以地面原点等比缩放（anchors 已换算）。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，`KIT.grow` 可以直接用；骨架里多一层 `ID-mv`（整件包一层）。

**注意**：
- 两个物件的 broken 都只标"出问题的那一处"（信号柱：finalized 那一格；扳道器：整件外框），红虚线框 + 红叉，整件不变虚，`ID-wire` 是空的。不要对它们用 `KIT.broke`，改用 `KITX16.sigBad` / `KITX16.swBad`。
- **id 不要取 `cam` 或 `root`**（舞台容器）。建议 `sigA`、`fsw` 之类。

样张：`showcase.png`，来自 `demo/`（10 秒，两屏）。每行是一屏，左列是动作前，右列是动作后。第一屏放了 E07 `dispatchDesk`（0.8）和 kit `person` 做比例对照，第二屏另有 kit `chain`（n 2）和 `person`。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | `finalitySignal`、`forkSwitch`，另有 `CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX16`**。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时样张工程：`node src/build.mjs`，然后 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { finalitySignal, forkSwitch, runtimeExtJs as rt16 } from "../../kit-ext/objects-ext.mjs";
// segbase 写法：import * as X from "../../kit-ext/objects-ext.mjs"; segInit(…, { ext: [X, …] }) 后在 SHOTS 里用 X16.xxx
// 手写 <script>：先 kit 的 runtime，再其他集的 ext，最后本集的
//   ${runtimeJs()}
//   ${rt16()}
//   KITX16.sig(tl, "sigA", 2.0, 2);
```

- **调用名一律用 `KITX16.xxx`**（segbase 里是 `X16.xxx`）。它也合并进 `window.KITX`，但已存在的名字不覆盖。
- 所有助手签名都是 `(tl, id, t, …)`；同一部件多次调用按时间顺序写，每次从上一次的终值开始。
- 运行时直接写 `transform` 的部件只交给助手去动：`ID-lever`、`ID-disc`。

## 物件清单

### `finalitySignal(o, opts)`：最终性信号柱

约 40×40×200。水泥小底座 + 墨色立杆，顶上黑色竖长信号头（正面朝 +v），自上而下三盏圆灯，每盏灯右侧一块白底小铭牌。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `labels` | `["finalized","safe","unsafe"]` | 铭牌字，**自上而下** |
| `lit` | normal `2`，pending / broken `1` | 亮到第几档：0 = 只亮 unsafe，1 = 亮到 safe，2 = 亮到 finalized，-1 = 全灭 |
| `scale` | `1` | 等比缩放 |

- **灯号 = 档位**：`ID-lamp-0` = 最下 unsafe（青蓝），`ID-lamp-1` = safe（青蓝），`ID-lamp-2` = 最上 finalized（绿）。每盏灯有 `-on`（亮层）和 `-red`（红层）。
- 状态：normal 三灯全亮（finalized 绿）；pending finalized 灯灭；broken finalized 灯变红 + 那一格红虚线框红叉（被回滚）；attacker 亮着的灯全红。
- 可动：
  - `KITX16.sig(tl, ID, t, lit, dur=0.6)`：亮到第 lit 档（自下而上依次点亮，上面的灭），返回结束时间。
  - `KITX16.sigLamp(tl, ID, t, i, on=true, red=false, dur=0.25)`：单盏灯亮 / 灭 / 红。
  - `KITX16.sigBlink(tl, ID, t, i=2, n=2, dur=0.8)`：第 i 盏闪 n 下，结束回到原状态。
  - `KITX16.sigBad(tl, ID, t, on=true)`：finalized 灯变红 + 红虚线框红叉；`false` 恢复成绿灯。
- anchors：`top`、`center`、`ground`、`head`（信号头中心）、`lamps`（`[unsafe, safe, finalized]` 三盏灯中心，与灯号一致，供红虚线连线）、`unsafe` / `safe` / `finalized`（同上单点）、`plates`（三块铭牌中心，同序）。

### `forkSwitch(o, opts)`：道岔扳道器

约 70×50×110（方向牌顶约 z 130）。水泥小基座 + 铸铁机箱；机箱正面前方一根红白握把长扳杆（绕底部轴在 u-z 面里摆约 60°）；顶上圆形方向牌（正面朝 +v），箭头指向右上（原链）或右下（新链），牌右侧两行小字；机箱 −u 侧面一盏小灯。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `thrown` | reorg / attacker `true`，其余 `false` | `false` = 指向原链；`true` = 已扳到新链 |
| `labels` | `["原链","新链"]` | 方向牌右侧小字（上 = 原链 绿，下 = 新链 红） |
| `scale` | `1` | 等比缩放 |

- 状态：normal 指向原链，灯绿；reorg 扳杆扳到 −u 侧，箭头指向新链，灯红；attacker 同 reorg、箭头红色；broken 整件外一圈红虚线框 + 红叉。
- 可动：
  - `KITX16.flip(tl, ID, t, thrown=true, dur=0.9)`：扳杆摆过去 → 箭头转向 → 灯变色；`false` 扳回。返回结束时间。
  - `KITX16.lever(tl, ID, t, thrown, dur=0.6)` / `KITX16.disc(tl, ID, t, thrown, dur=0.45)` / `KITX16.swLamp(tl, ID, t, "green"|"red"|"off")`：单独动一个部件。
  - `KITX16.swBad(tl, ID, t, on=true)`：红虚线框 + 红叉。
- anchors：`top`、`center`、`ground`、`disc`（方向牌中心）、`lamp`、`lever`（握把，按初始位置）、`branchA`（原链接点，地面，`+70u −48v`，后方）、`branchB`（新链接点，地面，`+70u +48v`，前方）、`root`（来路接点，地面，`−70u`）。kit `chain` 以中心为原点、块距 180：要让链从接点往 +u 排，原点放在接点 `+((n−1)/2·180 + 50)u` 处。

## runtime-ext.js · window.KITX16

| 调用 | 物件 |
| --- | --- |
| `sig` / `sigLamp` / `sigBlink` / `sigBad` | 最终性信号柱 |
| `flip` / `lever` / `disc` / `swLamp` / `swBad` | 道岔扳道器 |

## 已知不足

- `hyperframes check` 可能报 `dead_stretch`，原因同 kit：动作都在 `#cam` 里的 SVG 属性上，取样器看不到。
- 铭牌和方向牌上的字在倍率 1 左右只是质感；要观众读的字用 `wlab` 贴 `anchors.plates[i]` / `anchors.disc`。
- 扳道器比 kit `chain` 的区块（100 见方）矮，放在分叉点时别让区块挡住它：放在链的 +v 侧或分叉点前方。
- 方向牌只朝 +v。
