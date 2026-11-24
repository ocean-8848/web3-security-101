# ep04 补充拟物物件（kit-ext）

这是第 04 章（重入）BRIEF 第 2 节"需新补物件"表里的 7 个物件。投影（方位 35°、仰角 30°）、材质、DOM 骨架（`ID` → `ID-glow / ID-solid / ID-wire / ID-x`）、`opts.id` / `opts.state`（`normal` / `broken` / `attacker`）/ `opts.glow` / `opts.scale` 约定都与 `../../kit/objects.mjs` 一致，先读 `../../kit/README.md`。`KIT.grow`、`KIT.broke`、`KIT.fixed` 可直接用。

样张：`showcase.png`，来自 `demo/`（12 秒三屏，每行一屏，左列动作前，右列动作后）。与 kit 的 `person`、`safe` 和 ep01 的 `vending`（主角 Bank）、`miniVend`，ep03 的 `contractMachine` 放在一起比例对照。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | 7 个物件 + 定位助手 `vendButton` / `miniButton` / `machineOut` + `haspChain`，另有 `CATALOG_EXT`、`runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX04`**（同时合并进 `window.KITX`，与 KITX01 / KITX03 不重名）。全部排进 `tl`，确定性，可任意 seek |
| `demo/` | 样张工程：`node src/build.mjs` 生成 `compositions/showcase.html`，再 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { G, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import { vending, miniVend, runtimeExtJs as rt01 } from "../../../ep01/kit-ext/objects-ext.mjs";
import { callbackArm, hasp, vendButton, runtimeExtJs as rt04 } from "../../kit-ext/objects-ext.mjs";

const oVm = G(980, 620);
const vm = vending(oVm, { id: "vm", sign: "BANK" });
const b0 = vendButton(oVm, 0);                                        // withdraw 按钮
const lock = hasp(b0.o, { id: "h0", z: b0.z, scale: b0.scale, locked: false });
const arm = callbackArm(G(790, 930), { id: "cb", target: vm.anchors.buttons[0], coin: true });
// 画家顺序：按 at(origin)[1] 从小到大（hasp 的原点在按钮正下方的地面，天然排在 vending 之后）
// <script>：${runtimeJs()} ${rt01()} ${rt04()}，然后
//   KITX04.armPress(tl, "cb", 1.0);            弹出、按下、收回
//   KITX01.press(tl, "vm", 0, 1.45, "red");     按钮闪红
//   KITX04.hasp(tl, "h0", 3.0, true);           扣上锁扣
```

- 必须先内联 kit 的 `runtimeJs()`（`lockerDoor` 用 `KIT.door`）。调用一律写 `KITX04.xxx`。
- 运行时会改 transform / 属性的部件只能交给助手动：弹簧臂各路径、扣板、锁梁、库存管、笔、幽灵指针、纸带裁剪框、取件柜门。整件移动用 ep03 的 `KITX03.fly / moveUV`（对根 `<g id=ID>` 做 x/y）。
- 同一部件多段动画按时间顺序调用，每段从上一段终值开始。

## 定位助手

| 函数 | 返回 | 用途 |
| --- | --- | --- |
| `vendButton(oVm, i, scale=1)` | `{o, z, scale}` | ep01 `vending` 第 i 个按钮（0 在最上）中心 → 给 `hasp` |
| `miniButton(oMv, i, scale=1)` | `{o, z, scale}` | ep01 `miniVend` 第 i 个按钮（hasp 自动缩到 0.8） |
| `machineOut(oM)` | `{o, z}` | ep03 `contractMachine` 出件斜槽口 → 给 `punchCard` 纸带 |

## 物件清单

### `callbackArm(o, opts)`：回调弹簧臂（攻击合约的 receive）

红色小机座（约 76×64×92，正面是回调箭头铭牌），顶上 −u 侧一只镀铬接币托盘（可放一枚金币），+u 侧塔座上是铰链毂；从毂里伸出**钢弹簧 + 红色剪刀伸缩臂（lazy tongs）+ 指着的小红手**。整条臂在世界画布里按目标点实时求解：伸得越长，剪刀越窄，弹簧越松。放在 `miniVend({kind:"attacker"})` 出币口旁边。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `target` | 机座右上方 | 指尖要按到的世界画布点，如 `vending.anchors.buttons[0]` |
| `s` | 0 | 初始伸出量：0 收起（折叠在毂前），1 指尖正好在 target |
| `coin` | false | 托盘里一枚金币（`ID-coin`，用 opacity 控制） |
| `maxReach` | 到 target 的距离 | 运行时会换到更远目标时给（决定剪刀节数） |
| `scale` | 1 | ERC-777 钩子"缩小版"用 0.5–0.6 |

- **可动**：`ID-arm`。
  - `KITX04.callArm(tl, ID, t, s, dur, {target, ease})`：伸到 s（可同时换目标）；伸出默认 `back.out` 弹出感，收回 `power2.in`。
  - `KITX04.armPress(tl, ID, t, {target, hold=0.35, reach=1})`：弹出→戳一下→停 hold→收回，约 1.3 秒。`reach<1`（如 0.86）= 被锁扣挡住、够不到。
- **anchors**：`top`、`center`、`ground`、`mount`（弹簧根部，卡 B 的虚线可连这里）、`pan`（接币托盘，硬币落点）、`tip`（构建时的指尖）。

### `tellerCounter(o, opts)`：银行柜台（seg2 柜员比喻）

约 476×138，台面高 116，玻璃隔板顶 290。木质柜身（四块护墙板、黄铜 BANK 铭牌）、石材台面、两个窗口：每个窗口有玻璃（高光）、传声孔、拱形递钞口和下凹的金属递钞槽，窗口编号挂在顶部青蓝横梁上。台后站柜员（kit `person` engineer，id `ID-teller`），台面上柜员一侧有一叠绿色现金、一本摊开的账本（kit `ledgerBook` 缩小）、一支悬着的笔；右侧立柱上一根金库库存管（绿液位，见底变红）。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `teller` | true | 画柜员 |
| `cash` | 3 | 台面现金叠数 |
| `penDown` | false | 笔一开始就落在账本上（`ID-pen-mark` 可见） |
| `stock` | 1 | 库存管液位 0..1 |
| `sign` | `"BANK"` | 柜身铭牌 |

- **可动**：
  - `ID-cash-0..3`：`KITX04.cashOut(tl, ID, i, t, dur)`，从 1 号窗口递钞槽滑到顾客一侧，依次叠高（`ID-cash` 是这 4 叠的外层组）。
  - `ID-pen`：`KITX04.pen(tl, ID, t, down, dur)`，落笔时账本上出现改账笔迹 `ID-pen-mark`，`false` 抬笔。
  - `ID-stock`：`KITX04.stock(tl, ID, t, value, dur)`，≤0.05 自动变红。
- **anchors**：`top`、`center`、`ground`、`teller`（柜员头）、`ledger`（账本，放大镜 / "余额 100" 标签放这里）、`pen`（笔尖落点）、`slot`（顾客侧递钞口）、`cashOut`（现金落点）、`customer`（顾客站位地面点：1 号窗口左前方，避免挡住递钞槽）、`window1`、`window2`、`stock`。

### `hasp(o, opts)`：函数锁扣（含瞬态锁）

钢制搭扣：左侧铰链片 + 铰链销、可翻转的扣板（中间有槽）、右侧锁鼻片，一把小挂锁穿过锁鼻挂着。扣板闭合时正好盖住按钮。原点 `o` + `opts.z` 是被盖住的按钮中心（用 `vendButton` / `miniButton` 求）；画在 +v 面前方 2 单位。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `z` | 150 | 按钮高度 |
| `locked` | true | false：扣板翻起（−118°），挂锁隐藏 |
| `transient` | false | **瞬态锁**：扣板和锁体变成半透明青蓝玻璃（锁体虚线描边），锁体里嵌一只小沙漏，右侧 "EIP-1153" 铭牌 |
| `plate` | true | 瞬态锁铭牌（按钮面板太挤时关掉，用 `wlab`） |
| `shared` | false | 锁体下方加铁链环；配 `chainTo` |
| `chainTo` | — | `[x,y]` 或 `[[x,y],…]`：铁链从 `anchors.eye` 垂到这些点（可串多台机器） |
| `chainShown` | true | 铁链初始可见 |
| `scale` | 1 | 近景展示可放大到 2–3 |
| `state` | normal | `attacker` 时扣板与锁体变红 |

- **可动**：
  - `ID-strap` / `ID-lock` / `ID-shackle`：`KITX04.hasp(tl, ID, t, locked, dur=0.7)`。上锁：扣板落下 → 挂锁出现、锁梁"咔"地落下并轻弹；开锁：锁梁弹起 → 挂锁淡出 → 扣板翻起。
  - `ID-chain-0..n`：`KITX04.chainOn(tl, ID, t, dur, on=true)`，一节节出现（`false` 反向消失）。
  - 瞬态锁 `ID-hsT` / `ID-hsBc` / `ID-hsS`：`KITX04.haspSand(tl, ID, t, dur)`，上沙下降、下沙堆高、中间沙流（"只在本交易内有效"）。交易结束锁消失可用 `KITX04.op4(tl, "#ID-solid", t, 0)`。
- **`haspChain(idPrefix, [P0, P1, …], {shown, sag, link})`**：单独画一条铁链（生成 `idPrefix-chain`，`chainOn` 可用）。**铁链要跨到更远/更近的机器时，用它单独画在所有物件之后**，否则会被画家顺序后面的机器盖住（demo 就是这样做的）。
- **anchors**：`top`、`center`（按钮）、`ground`、`lock`（锁体中心，"被拦"标签/绿勾放这里）、`eye`（铁链起点）、`strapTip`、`plate`（铭牌/标签点）、`chainEnd`。

### `pickupLocker(o, opts)`：取件柜（拉取式支付）

青蓝快递取件柜，默认 4 列 × 3 行（约 386×76×236 + 顶部灯箱 "PICKUP · 取件柜"）。左侧控制柱有大屏（取件码格）、扫码窗、键盘、出纸口；每格小门有编号牌（01 起）、深色小屏（金额）、镀铬拉手、通风槽；门后是有内壁的格子，可放一叠金币。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `cols` / `rows` | 4 / 3 | 格数；格子下标 i = 行 × cols + 列，0 在左上（门牌显示 i+1） |
| `amounts` | `{}` | `{i: "1 ETH"}` 小屏文字 |
| `blank` | true | 小屏先空着，等 `lockerWrite` 写入 |
| `coins` | `amounts` 的格子 | 哪些格里放金币 |
| `open` | `{}` | `{i: deg}` 初始开门角度 |
| `title` | `"PICKUP"` | 灯箱字 |

- **可动**：
  - 门 `ID-c{i}`：沿用 kit 保险柜门结构，`KIT.door(tl, "ID-c{i}", t, 105)` 或 `KITX04.lockerDoor(tl, ID, i, t, deg, dur)`；铰链在右边，门向右前方打开（真 3D，带厚度）。
  - `ID-c{i}-amt`：`KITX04.lockerWrite(tl, ID, i, t)`，金额闪两下写入小屏（Bank "把金额写进格门"）。
  - `ID-c{i}-coin`：`KITX04.lockerTake(tl, ID, i, t, dur)`，硬币被取出（向前上方移出并淡出）。
- **anchors**：`top`、`center`、`ground`、`front`、`panel`（控制屏）、`cells[i]`（门中心）、`inside[i]`（格内）、`stand`（取件人站位地面点）。

### `oracleGhost(o, opts)`：预言机红色幽灵指针

不改 ep01：叠在 `miniVend({kind:"oracle"})` 上画。和那台 miniVend **用同一个 origin、同一个 id、同一个 scale**，紧跟在它后面画（排序时 Y 加 0.01）。内容：一根半透明红色虚边"幽灵指针"`ID-needle-bad`（带红晕和两道朝真实读数拖的残影 `-t1/-t2`），表盘边缘一段红色误差弧（真实读数 ↔ 幽灵读数），轴帽重画；正面价格曲线窗叠一条红色虚线尖峰。墨色正常指针保持原样。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `id` | `"mv"` | 等于 miniVend 的 id（生成 `ID-ghost`、`ID-needle-bad`） |
| `deg` | 50 | 幽灵指针角度（0 竖直，表盘 ±70） |
| `real` | -20 | 正常指针角度（应与 miniVend 的 `needle` 相同；残影和误差弧朝它） |
| `shown` | true | false 时先隐藏 |

- **可动**：`KITX04.ghostOn(tl, ID, t, on)` 显隐；`KITX04.ghost(tl, ID, t, deg, dur, ease)` 摆到某角度；`KITX04.ghostWobble(tl, ID, t, dur, center, amp=8, period=0.5)` 确定性摆动（逐渐衰减）。残影、误差弧自动跟随。
- **anchors**：`dial`、`tip`（幽灵指针尖）、`chart`（价格曲线窗）、`top`、`ground`。

### `punchCard(o, opts)`：字节码打孔纸带 / 打孔卡

- `kind:"tape"`（默认）：米色打孔纸带从 ep03 `contractMachine` 的出件斜槽口滑下，再平铺在地上沿 +v 延伸，末端 V 形剪口，带投影。孔位来自 `bytes`（hex，每字节一列：8 个数据孔 + 中间一排小链孔）。原点、高度用 `machineOut(oMachine)`。
- `kind:"card"`：一张立在钢支架上的老式穿孔卡（切角、列号、行号、矩形孔、右下 `title`），用于"源码卡 vs 打孔卡"并排。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `z` | 18 | （tape）出口高度 |
| `len` | 360 | （tape）平铺段长度 |
| `s` | 1 | （tape）初始吐出比例，0 = 还没吐 |
| `bytes` | 一段字节码 hex | 孔位 |
| `red` | `[]` | 标红的列号（"锁槽不一致"那几孔） |
| `redShown` | true | 红标初始可见 |
| `cols` / `title` | 24 / `"BYTECODE"` | （card）列数、卡面字 |

- **可动**：`ID-tape`：`KITX04.tape(tl, ID, t, s, dur)`，纸带从出口往外吐（裁剪揭开，0..1）。红标 `ID-red`（tape 另有 `ID-red-b`）：`KITX04.tapeMark(tl, ID, t, true|false|"flash")`。
- **anchors**：`top`、`center`、`ground`、`red`（第一处红列中心，红虚线连这里）；tape 另有 `start`（出口）、`end`（纸带头）。

## KITX04 速查

| 调用 | 作用 |
| --- | --- |
| `callArm(tl, ID, t, s, dur, {target, ease})` / `armPress(tl, ID, t, {target, hold, reach})` | 弹簧臂伸缩 / 一次完整按压 |
| `cashOut(tl, ID, i, t, dur)` / `pen(tl, ID, t, down, dur)` / `stock(tl, ID, t, v, dur)` | 柜台：递钞、落笔、库存液位 |
| `hasp(tl, ID, t, locked, dur)` / `chainOn(tl, ID, t, dur, on)` / `haspSand(tl, ID, t, dur)` | 锁扣开合、铁链出现、瞬态锁沙漏 |
| `lockerWrite(tl, ID, i, t)` / `lockerDoor(tl, ID, i, t, deg, dur)` / `lockerTake(tl, ID, i, t, dur)` | 取件柜写金额、开门、取币 |
| `ghostOn` / `ghost` / `ghostWobble` | 幽灵指针显隐、摆到角度、摆动 |
| `tape(tl, ID, t, s, dur)` / `tapeMark(tl, ID, t, on)` | 纸带吐出、红列标记 / 闪 |
| `op4(tl, sel, t, to, dur)` | 记住上次终值的 opacity 动画 |
| `armGeom` / `setArm` / `setGhost` / `setTape` | 底层求解 / 直接设置（一般不用） |

## 已知事项

- `hyperframes check` 会报 `dead_stretch`，原因同 kit：动作在 `#cam` 里的 SVG 属性上，取样器看不到，snapshot 可以确认在动。
- 锁扣按 vending 按钮间距（19）设计，倍率 1 时只有约 70×45 px，远景里只是质感；讲锁的镜头要推近（≥1.6），或另放一个放大的 hasp（demo 第 2 屏）。瞬态锁里的沙漏和铭牌字在倍率 <2 时读不出，要读的字用 `wlab`。
- 弹簧臂是屏幕平面里的剪刀机构（总朝目标点），不做遮挡判断：它总是画在它所在的层上，目标在机器背面时会穿帮。目标应在机器正面（按钮、投币口）。伸得很远（>500）时剪刀很细，像晾衣架，属正常形态；需要更粗时把 `scale` 调大、物件放近。
- `hasp` 的扣板翻开是在面内旋转（向左上翻起），不是真 3D 翻出面外；翻起的扣板会压到 vending 的橱窗边。
- 铁链跨机器时要用 `haspChain` 单独画在最后（见上）。
- 取件柜门向右开，开着的门会挡住右边一格的左半；要同时开相邻两格时，门开角度给 80° 左右更清楚。
- 柜台的顾客站位在 1 号窗口左前方；人物若站在窗口正前方会挡住递钞槽。柜员在玻璃后面，颜色会被玻璃略微冲淡。
- 纸带只沿 +v 平铺，不会拐弯；机器要转向时自己用 `len` 和摆位配合。
