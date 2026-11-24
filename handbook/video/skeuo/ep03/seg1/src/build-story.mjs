// Generates compositions/story.html for ep03/seg1「① 借来的身份」(one isometric world, one camera).
// Run: node src/build-story.mjs
import fs from "node:fs";
import { at, Wp, f, pts, U, V, CE, matStr, frameTop, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, kitCss, runtimeJs, contactShadow } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { wordAt as _wa } from "../../../kit/timing.mjs";
import { termCss, termHtml, termJs } from "../../kit-ext/termcards.mjs";
import { contractMachine, slotCabinet, signboard, runtimeExtJs } from "../../kit-ext/objects-ext.mjs";
import { ROAD, ADMIN, LAPTOP, LOCK, MACH_V, MACHINES, SLOT, OUT, GATE, STOP, VAULT, PARK, CABINET, SIGN, EVM } from "./layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
// 术语卡（RETROFIT-deps 第 2 节）
const TERMS = [
  { id: 'tm1', term: 'EVM', def: '以太坊虚拟机 · 执行合约字节码', at: _wa(T, 'EVM', { line: 10 }).start },
];
const script = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const L = (i) => lineAt(T, i);
const w = (term, line, o = {}) => wordAt(T, term, { line, ...o }).start;

// ---------------------------------------------------------------- ground
const TOP = matStr([U[0], U[1], V[0], V[1], 0, 0]);
const H = ROAD.half, roadLen = ROAD.u1 - ROAD.u0;
let ground = `<g id="road"><g transform="${TOP}">
  <rect x="${ROAD.u0}" y="${-H}" width="${roadLen}" height="${2 * H}" fill="#f8f6f1" stroke="#d6cfc1" stroke-width="5"/>
  <path d="M${ROAD.u0 + 30} 0H${ROAD.u1 - 20}" stroke="#cfc7b8" stroke-width="8" stroke-dasharray="70 60"/>
  <rect x="${GATE.u - 64}" y="${-H + 6}" width="12" height="${2 * H - 12}" fill="#ffffff" stroke="#e2dccf" stroke-width="1.5"/></g></g>`;
// EVM frame on the ground
const ev = [[EVM.u0, EVM.v0], [EVM.u1, EVM.v0], [EVM.u1, EVM.v1], [EVM.u0, EVM.v1]].map(([u, v]) => Wp(u, v, 0));
let evLen = 0; for (let i = 0; i < 4; i++) { const a = ev[i], b = ev[(i + 1) % 4]; evLen += Math.hypot(b[0] - a[0], b[1] - a[1]); }
evLen = Math.ceil(evLen);
const evmFrame = `<path id="evm" d="M${pts([ev[0]])}L${pts([ev[1]])}L${pts([ev[2]])}L${pts([ev[3]])}Z" fill="#2aa3c9" fill-opacity="0" stroke="#2aa3c9" stroke-width="14" stroke-linejoin="round" stroke-dasharray="${evLen} ${evLen}" stroke-dashoffset="${evLen}"/>`;

// ---------------------------------------------------------------- objects (painter's order by ground y)
const items = [];
const add = (o, svg) => items.push({ y: at(o)[1], svg });
const A = {};
const FONT = `font-family="Noto Sans SC, sans-serif"`;

const admin = O.person(ADMIN, { id: "admin", role: "signer" }); A.admin = admin.anchors; add(ADMIN, admin.svg);
// laptop: default wallet screen → red phishing page "领取空投"
const phish = `<rect x="0" y="0" width="222" height="146" fill="#ffffff"/>
  <rect x="0" y="0" width="222" height="24" fill="#fde6e3"/><circle cx="12" cy="12" r="4" fill="#e9b1aa"/><circle cx="24" cy="12" r="4" fill="#e9b1aa"/>
  <rect x="36" y="5" width="176" height="14" rx="7" fill="#ffffff"/><text x="44" y="16" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#c3352b">claim-airdrop.xyz</text>
  <text x="111" y="62" text-anchor="middle" ${FONT} font-size="30" font-weight="900" fill="#1c1c1c">领取空投</text>
  <text x="111" y="86" text-anchor="middle" ${FONT} font-size="13" font-weight="700" fill="#8a8478">连接钱包 · 立即到账</text>
  <rect id="ph-btn" x="56" y="98" width="110" height="34" rx="9" fill="#e0453a"/><text x="111" y="121" text-anchor="middle" ${FONT} font-size="17" font-weight="900" fill="#ffffff">领取</text>
  <rect x="2" y="2" width="218" height="142" fill="none" stroke="#e0453a" stroke-width="4"/>`;
const lap = O.laptop(LAPTOP, { id: "lap", screen: O.laptopDefaultScreen({ title: "钱包" }), screen2: phish }); A.lap = lap.anchors; add(LAPTOP, lap.svg);
const lock = O.padlock(LOCK, { id: "lock" }); A.lock = lock.anchors; add(LOCK, lock.svg);

const mach = MACHINES.map((m) => { const o = { u: m.u, v: MACH_V }; const r = contractMachine(o, { id: m.id, name: m.name, tone: m.tone, state: m.state }); A[m.id] = r.anchors; add(o, r.svg); return r; });
const gate = O.checkpoint(GATE, { id: "gate", n: "检查", road: false }); A.gate = gate.anchors; add(GATE, gate.svg);
const vault = O.safe(VAULT, { id: "vault", plate: "VAULT" }); A.vault = vault.anchors; add(VAULT, vault.svg);
const cab = slotCabinet(CABINET, { id: "cab", fill: { 0: [{ bytes: 20, color: "teal" }, { bytes: 1, color: "green" }], 1: [{ bytes: 12, color: "ink" }] } }); A.cab = cab.anchors; add(CABINET, cab.svg);
const sign = signboard(SIGN, { id: "sign", n: "!", blank: true }); A.sign = sign.anchors; add(SIGN, sign.svg);
items.sort((a, b) => a.y - b.y);

// envelope (drawn at world origin, moved by transform) + its ground shadow
const envSvg = (id, red) => {
  const W = 120, Hh = 80, st = red ? "#e0453a" : "#6b665c", fill = red ? "#fde6e3" : "#ffffff";
  const m = frameTop({ u: 0, v: 0 }, -W / 2, -Hh / 2, 0);
  return `<g id="${id}" opacity="0"><g transform="translate(0,${f(4 * CE)})"><g transform="${matStr(m)}"><rect x="0" y="0" width="${W}" height="${Hh}" rx="6" fill="#cfc8ba"/></g></g>
    <g transform="${matStr(m)}"><rect x="0" y="0" width="${W}" height="${Hh}" rx="6" fill="${fill}" stroke="${st}" stroke-width="3"/>
    <path d="M3 4L${W / 2} ${Hh * 0.58}L${W - 3} 4" fill="none" stroke="${st}" stroke-width="3" stroke-linejoin="round"/>
    <rect x="${W / 2 - 34}" y="${Hh - 22}" width="68" height="15" rx="3" fill="${red ? "#e0453a" : "#1d93ba"}"/>
    <text x="${W / 2}" y="${Hh - 11}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="800" fill="#ffffff">calldata</text></g></g>`;
};
const shSvg = (id) => `<g id="${id}" opacity="0">${contactShadow({ u: 0, v: 0 }, 80, 52)}</g>`;
const movers = shSvg("e1-sh") + shSvg("e2-sh") + envSvg("e1", false) + envSvg("e2", true);

// tx.origin trace: vault → admin (teal dashed, world layer)
const P0 = [A.vault.top[0] - 40, A.vault.top[1] + 30], P3 = [A.admin.head[0] + 40, A.admin.head[1] - 20];
const trace = dashCurve("cv-tr", P0, P3, { color: "#2aa3c9", sw: 8, dash: "22 14", c1: [P0[0] - 700, P0[1] - 420], c2: [P3[0] + 700, P3[1] - 520] });

const world = worldSvg("wsvg", gridSvg({ u0: -2800, u1: 4400, v0: -2400, v1: 2600 }) + ground + `<g id="evm-g">${evmFrame}</g>` +
  items.map((x) => x.svg).join("\n") + movers + trace.svg, [-2400, -2600, 7000, 4600]);

// ---------------------------------------------------------------- labels (world, counter-scaled)
const up = (p, dy) => [p[0], p[1] - dy];
let labels = "";
labels += wlab("lb-admin", [A.admin.head[0] - 46, A.admin.head[1]], "管理员", "hide", "r");
labels += wlab("lb-admin2", A.admin.top, "管理员 · 发起整笔交易的外部账户", "lab-cs hide");
labels += wlab("lb-phish", A.lap.top, "钓鱼页面", "lab-rs hide");
labels += wlab("lb-atk", A.mAtk.top, "攻击者合约", "lab-rs hide");
labels += wlab("lb-borrow", up(A.mAtk.top, 66), "借用身份", "lab-r rise hide");
labels += wlab("lb-vault", A.vault.top, "金库", "hide");
labels += wlab("lb-gate", A.gate.top, "权限检查", "hide");
labels += wpin("lb-q", [A.gate.top[0] - 180, A.gate.top[1] - 30], `<div class="qbadge hide" id="qb">?</div>`, "c");
labels += wpin("lb-ok", [A.gate.top[0] - 180, A.gate.top[1] - 30], `<div class="okbadge hide" id="okb"><svg width="44" height="36" viewBox="0 0 44 36"><path d="M5 19L17 30L39 6" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`, "c");
labels += wlab("lb-pass", [A.gate.top[0] - 180, A.gate.top[1] + 22], "通过", "lab-gs hide", "t");
labels += wlab("lb-key", up(A.lock.top, 0), `私钥 · 没被偷`, "lab-gs hide");
labels += wlab("lb-evm", at({ u: EVM.u0, v: EVM.v1 }, 60, -40, 0), "EVM", "lab-cs lab-xl hide", "r");
labels += wlab("lb-q1", at({ u: PARK[0], v: PARK[1] }, 0, 0, 90), "谁在调用", "lab-cs hide");
labels += wlab("lb-q2", A.cab.top, "数据存在哪", "lab-cs hide");
labels += wlab("lb-q3", A.sign.top, "语言里的坑", "lab-cs hide");
// identity card that rides with the red envelope (moved by script; pinned at world origin)
labels += `<div class="pin" id="idc-pin" style="left:0px;top:0px"><div class="wl"><div class="ctr a-b"><div class="lab lab-ink hide" id="idc"><span class="mono">tx.origin</span>&nbsp;=&nbsp;管理员</div></div></div></div>`;

// ---------------------------------------------------------------- cameras
const C = (u, v, z, k, sx = 960, sy = 500) => camAt(Wp(u, v, z), sx, sy, k);
const CAMS = {
  open: C(-800, 20, 110, 1.18, 930, 520),
  l2: C(-380, -120, 110, 0.86, 960, 520),
  l3: C(900, -130, 110, 0.6, 960, 540),
  gate: C(1800, -40, 150, 0.98, 560, 560),
  wide: C(560, -100, 120, 0.52, 990, 560),
  evm: C(1180, -60, 100, 0.43, 980, 560),
  end: C(1240, -80, 120, 0.46, 960, 560),
};

// code card (screen layer) + red dashed line from the require row to the gate plate
const CODE = { x: 1040, y: 150 };
const reqRow = [CODE.x + 6, CODE.y + 24 + 56 + 50 * 1 + 25];
const plateS = toScreen(CAMS.gate, A.gate.plate);
const cvCode = dashCurve("cv-code", reqRow, [plateS[0] + 30, plateS[1] - 8], { c1: [reqRow[0] - 220, reqRow[1] - 170], c2: [plateS[0] + 120, plateS[1] - 330] });
const code = `<div class="k-code hide" id="code" style="left:${CODE.x}px;top:${CODE.y}px">
  <div class="c-head">金库合约 · 权限检查<span class="c-tag">示例</span></div>
  <div class="c-row">function withdraw() external {</div>
  <div class="c-row c-hot" id="row-req">    require(<span id="txo">tx.origin</span> == owner);<span class="c-red hide" id="req-x">   // ✗</span></div>
  <div class="c-row c-cm">    ...</div>
  <div class="c-row">}</div></div>`;

// ---------------------------------------------------------------- envelope paths (world u,v,z)
const arc = (A0, B0, h, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [0, 1, 2].map((k) => A0[k] + (B0[k] - A0[k]) * t + (k === 2 ? 4 * h * t * (1 - t) : 0)); });
const lapOut = [LAPTOP.u + 10, LAPTOP.v - 70, 150];
const atkU = MACHINES[0].u, aU = MACHINES[1].u, bU = MACHINES[2].u;
const hop = (u) => [[u - 90, 0, 6], [u - 40, -120, 40], SLOT(u), [u + 50, -120, 40], [u + 100, 0, 6]];
const PATHS = {
  toAtk: arc(lapOut, SLOT(atkU), 160),
  toStop: [OUT(atkU), [atkU + 140, 0, 6], [STOP, 0, 6]],
  toPark: [[STOP, 0, 6], [GATE.u, 0, 6], PARK],
  replay: [OUT(atkU), [atkU + 140, 0, 6], ...hop(aU), ...hop(bU), [STOP, 0, 6], [GATE.u, 0, 6], PARK],
};
// fraction along the replay path where it touches each relay slot (for the card flashes)
const plen = (P) => { const Ls = [0]; for (let i = 1; i < P.length; i++) Ls.push(Ls[i - 1] + Math.hypot(...[0, 1, 2].map((k) => P[i][k] - P[i - 1][k]))); return Ls; };
const RL = plen(PATHS.replay);
const fracA = RL[4] / RL[RL.length - 1], fracB = RL[9] / RL[RL.length - 1];

// ---------------------------------------------------------------- times
const TM = {
  ex: w("示例", 0), admin: w("管理员", 1), open: w("打开", 1), phish: w("钓鱼", 1),
  claim: w("领空投", 2), real: w("实际", 2), atk: w("攻击者", 2),
  next: w("紧接着", 3), vault: w("金库", 3),
  perm: w("权限检查", 4), only: w("只有一句", 4), sender: w("发起人", 4), adm4: w("管理员", 4),
  pass: w("能通过", 5), yes: w("能", 6),
  txo: w("tx.origin", 7), ie: w("也就是", 7), eoa: w("外部账户", 7),
  fooled: w("被骗", 8), mid: w("中间", 8), many: w("多少个合约", 8), same: w("不变", 8),
  nokey: w("没有偷私钥", 9), borrow: w("借用", 9),
  step: w("看懂这一步", 10), machine: w("这台机器", 10), evm: w("EVM", 10),
  three: w("三件事", 11), who: w("谁在调用", 11), data: w("数据存在哪", 11), lang: w("语言里", 11),
};

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    .lab-xl { font-size: 60px; font-weight: 900; padding: 6px 30px 10px; border-radius: 16px; letter-spacing: 0.04em; }
    .lab .mono { font-family: "JetBrains Mono", monospace; font-weight: 800; }
    .qbadge, .okbadge { width: 84px; height: 84px; border-radius: 50%; border: 5px solid #ffffff; color: #ffffff; font-size: 56px; font-weight: 900;
      display: flex; align-items: center; justify-content: center; line-height: 1; box-shadow: 0 6px 14px rgba(70,60,40,0.18); }
    .qbadge { background: #1c1c1c; }
    .rise { position: relative; top: -60px; }
    .okbadge { background: #1f9d55; }
    #code { width: 820px; }
    #txo { border-radius: 6px; }
    #ex-tag { position: absolute; left: 48px; top: 34px; }
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
      <svg id="scr-svg" width="1920" height="1080" viewBox="0 0 1920 1080">${cvCode.svg}</svg>
      ${code}
      <div class="lab lab-g hide" id="ex-tag">示例场景</div>
      ${termHtml(TERMS)}
      ${pills(1, { sections: script.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">① 借来的身份</div><div class="t-sub">EVM 与 Solidity 安全基础</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const PATHS = ${JSON.stringify(PATHS)};
      const CA = Math.cos(35 * Math.PI / 180), SA = Math.sin(35 * Math.PI / 180), CE = Math.cos(30 * Math.PI / 180);
      const Wp = (u, v, z) => [u * CA + v * SA, -u * SA * 0.5 + v * CA * 0.5 - (z || 0) * CE];
      const r2 = (n) => Math.round(n * 100) / 100;
      const IO = "power2.inOut";
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pathFn = (P) => { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1], P[i][2] - P[i - 1][2]));
        return (p) => { const d = p * L[L.length - 1]; let i = 1; while (i < L.length - 1 && L[i] < d) i++; const s = (d - L[i - 1]) / ((L[i] - L[i - 1]) || 1);
          return [0, 1, 2].map((k) => P[i - 1][k] + (P[i][k] - P[i - 1][k]) * s); }; };
      const place = (id, card) => (q) => { const a = Wp(q[0], q[1], q[2]), b = Wp(q[0], q[1], 0), k = Math.max(0.35, 1 - q[2] / 500);
        $(id).setAttribute("transform", "translate(" + r2(a[0]) + "," + r2(a[1]) + ")");
        $(id + "-sh").setAttribute("transform", "translate(" + r2(b[0]) + "," + r2(b[1]) + ") scale(" + r2(k) + ")");
        if (card) { const c = Wp(q[0], q[1], q[2] + 70); $("idc-pin").style.left = r2(c[0]) + "px"; $("idc-pin").style.top = r2(c[1]) + "px"; } };
      const follow = (t, dur, P, fn, ease) => { const pf = pathFn(P), o = { p: 0 };
        tl.fromTo(o, { p: 0 }, { p: 1, duration: dur, ease: ease || IO, immediateRender: false, onUpdate: () => fn(pf(o.p)) }, t); };
      const hidden = (id, t) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); KIT.grow(tl, id, t); };
      place("e1")(PATHS.toAtk[0]); place("e2", true)(PATHS.toStop[0]);

      KIT.camSet(tl, CAMS.open);
      // objects that appear later
      ["mAtk", "mA", "mB", "gate", "vault", "lock", "cab", "sign"].forEach((id) => tl.set("#" + id, { scaleY: 0, svgOrigin: $(id).getAttribute("data-ox") + " " + $(id).getAttribute("data-oy") }, 0));

      // ===== 0–1.6 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.25);
      // ===== L0 example scene: admin + laptop
      KIT.pop(tl, "#ex-tag", ${f(TM.ex - 0.1)});
      KIT.pop(tl, "#lb-admin", ${f(TM.ex + 0.4)});
      // ===== L1 phishing page on the laptop
      KIT.swap(tl, "#lap-scr", "#lap-scr2", ${f(TM.open)}, 0.35);
      KIT.pop(tl, "#lb-phish", ${f(TM.phish)});
      // ===== L2 admin clicks "claim" → white envelope into the red attacker machine
      KIT.cam(tl, ${f(L(2).start - 0.3)}, CAMS.l2, 1.1);
      tl.to("#ph-btn", { attr: { fill: "#a8322a" }, duration: 0.12 }, ${f(TM.claim + 0.2)});
      tl.to("#ph-btn", { attr: { fill: "#e0453a" }, duration: 0.2 }, ${f(TM.claim + 0.45)});
      KIT.grow(tl, "mAtk", ${f(TM.claim - 0.2)});
      fadeIn("#e1, #e1-sh", ${f(TM.real - 0.1)}, 0.15);
      follow(${f(TM.real)}, 1.0, PATHS.toAtk, place("e1"));
      KITX.slot(tl, "mAtk", ${f(TM.real + 0.8)}, true);
      out("#e1, #e1-sh", ${f(TM.real + 0.95)}, 0.12);
      KITX.spin(tl, "mAtk", ${f(TM.real + 1.0)}, 2.2, 1.5, "power1.inOut");
      KIT.pop(tl, "#lb-atk", ${f(TM.atk)});
      out("#lb-phish", ${f(TM.atk + 0.3)});
      // ===== L3 red machine spits a red envelope down the avenue toward the vault
      KIT.cam(tl, ${f(L(3).start - 0.2)}, CAMS.l3, 1.6);
      out("#lb-admin", ${f(L(3).start - 0.2)}, 0.25);
      KITX.slot(tl, "mAtk", ${f(L(3).start)}, false);
      KIT.grow(tl, "gate", ${f(L(3).start + 0.4)});
      KIT.grow(tl, "vault", ${f(L(3).start + 0.6)});
      fadeIn("#e2, #e2-sh", ${f(TM.next - 0.1)}, 0.15);
      follow(${f(TM.next)}, 1.6, PATHS.toStop, place("e2", true));
      KIT.pop(tl, "#lb-vault", ${f(TM.vault)});
      // ===== L4 the vault's only check (code card A + red dashed line to the booth)
      KIT.cam(tl, ${f(L(4).start - 0.3)}, CAMS.gate, 1.1);
      KIT.pop(tl, "#lb-gate", ${f(TM.perm)});
      tl.fromTo("#code", { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out", immediateRender: false }, ${f(TM.only - 0.1)});
      KIT.draw(tl, "cv-code", ${f(TM.sender)}, 0.7);
      // ===== L5 can it pass?
      KIT.pop(tl, "#qb", ${f(L(5).start + 0.1)}, 0.3);
      // ===== L6 yes: barrier up, green check, red envelope goes through, door opens
      out("#qb", ${f(TM.yes - 0.1)}, 0.12);
      KIT.pop(tl, "#okb", ${f(TM.yes)}, 0.3);
      KIT.pop(tl, "#lb-pass", ${f(TM.yes + 0.1)});
      KIT.arm(tl, "gate", ${f(TM.yes)}, true, 0.6);
      follow(${f(TM.yes + 0.4)}, 1.0, PATHS.toPark, place("e2", true));
      KIT.door(tl, "vault", ${f(TM.yes + 1.1)}, 70, 0.9);
      out("#ex-tag", ${f(L(7).start)}, 0.3);
      // ===== L7 tx.origin = the external account that started the whole transaction
      tl.to("#txo", { color: "#e0453a", backgroundColor: "#ffffff", duration: 0.2 }, ${f(TM.txo)});
      KIT.pop(tl, "#req-x", ${f(TM.txo + 0.3)});
      KIT.pop(tl, "#idc", ${f(TM.txo + 0.2)}, 0.3);
      out("#code, #cv-code", ${f(TM.ie + 0.3)}, 0.3);
      out("#lb-gate, #okb, #lb-pass", ${f(TM.ie + 0.3)}, 0.25);
      KIT.cam(tl, ${f(TM.ie + 0.35)}, CAMS.wide, 1.4);
      KIT.draw(tl, "cv-tr", ${f(TM.eoa - 0.6)}, 1.2);
      KIT.swap(tl, "#lb-admin", "#lb-admin2", ${f(TM.eoa + 0.3)}, 0.3);
      // ===== L8 the fooled admin; however many contracts in between, it does not change
      tl.fromTo("#lb-admin2", { scale: 1 }, { scale: 1.18, duration: 0.18, yoyo: true, repeat: 1, ease: "power1.inOut", immediateRender: false }, ${f(TM.fooled)});
      out("#cv-tr", ${f(TM.mid - 0.2)}, 0.3);
      KIT.grow(tl, "mA", ${f(TM.mid)});
      KIT.grow(tl, "mB", ${f(TM.mid + 0.2)});
      out("#e2, #e2-sh", ${f(TM.mid + 0.1)}, 0.12);
      tl.set("#idc", { opacity: 0 }, ${f(TM.mid + 0.22)});
      fadeIn("#e2, #e2-sh, #idc", ${f(TM.mid + 0.55)}, 0.15);
      { const t0 = ${f(TM.mid + 0.6)}, D = ${f(Math.max(2.4, TM.same + 0.3 - (TM.mid + 0.6)))};
        follow(t0, D, PATHS.replay, place("e2", true), "none");
        [[${f(fracA)}, "mA"], [${f(fracB)}, "mB"]].forEach(([fr, id]) => { const tk = t0 + D * fr;
          KITX.slot(tl, id, tk - 0.1, true); KITX.slot(tl, id, tk + 0.4, false);
          KITX.spin(tl, id, tk - 0.1, 0.8, 1, "power1.out");
          tl.fromTo("#idc", { scale: 1 }, { scale: 1.22, duration: 0.14, yoyo: true, repeat: 1, ease: "power1.out", immediateRender: false }, tk);
          tl.fromTo("#idc", { boxShadow: "0 0 0 0 rgba(42,163,201,0)" }, { boxShadow: "0 0 0 10px rgba(42,163,201,0.55)", duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, tk); }); }
      // ===== L9 no key stolen — identity borrowed
      KIT.grow(tl, "lock", ${f(TM.nokey - 0.2)});
      KIT.pop(tl, "#lb-key", ${f(TM.nokey + 0.2)});
      KIT.pop(tl, "#lb-borrow", ${f(TM.borrow)});
      // ===== L10 first understand this machine: the EVM
      KIT.cam(tl, ${f(L(10).start - 0.2)}, CAMS.evm, 1.4);
      out("#lb-key, #lb-borrow", ${f(L(10).start - 0.2)}, 0.3);
      KIT.swap(tl, "#lb-admin2", "#lb-admin", ${f(L(10).start - 0.2)}, 0.3);
      tl.fromTo("#evm", { attr: { "stroke-dashoffset": ${evLen} } }, { attr: { "stroke-dashoffset": 0 }, duration: 1.4, ease: "power1.inOut", immediateRender: false }, ${f(TM.machine - 0.3)});
      tl.to("#evm", { attr: { "fill-opacity": 0.07 }, duration: 0.5 }, ${f(TM.machine + 1.1)});
      KIT.pop(tl, "#lb-evm", ${f(TM.evm)}, 0.3);
      // ===== L11 three things: who calls, where data lives, language pitfalls
      KIT.cam(tl, ${f(L(11).start - 0.2)}, CAMS.end, 1.2);
      out("#idc", ${f(TM.who - 0.3)}, 0.2);
      KIT.pop(tl, "#lb-q1", ${f(TM.who)});
      KIT.grow(tl, "cab", ${f(TM.data - 0.35)});
      KIT.pop(tl, "#lb-q2", ${f(TM.data + 0.1)});
      KIT.grow(tl, "sign", ${f(TM.lang - 0.35)});
      KIT.pop(tl, "#lb-q3", ${f(TM.lang + 0.1)});
      tl.set({}, {}, ${f(TOTAL)});
${termJs(TERMS)}
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes", { fracA, fracB });
