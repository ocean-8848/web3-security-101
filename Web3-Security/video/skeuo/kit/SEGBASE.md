# segbase：分段画面骨架

段代理读这一页，不读别段的 build-story。`kit/segbase.mjs` 负责这些：读 timing.json / script.json、胶囊、0–1.6 秒标题卡（同章节续段改成左上小标签）、起始镜头、术语卡（打印 report）、结束卡、内联 kit.css 和 runtime（同时复制到 `assets/kit.css`）、注册 `window.__timelines["story"]`、写 `compositions/story.html`。你只写：物件、标签、屏幕卡片、镜头时间线。

起稿：`python3 tools/new_seg.py epNN [segN …]`（在 scaffold.py 之后运行）。它会填好起始镜头、术语卡、结束卡、可用 CAMS 列表和每句的 `// ===== L<i>` 占位。

## API

```js
const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, X] });  // ext = 用到的 kit-ext 模块（runtime 自动内联，X<NN> 自动定义）
```
`S` 上的东西：
- 时间：`S.w("词语", 句号, nth?)` / `S.we(…)`（开始 / 结束秒）、`S.LS[i]` / `S.LE[i]`（第 i 句起止）、`S.TOTAL`、`S.SEG`（script.json 本段）、`S.continued`
- 世界：`S.put(key, o, obj(o,{id:key}), dy?, { wrap?, grow? })`，anchors 存进 `S.A[key]`；`grow: true` 表示开场 scaleY=0，之后用 `grow(key,t)` 长出；`S.add(o, svg, dy?)` 加原样 SVG（按纵深排序）；`S.hid(id, svg)` 包一层透明 `<g>`；`S.rel(o,du,dv)`、`S.up(p,d)`
- 标签（世界层，默认隐藏）：`S.lb(id, p, html, cls, anchor)`，cls 用 `lab-cs / lab-gs / lab-rs / lab-r / lab-g / lab-ink`，可加 `lab-sm`；`S.pin(id, p, html)`；`S.raw(html)` 放原样 HTML/SVG
- 屏幕：`S.scr(cam, p)` 求世界点 p 在某镜头下的屏幕坐标；`S.curve(id, P0, P3, {color, c1, c2})` 画屏幕层虚线（隐藏），用 `draw(id,t)` 画出
- `S.build({...})`：
  - `cam0`（必填，CAMS 的键）
  - `sub`：标题卡副标题
  - `grid` `{u0,u1,v0,v1}`、`box` `[x,y,w,h]`：网格和世界画布范围，要盖住本段所有镜头
  - `css`、`html`：屏幕层卡片
  - `js`：镜头时间线，浏览器端代码串
  - `terms`：termCards 列表
  - `end`：`{ line, next, at?, nextAt? }`，只在全集最后一段写
  - `shown`：开场就可见的选择器
  - `title`：`{ main, sub, continued, until }`，用来覆盖默认
  - `hold`：末尾静止秒数，默认 1

`js` 里现成的东西：`tl CAMS KIT $ X1 X8 …`，以及
`fadeIn(sel,t,d)` `out(sel,t,d)` `pop(sel,t,d)` `grow(id,t,d)` `draw(id,t,d)` `cam(t,"name",dur,ease)` `bump(sel,t,scale,n)` `flash(sel,t,n,lo)` `hot(sel,t,color)`。
时刻在 Node 侧算好再插进去：`${f(TM.x + 0.2)}`。最后 hold 秒里如果还有动作，build 会打印警告（有结束卡时，从结束卡最后 2.5 秒算起）。

屏幕卡片助手（import 自 segbase，CSS 已内置）：
- `codeCard(id, {x,y,w, head, tag, rows, mono, rowHide})`：行 id 是 `${id}-r${i}`，行尾 chip 的 id 是 `${id}-c${i}`（`rows: [{ html, chip:"可变", chipCls:"x"|"ok" }]`）。`codeRowY(y, i)` 给出第 i 行中心的 y，曲线从这里起。
- `ck(id, text, {x,y,w, kind:"g"|"c"|"r"|"n"})`：勾选卡。
- `kw(id, html, {x,y,size,accent})`：关键词卡，`<b>` 着色。
- `evt(id, html, {color})`：事件卡或来源卡，放右上 ZONE.event。
- `gtag("解读")`：事实分层标签。

## 最小完整示例

```js
import { segInit, codeCard, codeRowY, kw, gtag, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, X] });
const { A, put, lb, up, LS, w } = S;

put("vm", L.VEND, E1.vending(L.VEND, { id: "vm" }));
put("eng", L.ROLES.eng, O.person(L.ROLES.eng, { id: "eng", role: "engineer" }), 0, { grow: true });
put("pp", L.VEND, E1.pipe(L.VEND, { id: "pp", pts: L.PIPE.pool }), 0.4);
lb("lb-vm", up(A.vm.top, 8), "借贷合约", "lab-ink");
lb("lb-eng", up(A.eng.top, 6), "工程师", "lab-cs lab-sm");

const C = { x: 60, y: 110, w: 600 };
const card = codeCard("cs", { ...C, head: "价格来源清单", rows: [{ html: "AMM 储备", chip: "可变", chipCls: "x" }, { html: "链下预言机", chip: "不可变", chipCls: "ok" }] });
S.curve("cv", [C.x + C.w + 4, codeRowY(C.y, 0)], S.scr("center", A.pp.end ?? A.vm.top), { color: "#e0453a" });
const TM = { list: w("列出", 1), swap: w("全部换掉", 2), win: w("窗口", 11) };

S.build({
  cam0: "center", sub: "按角色 · 回答开头",
  grid: { u0: -2000, u1: 2000, v0: -1500, v1: 1500 }, box: [-2000, -1600, 4400, 3200],
  shown: ["#lb-vm"],
  html: card + kw("kw-win", `价格 = 合约看世界的 <b>窗口</b>${gtag("解读")}`),
  terms: [{ id: "cap", t: "供应上限", d: "协议对某种抵押资产的存入总量上限", at: w("供应上限", 4) }],
  js: `
      // ===== L0 工程师登场
      cam(${f(LS[0])}, "centerWide", 1.2); grow("eng", ${f(LS[0] + 0.3)}); pop("#lb-eng", ${f(LS[0] + 0.6)});
      // ===== L1 清单卡 + 逐行 chip
      pop("#cs", ${f(TM.list)}); [0, 1].forEach((i) => pop("#cs-c" + i, ${f(TM.list + 0.4)} + i * 0.2, 0.2));
      // ===== L2 红线连到池子管，管子断开
      draw("cv", ${f(TM.swap)}); hot("#cs-r0", ${f(TM.swap)}); KIT.broke(tl, "pp", ${f(TM.swap + 0.3)}, { badge: false, ghost: 0.35 });
      // ===== L11 关键词卡
      out("#cs, #cv", ${f(LS[11] - 0.2)}); pop("#kw-win", ${f(TM.win)});`,
});
```

## 常用写法

- **镜头**：`cam(t, "oracle", 1.4)` 只用 shared/layout.mjs 的 CAMS。换镜头前 0.2 秒收起上一镜的标签（`out("#a, #b", LS[i] - 0.2)`）。本段的结尾镜头要等于下一段的 `cam0`，并在文件头注释写 `ends static on CAMS.x`，new_seg.py 会读它。
- **标签**：先在 Node 侧 `lb(...)`，再在 js 里 `pop("#id", t, 0.25)`。同一位置换文字时，建两个标签，一个 `tl.set(opacity 0)`，另一个 pop 出来。
- **代码卡连物件**：`S.curve` 的起点是卡片右边缘 `[x + w + 4, codeRowY(y, i)]`，终点是 `S.scr(该时刻的镜头, A.obj.top)`。曲线跟镜头无关，那一镜期间不要移动镜头。
- **坏 / 修**：`KIT.broke(tl, id, t, {badge, ghost})` / `KIT.fixed(tl, id, t)`；各集物件的动画助手见对应 `epNN/kit-ext/README.md`，调用写成 `X<NN>.fn(tl, …)`。
- **段内专用样式**放 `css`；屏幕层元素留在 x 60–1860、y 100–900，左上术语卡区和右上胶囊区不要放东西。

## API 补充

- **镜头助手**：`lb(id,p,html,cls,anchor)` 的 `anchor` 是标签相对点 p 的对齐：`b`（默认，底边中点落在 p，标签在点上方）/ `t`（顶边中点在 p，标签在点下方）/ `l`（左边中点在 p，标签在右）/ `r`（右边中点在 p，标签在左）/ `c`（正中）。`pin` 默认 `c`。
- **flash / hot / bump**：`flash(sel,t,n,lo)` 闪 n 次，总长 n × 0.32 秒（默认 3 次，最低透明度 0.25）。`hot` 改的是 backgroundColor，只给屏幕卡片的行用；世界标签上用 `hot` 会让文字消失，改用 `bump`。
- **起始透明度**：`S.hid` 的 `<g>` 靠 SVG 属性 `opacity="0"` 隐藏；`fadeIn` / `out` 通过内联 style 覆盖它，所以直接用就行，不要再 `tl.set` 属性。
- **KIT 的动画助手**（`kit/runtime.js`，所有集通用）：`KIT.clock(tl, id, t, dur, minutes)` 让钟的时针分针走 minutes 分钟；`KIT.arm(tl, id, t, up, dur=0.7)` 抬 / 放闸杆（up 为 true 抬起）；`KIT.door(tl, id, t, toDeg, dur=1.0, ease)` 保险柜门转到 toDeg 度。
- **自定义镜头**：段内专用镜头合并进传给 `segInit` 的 cams：`segInit(import.meta.url, { cams: { ...L.CAMS, myCam: { …同 L.CAMS 里的字段… } }, ext })`，`cam0` / `cam()` / `S.scr` 就都能用 `myCam`。
- **额外 import**：segbase 只再导出 `wordAt lineAt f at Wp toScreen ZONE`，不转出 `G`、`BADGE`、`ENV`（也没有 `CHECK`）。要用就 `import { G, BADGE, ENV, CHECK } from "../../../kit/iso.mjs"`。

## 助手命名空间（X1 / X5 … 与 KIT）

- 每集 runtime-ext 设 `window.KITX<NN>`（KITX01、KITX05、KITX08、KITX09 …）。segbase 按 `ext` 自动在 js 里定义别名 `X1 X5 X8 X9 …`（去掉前导 0）。ep01 README 里的 `KITX.walk` / `KITX.dash` 在段里一律写 `X1.walk` / `X1.dash`。
- **ep02 没有 KITX**：它的助手直接挂在 `KIT` 上（`KIT.count`、`KIT.swap` 等），segbase 不会为它生成 `X2`。
- 各集助手文档：`epNN/kit-ext/README.md`（NN = 01 … 09）；调用写成 `X<N>.fn(tl, …)`。

## 常见坑

1. **`opts.scale` 不是每个物件都有**。支持的（`anchors` 已换算）：kit 的 `person`、`ledgerBook`；ep01 `vending` `miniVend`；ep02 `deriveTree`；ep03 `gasGauge`；ep04 `callbackArm` `hasp` `oracleGhost` `pickupLocker` `punchCard` `tellerCounter`；ep05 `keycard`；ep06 `burnBox` `decimalRuler` `pizza` `roundCutter` `shareCert` `shareDispenser`；ep07 `emptyLot` `parcel` `returnTag` `dispatchDesk` `oddCoin` `scale` `tollClip` `auctionStand`；ep08 `ammPool` `liqBot` `marketStall` `twapRecorder`；ep09 `cheque` `commitBox` `rotaWheel`。其余（尤其 ep01 `mempool` `sorter`，根本没有 scale 参数，里面的信封也不要对缩放后的它们用 `walk`）一律忽略 scale。要缩放它们，绕地面点包一层，并自己换算 anchors：
   ```js
   const [gx, gy] = at(L.POOL), k = 0.7;                 // at 从 segbase 导入；地面点（世界画布坐标）
   const sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
   put("mp", L.POOL, E1.mempool(L.POOL, { id: "mp" }), 0, {
     wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
   for (const n of ["top", "center", "ground"]) if (A.mp[n]) A.mp[n] = sc(A.mp[n]);   // 之后 up() / lb() 才对得上
   ```
2. **walk 目标**：靠 `data-px` / `data-py` 的元素（`letter` 等）按世界画布点走，这个点是物件底部中心，含 `z`，不含 `lift`（letter 默认再抬 10）。把终点写成目标物件的 anchor（如 `A.x.ground`）时，注意这一点高度差。
3. **`hyperframes check`**：两张卡片在同一位置会报错，即使它们永远不同时出现。把其中一张换位置，或错开几个像素。关键词卡有最短阅读时间：约 0.5 秒 + 每词 0.3 秒，太短会报错，要么延长出现时间，要么减字。
4. **图像预算**：`npx hyperframes snapshot` 会写 `contact-sheet.jpg`，只看这一张，不要逐帧看，才不超过 ≤ 6 张图的预算。
5. **没有点阵（dot-matrix）助手**。点阵就写原生 SVG 圆，放进 `S.add` 或 `S.hid`：
   ```js
   const dots = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++)
     dots.push(`<circle cx="${gx + c * 14}" cy="${gy + r * 14}" r="4" fill="#2aa3c9"/>`);
   S.add(o, S.hid("dots", dots.join("")), 40);
   ```

## 自审（在段目录运行）

```bash
node src/build-story.mjs                 # 打印术语卡 report；如有末尾静止警告，一并处理
npx hyperframes check                    # 0 error
node ../../tools/layout_lint.mjs .       # 版面检查通过
npx hyperframes snapshot --at 12,30,55 --no-end   # 关键画面；总共 ≤ 6 张图
```
写 `REVIEW.md`，内容包括：术语卡 report 那一行、check 和 layout_lint 的结果、还没解决的问题。
