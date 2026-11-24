# ep01 补充物件（kit-ext）

第 01 章"合约安全全景"专用的拟物物件，补 `hf/kit/` 里没有的东西。投影、材质、DOM 结构、`opts.id` / `opts.state` / `opts.glow` 约定与 `kit/objects.mjs` 完全一致，先读 `../../kit/README.md`。

样张：`showcase.png`（来自 `demo/`，16 秒四屏；左列全景，右列近景）。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | 12 个物件，签名都是 `fn(origin, opts) → { svg, anchors }`；另有 `CATALOG_EXT`、`runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端 `window.KITX` 动画助手（依赖 `window.KIT`），确定性、可任意 seek |
| `demo/` | 样张工程（`node src/build.mjs` 生成 `compositions/showcase.html`） |

## 用法

```js
// segN/src/build-story.mjs
import { G, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import { chain } from "../../../kit/objects.mjs";
import { vending, flashDesk, runtimeExtJs } from "../../kit-ext/objects-ext.mjs";

const vm = vending(G(1100, 680), { id: "vm", maintDoor: "hidden" });
const svg = worldSvg("w", gridSvg() + vm.svg);
const labels = wlab("lb-vm", vm.anchors.top, "智能合约");
// <script> 里：先 ${runtimeJs()}，再 ${runtimeExtJs()}，再写场景时间线
//   KITX.press(tl, "vm", 2, 1.0);            按第 3 个按钮
//   KITX.dispense(tl, "vm", 1.4, { n: 3 });  吐 3 枚金币
//   KIT.pop(tl, "#vm-maint", 3.0);           维修门出现（maintDoor:"hidden" 时）
//   KITX.sideDoor(tl, "vm", 3.5, 105);       维修门打开
//   KIT.swap(tl, "#vm-impl", "#vm-impl-atk", 4.6, 0.3);  门后的实现模块被换成红色
```

所有物件都支持 `state:"broken"`（实体变淡 + 红虚线框 + 红叉，`KIT.broke/fixed` 可切换）和 `state:"attacker"`（主体变红）。`KIT.grow(tl, ID, t)` 可让任一物件从地面长出。

## 物件清单

尺寸是世界单位（≈ px，相机倍率 1）。参照：kit 人物高约 250，保险柜 290×240×334。

### `vending(o, opts)`：自动售货机 = 智能合约（主角）

200（u）×150（v）×300（z）。默认带绿色地光。
- **+v 正面**：灯箱招牌、玻璃橱窗、齿轮观察窗、右侧按钮面板、出货口（带翻板）。
  - 橱窗是真 3D 内腔：三层货架，每格有螺旋弹簧，上面放金条和硬币，前沿有青蓝价签条。
  - 按钮面板：显示屏、投币口、5 个按钮、退币钮。
- **−u 侧面**：贴着的电路图纸，可选维修门（门后是实现模块）。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `sign` | `"CONTRACT"` | 招牌字（只是质感，要读的字用 `wlab`） |
| `coins` | `true` | 库存：`true` 满 / `"low"` 只剩底层 / `false` 空 |
| `glass` | `true` | 橱窗玻璃与高光 |
| `maintDoor` | `false` | 维修门：`false` 无 / `true` 有 / `"hidden"` 有但透明（用 `KIT.pop` 让它出现） |
| `mdoorOpen` | `0` | 维修门初始角度（0 关，105 全开） |
| `impl` | `"blue"` | 门后实现模块：`"blue"` / `"attacker"` |
| `rivets` | `false` | 接缝铆钉（"装好不能修"） |
| `gears` | `true` | 齿轮观察窗 |
| `scale` | `1` | 整体缩放（对岸合约、市场里的一排小机器用 0.5–0.6） |

**可动部件**

| id | 说明 |
| --- | --- |
| `ID-btn-0..4` | 按钮。可用 `KITX.press` 闪一下，或用 `KIT.led` 改成常亮 |
| `ID-gear-0..3` | 齿轮，用 `KITX.gears` 转，相邻齿轮自动反向，转速按齿数比 |
| `ID-coin-0..7` | 出货硬币（初始隐藏），用 `KITX.dispense` 吐出，可选金色或红色 |
| `ID-half` | 半枚金币，舍入方向示意（初始隐藏，用 opacity 显示） |
| `ID-shelf-0..2` | 三层库存，同时带 class `ID-stock`，可整体淡出（`.vm-stock`） |
| `ID-glass` | 橱窗玻璃 |
| `ID-lcd` | 显示屏 |
| `ID-flap` | 出货口翻板 |
| `ID-schem` | 侧面电路图纸 |
| `ID-rivets` | 接缝铆钉，opacity 0/1 |
| `ID-maint` | 维修门整组 |
| `ID-mdoor` | 维修门门扇，用 `KITX.sideDoor` 开合，绕后侧铰链真 3D 转动 |
| `ID-dlock` | 门上的小挂锁 |
| `ID-impl` / `ID-impl-atk` | 门后实现模块：蓝色 / 红色，换芯用 `KIT.swap` |

**anchors**：
- 通用：`top`、`center`、`ground`
- 正面：`front`、`sign`、`glass`（橱窗中心）、`stock`
- 按钮面板：`panel`、`coinSlot`（投币口，"投一枚很小的硬币"落点）、`buttons[]`（世界画布点）、`btnIds[]`
- 出货：`tray`（出货口）、`trayOut`（硬币落地处）
- 其他：`gears`、`gearIds[]`、`side`（−u 面中心）、`schem`（图纸中心，放大镜扫这里）
- 维修门：`maint`、`maintTop`（门上方标签点）、`impl`（门后模块）、`maintHinge`、`maintFree`（门开 105° 时的自由边，钥匙或手伸过来的位置）

### `miniVend(o, {kind, label, needle, scale})`：外部合约小售货机

110×90×180，米白机身，青蓝招牌；`kind:"attacker"` 时为红色。

| kind | 正面图标 | 备注 |
| --- | --- | --- |
| `token` | 金币 | 代币 |
| `dex` | 两个互换箭头 | DEX |
| `oracle` | 价格曲线 | 顶上有表盘，指针 `ID-needle` |
| `attacker` | 红色回调箭头 | 攻击者合约 |
| `plain` | 空橱窗 | |

- 可动：`ID-btn-0..2`；oracle 的 `ID-needle`，0° 竖直向上，表盘刻度 ±70°，用 `KITX.needle` 转。
- anchors：`top`、`front`、`icon`、`tray`、`portL`（−u 面管道法兰）、`portR`、`portF`、`dial`、`btnIds`、`needle`。

### `pipe(o, {pts, r, flow, flowColor})`：连接合约的金属管（可组合性）

- `pts`：相对 o 的 `[du,dv,z]` 折线，建议沿轴向走。
- 两端有法兰，拐角有接头。
- 可动：`ID-flow` 是管内流动的青蓝虚线。`flow:true` 时初始可见；用 `KITX.dash(tl,"ID-flow",t,dur,delta)` 推进。
- anchors：`start`、`end`、`mid`。
- 画家顺序：管子要排在它所接物件中靠远（u 大）的那台之后、靠近的那台之前。

### `letter(o, {z, lift, w, h, state})`：立着的信封（交易）

- 默认 64×42，悬离地面 `lift` = 10。`z` 是底面高度，例如放在传送带上时取 78。`attacker` 时为红信封。
- 根元素带 `data-px/py`（底部中心点），`KITX.walk` 直接按世界画布点移动它。
- anchors：`top`、`center`、`ground`。

### `mempool(o, {n, red, sign})`：内存池排队区

- 区域 480×252：一块地台，伸缩隔离带（青蓝带子 + 镀铬立柱）围成三条蛇形通道，地面画着导向箭头。
- 后方龙门架挂牌 "Mempool"。
- 入口在左前（−u，v=84），出口在右后（+u，v=−84）。
- `n`（默认 7）封信封从出口往回排；`red` 是红信封所在的槽位下标数组。
- 可动：
  - `ID-env-0..n-1`：信封（即 `letter`），用 `KITX.walk` 移动。
  - `ID-sign`：挂牌。
- anchors：
  - `top`、`sign`、`entry`、`exit`
  - `slots[]`：15 个槽位，世界画布地面点，0 = 最靠近出口
  - `slotsUV[]`
  - `route[]`：入口 → 出口折线，可直接交给 `walk`
  - `envIds`

### `sorter(o, {letters, red, blockLabel, sealed, pose})`：分拣机（区块构建者 / 排序器）

- 传送带沿 +u（u −230..170，带面 z=78），带面有可动的虚线。
- 后侧立柱上有控制面板（3 个 LED，屏上显示 "1·2·3"），横梁伸到带子上方。
- 横梁上倒挂两节青蓝机械臂，带夹爪。
- 带子末端是敞口的青蓝区块箱（`#N` 标签，可以盖盖，可接 kit 的 `chain`）。
- 可动：

| id | 说明 |
| --- | --- |
| `ID-sh` / `ID-el` | 肩、肘关节。用 `KITX.reach(tl,ID,t,du,dz)` 做两节 IK：目标是相对肩部的 u 偏移、向下距离。也可用 `KITX.armPose` 直接给角度 |
| `ID-belt-0/1` | 带面虚线，用 `KITX.dash` 推进 |
| `ID-env-i` | 带上的信封 |
| `ID-lid` | 区块盖，opacity 0 → 1 即"封块" |
| `ID-led-0..2` | 控制面板指示灯 |
| `ID-block` | 区块箱整组 |

- anchors：`in`、`out`、`beltZ`、`beltSlots[]`、`shoulder`、`shoulderUVZ`（`[-20,0,246]`）、`block`、`blockIn`、`blockTop`、`ledIds`、`beltIds`、`envIds`。
- 夹带上信封的姿态（信封在带上 u = du 处）：`KITX.reach(tl,"sorter",t, du+20, 124)`。

### `bridge(o, {river, booth})`：跨链桥

- 真石拱桥：驼峰桥面带铺装和中线，拱圈有楔石，护栏、端柱、两盏灯。
- 桥沿 u 跨过一条沿 v 流的浅蓝色河，河宽 2×`river`，默认 170，两端渐隐，有水波。
- 近岸桥头后方立一个消息层 / 验证岗亭：带天线和信号弧，顶上有 LED。`booth:"attacker"` 时岗亭变红。
- 可动：

| id | 说明 |
| --- | --- |
| `ID-ripple` | 水波，用 `KITX.dash` 推进 |
| `ID-booth` | 岗亭子物件，有自己的 `-solid/-wire/-x`，可单独 `KIT.broke(tl,"br-booth",t)` |
| `ID-booth-led` | 岗亭指示灯 |
| `ID-wave-0..1` | 天线信号弧 |

- anchors：`top`、`crown`、`deck[]`（桥面中线 13 点，左 → 右，可交给 `walk` 让信封过桥）、`nearRoad`、`farBank`（对岸放售货机的地面点，用 `G(...farBank)` 换成 `{u,v}`）、`booth`、`boothId`、`river`。
- 对岸售货机要排在桥之后画（它的地面 Y 更小时要手动调整顺序）。

### `firewall(o, {len, open, led})`：防火墙 + 门禁闸机（seg2 Web2 对照）

- 两截砖墙：浅灰褐色砖，刻意不用红色，每块砖色调略有变化，带压顶。
- 中间是门禁翼闸：两根不锈钢立柱、青蓝玻璃翼板、读卡器、绿色通行箭头。
- 可动：
  - `ID-flap-0/1`：翼板，用 `KITX.gate(tl,ID,t,open)` 开合。
  - `ID-led`：读卡灯，用 `KIT.led` 设绿或红。
- anchors：`top`、`gate`（通道地面中心）、`gateFront`（闸机前排队点）、`reader`、`wallL` / `wallR`（墙顶中点，"攀爬中"的攻击者放这里）、`ledId`、`flapIds`。

### `flashDesk(o, {gold, frame, sign})`：闪电贷柜台

- 银色拉丝柜台，正面有闪电徽记。
- 后面是玻璃隔断和 "FLASH LOAN" 灯牌，台面有服务铃。
- 台面金条堆分 4 层，共 13 根，`gold:false` 时初始为空。
- `frame:true` 时显示青蓝线框立方体，表示"一笔交易"。
- 可动：
  - `ID-pile-0..3`：金条四层。`KITX.pileIn` 从下往上逐层落下，`KITX.pileOut` 从上往下逐层消失，`KITX.flash(tl,ID,t,hold)` = 先 in，停 hold 秒，再 out。
  - `ID-frame`：交易框。
- anchors：`top`、`counter`、`pile`、`frameTag`（交易框左上角，放"一笔交易"标签）、`frameId`、`pileIds`。

### `balance(o, {tilt})`：天平 = 不变量

- 黄铜立柱，墨色底座，带刻度弧（中心刻度绿色）和指针。
- 秤杆两端各吊一只托盘：
  - 左盘是硬币堆，代表"合约余额"。
  - 右盘是一叠存款单，代表"存款之和"。
- 默认 `tilt: 6`（左盘略沉，即"余额 ≥ 存款"），默认带绿色地光。
- 秤杆所在的竖直平面取的是投影后正好水平的方向（与 u 轴约成 19°），所以倾角在屏幕上一眼可见。
- 可动：`ID-beam` 和 `ID-panL` / `ID-panR`。用 `KITX.tilt(tl,ID,t,deg)` 驱动，deg > 0 表示左盘下沉，两盘跟着秤杆端点走。
- 打破不变量：先 `KITX.tilt(tl,"bal",t,-16)`，再 `KIT.broke(tl,"bal",t,{ghost:1,badge:false})`，效果是立柱和底座出现红虚线框、实体不变淡。
- anchors：`top`、`pivot`、`panL` / `panR`（盘上方标签点）、`panLlow` / `panRlow`、`foot`（底座前沿，放锚的图形）。

### `signBoard(o, {text, sub, style, size, w, z, color})`：牌子

- `style:"wood"`（默认）：插在地上的木牌，有两根桩、木板纹理和钉子。用于 seg3 L21 的"链与基础设施""人、设备和流程"。
- `style:"plate"`：立杆横臂下用链子挂一块白底青蓝框牌，六大类挂牌可以用它。
- `size` 默认 40，相机 0.8 时约 32 px，能读。宽度默认按字数自动算。
- 可动：plate 款的 `ID-face`。
- anchors：`top`、`board`、`w`、`h`。

### `timeLock(o, {frac, open})`：时间锁

- 挂锁正面嵌一个计时表盘：青蓝扇环表示剩余时间，加一根指针。
- 顶上有计时旋钮，下方有锁孔和 LED（锁定时红，解锁时绿）。
- 可动：
  - `ID-arc` / `ID-hand`：用 `KITX.countdown(tl,ID,t,dur,toFrac)` 推进。
  - `ID-shackle`：锁梁，用 `KITX.unlock(tl,ID,t)` 抬起，LED 同时变绿。
- anchors：`top`、`dial`、`keyhole`。

## runtime-ext.js · window.KITX

把 `runtimeExtJs()` 内联在 `runtimeJs()` 之后。所有助手都只往 `tl` 上排 tween，并记住上一段的终值，同一部件可以按时间顺序连续调用。

| 调用 | 作用 |
| --- | --- |
| `KITX.press(tl, ID, i, t, color, hold)` | 按钮 `ID-btn-i` 闪一下，默认绿色，`hold` 默认 0.35 s 后恢复 |
| `KITX.gears(tl, ID, t, dur, turns)` | 售货机齿轮转 `turns` 圈，匀速 |
| `KITX.dispense(tl, ID, t, {n, start, color, gap, dur, dist})` | 从出货口吐 `n` 枚硬币（`ID-coin-start..`），金色或红色，`dist` 控制滚多远 |
| `KITX.sideDoor(tl, ID, t, deg, dur)` | 售货机维修门转到 deg 度 |
| `KITX.walk(tl, elId, t, dur, pts, ease)` | 让带 `data-px/py` 的元素（`letter`）沿世界画布折线移动，自动从上一次位置出发 |
| `KITX.dash(tl, ids, t, dur, delta)` | 推进虚线 `stroke-dashoffset`：传送带、管道流动、河面水波 |
| `KITX.reach(tl, ID, t, du, dz, dur)` / `KITX.armPose(tl, ID, t, a1, a2, dur)` | 分拣机机械臂：IK 到目标点 / 直接给角度 |
| `KITX.needle(tl, ID, t, deg, dur)` | 预言机表盘指针 |
| `KITX.gate(tl, ID, t, open, dur)` | 防火墙翼闸开合 |
| `KITX.pileIn` / `pileOut` / `flash(tl, ID, t, hold)` | 闪电贷金条出现 / 收回 / 借—还一整轮 |
| `KITX.tilt(tl, ID, t, deg, dur, ease)` | 天平倾斜 |
| `KITX.countdown(tl, ID, t, dur, toFrac)`、`KITX.unlock(tl, ID, t, open)` | 时间锁倒计时 / 开锁 |

## 已知事项

- 物件上的小字（招牌 CONTRACT、TOKEN、PRICE、FLASH LOAN、区块 #N）只是质感。要观众读的字一律用 `wlab`；`signBoard` 是例外，它的字号是按可读设计的。
- `scale` 只在 `vending` / `miniVend` 上有。缩放后，内部动画（门、硬币、齿轮）照常工作，anchors 已经换算好。但不要对缩放过的 `mempool` / `sorter` 里的信封用 `walk`（它们没有 scale 参数）。
- `KITX.walk` 直接写根元素的 `transform` 属性，同一个元素不要再用 `KIT.grow` 或 GSAP 的 x/y。
- 物件内部已排好前后顺序。物件之间仍按地面 Y 从远到近画；信封跨通道移动时不会自动改变前后顺序。
- `mempool` 的信封、`firewall` 的砖块元素较多（mempool 约 120 KB SVG），一个画面里放一两个没问题。
- `hyperframes check` 报的 `dead_stretch` 与 kit 一样：动作发生在 `#cam` 里的 SVG 属性上，取样器看不到。
