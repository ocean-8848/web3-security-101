# ep13 补充拟物物件（kit-ext）

本集 BRIEF 第 2 节"需要新补的拟物物件"表里的 2 个物件：账户护照 `passport`、集装箱 `container`。它们和 `../../kit/` 用同一个投影（方位 35°、仰角 30°），接口也一样：`fn(origin, opts) → { svg, anchors }`。

`opts.id` 是 id 前缀，`opts.state` 取 `normal` / `broken` / `attacker` 之一，`opts.glow` 控制地光（默认关），`opts.scale` 以地面原点等比缩放（anchors 已换算）。DOM 骨架同样是 `ID` → `ID-glow / ID-solid / ID-wire / ID-x`，`KIT.grow` 可以直接用；骨架里多一层 `ID-mv`（整件包一层）。坐标约定、颜色语义见 `../../kit/README.md`。

**注意**：
- 两个物件的 broken 都按 kit 惯例：整件变虚 + 红虚线框 + 红叉（= 被拒收），所以运行中 normal / attacker → broken 用 `KIT.broke(tl, ID, t)`，修回用 `KIT.fixed`（`fixed` 会打开地光，这是 kit 的行为）。
- **id 不要取 `cam`**（舞台的镜头容器就是 `#cam`）。建议护照 `ps0`…、集装箱 `ctr`。
- 集装箱的门在 **−u 端**（BRIEF 写的是 +u 端，但 +u 端在等距视角里是背面，看不见），`label` 写在 +v 侧面（看向观众）。

样张：`showcase.png`，来自 `demo/`（8 秒，两屏）。每行是一屏，左列是动作前，右列是动作后。第一屏：normal 护照翻开 → 三格依次绿勾；attacker"系统账户"盖伪造戳 → 翻开 → 第 2 格红叉 → `KIT.broke`；一本 0.7 的已翻开；kit `person` 0.7 做比例对照。第二屏：normal 集装箱开门露出货物 → 封条变红；attacker（teal、`label` "BRC-20"）开门露出红色货物；一只 0.6 的 broken 修回。

| 文件 | 作用 |
| --- | --- |
| `objects-ext.mjs` | `passport`、`container`，另有 `CATALOG_EXT` 和 `runtimeExtJs()` |
| `runtime-ext.js` | 浏览器端动画助手 **`window.KITX13`**。全部排进 `tl`，只用确定性逻辑，可以任意 seek |
| `demo/` | 临时样张工程：`node src/build.mjs`，然后 `npx hyperframes@0.9.46 check` / `snapshot` |

## 接入

```js
// segN/src/build-story.mjs
import { passport, container, runtimeExtJs as rt13 } from "../../kit-ext/objects-ext.mjs";
// segbase 写法：import * as X from "../../kit-ext/objects-ext.mjs"; segInit(…, { ext: [X, …] }) 后在 SHOTS 里用 X13.xxx
// 手写 <script>：先 kit 的 runtime，再其他集的 ext，最后本集的
//   ${runtimeJs()}
//   ${rt01()}
//   ${rt13()}
//   KITX13.cover(tl, "ps0", 2.0);
```

- **调用名一律用 `KITX13.xxx`**（segbase 里是 `X13.xxx`）。它也会合并进 `window.KITX`，但合并时**已存在的名字一律不覆盖**（`check`、`seal`、`door`、`title` 之类很可能已被别集占用）。
- 所有助手签名都是 `(tl, id, t, …)`；同一部件多次调用按时间顺序写，每次从上一次的终值开始。
- 运行时直接写 `transform` 的部件只交给助手去动，不要再对它们用 GSAP 的 x/y/rotation/scale：`ID-cover`、`ID-door`。

## 物件清单

### `passport(o, opts)`：账户护照

约 60×24×80（黑色夹座 56×20×7；护照本 48 宽、68 高，顶 z 78）。一本立在小黑夹座上的护照：硬封面青蓝色，金色圆形徽记 + 白字 `title`；**封面正面朝 +v**（看向观众），绕左边（−u）铰链向观众一侧翻开，露出内页三行字段，每行右侧一个检查格。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `title` | `"账户"` | 封面字；纯 ASCII 用等宽字体，字号按长度自动缩 |
| `fields` | `["owner","类型","地址"]` | 内页字段（最多 3 行） |
| `open` | `false` | `true` = 封面已翻开（155°） |
| `fake` | `false` | `true` = 封面右下角红色"伪造"戳已显示 |
| `checks` | `[]` | 每格初始标记 `"ok"` / `"bad"` / `""` |

- 状态：normal 青蓝封面、检查格空；attacker 外观和 normal 一样，只有封面右边一道细红线（= 外观看不出），伪造戳另用 `fake`；broken 整件变虚 + 红虚线框 + 红叉（= 被拒收）。
- 可动：
  - `KITX13.cover(tl, ID, t, open=true, dur=0.6)`：封面翻开 / 合上，返回结束时间。翻过约 125° 后看到的是封面内侧。`ID-cover`（`-front` / `-inside`）。
  - `KITX13.check(tl, ID, t, i, mark, dur=0.2)`：第 i 格（0–2）`"ok"` 绿勾、`"bad"` 红叉、`""` 空。`ID-check-i-ok` / `-bad`。检查格在内页上，封面合着时看不见。
  - `KITX13.fake(tl, ID, t, on=true)`：伪造戳出现 / 消失。`ID-fake`。
  - `KITX13.title(tl, ID, t, text)`：封面换字（seg3 L3 冒充的那本）。`ID-title`。
- anchors：`top`、`center`、`ground`、`cover`（封面中心，合着时）、`title`、`fake`、`page`（内页中心）、`checks[0..2]`（检查格中心，供红虚线连线）。

### `container(o, opts)`：集装箱

约 200×90×95（u ±100、v ±45、顶 z 95）。瓦楞钢板箱身（墨灰；`tone` "teal" 青蓝），+v 侧面写 `label`；−u 端两扇门，每扇两根竖向锁杆，前门（靠观众那扇）锁杆上挂一枚封条小牌。前门绕外侧铰链向 −u 转开，门内是暗色箱膛和几张卡片剪影。

| opts | 默认 | 说明 |
| --- | --- | --- |
| `label` | `"UTXO"` | 侧面字 |
| `tone` | `"slate"` | `"teal"` = 青蓝箱身 |
| `open` | `false` | `true` = 前门已开（105°） |
| `inside` | 同 `open` | 门内货物剪影可见 |
| `seal` | `"green"` | 封条颜色 `"green"` / `"red"` |

- 状态：normal 封条绿、货物剪影白底青蓝；attacker 封条仍绿，货物剪影红（= 封条对、内容解释错；要开门才看得见）；broken 整件变虚 + 红虚线框 + 红叉。
- 可动：
  - `KITX13.door(tl, ID, t, open=true, dur=0.6)`：前门打开 / 关上；`open` 可以给角度（如 `30` = 开一条缝，seg2 L8），返回结束时间。`ID-door`。
  - `KITX13.seal(tl, ID, t, color)`：封条 `"green"` / `"red"`。`ID-seal-g` / `-r`。
  - `KITX13.inside(tl, ID, t, on=true, red)`：货物剪影出现 / 消失；`red` 为 `true` / `false` 时同时切红色 / 正常（省略则不变）。`ID-inside`（`-n` / `-r`）。
- anchors：`top`、`center`、`ground`、`label`（侧面字中心）、`door`（前门中心，关着时）、`seal`（封条，关着时）、`inside`（门内中心，供两条细线连到索引器）。

## runtime-ext.js · window.KITX13

| 调用 | 物件 |
| --- | --- |
| `cover` / `check` / `fake` / `title` | 账户护照 |
| `door` / `seal` / `inside` | 集装箱 |

离散切换（换字）在 seek 回去时会恢复成之前的状态。

## 已知不足

- `hyperframes check` 若报 `dead_stretch`，原因同 kit：动作都在 `#cam` 里的 SVG 属性上，取样器看不到，snapshot 可确认在动。
- 护照很小（倍率 1 约 55 px 宽）：封面字、内页字段只是质感；要观众读的字用 `wlab` 贴 `anchors.title` / `anchors.checks[i]`，或镜头推近。
- 集装箱的 −u 端在画面上很窄（倍率 1 约 52 px），开门后门内货物剪影只露出一小条；要强调"门内"，镜头推近或用 `wlab` 贴 `anchors.inside`。
- 开着的门（105°）伸向画面左下方，旁边约 50 px 内不要摆别的物件。
