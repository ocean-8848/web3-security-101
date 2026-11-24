// Generates compositions/story.html for s7-vivid (one isometric world, one camera).
// Run: node src/build-story.mjs
// Static geometry is baked into the HTML so the HyperFrames desktop app can edit it.
import fs from "node:fs";

const D = Math.PI / 180;
const CA = Math.cos(35 * D), SA = Math.sin(35 * D); // azimuth 35°
const SE = 0.5, CE = Math.cos(30 * D);               // elevation 30°
const f = (n) => Math.round(n * 10) / 10;
const f4 = (n) => Math.round(n * 10000) / 10000;
// world (u,v,z) -> world-canvas px
const Wp = (u, v, z = 0) => [u * CA + v * SA, -u * SA * SE + v * CA * SE - z * CE];
// world-canvas ground px -> (u,v)
const G = (X, Y) => ({ u: CA * X - SA * Y / SE, v: SA * X + CA * Y / SE });
// point relative to an object origin
const at = (o, du = 0, dv = 0, z = 0) => Wp(o.u + du, o.v + dv, z);
const pts = (arr) => arr.map((p) => `${f(p[0])},${f(p[1])}`).join(" ");

// ---------- materials
const M = {
  white: { f: "#f6f3ec", s: "#e3ddd1", t: "#fdfcf9", st: "#b8b0a1" },
  plinth: { f: "#efebe3", s: "#ddd7cb", t: "#f8f6f1", st: "#c3bbac" },
  dark: { f: "#45433f", s: "#2e2d2a", t: "#5a5852", st: "#24231f" },
  blue: { f: "#5cc0e0", s: "#3a9ec2", t: "#9ad9ee", st: "#2a87a8" },
  red: { f: "#e8574c", s: "#c23a30", t: "#f08a80", st: "#a8322a" },
  glass: { f: "rgba(208,234,244,0.30)", s: "rgba(190,224,237,0.38)", t: "rgba(236,248,252,0.50)", st: "rgba(42,163,201,0.75)" },
  gateL: { f: "#f6f3ec", s: "#2fae6a", t: "#fdfcf9", st: "#b8b0a1" },
};
function box(o, u0, u1, v0, v1, z0, z1, m, sw = 1.6) {
  const A = (u, v, z) => at(o, u, v, z);
  const front = [A(u0, v0, z0), A(u0, v1, z0), A(u0, v1, z1), A(u0, v0, z1)];
  const side = [A(u0, v1, z0), A(u1, v1, z0), A(u1, v1, z1), A(u0, v1, z1)];
  const top = [A(u0, v0, z1), A(u1, v0, z1), A(u1, v1, z1), A(u0, v1, z1)];
  const S = `stroke="${m.st}" stroke-width="${sw}" stroke-linejoin="round"`;
  return `<polygon points="${pts(front)}" fill="${m.f}" ${S}/><polygon points="${pts(side)}" fill="${m.s}" ${S}/><polygon points="${pts(top)}" fill="${m.t}" ${S}/>`;
}
// all 12 edges as one path
function edges(o, u0, u1, v0, v1, z0, z1) {
  const c = [];
  for (const z of [z0, z1]) c.push([at(o, u0, v0, z), at(o, u1, v0, z), at(o, u1, v1, z), at(o, u0, v1, z)]);
  let d = "";
  for (const ring of c) d += `M${pts([ring[0]])}L${pts([ring[1]])}L${pts([ring[2]])}L${pts([ring[3]])}Z`;
  for (let i = 0; i < 4; i++) d += `M${pts([c[0][i]])}L${pts([c[1][i]])}`;
  return d;
}
// hidden back edges of a box (for glass)
function backEdges(o, u0, u1, v0, v1, z0, z1) {
  const P = (u, v, z) => pts([at(o, u, v, z)]);
  return `M${P(u1, v0, z0)}L${P(u1, v0, z1)}M${P(u1, v0, z0)}L${P(u0, v0, z0)}M${P(u1, v0, z0)}L${P(u1, v1, z0)}`;
}
// affine frame on the +v face (v = v1), origin at (u0, z1), x along +u, y down
const faceV = (o, u0, v1, z1) => {
  const [x, y] = at(o, u0, v1, z1);
  return `matrix(${f4(CA)},${f4(-SA * SE)},0,${f4(CE)},${f(x)},${f(y)})`;
};
// affine frame on a horizontal plane at height z, origin at (du,dv)
const faceTop = (o, du, dv, z) => {
  const [x, y] = at(o, du, dv, z);
  return `matrix(${f4(CA)},${f4(-SA * SE)},${f4(SA)},${f4(CA * SE)},${f(x)},${f(y)})`;
};
const glow = (id, o, r, cls = "") =>
  `<g transform="${faceTop(o, 0, 0, 0)}"><circle id="${id}" class="${cls}" cx="0" cy="0" r="${r}" fill="url(#gglow)"/></g>`;

// ---------- world layout (world-canvas px of each object's ground centre)
const B = G(760, 640);
const S = [G(1040, 770), G(1390, 830), G(1740, 890)];
const HUB = G(2080, 800);
const V = G(2470, 760);
const GATE_N = ["业务意图", "请求构造", "风控与审批", "显示与解码", "签名", "广播", "链上状态"];
const NUM = ["①", "②", "③", "④", "⑤", "⑥", "⑦"];
const G0 = G(1000, 1000);
const GSP = 330;
const GT = GATE_N.map((_, i) => ({ u: G0.u + i * GSP, v: G0.v }));

// ---------- cameras: screen = k * world + (x, y)
const camAt = (P, sx, sy, k) => ({ x: f(sx - k * P[0]), y: f(sy - k * P[1]), scale: k });
const vMid = at(V, 0, 0, 170);
const CAM = {
  c1: camAt(vMid, 840, 560, 1.12),
  c1b: camAt(vMid, 840, 560, 1.24),
  c2: camAt([1390, 700], 1000, 560, 1.05),
  c3: camAt(at(S[1], 0, -80, 100), 1180, 470, 1.6),
  c45: camAt(vMid, 1060, 615, 0.85),
  c6: camAt([1650, 650], 960, 500, 0.66),
  c7: camAt(at(G0), 230, 870, 0.85),
};
const toScreen = (c, p) => [c.x + c.scale * p[0], c.y + c.scale * p[1]];

// ---------- ground grid (world)
let grid = "";
for (let k = -40; k <= 60; k++) { const u = k * 80; grid += `M${pts([Wp(u, -2600)])}L${pts([Wp(u, 4200)])}`; }
for (let k = -32; k <= 52; k++) { const v = k * 80; grid += `M${pts([Wp(-3400, v)])}L${pts([Wp(4800, v)])}`; }

// ---------- browser (Safe{Wallet} web page)
const brwFace = `<g transform="${faceV(B, -190, 14, 314)}">
  <rect x="0" y="0" width="380" height="300" rx="10" fill="#ffffff" stroke="#b8b0a1" stroke-width="2"/>
  <path d="M0 10a10 10 0 0 1 10-10h360a10 10 0 0 1 10 10v32H0z" fill="#ece7dd"/>
  <circle cx="20" cy="21" r="6" fill="#e0453a"/><circle cx="40" cy="21" r="6" fill="#e6b84a"/><circle cx="60" cy="21" r="6" fill="#1f9d55"/>
  <rect x="84" y="10" width="280" height="22" rx="11" fill="#ffffff"/>
  <text x="100" y="27" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#5f5a50">Safe{Wallet}</text>
  <rect x="12" y="54" width="70" height="234" rx="8" fill="#e8f3f7"/>
  <rect x="24" y="70" width="46" height="10" rx="5" fill="#9fd3e5"/><rect x="24" y="92" width="46" height="10" rx="5" fill="#c9e6f0"/><rect x="24" y="114" width="46" height="10" rx="5" fill="#c9e6f0"/>
  <rect x="96" y="56" width="270" height="134" rx="10" fill="#faf8f4" stroke="#ddd6c9" stroke-width="2"/>
  <text x="112" y="92" font-family="Noto Sans SC, sans-serif" font-size="26" font-weight="900" fill="#1c1c1c">新交易</text>
  <rect x="112" y="110" width="200" height="12" rx="6" fill="#ddd6c9"/><rect x="112" y="134" width="160" height="12" rx="6" fill="#ddd6c9"/><rect x="112" y="158" width="220" height="12" rx="6" fill="#ddd6c9"/>
  <rect x="96" y="206" width="270" height="62" rx="12" fill="#1d93ba"/>
  <text x="231" y="247" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="28" font-weight="900" fill="#ffffff">发起签名</text>
</g>`;
const browser = `<g id="brw-solid">${box(B, -210, 210, -50, 50, 0, 14, M.plinth)}${box(B, -190, 190, -14, 14, 14, 314, M.white)}${brwFace}</g>
  <path id="brw-hint" class="hide" d="${edges(B, -196, 196, -20, 20, 8, 320)}" fill="none" stroke="#e0453a" stroke-width="2.5" stroke-dasharray="10 8"/>
  <path id="brw-wire" class="hide" d="${edges(B, -190, 190, -14, 14, 14, 314) + edges(B, -210, 210, -50, 50, 0, 14)}" fill="rgba(224,69,58,0.04)" stroke="#e0453a" stroke-width="3.5" stroke-dasharray="12 9" stroke-linejoin="round"/>`;

// ---------- signer stations: laptop + hardware wallet
function station(i) {
  const o = S[i];
  const face = `<g transform="${faceV(o, -120, -70, 192)}">
    <rect x="0" y="0" width="240" height="180" rx="10" fill="#2b2a27"/>
    <rect x="9" y="9" width="222" height="162" rx="5" fill="#cfc9be"/>
    <rect id="scr-on-${i}" class="hide" x="9" y="9" width="222" height="162" rx="5" fill="#ffffff"/>
    <g id="ui-${i}" class="hide">
      <rect x="9" y="9" width="222" height="30" fill="#ece7dd"/>
      <text x="20" y="31" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#5f5a50">Safe{Wallet}</text>
      <rect id="btn-${i}" x="120" y="126" width="98" height="36" rx="8" fill="#c9c3b7"/>
      <text x="169" y="152" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="22" font-weight="900" fill="#ffffff">确认</text>
    </g>
    <g id="ui2-${i}" class="hide"><text x="20" y="74" font-family="Noto Sans SC, sans-serif" font-size="25" font-weight="900" fill="#1c1c1c">操作：转账</text></g>
    <g id="ui3-${i}" class="hide"><rect x="16" y="86" width="150" height="32" rx="7" fill="#e3f4ea"/>
      <text x="26" y="110" font-family="Noto Sans SC, sans-serif" font-size="21" font-weight="900" fill="#1f9d55">✓ 看起来正常</text></g>
  </g>`;
  const kb = `<g transform="${faceTop(o, -100, -50, 14)}"><rect x="0" y="0" width="200" height="80" rx="6" fill="#e3ddd1"/><rect x="60" y="92" width="80" height="26" rx="4" fill="#ece7dd"/></g>`;
  return `<g id="st-${i}">${glow("sg-" + i, o, 190, "hide")}
    ${box(o, 140, 200, -10, 52, 0, 22, M.dark)}
    <g transform="${faceTop(o, 150, 0, 22)}"><rect x="0" y="0" width="40" height="30" rx="3" fill="#9ad9ee"/></g>
    ${box(o, -120, 120, -80, 80, 0, 12, M.white)}${kb}
    ${box(o, -120, 120, -80, -70, 12, 192, M.dark, 1.2)}${face}</g>`;
}


// gold bars inside the vault (the money)
const GOLD = { f: "#f0c04a", s: "#cf9520", t: "#ffe08a", st: "#a87612" };
const BARS = [
  [40, 96, -150, -122, 0], [40, 96, -118, -90, 0], [100, 156, -150, -122, 0], [100, 156, -118, -90, 0],
  [60, 116, -140, -112, 1], [60, 116, -108, -80, 1],
  [-150, -94, 100, 128, 0], [-150, -94, 132, 160, 0], [-90, -34, 100, 128, 0], [-90, -34, 132, 160, 0], [-130, -74, 112, 140, 1],
];
const barSvg = (i) => { const b = BARS[i]; const z0 = 16 + b[4] * 18; return `<g id="gold-${i}">${box(V, b[0], b[1], b[2], b[3], z0, z0 + 18, GOLD, 1.2)}</g>`; };
const goldBack = [0, 1, 2, 3, 4, 5].map(barSvg).join("");
const goldFront = [6, 7, 8, 9, 10].map(barSvg).join("");

// ---------- vault (Bybit cold wallet · Safe multisig)
const VG = { u0: -170, u1: 170, v0: -170, v1: 170, z0: 16, z1: 346 };
const IMPL = { u0: -140, u1: -20, v0: -50, v1: 70, z0: 16, z1: 136 };
const ATK = { u0: 20, u1: 140, v0: -10, v1: 110, z0: 16, z1: 126 };
const vault = `<g id="vault">${box(V, -200, 200, -200, 200, 0, 16, M.plinth)}
  <path d="${backEdges(V, VG.u0, VG.u1, VG.v0, VG.v1, VG.z0, VG.z1)}" stroke="rgba(42,163,201,0.45)" stroke-width="1.6" fill="none"/>
  ${goldBack}
  <g id="v-impl">${box(V, IMPL.u0, IMPL.u1, IMPL.v0, IMPL.v1, IMPL.z0, IMPL.z1, M.blue)}</g>
  <path id="v-impl-wire" class="hide" d="${edges(V, IMPL.u0, IMPL.u1, IMPL.v0, IMPL.v1, IMPL.z0, IMPL.z1)}" fill="rgba(224,69,58,0.05)" stroke="#e0453a" stroke-width="3" stroke-dasharray="10 7"/>
  <g id="v-atk" class="hide">${box(V, ATK.u0, ATK.u1, ATK.v0, ATK.v1, ATK.z0, ATK.z1, M.red)}</g>
  ${goldFront}
  <g id="v-glass">${box(V, VG.u0, VG.u1, VG.v0, VG.v1, VG.z0, VG.z1, M.glass, 2)}</g></g>`;
const implC = at(V, (IMPL.u0 + IMPL.u1) / 2, (IMPL.v0 + IMPL.v1) / 2, 76);

// ---------- gates (chapter road)
const roadU0 = -300, roadU1 = 6 * GSP + 300;
const road = `<polygon id="road" points="${pts([at(G0, roadU0, -120), at(G0, roadU1, -120), at(G0, roadU1, 120), at(G0, roadU0, 120)])}" fill="#f8f6f1" stroke="#dcd5c8" stroke-width="2"/>`;
let gates = "", gatePins = "";
for (let i = 6; i >= 0; i--) {
  const o = GT[i];
  const base = at(o);
  gates += `<g id="gate-${i}">${glow("gg-" + i, o, 150)}<g id="gate-solid-${i}">${box(o, -22, 22, -132, -96, 0, 230, M.gateL)}${box(o, -22, 22, 96, 132, 0, 230, M.white)}${box(o, -28, 28, -146, 146, 230, 272, M.white)}</g>
    <path id="gate-wire-${i}" class="hide" d="${edges(o, -22, 22, -132, -96, 0, 230) + edges(o, -22, 22, 96, 132, 0, 230) + edges(o, -28, 28, -146, 146, 230, 272)}" fill="none" stroke="#e0453a" stroke-width="3" stroke-dasharray="10 7"/></g>`;
  gates = gates.replace(`<g id="gate-${i}">`, `<g id="gate-${i}" data-ox="${f(base[0])}" data-oy="${f(base[1])}">`);
}

// ---------- HTML pins in world-canvas space
const pinAt = (id, p, inner, cls = "") => `<div class="pin ${cls}" id="${id}" style="left:${f(p[0])}px;top:${f(p[1])}px">${inner}</div>`;
// world label: counter-scaled so it reads at a constant size on screen
const wlab = (id, p, html, cls, anchor = "b") =>
  pinAt(id + "-pin", p, `<div class="wl"><div class="ctr a-${anchor}"><div class="lab ${cls} hide" id="${id}">${html}</div></div></div>`);
const ENV = (red) => `<svg width="64" height="44" viewBox="0 0 64 44"><rect x="2" y="2" width="60" height="40" rx="5" fill="${red ? "#fde6e3" : "#ffffff"}" stroke="${red ? "#e0453a" : "#6b665c"}" stroke-width="3"/><path d="M4 5L32 26L60 5" fill="none" stroke="${red ? "#e0453a" : "#6b665c"}" stroke-width="3" stroke-linejoin="round"/></svg>`;
const BADGE = (id, size = 64) => `<div class="badge hide" id="${id}" style="width:${size}px;height:${size}px"><svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 20 20"><path d="M4 4L16 16M16 4L4 16" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/></svg></div>`;
const LOCK = (i) => `<div class="lock hide" id="lk-${i}"><svg width="72" height="58" viewBox="0 0 92 74">
  <path d="M16 32V22a14 14 0 0 1 28 0v10" fill="none" stroke="#1c1c1c" stroke-width="5"/>
  <rect x="6" y="30" width="48" height="38" rx="7" fill="#ffffff" stroke="#1c1c1c" stroke-width="4"/>
  <circle cx="30" cy="49" r="5" fill="#1c1c1c"/><path d="M30 49H70" stroke="#1c1c1c" stroke-width="4"/>
  <circle cx="78" cy="49" r="8" fill="#ffffff" stroke="#1c1c1c" stroke-width="4"/></svg>
  <div class="lk-ck hide" id="lk-ck-${i}"><svg width="22" height="18" viewBox="0 0 34 28"><path d="M3 15l9 9L31 4" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>`;
const BUCKET = `<svg width="40" height="34" viewBox="0 0 40 34"><path d="M8 10C12 4 28 4 32 10" fill="none" stroke="#2aa3c9" stroke-width="3"/><ellipse cx="20" cy="11" rx="15" ry="5" fill="#d9eff6" stroke="#2aa3c9" stroke-width="3"/><path d="M5 11L9 30Q20 34 31 30L35 11" fill="#d9eff6" stroke="#2aa3c9" stroke-width="3" stroke-linejoin="round"/></svg>`;

let objPins = "";
objPins += wlab("l-brw", at(B, 0, 14, 352), "Safe{Wallet} 网页", "lab-c");
objPins += wlab("l-s3", at(B, 0, 14, 352), `${BUCKET}<span>前端 JS · 托管在 AWS S3</span>`, "lab-c stk1");
objPins += pinAt("bdg-brw-pin", at(B, 0, 0, 170), `<div class="ctr a-c">${BADGE("bdg-brw", 76)}</div>`);
objPins += wlab("l-js", at(B, 0, 14, 352), "篡改的 JS 只针对 Bybit 冷钱包", "lab-r stk2");
objPins += wlab("l-vault", at(V, 0, 0, 420), "Bybit 冷钱包 · Safe 多签", "lab-c");
objPins += wlab("l-impl", at(V, -170, 140, 120), "实现合约", "lab-c", "r");
objPins += pinAt("bdg-impl-pin", implC, `<div class="ctr a-c">${BADGE("bdg-impl", 60)}</div>`);
objPins += wlab("l-atk", at(V, 140, 170, 60), "攻击者合约", "lab-rs", "l");
objPins += wlab("l-slot", at(V, -60, 230, 40), "Safe 存储 slot 0 = 实现合约地址", "lab-c", "t");
objPins += wlab("l-sign", at(S[1], 0, -80, 250), "签名人（示意）", "lab-c");
for (let i = 0; i < 3; i++) objPins += pinAt(`lk-pin-${i}`, at(S[i], 170, 20, 30), `<div class="ctr a-b">${LOCK(i)}</div>`);
objPins += wlab("l-key", at(S[0], -130, 90, 40), "私钥 · 未泄露", "lab-gs", "r");
objPins += wlab("l-key2", at(S[1], 0, 150, 0), "钥匙 ✓ 一直安全", "lab-gs", "t");
// envelopes: start above each laptop, fly to the hub
const hubP = at(HUB, 0, 0, 60);
const envStart = S.map((o) => at(o, 0, -75, 230));
for (let i = 0; i < 3; i++) {
  objPins += pinAt(`env-pin-${i}`, envStart[i], `<div class="ctr a-c"><div class="env hide" id="env-${i}">${ENV(false)}<div class="env-red hide">${ENV(true)}</div></div></div>`);
}
objPins += pinAt("hubx-pin", hubP, `<div class="ctr a-c"><svg id="hubx" class="hide" width="104" height="104" viewBox="0 0 20 20"><path d="M3 3L17 17M17 3L3 17" stroke="#e0453a" stroke-width="2.4" stroke-linecap="round"/></svg></div>`);
objPins += wlab("l-file", at(HUB, 0, 0, 150), "文件 ✗ 被换了", "lab-rs");

let gatePinsHtml = "";
GT.forEach((o, i) => {
  gatePinsHtml += wlab(`l-g${i}`, at(o, 0, 0, 300), `<span class="gn">${NUM[i]}</span>${GATE_N[i]}`, "lab-g");
});
gatePinsHtml += pinAt("bdg-g3-pin", at(GT[3], 0, 0, 130), `<div class="ctr a-c">${BADGE("bdg-g3", 64)}</div>`);
const genvStart = at(G0, -260, 0, 40);
gatePinsHtml += pinAt("genv-pin", genvStart, `<div class="ctr a-c"><div class="env hide" id="genv">${ENV(false)}</div></div>`);

const SVGW = `width="6000" height="3600" viewBox="-1500 -1600 6000 3600" style="left:-1500px;top:-1600px"`;
const defs = `<defs><radialGradient id="gglow"><stop offset="0" stop-color="#1f9d55" stop-opacity="0.42"/><stop offset="0.55" stop-color="#1f9d55" stop-opacity="0.16"/><stop offset="1" stop-color="#1f9d55" stop-opacity="0"/></radialGradient></defs>`;

// ---------- screen-space curve: operation row -> implementation contract
const P0 = [600, 441];
const E = toScreen(CAM.c45, implC);
const P1 = [P0[0] + 300, P0[1] + 170];
const P2 = [E[0] - 280, E[1] - 40];
const bez = (t) => [0, 1].map((k) => (1 - t) ** 3 * P0[k] + 3 * (1 - t) ** 2 * t * P1[k] + 3 * (1 - t) * t * t * P2[k] + t ** 3 * E[k]);
let L = 0; { let prev = bez(0); for (let i = 1; i <= 400; i++) { const p = bez(i / 400); L += Math.hypot(p[0] - prev[0], p[1] - prev[1]); prev = p; } }
const curveD = `M${pts([P0])}C${pts([P1])} ${pts([P2])} ${pts([E])}`;

const K = {
  CAM, P0, P1, P2, E, L: Math.ceil(L),
  hub: hubP, envStart,
  vOrigin: at(V, 0, 0, 0), gateOrigins: GT.map((o) => at(o)),
  gstep: [GSP * CA, -GSP * SA * SE], genvStart,
  objCentre: [1630, 700],
};
for (const k of Object.keys(K.CAM)) K.CAM[k].scale = K.CAM[k].scale;

let dots = "";
for (let i = 0; i < 15; i++) {
  const c = i % 5, r = Math.floor(i / 5);
  const st = `left:${150 + c * 76}px;top:${150 + r * 76}px`;
  dots += `<i class="slot" style="${st}"></i><i class="dot" id="dot-${i}" style="${st}"></i>`;
}
const curveSvg = `<svg id="curve" width="1920" height="1080" viewBox="0 0 1920 1080">
        <defs><mask id="cv-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
          <path id="cv-mpath" d="${curveD}" fill="none" stroke="#ffffff" stroke-width="16" stroke-dasharray="${Math.ceil(L)} ${Math.ceil(L)}" stroke-dashoffset="${Math.ceil(L)}"/></mask></defs>
        <path d="${curveD}" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 9" stroke-linecap="round" mask="url(#cv-mask)"/>
        <circle id="cv-dot" class="hide" cx="${f(P0[0])}" cy="${f(P0[1])}" r="8" fill="#e0453a"/>
        <circle id="cv-end" class="hide" cx="${f(E[0])}" cy="${f(E[1])}" r="14" fill="none" stroke="#e0453a" stroke-width="4"/>
      </svg>`;

const tpl = fs.readFileSync(new URL("./story.tpl", import.meta.url), "utf8");
const out = tpl
  .replace("<!--GRIDSVG-->", `<svg id="grid-svg" class="wsvg" ${SVGW}><path d="${grid}" stroke="#e2ddd3" stroke-width="2" fill="none"/></svg>`)
  .replace("<!--GATESVG-->", `<svg id="gate-svg" class="wsvg" ${SVGW}>${defs}<g id="road-g" opacity="0">${road}</g>${gates}</svg>`)
  .replace("<!--OBJSVG-->", `<svg id="obj-svg" class="wsvg" ${SVGW}>${defs}${browser}${vault}${station(0)}${station(1)}${station(2)}</svg>`)
  .replace("<!--OBJPINS-->", objPins)
  .replace("<!--GATEPINS-->", gatePinsHtml)
  .replace("<!--CURVE-->", curveSvg)
  .replace("<!--DOTS-->", dots)
  .replace("/*K*/", `const K = ${JSON.stringify(K)};`);
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), out);
console.log("wrote compositions/story.html", out.length, "curve L", Math.ceil(L), "E", E.map(f));
