# ep05 补充拟物物件（kit-ext）

第 05 章（访问控制）BRIEF 第 2 节要求新补的 6 个物件。投影和接口都与 `../../kit/` 相同（方位 35°、仰角 30°），签名为 `fn(origin, opts) → { svg, anchors }`。

- `opts.id`：id 前缀。
- `opts.state`：`normal` / `broken` / `attacker`。
- DOM 骨架：`ID` → `ID-glow / ID-solid / ID-wire / ID-x`，所以 `KIT.grow` / `KIT.broke` / `KIT.fixed` 可以直接用。
- 坐标约定和颜色语义见 `../../kit/README.md`。

样张是 `showcase.png`，来自 `demo/`（12 秒，三屏）。每行一屏：左边是动作前，右边是动作后。旁边放了 kit 的 `person`、`safe` 作比例对照。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | 6 个物件，另外导出 `ROLES`、`CATALOG_EXT05`、`runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端助手，挂在 `window.KITX05`，同时合并进 `window.KITX`。全部排进 `tl`，逻辑确定，可以任意 seek |
| `demo/` | 样张工程。先 `node src/build.mjs`，再 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
import { G, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import { funcPanel, keycard, accountSafe, thresholdMeter, runtimeExtJs } from "../../kit-ext/objects-ext.mjs";

const fp = funcPanel(G(1200, 600), { id: "fp", buttons: [{ name: "initialize" }, { name: "kill", guard: "card" }] });
// <script>：先内联 kit 的 runtime，再内联本章的
//   ${runtimeJs()}
//   ${runtimeExtJs()}
//   KITX05.guard(tl, "fp", 0, 1.0, "card");  KITX05.swipe(tl, "fp", 0, 1.6, true);  KITX05.press(tl, "fp", 0, 2.0);
```

- 一律用 `KITX05.xxx` 调用。和 ep01、ep03 的库同时加载时，`window.KITX` 里的同名通用助手（`tw` / `fade` / `fly` / `moveUV` / `led`）**不会被本库覆盖**，保留先加载那一套。本章特有的助手会合并进去。
- `led`、`swipe`、`gate` 的灯，以及 `guard` 里读卡器的弹出，用的是 `KIT.led` / `KIT.pop`，所以要先内联 kit 的 `runtimeJs()`。
- 下列部件的 transform 或几何由助手每帧重算，不要再对它们用 GSAP 的 x / y / rotation：护罩 `ID-cover-i`、钥匙 `ID-k-*`、出口挡板 `ID-gate`、液位、冰罩的裁剪框。
- 整件物件要移动时，用 `KITX05.fly(tl, id, t, dx, dy, dur, lift)` 或 `KITX05.moveUV(tl, id, t, du, dv, dz, dur, lift)`。它们对任意 `<g id>` 做绝对位移，和 `KIT.grow` 可以共存。

## 物件

### `funcPanel(o, opts)`：函数按钮台

钢灰斜面控制台，台面后仰 20°。

- 结构：底座、背部遮檐（深色条上印 "CONTRACT · EXTERNAL FUNCTIONS"、每个按钮一颗状态灯）、黑色内嵌面板。
- 每个按钮：镀铬圈加青蓝蘑菇按钮帽。
- 正面（+v）：每列一块读卡器安装位（四颗螺丝的空板）和一块 mono 铭牌。
- −u 侧：通风槽。
- 尺寸：宽 = `n·pitch + 48`（5 个按钮时 568），深 170，后沿高 150、前沿约 88。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `buttons` | `mint, initialize, kill, upgrade, pause` | 字符串，或 `{name, guard, color, open, rd}` |
| `guard`（每个按钮） | `"none"` | `none` 裸按钮；`card` 透明翻盖护罩加正面读卡器（= 修饰器）；`broken` 红虚线空位（护罩和读卡器的轮廓，= 缺权限检查）；`plate` 焊死的钢板（四脚、螺栓、焊痕，= `_disableInitializers`） |
| `color`（每个按钮） | 青蓝 | `red` / `gray` / `green` / `#hex` |
| `open` / `rd` | 0 / `"off"` | 护罩初始角度、读卡器 LED 初始色 |
| `pitch` / `depth` / `height` | 104 / 170 / 150 | 按钮间距、台深、后沿高 |
| `lamps` | `false` | 每个按钮右下的"已初始化"小灯 `ID-lamp-i`，初始灭 |
| `title` | 见上 | 遮檐字样 |
| `state:"attacker"` | — | 第 `opts.atk`（默认 0）号按钮变红 |

- **可动部件**：
  - `ID-btn-i`：按钮帽，带闪光层 `ID-btn-i-fl`。
  - `ID-guard-i`：护罩外层。其中的 `ID-cover-i` 是翻盖本身，绕后沿翻转。
  - `ID-rdr-i`：读卡器。`ID-rd-i` 是它的 LED，`ID-rs-i` 是卡槽亮边。
  - `ID-gap-i`：红虚线空位。
  - `ID-plate-i`：焊死钢板。
  - `ID-st-i`：遮檐状态灯。
  - `ID-lamp-i`：已初始化小灯。
- **anchors**：
  - `top`、`center`、`ground`、`front`。
  - `btns[i]`：按钮顶。
  - `readers[i]`：读卡器 LED，刷卡和虚线的落点。
  - `slots[i]`：卡槽。
  - `plates[i]`：铭牌。
  - `covers[i]`：护罩顶。

### `keycard(o, opts)`：门卡

白色厚卡，64×40×3。卡面元素：

- 顶边色带，带角色字样。
- 挂绳孔。
- 银色芯片、头像框、两条字行和一行地址小字。

`blank:true` 时色带变灰，卡面只印 `0x0`（零地址）。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `role` | `upgrader` | `upgrader`（青蓝）/ `param`（墨）/ `pauser`（绿）/ `minter`（灰）/ `owner`（墨）；`state:"attacker"` 时为红色 ATTACKER |
| `color` / `text` | 按 role | 自定义色带颜色和字样 |
| `blank` | `false` | 零地址空白卡 |
| `pose` | `"stand"` | `stand` 立着（卡面朝 +v，带挂绳）；`flat` 平放（挂绳盘在地上） |
| `lanyard` | stand 时为 true | 是否画挂绳 |
| `z` / `scale` | 0 / 1 | 离地高度（例如拿在手里时）、缩放 |
| `holder` | `0x7a3f…c91e` | 卡面地址小字 |

- **可动部件**：整张卡用 `KITX05.fly` / `moveUV` 移动。
- **anchors**：`top`、`center`、`ground`、`face`（卡面中心）、`hole`（挂绳孔）。
- 卡上的字只起质感作用，角色名请用 `wlab` 标出。

### `roleBoard(o, opts)`：角色门卡挂板

落地钢制洞洞板：两腿加底脚，深色边框，顶部墨条印 "ACCESS ROLES" 或 "VALIDATOR KEYS"。

**角色模式**（默认 4 钩，板宽 472）：每列从上到下依次是

- mono 铭牌。
- 镀铬挂钩。
- 挂着的 `keycard`（1.2 倍）。
- 持有者小格，图标可以是：`multisig` 三个人头、`bot` 天线监控盒、`contract` 迷你齿轮机器、`person`。
- 青蓝延迟吊牌。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `roles` | `upgrader, param, pauser, minter` | 某项为 `null` 时是空钩 |
| `holders` | `multisig, multisig, bot, contract` | 某项为 `null` 时不画 |
| `delays` | `≥48h 示例, 24h 示例, 无延迟, —` | 延迟吊牌文字 |
| `plates` / `colors` / `blank` | — | 覆盖铭牌字、色带颜色、空白卡（数组按下标） |
| `empty` | `[]` | 这些钩上的卡初始隐藏，等 `KITX05.hang` 挂上 |
| `title` | 见上 | 顶条字样 |

**钥匙模式**（`hooks > 4` 或 `mode:"keys"`，9 钩时板宽 634）：每钩挂一把黄铜钥匙，铭牌编号 1..n。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `group` | — | 例如 `[0,1,2,3]`：一个墨色半透明圆角框把这几把钥匙围住，左上角黑签写 `groupText`（默认"同一机构"） |
| `groupOn` | `true` | `false` 时框初始隐藏 |
| `groupDash` | `"none"` | 框的描边虚线样式 |
| `stale` | group 之外的第一个钩 | 这个钩下贴一张褪色便签，文字为 `staleText`（默认"未撤销 / 的授权"） |
| `noteOn` | `true` | 便签是否初始显示 |

- **可动部件**：
  - `ID-card-i`：门卡；钥匙模式下是 `ID-key-i`。用 `KITX05.hang` 挂上或取下。
  - `ID-hold-i`、`ID-tag-i`：持有者小格、延迟吊牌。
  - `ID-grp`：框加框内钥匙，用 `KITX05.fly` / `moveUV` 整组抓走。
  - `ID-grpf`：只有框，用 `KITX05.fade`。
  - `ID-note`：便签。
- **anchors**：
  - `top`、`center`、`ground`。
  - `hooks[i]`、`cards[i]`：卡或钥匙中心，虚线落点。
  - `holders[i]`、`tags[i]`。
  - `group`：框上沿中点。
  - `note`。

### `accountSafe(o, opts)`：TRON 账户门禁柜

青灰色宽柜，500×210×304，比 kit 的 `safe` 宽、矮。

- **上半**：一条深色锁盘带，三个锁盘配 `Owner` / `Active` / `Witness` 铭牌。
  - Owner 最大，镶黄铜边。
  - 每个锁盘中心是青蓝锁芯。
  - 锁盘右侧一排钥匙孔。插进去的黄铜钥匙在柄下挂一枚青蓝圆牌，写权重。
- **左下**：OUT 出口。上方有 OUT 铭牌、钥匙图标和指示灯；内部是带百叶挡板的槽口；外面有托盘。
- **右下**：柜门。门上有玻璃小窗（能看到 USDT 硬币堆）、USDT 铭牌和把手。柜内是硬币堆，与 kit safe 的门同构，所以 `KIT.door(tl, ID, t, 100)` 可以直接开门（铰链在右）。
- **顶面**：IN 投币槽。
- **−u 侧**："TRON ACCOUNT" 铭牌。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `keys` | `{owner:[2,1,1], active:[1,1], witness:[1]}` | 每个钥匙孔的权重。`0` / `null` 只留空孔 |
| `inserted` | `false` | `true` 全部插入；或 `["owner-0","active-1"]` 只插这几把。未插入的钥匙隐藏 |
| `owners` | — | `"attacker"`：Owner、Active 锁芯一开始就是红色，柜体不变色 |
| `open` | 0 | 柜门角度 |
| `gate` | `false` | `true` 出口挡板一开始就落下，OUT 灯为红 |
| `coins` | `[7,9,6,8,5]` | 柜内每堆硬币枚数（循环使用） |

- **可动部件**：
  - `ID-door`：柜门，用 `KIT.door`。
  - `ID-core-{owner|active|witness}` 和 `…-atk`：锁芯，用 `KITX05.cores` 或 `KIT.swap`。
  - `ID-ring-{dial}`：锁盘高亮环。
  - `ID-k-{dial}-{j}`：钥匙。
  - `ID-gate`、`ID-out-led`：出口挡板和出口灯。
  - `ID-in-glow`、`ID-coin-0..2`：投币口亮边和投入的硬币。
  - `ID-outc`：出口滑出的硬币。
- **anchors**：
  - `top`、`center`、`ground`、`front`。
  - `dials.{owner,active,witness}`：锁盘中心。
  - `plates.{…}`：锁盘铭牌。
  - `keyholes["owner-0"]` 等。
  - `inSlot`、`out`、`window`、`cavity`。
  - `core`：等于 `dials.owner`。

### `thresholdMeter(o, opts)`：阈值刻度柱

玻璃量筒，结构如下：

- 黑色底座，上面一圈钢环。
- 透明筒壁：后壁淡色，前壁带高光条。
- 左侧刻度和数字 1..max。
- 青蓝虚线阈值环，右侧伸出一个数字标签。
- 顶上是钢帽和半球顶灯。

液柱为青蓝色，从左到右由亮到暗，每格有分隔弧线。底部可以接一根软管通往账户柜。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `max` / `th` | 5 / 3 | 格数、阈值 |
| `level` | 0 | 初始液位，单位为格 |
| `thText` | `String(th)` | 阈值标签文字，例如 `"3 / 5"` |
| `h` / `r` | 270 / 34 | 筒高、半径 |
| `color` | 青蓝 | `"green"` 绿液；`state:"attacker"` 红液 |
| `pipe` / `pipeDir` | 0 / `"-u"` | 软管长度和方向（`-u` / `-v` / `+u` / `+v`） |

- **可动部件**：
  - `ID-liq`：液柱，用 `KITX05.fill(tl, ID, t, to, dur)`。液位一到阈值，`ID-lamp` 自动变绿，回落时熄灭，seek 安全。
  - `ID-th`：阈值线组。
- **anchors**：
  - `top`、`center`、`ground`。
  - `lamp`、`th`：阈值标签根部。
  - `levels[k]`：第 k 格右侧点。
  - `pipeEnd`。

### `iceShell(o, opts)`：冰封罩

按包围盒生成的半透明淡蓝白冰壳，罩在任意物件外。

- 顶边略不规则，有白色高光斜纹。
- 三个可见面上都有霜花，正面和侧面有冰裂纹。
- 顶边挂一排冰溜，底部一圈冰碴，地面有一滩冰水。
- 只表示"冻结"，不带红色；红色语义交给旁边的标签。
- 绘制顺序：放在被罩物件**之后**画。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `box` | — | `[u0,u1,v0,v1,z0,z1]`，相对 o 的被罩包围盒。kit safe 用 `[-160,160,-135,135,0,340]`，hotWallet 用 `[-110,110,-95,95,0,236]` |
| `w` / `d` / `h` | 300 / 240 / 330 | 没给 `box` 时按居中的长、宽、高生成 |
| `pad` | 14 | 冰壳外扩 |
| `seed` | id | 霜花、裂纹、冰碴的确定性随机种子 |
| `on` | `true` | `false` 时一开始隐藏，等 `KITX05.freeze` |

- **可动部件**：
  - `ID-ice`：整层冰壳。
  - `ID-clip`：自下而上冻住时用的裁剪框。
- **anchors**：`top`、`center`、`ground`、`front`。

## runtime-ext.js · window.KITX05 速查

| 调用 | 作用 |
| --- | --- |
| `press(tl, ID, i, t, {hold, status})` | 按钮下沉 6 并闪白光，0.28 s 后弹回（`hold:true` 不弹回）。遮檐状态灯随之亮（默认绿） |
| `lid(tl, ID, i, t, deg, dur)` | 护罩绕后沿翻开（约 100）或扣上（0） |
| `guard(tl, ID, i, t, mode, dur)` | 防护切换，`mode` 取值见下 |
| `swipe(tl, ID, i, t, ok)` | 刷卡：卡槽亮边、LED 蓝闪两下，然后变绿（ok）或红（`false`） |
| `rd(tl, ID, i, t, color)` | 读卡器 LED 直接换色 |
| `keyIn(tl, ID, "owner-0", t, {dur, deg, turn})` | 钥匙在门前出现，推入锁孔，再转 90°（`turn:false` 不转） |
| `keyTurn(tl, ID, key, t, deg)` / `keyOut(tl, ID, key, t, {hide})` | 钥匙转动 / 回正、拔出并淡出 |
| `cores(tl, ID, t, "attacker"\|"normal", dials)` | 锁芯换成红色或换回，默认 Owner、Active 依次换 |
| `ring(tl, ID, dial, t, on)` | 锁盘高亮环 |
| `gate(tl, ID, t, closed)` | 出口挡板落下（OUT 灯变红）；`closed:false` 时升起（灯变绿） |
| `coinIn(tl, ID, t, n, gap)` | 硬币从顶部 IN 槽依次落入，投币口闪亮 |
| `coinOut(tl, ID, t, back)` | 硬币滑到出口托盘；`back:true` 时收回 |
| `fill(tl, ID, t, to, dur)` | 量筒液位到 `to` 格，到阈值时顶灯变绿 |
| `freeze(tl, ID, t, dur, "up"\|"drop")` / `thaw(tl, ID, t, dur)` | 冰壳自下而上冻住，或从上方落下 / 化开淡出 |
| `hang(tl, ID, i, t, on)` | 挂板上的卡或钥匙从上方落到钩上；`on:false` 时取下 |
| `fly` / `moveUV` / `fade` / `tw` / `led` | 通用助手，语义同 ep03 |

`guard` 的 `mode`：

- `"card"`：护罩弹跳扣上，读卡器弹出。
- `"none"`：护罩和读卡器拿掉。
- `"broken"`：显示红虚线空位。
- `"plate"`：钢板落下焊死。

同一部件有多段动画时，按时间顺序调用。每段的起点就是上一段的终值。

## 已知事项

- `hyperframes check` 会报 `dead_stretch`，原因和 kit 一样：动作都发生在 `#cam` 里的 SVG 属性上，取样器看不到。snapshot 可以确认这些动作确实在动。
- 物件上的小字只起质感作用：铭牌、门卡字样、挂板吊牌、锁盘名。相机倍率 1.2 以上大致可读，0.8 以下读不出来。需要观众看清的字一律用 `wlab`。
- **按钮台**：
  - 按钮杆是竖直圆柱，没有垂直于 20° 斜面，近看底部与面板交界略有出入。
  - 护罩是半透明玻璃，面的先后顺序固定；翻到 100° 左右看着没问题，翻过 120° 后前后关系会不真实。
- **账户柜**：
  - 钥匙转 90° 后，钥匙环横着朝 +u 伸出约 30 单位，相邻钥匙会互相压住一点。这是有意的密排；在锁盘之间没有越界。
  - 柜门向右开，打开后会伸出柜体右侧约 300 单位，布局时右边要留空。
- **挂板**：只做了朝 +v 的一种朝向，持有者图标和吊牌是印在板面上的平面图形，不是立体件。
- **冰封罩**：顶面是放样体，各小面之间的半透明拼缝会叠出极淡的竖纹，远景看不出来。`freeze("up")` 的裁剪按屏幕 y 推进，是近似的"从下往上"。
- ep01、ep03 的通用助手与本库同名（`fade`、`fly` 等）时，同一个元素请只交给一套助手去动，否则两套"上次终值"会对不上。
