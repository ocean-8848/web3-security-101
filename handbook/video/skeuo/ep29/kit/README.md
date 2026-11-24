# ep29 拟物等距物件库（kit）

第 29 章「攻击者不再偷私钥，而是控制签名路径」视频的共用物件库。风格沿用 s7-vivid：纸底 `#efebe3` 加等距网格，投影是方位 35°、仰角 30° 的轴测，标签用青蓝描边白底。在 s7 基础上，物件都改成了拟物画法。

样张：`showcase.png`（来自 `../kit-demo`，12 秒，三屏）。

| 文件 | 作用 |
| --- | --- |
| `iso.mjs` | 等距基础库：投影、立体、面坐标系、地光、网格、相机、标签、损坏线框、连线 |
| `objects.mjs` | 28 个拟物物件，签名都是 `objName(origin, opts) → { svg, anchors }` |
| `runtime.js` | 浏览器端 `window.KIT` 动画助手，负责开门、抬杆、拨开关、亮灯、损坏态等 |
| `kit.css` | 标签、胶囊、代码卡、点阵、标题卡、字幕卡，以及世界坐标层的脚手架样式 |
| `pills.mjs` | 右上角五段章节胶囊 |

## 坐标约定（先读这一段）

- **世界坐标** `(u, v, z)`，单位约等于 1 px（相机倍率为 1 时）。物件原点 `o = {u, v}` 落在地面上。
- **世界画布 px**：`Wp(u,v,z)` 和 `at(o,du,dv,z)` 的返回值。所有 SVG 和 `anchors` 都用这个坐标系，整层放在 `#cam` 里，由相机统一平移和缩放。
- 布局时一般先想好物件在世界画布上的地面位置 `(X, Y)`，再用 `G(X, Y)` 换算成 `{u, v}`。
- 屏幕上能看到的面有三个：**顶面**、**−u 面**（左侧窄面，偏亮）、**+v 面**（右前方的宽面，偏暗，库里统一叫它"正面"）。门、屏幕、面板都开在 +v 面上。
- 画家顺序：世界画布地面 Y 小的（远处的）先画。
- 物件用到的尺寸参考：冷钱包保险柜 290×240×334，笔记本底座 240×160，人物高约 250，关卡岗亭高 176，门牌顶部离地约 270。

## iso.mjs 速查

```js
import { G, at, Wp, camAt, toScreen, worldSvg, gridSvg, wlab, wpin, pinAt, ENV, BADGE, CHECK,
         box, rbox, cyl, frustum, loft, prism, wedge, sphere, flat, line3, edges, backEdges,
         faceV, faceU, faceTop, faceTilt, frameV, frameU, frameTop, applyM,
         glow, contactShadow, isoDefs, wireSvg, wirePath, badgeSvg, checkSvg, dashCurve, bez, bezLen,
         M, C, mat, mix, lighten, darken, kitCss, runtimeJs } from "../kit/iso.mjs";
```

- 投影与相机：
  - `Wp`、`G` 和 `at(o, du, dv, z)` 负责坐标换算。
  - `camAt(P, sx, sy, k)` 让世界点 P 落到屏幕的 (sx, sy)，倍率为 k。
  - `toScreen(cam, p)` 把世界画布点换成屏幕点。
- 立体：
  - `box(o,u0,u1,v0,v1,z0,z1,m)`：三面明暗加描边，与 s7 相同。
  - `rbox(..., r, m)`：竖棱为圆角的盒子。
  - `cyl(o,du,dv,r,z0,z1,m)`：圆柱。
  - `frustum(o,du,dv,r0,r1,z0,z1,m)`：圆台。
  - `loft(o,planB,planT,z0,z1,m)`：任意截面的放样体。按法线着色，只描轮廓线和折棱。
  - `wedge(...)`：楔形。
  - `sphere(id,o,du,dv,z,r,m)`：球。
- 面坐标系：`faceV`、`faceU`、`faceTop`、`faceTilt` 返回 `matrix(...)` 字符串。在这些坐标系里，本地 1 单位等于世界 1 单位，本地 y 轴朝下。往面上画细节（屏幕、面板、文字）都靠它们。
- 材质：`M.white/plinth/dark/ink/blue/red/green/glass/gold/steel/steelLight/chrome/wood/rubber/tealLight/paper`。也可以用 `mat("#hex")` 从一个底色生成整套材质。
- 地面：
  - `glow(id,o,r)`：绿色地光，只放在"正常"物件下面。
  - `contactShadow` 是接触阴影。
  - `gridSvg()` 画网格。
  - `worldSvg(id, content, box)` 包一个世界 `<svg>`，自带 `isoDefs()`。
- 损坏态：`wireSvg(id,o,parts)` 画红色虚线线框，用法见下文。
  - `parts` 里每项可以是 `[u0,u1,v0,v1,z0,z1]`、`{cyl:[du,dv,r,z0,z1]}` 或 `{path:d}`。
  - `badgeSvg` 是世界空间里的红叉，`checkSvg` 是绿勾。
- 标签：`wlab(id, p, html, cls, anchor)` 是反向缩放的世界标签。
  - `cls` 可选：空（青蓝描边）、`lab-cs`（青蓝实底）、`lab-gs`（绿底）、`lab-rs`（红底）、`lab-r`（红描边）、`lab-g`（灰描边）、`lab-ink`（墨底）。可以再叠 `lab-sm`（28 px），想先藏起来就加 `hide`。
  - `anchor` 可选：`b`（标签在点上方）、`t`、`l`、`r`、`c`。
  - `wpin` 用来放任意反向缩放的 HTML，比如 `BADGE`、`CHECK`、`ENV`。
- 连线：`dashCurve(id, P0, P3, {c1, c2})` 画红色虚线贝塞尔（代码行 → 物件），返回 `{svg, L, d, P}`。
  - 先画好隐藏的线，再用 `KIT.draw(tl, id, t)` 画出来。
  - P0 和 P3 必须和这条线所在的层用同一坐标系：放在屏幕层就用屏幕点（世界点先过 `toScreen`），放进 `#cam` 就用世界画布点。

## 物件通用约定

- `opts.id` 是前缀，**同一画面里有多个实例时必须不同**。内部所有 id 都是 `${id}-xxx`。
- `opts.state` 有三种取值：
  - `"normal"`：默认。
  - `"broken"`：实体降到 0.18 透明（可用 `ghost` 改），叠红色虚线线框和红叉（`badge:false` 可以去掉红叉）。
  - `"attacker"`：主体改成红色。
- `opts.glow: true` 会在脚下加绿色地光。关卡默认开着。
- 每个物件的 DOM 结构：

```
<g id=ID data-ox data-oy>   ← KIT.grow 以它的地面原点做 scaleY 出场
  <g id=ID-glow>            ← 地光
  <g id=ID-solid>           ← 实体
  <path id=ID-wire>         ← 红虚线框（normal 时 opacity 0）
  <g id=ID-x>               ← 红叉（normal 时 opacity 0）
```

- 所有物件都有的 `anchors`：`top`（名字标签放这里，配 `wlab(..., "b")`）、`center`、`ground`。

## 物件清单

| 函数 | 说明 | 可动部件 / 额外 anchors |
| --- | --- | --- |
| `safe(o,{open,core,plate,gold})` | 冷钱包，Safe 多签。深灰钢柜，圆角厚边，带铰链、密码转盘、三辐把手和铭牌。柜内有隔板和金条，门内侧装锁芯 | `ID-door`：`KIT.door(tl,ID,t,105)` 开门，`KIT.door(..,0)` 关门，门绕右侧铰链真 3D 转动。`ID-core` 是蓝锁芯，`ID-core-atk` 是红色攻击者锁芯，`core:"attacker"` 时一开始就是红的，换芯用 `KIT.swap`。anchors：`core`、`coreLabel`（门开 105° 时锁芯中心和门下方标签点）、`hinge`、`front` |
| `hotWallet(o,opts)` | 热钱包：更小、颜色更浅，−u 面外挂数字键盘（带线），门上是小指示灯而不是转盘 | 同 `safe`，另有 `ID-led` |
| `laptop(o,{screen,screen2,off})` | 笔记本：屏幕后仰 12°，键盘有键帽，带触控板 | 屏幕插槽 `ID-scr` 和 `ID-scr2`（初始隐藏）。本地坐标 222×146，常量 `LAPTOP_SCREEN`。`laptopDefaultScreen({title,line,btn,btnText})` 生成默认钱包界面。anchors：`screen`、`screenM`（屏幕仿射矩阵） |
| `hwWallet(o,{screenText,screen})` | 通用硬件钱包：小屏、两个按键、USB 线 | `ID-scr` 和 `ID-scr2`（70×40），`ID-btn-0/1` |
| `padlock(o,{key})` | 挂锁，默认插着钥匙 | anchors：`keyhole` |
| `key(o,{stand})` | 单独一把钥匙，默认平放，`stand:true` 立起 | — |
| `seal(o,{paper,stamped,text,markText})` | 公章：木柄圆印章，下面压着纸，纸上有红色印痕 | `ID-stamp`：`KIT.stamp(tl,ID,t)` 把印章抬起、盖下、再放回一旁。`ID-mark` 是印痕，`stamped:false` 时一开始不显示。anchors：`mark`、`stamp` |
| `doc(o,{title,lines,stamp,standing,w,h})` | 文件或提现单：带折角、几行字、签名线 | `ID-stampmark` 是右下红章，盖章就是把它的 opacity 动画到 1。`ID-body` 是纸面。anchors：`stamp` |
| `envelope(o)` | 平放的等距信封。HTML 小图标仍用 `iso.ENV()` | — |
| `ledgerBook(o,{scale})` | 摊开的厚账簿：弧形页面、横线、条目，青蓝书签 | — |
| `dbLedger(o)` | 数据库圆柱（三层）上面放一本小账簿 | — |
| `rack(o,{leds,units,tag})` | 服务器机柜，用于签名集群或 MPC 节点：三台服务器凸出柜面，有通风口、硬盘位、把手 | `ID-led-0..2`：`KIT.led(tl,"ID-led-1",t,"red")` 换色，可选 green、red、off、blue。还有 `ID-act-i` 小灯 |
| `hsm(o,{led})` | 加密机 HSM：厚机箱，带 LCD、小键盘、盾形徽记、防拆贴 | `ID-led-0` |
| `rpc(o,{led})` | RPC 节点：小服务器加天线 | `ID-wave-0..2` 信号弧，`ID-led-0`。anchors：`tip` |
| `checkpoint(o,{n,armUp,road})` | 关卡（七道关用）：岗亭加红白道闸，屋顶上挂门牌编号，脚下一段路面 | `ID-arm`：`KIT.arm(tl,ID,t,true/false)` 抬杆或落杆。`ID-plate` 和 `ID-plate-n` 是门牌（broken 时自动红底白字）。normal 有绿色地光，broken 是红虚线框加红叉。anchors：`plate`、`road`、`armTip` |
| `tower(o)` | 广播塔：格构铁塔加信号弧 | `ID-wave-0..3`。anchors：`tip` |
| `chain(o,{n,labels,blockStates})` | 区块链：n 个区块用铁链环相连，可以单独把某一块设为 `attacker` | `ID-b0..`、`ID-l0..`。anchors：`blocks[]`、`last` |
| `browserWin(o,{title,heading,button,page,page2})` | 浏览器窗口，即 Safe{Wallet} 网页（与 s7 相同） | `ID-page` 和 `ID-page2`（380×300）。anchors：`pageM` |
| `bucket(o)` | 云存储桶（S3）：桶身、提手，桶里露出 JS 文件 | — |
| `desk(o,{screen,screen2})` | 员工工位：桌子、显示器、键盘、杯子、转椅 | `ID-scr` 和 `ID-scr2`（148×88）。anchors：`screen`、`chair` |
| `phone(o,{screen,screen2})` | 手机，斜靠在底座上 | `ID-scr` 和 `ID-scr2`（76×150） |
| `person(o,{role,color,scale})` | 极简等距小人，无脸。`role` 取 `signer`（墨色）、`engineer`（青蓝，挂工牌）、`attacker`（红色帽衫）。`state:"attacker"` 等同于攻击者 | anchors：`head` |
| `knifeSwitch(o,{on,lampOn,lampOff,text})` | 熔断开关：墙上的大闸刀，有底板、夹口、两片闸刀、绝缘横把和指示灯 | `KIT.toggle(tl,ID,t,false)` 拉闸（闸刀向外下翻），`true` 合闸。指示灯 `ID-lamp` 合闸时绿、断开时红 |
| `beacon(o)` | 警报灯：旋转警示灯 | `KIT.beacon(tl,ID,t,dur,period)`：光束在水平面里旋转，灯罩明暗随时间按余弦变化。结束后熄灭，没有用 `repeat:-1` |
| `hourglass(o,{flowing})` | 沙漏：木框、玻璃、沙 | `KIT.sand(tl,ID,t,dur)`：上半沙面下降（裁剪框动画），下半沙堆长高，同时有沙流 |
| `clock(o,{h,m})` | 双铃闹钟，默认 3:50 | `ID-hh`、`ID-mh`。`KIT.clock(tl,ID,t,dur,分钟)` 推进指针 |
| `shield(o)` | 盾牌（策略引擎）：厚盾加白勾，attacker 时变红盾白叉 | — |
| `magnifier(o,{z})` | 放大镜（解码、核对）：悬空，带玻璃高光 | anchors：`lens` |

另外 `CATALOG` 是名字到构造函数的映射表。

## runtime.js · window.KIT

把 `iso.runtimeJs()` 内联到场景的 `<script>` 里，放在场景自己的代码前面。所有助手都是往 `tl` 上排 tween，可以随意 seek。

| 调用 | 作用 |
| --- | --- |
| `KIT.camSet(tl, cam)`、`KIT.cam(tl, t, cam, dur)` | 设置或移动相机，`.wl` 标签会同步反向缩放 |
| `KIT.door(tl, ID, t, deg, dur)` | 保险柜门转到 deg 度（0 关，105 全开） |
| `KIT.arm(tl, ID, t, up, dur)` | 道闸抬杆或落杆 |
| `KIT.toggle(tl, ID, t, on, dur)` | 闸刀开关 |
| `KIT.rot(tl, rotatorId, t, deg, dur, ease)` | 通用的平面内转动，适用于任何带 `data-m` 的 rotator |
| `KIT.led(tl, ledId, t, color)` | 指示灯换色 |
| `KIT.swap(tl, selA, selB, t, dur)` | A 淡出、B 淡入，用于换锁芯、换屏幕、换网页 |
| `KIT.broke(tl, ID, t, {ghost, badge})`、`KIT.fixed(tl, ID, t)` | normal 和 broken 之间来回切换 |
| `KIT.pop(tl, sel, t)` | 标签或徽章弹出：scale 0.8 → 1，back.out(1.4) |
| `KIT.grow(tl, ID, t)` | 物件从地面长出：scaleY 0 → 1 |
| `KIT.draw(tl, curveId, t, dur)` | 画出 `dashCurve` |
| `KIT.beacon`、`KIT.sand`、`KIT.clock`、`KIT.stamp` | 见物件清单 |

同一部件有多段动画时，按时间顺序调用即可。助手会记住上一段的终值，作为下一段的起点。

## 在一个 HyperFrames 场景里用（最小例子）

项目里放一个 `src/build.mjs`，用 Node 生成 `compositions/xxx.html`，做法和 s7 的 build-story 一样，静态几何直接烘焙进 HTML。完整示例见 `../kit-demo/src/build.mjs`。

```js
// src/build.mjs   →  node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../kit/iso.mjs";
import { safe, checkpoint } from "../../kit/objects.mjs";
import { pills } from "../../kit/pills.mjs";

const vault = safe(G(800, 600), { id: "v", plate: "COLD" });
const gate = checkpoint(G(1300, 700), { id: "g4", n: "④" });
const cam = camAt([1000, 560], 960, 540, 1.0);
const svg = worldSvg("w", gridSvg() + vault.svg + gate.svg);       // 远的先画
const labels = wlab("lb-v", vault.anchors.top, "冷钱包 · Safe 多签")
  + wlab("lb-core", vault.anchors.coreLabel, "实现合约（锁芯）", "lab-cs hide", "t")
  + wlab("lb-g4", gate.anchors.top, "<span class='gn'>④</span>显示与解码", "lab-g");

fs.writeFileSync("compositions/scene.html", `<template>
  <style>${kitCss()}
    #root { position:absolute; inset:0; overflow:hidden; background:#efebe3; font-family:"Noto Sans SC",sans-serif; }
  </style>
  <div id="root" data-composition-id="scene" data-width="1920" data-height="1080">
    <div class="k-stage"><div id="cam" data-layout-allow-overflow data-layout-ignore>
      ${svg}<div class="k-layer">${labels}</div></div>
      ${pills(2)}
    </div>
  </div>
  <script>
${runtimeJs()}
  (function () {
    const tl = gsap.timeline({ paused: true });
    KIT.camSet(tl, ${JSON.stringify(cam)});
    KIT.door(tl, "v", 1.0, 105, 1.1);
    KIT.pop(tl, "#lb-core", 2.0);
    KIT.swap(tl, "#v-core", "#v-core-atk", 3.0, 0.3);
    KIT.broke(tl, "g4", 4.0);
    window.__timelines["scene"] = tl;
  })();
  </script>
</template>`);
```

`index.html` 用 `data-composition-src="compositions/scene.html"` 挂载，host 的 id 和 `data-composition-id` 都写 `scene`。字体沿用 template 里的 `@font-face`（Noto Sans SC）；JetBrains Mono 是 HyperFrames 内置字体。

## 胶囊 pills.mjs

`pills(n, {mode, id, hidden})` 用于第 n 段（1–5）：「① 钥匙还在钱没了」「② 七道关」「③ 断在哪一关」「④ 三个共同点」「⑤ 怎么守」。

- 默认 `compact` 模式：当前段墨底白字显示全称，其余段只显示圆圈编号、0.5 透明，总宽约 540 px，字号 28 px，放在右上角 (right 48, top 30)。
- `mode:"full"`：五段都显示全称，宽约 1350 px，只在画面上方空旷时用。配合 `pillSwitchJs()` 可以在段内做激活态动画。

## 颜色语义（务必守住）

- 绿 `#1f9d55`：正常、通过（地光、绿勾、`lab-gs`）。
- 红 `#e0453a`：失败、攻击者（虚线框、红叉、`lab-rs`、攻击者锁芯、红色区块、拉闸后的红灯）。
- 青蓝 `#2aa3c9`，实底用 `#1d93ba`：中性组件（锁芯、区块、数据库、盾牌、标签）。
- 墨 `#1c1c1c`。
- 金色只用在金条和钥匙（黄铜），木色只用在公章、沙漏、桌面。不用黄色荧光笔。

## 已知事项

- `hyperframes check` 会对 0–4 s 和 4.4–7.6 s 报 `dead_stretch`。这里的动作发生在 `#cam`（`data-layout-ignore`）里的 SVG 属性上，取样器看不到，实际是在动的，snapshot 可以确认。
- 物件上的小字（硬件钱包屏、铭牌、提现单）在相机倍率 0.8 以下基本只是质感，读不出来。需要观众看清的字一律用 `wlab` 标签。
- 保险柜门、闸刀横把、指针都靠 `runtime.js` 每帧重算 transform，不要再对这些元素用 GSAP 的 x/y/rotation。
- 道闸和闸刀的"厚度"是一个带 `filter:brightness()` 的 `<use>` 副本。只在需要时用，别在一个画面里放上百个。
