// Generates compositions/story.html for ep05/seg4「④ 账户层权限」.
// Run: node src/build-story.mjs
// World: "权限街区". Contract-layer button panel (mid avenue) on the left; TRON block on the right with the
// account safe (accountSafe, door opens to the right → kept clear) and the threshold meter behind-right of it.
// Scam victim / attacker stand in front of the safe; the OTC table sits further in front (hidden until L14).
// Camera: panel → TRON overview → safe → dials → witness → threshold → scam → OTC → back to the panel (developer).
import fs from "node:fs";
import { G, at, f, CE, M, box, camAt, gridSvg, worldSvg, wlab, wpin, dashCurve, BADGE, CHECK, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as LY from "./layout.mjs";
import { termCss, termCards } from "../../kit-ext/terms.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const w = (term, line, o = {}) => wordAt(T, term, { line, ...o }).start;
const L = (i) => lineAt(T, i);
const items = [];
const A = {};
const add = (y, svg) => items.push({ y, svg });
const put = (name, r, o, dy = 0) => { A[name] = r.anchors; add(at(o)[1] + dy, r.svg); return r; };
const lift = (svg, z) => `<g transform="translate(0,${f(-z * CE)})">${svg}</g>`;
const liftP = (p, z) => [p[0], p[1] - z * CE];
const scaleAt = (svg, p, k) => `<g transform="translate(${f(p[0])},${f(p[1])}) scale(${k}) translate(${f(-p[0])},${f(-p[1])})">${svg}</g>`;
const mid = (a, b, t = 0.5) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const up = (p, dy) => [p[0], p[1] - dy];
const rt = (p, dx, dy = 0) => [p[0] + dx, p[1] + dy];
const svgTxt = (x, y, s, size, fill, weight = 800, anchor = "start") => `<text x="${x}" y="${y}" font-family="Noto Sans SC, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;

// ================================================================ objects
// ---- mid avenue: main contract machine (seg1 MAIN) + its function panel
put("mm", E3.contractMachine(LY.MAIN, { id: "mm", name: "APP" }), LY.MAIN);
// ---- contract-layer panel, role board (owner hook empty), address mailbox + x-ray account
put("fp", X.funcPanel(LY.FP, { id: "fp", buttons: [
  { name: "mint", guard: "card", rd: "green" }, { name: "initialize", guard: "plate" }, { name: "kill", guard: "card", rd: "green" },
  { name: "upgrade", guard: "card", rd: "green" }, { name: "pause", guard: "card", rd: "green" }] }), LY.FP);
put("rb", X.roleBoard(LY.RB, { id: "rb", roles: ["owner", "upgrader", "pauser", "minter"], holders: [null, "multisig", "bot", "contract"],
  delays: ["", "", "", ""], empty: [0] }), LY.RB);
{ // x-ray: a small account safe "behind" the address mailbox
  const r = X.accountSafe(LY.AP_XRAY, { id: "ax", inserted: ["owner-0", "owner-1", "owner-2", "active-0", "active-1", "witness-0"], glow: false });
  const g = at(LY.AP_XRAY), k = 0.6;
  const T2 = (p) => [g[0] + (p[0] - g[0]) * k, g[1] + (p[1] - g[1]) * k];
  A.ax = { top: T2(r.anchors.top), center: T2(r.anchors.center), owner: T2(r.anchors.dials.owner), active: T2(r.anchors.dials.active) };
  add(g[1], `<g id="axw" opacity="0">${scaleAt(r.svg, g, k)}</g>`);
}
{ const r = E2.addrPlate(LY.AP, { id: "ap", text: "收到的地址" }); const g = at(LY.AP), k = 1.7; A.ap = { top: [g[0] + (r.anchors.top[0] - g[0]) * k, g[1] + (r.anchors.top[1] - g[1]) * k], center: [g[0] + (r.anchors.center[0] - g[0]) * k, g[1] + (r.anchors.center[1] - g[1]) * k] }; add(g[1], `<g id="apw" data-ox="${f(g[0])}" data-oy="${f(g[1])}">${scaleAt(r.svg, g, k)}</g>`); }
put("mag", O.magnifier(LY.MAG, { id: "mag" }), LY.MAG);

// ---- TRON block
put("eoa", O.hotWallet(LY.EOA, { id: "eoa" }), LY.EOA);
put("ek", O.key(LY.EOA_KEY, { id: "ek" }), LY.EOA_KEY);
put("ch", O.chain(LY.CHAIN, { id: "ch", n: 3 }), LY.CHAIN);
put("tm", X.thresholdMeter(LY.TM, { id: "tm", max: 4, th: 3, pipe: 110, pipeDir: "+u", thText: "3" }), LY.TM);
put("acct", X.accountSafe(LY.ACCT, { id: "acct" }), LY.ACCT);
put("hg", O.hourglass(LY.HG, { id: "hg" }), LY.HG);
put("atk", O.person(LY.ATK, { id: "atk", role: "attacker" }), LY.ATK);
put("vic", O.person(LY.VICTIM, { id: "vic", role: "signer" }), LY.VICTIM);
const fakeScr = `<rect x="0" y="0" width="76" height="150" fill="#fff4f2"/><rect x="0" y="0" width="76" height="26" fill="#e0453a"/>` +
  svgTxt(38, 18, "钱包", 12, "#ffffff", 900, "middle") +
  `<rect x="8" y="40" width="60" height="22" rx="4" fill="#ffffff" stroke="#e0453a" stroke-width="2"/>` + svgTxt(38, 56, "私钥", 11, "#c3352b", 800, "middle") +
  `<rect x="8" y="70" width="60" height="6" rx="3" fill="#f2c9c4"/><rect x="8" y="82" width="44" height="6" rx="3" fill="#f2c9c4"/>` +
  `<rect x="8" y="110" width="60" height="26" rx="7" fill="#e0453a"/>` + svgTxt(38, 128, "导入", 12, "#ffffff", 900, "middle");
const fakeScr2 = fakeScr.replace(svgTxt(38, 56, "私钥", 11, "#c3352b", 800, "middle"), svgTxt(38, 57, "••••••••", 12, "#1c1c1c", 900, "middle"));
put("ph", O.phone(LY.PHONE, { id: "ph", screen: fakeScr, screen2: fakeScr2 }), LY.PHONE);
// the leaked key (flies phone → attacker → Owner dial)
const KF0 = liftP(at(LY.PHONE, 0, 0, 0), 150);
{ const r = O.key(LY.PHONE, { id: "kf" }); add(1e6, `<g id="kfw" opacity="0">${lift(r.svg, 150)}</g>`); }

// ---- OTC table (in front, hidden until L14)
const oT = LY.OTC;
{
  let s = "";
  for (const [a, b] of [[-110, -70], [94, -70], [-110, 54], [94, 54]]) s += box(oT, a, a + 16, b, b + 16, 0, 72, M.ink, 1.2);
  s += box(oT, -130, 130, -86, 86, 72, 84, M.wood, 1.6);
  add(at(oT)[1], `<g id="otc-t" opacity="0">${s}</g>`);
  A.table = { top: at(oT, 0, 0, 84), c: at(oT, 0, 0, 84) };
}
const oS = { u: oT.u - 250, v: oT.v - 10 }, oBy = { u: oT.u + 250, v: oT.v + 10 };
{ const r = O.person(oS, { id: "scm", role: "attacker" }); A.scm = r.anchors; add(at(oS)[1], `<g id="scmw" opacity="0">${r.svg}</g>`); }
{ const r = O.person(oBy, { id: "buy", role: "signer" }); A.buy = r.anchors; add(at(oBy)[1], `<g id="buyw" opacity="0">${r.svg}</g>`); }
const buyScr = `<rect x="0" y="0" width="76" height="150" fill="#ffffff"/><rect x="0" y="0" width="76" height="26" fill="#1d93ba"/>` + svgTxt(38, 18, "余额", 12, "#ffffff", 900, "middle") +
  [0, 1, 2, 3].map((k) => `<ellipse cx="38" cy="${92 - k * 9}" rx="20" ry="7" fill="#3aa9cf" stroke="#17708d" stroke-width="1.4"/>`).join("") +
  svgTxt(38, 58, "₮", 16, "#17708d", 900, "middle") +
  `<rect x="8" y="112" width="60" height="26" rx="7" fill="#b9b3a8"/>` + svgTxt(38, 130, "转出", 12, "#ffffff", 900, "middle");
const oBP = { u: oT.u + 70, v: oT.v + 10 };
{ const r = O.phone(oBP, { id: "bph", screen: buyScr }); A.bph = { top: liftP(r.anchors.top, 84), screen: liftP(r.anchors.screen, 84) }; add(at(oBP)[1] + 0.5, `<g id="bphw" opacity="0">${lift(r.svg, 84)}</g>`); }
const oPK = { u: oT.u - 80, v: oT.v + 20 };
{ const r = O.doc(oPK, { id: "pk", title: "私钥", w: 110, h: 140 }); A.pk = { c: liftP(at(oPK, 0, 0, 0), 84) }; add(at(oPK)[1] + 0.6, `<g id="pkw" opacity="0">${lift(scaleAt(r.svg, at(oPK), 0.8), 84)}</g>`); }

items.sort((a, b) => a.y - b.y);
const world = worldSvg("wsvg", gridSvg({ u0: -2600, u1: 3400, v0: -2400, v1: 2600 }) + items.map((x) => x.svg).join("\n"), [-2400, -1600, 6000, 4200]);

// ================================================================ cameras
const D = A.acct.dials;
const CAMS = {
  fp: camAt(A.fp.center, 960, 540, 1.15),
  over: camAt(LY.tW([300, 430]), 960, 520, 0.75),
  acct: camAt(rt(A.acct.center, 60, -60), 900, 560, 1.15),
  dial: camAt(D.active, 960, 650, 1.6),
  wit: camAt(mid(D.witness, A.ch.center, 0.45), 900, 560, 1.05),
  th: camAt(mid(D.owner, A.tm.center, 0.35), 760, 560, 1.3),
  scam: camAt(LY.tW([1100, 640]), 960, 540, 0.9),
  otc: camAt(rt(A.table.c, 0, -30), 960, 520, 1.2),
  dev: camAt(mid(A.fp.center, A.rb.center), 960, 560, 0.95),
  dev2: camAt(mid(A.ap.center, A.ax.center), 760, 650, 1.3),
  dev3: camAt(mid(A.rb.center, A.ax.center, 0.4), 900, 560, 1.15),
};

// ================================================================ labels (world)
let labels = "";
labels += wlab("lb-fp", up(A.fp.top, 10), "合约层", "lab-g hide");
labels += wlab("lb-acl", up(A.acct.top, 30), "账户层", "lab-cs hide");
labels += wlab("lb-eoa", up(A.eoa.top, 0), "以太坊 EOA · 一把私钥", "hide");
labels += wlab("lb-acct", up(A.acct.top, 30), "TRON 账户 · 原生多重权限", "lab-cs hide");
labels += wlab("lb-src", rt(A.acct.top, 0, 12), "TRON 官方文档 · 安全公司资料", "lab-g lab-sm hide", "t");
labels += wlab("lb-own", up(D.owner, 90), "Owner · 权限最高", "lab-ink lab-sm hide");
labels += wlab("lb-own2", up(D.owner, 150), "能改其他权限 · 增删签名人", "lab-sm hide");
labels += wlab("lb-act", up(D.active, 90), "Active · 日常操作", "lab-ink lab-sm hide");
labels += wlab("lb-wit", up(D.witness, 90), "Witness", "lab-ink lab-sm hide");
labels += wlab("lb-ch", up(A.ch.top, 0), "超级代表 · 出块节点相关", "hide");
labels += wlab("lb-addr", rt(A.acct.keyholes["owner-1"], 0, 70), "每把钥匙 = 一个地址 · 圆牌 = 权重", "lab-sm hide", "t");
labels += wlab("lb-th", rt(A.tm.th, 60, 0), "阈值 3", "lab-cs hide", "l");
labels += wlab("lb-sum0", up(A.tm.top, 10), "权重 2 · 未到阈值", "lab-g hide");
labels += wlab("lb-sum1", up(A.tm.top, 10), "2 + 1 = 3 · 达到阈值", "lab-gs hide");
labels += wlab("lb-exec", rt(A.acct.window, 120, 40), "操作执行 ✓", "lab-gs lab-sm hide", "l");
labels += wlab("lb-scam", rt(A.acct.top, 200, 60), "骗局类型 · 公开资料", "lab-g hide", "l");
labels += wlab("lb-vic", up(A.vic.head ?? A.vic.top, 40), "受害者", "lab-g lab-sm hide");
labels += wlab("lb-fake", rt(A.ph.top, 40, 30), "假钱包 / 钓鱼页", "lab-r lab-sm hide", "l");
labels += wlab("lb-atk", up(A.atk.head ?? A.atk.top, 40), "攻击者", "lab-rs lab-sm hide");
labels += wlab("lb-leak", rt(A.atk.center, -60, -10), "拿到私钥", "lab-rs lab-sm hide", "r");
labels += wlab("lb-o2", up(D.owner, 90), "Owner → 攻击者", "lab-rs lab-sm hide");
labels += wlab("lb-a2", up(D.active, 90), "Active → 攻击者", "lab-rs lab-sm hide");
labels += wlab("lb-same", rt(A.acct.top, 200, 60), "柜子外观 · 一切照旧", "lab-g hide", "l");
labels += wlab("lb-bal", rt(A.acct.window, 0, 70), "余额 · 照常显示", "lab-sm hide", "t");
labels += wlab("lb-out", rt(A.acct.out, 0, 50), "转不出", "lab-rs hide", "t");
labels += wpin("bx-out", rt(A.acct.out, 0, -10), BADGE("bx-outi", 60, "hide"), "c");
labels += wlab("lb-in", rt(A.acct.inSlot, 30, -40), "转入 · 不需要签名", "lab-cs lab-sm hide", "l");
labels += wlab("lb-ok", rt(A.acct.top, 200, 60), "账户看起来正常", "lab-g hide", "l");
labels += wlab("lb-wait", up(A.hg.top, 0), "不急 · 等", "lab-r lab-sm hide");
labels += wlab("lb-take", rt(A.atk.center, -60, -10), "择机 · 全部转走", "lab-rs lab-sm hide", "r");
labels += wlab("lb-otc", up(A.table.top, 330), "场外交易 · OTC", "hide");
labels += wlab("lb-scm", up(A.scm.head ?? A.scm.top, 40), "骗子", "lab-rs lab-sm hide");
labels += wlab("lb-pk", rt(A.pk.c, -40, 60), "账户私钥", "lab-sm hide", "t");
labels += wlab("lb-has", up(A.bph.top, 10), "看得到余额", "lab-cs lab-sm hide");
labels += wlab("lb-no", up(A.bph.top, 10), "转不出", "lab-rs lab-sm hide");
labels += wlab("lb-fee", up(A.scm.head ?? A.scm.top, 40), "先付手续费", "lab-rs lab-sm hide");
labels += wlab("lb-dev", up(A.fp.top, 10), "对合约开发者", "lab-ink hide");
labels += wlab("lb-hook", up(A.rb.hooks[0], 60), "设成 owner？", "lab-sm hide", "t");
labels += wlab("lb-hook2", up(A.rb.hooks[0], 60), "查清后 · 再设 owner", "lab-gs lab-sm hide");
labels += wlab("lb-ap", rt(A.ap.top, -30, 0), "收到的地址", "lab-sm hide", "r");
labels += wlab("lb-ax", rt(A.ax.top, -30, 10), "背后：TRON 账户", "lab-cs lab-sm hide", "r");
labels += wlab("lb-int", rt(A.ax.top, -30, -50), "解读", "lab-g lab-sm hide", "r");
// Active sub-panels (world card, right of the safe top)
const actP = rt(up(A.acct.top, 40), 380, -20);
const ICO = {
  coin: `<svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="14" fill="#17708d" stroke="#0f5568" stroke-width="3"/><text x="17" y="23" font-size="16" font-weight="900" fill="#fff" text-anchor="middle" font-family="Noto Sans SC">₮</text></svg>`,
  lock: `<svg width="34" height="34" viewBox="0 0 34 34"><path d="M10 15V11a7 7 0 0 1 14 0v4" fill="none" stroke="#3b3e44" stroke-width="3.4"/><rect x="6" y="15" width="22" height="16" rx="3" fill="#3b3e44"/></svg>`,
  gear: `<svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="9" fill="none" stroke="#3b3e44" stroke-width="6" stroke-dasharray="4.2 2.8"/><circle cx="17" cy="17" r="5" fill="#3b3e44"/></svg>`,
};
const op = (k, ic, txt, on) => `<span class="aop${on ? "" : " off"}" id="${k}">${ICO[ic]}${txt}</span>`;
const actHtml = (`<div class="actc hide" id="actci">
  <div class="arow" id="ar0"><span class="an">Active 1</span>${op("ao0", "coin", "转账", 1)}${op("ao1", "lock", "质押", 1)}${op("ao2", "gear", "调用合约", 1)}</div>
  <div class="arow hide" id="ar1"><span class="an">Active 2</span>${op("ao3", "coin", "转账", 1)}${op("ao4", "lock", "质押", 0)}${op("ao5", "gear", "调用合约", 0)}</div>
  <div class="anote hide" id="anote">可以有多个 · 每个限定操作类型</div></div>`);
// balance dot matrix (same spot, L11–L13)
const ND = 18, ND0 = 8;
labels += wpin("bal", LY.tW([430, 250]), `<div class="bal hide" id="bali"><div class="bh">账户余额 <span>每点 = 一笔 USDT 转入</span></div><div class="bg">${
  Array.from({ length: ND }, (_, k) => `<i class="bd${k < ND0 ? "" : " hide"}" id="bd${k}"></i>`).join("")}</div></div>`, "t");
// developer checklist (L18)
labels += wpin("chk", rt(A.ax.center, 230, -60), `<div class="chk hide" id="chki"><div class="ch">设成 owner 之前</div>
  <div class="cr"><span>Owner 权限</span><b id="cq0">几把钥匙？</b></div><div class="cr"><span>阈值</span><b id="cq1">多少？</b></div>
  <div class="cok hide" id="cok">查清了 ✓</div></div>`, "l");
// world lines: Owner dial → Active / Witness dials (can modify), Witness → chain
const dO1 = dashCurve("dO1", up(D.owner, 30), up(D.active, 30), { color: "#1d93ba", c1: rt(D.owner, 40, -150), c2: rt(D.active, -40, -150), sw: 4 });
const dO2 = dashCurve("dO2", up(D.owner, 30), up(D.witness, 30), { color: "#1d93ba", c1: rt(D.owner, 80, -240), c2: rt(D.witness, -60, -240), sw: 4 });
const dW = dashCurve("dW", up(D.witness, 30), rt(A.ch.center, -20, 30), { color: "#1d93ba", c1: rt(D.witness, 40, -180), c2: rt(A.ch.center, -120, 120), sw: 4 });
const worldLines = `<svg class="wsvg" style="left:0;top:0" width="10" height="10" overflow="visible">${dO1.svg}${dO2.svg}${dW.svg}</svg>`;

// ================================================================ screen layer
const steps = ["① 泄露私钥", "② 改权限", "③ 转不出 · 仍可转入", "④ 择机转走"];
const stepHtml = `<div id="steps" class="hide"><div class="sh">多签诈骗</div>${steps.map((s, i) => `<div class="sc" id="sc${i}">${s}</div>`).join("")}</div>`;
const bigHtml = `<div id="bigx" class="hide"><div class="k-big">一个地址 <span class="neq">≠</span> 一把私钥</div><div class="bsub">在 TRON 上，这个假设不成立</div></div>`;

// ================================================================ times
const TM = {
  cl0: w("合约层", 0), ac0: w("账户本身", 0),
  eth1: w("以太坊", 1), key1: w("一把私钥", 1),
  s2: L(2).start, doc2: w("官方文档", 2), mp2: w("多重权限", 2),
  own3: w("Owner", 3), mod3: w("修改其他权限", 3), add3: w("增删签名人", 3),
  act4: w("Active", 4), tr4: w("转账", 4), st4: w("质押", 4), ca4: w("调用合约", 4), many4: w("有多个", 4), lim4: w("限定操作类型", 4),
  wit5: w("Witness", 5), sr5: w("超级代表", 5), blk5: w("出块节点", 5),
  s6: L(6).start, addr6: w("一组地址", 6), wt6: w("权重", 6),
  sum7: w("加起来", 7), th7: w("阈值", 7), ex7: w("执行", 7),
  s8: L(8).start, scam8: w("多签诈骗", 8),
  st9: w("第一步", 9), fake9: w("假钱包", 9), leak9: w("泄露", 9),
  st10: w("第二步", 10), mod10: w("修改账户权限", 10), own10: w("Owner", 10), self10: w("改成自己", 10),
  st11: w("第三步", 11), bal11: w("看到余额", 11), no11: w("转不出来", 11),
  in12: w("转入", 12), sig12: w("签名", 12), usdt12: w("USDT", 12), more12: w("继续转进来", 12),
  calm13: w("不急", 13), ok13: w("看起来正常", 13), pick13: w("择机", 13), all13: w("全部转走", 13),
  s14: L(14).start, otc14: w("场外交易", 14),
  scm15: w("骗子", 15), has15: w("有余额", 15), no15: w("转不出来", 15), fee15: w("手续费", 15),
  s16: L(16).start, dev16: w("开发者", 16), mean16: w("含义", 16),
  s17: L(17).start, addr17: w("一个地址", 17), key17: w("一把私钥", 17), no17: w("不成立", 17),
  s18: L(18).start, single18: w("单一私钥", 18), set18: w("设成", 18), cfg18: w("权限配置", 18),
};

// term cards (RETROFIT-deps rule 2)
const TC = termCards([
  { id: "tron", t: "TRON", d: "另一条公链 · 账户规则和以太坊不同", at: w("TRON", 2) },
  { id: "otc", t: "场外交易", d: "不经交易所 · 买卖双方私下成交", at: TM.otc14 },
]);

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #actci { position: absolute; left: 520px; top: 120px; }
    .actc { background: #fffdf8; border-radius: 16px; padding: 12px 18px 12px; box-shadow: 0 12px 26px rgba(70,60,40,0.14); border-left: 8px solid #1c1c1c; }
    .arow { display: flex; align-items: center; gap: 10px; height: 56px; white-space: nowrap; }
    .an { width: 128px; font-family: "JetBrains Mono", monospace; font-size: 28px; font-weight: 800; }
    .aop { display: inline-flex; align-items: center; gap: 6px; font-size: 28px; font-weight: 800; padding: 2px 12px 4px 6px; border-radius: 10px; background: #e3f3f8; color: #17708d; }
    .aop.off { background: #ece7dd; color: #b5afa3; }
    .aop.off svg { opacity: 0.35; }
    .anote { margin-top: 6px; font-size: 28px; font-weight: 700; color: #6d685e; white-space: nowrap; }
    .bal { width: 470px; background: #fffdf8; border-radius: 16px; padding: 12px 18px 16px; box-shadow: 0 12px 26px rgba(70,60,40,0.14); }
    .bal .bh { font-size: 30px; font-weight: 900; white-space: nowrap; }
    .bal .bh span { font-size: 28px; font-weight: 700; color: #6d685e; margin-left: 8px; }
    .bal .bg { display: grid; grid-template-columns: repeat(9, 40px); gap: 10px; margin-top: 10px; }
    .bal .bd { display: block; width: 40px; height: 40px; border-radius: 50%; background: #1f9d55; }
    .chk { width: 430px; background: #fffdf8; border-radius: 16px; padding: 12px 20px 16px; box-shadow: 0 12px 26px rgba(70,60,40,0.14); border-left: 8px solid #1d93ba; position: relative; }
    .chk .ch { font-size: 30px; font-weight: 900; white-space: nowrap; }
    .chk .cr { display: flex; justify-content: space-between; align-items: center; height: 52px; font-size: 30px; font-weight: 700; white-space: nowrap; }
    .chk .cr b { color: #c3352b; font-weight: 900; }
    .chk .cok { position: absolute; right: -20px; bottom: -26px; background: #1f9d55; color: #fff; font-size: 30px; font-weight: 900; border-radius: 10px; padding: 2px 14px 4px; white-space: nowrap; }
    #steps { position: absolute; left: 56px; top: 34px; display: flex; align-items: center; gap: 12px; }
    #steps .sh { font-size: 40px; font-weight: 900; margin-right: 8px; white-space: nowrap; }
    #steps .sc { font-size: 28px; font-weight: 800; padding: 4px 14px 6px; border-radius: 10px; background: #ffffff; border: 3px solid #d3ccbf; color: #8a8478; white-space: nowrap; }
    #bigx { position: absolute; left: 60px; top: 46px; }
    #bigx .k-big { font-size: 80px; }
    #bigx .neq { color: #e0453a; }
${termCss()}
    #bigx .bsub { margin-top: 8px; font-size: 32px; font-weight: 700; color: #6d685e; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        ${worldLines}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      ${stepHtml}${bigHtml}${actHtml}
      ${pills(4, { sections: SCRIPT.sections })}
      ${TC.html}
      <div class="k-title" id="ttl-card"><div class="t-main">④ 账户层权限</div><div class="t-sub">TRON 账户 · Owner / Active / Witness</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const K = window.KITX05;
      const $ = (id) => document.getElementById(id);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const op = (sel, t, to, d) => K.fade(tl, sel, t, to, d);
      const out = (sel, t, d) => sel.split(",").forEach((s) => op(s.trim(), t, 0, d || 0.2));
      const hideG = (id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); };
      const chip = (i, t, cls) => tl.to("#sc" + i, cls === "on" ? { backgroundColor: "#e0453a", borderColor: "#e0453a", color: "#ffffff", duration: 0.25 } : { backgroundColor: "#ffffff", borderColor: "#e0453a", color: "#c3352b", duration: 0.25 }, t);
      KIT.camSet(tl, CAMS.fp);
      ["acct", "tm", "ch", "vic", "ph", "atk", "hg", "mag"].forEach(hideG); tl.set("#apw", { scaleY: 0, svgOrigin: "${f(at(LY.AP)[0])} ${f(at(LY.AP)[1])}" }, 0);

      // ===== 0–1.6 title card → into the pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.2);

      // ===== L0 contract layer → account layer
      pop("#lb-fp", 1.7);
      K.swipe(tl, "fp", 0, ${f(TM.cl0)}, true); K.press(tl, "fp", 0, ${f(TM.cl0 + 0.5)});
      KIT.cam(tl, ${f(TM.ac0 - 0.9)}, CAMS.over, 1.6);
      KIT.grow(tl, "acct", ${f(TM.ac0)}, 0.5);
      pop("#lb-acl", ${f(TM.ac0 + 0.4)});

      // ===== L1 Ethereum EOA: one key
      out("#lb-fp", ${f(L(1).start - 0.2)});
      pop("#lb-eoa", ${f(TM.eth1)});
      KIT.pop(tl, "#ek", ${f(TM.key1)}, 0.35);

      // ===== L2 TRON: native multi-permission
      out("#lb-acl, #lb-eoa", ${f(TM.s2)});
      KIT.cam(tl, ${f(TM.s2)}, CAMS.acct, 1.3);
      pop("#lb-acct", ${f(TM.s2 + 0.5)});
      pop("#lb-src", ${f(TM.doc2)});
      ["owner", "active", "witness"].forEach((d, k) => { K.ring(tl, "acct", d, ${f(TM.doc2 + 1.0)} + k * 0.5, true); K.ring(tl, "acct", d, ${f(TM.doc2 + 1.4)} + k * 0.5, false); });
      ["owner", "active", "witness"].forEach((d, k) => { K.ring(tl, "acct", d, ${f(TM.mp2 - 0.4)} + k * 0.15, true); K.ring(tl, "acct", d, ${f(TM.mp2 + 0.8)}, false); });
      K.coinIn(tl, "acct", ${f(TM.doc2 + 2.6)}, 2, 0.35);

      // ===== L3 Owner: highest, can modify the other permissions
      out("#lb-acct, #lb-src", ${f(L(3).start - 0.1)});
      KIT.cam(tl, ${f(L(3).start - 0.1)}, CAMS.dial, 1.0);
      K.ring(tl, "acct", "owner", ${f(TM.own3)}, true); pop("#lb-own", ${f(TM.own3 + 0.1)});
      KIT.draw(tl, "dO1", ${f(TM.mod3)}, 0.5); KIT.draw(tl, "dO2", ${f(TM.mod3 + 0.25)}, 0.6);
      pop("#lb-own2", ${f(TM.add3)});

      // ===== L4 Active: day-to-day ops; several, each restricted
      out("#lb-own, #lb-own2, #dO1, #dO2", ${f(TM.act4 - 0.2)}); K.ring(tl, "acct", "owner", ${f(TM.act4 - 0.2)}, false);
      K.ring(tl, "acct", "active", ${f(TM.act4)}, true); pop("#lb-act", ${f(TM.act4 + 0.1)});
      pop("#actci", ${f(TM.tr4 - 0.6)});
      pop("#ao0", ${f(TM.tr4)}); pop("#ao1", ${f(TM.st4)}); pop("#ao2", ${f(TM.ca4)});
      pop("#ar1", ${f(TM.many4)});
      pop("#anote", ${f(TM.lim4)});

      // ===== L5 Witness: super representatives / block producers
      out("#lb-act, #actci", ${f(TM.wit5 - 0.2)}); K.ring(tl, "acct", "active", ${f(TM.wit5 - 0.2)}, false);
      KIT.cam(tl, ${f(TM.wit5 - 0.2)}, CAMS.wit, 1.1);
      K.ring(tl, "acct", "witness", ${f(TM.wit5)}, true); pop("#lb-wit", ${f(TM.wit5 + 0.1)});
      KIT.grow(tl, "ch", ${f(TM.sr5 - 0.3)}, 0.5);
      KIT.draw(tl, "dW", ${f(TM.sr5)}, 0.6);
      pop("#lb-ch", ${f(TM.blk5 - 0.2)});

      // ===== L6 each permission: addresses with weights; threshold meter
      out("#lb-wit, #lb-ch, #dW, #ch", ${f(TM.s6 - 0.1)}); K.ring(tl, "acct", "witness", ${f(TM.s6 - 0.1)}, false);
      KIT.cam(tl, ${f(TM.s6 - 0.1)}, CAMS.th, 1.1);
      K.ring(tl, "acct", "owner", ${f(TM.addr6 - 0.4)}, true);
      [0, 1, 2].forEach((j) => op("#acct-k-owner-" + j, ${f(TM.addr6)} + j * 0.2, 1, 0.25));
      pop("#lb-addr", ${f(TM.addr6 + 0.4)});
      KIT.grow(tl, "tm", ${f(TM.wt6 - 0.2)}, 0.5);
      pop("#lb-th", ${f(TM.wt6 + 0.3)});

      // ===== L7 sum of weights reaches the threshold → executes (key frame)
      out("#lb-addr", ${f(TM.sum7 - 0.4)});
      K.keyIn(tl, "acct", "owner-0", ${f(TM.sum7 - 0.4)}); K.fill(tl, "tm", ${f(TM.sum7 + 0.3)}, 2, 0.5);
      pop("#lb-sum0", ${f(TM.sum7 + 0.4)});
      K.keyIn(tl, "acct", "owner-1", ${f(TM.th7 - 0.2)}); K.fill(tl, "tm", ${f(TM.th7 + 0.5)}, 3, 0.45);
      KIT.swap(tl, "#lb-sum0", "#lb-sum1", ${f(TM.th7 + 0.8)}, 0.25);
      KIT.door(tl, "acct", ${f(TM.ex7 - 0.4)}, 100, 0.9);
      pop("#lb-exec", ${f(TM.ex7 + 0.2)});

      // ===== L8 scam: reset, label, four steps
      out("#lb-sum1, #lb-exec, #lb-th", ${f(TM.s8 - 0.1)});
      KIT.door(tl, "acct", ${f(TM.s8 - 0.1)}, 0, 0.7);
      K.keyOut(tl, "acct", "owner-0", ${f(TM.s8)}); K.keyOut(tl, "acct", "owner-1", ${f(TM.s8 + 0.1)}); op("#acct-k-owner-2", ${f(TM.s8 + 0.3)}, 0, 0.3);
      K.fill(tl, "tm", ${f(TM.s8 + 0.2)}, 0, 0.6); K.ring(tl, "acct", "owner", ${f(TM.s8)}, false);
      KIT.cam(tl, ${f(TM.s8 + 0.2)}, CAMS.scam, 1.3);
      out("#eoa, #ek, #tm", ${f(TM.s8 + 0.4)}, 0.4);
      pop("#lb-scam", ${f(TM.s8 + 0.8)});
      pop("#steps", ${f(TM.scam8)});

      // ===== L9 step 1: fake wallet / phishing page leaks the key
      out("#lb-scam", ${f(TM.st9 - 0.1)});
      chip(0, ${f(TM.st9)}, "on");
      KIT.grow(tl, "vic", ${f(TM.st9)}, 0.45); KIT.grow(tl, "ph", ${f(TM.st9 + 0.2)}, 0.45);
      pop("#lb-vic", ${f(TM.st9 + 0.5)});
      pop("#lb-fake", ${f(TM.fake9)});
      KIT.swap(tl, "#ph-scr", "#ph-scr2", ${f(TM.leak9 - 0.5)}, 0.2);
      KIT.grow(tl, "atk", ${f(TM.fake9 + 0.6)}, 0.45); pop("#lb-atk", ${f(TM.fake9 + 1.0)});
      op("#kfw", ${f(TM.leak9 - 0.3)}, 0.85, 0.2);
      K.fly(tl, "kfw", ${f(TM.leak9)}, ${f(A.atk.center[0] - 70 - KF0[0])}, ${f(A.atk.center[1] - 20 - KF0[1])}, 0.9, 120);
      pop("#lb-leak", ${f(TM.leak9 + 0.8)});

      // ===== L10 step 2: attacker re-keys Owner and Active
      chip(0, ${f(TM.st10)}, "done"); chip(1, ${f(TM.st10)}, "on");
      out("#lb-leak", ${f(TM.st10)});
      K.fly(tl, "kfw", ${f(TM.mod10 - 0.6)}, ${f(D.owner[0] + 60 - KF0[0])}, ${f(D.owner[1] - KF0[1])}, 0.9, 140);
      K.ring(tl, "acct", "owner", ${f(TM.mod10 + 0.2)}, true);
      op("#kfw", ${f(TM.mod10 + 0.6)}, 0, 0.25);
      K.cores(tl, "acct", ${f(TM.own10 - 0.1)}, "attacker", ["owner", "active"], 0.35);
      pop("#lb-o2", ${f(TM.own10)}); pop("#lb-a2", ${f(TM.own10 + 0.35)});
      pop("#lb-same", ${f(TM.self10)});

      // ===== L11 step 3: balance visible, can't send out
      chip(1, ${f(TM.st11)}, "done"); chip(2, ${f(TM.st11)}, "on");
      out("#lb-same, #lb-o2, #lb-a2", ${f(TM.st11)}); K.ring(tl, "acct", "owner", ${f(TM.st11)}, false);
      pop("#bali", ${f(TM.bal11 - 0.3)}); pop("#lb-bal", ${f(TM.bal11)});
      K.gate(tl, "acct", ${f(TM.no11 - 0.3)}, true);
      pop("#bx-outi", ${f(TM.no11)}); pop("#lb-out", ${f(TM.no11 + 0.1)});

      // ===== L12 incoming transfers need no signature: more USDT keeps arriving
      out("#lb-bal", ${f(TM.in12 - 0.2)});
      pop("#lb-in", ${f(TM.in12)});
      [0, 1, 2].forEach((r) => {
        const t0 = ${f(TM.in12 + 0.2)} + r * 1.35;
        K.coinIn(tl, "acct", t0, 3, 0.3);
        [0, 1, 2].forEach((k) => { const i = ${ND0} + r * 3 + k; if (i < ${ND}) pop("#bd" + i, t0 + 0.5 + k * 0.3, 0.25); });
      });

      // ===== L13 attacker waits, then takes it all
      chip(2, ${f(TM.calm13)}, "done"); chip(3, ${f(TM.calm13)}, "on");
      out("#lb-in, #lb-out, #bx-outi", ${f(L(13).start)});
      KIT.grow(tl, "hg", ${f(TM.calm13 - 0.3)}, 0.45); pop("#lb-wait", ${f(TM.calm13 + 0.1)});
      KIT.sand(tl, "hg", ${f(TM.calm13 + 0.2)}, ${f(TM.pick13 - TM.calm13 - 0.2)});
      pop("#lb-ok", ${f(TM.ok13)});
      K.gate(tl, "acct", ${f(TM.pick13)}, false);
      K.coinOut(tl, "acct", ${f(TM.pick13 + 0.4)});
      for (let i = 0; i < ${ND}; i++) { tl.to("#bd" + i, { backgroundColor: "#e0453a", duration: 0.15 }, ${f(TM.all13 - 0.2)}); op("#bd" + i, ${f(TM.all13 + 0.2)} + i * 0.04, 0, 0.15); }
      pop("#lb-take", ${f(TM.all13)});

      // ===== L14 OTC
      out("#lb-take, #lb-wait, #lb-ok, #bali, #lb-atk, #lb-vic, #lb-fake, #steps", ${f(TM.s14 - 0.1)});
      KIT.cam(tl, ${f(TM.s14 - 0.1)}, CAMS.otc, 1.3);
      op("#otc-t", ${f(TM.s14 + 0.2)}, 1, 0.4); op("#scmw", ${f(TM.s14 + 0.4)}, 1, 0.4); op("#buyw", ${f(TM.s14 + 0.5)}, 1, 0.4);
      op("#bphw", ${f(TM.s14 + 0.7)}, 1, 0.3);
      pop("#lb-otc", ${f(TM.otc14)});

      // ===== L15 scammer hands over a key to a full-but-locked account, asks for a fee
      pop("#lb-scm", ${f(TM.scm15)});
      op("#pkw", ${f(TM.scm15 + 0.2)}, 1, 0.25);
      K.fly(tl, "pkw", ${f(TM.scm15 + 0.6)}, ${f((at(oBP)[0] - at(oPK)[0]) * 0.55)}, ${f((at(oBP)[1] - at(oPK)[1]) * 0.55)}, 0.7, 10);
      pop("#lb-pk", ${f(TM.scm15 + 0.9)});
      pop("#lb-has", ${f(TM.has15)});
      KIT.swap(tl, "#lb-has", "#lb-no", ${f(TM.no15)}, 0.25);
      out("#lb-scm", ${f(TM.fee15 - 0.5)}); pop("#lb-fee", ${f(TM.fee15 - 0.3)});

      // ===== L16 for contract developers: back to the panel; an empty owner hook
      out("#lb-otc, #lb-pk, #lb-no, #lb-fee", ${f(TM.s16 - 0.1)});
      KIT.cam(tl, ${f(TM.s16 - 0.1)}, CAMS.dev, 1.5);
      pop("#lb-dev", ${f(TM.dev16)});
      pop("#lb-hook", ${f(TM.mean16)});

      // ===== L17 one address ≠ one key: x-ray behind the mailbox
      out("#lb-dev", ${f(TM.s17)});
      KIT.cam(tl, ${f(TM.s17)}, CAMS.dev2, 1.0);
      KIT.grow(tl, "apw", ${f(TM.s17 + 0.2)}, 0.45); pop("#lb-ap", ${f(TM.addr17 - 0.3)});
      op("#axw", ${f(TM.addr17)}, 1, 0.5); pop("#lb-ax", ${f(TM.addr17 + 0.4)});
      pop("#bigx", ${f(TM.key17 - 0.2)}, 0.35);

      // ===== L18 check the permission config before setting owner (interpretation)
      out("#bigx", ${f(TM.s18)}, 0.25);
      KIT.grow(tl, "mag", ${f(TM.s18)}, 0.45);
      K.moveUV(tl, "mag", ${f(TM.s18 + 0.5)}, 40, -150, 60, 1.0, 20);
      pop("#chki", ${f(TM.single18)});
      pop("#lb-int", ${f(TM.single18 + 0.4)});
      tl.to("#cq0, #cq1", { color: "#17708d", duration: 0.2 }, ${f(TM.cfg18 - 0.6)});
      pop("#cok", ${f(TM.cfg18 - 0.3)});
      KIT.cam(tl, ${f(TM.cfg18 - 0.3)}, CAMS.dev3, 0.9);
      K.hang(tl, "rb", 0, ${f(TM.cfg18 + 0.5)});
      KIT.swap(tl, "#lb-hook", "#lb-hook2", ${f(TM.cfg18 + 0.7)}, 0.25);
      tl.set({}, {}, ${f(TOTAL)});
      ${TC.js}
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL);
