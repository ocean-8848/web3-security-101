// Generates compositions/story.html for ep02/seg3「③ 熵不够」(one isometric world, one camera).
// Run: node src/build-story.mjs
import fs from "node:fs";
import { at, Wp, f, camAt, gridSvg, worldSvg, wlab, wpin, dashCurve, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as L from "./layout.mjs";
import { goldStack, coin, glowG, terminalScreen, extPage, sticker, wrench } from "./props.mjs";
import { termCss, termHtml, termJs } from "../../kit-ext/termcard.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const w = (term, line, o = {}) => wordAt(T, term, { line, ...o }).start;
const we = (term, line, o = {}) => wordAt(T, term, { line, ...o }).end;
const LS = (i) => lineAt(T, i).start;

// ================================================================ world layout (u, v) — see src/layout.mjs (aligned to seg2)
const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const P = (u, v) => ({ u, v });
const A = {};
const put = (fn, o, opts, wrapId, hidden) => { const r = fn(o, opts); A[opts.id] = r.anchors; add(o, wrapId ? `<g id="${wrapId}"${hidden ? ' opacity="0"' : ""}>${r.svg}</g>` : r.svg); return r; };
const liftP = (p, z) => [p[0], p[1] - z * Math.cos(Math.PI / 6)];
const off = (o, du, dv) => P(o.u + du, o.v + dv);

// ---- main line (seg2 layout)
L.BELTS.forEach(([u, len], i) => put(X.conveyor, P(u, 0), { id: "bt" + i, len, width: 110 }));
put(X.lottery, L.S.ent, { id: "lotA", glow: true }, "lotA-w");
put(X.prngCounter, L.S.ent, { id: "prng" }, "prng-w", true);
put(X.mnemonicPlate, L.S.mn, { id: "mn" });
put(X.seedJar, L.S.seed, { id: "sj" });
put(X.deriveTree, L.S.tree, { id: "tree" });
put(O.padlock, L.S.key, { id: "lock" });
// keys spilled behind the key station (one per PRNG notch)
const KP = [[-90, -170], [10, -190], [110, -210], [-50, -270], [50, -290], [150, -310], [-10, -370], [90, -390]];
KP.forEach(([du, dv], i) => put(O.key, off(L.S.key, du, dv), { id: "kp" + i }, "kpw" + i, true));
// signing branch (static here, seg4 works on it)
put(O.seal, L.SIGN.seal, { id: "sl" });
put(O.doc, L.SIGN.msg, { id: "msg", title: "消息" });
put(X.diceCup, L.SIGN.cup, { id: "cup" });
put(X.sigPaper, L.SIGN.out, { id: "sig" });
// chain + public vitrine with three addresses (+ gold in front of each)
const VIT = L.S.addr;
put(O.chain, L.CHAIN, { id: "chain", n: 3 });
let vin = "";
L.ADDR_IN.forEach((d, i) => { const r = X.addrPlate(off(VIT, d.du, d.dv), { id: "vp" + i, text: "地址 " + (i + 1) }); A["vp" + i] = r.anchors; vin += r.svg; });
L.ADDR_IN.forEach((d, i) => { vin += goldStack(off(VIT, d.du + 20, d.dv + 85), { id: "vg" + i }).svg; });
put(X.vitrine, VIT, { id: "vit", w: L.VIT.w, d: L.VIT.d, h: L.VIT.h, inner: X.liftSvg(vin, X.VITRINE_FLOOR) });
// lotB (CSPRNG reference) for L5
put(X.lottery, P(-620, 300), { id: "lotB", glow: true });
// ---- attacker bench (seg2 positions): three GPU rigs, thief; plus counter and enumerated address row
const RIG = L.GPU[0];
L.GPU.forEach((o, i) => put(X.gpuRig, o, { id: i ? "gpu" + i : "gpu", cable: i === 0 ? "cut" : "none" }));
items.push({ y: at(RIG)[1] + 1, svg: X.liftSvg(X.prngCounter(RIG, { id: "pr2", window: "32 位" }).svg, 330) });
put(X.rollCounter, L.GPU[1], { id: "rc", digits: 10, value: 0, z: 332 });
put(O.person, L.THIEF, { id: "atk", role: "attacker" });
const EP = [0, 1, 2, 3, 4].map((i) => P(2300 + i * 150, 820 + i * 30));
EP.forEach((o, i) => put(X.addrPlate, o, { id: "ep" + i, text: "地址" }));
// ---- case areas, far in front of the line so each camera frames one case
const { C1, C2, C3, CL } = L;
const R = (b, du, dv) => P(b.u + du, b.v + dv);
// ---- case 1: Profanity
put(X.prngCounter, R(C1, 0, 0), { id: "pf", window: "32 位" });
put(O.safe, R(C1, 520, -40), { id: "wm", plate: "金库" });
put(O.hotWallet, R(C1, 900, -200), { id: "hv1" });
put(O.hotWallet, R(C1, 960, 140), { id: "hv2" });
// ---- case 2: Trust Wallet browser extension
const TW = { brw: R(C2, 0, -140), wx: R(C2, 0, 170), dial: R(C2, 480, -80) };
put(O.browserWin, TW.brw, { id: "brw", title: "浏览器扩展", page: extPage() });
items.push({ y: at(TW.wx)[1] - 2, svg: glowG("wx-gl", TW.wx, 230) });
{ const pa = X.prngCounter(TW.wx, { id: "wxp" }).svg, lb = X.lottery(TW.wx, { id: "wxl", size: "small", plate: "" }).svg;
  put(X.vitrine, TW.wx, { id: "wx", w: 300, d: 200, h: 250, plate: "WASM", inner: X.liftSvg(`<g id="wxp-w">${pa}</g><g id="wxl-w" opacity="0">${lb}</g>`, X.VITRINE_FLOOR) }); }
put(X.comboDial, TW.dial, { id: "d256", rings: 8 }, "d256-w");
put(X.comboDial, TW.dial, { id: "d32" }, "d32-w", true);
const TWW = [0, 1, 2, 3].map((i) => R(C2, 330 + i * 230, 430));
TWW.forEach((o, i) => put(O.hotWallet, o, { id: "tw" + i, gold: true }));
// ---- case 3: Milk Sad
const MS = { lap: R(C3, 0, -80), clk: R(C3, 290, -140), pr: R(C3, 550, -140), doc: R(C3, 1300, -260) };
put(O.laptop, MS.lap, { id: "msl", screen: terminalScreen("生成种子") });
put(O.clock, MS.clk, { id: "msc" });
put(X.prngCounter, MS.pr, { id: "msp", window: "32 位" });
put(O.doc, MS.doc, { id: "msd", title: "文档", standing: true, lines: ["", "", ""] });
const MSW = [0, 1, 2, 3, 4].map((i) => R(C3, -30 + i * 220, 360));
MSW.forEach((o, i) => put(O.hotWallet, o, { id: "mw" + i, gold: true }));
// ---- lessons
const LE = { wasm: R(CL, 0, 0), doc: R(CL, 520, -40), lock: R(CL, 760, 120), code: R(CL, 1250, -140) };
put(X.vitrine, LE.wasm, { id: "lw", w: 300, d: 200, h: 250, plate: "WASM · JS", inner: X.liftSvg(X.prngCounter(LE.wasm, { id: "lwp" }).svg, X.VITRINE_FLOOR) });
put(O.doc, LE.doc, { id: "ld", title: "文档", standing: true, lines: ["", "", ""] });
put(O.padlock, LE.lock, { id: "ll", glow: true });
put(O.doc, LE.code, { id: "lc", title: "代码", standing: true, lines: ["", "", "", ""] });
const OPL = [0, 1, 2].map((i) => R(CL, 1530 + i * 150, -120));
const NPL = [0, 1, 2].map((i) => R(CL, 1680 + i * 150, 230));
OPL.forEach((o, i) => put(X.addrPlate, o, { id: "op" + i, text: "旧地址", state: "attacker" }));
NPL.forEach((o, i) => put(X.addrPlate, o, { id: "np" + i, text: "新地址", glow: true }));

items.sort((a, b) => a.y - b.y);

// ---- flyers (drawn on top)
const VG2 = off(VIT, L.ADDR_IN[2].du + 20, L.ADDR_IN[2].dv + 85);
const gfly = goldStack(VG2, { id: "gfly", z: X.VITRINE_FLOOR });
const mag = O.magnifier(P(1500, 1150), { id: "mg", z: 170 }); A.mg = mag.anchors;
const lmag = O.magnifier(R(CL, 150, 220), { id: "lmg", z: 170 });
// coins: from tw1/tw3 (case 2) and all mw (case 3)
const coins = [];
const coinFrom = (o, id) => { const c = coin(P(o.u, o.v + 60), { id, z: 60 }); coins.push(c.svg); };
[1, 3].forEach((i) => [0, 1, 2].forEach((k) => coinFrom(TWW[i], `tc${i}-${k}`)));
[0, 1, 2, 3, 4].forEach((i) => [0, 1].forEach((k) => coinFrom(MSW[i], `mc${i}-${k}`)));
const envO = R(C2, -400, 290);
const env = O.envelope(envO, { id: "env" });

// ---- curves (world canvas)
const epTop = (i) => liftP(at(EP[i]), 150);
const vpTop = (i) => liftP(at(off(VIT, L.ADDR_IN[i].du, L.ADDR_IN[i].dv)), X.VITRINE_FLOOR + 150);
const cvMatch = dashCurve("cv-match", epTop(3), vpTop(2), { color: "#1d93ba", c1: [epTop(3)[0] + 60, epTop(3)[1] - 260], c2: [vpTop(2)[0] - 60, vpTop(2)[1] - 260] });
const gStart = at(VG2, 0, 0, X.VITRINE_FLOOR + 20), gEnd = liftP(at(off(L.THIEF, 60, 40)), 60);
const cvSteal = dashCurve("cv-steal", gStart, gEnd, { c1: [gStart[0] + 200, gStart[1] - 220], c2: [gEnd[0] - 300, gEnd[1] - 260] });
const clkP = A.msc.center, prP = A.msp.center;
const cvTime = dashCurve("cv-time", [clkP[0] + 70, clkP[1]], [prP[0] - 60, prP[1]], { color: "#1d93ba", c1: [clkP[0] + 120, clkP[1] - 90], c2: [prP[0] - 120, prP[1] - 90] });
const migr = [0, 1, 2].map((i) => { const a = liftP(at(OPL[i], 30, 50), 120), b = liftP(at(NPL[i], -20, -40), 150);
  return dashCurve("cv-mg" + i, a, b, { color: "#1f9d55", c1: [a[0] + 30, a[1] + 60], c2: [b[0] - 60, b[1] - 40] }); });
const world = worldSvg("wsvg", gridSvg({ u0: -1800, u1: 10600, v0: -1600, v1: 4400 }) + items.map((x) => x.svg).join("\n") +
  cvMatch.svg + cvSteal.svg + cvTime.svg + migr.map((m) => m.svg).join("") + `<g id="gfly-w" opacity="0">${gfly.svg}</g>` + coins.join("") +
  `<g id="env-w" opacity="0">${env.svg}</g>` + `<g id="mg-w" opacity="0">${mag.svg}</g>` + `<g id="lmg-w" opacity="0">${lmag.svg}</g>`, [-2400, -5000, 14000, 9000]);

// ================================================================ labels (world, counter-scaled)
let labels = "";
const stNames = ["① 熵源", "② 助记词", "③ 种子", "④ 分层派生", "⑤ 私钥", "⑥ 地址"];
const stTop = [A.prng.top, A.mn.top, A.sj.top, A.tree.top, A.lock.top, liftP(A.vit.top, 0)];
stNames.forEach((t, i) => { labels += wlab("ls" + i, stTop[i], t, "lab-sm hide"); });
labels += wlab("lb-prng", A.prng.top, "PRNG · mt19937 · 32 位种子", "lab-rs hide");
labels += wlab("lb-keys", liftP(at(off(L.S.key, 30, -280)), 110), "私钥 · 约 43 亿种", "lab-cs hide");
labels += wlab("lb-seeds", liftP(A.prng.top, -10), "种子 · 约 43 亿种", "hide", "t");
labels += wlab("lb-gpu", A.gpu.top, "GPU 枚举 · 离线", "lab-rs hide");
labels += wlab("lb-pr2", liftP(at(off(L.GPU[0], -140, 0)), 400), "同一个 32 位 PRNG", "lab-sm hide", "r");
labels += wlab("lb-ep", liftP(at(EP[2]), 210), "算出的地址", "lab-sm hide");
labels += wlab("lb-vit", liftP(at(VIT), 330), "链上有余额的地址 · 公开", "hide");
labels += wlab("lb-hit", liftP(at(off(EP[3], 0, 60)), 40), "命中", "lab-rs hide", "t");
labels += wlab("lb-steal", [gEnd[0] - 90, gEnd[1] - 40], "转走资产", "lab-rs hide", "r");
labels += wlab("lb-lotB", A.lotB.top, "CSPRNG · 操作系统 / 硬件 · 满 256 位", "lab-gs hide");
// case 1
labels += wlab("lb-pf", A.pf.top, "Profanity ≤1.60 · 32 位种子", "lab-cs hide");
labels += wlab("lb-wm", A.wm.top, "Wintermute 被盗", "lab-rs hide");
labels += wlab("lb-hv", [(A.hv1.top[0] + A.hv2.top[0]) / 2 + 60, A.hv1.top[1] - 10], "同期多个受害者", "lab-r hide");
// case 2
labels += wlab("lb-brw", A.brw.top, "Trust Wallet 浏览器扩展", "lab-cs hide");
labels += wlab("lb-wx", liftP(at(TW.wx, 0, 100), 0), "WASM 版 · mt19937", "lab-rs lab-sm hide", "t");
labels += wlab("lb-d256", A.d256.top, "熵 256 位", "hide");
labels += wlab("lb-d32", liftP(A.d32.top, 0), "→ 32 位", "lab-rs hide");
labels += wlab("lb-env", liftP(at(envO), 0), "Ledger 安全团队报告", "lab-sm hide");
labels += wlab("lb-fix", liftP(at(TW.wx, 0, 100), 0), "几天内修复", "lab-gs hide", "t");
labels += wlab("lb-tw", liftP(at(TWW[3], 140, 0), 260), "新建的扩展钱包 · 弱私钥", "lab-r lab-sm hide", "b");
labels += wlab("lb-170", liftP(at(TWW[3], 60, 0), 330), "约 17 万美元 · 承诺补偿", "lab-rs hide", "b");
labels += wlab("lb-170t", liftP(at(TWW[3], 60, 0), 330), "事发时估值", "lab-g lab-sm hide", "t");
// case 3
labels += wlab("lb-msl", A.msl.top, "生成种子的命令", "lab-cs hide");
labels += wlab("lb-msp", A.msp.top, "种子 = 32 位时间值", "lab-rs hide");
labels += wlab("lb-mw", liftP(at(MSW[4], 60, 0), 330), "至少约 90 万美元", "lab-rs hide", "b");
labels += wlab("lb-mwt", liftP(at(MSW[4], 60, 0), 330), "事发时估值", "lab-g lab-sm hide", "t");
labels += wpin("stk1", liftP(at(MS.doc), 150), sticker("stk1-s", "警告"), "c");
labels += wlab("lb-msd", A.msd.top, "厂商：文档早有警告", "hide");
labels += wlab("lb-msd2", liftP(A.msd.top, 70), "Libbitcoin 项目方称", "lab-g lab-sm hide");
// lessons
labels += wlab("lb-lw", A.lw.top, "替换随机源 → 单独审计", "lab-cs hide");
labels += wpin("stk2", liftP(at(LE.doc), 150), sticker("stk2-s", "警告"), "c");
labels += wlab("lb-ld", A.ld.top, "警告挡不住误用", "lab-r hide");
labels += wlab("lb-ll", A.ll.top, "接口默认安全", "lab-gs hide");
labels += wlab("lb-lc", A.lc.top, "代码已修复", "lab-gs hide");
labels += wpin("lc-ok", liftP(at(LE.code), 150), `<div class="okb" id="lc-ok-b"><svg width="40" height="32" viewBox="0 0 34 28"><path d="M3 15l9 9L31 4" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`, "c");
labels += wlab("lb-op", liftP(at(OPL[1]), 230), "已生成的弱私钥 · 修不好", "lab-rs hide");
labels += wlab("lb-np", liftP(at(NPL[1], 0, 80), 0), "迁移到新地址", "lab-gs hide", "t");
labels += wpin("wr", liftP(at(TW.wx), 300), wrench("wr-i"), "c");
const flyEnv = [at(TW.wx, -60, 120)[0] - at(envO)[0], liftP(at(TW.wx, -60, 120), 40)[1] - at(envO)[1]];

// ================================================================ cameras
const C = (u, v, z, k, sx = 960, sy = 540) => camAt(Wp(u, v, z), sx, sy, k);
const CC = (b, du, dv, z, k, sx = 1060, sy = 560) => C(b.u + du, b.v + dv, z, k, sx, sy);
const CAMS = {
  wide: camAt([1220, -520], 960, 540, 0.6),
  st1: C(0, 0, 70, 1.9, 760, 520),
  line: camAt([800, -420], 900, 540, 0.66),
  bench: camAt([2760, -700], 940, 560, 0.82),
  cmp: camAt([2480, -690], 960, 540, 0.62),
  csp: C(-420, 120, 150, 1.15, 860, 500),
  cases: CC(C1, 560, 0, 150, 0.7),
  c1: CC(C1, 480, -20, 150, 0.95),
  c2: CC(C2, 260, -20, 150, 0.9),
  c2b: CC(C2, 420, 230, 120, 0.82),
  c3: CC(C3, 330, -100, 140, 1.05),
  c3b: CC(C3, 420, 200, 120, 0.82),
  c3doc: CC(C3, 1250, -230, 150, 1.2, 1000, 520),
  l1: CC(CL, 30, 40, 150, 1.25, 960, 580),
  l2: CC(CL, 640, 40, 120, 1.15, 960, 580),
  l3: CC(CL, 1780, 40, 140, 1.1, 960, 580),
};

// ================================================================ times
const TM = {
  ent: w("熵不足", 0), four: w("四步", 0),
  s1: w("第一", 1), prng: w("伪随机数", 1), b32: w("32", 1), mt: w("MT", 1),
  s2: w("第二", 2), n43: w("43亿", 2), key: w("私钥", 2), n43b: w("43亿", 2, { nth: 1 }),
  s3: w("第三", 3), gpu: w("GPU", 3), enumr: w("枚举", 3), addr: w("地址", 3),
  s4: w("第四", 4), cmp: w("比对", 4), hit: w("命中", 4), take: w("转走", 4),
  look: w("看起来随机", 5), safe: w("不等于安全", 5), csp: w("CSPRNG", 5), b256: w("256", 5),
  three: w("三个案例", 6),
  pf: w("Profanity", 7), v160: w("1.60", 7), pf32: w("32", 7),
  y22: w("2022", 8), inch: w("1inch", 8), d5: w("5天后", 8), wm: w("Wintermute", 8), same: w("同期", 8),
  tw: w("TrustWallet", 9), wc: w("WalletCore", 9), wasm: w("WASM", 9), mt2: w("MT", 9), e256: w("256", 9), e32: w("32", 9),
  aff: w("受影响", 10), d14: w("14日", 10), ext: w("扩展钱包", 10), ledger: w("Ledger", 10), fix: w("修复", 10),
  stolen: w("被盗", 11), k17: w("17万", 11), comp: w("承诺补偿", 11),
  lib: w("LibbitcoinExplorer", 12), milk: w("MilkSad", 12), cmd: w("命令", 12), tval: w("时间值", 12),
  y23: w("2023", 13), mass: w("集中盗取", 13), k90: w("90万", 13),
  vend: w("厂商", 14), warn: w("警告", 14),
  les: w("教训", 15), wasm2: w("WASM", 15), audit: w("单独审计", 15),
  warn2: w("警告", 16), misuse: w("误用", 16), dflt: w("默认安全", 16),
  fixc: w("修好代码", 17), cant: w("修不好", 17), weak: w("弱私钥", 17), mig: w("迁移", 17), newa: w("新地址", 17),
};
const tm = Object.fromEntries(Object.entries(TM).map(([k, v]) => [k, f(v)]));
const LSa = T.lines.map((l) => f(l.start));

// ================================================================ screen HTML
const steps = ["小状态 PRNG", "约 43 亿种", "GPU 枚举", "链上比对"];
const stepHtml = `<div id="steps" class="hide">${steps.map((s, i) => `<div class="step" id="sp${i}"><span class="sn">${i + 1}</span>${s}</div>`).join(`<div class="sarr">→</div>`)}</div>`;
const cases = [["Profanity", "≤1.60 · 32 位种子"], ["Trust Wallet 扩展", "WASM · 32 位"], ["Milk Sad", "Libbitcoin Explorer"]];
const caseHtml = `<div id="cases" class="hide">${cases.map(([a, b], i) => `<div class="case" id="cs${i}"><div class="cfill" id="cf${i}"><div class="ca">案例${"一二三"[i]}</div><div class="cb">${a}</div><div class="cc">${b}</div></div></div>`).join("")}</div>`;
const lessons = ["替换随机源要单独审计", "接口必须默认安全", "修复后强制迁移"];
const lesHtml = `<div id="lessons">${lessons.map((s, i) => `<div class="les hide" id="le${i}"><span class="rn">教训${"一二三"[i]}</span>${s}</div>`).join("")}</div>`;
const kw = `<div class="kw hide" id="kw1">看起来随机 <b class="r">≠</b> 安全</div>`;
// calendars
const cal1 = `<div class="cal hide" id="cal1"><div class="cal-h">2022 年 9 月</div><div class="cal-pages">
  <div class="pg" id="pg0"><div class="pg-big">15 日</div><div class="pg-sub">1inch 公开披露</div></div>
  ${[1, 2, 3, 4, 5].map((d) => `<div class="pg" id="pg${d}" style="opacity:0"><div class="pg-big">+${d} 天</div><div class="pg-sub">${d === 5 ? "<span class='r'>Wintermute 被盗</span>" : "&nbsp;"}</div></div>`).join("")}
  </div></div>`;
const days = Array.from({ length: 14 }, (_, i) => 12 + i);
const cal2 = `<div class="cal2 hide" id="cal2"><div class="cal-h">2022 年 11 月 · 新建的扩展钱包</div><div class="dstrip">${days.map((d) => `<div class="dd${d >= 14 && d <= 23 ? " in" : ""}" id="dd${d}">${d}</div>`).join("")}</div><div class="drng hide" id="drng">14 日 – 23 日</div></div>`;
const cal3 = `<div class="cal hide" id="cal3"><div class="cal-h">2023 年 7 月</div><div class="cal-pages"><div class="pg"><div class="pg-big">12 日</div><div class="pg-sub"><span class="r">集中盗取</span></div></div></div></div>`;

// 术语卡（RETROFIT-deps 第 2 类）
const TERMS = [
  { id: "tc1", t1: "伪随机数生成器（PRNG）", t2: "输出由种子决定 · <code>mt19937</code> 就是一种", at: w("伪随机数", 1), dur: 3.8 },
  { id: "tc2", t1: "WASM", t2: "能在浏览器里运行的程序格式", at: w("WASM", 9), top: 184 },
];

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #steps { position: absolute; left: 56px; top: 30px; display: flex; align-items: center; gap: 10px; }
    .step { display: flex; align-items: center; gap: 10px; white-space: nowrap; font-size: 30px; font-weight: 800; padding: 6px 18px 8px; border-radius: 12px;
      background: #fffdf8; border: 3px dashed #cfc7b8; color: #7d776b; }
    .step .sn { display: inline-flex; width: 36px; height: 36px; border-radius: 50%; align-items: center; justify-content: center; font-size: 24px; background: #7d776b; color: #fff; }
    .sarr { font-size: 30px; font-weight: 900; color: #c9c1b2; }
    #cases { position: absolute; left: 56px; top: 30px; display: flex; gap: 14px; }
    .case { width: 340px; height: 132px; border-radius: 14px; border: 3px dashed #cfc7b8; background: rgba(255,253,248,0.6); position: relative; }
    .cfill { position: absolute; inset: -3px; border-radius: 14px; background: #fffdf8; border: 3px solid #1d93ba; padding: 8px 18px; opacity: 0; box-shadow: 0 8px 18px rgba(70,60,40,0.10); }
    .ca { font-size: 28px; font-weight: 800; color: #1d93ba; line-height: 1.1; }
    .cb { font-size: 32px; font-weight: 900; line-height: 1.25; white-space: nowrap; }
    .cc { font-size: 28px; font-weight: 700; color: #6d685e; white-space: nowrap; }
    #lessons { position: absolute; left: 56px; top: 30px; }
    .les { position: absolute; left: 0; top: 0; white-space: nowrap; font-size: 44px; font-weight: 900; }
    .les .rn { display: inline-block; margin-right: 16px; font-size: 32px; color: #fff; background: #1d93ba; border-radius: 10px; padding: 2px 14px 4px; vertical-align: 6px; }
    .kw { position: absolute; left: 1060px; top: 220px; white-space: nowrap; font-size: 52px; font-weight: 900; background: #fffdf8; border-radius: 16px;
      padding: 14px 34px 18px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
    .kw .r, .r { color: #e0453a; }
    .cal { position: absolute; left: 56px; top: 186px; width: 330px; background: #fffdf8; border-radius: 16px; box-shadow: 0 12px 26px rgba(70,60,40,0.14); overflow: hidden; }
    .cal-h { background: #e0453a; color: #fff; font-size: 30px; font-weight: 800; padding: 8px 20px; white-space: nowrap; }
    .cal-pages { position: relative; height: 150px; }
    .pg { position: absolute; inset: 0; text-align: center; padding-top: 12px; background: #fffdf8; }
    .pg-big { font-size: 64px; font-weight: 900; line-height: 1.1; font-variant-numeric: tabular-nums; }
    .pg-sub { font-size: 30px; font-weight: 800; color: #1c1c1c; white-space: nowrap; }
    .cal2 { position: absolute; left: 56px; top: 186px; background: #fffdf8; border-radius: 16px; box-shadow: 0 12px 26px rgba(70,60,40,0.14); overflow: hidden; }
    .cal2 .cal-h { background: #1c1c1c; }
    .dstrip { display: flex; gap: 6px; padding: 14px 16px 10px; }
    .dd { width: 50px; height: 50px; border-radius: 8px; background: #f1ede5; font-size: 28px; font-weight: 800; color: #6d685e; display: flex; align-items: center; justify-content: center; font-variant-numeric: tabular-nums; }
    .drng { font-size: 30px; font-weight: 900; color: #e0453a; padding: 0 18px 12px; }
    .stk { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; font-size: 30px; font-weight: 900; color: #c3352b; background: #fff4f2;
      border: 3px solid #e0453a; border-radius: 10px; padding: 4px 14px 6px; transform: rotate(-6deg); box-shadow: 0 6px 14px rgba(160,40,30,0.18); }
    .wrench, .stk { opacity: 0; }
    [id^=tc], [id^=mc] { opacity: 0; }
    .okb { width: 60px; height: 60px; border-radius: 50%; background: #1f9d55; border: 4px solid #fff; display: flex; align-items: center; justify-content: center; opacity: 0; box-shadow: 0 6px 14px rgba(20,110,60,0.25); }
${termCss}
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      ${stepHtml}
      ${caseHtml}
      ${lesHtml}
      ${kw}
      ${cal1}${cal2}${cal3}

      ${termHtml(TERMS)}      ${pills(3, { sections: SCRIPT.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">③ 熵不够</div><div class="t-sub">私钥空间被缩小</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const TM = ${JSON.stringify(tm)};
      const LS = ${JSON.stringify(LSa)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const org = (id) => $(id).getAttribute("data-ox") + " " + $(id).getAttribute("data-oy");
      const hideObj = (id) => tl.set("#" + id, { scaleY: 0, svgOrigin: org(id) }, 0);
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      const shrink = (id, t, d) => tl.to("#" + id, { scaleY: 0, svgOrigin: org(id), duration: d || 0.3, ease: "power2.in" }, t);
      const wire = (id, t, on) => tl.to("#" + id + "-wire", { opacity: on ? 1 : 0, duration: 0.3 }, t);
      const stepOn = (i, t) => tl.to("#sp" + i, { backgroundColor: "#1d93ba", borderColor: "#1d93ba", borderStyle: "solid", color: "#ffffff", duration: 0.3 }, t)
        && tl.to("#sp" + i + " .sn", { backgroundColor: "#ffffff", color: "#1d93ba", duration: 0.3 }, t);
      const caseOn = (i, t) => { KIT.pop(tl, "#cf" + i, t, 0.35); for (let j = 0; j < 3; j++) if (j !== i) tl.to("#cf" + j, { borderColor: "#cfc7b8", duration: 0.2 }, t); tl.to("#cf" + i, { borderColor: "#1d93ba", duration: 0.2 }, t + 0.36); };
      const flyTo = (sel, t, dx, dy, dur, ease) => tl.fromTo(sel, { x: 0, y: 0 }, { x: dx, y: dy, duration: dur, ease: ease || "power2.inOut", immediateRender: false }, t);
      const coinOut = (id, t, dx, dy) => { tl.fromTo("#" + id, { opacity: 0, x: 0, y: 0 }, { opacity: 1, duration: 0.1, immediateRender: false }, t);
        tl.to("#" + id, { keyframes: [{ x: dx * 0.5, y: dy * 0.5 - 90, duration: 0.45, ease: "power1.out" }, { x: dx, y: dy, duration: 0.45, ease: "power1.in" }] }, t + 0.05);
        tl.to("#" + id, { opacity: 0, duration: 0.25 }, t + 1.0); };
      // ---- initial state
      ["lotB", "gpu", "gpu1", "gpu2", "rc", "atk", "ep0", "ep1", "ep2", "ep3", "ep4", "pf", "wm", "hv1", "hv2", "brw", "wx", "d256", "d32",
       "tw0", "tw1", "tw2", "tw3", "msl", "msc", "msp", "msd", "mw0", "mw1", "mw2", "mw3", "mw4", "lw", "ld", "ll", "lc", "op0", "op1", "op2", "np0", "np1", "np2", "pr2"].forEach(hideObj);
            tl.set("#cf0, #cf1, #cf2", { opacity: 0 }, 0);
      KIT.camSet(tl, CAMS.wide);

      // ===== 0–1.6 title card → pill; line overview with station names
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.2);
      for (let i = 0; i < 6; i++) KIT.pop(tl, "#ls" + i, 0.3 + i * 0.08);
      for (let i = 0; i < 5; i++) KIT.belt(tl, "bt" + i, 0, 2.0, 160);
      KIT.drum(tl, "lotA", 0.2, 1.6, 1);
      // ===== L0 push to station ①, swap CSPRNG → small PRNG, red frame; empty 4-step bar
      KIT.cam(tl, 1.6, CAMS.st1, 1.4);
      for (let i = 1; i < 6; i++) out("#ls" + i, 1.7, 0.2);
      KIT.swap(tl, "#lotA-w", "#prng-w", TM.ent - 0.1, 0.35);
      wire("prng", TM.ent + 0.4, true);
      tl.to("#ls0", { backgroundColor: "#e0453a", borderColor: "#e0453a", color: "#ffffff", duration: 0.2 }, TM.ent + 0.4);
      fadeIn("#steps", TM.four - 0.2, 0.3);
      // ===== L1 step 1: small-state PRNG
      out("#ls0", LS[1] - 0.1);
      stepOn(0, TM.s1);
      KIT.tick(tl, "prng", TM.prng, 3, 1.2);
      KIT.pop(tl, "#lb-prng", TM.prng);
      KIT.tick(tl, "prng", TM.mt, 2, 0.8);
      // ===== L2 step 2: ~4.3 billion seeds → ~4.3 billion keys
      stepOn(1, TM.s2);
      KIT.cam(tl, LS[2] - 0.2, CAMS.line, 1.2);
      out("#lb-prng", LS[2] - 0.2);
      KIT.pop(tl, "#lb-seeds", TM.n43 - 0.1);
      KIT.tick(tl, "prng", TM.n43 + 0.2, 8, 3.2);
      for (let i = 0; i < 8; i++) tl.fromTo("#kpw" + i, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", immediateRender: false }, TM.n43 + 0.45 + i * 0.4);
      for (let i = 0; i < 5; i++) KIT.belt(tl, "bt" + i, TM.n43 + 0.2, 3.2, 300);
      KIT.pop(tl, "#lb-keys", TM.n43b - 0.2);
      // ===== L3 step 3: GPU enumerates offline
      stepOn(2, TM.s3);
      out("#lb-seeds, #lb-keys", LS[3] - 0.1);
      KIT.cam(tl, LS[3] - 0.2, CAMS.bench, 1.2);
      grow("gpu", LS[3]); grow("gpu1", LS[3] + 0.1); grow("gpu2", LS[3] + 0.2); grow("atk", LS[3] + 0.15); grow("pr2", LS[3] + 0.4); grow("rc", LS[3] + 0.5);
      KIT.pop(tl, "#lb-gpu", TM.gpu);
      KIT.fans(tl, "gpu", TM.gpu, 9.5, 4);
      KIT.tick(tl, "pr2", TM.enumr, 32, 4.5);
      KIT.pop(tl, "#lb-pr2", TM.enumr);
      KIT.count(tl, "rc", TM.enumr, 5.5, 0, 4294967295, "power2.in");
      for (let i = 0; i < 5; i++) grow("ep" + i, TM.addr - 0.6 + i * 0.22, 0.35);
      KIT.pop(tl, "#lb-ep", TM.addr + 0.6);
      // ===== L4 step 4: compare with funded addresses on chain → hit → assets out
      stepOn(3, TM.s4);
      KIT.cam(tl, LS[4] - 0.2, CAMS.cmp, 1.2);
      out("#lb-pr2, #lb-gpu", LS[4]);
      KIT.pop(tl, "#lb-vit", TM.s4 + 0.4);
      fadeIn("#mg-w", TM.cmp - 0.3, 0.2);
      tl.fromTo("#mg-w", { x: 0, y: 0 }, { keyframes: [{ x: 140, y: -50, duration: 0.5 }, { x: 280, y: -100, duration: 0.5 }, { x: 420, y: -150, duration: 0.5 }], ease: "power1.inOut", immediateRender: false }, TM.cmp - 0.2);
      KIT.draw(tl, "cv-match", TM.hit - 0.6, 0.6);
      KIT.pop(tl, "#lb-hit", TM.hit - 0.1);
      KIT.rot(tl, "ep3-flag", TM.hit - 0.1, -90, 0.4);
      KIT.rot(tl, "vp2-flag", TM.hit - 0.1, -90, 0.4);
      out("#mg-w", TM.hit + 0.2);
      KIT.draw(tl, "cv-steal", TM.take - 0.3, 0.7);
      tl.set("#vg2", { opacity: 0 }, TM.take - 0.1); tl.set("#gfly-w", { opacity: 1 }, TM.take - 0.1);
      flyTo("#gfly-w", TM.take - 0.1, ${f(gEnd[0] - gStart[0])}, ${f(gEnd[1] - gStart[1])}, 1.2, "power2.in");
      KIT.pop(tl, "#lb-steal", TM.take + 0.6);
      // ===== L5 looks random ≠ safe; CSPRNG with full 256-bit entropy
      out("#steps", LS[5] - 0.1, 0.3);
      out("#lb-vit, #lb-hit, #lb-steal, #lb-ep, #cv-match, #cv-steal", LS[5], 0.3);
      KIT.cam(tl, LS[5] - 0.1, CAMS.csp, 1.3);
      KIT.pop(tl, "#kw1", TM.look, 0.3);
      KIT.broke(tl, "prng", TM.safe, { ghost: 0.45 });
      grow("lotB", TM.csp - 0.2, 0.5);
      KIT.drum(tl, "lotB", TM.csp + 0.3, 4.0, 3);
      KIT.ballOut(tl, "lotB", TM.b256);
      KIT.pop(tl, "#lb-lotB", TM.csp + 0.4);
      // ===== L6 three cases, same road: card slots
      out("#kw1, #lb-lotB", LS[6] - 0.1, 0.25);
      KIT.cam(tl, LS[6] - 0.1, CAMS.cases, 1.4);
      fadeIn("#cases", TM.three, 0.3);
      ["pf", "wm", "brw", "wx", "msl", "msc", "msp"].forEach((id, i) => grow(id, TM.three + 0.2 + i * 0.08, 0.4));
      // ===== L7 case 1 Profanity
      KIT.cam(tl, LS[7] - 0.3, CAMS.c1, 1.2);
      caseOn(0, TM.pf);
      KIT.pop(tl, "#lb-pf", TM.v160);
      KIT.tick(tl, "pf", TM.v160, 4, 1.6);
      wire("pf", TM.pf32, true);
      // ===== L8 timeline: 9/15 disclosure → +5 days → Wintermute; other victims
      fadeIn("#cal1", TM.y22 - 0.2, 0.3);
      [1, 2, 3, 4, 5].forEach((d) => { const t = TM.d5 - 0.2 + (d - 1) * 0.28;
        tl.fromTo("#pg" + d, { opacity: 0, rotationX: -80, transformOrigin: "50% 0%" }, { opacity: 1, rotationX: 0, duration: 0.24, ease: "power2.out", immediateRender: false }, t); tl.set("#pg" + (d - 1), { opacity: 0 }, t + 0.02); });
      KIT.door(tl, "wm", TM.wm, 105, 0.9);
      KIT.pop(tl, "#lb-wm", TM.wm + 0.2);
      wire("wm", TM.wm + 0.3, true);
      grow("hv1", TM.same - 0.3); grow("hv2", TM.same - 0.15);
      KIT.door(tl, "hv1", TM.same + 0.3, 105, 0.8); KIT.door(tl, "hv2", TM.same + 0.45, 105, 0.8);
      wire("hv1", TM.same + 0.6, true); wire("hv2", TM.same + 0.7, true);
      KIT.pop(tl, "#lb-hv", TM.same + 0.4);
      // ===== L9 case 2 Trust Wallet extension: WASM + mt19937, 256 → 32
      out("#cal1, #lb-pf, #lb-wm, #lb-hv", LS[9] - 0.2, 0.25);
      KIT.cam(tl, LS[9] - 0.3, CAMS.c2, 1.3);
      caseOn(1, TM.tw);
      KIT.pop(tl, "#lb-brw", TM.tw + 0.3);
      grow("d256", TM.wasm - 0.4);
      KIT.tick(tl, "wxp", TM.wasm, 3, 1.0);
      wire("wxp", TM.mt2 - 0.2, true);
      KIT.pop(tl, "#lb-wx", TM.mt2 - 0.2);
      KIT.pop(tl, "#lb-d256", TM.e256 - 0.2);
      KIT.dialTurn(tl, "d256", TM.e256 - 0.2, 60, 0.8);
      tl.to("#d256-w", { scale: 0.45, svgOrigin: org("d256"), opacity: 0, duration: 0.5, ease: "power2.in" }, TM.e32 - 0.4);
      tl.set("#d32", { scaleY: 1 }, TM.e32 - 0.05);
      KIT.pop(tl, "#d32-w", TM.e32 - 0.05, 0.35);
      KIT.pop(tl, "#lb-d32", TM.e32 + 0.1);
      out("#lb-d256", TM.e32 - 0.2);
      // ===== L10 affected window 11/14–23, Ledger reports, fixed in days
      out("#lb-brw, #lb-d32", LS[10] - 0.1);
      KIT.cam(tl, LS[10] - 0.2, CAMS.c2b, 1.2);
      fadeIn("#cal2", TM.aff - 0.1, 0.3);
      tl.to("#cal2 .dd.in", { backgroundColor: "#e0453a", color: "#ffffff", duration: 0.2, stagger: 0.05 }, TM.d14);
      KIT.pop(tl, "#drng", TM.d14 + 0.6);
      [0, 1, 2, 3].forEach((i) => { grow("tw" + i, TM.ext - 0.3 + i * 0.12, 0.4); wire("tw" + i, TM.ext + 0.3 + i * 0.1, true); });
      KIT.pop(tl, "#lb-tw", TM.ext + 0.6);
      tl.set("#env-w", { opacity: 1 }, TM.ledger - 0.3);
      KIT.pop(tl, "#lb-env", TM.ledger - 0.2);
      tl.fromTo("#env-w", { x: 0, y: 0 }, { keyframes: [{ x: ${f(flyEnv[0] * 0.5)}, y: ${f(flyEnv[1] * 0.5 - 120)}, duration: 0.6, ease: "power1.out" }, { x: ${f(flyEnv[0])}, y: ${f(flyEnv[1])}, duration: 0.6, ease: "power1.in" }], immediateRender: false }, TM.ledger + 0.4);
      out("#lb-env", TM.ledger + 1.4); out("#env-w", TM.fix - 0.8, 0.2);
      tl.fromTo("#wr-i", { opacity: 0, rotation: -40 }, { opacity: 1, rotation: 0, duration: 0.3, immediateRender: false }, TM.fix - 0.8);
      tl.to("#wr-i", { keyframes: [{ rotation: 30, duration: 0.25 }, { rotation: -20, duration: 0.25 }, { rotation: 30, duration: 0.25 }] }, TM.fix - 0.5);
      out("#wr-i", TM.fix + 0.4);
      wire("wxp", TM.fix - 0.2, false); out("#lb-wx", TM.fix - 0.3);
      KIT.swap(tl, "#wxp-w", "#wxl-w", TM.fix - 0.1, 0.35);
      tl.to("#wx-gl", { opacity: 1, duration: 0.4 }, TM.fix);
      KIT.pop(tl, "#lb-fix", TM.fix + 0.1);
      KIT.drum(tl, "wxl", TM.fix + 0.2, 2.0, 1.5);
      // ===== L11 key frame: code fixed (green), wallets made in the window stay weak → stolen
      out("#cal2", LS[11] - 0.1, 0.25);
      out("#lb-tw", TM.k17 - 0.5);
      KIT.door(tl, "tw1", TM.stolen - 0.3, 100, 0.7); KIT.door(tl, "tw3", TM.stolen - 0.15, 100, 0.7);
      [1, 3].forEach((i, ii) => [0, 1, 2].forEach((k) => coinOut("tc" + i + "-" + k, TM.stolen + 0.3 + ii * 0.15 + k * 0.18, -160 - k * 40, 140 + k * 30)));
      KIT.pop(tl, "#lb-170", TM.k17 - 0.1);
      KIT.pop(tl, "#lb-170t", TM.k17 + 0.3);
      // ===== L12 case 3 Milk Sad: seed-generating command, seed = 32-bit time
      out("#lb-fix, #lb-170, #lb-170t", LS[12] - 0.2, 0.25);
      KIT.cam(tl, LS[12] - 0.3, CAMS.c3, 1.3);
      caseOn(2, TM.lib);
      KIT.pop(tl, "#lb-msl", TM.cmd - 0.2);
      KIT.clock(tl, "msc", TM.cmd, 3.0, 40);
      KIT.draw(tl, "cv-time", TM.tval - 1.0, 0.6);
      KIT.tick(tl, "msp", TM.tval - 0.4, 3, 1.0);
      wire("msp", TM.tval - 0.2, true);
      KIT.pop(tl, "#lb-msp", TM.tval - 0.3);
      // ===== L13 2023-07-12 concentrated theft, at least ~$900k
      out("#lb-msl", LS[13] - 0.1);
      KIT.cam(tl, LS[13] - 0.2, CAMS.c3b, 1.1);
      fadeIn("#cal3", TM.y23 - 0.1, 0.3);
      [0, 1, 2, 3, 4].forEach((i) => grow("mw" + i, LS[13] + 0.1 + i * 0.1, 0.4));
      [0, 1, 2, 3, 4].forEach((i) => { KIT.door(tl, "mw" + i, TM.mass, 100, 0.6); wire("mw" + i, TM.mass + 0.2, true);
        [0, 1].forEach((k) => coinOut("mc" + i + "-" + k, TM.mass + 0.4 + k * 0.18, -150 - k * 50, 160 + k * 30)); });
      KIT.pop(tl, "#lb-mw", TM.k90 - 0.1);
      KIT.pop(tl, "#lb-mwt", TM.k90 + 0.3);
      // ===== L14 vendor: docs warned (project says)
      out("#cal3, #lb-msp, #cv-time, #lb-mw, #lb-mwt", LS[14] - 0.1, 0.25);
      KIT.cam(tl, LS[14] - 0.2, CAMS.c3doc, 0.9);
      grow("msd", LS[14] - 0.1, 0.4);
      [0, 1, 2, 3, 4].forEach((i) => shrink("mw" + i, LS[14] - 0.2 + i * 0.05, 0.3));
      KIT.pop(tl, "#stk1-s", TM.warn - 0.4, 0.3);
      KIT.pop(tl, "#lb-msd", TM.vend + 0.1);
      KIT.pop(tl, "#lb-msd2", TM.vend + 0.4);
      // ===== L15 lesson 1: audit replaced randomness in WASM / JS
      out("#cases", LS[15] - 0.1, 0.25);
      out("#lb-msd, #lb-msd2, #stk1-s", LS[15] - 0.1, 0.25);
      KIT.cam(tl, LS[15] - 0.2, CAMS.l1, 1.4);
      KIT.pop(tl, "#le0", TM.les + 0.1, 0.3);
      grow("lw", TM.wasm2 - 0.3);
      fadeIn("#lmg-w", TM.audit - 0.6, 0.2);
      tl.fromTo("#lmg-w", { x: 160, y: 60 }, { x: -40, y: -60, duration: 1.4, ease: "power2.inOut", immediateRender: false }, TM.audit - 0.6);
      KIT.pop(tl, "#lb-lw", TM.audit);
      // ===== L16 lesson 2: warnings do not stop misuse; secure by default
      out("#le0", LS[16] - 0.1, 0.15); KIT.pop(tl, "#le1", LS[16], 0.3);
      out("#lb-lw, #lmg-w", LS[16] - 0.1, 0.2);
      KIT.cam(tl, LS[16] - 0.2, CAMS.l2, 1.0);
      grow("ld", LS[16]);
      KIT.pop(tl, "#stk2-s", TM.warn2 - 0.2, 0.3);
      tl.to("#stk2-s", { y: 160, rotation: 50, opacity: 0, duration: 0.7, ease: "power2.in" }, TM.misuse - 0.2);
      KIT.pop(tl, "#lb-ld", TM.misuse);
      grow("ll", TM.dflt - 0.5);
      KIT.pop(tl, "#lb-ll", TM.dflt);
      // ===== L17 lesson 3: fixing code does not fix weak keys → forced migration
      out("#le1", LS[17] - 0.1, 0.15); KIT.pop(tl, "#le2", LS[17], 0.3);
      out("#lb-ld, #lb-ll", LS[17] - 0.1, 0.2);
      KIT.cam(tl, LS[17] - 0.2, CAMS.l3, 1.2);
      grow("lc", TM.fixc - 0.2);
      KIT.pop(tl, "#lc-ok-b", TM.fixc + 0.3);
      KIT.pop(tl, "#lb-lc", TM.fixc + 0.4);
      [0, 1, 2].forEach((i) => { grow("op" + i, TM.cant - 0.4 + i * 0.1, 0.4); });
      KIT.pop(tl, "#lb-op", TM.weak - 0.2);
      [0, 1, 2].forEach((i) => { grow("np" + i, TM.mig - 0.2 + i * 0.12, 0.4); KIT.draw(tl, "cv-mg" + i, TM.mig + 0.1 + i * 0.15, 0.6); });
      KIT.pop(tl, "#lb-np", TM.newa - 0.2);
      tl.set({}, {}, ${f(TOTAL)});

      ${termJs(TERMS)}      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes");
