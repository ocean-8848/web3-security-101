// objects-ext.mjs — 第 02 章补充拟物物件（私钥从哪里来）
// 接口与 kit/objects.mjs 完全一致：fn(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = normal | broken | attacker；opts.glow
//   DOM：<g id=ID data-ox data-oy> → ID-glow / ID-solid / ID-wire / ID-x
// 运行时动画助手在 runtime-ext.js（往 window.KIT 上追加），用 runtimeExtJs() 内联，放在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  CA, SA, SE, CE, U, V, f, f4, at, pts, M, C, mix, lighten, darken, mat,
  frameV, frameU, frameTop, frameTilt, matStr, applyM, faceV, faceU, faceTop,
  box, edges, loft, prism, rbox, cyl, frustum, flat, line3, rrectPlan, circlePlan,
  glow, contactShadow, wireSvg, badgeSvg,
} from "../../kit/iso.mjs";
import { key as kitKey } from "../../kit/objects.mjs";

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
const isAtk = (opts) => opts.state === "attacker";
const RED = { f: "#e8574c", s: "#c23a30", t: "#f08a80", st: "#a8322a" };
const BRASS = { f: "#d6a64a", s: "#b58630", t: "#ecc778", st: "#7a5716" };
/** depth toward the viewer (larger = nearer) */
const depth = (u, v, z) => -u * SA * CE + v * CA * CE + z * SE;

/** common shell (same as kit/objects.mjs) */
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
/** rotator group (same data-* contract as kit, so KIT.rot / KIT.setRot work) */
function rotator(id, m, px, py, a, inner, extra = "") {
  const tr = `${matStr(m)} translate(${px} ${py}) rotate(${f(a)}) translate(${-px} ${-py})`;
  return `<g id="${id}" data-m="${m.map((v, i) => (i < 4 ? f4(v) : f(v))).join(",")}" data-px="${px}" data-py="${py}" data-a="${f(a)}" transform="${tr}" ${extra}>${inner}</g>`;
}
/** extrude a flat local drawing (frame matrix m) by `n` px along screen vector dir */
const extrudeLocal = (m, back, front, dir, n, step = 1.5) => {
  let s = "";
  for (let i = n; i >= step; i -= step) s += `<g transform="translate(${f(dir[0] * i)},${f(dir[1] * i)})">${G_(matStr(m), back)}</g>`;
  return s + G_(matStr(m), front);
};
const radial = (id, a, b, c) => `<radialGradient id="${id}" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="${a}"/><stop offset="0.6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;
/** pip layouts on a unit face */
const PIPS = { 1: [[0.5, 0.5]], 2: [[0.27, 0.27], [0.73, 0.73]], 3: [[0.27, 0.27], [0.5, 0.5], [0.73, 0.73]], 4: [[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]], 5: [[0.27, 0.27], [0.73, 0.27], [0.5, 0.5], [0.27, 0.73], [0.73, 0.73]], 6: [[0.27, 0.25], [0.73, 0.25], [0.27, 0.5], [0.73, 0.5], [0.27, 0.75], [0.73, 0.75]] };
const pipSvg = (n, s, fill, x = 0, y = 0) => PIPS[n].map(([a, b]) => `<circle cx="${f(x + a * s)}" cy="${f(y + b * s)}" r="${f(s * 0.095)}" fill="${fill}"/>`).join("");

// =====================================================================================
// 摇奖机 lottery — CSPRNG 熵源：青蓝底座 + 两侧支架 + 横轴透明钢丝滚筒，筒里翻滚带数字的小球，前方出球槽和托盘
// opts: size "big"(默认) | "small", balls（球数）, plate（底座铭牌，默认 "CSPRNG"）, out（出球号码，默认隐藏）
// 可动：ID-drum（滚筒：端盖 ID-cap-0/1、钢丝 ID-bar-*、小球 ID-ball-*、摇柄 ID-crank）→ KIT.drum(tl,ID,t,dur,turns)
//       ID-out（出球）→ KIT.ballOut(tl,ID,t)
// anchors: top, center, ground, drum（滚筒中心）, tray（托盘里出球位置）, chute（出球口）
// =====================================================================================
export function lottery(o, opts = {}) {
  const p = opts.id ?? "lot", atk = isAtk(opts), small = opts.size === "small";
  const R = small ? 62 : 96, HL = small ? 58 : 92, zb = small ? 48 : 62, cz = zb + 30 + R;
  const BW = HL + 34, BD = R * 0.62 + 26, nb = opts.balls ?? (small ? 8 : 18), rb = small ? 12 : 16;
  const baseM = atk ? M.red : { f: "#5cc0e0", s: "#2f9fc4", t: "#9ad9ee", st: "#1f7896" };
  const steel = { f: "#c9cdd2", s: "#a9aeb5", t: "#e3e6e9", st: "#5d636b" };
  let s = contactShadow(o, BW * 1.5, BD * 1.6);
  // base
  s += rbox(o, -BW, BW, -BD, BD, 0, zb, 10, baseM, { sw: 1.8 });
  s += rbox(o, -BW + 8, BW - 8, -BD + 8, BD - 8, zb, zb + 6, 8, { f: "#e9ebee", s: "#cfd3d8", t: "#f6f7f8", st: "#7d828a" }, { sw: 1.2 });
  const plate = opts.plate ?? "CSPRNG";
  s += G_(faceV(o, -BW, BD, zb), `<rect x="16" y="12" width="${2 * BW - 32}" height="${zb - 24}" rx="5" fill="${darken(baseM.s, 0.18)}" stroke="${baseM.st}" stroke-width="1.5"/>` +
    (plate ? txt(BW, zb / 2 + (small ? 6 : 8), plate, { size: small ? 15 : 20, anchor: "middle", fill: "#ffffff", mono: true, weight: 800 }) : "") +
    [0, 1, 2].map((i) => `<circle cx="${2 * BW - 40 + i * 0}" cy="0" r="0"/>`).join(""));
  // vents on −u face
  s += G_(faceU(o, -BW, -BD + 14, zb - 12), Array.from({ length: 5 }, (_, i) => `<rect x="${i * ((2 * BD - 28) / 5) + 4}" y="0" width="${(2 * BD - 28) / 5 - 8}" height="${zb - 26}" rx="3" fill="${darken(baseM.f, 0.15)}"/>`).join(""));
  // far support (u = +HL+14)
  const support = (u) => line3(o, [[u, -BD + 10, zb + 4], [u, 0, cz], [u, BD - 10, zb + 4]], steel.st, 12) + line3(o, [[u, -BD + 10, zb + 4], [u, 0, cz], [u, BD - 10, zb + 4]], steel.f, 7) +
    cyl(o, u - 4, 0, 13, cz - 6, cz + 6, steel, { seg: 18, sw: 1.2 });
  s += support(HL + 14);
  // ---- drum
  const dO = { u: o.u, v: o.v };
  const nBars = small ? 10 : 14;
  const balls = Array.from({ length: nb }, (_, i) => ({
    du: -HL + 18 + ((i * 53) % (2 * HL - 36)), rho: 0.62 + ((i * 37) % 30) / 100, base: ((i * 71) % 100) / 100 * 2 * Math.PI, sp: 0.55 + ((i * 29) % 50) / 100,
    n: ((i * 37 + 11) % 49) + 1, col: ["#ffffff", "#5cc0e0", "#f4f1ea", "#9ad9ee"][i % 4],
  }));
  const cap = (u, id, a) => {
    let c = `<circle cx="0" cy="0" r="${R}" fill="rgba(208,234,244,0.16)" stroke="${steel.st}" stroke-width="7"/><circle cx="0" cy="0" r="${R}" fill="none" stroke="${steel.t}" stroke-width="3"/>`;
    for (let k = 0; k < 6; k++) { const aa = k * 60 * DEG; c += `<line x1="0" y1="0" x2="${f(R * Math.cos(aa))}" y2="${f(R * Math.sin(aa))}" stroke="${steel.s}" stroke-width="2.4"/>`; }
    c += `<circle cx="0" cy="0" r="${R * 0.16}" fill="${steel.f}" stroke="${steel.st}" stroke-width="2"/><circle cx="0" cy="0" r="${R * 0.06}" fill="${steel.st}"/>`;
    return rotator(id, frameU(dO, u, 0, cz), 0, 0, a, c);
  };
  const a0 = opts.angle ?? 0;
  const barGeo = (k, aDeg) => {
    const a = (k * 360 / nBars + aDeg) * DEG, vv = R * Math.cos(a), zz = cz - R * Math.sin(a);
    return { A: at(o, -HL, vv, zz), B: at(o, HL, vv, zz), front: depth(0, vv, zz - cz) > 0 };
  };
  const ballGeo = (b, aDeg) => {
    const ph = aDeg * DEG;
    const ang = (90 + 48 * Math.sin(ph * b.sp + b.base)) * DEG, rr = b.rho * (R - rb - 4);
    const vv = rr * Math.cos(ang), zz = cz - rr * Math.sin(ang);
    return { P: at(o, b.du, vv, zz), d: depth(b.du, vv, zz) };
  };
  let backBars = "", frontBars = "";
  for (let k = 0; k < nBars; k++) {
    const g = barGeo(k, a0);
    const ln = (cls, op) => `<line id="${p}-bar${cls}-${k}" x1="${f(g.A[0])}" y1="${f(g.A[1])}" x2="${f(g.B[0])}" y2="${f(g.B[1])}" stroke="${steel.st}" stroke-width="3" stroke-linecap="round" opacity="${op}"/>`;
    backBars += ln("b", g.front ? 0 : 0.55); frontBars += ln("f", g.front ? 1 : 0);
  }
  const bl = balls.map((b, i) => ({ b, i, g: ballGeo(b, a0) })).sort((x, y) => x.g.d - y.g.d);
  let ballSvg = `<defs>${["#ffffff", "#5cc0e0", "#f4f1ea", "#9ad9ee"].map((c, i) => radial(`${p}-bg${i}`, lighten(c, 0.6), c, darken(c, 0.22))).join("")}</defs>`;
  for (const { b, i, g } of bl) {
    const ci = ["#ffffff", "#5cc0e0", "#f4f1ea", "#9ad9ee"].indexOf(b.col);
    ballSvg += `<g id="${p}-ball-${i}" transform="translate(${f(g.P[0])},${f(g.P[1])})"><circle cx="0" cy="0" r="${rb}" fill="url(#${p}-bg${ci})" stroke="${darken(b.col, 0.45)}" stroke-width="1.2"/><circle cx="0" cy="${f(rb * 0.05)}" r="${f(rb * 0.55)}" fill="#ffffff" opacity="0.9"/>` +
      txt(0, rb * 0.32, b.n, { size: f(rb * 0.82), anchor: "middle", fill: ci === 1 ? "#155e77" : C.ink, mono: true, weight: 800 }) + `</g>`;
  }
  // crank on the near (−u) side
  const crank = rotator(p + "-crank", frameU(dO, -HL - 30, 0, cz), 0, 0, a0,
    `<rect x="-6" y="-6" width="${R * 0.62 + 12}" height="12" rx="6" fill="#34363b" stroke="#141518" stroke-width="1.5"/><circle cx="0" cy="0" r="10" fill="${steel.f}" stroke="${steel.st}" stroke-width="2"/><circle cx="${R * 0.62}" cy="0" r="11" fill="#1d93ba" stroke="#155e77" stroke-width="2"/>`);
  const drumData = { R, HL, cz, nBars, rb, ou: o.u, ov: o.v, balls: balls.map((b) => [f(b.du), f4(b.rho), f4(b.base), f4(b.sp)]) };
  s += `<g id="${p}-drum" data-a="${a0}" data-geo='${JSON.stringify(drumData)}'>` + cap(HL, p + "-cap-1", a0) + `<g id="${p}-bars-b">${backBars}</g><g id="${p}-balls">${ballSvg}</g><g id="${p}-bars-f">${frontBars}</g>` +
    line3(o, [[-HL - 30, 0, cz], [-HL, 0, cz]], steel.st, 8) + cap(-HL, p + "-cap-0", a0) + `</g>`;
  s += support(-HL - 14) + crank;
  // chute + tray (front)
  const chTop = [HL * 0.55, R * 0.55, cz - R * 0.75], trayC = [HL * 0.55, BD + 34, 14];
  s += line3(o, [chTop, [chTop[0], BD + 6, zb + 18], [trayC[0], trayC[1] - 10, 30]], steel.st, 20) + line3(o, [chTop, [chTop[0], BD + 6, zb + 18], [trayC[0], trayC[1] - 10, 30]], "#e9ebee", 13) +
    line3(o, [chTop, [chTop[0], BD + 6, zb + 18], [trayC[0], trayC[1] - 10, 30]], "#ffffff", 3, `opacity="0.8"`);
  s += cyl(o, trayC[0], trayC[1], 30, 0, 12, steel, { seg: 28, sw: 1.4, topFill: "#7d828a" });
  s += G_(faceTop(o, trayC[0], trayC[1], 12), `<circle cx="0" cy="0" r="22" fill="#5d636b"/>`);
  const T = at(o, trayC[0], trayC[1], 12 + rb), Ch = at(o, trayC[0], trayC[1] - 10, 30 + rb);
  const outN = opts.out ?? 7;
  s += `<g id="${p}-out" data-sx="${f(Ch[0] - T[0])}" data-sy="${f(Ch[1] - T[1] - 30)}" opacity="${opts.out != null ? 1 : 0}"><g transform="translate(${f(T[0])},${f(T[1])})"><circle cx="0" cy="0" r="${rb + 2}" fill="url(#${p}-bg1)" stroke="#155e77" stroke-width="1.4"/><circle cx="0" cy="0" r="${f((rb + 2) * 0.56)}" fill="#ffffff"/>` +
    txt(0, (rb + 2) * 0.32, outN, { size: f((rb + 2) * 0.82), anchor: "middle", mono: true, weight: 800 }) + `</g></g>`;
  const anchors = { top: at(o, 0, 0, cz + R + 56), center: at(o, 0, 0, cz), ground: at(o), drum: at(o, 0, 0, cz), tray: T, chute: Ch };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-BW, BW, -BD, BD, 0, zb], [-HL, HL, -R, R, cz - R, cz + R]], center: anchors.center, glowR: BW * 1.3 }), anchors };
}

// =====================================================================================
// PRNG 机械计数器 prngCounter — 小号熵源：奶白小机箱，正面一个只有 8 档的转盘 + 指针、读数窗，侧面摇柄
// opts: plate（默认 "PRNG"）, window（读数窗文字，默认 "32 位"）, steps（指针初始档位）
// 可动：ID-ptr（指针）, ID-crank（摇柄）→ KIT.tick(tl,ID,t,steps,dur)
// anchors: top, center, ground, dial（转盘中心）
// =====================================================================================
export function prngCounter(o, opts = {}) {
  const p = opts.id ?? "prng", atk = isAtk(opts);
  const W = 64, D = 46, H = 100;
  const body = atk ? M.red : { f: "#f1ece0", s: "#ddd5c4", t: "#faf7f0", st: "#8f8573" };
  let s = contactShadow(o, 90, 64);
  s += rbox(o, -W - 6, W + 6, -D - 6, D + 6, 0, 10, 6, M.ink, { sw: 1.4 });
  s += rbox(o, -W, W, -D, D, 10, H, 10, body, { sw: 1.8 });
  s += rbox(o, -W + 12, W - 12, -D + 10, D - 10, H, H + 8, 6, M.steelLight, { sw: 1.2 });
  // front face
  const fx = 2 * W, dcx = 50, dcy = 52, R = 32;
  let face = `<rect x="6" y="6" width="${fx - 12}" height="${H - 22}" rx="6" fill="none" stroke="${darken(body.s, 0.12)}" stroke-width="1.5"/>`;
  face += `<rect x="${fx - 44}" y="14" width="34" height="16" rx="3" fill="#2b2d31"/>` + txt(fx - 27, 26, opts.plate ?? "PRNG", { size: 9, mono: true, anchor: "middle", fill: "#e9ebee", weight: 800 });
  face += `<defs>${radial(p + "-dg", "#fffdf8", "#ebe5d8", "#b9b0a0")}</defs><circle cx="${dcx + 2}" cy="${dcy + 3}" r="${R + 6}" fill="rgba(0,0,0,0.18)"/><circle cx="${dcx}" cy="${dcy}" r="${R + 6}" fill="#34363b" stroke="#141518" stroke-width="1.5"/><circle cx="${dcx}" cy="${dcy}" r="${R}" fill="url(#${p}-dg)"/>`;
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 - 90) * DEG;
    face += `<line x1="${f(dcx + (R - 9) * Math.cos(a))}" y1="${f(dcy + (R - 9) * Math.sin(a))}" x2="${f(dcx + (R - 2) * Math.cos(a))}" y2="${f(dcy + (R - 2) * Math.sin(a))}" stroke="${C.ink}" stroke-width="3"/>` +
      txt(dcx + (R - 17) * Math.cos(a), dcy + (R - 17) * Math.sin(a) + 3.5, i, { size: 9, anchor: "middle", mono: true, weight: 800 });
  }
  face += `<rect x="${fx - 46}" y="44" width="38" height="20" rx="3" fill="#1d2024" stroke="#5d636b" stroke-width="1.2"/>` + txt(fx - 27, 58, opts.window ?? "32 位", { size: 11, anchor: "middle", fill: "#9ad9ee", weight: 800 });
  face += `<circle cx="${fx - 18}" cy="${H - 26}" r="4" fill="#2bd46f" stroke="rgba(0,0,0,0.3)"/>`;
  const mF = frameV(o, -W, D, H);
  s += G_(matStr(mF), face);
  const st0 = (opts.steps ?? 0) * 45;
  s += rotator(p + "-ptr", frameV(o, -W + dcx, D, H - dcy), 0, 0, st0, `<path d="M-3 4L0 ${-R + 6}L3 4Z" fill="#e0453a" stroke="#8f2620" stroke-width="0.8"/><circle cx="0" cy="0" r="6" fill="#34363b"/><circle cx="-1" cy="-1" r="2" fill="#8b9199"/>`);
  // crank on −u face
  s += rotator(p + "-crank", frameU(o, -W - 4, 0, H * 0.55), 0, 0, st0 * 4,
    `<rect x="-5" y="-5" width="36" height="10" rx="5" fill="#34363b"/><circle cx="0" cy="0" r="7" fill="#a9aeb5" stroke="#5d636b" stroke-width="1.5"/><circle cx="31" cy="0" r="7" fill="#1d93ba" stroke="#155e77" stroke-width="1.5"/>`);
  const anchors = { top: at(o, 0, 0, H + 56), center: at(o, 0, 0, H / 2), ground: at(o), dial: applyM(mF, dcx, dcy) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-W, W, -D, D, 0, H + 8]], center: anchors.center, badgeR: 26, glowR: 120 }), anchors };
}

// =====================================================================================
// 密码转盘 comboDial — 老式保险柜转盘立在底座上
// opts.rings = 1（"32 位"，单圈 32 格刻度）| 8（"256 位"，8 圈同心环叠成的大转盘）; opts.text 覆盖刻字
// 可动：ID-ring-0..n-1（每圈一个 rotator）→ KIT.dialTurn(tl,ID,t,deg,dur)（相邻圈反向、外圈慢）或 KIT.rot(tl,"ID-ring-i",…)
// anchors: top, center, ground, hub（转盘中心）, side（−u 侧面、与转盘同高：传动轴接这里）, back
// =====================================================================================
export function comboDial(o, opts = {}) {
  const p = opts.id ?? "dial", atk = isAtk(opts), n = opts.rings ?? 1, big = n > 1;
  const W = big ? 170 : 92, Hb = big ? 360 : 200, R = big ? 146 : 68, zP = 16, Db = big ? 44 : 34;
  const body = atk ? M.red : M.ink;
  let s = contactShadow(o, W * 1.25, 70);
  s += rbox(o, -W - 14, W + 14, -Db - 14, 14, 0, zP, 8, M.steel, { sw: 1.4 });
  s += rbox(o, -W, W, -Db, 0, zP, zP + Hb, 14, body, { sw: 2 });
  const zc = zP + Hb * (big ? 0.54 : 0.56);
  const mF = frameV(o, 0, 0, zc);
  // engraved plate below
  const text = opts.text ?? (big ? "256 位" : "32 位");
  s += G_(matStr(mF), `<rect x="${-(big ? 74 : 46)}" y="${R + (big ? 18 : 12)}" width="${big ? 148 : 92}" height="${big ? 40 : 28}" rx="5" fill="#d9dcdf" stroke="#7d828a" stroke-width="1.5"/>` +
    txt(0, R + (big ? 47 : 33), text, { size: big ? 26 : 18, anchor: "middle", fill: "#2b2d31" }));
  // bezel (extruded)
  s += extrudeLocal(mF, `<circle cx="0" cy="0" r="${R + 10}" fill="#16171a"/>`, `<circle cx="0" cy="0" r="${R + 10}" fill="#2b2d31" stroke="#0e0f11" stroke-width="2"/>`, V, 8, 2);
  s += `<defs>${radial(p + "-cg", "#ffffff", "#c3c7cc", "#7d828a")}${radial(p + "-cg2", "#f4f5f6", "#a9aeb5", "#5d636b")}</defs>`;
  const a0 = opts.angle ?? 0;
  if (!big) {
    let ring = `<circle cx="0" cy="0" r="${R}" fill="url(#${p}-cg)" stroke="#5d636b" stroke-width="1.5"/>`;
    for (let i = 0; i < 32; i++) {
      const a = (i * (360 / 32) - 90) * DEG, l = i % 4 ? 7 : 13;
      ring += `<line x1="${f((R - 2) * Math.cos(a))}" y1="${f((R - 2) * Math.sin(a))}" x2="${f((R - 2 - l) * Math.cos(a))}" y2="${f((R - 2 - l) * Math.sin(a))}" stroke="#1d1f23" stroke-width="${i % 4 ? 1.4 : 2.6}"/>`;
      if (i % 4 === 0) ring += txt((R - 24) * Math.cos(a), (R - 24) * Math.sin(a) + 4, i, { size: 11, anchor: "middle", mono: true, weight: 800, fill: "#1d1f23" });
    }
    ring += `<circle cx="0" cy="0" r="${R * 0.4}" fill="#2b2d31" stroke="#0e0f11" stroke-width="1.5"/>`;
    for (let i = 0; i < 16; i++) { const a = i * 22.5 * DEG; ring += `<line x1="${f(R * 0.33 * Math.cos(a))}" y1="${f(R * 0.33 * Math.sin(a))}" x2="${f(R * 0.4 * Math.cos(a))}" y2="${f(R * 0.4 * Math.sin(a))}" stroke="#5a5e65" stroke-width="2"/>`; }
    ring += `<circle cx="-4" cy="-4" r="${R * 0.16}" fill="#5a5e65"/>`;
    s += rotator(p + "-ring-0", mF, 0, 0, a0, ring);
  } else {
    const r0 = R * 0.22, w = (R - r0) / n;
    for (let i = n - 1; i >= 0; i--) {
      const ro = r0 + (i + 1) * w, ri = r0 + i * w;
      let ring = `<circle cx="0" cy="0" r="${f(ro)}" fill="${i % 2 ? "url(#" + p + "-cg2)" : "url(#" + p + "-cg)"}" stroke="#3b3e44" stroke-width="1.6"/>`;
      const nt = 12 + i * 4;
      for (let k = 0; k < nt; k++) { const a = (k * 360 / nt - 90) * DEG; ring += `<line x1="${f((ro - 1.5) * Math.cos(a))}" y1="${f((ro - 1.5) * Math.sin(a))}" x2="${f((ro - (k % 4 ? 5 : 9)) * Math.cos(a))}" y2="${f((ro - (k % 4 ? 5 : 9)) * Math.sin(a))}" stroke="#1d1f23" stroke-width="${k % 4 ? 1.1 : 2}"/>`; }
      ring += `<circle cx="0" cy="${f(-(ri + w / 2))}" r="${f(w * 0.2)}" fill="#1d93ba" stroke="#155e77" stroke-width="1"/>`;
      ring += `<circle cx="0" cy="0" r="${f(ri)}" fill="#2b2d31"/>`;
      s += rotator(`${p}-ring-${i}`, mF, 0, 0, a0 * (i % 2 ? -1 : 1), ring);
    }
    s += G_(matStr(mF), `<circle cx="0" cy="0" r="${f(r0)}" fill="#2b2d31" stroke="#0e0f11" stroke-width="2"/><circle cx="-5" cy="-5" r="${f(r0 * 0.4)}" fill="#5a5e65"/>`);
  }
  // index marker
  s += G_(matStr(mF), `<path d="M-8 ${-R - 22}L8 ${-R - 22}L0 ${-R - 9}Z" fill="#2aa3c9" stroke="#ffffff" stroke-width="1.5"/>`);
  // −u side: shaft socket
  s += G_(faceU(o, -W, -Db / 2, zc), `<circle cx="0" cy="0" r="${big ? 18 : 12}" fill="#5a5e65" stroke="#16171a" stroke-width="2"/><circle cx="0" cy="0" r="${big ? 8 : 5}" fill="#16171a"/>`);
  const anchors = { top: at(o, 0, -Db / 2, zP + Hb + 50), center: at(o, 0, 0, zc), ground: at(o), hub: applyM(mF, 0, 0), side: at(o, -W, -Db / 2, zc), back: at(o, 0, -Db, zc), rings: n };
  return { svg: shell(p, o, opts, { solid: `<g id="${p}-dialroot" data-n="${n}">${s}</g>`, wire: [[-W, W, -Db, 0, zP, zP + Hb], [-W - 14, W + 14, -Db - 14, 14, 0, zP]], center: anchors.center, glowR: W * 1.4 }), anchors };
}

// =====================================================================================
// 传动轴 shaft — 两点之间的钢轴，两端万向节；转动 = 轴面条纹滚动
// opts: a=[du,dv,z], b=[du,dv,z]（相对 origin 的两端）, r=8, color
// 可动：ID-st（条纹）→ KIT.shaftSpin(tl,ID,t,dur,dist)；高亮用 ID-hi（青蓝外发光层，opacity）
// anchors: a, b, center, top, ground
// =====================================================================================
export function shaft(o, opts = {}) {
  const p = opts.id ?? "shaft", atk = isAtk(opts);
  const a = opts.a ?? [-200, 0, 100], b = opts.b ?? [200, 0, 100], r = opts.r ?? 8;
  const A = at(o, ...a), B = at(o, ...b), col = atk ? "#c23a30" : "#5d636b";
  const L = (q) => `M${pts([A])}L${pts([B])}`;
  let s = `<path id="${p}-hi" d="${L()}" stroke="#2aa3c9" stroke-width="${2 * r + 14}" stroke-linecap="round" opacity="${opts.hi ? 0.45 : 0}" fill="none"/>`;
  s += `<path d="${L()}" stroke="#1d1f23" stroke-width="${2 * r + 3}" stroke-linecap="round" fill="none"/><path d="${L()}" stroke="${col}" stroke-width="${2 * r}" stroke-linecap="round" fill="none"/>`;
  s += `<path id="${p}-st" d="${L()}" stroke="#c3c7cc" stroke-width="${2 * r - 4}" stroke-dasharray="5 13" stroke-dashoffset="0" fill="none" opacity="0.75"/>`;
  s += `<path d="${L()}" stroke="#ffffff" stroke-width="2.4" fill="none" opacity="0.6" transform="translate(0,${-r * 0.45})"/>`;
  for (const P of [A, B]) s += `<circle cx="${f(P[0])}" cy="${f(P[1])}" r="${r + 5}" fill="#8b9199" stroke="#1d1f23" stroke-width="2"/><circle cx="${f(P[0])}" cy="${f(P[1])}" r="${r * 0.5}" fill="#1d1f23"/>`;
  const anchors = { a: A, b: B, center: [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], top: [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - 40], ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [{ path: L() }], center: anchors.center, badgeR: 22 }), anchors };
}

// =====================================================================================
// 骰子 die — 白色等距骰子（可单独用；diceCup 里也用它）
// opts: top（顶面点数 1–6）, size=34, black（顶面涂黑 = "偏置"：黑底白点）, z（悬空高度）
// 可动：ID-d（骰子组，内含 ID-d-v1..v6 六个顶面朝向，同时只显示一个）→ KIT.roll(tl,"ID-d",t,value)
// anchors: top, center, ground
// =====================================================================================
const sideOf = (t) => { const ok = [1, 2, 3, 4, 5, 6].filter((x) => x !== t && x !== 7 - t); return [ok[0], ok.find((x) => x !== ok[0] && x !== 7 - ok[0])]; };
function dieBody(o, du, dv, z, sz, top, black, atk) {
  const m = atk ? RED : { f: "#f7f4ee", s: "#e2dccf", t: "#ffffff", st: "#8d8577" };
  const [front, left] = sideOf(top);
  const pipC = atk ? "#ffffff" : C.ink;
  let s = rbox(o, du - sz / 2, du + sz / 2, dv - sz / 2, dv + sz / 2, z, z + sz, 5, m, { sw: 1.4, topFill: black ? "#1d1f23" : m.t });
  s += G_(faceTop(o, du - sz / 2, dv - sz / 2, z + sz), pipSvg(top, sz, black ? "#ffffff" : (top === 1 && !atk ? "#e0453a" : pipC)));
  s += G_(faceU(o, du - sz / 2, dv - sz / 2, z + sz), pipSvg(left, sz, pipC));
  s += G_(faceV(o, du - sz / 2, dv + sz / 2, z + sz), pipSvg(front, sz, pipC));
  return s;
}
export function die(o, opts = {}) {
  const p = opts.id ?? "die", sz = opts.size ?? 42, z = opts.z ?? 0, top = opts.top ?? 5, atk = isAtk(opts);
  let s = contactShadow(o, sz * 0.9, sz * 0.7);
  s += dieVariants(p + "-d", o, 0, 0, z, sz, top, opts.black, atk);
  const anchors = { top: at(o, 0, 0, z + sz + 40), center: at(o, 0, 0, z + sz / 2), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-sz / 2, sz / 2, -sz / 2, sz / 2, z, z + sz]], center: anchors.center, badgeR: 18 }), anchors };
}
function dieVariants(p, o, du, dv, z, sz, top, black, atk) {
  let s = "";
  for (let v = 1; v <= 6; v++) s += `<g id="${p}-v${v}" opacity="${v === top ? 1 : 0}">${dieBody(o, du, dv, z, sz, v, black, atk)}</g>`;
  return `<g id="${p}" data-v="${top}">${s}</g>`;
}

// =====================================================================================
// nonce 骰子杯 diceCup — 皮质骰子杯扣在深色毡垫上，杯下两颗白骰子
// opts: dice=[3,5]（两颗顶面点数；"重用"就给两次相同）, up=false（杯子掀开）, black=false（偏置：骰子顶面涂黑）
// 可动：ID-cup（杯子）→ KIT.cup(tl,ID,t,up,dur) 掀开/扣上；KIT.cupShake(tl,ID,t,dur) 摇杯
//       ID-d0 / ID-d1（骰子，内含 v1..v6）→ KIT.roll(tl,"ID-d0",t,点数)
// anchors: top, center, ground, dice（两颗骰子中间上方）, cupUp（掀开后杯子位置）
// =====================================================================================
export function diceCup(o, opts = {}) {
  const p = opts.id ?? "cup", atk = isAtk(opts), dice = opts.dice ?? [3, 5], up = !!opts.up;
  const felt = { f: "#2f6273", s: "#234c5a", t: "#3b7487", st: "#173640" };
  let s = contactShadow(o, 130, 100);
  s += cyl(o, 0, 0, 104, 0, 10, felt, { sw: 1.6, seg: 48 });
  s += G_(faceTop(o, 0, 0, 10), `<circle cx="0" cy="0" r="92" fill="none" stroke="#5c94a6" stroke-width="2" stroke-dasharray="6 6"/>`);
  const sz = 40;
  const pos = [[-28, 16], [26, -20]].sort((a, b) => depth(a[0], a[1], 0) - depth(b[0], b[1], 0));
  for (let i = 0; i < 2; i++) s += dieVariants(`${p}-d${i}`, o, pos[i][0], pos[i][1], 10, sz, dice[i], opts.black, false);
  // cup (upside down: mouth at the felt)
  const leather = atk ? RED : { f: "#8a5434", s: "#6b3e23", t: "#a86c47", st: "#3f2312" };
  const r0 = 62, r1 = 50, h = 118, z0 = 10;
  let cup = frustum(o, 0, 0, r0, r1, z0, z0 + h, leather, { sw: 1.8, seg: 40, topFill: darken(leather.t, 0.06) });
  // stitched bands + rim lip
  const band = (z, r, col, dash, w) => { const c = circlePlan(0, 0, r, 40).filter((q) => depth(q[0], q[1], 0) > -2).sort((a, b) => Math.atan2(a[1] - 0, a[0]) - Math.atan2(b[1], b[0])); return ""; };
  const arc = (z, r, col, w, dash = "") => {
    const ptsA = []; for (let i = 0; i <= 36; i++) { const a = (-SA * 0 + (i / 36) * 180 + 125) * DEG; ptsA.push([r * Math.cos(a + 0), r * Math.sin(a)]); }
    // front half: plan angles whose depth > 0 → between 35°+90°.. pick by depth
    const ring = []; for (let i = 0; i <= 72; i++) { const a = (i / 72) * 2 * Math.PI, q = [r * Math.cos(a), r * Math.sin(a)]; if (depth(q[0], q[1], 0) >= 0) ring.push(q); }
    ring.sort((A, B) => (A[0] * CA + A[1] * SA) - (B[0] * CA + B[1] * SA));
    return line3(o, ring.map((q) => [q[0], q[1], z]), col, w, dash ? `stroke-dasharray="${dash}"` : "");
  };
  cup += arc(z0 + 8, r0 - 0.6, darken(leather.s, 0.25), 7) + arc(z0 + 16, r0 - 1.5, "#e9d3b8", 1.6, "5 5");
  cup += arc(z0 + h - 14, r1 + 1.5, darken(leather.s, 0.25), 6) + arc(z0 + h - 20, r1 + 2, "#e9d3b8", 1.6, "5 5");
  cup += G_(faceTop(o, 0, 0, z0 + h), `<circle cx="0" cy="0" r="${r1 - 12}" fill="none" stroke="${darken(leather.t, 0.25)}" stroke-width="2"/><circle cx="0" cy="0" r="${r1 - 18}" fill="none" stroke="#e9d3b8" stroke-width="1.4" stroke-dasharray="4 4"/>`);
  const hl0 = at(o, -r0 * 0.62, r0 * 0.5, z0 + 26), hl1 = at(o, -r1 * 0.62, r1 * 0.5, z0 + h - 26);
  cup += `<path d="M${pts([hl0])}L${pts([hl1])}" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.28"/>`;
  const piv = at(o, -r0, 0, z0);
  const dx = -150, dy = -120, rotUp = -28;
  const k0 = up ? 1 : 0;
  s += `<g id="${p}-cup" data-px="${f(piv[0])}" data-py="${f(piv[1])}" data-dx="${dx}" data-dy="${dy}" data-r="${rotUp}" data-k="${k0}" transform="translate(${f(dx * k0)},${f(dy * k0)}) rotate(${f(rotUp * k0)} ${f(piv[0])} ${f(piv[1])})">${cup}</g>`;
  const anchors = { top: at(o, 0, 0, z0 + h + 60), center: at(o, 0, 0, 60), ground: at(o), dice: at(o, 0, 0, 10 + sz + 30), cupUp: [at(o, 0, 0, 80)[0] + dx, at(o, 0, 0, 80)[1] + dy] };
  return { svg: shell(p, o, opts, { solid: s, wire: [{ cyl: [0, 0, 104, 0, 10] }, { cyl: [0, 0, r0, z0, z0 + h] }], center: anchors.center, glowR: 150 }), anchors };
}

// =====================================================================================
// 金属助记词板 mnemonicPlate — 不锈钢板斜立在支架上，刻 12 个编号单词槽（只用短横线示意，不写真实单词）
// opts: n=12, filled=true（槽里刻了横线）, title="助记词"
// 可动：ID-w-0..n-1（每个槽里的刻痕组，逐个 opacity 0→1 = "刻上"）
// anchors: top, center, ground, plate（板中心）
// =====================================================================================
export function mnemonicPlate(o, opts = {}) {
  const p = opts.id ?? "mn", atk = isAtk(opts), n = opts.n ?? 12;
  const W = 250, Hh = 168, tilt = 24, vb = 30, zb0 = 16;
  let s = contactShadow(o, 160, 90);
  s += rbox(o, -W / 2 - 10, W / 2 + 10, -50, vb + 22, 0, zb0, 6, M.ink, { sw: 1.4 });
  s += box(o, -W / 2 + 10, W / 2 - 10, vb - 6, vb + 8, zb0, zb0 + 16, M.steel, 1.2);
  const lidTopV = vb - Hh * Math.sin(tilt * DEG), lidTopZ = zb0 + 10 + Hh * Math.cos(tilt * DEG);
  const m = frameTilt(o, -W / 2, lidTopV, lidTopZ, tilt);
  // back strut
  s += line3(o, [[-W / 2 + 30, -46, zb0], [-W / 2 + 30, lidTopV + 30, lidTopZ - 40]], "#3b3e44", 8) + line3(o, [[W / 2 - 30, -46, zb0], [W / 2 - 30, lidTopV + 30, lidTopZ - 40]], "#3b3e44", 8);
  const th = [-6 * Math.cos(tilt * DEG) * V[0], -6 * Math.cos(tilt * DEG) * V[1] - 6 * Math.sin(tilt * DEG) * CE];
  const steelC = atk ? { a: "#f2b1aa", b: "#e8574c", e: "#a8322a" } : { a: "#eef0f2", b: "#c9cdd2", e: "#7d828a" };
  s += `<g transform="translate(${f(th[0])},${f(th[1])})">${G_(matStr(m), `<rect x="0" y="0" width="${W}" height="${Hh}" rx="10" fill="${steelC.e}"/>`)}</g>`;
  let c = `<defs><linearGradient id="${p}-sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${steelC.a}"/><stop offset="0.5" stop-color="${steelC.b}"/><stop offset="1" stop-color="${steelC.a}"/></linearGradient></defs>
    <rect x="0" y="0" width="${W}" height="${Hh}" rx="10" fill="url(#${p}-sg)" stroke="${steelC.e}" stroke-width="2"/>`;
  for (let i = 0; i < 26; i++) c += `<line x1="12" y1="${8 + i * 6}" x2="${W - 12}" y2="${8 + i * 6}" stroke="#ffffff" stroke-width="0.8" opacity="0.35"/>`;
  for (const [x, y] of [[12, 12], [W - 12, 12], [12, Hh - 12], [W - 12, Hh - 12]]) c += `<circle cx="${x}" cy="${y}" r="5" fill="#a9aeb5" stroke="#5d636b" stroke-width="1.2"/><path d="M${x - 3} ${y}H${x + 3}" stroke="#5d636b" stroke-width="1.4"/>`;
  c += txt(W / 2, 30, opts.title ?? "助记词", { size: 16, anchor: "middle", fill: "#3b3e44", weight: 800 }) + `<line x1="24" y1="40" x2="${W - 24}" y2="40" stroke="#7d828a" stroke-width="1.5"/>`;
  const cols = 3, rows = Math.ceil(n / cols), cw = (W - 30) / cols, rh = (Hh - 58) / rows;
  let words = "";
  for (let i = 0; i < n; i++) {
    const cx = 15 + (i % cols) * cw, cy = 50 + Math.floor(i / cols) * rh;
    c += txt(cx + 4, cy + rh * 0.62, String(i + 1).padStart(2, "0"), { size: 11, mono: true, fill: "#5d636b", weight: 800 }) +
      `<rect x="${cx + 24}" y="${cy + 5}" width="${cw - 30}" height="${rh - 10}" rx="3" fill="#a9aeb5" opacity="0.55" stroke="#7d828a" stroke-width="0.8"/>`;
    const nd = 3 + (i * 7) % 3;
    words += `<g id="${p}-w-${i}" opacity="${opts.filled === false ? 0 : 1}">` + Array.from({ length: nd }, (_, k) => `<rect x="${f(cx + 29 + k * ((cw - 40) / nd))}" y="${f(cy + rh / 2 - 1.6)}" width="${f((cw - 40) / nd - 4)}" height="3.2" rx="1.6" fill="#2b2d31"/>`).join("") + `</g>`;
  }
  s += G_(matStr(m), c + words);
  const anchors = { top: at(o, 0, lidTopV, lidTopZ + 40), center: applyM(m, W / 2, Hh / 2), plate: applyM(m, W / 2, Hh / 2), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-W / 2 - 10, W / 2 + 10, -50, vb + 22, 0, zb0], { path: `M${pts([applyM(m, 0, 0)])}L${pts([applyM(m, W, 0)])}L${pts([applyM(m, W, Hh)])}L${pts([applyM(m, 0, Hh)])}Z` }], center: anchors.center, glowR: 170 }), anchors };
}

// =====================================================================================
// 种子罐 seedJar — 玻璃罐 + 钢盖，罐里一颗发光的大种子，罐身贴纸"种子"
// opts: label="种子", lit=true（种子周围青蓝光晕）
// 可动：ID-seed（正常）/ ID-seed-atk（红色，泄露）→ KIT.swap；ID-halo（光晕）
// anchors: top, center, ground, seed
// =====================================================================================
export function seedJar(o, opts = {}) {
  const p = opts.id ?? "seed", atk = isAtk(opts);
  const r = 58, H = 138, zl = H, zt = H + 22;
  let s = contactShadow(o, 80, 60);
  // back glass wall + base
  s += cyl(o, 0, 0, r, 0, 8, { f: "#cfe6ee", s: "#b4d7e3", t: "#e4f2f7", st: "rgba(42,163,201,0.75)" }, { sw: 1.4, seg: 40 });
  const c0 = at(o, 0, 0, 0), sc = at(o, 0, 0, 66);
  s += `<path d="M${f(c0[0] - r)} ${f(at(o, 0, 0, 8)[1])}V${f(at(o, 0, 0, zl)[1])}A${r} ${f(r * SE)} 0 0 1 ${f(c0[0] + r)} ${f(at(o, 0, 0, zl)[1])}V${f(at(o, 0, 0, 8)[1])}Z" fill="rgba(208,234,244,0.35)"/>`;
  // seed + halo
  const seedShape = (a, b, c, st) => `<g transform="translate(${f(sc[0])},${f(sc[1])}) rotate(-28)"><path d="M0 -50C26 -40 32 -6 26 18C20 40 8 50 0 50C-8 50 -20 40 -26 18C-32 -6 -26 -40 0 -50Z" fill="url(#${p}-${a})" stroke="${st}" stroke-width="2"/>
    <path d="M0 -44C4 -16 4 20 0 44" fill="none" stroke="${c}" stroke-width="2.2" opacity="0.7"/><path d="M-14 -30C-20 -14 -20 6 -16 18" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.55"/></g>`;
  s += `<defs>${radial(p + "-sn", "#f3d9b6", "#c98a4a", "#8a5326")}${radial(p + "-sr", "#f8c0b8", "#e0453a", "#a8322a")}<radialGradient id="${p}-hg"><stop offset="0" stop-color="#5cc0e0" stop-opacity="0.55"/><stop offset="1" stop-color="#5cc0e0" stop-opacity="0"/></radialGradient></defs>`;
  s += `<circle id="${p}-halo" cx="${f(sc[0])}" cy="${f(sc[1])}" r="${r * 0.98}" fill="url(#${p}-hg)" opacity="${opts.lit === false ? 0 : 1}"/>`;
  s += `<g id="${p}-seed" opacity="${atk ? 0 : 1}">${seedShape("sn", "", "#7a4a20", "#6a4220")}</g><g id="${p}-seed-atk" opacity="${atk ? 1 : 0}">${seedShape("sr", "", "#8f2620", "#8f2620")}</g>`;
  // front glass: tint, rim, highlights
  s += `<path d="M${f(c0[0] - r)} ${f(at(o, 0, 0, zl)[1])}V${f(at(o, 0, 0, 8)[1])}A${r} ${f(r * SE)} 0 0 0 ${f(c0[0] + r)} ${f(at(o, 0, 0, 8)[1])}V${f(at(o, 0, 0, zl)[1])}" fill="rgba(208,234,244,0.22)" stroke="rgba(42,163,201,0.8)" stroke-width="2.4"/>`;
  s += `<path d="M${f(c0[0] - r * 0.72)} ${f(at(o, 0, 0, zl - 14)[1] + 18)}V${f(at(o, 0, 0, 30)[1] + 18)}" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity="0.6"/><path d="M${f(c0[0] - r * 0.52)} ${f(at(o, 0, 0, zl - 30)[1] + 24)}V${f(at(o, 0, 0, 70)[1] + 24)}" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.5"/>`;
  // label band (screen-facing tangent plane = plain screen rect, edges follow the ellipse)
  const lz0 = 22, lz1 = 50, lw = r * 0.82, yA = (z, x) => at(o, 0, 0, z)[1] + r * SE * Math.sqrt(1 - (x / r) ** 2);
  const lab = (z0, z1) => { let d = ""; for (let i = 0; i <= 16; i++) { const x = -lw + (2 * lw * i) / 16; d += `${i ? "L" : "M"}${f(c0[0] + x)} ${f(yA(z1, x))}`; } for (let i = 16; i >= 0; i--) { const x = -lw + (2 * lw * i) / 16; d += `L${f(c0[0] + x)} ${f(yA(z0, x))}`; } return d + "Z"; };
  s += `<path d="${lab(lz0, lz1)}" fill="#fffdf8" stroke="#b8b0a1" stroke-width="1.5"/>` + txt(c0[0], yA(lz0, 0) - 8, opts.label ?? "种子", { size: 17, anchor: "middle", fill: "#17809f" });
  // lid
  const lid = { f: "#8b9199", s: "#6e737b", t: "#a9aeb5", st: "#3b3e44" };
  s += cyl(o, 0, 0, r + 5, zl - 2, zt, lid, { sw: 1.6, seg: 40 });
  for (let i = 0; i < 14; i++) { const a = (125 + i * 9) * DEG; s += line3(o, [[(r + 5) * Math.cos(a), (r + 5) * Math.sin(a), zl + 2], [(r + 5) * Math.cos(a), (r + 5) * Math.sin(a), zt - 3]], "#5d636b", 1.3); }
  const anchors = { top: at(o, 0, 0, zt + 46), center: at(o, 0, 0, 66), seed: sc, ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [{ cyl: [0, 0, r + 5, 0, zt] }], center: anchors.center, badgeR: 26, glowR: 120 }), anchors };
}

// =====================================================================================
// 派生树 deriveTree — 等距小树：树干分出 n 根枝，每根枝末端用细绳挂一把黄铜钥匙；树冠是青蓝浅色叶簇
// opts: n=3（枝数）, levels=1|2（2 = 每根枝再分两叉，钥匙数 2n）, scale=1.4
// 可动：每部件都有正常层和红色层：ID-trunk / ID-trunk-r、ID-br-i / ID-br-i-r、ID-key-i / ID-key-i-r
//       KIT.leak(tl,ID,t,stagger)：树干 → 各枝 → 各钥匙依次变红；state:"attacker" 一开始就全红
// anchors: top, center, ground, keys[]（每把钥匙中心，可接地址门牌连线）, root（树根，接种子罐）
// =====================================================================================
export function deriveTree(o, opts = {}) {
  const p = opts.id ?? "tree", atk = isAtk(opts), n = opts.n ?? 3, lv = opts.levels ?? 1, k = opts.scale ?? 1.4;
  const ax = (d) => [d * CA, d * SA];
  const zT = 120 * k;
  const tips = [];
  const spread = n === 1 ? [0] : Array.from({ length: n }, (_, i) => (-110 + (250 * i) / (n - 1)) * k);
  const branches = spread.map((d, i) => {
    const e = [...ax(d), zT + 92 * k - Math.abs(d) * 0.22], m1 = [...ax(d * 0.35), zT + 40 * k];
    const subs = lv > 1 ? [-1, 1].map((sg) => [...ax(d + sg * 34 * k), e[2] + 34 * k]) : [];
    return { e, m1, subs };
  });
  branches.forEach((b) => (lv > 1 ? b.subs.forEach((q) => tips.push(q)) : tips.push(b.e)));
  const build = (red) => {
    const bark = red ? { a: "#a8322a", b: "#e0453a" } : { a: "#4a3a2c", b: "#7a5d42" };
    const leaf = red ? ["#f08a80", "#e8574c", "#f4b0a8"] : ["#9ad9ee", "#5cc0e0", "#c4e9f5"];
    const brass = red ? RED : BRASS;
    const trunk = frustum(o, 0, 0, 15 * k, 9 * k, 0, zT, { f: bark.b, s: bark.a, t: bark.b, st: darken(bark.a, 0.3) }, { seg: 18, sw: 1.6 }) +
      G_(faceTop(o, 0, 0, 0), `<ellipse cx="0" cy="0" rx="${30 * k}" ry="${22 * k}" fill="${bark.a}" opacity="0.5"/>`) +
      line3(o, [[-14 * k, 6 * k, 6], [-26 * k, 14 * k, 0]], bark.a, 7 * k) + line3(o, [[10 * k, 10 * k, 6], [22 * k, 22 * k, 0]], bark.a, 6 * k);
    const P = (q) => at(o, q[0], q[1], q[2]);
    const stroke = (A, Bm, B, w) => { const a = P(A), m = P(Bm), b = P(B); const d = `M${pts([a])}Q${pts([m])} ${pts([b])}`; return `<path d="${d}" stroke="${darken(bark.a, 0.35)}" stroke-width="${w + 3}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${bark.b}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`; };
    const leaves = (q, ci) => { const c = P(q); let l = ""; [[-18, -14, 20], [14, -18, 18], [0, -30, 18], [-4, -8, 16], [20, -4, 14]].forEach(([x, y, r], j) => { x *= k; y *= k; r *= k; l += `<ellipse cx="${f(c[0] + x)}" cy="${f(c[1] + y)}" rx="${f(r)}" ry="${f(r * 0.78)}" fill="${leaf[(j + ci) % 3]}" stroke="${darken(leaf[1], 0.3)}" stroke-width="1.2"/>`; }); return l; };
    const br = branches.map((b, i) => {
      let g = stroke([0, 0, zT - 6], b.m1, b.e, 9 * k);
      if (lv > 1) b.subs.forEach((q) => { g += stroke(b.e, [(b.e[0] + q[0]) / 2, (b.e[1] + q[1]) / 2, q[2]], q, 5 * k); });
      (lv > 1 ? b.subs : [b.e]).forEach((q, j) => { g += leaves(q, i + j); });
      return g;
    });
    const keys = tips.map((q) => {
      const c = P(q), y0 = c[1] + 6, L = 34 * k;
      const kx = c[0], ky = y0 + L;
      return `<line x1="${f(kx)}" y1="${f(y0)}" x2="${f(kx)}" y2="${f(ky - 12)}" stroke="#5d636b" stroke-width="1.6"/>` +
        `<g transform="translate(${f(kx)},${f(ky)}) scale(${f4(0.42 * k)}) rotate(90)"><circle cx="0" cy="0" r="30" fill="${brass.f}" stroke="${brass.st}" stroke-width="3"/><circle cx="-6" cy="0" r="11" fill="#efebe3" stroke="${brass.st}" stroke-width="2.4"/>
        <path d="M26 -8H128V8H118V20H108V8H98V16H88V8H26Z" fill="${brass.f}" stroke="${brass.st}" stroke-width="3" stroke-linejoin="round"/><path d="M-18 -22A30 30 0 0 1 14 -27" fill="none" stroke="${brass.t}" stroke-width="5" stroke-linecap="round"/></g>`;
    });
    return { trunk, br, keys };
  };
  const N = build(false), Rr = build(true);
  const lay = (id, a, b) => `<g id="${id}" opacity="${atk ? 0 : 1}">${a}</g><g id="${id}-r" opacity="${atk ? 1 : 0}">${b}</g>`;
  let s = contactShadow(o, 110 * k, 70 * k);
  s += lay(`${p}-trunk`, N.trunk, Rr.trunk);
  // draw far branches first (painter): by depth of the tip
  const order = branches.map((b, i) => i).sort((a, b) => depth(branches[a].e[0], branches[a].e[1], 0) - depth(branches[b].e[0], branches[b].e[1], 0));
  for (const i of order) s += lay(`${p}-br-${i}`, N.br[i], Rr.br[i]);
  tips.forEach((q, i) => { s += lay(`${p}-key-${i}`, N.keys[i], Rr.keys[i]); });
  s = `<g id="${p}-parts" data-nb="${branches.length}" data-nk="${tips.length}">${s}</g>`;
  const anchors = { top: at(o, 0, 0, zT + (92 + 70 + (lv > 1 ? 34 : 0)) * k), center: at(o, 0, 0, zT), ground: at(o), root: at(o, 0, 0, 0), keys: tips.map((q) => { const c = at(o, q[0], q[1], q[2]); return [c[0], c[1] + 40 * k]; }) };
  return { svg: shell(p, o, opts, { solid: s, wire: [{ cyl: [0, 0, 15 * k, 0, zT] }, { path: tips.map((q) => `M${pts([at(o, 0, 0, zT)])}L${pts([at(o, ...q)])}`).join("") }], center: anchors.center, glowR: 150 * k }), anchors };
}

// =====================================================================================
// GPU 枚举机 gpuRig — 黑色机箱，+v 侧板是透明玻璃，露出主板与两张竖装的三风扇显卡；正面电源键与指示灯；可带网线
// opts: gpus=2, cable="none"|"on"|"cut"（"cut" = 剪断的网线：离线）, leds（显卡灯带颜色，默认青蓝）
// 可动：ID-fan-0..（每个风扇 rotator）→ KIT.fans(tl,ID,t,dur,rps)；ID-led-0（电源灯，KIT.led）
//       ID-cable-a / ID-cable-b（网线两段，cut 时分开），ID-cut（断口铜丝）
// anchors: top, center, ground, glass（侧板中心）, cableEnd（网线远端）, cut（断口）
// =====================================================================================
export function gpuRig(o, opts = {}) {
  const p = opts.id ?? "gpu", atk = isAtk(opts), ng = opts.gpus ?? 2;
  const u0 = -128, u1 = 128, v0 = -66, v1 = 66, z0 = 16, z1 = 330;
  const caseM = atk ? mat("#b8392f") : M.ink;
  let s = contactShadow(o, 200, 120);
  // network cable behind / left
  const cab = opts.cable ?? "none";
  if (cab !== "none") {
    const path = [[u0 - 2, -36, 70], [u0 - 30, -36, 52], [u0 - 54, -30, 6], [u0 - 200, -10, 4], [u0 - 330, 4, 4]];
    s += box(o, u0 - 360, u0 - 330, -18, 26, 0, 70, M.white, 1.4) + G_(faceV(o, u0 - 360, 26, 50), `<rect x="7" y="6" width="16" height="14" rx="2" fill="#2b2d31"/>`);
    if (cab === "on") s += `<g id="${p}-cable-a">${line3(o, path, "#155e77", 13)}${line3(o, path, "#2aa3c9", 8)}</g>`;
    else {
      const A = path.slice(0, 4).concat([[u0 - 150, -14, 4]]), B = [[u0 - 196, -10, 4], [u0 - 330, 4, 4]];
      s += `<g id="${p}-cable-a">${line3(o, A, "#155e77", 13)}${line3(o, A, "#2aa3c9", 8)}</g><g id="${p}-cable-b">${line3(o, B, "#155e77", 13)}${line3(o, B, "#2aa3c9", 8)}</g>`;
      const ca = at(o, u0 - 150, -14, 4), cb = at(o, u0 - 196, -10, 4);
      s += `<g id="${p}-cut">` + [[-4, -6], [-2, 5], [3, -3]].map(([x, y]) => `<path d="M${f(ca[0])} ${f(ca[1])}l${f(-10 + x)} ${f(y - 3)}" stroke="#d98b3a" stroke-width="2" stroke-linecap="round"/><path d="M${f(cb[0])} ${f(cb[1])}l${f(10 + x)} ${f(y)}" stroke="#d98b3a" stroke-width="2" stroke-linecap="round"/>`).join("") +
        `<path d="M${f((ca[0] + cb[0]) / 2 - 8)} ${f((ca[1] + cb[1]) / 2 - 22)}l8 10l-6 2l10 12" fill="none" stroke="#e0453a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    }
  }
  // feet
  for (const [a, b] of [[u0 + 14, v0 + 10], [u1 - 34, v0 + 10], [u0 + 14, v1 - 30], [u1 - 34, v1 - 30]]) s += box(o, a, a + 20, b, b + 20, 0, z0, M.dark, 1);
  // shell faces (−u front panel, top) — +v face drawn as frame around the window
  const A = (u, v, z) => at(o, u, v, z), S = `stroke="${caseM.st}" stroke-width="2" stroke-linejoin="round"`;
  s += `<polygon points="${pts([A(u0, v0, z0), A(u0, v1, z0), A(u0, v1, z1), A(u0, v0, z1)])}" fill="${caseM.f}" ${S}/>`;
  s += `<polygon points="${pts([A(u0, v0, z1), A(u1, v0, z1), A(u1, v1, z1), A(u0, v1, z1)])}" fill="${caseM.t}" ${S}/>`;
  // front panel detail (mesh, power, leds)
  let fp = `<rect x="12" y="14" width="${v1 - v0 - 24}" height="${z1 - z0 - 70}" rx="6" fill="${darken(caseM.f, 0.25)}"/>`;
  for (let r = 0; r < 22; r++) for (let c = 0; c < 8; c++) fp += `<circle cx="${f(22 + c * 13 + (r % 2) * 6)}" cy="${f(26 + r * 10.4)}" r="3" fill="${darken(caseM.f, 0.5)}"/>`;
  fp += `<circle cx="${(v1 - v0) / 2}" cy="${z1 - z0 - 32}" r="11" fill="#1d1f23" stroke="#2aa3c9" stroke-width="3"/><path d="M${(v1 - v0) / 2} ${z1 - z0 - 40}v7" stroke="#2aa3c9" stroke-width="2.4" stroke-linecap="round"/>` +
    ledSvg(p + "-led-0", 26, z1 - z0 - 32, 4, "green") + `<rect x="${v1 - v0 - 44}" y="${z1 - z0 - 36}" width="20" height="8" rx="2" fill="#1d1f23"/>`;
  s += G_(faceU(o, u0, v0, z1), fp);
  // top vents
  s += G_(faceTop(o, u0 + 30, v0 + 20, z1), Array.from({ length: 9 }, (_, i) => `<rect x="${i * 22}" y="0" width="12" height="${v1 - v0 - 40}" rx="4" fill="${darken(caseM.t, 0.35)}"/>`).join(""));
  // cavity through the glass
  const m = 16, wu0 = u0 + m, wu1 = u1 - m, wz0 = z0 + m, wz1 = z1 - m, vb = v0 + 8;
  const win = [A(wu0, v1, wz0), A(wu1, v1, wz0), A(wu1, v1, wz1), A(wu0, v1, wz1)];
  let cav = `<polygon points="${pts([A(wu0, vb, wz0), A(wu1, vb, wz0), A(wu1, vb, wz1), A(wu0, vb, wz1)])}" fill="#1b1d21"/>` +
    `<polygon points="${pts([A(wu1, vb, wz0), A(wu1, v1, wz0), A(wu1, v1, wz1), A(wu1, vb, wz1)])}" fill="#26282d"/>` +
    `<polygon points="${pts([A(wu0, vb, wz0), A(wu1, vb, wz0), A(wu1, v1, wz0), A(wu0, v1, wz0)])}" fill="#30333a"/>`;
  // motherboard on the back wall
  let mb = `<rect x="0" y="0" width="190" height="200" rx="4" fill="#20343c" stroke="#2f5d6b" stroke-width="2"/>`;
  for (let i = 0; i < 9; i++) mb += `<path d="M${10 + i * 18} 200V${120 - (i % 3) * 20}H${30 + i * 16}" fill="none" stroke="#2f7f96" stroke-width="1.4" opacity="0.8"/>`;
  mb += `<rect x="62" y="22" width="56" height="56" rx="4" fill="#3b3e44" stroke="#5d636b" stroke-width="1.5"/><circle cx="90" cy="50" r="22" fill="#1d1f23" stroke="#8b9199" stroke-width="2"/>` + [0, 1, 2, 3].map((i) => `<rect x="${136 + i * 10}" y="16" width="6" height="74" rx="2" fill="#5cc0e0" stroke="#155e77" stroke-width="0.8"/>`).join("");
  cav += G_(faceV(o, wu0 + 20, vb, wz1 - 6), mb);
  // PSU shroud
  cav += box(o, wu0, wu1, vb, v1 - 4, wz0, wz0 + 46, { f: "#3b3e44", s: "#2b2d31", t: "#45484f", st: "#141518" }, 1.4);
  cav += G_(faceV(o, wu0 + 14, v1 - 4, wz0 + 32), Array.from({ length: 12 }, (_, i) => `<rect x="${i * 17}" y="0" width="10" height="18" rx="2" fill="#1d1f23"/>`).join(""));
  // GPUs (vertical mount, fans facing the glass)
  const gpuM = { f: "#4a4d53", s: "#3a3d42", t: "#5c6067", st: "#141518" };
  const gzs = ng === 1 ? [[150, 230]] : [[208, 284], [118, 194]];
  let fans = 0;
  for (const [gz0, gz1] of gzs.slice(0, ng)) {
    const gu0 = wu0 + 10, gu1 = wu1 - 18, gv0 = 4, gv1 = 34;
    cav += box(o, gu0, gu1, gv0, gv1, gz0, gz1, gpuM, 1.6);
    const hgt = gz1 - gz0, wid = gu1 - gu0;
    cav += G_(faceV(o, gu0, gv1, gz1), `<rect x="4" y="4" width="${wid - 8}" height="${hgt - 8}" rx="6" fill="#2b2d31"/><rect x="6" y="${hgt - 10}" width="${wid - 12}" height="4" rx="2" fill="${opts.leds ?? "#5cc0e0"}"/>` +
      `<path d="M4 10L22 4H${wid - 22}L${wid - 4} 10" fill="none" stroke="#6e737b" stroke-width="2"/>`);
    cav += G_(faceTop(o, gu0, gv0, gz1), `<rect x="10" y="6" width="${wid - 20}" height="18" rx="3" fill="#7d828a"/>` + Array.from({ length: 14 }, (_, i) => `<line x1="${16 + i * ((wid - 32) / 13)}" y1="8" x2="${16 + i * ((wid - 32) / 13)}" y2="22" stroke="#3b3e44" stroke-width="2"/>`).join(""));
    const fr = Math.min(hgt / 2 - 6, 30);
    for (let k = 0; k < 3; k++) {
      const fu = gu0 + wid * (0.18 + k * 0.32);
      let blades = `<circle cx="0" cy="0" r="${fr + 3}" fill="#141518" stroke="#5d636b" stroke-width="1.5"/>`;
      for (let b = 0; b < 9; b++) { const a = b * 40; blades += `<path d="M0 0C${f(fr * 0.2)} ${f(-fr * 0.5)} ${f(fr * 0.75)} ${f(-fr * 0.75)} ${f(fr * 0.95)} ${f(-fr * 0.3)}C${f(fr * 0.6)} ${f(-fr * 0.2)} ${f(fr * 0.3)} -2 0 0Z" fill="#7d828a" stroke="#3b3e44" stroke-width="0.8" transform="rotate(${a})"/>`; }
      blades += `<circle cx="0" cy="0" r="${f(fr * 0.32)}" fill="#2b2d31" stroke="#5cc0e0" stroke-width="2"/><circle cx="-2" cy="-2" r="${f(fr * 0.1)}" fill="#8b9199"/>`;
      cav += rotator(`${p}-fan-${fans}`, frameV(o, fu, gv1, (gz0 + gz1) / 2), 0, 0, (fans * 17) % 40, blades);
      fans++;
    }
  }
  s += `<defs><clipPath id="${p}-wc"><polygon points="${pts(win)}"/></clipPath></defs><g id="${p}-cav" data-nf="${fans}" clip-path="url(#${p}-wc)">${cav}</g>`;
  // +v frame around the window
  const outer = [A(u0, v1, z0), A(u1, v1, z0), A(u1, v1, z1), A(u0, v1, z1)];
  s += `<path d="M${pts([outer[0]])}L${pts([outer[1]])}L${pts([outer[2]])}L${pts([outer[3]])}ZM${pts([win[0]])}L${pts([win[3]])}L${pts([win[2]])}L${pts([win[1]])}Z" fill="${caseM.s}" fill-rule="evenodd" ${S}/>`;
  // glass + reflections
  s += `<polygon points="${pts(win)}" fill="rgba(208,234,244,0.13)" stroke="#5d636b" stroke-width="1.4"/>`;
  const gl = (a, b, w, op) => `<path d="M${pts([A(wu0 + a, v1, wz1)])}L${pts([A(wu0 + b, v1, wz0)])}" stroke="#ffffff" stroke-width="${w}" opacity="${op}" clip-path="url(#${p}-wc)"/>`;
  s += gl(30, -60, 18, 0.12) + gl(70, -20, 6, 0.16) + gl(190, 100, 26, 0.08);
  for (const [uu, zz] of [[u0 + 8, z0 + 8], [u1 - 8, z0 + 8], [u0 + 8, z1 - 8], [u1 - 8, z1 - 8]]) { const q = A(uu, v1, zz); s += `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="3.5" fill="#8b9199" stroke="#141518" stroke-width="1"/>`; }
  const anchors = { top: at(o, 0, 0, z1 + 54), center: at(o, 0, v1, (z0 + z1) / 2), glass: at(o, 0, v1, (z0 + z1) / 2), ground: at(o), cableEnd: at(o, u0 - 345, 4, 70), cut: at(o, u0 - 173, -12, 4) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0, u1, v0, v1, z0, z1]], center: anchors.center, glowR: 210 }), anchors };
}

// =====================================================================================
// 滚动计数器 rollCounter — 老式里程表：黑色机身，白色数字轮，飞速滚动
// opts: digits=10, value=0, z（放在别的物件顶上时的底高）
// 可动：ID-dg-0..（每个数字轮，0 是个位）→ KIT.count(tl,ID,t,dur,from,to)
// anchors: top, center, ground, window
// =====================================================================================
export function rollCounter(o, opts = {}) {
  const p = opts.id ?? "ctr", atk = isAtk(opts), nd = opts.digits ?? 10, z = opts.z ?? 0, val = opts.value ?? 0;
  const pitch = 26, W = nd * pitch + 40, Dp = 50, H = 76;
  const bodyM = atk ? M.red : M.ink;
  let s = z ? "" : contactShadow(o, W * 0.7, 50);
  s += rbox(o, -W / 2, W / 2, -Dp / 2, Dp / 2, z, z + H, 8, bodyM, { sw: 1.8 });
  const wx = 20, wy = 18, wh = 40;
  let face = `<rect x="${wx - 6}" y="${wy - 6}" width="${nd * pitch + 12}" height="${wh + 12}" rx="6" fill="#141518" stroke="#2aa3c9" stroke-width="2"/>`;
  face += `<defs><clipPath id="${p}-cw"><rect x="${wx}" y="${wy}" width="${nd * pitch}" height="${wh}"/></clipPath><linearGradient id="${p}-sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.45"/><stop offset="0.3" stop-color="#000" stop-opacity="0"/><stop offset="0.7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></linearGradient></defs><g clip-path="url(#${p}-cw)">`;
  for (let i = 0; i < nd; i++) {
    const x = wx + (nd - 1 - i) * pitch, d = Math.floor(val / 10 ** i) % 10;
    let col = "";
    for (let j = 0; j <= 10; j++) col += txt(pitch / 2, wh / 2 + 10 + j * wh, j % 10, { size: 28, anchor: "middle", mono: true, weight: 800, fill: C.ink });
    face += `<rect x="${x + 1}" y="${wy}" width="${pitch - 2}" height="${wh}" fill="${i < 3 ? "#ffffff" : "#f4f1ea"}"/><g transform="translate(${x},${wy})"><g id="${p}-dg-${i}" data-h="${wh}" transform="translate(0,${-d * wh})">${col}</g></g>`;
  }
  face += `</g><rect x="${wx}" y="${wy}" width="${nd * pitch}" height="${wh}" fill="url(#${p}-sh)"/>`;
  for (let i = 1; i < nd; i++) face += `<line x1="${wx + i * pitch}" y1="${wy}" x2="${wx + i * pitch}" y2="${wy + wh}" stroke="#141518" stroke-width="1.5"/>`;
  s += G_(faceV(o, -W / 2, Dp / 2, z + H), face);
  s += G_(faceU(o, -W / 2, -Dp / 2 + 8, z + H - 20), `<circle cx="17" cy="0" r="9" fill="#a9aeb5" stroke="#3b3e44" stroke-width="1.5"/>`);
  const anchors = { top: at(o, 0, 0, z + H + 46), center: at(o, 0, Dp / 2, z + H / 2), window: at(o, 0, Dp / 2, z + H / 2), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: `<g id="${p}-ctr" data-n="${nd}" data-v="${val}">${s}</g>`, wire: [[-W / 2, W / 2, -Dp / 2, Dp / 2, z, z + H]], center: anchors.center, badgeR: 24 }), anchors };
}

// =====================================================================================
// 椭圆曲线板 curveBoard — 画架上的白板：一条光滑椭圆曲线（蛋形 + 一支），曲线上的点和一条割线；不写公式
// opts: points=true（显示 P、Q 与割线）
// 可动：ID-curve（曲线 path，KIT.drawPath 画出）, ID-chord（割线）, ID-pt-0..3（点）
// anchors: top, center, ground, board（板中心）
// =====================================================================================
export function curveBoard(o, opts = {}) {
  const p = opts.id ?? "ec", atk = isAtk(opts);
  const W = 330, H = 220, tilt = 10, vb = 0, zb = 96;
  let s = contactShadow(o, 200, 80, 0, -30);
  const lidTopV = vb - H * Math.sin(tilt * DEG), lidTopZ = zb + H * Math.cos(tilt * DEG);
  const leg = "#5d636b";
  s += line3(o, [[0, -110, 0], [0, lidTopV - 4, lidTopZ - 20]], "#3b3e44", 9);
  const m = frameTilt(o, -W / 2, lidTopV, lidTopZ, tilt);
  // back thickness
  const th = [-8 * Math.cos(tilt * DEG) * V[0], -8 * Math.cos(tilt * DEG) * V[1] - 8 * Math.sin(tilt * DEG) * CE];
  s += `<g transform="translate(${f(th[0])},${f(th[1])})">${G_(matStr(m), `<rect x="-8" y="-8" width="${W + 16}" height="${H + 16}" rx="6" fill="#8b9199"/>`)}</g>`;
  // curve geometry y² = x³ − x
  const X0 = -1.3, X1 = 2.0, Y0 = -2.3, Y1 = 2.3;
  const mx = (x) => 18 + ((x - X0) / (X1 - X0)) * (W - 36), my = (y) => 14 + ((Y1 - y) / (Y1 - Y0)) * (H - 28);
  const yv = (x) => Math.sqrt(Math.max(0, x * x * x - x));
  let egg = "";
  for (let i = 0; i <= 40; i++) { const x = -1 + i / 40; egg += `${i ? "L" : "M"}${f(mx(x))} ${f(my(yv(x)))}`; }
  for (let i = 40; i >= 0; i--) { const x = -1 + i / 40; egg += `L${f(mx(x))} ${f(my(-yv(x)))}`; }
  let brn = "";
  const xs = []; for (let i = 0; i <= 40; i++) { const tt = i / 40; xs.push(1 + 0.93 * tt * tt); }
  xs.slice().reverse().forEach((x, i) => { brn += `${i ? "L" : "M"}${f(mx(x))} ${f(my(yv(x)))}`; });
  xs.forEach((x) => { brn += `L${f(mx(x))} ${f(my(-yv(x)))}`; });
  const ink = atk ? "#e0453a" : "#1d93ba";
  let c = `<rect x="0" y="0" width="${W}" height="${H}" rx="4" fill="#fdfdfb" stroke="#c3c8ce" stroke-width="7"/>`;
  for (let i = 1; i < 11; i++) c += `<line x1="${i * W / 11}" y1="6" x2="${i * W / 11}" y2="${H - 6}" stroke="#e8eef1" stroke-width="1"/>`;
  for (let i = 1; i < 7; i++) c += `<line x1="6" y1="${i * H / 7}" x2="${W - 6}" y2="${i * H / 7}" stroke="#e8eef1" stroke-width="1"/>`;
  c += `<line x1="10" y1="${f(my(0))}" x2="${W - 10}" y2="${f(my(0))}" stroke="#a9aeb5" stroke-width="1.6"/><line x1="${f(mx(0))}" y1="10" x2="${f(mx(0))}" y2="${H - 10}" stroke="#a9aeb5" stroke-width="1.6"/>`;
  c += `<path id="${p}-curve" d="${egg}Z${brn}" fill="none" stroke="${ink}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  const Pp = [-0.9, yv(-0.9)], Qp = [1.3, yv(1.3)], sl = (Qp[1] - Pp[1]) / (Qp[0] - Pp[0]);
  const x3 = sl * sl - Pp[0] - Qp[0], y3 = sl * (x3 - Pp[0]) + Pp[1];
  const xe0 = -1.25, xe1 = 1.95;
  const show = opts.points !== false ? 1 : 0;
  c += `<line id="${p}-chord" x1="${f(mx(xe0))}" y1="${f(my(Pp[1] + sl * (xe0 - Pp[0])))}" x2="${f(mx(xe1))}" y2="${f(my(Pp[1] + sl * (xe1 - Pp[0])))}" stroke="#6d685e" stroke-width="2" stroke-dasharray="7 6" opacity="${show}"/>`;
  c += `<line id="${p}-pt-3l" x1="${f(mx(x3))}" y1="${f(my(y3))}" x2="${f(mx(x3))}" y2="${f(my(-y3))}" stroke="#a9aeb5" stroke-width="1.6" stroke-dasharray="4 4" opacity="${show}"/>`;
  const dot = (id, q, fill, hollow) => `<circle id="${id}" cx="${f(mx(q[0]))}" cy="${f(my(q[1]))}" r="8" fill="${hollow ? "#ffffff" : fill}" stroke="${hollow ? fill : "#ffffff"}" stroke-width="3" opacity="${show}"/>`;
  c += dot(`${p}-pt-0`, Pp, C.ink) + dot(`${p}-pt-1`, Qp, C.ink) + dot(`${p}-pt-2`, [x3, y3], "#6d685e", true) + dot(`${p}-pt-3`, [x3, -y3], ink);
  s += G_(matStr(m), c);
  // tray + markers
  s += box(o, -W / 2 + 10, W / 2 - 10, vb, vb + 18, zb - 10, zb - 2, M.chrome, 1.2);
  s += box(o, -80, -40, vb + 4, vb + 12, zb - 2, zb + 6, { f: "#2a9fc6", s: "#1f86a8", t: "#5cc0e0", st: "#155e77" }, 1) + box(o, -24, 16, vb + 4, vb + 12, zb - 2, zb + 6, M.ink, 1);
  // front legs
  for (const du of [-W / 2 + 18, W / 2 - 18]) s += line3(o, [[du, vb + 30, 0], [du, vb + 6, zb], [du, lidTopV + 4, lidTopZ - 6]], darken(leg, 0.3), 9) + line3(o, [[du, vb + 30, 0], [du, vb + 6, zb], [du, lidTopV + 4, lidTopZ - 6]], leg, 5);
  const anchors = { top: at(o, 0, lidTopV, lidTopZ + 44), center: applyM(m, W / 2, H / 2), board: applyM(m, W / 2, H / 2), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [{ path: `M${pts([applyM(m, 0, 0)])}L${pts([applyM(m, W, 0)])}L${pts([applyM(m, W, H)])}L${pts([applyM(m, 0, H)])}Z` }, [-W / 2, W / 2, -110, 30, 0, zb]], center: anchors.center, glowR: 200 }), anchors };
}

// =====================================================================================
// 签名纸 sigPaper — 立在小座上的签名纸：标题、两行数据条、墨色签名笔迹；右上角夹一个青蓝小签条 "r"
// opts: tag="r", dup=false（签条变红 = r 值重复）, title="签名", flat=false
// 可动：ID-tag（青蓝签条）/ ID-tag-red（红签条）→ KIT.swap；ID-body（纸面）
// anchors: top, center, ground, tag（签条中心：两张纸之间连红虚线用它）
// =====================================================================================
export function sigPaper(o, opts = {}) {
  const p = opts.id ?? "sig", atk = isAtk(opts);
  const W = 150, H = 192, zb = 18, tilt = 8;
  let s = contactShadow(o, 100, 50);
  s += rbox(o, -W / 2 - 12, W / 2 + 12, -26, 18, 0, zb, 6, M.plinth, { sw: 1.4 });
  const lidTopV = 0 - H * Math.sin(tilt * DEG), lidTopZ = zb - 6 + H * Math.cos(tilt * DEG);
  const m = frameTilt(o, -W / 2, lidTopV, lidTopZ, tilt);
  const paperFill = atk ? "#fde6e3" : "#fffdf8";
  const th = [-3 * V[0], -3 * V[1]];
  s += `<g transform="translate(${f(th[0])},${f(th[1])})">${G_(matStr(m), `<rect x="0" y="0" width="${W}" height="${H}" rx="3" fill="#ddd6c9"/>`)}</g>`;
  let c = `<g id="${p}-body"><path d="M0 0H${W - 22}L${W} 22V${H}H0Z" fill="${paperFill}" stroke="#b8b0a1" stroke-width="1.6"/><path d="M${W - 22} 0V22H${W}" fill="#ece6da" stroke="#b8b0a1" stroke-width="1.4"/>`;
  c += txt(14, 30, opts.title ?? "签名", { size: 18 });
  c += `<rect x="14" y="44" width="${W - 64}" height="7" rx="3.5" fill="#ddd6c9"/>`;
  c += txt(14, 76, "r", { size: 14, mono: true, fill: "#17809f", weight: 800 }) + `<rect x="30" y="66" width="${W - 50}" height="12" rx="3" fill="#e4f2f7" stroke="#9ad9ee" stroke-width="1"/>`;
  c += txt(14, 100, "s", { size: 14, mono: true, fill: "#6d685e", weight: 800 }) + `<rect x="30" y="90" width="${W - 50}" height="12" rx="3" fill="#f1ede5" stroke="#ddd6c9" stroke-width="1"/>`;
  for (let i = 0; i < 2; i++) c += `<rect x="14" y="${116 + i * 14}" width="${W - 40 - i * 30}" height="6" rx="3" fill="#e6e0d4"/>`;
  c += `<path d="M18 ${H - 26}C30 ${H - 52} 40 ${H - 12} 52 ${H - 34}S70 ${H - 50} 78 ${H - 28}S98 ${H - 22} 108 ${H - 40}C112 ${H - 46} 118 ${H - 30} 132 ${H - 32}" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round"/>`;
  c += `<line x1="14" y1="${H - 16}" x2="${W - 14}" y2="${H - 16}" stroke="#b8b0a1" stroke-width="1.2"/></g>`;
  // tag clipped on the top-right corner
  const tg = (fill, st, id, op) => `<g id="${id}" opacity="${op}"><path d="M${W - 34} 14L${W - 6} -8" stroke="#5d636b" stroke-width="1.6"/>
    <g transform="translate(${W - 22},-40) rotate(12) scale(1.35)"><path d="M-6 -16H38Q44 -16 44 -10V26Q44 32 38 32H-6L-18 8Z" fill="${fill}" stroke="${st}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="-7" cy="8" r="4" fill="#fffdf8" stroke="${st}" stroke-width="1.6"/>
    ${txt(18, 19, opts.tag ?? "r", { size: 28, mono: true, anchor: "middle", fill: "#ffffff", weight: 800 })}</g></g>`;
  const dup = !!opts.dup;
  c += tg("#1d93ba", "#155e77", p + "-tag", dup ? 0 : 1) + tg("#e0453a", "#a8322a", p + "-tag-red", dup ? 1 : 0);
  s += G_(matStr(m), c);
  // clip at the bottom
  s += box(o, -W / 2 + 20, W / 2 - 20, -6, 8, zb, zb + 12, M.steel, 1.2);
  const tagP = applyM(m, W - 22 + 20, -40 + 10);
  const anchors = { top: at(o, 0, lidTopV, lidTopZ + 70), center: applyM(m, W / 2, H / 2), tag: tagP, ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [{ path: `M${pts([applyM(m, 0, 0)])}L${pts([applyM(m, W, 0)])}L${pts([applyM(m, W, H)])}L${pts([applyM(m, 0, H)])}Z` }, [-W / 2 - 12, W / 2 + 12, -26, 18, 0, zb]], center: anchors.center, badgeR: 24, glowR: 120 }), anchors };
}

// =====================================================================================
// 遮布 cloth — 深色布盖在一把钥匙上，布面印骰子点数纹样（seg4 比喻）
// opts: covered=true（false = 布已揭开，只剩钥匙）, keyState（钥匙状态："attacker" 为红钥匙）
// 可动：ID-cloth（布，KIT.unveil(tl,ID,t,dur) 上提淡出；或直接 opacity）, ID-key（下面的钥匙，kit key）
// anchors: top, center, ground, key
// =====================================================================================
export function cloth(o, opts = {}) {
  const p = opts.id ?? "cloth", atk = isAtk(opts);
  const k = kitKey({ u: o.u - 30, v: o.v }, { id: p + "-key", state: opts.keyState ?? "normal" });
  const cm = atk ? mat("#b8392f") : mat("#3a4656", { st: "#1b222c" });
  const wav = (rx, ry, du, amp, nW, ph = 0) => Array.from({ length: 64 }, (_, i) => { const a = (i / 64) * 2 * Math.PI, r = 1 + amp * Math.sin(nW * a + ph); return [du + rx * r * Math.cos(a), ry * r * Math.sin(a)]; });
  const bot = wav(132, 74, 20, 0.07, 7), top = wav(84, 40, 20, 0.04, 5, 1);
  let c = loft(o, bot, top, 0, 34, cm, { sw: 1.8, top: false });
  // soft dome cap (two stacked lofts)
  c += loft(o, top, wav(56, 26, 22, 0.03, 4, 2), 34, 44, cm, { sw: 1.6, top: false });
  c += flat(o, wav(56, 26, 22, 0.03, 4, 2), 44, cm.t, cm.st, 1.6);
  // folds on the visible skirt
  for (const a of [100, 125, 150, 175, 205]) { const r = a * DEG, b = [20 + 132 * Math.cos(r) * 0.96, 74 * Math.sin(-r) * -0.96], t2 = [20 + 84 * Math.cos(r), 40 * Math.sin(r)]; if (depth(b[0], b[1], 0) > 0 || a > 170) c += line3(o, [[t2[0], t2[1], 34], [b[0], b[1] + 2, 2]], darken(cm.s, 0.3), 2, `opacity="0.7"`); }
  // dice-pip print on the cap and skirt
  const pip = (q, z) => { const P = at(o, q[0], q[1], z); return `<ellipse cx="${f(P[0])}" cy="${f(P[1])}" rx="4.2" ry="3" fill="#f6f3ec" opacity="0.92"/>`; };
  const pattern = [[2, [-10, -8]], [5, [44, 4]], [3, [10, 16]]];
  for (const [n, [du, dv]] of pattern) for (const [a, b] of PIPS[n]) c += pip([du + (a - 0.5) * 30, dv + (b - 0.5) * 22], 44);
  for (const [n, du, dv] of [[4, -70, 46], [1, 0, 66], [6, 74, 52], [3, -104, 8]]) for (const [a, b] of PIPS[n]) c += pip([du + (a - 0.5) * 26, dv + (b - 0.5) * 14], 14);
  const s = contactShadow(o, 150, 90, 20, 0) + k.svg + `<g id="${p}-cloth" opacity="${opts.covered === false ? 0 : 1}">${c}</g>`;
  const anchors = { top: at(o, 0, 0, 110), center: at(o, 20, 0, 24), key: k.anchors.center, ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [{ path: `M${pts(bot.map((q) => at(o, q[0], q[1], 0)))}Z`.replace(/ /g, "L") }], center: anchors.center, badgeR: 26 }), anchors };
}

// =====================================================================================
// 拼图组 puzzleSet — 三块厚拼图平放（三个参与方各持一块）；面上印着一把钥匙的三段，拼合后钥匙才完整
// opts: assembled=false, gap=56（分开时间距）, pieces=[0,1,2]（只画其中几块）, pieceStates=["normal","normal","normal"]（某块 "attacker" 变红）
// 可动：ID-pc-0..2（每块；KIT.assemble(tl,ID,t,together,dur) 拼合 / 分开），ID-pc-i-r（红色版本，KIT.swap 换色）
// anchors: top, center, ground, pieces[]（各块分开时的顶面中心）, piecesTogether[]
// =====================================================================================
export function puzzleSet(o, opts = {}) {
  const p = opts.id ?? "pz", S = opts.size ?? 130, T = 18, gap = opts.gap ?? 56;
  const list = opts.pieces ?? [0, 1, 2], states = opts.pieceStates ?? [];
  const k = 15, R = k * 1.3;
  const shapeD = (i) => {
    let d = `M0 0H${S}`;
    d += i < 2 ? `V${S / 2 - k}A${R} ${R} 0 1 1 ${S} ${S / 2 + k}V${S}` : `V${S}`;
    d += `H0`;
    d += i > 0 ? `V${S / 2 + k}A${R} ${R} 0 1 1 0 ${S / 2 - k}V0Z` : `V0Z`;
    return d;
  };
  const cols = [mat("#5cc0e0", { st: "#1f7896" }), mat("#3fa9cf", { st: "#155e77" }), mat("#86d0e8", { st: "#1f7896" })];
  // key artwork spanning 3S
  const art = (red) => { const st = red ? "#fff3f1" : "#ffffff"; return `<g opacity="0.92"><circle cx="${S * 0.42}" cy="${S / 2}" r="${S * 0.24}" fill="none" stroke="${st}" stroke-width="9"/><circle cx="${S * 0.42}" cy="${S / 2}" r="${S * 0.08}" fill="${st}"/>
    <path d="M${S * 0.66} ${S / 2}H${S * 2.75}M${S * 2.5} ${S / 2}V${S * 0.74}M${S * 2.25} ${S / 2}V${S * 0.68}M${S * 2.0} ${S / 2}V${S * 0.76}" stroke="${st}" stroke-width="10" stroke-linecap="round" fill="none"/></g>`; };
  const offs = [-gap, 0, gap];
  const vOff = [10, -14, 6];
  let s = contactShadow(o, S * 2.2, S * 0.9, 0, S / 2);
  const ordered = list.slice().sort((a, b) => b - a); // larger u is farther
  const pieces = [], together = [];
  for (const i of ordered) {
    const du = -1.5 * S + i * S;
    const draw = (red) => {
      const m = red ? RED : cols[i];
      const mT = frameTop(o, du, 0, T);
      let g = "";
      for (let z = T; z >= 1; z -= 1.5) g += `<g transform="translate(0,${f((T - z + 1.5) * CE)})">${G_(matStr(mT), `<path d="${shapeD(i)}" fill="${z > T - 2 ? m.st : m.s}" stroke="${m.s}" stroke-width="1"/>`)}</g>`;
      g += G_(matStr(mT), `<defs><clipPath id="${p}-c${i}${red ? "r" : ""}"><path d="${shapeD(i)}"/></clipPath></defs><path d="${shapeD(i)}" fill="${m.t}" stroke="${m.st}" stroke-width="2"/><g clip-path="url(#${p}-c${i}${red ? "r" : ""})"><g transform="translate(${-i * S},0)">${art(red)}</g></g><path d="${shapeD(i)}" fill="none" stroke="#ffffff" stroke-width="1.4" opacity="0.5" transform="translate(1.5,1.5)"/>`);
      return g;
    };
    const red = states[i] === "attacker";
    const dx = offs[i] * U[0] + vOff[i] * V[0], dy = offs[i] * U[1] + vOff[i] * V[1];
    const kk = opts.assembled ? 0 : 1;
    s += `<g id="${p}-pc-${i}" data-dx="${f(dx)}" data-dy="${f(dy)}" transform="translate(${f(dx * kk)},${f(dy * kk)})"><g id="${p}-pc-${i}-n" opacity="${red ? 0 : 1}">${draw(false)}</g><g id="${p}-pc-${i}-r" opacity="${red ? 1 : 0}">${draw(true)}</g></g>`;
    const c = at(o, du + S / 2, S / 2, T);
    pieces[i] = [c[0] + dx, c[1] + dy]; together[i] = c;
  }
  s = `<g id="${p}-set" data-pieces="${list.join(",")}" data-k="${opts.assembled ? 0 : 1}">${s}</g>`;
  const anchors = { top: at(o, 0, S / 2, T + 70), center: at(o, 0, S / 2, T), ground: at(o), pieces, piecesTogether: together };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-1.5 * S - gap, 1.5 * S + gap, -14, S + 14, 0, T]], center: anchors.center, glowR: 220 }), anchors };
}

// =====================================================================================
// 证明卡 proofCard — 立着的白卡：绿勾圆章 + 两行字条 + "证明"；missing 时换成红虚线空位
// opts: missing=false, text="证明"
// 可动：ID-card（卡）/ ID-slot（红虚线空位 + 红问号）→ KIT.swap 互换
// anchors: top, center, ground
// =====================================================================================
export function proofCard(o, opts = {}) {
  const p = opts.id ?? "proof", miss = !!opts.missing;
  const W = 112, H = 150, zb = 12;
  let s = contactShadow(o, 60, 34);
  s += rbox(o, -W / 2 - 8, W / 2 + 8, -18, 14, 0, zb, 5, M.plinth, { sw: 1.2 });
  const m = frameV(o, -W / 2, 0, zb + H);
  const card = extrudeLocal(m, `<rect x="0" y="0" width="${W}" height="${H}" rx="8" fill="#d8d1c4"/>`,
    `<rect x="0" y="0" width="${W}" height="${H}" rx="8" fill="#fffdf8" stroke="#1f9d55" stroke-width="3"/>
     <circle cx="${W / 2}" cy="46" r="28" fill="#1f9d55" stroke="#ffffff" stroke-width="3"/><path d="M${W / 2 - 13} 46l8 9l18 -19" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
     ${txt(W / 2, 106, opts.text ?? "证明", { size: 24, anchor: "middle", fill: "#17804a" })}
     <rect x="16" y="118" width="${W - 32}" height="6" rx="3" fill="#cfe9d9"/><rect x="22" y="130" width="${W - 44}" height="5" rx="2.5" fill="#cfe9d9"/>`, [-V[0], -V[1]], 4, 1);
  const slot = G_(matStr(m), `<rect x="0" y="0" width="${W}" height="${H}" rx="8" fill="rgba(224,69,58,0.06)" stroke="#e0453a" stroke-width="3.5" stroke-dasharray="10 7"/>` + txt(W / 2, H / 2 + 18, "?", { size: 52, anchor: "middle", fill: "#e0453a" }));
  s += `<g id="${p}-card" opacity="${miss ? 0 : 1}">${card}</g><g id="${p}-slot" opacity="${miss ? 1 : 0}">${slot}</g>`;
  const anchors = { top: at(o, 0, 0, zb + H + 44), center: at(o, 0, 0, zb + H / 2), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-W / 2, W / 2, -6, 0, zb, zb + H]], center: anchors.center, badgeR: 22, glowR: 90 }), anchors };
}

// =====================================================================================
// 量子计算机 quantum — 门形钢架上倒挂的金色多层"吊灯"（稀释制冷机）：五层金盘 + 金色拉杆 + 铜色同轴线，底部混合腔带冷光
// opts: beam=false（底部红色光锥，"对准已公开的公钥"）, plate="量子"（横梁铭牌）
// 可动：ID-beam（红色光锥，opacity）, ID-cold（底部冷光，opacity）, ID-chand（整个吊灯组，可做轻微摆动）
// anchors: top, center, ground, tip（吊灯最下端，光锥起点）
// =====================================================================================
export function quantum(o, opts = {}) {
  const p = opts.id ?? "qc", atk = isAtk(opts);
  const frameM = atk ? M.red : M.steel, gold = M.gold;
  const copper = "#c27a3a";
  let s = contactShadow(o, 200, 110);
  // frame: far post first
  const post = (du) => rbox(o, du - 12, du + 12, -14, 14, 0, 400, 3, frameM, { sw: 1.6 }) + rbox(o, du - 30, du + 30, -40, 40, 0, 10, 4, M.dark, { sw: 1.2 });
  s += post(130);
  const plates = [[350, 96], [298, 82], [250, 68], [206, 54], [170, 40]];
  // chandelier bottom-up: plate N, rods(N-1→N), plate N-1 ...
  let ch = "";
  // mixing chamber + cold glow
  ch += `<defs><radialGradient id="${p}-cg"><stop offset="0" stop-color="#9ad9ee" stop-opacity="0.9"/><stop offset="1" stop-color="#9ad9ee" stop-opacity="0"/></radialGradient></defs>`;
  const tip = at(o, 0, 0, 112);
  ch += `<circle id="${p}-cold" cx="${f(tip[0])}" cy="${f(tip[1])}" r="34" fill="url(#${p}-cg)" opacity="${opts.cold === false ? 0 : 1}"/>`;
  ch += frustum(o, 0, 0, 10, 24, 112, 130, gold, { sw: 1.4, seg: 24 }) + cyl(o, 0, 0, 24, 130, 166, gold, { sw: 1.4, seg: 24 });
  ch += G_(faceV(o, -24, 0, 160), "") ;
  const rodsBetween = (zTop, zBot, rr) => {
    let g = "";
    const ang = [15, 75, 135, 195, 255, 315].map((a) => a * DEG).sort((a, b) => depth(Math.cos(a), Math.sin(a), 0) - depth(Math.cos(b), Math.sin(b), 0));
    for (const a of ang) { const q = [rr * Math.cos(a), rr * Math.sin(a)]; g += line3(o, [[q[0], q[1], zTop], [q[0], q[1], zBot]], gold.st, 5) + line3(o, [[q[0], q[1], zTop], [q[0], q[1], zBot]], gold.t, 2); }
    // coax: wavy copper lines in front
    for (const [a0, ph] of [[110, 0], [150, 1.4], [70, 2.2]]) {
      const a = a0 * DEG, rq = rr * 0.55, ptsW = [];
      for (let i = 0; i <= 12; i++) { const z = zTop + ((zBot - zTop) * i) / 12, w = 6 * Math.sin(i * 1.1 + ph); ptsW.push([rq * Math.cos(a) + w * CA, rq * Math.sin(a) + w * SA, z]); }
      g += line3(o, ptsW, copper, 2.6);
    }
    return g;
  };
  for (let i = plates.length - 1; i >= 0; i--) {
    const [z, r] = plates[i];
    if (i === plates.length - 1) ch += rodsBetween(z - 4, 166, 18);
    ch += cyl(o, 0, 0, r, z - 4, z + 6, gold, { sw: 1.6, seg: 44 });
    ch += G_(faceTop(o, 0, 0, z + 6), `<circle cx="0" cy="0" r="${f(r * 0.7)}" fill="none" stroke="${gold.s}" stroke-width="2"/>` + Array.from({ length: 8 }, (_, k) => { const a = k * 45 * DEG; return `<circle cx="${f(r * 0.84 * Math.cos(a))}" cy="${f(r * 0.84 * Math.sin(a))}" r="3" fill="${gold.st}"/>`; }).join(""));
    if (i > 0) ch += rodsBetween(plates[i - 1][0] - 4, z + 6, r * 0.72);
  }
  // hangers from beam
  ch = rodsBetween(372, 356, 50).replace(/<polyline[^>]*#c27a3a[^>]*\/>/g, "") + ch;
  s += `<g id="${p}-chand">${ch}</g>`;
  // beam
  s += rbox(o, -156, 156, -20, 20, 372, 404, 4, frameM, { sw: 1.8 });
  s += G_(faceV(o, -60, 20, 398), `<rect x="0" y="0" width="120" height="22" rx="3" fill="#e9ebee" stroke="#5d636b" stroke-width="1.2"/>` + txt(60, 16, opts.plate ?? "QUANTUM", { size: 12, mono: true, anchor: "middle", fill: "#3b3e44", weight: 800 }));
  s += post(-130);
  // beam (red cone toward +v ground)
  const b0 = tip, b1 = at(o, 40, 330, 0), b2 = at(o, -60, 300, 0);
  s += `<defs><linearGradient id="${p}-bm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4a3d" stop-opacity="0.65"/><stop offset="1" stop-color="#ff4a3d" stop-opacity="0.05"/></linearGradient></defs><polygon id="${p}-beam" points="${pts([b0, b1, b2])}" fill="url(#${p}-bm)" opacity="${opts.beam ? 1 : 0}"/>`;
  const anchors = { top: at(o, 0, 0, 460), center: at(o, 0, 0, 260), tip, ground: at(o), beamEnd: at(o, -10, 315, 0) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-156, 156, -20, 20, 372, 404], [-142, -118, -14, 14, 0, 372], [118, 142, -14, 14, 0, 372], { cyl: [0, 0, 96, 112, 356] }], center: anchors.center, glowR: 220 }), anchors };
}

// =====================================================================================
// 确定性 k 机器 kMachine — 绿色小机器：顶上两个进料斗，两根管子分别接"私钥"（左）和"消息"（后），正面读数窗 + 齿轮舷窗，出口吐出 k 币
// opts: missing=null|"key"|"msg"（缺的那根管子画成红虚线空位）, out=false（k 币已在托盘里）
// 可动：ID-gear（齿轮 rotator）, ID-k（k 币）→ KIT.emit(tl,ID,t)；ID-pipe-key / ID-pipe-key-miss, ID-pipe-msg / ID-pipe-msg-miss
// anchors: top, center, ground, inKey（私钥管口）, inMsg（消息管口）, out（托盘）
// =====================================================================================
export function kMachine(o, opts = {}) {
  const p = opts.id ?? "km", atk = isAtk(opts), miss = opts.missing ?? null;
  const W = 84, D = 62, H = 148;
  const body = atk ? M.red : miss ? mat("#d65248", { st: "#8f2620" }) : { f: "#3fb877", s: "#1f9d55", t: "#86d6a8", st: "#17804a" };
  let s = contactShadow(o, 130, 90, 0, 20);
  // msg pipe (behind) first
  const pipe = (P, id, show) => {
    const g = line3(o, P, "#3b3e44", 20) + line3(o, P, "#a9aeb5", 14) + line3(o, P, "#e3e6e9", 4, `transform="translate(-3,-3)"`);
    const e = at(o, ...P[P.length - 1]);
    const fl = `<ellipse cx="${f(e[0])}" cy="${f(e[1])}" rx="14" ry="14" fill="#7d828a" stroke="#2b2d31" stroke-width="2"/><ellipse cx="${f(e[0])}" cy="${f(e[1])}" rx="7" ry="7" fill="#2b2d31"/>`;
    const dashed = `<path d="M${P.map((q) => pts([at(o, ...q)])).join("L")}" fill="none" stroke="#e0453a" stroke-width="20" stroke-dasharray="12 9" stroke-linejoin="round" opacity="0.9"/><path d="M${P.map((q) => pts([at(o, ...q)])).join("L")}" fill="none" stroke="#efebe3" stroke-width="13" stroke-linejoin="round"/>`;
    return `<g id="${id}" opacity="${show ? 1 : 0}">${g + fl}</g><g id="${id}-miss" opacity="${show ? 0 : 1}">${dashed}</g>`;
  };
  const Pm = [[30, -8, H + 30], [30, -8, H + 92], [30, -170, H + 92]];
  const Pk = [[-36, -8, H + 30], [-36, -8, H + 70], [-200, -8, H + 70]];
  s += pipe(Pm, p + "-pipe-msg", miss !== "msg");
  s += rbox(o, -W, W, -D, D, 0, H, 12, body, { sw: 2 });
  s += rbox(o, -W + 8, W - 8, -D + 8, D - 8, H, H + 8, 8, M.steelLight, { sw: 1.2 });
  // hoppers
  for (const du of [30, -36]) s += frustum(o, du, -8, 18, 28, H + 8, H + 34, M.chrome, { sw: 1.4, seg: 24, topFill: "#5d636b" });
  s += pipe(Pk, p + "-pipe-key", miss !== "key");
  // front face
  const fw = 2 * W;
  let face = `<rect x="14" y="14" width="${fw - 28}" height="36" rx="5" fill="#141518" stroke="#0e3b22" stroke-width="2"/>` + txt(28, 41, "k =", { size: 20, mono: true, fill: "#86d6a8", weight: 800 }) + `<rect x="74" y="24" width="${fw - 100}" height="16" rx="3" fill="#1f9d55" opacity="0.5"/>`;
  face += `<circle cx="${fw / 2 - 26}" cy="92" r="30" fill="#141518" stroke="${body.st}" stroke-width="4"/><circle cx="${fw / 2 - 26}" cy="92" r="30" fill="rgba(208,234,244,0.18)"/>`;
  face += `<rect x="${fw - 56}" y="72" width="36" height="12" rx="3" fill="${darken(body.s, 0.2)}"/><rect x="${fw - 56}" y="92" width="36" height="12" rx="3" fill="${darken(body.s, 0.2)}"/>`;
  face += `<rect x="${fw / 2 - 30}" y="${H - 28}" width="60" height="16" rx="4" fill="#141518"/>`;
  const mF = frameV(o, -W, D, H);
  s += G_(matStr(mF), face);
  let gear = "";
  { const r = 22, nT = 10; let d = ""; for (let i = 0; i < nT * 2; i++) { const a0 = (i / (nT * 2)) * 2 * Math.PI, a1 = ((i + 1) / (nT * 2)) * 2 * Math.PI, rr = i % 2 ? r : r + 5; d += `${i ? "L" : "M"}${f(rr * Math.cos(a0))} ${f(rr * Math.sin(a0))}L${f(rr * Math.cos(a1))} ${f(rr * Math.sin(a1))}`; } gear = `<path d="${d}Z" fill="#c9cdd2" stroke="#3b3e44" stroke-width="1.6"/><circle cx="0" cy="0" r="7" fill="#3b3e44"/>`; }
  s += rotator(p + "-gear", frameV(o, -W + fw / 2 - 26, D, H - 92), 0, 0, 0, gear);
  // tray
  s += box(o, -24, 24, D, D + 46, 0, 10, M.chrome, 1.2);
  const kp = at(o, 0, D + 26, 10);
  const slotP = at(o, 0, D, H - (H - 20));
  s += `<g id="${p}-k" data-sx="${f(slotP[0] - kp[0])}" data-sy="${f(slotP[1] - kp[1])}" opacity="${opts.out ? 1 : 0}"><g transform="translate(${f(kp[0])},${f(kp[1] - 12)})"><ellipse cx="0" cy="8" rx="22" ry="11" fill="#155e77"/><ellipse cx="0" cy="0" rx="22" ry="11" fill="#5cc0e0" stroke="#155e77" stroke-width="2"/>${txt(0, 6, "k", { size: 16, mono: true, anchor: "middle", fill: "#ffffff", weight: 800 })}</g></g>`;
  const anchors = { top: at(o, 0, 0, H + 150), center: at(o, 0, D, H / 2), ground: at(o), inKey: at(o, ...Pk[2]), inMsg: at(o, ...Pm[2]), out: kp };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-W, W, -D, D, 0, H]], center: anchors.center, glowR: 160 }), anchors };
}

// =====================================================================================
// 玻璃展柜 vitrine — 白色底座 + 青蓝描边玻璃罩："公开可见"。opts.inner 是要放进柜里的 SVG（地面物件用 liftSvg(svg, VITRINE_FLOOR) 抬到柜内地面）
// opts: w=300, d=200, h=220, plate="公开", inner=""
// 可动：ID-glass（玻璃前片，可做反光扫过）, ID-inner（柜内内容）
// anchors: top, center, ground, floor（柜内地面中心，z=40）
// =====================================================================================
export const VITRINE_FLOOR = 40;
/** lift any object svg by z world units (e.g. put a ground object onto the vitrine floor / conveyor deck) */
export const liftSvg = (svg, z) => `<g transform="translate(0,${f(-z * CE)})">${svg}</g>`;
export function vitrine(o, opts = {}) {
  const p = opts.id ?? "vit", W = (opts.w ?? 300) / 2, D = (opts.d ?? 200) / 2, H = opts.h ?? 220, zf = VITRINE_FLOOR;
  const atk = isAtk(opts), edge = atk ? "#e0453a" : "#2aa3c9";
  let s = contactShadow(o, W * 1.3, D * 1.3);
  s += rbox(o, -W - 10, W + 10, -D - 10, D + 10, 0, zf, 6, M.white, { sw: 1.6 });
  s += G_(faceV(o, -50, D + 10, zf - 8), `<rect x="0" y="0" width="100" height="24" rx="4" fill="#1d93ba"/>` + txt(50, 18, opts.plate ?? "公开", { size: 16, anchor: "middle", fill: "#ffffff" }));
  const A = (u, v, z) => at(o, u, v, z), z1 = zf + H;
  const back = [[A(-W, -D, zf), A(W, -D, zf), A(W, -D, z1), A(-W, -D, z1)], [A(W, -D, zf), A(W, D, zf), A(W, D, z1), A(W, -D, z1)]];
  for (const q of back) s += `<polygon points="${pts(q)}" fill="rgba(208,234,244,0.28)" stroke="${edge}" stroke-width="1.4" stroke-opacity="0.45"/>`;
  s += `<g id="${p}-inner">${opts.inner ?? ""}</g>`;
  const front = [[A(-W, -D, zf), A(-W, D, zf), A(-W, D, z1), A(-W, -D, z1)], [A(-W, D, zf), A(W, D, zf), A(W, D, z1), A(-W, D, z1)], [A(-W, -D, z1), A(W, -D, z1), A(W, D, z1), A(-W, D, z1)]];
  let g = front.map((q, i) => `<polygon points="${pts(q)}" fill="rgba(208,234,244,${i === 2 ? 0.3 : 0.16})" stroke="${edge}" stroke-width="3" stroke-linejoin="round"/>`).join("");
  g += `<path d="M${pts([A(-W + 30, D, z1 - 10)])}L${pts([A(-W + 90, D, zf + 10)])}M${pts([A(-W + 60, D, z1 - 10)])}L${pts([A(-W + 100, D, z1 - 90)])}" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity="0.6"/>`;
  g += `<path d="M${pts([A(-W, -D + 20, z1 - 16)])}L${pts([A(-W, -D + 60, z1 - 70)])}" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.55"/>`;
  s += `<g id="${p}-glass">${g}</g>`;
  const anchors = { top: at(o, 0, 0, z1 + 46), center: at(o, 0, 0, zf + H / 2), floor: at(o, 0, 0, zf), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-W, W, -D, D, zf, z1], [-W - 10, W + 10, -D - 10, D + 10, 0, zf]], center: anchors.center, glowR: W * 1.4 }), anchors };
}

// =====================================================================================
// 地址门牌信箱 addrPlate — 立柱上的拱顶信箱，正面门板钉门牌（"地址 1"），侧面小旗
// opts: text="地址 1", flag=false（小旗竖起）
// 可动：ID-flag（小旗 rotator，KIT.rot(tl,"ID-flag",t,-90) 竖起；0 放平）
// anchors: top, center, ground, plate（门牌中心）
// =====================================================================================
export function addrPlate(o, opts = {}) {
  const p = opts.id ?? "addr", atk = isAtk(opts);
  const W = 34, D = 50, z0 = 108, zt = 146, r = W;
  const m = atk ? M.red : { f: "#e9ebee", s: "#cfd3d8", t: "#f6f7f8", st: "#5d636b" };
  let s = contactShadow(o, 50, 40);
  s += cyl(o, 0, 0, 20, 0, 6, M.steel, { sw: 1.2, seg: 20 }) + cyl(o, 0, 0, 7, 6, z0, M.steel, { sw: 1.4, seg: 16 });
  s += box(o, -16, 16, -20, 20, z0 - 8, z0, M.dark, 1.2);
  // −u side flat face + base
  s += `<polygon points="${pts([at(o, -W, -D, z0), at(o, -W, D, z0), at(o, -W, D, zt), at(o, -W, -D, zt)])}" fill="${m.f}" stroke="${m.st}" stroke-width="1.8" stroke-linejoin="round"/>`;
  // arched roof: facets
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI, a1 = ((i + 1) / N) * Math.PI, am = (a0 + a1) / 2;
    const nu = Math.cos(am), nz = Math.sin(am);
    if (depth(-nu, 0, nz) <= 0 && nu > 0.2) { /* hidden +u side */ }
    const q = (a, v) => at(o, -r * Math.cos(a), v, zt + r * Math.sin(a) * 0.85);
    const vis = -(-nu) * SA * CE * 0 + depth(-nu, 0, nz) > -0.05;
    if (!vis) continue;
    const col = mix(m.t, m.f, Math.max(0, Math.min(1, (1 - nz) * (nu > 0 ? 1 : 0.4))));
    s += `<polygon points="${pts([q(a0, -D), q(a1, -D), q(a1, D), q(a0, D)])}" fill="${col}" stroke="${col}" stroke-width="0.8"/>`;
  }
  // +v door (arched end)
  let d = `M${pts([at(o, -W, D, z0)])}L${pts([at(o, W, D, z0)])}L${pts([at(o, W, D, zt)])}`;
  for (let i = 0; i <= N; i++) { const a = (i / N) * Math.PI; d += `L${pts([at(o, r * Math.cos(a), D, zt + r * Math.sin(a) * 0.85)])}`; }
  s += `<path d="${d}Z" fill="${m.s}" stroke="${m.st}" stroke-width="1.8" stroke-linejoin="round"/>`;
  // roof outline
  let ro = ""; for (let i = 0; i <= N; i++) { const a = (i / N) * Math.PI; ro += `${i ? "L" : "M"}${pts([at(o, -r * Math.cos(a), -D, zt + r * Math.sin(a) * 0.85)])}`; }
  s += line3(o, [[-W, -D, zt], [-W, D, zt]], m.st, 1.2);
  // door plate + handle
  const pm = frameV(o, -W, D, zt + 20);
  s += G_(matStr(pm), `<rect x="6" y="20" width="${2 * W - 12}" height="22" rx="3" fill="${atk ? "#a8322a" : "#1d93ba"}"/>` + txt(W, 36, opts.text ?? "地址 1", { size: 13, anchor: "middle", fill: "#ffffff" }) +
    `<rect x="${W - 10}" y="50" width="20" height="5" rx="2.5" fill="#5d636b"/>`);
  // flag on −u side
  const up = opts.flag ? -90 : 0;
  s += rotator(p + "-flag", frameU(o, -W - 2, 16, zt + 6), 0, 0, up, `<rect x="-2" y="-2" width="44" height="5" rx="2" fill="#3b3e44"/><rect x="26" y="-14" width="22" height="16" rx="2" fill="#2aa3c9" stroke="#155e77" stroke-width="1.2"/><circle cx="0" cy="0" r="4" fill="#7d828a"/>`);
  const anchors = { top: at(o, 0, 0, zt + r + 50), center: at(o, 0, D, zt), plate: applyM(pm, W, 31), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-W, W, -D, D, z0, zt + r * 0.85], { cyl: [0, 0, 7, 0, z0] }], center: anchors.center, badgeR: 22, glowR: 80 }), anchors };
}

// =====================================================================================
// 传送带 conveyor — 私钥生产线：沿 +u 的皮带输送机，钢边框、滚筒、支腿，皮带上有横向防滑条
// opts: len=560, width=120
// 可动：ID-stripes（防滑条）→ KIT.belt(tl,ID,t,dur,dist) 皮带前进 dist 单位
// anchors: top, center, ground, start（−u 端皮带面）, end（+u 端）, deck（中心皮带面）；常量 CONVEYOR_TOP = 皮带面高度
// =====================================================================================
export const CONVEYOR_TOP = 74;
export function conveyor(o, opts = {}) {
  const p = opts.id ?? "belt", L = (opts.len ?? 560) / 2, Wd = (opts.width ?? 120) / 2, zt = CONVEYOR_TOP;
  const rail = { f: "#a9aeb5", s: "#8b9199", t: "#c3c8ce", st: "#4b4f56" };
  let s = contactShadow(o, L * 0.9, Wd * 1.6);
  const legs = []; for (let u = -L + 30; u <= L - 30; u += 170) legs.push(u);
  if (legs[legs.length - 1] < L - 60) legs.push(L - 30);
  for (const u of legs) s += box(o, u - 7, u + 7, -Wd - 8, -Wd + 4, 0, zt - 14, M.steel, 1.2);
  s += box(o, -L, L, -Wd - 12, -Wd, zt - 20, zt + 6, rail, 1.4);
  // belt surface
  s += box(o, -L + 6, L - 6, -Wd, Wd, zt - 14, zt, { f: "#3b3e44", s: "#2b2d31", t: "#45484f", st: "#141518" }, 1.4);
  const mT = frameTop(o, -L + 6, -Wd, zt);
  const sp = 28, bw = 2 * L - 12;
  let st = ""; for (let x = -sp; x <= bw + sp; x += sp) st += `<rect x="${x}" y="3" width="6" height="${2 * Wd - 6}" rx="2" fill="#5a5e65"/>`;
  s += G_(matStr(mT), `<defs><clipPath id="${p}-bc"><rect x="0" y="0" width="${bw}" height="${2 * Wd}"/></clipPath></defs><g clip-path="url(#${p}-bc)"><g id="${p}-stripes" data-sp="${sp}" transform="translate(0,0)">${st}</g></g>`);
  // end roller on −u
  s += G_(faceU(o, -L + 6, 0, zt - 7), `<circle cx="0" cy="0" r="9" fill="#c9cdd2" stroke="#4b4f56" stroke-width="1.5"/><circle cx="0" cy="0" r="3" fill="#4b4f56"/>`);
  for (const u of legs) s += box(o, u - 7, u + 7, Wd - 4, Wd + 8, 0, zt - 14, M.steel, 1.2);
  s += box(o, -L, L, Wd, Wd + 12, zt - 20, zt + 6, rail, 1.4);
  s += G_(faceV(o, -L, Wd + 12, zt + 6), Array.from({ length: Math.floor((2 * L) / 60) }, (_, i) => `<circle cx="${30 + i * 60}" cy="13" r="3" fill="#5d636b"/>`).join(""));
  const anchors = { top: at(o, 0, 0, zt + 80), center: at(o, 0, 0, zt), deck: at(o, 0, 0, zt), start: at(o, -L + 30, 0, zt), end: at(o, L - 30, 0, zt), ground: at(o), len: 2 * L };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-L, L, -Wd - 12, Wd + 12, 0, zt + 6]], center: anchors.center, glowR: L }), anchors };
}

/** catalogue: name → constructor */
export const CATALOG_EXT = {
  lottery, prngCounter, comboDial, shaft, die, diceCup, mnemonicPlate, seedJar, deriveTree, gpuRig, rollCounter,
  curveBoard, sigPaper, cloth, puzzleSet, proofCard, quantum, kMachine, vitrine, addrPlate, conveyor,
};
/** runtime-ext.js contents — inline after iso.runtimeJs() */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
