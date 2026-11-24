// Generates compositions/story.html for ep04/seg1「① 顺序写反了」(one isometric world, one camera).
// Run: node src/build-story.mjs
import fs from "node:fs";
import { at, Wp, f, matStr, frameTop, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, kitCss, runtimeJs, box, faceTop, M, CE } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { vending, miniVend, pipe, runtimeExtJs as rt01 } from "../../../ep01/kit-ext/objects-ext.mjs";
import { rollCounter, liftSvg, runtimeExtJs as rt02 } from "../../../ep02/kit-ext/objects-ext.mjs";
import { frameStack, runtimeExtJs as rt03 } from "../../../ep03/kit-ext/objects-ext.mjs";
import { callbackArm, runtimeExtJs as rt04 } from "../../kit-ext/objects-ext.mjs";
import { BANK, BANK_TOP, TRAY, STACK, DESK, DESK_TOP, LEDGER, COUNTER, COUNTER_SCALE, ATK, ARM, PILE, LEND_SAFE, ORACLE, DEX } from "./layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const script = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const L = (i) => lineAt(T, i);
const w = (term, line, o = {}) => wordAt(T, term, { line, ...o }).start;
const rel = (o, du, dv, z) => [o.u + du, o.v + dv, z];

// ---------------------------------------------------------------- objects (painter's order by ground y)
const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const A = {};

// Bank (protagonist)
const bank = vending(BANK, { id: "bank", sign: "BANK", maintDoor: true }); A.bank = bank.anchors; add(BANK, bank.svg);
// call stack on the Bank's roof (scaled about its ground origin, lifted to BANK_TOP)
const fs0 = frameStack({ u: STACK.u, v: STACK.v }, { id: "stk", n: STACK.n, labels: ["#1", "#2", "#3"], filled: 0 });
const [sgx, sgy] = Wp(STACK.u, STACK.v, 0), sLift = STACK.z * CE, sk = STACK.scale;
const sT = (p) => [sgx + (p[0] - sgx) * sk, sgy - sLift + (p[1] - sgy) * sk];
A.stk = { top: sT(fs0.anchors.top), trays: fs0.anchors.trays.map(sT), center: sT(fs0.anchors.center) };
add(BANK, `<g transform="translate(${f(sgx)},${f(sgy - sLift)}) scale(${sk}) translate(${f(-sgx)},${f(-sgy)})">${fs0.svg}</g>`, 0.5);

// ledger desk (−u side of the Bank): pedestal + wood top + ledgerBook + rollCounter "your balance"
{
  let s = box(DESK, -80, 80, -100, 100, 0, DESK_TOP - 8, M.white, 1.6);
  s += box(DESK, -88, 88, -108, 108, DESK_TOP - 8, DESK_TOP, M.wood, 1.4);
  const lb = O.ledgerBook(LEDGER, { id: "ldg", scale: 0.55 });
  s += liftSvg(lb.svg, DESK_TOP);
  const ctr = rollCounter(COUNTER, { id: "bal", digits: 1, value: 1, z: DESK_TOP });
  const [cx0, cy0] = at(COUNTER, 0, 0, DESK_TOP), ck = COUNTER_SCALE;
  s += `<g transform="translate(${f(cx0)},${f(cy0)}) scale(${ck}) translate(${f(-cx0)},${f(-cy0)})">${ctr.svg}</g>`;
  A.ledger = [at(LEDGER, 0, 0, DESK_TOP + 20)[0], at(LEDGER, 0, 0, DESK_TOP + 20)[1]];
  const cT = (q) => [cx0 + (q[0] - cx0) * ck, cy0 + (q[1] - cy0) * ck];
  A.ctr = { window: cT(ctr.anchors.window), top: cT(ctr.anchors.top) };
  A.deskFront = at(DESK, 0, 108, 0);
  add(DESK, `<g id="desk">${s}</g>`);
}

// attacker person (L6) and attacker contract + callback arm (L8 →)
const per = O.person(ATK, { id: "per", role: "attacker", scale: 1.0 }); A.per = per.anchors; add(ATK, per.svg);
const atk = miniVend(ATK, { id: "atk", kind: "attacker" }); A.atk = atk.anchors; add(ATK, atk.svg, 0.2);
const btn0 = A.bank.buttons[0];
const arm = callbackArm(ARM, { id: "cb", target: btn0, coin: false }); A.arm = arm.anchors; add(ARM, arm.svg);

// right zone · third-party protocols (background in the opening shot)
const lsafe = O.safe(LEND_SAFE, { id: "lsafe", plate: "LOAN" }); add(LEND_SAFE, lsafe.svg); A.lsafe = lsafe.anchors;
const orc = miniVend(ORACLE, { id: "orc", kind: "oracle", needle: -20 }); add(ORACLE, orc.svg); A.orc = orc.anchors;
const dex = miniVend(DEX, { id: "dex", kind: "dex" }); add(DEX, dex.svg); A.dex = dex.anchors;
const p1 = pipe(DEX, { id: "p1", pts: [[55, 0, 70], [280, 0, 70], [280, -205, 70]] }); add({ u: ORACLE.u, v: ORACLE.v + 46 }, p1.svg, 1);
const p2 = pipe(ORACLE, { id: "p2", pts: [[-55, 0, 70], [-90, 0, 70], [-90, -260, 70]] }); add({ u: ORACLE.u - 90, v: ORACLE.v }, p2.svg, -1);
items.sort((a, b) => a.y - b.y);

// ---------------------------------------------------------------- coins (movers, drawn at world origin, placed by transform)
const m0 = matStr(frameTop({ u: 0, v: 0 }, 0, 0, 0));
const coinSvg = (i) => `<g id="coin-${i}" opacity="0"><g transform="translate(0,${f(5 * CE)})"><g transform="${m0}"><circle r="22" fill="#a87a14"/></g></g>
  <g transform="${m0}"><circle r="22" fill="#e8b931" stroke="#8a6410" stroke-width="2.4"/><circle r="14" fill="none" stroke="#a87a14" stroke-width="2"/><path d="M-12 -12A17 17 0 0 1 10 -16" stroke="#fff3c4" stroke-width="2.4" fill="none" stroke-linecap="round"/></g></g>`;
const coins = Array.from({ length: 10 }, (_, i) => coinSvg(i)).join("");

// person → withdraw button (red dashed, world layer)
const perHand = [A.per.head[0] + 30, A.per.head[1] + 70];
const cvPer = dashCurve("cv-per", perHand, [btn0[0] - 6, btn0[1] + 4], { c1: [perHand[0] + 60, perHand[1] - 160], c2: [btn0[0] - 160, btn0[1] - 60], sw: 6, dash: "16 11" });

const world = worldSvg("wsvg", gridSvg({ u0: -2600, u1: 3600, v0: -2200, v1: 2600 }) + items.map((x) => x.svg).join("\n") + cvPer.svg + coins, [-2400, -2200, 6400, 4200]);

// ---------------------------------------------------------------- labels (world, counter-scaled)
const up = (p, dy, dx = 0) => [p[0] + dx, p[1] - dy];
const CHK = `<svg width="30" height="26" viewBox="0 0 44 36"><path d="M5 19L17 30L39 6" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
let labels = "";
labels += wlab("lb-bank", at(BANK, 0, 0, BANK_TOP + 30), "Bank 合约", "hide");
labels += wlab("lb-safe", at(BANK, -100, 0, 150), `${CHK}门锁完好 · 未被破解`, "lab-gs hide", "r");
labels += wlab("lb-ldg", up(A.ledger, 30), "账本", "hide");
labels += wlab("lb-bal", [A.ctr.window[0] - 60, A.ctr.window[1]], "你的余额", "hide", "r");
labels += wlab("lb-wd", [btn0[0] + 24, btn0[1]], `<span class="mono">withdraw()</span>`, "lab-r hide", "l");
labels += wlab("lb-per", up(A.per.top, 0), "你", "lab-rs hide");
labels += wlab("lb-atk", [A.atk.center[0] - 70, A.atk.center[1]], "你 = 一个合约", "lab-rs hide", "r");
labels += wlab("lb-arm", [A.arm.center[0] + 70, A.arm.center[1] + 10], "收款那一刻 · 再调一次", "lab-r hide", "l");
labels += wlab("lb-stk", up(A.stk.top, 0, 0), "调用栈", "lab-cs hide");
for (let i = 0; i < 3; i++) labels += wlab("lb-t" + i, [A.stk.trays[i][0] + 90, A.stk.trays[i][1] - 8 - 10 * i], `<span class="mono">withdraw #${i + 1}</span>`, "lab-sm hide", "l");
labels += wlab("lb-same", up(A.ctr.top, 10), "每一层读到的余额都是 1", "lab-r hide");
labels += wlab("lb-wait", at(DESK, -100, 0, 50), "清零 · 还在等", "lab-g hide", "r");
labels += wlab("lb-zero", at(DESK, -100, 0, 50), "这时才清零", "lab-rs hide", "r");
labels += wlab("lb-empty", up(A.bank.glass, 0, 0), "金库已空", "lab-rs hide", "c");
labels += wlab("lb-q1", [A.bank.tray[0] + 30, A.bank.tray[1] + 30], "控制权在哪交出", "lab-cs hide", "l");
labels += wlab("lb-q2", up(A.stk.top, 0, 0), "有哪几种", "lab-cs hide");
// big question mark over the Bank window → swaps to "10"
labels += wpin("qm", at(BANK, -40, 75, 400), `<div class="qbig hide" id="qbig">?</div>`, "c");
labels += wpin("q10", at(BANK, -40, 75, 400), `<div class="qbig q-red hide" id="q10">10</div>`, "c");
// vault dot panel (10 dots = 10 ETH), pinned to the right of the Bank
const dots10 = Array.from({ length: 10 }, (_, i) => `<span class="dt" id="vd-${i}"></span>`).join("");

// ---------------------------------------------------------------- cameras
const C = (u, v, z, k, sx = 960, sy = 540) => camAt(Wp(u, v, z), sx, sy, k);
const CAMS = {
  open0: camAt([-110, -140], 1290, 620, 0.86),
  open1: camAt([-110, -140], 1300, 610, 0.96),
  bank: C(-90, 40, 170, 1.15, 820, 560),
  code: C(-200, 40, 150, 1.0, 470, 600),
  quiz: C(-170, 200, 150, 1.05, 900, 560),
  mech: camAt([-140, -90], 520, 505, 1.0),
  ret: camAt([-170, -200], 820, 465, 1.3),
  end: camAt([-140, -90], 560, 500, 0.95),
};

// ---------------------------------------------------------------- code card A (two rows) + dashed line row② → ledger
const CODE = { x: 880, y: 230 };
const code = `<div class="k-code hide" id="code" style="left:${CODE.x}px;top:${CODE.y}px">
  <div class="c-head">Bank · withdraw()<span class="c-tag">示意</span></div>
  <div class="c-row c-cm">uint256 amt = balances[msg.sender];</div>
  <div class="c-row" id="row1">msg.sender.call{value: amt}("");<span class="chip chip-r hide" id="ch1">① 转账</span></div>
  <div class="c-row" id="row2">balances[msg.sender] = 0;<span class="chip chip-r hide" id="ch2">② 清零 · 太晚了</span></div>
  <div class="ord hide" id="ord"><svg width="40" height="110" viewBox="0 0 40 110"><path d="M20 10V100" stroke="#e0453a" stroke-width="6"/><path d="M6 26L20 8L34 26M6 84L20 102L34 84" fill="none" stroke="#e0453a" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/></svg><span>顺序</span></div>
</div>`;
const row2S = [CODE.x + 6, CODE.y + 24 + 56 + 50 * 2 + 25];
const ldgS = toScreen(CAMS.code, A.ledger);
const cvCode = dashCurve("cv-code", row2S, [ldgS[0] + 10, ldgS[1] - 6], { c1: [row2S[0] - 160, row2S[1] + 330], c2: [ldgS[0] + 330, ldgS[1] + 260] });

// ---------------------------------------------------------------- card B (attacker receive) + dashed line to the arm mount
const CB = { x: 1040, y: 150 };
const codeB = `<div class="k-code hide" id="codeB" style="left:${CB.x}px;top:${CB.y}px">
  <div class="c-head">攻击合约 · 收款时<span class="c-tag">示意</span></div>
  <div class="c-row">receive() external payable {</div>
  <div class="c-row c-cm">    if (金库还有钱)</div>
  <div class="c-row c-hot" id="rowB">        bank.withdraw();</div>
  <div class="c-row">}</div></div>`;
const rowBS = [CB.x + 6, CB.y + 24 + 56 + 50 * 2 + 25];
const mountS = toScreen(CAMS.mech, A.arm.mount);
const cvB = dashCurve("cv-b", rowBS, [mountS[0] + 4, mountS[1] - 6], { c1: [rowBS[0] - 300, rowBS[1] + 60], c2: [mountS[0] + 220, mountS[1] - 260] });

// code card A again at the end (small) for "怎样写对"
const CODE2 = { x: 1110, y: 560 };

// ---------------------------------------------------------------- dot matrix for The DAO (36 dots × 10 万 ETH)
const dots36 = Array.from({ length: 36 }, (_, i) => `<span class="ddw"><span class="dd" id="dd-${i}"></span></span>`).join("");
const ev = `<div class="evcard hide" id="ev">
  <div class="ev-h"><span class="ev-date">2016 年 6 月</span><span class="ev-name">The DAO</span><span class="ev-chain">以太坊</span></div>
  <div class="ev-big hide" id="ev-big">被提走 约 360 万 ETH</div>
  <div class="ev-dots">${dots36}</div>
  <div class="ev-leg hide" id="ev-leg"><span class="dd-s"></span>1 点 = 10 万 ETH</div>
  <div class="ev-usd hide" id="ev-usd">事发时约 <b>6000 万美元</b><span class="tag-g">公开报道 · 事发时价格</span></div>
</div>`;

// ---------------------------------------------------------------- coin paths (world u,v,z)
const arc = (A0, B0, h, n = 20) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [0, 1, 2].map((k) => A0[k] + (B0[k] - A0[k]) * t + (k === 2 ? 4 * h * t * (1 - t) : 0)); });
const tray = rel(BANK, ...TRAY);
const pileAt = (i) => { const s = i % 3, h = Math.floor(i / 3); return [PILE.u + [-26, 18, -6][s], PILE.v + [-14, -6, 22][s], 2 + h * 6]; };
const pan = rel(ARM, -12, -2, 74);
const PATH1 = Array.from({ length: 10 }, (_, i) => arc(tray, pileAt(i), 120));
const PATH2 = Array.from({ length: 10 }, (_, i) => (i === 0 ? arc(tray, pan, 140) : arc(tray, pileAt(i - 1), 120)));

// ---------------------------------------------------------------- times
const TM = {
  dao: w("The", 0), took: w("被提走", 0), m360: w("360", 0),
  usd: w("6000", 1),
  crack: w("破解", 2),
  two: w("两行", 3), order: w("顺序", 3), rev: w("写反", 3),
  guess: w("先猜", 4),
  bankC: w("银行合约", 5), vault: w("金库", 5), ten: w("10", 5), you: w("你", 5), bal: w("余额", 5), one: w("是 1", 5),
  call: w("调用一次", 6), most: w("最多", 6),
  ans: w("答案", 7), all: w("全部", 7),
  pre: w("前提", 8), first: w("先转账", 8), and: w("而你", 8), contract: w("合约", 8),
  recv: w("收到一笔钱", 9), moment: w("那一刻", 9), again: w("再调用", 9),
  zero: w("账本清零", 10), allc: w("所有嵌套", 10), ret: w("返回", 10), after: w("之后", 10),
  re: w("重入", 11), old: w("最古老", 11), often: w("最常复发", 11),
  three: w("三件事", 12), ctrl: w("控制权", 12), kinds: w("重入有哪几种", 12), right: w("怎样把顺序写对", 12),
};

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    .lab .mono, .mono { font-family: "JetBrains Mono", monospace; font-weight: 800; }
    #scr-svg { position: absolute; left: 0; top: 0; overflow: visible; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 60px 40px 54px; }
    #ttl-card .t-main { font-size: 92px; }
    #ex-tag { position: absolute; left: 48px; top: 34px; }
    /* event card */
    .evcard { position: absolute; left: 70px; top: 150px; width: 760px; background: #ffffff; border-radius: 22px; padding: 28px 36px 30px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    .ev-h { display: flex; align-items: baseline; gap: 18px; white-space: nowrap; }
    .ev-date { font-size: 36px; font-weight: 900; }
    .ev-name { font-family: "Inter", sans-serif; font-size: 44px; font-weight: 900; }
    .ev-chain { margin-left: auto; font-size: 30px; font-weight: 700; color: #1d93ba; border: 3px solid #2aa3c9; border-radius: 10px; padding: 0 12px 2px; }
    .ev-big { margin-top: 14px; font-size: 56px; font-weight: 900; color: #e0453a; white-space: nowrap; }
    .ev-dots { margin-top: 18px; display: grid; grid-template-columns: repeat(12, 44px); gap: 10px 12px; }
    .ddw { display: inline-block; width: 44px; height: 44px; border-radius: 50%; border: 3px dashed #d3ccbf; position: relative; }
    .dd { position: absolute; left: -3px; top: -3px; width: 44px; height: 44px; border-radius: 50%; background: #e0453a; opacity: 0; }
    .dd-s { display: inline-block; width: 26px; height: 26px; border-radius: 50%; background: #e0453a; margin-right: 10px; vertical-align: -4px; }
    .ev-leg { margin-top: 14px; font-size: 30px; font-weight: 700; color: #6d685e; }
    .ev-usd { margin-top: 16px; padding-top: 16px; border-top: 2px solid #ece6db; font-size: 38px; font-weight: 700; white-space: nowrap; display: flex; align-items: center; gap: 8px; }
    .ev-usd b { font-weight: 900; }
    .tag-g { margin-left: auto; font-size: 28px; font-weight: 700; color: #6d685e; background: #f1ede5; border-radius: 8px; padding: 2px 12px 4px; }
    /* code cards */
    #code { width: 920px; }
    #codeB { width: 760px; }
    .chip { display: inline-block; margin-left: 16px; font-family: "Noto Sans SC", sans-serif; font-size: 28px; font-weight: 800; color: #ffffff; border-radius: 8px; padding: 0 12px; line-height: 40px; vertical-align: 2px; }
    .chip-r { background: #e0453a; }
    .ord { position: absolute; right: 22px; top: 136px; display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .ord span { font-size: 30px; font-weight: 900; color: #e0453a; background: #ffffff; border-radius: 8px; padding: 0 8px; }
    /* question mark */
    .qbig { width: 150px; height: 150px; border-radius: 50%; background: #1c1c1c; color: #ffffff; border: 7px solid #ffffff; font-size: 104px; font-weight: 900;
      display: flex; align-items: center; justify-content: center; line-height: 1; box-shadow: 0 10px 22px rgba(70,60,40,0.22); font-family: "Inter", "Noto Sans SC", sans-serif; }
    .q-red { background: #e0453a; font-size: 84px; }
    /* vault dot panel */
    .vpanel { position: absolute; left: 48px; top: 100px; background: #ffffff; border-radius: 18px; padding: 16px 22px 18px; box-shadow: 0 10px 22px rgba(70,60,40,0.12); }
    .vp-h { font-size: 32px; font-weight: 700; white-space: nowrap; }
    .vp-h b { font-weight: 900; }
    .vp-d { margin-top: 10px; display: grid; grid-template-columns: repeat(5, 40px); gap: 10px; }
    .dt { display: inline-block; width: 40px; height: 40px; border-radius: 50%; background: #1d93ba; }
    .vp-n { margin-top: 10px; font-size: 30px; font-weight: 900; color: #e0453a; white-space: nowrap; }
    /* premise cards */
    .pre { position: absolute; top: 140px; width: 380px; background: #ffffff; border-radius: 18px; padding: 18px 26px 22px; box-shadow: 0 10px 22px rgba(70,60,40,0.12); border-left: 10px solid #e0453a; }
    .pre .pn { font-size: 28px; font-weight: 700; color: #6d685e; }
    .pre .pt { margin-top: 4px; font-size: 40px; font-weight: 900; white-space: nowrap; }
    #pre1 { left: 1000px; } #pre2 { left: 1410px; }
    /* keyword */
    #kw { position: absolute; left: 1110px; top: 130px; display: flex; flex-direction: column; gap: 14px; }
    #kw .k-big { font-size: 112px; }
    #kw .en { font-family: "Inter", sans-serif; font-size: 52px; font-weight: 900; color: #6d685e; }
    #kw-tag { align-self: flex-start; font-size: 36px; }
    #code2 { left: ${CODE2.x}px; top: ${CODE2.y}px; width: 720px; transform-origin: 0 0; }
    #q3 { position: absolute; left: ${CODE2.x + 12}px; top: ${CODE2.y - 64}px; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <svg id="scr-svg" width="1920" height="1080" viewBox="0 0 1920 1080">${cvCode.svg}${cvB.svg}</svg>
      ${ev}
      <div class="vpanel hide" id="vpanel"><div class="vp-h">金库 <b>10 ETH</b></div><div class="vp-d">${dots10}</div><div class="vp-n hide" id="vp-n">被取走 10 / 10</div></div>
      ${code}
      ${codeB}
      <div class="k-code hide" id="code2">
        <div class="c-head">Bank · withdraw()<span class="c-tag">示意</span></div>
        <div class="c-row">msg.sender.call{value: amt}("");</div>
        <div class="c-row">balances[msg.sender] = 0;</div>
      </div>
      <div class="lab lab-cs hide" id="q3">怎样写对</div>
      <div class="pre hide" id="pre1"><div class="pn">前提 1</div><div class="pt">先转账 · 后清零</div></div>
      <div class="pre hide" id="pre2"><div class="pn">前提 2</div><div class="pt">调用者是合约</div></div>
      <div id="kw"><div class="k-big hide" id="kw-big">重入</div><div class="en hide" id="kw-en">Reentrancy</div><div class="lab lab-rs hide" id="kw-tag">最古老 · 最常复发</div></div>
      <div class="lab lab-g hide" id="ex-tag">示例题</div>
      ${pills(1, { sections: script.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">① 顺序写反了</div><div class="t-sub">重入攻击</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${rt01()}
${rt02()}
${rt03()}
${rt04()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const PATH1 = ${JSON.stringify(PATH1)};
      const PATH2 = ${JSON.stringify(PATH2)};
      const CA = Math.cos(35 * Math.PI / 180), SA = Math.sin(35 * Math.PI / 180), CE = Math.cos(30 * Math.PI / 180);
      const Wp = (u, v, z) => [u * CA + v * SA, -u * SA * 0.5 + v * CA * 0.5 - (z || 0) * CE];
      const r2 = (n) => Math.round(n * 100) / 100;
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const slideIn = (sel, t, dx) => tl.fromTo(sel, { opacity: 0, x: dx == null ? 80 : dx }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", immediateRender: false }, t);
      const pathFn = (P) => { const Lc = [0]; for (let i = 1; i < P.length; i++) Lc.push(Lc[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1], P[i][2] - P[i - 1][2]));
        return (p) => { const d = p * Lc[Lc.length - 1]; let i = 1; while (i < Lc.length - 1 && Lc[i] < d) i++; const s = (d - Lc[i - 1]) / ((Lc[i] - Lc[i - 1]) || 1);
          return [0, 1, 2].map((k) => P[i - 1][k] + (P[i][k] - P[i - 1][k]) * s); }; };
      const place = (id) => (q) => { const a = Wp(q[0], q[1], q[2]); $(id).setAttribute("transform", "translate(" + r2(a[0]) + "," + r2(a[1]) + ")"); };
      const follow = (t, dur, P, fn, ease) => { const pf = pathFn(P), o = { p: 0 };
        tl.fromTo(o, { p: 0 }, { p: 1, duration: dur, ease: ease || "power1.in", immediateRender: false, onUpdate: () => fn(pf(o.p)) }, t); };
      const pulse = (sel, t, s) => tl.fromTo(sel, { scale: 1 }, { scale: s || 1.15, duration: 0.16, yoyo: true, repeat: 1, ease: "power1.inOut", immediateRender: false }, t);
      for (let i = 0; i < 10; i++) place("coin-" + i)(PATH1[i][0]);

      KIT.camSet(tl, CAMS.open0);
      // hidden-at-start world objects
      ["per", "atk", "cb", "stk"].forEach((id) => tl.set("#" + id, { scaleY: 0, svgOrigin: $(id).getAttribute("data-ox") + " " + $(id).getAttribute("data-oy") }, 0));

      // ===== 0–1.6 title card → pill; slow drift over the world
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.25);
      KIT.cam(tl, 1.0, CAMS.open1, 10.6, "sine.inOut");
      // ===== L0 The DAO event card + 36 dots
      fadeIn("#ev", ${f(L(0).start + 0.05)}, 0.3);
      KIT.pop(tl, "#ev-big", ${f(TM.took)}, 0.3);
      for (let i = 0; i < 36; i++) tl.fromTo("#dd-" + i, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: "back.out(1.6)", immediateRender: false }, ${f(TM.m360)} + i * 0.03);
      fadeIn("#ev-leg", ${f(TM.m360 + 1.2)}, 0.3);
      // ===== L1 ≈ 6000 万美元
      KIT.pop(tl, "#ev-usd", ${f(TM.usd - 0.15)}, 0.3);
      // ===== L2 contract not cracked: push in on the Bank, door + padlock intact
      out("#ev", ${f(L(2).start + 1.1)}, 0.3);
      KIT.cam(tl, ${f(L(2).start - 0.3)}, CAMS.bank, 1.1);
      KIT.pop(tl, "#lb-bank", ${f(L(2).start + 1.45)});
      KIT.pop(tl, "#lb-safe", ${f(TM.crack - 0.1)}, 0.3);
      // ===== L3 two lines in the wrong order (key frame)
      KIT.cam(tl, ${f(L(3).start - 0.35)}, CAMS.code, 1.0);
      out("#lb-safe", ${f(L(3).start - 0.35)}, 0.25);
      slideIn("#code", ${f(L(3).start - 0.1)});
      tl.to("#row1, #row2", { backgroundColor: "#fdeae7", duration: 0.2 }, ${f(TM.two)});
      KIT.pop(tl, "#ch1", ${f(TM.two + 0.1)});
      KIT.pop(tl, "#ch2", ${f(TM.two + 0.3)});
      KIT.pop(tl, "#ord", ${f(TM.order - 0.1)}, 0.3);
      KIT.pop(tl, "#lb-ldg", ${f(TM.rev - 0.35)});
      KIT.draw(tl, "cv-code", ${f(TM.rev - 0.3)}, 0.7);
      // ===== L4 guess: example tag + big question mark
      out("#code, #cv-code, #lb-ldg", ${f(L(4).start - 0.25)}, 0.25);
      KIT.cam(tl, ${f(L(4).start - 0.25)}, CAMS.quiz, 1.0);
      KIT.pop(tl, "#ex-tag", ${f(TM.guess)});
      out("#lb-bank", ${f(TM.guess)}, 0.2);
      KIT.pop(tl, "#qbig", ${f(TM.guess + 0.25)}, 0.35);
      // ===== L5 vault 10 ETH, your balance 1
      KIT.pop(tl, "#vpanel", ${f(TM.vault - 0.05)}, 0.3);
      for (let i = 0; i < 10; i++) tl.fromTo("#vd-" + i, { scale: 0.4 }, { scale: 1, duration: 0.16, ease: "back.out(1.6)", immediateRender: false }, ${f(TM.ten)} + i * 0.04);
      KIT.pop(tl, "#lb-bal", ${f(TM.bal - 0.1)});
      pulse("#lb-bal", ${f(TM.one)}, 1.12);
      // ===== L6 one call to withdraw: the person presses the button
      KIT.grow(tl, "per", ${f(L(6).start - 0.2)});
      KIT.pop(tl, "#lb-per", ${f(L(6).start + 0.1)});
      KIT.draw(tl, "cv-per", ${f(TM.call - 0.1)}, 0.6);
      KITX01.press(tl, "bank", 0, ${f(TM.call + 0.5)}, "red", 0.5);
      KIT.pop(tl, "#lb-wd", ${f(TM.call + 0.45)});
      pulse("#qbig", ${f(TM.most + 0.3)}, 1.12);
      // ===== L7 the answer: all 10 coins
      out("#cv-per", ${f(L(7).start)}, 0.25);
      KIT.swap(tl, "#qbig", "#q10", ${f(TM.all - 0.05)}, 0.2);
      KITX01.gears(tl, "bank", ${f(TM.all - 0.4)}, 2.2, 3);
      for (let i = 0; i < 10; i++) { const t0 = ${f(TM.all - 0.5)} + i * 0.12;
        tl.set("#coin-" + i, { opacity: 1 }, t0);
        follow(t0, 0.5, PATH1[i], place("coin-" + i));
        tl.to("#vd-" + i, { backgroundColor: "#e0453a", duration: 0.12 }, t0 + 0.45);
        if (i === 3) out("#bank-shelf-2", t0, 0.15); if (i === 6) out("#bank-shelf-1", t0, 0.15); if (i === 9) out("#bank-shelf-0", t0, 0.15); }
      KIT.pop(tl, "#vp-n", ${f(TM.all - 0.5 + 9 * 0.12 + 0.45)});
      // ===== L8 two premises; replay set-up: you are a contract
      KIT.pop(tl, "#pre1", ${f(TM.first - 0.2)}, 0.3);
      KIT.pop(tl, "#pre2", ${f(TM.and)}, 0.3);
      out("#q10, #lb-wd, #lb-per", ${f(TM.pre)}, 0.25);
      KIT.cam(tl, ${f(TM.pre - 0.1)}, CAMS.mech, 1.2);
      // rewind: coins back inside, shelves refilled, dots back to teal
      for (let i = 0; i < 10; i++) { out("#coin-" + i, ${f(TM.pre + 0.9)}, 0.25); tl.to("#vd-" + i, { backgroundColor: "#1d93ba", duration: 0.2 }, ${f(TM.pre + 1.0)} + i * 0.03); }
      out("#vp-n", ${f(TM.pre + 0.9)}, 0.2);
      fadeIn("#bank-shelf-0, #bank-shelf-1, #bank-shelf-2", ${f(TM.pre + 1.0)}, 0.4);
      // person → attacker contract + callback arm
      tl.to("#per", { opacity: 0, duration: 0.35 }, ${f(TM.and - 0.2)});
      KIT.grow(tl, "atk", ${f(TM.and + 0.1)});
      KIT.grow(tl, "cb", ${f(TM.and + 0.35)});
      KIT.pop(tl, "#lb-atk", ${f(TM.contract - 0.2)});
      KIT.grow(tl, "stk", ${f(TM.contract + 0.1)});
      KIT.pop(tl, "#lb-stk", ${f(TM.contract + 0.35)});
      // ===== L9 every time money arrives, call withdraw again (stack grows)
      out("#pre1, #pre2, #ex-tag", ${f(L(9).start - 0.25)}, 0.25);
      KITX04.armPress(tl, "cb", ${f(L(9).start - 0.1)}, { hold: 0.25 });
      KITX01.press(tl, "bank", 0, ${f(L(9).start + 0.35)}, "red", 0.4);
      KITX03.push(tl, "stk", 0, ${f(L(9).start + 0.4)}); KIT.pop(tl, "#lb-t0", ${f(L(9).start + 0.6)});
      { const t0 = ${f(TM.recv)};
        tl.set("#coin-0", { opacity: 1 }, t0); follow(t0, 0.55, PATH2[0], place("coin-0"), "power1.inOut");
        tl.to("#vd-0", { backgroundColor: "#e0453a", duration: 0.12 }, t0 + 0.5); }
      slideIn("#codeB", ${f(TM.moment - 0.45)});
      KIT.draw(tl, "cv-b", ${f(TM.moment - 0.05)}, 0.6);
      KIT.pop(tl, "#lb-arm", ${f(TM.moment)});
      out("#coin-0", ${f(TM.again - 0.2)}, 0.1);
      KITX04.armPress(tl, "cb", ${f(TM.again - 0.3)}, { hold: 0.25 });
      KITX01.press(tl, "bank", 0, ${f(TM.again + 0.15)}, "red", 0.4);
      KITX03.push(tl, "stk", 1, ${f(TM.again + 0.2)}); KIT.pop(tl, "#lb-t1", ${f(TM.again + 0.4)});
      pulse("#lb-same", ${f(TM.again + 0.6)}, 1.1);
      KIT.pop(tl, "#lb-same", ${f(TM.again + 0.3)});
      KITX04.armPress(tl, "cb", ${f(TM.again + 0.9)}, { hold: 0.2 });
      KITX03.push(tl, "stk", 2, ${f(TM.again + 1.4)}); KIT.pop(tl, "#lb-t2", ${f(TM.again + 1.6)});
      // remaining coins pour out while every layer still reads 1
      for (let i = 1; i < 10; i++) { const t0 = ${f(TM.again + 0.6)} + (i - 1) * 0.2;
        tl.set("#coin-" + i, { opacity: 1 }, t0);
        follow(t0, 0.45, PATH2[i], place("coin-" + i));
        tl.to("#vd-" + i, { backgroundColor: "#e0453a", duration: 0.12 }, t0 + 0.4);
        if (i === 3) out("#bank-shelf-2", t0, 0.15); if (i === 6) out("#bank-shelf-1", t0, 0.15); if (i === 9) out("#bank-shelf-0", t0, 0.15); }
      KITX01.gears(tl, "bank", ${f(TM.again + 0.5)}, 2.0, 3);
      // ===== L10 the reset waits until every nested call returns
      out("#codeB, #cv-b, #lb-arm", ${f(L(10).start - 0.1)}, 0.25);
      KIT.cam(tl, ${f(L(10).start - 0.1)}, CAMS.ret, 1.0);
      out("#lb-atk", ${f(L(10).start - 0.1)}, 0.2);
      fadeIn("#lb-atk", ${f(L(11).start)}, 0.3);
      KIT.pop(tl, "#lb-wait", ${f(TM.zero)});
      KITX03.tip(tl, "stk", 2, ${f(TM.ret - 0.9)}, { dur: 0.4 }); out("#lb-t2", ${f(TM.ret - 0.8)}, 0.2);
      KITX03.tip(tl, "stk", 1, ${f(TM.ret - 0.4)}, { dur: 0.4 }); out("#lb-t1", ${f(TM.ret - 0.3)}, 0.2);
      KITX03.tip(tl, "stk", 0, ${f(TM.ret + 0.1)}, { dur: 0.4 }); out("#lb-t0", ${f(TM.ret + 0.2)}, 0.2);
      out("#lb-same", ${f(TM.ret - 0.6)}, 0.2);
      KIT.swap(tl, "#lb-wait", "#lb-zero", ${f(TM.after - 0.05)}, 0.2);
      KIT.count(tl, "bal", ${f(TM.after)}, 0.5, 1, 0);
      KIT.pop(tl, "#lb-empty", ${f(TM.after + 0.3)}, 0.3);
      // ===== L11 this is reentrancy
      KIT.cam(tl, ${f(L(11).start - 0.2)}, CAMS.end, 1.2);
      out("#lb-zero", ${f(TM.re + 0.6)}, 0.25);
      out("#vpanel", ${f(L(11).start - 0.2)}, 0.3);
      KIT.pop(tl, "#kw-big", ${f(TM.re)}, 0.35);
      fadeIn("#kw-en", ${f(TM.re + 0.35)}, 0.3);
      KIT.pop(tl, "#kw-tag", ${f(TM.old)}, 0.3);
      // ===== L12 three things this episode answers
      out("#kw-en", ${f(L(12).start)}, 0.25);
      out("#lb-empty", ${f(L(12).start)}, 0.25);
      KIT.pop(tl, "#lb-q1", ${f(TM.ctrl)});
      out("#lb-stk", ${f(TM.kinds - 0.15)}, 0.15);
      KIT.pop(tl, "#lb-q2", ${f(TM.kinds)});
      slideIn("#code2", ${f(TM.right - 0.5)}, 60);
      KIT.pop(tl, "#q3", ${f(TM.right)});
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes", TM);
