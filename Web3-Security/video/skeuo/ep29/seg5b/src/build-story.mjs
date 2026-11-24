// seg5b「⑤ 怎么守 · 你今天能做什么」— 生成 compositions/story.html
// 运行：node src/build-story.mjs
// 一个连续的等距世界 + 一台镜头：上方是七关道路（升级后的防御架构，尽头是 Bybit 冷钱包 + 公章），
// 下方一排五个角色，每人一个小场景；最后回到保险柜和公章，再拉回整条路，结束卡。
import fs from "node:fs";
import { G, at, f, camAt, worldSvg, gridSvg, wlab, wpin, kitCss, runtimeJs, CHECK, BADGE, M, flat, line3, faceTop, dashCurve, CE, U, V } from "../../kit/iso.mjs";
import * as O from "../../kit/objects.mjs";
import { pills } from "../../kit/pills.mjs";
import { termCards, termJs } from "../../kit/terms.mjs";
// 术语卡（2026-11-15 第二轮返工）：时间按旧时间（= timing_old），revoice.py 按句拉伸
const TERMS = [
  { id: "tc1", t1: "哈希", t2: "由交易内容算出的一串值 · 用来核对", t0: 17.24, t1s: 20.80 },
];
import { buildArch, uS } from "./arch5a.mjs";
import { svcBox, keycard, stopwatch, links, badgePerson, gpath, groundRing, txt } from "./objs.mjs";

const TM = JSON.parse(fs.readFileSync(new URL("../timing.json", import.meta.url), "utf8"));
const TOTAL = TM.total;

// ------------------------------------------------------------------ world items (painter's order by ground Y)
const items = []; // {Y, svg}
const ground = []; // drawn right after the grid (roads, ground lines, rings)
const overlay = []; // drawn last (flying things, links)
const A = {}; // anchors by id
let ZONE = -1;
const ZG = [0, 1, 2, 3, 4].map(() => ({ ground: [], items: [], top: [] }));
const gpush = (svg) => (ZONE >= 0 ? ZG[ZONE].ground : ground).push(svg);
const opush = (svg) => (ZONE >= 0 ? ZG[ZONE].top : overlay).push(svg);
const ipush = (it) => (ZONE >= 0 ? ZG[ZONE].items : items).push(it);
const add = (fn, X, Y, opts) => { const r = fn(G(X, Y), opts); ipush({ Y, svg: r.svg }); A[opts.id] = r.anchors; return r; };
const addAt = (fn, o, opts, Y) => { const r = fn(o, opts); ipush({ Y: Y ?? at(o)[1], svg: r.svg }); A[opts.id] = r.anchors; return r; };
const gp = (X, Y) => [X, Y]; // ground point in world-canvas px (z = 0 ⇒ same)

// ---- seg5a 的终态：完整防御架构全景（同一世界坐标，第一帧 = seg5a 最后一帧）
const ARCH = buildArch();
ground.push(ARCH.under);
ARCH.statics.forEach((it) => items.push(it));
overlay.push(ARCH.over);
// L8: teal outline of the signing path (seg5a road: u −380…3460, v −86…210)
{
  const RO = ARCH.P(0, 0);
  const P = [[-394, -100], [3474, -100], [3474, 224], [-394, 224], [-394, -100]].map((q) => at(RO, q[0], q[1], 0));
  ground.push(gpath("road-ol", P, "#2aa3c9", 8));
}
// the opening's vault (Bybit cold wallet) + seal, beyond the chain — outside seg5a's wide frame
const vaultO = { u: 4300, v: -100 };
// vault: empty cavity + a gold-filled cavity overlay that can fade out ("钱没了")
{
  const empty = O.safe(vaultO, { id: "vault", plate: "COLD", gold: false });
  const full = O.safe(vaultO, { id: "vault", plate: "COLD", gold: true });
  const re = /<g id="vault-cav" clip-path="url\(#vault-cav-c\)">([\s\S]*?)<\/g>/;
  const gold = full.svg.match(re)[1];
  const svg = empty.svg.replace(re, (m) => m + `<g id="vault-gold" clip-path="url(#vault-cav-c)">${gold}</g>`);
  items.push({ Y: at(vaultO)[1], svg });
  A.vault = empty.anchors;
}
// the key, resting on the shelf inside (shown once the door is open)
{
  const ko = { u: vaultO.u - 6, v: vaultO.v + 62 };
  const r = O.key(ko, { id: "vkey" });
  overlay.push(`<g id="vkey-wrap" opacity="0"><g transform="translate(0,${f(-172 * CE)})">${r.svg}</g></g>`);
  A.vkey = { top: at(ko, 20, 0, 172 + 60) };
}
// seal + the document under it (normal → swapped for the attacker's)
const sealO = { u: vaultO.u - 40, v: vaultO.v + 430 };
const docO = { u: sealO.u - 36, v: sealO.v + 8 };
{
  const dN = O.doc(docO, { id: "docN", title: "转账", lines: ["收款 用户地址", "金额 20,000"] });
  const dR = O.doc(docO, { id: "docR", title: "实际签下", lines: ["operation: 1", "→ 攻击者合约"], state: "attacker" });
  const s = O.seal(sealO, { id: "seal", paper: false, stamped: false });
  items.push({ Y: at(sealO)[1] - 1, svg: `<g id="docN-mv">${dN.svg}</g><g id="docR-mv" opacity="0">${dR.svg}</g>` });
  items.push({ Y: at(sealO)[1], svg: s.svg });
  A.seal = s.anchors; A.doc = dN.anchors;
}
// L8 magnifiers: one per layer, on the road in front of each device
const GATES = ARCH.layers;
GATES.forEach((L, k) => { const o = { u: uS(k) + 110, v: 30 }; addAt(O.magnifier, o, { id: `mg${k}`, z: 60 }, at(o)[1] + 1); });

// ---- the row of five roles
const PX = (i) => 50 + 1100 * i, PY = 1150;
const ROLES = [
  { name: "签名工程师", color: "#2a9fc6", badge: "#ffffff", band: "#1d93ba" },
  { name: "多签签名人", color: "#3b3e44", badge: "#ffffff", band: "#6d685e" },
  { name: "运维", color: "#5b7086", badge: "#ffffff", band: "#2f4a6d" },
  { name: "安全工程师", color: "#2f4a6d", badge: "#ffffff", band: "#1d93ba" },
  { name: "事故指挥官", color: "#8a5a34", badge: "#ffffff", band: "#1c1c1c" },
];
const LX = (i) => 1500 + 330 * i, LY = 470; // L0 lineup (in front of the architecture)
const MOVE = ROLES.map((_, i) => [f(PX(i) - LX(i)), f(PY - LY)]);
ROLES.forEach((r, i) => { ZONE = i; add(badgePerson, LX(i), LY, { id: `p${i}`, color: r.color, badge: r.badge, band: r.band }); });
ZONE = -1;

ZONE = 0;
// ---- zone 1 · 签名工程师: every call path into the signing node; one skips the policy engine
const Z1 = PX(0);
add(svcBox, Z1 + 280, 975, { id: "z1a", tag: "WITHDRAW" });
add(svcBox, Z1 + 250, 1165, { id: "z1b", tag: "APPROVAL" });
add(O.laptop, Z1 + 250, 1370, { id: "z1c" });
add(O.shield, Z1 + 590, 1075, { id: "z1s" });
add(O.rack, Z1 + 900, 1150, { id: "z1r", tag: "SIGN" });
{
  const S = gp(Z1 + 590, 1095), R = gp(Z1 + 880, 1160);
  gpush(gpath("z1-pa", [gp(Z1 + 280, 990), S, R], "#2aa3c9"));
  gpush(gpath("z1-pb", [gp(Z1 + 250, 1180), S, R], "#2aa3c9"));
  gpush(gpath("z1-pc", [gp(Z1 + 300, 1385), gp(Z1 + 640, 1360), R], "#2aa3c9"));
  gpush(gpath("z1-pcr", [gp(Z1 + 300, 1385), gp(Z1 + 640, 1360), R], "#e0453a", 10, `style="opacity:0"`));
  gpush(groundRing("z1-ring", G(Z1 + 560, 1350), 300, 130));
}

ZONE = 1;
// ---- zone 2 · 多签签名人: a second device recomputes the hash
const Z2 = PX(1);
const HASH = "0x7a3e…c91f";
const hashScreen = (title, sub) => `<rect x="0" y="0" width="222" height="28" fill="#ece7dd"/>` + txt(10, 20, title, { size: 14, weight: 700, fill: "#5f5a50" }) +
  txt(12, 60, sub, { size: 15, weight: 700, fill: "#6d685e" }) + txt(12, 96, HASH, { size: 24, mono: true, weight: 800 }) +
  `<rect x="12" y="110" width="150" height="8" rx="4" fill="#ddd6c9"/>`;
add(O.laptop, Z2 + 300, 1070, { id: "z2a", screen: hashScreen("Safe{Wallet}", "交易哈希") });
add(O.laptop, Z2 + 700, 1210, { id: "z2b", screen: `<rect x="0" y="0" width="222" height="146" fill="#1f2226"/>` + txt(14, 40, "$ 独立重算", { size: 18, weight: 700, fill: "#9ad9ee" }) + `<rect x="14" y="58" width="120" height="8" rx="4" fill="#3b3e44"/>`,
  screen2: `<rect x="0" y="0" width="222" height="146" fill="#1f2226"/>` + txt(14, 40, "$ 独立重算", { size: 18, weight: 700, fill: "#9ad9ee" }) + txt(14, 92, HASH, { size: 24, mono: true, weight: 800, fill: "#ffffff" }) });

ZONE = 2;
// ---- zone 3 · 运维: scan dev laptops for production tokens; where can one compromised laptop deploy?
const Z3 = PX(2);
const LP = [[Z3 + 250, 1330], [Z3 + 480, 1250], [Z3 + 710, 1170]];
LP.forEach(([X, Y], i) => add(O.laptop, X, Y, { id: `z3l${i}`, screen2: `<rect x="0" y="0" width="222" height="146" fill="#fde6e3"/><rect x="0" y="0" width="222" height="28" fill="#e0453a"/>` + txt(111, 92, "失陷", { size: 30, anchor: "middle", fill: "#c3352b" }) }));
const SV = [[Z3 + 330, 960], [Z3 + 580, 900], [Z3 + 830, 880]];
SV.forEach(([X, Y], i) => add(svcBox, X, Y, { id: `z3s${i}`, tag: "PROD" }));
gpush(groundRing("z3-ring", G(LP[2][0], LP[2][1]), 210, 150));
// magnifier hovering over the laptops (moves L0 → L1 → L2)
{
  const r = O.magnifier(G(LP[0][0] - 10, LP[0][1] - 40), { id: "z3m", z: 150 });
  opush(r.svg);
  A.z3m = r.anchors;
}
// the token card rising out of the last laptop
{
  const r = keycard(G(LP[2][0] + 125, LP[2][1] + 45), { id: "z3k", z: 10, k: 1.45 });
  opush(`<g id="z3k-mv" opacity="0">${r.svg}</g>`);
  A.z3k = r.anchors;
}
const z3curves = SV.map(([X, Y], i) => {
  const P0 = [A.z3k.center[0] - 40, A.z3k.center[1] - 200], P3 = at(G(X, Y), 0, 0, 175);
  return dashCurve(`z3c${i}`, P0, P3, { c1: [P0[0] + (P3[0] - P0[0]) * 0.3, P0[1] - 140], c2: [P3[0], P3[1] - 120] });
});
opush(z3curves.map((c) => c.svg).join(""));

ZONE = 3;
// ---- zone 4 · 安全工程师: a 7702 authorization request on testnet → policy rejects, alarm fires
const Z4 = PX(3);
{
  const r = O.chain(G(Z4 + 820, 1010), { id: "z4c", n: 3, labels: ["test", "test", "test"] });
  ipush({ Y: 1010, svg: `<g style="filter:grayscale(1) brightness(1.05)">${r.svg}</g>` });
  A.z4c = r.anchors;
}
add(O.shield, Z4 + 360, 1110, { id: "z4s" });
add(O.beacon, Z4 + 560, 1270, { id: "z4b" });
const ENV0 = G(Z4 + 150, 1250), ENV1 = G(Z4 + 300, 1170), ENV2 = G(Z4 + 190, 1290);
{
  const r = O.envelope(ENV0, { id: "z4e" });
  opush(`<g id="z4e-mv">${r.svg}</g>`);
}
const envD = (P) => { const a = at(ENV0), b = at(P); return [f(b[0] - a[0]), f(b[1] - a[1])]; };

ZONE = 4;
// ---- zone 5 · 事故指挥官: run a revocation drill; withdrawals paused — is the on-chain authorization gone?
const Z5 = PX(4);
add(stopwatch, Z5 + 95, PY + 40, { id: "z5w", z: 125 });
add(O.knifeSwitch, Z5 + 330, 1000, { id: "z5k", text: "提现" });
add(O.hotWallet, Z5 + 560, 1270, { id: "z5h" });
add(O.chain, Z5 + 900, 1090, { id: "z5c", n: 2 });
{
  const a = at(G(Z5 + 560, 1270), 0, 0, 240), b = A.z5c.blocks[0];
  opush(links("z5l", a, [b[0] - 10, b[1] + 6], 8, "#e0453a", `opacity="0"`));
  A.z5l = { mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] };
}

ZONE = -1;
// ------------------------------------------------------------------ labels (world, counter-scaled)
let L = "";
const lab = (id, p, html, cls = "", anchor = "b") => { L += wlab(id, p, html, cls + " hide", anchor); };
const up = (p, d) => [p[0], p[1] - d];
// role labels: normal + active version
ROLES.forEach((r, i) => { lab(`lp${i}`, A[`p${i}`].top, r.name, "lab-g"); lab(`lpa${i}`, A[`p${i}`].top, r.name, "lab-ink"); });
// zone 1
lab("l1-r", A.z1r.top, "签名节点", "lab-cs");
lab("l1-s", A.z1s.top, "策略引擎");
lab("l1-n", up(A.z1a.top, 0), "调用路径 ×3", "lab-sm");
lab("l1-c", [at(G(Z1 + 560, 1350))[0], at(G(Z1 + 560, 1350))[1] + 70], "没经过策略引擎", "lab-rs", "t");
// zone 2
lab("l2-a", A.z2a.top, "网页前端", "lab-g");
lab("l2-b", A.z2b.top, "另一台设备");
lab("l2-ha", [A.z2a.front[0], A.z2a.front[1] + 40], `<span style="font-family:'JetBrains Mono',monospace">${HASH}</span>`, "", "t");
lab("l2-hb", [A.z2b.front[0], A.z2b.front[1] + 40], `<span style="font-family:'JetBrains Mono',monospace">${HASH}</span>`, "", "t");
lab("l2-ok", [(A.z2a.front[0] + A.z2b.front[0]) / 2 + 10, (A.z2a.front[1] + A.z2b.front[1]) / 2 + 190], "一致 ✓", "lab-gs", "t");
lab("l2-src", [(A.z2a.top[0] + A.z2b.top[0]) / 2 + 20, (A.z2a.top[1] + A.z2b.top[1]) / 2 - 90], "不同来源", "lab-cs");
lab("l2-demo", [A.z2b.front[0] + 165, A.z2b.front[1] + 68], "示意", "lab-g lab-sm", "l");
// zone 3
lab("l3-k", [A.z3k.center[0] - 70, A.z3k.center[1] - 175], "生产令牌", "lab-rs", "r");
lab("l3-f", [at(G(LP[2][0], LP[2][1]))[0] + 120, at(G(LP[2][0], LP[2][1]))[1] + 100], "假设这台失陷", "lab-r", "t");
lab("l3-d", up(at(G(SV[1][0], SV[1][1]), 0, 0, 190), 0), "能部署到 3 台生产服务器", "lab-r");
// zone 4
lab("l4-c", A.z4c.top, "测试网", "lab-g");
lab("l4-e", up(at(ENV0), 40), "7702 授权请求");
lab("l4-s", A.z4s.top, "策略拒绝 ✓", "lab-gs");
lab("l4-b", [A.z4b.top[0] + 70, A.z4b.top[1]], "告警响起 ✓", "lab-gs", "l");
// zone 5
lab("l5-w", [A.z5w.right[0] + 10, A.z5w.right[1] + 120], "撤销演练", "lab-cs", "t");
lab("l5-k", A.z5k.top, "暂停提现", "lab-ink");
lab("l5-c", A.z5c.top, "链上");
lab("l5-h", up(A.z5h.top, -10), "热钱包", "lab-sm");
L += wpin("q5", [A.z5l.mid[0] + 90, A.z5l.mid[1] - 280], `<div class="qcard hide" id="q5c"><div class="qmark">?</div><div class="qtxt">暂停提现之后<br>链上授权清掉了吗</div></div>`);
// vault scene
lab("l6-v", A.vault.top, "Bybit 冷钱包 · Safe 多签", "lab-cs");
lab("l6-k", at(vaultO, -175, 120, 190), "钥匙 ✓ 还在", "lab-gs", "r");
lab("l6-m", at(vaultO, -175, 120, 120), "钱 ✗ 被转走", "lab-rs", "r");
lab("l7-d", [A.doc.top[0] + 230, A.doc.top[1] + 60], "文件 ✗ 被换了", "lab-rs", "l");
lab("l7-s", [A.seal.stamp[0] + 70, A.seal.stamp[1] - 10], "公章", "lab-g", "l");
// road
L += ARCH.labels;
lab("l8-p", at(ARCH.P(1300, 0), 0, 300, 0), "签名路径", "lab-cs", "t");
L += wpin("l8-m", [(380 - ARCH.CAM_WIDE.x) / ARCH.CAM_WIDE.scale, (210 - ARCH.CAM_WIDE.y) / ARCH.CAM_WIDE.scale], `<div class="lab lab-g hide" id="l8-mc" style="position:relative">靠某一关特别强<div id="l8-ms" style="position:absolute;left:12px;right:12px;top:50%;height:5px;margin-top:-2px;background:#e0453a;border-radius:3px;transform:scaleX(0);transform-origin:0 50%"></div></div>`, "t");
GATES.forEach((Ly, k) => { L += wpin(`ck${k}`, up(A[`mg${k}`].top, 10), `<div class="hide" id="ck${k}c">${CHECK(`ck${k}i`, 46)}</div>`, "b"); });

// ------------------------------------------------------------------ cameras
const fit = (P, x0, y0, x1, y1) => {
  const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  const k = Math.min((x1 - x0) / (bx1 - bx0), (y1 - y0) / (by1 - by0));
  return camAt([(bx0 + bx1) / 2, (by0 + by1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};
const C0 = ARCH.CAM_WIDE; // = seg5a 最后一帧的镜头
const CW = camAt([LX(2), LY - 270], 960, 520, 0.95); // 推到五人一排，架构在上方作背景
const CZ = (i, dx = 430) => camAt([PX(i) + dx, 1150], 960, 545, 0.92);
const vC = at(vaultO), sC = at(sealO);
const CV = camAt([(vC[0] + sC[0]) / 2 + 40, (vC[1] + sC[1]) / 2 - 120], 960, 520, 0.92);
const CR = ARCH.CAM_WIDE;
const CV2 = camAt([at(vaultO)[0] + 198, at(vaultO)[1] - 48], 960, 505, 1.12);
const CAMS = { CV2, C0, CW, Z1: CZ(0, 470), Z2: CZ(1, 470), Z3: camAt([PX(2) + 440, 1085], 960, 545, 0.92), Z4: CZ(3, 480), Z5: CZ(4, 500), CV, CR };

// ------------------------------------------------------------------ assemble
const srt = (arr) => arr.slice().sort((a, b) => a.Y - b.Y).map((b) => b.svg).join("\n");
const objSvg = srt(items) + overlay.join("") + ZG.map((z, i) => `<g id="zone${i}">${z.ground.join("")}${srt(z.items)}${z.top.join("")}</g>`).join("");
const world = worldSvg("wsvg", gridSvg({ u0: -4000, u1: 9000, v0: -4000, v1: 8000 }) + ground.join("") + objSvg, [-2000, -2600, 10000, 5400]);

const D = (o) => JSON.stringify(o);
const GROW = [
  // [id, t]
  ...ROLES.map((_, i) => [`p${i}`, 2.55 + i * 0.13]),
  ["z1a", 6.35], ["z1b", 6.47], ["z1c", 6.59], ["z1s", 6.75], ["z1r", 6.9],
  ["z2a", 13.6], ["z2b", 14.65],
  ["z3l0", 20.75], ["z3l1", 20.87], ["z3l2", 20.99], ["z3s0", 25.35], ["z3s1", 25.47], ["z3s2", 25.59],
  ["z4c", 28.85], ["z4s", 29.0], ["z4b", 29.15], ["z4e", 29.95],
  ["z5w", 35.95], ["z5k", 36.1], ["z5h", 36.25], ["z5c", 36.4],
  ...GATES.map((_, k) => [`mg${k}`, 57.75 + k * 0.2]),
];
const GROW_IDS = GROW.map((g) => g[0]);

const html = `<template>
  <style>
${kitCss()}
${ARCH.css}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #sec { position: absolute; left: 56px; top: 32px; }
    .qcard { display: flex; align-items: center; gap: 22px; background: #fffdf8; border: 3px solid #e0453a; border-radius: 18px; padding: 18px 30px 20px 22px;
      box-shadow: 0 14px 30px rgba(70, 60, 40, 0.14); white-space: nowrap; }
    .qmark { width: 70px; height: 70px; border-radius: 50%; background: #e0453a; color: #fff; font-size: 52px; font-weight: 900; line-height: 70px; text-align: center; flex: none; }
    .qtxt { font-size: 36px; font-weight: 900; line-height: 1.3; color: #1c1c1c; }
    #veil { position: absolute; inset: 0; background: #efebe3; opacity: 0; }
    #endcard { position: absolute; left: 190px; top: 250px; width: 1540px; background: #fffdf8; border-radius: 28px; box-shadow: 0 18px 40px rgba(70, 60, 40, 0.14);
      text-align: center; padding: 56px 40px 54px; opacity: 0; }
    #endcard .e-ch { font-size: 44px; font-weight: 900; color: #1d93ba; white-space: nowrap; }
    #endcard .e-main { margin-top: 18px; font-size: 76px; font-weight: 900; line-height: 1.15; white-space: nowrap; color: #1c1c1c; }
    #endcard .e-rule { width: 120px; height: 6px; border-radius: 3px; background: #2aa3c9; margin: 34px auto 30px; }
    #endcard .e-note { font-size: 38px; font-weight: 700; color: #6d685e; white-space: nowrap; }
    #endcard .e-next { margin-top: 30px; font-size: 36px; font-weight: 900; color: #1d93ba; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${L}</div>
      </div>
      <div id="sec"><div class="lab lab-ink hide" id="sec-l">怎么守 · 你今天能做什么</div></div>
      ${termCards(TERMS)}${pills(5)}
      <div id="veil"></div>
      <div id="endcard" data-layout-allow-overlap>
        <div class="e-ch">签名路径</div>
        <div class="e-main">攻击者不再偷私钥，而是控制签名路径</div>
        <div class="e-rule"></div>
        <div class="e-note" id="e-note">六起事件，一条路径，每一关都要重新检查</div>
        <div class="e-next" id="e-next">下一集 · 企业链的安全</div>
      </div>
    </div>
  </div>
  <script>
${runtimeJs()}
  (function () {
    const C = ${D(CAMS)};
    const MV = ${D(MOVE)};
    const GL = ${D(GATES.map((g) => g.glow))};
    const tl = gsap.timeline({ paused: true });
    const pop = (sel, t) => KIT.pop(tl, sel, t);
    const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.25, ease: "power2.in" }, t);
    const grow = (id, t) => KIT.grow(tl, id, t);
    // hidden-at-start objects (grow later)
    ${D(GROW_IDS)}.forEach(function (id) {
      const g = document.getElementById(id);
      tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0);
    });
    ${D(GROW)}.forEach(function (g) { grow(g[0], g[1]); });
    KIT.camSet(tl, C.C0);
    ${ARCH.initJs}

    // ---------------- L0 · 按角色（0–5.75）
    pop("#sec-l", 0.25);
    KIT.cam(tl, 1.65, C.CW, 1.15);
    out("#lb-fs1,#lb-fs2,#lb-fs3,#lb-swo0,#lb-swo1,#lb-swo2,#lb-coll", 1.65, 0.3);
    ${D(ROLES.map((_, i) => i))}.forEach(function (i) { pop("#lp" + i, 3.45 + i * 0.1); });

    // ---------------- L1 · 签名工程师（5.97–13.12）
    KIT.cam(tl, 5.55, C.Z1, 1.1);
    tl.to("#p0, #lp0-pin, #lpa0-pin", { x: MV[0][0], y: MV[0][1], duration: 1.1, ease: "power2.inOut" }, 5.55);
    out("#sec-l", 5.6, 0.3);
    tl.to("#lp0", { opacity: 0, duration: 0.15 }, 6.05); pop("#lpa0", 6.05);
    pop("#l1-s", 7.0); pop("#l1-r", 8.5);
    [["#z1-pa", 7.35], ["#z1-pb", 7.75], ["#z1-pc", 8.15]].forEach(function (p) {
      tl.fromTo(p[0], { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.6, ease: "power2.inOut", immediateRender: false }, p[1]);
    });
    pop("#l1-n", 9.3);
    tl.fromTo("#z1-pcr", { attr: { "stroke-dashoffset": 1 }, opacity: 1 }, { attr: { "stroke-dashoffset": 0 }, opacity: 1, duration: 0.55, ease: "power2.inOut", immediateRender: false }, 10.3);
    tl.fromTo("#z1-ring", { opacity: 0, scale: 0.85, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.4)", immediateRender: false }, 11.15);
    pop("#l1-c", 11.4);

    // ---------------- L2 · 多签签名人（13.34–20.21）
    KIT.cam(tl, 12.85, C.Z2, 1.1);
    tl.to("#p1, #lp1-pin, #lpa1-pin", { x: MV[1][0], y: MV[1][1], duration: 1.1, ease: "power2.inOut" }, 12.85);
    out("#lpa0", 12.85, 0.2); out("#l1-s,#l1-r,#l1-n,#l1-c", 12.85, 0.3);
    pop("#lp0", 13.1);
    tl.to("#lp1", { opacity: 0, duration: 0.15 }, 13.45); pop("#lpa1", 13.45);
    pop("#l2-a", 14.0); pop("#l2-b", 15.05);
    KIT.swap(tl, "#z2b-scr", "#z2b-scr2", 16.25, 0.3);
    pop("#l2-ha", 16.95); pop("#l2-hb", 17.15); pop("#l2-demo", 17.3);
    pop("#l2-ok", 17.6);
    pop("#l2-src", 18.6);

    // ---------------- L3 · 运维（20.43–27.27）
    KIT.cam(tl, 19.9, C.Z3, 1.1);
    tl.to("#p2, #lp2-pin, #lpa2-pin", { x: MV[2][0], y: MV[2][1], duration: 1.1, ease: "power2.inOut" }, 19.9);
    out("#lpa1", 19.9, 0.2); out("#l2-a,#l2-b,#l2-ha,#l2-hb,#l2-ok,#l2-src,#l2-demo", 19.9, 0.3);
    pop("#lp1", 20.15);
    tl.to("#lp2", { opacity: 0, duration: 0.15 }, 20.5); pop("#lpa2", 20.5);
    // scan: magnifier hovers over each dev laptop
    const M = ${D(LP.map((p) => { const a = at(G(LP[0][0], LP[0][1])), b = at(G(p[0], p[1])); return [f(b[0] - a[0]), f(b[1] - a[1])]; }))};
    tl.fromTo("#z3m", { opacity: 0 }, { opacity: 1, duration: 0.25, immediateRender: false }, 21.35);
    tl.set("#z3m", { opacity: 0 }, 0);
    tl.to("#z3m", { x: M[1][0], y: M[1][1], duration: 0.5, ease: "power2.inOut" }, 21.75);
    tl.to("#z3m", { x: M[2][0], y: M[2][1], duration: 0.5, ease: "power2.inOut" }, 22.3);
    tl.fromTo("#z3k-mv", { opacity: 0, y: 40 }, { opacity: 1, y: -200, duration: 0.55, ease: "power3.out", immediateRender: false }, 22.75);
    tl.fromTo("#z3-ring", { opacity: 0, scale: 0.85, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.4)", immediateRender: false }, 23.05);
    pop("#l3-k", 23.15);
    out("#lp3", 22.9, 0.2);
    out("#z3m", 23.6, 0.3);
    KIT.swap(tl, "#z3l2-scr", "#z3l2-scr2", 24.45, 0.3);
    pop("#l3-f", 24.55);
    [0, 1, 2].forEach(function (i) { KIT.draw(tl, "z3c" + i, 25.65 + i * 0.15, 0.55); KIT.led(tl, "z3s" + i + "-led-0", 26.1 + i * 0.15, "red"); });
    pop("#l3-d", 26.35);

    // ---------------- L4 · 安全工程师（27.49–35.17）
    KIT.cam(tl, 26.95, C.Z4, 1.1);
    tl.to("#p3, #lp3-pin, #lpa3-pin", { x: MV[3][0], y: MV[3][1], duration: 1.1, ease: "power2.inOut" }, 26.95);
    out("#lpa2", 26.95, 0.2); out("#l3-k,#l3-f,#l3-d", 26.95, 0.3);
    pop("#lp2", 27.2);
    tl.to("#lp3", { opacity: 0, duration: 0.15 }, 27.6); pop("#lpa3", 27.6);
    pop("#l4-c", 29.3);
    pop("#l4-e", 30.25);
    const E1 = ${D(envD(ENV1))}, E2 = ${D(envD(ENV2))};
    tl.to("#z4e-mv", { x: E1[0], duration: 0.7, ease: "power1.inOut" }, 31.0);
    tl.to("#z4e-mv", { y: E1[1] - 120, duration: 0.35, ease: "power2.out" }, 31.0);
    tl.to("#z4e-mv", { y: E1[1] - 60, duration: 0.35, ease: "power2.in" }, 31.35);
    tl.to("#z4e-mv", { x: E2[0], duration: 0.45, ease: "power2.out" }, 31.7);
    tl.to("#z4e-mv", { y: E2[1], duration: 0.45, ease: "bounce.out" }, 31.7);
    tl.fromTo("#z4e-x", { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.6)", immediateRender: false }, 32.15);
    pop("#l4-s", 32.55);
    KIT.beacon(tl, "z4b", 33.4, 1.5, 0.75);
    pop("#l4-b", 33.85);

    // ---------------- L5 · 事故指挥官（35.39–43.12）
    KIT.cam(tl, 34.95, C.Z5, 1.1);
    tl.to("#p4, #lp4-pin, #lpa4-pin", { x: MV[4][0], y: MV[4][1], duration: 1.1, ease: "power2.inOut" }, 34.95);
    out("#lpa3", 34.95, 0.2); out("#l4-c,#l4-e,#l4-s,#l4-b", 34.95, 0.3);
    pop("#lp3", 35.2);
    tl.to("#lp4", { opacity: 0, duration: 0.15 }, 35.5); pop("#lpa4", 35.5);
    tl.fromTo("#z5l", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 36.6);
    pop("#l5-h", 36.7); pop("#l5-c", 36.8);
    pop("#l5-w", 37.55);
    KIT.rot(tl, "z5w-hand", 37.6, 300, 4.7, "none");
    KIT.toggle(tl, "z5k", 38.7, false, 0.5);
    pop("#l5-k", 39.1);
    pop("#q5c", 40.55);

    // ---------------- L6–L7 · 回到开头：保险柜 + 公章（43.62–54.03）
    KIT.cam(tl, 43.25, C.CV, 1.2);
    out("#lpa4,#l5-w,#l5-k,#l5-c,#l5-h,#q5c", 43.25, 0.3);
    pop("#l6-v", 44.35);
    KIT.door(tl, "vault", 44.7, 105, 1.0);
    tl.fromTo("#vkey-wrap", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 45.35);
    pop("#l6-k", 45.75);
    tl.to("#vault-gold", { opacity: 0, duration: 0.5, ease: "power1.inOut" }, 46.75);
    pop("#l6-m", 47.1);
    pop("#l7-s", 49.1);
    tl.to("#zone0,#zone1,#zone2,#zone3,#zone4", { opacity: 0, duration: 0.3 }, 44.4);
    out("#lp0,#lp1,#lp2,#lp3,#lp4", 44.4, 0.2);
    KIT.cam(tl, 50.0, C.CV2, 1.0);
    // the document under the seal is swapped
    tl.to("#docN-mv", { x: -260, y: 90, opacity: 0, duration: 0.5, ease: "power2.in" }, 51.2);
    tl.fromTo("#docR-mv", { x: 260, y: -90, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.6, ease: "power3.out", immediateRender: false }, 51.5);
    KIT.stamp(tl, "seal", 52.15);
    pop("#l7-d", 52.75);

    // ---------------- L8 · 每一关都重新检查（54.25–60.25）
    KIT.cam(tl, 53.95, C.CR, 1.2);
    out("#l6-v,#l6-k,#l6-m,#l7-d,#l7-s", 53.95, 0.3);
    pop("#l8-mc", 55.95);
    tl.fromTo("#l8-ms", { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power2.out", immediateRender: false }, 56.75);
    tl.to("#l8-mc", { opacity: 0.4, duration: 0.3 }, 57.2);
    out("#l8-mc", 57.6, 0.25);
    tl.fromTo("#road-ol", { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: 1.0, ease: "power2.inOut", immediateRender: false }, 54.7);
    pop("#l8-p", 55.3);
    ${D(GATES.map((_, k) => k))}.forEach(function (k) {
      GL[k].forEach(function (id) { tl.fromTo("#" + id + "-glow", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 58.0 + k * 0.2); });
      pop("#ck" + k + "c", 58.05 + k * 0.2);
    });

    // ---------------- L9 · 结束卡（60.47–67.64）
    tl.to("#veil", { opacity: 0.72, duration: 0.45, ease: "power1.inOut" }, 60.5);
    out("#l8-p", 60.5, 0.3);
    tl.fromTo("#endcard", { opacity: 0, scale: 0.94, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, 60.6);
    tl.fromTo("#e-note", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 61.35);
    tl.fromTo("#e-next", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 62.0);
    tl.set({}, {}, ${TOTAL});
    ${termJs(TERMS)}
    window.__timelines["story"] = tl;
  })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "total", TOTAL);
