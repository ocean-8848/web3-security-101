# ep03 补充拟物物件（kit-ext）

这是第 03 章 BRIEF 第 2 节里要求新补的 9 个物件。它们和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `broken` / `attacker` 之一，`opts.glow` 控制地光。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，所以 `KIT.grow`、`KIT.broke`、`KIT.fixed` 可以直接用。坐标约定、颜色语义见 `../../kit/README.md`。

样张：`showcase.png`，来自 `demo/`（12 秒，三屏）。每行是一屏，左列是动作前，右列是动作后。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | 9 个物件，另有 `cabinetCell()`、`CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 `window.KITX`。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时 HyperFrames 样张工程。运行 `node src/build.mjs` 后执行 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { G, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import { contractMachine, slotCabinet, cabinetCell, byteBlock, runtimeExtJs } from "../../kit-ext/objects-ext.mjs";

const A = contractMachine(G(1200, 600), { id: "mA", name: "A", pipe: 160 });
const cab = slotCabinet(G(1700, 520), { id: "cabA", fill: { 0: [{ bytes: 20, color: "teal" }] } });
// <script> 里：先 kit 的 runtime，再 ext 的
//   ${runtimeJs()}
//   ${runtimeExtJs()}
//   KITX.spin(tl, "mA", 1.0, 2.0, 1);  KITX.drawer(tl, "cabA", 0, 1.2, true);
```

- 用到 `KIT.led` 的助手（gauge、hash、sign 的灯）必须先内联 kit 的 `runtimeJs()`。
- 运行时会改 transform 的部件只能交给助手来动，不要再对它们用 GSAP 的 x/y/rotation。这类部件有：齿轮、指针、摇柄、抽屉、封面、托盘。
- 整件物件要移动时，用 `KITX.fly` 或 `KITX.moveUV`。它们对根 `<g id=ID>` 做 GSAP x/y，可以和 `KIT.grow` 共存。

## 物件清单

### `contractMachine(o, opts)`：合约机器

一台白色工业机箱，约 220×200×220，顶部有两个咬合的青蓝齿轮。

- **正面（+v）**：铭牌（大字 A/B/C）、显示字节码的小屏、带 "CALLDATA" 字样的投信口、通风格栅、出件槽和一个斜槽托板。
- **−u 侧**：圆舷窗，里面能看见两个转动的小齿轮。
- **可选**：从 −u 侧伸出的落地传送管。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `name` | `"A"` | 铭牌字，宽度随字数自适应 |
| `tone` | `"light"` | `"gray"` 是灰色变体（seg1 L8 的"灰色合约机器"） |
| `state` | `normal` | `attacker` 时整机红色，齿轮也是红色；`broken` 时为红虚线框加红叉 |
| `slotLit` | `false` | 投信口一开始就亮 |
| `pipe` / `pipeZ` | `0` / `64` | 传送管长度（沿 −v 方向）和高度，带落地支架；0 表示不画 |
| `code` | 两行 hex | 小屏内容。`screen2` 是备用内容，用 `KIT.swap("#ID-scr","#ID-scr2")` 切换 |
| `led` | `"green"` | 正面状态灯 |

- **可动部件**：
  - `ID-gear-0`、`ID-gear-1`（顶部齿轮，齿距相同，真咬合）和 `ID-gear-2`、`ID-gear-3`（舷窗齿轮）都用 `KITX.spin(tl, ID, t, dur, turns, ease?)`。以 0 号齿轮为准，其余按各自的 `data-ratio` 同步。`turns` 可以是负数；让它在半圈停住，可以用 `ease:"power2.out"`。
  - `ID-slot-glow` 用 `KITX.slot(tl, ID, t, on)`。
  - `ID-led` 用 `KIT.led`。
- **anchors**：
  - `top`、`center`、`ground`、`front`
  - `slot`：投信口中心，信封投入点
  - `out`：出件槽前方，吐信封的起点
  - `plate`：铭牌中心
  - `porthole`、`pipeEnd`、`gears[]`、`led`、`screenM`

### `slotCabinet(o, opts)`：存储抽屉柜

竖立的钢档案柜，一列 n 个抽屉，0 号在最下面，编号往上增加。顶部是青蓝铭牌 "Storage"。

- 每个抽屉正面有编号卡、镀铬拉手和锁孔。拉出来以后能看到托盘和 **32 个字节格**：每格一个点，每 8 格一道粗分隔。
- 柜宽 = 32·cell + 64。默认 cell 为 10，柜宽 384，高约 430（6 个抽屉）。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `n` / `dh` / `cell` | 6 / 58 / 10 | 抽屉数、抽屉高、每字节格宽 |
| `labels` | `"0".."n-1"` | 编号卡文字，可以写成 `"0x3608…"` |
| `title` | `"Storage"` | 顶部铭牌 |
| `open` | `{}` | `{i: 距离或 true}`，初始拉出量，`true` 等于 `maxOut`（104） |
| `fill` | `{}` | `{i: [{bytes, color, at?, over?, text?}]}`，抽屉里的字节块；不写 `at` 时从 0 号格依次排 |
| `tags` | `{}` | `{i: "private"}`，抽屉面上的锁形贴纸 |
| `glass` | `false` | 玻璃罩 `ID-glass`，用于只读（staticcall）或"柜子正面是玻璃的" |

- **可动部件**：
  - `ID-d{i}`：抽屉，用 `KITX.drawer(tl, ID, i, t, s|true|false, dur)`。
  - `ID-hl-{i}`：抽屉面描边，用 `KITX.mark(tl, ID, i, t, "teal"|"green"|"red"|"off")`。
  - `ID-fill-{i}`：抽屉里的全部字节块。`KITX.clearDrawer(tl, ID, i, t)` 先红闪再清空，`KITX.fillDrawer` 恢复。
  - `ID-blk-{i}-{j}`：单个字节块。
  - `ID-glass`：玻璃罩，用 `KITX.fade(tl,"#ID-glass",t,1)` 显示。
- **anchors**：
  - `top`、`center`、`ground`、`header`
  - `drawers[i]` / `drawersOpen[i]`：抽屉面中心，分别是关着时和全开时
  - `drawerLabels[i]`
  - `cells[i]`：全开时 0 号格的中心
  - `cellStep`（每格的屏幕位移）、`openVec`（每拉出 1 单位的屏幕位移）、`maxOut`
- **`cabinetCell(o, opts, i, k, s?)`**：返回世界坐标 `{u, v, z}`。把它当作 `byteBlock` 的原点、`z` 当作 `opts.z`，字节块就正好落在 i 号抽屉的第 k 格（抽屉拉出量为 s，默认全开）。做"块滑进抽屉"时，先把块画在柜前，再用 `KITX.moveUV` 移到这个位置。
- 画家顺序：柜子本身已经处理好抽屉之间的遮挡（抽屉从下往上画，再补画 −u 侧板和顶部，盖住伸进柜内的部分）。场景里只要按地面 Y 排序就行。

### `byteBlock(o, opts)`：字节格块

彩色条块，长度为 `bytes × cell`，每字节一道刻槽。原点 o 是**左端（−u 端）中心**的地面点。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `bytes` | 20 | 字节数 |
| `color` | `"teal"` | 可选 `teal`（owner）、`green`（paused）、`ink`（fee）、`gray`（total）、`red`，或任意 hex |
| `cell` / `depth` / `h` / `z` | 10 / 24 / 14 / 0 | 格宽、厚、高、离地高度 |
| `over` | 0 | 末尾几格画成红色，表示"放不下的那一格"（组 `ID-over`，可以闪） |
| `text` | — | 顶面上的小字 |

- **anchors**：`top`、`center`、`ground`、`left`、`right`、`len`。
- **用法**：fee 从 12 格缩成 11 格时，并排放两块，再用 `KIT.swap` 切换。

### `hashFunnel(o, opts)`：哈希漏斗

形状像绞肉机：上面是金属漏斗（中间有一道青蓝环），漏斗口能看到暗色内腔和搅刀。机身正面有 "keccak256" 铭牌和多孔出料板，下面接斜槽；−u 侧有木柄摇把。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `inputs` | `["键 k","槽 3"]` | 悬在漏斗上方的输入卡，数量 1 到 4 张 |
| `output` | `"哈希位置"` | 吐出的卡 |
| `text` | `"keccak256"` | 正面铭牌 |
| `done` | `false` | `true` 时一开始就是"已吐卡"状态 |

- **可动部件**：
  - `ID-in-k`：输入卡。
  - `ID-crank`：摇柄。
  - `ID-out`：输出卡。
  - `ID-led`：状态灯。
- **`KITX.hash(tl, ID, t)`**：约 1.6 秒。输入卡落进漏斗，被前沿遮住，然后淡出；摇柄转两圈，灯亮；输出卡从出料孔弹出来。`KITX.hashReset(tl, ID, t)` 把卡片放回去，可以再演一次。
- **anchors**：
  - `top`、`center`、`ground`
  - `hopper`：漏斗口
  - `port`：出料孔
  - `out`：输出卡中心，"飞向远处抽屉"的起点
  - `inputs[]`、`crank`
- 输出卡飞向抽屉时，建议在 `out` 和抽屉之间画一条 `dashCurve`，或者另做一张卡用 `KITX.fly` 移过去。

### `manual(o, opts)`：规程手册

平放的厚蓝皮活页手册。

- −u 侧是活页脊，上面有镀铬环扣。书页侧面有纹路，+v 边伸出青、绿、红三色分隔标签。
- 封面带护角，中间是白色标签，写 `title`。
- 第一页是横线纸加活页孔，可以写一行大字。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `title` / `sub` | `"B 的代码"` / `"规程手册"` | 封面标签 |
| `open` | 0 | 封面角度（0 合上，180 摊平） |
| `pageTitle` / `pageText` | `"§ 规程"` / — | 内页；`pageText` 用于 seg2 L21 的"清空 0 号抽屉" |

- **可动部件**：
  - `ID-cover`：用 `KITX.book(tl, ID, t, deg, dur)`。封面绕书脊做真 3D 翻转，带厚度，超过约 135° 时自动换成内衬面。
  - `ID-page`：内页内容组。
- **anchors**：`top`、`center`、`ground`、`page`（内页中心）、`title`（合上时封面标签中心）、`hinge`。
- "手册飞到 A 这边"：用 `KITX.fly(tl, ID, t, dx, dy, dur, lift)`，`lift` 给一个抛物线高度。

### `frameStack(o, opts)`：调用帧堆叠

托盘架由深色底座、四根镀铬立柱和每层导轨组成。n 层托盘是半透明青蓝色，A 在最下面。

- 每层左前角有标签块，托盘上放着"改动"：两张纸和两个小字节块。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `n` | 3 | 层数（架子容量） |
| `labels` | `["A","B","C"]` | 每层的标签 |
| `filled` | `labels.length` | 初始放了几层，其余隐藏，等 `push` |
| `items` | `true` | 托盘上的改动 |

- **可动部件**：
  - `ID-t{i}-g`：整层。
  - `ID-t{i}`：托盘面，绕前沿翻转。
  - `ID-t{i}-items`：托盘上的改动。
  - `ID-t{i}-red`：红闪层。
- **`KITX.tip(tl, ID, i, t, {deg=70, dur, keep, drop})`**：回滚。红闪 → 托盘向前翻、下坠 → 改动滑落、淡出 → 整层淡出（`keep:true` 时保留翻倒状态）。
- **`KITX.push(tl, ID, i, t)`**：压入一层，托盘从上方落回原位并复原。
- **冒泡**：从上往下依次 `tip`，例如 C → B → A，每层间隔 0.3 秒左右。
- **anchors**：`top`、`center`、`ground`、`trays[i]`（托盘中心）、`tabs[i]`（托盘标签处）。

### `gasGauge(o, opts)`：gas 油表

汽车式半圆油表，深色表壳有厚度，立在短柱和底座上。

- 表盘上有：刻度（4 个大格）、E 附近的红色区、E、½、F 字样、加油机图标、下沿的 "gas" 字样、黑色指针加镀铬轴帽、玻璃高光，右下角还有一个低油量灯。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `value` | 1 | 1 = F，0 = E |
| `label` | `"gas"` | 表盘下沿文字 |
| `scale2` | 自动生成的密刻度 | 替换刻度组，用于 seg5a L9 的"刻度被换掉一圈" |

- **可动部件**：
  - `ID-needle`：用 `KITX.gauge(tl, ID, t, value, dur, ease)`。`ease:"steps(8)"` 是"齿轮转一下、指针走一格"的效果。value ≤ 0.06 时，低油量灯 `ID-lamp` 自动变红，否则熄灭。
  - `ID-scale` / `ID-scale2`：用 `KIT.swap` 换刻度圈。
- **anchors**：`top`、`center`、`ground`、`dial`（表盘中上部）、`hub`、`needle`、`lamp`。
- 调用方和被调用方各放一块，就是两块油表。63/64 的点阵在场景层用 kit 的点阵样式另画。

### `selectorKey(o, opts)`：选择器钥匙

黄铜钥匙，钥匙齿**只有 4 个**，每个齿的深度由选择器对应字节的值决定，所以同一个 selector 一定是同一种齿形。

- 钥匙身上刻着 4 个字节的 hex。
- 手柄是带挂孔的圆角牌，白色铭牌上写函数名（mono），宽度随名字长短自适应。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `name` | `"transfer(address,uint256)"` | 铭牌文字 |
| `selector` | `"a9059cbb"` | 8 位 hex，可以带 `0x` |
| `stand` | `true` | 立着（文字好读）；`false` 时平放 |
| `z` / `nameSize` | 70 / 18 | 立放高度、铭牌字号 |
| `state` | `normal` | `attacker` 时是红色钥匙（Poly Network 那把"构造出来的函数名钥匙"） |

- **可动部件**：
  - `ID-teeth-hl`：齿区的青蓝虚线框，默认隐藏，用 `KITX.fade(tl,"#ID-teeth-hl",t,1)` 或 `KIT.pop` 显示。
  - `ID-name`：铭牌文字组。
- **anchors**：`top`、`center`、`ground`、`tip`（钥匙尖，插锁时对准 `padlock` 的 `keyhole`）、`bow`、`teeth`、`name`、`len`。

### `signboard(o, opts)`：告示牌

路边的木框白色告示牌：两根木柱加深色底座、顶檐、顶上一个小灯，左上角是黑底编号圆牌。三行行名"误解 / 事实 / 影响"是印在牌上的，空白牌也会显示。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `n` | `"1"` | 编号 |
| `myth` / `fact` / `impact` | — | 三行内容；字号随长度自动缩，不超过 26 |
| `struck` | `false` | 误解行的红色删除线已经划上 |
| `blank` | `false` | 内容先隐藏，等 `KITX.sign` 逐行翻出 |
| `lamp` | `false` | 顶灯亮绿（"讲完一块"） |
| `w` / `h` | 440 / 240 | 牌面尺寸 |

- **可动部件**：
  - `ID-myth`、`ID-fact`、`ID-impact`：三行内容组。
  - `ID-strike`：删除线。
  - `ID-lamp`：顶灯。
- **`KITX.sign(tl, ID, t, step)`**：`step` 可选 `"myth" | "strike" | "fact" | "impact" | "lamp"`，`"all"` 时每 0.5 秒推进一步。
- **anchors**：`top`、`center`、`ground`、`plate`、`myth`、`fact`、`impact`（三行中心，镜头推近时可以挂 `wlab` 放大关键词）、`lamp`。

## runtime-ext.js · window.KITX 速查

| 调用 | 作用 |
| --- | --- |
| `KITX.spin(tl, ID, t, dur, turns, ease)` | 合约机器所有齿轮同步转动 |
| `KITX.slot(tl, ID, t, on)` | 投信口亮或灭 |
| `KITX.drawer(tl, ID, i, t, s, dur)` | 抽屉拉出（`true` 为全开）或推回（`false` / 0） |
| `KITX.mark(tl, ID, i, t, color)` | 抽屉面描边，`off` 为熄灭 |
| `KITX.clearDrawer` / `KITX.fillDrawer` | 清空 / 恢复抽屉里的字节块 |
| `KITX.hash(tl, ID, t)` / `KITX.hashReset` | 哈希漏斗吐卡 / 复位 |
| `KITX.book(tl, ID, t, deg, dur)` | 手册封面翻开或合上 |
| `KITX.tip(tl, ID, i, t, opt)` / `KITX.push(tl, ID, i, t)` | 调用帧回滚翻倒 / 压入 |
| `KITX.gauge(tl, ID, t, value, dur, ease)` | 油表指针，带低油量灯 |
| `KITX.sign(tl, ID, t, step)` | 告示牌逐行翻出、删除线、亮灯 |
| `KITX.fly(tl, id, t, dx, dy, dur, lift)` / `KITX.moveUV(tl, id, t, du, dv, dz, dur, lift)` | 整件物件或任意组的绝对位移，可以走抛物线 |
| `KITX.fade(tl, sel, t, to, dur)` | 会记住上次终值的 opacity 动画 |
| `KITX.rotTo` / `KITX.rotBy` / `KITX.setRot` | 通用旋转器（带 `data-m` 的组） |

同一部件有多段动画时，按时间顺序调用。每段的起点就是上一段的终值。

## 已知事项

- `hyperframes check` 会报 `dead_stretch`，原因同 kit：动作都发生在 `#cam` 里的 SVG 属性上，取样器看不到。snapshot 可以确认这些动作确实在动。
- 物件上的小字只起质感作用，相机倍率 0.8 以下基本读不出来：机器小屏的 hex、漏斗铭牌、钥匙刻字、柜子编号卡在远景里都是这样。要观众读的字一律另挂 `wlab`。告示牌三行在倍率 ≥ 1.2 时可读。
- 抽屉柜的遮挡只针对"抽屉沿 +v 拉出"这一种情况调过。不要把柜子转向或镜像。
- 调用帧托盘的厚度用的是竖直偏移的 `<use>` 副本。翻倒角度大于 70° 时，厚度会略显不真实。
- 传送管只沿 −u 再转 −v 走线，不会自动对准抽屉柜。场景里要用 `pipe` 长度和柜子位置配合，接口点见 `anchors.pipeEnd`。
