# ep11 补充拟物物件（kit-ext）

本集 BRIEF 第 2 节"需要新补的拟物物件"表里的 2 个物件：快照相机 `snapshotCamera`、铸币机 `mintPress`。它们和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `broken` / `attacker` 之一，`opts.glow` 控制地光（默认关），`opts.scale` 以地面原点等比缩放（anchors 已换算）。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，`KIT.grow` 可以直接用；骨架里多一层 `ID-mv`（整件包一层）。坐标约定、颜色语义见 `../../kit/README.md`。

**注意**：
- 两个物件的 broken 都只标"缺的那一处"（相机：镜头位置；铸币机：限额柱位置），红虚线框 + 红叉，整件不变虚，所以 `ID-wire` 是空的。不要对它们用 `KIT.broke`，改用 `KITX11.lensBad` / `KITX11.limitBad`。
- **id 不要取 `cam`**：舞台的镜头容器就是 `#cam`，同名会让 `KIT.cam` 移动物件。相机建议用 `snap`。

样张：`showcase.png`，来自 `demo/`（10 秒，两屏）。每行是一屏，左列是动作前，右列是动作后。第一屏放了 E09 `commitBox`（0.8）和 kit `person` 做比例对照，第二屏另有 kit `person`。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | `snapshotCamera`、`mintPress`，另有 `CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX11`**。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时样张工程：`node src/build.mjs`，然后 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { snapshotCamera, mintPress, runtimeExtJs as rt11 } from "../../kit-ext/objects-ext.mjs";
// segbase 写法：import * as X from "../../kit-ext/objects-ext.mjs"; segInit(…, { ext: [X, …] }) 后在 SHOTS 里用 X11.xxx
// 手写 <script>：先 kit 的 runtime，再其他集的 ext，最后本集的
//   ${runtimeJs()}
//   ${rt01()}
//   ${rt11()}
//   KITX11.snap(tl, "snap", 2.0);
```

- **调用名一律用 `KITX11.xxx`**（segbase 里是 `X11.xxx`）。它也会合并进 `window.KITX`，但合并时**已存在的名字一律不覆盖**（`flash`、`key`、`lamp`、`count` 之类很可能已被别集占用）。
- 所有助手签名都是 `(tl, id, t, …)`；同一部件多次调用按时间顺序写，每次从上一次的终值开始。
- 运行时直接写 `transform` 的部件只交给助手去动，不要再对它们用 GSAP 的 x/y/rotation/scale：`ID-photo-s`、`ID-photo-f`、`ID-flash`、`ID-wheel`、`ID-peg`、`ID-ram`、`ID-limit`、`ID-key-0..2`。

## 物件清单

### `snapshotCamera(o, opts)`：快照相机

约 90×70×170（含三脚架）。老式木质箱式相机立在三脚架上：深色木箱（黄铜包角、顶上皮提手）+ 前伸的四节折叠皮腔 + 浅木镜头板 + 黄铜镜头筒（深色镜片），木箱后上角一根杆托着闪光反光碗和灯泡；木箱正面下沿一道黄铜出片口，相片像拍立得那样挂在出片口下：白边 + 青蓝框，表头文字 + 小字"区块 N−1" + 三行横线（不写数字）。**镜头朝 +v（右前方）**：要"对着"投票箱，就把投票箱放在相机的 +v 方向。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `photo` | `"提案前的区块"` | 相片表头字 |
| `sub` | `"区块 N−1"` | 表头下小字；`""` 不画 |
| `shot` | `false` | `false` = 相片还没吐出；`true` = 已挂在出片口下、正面朝外（broken 时无效） |

- 状态：normal 木色 + 黄铜，相片青蓝框；attacker 相片红框红字；broken 镜头位置红虚线框 + 红叉（没有快照），相片不出。
- 可动：
  - `KITX11.snap(tl, ID, t, {photo, dur})`：一次拍照（灯泡亮 → 闪光 + 快门 → 相片吐出并翻面 → 灯泡灭），返回结束时间（约 t + 1.5）。`photo: false` 只闪不出片。
  - `KITX11.flash(tl, ID, t, dur=0.55)`：闪光白色光圈爆开再淡出。`ID-flash`。
  - `KITX11.shutter(tl, ID, t, dur=0.26)`：快门叶片合上再打开。`ID-shutter`。
  - `KITX11.bulb(tl, ID, t, on)`：灯泡亮 / 灭。`ID-bulb`。
  - `KITX11.photo(tl, ID, t, out=true, dur=1)`：相片从出片口滑出（背面），再翻到正面；`out=false` 收回。返回结束时间。`ID-photo`（`-s` 平移、`-f` 翻转、`-back` / `-front`）。
  - `KITX11.photoText(tl, ID, t, text, tone)`：相片表头换字，`tone` 为 `"red"` 时红字。`ID-photo-t`。
  - `KITX11.lensBad(tl, ID, t, on)`：镜头红虚线框 + 红叉。`ID-lens-bad`。
- anchors：`top`（闪光灯上方）、`center`、`ground`、`front` / `lens`（镜头正面中心）、`bulb`、`flash`、`slot`（出片口）、`photo`（相片吐出后的中心）、`body`（木箱中心）、`tripod`。

### `mintPress(o, opts)`：铸币机

约 180×140×220（底座 180×140；横梁顶 z 198，飞轮 206，限额柱顶约 248）。工业螺旋冲压机：铸铁门形机架（底座 + 两根立柱 + 横梁），横梁上一只水平大飞轮（4 根辐条 + 竖立黄铜摇柄）；螺杆带着冲头上下，下面是模座（上面一枚金色坯饼）；模座前一条出币斜槽落进前面的托盘（6 摞硬币，高度可变）；−u 侧立柱外挂一块钥匙面板（1 或 3 个钥匙孔，每孔上方一盏小灯）；横梁正面读数窗（已铸数量）；横梁右端（+u）一根白色"限额"刻度柱 + 红色挡块（落下卡在飞轮边上）；横梁左端（−u）一盏熔断灯；底座正面青蓝铭牌"发行方"。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `keys` | `1` | 钥匙孔数：1 或 3 |
| `keyIn` | `0`（attacker `1`） | 已插入的钥匙数，从 0 号孔起 |
| `atkKey` | `-1`（attacker `0`） | 红钥匙的孔号；`true` = 0 号 |
| `count` | `"1000"`（attacker `"8000万"`） | 读数窗文字（字号按长度自动缩） |
| `limit` | `true` | `true` = 限额柱 + 挡块；`false` = 那一格红虚线框（带红叉） |
| `stop` | `false` | 挡块已落下 |
| `lamp` | `"green"` | 熔断灯 `"green"` / `"red"` / `"off"` |
| `pile` | `0.35`（attacker `1`） | 托盘硬币高度 0–1 |
| `plate` | `"发行方"` | 铭牌字 |

- 状态：normal 铸铁灰 + 青蓝铭牌，绿灯；attacker 0 号孔插着红钥匙（孔上小灯红）、读数窗红底红字、硬币满托盘并溢出到底座、斜槽前地上喷出红色硬币点阵；broken 限额柱位置红虚线框 + 红叉（没有限额），柱和挡块不画。
- 可动：
  - `KITX11.mint(tl, ID, t, dur=1.6, strokes=2, level)`：一次铸币（飞轮转 strokes 圈 + 冲头连冲 strokes 次 + 硬币长到 level，level 可省），返回结束时间。
  - `KITX11.wheel(tl, ID, t, dur=1.2, turns=1)`：飞轮（连摇柄）转 turns 圈。`ID-wheel` / `ID-peg`。
  - `KITX11.ram(tl, ID, t, n=1, dur=0.5)`：冲头冲 n 次，返回结束时间。`ID-ram`。
  - `KITX11.coins(tl, ID, t, level, dur=0.8)`：托盘硬币长到 / 降到 level（0–1）。`ID-coins`（每枚 `ID-coin-N`）。
  - `KITX11.count(tl, ID, t, text, tone)`：读数窗换字；`tone` 为 `"red"` 时红底红字，否则绿字。`ID-count-t` / `ID-count-red`。
  - `KITX11.key(tl, ID, t, i, on=true, red=false, dur=0.4)`：i 号钥匙插入（沿 −u 推进）/ 拔出；`red` 用红钥匙；插好后孔上小灯亮（绿 / 红）。返回结束时间。`ID-key-i`（层 `-b` / `-r`），小灯 `ID-kl-i-g` / `-r`。
  - `KITX11.limit(tl, ID, t, down=true, dur=0.45)`：挡块落下卡住飞轮（带回弹）/ 抬回。返回结束时间。`ID-limit`。
  - `KITX11.limitShow(tl, ID, t, on)`：限额柱 + 挡块出现 / 消失（broken 或 `limit:false` 修好时配 `limitBad(…, false)`）。`ID-limit-bar` / `ID-limit-o`。
  - `KITX11.limitBad(tl, ID, t, on)`：限额位置红虚线框 + 红叉。`ID-limit-bad`。
  - `KITX11.lamp(tl, ID, t, color)`：熔断灯 `"green"` / `"red"` / `"off"`。`ID-lamp-green` / `-red`。
  - `KITX11.spill(tl, ID, t, on)`：溢出的硬币 + 斜槽前的红色硬币点阵出现 / 消失。`ID-spill`。
- anchors：`top`、`center`、`ground`、`front`（横梁正面中心）、`plate`、`count`、`keyPanel`、`keys[]`（钥匙孔）、`wheel`、`ram`、`die`、`chute`（斜槽口）、`tray`、`coins`（硬币堆顶，按初始 pile）、`limit`（限额柱中部）、`stop`（挡块，按初始位置）、`lamp`。

## runtime-ext.js · window.KITX11

| 调用 | 物件 |
| --- | --- |
| `snap` / `flash` / `shutter` / `bulb` / `photo` / `photoText` / `lensBad` | 快照相机 |
| `mint` / `wheel` / `ram` / `coins` / `count` / `key` / `limit` / `limitShow` / `limitBad` / `lamp` / `spill` | 铸币机 |

离散切换（换字）在 seek 回去时会恢复成之前的状态。

## 已知不足

- `hyperframes check` 报 `dead_stretch`，原因同 kit：动作都在 `#cam` 里的 SVG 属性上，取样器看不到，snapshot 可确认在动。
- 相片、读数窗、铭牌、钥匙面板上的字在倍率 1 左右只是质感；要观众读的字用 `wlab` 贴 `anchors.photo` / `anchors.count` / `anchors.plate`。
- 相机镜头只朝 +v；要对着别的方向，靠摆位解决。
- 飞轮是水平的，转动在顶面里，倍率小时不太显眼；要强调转动，配 `ram` 或镜头推近。
- 挡块落下时可能和摇柄短暂重叠（摇柄转过 +u 侧），挡块落下后就不要再转飞轮了（剧情上也是"卡住"）。
- mintPress 的 SVG 约 110 KB（42 枚硬币各是一个小圆柱）；一段里放一两台没问题。
