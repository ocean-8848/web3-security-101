// objects-ext.mjs — 第 05 章（访问控制）补充拟物物件（与 kit/objects.mjs 同一投影、同一接口）
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"
//   opts.glow = true 时脚下绿色地光
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x
// 运行时动画助手在 runtime-ext.js（window.KITX05，并合并进 window.KITX），用 runtimeExtJs() 内联，放在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  CA, SA, SE, CE, U, V, f, f4, at, pts, M, C, lighten, darken, mat,
  frameV, frameU, frameTop, frameTilt, matStr, faceV, faceU, faceTop,
  box, rbox, cyl, frustum, loft, wedge, sphere, line3, circlePlan, edges,
  glow, contactShadow, wireSvg, badgeSvg,
} from "../../kit/iso.mjs";

const DEG = Math.PI / 180;
const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const txt = (x, y, s, o = {}) =>
  `<text x="${f(x)}" y="${f(y)}" ${o.mono ? MONO : FONT} font-size="${o.size ?? 20}" font-weight="${o.weight ?? 900}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}" ${o.extra ?? ""}>${s}</text>`;
const LED = { green: "#2bd46f", red: "#ff4a3d", off: "#3c3f45", blue: "#5cc0e0" };
const ledSvg = (id, x, y, r, color) => {
  const c = LED[color] ?? color;
  return `<circle id="${id}-h" cx="${f(x)}" cy="${f(y)}" r="${f(r * 2.1)}" fill="${c}" opacity="${color === "off" ? 0 : 0.35}"/><circle id="${id}" cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" stroke="rgba(0,0,0,0.35)" stroke-width="1"/>`;
};
const tw = (s, size, mono = false) => [...String(s)].reduce((a, c) => a + (/[⺀-￿]/.test(c) ? 1 : mono ? 0.6 : 0.58) * size, 0);
function gearD(cx, cy, r, n = 10, h = 5) {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a0 = (i / (n * 2)) * 2 * Math.PI, a1 = ((i + 1) / (n * 2)) * 2 * Math.PI, rr = i % 2 ? r : r + h;
    const p0 = [cx + rr * Math.cos(a0), cy + rr * Math.sin(a0)], p1 = [cx + rr * Math.cos(a1), cy + rr * Math.sin(a1)];
    d += (i === 0 ? `M${f(p0[0])} ${f(p0[1])}` : `L${f(p0[0])} ${f(p0[1])}`) + `L${f(p1[0])} ${f(p1[1])}`;
  }
  return d + "Z";
}
function shell(p, o, opts, s) {
  const st = opts.state ?? "normal", broken = st === "broken";
  const glowOn = (opts.glow ?? s.glowDefault ?? false) && !broken;
  const [ox, oy] = at(o);
  const glowSvg = s.glowR ? `<g id="${p}-glow" opacity="${glowOn ? 1 : 0}">${glow(p + "-gl", s.glowAt ?? o, s.glowR)}</g>` : "";
  return `<g id="${p}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}" data-state="${st}">${s.under ?? ""}${glowSvg}${s.shadow ?? ""}
  <g id="${p}-solid" opacity="${broken ? opts.ghost ?? 0.18 : 1}">${s.solid}</g>
  ${wireSvg(p + "-wire", o, s.wire, { opacity: broken ? 1 : 0 })}
  ${badgeSvg(p + "-x", s.center, s.badgeR ?? 30, broken && opts.badge !== false ? 1 : 0)}${s.over ?? ""}</g>`;
}
const isAtk = (opts) => opts.state === "attacker";
const P = (q) => pts([q]);
const poly = (arr, fill, stroke = "none", sw = 1.6, extra = "") => `<polygon points="${pts(arr)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" ${extra}/>`;
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const r2 = (n) => Math.round(n * 100) / 100;
const chromeGrad = (id, vertical = true) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="#f4f5f6"/><stop offset="0.5" stop-color="#c3c7cc"/><stop offset="1" stop-color="#7d828a"/></linearGradient></defs>`;
const brass = { f: "#d6a64a", s: "#b58630", t: "#ecc778", st: "#7a5716" };
const TEALM = { f: "#2aa3c9", s: "#1d86a8", t: "#7fcfe8", st: "#145f78" };
const REDM = { f: "#e8574c", s: "#c23a30", t: "#f39a91", st: "#8f2620" };
const GREENM = { f: "#3fb877", s: "#1f9d55", t: "#86d6a8", st: "#17804a" };
const GRAYM = { f: "#a3a8ae", s: "#868c93", t: "#c4c8cd", st: "#4f545a" };
const capMat = (c) => (c === "red" ? REDM : c === "green" ? GREENM : c === "gray" ? GRAYM : c && c.startsWith && c.startsWith("#") ? mat(c) : TEALM);
/** deterministic PRNG (mulberry32) seeded from a string */
function rng(seed) {
  let h = 1779033703 ^ String(seed).length;
  for (const ch of String(seed)) { h = Math.imul(h ^ ch.charCodeAt(0), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// =====================================================================================
// 门卡 keycard（独立物件；roleBoard 也用 cardFace）
// =====================================================================================
export const ROLES = {
  upgrader: { c: "#1d93ba", t: "UPGRADER" },
  param: { c: "#1c1c1c", t: "PARAM_ADMIN" },
  pauser: { c: "#1f9d55", t: "PAUSER" },
  minter: { c: "#8a8f96", t: "MINTER" },
  owner: { c: "#1c1c1c", t: "OWNER" },
  attacker: { c: "#e0453a", t: "ATTACKER" },
};
/** card face in local 64×40 units (y down, band on top). o: {band, text, blank, holder} */
function cardFace(p, o) {
  const band = o.blank ? "#d8d3c8" : o.band;
  let s = `<rect x="0" y="0" width="64" height="40" rx="3.5" fill="#fbfaf6" stroke="#9c958a" stroke-width="1"/>
    <path d="M3.5 0H60.5A3.5 3.5 0 0 1 64 3.5V10H0V3.5A3.5 3.5 0 0 1 3.5 0Z" fill="${band}"/>
    <rect x="27" y="2.2" width="10" height="3" rx="1.5" fill="#efebe3" stroke="rgba(0,0,0,0.25)" stroke-width="0.5"/>`;
  if (o.blank) {
    s += txt(32, 31, "0x0", { size: 15, mono: true, anchor: "middle", weight: 800, fill: "#1c1c1c" });
    return s;
  }
  s += txt(32, 8.6, o.text, { size: o.text.length > 9 ? 5.6 : 6.4, mono: true, anchor: "middle", weight: 800, fill: "#ffffff", extra: `letter-spacing="0.2"` });
  // chip
  s += `<defs><linearGradient id="${p}-chip" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef0f2"/><stop offset="1" stop-color="#9aa0a8"/></linearGradient></defs>
    <rect x="6" y="15" width="13" height="10" rx="2" fill="url(#${p}-chip)" stroke="#6e737b" stroke-width="0.7"/>
    <path d="M6 18.3H11M14 18.3H19M6 21.6H11M14 21.6H19M12.5 15V25" stroke="#6e737b" stroke-width="0.6"/>`;
  // photo + text lines
  s += `<rect x="45" y="14" width="13" height="17" rx="1.5" fill="#e3e8ea" stroke="#b9c0c4" stroke-width="0.6"/>
    <circle cx="51.5" cy="20" r="3.4" fill="#9aa3a9"/><path d="M45.6 30.4C46.5 25.8 56.5 25.8 57.4 30.4Z" fill="#9aa3a9"/>
    <rect x="23" y="16" width="17" height="2.6" rx="1.3" fill="#c9c3b7"/><rect x="23" y="21" width="12" height="2.6" rx="1.3" fill="#d8d3c8"/>`;
  s += txt(6, 35.5, o.holder ?? "0x7a3f…c91e", { size: 4.6, mono: true, weight: 600, fill: "#7d776b" });
  return s;
}
const roleOf = (role, opts = {}) => {
  const R = ROLES[role] ?? ROLES.upgrader;
  return { band: opts.color ?? R.c, text: opts.text ?? R.t };
};
/**
 * keycard(o, {role, color, text, blank, pose:"stand"|"flat", lanyard, z, scale, holder})
 * 等距厚卡片（约 64×40×3），顶边色带区分角色；blank:true 只印 0x0（零地址）。
 * anchors: top, center, ground, face（卡面中心）, hole（挂绳孔）
 */
export function keycard(o, opts = {}) {
  const p = opts.id ?? "kc", k = opts.scale ?? 1, atk = isAtk(opts);
  const role = atk ? "attacker" : opts.role ?? "upgrader";
  const R = roleOf(role, opts);
  const W = 64 * k, H = 40 * k, T = 3.2 * k, pose = opts.pose ?? "stand", z = opts.z ?? 0;
  const edgeM = { f: "#e9e5dc", s: "#d6d0c4", t: "#f4f1ea", st: "#8f887c" };
  const face = cardFace(p, { band: R.band, text: R.text, blank: opts.blank, holder: opts.holder });
  let s = "", anchors;
  const lanyard = opts.lanyard ?? pose === "stand";
  if (pose === "flat") {
    s += contactShadow(o, W * 0.75, H * 0.8);
    if (lanyard) {
      s += G_(faceTop(o, -W / 2, -H / 2, z + 1), `<path d="M${30 * k} ${3 * k}C${10 * k} ${-30 * k} ${-26 * k} ${-46 * k} ${-36 * k} ${-26 * k}C${-46 * k} ${-6 * k} ${4 * k} ${-6 * k} ${34 * k} ${3 * k}" fill="none" stroke="${R.band}" stroke-width="${4 * k}" stroke-linecap="round" opacity="0.92"/>`);
    }
    s += box(o, -W / 2, W / 2, -H / 2, H / 2, z, z + T, edgeM, 1);
    s += G_(faceTop(o, -W / 2, -H / 2, z + T), `<g transform="scale(${k})">${face}</g>`);
    anchors = { top: at(o, 0, 0, z + 60 * k), center: at(o, 0, 0, z + T), face: at(o, 0, 0, z + T), hole: at(o, 0, -H / 2 + 4 * k, z + T), ground: at(o) };
  } else {
    s += contactShadow(o, W * 0.6, 18 * k);
    const zt = z + H;
    if (lanyard) {
      s += G_(faceV(o, -W / 2, -T / 2, zt), `<path d="M${28 * k} ${3 * k}L${18 * k} ${-44 * k}Q${32 * k} ${-62 * k} ${46 * k} ${-44 * k}L${36 * k} ${3 * k}" fill="none" stroke="${darken(R.band, 0.15)}" stroke-width="${3.6 * k}" stroke-linejoin="round" stroke-linecap="round"/>
        <rect x="${28.5 * k}" y="${-4 * k}" width="${7 * k}" height="${8 * k}" rx="${1.5 * k}" fill="#c3c7cc" stroke="#6e737b" stroke-width="1"/>`);
    }
    s += box(o, -W / 2, W / 2, -T, 0, z, zt, edgeM, 1);
    s += G_(faceV(o, -W / 2, 0, zt), `<g transform="scale(${k})">${face}</g>`);
    anchors = { top: at(o, 0, 0, zt + (lanyard ? 70 : 26) * k), center: at(o, 0, 0, z + H / 2), face: at(o, 0, 0, z + H / 2), hole: at(o, 0, 0, zt - 3 * k), ground: at(o) };
  }
  const wire = pose === "flat" ? [[-W / 2, W / 2, -H / 2, H / 2, z, z + T]] : [[-W / 2, W / 2, -T, 0, z, z + H]];
  return { svg: shell(p, o, opts, { solid: s, wire, center: anchors.center, badgeR: 18 * k, glowR: 60 * k }), anchors };
}

// =====================================================================================
// 函数按钮台 funcPanel
// =====================================================================================
const COVER_GLASS = ["rgba(196,228,240,0.30)", "rgba(178,216,232,0.34)", "rgba(206,236,246,0.30)", "rgba(226,246,252,0.42)", "rgba(200,232,244,0.36)", "rgba(170,210,226,0.85)"];
/** hinged glass cover polygons. H hinge-centre px; B=[U,S,N] screen unit vectors; a = open angle */
function coverPolys(H, B, w, l, hh, a) {
  const ca = Math.cos(a * DEG), sa = Math.sin(a * DEG), [Uv, S, N] = B;
  const Pt = (x, s, h) => { const ks = s * ca - h * sa, kn = s * sa + h * ca; return [H[0] + x * Uv[0] + ks * S[0] + kn * N[0], H[1] + x * Uv[1] + ks * S[1] + kn * N[1]]; };
  const w2 = w / 2;
  return [
    [Pt(-w2, 0, 0), Pt(w2, 0, 0), Pt(w2, 0, hh), Pt(-w2, 0, hh)],
    [Pt(w2, 0, 0), Pt(w2, l, 0), Pt(w2, l, hh), Pt(w2, 0, hh)],
    [Pt(-w2, 0, 0), Pt(-w2, l, 0), Pt(-w2, l, hh), Pt(-w2, 0, hh)],
    [Pt(-w2, 0, hh), Pt(w2, 0, hh), Pt(w2, l, hh), Pt(-w2, l, hh)],
    [Pt(-w2, l, 0), Pt(w2, l, 0), Pt(w2, l, hh), Pt(-w2, l, hh)],
    [Pt(-12, l, hh - 9), Pt(12, l, hh - 9), Pt(12, l + 9, hh - 9), Pt(-12, l + 9, hh - 9)],
  ];
}
/**
 * funcPanel(o, {buttons, pitch, depth, height, title, lamps, atk})
 *   buttons: ["mint", ...] 或 [{name, guard:"none"|"card"|"broken"|"plate", color:"teal"|"red"|"gray"|"#hex", open:deg}]
 *   state:"attacker" 时第 opts.atk（默认 0）号按钮变红
 * 可动：ID-btn-i（蘑菇按钮帽，KITX05.press）、ID-btn-i-fl（闪光）
 *       ID-guard-i（护罩外层，KITX05.guard 扣上/拿掉）> ID-cover-i（翻盖，KITX05.lid 绕后沿 0–100°）
 *       ID-rdr-i（读卡器）> ID-rd-i（LED，KIT.led / KITX05.swipe）
 *       ID-gap-i（红虚线空位）、ID-plate-i（焊死钢板）、ID-lamp-i（lamps:true 时的"已初始化"小灯）
 * anchors: top, center, ground, front, btns[i]（按钮顶）, readers[i]（读卡器 LED）, slots[i]（卡槽）, plates[i]（铭牌）, covers[i]（护罩顶）
 */
export function funcPanel(o, opts = {}) {
  const p = opts.id ?? "fp", atk = isAtk(opts);
  const btns = (opts.buttons ?? ["mint", "initialize", "kill", "upgrade", "pause"]).map((b) => (typeof b === "string" ? { name: b } : { ...b }));
  if (atk) { const ai = opts.atk ?? 0; if (btns[ai]) btns[ai].color = "red"; }
  const n = btns.length, pitch = opts.pitch ?? 104;
  const W = n * pitch + 48, D = opts.depth ?? 170, ang = 20 * DEG, ca = Math.cos(ang), sa = Math.sin(ang);
  const u0 = -W / 2, u1 = W / 2, v0 = -D / 2, v1 = D / 2;
  const zB = opts.height ?? 150, zF = zB - D * Math.tan(ang), L = D / ca;
  const SP = (du, s, h = 0) => [du, v0 + s * ca - h * sa, zB - s * sa + h * ca];
  const A = (du, s, h = 0) => { const q = SP(du, s, h); return at(o, q[0], q[1], q[2]); };
  const Sv = [ca * V[0], ca * V[1] + sa * CE], Nv = [-sa * V[0], -sa * V[1] - ca * CE];
  const slopeM = (du, s, h = 0) => { const q = A(du, s, h); return matStr([U[0], U[1], Sv[0], Sv[1], q[0], q[1]]); };
  const body = { f: "#8c939b", s: "#6d747c", t: "#a9afb6", st: "#33383e" };
  const hood = { f: "#5d636b", s: "#474c53", t: "#767c84", st: "#25282c" };
  /** visible faces of a box in slope coords */
  const sbox = (x0, x1, s0, s1, h0, h1, m, sw = 1.3) => {
    const top = [A(x0, s0, h1), A(x1, s0, h1), A(x1, s1, h1), A(x0, s1, h1)];
    const front = [A(x0, s1, h0), A(x1, s1, h0), A(x1, s1, h1), A(x0, s1, h1)];
    const left = [A(x0, s0, h0), A(x0, s1, h0), A(x0, s1, h1), A(x0, s0, h1)];
    return poly(left, m.f, m.st, sw) + poly(front, m.s, m.st, sw) + poly(top, m.t, m.st, sw);
  };
  let s = contactShadow(o, W * 0.62, D * 0.85);
  // plinth + wedge body
  s += rbox(o, u0 - 10, u1 + 10, v0 - 10, v1 + 16, 0, 10, 8, M.ink, { sw: 1.4 });
  s += wedge(o, u0, u1, v0, v1, 10, zB, body, "+v", zF, 2);
  // −u side: vent slots + screws
  s += G_(faceU(o, u0, v0 + 22, zF - 14), [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${i * 20}" y="0" width="12" height="${zF - 44}" rx="5" fill="${darken(body.f, 0.28)}"/><rect x="${i * 20 + 2}" y="2" width="8" height="${zF - 48}" rx="4" fill="${darken(body.f, 0.45)}"/>`).join(""));
  // sloped top: inset dark panel + bezel + screws
  s += G_(slopeM(u0, 0), `<rect x="10" y="10" width="${W - 20}" height="${L - 20}" rx="8" fill="#3b4046" stroke="#22262a" stroke-width="2"/>
    <rect x="16" y="16" width="${W - 32}" height="${L - 32}" rx="6" fill="none" stroke="#565c63" stroke-width="1.6"/>` +
    [[20, 20], [W - 20, 20], [20, L - 20], [W - 20, L - 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#9aa0a8" stroke="#2b2e33" stroke-width="1"/><path d="M${x - 2.5} ${y}H${x + 2.5}" stroke="#2b2e33" stroke-width="1"/>`).join(""));
  // back hood with title strip
  s += box(o, u0, u1, v0 - 2, v0 + 22, zB - 10, zB + 22, hood, 1.6);
  s += G_(faceV(o, u0, v0 + 22, zB + 22), `<rect x="10" y="6" width="${W - 20}" height="18" rx="4" fill="#2b2e33"/>` +
    txt(22, 19, opts.title ?? "CONTRACT · EXTERNAL FUNCTIONS", { size: 11, mono: true, weight: 700, fill: "#9ad9ee" }) +
    btns.map((b, i) => ledSvg(`${p}-st-${i}`, 24 + pitch * (i + 0.5) + 30, 15, 2.6, "off")).join(""));
  // front face: kick strip, nameplates, reader mounts
  const cx = (i) => u0 + 24 + pitch * (i + 0.5);
  let front = `<rect x="0" y="${zF - 22}" width="${W}" height="12" fill="${darken(body.s, 0.2)}"/>`;
  btns.forEach((b, i) => {
    const x = cx(i) - u0, pw = Math.min(pitch - 10, Math.max(56, tw(b.name, 15, true) + 18));
    front += `<rect x="${x - 27}" y="4" width="54" height="44" rx="4" fill="${darken(body.s, 0.18)}" stroke="${body.st}" stroke-width="1"/>` +
      [[x - 22, 9], [x + 22, 9], [x - 22, 43], [x + 22, 43]].map(([a, c]) => `<circle cx="${a}" cy="${c}" r="1.8" fill="#2b2e33"/>`).join("") +
      `<rect x="${x - pw / 2}" y="53" width="${pw}" height="20" rx="3" fill="#f6f3ec" stroke="#5d636b" stroke-width="1.4"/>` +
      txt(x, 68, b.name, { size: 15, mono: true, anchor: "middle", weight: 800, fill: b.color === "red" ? "#c3352b" : "#1c1c1c" });
  });
  s += G_(faceV(o, u0, v1, zF), front);

  // buttons, back (large u) to front
  const sB = L * 0.4, cw = 72, cl = 78, ch = 50, sH = sB - cl / 2;
  const btnTop = [], readers = [], slots = [], plates = [], covers = [];
  let topItems = "", frontItems = "", gaps = "";
  for (let i = n - 1; i >= 0; i--) {
    const b = btns[i], cu = cx(i), guard = b.guard ?? "none", m = capMat(b.color);
    const [, vB, zs] = SP(cu, sB, 0);
    let g = "";
    // collar ring on the panel
    g += G_(slopeM(cu, sB), `<ellipse cx="0" cy="0" rx="33" ry="33" fill="#24282c"/><circle cx="0" cy="0" r="31" fill="url(#${p}-chr)" stroke="#4b4f56" stroke-width="1.4"/><circle cx="0" cy="0" r="25" fill="#2b2f34"/>` +
      `<path d="M-24 -6A25 25 0 0 1 -6 -24" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>`);
    // housing
    g += cyl(o, cu, vB, 21, zs - 10, zs + 10, { f: "#3a3e44", s: "#2a2d32", t: "#4a4f56", st: "#15171a" }, { sw: 1.2, seg: 28 });
    // cap (mushroom)
    const cap = frustum(o, cu, vB, 27, 28, zs + 10, zs + 19, m, { sw: 1.4, seg: 32, top: false }) +
      loft(o, circlePlan(cu, vB, 28, 32), circlePlan(cu, vB, 14, 32), zs + 19, zs + 30, m, { sw: 1.4, topFill: m.t }) +
      (() => { const c = at(o, cu - 8, vB - 6, zs + 30); return `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="9" ry="4" fill="#ffffff" opacity="0.45"/>`; })();
    const ct = at(o, cu, vB, zs + 30);
    g += `<g id="${p}-btn-${i}">${cap}<ellipse id="${p}-btn-${i}-fl" cx="${f(ct[0])}" cy="${f(ct[1] + 4)}" rx="34" ry="20" fill="#ffffff" opacity="0"/></g>`;
    btnTop[i] = ct;
    // init lamp
    if (opts.lamps) { const lp = A(cu + 40, sB + 30, 1); g += ledSvg(`${p}-lamp-${i}`, lp[0], lp[1], 4.5, "off"); }
    // welded steel plate
    {
      const pm = { f: "#9aa0a8", s: "#7d838b", t: "#b8bdc3", st: "#3b3f45" };
      let pl = "";
      for (const [x, ss] of [[cu + 34, sB - 34], [cu - 34, sB - 34], [cu + 34, sB + 34], [cu - 34, sB + 34]]) pl += sbox(x - 4, x + 4, ss - 4, ss + 4, 0, 38, { f: "#6d737b", s: "#565c63", t: "#868b93", st: "#2b2e33" }, 1);
      pl += sbox(cu - 42, cu + 42, sB - 42, sB + 42, 38, 46, pm, 1.6);
      pl += `<g transform="${slopeM(cu - 42, sB - 42, 46)}">` + [[8, 8], [76, 8], [8, 76], [76, 76]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#d4d7db" stroke="#3b3f45" stroke-width="1.2"/>`).join("") +
        `<path d="M14 42H70M14 50H70" stroke="#878d95" stroke-width="2"/></g>`;
      // weld beads at the posts' feet
      for (const [x, ss] of [[cu - 34, sB + 34], [cu + 34, sB + 34]]) { const q = A(x, ss + 5, 1); pl += `<ellipse cx="${f(q[0])}" cy="${f(q[1])}" rx="9" ry="4" fill="#6b4a32" opacity="0.55"/>`; }
      g += `<g id="${p}-plate-${i}" opacity="${guard === "plate" ? 1 : 0}">${pl}</g>`;
    }
    // hinged glass cover (rotator recomputed at runtime)
    {
      const H = A(cu, sH, 0), B = [U, Sv, Nv], a0 = b.open ?? 0;
      const ps = coverPolys(H, B, cw, cl, ch, a0);
      const hingeL = A(cu - cw / 2, sH, 0), hingeR = A(cu + cw / 2, sH, 0);
      let cv = `<line x1="${f(hingeL[0])}" y1="${f(hingeL[1])}" x2="${f(hingeR[0])}" y2="${f(hingeR[1])}" stroke="#4b4f56" stroke-width="8" stroke-linecap="round"/><line x1="${f(hingeL[0])}" y1="${f(hingeL[1]) - 1.5}" x2="${f(hingeR[0])}" y2="${f(hingeR[1]) - 1.5}" stroke="#d4d7db" stroke-width="3" stroke-linecap="round"/>`;
      cv += `<g id="${p}-cover-${i}" data-hx="${r2(H[0])}" data-hy="${r2(H[1])}" data-b="${[U[0], U[1], Sv[0], Sv[1], Nv[0], Nv[1]].map(f4).join(",")}" data-w="${cw}" data-l="${cl}" data-h="${ch}" data-a="${a0}">` +
        ps.map((q, k) => `<polygon id="${p}-cover-${i}-f${k}" points="${pts(q)}" fill="${COVER_GLASS[k]}" stroke="rgba(42,140,175,0.9)" stroke-width="${k === 5 ? 1.2 : 1.8}" stroke-linejoin="round"/>`).join("") + `</g>`;
      g += `<g id="${p}-guard-${i}" opacity="${guard === "card" ? 1 : 0}">${cv}</g>`;
      covers[i] = A(cu, sB, ch + 6);
    }
    topItems += g;
    // reader on the front face
    {
      const zr0 = zF - 48, zr1 = zF - 6, rm = { f: "#2f3338", s: "#1e2125", t: "#41464c", st: "#0f1113" };
      let rd = box(o, cu - 24, cu + 24, v1, v1 + 11, zr0, zr1, rm, 1.4);
      rd += G_(faceV(o, cu - 24, v1 + 11, zr1), `<rect x="4" y="4" width="40" height="34" rx="3" fill="#15181b" stroke="#3b3f45" stroke-width="1"/>
        <rect x="8" y="9" width="32" height="4" rx="2" fill="#000000" stroke="#55606a" stroke-width="0.8"/>
        <path d="M11 22h12M11 27h9M11 32h12" stroke="#4b5560" stroke-width="1.6" stroke-linecap="round"/>` + ledSvg(`${p}-rd-${i}`, 35, 28, 4, b.rd ?? "off") +
        `<rect x="${8}" y="${9}" width="32" height="4" rx="2" fill="none" stroke="#5cc0e0" stroke-width="1.6" opacity="0" id="${p}-rs-${i}"/>`);
      frontItems += `<g id="${p}-rdr-${i}" opacity="${guard === "card" ? 1 : 0}">${rd}</g>`;
      readers[i] = at(o, cu + 11, v1 + 11, zF - 34); slots[i] = at(o, cu, v1 + 11, zF - 15);
      plates[i] = at(o, cu, v1, zF - 63);
      // dashed empty slot (missing guard)
      const ps = coverPolys(A(cu, sH, 0), [U, Sv, Nv], cw, cl, ch, 0);
      const d = ps.slice(0, 5).map((q) => `M${q.map(P).join("L")}Z`).join("") + edges(o, cu - 24, cu + 24, v1, v1 + 11, zr0, zr1);
      gaps += `<path id="${p}-gap-${i}" d="${d}" fill="rgba(224,69,58,0.06)" stroke="#e0453a" stroke-width="2.6" stroke-dasharray="8 6" stroke-linejoin="round" stroke-linecap="round" opacity="${guard === "broken" ? 1 : 0}"/>`;
    }
  }
  s += chromeGrad(p + "-chr", false) + topItems + frontItems + gaps;
  const anchors = {
    top: at(o, 0, v0, zB + 90), center: at(o, 0, 0, zB * 0.6), ground: at(o), front: at(o, 0, v1, zF / 2),
    btns: btnTop, readers, slots, plates, covers,
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0, u1, v0, v1, 0, zB + 22]], center: anchors.center, badgeR: 34, glowR: W * 0.7 }), anchors };
}

// =====================================================================================
// 角色门卡挂板 roleBoard
// =====================================================================================
const personIcon = (x, y, k, col) => `<circle cx="${x}" cy="${y - 9 * k}" r="${5.5 * k}" fill="${col}"/><path d="M${x - 9 * k} ${y + 8 * k}C${x - 9 * k} ${y - 2 * k} ${x + 9 * k} ${y - 2 * k} ${x + 9 * k} ${y + 8 * k}Z" fill="${col}"/>`;
function holderIcon(kind, x, y) {
  if (kind === "multisig") return personIcon(x - 20, y + 4, 1, "#3b3e44") + personIcon(x + 20, y + 4, 1, "#3b3e44") + personIcon(x, y, 1.15, "#1c1c1c") +
    `<rect x="${x - 30}" y="${y + 15}" width="60" height="5" rx="2.5" fill="#1d93ba"/>`;
  if (kind === "bot") return `<line x1="${x + 8}" y1="${y - 6}" x2="${x + 14}" y2="${y - 22}" stroke="#3b3e44" stroke-width="2.4"/><circle cx="${x + 14}" cy="${y - 23}" r="3" fill="#2bd46f"/>
    <path d="M${x + 6} ${y - 28}A10 10 0 0 1 ${x + 22} ${y - 28}" fill="none" stroke="#1d93ba" stroke-width="1.8"/>
    <rect x="${x - 20}" y="${y - 8}" width="40" height="26" rx="5" fill="#eef1f3" stroke="#5d636b" stroke-width="1.8"/><rect x="${x - 14}" y="${y - 3}" width="28" height="10" rx="2" fill="#1d2024"/>
    <circle cx="${x - 7}" cy="${y + 2}" r="2.2" fill="#5cc0e0"/><circle cx="${x + 7}" cy="${y + 2}" r="2.2" fill="#5cc0e0"/><path d="M${x - 10} ${y + 12}h20" stroke="#9aa0a8" stroke-width="2"/>`;
  if (kind === "contract") return `<rect x="${x - 20}" y="${y - 10}" width="40" height="30" rx="4" fill="#eef1f3" stroke="#5d636b" stroke-width="1.8"/>
    <path d="${gearD(x - 4, y - 14, 8, 8, 3)}" fill="#3aa9cf" stroke="#155e77" stroke-width="1.2"/><path d="${gearD(x + 10, y - 13, 5, 6, 2.4)}" fill="#3aa9cf" stroke="#155e77" stroke-width="1.2"/>
    <rect x="${x - 14}" y="${y - 2}" width="20" height="8" rx="1.5" fill="#1d2024"/><rect x="${x - 14}" y="${y + 10}" width="28" height="3" rx="1.5" fill="#9aa0a8"/>`;
  if (kind === "person") return personIcon(x, y, 1.3, "#3b3e44");
  return "";
}
/** a brass key drawn hanging (bow up) in a vertical board plane; local units, origin at bow centre */
const hangingKey = (k, fill, st, hi) => `<g transform="rotate(90) scale(${k})"><circle cx="0" cy="0" r="30" fill="${fill}" stroke="${st}" stroke-width="${2 / k}"/><circle cx="-12" cy="0" r="9" fill="#d9dcdf" stroke="${st}" stroke-width="${1.6 / k}"/>
  <path d="M26 -8H128V8H118V20H108V8H98V16H88V8H26Z" fill="${fill}" stroke="${st}" stroke-width="${2 / k}" stroke-linejoin="round"/>
  <path d="M-18 -22A30 30 0 0 1 14 -27" fill="none" stroke="${hi}" stroke-width="4" stroke-linecap="round"/><rect x="34" y="-3" width="84" height="3" rx="1.5" fill="${hi}"/></g>`;
/**
 * roleBoard(o, {hooks, roles, holders, delays, plates, empty, title, group, groupText, stale, staleText})
 *   默认 4 钩角色模式：卡 UPGRADER / PARAM_ADMIN / PAUSER / MINTER，持有者 multisig|bot|contract|person|null，延迟标签。
 *   hooks>4 或 mode:"keys"：钥匙板（Ronin），每钩挂黄铜钥匙；group:[0,1,2,3] 墨色半透明框；stale:i 褪色便签。
 * 可动：ID-card-i（门卡，KITX05.hang）、ID-key-i（钥匙）、ID-hold-i、ID-tag-i、ID-grp（框 + 框内钥匙，KITX05.fly 整组抓走）、
 *       ID-grpf（框本身，KITX05.fade）、ID-note（便签）
 * anchors: top, center, ground, hooks[i], cards[i]（卡/钥匙中心）, holders[i], tags[i], group（框上沿中点）, note
 */
export function roleBoard(o, opts = {}) {
  const p = opts.id ?? "rb";
  const n = opts.hooks ?? 4, keys = opts.mode === "keys" || n > 4;
  const colW = keys ? 66 : 112, Wb = n * colW + (keys ? 40 : 24), Hb = keys ? 240 : 272, zb0 = 54, zb1 = zb0 + Hb;
  const bu0 = -Wb / 2, bu1 = Wb / 2;
  const frameM = { f: "#5d636b", s: "#474c53", t: "#7a8088", st: "#25282c" };
  const roles = opts.roles ?? ["upgrader", "param", "pauser", "minter"];
  const holders = opts.holders ?? ["multisig", "multisig", "bot", "contract"];
  const delays = opts.delays ?? ["≥48h 示例", "24h 示例", "无延迟", "—"];
  const empty = new Set(opts.empty ?? []);
  let s = contactShadow(o, Wb * 0.6, 70);
  // feet + legs
  for (const x of [bu0 + 40, bu1 - 40]) {
    s += box(o, x - 10, x + 10, -60, 44, 0, 10, M.ink, 1.2);
    s += box(o, x - 7, x + 7, -14, -2, 10, zb0 + 30, frameM, 1.2);
  }
  // board slab with frame
  s += box(o, bu0 - 10, bu1 + 10, -12, 0, zb0 - 10, zb1 + 10, frameM, 1.8);
  const cx = (i) => (keys ? 20 : 12) + colW * (i + 0.5); // local x on the face
  let face = `<defs><pattern id="${p}-peg" patternUnits="userSpaceOnUse" width="16" height="16"><circle cx="8" cy="8" r="1.9" fill="#9aa0a8"/><circle cx="8.5" cy="8.6" r="1.9" fill="#f2f3f4" opacity="0.5"/></pattern></defs>
    <rect x="0" y="0" width="${Wb}" height="${Hb}" fill="#d6d9dd"/><rect x="0" y="0" width="${Wb}" height="${Hb}" fill="url(#${p}-peg)"/>
    <rect x="0" y="0" width="${Wb}" height="${Hb}" fill="none" stroke="#9aa0a8" stroke-width="2"/>
    <rect x="0" y="0" width="${Wb}" height="26" fill="#2b2e33"/>` +
    txt(14, 18.5, opts.title ?? (keys ? "VALIDATOR KEYS" : "ACCESS ROLES"), { size: 13, mono: true, weight: 700, fill: "#9ad9ee" });
  const plateY = 34, hookY = keys ? 66 : 70;
  for (let i = 0; i < n; i++) {
    const x = cx(i), label = opts.plates?.[i] ?? (keys ? String(i + 1) : ROLES[roles[i]]?.t ?? String(roles[i] ?? "").toUpperCase());
    const pw = keys ? 30 : Math.min(colW - 10, tw(label, 13, true) + 14);
    face += `<rect x="${x - pw / 2}" y="${plateY}" width="${pw}" height="20" rx="3" fill="#f6f3ec" stroke="#5d636b" stroke-width="1.4"/>` +
      txt(x, plateY + 15, label, { size: 13, mono: true, anchor: "middle", weight: 800 });
    face += `<circle cx="${x}" cy="${hookY}" r="5" fill="#5d636b"/>`;
    if (!keys && holders[i]) {
      face += `<rect x="${x - colW / 2 + 8}" y="150" width="${colW - 16}" height="60" rx="6" fill="#f6f3ec" stroke="#b8b0a1" stroke-width="1.4"/>`;
    }
  }
  s += G_(faceV(o, bu0, 0, zb1), face);
  // hooks (3D chrome pegs)
  const hookW = [], cards = [], holdA = [], tagA = [];
  let items = "";
  for (let i = 0; i < n; i++) {
    const uc = bu0 + cx(i), zh = zb1 - hookY;
    hookW[i] = at(o, uc, 16, zh);
    items += line3(o, [[uc, 0, zh], [uc, 15, zh], [uc, 19, zh + 7]], "#3b3f45", 6) + line3(o, [[uc, 0, zh], [uc, 15, zh], [uc, 19, zh + 7]], "#d4d7db", 2.6);
  }
  if (!keys) {
    for (let i = 0; i < n; i++) {
      const uc = bu0 + cx(i), zh = zb1 - hookY, R = roleOf(roles[i] ?? "upgrader", { color: opts.colors?.[i] });
      const k = 1.2, W = 64 * k, H = 46, zt = zh - 12;
      let c = G_(faceV(o, uc - W / 2, 10, zh + 4), `<path d="M${W / 2 - 4} 0L${W / 2 - 3} 18M${W / 2 + 4} 0L${W / 2 + 3} 18" stroke="${darken(R.band, 0.15)}" stroke-width="2.6" stroke-linecap="round"/>`);
      c += box(o, uc - W / 2, uc + W / 2, 6, 10, zt - 40 * k, zt, { f: "#e9e5dc", s: "#d6d0c4", t: "#f4f1ea", st: "#8f887c" }, 1);
      c += G_(faceV(o, uc - W / 2, 10, zt), `<g transform="scale(${k})">${cardFace(`${p}-c${i}`, { band: R.band, text: R.text, blank: opts.blank?.[i] })}</g>`);
      items += `<g id="${p}-card-${i}" opacity="${empty.has(i) || roles[i] == null ? 0 : 1}">${c}</g>`;
      cards[i] = at(o, uc, 10, zt - 20 * k);
      void H;
      // holder icon + shelf lip
      if (holders[i]) {
        const zH = zb1 - 150;
        let h = G_(faceV(o, uc - colW / 2, 1, zH), holderIcon(holders[i], colW / 2, 32));
        h += box(o, uc - colW / 2 + 8, uc + colW / 2 - 8, 0, 8, zH - 64, zH - 58, { f: "#c3c7cc", s: "#a3a9b1", t: "#dde0e4", st: "#5a6068" }, 1);
        items += `<g id="${p}-hold-${i}">${h}</g>`;
        holdA[i] = at(o, uc, 4, zH - 30);
      }
      // delay tag
      if (delays[i]) {
        const zT = zb1 - 220, tw0 = Math.min(colW - 8, tw(delays[i], 14) + 22);
        const tg = G_(faceV(o, uc - tw0 / 2, 4, zT), `<path d="M8 0H${tw0}V28H8L0 14Z" fill="#ffffff" stroke="#2aa3c9" stroke-width="2" stroke-linejoin="round"/><circle cx="8" cy="14" r="2.6" fill="#2aa3c9"/>` +
          txt(tw0 / 2 + 4, 19.5, delays[i], { size: 14, anchor: "middle", weight: 800, fill: "#17809f" }));
        items += `<g id="${p}-tag-${i}">${tg}</g>`;
        tagA[i] = at(o, uc, 4, zT - 14);
      }
    }
  } else {
    const grp = new Set(opts.group ?? []), stale = opts.stale ?? (opts.group ? [...Array(n).keys()].find((i) => !grp.has(i)) : undefined);
    let inG = "", outG = "";
    for (let i = 0; i < n; i++) {
      const uc = bu0 + cx(i), zh = zb1 - hookY, kk = 0.42;
      const kf = (fill) => hangingKey(kk, fill, brass.st, brass.t);
      let c = `<g transform="translate(${f(2.5 * U[0])},${f(2.5 * U[1])})">${G_(faceV(o, uc, 7, zh - 4), kf(brass.s))}</g>` + G_(faceV(o, uc, 9, zh - 4), kf(brass.f));
      const g = `<g id="${p}-key-${i}" opacity="${empty.has(i) ? 0 : 1}">${c}</g>`;
      if (grp.has(i)) inG += g; else outG += g;
      cards[i] = at(o, uc, 9, zh - 40);
    }
    items += outG;
    let gsvg = "";
    if (grp.size) {
      const gi = [...grp].sort((a, b) => a - b), x0 = cx(gi[0]) - colW / 2 + 4, x1 = cx(gi[gi.length - 1]) + colW / 2 - 4;
      const gt = opts.groupText ?? "同一机构", gtw = tw(gt, 15) + 20;
      const fr = G_(faceV(o, bu0 + x0, 24, zb1 - 44), `<rect x="0" y="0" width="${x1 - x0}" height="${Hb - 62}" rx="12" fill="rgba(28,28,28,0.10)" stroke="#1c1c1c" stroke-width="3.5" stroke-dasharray="${opts.groupDash ?? "none"}"/>
        <rect x="10" y="-14" width="${gtw}" height="26" rx="6" fill="#1c1c1c"/>` + txt(10 + gtw / 2, 5, gt, { size: 15, anchor: "middle", weight: 800, fill: "#ffffff" }));
      gsvg = `<g id="${p}-grp"><g id="${p}-grpf" opacity="${opts.groupOn === false ? 0 : 1}">${fr}</g>${inG}</g>`;
      items += gsvg;
    }
    if (stale != null && stale < n) {
      const x = cx(stale), st = opts.staleText ?? ["未撤销", "的授权"];
      const nt = G_(faceV(o, bu0 + x - 28, 12, zb1 - 160), `<g transform="rotate(-5 28 26)"><rect x="2" y="3" width="56" height="52" fill="rgba(0,0,0,0.12)"/><rect x="0" y="0" width="56" height="52" fill="#ece6d4" stroke="#c9c0a8" stroke-width="1"/>
        <rect x="16" y="-6" width="24" height="10" fill="rgba(200,210,215,0.7)"/>` + txt(28, 22, st[0], { size: 12, anchor: "middle", weight: 700, fill: "#8a8478" }) + txt(28, 38, st[1] ?? "", { size: 12, anchor: "middle", weight: 700, fill: "#8a8478" }) + `</g>`);
      items += `<g id="${p}-note" opacity="${opts.noteOn === false ? 0 : 0.92}">${nt}</g>`;
    }
  }
  s += items;
  const anchors = {
    top: at(o, 0, 0, zb1 + 40), center: at(o, 0, 0, (zb0 + zb1) / 2), ground: at(o), hooks: hookW, cards, holders: holdA, tags: tagA,
  };
  if (keys && opts.group?.length) { const gi = [...opts.group].sort((a, b) => a - b); anchors.group = at(o, bu0 + (cx(gi[0]) + cx(gi[gi.length - 1])) / 2, 24, zb1 - 30); }
  if (keys) { const st = opts.stale ?? (opts.group ? [...Array(n).keys()].find((i) => !(opts.group ?? []).includes(i)) : undefined); if (st != null) anchors.note = at(o, bu0 + cx(st), 12, zb1 - 186); }
  return { svg: shell(p, o, opts, { solid: s, wire: [[bu0 - 10, bu1 + 10, -12, 0, zb0 - 10, zb1 + 10]], center: anchors.center, badgeR: 36 }), anchors };
}

// =====================================================================================
// TRON 账户门禁柜 accountSafe
// =====================================================================================
const COINM = { f: "#45b6d9", s: "#2b95b8", t: "#93d8ee", st: "#17708d" };
/** key in local frame: x outward along +v from the tip, bow at x≈52; tip at 0 */
const keyLocal = (p, blX0) => `<rect id="${p}-bl" x="${f(blX0)}" y="-3.5" width="${f(Math.max(0, 34 - blX0))}" height="7" rx="1.5" fill="${brass.s}" stroke="${brass.st}" stroke-width="1.2"/>
  <rect x="32" y="-6" width="6" height="12" rx="1.5" fill="${brass.f}" stroke="${brass.st}" stroke-width="1.2"/>
  <circle cx="54" cy="0" r="16" fill="${brass.f}" stroke="${brass.st}" stroke-width="1.6"/><circle cx="58" cy="0" r="5.5" fill="#efebe3" stroke="${brass.st}" stroke-width="1.2"/>
  <path d="M42 -10A16 16 0 0 1 60 -15" fill="none" stroke="${brass.t}" stroke-width="2.6" stroke-linecap="round"/>`;
/**
 * accountSafe(o, {keys, inserted, owners, open, coins, gate})
 *   keys: {owner:[2,1,1], active:[1,1], witness:[1]}（每个钥匙孔的权重；0/null = 空孔）
 *   inserted: true | false | ["owner-0","active-1",…]（初始插入的钥匙；未插入的钥匙隐藏）
 *   owners: "attacker" → Owner、Active 锁芯一开始就是红色（柜体不变色）
 *   open: 柜门角度（0 关，105 全开，KIT.door 驱动）；gate: true 出口挡板一开始就落下
 * 可动：ID-door（KIT.door）；ID-core-{owner|active|witness} / ID-core-…-atk（KIT.swap 或 KITX05.cores）；
 *       ID-ring-{dial}（锁盘高亮环，KITX05.ring）；ID-k-{dial}-{j}（钥匙，KITX05.keyIn / keyTurn / keyOut）；
 *       ID-gate（出口挡板，KITX05.gate）、ID-out-led；ID-in-glow、ID-coin-0..2（投币，KITX05.coinIn）；ID-outc（出口硬币，KITX05.coinOut）
 * anchors: top, center, ground, front, dials{owner,active,witness}, plates{…}, keyholes{"owner-0":…}, inSlot, out, window, cavity, core
 */
export function accountSafe(o, opts = {}) {
  const p = opts.id ?? "acct";
  const W = 500, D = 210, H = 292, zf = 12;
  const u0 = -W / 2, u1 = W / 2, v0 = -D / 2, v1 = D / 2, zT = zf + H;
  const body = { f: "#7d929c", s: "#62767f", t: "#9db0b8", st: "#26343a" };
  const doorM = { f: "#859aa4", s: "#6d828b", t: "#a2b4bc", st: "#26343a" };
  const keysW = opts.keys ?? { owner: [2, 1, 1], active: [1, 1], witness: [1] };
  const insAll = opts.inserted === true, insSet = new Set(Array.isArray(opts.inserted) ? opts.inserted : []);
  const atkCore = opts.owners === "attacker";
  let s = contactShadow(o, W * 0.68, D * 0.8);
  for (const [a, b] of [[u1 - 40, v0 + 12], [u0 + 14, v0 + 12], [u1 - 40, v1 - 38], [u0 + 14, v1 - 38]]) s += box(o, a, a + 26, b, b + 26, 0, zf, M.ink, 1.2);
  s += rbox(o, u0, u1, v0, v1, zf, zT, 16, body, { sw: 2 });
  s += rbox(o, u0 + 10, u1 - 10, v0 + 10, v1 - 10, zT, zT + 5, 10, { ...body, f: lighten(body.f, 0.08), t: lighten(body.t, 0.1) }, { sw: 1.4 });
  // −u side seam + rivets + "TRON ACCOUNT" plate
  s += G_(faceU(o, u0, v0 + 18, zT - 14), `<rect x="0" y="0" width="${D - 36}" height="${H - 28}" rx="8" fill="none" stroke="${darken(body.f, 0.18)}" stroke-width="2"/>` +
    [0, 1, 2, 3].map((i) => `<circle cx="${10 + (i % 2) * (D - 56)}" cy="${10 + Math.floor(i / 2) * (H - 48)}" r="3" fill="${lighten(body.f, 0.2)}"/>`).join("") +
    `<rect x="${(D - 36) / 2 - 56}" y="30" width="112" height="24" rx="4" fill="#dfe5e8" stroke="#4b5a61" stroke-width="1.4"/>` + txt((D - 36) / 2, 47, "TRON ACCOUNT", { size: 13, mono: true, anchor: "middle", weight: 800, fill: "#26343a" }));

  // ---- top: coin-in slot
  const inU = u1 - 92, inV = v0 + 74;
  s += G_(faceTop(o, inU - 46, inV - 22, zT + 5), `<rect x="0" y="0" width="92" height="44" rx="8" fill="url(#${p}-chr)" stroke="#4b4f56" stroke-width="1.6"/>
    <rect x="14" y="17" width="64" height="10" rx="5" fill="#15171a"/><rect id="${p}-in-glow" x="11" y="14" width="70" height="16" rx="8" fill="none" stroke="#2aa3c9" stroke-width="3" opacity="0"/>`);
  s += G_(faceV(o, inU - 46, inV + 22, zT + 5), `<rect x="0" y="0" width="92" height="3" fill="#7d828a"/>`);
  // label tab "IN"
  s += G_(faceTop(o, inU - 46, inV + 26, zT + 5), `<rect x="0" y="0" width="34" height="18" rx="3" fill="#1d93ba"/>` + txt(17, 13.5, "IN", { size: 12, mono: true, anchor: "middle", weight: 800, fill: "#ffffff" }));

  // ---- front face: dial band recess
  const zc = zT - 82, bandTop = zT - 10, bandBot = zT - 132;
  s += G_(faceV(o, u0 + 12, v1, bandTop), `<rect x="0" y="0" width="${W - 24}" height="${bandTop - bandBot}" rx="10" fill="${darken(body.s, 0.22)}" stroke="${body.st}" stroke-width="1.6"/>
    <rect x="4" y="4" width="${W - 32}" height="${bandTop - bandBot - 8}" rx="8" fill="none" stroke="${lighten(body.s, 0.12)}" stroke-width="1.2"/>`);
  const DIALS = [
    { k: "owner", name: "Owner", R: 36, du: u0 + 60, gold: true },
    { k: "active", name: "Active", R: 27, du: u0 + 252, gold: false },
    { k: "witness", name: "Witness", R: 27, du: u0 + 404, gold: false },
  ];
  const dialsA = {}, platesA = {}, holesA = {};
  let keySvg = "";
  for (const d of DIALS) {
    const R = d.R, rim = d.gold ? brass : { f: "#c3c7cc", s: "#a3a9b1", t: "#e3e6e9", st: "#5a6068" };
    let ticks = "";
    for (let i = 0; i < 24; i++) { const a = (i / 24) * 2 * Math.PI, r0 = i % 6 ? R - 5 : R - 9; ticks += `M${f(r0 * Math.cos(a))} ${f(r0 * Math.sin(a))}L${f((R - 2) * Math.cos(a))} ${f((R - 2) * Math.sin(a))}`; }
    const core = (c1, c2, st) => `<circle cx="0" cy="0" r="${f(R * 0.5)}" fill="${c1}" stroke="${st}" stroke-width="2"/><circle cx="-2" cy="-2" r="${f(R * 0.36)}" fill="${c2}"/>
      <path d="M-2.5 ${f(-R * 0.3)}H2.5V${f(R * 0.12)}L5 ${f(R * 0.3)}H-5L-2.5 ${f(R * 0.12)}Z" fill="#14171a"/>`;
    let dg = `<circle cx="3" cy="4" r="${R + 8}" fill="rgba(0,0,0,0.28)"/>
      <circle cx="0" cy="0" r="${R + 8}" fill="${rim.f}" stroke="${rim.st}" stroke-width="2"/>
      <path d="M${-(R + 5) * 0.7} ${-(R + 5) * 0.7}A${R + 5} ${R + 5} 0 0 1 ${(R + 5) * 0.7} ${-(R + 5) * 0.7}" fill="none" stroke="${rim.t}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="${R}" fill="#262a2f" stroke="#111316" stroke-width="1.6"/><path d="${ticks}" stroke="#c9ced3" stroke-width="1.6"/>
      <g id="${p}-core-${d.k}" opacity="${atkCore && d.k !== "witness" ? 0 : 1}">${core("#5cc0e0", "#9ad9ee", "#1f7896")}</g>
      <g id="${p}-core-${d.k}-atk" opacity="${atkCore && d.k !== "witness" ? 1 : 0}">${core("#e8574c", "#f08a80", "#8f2620")}</g>
      <circle id="${p}-ring-${d.k}" cx="0" cy="0" r="${R + 14}" fill="none" stroke="#2aa3c9" stroke-width="5" opacity="0"/>`;
    s += G_(`${faceV(o, d.du, v1, zc)}`, dg);
    // nameplate above
    const pw = tw(d.name, 15, true) + 20;
    s += G_(faceV(o, d.du - pw / 2, v1, zc + R + 32), `<rect x="0" y="0" width="${pw}" height="21" rx="3" fill="${d.gold ? "#fbf3dc" : "#eef1f3"}" stroke="${d.gold ? brass.st : "#4b5a61"}" stroke-width="1.6"/>` +
      txt(pw / 2, 15.5, d.name, { size: 15, mono: true, anchor: "middle", weight: 800, fill: "#1c1c1c" }));
    dialsA[d.k] = at(o, d.du, v1, zc); platesA[d.k] = at(o, d.du, v1, zc + R + 22);
    // keyholes
    const ws = keysW[d.k] ?? [];
    ws.forEach((w, j) => {
      const ku = d.du + R + 30 + j * 27, kz = zc + 6;
      s += G_(faceV(o, ku, v1, kz), `<circle cx="1.5" cy="2" r="11" fill="rgba(0,0,0,0.25)"/><circle cx="0" cy="0" r="11" fill="url(#${p}-chr)" stroke="#4b4f56" stroke-width="1.4"/>
        <circle cx="0" cy="-2" r="3.4" fill="#15171a"/><path d="M-1.8 -1H1.8L2.6 6H-2.6Z" fill="#15171a"/>`);
      const id = `${p}-k-${d.k}-${j}`;
      holesA[`${d.k}-${j}`] = at(o, ku, v1, kz);
      if (!w) return;
      const ins = insAll || insSet.has(`${d.k}-${j}`) ? 1 : 0;
      const [kx, ky] = at(o, ku, v1, kz);
      const off = -30 * ins + (1 - ins) * 46;
      const ox = kx + off * V[0], oy = ky + off * V[1];
      const blX0 = Math.max(0, -off);
      const tagP = [kx + (off + 35) * V[0], ky + (off + 35) * V[1]];
      keySvg += `<g id="${id}" data-kx="${r2(kx)}" data-ky="${r2(ky)}" data-ins="${ins}" data-a="0" opacity="${ins}">
        <g id="${id}-tag" transform="matrix(${f4(U[0])},${f4(U[1])},0,${f4(CE)},${r2(tagP[0])},${r2(tagP[1])})"><path d="M0 0V9" stroke="#8f887c" stroke-width="1.6"/>
          <circle cx="0" cy="20" r="11.5" fill="#1d93ba" stroke="#ffffff" stroke-width="2"/>${txt(0, 25.5, w, { size: 15, anchor: "middle", weight: 900, fill: "#ffffff" })}</g>
        <g id="${id}-kb" transform="matrix(${f4(V[0])},${f4(V[1])},0,${f4(CE)},${r2(ox)},${r2(oy)})">${keyLocal(id, blX0)}</g></g>`;
    });
  }

  // ---- door (lower-left), same DOM as kit safe so KIT.door drives it
  const ui0 = u0 + 176, ui1 = u1 - 22, zi0 = zf + 20, zi1 = bandBot - 14, dw = ui1 - ui0, dh = zi1 - zi0, T = 16, vb = v0 + 30;
  s += G_(faceV(o, ui0 - 6, v1, zi1 + 6), `<rect x="0" y="0" width="${dw + 12}" height="${dh + 12}" rx="6" fill="${darken(body.s, 0.3)}" stroke="${body.st}" stroke-width="2"/>`);
  const op = [at(o, ui0, v1, zi0), at(o, ui1, v1, zi0), at(o, ui1, v1, zi1), at(o, ui0, v1, zi1)];
  let cav = `<polygon points="${pts([at(o, ui0, vb, zi0), at(o, ui1, vb, zi0), at(o, ui1, vb, zi1), at(o, ui0, vb, zi1)])}" fill="#2a3034"/>`;
  cav += `<polygon points="${pts([at(o, ui1, vb, zi0), at(o, ui1, v1, zi0), at(o, ui1, v1, zi1), at(o, ui1, vb, zi1)])}" fill="#3a4247"/>`;
  cav += `<polygon points="${pts([at(o, ui0, vb, zi0), at(o, ui1, vb, zi0), at(o, ui1, v1, zi0), at(o, ui0, v1, zi0)])}" fill="#4b555b"/>`;
  const stacks = opts.coins ?? [7, 9, 6, 8, 5];
  const coinStack = (du, dv, nn) => { let c = ""; for (let k = 0; k < nn; k++) c += cyl(o, du, dv, 15, zi0 + k * 6, zi0 + k * 6 + 6, COINM, { sw: 1, seg: 16 }); return c; };
  [[ui0 + 40, v1 - 80], [ui0 + 84, v1 - 86], [ui0 + 128, v1 - 80], [ui0 + 172, v1 - 86], [ui0 + 62, v1 - 44], [ui0 + 108, v1 - 46], [ui0 + 154, v1 - 44], [ui0 + 216, v1 - 82], [ui0 + 200, v1 - 44], [ui0 + 246, v1 - 46]]
    .forEach(([du, dv], k) => { cav += coinStack(du, dv, stacks[k % stacks.length]); });
  s += `<defs><clipPath id="${p}-cav-c"><polygon points="${pts(op)}"/></clipPath></defs><g id="${p}-cav" clip-path="url(#${p}-cav-c)">${cav}</g>`;
  const deg = opts.open ?? 0, [hx, hy] = at(o, ui1, v1, zi1);
  const dState = (a) => {
    const r = a * DEG, du = -Math.cos(r), dv = Math.sin(r), nu = Math.sin(r), nv = Math.cos(r);
    const dS = [du * CA + dv * SA, -du * SA * SE + dv * CA * SE], nS = [nu * CA + nv * SA, -nu * SA * SE + nv * CA * SE];
    const F = [hx + dw * dS[0], hy + dw * dS[1]], I = [F[0] - T * nS[0], F[1] - T * nS[1]], Hn = [hx - T * nS[0], hy - T * nS[1]];
    return { out: [-dS[0], -dS[1], 0, CE, F[0], F[1]], inn: [dS[0], dS[1], 0, CE, Hn[0], Hn[1]], showOut: nS[1] > 0, F, I, Hn };
  };
  const ds = dState(deg), mm = (a) => `matrix(${a.map(r2).join(",")})`;
  // outer door: bevel panel, window with coins, handle bar, keyhole
  const wx = 26, wy = 22, ww = 120, wh = 62;
  let coinsWin = "";
  for (const [x0, nC] of [[18, 4], [44, 6], [70, 5], [96, 3]]) for (let k = 0; k < nC; k++) {
    const y = wh - 8 - k * 7;
    coinsWin += `<ellipse cx="${x0}" cy="${y + 3}" rx="12" ry="4.5" fill="${COINM.s}" stroke="${COINM.st}" stroke-width="1"/><ellipse cx="${x0}" cy="${y}" rx="12" ry="4.5" fill="${COINM.t}" stroke="${COINM.st}" stroke-width="1"/>`;
  }
  coinsWin += txt(44, wh - 8 - 6 * 7 + 4.5, "₮", { size: 9, anchor: "middle", weight: 900, fill: "#17708d" });
  const outer = `<rect x="0" y="0" width="${dw}" height="${dh}" rx="6" fill="${doorM.s}" stroke="${doorM.st}" stroke-width="2"/>
    <rect x="10" y="10" width="${dw - 20}" height="${dh - 20}" rx="5" fill="none" stroke="${lighten(doorM.s, 0.18)}" stroke-width="2.2"/>
    <rect x="${wx - 5}" y="${wy - 5}" width="${ww + 10}" height="${wh + 10}" rx="6" fill="#4b5a61" stroke="#26343a" stroke-width="1.6"/>
    <rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="3" fill="#20272b"/>
    <g transform="translate(${wx},${wy})"><rect x="0" y="${wh - 6}" width="${ww}" height="6" fill="#3a4247"/>${coinsWin}</g>
    <rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="3" fill="rgba(200,232,244,0.20)" stroke="#a9c3cc" stroke-width="1.4"/>
    <path d="M${wx + 10} ${wy + wh - 6}L${wx + 40} ${wy + 6}M${wx + 24} ${wy + wh - 6}L${wx + 50} ${wy + 6}" stroke="rgba(255,255,255,0.45)" stroke-width="5"/>
    <rect x="${wx + ww + 22}" y="${wy + 6}" width="54" height="16" rx="3" fill="#dfe5e8" stroke="#4b5a61" stroke-width="1.2"/>` +
    txt(wx + ww + 49, wy + 18, "USDT", { size: 11, mono: true, anchor: "middle", weight: 800, fill: "#26343a" }) +
    `<rect x="${wx + ww + 30}" y="${wy + 40}" width="38" height="12" rx="6" fill="url(#${p}-chr)" stroke="#3b3f45" stroke-width="1.4"/>
    <rect x="${wx + ww + 34}" y="${wy + 52}" width="6" height="16" rx="2" fill="#5d636b"/><rect x="${wx + ww + 58}" y="${wy + 52}" width="6" height="16" rx="2" fill="#5d636b"/>`;
  const innerPanel = `<rect x="0" y="0" width="${dw}" height="${dh}" rx="6" fill="#9aa9b0" stroke="#4b5a61" stroke-width="2"/>
    <rect x="10" y="10" width="${dw - 20}" height="${dh - 20}" rx="4" fill="#b3c0c6" stroke="#7d8d94" stroke-width="1.5"/>` +
    [dh * 0.3, dh * 0.7].map((by) => `<rect x="${dw * 0.5}" y="${by - 7}" width="${dw * 0.5 + 18}" height="14" rx="4" fill="#d9dcdf" stroke="#5d636b" stroke-width="1.6"/>`).join("");
  const P2 = (q) => `${r2(q[0])},${r2(q[1])}`, Hd = dh * CE, vis = deg > 1.5 ? 1 : 0;
  s += `<g id="${p}-door" data-hx="${r2(hx)}" data-hy="${r2(hy)}" data-w="${dw}" data-h="${dh}" data-t="${T}" data-a="${deg}">
    <polygon id="${p}-door-top" points="${[P2([hx, hy]), P2(ds.F), P2(ds.I), P2(ds.Hn)].join(" ")}" fill="${doorM.t}" stroke="${doorM.st}" stroke-width="1.6" stroke-linejoin="round" opacity="${vis}"/>
    <polygon id="${p}-door-edge" points="${[P2(ds.F), P2(ds.I), P2([ds.I[0], ds.I[1] + Hd]), P2([ds.F[0], ds.F[1] + Hd])].join(" ")}" fill="${doorM.f}" stroke="${doorM.st}" stroke-width="1.6" stroke-linejoin="round" opacity="${vis}"/>
    <g id="${p}-door-out" transform="${mm(ds.out)}" opacity="${ds.showOut ? 1 : 0}">${outer}</g>
    <g id="${p}-door-in" transform="${mm(ds.inn)}" opacity="${ds.showOut ? 0 : 1}">${innerPanel}</g></g>`;
  for (const zz of [zi1 - dh * 0.22, zi0 + dh * 0.22]) s += cyl(o, ui1 + 2, v1 + 2, 6, zz - 16, zz + 16, M.chrome, { sw: 1.2, seg: 16 });

  // ---- out chute (right of the door)
  const cu0 = u0 + 24, cu1 = u0 + 142, cz0 = zf + 34, cz1 = zf + 112, cwid = cu1 - cu0, chh = cz1 - cz0;
  s += G_(faceV(o, cu0 - 6, v1, cz1 + 30), `<rect x="0" y="0" width="${cwid + 12}" height="22" rx="3" fill="#dfe5e8" stroke="#4b5a61" stroke-width="1.4"/>` +
    txt(36, 16, "OUT", { size: 13, mono: true, anchor: "middle", weight: 800, fill: "#26343a" }) +
    `<g transform="translate(${cwid - 32},11) scale(0.16)">${`<circle cx="0" cy="0" r="30" fill="${brass.f}" stroke="${brass.st}" stroke-width="8"/><circle cx="-6" cy="0" r="11" fill="#efebe3"/><path d="M26 -8H128V8H118V20H108V8H98V16H88V8H26Z" fill="${brass.f}" stroke="${brass.st}" stroke-width="8"/>`}</g>` +
    ledSvg(`${p}-out-led`, cwid - 2, 11, 4.5, opts.gate ? "red" : "green"));
  s += G_(faceV(o, cu0 - 6, v1, cz1 + 6), `<rect x="0" y="0" width="${cwid + 12}" height="${chh + 12}" rx="5" fill="${darken(body.s, 0.3)}" stroke="${body.st}" stroke-width="1.6"/>`);
  const cop = [at(o, cu0, v1, cz0), at(o, cu1, v1, cz0), at(o, cu1, v1, cz1), at(o, cu0, v1, cz1)];
  let chute = `<polygon points="${pts(cop)}" fill="#1c2125"/>` + G_(faceV(o, cu0, v1, cz1), `<path d="M0 ${chh}L${cwid * 0.5} ${chh * 0.55}L${cwid} ${chh}Z" fill="#2c3338"/>`);
  const gateSvg = G_(faceV(o, cu0, v1 + 0.5, cz1), `<rect x="0" y="0" width="${cwid}" height="${chh}" fill="#8b979d" stroke="#3b4549" stroke-width="1.6"/>` +
    Array.from({ length: 6 }, (_, k) => `<rect x="2" y="${4 + k * 12.6}" width="${cwid - 4}" height="9" rx="2" fill="#a8b3b8" stroke="#5d686d" stroke-width="1"/>`).join("") +
    `<rect x="${cwid / 2 - 14}" y="${chh - 10}" width="28" height="7" rx="3" fill="#3b4549"/>`);
  const gdy = chh * CE;
  chute += `<g id="${p}-gate" data-dy="${f(gdy)}" transform="translate(0,${opts.gate ? 0 : f(-gdy)})">${gateSvg}</g>`;
  s += `<defs><clipPath id="${p}-ch-c"><polygon points="${pts(cop)}"/></clipPath></defs><g clip-path="url(#${p}-ch-c)">${chute}</g>`;
  // tray
  s += box(o, cu0 - 4, cu1 + 4, v1, v1 + 40, zf + 22, zf + 32, { f: "#a9b4b9", s: "#8b979d", t: "#c4cdd1", st: "#3b4549" }, 1.4);
  s += box(o, cu0 - 4, cu1 + 4, v1 + 34, v1 + 40, zf + 32, zf + 40, { f: "#a9b4b9", s: "#8b979d", t: "#c4cdd1", st: "#3b4549" }, 1.2);
  // coins sliding out (hidden until KITX05.coinOut)
  let outc = "";
  for (const [du, dv, zz] of [[cu0 + 30, v1 + 18, zf + 32], [cu0 + 62, v1 + 22, zf + 32], [cu0 + 46, v1 + 18, zf + 37]]) outc += cyl(o, du, dv, 13, zz, zz + 5, COINM, { sw: 1, seg: 22 });
  const outDx = 0, outDy = -40;
  s += `<g id="${p}-outc" data-dx="${outDx}" data-dy="${f(outDy)}" opacity="0">${outc}</g>`;
  // brand plate on the door band bottom
  s += keySvg;
  // coins above the in-slot (vertical discs), hidden until KITX05.coinIn
  let coinsIn = "";
  for (let k = 0; k < 3; k++) {
    const c = `<ellipse cx="0" cy="0" rx="16" ry="16" fill="${COINM.f}" stroke="${COINM.st}" stroke-width="1.6"/><circle cx="0" cy="0" r="11" fill="none" stroke="${COINM.t}" stroke-width="1.6"/>` + txt(0, 6, "₮", { size: 16, anchor: "middle", weight: 900, fill: "#ffffff" });
    const back = `<ellipse cx="0" cy="0" rx="16" ry="16" fill="${COINM.st}"/>`;
    coinsIn += `<g id="${p}-coin-${k}" data-dy="${f(150 * CE)}" opacity="0" transform="translate(0,0)">` +
      `<g transform="translate(${f(-3 * V[0])},${f(-3 * V[1])})">${G_(faceV(o, inU, inV, zT + 26), back)}</g>` + G_(faceV(o, inU, inV, zT + 26), c) + `</g>`;
  }
  s += coinsIn;
  s += chromeGrad(p + "-chr");
  const anchors = {
    top: at(o, 0, 0, zT + 80), center: at(o, 0, 0, zT / 2), ground: at(o), front: at(o, 0, v1, zT / 2),
    dials: dialsA, plates: platesA, keyholes: holesA, inSlot: at(o, inU, inV, zT + 5), out: at(o, (cu0 + cu1) / 2, v1 + 20, zf + 34),
    window: at(o, ui0 + wx + ww / 2, v1, zi1 - wy - wh / 2), cavity: at(o, (ui0 + ui1) / 2, v1 - 40, zi0 + 30), core: dialsA.owner,
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0, u1, v0, v1, 0, zT + 5]], center: anchors.center, badgeR: 36, glowR: W * 0.75 }), anchors };
}

// =====================================================================================
// 阈值刻度柱 thresholdMeter
// =====================================================================================
/**
 * thresholdMeter(o, {max, th, level, h, r, color, thText, pipe, pipeDir})
 *   玻璃量筒，max 格（默认 5），阈值线 th（默认 3，青蓝虚线），level 初始液位（格）
 *   pipe: 底部软管长度（沿 pipeDir 默认 "-u"，接到账户柜钥匙孔），0 不画
 * 可动：ID-liq（液柱，KITX05.fill(tl,ID,t,to)；液位 ≥ th 时 ID-lamp 自动变绿）、ID-lamp（顶灯）、ID-th（阈值线组）
 * anchors: top, center, ground, lamp, th（阈值线右端）, level(k) 不提供——用 levels[k]（第 k 格高度的右侧点）, pipeEnd
 */
export function thresholdMeter(o, opts = {}) {
  const p = opts.id ?? "tm", atk = isAtk(opts);
  const max = opts.max ?? 5, th = opts.th ?? 3, lv0 = Math.max(0, Math.min(max, opts.level ?? 0));
  const R = opts.r ?? 34, Ht = opts.h ?? 270, zb = 26, zt = zb + Ht, head = 22, uH = (Ht - head) / max;
  const liq = atk ? { a: "#f08a80", b: "#e0453a", c: "#a8322a" } : opts.color === "green" ? { a: "#86d6a8", b: "#2fae68", c: "#17804a" } : { a: "#9ad9ee", b: "#3aaed4", c: "#1d7f9f" };
  let s = "";
  // pipe to the safe
  if (opts.pipe) {
    const L = opts.pipe, dir = opts.pipeDir ?? "-u";
    const end = dir === "-u" ? [-R - L, 0] : dir === "-v" ? [0, -R - L] : dir === "+u" ? [R + L, 0] : [0, R + L];
    const pth = [[0, 0, 12], [end[0] * 0.5, end[1] * 0.5, 12], [end[0], end[1], 12], [end[0], end[1], 40]];
    s += line3(o, pth, "#2b2e33", 11) + line3(o, pth, "#5d636b", 6) + line3(o, pth, "#8b9199", 2, `stroke-dasharray="2 6"`);
  }
  s += contactShadow(o, 70, 48);
  s += cyl(o, 0, 0, R + 18, 0, 12, M.ink, { sw: 1.4 });
  s += cyl(o, 0, 0, R + 10, 12, zb, { f: "#8b9199", s: "#6d737b", t: "#a9aeb5", st: "#2b2e33" }, { sw: 1.4 });
  const [bx, by] = at(o, 0, 0, zb), [, ty] = at(o, 0, 0, zt), ry = R * 0.5;
  // glass: back wall
  s += `<path d="M${f(bx - R)} ${f(ty)}V${f(by)}A${R} ${f(ry)} 0 0 0 ${f(bx + R)} ${f(by)}V${f(ty)}A${R} ${f(ry)} 0 0 0 ${f(bx - R)} ${f(ty)}Z" fill="rgba(206,234,244,0.22)"/>
    <path d="M${f(bx - R)} ${f(ty)}A${R} ${f(ry)} 0 0 1 ${f(bx + R)} ${f(ty)}" fill="none" stroke="rgba(42,163,201,0.55)" stroke-width="1.6"/>`;
  // threshold back arc
  const yth = by - th * uH * CE;
  s += `<path d="M${f(bx - R)} ${f(yth)}A${R} ${f(ry)} 0 0 1 ${f(bx + R)} ${f(yth)}" fill="none" stroke="#2aa3c9" stroke-width="2.4" stroke-dasharray="6 5" opacity="0.55"/>`;
  // liquid (clipped from the top by a moving rect)
  const r = R - 4, yl0 = by - lv0 * uH * CE;
  let seg = "";
  for (let k = 1; k < max; k++) { const y = by - k * uH * CE; seg += `<path d="M${f(bx - r)} ${f(y)}A${r} ${f(r * 0.5)} 0 0 0 ${f(bx + r)} ${f(y)}" fill="none" stroke="${liq.a}" stroke-width="2" opacity="0.9"/>`; }
  s += `<defs><linearGradient id="${p}-lg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${liq.a}"/><stop offset="0.35" stop-color="${liq.b}"/><stop offset="1" stop-color="${liq.c}"/></linearGradient>
    <clipPath id="${p}-lc"><rect id="${p}-clip" x="${f(bx - R - 4)}" y="${f(yl0)}" width="${f(2 * R + 8)}" height="${f(by + ry + 6 - yl0)}"/></clipPath></defs>
    <g id="${p}-liq" data-bx="${f(bx)}" data-by="${f(by)}" data-uh="${f4(uH * CE)}" data-r="${r}" data-th="${th}" data-max="${max}" data-lv="${lv0}" data-ry="${f(ry)}">
      <g clip-path="url(#${p}-lc)"><path d="M${f(bx - r)} ${f(ty + 6)}V${f(by)}A${r} ${f(r * 0.5)} 0 0 0 ${f(bx + r)} ${f(by)}V${f(ty + 6)}Z" fill="url(#${p}-lg)"/>${seg}</g>
      <ellipse id="${p}-liq-top" cx="${f(bx)}" cy="${f(yl0)}" rx="${r}" ry="${f(r * 0.5)}" fill="${liq.a}" stroke="${liq.c}" stroke-width="1.2" opacity="${lv0 > 0.01 ? 1 : 0}"/></g>`;
  // front glass + highlights
  s += `<path d="M${f(bx - R)} ${f(ty)}V${f(by)}A${R} ${f(ry)} 0 0 0 ${f(bx + R)} ${f(by)}V${f(ty)}" fill="rgba(222,242,250,0.16)" stroke="rgba(42,140,175,0.85)" stroke-width="2"/>
    <rect x="${f(bx - R + 7)}" y="${f(ty + 10)}" width="6" height="${f(by - ty - 14)}" rx="3" fill="#ffffff" opacity="0.55"/>
    <rect x="${f(bx - R + 16)}" y="${f(ty + 14)}" width="2.5" height="${f(by - ty - 22)}" rx="1.2" fill="#ffffff" opacity="0.4"/>
    <rect x="${f(bx + R - 10)}" y="${f(ty + 10)}" width="3" height="${f(by - ty - 14)}" rx="1.5" fill="#ffffff" opacity="0.25"/>`;
  // scale ticks (left side, on the glass) + numerals
  let tk = "";
  for (let k = 0; k <= max * 2; k++) {
    const y = by - (k / 2) * uH * CE + 0.5 * R * 0.5 * 0.2, major = k % 2 === 0;
    tk += `<path d="M${f(bx - R + 22)} ${f(y)}h${major ? 16 : 9}" stroke="#1c1c1c" stroke-width="${major ? 2 : 1.4}" opacity="0.8"/>`;
    if (major && k > 0) tk += txt(bx - R + 42, y + 5, String(k / 2), { size: 13, mono: true, weight: 800, fill: "#1c1c1c" });
  }
  s += tk;
  // threshold line (front arc) + tab
  s += `<g id="${p}-th"><path d="M${f(bx - R)} ${f(yth)}A${R} ${f(ry)} 0 0 0 ${f(bx + R)} ${f(yth)}" fill="none" stroke="#1d93ba" stroke-width="3.4" stroke-dasharray="9 6"/>
    <path d="M${f(bx + R)} ${f(yth)}h14" stroke="#1d93ba" stroke-width="3"/><rect x="${f(bx + R + 12)}" y="${f(yth - 13)}" width="${f(tw(opts.thText ?? String(th), 15, true) + 16)}" height="26" rx="5" fill="#1d93ba"/>` +
    txt(bx + R + 20, yth + 5.5, opts.thText ?? String(th), { size: 15, mono: true, weight: 800, fill: "#ffffff" }) + `</g>`;
  // top rim + cap + lamp
  s += `<ellipse cx="${f(bx)}" cy="${f(ty)}" rx="${R}" ry="${f(ry)}" fill="none" stroke="rgba(42,140,175,0.9)" stroke-width="2.2"/>`;
  s += cyl(o, 0, 0, R + 6, zt - 4, zt + 14, { f: "#8b9199", s: "#6d737b", t: "#a9aeb5", st: "#2b2e33" }, { sw: 1.4 });
  s += cyl(o, 0, 0, 14, zt + 14, zt + 22, M.ink, { sw: 1.2, seg: 20 });
  const lc = at(o, 0, 0, zt + 34);
  const on = lv0 >= th - 1e-6;
  s += `<circle id="${p}-lamp-h" cx="${f(lc[0])}" cy="${f(lc[1])}" r="30" fill="#2bd46f" opacity="${on ? 0.35 : 0}"/>
    <path d="M${f(lc[0] - 14)} ${f(lc[1] + 10)}A14 14 0 0 1 ${f(lc[0] + 14)} ${f(lc[1] + 10)}Z" fill="${on ? "#2bd46f" : "#3c3f45"}" id="${p}-lamp" stroke="#15171a" stroke-width="1.6"/>
    <ellipse cx="${f(lc[0] - 4)}" cy="${f(lc[1] + 1)}" rx="4" ry="3" fill="#ffffff" opacity="0.5"/>`;
  const levels = Array.from({ length: max + 1 }, (_, k) => [bx + R, by - k * uH * CE]);
  const anchors = { top: at(o, 0, 0, zt + 80), center: at(o, 0, 0, zt / 2), ground: at(o), lamp: lc, th: [bx + R + 14, yth], levels };
  if (opts.pipe) { const L = opts.pipe, dir = opts.pipeDir ?? "-u"; const e = dir === "-u" ? [-R - L, 0] : dir === "-v" ? [0, -R - L] : dir === "+u" ? [R + L, 0] : [0, R + L]; anchors.pipeEnd = at(o, e[0], e[1], 40); }
  return { svg: shell(p, o, opts, { solid: s, wire: [{ cyl: [0, 0, R + 6, 0, zt + 22] }], center: anchors.center, badgeR: 28, glowR: 110 }), anchors };
}

// =====================================================================================
// 冰封罩 iceShell
// =====================================================================================
/**
 * iceShell(o, {w, d, h, box:[u0,u1,v0,v1,z0,z1], pad, seed, on})
 *   半透明淡蓝白冰壳，罩在任意物件外（按包围盒生成）：霜花、冰裂纹、顶边冰溜、底部冰碴、地面冰水。不带红色。
 *   on:false 时一开始隐藏（等 KITX05.freeze）。
 * 可动：ID-ice（整层，KITX05.freeze(tl,ID,t,dur,"up"|"drop") / KITX05.thaw）；ID-clip（自下而上冻住用的裁剪框）
 * anchors: top, center, ground, front
 */
export function iceShell(o, opts = {}) {
  const p = opts.id ?? "ice", pad = opts.pad ?? 14;
  const bx = opts.box ?? [-(opts.w ?? 300) / 2, (opts.w ?? 300) / 2, -(opts.d ?? 240) / 2, (opts.d ?? 240) / 2, 0, opts.h ?? 330];
  const u0 = bx[0] - pad, u1 = bx[1] + pad, v0 = bx[2] - pad, v1 = bx[3] + pad, z0 = bx[4], z1 = bx[5] + pad;
  const rnd = rng(opts.seed ?? p);
  const ICE = { f: "rgba(214,238,248,0.50)", s: "rgba(188,224,240,0.56)", t: "rgba(238,250,255,0.66)", st: "rgba(96,160,196,0.95)" };
  const W = u1 - u0, D = v1 - v0, H = z1 - z0;
  let s = "";
  // melt puddle
  s += G_(faceTop(o, (u0 + u1) / 2, (v0 + v1) / 2, 0), `<ellipse cx="0" cy="0" rx="${f(W * 0.62)}" ry="${f(D * 0.66)}" fill="rgba(170,215,235,0.30)"/>`);
  // lumpy top: slightly irregular top outline via loft of a jittered plan
  const plan = [];
  const nE = 7;
  const edgeJ = () => (rnd() - 0.5) * 8;
  for (let i = 0; i < nE; i++) plan.push([u0 + (W * i) / nE, v0 + edgeJ() * 0.6]);
  for (let i = 0; i < nE; i++) plan.push([u1 + edgeJ() * 0.6, v0 + (D * i) / nE]);
  for (let i = 0; i < nE; i++) plan.push([u1 - (W * i) / nE, v1 + edgeJ() * 0.6]);
  for (let i = 0; i < nE; i++) plan.push([u0 + edgeJ() * 0.6, v1 - (D * i) / nE]);
  const planT = plan.map(([a, b]) => [a + (a - (u0 + u1) / 2) * -0.04, b + (b - (v0 + v1) / 2) * -0.04]);
  s += loft(o, plan, planT, z0, z1, ICE, { sw: 2 });
  // highlight streaks
  s += G_(faceV(o, u0, v1, z1), `<path d="M${W * 0.12} ${H * 0.86}L${W * 0.34} ${H * 0.08}M${W * 0.2} ${H * 0.9}L${W * 0.4} ${H * 0.2}" stroke="#ffffff" stroke-width="10" opacity="0.32" stroke-linecap="round"/>
    <path d="M${W * 0.72} ${H * 0.7}L${W * 0.86} ${H * 0.2}" stroke="#ffffff" stroke-width="6" opacity="0.28" stroke-linecap="round"/>`);
  s += G_(faceU(o, u0, v0, z1), `<path d="M${D * 0.2} ${H * 0.8}L${D * 0.42} ${H * 0.12}" stroke="#ffffff" stroke-width="8" opacity="0.3" stroke-linecap="round"/>`);
  // frost flowers on each visible face
  const flake = (x, y, r, op) => {
    let d = "";
    for (let k = 0; k < 3; k++) {
      const a = (k * 60 + 15) * DEG, c = Math.cos(a) * r, sn = Math.sin(a) * r;
      d += `M${f(x - c)} ${f(y - sn)}L${f(x + c)} ${f(y + sn)}`;
      for (const sg of [1, -1]) { const bx0 = x + sg * c * 0.55, by0 = y + sg * sn * 0.55, b = r * 0.28; const a1 = a + 0.6, a2 = a - 0.6; d += `M${f(bx0)} ${f(by0)}l${f(sg * Math.cos(a1) * b)} ${f(sg * Math.sin(a1) * b)}M${f(bx0)} ${f(by0)}l${f(sg * Math.cos(a2) * b)} ${f(sg * Math.sin(a2) * b)}`; }
    }
    return `<path d="${d}" stroke="#ffffff" stroke-width="${f(Math.max(1.2, r * 0.12))}" stroke-linecap="round" opacity="${f(op)}"/>`;
  };
  const frost = (w, h, n) => { let g = ""; for (let i = 0; i < n; i++) g += flake(8 + rnd() * (w - 16), 8 + rnd() * (h - 16), 5 + rnd() * 9, 0.45 + rnd() * 0.45); return g; };
  s += G_(faceV(o, u0, v1, z1), frost(W, H, Math.round(W * H / 2600)));
  s += G_(faceU(o, u0, v0, z1), frost(D, H, Math.round(D * H / 3600)));
  s += G_(faceTop(o, u0, v0, z1), frost(W, D, Math.round(W * D / 3000)));
  // cracks (front face + side)
  const crack = (x, y, len, ang, w) => {
    let d = `M${f(x)} ${f(y)}`, cx = x, cy = y, br = "";
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      const a = ang + (rnd() - 0.5) * 0.9; cx += Math.cos(a) * len / steps; cy += Math.sin(a) * len / steps; d += `L${f(cx)} ${f(cy)}`;
      if (i === 2 || i === 4) { const ba = a + (rnd() > 0.5 ? 0.9 : -0.9); br += `M${f(cx)} ${f(cy)}l${f(Math.cos(ba) * len * 0.22)} ${f(Math.sin(ba) * len * 0.22)}`; }
    }
    return `<path d="${d}${br}" fill="none" stroke="rgba(70,130,165,0.55)" stroke-width="${w + 2}" stroke-linecap="round" stroke-linejoin="round" transform="translate(1.5,1.5)"/><path d="${d}${br}" fill="none" stroke="#ffffff" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  s += G_(faceV(o, u0, v1, z1), crack(W * 0.58, H * 0.05, H * 0.55, 1.75, 2.2) + crack(W * 0.25, H * 0.55, W * 0.35, 0.35, 1.6) + crack(W * 0.92, H * 0.45, W * 0.3, 2.6, 1.6));
  s += G_(faceU(o, u0, v0, z1), crack(D * 0.6, H * 0.1, H * 0.45, 1.9, 1.8));
  // icicles hanging from the front top edge
  let ic = "";
  for (let x = 14; x < W - 10; x += 16 + rnd() * 14) { const l = 10 + rnd() * 22, w2 = 4 + rnd() * 3; ic += `<path d="M${f(x - w2)} 0L${f(x)} ${f(l)}L${f(x + w2)} 0Z" fill="rgba(236,248,253,0.85)" stroke="rgba(96,160,196,0.8)" stroke-width="1"/>`; }
  s += G_(faceV(o, u0, v1, z1 - 2), ic);
  let ic2 = "";
  for (let x = 12; x < D - 10; x += 18 + rnd() * 14) { const l = 8 + rnd() * 16, w2 = 3.5 + rnd() * 3; ic2 += `<path d="M${f(x - w2)} 0L${f(x)} ${f(l)}L${f(x + w2)} 0Z" fill="rgba(236,248,253,0.8)" stroke="rgba(96,160,196,0.7)" stroke-width="1"/>`; }
  s += G_(faceU(o, u0, v0, z1 - 2), ic2);
  // bright top edges
  s += line3(o, [[u0, v1, z1], [u1, v1, z1]], "#ffffff", 3, `opacity="0.75"`) + line3(o, [[u0, v0, z1], [u0, v1, z1]], "#ffffff", 3, `opacity="0.75"`);
  // ice chunks around the base (front and −u edges)
  const CH = { f: "rgba(226,244,252,0.88)", s: "rgba(196,228,242,0.9)", t: "rgba(246,252,255,0.95)", st: "rgba(96,160,196,0.95)" };
  const chunks = [];
  for (let x = u0 - 6; x < u1; x += 22 + rnd() * 20) chunks.push([x, v1 + 4 + rnd() * 12]);
  for (let y = v0; y < v1; y += 24 + rnd() * 20) chunks.push([u0 - 8 - rnd() * 12, y]);
  chunks.sort((a, b) => (at(o, a[0], a[1])[1] - at(o, b[0], b[1])[1]));
  for (const [cu, cv] of chunks) {
    const a = 6 + rnd() * 9, b = 5 + rnd() * 8, h = 6 + rnd() * 14, tilt = (rnd() - 0.5) * 6;
    s += wedge(o, cu - a, cu + a, cv - b, cv + b, 0, h, CH, rnd() > 0.5 ? "+v" : "+u", h * 0.4 + tilt * 0.1, 1);
  }
  // clip rect for bottom-up freezing (screen bbox of the shell + chunks)
  const cs = [];
  for (const uu of [u0 - 30, u1 + 10]) for (const vv of [v0 - 10, v1 + 30]) for (const zz of [0, z1 + 4]) cs.push(at(o, uu, vv, zz));
  const xs = cs.map((q) => q[0]), ys = cs.map((q) => q[1]);
  const bb = [Math.min(...xs) - 10, Math.min(...ys) - 10, 0, 0];
  bb[2] = Math.max(...xs) + 10 - bb[0]; bb[3] = Math.max(...ys) + 10 - bb[1];
  const svg = shell(p, o, opts, {
    solid: `<defs><clipPath id="${p}-cp"><rect id="${p}-clip" x="${f(bb[0])}" y="${f(bb[1])}" width="${f(bb[2])}" height="${f(bb[3])}" data-y0="${f(bb[1])}" data-h0="${f(bb[3])}"/></clipPath></defs>
      <g id="${p}-ice" opacity="${opts.on === false ? 0 : 1}" clip-path="url(#${p}-cp)">${s}</g>`,
    wire: [[u0, u1, v0, v1, z0, z1]], center: at(o, (u0 + u1) / 2, (v0 + v1) / 2, (z0 + z1) / 2), badgeR: 30,
  });
  const anchors = { top: at(o, (u0 + u1) / 2, (v0 + v1) / 2, z1 + 50), center: at(o, (u0 + u1) / 2, (v0 + v1) / 2, (z0 + z1) / 2), ground: at(o), front: at(o, (u0 + u1) / 2, v1, (z0 + z1) / 2) };
  return { svg, anchors };
}

export const CATALOG_EXT05 = { funcPanel, keycard, roleBoard, accountSafe, thresholdMeter, iceShell };
/** browser runtime (window.KITX05 + merged into window.KITX) — inline after kit's runtimeJs() */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
