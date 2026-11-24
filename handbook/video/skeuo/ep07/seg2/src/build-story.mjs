// Generates compositions/story.html for ep07/seg2「② 四个陷阱」(one isometric world「收发站」, one camera).
// Run: node src/build-story.mjs
// Objects: kit + ep01/03/04/05/06 kit-ext (import only) + ep07 kit-ext + ./props.mjs. Layout: ./layout.mjs (seg1 is authoritative).
import fs from "node:fs";
import { at, Wp, f, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, CHECK, BADGE, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { scl, sp, grp, coinPile } from "./props.mjs";
import * as L from "./layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = T.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const SECTIONS = SCRIPT.sections;
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
const hid = (id, svg) => `<g id="${id}" opacity="0">${svg}</g>`;

// ---- dock (seg1 world)
const vm = E1.vending(L.VEND, { id: "vm", sign: "OUR CONTRACT" }); A.vm = vm.anchors; add(L.VEND, vm.svg);
const desk = X.dispatchDesk(L.DESK, { id: "dk", entries: [{ text: "+ 转账", kind: "ghost" }, { text: "已送达", kind: "ghost" }], shown: 1 }); A.dk = desk.anchors; add(L.DESK, desk.svg);
const tok = E1.miniVend(L.DOCK.token, { id: "tok", kind: "token" }); A.tok = tok.anchors; add(L.DOCK.token, tok.svg);
const lot = X.emptyLot(L.DOCK.lot, { id: "lot", ghost: 0.35 }); A.lot = lot.anchors; add(L.DOCK.lot, lot.svg, -400);
const bomb = E3.contractMachine(L.DOCK.bomb, { id: "bomb", name: "C" }); A.bomb = bomb.anchors; add(L.DOCK.bomb, bomb.svg);
const MO = E4.machineOut(L.DOCK.bomb);
const tape = E4.punchCard(MO.o, { id: "tape", z: MO.z, len: L.TAPE_LEN, s: 0 }); A.tape = tape.anchors; add(MO.o, tape.svg, -1);
const gasm = E1.miniVend(L.DOCK.gas, { id: "gasm", kind: "plain" }); A.gasm = gasm.anchors; add(L.DOCK.gas, gasm.svg);
const g4 = E3.gasGauge(L.GAUGE, { id: "g4", value: 0.7 }); A.g4 = g4.anchors; add(L.GAUGE, g4.svg);
for (const k of ["token", "lot", "bomb", "gas"]) {
  const p = E1.pipe(L.VEND, { id: "p-" + k, pts: L.PIPES[k], flow: true }); A["p-" + k] = p.anchors;
  items.push({ y: k === "lot" ? at(L.DOCK.lot)[1] + 1 : at(L.VEND)[1] + 0.5, svg: p.svg });   // as seg1: the lot pipe dips onto the lot
}
// seg1 end state (fades under the title card): lost parcel on the lot, the four "fates"
const pcsO = rel(L.DOCK.lot, 50, 10);
add(pcsO, `<g id="s1pc">${X.parcel(pcsO, { id: "pcs", state: "lost", scale: 1.5 }).svg}</g>`, 200);
const s1liar = X.oddCoin(L.FATE.liar, { id: "s1liar", kind: "liar" }); A.s1liar = s1liar.anchors; add(L.FATE.liar, `<g id="s1liarw">${s1liar.svg}</g>`);
const s1tgf = X.returnTag(L.FATE.fail, { id: "s1tgf", face: "false", stamp: "x", scale: 1.5 }); A.s1tgf = s1tgf.anchors; add(L.FATE.fail, `<g id="s1tgfw">${s1tgf.svg}</g>`);
const s1hg = O.hourglass(L.FATE.stall, { id: "s1hg" }); A.s1hg = s1hg.anchors; add(L.FATE.stall, `<g id="s1hgw">${s1hg.svg}</g>`);
// three short stubs on the vending's −u face (call / delegatecall / staticcall)
const stubs = L.STUB_Z.map((z, i) => E1.pipe(L.VEND, { id: "st" + i, pts: [[-100, -40 + i * 40, z], [-200, -40 + i * 40, z]], r: 8 }));
stubs.forEach((s, i) => { A["st" + i] = s.anchors; });
items.push({ y: at(L.VEND)[1] + 0.6, svg: grp("stubs", L.VEND, stubs.map((s) => s.svg).join("")) });
// trap ① return port tag + checkpoint
const tg1 = X.returnTag(L.TAG_DOCK, { id: "tg1", face: "false", scale: 1.6 }); A.tg1 = tg1.anchors; add(L.TAG_DOCK, tg1.svg);
const ghostPort = (() => { const c = at(L.TAG_DOCK, 0, 0, 40); return `<g id="gport" opacity="0"><rect x="${f(c[0] - 62)}" y="${f(c[1] - 44)}" width="124" height="74" rx="10" fill="rgba(255,253,248,0.55)" stroke="#9a9286" stroke-width="3.5" stroke-dasharray="12 8"/></g>`; })();
add(L.TAG_DOCK, ghostPort, 1);
const K1 = 0.42;
const ck1 = O.checkpoint(L.CK1, { id: "ck1", n: "ok?", road: false, glow: false });
A.ck1 = { top: sp(L.CK1, ck1.anchors.top, K1), plate: sp(L.CK1, ck1.anchors.plate, K1) };
add(L.CK1, grp("ck1w", L.CK1, scl(ck1.svg, L.CK1, K1)));
// courier + parcel (metaphor)
const cr = O.person(L.COURIER, { id: "cr", role: "engineer" }); A.cr = cr.anchors;
const pcO = rel(L.COURIER, 40, 50);
const pc = X.parcel(pcO, { id: "pc" }); A.pc = pc.anchors;
add(L.COURIER, `<g id="crw">${cr.svg}${pc.svg}</g>`, 2);
// trap ② lot tag, magnifier, checkpoint before the lot pipe leaves
const pc2O = rel(L.DOCK.lot, 20, -20);
const pc2 = X.parcel(pc2O, { id: "pc2" }); add(pc2O, hid("pc2w", pc2.svg), 1);
const cr2O = L.LOT_CR;
const cr2 = O.person(cr2O, { id: "cr2", role: "engineer" }); A.cr2 = cr2.anchors; add(cr2O, hid("cr2w", cr2.svg), 2);
const tg2 = X.returnTag(L.LOT_TAG, { id: "tg2", face: "ok", scale: 1.6 }); A.tg2 = tg2.anchors; add(L.LOT_TAG, tg2.svg);
const mg = O.magnifier(L.LOT_MAG, { id: "mg", z: 90 }); A.mg = mg.anchors; add(L.LOT_MAG, mg.svg, 3);
const ck2 = O.checkpoint(L.CK2, { id: "ck2", n: "code", road: false, glow: false });
A.ck2 = { top: sp(L.CK2, ck2.anchors.top, K1), plate: sp(L.CK2, ck2.anchors.plate, K1) };
add(L.CK2, grp("ck2w", L.CK2, scl(ck2.svg, L.CK2, K1)), 1);
// trap ③ gauge + toll clip on the bomb pipe
const KG = 0.7, gv = E3.gasGauge(L.GAUGE_V, { id: "gv", value: 1 }); A.gv = { top: sp(L.GAUGE_V, gv.anchors.top, KG) }; add(L.GAUGE_V, grp("gvw", L.GAUGE_V, scl(gv.svg, L.GAUGE_V, KG)));
const toll = X.tollClip(L.TOLL, { id: "tc", z: L.TOLL_Z, pile: 0 }); A.tc = toll.anchors; items.push({ y: at(L.VEND)[1] + 0.7, svg: grp("tcw", L.TOLL, toll.svg) });
// trap ④ frame stack + attacker
const fs4 = E3.frameStack(L.FSTACK, { id: "fs", n: 2, labels: ["外层", "内部"] }); A.fs = fs4.anchors; add(L.FSTACK, fs4.svg);
const a4 = O.person(L.ATK4, { id: "a4", role: "attacker" }); A.a4 = a4.anchors; add(L.ATK4, a4.svg);
// L16 attacker contract: lies (tag), calls back (arm), burns gas
const av = E1.miniVend(L.ATKV, { id: "av", kind: "attacker" }); A.av = av.anchors; add(L.ATKV, av.svg);
const armO = rel(L.ATKV, -10, 70);
const arm = E4.callbackArm(armO, { id: "arm", target: A.vm.buttons[1], s: 0 }); add(armO, arm.svg, 1);
const tgA = X.returnTag(rel(L.ATKV, 110, 40), { id: "tgA", face: "ok", scale: 1.5 }); A.tgA = tgA.anchors; add(rel(L.ATKV, 110, 40), tgA.svg);

// ---- Qubit (seg1 bridge zone)
const br = E1.bridge(L.BRIDGE, { id: "br" }); A.br = br.anchors; add(L.BRIDGE, br.svg);
const chE = O.chain(L.CHAIN_ETH, { id: "chE", n: 3 }); A.chE = chE.anchors; add(L.CHAIN_ETH, chE.svg);
const chB = O.chain(L.CHAIN_BNB, { id: "chB", n: 3 }); A.chB = chB.anchors; add(L.CHAIN_BNB, chB.svg);
const be = E3.contractMachine(L.BR_ETH, { id: "be", name: "ETH" }); A.be = be.anchors; add(L.BR_ETH, be.svg);
const bb = E3.contractMachine(L.BR_BNB, { id: "bb", name: "BNB" }); A.bb = bb.anchors; add(L.BR_BNB, bb.svg);
const vault = O.hotWallet(L.ETH_VAULT, { id: "ev" }); A.ev = vault.anchors; add(L.ETH_VAULT, vault.svg);
const zl = X.emptyLot(L.ZERO_LOT, { id: "zl", zero: true, scale: 0.8 }); A.zl = zl.anchors; add(L.ZERO_LOT, zl.svg, -300);
const bp = E1.pipe(L.BR_ETH, { id: "bp", pts: L.BR_PIPE }); A.bp = bp.anchors; add(L.BR_ETH, bp.svg, 0.5);
const tgB = X.returnTag(L.TAG_BR, { id: "tgB", face: "empty", scale: 1.8 }); A.tgB = tgB.anchors; add(L.TAG_BR, tgB.svg);
const pool = E3.contractMachine(L.LEND_POOL, { id: "pool", name: "POOL" }); A.pool = pool.anchors; add(L.LEND_POOL, pool.svg);
const qx = coinPile("qx", L.QX_PILE, 14, { color: "teal" }); add(L.QX_PILE, qx);
const adoc = O.doc(L.ADDR_DOC, { id: "adoc", title: "代币地址", lines: ["USDT  0xdA…", "ETH   0x000…0", "…"], standing: true, w: 230, h: 200 }); A.adoc = adoc.anchors; add(L.ADDR_DOC, adoc.svg);
const fp = E5.funcPanel(L.FPANEL, { id: "fp", buttons: [{ name: "depositETH" }, { name: "deposit" }], title: "BRIDGE" }); A.fp = fp.anchors; add(L.FPANEL, fp.svg);
const KW = 0.6;
const wl = O.checkpoint(L.WL, { id: "wl", n: "ID", road: false });
A.wl = { top: sp(L.WL, wl.anchors.top, KW), plate: sp(L.WL, wl.anchors.plate, KW) };
add(L.WL, grp("wlw", L.WL, scl(wl.svg, L.WL, KW)));
const aq = O.person(L.ATKQ, { id: "aq", role: "attacker" }); A.aq = aq.anchors;
const rcO = rel(L.ATKQ, 40, 40);
const rcard = O.doc(rcO, { id: "rcd", title: "资源 ID", lines: ["ETH"], standing: true, w: 120, h: 110 }); A.rcd = rcard.anchors;
add(L.ATKQ, `<g id="aqw">${aq.svg}<g id="rcdw"><g transform="translate(0,${f(-70 * 0.866)})">${rcard.svg}</g></g></g>`, 2);
const seal = O.seal(L.SEAL, { id: "seal", paper: false, stamped: false }); A.seal = seal.anchors; add(L.SEAL, seal.svg);
const mute = X.oddCoin(L.MUTE, { id: "mute", kind: "mute", scale: 1.3 }); A.mute = mute.anchors; add(L.MUTE, mute.svg);
const dk2 = X.dispatchDesk(L.DESK2, { id: "dk2", entries: [{ text: "ETH 存款", kind: "ghost" }], shown: 0 }); A.dk2 = dk2.anchors; add(L.DESK2, dk2.svg);
const lt = E1.letter(rel(L.BR_ETH, 160, 60), { id: "lt", z: 0 }); A.lt = lt.anchors; add(rel(L.BR_ETH, 160, 60), hid("ltw", lt.svg), 3);
const af = O.person(L.ATKF, { id: "af", role: "attacker" }); A.af = af.anchors; add(L.ATKF, af.svg);
const mag2O = L.MAG2;
const mg2 = O.magnifier(mag2O, { id: "mg2", z: 80 }); A.mg2 = mg2.anchors; add(mag2O, mg2.svg, 3);

items.sort((a, b) => a.y - b.y);
const world = worldSvg("wsvg", gridSvg({ u0: -2400, u1: 3600, v0: -2800, v1: 2400 }) + items.map((x) => x.svg).join("\n"), [-3000, -2600, 7000, 5000]);

// ---------------------------------------------------------------- labels (world)
let labels = "";
const lb = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, cls + " hide", a); };
const pin = (id, p, html, a = "c") => { labels += wpin(id, p, html, a); };
// seg1 end-state labels (visible at 0, fade under the title card)
labels += wlab("s1f1", up(A.s1tgf.top, 0), "失败", "lab-rs") + wlab("s1f2", up(A.s1liar.top, 0), "撒谎", "lab-rs") + wlab("s1f3", up(A.s1hg.top, 0), "拖延", "lab-rs") + wlab("s1f4", [A.lot.top[0] - 20, A.lot.top[1]], "不存在", "lab-rs");
lb("lb-vm", up(A.vm.top, 10), "我们的合约", "lab-ink");
["call", "delegatecall", "staticcall"].forEach((t, i) => lb("lb-st" + i, [A["st" + i].end[0] - 14, A["st" + i].end[1]], t, "lab-ink", "r"));
lb("lb-tok", up(A.tok.top, 6), "代币合约", "", "b");
lb("lb-false", up(A.tg1.top, 4), "失败 → 只返回 false", "lab-rs", "b");
lb("lb-norb", up(A.vm.top, 10), "不自动回滚 · 照常往下走", "lab-r", "b");
lb("lb-meta", W3(L.COURIER, -60, 120, 0), "比喻", "lab-g", "b");
lb("lb-cr", up(A.cr.head, 40), "快递员", "", "b");
lb("lb-ent", [A.dk.entries[1][0] + 30, A.dk.entries[1][1] - 40], "已送达", "lab-r", "b");
lb("lb-noret", up(A.tg1.top, 4), "回执没回来", "lab-r", "b");
lb("lb-ck1", up(A.ck1.top, 4), "没有回执 → 回滚", "lab-gs", "b");
pin("ck1c", up(A.ck1.plate, -6), CHECK("ck1c-i", 52, "hide"));
lb("lb-lot", up(A.lot.plateTop, 10), "目标地址 · 没有代码", "", "b");
lb("lb-dlv", up(A.cr2.head, 40), "送到了！", "lab-ink", "b");
lb("lb-tg2", up(A.tg2.top, 4), "返回成功", "lab-gs", "b");
lb("lb-data", W3(L.LOT_TAG, 90, 0, 40), "返回数据：空", "lab-g", "l");
lb("lb-low", W3(L.LOT_TAG, 0, 70, 0), "低级调用", "lab-g lab-sm", "t");
lb("lb-cl0", up(A.mg.lens, 90), "code.length = 0", "lab-ink", "b");
lb("lb-ck2", up(A.ck2.top, 4), "没有代码 → 不发出", "lab-gs", "b");
pin("ck2c", up(A.ck2.plate, -6), CHECK("ck2c-i", 52, "hide"));
lb("lb-bomb", up(A.bomb.top, 6), "对方合约", "", "b");
lb("lb-huge", W3(MO.o, 40, 200, 0), "超大的返回数据", "lab-rs", "l");
lb("lb-gv", up(A.gv.top, 4), "我们的 gas", "", "b");
lb("lb-mem", up(A.gv.top, 4), "复制进内存 → gas 耗光", "lab-rs", "b");
lb("lb-cut", up(A.tc.top, 40), "只复制前 N 字节", "lab-cs", "b");
pin("ck3c", up(A.gv.top, 70), CHECK("ck3c-i", 52, "hide"));
lb("lb-g4", up(A.g4.top, 4), "调用方给的 gas", "", "b");
lb("lb-few", up(A.g4.top, 4), "刚好不够", "lab-rs", "b");
lb("lb-fs1", [A.fs.trays[1][0] + 130, A.fs.trays[1][1]], "内部调用 · 失败", "lab-rs", "l");
lb("lb-fs0", [A.fs.trays[0][0] + 100, A.fs.trays[0][1]], "外层 · 继续往下走", "lab-ink", "l");
lb("lb-blind", up(A.fs.top, 30), "外层没察觉", "lab-rs", "b");
lb("lb-gl", W3(L.GAUGE, -150, 0, 160), "gasleft() 够不够？", "lab-cs", "r");
lb("lb-all", up(A.fs.top, 30), "关键调用失败 → 整体回滚", "lab-gs", "b");
pin("ck4c", up(A.fs.top, 110), CHECK("ck4c-i", 52, "hide"));
lb("lb-one", up(A.cr.head, 40), "一次一种错：没送到", "lab-ink", "b");
lb("lb-nometa", W3(L.COURIER, -60, 120, 0), "比喻在这里不成立", "lab-rs", "t");
lb("lb-lie", [A.tgA.face[0] + 50, A.tgA.face[1]], "撒谎", "lab-rs", "l");
lb("lb-cb", W3(L.ATKV, 60, -60, 250), "回调", "lab-rs", "l");
lb("lb-burn", up(A.gv.top, 4), "耗尽 gas", "lab-rs", "b");
lb("lb-same", W3(L.ATKV, 60, 120, 0), "同时发生", "lab-ink", "t");
// Qubit
lb("lb-eth", up(A.chE.top ?? at(L.CHAIN_ETH, 0, 0, 120), 0), "以太坊", "", "b");
lb("lb-bnb", up(A.chB.top ?? at(L.CHAIN_BNB, 0, 0, 120), 0), "BNB Chain", "", "b");
lb("lb-be", up(A.be.top, 6), "桥 · 以太坊侧", "lab-cs", "b");
lb("lb-adoc", up(A.adoc.top, 4), "ETH → 零地址", "lab-rs", "b");
lb("lb-zl", [A.zl.plateTop[0] + 60, A.zl.plateTop[1] - 60], "零地址", "lab-ink", "b");
lb("lb-dE", up(A.fp.btns[0], 40), "depositETH · 核对附带的 ETH", "lab-gs", "b");
lb("lb-d", [A.fp.btns[1][0] + 20, A.fp.btns[1][1] - 30], "deposit", "lab-ink", "l");
lb("lb-rid", up(A.aq.head, 40), "传入 ETH 的资源 ID", "lab-r", "b");
lb("lb-wl", [A.wl.top[0] + 70, A.wl.top[1] - 4], "白名单 · 通过", "lab-gs", "b");
lb("lb-stf", W3(L.BR_ETH, -220, 0, 170), "safeTransferFrom(零地址)", "lab-ink", "l");
lb("lb-tgB", up(A.tgB.top, 4), "成功 · 返回数据空", "lab-g", "b");
lb("lb-lib", up(A.seal.top, 10), "旧版安全转账库：空返回 = 成功", "lab-rs", "b");
lb("lb-mute", up(A.mute.top, 6), "不返回值的 USDT", "", "b");
lb("lb-dk2", [A.dk2.entries[0][0] + 30, A.dk2.entries[0][1] - 40], "+ ETH 存款", "lab-rs", "b");
lb("lb-qx", W3(L.QX_PILE, 0, 0, 120), "大量 qXETH", "lab-cs", "b");
lb("lb-pool", up(A.pool.top, 6), "借贷池", "lab-cs", "b");
lb("lb-empty", up(A.pool.top, 6), "借贷池 · 被借空", "lab-rs", "b");
lb("lb-pz", up(A.zl.plateTop, 8), "零地址", "lab-rs", "b");
lb("lb-pc", up(A.mute.top, 6), "兼容性妥协", "lab-rs", "b");
lb("lb-pn", up(A.fp.btns[0], 40), "缺少原生币检查", "lab-rs", "b");
lb("lb-wl1", up(A.wl.top, 70), "这个 ID 被允许 ✓", "lab-gs", "b");
lb("lb-wl2", up(A.wl.top, 4), "它是什么资产？", "lab-rs", "b");
lb("lb-nocode", up(A.mg2.lens, 90), "无代码 → 回滚", "lab-gs", "b");
pin("ck5c", [A.mg2.lens[0] + 150, A.mg2.lens[1] - 70], CHECK("ck5c-i", 56, "hide"));
// pool dot matrix (gold, each dot = one unit in the pool)
const PD = 5 * 4;
let pdots = "";
for (let i = 0; i < PD; i++) pdots += `<i class="pd" id="pd${i}"></i>`;
pin("pdots", W3(L.LEND_POOL, 0, 0, 330), `<div class="pdm hide" id="pdm">${pdots}</div>`, "b");
// three combo links on the near bank (L29)
const comboPts = [up(A.zl.plateTop, 8), up(A.mute.top, 6), up(A.fp.btns[0], 40)];
labels += `<svg class="wsvg" style="left:0;top:0;overflow:visible" width="10" height="10"><path id="combo" d="M${comboPts.map((p) => `${f(p[0])},${f(p[1])}`).join("L")}" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="16 11" stroke-linecap="round" opacity="0"/></svg>`;

// ---------------------------------------------------------------- cameras
const bx = (o, u0, u1, v0, v1, z0, z1) => { const r = []; for (const a of [u0, u1]) for (const b of [v0, v1]) for (const c of [z0, z1]) r.push(at(o, a, b, c)); return r; };
const fit = (P, [x0, y0, x1, y1], kmax = 2) => {
  const xs = P.map((q) => q[0]), ys = P.map((q) => q[1]);
  const bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys);
  const k = Math.min(kmax, (x1 - x0) / bw, (y1 - y0) / bh);
  return camAt([(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};
const B = {
  s1vm: bx(L.VEND, -100, 100, -75, 75, 0, 360), s1tg: bx(L.TAG_DOCK, -60, 60, -20, 20, 0, 200), s1lot: bx(L.DOCK.lot, -130, 130, -100, 100, 0, 170),
  s1desk: bx(L.DESK, -100, 100, -50, 50, 0, 200), s1tok: bx(L.DOCK.token, -60, 60, -50, 50, 0, 260), s1bomb: bx(L.DOCK.bomb, -120, 120, -110, 110, 0, 290),
  s1gas: [...bx(L.DOCK.gas, -60, 60, -50, 50, 0, 220), ...bx(L.GAUGE, -70, 70, -45, 40, 0, 260), ...bx(L.FATE.stall, -60, 60, -60, 60, 0, 260)],
  vm: bx(L.VEND, -100, 100, -75, 75, 0, 340),
  stubs: bx(L.VEND, -230, -100, -60, 60, 160, 300),
  desk: bx(L.DESK, -100, 100, -50, 50, 0, 140),
  tok: bx(L.DOCK.token, -60, 60, -50, 50, 0, 220),
  lot: bx(L.DOCK.lot, -130, 130, -100, 100, 0, 60),
  bomb: bx(L.DOCK.bomb, -110, 110, -100, 100, 0, 240),
  tape: bx(MO.o, -30, 30, 0, L.TAPE_LEN + 30, 0, 20),
  gas: bx(L.DOCK.gas, -60, 60, -50, 50, 0, 220),
  tagd: bx(L.TAG_DOCK, -40, 40, -20, 20, 0, 110),
  ck1: bx(L.CK1, -40, 40, -80, 30, 0, 130),
  cr: bx(L.COURIER, -40, 80, -40, 80, 0, 270),
  lottag: bx(L.LOT_TAG, -40, 40, -20, 20, 0, 110),
  mg: bx(L.LOT_MAG, -60, 60, -10, 10, 0, 420),
  ck2: bx(L.CK2, -40, 40, -80, 30, 0, 130),
  lotcr: bx(L.LOT_CR, -40, 40, -40, 40, 0, 260),
  toll: bx(L.TOLL, -40, 40, -30, 30, 0, 160),
  gv: bx(L.GAUGE_V, -70, 70, -15, 15, 0, 210),
  g4: bx(L.GAUGE, -100, 100, -20, 20, 0, 300),
  fs: bx(L.FSTACK, -120, 120, -86, 86, 0, 200),
  a4: bx(L.ATK4, -40, 40, -40, 40, 0, 260),
  av: bx(L.ATKV, -60, 160, -50, 80, 0, 240),
  // Qubit
  bridge: bx(L.BRIDGE, -270, 270, -60, 60, 0, 200),
  be: bx(L.BR_ETH, -110, 110, -100, 100, 0, 260),
  bb: bx(L.BR_BNB, -110, 110, -100, 100, 0, 260),
  zl: bx(L.ZERO_LOT, -110, 110, -80, 80, 0, 60),
  adoc: bx(L.ADDR_DOC, -115, 115, -5, 5, 0, 240),
  fp: bx(L.FPANEL, -130, 130, -85, 85, 0, 150),
  wl: bx(L.WL, -40, 40, -120, 30, 0, 170),
  aq: bx(L.ATKQ, -40, 80, -40, 80, 0, 260),
  seal: bx(L.SEAL, -60, 60, -40, 40, 0, 170),
  mute: bx(L.MUTE, -60, 60, -20, 20, 0, 150),
  tgB: bx(L.TAG_BR, -40, 40, -20, 20, 0, 100),
  dk2: bx(L.DESK2, -100, 100, -50, 50, 0, 140),
  pool: bx(L.LEND_POOL, -110, 110, -100, 100, 0, 380),
  qx: bx(L.QX_PILE, -60, 60, -40, 60, 0, 120),
  af: bx(L.ATKF, -40, 40, -40, 40, 0, 260),
};
const SC = [80, 170, 1840, 880];          // full scene
const SL = [80, 420, 1840, 890];          // below a top-right code card
const SLL = [60, 200, 1000, 890];         // left of a right code card
const CAMS = {
  dock: fit([...B.s1vm, ...B.s1tg, ...B.s1lot, ...B.s1desk, ...B.s1tok, ...B.s1bomb, ...B.s1gas], [60, 240, 1860, 900]),   // = seg1 CAMS.wide (its last frame)
  stubs: fit([...B.vm, ...B.stubs], [560, 240, 1500, 880], 1.8),
  call: fit([...B.vm, ...B.tok, ...B.tagd], [140, 220, 1780, 880], 1.3),
  met: fit([...B.vm, ...B.desk, ...B.cr], [200, 220, 1720, 880], 1.4),
  t1: fit([...B.vm, ...B.desk, ...B.tagd, ...B.ck1], [60, 230, 860, 890], 1.5),
  t2: fit([...B.lot, ...B.lottag, ...B.mg, ...B.ck2, ...B.lotcr], [60, 200, 860, 780], 1.5),
  t3: fit([...B.bomb, ...B.tape, ...B.gv, ...B.toll], SC, 1.4),
  t4: fit([...B.gas, ...B.g4, ...B.fs, ...B.a4], SC, 1.4),
  met2: fit([...B.vm, ...B.cr, ...B.av, ...B.gv], [200, 200, 1720, 880], 1.6),
  q0: fit([...B.bridge, ...B.be, ...B.bb, ...B.zl, ...B.fp, ...B.qx], [60, 220, 1860, 890], 1.3),
  q1: fit([...B.be, ...B.zl, ...B.adoc, ...B.tgB], SLL, 1.3),
  q2: fit([...B.be, ...B.fp, ...B.wl, ...B.aq, ...B.zl], SLL, 1.2),
  q3: fit([...B.be, ...B.zl, ...B.tgB, ...B.seal, ...B.mute], SLL, 1.3),
  q5: fit([...B.be, ...B.dk2, ...B.bridge], SC, 1.4),
  q5c: fit([...B.bridge, ...B.bb, ...B.qx], [200, 220, 1720, 880], 1.4),
  q5b: fit([...B.bb, ...B.qx, ...B.pool, ...B.af], [200, 240, 1720, 880], 1.3),
  q6: fit([...B.be, ...B.zl, ...B.fp, ...B.mute, ...B.wl], SLL, 1.2),
  q7: fit([...B.wl, ...B.aq, ...B.fp], [200, 260, 1720, 880], 1.4),
  q8: fit([...B.zl, ...B.be, ...B.tgB], [200, 260, 1720, 880], 1.4),
};

// ---------------------------------------------------------------- screen overlays
const CARD = { A: { x: 900, y: 112, w: 960 }, B: { x: 1050, y: 112, w: 820 } };
const rowY = (c, i) => c.y + 24 + 56 + 50 * i + 25;
const cardA = `<div class="k-code hide" id="cardA" style="left:${CARD.A.x}px;top:${CARD.A.y}px;width:${CARD.A.w}px">
  <div class="c-head">低级调用的两道检查</div>
  <div class="c-row" id="ca0">(bool ok, ) = target.call(data);<span class="c-chip x hide" id="ca0x">✗ 不看 ok</span></div>
  <div class="c-row" id="ca1">require(ok);<span class="c-cm">            // 陷阱一</span></div>
  <div class="c-row" id="ca2">require(target.code.length > 0);<span class="c-cm"> // 陷阱二</span></div>
</div>`;
const STEPS = ["ETH 的代币地址 = 零地址", "deposit(ETH 资源 ID) · 白名单 ✓", "safeTransferFrom(零地址, …)", "零地址无代码 → 空返回 = 成功", "记存款 → 铸 qXETH → 借空借贷池"];
const cardB = `<div class="k-code hide" id="cardB" style="left:${CARD.B.x}px;top:${CARD.B.y}px;width:${CARD.B.w}px">
  <div class="c-head">Qubit · 根因五步<span class="c-tag">SlowMist 分析</span></div>
  ${STEPS.map((s, i) => `<div class="c-row cb" id="cb${i}"><span class="sn">${i + 1}</span>${s}<span class="c-chip ok hide" id="cb${i}k">✓</span></div>`).join("")}
  <div class="c-foot" id="cbF">零地址 + 兼容性妥协 + 缺少原生币检查</div>
</div>`;
const S = (cam, p) => toScreen(CAMS[cam], p);
const ov = [];
const lead = (id, card, row, P3, bend = 160) => {
  const P0 = [card.x - 4, rowY(card, row)];
  const c = dashCurve(id, P0, P3, { c1: [P0[0] - bend, P0[1] + 10], c2: [P3[0] + 80, P3[1] - bend] }); ov.push(c.svg);
};
lead("cv-a0", CARD.A, 0, S("t1", up(A.tg1.center, 0)), 200);
lead("cv-a2", CARD.A, 2, S("t2", A.lot.plate), 200);
const ovSvg = `<svg id="ovl" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">${ov.join("")}</svg>`;

// trap strip (top-left)
const TRAPS = ["不检查返回值", "目标没有代码", "返回数据炸弹", "gas 不足型失败"];
const strip = `<div class="dz hide" id="dz"><span class="dz-t">四个陷阱</span>${TRAPS.map((_, i) => `<span class="dz-s" id="dz${i}">${i + 1}</span>`).join("")}<span class="dz-n">${TRAPS.map((d, i) => `<span class="dz-name" id="dzn${i}">${d}</span>`).join("")}</span></div>`;

// term cards (one at a time, top-left)
const TERMS = [
  { id: "rb", t: "回滚", d: "撤销这次调用做过的全部改动", at: w("回滚", 1) },
  { id: "bool", t: "布尔值", d: "只有 true 和 false 两种取值", at: w("布尔值", 4) },
  { id: "gas", t: "gas", d: "执行合约每一步都要消耗的燃料", at: w("gas", 10) },
  { id: "cbk", t: "回调", d: "被调用的合约反过来调用你的合约", at: w("回调", 16) },
  { id: "nat", t: "原生币", d: "链自带的币，如以太坊上的 ETH", at: w("原生", 18) },
  { id: "zero", t: "零地址", d: "全是 0 的地址，上面没有代码", at: we("零地址", 18) },
  { id: "rid", t: "资源 ID", d: "桥用来标识一种资产的编号", at: w("资源ID", 20) },
  { id: "wl", t: "白名单", d: "事先列好、允许通过的名单", at: we("白名单", 21) + 0.5 },
  { id: "stf", t: "safeTransferFrom", d: "安全转账库里把代币转进来的函数", at: w("safeTransferFrom", 22) },
  { id: "serc", t: "SafeERC20", d: "常用的安全转账库，包住代币调用", at: w("SafeERC20", 32) },
];
TERMS.forEach((x, i) => { const nx = TERMS[i + 1]; x.end = Math.min(x.at + 3.6, nx ? nx.at - 0.15 : 1e9); });
const termHtml = TERMS.map((x) => `<div class="term hide" id="tm-${x.id}"><div class="tm-t">${x.t}</div><div class="tm-d">${x.d}</div></div>`).join("");

// ---------------------------------------------------------------- times
const TM = {
  low: w("低级调用", 0), call: w("call", 0), dcall: w("delegatecall", 0), scall: w("staticcall", 0),
  fail1: w("失败", 1), norb: w("不会自动回滚", 1), f1: w("false", 1),
  meta: w("打个比方", 2), cour: w("快递员", 2), book: w("登记簿", 2), done2: w("已送达", 2),
  trap1: w("陷阱一", 3), noChk: w("不检查", 3), noReply: w("没回话", 3), deem: w("当作送到", 3),
  fix4: w("修复", 4), catch4: w("接住", 4), bool: w("布尔值", 4), rb4: w("回滚", 4),
  trap2: w("陷阱二", 5), nocode: w("没有代码", 5), waste: w("荒地", 5),
  said: w("送到了", 6), noRej: w("不会拒收", 6),
  call7: w("call", 7), ok7: w("成功", 7), empty7: w("空的", 7),
  fix8: w("修复", 8), before8: w("之前", 8), len8: w("代码长度", 8), gt0: w("大于0", 8),
  trap3: w("陷阱三", 9), bomb9: w("炸弹", 9), huge: w("超大", 9),
  mem: w("内存", 10), burn10: w("耗光", 10), fix10: w("修复", 10), lim: w("限制复制长度", 10),
  trap4: w("陷阱四", 11),
  give: w("故意", 12), few: w("刚好不够", 12),
  inner: w("内部调用", 13), outer: w("外层", 13), cont: w("继续", 13),
  gl: w("剩余", 14), crit: w("关键调用", 14), all14: w("整体回滚", 14),
  nometa: w("不成立", 15), one: w("一种错", 15),
  lie: w("撒谎", 16), cb: w("回调", 16), burn16: w("耗尽", 16),
  back: w("回到", 17), slow: w("SlowMist", 17), five: w("五步", 17),
  s1: w("第一步", 18), nat: w("原生", 18), addr: w("代币地址", 18), zero18: w("零地址", 18),
  dE: w("depositETH", 19), chk19: w("核对", 19),
  s2: w("第二步", 20), atk20: w("攻击者", 20), dep20: w("deposit", 20), rid: w("资源ID", 20),
  wl21: w("白名单", 21), pass21: w("通过", 21),
  s3: w("第三步", 22), zero22: w("零地址", 22), stf: w("safeTransferFrom", 22),
  s4: w("第四步", 23), nc23: w("没有代码", 23), ok23: w("返回成功", 23), empty23: w("空的", 23),
  lib: w("安全转账库", 24), deem24: w("当作成功", 24),
  compat: w("兼容", 25), usdt: w("USDT", 25),
  s5: w("第五步", 26), rec26: w("记下", 26), bnb26: w("BNB", 26), mint: w("铸出", 26), qx: w("qXETH", 26),
  coll: w("抵押", 27), drain: w("借空", 27),
  each: w("每一步", 28), ok28: w("说得通", 28),
  combo: w("组合", 29), cz: w("零地址", 29), cc: w("兼容性妥协", 29), cn: w("缺少原生币检查", 29),
  wl30: w("白名单", 30), allow: w("被允许", 30),
  what: w("什么资产", 31),
  serc: w("SafeERC20", 32), emp32: w("空返回", 32), chk32: w("检查目标", 32),
};

// leaders / walks in world-canvas deltas
const DL = (from, to) => [f(to[0] - from[0]), f(to[1] - from[1])];
const UVd = (a, b) => [b.u - a.u, b.v - a.v];
const CRW1 = [-420, 420];   // courier walks off (front-left) and disappears
const ltDeck = A.br.deck.map((p) => [f(p[0]), f(p[1] - 10)]);

const GROWN = ["gvw", "stubs", "ck1w", "ck2w", "mg", "tcw", "fs", "a4", "av", "arm", "pool", "adoc", "fp", "wlw", "aqw", "seal", "mute", "dk2", "af", "mg2", "qx"];

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 84px; }
    .kw { position: absolute; left: 56px; top: 262px; font-size: 42px; font-weight: 900; color: #1c1c1c; background: #fffdf8; border-radius: 16px; padding: 10px 28px 14px;
      box-shadow: 0 10px 24px rgba(70,60,40,0.12); white-space: nowrap; }
    .kw b { color: #1d93ba; }
    .kw b.r { color: #e0453a; }
    .gtag { display: inline-block; font-size: 30px; font-weight: 800; color: #6d685e; background: #ebe6dc; border-radius: 8px; padding: 2px 12px 4px; margin-left: 12px; vertical-align: 6px; }
    .k-code .c-row { white-space: pre; }
    .k-code .c-chip.ok { background: #1f9d55; }
    .k-code .c-chip.x { background: #e0453a; font-family: "Noto Sans SC", sans-serif; }
    .k-code .cb { font-family: "Noto Sans SC", "JetBrains Mono", sans-serif; color: #9a9286; }
    .k-code .cb .sn { display: inline-block; width: 38px; height: 38px; margin-right: 14px; border-radius: 50%; background: #d6d0c4; color: #fff; font: 800 28px/38px "Noto Sans SC", sans-serif; text-align: center; vertical-align: 2px; background: #8a8478; }
    .k-code .cb.on { color: #1c1c1c; }
    .k-code .cb.on .sn { background: #1d93ba; }
    .k-code .c-foot { margin-top: 10px; font-size: 30px; font-weight: 900; color: #9a9286; border-radius: 10px; padding: 4px 14px 6px; margin-left: -14px; white-space: nowrap; }
    .dz { position: absolute; left: 56px; top: 30px; height: 60px; display: flex; align-items: center; gap: 10px; background: #fffdf8; border-radius: 14px; padding: 0 18px;
      box-shadow: 0 6px 16px rgba(70,60,40,0.10); }
    .dz-t { font-size: 30px; font-weight: 900; margin-right: 6px; white-space: nowrap; }
    .dz-s { width: 44px; height: 44px; border-radius: 10px; border: 3px dashed #c9c1b2; color: #8a8478; font: 800 28px/38px "Noto Sans SC", sans-serif; text-align: center; }
    .dz-s.lit { border: 3px solid #1d93ba; color: #1d93ba; }
    .dz-s.cur { background: #1c1c1c; border-color: #1c1c1c; color: #ffffff; }
    .dz-n { position: relative; width: 250px; height: 44px; margin-left: 8px; }
    .dz-name { position: absolute; left: 0; top: 0; font-size: 30px; font-weight: 800; line-height: 44px; white-space: nowrap; opacity: 0; }
    .term { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px; padding: 14px 26px 18px 22px;
      box-shadow: 0 10px 24px rgba(70,60,40,0.14); }
    .tm-t { font-size: 32px; font-weight: 900; line-height: 1.3; white-space: nowrap; }
    .tm-d { margin-top: 4px; font-size: 29px; font-weight: 700; line-height: 1.35; color: #3a3832; white-space: nowrap; }
    .pdm { display: grid; grid-template-columns: repeat(5, 30px); gap: 8px; background: #fffdf8; padding: 12px; border-radius: 12px; box-shadow: 0 6px 16px rgba(70,60,40,0.12); }
    .pd { display: block; width: 30px; height: 30px; border-radius: 50%; background: #e2b33c; border: 2px solid #a87d17; box-sizing: border-box; }
    .s1key { position: absolute; left: 330px; top: 116px; width: 1260px; text-align: center; padding: 22px 30px 26px; background: #ffffff; border-radius: 22px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    .s1key .k1 { font-size: 56px; font-weight: 900; white-space: nowrap; }
    .s1key .k1 b { color: #1d93ba; }
    .stampg { position: absolute; left: 56px; top: 262px; font-size: 40px; font-weight: 900; color: #6d685e; border: 5px solid #8a8478; border-radius: 12px; padding: 6px 22px 10px; background: rgba(255,253,248,0.9); transform: rotate(-4deg); white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div class="kw hide" id="kw-low">低级调用 · <b>失败也不回滚</b></div>
      <div class="kw hide" id="kw-meta"><span class="gtag">比喻</span>快递员送包裹 · 登记簿记账</div>
      <div class="stampg hide" id="kw-nometa">比喻在这里不成立</div>
      <div class="kw hide" id="kw-q">2022 年 1 月 · <b>Qubit</b> 跨链桥 · 根因五步</div>
      <div class="kw hide" id="kw-each">每一步单独看 · <b>都说得通</b></div>
      <div class="kw hide" id="kw-combo">漏洞来自 <b class="r">组合</b></div>
      <div class="s1key" id="s1key"><div class="k1">每一个外部调用 = <b>把命运交给别人</b></div></div>
      ${strip}${cardA}${cardB}${ovSvg}${termHtml}
      ${pills(2, { sections: SECTIONS })}
      <div class="k-title" id="ttl-card"><div class="t-main">② 四个陷阱</div><div class="t-sub">低级调用 · Qubit 根因</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E3.runtimeExtJs()}
${E4.runtimeExtJs()}
${E5.runtimeExtJs()}
${E6.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const X1 = window.KITX01, X3 = window.KITX03, X4 = window.KITX04, X5 = window.KITX05, X6 = window.KITX06, X7 = window.KITX07;
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const flash = (sel, t, n, lo) => tl.fromTo(sel, { opacity: 1 }, { opacity: lo == null ? 0.25 : lo, duration: 0.16, yoyo: true, repeat: (n || 3) * 2 - 1, ease: "power1.inOut", immediateRender: false }, t);
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      ${JSON.stringify(GROWN)}.forEach((id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); });
      ["tg1", "tg2", "tgA", "tgB"].forEach((id) => tl.set("#" + id + "-pop", { opacity: 0 }, 0));
      const slot = (i, cls, t) => tl.set("#dz" + i, { className: "dz-s " + cls }, t);
      const dzName = (i, t) => { [0, 1, 2, 3].forEach((j) => tl.to("#dzn" + j, { opacity: j === i ? 1 : 0, duration: 0.2 }, t)); };
      const trap = (i, t) => { if (i > 0) slot(i - 1, "lit", t); slot(i, "cur", t); dzName(i, t); };
      const hot = (id, t) => tl.to("#" + id, { backgroundColor: "#fdeae7", duration: 0.2 }, t);
      const teal = (id, t) => tl.to("#" + id, { backgroundColor: "#dff1f7", duration: 0.2 }, t);
      const cool = (id, t) => tl.to("#" + id, { backgroundColor: "rgba(253,234,231,0)", duration: 0.2 }, t);
      ["#ca0", "#ca1", "#ca2", "#cbF"].forEach((s) => tl.set(s, { backgroundColor: "rgba(253,234,231,0)" }, 0));
      const step = (i, t) => tl.set("#cb" + i, { className: "c-row cb on" }, t);
      const term = (id, t0, t1) => { pop("#tm-" + id, t0, 0.3); out("#tm-" + id, t1 - 0.2, 0.2); };
      ${JSON.stringify(TERMS.map((x) => [x.id, f(x.at), f(x.end)]))}.forEach((x) => term(x[0], x[1], x[2]));
      const flow = (id, t, dur, show) => { if (show !== false) fadeIn("#" + id + "-flow", t, 0.2); X1.dash(tl, [id + "-flow"], t, dur, -dur * 70); };

      // ===== 0–1.6 · seg1 end state (dock panorama) under the title card
      KIT.camSet(tl, CAMS.dock);
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.15);
      out("#s1key, #s1f1, #s1f2, #s1f3, #s1f4", 0.6, 0.3);
      out("#s1liarw, #s1tgfw, #s1hgw, #s1pc", 0.7, 0.4);
      out("#p-token-flow, #p-lot-flow, #p-bomb-flow, #p-gas-flow", 0.7, 0.4);
      X7.lotGhost(tl, "lot", 0.7, 0.35, 0.01);
      pop("#lb-vm", 1.4, 0.3);
      // ===== L0 low-level calls: three short stubs with name plates
      KIT.cam(tl, 1.0, CAMS.stubs, 1.3);
      grow("stubs", ${f(TM.low - 0.2)}, 0.5);
      pop("#lb-st0", ${f(TM.call)}, 0.25); pop("#lb-st1", ${f(TM.dcall)}, 0.25); pop("#lb-st2", ${f(TM.scall)}, 0.25);
      // ===== L1 failure → only returns false, no automatic revert
      out("#lb-st0, #lb-st1, #lb-st2", ${f(LS[1] - 0.1)}, 0.2); out("#stubs", ${f(LS[1])}, 0.3);
      KIT.cam(tl, ${f(LS[1] - 0.1)}, CAMS.call, 1.0);
      pop("#lb-tok", ${f(LS[1] + 0.3)}, 0.3);
      flow("p-token", ${f(LS[1] + 0.2)}, 1.4);
      KIT.broke(tl, "tok", ${f(TM.fail1)}, { badge: true, ghost: 0.6 });
      X7.tagPop(tl, "tg1", ${f(TM.f1 - 0.4)}); pop("#lb-false", ${f(TM.f1 - 0.2)}, 0.3);
      pop("#lb-norb", ${f(TM.norb + 0.1)}, 0.3); out("#lb-vm", ${f(TM.norb + 0.1)}, 0.2);
      KIT.led(tl, "dk-led", ${f(TM.norb)}, "green");
      // ===== L2 metaphor: courier with a parcel, ledger at the desk
      out("#lb-false, #lb-norb, #lb-tok, #p-token-flow", ${f(LS[2] - 0.1)}, 0.2);
      KIT.fixed(tl, "tok", ${f(LS[2])});
      X7.tagHide(tl, "tg1", ${f(LS[2])});
      X7.eraseEntry(tl, "dk", ${f(LS[2] + 0.3)}, 0);
      KIT.cam(tl, ${f(LS[2] - 0.1)}, CAMS.met, 1.2);
      pop("#kw-meta", ${f(TM.meta)}, 0.3); pop("#lb-meta", ${f(TM.meta + 0.2)}, 0.3);
      pop("#lb-cr", ${f(TM.cour)}, 0.3);
      X7.slotFlash(tl, "dk", ${f(TM.book)}, 2);
      // ===== L3 trap ①: courier gone, no reply, ledger writes "delivered" anyway
      out("#kw-meta, #lb-cr, #lb-meta, #lb-vm", ${f(LS[3] - 0.1)}, 0.2);
      pop("#dz", ${f(TM.trap1 - 0.1)}, 0.3); trap(0, ${f(TM.trap1)});
      KIT.cam(tl, ${f(LS[3] - 0.2)}, CAMS.t1, 1.2);
      X6.carry(tl, "crw", ${f(LS[3])}, ${CRW1[0]}, ${CRW1[1]}, 0, 2.2, 0, "power1.in"); out("#crw", ${f(LS[3] + 1.8)}, 0.4);
      pop("#cardA", ${f(TM.noChk)}, 0.35); hot("ca0", ${f(TM.noChk + 0.3)}); pop("#ca0x", ${f(TM.noChk + 0.5)}, 0.25);
      fadeIn("#gport", ${f(TM.noReply - 0.2)}, 0.3); pop("#lb-noret", ${f(TM.noReply)}, 0.3);
      KIT.draw(tl, "cv-a0", ${f(TM.noReply + 0.2)}, 0.6);
      X7.entry(tl, "dk", ${f(TM.deem - 0.2)}, 1, 0.6); pop("#lb-ent", ${f(TM.deem)}, 0.3); KIT.led(tl, "dk-led", ${f(TM.deem)}, "red");
      // ===== L4 fix: catch the bool, revert when not ok
      out("#cv-a0, #lb-noret", ${f(LS[4] - 0.1)}, 0.2);
      cool("ca0", ${f(TM.catch4)}); hot("ca1", ${f(TM.catch4)}); tl.to("#ca1", { backgroundColor: "#dff5e8", duration: 0.2 }, ${f(TM.bool)});
      grow("ck1w", ${f(TM.catch4 - 0.1)}, 0.45);
      KIT.arm(tl, "ck1", ${f(TM.rb4 - 0.6)}, false, 0.01);
      X7.eraseEntry(tl, "dk", ${f(TM.rb4)}, 1); out("#lb-ent", ${f(TM.rb4)}, 0.2); KIT.led(tl, "dk-led", ${f(TM.rb4)}, "green");
      pop("#lb-ck1", ${f(TM.rb4 - 0.2)}, 0.3); pop("#ck1c-i", ${f(TM.rb4 + 0.2)}, 0.3);
      // ===== L5 trap ②: the target has no code — an empty lot
      out("#lb-ck1, #ck1c-i, #gport", ${f(LS[5] - 0.1)}, 0.2); out("#ck1w", ${f(LS[5])}, 0.3); cool("ca1", ${f(LS[5])});
      trap(1, ${f(TM.trap2)});
      KIT.cam(tl, ${f(LS[5] - 0.1)}, CAMS.t2, 1.3);
      tl.to("#bomb", { opacity: 0.18, duration: 0.4 }, ${f(LS[5])}); tl.to("#bomb", { opacity: 1, duration: 0.4 }, ${f(LS[9] - 0.2)});
      fadeIn("#cr2w", ${f(TM.trap2 + 0.3)}, 0.3); fadeIn("#pc2w", ${f(TM.waste - 0.6)}, 0.3);
      X7.lotPlate(tl, "lot", ${f(TM.nocode)}, true, 3); pop("#lb-lot", ${f(TM.nocode)}, 0.3);
      X7.lotGhost(tl, "lot", ${f(TM.waste)}, 1, 0.4);
      flow("p-lot", ${f(TM.waste)}, 1.2);
      // ===== L6 the courier says delivered — an empty lot never refuses
      out("#lb-lot", ${f(LS[6])}, 0.2);
      pop("#lb-dlv", ${f(TM.said - 0.1)}, 0.3);
      X7.tagPop(tl, "tg2", ${f(TM.said)}); pop("#lb-tg2", ${f(TM.said + 0.3)}, 0.3);
      X7.lose(tl, "pc2", ${f(TM.noRej)}, 0.8);
      // ===== L7 call to a no-code address: success, empty return data
      out("#lb-dlv", ${f(LS[7])}, 0.2);
      pop("#lb-low", ${f(TM.call7)}, 0.3);
      pop("#lb-data", ${f(TM.empty7 - 0.3)}, 0.3);
      // ===== L8 fix: check the code length before the call
      out("#lb-low, #cr2w", ${f(LS[8] - 0.1)}, 0.2);
      hot("ca2", ${f(TM.fix8)}); tl.to("#ca2", { backgroundColor: "#dff5e8", duration: 0.2 }, ${f(TM.gt0)});
      KIT.draw(tl, "cv-a2", ${f(TM.fix8 + 0.2)}, 0.6);
      grow("mg", ${f(TM.before8)}, 0.5); pop("#lb-cl0", ${f(TM.len8)}, 0.3);
      grow("ck2w", ${f(TM.len8 - 0.2)}, 0.45);
      out("#p-lot-flow", ${f(TM.gt0 - 0.3)}, 0.2);
      X7.tagHide(tl, "tg2", ${f(TM.gt0 - 0.3)}); out("#lb-tg2, #lb-data", ${f(TM.gt0 - 0.3)}, 0.2);
      pop("#lb-ck2", ${f(TM.gt0)}, 0.3); pop("#ck2c-i", ${f(TM.gt0 + 0.3)}, 0.3);
      // ===== L9 trap ③: return-data bomb — tape spews out of the other contract
      out("#cardA, #cv-a2, #lb-cl0, #lb-ck2, #ck2c-i, #mg, #ck2w", ${f(LS[9] - 0.1)}, 0.2);
      trap(2, ${f(TM.trap3)});
      KIT.cam(tl, ${f(LS[9] - 0.1)}, CAMS.t3, 1.3);
      tl.to("#gasm", { opacity: 0.18, duration: 0.4 }, ${f(LS[9])}); tl.to("#gasm", { opacity: 1, duration: 0.4 }, ${f(LS[11] - 0.1)});
      pop("#lb-bomb", ${f(TM.trap3 + 0.3)}, 0.3); grow("gvw", ${f(TM.trap3 + 0.2)}, 0.45); out("#g4", ${f(LS[9])}, 0.3); fadeIn("#g4", ${f(LS[11])}, 0.3);
      flow("p-bomb", ${f(TM.bomb9 - 0.4)}, 3.2);
      X3.spin(tl, "bomb", ${f(TM.bomb9)}, 4.5, 3, "none");
      X4.tape(tl, "tape", ${f(TM.huge - 0.4)}, 1, 2.6, "power1.in");
      pop("#lb-huge", ${f(TM.huge + 0.2)}, 0.3);
      pop("#lb-gv", ${f(TM.bomb9)}, 0.3);
      // ===== L10 copied into memory → gas burned; fix: cap the copy length
      X3.gauge(tl, "gv", ${f(TM.mem - 0.3)}, 0.0, ${f(TM.burn10 - TM.mem + 0.8)}, "power2.in");
      tl.set("#lb-gv", { opacity: 0 }, ${f(TM.mem)}); pop("#lb-mem", ${f(TM.mem)}, 0.3);
      grow("tcw", ${f(TM.fix10 - 0.2)}, 0.4);
      X7.tollBlade(tl, "tc", ${f(TM.lim - 0.2)}, true, 0.2);
      X4.tape(tl, "tape", ${f(TM.lim)}, 0.25, 0.6, "power2.out");
      out("#lb-mem, #lb-huge", ${f(TM.lim)}, 0.2);
      pop("#lb-cut", ${f(TM.lim + 0.1)}, 0.3);
      X3.gauge(tl, "gv", ${f(TM.lim + 0.2)}, 0.8, 0.8, "power2.out"); pop("#ck3c-i", ${f(TM.lim + 0.8)}, 0.3);
      // ===== L11 trap ④: out-of-gas failure
      out("#lb-cut, #ck3c-i, #lb-bomb, #p-bomb-flow", ${f(LS[11] - 0.1)}, 0.2);
      trap(3, ${f(TM.trap4)}); out("#gvw", ${f(LS[11])}, 0.3); fadeIn("#gvw", ${f(LS[15] + 0.2)}, 0.3);
      KIT.cam(tl, ${f(LS[11] - 0.15)}, CAMS.t4, 1.2);
      grow("fs", ${f(TM.trap4 + 0.3)}, 0.5);
      pop("#lb-g4", ${f(TM.trap4 + 0.6)}, 0.3);
      // ===== L12 the caller deliberately gives just-not-enough gas
      grow("a4", ${f(TM.give - 0.4)}, 0.45);
      X3.gauge(tl, "g4", ${f(TM.give)}, 0.1, 1.0, "power2.inOut");
      tl.set("#lb-g4", { opacity: 0 }, ${f(TM.few)}); pop("#lb-few", ${f(TM.few)}, 0.3);
      // ===== L13 inner call fails, outer frame carries on
      X3.tip(tl, "fs", 1, ${f(TM.inner + 0.2)}, { keep: true, deg: 70 });
      pop("#lb-fs1", ${f(TM.inner + 0.5)}, 0.3);
      pop("#lb-fs0", ${f(TM.outer)}, 0.3);
      pop("#lb-blind", ${f(TM.cont + 0.2)}, 0.3);
      // ===== L14 fix: check gasleft(); a failed critical call reverts everything
      out("#lb-blind, #lb-few", ${f(LS[14] - 0.1)}, 0.2);
      pop("#lb-gl", ${f(TM.gl - 0.1)}, 0.3);
      out("#lb-fs0", ${f(TM.all14 - 0.2)}, 0.2);
      X3.tip(tl, "fs", 0, ${f(TM.all14 - 0.1)}, { keep: true, deg: 70 });
      pop("#lb-all", ${f(TM.all14 + 0.2)}, 0.3); pop("#ck4c-i", ${f(TM.all14 + 0.5)}, 0.3);
      // ===== L15 where the metaphor breaks: a courier makes one kind of mistake at a time
      out("#dz", ${f(LS[15] - 0.1)}, 0.25);
      out("#lb-gl, #lb-all, #ck4c-i, #lb-fs1", ${f(LS[15] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[15] - 0.1)}, CAMS.met2, 1.3);
      X6.carry(tl, "crw", ${f(LS[15] - 0.1)}, 0, 0, 0, 0.01);
      fadeIn("#crw", ${f(LS[15] + 0.2)}, 0.3);
      pop("#kw-nometa", ${f(TM.nometa - 0.2)}, 0.3);
      pop("#lb-one", ${f(TM.one - 0.3)}, 0.3);
      // ===== L16 an external contract can lie, call back and burn gas at once
      out("#lb-one", ${f(LS[16])}, 0.2);
      grow("av", ${f(LS[16])}, 0.45); grow("arm", ${f(LS[16])}, 0.3);
      X7.tagPop(tl, "tgA", ${f(TM.lie - 0.2)}); X7.tagStamp(tl, "tgA", ${f(TM.lie + 0.3)}, "x"); pop("#lb-lie", ${f(TM.lie)}, 0.3);
      X4.callArm(tl, "arm", ${f(TM.cb - 0.1)}, 1, 0.5); pop("#lb-cb", ${f(TM.cb + 0.1)}, 0.3);
      X3.gauge(tl, "gv", ${f(TM.burn16 - 0.2)}, 0.0, 0.7, "power2.in"); pop("#lb-burn", ${f(TM.burn16)}, 0.3);
      pop("#lb-same", ${f(TM.burn16 + 0.5)}, 0.3);
      // ===== L17 back to Qubit: five root-cause steps (third-party analysis)
      out("#kw-nometa, #lb-lie, #lb-cb, #lb-burn, #lb-same, #lb-vm", ${f(LS[17] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[17] - 0.1)}, CAMS.q0, 1.8);
      pop("#lb-eth", ${f(TM.back + 0.8)}, 0.3); pop("#lb-bnb", ${f(TM.back + 1.0)}, 0.3); pop("#lb-be", ${f(TM.slow)}, 0.3);
      pop("#kw-q", ${f(TM.slow - 0.3)}, 0.3);
      pop("#cardB", ${f(TM.five - 0.4)}, 0.35);
      // ===== L18 step 1: ETH's token address is the zero address
      out("#kw-q, #lb-be", ${f(LS[18] - 0.1)}, 0.2); out("#lb-eth, #lb-bnb", ${f(TM.five - 0.5)}, 0.2);
      KIT.cam(tl, ${f(LS[18] - 0.1)}, CAMS.q1, 1.1);
      step(0, ${f(TM.s1)});
      grow("adoc", ${f(TM.s1 + 0.2)}, 0.45);
      pop("#lb-adoc", ${f(TM.addr)}, 0.3);
      X7.lotPlate(tl, "zl", ${f(TM.zero18)}, true, 3); pop("#lb-zl", ${f(TM.zero18 + 0.1)}, 0.3);
      // ===== L19 ETH deposits should go through depositETH, which checks the attached ETH
      out("#lb-adoc", ${f(LS[19] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[19] - 0.1)}, CAMS.q2, 1.1);
      grow("fp", ${f(LS[19] + 0.1)}, 0.45);
      X5.press(tl, "fp", 0, ${f(TM.dE)}); pop("#lb-dE", ${f(TM.dE + 0.1)}, 0.3);
      // ===== L20 step 2: the attacker calls plain deposit with ETH's resource ID
      out("#lb-dE", ${f(LS[20] - 0.1)}, 0.2);
      step(1, ${f(TM.s2)});
      grow("aqw", ${f(TM.atk20 - 0.3)}, 0.45);
      X5.press(tl, "fp", 1, ${f(TM.dep20 + 0.1)}); pop("#lb-d", ${f(TM.dep20)}, 0.3);
      pop("#lb-rid", ${f(TM.rid - 0.1)}, 0.3);
      // ===== L21 the whitelist check passes
      grow("wlw", ${f(LS[21] - 0.4)}, 0.4);
      KIT.arm(tl, "wl", ${f(TM.pass21 - 0.3)}, true, 0.6); pop("#lb-wl", ${f(TM.pass21)}, 0.3);
      // ===== L22 step 3: deposit calls safeTransferFrom on the zero address
      out("#lb-rid, #lb-d", ${f(LS[22] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[22] - 0.1)}, CAMS.q3, 1.1);
      step(2, ${f(TM.s3)});
      flow("bp", ${f(TM.zero22 - 0.2)}, 2.5);
      pop("#lb-stf", ${f(TM.stf - 0.1)}, 0.3);
      // ===== L23 step 4: no code → low-level call returns success, empty data
      out("#lb-stf", ${f(LS[23])}, 0.2);
      step(3, ${f(TM.s4)});
      X7.lotGhost(tl, "zl", ${f(TM.nc23)}, 1, 0.3); X7.lotGhost(tl, "zl", ${f(TM.nc23 + 0.6)}, 0.4, 0.4);
      X7.tagPop(tl, "tgB", ${f(TM.ok23 - 0.2)}); pop("#lb-tgB", ${f(TM.empty23 - 0.4)}, 0.3);
      // ===== L24 the old safe-transfer library treats empty as success
      out("#lb-tgB", ${f(LS[24])}, 0.2);
      grow("seal", ${f(LS[24])}, 0.4);
      pop("#lb-lib", ${f(TM.lib)}, 0.3);
      X7.tagStamp(tl, "tgB", ${f(TM.deem24)}, "ok");
      // ===== L25 for compatibility with USDT that returns nothing
      grow("mute", ${f(TM.compat - 0.2)}, 0.45); pop("#lb-mute", ${f(TM.usdt - 0.3)}, 0.3);
      // ===== L26 step 5: the bridge records an ETH deposit; BNB Chain mints lots of qXETH
      out("#cardB, #lb-lib, #lb-mute, #lb-zl", ${f(LS[26] - 0.1)}, 0.25);
      step(4, ${f(TM.s5)});
      KIT.cam(tl, ${f(LS[26] - 0.1)}, CAMS.q5, 1.4);
      grow("dk2", ${f(TM.rec26 - 0.4)}, 0.4);
      X7.entry(tl, "dk2", ${f(TM.rec26)}, 0, 0.6); pop("#lb-dk2", ${f(TM.rec26 + 0.3)}, 0.3);
      fadeIn("#ltw", ${f(TM.rec26 + 0.6)}, 0.2);
      X1.walk(tl, "lt", ${f(TM.rec26 + 0.8)}, ${f(TM.mint - TM.rec26 - 0.8)}, ${JSON.stringify(ltDeck)}, "power1.inOut");
      out("#ltw", ${f(TM.mint)}, 0.2);
      out("#lb-dk2", ${f(TM.bnb26 - 0.6)}, 0.2);
      KIT.cam(tl, ${f(TM.bnb26 - 0.4)}, CAMS.q5c, 1.2);
      X3.slot(tl, "bb", ${f(TM.mint - 0.2)}, true);
      grow("qx", ${f(TM.mint)}, 0.9); pop("#lb-qx", ${f(TM.qx)}, 0.3);
      // ===== L27 used as collateral, the attacker drains the lending pool
      
      KIT.cam(tl, ${f(LS[27] - 0.3)}, CAMS.q5b, 1.0);
      grow("pool", ${f(LS[27] - 0.3)}, 0.45); pop("#lb-pool", ${f(LS[27])}, 0.3); pop("#pdm", ${f(LS[27] + 0.1)}, 0.3);
      grow("af", ${f(TM.coll - 0.4)}, 0.4);
      out("#lb-qx", ${f(TM.coll)}, 0.2);
      X6.carry(tl, "qx", ${f(TM.coll)}, ${L.LEND_POOL.u - L.QX_PILE.u - 60}, ${L.LEND_POOL.v - L.QX_PILE.v + 140}, 0, 0.8, 0, "power2.inOut");
      for (let i = 0; i < ${PD}; i++) tl.to("#pd" + i, { opacity: 0.12, scale: 0.6, duration: 0.12 }, ${f(TM.drain)} + i * 0.05);
      tl.set("#lb-pool", { opacity: 0 }, ${f(TM.drain)}); pop("#lb-empty", ${f(TM.drain)}, 0.3);
      // ===== L28 each step looks reasonable on its own
      out("#lb-qx, #lb-empty, #pdm", ${f(LS[28] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[28] - 0.1)}, CAMS.q6, 1.2);
      pop("#cardB", ${f(LS[28] + 0.1)}, 0.3);
      for (let i = 0; i < 5; i++) pop("#cb" + i + "k", ${f(TM.each)} + i * 0.25, 0.2);
      // ===== L29 the bug is the combination: zero address + compatibility + missing native-coin check
      for (let i = 0; i < 5; i++) out("#cb" + i + "k", ${f(TM.combo - 0.2)}, 0.15);
      out("#lb-zl", ${f(TM.cz)}, 0.2); pop("#lb-pz", ${f(TM.cz)}, 0.3); pop("#lb-pc", ${f(TM.cc)}, 0.3); pop("#lb-pn", ${f(TM.cn)}, 0.3);
      tl.fromTo("#combo", { opacity: 0, strokeDashoffset: 400 }, { opacity: 1, strokeDashoffset: 0, duration: 0.9, ease: "power1.inOut", immediateRender: false }, ${f(TM.cn + 0.4)});
      tl.to("#cbF", { color: "#ffffff", backgroundColor: "#e0453a", duration: 0.25 }, ${f(TM.combo)});
      // ===== L30 the whitelist only says this ID is allowed
      out("#lb-pz, #lb-pc, #lb-pn, #combo, #cardB, #lb-wl", ${f(LS[30] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[30] - 0.1)}, CAMS.q7, 1.1);
      pop("#lb-wl1", ${f(TM.allow - 0.3)}, 0.3);
      // ===== L31 not what asset it stands for
      pop("#lb-wl2", ${f(TM.what - 0.3)}, 0.3);
      // ===== L32 today's SafeERC20 checks for code on an empty return
      out("#lb-wl1, #lb-wl2", ${f(LS[32] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[32] - 0.1)}, CAMS.q8, 1.2);
      out("#seal", ${f(TM.serc)}, 0.3);
      grow("mg2", ${f(TM.serc + 0.2)}, 0.5);
      X7.tagStamp(tl, "tgB", ${f(TM.emp32)}, null);
      pop("#lb-nocode", ${f(TM.chk32)}, 0.3); X7.tagStamp(tl, "tgB", ${f(TM.chk32 + 0.2)}, "x"); pop("#ck5c-i", ${f(TM.chk32 + 0.4)}, 0.3);
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
// ep03 contractMachine: nameplate rect can go negative-width → clamp to 0
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html.replace(/width="-[0-9.]+"/g, 'width="0"'));
console.log("wrote compositions/story.html", html.length, "bytes");
