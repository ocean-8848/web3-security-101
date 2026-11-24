# ep12 补充拟物物件（kit-ext）

本集 BRIEF 第 2 节"需要新补的拟物物件"表里的 1 个物件：Merkle 树挂牌架 `merkleTree`。它和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `broken` / `attacker` 之一，`opts.glow` 控制地光（默认关），`opts.scale` 以地面原点等比缩放（anchors 已换算）。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，`KIT.grow` 可以直接用；骨架里多一层 `ID-mv`（整件包一层）。坐标约定、颜色语义见 `../../kit/README.md`。

**注意**：
- broken 只标"缺的那一处"（根铭牌红虚线框 + 红叉 + "0x00"），整件不变虚，所以 `ID-wire` 是空的。不要对它用 `KIT.broke`，改用 `KITX12.rootState(…, "bad")`。
- **id 不要取 `cam`**（舞台的镜头容器就是 `#cam`）。建议 `mt`。

样张：`showcase.png`，来自 `demo/`（8 秒，两屏）。每行是一屏，左列是动作前，右列是动作后。第一屏：normal 树证明路径点亮 → 根亮绿勾 → 1 号叶子翻红 → 路径变红；旁边一棵 0.6 的根换成红字 "0x00" + 红虚线框；kit `person` 做比例对照。第二屏：attacker 与 broken 并排，再修回。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | `merkleTree`，另有 `CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX12`**。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时样张工程：`node src/build.mjs`，然后 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { merkleTree, runtimeExtJs as rt12 } from "../../kit-ext/objects-ext.mjs";
// segbase 写法：import * as X from "../../kit-ext/objects-ext.mjs"; segInit(…, { ext: [X, …] }) 后在 SHOTS 里用 X12.xxx
// 手写 <script>：先 kit 的 runtime，再其他集的 ext，最后本集的
//   ${runtimeJs()}
//   ${rt01()}
//   ${rt12()}
//   KITX12.path(tl, "mt", 2.0);
```

- **调用名一律用 `KITX12.xxx`**（segbase 里是 `X12.xxx`）。它也会合并进 `window.KITX`，但合并时**已存在的名字一律不覆盖**（`path`、`leaf` 之类可能已被别集占用）。
- 所有助手签名都是 `(tl, id, t, …)`；同一部件多次调用按时间顺序写，每次从上一次的终值开始。
- 运行时直接写属性的部件只交给助手去动，不要再对它们用 GSAP 的 x/y/rotation/scale：`ID-leaf`（transform）、`ID-path-t` / `ID-path-r`（stroke-dashoffset）。

## 物件清单

### `merkleTree(o, opts)`：Merkle 树挂牌架

约 180×60×180（腿脚 u ±82、v ±30；横梁顶 z 178）。木质 A 字形挂牌架：两对斜腿 + 顶上横梁 + 底下前后两根拉杆；横梁正中两根绳挂一块大铭牌 = 根（白底青蓝双框，写 `rootText`）；下面两层细绳：中层 2 块、底层 4 块叶子牌（白底青蓝框，牌面横线，不写真实数据）。全部牌子挂在 v = 6 的竖直面里，**正面朝 +v**（看向观众）。证明路径是一条沿绳子的粗线：叶子顶 → 中层牌 → 根铭牌中心。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `rootText` | `"根"`（broken `"0x00"`） | 根铭牌字；纯 ASCII 用等宽字体，字号按长度自动缩 |
| `leaf` | `-1`（attacker `1`） | 被替换的叶子序号 0–3（左 → 右），这一块画成红牌；`-1` = 无 |
| `path` | `false` | `true` = 证明路径已点亮 |

- 状态：normal 木色架 + 青蓝牌，路径青蓝；attacker 第 `leaf` 块红牌、路径红、根铭牌右上角绿勾（= 校验被骗过）；broken 根铭牌红虚线框 + 红叉 + 红字 "0x00"（= 根是零值，任何叶子都"通过"）。
- **`ID-leaf` 是哪一块**：`leaf` 为 0–3 时就是那一块（初始红面），否则是 1 号叶子（初始白面）。证明路径总是从 `ID-leaf` 那块出发。
- 可动：
  - `KITX12.path(tl, ID, t, on=true, dur=0.8)`：证明路径从叶子往上画到根 / 擦掉，返回结束时间。`ID-path`（`-t` 青蓝、`-r` 红两条叠着）。
  - `KITX12.pathTone(tl, ID, t, tone, dur=0.25)`：路径颜色 `"red"` / `"teal"`。
  - `KITX12.leaf(tl, ID, t, red=true, dur=0.5)`：`ID-leaf` 绕竖直中线翻面成红牌 / 翻回白牌，返回结束时间。`ID-leaf`（面 `-n` / `-r`）。
  - `KITX12.rootText(tl, ID, t, text, tone)`：根铭牌换字；`tone` 为 `"red"` / `"green"` 时红 / 绿字，否则墨色。`ID-root-t`。
  - `KITX12.rootState(tl, ID, t, state, dur=0.25)`：`"ok"` 绿勾、`"bad"` 红虚线框 + 红叉、`"normal"` 都不显示。`ID-root-ok` / `ID-root-bad`。
- anchors：`top`（横梁上方）、`center`、`ground`、`root`（根铭牌中心）、`mids[0..1]`（中层牌中心）、`leaves[0..3]`（叶子牌中心，左 → 右）、`leaf`（`ID-leaf` 中心）。"叶子 / 中间节点"两种前缀小签用 `wlab` 贴 `anchors.leaves[i]` / `anchors.mids[i]`。

## runtime-ext.js · window.KITX12

| 调用 | 物件 |
| --- | --- |
| `path` / `pathTone` / `leaf` / `rootText` / `rootState` | Merkle 树挂牌架 |

离散切换（换字）在 seek 回去时会恢复成之前的状态。

## 已知不足

- `hyperframes check` 报 `dead_stretch`，原因同 kit：动作都在 `#cam` 里的 SVG 属性上，取样器看不到，snapshot 可确认在动。
- 牌子很小：倍率 1 左右根铭牌的字刚好能认，叶子牌只是质感；要观众读的字用 `wlab` 贴 anchors。
- 牌面只朝 +v；斜腿在 u ±82 处，前腿会盖住一点最外侧叶子的边。
