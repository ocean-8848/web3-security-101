// Generates compositions/story.html for ep01/seg3「③ 攻击面地图」(one isometric world, one camera).
// Run: node src/build-story.mjs
// Objects: ../../../kit/objects.mjs + ../../kit-ext/objects-ext.mjs (import only) + ./props.mjs. Layout: ./layout.mjs (aligned to seg1).
import fs from "node:fs";
import { at, Wp, f, bez, camAt, toScreen, gridSvg, worldSvg, isoDefs, wlab, wpin, dashCurve, BADGE, CHECK, ENV, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import * as P from "./props.mjs";
import * as L from "./layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = T.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const SECTIONS = SCRIPT.sections;
const LN = T.lines.map((_, i) => lineAt(T, i));
const LS = LN.map((l) => l.start);
const w = (term, line, nth = 0) => wordAt(T, term, { line, nth }).start;
const RV = L.ROAD.v;

// ---------------------------------------------------------------- objects (painter order by ground Y)
const items = [];
const A = {};
const add = (id, o, r, dy = 0) => { A[id] = r.anchors; items.push({ y: at(o)[1] + dy, svg: r.svg }); return r; };
const addY = (y, svg) => items.push({ y, svg });

add("usr", L.USER, O.person(L.USER, { id: "usr", role: "signer" }));
add("atk", L.ATK, O.person(L.ATK, { id: "atk", role: "attacker" }));
const lapScr2 = O.laptopDefaultScreen({ title: "钱包 · 签名", line: "确认签名", btn: "#1f9d55", btnText: "已签" });
add("lap", L.LAPTOP, O.laptop(L.LAPTOP, { id: "lap", screen: O.laptopDefaultScreen({ title: "钱包 · 签名", line: "确认签名", btn: "#1d93ba", btnText: "签名" }), screen2: lapScr2 }));
add("mp", L.MP, X.mempool(L.MP, { id: "mp", n: 6 }));
add("so", L.SO, X.sorter(L.SO, { id: "so", letters: 0, blockLabel: "#N" }));
add("mag", L.MAG, O.magnifier(L.MAG, { id: "mag", z: 60 }), 260);
add("vm", L.VEND, X.vending(L.VEND, { id: "vm", maintDoor: "hidden" }));
add("tok", L.MINI.token, X.miniVend(L.MINI.token, { id: "tok", kind: "token" }));
add("dex", L.MINI.dex, X.miniVend(L.MINI.dex, { id: "dex", kind: "dex" }));
add("orc", L.MINI.oracle, X.miniVend(L.MINI.oracle, { id: "orc", kind: "oracle" }));
{ // pipes between the machines: each drawn after the farther machine, before the nearer one
  const pp = (id, o, du0, du1) => { const r = X.pipe(o, { id, pts: [[du0, 0, 64], [du1, 0, 64]] }); A[id] = r.anchors; return r.svg; };
  addY(at(L.VEND)[1] - 40, pp("pp0", L.VEND, 100, L.MINI.token.u - 55));
  addY(at(L.MINI.token)[1] - 30, pp("pp1", L.MINI.token, 55, L.MINI.dex.u - L.MINI.token.u - 55));
  addY(at(L.MINI.dex)[1] - 30, pp("pp2", L.MINI.dex, 55, L.MINI.oracle.u - L.MINI.dex.u - 55));
}
const br = add("br", L.BRIDGE, X.bridge(L.BRIDGE, { id: "br" }));
const FAR = { u: L.BRIDGE.u + 430, v: RV };
add("far", FAR, X.vending(FAR, { id: "far", scale: 0.55 }), at(L.BRIDGE)[1] - at(FAR)[1] + 1);
add("kd", L.KEYDROP, O.key(L.KEYDROP, { id: "kd" }));
add("dc", L.DOC, O.doc(L.DOC, { id: "dc", title: "已签名", stamp: true, w: 150, h: 110 }));
const DOC2 = { u: L.DOC.u + 120, v: L.DOC.v + 70 };
add("dc2", DOC2, O.doc(DOC2, { id: "dc2", title: "已签名", stamp: true, w: 150, h: 110, state: "attacker" }));
add("trd", L.TRADER, O.person(L.TRADER, { id: "trd", role: "attacker", scale: 1.0 }));
addY(at(L.STACK)[1], P.coinStack("stk", L.STACK, 9));
const cal = O.person(L.CALLER, { id: "cal", role: "signer" }); A.cal = cal.anchors;
addY(at(L.CALLER)[1], `<g id="calg">${cal.svg}${P.phoneAt("cal-ph", cal.anchors.head)}</g>`);
// six plates (blank faces; the words are counter-scaled HTML on the board)
const PLW = [340, 340, 340, 340, 340, 410];
L.PLATES.forEach((o, i) => add("pl" + i, o, X.signBoard(o, { id: "pl" + i, style: "plate", text: "", w: PLW[i], h: i === 5 ? 92 : 80, size: 36, color: i === 5 ? "#1d93ba" : "#2aa3c9" })));
// split boards + their objects (L21–L22)
add("bdL", L.BOARD_L, X.signBoard(L.BOARD_L, { id: "bdL", text: "链与基础设施", size: 44 }));
add("bdR", L.BOARD_R, X.signBoard(L.BOARD_R, { id: "bdR", text: "人、设备和流程", size: 44 }));
add("lrp", L.L_RPC, O.rpc(L.L_RPC, { id: "lrp" }));
add("lch", L.L_CHAIN, O.chain(L.L_CHAIN, { id: "lch", n: 2 }));
add("llk", L.L_LOCK, O.padlock(L.L_LOCK, { id: "llk", key: false }));
const rcl = O.person(L.R_CALLER, { id: "rcl", role: "signer", scale: 1.0 }); A.rcl = rcl.anchors;
addY(at(L.R_CALLER)[1], `<g id="rclg">${rcl.svg}${P.phoneAt("rcl-ph", rcl.anchors.head, 0.85)}</g>`);
add("rlap", L.R_LAPTOP, O.laptop(L.R_LAPTOP, { id: "rlap" }));
add("rkey", L.R_KEY, O.key(L.R_KEY, { id: "rkey", stand: true }));
add("aim", L.AI_MAG, O.magnifier(L.AI_MAG, { id: "aim", z: 120 }), 300);
items.sort((a, b) => a.y - b.y);

// ---------------------------------------------------------------- under-ground layer (L11–L12)
const BZ = L.BASE_Z;
let under = P.basePlatform("basep", L.BASE, BZ);
let vls = "";
for (const u of [-1380, -900, -380, 100]) for (const v of [L.BASE.v1 - 20]) vls += P.vline({ u, v }, -L.SLAB.z, -BZ);
under += `<g id="vls" opacity="0">${vls}</g>`;
const bch = O.chain(L.BCHAIN, { id: "bch", n: 3 }), bch2 = O.chain(L.BCHAIN, { id: "bch2", n: 3, blockStates: ["normal", "attacker", "normal"] });
const rpa = O.rpc(L.BRPC[0], { id: "rpa" }), rpb = O.rpc(L.BRPC[1], { id: "rpb" });
under += P.sink(rpa.svg, BZ) + P.sink(`${bch.svg}<g id="bch2w" opacity="0">${bch2.svg}</g>`, BZ) + P.sink(rpb.svg, BZ);
under += P.soil("soil", L.SLAB);
const sinkP = (p) => [p[0], p[1] + BZ * 0.866];

// ---------------------------------------------------------------- ground layer
let ground = P.road("road1", L.ROAD.u0, L.BRIDGE.u - 320, RV, L.ROAD.half) + P.road("road2", L.BRIDGE.u + 300, L.ROAD.u1, RV, L.ROAD.half);
ground += P.walkway("walk", -70, 70, 75, RV - L.ROAD.half);
ground += `<g id="vm-gray" opacity="0" transform="${faceTopStr(L.VEND)}"><ellipse cx="0" cy="0" rx="190" ry="150" fill="rgba(120,114,104,0.28)"/></g>`;
function faceTopStr(o) { const p = at(o); return `matrix(0.8192,-0.2868,0.5736,0.4096,${f(p[0])},${f(p[1])})`; }

// ---------------------------------------------------------------- top layer: moving letters / crate
const tx = P.txLetter("tx", L.TX0); A.tx = tx.anchors;
const tx2 = P.txLetter("tx2", { u: L.VEND.u - 24, v: 150 });
const blk = P.crate("blk", { u: L.SO.u + 232, v: L.SO.v });
const R1o = { u: L.SO.u - 60, v: L.SO.v + 300 }, R2o = { u: L.SO.u - 200, v: L.SO.v + 330 };
const r1 = X.letter(R1o, { id: "r1", state: "attacker", w: 84, h: 54, lift: 12 }), r2 = X.letter(R2o, { id: "r2", state: "attacker", w: 84, h: 54, lift: 12 });
const topLayer = tx.svg + tx2.svg + blk.svg + `<g id="r1w" opacity="0">${r1.svg}</g><g id="r2w" opacity="0">${r2.svg}</g>`;

// world points used by motion
const beltP = (du) => at(L.SO, du, 0, 78);
const MPP = (du, dv, z = 0) => at(L.MP, du, dv, z);
const exitP = MPP(290, -84), inP = at(L.SO, -230, 0, 78), dropP = at(L.SO, 232, 0, 40);
const lapFront = at(L.LAPTOP, 40, 110);
const PATH = {
  txToLap: [lapFront],
  txToMp: [at(L.LAPTOP, 200, 260), MPP(-330, 84), MPP(200, 84), MPP(200, 0), MPP(-80, 0)],
  env0: [exitP, inP, beltP(-10)], env1: [exitP, inP, beltP(-90)],
  tx3: [MPP(-200, 0), MPP(-200, -84), exitP, inP, beltP(-170)],
  env2: [exitP, inP, beltP(-90)],
  r1: [at(L.SO, -10, 120), beltP(-10)], r2: [at(L.SO, -170, 120), beltP(-170)],
  blk: [at(L.VEND, -150, 210), at(L.VEND, -20, 150)],
  tx2: [at(L.VEND, -24, RV), at(L.BRIDGE, -420, 0), ...A.br.deck, at(FAR, -110, 0)],
};

// ---------------------------------------------------------------- world-space connectors
const vmA = A.vm, tokA = A.tok;
const cvCall = dashCurve("cv-call", at(L.VEND, 100, 0, 250), at(L.MINI.token, -55, 0, 165), { color: "#2aa3c9", c1: [at(L.VEND, 100, 0, 250)[0] + 60, at(L.VEND, 100, 0, 250)[1] - 90], c2: [at(L.MINI.token, -55, 0, 165)[0] - 40, at(L.MINI.token, -55, 0, 165)[1] - 110] });
const reP0 = at(L.MINI.token, -10, 45, 120), reP3 = vmA.buttons[2];
const cvRe = dashCurve("cv-re", reP0, reP3, { sw: 6, c1: [reP0[0] + 40, reP0[1] + 170], c2: [reP3[0] + 150, reP3[1] + 110] });
const bTop = sinkP(at(L.BCHAIN, 0, 0, 120)), rbTop = sinkP(A.rpbTip ?? at(L.BRPC[1], 30, -26, 234));
const cvB1 = dashCurve("cv-b1", bTop, at(L.VEND, -40, 75, 10), { c1: [bTop[0] + 60, bTop[1] - 220], c2: [at(L.VEND, -40, 75, 10)[0] - 160, at(L.VEND, -40, 75, 10)[1] + 160] });
const cvB2 = dashCurve("cv-b2", rbTop, at(L.VEND, 60, 75, 10), { c1: [rbTop[0] + 40, rbTop[1] - 160], c2: [at(L.VEND, 60, 75, 10)[0] + 80, at(L.VEND, 60, 75, 10)[1] + 120] });
// L22: social engineering entry → landing points
const head = A.rcl.head;
const cvS1 = dashCurve("cv-s1", [head[0] + 30, head[1] - 20], A.rlap.screen, { sw: 6, c1: [head[0] + 90, head[1] - 140], c2: [A.rlap.screen[0] - 40, A.rlap.screen[1] - 150] });
const keyP = at(L.R_KEY, 40, 0, 50);
const cvS2 = dashCurve("cv-s2", [head[0] + 30, head[1] - 20], keyP, { sw: 6, c1: [head[0] + 160, head[1] + 60], c2: [keyP[0] - 140, keyP[1] + 80] });
const aimL = A.aim.lens;
const bdLtop = at(L.BOARD_L, 60, 0, 150), bdRtop = at(L.BOARD_R, -60, 0, 150);
const cvA1 = dashCurve("cv-a1", aimL, bdLtop, { color: "#2aa3c9", c1: [aimL[0] - 120, aimL[1] - 60], c2: [bdLtop[0] + 160, bdLtop[1] - 80] });
const cvA2 = dashCurve("cv-a2", aimL, bdRtop, { color: "#2aa3c9", c1: [aimL[0] + 120, aimL[1] - 60], c2: [bdRtop[0] - 160, bdRtop[1] - 60] });

// rings (L7) and crossing arrows (L8)
const RINGS = [
  { id: "rg0", c: at(L.LAPTOP, 0, 0, 70), rx: 190, ry: 150, lab: "签名界面" },
  { id: "rg1", c: at(L.MP, 0, 0, 80), rx: 360, ry: 220, lab: "内存池" },
  { id: "rg2", c: at(L.MINI.dex, 0, 0, 110), rx: 340, ry: 200, lab: "外部合约" },
  { id: "rg3", c: at(L.VEND, -100, 0, 80), rx: 110, ry: 120, lab: "升级权限" },
  { id: "rg4", c: at(L.BRIDGE, 0, 0, 60), rx: 330, ry: 190, lab: "跨链桥" },
];
let ringSvg = "";
RINGS.forEach((r) => {
  ringSvg += P.ring(r.id, r.c, r.rx, r.ry);
  const a = -2.2, p = [r.c[0] + r.rx * Math.cos(a), r.c[1] + r.ry * Math.sin(a)];
  const n = [Math.cos(a) / r.rx, Math.sin(a) / r.ry], nl = Math.hypot(...n);
  ringSvg += P.crossArrow(r.id + "-x", p, [-n[0] / nl, -n[1] / nl], 120);
});
// thin plate → target lines (L14–L19)
const plTop = (i) => at(L.PLATES[i], 0, 0, i === 5 ? 210 : 196);
const doorLock = at(L.VEND, -100, 28, 69);
const TL = [
  P.thinLine("tl0", plTop(0), at(L.VEND, 160, 20, 250), -260),
  P.thinLine("tl1", plTop(1), at(L.VEND, -100, 0, 80), -160),
  P.thinLine("tl2", plTop(2), vmA.tray, -120),
  P.thinLine("tl3", plTop(3), A.orc.dial, -220),
  P.thinLine("tl4", plTop(4), A.dex.icon, -120),
  P.thinLine("tl5a", plTop(5), A.br.booth, -120),
  P.thinLine("tl5c", plTop(5), A.lap.screen, -360),
  P.thinLine("tl5d", plTop(5), A.cal.head, -200),
];
const extras = P.dashBox("dlk-x", doorLock, 46, 40) + P.glove("glv", [A.orc.dial[0] + 40, A.orc.dial[1] + 18]) +
  `<g id="half-r" opacity="0"><circle cx="${f(vmA.trayOut[0] + 40)}" cy="${f(vmA.trayOut[1] + 14)}" r="30" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="9 6"/></g>`;
const sandwich = `<g id="sw-box" opacity="0">${X.letter ? "" : ""}<path d="M${f(beltP(-215)[0])} ${f(beltP(-215)[1] - 90)}L${f(beltP(35)[0])} ${f(beltP(35)[1] - 90)}L${f(beltP(35)[0])} ${f(beltP(35)[1] + 14)}L${f(beltP(-215)[0])} ${f(beltP(-215)[1] + 14)}Z" fill="rgba(224,69,58,0.05)" stroke="#e0453a" stroke-width="4" stroke-dasharray="10 7"/></g>`;

const world = worldSvg("wsvg", gridSvg({ u0: -3200, u1: 3200, v0: -2400, v1: 2200 }) + under + ground + items.map((x) => x.svg).join("\n") +
  topLayer + ringSvg + TL.map((t) => t.svg).join("") + extras + sandwich +
  cvCall.svg + cvRe.svg + cvB1.svg + cvB2.svg + cvS1.svg + cvS2.svg + cvA1.svg + cvA2.svg, [-2600, -1800, 5600, 3600]);

// ---------------------------------------------------------------- labels (world, counter-scaled)
let labels = "";
const lab = (id, p, html, cls = "", anchor = "b") => { labels += wlab(id, p, html, cls + " hide", anchor); };
const up = (p, dy) => [p[0], p[1] - dy];
lab("lb-tx", up(tx.anchors.top, 4), "一笔交易", "lab-cs");
lab("lb-usr", A.usr.top, "用户 · EOA");
lab("lb-atk", A.atk.top, "攻击者 · EOA", "lab-rs");
lab("lb-lap", A.lap.top, "钱包与前端 · 签名界面");
lab("lb-mp", A.mp.top, "Mempool · 公开排队");
lab("lb-mag", A.mag.top, "谁都能看", "lab-g");
lab("lb-so", up(A.so.top, -10), "区块构建者 / 排序器");
[0, 1, 2].forEach((i) => lab("ch" + i, up([beltP([-170, -10, -90][i])[0], beltP([-170, -10, -90][i])[1]], 78), String(i + 1), "lab-ink lab-sm"));
lab("lb-vm", vmA.top, "目标合约 · 业务逻辑");
lab("lb-tok", tokA.top, "代币", "lab-sm");
lab("lb-dex", A.dex.top, "DEX", "lab-sm");
lab("lb-orc", A.orc.top, "预言机", "lab-sm");
lab("lb-px", up(vmA.maintTop, 40), "代理与实现", "lab-cs", "r");
lab("lb-upg", up(vmA.maintTop, -14), "升级权限", "", "r");
lab("lb-br", up(A.br.booth, 40), "跨链桥 / 消息层");
lab("lb-far", up(A.far.top, 10), "另一条链上的合约");
RINGS.forEach((r) => lab("lb-" + r.id, [r.c[0], r.c[1] - r.ry - 6], r.lab, "lab-r lab-sm"));
lab("lb-call", [cvCall.P[1][0] + 30, cvCall.P[1][1] - 6], "调用", "lab-cs lab-sm");
{ const m = bez(...cvRe.P, 0.55); lab("lb-re", [m[0] + 40, m[1] + 30], "回调 → 重入", "lab-rs", "l"); }
labels += wpin("prog", up(vmA.top, -10), `<div class="prog hide" id="prog-i"><div class="pt">你的函数</div><div class="pb"><div class="pf"></div></div><div class="pt2">执行到一半</div></div>`, "b");
lab("lb-so2", up(A.so.top, -10), "区块构建者 / 排序器");
lab("lb-ord", [beltP(-90)[0], beltP(-90)[1] - 110], "顺序可被利用", "lab-rs");
lab("lb-base", sinkP(at({ u: -1100, v: L.BASE.v1 + 60 }, 0, 0, -22)), "图上没画：共识层 · 节点", "lab-g", "t");
lab("lb-dead", at(L.VEND, -110, 0, 330), "合约写得再对也没用", "lab-rs", "r");
const dlP = doorLock;
lab("k0", [dlP[0] - 150, dlP[1] - 74], "缺少修饰器", "lab-g lab-sm", "r");
lab("k1", [dlP[0] - 150, dlP[1] - 6], "未初始化", "lab-g lab-sm", "r");
lab("k2", [dlP[0] - 150, dlP[1] + 62], "私钥泄露", "lab-r lab-sm", "r");
lab("lb-math", [vmA.trayOut[0] + 90, vmA.trayOut[1] + 10], "溢出 · 精度 · 舍入方向", "lab-g", "l");
lab("lb-spot", [A.orc.dial[0] + 70, A.orc.dial[1] - 30], "现货价格预言机", "lab-r lab-sm", "l");
lab("lb-replay", up(A.dc2.top, 0), "签名重放", "lab-r lab-sm");
lab("lb-ok", up(vmA.top, 0), "代码没错", "lab-gs");
lab("lb-arb", [A.trd.head[0] + 50, A.trd.head[1] + 30], "规格可被套利", "lab-rs", "l");
lab("lb-xv", up(A.br.booth, 40), "跨链验证", "lab-r lab-sm");
lab("lb-fe", up(A.lap.top, 0), "前端篡改", "lab-r lab-sm");
lab("lb-se", up(A.cal.top, 0), "社会工程", "lab-r lab-sm");
lab("lb-in", [A.rcl.head[0] - 60, A.rcl.head[1] - 10], "入口 · 社工", "lab-rs", "r");
lab("lb-land", at(L.R_KEY, -60, 90), "落点 · 前端 / 私钥", "lab-rs", "t");
lab("lb-ai", up(A.aim.top, 10), "AI · 放大器");
lab("lb-ai2", [A.aim.top[0], A.aim.top[1] + 40], "攻防两边", "lab-g lab-sm", "t");
// plate words (on the boards)
const PLT = ["① 控制流", "② 权限", "③ 数学", "④ 数据可信度", "⑤ 经济设计", "⑥ 系统与运营"];
PLT.forEach((t, i) => { labels += wpin("ptp" + i, A["pl" + i].board, `<div class="ptx hide${i === 5 ? " ptx6" : ""}" id="pt${i}">${t}</div>`, "c"); });

// ---------------------------------------------------------------- cameras
// fit(points, kmax, rect): smallest camera that shows every world-canvas point inside rect (screen px)
const RECT = { x0: 110, x1: 1810, y0: 165, y1: 880 };
function fit(ps, kmax = 1.4, r = RECT) {
  const xs = ps.map((p) => p[0]), ys = ps.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const k = Math.min(kmax, (r.x1 - r.x0) / Math.max(1, x1 - x0), (r.y1 - r.y0) / Math.max(1, y1 - y0));
  return camAt([(x0 + x1) / 2, (y0 + y1) / 2], (r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2, Math.round(k * 1000) / 1000);
}
const W3 = (o, du = 0, dv = 0, z = 0) => at(o, du, dv, z);
const plB = (i, dz = 0) => [A["pl" + i].board[0], A["pl" + i].board[1] - dz];
const CAMS = {
  open: fit([up(A.mp.top, 10), A.usr.top, A.atk.top, W3(L.ATK, -60, 80), A.lap.top, W3(L.LAPTOP, 160, 120), up(A.atk.top, 60)], 1.35),
  lap: fit([up(A.mp.top, 10), A.usr.top, W3(L.ATK, -60, 80), up(A.lap.top, 50), W3(L.LAPTOP, 220, 120), up(A.atk.top, 60)], 1.35),
  mp: fit([W3(L.LAPTOP, 0, 100), up(A.mp.top, 40), W3(L.MP, 300, 160), W3(L.MP, -300, 160), A.mag.top, W3(L.MAG, 0, 60)], 1.3),
  so: fit([W3(L.MP, 200, -120, 100), up(A.so.top, 50), up(vmA.top, 20), W3(L.SO, 300, 60), W3(L.SO, -260, 80), W3(L.MP, 150, 160)], 1.4),
  vm: fit([W3(L.SO, 260, 60), W3(L.SO, -160, 60), up(vmA.top, 30), W3(L.VEND, 120, 120), W3(L.VEND, -160, 0, 300)], 1.4),
  vmWide: fit([up(vmA.maintTop, 60), W3(L.VEND, -220, 0, 120), up(A.orc.top, 30), W3(L.MINI.oracle, 80, 100), W3(L.VEND, 0, 220)], 1.2),
  bridge: fit([W3(L.VEND, -100, 0, 330), W3(L.VEND, -60, RV + 60), up(A.br.booth, 70), up(A.far.top, 50), W3(FAR, 120, 100), W3(L.BRIDGE, 0, 300)], 1.0),
  wideA: fit([A.atk.top, W3(L.ATK, -60, 100), up(A.far.top, 40), W3(FAR, 120, 0), W3(L.LAPTOP, 0, -200, 300), W3(L.BRIDGE, 0, 320)], 0.8),
  re: fit([W3(L.VEND, -110, 0, 300), up(vmA.top, 150), W3(L.VEND, 0, 140), up(A.tok.top, 10), W3(L.MINI.token, 160, 60), W3(L.MINI.dex, 0, 0, 200)], 1.4),
  so2: fit([up(A.so.top, 50), up(vmA.top, 20), up(A.orc.top, 10), W3(L.SO, 300, 60), W3(L.SO, -300, 60), W3(R2o, 0, 60), W3(R1o, 80, 60)], 1.35),
  base: fit([up(A.mp.top, 0), W3(L.VEND, 0, 0, 312), sinkP(W3({ u: L.BASE.u0, v: L.BASE.v1 }, 0, 0, -30)), sinkP(W3({ u: L.BASE.u1, v: L.BASE.v1 }, 0, 0, -30)), W3(L.VEND, 520, 0, 150)], 1.0, { x0: 110, x1: 1810, y0: 200, y1: 880 }),
  plates: fit([plB(0, -60), plB(5, -60), up(A.pl5.top, 10), up(A.orc.top, 0), up(A.so.top, 0), W3(L.VEND, -300, 0, 120), up(vmA.top, 30), W3(L.PLATES[0], -200, 0)], 1.0),
  wideB: fit([up(A.far.top, 40), W3(FAR, 120, 0), up(A.cal.top, 40), W3(L.CALLER, 0, 80), [A.lap.top[0] - 140, A.lap.top[1] - 20], W3(L.LAPTOP, -160, 0), plB(0, -60), plB(5, -60), W3(L.PLATES[5], 240, 0)], 0.8),
  c1: fit([plB(0, -60), up(A.pl0.top, 10), up(vmA.top, 20), up(A.tok.top, 0), W3(L.MINI.token, 80, 80), W3(L.PLATES[0], -220, 0)], 1.0),
  c2: fit([plB(1, -60), plB(0, -60), up(A.pl1.top, 10), up(vmA.top, 20), W3(L.VEND, -330, 0, 150), W3(L.KEYDROP, -100, 60), W3(L.PLATES[1], 220, 0)], 1.0),
  c3: fit([plB(2, -60), plB(1, -60), plB(0, -60), up(A.pl2.top, 10), up(vmA.top, 20), [vmA.trayOut[0] + 430, vmA.trayOut[1]], W3(L.PLATES[2], -220, 0)], 1.0),
  c4: fit([plB(3, -60), plB(2, -60), plB(1, -60), up(A.pl3.top, 10), up(A.orc.top, 20), [A.orc.dial[0] + 400, A.orc.dial[1]], W3(DOC2, 120, 80), W3(L.PLATES[3], -220, 0)], 1.0),
  c5: fit([plB(4, -60), plB(3, -60), plB(2, -60), up(A.pl4.top, 10), up(vmA.top, 40), up(A.dex.top, 0), up(A.trd.top, 40), W3(L.STACK, 80, 60), W3(L.PLATES[4], 220, 0)], 1.0),
  split: fit([up(A.bdL.top, 20), up(A.bdR.top, 20), W3(L.L_RPC, -120, 80), W3(L.R_KEY, 160, 60), W3(L.L_CHAIN, 0, 120), up(A.aim.top, 20), up(A.rcl.top, 40), W3(L.R_LAPTOP, 0, -60, 260)], 1.25),
};

// ---------------------------------------------------------------- screen overlays
const S = (cam, p) => toScreen(CAMS[cam], p);
const ov = [];
const sc = (id, P0, P3, o) => { const c = dashCurve(id, P0, P3, o); ov.push(c.svg); return c; };
const INS = { x: 540, y: 108, w: 440, svgH: 230 };
const p5 = S("wideB", plTop(5));
sc("cv-ins", [p5[0] - 10, p5[1] - 10], [INS.x + INS.w + 4, INS.y + 220], { color: "#2aa3c9", c1: [p5[0] - 140, p5[1] - 160], c2: [INS.x + INS.w + 180, INS.y + 240] });
const EU = { x: 520, y: 108, w: 450 };
const p3 = S("wideB", plTop(3)), p4 = S("wideB", plTop(4));
sc("cv-e5", [p4[0], p4[1] - 6], [EU.x + EU.w + 4, EU.y + 168], { color: "#e0453a", c1: [p4[0] - 260, p4[1] - 240], c2: [EU.x + EU.w + 260, EU.y + 168] });
sc("cv-e4", [p3[0], p3[1] - 6], [EU.x + EU.w + 4, EU.y + 238], { color: "#e0453a", c1: [p3[0] - 300, p3[1] - 120], c2: [EU.x + EU.w + 220, EU.y + 250] });
const ovSvg = `<svg id="ovl" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">${ov.join("")}</svg>`;
// Bybit inset (small far-away picture: the cold-wallet safe + a key)
const ivSafe = O.safe({ u: 0, v: 0 }, { id: "ivs", plate: "COLD" }), ivKey = O.key({ u: 260, v: 160 }, { id: "ivk" });
const inset = `<div class="card hide" id="ins" style="left:${INS.x}px;top:${INS.y}px;width:${INS.w}px">
  <div class="ch">Bybit 区 · 远处</div>
  <div class="ivw"><svg data-layout-ignore width="${INS.w - 32}" height="${INS.svgH}" viewBox="-230 -360 620 470">${isoDefs()}${gridSvg({ u0: -800, u1: 800, v0: -800, v1: 800 })}${ivSafe.svg}${ivKey.svg}</svg>
  <div class="ivl hide" id="ins-l">多签私钥</div></div></div>`;
const euler = `<div class="card hide" id="eu" style="left:${EU.x}px;top:${EU.y}px;width:${EU.w}px">
  <div class="ch"><span class="yr">2023</span>Euler</div>
  <div class="er hide" id="er0"><span class="eb">⑤</span>业务逻辑缺陷</div>
  <div class="er hide" id="er1"><span class="plus">+</span><span class="eb">④</span>闪电贷放大</div></div>`;
const CK = { x: 56, y: 108, w: 420 };
const check = `<div class="card hide" id="ck" style="left:${CK.x}px;top:${CK.y}px;width:${CK.w}px">
  <div class="ch">审计清单</div>
  ${PLT.map((t, i) => `<div class="cr"><span class="cb"><span class="tk hide" id="tk${i}">✓</span></span>${t}</div>`).join("")}
  <div class="stamp hide" id="ck-st" data-layout-allow-overlap>✕ 只打勾不够</div></div>`;

// ---------------------------------------------------------------- times
const TM = {
  follow: w("跟着", 0), atk1: w("攻击者", 1), wallet: w("钱包", 1), sign1: w("签名界面", 1),
  mp2: w("内存池", 2), pub: w("公开排队", 2),
  bld: w("区块构建者", 3), srt: w("排序器", 3), order: w("谁先谁后", 3),
  tgt: w("目标合约", 4), biz: w("业务逻辑", 4),
  ext5: w("外部合约", 5), tok: w("代币", 5), dex: w("DEX", 5), orc: w("预言机", 5), proxy: w("代理", 5), upg: w("升级权限", 5),
  br6: w("跨链桥", 6), other: w("另一条链", 6),
  five: w("五个地方", 7), r0: w("签名界面", 7), r1: w("内存池", 7), r2: w("外部合约", 7), r3: w("升级权限", 7) + 0.3, r4: w("跨链桥", 7),
  tb: w("信任边界", 8), cross: w("跨过去", 8), bug: w("漏洞", 8),
  back: w("往回走", 9), half: w("执行到一半", 9), callback: w("调回", 9), reent: w("重入", 9),
  seq: w("顺序", 10), exploit: w("利用", 10),
  limit: w("局限", 11), cons: w("共识", 11), node: w("节点", 11),
  broken: w("链被攻破", 12), nodeData: w("节点数据", 12), useless: w("没用", 12),
  six: w("六大类", 13),
  c1: w("控制流", 14), cut: w("插队", 14), re14: w("重入", 14),
  c2: w("权限", 15), mod: w("缺少修饰器", 15), init: w("未初始化", 15), pk: w("私钥泄露", 15),
  c3: w("数学", 16), ovf: w("溢出", 16), round: w("舍入方向", 16),
  c4: w("数据可信度", 17), manip: w("操纵", 17), spot: w("现货价格", 17), replay: w("签名重放", 17),
  c5: w("经济设计", 18), spec: w("按规格", 18), arb: w("套利", 18),
  c6: w("系统与运营", 19), outside: w("代码之外", 19), xv: w("跨链验证", 19), ms: w("多签私钥", 19), fe: w("前端篡改", 19), se: w("社会工程", 19),
  stack: w("叠加", 20), euler: w("Euler", 20), logic: w("业务逻辑缺陷", 20), flash: w("闪电贷", 20),
  two: w("两块", 21), chainSelf: w("链本身", 21), readChain: w("读链", 21), people: w("人", 21),
  entry: w("入口", 22), land: w("落点", 22), ai: w("AI", 22), amp: w("放大器", 22),
};
const F = (x) => f(x);
const J = JSON.stringify;

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 84px; }
    .kw { position: absolute; left: 56px; top: 108px; font-size: 40px; font-weight: 900; color: #1c1c1c; background: #fffdf8; border-radius: 16px; padding: 10px 28px 14px;
      box-shadow: 0 10px 24px rgba(70,60,40,0.12); white-space: nowrap; text-align: left; }
    .kw.red { background: #e0453a; color: #ffffff; font-size: 52px; }
    .kw .sub { display: block; font-size: 30px; font-weight: 700; color: #ffffff; opacity: 0.95; margin-top: 4px; }
    .ptx { font-size: 30px; font-weight: 900; color: #1c1c1c; white-space: nowrap; }
    .ptx6 { font-size: 34px; color: #17809f; }
    .prog { background: #fffdf8; border-radius: 14px; box-shadow: 0 8px 18px rgba(70,60,40,0.12); padding: 10px 18px 12px; text-align: center; }
    .prog .pt, .prog .pt2 { font-size: 30px; font-weight: 900; white-space: nowrap; }
    .prog .pt2 { color: #c3352b; }
    .prog .pb { width: 240px; height: 22px; border-radius: 11px; background: #e2ddd3; margin: 8px auto; overflow: hidden; }
    .prog .pf { width: 50%; height: 100%; background: #2aa3c9; }
    .card { position: absolute; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); padding: 18px 24px 20px; }
    .card .ch { font-size: 32px; font-weight: 900; height: 54px; line-height: 46px; border-bottom: 3px solid #1c1c1c; margin-bottom: 10px; white-space: nowrap; }
    .card .ch .yr { display: inline-block; margin-right: 14px; font-size: 28px; color: #ffffff; background: #1c1c1c; border-radius: 8px; padding: 0 12px; line-height: 40px; vertical-align: 3px; }
    .card .ivw { position: relative; height: ${INS.svgH}px; background: #efebe3; border-radius: 12px; overflow: hidden; }
    .card .ivl { position: absolute; right: 14px; bottom: 14px; font-size: 30px; font-weight: 900; color: #c3352b; background: #ffffff; border: 3px solid #e0453a; border-radius: 10px; padding: 0 14px 4px; }
    .card .er { height: 64px; line-height: 64px; font-size: 32px; font-weight: 900; white-space: nowrap; }
    .card .eb { display: inline-block; width: 46px; height: 46px; line-height: 44px; text-align: center; border-radius: 10px; background: #1d93ba; color: #fff; font-size: 30px; margin-right: 14px; vertical-align: 4px; }
    .card .plus { display: inline-block; width: 30px; color: #6d685e; }
    .card .cr { height: 44px; line-height: 44px; font-size: 28px; font-weight: 700; white-space: nowrap; }
    .card .cb { display: inline-block; width: 30px; height: 30px; border: 3px solid #8a8478; border-radius: 6px; margin-right: 14px; vertical-align: -6px; position: relative; }
    .card .tk { position: absolute; left: 1px; top: -9px; font-size: 26px; line-height: 40px; font-weight: 900; color: #1f9d55; }
    .card .stamp { position: absolute; left: 70px; top: 150px; font-size: 40px; font-weight: 900; color: #6d685e; border: 6px solid #8a8478; border-radius: 12px; padding: 6px 22px 10px; transform: rotate(-8deg); background: rgba(255,253,248,0.9); white-space: nowrap; }
    .tcard { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
      padding: 14px 26px 18px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
    .tcard .t1 { font-size: 32px; font-weight: 900; white-space: nowrap; }
    .tcard .t2 { margin-top: 6px; font-size: 29px; font-weight: 700; color: #3d3a35; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div class="kw hide" id="kw5">这条路上 · 五个最危险的地方</div>
      <div class="kw red hide" id="kwtb">信任边界<span class="sub hide" id="kwtb-s">数据 · 控制权从这里跨过去 · 漏洞最集中</span></div>
      ${inset}${euler}${check}${ovSvg}
      <div class="tcard hide" id="term1"><div class="t1">DEX</div><div class="t2">去中心化交易所 · 用合约兑换代币</div></div>
      <div class="tcard hide" id="term2"><div class="t1">预言机</div><div class="t2">向合约提供外部数据（如价格）的机制</div></div>
      <div class="tcard hide" id="term3"><div class="t1">修饰器</div><div class="t2">在函数执行前插入检查的语法</div></div>
      ${pills(3, { sections: SECTIONS })}
      <div class="k-title" id="ttl-card"><div class="t-main">③ 攻击面地图</div><div class="t-sub">跟着一笔交易</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${J(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const hideAt0 = (ids) => ids.forEach((id) => { const g = $(id), v = { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }; gsap.set("#" + id, v); tl.set("#" + id, v, 0); });
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      const walk = (id, t, dur, pts, ease) => KITX.walk(tl, id, t, dur, pts, ease);
      const drawThin = (id, t, dur) => { const m = $(id + "-m"), L = +m.getAttribute("stroke-dasharray").split(" ")[0]; tl.set("#" + id, { opacity: 1 }, t); tl.fromTo(m, { attr: { "stroke-dashoffset": L } }, { attr: { "stroke-dashoffset": 0 }, duration: dur || 0.6, ease: "power2.inOut", immediateRender: false }, t); };

      hideAt0(["tok", "dex", "orc", "kd", "dc", "dc2", "trd", "pl0", "pl1", "pl2", "pl3", "pl4", "pl5", "bdL", "bdR", "lrp", "lch", "llk", "rlap", "rkey", "aim", "far", "rpa", "rpb", "bch"]);
      gsap.set("#pp0, #pp1, #pp2, #calg, #rclg, #mag, #stk, #vm-maint", { opacity: 0 });

      KIT.camSet(tl, CAMS.open);
      // ===== 0–1.6 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.25);
      // ===== L0 follow one transaction: the envelope appears at the start of the road
      fadeIn("#tx", ${F(TM.follow - 0.3)}, 0.3); pop("#lb-tx", ${F(TM.follow)});
      // ===== L1 user / attacker EOA → wallet & front-end signing screen
      KIT.cam(tl, ${F(LS[1] - 0.2)}, CAMS.lap, 1.0);
      pop("#lb-usr", ${F(LS[1] + 0.1)}); pop("#lb-atk", ${F(TM.atk1)});
      out("#lb-tx", ${F(TM.wallet - 0.4)});
      walk("tx", ${F(TM.wallet - 0.3)}, 0.8, ${J(PATH.txToLap)});
      pop("#lb-lap", ${F(TM.sign1 - 0.3)});
      KIT.swap(tl, "#lap-scr", "#lap-scr2", ${F(TM.sign1 + 0.3)}, 0.2);
      // ===== L2 into the mempool, queued in public
      out("#lb-usr, #lb-atk, #lb-lap", ${F(LS[2] - 0.15)});
      KIT.cam(tl, ${F(LS[2] - 0.2)}, CAMS.mp, 1.1);
      walk("tx", ${F(LS[2] - 0.1)}, 2.0, ${J(PATH.txToMp)});
      pop("#lb-mp", ${F(TM.mp2)});
      fadeIn("#mag", ${F(TM.pub - 0.5)}, 0.3); pop("#lb-mag", ${F(TM.pub)});
      // ===== L3 builder / sequencer decides the order and packs a block
      out("#lb-mp, #lb-mag, #mag", ${F(LS[3] - 0.15)});
      KIT.cam(tl, ${F(LS[3] - 0.2)}, CAMS.so, 1.1);
      pop("#lb-so", ${F(TM.bld + 0.2)});
      walk("mp-env-0", ${F(LS[3] + 0.1)}, 1.1, ${J(PATH.env0)});
      walk("mp-env-1", ${F(LS[3] + 0.3)}, 1.1, ${J(PATH.env1)});
      walk("tx", ${F(LS[3] + 0.4)}, 1.5, ${J(PATH.tx3)});
      ["ch0", "ch1", "ch2"].forEach((id, i) => pop("#" + id, ${F(TM.srt + 0.3)} + i * 0.25));
      KITX.reach(tl, "so", ${F(TM.srt + 0.5)}, -150, 104, 0.6);
      KITX.reach(tl, "so", ${F(TM.srt + 1.2)}, 150, 110, 0.6);
      walk("tx", ${F(TM.srt + 1.2)}, 0.6, ${J([dropP])}); out("#ch0", ${F(TM.srt + 1.2)}); out("#tx", ${F(TM.srt + 1.75)}, 0.15);
      KITX.dash(tl, ["so-belt-0", "so-belt-1"], ${F(TM.srt + 1.4)}, 2.2, 140);
      walk("mp-env-0", ${F(TM.srt + 1.9)}, 0.55, ${J([dropP])}); out("#ch1", ${F(TM.srt + 1.9)}); out("#mp-env-0", ${F(TM.srt + 2.4)}, 0.15);
      walk("mp-env-1", ${F(TM.order - 0.1)}, 0.55, ${J([dropP])}); out("#ch2", ${F(TM.order - 0.1)}); out("#mp-env-1", ${F(TM.order + 0.4)}, 0.15);
      KITX.armPose(tl, "so", ${F(TM.order)}, 0, 0, 0.5);
      tl.to("#so-lid", { opacity: 1, duration: 0.25 }, ${F(TM.order + 0.6)});
      // ===== L4 the block reaches the target contract; gears turn (business logic)
      out("#lb-so", ${F(LS[4] - 0.1)});
      KIT.cam(tl, ${F(LS[4] - 0.2)}, CAMS.vm, 1.0);
      tl.set("#so-block, #so-lid", { opacity: 0 }, ${F(LS[4])}); tl.set("#blk", { opacity: 1 }, ${F(LS[4])});
      walk("blk", ${F(LS[4] + 0.05)}, 1.0, ${J(PATH.blk)});
      tl.to("#blk", { opacity: 0, duration: 0.35 }, ${F(TM.biz - 0.2)});
      pop("#lb-vm", ${F(TM.tgt)});
      KITX.gears(tl, "vm", ${F(TM.tgt + 0.1)}, ${F(LN[4].end - TM.tgt + 0.4)}, 1.6);
      KITX.press(tl, "vm", 1, ${F(TM.biz)});
      // ===== L5 external contracts; proxy + implementation = upgrade authority
      out("#lb-vm", ${F(LS[5] - 0.1)});
      KIT.cam(tl, ${F(LS[5])}, CAMS.vmWide, 1.2);
      KITX.gears(tl, "vm", ${F(TM.ext5)}, ${F(TM.tok - TM.ext5)}, 0.8); KITX.press(tl, "vm", 3, ${F(TM.ext5 + 0.2)}, "blue");
      fadeIn("#pp0", ${F(TM.tok - 0.3)}, 0.3); grow("tok", ${F(TM.tok - 0.2)}); pop("#lb-tok", ${F(TM.tok + 0.15)});
      fadeIn("#pp1", ${F(TM.dex - 0.3)}, 0.3); grow("dex", ${F(TM.dex - 0.2)}); pop("#lb-dex", ${F(TM.dex + 0.15)});
      fadeIn("#pp2", ${F(TM.orc - 0.3)}, 0.3); grow("orc", ${F(TM.orc - 0.2)}); pop("#lb-orc", ${F(TM.orc + 0.2)});
      tl.set("#pp0-flow, #pp1-flow, #pp2-flow", { opacity: 1 }, ${F(TM.orc + 0.3)});
      KITX.dash(tl, ["pp0-flow", "pp1-flow", "pp2-flow"], ${F(TM.orc + 0.3)}, ${F(LN[5].end - TM.orc)}, 260);
      KITX.needle(tl, "orc", ${F(TM.orc + 0.5)}, 25, 0.6);
      const term = (id, t0, t1) => { KIT.pop(tl, "#" + id, t0, 0.3); out("#" + id, t1, 0.2); };
      term("term1", ${F(TM.dex)}, ${F(TM.dex + 2.9)});
      term("term2", ${F(TM.dex + 3.15)}, ${F(Math.min(TM.dex + 6.6, LN[5].end - 0.1))});
      fadeIn("#vm-maint", ${F(TM.proxy - 0.3)}, 0.3);
      KITX.sideDoor(tl, "vm", ${F(TM.proxy)}, 105, 1.0);
      pop("#lb-px", ${F(TM.proxy + 0.7)});
      pop("#lb-upg", ${F(TM.upg)});
      // ===== L6 some transactions cross the bridge to a contract on another chain
      out("#lb-tok, #lb-dex, #lb-orc, #lb-px, #lb-upg", ${F(LS[6] - 0.1)});
      KIT.cam(tl, ${F(LS[6] - 0.2)}, CAMS.bridge, 1.3);
      fadeIn("#tx2", ${F(LS[6] + 0.2)}, 0.2);
      walk("tx2", ${F(LS[6] + 0.3)}, ${F(LN[6].end - LS[6] - 0.6)}, ${J(PATH.tx2)}, "power1.inOut");
      KITX.dash(tl, "br-ripple", ${F(LS[6])}, ${F(TOTAL - LS[6])}, ${F((TOTAL - LS[6]) * 40)});
      pop("#lb-br", ${F(TM.br6)});
      grow("far", ${F(TM.other - 0.5)}); pop("#lb-far", ${F(TM.other)});
      // ===== L7 five most dangerous places
      out("#lb-br, #lb-far, #tx2", ${F(LS[7] - 0.1)});
      KIT.cam(tl, ${F(LS[7] - 0.1)}, CAMS.wideA, 1.4);
      pop("#kw5", ${F(TM.five)}, 0.3);
      ${J(["r0", "r1", "r2", "r3", "r4"])}.forEach((k, i) => { const t = ${J([TM.r0, TM.r1, TM.r2, TM.r3, TM.r4])}[i]; pop("#rg" + i, t - 0.1, 0.3); pop("#lb-rg" + i, t + 0.1); });
      // ===== L8 they are trust boundaries
      out("#kw5", ${F(LS[8] - 0.1)});
      pop("#kwtb", ${F(TM.tb)}, 0.3);
      [0, 1, 2, 3, 4].forEach((i) => pop("#rg" + i + "-x", ${F(TM.tb + 0.7)} + i * 0.18, 0.3));
      pop("#kwtb-s", ${F(TM.cross - 0.4)}, 0.3);
      // ===== L9 the backward arrow: callback → reentrancy (key frame)
      out("#kwtb, #rg0, #rg1, #rg2, #rg3, #rg4, #rg0-x, #rg1-x, #rg2-x, #rg3-x, #rg4-x, #lb-rg0, #lb-rg1, #lb-rg2, #lb-rg3, #lb-rg4", ${F(LS[9] - 0.15)}, 0.25);
      KIT.cam(tl, ${F(LS[9] - 0.2)}, CAMS.re, 1.2);
      KIT.draw(tl, "cv-call", ${F(LS[9] + 0.6)}, 0.7); pop("#lb-call", ${F(LS[9] + 1.1)});
      KITX.gears(tl, "vm", ${F(LS[9] + 0.8)}, ${F(TM.half - LS[9] - 0.6)}, 0.5);
      pop("#prog-i", ${F(TM.half)}, 0.3);
      KIT.draw(tl, "cv-re", ${F(TM.back)}, 1.0);
      KITX.press(tl, "vm", 2, ${F(TM.callback + 0.2)}, "red", 0.6);
      KITX.press(tl, "vm", 2, ${F(TM.callback + 1.2)}, "red", 0.6);
      pop("#lb-re", ${F(TM.reent)}, 0.3);
      // ===== L10 ordering can be exploited (sandwich on the builder's belt)
      out("#cv-call, #lb-call, #prog-i, #lb-re", ${F(LS[10] - 0.15)});
      tl.to("#cv-re", { opacity: 0, duration: 0.25 }, ${F(LS[10] - 0.15)});
      KIT.cam(tl, ${F(LS[10] - 0.2)}, CAMS.so2, 1.1);
      tl.set("#so-block", { opacity: 1 }, ${F(LS[10] - 0.2)});
      pop("#lb-so2", ${F(LS[10] + 0.3)});
      walk("mp-env-2", ${F(LS[10] + 0.4)}, 1.3, ${J(PATH.env2)});
      fadeIn("#r1w, #r2w", ${F(TM.seq - 0.3)}, 0.2);
      walk("r1", ${F(TM.seq)}, 0.9, ${J(PATH.r1)}); walk("r2", ${F(TM.seq + 0.3)}, 0.9, ${J(PATH.r2)});
      pop("#sw-box", ${F(TM.seq + 1.3)}, 0.3);
      pop("#lb-ord", ${F(TM.exploit - 0.8)});
      // ===== L11 limits of the map: consensus and nodes are not drawn
      out("#lb-so2, #lb-ord, #sw-box, #r1w, #r2w, #mp-env-2", ${F(LS[11] - 0.15)});
      KIT.cam(tl, ${F(LS[11] - 0.1)}, CAMS.base, 1.5);
      fadeIn("#soil", ${F(TM.limit)}, 0.4); fadeIn("#basep", ${F(TM.limit + 0.3)}, 0.4); fadeIn("#vls", ${F(TM.limit + 0.6)}, 0.4);
      grow("bch", ${F(TM.cons - 0.3)}); grow("rpa", ${F(TM.node - 0.2)}); grow("rpb", ${F(TM.node)});
      pop("#lb-base", ${F(TM.node + 0.3)});
      // ===== L12 chain attacked / node data wrong → correct contract is no help
      fadeIn("#bch2w", ${F(TM.broken + 0.2)}, 0.3);
      ["rpb-wave-0", "rpb-wave-1", "rpb-wave-2"].forEach((id) => tl.to("#" + id, { attr: { stroke: "#e0453a" }, duration: 0.2 }, ${F(TM.nodeData)}));
      KIT.led(tl, "rpb-led-0", ${F(TM.nodeData)}, "red");
      KIT.draw(tl, "cv-b1", ${F(TM.broken + 0.6)}, 0.8); KIT.draw(tl, "cv-b2", ${F(TM.nodeData + 0.4)}, 0.8);
      tl.to("#vm-glow", { opacity: 0, duration: 0.4 }, ${F(TM.nodeData + 0.9)}); fadeIn("#vm-gray", ${F(TM.nodeData + 0.9)}, 0.4);
      pop("#lb-dead", ${F(TM.useless - 0.8)});
      // ===== L13 six classes: blank plates rise along the road
      out("#lb-base, #lb-dead, #cv-b1, #cv-b2, #soil, #basep, #vls, #bch, #bch2w, #rpa, #rpb", ${F(LS[13] - 0.1)}, 0.3);
      tl.to("#vm-glow", { opacity: 1, duration: 0.4 }, ${F(LS[13])}); out("#vm-gray", ${F(LS[13])}, 0.3);
      KITX.sideDoor(tl, "vm", ${F(LS[13])}, 0, 0.8);
      KIT.cam(tl, ${F(LS[13] - 0.1)}, CAMS.plates, 1.5);
      [0, 1, 2, 3, 4, 5].forEach((i) => grow("pl" + i, ${F(TM.six - 0.6)} + i * 0.12, 0.5));
      // ===== L14 ① control flow → the callback arrow
      KIT.cam(tl, ${F(LS[14] - 0.1)}, CAMS.c1, 1.0);
      pop("#pt0", ${F(TM.c1)}, 0.3); drawThin("tl0", ${F(TM.c1 + 0.3)}, 0.7);
      tl.to("#cv-re", { opacity: 1, duration: 0.3 }, ${F(TM.cut)});
      KITX.press(tl, "vm", 2, ${F(TM.re14)}, "red", 0.6);
      // ===== L15 ② permissions → maintenance door
      KIT.cam(tl, ${F(LS[15] - 0.1)}, CAMS.c2, 1.0);
      out("#tl0", ${F(LS[15] - 0.1)}); tl.to("#cv-re", { opacity: 0, duration: 0.2 }, ${F(LS[15] - 0.1)});
      pop("#pt1", ${F(TM.c2)}, 0.3); drawThin("tl1", ${F(TM.c2 + 0.3)}, 0.7);
      tl.to("#vm-dlock", { opacity: 0.15, duration: 0.3 }, ${F(TM.mod)}); pop("#dlk-x", ${F(TM.mod)}, 0.3); pop("#k0", ${F(TM.mod + 0.1)});
      term("term3", ${F(TM.mod + 0.3)}, ${F(TM.mod + 3.8)});
      pop("#k1", ${F(TM.init)});
      grow("kd", ${F(TM.pk - 0.2)}, 0.4); pop("#k2", ${F(TM.pk + 0.1)});
      // ===== L16 ③ math → one coin too many, half a coin to the wrong side
      KIT.cam(tl, ${F(LS[16] - 0.1)}, CAMS.c3, 1.0);
      out("#tl1, #k0, #k1, #k2, #dlk-x", ${F(LS[16] - 0.1)});
      pop("#pt2", ${F(TM.c3)}, 0.3); drawThin("tl2", ${F(TM.c3 + 0.3)}, 0.7);
      KITX.dispense(tl, "vm", ${F(TM.c3 + 1.0)}, { n: 3 });
      pop("#lb-math", ${F(TM.ovf)});
      tl.to("#vm-half", { opacity: 1, duration: 0.2 }, ${F(TM.round)}); pop("#half-r", ${F(TM.round + 0.1)}, 0.3);
      // ===== L17 ④ data trust → the oracle needle is pushed; a signed paper is copied
      KIT.cam(tl, ${F(LS[17] - 0.1)}, CAMS.c4, 1.0);
      out("#tl2, #lb-math, #half-r", ${F(LS[17] - 0.1)});
      pop("#pt3", ${F(TM.c4)}, 0.3); drawThin("tl3", ${F(TM.c4 + 0.3)}, 0.7);
      fadeIn("#glv", ${F(TM.manip - 0.5)}, 0.3);
      KITX.needle(tl, "orc", ${F(TM.manip)}, 62, 0.4); KITX.needle(tl, "orc", ${F(TM.manip + 0.6)}, -55, 0.5); KITX.needle(tl, "orc", ${F(TM.manip + 1.3)}, 58, 0.5);
      pop("#lb-spot", ${F(TM.spot)});
      grow("dc", ${F(TM.replay - 1.0)}); grow("dc2", ${F(TM.replay - 0.3)}); pop("#lb-replay", ${F(TM.replay + 0.1)});
      // ===== L18 ⑤ economic design → code fine, the spec can be arbitraged
      KIT.cam(tl, ${F(LS[18] - 0.1)}, CAMS.c5, 1.0);
      out("#tl3, #lb-spot, #lb-replay, #glv", ${F(LS[18] - 0.1)}); out("#dc, #dc2", ${F(LS[18] - 0.1)}, 0.3);
      pop("#pt4", ${F(TM.c5)}, 0.3); drawThin("tl4", ${F(TM.c5 + 0.3)}, 0.7);
      grow("trd", ${F(TM.c5 + 0.6)});
      pop("#lb-ok", ${F(TM.spec)});
      [0, 1, 2, 0, 2, 1].forEach((b, i) => KITX.press(tl, "dex", b, ${F(TM.spec + 0.4)} + i * 0.42, "blue", 0.25));
      tl.set("#stk", { opacity: 1 }, ${F(TM.spec + 0.4)});
      for (let i = 0; i < 9; i++) tl.to("#stk-" + i, { opacity: 1, duration: 0.12 }, ${F(TM.spec + 0.5)} + i * 0.3);
      pop("#lb-arb", ${F(TM.arb - 0.3)});
      // ===== L19 ⑥ systems & operations → bridge, Bybit (far), front-end, social engineering
      out("#tl4, #lb-ok, #lb-arb", ${F(LS[19] - 0.1)}); out("#trd, #stk", ${F(LS[19] - 0.1)}, 0.3);
      KIT.cam(tl, ${F(LS[19] - 0.2)}, CAMS.wideB, 1.0);
      pop("#pt5", ${F(TM.c6)}, 0.3);
      tl.fromTo("#pt5", { scale: 1 }, { scale: 1.12, duration: 0.2, yoyo: true, repeat: 1, ease: "power1.inOut", immediateRender: false }, ${F(TM.c6 + 0.35)});
      drawThin("tl5a", ${F(TM.xv - 0.2)}, 0.7); pop("#lb-xv", ${F(TM.xv + 0.3)}); KIT.led(tl, "br-booth-led", ${F(TM.xv + 0.3)}, "red");
      pop("#ins", ${F(TM.ms - 0.4)}, 0.3); KIT.draw(tl, "cv-ins", ${F(TM.ms - 0.2)}, 0.6); pop("#ins-l", ${F(TM.ms + 0.3)});
      drawThin("tl5c", ${F(TM.fe - 0.2)}, 0.7); pop("#lb-fe", ${F(TM.fe + 0.3)});
      fadeIn("#calg", ${F(TM.se - 0.4)}, 0.3); drawThin("tl5d", ${F(TM.se - 0.2)}, 0.6); pop("#lb-se", ${F(TM.se + 0.25)});
      // ===== L20 real incidents stack several classes: Euler = ⑤ + ④; a checklist is not enough
      out("#tl5a, #tl5c, #tl5d, #lb-xv, #lb-fe, #lb-se, #ins, #cv-ins", ${F(LS[20] - 0.1)}, 0.25); out("#calg", ${F(LS[20] - 0.1)}, 0.3);
      pop("#ck", ${F(TM.stack - 0.6)}, 0.3);
      [0, 1, 2, 3, 4, 5].forEach((i) => pop("#tk" + i, ${F(TM.stack)} + i * 0.22, 0.2));
      pop("#eu", ${F(TM.euler - 0.3)}, 0.3);
      pop("#er0", ${F(TM.logic)}, 0.3); KIT.draw(tl, "cv-e5", ${F(TM.logic)}, 0.6);
      pop("#er1", ${F(TM.flash)}, 0.3); KIT.draw(tl, "cv-e4", ${F(TM.flash)}, 0.6);
      pop("#ck-st", ${F(TM.flash + 0.5)}, 0.3);
      // ===== L21 class ⑥ splits into two boards
      out("#eu, #ck, #cv-e4, #cv-e5", ${F(LS[21] - 0.1)}, 0.25);
      out("#pt0, #pt1, #pt2, #pt3, #pt4", ${F(LS[21])}, 0.3);
      ["pl0", "pl1", "pl2", "pl3", "pl4"].forEach((id) => tl.to("#" + id, { opacity: 0, duration: 0.35 }, ${F(LS[21])}));
      KIT.cam(tl, ${F(LS[21])}, CAMS.split, 1.6);
      out("#pl5, #pt5", ${F(TM.two + 0.1)}, 0.3);
      grow("bdL", ${F(TM.two)}); grow("bdR", ${F(TM.two + 0.2)});
      grow("lch", ${F(TM.chainSelf - 0.1)}); grow("llk", ${F(TM.chainSelf + 0.3)}); grow("lrp", ${F(TM.readChain - 0.1)});
      fadeIn("#rclg", ${F(TM.people - 0.2)}, 0.3); grow("rlap", ${F(TM.people + 0.2)}); grow("rkey", ${F(TM.people + 0.5)});
      // ===== L22 social engineering is the entry, keys / front-end the landing; AI amplifies both sides
      pop("#lb-in", ${F(TM.entry)});
      KIT.draw(tl, "cv-s1", ${F(TM.entry + 0.4)}, 0.9); KIT.draw(tl, "cv-s2", ${F(TM.entry + 0.9)}, 0.9);
      pop("#lb-land", ${F(TM.land)});
      grow("aim", ${F(TM.ai - 0.2)}); pop("#lb-ai", ${F(TM.ai + 0.3)});
      KIT.draw(tl, "cv-a1", ${F(TM.ai + 1.2)}, 0.8); KIT.draw(tl, "cv-a2", ${F(TM.ai + 1.6)}, 0.8);
      pop("#lb-ai2", ${F(TM.amp - 0.6)});
      tl.set({}, {}, ${F(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes");
