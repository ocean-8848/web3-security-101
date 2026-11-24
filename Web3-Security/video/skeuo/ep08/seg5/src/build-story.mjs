// Generates compositions/story.html for ep08/seg5「⑤ 安全读价」(one isometric world「价格集市」, one camera).
// Run: node src/build-story.mjs
// World positions + camera presets: ../../shared/layout.mjs (do not edit). Extra positions are local below.
// Opens on CAMS.oracle (seg4 ends on the oracle close-up), ends static on CAMS.centerRight (seg6 pulls in from there).
import fs from "node:fs";
import { at, G as GC, Wp, f, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, CHECK, BADGE, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { screenCss, termCards } from "../../../kit/screen.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import * as L from "../../shared/layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = T.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const LN = T.lines.map((_, i) => lineAt(T, i));
const LS = LN.map((l) => l.start), LE = LN.map((l) => l.end);
const w = (term, line, nth = 0) => wordAt(T, term, { line, nth }).start;
const we = (term, line, nth = 0) => wordAt(T, term, { line, nth }).end;

// ---------------------------------------------------------------- objects
const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const A = {};
const W3 = (o, du = 0, dv = 0, z = 0) => at(o, du, dv, z);
const up = (p, d) => [p[0], p[1] - d];
const rel = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });
const wrap = (id, o, svg, hidden) => { const p = at(o); return `<g id="${id}" data-px="${f(p[0])}" data-py="${f(p[1])}" data-ox="${f(p[0])}" data-oy="${f(p[1])}"${hidden ? ' opacity="0"' : ""}>${svg}</g>`; };
const scl = (svg, o, k) => { const p = at(o); return `<g transform="translate(${f(p[0])},${f(p[1])}) scale(${k}) translate(${f(-p[0])},${f(-p[1])})">${svg}</g>`; };

// ---- local positions (seg5 only)
const CLK2 = rel(L.CLOCK, 0, 260), CLK3 = rel(L.CLOCK, 0, 520);            // L18 two more heartbeat clocks, a row toward +v
const PULL0 = { u: 520, v: 760 };                                           // L21 submitter walks in from the front-right of the vending
const MAG = { u: 200, v: 330 };                                             // L23 magnifier at the contract's coin-slot panel
const SIN = E1.sorter(L.DOCK.sorter, { id: "tmp" }).anchors.in;              // sorter in-end (world canvas)
const GA = (dx, dy) => GC(SIN[0] + dx, SIN[1] + dy);
const Q1 = GA(-430, 70), Q0 = GA(-760, 260);                               // L26 rush queue (bots + people) → left of the sorter's in-end

// ---- 右区 · 预言机站
const vm = E1.vending(L.VEND, { id: "vm" }); A.vm = vm.anchors; add(L.VEND, vm.svg);
const pOr = E1.pipe(L.VEND, { id: "p-or", pts: L.PIPE.oracle }); A.pOr = pOr.anchors;
const pTw = E1.pipe(L.VEND, { id: "p-tw", pts: L.PIPE.twap }); A.pTw = pTw.anchors;
items.push({ y: at(L.COIN)[1] - 2, svg: pOr.svg });
items.push({ y: at(L.COIN)[1] - 3, svg: `<g id="ptww" opacity="0">${pTw.svg}</g>` });
L.TOWERS.forEach((t, i) => { const tw = O.tower(t, { id: "tw" + i }); A["tw" + i] = tw.anchors; add(t, tw.svg); });
const kn = O.knifeSwitch(L.KNIFE, { id: "kn" }); A.kn = kn.anchors; add(L.KNIFE, kn.svg);
const twp = X.twapRecorder(L.TWAP, { id: "twp" }); A.twp = twp.anchors; add(L.TWAP, twp.svg);
const or = E1.miniVend(L.ORACLE, { id: "or", kind: "oracle" }); A.or = or.anchors; add(L.ORACLE, or.svg);
const lm = E5.thresholdMeter(L.METER, { id: "lm", max: 5, th: 1, level: 4, thText: "0.10" }); A.lm = lm.anchors; add(L.METER, lm.svg);
const coin = E7.oddCoin(L.COIN, { id: "luna", kind: "plain" }); A.luna = coin.anchors; add(L.COIN, coin.svg);
const ck = O.clock(L.CLOCK, { id: "ck" }); A.ck = ck.anchors; add(L.CLOCK, ck.svg);
const ck2 = O.clock(CLK2, { id: "ck2", h: 3, m: 0 }); A.ck2 = ck2.anchors; add(CLK2, ck2.svg);
const ck3 = O.clock(CLK3, { id: "ck3", h: 7, m: 30 }); A.ck3 = ck3.anchors; add(CLK3, ck3.svg);
// ---- 中区 · attacker + submitter at the vending
const atk = O.person(L.ATK.vend, { id: "atk", role: "attacker" }); A.atk = atk.anchors; add(L.ATK.vend, wrap("atkw", L.ATK.vend, atk.svg), 2);
const sub = O.person(PULL0, { id: "sub", role: "signer" }); A.sub = sub.anchors;
const slip = (x, y, red, rot) => `<g transform="translate(${f(x)},${f(y)}) rotate(${rot})"><rect x="-17" y="-24" width="34" height="44" rx="4" fill="${red ? "#fde3df" : "#ffffff"}" stroke="${red ? "#e0453a" : "#1d93ba"}" stroke-width="3"/><path d="M-10 -12H10M-10 -3H10M-10 6H4" stroke="${red ? "#e0453a" : "#1d93ba"}" stroke-width="2.6"/></g>`;
const hand = up(at(PULL0), 120);
const slips = `<g id="slips">${slip(hand[0] + 30, hand[1] - 6, false, -14)}${slip(hand[0] + 46, hand[1] + 4, false, 4)}<g id="slipR">${slip(hand[0] + 62, hand[1] - 2, true, 16)}</g></g>`;
add(PULL0, wrap("subw", PULL0, sub.svg + slips), 3);
const mg = O.magnifier(MAG, { id: "mg", z: 120 }); A.mg = mg.anchors; add(MAG, mg.svg, 3);
const bots = X.liqBot(L.LIQ.enter, { id: "bots", n: 3 }); A.bots = bots.anchors; add(L.LIQ.enter, `<g id="botsw" opacity="0">${bots.svg}</g>`, 4);
// ---- 远右 · L2 码头
const so = E1.sorter(L.DOCK.sorter, { id: "so", letters: 3 }); A.so = so.anchors; add(L.DOCK.sorter, so.svg);
const bc = O.beacon(L.DOCK.beacon, { id: "bc" }); A.bc = bc.anchors; add(L.DOCK.beacon, bc.svg);
const tlk = E1.timeLock(L.DOCK.timeLock, { id: "tlk", frac: 1 }); A.tlk = tlk.anchors; add(L.DOCK.timeLock, tlk.svg);
const dck = O.clock(L.DOCK.clock, { id: "dck" }); A.dck = dck.anchors; add(L.DOCK.clock, dck.svg);
const l1 = O.chain(L.DOCK.chain, { id: "l1", n: 3 }); A.l1 = l1.anchors; add(L.DOCK.chain, l1.svg);
const pf = E1.pipe(L.DOCK.chain, { id: "pf", pts: L.PIPE.force, r: 6 }); A.pf = pf.anchors; add(L.DOCK.chain, pf.svg, 1);
const qb = X.liqBot(Q0, { id: "qb", n: 3 }); add(Q0, `<g id="qbw" opacity="0">${qb.svg}</g>`, 4);
const QOFF = [[-110, 70], [-170, -20]];
const QP = QOFF.map(([dx, dy]) => GA(-760 + dx, 260 + dy));
QP.forEach((q, i) => { const p = O.person(q, { id: "qp" + i, role: i ? "engineer" : "signer" }); add(q, `<g id="qpv${i}" opacity="0">${wrap("qpw" + i, q, p.svg)}</g>`, 3); });
const FE = A.pf.end;                                                        // force-channel out-end (world canvas)
const fp = [0, 1].map((i) => { const o = GA(-40 - i * 70, 20 + i * 35); const p = O.person(o, { id: "fp" + i, role: "engineer", scale: 1.0 }); add(o, wrap("fpw" + i, o, p.svg, true), 5); return o; });

items.sort((a, b) => a.y - b.y);
const world = worldSvg("wsvg", gridSvg({ u0: -900, u1: 5200, v0: -700, v1: 2300 }) + items.map((x) => x.svg).join("\n"), [-1200, -1600, 6600, 2800]);

// ---------------------------------------------------------------- labels (world)
let labels = "";
const lb = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, cls + " hide", a); };
const pin = (id, p, html, a = "c") => { labels += wpin(id, p, html, a); };
const G = (t) => `<span class="gtag">${t}</span>`;
lb("lb-or", up(A.or.top, 8), "预言机", "lab-cs");
lb("lb-hb", up(A.ck.top, 6), "按该喂价心跳", "lab-cs");
// two stop blocks on the dial ends (L3)
const dl = A.or.dial;
pin("stopL", [dl[0] - 36, dl[1] - 12], `<i class="stopb hide" id="stopL-i"></i>`);
pin("stopR", [dl[0] + 36, dl[1] - 12], `<i class="stopb hide" id="stopR-i"></i>`);
lb("lb-dec", up(A.or.top, 70), "decimals · 不写死 8", "lab-ink");
// LUNA
lb("lb-luna", up(A.luna.top, 6), "LUNA", "lab-ink");
lb("lb-floor", [A.lm.th[0] + 14, A.lm.th[1]], `下限 0.10 美元${G("公开报道")}`, "lab-r", "l");
const arTop = W3(L.METER, 90, 60, 300), arBot = W3(L.METER, 90, 60, 0);
labels += `<svg class="wsvg" style="left:0;top:0;overflow:visible" width="10" height="10"><g id="mkt" opacity="0"><path id="mkt-p" d="M${f(arTop[0])},${f(arTop[1])}L${f(arBot[0])},${f(arBot[1])}" fill="none" stroke="#e0453a" stroke-width="6" stroke-dasharray="16 11" stroke-linecap="round"/><path d="M${f(arBot[0] - 14)},${f(arBot[1] - 22)}L${f(arBot[0])},${f(arBot[1])}L${f(arBot[0] + 14)},${f(arBot[1] - 22)}" fill="none" stroke="#e0453a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
lb("lb-mkt", [arTop[0] + 12, arTop[1]], "市场价", "lab-r", "l");
lb("lb-001", [arBot[0] + 14, arBot[1] - 6], `0.01 美元${G("示例")}`, "lab-rs", "l");
lb("lb-feed", [A.lm.th[0] + 14, A.lm.th[1] + 2], "喂价 ≈ 0.10", "lab-rs", "l");
// Venus (center)
lb("lb-vm", up(A.vm.top, 10), "借贷合约", "lab-cs");
lb("lb-val", up(A.vm.top, 10), "LUNA 按 ≈ 0.1 美元估值", "lab-r");
lb("lb-cheap", up(A.atk.head, 40), "市场上低价买入", "lab-ink");
lb("lb-borrow", W3(L.VEND, 60, 300, 0), "借出别的资产", "lab-rs", "t");
let lc = "";
for (let i = 0; i < 4; i++) lc += `<i class="lcoin" id="lc${i}"></i>`;
pin("lcs", up(A.atk.center, 10), `<div class="lcs hide" id="lcs">${lc}</div>`, "c");
// heartbeat clocks (L18)
lb("lb-ck1", up(A.ck.top, 6), "喂价 A", "lab-g");
lb("lb-ck2", up(A.ck2.top, 6), "喂价 B", "lab-g");
lb("lb-ck3", up(A.ck3.top, 6), "喂价 C", "lab-g");
lb("lb-same", W3(CLK2, -260, 0, 300), `<s>同一个延迟上限</s>`, "lab-r", "r");
// fallback (L20)
lb("lb-down", up(A.tw1.top, 6), "节点失效", "lab-rs");
lb("lb-bak", up(A.twp.top, 8), "备用价格源", "lab-gs");
lb("lb-pause", up(A.kn.top, 8), "或者暂停", "lab-r");
lb("lb-norb", W3(L.KNIFE, -260, 260, 0), "清算不会全部回滚", "lab-gs", "t");
// pull oracle (L21–L23)
lb("lb-sub", up(A.sub.head, 40), "提交者", "lab-ink");
const subEnd = at(rel(L.ATK.vend, 120, 60)), sub0 = at(PULL0);
lb("lb-fav", [A.sub.head[0] + subEnd[0] - sub0[0] - 40, A.sub.head[1] + subEnd[1] - sub0[1] - 40], "挑一个对自己有利的", "lab-r", "r");
lb("lb-ts", [A.mg.lens[0] + 70, A.mg.lens[1] - 40], "时间戳 新不新？", "lab-cs", "l");
lb("lb-ci", [A.mg.lens[0] + 70, A.mg.lens[1] + 30], "± 置信区间 多宽？", "lab-cs", "l");
// dock
lb("lb-so", up(A.so.top, 8), "排序器", "lab-cs");
lb("lb-on", up(A.bc.top, 8), "在线", "lab-gs");
lb("lb-off", up(A.bc.top, 8), "宕机", "lab-rs");
lb("lb-on2", up(A.bc.top, 8), "恢复在线", "lab-gs");
lb("lb-stuck", up(A.so.top, 70), "喂价交易上不了链 · 价格停在宕机前", "lab-r");
lb("lb-l1", up(A.l1.top ?? W3(L.DOCK.chain, 0, 0, 120), 4), "L1", "lab-ink");
lb("lb-first", up(at(fp[0]), 280), "占了先机", "lab-ink");
lb("lb-force", [FE[0] - 30, FE[1] - 30], "从 L1 强制提交", "lab-r", "r");
lb("lb-12h", up(A.dck.top, 8), "最长 12 小时", "lab-rs");
lb("lb-grace", up(A.tlk.top, 8), `宽限期 1 小时${G("示例")}`, "lab-cs");
// end (center-right)
lb("lb-gp", W3(L.LIQ.stop, 200, 300, 0), "宽限期内 · 暂停清算和新借款", "lab-r", "t");

// ---------------------------------------------------------------- cameras
const R = (o, k) => L.rect(o, k);
const CAMS = {
  oracle: L.CAMS.oracle,
  chk: L.fit([R(L.ORACLE, "miniVend"), R(L.COIN, "oddCoin"), R(L.CLOCK, "clock"), R(CLK3, "clock")], [110, 300, 860, 860], 1.6),
  meter: L.CAMS.meter,
  chkM: L.fit([R(L.ORACLE, "miniVend"), R(L.METER, "thresholdMeter"), R(L.COIN, "oddCoin"), R(L.CLOCK, "clock")], [110, 300, 860, 860], 1.6),
  center: L.CAMS.center,
  nodesL: L.fit([R(L.KNIFE, "knifeSwitch"), R(L.TWAP, "twapRecorder"), R(L.ORACLE, "miniVend"), R(L.METER, "thresholdMeter"), ...L.ZONE_RECTS.towers], [70, 250, 1120, 860], 1.4),
  pullL: L.fit([R(L.VEND, "vending"), R(PULL0, "person"), R(L.ATK.vend, "person")], [120, 300, 1100, 860], 1.4),
  dock: L.CAMS.dock,
  dockL: L.fit(L.ZONE_RECTS.dock, [60, 300, 900, 860], 1.4),
  centerRight: L.CAMS.centerRight,
};
const S = (cam, p) => toScreen(CAMS[cam], p);
if (process.env.DEBUG) {
  console.log("sorter in", S("dock", A.so.in), "force end", S("dock", FE), "Q0", S("dock", at(Q0)), "Q1", S("dock", at(Q1)), "fp", fp.map((o) => S("dock", at(o))));
  console.log("clk3", S("chk", at(CLK3)), "pull0", S("pullL", at(PULL0)), "mag", S("pullL", at(MAG)));
}

// ---------------------------------------------------------------- screen overlays
const CB = { x: 910, y: 300, w: 940 };
const rowY = (c, i, h = 50) => c.y + 24 + 56 + h * i + h / 2;
const ok = (id) => `<span class="c-chip ok hide" id="${id}">✓</span>`;
const cardB = `<div class="k-code sm hide" id="cardB" style="left:${CB.x}px;top:${CB.y}px;width:${CB.w}px">
  <div class="c-head">读取链下预言机 · 四项检查</div>
  <div class="c-row" id="cb0">(, int256 answer, , uint256 updatedAt, )</div>
  <div class="c-row" id="cb1">    = feed.latestRoundData();</div>
  <div class="c-row dim" id="cb2">require(answer > 0);${ok("cb2k")}</div>
  <div class="c-row dim" id="cb3">require(block.timestamp - updatedAt <= MAX_DELAY);${ok("cb3k")}</div>
  <div class="c-row dim" id="cb4">require(answer > MIN_BOUND && answer < MAX_BOUND);${ok("cb4k")}<span class="c-chip x hide" id="cb4x">✗ 撞下限</span></div>
  <div class="c-row dim" id="cb5">uint8 dec = feed.decimals();${ok("cb5k")}</div>
</div>`;
const CC = { x: 930, y: 300, w: 930 };
const cardC = `<div class="k-code sm hide" id="cardC" style="left:${CC.x}px;top:${CC.y}px;width:${CC.w}px">
  <div class="c-head">L2 · 先查排序器在线状态</div>
  <div class="c-row" id="cc0">(, int256 status, uint256 startedAt, , )</div>
  <div class="c-row" id="cc1">    = uptimeFeed.latestRoundData();</div>
  <div class="c-row" id="cc2">require(status == 0, "sequencer down");</div>
  <div class="c-row" id="cc3">require(block.timestamp - startedAt > GRACE);<span class="c-cm"> // 例：1 小时</span></div>
</div>`;
// four traps list (right side, L15–L23)
const TRAPS = [
  ["<code>latestAnswer</code> 判断新鲜", `<span class="tr-r" id="tr0a">✗ 无时间戳</span><span class="tr-g" id="tr0b">→ <code>latestRoundData</code> ✓</span>`],
  ["延迟上限按喂价心跳", `<span class="tr-r" id="tr1a">✗ 所有资产同一个上限</span>`],
  ["喂价失效 · 降级路径", `<span class="tr-g" id="tr2a">try / catch → 备用源 或 暂停</span>`],
  ["拉取式预言机", `<span class="tr-g" id="tr3a">自己查时间戳和置信区间</span>`],
];
const trapCard = `<div class="trc hide" id="trc"><div class="tr-h">四个读取陷阱</div>${TRAPS.map((r, i) => `<div class="tr-row" id="tr${i}"><span class="tr-n">${i + 1}</span><div class="tr-b"><div class="tr-t" id="tr${i}t">${r[0]}</div><div class="tr-s">${r[1]}</div></div></div>`).join("")}</div>`;
// LUNA dot card (L10): 1 dot real vs 10 dots feed
const dots = (n, cls) => Array.from({ length: n }, () => `<i class="${cls}"></i>`).join("");
const dotCard = `<div class="dotc hide" id="dotc"><div class="dr"><span class="dl">市场价 0.01</span><span class="dd" id="dd0">${dots(1, "d0")}</span></div><div class="dr"><span class="dl">喂价 0.10</span><span class="dd" id="dd1">${dots(10, "d1")}</span></div><div class="dx">高估约 × 10</div></div>`;
// event / source cards (top right, under the pills)
const ev = (id, html, top = 120) => `<div class="evc hide" id="${id}" style="top:${top}px">${html}</div>`;
const evHtml = ev("ev-luna", `2022 年 5 月 · <b>LUNA</b> 崩盘`) +
  ev("ev-venus", `<b>Venus</b> · BNB Chain`) +
  ev("ev-loss", `协议损失约 <b class="r">1100 万美元</b><span class="gtag">公开报道</span>`, 210) +
  ev("src-cl", `<span class="gtag">来源</span>Chainlink API 文档`) +
  ev("src-pyth", `<span class="gtag">来源</span>Pyth 文档`) +
  ev("ev-mantle", `<b>Mantle</b> · 排序器宕机时从 L1 强制提交`) +
  ev("src-l2b", `<span class="gtag">来源</span>L2BEAT · 截至 2026 年 11 月`, 210) +
  ev("src-cl2", `<span class="gtag">来源</span>Chainlink 文档`);
// red dashed leaders: code row → scene object
const ov = [];
const lead = (id, P0, P3, bend = 160) => { ov.push(dashCurve(id, P0, P3, { c1: [P0[0] - bend, P0[1] + 20], c2: [P3[0] + 120, P3[1] - bend * 0.6] }).svg); };
lead("cv-hb", [CB.x - 4, rowY(CB, 3)], S("chk", A.ck.center), 160);
lead("cv-bc", [CC.x - 4, rowY(CC, 2)], S("dockL", up(A.bc.top, 30)), 140);
const ovSvg = `<svg id="ovl" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">${ov.join("")}</svg>`;

// term cards (kit/screen.mjs)
const TC = termCards([
  { id: "deg", t: "降级路径", d: "主价格源失效时切换备用源或暂停", at: w("降级路径", 19) },
  { id: "ci", t: "置信区间", d: "价格可能的误差范围", at: w("置信区间", 23) },
  { id: "seq", t: "排序器", d: "L2 上负责排序和打包交易的节点", at: w("排序器", 24) },
  { id: "force", t: "强制提交", d: "绕过排序器、从 L1 直接提交交易", at: w("强制提交", 27) },
]);

// ---------------------------------------------------------------- times
const TM = {
  four: w("四项检查", 0),
  pos1: w("大于0", 1),
  fresh2: w("时效", 2), hb2: w("心跳", 2),
  rng3: w("上下限", 3), band3: w("区间", 3),
  dec4: w("精度", 4), no8: w("写死8", 4),
  why5: w("为什么", 5), case5: w("案例", 5),
  luna6: w("LUNA", 6),
  floor7: w("最低价", 7), p010: w("0.10", 7),
  fall8: w("跌到", 8), stop8: w("停在下限", 8),
  ex9: w("0.01", 9), demo9: w("示例", 9),
  ret10: w("返回", 10), over10: w("高估", 10),
  pos11: w("价格是正的", 11), ts11: w("时间戳", 11), pass11: w("全部通过", 11),
  venus12: w("Venus", 12), val12: w("估值", 12),
  buy13: w("低价买入", 13), dep13: w("存进去", 13), brw13: w("借出", 13),
  loss14: w("1100", 14),
  traps15: w("四个读取陷阱", 15),
  la16: w("latestAnswer", 16),
  nots17: w("不含时间戳", 17), lrd17: w("latestRoundData", 17),
  hb18: w("心跳不同", 18), same18: w("同一个", 18),
  deg19: w("降级路径", 19),
  try20: w("try", 20), bak20: w("备用价格源", 20), pause20: w("暂停", 20), rb20: w("全部回滚", 20),
  pull21: w("拉取式预言机", 21), sig21: w("签名价格", 21),
  pick22: w("挑一个", 22), fav22: w("有利", 22),
  pyth23: w("Pyth", 23), ts23: w("时间戳", 23), ci23: w("置信区间", 23),
  l2_24: w("L2", 24), seq24: w("排序器", 24), on24: w("在线", 24),
  down25: w("宕机", 25), stuck25: w("上不了链", 25), stop25: w("停在宕机前", 25),
  rec26: w("恢复后", 26), bots26: w("清算机器人", 26), rush26: w("涌入", 26),
  l1_27: w("L1", 27), first27: w("先机", 27),
  l2b28: w("L2BEAT", 28), mantle28: w("Mantle", 28), h12: w("12小时", 28),
  cl29: w("Chainlink", 29), up29: w("在线状态", 29),
  grace30: w("宽限期", 30), h1_30: w("1小时", 30), ex30: w("示例", 30),
  in31: w("宽限期内", 31), pause31: w("暂停", 31), liq31: w("清算", 31), brw31: w("新借款", 31),
};
// walks (world canvas points)
const P = (o) => at(o).map((x) => f(x));
const subPath = [P(rel(L.ATK.vend, 120, 60))];
const slipTo = (() => { const a = A.vm.coinSlot, b = up(at(rel(L.ATK.vend, 120, 60)), 120); return [f(a[0] - b[0] - 62), f(a[1] - b[1] + 2)]; })();
const lcTo = (() => { const k = CAMS.center.scale, a = A.vm.coinSlot, b = up(A.atk.center, 10); return [f((a[0] - b[0]) * k), f((a[1] - b[1]) * k)]; })();
const qIn = A.so.in;

const GROWN = ["luna", "atkw", "subw", "mg", "ck2", "ck3", "tlk", "fpw0", "fpw1"];
const html = `<template>
  <style>
${kitCss()}
${screenCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    .gtag { display: inline-block; font-size: 28px; font-weight: 800; color: #6d685e; background: #ebe6dc; border-radius: 8px; padding: 1px 10px 3px; margin-left: 10px; vertical-align: 2px; }
    .k-code.sm .c-row { font-size: 25px; white-space: pre; }
    .k-code .c-row.dim { color: #8f887b; }
    .k-code .c-chip.ok { background: #1f9d55; }
    .k-code .c-chip.x { background: #e0453a; font-family: "Noto Sans SC", sans-serif; }
    .stopb { display: block; width: 16px; height: 22px; background: #1c1c1c; border: 3px solid #fffdf8; border-radius: 4px; }
    .evc { position: absolute; right: 48px; max-width: 760px; background: #ffffff; border-radius: 14px; padding: 12px 24px 14px; font-size: 34px; font-weight: 700;
      box-shadow: 0 8px 20px rgba(70,60,40,0.12); white-space: nowrap; }
    .evc b { color: #1d93ba; font-weight: 900; }
    .evc b.r { color: #e0453a; }
    .evc .gtag:first-child { margin: 0 12px 0 0; }
    .dotc { position: absolute; left: 1330px; top: 230px; width: 540px; background: #fffdf8; border-radius: 16px; padding: 18px 24px 20px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
    .dotc .dr { display: flex; align-items: center; height: 56px; }
    .dotc .dl { width: 180px; font-size: 28px; font-weight: 800; white-space: nowrap; }
    .dotc .dd { display: flex; gap: 5px; }
    .dotc i { display: block; width: 24px; height: 24px; border-radius: 50%; box-sizing: border-box; }
    .dotc .d0 { background: #e2b33c; border: 2px solid #a87d17; }
    .dotc .d1 { background: #f08a80; border: 2px solid #c23a30; }
    .dotc .dx { margin-top: 8px; font-size: 40px; font-weight: 900; color: #e0453a; white-space: nowrap; }
    .lcs { display: flex; gap: 4px; }
    .lcoin { display: block; width: 26px; height: 26px; border-radius: 50%; background: #f0c04a; border: 3px solid #b98318; box-sizing: border-box; }
    .trc { position: absolute; left: 1180px; top: 300px; width: 690px; background: #ffffff; border-radius: 18px; padding: 20px 28px 22px; box-shadow: 0 12px 28px rgba(70,60,40,0.12); }
    .tr-h { font-size: 34px; font-weight: 900; height: 52px; white-space: nowrap; }
    .tr-row { display: flex; gap: 16px; align-items: flex-start; min-height: 96px; padding-top: 10px; border-top: 2px dashed #e2ddd3; }
    .tr-n { flex: none; width: 42px; height: 42px; border-radius: 10px; background: #8f887b; color: #fff; font: 800 28px/42px "Noto Sans SC", sans-serif; text-align: center; }
    .tr-row.on .tr-n { background: #1d93ba; }
    .tr-b { opacity: 0; }
    .tr-t { font-size: 30px; font-weight: 900; white-space: nowrap; line-height: 1.35; }
    .tr-s { font-size: 26px; font-weight: 700; white-space: nowrap; line-height: 1.4; }
    .tr-s span { opacity: 0; margin-right: 10px; }
    .tr-r { color: #e0453a; }
    .tr-g { color: #1f9d55; }
    .trc code, .evc code { font-family: "JetBrains Mono", monospace; font-weight: 800; }
    #lm-th line, #lm-th path { stroke: #e0453a !important; stroke-width: 6 !important; stroke-dasharray: none !important; }
    #ttl-card .t-main { font-size: 88px; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      ${cardB}${cardC}${trapCard}${dotCard}${evHtml}${ovSvg}${TC.html}
      ${pills(5, { sections: SCRIPT.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">⑤ 安全读价</div><div class="t-sub">四项检查 · 四个陷阱 · L2 排序器</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E5.runtimeExtJs()}
${E7.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const X1 = window.KITX01, X5 = window.KITX05, X8 = window.KITX08;
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const flash = (sel, t, n, lo) => tl.fromTo(sel, { opacity: 1 }, { opacity: lo == null ? 0.25 : lo, duration: 0.16, yoyo: true, repeat: (n || 3) * 2 - 1, ease: "power1.inOut", immediateRender: false }, t);
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      ${JSON.stringify(GROWN)}.forEach((id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); });
      const rowOn = (id, t) => tl.to("#" + id, { color: "#1c1c1c", duration: 0.25 }, t);
      const trapOn = (i, t) => { tl.set("#tr" + i, { className: "tr-row on" }, t); fadeIn("#tr" + i + " .tr-b", t, 0.3); };
      const sub = (id, t) => fadeIn("#" + id, t, 0.3);
      ${TC.js}

      // ===== 0–1.6 · title card over the oracle close-up (seg4's last framing)
      KIT.camSet(tl, CAMS.oracle);
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.15);
      // ===== L0 four checks: oracle on the left, code card B on the right (rows grey)
      KIT.cam(tl, ${f(LS[0] - 0.1)}, CAMS.chk, 1.2);
      pop("#lb-or", ${f(LS[0] + 0.3)}, 0.3);
      pop("#cardB", ${f(TM.four - 0.2)}, 0.35);
      // ===== L1 answer > 0
      rowOn("cb2", ${f(TM.pos1 - 0.3)}); pop("#cb2k", ${f(TM.pos1)}, 0.25);
      // ===== L2 freshness ≤ this feed's heartbeat → red leader to the clock
      rowOn("cb3", ${f(TM.fresh2)}); pop("#cb3k", ${f(TM.fresh2 + 0.3)}, 0.25);
      KIT.draw(tl, "cv-hb", ${f(TM.hb2 - 0.3)}, 0.6); pop("#lb-hb", ${f(TM.hb2)}, 0.3);
      KIT.clock(tl, "ck", ${f(TM.hb2)}, 1.2, 60);
      // ===== L3 bounds: two stop blocks on the dial
      out("#cv-hb", ${f(LS[3] + 0.4)}, 0.2);
      rowOn("cb4", ${f(TM.rng3)}); pop("#cb4k", ${f(TM.rng3 + 0.3)}, 0.25);
      pop("#stopL-i", ${f(TM.band3 - 0.3)}, 0.25); pop("#stopR-i", ${f(TM.band3 - 0.1)}, 0.25);
      X1.needle(tl, "or", ${f(TM.band3)}, -40, 0.4); X1.needle(tl, "or", ${f(TM.band3 + 0.45)}, 30, 0.5); X1.needle(tl, "or", ${f(TM.band3 + 1.0)}, 0, 0.4);
      // ===== L4 decimals
      rowOn("cb5", ${f(TM.dec4)}); pop("#cb5k", ${f(TM.dec4 + 0.3)}, 0.25);
      pop("#lb-dec", ${f(TM.no8 - 0.3)}, 0.3);
      // ===== L5 why bounds → pan to the floor meter
      out("#cardB, #lb-dec, #lb-hb, #lb-or", ${f(LS[5] - 0.1)}, 0.25);
      KIT.cam(tl, ${f(TM.why5)}, CAMS.meter, 1.3);
      // ===== L6 LUNA collapse
      pop("#ev-luna", ${f(TM.luna6 - 0.3)}, 0.3);
      grow("luna", ${f(LS[6])}, 0.45); pop("#lb-luna", ${f(TM.luna6)}, 0.3);
      // ===== L7 floor 0.10
      flash("#lm-th", ${f(TM.floor7)}, 2, 0.3); pop("#lb-floor", ${f(TM.p010 - 0.2)}, 0.3);
      // ===== L8 market price falls far below, level stops at the floor
      fadeIn("#mkt", ${f(TM.fall8 - 0.2)}, 0.2);
      tl.fromTo("#mkt-p", { strokeDashoffset: 300 }, { strokeDashoffset: 0, duration: 1.0, ease: "power2.in", immediateRender: false }, ${f(TM.fall8 - 0.2)});
      pop("#lb-mkt", ${f(TM.fall8)}, 0.3);
      X5.fill(tl, "lm", ${f(TM.fall8 + 0.2)}, 1, 1.4, "power2.in");
      // ===== L9 example 0.01
      pop("#lb-001", ${f(TM.ex9 - 0.2)}, 0.3);
      // ===== L10 feed still ≈ 0.10, collateral overvalued ~10×
      out("#lb-floor", ${f(TM.ret10 - 0.3)}, 0.2); pop("#lb-feed", ${f(TM.ret10)}, 0.3);
      pop("#dotc", ${f(TM.ret10 + 0.3)}, 0.35); out("#lb-mkt, #lb-001", ${f(TM.ret10)}, 0.2);
      tl.fromTo("#dd1 i", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.15, stagger: 0.07, immediateRender: false }, ${f(TM.over10 - 0.4)});
      // ===== L11 positive + fresh pass, the floor hit is not caught → card B returns
      out("#dotc, #ev-luna, #lb-001, #mkt, #lb-feed", ${f(LS[11] - 0.15)}, 0.25);
      KIT.cam(tl, ${f(LS[11] - 0.1)}, CAMS.chkM, 1.1);
      pop("#cardB", ${f(LS[11] + 0.6)}, 0.3);
      flash("#cb2k", ${f(TM.pos11)}, 2, 0.2); flash("#cb3k", ${f(TM.ts11)}, 2, 0.2);
      tl.to("#cb2, #cb3", { backgroundColor: "#e3f4ea", duration: 0.2 }, ${f(TM.pass11)});
      tl.set("#cb4k", { opacity: 0 }, ${f(TM.pass11 + 0.3)}); pop("#cb4x", ${f(TM.pass11 + 0.3)}, 0.3);
      tl.to("#cb4", { backgroundColor: "#fdeae7", duration: 0.2 }, ${f(TM.pass11 + 0.3)});
      // ===== L12 Venus on BNB Chain values LUNA at ≈ 0.1 → pan to the lending contract
      out("#cardB, #lb-luna", ${f(LS[12] - 0.15)}, 0.25);
      KIT.cam(tl, ${f(LS[12] - 0.1)}, CAMS.center, 1.4);
      pop("#ev-venus", ${f(TM.venus12)}, 0.3);
      pop("#lb-val", ${f(TM.val12 - 0.5)}, 0.3);
      // ===== L13 buy cheap, deposit, borrow other assets (abstract)
      grow("atkw", ${f(LS[13] - 0.1)}, 0.45); pop("#lcs", ${f(TM.buy13)}, 0.3); pop("#lb-cheap", ${f(TM.buy13)}, 0.3);
      tl.to("#lcs", { x: ${lcTo[0]}, y: ${lcTo[1]}, scale: 0.4, duration: 0.6, ease: "power2.in" }, ${f(TM.dep13)});
      out("#lcs", ${f(TM.dep13 + 0.55)}, 0.1); out("#lb-cheap", ${f(TM.dep13)}, 0.2);
      X1.dispense(tl, "vm", ${f(TM.brw13 - 0.1)}, { n: 4, gap: 0.12 });
      pop("#lb-borrow", ${f(TM.brw13 + 0.2)}, 0.3);
      // ===== L14 ~11M loss (public reports)
      pop("#ev-loss", ${f(TM.loss14 - 0.3)}, 0.3);
      // ===== L15 four read traps → back to the oracle, list card on the right
      out("#ev-venus, #lb-val, #lb-borrow, #atkw", ${f(LS[15] - 0.2)}, 0.25); out("#ev-loss", ${f(LS[15] + 0.6)}, 0.25);
      KIT.cam(tl, ${f(LS[15] - 0.2)}, CAMS.chk, 1.4);
      pop("#trc", ${f(TM.traps15)}, 0.35); pop("#lb-or", ${f(TM.traps15 + 0.6)}, 0.3);
      // ===== L16 latestAnswer
      trapOn(0, ${f(TM.la16 - 0.2)});
      // ===== L17 no timestamp → latestRoundData
      sub("tr0a", ${f(TM.nots17)}); sub("tr0b", ${f(TM.lrd17)}); pop("#src-cl", ${f(LS[17] + 0.2)}, 0.3);
      // ===== L18 each feed's heartbeat differs; no single delay cap
      out("#src-cl", ${f(LS[18] - 0.1)}, 0.2);
      trapOn(1, ${f(LS[18])});
      grow("ck2", ${f(TM.hb18 - 0.4)}, 0.4); grow("ck3", ${f(TM.hb18 - 0.2)}, 0.4);
      pop("#lb-ck1", ${f(TM.hb18)}, 0.25); pop("#lb-ck2", ${f(TM.hb18 + 0.15)}, 0.25); pop("#lb-ck3", ${f(TM.hb18 + 0.3)}, 0.25);
      KIT.clock(tl, "ck", ${f(TM.hb18)}, 1.6, 60); KIT.clock(tl, "ck2", ${f(TM.hb18)}, 1.6, 240); KIT.clock(tl, "ck3", ${f(TM.hb18)}, 1.6, 720);
      pop("#lb-same", ${f(TM.same18 - 0.2)}, 0.3); sub("tr1a", ${f(TM.same18)});
      // ===== L19 fallback path → oracle station with its nodes
      out("#lb-ck1, #lb-ck2, #lb-ck3, #lb-same, #lb-or", ${f(LS[19] - 0.1)}, 0.2);
      out("#ck2, #ck3", ${f(LS[19])}, 0.3);
      KIT.cam(tl, ${f(LS[19] - 0.1)}, CAMS.nodesL, 1.3);
      trapOn(2, ${f(TM.deg19)});
      // ===== L20 try/catch: a node fails, switch to the backup source, or pause; liquidations don't all revert
      KIT.broke(tl, "tw1", ${f(LS[20])}, { badge: true, ghost: 0.4 }); pop("#lb-down", ${f(LS[20] + 0.1)}, 0.3);
      KIT.broke(tl, "or", ${f(TM.try20)}, { badge: false, ghost: 0.5 });
      sub("tr2a", ${f(TM.try20)});
      fadeIn("#ptww", ${f(TM.bak20 - 0.3)}, 0.3); pop("#lb-bak", ${f(TM.bak20)}, 0.3);
      fadeIn("#p-tw-flow", ${f(TM.bak20)}, 0.2); X1.dash(tl, ["p-tw-flow"], ${f(TM.bak20)}, 3.0, -210);
      KIT.toggle(tl, "kn", ${f(TM.pause20)}, false, 0.4); pop("#lb-pause", ${f(TM.pause20)}, 0.3);
      pop("#lb-norb", ${f(TM.rb20 - 0.3)}, 0.3);
      KIT.toggle(tl, "kn", ${f(LE[20] - 0.5)}, true, 0.4);
      // ===== L21 pull oracle: submitter carries signed prices to the contract
      out("#lb-down, #lb-bak, #lb-pause, #lb-norb, #p-tw-flow", ${f(LS[21] - 0.15)}, 0.2);
      KIT.fixed(tl, "tw1", ${f(LS[21])}); KIT.fixed(tl, "or", ${f(LS[21])}); out("#ptww", ${f(LS[21])}, 0.3);
      KIT.cam(tl, ${f(LS[21] - 0.1)}, CAMS.pullL, 1.4);
      trapOn(3, ${f(TM.pull21)});
      grow("subw", ${f(LS[21] + 0.6)}, 0.45); pop("#lb-sub", ${f(TM.sig21)}, 0.3);
      X1.walk(tl, "subw", ${f(TM.sig21 + 0.2)}, 1.4, ${JSON.stringify(subPath)});
      // ===== L22 picks the favourable (red) update and hands it in
      out("#lb-sub", ${f(TM.pick22 - 0.1)}, 0.2); pop("#lb-fav", ${f(TM.pick22)}, 0.3);
      tl.to("#slipR", { x: ${slipTo[0]}, y: ${slipTo[1]}, duration: 0.7, ease: "power2.inOut" }, ${f(TM.fav22)});
      // ===== L23 Pyth docs: check timestamp + confidence interval
      out("#lb-fav", ${f(LS[23])}, 0.2);
      pop("#src-pyth", ${f(TM.pyth23 - 0.2)}, 0.3);
      grow("mg", ${f(TM.pyth23)}, 0.45);
      sub("tr3a", ${f(TM.ts23)}); pop("#lb-ts", ${f(TM.ts23)}, 0.3); pop("#lb-ci", ${f(TM.ci23)}, 0.3);
      // ===== L24 L2 sequencer → pan to the dock
      out("#trc, #src-pyth, #lb-ts, #lb-ci, #subw, #mg", ${f(LS[24] - 0.2)}, 0.25);
      KIT.cam(tl, ${f(LS[24] - 0.2)}, CAMS.dock, 1.6);
      pop("#lb-so", ${f(TM.seq24)}, 0.3); pop("#lb-l1", ${f(TM.seq24 + 0.3)}, 0.3);
      pop("#lb-on", ${f(TM.on24 - 0.2)}, 0.3);
      fadeIn("#so-belt-0, #so-belt-1", ${f(LS[24])}, 0.1); X1.dash(tl, ["so-belt-0", "so-belt-1"], ${f(LS[24])}, ${f(TM.down25 - LS[24])}, -${f((TM.down25 - LS[24]) * 40)});
      // ===== L25 down: belt stops, beacon red, price frozen
      tl.set("#lb-on", { opacity: 0 }, ${f(TM.down25)}); pop("#lb-off", ${f(TM.down25)}, 0.3);
      KIT.beacon(tl, "bc", ${f(TM.down25)}, ${f(LS[26] + 0.6 - TM.down25)}, 0.9);
      pop("#lb-stuck", ${f(TM.stuck25 - 0.2)}, 0.3);
      // ===== L26 recovery: bots and users rush in at once
      out("#lb-stuck", ${f(LS[26] - 0.1)}, 0.2);
      tl.set("#lb-off", { opacity: 0 }, ${f(LS[26] + 0.6)}); pop("#lb-on2", ${f(LS[26] + 0.6)}, 0.3);
      fadeIn("#qbw, #qpv0, #qpv1", ${f(TM.bots26 - 0.3)}, 0.3);
      X1.walk(tl, "qb", ${f(TM.bots26 - 0.2)}, 2.6, [${JSON.stringify(P(Q1))}], "power1.inOut");
      X1.walk(tl, "qpw0", ${f(TM.bots26)}, 2.6, [${JSON.stringify(P(GA(-430 + QOFF[0][0], 70 + QOFF[0][1])))}], "power1.inOut");
      X1.walk(tl, "qpw1", ${f(TM.bots26 + 0.15)}, 2.6, [${JSON.stringify(P(GA(-430 + QOFF[1][0], 70 + QOFF[1][1])))}], "power1.inOut");
      X8.botLamp(tl, "qb-0", ${f(TM.bots26)}, 1.6, 2, true);
      // ===== L27 a few who can force-include via L1 get there first
      grow("fpw0", ${f(LS[27])}, 0.35); grow("fpw1", ${f(LS[27] + 0.2)}, 0.35);
      fadeIn("#pf-flow", ${f(LS[27])}, 0.2); X1.dash(tl, ["pf-flow"], ${f(LS[27])}, 2.4, -170);
      pop("#lb-force", ${f(TM.l1_27)}, 0.3); pop("#lb-first", ${f(TM.first27 - 0.2)}, 0.3);
      // ===== L28 L2BEAT: Mantle, force inclusion waits up to 12 h
      out("#lb-force, #lb-first, #pf-flow", ${f(LS[28] - 0.1)}, 0.2);
      pop("#ev-mantle", ${f(TM.mantle28 - 0.3)}, 0.3); pop("#src-l2b", ${f(TM.l2b28)}, 0.3);
      KIT.clock(tl, "dck", ${f(TM.h12 - 1.2)}, 2.0, 720); pop("#lb-12h", ${f(TM.h12 - 0.2)}, 0.3);
      // ===== L29 read Chainlink's sequencer uptime feed → card C
      out("#ev-mantle, #src-l2b, #lb-12h, #lb-on2, #lb-so, #lb-l1", ${f(LS[29] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[29] - 0.1)}, CAMS.dockL, 1.1);
      pop("#cardC", ${f(LS[29] + 0.6)}, 0.35); pop("#src-cl2", ${f(TM.cl29)}, 0.3);
      KIT.draw(tl, "cv-bc", ${f(TM.up29)}, 0.6); pop("#lb-on2", ${f(TM.up29 + 0.4)}, 0.3);
      // ===== L30 grace period, e.g. 1 hour (example)
      tl.to("#cc3", { backgroundColor: "#dff1f7", duration: 0.2 }, ${f(TM.grace30)}); out("#lb-on2", ${f(TM.grace30 - 0.2)}, 0.2);
      grow("tlk", ${f(TM.grace30)}, 0.45); pop("#lb-grace", ${f(TM.h1_30 - 0.2)}, 0.3);
      X1.countdown(tl, "tlk", ${f(TM.h1_30)}, 1.6, 0.6);
      // ===== L31 within the grace period: pause liquidations and new borrowing → static on centerRight
      out("#cardC, #src-cl2, #cv-bc, #lb-grace", ${f(LS[31] - 0.4)}, 0.2);
      KIT.cam(tl, ${f(LS[31] - 0.4)}, CAMS.centerRight, 1.3);
      fadeIn("#botsw", ${f(LS[31] - 0.3)}, 0.3);
      X1.walk(tl, "bots", ${f(LS[31] - 0.2)}, 1.6, [${JSON.stringify(P(L.LIQ.stop))}], "power2.out");
      KIT.toggle(tl, "kn", ${f(TM.pause31 - 0.2)}, false, 0.4);
      pop("#lb-gp", ${f(TM.pause31)}, 0.3);
      X8.botScr(tl, "bots-0", ${f(TM.liq31)}, "暂停", true);
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes");
console.log(TC.report);
