// Generates compositions/story.html for ep04/seg4「④ CEI与锁」(one isometric world, one camera).
// Run: node src/build-story.mjs           (OVERVIEW=1 → a static overview camera for layout work)
import fs from "node:fs";
import { at, Wp, f, box, M, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, kitCss, runtimeJs, CE, BADGE, CHECK } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import * as LY from "../../seg1/src/layout.mjs";   // world layout fixed by seg1
import { groundArrow, lamp } from "./props.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const LN = T.lines.map((_, i) => lineAt(T, i));
const w = (term, line, opt = {}) => wordAt(T, term, { line, ...opt }).start;
const we = (term, line, opt = {}) => wordAt(T, term, { line, ...opt }).end;

// ------------------------------------------------------------------ world layout (u, v) — see SPEC.md
const V = { u: -3400, v: -500 };                             // compiler station origin (far left)
const rel = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });
const P = {
  bank: LY.BANK, desk: LY.DESK, ledger: LY.LEDGER, counter: LY.COUNTER,
  atk: LY.ATK, arm: LY.ARM, pile: LY.PILE,
  safe: LY.LEND_SAFE, oracle: LY.ORACLE, dex: LY.DEX,
  B: { u: 900, v: -60 },                                  // another contract that must share the lock (L7, L15)
  boards: [{ u: -420, v: 760 }, { u: 100, v: 760 }, { u: 620, v: 760 }], // C / E / I boards (L1)
  posts: [{ u: -560, v: -280 }, { u: 100, v: -520 }, { u: -600, v: 200 }, { u: 340, v: 270 }],
  gauge: { u: 260, v: 140 },
  chains: [{ u: 560, v: 160 }, { u: 860, v: 160 }, { u: 1160, v: 160 }],
  locker: { u: 400, v: 540 },
  lamp: rel(LY.DEX, 120, 40),
  bal: { u: 1100, v: 300 },
  vuln: { u: -1000, v: 1600 }, fixd: { u: -660, v: 1600 },
  // compiler station (far left), relative to V
  vy: V, src: rel(V, -330, 0), card: rel(V, -330, 380), tapeLen: 260,
  pool: rel(V, 560, 120), cab: rel(V, 1000, 160), atk2: rel(V, 600, 500), arm2: rel(V, 740, 520),
};

const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const A_ = {};
const mk = (key, fn, o, opts, dy = 0) => { const r = fn(o, opts); A_[key] = r.anchors; add(o, r.svg, dy); return r; };

// --- main zone (built exactly like seg1)
const bank = mk("bank", E1.vending, P.bank, { id: "bk", sign: "BANK", maintDoor: true });
{ // ledger desk: pedestal + wood top + ledgerBook + rollCounter ×1.6 (seg1 layout)
  const DT = LY.DESK_TOP;
  let s = box(P.desk, -80, 80, -100, 100, 0, DT - 8, M.white, 1.6) + box(P.desk, -88, 88, -108, 108, DT - 8, DT, M.wood, 1.4);
  s += E2.liftSvg(O.ledgerBook(P.ledger, { id: "ldg", scale: 0.55 }).svg, DT);
  const rc = E2.rollCounter(P.counter, { id: "ctr", digits: 1, value: 1, z: DT });
  const [cx0, cy0] = at(P.counter, 0, 0, DT), ck = LY.COUNTER_SCALE ?? 1.6;
  s += `<g transform="translate(${f(cx0)},${f(cy0)}) scale(${ck}) translate(${f(-cx0)},${f(-cy0)})">${rc.svg}</g>`;
  const cT = (q) => [cx0 + (q[0] - cx0) * ck, cy0 + (q[1] - cy0) * ck];
  A_.ctr = { top: cT(rc.anchors.top), window: cT(rc.anchors.window) };
  A_.desk = { top: at(P.desk, 0, 0, DT + 40), ledger: at(P.ledger, 0, 0, DT + 20) };
  add(P.desk, `<g id="desk">${s}</g>`);
}
// call stack on the Bank's roof, scaled 0.8 about its roof point
const ST = LY.STACK;
const fsRaw = E3.frameStack(ST, { id: "fs", n: ST.n, labels: ["#1", "#2", "#3"], filled: 0 });
const gO = at(ST), rO = Wp(ST.u, ST.v, ST.z);
const sm = (p) => [rO[0] + ST.scale * (p[0] - gO[0]), rO[1] + ST.scale * (p[1] - gO[1])];
add(P.bank, `<g transform="translate(${f(rO[0])},${f(rO[1])}) scale(${ST.scale}) translate(${f(-gO[0])},${f(-gO[1])})">${fsRaw.svg}</g>`, 0.5);
A_.fs = { top: sm(fsRaw.anchors.top), trays: fsRaw.anchors.trays.map(sm), tabs: fsRaw.anchors.tabs.map(sm) };

const atk = mk("atk", E1.miniVend, P.atk, { id: "atk", kind: "attacker" }, 0.2);
const arm = mk("arm", X.callbackArm, P.arm, { id: "cb", target: bank.anchors.buttons[0], coin: false });
// hasps on the Bank: 0 withdraw, 1 transfer, 2 deposit (all start open) + transient twin on 0
const hb = (i, opts) => { const b = X.vendButton(P.bank, i); return mk("h" + opts.id, X.hasp, b.o, { ...opts, z: b.z, scale: b.scale }); };
const h0 = hb(0, { id: "h0", locked: false, shared: true });
const h0t = hb(0, { id: "h0t", locked: true, transient: true, plate: false });
const h1 = hb(1, { id: "h1", locked: false, shared: true });
const h2 = hb(2, { id: "h2", locked: false, shared: true });
// another contract B with its own hasp
const mB = mk("B", E1.miniVend, P.B, { id: "mB", kind: "plain" });
const bB = X.miniButton(P.B, 0); const hB = mk("hB", X.hasp, bB.o, { id: "hB", z: bB.z, scale: bB.scale, locked: false, shared: true });
// magnifier over the ledger (L7 ②: a third party reads state through a view function)
const mag = O.magnifier(rel(P.desk, 30, 40), { id: "mag", z: 230 }); A_.mag = mag.anchors; add(rel(P.desk, 30, 40), mag.svg, 2);
// third-party protocols (seg1 layout)
mk("safe", O.safe, P.safe, { id: "lsafe", plate: "LOAN" });
mk("oracle", E1.miniVend, P.oracle, { id: "orc", kind: "oracle", needle: -20 });
mk("dex", E1.miniVend, P.dex, { id: "dex", kind: "dex" });
{ const p1 = E1.pipe(P.dex, { id: "p1", pts: [[55, 0, 70], [280, 0, 70], [280, -205, 70]] }); add({ u: P.oracle.u, v: P.oracle.v + 46 }, p1.svg, 1);
  const p2 = E1.pipe(P.oracle, { id: "p2", pts: [[-55, 0, 70], [-90, 0, 70], [-90, -260, 70]] }); add({ u: P.oracle.u - 90, v: P.oracle.v }, p2.svg, -1); }
mk("lamp", lamp, P.lamp, { id: "lmp" });
// C / E / I boards (L1)
const BT = [["Checks", "检查"], ["Effects", "修改状态"], ["Interactions", "外部交互"]];
BT.forEach(([t, s], i) => mk("bd" + i, E1.signBoard, P.boards[i], { id: "bd" + i, text: t, sub: s, size: 54 }));
// defence-in-depth posts (L13)
P.posts.forEach((p, i) => mk("pt" + i, E1.signBoard, p, { id: "pt" + i, style: "plate", text: String(i + 1), size: 48, w: 84 }));
mk("gauge", E3.gasGauge, P.gauge, { id: "gg", value: 1 });
P.chains.forEach((p, i) => mk("ch" + i, O.chain, p, { id: "ch" + i, n: 2 }));
const lk = mk("lk", X.pickupLocker, P.locker, { id: "lk", amounts: { 5: "1 ETH" }, blank: true });
const userO = { u: P.locker.u - 60, v: P.locker.v + 260 };
mk("usr", O.person, userO, { id: "usr", role: "engineer" });
mk("bal", E1.balance, P.bal, { id: "bal", tilt: 6 });
mk("vuln", E1.vending, P.vuln, { id: "vu", sign: "BANK", scale: 0.8 });
mk("fixd", E1.vending, P.fixd, { id: "fx", sign: "BANK", scale: 0.8 });
// --- compiler station
mk("vy", E3.contractMachine, P.vy, { id: "vy", name: "Vyper" });
const mo = X.machineOut(P.vy);
mk("tape", X.punchCard, mo.o, { id: "tp", z: mo.z, s: 0, len: P.tapeLen, red: [9, 10, 11], redShown: false });
mk("cab", E3.slotCabinet, P.cab, { id: "cab", n: 2, title: "Storage", labels: ["0", "1"] });
mk("src", O.doc, P.src, { id: "srcd", title: "源码", standing: true, lines: ["@nonreentrant", "def withdraw():", "    ...", "def remove():"] });
mk("card", X.punchCard, P.card, { id: "pc", kind: "card", red: [6, 7, 8] });
const pool = mk("pool", E1.vending, P.pool, { id: "pl", sign: "POOL" });
const hp0 = (() => { const b = X.vendButton(P.pool, 0); return mk("hp0", X.hasp, b.o, { id: "hp0", z: b.z, scale: b.scale, locked: true }); })();
const hp1 = (() => { const b = X.vendButton(P.pool, 3); return mk("hp1", X.hasp, b.o, { id: "hp1", z: b.z, scale: b.scale, locked: true }); })();
mk("atk2", E1.miniVend, P.atk2, { id: "atk2", kind: "attacker" }, 0.2);
mk("arm2", X.callbackArm, P.arm2, { id: "cb2", target: pool.anchors.buttons[0], coin: false });

items.sort((a, b) => a.y - b.y);
// chains drawn last (span machines)
const chSh = X.haspChain("sh", [h0.anchors.eye, hB.anchors.eye], { shown: false });
const chAll = X.haspChain("sa", [h2.anchors.eye, h1.anchors.eye, h0.anchors.eye], { shown: false, sag: 4 });
// lock slot curves (L22): pool function A / B lock → drawer 0 / 1 (world space)
const cvA = dashCurve("cva", hp0.anchors.lock, A_.cab.drawers[0], { c1: [hp0.anchors.lock[0] + 160, hp0.anchors.lock[1] - 40], c2: [A_.cab.drawers[0][0] - 160, A_.cab.drawers[0][1] + 60] });
const cvB = dashCurve("cvb", hp1.anchors.lock, A_.cab.drawers[1], { c1: [hp1.anchors.lock[0] + 120, hp1.anchors.lock[1] - 140], c2: [A_.cab.drawers[1][0] - 180, A_.cab.drawers[1][1] - 20] });
// ground arrows between the boards
const arrows = groundArrow("ga0", { u: P.boards[0].u + 90, v: P.boards[0].v + 150 }, { u: P.boards[1].u - 90, v: P.boards[1].v + 150 }, { w: 30, head: 64 })
  + groundArrow("ga1", { u: P.boards[1].u + 90, v: P.boards[1].v + 150 }, { u: P.boards[2].u - 90, v: P.boards[2].v + 150 }, { w: 30, head: 64 });
// letters (L17 invariant fuzz, L18 PoC)
const lt = (id, o, red) => E1.letter(o, { id, z: 0, lift: 30, state: red ? "attacker" : "normal" }).svg;
const L0o = { u: P.bal.u - 420, v: P.bal.v + 120 };
const pocO = { u: P.vuln.u - 300, v: P.vuln.v + 160 };
const letters = [0, 1, 2, 3, 4].map((i) => lt("fz" + i, L0o)).join("") + lt("poc", pocO, true) + lt("poc2", pocO, true);
const world = worldSvg("wsvg", gridSvg({ u0: -3000, u1: 3000, v0: -1600, v1: 2000 }) + arrows +
  items.map((x) => x.svg).join("\n") + chSh.svg + chAll.svg + cvA.svg + cvB.svg + letters, [-3000, -1500, 6400, 3200]);

// ------------------------------------------------------------------ labels
const SEC = SCRIPT.sections;
let labels = "";
const lab = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, (cls + " hide").trim(), a); };
const off = (p, dx, dy) => [p[0] + dx, p[1] + dy];
const bt = bank.anchors.buttons;
lab("lb-bank", bank.anchors.top, "Bank 合约", "");
lab("lb-atk", A_.atk.top, "攻击合约", "lab-rs lab-sm");
lab("lb-ctr", off(A_.ctr.top, 0, -10), "攻击者余额", "lab-sm");
lab("lb-t1", off(A_.fs.tabs[0], -30, 10), "withdraw #1", "lab-sm", "r");
lab("lb-t2", off(A_.fs.tabs[1], -30, -8), "withdraw #2", "lab-sm", "r");
lab("lb-read0", off(A_.fs.trays[1], 90, -6), "读到余额 0", "lab-ink lab-sm", "l");
lab("lb-revert", off(A_.fs.trays[1], 90, 46), "require 回滚", "lab-rs lab-sm", "l");
lab("lb-one", off(A_.arm.pan, 0, -50), "只出 1 枚", "lab-gs lab-sm");
lab("lb-eq", off(at(P.desk, 0, 108, 0), -20, 24), "账本一致 · 余额 0 · 付出 1 枚", "lab-gs", "t");
// button names (close-up)
lab("lb-b0", off(bt[0], 60, -22), "withdraw", "lab-sm", "l");
lab("lb-b1", off(bt[1], 60, 6), "transfer", "lab-sm", "l");
lab("lb-b2", off(bt[2], 60, 34), "deposit", "lab-sm", "l");
lab("lb-lock", off(h0.anchors.lock, -70, 30), "nonReentrant", "lab-gs lab-sm", "r");
lab("lb-blocked", off(h0.anchors.lock, -70, 30), "再次进入 → 回滚", "lab-gs lab-sm", "r");
lab("lb-b1x", off(bt[1], 60, 6), "transfer · 没加锁", "lab-rs lab-sm", "l");
lab("lb-B", A_.B.top, "合约 B", "lab-sm");
lab("lb-dex", A_.dex.top, "池子 · view 函数", "lab-sm");
lab("lb-mag", off(A_.mag.top, -60, 30), "第三方读 view · 锁拦不住", "lab-r lab-sm", "r");
lab("lb-shared", off(A_.B.top, 0, -56), "同一把锁", "lab-gs lab-sm");
lab("lb-tr", off(h0t.anchors.lock, -80, 40), "瞬态存储锁", "lab-cs lab-sm", "r");
lab("lb-tr2", off(h0t.anchors.lock, -80, 92), "0.8.24+", "lab-g", "r");
lab("lb-gas", A_.gauge.top, "gas 更低", "lab-gs lab-sm");
lab("lb-c0", A_.ch0.top, "链 A ✓", "lab-gs lab-sm");
lab("lb-c1", A_.ch1.top, "链 B ✓", "lab-gs lab-sm");
lab("lb-c2", A_.ch2.top, "链 C ？", "lab-g", "b");
lab("lb-1153", off(A_.ch1.ground, 0, 140), "目标链必须支持 EIP-1153 · 部署前确认", "lab-cs", "t");
lab("lb-lk", off(A_.lk.top, 140, 0), "取件柜 · 拉取式支付", "");
lab("lb-ledger", off(lk.anchors.cells[6], 30, -60), "只记账", "lab-cs lab-sm", "l");
lab("lb-push", off(bank.anchors.tray, -20, 40), "不主动推送", "lab-g", "t");
lab("lb-usr", off(A_.usr.top, -40, 40), "收款人", "lab-sm", "r");
lab("lb-step", off(A_.usr.top, -40, 100), "多走一步", "lab-g", "r");
lab("lb-p0", off(A_.pt0.top, 0, 0), "CEI 默认", "lab-cs lab-sm");
lab("lb-p1", off(A_.pt1.top, 0, 0), "同一把锁", "lab-cs lab-sm");
lab("lb-p2", off(A_.pt2.top, 0, 0), "view 不给中间价", "lab-cs lab-sm");
lab("lb-p3", off(A_.pt3.top, 0, 0), "不变量测试", "lab-cs lab-sm");
lab("lb-view", off(A_.dex.top, 0, -56), "中间状态价格", "lab-rs lab-sm");
lab("lb-lamp", A_.lamp.top, "锁状态可查", "lab-gs lab-sm");
lab("lb-panL", A_.bal.panL, "合约余额", "lab-sm");
lab("lb-panR", A_.bal.panR, "用户余额之和", "lab-sm");
lab("lb-ge", A_.bal.top, "合约余额 ≥ 用户余额之和", "lab-gs");
lab("lb-vu", A_.vuln.top, "漏洞版", "lab-r");
lab("lb-fx", A_.fixd.top, "修复版", "");
lab("lb-poc", off(at(pocO, 0, 0, 90), 0, 0), "同一个攻击测试", "lab-rs lab-sm");
lab("lb-drain", off(A_.vuln.top, 0, -56), "资金被提走", "lab-rs lab-sm");
lab("lb-rb", off(A_.fixd.top, 0, -56), "回滚 ✓", "lab-gs lab-sm");
lab("lb-weak", off(A_.fixd.center, 0, 0), "证据不足", "lab-g stamp", "c");
lab("lb-vy", A_.vy.top, "Vyper 编译器", "");
lab("lb-ver", off(A_.vy.top, 0, -58), "0.2.15 · 0.2.16 · 0.3.0", "lab-ink mono");
lab("lb-src", off(A_.src.top, 70, 0), "源码 @nonreentrant", "lab-gs lab-sm", "r");
lab("lb-fa", off(pool.anchors.buttons[0], -40, -8), "函数 A", "lab-sm", "r");
lab("lb-fb", off(pool.anchors.buttons[3], -40, 8), "函数 B", "lab-sm", "r");
lab("lb-s0", off(A_.cab.drawers[0], 150, 10), "锁槽 0", "lab-ink lab-sm", "l");
lab("lb-s1", off(A_.cab.drawers[1], 150, -10), "锁槽 1", "lab-ink lab-sm", "l");
lab("lb-slot", A_.cab.top, "锁槽不一致", "lab-rs");
lab("lb-pool", A_.pool.top, "原生 ETH 池", "");
lab("lb-xf", off(A_.pool.top, 0, -58), "跨函数重入", "lab-rs lab-sm");
lab("lb-card", A_.card.top, "字节码", "lab-r lab-sm");
lab("lb-audit", off(A_.card.ground, 0, 40), "审计范围含编译器版本", "lab-cs", "t");
labels += wpin("ck-src", off(A_.src.center, 0, 0), CHECK("ck-src-b", 64, "hide"), "c");
labels += wpin("x-card", off(A_.card.center, 0, 0), BADGE("x-card-b", 70, "hide"), "c");
labels += wpin("x-t2", off(A_.fs.trays[1], 0, 0), BADGE("x-t2-b", 56, "hide"), "c");
labels += wpin("ck-bank", off(bank.anchors.top, 120, 40), CHECK("ck-bank-b", 52, "hide"), "c");

// ------------------------------------------------------------------ cameras  (C(point, k, sx, sy))
const C = (p, k, sx = 960, sy = 540) => camAt(p, sx, sy, k);
const bk = (du, dv, z = 0) => at(P.bank, du, dv, z);
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const vW = (du, dv, z = 0) => at(P.vy, du, dv, z);
const vOff = (dx, dy) => { const o = at(P.vy); return [o[0] + dx, o[1] + dy]; };
const CAMS = {
  open: C(bk(-40, 120, 150), 0.8, 960, 560),
  l0: C(bk(-100, 100, 150), 0.95, 1250, 600),
  cei: C(at(P.boards[1], 0, 0, 100), 0.85, 1250, 640),
  code: C(bk(0, 0, 0), 0.95, 1500, 620),
  panel: C(bt[0], 2.3, 900, 560),
  bounds: C(bk(150, -60, 150), 0.85, 1200, 600),
  trans: C(mid(bt[0], A_.ch1.center), 1.0, 1100, 500),
  locker: C(mid(bk(0, 200, 160), at(P.locker, 0, 120, 100)), 0.9, 1000, 500),
  long: C(bk(80, 100, 150), 0.7, 1420, 520),
  posts: C([-93, -60], 0.8, 1300, 560),
  chain: C(bt[1], 1.3, 1000, 600),
  pool: C(at({ u: 1950, v: 150 }, 0, 0, 100), 1.0, 1300, 600),
  bal: C(at(P.bal, 0, 0, 160), 1.05, 1300, 480),
  test: C(at({ u: (P.vuln.u + P.fixd.u) / 2, v: P.vuln.v }, 0, 0, 100), 1.2, 1000, 600),
  src: C(vOff(-120, -40), 1.25, 980, 600),
  comp: C(vOff(420, -120), 0.95, 1000, 600),
  attack: C(vOff(600, -60), 1.15, 1150, 680),
  end: C(vOff(-60, 60), 1.1, 900, 600),
};
if (process.env.OVERVIEW) for (const k in CAMS) CAMS[k] = C(bk(0, 200, 0), 0.4, 960, 540);

// dashed curve: CEI card "balances = 0" row → the ledger counter (screen space, code camera)
const card = { x: 46, y: 132, w: 1046 };
const rowY = (slot) => card.y + 24 + 56 + slot * 50 + 25;
const scr = (p) => toScreen(CAMS.code, p);
const ctrS = scr(off(A_.ctr.top, 0, 70));
const cvZero = dashCurve("cvz", [card.x + card.w + 4, rowY(3) + 4], ctrS, { c1: [card.x + card.w + 90, rowY(3) + 40], c2: [ctrS[0] - 80, ctrS[1] + 90] });

// ------------------------------------------------------------------ times
const TM = {
  how: w("怎么防", 0), cei0: w("CEI", 0),
  three: w("三个词", 1), chk: w("检查", 1), eff: w("修改状态", 1), itx: w("外部交互", 1), ord: w("顺序", 1),
  one: w("只改一处", 2), zero: w("清零", 2), move: w("挪到", 2), bef: w("转账之前", 2),
  reent: w("重入进来", 3), bal3: w("余额", 3), z3: w("0", 3), req: w("require", 3), rb3: w("回滚", 3),
  ctl: w("交出控制权", 4), last: w("最后", 4), ledg: w("账本", 4), cons: w("一致", 4),
  second: w("第二道防线", 5), lock5: w("重入锁", 5),
  during: w("执行期间", 6), again: w("再次进入", 6), locked6: w("加锁的函数", 6), rb6: w("回滚", 6),
  edge: w("边界", 7), only: w("只保护", 7), ro: w("只读重入", 7), xc: w("跨合约", 7), same7: w("同一把锁", 7),
  v824: w("0.8.24", 8), tst: w("瞬态存储", 8), gas: w("gas", 8), low: w("更低", 8),
  tgt: w("目标链", 9), eip: w("EIP-1153", 9), dep: w("部署前", 9),
  pull: w("拉取式支付", 10), rec: w("只记账", 10), self: w("自己来取", 10),
  nopush: w("不主动推送", 11), cost: w("代价", 11), step: w("多走一步", 11),
  lim: w("局限", 12), cplx: w("复杂函数", 12), allx: w("所有交互", 12),
  did: w("纵深防御", 13), four: w("四条", 13),
  r1: w("CEI", 14), dflt: w("默认写法", 14),
  shared: w("共享状态", 15), entry: w("外部入口", 15), same15: w("同一把锁", 15),
  view: w("view", 16), midst: w("中间状态", 16), price: w("关键价格", 16), must: w("必须给出", 16), lq: w("锁状态查询", 16),
  inv: w("不变量测试", 17), seq: w("调用序列", 17), cbal: w("合约余额", 17), ubal: w("用户余额之和", 17),
  verify: w("代码验证", 18), poc: w("攻击测试", 18), vu: w("漏洞版", 18), drain: w("提走资金", 18), fx: w("修复版", 18), rb18: w("回滚", 18),
  only19: w("只跑通", 19), cant: w("无法证明", 19), cover: w("覆盖", 19),
  right: w("锁写对了", 20), noeff: w("不一定生效", 20),
  y23: w("2023", 21), curve: w("Curve", 21), pools: w("一些池子", 21), src: w("源码", 21), lock21: w("重入锁", 21),
  vy: w("Vyper", 22), vers: w("三个版本", 22), bad: w("锁不正确", 22), difff: w("不同函数", 22), slot: w("锁槽", 22),
  nat: w("原生", 23), xfn: w("跨函数重入", 23),
  multi: w("多方公开复盘", 24), m70: w("7000", 24),
  srcok: w("源码正确", 25), bcok: w("字节码正确", 25), aud: w("审计范围", 25), cver: w("编译器版本", 25),
};
const JT = JSON.stringify;

// long-function card rows (L12): grey bars, three external calls scattered
const longRows = [[0.62, 0], [0.48, 0], [0.7, 1], [0.4, 0], [0.55, 0], [0.66, 1], [0.5, 0], [0.38, 0], [0.6, 1], [0.44, 0]]
  .map(([wd, x], i) => `<div class="lrow" id="lr${i}"><span class="lbar" style="width:${Math.round(wd * 640)}px"></span>${x ? `<span class="ldot"></span><span class="lcall">call</span>` : ""}</div>`).join("");

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 88px; }
    .mono { font-family: "JetBrains Mono", monospace; }
    .stamp { transform: rotate(-12deg); border-width: 4px; font-size: 34px; color: #6d685e; }
    .scr { position: absolute; left: 0; top: 0; overflow: visible; }
    .card { position: absolute; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    /* big keyword */
    #kw-cei { left: 70px; top: 130px; padding: 18px 44px 26px; }
    #kw-cei .big { font-size: 120px; font-weight: 900; line-height: 1; letter-spacing: 0.04em; }
    #kw-cei .sub { margin-top: 10px; font-size: 34px; font-weight: 800; color: #1d93ba; white-space: nowrap; }
    /* CEI code card */
    #code { left: ${card.x}px; top: ${card.y}px; width: ${card.w}px; height: ${24 + 56 + 7 * 50 + 26}px; padding: 24px 34px; }
    #code .c-head { position: relative; }
    #code .row { position: absolute; left: 98px; height: 50px; line-height: 50px; font-family: "JetBrains Mono", monospace; font-size: 30px; font-weight: 500; white-space: pre; border-radius: 10px; padding: 0 10px; margin-left: -10px; }
    #code .gut { position: absolute; left: 30px; width: 48px; border-radius: 10px; color: #fff; font-family: "JetBrains Mono", monospace; font-weight: 800; font-size: 30px; display: flex; align-items: center; justify-content: center; }
    #code .g-red { background: #e0453a; height: 44px; border-radius: 50%; width: 44px; left: 32px; }
    #code .g-c { background: #1d93ba; }
    #code .tagsw { position: relative; display: inline-block; margin-left: auto; height: 40px; width: 210px; }
    #code .tagsw .c-tag { position: absolute; right: 0; top: 0; }
    /* lock card E */
    #codeE { left: 46px; top: 132px; width: 1100px; padding: 22px 34px; }
    #codeE .c-row b { color: #1f9d55; }
    /* bounds card */
    #bnd { left: 46px; top: 132px; width: 760px; padding: 24px 34px 18px; }
    #bnd .bt, #def .bt { font-size: 36px; font-weight: 900; margin-bottom: 10px; white-space: nowrap; }
    #bnd .br, #def .br { display: flex; align-items: center; gap: 16px; font-size: 32px; font-weight: 800; white-space: nowrap; height: 58px; }
    .num { flex: none; width: 46px; height: 46px; border-radius: 50%; background: #1c1c1c; color: #fff; font-size: 28px; display: flex; align-items: center; justify-content: center; }
    #def { left: 46px; top: 132px; width: 660px; padding: 24px 34px 18px; }
    #def .br small { font-size: 28px; font-weight: 700; color: #6d685e; }
    /* long function card */
    #long { left: 60px; top: 120px; width: 900px; padding: 22px 34px 20px; }
    #long .c-head { font-size: 34px; font-weight: 900; height: 56px; display: flex; align-items: center; }
    #long .lrow { height: 46px; display: flex; align-items: center; gap: 14px; padding-left: 40px; }
    #long .lbar { height: 16px; border-radius: 8px; background: #d9d3c7; }
    #long .ldot { width: 26px; height: 26px; border-radius: 50%; background: #e0453a; flex: none; }
    #long .lcall { font-family: "JetBrains Mono", monospace; font-size: 30px; font-weight: 800; color: #c3352b; }
    #long .lnote { margin-top: 12px; font-size: 32px; font-weight: 800; color: #c3352b; white-space: nowrap; }
    /* keywords */
    .kwb { position: absolute; white-space: nowrap; font-weight: 900; }
    #kw-ver { left: 60px; top: 130px; font-size: 54px; padding: 14px 36px 20px; }
    #kw-ver b { color: #1f9d55; } #kw-ver i { font-style: normal; color: #c3352b; }
    #evt { left: 60px; top: 130px; padding: 20px 36px 22px; }
    #evt .e1 { font-size: 46px; font-weight: 900; white-space: nowrap; }
    #evt .e2 { margin-top: 8px; font-size: 40px; font-weight: 900; color: #c3352b; white-space: nowrap; display: flex; align-items: center; gap: 16px; }
    #kw-neq { left: 60px; top: 130px; font-size: 66px; padding: 14px 40px 22px; }
    #kw-neq b { color: #1f9d55; } #kw-neq i { font-style: normal; color: #c3352b; } #kw-neq em { font-style: normal; color: #1c1c1c; margin: 0 18px; }
    .tcard { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
      padding: 14px 26px 18px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); z-index: 5; }
    .tcard .t1 { font-size: 32px; font-weight: 900; white-space: nowrap; }
    .tcard .t2 { margin-top: 6px; font-size: 29px; font-weight: 700; color: #3d3a35; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <svg class="scr" width="1920" height="1080" viewBox="0 0 1920 1080">${cvZero.svg}</svg>
      <div class="card hide" id="kw-cei"><div class="big">CEI</div><div class="sub">Checks · Effects · Interactions</div></div>
      <div class="k-code card hide" id="code">
        <div class="c-head">取款函数 withdraw<span class="tagsw"><span class="c-tag" id="tagA">漏洞版</span><span class="c-tag" id="tagD" style="opacity:0;background:#e2f3e9;color:#17804a">CEI 修复版</span></span></div>
        <div class="gut g-red" id="g1" style="top:${80 + 2 * 50 + 3}px">①</div>
        <div class="gut g-red" id="g2" style="top:${80 + 4 * 50 + 3}px">②</div>
        <div class="gut g-c" id="gC" style="top:${80 + 1 * 50 + 4}px;height:92px;opacity:0">C</div>
        <div class="gut g-c" id="gE" style="top:${80 + 3 * 50 + 4}px;height:42px;opacity:0;background:#1f9d55">E</div>
        <div class="gut g-c" id="gI" style="top:${80 + 4 * 50 + 4}px;height:42px;opacity:0">I</div>
        <div class="row" id="r-fn" style="top:80px">function withdraw() external {</div>
        <div class="row" id="r-amt" style="top:130px">    uint256 amt = balances[msg.sender];</div>
        <div class="row" id="r-req" style="top:180px;opacity:0">    require(amt > 0);</div>
        <div class="row" id="r-call" style="top:180px">    (bool ok,) = msg.sender.call{value: amt}("");</div>
        <div class="row" id="r-ok" style="top:230px">    require(ok);</div>
        <div class="row" id="r-zero" style="top:280px">    balances[msg.sender] = 0;</div>
        <div class="row" id="r-end" style="top:330px">}</div>
      </div>
      <div class="k-code card hide" id="codeE">
        <div class="c-head">重入锁<span class="c-tag">第二道防线</span></div>
        <div class="c-row">function withdraw() external <b>nonReentrant</b> { ... }</div>
        <div class="c-row c-cm" id="e2">// 0.8.24+：瞬态存储版本（EIP-1153）</div>
      </div>
      <div class="card hide" id="bnd">
        <div class="bt">锁的三个边界</div>
        <div class="br hide" id="bn1"><span class="num">1</span>只保护加了锁的函数</div>
        <div class="br hide" id="bn2"><span class="num">2</span>不防只读重入</div>
        <div class="br hide" id="bn3"><span class="num">3</span>跨合约要共享同一把锁</div>
      </div>
      <div class="card hide" id="long">
        <div class="c-head">复杂函数</div>
        ${longRows}
        <div class="lnote hide" id="lnote">交互散在中间 · 难以全部放最后</div>
      </div>
      <div class="card hide" id="def">
        <div class="bt">纵深防御 · 四条</div>
        <div class="br hide" id="df1"><span class="num">1</span>CEI 当默认写法</div>
        <div class="br hide" id="df2"><span class="num">2</span>共享状态入口 · 同一把锁</div>
        <div class="br hide" id="df3"><span class="num">3</span>view 不给中间价</div>
        <div class="br hide" id="df4"><span class="num">4</span>不变量测试</div>
      </div>
      <div class="card kwb hide" id="kw-ver"><i>修复前失败</i> · <b>修复后通过</b></div>
      <div class="card hide" id="evt"><div class="e1">2023 年 7 月 · Curve 的一些池子</div><div class="e2 hide" id="evt2">约 7000 万美元<span class="lab lab-g" style="font-size:28px">多方公开复盘 · 第三方分析</span></div></div>
      <div class="tcard hide" id="tc1" style="top:352px"><div class="t1">瞬态存储</div><div class="t2">只在一笔交易内有效的存储</div></div>
      <div class="tcard hide" id="tc2" style="top:740px"><div class="t1">字节码</div><div class="t2">编译后在链上实际执行的代码</div></div>
      <div class="card kwb hide" id="kw-neq"><b>源码正确</b><em>≠</em><i>字节码正确</i></div>
      ${pills(4, { sections: SEC })}
      <div class="k-title" id="ttl-card"><div class="t-main">④ CEI与锁</div><div class="t-sub">先把顺序写对 · 再用锁兜底</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E2.runtimeExtJs()}
${E3.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JT(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const term = (id, t0, t1) => { KIT.pop(tl, "#" + id, t0, 0.3); tl.to("#" + id, { opacity: 0, duration: 0.25, ease: "power2.in" }, t1); };
      const so = (id) => { const g = $(id); return g.getAttribute("data-ox") + " " + g.getAttribute("data-oy"); };
      const hidden = new Set();
      const grow = (id, t, d) => { if (!hidden.has(id)) { hidden.add(id); tl.set("#" + id, { scaleY: 0, svgOrigin: so(id) }, 0); } KIT.grow(tl, id, t, d); };
      const shrink = (id, t) => tl.to("#" + id, { scaleY: 0, svgOrigin: so(id), duration: 0.3, ease: "power2.in" }, t);
      const lateIds = ["bd0","bd1","bd2","pt0","pt1","pt2","pt3","gg","ch0","ch1","ch2","lk","usr","bal","vu","fx","lmp"];
      lateIds.forEach((id) => { hidden.add(id); tl.set("#" + id, { scaleY: 0, svgOrigin: so(id) }, 0); });
      tl.set("#h0t, #mag", { opacity: 0 }, 0);
      ["fz0","fz1","fz2","fz3","fz4","poc","poc2"].forEach((id) => tl.set("#" + id, { opacity: 0 }, 0));
      KIT.camSet(tl, CAMS.open);

      // ===== 0–1.6 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.3);

      // ===== L0 back to the Bank: "CEI"
      KIT.cam(tl, ${f(LN[0].start)}, CAMS.l0, 2.0, "power1.inOut");
      pop("#lb-bank", ${f(TM.how)}); pop("#lb-atk", ${f(TM.how + 0.15)}); pop("#lb-ctr", ${f(TM.how + 0.3)});
      KIT.pop(tl, "#kw-cei", ${f(TM.cei0 - 0.1)}, 0.35);

      // ===== L1 three boards drop in front of the Bank, arrows left → right
      KIT.cam(tl, ${f(LN[1].start - 0.2)}, CAMS.cei, 1.3, "power2.inOut");
      out("#lb-bank, #lb-ctr", ${f(LN[1].start - 0.2)}, 0.2);
      ${[TM.chk, TM.eff, TM.itx].map((t, i) => `grow("bd${i}", ${f(t - 0.15)}, 0.45);`).join(" ")}
      fadeIn("#ga0", ${f(TM.eff + 0.2)}, 0.3); fadeIn("#ga1", ${f(TM.itx + 0.2)}, 0.3);
      tl.to("#ga0, #ga1", { fill: "#1f9d55", duration: 0.25 }, ${f(TM.ord)});

      // ===== L2 key shot: move "balances = 0" above the call → card A becomes card D
      KIT.cam(tl, ${f(LN[2].start - 0.4)}, CAMS.code, 1.1, "power2.inOut");
      out("#kw-cei", ${f(LN[2].start - 0.4)}, 0.25);
      ${[0, 1, 2].map((i) => `shrink("bd${i}", ${f(LN[2].start - 0.3 + i * 0.06)});`).join(" ")}
      out("#ga0, #ga1", ${f(LN[2].start - 0.3)}, 0.2);
      KIT.pop(tl, "#code", ${f(LN[2].start - 0.2)}, 0.35);
      tl.to("#r-zero", { backgroundColor: "#fdeae7", duration: 0.25 }, ${f(TM.one)});
      tl.to("#r-call", { backgroundColor: "#fdeae7", duration: 0.25 }, ${f(TM.one + 0.15)});
      tl.to("#r-zero", { x: 34, scale: 1.04, boxShadow: "0 10px 22px rgba(70,60,40,0.22)", backgroundColor: "#ffffff", duration: 0.3, ease: "power2.out" }, ${f(TM.zero)});
      tl.to("#r-call", { backgroundColor: "rgba(0,0,0,0)", duration: 0.2 }, ${f(TM.zero)});
      out("#g1, #g2", ${f(TM.zero)}, 0.2);
      tl.to("#r-zero", { y: -100, duration: 0.6, ease: "power3.inOut" }, ${f(TM.move)});
      tl.to("#r-call, #r-ok", { y: 50, duration: 0.6, ease: "power3.inOut" }, ${f(TM.move + 0.05)});
      // insert require(amt > 0) under the read; settle
      tl.to("#r-zero", { x: 0, scale: 1, y: -50, boxShadow: "0 0 0 rgba(0,0,0,0)", backgroundColor: "#e2f3e9", duration: 0.45, ease: "power2.inOut" }, ${f(TM.bef + 0.35)});
      tl.to("#r-call, #r-ok", { y: 100, duration: 0.45, ease: "power2.inOut" }, ${f(TM.bef + 0.35)});
      tl.to("#r-end", { y: 50, duration: 0.45, ease: "power2.inOut" }, ${f(TM.bef + 0.35)});
      fadeIn("#r-req", ${f(TM.bef + 0.5)}, 0.3);
      fadeIn("#gC", ${f(TM.bef + 0.6)}); fadeIn("#gE", ${f(TM.bef + 0.7)}); fadeIn("#gI", ${f(TM.bef + 0.8)});
      KIT.swap(tl, "#tagA", "#tagD", ${f(TM.bef + 0.6)}, 0.3);
      KIT.draw(tl, "cvz", ${f(TM.bef + 0.5)}, 0.5);

      // ===== L3 replay: the first call zeroes the ledger first; the re-entry reads 0 and reverts
      out("#cvz", ${f(LN[3].start)}, 0.2);
      pop("#lb-ctr", ${f(LN[3].start + 0.2)});
      KITX04.armPress(tl, "cb", ${f(LN[3].start - 0.1)}, {});
      KITX01.press(tl, "bk", 0, ${f(LN[3].start + 0.35)}, "green");
      KITX03.push(tl, "fs", 0, ${f(LN[3].start + 0.4)});
      pop("#lb-t1", ${f(LN[3].start + 0.6)});
      tl.to("#r-zero", { backgroundColor: "#bfe6cf", duration: 0.2 }, ${f(LN[3].start + 0.7)});
      KIT.count(tl, "ctr", ${f(LN[3].start + 0.8)}, 0.5, 1, 0);
      tl.to("#r-zero", { backgroundColor: "#e2f3e9", duration: 0.3 }, ${f(LN[3].start + 1.4)});
      KITX01.dispense(tl, "bk", ${f(LN[3].start + 1.2)}, { n: 1, dist: 1.6 });
      KITX04.op4(tl, "#cb-coin", ${f(LN[3].start + 1.8)}, 1, 0.15);
      KITX04.armPress(tl, "cb", ${f(Math.max(TM.reent + 0.2, LN[3].start + 1.9))}, {});
      KITX01.press(tl, "bk", 0, ${f(Math.max(TM.reent + 0.2, LN[3].start + 1.9) + 0.45)}, "red");
      KITX03.push(tl, "fs", 1, ${f(Math.max(TM.reent + 0.2, LN[3].start + 1.9) + 0.5)});
      pop("#lb-t2", ${f(Math.max(TM.reent + 0.2, LN[3].start + 1.9) + 0.7)});
      tl.to("#r-req", { backgroundColor: "#fdeae7", duration: 0.2 }, ${f(TM.req)});
      pop("#lb-read0", ${f(TM.z3 - 0.1)});
      KITX03.tip(tl, "fs", 1, ${f(TM.rb3 - 0.2)}, { keep: true });
      pop("#x-t2-b", ${f(TM.rb3)});
      pop("#lb-revert", ${f(TM.rb3 + 0.1)});
      pop("#lb-one", ${f(TM.rb3 + 0.4)});

      // ===== L4 interaction last; the ledger is already consistent
      tl.to("#r-req", { backgroundColor: "rgba(0,0,0,0)", duration: 0.2 }, ${f(LN[4].start)});
      tl.to("#r-call", { backgroundColor: "#e3f3f8", duration: 0.25 }, ${f(TM.ctl)});
      tl.to("#gI", { scale: 1.15, duration: 0.2, yoyo: true, repeat: 1 }, ${f(TM.last)});
      out("#lb-read0, #lb-revert, #x-t2-b", ${f(TM.ledg - 0.4)}, 0.2);
      KITX03.fade(tl, "#fs-t1-g", ${f(TM.ledg - 0.4)}, 0, 0.3);
      pop("#lb-eq", ${f(TM.cons - 0.1)});
      pop("#ck-bank-b", ${f(TM.cons + 0.1)});

      // ===== L5 second line: the lock (push in on the button panel)
      KIT.cam(tl, ${f(LN[5].start - 0.4)}, CAMS.panel, 1.2, "power2.inOut");
      out("#code, #lb-eq, #ck-bank-b, #lb-one, #lb-t1, #lb-t2, #lb-ctr, #lb-bank, #lb-atk", ${f(LN[5].start - 0.4)}, 0.25);
      KITX03.fade(tl, "#fs-t0-g", ${f(LN[5].start - 0.4)}, 0, 0.3);
      KITX04.op4(tl, "#cb-coin", ${f(LN[5].start - 0.4)}, 0, 0.2);
      KIT.count(tl, "ctr", ${f(LN[5].start)}, 0.01, 0, 1);
      pop("#lb-b0", ${f(TM.second)}); pop("#lb-b1", ${f(TM.second + 0.1)}); pop("#lb-b2", ${f(TM.second + 0.2)});
      KITX04.hasp(tl, "h0", ${f(TM.lock5 - 0.1)}, true, 0.7);
      pop("#lb-lock", ${f(TM.lock5 + 0.4)});
      KIT.pop(tl, "#codeE", ${f(TM.lock5)}, 0.35);

      // ===== L6 re-entering a locked function reverts
      KITX04.armPress(tl, "cb", ${f(TM.again - 0.3)}, { reach: 0.86, hold: 0.5 });
      out("#lb-lock", ${f(TM.locked6 - 0.2)}, 0.15);
      pop("#lb-blocked", ${f(TM.locked6)});
      KITX04.armPress(tl, "cb", ${f(TM.rb6 - 0.5)}, { reach: 0.86, hold: 0.4 });

      // ===== L7 the lock's three edges
      KIT.cam(tl, ${f(LN[7].start - 0.3)}, CAMS.bounds, 1.3, "power2.inOut");
      out("#codeE, #lb-blocked, #lb-b0, #lb-b1, #lb-b2", ${f(LN[7].start - 0.3)}, 0.2);
      KIT.pop(tl, "#bnd", ${f(TM.edge)}, 0.35);
      pop("#lb-bank", ${f(TM.edge + 0.2)});
      pop("#bn1", ${f(TM.only - 0.1)});
      pop("#lb-b1x", ${f(TM.only + 0.2)});
      KITX01.press(tl, "bk", 1, ${f(TM.only + 0.2)}, "red", 1.4);
      pop("#bn2", ${f(TM.ro - 0.1)});
      fadeIn("#mag", ${f(TM.ro - 0.2)}, 0.3);
      pop("#lb-mag", ${f(TM.ro + 0.1)});
      pop("#bn3", ${f(TM.xc - 0.1)});
      pop("#lb-B", ${f(TM.xc)});
      KITX04.hasp(tl, "hB", ${f(TM.xc + 0.2)}, true, 0.6);
      KITX04.chainOn(tl, "sh", ${f(TM.same7 - 0.3)}, 0.8);
      pop("#lb-shared", ${f(TM.same7 + 0.3)});

      // ===== L8 transient-storage lock (push in again)
      term("tc1", ${f(TM.tst)}, ${f(Math.min(TM.tst + 3.6, LN[9].start - 0.3))});
      KIT.cam(tl, ${f(LN[8].start - 0.3)}, CAMS.panel, 1.2, "power2.inOut");
      out("#bnd, #lb-b1x, #lb-mag, #mag, #lb-B, #lb-shared, #lb-bank", ${f(LN[8].start - 0.3)}, 0.2);
      KITX04.chainOn(tl, "sh", ${f(LN[8].start - 0.3)}, 0.3, false);
      KIT.pop(tl, "#codeE", ${f(TM.v824 - 0.2)}, 0.3);
      tl.to("#e2", { color: "#17809f", fontWeight: 800, duration: 0.2 }, ${f(TM.v824)});
      tl.to("#h0", { opacity: 0, duration: 0.35 }, ${f(TM.tst - 0.1)});
      tl.to("#h0t", { opacity: 1, duration: 0.35 }, ${f(TM.tst - 0.1)});
      KITX04.haspSand(tl, "h0t", ${f(TM.tst + 0.2)}, 2.6);
      pop("#lb-tr", ${f(TM.tst + 0.2)}); pop("#lb-tr2", ${f(TM.tst + 0.4)});
      grow("gg", ${f(TM.gas - 0.6)});
      KITX03.gauge(tl, "gg", ${f(TM.gas - 0.6)}, 0.55, 0.01);
      KITX03.gauge(tl, "gg", ${f(TM.gas)}, 0.82, 0.6, "back.out(1.6)");
      pop("#lb-gas", ${f(TM.low)});

      // ===== L9 target chain must support EIP-1153
      KIT.cam(tl, ${f(LN[9].start - 0.3)}, CAMS.trans, 1.1, "power2.inOut");
      out("#codeE, #lb-gas", ${f(LN[9].start - 0.3)}, 0.2);
      ${[0, 1, 2].map((i) => `grow("ch${i}", ${f(TM.tgt - 0.2 + i * 0.15)}, 0.4);`).join(" ")}
      pop("#lb-c0", ${f(TM.tgt + 0.4)}); pop("#lb-c1", ${f(TM.tgt + 0.55)}); pop("#lb-c2", ${f(TM.eip - 0.1)});
      pop("#lb-1153", ${f(TM.eip + 0.3)});

      // ===== L10 pull payment: the Bank only writes the amount into a locker door
      KIT.cam(tl, ${f(LN[10].start - 0.3)}, CAMS.locker, 1.3, "power2.inOut");
      out("#lb-c0, #lb-c1, #lb-c2, #lb-1153, #lb-tr, #lb-tr2", ${f(LN[10].start - 0.3)}, 0.2);
      ${[0, 1, 2].map((i) => `shrink("ch${i}", ${f(LN[10].start - 0.3)});`).join(" ")} shrink("gg", ${f(LN[10].start - 0.3)});
      grow("lk", ${f(TM.pull - 0.3)}, 0.5);
      pop("#lb-lk", ${f(TM.pull + 0.1)});
      KITX01.press(tl, "bk", 2, ${f(TM.rec - 0.3)}, "green");
      KITX04.lockerWrite(tl, "lk", 5, ${f(TM.rec)});
      pop("#lb-ledger", ${f(TM.rec + 0.2)});
      grow("usr", ${f(TM.self - 0.5)}, 0.4);
      pop("#lb-usr", ${f(TM.self - 0.2)});

      // ===== L11 no push; the user takes one more step
      pop("#lb-push", ${f(TM.nopush)});
      KITX03.moveUV(tl, "usr", ${f(TM.nopush + 0.3)}, 40, -150, 0, 1.0);
      tl.to("#lb-usr-pin, #lb-step-pin", { x: ${f(Wp(40, -150)[0])}, y: ${f(Wp(40, -150)[1])}, duration: 1.0, ease: "power2.inOut" }, ${f(TM.nopush + 0.3)});
      KITX04.lockerDoor(tl, "lk", 5, ${f(TM.cost)}, 100, 0.7);
      KITX04.lockerTake(tl, "lk", 5, ${f(TM.cost + 0.8)}, 0.6);
      pop("#lb-step", ${f(TM.step)});

      // ===== L12 CEI's limit: a long function with interactions scattered in the middle
      KIT.cam(tl, ${f(LN[12].start - 0.3)}, CAMS.long, 1.2, "power2.inOut");
      out("#lb-lk, #lb-ledger, #lb-push, #lb-usr, #lb-step", ${f(LN[12].start - 0.3)}, 0.2);
      KIT.pop(tl, "#long", ${f(TM.lim)}, 0.35);
      ${[2, 5, 8].map((i, k) => `tl.fromTo("#lr${i} .ldot", { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(2)", immediateRender: false }, ${f(TM.cplx + 0.3 + k * 0.35)});`).join(" ")}
      pop("#lnote", ${f(TM.cplx + 0.9)});

      // ===== L13 defence in depth: four posts around the Bank
      KIT.cam(tl, ${f(LN[13].start - 0.3)}, CAMS.posts, 1.2, "power2.inOut");
      out("#long", ${f(LN[13].start - 0.3)}, 0.25);
      KIT.pop(tl, "#def", ${f(TM.did)}, 0.35);
      ${[0, 1, 2, 3].map((i) => `grow("pt${i}", ${f(TM.did + 0.2 + i * 0.18)}, 0.45);`).join(" ")}
      pop("#lb-bank", ${f(TM.four)});

      // ===== L14 1 · CEI by default
      pop("#df1", ${f(TM.r1 - 0.1)}); pop("#lb-p0", ${f(TM.r1)});

      // ===== L15 2 · every external entry that writes shared state → one lock
      KIT.cam(tl, ${f(LN[15].start - 0.2)}, CAMS.chain, 1.1, "power2.inOut");
      out("#lb-p0", ${f(LN[15].start - 0.2)}, 0.2);
      pop("#df2", ${f(TM.shared - 0.1)});
      pop("#lb-b0", ${f(TM.shared)}); pop("#lb-b1", ${f(TM.shared + 0.1)}); pop("#lb-b2", ${f(TM.shared + 0.2)});
      KITX04.hasp(tl, "h1", ${f(TM.entry)}, true, 0.6);
      KITX04.hasp(tl, "h2", ${f(TM.entry + 0.2)}, true, 0.6);
      KITX04.chainOn(tl, "sa", ${f(TM.same15 - 0.3)}, 0.6);
      KITX04.chainOn(tl, "sh", ${f(TM.same15)}, 0.8);
      pop("#lb-B", ${f(TM.same15 + 0.2)});
      pop("#lb-p1", ${f(TM.same15 + 0.2)});

      // ===== L16 3 · no mid-state price from a view; if needed, expose the lock status
      KIT.cam(tl, ${f(LN[16].start - 0.3)}, CAMS.pool, 1.3, "power2.inOut");
      out("#lb-b0, #lb-b1, #lb-b2, #lb-bank, #lb-B", ${f(LN[16].start - 0.3)}, 0.2);
      out("#lb-p1", ${f(LN[16].start - 0.3)}, 0.2);
      pop("#df3", ${f(TM.view - 0.1)});
      pop("#lb-dex", ${f(TM.view)});
      KITX01.needle(tl, "orc", ${f(TM.midst)}, 45, 0.5);
      pop("#lb-view", ${f(TM.price)});
      KITX01.needle(tl, "orc", ${f(TM.must)}, -20, 0.5);
      out("#lb-view", ${f(TM.must)}, 0.2);
      grow("lmp", ${f(TM.must + 0.1)}, 0.4);
      fadeIn("#lmp-bulb", ${f(TM.lq)}, 0.25);
      pop("#lb-lamp", ${f(TM.lq + 0.1)});

      // ===== L17 4 · invariant test: the scale never tips
      KIT.cam(tl, ${f(LN[17].start - 0.3)}, CAMS.bal, 1.2, "power2.inOut");
      out("#lb-dex, #lb-lamp", ${f(LN[17].start - 0.3)}, 0.2);
      pop("#df4", ${f(TM.inv - 0.1)});
      grow("bal", ${f(TM.inv)}, 0.5);
      pop("#lb-panL", ${f(TM.cbal)}); pop("#lb-panR", ${f(TM.ubal)});
      ${[0, 1, 2, 3, 4].map((i) => {
        const a = at(L0o, 0, 0, 0), b = at({ u: P.bal.u + 380, v: P.bal.v - 40 }, 0, 0, 0);
        const t0 = TM.seq - 0.4 + i * 0.85;
        return `tl.set("#fz${i}", { opacity: 1 }, ${f(t0)}); KITX01.walk(tl, "fz${i}", ${f(t0)}, 1.1, [${JT(a)}, ${JT([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 150])}, ${JT(b)}], "power1.inOut"); tl.set("#fz${i}", { opacity: 0 }, ${f(t0 + 1.12)});`
          + ` KITX01.tilt(tl, "bal", ${f(t0 + 0.5)}, ${i % 2 ? 3 : 9}, 0.4); KITX01.tilt(tl, "bal", ${f(t0 + 0.9)}, 6, 0.4);`;
      }).join("\n      ")}
      pop("#lb-ge", ${f(TM.ubal + 0.6)});

      // ===== L18 verify with code: same PoC — vulnerable drains, fixed reverts
      KIT.cam(tl, ${f(LN[18].start - 0.3)}, CAMS.test, 1.3, "power2.inOut");
      out("#def, #lb-panL, #lb-panR, #lb-ge", ${f(LN[18].start - 0.3)}, 0.2);
      grow("vu", ${f(TM.verify)}, 0.5); grow("fx", ${f(TM.verify + 0.2)}, 0.5);
      pop("#lb-vu", ${f(TM.vu - 0.2)}); pop("#lb-fx", ${f(TM.fx - 0.2)});
      { const a = ${JT(at(pocO, 0, 0, 0))}, s1 = ${JT(at(P.vuln, 40, 110, 0))}, s2 = ${JT(at(P.fixd, 40, 110, 0))};
        tl.set("#poc", { opacity: 1 }, ${f(TM.poc - 0.2)}); pop("#lb-poc", ${f(TM.poc)});
        KITX01.walk(tl, "poc", ${f(TM.vu - 0.3)}, 0.7, [a, s1], "power2.inOut");
        tl.set("#poc", { opacity: 0 }, ${f(TM.vu + 0.42)});
        KITX01.dispense(tl, "vu", ${f(TM.drain - 0.2)}, { n: 5, color: "red", dist: 1.2 });
        pop("#lb-drain", ${f(TM.drain + 0.2)});
        tl.set("#poc2", { opacity: 1 }, ${f(TM.fx - 0.6)});
        KITX01.walk(tl, "poc2", ${f(TM.fx - 0.6)}, 0.9, [a, s2], "power2.inOut");
        tl.set("#poc2", { opacity: 0 }, ${f(TM.fx + 0.32)});
        KITX01.press(tl, "fx", 0, ${f(TM.rb18 - 0.2)}, "red");
        pop("#lb-rb", ${f(TM.rb18)}); }
      out("#lb-poc", ${f(TM.rb18)}, 0.2);

      // ===== L19 running only the fixed version proves nothing
      tl.to("#vu, #lb-vu-pin, #lb-drain-pin", { opacity: 0.18, duration: 0.4 }, ${f(TM.only19)});
      tl.to("#vu-coins", { opacity: 0, duration: 0.3 }, ${f(TM.only19)});
      pop("#lb-weak", ${f(TM.cant)});
      KIT.pop(tl, "#kw-ver", ${f(TM.cant - 0.2)}, 0.35);

      // ===== L20 compiler station: the lock is right in source…
      KIT.cam(tl, ${f(LN[20].start - 0.4)}, CAMS.src, 1.8, "power2.inOut");
      out("#kw-ver", ${f(LN[20].start + 0.3)}, 0.2);
      out("#lb-weak, #lb-rb, #lb-fx", ${f(LN[20].start - 0.4)}, 0.2);
      pop("#lb-vy", ${f(TM.right)});
      pop("#lb-src", ${f(TM.right + 0.3)}); pop("#ck-src-b", ${f(TM.right + 0.5)});
      KITX03.spin(tl, "vy", ${f(TM.noeff)}, 1.6, 1.5);

      // ===== L21 event card
      KIT.pop(tl, "#evt", ${f(TM.y23)}, 0.35);

      // ===== L22 three compiler versions → mismatched lock slots
      KIT.cam(tl, ${f(LN[22].start - 0.2)}, CAMS.comp, 1.1, "power2.inOut");
      pop("#lb-ver", ${f(TM.vers)});
      KITX03.spin(tl, "vy", ${f(TM.vers + 0.2)}, 1.4, 1.2);
      KITX04.tape(tl, "tp", ${f(TM.vers + 0.3)}, 1, 1.4);
      KITX04.tapeMark(tl, "tp", ${f(TM.bad)}, true);
      KITX04.tapeMark(tl, "tp", ${f(TM.bad + 0.4)}, "flash");
      pop("#lb-fa", ${f(TM.difff)}); pop("#lb-fb", ${f(TM.difff + 0.25)});
      KIT.draw(tl, "cva", ${f(TM.difff + 0.2)}, 0.6); KIT.draw(tl, "cvb", ${f(TM.difff + 0.5)}, 0.6);
      KITX03.mark(tl, "cab", 0, ${f(TM.slot - 0.3)}, "red"); KITX03.mark(tl, "cab", 1, ${f(TM.slot - 0.1)}, "red");
      pop("#lb-s0", ${f(TM.slot - 0.3)}); pop("#lb-s1", ${f(TM.slot - 0.1)});
      pop("#lb-slot", ${f(TM.slot + 0.2)});

      // ===== L23 native-ETH pool: blocked at A, walks into B (different slot) — coins flow
      KIT.cam(tl, ${f(LN[23].start - 0.3)}, CAMS.attack, 1.2, "power2.inOut");
      out("#evt", ${f(LN[23].start - 0.3)}, 0.2);
      out("#lb-ver, #lb-src, #ck-src-b", ${f(LN[23].start - 0.3)}, 0.2);
      pop("#lb-pool", ${f(TM.nat)});
      KITX04.armPress(tl, "cb2", ${f(TM.nat + 0.2)}, { reach: 0.86, hold: 0.3 });
      KITX04.armPress(tl, "cb2", ${f(TM.xfn - 0.3)}, { target: ${JT(pool.anchors.buttons[3])}, hold: 0.5 });
      KITX01.press(tl, "pl", 3, ${f(TM.xfn + 0.25)}, "red", 0.6);
      KITX01.dispense(tl, "pl", ${f(TM.xfn + 0.4)}, { n: 6, color: "red", dist: 1.4 });
      pop("#lb-xf", ${f(TM.xfn + 0.3)});

      // ===== L24 about $70M (third-party post-mortems)
      KIT.pop(tl, "#evt", ${f(LN[24].start - 0.1)}, 0.3);
      pop("#evt2", ${f(TM.multi - 0.1)});

      // ===== L25 source right ≠ bytecode right; audit includes compiler version
      term("tc2", ${f(w("字节码", 25))}, ${f(w("字节码", 25) + 3.6)});
      KIT.cam(tl, ${f(LN[25].start - 0.3)}, CAMS.end, 1.3, "power2.inOut");
      out("#evt, #lb-pool, #lb-xf, #lb-fa, #lb-fb, #lb-slot, #lb-s0, #lb-s1, #cva, #cvb, #lb-vy", ${f(LN[25].start - 0.3)}, 0.2);
      pop("#lb-src", ${f(LN[25].start + 0.1)}); pop("#ck-src-b", ${f(TM.srcok + 0.2)});
      KIT.pop(tl, "#kw-neq", ${f(TM.srcok - 0.1)}, 0.35);
      pop("#lb-card", ${f(TM.bcok - 0.2)}); pop("#x-card-b", ${f(TM.bcok + 0.1)});
      pop("#lb-audit", ${f(TM.aud)});
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL);
