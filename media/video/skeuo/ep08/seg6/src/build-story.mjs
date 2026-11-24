// Generates compositions/story.html for ep08/seg6「⑥ 今天能做什么」(world「价格集市」, one camera).
// Run: node src/build-story.mjs
// Positions: ../../shared/layout.mjs (do not edit); seg6-only positions are defined locally below.
// Opens on CAMS.centerRight (seg5 end), ends static on CAMS.world under the end card.
import fs from "node:fs";
import { at, Wp, f, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, CHECK, BADGE, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { screenCss, termCards, endCard } from "../../../kit/screen.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import * as L from "../../shared/layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = T.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const LN = T.lines.map((_, i) => lineAt(T, i));
const LS = LN.map((l) => l.start), LE = LN.map((l) => l.end);
const w = (term, line, nth = 0) => wordAt(T, term, { line, nth }).start;
const we = (term, line, nth = 0) => wordAt(T, term, { line, nth }).end;
const CAMS = L.CAMS;

// ---------------------------------------------------------------- seg6-local positions
const rel = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });
const CAP = { u: -60, v: 330 };            // L4 wood sign "供应上限" in front of the vending's tray
const HG = { u: 500, v: 700 };             // L6 health gauge, front-right of the user
const ROAM6 = { u: -800, v: 0 };           // L6 lone liqBot hovering far left (LIQ.roam falls below the centerWide frame)
const MAG = { u: 80, v: 730 };             // auditor's magnifier

// ---------------------------------------------------------------- objects
const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const A = {};
const up = (p, d) => [p[0], p[1] - d];
const hid = (id, svg) => `<g id="${id}" opacity="0">${svg}</g>`;
const put = (key, o, r, dy = 0, wrap) => { A[key] = r.anchors; add(o, wrap ? wrap(r.svg) : r.svg, dy); return r; };

// 中区
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm" }));
put("led", L.LEDGER, O.ledgerBook(L.LEDGER, { id: "led", scale: L.LEDGER.scale }));
put("lq", L.LIQ.stop, X.liqBot(L.LIQ.stop, { id: "lq", n: 3, scr: "$2,000" }));
put("lr", ROAM6, X.liqBot(ROAM6, { id: "lr", scr: "$2,000" }), 0, (s) => hid("lrw", s));
put("eng", L.ROLES.eng, O.person(L.ROLES.eng, { id: "eng", role: "engineer" }));
put("aud", L.ROLES.aud, O.person(L.ROLES.aud, { id: "aud", role: "signer" }));
put("usr", L.ROLES.user, O.person(L.ROLES.user, { id: "usr", role: "signer", color: "#5b6470" }));
put("mg", MAG, O.magnifier(MAG, { id: "mg", z: 120 }), 2);
put("cap", CAP, E1.signBoard(CAP, { id: "cap", style: "wood", text: "供应上限", size: 34 }));
put("hg", HG, E3.gasGauge(HG, { id: "hg", value: 0.3, label: "HF" }));
// pipes: price pipe → oracle, old pool pipe → AMM (unplugged in L2)
put("po", L.VEND, E1.pipe(L.VEND, { id: "po", pts: L.PIPE.oracle }), 0.5);
put("pp", L.VEND, E1.pipe(L.VEND, { id: "pp", pts: L.PIPE.pool }), 0.4);
const poPts = L.PIPE.oracle.map((q) => at(L.VEND, q[0], q[1], q[2]));
add(L.VEND, `<path id="poglow" d="M${poPts.map((p) => `${f(p[0])},${f(p[1])}`).join("L")}" fill="none" stroke="#1f9d55" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>`, 0.45);

// 左区 + 集市街
put("amm", L.AMM, X.ammPool(L.AMM, { id: "amm" }));
put("amm2", L.AMM_ALT, X.ammPool(L.AMM_ALT, { id: "amm2", scale: L.AMM_ALT.scale }));
put("fd", L.DESK, E1.flashDesk(L.DESK, { id: "fd" }));
put("stall", L.STALL, X.marketStall(L.STALL, { id: "stall" }));
put("tel", L.TELLER, E4.tellerCounter(L.TELLER, { id: "tel", sign: "当铺" }));
put("you", L.YOU, O.person(L.YOU, { id: "you", role: "signer" }));
put("fr", L.FRIEND, O.person(L.FRIEND, { id: "fr", role: "engineer" }));

// 右区 · 预言机站
put("kn", L.KNIFE, O.knifeSwitch(L.KNIFE, { id: "kn", on: true }));
put("tw", L.TWAP, X.twapRecorder(L.TWAP, { id: "tw" }));
put("or", L.ORACLE, E1.miniVend(L.ORACLE, { id: "or", kind: "oracle" }));
add(L.ORACLE, E4.oracleGhost(L.ORACLE, { id: "or", deg: -62, real: 20, shown: false }).svg, 0.1);
put("mt", L.METER, E5.thresholdMeter(L.METER, { id: "mt" }));
put("coin", L.COIN, E7.oddCoin(L.COIN, { id: "coin", kind: "plain" }));
put("ck", L.CLOCK, O.clock(L.CLOCK, { id: "ck" }));
put("doc", L.DOC, O.doc(L.DOC, { id: "doc", title: "治理提案", lines: ["喂价配置", "…"] }), 0, (s) => `<g id="docw">${s}</g>`);
L.TOWERS.forEach((t, i) => put("tw" + i, t, O.tower(t, { id: "tow" + i })));
// two feeds into the oracle's front: cbETH/ETH (always) and ETH/USD (missing until L9)
put("fa", L.ORACLE, E1.pipe(L.ORACLE, { id: "fa", r: 6, pts: [[-25, 45, 40], [-25, 120, 40], [-100, 120, 40]] }), 1);
put("fb", L.ORACLE, E1.pipe(L.ORACLE, { id: "fb", r: 6, pts: [[25, 45, 40], [25, 120, 40], [110, 120, 40]] }), 1);
// node lines from the towers to the oracle
add(L.ORACLE, `<g id="tlines" opacity="0.6">${L.TOWERS.map((t, i) => { const a = A["tw" + i].top ?? at(t, 0, 0, 420), b = A.or.top; return `<path d="M${f(a[0])},${f(a[1] + 60)}L${f(b[0])},${f(b[1])}" stroke="#2aa3c9" stroke-width="3" stroke-dasharray="10 8" fill="none"/>`; }).join("")}</g>`, -600);

// 远右 · L2 码头
put("so", L.DOCK.sorter, E1.sorter(L.DOCK.sorter, { id: "so" }));
put("bc", L.DOCK.beacon, O.beacon(L.DOCK.beacon, { id: "bc" }));
put("tlk", L.DOCK.timeLock, E1.timeLock(L.DOCK.timeLock, { id: "tlk", frac: 0 }));
put("dck", L.DOCK.clock, O.clock(L.DOCK.clock, { id: "dck" }));
put("l1", L.DOCK.chain, O.chain(L.DOCK.chain, { id: "l1", n: 3 }));
put("pf", L.DOCK.chain, E1.pipe(L.DOCK.chain, { id: "pf", r: 6, pts: L.PIPE.force }), 0.5);

items.sort((a, b) => a.y - b.y);
const world = worldSvg("wsvg", gridSvg({ u0: -4600, u1: 5000, v0: -1700, v1: 2200 }) + items.map((x) => x.svg).join("\n"), [-3200, -1800, 8400, 3800]);

// ---------------------------------------------------------------- labels (world)
let labels = "";
const lb = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, cls + " hide", a); };
const pin = (id, p, html, a = "c") => { labels += wpin(id, p, html, a); };
lb("lb-vm", up(A.vm.top, 8), "借贷合约", "lab-ink");
lb("lb-eng", up(A.eng.top, 6), "工程师", "lab-cs lab-sm");
lb("lb-aud", up(A.aud.top, 6), "审计", "lab-cs lab-sm");
lb("lb-usr", up(A.usr.top, 6), "普通用户", "lab-cs lab-sm");
const poLab = at(L.VEND, 800, 0, 110 + 30);
lb("lb-po", poLab, "价格管 → 预言机", "lab-gs lab-sm");
const ppVis = at(L.VEND, -650, 0, 260);
lb("lb-pp", ppVis, "单一 DEX 现货价 → 风险更高", "lab-rs lab-sm");
pin("pp-x", at(L.VEND, -420, 0, 110), BADGE("pp-xi", 54, "hide"));
lb("lb-cap", [A.cap.board[0] + 120, A.cap.board[1]], "抵押率 ↓", "lab-cs lab-sm", "l");
lb("lb-hg", up(A.hg.top, 6), "健康度 · 拉高", "lab-gs lab-sm");
lb("lb-lev", [A.hg.top[0], A.hg.top[1] - 62], "先降杠杆", "lab-ink lab-sm");
lb("lb-lr", up(A.lr.top, 6), "清算机器人 · 远处", "lab-g lab-sm");
lb("lb-or-bad", up(A.or.top, 8), "≈ 1.12 美元", "lab-rs");
lb("lb-or-ok", up(A.or.top, 8), "≈ 2200 美元", "lab-gs");
lb("lb-fa", [A.fa.end[0] - 10, A.fa.end[1] + 18], "cbETH/ETH", "lab-cs lab-sm", "t");
lb("lb-fb", [A.fb.end[0] + 10, A.fb.end[1] + 18], "ETH/USD", "lab-r lab-sm", "t");
lb("lb-fb-ok", [A.fb.end[0] + 10, A.fb.end[1] + 18], "ETH/USD ✓", "lab-gs lab-sm", "t");
lb("lb-doc", up(A.doc.top, 6), "治理提案", "lab-ink lab-sm");
lb("lb-test", up(A.doc.top, 64), "测试 + 真实喂价核对", "lab-gs", "b");
// L7 missing ETH/USD feed: red dashed stub where the pipe should be
const fbStub = [[25, 45, 40], [25, 120, 40], [110, 120, 40]].map((q) => at(L.ORACLE, q[0], q[1], q[2]));
labels += `<svg class="wsvg" style="left:0;top:0;overflow:visible" width="10" height="10"><path id="fb-dash" d="M${fbStub.map((p) => `${f(p[0])},${f(p[1])}`).join("L")}" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="12 9" stroke-linecap="round" opacity="0"/></svg>`;

// ---------------------------------------------------------------- screen overlays
const CARD = { x: 60, y: 110, w: 600 };
const SRC = [["AMM 储备", "可变", "x"], ["代币余额", "可变", "x"], ["金库份额价格", "可变", "x"], ["链下预言机", "不可变", "ok"]];
const cardS = `<div class="k-code hide" id="cardS" style="left:${CARD.x}px;top:${CARD.y}px;width:${CARD.w}px">
  <div class="c-head">价格来源清单 · 工程师</div>
  ${SRC.map((r, i) => `<div class="c-row sr hide" id="sr${i}"><span class="sr-t" id="sr${i}t">${r[0]}${i < 3 ? `<span class="sk" id="sk${i}"></span>` : ""}</span><span class="c-chip ${r[2]} hide" id="sr${i}c">${r[1]}</span></div>`).join("")}
</div>`;
const AUD = ["正值", "时效", "上下限", "精度", "L2 排序器状态"];
const cardQ = `<div class="k-code hide" id="cardQ" style="left:${CARD.x}px;top:${CARD.y}px;width:${CARD.w}px">
  <div class="c-head">审计 · 逐个检查读取</div>
  ${AUD.map((r, i) => `<div class="c-row qr" id="qr${i}">${r}<span class="c-chip ok hide" id="qr${i}c">✓</span></div>`).join("")}
</div>`;
const rowY = (i) => CARD.y + 24 + 56 + 50 * i + 25;
const S = (cam, p) => toScreen(CAMS[cam], p);
const ov = [];
{
  const P0 = [CARD.x + CARD.w + 4, rowY(2)], P3 = S("centerWide", A.mg.lens ?? A.mg.top);
  ov.push(dashCurve("cv-q", P0, P3, { color: "#2aa3c9", c1: [P0[0] + 160, P0[1] + 20], c2: [P3[0] - 60, P3[1] - 160] }).svg);
}
const ovSvg = `<svg id="ovl" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">${ov.join("")}</svg>`;
// L7–L9 check cards (right of the oracle close-up, x > 1300)
const chk = (id, text, cls) => `<div class="ck ${cls} hide" id="${id}"><span class="ck-i">✓</span>${text}</div>`;
const checks = `<div id="cks">
  ${chk("ck1", "价格 &gt; 0", "g")}${chk("ck2", "刚刚更新", "g")}
  <div class="ck-note hide" id="ckn">只证明 <b>存在 · 新</b><span class="ck-q" id="ckq">对？</span></div>
  ${chk("ck3", "上下限", "c")}${chk("ck4", "第二价格源", "c")}
</div>`;

const TM = {
  one: w("一件事", 0),
  write: w("写合约", 1), list: w("列出", 1), mut: w("可变", 1),
  res: w("储备", 2), bal: w("余额", 2), share: w("份额价格", 2), swap: w("全部换掉", 2),
  aud: w("审计", 3), q0: w("正值", 3), q1: w("时效", 3), q2: w("上下限", 3), q3: w("精度", 3), q4: w("排序器", 3),
  low4: w("低流动性", 4), cap: w("供应上限", 4), ltv: w("抵押率", 4),
  usr: w("普通用户", 5), src5: w("价格源", 5), dex: w("单一", 5), risk: w("风险更高", 5),
  hf: w("健康度", 6), ext: w("极端", 6), lev: w("降杠杆", 6), liq6: w("清算", 6),
  back: w("回到开头", 7), gt0: w("大于", 7), fresh: w("刚刚更新", 7), wrong: w("还会错", 7),
  exist: w("存在", 8), nprove: w("不证明", 8),
  bound: w("上下限", 9), second: w("第二个价格源", 9),
  cfg: w("配置", 10), test: w("测试", 10), real: w("真实喂价", 10),
  win: w("窗口", 11), out: w("窗外", 11),
  next: w("下一集", 12),
};

const TC = termCards([
  { id: "cap", t: "供应上限", d: "协议对某种抵押资产的存入总量上限", at: TM.cap },
  { id: "hf", t: "健康度", d: "抵押价值与借款的比值，过低会被清算", at: TM.hf },
]);
const EC = endCard({ title: SCRIPT.title, line: "先确认窗外是真的，再按它放贷", next: "MEV 与签名安全", at: LS[12], total: TOTAL, nextAt: TM.next });

const DL = (o) => Wp(o.u, o.v);
const GROWN = ["eng", "aud", "usr", "mg", "cap", "hg", "docw"];

const html = `<template>
  <style>
${kitCss()}
${screenCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 84px; }
    .k-code .c-row { white-space: pre; display: flex; align-items: center; gap: 16px; font-family: "Noto Sans SC", sans-serif; font-weight: 700; }
    .k-code .c-chip { margin-left: auto; font-family: "Noto Sans SC", sans-serif; }
    .k-code .c-chip.ok { background: #1f9d55; }
    .k-code .c-chip.x { background: #e0453a; }
    .k-code .sr-t { position: relative; }
    .k-code .sr-t.struck { color: #9a9286; }
    .k-code .sr-t .sk { position: absolute; left: -4px; right: -4px; top: 52%; height: 4px; background: #e0453a; border-radius: 2px; transform-origin: 0 50%; transform: scaleX(0); }
    .ck { position: absolute; left: 1330px; width: 500px; height: 74px; display: flex; align-items: center; gap: 18px; padding: 0 24px; background: #ffffff; border-radius: 14px;
      border-left: 8px solid #1f9d55; box-shadow: 0 8px 20px rgba(70,60,40,0.12); font-size: 36px; font-weight: 900; white-space: nowrap; }
    .ck .ck-i { width: 46px; height: 46px; border-radius: 50%; background: #1f9d55; color: #fff; font-size: 30px; line-height: 46px; text-align: center; flex: none; }
    .ck.c { border-left-color: #1d93ba; }
    .ck.c .ck-i { background: #1d93ba; }
    #ck1 { top: 300px; } #ck2 { top: 392px; } #ck3 { top: 590px; } #ck4 { top: 682px; }
    .ck-note { position: absolute; left: 1330px; top: 488px; width: 500px; height: 74px; display: flex; align-items: center; padding: 0 24px; font-size: 32px; font-weight: 700; color: #6d685e;
      background: #ebe6dc; border-radius: 14px; white-space: nowrap; }
    .ck-note b { color: #1c1c1c; margin-left: 10px; }
    .ck-note .ck-q { margin-left: auto; font-size: 40px; font-weight: 900; color: #6d685e; }
    .kw { position: absolute; left: 56px; top: 120px; font-size: 42px; font-weight: 900; color: #1c1c1c; background: #fffdf8; border-radius: 16px; padding: 10px 28px 14px;
      box-shadow: 0 10px 24px rgba(70,60,40,0.12); white-space: nowrap; }
    .kw b { color: #1f9d55; }
    .gtag { display: inline-block; font-size: 30px; font-weight: 800; color: #6d685e; background: #ebe6dc; border-radius: 8px; padding: 2px 12px 4px; margin-left: 14px; vertical-align: 6px; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      ${cardS}${cardQ}${ovSvg}${checks}
      <div class="kw hide" id="kw-win">价格 = 合约看世界的 <b>窗口</b><span class="gtag">解读</span></div>
      ${TC.html}
      ${pills(6, { sections: SCRIPT.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">⑥ 今天能做什么</div><div class="t-sub">按角色 · 回答开头</div></div>
      ${EC.html}
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E3.runtimeExtJs()}
${E4.runtimeExtJs()}
${E5.runtimeExtJs()}
${E7.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const X1 = window.KITX01, X3 = window.KITX03, X4 = window.KITX04, X8 = window.KITX08;
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      ${JSON.stringify(GROWN)}.forEach((id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); });
      ["#lb-vm"].forEach((s) => tl.set(s, { opacity: 1 }, 0));
      ${TC.js}

      // ===== 0–1.6 · seg5 end state (centerRight: vending, closed knife, bot queue) under the title card
      KIT.camSet(tl, CAMS.centerRight);
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.15);
      X1.walk(tl, "lq", 0.5, 1.8, [${JSON.stringify(DL(L.LIQ.enter))}], "power1.in");
      tl.set("#lq", { opacity: 0 }, 2.35);
      // ===== L0 three roles in front of the contract
      KIT.cam(tl, 1.0, CAMS.centerWide, 1.4);
      grow("eng", ${f(LS[0] + 0.3)}, 0.45); grow("aud", ${f(LS[0] + 0.6)}, 0.45); grow("usr", ${f(LS[0] + 0.9)}, 0.45);
      pop("#lb-eng", ${f(LS[0] + 0.6)}, 0.25); pop("#lb-aud", ${f(LS[0] + 0.9)}, 0.25); pop("#lb-usr", ${f(LS[0] + 1.2)}, 0.25);
      // ===== L1 engineer: list every price source, mark which can change inside one transaction
      tl.to("#lb-eng", { scale: 1.15, duration: 0.2, yoyo: true, repeat: 1 }, ${f(TM.write)});
      pop("#cardS", ${f(TM.write + 0.2)}, 0.3);
      for (let i = 0; i < 4; i++) fadeIn("#sr" + i, ${f(TM.list)} + i * 0.35, 0.2);
      for (let i = 0; i < 4; i++) pop("#sr" + i + "c", ${f(TM.mut)} + i * 0.2, 0.2);
      // ===== L2 reserves / balances / share price → replace them all: pool pipe unplugged, price pipe flows to the oracle
      [${f(TM.res)}, ${f(TM.bal)}, ${f(TM.share)}].forEach((t, i) => tl.to("#sr" + i, { backgroundColor: "#fdeae7", duration: 0.2 }, t));
      for (let i = 0; i < 3; i++) {
        tl.set("#sr" + i + "t", { className: "sr-t struck" }, ${f(TM.swap)} + i * 0.15);
        tl.fromTo("#sk" + i, { scaleX: 0 }, { scaleX: 1, duration: 0.25, immediateRender: false }, ${f(TM.swap)} + i * 0.15);
      }
      KIT.broke(tl, "pp", ${f(TM.swap)}, { badge: false, ghost: 0.35 }); pop("#pp-xi", ${f(TM.swap + 0.1)}, 0.3);
      fadeIn("#po-flow", ${f(TM.swap + 0.3)}, 0.3); X1.dash(tl, ["po-flow"], ${f(TM.swap + 0.3)}, ${f(LE[2] - TM.swap + 0.2)}, ${f((LE[2] - TM.swap) * 60)});
      pop("#lb-po", ${f(TM.swap + 0.4)}, 0.3);
      // ===== L3 auditor: check every oracle read, plus the L2 sequencer
      out("#cardS, #lb-po, #pp-xi", ${f(LS[3] - 0.15)}, 0.2);
      out("#po-flow", ${f(LS[3] - 0.15)}, 0.2);
      grow("mg", ${f(TM.aud)}, 0.45);
      tl.to("#lb-aud", { scale: 1.15, duration: 0.2, yoyo: true, repeat: 1 }, ${f(TM.aud)});
      pop("#cardQ", ${f(TM.aud + 0.1)}, 0.3);
      KIT.draw(tl, "cv-q", ${f(TM.aud + 0.4)}, 0.6);
      [${[TM.q0, TM.q1, TM.q2, TM.q3, TM.q4].map(f).join(",")}].forEach((t, i) => { tl.to("#qr" + i, { backgroundColor: "#e3f3ea", duration: 0.2 }, t); pop("#qr" + i + "c", t + 0.15, 0.2); });
      // ===== L4 low-liquidity collateral: supply cap sign + lower collateral ratio
      out("#cardQ, #cv-q", ${f(LS[4] - 0.15)}, 0.2);
      grow("cap", ${f(TM.cap - 0.1)}, 0.45);
      pop("#lb-cap", ${f(TM.ltv)}, 0.3);
      // ===== L5 ordinary user: what price source? single DEX spot price = higher risk
      out("#lb-cap", ${f(LS[5] - 0.1)}, 0.2);
      tl.to("#lb-usr", { scale: 1.15, duration: 0.2, yoyo: true, repeat: 1 }, ${f(TM.usr)});
      tl.to("#pp-solid", { opacity: 0.8, duration: 0.3 }, ${f(TM.src5)});
      pop("#lb-pp", ${f(TM.dex)}, 0.3);
      pop("#pp-xi", ${f(TM.risk)}, 0.3);
      // ===== L6 higher health factor; de-lever early; a liquidation bot hovers far off
      out("#lb-pp, #pp-xi", ${f(LS[6] - 0.1)}, 0.2); tl.to("#pp-solid", { opacity: 0.35, duration: 0.3 }, ${f(LS[6] - 0.1)});
      grow("hg", ${f(TM.hf - 0.3)}, 0.45);
      pop("#lb-hg", ${f(TM.hf)}, 0.25);
      X3.gauge(tl, "hg", ${f(TM.hf + 0.2)}, 0.85, 1.0);
      pop("#lb-lev", ${f(TM.lev)}, 0.3);
      fadeIn("#lrw", ${f(TM.ext - 0.3)}, 0.4); pop("#lb-lr", ${f(TM.ext)}, 0.25);
      X8.botLamp(tl, "lr", ${f(TM.ext)}, 1.6, 2, true);
      X1.walk(tl, "lr", ${f(TM.ext)}, 1.4, [${JSON.stringify(Wp(ROAM6.u - 90, ROAM6.v - 20))}], "sine.inOut");
      X1.walk(tl, "lr", ${f(TM.ext + 1.5)}, 1.4, [${JSON.stringify(Wp(ROAM6.u, ROAM6.v))}], "sine.inOut");
      // ===== L7 back to the opening: the oracle shows ≈1.12, both seg1 checks pass
      out("#lb-hg, #lb-lev, #lb-lr, #lb-eng, #lb-aud, #lb-usr, #lb-vm", ${f(LS[7] - 0.2)}, 0.2);
      KIT.cam(tl, ${f(LS[7] - 0.2)}, CAMS.oracle, 1.4);
      X4.ghostOn(tl, "or", ${f(LS[7] + 0.4)}, true, 0.3);
      fadeIn("#fb-dash", ${f(LS[7] + 0.6)}, 0.3);
      KIT.broke(tl, "fb", ${f(LS[7] + 0.6)}, { badge: false, ghost: 0 });
      pop("#lb-or-bad", ${f(LS[7] + 0.8)}, 0.3); pop("#lb-fa", ${f(LS[7] + 1.0)}, 0.25); pop("#lb-fb", ${f(LS[7] + 1.1)}, 0.25);
      pop("#ck1", ${f(TM.gt0)}, 0.3); pop("#ck2", ${f(TM.fresh)}, 0.3);
      tl.to("#lb-or-bad", { scale: 1.12, duration: 0.18, yoyo: true, repeat: 3 }, ${f(TM.wrong)});
      // ===== L8 they only prove: exists · fresh — not correct
      pop("#ckn", ${f(TM.exist - 0.1)}, 0.3);
      tl.fromTo("#ckq", { scale: 1 }, { scale: 1.3, color: "#e0453a", duration: 0.25, yoyo: true, repeat: 1, immediateRender: false }, ${f(TM.nprove)});
      // ===== L9 bounds or a second source: ETH/USD feed connected, dial back to ≈2200 (key frame)
      pop("#ck3", ${f(TM.bound)}, 0.3); pop("#ck4", ${f(TM.second)}, 0.3);
      out("#fb-dash, #lb-fb", ${f(TM.second + 0.3)}, 0.2);
      KIT.fixed(tl, "fb", ${f(TM.second + 0.3)});
      pop("#lb-fb-ok", ${f(TM.second + 0.5)}, 0.3);
      X4.ghostOn(tl, "or", ${f(TM.second + 0.6)}, false, 0.4);
      tl.set("#lb-or-bad", { opacity: 0 }, ${f(TM.second + 0.6)}); pop("#lb-or-ok", ${f(TM.second + 0.6)}, 0.3);
      // ===== L10 config changes get tested like code: proposal + "测试 + 真实喂价核对"
      out("#ck1, #ck2, #ckn, #ck3, #ck4", ${f(LS[10] - 0.2)}, 0.2);
      out("#lb-fa, #lb-fb-ok", ${f(LS[10] - 0.2)}, 0.2);
      KIT.cam(tl, ${f(LS[10] - 0.2)}, CAMS.right, 1.1);
      grow("docw", ${f(TM.cfg)}, 0.45); pop("#lb-doc", ${f(TM.cfg + 0.3)}, 0.25);
      pop("#lb-test", ${f(TM.test)}, 0.3);
      // ===== L11 the window: whole market, price pipe to the oracle glows green
      out("#lb-doc, #lb-test, #lb-or-ok", ${f(LS[11] - 0.2)}, 0.2);
      KIT.cam(tl, ${f(LS[11] - 0.2)}, CAMS.world, 2.2, "power2.inOut");
      fadeIn("#poglow", ${f(TM.win)}, 0.5); tl.to("#poglow", { opacity: 0.5, duration: 0.5 }, ${f(TM.win)});
      fadeIn("#po-flow", ${f(TM.win)}, 0.3); X1.dash(tl, ["po-flow"], ${f(TM.win)}, ${f(LS[12] - TM.win)}, ${f((LS[12] - TM.win) * 60)});
      pop("#kw-win", ${f(TM.win)}, 0.3);
      // ===== L12 end card (last 2.5 s static)
      out("#kw-win", ${f(LS[12] - 0.1)}, 0.2);
      ${EC.js}
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html.replace(/width="-[0-9.]+"/g, 'width="0"'));
console.log("wrote compositions/story.html", html.length, "bytes");
console.log(TC.report);
