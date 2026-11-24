# ep27 补充拟物物件（kit-ext）

本集 BRIEF 第 2 节"需要新补的拟物物件"表里的 1 个物件：模型飞机 `planeModel`。它和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `broken`，`opts.glow` 控制地光（默认关），`opts.scale` 以地面原点等比缩放（anchors 已换算）。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，`KIT.grow` 可以直接用；骨架里多一层 `ID-mv`（整件包一层）。坐标约定、颜色语义见 `../../kit/README.md`。

**注意**：
- **id 不要取 `cam` 或 `root`**：舞台的镜头容器是 `#cam`、合成根是 `#root`，同名会让 `KIT.cam` 移动物件。建议 `plane`。
- broken 只在左翼（wingL）画红色虚线断口 + 红叉，整件不变虚，`ID-wire` 为空，不要用 `KIT.broke`；运行时用 `KITX27.wingBreak`。
- 机头朝 +u（画面右上），左翼 wingL 在 +v 侧（靠观众，看得最清楚），右翼 wingR 在机身后面。底座小牌的字在倍率 1 左右只是质感；要观众读的字用 `wlab` 贴 `anchors.top` / `anchors.plate`。

样张：`showcase.png`，来自 `demo/`（6 秒，一屏）。左图是动作前，右图是动作后：第一架（scale 1）整机青蓝描边闪两下后两侧机翼依次标红；第二架是 `state: "broken"`、`scale: 0.9` 的预设样子；第三架（0.9）左翼标红后加断口。E22 `wrench`（0.8）和 kit `person`（0.5）做比例对照；彩点是 `wingL` / `wingR`（红）、`nose`（绿）、`top`（蓝）的静止位置。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | `planeModel`，另有 `CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX27`**。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时样张工程：`node src/build.mjs`，然后 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { planeModel, runtimeExtJs as rt27 } from "../../kit-ext/objects-ext.mjs";
// segbase 写法：import * as X from "../../kit-ext/objects-ext.mjs"; segInit(…, { ext: [X, …] }) 后在 SHOTS 里用 X27.xxx
// 手写 <script>：先 kit 的 runtime，再其他集的 ext，最后本集的
//   ${runtimeJs()}
//   ${rt27()}
//   KITX27.wingRed(tl, "plane", 2.0, "L");
```

- **调用名一律用 `KITX27.xxx`**（segbase 里是 `X27.xxx`）。它也会合并进 `window.KITX`，但合并时**已存在的名字一律不覆盖**。
- 所有助手签名都是 `(tl, id, t, …)`；同一部件多次调用按时间顺序写，每次从上一次的终值开始。
- 助手只动 opacity；`ID-mv`、`ID-wingL`、`ID-wingR` 可以自由用 GSAP 平移。

## 物件清单

### `planeModel(o, opts)`：模型飞机

约 160×140×40（机身长 160、翼展 140），支架让机身底离地 60。白色小客机模型：机身沿 u、机头朝 +u，两侧后掠主翼 + 水平尾翼 + 垂直尾翼（青蓝翼尖），机身侧面一条青蓝窗带、机头墨色驾驶舱窗；墨色底座 + 细立杆；底座正面一块小牌写 `label`。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `label` | `"模型飞机"` | 底座小牌文字 |
| `state` | `"normal"` | `broken`：左翼中段红色虚线断口 + 红叉 |
| `scale` | `1` | 以地面点等比缩放，anchors 已换算 |
| `glow` | `false` | 脚下绿色地光 |

可动部件：`ID-wingL` / `ID-wingR`（两侧机翼）、`ID-wingL-red` / `ID-wingR-red`（机翼红色高亮层）、`ID-wingL-break` / `ID-wingR-break`（断口）、`ID-hi`（整机青蓝描边）。

anchors：`top`（垂尾顶上方）、`center`（机身中心）、`ground`、`wingL` / `wingR`（两侧机翼中段上表面）、`nose`（机头尖）、`tail`（垂尾）、`plate`（底座小牌）。

| 助手 | 说明 |
| --- | --- |
| `KITX27.wingRed(tl, id, t, side="L", on=true, dur=0.25)` | 一侧机翼标红 / 取消（side `"L"` / `"R"`） |
| `KITX27.wingBreak(tl, id, t, side="L", on=true, dur=0.25)` | 一侧机翼的红色虚线断口 + 红叉出现 / 消失 |
| `KITX27.planeHi(tl, id, t, dur=0.9, n=1)` | 整机青蓝描边闪 `n` 下再灭。返回结束时间 |
