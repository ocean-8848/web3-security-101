// Generates compositions/story.html for ep01/seg1「① 一笔日常签名」(one isometric world, one camera).
// Run: node src/build-story.mjs
import fs from "node:fs";
import { G, at, Wp, f, pts, U, V, matStr, frameTop, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, kitCss, runtimeJs, box, M } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { runtimeExtJs } from "../../kit-ext/objects-ext.mjs";
import { PLAZA, VEND, ROAD, GALLERY, BY, SAFE, BROWSER, DOC, SEAL, SIGNERS, ATK_EDGE } from "./layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const script = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const L = (i) => lineAt(T, i);
const w = (term, line, o = {}) => wordAt(T, term, { line, ...o }).start;
const FONT = `font-family="Noto Sans SC, sans-serif"`;

// ---------------------------------------------------------------- plaza outlines (light ground, revealed at L6)
const TOPM = matStr([U[0], U[1], V[0], V[1], 0, 0]);
const OUTL = "#cfc7b8";
const outline = `<g id="outl" opacity="0"><g transform="${TOPM}">
  <rect x="${PLAZA.u0}" y="${PLAZA.v0}" width="${PLAZA.u1 - PLAZA.u0}" height="${PLAZA.v1 - PLAZA.v0}" rx="60" fill="none" stroke="${OUTL}" stroke-width="10" stroke-dasharray="60 40"/>
  <rect id="ol-road" x="${ROAD.u0}" y="${ROAD.v - ROAD.half}" width="${ROAD.u1 - ROAD.u0}" height="${2 * ROAD.half}" fill="#f6f3ec" stroke="${OUTL}" stroke-width="8"/>
  <path id="ol-road-c" d="M${ROAD.u0 + 40} ${ROAD.v}H${ROAD.u1 - 40}" stroke="${OUTL}" stroke-width="8" stroke-dasharray="70 60"/>
  <circle id="ol-vend-pad" cx="${VEND.u}" cy="${VEND.v}" r="300" fill="#f6f3ec" stroke="${OUTL}" stroke-width="8" stroke-dasharray="40 26"/>
  <rect id="ol-vend" x="${VEND.u - 100}" y="${VEND.v - 75}" width="200" height="150" rx="10" fill="#ebe5da" stroke="${OUTL}" stroke-width="8"/>
  <rect id="ol-gal" x="${GALLERY.u0}" y="${GALLERY.v0}" width="${GALLERY.u1 - GALLERY.u0}" height="${GALLERY.v1 - GALLERY.v0}" rx="16" fill="#f6f3ec" stroke="${OUTL}" stroke-width="8"/>
  ${Array.from({ length: 11 }, (_, i) => { const u = GALLERY.u0 + 110 + i * ((GALLERY.u1 - GALLERY.u0 - 220) / 10); return `<circle cx="${f(u)}" cy="${(GALLERY.v0 + GALLERY.v1) / 2}" r="26" fill="none" stroke="${OUTL}" stroke-width="7"/>`; }).join("")}
  <rect x="${BY.u - 980}" y="${BY.v - 360}" width="1580" height="1020" rx="40" fill="none" stroke="${OUTL}" stroke-width="8" stroke-dasharray="40 26"/>
</g></g>`;

// ---------------------------------------------------------------- objects (painter's order by ground y)
const items = [];
const add = (o, svg) => items.push({ y: at(o)[1], svg });
const A = {};

const vault = O.safe(SAFE, { id: "vault", plate: "COLD", gold: false }); A.vault = vault.anchors; add(SAFE, vault.svg);
const page = `<rect x="12" y="54" width="356" height="234" rx="8" fill="#faf8f4"/>
  <text x="34" y="96" ${FONT} font-size="30" font-weight="900" fill="#1c1c1c">新交易</text>
  <text x="300" y="94" text-anchor="middle" ${FONT} font-size="15" font-weight="700" fill="#7d776b">待签名</text>
  <rect x="34" y="114" width="300" height="14" rx="7" fill="#ddd6c9"/><rect x="34" y="140" width="240" height="14" rx="7" fill="#ddd6c9"/><rect x="34" y="166" width="270" height="14" rx="7" fill="#ddd6c9"/>
  <rect id="brw-btn" x="34" y="208" width="312" height="62" rx="12" fill="#1f9d55"/>
  <text x="190" y="249" text-anchor="middle" ${FONT} font-size="28" font-weight="900" fill="#ffffff">确认签名</text>`;
const brw = O.browserWin(BROWSER, { id: "brw", page }); A.brw = brw.anchors; add(BROWSER, brw.svg);
const tx = O.doc(DOC, { id: "tx", title: "交易" }); A.tx = tx.anchors; add(DOC, tx.svg);
// seal sits on the doc; its impression is ink (red is reserved for failure / attacker)
const seal = O.seal(SEAL, { id: "seal", paper: false, stamped: false });
A.seal = seal.anchors; items.push({ y: at(DOC)[1] + 1, svg: seal.svg.replaceAll("#d93a2f", "#1c1c1c") });
SIGNERS.forEach((p, i) => { const r = O.person(p, { id: `sg${i}`, role: "signer" }); A[`sg${i}`] = r.anchors; add(p, r.svg); });
// magnifier hovers with its lens just above the swapped core (door open 105°): ground point = lens − z offset
const MAGZ = 150, lensAt = [A.vault.core[0] + 10, A.vault.core[1] - 70];
const MAG = G(lensAt[0], lensAt[1] + (MAGZ + 62 + 110) * 0.866);
const mag = O.magnifier(MAG, { id: "mag", z: MAGZ }); A.mag = mag.anchors; add(MAG, mag.svg);
const atk = O.person(ATK_EDGE, { id: "atk", role: "attacker", scale: 2.4 }); A.atk = atk.anchors; add(ATK_EDGE, atk.svg);
items.sort((a, b) => a.y - b.y);

// ---------------------------------------------------------------- gold bars inside the vault (own copies so they can fly out)
const W = 290, D = 240, H = 320, zf = 14, mrg = 28;
const ui0 = -W / 2 + mrg, ui1 = W / 2 - mrg, zi0 = zf + mrg, zi1 = zf + H - mrg, v1 = D / 2, dh = zi1 - zi0, zs = zi0 + dh * 0.5;
const GB = { l: 56, w: 26, h: 16 };
const BARS = [];
for (const vv of [v1 - 70, v1 - 42]) for (let i = 0; i < 3; i++) BARS.push([ui0 + 14 + i * 62, vv, zi0]);
BARS.push([ui0 + 14 + 31, v1 - 56, zi0 + GB.h], [ui0 + 14 + 93, v1 - 56, zi0 + GB.h]);
BARS.push([ui0 + 18, v1 - 52, zs + 6], [ui0 + 18 + GB.l + 6, v1 - 52, zs + 6], [ui0 + 18 + GB.l / 2 - 4, v1 - 52, zs + 6 + GB.h]);
const barSvg = (b) => box(SAFE, b[0], b[0] + GB.l, b[1], b[1] + GB.w, b[2], b[2] + GB.h, M.gold, 1.2);
const opening = [at(SAFE, ui0, v1, zi0), at(SAFE, ui1, v1, zi0), at(SAFE, ui1, v1, zi1), at(SAFE, ui0, v1, zi1)];
const goldIn = `<defs><clipPath id="gold-c"><polygon points="${pts(opening)}"/></clipPath></defs><g id="gold-in" opacity="0" clip-path="url(#gold-c)">${BARS.map(barSvg).join("")}</g>`;
const goldFly = BARS.map((b, i) => `<g id="gf${i}" opacity="0">${barSvg(b)}</g>`).join("");

// ---------------------------------------------------------------- curves (world layer)
const mark = A.seal.mark, core = A.vault.core, pageC = at(BROWSER, 0, 14, 170);
const cvSign = dashCurve("cv-sign", [mark[0] + 6, mark[1] - 30], [core[0] - 4, core[1] + 8], { sw: 7, dash: "20 13", c1: [mark[0] + 40, mark[1] - 360], c2: [core[0] - 260, core[1] - 260] });
const cvT1 = dashCurve("cv-t1", [core[0] - 10, core[1] + 40], [mark[0] + 30, mark[1] + 10], { color: "#2aa3c9", sw: 7, dash: "20 13", c1: [core[0] - 20, core[1] + 300], c2: [mark[0] + 300, mark[1] + 140] });
const cvT2 = dashCurve("cv-t2", [mark[0] - 30, mark[1] - 10], [pageC[0] + 30, pageC[1] + 60], { color: "#2aa3c9", sw: 7, dash: "20 13", c1: [mark[0] - 160, mark[1] - 20], c2: [pageC[0] + 60, pageC[1] + 240] });

const world = worldSvg("wsvg", gridSvg({ u0: -3400, u1: 3600, v0: -3200, v1: 3000 }) + outline +
  items.map((x) => x.svg).join("\n") + goldIn + goldFly + cvSign.svg + cvT1.svg + cvT2.svg, [-3600, -3000, 8000, 5600]);

// ---------------------------------------------------------------- labels (world, counter-scaled)
const up = (p, dy, dx = 0) => [p[0] + dx, p[1] - dy];
let labels = "";
labels += wlab("lb-vault", A.vault.top, "Bybit 冷钱包 · Safe 多签", "hide");
labels += wlab("lb-sg", [A.sg0.head[0] - 50, A.sg0.head[1] - 10], "签名人", "hide", "r");
labels += wlab("lb-brw", up(A.brw.top, 0), "Safe 钱包前端 · 已被篡改", "lab-r hide");
labels += wlab("lb-core", A.vault.coreLabel, "实现合约（锁芯）", "lab-cs hide", "t");
labels += wlab("lb-core2", A.vault.coreLabel, "实现合约 · 已被替换", "lab-rs hide", "t");
// dot matrix: 15 dots, each = 1 亿美元
const DOTP = at(SAFE, W / 2 + 230, 150, 330);
const dots = Array.from({ length: 15 }, (_, i) => `<i class="d" id="d${i}"></i>`).join("");
labels += wpin("lb-amt", DOTP, `<div class="dotcard hide" id="amt"><div class="dc-t">约 15 亿美元</div><div class="dc-g">${dots}</div><div class="dc-n"><i class="d d-sm"></i> = 1 亿美元 · FBI 口径 · 约数</div></div>`, "l");
// question card (world, near the vault) — flies to the lower-left pin at L10
const QP = at(SAFE, -W / 2 - 20, -D / 2, zf + H + 150);
const qInner = `<span class="qc-q">?</span><span>Safe 合约代码：有漏洞吗？</span>`;
labels += wpin("lb-q", QP, `<div class="qcard hide" id="qcard">${qInner}</div>`, "b");
const qb = (id, p) => wpin(id, p, `<div class="qbadge hide" id="${id}-b">?</div>`, "c");
labels += qb("q-core", [core[0] + 120, core[1] - 150]) + qb("q-seal", [mark[0] - 20, mark[1] - 190]) + qb("q-brw", [pageC[0] - 150, pageC[1] - 150]);

// ---------------------------------------------------------------- cameras
const C = (u, v, z, k, sx = 960, sy = 500) => camAt(Wp(u, v, z), sx, sy, k);
const CAMS = {
  open: C(BY.u - 100, BY.v + 120, 130, 0.9, 900, 560),
  vault: C(SAFE.u + 20, SAFE.v + 120, 170, 1.1, 900, 470),
  gold: C(SAFE.u + 60, SAFE.v + 120, 170, 0.98, 820, 500),
  ask: C(SAFE.u - 220, SAFE.v + 200, 170, 0.82, 960, 520),
  wide: { x: 800, y: 600, scale: 0.31 },
  w7: { x: 830, y: 590, scale: 0.32 },
  w8: { x: 815, y: 575, scale: 0.315 },
  w9: { x: 790, y: 590, scale: 0.31 },
  end: C(VEND.u, VEND.v + 80, 60, 0.5, 960, 540),
};
// screen point of the question card when L10 starts (camera = w9, static)
const QS = toScreen(CAMS.w9, QP);

// ---------------------------------------------------------------- gold flight paths (world-canvas px offsets)
const FLY = BARS.map((b, i) => ({ dx: 1500 + (i % 3) * 120, dy: -260 + (i % 4) * 60, h: 260 + (i % 3) * 60 }));

// ---------------------------------------------------------------- times
const TM = {
  yr: w("2025", 0), bybit: w("Bybit", 0), ms: w("多签", 0), signer: w("签名人", 0), sign: w("签了", 0), normal: w("正常", 0),
  safe1: w("Safe", 1), fe: w("前端", 1), tamper: w("篡改", 1),
  signed: w("签下去", 2), swap: w("替换", 2), impl: w("实现合约", 2),
  amt: w("15", 3), gone: w("转走", 3),
  guess: w("猜一猜", 4), code: w("代码", 4), bug: w("漏洞", 4),
  ifno: w("如果没有", 5), leak: w("漏出去", 5),
  entry: w("入口", 6), three: w("三个问题", 6),
  diff: w("不一样", 7), inn: w("进来", 8), atk: w("攻击者", 9), model: w("建模", 9),
  ans: w("答案", 10), reveal: w("揭晓", 10),
};

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 60px 40px 54px; }
    #ttl-card .t-main { font-size: 92px; }
    #date-tag { position: absolute; left: 48px; top: 30px; font-size: 40px; padding: 6px 24px 8px; }
    .qbadge { width: 76px; height: 76px; border-radius: 50%; border: 5px solid #ffffff; background: #1c1c1c; color: #ffffff; font-size: 50px; font-weight: 900;
      display: flex; align-items: center; justify-content: center; line-height: 1; box-shadow: 0 6px 14px rgba(70,60,40,0.18); }
    .qbadge.teal { background: #1d93ba; }
    .qcard, .qpin { display: inline-flex; align-items: center; gap: 16px; background: #ffffff; border-radius: 18px; padding: 14px 28px 16px 16px;
      font-size: 38px; font-weight: 900; white-space: nowrap; box-shadow: 0 12px 28px rgba(70,60,40,0.16); }
    .qc-q { width: 58px; height: 58px; border-radius: 50%; background: #1c1c1c; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 40px; flex: none; }
    #qfly { position: absolute; left: ${f(QS[0])}px; top: ${f(QS[1])}px; width: 0; height: 0; }
    #qpin { position: absolute; left: 48px; top: 836px; font-size: 30px; padding: 8px 22px 10px 10px; gap: 12px; }
    #qpin .qc-q { width: 44px; height: 44px; font-size: 30px; }
    .dotcard { background: #ffffff; border-radius: 18px; padding: 16px 24px 18px; box-shadow: 0 12px 28px rgba(70,60,40,0.14); }
    .dc-t { font-size: 44px; font-weight: 900; color: #c3352b; white-space: nowrap; }
    .dc-g { display: grid; grid-template-columns: repeat(5, 40px); gap: 12px; margin: 14px 0 12px; }
    .d { display: inline-block; width: 40px; height: 40px; border-radius: 50%; background: #e0453a; }
    .d-sm { width: 24px; height: 24px; vertical-align: -3px; }
    .dc-n { font-size: 28px; font-weight: 700; color: #6d685e; white-space: nowrap; }
    #qrow { position: absolute; right: 48px; top: 112px; display: flex; flex-direction: column; gap: 14px; align-items: flex-end; }
    #qrow .qh { font-size: 32px; padding: 8px 20px 10px; }
    .qs { position: relative; height: 76px; border-radius: 16px; border: 3px dashed #c9c1b2; background: rgba(255,253,248,0.55); }
    .qs .qf { position: absolute; inset: -3px; display: flex; align-items: center; gap: 14px; padding: 0 22px 2px 14px; background: #ffffff; border-radius: 16px;
      border: 3px solid #2aa3c9; font-size: 32px; font-weight: 800; white-space: nowrap; box-shadow: 0 8px 20px rgba(70,60,40,0.12); }
    .tcard { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
      padding: 14px 26px 18px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
    .tcard .t1 { font-size: 32px; font-weight: 900; white-space: nowrap; }
    .tcard .t2 { margin-top: 6px; font-size: 29px; font-weight: 700; color: #3d3a35; white-space: nowrap; }
    .qs .qn { width: 46px; height: 46px; border-radius: 50%; background: #1d93ba; color: #fff; font-size: 30px; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; flex: none; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div id="qfly" class="hide"><div class="ctr a-b"><div class="qcard">${qInner}</div></div></div>
      <div class="qpin hide" id="qpin"><span class="qc-q">?</span><span>有漏洞吗？</span></div>
      <div id="qrow" class="hide">
        <div class="lab lab-ink qh">三个问题</div>
        <div class="qs" style="width:450px"><div class="qf hide" id="qf1"><span class="qn">1</span>和传统安全哪里不同？</div></div>
        <div class="qs" style="width:370px"><div class="qf hide" id="qf2"><span class="qn">2</span>攻击从哪里进来？</div></div>
        <div class="qs" style="width:480px"><div class="qf hide" id="qf3"><span class="qn">3</span>怎么从攻击者角度建模？</div></div>
      </div>
      <div class="lab lab-ink hide" id="date-tag">2025 年 2 月</div>
      <div class="tcard hide" id="tc1"><div class="t1">多签</div><div class="t2">凑够规定人数的签名才能动钱的合约钱包</div></div>
      <div class="tcard hide" id="tc2"><div class="t1">实现合约</div><div class="t2">提供代码逻辑的合约 · 可以被替换</div></div>
      ${pills(1, { sections: script.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">① 一笔日常签名</div><div class="t-sub">合约安全全景</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const FLY = ${JSON.stringify(FLY)};
      const r2 = (n) => Math.round(n * 100) / 100;
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const hideObj = (id) => tl.set("#" + id, { scaleY: 0, svgOrigin: $(id).getAttribute("data-ox") + " " + $(id).getAttribute("data-oy") }, 0);

      KIT.camSet(tl, CAMS.open);
      hideObj("mag"); hideObj("atk");

      // ===== 0–1.6 title card over the Bybit scene → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.2);
      // ===== L0 Feb 2025: Bybit cold wallet, signers sign a normal-looking transaction
      KIT.pop(tl, "#date-tag", ${f(TM.yr)});
      KIT.pop(tl, "#lb-vault", ${f(TM.bybit)});
      KIT.pop(tl, "#lb-sg", ${f(TM.signer)});
      tl.to("#brw-btn", { attr: { fill: "#167a41" }, duration: 0.12 }, ${f(TM.sign - 0.1)});
      tl.to("#brw-btn", { attr: { fill: "#1f9d55" }, duration: 0.2 }, ${f(TM.sign + 0.2)});
      KIT.stamp(tl, "seal", ${f(TM.sign)});
      const term = (id, t0, t1) => { KIT.pop(tl, "#" + id, t0, 0.3); out("#" + id, t1, 0.25); };
      term("tc1", ${f(TM.ms)}, ${f(Math.min(TM.ms + 3.5, L(1).start - 0.1))});
      term("tc2", ${f(TM.impl)}, ${f(TM.impl + 3.6)});
      // ===== L1 the front end was tampered with: red dashed frame, page unchanged
      out("#lb-sg", ${f(L(1).start)}, 0.2);
      KIT.broke(tl, "brw", ${f(TM.fe)}, { ghost: 1, badge: false });
      KIT.pop(tl, "#lb-brw", ${f(TM.tamper - 0.2)});
      // ===== L2 the signed tx swapped the implementation: push in, door opens, core swapped; seal → core red dashed line
      KIT.cam(tl, ${f(L(2).start - 0.3)}, CAMS.vault, 1.1);
      out("#lb-vault, #date-tag", ${f(L(2).start - 0.3)}, 0.25);
      KIT.door(tl, "vault", ${f(TM.signed)}, 105, 1.0);
      fadeIn("#gold-in", ${f(TM.signed + 0.25)}, 0.3);
      KIT.pop(tl, "#lb-core", ${f(TM.signed + 0.9)});
      KIT.draw(tl, "cv-sign", ${f(TM.swap - 0.6)}, 0.8);
      KIT.swap(tl, "#vault-core", "#vault-core-atk", ${f(TM.swap + 0.3)}, 0.35);
      KIT.swap(tl, "#lb-core", "#lb-core2", ${f(TM.impl)}, 0.3);
      // ===== L3 ~1.5B USD transferred out: gold flies right, 15 dots, vault broken
      KIT.cam(tl, ${f(L(3).start - 0.2)}, CAMS.gold, 0.9);
      out("#lb-brw", ${f(L(3).start - 0.2)}, 0.2);
      tl.set("#gold-in", { opacity: 0 }, ${f(TM.amt - 0.3)});
      FLY.forEach((q, i) => {
        const id = "#gf" + i, t0 = ${f(TM.amt - 0.3)} + i * 0.07, o = { p: 0 };
        tl.set(id, { opacity: 1 }, t0);
        tl.fromTo(o, { p: 0 }, { p: 1, duration: 1.0, ease: "power1.in", immediateRender: false,
          onUpdate: () => $("gf" + i).setAttribute("transform", "translate(" + r2(q.dx * o.p) + "," + r2(q.dy * o.p - q.h * 4 * o.p * (1 - o.p)) + ")") }, t0);
        tl.set(id, { opacity: 0 }, t0 + 1.0);
      });
      KIT.pop(tl, "#amt", ${f(TM.amt)}, 0.3);
      for (let i = 0; i < 15; i++) tl.fromTo("#d" + i, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.18, ease: "back.out(1.6)", immediateRender: false }, ${f(TM.amt + 0.2)} + i * 0.06);
      KIT.broke(tl, "vault", ${f(TM.gone)}, { ghost: 0.75 });
      // ===== L4 guess: is there a code bug? pull back, question card + magnifier over the core
      KIT.cam(tl, ${f(L(4).start - 0.1)}, CAMS.ask, 1.2);
      out("#cv-sign", ${f(L(4).start)}, 0.3);
      out("#lb-core2, #amt", ${f(L(4).start)}, 0.25);
      KIT.pop(tl, "#qcard", ${f(TM.guess + 0.2)}, 0.3);
      KIT.grow(tl, "mag", ${f(TM.code - 0.2)});
      // ===== L5 where did it leak? teal trace back: core ← seal ← browser, a "?" at each
      KIT.pop(tl, "#q-core-b", ${f(TM.ifno + 0.1)}, 0.3);
      KIT.draw(tl, "cv-t1", ${f(TM.ifno + 0.3)}, 0.8);
      KIT.pop(tl, "#q-seal-b", ${f(TM.ifno + 1.0)}, 0.3);
      KIT.draw(tl, "cv-t2", ${f(TM.ifno + 1.1)}, 0.8);
      KIT.pop(tl, "#q-brw-b", ${f(TM.leak)}, 0.3);
      // ===== L6 entry to the handbook: rise and pull back over the whole plaza outline; three empty slots
      KIT.cam(tl, ${f(L(6).start - 0.2)}, CAMS.wide, 2.2);
      out("#q-core-b, #q-seal-b, #q-brw-b, #cv-t1, #cv-t2", ${f(L(6).start + 0.4)}, 0.3);
      fadeIn("#outl", ${f(L(6).start + 0.4)}, 1.0);
      KIT.pop(tl, "#qrow", ${f(TM.three - 0.1)}, 0.35);
      // ===== L7 Q1: how is it different — camera leans to the plaza centre
      KIT.cam(tl, ${f(L(7).start - 0.2)}, CAMS.w7, 1.6);
      KIT.pop(tl, "#qf1", ${f(L(7).start + 0.2)}, 0.3);
      tl.to("#ol-vend, #ol-vend-pad", { attr: { stroke: "#2aa3c9" }, duration: 0.4 }, ${f(L(7).start + 0.3)});
      // ===== L8 Q2: where do attacks come in — the SW→NE road lights up
      KIT.cam(tl, ${f(L(8).start - 0.2)}, CAMS.w8, 1.4);
      KIT.pop(tl, "#qf2", ${f(L(8).start + 0.1)}, 0.3);
      tl.to("#ol-vend, #ol-vend-pad", { attr: { stroke: "${OUTL}" }, duration: 0.4 }, ${f(L(8).start)});
      tl.to("#ol-road, #ol-road-c", { attr: { stroke: "#2aa3c9" }, duration: 0.35 }, ${f(TM.inn - 0.3)});
      tl.to("#ol-road", { attr: { fill: "#e3f2f7" }, duration: 0.35 }, ${f(TM.inn - 0.3)});
      tl.to("#ol-road, #ol-road-c", { attr: { stroke: "${OUTL}" }, duration: 0.5 }, ${f(L(9).start + 0.4)});
      tl.to("#ol-road", { attr: { fill: "#f6f3ec" }, duration: 0.5 }, ${f(L(9).start + 0.4)});
      // ===== L9 Q3: model from the attacker's side — red attacker silhouette appears at the plaza edge, then fades
      KIT.cam(tl, ${f(L(9).start - 0.2)}, CAMS.w9, 1.4);
      KIT.pop(tl, "#qf3", ${f(L(9).start + 0.1)}, 0.3);
      KIT.grow(tl, "atk", ${f(TM.atk - 0.1)});
      out("#atk", ${f(TM.model + 0.5)}, 0.4);
      // ===== L10 answer kept for the end: question card → lower-left pin; camera heads to the plaza centre
      tl.set("#lb-q-pin", { opacity: 0 }, ${f(L(10).start)});
      tl.set("#qfly", { opacity: 1 }, ${f(L(10).start)});
      tl.fromTo("#qfly", { x: 0, y: 0, scale: 1 }, { x: ${f(48 + 160 - QS[0])}, y: ${f(890 - QS[1])}, scale: 0.5, duration: 0.8, ease: "power3.inOut", immediateRender: false }, ${f(L(10).start + 0.05)});
      out("#qfly", ${f(L(10).start + 0.75)}, 0.12);
      KIT.pop(tl, "#qpin", ${f(L(10).start + 0.75)}, 0.3);
      out("#qrow", ${f(TM.ans + 0.2)}, 0.35);
      KIT.cam(tl, ${f(TM.ans)}, CAMS.end, ${f(Math.min(1.9, TOTAL - 1.0 - TM.ans))});
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes", { QS, TOTAL });
