# ep06 补充拟物物件（kit-ext）

第 06 章 BRIEF 第 2 节"需要新补的拟物物件"表里的 6 个物件。它们和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `broken` / `attacker` 之一，`opts.glow` 控制地光。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，所以 `KIT.grow`、`KIT.broke`、`KIT.fixed` 可以直接用。坐标约定、颜色语义见 `../../kit/README.md`。

样张：`showcase.png`，来自 `demo/`（12 秒，三屏）。每行是一屏，左列是动作前，右列是动作中或动作后。第一屏右列是落刀的瞬间。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | 6 个物件，另有 `certFace()`（凭证卡面）、`besideSafe()`（出票机贴保险柜定位）、`CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX06`**（同时合并进 `window.KITX`）。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时 HyperFrames 样张工程。运行 `node src/build.mjs` 后执行 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { G, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import { safe } from "../../../kit/objects.mjs";
import { roundCutter, shareDispenser, besideSafe, shareCert, runtimeExtJs } from "../../kit-ext/objects-ext.mjs";

const rc = roundCutter(G(900, 650), { id: "rc", dir: "down" });
const vO = G(3280, 560);
const vault = safe(vO, { id: "vault", plate: "ERC-4626" });
const sd = shareDispenser(besideSafe(vO), { id: "sd" });
// <script> 里：先 kit 的 runtime，再其他章的 ext（如果用到），最后本章的
//   ${runtimeJs()}
//   ${runtimeExtJs()}
//   KITX06.lever(tl, "rc", 1.0, "down");  KITX06.cut(tl, "rc", 1.5, "L");
```

- **调用名一律用 `KITX06.xxx`**。它也会合并进 `window.KITX`，但别的章（KITX01 / KITX03）同时加载时，用 `KITX06` 才能保证调到本章的实现。本章助手名和 KITX01、KITX03 不重名。
- 运行时会改 transform 的部件只能交给助手来动，不要再对它们用 GSAP 的 x/y/rotation。这类部件有：铡刀、拨杆、碎屑、推料组、游标、小数点、出票机票据、披萨块、投递卡片。
- 整件物件要移动时用 `KITX06.carry(tl, ID, t, du, dv, dz, dur, lift)`，它对根 `<g id=ID>` 做 GSAP x/y，可以和 `KIT.grow` 共存。
- 除 `shareCert` 外，所有物件都支持 `opts.scale`（以地面原点等比缩放，anchors 跟着缩放）。`roundCutter` 默认 1.25，其余默认 1。

## 物件清单

### `roundCutter(o, opts)`：取整刀（主角）

工业版裁纸铡刀。原始尺寸 320×180，刀床面高 104，默认 `scale: 1.25`，所以实际约 400×225，抬刀后刀柄高约 330（人物约 250）。

- **刀床**：钢板顶面刻青蓝网格，每格 = 1 个最小单位。前沿是白色刻度条，整数刻线加粗并标 0–8，半格和 1/4 格是细线。刀口是第 `cutAt` 格处的一道黑色刀槽。
- **料**：一根金条，左边 `stock` 格是整数部分，刀口右边 `chip` 格是余数碎屑。
- **前沿（+v）**：两个抽屉式托盘。左边青蓝托盘铭牌"协议"，右边红托盘铭牌"调用者"。托盘里的金色碎屑可以累积，每盘最多 9 块。
- **−u 侧面**：黑色挡位板上有一根两档拨杆，挡位牌是"向上 ↑"（白字）和"向下 ↓"（青蓝字），各配一盏挡位灯。
- **后侧**：靠山导轨和铰链座。铡刀绕后角铰链在 u = 刀口 的竖直面里转动，刀柄是黑色橡胶握把。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `dir` | `"down"` | 拨杆初始挡位：`"up"` 或 `"down"` |
| `bladeUp` | `true` | `false` 时铡刀一开始就落下 |
| `stock` / `chip` | `1` / `0.5` | 金条整数部分和余数碎屑的长度，单位是格（默认 1.5 = 1 + 0.5） |
| `load` | `true` | `false` 时不放金条 |
| `cutAt` | `6` | 刀口在第几条整数刻线 |
| `pileL` / `pileR` | `0` | 两个托盘里初始的碎屑数（0–9） |
| `labels` | `{L:"协议",R:"调用者"}` | 托盘铭牌字 |
| `scale` | `1.25` | 等比缩放 |
| `state` | `normal` | `attacker` 时机身变红；托盘颜色不变 |

- **可动部件和助手**：
  - `ID-blade`：`KITX06.blade(tl, ID, t, down, dur?)`。落刀默认 0.22 s（power3.in），抬刀 0.45 s。
  - `ID-lever`：`KITX06.lever(tl, ID, t, "up"|"down", dur?)`。拨杆回弹到位，同时点亮对应的挡位灯 `ID-led-up` / `ID-led-dn`。
  - `ID-chip`：`KITX06.chip(tl, ID, t, "L"|"R", dur?)`。碎屑沿弧线跳进左托盘（协议）或右托盘（调用者），落地后消失，那个托盘的碎屑堆 +1。复位用 `KITX06.chipReset(tl, ID, t)`。
  - `ID-pileL-k` / `ID-pileR-k`：`KITX06.pile(tl, ID, "L"|"R", t, n)` 直接把堆设成 n 块。
  - `ID-feedA` / `ID-feedB`：`KITX06.feed(tl, ID, t, dur?)`。金条从左边推进刀床。默认从 0 s 起就停在外面（`hold`），第 5 个参数传 `false` 可以关掉。
  - **组合动作**：`KITX06.cut(tl, ID, t, side)` 依次落刀、碎屑入盘、堆 +1、抬刀，约 0.9 s，返回结束时间。`KITX06.cuts(tl, ID, t, side, n, period)` 重复 n 次，中间自动复位碎屑，`period` ≥ 0.95，适合"重复 1000 次"的镜头。
- **anchors**：
  - `top`、`center`、`ground`
  - `cut`：刀口中点（床面）。`chip`、`stock`：碎屑和金条顶面中心
  - `trayL`、`trayR`：托盘正面底边，标签用 `wlab(..., "t")` 挂在下方
  - `trayLTop`、`trayRTop`：托盘口上方
  - `lever`：拨杆轴心。`leverUp`、`leverDn`：两块挡位牌
  - `pivot`：铡刀铰链。`handle`：抬刀时刀柄位置
  - `ticks[]`：刀床前沿每条整数刻线 0..8。`cell`：一格的世界长度（已乘 scale）

### `decimalRuler(o, opts)`：精度刻度尺

一把立在两只木支架上的木框钢尺，尺面朝 +v。尺头是一块铭牌，写链名（只是质感）。钢尺被小数点分成两段：左边 `ints` 格是整数位（白底，第 `ints` 格写 "1"），右边 `places` 格是小数位（青蓝底，每格写 "0"）。`places: 18` 的那把格更密（18 对 30）、尺更长。尺上卡着一个青蓝游标，带玻璃窗和发丝线。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `places` | `6` | 小数位格数（6 或 18） |
| `ints` | `4` | 整数位格数 |
| `chain` | `"CHAIN"` | 尺头铭牌字 |
| `slider` | `n − 1.5` | 游标发丝线的初始位置，单位是格，从整数段左端算 |
| `digits` | `true` | 格内数字 |
| `cell` | 30 / 18 | 每格宽 |
| `scale` | `1` | 等比缩放 |

- **可动部件和助手**：
  - `ID-slider`：`KITX06.slider(tl, ID, t, pos, dur?)`，滑到第 pos 格。
  - `ID-dot`：`KITX06.shiftDot(tl, ID, t, cells, {flash, red, dur})`。小数点相对原位右移 cells 格（负数左移），小数段底色 `ID-dec` 跟着伸缩。`flash` 默认开：移动结束后，挪过的那一段 `ID-err` 红色闪三下，并停在淡红；`red` 默认开：小数点变红（`ID-dot-r`）。"写死精度"的演法是 18 位尺 `shiftDot(…, 12)`。
  - `KITX06.rulerOk(tl, ID, t)`：清掉红色。
- **anchors**：`top`、`center`、`ground`、`head`（铭牌）、`dot`（小数点原位）、`sliderTop`，`cells[]`（每条格线的底部点 0..n）、`cellW`。小数点挪过之后，标签用 `cells[ints + 挪动格数]` 来挂。

### `shareDispenser(o, opts)`：份额出票机

一台白色搪瓷小售票机，约 120×90×200，顶上有一盏小灯。

- **正面（+v）**：
  - 青蓝顶带写"总份额"。
  - 机械计数窗（数字滚轮）。
  - 出票口和一块镀铬接票托板。
  - 右下角是"资产"投入口，左下是通风格栅。
- **−u 侧**：青蓝饼图徽记和通风条。
- 它是按贴在 kit `safe` 的 −u 侧来设计的：`shareDispenser(besideSafe(safeOrigin), …)`。这样它的正面和保险柜正面齐平，画家顺序会自动排在保险柜之后。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `digits` | `5` | 计数窗位数 |
| `value` | `0` | 计数窗初值 |
| `tickets` | `3` | 预置可吐的凭证张数 |
| `issued` | `0` | 一开始已经躺在托板上的张数 |
| `led` | `"off"` | 灯的初始颜色 |
| `scale` | `1` | 等比缩放 |

- **可动部件和助手**：
  - `ID-dg-i`：`KITX06.tally(tl, ID, t, dur, from, to)`，里程表式滚动。`from` 省略时接着上一次的值。`KITX06.setTally(ID, v)` 立即设值。
  - `ID-ticket-i`：`KITX06.issue(tl, ID, t, i)`。第 i 张票从出票口水平滑出，再落到托板上，一张叠一张。票在机身里的那一段被裁掉，看不到。灯同时亮一下。
  - `ID-led`：也可以用 `KIT.led`。
- **anchors**：`top`、`center`、`ground`、`counter`（计数窗中心）、`slot`（出票口）、`shelf`（托板）、`coin`（资产投入口）、`lamp`、`led`

### `shareCert(o, opts)`：份额凭证

60×36 的小卡片：米白卡面，青蓝双线边框，左边一个圆形徽记（饼图的一角），右边写"份额"。卡面也可以单独用 `certFace({atk, ghost, text})` 画在任何面坐标系里（本地 60×36）。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `stand` | `false` | 立在一个黑色小卡座上 |
| `n` | `1` | 张数。平放时错落叠起，立放时前后排 |
| `scale` | `1` | 卡片放大倍数（1 倍比较小，近景建议 1.3–1.6） |
| `z` | `0` | 离地高度，可以放在别的物件上 |
| `ghost` | `false` | 虚拟份额：半透明青蓝，虚线描边，没有厚度也没有阴影 |
| `state` | `normal` | `attacker`：红边、红徽记 |
| `text` | `"份额"` | 卡面字 |

- **可动部件**：成叠时第 k 张是 `ID-c-k`，用 `KITX06.carry` 单张移动；整叠移动 carry 根 `ID`。
- **anchors**：`top`、`center`、`ground`

### `pizza(o, opts)`：披萨（比喻专用，场景里挂灰标签"比喻"）

- **纸盒**：牛皮纸色。盒盖立在后侧，内面印着 "PIZZA" 和一角披萨图案；前挡板放平。
- **木板**：盒里一块带柄的圆木板，柄朝 +v 伸出。
- **披萨**：整张，有饼边、芝士、橄榄、罗勒、蘑菇和焦斑。配色避开了红色，免得和"攻击者"的红色语义混淆。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `slices` | `8` | 切几块。`1` = 整张只切成 1 块 |
| `box` | `true` | `false` 时只画木板和披萨 |
| `rot` | `-22.5` | 第一刀的角度 |
| `pulled` | — | `{i: dist}`：第 i 块一开始就被拉出 dist |
| `scale` | `1` | 等比缩放 |

- **可动部件**：`ID-s-i`，用 `KITX06.serve(tl, ID, i, t, dist, dur?, lift?)` 沿这一块自己的方向拉出 dist 个世界单位（0 = 推回），也可以用 `KITX06.carry` 做任意移动。
- **anchors**：`top`、`center`、`ground`，`pizza`（顶面中心）、`slices[]`（各块中心）、`lid`（盒盖中心，挂"比喻"标签合适）、`board`

### `burnBox(o, opts)`：死地址投递箱

一个焊死的深灰钢箱，约 150×120×190，用地脚螺栓固定在底板上。

- **顶部**：只有一个投入口。
- **正面**：原来门的位置一圈焊珠，旧铰链被磨平，原锁孔位置焊了一块圆钢片。中间是黑铭牌，写"死地址"和 `0x…dEaD`，下方还有 "NO EXIT"。
- **−u 侧**：一道竖焊缝。
- 箱子没有门，也没有锁孔。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `plate` / `sub` | `"死地址"` / `"0x…dEaD"` | 铭牌字 |
| `cards` | `1` | 预置可投入的凭证张数 |
| `loaded` | `false` | 第 0 张一开始就悬在投入口上方 |
| `cardAtk` | `false` | 卡片画成红边 |
| `scale` | `1` | 等比缩放 |

- **可动部件**：`ID-card-i`，用 `KITX06.burn(tl, ID, t, i)`。卡片在投入口上方出现，0.3 s 后竖着落进去，投入口以下的部分被裁掉，然后消失。
- **anchors**：`top`、`center`、`ground`、`slot`、`plate`（铭牌中心）、`card`（卡片悬停位置）

## runtime-ext.js · window.KITX06

| 调用 | 作用 |
| --- | --- |
| `blade(tl,ID,t,down,dur?)` / `lever(tl,ID,t,"up"\|"down",dur?)` | 取整刀：铡刀、拨杆（带挡位灯） |
| `chip(tl,ID,t,"L"\|"R",dur?)` / `chipReset(tl,ID,t)` / `pile(tl,ID,side,t,n)` / `feed(tl,ID,t,dur?,hold?)` | 取整刀：碎屑入盘、复位、托盘堆数量、推料 |
| `cut(tl,ID,t,side)` / `cuts(tl,ID,t,side,n,period)` | 取整刀组合：一刀 / 重复 n 刀 |
| `slider(tl,ID,t,pos,dur?)` / `shiftDot(tl,ID,t,cells,{flash,red,dur})` / `rulerOk(tl,ID,t)` | 精度尺 |
| `tally(tl,ID,t,dur,from,to)` / `setTally(ID,v)` / `issue(tl,ID,t,i,dur?)` | 份额出票机 |
| `serve(tl,ID,i,t,dist,dur?,lift?)` | 披萨块拉出或推回 |
| `burn(tl,ID,t,i,dur?)` | 死地址投递箱 |
| `carry(tl,id,t,du,dv,dz,dur?,lift?,ease?)` | 通用：任何元素按世界位移移动（相对建造位置的绝对量） |

同一部件有多段动画时，按时间顺序调用即可，每次调用都从上一次的终值开始。

## 已知事项

- `hyperframes check` 会报 `dead_stretch`，原因和 kit 一样：动作都发生在 `#cam` 里的 SVG 属性上，取样器看不到。snapshot 可以确认这些动作确实在动。样张工程里标题交叉淡入时还有 `content_overlap` 警告，这是预期的。
- 碎屑飞向左托盘时画在铡刀和金条之后（画家顺序固定），飞行中途会短暂被铡刀挡住。
- 落刀时金条整数部分画在刀片前面。按物理遮挡这是对的（金条在刀口靠观众一侧），但看上去像是"刀从金条后面切下"。
- 物件上的小字（拨杆挡位牌、托盘铭牌、出票机"总份额"、铭牌链名）在相机倍率 0.8 以下基本只是质感。需要观众看清的字一律用 `wlab` 标签。
- 精度尺 1 倍时偏小（6 位尺约 390 长、高 112），近景可以给 `scale: 1.3`。
- `shareCert` 的 `scale` 是卡片自身的放大，不是通用的等比缩放；1 倍凭证约 60×36，远景里只是一个小色块。
