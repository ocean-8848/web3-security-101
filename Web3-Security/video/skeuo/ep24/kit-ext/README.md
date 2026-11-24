# ep24 补充拟物物件（kit-ext）

本集 BRIEF 第 2 节"需要新补的拟物物件"表里的 1 个物件：盐罐 `saltShaker`。它和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `broken`，`opts.glow` 控制地光（默认关），`opts.scale` 以地面原点等比缩放（anchors 已换算）。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，`KIT.grow` 可以直接用；骨架里多一层 `ID-mv`（整件包一层）。坐标约定、颜色语义见 `../../kit/README.md`。

**注意**：
- **id 不要取 `cam` 或 `root`**：舞台的镜头容器是 `#cam`、合成根是 `#root`，同名会让 `KIT.cam` 移动物件。建议 `salt`。
- broken（"盐已删除"）只把罐身清空、标签上画一道红斜线，整件不变虚、不出红叉，`ID-wire` 是空的。**不要用 `KIT.broke`**，动画里删盐用 `KITX24.empty`。
- 盐罐很小（约 50×50×90，屏幕上约 54×110 px）：特写配近景镜头；`label` 写成 `"盐 · 32 字节"` 会自动拆成大字"盐"+ 小字"32 字节"两行。

样张：`showcase.png`，来自 `demo/`（6 秒，一屏）。左图是动作前，右图是动作后：第一只盐罐掀盖、抖两下撒盐（颗粒向左上飘出后淡出），第二只（`label` "盐 · 32 字节"）被 `empty` 清空、标签出现红斜线；第三只是 `state: "broken"`、`scale: 0.7` 的预设样子。画面里有 E03 `hashFunnel`、E09 `commitBox`（0.7）和 kit `person`（0.55）做比例对照；彩点是 `spout`（红）、`center`（绿）、`label`（蓝）。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | `saltShaker`，另有 `CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX24`**。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时样张工程：`node src/build.mjs`，然后 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { saltShaker, runtimeExtJs as rt24 } from "../../kit-ext/objects-ext.mjs";
// segbase 写法：import * as X from "../../kit-ext/objects-ext.mjs"; segInit(…, { ext: [X, …] }) 后在 SHOTS 里用 X24.xxx
// 手写 <script>：先 kit 的 runtime，再其他集的 ext，最后本集的
//   ${runtimeJs()}
//   ${rt24()}
//   KITX24.shake(tl, "salt", 2.0, [-60, -20]);
```

- **调用名一律用 `KITX24.xxx`**（segbase 里是 `X24.xxx`）。它也会合并进 `window.KITX`，但合并时**已存在的名字一律不覆盖**（`shake`、`empty` 之类可能已被别集占用）。
- 所有助手签名都是 `(tl, id, t, …)`；同一部件多次调用按时间顺序写，每次从上一次的终值开始。
- 运行时直接写 `transform` 的部件只交给助手去动，不要再对它们用 GSAP 的 x/y/rotation/scale：`ID-cap`、`ID-grains`、`ID-puff-0..7`；`shake` 期间也会写 `ID-mv` 的 transform（结束后清空），别在同一时刻对 `ID-mv` 做 GSAP 位移。

## 物件清单

### `saltShaker(o, opts)`：盐罐

约 50×50×90。透明玻璃圆柱罐身（厚玻璃底），里面白色细颗粒（点阵小圆）占约 2/3；顶上银色钢盖（三道细纹 + 圆顶）带 5 个小孔；罐身正面贴一张米白小标签。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `label` | `"盐"` | 标签字；含 `" · "` 时拆成两行（前段大字、后段小字） |
| `level` | `0.66` | 颗粒高度 0–1 |
| `state` | `"normal"` | `broken`：罐身空、标签红斜线（"盐已删除"），不变虚、无红叉 |
| `scale` | `1` | 以地面点等比缩放，anchors 已换算 |
| `glow` | `false` | 脚下绿色地光 |

可动部件：`ID-grains`（颗粒组）、`ID-cap`（盖子）、`ID-puff`（8 粒飘出的盐 `ID-puff-0..7`，默认隐藏）、`ID-slash`（标签红斜线）、`ID-label`（标签组）。

anchors：`top`（盖顶上方）、`center`（罐身中心）、`ground`、`spout`（盖孔上方，颗粒飘出的起点）、`label`（标签中心）。

| 助手 | 说明 |
| --- | --- |
| `KITX24.shake(tl, id, t, dir=[46,18], dur=0.9)` | 罐身晃一下，8 粒盐从 `spout` 朝屏幕偏移 `dir`（px，物件本地尺度）呈弧线飘出后淡出。可重复调用。返回结束时间 |
| `KITX24.empty(tl, id, t, dur=0.6)` | 清空：颗粒下沉并淡出，标签红斜线出现（等于动画版的 broken） |
| `KITX24.refill(tl, id, t, dur=0.5)` | 装回颗粒、去掉红斜线 |
| `KITX24.capLift(tl, id, t, up=true, dur=0.35, dy=16)` | 盖子抬起 `dy` px / 放回（`up=false`） |

撒进漏斗：`dir` 取 `[漏斗口.x − spout.x, 漏斗口.y − spout.y]`（世界画布 px；scale ≠ 1 时除以 scale）。
