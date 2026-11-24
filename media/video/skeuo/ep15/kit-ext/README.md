# ep15 补充拟物物件（kit-ext）

本集 BRIEF 第 2 节"需要新补的拟物物件"表里的 2 个物件：委托挂牌 `delegateTag`、Gas 加油机 `gasPump`。它们和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `broken` / `attacker` 之一（`delegateTag` 另有 `cleared`），`opts.glow` 控制地光（默认关），`opts.scale` 以地面原点等比缩放（anchors 已换算）。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，`KIT.grow` 可以直接用；骨架里多一层 `ID-mv`（整件包一层）。坐标约定、颜色语义见 `../../kit/README.md`。

**注意**：
- `gasPump` 的 broken 只标正面（红虚线框 + 红叉），整件不变虚，`ID-wire` 是空的。不要对它用 `KIT.broke`，改用 `KITX15.pumpBad` / `pumpState`。
- **id 不要取 `cam`**（舞台的镜头容器就是 `#cam`）。
- `delegateTag` 要挂在 E02 `addrPlate` 上：用 `delegateTagOn(plateOrigin, { plateScale, … })` 算出挂牌的 origin 和 opts（夹扣落在门牌立柱正面、信箱下沿下方），门牌按常见坑第 1 条包层放大时把倍率传给 `plateScale`。挂牌的 origin 在门牌前方 9 个世界单位，按 Y 排序自然画在门牌之后。

样张：`showcase.png`，来自 `demo/`（8 秒，两屏）。每行是一屏，左列是动作前，右列是动作后。第一屏：attacker 挂牌从夹扣处落到"热钱包地址"门牌上并轻摆；包层 1.3 的"普通地址"门牌上 normal 挂牌 → attacker"恶意合约" → 一闪 → cleared"已清零"；单独 1.4 的 cleared 挂牌换回 normal；kit `person` 0.7 做比例对照。第二屏：normal 加油机油枪伸出、软管跟到 `person` 身上，液位降到 0.55、屏幕"已结算"；attacker 0.8（红灯、"签名被重放"、液位 0.1）和 broken 0.7 修回 normal。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | `delegateTag`、`gasPump`、挂牌助手 `delegateTagOn`，另有 `CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX15`**。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时样张工程：`node src/build.mjs`，然后 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { delegateTag, delegateTagOn, gasPump, runtimeExtJs as rt15 } from "../../kit-ext/objects-ext.mjs";
// segbase 写法：import * as X from "../../kit-ext/objects-ext.mjs"; segInit(…, { ext: [E2, X, …] }) 后在 SHOTS 里用 X15.xxx
//   const h = X.delegateTagOn(L.PLATE_D, { id: "tag", plateScale: 1.3, on: false });
//   put("tag", h.o, X.delegateTag(h.o, h.opts));
// 手写 <script>：先 kit 的 runtime，再其他集的 ext，最后本集的
//   ${runtimeJs()}
//   ${rt02()}
//   ${rt15()}
//   KITX15.tagDrop(tl, "tag", 2.0);
```

- **调用名一律用 `KITX15.xxx`**（segbase 里是 `X15.xxx`）。它也会合并进 `window.KITX`，但合并时**已存在的名字一律不覆盖**。
- 所有助手签名都是 `(tl, id, t, …)`；同一部件多次调用按时间顺序写，每次从上一次的终值开始。
- 运行时直接写属性的部件只交给助手去动，不要再对它们用 GSAP 的 x/y/rotation/scale：`ID-tag`、`ID-tag-r`、`ID-lead`、`ID-tgt`、`ID-nozzle`、`ID-hose`、`ID-level`、`ID-scr-t`。

## 物件清单

### `delegateTag(o, opts)`：委托挂牌

约 56×6×76（含夹扣和链子）。黄铜行李牌：上沿一只黄铜夹扣（箍在门牌立柱上）+ 4 节小链子，牌面白底朝 +v（与门牌同向），三行：小字 `prefix`（等宽灰字）、"委托 →"、`target`（字号按长度自动缩）。origin 是夹扣正下方的地面点。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `target` | `"钱包实现"`（attacker `"攻击者合约"`） | 第三行，指向的合约名 |
| `prefix` | `"0xef0100"` | 第一行小字，只上屏 |
| `hang` | `76` | 夹扣高度（世界单位，未缩放）；`delegateTagOn` 会自动算 |
| `on` | `true` | `false` = 还没挂上（牌和夹扣透明、牌身抬高 26），用 `tagDrop` 落下 |

- 状态：normal 青蓝边框 + 青蓝字；attacker 红边框 + 红字；cleared 牌面盖灰色"已清零"；broken 同 cleared 再加红叉。
- 可动：
  - `KITX15.tagDrop(tl, ID, t, dur=0.45)`：夹扣和牌身出现，牌身从上方落下（弹一下）再轻摆，返回落下结束时间（摆动再持续约 1.4 秒）。
  - `KITX15.tagSwing(tl, ID, t, amp=7, dur=1.6)`：绕夹扣衰减摆动（"仍在轻摆"）。返回结束时间。
  - `KITX15.tagState(tl, ID, t, state, target)`：切 `"normal"` / `"attacker"` / `"cleared"`（边框、字色、灰盖层），`target` 可省（按状态默认）；附带一次小摆。
  - `KITX15.tagText(tl, ID, t, target, tone)`：只换第三行字，`tone` 同 state 名。
  - `KITX15.tagClear(tl, ID, t, on)`：灰色"已清零"盖层。
  - `KITX15.tagPulse(tl, ID, t, dur=0.8)`：牌面一闪（"挂牌轻轻一亮"）。
  - `KITX15.tagHide(tl, ID, t)`：整块淡出。
- anchors：`top`（夹扣上方）、`center`（牌中心）、`ground`、`clip`（夹扣）、`text`（牌面中心，红虚线连到这里）。

### `delegateTagOn(plateO, opts)`：挂牌摆位助手

`plateO` 是 E02 `addrPlate` 的 origin；`opts.plateScale` 是门牌的包层倍率（默认 1）；`opts.scale` 默认等于 `plateScale`；其余 opts 原样带过去。返回 `{ o, opts }`，直接 `delegateTag(o, opts)`。门牌立柱前挂牌的位置：origin = `{ u: plateO.u, v: plateO.v + 9·plateScale }`，`hang = 76·plateScale / scale`。

### `gasPump(o, opts)`：Gas 加油机

约 90×70×160（含水泥底座和灯箱）。水泥小底座（黄色虚线）+ 竖立青蓝机身 + 白色灯箱（+v 面写 `title`）；+v 面：小屏（`scr`）+ 状态灯、"GAS"牌、右侧油枪座；−u 面一扇竖窗，金色液位 = 押金，下写"押金"；软管从 +v 面下部接到油枪。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `title` | `"Paymaster"` | 灯箱字 |
| `scr` | `"代付 Gas"`（attacker `"签名被重放"`） | 屏幕字 |
| `level` | `0.8`（attacker `0.1`） | 押金液位 0–1 |

- 状态：normal 绿灯；attacker 红灯、屏幕红字、液位 0.1；broken +v 面红虚线框 + 红叉、灯灭。
- 可动：
  - `KITX15.pumpNozzle(tl, ID, t, to, dur=0.6)`：油枪伸出到世界画布点 `to`（`[x, y]`，比如目标的 anchor），`true` = 朝观众伸出 70 px，`false` = 收回枪座；软管跟着走。返回结束时间。
  - `KITX15.pumpLevel(tl, ID, t, v, dur=0.8)`：液位到 v。
  - `KITX15.pumpScr(tl, ID, t, text, tone)`：屏幕换字，`tone` 为 `"red"` 时红字。
  - `KITX15.pumpLamp(tl, ID, t, color)`：`"green"` / `"red"` / `"off"`。
  - `KITX15.pumpBad(tl, ID, t, on)`：正面红虚线框 + 红叉。
  - `KITX15.pumpState(tl, ID, t, state, dur=0.8)`：一次切 normal / attacker / broken（灯、屏幕、液位、红框）。
- anchors：`top`、`center`、`ground`、`nozzle`（油枪口，挂着时的位置）、`grip`、`scr`（屏幕中心）、`level`（液位窗中心）、`title`（灯箱字中心）。

## runtime-ext.js · window.KITX15

| 调用 | 物件 |
| --- | --- |
| `tagDrop` / `tagSwing` / `tagState` / `tagText` / `tagClear` / `tagPulse` / `tagHide` | 委托挂牌 |
| `pumpNozzle` / `pumpLevel` / `pumpScr` / `pumpLamp` / `pumpBad` / `pumpState` | Gas 加油机 |

离散切换（换字）在 seek 回去时会恢复成之前的状态。

## 已知不足

- `hyperframes check` 报 `dead_stretch`，原因同 kit：动作都在 `#cam` 里的 SVG 属性上，取样器看不到，snapshot 可确认在动。
- 牌面、屏幕、灯箱上的字在倍率 1 左右只是质感；要观众读的字用 `wlab` 贴 `anchors.text` / `anchors.scr` / `anchors.title`。
- 挂牌摆动是屏幕平面里的旋转，幅度小（≤ 8°）时看不出来；别加大。
- 油枪伸到目标时，按 Y 排序画在目标之前的话会被目标挡住（软管仍可见）；要油枪露出来，把 `to` 指到目标前沿，或把加油机放在目标前方。
