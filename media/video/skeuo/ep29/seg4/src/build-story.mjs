// seg4「④ 三个共同点」— builds compositions/story.html
// Run: node src/build-story.mjs
// World layout follows seg3b (gates 480 apart along +u, flags behind the road, RPC branch behind ⑤).
import fs from "node:fs";
import {
  at, f, Wp, CE, U, V, M, C, mat, darken, lighten, camAt, toScreen, worldSvg, gridSvg, wlab, wpin, BADGE, CHECK,
  box, rbox, cyl, sphere, flat, line3, faceV, faceTop, frameV, frameTop, matStr, applyM, contactShadow, glow,
  kitCss, runtimeJs,
} from "../../kit/iso.mjs";
import * as O from "../../kit/objects.mjs";
import { pills } from "../../kit/pills.mjs";

const timing = JSON.parse(fs.readFileSync(new URL("../timing.json", import.meta.url), "utf8"));
const TOTAL = timing.total;

// ------------------------------------------------------------------ helpers
const P = (u, v) => ({ u, v });
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const wrap = (id, o, s, extra = "") => { const [ox, oy] = at(o); return `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}" ${extra}>${s}</g>`; };
const FONT = `font-family="Noto Sans SC, sans-serif"`;
const T = (x, y, s, size, o = {}) => `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="${o.w ?? 900}" fill="${o.fill ?? C.ink}" text-anchor="${o.a ?? "middle"}" ${o.extra ?? ""}>${s}</text>`;
/** scale an object's svg about its ground point gp by s; returns transform fn for anchors */
const scaleAbout = (gp, s) => ({
  open: `<g transform="translate(${f(gp[0])} ${f(gp[1])}) scale(${s}) translate(${f(-gp[0])} ${f(-gp[1])})">`,
  p: (q) => [gp[0] + s * (q[0] - gp[0]), gp[1] + s * (q[1] - gp[1])],
});
/** fit camera: world-canvas points into screen rect [x0,y0,x1,y1] */
function camFit(pts, rect, kMax = 3) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const X0 = Math.min(...xs), X1 = Math.max(...xs), Y0 = Math.min(...ys), Y1 = Math.max(...ys);
  const k = Math.min(kMax, (rect[2] - rect[0]) / (X1 - X0), (rect[3] - rect[1]) / (Y1 - Y0));
  return camAt([(X0 + X1) / 2, (Y0 + Y1) / 2], (rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2, Math.round(k * 1000) / 1000);
}

// ------------------------------------------------------------------ world layout (= seg3b)
const SP = 480;
const GU = (i) => (i - 1) * SP;
const GN = ["①", "②", "③", "④", "⑤", "⑥", "⑦"];
const GNAME = ["业务意图", "请求构造", "风控与审批", "显示与解码", "签名", "广播", "链上状态"];
const RED_PLATES = [2, 4, 5, 7];
const gates = [];
for (let i = 1; i <= 7; i++) gates.push({ i, o: P(GU(i), 0), r: O.checkpoint(P(GU(i), 0), { id: "g" + i, n: GN[i - 1], road: false }) });
const BR_U = GU(5) - 140;
const rpcO = P(BR_U, -660), rpcR = O.rpc(rpcO, { id: "rpc" });
const srcAO = P(GU(5) - 170, 470), srcAR = O.rpc(srcAO, { id: "srcA" });
const rpc2O = P(GU(5) + 90, 520), rpc2R = O.rpc(rpc2O, { id: "rpc2" });
const towerO = P(GU(6) + 20, -470), towerR = O.tower(towerO, { id: "tower" });
const chainO = P(GU(7) + 600, 30), chainR = O.chain(chainO, { id: "ch", n: 4, labels: ["#1", "#2", "#3", "#4"] });
const b4 = { u: chainO.u + 270, v: chainO.v };
// off-chain controls & hot wallet (= seg3b)
const swO = P(2520, 600), hwsO = P(2800, 640), hwO = P(3380, 860);
const swR = O.knifeSwitch(swO, { id: "sw", text: "提现", lampOff: "#3c3f45" });
const hwsR = O.rack(hwsO, { id: "hws", tag: "HOT-SVC" });
const hwR = O.hotWallet(hwO, { id: "hw", plate: "ETH 热钱包", open: 105, core: "attacker" });
const DIV_U = 3080;
// beacon for principle ② (gate ⑤ refuses)
const bcnO = P(GU(5) - 120, 130), bcnR = O.beacon(bcnO, { id: "bcn" });

// ------------------------------------------------------------------ custom objects
/** red event flag (= seg3b) */
function flag(o, id) {
  let s = contactShadow(o, 34, 22) + cyl(o, 0, 0, 16, 0, 7, M.plinth, { seg: 18, sw: 1.2 }) + cyl(o, 0, 0, 4.5, 7, 210, M.ink, { seg: 10, sw: 1 });
  s += sphere(id + "-k", o, 0, 0, 214, 7, M.chrome, 1.2);
  s += G_(faceV(o, 4, 0, 206), `<path d="M0 0L96 26L0 52Z" fill="#e0453a" stroke="#a8322a" stroke-width="2.4" stroke-linejoin="round"/><path d="M0 0L96 26L0 26Z" fill="#ffffff" opacity="0.18"/>`);
  return { svg: wrap(id, o, s), top: at(o, 40, 0, 218) };
}
const FL = [
  ["f-bitget", P(GU(2) + 110, -150), "Bitget"],
  ["f-wazirx", P(GU(4) + 110, -150), "WazirX"],
  ["f-bybit", P(GU(4) + 230, -340), "Bybit"],
  ["f-drift", P(GU(5) + 110, -150), "Drift"],
  ["f-kelp", P(BR_U + 120, -640), "KelpDAO"],
  ["f-bn5", P(GU(5) + 240, -340), "Binance"],
  ["f-bn7", P(GU(7) + 110, -150), "Binance"],
];
const flags = FL.map(([id, o, label]) => ({ id, o, label, r: flag(o, id) }));

/** roof signboard on a checkpoint: two legs on the booth roof, a 680×340 board in the v=-146 plane, flips (flap) front → back */
const BW = 680, BH = 340, BZ0 = 350, BZ1 = BZ0 + BH, BV = -146;
function signboard(o, id, front, back) {
  let s = "";
  // legs from the roof
  for (const du of [-62, 54]) s += box(o, du, du + 8, BV - 10, BV - 2, 190, BZ0 + 30, M.dark, 1.2);
  // back slab (seen when the face flips)
  s += box(o, -BW / 2, BW / 2, BV - 12, BV - 4, BZ0, BZ1, mat("#b9b1a2", { st: "#6d685e" }), 1.6);
  const face = (head, headFill, body) => `<rect x="5" y="9" width="${BW}" height="${BH}" rx="18" fill="#cfc7b8"/>
    <rect x="0" y="0" width="${BW}" height="${BH}" rx="18" fill="#fffdf8" stroke="#1c1c1c" stroke-width="5"/>
    <path d="M18 0H${BW - 18}A18 18 0 0 1 ${BW} 18V86H0V18A18 18 0 0 1 18 0Z" fill="${headFill}"/>
    <rect x="0" y="0" width="${BW}" height="${BH}" rx="18" fill="none" stroke="#1c1c1c" stroke-width="5"/>
    ${T(30, 64, head, 58, { a: "start", fill: "#ffffff" })}
    <circle cx="${BW - 40}" cy="43" r="9" fill="#ffffff" opacity="0.85"/><circle cx="${BW - 70}" cy="43" r="9" fill="#ffffff" opacity="0.5"/>${body}`;
  const m = faceV(o, -BW / 2, BV, BZ1);
  s += `<g transform="${m}"><g id="${id}-f">${face(front.head, "#1d93ba", front.body)}</g><g id="${id}-b" opacity="0">${face(back.head, "#1f9d55", back.body)}</g></g>`;
  const mm = frameV(o, -BW / 2, BV, BZ1);
  return { svg: wrap(id, o, s), center: applyM(mm, BW / 2, BH / 2), top: applyM(mm, BW / 2, 0), bottom: applyM(mm, BW / 2, BH), corners: [applyM(mm, 0, 0), applyM(mm, BW, 0), applyM(mm, 0, BH), applyM(mm, BW, BH)], m: mm };
}
const SIGNS = [
  { gate: 2, id: "sg1",
    front: { head: "共同点一", body: T(BW / 2, 236, "校验放错位置", 92) },
    back: { head: "原则一", body: T(BW / 2, 186, "每层重新检查", 80) + `<g id="sg1-l2">${T(BW / 2, 290, "不继承上层结论", 70)}</g>` } },
  { gate: 4, id: "sg2",
    front: { head: "共同点二", body: T(BW / 2, 240, "单一来源", 104) },
    back: { head: "原则二", body: T(BW / 2, 186, "多个独立来源", 80) + `<g id="sg2-l2">${T(BW / 2, 290, "对不上就拒签", 70)}</g>` } },
  { gate: 7, id: "sg3",
    front: { head: "共同点三", body: T(BW / 2, 236, "响应只管链下", 92) },
    back: { head: "原则三", body: T(BW / 2, 186, "响应覆盖链上", 80) +
      `<g id="sg3-l2"><text x="${BW / 2}" y="292" ${FONT} font-weight="900" text-anchor="middle" fill="${C.ink}"><tspan font-size="64">暂停提现</tspan><tspan id="sg3-ne" font-size="104" fill="#e0453a" dx="6" dy="8">≠</tspan><tspan font-size="64" dx="6" dy="-8">撤销权限</tspan></text></g>` } },
];
const signs = SIGNS.map((s) => ({ ...s, o: P(GU(s.gate), 0), r: signboard(P(GU(s.gate), 0), s.id, s.front, s.back) }));

/** red delegation chain (hot wallet → red block) */
function delegation(A, B, n, id) {
  let s = "";
  for (let i = 0; i <= n; i++) {
    const t = i / n, c = { u: A[0] + (B[0] - A[0]) * t, v: A[1] + (B[1] - A[1]) * t }, z = A[2] + (B[2] - A[2]) * t;
    const ring = `<ellipse cx="0" cy="0" rx="24" ry="11" fill="none" stroke="#a8322a" stroke-width="9"/><ellipse cx="0" cy="0" rx="24" ry="11" fill="none" stroke="#f08a80" stroke-width="3.5"/>`;
    s += `<g id="${id}-${i}">${i % 2 ? G_(faceTop(c, 0, 0, z), ring) : G_(`${matStr(frameV(c, 0, 0, z))} rotate(${f(-33)})`, ring)}</g>`;
  }
  return s;
}
const DLA = [hwO.u + 30, hwO.v - 100, 170], DLB = [b4.u - 20, b4.v + 70, 60];
const dlMid = Wp((DLA[0] + DLB[0]) / 2, (DLA[1] + DLB[1]) / 2, (DLA[2] + DLB[2]) / 2);
const delegSvg = `<g id="dlg">${delegation(DLA, DLB, 9, "dl")}</g>`;
const redBlock = `<g id="blkR">${rbox(b4, -50, 50, -50, 50, 0, 100, 10, M.red, { sw: 2 })}${G_(faceV(b4, -40, 50, 90), `<rect x="0" y="0" width="80" height="24" rx="4" fill="#ffffff"/><text x="40" y="18" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="16" font-weight="800" fill="#a8322a">7702</text><rect x="4" y="36" width="62" height="6" rx="3" fill="#ffffff" opacity="0.7"/><rect x="4" y="50" width="48" height="6" rx="3" fill="#ffffff" opacity="0.7"/>`)}</g>`;

// ---- L0 red envelopes passing through flagged gates
const ENVS = [
  { id: "e2", end: P(GU(2) + 170, 70), d: [-330, 0] },
  { id: "e4", end: P(GU(4) + 170, 70), d: [-330, 0] },
  { id: "e5", end: P(GU(5) + 170, 70), d: [-330, 0] },
  { id: "eb", end: P(BR_U, -180), d: [0, -380] },
  { id: "e7", end: P(GU(7) + 200, 70), d: [-360, 0] },
];
for (const e of ENVS) {
  const a = Wp(e.end.u, e.end.v), b = Wp(e.end.u + e.d[0], e.end.v + e.d[1]);
  e.off = [f(b[0] - a[0]), f(b[1] - a[1])];
  e.r = O.envelope(e.end, { id: e.id + "-o", state: "attacker", w: 150, h: 100 });
}

// ---- L2 vignette at gate ②: counter + standing envelope + rulers + hidden red doc + inspector
const v2O = P(GU(2) + 20, 520);
const deskM = { f: "#e9d9c2", s: "#d3bea0", t: "#f4e7d4", st: "#9a8466" };
const EVW = 400, EVH = 260, EVZ0 = 96, EVZ1 = EVZ0 + EVH;
const counterSvg = wrap("ctr", v2O, contactShadow(v2O, 280, 110) + box(v2O, -240, 240, -64, 64, 0, EVZ0, deskM, 1.8) +
  G_(faceV(v2O, -240, 64, EVZ0), `<rect x="0" y="14" width="480" height="8" fill="${darken(deskM.s, 0.08)}"/>`));
const docLocal = `<path d="M0 0H264L300 36V250H0Z" fill="#fff6f4" stroke="#e0453a" stroke-width="4" stroke-linejoin="round"/><path d="M264 0V36H300Z" fill="#f4d6d2" stroke="#e0453a" stroke-width="3" stroke-linejoin="round"/>
  ${T(24, 58, "提现单", 44, { a: "start" })}<rect x="24" y="72" width="252" height="4" fill="#1c1c1c"/>
  ${T(24, 128, "对应业务：无", 40, { a: "start", fill: "#c3352b" })}
  <rect x="24" y="160" width="220" height="12" rx="6" fill="#efd3cf"/><rect x="24" y="190" width="170" height="12" rx="6" fill="#efd3cf"/>`;
const doc2 = `<g id="v2doc" opacity="0"><g transform="${faceV(v2O, -150, 6, EVZ1 - 12)}"><g id="v2doc-in">${docLocal}</g></g></g>`;
const envLocal = `<rect x="6" y="10" width="${EVW}" height="${EVH}" rx="12" fill="#d8d1c4"/>
  <rect x="0" y="0" width="${EVW}" height="${EVH}" rx="12" fill="#ffffff" stroke="#6b665c" stroke-width="5"/>
  <path d="M6 8L${EVW / 2} ${EVH * 0.56}L${EVW - 6} 8" fill="none" stroke="#6b665c" stroke-width="5" stroke-linejoin="round"/>
  <path d="M6 ${EVH - 6}L${EVW * 0.36} ${EVH * 0.46}M${EVW - 6} ${EVH - 6}L${EVW * 0.64} ${EVH * 0.46}" stroke="#c9c2b5" stroke-width="3"/>
  <rect x="${EVW - 92}" y="22" width="66" height="78" rx="4" fill="#d9eff6" stroke="#2aa3c9" stroke-width="3" stroke-dasharray="6 4"/>
  ${T(EVW / 2, EVH - 34, "提现请求", 42)}`;
const env2 = `<g id="v2env" opacity="0"><g id="v2env-in">${G_(faceV(v2O, -EVW / 2, 12, EVZ1), envLocal)}</g></g>`;
let rulerH = `<rect x="-14" y="-52" width="${EVW + 28}" height="40" rx="5" fill="#e4e7ea" stroke="#5a5e65" stroke-width="2.5"/><rect x="-14" y="-52" width="${EVW + 28}" height="8" rx="4" fill="#ffffff" opacity="0.7"/>`;
for (let x = 0; x <= EVW; x += 20) rulerH += `<path d="M${x} -12V${x % 100 ? -24 : -34}" stroke="#2b2d31" stroke-width="2.4"/>`;
let rulerV = `<rect x="${EVW + 12}" y="-14" width="40" height="${EVH + 28}" rx="5" fill="#e4e7ea" stroke="#5a5e65" stroke-width="2.5"/>`;
for (let y = 0; y <= EVH; y += 20) rulerV += `<path d="M${EVW + 12} ${y}H${EVW + 12 + (y % 100 ? 12 : 22)}" stroke="#2b2d31" stroke-width="2.4"/>`;
const rulers = `<g transform="${faceV(v2O, -EVW / 2, 18, EVZ1)}"><g id="v2rh" opacity="0">${rulerH}</g><g id="v2rv" opacity="0">${rulerV}</g></g>`;
const v2M = frameV(v2O, -EVW / 2, 12, EVZ1);
const inspO = P(v2O.u - 480, v2O.v - 70);
const inspR = O.person(inspO, { id: "insp", role: "engineer", scale: 1.6 });
const V2S = 1.35, SC2 = scaleAbout(Wp(v2O.u, v2O.v), V2S);

// ---- L3 vignette at gate ④: four single-thread inputs
const v3V = 500, ROAD_EDGE = 214;
const v3 = [
  { id: "i3a", u: GU(4) - 430, lab: "屏幕 ×1" },
  { id: "i3b", u: GU(4) - 150, lab: "RPC ×1" },
  { id: "i3c", u: GU(4) + 130, lab: "发布包 ×1" },
  { id: "i3d", u: GU(4) + 400, lab: "审批 ×1" },
];
function pkg(o, id) {
  const m = mat("#c99a5b", { st: "#7a5728" });
  let s = contactShadow(o, 110, 80) + box(o, -70, 70, -55, 55, 0, 110, m, 1.8);
  s += G_(faceTop(o, -70, -12, 110), `<rect x="0" y="0" width="140" height="24" fill="#e8d3a8" opacity="0.9"/>`);
  s += G_(faceV(o, -70, 55, 110), `<rect x="0" y="0" width="140" height="18" fill="#e8d3a8" opacity="0.8"/><rect x="18" y="38" width="104" height="46" rx="4" fill="#ffffff" stroke="#7a5728" stroke-width="2"/>
    <text x="70" y="70" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="24" font-weight="800" fill="#1c1c1c">v1.0</text>`);
  return { svg: wrap(id, o, s), top: at(o, 0, 0, 190) };
}
v3[0].r = O.laptop(P(v3[0].u, v3V), { id: "i3a" });
v3[1].r = O.rpc(P(v3[1].u, v3V), { id: "i3b" });
v3[2].r = pkg(P(v3[2].u, v3V), "i3c");
v3[3].r = O.person(P(v3[3].u, v3V), { id: "i3d", role: "signer", scale: 1.0 });
const threadSvg = v3.map((it) => {
  const o = P(it.u, 0), vA = v3V - 100, vM = (vA + ROAD_EDGE) / 2;
  const plug = box(o, -12, 12, ROAD_EDGE - 10, ROAD_EDGE + 10, 0, 14, M.ink, 1.2);
  return `<g id="${it.id}-th" opacity="0">${plug}<g id="${it.id}-tA">${line3(o, [[0, vA, 3], [0, vM + 6, 3]], "#1d93ba", 5)}</g><g id="${it.id}-tB">${line3(o, [[0, vM - 6, 3], [0, ROAD_EDGE + 8, 3]], "#1d93ba", 5)}</g></g>`;
}).join("");
const cutPts = v3.map((it) => Wp(it.u, (v3V - 100 + ROAD_EDGE) / 2, 3));

// ---- L5/L6 plaza: key in the safe, seal about to stamp, doc swapped by a red glove
const safeO = P(1300, 3300);
const safeR = O.safe(safeO, { id: "cs", plate: "COLD", gold: false });
// key hanging inside the safe (injected into the cavity group so the door covers it while closed)
const keyLocal = (() => {
  const K = { f: "#d6a64a", s: "#b58630", t: "#ecc778", st: "#7a5716" };
  const shape = (fill) => `<circle cx="0" cy="0" r="26" fill="${fill}" stroke="${K.st}" stroke-width="2.5"/><circle cx="0" cy="-4" r="9" fill="#2a2c31" stroke="${K.st}" stroke-width="2"/>
    <path d="M-7 22V118H7V108H18V98H7V90H16V80H7V22Z" fill="${fill}" stroke="${K.st}" stroke-width="2.4" stroke-linejoin="round"/>`;
  return `<g transform="translate(4,5)">${shape(K.s)}</g>${shape(K.f)}<path d="M-16 -16A22 22 0 0 1 10 -22" fill="none" stroke="${K.t}" stroke-width="4" stroke-linecap="round"/>`;
})();
{
  // cavity back wall is at v = -120 + 26 = -94; hang the key from a hook near the top of the opening
  const hookM = frameV(safeO, 10, 40, 282);
  const keyG = `<g id="cs-key">${G_(matStr(hookM), `<rect x="-10" y="-4" width="20" height="10" rx="3" fill="#c9cdd2" stroke="#4b4f56" stroke-width="1.5"/><path d="M0 4V22" stroke="#4b4f56" stroke-width="4"/>
    <g transform="translate(0,40) scale(0.86)">${keyLocal}</g>`)}</g>`;
  const tag = `<g id="${"cs"}-cav" clip-path="url(#cs-cav-c)">`;
  const i0 = safeR.svg.indexOf(tag), i1 = safeR.svg.indexOf("</g>", i0);
  safeR.svg = safeR.svg.slice(0, i1) + keyG + safeR.svg.slice(i1);
}
const SAFE_S = 1.45, SCS = scaleAbout(Wp(safeO.u, safeO.v), SAFE_S);
const keyPt = SCS.p(applyM(frameV(safeO, 10, 40, 282), 0, 80));
// seal group (scaled about its ground point)
const SEAL_S = 1.85;
const sealO = P(1300 + 690, 3300 + 480);
const sealGP = Wp(sealO.u, sealO.v);
const SC = scaleAbout(sealGP, SEAL_S);
const sealR = O.seal(sealO, { id: "sl", paper: false, stamped: false, text: "签名专用章", markText: "核准" });
const docO = P(sealO.u - 36, sealO.v + 8);
const docN = O.doc(docO, { id: "dn", title: "提现单" });
const docA = O.doc(docO, { id: "da", title: "提现单", state: "attacker", lines: ["收款 攻击者", "金额 全部"] });
// glove (2D, world px, fingertips at its local origin pointing −x)
const glove = `<g id="glv-in"><path d="M150 -30L238 -50L250 4L162 26Z" fill="#a8322a" stroke="#6a1a15" stroke-width="3" stroke-linejoin="round"/>
  <path d="M168 -26L176 20M186 -30L194 16M204 -34L212 12M222 -38L230 8" stroke="#c94a40" stroke-width="3"/>
  <path d="M152 -30C120 -40 84 -40 60 -34L10 -40C-4 -41 -6 -24 8 -22L52 -16L6 -12C-8 -11 -8 6 6 6L52 4L10 14C-4 17 -2 32 12 30L58 22L30 36C18 42 24 56 38 52L92 34C120 34 144 30 162 26Z" fill="#e0453a" stroke="#8f2620" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M120 -30C110 -52 84 -66 70 -58C62 -52 72 -42 88 -34" fill="#e0453a" stroke="#8f2620" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M30 -32C60 -34 90 -34 120 -26" fill="none" stroke="#f08a80" stroke-width="5" stroke-linecap="round" opacity="0.8"/></g>`;
const gloveAt = at(docO, 100, 30, 6); // right edge of the doc, toward the viewer
const GLV_OFF = [700, 120];
const plazaSvg = SC.open + docN.svg + `<g id="daW" opacity="0">${docA.svg}</g>` + sealR.svg +
  `<g id="glv" opacity="0"><g transform="translate(${f(gloveAt[0] + 18)},${f(gloveAt[1] - 4)}) rotate(-14)">${glove}</g></g></g>`;
const sealTopP = SC.p(at(sealO, -36, 8, 260));
const docSideP = SC.p(at(docO, 40, 160, 0));

// ---- principle ①: a magnifier at every gate
const mags = gates.map((g) => {
  const o = P(g.o.u + 150, -40), r = O.magnifier(o, { id: "mg" + g.i, z: 60 });
  const gp = Wp(o.u, o.v), sc = scaleAbout(gp, 0.85);
  return { o, svg: sc.open + r.svg + "</g>" };
});

// ------------------------------------------------------------------ ground layer
let ground = "";
ground += flat(P(0, 0), [[-300, -86], [GU(7) + 330, -86], [GU(7) + 330, 210], [-300, 210]], 0, "#f8f6f1", "#dcd5c8", 2);
for (let u = -260; u < GU(7) + 300; u += 140) ground += line3(P(0, 0), [[u, 62], [u + 70, 62]], "#d3ccbf", 4);
ground += flat(P(0, 0), [[BR_U - 40, -86], [BR_U + 40, -86], [BR_U + 40, -600], [BR_U - 40, -600]], 0, "#f8f6f1", "#dcd5c8", 2);
for (let v = -120; v > -580; v -= 90) ground += line3(P(0, 0), [[BR_U, v], [BR_U, v - 45]], "#2aa3c9", 3, `opacity="0.5"`);
// second source spur (principle ②)
const spur = `<g id="spur" opacity="0">${line3(P(0, 0), [[srcAO.u, srcAO.v - 60, 2], [srcAO.u, 214, 2]], "#1d93ba", 5)}${line3(P(0, 0), [[rpc2O.u, rpc2O.v - 60, 2], [rpc2O.u, 214, 2]], "#1d93ba", 5)}</g>`;
// red ground glows under flagged gates (L0)
const rglows = [2, 4, 5, 7].map((i) => `<g id="rg${i}" opacity="0">${glow("rgl" + i, P(GU(i), 40), 230, "", "red")}</g>`).join("") +
  `<g id="rgb" opacity="0">${glow("rglb", P(BR_U, -420), 200, "", "red")}</g>`;
const divider = `<g id="divider" opacity="0">${line3(P(0, 0), [[DIV_U, 300], [DIV_U, 1300]], "#1c1c1c", 4, `stroke-dasharray="18 12" opacity="0.55"`)}</g>`;

// ------------------------------------------------------------------ objects (painter's order)
const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
for (const g of gates) add(g.o, g.r.svg);
for (const s of signs) add(P(s.o.u, s.o.v - 147), `<g id="${s.id}-w" opacity="0">${s.r.svg}</g>`);
add(rpcO, rpcR.svg); add(rpc2O, `<g id="rpc2-w" opacity="0">${rpc2R.svg}</g>`); add(srcAO, `<g id="srcA-w" opacity="0">${srcAR.svg}</g>`);
add(towerO, towerR.svg); add(chainO, chainR.svg);
add(b4, redBlock, 1);
for (const fl of flags) add(fl.o, fl.r.svg);
add(swO, swR.svg); add(hwsO, hwsR.svg); add(hwO, hwR.svg);
add(bcnO, `<g id="bcn-w" opacity="0">${bcnR.svg}</g>`);
for (const e of ENVS) add(e.end, `<g id="${e.id}" opacity="0" transform="translate(${e.off[0]},${e.off[1]})">${e.r.svg}</g>`, 2);
for (const mg of mags) add(mg.o, `<g id="${mg.svg.match(/id="(mg\d)"/)[1]}-w" opacity="0">${mg.svg}</g>`, 3);
// L2 vignette (one depth slot; internal order fixed)
add(inspO, `<g id="insp-w" opacity="0">${inspR.svg}</g>`);
add(v2O, `<g id="v2" opacity="0">${SC2.open}${counterSvg}${doc2}${env2}${rulers}</g></g>`);
// L3 vignette
add(P(GU(4), ROAD_EDGE), `<g id="v3th">${threadSvg}</g>`, -1);
for (const it of v3) { const sc = scaleAbout(Wp(it.u, v3V), 1.4); it.sc = sc; add(P(it.u, v3V), `<g id="${it.id}-w" opacity="0">${sc.open}${it.r.svg}</g></g>`); }
// plaza
add(safeO, `<g id="cs-w" opacity="0">${SCS.open}${safeR.svg}</g></g>`);
add(sealO, `<g id="plz" opacity="0">${plazaSvg}</g>`);
items.sort((a, b) => a.y - b.y);

const world = worldSvg("world-svg",
  gridSvg({ u0: -3600, u1: 7600, v0: -4200, v1: 5200 }) + ground + spur + rglows + divider +
  items.map((it) => it.svg).join("\n") + delegSvg,
  [-2400, -2800, 9000, 5600]);

// ------------------------------------------------------------------ cameras
const CAMS = {};
CAMS.PAN = camAt(Wp(1720, -220, 120), 690, 470, 0.405); // = seg3b end
const SAFE_R = [70, 110, 1850, 905];
CAMS.C2 = camFit([Wp(GU(2) - 360, -146, BZ1 + 20), Wp(GU(2) + 360, -146, BZ1), at(inspO, -70, 0, 0), SC2.p(at(v2O, 240, 70, 0)), SC2.p(at(v2O, -240, 70, 0)), SC2.p(at(v2O, 260, 0, EVZ1 + 60))], [120, 110, 1800, 905]);
CAMS.C3 = camFit([Wp(GU(4) - 350, -146, BZ1 + 20), Wp(GU(4) + 350, -146, BZ1), Wp(v3[0].u - 200, v3V + 120, 0), Wp(v3[3].u + 80, v3V + 80, 0), Wp(v3[0].u - 200, v3V, 300), Wp(GU(4), ROAD_EDGE, 0)], [120, 110, 1800, 905]);
CAMS.C4 = camFit([Wp(GU(7) - 350, -146, BZ1 + 20), Wp(GU(7) + 350, -146, BZ1), at(swO, -160, 0, 0), at(hwO, 120, 120, 0), at(chainO, 330, 0, 120), at(swO, -150, 0, 360)], [120, 110, 1800, 900]);
CAMS.C5 = camFit([SCS.p(at(safeO, -150, 120, 0)), SCS.p(at(safeO, -150, -120, 470)), sealTopP, docSideP, SC.p(at(docO, 120, -140, 0)), SC.p(at(docO, 120, 140, 0)), SC.p([gloveAt[0] + 330, gloveAt[1] + 30])], [90, 120, 1830, 900]);
CAMS.C6 = camFit([Wp(GU(2) - BW / 2, -146, BZ1 + 40), Wp(GU(7) + BW / 2, -146, BZ1 + 30), Wp(GU(2) - BW / 2, -146, BZ0 - 120), Wp(GU(7) + BW / 2, 200, 0)], [50, 96, 1870, 900]);

// ------------------------------------------------------------------ labels (world, counter-scaled)
let labels = "";
for (const g of gates) labels += wlab("gl-" + g.i, g.r.anchors.top, `<span class="gn">${GN[g.i - 1]}</span>${GNAME[g.i - 1]}`, "lab-g lab-30");
for (const fl of flags) labels += wlab("fl-" + fl.id, fl.r.top, fl.label, "lab-rs lab-30 fl-lab");
labels += wlab("lb-rpc", rpcR.anchors.top, "数据源 RPC", "lab-30", "r");
labels += wlab("lb-chain", at(chainO, 0, 0, 200), "区块链", "lab-30");
// L0
labels += wlab("lb-ok", at(P(GU(3), 0), 0, 260, 0), "签名系统 · 正常运行", "lab-gs hide", "t");
labels += wlab("lb-want", at(P(GU(5), 0), 0, 300, 0), "签出：攻击者想要的", "lab-rs hide", "t");
// L2
labels += wlab("lb-insp", inspR.anchors.top, "下游检查员", "hide");
labels += wlab("lb-fmt", SC2.p(applyM(v2M, EVW + 40, -40)), "格式 ✓", "lab-gs hide", "l");
labels += wlab("lb-biz", SC2.p(applyM(v2M, 340, -190)), "真实业务？没人看", "lab-rs hide", "l");
// L3
v3.forEach((it, k) => { labels += k % 2 ? wlab("lb-" + it.id, it.sc.p(it.r.top ?? it.r.anchors.top), it.lab, "hide") : wlab("lb-" + it.id, it.sc.p(Wp(it.u, v3V + (k === 0 ? 20 : 110), 0)), it.lab, "hide", "t"); });
labels += wpin("sci", cutPts[0], `<svg id="sci-s" class="hide" width="96" height="80" viewBox="0 0 96 80"><g fill="none" stroke="#1c1c1c" stroke-width="6" stroke-linecap="round"><circle cx="20" cy="22" r="13"/><circle cx="20" cy="58" r="13"/><path d="M31 29L88 62M31 51L88 18"/></g><circle cx="52" cy="40" r="5" fill="#1c1c1c"/></svg>`, "c");
v3.forEach((it, i) => { labels += wpin("cx" + i, cutPts[i], BADGE("cx" + i + "-b", 44, "hide"), "c"); });
labels += wlab("lb-cut", [cutPts[3][0] + 70, cutPts[3][1] + 10], "一断就没有输入", "lab-rs hide", "l");
// L4
labels += wlab("lb-sw", at(swO, 0, 0, 390), "暂停提现", "lab-ink hide");
labels += wlab("lb-hws", at(hwsO, 0, 0, 400), "热钱包服务", "lab-ink hide");
labels += wlab("lb-off", Wp(DIV_U - 40, 820, 0), "链下", "zone hide", "r");
labels += wlab("lb-on", Wp(DIV_U + 40, 820, 0), "链上", "zone zone-r hide", "l");
labels += wlab("lb-deleg", [dlMid[0] + 40, dlMid[1]], "链上委托 · 仍然有效", "lab-rs hide", "l");
// L5/L6
labels += wlab("lb-pk", SCS.p(at(safeO, 0, 0, 440)), "私钥保护", "lab-cs lab-big hide");
labels += wlab("lb-pk2", SCS.p(at(safeO, 0, 0, 440)), "谁拿着钥匙", "lab-q hide", "t");
labels += wpin("ck-key", [keyPt[0] + 60, keyPt[1] - 20], CHECK("ck-key-b", 52, "hide"), "c");
labels += wlab("lb-sp", [sealTopP[0], sealTopP[1] - 40], "签名路径", "lab-cs lab-big hide");
labels += wlab("lb-sp2", [sealTopP[0], sealTopP[1] - 40], "谁决定盖在什么文件上", "lab-q hide", "t");
labels += wlab("lb-glv", SC.p([gloveAt[0] + 210, gloveAt[1] + 40]), "攻击者", "lab-rs hide", "t");
// principle ②
labels += wlab("lb-ra", srcAR.anchors.top, "来源 A", "hide");
labels += wlab("lb-rb", rpc2R.anchors.top, "来源 B", "hide");
labels += wlab("lb-ne", Wp((srcAO.u + rpc2O.u) / 2, (srcAO.v + rpc2O.v) / 2, 60), "≠", "lab-rs lab-ne hide");
labels += wlab("lb-noauto", Wp(srcAO.u - 130, srcAO.v, 60), "拒签 · 不自动切换", "lab-r hide", "r");

// ------------------------------------------------------------------ screen-space HTML
const EV = [
  ["②", "Bitget", "2026.09 · 约 3.9 亿美元", "Bitget 称"],
  ["④", "WazirX", "2024.07 · 约 2.3 亿美元", "说法冲突"],
  ["④", "Bybit", "2025.02 · 约 15 亿美元", "FBI 口径"],
  ["⑤", "Drift", "2026.04 · 约 2.85 亿美元", "Chainalysis 分析"],
  ["支线", "KelpDAO", "2026.04 · 约 2.92 亿美元", "LayerZero 称"],
  ["⑤⑦", "Binance", "2026.10 · 约 63.4 亿美元", "Binance 称"],
];
const evCard = (n, name, sub, src, i) => `<div class="ev" id="ev-${i}" style="top:${i * 116}px"><div class="ev-g${n.length > 1 ? " ev-g2" : ""}">${n}</div><div class="ev-m"><div class="ev-r1"><span class="ev-n">${name}</span><span class="ev-src">${src}</span></div><div class="ev-s">${sub}</div></div></div>`;
const evHtml = EV.map((e, i) => evCard(...e, i)).join("");
const EVCOL = { x: 1446, y: 128 };
const STACK = { x: 560, y: 690 }; // screen position of the stacked deck (top-left)
// three teal lines: stack → each sign (screen space, camera = PAN during L1)
const lineSvg = signs.map((s, i) => {
  const A = [STACK.x + 215 + (i - 1) * 120, STACK.y], B = toScreen(CAMS.PAN, s.r.bottom);
  const L = Math.ceil(Math.hypot(B[0] - A[0], B[1] - A[1]));
  return `<g id="ln${i}"><path id="ln${i}-p" d="M${f(A[0])} ${f(A[1])}L${f(B[0])} ${f(B[1])}" stroke="#2aa3c9" stroke-width="4" stroke-linecap="round" stroke-dasharray="${L} ${L}" stroke-dashoffset="${L}" fill="none"/><circle id="ln${i}-a" cx="${f(A[0])}" cy="${f(A[1])}" r="7" fill="#2aa3c9" opacity="0"/><circle id="ln${i}-b" cx="${f(B[0])}" cy="${f(B[1])}" r="9" fill="#ffffff" stroke="#2aa3c9" stroke-width="4" opacity="0"/></g>`;
}).join("");
const LN = signs.map((s, i) => { const A = [STACK.x + 215 + (i - 1) * 120, STACK.y], B = toScreen(CAMS.PAN, s.r.bottom); return Math.ceil(Math.hypot(B[0] - A[0], B[1] - A[1])); });

const css = `
${kitCss()}
#root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
.lab-30 { font-size: 30px; padding: 3px 14px 5px; border-radius: 10px; }
.lab-big { font-size: 44px; padding: 6px 24px 9px; border-radius: 14px; }
.lab-q { font-size: 34px; border-color: #1c1c1c; color: #1c1c1c; margin-top: 12px; }
.lab-ne { font-size: 52px; padding: 0 22px 4px; line-height: 1.1; }
.zone { background: #1c1c1c; border-color: #1c1c1c; color: #ffffff; font-size: 36px; }
.zone-r { background: #ffffff; border-color: #1c1c1c; color: #1c1c1c; }
#evcol { position: absolute; left: ${EVCOL.x}px; top: ${EVCOL.y}px; width: 430px; }
.ev { position: absolute; left: 0; width: 430px; height: 104px; background: #ffffff; border-radius: 16px; box-shadow: 0 8px 20px rgba(70, 60, 40, 0.10);
  display: flex; align-items: center; gap: 14px; padding: 0 16px; }
.ev-g { flex: none; width: 54px; height: 54px; border-radius: 50%; background: #e0453a; color: #fff; font-size: 30px; font-weight: 900; display: flex; align-items: center; justify-content: center; }
.ev-g2 { width: 70px; border-radius: 27px; font-size: 28px; letter-spacing: -1px; }
.ev-g2 ~ .ev-m .ev-s { letter-spacing: -0.5px; }
.ev-g2 ~ .ev-m .ev-n { font-size: 30px; }
.ev-g2 ~ .ev-m .ev-src { padding: 1px 7px 3px; letter-spacing: -0.5px; }
.ev-m { flex: 1; min-width: 0; }
.ev-r1 { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ev-n { font-size: 32px; font-weight: 900; line-height: 1.15; white-space: nowrap; }
.ev-src { font-size: 28px; font-weight: 700; color: #6d685e; background: #f1ede5; border-radius: 8px; padding: 1px 10px 3px; white-space: nowrap; }
.ev-s { font-size: 28px; font-weight: 700; color: #4a463f; white-space: nowrap; font-variant-numeric: tabular-nums; line-height: 1.3; }
#stk-tag { position: absolute; left: ${STACK.x + 20}px; top: ${STACK.y + 150}px; }
#lines { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; overflow: visible; }
#veil { position: absolute; inset: 0; background: #efebe3; }
#tcard { position: absolute; left: 510px; top: 330px; width: 900px; height: 260px; background: #fffdf8; border-radius: 30px;
  box-shadow: 0 18px 40px rgba(70, 60, 40, 0.14); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
#tcard .t-main { font-size: 84px; font-weight: 900; line-height: 1.1; white-space: nowrap; }
#tcard .t-main .num { color: #1d93ba; margin-right: 18px; }
#tcard .t-sub { font-size: 34px; font-weight: 700; color: #6d685e; white-space: nowrap; }
`;

const html = `<template>
  <style>${css}
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <svg id="lines" data-layout-ignore viewBox="0 0 1920 1080">${lineSvg}</svg>
      <div id="evcol" data-layout-allow-overlap>${evHtml}</div>
      <div id="stk-tag" class="lab lab-ink hide">六起叠在一起</div>
      <div id="tcard" data-layout-allow-overlap><div class="t-main">三个共同点</div><div class="t-sub">签名路径</div></div>
      ${pills(4)}
    </div>
  </div>
  <script>
${runtimeJs()}
  (function () {
    const CAMS = ${JSON.stringify(CAMS)};
    const ENVS = ${JSON.stringify(ENVS.map((e) => ({ id: e.id, off: e.off })))};
    const LN = ${JSON.stringify(LN)};
    const CUT = ${JSON.stringify(cutPts.map((p) => [f(p[0]), f(p[1])]))};
    const STACK = ${JSON.stringify(STACK)}, EVCOL = ${JSON.stringify(EVCOL)};
    const tl = gsap.timeline({ paused: true });
    const IO = "power2.inOut";
    const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
    const fade = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.25, ease: "power1.in" }, t);
    const show = (id, t, d) => { tl.set("#" + id + "-w", { opacity: 1 }, t); KIT.grow(tl, id, t, d); };
    KIT.camSet(tl, CAMS.PAN);
    ["#gl-2", "#gl-4", "#gl-5", "#gl-6", "#gl-7"].forEach((x) => tl.set(x, { opacity: 0 }, 0));
    ${JSON.stringify(RED_PLATES)}.forEach((i) => { tl.set("#g" + i + "-plate", { attr: { fill: "#e0453a", stroke: "#a8322a" } }, 0); tl.set("#g" + i + "-plate-n", { attr: { fill: "#ffffff" } }, 0); });

    // ================= 0–1.6 title card
    tl.fromTo("#tcard", { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out", immediateRender: false }, 0.05);
    tl.set("#tcard", { opacity: 0 }, 0);
    tl.to("#tcard", { scale: 0.32, x: 560, y: -400, opacity: 0, duration: 0.5, ease: "power3.in" }, 1.25);

    // ================= L0 六个位置，结果一样 (1.7–9.4)
    [2, 4, 5, 7].forEach((i, k) => tl.fromTo("#rg" + i, { opacity: 0 }, { opacity: 1, duration: 0.25, immediateRender: false }, 2.85 + k * 0.2));
    tl.fromTo("#rgb", { opacity: 0 }, { opacity: 1, duration: 0.25, immediateRender: false }, 3.65);
    ENVS.forEach((e, k) => tl.fromTo("#" + e.id, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 4.8 + k * 0.08));
    fade("#rg2, #rg4, #rg5, #rg7, #rgb", 5.8, 0.4);
    for (let i = 1; i <= 7; i++) KIT.arm(tl, "g" + i, 6.0 + i * 0.06, true, 0.6);
    pop("#lb-ok", 6.4);
    ENVS.forEach((e, k) => tl.to("#" + e.id, { x: 0, y: 0, duration: 0.85, ease: IO }, 7.1 + k * 0.06));
    pop("#lb-want", 8.05);

    // ================= L1 叠在一起 → 三个共同点 (10.5–13.3)
    fade("#lb-ok, #lb-want", 10.2, 0.2);
    for (let i = 0; i < 6; i++) {
      const dx = STACK.x - EVCOL.x + i * 6 - 15, dy = STACK.y - EVCOL.y - i * 116 - i * 8 + 40;
      tl.to("#ev-" + i, { x: dx, duration: 0.6, ease: "power2.inOut" }, 10.55 + i * 0.07);
      tl.to("#ev-" + i, { y: dy, duration: 0.6, ease: "power2.in" }, 10.55 + i * 0.07);
    }
    pop("#stk-tag", 11.3);
    ${JSON.stringify(signs.map((s) => s.id))}.forEach((id, k) => { tl.set("#" + id + "-w", { opacity: 1 }, 11.95 + k * 0.18); KIT.grow(tl, id, 11.95 + k * 0.18, 0.5); });
    for (let i = 0; i < 3; i++) {
      tl.fromTo("#ln" + i + "-p", { attr: { "stroke-dashoffset": LN[i] } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.55, ease: IO, immediateRender: false }, 12.05 + i * 0.18);
      pop("#ln" + i + "-a", 12.05 + i * 0.18, 0.2);
      pop("#ln" + i + "-b", 12.5 + i * 0.18, 0.25);
    }
    [2, 4, 7].forEach((i) => fade("#gl-" + i, 11.9, 0.2));
    fade("#lines, #evcol, #stk-tag", 13.35, 0.3);

    // ================= L2 共同点一：校验放错位置 (14.4–21.6)
    // 总览镜头里 ② ④ ⑤ ⑦ 的关名被旗子标签盖住（门牌上已有编号），这四个关名开场先隐藏，⑤ 在推近后再出现
    tl.to("#gl-5", { opacity: 1, duration: 0.3 }, 13.4);
    // 镜头推近后这些常驻标签会被画面边缘切掉或压到右上角胶囊，提前淡出（原本 48.5 s 才淡）
    fade(".fl-lab, #gl-1, #gl-6, #lb-chain, #lb-rpc", 13.2, 0.2);
    KIT.cam(tl, 13.5, CAMS.C2, 1.1);
    tl.set("#v2", { opacity: 1 }, 14.0);
    KIT.grow(tl, "ctr", 14.1);
    show("insp", 14.35);
    pop("#lb-insp", 14.8);
    tl.set("#v2env", { opacity: 1 }, 15.2);
    tl.fromTo("#v2env-in", { x: -420, y: 147 }, { x: 0, y: 0, duration: 0.7, ease: "power3.out", immediateRender: false }, 15.2);
    tl.set("#v2doc", { opacity: 1 }, 15.95);
    tl.fromTo("#v2rh", { opacity: 0, x: -160 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", immediateRender: false }, 16.95);
    tl.fromTo("#v2rv", { opacity: 0, y: -80 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", immediateRender: false }, 17.45);
    pop("#lb-fmt", 18.3);
    tl.fromTo("#v2doc-in", { y: 0 }, { y: -205, duration: 0.7, ease: "power3.out", immediateRender: false }, 19.1);
    pop("#lb-biz", 20.45);

    // ================= L3 共同点二：单一来源 (22.7–29.8)
    fade("#lb-insp, #lb-fmt, #lb-biz", 21.7, 0.2);
    KIT.cam(tl, 21.8, CAMS.C3, 1.1);
    const T3 = [25.6, 26.68, 27.86, 28.78];
    ${JSON.stringify(v3.map((it) => it.id))}.forEach((id, k) => {
      show(id, T3[k]);
      tl.fromTo("#" + id + "-th", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, T3[k] + 0.2);
      pop("#lb-" + id, T3[k] + 0.25);
    });
    // scissors sweep and cut
    tl.set("#sci-s", { opacity: 1 }, 29.35);
    tl.fromTo("#sci-pin", { x: -90, y: 0 }, { x: 0, y: 0, duration: 0.1, ease: "power1.out", immediateRender: false }, 29.35);
    for (let k = 0; k < 4; k++) {
      const tk = 29.5 + k * 0.2;
      if (k > 0) tl.to("#sci-pin", { x: CUT[k][0] - CUT[0][0], y: CUT[k][1] - CUT[0][1], duration: 0.2, ease: "none" }, tk - 0.19);
      const id = ${JSON.stringify(v3.map((it) => it.id))}[k];
      tl.to("#" + id + "-tA polyline, #" + id + "-tB polyline", { attr: { stroke: "#e0453a" }, duration: 0.1 }, tk);
      tl.to("#" + id + "-tA", { x: 6, y: 5, duration: 0.3, ease: "power2.out" }, tk);
      tl.to("#" + id + "-tB", { x: -6, y: -5, duration: 0.3, ease: "power2.out" }, tk);
      pop("#cx" + k + "-b", tk + 0.02, 0.2);
    }
    fade("#sci-s", 30.25, 0.2);
    pop("#lb-cut", 29.95);

    // ================= L4 共同点三：响应只管链下 (30.9–36.6)
    fade("#lb-i3a, #lb-i3b, #lb-i3c, #lb-i3d, #lb-cut", 30.45, 0.2);
    KIT.cam(tl, 30.5, CAMS.C4, 1.1);
    tl.to("#divider", { opacity: 1, duration: 0.4 }, 31.7);
    pop("#lb-off", 32.5);
    pop("#lb-sw", 33.0); pop("#lb-hws", 33.15);
    KIT.toggle(tl, "sw", 33.5, false, 0.5);
    ["hws-led-0", "hws-led-1", "hws-led-2", "hws-act-0", "hws-act-1", "hws-act-2"].forEach((id, i) => KIT.led(tl, id, 33.85 + (i % 3) * 0.12, "off"));
    pop("#lb-on", 34.7);
    pop("#lb-deleg", 35.45);

    // ================= L5–L6 钥匙与公章 (37.7–47.4)
    fade("#lb-sw, #lb-hws, #lb-off, #lb-on, #lb-deleg", 36.6, 0.2);
    KIT.cam(tl, 36.7, CAMS.C5, 1.1);
    show("cs", 37.1, 0.5);
    tl.set("#plz", { opacity: 1 }, 37.25);
    KIT.grow(tl, "dn", 37.25); KIT.grow(tl, "sl", 37.4);
    // hide the vignettes we left behind (off screen now)
    fade("#v2, #insp-w, #v3th, #i3a-w, #i3b-w, #i3c-w, #i3d-w, #cx0-pin, #cx1-pin, #cx2-pin, #cx3-pin", 37.4, 0.3);
    pop("#lb-pk", 39.45);
    KIT.door(tl, "cs", 39.6, 105, 1.0);
    pop("#lb-pk2", 41.6);
    pop("#ck-key-b", 40.5);
    pop("#lb-sp", 43.5);
    tl.to("#sl-stamp", { x: 0, y: -120, duration: 0.7, ease: IO }, 43.75);
    pop("#lb-sp2", 45.15);
    // the swap: glove brings the red document in, the real one slides away underneath
    tl.set("#glv", { opacity: 1 }, 45.25);
    tl.set("#daW", { opacity: 1 }, 45.25);
    tl.fromTo("#glv, #daW", { x: ${GLV_OFF[0]}, y: ${GLV_OFF[1]} }, { x: 0, y: 0, duration: 0.65, ease: "power3.out", immediateRender: false }, 45.25);
    tl.to("#dn", { opacity: 0, duration: 0.3 }, 45.75);
    tl.to("#glv", { x: 70, y: 22, duration: 0.4, ease: "power2.inOut" }, 46.0);
    pop("#lb-glv", 46.05);
    // the stamp comes down on the swapped document
    tl.to("#sl-stamp", { y: 0, duration: 0.18, ease: "power3.in" }, 46.55);
    tl.fromTo("#sl-mark", { opacity: 0, scale: 1.15, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out", immediateRender: false }, 46.72);
    tl.to("#sl-stamp", { y: -70, duration: 0.45, ease: "power2.out" }, 46.95);

    // ================= L7–L9 三条原则 (48.6–68.0)
    fade(".fl-lab, #gl-1, #lb-chain, #lb-rpc", 48.5, 0.2);
    fade("#lb-pk, #lb-pk2, #ck-key-b, #lb-key, #lb-sp, #lb-sp2, #lb-glv", 48.55, 0.25);
    KIT.cam(tl, 48.65, CAMS.C6, 1.2);
    function flip(id, t) {
      tl.to("#" + id + "-f", { scaleY: 0, svgOrigin: "${BW / 2} 0", duration: 0.22, ease: "power2.in" }, t);
      tl.fromTo("#" + id + "-b", { opacity: 1, scaleY: 0, svgOrigin: "${BW / 2} 0" }, { scaleY: 1, svgOrigin: "${BW / 2} 0", duration: 0.32, ease: "power2.out", immediateRender: false }, t + 0.22);
    }
    // ① 每一层重新检查
    tl.set("#sg1-l2", { opacity: 0 }, 0);
    flip("sg1", 50.95);
    for (let i = 1; i <= 7; i++) show("mg" + i, 51.7 + (i - 1) * 0.1, 0.4);
    tl.fromTo("#sg1-l2", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 53.4);
    // ② 多个独立来源 · 对不上就拒签
    tl.set("#sg2-l2", { opacity: 0 }, 0);
    flip("sg2", 55.8);
    tl.to("#spur", { opacity: 1, duration: 0.3 }, 57.4);
    show("srcA", 57.45); show("rpc2", 57.6);
    pop("#lb-ra", 57.6); pop("#lb-rb", 57.75);
    KIT.led(tl, "rpc2-led-0", 58.85, "red");
    pop("#lb-ne", 58.85);
    tl.fromTo("#sg2-l2", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 58.85);
    KIT.arm(tl, "g5", 59.3, false, 0.55);
    show("bcn", 59.3, 0.35);
    KIT.beacon(tl, "bcn", 59.6, 2.6, 0.9);
    tl.set("#bcn-lit", { attr: { opacity: 1 } }, 62.25);
    pop("#lb-noauto", 59.95);
    // ③ 响应覆盖链上状态
    tl.set("#sg3-l2", { opacity: 0 }, 0);
    flip("sg3", 61.95);
    tl.fromTo("#sg3-l2", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 64.7);
    tl.fromTo("#sg3-ne", { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, 65.85);
    tl.set("#sg3-ne", { opacity: 0 }, 0);
    // hold still to the end
    tl.to({}, { duration: 0.01 }, ${f(TOTAL - 0.05)});
    window.__timelines["story"] = tl;
  })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, JSON.stringify(CAMS));
