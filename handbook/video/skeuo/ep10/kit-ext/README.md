# ep10 补充拟物物件（kit-ext）

本集 BRIEF 第 2 节"需要新补的拟物物件"表里的 1 个物件：实现机芯（散件）`coreModule`。它和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。外观对齐 E01 `vending` 维修门里的 `impl`（青蓝机芯盒 + 黄铜齿轮）。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `broken` / `attacker` 之一，`opts.glow` 控制地光（默认关），`opts.scale` 以地面原点等比缩放（anchors 已换算）。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，`KIT.grow` 可以直接用；骨架里多一层 `ID-mv`，给 `KITX10.push` 整件平移用。坐标约定、颜色语义见 `../../kit/README.md`。

**注意**：`coreModule` 的 broken 只标"缺的拉杆 / 未初始化的首页卡"（红虚线框 + 红叉），整件不变虚，所以 `ID-wire` 是空的。不要对它用 `KIT.broke`，改用 `KITX10.leverBad` / `KITX10.cardBad`。

样张：`showcase.png`，来自 `demo/`（10 秒，两屏）。每行是一屏，左列是动作前，右列是动作后。第一屏放了 E01 `vending`（维修门开着）和 kit `person` 做比例对照，第二屏另有 kit `person`。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | `coreModule`，另有 `CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX10`**。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时样张工程：`node src/build.mjs`，然后 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { coreModule, runtimeExtJs as rt10 } from "../../kit-ext/objects-ext.mjs";
// segbase 写法：import * as X from "../../kit-ext/objects-ext.mjs"; segInit(…, { ext: [X, …] }) 后在 SHOTS 里用 X10.xxx
// 手写 <script>：先 kit 的 runtime，再其他集的 ext，最后本集的
//   ${runtimeJs()}
//   ${rt01()}
//   ${rt10()}
//   KITX10.push(tl, "core", 2.0, A.vm.maint, 1.2);
```

- **调用名一律用 `KITX10.xxx`**（segbase 里是 `X10.xxx`）。它也会合并进 `window.KITX`，但合并时**已存在的名字一律不覆盖**（`gears`、`plate`、`card` 等名字很可能已被别集占用，例如 E01 的 `KITX.gears` 是售货机的齿轮）。
- 所有助手签名都是 `(tl, id, t, …)`；同一部件多次调用按时间顺序写，每次从上一次的终值开始。
- 运行时直接写 `transform` 的部件只交给助手去动，不要再对它们用 GSAP 的 x/y/rotation/scale：`ID-gear-0/1`、`ID-wheel-0/1`、`ID-lever-r`、`ID-lever-m`、`ID-mv`。
- 整件移动：用 `KITX10.push`（轮子跟着转）。根元素也有 `data-ox/oy`，`KITX01.walk` 可用，但轮子不会转。

## 物件清单

### `coreModule(o, opts)`：实现机芯（散件）

约 90×70×130（机芯盒，不含推车）；含推车总高约 150，拉杆再高约 45。竖立的金属机芯盒：青蓝侧板（−u 面一排散热槽 + 四颗螺钉）、+v 面银色前框；前框上方白底青蓝框铭牌写版本；中部深色观察窗里两枚咬合的黄铜齿轮 + 右下一小块绿色电路板；下方黄铜卡座插一张"首页"卡（主人名 / 空白）；顶上镀铬拉杆插座 + 一根青蓝球头短拉杆（升级函数）。底下一辆钢托板推车：前面两只带辐条的小轮，−u 端一个推把（从 −u 侧推进售货机维修门）。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `ver` | `"V1"`（attacker `"恶意"`） | 铭牌文字 |
| `lever` | `true` | 拉杆在不在（`false` = 没有升级函数，不画红框；要红框用 broken 或 `leverBad`） |
| `owner` | `""`（attacker `"攻击者"`） | 首页卡上的字；`""` = 空白卡（未初始化） |
| `cart` | `true` | 推车；放进售货机维修门时设 `false` |
| `skin` | `"blue"`（attacker `"red"`） | 机身颜色 `"blue"` / `"red"` / `"green"`（绿色 = "紧急修复"之类） |
| `bad` | `"lever"` | broken 时标哪一处：`"lever"` 拉杆位置红虚线框 + 红叉（拉杆不画），`"card"` 首页卡空白 + 红虚线框 + 红叉 |

- 状态：normal 青蓝 + 银；attacker 机身红、铭牌和首页卡红色描边红字；broken 见 `bad`，整件不变虚。
- 放进 E01 `vending` 维修门时：`scale` ≈ 0.45、`cart: false`，与 `impl` 同大。
- 可动：
  - `KITX10.gears(tl, ID, t, dur=1.2, turns=1)`：两枚齿轮匀速转 turns 圈（小齿轮反向、更快）。`ID-gear-0/1`。
  - `KITX10.pull(tl, ID, t, dur=0.7, deg=46)`：拉杆前扳再弹回（调用升级函数），返回结束时间。`ID-lever-r`。
  - `KITX10.lever(tl, ID, t, on, dur=0.45)`：拉杆插上（`true`，落下带回弹）/ 拔掉（`false`，上抬淡出）。`ID-lever`。
  - `KITX10.leverBad(tl, ID, t, on)`：拉杆位置红虚线框 + 红叉。`ID-lever-bad`。
  - `KITX10.card(tl, ID, t, text, tone="on")`：首页卡换字；`text` 为 `""` 换成空白卡；`tone` 取 `"on"`（青蓝）/ `"red"` / `"green"`。`ID-card`（层 `-off` / `-on` / `-red` / `-green`，字 `ID-card-t`）。
  - `KITX10.cardBad(tl, ID, t, on)`：卡座红虚线框 + 红叉。`ID-card-bad`。
  - `KITX10.plate(tl, ID, t, text, tone)`：铭牌换字；`tone` 为 `"red"` 时红框红字，否则青蓝。`ID-plate-t` / `ID-plate-red`。
  - `KITX10.skin(tl, ID, t, name, dur=0.35)`：机身换色 `"blue"` / `"red"` / `"green"`。`ID-skin-*`。
  - `KITX10.push(tl, ID, t, [x, y], dur=1)`：整件（连推车）平移，地面原点落到世界画布点 `[x, y]`（`null` 回原位），轮子按走过的 u 向距离滚动，返回结束时间。`ID-mv`。
  - `KITX10.roll(tl, ID, t, turns, dur=0.8)`：只转轮子。`ID-wheel-0/1`。
- anchors：`top`、`center`、`ground`、`front`（前框中心）、`plate`、`card`、`gears`、`lever`（拉杆球头）、`socket`（插座顶）、`cart`（托板前沿中点）、`handle`（推把横杆）、`wheels[]`。anchors 是初始位置，`push` 之后要自己加上位移。

## runtime-ext.js · window.KITX10

| 调用 | 物件 |
| --- | --- |
| `gears` / `pull` / `lever` / `leverBad` / `card` / `cardBad` / `plate` / `skin` / `push` / `roll` | 实现机芯 |

离散切换（换字）在 seek 回去时会恢复成之前的状态。

## 已知不足

- `hyperframes check` 报 `dead_stretch`，原因同 kit：动作都在 `#cam` 里的 SVG 属性上，取样器看不到，snapshot 可确认在动。
- 铭牌、首页卡上的字在倍率 1 左右只是质感；要观众读的字用 `wlab` 贴 `anchors.plate` / `anchors.card`。
- 拉杆画在机芯中线的 u-z 平面里，向 −u 斜；`pull` 的摆动也在这个平面里，从正面看幅度偏小。
- `push` 只平移 `ID-mv`；世界标签（`wlab`）不会跟着走，要跟就自己移动标签。
- 推把在 −u 端，挡住 −u 面散热槽的下半；不要推车时设 `cart: false`。
