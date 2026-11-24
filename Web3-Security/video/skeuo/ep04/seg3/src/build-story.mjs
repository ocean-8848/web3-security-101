// Generates compositions/story.html for ep04/seg3「③ 四种重入」.
// Run: node src/build-story.mjs
// World = seg1's "Bank Street" (src/layout.mjs of seg1): Bank (vending) at u=v=0 with the call stack on its roof,
// ledger desk on its −u side, attacker contract front-left, third-party protocols (lending safe + oracle + AMM)
// to the right. This segment adds: a depth ruler + gas gauge right of the Bank (single-function), a cross-contract
// corner behind-left (contract machines A/B sharing one ledger), and a second attacker contract in front of the
// third-party zone (read-only). One camera travels the world: overview → Bank → Bank panel → A/B corner → protocols.
import fs from "node:fs";
import { G, at, f, Wp, M, CE, box, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as LY from "../../seg1/src/layout.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { wrap, lift, coin, pedestal, ruler } from "./props.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const w = (term, line, o = {}) => wordAt(T, term, { line, ...o }).start;
const we = (term, line, o = {}) => wordAt(T, term, { line, ...o }).end;
const L = (i) => lineAt(T, i);
const add = (y, svg) => items.push({ y, svg });
const items = [];
const A = {};
const put = (name, r, o, dy = 0) => { A[name] = r.anchors; add(at(o)[1] + dy, r.svg); return r; };

// ================================================================ objects
// ---- Bank (seg1 layout) + POOL overlay (Fei Rari) + call stack on the roof
const oB = LY.BANK;
put("vm", E1.vending(oB, { id: "vm", sign: "BANK", maintDoor: true }), oB);
{ const r = E1.vending(oB, { id: "pool", sign: "POOL", glow: false }); A.pool = r.anchors; add(at(oB)[1] + 0.01, `<g id="poolw" opacity="0">${r.svg}</g>`); }
const SK = LY.STACK.scale, [gx, gy] = at(oB), lz = LY.STACK.z * CE;
const ST = (p) => [gx + SK * (p[0] - gx), gy - lz + SK * (p[1] - gy)];
const fsR = E3.frameStack(oB, { id: "fs", n: 5, labels: ["#1", "#2", "#3", "…", "#10"], filled: 0 });
add(at(oB)[1] + 0.02, `<g transform="translate(${f(gx)},${f(gy - lz)}) scale(${SK}) translate(${f(-gx)},${f(-gy)})">${fsR.svg}</g>`);
const trayR = (i) => ST(at(oB, 100, 0, 30 + i * 58 + 2));   // right edge of tray i
const trayC = (i) => ST(fsR.anchors.trays[i]);
const STACK_TOP = ST(fsR.anchors.top);
// hasp on the withdraw / borrow button
const b0 = X.vendButton(oB, 0);
{ const r = X.hasp(b0.o, { id: "h0", z: b0.z, scale: b0.scale, locked: false }); A.h0 = r.anchors; add(at(b0.o)[1], `<g id="h0w" opacity="0">${r.svg}</g>`); }

// ---- ledger desk (seg1 layout)
{ // same construction as seg1: pedestal + wood top + ledgerBook + rollCounter ×COUNTER_SCALE
  const D = LY.DESK, DT = LY.DESK_TOP;
  let s = box(D, -80, 80, -100, 100, 0, DT - 8, M.white, 1.6) + box(D, -88, 88, -108, 108, DT - 8, DT, M.wood, 1.4);
  s += lift(O.ledgerBook(LY.LEDGER, { id: "lb", scale: 0.55 }).svg, DT);
  const ctr = E2.rollCounter(LY.COUNTER, { id: "rc", digits: 1, value: 1, z: DT });
  const [cx0, cy0] = at(LY.COUNTER, 0, 0, DT), ck = LY.COUNTER_SCALE;
  s += `<g transform="translate(${f(cx0)},${f(cy0)}) scale(${ck}) translate(${f(-cx0)},${f(-cy0)})">${ctr.svg}</g>`;
  const cT = (q) => [cx0 + (q[0] - cx0) * ck, cy0 + (q[1] - cy0) * ck];
  A.rc = { window: cT(ctr.anchors.window), top: cT(ctr.anchors.top) };
  add(at(D)[1], `<g id="desk">${s}</g>`);
}

// ---- attacker contract + callback arm (seg1 layout)
put("atk", E1.miniVend(LY.ATK, { id: "atk", kind: "attacker" }), LY.ATK);
const BTN = A.vm.buttons;
put("cb", X.callbackArm(LY.ARM, { id: "cb", target: BTN[0] }), LY.ARM);

// ---- depth ruler + gas gauge (single-function, L8)
const oRu = { u: 240, v: 10 }, oGa = { u: 400, v: 170 };
put("ru", ruler(oRu, { id: "ru", h: 600 }), oRu);
put("gas", E3.gasGauge(oGa, { id: "gas", value: 1 }), oGa);

// ---- four numbered plates
const PL = [
  { o: { u: -640, v: 140 }, t: "1 单函数" },
  { o: { u: 300, v: 480 }, t: "2 跨函数" },
  { o: { u: 1600, v: -450 }, t: "3 跨合约" },
  { o: { u: LY.DEX.u + 700, v: LY.DEX.v + 150 }, t: "4 只读" },
];
PL.forEach((p, i) => {
  const r = E1.signBoard(p.o, { id: "pl" + i, style: "plate", text: p.t, size: 40 }); A["pl" + i] = r.anchors;
  const lit = E1.signBoard(p.o, { id: "plL" + i, style: "plate", text: p.t, size: 40, color: "#1c1c1c" });
  add(at(p.o)[1], r.svg + `<g id="plL${i}w" opacity="0">${lit.svg}</g>`);
});

// ---- cross-contract corner (behind-right of the Bank, on the way to the protocols): A (vault) — pipe — B (share token), shared ledger in front
const oA = { u: 1000, v: -720 }, oBm = { u: 1350, v: -720 }, oSh = { u: 1175, v: -500 };
put("mA", E3.contractMachine(oA, { id: "mA", name: "A" }), oA);
put("mB", E3.contractMachine(oBm, { id: "mB", name: "B" }), oBm);
put("pAB", E1.pipe(oA, { id: "pAB", pts: [[110, 0, 90], [240, 0, 90]] }), oA, -50);   // between B (far) and A (near)
add(at(oSh)[1], wrap("shl", oSh, O.ledgerBook(oSh, { id: "shl0", scale: 0.8 }).svg));
A.shl = { c: at(oSh, 0, 0, 20), top: at(oSh, 0, 0, 120) };
const hAo = { u: oA.u, v: oA.v + 100 };
{ const r = X.hasp(hAo, { id: "hA", z: 85, scale: 1.6, locked: false }); A.hA = r.anchors; add(at(hAo)[1], `<g id="hAw" opacity="0">${r.svg}</g>`); }
const oAt3 = { u: 760, v: -260 }, oCb3 = { u: 900, v: -250 };
put("atk3", E1.miniVend(oAt3, { id: "atk3", kind: "attacker" }), oAt3);
const slotB = at(oBm, 0, 100, 85), slotA = at(oA, 0, 100, 85);
put("cb3", X.callbackArm(oCb3, { id: "cb3", target: slotB, maxReach: 520 }), oCb3);

// ---- third-party zone (seg1 layout): lending safe + oracle dial (with ghost needle) + AMM pool, pipes; 2nd attacker in front
put("lend", O.safe(LY.LEND_SAFE, { id: "lend", plate: "LOAN" }), LY.LEND_SAFE);
put("orc", E1.miniVend(LY.ORACLE, { id: "orc", kind: "oracle", needle: -20 }), LY.ORACLE);
{ const r = X.oracleGhost(LY.ORACLE, { id: "orc", deg: 48, real: -20, shown: false }); A.ghost = r.anchors; add(at(LY.ORACLE)[1] + 0.01, r.svg); }
put("dex", E1.miniVend(LY.DEX, { id: "dex", kind: "dex" }), LY.DEX);
put("pDO", E1.pipe(LY.DEX, { id: "pDO", pts: [[55, 0, 70], [280, 0, 70], [280, -205, 70]] }), { u: LY.ORACLE.u, v: LY.ORACLE.v + 46 }, 1);
put("pOL", E1.pipe(LY.ORACLE, { id: "pOL", pts: [[-55, 0, 70], [-90, 0, 70], [-90, -260, 70]] }), { u: LY.ORACLE.u - 90, v: LY.ORACLE.v }, -1);
const oAt4 = { u: LY.DEX.u - 330, v: LY.DEX.v + 160 }, oCb4 = { u: LY.DEX.u - 200, v: LY.DEX.v + 170 };
put("atk4", E1.miniVend(oAt4, { id: "atk4", kind: "attacker" }), oAt4);
const orcBtn = at(LY.ORACLE, 38, 45, 108);
put("cb4", X.callbackArm(oCb4, { id: "cb4", target: orcBtn, maxReach: 560 }), oCb4);
const hDo = X.miniButton(LY.DEX, 0);
{ const r = X.hasp(hDo.o, { id: "hD", z: hDo.z, scale: hDo.scale, locked: false }); A.hD = r.anchors; add(at(hDo.o)[1], `<g id="hDw" opacity="0">${r.svg}</g>`); }

// ---- flying coins (above everything)
const TRAYP = at(oB, ...LY.TRAY);
const trayO = { u: oB.u + LY.TRAY[0], v: oB.v + LY.TRAY[1] };   // ground point under the tray
const coins = [];
for (let k = 0; k < 5; k++) { const c = coin(trayO, { id: "cn" + k, z: LY.TRAY[2], op: 0 }); coins.push(c); add(1e6 + k, c.svg); }
const dexO = { u: LY.DEX.u - 24 * 0.6, v: LY.DEX.v + 50 };
const tk4 = [0, 1, 2].map((k) => { const c = coin(dexO, { id: "tk" + k, z: 30, op: 0 }); add(1e6 + 10 + k, c.svg); return c; });
const lendO = { u: LY.LEND_SAFE.u + 40, v: LY.LEND_SAFE.v + 130 };
const rc4 = [0, 1, 2].map((k) => { const c = coin(lendO, { id: "rk" + k, z: 40, op: 0, red: true }); add(1e6 + 20 + k, c.svg); return c; });
const colO = { u: oB.u + 60, v: oB.v + 90 };
const col = [0, 1, 2].map((k) => { const c = coin(colO, { id: "col" + k, z: 10 + k * 7, op: 0, red: true }); add(1e6 + 30 + k, c.svg); return c; });

items.sort((a, b) => a.y - b.y);
const world = worldSvg("wsvg", gridSvg({ u0: -2600, u1: 3000, v0: -2400, v1: 2200 }) + items.map((x) => x.svg).join("\n"), [-2600, -2000, 5600, 3600]);

// ================================================================ cameras
const CAMS = {
  over: camAt([990, -305], 960, 500, 0.63),
  z1: camAt([-30, -110], 1350, 500, 1.0),
  z1b: camAt([150, -170], 1250, 520, 0.85),
  z2p: camAt([100, -135], 1150, 500, 2.0),
  z2: camAt([0, -120], 1250, 520, 1.0),
  z3: camAt([650, -600], 960, 560, 1.2),
  z4: camAt([1640, -600], 940, 540, 1.0),
};
const sc = (cam, p) => toScreen(CAMS[cam], p);

// ================================================================ labels (world)
let labels = "";
const up = (p, dy) => [p[0], p[1] - dy];
const rt = (p, dx, dy = 0) => [p[0] + dx, p[1] + dy];
PL.forEach((p, i) => { labels += wlab("lb-pl" + i, (i === 0 ? rt(A.pl0.top, 70) : A["pl" + i].top), ["单函数重入", "跨函数重入", "跨合约重入", "只读重入"][i], "lab-g lab-sm hide"); });
labels += wlab("lb-stack", up(STACK_TOP, 0), "调用栈", "lab-cs hide");
labels += wlab("lb-bank", rt(A.vm.top, -170, 40), "Bank", "lab-g hide", "r");
labels += wlab("lb-atk", rt(A.atk.top, -40, 10), "攻击合约", "lab-rs lab-sm hide", "r");
// single function: trays
const TL = ["#1 withdraw", "#2 withdraw", "#3 withdraw", "…", "#10 withdraw"];
for (let i = 0; i < 5; i++) labels += wlab("lb-t" + i, rt(trayR(i), 18, -8 * i), TL[i], "lab-sm hide", "l");
labels += wlab("lb-r0", rt(trayR(0), 250), "读到 1", "lab-cs lab-sm hide", "l");
labels += wlab("lb-r1", rt(trayR(1), 250, -14), "也读到 1", "lab-rs lab-sm hide", "l");
labels += wlab("lb-rc", rt(A.rc.top, 0, 0), "攻击者余额", "lab-sm hide");
labels += wlab("lb-recv", up(A.cb.top, 10), "receive", "lab-r lab-sm hide");
labels += wlab("lb-empty", up(A.vm.glass, 0), "金库余额不足 · 停止", "lab-rs hide", "c");
labels += wlab("lb-gone", up(A.vm.glass, 0), "金库 0 · 钱已转走", "lab-rs hide", "c");
labels += wlab("lb-zero", rt(A.rc.top, 0, -60), "清零 · 太晚了", "lab-r lab-sm hide");
labels += wlab("lb-ru", rt(A.ru.cap, 20, 30), "调用深度上限 1024", "hide", "l");
labels += wlab("lb-gas", A.gas.top, "gas 会用完", "lab-sm hide");
labels += wlab("lb-big", rt(A.cb.top, 70, -30), "每次取尽量大 · 层数更少", "lab-r hide", "l");
// cross-function
const BL0 = rt(BTN[0], 36, -16), BL1 = rt(BTN[1], 36, 14);
labels += wlab("lb-b0", BL0, "withdraw", "lab-sm hide", "l");
labels += wlab("lb-b1", BL1, "transfer", "lab-sm hide", "l");
labels += wlab("lb-b0f", BL0, "borrow · 有锁", "lab-sm hide", "l");
labels += wlab("lb-b1f", BL1, "exitMarket · 没锁", "lab-r lab-sm hide", "l");
labels += wlab("lb-lock", BL0, "withdraw · 加了锁", "lab-gs lab-sm hide", "l");
labels += wlab("lb-nolock", BL1, "transfer · 没加锁", "lab-r lab-sm hide", "l");
labels += wlab("lb-q", rt(BTN[1], 150, 70), "还能利用回调吗？", "lab-ink hide", "l");
labels += wlab("lb-blk", BL0, "withdraw · 被拦 ✓", "lab-gs lab-sm hide", "l");
labels += wlab("lb-in", BL1, "transfer · 照样进入", "lab-rs lab-sm hide", "l");
labels += wlab("lb-t0x", rt(trayR(0), 18), "#1 withdraw · 外层", "lab-sm hide", "l");
labels += wlab("lb-t1x", rt(trayR(1), 18, -12), "transfer · 回调里", "lab-r lab-sm hide", "l");
labels += wlab("lb-out", up(A.cb.top, 10), "已提走", "lab-rs lab-sm hide");
labels += wlab("lb-fei1", rt(TRAYP, -40, 40), "① 先发 ETH", "lab-cs lab-sm hide", "r");
labels += wlab("lb-col", up(at(colO, 0, 0, 30), 0), "全部抵押品", "lab-rs lab-sm hide", "l");
// ledger card (world) for cross-function and Fei Rari
const LEDG = [230, 120];
labels += wpin("led", LEDG, `<div class="ledger hide" id="ledi"><div class="lh">余额账本</div>
  <div class="lr" id="ledr0"><span class="lk">攻击者</span><span class="lv"><b id="lv0a">1</b><b id="lv0b" class="hide">0</b></span></div>
  <div class="lr" id="ledr1"><span class="lk">同伙</span><span class="lv"><b id="lv1a">0</b><b id="lv1b" class="hide red">1</b></span><span class="tg hide" id="ledtg">已转走</span></div></div>`, "l");
labels += wpin("led2", LEDG, `<div class="ledger hide" id="led2i"><div class="lh">借贷池账本</div>
  <div class="lr" id="ledf0"><span class="lk">借款记录</span><span class="lv"><b id="lf0a" class="gray">还没写</b><b id="lf0b" class="hide">已写入</b></span></div>
  <div class="lr" id="ledf1"><span class="lk">抵押品</span><span class="lv"><b id="lf1a">锁定中</b><b id="lf1b" class="hide red">已取回</b></span></div></div>`, "l");
// cross-contract
labels += wlab("lb-mA", rt(A.mA.top, -10), "金库合约 A", "lab-sm hide", "r");
labels += wlab("lb-mB", rt(A.mB.top, 10), "份额代币合约 B", "lab-sm hide", "l");
labels += wlab("lb-sh", rt(A.shl.c, 110, 30), "共享状态", "lab-cs hide", "l");
labels += wlab("lb-hA", rt(A.hA.lock, -10, -60), "A 的锁", "lab-gs lab-sm hide", "b");
labels += wlab("lb-hB", rt(slotB, 60, -20), "B 没被锁", "lab-rs lab-sm hide", "l");
labels += wlab("lb-old", rt(A.shl.c, 110, 30), "A 还没写完 · B 读到旧状态", "lab-rs hide", "l");
labels += wlab("lb-atk3", rt(A.atk3.top, -30, 10), "攻击合约", "lab-rs lab-sm hide", "r");
// read-only
labels += wlab("lb-hide", up(A.pl3.top, 0), "最隐蔽", "lab-rs hide");
labels += wlab("lb-dex", rt(A.dex.top, -50, 20), "AMM 池", "lab-sm hide", "r");
labels += wlab("lb-lend", rt(A.lend.top, -20, 0), "借贷协议", "lab-sm hide", "r");
labels += wlab("lb-nomod", rt(A.dex.top, -50, 70), "不修改池子", "lab-g lab-sm hide", "r");
labels += wlab("lb-atk4", rt(A.atk4.top, -30, 10), "攻击合约", "lab-rs lab-sm hide", "r");
labels += wlab("lb-ghost", rt(A.ghost.top, 20, 0), "被扭曲的价格", "lab-rs lab-sm hide", "l");
labels += wlab("lb-loan", rt(A.lend.front || A.lend.top, -40, 120), "按错误价格放贷", "lab-rs lab-sm hide", "r");
labels += wlab("lb-wrong", rt(A.ghost.top, 20, 0), "出错的是中间时刻读数据的第三方", "lab-rs hide", "l");
labels += wlab("lb-view", rt(A.hD.lock, 40, 30), "view · 无锁", "lab-g lab-sm hide", "l");
labels += wlab("lb-vlock", rt(A.hD.lock, 40, 30), "重入锁挡不住", "lab-rs lab-sm hide", "l");
labels += wlab("lb-gvp", rt(A.orc.dial, 70, -10), "get_virtual_price()", "lab-ink lab-sm hide", "l");
labels += wlab("lb-lp", rt(A.lend.top, -20, 70), "LP 抵押品 · 按扭曲价格定价", "lab-rs lab-sm hide", "r");
// AMM readout card
labels += wpin("rd", at(LY.DEX, 120, 60, 0), `<div class="rcard hide" id="rdi"><div class="rh">池子读数</div>
  <div class="rr"><span class="rk">储备</span><span class="rb"><i id="rbar0"></i></span></div>
  <div class="rr"><span class="rk">总量</span><span class="rb"><i id="rbar1"></i></span><span class="rt hide" id="rtag">未更新</span></div>
  <div class="rok hide" id="rok">最终一致 ✓</div></div>`, "l");

// ================================================================ screen-layer cards and lines
const CA = { x: 60, y: 40, w: 840 }, CB = { x: 60, y: 450, w: 820 }, CC = { x: 60, y: 40, w: 900 };
const rowY = (c, r) => c.y + 24 + 56 + r * 50 + 25;
// card A row 2 (call) → Bank tray (z1)
const dA = dashCurve("dA", [CA.x + CA.w - 30, rowY(CA, 2)], sc("z1", TRAYP), { c1: [CA.x + CA.w + 140, rowY(CA, 2) + 60], c2: [sc("z1", TRAYP)[0] - 160, sc("z1", TRAYP)[1] - 60] });
// card B "bank.withdraw()" row → arm mount (z1)
const dB = dashCurve("dB", [CB.x + CB.w - 30, rowY(CB, 2)], sc("z1", A.cb.mount), { c1: [CB.x + CB.w + 120, rowY(CB, 2)], c2: [sc("z1", A.cb.mount)[0] - 140, sc("z1", A.cb.mount)[1] - 40] });
// card C transfer row → transfer button (z2)
const dC = dashCurve("dC", [CC.x + CC.w - 30, rowY(CC, 2)], sc("z2p", BTN[1]), { c1: [CC.x + CC.w + 60, rowY(CC, 2) + 200], c2: [sc("z2p", BTN[1])[0] - 260, sc("z2p", BTN[1])[1] + 140] });
// read lines (world, inside #cam): rc → tray, oracle → dex, B → shared ledger
const dR = dashCurve("dR", up(A.rc.window, 30), trayC(0), { color: "#1d93ba", c1: [A.rc.window[0] + 40, A.rc.window[1] - 260], c2: [trayC(0)[0] - 220, trayC(0)[1] - 40], sw: 4 });
const dR2 = dashCurve("dR2", up(A.rc.window, 30), trayC(1), { color: "#e0453a", c1: [A.rc.window[0] + 60, A.rc.window[1] - 320], c2: [trayC(1)[0] - 240, trayC(1)[1] - 60], sw: 4 });
const dS = dashCurve("dS", slotB, A.shl.c, { color: "#e0453a", c1: [slotB[0] + 40, slotB[1] + 120], c2: [A.shl.c[0] + 120, A.shl.c[1] - 40] });
const dP = dashCurve("dP", A.orc.dial, at(LY.DEX, 0, 45, 120), { color: "#e0453a", c1: [A.orc.dial[0] + 160, A.orc.dial[1] + 40], c2: [at(LY.DEX, 0, 45, 120)[0] + 160, at(LY.DEX, 0, 45, 120)[1] - 40] });
const worldLines = `<svg class="wsvg" style="left:0;top:0" width="10" height="10" overflow="visible">${dR.svg}${dR2.svg}${dS.svg}${dP.svg}</svg>`;

// ================================================================ times
const TM = {
  stack0: w("调用栈", 0), one0: w("一种一种", 0),
  s1: L(1).start, sf1: w("单函数", 1),
  s2: L(2).start, rd2: w("读余额", 2), tr2: w("转账", 2), cl2: w("清零", 2),
  call3: w("调用取款", 3), read3: w("读到", 3), callw3: w("call", 3), go3: w("转过去", 3),
  recv4: w("receive", 4), trig4: w("触发", 4), money4: w("还有钱", 4), again4: w("再调用", 4),
  l2_5: w("第二层", 5), still5: w("还是", 5), l1_5: w("第一层", 5), not5: w("还没执行", 5),
  nest6: w("一层套一层", 6), low6: w("余额不够", 6), stop6: w("停下来", 6),
  ret7: w("依次返回", 7), clr7: w("依次清零", 7), gone7: w("钱已经没了", 7),
  lim8: w("上限", 8), gas8: w("gas", 8), d8: w("1024", 8), big8: w("尽量大", 8), few8: w("减少层数", 8),
  s9: L(9).start, cf9: w("跨函数", 9),
  no10: w("不回到", 10), oth10: w("另一个", 10), sh10: w("共享", 10), tr10: w("转账", 10),
  lk11: w("重入锁", 11), nl11: w("没加", 11), q11: w("回调吗", 11),
  yes12: w("能", 12), only12: w("被锁函数", 12),
  cb13: w("回调里", 13), to13: w("转给同伙", 13), out13: w("外层返回", 13), clr13: w("才清零", 13),
  take14: w("提走", 14), send14: w("转走", 14),
  y15: w("2022", 15), real15: w("真实版本", 15), loss15: w("8000", 15),
  bor16: w("借款函数", 16), send16: w("发送", 16), rec16: w("借款记录", 16),
  cb17: w("回调里", 17), exit17: w("退出市场", 17), col17: w("抵押品", 17),
  s18: L(18).start, cc18: w("跨合约", 18),
  multi19: w("多个合约", 19), vault19: w("金库合约", 19), share19: w("份额代币", 19), st19: w("共享状态", 19),
  lockA20: w("锁", 20), stop20: w("挡不住", 20), B20: w("合约B", 20), read20: w("读到的", 20), old20: w("没更新", 20),
  s21: L(21).start, ro21: w("只读重入", 21), hid21: w("最隐蔽", 21),
  nomod22: w("不修改", 22), tp22: w("第三方", 22), read22: w("去读", 22),
  amm23: w("AMM", 23), rm23: w("移除流动性", 23), out23: w("转出代币", 23), upd23: w("更新总量", 23),
  mom24: w("那一刻", 24), res24: w("储备", 24), tot24: w("总量", 24),
  lend25: w("借贷协议", 25), pf25: w("价格函数", 25), tw25: w("扭曲", 25), loan25: w("放贷", 25),
  ok26: w("最终是对的", 26), err26: w("出错的", 26), tp26: w("第三方", 26),
  view27: w("view", 27), nl27: w("不加锁", 27), stop27: w("挡不住", 27),
  y28: w("2023", 28), df28: w("dForce", 28), loss28: w("360", 28),
  curve29: w("Curve", 29), vp29: w("虚拟价格", 29), col29: w("抵押品", 29),
};

const codeRow = (id, txt, chip = "") => `<div class="c-row" id="${id}"><span class="c-bar" id="${id}-bar" style="opacity:0"></span>${txt}${chip}</div>`;
const chip = (id, txt, cls = "") => `<span class="chip ${cls} hide" id="${id}">${txt}</span>`;
const cardA = `<div class="k-code hide" id="cardA"><div class="c-head">漏洞版 withdraw<span class="c-tag">示例</span></div>
  ${codeRow("ca0", "function withdraw() external {")}
  ${codeRow("ca1", "  uint amt = balances[msg.sender];", chip("ch1", "① 读余额"))}
  ${codeRow("ca2", "  msg.sender.call{value: amt}(\"\");", chip("ch2", "② 转账"))}
  ${codeRow("ca3", "  balances[msg.sender] = 0;", chip("ch3", "③ 清零") + chip("ch3b", "还没执行", "chip-r"))}
  ${codeRow("ca4", "}")}</div>`;
const cardB = `<div class="k-code hide" id="cardB"><div class="c-head">攻击合约 receive<span class="c-tag">结构示意</span></div>
  ${codeRow("cbr0", "receive() external payable {")}
  ${codeRow("cbr1", "  if (address(bank).balance >= 1 ether)")}
  ${codeRow("cbr2", "    bank.withdraw();  <span class=\"c-cm\">// 再次进入</span>")}
  ${codeRow("cbr3", "}")}</div>`;
const cardC = `<div class="k-code hide" id="cardC"><div class="c-head">跨函数 · 共享同一份余额<span class="c-tag">示例</span></div>
  ${codeRow("cc0", "function withdraw() external <b>nonReentrant</b> {…}")}
  ${codeRow("cc1", "function transfer(address to, uint amt)")}
  ${codeRow("cc2", "    external {  <span class=\"c-red\">// 没有加锁</span>")}
  ${codeRow("cc3", "  require(balances[msg.sender] >= amt); …")}</div>`;
const evFei = `<div class="evcard hide" id="evFei"><div class="eh"><b>Fei Rari</b><span class="src">CertiK 分析</span></div><div class="eb">2022 年 4 月 · 损失约 8000 万美元</div><div class="ec">跨函数重入的真实版本</div></div>`;
const evDf = `<div class="evcard hide" id="evDf"><div class="eh"><b>dForce</b><span class="src">CertiK 分析 · 事发时估值</span></div><div class="eb">2023 年 2 月 · Arbitrum、Optimism</div><div class="eb">损失约 360 万美元</div></div>`;

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #cardA { left: ${CA.x}px; top: ${CA.y}px; width: ${CA.w}px; }
    #cardB { left: ${CB.x}px; top: ${CB.y}px; width: ${CB.w}px; }
    #cardC { left: ${CC.x}px; top: ${CC.y}px; width: ${CC.w}px; }
    .k-code .c-row { font-size: 28px; font-variant-ligatures: none; }
    .k-code .chip { position: absolute; right: -14px; top: 7px; height: 36px; line-height: 34px; font-family: "Noto Sans SC", sans-serif; font-size: 28px; font-weight: 800; color: #fff; background: #1d93ba; border-radius: 9px; padding: 0 12px; }
    .k-code .chip-r { background: #ffffff; color: #c3352b; border: 3px solid #e0453a; line-height: 30px; }
    .k-code .c-row.dim { color: #b5afa3; }
    .ledger { width: 360px; background: #fffdf8; border-radius: 16px; padding: 10px 20px 14px; box-shadow: 0 12px 26px rgba(70,60,40,0.14); position: relative; }
    .ledger .lh { font-size: 28px; font-weight: 900; color: #6d685e; margin-bottom: 4px; }
    .ledger .lr { display: flex; align-items: center; height: 56px; border-radius: 10px; padding: 0 10px; position: relative; }
    .ledger .lk { width: 150px; font-size: 30px; font-weight: 800; }
    .ledger .lv { position: relative; font-size: 34px; font-weight: 900; font-family: "JetBrains Mono", monospace; }
    .ledger .lv b { position: absolute; left: 0; top: -24px; white-space: nowrap; font-weight: 900; }
    .ledger .lv b.gray { color: #8a8478; font-family: "Noto Sans SC", sans-serif; font-size: 30px; }
    .ledger .lv b.red { color: #e0453a; }
    .ledger .lv b:not(.gray):not(.red) { font-family: "Noto Sans SC", sans-serif; font-size: 30px; }
    .ledger .tg { position: absolute; right: 8px; background: #e0453a; color: #fff; font-size: 28px; font-weight: 900; border-radius: 9px; padding: 0 10px 2px; }
    .rcard { width: 330px; background: #fffdf8; border-radius: 16px; padding: 10px 18px 14px; box-shadow: 0 12px 26px rgba(70,60,40,0.14); position: relative; }
    .rcard .rh { font-size: 28px; font-weight: 900; color: #6d685e; }
    .rcard .rr { display: flex; align-items: center; height: 50px; gap: 12px; position: relative; }
    .rcard .rk { width: 70px; font-size: 30px; font-weight: 800; }
    .rcard .rb { width: 210px; height: 24px; background: #ece7dd; border-radius: 12px; overflow: hidden; }
    .rcard .rb i { display: block; width: 100%; height: 100%; background: #1d93ba; border-radius: 12px; transform-origin: 0 50%; }
    .rcard .rt { position: absolute; right: -96px; background: #e0453a; color: #fff; font-size: 28px; font-weight: 900; border-radius: 9px; padding: 0 10px 2px; white-space: nowrap; }
    .rcard .rok { position: absolute; right: -150px; top: 52px; background: #1f9d55; color: #fff; font-size: 28px; font-weight: 900; border-radius: 9px; padding: 0 10px 2px; white-space: nowrap; }
    .evcard { position: absolute; width: 700px; background: #fffdf8; border-radius: 18px; padding: 16px 24px 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.14); border-left: 10px solid #e0453a; }
    .evcard .eh { display: flex; align-items: center; gap: 14px; font-size: 40px; font-weight: 900; white-space: nowrap; }
    .evcard .src { margin-left: auto; font-size: 28px; font-weight: 700; color: #6d685e; border: 2px solid #cfc7b8; border-radius: 10px; padding: 0 10px 2px; }
    .evcard .eb { margin-top: 6px; font-size: 32px; font-weight: 700; white-space: nowrap; }
    .evcard .ec { margin-top: 6px; font-size: 28px; font-weight: 700; color: #c3352b; white-space: nowrap; }
    #evFei { left: 60px; top: 560px; }
    #evDf { left: 1160px; top: 712px; }
    #kw { position: absolute; left: 60px; top: 60px; }
    .tcard { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
      padding: 14px 26px 18px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); z-index: 5; }
    .tcard .t1 { font-size: 32px; font-weight: 900; white-space: nowrap; }
    .tcard .t2 { margin-top: 6px; font-size: 29px; font-weight: 700; color: #3d3a35; white-space: nowrap; }
    .tcard .t1 code, .tcard .t2 code { font-family: "JetBrains Mono", monospace; font-weight: 800; }
    .scr-layer { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; overflow: visible; pointer-events: none; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        ${worldLines}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <svg class="scr-layer" id="scr" data-layout-ignore viewBox="0 0 1920 1080" width="1920" height="1080">${dA.svg}${dB.svg}${dC.svg}</svg>
      ${cardA}${cardB}${cardC}${evFei}${evDf}
      <div class="tcard hide" id="tc1"><div class="t1">gas</div><div class="t2">执行每一步操作要付的计算费用</div></div>
      <div class="tcard hide" id="tc2" style="top:380px"><div class="t1">重入锁</div><div class="t2">函数执行期间 · 禁止再次进入</div></div>
      <div class="tcard hide" id="tc3"><div class="t1">AMM</div><div class="t2">自动做市商 · 按池中储备自动报价</div></div>
      <div class="tcard hide" id="tc4"><div class="t1"><code>view</code> 函数</div><div class="t2">只读取、不修改状态的函数</div></div>
      ${pills(3, { sections: SCRIPT.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">③ 四种重入</div><div class="t-sub">单函数 · 跨函数 · 跨合约 · 只读</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E2.runtimeExtJs()}
${E3.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const term = (id, t0, t1) => { KIT.pop(tl, "#" + id, t0, 0.3); tl.to("#" + id, { opacity: 0, duration: 0.25, ease: "power2.in" }, t1); };
      const op = (sel, t, to, d) => KITX03.fade(tl, sel, t, to, d);
      const slideIn = (sel, t) => tl.fromTo(sel, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out", immediateRender: false }, t);
      const slideOut = (sel, t) => tl.to(sel, { opacity: 0, x: -40, duration: 0.3, ease: "power2.in" }, t);
      const fly = (id, from, to, t, d, liftH) => { KITX03.fly(tl, id, t, to[0] - from[0], to[1] - from[1], d || 0.6, liftH || 60); };
      const plate = (i, t) => { op("#plL" + i + "w", t, 1, 0.3); };
      const unplate = (i, t) => { op("#plL" + i + "w", t, 0, 0.3); };
      KIT.camSet(tl, CAMS.over);
      const hideG = (id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); };
      ["ru", "gas", "atk3", "cb3", "atk4", "cb4"].forEach(hideG);
      ["#cn0", "#cn1", "#cn2", "#cn3", "#cn4"].forEach((s) => tl.set(s, { opacity: 0 }, 0));

      // ===== 0–1.6 title card → flies into the pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.2);

      // ===== L0 overview: Bank street; the call stack; four plates light one by one
      pop("#lb-bank", 1.7); pop("#lb-stack", ${f(TM.stack0)});
      [0, 1, 2, 3].forEach((i) => { pop("#lb-pl" + i, ${f(TM.stack0 + 0.5)} + i * 0.2); op("#plL" + i + "w", ${f(TM.stack0 + 0.5)} + i * 0.2, 1, 0.15); op("#plL" + i + "w", ${f(TM.stack0 + 0.75)} + i * 0.2, 0, 0.3); });

      // ===== L1 single-function: camera to the Bank
      KIT.cam(tl, ${f(TM.s1 - 0.2)}, CAMS.z1, 1.3);
      [0, 1, 2, 3].forEach((i) => out("#lb-pl" + i, ${f(TM.s1 - 0.2)}, 0.2));
      out("#lb-bank", ${f(TM.s1 - 0.2)}, 0.2);
      plate(0, ${f(TM.sf1)});
      pop("#lb-atk", ${f(TM.sf1 + 0.4)}); pop("#lb-rc", ${f(TM.sf1 + 0.6)});

      // ===== L2 card A, three steps
      slideIn("#cardA", ${f(TM.s2)});
      out("#lb-stack", ${f(TM.s2)}, 0.2);
      pop("#ch1", ${f(TM.rd2)}); pop("#ch2", ${f(TM.tr2)}); pop("#ch3", ${f(TM.cl2)});
      [["ca1", ${f(TM.rd2)}], ["ca2", ${f(TM.tr2)}], ["ca3", ${f(TM.cl2)}]].forEach(([r, t]) => { op("#" + r + "-bar", t, 1, 0.15); op("#" + r + "-bar", t + 0.9, 0, 0.2); });

      // ===== L3 attacker calls withdraw → tray #1; reads 1; call sends the coin
      KITX04.armPress(tl, "cb", ${f(TM.call3 - 0.5)}, { target: ${JSON.stringify(BTN[0])} });
      KITX01.press(tl, "vm", 0, ${f(TM.call3 - 0.05)}, "red", 0.4);
      KITX03.push(tl, "fs", 0, ${f(TM.call3 + 0.2)}); pop("#lb-t0", ${f(TM.call3 + 0.4)});
      KIT.draw(tl, "dR", ${f(TM.read3)}, 0.5); pop("#lb-r0", ${f(TM.read3 + 0.4)});
      op("#ca1-bar", ${f(TM.read3)}, 1, 0.15);
      op("#ca1-bar", ${f(TM.callw3 - 0.1)}, 0, 0.15); op("#ca2-bar", ${f(TM.callw3 - 0.1)}, 1, 0.15);
      KIT.draw(tl, "dA", ${f(TM.callw3)}, 0.5);
      KITX01.gears(tl, "vm", ${f(TM.callw3)}, 1.0, 1);
      fadeIn("#cn0", ${f(TM.go3 - 0.1)}, 0.1);
      fly("cn0", ${JSON.stringify(coins[0].anchors.c)}, ${JSON.stringify(A.cb.pan)}, ${f(TM.go3)}, 0.7, 70);
      out("#cn0", ${f(TM.go3 + 0.7)}, 0.05); op("#cb-coin", ${f(TM.go3 + 0.68)}, 1, 0.05);

      // ===== L4 receive fires → arm presses withdraw again → tray #2
      out("#dA", ${f(L(4).start - 0.1)}, 0.25); op("#ca2-bar", ${f(L(4).start - 0.1)}, 0, 0.2);
      slideIn("#cardB", ${f(TM.recv4 - 0.2)});
      pop("#lb-recv", ${f(TM.recv4)});
      KIT.draw(tl, "dB", ${f(TM.trig4)}, 0.5);
      op("#cbr1-bar", ${f(TM.money4)}, 1, 0.15); op("#cbr1-bar", ${f(TM.again4)}, 0, 0.15); op("#cbr2-bar", ${f(TM.again4)}, 1, 0.15);
      op("#cb-coin", ${f(TM.again4 - 0.3)}, 0, 0.2);
      KITX04.armPress(tl, "cb", ${f(TM.again4 - 0.2)}, { target: ${JSON.stringify(BTN[0])} });
      KITX01.press(tl, "vm", 0, ${f(TM.again4 + 0.25)}, "red", 0.4);
      KITX03.push(tl, "fs", 1, ${f(TM.again4 + 0.45)}); pop("#lb-t1", ${f(TM.again4 + 0.65)});

      // ===== L5 the second layer reads 1 again; step ③ has not run (key frame)
      out("#dB", ${f(L(5).start - 0.1)}, 0.25); op("#cbr2-bar", ${f(L(5).start - 0.1)}, 0, 0.2);
      KIT.draw(tl, "dR2", ${f(TM.l2_5)}, 0.5);
      pop("#lb-r1", ${f(TM.still5)});
      tl.to("#ca3", { color: "#b5afa3", duration: 0.3 }, ${f(TM.l1_5)});
      KIT.swap(tl, "#ch3", "#ch3b", ${f(TM.not5)}, 0.25);
      out("#dR", ${f(L(6).start - 0.2)}, 0.25); out("#dR2", ${f(L(6).start - 0.2)}, 0.25);

      // ===== L6 nesting until the vault is short
      out("#lb-r0, #lb-r1", ${f(TM.nest6 - 0.1)}, 0.2);
      const nestT = [${f(TM.nest6 - 0.05)}, ${f(TM.nest6 + 0.75)}, ${f(TM.nest6 + 1.55)}];
      nestT.forEach((t, k) => {
        KITX04.callArm(tl, "cb", t, 1, 0.25, { target: ${JSON.stringify(BTN[0])} });
        KITX04.callArm(tl, "cb", t + 0.35, 0.2, 0.25);
        KITX01.press(tl, "vm", 0, t + 0.22, "red", 0.25);
        KITX03.push(tl, "fs", k + 2, t + 0.3); pop("#lb-t" + (k + 2), t + 0.45);
        op("#vm-shelf-" + (2 - k), t + 0.35, 0, 0.3);
      });
      KITX04.callArm(tl, "cb", ${f(TM.nest6 + 2.3)}, 0, 0.3);
      pop("#lb-empty", ${f(TM.low6)});
      tl.to("#cbr1", { backgroundColor: "#fdeae7", duration: 0.25 }, ${f(TM.stop6 - 0.3)});

      // ===== L7 layers return top → bottom; each clears; money already gone
      out("#lb-empty", ${f(TM.ret7 - 0.2)}, 0.2);
      tl.to("#cbr1", { backgroundColor: "rgba(0,0,0,0)", duration: 0.25 }, ${f(TM.ret7 - 0.2)});
      [4, 3, 2, 1, 0].forEach((i, k) => {
        const t = ${f(TM.ret7)} + k * 0.42;
        KITX03.tip(tl, "fs", i, t, { dur: 0.4 });
        out("#lb-t" + i, t + 0.1, 0.2);
      });
      tl.to("#ca3", { color: "#1c1c1c", duration: 0.2 }, ${f(TM.clr7 - 0.2)});
      KIT.swap(tl, "#ch3b", "#ch3", ${f(TM.clr7 - 0.2)}, 0.2);
      op("#ca3-bar", ${f(TM.clr7)}, 1, 0.15);
      KIT.count(tl, "rc", ${f(TM.clr7)}, 0.5, 1, 0);
      pop("#lb-zero", ${f(TM.clr7 + 0.3)});
      pop("#lb-gone", ${f(TM.gone7)});

      // ===== L8 limits: depth 1024 and gas; take as much as possible per layer
      term("tc1", ${f(TM.gas8)}, ${f(TM.gas8 + 3.6)});
      out("#lb-gone, #lb-zero, #lb-recv, #lb-t0", ${f(L(8).start - 0.2)}, 0.2); op("#ca3-bar", ${f(L(8).start - 0.2)}, 0, 0.2);
      slideOut("#cardA", ${f(L(8).start - 0.2)}); slideOut("#cardB", ${f(L(8).start - 0.2)});
      KIT.cam(tl, ${f(L(8).start - 0.2)}, CAMS.z1b, 1.0);
      KIT.grow(tl, "ru", ${f(TM.lim8 - 0.2)}, 0.5); pop("#lb-ru", ${f(TM.d8 - 0.1)});
      KIT.grow(tl, "gas", ${f(TM.gas8 - 0.4)}, 0.5); pop("#lb-gas", ${f(TM.gas8)});
      KITX03.gauge(tl, "gas", ${f(TM.gas8 + 0.2)}, 0.05, 1.6, "steps(8)");
      pop("#lb-big", ${f(TM.big8)});
      tl.fromTo("#cb-coin", { scale: 1, svgOrigin: "${f(A.cb.pan[0])} ${f(A.cb.pan[1])}" }, { scale: 2.6, duration: 0.5, ease: "back.out(1.6)", immediateRender: false }, ${f(TM.big8 + 0.1)});
      op("#cb-coin", ${f(TM.big8 + 0.1)}, 1, 0.1);

      // ===== L9 cross-function: reset the Bank, close-up on the button panel
      unplate(0, ${f(TM.s9 - 0.3)});
      out("#lb-ru, #lb-gas, #lb-big, #lb-atk, #lb-rc", ${f(TM.s9 - 0.3)}, 0.2);
      ["ru", "gas"].forEach((id) => { const g = $(id); tl.to("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy"), duration: 0.35, ease: "power2.in" }, ${f(TM.s9 - 0.3)}); });
      op("#cb-coin", ${f(TM.s9 - 0.3)}, 0, 0.2);
      tl.to("#cb-coin", { scale: 1, duration: 0.01 }, ${f(TM.s9)});
      [0, 1, 2].forEach((k) => op("#vm-shelf-" + k, ${f(TM.s9 - 0.2)} + k * 0.1, 1, 0.3));
      KIT.count(tl, "rc", ${f(TM.s9)}, 0.4, 0, 1);
      KIT.cam(tl, ${f(TM.s9 - 0.3)}, CAMS.z2p, 1.2);
      plate(1, ${f(TM.cf9)});
      pop("#lb-b0", ${f(TM.cf9 + 0.5)}); pop("#lb-b1", ${f(TM.cf9 + 0.7)});

      // ===== L10 not withdraw again — another function sharing the balance
      KIT.cam(tl, ${f(L(10).start - 0.1)}, CAMS.z2, 1.1);
      out("#lb-pl1", ${f(L(10).start - 0.1)}, 0.2);
      slideIn("#cardC", ${f(TM.no10)});
      pop("#ledi", ${f(TM.sh10 - 0.2)});
      tl.to("#ledr0", { backgroundColor: "#e3f3f8", duration: 0.25 }, ${f(TM.sh10)});
      op("#cc1-bar", ${f(TM.tr10)}, 1, 0.15);
      KITX01.press(tl, "vm", 1, ${f(TM.tr10)}, "#1d93ba", 0.5);

      // ===== L11 withdraw has the lock, transfer does not
      term("tc2", ${f(w("重入锁", 11))}, ${f(w("重入锁", 11) + 3.6)});
      op("#h0w", ${f(TM.lk11 - 0.3)}, 1, 0.2);
      KITX04.hasp(tl, "h0", ${f(TM.lk11 - 0.1)}, true, 0.7);
      op("#cc0-bar", ${f(TM.lk11)}, 1, 0.15); op("#cc1-bar", ${f(TM.lk11)}, 0, 0.15);
      KIT.cam(tl, ${f(L(11).start - 0.2)}, CAMS.z2p, 0.9); op("#ledi", ${f(L(11).start - 0.2)}, 0, 0.2);
      KIT.swap(tl, "#lb-b0", "#lb-lock", ${f(TM.lk11 + 0.3)}, 0.25);
      op("#cc0-bar", ${f(TM.nl11)}, 0, 0.15); op("#cc2-bar", ${f(TM.nl11)}, 1, 0.15);
      KIT.swap(tl, "#lb-b1", "#lb-nolock", ${f(TM.nl11)}, 0.25);
      KIT.draw(tl, "dC", ${f(TM.nl11 + 0.1)}, 0.5);
      pop("#lb-q", ${f(TM.q11)});

      // ===== L12 yes: the lock only stops calls into the locked function
      out("#lb-q", ${f(TM.yes12)}, 0.2); out("#dC", ${f(TM.yes12 - 0.3)}, 0.25);
      KIT.cam(tl, ${f(TM.yes12 - 0.3)}, CAMS.z2, 0.9); op("#ledi", ${f(TM.yes12 + 0.5)}, 1, 0.3);
      KITX03.push(tl, "fs", 0, ${f(TM.yes12 - 0.3)}); pop("#lb-t0x", ${f(TM.yes12 - 0.1)});
      KITX04.armPress(tl, "cb", ${f(TM.yes12)}, { target: ${JSON.stringify(BTN[0])}, reach: 0.9, hold: 0.2 });
      KIT.swap(tl, "#lb-lock", "#lb-blk", ${f(TM.yes12 + 0.45)}, 0.2);
      KITX04.armPress(tl, "cb", ${f(TM.only12)}, { target: ${JSON.stringify(BTN[1])}, hold: 0.5 });
      KITX01.press(tl, "vm", 1, ${f(TM.only12 + 0.45)}, "red", 0.5);
      KIT.swap(tl, "#lb-nolock", "#lb-in", ${f(TM.only12 + 0.45)}, 0.2);
      op("#cc2-bar", ${f(TM.only12 + 0.4)}, 0, 0.15);

      // ===== L13 in the callback: move the uncleared balance to an accomplice; clear only after the outer call returns
      KITX03.push(tl, "fs", 1, ${f(TM.cb13)}); pop("#lb-t1x", ${f(TM.cb13 + 0.2)});
      op("#cc3-bar", ${f(TM.cb13)}, 1, 0.15);
      KIT.swap(tl, "#lv0a", "#lv0b", ${f(TM.to13 + 0.2)}, 0.2);
      KIT.swap(tl, "#lv1a", "#lv1b", ${f(TM.to13 + 0.4)}, 0.2);
      tl.to("#ledr0", { backgroundColor: "rgba(0,0,0,0)", duration: 0.25 }, ${f(TM.to13)});
      tl.to("#ledr1", { backgroundColor: "#fdeae7", duration: 0.25 }, ${f(TM.to13 + 0.4)});
      op("#cc3-bar", ${f(TM.out13 - 0.2)}, 0, 0.15);
      KITX03.tip(tl, "fs", 1, ${f(TM.out13)}, { dur: 0.4 }); out("#lb-t1x", ${f(TM.out13 + 0.1)}, 0.2);
      KITX03.tip(tl, "fs", 0, ${f(TM.clr13)}, { dur: 0.4 }); out("#lb-t0x", ${f(TM.clr13 + 0.1)}, 0.2);
      KIT.count(tl, "rc", ${f(TM.clr13 + 0.2)}, 0.4, 1, 0);

      // ===== L14 one coin, taken AND transferred
      op("#cb-coin", ${f(TM.take14 - 0.3)}, 1, 0.2);
      pop("#lb-out", ${f(TM.take14)});
      pop("#ledtg", ${f(TM.send14)});

      // ===== L15 Fei Rari
      out("#lb-out, #lb-blk, #lb-in", ${f(TM.y15 - 0.3)}, 0.2);
      slideOut("#cardC", ${f(TM.y15 - 0.3)});
      pop("#evFei", ${f(TM.y15)}, 0.3);

      // ===== L16 pool: borrow sends ETH first, writes the borrow record later
      unplate(1, ${f(TM.bor16 - 0.4)});
      out("#ledi", ${f(TM.bor16 - 0.4)}, 0.2);
      op("#cb-coin", ${f(TM.bor16 - 0.4)}, 0, 0.2);
      op("#poolw", ${f(TM.bor16 - 0.3)}, 1, 0.5);
      pop("#lb-b0f", ${f(TM.bor16)}); pop("#lb-b1f", ${f(TM.bor16 + 0.15)});
      pop("#led2i", ${f(TM.bor16 + 0.2)});
      KITX01.dispense(tl, "pool", ${f(TM.send16)}, { n: 1, dist: 1.2 });
      pop("#lb-fei1", ${f(TM.send16 + 0.2)});
      tl.to("#ledf0", { backgroundColor: "#fdeae7", duration: 0.25 }, ${f(TM.rec16)});
      [0, 1, 2].forEach((k) => fadeIn("#col" + k, ${f(TM.rec16 + 0.2)} + k * 0.1, 0.2));

      // ===== L17 callback → unlocked exitMarket → all collateral back
      out("#evFei", ${f(L(17).start - 0.1)}, 0.3);
      KITX04.armPress(tl, "cb", ${f(TM.cb17)}, { target: ${JSON.stringify(BTN[1])}, hold: 0.5 });
      KITX01.press(tl, "pool", 1, ${f(TM.exit17 - 0.3)}, "red", 0.5);
      [0, 1, 2].forEach((k) => fly("col" + k, ${JSON.stringify(col[0].anchors.c)}, ${JSON.stringify(A.atk.tray)}, ${f(TM.col17 - 0.3)} + k * 0.15, 0.7, 90));
      KIT.swap(tl, "#lf1a", "#lf1b", ${f(TM.col17)}, 0.2);
      tl.to("#ledf1", { backgroundColor: "#fdeae7", duration: 0.25 }, ${f(TM.col17)});
      pop("#lb-col", ${f(TM.col17 + 0.2)});

      // ===== L18 cross-contract corner
      out("#lb-col, #lb-fei1, #lb-b0f, #lb-b1f, #led2i", ${f(TM.s18 - 0.3)}, 0.2);
      KIT.cam(tl, ${f(TM.s18 - 0.3)}, CAMS.z3, 1.4);
      plate(2, ${f(TM.cc18)});
      KIT.grow(tl, "atk3", ${f(TM.cc18 + 0.3)}, 0.45); KIT.grow(tl, "cb3", ${f(TM.cc18 + 0.45)}, 0.45);

      // ===== L19 two contracts sharing state
      pop("#lb-mA", ${f(TM.vault19)}); pop("#lb-mB", ${f(TM.share19)});
      KITX01.dash(tl, "pAB-flow", ${f(TM.multi19)}, 4.0, 120); op("#pAB-flow", ${f(TM.multi19)}, 1, 0.3);
      pop("#lb-sh", ${f(TM.st19)});
      pop("#lb-atk3", ${f(TM.st19 + 0.6)});

      // ===== L20 A's lock does not stop a call into B; B reads A's half-written state
      out("#lb-pl2", ${f(L(20).start - 0.1)}, 0.2);
      op("#hAw", ${f(TM.lockA20 - 0.4)}, 1, 0.2);
      KITX04.hasp(tl, "hA", ${f(TM.lockA20 - 0.2)}, true, 0.7);
      pop("#lb-hA", ${f(TM.lockA20 + 0.3)});
      KITX04.armPress(tl, "cb3", ${f(TM.stop20 - 0.2)}, { target: ${JSON.stringify(slotB)}, hold: 1.4 });
      KITX03.slot(tl, "mB", ${f(TM.stop20 + 0.3)}, true);
      pop("#lb-hB", ${f(TM.stop20 + 0.3)});
      KITX03.spin(tl, "mB", ${f(TM.B20)}, 2.0, 1.5);
      out("#lb-sh", ${f(TM.read20 - 0.2)}, 0.2);
      KIT.draw(tl, "dS", ${f(TM.read20 - 0.1)}, 0.5);
      pop("#lb-old", ${f(TM.old20 - 0.2)});

      // ===== L21 read-only: to the third-party zone
      out("#lb-mA, #lb-mB, #lb-hA, #lb-hB, #lb-old, #lb-atk3, #dS", ${f(TM.s21 - 0.3)}, 0.2);
      unplate(2, ${f(TM.s21 - 0.3)});
      KIT.cam(tl, ${f(TM.s21 - 0.3)}, CAMS.z4, 1.5);
      plate(3, ${f(TM.ro21)});
      KIT.grow(tl, "atk4", ${f(TM.ro21 + 0.3)}, 0.45); KIT.grow(tl, "cb4", ${f(TM.ro21 + 0.45)}, 0.45);
      pop("#lb-hide", ${f(TM.hid21)});

      // ===== L22 attacker does not touch the target; a third party reads it
      out("#lb-pl3, #lb-hide", ${f(L(22).start)}, 0.2);
      pop("#lb-dex", ${f(TM.nomod22 - 0.4)}); pop("#lb-atk4", ${f(TM.nomod22 - 0.2)});
      pop("#lb-nomod", ${f(TM.nomod22)});
      pop("#lb-lend", ${f(TM.tp22)});
      KITX04.callArm(tl, "cb4", ${f(TM.read22 - 0.2)}, 0.5, 0.5, { target: ${JSON.stringify(orcBtn)} });

      // ===== L23 AMM removes liquidity: tokens out first, total updated later
      term("tc3", ${f(TM.amm23)}, ${f(TM.amm23 + 3.6)});
      KITX04.callArm(tl, "cb4", ${f(TM.amm23 - 0.2)}, 0, 0.4);
      out("#lb-nomod", ${f(TM.amm23)}, 0.2);
      pop("#rdi", ${f(TM.rm23 - 0.2)});
      KITX01.press(tl, "dex", 0, ${f(TM.rm23)}, "#1d93ba", 0.5);
      [0, 1, 2].forEach((k) => { fadeIn("#tk" + k, ${f(TM.out23 - 0.1)} + k * 0.12, 0.1); fly("tk" + k, ${JSON.stringify(tk4[0].anchors.c)}, ${JSON.stringify(A.cb4.pan)}, ${f(TM.out23)} + k * 0.12, 0.7, 80); out("#tk" + k, ${f(TM.out23 + 0.7)} + k * 0.12, 0.1); });
      op("#cb4-coin", ${f(TM.out23 + 0.75)}, 1, 0.1);
      tl.fromTo("#rbar0", { scaleX: 1 }, { scaleX: 0.55, duration: 0.6, ease: "power2.out", immediateRender: false }, ${f(TM.out23 + 0.3)});

      // ===== L24 at that moment: reserves down, total not yet
      pop("#rtag", ${f(TM.tot24)});
      tl.to("#rbar1", { backgroundColor: "#e0453a", duration: 0.25 }, ${f(TM.tot24)});

      // ===== L25 the lending protocol reads the pool's price → distorted → lends at the wrong price (key frame)
      KITX04.armPress(tl, "cb4", ${f(TM.lend25 - 0.4)}, { target: ${JSON.stringify(orcBtn)}, hold: 0.4 });
      KITX01.press(tl, "orc", 0, ${f(TM.lend25)}, "red", 0.4);
      KIT.draw(tl, "dP", ${f(TM.pf25 - 0.2)}, 0.6);
      KITX04.ghostOn(tl, "orc", ${f(TM.tw25 - 0.2)}, true);
      KITX04.ghostWobble(tl, "orc", ${f(TM.tw25)}, 1.4, 48, 8, 0.5);
      pop("#lb-ghost", ${f(TM.tw25 + 0.2)});
      KIT.door(tl, "lend", ${f(TM.loan25 - 0.3)}, 100, 0.8);
      [0, 1, 2].forEach((k) => { fadeIn("#rk" + k, ${f(TM.loan25 + 0.2)} + k * 0.15, 0.1); fly("rk" + k, ${JSON.stringify(rc4[0].anchors.c)}, ${JSON.stringify(A.atk4.tray)}, ${f(TM.loan25 + 0.25)} + k * 0.15, 0.9, 110); });
      pop("#lb-loan", ${f(TM.loan25 + 0.3)});

      // ===== L26 the pool ends up correct; the third party that read mid-way is wrong
      tl.to("#rbar1", { scaleX: 0.55, backgroundColor: "#1d93ba", duration: 0.6, ease: "power2.out" }, ${f(TM.ok26 - 0.3)});
      out("#rtag", ${f(TM.ok26 - 0.3)}, 0.2); pop("#rok", ${f(TM.ok26)});
      KIT.broke(tl, "lend", ${f(TM.err26)}, { ghost: 0.55 });
      KIT.swap(tl, "#lb-ghost", "#lb-wrong", ${f(TM.err26 + 0.1)}, 0.25);
      out("#dP", ${f(TM.err26)}, 0.3);

      // ===== L27 view functions are usually not locked
      term("tc4", ${f(TM.view27)}, ${f(Math.min(TM.view27 + 3.6, L(28).start - 0.1))});
      out("#lb-loan, #rdi", ${f(L(27).start - 0.1)}, 0.2);
      op("#hDw", ${f(TM.view27 - 0.3)}, 1, 0.2);
      pop("#lb-view", ${f(TM.view27)});
      KITX04.hasp(tl, "hD", ${f(TM.nl27 - 0.1)}, true, 0.5);
      KITX04.hasp(tl, "hD", ${f(TM.nl27 + 0.5)}, false, 0.4);
      op("#hDw", ${f(TM.nl27 + 0.9)}, 0.35, 0.3);
      KIT.swap(tl, "#lb-view", "#lb-vlock", ${f(TM.stop27)}, 0.25);

      // ===== L28 dForce
      out("#lb-wrong", ${f(TM.y28 - 0.2)}, 0.2);
      pop("#evDf", ${f(TM.y28)}, 0.3);

      // ===== L29 priced with Curve's virtual price during the callback
      pop("#lb-gvp", ${f(TM.vp29 - 0.3)});
      KITX04.ghostWobble(tl, "orc", ${f(TM.vp29)}, 1.0, 48, 6, 0.5);
      pop("#lb-lp", ${f(TM.col29)});
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL);
