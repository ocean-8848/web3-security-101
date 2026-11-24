// Generates compositions/story.html for ep03/seg2「② 调用上下文」(one isometric world, one camera).
// Run: node src/build-story.mjs
// Objects: ../../../kit/objects.mjs + ../../kit-ext/objects-ext.mjs (import only) + ./props.mjs. Layout: ./layout.mjs.
import fs from "node:fs";
import { at, Wp, f, camAt, toScreen, gridSvg, worldSvg, isoDefs, wlab, wpin, dashCurve, BADGE, CHECK, kitCss, runtimeJs, rbox } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import { contractMachine, slotCabinet, manual, runtimeExtJs } from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { wordAt as _wa } from "../../../kit/timing.mjs";
import { termCss, termHtml, termJs } from "../../kit-ext/termcards.mjs";
import { road, groundArrow, track, letter, coin, ring, counter, stanchions, heldPaper } from "./props.mjs";
import * as L from "./layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
// 术语卡（RETROFIT-deps 第 2 节）
const TERMS = [
  { id: 'tm1', top: 466, term: '代理合约', def: '保存状态并把调用委托给实现合约', at: _wa(T, '代理合约', { line: 17 }).start },
  { id: 'tm2', top: 760, term: '回滚', def: '撤销这次调用做过的全部状态修改', at: _wa(T, '回滚', { line: 24 }).start },
  { id: 'tm3', term: '低级 `call`', def: '直接用 `address.call` 调用地址', at: _wa(T, '低级call', { line: 25 }).start + 1.65, until: T.total - 1.2 },
];
const TOTAL = T.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const SECTIONS = SCRIPT.sections;
const LN = T.lines.map((_, i) => lineAt(T, i));
const w = (term, line, nth = 0) => wordAt(T, term, { line, nth });

// ---------------------------------------------------------------- objects
const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const A = {};

// machines + cabinets
const fills = {
  A: { 0: [{ bytes: 20, color: "teal" }, { bytes: 1, color: "green" }], 1: [{ bytes: 12, color: "ink" }], 2: [{ bytes: 32, color: "gray" }] },
  B: { 0: [{ bytes: 20, color: "teal" }, { bytes: 8, color: "ink" }], 1: [{ bytes: 32, color: "gray" }], 2: [{ bytes: 16, color: "teal" }] },
  C: { 0: [{ bytes: 20, color: "teal" }], 1: [{ bytes: 32, color: "gray" }] },
};
for (const k of ["A", "B", "C"]) {
  const m = contractMachine(L.MACH[k], { id: "m" + k, name: k, pipe: L.PIPE.len, pipeZ: L.PIPE.z });
  A["m" + k] = m.anchors; add(L.MACH[k], m.svg);
  const c = slotCabinet(L.CAB[k], { id: "cab" + k, ...L.CAB_OPTS, fill: fills[k] });
  A["cab" + k] = c.anchors; add(L.CAB[k], c.svg);
}
// user side
const user = O.person(L.USER, { id: "user", role: "signer" }); A.user = user.anchors; add(L.USER, user.svg);
const lap = O.laptop(L.LAPTOP, { id: "lap" }); A.lap = lap.anchors; add(L.LAPTOP, lap.svg);
const key = O.padlock(L.KEY, { id: "key" }); A.key = key.anchors; add(L.KEY, key.svg);
{ // EIP-7702 delegated small machine behind the user (scaled)
  const D = L.DELEG, m = contractMachine({ u: D.u, v: D.v }, { id: "mD", name: "代码", tone: "light" });
  const [ox, oy] = at(D);
  const tf = (p) => [ox + (p[0] - ox) * D.k, oy + (p[1] - oy) * D.k];
  A.mD = { top: tf(m.anchors.top), front: tf(m.anchors.front), center: tf(m.anchors.center) };
  add(D, `<g transform="translate(${f(ox)},${f(oy)}) scale(${D.k}) translate(${f(-ox)},${f(-oy)})">${m.svg}</g>`);
}
const mag1 = O.magnifier(L.MAG1, { id: "mag1", z: 60 }); A.mag1 = mag1.anchors; add(L.MAG1, mag1.svg, 300);
const mag2 = O.magnifier(L.MAG2, { id: "mag2", z: 60 }); A.mag2 = mag2.anchors; add(L.MAG2, mag2.svg, 300);
// chain
const chain = O.chain({ u: L.CHAIN.u, v: L.CHAIN.v }, { id: "chain", n: L.CHAIN.n });
const lastB = { u: L.CHAIN.u + 180, v: L.CHAIN.v };
const chainHi = `<g id="chain-hi" opacity="0">${rbox(lastB, -50, 50, -50, 50, 0, 100, 10, { f: "#c9f0ff", s: "#a5e3f7", t: "#effbff", st: "#2aa3c9" }, { sw: 3 })}</g>`;
A.chain = chain.anchors; add({ u: L.CHAIN.u, v: L.CHAIN.v }, chain.svg + chainHi);
// metaphor props
const ctr = counter("ctr", L.COUNTER); A.ctr = ctr.anchors; add(L.COUNTER, ctr.svg);
add(L.STANCH[0], stanchions("stn", L.STANCH[0], L.STANCH[1]), 200);
items.sort((a, b) => a.y - b.y);

// ground layer: road, tracks, arrows, ring, coins
let ground = road(L.ROAD);
L.TRACK.v.forEach((v, i) => { ground += track("tr" + i, L.TRACK.u0, L.TRACK.u1, v); });
const RM = L.ROAD.mid;
const ARW = [[L.LAPTOP.u + 160, -130], [L.MACH.A.u + 130, L.MACH.B.u - 110], [L.MACH.B.u + 130, L.MACH.C.u - 110]];
ARW.forEach(([a, b], i) => { ground += groundArrow("ar" + i, a, b, RM); });
ground += ring("ringC", L.MACH.C, 230);
ground += `<g id="coins" opacity="0">${[0, 1, 2, 3, 4].map((i) => coin({ u: L.MACH.B.u + 230 + i * 52, v: -60 })).join("")}</g>`;

// top layer: manual (B's), clerk, letters
const man = manual(L.MANUAL_HOME, { id: "man", title: "B 的代码", sub: "规程手册", pageTitle: "§ B 的规程", pageText: "清空 0 号抽屉" });
A.man = man.anchors;
const clerk = O.person(L.CLERK0, { id: "clerk", role: "engineer", scale: 0.85 });
A.clerk = clerk.anchors;
const clerkSvg = `<g id="clk">${clerk.svg}<g id="clk-paper" opacity="0">${heldPaper(L.CLERK0, 0.85)}</g></g>`;
const LET = {
  eL1: { o: L.OUT(L.MACH.A), z: 14 },
  e7: { o: { u: L.LAPTOP.u, v: L.LAPTOP.v - 20 }, z: 70 },
  eT1: { o: { u: L.TRACK.u0 + 80, v: L.TRACK.v[0] }, z: 10 },
  eT3: { o: { u: L.TRACK.u0 + 80, v: L.TRACK.v[2] }, z: 10 },
  eR: { o: L.OUT(L.MACH.B), z: 14 },
  eEO: { o: { u: L.LAPTOP.u, v: L.LAPTOP.v - 20 }, z: 70 },
};
const letters = Object.entries(LET).map(([id, q]) => letter(id, q.o, q.z)).join("");
const base = (id) => Wp(LET[id].o.u, LET[id].o.v, LET[id].z);
const dl = (id, P) => { const b = base(id); return [f(P[0] - b[0]), f(P[1] - b[1])]; };
const W3 = (u, v, z = 0) => Wp(u, v, z);
const MV = {
  eL1_toB: dl("eL1", A.mB.slot),
  e7_toA: dl("e7", A.mA.slot), e7_atAout: dl("e7", W3(L.OUT(L.MACH.A).u, L.OUT(L.MACH.A).v, 14)), e7_toB: dl("e7", A.mB.slot), e7_atBout: dl("e7", W3(L.OUT(L.MACH.B).u, L.OUT(L.MACH.B).v, 14)), e7_toC: dl("e7", A.mC.slot),
  eEO_out: dl("eEO", W3(L.LAPTOP.u + 260, L.LAPTOP.v + 40, 30)),
  eT1_end: dl("eT1", W3(L.TRACK.u1 - 60, L.TRACK.v[0], 10)), eT1_slot: dl("eT1", A.mB.slot),
  eT3_end: dl("eT3", W3(L.TRACK.u1 - 60, L.TRACK.v[2], 10)), eT3_slot: dl("eT3", A.mB.slot),
  eR_toA: dl("eR", A.mA.slot),
  man_toA: (() => { const d = W3(L.MANUAL_AT_A.u - L.MANUAL_HOME.u, L.MANUAL_AT_A.v - L.MANUAL_HOME.v); return [f(d[0]), f(d[1])]; })(),
  man_toClerk: (() => { const d = W3(L.CLERK_AT_B.u - 40 - L.MANUAL_HOME.u, L.CLERK_AT_B.v - 120 - L.MANUAL_HOME.v, 90); return [f(d[0]), f(d[1])]; })(),
  man_open: (() => { const d = W3(L.OPEN_BOOK.u - L.MANUAL_HOME.u, L.OPEN_BOOK.v - L.MANUAL_HOME.v, 0); return [f(d[0]), f(d[1])]; })(),
  clk_toB: (() => { const d = W3(L.CLERK_AT_B.u - L.CLERK0.u, L.CLERK_AT_B.v - L.CLERK0.v); return [f(d[0]), f(d[1])]; })(),
  clk_back: (() => { const d = W3(L.OPEN_BOOK.u + 230 - L.CLERK0.u, 0); return [f(d[0]), f(d[1])]; })(),
};
// the manual's page anchor once it is opened on the road in front of A
const pageOpen = [A.man.page[0] + +MV.man_open[0], A.man.page[1] + +MV.man_open[1]];

// world-space connectors
const cvDeleg = dashCurve("cv-deleg", at(L.USER, 0, 0, 150), A.mD.front, { color: "#2aa3c9", c1: [at(L.USER, 0, 0, 260)[0] - 40, at(L.USER, 0, 0, 260)[1]], c2: [A.mD.front[0] + 60, A.mD.front[1] + 40] });
const cvPage = dashCurve("cv-page", pageOpen, A.cabA.drawersOpen[0], { color: "#e0453a", c1: [pageOpen[0] - 140, pageOpen[1] - 60], c2: [A.cabA.drawersOpen[0][0] - 60, A.cabA.drawersOpen[0][1] + 120] });

const world = worldSvg("wsvg", gridSvg({ u0: -3000, u1: 5200, v0: -2600, v1: 3000 }) + ground + items.map((x) => x.svg).join("\n") +
  `<g id="man-mv" opacity="0">${man.svg}</g>` + clerkSvg + letters + cvDeleg.svg + cvPage.svg, [-2400, -2600, 6400, 4600]);

// ---------------------------------------------------------------- labels (world)
let labels = "";
for (const k of ["A", "B", "C"]) {
  labels += wlab("lb-m" + k, A["m" + k].top, "合约 " + k, "hide");
  labels += wlab("lb-k" + k, at(L.MACH[k], 0, -40, 330), "科室 " + k, "lab-g hide");
}
labels += wlab("lb-code", at(L.MACH.A, 110, 60, 150), "代码", "lab-cs hide", "l");
labels += wlab("lb-store", A.cabA.top, "存储", "lab-cs hide");
labels += wlab("lb-ctl", at(L.MACH.B, 0, 0, 0).map((v, i) => v + (i ? -310 : 160)), "控制权 → B", "lab-cs hide", "l");
labels += wlab("lb-eoa", A.user.top, "外部账户 EOA", "lab-cs hide");
labels += wlab("lb-pk", at(L.KEY, -60, -40, 120), "私钥控制", "hide", "r");
labels += wlab("lb-init", W3(L.LAPTOP.u + 300, L.LAPTOP.v + 40, 30).map((v, i) => v + (i ? 30 : 0)), "能主动发起交易", "hide", "t");
labels += wlab("lb-ca", at(L.MACH.A, 0, 0, 0).map((v, i) => v + (i ? -330 : 0)), "合约账户", "lab-cs hide");
labels += wlab("lb-cc", at(L.MACH.A, 150, 120, 120), "代码控制", "hide", "l");
labels += wlab("lb-oc", [A.mA.slot[0] + 60, A.mA.slot[1] + 70], "只能被调用", "hide", "l");
labels += wlab("lb-pec", at(lastB, 0, 0, 170), "Pectra · 2025 年 5 月 · EIP-7702", "lab-cs hide");
labels += wlab("lb-asof", at(lastB, 0, 0, 170).map((v, i) => v + (i ? 18 : 0)), "截至 2026 年 11 月", "lab-g lab-sm hide", "t");
labels += wlab("lb-del", A.mD.top, "委托执行合约代码", "lab-cs hide");
labels += wlab("lb-q1", A.mag1.top, "有没有代码？", "lab-g hide");
labels += wlab("lb-q2", A.mag2.top, "msg.sender == tx.origin？", "lab-g hide");
labels += wpin("bx1", A.mag1.lens, BADGE("bx1-b", 64, "hide"));
labels += wpin("bx2", A.mag2.lens, BADGE("bx2-b", 64, "hide"));
labels += wlab("lb-nr1", [A.mag1.lens[0], A.mag1.lens[1] + 48], "不可靠", "lab-rs hide", "t");
labels += wlab("lb-nr2", [A.mag2.lens[0], A.mag2.lens[1] + 48], "不可靠", "lab-rs hide", "t");
labels += wlab("lb-user", A.user.top, "用户", "hide");
labels += wlab("lb-coin", W3(L.MACH.B.u + 334, -60, 0).map((v, i) => v + (i ? 34 : 0)), "B 转给 C · 示意", "lab-g lab-sm hide", "t");
labels += wlab("lb-this", at(L.MACH.C, 0, 230, 0).map((v, i) => v + (i ? 12 : 0)), "address(this) = C", "lab-cs hide", "t");
L.TRACK.names.forEach((n, i) => { labels += wlab("lb-tr" + i, W3(L.TRACK.lab[i], L.TRACK.v[i], 0), n, "lab-ink lab-sm hide", "c"); });
labels += wlab("lb-wB", A.cabB.top, "改 B 的存储", "lab-cs hide");
labels += wlab("lb-wA", A.cabA.top, "改 A 的存储", "lab-cs hide");
labels += wlab("lb-bman", W3(L.MANUAL_AT_A.u - 40, L.MANUAL_AT_A.v - 40, 170), "B 的代码 · 规程手册", "hide");
labels += wlab("lb-meta", at(L.MACH.A, -300, -200, 520), "比喻", "lab-g hide");
labels += wlab("lb-ctr", ctr.anchors.top, "只有一个窗口", "lab-g hide");
labels += wlab("lb-page", [pageOpen[0], pageOpen[1] - 30], "清空 0 号抽屉", "lab-ink hide");
labels += wlab("lb-a0", A.cabA.top, "A 的 0 号抽屉 · 被清空", "lab-rs hide");
labels += wlab("lb-b0", A.cabB.top, "B 的 0 号抽屉 · 完好", "lab-gs hide");
labels += wlab("lb-noq", W3((L.STANCH[0].u + L.STANCH[1].u) / 2, L.STANCH[0].v, 0).map((v, i) => v + (i ? 20 : 0)), "离开窗口 · 不能插队回来", "lab-g hide", "t");
labels += wpin("prog", at(L.MACH.A, 0, 0, 440), `<div class="prog hide" id="prog-i"><div class="pt">A 的上一件事</div><div class="pb"><div class="pf"></div></div><div class="pt2">还没办完</div></div>`, "b");
labels += wlab("lb-re", W3((L.MACH.A.u + L.MACH.B.u) / 2, L.MACH.A.v + 160, 280), "重入", "lab-rs lab-xl hide");
labels += wlab("lb-ro", A.cabB.top, "只读", "lab-cs hide");
labels += wpin("bxB", A.cabB.drawersOpen[3], BADGE("bxB-b", 64, "hide"));
labels += wlab("lb-rb", A.cabB.drawersOpen[3].map((v, i) => v + (i ? 40 : 60)), "写存储 → 回滚", "lab-rs hide", "l");
labels += wpin("bxF", A.mB.front, BADGE("bxF-b", 64, "hide"));
labels += wpin("nf", W3(L.TRACK.u1 - 60, L.TRACK.v[0], 120), `<div class="note hide" id="nf-i">false</div>`, "c");
labels += wlab("lb-nr", A.mA.top, "不自动回滚", "lab-r hide");

// ---------------------------------------------------------------- cameras
const C = (u, v, z, k, sx = 960, sy = 540) => camAt(Wp(u, v, z), sx, sy, k);
const CAMS = {
  open: C(560, -410, 140, 0.74, 960, 600),
  users: C(-700, -170, 150, 0.8, 960, 680),
  wide: C(560, -300, 140, 0.52, 900, 600),
  user2: C(-920, -130, 170, 0.92, 960, 590),
  relay: C(120, -170, 140, 0.68, 960, 590),
  ctx: C(120, -170, 140, 0.62, 640, 620),
  tracks: C(280, -120, 100, 0.84, 820, 560),
  hall: C(250, -120, 120, 0.86, 860, 640),
};

// ---------------------------------------------------------------- screen overlay: cards and connectors
// code card C (top right)
const CARD = { x: 900, y: 104, w: 972 };
const rowY = (i) => CARD.y + 24 + 56 + 25 + 50 * i;
const code = `<div class="k-code hide" id="card" style="left:${CARD.x}px;top:${CARD.y}px;width:${CARD.w}px">
  <div class="c-head">合约之间的三种调用<span class="c-tag">Solidity</span></div>
  <div class="c-row" id="cr0">B.bar()                     <span class="c-cm">// call</span></div>
  <div class="c-row" id="cr1">B.delegatecall(data)        <span class="c-cm">// 用 A 的存储</span></div>
  <div class="c-row" id="cr2">(bool ok, ) = B.call(data); <span class="c-cm">// 失败只返回 false</span></div>
</div>`;
// dashboard on C (right)
const DASH = { x: 1290, y: 150, w: 600, rh: 74 };
const dRow = (i) => DASH.y + 22 + 58 + 10 + DASH.rh * i + DASH.rh / 2;
const dash = `<div class="dash hide" id="dash" style="left:${DASH.x}px;top:${DASH.y}px;width:${DASH.w}px">
  <div class="dh">站在 C 的位置</div>
  ${[["tx.origin", "用户"], ["msg.sender", "B"], ["msg.value", "B 转给 C 的数量"], ["address(this)", "C 自己"]].map(([k, v], i) =>
    `<div class="dr" id="dr${i}"><span class="dk">${k}</span><span class="dv"><span class="dvv hide" id="dv${i}">${v}</span></span><span class="dx hide ${["gr","ok","",""][i]}" id="dx${i}">${["不用于鉴权","✓ 鉴权看它","",""][i]}</span></div>`).join("")}
</div>`;
// delegatecall context card (top left)
const lockSvg = `<svg width="26" height="30" viewBox="0 0 26 30"><rect x="2" y="13" width="22" height="16" rx="3" fill="#1c1c1c"/><path d="M7 13V9A6 6 0 0 1 19 9V13" fill="none" stroke="#1c1c1c" stroke-width="3.2"/></svg>`;
const actx = `<div class="dash hide" id="actx" style="left:56px;top:110px;width:640px">
  <div class="dh">delegatecall 时 · 在 A 里执行</div>
  <div class="dr"><span class="dk">msg.sender</span><span class="dv"><span class="dvv">保持不变</span></span><span class="lk hide" id="lk0">${lockSvg}</span></div>
  <div class="dr"><span class="dk">msg.value</span><span class="dv"><span class="dvv">保持不变</span></span><span class="lk hide" id="lk1">${lockSvg}</span></div>
  <div class="dep"><span class="dl">依赖它</span><span class="chip hide" id="ch0">代理合约</span><span class="chip hide" id="ch1">库合约</span></div>
</div>`;
// inset: the vault from segment ①
const IV = { x: 56, y: 110, w: 620, svgH: 400 };
const ivGate = O.checkpoint({ u: 0, v: -62 }, { id: "ivg", n: "检查" });
const ivSafe = O.safe({ u: 300, v: -280 }, { id: "ivs", plate: "VAULT" });
const ivEnv = O.envelope({ u: -280, v: 40 }, { id: "ive", state: "attacker", w: 120, h: 80 });
const ivStop = Wp(-105, 40, 0), ivStart = Wp(-280, 40, 0);
const ivSvg = `<svg id="ivsvg" data-layout-ignore width="${IV.w - 28}" height="${IV.svgH}" viewBox="-350 -450 770 590">${isoDefs()}${gridSvg({ u0: -800, u1: 800, v0: -800, v1: 600 })}${ivSafe.svg}${ivGate.svg}<g id="ive-mv">${ivEnv.svg}</g></svg>`;
const inset = `<div class="inset hide" id="inset" style="left:${IV.x}px;top:${IV.y}px;width:${IV.w}px">
  <div class="dh">开头那个金库 · 权限检查</div>
  <div class="ivw">${ivSvg}<div class="ivok hide" id="ivok">${CHECK("ivok-c", 56)}<span>拦下</span></div></div>
  <div class="ivr">检查读的是 <span class="rd" id="iv-o">tx.origin</span><span class="gd hide" id="iv-s">msg.sender</span></div>
</div>`;

// screen connectors (cameras are static while these are drawn)
const S = (cam, p) => toScreen(CAMS[cam], p);
const cx0 = CARD.x - 6;
const ov = [];
const sc = (id, P0, P3, o) => { const c = dashCurve(id, P0, P3, o); ov.push(c.svg); return c; };
sc("cv-c0", [cx0, rowY(0)], S("tracks", A.cabB.drawersOpen[2]), { c1: [cx0 - 120, rowY(0) + 40], c2: [S("tracks", A.cabB.drawersOpen[2])[0] + 120, S("tracks", A.cabB.drawersOpen[2])[1] - 160] });
sc("cv-c1", [cx0, rowY(1)], S("tracks", A.cabA.drawersOpen[2]), { c1: [cx0 - 260, rowY(1) + 10], c2: [S("tracks", A.cabA.drawersOpen[2])[0] + 160, S("tracks", A.cabA.drawersOpen[2])[1] - 220] });
const NF_DU = -(L.TRACK.u1 - L.TRACK.u0 - 200);
const nfS = S("tracks", W3(L.TRACK.u1 - 60 + NF_DU, L.TRACK.v[0], 120));
sc("cv-c2", [cx0, rowY(2)], [nfS[0] + 40, nfS[1] - 26], { c1: [cx0 - 200, rowY(2) + 60], c2: [nfS[0] + 260, nfS[1] - 160] });
const dx0 = DASH.x - 6;
const tgt = { 0: S("ctx", A.user.head), 1: S("ctx", A.mB.top), 3: S("ctx", A.mC.top) };
sc("cv-d0", [dx0, dRow(0)], tgt[0], { color: "#2aa3c9", c1: [dx0 - 400, dRow(0) - 120], c2: [tgt[0][0] + 300, tgt[0][1] - 260] });
sc("cv-d1", [dx0, dRow(1)], tgt[1], { color: "#2aa3c9", c1: [dx0 - 200, dRow(1) - 40], c2: [tgt[1][0] + 120, tgt[1][1] - 120] });
sc("cv-d3", [dx0, dRow(3)], tgt[3], { color: "#2aa3c9", c1: [dx0 - 120, dRow(3)], c2: [tgt[3][0] + 120, tgt[3][1] - 80] });
const ovSvg = `<svg id="ovl" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">${ov.join("")}</svg>`;

// ---------------------------------------------------------------- times
const TM = {
  evm: w("EVM", 0).start, single: w("单线程", 0).start, stack: w("栈式", 0).start, each: w("每个合约", 0).start, code: w("代码", 0).start, store: w("存储", 0).start,
  msg: w("消息调用", 1).start, every: w("每一次", 1).start, ctl: w("控制权", 1).start,
  two: w("两类", 2).start, eoa: w("EOA", 3).start, pk: w("私钥", 3).start, init: w("发起交易", 3).start,
  ca: w("合约账户", 4).start, cc: w("代码控制", 4).start, oc: w("只能被调用", 4).start,
  line: w("界线", 5).start, y2025: w("2025", 5).start, pectra: w("Pectra", 5).start, eip: w("EIP7702", 5).start, deleg: w("委托", 5).start, dcode: w("合约代码", 5).start,
  hascode: w("有没有代码", 6).start, cant: w("不能判断", 6).start, cmp: w("比较", 6).start, txo6: w("tx.origin", 6).start, nope: w("也不行", 6).start,
  ctx: w("调用上下文", 7).start, uA: w("用户调用", 7).start, AB: w("A调用B", 7).start, BC: w("B再调用C", 7).start,
  standC: w("站在", 8).start, four: w("四个变量", 8).start,
  txo: w("tx.origin", 9).start, user9: w("用户", 9).start,
  snd: w("msg.sender", 10).start, B10: w("B", 10).start,
  val: w("msg.value", 11).start, coin: w("原生币", 11).start, amt: w("数量", 11).start,
  addr: w("address", 12).start, self: w("C自己", 12).start,
  vault: w("金库", 13).start, snd13: w("msg.sender", 13).start, not13: w("不是", 13).start,
  three: w("三种", 14).start,
  call: w("call", 15).start, bcode15: w("B的代码", 15).start, bstore: w("B的存储", 15).start,
  dcall: w("delegatecall", 16).start, bcode16: w("B的代码", 16).start, astore: w("A的存储", 16).start,
  keep: w("保持不变", 17).start, proxy: w("代理合约", 17).start, lib: w("库合约", 17).start,
  meta: w("打个比方", 18).start, win: w("窗口", 18).start, hall: w("政务大厅", 18).start, dept: w("科室", 18).start,
  send: w("派人", 19).start, bwin: w("B的窗口", 19).start,
  manual: w("规程手册", 20).start, borrow: w("借过来", 20).start, cab20: w("档案柜", 20).start,
  clear: w("清空0号抽屉", 21).start, aDrawer: w("A的抽屉", 21).start,
  fail: w("不成立", 22).start, leave: w("离开窗口", 22).start, cut: w("插队", 22).start,
  half: w("办到一半", 23).start, backA: w("再找A", 23).start, notDone: w("还没办完", 23).start, reent: w("重入", 23).start,
  scall: w("staticcall", 24).start, ro: w("只读", 24).start, wr: w("写存储", 24).start, rb: w("回滚", 24).start,
  low: w("低级call", 25).start, noAuto: w("不会自动", 25).start, fls: w("false", 25).start,
};
const LS = LN.map((l) => f(l.start));

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 84px; }
    .kw { position: absolute; left: 56px; top: 108px; font-size: 44px; font-weight: 900; color: #1c1c1c; background: #fffdf8; border-radius: 16px; padding: 10px 28px 14px;
      box-shadow: 0 10px 24px rgba(70,60,40,0.12); white-space: nowrap; }
    .kw b { color: #1d93ba; }
    .lab-xl { font-size: 44px; font-weight: 900; padding: 6px 24px 10px; border-radius: 14px; }
    .dash, .inset { position: absolute; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); padding: 22px 26px 20px; }
    .dash .dh, .inset .dh { font-size: 32px; font-weight: 900; height: 58px; line-height: 50px; border-bottom: 3px solid #1c1c1c; margin-bottom: 10px; white-space: nowrap; }
    .dash .dr { display: flex; align-items: center; height: ${DASH.rh}px; gap: 14px; }
    .dash .dk { width: 252px; font-family: "JetBrains Mono", monospace; font-size: 30px; font-weight: 800; color: #1c1c1c; white-space: nowrap; }
    .dash .dv { flex: none; min-width: 120px; height: 52px; border-radius: 10px; background: #0f2a33; padding: 0 16px; display: flex; align-items: center; }
    .dash .dvv { font-size: 30px; font-weight: 900; color: #9ad9ee; white-space: nowrap; }
    .dash .dx { margin-left: auto; font-size: 28px; font-weight: 900; white-space: nowrap; border-radius: 8px; padding: 2px 12px 4px; }
    .dash .dx.ok { color: #ffffff; background: #1f9d55; }
    .dash .dx.gr { color: #6d685e; background: #ebe6dc; }
    .dash .dr.dim .dk, .dash .dr.dim .dvv { opacity: 0.35; }
    .dash .lk { margin-left: 8px; }
    .dash .dep { display: flex; align-items: center; gap: 14px; height: 70px; margin-top: 6px; border-top: 2px dashed #e2ddd3; padding-top: 10px; }
    .dash .dl { font-size: 30px; font-weight: 700; color: #6d685e; }
    .dash .chip { font-size: 30px; font-weight: 900; color: #ffffff; background: #1d93ba; border-radius: 10px; padding: 2px 16px 5px; }
    .inset .ivw { position: relative; height: ${IV.svgH}px; background: #efebe3; border-radius: 12px; overflow: hidden; }
    .inset .ivok { position: absolute; right: 26px; top: 26px; display: flex; align-items: center; gap: 10px; font-size: 32px; font-weight: 900; color: #1f9d55; }
    .inset .ivr { position: relative; height: 62px; line-height: 62px; margin-top: 10px; font-size: 30px; font-weight: 700; white-space: nowrap; }
    .inset .rd, .inset .gd { position: absolute; left: 170px; font-family: "JetBrains Mono", monospace; font-weight: 800; border-radius: 8px; padding: 0 14px; line-height: 50px; top: 6px; }
    .inset .rd { color: #c3352b; background: #fdeae7; }
    .inset .gd { color: #ffffff; background: #1f9d55; }
    .stamp { font-size: 40px; font-weight: 900; color: #6d685e; border: 6px solid #8a8478; border-radius: 12px; padding: 6px 26px 10px; transform: rotate(-8deg); background: rgba(255,253,248,0.85); white-space: nowrap; }
    .prog { background: #fffdf8; border-radius: 14px; box-shadow: 0 8px 18px rgba(70,60,40,0.12); padding: 10px 18px 12px; text-align: center; }
    .prog .pt, .prog .pt2 { font-size: 30px; font-weight: 900; white-space: nowrap; }
    .prog .pt2 { color: #c3352b; }
    .prog .pb { width: 260px; height: 22px; border-radius: 11px; background: #e2ddd3; margin: 8px auto; overflow: hidden; }
    .prog .pf { width: 50%; height: 100%; background: #2aa3c9; }
    .note { font-family: "JetBrains Mono", monospace; font-size: 34px; font-weight: 800; color: #c3352b; background: #ffffff; border: 3px solid #e0453a; border-radius: 6px; padding: 2px 16px 6px; transform: rotate(-4deg); box-shadow: 0 6px 12px rgba(70,60,40,0.14); }
${termCss}
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div class="kw hide" id="kw0">EVM · <b>单线程</b> · <b>栈式</b> 计算机</div>
      <div class="kw hide" id="kw-meta" style="font-size:36px">比喻 · 政务大厅</div>
      <div class="stamp hide" id="stamp-i" style="position:absolute;left:640px;top:150px">比喻在这里不成立</div>
      ${code}${dash}${actx}${inset}${ovSvg}
      ${termHtml(TERMS)}
      ${pills(2, { sections: SECTIONS })}
      <div class="k-title" id="ttl-card"><div class="t-main">② 调用上下文</div><div class="t-sub">谁在调用 · 改谁的存储</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const MV = ${JSON.stringify(MV)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const grown = new Set();
      const grow = (id, t, d) => { if (!grown.has(id)) { grown.add(id); const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); } KIT.grow(tl, id, t, d); };
      const fly = (id, t, d, dur, lift, ease) => KITX.fly(tl, id, t, +d[0], +d[1], dur, lift, ease);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      ["mA", "mB", "mC", "cabA", "cabB", "cabC", "user", "lap", "key", "mD", "mag1", "mag2", "chain", "ctr", "stn", "clerk"].forEach((id) => { const g = $(id); grown.add(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); });
      KITX.fade(tl, "#cabA-fill-2", 0, 0, 0.01); KITX.fade(tl, "#cabB-fill-2", 0, 0, 0.01);

      KIT.camSet(tl, CAMS.open);
      // ===== 0–1.6 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.25);
      // ===== L0 machines + cabinets grow; keyword
      KIT.grow(tl, "mA", ${f(TM.evm)}); KIT.grow(tl, "mB", ${f(TM.evm + 0.18)}); KIT.grow(tl, "mC", ${f(TM.evm + 0.36)});
      ["A", "B", "C"].forEach((k, i) => pop("#lb-m" + k, ${f(TM.evm + 0.5)} + i * 0.12));
      pop("#kw0", ${f(TM.single)}, 0.3);
      KIT.grow(tl, "cabA", ${f(TM.each)}); KIT.grow(tl, "cabB", ${f(TM.each + 0.15)}); KIT.grow(tl, "cabC", ${f(TM.each + 0.3)});
      pop("#lb-code", ${f(TM.code)}); pop("#lb-store", ${f(TM.store)});
      // ===== L1 a message call hands control from A to B (one machine turns at a time)
      out("#lb-code, #lb-store, #kw0", ${f(LS[1] - 0.1)});
      KITX.spin(tl, "mA", ${f(LS[1])}, ${f(TM.msg + 0.6 - LS[1])}, 1.2, "power1.inOut");
      KITX.slot(tl, "mB", ${f(TM.msg + 0.4)}, true);
      fadeIn("#eL1", ${f(TM.msg)}, 0.12);
      fly("eL1", ${f(TM.msg + 0.05)}, MV.eL1_toB, 1.1, 150);
      out("#eL1", ${f(TM.msg + 1.1)}, 0.15);
      KITX.slot(tl, "mB", ${f(TM.msg + 1.3)}, false);
      KITX.spin(tl, "mB", ${f(TM.msg + 1.2)}, ${f(LN[1].end - TM.msg - 1.4)}, 2.4, "power1.inOut");
      pop("#lb-ctl", ${f(TM.ctl)});
      // ===== L2 two kinds of accounts: user side
      out("#lb-ctl, #lb-mB, #lb-mC", ${f(LS[2] - 0.25)});
      KIT.cam(tl, ${f(LS[2] - 0.3)}, CAMS.users, 1.0);
      grow("user", ${f(TM.two - 0.2)}); grow("lap", ${f(TM.two)});
      // ===== L3 EOA: private key, can start a transaction
      pop("#lb-eoa", ${f(TM.eoa)});
      grow("key", ${f(TM.pk - 0.1)}); pop("#lb-pk", ${f(TM.pk + 0.2)});
      fadeIn("#eEO", ${f(TM.init - 0.2)}, 0.12); fly("eEO", ${f(TM.init - 0.15)}, MV.eEO_out, 0.7, 60, "power2.out");
      pop("#lb-init", ${f(TM.init + 0.2)});
      // ===== L4 contract account: code-controlled, only called
      out("#lb-mA", ${f(LS[4] - 0.2)});
      pop("#lb-ca", ${f(TM.ca)});
      pop("#lb-cc", ${f(TM.cc)});
      KITX.slot(tl, "mA", ${f(TM.oc)}, true); pop("#lb-oc", ${f(TM.oc + 0.1)});
      // ===== L5 Pectra / EIP-7702: an EOA can delegate to contract code
      out("#lb-pk, #lb-init, #lb-cc, #lb-oc, #eEO, #lb-eoa", ${f(LS[5])});
      KITX.slot(tl, "mA", ${f(LS[5])}, false);
      KIT.cam(tl, ${f(TM.line)}, CAMS.wide, 1.2);
      grow("chain", ${f(TM.y2025 - 0.5)});
      fadeIn("#chain-hi", ${f(TM.pectra - 0.2)}, 0.25);
      pop("#lb-pec", ${f(TM.pectra)}); pop("#lb-asof", ${f(TM.eip)});
      KIT.cam(tl, ${f(TM.eip + 0.9)}, CAMS.user2, 1.1);
      out("#lb-ca, #lb-pec, #lb-asof", ${f(TM.eip + 0.9)});
      grow("mD", ${f(TM.deleg - 0.1)}, 0.5);
      KIT.draw(tl, "cv-deleg", ${f(TM.deleg + 0.3)}, 0.6);
      pop("#lb-del", ${f(TM.dcode - 0.2)});
      // ===== L6 so "has code?" and "sender == origin?" no longer tell a plain user apart
      grow("mag1", ${f(TM.hascode - 0.3)}); pop("#lb-q1", ${f(TM.hascode)});
      pop("#bx1-b", ${f(TM.cant + 0.2)}, 0.3); pop("#lb-nr1", ${f(TM.cant + 0.45)});
      grow("mag2", ${f(TM.cmp - 0.2)}); pop("#lb-q2", ${f(TM.cmp + 0.1)});
      pop("#bx2-b", ${f(TM.nope)}, 0.3); pop("#lb-nr2", ${f(TM.nope + 0.2)});
      // ===== L7 user → A → B → C relay
      out("#chain, #lb-q1, #lb-q2, #bx1-b, #bx2-b, #lb-nr1, #lb-nr2, #lb-del, #lb-eoa, #cv-deleg", ${f(LS[7] - 0.2)});
      out("#mag1, #mag2", ${f(LS[7] - 0.2)}, 0.3); tl.to("#mD", { opacity: 0.3, duration: 0.3 }, ${f(LS[7] - 0.2)});
      KIT.cam(tl, ${f(LS[7] - 0.25)}, CAMS.relay, 1.1);
      pop("#lb-user", ${f(TM.ctx)});
      ["A", "B", "C"].forEach((k, i) => pop("#lb-m" + k, ${f(TM.ctx + 0.3)} + i * 0.1));
      fadeIn("#e7", ${f(TM.uA - 0.1)}, 0.12);
      fly("e7", ${f(TM.uA)}, MV.e7_toA, 0.8, 120);
      { const L0 = +$("ar0-s").getAttribute("stroke-dasharray").split(" ")[0]; tl.fromTo("#ar0-s", { attr: { "stroke-dashoffset": L0 } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.5, ease: "power2.out", immediateRender: false }, ${f(TM.uA)}); pop("#ar0-h", ${f(TM.uA + 0.45)}, 0.2); }
      KITX.spin(tl, "mA", ${f(TM.uA + 0.8)}, 1.0, 1, "power1.inOut");
      fly("e7", ${f(TM.AB - 0.25)}, MV.e7_atAout, 0.01);
      fly("e7", ${f(TM.AB - 0.2)}, MV.e7_toB, 0.75, 130);
      { const L1 = +$("ar1-s").getAttribute("stroke-dasharray").split(" ")[0]; tl.fromTo("#ar1-s", { attr: { "stroke-dashoffset": L1 } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.5, ease: "power2.out", immediateRender: false }, ${f(TM.AB - 0.2)}); pop("#ar1-h", ${f(TM.AB + 0.25)}, 0.2); }
      KITX.spin(tl, "mB", ${f(TM.AB + 0.55)}, 0.9, 1, "power1.inOut");
      fly("e7", ${f(TM.BC - 0.1)}, MV.e7_atBout, 0.01);
      fly("e7", ${f(TM.BC - 0.05)}, MV.e7_toC, 0.75, 130);
      { const L2 = +$("ar2-s").getAttribute("stroke-dasharray").split(" ")[0]; tl.fromTo("#ar2-s", { attr: { "stroke-dashoffset": L2 } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.5, ease: "power2.out", immediateRender: false }, ${f(TM.BC - 0.05)}); pop("#ar2-h", ${f(TM.BC + 0.4)}, 0.2); }
      out("#e7", ${f(TM.BC + 0.7)}, 0.15);
      KITX.spin(tl, "mC", ${f(TM.BC + 0.7)}, 1.2, 1.2, "power1.inOut");
      // ===== L8 standing at C: a four-row dashboard
      KIT.cam(tl, ${f(LS[8] - 0.2)}, CAMS.ctx, 0.9);
      out("#lb-mA, #lb-mB, #lb-mC", ${f(LS[8] - 0.2)});
      pop("#dash", ${f(TM.standC + 0.2)}, 0.35);
      // ===== L9–L12 four variables
      pop("#dv0", ${f(TM.txo)}, 0.3); KIT.draw(tl, "cv-d0", ${f(TM.txo + 0.3)}, 0.8);
      tl.to("#cv-d0", { opacity: 0.25, duration: 0.3 }, ${f(LS[10])});
      pop("#dv1", ${f(TM.snd)}, 0.3); KIT.draw(tl, "cv-d1", ${f(TM.snd + 0.4)}, 0.6);
      tl.to("#cv-d1", { opacity: 0.25, duration: 0.3 }, ${f(LS[11])});
      pop("#dv2", ${f(TM.val)}, 0.3); fadeIn("#coins", ${f(TM.coin)}, 0.3); pop("#lb-coin", ${f(TM.coin + 0.2)});
      pop("#dv3", ${f(TM.addr)}, 0.3);
      { const r = $("ringC"), Lr = +r.getAttribute("stroke-dasharray").split(" ")[0];
        tl.fromTo("#ringC", { attr: { "stroke-dashoffset": Lr } }, { attr: { "stroke-dashoffset": 0 }, duration: 1.0, ease: "power2.inOut", immediateRender: false }, ${f(TM.addr + 0.2)});
        tl.to("#ringC", { attr: { "fill-opacity": 1 }, duration: 0.4 }, ${f(TM.addr + 1.2)}); }
      KIT.draw(tl, "cv-d3", ${f(TM.self - 0.3)}, 0.5);
      // ===== L13 the vault should read msg.sender
      out("#cv-d0, #cv-d1, #cv-d3, #lb-coin, #coins", ${f(LS[13] - 0.1)}, 0.3);
      pop("#inset", ${f(TM.vault - 0.2)}, 0.35);
      fadeIn("#ive-mv", 0, 0.01);
      tl.fromTo("#ive-mv", { x: 0, y: 0 }, { x: ${f(ivStop[0] - ivStart[0])}, y: ${f(ivStop[1] - ivStart[1])}, duration: 1.0, ease: "power2.out", immediateRender: false }, ${f(TM.snd13 + 0.3)});
      KIT.swap(tl, "#iv-o", "#iv-s", ${f(TM.snd13)}, 0.3);
      pop("#dx1", ${f(TM.snd13 + 0.1)}, 0.3);
      tl.to("#dr0 .dk, #dv0", { opacity: 0.4, duration: 0.3 }, ${f(TM.not13)}); pop("#dx0", ${f(TM.not13 + 0.1)});
      pop("#ivok", ${f(TM.snd13 + 1.3)}, 0.3);
      // ===== L14 three ways to call: three tracks between A and B + code card
      out("#dash, #inset", ${f(LS[14] - 0.2)}, 0.25);
      out("#ar0, #ar1, #ar2, #lb-user", ${f(LS[14] - 0.2)}, 0.25);
      tl.to("#ringC", { opacity: 0, duration: 0.3 }, ${f(LS[14] - 0.2)});
      KIT.cam(tl, ${f(LS[14] - 0.25)}, CAMS.tracks, 1.1);
      [0, 1, 2].forEach((i) => { fadeIn("#tr" + i, ${f(TM.three - 0.3)} + i * 0.15, 0.3); pop("#lb-tr" + i, ${f(TM.three)} + i * 0.15); });
      pop("#card", ${f(TM.three + 0.3)}, 0.35);
      fadeIn("#man-mv", ${f(TM.three + 0.5)}, 0.3);
      // ===== L15 call: B runs B's code, writes B's storage
      fadeIn("#tr0-hl", ${f(TM.call)}, 0.2); tl.to("#lb-tr1, #lb-tr2", { opacity: 0.3, duration: 0.25 }, ${f(TM.call)});
      fadeIn("#eT1", ${f(TM.call)}, 0.12); fly("eT1", ${f(TM.call + 0.1)}, MV.eT1_end, 1.0, 0, "power2.inOut");
      fly("eT1", ${f(TM.call + 1.1)}, MV.eT1_slot, 0.45, 40, "power2.in"); out("#eT1", ${f(TM.call + 1.45)}, 0.12);
      KITX.spin(tl, "mB", ${f(TM.bcode15 - 0.2)}, 1.6, 1.2, "power1.inOut");
      KITX.drawer(tl, "cabB", 2, ${f(TM.bstore - 0.6)}, true, 0.6);
      KITX.fillDrawer(tl, "cabB", 2, ${f(TM.bstore - 0.05)}, 0.25); KITX.mark(tl, "cabB", 2, ${f(TM.bstore - 0.05)}, "teal");
      pop("#lb-wB", ${f(TM.bstore)});
      KIT.draw(tl, "cv-c0", ${f(TM.bstore - 0.2)}, 0.6);
      // ===== L16 delegatecall: B's manual flies to A; A runs it, A's storage changes (key frame)
      out("#tr0-hl, #cv-c0, #lb-wB", ${f(LS[16] - 0.1)}, 0.25);
      KITX.mark(tl, "cabB", 2, ${f(LS[16] - 0.1)}, "off"); KITX.drawer(tl, "cabB", 2, ${f(LS[16] - 0.1)}, false, 0.5);
      fadeIn("#tr1-hl", ${f(TM.dcall)}, 0.2); tl.to("#lb-tr0, #lb-tr2", { opacity: 0, duration: 0.25 }, ${f(TM.dcall)}); tl.to("#lb-tr1", { opacity: 1, duration: 0.25 }, ${f(TM.dcall)});
      KITX.fly(tl, "man-mv", ${f(TM.bcode16 - 1.0)}, +MV.man_toA[0], +MV.man_toA[1], 1.1, 120);
      pop("#lb-bman", ${f(TM.bcode16 + 0.15)});
      KITX.spin(tl, "mA", ${f(TM.bcode16 + 0.3)}, 2.2, 1.5, "power1.inOut");
      KITX.drawer(tl, "cabA", 2, ${f(TM.astore - 0.7)}, true, 0.6);
      KITX.fillDrawer(tl, "cabA", 2, ${f(TM.astore - 0.1)}, 0.25); KITX.mark(tl, "cabA", 2, ${f(TM.astore - 0.1)}, "teal");
      pop("#lb-wA", ${f(TM.astore)});
      KIT.draw(tl, "cv-c1", ${f(TM.astore - 0.2)}, 0.6);
      // ===== L17 msg.sender / msg.value unchanged; proxies and libraries rely on it
      out("#lb-wA", ${f(LS[17])}, 0.2);
      out("#cv-c1", ${f(LS[17] + 1.2)}, 0.3);
      pop("#actx", ${f(LS[17] + 0.1)}, 0.35);
      pop("#lk0", ${f(TM.keep)}, 0.3); pop("#lk1", ${f(TM.keep + 0.2)}, 0.3);
      pop("#ch0", ${f(TM.proxy)}, 0.3); pop("#ch1", ${f(TM.lib)}, 0.3);
      // ===== L18 metaphor: a hall with a single window, each contract a department
      out("#actx, #card, #lb-tr0, #lb-tr1, #lb-tr2, #lb-wA, #lb-bman, #tr1-hl", ${f(LS[18] - 0.2)}, 0.25);
      [0, 1, 2].forEach((i) => tl.to("#tr" + i, { opacity: 0, duration: 0.3 }, ${f(LS[18] - 0.2)}));
      KITX.mark(tl, "cabA", 2, ${f(LS[18] - 0.2)}, "off"); KITX.drawer(tl, "cabA", 2, ${f(LS[18] - 0.2)}, false, 0.5);
      out("#man-mv", ${f(LS[18] - 0.2)}, 0.25); KITX.fly(tl, "man-mv", ${f(LS[18] + 0.1)}, 0, 0, 0.01);
      KIT.cam(tl, ${f(LS[18] - 0.25)}, CAMS.hall, 1.1);
      pop("#kw-meta", ${f(TM.meta)}, 0.3); out("#user, #lap, #key, #mD", ${f(LS[18] - 0.2)}, 0.35);
      grow("ctr", ${f(TM.win - 0.2)}); pop("#lb-ctr", ${f(TM.win + 0.3)});
      ["A", "B", "C"].forEach((k, i) => pop("#lb-k" + k, ${f(TM.dept - 0.6)} + i * 0.12));
      // ===== L19 call = send someone with papers to B's window
      grow("clerk", ${f(TM.send - 0.3)}); fadeIn("#clk-paper", ${f(TM.send)}, 0.2);
      KITX.fly(tl, "clk", ${f(TM.send + 0.2)}, +MV.clk_toB[0], +MV.clk_toB[1], 1.4, 0, "power1.inOut");
      KITX.spin(tl, "mB", ${f(TM.bwin + 0.2)}, 1.2, 1, "power1.inOut");
      // ===== L20 delegatecall = borrow B's manual, follow it on A's own cabinet
      out("#clk-paper", ${f(TM.manual - 0.3)}, 0.2);
      fadeIn("#man-mv", ${f(TM.manual - 0.1)}, 0.2); KITX.fly(tl, "man-mv", ${f(TM.manual - 0.1)}, +MV.man_toClerk[0], +MV.man_toClerk[1], 0.7, 90);
      KITX.fly(tl, "clk", ${f(TM.borrow + 0.2)}, +MV.clk_back[0], +MV.clk_back[1], 1.3, 0, "power1.inOut");
      KITX.fly(tl, "man-mv", ${f(TM.borrow + 0.2)}, +MV.man_open[0], +MV.man_open[1], 1.3, 40, "power1.inOut");
      KITX.book(tl, "man", ${f(TM.cab20 - 0.2)}, 178, 0.8);
      KITX.drawer(tl, "cabA", 0, ${f(TM.cab20)}, true, 0.6);
      // ===== L21 "empty drawer 0" — it is A's drawer that gets emptied
      pop("#lb-page", ${f(TM.clear)}, 0.3);
      KIT.draw(tl, "cv-page", ${f(TM.clear + 0.4)}, 0.6);
      KITX.clearDrawer(tl, "cabA", 0, ${f(TM.clear + 1.0)}); KITX.mark(tl, "cabA", 0, ${f(TM.clear + 1.0)}, "red");
      pop("#lb-a0", ${f(TM.aDrawer)});
      KITX.drawer(tl, "cabB", 0, ${f(TM.aDrawer - 0.6)}, true, 0.6); KITX.mark(tl, "cabB", 0, ${f(TM.aDrawer)}, "green");
      pop("#lb-b0", ${f(TM.aDrawer + 0.2)});
      // ===== L22 where the metaphor breaks: you cannot cut back into the queue
      out("#lb-page, #cv-page, #lb-a0, #lb-b0", ${f(LS[22] - 0.1)}, 0.25);
      pop("#stamp-i", ${f(TM.fail)}, 0.3);
      grow("stn", ${f(TM.leave)}); pop("#lb-noq", ${f(TM.cut - 0.2)});
      // ===== L23 reentrancy: B, half done, calls back into A while A's previous job is unfinished
      out("#stamp-i, #lb-noq, #lb-ctr, #lb-kA, #lb-kB, #lb-kC, #kw-meta", ${f(LS[23] - 0.1)}, 0.25);
      out("#ctr, #stn, #clk, #man-mv", ${f(LS[23] - 0.1)}, 0.35);
      KITX.mark(tl, "cabA", 0, ${f(LS[23] - 0.1)}, "off"); KITX.mark(tl, "cabB", 0, ${f(LS[23] - 0.1)}, "off");
      KITX.drawer(tl, "cabA", 0, ${f(LS[23])}, false, 0.5); KITX.drawer(tl, "cabB", 0, ${f(LS[23])}, false, 0.5);
      KITX.fillDrawer(tl, "cabA", 0, ${f(LS[23] + 0.4)}, 0.3);
      pop("#prog-i", ${f(LS[23] + 0.3)}, 0.3);
      KITX.spin(tl, "mB", ${f(TM.half - 0.4)}, 1.0, 0.5, "power2.out");
      fadeIn("#eR", ${f(TM.backA - 0.2)}, 0.12); fly("eR", ${f(TM.backA - 0.15)}, MV.eR_toA, 1.0, 200);
      out("#eR", ${f(TM.backA + 0.9)}, 0.15);
      KITX.slot(tl, "mA", ${f(TM.backA + 0.8)}, true);
      KITX.spin(tl, "mA", ${f(TM.backA + 0.85)}, 1.2, 1, "power1.inOut");
      tl.fromTo("#prog-i", { scale: 1 }, { scale: 1.08, duration: 0.2, yoyo: true, repeat: 1, ease: "power1.inOut", immediateRender: false }, ${f(TM.notDone)});
      pop("#lb-re", ${f(TM.reent)}, 0.3);
      // ===== L24 staticcall: read-only; B's cabinet under glass, a write reverts
      out("#prog-i, #lb-re", ${f(LS[24] - 0.2)}, 0.25);
      KITX.slot(tl, "mA", ${f(LS[24] - 0.2)}, false);
      KIT.cam(tl, ${f(LS[24] - 0.25)}, CAMS.tracks, 1.0);
      tl.to("#tr0, #tr1, #tr2", { opacity: 1, duration: 0.3 }, ${f(LS[24])});
      pop("#lb-tr2", ${f(TM.scall)}); fadeIn("#tr2-hl", ${f(TM.scall)}, 0.2);
      fadeIn("#eT3", ${f(TM.scall + 0.2)}, 0.12); fly("eT3", ${f(TM.scall + 0.3)}, MV.eT3_end, 0.9); fly("eT3", ${f(TM.scall + 1.2)}, MV.eT3_slot, 0.45, 40, "power2.in"); out("#eT3", ${f(TM.scall + 1.6)}, 0.1);
      KITX.spin(tl, "mB", ${f(TM.scall + 1.6)}, 0.9, 0.6, "power2.out");
      KITX.fade(tl, "#cabB-glass", ${f(TM.ro - 0.1)}, 1, 0.4); pop("#lb-ro", ${f(TM.ro)});
      KITX.drawer(tl, "cabB", 3, ${f(TM.wr - 0.1)}, 26, 0.3);
      KITX.drawer(tl, "cabB", 3, ${f(TM.wr + 0.3)}, 0, 0.25);
      pop("#bxB-b", ${f(TM.wr + 0.3)}, 0.3); pop("#lb-rb", ${f(TM.wr + 0.5)});
      fly("eT3", ${f(TM.rb - 0.6)}, MV.eT3_end, 0.01); fadeIn("#eT3", ${f(TM.rb - 0.55)}, 0.12); fly("eT3", ${f(TM.rb - 0.5)}, [0, 0], 0.9);
      out("#eT3", ${f(TM.rb + 0.6)}, 0.2);
      // ===== L25 low-level call failure: only "false" comes back, A keeps running
      out("#bxB-b, #lb-rb, #lb-ro, #tr2-hl, #lb-tr2", ${f(LS[25] - 0.15)}, 0.25);
      KITX.fade(tl, "#cabB-glass", ${f(LS[25] - 0.15)}, 0, 0.3);
      pop("#card", ${f(LS[25])}, 0.3);
      tl.set("#cr0, #cr1", { opacity: 0.25 }, ${f(LS[25])});
      pop("#lb-tr0", ${f(TM.low)}); fadeIn("#tr0-hl", ${f(TM.low)}, 0.2);
      KITX.spin(tl, "mA", ${f(TM.low)}, ${f(TOTAL - 1.0 - TM.low)}, 3.5, "power1.inOut");
      fly("eT1", ${f(TM.low)}, [0, 0], 0.01); fadeIn("#eT1", ${f(TM.low + 0.1)}, 0.12); fly("eT1", ${f(TM.low + 0.1)}, MV.eT1_end, 0.9); fly("eT1", ${f(TM.low + 1.0)}, MV.eT1_slot, 0.4, 40, "power2.in");
      out("#eT1", ${f(TM.low + 1.35)}, 0.12);
      pop("#bxF-b", ${f(TM.low + 1.4)}, 0.3);
      pop("#nf-i", ${f(TM.noAuto - 0.3)}, 0.3);
      tl.fromTo("#nf-pin", { x: 0, y: 0 }, { x: ${f(Wp(NF_DU, 0, 0)[0])}, y: ${f(Wp(NF_DU, 0, 0)[1])}, duration: 1.0, ease: "power2.inOut", immediateRender: false }, ${f(TM.noAuto)});
      pop("#lb-nr", ${f(TM.noAuto + 0.9)});
      KIT.draw(tl, "cv-c2", ${f(TM.fls - 0.6)}, 0.6);
      tl.set({}, {}, ${f(TOTAL)});
${termJs(TERMS)}
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes");
