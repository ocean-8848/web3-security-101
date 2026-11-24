# ep02 补充拟物物件（kit-ext）

这是第 02 章「私钥从哪里来」要用、但 `hf/kit/` 里没有的物件。接口、投影、DOM 结构、颜色语义都和 `kit/objects.mjs` 一样，先读 `kit/README.md`。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | 21 个物件，签名都是 `fn(origin, opts) → { svg, anchors }`；另有 `CATALOG_EXT`、`runtimeExtJs()`、`liftSvg()`、`VITRINE_FLOOR`、`CONVEYOR_TOP` |
| `runtime-ext.js` | 往 `window.KIT` 上追加动画助手。要在 kit 的 `runtimeJs()` 之后内联 |
| `showcase.png` | 样张，4 屏，每屏一张动作前、一张动作后（来自 `demo/`，16 秒） |
| `demo/` | 样张工程：`node src/build.mjs`，然后 `npx hyperframes check` / `snapshot` |

## 用法

```js
// segN/src/build-story.mjs
import { G, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";

const lot = X.lottery(G(800, 600), { id: "lot", glow: true });
const d32 = X.comboDial(G(1300, 620), { id: "d32" });
const d256 = X.comboDial(G(1700, 560), { id: "d256", rings: 8 });
// 世界 svg 里的物件按地面 Y 从小到大排（远的先画）
// <script> 里：${runtimeJs()}  ${X.runtimeExtJs()}  然后写场景时间线
//   KIT.drum(tl, "lot", 1.0, 2.0, 2);  KIT.ballOut(tl, "lot", 3.0);
//   KIT.dialTurn(tl, "d256", 1.0, 120, 2);
```

通用约定和 kit 一致：

- `opts.id` 是前缀，同一画面里每个实例必须不同。
- `state` 取 `normal`、`broken` 或 `attacker`：`broken` 时实体变成 0.18 透明，叠红虚线框和红叉；`attacker` 时主体变红。
- `glow:true` 在脚下加绿色地光。
- 每个物件都有 `anchors.top`、`center`、`ground`。
- 所有助手都只往 `tl` 上排 tween，结果只取决于时间线时间，可以任意拖进度。
- 同一部件有多段动画时，按时间先后调用。助手会记住上一段的终值。

## 物件清单

尺寸是世界单位，可以和 kit 对照：人物高约 250，保险柜 290×240×334。

### 熵源与转盘

| 函数 / 主要 opts | 样子 | 可动部件 → 助手 | 额外 anchors |
| --- | --- | --- | --- |
| `lottery(o,{size,balls,plate,out,angle})` | CSPRNG 摇奖机：青蓝底座和铭牌，A 字支架，横轴透明钢丝滚筒，筒里翻滚着带号码的小球；侧面有摇柄，前面有出球管和托盘。`size:"small"` 是小号 | `ID-drum`（端盖 `ID-cap-0/1`、钢丝、`ID-ball-i`、摇柄 `ID-crank`）→ `KIT.drum(tl,ID,t,dur,turns)`：滚筒转动，小球翻滚并按深度重排。`ID-out` → `KIT.ballOut(tl,ID,t)`：一颗球顺着出球管弹进托盘 | `drum`、`tray`、`chute` |
| `prngCounter(o,{plate,window,steps})` | PRNG 小号熵源：奶白色小机械计数器，正面转盘只有 0–7 共 8 档，有红指针、读数窗（默认"32 位"），侧面有摇柄 | `ID-ptr`、`ID-crank` → `KIT.tick(tl,ID,t,steps,dur)`：指针一格一格咔哒跳，摇柄跟着转 | `dial` |
| `comboDial(o,{rings,text,angle})` | 老式密码转盘立在钢底座上。`rings:1`：单圈 32 格刻度，下方刻"32 位"。`rings:8`：8 圈同心环叠成的大转盘，刻"256 位"，高约 380 | `ID-ring-0..n-1` → `KIT.dialTurn(tl,ID,t,deg,dur)`：相邻两圈反向转，外圈转得慢。单圈也可以用 `KIT.rot(tl,"ID-ring-0",…)` | `hub`（盘心）、`side`（−u 侧面轴座，传动轴接这里）、`back` |
| `shaft(o,{a,b,r,hi})` | 钢质传动轴，两端是万向节。`a`、`b` 是相对 origin 的 `[du,dv,z]` | `ID-st` 条纹 → `KIT.shaftSpin(tl,ID,t,dur,dist)`。`ID-hi` 是青蓝高亮层，调它的 opacity，用在 seg6 L11 | `a`、`b` |

seg1 的关键画面"大转盘被小转盘带动"可以这样搭：把 `shaft` 的 `a` 放在小转盘的 `anchors.side` 附近，`b` 放在大转盘的 `anchors.side` 附近。两个转盘各调一次 `dialTurn`，再对传动轴调 `shaftSpin`，三者用同一个时间段。

### 私钥生产线

| 函数 / 主要 opts | 样子 | 可动部件 → 助手 | 额外 anchors |
| --- | --- | --- | --- |
| `conveyor(o,{len,width})` | 皮带输送机，沿 +u 方向：钢边框、螺栓、支腿、滚筒，皮带上有横向防滑条。皮带面高 `CONVEYOR_TOP`=74 | `ID-stripes` → `KIT.belt(tl,ID,t,dur,dist)` | `deck`、`start`、`end`、`len` |
| `mnemonicPlate(o,{n,filled,title})` | 不锈钢助记词板，后仰 24° 立在支架上：拉丝纹理，四角螺丝，12 个编号槽，槽里只刻短横线，不写真实单词 | `ID-w-0..11` 是各槽的刻痕。把 opacity 从 0 调到 1，就是"刻上"。`filled:false` 时初始为空 | `plate` |
| `seedJar(o,{label,lit})` | 玻璃罐配钢盖（盖上有滚花），罐里一颗大种子带青蓝光晕，罐身贴着"种子"标签 | `ID-seed` / `ID-seed-atk`（红）→ `KIT.swap`。`ID-halo` 是光晕 | `seed` |
| `deriveTree(o,{n,levels,scale})` | 派生树：树干分出 n 根枝，枝头是浅青蓝叶簇，每根枝末端用细绳挂一把黄铜钥匙。`levels:2` 时每根枝再分两叉 | 每个部件都有正常层和红层（`ID-trunk[-r]`、`ID-br-i[-r]`、`ID-key-i[-r]`）→ `KIT.leak(tl,ID,t,stagger)`：从树干到枝再到钥匙依次变红。传第 5 个参数 `true` 则反向恢复 | `root`（接种子罐）、`keys[]`（各钥匙中心，可以连到地址门牌） |
| `addrPlate(o,{text,flag})` | 立柱上的拱顶信箱，正面门板钉着青蓝门牌（"地址 1"），侧面有小旗 | `ID-flag` → `KIT.rot(tl,"ID-flag",t,-90)` 竖起小旗，传 0 放平 | `plate` |
| `vitrine(o,{w,d,h,plate,inner})` | 玻璃展柜，表示"公开可见"：白色底座和"公开"铭牌，青蓝描边的玻璃罩，带反光 | `ID-inner`（柜内内容）、`ID-glass`。地面物件用 `liftSvg(svg, VITRINE_FLOOR)` 抬到柜内地面，再作为 `inner` 传进去 | `floor` |

### 攻击者工作台

| 函数 / 主要 opts | 样子 | 可动部件 → 助手 | 额外 anchors |
| --- | --- | --- | --- |
| `gpuRig(o,{gpus,cable,leds})` | 黑色机箱：+v 侧板是玻璃，能看到主板、内存、电源仓和两张竖装的三风扇显卡。正面有网孔、电源键和指示灯。`cable:"cut"` 时画一根剪断的网线（断口露铜丝，有红色电火花），表示"离线"；`"on"` 时网线接着 | `ID-fan-0..5` → `KIT.fans(tl,ID,t,dur,rps)`，有加速和减速过程。`ID-led-0` 用 `KIT.led` 控制。网线两段是 `ID-cable-a/-b`，断口是 `ID-cut` | `glass`、`cableEnd`、`cut` |
| `rollCounter(o,{digits,value,z})` | 老式里程表：黑色机身，白色数字轮，有上下阴影。`z` 用来叠在别的物件上 | `ID-dg-i`（i=0 是个位）→ `KIT.count(tl,ID,t,dur,from,to,ease)`：进位按真实里程表的方式滚动。10 位可以到 4294967295 | `window` |

### 签名与 nonce

| 函数 / 主要 opts | 样子 | 可动部件 → 助手 | 额外 anchors |
| --- | --- | --- | --- |
| `diceCup(o,{dice,up,black})` | 皮质骰子杯（有缝线和杯底压纹）倒扣在深青色毡垫上，杯下是两颗白骰子。"重用"就让两次摇出相同点数，`black:true` 时骰子顶面涂黑（偏置） | `ID-cup` → `KIT.cup(tl,ID,t,up,dur)` 掀开或扣上；`KIT.cupShake(tl,ID,t,dur)` 摇杯。`ID-d0/-d1` → `KIT.roll(tl,"ID-d0",t,点数)` | `dice`、`cupUp` |
| `die(o,{top,size,black,z})` | 单颗等距骰子，三个可见面的点数相互一致，1 点是红色 | `ID-d`（内含 `ID-d-v1..v6`）→ `KIT.roll(tl,"ID-d",t,v)` | — |
| `curveBoard(o,{points})` | 画架白板：浅色网格和坐标轴，一条椭圆曲线（蛋形加一支），两个点、割线、第三交点和它的对称点。只有图形，不写公式 | `ID-curve` → `KIT.drawPath(tl,"ID-curve",t,dur)` 把曲线画出来。`ID-chord`、`ID-pt-0..3` 可以单独淡入淡出 | `board` |
| `sigPaper(o,{tag,dup,title})` | 立在小座上的签名纸，有 r、s 两栏和墨色签名笔迹，右上角夹一张青蓝小签条"r" | `ID-tag` / `ID-tag-red` → `KIT.swap`。`dup:true` 时一开始就是红签条 | `tag`：两张纸之间的红虚线就连这两个点 |
| `cloth(o,{covered,keyState})` | 深色遮布盖在一把钥匙（kit `key`）上，布面印着骰子点数纹样，有褶皱 | `ID-cloth` → `KIT.unveil(tl,ID,t,dur[,cover])` 上提并淡出；`cover:true` 时盖回去。下面的钥匙是 `ID-key` | `key` |
| `kMachine(o,{missing,out})` | 确定性 k 机器（RFC 6979）：绿色机身，顶上两个进料斗，"私钥"管从左边接入，"消息"管从后方接入。正面有 `k =` 读数窗和齿轮舷窗，出口和托盘里会吐出青蓝色 k 币。`missing:"key"` 时私钥管画成红虚线空位，机身变红（偏离标准） | `ID-gear`、`ID-k` → `KIT.emit(tl,ID,t,dur)`：齿轮转，k 币滑进托盘。管子分别是 `ID-pipe-key[-miss]`、`ID-pipe-msg[-miss]`，可以用 swap 切换 | `inKey`、`inMsg`、`out` |

### 门限签名与量子

| 函数 / 主要 opts | 样子 | 可动部件 → 助手 | 额外 anchors |
| --- | --- | --- | --- |
| `puzzleSet(o,{assembled,gap,pieces,pieceStates,size})` | 三块厚拼图平放，块与块之间是凸榫对凹槽。面上印着一把钥匙的三段，拼起来钥匙才完整 | `ID-pc-0..2` → `KIT.assemble(tl,ID,t,together,dur)` 拼合，`together:false` 时分开。每块有 `-n` 和 `-r`（红）两层，用 swap 换色（攻击者那块） | `pieces[]`（分开时各块顶面中心）、`piecesTogether[]` |
| `proofCard(o,{missing,text})` | 证明卡：立着的白卡，有绿边、绿勾和"证明"字样。`missing:true` 时换成红虚线空位加红问号 | `ID-card` / `ID-slot` → `KIT.swap` | — |
| `quantum(o,{beam,cold,plate})` | 量子计算机：门形钢架下倒挂金色多层"吊灯"（稀释制冷机），五层金盘，有金色拉杆、铜色同轴线，底部混合腔带冷光 | `ID-beam`（红色光锥，对准 +v 方向地面，用 opacity 控制）、`ID-cold`、`ID-chand` | `tip`（光锥起点）、`beamEnd` |

## 运行时助手速查（runtime-ext.js）

| 调用 | 作用 |
| --- | --- |
| `KIT.drum(tl,ID,t,dur,turns)` / `KIT.ballOut(tl,ID,t,dur)` | 摇奖机滚筒转动 / 出球 |
| `KIT.tick(tl,ID,t,steps,dur)` | PRNG 指针按档跳 |
| `KIT.dialTurn(tl,ID,t,deg,dur)` | 密码转盘各圈转动 |
| `KIT.shaftSpin(tl,ID,t,dur,dist)` | 传动轴转动 |
| `KIT.cup(tl,ID,t,up,dur)` / `KIT.cupShake(tl,ID,t,dur,hz)` / `KIT.roll(tl,dieId,t,v)` | 骰子杯掀开、摇杯、骰子换点数 |
| `KIT.fans(tl,ID,t,dur,rps)` | GPU 风扇转动 |
| `KIT.count(tl,ID,t,dur,from,to,ease)` | 里程表计数 |
| `KIT.leak(tl,ID,t,stagger,back)` | 派生树依次变红 |
| `KIT.assemble(tl,ID,t,together,dur)` | 拼图拼合或分开 |
| `KIT.emit(tl,ID,t,dur)` | k 机器吐出 k 币 |
| `KIT.belt(tl,ID,t,dur,dist)` | 传送带前进 |
| `KIT.unveil(tl,ID,t,dur,cover)` | 揭开或盖回遮布 |
| `KIT.drawPath(tl,pathId,t,dur)` | 任意 `<path>` 按描边画出（调用后这条路径在 t 之前隐藏） |

## 已知事项

- `hyperframes check` 报的 `dead_stretch`，原因和 kit 一样：动作发生在 `#cam` 里的 SVG 属性上，取样器看不到，用 snapshot 可以确认确实在动。
- 物件上的小字（铭牌、门牌、读数窗、助记词板标题、签名纸）在相机倍率 0.8 以下只是质感，读不出来。要观众读的字一律用 `wlab`。
- 摇奖机小球的翻滚是示意运动（按角度摆动），不是物理模拟。骰子杯掀开是平移加倾斜，看不到杯口内壁。
- 拼图块只有平放版本；"人手里拿着一块"要在场景里把单块（`pieces:[i]`）放到人物前面。
- `BRIEF` 里的"方程卡"不是物件，用 kit.css 的 `.k-code` 代码卡做。
- 皮质骰子杯用棕色皮革，种子用棕色，树干用深棕色。这三处属于物件本色，不承载语义。
