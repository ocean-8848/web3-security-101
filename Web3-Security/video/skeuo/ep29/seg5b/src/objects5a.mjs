// objects5a.mjs — seg5a 自补物件（同 kit 的投影与画法；不改 kit/）
// 每个物件 objName(o, opts) → { svg, anchors }，结构与 kit 相同：<g id data-ox data-oy> 根，可被 grow。
import {
  CE, U, V, f, f4, at, pts, M, C, lighten, darken, mat, frameV, frameU, frameTop, matStr, applyM,
  faceV, faceU, faceTop, box, rbox, cyl, flat, line3, contactShadow, glow, circlePlan,
} from "../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const txt = (x, y, s, o = {}) =>
  `<text x="${f(x)}" y="${f(y)}" ${o.mono ? MONO : FONT} font-size="${o.size ?? 20}" font-weight="${o.weight ?? 900}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}">${s}</text>`;
const root = (p, o, inner, extra = "") => { const [ox, oy] = at(o); return `<g id="${p}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}" ${extra}>${inner}</g>`; };
/** same contract as kit's internal rotator (KIT.rot / KIT.arm read data-m / px / py / a) */
export function rotator(id, m, px, py, a, inner, extra = "") {
  const tr = `${matStr(m)} translate(${px} ${py}) rotate(${f(a)}) translate(${-px} ${-py})`;
  return `<g id="${id}" data-m="${m.map((v, i) => (i < 4 ? f4(v) : f(v))).join(",")}" data-px="${px}" data-py="${py}" data-a="${f(a)}" transform="${tr}" ${extra}>${inner}</g>`;
}

// ---------------------------------------------------------------- 机房地板（道路升级后的底座）
export function floor(o, u0, u1, v0, v1, id = "floor") {
  let s = flat(o, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], 0, "#f5f2ec", "#cfc7b8", 3);
  let d = "";
  for (let u = u0 + 120; u < u1; u += 120) d += `M${pts([at(o, u, v0)])}L${pts([at(o, u, v1)])}`;
  for (let v = v0 + 120; v < v1; v += 120) d += `M${pts([at(o, u0, v)])}L${pts([at(o, u1, v)])}`;
  s += `<path d="${d}" stroke="#e4ded2" stroke-width="2" fill="none"/>`;
  // front lip (slab thickness)
  const A = (u, v, z) => at(o, u, v, z);
  s += `<polygon points="${pts([A(u0, v1, 0), A(u1, v1, 0), A(u1, v1, -14), A(u0, v1, -14)])}" fill="#ddd7cb" stroke="#c3bbac" stroke-width="1.4"/>`;
  s += `<polygon points="${pts([A(u0, v0, 0), A(u0, v1, 0), A(u0, v1, -14), A(u0, v0, -14)])}" fill="#e6e1d7" stroke="#c3bbac" stroke-width="1.4"/>`;
  return `<g id="${id}">${s}</g>`;
}
/** long road along u (centre v = 62 like kit checkpoints) */
export function road(o, u0, u1) {
  let s = flat(o, [[u0, -86], [u1, -86], [u1, 210], [u0, 210]], 0, "#f8f6f1", "#dcd5c8", 2);
  for (let u = u0 + 20; u < u1 - 60; u += 130) s += line3(o, [[u, 62], [u + 70, 62]], "#d3ccbf", 4);
  return s;
}

// ---------------------------------------------------------------- 道闸（与 kit checkpoint 同款臂，可 KIT.arm）
export function barrier(o, opts = {}) {
  const p = opts.id ?? "bar", L = 262, hv0 = -88, hv1 = -58, pzv = -73, pzz = 66;
  let s = contactShadow(o, 60, 40, 0, -73);
  s += box(o, -16, 16, hv0, hv1, 0, 72, M.white, 1.6) + box(o, -18, 18, hv0 - 2, hv1 + 2, 72, 80, M.red, 1.4);
  s += G_(faceU(o, -16, hv0, 60), `<rect x="6" y="0" width="${hv1 - hv0 - 12}" height="18" rx="2" fill="#e3ddd1" stroke="#b8b0a1" stroke-width="1"/>`);
  s += box(o, -7, 7, pzv + L - 12, pzv + L + 2, 0, 58, M.white, 1.4) + G_(faceU(o, -7, pzv + L - 12, 58), `<path d="M0 0H14V6H0Z" fill="#e0453a"/>`);
  let arm = `<rect x="-46" y="-12" width="40" height="24" rx="3" fill="#3b3e44" stroke="#1d1f23" stroke-width="1.4"/>`;
  arm += `<rect x="0" y="-7" width="${L}" height="14" rx="7" fill="#ffffff" stroke="#8d939b" stroke-width="1.6"/>`;
  for (let x = 18; x < L - 10; x += 52) arm += `<rect x="${x}" y="-7" width="26" height="14" fill="#e0453a"/>`;
  arm += `<rect x="0" y="-7" width="${L}" height="14" rx="7" fill="none" stroke="#8d939b" stroke-width="1.6"/><circle cx="0" cy="0" r="9" fill="#5a5e65" stroke="#1d1f23" stroke-width="1.6"/><circle cx="0" cy="0" r="3" fill="#d4d7db"/>`;
  const mArm = frameU(o, -18, pzv, pzz);
  s += rotator(p + "-arm", mArm, 0, 0, opts.armUp === false ? 0 : -78, arm, `data-up="-78"`);
  const anchors = { top: at(o, 0, -73, 200), road: at(o, 0, 62, 0), armTip: applyM(mArm, L, 0), mid: at(o, 0, 60, 70), ground: at(o) };
  return { svg: root(p, o, s), anchors };
}

// ---------------------------------------------------------------- 审批台：底座 + 绿色大按钮
export function approveBtn(o, opts = {}) {
  const p = opts.id ?? "apb";
  let s = contactShadow(o, 80, 60);
  s += rbox(o, -42, 42, -36, 36, 0, 96, 6, M.white, { sw: 1.6 });
  s += box(o, -48, 48, -42, 42, 96, 108, M.ink, 1.4);
  s += cyl(o, 0, 0, 30, 108, 118, M.dark, { sw: 1.2 });
  s += `<g id="${p}-cap">` + cyl(o, 0, 0, 24, 118, 134, M.green, { sw: 1.4 }) + `</g>`;
  s += G_(faceV(o, -30, 36, 80), `<rect x="0" y="0" width="60" height="18" rx="3" fill="#1f9d55"/>` + txt(30, 14, "批准", { size: 13, anchor: "middle", fill: "#fff" }));
  return { svg: root(p, o, s), anchors: { top: at(o, 0, 0, 190), center: at(o, 0, 0, 70), ground: at(o) } };
}

// ---------------------------------------------------------------- 监控摄像头（立杆 + 机身 + 镜头）
export function cctv(o, opts = {}) {
  const p = opts.id ?? "cam";
  let s = contactShadow(o, 70, 50);
  s += rbox(o, -36, 36, -36, 36, 0, 14, 6, M.plinth, { sw: 1.4 });
  s += cyl(o, 0, 0, 8, 14, 230, M.steel, { sw: 1.4, seg: 16 });
  s += box(o, -14, 14, -14, 14, 222, 240, M.dark, 1.2);
  // body points toward −u / +v (toward the camera)
  s += box(o, -96, 10, -26, 26, 236, 286, M.white, 1.6);
  s += box(o, -104, -90, -30, 30, 232, 292, M.ink, 1.4);
  s += G_(faceU(o, -104, -30, 292), `<circle cx="30" cy="30" r="20" fill="#1d1f23" stroke="#5a5e65" stroke-width="3"/><circle cx="30" cy="30" r="10" fill="#2a87a8"/><circle cx="25" cy="25" r="3.5" fill="#fff" opacity="0.85"/>`);
  s += G_(faceV(o, -80, 26, 280), `<circle cx="70" cy="10" r="5" fill="#ff4a3d"/>` + `<rect x="6" y="18" width="50" height="6" rx="3" fill="#cfc7b8"/>`);
  return { svg: root(p, o, s), anchors: { top: at(o, 0, 0, 330), center: at(o, -40, 0, 260), ground: at(o) } };
}

// ---------------------------------------------------------------- 防火墙：一段砖墙（沿 u 方向）
export function wall(o, opts = {}) {
  const p = opts.id ?? "wall", L = opts.len ?? 260, H = opts.h ?? 150, T = 30;
  const m = { f: "#d9d2c5", s: "#c7bfb1", t: "#ece7de", st: "#8f877a" };
  let s = contactShadow(o, L * 0.6, 50);
  s += box(o, -L / 2, L / 2, -T / 2, T / 2, 0, H, m, 1.8);
  let br = "";
  for (let r = 0; r < Math.floor(H / 25); r++) {
    br += `<path d="M0 ${r * 25}H${L}" stroke="#a89f90" stroke-width="1.6"/>`;
    for (let x = (r % 2) * 32; x < L; x += 64) br += `<path d="M${x} ${r * 25}V${r * 25 + 25}" stroke="#a89f90" stroke-width="1.6"/>`;
  }
  s += G_(faceV(o, -L / 2, T / 2, H), br);
  return { svg: root(p, o, s), anchors: { top: at(o, 0, 0, H + 40), center: at(o, 0, 0, H / 2), ground: at(o) } };
}

// ---------------------------------------------------------------- 小旗：旗杆 + 旗面（旗面颜色 = 被挡住的事件，红）
export function flag(o, opts = {}) {
  const p = opts.id ?? "flag", H = 210, col = opts.color ?? "#e0453a";
  let s = contactShadow(o, 40, 26);
  s += cyl(o, 0, 0, 14, 0, 10, M.dark, { sw: 1.2, seg: 16 });
  s += cyl(o, 0, 0, 4, 10, H, M.steelLight, { sw: 1.2, seg: 12 });
  s += `<circle cx="${f(at(o, 0, 0, H + 4)[0])}" cy="${f(at(o, 0, 0, H + 4)[1])}" r="7" fill="#f0c04a" stroke="#a87612" stroke-width="1.4"/>`;
  const m = frameV(o, 0, 0, H);
  s += G_(matStr(m), `<path d="M0 0C30 -8 60 8 96 0L84 30L96 62C60 70 30 54 0 62Z" fill="${col}" stroke="${darken(col, 0.3)}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M10 18C34 12 54 22 74 18" stroke="#ffffff" stroke-width="3" opacity="0.5" fill="none" stroke-linecap="round"/>`);
  return { svg: root(p, o, s), anchors: { tip: applyM(m, 104, 30), top: at(o, 0, 0, H + 40), ground: at(o) } };
}

// ---------------------------------------------------------------- 金条
export function goldBar(o, opts = {}) {
  const p = opts.id ?? "gb";
  const s = box(o, -34, 34, -16, 16, 0, 18, M.gold, 1.4) + G_(faceTop(o, -24, -8, 18), `<rect x="0" y="0" width="48" height="16" rx="3" fill="#fff3c4" opacity="0.6"/>`);
  return { svg: root(p, o, s), anchors: { center: at(o, 0, 0, 9) } };
}

// ---------------------------------------------------------------- 独立控制箱：小机柜 + 红色蘑菇头急停 + 天线
export function ctrlBox(o, opts = {}) {
  const p = opts.id ?? "cbox";
  let s = contactShadow(o, 90, 70);
  s += rbox(o, -50, 50, -40, 40, 0, 150, 6, M.steelLight, { sw: 1.6 });
  s += G_(faceV(o, -50, 40, 150), `<rect x="12" y="14" width="76" height="120" rx="4" fill="#c3c8ce" stroke="#5a6068" stroke-width="1.6"/>
    <rect x="22" y="26" width="56" height="20" rx="3" fill="#1f9d55"/><text x="50" y="41" ${FONT} font-size="12" font-weight="900" fill="#fff" text-anchor="middle">独立</text>
    <circle cx="74" cy="80" r="3" fill="#5a6068"/>`);
  s += cyl(o, 0, 0, 26, 150, 160, M.dark, { sw: 1.2 });
  s += cyl(o, 0, 0, 22, 160, 176, M.red, { sw: 1.4 });
  s += cyl(o, 34, -24, 3, 150, 250, M.steel, { sw: 1, seg: 10 });
  const tp = at(o, 34, -24, 252);
  s += `<circle cx="${f(tp[0])}" cy="${f(tp[1])}" r="6" fill="#2aa3c9" stroke="#1f7896" stroke-width="1.4"/>`;
  return { svg: root(p, o, s), anchors: { top: at(o, 0, 0, 290), center: at(o, 0, 0, 100), port: at(o, 0, 40, 60), ground: at(o) } };
}

// ---------------------------------------------------------------- break-glass：底座 + 红按钮 + 玻璃罩 + 小锁
export function breakGlass(o, opts = {}) {
  const p = opts.id ?? "bg";
  let s = contactShadow(o, 90, 70);
  s += rbox(o, -54, 54, -46, 46, 0, 110, 6, M.white, { sw: 1.6 });
  s += box(o, -60, 60, -52, 52, 110, 122, M.ink, 1.4);
  s += cyl(o, 0, 0, 30, 122, 132, M.dark, { sw: 1.2 });
  s += cyl(o, 0, 0, 25, 132, 152, M.red, { sw: 1.4 });
  // glass cover (transparent box with highlights)
  const g = M.glass, A = (u, v, z) => at(o, u, v, z), u0 = -46, u1 = 46, v0 = -40, v1 = 40, z0 = 122, z1 = 200;
  s += `<g id="${p}-glass">`;
  s += `<polygon points="${pts([A(u0, v0, z0), A(u0, v1, z0), A(u0, v1, z1), A(u0, v0, z1)])}" fill="${g.f}" stroke="${g.st}" stroke-width="2"/>`;
  s += `<polygon points="${pts([A(u0, v1, z0), A(u1, v1, z0), A(u1, v1, z1), A(u0, v1, z1)])}" fill="${g.s}" stroke="${g.st}" stroke-width="2"/>`;
  s += `<polygon points="${pts([A(u0, v0, z1), A(u1, v0, z1), A(u1, v1, z1), A(u0, v1, z1)])}" fill="${g.t}" stroke="${g.st}" stroke-width="2"/>`;
  s += G_(faceV(o, u0, v1, z1), `<path d="M14 10L34 50M24 8L40 40" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.8"/>`);
  s += `</g>`;
  s += G_(faceV(o, -54, 46, 96), `<rect x="10" y="0" width="88" height="22" rx="3" fill="#e0453a"/>` + txt(54, 16, "紧急撤销", { size: 14, anchor: "middle", fill: "#fff" }));
  return { svg: root(p, o, s), anchors: { top: at(o, 0, 0, 250), center: at(o, 0, 0, 120), ground: at(o) } };
}

// ---------------------------------------------------------------- 台历：四个季度格，逐个打勾（ID-q0..3）
export function calendar(o, opts = {}) {
  const p = opts.id ?? "cal", W = 170, H = 150;
  let s = contactShadow(o, 100, 50);
  s += box(o, -W / 2 - 6, W / 2 + 6, -40, 10, 0, 12, M.wood, 1.4);
  const m = frameV(o, -W / 2, 0, 12 + H);
  for (let i = 5; i >= 1; i--) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(m), `<rect x="0" y="0" width="${W}" height="${H}" rx="6" fill="#d9d2c5"/>`)}</g>`;
  let face = `<rect x="0" y="0" width="${W}" height="${H}" rx="6" fill="#fffdf8" stroke="#b8b0a1" stroke-width="1.6"/><rect x="0" y="0" width="${W}" height="34" rx="6" fill="#1d93ba"/><rect x="0" y="22" width="${W}" height="12" fill="#1d93ba"/>`;
  face += txt(W / 2, 25, "演练", { size: 18, anchor: "middle", fill: "#fff" });
  for (let k = 0; k < 2; k++) face += `<circle cx="${40 + k * 90}" cy="0" r="6" fill="#5a5e65"/>`;
  for (let i = 0; i < 4; i++) {
    const x = 12 + (i % 2) * 78, y = 44 + Math.floor(i / 2) * 52;
    face += `<rect x="${x}" y="${y}" width="68" height="44" rx="4" fill="#f1ede5" stroke="#d3ccbf" stroke-width="1.4"/>` + txt(x + 8, y + 28, `Q${i + 1}`, { size: 18, mono: true, fill: "#6d685e" });
    face += `<path id="${p}-q${i}" d="M${x + 38} ${y + 22}l8 9l16 -18" fill="none" stroke="#1f9d55" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>`;
  }
  s += G_(matStr(m), face);
  return { svg: root(p, o, s), anchors: { top: at(o, 0, 0, H + 60), center: at(o, 0, 0, H / 2), ground: at(o) } };
}

// ---------------------------------------------------------------- 秒表（立在小座上，指针 ID-hand 可 KIT.rot）
export function stopwatch(o, opts = {}) {
  const p = opts.id ?? "sw5", R = 62;
  let s = contactShadow(o, 80, 46);
  s += rbox(o, -40, 40, -26, 26, 0, 16, 6, M.dark, { sw: 1.4 });
  const m = frameV(o, 0, 0, 16 + R * 2 + 6);
  const cx = 0, cy = R + 6;
  for (let i = 10; i >= 1; i -= 1.5) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(m), `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#8b9199"/>`)}</g>`;
  let face = `<rect x="-9" y="-16" width="18" height="16" rx="3" fill="#b5b9bf" stroke="#5a5e65" stroke-width="1.4"/><rect x="-16" y="-24" width="32" height="10" rx="4" fill="#d4d7db" stroke="#5a5e65" stroke-width="1.4"/>`;
  face += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#d4d7db" stroke="#5a5e65" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${R - 9}" fill="#fffdf8" stroke="#8b9199" stroke-width="1.4"/>`;
  for (let k = 0; k < 12; k++) { const a = (k / 12) * 2 * Math.PI; face += `<path d="M${f(cx + Math.sin(a) * (R - 14))} ${f(cy - Math.cos(a) * (R - 14))}L${f(cx + Math.sin(a) * (R - 22))} ${f(cy - Math.cos(a) * (R - 22))}" stroke="#5a5e65" stroke-width="${k % 3 ? 2 : 4}"/>`; }
  s += G_(matStr(m), face);
  s += rotator(p + "-hand", m, cx, cy, 0, `<path d="M${cx} ${cy + 10}L${cx} ${cy - R + 18}" stroke="#e0453a" stroke-width="4" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="6" fill="#1c1c1c"/>`);
  return { svg: root(p, o, s), anchors: { top: at(o, 0, 0, 16 + R * 2 + 70), center: at(o, 0, 0, 16 + R), ground: at(o) } };
}

// ---------------------------------------------------------------- 攻击者合约：红色小方块 + </> 图样
export function atkCode(o, opts = {}) {
  const p = opts.id ?? "atkc";
  let s = contactShadow(o, 80, 60);
  s += rbox(o, -50, 50, -50, 50, 0, 100, 10, M.red, { sw: 2 });
  s += G_(faceV(o, -40, 50, 86), `<rect x="0" y="0" width="80" height="60" rx="6" fill="#ffffff" opacity="0.92"/>` + txt(40, 40, "&lt;/&gt;", { size: 26, anchor: "middle", mono: true, weight: 800, fill: "#a8322a" }));
  return { svg: root(p, o, s), anchors: { top: at(o, 0, 0, 150), center: at(o, 0, 0, 50), ground: at(o) } };
}
/** red delegation chain between two world points (relative to o), n links; each link ID-k */
export function redChain(o, A, B, n, opts = {}) {
  const p = opts.id ?? "rch";
  let s = "";
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, du = A[0] + (B[0] - A[0]) * t, dv = A[1] + (B[1] - A[1]) * t, z = A[2] + (B[2] - A[2]) * t - Math.sin(Math.PI * t) * 26;
    const ring = `<ellipse cx="0" cy="0" rx="24" ry="11" fill="none" stroke="#8f2620" stroke-width="9"/><ellipse cx="0" cy="0" rx="24" ry="11" fill="none" stroke="#e8574c" stroke-width="3.5"/>`;
    const fr = i % 2 ? faceTop(o, du - 20, dv, z) : faceV(o, du - 20, dv, z);
    s += `<g id="${p}-${i}">${G_(fr, `<g transform="translate(20,0)">${ring}</g>`)}</g>`;
  }
  return { svg: `<g id="${p}">${s}</g>`, anchors: { mid: at(o, (A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2 + 40) } };
}

// ---------------------------------------------------------------- 三钥匙锁柜：钢柜正面三个锁孔，钥匙 ID-k0..2 可 KIT.rot
export function lockPanel(o, opts = {}) {
  const p = opts.id ?? "lk", W = 300, D = 120, H = 260;
  let s = contactShadow(o, 200, 100);
  s += rbox(o, -W / 2, W / 2, -D / 2, D / 2, 0, H, 10, M.steel, { sw: 2 });
  s += G_(faceV(o, -W / 2, D / 2, H), `<rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="8" fill="#5a5e65" stroke="#25282c" stroke-width="2"/>
    <rect x="${W / 2 - 50}" y="30" width="100" height="22" rx="4" fill="#e9ebee"/><text x="${W / 2}" y="47" ${FONT} font-size="15" font-weight="900" fill="#25282c" text-anchor="middle">三人同时转</text>`);
  const keys = [];
  for (let i = 0; i < 3; i++) {
    const kx = 60 + i * 90, ky = 150;
    const m = frameV(o, -W / 2, D / 2, H);
    s += G_(matStr(m), `<circle cx="${kx}" cy="${ky}" r="30" fill="#c3c8ce" stroke="#25282c" stroke-width="2"/><circle cx="${kx}" cy="${ky}" r="20" fill="#8b9199"/><rect x="${kx - 3}" y="${ky - 12}" width="6" height="24" rx="2" fill="#1d1f23"/>`);
    s += G_(matStr(m), `<circle id="${p}-dot${i}" cx="${kx}" cy="${ky + 52}" r="9" fill="#3c3f45" stroke="#1d1f23" stroke-width="1.4"/>`);
    // key bow sticking out (drawn in the face plane, rotates about the keyhole)
    const bow = `<rect x="${kx - 5}" y="${ky - 40}" width="10" height="34" rx="3" fill="#cf9520" stroke="#a87612" stroke-width="1.6"/><circle cx="${kx}" cy="${ky - 52}" r="16" fill="#f0c04a" stroke="#a87612" stroke-width="2"/><circle cx="${kx}" cy="${ky - 54}" r="6" fill="#5a5e65"/>`;
    s += rotator(`${p}-k${i}`, m, kx, ky, 0, bow, `opacity="${i === 0 ? 1 : 0}"`);
    keys.push(applyM(m, kx, ky));
  }
  return { svg: root(p, o, s), anchors: { top: at(o, 0, 0, H + 40), center: at(o, 0, 0, H / 2), keys, ground: at(o) } };
}
