# ep22 补充拟物物件（kit-ext）

本集 BRIEF 第 2 节"需要新补的拟物物件"表里的 2 个物件：SIM 卡 `simCard`、扳手 `wrench`。它们和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `broken` / `attacker` 之一，`opts.glow` 控制地光（默认关），`opts.scale` 以地面原点等比缩放（anchors 已换算）。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，`KIT.grow`、`KIT.broke` 可以直接用；骨架里多一层 `ID-mv`（整件包一层）。坐标约定、颜色语义见 `../../kit/README.md`。

**注意**：
- **id 不要取 `cam` 或 `root`**：舞台的镜头容器是 `#cam`、合成根是 `#root`，同名会让 `KIT.cam` 移动物件。建议 `simV`（受害者原卡）、`simA`（攻击者新卡）、`wr`。
- 两个物件都很小（SIM 卡约 60 宽，扳手约 130 长）：特写用 scale 1.0–1.2 并配近景镜头。
- 要把卡"插进手机"：另放一张 `stand: false` 的平放卡，用 GSAP 动它的 `ID-mv`（x / y / opacity）滑到手机旁；立卡和平放卡不是同一件的两种姿态。

样张：`showcase.png`，来自 `demo/`（6 秒，一屏）。左图是动作前，右图是动作后：青蓝原卡芯片闪三下后亮金色，红色新卡芯片亮红，平放新卡芯片亮。画面里有 kit `phone`、`person` 和 E02 `gpuRig` 做比例对照；彩点是 `chip` / `head`（红）和 `center`（绿）。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | `simCard`、`wrench`，另有 `CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX22`**。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时样张工程：`node src/build.mjs`，然后 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { simCard, wrench, runtimeExtJs as rt22 } from "../../kit-ext/objects-ext.mjs";
// segbase 写法：import * as X from "../../kit-ext/objects-ext.mjs"; segInit(…, { ext: [X, …] }) 后在 SHOTS 里用 X22.xxx
// 手写 <script>：先 kit 的 runtime，再其他集的 ext，最后本集的
//   ${runtimeJs()}
//   ${rt22()}
//   KITX22.chipFlash(tl, "simA", 2.0, 2, "red");
```

- **调用名一律用 `KITX22.xxx`**（segbase 里是 `X22.xxx`）。它也会合并进 `window.KITX`，但合并时**已存在的名字一律不覆盖**。
- 所有助手签名都是 `(tl, id, t, …)`；同一部件多次调用按时间顺序写，每次从上一次的终值开始。

## 物件清单

### `simCard(o, opts)`：SIM 卡

卡约 60×4×44，立在黑色小夹座上（含夹座约 72×20×52），正面朝 +v（看向观众）。白色塑料卡身、右上角切角，正面中间金色六格芯片，下方一行小字。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `label` | `"SIM"` | 卡面下方小字（ASCII 用等宽字体） |
| `tone` | — | `"teal"`：青蓝边 + 青蓝字（受害者原卡） |
| `state` | `"normal"` | `attacker`：红边 + 浅红底 + 红字；`broken`：整件变虚 + 红叉 |
| `stand` | `true` | `false`：平放在地上（卡面朝上，无夹座），用于插进手机卡槽 |
| `scale` | `1` | 以地面点等比缩放，anchors 已换算 |

可动部件：`ID-chip`（芯片组）、`ID-chip-lit`（芯片亮光层）。

anchors：`top`（卡顶上方）、`center`（卡面中心）、`chip`（芯片中心）、`ground`。

| 助手 | 说明 |
| --- | --- |
| `KITX22.chip(tl, id, t, on=true, color="gold", dur=0.25)` | 芯片亮 / 灭；`color` 取 `gold` / `teal` / `red` / `green` 或任意颜色 |
| `KITX22.chipFlash(tl, id, t, n=2, color, period=0.36)` | 芯片闪 n 下（结束时灭）。返回结束时间 |

### `wrench(o, opts)`：扳手

约 130×30×45。银灰色活动扳手斜靠在一块小木垫上（扳手在 u 方向的竖直面里，头朝 +u 抬起）：上下两颚 + 调节螺纹轮，长柄末端挂孔，柄上一圈深灰防滑纹。只是工具，不带血迹、不带人手。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `state` | `"normal"` | `attacker`：柄身描红边；`broken`：整件变虚 + 红叉 |
| `scale` | `1` | 以地面点等比缩放，anchors 已换算 |

无可动部件（要出现 / 强调，用 `KIT.grow`、`pop` 或 GSAP 动 `ID-mv`）。

anchors：`top`（扳手头上方）、`center`（柄中部）、`head`（开口端中心）、`ground`。
