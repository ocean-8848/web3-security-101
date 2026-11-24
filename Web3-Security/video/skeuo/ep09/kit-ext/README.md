# ep09 补充拟物物件（kit-ext）

本集 BRIEF 第 2 节"需要新补的拟物物件"表里的 3 个物件。它们和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `broken` / `attacker` 之一（`cheque` 另有 `filled`），`opts.glow` 控制地光，`opts.scale` 以地面原点等比缩放（anchors 已换算）。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，`KIT.grow` 可以直接用。坐标约定、颜色语义见 `../../kit/README.md`。

**注意**：`cheque` 和 `commitBox` 的 broken 只标"缺的那一格 / 空白名牌"（红虚线 + 红叉），整件不变虚，所以 `ID-wire` 是空的。不要对它们用 `KIT.broke`，改用 `KITX09.field(…, "bad")` / `KITX09.nameBad`。`rotaWheel` 的 broken 走 kit 默认（整件变虚 + 红框红叉），本集不用。

样张：`showcase.png`，来自 `demo/`（15 秒，三屏）。每行是一屏，左列是动作前，右列是动作后。各屏都放了 kit `person`，第三屏另有 ep08 `liqBot` 做比例对照。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | 3 个物件，另有 `CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX09`**。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时样张工程：`node src/build.mjs`，然后 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { cheque, rotaWheel, commitBox, runtimeExtJs as rt09 } from "../../kit-ext/objects-ext.mjs";
// segbase 写法：import * as X from "../../kit-ext/objects-ext.mjs"; segInit(…, { ext: [X, …] }) 后在 SHOTS 里用 X9.xxx
// 手写 <script>：先 kit 的 runtime，再其他集的 ext，最后本集的
//   ${runtimeJs()}
//   ${rt01()}  ${rt08()}
//   ${rt09()}
//   KITX09.fields(tl, "chq", 2.0, ["filled", "filled", "filled", "filled", "filled"]);
```

- **调用名一律用 `KITX09.xxx`**（segbase 里是 `X9.xxx`）。它也会合并进 `window.KITX`，但合并时**已存在的名字一律不覆盖**（`seat`、`lock` 等名字很可能已被别集占用）。
- 所有助手签名都是 `(tl, id, t, …)`；同一部件多次调用按时间顺序写，每次从上一次的终值开始。
- 运行时直接写 `transform` 的部件只交给助手去动，不要再对它们用 GSAP 的 x/y/rotation/scale：支票 `ID-copy-0..2`；轮值台 `ID-arm` / `ID-arm-b` / `ID-lamp`；投标箱 `ID-door` / `ID-lock-sh` / `ID-env-m` / `ID-copy-m`。
- 整件移动：`cheque` 和 `commitBox` 根元素只有 `data-ox/oy`，`KITX01.walk` 可用。

## 物件清单

### `cheque(o, opts)`：支票 / 签名消息

约 180×20×112（票面 180×100，立着）。小木夹座（底座 + 前后两片夹木 + 螺钉）上一张横版支票：米白纸、青蓝防伪波纹、青蓝双线边框，左上菱形徽记 + "支票 No. 0007"，右上金额框，左中"付给"横线，中部横排五个带小标签的字段格，右下签名线和墨色签名笔迹。身后可叠 3 张半透明复印件，错位排在右上方。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `amount` | `"100"` | 金额框文字；链上版写 `"领取"` |
| `fields` | 按 state | 五格初始状态数组，每项 `"blank"` / `"filled"` / `"bad"`（红虚线 + 红叉）/ `"warn"`（只有红虚线） |
| `labels` | 编号 nonce / 链 ID / 合约地址 / 截止时间 / 用途 | 五格小标签（质感，要读的用 `wlab` 贴 `fields[i]`） |
| `vals` | `#7` / `1` / `0xC1…` / `12:00` / `领取` | filled 时格里的值 |
| `missing` | `1` | broken 时缺哪一格 |
| `copies` | `0`（attacker `3`） | 一开始就可见的复印件张数 0–3 |
| `signed` | `true` | `false` 时签名笔迹先不画，用 `sign` 描出 |
| `title` | `"支票"` | 票头 |

- 状态：normal 五格空白灰虚线；filled 五格绿边写值；attacker 复印件红色描边（被重放）；broken 缺的那一格红虚线框 + 红叉。
- 可动：
  - `KITX09.field(tl, ID, t, i, state)`：第 i 格切到 `blank` / `filled` / `bad` / `warn`。`ID-fi`（层 `-blank` / `-fill` / `-bad` / `-bad-x`）。
  - `KITX09.fields(tl, ID, t, [s0..s4], gap=0.3)`：按顺序逐格切换（`null` 跳过），返回结束时间。
  - `KITX09.sign(tl, ID, t, dur=0.9, on=true)`：签名 `ID-sig` 描出（`false` 擦掉）。
  - `KITX09.amt(tl, ID, t, text)`：金额框 `ID-amt` 换字。
  - `KITX09.copies(tl, ID, t, n, dur=0.6, red)`：前 n 张复印件淡入并从票后错位滑出（n=0 全收回）。
  - `KITX09.copyTo(tl, ID, t, k, [x, y], dur=0.7)`：第 k 张复印件的中心滑到世界画布点（`null` 回到错位位置），返回结束时间。复印件始终画在支票这一层，滑到别的物件前面时会被后画的物件盖住。
  - `KITX09.copyRed(tl, ID, t, on)`：复印件变红 / 变回灰。
- anchors：`top`、`center`、`ground`、`fields[]`（五格中心）、`amt`、`sig`、`emblem`、`copies[]`（三张复印件错位后的中心）。

### `rotaWheel(o, opts)`：出块轮值台

约 220×220×120。深色木底座 + 竖拼木鼓身 + 浅色木台面（嵌两道圈线），台面边缘一圈钢凳，每凳一个墨色圆头小人偶；中心镀铬立柱顶上一根青蓝指针臂（带厚度层），被指的那座脚下亮青蓝光圈、头顶吊一盏暖色小灯；鼓身正面一块白底青蓝框铭牌。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `n` | `12` | 座位数（TRON 27，BNB Chain 用 5–6 示意） |
| `at` | `0` | 当前出块者座号；0 在正前方，按屏幕顺时针编号 |
| `speed` | `1` | `spin` 默认转速（圈/秒） |
| `plate` | `"n 座"` | 铭牌文字 |
| `red` | `[]` | 一开始就变红的座号 |
| `lamp` | `true` | 当前座的灯和光圈一开始就亮 |

- 状态：normal 墨色人偶、青蓝指针。attacker 不整体用，单个座位用 `seat(…, "red")` 变红。
- 可动：
  - `KITX09.point(tl, ID, t, k, dur, turns=0)`：指针顺时针转到第 k 座（`dur` 省略时按 speed 算），灯和光圈跟过去，返回结束时间。
  - `KITX09.spin(tl, ID, t, dur, turns=3, k)`：快速转 turns 圈后停在 k（默认原座），返回结束时间。
  - `KITX09.tick(tl, ID, t, steps, gap=0.45)`：一格一格往前走 steps 座，返回结束时间。
  - `KITX09.seat(tl, ID, t, k, state)`：`"red"` / `"normal"` / `"dim"`（淡到 0.2）/ `"hot"`（光圈亮）/ `"cool"`（光圈灭）。`ID-seat-k`（层 `-ink` / `-red` / `-hl`）。
  - `KITX09.seats(tl, ID, t, state, except=[], dur=0.5)`：除 except 外全部座位按圈依次切换（如 L22 淡去人偶群）。
  - `KITX09.lamp(tl, ID, t, on)`、`KITX09.plate(tl, ID, t, text)`（`ID-plate-t`）。
- anchors：`top`、`center`、`ground`、`hub`（柱顶）、`plate`、`lamp`（初始当前座的灯）、`seats[]`（每座人偶头顶）、`arm`（初始指针尖）。

### `commitBox(o, opts)`：提交揭示投标箱

约 140×110×150。四只墨色短脚上的深色木箱，−u 面框板加木纹，顶上加厚箱盖，盖中间一道镀铬边框的窄投信口。正面是一整块下沿铰链的前门：上部镀铬框磨砂玻璃窗（只透出信封模糊轮廓和火漆圆点），下部黄铜名牌框插一张青蓝名牌"发送者"，顶边一个锁舌。−u 面靠前一个搭扣 + 黄铜挂锁。门翻下后露出箱内（后壁、侧壁、底板）和信。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `name` | `"发送者"`（attacker / broken 为空白） | 名牌文字，`""` = 空白卡 |
| `env` | `false` | 箱里一开始就有信封（窗里有轮廓） |
| `answer` | `"答案"` | 展开的信上的字 |
| `seal` | `"哈希"` | 信封火漆字（青蓝火漆，不用红色） |
| `open` | `0` | 前门初始角度，0 关、90 平放 |
| `unlocked` | `false` | 挂锁一开始就开着 |

- 状态：normal 青蓝名牌 + 绿色地光；attacker 名牌空白 + 窗里透出红信封轮廓（红信被收下），无地光；broken 名牌处红虚线框 + 红叉。
- 可动：
  - `KITX09.drop(tl, ID, t, dur=0.7)`：带火漆的信封从口上落进去（口外部分按投信口裁切），然后窗里出现轮廓，返回结束时间。`ID-env` / `ID-env-m` / `ID-env-in` / `ID-env-c`。
  - `KITX09.slot(tl, ID, t, n=2)` 投信口青蓝环闪 n 下；`KITX09.slotOn(tl, ID, t, on)` 常亮 / 熄灭。
  - `KITX09.lock(tl, ID, t, open, dur)`：锁梁 `ID-lock-sh` 弹开 / 扣上。
  - `KITX09.flap(tl, ID, t, deg, dur=0.7)`：前门 `ID-door` 绕下沿翻到 deg（打开时带回弹）。
  - `KITX09.reveal(tl, ID, t, text)`：第二阶段一条龙：开锁 → 门翻下 → 信封换成展开的信 `ID-ans`（可同时改字），返回结束时间。
  - `KITX09.nameTag(tl, ID, t, text)`：名牌换字，`""` 换成空白卡。`ID-name`（层 `-on` / `-off`，字 `ID-name-t`）。
  - `KITX09.nameBad(tl, ID, t, on)`：名牌红虚线框 + 红叉 `ID-name-bad`。
  - `KITX09.copyIn(tl, ID, t, accept, dur=0.8)`：机器人复制的红信封 `ID-copy` 投入；`true` 被收下（窗里出现红轮廓 `ID-copy-in`），`false` 下到一半被弹回、往左上飞走并淡出，投信口闪两下。返回结束时间。
- anchors：`top`、`center`、`ground`、`slot`、`drop`（信封起落点上方）、`window`、`name`、`lock`、`door`（门中心，门关时）、`answer`（箱内信中心）。

## runtime-ext.js · window.KITX09

| 调用 | 物件 |
| --- | --- |
| `field` / `fields` / `sign` / `amt` / `copies` / `copyTo` / `copyRed` | 支票 |
| `point` / `spin` / `tick` / `seat` / `seats` / `lamp` / `plate` | 出块轮值台 |
| `slot` / `slotOn` / `drop` / `lock` / `flap` / `reveal` / `nameTag` / `nameBad` / `copyIn` | 提交揭示投标箱 |

离散切换（换字、灯跳座）在 seek 回去时会恢复成之前的状态。

## 已知不足

- `hyperframes check` 报 `dead_stretch`，原因同 kit：动作都在 `#cam` 里的 SVG 属性上，取样器看不到，snapshot 可确认在动。
- 支票字段标签、金额、名牌、铭牌上的字在倍率 1 左右只是质感；要观众读的字用 `wlab`（支票建议 `scale` ≥ 1.8）。
- 轮值台指针指向正前方的座位时，指针臂正对镜头，看起来很短；要强调某座时最好选侧面的座号。
- 轮值台人偶是屏幕空间的简化立体（为了 27 座时文件不过大，单件约 80 KB），不随相机做真 3D 旋转（本来也不转）。
- 投标箱前门翻到 90° 时平躺在箱前，会占住箱前约 130 世界单位的地面，箱前别放别的物件。
- 复印件、投入的信封都画在各自物件这一层；滑到别的物件前面时，后画（更靠前）的物件会盖住它们。
