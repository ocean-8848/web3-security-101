# ep08 补充拟物物件（kit-ext）

本集 BRIEF 第 2 节"需要新补的拟物物件"表里的 4 个物件。它们和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `broken` / `attacker` 之一，`opts.glow` 控制地光，`opts.scale` 以地面原点等比缩放（anchors 已换算）。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，所以 `KIT.grow`、`KIT.broke`、`KIT.fixed` 可以直接用。坐标约定、颜色语义见 `../../kit/README.md`。

样张：`showcase.png`，来自 `demo/`（15 秒，三屏）。每行是一屏，左列是动作前，右列是动作后。各屏都放了 kit `person`，第三屏另有 ep01 `vending` 做比例对照。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | 4 个物件，另有 `CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX08`**。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时样张工程：`node src/build.mjs`，然后 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { G, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import { vending, miniVend, pipe, runtimeExtJs as rt01 } from "../../../ep01/kit-ext/objects-ext.mjs";
import { ammPool, twapRecorder, marketStall, liqBot, runtimeExtJs as rt08 } from "../../kit-ext/objects-ext.mjs";
// <script> 里：先 kit 的 runtime，再其他集的 ext，最后本集的
//   ${runtimeJs()}
//   ${rt01()}
//   ${rt08()}
//   KITX08.poolPump(tl, "amm", 2.4, { n: 3, read: "6,000" });
```

- **调用名一律用 `KITX08.xxx`**。它也会合并进 `window.KITX`，但合并时**已存在的名字一律不覆盖**。
- 所有助手签名都是 `(tl, id, t, …)`；同一部件多次调用按时间顺序写，每次从上一次的终值开始。
- 运行时直接写 `transform` 的部件只交给助手去动，不要再对它们用 GSAP 的 x/y/rotation/scale：AMM 池 `ID-needle` / `-needle-t1` / `-needle-t2` / `-lvlL-cap` / `-lvlR-cap` / `-dropL/R` / `-outL/R`；记录仪 `ID-paper` / `-paper-ink` / `-pen` / `-knob`；机器人 `ID-beam` / `-claw-l` / `-claw-r`。
- 整件移动用 `KITX01.walk(tl, ID, t, dur, [点…])`（根元素带 `data-px/py` 或 `data-ox/oy`）或 `KITX06.carry`。

## 物件清单

### `ammPool(o, opts)`：AMM 池

约 240×130×210。铸钢底座上两只立式玻璃储罐：左罐金色硬币堆（ETH），右罐青蓝硬币堆（USDC），罐身刻度线和玻璃高光；底座正面两块铭牌；两罐前方一根粗连通管，管上青蓝阀门轮。罐顶镀铬进料斗，罐前出料口。中间短柱顶上一块半圆"现货价"表：奶白表盘、右端红色区、墨色指针、下方数字窗。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `lvlL` / `lvlR` | `0.55` / `0.55`（attacker `0.18` / `0.95`） | 两罐币堆高度 0–1 |
| `deg` | `-6`（attacker `62`） | 指针角度，0° 竖直，±70° |
| `read` | `"2,000"`（attacker `"6,000"`，红字） | 数字窗 |
| `labelL` / `labelR` | `ETH` / `USDC` | 铭牌（只是质感，要读的字用 `wlab`） |
| `ghost` | `0.4` | broken 时实体透明度（比 kit 默认 0.18 高，罐子仍认得出） |

- 状态：normal 墨针；attacker 右罐满、左罐低、指针红并带两道红色残影、数字窗红字；broken 红虚线框（两罐 + 底座 + 表）+ 红叉（"不能拿来定价"）。
- 可动：
  - `KITX08.poolLevel(tl, ID, t, L, R, dur)`：币堆高度（传 `null` 不动那一侧）。`ID-lvlL` / `ID-lvlR`。
  - `KITX08.poolNeedle(tl, ID, t, deg, dur)`：指针，残影 `-t1/-t2` 落后跟随。
  - `KITX08.poolRed(tl, ID, t, on)`：指针变红 + 显出残影。
  - `KITX08.poolRead(tl, ID, t, text, red)`：数字窗换字。
  - `KITX08.hop(tl, ID, t, "L"|"R", n)`：进料斗青蓝环闪 n 下。
  - `KITX08.poolSwap(tl, ID, t, "L"|"R", dur=0.8)`：一枚币落进该侧进料斗，另一侧出料口滑出一枚，返回结束时间。
  - `KITX08.poolPump(tl, ID, t, {side="R", n=3, gap=0.5, L=0.15, R=0.95, deg=62, read="6,000"})`：攻击者推价一条龙：n 次交换 + 液位变化 + 指针甩到红区 + 数字窗红字（`read:null` 不改字），返回结束时间。
- anchors：`top`、`center`、`ground`、`tankL`、`tankR`（罐身正面）、`dial`、`readout`、`hopL`、`hopR`、`outL`、`outR`（出料口）、`valve`。

### `twapRecorder(o, opts)`：均价记录仪

约 200×90×150。灰色铸铁机箱，顶面是一块斜面：左上铭牌和两颗指示灯，右上 LCD 读数窗（均值），下面镀铬边框玻璃窗。窗里白色方格纸，墨色曲线，墨色记录笔从右侧边框伸进来；纸上罩青蓝半透明窗口框，右边缘固定在笔尖，左边有拉手。机箱正面有出纸口，一截卷出来的纸带；−u 侧一个调窗口长度的旋钮。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `win` | `56` | 窗口框宽度（纸面单位，最大约 120） |
| `avg` | `"2,000"`（attacker `"2,900"`，红字红框） | 读数窗 |
| `off` | `0` | 纸带初始已走过的距离 |
| `spike` / `spikeAt` | `false` / `70` | 红色尖峰一开始就显示 / 尖峰在纸面的位置（纸面坐标；走纸后跟着纸左移，只在笔尖左边可见） |
| `trail` | attacker 时显示 | 红色台阶线 |

- 状态：normal；attacker 显示红色台阶线（多区块持续抬升）+ 读数窗红字。broken 只有 shell 自带的红框红叉，本集不用。
- 可动：
  - `KITX08.paper(tl, ID, t, dist, dur)`：纸带匀速左移 dist（累计最多约 800），笔尖跟着纸上曲线上下。`ID-paper`（方格）、`ID-paper-ink`（曲线 + 尖峰）。
  - `KITX08.penKick(tl, ID, t, h=24, dur=0.5)`：笔尖额外往上跳一下再回来（配合尖峰）。
  - `KITX08.spike(tl, ID, t, on, dur)`：`ID-spike` 淡入/淡出。
  - `KITX08.winTo(tl, ID, t, w, dur)`：窗口框拉宽/缩窄，侧面旋钮 `ID-knob` 同步转。
  - `KITX08.avg(tl, ID, t, text, red)`：读数窗换字。
  - `KITX08.trail(tl, ID, t, on, dur=1.2)`：`ID-trail` 从左往右画出（`false` 收回）。
- anchors：`top`、`center`、`ground`、`window`（纸窗中心）、`avg`、`pen`（笔尖初始位置）、`spike`（尖峰顶，按初始 off 算）、`knob`。

### `marketStall(o, opts)`：菜市场黄金摊

约 220×120×275。木摊台（竖拼木板正面 + 凸框 + 金色"金"字圆牌），台面两堆金条（3-2-1 和 2-1，共 9 根）；四根木柱撑起米白 + 青蓝条纹遮阳篷，前沿扇形垂边；篷檐右侧挂一盏小灯。价目小黑板立在摊后两根高腿上，**高出篷顶**（放在篷下会被篷面整个挡住，所以总高比 BRIEF 的 190 高）。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `price` | `"¥ 480"`（attacker `"¥ 4800"`，红色大字） | 价目牌 |
| `head` | `"今日金价 / 克"` | 牌头 |
| `gold` | `9` | 台面金条根数 0–9 |
| `lamp` | `true` | 灯亮 |

- 状态：normal；attacker 价目牌红色大数字 + 摊台变红。
- 可动：
  - `KITX08.stallPrice(tl, ID, t, text, red)`：粉笔字擦掉重写，`red` 时变红变大。`ID-board-v`。
  - `KITX08.goldTo(tl, ID, t, n, dur)`：金条逐根消失/出现到 n 根（从顶上那根开始搬）。`ID-gold-k`。
  - `KITX08.stallLamp(tl, ID, t, on, n)`：灯开关，n>0 先闪 n 下。
- anchors：`top`、`center`、`ground`、`board`（价目牌中心）、`gold`（金条堆上方）、`counter`（摊台正面）、`lamp`。

### `liqBot(o, opts)`：清算机器人

约 70×60×90。墨色底盘 + 四个橡胶轮，青蓝圆角机身，正面小屏（读到的价格）和散热条，墨色头盖上一盏玻璃罩小灯（亮时带旋转光束），前伸一只镀铬两指夹爪。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `scr` | `"$2,000"` | 小屏文字 |
| `open` | `false` | 夹爪一开始张开 |
| `lamp` | `false` | 灯一开始就亮 |
| `n` / `gap` | `1` / `86` | 排成一队，沿 +u 往后排 |

- 状态：只用 normal（中性角色）。
- n=1 时部件前缀就是 `ID`；n>1 时第 k 台前缀 `ID-k`（`ID-0` 在最前），每台的 `<g id=ID-k>` 也带 `data-px/py`，可以单独 walk；对根 `ID` walk 则整队一起走。
- 可动：
  - `KITX08.botLamp(tl, ID, t, dur=1.6, turns=2, keepOn=true)`：灯亮、光束 `ID-beam` 转 turns 圈、光晕 `ID-lamp` 闪。
  - `KITX08.claw(tl, ID, t, open, dur)`：夹爪 `ID-claw-l/-r` 开/合。`KITX08.grab(tl, ID, t)` 张开再夹紧，返回结束时间。
  - `KITX08.botScr(tl, ID, t, text, red)`：小屏 `ID-scr` 换字。
- anchors：`top`、`center`、`ground`、`scr`、`claw`（夹爪尖）、`lamp`、`bots[]`（每台的地面点）。

## runtime-ext.js · window.KITX08

| 调用 | 物件 |
| --- | --- |
| `poolLevel` / `poolNeedle` / `poolRed` / `poolRead` / `hop` / `poolSwap` / `poolPump` | AMM 池 |
| `paper` / `penKick` / `spike` / `winTo` / `avg` / `trail` | 均价记录仪 |
| `stallPrice` / `goldTo` / `stallLamp` | 黄金摊 |
| `botLamp` / `claw` / `grab` / `botScr` | 清算机器人 |

离散切换（换字、灯色）在 seek 回去时会恢复成之前的状态。

## 已知不足

- `hyperframes check` 报 `dead_stretch`（以及样张文件过大的 lint 警告），原因同 kit：动作都在 `#cam` 里的 SVG 属性上，取样器看不到，snapshot 可确认在动。
- 表盘、数字窗、铭牌、小屏、价目牌上的字在倍率 1 左右只是质感；要观众读的数字用 `wlab`。
- AMM 池币堆是"整柱币 + 顶面散币"，液位靠屏幕空间裁切 + 顶面平移实现；液位降到 0 时罐底仍留一层薄币面。
- 记录仪的尖峰和台阶线是叠在纸上的独立图层，不改变笔尖实际走的曲线；笔尖跳动要配 `penKick`。台阶线固定在窗口坐标，不随纸走。
- 记录仪纸带累计走纸超过约 800 后曲线到头，笔尖停在最后一个值。
- 黄金摊价目牌在篷后高处，近景从下方看不到时请用 `board` anchor 加标签。
- 机器人夹爪画在水平面上（俯视的两根钩指），侧面没有厚度；走动时轮子不转。
- AMM 池单件 SVG 约 100 KB（罐身多段圆柱），一个画面放 3 个以内为宜。
