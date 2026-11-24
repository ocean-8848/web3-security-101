# ep20 补充拟物物件（kit-ext）

本集 BRIEF 第 2 节"需要新补的拟物物件"表里的 1 个物件：域名路牌 `dnsSignpost`。它和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `broken` / `attacker` 之一，`opts.glow` 控制地光（默认关），`opts.scale` 以地面原点等比缩放（anchors 已换算）。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，`KIT.grow`、`KIT.broke` 可以直接用；骨架里多一层 `ID-mv`（整件包一层）。坐标约定、颜色语义见 `../../kit/README.md`。

**注意**：
- **id 不要取 `cam` 或 `root`**：舞台的镜头容器是 `#cam`、合成根是 `#root`，同名会让 `KIT.cam` 移动物件。路牌建议用 `dns`。
- `ID-arm` 的 `transform` 由助手重写（箭头牌在水平面里绕立杆转，牌面字自动保持正读），不要再对它用 GSAP 的 x/y/rotation/scale。要整件挪动，动 `ID-mv`。

样张：`showcase.png`，来自 `demo/`（6 秒，一屏）。左图是动作前，右图是动作后：主路牌从指向 +u（真服务器）扳到 −u（克隆站）并变红；attacker 0.6 版（dir −1）扳回并变回青蓝；broken 0.6 版转到 90°。画面里有 kit `rack` ×2 和 `person` 做比例对照，四个彩点是主路牌的 `tip`（红）、`tipFlip`（绿）、`dns`（青）、`arm`（黄）。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | `dnsSignpost`，另有 `CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX20`**。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时样张工程：`node src/build.mjs`，然后 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { dnsSignpost, runtimeExtJs as rt20 } from "../../kit-ext/objects-ext.mjs";
// segbase 写法：import * as X from "../../kit-ext/objects-ext.mjs"; segInit(…, { ext: [X, …] }) 后在 SHOTS 里用 X20.xxx
// 手写 <script>：先 kit 的 runtime，再其他集的 ext，最后本集的
//   ${runtimeJs()}
//   ${rt20()}
//   KITX20.hijack(tl, "dns", 2.0);
```

- **调用名一律用 `KITX20.xxx`**（segbase 里是 `X20.xxx`）。它也会合并进 `window.KITX`，但合并时**已存在的名字一律不覆盖**（`flip`、`red`、`turn` 之类很可能已被别集占用）。
- 所有助手签名都是 `(tl, id, t, …)`；同一部件多次调用按时间顺序写，每次从上一次的终值开始。

## 物件清单

### `dnsSignpost(o, opts)`：域名路牌

约 160×80×220。水泥小底座 + 墨色立杆，杆顶一块横向箭头牌（白底青蓝框，约 150×40，写 `domain`），杆身中部一块朝 +v 的小方牌"DNS"。箭头牌绕立杆在水平面里转：角度 0 指向 +u（画面右上），180 指向 −u（画面左上），90 指向 +v（朝观众）。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `domain` | `"curve.fi"` | 箭头牌上的字（ASCII 用等宽字体） |
| `dir` | `1` | `1` 指向 +u，`-1` 指向 −u |
| `label` | `"DNS"` | 杆身小方牌的字，`""` 不画 |
| `state` | `"normal"` | `attacker`：箭头牌红框红字；`broken`：整件变虚 + 红叉 |
| `scale` | `1` | 以地面点等比缩放，anchors 已换算 |

可动部件：`ID-arm`（箭头牌，`data-a` 当前角度）、`ID-arm-n` / `ID-arm-r`（青蓝 / 红两套牌面）、`ID-arm-lit`（青蓝光）、`ID-arm-t` / `ID-arm-tr`（牌面字）。

anchors：`top`（杆顶上方）、`tip`（箭头尖，初始 dir）、`tipFlip`（扳到另一边后的箭头尖）、`arm`（箭头牌中心，初始 dir）、`center`、`ground`、`dns`（小方牌中心）、`pole`（立杆中部）。

| 助手 | 说明 |
| --- | --- |
| `KITX20.turn(tl, id, t, deg, dur=0.8, ease)` | 箭头牌转到任意角度（0 = +u，180 = −u，90 = 朝观众）。返回结束时间 |
| `KITX20.flip(tl, id, t, dur, ease)` | 扳到另一边（0 ↔ 180，中途经过 90） |
| `KITX20.red(tl, id, t, on=true, dur=0.25)` | 牌面变红 / 变回青蓝 |
| `KITX20.lit(tl, id, t, on=true, dur=0.3)` | 箭头牌一层青蓝光（"路牌箭头亮"、DNSSEC） |
| `KITX20.hijack(tl, id, t, dur=0.9)` | 一次劫持：扳到另一边，中途变红。返回结束时间 |
| `KITX20.restore(tl, id, t, dur=0.9)` | 扳回并变回青蓝（如 Celer 监控拦下） |
