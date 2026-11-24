# ep07 补充拟物物件（kit-ext）

本集 BRIEF 第 2 节"需要新补的拟物物件"表里的 8 个物件。它们和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `broken` / `attacker` 之一，`opts.glow` 控制地光，`opts.scale` 以地面原点等比缩放（anchors 已换算）。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，所以 `KIT.grow`、`KIT.broke`、`KIT.fixed` 可以直接用。坐标约定、颜色语义见 `../../kit/README.md`。

样张：`showcase.png`，来自 `demo/`（15 秒，三屏）。每行是一屏，左列是动作前，右列是动作中或动作后。各屏都放了 kit `person`，第一屏另有 kit `safe` 和 ep01 `vending` 做比例对照。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | 8 个物件，另有 `COIN_KINDS`、`weighScale`（`scale` 的别名）、`CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX07`**。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时样张工程：`node src/build.mjs`，然后 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { G, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import { vending, pipe, runtimeExtJs as rt01 } from "../../../ep01/kit-ext/objects-ext.mjs";
import { emptyLot, returnTag, dispatchDesk, runtimeExtJs as rt07 } from "../../kit-ext/objects-ext.mjs";
// <script> 里：先 kit 的 runtime，再其他集的 ext，最后本集的
//   ${runtimeJs()}
//   ${rt01()}
//   ${rt07()}
//   KITX07.tagPop(tl, "tg", 2.0);  KITX07.tagStamp(tl, "tg", 2.6, "ok");
```

- **调用名一律用 `KITX07.xxx`**。它也会合并进 `window.KITX`，但合并时**已存在的名字一律不覆盖**（别集先注册的通用助手如 `tw`、`fade`、`carry`、`walk` 保持原样）。
- 运行时直接写 `transform` 的部件只交给助手去动，不要再对它们用 GSAP 的 x/y/rotation：怪代币 `ID-coin`、收费夹 `ID-blade` / `ID-chip`、木槌 `ID-gavel`、翻牌 `ID-board`、退款金币 `ID-refund`。
- 包裹整件移动用 `KITX01.walk(tl, ID, t, dur, [点…])`（根元素带 `data-px/py`）或 `KITX06.carry`。

## 物件清单

### `emptyLot(o, opts)`：荒地 = 无代码地址 / 零地址

约 260×200 的夯土地块：暖褐色土面，补丁、裂纹、碎石、几簇枯草；四角木桩 + 松垂麻绳围栏；左前沿一根门牌桩，门牌白底青蓝框、**空白**。地块中央没有建筑，只有一圈青蓝虚线地基轮廓（"这里本该有代码"）。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `w` / `d` | `260` / `200` | 地块尺寸 |
| `zero` | `false` | 门牌写 `0x000…0`（只是质感，要读的字用 `wlab`"零地址"） |
| `plateText` | — | 自定义门牌字 |
| `ghost` | `0.85` | 地基虚线初始透明度 |
| `state` | `normal` | `attacker` 时土面和门牌框偏红 |

- 可动：`ID-plate`（门牌）+ `ID-plate-hi`：`KITX07.lotPlate(tl, ID, t, on=true, n=3)` 闪 n 下后停在亮/灭。`ID-ghost`：`KITX07.lotGhost(tl, ID, t, to, dur)`。
- anchors：`top`、`center`、`ground`、`plate`（门牌中心）、`plateTop`、`drop`（地块中心地面，包裹落点）。

### `parcel(o, opts)`：快递包裹

瓦楞纸箱 60×48×44：十字胶带（顶面两道，顺着 +v 面和 −u 面各垂下一截）、−u 侧"向上"箭头和小框，+v 面白色面单（两行字 + 条码）。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `stack` | `1` | 叠几个（错落叠放） |
| `z` | `0` | 离地高度 |
| `state` | `normal` | `"lost"`：一开始就是红虚线空壳 + 红面单（"没有送达的包裹"）；`attacker`：红纸箱 |

- 可动：`ID-real` / `ID-lost`：`KITX07.lose(tl, ID, t, dur)` 实箱溶成红虚线空壳，`KITX07.found` 反过来。`ID-label-r`：`KITX07.parcelLabel(tl, ID, t, "red"|"normal")`。第 k 个箱子 `ID-b-k`。
- anchors：`top`、`center`、`ground`、`foot`、`label`。
- 一长串 100 个包裹请在场景里循环摆放（每个不同 id），整串变灰用 `KIT.broke` 或 `op`。

### `returnTag(o, opts)`：回执签

立在黑色小夹座上的硬卡纸小签（70×40，有厚度），上沿镀铬穿绳孔 + 一截棉绳。三种卡面：`ok`（绿边、墨字 `true`）、`false`（红边、墨字 `false`）、`empty`（灰虚线边、空白，只有一个 ∅ 压印）。右下角可叠印章：绿勾（"被当成成功"）或红叉。1 倍较小，近景用 `scale: 1.4–1.8`。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `face` | `"ok"` | `ok` / `false` / `empty` |
| `stamp` | `null` | `"ok"` / `"x"` |
| `z` | `0` | 离地高度（放在管口上时用） |
| `stand` | `true` | `false` 时不要夹座 |

- 可动：`ID-face-ok/-false/-empty`：`KITX07.tagFace(tl, ID, t, face)`（也可 `KIT.swap`）。`ID-stamp-ok/-x`：`KITX07.tagStamp(tl, ID, t, "ok"|"x"|null)` 盖章（放大落下）。`ID-pop`：`KITX07.tagPop(tl, ID, t, dur, rise=36)` 从下方弹出；`KITX07.tagHide`。
- anchors：`top`、`center`、`face`（卡面中心）、`ground`、`hole`。
- seg5b"对话气泡形状"不在物件里，场景用 HTML 气泡标签叠在 `face` 上。

### `dispatchDesk(o, opts)`：发货登记台

窄长木柜台约 200×100×112：竖拼木板正面 + 凸框、黑色铭牌 `DISPATCH`、右侧镀铬"回执投入口"（下有小牌"回执 ▼"）；−u 侧挂一盏小灯；台面放一本 kit `ledgerBook`（scale 0.55），右页换成一张新页，记录逐行写在这页上。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `entries` | `["+ 收款","+ 发货","+ 转账","+ 退款"]` | 最多 6 行；每项字符串或 `{text, kind:"ok"\|"ghost"}`，ghost 为红色虚下划线（"没发生的那一笔"） |
| `shown` | `0` | 一开始已写好的行数 |
| `led` | `"off"` | 灯色 |
| `book` | `true` | `false` 时不放账簿 |

- 可动：`ID-entry-i`：`KITX07.entry(tl, ID, t, i, dur)` 从左往右写出；`KITX07.eraseEntry`。`ID-led`：`KIT.led(tl, "ID-led", t, "red")`。`ID-slot-hi`：`KITX07.slotFlash(tl, ID, t, n)`。
- anchors：`top`、`center`、`ground`、`slot`（投入口）、`book`、`entries[]`（每行起点，挂红标签用）、`led`。
- 账簿上的字只是质感（远景读不出）；"+ 转账"之类要读的字用 `wlab` 挂在 `entries[i]`。

### `oddCoin(o, opts)`：怪代币

直径 80、厚 8 的大硬币，齿纹币边、内圈珠点、高光，竖立在黑色小底座的镀铬卡托上；底座正面一块编号小牌。币面浮雕图标按 `kind`：

| kind | 图标 |
| --- | --- |
| `plain` | 标准币，只有六边形浮雕 |
| `mute` | 一张脸，嘴上交叉贴两条胶带（不返回值） |
| `liar` | 大绿勾，币沿插一面红色 `false` 小旗（成功却报失败） |
| `tax` | 币边缺一小口 + 一把小剪刀，缺口外一粒金屑 `ID-chip`（收税） |
| `rebase` | 币面 ↕，币旁青蓝上下箭头（余额自动变化，配 `breathe`） |
| `frozen` | 币面结霜、雪花、底沿冰溜子（可再叠 ep05 `iceShell`） |
| `pause` | 圆环里一个 ‖ |
| `hook` | 币面钩子；币背伸出一根弹簧 + 小钩（转账钩子） |
| `upgrade` | 扳手 + 螺丝（可升级） |

| opts | 默认 | 说明 |
| --- | --- | --- |
| `kind` | `"plain"` | 见上表，八种怪币也在 `COIN_KINDS` 里 |
| `num` | — | 底座编号牌 1–8；省略不画牌 |
| `numLit` | `false` | 编号牌一开始就亮（青蓝底白字） |
| `icon` | `true` | `false` 时图标先隐藏（seg3 L2"先不显示图标"） |
| `state` | `normal` | `attacker`：红币（seg5b"陌生红色币"） |

- 可动：`ID-coin`：`KITX07.coinFlip(tl, ID, t, turns=1, dur)` 绕竖轴翻转，`KITX07.coinScale(tl, ID, t, s, dur)` 缩放，`KITX07.breathe(tl, ID, t, dur, period=1.2, amp=0.12)` 呼吸后回到原尺寸。`ID-icon`：`KITX07.iconOn(tl, ID, t)` 弹出。`ID-icon-hi`：`KITX07.iconHi(tl, ID, t, on)` 青蓝高亮环。`ID-num-lit`：`KITX07.numOn(tl, ID, t, on)`。`tax` 的 `ID-chip`：`KITX07.chipDrop(tl, ID, t)` 掉落。
- anchors：`top`（`liar`/`hook` 已让出小旗/钩子的高度）、`center`、`face`（币面中心）、`ground`、`base`、`num`。
- 近景建议 `scale: 1.25–1.6`；八枚一排时标签上下交错放（样张做法：奇数个挂在地面点下方）。

### `scale(o, opts)`：到账台秤（别名 `weighScale`）

商店电子台秤：低平墨色秤台（前沿按键条）+ 不锈钢秤盘 + 后立柱 + 显示头。显示头正面是青蓝底 LCD，两行"前 / 后"读数，下面一条差值条（绿 = 相等、红 = 不等）。约 150×110×196。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `before` / `after` | `null` | 初始读数（数字自动加千分位；`null` 为空） |
| `unit` | `""` | 读数后缀 |
| `diff` / `diffOk` | — / 省略 | 差值条文字；`true` 绿、`false` 红、省略则不显示 |
| `pile` | `0` | 秤盘上金币枚数（最多 15，三层） |

- 可动：`KITX07.read(tl, ID, t, "before"|"after", 值|null, dur)` 数字滚动到新值。`KITX07.diff(tl, ID, t, ok, text)` 切换差值条（`ok=null` 隐藏）。`KITX07.pileTo(tl, ID, t, n, dur)` 金币逐枚出现/消失。`KITX07.weigh(tl, ID, t)` 秤盘下沉回弹。`ID-led` 可用 `KIT.led`。
- anchors：`top`、`center`、`ground`、`pan`（秤盘面）、`lcd`、`diff`（红虚线连线的落点）。
- LCD 字在倍率 ≥0.9 时勉强可读；要观众读的数字仍用 `wlab`。

### `tollClip(o, opts)`：过路收费夹

夹在 ep01 `pipe` 上的铸铁卡箍（约 54×54×32，侧耳带螺栓、铸筋、"TOLL" 字），顶上一侧是铡刀架（两根导柱 + 横梁 + 斜口刀片），另一侧一个钢制收费杯，杯里是金屑堆。

- 用法：`o` = 管道轴线在地面的投影点（与 pipe 同一原点最省事），`z` = 管道中心高度（pipe `pts` 里的 z），`r` = 管半径（默认 9），`axis` = `"u"`（默认）或 `"v"`（管道走向）。物件要画在 pipe 之后。
- `rate`（默认 0.02）只影响杯里初始金屑块数；`pile` 直接给 0–8。
- 可动：`KITX07.toll(tl, ID, t)` 一次收税：落刀 → 金屑弧线弹进杯里 → 杯堆 +1 → 抬刀，约 0.75 s，返回结束时间。单独控制：`KITX07.tollBlade(tl, ID, t, down)`、`KITX07.cup(tl, ID, t, n)`。管内金币流动用 pipe 自己的 `flowColor:"#f0c04a"` + `KITX01.dash`。
- anchors：`top`、`center`、`ground`、`cup`（杯口）、`clamp`（卡箍正面）、`cut`（刀口落点）。

### `auctionStand(o, opts)`：拍卖台

木质讲台约 140×100×150：正面凸框 + 拱形内板 + 圆形花饰，−u 侧护板，深色檐口；台面木砧 + 木槌；台后两根立柱挑着"最高出价"翻牌板（白底，青蓝头条，大字名字 + 数额，顶约 286）。讲台正面左下有镀铬出口，一条镀铬退款滑槽向 +v 滑到地面，指向出价者站位。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `name` / `amount` | `"A"` / `"10 ETH"` | 牌面 |
| `head` | `"最高出价"` | 牌头 |
| `red` | `false` | 牌框和牌头变红（被卡死） |
| `gavelUp` | `false` | 木槌一开始举着 |
| `refund` | `false` | 退款金币一开始就在滑槽口 |

- 可动：`ID-gavel`：`KITX07.gavel(tl, ID, t)` 举起敲下（返回结束时间），`{blocked:true}` 举起后两次想落都落不下、停在半空；`KITX07.gavelTo(tl, ID, t, up)`。`ID-board`：`KITX07.board(tl, ID, t, {name, amount, red}, dur)` 翻牌换内容。`ID-refund`：`KITX07.refund(tl, ID, t, "out"|"bounce", dur)`，bounce 时金币滑到 3/4 被推回、滑槽 `ID-chute-red` 红闪后停红；`KITX07.chuteOk` 清掉红色。
- anchors：`top`、`center`、`ground`、`board`（牌面中心）、`chuteTop`、`chute`（滑槽底端）、`bidder`（出价者站位地面点）、`gavel`。

## runtime-ext.js · window.KITX07

| 调用 | 物件 |
| --- | --- |
| `lotPlate` / `lotGhost` | 荒地 |
| `lose` / `found` / `parcelLabel` | 包裹 |
| `tagFace` / `tagStamp` / `tagPop` / `tagHide` | 回执签 |
| `entry` / `eraseEntry` / `slotFlash` | 登记台 |
| `coinFlip` / `coinScale` / `breathe` / `iconOn` / `iconHi` / `numOn` / `chipDrop` / `setCoin` | 怪代币 |
| `read` / `diff` / `pileTo` / `weigh` | 台秤 |
| `toll` / `tollBlade` / `cup` | 收费夹 |
| `gavel` / `gavelTo` / `board` / `refund` / `chuteOk` | 拍卖台 |

同一部件多段动画按时间顺序调用，每次从上一次的终值开始；离散切换（差值条、翻牌文字）在 seek 回去时会恢复成之前的状态。

## 已知不足

- `hyperframes check` 报 `dead_stretch`，原因同 kit：动作都在 `#cam` 里的 SVG 属性上，取样器看不到，snapshot 可确认在动。
- 硬币翻转是沿币面横向压扁的近似（厚度方向跟着压），转到背面看到的是镜像正面，不是真的币背。快速翻一圈看不出，慢放会露馅。
- 收费夹按 BRIEF 是 70×50×60 量级，管半径 9 时在远景里只是一个小黑块；近景（倍率 ≥1.2）才看得清刀片和杯。刀片在两根导柱之间，正面看部分被导柱挡住。
- 登记台账簿上的手写行只是质感，倍率 1 时读不出；读的字一律用 `wlab`。
- 包裹用 `walk` 移进荒地时画家顺序固定在建造位置，走到门牌后面时仍会画在门牌前面；落点避开门牌（样张落在地块右后部）。
- 拍卖台退款金币是一枚平放的圆片，沿滑槽直线滑动，不滚动。
