// Generates compositions/story.html for ep02/seg1「① 种子只有32位」(one isometric world, one camera).
// Run: node src/build-story.mjs
import fs from "node:fs";
import { at, Wp, f, pts, U, V, CE, M, matStr, frameV, box, line3, edges, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, kitCss, runtimeJs, contactShadow } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { VAULT, MAILBOX, DIAL256, PROF, DIAL32, SHAFT_A, SHAFT_B, RIG, ATTACKER, COUNTER, CLOCK, LINE, STATIONS, PAD, SIGN_DESK, CHAIN } from "./layout.mjs";
import { termCss, termHtml, termJs } from "../../kit-ext/termcard.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const script = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const L = (i) => lineAt(T, i);
const w = (term, line, o = {}) => wordAt(T, term, { line, ...o }).start;
const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
const lift = (p, z) => [p[0], p[1] - z * CE];

// ---------------------------------------------------------------- Profanity machine (custom, same projection)
// open-able housing: back wall + floor are always drawn; the −u wall, front and roof (shell) ghost out at L4
// to show the single-ring 32-bit dial inside.
function profMachine(o, id, inner) {
  const W = 150, v0 = -80, v1 = 90, H = 300;
  const body = { f: "#f6f3ec", s: "#ddd7cb", t: "#ffffff", st: "#5d636b" };
  const teal = { f: "#2aa3c9", s: "#1d93ba", t: "#5cc0e0", st: "#155e77" };
  let back = contactShadow(o, W * 1.2, 110);
  back += box(o, -W, W, v0, v1, 0, 14, M.steel, 1.4);
  back += box(o, -W, W, v0, v0 + 12, 14, H, { f: "#e4dfd4", s: "#cfc8ba", t: "#f1ede5", st: "#5d636b" }, 1.4);
  back += box(o, W - 12, W, v0, v1, 14, H, body, 1.4);
  let shell = box(o, -W, -W + 12, v0, v1, 0, H, body, 1.6);
  shell += box(o, -W, W, v1 - 12, v1, 0, H, body, 1.6);
  shell += box(o, -W - 6, W + 6, v0 - 6, v1 + 6, H, H + 16, teal, 1.6);
  const mF = frameV(o, -W, v1, H);
  shell += `<g transform="${matStr(mF)}">
    <rect x="34" y="24" width="232" height="40" rx="6" fill="#1d93ba"/>
    <text x="150" y="52" text-anchor="middle" ${MONO} font-size="22" font-weight="800" fill="#ffffff">Profanity</text>
    <rect x="34" y="80" width="232" height="72" rx="8" fill="#1d1f23" stroke="#5d636b" stroke-width="2"/>
    <text x="48" y="124" ${MONO} font-size="22" font-weight="800" fill="#5cc0e0">0x0000···</text>
    <rect x="60" y="190" width="180" height="16" rx="4" fill="#2b2d31"/>
    <rect x="96" y="200" width="108" height="28" rx="3" fill="#1d93ba" stroke="#155e77" stroke-width="1.5"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${60 + i * 48}" y="250" width="34" height="6" rx="3" fill="#cfc8ba"/>`).join("")}
    <circle cx="250" cy="262" r="7" fill="#2bd46f" stroke="rgba(0,0,0,0.3)"/></g>`;
  const outline = `<path d="${edges(o, -W, W, v0, v1, 0, H + 16)}" fill="none" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="14 10" stroke-linejoin="round"/>`;
  const [ox, oy] = at(o);
  const svg = `<g id="${id}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}">${back}${inner}<g id="${id}-shell">${shell}</g><g id="${id}-ol" opacity="0">${outline}</g></g>`;
  const anchors = { top: at(o, 0, 0, H + 70), slot: at(o, 0, v1, H - 210), center: at(o, 0, 0, H / 2), ground: at(o) };
  return { svg, anchors };
}

// ---------------------------------------------------------------- objects (painter's order by ground y)
const items = [];
const add = (o, svg) => items.push({ y: at(o)[1], svg });
const A = {};
const vault = O.safe(VAULT, { id: "vault", plate: "金库", gold: false }); A.vault = vault.anchors;
const mb = X.addrPlate(MAILBOX, { id: "mb", text: "地址" });
A.mb = Object.fromEntries(Object.entries(mb.anchors).map(([k, p]) => [k, Array.isArray(p) ? lift(p, MAILBOX.z) : p]));
add(VAULT, vault.svg + X.liftSvg(mb.svg, MAILBOX.z));
const d256 = X.comboDial(DIAL256, { id: "d256", rings: 8 }); A.d256 = d256.anchors; add(DIAL256, d256.svg);
const d32 = X.comboDial(DIAL32, { id: "d32" }); A.d32 = d32.anchors;
const prof = profMachine(PROF, "prof", d32.svg); A.prof = prof.anchors;
const sh = X.shaft(PROF, { id: "sh", a: [SHAFT_A[0] - PROF.u, SHAFT_A[1] - PROF.v, SHAFT_A[2]], b: [SHAFT_B[0] - PROF.u, SHAFT_B[1] - PROF.v, SHAFT_B[2]] }); A.sh = sh.anchors;
// shaft lies between the machine (far) and the big dial (near): draw machine, then shaft, then dial
items.push({ y: at(PROF)[1], svg: prof.svg + `<g id="sh-wrap" opacity="0">${sh.svg}</g>` });
const rig = X.gpuRig(RIG, { id: "rig", cable: "cut" }); A.rig = rig.anchors; add(RIG, rig.svg);
const atk = O.person(ATTACKER, { id: "atk", role: "attacker" }); A.atk = atk.anchors; add(ATTACKER, atk.svg);
const ctr = X.rollCounter(COUNTER, { id: "ctr", digits: 10, value: 0 }); A.ctr = ctr.anchors; add(COUNTER, ctr.svg);
const clk = O.clock(CLOCK, { id: "clk", h: 3, m: 0 }); A.clk = clk.anchors; add(CLOCK, clk.svg);
items.sort((a, b) => a.y - b.y);

// ---------------------------------------------------------------- production-line outline (L9 placeholder)
const TOPM = matStr([U[0], U[1], V[0], V[1], 0, 0]);
const DASH = `fill="none" stroke="#a79f90" stroke-width="7" stroke-dasharray="26 18" stroke-linecap="round"`;
let lineSvg = `<g id="ln-belt" opacity="0"><g transform="${TOPM}"><rect x="${LINE.u0}" y="${LINE.v - LINE.half}" width="${LINE.u1 - LINE.u0}" height="${2 * LINE.half}" rx="18" ${DASH}/></g></g>`;
STATIONS.forEach((s, i) => {
  lineSvg += `<g id="ln-p${i}" opacity="0"><g transform="${TOPM}"><rect x="${s.u - PAD}" y="${LINE.v - PAD - 150}" width="${2 * PAD}" height="${2 * PAD}" rx="22" fill="#f6f3ec" fill-opacity="0.7" ${DASH}/>
    <text x="${s.u}" y="${LINE.v - 150 + 26}" text-anchor="middle" ${FONT} font-size="78" font-weight="900" fill="#b4ac9d">${s.n}</text></g></g>`;
});
lineSvg += `<g id="ln-br" opacity="0"><g transform="${TOPM}"><path d="M${SIGN_DESK.u} ${LINE.v + LINE.half + 10}L${SIGN_DESK.u} ${SIGN_DESK.v - PAD - 10}" ${DASH}/><rect x="${SIGN_DESK.u - PAD}" y="${SIGN_DESK.v - PAD}" width="${2 * PAD}" height="${2 * PAD}" rx="22" fill="#f6f3ec" fill-opacity="0.7" ${DASH}/></g></g>`;
lineSvg += `<g id="ln-ch" opacity="0"><g transform="${TOPM}"><path d="M${LINE.u1 + 20} ${LINE.v}L${CHAIN.u - 140} ${LINE.v}" ${DASH}/><rect x="${CHAIN.u - 130}" y="${CHAIN.v - 130}" width="260" height="260" rx="22" fill="#f6f3ec" fill-opacity="0.7" ${DASH}/></g></g>`;
const padTop = (u, v) => at({ u, v }, 0, 0, 0);

// ---------------------------------------------------------------- gold leaving the vault (L0)
const GP0 = at(VAULT, 10, 60, 80), GP3 = at({ u: -330, v: 900 }, 0, 0, 30);
const goldCv = dashCurve("cv-gold", GP0, GP3, { c1: [GP0[0] - 60, GP0[1] + 160], c2: [GP3[0] + 260, GP3[1] - 40], sw: 6, dash: "18 12" });
const [gq2, gq3] = [goldCv.P[2], goldCv.P[3]];
const ang = Math.atan2(gq3[1] - gq2[1], gq3[0] - gq2[0]);
const head = (() => { const s = 30, b = [gq3[0] + Math.cos(ang) * 6, gq3[1] + Math.sin(ang) * 6];
  const p1 = [b[0] - s * Math.cos(ang - 0.5), b[1] - s * Math.sin(ang - 0.5)], p2 = [b[0] - s * Math.cos(ang + 0.5), b[1] - s * Math.sin(ang + 0.5)];
  return `<polygon id="cv-gold-hd" points="${pts([b, p1, p2])}" fill="#e0453a" opacity="0"/>`; })();
const bar = (i) => `<g id="gb${i}" opacity="0">${box({ u: 0, v: 0 }, -30, 30, -13, 13, -10, 10, M.gold, 1.4)}</g>`;
const bars = [0, 1, 2].map(bar).join("");

const world = worldSvg("wsvg", gridSvg({ u0: -3000, u1: 4400, v0: -2600, v1: 2600 }) + lineSvg + items.map((x) => x.svg).join("\n") + goldCv.svg + head + bars, [-2600, -2600, 7400, 4800]);

// ---------------------------------------------------------------- labels (world, counter-scaled)
const up = (p, dy) => [p[0], p[1] - dy];
const TICK = `<svg width="30" height="26" viewBox="0 0 34 28"><path d="M3 15l9 9L31 4" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
let labels = "";
labels += wlab("lb-vault", [A.vault.top[0] - 150, A.vault.top[1] + 70], "金库 · Wintermute", "hide", "r");
labels += wlab("lb-date", [A.vault.top[0] + 230, A.vault.top[1] + 40], "2022 年 9 月", "lab-g hide", "l");
labels += wlab("lb-loss", [GP3[0] + 70, GP3[1] - 30], "被盗 约 1.6 亿美元", "lab-rs hide", "l");
labels += wlab("lb-loss2", [GP3[0] + 90, GP3[1] + 40], "事发时美元估值", "lab-g lab-sm hide", "l");
labels += wlab("lb-prof", A.prof.top, "Profanity · 靶号工具", "hide");
labels += wlab("lb-256", up(A.d256.top, 0), `${TICK}256 位<i class="stk" id="stk"></i>`, "lab-gs hide");
labels += wlab("lb-32", up(A.prof.top, 0), "只有 32 位种子", "lab-rs hide");
labels += wlab("lb-drive", [A.sh.center[0], A.sh.center[1] + 30], "带动", "lab-cs lab-sm hide", "t");
labels += wlab("lb-43", up(A.prof.top, 80), "约 43 亿种", "lab-cs lab-xl hide");
labels += wlab("lb-rig", A.rig.top, "GPU 枚举机", "hide");
labels += wlab("lb-atk", [A.atk.head[0], A.atk.head[1] - 40], "攻击者", "lab-rs hide", "b");
labels += wlab("lb-clk", A.clk.top, "一张 GPU · 几分钟", "lab-r hide");
labels += wlab("lb-clk2", A.clk.top, "真实攻击 · 更慢", "lab-g lab-sm hide", "t");
labels += wpin("lb-q", A.sh.center, `<div class="qbadge hide" id="qb">?</div>`, "c");
labels += wlab("lb-line", padTop((STATIONS[2].u + STATIONS[3].u) / 2, LINE.v - 520), "私钥生产线 · 本集主题", "lab-cs lab-xl hide");
STATIONS.forEach((s, i) => { labels += wlab(`lb-st${i}`, padTop(s.u, LINE.v - 150 + 140), s.name, "lab-g lab-sm hide", "t"); });
// flying address chip: printed by the machine, lands on the mailbox plate
labels += `<div class="pin" id="chip-pin" style="left:${f(A.prof.slot[0])}px;top:${f(A.prof.slot[1])}px"><div class="wl"><div class="ctr a-c"><div class="lab lab-cs lab-sm mono hide" id="chip">0x0000···</div></div></div></div>`;

// ---------------------------------------------------------------- cameras
const C = (u, v, z, k, sx = 960, sy = 500) => camAt(Wp(u, v, z), sx, sy, k);
const CAMS = {
  open: C(0, 0, 170, 1.0, 900, 700),
  l0: C(120, 330, 120, 0.8, 900, 470),
  l1: C(560, 0, 200, 0.8, 960, 540),
  l2: C(0, -20, 430, 1.25, 640, 470),
  l3: C(300, 0, 210, 0.9, 900, 560),
  l4: C(820, -10, 200, 1.0, 900, 580),
  l6: C(150, 1150, 150, 0.9, 560, 620),
  l8: C(800, -10, 200, 0.92, 900, 580),
};
{ // wide: the (empty) production line + the seg1 corner below it; the bench stays out of frame
  const P = [Wp(LINE.u0 - 20, LINE.v + PAD), Wp(LINE.u0, LINE.v - PAD - 260), Wp(CHAIN.u + 130, CHAIN.v - 130), Wp(CHAIN.u + 130, CHAIN.v + 130),
    Wp((STATIONS[2].u + STATIONS[3].u) / 2, LINE.v - 520, 0), Wp(VAULT.u - 145, VAULT.v + 120), Wp(PROF.u + 150, PROF.v + 90)];
  const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys) - 110, y1 = Math.max(...ys);
  const k = Math.min(1720 / (x1 - x0), 800 / (y1 - y0));
  CAMS.wide = camAt([(x0 + x1) / 2, (y0 + y1) / 2], 960, 500, f(k * 100) / 100);
}
// code card (screen) + red dashed line from the last row to the counter
const CODE = { x: 1070, y: 160 };
const lastRow = [CODE.x + 6, CODE.y + 24 + 56 + 50 * 2 + 25];
const ctrS = toScreen(CAMS.l6, A.ctr.window);
const cvCode = dashCurve("cv-code", lastRow, [ctrS[0] + 40, ctrS[1] - 40], { c1: [lastRow[0] - 200, lastRow[1] + 40], c2: [ctrS[0] + 220, ctrS[1] - 200] });
const code = `<div class="k-code hide" id="code" style="left:${CODE.x}px;top:${CODE.y}px">
  <div class="c-head">示例计算<span class="c-tag">示例</span></div>
  <div class="c-row">种子空间　约 43 亿</div>
  <div class="c-row">速度　　　10 亿 / 秒</div>
  <div class="c-row c-hot">全部试完　≈ 4.3 秒</div></div>`;
// L2 zoom card (screen) + teal dashed link to the mailbox plate
const ZC = { x: 1010, y: 230 };
const plateS = toScreen(CAMS.l2, A.mb.plate);
const cvZoom = dashCurve("cv-zoom", [ZC.x, ZC.y + 130], [plateS[0] + 34, plateS[1]], { color: "#2aa3c9", sw: 5, c1: [ZC.x - 160, ZC.y + 150], c2: [plateS[0] + 200, plateS[1] - 20] });
const zoom = `<div class="zcard hide" id="zoom" style="left:${ZC.x}px;top:${ZC.y}px">
  <div class="z-head">金库地址 · 靶号<span class="c-tag">示意</span></div>
  <div class="z-addr">0x<span id="zz">00000000</span><span class="z-rest">···</span></div>
  <div class="z-note">指定模式：<b id="zn">开头一串 0</b></div></div>`;

// ---------------------------------------------------------------- times
const TM = {
  wm: w("Wintermute", 0), stolen: w("被盗", 0), amt: w("亿美元", 0),
  addr: w("地址", 1), prof: w("Profanity", 1), tool: w("靶号工具", 1), gen: w("生成", 1),
  ta: w("靶号地址", 2), pat: w("模式", 2), zeros: w("一串", 2),
  b256: w("256", 3), guess: w("猜得出来", 3),
  rng: w("随机数", 4), s32: w("32", 4),
  n43: w("43", 5),
  ex: w("示例计算", 6), rate: w("10", 6), all: w("全部试完", 6), sec: w("4.3", 6),
  real: w("真实攻击", 7), slow: w("慢一些", 7), gpu: w("GPU", 7), mins: w("几分钟", 7),
  q: w("问题来了", 8), k256: w("256", 8), only: w("只值", 8),
  ep: w("这一集", 9), from: w("哪里来", 9), calc: w("算出来", 9),
};

// 术语卡（RETROFIT-deps 第 2 类）
const TERMS = [
  { id: "tc1", t1: "私钥", t2: "256 位的秘密数 · 有它才能签名", at: w("私钥", 3) },
  { id: "tc2", t1: "种子", t2: "随机数生成器的起点 · 决定全部输出", at: w("种子", 4) },
];

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    .lab-xl { font-size: 56px; font-weight: 900; padding: 6px 28px 10px; border-radius: 16px; letter-spacing: 0.02em; }
    .lab.mono, .mono { font-family: "JetBrains Mono", monospace; font-weight: 800; }
    .qbadge { width: 104px; height: 104px; border-radius: 50%; border: 6px solid #ffffff; color: #ffffff; font-size: 70px; font-weight: 900; background: #1c1c1c;
      display: flex; align-items: center; justify-content: center; line-height: 1; box-shadow: 0 6px 14px rgba(70,60,40,0.18); }
    .stk { position: absolute; left: 8px; right: 8px; top: 50%; height: 6px; margin-top: -3px; background: #e0453a; border-radius: 3px; transform: scaleX(0); transform-origin: 0 50%; }
    #lb-256 { position: relative; }
    #code { width: 760px; }
    .zcard { position: absolute; width: 760px; background: #ffffff; border-radius: 18px; padding: 22px 34px 26px; box-shadow: 0 12px 30px rgba(70,60,40,0.16); border: 4px solid #2aa3c9; }
    .zcard .z-head { display: flex; align-items: center; font-size: 34px; font-weight: 900; height: 52px; }
    .zcard .c-tag { margin-left: auto; font-size: 28px; font-weight: 700; color: #7d776b; background: #f1ede5; border-radius: 8px; padding: 2px 12px 4px; }
    .zcard .z-addr { margin-top: 14px; font-family: "JetBrains Mono", monospace; font-size: 70px; font-weight: 800; letter-spacing: 0.02em; color: #1c1c1c; }
    .zcard #zz { border-radius: 10px; padding: 0 6px; }
    .zcard .z-rest { color: #9a9385; }
    .zcard .z-note { margin-top: 10px; font-size: 32px; font-weight: 700; color: #6d685e; }
    .zcard .z-note b { color: #17809f; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 60px 40px 54px; }
    #ttl-card .t-main { font-size: 92px; }
    #scr-svg { position: absolute; left: 0; top: 0; overflow: visible; }
${termCss}
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <svg id="scr-svg" width="1920" height="1080" viewBox="0 0 1920 1080">${cvCode.svg}${cvZoom.svg}</svg>
      ${code}
      ${zoom}

      ${termHtml(TERMS)}      ${pills(1, { sections: script.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">① 种子只有32位</div><div class="t-sub">私钥从哪里来</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const GOLD = ${JSON.stringify(goldCv.P)};
      const CHIP = ${JSON.stringify({ a: A.prof.slot, b: A.mb.plate })};
      const r2 = (n) => Math.round(n * 100) / 100;
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.3, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.25, ease: "power2.in" }, t);
      const bez = (P, t) => [0, 1].map((k) => (1 - t) ** 3 * P[0][k] + 3 * (1 - t) ** 2 * t * P[1][k] + 3 * (1 - t) * t * t * P[2][k] + t ** 3 * P[3][k]);
      const hidden = ["prof", "d256", "rig", "atk", "ctr", "clk", "mb"];
      hidden.forEach((id) => tl.set("#" + id, { scaleY: 0, svgOrigin: $(id).getAttribute("data-ox") + " " + $(id).getAttribute("data-oy") }, 0));

      KIT.camSet(tl, CAMS.open);
      // ===== 0–1.6 title card over the vault → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.25);
      // ===== L0 Wintermute vault robbed: door opens, gold bars fly out along the red arrow
      KIT.cam(tl, 1.45, CAMS.l0, 1.1);
      KIT.pop(tl, "#lb-date", ${f(L(0).start + 0.3)});
      KIT.pop(tl, "#lb-vault", ${f(TM.wm)});
      KIT.door(tl, "vault", ${f(TM.stolen - 0.15)}, 105, 0.9);
      KIT.draw(tl, "cv-gold", ${f(TM.stolen + 0.45)}, 0.9);
      fadeIn("#cv-gold-hd", ${f(TM.stolen + 1.3)}, 0.15);
      [0, 1, 2].forEach((i) => { const o = { p: 0 }, t0 = ${f(TM.stolen + 0.55)} + i * 0.32;
        tl.set("#gb" + i, { opacity: 1 }, t0);
        tl.fromTo(o, { p: 0 }, { p: 1, duration: 1.3, ease: "power1.in", immediateRender: false, onUpdate: () => { const q = bez(GOLD, o.p); $("gb" + i).setAttribute("transform", "translate(" + r2(q[0]) + "," + r2(q[1]) + ")"); } }, t0);
        tl.to("#gb" + i, { opacity: 0, duration: 0.25 }, t0 + 1.1); });
      tl.set("#gb0, #gb1, #gb2", { attr: { transform: "translate(" + GOLD[0][0] + "," + GOLD[0][1] + ")" } }, 0);
      KIT.pop(tl, "#lb-loss", ${f(TM.amt - 0.1)});
      KIT.pop(tl, "#lb-loss2", ${f(TM.amt + 0.35)});
      // ===== L1 address printed by Profanity
      out("#lb-date, #lb-loss, #lb-loss2, #cv-gold, #cv-gold-hd", ${f(L(1).start - 0.15)}, 0.3);
      KIT.cam(tl, ${f(L(1).start - 0.1)}, CAMS.l1, 1.2);
      KIT.grow(tl, "mb", ${f(TM.addr - 0.2)});
      KIT.grow(tl, "prof", ${f(TM.prof - 0.35)});
      KIT.pop(tl, "#lb-prof", ${f(TM.prof + 0.1)});
      fadeIn("#chip", ${f(TM.gen - 0.9)}, 0.2);
      { const o = { p: 0 }, a = CHIP.a, b = CHIP.b, P = [a, [a[0] - 120, a[1] - 260], [b[0] + 220, b[1] - 260], b];
        tl.fromTo(o, { p: 0 }, { p: 1, duration: 1.0, ease: "power2.inOut", immediateRender: false, onUpdate: () => { const q = bez(P, o.p); $("chip-pin").style.left = r2(q[0]) + "px"; $("chip-pin").style.top = r2(q[1]) + "px"; } }, ${f(TM.gen - 0.7)}); }
      // ===== L2 vanity address: plate enlarged, leading zeros highlighted
      KIT.cam(tl, ${f(L(2).start - 0.25)}, CAMS.l2, 1.0);
      out("#lb-prof", ${f(L(2).start - 0.25)}, 0.2);
      tl.fromTo("#zoom", { opacity: 0, scale: 0.7, transformOrigin: "0% 60%" }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.4)", immediateRender: false }, ${f(TM.ta)});
      KIT.draw(tl, "cv-zoom", ${f(TM.ta + 0.25)}, 0.5);
      tl.to("#zz", { backgroundColor: "#1d93ba", color: "#ffffff", duration: 0.3 }, ${f(TM.zeros - 0.1)});
      tl.fromTo("#zn", { scale: 1 }, { scale: 1.12, duration: 0.2, yoyo: true, repeat: 1, immediateRender: false }, ${f(TM.zeros)});
      // ===== L3 256-bit claim: big 8-ring dial rises next to the vault
      out("#zoom, #cv-zoom", ${f(L(3).start - 0.2)}, 0.25);
      KIT.cam(tl, ${f(L(3).start - 0.2)}, CAMS.l3, 1.1);
      KIT.grow(tl, "d256", ${f(TM.b256 - 0.4)});
      KIT.pop(tl, "#lb-256", ${f(TM.b256 + 0.1)});
      KIT.dialTurn(tl, "d256", ${f(TM.b256 + 0.2)}, 90, 2.6);
      // ===== L4 inside Profanity: a single-ring 32-bit dial drives the big one (key frame)
      KIT.cam(tl, ${f(L(4).start - 0.2)}, CAMS.l4, 1.3);
      out("#lb-vault", ${f(L(4).start - 0.2)}, 0.25);
      tl.to("#prof-shell", { opacity: 0.1, duration: 0.6, ease: "power1.inOut" }, ${f(TM.rng - 0.1)});
      tl.to("#prof-ol", { opacity: 1, duration: 0.4 }, ${f(TM.rng + 0.1)});
      KIT.pop(tl, "#lb-32", ${f(TM.s32)});
      fadeIn("#sh-wrap", ${f(TM.s32 + 0.25)}, 0.35);
      KIT.dialTurn(tl, "d32", ${f(TM.s32 + 0.7)}, 360, 3.4);
      KIT.shaftSpin(tl, "sh", ${f(TM.s32 + 0.7)}, 3.4, 520);
      KIT.dialTurn(tl, "d256", ${f(TM.s32 + 0.7)}, 120, 3.4);
      KIT.pop(tl, "#lb-drive", ${f(TM.s32 + 1.0)});
      // ===== L5 about 4.3 billion possibilities
      KIT.pop(tl, "#lb-43", ${f(L(5).start + 0.5)}, 0.35);
      KIT.dialTurn(tl, "d32", ${f(TM.n43 + 0.2)}, 180, 2.0);
      KIT.shaftSpin(tl, "sh", ${f(TM.n43 + 0.2)}, 2.0, 300);
      KIT.dialTurn(tl, "d256", ${f(TM.n43 + 0.2)}, 60, 2.0);
      // ===== L6 example: GPU rig enumerates; 1e9/s × 4.3 s ≈ 4.3e9
      out("#lb-43, #lb-drive, #lb-32, #lb-256", ${f(L(6).start - 0.2)}, 0.25);
      KIT.cam(tl, ${f(L(6).start - 0.2)}, CAMS.l6, 1.3);
      KIT.grow(tl, "rig", ${f(L(6).start + 0.3)});
      KIT.grow(tl, "atk", ${f(L(6).start + 0.5)});
      KIT.grow(tl, "ctr", ${f(L(6).start + 0.7)});
      KIT.pop(tl, "#lb-rig", ${f(L(6).start + 0.6)});
      KIT.pop(tl, "#lb-atk", ${f(L(6).start + 0.8)});
      tl.fromTo("#code", { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out", immediateRender: false }, ${f(TM.ex)});
      KIT.fans(tl, "rig", ${f(TM.rate - 0.2)}, ${f(TM.sec + 0.6 - (TM.rate - 0.2))}, 3);
      KIT.count(tl, "ctr", ${f(TM.rate)}, ${f(TM.sec + 0.5 - TM.rate)}, 0, 4294967295, "none");
      KIT.draw(tl, "cv-code", ${f(TM.all)}, 0.6);
      // ===== L7 real attack is slower: one GPU, a few minutes
      out("#code, #cv-code", ${f(TM.slow + 0.1)}, 0.3);
      KIT.grow(tl, "clk", ${f(TM.real)});
      KIT.pop(tl, "#lb-clk2", ${f(TM.slow - 0.2)});
      KIT.pop(tl, "#lb-clk", ${f(TM.gpu)});
      KIT.clock(tl, "clk", ${f(TM.gpu)}, 1.8, 6);
      // ===== L8 why is a 256-bit key worth only 32 bits?
      out("#lb-rig, #lb-atk, #lb-clk, #lb-clk2", ${f(L(8).start - 0.2)}, 0.25);
      KIT.cam(tl, ${f(L(8).start - 0.2)}, CAMS.l8, 1.3);
      out("#rig, #atk, #ctr, #clk", ${f(L(8).start - 0.2)}, 0.5);
      KIT.pop(tl, "#lb-256", ${f(TM.q + 0.4)});
      KIT.pop(tl, "#lb-32", ${f(TM.q + 0.6)});
      KIT.pop(tl, "#qb", ${f(TM.q + 0.8)}, 0.3);
      tl.fromTo("#lb-256", { scale: 1 }, { scale: 1.15, duration: 0.2, yoyo: true, repeat: 1, immediateRender: false }, ${f(TM.k256)});
      tl.to("#lb-256", { backgroundColor: "#ffffff", borderColor: "#cfc7b8", color: "#8a8478", duration: 0.3 }, ${f(TM.only)});
      tl.to("#stk", { scaleX: 1, duration: 0.35, ease: "power2.out" }, ${f(TM.only + 0.1)});
      tl.fromTo("#lb-32", { scale: 1 }, { scale: 1.18, duration: 0.2, yoyo: true, repeat: 1, immediateRender: false }, ${f(TM.only + 0.45)});
      // ===== L9 pull back: the (still empty) private-key production line
      out("#qb, #chip, #lb-256, #lb-32", ${f(L(9).start - 0.1)}, 0.25);
      KIT.cam(tl, ${f(L(9).start - 0.1)}, CAMS.wide, 2.0);
      fadeIn("#ln-belt", ${f(TM.ep + 0.3)}, 0.5);
      [0, 1, 2, 3, 4, 5].forEach((i) => { fadeIn("#ln-p" + i, ${f(TM.ep + 0.5)} + i * 0.18, 0.35); KIT.pop(tl, "#lb-st" + i, ${f(TM.ep + 0.7)} + i * 0.18); });
      fadeIn("#ln-br, #ln-ch", ${f(TM.ep + 1.6)}, 0.4);
      KIT.pop(tl, "#lb-line", ${f(TM.from - 0.3)}, 0.35);
      tl.set({}, {}, ${f(TOTAL)});

      ${termJs(TERMS)}      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes", { TOTAL, wide: CAMS.wide });
