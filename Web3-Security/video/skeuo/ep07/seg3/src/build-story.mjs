// Generates compositions/story.html for ep07/seg3「③ 怪代币」.
// Run: node src/build-story.mjs
// World = 收发站（seg1 定的世界坐标）：我们的合约（售货机）在原点，+u 侧发货登记台；
//   中区·代币陈列架（八个白展台 + 八枚怪代币）；陈列架左上方 = TRON 推送台（钱包 + 推送/拉取两根管 + 关卡 / 台秤）；
//   售货机正前方 = 收税存款台（用户 + 管子 + 过路收费夹，登记台记账，台秤 + 锁扣）。
import fs from "node:fs";
import { G, at, f, box, M, CE, faceV, frameV, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, kitCss, runtimeJs, dashCurve } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { LY, PUSH, PULL, TAXP } from "./layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const w = (term, line, o = {}) => wordAt(T, term, { line, ...o }).start;
const L = (i) => lineAt(T, i);
const items = [];
const A = {};
const add = (y, svg) => items.push({ y, svg });
const put = (name, r, o, dy = 0) => { A[name] = r.anchors; add(at(o)[1] + dy, r.svg); return r; };
const ofs = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });
const sofs = (o, X_, Y_) => { const d = G(X_, Y_); return { u: o.u + d.u, v: o.v + d.v }; }; // screen-ground offset
const isPt = (q) => Array.isArray(q) && q.length === 2 && typeof q[0] === "number";
// lift an object (svg + point anchors) by z world units
function lift(r, z) {
  const dy = -z * CE;
  const an = {};
  for (const [k, v] of Object.entries(r.anchors)) an[k] = isPt(v) ? [v[0], v[1] + dy] : v;
  return { svg: `<g transform="translate(0,${f(dy)})">${r.svg}</g>`, anchors: an };
}
// uniformly scale an object about its ground origin
function scaled(r, o, k) {
  const [ox, oy] = at(o);
  const an = {};
  for (const [kk, v] of Object.entries(r.anchors)) an[kk] = isPt(v) ? [ox + (v[0] - ox) * k, oy + (v[1] - oy) * k] : v;
  return { svg: `<g transform="translate(${f(ox)} ${f(oy)}) scale(${k}) translate(${f(-ox)} ${f(-oy)})">${r.svg}</g>`, anchors: an };
}

// ================================================================ world
const VM = LY.VEND;
put("vm", E1.vending(VM, { id: "vm", sign: "OUR CONTRACT" }), VM);
put("desk", X.dispatchDesk(LY.DESK, { id: "desk", shown: 2 }), LY.DESK);

// ---- 中区·代币陈列架
const KINDS = X.COIN_KINDS;
const NAMES = ["不返回值", "成功也报 false", "转账收税", "余额自动变化", "黑名单 / 冻结", "可暂停", "转账钩子", "可升级"];
const PLZ = 34, CK = 1.25;
LY.COINS.forEach((o, i) => {
  const plinth = box(o, -50, 50, -40, 40, 0, PLZ - 6, M.white, 1.6) + box(o, -54, 54, -44, 44, PLZ - 6, PLZ, { f: "#e9e3d6", s: "#d6cfc0", t: "#f6f2ea", st: "#8d857a" }, 1.4);
  add(at(o)[1] - 0.5, `<g id="pl${i}">${plinth}</g>`);
  const c = lift(X.oddCoin(o, { id: "c" + i, kind: KINDS[i], num: i + 1, icon: false, scale: CK }), PLZ);
  A["c" + i] = c.anchors;
  add(at(o)[1], `<g id="cw${i}">${c.svg}</g>`);
});
// ghost coins (more odd tokens): dashed outlines with "?" behind the row
const GH = [];
for (let i = 0; i < 7; i++) {
  const a = LY.COINS[i], b = LY.COINS[i + 1];
  const o = sofs({ u: (a.u + b.u) / 2, v: (a.v + b.v) / 2 }, 0, -120);
  GH.push(o);
  const m = frameV(o, 0, 0, 72);
  const tr = `matrix(${m.map((v, k) => (k < 4 ? v.toFixed(4) : f(v))).join(",")})`;
  add(at(o)[1] - 40, `<g id="gh${i}" opacity="0"><g transform="${tr}"><circle cx="0" cy="0" r="46" fill="rgba(255,255,255,0.55)" stroke="#8a8478" stroke-width="4" stroke-dasharray="9 7"/>
    <text x="0" y="17" font-family="Noto Sans SC" font-size="48" font-weight="900" fill="#9c9587" text-anchor="middle">?</text></g>
    <g transform="${faceV(o, -26, 20, 16)}"><rect x="0" y="0" width="52" height="16" rx="3" fill="none" stroke="#9c9587" stroke-width="2.5" stroke-dasharray="6 5"/></g></g>`);
}
// L1 standard coin + interface card
put("cp", X.oddCoin(LY.PLAIN, { id: "cp", kind: "plain", scale: 2.0 }), LY.PLAIN);
put("iface", O.doc(LY.IFACE, { id: "iface", title: "ERC-20", lines: ["transfer", "balanceOf", "approve …"], standing: true }), LY.IFACE);
// L27 auditor + checklist
put("aud", O.person(LY.AUDIT, { id: "aud", role: "engineer" }), LY.AUDIT);
put("audoc", O.doc(LY.AUDOC, { id: "audoc", title: "清单", lines: ["支持哪些代币？", "收税？变基？"], standing: true }), LY.AUDOC);

// per-coin props (one picture per kind)
const C = LY.COINS;
// 1 mute: empty return tag
const P1 = sofs(C[0], 70, 70); put("t1", X.returnTag(P1, { id: "t1", face: "empty", scale: 1.3 }), P1);
// 2 liar: "false" tag
const P2 = sofs(C[1], 72, 70); put("t2", X.returnTag(P2, { id: "t2", face: "false", scale: 1.3 }), P2);
// 3 tax: short pipe + toll clip in front of the coin
const P3 = ofs(C[2], 0, 75);
put("p3", E1.pipe(P3, { id: "p3", pts: [[-110, 0, 40], [110, 0, 40]], flowColor: "#f0c04a" }), P3, 2);
put("tc3", X.tollClip(P3, { id: "tc3", z: 40, pile: 1 }), P3, 3);
// 5 frozen: ice shell over plinth + coin
put("ice5", E5.iceShell(C[4], { id: "ice5", box: [-56, 56, -46, 46, 0, 200], on: false }), C[4], 5);
// 6 pause: knife switch, scaled down
{ const o = sofs(C[5], 70, 64); const r = scaled(O.knifeSwitch(o, { id: "sw6", on: true }), o, 0.36); put("sw6", r, o); }
// 7 hook: callback arm
{ const o = sofs(C[6], 78, 66); put("cb7", E4.callbackArm(o, { id: "cb7", target: A.c6.face, s: 0, scale: 0.75 }), o); }

// ---- TRON 推送台
put("wal", O.hotWallet(LY.WALLET, { id: "wal" }), LY.WALLET);
put("push", E1.pipe(VM, { id: "push", pts: PUSH, flowColor: "#f0c04a" }), ofs(VM, 400, -40));
put("pull", E1.pipe(VM, { id: "pull", pts: PULL, flowColor: "#f0c04a" }), ofs(VM, 400, 10));
put("gate", O.checkpoint(LY.GATE, { id: "gate", n: "", armUp: true }), LY.GATE, 1);
const TGF = ofs(VM, 300, -40); put("tgF", X.returnTag(TGF, { id: "tgF", face: "false", z: 60, scale: 1.4 }), TGF, 3);
const TGT = ofs(VM, 300, 10); put("tgT", X.returnTag(TGT, { id: "tgT", face: "ok", z: 150, scale: 1.4 }), TGT, 3);
put("scT", X.scale(LY.SCALE_T, { id: "scT", before: null, after: null }), LY.SCALE_T);

// ---- 收税存款台
put("taxu", O.person(LY.TAXU, { id: "taxu", role: "signer" }), LY.TAXU);
put("taxp", E1.pipe(LY.TAXU, { id: "taxp", pts: TAXP, flowColor: "#f0c04a" }), LY.TOLL);
put("tcx", X.tollClip(LY.TOLL, { id: "tcx", z: 70, axis: "u", pile: 0 }), LY.TOLL, 2);
put("safe", O.safe(LY.SAFE, { id: "safe", plate: "VAULT" }), LY.SAFE);
put("desk2", X.dispatchDesk(LY.DESK2, { id: "desk2", entries: ["+ 存款 100", "+ 存款 98"], shown: 0 }), LY.DESK2);
LY.OTHERS.forEach((o, i) => put("ou" + i, O.person(o, { id: "ou" + i, role: "signer", scale: 0.9 }), o));
put("scX", X.scale(LY.SCALE_X, { id: "scX", before: null, after: null }), LY.SCALE_X);
{ const o = ofs(LY.SCALE_X, 0, -45); put("hsp", E4.hasp(o, { id: "hsp", z: 128, scale: 1.7, locked: false }), LY.SCALE_X, 2); }
put("cbx", E4.callbackArm(LY.ARM_X, { id: "cbx", target: A.scX.lcd, s: 0, scale: 0.9 }), LY.ARM_X);

// ---- barriers (L28) in front of coins 3 and 4
const BAR = [2, 3].map((i) => {
  const o = ofs(C[i], 0, 70);
  const red = { f: "#e0453a", s: "#c23a30", t: "#f08a80", st: "#8f2620" };
  let s = box(o, -62, -54, -4, 4, 0, 80, M.ink, 1.2) + box(o, 54, 62, -4, 4, 0, 80, M.ink, 1.2);
  s += box(o, -70, 70, -5, 5, 56, 82, red, 1.5);
  s += `<g transform="${faceV(o, -70, 5, 82)}">${[0, 1, 2, 3].map((k) => `<path d="M${10 + k * 36} 26L${26 + k * 36} 0H${38 + k * 36}L${22 + k * 36} 26Z" fill="#ffffff" opacity="0.9"/>`).join("")}</g>`;
  add(at(o)[1] + 4, `<g id="bar${i}" opacity="0">${s}</g>`);
  return o;
});

// ---- tax story: dashed curves from the 2 missing dots to the other users (world layer)
const curves = [];

items.sort((a, b) => a.y - b.y);

// ================================================================ cameras
const P = (o, du = 0, dv = 0, z = 0) => at(o, du, dv, z);
const cc = (i, k = 1.8, sx = 940, sy = 600) => camAt(P(C[i], 0, 0, 90), sx, sy, k);
const shelfMid = [(at(C[0])[0] + at(C[7])[0]) / 2, (at(C[0])[1] + at(C[7])[1]) / 2];
const TAXG = at(LY.TOLL);
const CAMS = {
  shelf: camAt([shelfMid[0], shelfMid[1] - 40], 960, 540, 1.0),
  c0: cc(0), c1: cc(1), c2: cc(2), c3: cc(3), c4: cc(4), c5: cc(5), c6: cc(6), c7: cc(7),
  zoom2: cc(1, 2.4, 960, 620),
  tron: camAt(P(VM, 420, -60, 120), 1200, 560, 1.1),
  tronWide: camAt(P(VM, 620, 150, 100), 1060, 520, 0.72),
  tax: camAt([TAXG[0] + 60, TAXG[1] - 110], 1000, 600, 1.12),
  shelfEnd: camAt([shelfMid[0] - 20, shelfMid[1] + 90], 960, 600, 1.1),
};

// ================================================================ world labels
let labels = "";
const up = (p, dy) => [p[0], p[1] - dy];
const rt = (p, dx, dy = 0) => [p[0] + dx, p[1] + dy];
// shelf
C.forEach((o, i) => {
  const lo = i % 2 === 1;
  labels += lo ? wlab("lb-c" + i, rt(at(o), 0, 52), NAMES[i], "lab-sm hide", "t") : wlab("lb-c" + i, up(A["c" + i].top, 4), NAMES[i], "lab-sm hide");
});
labels += wlab("lb-cp", up(A.cp.top, 0), "标准 ERC-20", "hide");
labels += wlab("lb-if", rt(A.iface.top, 130, -40), "规定了接口 · 没规定行为", "lab-cs hide");
labels += wlab("lb-8", [shelfMid[0], shelfMid[1] - 250], "常见的非标准行为 · 8 种", "lab-ink hide");
// per-coin close-up labels
labels += wlab("lb-1a", rt(A.t1.top, 0, -10), "以太坊 USDT", "lab-ink hide");
labels += wlab("lb-1b", rt(at(P1), 20, -20), "SafeERC20 兼容", "lab-cs lab-sm hide", "b");
labels += wlab("lb-2ok", rt(A.c1.face, -70, -30), "转账成功 ✓", "lab-gs lab-sm hide", "r");
labels += wlab("lb-2a", rt(A.t2.top, 0, -10), "TRON USDT", "lab-ink hide");
labels += wlab("lb-3a", rt(at(P3), 0, 0), "到账 < 转出", "lab-r hide", "t");
labels += wlab("lb-4a", up(A.c3.top, 70), "缓存余额 100", "lab-g lab-sm hide");
labels += wlab("lb-4b", up(A.c3.top, 70), "缓存余额 失效 ✗", "lab-r lab-sm hide");
labels += wlab("lb-4c", up(A.c3.top, 70), "按份额记账", "lab-cs lab-sm hide");
labels += wlab("lb-4d", up(A.c3.top, 4), "stETH", "lab-ink hide");
labels += wlab("lb-5a", rt(A.c4.top, 0, -40), "被冻结", "lab-cs lab-sm hide");
labels += wlab("lb-6a", rt(A.sw6.top, 0, 0), "暂停", "lab-r lab-sm hide");
labels += wlab("lb-7a", rt(at(C[6]), 0, 52), "ERC-777 · 重入", "lab-rs hide", "t");
labels += wlab("lb-8a", rt(A.c7.face, 70, -20), "今天的行为", "lab-g lab-sm hide", "l");
labels += wlab("lb-8b", rt(A.c7.face, 70, -20), "以后可能改变", "lab-r lab-sm hide", "l");
// TRON
labels += wlab("lb-vm", up(A.vm.top, 0), "我们的合约", "lab-cs hide");
labels += wlab("lb-wal", up(A.wal.top, 60), "用户", "lab-ink hide");
labels += wlab("lb-push", rt(at(VM, 560, -40, 50), 0, 30), "推送 transfer", "lab-sm hide", "t");
labels += wlab("lb-gate", up(A.gate.plate, 10), "SafeERC20", "lab-cs lab-sm hide", "c");
labels += wlab("lb-rb", rt(A.gate.top, 0, -20), "整笔回滚 ✗", "lab-rs hide");
labels += wlab("lb-pull", rt(at(VM, 560, 10, 140), 0, -30), "拉取 transferFrom", "lab-sm hide");
labels += wlab("lb-dep", rt(at(VM, 420, 10, 140), 0, -40), "存款 ✓", "lab-gs big hide");
labels += wlab("lb-wd", rt(at(VM, 440, -40, 50), 0, 50), "提款 全部失败 ✗", "lab-rs big hide", "t");
labels += wlab("lb-scT", rt(A.scT.top, 0, 0), "看余额涨了多少", "lab-cs hide");
labels += wlab("lb-amt", rt(A.scT.lcd, -90, 0), "涨了 100 = amt ✓", "lab-gs hide", "r");
labels += wlab("lb-tth", rt(A.c2.top, 0, -10), "Tether 保留开启手续费的能力", "lab-r lab-sm hide");
// tax
const UH = A.taxu.head;
labels += wlab("lb-ex", rt(UH, 0, -50), "示例", "lab-g lab-sm hide");
labels += wlab("lb-say", rt(UH, -50, -10), "存 100", "lab-ink hide", "r");
labels += wlab("lb-led", rt(A.desk2.top, 160, 250), "登记簿：记 100", "lab-ink hide", "t");
labels += wlab("lb-led2", rt(A.desk2.top, 160, 250), "登记簿：记 98 ✓", "lab-gs hide", "t");
labels += wlab("lb-safe", up(A.safe.top, 0), "协议金库", "hide");
labels += wlab("lb-vault", up(A.safe.top, 0), "金库 · 实收 98", "lab-cs hide");
labels += wlab("lb-insol", up(A.safe.top, 0), "资不抵债", "lab-rs big hide");
labels += wlab("lb-gap", up(A.desk2.top, 160), "账面多 2 · 由其他用户承担", "lab-rs hide");
labels += wlab("lb-scX", rt(A.scX.lcd, 80, 0), "前后各读一次 · 只记增量", "lab-cs lab-sm hide", "l");
labels += wlab("lb-hsp", rt(A.scX.top, 0, -10), "重入锁", "lab-ink hide");
labels += wlab("lb-cbx", rt(A.cbx.top, 0, 0), "回调", "lab-rs lab-sm hide");
// end
labels += wlab("lb-more", [shelfMid[0] + 120, shelfMid[1] - 330], "还有更多", "lab-g hide");
labels += wlab("lb-aud", up(A.aud.head, 60), "审计", "lab-ink hide");
labels += wlab("lb-ask", rt(A.audoc.top, 30, 0), "你们支持哪些代币？", "hide");
labels += wlab("lb-rej", rt(at(BAR[0]), 95, 120), "不支持 → 显式拒绝", "lab-rs hide", "t");

// dot panels (counter-scaled HTML pinned in the world)
const dots = (id, n, cls = "", cols = 10, sz = 16) => `<div class="dg" id="${id}" style="grid-template-columns:repeat(${cols},${sz}px)">${Array.from({ length: n }, (_, k) => `<i class="d ${cls}" id="${id}-${k}" style="width:${sz}px;height:${sz}px"></i>`).join("")}</div>`;
labels += wpin("wdots", rt(A.wal.center, 130, -40), `<div class="dp hide" id="wdp"><div class="dp-h">钱包余额</div>${dots("wd", 20, "e")}</div>`, "l");
labels += wpin("udots", rt(UH, 50, 50), `<div class="dp hide" id="udp"><div class="dp-h">转出 100</div>${dots("ud", 100, "", 10, 13)}</div>`, "l");
labels += wpin("vdots", rt(A.safe.center, 170, -40), `<div class="dp hide" id="vdp"><div class="dp-h">金库实收</div>${dots("vd", 100, "e", 10, 13)}</div>`, "l");
LY.OTHERS.forEach((o, i) => { labels += wpin("od" + i, up(A["ou" + i].head, 40), `<div class="dp dp-s hide" id="odp${i}">${dots("o" + i + "d", 5, "", 5)}</div>`, "b"); });
const TLY = up(A.desk2.top, 70);
labels += wpin("tally", TLY, `<div class="tly hide" id="tly"><div><span class="tl-k">账面</span><b id="tl-a">100</b></div><div><span class="tl-k">实收</span><b id="tl-b" class="r">98</b></div></div>`, "b");

// world dashed curves (the 2-coin gap → other users)
LY.OTHERS.forEach((o, i) => {
  const e = up(A["ou" + i].head, 80);
  const c = dashCurve("gcv" + i, [TLY[0] - 60, TLY[1] - 30], [e[0] + 50, e[1] - 10], { c1: [TLY[0] - 200, TLY[1] - 160], c2: [e[0] + 160, e[1] - 160] });
  curves.push(c.svg);
});

const world = worldSvg("wsvg", gridSvg({ u0: -3000, u1: 6000, v0: -3000, v1: 4000 }) + items.map((x) => x.svg).join("\n") + curves.join(""), [-1600, -1600, 5200, 3400]);

// ================================================================ times
const TM = {
  tok0: w("代币本身", 0),
  erc1: w("ERC", 1), if1: w("接口", 1), beh1: w("没有规定行为", 1),
  non2: w("非标准", 2), eight2: w("八种", 2),
  one3: w("一", 3), mute3: w("不返回值", 3), usdt3: w("USDT", 3), safe3: w("SafeERC20", 3),
  two4: w("二", 4), ok4: w("成功了", 4), f4: w("false", 4), tron4: w("TRON", 4),
  three5: w("三", 5), tax5: w("收税", 5), less5: w("比转出的少", 5),
  four6: w("四", 6), auto6: w("自动变化", 6), st6: w("stETH", 6), cache6: w("缓存的余额", 6), share6: w("份额", 6),
  five7: w("五", 7), black7: w("黑名单", 7), frz7: w("冻结", 7),
  six8: w("六", 8), pause8: w("可暂停", 8),
  seven9: w("七", 9), hook9: w("转账钩子", 9), e777: w("ERC-777", 9), re9: w("重入", 9),
  eight10: w("八", 10), upg10: w("可升级", 10), chg10: w("可能改变", 10),
  two11: w("第二种", 11), oz11: w("OpenZeppelin", 11), across11: w("Across", 11),
  usdt12: w("USDT", 12), ok12: w("转账成功时", 12), f12: w("false", 12),
  st13: w("safeTransfer", 13), push13: w("推送", 13), rb13: w("一律回滚", 13),
  dep14: w("存款", 14), tf14: w("transferFrom", 14), nf14: w("不受影响", 14),
  sym15: w("症状", 15), dep15: w("存款正常", 15), wd15: w("提款全部失败", 15),
  fix16: w("修复", 16), nr16: w("不读返回值", 16), bal16: w("余额涨了多少", 16),
  eq17: w("正好等于金额", 17), ok17: w("才算到账", 17),
  nofee18: w("不收手续费", 18), teth18: w("Tether", 18), cap18: w("开启它的能力", 18),
  three19: w("第三种", 19), tax19: w("收税代币", 19),
  arg20: w("按参数记账", 20), say20: w("存 100", 20), rec20: w("记 100", 20),
  tax21: w("扣了税", 21), r98: w("98", 21),
  more22: w("多出 2 枚", 22), oth22: w("其他用户承担", 22),
  all23: w("所有用户", 23), ins23: w("资不抵债", 23),
  fix24: w("按实收记账", 24), rd24: w("各读一次余额", 24), inc24: w("只记增量", 24),
  lock25: w("重入锁", 25), cb25: w("回调", 25),
  lib26: w("没有一个库", 26), all26: w("所有怪代币", 26),
  ask27: w("先问项目方", 27), which27: w("支持哪些代币", 27),
  no28: w("不支持的类型", 28), taxreb28: w("收税和变基", 28), reb28: w("变基", 28), rej28: w("显式拒绝", 28),
};

// ================================================================ screen-layer HTML
const termDefs = [
  ["erc20", "ERC-20", "以太坊上的代币接口标准", TM.erc1],
  ["tron", "TRON", "另一条公链 · 上面也部署了 USDT", TM.tron4],
  ["share", "份额记账", "记持有的份额 · 不缓存会变的余额", TM.share6],
  ["hook", "转账钩子", "转账时自动调用接收方的代码", TM.hook9],
  ["re", "重入", "对方在回调里 · 再次调用你的合约", TM.re9],
  ["st", "safeTransfer", "SafeERC20 里把代币推给对方的函数", TM.st13],
  ["tf", "transferFrom", "合约从用户那里把代币拉进来", TM.tf14],
  ["teth", "Tether", "USDT 的发行方", TM.teth18],
  ["lock", "重入锁", "函数执行完之前 · 不许再次进入", TM.lock25],
  ["reb", "变基", "持有者余额按规则自动增减", TM.reb28],
];
const termHtml = termDefs.map(([id, t, d]) => `<div class="tcard hide" id="tc-${id}"><div class="tc-t">${t}</div><div class="tc-d">${d}</div></div>`).join("");

const row = (id, code, cm = "") => `<div class="cr" id="${id}"><span class="cr-bar" id="${id}-bar"></span>${code}${cm ? `<span class="c-cm">  ${cm}</span>` : ""}</div>`;
const cardC = `<div class="k-code cc hide" id="cardC"><div class="c-head">TRON USDT 推送 · 看余额差<span class="c-tag hide" id="cC-tag">假设不收手续费</span></div>
  ${row("cC0", "before = token.balanceOf(to);")}
  ${row("cC1", `<span class="c-cm">// 低级 call 发 transfer · 不读返回值</span>`)}
  ${row("cC2", "(bool ok, ) = address(token).call(data);")}
  ${row("cC3", `require(ok, "call reverted");`)}
  ${row("cC4", "require(token.balanceOf(to) - before == amt);")}</div>`;
const cardD = `<div class="k-code cd hide" id="cardD"><div class="c-head">收税代币 · 怎么记账</div>
  ${row("cD0", `<span class="c-red">✗</span> <span class="c-cm">// 按参数记账</span>`)}
  ${row("cD1", "deposits[user] += amount;", "// 记 100")}
  ${row("cD2", `<span class="c-ok">✓</span> <span class="c-cm">// 按实收记账（配合重入锁）</span>`)}
  ${row("cD3", "before = token.balanceOf(this);")}
  ${row("cD4", "token.safeTransferFrom(user, this, amount);")}
  ${row("cD5", "deposits[user] += token.balanceOf(this) - before;")}</div>`;
const evCard = `<div class="ev hide" id="ev"><span class="ev-h">OpenZeppelin · 2026 · Across 协议 TRON 部署</span><span class="ev-tag">第三方审计</span></div>`;

// red dashed line: card C last row → scale LCD (screen layer, camera CAMS.tron)
const CC_X = 48, CC_Y = 112, CC_W = 880, CC_ROW0 = CC_Y + 24 + 56 + 24, CC_RH = 48;
const lcdS = toScreen(CAMS.tron, A.scT.lcd);
const lnC = dashCurve("lnC", [CC_X + CC_W - 10, CC_ROW0 + 4 * CC_RH], [lcdS[0] - 50, lcdS[1]], { c1: [CC_X + CC_W + 140, CC_ROW0 + 4 * CC_RH + 40], c2: [lcdS[0] - 200, lcdS[1] - 30] });
const ovSvg = `<svg id="ovl" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">${lnC.svg}</svg>`;

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    .lab.big { font-size: 40px; font-weight: 900; padding: 8px 24px 10px; }
    .tcard { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
      padding: 14px 24px 16px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
    .tcard .tc-t { font-size: 32px; font-weight: 900; line-height: 1.25; white-space: nowrap; }
    .tcard .tc-d { margin-top: 4px; font-size: 28px; font-weight: 700; color: #3d3a35; line-height: 1.3; white-space: nowrap; }
    .k-code .cr { position: relative; height: ${CC_RH}px; line-height: ${CC_RH}px; font-family: "JetBrains Mono", "Noto Sans SC", monospace; font-size: 28px;
      font-weight: 600; white-space: pre; color: #b5ae9f; font-variant-ligatures: none; }
    .k-code .cr.on { color: #1c1c1c; }
    .k-code .cr .c-cm { color: inherit; opacity: 0.75; font-weight: 700; }
    .k-code .cr.on .c-cm { color: #6d685e; opacity: 1; }
    .k-code .cr .cr-bar { position: absolute; left: -18px; top: 8px; width: 6px; height: 30px; background: #2aa3c9; border-radius: 3px; opacity: 0; }
    .k-code .c-ok { color: #1f9d55; font-weight: 900; }
    #cardC { left: ${CC_X}px; top: ${CC_Y}px; width: ${CC_W}px; padding-bottom: 18px; }
    #cardD { left: 48px; top: 112px; width: 900px; padding-bottom: 18px; }
    .ev { position: absolute; left: 48px; top: 36px; display: flex; align-items: center; gap: 14px; background: #fffdf8; border-radius: 16px;
      padding: 12px 24px 14px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); border-left: 10px solid #1d93ba; }
    .ev .ev-h { font-size: 34px; font-weight: 900; white-space: nowrap; }
    .ev .ev-tag { font-size: 28px; font-weight: 700; color: #4a463f; background: #f1ede5; border: 2px solid #cfc7b8; border-radius: 10px; padding: 1px 12px 3px; white-space: nowrap; }
    .dp { background: #fffdf8; border-radius: 14px; padding: 8px 12px 12px; box-shadow: 0 10px 22px rgba(70,60,40,0.12); }
    .dp .dp-h { font-size: 28px; font-weight: 800; white-space: nowrap; margin-bottom: 6px; }
    .dp-s { padding: 6px 8px; }
    .dg { display: grid; gap: 4px; }
    .dg .d { display: block; width: 16px; height: 16px; border-radius: 50%; background: #f0c04a; box-shadow: inset 0 -2px 0 #c9921f; }
    .dg .d.is-red { background: #e0453a; box-shadow: none; }
    .dg .d.e { background: transparent; box-shadow: none; border: 2px dashed #cfc7b8; }
    .tly { background: #fffdf8; border-radius: 14px; padding: 8px 18px 10px; box-shadow: 0 10px 22px rgba(70,60,40,0.12); display: flex; gap: 22px; }
    .tly div { display: flex; align-items: baseline; gap: 8px; }
    .tly .tl-k { font-size: 28px; font-weight: 700; color: #6d685e; }
    .tly b { font-size: 40px; font-weight: 900; font-variant-numeric: tabular-nums; }
    .tly b.r { color: #c3352b; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      ${ovSvg}
      ${cardC}${cardD}${evCard}${termHtml}
      ${pills(3, { sections: SCRIPT.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">③ 怪代币</div><div class="t-sub">八种非标准行为 · TRON 上的 USDT · 收税代币</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E4.runtimeExtJs()}
${E5.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const K1 = window.KITX01, K4 = window.KITX04, K5 = window.KITX05, K7 = window.KITX07;
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const fin = (sel, t, d) => tl.to(sel, { opacity: 1, duration: d || 0.25, ease: "power1.out" }, t);
      const slideIn = (sel, t) => tl.fromTo(sel, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out", immediateRender: false }, t);
      const slideOut = (sel, t) => tl.to(sel, { opacity: 0, x: -40, duration: 0.3, ease: "power2.in" }, t);
      const hideG = (id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); };
      const shrink = (id, t) => { const g = $(id); tl.to("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy"), duration: 0.35, ease: "power2.in" }, t); };
      const grow = (id, t, d) => KIT.grow(tl, id, t, d || 0.45);
      const swap = (a, b, t) => KIT.swap(tl, a, b, t, 0.25);
      const rowOn = (id, t) => { tl.set("#" + id, { className: "cr on" }, t); tl.to("#" + id + "-bar", { opacity: 1, duration: 0.15 }, t); };
      const rowOff = (id, t) => tl.to("#" + id + "-bar", { opacity: 0, duration: 0.15 }, t);
      const term = (id, t) => { pop("#tc-" + id, t, 0.3); out("#tc-" + id, t + 3.4, 0.25); };
      const dotsTo = (pre, ks, t, cls, d) => ks.forEach((k, j) => tl.set("#" + pre + "-" + k, { className: "d " + cls }, t + j * (d || 0)));

      KIT.camSet(tl, CAMS.shelf);
      // hidden at start
      ["cp", "iface", "aud", "audoc", "t1", "t2", "p3", "tc3", "sw6", "cb7", "wal", "push", "pull", "gate", "tgF", "tgT", "scT",
       "taxu", "taxp", "tcx", "safe", "desk2", "ou0", "ou1", "ou2", "scX", "hsp", "cbx"].forEach(hideG);
      ["#t1-pop", "#t2-pop", "#tgF-pop", "#tgT-pop"].forEach((s) => tl.set(s, { opacity: 0 }, 0));
      for (let i = 0; i < 8; i++) tl.set("#cw" + i, { opacity: 0, y: -160 }, 0);

      // ===== 0–1.6 title card → flies into the pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.2);

      // ===== L0 the token itself: eight empty display stands
      for (let i = 0; i < 8; i++) tl.fromTo("#pl" + i, { opacity: 0.25 }, { opacity: 1, duration: 0.3, immediateRender: false }, ${f(TM.tok0)} + i * 0.06);

      // ===== L1 ERC-20 only specifies the interface
      grow("cp", ${f(TM.erc1 - 0.2)}, 0.5); pop("#lb-cp", ${f(TM.erc1 + 0.2)});
      term("erc20", ${f(TM.erc1)});
      grow("iface", ${f(TM.if1 - 0.1)});
      pop("#lb-if", ${f(TM.beh1)});
      K7.coinFlip(tl, "cp", ${f(TM.beh1 + 0.2)}, 1, 1.0);

      // ===== L2 eight common non-standard behaviours
      out("#lb-cp, #lb-if", ${f(L(2).start - 0.1)});
      shrink("cp", ${f(L(2).start)}); shrink("iface", ${f(L(2).start)});
      pop("#lb-8", ${f(TM.non2)});
      for (let i = 0; i < 8; i++) {
        const t0 = ${f(TM.eight2 - 0.5)} + i * 0.16;
        tl.to("#cw" + i, { opacity: 1, duration: 0.12 }, t0);
        tl.to("#cw" + i, { y: 0, duration: 0.5, ease: "bounce.out" }, t0);
        K7.numOn(tl, "c" + i, t0 + 0.45, true);
      }

      // ===== L3 1 · transfer returns nothing (Ethereum USDT) → SafeERC20
      out("#lb-8", ${f(L(3).start - 0.1)});
      KIT.cam(tl, ${f(L(3).start - 0.2)}, CAMS.c0, 1.0);
      K7.iconOn(tl, "c0", ${f(TM.mute3)}); pop("#lb-c0", ${f(TM.mute3 + 0.2)});
      grow("t1", ${f(TM.mute3 + 0.3)}, 0.3); K7.tagPop(tl, "t1", ${f(TM.mute3 + 0.4)});
      pop("#lb-1a", ${f(TM.usdt3)});
      pop("#lb-1b", ${f(TM.safe3)});
      K7.iconHi(tl, "c0", ${f(TM.safe3)}, true);

      // ===== L4 2 · success but returns false (TRON USDT)
      out("#lb-1a, #lb-1b", ${f(L(4).start - 0.2)}); shrink("t1", ${f(L(4).start - 0.1)}); K7.iconHi(tl, "c0", ${f(L(4).start - 0.1)}, false);
      KIT.cam(tl, ${f(L(4).start - 0.2)}, CAMS.c1, 0.8);
      K7.iconOn(tl, "c1", ${f(TM.two4)}); pop("#lb-c1", ${f(TM.two4 + 0.2)});
      pop("#lb-2ok", ${f(TM.ok4)});
      grow("t2", ${f(TM.f4 - 0.3)}, 0.3); K7.tagPop(tl, "t2", ${f(TM.f4 - 0.2)});
      K7.coinFlip(tl, "c1", ${f(TM.f4)}, 1, 0.8);
      pop("#lb-2a", ${f(TM.tron4)});
      term("tron", ${f(TM.tron4)});

      // ===== L5 3 · transfer tax
      out("#lb-2ok, #lb-2a", ${f(L(5).start - 0.2)}); shrink("t2", ${f(L(5).start - 0.1)});
      KIT.cam(tl, ${f(L(5).start - 0.2)}, CAMS.c2, 0.8);
      K7.iconOn(tl, "c2", ${f(TM.three5)}); pop("#lb-c2", ${f(TM.three5 + 0.2)});
      grow("p3", ${f(TM.tax5 - 0.3)}, 0.3); grow("tc3", ${f(TM.tax5 - 0.2)}, 0.3);
      fin("#p3-flow", ${f(TM.tax5)}, 0.2); K1.dash(tl, ["p3-flow"], ${f(TM.tax5)}, 3.6, 260);
      K7.chipDrop(tl, "c2", ${f(TM.tax5 + 0.2)});
      K7.toll(tl, "tc3", ${f(TM.tax5 + 0.4)}); K7.toll(tl, "tc3", ${f(TM.less5)});
      pop("#lb-3a", ${f(TM.less5)});

      // ===== L6 4 · balance changes on its own (stETH) → shares
      out("#lb-3a, #p3-flow", ${f(L(6).start - 0.2)});
      KIT.cam(tl, ${f(L(6).start - 0.2)}, CAMS.c3, 0.8);
      K7.iconOn(tl, "c3", ${f(TM.four6)}); pop("#lb-c3", ${f(TM.four6 + 0.2)});
      K7.breathe(tl, "c3", ${f(TM.auto6)}, 5.4, 1.2, 0.16);
      pop("#lb-4d", ${f(TM.st6)});
      pop("#lb-4a", ${f(TM.cache6 - 0.6)});
      swap("#lb-4a", "#lb-4b", ${f(TM.cache6 + 0.6)});
      swap("#lb-4b", "#lb-4c", ${f(TM.share6)});
      term("share", ${f(TM.share6)});

      // ===== L7 5 · blacklist / freeze
      out("#lb-4c, #lb-4d", ${f(L(7).start - 0.2)});
      KIT.cam(tl, ${f(L(7).start - 0.2)}, CAMS.c4, 0.7);
      K7.iconOn(tl, "c4", ${f(TM.five7)}); pop("#lb-c4", ${f(TM.five7 + 0.2)});
      K5.freeze(tl, "ice5", ${f(TM.frz7 - 0.1)}, 0.8, "drop");
      pop("#lb-5a", ${f(TM.frz7 + 0.5)});

      // ===== L8 6 · pausable
      out("#lb-5a", ${f(L(8).start - 0.2)});
      KIT.cam(tl, ${f(L(8).start - 0.2)}, CAMS.c5, 0.6);
      K7.iconOn(tl, "c5", ${f(TM.six8)}); pop("#lb-c5", ${f(TM.six8 + 0.15)});
      grow("sw6", ${f(TM.six8 + 0.1)}, 0.35);
      KIT.toggle(tl, "sw6", ${f(TM.pause8 + 0.2)}, false, 0.5);
      pop("#lb-6a", ${f(TM.pause8 + 0.6)});

      // ===== L9 7 · transfer hooks (ERC-777) → reentrancy
      out("#lb-6a", ${f(L(9).start - 0.2)});
      KIT.cam(tl, ${f(L(9).start - 0.2)}, CAMS.c6, 0.6);
      K7.iconOn(tl, "c6", ${f(TM.seven9)}); pop("#lb-c6", ${f(TM.seven9 + 0.2)});
      grow("cb7", ${f(TM.hook9)}, 0.35);
      K4.armPress(tl, "cb7", ${f(TM.e777 - 0.1)}, { reach: 1, hold: 0.5 });
      pop("#lb-7a", ${f(TM.e777)});
      term("hook", ${f(TM.hook9)});
      term("re", ${f(TM.re9)});
      K4.armPress(tl, "cb7", ${f(TM.re9 + 0.2)}, { reach: 1, hold: 0.4 });

      // ===== L10 8 · upgradeable
      out("#lb-7a", ${f(L(10).start - 0.2)});
      KIT.cam(tl, ${f(L(10).start - 0.2)}, CAMS.c7, 0.6);
      K7.iconOn(tl, "c7", ${f(TM.eight10)}); pop("#lb-c7", ${f(TM.eight10 + 0.2)});
      pop("#lb-8a", ${f(TM.upg10)});
      K7.coinFlip(tl, "c7", ${f(TM.chg10 - 0.4)}, 1, 0.9);
      swap("#lb-8a", "#lb-8b", ${f(TM.chg10)});
      K7.iconHi(tl, "c7", ${f(TM.chg10)}, true);

      // ===== L11 a closer look at #2 — third-party audit
      ${JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7].map((i) => [i, f(L(Math.min(4 + i, 11)).start - 0.2)]))}.forEach(([i, t]) => out("#lb-c" + i, t));
      out("#lb-8b", ${f(L(11).start - 0.2)}); K7.iconHi(tl, "c7", ${f(L(11).start)}, false);
      KIT.cam(tl, ${f(L(11).start - 0.1)}, CAMS.zoom2, 1.2);
      K7.iconHi(tl, "c1", ${f(TM.two11 + 0.3)}, true);
      pop("#ev", ${f(TM.oz11)}, 0.35);

      // ===== L12 TRON USDT returns false even on success
      const c12 = ${f(L(12).start - 0.2)};
      KIT.cam(tl, c12, CAMS.tron, 1.4);
      out("#lb-c0, #lb-c1, #lb-c2, #lb-c3, #lb-c4, #lb-c5, #lb-c6, #lb-c7", c12, 0.3);
      K7.iconHi(tl, "c1", c12, false);
      pop("#lb-vm", ${f(TM.usdt12 - 0.2)});
      grow("wal", c12 + 0.4); grow("push", c12 + 0.5); pop("#lb-wal", c12 + 0.8);
      pop("#lb-push", ${f(TM.usdt12)});
      fin("#push-flow", ${f(TM.usdt12)}, 0.2); K1.dash(tl, ["push-flow"], ${f(TM.usdt12)}, 2.2, 320);
      pop("#wdp", ${f(TM.ok12 - 0.4)});
      dotsTo("wd", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], ${f(TM.ok12)}, "", 0.06);
      grow("tgF", ${f(TM.f12 - 0.3)}, 0.2); K7.tagPop(tl, "tgF", ${f(TM.f12 - 0.2)});
      out("#push-flow", ${f(TM.f12 + 0.4)});

      // ===== L13 safeTransfer → reverts on TRON
      out("#ev", ${f(L(13).start - 0.2)});
      term("st", ${f(TM.st13)});
      grow("gate", ${f(TM.st13)}, 0.5); pop("#lb-gate", ${f(TM.st13 + 0.5)});
      KIT.arm(tl, "gate", ${f(TM.rb13 - 0.2)}, false, 0.4);
      K7.tagStamp(tl, "tgF", ${f(TM.rb13)}, "x");
      dotsTo("wd", [9, 8, 7, 6, 5, 4, 3, 2, 1, 0], ${f(TM.rb13 + 0.1)}, "e", 0.05);
      pop("#lb-rb", ${f(TM.rb13 + 0.3)});

      // ===== L14 deposits pull with transferFrom → unaffected
      out("#lb-rb", ${f(L(14).start - 0.2)});
      grow("pull", ${f(TM.dep14 - 0.2)}, 0.4);
      fin("#pull-flow", ${f(TM.tf14)}, 0.2); K1.dash(tl, ["pull-flow"], ${f(TM.tf14)}, 2.4, 320);
      pop("#lb-pull", ${f(TM.tf14)});
      term("tf", ${f(TM.tf14)});
      grow("tgT", ${f(TM.nf14 - 0.3)}, 0.2); K7.tagPop(tl, "tgT", ${f(TM.nf14 - 0.2)}); K7.tagStamp(tl, "tgT", ${f(TM.nf14 + 0.3)}, "ok");

      // ===== L15 symptom: deposits fine, withdrawals all fail (key frame)
      out("#lb-pull, #lb-push, #pull-flow", ${f(TM.sym15 - 0.1)});
      pop("#lb-dep", ${f(TM.dep15)}, 0.3);
      pop("#lb-wd", ${f(TM.wd15)}, 0.3);

      // ===== L16 fix: ignore the return value, check the receiver's balance
      out("#lb-dep, #lb-wd, #lb-gate", ${f(L(16).start - 0.2)});
      out("#wdp", ${f(L(16).start - 0.2)});
      slideIn("#cardC", ${f(TM.fix16)}); out("#lb-vm", ${f(TM.fix16)});
      shrink("gate", ${f(TM.fix16)}); shrink("tgF", ${f(TM.fix16)}); shrink("tgT", ${f(TM.fix16)});
      grow("scT", ${f(TM.fix16 + 0.3)}, 0.5); pop("#lb-scT", ${f(TM.bal16)});
      rowOn("cC0", ${f(TM.nr16 - 0.4)}); rowOn("cC1", ${f(TM.nr16)}); rowOn("cC2", ${f(TM.nr16 + 0.3)}); rowOn("cC3", ${f(TM.nr16 + 0.6)});
      K7.pileTo(tl, "scT", ${f(TM.bal16 - 0.4)}, 5, 0.4); K7.weigh(tl, "scT", ${f(TM.bal16)});
      K7.read(tl, "scT", ${f(TM.bal16 + 0.1)}, "before", 1000, 0.6);

      // ===== L17 increase == amount → credited
      ["cC0", "cC1", "cC2", "cC3"].forEach((r) => rowOff(r, ${f(L(17).start - 0.1)}));
      fin("#push-flow", ${f(L(17).start - 0.1)}, 0.2); K1.dash(tl, ["push-flow"], ${f(L(17).start - 0.1)}, 1.6, 240);
      K7.pileTo(tl, "scT", ${f(TM.eq17 - 0.6)}, 7, 0.4); K7.weigh(tl, "scT", ${f(TM.eq17 - 0.2)});
      K7.read(tl, "scT", ${f(TM.eq17 - 0.1)}, "after", 1100, 0.6);
      K7.diff(tl, "scT", ${f(TM.eq17 + 0.5)}, true, "差 = 100");
      rowOn("cC4", ${f(TM.eq17)});
      KIT.draw(tl, "lnC", ${f(TM.eq17 + 0.2)}, 0.6);
      pop("#lb-amt", ${f(TM.ok17 - 0.2)});
      out("#push-flow", ${f(TM.ok17 + 0.4)});

      // ===== L18 assumes no transfer fee; Tether can turn one on
      pop("#cC-tag", ${f(L(18).start + 0.1)});
      tl.set("#lnC", { opacity: 0 }, ${f(TM.teth18 - 0.3)});
      slideOut("#cardC", ${f(TM.teth18 - 0.3)});
      out("#lb-amt, #lb-scT, #lb-wal, #lb-vm", ${f(TM.teth18 - 0.5)});
      KIT.cam(tl, ${f(TM.teth18 - 0.5)}, CAMS.tronWide, 1.0);
      term("teth", ${f(TM.teth18 + 0.1)});
      K7.iconHi(tl, "c2", ${f(TM.teth18 + 0.5)}, true);
      pop("#lb-tth", ${f(TM.cap18 - 0.3)});
      K7.chipDrop(tl, "c2", ${f(TM.cap18)});

      // ===== L19 the third kind: fee-on-transfer
      out("#lb-tth", ${f(L(19).start - 0.2)}); K7.iconHi(tl, "c2", ${f(L(19).start)}, false);
      KIT.cam(tl, ${f(L(19).start - 0.2)}, CAMS.c2, 1.0);
      K7.iconHi(tl, "c2", ${f(TM.tax19)}, true);
      K7.toll(tl, "tc3", ${f(TM.tax19 + 0.2)});

      // ===== L20 example: user says 100, books record 100
      const c20 = ${f(L(20).start - 0.3)};
      KIT.cam(tl, c20, CAMS.tax, 1.3);
      K7.iconHi(tl, "c2", c20, false);
      grow("taxu", c20 + 0.5); grow("taxp", c20 + 0.6); grow("tcx", c20 + 0.7); grow("safe", c20 + 0.6); grow("desk2", c20 + 0.8); pop("#lb-safe", c20 + 1.1);
      pop("#lb-ex", ${f(TM.arg20)});
      pop("#lb-say", ${f(TM.say20 - 0.1)}); pop("#udp", ${f(TM.say20)});
      slideIn("#cardD", ${f(TM.arg20)});
      rowOn("cD0", ${f(TM.arg20 + 0.2)}); rowOn("cD1", ${f(TM.rec20 - 0.2)});
      K7.slotFlash(tl, "desk2", ${f(TM.rec20 - 0.2)}, 2);
      K7.entry(tl, "desk2", ${f(TM.rec20)}, 0, 0.5); pop("#lb-led", ${f(TM.rec20 + 0.2)});

      // ===== L21 tax taken: the vault only receives 98
      slideOut("#cardD", ${f(L(21).start - 0.1)});
      out("#lb-say", ${f(L(21).start - 0.1)});
      fin("#taxp-flow", ${f(L(21).start)}, 0.2); K1.dash(tl, ["taxp-flow"], ${f(L(21).start)}, 3.6, 360);
      K7.toll(tl, "tcx", ${f(TM.tax21 - 0.2)}); K7.toll(tl, "tcx", ${f(TM.tax21 + 0.6)});
      dotsTo("ud", [98, 99], ${f(TM.tax21)}, "is-red", 0.6);
      pop("#vdp", ${f(TM.tax21 + 0.3)});
      { const ks = []; for (let k = 0; k < 98; k++) ks.push(k); dotsTo("vd", ks, ${f(TM.tax21 + 0.5)}, "", 0.022); }
      swap("#lb-safe", "#lb-vault", ${f(TM.r98)});
      out("#taxp-flow", ${f(TM.r98 + 0.8)});

      // ===== L22 books are 2 higher; other users carry the gap
      pop("#tly", ${f(TM.more22 - 0.2)});
      ["ou0", "ou1", "ou2"].forEach((id, k) => grow(id, ${f(TM.oth22 - 0.8)} + k * 0.12, 0.35));
      [0, 1, 2].forEach((k) => pop("#odp" + k, ${f(TM.oth22 - 0.4)} + k * 0.12));
      [0, 1, 2].forEach((k) => KIT.draw(tl, "gcv" + k, ${f(TM.oth22)} + k * 0.2, 0.6));
      [0, 1, 2].forEach((k) => tl.set("#o" + k + "d-4", { className: "d e" }, ${f(TM.oth22 + 0.7)} + k * 0.2));
      pop("#lb-gap", ${f(TM.oth22 + 0.3)});

      // ===== L23 every deposit does this → insolvent
      out("#lb-gap", ${f(L(23).start - 0.1)});
      [[200, 196], [300, 294], [400, 392], [500, 490]].forEach((v, k) => {
        const t0 = ${f(TM.all23)} + k * 0.45;
        tl.set("#tl-a", { textContent: String(v[0]) }, t0); tl.set("#tl-b", { textContent: String(v[1]) }, t0);
        if (k % 2 === 0) K7.toll(tl, "tcx", t0 - 0.2);
      });
      [0, 1, 2].forEach((k) => tl.set("#o" + k + "d-3", { className: "d e" }, ${f(TM.all23 + 0.6)} + k * 0.2));
      swap("#lb-vault", "#lb-insol", ${f(TM.ins23)});
      KIT.led(tl, "desk2-led", ${f(TM.ins23)}, "red"); KIT.broke(tl, "safe", ${f(TM.ins23 + 0.2)}, { ghost: 1, badge: false });

      // ===== L24 fix: record what actually arrived
      const c24 = ${f(L(24).start - 0.2)};
      out("#lb-insol, #tly, #odp0, #odp1, #odp2, #gcv0, #gcv1, #gcv2, #udp, #vdp, #lb-ex", c24, 0.25);
      ["ou0", "ou1", "ou2"].forEach((id) => shrink(id, c24));
      KIT.led(tl, "desk2-led", c24, "off"); KIT.fixed(tl, "safe", c24);
      slideIn("#cardD", ${f(TM.fix24)});
      ["cD0", "cD1"].forEach((r) => { tl.set("#" + r, { className: "cr" }, ${f(TM.fix24)}); rowOff(r, ${f(TM.fix24)}); });
      rowOn("cD2", ${f(TM.fix24 + 0.2)});
      grow("scX", ${f(TM.fix24 + 0.2)}, 0.5);
      rowOn("cD3", ${f(TM.rd24 - 0.2)});
      K7.pileTo(tl, "scX", ${f(TM.rd24 - 0.3)}, 5, 0.3); K7.read(tl, "scX", ${f(TM.rd24)}, "before", 1000, 0.5);
      rowOn("cD4", ${f(TM.rd24 + 0.8)});
      fin("#taxp-flow", ${f(TM.rd24 + 0.6)}, 0.2); K1.dash(tl, ["taxp-flow"], ${f(TM.rd24 + 0.6)}, 1.6, 200); K7.toll(tl, "tcx", ${f(TM.rd24 + 0.8)});
      K7.pileTo(tl, "scX", ${f(TM.rd24 + 1.4)}, 9, 0.3); K7.weigh(tl, "scX", ${f(TM.rd24 + 1.6)});
      K7.read(tl, "scX", ${f(TM.rd24 + 1.7)}, "after", 1098, 0.5);
      out("#taxp-flow", ${f(TM.rd24 + 2.3)});
      rowOn("cD5", ${f(TM.inc24)}); K7.diff(tl, "scX", ${f(TM.inc24)}, true, "增量 = 98");
      pop("#lb-scX", ${f(TM.inc24 + 0.1)});
      out("#lb-led", ${f(TM.inc24 + 0.2)}); K7.entry(tl, "desk2", ${f(TM.inc24 + 0.3)}, 1, 0.5); pop("#lb-led2", ${f(TM.inc24 + 0.4)});

      // ===== L25 with a reentrancy lock, so callbacks can't skew the two readings
      out("#lb-scX", ${f(L(25).start - 0.1)});
      slideOut("#cardD", ${f(L(25).start - 0.1)});
      grow("hsp", ${f(TM.lock25 - 0.4)}, 0.3);
      K4.hasp(tl, "hsp", ${f(TM.lock25 - 0.1)}, true, 0.6);
      pop("#lb-hsp", ${f(TM.lock25 + 0.3)});
      term("lock", ${f(TM.lock25)});
      grow("cbx", ${f(TM.cb25 - 0.4)}, 0.3); pop("#lb-cbx", ${f(TM.cb25)});
      K4.armPress(tl, "cbx", ${f(TM.cb25 + 0.1)}, { reach: 0.55, hold: 0.3 });
      K4.armPress(tl, "cbx", ${f(TM.cb25 + 1.4)}, { reach: 0.55, hold: 0.3 });

      // ===== L26 no library handles every odd token
      const c26 = ${f(L(26).start - 0.2)};
      out("#lb-hsp, #lb-cbx, #lb-led2, #lb-safe", c26);
      ["taxu", "taxp", "tcx", "safe", "desk2", "scX", "hsp", "cbx", "p3", "tc3"].forEach((id) => shrink(id, c26 + 0.1));
      for (let i = 0; i < 8; i++) fin("#lb-c" + i, ${f(TM.lib26 + 0.4)} + i * 0.08, 0.2);
      KIT.cam(tl, c26, CAMS.shelfEnd, 1.4);
      for (let i = 0; i < 8; i++) { K7.iconHi(tl, "c" + i, ${f(TM.lib26 + 0.4)} + i * 0.08, true); }
      for (let i = 0; i < 7; i++) tl.to("#gh" + i, { opacity: 1, duration: 0.3 }, ${f(TM.all26)} + i * 0.1);
      pop("#lb-more", ${f(TM.all26 + 0.4)});

      // ===== L27 audit: ask which tokens are supported
      out("#lb-more, #lb-c0, #lb-c1, #lb-c2, #lb-c3, #lb-c4, #lb-c5, #lb-c6, #lb-c7", ${f(L(27).start - 0.1)});
      for (let i = 0; i < 8; i++) K7.iconHi(tl, "c" + i, ${f(L(27).start)}, false);
      for (let i = 0; i < 7; i++) tl.to("#gh" + i, { opacity: 0.6, duration: 0.3 }, ${f(L(27).start)});
      grow("aud", ${f(TM.ask27 - 0.4)}); grow("audoc", ${f(TM.ask27 - 0.2)});
      pop("#lb-aud", ${f(TM.ask27)});
      pop("#lb-ask", ${f(TM.which27)});

      // ===== L28 unsupported kinds (fee-on-transfer, rebasing): reject explicitly
      out("#lb-ask", ${f(TM.taxreb28 - 0.2)});
      [2, 3].forEach((i, k) => {
        const t0 = ${f(TM.taxreb28)} + k * 0.35;
        tl.fromTo("#bar" + i, { opacity: 0, y: -140 }, { opacity: 1, y: 0, duration: 0.5, ease: "bounce.out", immediateRender: false }, t0);
        K7.iconHi(tl, "c" + i, t0, true);
      });
      term("reb", ${f(TM.reb28)});
      pop("#lb-rej", ${f(TM.rej28)}, 0.3);
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL);
