// Generates compositions/story.html for ep04/seg2「② 交出控制权」(one isometric world, one camera).
// Run: node src/build-story.mjs
// Objects: kit + ep01/ep02/ep03/ep04 kit-ext (import only) + ./props.mjs. Layout: ./layout.mjs (Bank street from seg1).
import fs from "node:fs";
import { at, Wp, G, f, CE, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, CHECK, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { desk, coin, nftCard, lamp, lift } from "./props.mjs";
import * as L from "./layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = T.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const SECTIONS = SCRIPT.sections;
const LN = T.lines.map((_, i) => lineAt(T, i));
const LS = LN.map((l) => l.start);
const w = (term, line, nth = 0) => wordAt(T, term, { line, nth }).start;

// ---------------------------------------------------------------- objects
const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const A = {};
const W3 = (u, v, z = 0) => Wp(u, v, z);

// Bank
const vm = E1.vending(L.BANK, { id: "vm", sign: "BANK" }); A.vm = vm.anchors; add(L.BANK, vm.svg);
// call stack on the roof (seg1: scale 0.8 about the ground origin, lifted to BANK_TOP)
{
  const fs_ = E3.frameStack({ u: L.STACK.u, v: L.STACK.v }, { id: "fs", n: 3, labels: ["#1", "#2", "#3"], filled: 0 });
  const [ox, oy] = at(L.STACK), k = L.STACK.scale, dz = -L.STACK.z * CE;
  const tf = (p) => [ox + (p[0] - ox) * k, oy + (p[1] - oy) * k + dz];
  A.fs = { top: tf(fs_.anchors.top), trays: fs_.anchors.trays.map(tf), tabs: fs_.anchors.tabs.map(tf) };
  add(L.BANK, `<g transform="translate(0,${f(dz)}) translate(${f(ox)},${f(oy)}) scale(${k}) translate(${f(-ox)},${f(-oy)})">${fs_.svg}</g>`, 0.5);
}
// ledger desk (seg1)
const dk = desk("desk", L.DESK, L.DESK_TOP); add(L.DESK, dk.svg);
const lg = O.ledgerBook(L.LEDGER, { id: "ledger", scale: 0.55 }); add(L.DESK, lift(lg.svg, L.DESK_TOP), 0.1);
const rcn = E2.rollCounter(L.COUNTER, { id: "bal", digits: 1, value: 1, z: L.DESK_TOP }); A.bal = rcn.anchors; add(L.DESK, rcn.svg, 0.2);
// attacker contract + callback arm (seg1)
const atk = E1.miniVend(L.ATK, { id: "atk", kind: "attacker" }); A.atk = atk.anchors; add(L.ATK, atk.svg);
const arm = X.callbackArm(L.ARM, { id: "cb", target: A.vm.buttons[0], maxReach: 560 }); A.cb = arm.anchors; add(L.ARM, arm.svg);
// Bank → attacker pipe (external call)
const pAtk = E1.pipe(L.PIPE_ATK.o, { id: "pAtk", pts: L.PIPE_ATK.pts }); A.pAtk = pAtk.anchors; add(L.ATK, pAtk.svg, -1);
// premise plates
const plates = L.PLATE_XY.map((xy, i) => { const o = G(...xy); const s = E1.signBoard(o, { id: "pl" + i, style: "plate", text: "前提 " + (i + 1), size: 44 }); add(o, s.svg); return s.anchors; });

// metaphor: teller counter, customer, companion, magnifier, two lamps
const tc = X.tellerCounter(L.TELLER, { id: "tc", cash: 4, stock: 1 }); A.tc = tc.anchors; add(L.TELLER, tc.svg);
const oCu = G(...tc.anchors.customer), oCo = { u: oCu.u + 230, v: oCu.v };
const cu = O.person(oCu, { id: "cu", role: "signer" }); A.cu = cu.anchors; add(oCu, cu.svg);
const co = O.person(oCo, { id: "co", role: "signer" }); A.co = co.anchors; add(oCo, co.svg);
const oMag0 = { u: L.TELLER.u - 30, v: L.TELLER.v + 70 };
const magL = O.magnifier(oMag0, { id: "mag", z: 70 }).anchors.lens;
const oMag = (() => { const g0 = at(oMag0); return G(g0[0] + tc.anchors.ledger[0] - magL[0] + 30, g0[1] + tc.anchors.ledger[1] - magL[1] - 30); })();
const mag = O.magnifier(oMag, { id: "mag", z: 70 }); A.mag = mag.anchors; add(oMag, mag.svg, 400);
const oL1 = { u: L.TELLER.u - 120, v: L.TELLER.v - 30 }, oL2 = { u: L.TELLER.u + 110, v: L.TELLER.v - 30 };
add(oL1, lamp("lp1", oL1, 300), 300); add(oL2, lamp("lp2", oL2, 300), 300);

// six exits: manifold + branches + receivers
const M = L.MAN;
const man = E1.pipe({ u: M.u0, v: M.v0 }, { id: "man", pts: [[0, 0, M.z], [0, M.v - M.v0, M.z], [M.u1 - M.u0, M.v - M.v0, M.z]] }); add(L.BANK, man.svg, 1);
const EXO = L.EX_U.map((u) => ({ u, v: L.RCV_V }));
const br = L.EX_U.map((u, i) => { const end = i === 5 ? 760 : L.EX_V1; const p = E1.pipe({ u, v: M.v }, { id: "br" + i, pts: [[0, 0, M.z], [0, end - M.v, M.z]] }); add(EXO[i], p.svg, -2); return p.anchors; });
// receivers
const rc = [];
const mach = (o, id, name) => { const m = E3.contractMachine(o, { id, name }); add(o, m.svg); return m.anchors; };
rc[0] = mach(EXO[0], "rc0", "接收方");
{ const m = E1.miniVend(EXO[1], { id: "rc1", kind: "token", state: "attacker" }); add(EXO[1], m.svg); rc[1] = m.anchors; }
rc[2] = mach(EXO[2], "rc2", "接收方");
const oHk = { u: L.EX_U[2] - 150, v: L.RCV_V + 70 };
const hkTarget = at(EXO[2], -60, 40, 300);
const hk = X.callbackArm(oHk, { id: "hk", target: hkTarget, scale: 0.6 }); A.hk = hk.anchors; add(oHk, hk.svg);
rc[3] = mach(EXO[3], "rc3", "接收方");
{ const m = E1.flashDesk(EXO[4], { id: "rc4", gold: false }); add(EXO[4], m.svg); rc[4] = m.anchors; }
const oBo = { u: L.EX_U[4] + 30, v: L.RCV_V + 230 };
const bo = O.person(oBo, { id: "bo", role: "signer" }); A.bo = bo.anchors; add(oBo, bo.svg);
// exit 6 splits into three
const sp = E1.pipe({ u: L.EX_U[5] - 170, v: 760 }, { id: "sp", pts: [[0, 0, M.z], [340, 0, M.z]] }); add({ u: L.EX_U[5], v: 760 }, sp.svg, 0.5);
const six = [["dex", "路由器"], ["plain", "钩子"], ["oracle", "预言机"]].map(([kind], j) => {
  const o = { u: L.EX_U[5] - 170 + 170 * j, v: 900 };
  const d = E1.pipe({ u: o.u, v: 760 }, { id: "sd" + j, pts: [[0, 0, M.z], [0, 100, M.z]] }); add(o, d.svg, -2);
  const m = E1.miniVend(o, { id: "r6" + j, kind, scale: 0.8, needle: -20 }); add(o, m.svg); return m.anchors;
});

// chains · same code on three chains
const CHN = ["以太坊", "TRON", "Mantle"];
const ch = L.CH_U.map((u, i) => {
  const oc = { u, v: L.CH_V }, om = { u, v: L.CH_M }, os = { u: u - 250, v: L.CH_M + 40 };
  const c = O.chain(oc, { id: "ch" + i, n: 2 }); add(oc, c.svg);
  const m = E3.contractMachine(om, { id: "cm" + i, name: "合约" }); add(om, m.svg);
  const s = E1.signBoard(os, { id: "sg" + i, text: CHN[i], size: 44 }); add(os, s.svg);
  return { c: c.anchors, m: m.anchors, s: s.anchors, om };
});
items.sort((a, b) => a.y - b.y);

// ---------------------------------------------------------------- movers (drawn above everything)
const P0 = W3(L.PIPE_ATK.o.u, L.PIPE_ATK.o.v, 34);
const coinAt = (id, u, v, z, o) => ({ id, base: W3(u, v, z), svg: coin(id, { u, v }, z, o) });
const MOV = [];
const mv = (c) => { MOV.push(c); return c; };
const kc = mv(coinAt("kc", L.PIPE_ATK.o.u, L.PIPE_ATK.o.v, 40));
const exC = [0, 1, 2, 3, 5].map((i) => mv(coinAt("ec" + i, L.EX_U[i], i === 5 ? 760 : L.EX_V1, 40, { red: i === 1, teal: i === 1 || i === 2 })));
const nft = { id: "nft", base: W3(L.EX_U[3], L.EX_V1, 30), svg: nftCard("nft", { u: L.EX_U[3], v: L.EX_V1 }, 30) };
const envO = { u: L.EX_U[3] + 40, v: L.RCV_V + 150 };
const env = E1.letter(envO, { id: "env" });
// chain coins: start in front-left of each machine
const CC = {};
const chainCoin = (id, i, opts) => { const u = L.CH_U[i] - 300, v = L.CH_M + 330; CC[id] = { i, base: W3(u, v, 0) }; return coin(id, { u, v }, 0, opts); };
const chainCoins = chainCoin("cE", 0) + chainCoin("cT1", 1, { red: false }) + chainCoin("cT2", 1) + chainCoin("cM1", 2, { teal: true }) + chainCoin("cM2", 2);
const envT = E1.letter({ u: L.CH_U[1] - 360, v: L.CH_M + 330 }, { id: "envT" });
const movers = MOV.map((c) => c.svg).join("") + nft.svg + `<g id="env-mv" opacity="0">${env.svg}</g>` + chainCoins + `<g id="envT-mv" opacity="0">${envT.svg}</g>`;
const DL = (from, to) => [f(to[0] - from[0]), f(to[1] - from[1])];

const world = worldSvg("wsvg", gridSvg({ u0: -3200, u1: 5200, v0: -2600, v1: 3600 }) + items.map((x) => x.svg).join("\n") + movers, [-2600, -1900, 7000, 3800]);

// ---------------------------------------------------------------- labels (world)
let labels = "";
const lb = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, cls + " hide", a); };
const deskTop = W3(L.DESK.u, L.DESK.v, L.DESK_TOP + 130);
lb("lb-ledger", [deskTop[0] - 40, deskTop[1]], "账本 · 攻击者余额 <b>1</b>", "lab-cs");
lb("lb-old", [A.bal.window[0] - 70, A.bal.window[1] + 10], "旧值 1", "lab-rs", "r");
lb("lb-ext", at(L.ATK, 0, 0, 260), "外部地址", "lab-r");
lb("lb-ctl", P0, "控制权 → 外部地址", "lab-cs", "c");
lb("lb-t0", [A.fs.tabs[0][0] - 60, A.fs.tabs[0][1]], "withdraw #1 · 未结束", "lab-cs", "r");
lb("lb-t1", [A.fs.tabs[1][0] - 60, A.fs.tabs[1][1]], "withdraw #2 · 再次进入", "lab-rs", "r");
// metaphor
lb("lb-bal100", [A.tc.ledger[0] - 60, A.tc.ledger[1] - 160], "账本 · 余额 100", "lab-g");
lb("lb-penup", [A.tc.pen[0] + 150, A.tc.pen[1] - 150], "笔还悬着 · 没改账", "lab-g", "l");
lb("lb-teller", [A.tc.teller[0], A.tc.teller[1] - 40], "柜员", "lab-ink");
lb("lb-cu", A.cu.head.map((v, i) => v + (i ? -40 : 0)), "你", "lab-ink");
lb("lb-co", [A.co.head[0] + 70, A.co.head[1] - 70], "同伴：再取 100", "lab-ink", "l");
lb("lb-still", [A.mag.lens[0], A.mag.lens[1] - 70], "还是 100", "lab-r");
lb("lb-vault", [A.tc.stock[0] + 30, A.tc.stock[1]], "金库", "lab-g", "l");
lb("lb-empty", [A.tc.stock[0] + 30, A.tc.stock[1]], "金库见底", "lab-rs", "l");
const lampP = (o) => W3(o.u, o.v, 400);
lb("lb-both", [lampP(oL1)[0] - 50, lampP(oL1)[1] + 10], "现实：两个窗口同时接待", "lab-ink", "r");
// premises
lb("lb-p1", plates[0].top, "外部调用 · 对方受攻击者控制", "lab-cs", "b");
lb("lb-p2", [plates[1].board[0], plates[1].board[1] + 70], "状态还没更新到最终值", "lab-cs", "t");
lb("lb-xcall", [A.pAtk.mid[0] + 10, A.pAtk.mid[1] - 20], "外部调用", "", "b");
lb("lb-ctrl", at(L.ATK, 0, 70, 0), "受攻击者控制", "lab-rs", "t");
lb("lb-notfin", [A.bal.window[0] - 70, A.bal.window[1] + 10], "1 · 未到最终值", "lab-rs", "r");
// exits
L.EX_U.forEach((u, i) => { lb("lb-n" + i, W3(u, 730, M.z + 20), `<span class="gn">${i + 1}</span>`, "lab-ink", "b"); });
lb("lb-x0", rc[0].top, "receive / fallback", "lab-cs");
lb("lb-x1", rc[1].top, "攻击者部署的代币 · 代码任意", "lab-rs");
lb("lb-x2", [hkTarget[0], hkTarget[1] - 30], "tokensReceived", "lab-cs");
lb("lb-x3", rc[3].top, "onERC721Received", "lab-cs");
lb("lb-x4", rc[4].top, "设计上就是交出控制权", "lab-cs");
lb("lb-x4c", W3(L.EX_U[4], L.EX_V1, 60), "控制权", "lab-cs", "c");
lb("lb-x5", W3(L.EX_U[5] - 200, 700, 200), "任何用户提供的地址", "lab-cs");
["路由器", "钩子", "预言机"].forEach((t, j) => lb("lb-6" + j, W3(L.EX_U[5] - 170 + 170 * j, 900 + 70, 0), t, "", "t"));
lb("lb-tk1", W3(L.EX_U[1], L.EX_V1, 60), "transfer", "lab-sm", "t");
lb("lb-tk2", W3(L.EX_U[2], L.EX_V1, 60), "ERC-777", "lab-sm", "t");
lb("lb-tk3", W3(L.EX_U[3], L.EX_V1, 150), "NFT 安全转账 · 安全铸造", "lab-sm", "b");
lb("lb-tk0", W3(L.EX_U[0], L.EX_V1, 60), "call 转 ETH", "lab-sm", "t");
lb("lb-bo", A.bo.head.map((v, i) => v + (i ? -40 : 0)), "借款人", "lab-ink");
// chains
ch.forEach((c, i) => lb("lb-same" + i, c.m.top, "同一份代码", "lab-g"));
const cLab = (id, i, html, cls, row = 0) => { const p = W3(L.CH_U[i] + 150, L.CH_M + 150, 0); lb(id, [p[0], p[1] + row * 58], html, cls, "l"); };
cLab("lb-cE", 0, "转 ETH → 执行 receive", "lab-cs");
cLab("lb-cT1", 1, "TransferContract 转 TRX · 不执行 fallback", "lab-ink");
cLab("lb-cT2", 1, "TriggerSmartContract + callValue · 执行", "lab-cs", 1);
cLab("lb-cM1", 2, "ETH 是 ERC-20（BVM_ETH）· 不触发 receive", "lab-ink");
cLab("lb-cM2", 2, "原生币 MNT · 触发 receive", "lab-cs", 1);
// coin name tags (pop when the coin lands)
const coinTag = (id, key, txt, red) => { const b = CC[key].base; lb(id, [b[0], b[1] - 30], txt, red ? "lab-rs lab-sm" : "lab-ink lab-sm", "b"); };
coinTag("lb-ccE", "cE", "ETH"); coinTag("lb-ccT1", "cT1", "TRX"); coinTag("lb-ccM1", "cM1", "ETH（ERC-20）"); coinTag("lb-ccM2", "cM2", "MNT");
const gearOff = (id, i) => labels += wpin(id, [ch[i].m.top[0] + 110, ch[i].m.top[1] + 70], `<div class="nogo hide" id="${id}-i">齿轮不转</div>`, "c");
gearOff("ng1", 1); gearOff("ng2", 2);

// ---------------------------------------------------------------- cameras
const C = (u, v, z, k, sx = 960, sy = 540) => camAt(Wp(u, v, z), sx, sy, k);
const CAMS = {
  bank: camAt([-140, -67], 960, 500, 1.2),
  stack: camAt([0, -330], 1400, 560, 2.0),
  meta: C(L.TELLER.u, L.TELLER.v + 110, 150, 1.5, 960, 560),
  prem: camAt([-380, 40], 960, 560, 0.95),
  exits: camAt([1350, 20], 960, 560, 0.56),
  ex: L.EX_U.map((u, i) => C(u, L.RCV_V - (i === 5 ? 80 : 0), i === 5 ? 110 : 150, i === 5 ? 1.45 : 1.1, 960, 600)),
  chains: C(L.CH_U[1], L.CH_M - 100, 150, 0.75, 960, 560),
  tron: C(L.CH_U[1], L.CH_M + 60, 120, 1.05, 820, 540),
  mantle: C(L.CH_U[2], L.CH_M + 60, 120, 1.05, 820, 540),
};

// ---------------------------------------------------------------- screen overlays
const cmpCard = `<div class="ov hide" id="cmp" style="left:56px;top:272px;width:1040px">
  <div class="oh">EVM 单线程 · 不是并发 · 是嵌套</div>
  <div class="row" id="cmp-r0"><span class="rl">并发</span><div class="lanes"><div class="bar g" style="left:0;width:56%">取款 A</div><div class="bar g b2" style="left:30%;width:56%">取款 B</div></div><div class="strike" id="cmp-x"></div><span class="tag gr hide" id="cmp-no">不是这样</span></div>
  <div class="row" id="cmp-r1"><span class="rl">嵌套</span><div class="lanes"><div class="outer" id="cmp-out"><span class="seg">读余额 · 转账</span><div class="inner" id="cmp-in">withdraw #2 · 完整执行</div><span class="seg dim">清零</span></div></div></div>
</div>`;
const stepCard = `<div class="ov hide" id="step" style="left:56px;top:150px;width:760px">
  <div class="oh">withdraw #1 执行到哪了</div>
  <div class="st on" id="st0"><span class="sn">①</span>读余额 = 1</div>
  <div class="st cur" id="st1"><span class="sn">②</span>转账 → withdraw #2 整个在这里执行</div>
  <div class="st dimr" id="st2"><span class="sn">③</span>清零 · 还没执行</div>
</div>`;
// teal connector from the step card row ② to tray #2 (stack camera is static while it is drawn)
const S = (cam, p) => toScreen(CAMS[cam], p);
const ov = [];
const sc = (id, P0_, P3, o) => { const c = dashCurve(id, P0_, P3, o); ov.push(c.svg); return c; };
const rowY = 150 + 22 + 64 + 10 + 74 * 1 + 37;
const tr1 = S("stack", A.fs.trays[1]);
sc("cv-st", [816, rowY], tr1, { color: "#e0453a", c1: [960, rowY - 40], c2: [tr1[0] - 160, tr1[1] + 20] });
const ovSvg = `<svg id="ovl" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">${ov.join("")}</svg>`;

// ---------------------------------------------------------------- times
const TM = {
  def: w("定义", 0), ledger: w("账本", 1), ctl: w("控制权", 1), ext: w("外部地址", 1),
  old: w("旧的", 2), again: w("再次调用", 2),
  strict: w("严格来说", 3), notDone: w("还没执行完", 3), reenter: w("再次进入", 3),
  meta: w("打个比方", 4), bank4: w("银行", 4), h100: w("100", 4),
  give: w("递给你", 5), ledger5: w("改账本", 5),
  take: w("接过现金", 6), mate: w("同伴", 6), more: w("再取", 6),
  check: w("一查", 7), still: w("还是", 7), again7: w("又给了", 7),
  giveFirst: w("先给钱", 8), keep: w("一直取", 8), empty: w("见底", 8),
  fail: w("不成立", 9), same: w("同时接待", 9),
  evm: w("EVM", 10), conc: w("并发", 10), nest: w("嵌套", 10),
  second: w("第二次", 11), whole: w("整个", 11), mid: w("中间", 11),
  two: w("两个", 12),
  first: w("第一", 13), xcall: w("外部调用", 13), atkc: w("攻击者控制", 13),
  sec: w("第二", 14), state: w("状态", 14), fin: w("最终值", 14),
  ops: w("哪些操作", 15), six: w("六类", 15),
  call: w("call", 16), recv: w("receive", 16),
  tr: w("transfer", 17), dep: w("攻击者部署", 17), any: w("任意", 17),
  erc: w("ERC-777", 18), hook: w("钩子", 18),
  nft: w("NFT", 19), mint: w("安全铸造", 19), cb19: w("回调", 19),
  flash: w("闪电贷", 20), design: w("设计上", 20), borrower: w("借款人", 20),
  user: w("用户提供", 21), router: w("路由器", 21), hook21: w("钩子", 21), oracle: w("预言机", 21),
  chain: w("换一条链", 22), sameCode: w("同一份代码", 22), entry: w("回调入口", 22),
  tron: w("TRON", 23), trx: w("TRX", 23), noFb: w("不会执行", 23),
  cv: w("callValue", 24), exec: w("才会执行", 24),
  mantle: w("Mantle", 25), erc20: w("ERC-20", 25), noRecv: w("不触发", 25), mnt: w("MNT", 25), trig: w("才会触发", 25),
};

const MVD = {
  kc1: DL(kc.base, W3(L.PIPE_ATK.o.u, L.PIPE_ATK.o.v + 230, 40)),
  kc2: DL(kc.base, A.cb.pan),
  ctl1: DL(P0, W3(L.PIPE_ATK.o.u, L.PIPE_ATK.o.v + 230, 34)),
  ctl2: DL(P0, W3(L.PIPE_ATK.o.u - 300, L.PIPE_ATK.o.v + 230, 34)),
  ec0: DL(exC[0].base, rc[0].slot), ec1: DL(exC[1].base, rc[1].front), ec2: DL(exC[2].base, rc[2].slot), ec3: DL(exC[3].base, rc[3].slot),
  ec5: [0, 1, 2].map((j) => DL(exC[4].base, six[j].front)),
  nft: DL(nft.base, rc[3].slot),
  env: DL(at(envO), W3(L.EX_U[3] + 40, 760, 170)),
  ctl4: DL(W3(L.EX_U[4], L.EX_V1, 60), [A.bo.head[0], A.bo.head[1] - 20]),
  cE: DL(CC.cE.base, ch[0].m.slot), cT1: DL(CC.cT1.base, ch[1].m.front), cT2: DL(CC.cT2.base, ch[1].m.slot),
  envT: DL(at({ u: L.CH_U[1] - 360, v: L.CH_M + 330 }), ch[1].m.slot),
  cM1: DL(CC.cM1.base, ch[2].m.front), cM2: DL(CC.cM2.base, ch[2].m.slot),
};

const GROWN = ["pl0", "pl1", "tc", "cu", "co", "mag", "lp1", "lp2", "rc0", "rc1", "rc2", "hk", "rc3", "rc4", "bo", "r60", "r61", "r62", "ch0", "ch1", "ch2", "cm0", "cm1", "cm2", "sg0", "sg1", "sg2"];
const FADED = ["pAtk", "man", "br0", "br1", "br2", "br3", "br4", "br5", "sp", "sd0", "sd1", "sd2"];

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 84px; }
    .kw { position: absolute; left: 56px; top: 108px; font-size: 44px; font-weight: 900; color: #1c1c1c; background: #fffdf8; border-radius: 16px; padding: 10px 28px 14px;
      box-shadow: 0 10px 24px rgba(70,60,40,0.12); white-space: nowrap; }
    .kw b { color: #1d93ba; }
    .kw .gtag { display: inline-block; font-size: 30px; font-weight: 800; color: #6d685e; background: #ebe6dc; border-radius: 8px; padding: 2px 12px 4px; margin-right: 14px; vertical-align: 6px; }
    .ov { position: absolute; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); padding: 22px 28px 24px; }
    .ov .oh { font-size: 34px; font-weight: 900; height: 64px; line-height: 54px; border-bottom: 3px solid #1c1c1c; margin-bottom: 10px; white-space: nowrap; }
    .ov .row { position: relative; display: flex; align-items: center; height: 120px; gap: 22px; }
    .ov .rl { width: 90px; font-size: 36px; font-weight: 900; flex: none; }
    .ov .lanes { position: relative; width: 760px; height: 96px; }
    .ov .bar { position: absolute; height: 40px; line-height: 38px; border-radius: 8px; font-size: 28px; font-weight: 800; padding-left: 14px; white-space: nowrap; }
    .ov .bar.g { top: 2px; background: #e2ddd3; color: #6d685e; border: 2px solid #b8b0a1; }
    .ov .bar.b2 { top: 52px; }
    .ov .strike { position: absolute; left: 100px; top: 58px; width: 790px; height: 6px; background: #8a8478; border-radius: 3px; transform-origin: 0 50%; transform: scaleX(0); }
    .ov .tag { position: absolute; right: 0; top: 4px; font-size: 30px; font-weight: 900; border-radius: 8px; padding: 2px 12px 4px; }
    .ov .tag.gr { color: #6d685e; background: #ebe6dc; }
    .ov .outer { position: absolute; left: 0; top: 10px; width: 760px; height: 76px; border: 4px solid #1d93ba; border-radius: 10px; background: rgba(42,163,201,0.10);
      display: flex; align-items: center; gap: 12px; padding: 0 12px; transform-origin: 0 50%; }
    .ov .seg { font-size: 28px; font-weight: 800; color: #17809f; white-space: nowrap; }
    .ov .seg.dim { color: #8a8478; }
    .ov .inner { flex: 1; height: 50px; line-height: 46px; border: 4px solid #e0453a; border-radius: 8px; background: #fdeae7; color: #c3352b; font-size: 28px; font-weight: 900; text-align: center; white-space: nowrap; }
    .ov .st { height: 74px; line-height: 74px; font-size: 32px; font-weight: 800; white-space: nowrap; border-radius: 10px; padding: 0 14px; }
    .ov .st .sn { display: inline-block; width: 48px; }
    .ov .st.on { color: #1c1c1c; }
    .ov .st.cur { color: #c3352b; background: #fdeae7; }
    .ov .st.dimr { color: #8a8478; }
    .stamp { font-size: 40px; font-weight: 900; color: #6d685e; border: 6px solid #8a8478; border-radius: 12px; padding: 6px 26px 10px; transform: rotate(-6deg); background: rgba(255,253,248,0.9); white-space: nowrap; }
    .src { position: absolute; left: 56px; top: 200px; font-size: 28px; font-weight: 700; color: #6d685e; background: #fffdf8; border-radius: 10px; padding: 6px 16px 8px; white-space: nowrap; box-shadow: 0 6px 14px rgba(70,60,40,0.08); }
    .nogo { font-size: 28px; font-weight: 800; color: #6d685e; background: #fffdf8; border: 3px dashed #8a8478; border-radius: 10px; padding: 2px 12px 4px; white-space: nowrap; }
    .lab b { color: #ffffff; }
    .tcard { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
      padding: 14px 26px 18px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); z-index: 5; }
    .tcard .t1 { font-size: 32px; font-weight: 900; white-space: nowrap; }
    .tcard .t2 { margin-top: 6px; font-size: 29px; font-weight: 700; color: #3d3a35; white-space: nowrap; }
    .tcard .t1 code, .tcard .t2 code { font-family: "JetBrains Mono", monospace; font-weight: 800; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div class="kw hide" id="kw-def">一句话定义</div>
      <div class="kw hide" id="kw-strict">函数<b>未结束</b> · 被<b>再次进入</b></div>
      <div class="kw hide" id="kw-meta"><span class="gtag">比喻</span>银行柜台 · 取 100 元</div>
      <div class="kw hide" id="kw-prem">重入的前提 · 只有两个</div>
      <div class="kw hide" id="kw-ex">交出控制权的位置 · 共六类</div>
      <div class="kw hide" id="kw-ch">同一份代码 · 换条链 · 回调入口不同</div>
      <div class="tcard hide" id="tc1"><div class="t1">EVM</div><div class="t2">以太坊虚拟机 · 执行合约代码</div></div>
      <div class="tcard hide" id="tc2"><div class="t1"><code>call</code></div><div class="t2">最底层的调用方式 · 可同时转 ETH</div></div>
      <div class="tcard hide" id="tc3"><div class="t1">钩子</div><div class="t2">转账时自动执行的接收方函数</div></div>
      <div class="tcard hide" id="tc4"><div class="t1">闪电贷</div><div class="t2">同一笔交易内借出并归还的贷款</div></div>
      <div class="tcard hide" id="tc5"><div class="t1">预言机</div><div class="t2">把链外数据（如价格）送上链</div></div>
      <div class="tcard hide" id="tc6"><div class="t1">ERC-20</div><div class="t2">最常用的同质化代币标准</div></div>
      <div class="src hide" id="src-t">来源：TRON 官方文档</div>
      <div class="stamp hide" id="stamp-i" style="position:absolute;left:1180px;top:170px">比喻在这里不成立</div>
      ${cmpCard}${stepCard}${ovSvg}
      ${pills(2, { sections: SECTIONS })}
      <div class="k-title" id="ttl-card"><div class="t-main">② 交出控制权</div><div class="t-sub">一句话定义 · 两个前提 · 六类操作</div></div>
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
      const MV = ${JSON.stringify(MVD)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const X1 = window.KITX01, X3 = window.KITX03, X4 = window.KITX04;
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const term = (id, t0, t1) => { KIT.pop(tl, "#" + id, t0, 0.3); out("#" + id, t1, 0.25); };
      const fly = (id, t, d, dur, lift, ease) => X3.fly(tl, id, t, +d[0], +d[1], dur, lift, ease);
      const flash = (sel, t, n) => tl.fromTo(sel, { opacity: 1 }, { opacity: 0.25, duration: 0.18, yoyo: true, repeat: (n || 3) * 2 - 1, ease: "power1.inOut", immediateRender: false }, t);
      ${JSON.stringify(GROWN)}.forEach((id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); });
      ${JSON.stringify(FADED)}.forEach((id) => tl.set("#" + id, { opacity: 0 }, 0));
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      const show = (id, t, d) => tl.to("#" + id, { opacity: 1, duration: d || 0.35, ease: "power1.out" }, t);

      KIT.camSet(tl, CAMS.bank);
      // ===== 0–1.6 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.2);
      // ===== L0 one-line definition; the ledger still says 1
      pop("#kw-def", ${f(TM.def - 0.4)}, 0.3);
      pop("#lb-ledger", ${f(TM.def)}, 0.3);
      // ===== L1 before updating its ledger, the contract hands control to an external address
      out("#kw-def", ${f(LS[1] - 0.1)});
      flash("#lb-ledger", ${f(TM.ledger)}, 2);
      show("pAtk", ${f(TM.ledger + 0.6)}, 0.4);
      X1.press(tl, "vm", 0, ${f(TM.ctl - 0.5)}, "green", 0.3);
      fadeIn("#kc", ${f(TM.ctl - 0.2)}, 0.1);
      fly("kc", ${f(TM.ctl - 0.15)}, MV.kc1, 0.8, 0, "power1.inOut");
      fly("kc", ${f(TM.ctl + 0.65)}, MV.kc2, 0.9, 60, "power1.inOut");
      pop("#lb-ctl", ${f(TM.ctl - 0.1)}, 0.25);
      X3.fly(tl, "lb-ctl-pin", ${f(TM.ctl - 0.1)}, +MV.ctl1[0], +MV.ctl1[1], 0.8, 0, "power1.inOut");
      X3.fly(tl, "lb-ctl-pin", ${f(TM.ctl + 0.7)}, +MV.ctl2[0], +MV.ctl2[1], 0.8, 0, "power1.inOut");
      X1.dash(tl, "pAtk-flow", ${f(TM.ctl - 0.2)}, 1.8, 60);
      fadeIn("#pAtk-flow", ${f(TM.ctl - 0.2)}, 0.2);
      // ===== L2 while the ledger is stale, it calls the contract again
      flash("#lb-ledger", ${f(TM.old - 0.3)}, 1);
      pop("#lb-old", ${f(TM.old)}, 0.3); flash("#lb-old", ${f(TM.old + 0.3)}, 3);
      out("#lb-ctl, #pAtk-flow", ${f(TM.again - 0.5)}, 0.2);
      out("#kc", ${f(TM.again - 0.3)}, 0.15);
      X4.armPress(tl, "cb", ${f(TM.again - 0.3)}, { hold: 0.5 });
      X1.press(tl, "vm", 0, ${f(TM.again + 0.15)}, "red", 0.6);
      // ===== L3 strictly: a function not yet finished is entered again
      out("#lb-old, #lb-ext, #lb-ledger", ${f(LS[3] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[3] - 0.1)}, CAMS.stack, 1.1);
      pop("#kw-strict", ${f(TM.strict + 0.3)}, 0.3);
      X3.push(tl, "fs", 0, ${f(TM.strict + 0.6)});
      pop("#lb-t0", ${f(TM.notDone)}, 0.3);
      X3.push(tl, "fs", 1, ${f(TM.reenter - 0.3)});
      pop("#lb-t1", ${f(TM.reenter)}, 0.3);
      // ===== L4 metaphor: a bank teller; you withdraw 100
      out("#kw-strict, #lb-t0, #lb-t1", ${f(LS[4] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[4] - 0.1)}, CAMS.meta, 1.3);
      pop("#kw-meta", ${f(TM.meta)}, 0.3);
      grow("tc", ${f(TM.meta + 0.2)}, 0.5);
      grow("cu", ${f(TM.bank4)}, 0.45); pop("#lb-cu", ${f(TM.bank4 + 0.3)});
      pop("#lb-bal100", ${f(TM.h100)}, 0.3);
      // ===== L5 the teller hands over cash first, then updates the ledger
      pop("#lb-teller", ${f(LS[5])}, 0.25);
      X4.cashOut(tl, "tc", 0, ${f(TM.give - 0.4)}, 0.7);
      X4.stock(tl, "tc", ${f(TM.give - 0.4)}, 0.75, 0.6);
      pop("#lb-penup", ${f(TM.ledger5 - 0.2)}, 0.3);
      // ===== L6 at that instant your companion says: withdraw another 100
      grow("co", ${f(TM.mate - 0.2)}, 0.45);
      pop("#lb-co", ${f(TM.more - 0.3)}, 0.3);
      // ===== L7 the ledger still says 100 → pays again
      out("#lb-penup", ${f(LS[7])}, 0.2);
      grow("mag", ${f(TM.check - 0.2)}, 0.4);
      out("#lb-bal100", ${f(TM.still - 0.2)}, 0.15); pop("#lb-still", ${f(TM.still)}, 0.3);
      X4.cashOut(tl, "tc", 1, ${f(TM.again7 - 0.3)}, 0.7);
      X4.stock(tl, "tc", ${f(TM.again7 - 0.3)}, 0.5, 0.6);
      // ===== L8 until the vault runs dry
      out("#lb-still", ${f(LS[8])}, 0.2); out("#mag", ${f(LS[8])}, 0.25);
      pop("#lb-vault", ${f(LS[8] + 0.2)}, 0.3);
      X4.cashOut(tl, "tc", 2, ${f(TM.giveFirst)}, 0.7); X4.stock(tl, "tc", ${f(TM.giveFirst)}, 0.25, 0.6);
      X4.cashOut(tl, "tc", 3, ${f(TM.keep)}, 0.7); X4.stock(tl, "tc", ${f(TM.keep)}, 0.0, 1.2);
      KIT.swap(tl, "#lb-vault", "#lb-empty", ${f(TM.empty - 0.2)}, 0.25);
      // ===== L9 where it breaks: a real teller can serve two people at once
      pop("#stamp-i", ${f(TM.fail - 0.2)}, 0.3);
      grow("lp1", ${f(TM.same - 1.2)}, 0.4); grow("lp2", ${f(TM.same - 1.2)}, 0.4);
      fadeIn("#lp1-on, #lp2-on", ${f(TM.same - 0.2)}, 0.2);
      out("#kw-meta", ${f(TM.same - 0.3)}, 0.2); pop("#lb-both", ${f(TM.same)}, 0.3);
      // ===== L10 back to the Bank: single thread — nesting, not concurrency
      out("#stamp-i, #lb-both, #lb-co, #lb-cu, #lb-bal100, #lb-empty, #lb-teller", ${f(LS[10] - 0.1)}, 0.2);
      out("#tc, #cu, #co, #lp1, #lp2", ${f(LS[10] + 0.6)}, 0.3);
      KIT.cam(tl, ${f(LS[10] - 0.1)}, CAMS.stack, 1.3);
      pop("#cmp", ${f(TM.evm)}, 0.35);
      term("tc1", ${f(TM.evm)}, ${f(Math.min(TM.evm + 3.6, LS[11] - 0.4))});
      tl.fromTo("#cmp-x", { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.out", immediateRender: false }, ${f(TM.conc + 0.2)});
      pop("#cmp-no", ${f(TM.conc + 0.5)}, 0.25);
      tl.fromTo("#cmp-out", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.out", immediateRender: false }, ${f(TM.nest - 0.6)});
      pop("#cmp-in", ${f(TM.nest)}, 0.3);
      // ===== L11 the second withdrawal happens entirely inside the first (key frame)
      out("#cmp", ${f(LS[11] - 0.1)}, 0.2);
      pop("#step", ${f(TM.second + 0.1)}, 0.3);
      pop("#lb-t0", ${f(TM.second + 0.3)}, 0.25); pop("#lb-t1", ${f(TM.whole)}, 0.25);
      KIT.draw(tl, "cv-st", ${f(TM.whole + 0.1)}, 0.6);
      tl.fromTo("#st1", { scale: 1 }, { scale: 1.04, transformOrigin: "0% 50%", duration: 0.2, yoyo: true, repeat: 1, ease: "power1.inOut", immediateRender: false }, ${f(TM.mid)});
      // ===== L12 so: exactly two preconditions
      out("#step, #cv-st, #lb-t0, #lb-t1", ${f(LS[12] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[12] - 0.1)}, CAMS.prem, 1.2);
      pop("#kw-prem", ${f(LS[12] + 0.4)}, 0.3);
      grow("pl0", ${f(LS[12] + 0.5)}, 0.45); grow("pl1", ${f(LS[12] + 0.8)}, 0.45);
      // ===== L13 premise 1: an external call mid-function, to a party the attacker controls
      out("#kw-prem", ${f(LS[13] + 1.0)}, 0.2);
      pop("#lb-p1", ${f(TM.first)}, 0.3);
      fadeIn("#pAtk-flow", ${f(TM.xcall - 0.2)}, 0.2); X1.dash(tl, "pAtk-flow", ${f(TM.xcall - 0.2)}, 3.2, 110);
      pop("#lb-xcall", ${f(TM.xcall)}, 0.3);
      pop("#lb-ctrl", ${f(TM.atkc)}, 0.3);
      // ===== L14 premise 2: state not yet at its final value
      out("#pAtk-flow", ${f(LS[14])}, 0.2);
      pop("#lb-p2", ${f(TM.sec)}, 0.3);
      pop("#lb-notfin", ${f(TM.state)}, 0.3); flash("#lb-notfin", ${f(TM.fin - 0.4)}, 3);
      // ===== L15 six kinds of operations hand over control
      out("#lb-p1, #lb-p2, #lb-xcall, #lb-ctrl, #lb-notfin", ${f(LS[15] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[15] - 0.1)}, CAMS.exits, 1.4);
      pop("#kw-ex", ${f(TM.ops + 0.6)}, 0.3);
      show("man", ${f(TM.ops + 0.4)}, 0.5);
      [0, 1, 2, 3, 4, 5].forEach((i) => { show("br" + i, ${f(TM.ops + 0.9)} + i * 0.12, 0.3); pop("#lb-n" + i, ${f(TM.six - 0.5)} + i * 0.1, 0.25); });
      show("sp", ${f(TM.ops + 1.6)}, 0.3); [0, 1, 2].forEach((j) => show("sd" + j, ${f(TM.ops + 1.7)}, 0.3));
      // ===== L16 exit 1: call sends ETH → the receiver runs receive / fallback
      term("tc2", ${f(TM.call)}, ${f(TM.call + 3.6)});
      out("#kw-ex", ${f(LS[16] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[16] - 0.1)}, CAMS.ex[0], 1.0);
      grow("rc0", ${f(TM.call)}, 0.45); pop("#lb-tk0", ${f(TM.call + 0.2)}, 0.25);
      fadeIn("#ec0", ${f(TM.call + 0.5)}, 0.1); fly("ec0", ${f(TM.call + 0.55)}, MV.ec0, 0.9, 80); out("#ec0", ${f(TM.call + 1.45)}, 0.15);
      X3.spin(tl, "rc0", ${f(TM.recv - 0.6)}, 2.2, 2, "power1.inOut");
      pop("#lb-x0", ${f(TM.recv)}, 0.3);
      // ===== L17 exit 2: token transfer — an attacker-deployed token can run anything
      out("#lb-x0, #lb-tk0, #lb-n0", ${f(LS[17] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[17] - 0.1)}, CAMS.ex[1], 0.9);
      grow("rc1", ${f(TM.tr - 0.4)}, 0.45); pop("#lb-tk1", ${f(TM.tr)}, 0.25);
      fadeIn("#ec1", ${f(TM.tr + 0.3)}, 0.1); fly("ec1", ${f(TM.tr + 0.35)}, MV.ec1, 0.8, 60); out("#ec1", ${f(TM.tr + 1.15)}, 0.15);
      pop("#lb-x1", ${f(TM.dep)}, 0.3);
      // ===== L18 exit 3: ERC-777 transfer triggers the receiver's hook
      term("tc3", ${f(TM.hook)}, ${f(TM.hook + 3.6)});
      out("#lb-x1, #lb-tk1, #lb-n1", ${f(LS[18] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[18] - 0.1)}, CAMS.ex[2], 0.9);
      grow("rc2", ${f(TM.erc - 0.2)}, 0.45); grow("hk", ${f(TM.erc + 0.1)}, 0.4); pop("#lb-tk2", ${f(TM.erc + 0.2)}, 0.25);
      fadeIn("#ec2", ${f(TM.erc + 0.6)}, 0.1); fly("ec2", ${f(TM.erc + 0.65)}, MV.ec2, 0.8, 60); out("#ec2", ${f(TM.erc + 1.45)}, 0.15);
      X4.callArm(tl, "hk", ${f(TM.hook - 0.8)}, 1, 0.45, { ease: "back.out(1.8)" });
      pop("#lb-x2", ${f(TM.hook - 0.2)}, 0.3);
      // ===== L19 exit 4: NFT safe transfer / safe mint calls back the receiver
      out("#lb-x2, #lb-tk2, #lb-n2", ${f(LS[19] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[19] - 0.1)}, CAMS.ex[3], 0.9);
      grow("rc3", ${f(TM.nft - 0.2)}, 0.45); pop("#lb-tk3", ${f(TM.nft + 0.2)}, 0.25);
      fadeIn("#nft", ${f(TM.nft + 0.5)}, 0.15); fly("nft", ${f(TM.nft + 0.55)}, MV.nft, 1.0, 70); out("#nft", ${f(TM.nft + 1.55)}, 0.15);
      fadeIn("#env-mv", ${f(TM.cb19 - 0.3)}, 0.15); fly("env-mv", ${f(TM.cb19 - 0.25)}, MV.env, 0.9, 60, "power2.out"); out("#env-mv", ${f(TM.cb19 + 0.7)}, 0.2);
      X3.spin(tl, "rc3", ${f(TM.cb19 - 0.5)}, 1.4, 1.2, "power1.inOut");
      pop("#lb-x3", ${f(TM.cb19)}, 0.3);
      // ===== L20 exit 5: a flash-loan callback hands control to the borrower by design
      term("tc4", ${f(TM.flash)}, ${f(TM.flash + 3.6)});
      out("#lb-x3, #lb-tk3, #env-mv", ${f(LS[20] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[20] - 0.1)}, CAMS.ex[4], 0.9);
      grow("rc4", ${f(TM.flash - 0.1)}, 0.45); X1.pileIn(tl, "rc4", ${f(TM.flash + 0.4)});
      grow("bo", ${f(TM.flash + 0.6)}, 0.4); pop("#lb-bo", ${f(TM.flash + 0.9)}, 0.25);
      pop("#lb-x4c", ${f(TM.design - 0.4)}, 0.25);
      X3.fly(tl, "lb-x4c-pin", ${f(TM.design + 0.2)}, +MV.ctl4[0], +MV.ctl4[1], 1.1, 60, "power2.inOut");
      out("#lb-bo", ${f(TM.design + 0.2)}, 0.15);
      pop("#lb-x4", ${f(TM.borrower - 0.6)}, 0.3);
      // ===== L21 exit 6: any user-supplied address — router, hook, oracle
      term("tc5", ${f(TM.oracle)}, ${f(TM.oracle + 3.25)});
      out("#lb-x4, #lb-x4c, #bo", ${f(LS[21] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[21] - 0.1)}, CAMS.ex[5], 1.0);
      pop("#lb-x5", ${f(TM.user)}, 0.3);
      fadeIn("#ec5", ${f(TM.user + 0.4)}, 0.1); fly("ec5", ${f(TM.user + 0.45)}, [0, 0], 0.01);
      [["r60", "router"], ["r61", "hook21"], ["r62", "oracle"]].forEach(([id, k], j) => {
        const t = ${JSON.stringify({ router: TM.router, hook21: TM.hook21, oracle: TM.oracle })}[k];
        grow(id, t - 0.5, 0.4); pop("#lb-6" + j, t - 0.1, 0.25);
      });
      fly("ec5", ${f(TM.router - 0.2)}, MV.ec5[0], 0.6, 50); fly("ec5", ${f(TM.hook21 - 0.2)}, MV.ec5[1], 0.4, 50); fly("ec5", ${f(TM.oracle - 0.2)}, MV.ec5[2], 0.4, 50);
      out("#ec5", ${f(TM.oracle + 0.3)}, 0.15);
      // ===== L22 a different chain, a different callback entry — same code
      out("#lb-x0, #lb-x1, #lb-x2, #lb-x3, #lb-x4, #lb-x4c, #lb-x5, #lb-60, #lb-61, #lb-62, #lb-tk0, #lb-tk1, #lb-tk2, #lb-tk3", ${f(LS[22] - 0.1)}, 0.2);
      [0, 1, 2, 3, 4, 5].forEach((i) => out("#lb-n" + i, ${f(LS[22] - 0.1)}, 0.2));
      KIT.cam(tl, ${f(LS[22] - 0.1)}, CAMS.chains, 1.6);
      pop("#kw-ch", ${f(TM.oracle + 3.3)}, 0.3);
      [0, 1, 2].forEach((i) => { grow("ch" + i, ${f(LS[22] + 0.6)} + i * 0.15, 0.45); grow("sg" + i, ${f(TM.chain)} + i * 0.2, 0.45); grow("cm" + i, ${f(TM.sameCode)} + i * 0.12, 0.45); pop("#lb-same" + i, ${f(TM.sameCode + 0.5)} + i * 0.1, 0.25); });
      fadeIn("#cE", ${f(TM.entry - 0.6)}, 0.15); pop("#lb-ccE", ${f(TM.entry - 0.6)}, 0.2);
      fly("cE", ${f(TM.entry - 0.3)}, MV.cE, 0.7, 60); out("#cE", ${f(TM.entry + 0.4)}, 0.15); out("#lb-ccE", ${f(TM.entry + 0.2)}, 0.15);
      X3.spin(tl, "cm0", ${f(TM.entry + 0.3)}, 1.4, 1.2, "power1.inOut");
      pop("#lb-cE", ${f(TM.entry + 0.4)}, 0.3);
      // ===== L23 TRON: a system TransferContract does not run fallback
      out("#lb-same0, #lb-same1, #lb-same2, #kw-ch, #lb-cE", ${f(LS[23] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[23] - 0.1)}, CAMS.tron, 1.1);
      pop("#src-t", ${f(TM.tron)}, 0.3);
      fadeIn("#cT1", ${f(TM.trx - 0.6)}, 0.15); pop("#lb-ccT1", ${f(TM.trx - 0.4)}, 0.2);
      fly("cT1", ${f(TM.trx)}, MV.cT1, 0.8, 50); out("#lb-ccT1", ${f(TM.trx)}, 0.15);
      pop("#lb-cT1", ${f(TM.noFb - 0.2)}, 0.3); pop("#ng1-i", ${f(TM.noFb + 0.3)}, 0.25);
      // ===== L24 calling with callValue (TriggerSmartContract) does run it
      out("#cT1, #ng1-i", ${f(LS[24] - 0.1)}, 0.2);
      tl.to("#lb-cT1", { opacity: 0.55, duration: 0.2 }, ${f(LS[24] - 0.1)});
      fadeIn("#envT-mv", ${f(TM.cv - 0.4)}, 0.15); fadeIn("#cT2", ${f(TM.cv - 0.4)}, 0.15);
      fly("envT-mv", ${f(TM.cv - 0.2)}, MV.envT, 0.9, 70); fly("cT2", ${f(TM.cv - 0.2)}, MV.cT2, 0.9, 70);
      out("#envT-mv, #cT2", ${f(TM.cv + 0.7)}, 0.15);
      X3.spin(tl, "cm1", ${f(TM.cv + 0.75)}, 2.2, 2, "power1.inOut");
      pop("#lb-cT2", ${f(TM.cv + 0.4)}, 0.3);
      // ===== L25 Mantle: ETH is an ERC-20 (no receive); native MNT does trigger it
      term("tc6", ${f(TM.erc20)}, ${f(TM.erc20 + 3.6)});
      out("#lb-cT1, #lb-cT2, #src-t", ${f(LS[25] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[25] - 0.1)}, CAMS.mantle, 1.1);
      fadeIn("#cM1", ${f(TM.erc20 - 0.6)}, 0.15); pop("#lb-ccM1", ${f(TM.erc20 - 0.5)}, 0.2);
      fly("cM1", ${f(TM.noRecv - 1.3)}, MV.cM1, 0.8, 50); out("#lb-ccM1", ${f(TM.noRecv - 1.3)}, 0.15);
      pop("#lb-cM1", ${f(TM.noRecv - 0.4)}, 0.3); pop("#ng2-i", ${f(TM.noRecv + 0.2)}, 0.25);
      out("#cM1, #ng2-i", ${f(TM.mnt - 1.0)}, 0.2);
      tl.to("#lb-cM1", { opacity: 0.55, duration: 0.2 }, ${f(TM.mnt - 1.0)});
      fadeIn("#cM2", ${f(TM.mnt - 0.8)}, 0.15); pop("#lb-ccM2", ${f(TM.mnt - 0.7)}, 0.2);
      fly("cM2", ${f(TM.mnt - 0.2)}, MV.cM2, 0.7, 60); out("#cM2", ${f(TM.mnt + 0.5)}, 0.15); out("#lb-ccM2", ${f(TM.mnt + 0.4)}, 0.15);
      X3.spin(tl, "cm2", ${f(TM.trig - 0.4)}, 1.2, 1.2, "power2.out");
      pop("#lb-cM2", ${f(TM.trig - 0.2)}, 0.3);
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes");
