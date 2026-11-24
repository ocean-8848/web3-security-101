// Generates compositions/story.html for ep08/seg1「① 新鲜的错价」(one isometric world「价格集市」, one camera).
// Run: node src/build-story.mjs
// Objects: kit + ep01/02/07 kit-ext (import only) + ep08 kit-ext. World positions: ../../shared/layout.mjs (not edited here).
// Camera: opens on CAMS.oracle (BRIEF opening shot) · ends static on CAMS.center (seg2 L0 starts at the lending contract).
import fs from "node:fs";
import { at, f, toScreen, gridSvg, worldSvg, wlab, wpin, CHECK, BADGE, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { screenCss, termCards } from "../../../kit/screen.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import * as L from "../../shared/layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = T.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const SECTIONS = SCRIPT.sections;
const LN = T.lines.map((_, i) => lineAt(T, i));
const LS = LN.map((l) => l.start);
const w = (term, line, nth = 0) => wordAt(T, term, { line, nth }).start;
const we = (term, line, nth = 0) => wordAt(T, term, { line, nth }).end;
const CAMS = L.CAMS;

// ---------------------------------------------------------------- local positions (seg1 only)
const rel = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });
const COUNTER = { u: 260, v: 260 };                 // rollCounter "1096.317 枚", front-right of the vending (center framing, x > 1240)
const BOT_GAP = 86;                                  // liqBot n:3 row spacing along +u
const COIN_DV = 92;                                  // collateral coins sit just in front of each bot's claw (claw tip = bot + (0, 58, 35))
const PORT_Z = 22;                                   // oracle front feed ports (below the tray)

// ---------------------------------------------------------------- objects
const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const A = {};
const up = (p, d) => [p[0], p[1] - d];

// 中区 · 借贷合约 + 坏账账本 + 价格管
const vm = E1.vending(L.VEND, { id: "vm", sign: "LENDING" }); A.vm = vm.anchors; add(L.VEND, vm.svg);
const led = O.ledgerBook(L.LEDGER, { id: "ldg", scale: L.LEDGER.scale }); A.ldg = led.anchors; add(L.LEDGER, `<g id="ldgw">${led.svg}</g>`);
const pp = E1.pipe(L.VEND, { id: "pp", pts: L.PIPE.oracle }); A.pp = pp.anchors; items.push({ y: at(L.VEND)[1] + 0.5, svg: pp.svg });
const ctr = E2.rollCounter(COUNTER, { id: "ctr", digits: 4, value: 0 }); A.ctr = ctr.anchors; add(COUNTER, `<g id="ctrw" opacity="0">${ctr.svg}</g>`);
// cbETH collateral in front of the vending: one small coin per bot slot
const coinO = [0, 1, 2].map((k) => rel(L.LIQ.stop, k * BOT_GAP, COIN_DV));
coinO.forEach((o, k) => { const c = E7.oddCoin(o, { id: "cc" + k, kind: "plain", scale: 0.55 }); A["cc" + k] = c.anchors; add(o, c.svg); });
// 清算机器人 ×3, parked off-frame at LIQ.enter; they walk to LIQ.stop
const bot = X.liqBot(L.LIQ.enter, { id: "bot", n: 3, gap: BOT_GAP, scr: "$1.12" }); A.bot = bot.anchors; add(L.LIQ.enter, bot.svg, 1);

// 左区 (only seen in the L11 wide shot)
const amm = X.ammPool(L.AMM, { id: "amm" }); A.amm = amm.anchors; add(L.AMM, amm.svg);
const fd = E1.flashDesk(L.DESK, { id: "fd" }); A.fd = fd.anchors; add(L.DESK, fd.svg);

// 右区 · 预言机站
const orc = E1.miniVend(L.ORACLE, { id: "orc", kind: "oracle", needle: -10 }); A.orc = orc.anchors; add(L.ORACLE, orc.svg);
const twap = X.twapRecorder(L.TWAP, { id: "twap" }); add(L.TWAP, twap.svg);
const knf = O.knifeSwitch(L.KNIFE, { id: "knf" }); add(L.KNIFE, knf.svg);
L.TOWERS.forEach((t, i) => { const tw = O.tower(t, { id: "tw" + i }); add(t, tw.svg); });
const coin = E7.oddCoin(L.COIN, { id: "cb", kind: "plain" }); A.cb = coin.anchors; add(L.COIN, `<g id="cbw" opacity="0">${coin.svg}</g>`);
const clk = O.clock(L.CLOCK, { id: "clk" }); A.clk = clk.anchors; add(L.CLOCK, clk.svg);
const doc = O.doc(L.DOC, { id: "doc", title: "治理提案", lines: ["cbETH 价格源", "→ 新配置"], stampText: "执行" }); A.doc = doc.anchors;
add(L.DOC, `<g id="docw" opacity="0">${doc.svg}</g>`);
// two feed ports on the oracle's front: left = cbETH/ETH (teal, flowing), right = ETH/USD (missing → red dashed ghost)
const portL = E1.pipe(L.ORACLE, { id: "pL", r: 7, pts: [[-28, 45, PORT_Z], [-28, 120, PORT_Z], [-150, 120, PORT_Z]], flow: true }); A.pL = portL.anchors;
items.push({ y: at(L.ORACLE)[1] + 2, svg: portL.svg });
const portR = E1.pipe(L.ORACLE, { id: "pR", r: 7, pts: [[28, 45, PORT_Z], [28, 82, PORT_Z]] }); A.pR = portR.anchors;
items.push({ y: at(L.ORACLE)[1] + 2.1, svg: portR.svg });
const ghostTube = (() => {
  const seg = (a, b) => `M${f(a[0])},${f(a[1])}L${f(b[0])},${f(b[1])}`;
  let d = "";
  for (const dz of [-8, 8]) d += seg(at(L.ORACLE, 28, 92, PORT_Z + dz), at(L.ORACLE, 28, 120, PORT_Z + dz)) + seg(at(L.ORACLE, 28, 120, PORT_Z + dz), at(L.ORACLE, 150, 120, PORT_Z + dz));
  return `<g id="pRg" opacity="0"><path d="${d}" fill="none" stroke="#e0453a" stroke-width="3" stroke-dasharray="9 6" stroke-linecap="round"/></g>`;
})();
items.push({ y: at(L.ORACLE)[1] + 2.2, svg: ghostTube });
A.pRend = at(L.ORACLE, 150, 120, PORT_Z);
A.pRmid = at(L.ORACLE, 70, 120, PORT_Z);

items.sort((a, b) => a.y - b.y);
const world = worldSvg("wsvg", gridSvg({ u0: -3600, u1: 4200, v0: -2600, v1: 2600 }) + items.map((x) => x.svg).join("\n"), [-3100, -1500, 6700, 3700]);

// ---------------------------------------------------------------- labels (world)
let labels = "";
const lb = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, cls + " hide", a); };
const pin = (id, p, html, a = "c") => { labels += wpin(id, p, html, a); };
lb("lb-doc", up(A.doc.top ?? at(L.DOC, 0, 0, 40), 6), "治理提案 · 已执行", "lab-ink", "b");
lb("lb-usd", up(A.orc.top, 6), "cbETH 美元价格", "", "b");
lb("lb-neq", up(A.orc.top, 6), "汇率 ≠ 美元价", "lab-rs", "b");
lb("lb-pL", [A.pL.end[0] - 14, A.pL.end[1]], "cbETH/ETH 汇率", "lab-cs", "r");
lb("lb-pR", [A.pRend[0] + 14, A.pRend[1]], "ETH/USD", "lab-r", "l");
pin("xR", A.pRmid, BADGE("xR-i", 52, "hide"));
lb("lb-cb", up(A.cb.top, 4), "cbETH", "lab-ink", "b");
lb("lb-bad", [A.orc.dial[0] + 70, A.orc.dial[1] - 26], "≈ 1.12 美元", "lab-rs", "l");
lb("lb-real", [A.orc.dial[0] + 70, A.orc.dial[1] + 40], "真实 ≈ 2200 美元", "lab-g", "l");
lb("lb-vm", up(A.vm.top, 10), "借贷合约", "lab-ink", "b");
lb("lb-coll", up(at(coinO[1], 0, 0, 70), 0), "cbETH 抵押品", "", "b");
lb("lb-cnt", up(A.ctr.top, 0), "清算 ≈ 1096.317 枚 cbETH", "lab-rs", "b");
lb("lb-debt", up(A.ldg.top, 4), "坏账 ≈ 178 万美元", "lab-rs", "b");
lb("lb-amm", up(A.amm.top, 10), "可能被推高", "lab-rs", "b");
lb("lb-stop", [A.clk.ground[0], A.clk.ground[1] + 30], "可能停住", "lab-rs", "t");
lb("lb-mis", [A.pRend[0] + 14, A.pRend[1]], "可能配错", "lab-rs", "l");

// ---------------------------------------------------------------- screen overlays
const S = (cam, p) => toScreen(CAMS[cam], p);
const r0 = Math.round;
// L7–L10 check cards above the oracle (camera static on CAMS.oracle then)
const oTop = S("oracle", A.orc.top);
const CK = [{ x: r0(oTop[0]) - 239, y: 150 }, { x: r0(oTop[0]) + 161, y: 150 }];   // clear of the top-left term card (x ≤ 608)
const clockIcon = `<svg width="34" height="34" viewBox="0 0 34 34" style="vertical-align:-5px;margin-right:10px"><circle cx="17" cy="17" r="14" fill="#fffdf8" stroke="#1d93ba" stroke-width="4"/><path d="M17 9V17L23 21" fill="none" stroke="#1c1c1c" stroke-width="3.4" stroke-linecap="round"/></svg>`;
const chk = (i, html) => `<div class="chk hide" id="chk${i}" style="left:${CK[i].x}px;top:${CK[i].y}px">${html}<span class="qm hide" id="qm${i}">?</span><span class="ok hide" id="ok${i}">${CHECK("ok" + i + "-i", 46)}</span></div>`;
const checks = chk(0, "价格 &gt; 0") + chk(1, `${clockIcon}刚刚更新`);
// L12 empty code-line placeholder + gray dashed leader to the vending ↔ price-pipe joint
const QL = { x: 1250, y: 300, w: 560 };
const joint = S("center", A.pp.start);
const QP0 = [QL.x, QL.y + 62];
const qLead = `<svg id="qlead" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible;opacity:0"><path id="qlead-p" d="M${QP0[0]},${QP0[1]}C${QP0[0] - 140},${QP0[1] + 20} ${f(joint[0] + 120)},${f(joint[1] - 150)} ${f(joint[0])},${f(joint[1])}" fill="none" stroke="#8a8478" stroke-width="4" stroke-dasharray="12 9" stroke-linecap="round"/><circle cx="${f(joint[0])}" cy="${f(joint[1])}" r="9" fill="#8a8478"/></svg>`;
const qline = `<div class="qcard hide" id="qcard" style="left:${QL.x}px;top:${QL.y}px;width:${QL.w}px"><div class="q-head">哪一行代码拦住它？</div><div class="q-row">?</div></div>`;

const TC = termCards([
  { id: "cbeth", t: "cbETH", d: "一种代表质押 ETH 的凭证代币", at: w("cbETH", 1) },
  { id: "bad", t: "坏账", d: "抵押品不够还、清算也收不回的借款", at: w("坏账", 5) },
]);

// ---------------------------------------------------------------- times
const TM = {
  doc: w("治理提案", 0), usd1: w("美元价格", 1), cb1b: w("cbETH", 1, 1), rate1: we("汇率", 1),
  dang: w("当成", 2), usd2: w("美元价格", 2),
  p2200: w("2200", 3), eyes: w("合约眼里", 3), p112: w("1.12", 3),
  bot: w("清算机器人", 4), liq: w("清算了", 4), n1096: w("1096", 4),
  blk: w("TheBlock", 5), m178: w("178", 5), debt: w("坏账", 5),
  gt0: w("大于0", 7), fresh: w("刚刚更新", 7),
  pos: w("正值", 8), time8: w("时效", 8),
  no9: w("不能", 9), pass9: w("都会通过", 9),
  new10: w("新的", 10), wrong10: w("错的", 10),
  pump: w("推高", 11), stop: w("停住", 11), mis: w("配错", 11),
  line12: w("哪一行代码", 12),
};
const SEG12_END = TM.line12 + 1.2;
if (SEG12_END > TOTAL - 1) console.warn("last motion ends late:", SEG12_END, TOTAL);

// bot / coin walks (world-canvas points)
const P = (o) => at(o).map((v) => +f(v));
const botIn = [P(L.LIQ.stop)];
const EXIT_K = 1.8;                                  // exit well past LIQ.enter so the row is fully off the center framing
const DXY = [(P(L.LIQ.enter)[0] - P(L.LIQ.stop)[0]) * EXIT_K, (P(L.LIQ.enter)[1] - P(L.LIQ.stop)[1]) * EXIT_K];
const botOut = [[P(L.LIQ.stop)[0] + DXY[0], P(L.LIQ.stop)[1] + DXY[1]]];
const coinOut = coinO.map((o) => { const p = P(o); return [[p[0] + DXY[0], p[1] + DXY[1]]]; });

const html = `<template>
  <style>
${kitCss()}
${screenCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 84px; }
    .evt { position: absolute; right: 48px; top: 120px; max-width: 760px; background: #ffffff; border-radius: 16px; padding: 12px 24px 14px; box-shadow: 0 10px 24px rgba(70,60,40,0.12);
      font-size: 34px; font-weight: 900; white-space: nowrap; }
    .evt .gtag, .gtag { display: inline-block; font-size: 28px; font-weight: 800; color: #6d685e; background: #ebe6dc; border-radius: 8px; padding: 2px 12px 4px; margin-left: 12px; vertical-align: 4px; }
    .evt b { color: #1d93ba; }
    .guess { position: absolute; left: 760px; top: 116px; width: 400px; text-align: center; font-size: 48px; font-weight: 900; background: #1c1c1c; color: #ffffff; border-radius: 18px;
      padding: 10px 0 14px; box-shadow: 0 10px 24px rgba(70,60,40,0.16); }
    .chk { position: absolute; display: flex; align-items: center; height: 76px; width: 380px; padding: 0 22px; background: #ffffff; border: 4px solid #2aa3c9; border-radius: 16px;
      font-size: 38px; font-weight: 900; white-space: nowrap; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
    .chk .qm { position: absolute; right: 20px; top: 12px; width: 46px; height: 46px; border-radius: 50%; background: #8a8478; color: #ffffff; font-size: 34px; line-height: 44px; text-align: center; }
    .chk .ok { position: absolute; right: 20px; top: 11px; }
    .kw { position: absolute; left: 1250px; top: 600px; font-size: 54px; font-weight: 900; background: #fffdf8; border-radius: 18px; padding: 12px 32px 16px;
      box-shadow: 0 10px 24px rgba(70,60,40,0.14); white-space: nowrap; }
    .kw b { color: #e0453a; }
    .qcard { position: absolute; background: #ffffff; border-radius: 18px; padding: 18px 28px 22px; box-shadow: 0 12px 28px rgba(70,60,40,0.14); }
    .qcard .q-head { font-size: 34px; font-weight: 900; white-space: nowrap; }
    .qcard .q-row { margin-top: 12px; height: 56px; border: 4px dashed #9a9286; border-radius: 10px; font: 800 36px/48px "JetBrains Mono", monospace; color: #9a9286; text-align: center; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div class="evt hide" id="evt">2026 年 2 月 15 日 · <b>Moonwell</b> · Base</div>
      <div class="evt hide" id="src"><span class="gtag" style="margin-left:0">The Block 报道</span></div>
      <div class="guess hide" id="guess">先猜</div>
      ${checks}
      <div class="kw hide" id="kw">新的 <b>≠</b> 对的</div>
      ${qLead}${qline}
      ${TC.html}
      ${pills(1, { sections: SECTIONS })}
      <div class="k-title" id="ttl-card"><div class="t-main">① 新鲜的错价</div><div class="t-sub">Moonwell 的错价</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E2.runtimeExtJs()}
${E7.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const X1 = window.KITX01, X8 = window.KITX08;
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const flash = (sel, t, n, lo) => tl.fromTo(sel, { opacity: 1 }, { opacity: lo == null ? 0.25 : lo, duration: 0.16, yoyo: true, repeat: (n || 3) * 2 - 1, ease: "power1.inOut", immediateRender: false }, t);
      ${TC.js}

      // ===== 0–1.6 · title card over the oracle station
      KIT.camSet(tl, CAMS.oracle);
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.15);
      // ===== L0 Moonwell executes a governance proposal: doc drops beside the oracle, stamped
      pop("#evt", ${f(LS[0] + 0.2)}, 0.3);
      tl.fromTo("#docw", { opacity: 0, y: -160 }, { opacity: 1, y: 0, duration: 0.55, ease: "bounce.out", immediateRender: false }, ${f(TM.doc - 0.3)});
      tl.set("#doc-stampmark", { opacity: 0 }, 0);
      tl.fromTo("#doc-stampmark", { opacity: 0, scale: 1.4, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out", immediateRender: false }, ${f(TM.doc + 0.6)});
      pop("#lb-doc", ${f(TM.doc + 0.8)}, 0.3);
      // ===== L1 only the cbETH/ETH rate: left port lit and flowing, right port ETH/USD missing
      out("#evt, #lb-doc", ${f(LS[1] - 0.1)}, 0.2);
      pop("#lb-usd", ${f(TM.usd1)}, 0.3);
      fadeIn("#pL-flow", ${f(TM.cb1b - 0.2)}, 0.2);
      X1.dash(tl, ["pL-flow"], ${f(TM.cb1b - 0.2)}, ${f(LS[3] - TM.cb1b + 0.2)}, ${f(-(LS[3] - TM.cb1b) * 60)});
      pop("#lb-pL", ${f(TM.cb1b)}, 0.3);
      fadeIn("#pRg", ${f(TM.rate1 + 0.2)}, 0.3); pop("#lb-pR", ${f(TM.rate1 + 0.4)}, 0.3);
      // ===== L2 rate taken as a dollar price: red X on the missing port
      pop("#xR-i", ${f(LS[2] + 0.2)}, 0.3);
      out("#lb-usd", ${f(TM.dang - 0.1)}, 0.15); pop("#lb-neq", ${f(TM.dang)}, 0.3);
      // ===== L3 ≈ 2200 → ≈ 1.12: coin appears, needle drops to the bottom
      out("#lb-neq, #lb-pL", ${f(LS[3] - 0.1)}, 0.2);
      out("#pL-flow", ${f(LS[3])}, 0.3);
      fadeIn("#cbw", ${f(LS[3] + 0.1)}, 0.3); pop("#lb-cb", ${f(LS[3] + 0.3)}, 0.3);
      pop("#lb-real", ${f(TM.p2200)}, 0.3);
      X1.needle(tl, "orc", ${f(TM.eyes)}, -68, 0.9, "power3.in");
      pop("#lb-bad", ${f(TM.p112)}, 0.3);
      pop("#src", ${f(TM.p112)}, 0.3);
      // ===== L4 liquidation bots: camera to the lending contract, 3 bots roll in, grab the cbETH, counter rolls
      out("#lb-cb, #lb-real, #lb-bad, #lb-pR, #xR-i", ${f(LS[4] - 0.2)}, 0.2);
      KIT.cam(tl, ${f(LS[4] - 0.2)}, CAMS.center, 1.2);
      pop("#lb-vm", ${f(LS[4] + 0.8)}, 0.3); pop("#lb-coll", ${f(LS[4] + 0.9)}, 0.3);
      X1.walk(tl, "bot", ${f(TM.bot)}, 1.3, ${JSON.stringify(botIn)}, "power2.out");
      [0, 1, 2].forEach((k) => X8.botLamp(tl, "bot-" + k, ${f(TM.bot)}, 1.6, 2, true));
      [0, 1, 2].forEach((k) => X8.botScr(tl, "bot-" + k, ${f(TM.bot + 0.4)}, "$1.12", true));
      out("#lb-coll", ${f(TM.liq - 0.2)}, 0.2);
      [0, 1, 2].forEach((k) => X8.grab(tl, "bot-" + k, ${f(TM.liq)} + k * 0.12));
      fadeIn("#ctrw", ${f(TM.liq)}, 0.3);
      KIT.count(tl, "ctr", ${f(TM.liq + 0.2)}, ${f(Math.max(1.0, TM.n1096 + 0.6 - TM.liq - 0.2))}, 0, 1096);
      pop("#lb-cnt", ${f(TM.n1096 + 0.2)}, 0.3);
      X1.walk(tl, "bot", ${f(TM.liq + 1.0)}, 1.4, ${JSON.stringify(botOut)}, "power2.in");
      ${JSON.stringify(coinOut)}.forEach((p, k) => X1.walk(tl, "cc" + k, ${f(TM.liq + 1.0)}, 1.4, p, "power2.in"));
      // ===== L5 bad debt ≈ 1.78M (The Block)
      tl.to("#ldgw", { opacity: 1 }, 0);
      flash("#ldgw", ${f(TM.m178 - 0.2)}, 2, 0.35);
      pop("#lb-debt", ${f(TM.m178)}, 0.3);
      // ===== L6 guess
      out("#lb-vm, #lb-cnt, #lb-debt, #src, #ctrw", ${f(LS[6] - 0.1)}, 0.2);
      pop("#guess", ${f(LS[6])}, 0.3);
      KIT.cam(tl, ${f(LS[6] + 0.1)}, CAMS.oracle, 1.1);
      // ===== L7 two check cards above the oracle; the clock ticks (just updated)
      pop("#lb-bad", ${f(LS[7])}, 0.3);
      out("#guess", ${f(TM.gt0 - 0.2)}, 0.2);
      pop("#chk0", ${f(TM.gt0)}, 0.3);
      pop("#chk1", ${f(TM.fresh)}, 0.3);
      KIT.clock(tl, "clk", ${f(TM.fresh)}, 0.8, 30);
      // ===== L8 can they stop it? "?" on each
      pop("#qm0", ${f(TM.pos)}, 0.25); pop("#qm1", ${f(TM.time8)}, 0.25);
      // ===== L9 no — both pass (green checks)
      out("#qm0", ${f(TM.pass9 - 0.1)}, 0.15); pop("#ok0", ${f(TM.pass9)}, 0.3);
      out("#qm1", ${f(TM.pass9 + 0.35)}, 0.15); pop("#ok1", ${f(TM.pass9 + 0.45)}, 0.3);
      tl.to("#chk0, #chk1", { borderColor: "#1f9d55", duration: 0.2 }, ${f(TM.pass9 + 0.5)});
      // ===== L10 fresh and wrong: the reading flashes red
      flash("#lb-bad", ${f(TM.new10)}, 3, 0.3);
      pop("#kw", ${f(TM.new10 + 0.3)}, 0.3);
      // ===== L11 pull back: pumped / stalled / misconfigured
      out("#chk0, #chk1, #kw, #lb-bad", ${f(LS[11] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[11] - 0.1)}, CAMS.wide, 1.4);
      X8.poolNeedle(tl, "amm", ${f(TM.pump)}, 62, 0.6); X8.poolRed(tl, "amm", ${f(TM.pump + 0.2)}, true);
      pop("#lb-amm", ${f(TM.pump)}, 0.3);
      pop("#lb-stop", ${f(TM.stop)}, 0.3);
      pop("#lb-mis", ${f(TM.mis)}, 0.3);
      // ===== L12 which line of code stops it? back to the lending contract; empty code line at the pipe joint
      out("#lb-amm, #lb-stop, #lb-mis", ${f(LS[12] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[12] - 0.1)}, CAMS.center, 1.3);
      pop("#lb-vm", ${f(LS[12] + 1.0)}, 0.3);
      fadeIn("#qlead", ${f(TM.line12 - 0.3)}, 0.3);
      pop("#qcard", ${f(TM.line12)}, 0.3);
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes");
console.log(TC.report);
console.log("screen: oracle top", S("oracle", A.orc.top).map(r0), "dial", S("oracle", A.orc.dial).map(r0), "pL.end", S("oracle", A.pL.end).map(r0), "pRend", S("oracle", A.pRend).map(r0),
  "coin", S("oracle", A.cb.top).map(r0), "doc", S("oracle", at(L.DOC)).map(r0), "| center joint", joint.map(r0), "ctr", S("center", A.ctr.top).map(r0), "ldg", S("center", A.ldg.top).map(r0),
  "| wide amm", S("wide", A.amm.top).map(r0), "clk", S("wide", A.clk.ground).map(r0), "pR", S("wide", A.pRend).map(r0));
