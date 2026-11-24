// Generates compositions/story.html for ep01/seg5「⑤ 攻击者能做什么」.
// Run: node src/build-story.mjs
// World: the plaza's vending machine (= the contract) at uv (0,0); a drafting workbench to its west;
// each attacker ability has its own vignette around the machine (see LAYOUT below / SPEC.md).
import fs from "node:fs";
import { G, at, f, Wp, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, kitCss, runtimeJs, BADGE, CE } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as X3 from "../../../ep03/kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { wrap, workbench, stepBoard, toolbox, dome, wrench, coinStack, anchorIcon, slit, mask, groundFrame } from "./props.mjs";
import { LAYOUT as LY } from "./layout.mjs";
import { PLAZA, VEND, ROAD, GALLERY, BY } from "../../seg1/src/layout.mjs";
import { U, V, matStr } from "../../../kit/iso.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const w = (term, line, o = {}) => wordAt(T, term, { line, ...o }).start;
const L = (i) => lineAt(T, i);
const LS = (i) => L(i).start, LE = (i) => L(i).end;

// ---------------------------------------------------------------- plaza ground outlines (same as seg1 end state)
const TOPM = matStr([U[0], U[1], V[0], V[1], 0, 0]);
const OUTL = "#cfc7b8";
const outline = `<g id="outl"><g transform="${TOPM}">
  <rect x="${PLAZA.u0}" y="${PLAZA.v0}" width="${PLAZA.u1 - PLAZA.u0}" height="${PLAZA.v1 - PLAZA.v0}" rx="60" fill="none" stroke="${OUTL}" stroke-width="10" stroke-dasharray="60 40"/>
  <rect x="${ROAD.u0}" y="${ROAD.v - ROAD.half}" width="${ROAD.u1 - ROAD.u0}" height="${2 * ROAD.half}" fill="#f6f3ec" stroke="${OUTL}" stroke-width="8"/>
  <path d="M${ROAD.u0 + 40} ${ROAD.v}H${ROAD.u1 - 40}" stroke="${OUTL}" stroke-width="8" stroke-dasharray="70 60"/>
  <circle cx="${VEND.u}" cy="${VEND.v}" r="300" fill="#f6f3ec" stroke="${OUTL}" stroke-width="8" stroke-dasharray="40 26"/>
  <rect x="${GALLERY.u0}" y="${GALLERY.v0}" width="${GALLERY.u1 - GALLERY.u0}" height="${GALLERY.v1 - GALLERY.v0}" rx="16" fill="#f6f3ec" stroke="${OUTL}" stroke-width="8"/>
  <rect x="${BY.u - 980}" y="${BY.v - 360}" width="1580" height="1020" rx="40" fill="none" stroke="${OUTL}" stroke-width="8" stroke-dasharray="40 26"/>
</g></g>`;

// ---------------------------------------------------------------- objects
const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const A = {};
const put = (name, r, o, dy = 0) => { A[name] = r.anchors; add(o, r.svg, dy); return r; };
const rel = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });

const VM = LY.vm;
put("vm", X.vending(VM, { id: "vm", maintDoor: true }), VM);
put("atk", O.person(LY.atk, { id: "atk", role: "attacker" }), LY.atk);
put("tb", toolbox(LY.toolbox, { id: "tb" }), LY.toolbox);
put("wb", workbench(LY.wb, { id: "wb" }), LY.wb);
put("board", stepBoard(LY.board, { id: "board" }), LY.board);
// storage cabinet (ep03 kit) + pipe from the machine's −u face
const cabOpts = { id: "cab", n: 4, cell: 7, glass: true, tags: { 2: "private" },
  fill: { 0: [{ bytes: 20, color: "teal" }], 1: [{ bytes: 32, color: "teal" }], 2: [{ bytes: 32, color: "ink" }], 3: [{ bytes: 12, color: "gray" }] } };
put("cab", X3.slotCabinet(LY.cab, cabOpts), LY.cab, 2);
put("pcab", X.pipe(VM, { id: "pcab", pts: [[-100, 0, 96], [LY.cab.u - VM.u + 144, 0, 96]] }), LY.cab, 1);
// attacker contract + pipe from the machine front
put("mal", X.miniVend(LY.mal, { id: "mal", kind: "attacker" }), LY.mal);
put("pmal", X.pipe(VM, { id: "pmal", pts: [[40, 75, 40], [40, LY.mal.v - VM.v, 40], [LY.mal.u - VM.u - 55, LY.mal.v - VM.v, 40]], flow: false, state: "attacker" }), LY.mal, 1);
put("fl", X.flashDesk(LY.fl, { id: "fl", gold: false, frame: true }), LY.fl);
put("mp", X.mempool(LY.mp, { id: "mp", n: 4 }), LY.mp);
const redA = X.letter(LY.redA, { id: "redA", state: "attacker", w: 84, h: 54, lift: 12 });
const redB = X.letter(LY.redB, { id: "redB", state: "attacker", w: 84, h: 54, lift: 12 });
items.push({ y: 1e6, svg: `<g id="redA-w" opacity="0">${redA.svg}</g>` }, { y: 1e6, svg: `<g id="redB-w" opacity="0">${redB.svg}</g>` });
// bridge + far contract + another contract on this side
const br = put("br", X.bridge(LY.br, { id: "br" }), LY.br);
const farO = G(...br.anchors.farBank);
put("far", X.vending(farO, { id: "far", scale: 0.55 }), LY.br, 2);
put("oth", X.vending(LY.oth, { id: "oth", scale: 0.55 }), LY.oth);
put("sdoc", O.doc(LY.sdoc, { id: "sdoc", title: "消息", w: 120, h: 150, stamp: true }), LY.sdoc);
const copies = ["cp1", "cp2"].map((id) => { const r = O.doc(LY.sdoc, { id, title: "消息", w: 120, h: 150, stamp: true }); const [px, py] = at(LY.sdoc); return `<g id="${id}-w" opacity="0" data-px="${f(px)}" data-py="${f(py)}">${r.svg}</g>`; });
items.push({ y: 1e6 + 2, svg: copies.join("") });
// can't-do props
const sealR = O.seal(LY.dome, { id: "seal", stamped: false });
put("dome", dome(LY.dome, { id: "dome", inner: sealR.svg }), LY.dome);
put("atk2", O.person(LY.atk2, { id: "atk2", role: "attacker" }), LY.atk2);
put("ch", O.chain(LY.chain, { id: "ch", n: 4 }), LY.chain);
put("lockN", O.padlock(LY.lockN, { id: "lockN", key: false }), LY.lockN);
// six-step props
put("bal", X.balance(LY.bal, { id: "bal", tilt: 6 }), LY.bal);
put("anc", anchorIcon(LY.anc, { id: "anc", h: 130 }), LY.anc, 1);
put("tlk", X.timeLock(LY.tlock, { id: "tlk", frac: 1 }), LY.tlock);
put("key", O.key(LY.key, { id: "key" }), LY.key);
put("tok", X.miniVend(LY.tok, { id: "tok", kind: "token" }), LY.tok);
put("dex", X.miniVend(LY.dex, { id: "dex", kind: "dex" }), LY.dex);
put("orc", X.miniVend(LY.orc, { id: "orc", kind: "oracle" }), LY.orc);
put("p1", X.pipe(LY.tok, { id: "p1", pts: [[55, 0, 64], [175, 0, 64]] }), LY.tok, 1);
put("p2", X.pipe(LY.dex, { id: "p2", pts: [[55, 0, 64], [175, 0, 64]] }), LY.dex, 1);
put("p0", X.pipe(VM, { id: "p0", pts: [[100, -40, 64], [300, -40, 64], [300, LY.tok.v - VM.v, 64], [LY.tok.u - VM.u - 55, LY.tok.v - VM.v, 64]] }), LY.tok, -1);
LY.market.forEach((o, i) => put("mk" + i, X.vending(o, { id: "mk" + i, scale: 0.5, glow: false }), o));
put("sig", O.doc(LY.sig, { id: "sig", title: "签名", w: 110, h: 140, stamp: true }), LY.sig);
// coin stack for "transfer in directly"
const cs = coinStack(LY.coins, { id: "cs" }); A.cs = cs.anchors; items.push({ y: 1e6 + 3, svg: `<g id="cs-w" opacity="0">${cs.svg}</g>` });
const slitSvg = slit(VM, { id: "slit", u0: -100, v: 0, z: 190 });
items.push({ y: at(VM)[1] + 0.5, svg: `<g id="slit-w" opacity="0">${slitSvg}</g>` });
const magR = O.magnifier(LY.mag, { id: "mag", z: 60 }); A.mag = magR.anchors;
items.push({ y: 1e6 + 4, svg: `<g id="mag-w" opacity="0">${magR.svg}</g>` });
// wrench on the chain link between block 1 and 2
const wrP = [(A.ch.blocks[1][0] + A.ch.blocks[2][0]) / 2 + 10, (A.ch.blocks[1][1] + A.ch.blocks[2][1]) / 2 + 40];
items.push({ y: 1e6 + 5, svg: `<g id="wr-w" opacity="0">${wrench(wrP, { id: "wr", scale: 0.9 })}</g>` });
// mask + scan cone on the attacker
items.push({ y: 1e6 + 6, svg: mask([A.atk.head[0] + 6, A.atk.head[1] + 4], { id: "mask" }) });
const sensor = at(VM, 70, 75, 286), hd = A.atk.head, ctr = A.atk.center;
const cone = (id, fill, st) => `<polygon id="${id}" points="${f(sensor[0])},${f(sensor[1])} ${f(hd[0] - 50)},${f(hd[1] - 30)} ${f(ctr[0] + 60)},${f(ctr[1] + 90)}" fill="${fill}" stroke="${st}" stroke-width="3" stroke-dasharray="10 7" opacity="0"/>`;
items.push({ y: 1e6 + 7, svg: cone("scanT", "rgba(42,163,201,0.24)", "#2aa3c9") + cone("scanR", "rgba(224,69,58,0.24)", "#e0453a") + `<circle id="sensor" cx="${f(sensor[0])}" cy="${f(sensor[1])}" r="9" fill="#2aa3c9" stroke="#ffffff" stroke-width="3" opacity="0"/>` });
// whole-protocol frame
items.push({ y: -1e6, svg: `<g id="gf-w" opacity="0">${groundFrame(VM, { id: "gf", ...LY.frame })}</g>` });

items.sort((a, b) => a.y - b.y);

// ---------------------------------------------------------------- curves (world canvas)
const cv = (id, P0, P3, color, c1, c2) => dashCurve(id, P0, P3, { color, c1, c2, hidden: true });
const up = (p, dy) => [p[0], p[1] - dy];
const rt = (p, dx, dy = 0) => [p[0] + dx, p[1] + dy];
const curves = [];
// L5 malicious callback: attacker contract → machine buttons
curves.push(cv("cbk", rt(A.mal.front, -20, -40), rt(A.vm.buttons[2], 12, 0), "#e0453a", rt(A.mal.front, -40, -260), rt(A.vm.buttons[2], 140, -120)));
// L8 coins straight into the side slit
curves.push(cv("dir", rt(A.cs.c, -10, -30), at(VM, -100, 0, 200), "#e0453a", rt(A.cs.c, -120, -200), rt(at(VM, -100, 0, 200), -160, -60)));
// L14 attacker reaches for the seal → stopped at the glass
const glassHit = rt(A.dome.glass, -110, -30);
curves.push(cv("reach", rt(A.atk2.head, 30, 10), glassHit, "#e0453a", rt(A.atk2.head, 90, -80), rt(glassHit, -60, -60)));
// L18 asset → cell 1 ; L23 sources → question ; L25 cells → balance
const qPt = LY.q23;
curves.push(cv("a1", rt(A.vm.stock, -30, -20), A.board.cells[0], "#2aa3c9", rt(A.vm.stock, -200, -260), rt(A.board.cells[0], 260, -200)));
curves.push(cv("s1", A.orc.dial, qPt, "#2aa3c9", rt(A.orc.dial, -40, -120), rt(qPt, 120, -60)));
curves.push(cv("s2", up(A.vm.panel, 30), qPt, "#2aa3c9", rt(A.vm.panel, 60, -200), rt(qPt, 60, 80)));
curves.push(cv("s3", up(A.sig.center, 10), qPt, "#2aa3c9", rt(A.sig.center, 40, -120), rt(qPt, 140, 40)));
A.board.cellBottom.forEach((p, i) => curves.push(cv("k" + i, p, rt(A.bal.pivot, 0, -10), "#2aa3c9", rt(p, 40, 120), rt(A.bal.pivot, -120 + i * 30, -200))));

const world = worldSvg("wsvg", gridSvg({ u0: -3400, u1: 3600, v0: -3200, v1: 3000 }) + outline + items.map((x) => x.svg).join("\n") + curves.map((c) => c.svg).join(""), [-3400, -2400, 7400, 5000]);

// ---------------------------------------------------------------- labels
let labels = "";
const lab = (id, p, html, cls = "", anchor = "b") => { labels += wlab(id, p, html, cls + " hide", anchor); };
const pin = (id, p, html, anchor = "c") => { labels += wpin(id, p, html, anchor); };
// L0–L2
lab("lb-tm", A.wb.top, "威胁建模", "lab-cs");
["输入", "路径", "结果"].forEach((t, k) => lab("lb-col" + k, A.wb.cols[k], t, "", "c"));
lab("lb-vm", A.vm.top, "智能合约", "lab-g");
pin("q-ctl", up(A.atk.top, 30), `<div class="qcard hide" id="q-ctl-i">攻击者能控制什么？</div>`, "b");
// L3
lab("lb-tb", A.tb.top, "默认能做到", "");
// L4 params
lab("lb-p0", rt(A.vm.buttons[3], 26, 0), "f(0)", "lab-r mono", "l");
lab("lb-p1", rt(A.vm.buttons[0], 26, 0), "f(99999)", "lab-r mono", "l");
lab("lb-p2", rt(A.vm.buttons[4], 26, 26), "f(2²⁵⁶−1)", "lab-r mono", "l");
lab("lb-pn", rt(A.vm.buttons[0], 30, -70), "参数为示意", "lab-g", "l");
lab("lb-pub", up(A.vm.top, 20), "任意 public 函数", "lab-rs");
// L5
lab("lb-mal", A.mal.top, "攻击者合约", "lab-rs");
lab("lb-mal2", rt(A.mal.top, 0, -66), "恶意代币 · 恶意回调", "lab-r");
// L6
lab("lb-fl", A.fl.frameTag, "一笔交易", "lab-cs", "b");
lab("lb-fl2", A.fl.top, "借 → 用 → 还", "");
// L7
lab("lb-mp", A.mp.top, "内存池 · 未确认交易", "");
lab("lb-tgt", up(A.mp.slots[1], 130), "别人的交易", "", "b");
lab("lb-ra", rt(up(A.mp.slots[0], 70), 50), "插在前面", "lab-rs", "l");
lab("lb-rb", rt(up(A.mp.slots[2], 50), -50), "插在后面", "lab-rs", "r");
// L8
lab("lb-slot", rt(A.vm.coinSlot, 40, 0), "投币口 = 函数", "lab-g", "l");
lab("lb-bal0", up(A.vm.top, 10), "余额 100", "lab-cs", "b");
lab("lb-bal1", up(A.vm.top, 10), "余额 130", "lab-cs", "b");
lab("lb-baln", rt(A.vm.top, 110, -30), "数值示意", "lab-g", "l");
lab("lb-direct", rt(at(VM, -100, 0, 206), -40, -40), "不经过函数 · 直接转入", "lab-r", "r");
// L9
lab("lb-cab", up(A.cab.top, 0), "合约存储", "");
lab("lb-all", up(A.cab.top, 64), "全部存储都能读", "lab-rs");
// L10
lab("lb-sdoc", A.sdoc.top, "签过的消息", "");
lab("lb-far", A.far.top, "另一条链", "");
lab("lb-oth", A.oth.top, "另一个合约", "");
lab("lb-rp", up(A.br.crown, 120), "重放", "lab-rs");
// L11–L12 private drawer
const dOpen = A.cab.drawersOpen[2];
pin("note", up(dOpen, 70), `<div class="note hide" id="note-i"><div class="nt">管理员密码</div><div class="nv">● ● ● ● ● ●</div></div>`, "b");
lab("lb-priv", rt(A.cab.drawers[2], -40, 0), `<span class="strk" id="strk">private</span>`, "lab-ink", "r");
lab("lb-priv2", rt(A.cab.drawers[2], -40, 0), "只限制合约调用", "lab-cs", "r");
pin("q-read", rt(up(dOpen, 210), 150, 0), `<div class="qcard qsm hide" id="q-read-i">读得到吗？</div>`, "b");
lab("lb-vis", rt(up(dOpen, 210), 150, 0), "链上可见", "lab-rs", "b");
// L14–L16
lab("lb-seal", A.dome.top, "他人的签名", "");
lab("lb-nocan", A.lockN.top, "通常做不到", "lab-ink");
pin("x-seal", glassHit, BADGE("x-seal-i", 60, "hide"), "c");
lab("lb-ch", up(A.ch.top, 0), "已确认的区块", "");
pin("x-ch", rt(wrP, -40, -30), BADGE("x-ch-i", 60, "hide"), "c");
lab("lb-mask", rt(A.atk.head, -60, -60), "冒充：管理员", "lab-g", "r");
lab("lb-scan", rt(sensor, 30, -40), "识别：真实调用者", "lab-r", "l");
pin("x-scan", rt(A.atk.top, 70, 0), BADGE("x-scan-i", 60, "hide"), "c");
lab("lb-rej", rt(A.atk.top, 70, -60), "拒绝", "lab-rs", "b");
// L17–L27 six steps
const CELL = ["① 资产", "② 函数", "③ 不变量", "④ 每个函数", "⑤ 外部数据", "⑥ 特权角色"];
CELL.forEach((t, i) => lab("lb-c" + i, A.board.cells[i], t, "lab-g cellb", "c"));
CELL.forEach((t, i) => lab("lb-cl" + i, A.board.cells[i], t, "lab-cs cellb", "c"));
lab("lb-usdt", rt(A.vm.glass, -60, -120), "用户存入的 USDT", "", "b");
lab("lb-fee", rt(A.vm.glass, 10, 30), "协议手续费", "", "t");
lab("lb-any", rt(A.vm.buttons[0], 30, 0), "任何人", "lab-g", "l");
lab("lb-adm", rt(A.vm.buttons[4], 30, 8), "只有管理员", "lab-ink", "l");
lab("lb-inv", A.bal.top, "不变量", "lab-cs");
lab("lb-pl", rt(A.bal.panL, -20, 0), "合约 USDT 余额", "", "r");
lab("lb-pr", rt(A.bal.panR, 20, 0), "用户存款之和", "", "l");
lab("lb-eq", rt(A.bal.top, 0, -66), "余额 ≥ 存款之和", "lab-gs");
lab("lb-q4a", rt(A.vm.panel, 120, -150), "控制哪些输入？", "", "l");
lab("lb-q4b", rt(A.vm.panel, 120, -80), "外部调用？", "", "l");
lab("lb-q4c", rt(A.vm.panel, 120, -10), "状态先更新？", "", "l");
lab("lb-s1", up(A.orc.top, 0), "价格", "lab-g");
lab("lb-s2", rt(A.vm.panel, -20, -60), "余额", "lab-g", "r");
lab("lb-s3", A.sig.top, "签名", "lab-g");
pin("q5", qPt, `<div class="qcard qsm hide" id="q5-i">一笔交易内能否被操纵？</div>`, "c");
lab("lb-key", rt(A.key.center, 0, 40), "升级密钥", "", "t");
lab("lb-q6a", rt(A.vm.maintTop, -40, -120), "在谁手里？", "", "r");
lab("lb-q6b", rt(A.vm.maintTop, -40, -50), "被盗最大损失？", "", "r");
lab("lb-q6c", rt(A.tlk.dial, -80, 0), "时间锁？", "", "r");
lab("lb-anc", rt(A.anc.top, 0, -10), "锚点", "lab-ink");
lab("lb-test", rt(A.bal.top, 230, 40), "测试：模糊测试 + 不变量测试", "lab-g", "l");
pin("think", rt(A.board.top, 60, 0), `<div class="think hide" id="think-i"><div class="tb1"></div><div class="tb2"></div><div class="tb3"></div></div>`, "b");
lab("lb-lim", rt(A.board.top, -70, -60), "局限：靠想象力", "lab-g", "r");
lab("lb-gf", LY.gfLabel, "整个协议 + 外部市场", "lab-cs");
lab("lb-ext", A.dex.top, "外部合约", "lab-g");
lab("lb-mkt", A.mk1.top, "外部市场", "lab-g");

// ---------------------------------------------------------------- cameras
const SX = 1240, SY = 480; // vignette framing (left third holds the checklist)
const C = (P, k, sx = SX, sy = SY) => camAt(P, sx, sy, k);
const cen = (o) => at(o);
const CAMS = {
  wide: C([-200, 0], 0.62, 960, 560),
  wb: C([(A.wb.center[0] + A.vm.center[0]) / 2, (A.wb.center[1] + A.vm.center[1]) / 2], 0.95, 960, 540),
  paper: C(rt(A.wb.center, 0, 10), 1.55, 960, 560),
  atk: C(rt(A.vm.center, -60, 60), 1.05, 960, 470),
  tb: C(rt(A.vm.center, -20, 120), 1.0),
  btn: C(A.vm.panel, 1.7, 1150, 520),
  mal: C(rt(cen(LY.mal), -120, -120), 1.05),
  fl: C(rt(cen(LY.fl), 0, -90), 1.15),
  mp: C(rt(A.mp.center, 0, -60), 1.0),
  side: C(rt(A.vm.side, -60, 30), 1.25),
  cab: C(rt(A.cab.center, 60, -40), 1.15),
  br: C([1720, -120], 0.85),
  drawer: C(rt(dOpen, 40, -110), 1.75, 1200, 520),
  tb2: C(rt(A.vm.center, -100, 230), 0.95),
  dome: C(rt(cen(LY.dome), -60, -100), 1.15),
  ch: C(rt(A.ch.center, 80, -40), 1.15),
  mask: C(rt(A.atk.center, 40, -100), 1.15),
  six: C(LY.sixCenter, 1.0, 960, 500),
  vmglass: C(rt(A.vm.glass, -200, 0), 1.15, 960, 480),
  btns: C(rt(A.vm.panel, -60, -40), 1.25, 960, 500),
  bal: C(rt(A.bal.center, -20, -30), 1.45, 960, 500),
  btn4: C(rt(A.vm.panel, 120, -60), 1.55, 960, 520),
  ext: C(LY.extCenter, 0.95, 960, 500),
  maint: C(rt(A.vm.maint, 30, -80), 1.35, 960, 520),
  anchor: C(LY.sixCenter, 0.95, 960, 500),
  far: C(LY.wideCenter, 0.5, 960, 520),
};

// ---------------------------------------------------------------- times
const TM = {
  ttl: 1.25,
  tm0: w("威胁建模", 0),
  in1: w("输入", 1), path1: w("路径", 1), res1: w("结果", 1),
  q2: w("攻击者能控制什么", 2),
  def3: w("默认", 3),
  a4: w("任意参数", 4), pub4: w("公开函数", 4),
  a5: w("部署", 5), call5: w("调用它", 5), tok5: w("恶意代币", 5), cb5: w("恶意回调", 5),
  a6: w("一笔交易", 6), big6: w("巨额资金", 6),
  a7: w("内存池", 7), ins7: w("插入", 7),
  a8: w("不经过", 8), dir8: w("直接", 8),
  a9: w("读取", 9), all9: w("全部存储", 9), pv9: w("private", 9),
  a10: w("另一条链", 10), oth10: w("另一个合约", 10), rp10: w("重放", 10),
  eg11: w("举个例子", 11), pw11: w("管理员密码", 11), rd11: w("读得到吗", 11),
  y12: w("读得到", 12), lim12: w("只限制", 12), hid12: w("不隐藏", 12),
  n13: w("做不到", 13),
  a14: w("伪造", 14), ex14: w("除非", 14),
  a15: w("修改", 15), ex15: w("除非", 15),
  a16: w("调用者是别人", 16), ex16: w("除非", 16),
  a17: w("能力清单", 17), six17: w("六步", 17),
  a18: w("资产", 18), usdt18: w("USDT", 18), fee18: w("手续费", 18),
  a19: w("改变资产", 19), who19: w("谁能调用", 19),
  a20: w("不变量", 20), must20: w("必须成立", 20),
  bal21: w("USDT 余额", 21), sum21: w("存款之和", 21),
  a22: w("第四", 22), in22: w("哪些输入", 22), ext22: w("外部调用", 22), st22: w("状态更新", 22),
  a23: w("第五", 23), pr23: w("价格", 23), bl23: w("余额", 23), sg23: w("签名", 23), mn23: w("被操纵", 23),
  a24: w("第六", 24), who24: w("谁手里", 24), loss24: w("损失", 24), tl24: w("时间锁", 24),
  anc25: w("锚点", 25), test25: w("所有测试", 25),
  lim26: w("局限", 26), img26: w("想象力", 26),
  eco27: w("经济攻击", 27), mkt27: w("外部市场", 27),
};

// ---------------------------------------------------------------- checklist panel (screen space)
const CAN = ["任意参数 · 任意 public 函数", "部署恶意合约", "闪电贷", "看到内存池 · 前后插队", "直接转入（捐赠）", "读取全部存储", "跨链 / 跨合约重放"];
const CANT = [["伪造签名", "例外：私钥泄露 / 验签写错"], ["改已确认区块", "例外：共识被攻破"], ["冒充调用者", "例外：tx.origin / 错误的 meta-tx"]];
const NUM = ["①", "②", "③", "④", "⑤", "⑥", "⑦"];
const LOCK = `<svg width="26" height="30" viewBox="0 0 26 30"><path d="M6 13V9a7 7 0 0 1 14 0v4" fill="none" stroke="#6d685e" stroke-width="3.4"/><rect x="2" y="13" width="22" height="16" rx="3" fill="#6d685e"/></svg>`;
const panelHtml = `<div id="clip" class="hide">
  <div class="clipboard" id="cb1"><div class="clamp"></div>
    <div class="ph">默认能做到<span class="ph-n">7 件</span></div>
    ${CAN.map((t, i) => `<div class="row" id="r${i}"><span class="rn">${NUM[i]}</span><span class="rt hide" id="rt${i}">${t}</span></div>`).join("")}
  </div>
  <div class="clipboard cmp hide" id="cb1c"><div class="clamp"></div><div class="ph">默认能做到<span class="ph-n">7 件</span></div>
    <div class="chips">${NUM.map((n) => `<span class="chip">${n}</span>`).join("")}</div></div>
  <div class="clipboard cb2 hide" id="cb2"><div class="clamp"></div>
    <div class="ph">${LOCK}通常做不到</div>
    ${CANT.map(([t, e], i) => `<div class="row2" id="q${i}"><div class="rt2 hide" id="qt${i}"><span class="rn rn-l">${NUM[i]}</span>${t}</div><div class="ex hide" id="qe${i}">${e}</div></div>`).join("")}
  </div>
</div>`;
const hudHtml = `<div id="hud" class="hide"><span class="hh">建模六步</span>${CELL.map((t, i) => `<span class="hc" id="hc${i}">${t}</span>`).join("")}</div>`;

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    .lab.mono { font-family: "JetBrains Mono", monospace; font-weight: 800; }
    .lab.cellb { font-size: 30px; }
    .qcard { background: #fffdf8; border: 4px solid #1c1c1c; border-radius: 22px; padding: 14px 34px 18px; font-size: 52px; font-weight: 900; white-space: nowrap;
      box-shadow: 0 14px 30px rgba(70,60,40,0.16); }
    .qcard.qsm { font-size: 36px; padding: 10px 24px 14px; border-width: 3px; border-radius: 16px; }
    .note { width: 300px; background: #fffef6; border: 2px solid #cfc7b8; border-radius: 6px; padding: 12px 18px 14px; box-shadow: 0 10px 22px rgba(70,60,40,0.16); transform: rotate(-3deg); }
    .note .nt { font-size: 32px; font-weight: 900; }
    .note .nv { font-size: 30px; font-weight: 900; color: #3b3e44; letter-spacing: 2px; margin-top: 4px; }
    .strk { position: relative; }
    .strk::after { content: ""; position: absolute; left: -6px; right: -6px; top: 52%; height: 5px; background: #e0453a; transform: scaleX(var(--s, 0)); transform-origin: 0 50%; }
    #clip { position: absolute; left: 36px; top: 112px; width: 590px; }
    .clipboard { position: absolute; left: 0; top: 0; width: 590px; background: #fffdf8; border-radius: 18px; padding: 34px 30px 20px; box-shadow: 0 14px 30px rgba(70,60,40,0.14);
      border-top: 14px solid #8a6a43; }
    .clamp { position: absolute; left: 225px; top: -26px; width: 140px; height: 34px; border-radius: 10px; background: linear-gradient(#d5d9de, #9aa0a8); border: 2px solid #5a5e65; }
    .ph { display: flex; align-items: center; gap: 12px; font-size: 36px; font-weight: 900; color: #17809f; height: 54px; white-space: nowrap; }
    .ph .ph-n { margin-left: auto; font-size: 30px; color: #6d685e; }
    .row { display: flex; align-items: center; height: 52px; border-bottom: 2px dashed #e2ddd3; font-size: 31px; font-weight: 800; white-space: nowrap; }
    .rn { display: inline-flex; width: 44px; height: 40px; align-items: center; justify-content: center; margin-right: 12px; border-radius: 10px; background: #f1ede5; color: #6d685e; font-size: 28px; font-weight: 900; }
    .row.on .rn { background: #e0453a; color: #fff; }
    .cmp .chips { display: flex; gap: 10px; margin-top: 6px; }
    .cmp .chip { width: 56px; height: 46px; border-radius: 10px; background: #e0453a; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 900; }
    .cb2 { top: 200px; }
    .cb2 .ph { color: #3b3e44; }
    .row2 { padding: 8px 0 10px; border-bottom: 2px dashed #e2ddd3; }
    .rt2 { display: flex; align-items: center; font-size: 32px; font-weight: 900; white-space: nowrap; }
    .rn-l { background: #3b3e44; color: #fff; }
    .ex { margin-left: 56px; font-size: 30px; font-weight: 700; color: #7d776b; white-space: nowrap; }
    #hud { position: absolute; left: 40px; top: 34px; display: flex; gap: 8px; align-items: center; }
    #hud .hh { font-size: 30px; font-weight: 900; margin-right: 8px; white-space: nowrap; }
    #hud .hc { font-size: 28px; font-weight: 800; padding: 4px 14px 6px; border-radius: 999px; background: #ffffff; color: #8a8478; border: 2px solid #e2ddd3; white-space: nowrap; }
    .think { position: relative; width: 210px; height: 130px; }
    .think .tb1 { position: absolute; left: 0; top: 0; width: 210px; height: 110px; border-radius: 60px; background: #fffdf8; border: 3px solid #cfc7b8; box-shadow: 0 10px 22px rgba(70,60,40,0.12); }
    .think .tb2 { position: absolute; left: 40px; top: 116px; width: 26px; height: 26px; border-radius: 50%; background: #fffdf8; border: 3px solid #cfc7b8; }
    .think .tb3 { position: absolute; left: 20px; top: 148px; width: 14px; height: 14px; border-radius: 50%; background: #fffdf8; border: 3px solid #cfc7b8; }
    #sdoc-stampmark circle, #cp1-stampmark circle, #cp2-stampmark circle, #sig-stampmark circle { stroke: #1c1c1c; }
    #sdoc-stampmark path, #cp1-stampmark path, #cp2-stampmark path, #sig-stampmark path, #sdoc-stampmark text, #cp1-stampmark text, #cp2-stampmark text, #sig-stampmark text { fill: #1c1c1c; }
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
      ${panelHtml}
      ${hudHtml}
      <div class="tcard hide" id="term1"><div class="t1">时间锁</div><div class="t2">操作公开排队一段时间后才能执行</div></div>
      ${pills(5, { sections: SCRIPT.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">⑤ 攻击者能做什么</div><div class="t-sub">威胁建模 · 能力清单</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${X.runtimeExtJs()}
${X3.runtimeExtJs().replace(/KITX/g, "KITX3")}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const so = (id) => { const g = $(id); return g.getAttribute("data-ox") + " " + g.getAttribute("data-oy"); };
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      const shrink = (id, t, d) => tl.to("#" + id, { scaleY: 0, svgOrigin: so(id), duration: d || 0.35, ease: "power2.in" }, t);
      const cam = (t, c, d, e) => KIT.cam(tl, t, CAMS[c], d || 1.1, e);
      const hidden = ["atk", "tb", "cab", "pcab", "mal", "pmal", "fl", "mp", "br", "far", "oth", "sdoc", "dome", "atk2", "ch", "board", "bal", "anc", "tlk", "key", "tok", "dex", "orc", "p0", "p1", "p2", "mk0", "mk1", "mk2", "mk3", "sig", "lockN"];
      hidden.forEach((id) => tl.set("#" + id, { scaleY: 0, svgOrigin: so(id) }, 0));
      KIT.camSet(tl, CAMS.wide);

      // ===== title card 0–1.6 → flies into the pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, ${f(TM.ttl)});
      // ===== L0 threat modelling: workbench
      cam(0.9, "wb", 1.6);
      pop("#lb-vm", 1.8);
      pop("#lb-tm", ${f(TM.tm0)});
      // ===== L1 three columns on the blueprint; pen strokes
      out("#lb-vm", ${f(LS(1) - 0.2)});
      cam(${f(LS(1) - 0.3)}, "paper", 1.1);
      fadeIn("#wb-cols", ${f(TM.in1 - 0.4)}, 0.3);
      [${f(TM.in1)}, ${f(TM.path1)}, ${f(TM.res1)}].forEach((t, k) => {
        pop("#lb-col" + k, t);
        tl.to("#wb-pen", { x: -110 + k * 80, y: -40 - k * 6, duration: 0.45, ease: "power2.inOut" }, t - 0.35);
      });
      tl.to("#wb-pen", { x: 0, y: 0, duration: 0.5, ease: "power2.inOut" }, ${f(LE(1) - 0.6)});
      // ===== L2 attacker in front of the machine: the core question
      out("#lb-tm, #lb-col0, #lb-col1, #lb-col2", ${f(LS(2) - 0.3)}, 0.25);
      cam(${f(LS(2) - 0.3)}, "atk", 1.1);
      grow("atk", ${f(LS(2) + 0.2)}, 0.5);
      pop("#q-ctl-i", ${f(TM.q2)}, 0.35);
      // ===== L3 toolbox + checklist
      out("#q-ctl-i", ${f(LS(3) - 0.1)}, 0.25);
      cam(${f(LS(3) - 0.2)}, "tb", 1.0);
      grow("tb", ${f(LS(3) + 0.3)}, 0.5);
      tl.fromTo("#clip", { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", immediateRender: false }, ${f(TM.def3 - 0.2)});
      pop("#lb-tb", ${f(TM.def3)});
      const tick = (i, t) => { fadeIn("#rt" + i, t, 0.3); tl.fromTo("#r" + i + " .rn", { scale: 1.4, backgroundColor: "#f1ede5", color: "#6d685e" }, { scale: 1, backgroundColor: "#e0453a", color: "#ffffff", duration: 0.3, ease: "back.out(2)", immediateRender: false }, t); };

      // ===== L4 ① any params, any public function (button panel close-up)
      out("#lb-tb", ${f(LS(4) - 0.3)});
      cam(${f(LS(4) - 0.3)}, "btn", 0.9);
      [3, 0, 4, 1].forEach((b, k) => KITX.press(tl, "vm", b, ${f(TM.a4 + 0.1)} + k * 0.45, "red", 0.3));
      ["#lb-p0", "#lb-p1", "#lb-p2"].forEach((s, k) => pop(s, ${f(TM.a4 + 0.1)} + k * 0.45));
      pop("#lb-pn", ${f(TM.a4 + 1.4)});
      pop("#lb-pub", ${f(TM.pub4)});
      tick(0, ${f(TM.pub4 + 0.2)});
      // ===== L5 ② attacker deploys his own contract; ours calls it; red callback comes back
      out("#lb-p0, #lb-p1, #lb-p2, #lb-pn, #lb-pub", ${f(LS(5) - 0.3)});
      cam(${f(LS(5) - 0.3)}, "mal", 1.0);
      grow("mal", ${f(TM.a5)}, 0.5); pop("#lb-mal", ${f(TM.a5 + 0.4)});
      grow("pmal", ${f(TM.call5 - 0.3)}, 0.4);
      tl.set("#pmal-flow", { opacity: 1 }, ${f(TM.call5)});
      KITX.dash(tl, "pmal-flow", ${f(TM.call5)}, ${f(LE(5) - TM.call5)}, 260);
      KIT.draw(tl, "cbk", ${f(TM.tok5)}, 0.7);
      pop("#lb-mal2", ${f(TM.tok5)});
      KITX.press(tl, "vm", 2, ${f(TM.cb5)}, "red", 0.5);
      tick(1, ${f(TM.cb5)});
      // ===== L6 ③ flash loan inside one transaction
      out("#lb-mal, #lb-mal2, #cbk", ${f(LS(6) - 0.3)});
      cam(${f(LS(6) - 0.3)}, "fl", 0.9);
      grow("fl", ${f(LS(6) + 0.1)}, 0.45);
      pop("#lb-fl", ${f(TM.a6)});
      KITX.pileIn(tl, "fl", ${f(TM.big6 - 0.3)}, 0.5);
      pop("#lb-fl2", ${f(TM.big6 + 0.2)});
      KITX.pileOut(tl, "fl", ${f(LE(6) - 0.3)}, 0.5);
      tick(2, ${f(TM.big6)});
      // ===== L7 ④ sees the mempool; inserts before and after
      out("#lb-fl, #lb-fl2", ${f(LS(7) - 0.3)});
      cam(${f(LS(7) - 0.3)}, "mp", 1.0);
      grow("mp", ${f(LS(7) + 0.1)}, 0.5);
      pop("#lb-mp", ${f(TM.a7)});
      pop("#lb-tgt", ${f(TM.a7 + 0.6)});
      KITX.walk(tl, "mp-env-0", ${f(TM.a7 + 0.8)}, 0.8, [${JSON.stringify(A.mp.exit)}]);
      out("#mp-env-0", ${f(TM.a7 + 1.5)}, 0.2);
      KITX.walk(tl, "mp-env-2", ${f(TM.a7 + 0.9)}, 0.6, [${JSON.stringify(A.mp.slots[3])}]);
      KITX.walk(tl, "mp-env-3", ${f(TM.a7 + 0.9)}, 0.6, [${JSON.stringify(A.mp.slots[4])}]);
      fadeIn("#redA-w", ${f(TM.ins7 - 0.5)}, 0.15); fadeIn("#redB-w", ${f(TM.ins7 - 0.3)}, 0.15);
      KITX.walk(tl, "redA", ${f(TM.ins7 - 0.5)}, 0.7, [${JSON.stringify(A.mp.slots[0])}]);
      KITX.walk(tl, "redB", ${f(TM.ins7 - 0.3)}, 0.7, [${JSON.stringify(A.mp.slots[2])}]);
      pop("#lb-ra", ${f(TM.ins7 + 0.3)}); pop("#lb-rb", ${f(TM.ins7 + 0.6)});
      tick(3, ${f(TM.ins7 + 0.3)});
      // ===== L8 ⑤ transfers tokens straight in (side slit, not the coin slot)
      out("#lb-mp, #lb-tgt, #lb-ra, #lb-rb", ${f(LS(8) - 0.3)});
      cam(${f(LS(8) - 0.3)}, "side", 1.0);
      pop("#lb-slot", ${f(LS(8) + 0.4)}); pop("#lb-bal0", ${f(LS(8) + 0.5)}); pop("#lb-baln", ${f(LS(8) + 0.6)});
      fadeIn("#slit-w", ${f(TM.a8 - 0.2)}, 0.3);
      fadeIn("#cs-w", ${f(TM.a8)}, 0.25);
      { const a = ${JSON.stringify(A.cs.c)}, b = ${JSON.stringify(at(VM, -100, 0, 196))};
        tl.fromTo("#cs-w", { x: 0, y: 0, scale: 1, svgOrigin: a[0] + " " + a[1] }, { x: b[0] - a[0], y: b[1] - a[1], scale: 0.45, svgOrigin: a[0] + " " + a[1], duration: 0.9, ease: "power2.inOut", immediateRender: false }, ${f(TM.dir8 - 0.3)});
        out("#cs-w", ${f(TM.dir8 + 0.55)}, 0.15); }
      pop("#lb-direct", ${f(TM.dir8 + 0.1)}); KIT.draw(tl, "dir", ${f(TM.a8)}, 0.6);
      KIT.swap(tl, "#lb-bal0", "#lb-bal1", ${f(TM.dir8 + 0.6)}, 0.2);
      tl.fromTo("#lb-bal1", { scale: 1.25 }, { scale: 1, duration: 0.35, ease: "back.out(2)", immediateRender: false }, ${f(TM.dir8 + 0.6)});
      tick(4, ${f(TM.dir8 + 0.6)});
      // ===== L9 ⑥ reads all storage (glass cabinet, every drawer)
      out("#lb-slot, #lb-bal1, #lb-baln, #lb-direct, #slit-w, #dir", ${f(LS(9) - 0.3)});
      cam(${f(LS(9) - 0.3)}, "cab", 1.0);
      grow("cab", ${f(LS(9) + 0.1)}, 0.5); grow("pcab", ${f(LS(9) + 0.3)}, 0.4);
      pop("#lb-cab", ${f(LS(9) + 0.6)});
      fadeIn("#mag-w", ${f(TM.a9)}, 0.3);
      { const L0 = ${JSON.stringify(A.mag.lens)}, d0 = ${JSON.stringify(A.cab.drawersOpen[0])}, d3 = ${JSON.stringify(A.cab.drawersOpen[3])};
        tl.fromTo("#mag-w", { x: d0[0] - L0[0] + 60, y: d0[1] - L0[1] }, { x: d3[0] - L0[0] - 20, y: d3[1] - L0[1] - 10, duration: ${f(LE(9) - TM.a9)}, ease: "power1.inOut", immediateRender: false }, ${f(TM.a9)}); }
      [0, 1, 2, 3].forEach((i) => { KITX3.drawer(tl, "cab", i, ${f(TM.all9)} - 0.2 + i * 0.25, 70, 0.4); KITX3.mark(tl, "cab", i, ${f(TM.all9)} + i * 0.25, "red"); });
      pop("#lb-all", ${f(TM.pv9)});
      tick(5, ${f(TM.pv9)});
      // ===== L10 ⑦ replays a signed message on another chain / another contract
      out("#lb-cab, #lb-all, #mag-w", ${f(LS(10) - 0.3)});
      [0, 1, 3].forEach((i) => KITX3.drawer(tl, "cab", i, ${f(LS(10))}, false, 0.4));
      [0, 1, 3].forEach((i) => KITX3.mark(tl, "cab", i, ${f(LS(10))}, "off"));
      KITX3.drawer(tl, "cab", 2, ${f(LS(10))}, false, 0.4); KITX3.mark(tl, "cab", 2, ${f(LS(10))}, "off");
      cam(${f(LS(10) - 0.3)}, "br", 1.1);
      ["br", "far", "oth", "sdoc"].forEach((id, k) => grow(id, ${f(LS(10) + 0.2)} + k * 0.12, 0.5));
      pop("#lb-sdoc", ${f(LS(10) + 0.8)});
      pop("#lb-far", ${f(TM.a10)});
      fadeIn("#cp1-w", ${f(TM.a10 - 0.1)}, 0.2);
      KITX.walk(tl, "cp1-w", ${f(TM.a10)}, 1.6, ${JSON.stringify([...br.anchors.deck.filter((_, i) => i % 3 === 0), br.anchors.farBank].map((p) => [p[0] - 40, p[1] + 30]))});
      pop("#lb-oth", ${f(TM.oth10)});
      fadeIn("#cp2-w", ${f(TM.oth10 - 0.1)}, 0.2);
      KITX.walk(tl, "cp2-w", ${f(TM.oth10)}, 1.0, [${JSON.stringify(at(LY.oth, -10, 90))}]);
      pop("#lb-rp", ${f(TM.rp10)});
      tick(6, ${f(TM.rp10)});
      // ===== L11 example: admin password in a private variable
      out("#lb-sdoc, #lb-far, #lb-oth, #lb-rp", ${f(LS(11) - 0.3)});
      cam(${f(LS(11) - 0.4)}, "drawer", 1.2);
      KITX3.drawer(tl, "cab", 2, ${f(TM.pw11 - 0.3)}, true, 0.6);
      pop("#lb-priv", ${f(TM.eg11 + 0.6)});
      pop("#note-i", ${f(TM.pw11 + 0.1)}, 0.3);
      pop("#q-read-i", ${f(TM.rd11)}, 0.3);
      // ===== L12 yes — private only limits other contracts
      out("#q-read-i", ${f(TM.y12 - 0.1)}, 0.2);
      fadeIn("#mag-w", ${f(TM.y12 - 0.2)}, 0.3);
      { const L0 = ${JSON.stringify(A.mag.lens)}, n = ${JSON.stringify(up(dOpen, 120))};
        tl.fromTo("#mag-w", { x: n[0] - L0[0] + 120, y: n[1] - L0[1] + 60 }, { x: n[0] - L0[0], y: n[1] - L0[1], duration: 0.6, ease: "power2.out", immediateRender: false }, ${f(TM.y12 - 0.2)}); }
      pop("#lb-vis", ${f(TM.hid12)});
      KITX3.mark(tl, "cab", 2, ${f(TM.y12 + 0.2)}, "red");
      tl.fromTo("#strk", { "--s": 0 }, { "--s": 1, duration: 0.3, ease: "power2.out", immediateRender: false }, ${f(TM.lim12 - 0.2)});
      KIT.swap(tl, "#lb-priv", "#lb-priv2", ${f(TM.lim12 + 0.5)}, 0.3);

      // ===== L13 can't-do list
      out("#note-i, #lb-vis, #mag-w", ${f(LS(13) - 0.3)});
      KITX3.drawer(tl, "cab", 2, ${f(LS(13))}, false, 0.4); KITX3.mark(tl, "cab", 2, ${f(LS(13))}, "off");
      out("#lb-priv2", ${f(LS(13))});
      cam(${f(LS(13) - 0.3)}, "tb2", 1.0);
      KIT.swap(tl, "#cb1", "#cb1c", ${f(TM.n13 - 0.6)}, 0.3);
      grow("lockN", ${f(TM.n13 - 0.4)}, 0.5);
      tl.fromTo("#cb2", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", immediateRender: false }, ${f(TM.n13 - 0.2)});
      // L14 ① forge a signature — seal under a glass dome
      cam(${f(LS(14) - 0.3)}, "dome", 1.0);
      grow("dome", ${f(LS(14) - 0.1)}, 0.5); grow("atk2", ${f(LS(14) + 0.1)}, 0.5);
      pop("#lb-seal", ${f(LS(14) + 0.5)});
      KIT.draw(tl, "reach", ${f(TM.a14 + 0.2)}, 0.6);
      pop("#x-seal-i", ${f(TM.a14 + 0.8)});
      fadeIn("#qt0", ${f(TM.a14 + 0.4)}, 0.3);
      fadeIn("#qe0", ${f(TM.ex14)}, 0.3);
      // L15 ② rewrite a confirmed block — the wrench can't pry the chain
      out("#lb-seal, #reach, #x-seal-i", ${f(LS(15) - 0.3)});
      cam(${f(LS(15) - 0.3)}, "ch", 1.0);
      grow("ch", ${f(LS(15))}, 0.5);
      pop("#lb-ch", ${f(LS(15) + 0.4)});
      fadeIn("#wr-w", ${f(TM.a15)}, 0.25);
      { const o = ${JSON.stringify(wrP)}; [0, 1, 2, 3, 4, 5].forEach((k) => tl.to("#wr", { rotation: k % 2 ? 10 : -6, svgOrigin: o[0] + " " + o[1], duration: 0.16, ease: "sine.inOut" }, ${f(TM.a15 + 0.2)} + k * 0.16));
        tl.to("#wr", { rotation: 0, svgOrigin: o[0] + " " + o[1], duration: 0.2 }, ${f(TM.a15 + 1.2)}); }
      pop("#x-ch-i", ${f(TM.a15 + 1.2)});
      fadeIn("#qt1", ${f(TM.a15 + 0.4)}, 0.3);
      fadeIn("#qe1", ${f(TM.ex15)}, 0.3);
      // L16 ③ impersonate the caller — mask; the machine sees who really calls
      out("#lb-ch, #x-ch-i, #wr-w", ${f(LS(16) - 0.3)});
      cam(${f(LS(16) - 0.3)}, "mask", 1.0);
      fadeIn("#mask", ${f(LS(16) + 0.3)}, 0.3);
      pop("#lb-mask", ${f(LS(16) + 0.5)});
      fadeIn("#sensor", ${f(TM.a16 - 0.2)}, 0.2);
      fadeIn("#scanT", ${f(TM.a16)}, 0.3);
      KIT.swap(tl, "#scanT", "#scanR", ${f(TM.a16 + 0.9)}, 0.25);
      pop("#lb-scan", ${f(TM.a16 + 0.9)});
      pop("#x-scan-i", ${f(TM.a16 + 1.3)}); pop("#lb-rej", ${f(TM.a16 + 1.4)});
      fadeIn("#qt2", ${f(TM.a16 + 0.4)}, 0.3);
      fadeIn("#qe2", ${f(TM.ex16)}, 0.3);

      // ===== L17 checklist → six-step board
      out("#lb-mask, #lb-scan, #x-scan-i, #lb-rej, #scanR, #sensor, #mask", ${f(LS(17) - 0.2)}, 0.25);
      tl.to("#clip", { x: -660, opacity: 0, duration: 0.6, ease: "power3.in" }, ${f(TM.a17)});
      out("#atk, #atk2, #cp1-w, #cp2-w, #redA-w, #redB-w, #lb-nocan", ${f(LS(17))}, 0.3);
      ["tb", "dome", "ch", "mal", "pmal", "cab", "pcab", "fl", "mp", "br", "far", "oth", "sdoc", "lockN"].forEach((id, k) => shrink(id, ${f(LS(17))} + k * 0.05, 0.35));
      cam(${f(LS(17) - 0.1)}, "six", 1.3);
      grow("board", ${f(TM.six17 - 0.5)}, 0.6);
      [0, 1, 2, 3, 4, 5].forEach((i) => pop("#lb-c" + i, ${f(TM.six17)} + i * 0.1));
      fadeIn("#hud", ${f(TM.six17 + 0.2)}, 0.4);
      const step = (i, t) => { tl.to("#board-c" + i, { opacity: 0.95, duration: 0.3 }, t); if (i === 0) KIT.swap(tl, "#lb-c" + i, "#lb-cl" + i, t, 0.3);
        tl.to("#hc" + i, { backgroundColor: "#1d93ba", color: "#ffffff", borderColor: "#1d93ba", duration: 0.3 }, t); };
      // L18 ① assets
      step(0, ${f(TM.a18 - 0.1)});
      cam(${f(TM.a18 - 0.2)}, "vmglass", 1.0);
      out("#lb-c0, #lb-c1, #lb-c2, #lb-c3, #lb-c4, #lb-c5, #lb-cl0", ${f(TM.a18 + 0.3)}, 0.25);
      pop("#lb-usdt", ${f(TM.usdt18)}); pop("#lb-fee", ${f(TM.fee18)});
      KIT.draw(tl, "a1", ${f(TM.fee18 + 0.4)}, 0.7);
      // L19 ② functions that change assets + who may call
      out("#lb-usdt, #lb-fee, #a1", ${f(LS(19) - 0.2)});
      step(1, ${f(LS(19) + 0.1)});
      cam(${f(LS(19) - 0.2)}, "btns", 1.0);
      [0, 2, 4].forEach((b, k) => KITX.press(tl, "vm", b, ${f(TM.a19)} + k * 0.3, "blue", ${f(LE(19) - TM.a19 - 0.9)}));
      pop("#lb-any", ${f(TM.who19)}); pop("#lb-adm", ${f(TM.who19 + 0.3)});
      // L20 ③ invariant — the balance rises
      out("#lb-any, #lb-adm", ${f(LS(20) - 0.2)});
      step(2, ${f(TM.a20)});
      cam(${f(LS(20) - 0.2)}, "bal", 1.0);
      grow("bal", ${f(TM.a20 + 0.1)}, 0.6);
      pop("#lb-inv", ${f(TM.a20 + 0.5)});
      KITX.tilt(tl, "bal", ${f(TM.must20)}, 0, 0.5);
      KITX.tilt(tl, "bal", ${f(TM.must20 + 0.6)}, 6, 0.7);
      // L21 balance ≥ sum of deposits  (key shot)
      out("#lb-inv", ${f(LS(21) + 0.1)});
      pop("#lb-eq", ${f(LS(21) + 0.3)}, 0.35);
      pop("#lb-pl", ${f(TM.bal21 - 0.2)}); pop("#lb-pr", ${f(TM.sum21 - 0.3)});
      KITX.tilt(tl, "bal", ${f(TM.sum21 + 0.3)}, 9, 0.6);
      // L22 ④ per function: inputs, external calls, state first?
      out("#lb-pl, #lb-pr, #lb-eq", ${f(LS(22) + 0.6)});
      step(3, ${f(TM.a22)});
      cam(${f(LS(22) + 0.5)}, "btn4", 1.0);
      KITX.press(tl, "vm", 2, ${f(TM.in22 - 0.3)}, "blue", 6);
      pop("#lb-q4a", ${f(TM.in22)}); pop("#lb-q4b", ${f(TM.ext22)}); pop("#lb-q4c", ${f(TM.st22)});
      // L23 ⑤ per external datum
      out("#lb-q4a, #lb-q4b, #lb-q4c", ${f(LS(23) - 0.3)});
      step(4, ${f(TM.a23)});
      cam(${f(LS(23) - 0.3)}, "ext", 1.1);
      ["p0", "tok", "p1", "dex", "p2", "orc", "sig"].forEach((id, k) => grow(id, ${f(LS(23) + 0.1)} + k * 0.08, 0.45));
      pop("#lb-ext", ${f(LS(23) + 0.7)}); out("#lb-ext", ${f(TM.mn23 - 0.7)});
      pop("#lb-s1", ${f(TM.pr23)}); KIT.draw(tl, "s1", ${f(TM.pr23)}, 0.5);
      KITX.needle(tl, "orc", ${f(TM.pr23 + 0.2)}, 40, 0.4); KITX.needle(tl, "orc", ${f(TM.pr23 + 0.7)}, -35, 0.4); KITX.needle(tl, "orc", ${f(TM.pr23 + 1.2)}, -10, 0.4);
      pop("#lb-s2", ${f(TM.bl23)}); KIT.draw(tl, "s2", ${f(TM.bl23)}, 0.5);
      pop("#lb-s3", ${f(TM.sg23)}); KIT.draw(tl, "s3", ${f(TM.sg23)}, 0.5);
      pop("#q5-i", ${f(TM.mn23 - 0.6)}, 0.3);
      // L24 ⑥ per privileged role: key, max loss, timelock
      out("#lb-s1, #lb-s2, #lb-s3, #q5-i, #s1, #s2, #s3", ${f(LS(24) - 0.3)});
      step(5, ${f(TM.a24)});
      cam(${f(LS(24) - 0.3)}, "maint", 1.0);
      grow("key", ${f(LS(24) + 0.1)}, 0.4); pop("#lb-key", ${f(LS(24) + 0.4)});
      KITX.sideDoor(tl, "vm", ${f(TM.a24)}, 60, 0.8);
      pop("#lb-q6a", ${f(TM.who24)}); pop("#lb-q6b", ${f(TM.loss24)});
      grow("tlk", ${f(TM.tl24 - 0.4)}, 0.4); pop("#lb-q6c", ${f(TM.tl24)});
      KIT.pop(tl, "#term1", ${f(TM.tl24)}, 0.3); out("#term1", ${f(TM.tl24 + 3.6)}, 0.25);
      KITX.countdown(tl, "tlk", ${f(TM.tl24 + 0.2)}, ${f(LE(24) - TM.tl24 + 2)}, 0.35);
      // L25 every step lands on the invariant; anchor
      out("#lb-key, #lb-q6a, #lb-q6b, #lb-q6c", ${f(LS(25) - 0.2)});
      KITX.sideDoor(tl, "vm", ${f(LS(25) - 0.2)}, 0, 0.6);
      shrink("tlk", ${f(LS(25) - 0.2)}, 0.35); shrink("key", ${f(LS(25) - 0.2)}, 0.35);
      cam(${f(LS(25) - 0.3)}, "anchor", 1.1);
      [0, 1, 2, 3, 4, 5].forEach((i) => pop("#lb-cl" + i, ${f(LS(25) + 0.3)} + i * 0.05));
      [0, 1, 2, 3, 4, 5].forEach((i) => KIT.draw(tl, "k" + i, ${f(LS(25) + 0.4)} + i * 0.12, 0.6));
      grow("anc", ${f(TM.anc25 - 0.1)}, 0.5); pop("#lb-anc", ${f(TM.anc25 + 0.3)});
      pop("#lb-test", ${f(TM.test25)});
      // L26 limits: imagination
      out("#lb-test", ${f(LS(26) - 0.2)});
      pop("#lb-lim", ${f(TM.lim26)}); pop("#think-i", ${f(TM.img26 - 0.2)}, 0.35);
      // L27 economics: frame the whole protocol + external market
      out("#k0, #k1, #k2, #k3, #k4, #k5, #lb-anc, #lb-lim, #think-i, #lb-cl0, #lb-cl1, #lb-cl2, #lb-cl3, #lb-cl4, #lb-cl5", ${f(LS(27) - 0.2)}, 0.3);
      out("#hud", ${f(LS(27) - 0.2)}, 0.3);
      cam(${f(LS(27) - 0.2)}, "far", 1.8);
      ["mk0", "mk1", "mk2", "mk3"].forEach((id, k) => grow(id, ${f(TM.eco27)} + k * 0.12, 0.45));
      { const c = ${JSON.stringify(at(LY.wb))};
        tl.fromTo("#gf-w", { opacity: 0, scale: 0.25, svgOrigin: c[0] + " " + c[1] }, { opacity: 1, scale: 1, svgOrigin: c[0] + " " + c[1], duration: 1.2, ease: "power2.inOut", immediateRender: false }, ${f(TM.eco27 + 0.6)}); }
      pop("#lb-ext", ${f(TM.eco27 + 1.0)});
      pop("#lb-mkt", ${f(TM.mkt27 - 0.2)});
      pop("#lb-gf", ${f(TM.mkt27 + 0.3)}, 0.35);
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL);
