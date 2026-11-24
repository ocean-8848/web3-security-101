// Generates compositions/story.html for ep04/seg5a「⑤ 回调入口」(one isometric world, one camera).
// Run: node src/build-story.mjs
import fs from "node:fs";
import { G, at, Wp, CE, box, M, f, camAt, gridSvg, worldSvg, wlab, wpin, kitCss, runtimeJs, faceV, faceTop, CHECK } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { P, EXITS, BANK, STACK, DESK, DESK_TOP, LEDGER, COUNTER, COUNTER_SCALE } from "./layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const LN = T.lines.map((_, i) => lineAt(T, i));
const w = (term, opt) => wordAt(T, term, opt).start;
const we = (term, opt) => wordAt(T, term, opt).end;

// ------------------------------------------------------------------ objects (painter order by ground Y)
const items = [];
const add = (Y, svg) => items.push({ Y, svg });
const A_ = {}, OR = {};
const obj = (key, fn, pt, opts, dy = 0) => { const o = G(pt[0], pt[1]); const r = fn(o, opts); A_[key] = r.anchors; OR[key] = o; add(at(o)[1] + dy, r.svg); return r; };

// ---- zone A: Bank with its six exits
// Bank, call stack on the roof and the ledger desk — same build as seg1 (../../seg1/src/build-story.mjs)
const oBank = BANK;
const bank = E1.vending(oBank, { id: "bk", sign: "BANK", maintDoor: true }); A_.bank = bank.anchors; add(at(oBank)[1], bank.svg);
{
  const fs0 = E3.frameStack({ u: STACK.u, v: STACK.v }, { id: "stk", n: STACK.n, labels: ["#1", "#2", "#3"], filled: 0 });
  const [sgx, sgy] = Wp(STACK.u, STACK.v, 0), sLift = STACK.z * CE, sk = STACK.scale;
  add(at(oBank)[1] + 0.5, `<g transform="translate(${f(sgx)},${f(sgy - sLift)}) scale(${sk}) translate(${f(-sgx)},${f(-sgy)})">${fs0.svg}</g>`);
  let s = box(DESK, -80, 80, -100, 100, 0, DESK_TOP - 8, M.white, 1.6);
  s += box(DESK, -88, 88, -108, 108, DESK_TOP - 8, DESK_TOP, M.wood, 1.4);
  s += E2.liftSvg(O.ledgerBook(LEDGER, { id: "bkl", scale: 0.55 }).svg, DESK_TOP);
  const ctr = E2.rollCounter(COUNTER, { id: "bkc", digits: 1, value: 0, z: DESK_TOP });
  const [cx0, cy0] = at(COUNTER, 0, 0, DESK_TOP), ck = COUNTER_SCALE;
  s += `<g transform="translate(${f(cx0)},${f(cy0)}) scale(${ck}) translate(${f(-cx0)},${f(-cy0)})">${ctr.svg}</g>`;
  const cT = (q) => [cx0 + (q[0] - cx0) * ck, cy0 + (q[1] - cy0) * ck];
  A_.bkCtr = { window: cT(ctr.anchors.window), top: cT(ctr.anchors.top) };
  add(at(DESK)[1], `<g id="desk">${s}</g>`);
}
const exitEnds = [];
EXITS.forEach((e, i) => {
  const th = (e.deg * Math.PI) / 180, c = Math.cos(th), s = Math.sin(th);
  const t0 = Math.min(100 / Math.abs(c || 1e-6), 75 / Math.abs(s || 1e-6));
  const pp = E1.pipe(oBank, { id: "ex" + i, r: 11, pts: [[c * t0, s * t0, 26], [c * e.R, s * e.R, 26]] });
  A_["ex" + i] = pp.anchors;
  add(at(oBank)[1] + 1 + i * 0.01, pp.svg);
  exitEnds.push({ end: at(oBank, c * e.R, s * e.R, 26), lab: at(oBank, c * (e.R + 34), s * (e.R + 34), 26), q: at(oBank, c * e.R, s * e.R, [120,120,120,70,120,120][i]) });
});
// hasps on Bank buttons 0..2 (withdraw / transfer / deposit) — hidden until L14
const hasps = [0, 1, 2].map((i) => { const b = X.vendButton(oBank, i); const r = X.hasp(b.o, { id: "hk" + i, z: b.z, scale: b.scale, locked: false, shared: i === 0 }); A_["hk" + i] = r.anchors; return r; });
add(at(oBank)[1] + 2, `<g id="hk-wrap" opacity="0">${hasps.map((h) => h.svg).join("")}</g>`);
const hkChain = X.haspChain("hkc", [A_.hk0.eye, A_.hk1.eye, A_.hk2.eye], { shown: false, sag: 10 });
const mag = obj("mag", O.magnifier, P.mag, { id: "mg", z: 30 }, 400);

// ---- zone B: imBTC / Lendf.Me
obj("tok", E1.miniVend, P.tok, { id: "tk", kind: "token", label: "imBTC" });
obj("atk1", E1.miniVend, P.atk1, { id: "a1", kind: "attacker" });
const lend = obj("lend", E1.vending, P.lend, { id: "ld", sign: "LEND", scale: P.lendS });
obj("arm1", X.callbackArm, P.arm1, { id: "cb1", scale: 0.75, target: lend.anchors.buttons[1], maxReach: 700, coin: false });
obj("ldLedger", O.ledgerBook, P.ldLedger, { id: "ldl" });
obj("ldCtr", E2.rollCounter, P.ldCtr, { id: "ldc", digits: 3, value: 100 });

// ---- zone C: BNB Chain forks
obj("bnbSign", E1.signBoard, P.bnbSign, { id: "bns", text: "BNB Chain", sub: "常见模式", size: 44 });
obj("orig", E1.vending, P.orig, { id: "og", sign: "ETH", scale: 0.7 });
obj("cpA", O.checkpoint, P.cpA, { id: "cpA", n: "上架" });
P.forks.forEach((pt, i) => obj("fk" + i, E1.miniVend, pt, { id: "fk" + i, kind: "plain", scale: 0.5 }));
const fork = obj("fork", E1.vending, P.fork, { id: "fo", sign: "FORK", scale: P.forkS });
obj("cpB", O.checkpoint, P.cpB, { id: "cpB", n: "上架" });
obj("foLedger", O.ledgerBook, P.foLedger, { id: "fol" });
// evil token + its arm ride together (group translated as a whole)
const oEv = G(P.evil[0], P.evil[1]), evil = E1.miniVend(oEv, { id: "ev", kind: "token", state: "attacker", label: "TOKEN" });
const oEa = G(P.evilArm[0], P.evilArm[1]), evArm = X.callbackArm(oEa, { id: "cb2", scale: 0.75, target: fork.anchors.buttons[0], maxReach: 700 });
// boundary ring around the listing gate (L7)
const ringO = OR.cpB;
const ring = `<g id="ringB" opacity="0"><g transform="${faceTop(ringO, 0, 40, 0)}"><ellipse cx="0" cy="0" rx="240" ry="200" fill="rgba(42,163,201,0.10)" stroke="#1d93ba" stroke-width="7"/></g></g>`;
add(at(ringO)[1] + 0.5, ring);

// ---- zone D: Penpie
obj("pAtk", O.person, P.pAtk, { id: "pa", role: "attacker" });
obj("mkt", E1.miniVend, P.mkt, { id: "mk", kind: "plain", state: "attacker" });
const pen = obj("pen", E1.vending, P.pen, { id: "pp", sign: "PENPIE", scale: P.penS });
obj("arm3", X.callbackArm, P.arm3, { id: "cb3", scale: 0.75, target: pen.anchors.coinSlot, maxReach: 700, coin: true });

// dashed "no lock here" slots on deposit / claim buttons
const noLock = (id, oVm, i, s) => {
  const b = X.vendButton(oVm, i, s), k = b.scale;
  return `<g id="${id}" opacity="0"><g transform="${faceV(b.o, -30 * k, 3, b.z + 18 * k)}"><rect x="0" y="0" width="${f(60 * k)}" height="${f(36 * k)}" rx="5" fill="rgba(224,69,58,0.10)" stroke="#e0453a" stroke-width="3" stroke-dasharray="7 5"/></g></g>`;
};
add(at(OR.fork)[1] + 1, noLock("nlB", OR.fork, 0, P.forkS));
add(at(OR.pen)[1] + 1, noLock("nlD", OR.pen, 0, P.penS));

// flying coins (gold iso discs)
const coin = (id, p, cls = "gold") => {
  const fill = cls === "red" ? "#e8574c" : "#f2c14e", st = cls === "red" ? "#a8322a" : "#a7791c";
  return `<g id="${id}" opacity="0"><g transform="translate(${f(p[0])},${f(p[1])})"><ellipse cx="0" cy="4" rx="17" ry="10" fill="${st}"/><ellipse cx="0" cy="0" rx="17" ry="10" fill="${fill}" stroke="${st}" stroke-width="1.5"/><ellipse cx="0" cy="0" rx="10" ry="6" fill="none" stroke="#fff3c8" stroke-width="1.4"/></g></g>`;
};
const coinA = A_.tok.tray, coinB = A_.atk1.tray, coinC = lend.anchors.coinSlot;

items.sort((a, b) => a.Y - b.Y);
const evilSvg = `<g id="evil-g">${evil.svg}${evArm.svg}</g>`;
// the evil token is drawn after zone C's ground items that are farther away; it stays in front of the gate road
const world = worldSvg("wsvg", gridSvg({ u0: -3000, u1: 6000, v0: -2600, v1: 5200 }) +
  items.map((x) => x.svg).join("\n") + evilSvg + hkChain.svg +
  coin("cn1", coinA) + coin("cn2", coinB) + coin("cn3", A_.arm3.pan), [-1500, -1500, 8200, 5200]);

// ------------------------------------------------------------------ labels (world, counter-scaled)
const SEC = SCRIPT.sections;
let labels = "";
const lab = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, (cls + " hide").trim(), a); };
const off = (p, dx, dy) => [p[0] + dx, p[1] + dy];
lab("lb-bank", at(oBank, -100, -75, 430), "Bank 合约", "", "r");
EXITS.forEach((e, i) => lab("lb-ex" + i, exitEnds[i].lab, `<span class="gn">${i + 1}</span>${e.name}`, "", e.a));
EXITS.forEach((e, i) => { labels += wpin("q" + i, exitEnds[i].q, `<div class="qm hide" id="q${i}">?</div>`, "c"); });
EXITS.forEach((e, i) => { labels += wpin("ck" + i, off(exitEnds[i].end, 0, -4), CHECK("ckb" + i, 40, "hide"), "c"); });
lab("lb-bkc", A_.bkCtr.top, "余额 0 · 已更新", "lab-gs");
lab("lb-lock", off(A_.hk1.lock, 70, 0), "同一把锁", "lab-gs", "l");
lab("lb-ents", off(A_.hk0.lock, 70, -50), "读写同一余额的入口", "", "l");

lab("lb-tok", A_.tok.top, "imBTC · ERC-777 代币", "lab-cs");
lab("lb-atk1", off(A_.atk1.top, -30, 0), "持有人（攻击合约）", "lab-rs");
lab("lb-hook", off(A_.arm1.ground, 0, 40), "注册的钩子", "lab-r", "t");
lab("lb-lend", lend.anchors.top, "借贷协议 Lendf.Me");
lab("lb-dep1", off(lend.anchors.buttons[0], 60, -34), "存款", "lab-sm", "l");
lab("lb-wd1", off(lend.anchors.buttons[1], 60, 30), "取款", "lab-sm", "l");
lab("lb-ldc", off(A_.ldCtr.window, 80, 0), "抵押记录", "", "l");
lab("lb-old", A_.ldCtr.top, "读出旧值 100", "lab-ink", "b");
lab("lb-pull", off(lend.anchors.trayOut, 40, 50), "回调里提走存款", "lab-r", "l");
lab("lb-wb", A_.ldCtr.top, "用旧值写回 → 200", "lab-r", "b");
lab("lb-high", off(A_.ldCtr.ground, 0, 46), "虚高 · 实际只剩 100", "lab-rs", "t");
lab("lb-demo", off(A_.ldCtr.window, 80, 50), "示意数字", "lab-g lab-sm", "l");
lab("lb-borrow", off(lend.anchors.trayOut, 40, 50), "按虚高抵押借出", "lab-rs", "l");

lab("lb-orig", A_.orig.top, "以太坊原协议");
lab("lb-forks", off(A_.fk1.top, 70, -10), "分叉项目", "");
lab("lb-wl", A_.cpA.top, "白名单", "lab-gs", "b");
lab("lb-any", A_.cpB.top, "任意代币", "lab-rs", "b");
lab("lb-dep2", off(fork.anchors.buttons[0], 50, -70), "存款 · 没加锁", "lab-r", "l");
lab("lb-ev", off(evil.anchors.ground, 0, 40), "攻击者部署的代币", "lab-rs", "t");
labels += wpin("slip", off(A_.foLedger.top, 90, 0), `<div class="slip hide" id="slip"><div class="sh">存款账本</div><div class="sr" id="sr0">存入 100</div><div class="sr sr-red" id="sr1" style="opacity:0">存入 100</div></div>`, "l");
lab("lb-twice", off(A_.foLedger.ground, 40, 60), "同一笔资产记了两次", "lab-rs", "t");
lab("lb-bound", off(A_.cpB.ground, -40, 190), "上架流程 = 安全边界", "lab-cs", "t");

lab("lb-pAtk", A_.pAtk.top, "攻击者", "lab-rs lab-sm");
lab("lb-mkt", off(A_.mkt.top, 0, 0), "无许可创建的市场", "lab-rs");
lab("lb-mtok", off(A_.mkt.front, -90, 30), "恶意代币", "lab-r", "r");
lab("lb-pen", pen.anchors.top, "Penpie");
lab("lb-claim", off(pen.anchors.buttons[0], 40, -40), "批量领取奖励 · 没有锁", "lab-r", "l");
lab("lb-dep3", off(pen.anchors.coinSlot, 50, 40), "回调里存入", "lab-r", "l");
lab("lb-rew", off(pen.anchors.trayOut, 40, 60), "存款 → 奖励", "lab-rs", "l");

// ------------------------------------------------------------------ cameras
const Cc = (pt, k, sx = 960, sy = 520) => camAt(pt, sx, sy, k);
const CAMS = {
  open: Cc([0, 0], 1.08, 930, 575),
  zB: Cc(P.camB, 1.12, 1180, 560),
  zB2: Cc(P.camB, 1.12, 1180, 560),
  zC: Cc(P.camC, 0.85, 1040, 600),
  zC3: Cc(P.camC3, 1.05, 1060, 560),
  zD: Cc(P.camD, 1.25, 1000, 650),
  audit: Cc([0, 0], 0.95, 1215, 590),
  lock: Cc(P.camLock, 1.8, 1240, 400),
};

// ------------------------------------------------------------------ times
const TM = {
  eth: w("ETH", { line: 0 }), only: w("不只是"),
  imbtc: w("imBTC"), erc: w("ERC"), xfer1: w("转账时", { line: 1 }), cb1: w("回调", { line: 1 }), hook: w("钩子"),
  lend: w("借贷协议"), dep: w("存款函数", { line: 2 }), ret: w("返回时"), old: w("旧值"), wb: w("写回"), high: w("虚高"),
  borrow: w("借走"), amt: w("2500"), est: w("事发时估值"), blk: w("The"), back: w("已归还"),
  bnb: w("BNB"), forked: w("分叉自"),
  wl: w("白名单"), any: w("任意代币", { line: 5 }), nolock: w("没给"),
  list: w("上架", { line: 6 }), own: w("自己部署"), xferf: w("转账函数"), cbdep: w("回调存款"), twice: w("记了两次"),
  anyTok: w("允许任意代币"), anyCb: w("允许任意回调"), flow: w("上架流程"), bound: w("安全边界"),
  pen: w("Penpie"), loss: w("损失"),
  perm: w("无许可"), evtok: w("恶意代币"),
  claim: w("批量领取奖励"), nolk: w("没有锁"), dep10: w("存入资产"), rew: w("变成了奖励"),
  step1: w("第一步"), all: w("所有外部调用"), tok11: w("代币转账"), nft: w("NFT"), cb11: w("回调", { line: 11 }), low: w("低级"), none: w("一个都不漏"),
  ask: w("问两句"), fin: w("最终值"), share: w("共用同一把锁"),
};

// ------------------------------------------------------------------ html
const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 88px; }
    .qm { width: 64px; height: 64px; border-radius: 50%; background: #1d93ba; color: #fff; font-size: 44px; font-weight: 900; line-height: 62px; text-align: center; box-shadow: 0 6px 14px rgba(70,60,40,0.18); }
    .card { position: absolute; left: 60px; top: 130px; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); padding: 22px 32px 24px; white-space: nowrap; }
    .card .ev-t { font-size: 40px; font-weight: 900; }
    .card .ev-d { font-size: 30px; font-weight: 700; color: #6d685e; margin-bottom: 6px; }
    .card .ev-r { margin-top: 12px; font-size: 34px; font-weight: 900; display: flex; align-items: center; gap: 14px; }
    .card .ev-r .lab { position: static; }
    .card .ev-g { color: #17804a; }
    .card2 { top: 300px; padding-top: 10px; }
    .card2 .ev-r { margin-top: 10px; }
    .slip { background: #ffffff; border: 3px solid #1c1c1c; border-radius: 10px; padding: 10px 18px 12px; box-shadow: 0 8px 16px rgba(70,60,40,0.16); white-space: nowrap; }
    .slip .sh { font-size: 28px; font-weight: 800; color: #6d685e; margin-bottom: 6px; }
    .slip .sr { font-family: "JetBrains Mono", "Noto Sans SC", monospace; font-size: 32px; font-weight: 800; padding: 2px 10px; border-radius: 6px; border: 3px solid transparent; }
    .slip .sr-red { border-color: #e0453a; background: #fdeae7; color: #c3352b; }
    #kw { position: absolute; left: 0; right: 0; top: 128px; text-align: center; }
    #kw .k-big { display: inline-block; font-size: 64px; background: #fffdf8; border-radius: 18px; padding: 14px 40px 20px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    #kw .k-big b { color: #c3352b; }
    #ck { position: absolute; left: 60px; top: 130px; width: 700px; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); padding: 22px 32px 26px; }
    #ck .ck-t { font-size: 38px; font-weight: 900; margin-bottom: 8px; }
    #ck .ck-r { margin-top: 14px; }
    #ck .ck-h { display: flex; align-items: center; gap: 14px; font-size: 34px; font-weight: 900; white-space: nowrap; }
    #ck .ck-id { font-family: "JetBrains Mono", monospace; font-size: 28px; font-weight: 800; color: #fff; background: #1d93ba; border-radius: 8px; padding: 2px 10px 4px; }
    #ck .chips { display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0 0 0; }
    #ck .chip { font-size: 30px; font-weight: 800; color: #17809f; border: 3px solid #2aa3c9; border-radius: 10px; padding: 2px 12px 4px; background: #fff; }
    #ck .chip.all { color: #fff; background: #1d93ba; border-color: #1d93ba; }
    #ck .ok { margin-left: auto; }
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
      <div class="card hide" id="ev1">
        <div class="ev-d">2020 年 4 月 · 以太坊</div>
        <div class="ev-t">imBTC / Lendf.Me</div>
        </div>
      <div class="card card2 hide" id="ev1b">
        <div class="ev-r" id="ev1-amt">借走约 2500 万美元 <span class="lab lab-g lab-sm">事发时估值</span></div>
        <div class="ev-r ev-g" id="ev1-back" style="opacity:0">资金后来已归还 <span class="lab lab-g lab-sm">The Block 报道</span></div>
      </div>
      <div class="card hide" id="ev2">
        <div class="ev-d">BNB Chain</div>
        <div class="ev-t">分叉项目的回调入口</div>
        <div class="ev-r"><span class="lab lab-g lab-sm">常见模式 · 不是单一事件</span></div>
      </div>
      <div class="card hide" id="ev3">
        <div class="ev-d">2024 年 9 月 · 以太坊</div>
        <div class="ev-t">Penpie · 损失约 2700 万美元</div>
        <div class="ev-r"><span class="lab lab-g lab-sm">Halborn、Verichains 分析</span></div>
      </div>
      <div class="tcard hide" id="tc1" style="top:350px"><div class="t1">分叉</div><div class="t2">复制别的项目的代码 · 再改动</div></div>
      <div class="tcard hide" id="tc2"><div class="t1">白名单</div><div class="t2">只放行事先批准的对象</div></div>
      <div id="kw"><div class="k-big hide" id="kwc">允许任意代币 = 允许<b>任意回调</b></div></div>
      <div id="ck" class="hide">
        <div class="ck-t">审计第一步</div>
        <div class="ck-r" id="ck1"><div class="ck-h">列出所有外部调用</div>
          <div class="chips"><span class="chip" id="cp0" style="opacity:0">代币转账</span><span class="chip" id="cp1" style="opacity:0">NFT 安全转账</span><span class="chip" id="cp2" style="opacity:0">回调</span><span class="chip" id="cp3" style="opacity:0">低级 call</span><span class="chip all" id="cp4" style="opacity:0">一个都不漏</span></div></div>
        <div class="ck-r" id="ck2" style="opacity:0"><div class="ck-h">调用前 状态已到最终值？<span class="ok">${CHECK("ok2", 44, "hide")}</span></div></div>
        <div class="ck-r" id="ck3" style="opacity:0"><div class="ck-h">同一状态的入口 共用一把锁？<span class="ok">${CHECK("ok3", 44, "hide")}</span></div></div>
      </div>
      ${pills(5, { sections: SEC })}
      <div class="k-title" id="ttl-card"><div class="t-main">⑤ 回调入口</div><div class="t-sub">不只是转 ETH</div></div>
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
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const term = (id, t0, t1) => { KIT.pop(tl, "#" + id, t0, 0.3); out("#" + id, t1, 0.25); };
      const fade = (sel, t, to, d) => KITX03.fade(tl, sel, t, to, d);
      const grown = new Set();
      const hideGrow = (id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); grown.add(id); };
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      const coinFly = (id, t, from, to, dur, lift) => {
        tl.set("#" + id, { opacity: 1 }, t);
        const o = { k: 0 };
        tl.fromTo(o, { k: 0 }, { k: 1, duration: dur, ease: "power1.inOut", immediateRender: false, onUpdate: function () {
          const q = o.k; gsap.set("#" + id, { x: (to[0] - from[0]) * q, y: (to[1] - from[1]) * q - lift * Math.sin(Math.PI * q) }); } }, t);
      };

      KIT.camSet(tl, CAMS.open);
      ["tk","a1","ld","cb1","ldl","ldc","bns","og","cpA","fk0","fk1","fk2","fk3","fo","cpB","fol","pa","mk","pp","cb3","mg"].forEach(hideGrow);
      tl.set("#evil-g", { opacity: 0 }, 0);

      // ===== 0–1.6 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.3);

      // ===== L0 the six exits again: ETH dims, the others light up
      pop("#lb-bank", ${f(LN[0].start - 0.2)});
      ${EXITS.map((e, i) => `pop("#lb-ex${i}", ${f(LN[0].start + 0.1 + i * 0.12)});`).join(" ")}
      ${EXITS.map((e, i) => `fade("#ex${i}-flow", ${f(LN[0].start + 0.1 + i * 0.12)}, 1, 0.2);`).join(" ")}
      KITX01.dash(tl, [${EXITS.map((_, i) => `"ex${i}-flow"`).join(",")}], ${f(LN[0].start)}, ${f(LN[1].start - LN[0].start + 0.6)}, -260);
      fade("#ex0", ${f(TM.only)}, 0.3, 0.3); fade("#lb-ex0", ${f(TM.only)}, 0.4, 0.3);
      ${[1, 2, 3, 4, 5].map((i) => `tl.to("#lb-ex${i}", { backgroundColor: "#e3f3f8", duration: 0.25 }, ${f(TM.only + 0.05 * i)});`).join(" ")}
      tl.to("#lb-ex2", { backgroundColor: "#1d93ba", color: "#ffffff", duration: 0.25 }, ${f(TM.imbtc - 0.3)});

      out("${EXITS.map((e, i) => "#lb-ex" + i).join(", ")}, #lb-bank", ${f(LN[1].start + 0.3)}, 0.2);
      // ===== L1 imBTC: an ERC-777 token whose transfer calls the holder's hook
      KIT.cam(tl, ${f(LN[1].start - 0.1)}, CAMS.zB, 1.5);
      grow("tk", ${f(TM.imbtc - 0.2)}); pop("#lb-tok", ${f(TM.erc)});
      pop("#ev1", ${f(TM.imbtc)}, 0.35);
      grow("a1", ${f(TM.erc + 0.3)}); grow("cb1", ${f(TM.erc + 0.45)}); pop("#lb-atk1", ${f(TM.erc + 0.6)});
      coinFly("cn1", ${f(TM.xfer1)}, ${JSON.stringify(coinA)}, ${JSON.stringify(A_.arm1.pan)}, 0.8, 70);
      KITX04.callArm(tl, "cb1", ${f(TM.cb1)}, 0.32, 0.45, { target: ${JSON.stringify(off(A_.arm1.mount, 60, -260))} });
      pop("#lb-hook", ${f(TM.hook - 0.2)});

      // ===== L2 Lendf.Me deposit: old value read, hook withdraws, old value written back → inflated
      KIT.cam(tl, ${f(LN[2].start - 0.1)}, CAMS.zB2, 1.0);
      KITX04.callArm(tl, "cb1", ${f(LN[2].start)}, 0, 0.35);
      out("#cn1", ${f(LN[2].start)});
      grow("ld", ${f(TM.lend - 0.1)}); pop("#lb-lend", ${f(TM.lend + 0.3)});
      grow("ldl", ${f(TM.lend + 0.2)}); grow("ldc", ${f(TM.lend + 0.3)}); pop("#lb-ldc", ${f(TM.lend + 0.6)});
      pop("#lb-dep1", ${f(TM.dep - 0.3)}); pop("#lb-wd1", ${f(TM.dep - 0.2)});
      KITX01.press(tl, "ld", 0, ${f(TM.dep)}, "red", 0.5);
      pop("#lb-old", ${f(TM.dep + 0.3)});
      coinFly("cn2", ${f(TM.dep + 0.5)}, ${JSON.stringify(coinB)}, ${JSON.stringify(coinC)}, 1.6, 80);
      KITX04.armPress(tl, "cb1", ${f(TM.dep + 0.6)}, { target: ${JSON.stringify(lend.anchors.buttons[1])}, hold: 0.4 });
      KITX01.press(tl, "ld", 1, ${f(TM.dep + 1.05)}, "red", 0.5);
      KITX01.dispense(tl, "ld", ${f(TM.dep + 1.2)}, { n: 2, start: 0, color: "red" });
      KIT.count(tl, "ldc", ${f(TM.dep + 1.2)}, 0.6, 100, 0, "power1.inOut");
      pop("#lb-pull", ${f(TM.dep + 1.3)});
      out("#lb-old", ${f(TM.wb - 0.15)});
      pop("#lb-wb", ${f(TM.wb)});
      KIT.count(tl, "ldc", ${f(TM.wb + 0.2)}, 0.8, 0, 200, "power1.inOut");
      out("#cn2", ${f(TM.wb + 0.1)});
      out("#lb-ldc", ${f(TM.high - 0.4)}, 0.15);
      out("#lb-hook", ${f(TM.high - 0.5)}, 0.15);
      pop("#lb-high", ${f(TM.high - 0.2)}); pop("#lb-demo", ${f(TM.high + 0.2)});

      // ===== L3 borrowed ~25M at the time; funds returned (The Block)
      out("#lb-pull", ${f(LN[3].start)});
      pop("#ev1b", ${f(TM.borrow)}, 0.3);
      KITX01.dispense(tl, "ld", ${f(TM.borrow + 0.1)}, { n: 5, start: 2, color: "red", gap: 0.12 });
      pop("#lb-borrow", ${f(TM.borrow + 0.4)});
      fade("#ev1-back", ${f(TM.blk - 0.3)}, 1, 0.3);

      // ===== L4 BNB Chain: many projects forked from Ethereum protocols
      term("tc1", ${f(TM.forked)}, ${f(TM.wl - 0.1)});
      KIT.cam(tl, ${f(LN[4].start - 0.3)}, CAMS.zC, 1.6);
      out("#lb-tok, #lb-atk1, #lb-lend, #lb-dep1, #lb-wd1, #lb-ldc, #lb-wb, #lb-high, #lb-demo, #lb-borrow", ${f(LN[4].start - 0.3)}, 0.2);
      out("#ev1, #ev1b", ${f(LN[4].start - 0.3)}, 0.25);
      grow("bns", ${f(TM.bnb - 0.2)});
      pop("#ev2", ${f(TM.bnb + 0.2)}, 0.35);
      grow("og", ${f(TM.bnb + 0.5)}); pop("#lb-orig", ${f(TM.bnb + 0.8)});
      ${[0, 1, 2, 3].map((i) => `grow("fk${i}", ${f(TM.forked + 0.1 + i * 0.15)});`).join(" ")}
      grow("fo", ${f(TM.forked + 0.7)}); pop("#lb-forks", ${f(TM.forked + 0.5)});

      // ===== L5 whitelist → any token; deposit has no lock
      term("tc2", ${f(TM.wl)}, ${f(TM.wl + 3.6)});
      grow("cpA", ${f(TM.wl - 0.4)}); pop("#lb-wl", ${f(TM.wl)});
      grow("cpB", ${f(TM.any - 0.4)});
      KIT.arm(tl, "cpB", ${f(TM.any)}, true, 0.6);
      pop("#lb-any", ${f(TM.any + 0.2)});
      fade("#nlB", ${f(TM.nolock)}, 1, 0.25);
      pop("#lb-dep2", ${f(TM.nolock + 0.2)});
      out("#ev2", ${f(TM.wl - 0.6)}, 0.2);

      // ===== L6 attacker lists its own token; transferFrom calls back deposit; recorded twice
      grow("fol", ${f(TM.list - 0.2)});
      fade("#evil-g", ${f(TM.list - 0.1)}, 1, 0.3);
      KITX03.fly(tl, "evil-g", ${f(TM.list + 0.2)}, ${f(P.evilMove[0])}, ${f(P.evilMove[1])}, 1.5, 0, "power2.inOut");
      pop("#lb-ev", ${f(TM.own)});
      tl.set("#lb-ev-pin", { x: 0, y: 0 }, 0);
      tl.to("#lb-ev-pin", { x: ${f(P.evilMove[0])}, y: ${f(P.evilMove[1])}, duration: 1.5, ease: "power2.inOut" }, ${f(TM.list + 0.2)});
      pop("#slip", ${f(TM.xferf - 0.6)});
      KITX01.press(tl, "fo", 0, ${f(TM.xferf - 0.4)}, "red", 0.4);
      KITX04.armPress(tl, "cb2", ${f(TM.cbdep - 0.3)}, { target: ${JSON.stringify(off(fork.anchors.buttons[0], -P.evilMove[0], -P.evilMove[1]))}, hold: 0.4 });
      KITX01.press(tl, "fo", 0, ${f(TM.cbdep + 0.15)}, "red", 0.4);
      fade("#sr1", ${f(TM.cbdep + 0.3)}, 1, 0.25);
      pop("#lb-twice", ${f(TM.twice - 0.2)});

      // ===== L7 any token = any callback; listing is the security boundary (key frame)
      out("#lb-dep2", ${f(LN[7].start - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LN[7].start - 0.2)}, CAMS.zC3, 1.0);
      out("#lb-orig, #lb-forks, #lb-wl", ${f(LN[7].start - 0.2)}, 0.2);
      pop("#kwc", ${f(TM.anyTok - 0.1)}, 0.35);
      fade("#ringB", ${f(TM.flow - 0.2)}, 1, 0.4);
      pop("#lb-bound", ${f(TM.bound - 0.3)});

      // ===== L8 Penpie, Sept 2024, ~27M
      KIT.cam(tl, ${f(LN[8].start - 0.3)}, CAMS.zD, 1.6);
      out("#lb-any, #lb-ev, #slip, #lb-twice, #lb-bound", ${f(LN[8].start - 0.3)}, 0.2);
      out("#kwc", ${f(LN[8].start - 0.3)}, 0.25);
      pop("#ev3", ${f(TM.pen)}, 0.35);
      grow("pp", ${f(TM.pen + 0.3)}); pop("#lb-pen", ${f(TM.pen + 0.6)});

      // ===== L9 permissionless market with a malicious token
      grow("pa", ${f(LN[9].start)}); pop("#lb-pAtk", ${f(LN[9].start + 0.3)});
      grow("mk", ${f(TM.perm)}); grow("cb3", ${f(TM.perm + 0.2)}); pop("#lb-mkt", ${f(TM.perm + 0.4)});
      tl.set("#cn3", { opacity: 1 }, ${f(TM.perm + 0.5)});
      pop("#lb-mtok", ${f(TM.evtok)});

      // ===== L10 claim function has no lock; deposit inside the callback becomes a reward
      out("#ev3", ${f(LN[10].start)}, 0.2);
      fade("#nlD", ${f(TM.claim)}, 1, 0.25); pop("#lb-claim", ${f(TM.claim + 0.2)});
      KITX01.press(tl, "pp", 0, ${f(TM.nolk)}, "red", 0.5);
      KITX04.armPress(tl, "cb3", ${f(TM.dep10 - 0.5)}, { target: ${JSON.stringify(pen.anchors.coinSlot)}, hold: 0.3 });
      coinFly("cn3", ${f(TM.dep10 - 0.3)}, ${JSON.stringify(A_.arm3.pan)}, ${JSON.stringify(pen.anchors.coinSlot)}, 0.55, 30);
      out("#cn3", ${f(TM.dep10 + 0.3)}, 0.1);
      pop("#lb-dep3", ${f(TM.dep10)});
      KITX01.dispense(tl, "pp", ${f(TM.rew - 0.4)}, { n: 4, start: 0, color: "red" });
      pop("#lb-rew", ${f(TM.rew)});

      // ===== L11 audit step one: list every external call 
      KIT.cam(tl, ${f(LN[11].start - 0.35)}, CAMS.audit, 1.7);
      out("#lb-pAtk, #lb-mkt, #lb-mtok, #lb-pen, #lb-claim, #lb-dep3, #lb-rew", ${f(LN[11].start - 0.35)}, 0.2);
      ${EXITS.map((e, i) => `tl.to("#lb-ex${i}", { backgroundColor: "#ffffff", color: "#1c1c1c", duration: 0.2 }, ${f(LN[11].start)});`).join(" ")}
      fade("#ex0", ${f(LN[11].start)}, 1, 0.3);
      pop("#ck", ${f(TM.step1 - 0.2)}, 0.35);
      ${EXITS.map((e, i) => `tl.fromTo("#lb-ex${i}", { opacity: 0 }, { opacity: 1, duration: 0.25, immediateRender: false }, ${f(LN[11].start + 0.2 + i * 0.06)});`).join(" ")}
      grow("mg", ${f(TM.all - 0.3)});
      {
        const ends = ${JSON.stringify(exitEnds.map((e) => e.end))}, m0 = ${JSON.stringify(A_.mag.lens)};
        const t0 = ${f(TM.all)}, t1 = ${f(TM.none)};
        const step = (t1 - t0) / 6;
        ends.forEach((p, i) => {
          tl.to("#mg", { x: p[0] - m0[0] + 30, y: p[1] - m0[1] - 20, duration: step * 0.7, ease: "power2.inOut" }, t0 + i * step);
          KIT.pop(tl, "#ckb" + i, t0 + i * step + step * 0.7, 0.25);
        });
        tl.to("#mg", { opacity: 0, duration: 0.3 }, t1 + 0.4);
      }
      fade("#cp0", ${f(TM.tok11)}, 1, 0.2); fade("#cp1", ${f(TM.nft)}, 1, 0.2); fade("#cp2", ${f(TM.cb11)}, 1, 0.2); fade("#cp3", ${f(TM.low)}, 1, 0.2); fade("#cp4", ${f(TM.none)}, 1, 0.2);

      // ===== L12 ask two questions at every exit
      ${EXITS.map((e, i) => `pop("#q${i}", ${f(TM.ask - 0.3 + i * 0.08)}, 0.25);`).join(" ")}

      // ===== L13 state final before the call?
      fade("#ck2", ${f(LN[13].start)}, 1, 0.3);
      ${EXITS.map((e, i) => `out("#q${i}", ${f(TM.fin - 0.3)}, 0.15);`).join(" ")}
      pop("#lb-bkc", ${f(TM.fin)});
      pop("#ok2", ${f(TM.fin + 0.3)}, 0.25);

      // ===== L14 one shared lock across entries
      KIT.cam(tl, ${f(LN[14].start - 0.2)}, CAMS.lock, 1.0);
      fade("#ck3", ${f(LN[14].start)}, 1, 0.3);
      out("#lb-bkc, #lb-bank", ${f(LN[14].start - 0.2)}, 0.2);
      ${EXITS.map((e, i) => `out("#lb-ex${i}", ${f(LN[14].start - 0.2)}, 0.2);`).join(" ")}
      fade("#hk-wrap", ${f(LN[14].start + 0.2)}, 1, 0.3);
      pop("#lb-ents", ${f(LN[14].start + 0.4)});
      KITX04.hasp(tl, "hk0", ${f(TM.share - 0.3)}, true, 0.6);
      KITX04.hasp(tl, "hk1", ${f(TM.share - 0.15)}, true, 0.6);
      KITX04.hasp(tl, "hk2", ${f(TM.share)}, true, 0.6);
      KITX04.chainOn(tl, "hkc", ${f(TM.share + 0.4)}, 0.6);
      pop("#lb-lock", ${f(TM.share + 0.6)});
      pop("#ok3", ${f(TM.share + 0.9)}, 0.25);
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL);
