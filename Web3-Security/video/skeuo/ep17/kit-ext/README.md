# ep17 补充拟物物件（kit-ext）

本集 BRIEF 第 2 节"需要新补的拟物物件"表里的 2 个物件：看街的窗 `viewWindow`、对等连接插线板 `peerPanel`。它们和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `broken` / `attacker` 之一，`opts.glow` 控制地光（默认关），`opts.scale` 以地面原点等比缩放（anchors 已换算）。DOM 骨架同 kit：`ID` → `ID-glow / ID-solid / ID-wire / ID-x`，`KIT.grow` / `KIT.broke` 可以直接用；骨架里多一层 `ID-mv`。**id 不要取 `cam` 或 `root`**（舞台的镜头容器是 `#cam`）。

样张：`showcase.png`，来自 `demo/`（10 秒，两屏）。每行是一屏，左列是动作前，右列是动作后。第一屏放了 kit `person`（0.6）做比例对照，第二屏放了 kit `rpc`。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | `viewWindow`、`peerPanel`，另有 `CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX17`**。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时样张工程：`node src/build.mjs`，然后 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { viewWindow, peerPanel, runtimeExtJs as rt17 } from "../../kit-ext/objects-ext.mjs";
// segbase 写法：import * as X from "../../kit-ext/objects-ext.mjs"; segInit(…, { ext: [X, …] }) 后在 SHOTS 里用 X17.xxx
```

- **调用名一律用 `KITX17.xxx`**（segbase 里是 `X17.xxx`）。合并进 `window.KITX` 时已存在的名字不覆盖。
- 所有助手签名都是 `(tl, id, t, …)`；同一部件多次调用按时间顺序写。
- `ID-car-0..2` 的 transform 由助手改写，不要再对它们用 GSAP x/y。

## 物件清单

### `viewWindow(o, opts)`：看街的窗

约 150×30×170（窗台前伸到 v 30）。立在地上的木窗：两根短木脚 + 木窗框 + 前伸窗台，正面朝 +v；窗里是一块屏幕（天空 + 房子 + 灰色小街 + 三辆青蓝小车），屏幕下沿细进度条；窗台前挂白底小牌，窗台右端一盏小灯。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `mode` | `"live"` | `"live"` / `"delayed"`（右下"延迟"小牌亮）/ `"replay"`（左上红点"录像"、画面变灰、屏幕红虚线框） |
| `label` | `"屏幕"` | 窗台小牌字 |
| `scale` | `1` | 支持 |

- 状态：attacker 屏幕内框红色；broken 整件变虚 + 红叉。
- 可动：
  - `KITX17.winFlow(tl, ID, t, dur=2, speed=40)`：车流向右开 `dur` 秒（出右边从左边回来），`speed` 为局部 px/秒；"慢一拍"就用小 speed。返回结束时间。
  - `KITX17.winMode(tl, ID, t, mode)`：切 live / delayed / replay。
  - `KITX17.winDelay(tl, ID, t, on)`、`KITX17.winRec(tl, ID, t, on)`：单独开关"延迟"牌 / "录像"。
  - `KITX17.winLamp(tl, ID, t, color)`：窗台灯 `"green"` / `"red"` / `"off"`。
- anchors：`top`、`center`、`ground`、`screen`（屏幕中心，红虚线连线用）、`sill`（窗台正面）、`label`、`lamp`。

### `peerPanel(o, opts)`：对等连接插线板

约 160×40×120。墨色金属立板 + 小底座；正面顶部白底铭牌（`label`），下面一排 `n` 个网口，每口一根垂下的线缆，末端圆形小标签；立板顶上一盏状态灯。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `n` | `8` | 网口数 |
| `colors` | 墨 / 青蓝相间 | 每根线缆颜色 `"ink"` / `"teal"` / `"red"` / `"green"` |
| `mode` | `"diverse"` | `"eclipsed"` = 全部红色、灯仍绿；`"anchored"` = 前 2 根绿色锚点插头、其余红 |
| `anchorsOn` | `false` | 只加锚点插头，不改线缆颜色 |
| `label` | `"对等连接"` | 铭牌字 |
| `lamp` | `"green"` | 状态灯 |
| `scale` | `1` | 支持 |

- 状态：attacker = eclipsed 外观；broken 整件变虚 + 红叉。
- 可动：
  - `KITX17.peerRed(tl, ID, t, which="all", on=true, gap=0.12)`：线缆变红 / 复原，`which` 为下标、数组或 `"all"`（按 gap 逐根）。返回结束时间。
  - `KITX17.peerAnchor(tl, ID, t, on=true)`：两只绿色锚点插头弹入 / 隐藏。
  - `KITX17.peerMode(tl, ID, t, mode, gap)`：切 diverse / eclipsed / anchored。
  - `KITX17.peerLamp(tl, ID, t, color)`：状态灯。
- anchors：`top`、`center`、`ground`、`ports[]`（n 个网口中心）、`tags[]`（线缆末端小标签）、`lamp`、`plate`。

## 已知不足

- `hyperframes check` 报 `dead_stretch`，原因同 kit：动作在 `#cam` 里的 SVG 属性上，取样器看不到。
- 屏幕和铭牌上的字在倍率 1 左右只是质感；要观众读的字用 `wlab` 贴 `anchors.screen` / `anchors.plate`。
- BRIEF 写铭牌在"板侧"，侧面太窄写不下字，改放在正面顶部。
- 窗只朝 +v，插线板网口也只在 +v 正面。
