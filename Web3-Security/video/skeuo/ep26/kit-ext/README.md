# ep26 补充拟物物件（kit-ext）

本集 BRIEF 第 2 节"需要新补的拟物物件"表里的 1 个物件：换脸面具 `faceMask`。它和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `attacker`，`opts.glow` 控制地光（默认关），`opts.scale` 以地面原点等比缩放（anchors 已换算）。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，`KIT.grow` 可以直接用；骨架里多一层 `ID-mv`（整件包一层）。坐标约定、颜色语义见 `../../kit/README.md`。

**注意**：
- **id 不要取 `cam` 或 `root`**：舞台的镜头容器是 `#cam`、合成根是 `#root`，同名会让 `KIT.cam` 移动物件。建议 `mask`。
- 没有 broken 状态（`ID-wire` 为空），不要用 `KIT.broke`。"伪造"用 `state: "attacker"` 或 `KITX26.maskRed`。
- 面具正对 +v（观众右前方）。托架小牌的字在倍率 1 左右只是质感；要观众读的字用 `wlab` 贴 `anchors.top` / `anchors.plate`。

样张：`showcase.png`，来自 `demo/`（6 秒，一屏）。左图是动作前，右图是动作后：第一只（scale 1）背面电路纹闪两下；第二只是 `state: "attacker"`、`scale: 0.8`、`label: "AI 生成"` 的预设样子；第三只（0.8）用 `maskMove` 把面具从托架上移到 kit `phone` 屏幕前，再 `maskRed` 加红描边。kit `person`（0.45）做比例对照；彩点是 `mask`（红）、`plate`（绿）、`top`（蓝）的静止位置。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | `faceMask`，另有 `CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX26`**。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时样张工程：`node src/build.mjs`，然后 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { faceMask, runtimeExtJs as rt26 } from "../../kit-ext/objects-ext.mjs";
// segbase 写法：import * as X from "../../kit-ext/objects-ext.mjs"; segInit(…, { ext: [X, …] }) 后在 SHOTS 里用 X26.xxx
// 手写 <script>：先 kit 的 runtime，再其他集的 ext，最后本集的
//   ${runtimeJs()}
//   ${rt26()}
//   KITX26.maskMove(tl, "mask", 2.0, [dx, dy]);
```

- **调用名一律用 `KITX26.xxx`**（segbase 里是 `X26.xxx`）。它也会合并进 `window.KITX`，但合并时**已存在的名字一律不覆盖**。
- 所有助手签名都是 `(tl, id, t, …)`；同一部件多次调用按时间顺序写，每次从上一次的终值开始。
- 运行时直接写 `transform` 的部件只交给助手去动，不要再对它们用 GSAP 的 x/y/rotation/scale：`ID-mask`。`ID-mv` 不受影响，可以用 GSAP 平移整件。

## 物件清单

### `faceMask(o, opts)`：换脸面具

约 70×30×110。白色硬质半脸面具（额头到鼻尖：两个眼洞 + 一道浅色鼻梁高光，无其他五官），正对 +v，立在墨色小托架上（底座 + 背后立杆）；面具背面是一层略大的墨色内壳，边缘露出一圈青蓝细电路纹（"AI 生成"）。托架底座正面一块小牌写 `label`。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `label` | `"换脸"` | 托架小牌文字 |
| `state` | `"normal"` | `attacker`：面具边缘一圈红色描边 |
| `scale` | `1` | 以地面点等比缩放，anchors 已换算 |
| `glow` | `false` | 脚下绿色地光 |

可动部件：`ID-mask`（面具本体连背壳和电路纹，整体平移）、`ID-circ-hi`（电路纹高亮，默认隐藏）、`ID-red`（红描边）。

anchors：`top`（面具顶上方）、`center` / `mask`（面具正面中心）、`ground`、`plate`（托架小牌）。

| 助手 | 说明 |
| --- | --- |
| `KITX26.maskMove(tl, id, t, [dx, dy], dur=0.8)` | 面具离开托架，平移到距静止位置 `[dx, dy]`（世界画布 px，已按 scale 换算；绝对偏移，`[0, 0]` 放回）。返回结束时间 |
| `KITX26.circuit(tl, id, t, dur=0.9, n=1)` | 背面电路纹亮 `n` 下再灭。返回结束时间 |
| `KITX26.maskRed(tl, id, t, on=true, dur=0.25)` | 红描边出现 / 消失 |

贴到手机屏幕前：`[dx, dy] = [A.phone.screen[0] − A.mask.mask[0], A.phone.screen[1] − A.mask.mask[1]]`（kit `phone` 包了一层缩放时先换算它的 anchors）。面具平移后仍按托架的深度排序，手机要放在面具的后方（−v / 屏幕更靠上），面具才会盖在屏幕前面。
