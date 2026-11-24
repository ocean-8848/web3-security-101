// objects-ext.mjs — 第 06 章补充拟物物件（与 kit/objects.mjs 同一投影、同一接口）
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"
//   opts.glow = true 时脚下绿色地光
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，KIT.grow / broke / fixed 直接可用。
// 运行时动画助手在 runtime-ext.js（window.KITX06，同时合并进 window.KITX），用 runtimeExtJs() 内联，放在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  CA, SA, SE, CE, U, V, Z, f, f4, at, pts, M, C, lighten, darken, mat,
  frameV, frameU, frameTop, matStr, applyM, faceV, faceU, faceTop,
  box, rbox, cyl, loft, flat, line3, circlePlan,
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
function shell(p, o, opts, s) {
  const st = opts.state ?? "normal", broken = st === "broken";
  const glowOn = (opts.glow ?? s.glowDefault ?? false) && !broken;
  const [ox, oy] = at(o);
  const glowSvg = s.glowR ? `<g id="${p}-glow" opacity="${glowOn ? 1 : 0}">${glow(p + "-gl", s.glowAt ?? o, s.glowR)}</g>` : "";
  const k = s.k ?? 1, sc0 = k !== 1 ? `<g transform="translate(${f(ox)} ${f(oy)}) scale(${f4(k)}) translate(${f(-ox)} ${f(-oy)})">` : "", sc1 = k !== 1 ? "</g>" : "";
  return `<g id="${p}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}" data-state="${st}" data-k="${f4(k)}" ${s.attrs ?? ""}>${sc0}${s.under ?? ""}${glowSvg}${s.shadow ?? ""}
  <g id="${p}-solid" opacity="${broken ? opts.ghost ?? 0.18 : 1}">${s.solid}</g>
  ${wireSvg(p + "-wire", o, s.wire, { opacity: broken ? 1 : 0 })}
  ${badgeSvg(p + "-x", s.center, (s.badgeR ?? 30) / k, broken && opts.badge !== false ? 1 : 0)}${s.over ?? ""}${sc1}</g>`;
}
/** uniform world scale k about the ground origin: scale every anchor point (and world lengths listed in `lens`) */
function scaleAnchors(o, k, A, lens = []) {
  if (k === 1) return A;
  const [ox, oy] = at(o);
  const sp = (q) => [f(ox + (q[0] - ox) * k), f(oy + (q[1] - oy) * k)];
  const isPt = (q) => Array.isArray(q) && q.length === 2 && typeof q[0] === "number";
  const out = {};
  for (const [key, val] of Object.entries(A)) {
    if (isPt(val)) out[key] = sp(val);
    else if (Array.isArray(val) && val.length && isPt(val[0])) out[key] = val.map(sp);
    else if (lens.includes(key) && typeof val === "number") out[key] = val * k;
    else out[key] = val;
  }
  return out;
}
const isAtk = (opts) => opts.state === "attacker";
const mArr = (m) => m.map((v, i) => (i < 4 ? f4(v) : f(v))).join(",");
function rotator(id, m, px, py, a, inner, extra = "") {
  const tr = `${matStr(m)} translate(${px} ${py}) rotate(${f(a)}) translate(${-px} ${-py})`;
  return `<g id="${id}" data-m="${mArr(m)}" data-px="${px}" data-py="${py}" data-a="${f(a)}" transform="${tr}" ${extra}>${inner}</g>`;
}
const P = (q) => pts([q]);
/** screen offset of a world displacement (du, dv, dz) */
const sv = (du, dv, dz = 0) => [du * U[0] + dv * V[0], du * U[1] + dv * V[1] - dz * CE];
const TEAL = { f: "#5cc0e0", s: "#3a9ec2", t: "#9ad9ee", st: "#1f7896" };
const GOLD = M.gold;
const ENAMEL = { f: "#eef1f3", s: "#d3d9de", t: "#f8f9fa", st: "#7f8b95" };

// ---------------------------------------------------------------- 份额凭证卡面（本地 60×36）
/** card face: cream, teal border, round emblem (pie slice) on the left, "份额" on the right */
export function certFace(o = {}) {
  const atk = o.atk, ghost = o.ghost, W = 60, H = 36;
  const edge = atk ? "#e0453a" : "#2aa3c9", em = atk ? "#e0453a" : "#1d93ba";
  if (ghost) {
    return `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="3" fill="rgba(42,163,201,0.13)" stroke="${edge}" stroke-width="2" stroke-dasharray="4 3"/>
      <circle cx="15" cy="18" r="9" fill="none" stroke="${edge}" stroke-width="1.6" stroke-dasharray="3 2.4"/>
      <path d="M15 18V9A9 9 0 0 1 23.6 15.3Z" fill="rgba(42,163,201,0.45)"/>` +
      txt(40, 23, o.text ?? "份额", { size: 11, anchor: "middle", fill: "#17809f" });
  }
  return `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="3" fill="${atk ? "#fff6f4" : "#fffdf8"}" stroke="${edge}" stroke-width="2.4"/>
    <rect x="3.5" y="3.5" width="${W - 7}" height="${H - 7}" rx="2" fill="none" stroke="${edge}" stroke-width="0.8"/>
    <circle cx="15" cy="18" r="9" fill="${em}"/><circle cx="15" cy="18" r="6.4" fill="none" stroke="#ffffff" stroke-width="1"/>
    <path d="M15 18V11.6A6.4 6.4 0 0 1 21.1 16.1Z" fill="#ffffff"/>` +
    txt(40, 21.5, o.text ?? "份额", { size: 11, anchor: "middle", fill: C.ink }) +
    `<rect x="29" y="25" width="22" height="1.6" rx="0.8" fill="#cfc7b8"/><rect x="33" y="28.4" width="14" height="1.4" rx="0.7" fill="#e3ddd1"/>`;
}

// =====================================================================================
// 取整刀 roundCutter — 工业版裁纸铡刀（约 320×180×200，刀柄抬起时约 250 高）
// 刀床顶面刻等距刻度（每格 = 1 个最小单位，整数刻线加粗，半格细线），刀口在第 cutAt 格；
// 床上放一根金条：stock 格（整数部分，刀口左边）+ chip 格（余数碎屑，刀口右边）。
// 前沿（+v 面）两个抽屉托盘：左青蓝"协议"、右红"调用者"；−u 侧面两档拨杆"向上 ↑ / 向下 ↓"。
// opts: dir="down"|"up"（拨杆初始挡位）, bladeUp=true, stock=1, chip=0.5, load=true（金条）, cutAt=6,
//       pileL=0, pileR=0（托盘里初始碎屑数，最多 9）, labels（{L:"协议",R:"调用者"}）
// 可动：ID-blade（铡刀，KITX06.blade）, ID-lever（拨杆，KITX06.lever，ID-led-up / ID-led-dn 挡位灯）,
//       ID-chip（余数碎屑，KITX06.chip 落进 "L"/"R" 托盘；KITX06.chipReset 复位）, ID-feedA/B（KITX06.feed 推料）,
//       ID-pileL-k / ID-pileR-k（托盘碎屑，KITX06.pile 设数量）；KITX06.cut = 落刀 + 碎屑入盘 + 堆 +1 + 抬刀
// anchors: top, center, ground, cut（刀口中点）, chip, stock, trayL, trayR（托盘上方标签点）, lever, leverUp, leverDn,
//          handle（抬刀时刀柄）, ticks[]（刀床前沿每个整数刻度点，0..n）, cell
// =====================================================================================
export function roundCutter(o, opts = {}) {
  const p = opts.id ?? "rc", atk = isAtk(opts), K = opts.scale ?? 1.25;
  const u0 = -160, u1 = 160, v0 = -90, v1 = 90, zb = 10, zc = 92, zt = 104;
  const body = atk ? mat("#c9463c") : { f: "#a9aeb5", s: "#8b9199", t: "#c3c8ce", st: "#4b5058" };
  const cw = 36, uS = -140, nT = 8, cutAt = opts.cutAt ?? 6, uc = uS + cutAt * cw;
  const dir = opts.dir ?? "down", aUp = -36, aDn = 36;
  const bUp = -50, bladeA = opts.bladeUp === false ? 0 : bUp;
  let s = contactShadow(o, 250, 170);
  // plinth + cabinet
  s += rbox(o, u0 - 8, u1 + 8, v0 - 8, v1 + 8, 0, zb, 8, M.ink, { sw: 1.4 });
  s += rbox(o, u0, u1, v0, v1, zb, zc, 8, body, { sw: 2 });
  // −u face: panel seam + lever plate
  const mL = frameU(o, u0, v0, zc);
  let lf = `<rect x="6" y="5" width="${v1 - v0 - 12}" height="${zc - zb - 10}" rx="6" fill="none" stroke="${darken(body.f, 0.16)}" stroke-width="1.6"/>`;
  lf += `<rect x="16" y="9" width="152" height="66" rx="6" fill="#2b2d31" stroke="#c9cdd2" stroke-width="2"/>
    <rect x="19" y="12" width="146" height="60" rx="4" fill="none" stroke="#45484e" stroke-width="1"/>`;
  const pv = [46, 42], arcP = (a, r) => [pv[0] + r * Math.cos(a * DEG), pv[1] + r * Math.sin(a * DEG)];
  const a0 = arcP(aUp, 33), a1 = arcP(aDn, 33);
  lf += `<path d="M${f(a0[0])} ${f(a0[1])}A33 33 0 0 1 ${f(a1[0])} ${f(a1[1])}" fill="none" stroke="#141518" stroke-width="9" stroke-linecap="round"/>
    <path d="M${f(a0[0])} ${f(a0[1])}A33 33 0 0 1 ${f(a1[0])} ${f(a1[1])}" fill="none" stroke="#45484e" stroke-width="2" stroke-linecap="round"/>`;
  lf += txt(92, 33, "向上 ↑", { size: 15, fill: "#f4f5f6" }) + txt(92, 63, "向下 ↓", { size: 15, fill: "#5cc0e0" });
  lf += ledSvg(p + "-led-up", 156, 27, 4.5, dir === "up" ? "blue" : "off") + ledSvg(p + "-led-dn", 156, 57, 4.5, dir === "down" ? "blue" : "off");
  [[22, 15], [162, 15], [22, 69], [162, 69]].forEach(([x, y]) => { lf += `<circle cx="${x}" cy="${y}" r="2" fill="#7d828a"/>`; });
  s += G_(matStr(mL), lf);
  const lever = `<rect x="${pv[0]}" y="${pv[1] - 4}" width="44" height="8" rx="4" fill="#d4d7db" stroke="#3b3e44" stroke-width="1.6"/><rect x="${pv[0] + 4}" y="${pv[1] - 3}" width="36" height="2.4" rx="1.2" fill="#f4f5f6"/>
    <defs><radialGradient id="${p}-kg" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#6a6e75"/><stop offset="0.6" stop-color="#2b2d31"/><stop offset="1" stop-color="#141518"/></radialGradient></defs>
    <circle cx="${pv[0] + 50}" cy="${pv[1] + 1.5}" r="10" fill="rgba(0,0,0,0.3)"/><circle cx="${pv[0] + 50}" cy="${pv[1]}" r="10" fill="url(#${p}-kg)" stroke="#141518" stroke-width="1.4"/>
    <circle cx="${pv[0] + 47}" cy="${pv[1] - 3}" r="3" fill="#9aa0a8" opacity="0.8"/>
    <circle cx="${pv[0]}" cy="${pv[1]}" r="11" fill="#c3c8ce" stroke="#3b3e44" stroke-width="1.6"/><circle cx="${pv[0]}" cy="${pv[1]}" r="4" fill="#3b3e44"/>`;
  s += rotator(p + "-lever", mL, pv[0], pv[1], dir === "up" ? aUp : aDn, lever, `data-up="${aUp}" data-dn="${aDn}"`);
  // +v face: band, tray recesses, nameplate, vents
  const mF = frameV(o, u0, v1, zc);
  const tL = [-140, -46], tR = [6, 100], tz0 = 24, tz1 = 62; // trays (u ranges, z)
  let ff = `<rect x="10" y="5" width="${u1 - u0 - 20}" height="5" fill="#2aa3c9"/>`;
  for (const [a, b] of [tL, tR]) ff += `<rect x="${a - u0 - 5}" y="${zc - tz1 - 5}" width="${b - a + 10}" height="${tz1 - tz0 + 8}" rx="4" fill="${darken(body.s, 0.45)}"/>`;
  ff += `<rect x="${tR[1] - u0 + 14}" y="${zc - tz1 - 4}" width="${u1 - tR[1] - 26}" height="20" rx="3" fill="#f4f5f6" stroke="#7d828a" stroke-width="1.2"/>` +
    txt((tR[1] + u1) / 2 - u0 - 4, zc - tz1 + 10.5, "÷ ROUND", { size: 9, mono: true, anchor: "middle", fill: "#3b3e44", weight: 800 });
  for (let i = 0; i < 6; i++) ff += `<rect x="${tR[1] - u0 + 16 + i * 8}" y="${zc - tz1 + 24}" width="4" height="22" rx="2" fill="${darken(body.s, 0.22)}"/>`;
  [[8, 14], [u1 - u0 - 8, 14], [8, zc - zb - 8], [u1 - u0 - 8, zc - zb - 8]].forEach(([x, y]) => { ff += `<circle cx="${x}" cy="${y}" r="2.4" fill="${lighten(body.s, 0.3)}"/>`; });
  s += G_(matStr(mF), ff);
  // bed plate
  const bedM = { f: "#dfe2e6", s: "#c4c8ce", t: "#eef0f2", st: "#6e747c" };
  s += box(o, u0 - 4, u1 + 4, v0 - 4, v1 + 4, zc, zt, bedM, 1.8);
  // bed top: grid, ruler strip, cutting groove
  let bt = `<rect x="6" y="6" width="${u1 - u0 - 4}" height="${v1 - v0 - 4}" rx="3" fill="#f4f6f7"/>`;
  for (let k = 0; k <= nT; k++) {
    const x = uS + k * cw - (u0 - 4);
    bt += `<line x1="${f(x)}" y1="18" x2="${f(x)}" y2="${v1 - v0 - 32}" stroke="#2aa3c9" stroke-width="${1.1}" opacity="0.45"/>`;
    if (k < nT) bt += `<line x1="${f(x + cw / 2)}" y1="18" x2="${f(x + cw / 2)}" y2="${v1 - v0 - 32}" stroke="#2aa3c9" stroke-width="0.6" opacity="0.3"/>`;
  }
  for (let j = 0; j <= 4; j++) bt += `<line x1="${uS - u0 + 4}" y1="${f(18 + j * (v1 - v0 - 50) / 4)}" x2="${f(uS - u0 + 4 + nT * cw)}" y2="${f(18 + j * (v1 - v0 - 50) / 4)}" stroke="#2aa3c9" stroke-width="0.6" opacity="0.3"/>`;
  // front ruler strip
  const ry0 = v1 - v0 - 28, ry1 = v1 - v0 + 2;
  bt += `<rect x="10" y="${ry0}" width="${u1 - u0 - 12}" height="${ry1 - ry0}" rx="2" fill="#ffffff" stroke="#9aa0a8" stroke-width="1"/>`;
  for (let k = 0; k <= nT; k++) {
    const x = uS + k * cw - (u0 - 4);
    bt += `<line x1="${f(x)}" y1="${ry0}" x2="${f(x)}" y2="${ry0 + 14}" stroke="#17809f" stroke-width="2.6"/>` + txt(x, ry1 - 3, k, { size: 11, mono: true, anchor: "middle", fill: "#17809f", weight: 800 });
    if (k < nT) for (const q of [0.25, 0.5, 0.75]) bt += `<line x1="${f(x + cw * q)}" y1="${ry0}" x2="${f(x + cw * q)}" y2="${ry0 + (q === 0.5 ? 9 : 5)}" stroke="#2aa3c9" stroke-width="1"/>`;
  }
  // cutting groove at uc
  bt += `<rect x="${f(uc - (u0 - 4) - 3)}" y="8" width="6" height="${v1 - v0 - 6}" rx="2" fill="#2b2d31"/><rect x="${f(uc - (u0 - 4) - 1)}" y="10" width="1.4" height="${v1 - v0 - 10}" fill="#6a6e75"/>`;
  s += G_(faceTop(o, u0 - 4, v0 - 4, zt), bt);
  // trays (right first: smaller u is nearer)
  const rim = tz1, floorZ = rim - 9, tv0 = v1 + 2, tv1 = v1 + 46;
  const pileSlots = [[0.3, 0.3, 0], [0.7, 0.32, 0], [0.5, 0.55, 0], [0.18, 0.62, 0], [0.82, 0.6, 0], [0.4, 0.32, 1], [0.64, 0.42, 1], [0.48, 0.5, 2], [0.3, 0.5, 1]];
  const trays = {};
  const tray = (side, [a, b], m, name, nm0) => {
    let t = box(o, a, b, tv0, tv1, tz0, rim, m, 1.6);
    t += flat(o, [[a + 6, tv0 + 5], [b - 6, tv0 + 5], [b - 6, tv1 - 6], [a + 6, tv1 - 6]], rim, darken(m.s, 0.42));
    t += flat(o, [[a + 6, tv0 + 5], [b - 6, tv0 + 5], [b - 6, tv0 + 9], [a + 6, tv0 + 9]], rim, darken(m.s, 0.6));
    // pile chips, painter order: layer, then far → near
    const order = pileSlots.map((q, k) => ({ q, k })).sort((x, y) => x.q[2] - y.q[2] || (x.q[1] - y.q[1]) || (y.q[0] - x.q[0]));
    let pl = "";
    for (const { q, k } of order) {
      const cu = a + 8 + q[0] * (b - a - 16), cv = tv0 + 7 + q[1] * (tv1 - tv0 - 14), cz = floorZ + q[2] * 6 + (q[2] ? 4 : 0);
      pl += `<g id="${p}-pile${side}-${k}" opacity="${k < nm0 ? 1 : 0}">${box(o, cu - 9, cu + 9, cv - 6, cv + 6, cz, cz + 6, GOLD, 1.1)}</g>`;
    }
    t += `<g id="${p}-pile${side}" data-n="${nm0}" data-max="${pileSlots.length}">${pl}</g>`;
    // front lip + −u wall redrawn over the pile
    t += box(o, a, b, tv1 - 5, tv1, tz0, rim, m, 1.6) + box(o, a, a + 5, tv0, tv1, tz0, rim, m, 1.4);
    const w = b - a;
    t += G_(faceV(o, a, tv1, rim), `<rect x="${w / 2 - 34}" y="6" width="68" height="20" rx="3" fill="#fffdf8" stroke="${m.st}" stroke-width="1.4"/>` +
      txt(w / 2, 21.5, name, { size: 14, anchor: "middle", fill: m.st }) +
      `<rect x="${w / 2 - 18}" y="30" width="36" height="5" rx="2.5" fill="#d4d7db" stroke="#5a5e65" stroke-width="1"/>`);
    trays[side] = { cu: (a + b) / 2, cv: (tv0 + tv1) / 2 - 4, z: floorZ + 10 };
    return t;
  };
  const labels = opts.labels ?? { L: "协议", R: "调用者" };
  s += tray("R", tR, M.red, labels.R, opts.pileR ?? 0);
  s += tray("L", tL, TEAL, labels.L, opts.pileL ?? 0);
  // back fence (part behind the blade plane), hinge bracket
  const fz = zt + 16, fv0 = v0 - 2, fv1 = v0 + 12;
  s += box(o, uc + 24, u1 - 2, fv0, fv1, zt, fz, M.steel, 1.4);
  s += box(o, uc + 4, uc + 22, v0 - 6, v0 + 22, zt, zt + 40, M.ink, 1.4);
  // load: chip (behind blade plane), then blade, then stock
  const stock = opts.stock ?? 1, chipL = (opts.chip ?? 0.5) * cw, bw0 = -24, bw1 = 24, bh = 18, load = opts.load !== false;
  const feedOff = sv(-cw * 2.5, 0);
  const goldBar = (a, b) => {
    let g = box(o, a, b, bw0, bw1, zt, zt + bh, GOLD, 1.3);
    g += `<path d="M${P(at(o, a + 3, bw0 + 4, zt + bh))}L${P(at(o, b - 3, bw0 + 4, zt + bh))}" stroke="#fff4c8" stroke-width="2" opacity="0.8"/>`;
    return g;
  };
  const chipC = at(o, uc + 2 + chipL / 2, 0, zt + bh);
  const tgt = (side) => { const T = trays[side], q = at(o, T.cu, T.cv, T.z); return [f(q[0] - chipC[0]), f(q[1] - chipC[1])]; };
  const [lx, ly] = tgt("L"), [rx, ry] = tgt("R");
  s += `<g id="${p}-feedA" data-fx="${f(feedOff[0])}" data-fy="${f(feedOff[1])}" opacity="${load ? 1 : 0}"><g id="${p}-chip" data-lx="${lx}" data-ly="${ly}" data-rx="${rx}" data-ry="${ry}">${goldBar(uc + 2, uc + 2 + chipL)}</g></g>`;
  // blade (in plane u = uc), thickness copy behind (+u)
  const mB = frameU(o, uc, v0 + 8, zt + 18), Lb = v1 - v0 + 2;
  const blade = `<path d="M-18 -18L${Lb - 26} -6L${Lb - 26} 18L-18 18Z" fill="#c9cdd2" stroke="#4b5058" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M-16 12L${Lb - 28} 12L${Lb - 28} 17L-16 17Z" fill="#f4f6f8"/>
    <path d="M-12 -12L${Lb - 30} -2" stroke="#e8ebee" stroke-width="2" opacity="0.8"/>
    <path d="M30 4H${Lb - 60}" stroke="#2aa3c9" stroke-width="2" opacity="0.65"/>
    <rect x="${Lb - 46}" y="-14" width="58" height="16" rx="3" fill="#5a5f67" stroke="#2b2e33" stroke-width="1.6"/>
    <rect x="${Lb + 6}" y="-18" width="64" height="22" rx="11" fill="#2b2d31" stroke="#141518" stroke-width="1.6"/>
    <path d="M${Lb + 14} -15H${Lb + 60}" stroke="#5a5e65" stroke-width="2.4" stroke-linecap="round"/>` +
    [0, 1, 2, 3, 4].map((i) => `<line x1="${Lb + 20 + i * 9}" y1="-6" x2="${Lb + 20 + i * 9}" y2="1" stroke="#45484e" stroke-width="1.4"/>`).join("") +
    `<circle cx="0" cy="0" r="12" fill="#d4d7db" stroke="#2b2d31" stroke-width="1.8"/><path d="M-5 -3L0 -6L5 -3L5 3L0 6L-5 3Z" fill="#5a5e65"/>
    <circle cx="${Lb - 58}" cy="6" r="2.6" fill="#7d828a"/><circle cx="${Lb - 90}" cy="5" r="2.6" fill="#7d828a"/>`;
  const thick = sv(6, 0);
  s += `<use href="#${p}-blade" transform="translate(${f(thick[0])},${f(thick[1])})" style="filter:brightness(0.62)"/>`;
  s += rotator(p + "-blade", mB, 0, 0, bladeA, blade, `data-up="${bUp}" data-dn="0"`);
  s += `<g id="${p}-feedB" data-fx="${f(feedOff[0])}" data-fy="${f(feedOff[1])}" opacity="${load ? 1 : 0}"><g id="${p}-stock">${goldBar(uc - stock * cw, uc)}</g></g>`;
  // front fence segment (nearer than the blade plane)
  s += box(o, u0 + 2, uc - 14, fv0, fv1, zt, fz, M.steel, 1.4);
  s += G_(faceV(o, u0 + 2, fv1, fz), `<rect x="4" y="4" width="${uc - 14 - u0 - 10}" height="3" rx="1.5" fill="#9aa0a8"/>`);
  // anchors
  const handleUp = applyM(mB, 0, 0); // pivot; handle point computed below
  const ra = bladeA * DEG, hx = Lb + 38, hy = -7;
  const hUp = (() => { const a = bUp * DEG; return applyM(mB, hx * Math.cos(a) - hy * Math.sin(a), hx * Math.sin(a) + hy * Math.cos(a)); })();
  const anchors = {
    top: at(o, -30, 0, 250), center: at(o, 0, 0, 70), ground: at(o), cut: at(o, uc, 0, zt), chip: chipC, stock: at(o, uc - stock * cw / 2, 0, zt + bh),
    trayL: at(o, trays.L.cu, tv1, tz0 - 4), trayR: at(o, trays.R.cu, tv1, tz0 - 4), trayLTop: at(o, trays.L.cu, trays.L.cv, rim + 10), trayRTop: at(o, trays.R.cu, trays.R.cv, rim + 10),
    lever: applyM(mL, pv[0], pv[1]), leverUp: applyM(mL, 128, 28), leverDn: applyM(mL, 128, 58), pivot: handleUp, handle: hUp,
    ticks: Array.from({ length: nT + 1 }, (_, k) => at(o, uS + k * cw, v1 + 4, zt)), cell: cw,
    blade: p + "-blade", leverId: p + "-lever", chipId: p + "-chip",
  };
  void ra;
  return {
    svg: shell(p, o, opts, { solid: s, wire: [[u0, u1, v0, v1, 0, zt], [tL[0], tL[1], tv0, tv1, tz0, rim], [tR[0], tR[1], tv0, tv1, tz0, rim], [uc - 2, uc + 6, v0, v1 + 70, zt, zt + 40]], center: anchors.center, glowR: 260, k: K }),
    anchors: scaleAnchors(o, K, anchors, ["cell"]),
  };
}

// =====================================================================================
// 精度刻度尺 decimalRuler — 立在两只木支架上的木框钢尺（尺面 +v 朝前）
// 尺面被小数点分成两段：左 ints 格整数位（白），右 places 格小数位（青蓝底）。places=18 时格更密、尺更长。
// 尺头铭牌写链名（只是质感）；一个青蓝游标卡在尺上。
// opts: places=6, ints=4, chain="CHAIN", slider=n-1.5（游标发丝线初始位置，单位：格，从整数段左端算）, scale=1, digits=true（格内数字）
// 可动：ID-slider（KITX06.slider 沿尺滑动）, ID-dot（小数点，KITX06.shiftDot 左右挪 n 格，可带红色闪烁 = 写死精度）,
//       ID-dec（小数段底色，随小数点自动伸缩）, ID-err（红色闪烁层）, ID-dot-r（小数点的红色态）
// anchors: top, center, ground, head（铭牌）, dot（小数点）, sliderTop, cells[]（每条格线底部点 0..n）, cellW
// =====================================================================================
export function decimalRuler(o, opts = {}) {
  const p = opts.id ?? "dr", atk = isAtk(opts), K = opts.scale ?? 1;
  const places = opts.places ?? 6, ints = opts.ints ?? 4, n = ints + places;
  const cw = opts.cell ?? (places > 12 ? 18 : 30), head = 74, Ls = n * cw, L = head + Ls + 18;
  const uA = -L / 2, uB = L / 2, zb = 40, H = 72, bv0 = -12, bv1 = 0;
  const wood = atk ? mat("#c9463c") : M.wood;
  let s = contactShadow(o, L * 0.55, 60);
  // trestle feet (behind / under the board)
  for (const x of [uA + 46, uB - 46]) {
    s += box(o, x - 18, x + 18, -42, 30, 0, 9, M.ink, 1.3);
    s += box(o, x - 7, x + 7, -26, -12, 9, zb + 30, { f: "#7a5636", s: "#5e4026", t: "#93694a", st: "#3a2614" }, 1.3);
  }
  // wood frame
  s += box(o, uA, uB, bv0, bv1, zb, zb + H, wood, 1.8);
  s += G_(faceTop(o, uA, bv0, zb + H), `<path d="M8 4H${L - 8}M14 8H${L * 0.6}" stroke="${darken(wood.t, 0.12)}" stroke-width="1.2"/>`);
  // face
  const mF = frameV(o, uA, bv1, zb + H), sx0 = head, sx1 = head + Ls, sy0 = 9, sy1 = H - 9;
  let fc = `<path d="M3 ${H * 0.3}Q${L * 0.3} ${H * 0.22} ${L - 3} ${H * 0.34}M3 ${H * 0.82}Q${L * 0.5} ${H * 0.9} ${L - 3} ${H * 0.78}" fill="none" stroke="${darken(wood.f, 0.1)}" stroke-width="1.2"/>`;
  // head nameplate
  const chain = opts.chain ?? "CHAIN";
  fc += `<rect x="8" y="10" width="${head - 16}" height="${H - 20}" rx="4" fill="#d9dcdf" stroke="#5d636b" stroke-width="1.6"/>
    <rect x="11" y="13" width="${head - 22}" height="${H - 26}" rx="3" fill="none" stroke="#f2f3f4" stroke-width="1"/>` +
    txt(head / 2, H / 2 + 4, chain, { size: Math.min(12, (head - 24) / (chain.length * 0.62)), mono: true, anchor: "middle", fill: "#3b3e44", weight: 800 }) +
    [[14, 16], [head - 14, 16], [14, H - 16], [head - 14, H - 16]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#7d828a"/>`).join("");
  // steel strip
  fc += `<defs><linearGradient id="${p}-st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f7f8"/><stop offset="0.55" stop-color="#e2e5e8"/><stop offset="1" stop-color="#c9cdd2"/></linearGradient></defs>
    <rect x="${sx0 - 2}" y="${sy0 - 2}" width="${Ls + 4}" height="${sy1 - sy0 + 4}" rx="2" fill="#7d828a"/>
    <rect x="${sx0}" y="${sy0}" width="${Ls}" height="${sy1 - sy0}" fill="url(#${p}-st)"/>`;
  fc += `<rect id="${p}-dec" x="${sx0 + ints * cw}" y="${sy0}" width="${places * cw}" height="${sy1 - sy0}" fill="rgba(42,163,201,0.22)" data-x0="${sx0 + ints * cw}" data-w0="${places * cw}" data-cw="${cw}"/>`;
  fc += `<rect id="${p}-err" x="${sx0}" y="${sy0}" width="0" height="${sy1 - sy0}" fill="#e0453a" opacity="0"/>`;
  for (let i = 0; i <= n; i++) {
    const x = sx0 + i * cw, isInt = i <= ints;
    fc += `<line x1="${x}" y1="${sy0}" x2="${x}" y2="${sy0 + (isInt ? 18 : 14)}" stroke="${isInt ? "#1c1c1c" : "#17809f"}" stroke-width="${isInt ? 2 : 1.5}"/>`;
    if (i < n) fc += `<line x1="${x + cw / 2}" y1="${sy0}" x2="${x + cw / 2}" y2="${sy0 + 6}" stroke="${i < ints ? "#5a5e65" : "#2aa3c9"}" stroke-width="1"/>`;
    if (i < n && opts.digits !== false) {
      const d = i < ints ? (i === ints - 1 ? "1" : "") : "0";
      if (d) fc += txt(x + cw / 2, sy1 - 5, d, { size: Math.min(19, cw * 0.8), mono: true, anchor: "middle", fill: i < ints ? "#1c1c1c" : "#17809f", weight: 800 });
    }
  }
  // end cap
  fc += `<rect x="${sx1 + 3}" y="${sy0 - 2}" width="10" height="${sy1 - sy0 + 4}" rx="2" fill="#b58630" stroke="#7a5716" stroke-width="1.2"/>`;
  // decimal point (movable)
  const dx = sx0 + ints * cw;
  fc += `<g id="${p}-dot" data-cw="${cw}" data-s="0" transform="translate(0,0)">
    <line x1="${dx}" y1="${sy0 - 4}" x2="${dx}" y2="${sy1 + 1}" stroke="#1c1c1c" stroke-width="2" stroke-dasharray="3 2.4"/>
    <circle cx="${dx}" cy="${sy1 + 2}" r="6.4" fill="#1c1c1c" stroke="#ffffff" stroke-width="1.6"/>
    <circle id="${p}-dot-r" cx="${dx}" cy="${sy1 + 2}" r="6.4" fill="#e0453a" stroke="#ffffff" stroke-width="1.6" opacity="0"/></g>`;
  s += G_(matStr(mF), fc);
  // slider (cursor)
  const pos = opts.slider ?? n - 1.5, sw = Math.max(cw * 1.3, 28), su = uA + head + pos * cw;
  const sl = (() => {
    let g = box(o, su - sw / 2, su + sw / 2, bv0 - 5, bv1 + 6, zb - 8, zb, TEAL, 1.3);
    g += box(o, su - sw / 2, su - sw / 2 + 5, bv1, bv1 + 6, zb, zb + H, TEAL, 1.2) + box(o, su + sw / 2 - 5, su + sw / 2, bv1, bv1 + 6, zb, zb + H, TEAL, 1.2);
    g += G_(faceV(o, su - sw / 2 + 5, bv1 + 6, zb + H), `<rect x="0" y="0" width="${sw - 10}" height="${H}" fill="rgba(208,234,244,0.32)" stroke="rgba(42,163,201,0.8)" stroke-width="1"/>
      <line x1="${(sw - 10) / 2}" y1="2" x2="${(sw - 10) / 2}" y2="${H - 2}" stroke="#155e77" stroke-width="1.6"/>
      <path d="M3 6L9 3" stroke="#ffffff" stroke-width="2" opacity="0.7"/>`);
    g += box(o, su - sw / 2, su + sw / 2, bv0 - 5, bv1 + 6, zb + H, zb + H + 7, TEAL, 1.3);
    g += box(o, su - 6, su + 6, bv0 - 2, bv1 + 3, zb + H + 7, zb + H + 15, M.ink, 1.2);
    return g;
  })();
  const cv = sv(cw, 0);
  s += `<g id="${p}-slider" data-pos="${pos}" data-cx="${f4(cv[0])}" data-cy="${f4(cv[1])}">${sl}</g>`;
  const anchors = {
    top: at(o, 0, 0, zb + H + 60), center: at(o, 0, 0, zb + H / 2), ground: at(o), head: applyM(mF, head / 2, H / 2),
    dot: applyM(mF, dx, sy1 + 2), sliderTop: at(o, su, 0, zb + H + 15), cells: Array.from({ length: n + 1 }, (_, i) => applyM(mF, sx0 + i * cw, sy1)), cellW: cw,
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [[uA, uB, bv0, bv1, zb, zb + H], [uA + 28, uA + 64, -42, 30, 0, 9], [uB - 64, uB - 28, -42, 30, 0, 9]], center: anchors.center, badgeR: 26, glowR: L * 0.6, k: K }), anchors: scaleAnchors(o, K, anchors, ["cellW"]) };
}

// =====================================================================================
// 份额出票机 shareDispenser — 小型售票机（约 120×90×200），设计成贴在 kit safe 的 −u 侧（用 besideSafe 定位）
// 正面（+v）：青蓝顶带"总份额"、机械计数窗（数字滚轮）、出票口 + 接票托板；右下"资产"投入口；顶上一盏小灯。
// opts: digits=5, value=0（计数窗初值）, tickets=3（预置可吐出的凭证张数）, issued=0（一开始已在托板上的张数）
// 可动：ID-dg-0..（数字轮，KITX06.tally 滚动）, ID-ticket-i（KITX06.issue 吐票）, ID-led（KIT.led 或 issue 自动闪）
// anchors: top, center, ground, counter（计数窗中心）, slot（出票口）, shelf（托板）, coin（资产投入口）, lamp
// =====================================================================================
export const besideSafe = (so) => ({ u: so.u - 145 - 62, v: so.v + 120 - 45 });
export function shareDispenser(o, opts = {}) {
  const p = opts.id ?? "sd", atk = isAtk(opts), K = opts.scale ?? 1;
  const u0 = -60, u1 = 60, v0 = -45, v1 = 45, zb = 8, zT = 186;
  const body = atk ? mat("#d65248", { st: "#8f2620" }) : ENAMEL, accent = atk ? "#a8322a" : "#2aa3c9";
  let s = contactShadow(o, 110, 80, 0, 20);
  s += rbox(o, u0 - 4, u1 + 4, v0 - 4, v1 + 4, 0, zb, 6, M.ink, { sw: 1.4 });
  s += rbox(o, u0, u1, v0, v1, zb, zT, 8, body, { sw: 2 });
  s += rbox(o, u0 - 3, u1 + 3, v0 - 3, v1 + 3, zT, zT + 8, 8, M.steel, { sw: 1.6 });
  // lamp
  s += cyl(o, 0, 0, 11, zT + 8, zT + 16, M.ink, { seg: 24, sw: 1.2 });
  const lp = at(o, 0, 0, zT + 28);
  s += `<circle cx="${f(lp[0])}" cy="${f(lp[1] + 6)}" r="13" fill="#2b2d31"/>` + ledSvg(p + "-led", lp[0], lp[1], 10, opts.led ?? "off") +
    `<path d="M${f(lp[0] - 6)} ${f(lp[1] - 4)}A7 7 0 0 1 ${f(lp[0] + 1)} ${f(lp[1] - 8)}" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity="0.75"/>`;
  // −u face
  const mU = frameU(o, u0, v0, zT);
  let uf = `<rect x="6" y="8" width="${v1 - v0 - 12}" height="8" fill="${accent}"/><rect x="8" y="26" width="${v1 - v0 - 16}" height="${zT - zb - 40}" rx="6" fill="none" stroke="${darken(body.f, 0.14)}" stroke-width="1.6"/>`;
  uf += `<circle cx="${(v1 - v0) / 2}" cy="70" r="20" fill="#1d93ba"/><circle cx="${(v1 - v0) / 2}" cy="70" r="14" fill="none" stroke="#ffffff" stroke-width="2"/><path d="M${(v1 - v0) / 2} 70V56A14 14 0 0 1 ${f((v1 - v0) / 2 + 13.3)} 65.7Z" fill="#ffffff"/>`;
  for (let i = 0; i < 5; i++) uf += `<rect x="${(v1 - v0) / 2 - 22}" y="${112 + i * 9}" width="44" height="4" rx="2" fill="${darken(body.f, 0.16)}"/>`;
  s += G_(matStr(mU), uf);
  // front face
  const mF = frameV(o, u0, v1, zT), W = u1 - u0;
  let ff = `<rect x="6" y="6" width="${W - 12}" height="24" rx="3" fill="${accent}"/>` + txt(W / 2, 23.5, "总份额", { size: 14, anchor: "middle", fill: "#ffffff" });
  // odometer
  const nd = opts.digits ?? 5, pitch = 18, wx = (W - nd * pitch) / 2, wy = 40, wh = 30, val = opts.value ?? 0;
  ff += `<rect x="${wx - 6}" y="${wy - 6}" width="${nd * pitch + 12}" height="${wh + 12}" rx="5" fill="#2b2d31" stroke="#141518" stroke-width="1.6"/>`;
  ff += `<defs><clipPath id="${p}-cw"><rect x="${wx}" y="${wy}" width="${nd * pitch}" height="${wh}"/></clipPath><linearGradient id="${p}-sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.45"/><stop offset="0.3" stop-color="#000" stop-opacity="0"/><stop offset="0.7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></linearGradient></defs><g clip-path="url(#${p}-cw)">`;
  for (let i = 0; i < nd; i++) {
    const x = wx + (nd - 1 - i) * pitch, d = Math.floor(val / 10 ** i) % 10;
    let col = ""; for (let j = 0; j <= 10; j++) col += txt(pitch / 2, wh / 2 + 7.5 + j * wh, j % 10, { size: 21, anchor: "middle", mono: true, weight: 800, fill: C.ink });
    ff += `<rect x="${x + 1}" y="${wy}" width="${pitch - 2}" height="${wh}" fill="${i === 0 ? "#ffffff" : "#f4f1ea"}"/><g transform="translate(${x},${wy})"><g id="${p}-dg-${i}" data-h="${wh}" transform="translate(0,${-d * wh})">${col}</g></g>`;
  }
  ff += `</g><rect x="${wx}" y="${wy}" width="${nd * pitch}" height="${wh}" fill="url(#${p}-sh)"/>`;
  for (let i = 1; i < nd; i++) ff += `<line x1="${wx + i * pitch}" y1="${wy}" x2="${wx + i * pitch}" y2="${wy + wh}" stroke="#2b2d31" stroke-width="1.2"/>`;
  ff += txt(W / 2, 90, "SHARES", { size: 9, mono: true, anchor: "middle", fill: darken(body.s, 0.4), weight: 800, extra: `letter-spacing="2"` });
  // ticket slot
  const zs = 82, sy = zT - zs;
  ff += `<rect x="18" y="${sy - 10}" width="${W - 36}" height="18" rx="4" fill="#c9cdd2" stroke="#5a5e65" stroke-width="1.4"/><rect x="20" y="${sy - 8}" width="${W - 40}" height="4" rx="2" fill="#eef0f2"/>
    <rect x="26" y="${sy - 2}" width="${W - 52}" height="6" rx="3" fill="#141518"/>`;
  // coin (assets) slot + vents
  ff += `<rect x="${W - 30}" y="${zT - 52}" width="18" height="30" rx="4" fill="#c9cdd2" stroke="#5a5e65" stroke-width="1.2"/><rect x="${W - 23}" y="${zT - 48}" width="4" height="22" rx="2" fill="#141518"/>` +
    txt(W - 21, zT - 58, "资产", { size: 9, anchor: "middle", fill: darken(body.s, 0.45) });
  for (let i = 0; i < 4; i++) ff += `<rect x="14" y="${zT - 54 + i * 8}" width="60" height="4" rx="2" fill="${darken(body.s, 0.14)}"/>`;
  s += G_(matStr(mF), ff);
  // catch shelf under the slot
  const zsh = 54, shv1 = v1 + 44;
  s += box(o, -38, 38, v1, shv1, zsh - 4, zsh, M.chrome, 1.3);
  s += box(o, -38, 38, shv1 - 3, shv1, zsh, zsh + 6, M.chrome, 1.2) + box(o, -38, -35, v1, shv1, zsh, zsh + 6, M.chrome, 1.2);
  s += box(o, -32, -26, v1, v1 + 6, zb, zsh - 4, M.steel, 1) ;
  // tickets: built where they land on the shelf; clipped to the space in front of the slot plane
  const nt = opts.tickets ?? 3, issued = opts.issued ?? 0;
  const clip = [at(o, -500, v1, zs), at(o, 500, v1, zs), at(o, 500, v1 + 900, zs), at(o, -500, v1 + 900, zs)];
  let tk = "";
  for (let k = 0; k < nt; k++) {
    const zl = zsh + 1.5 + k * 2.6, dv = [0, 1.5, -1][k % 3], du = [0, -2, 2][k % 3];
    const m = frameTop(o, -30 + du, v1 + 4 + dv, zl);
    const inn = sv(0, -40, zs - zl), mid = sv(0, 0, zs - zl);
    tk += `<g id="${p}-ticket-${k}" opacity="${k < issued ? 1 : 0}" data-ix="${f(inn[0])}" data-iy="${f(inn[1])}" data-mx="${f(mid[0])}" data-my="${f(mid[1])}">` +
      `<g transform="translate(0,${f(1.6 * CE)})">${G_(matStr(m), `<rect x="0" y="0" width="60" height="36" rx="3" fill="#ddd6c9"/>`)}</g>${G_(matStr(m), certFace({ atk }))}</g>`;
  }
  s += `<defs><clipPath id="${p}-tc"><polygon points="${pts(clip)}"/></clipPath></defs><g clip-path="url(#${p}-tc)" id="${p}-tickets" data-n="${nt}">${tk}</g>`;
  const anchors = {
    top: at(o, 0, 0, zT + 70), center: at(o, 0, 0, zT / 2), ground: at(o), counter: applyM(mF, W / 2, wy + wh / 2), slot: at(o, 0, v1, zs),
    shelf: at(o, 0, v1 + 22, zsh + 6), coin: applyM(mF, W - 21, zT - 37), lamp: lp, led: p + "-led",
  };
  return { svg: shell(p, o, opts, { solid: `<g id="${p}-ctr" data-n="${nd}" data-v="${val}">${s}</g>`, wire: [[u0, u1, v0, v1, 0, zT + 8], [-38, 38, v1, shv1, zsh - 4, zsh + 6]], center: anchors.center, badgeR: 26, glowR: 130, k: K }), anchors: scaleAnchors(o, K, anchors) };
}

// =====================================================================================
// 份额凭证 shareCert — 60×36 小卡片：米白卡面、青蓝边框、左圆形徽记（饼图一角）、右"份额"
// opts: stand=false（立在小卡座上）, n=1（成叠张数；平放时错落叠起，立放时前后排）, scale=1, z=0（离地高度，可放在别的物件上）,
//       ghost=false（虚拟份额：半透明青蓝 + 虚线描边，无厚度无阴影）, state:"attacker"（红边红徽记）, text="份额"
// 可动：整件用 KITX06.carry；成叠时每张 ID-c-k 也可单独 carry
// anchors: top, center, ground
// =====================================================================================
export function shareCert(o, opts = {}) {
  const p = opts.id ?? "sc", atk = isAtk(opts), ghost = !!opts.ghost, k = opts.scale ?? 1, n = opts.n ?? 1, z = opts.z ?? 0;
  const W = 60 * k, H = 36 * k, face = certFace({ atk, ghost, text: opts.text });
  let s = ghost || z > 4 ? "" : contactShadow(o, W * 0.95, opts.stand ? W * 0.4 : H * 1.2);
  let topZ;
  if (opts.stand) {
    const hz = 7 * k;
    s += box(o, -W * 0.36, W * 0.36, -6 * k - (n - 1) * 5 * k, 6 * k, z, z + hz, ghost ? { f: "rgba(42,163,201,0.15)", s: "rgba(42,163,201,0.2)", t: "rgba(42,163,201,0.1)", st: "rgba(42,163,201,0.6)" } : M.ink, 1.2);
    for (let i = n - 1; i >= 0; i--) {
      const dv = -i * 5 * k, m = frameV(o, -W / 2, dv, z + hz - 3 * k + H);
      let c = "";
      if (!ghost) for (let j = 3; j >= 1; j--) c += `<g transform="translate(${f(-j * 0.6 * V[0])},${f(-j * 0.6 * V[1])})">${G_(matStr(m) + ` scale(${k})`, `<rect x="0" y="0" width="60" height="36" rx="3" fill="#ddd6c9"/>`)}</g>`;
      s += `<g id="${p}-c-${i}">${c}${G_(matStr(m) + ` scale(${k})`, face)}</g>`;
    }
    topZ = z + H + 10 * k;
  } else {
    const jit = [[0, 0, 0], [3, -2.5, 7], [-2.5, 1.5, -5], [1.5, 3, 4], [-3, -1.5, -7], [2.5, 2, 5]];
    for (let i = 0; i < n; i++) {
      const [du, dv, rot] = jit[i % jit.length], zz = z + 1.6 * k + i * 3.2 * k;
      const m = frameTop(o, du * k, dv * k, zz), tr = `${matStr(m)} rotate(${rot}) translate(${-W / 2} ${-H / 2}) scale(${k})`;
      let c = ghost ? "" : `<g transform="translate(0,${f(1.6 * k * CE)})">${G_(tr, `<rect x="0" y="0" width="60" height="36" rx="3" fill="#ddd6c9"/>`)}</g>`;
      s += `<g id="${p}-c-${i}">${c}${G_(tr, face)}</g>`;
    }
    topZ = z + n * 3.2 * k;
  }
  const anchors = { top: at(o, 0, 0, topZ + 30), center: at(o, 0, 0, opts.stand ? z + H / 2 + 6 * k : topZ), ground: at(o, 0, 0, z) };
  const wire = opts.stand ? [[-W / 2, W / 2, -3, 0, z, z + H + 7 * k]] : [[-W / 2, W / 2, -H / 2, H / 2, z, topZ]];
  return { svg: shell(p, o, opts, { solid: ghost ? `<g opacity="0.92">${s}</g>` : s, wire, center: anchors.center, badgeR: 16, glowR: W * 1.1 }), anchors };
}

// =====================================================================================
// 披萨 pizza — 打开的纸盒（盒盖在后侧立起，前挡板放平）+ 盒里一块带柄的圆木板 + 整张披萨，切成 slices 块
// opts: slices=8（1 = 整张只切成 1 块）, box=true, rot=-22.5（第一刀的角度）, pulled={i: dist}（某块一开始就被拉出 dist）
// 可动：ID-s-i（每一块，KITX06.serve 沿自身方向拉出 / 推回；KITX06.carry 任意移动）
// anchors: top, center, ground, pizza（披萨中心顶面）, slices[]（各块中心）, lid（盒盖中心）, board
// 比喻专用：场景里挂灰标签"比喻"
// =====================================================================================
export function pizza(o, opts = {}) {
  const K = opts.scale ?? 1, p = opts.id ?? "pz", n = Math.max(1, opts.slices ?? 8), B = 118, R = 88, zB = 4, zP0 = 12, zP1 = 20;
  const kraft = { f: "#d8b583", s: "#c29a63", t: "#e6c99d", st: "#8a6a3c" }, ink = "#6a4a24";
  const withBox = opts.box !== false;
  let s = contactShadow(o, 200, 170, 0, 20);
  if (withBox) {
    // lid standing at the back edge, inside face toward +v
    s += box(o, -B, B, -B - 5, -B, zB, zB + 2 * B, kraft, 1.6);
    s += G_(faceV(o, -B, -B, zB + 2 * B), `<rect x="8" y="8" width="${2 * B - 16}" height="${2 * B - 16}" rx="4" fill="#e9d3ad" stroke="#c9a874" stroke-width="1.4"/>
      <circle cx="${B}" cy="${B - 8}" r="60" fill="none" stroke="${ink}" stroke-width="4" opacity="0.55"/><circle cx="${B}" cy="${B - 8}" r="52" fill="none" stroke="${ink}" stroke-width="1.4" opacity="0.5"/>
      <path d="M${B} ${B - 50}L${B - 30} ${B + 22}Q${B} ${B + 34} ${B + 30} ${B + 22}Z" fill="none" stroke="${ink}" stroke-width="3" stroke-linejoin="round" opacity="0.55"/>
      <circle cx="${B - 6}" cy="${B - 4}" r="5" fill="${ink}" opacity="0.45"/><circle cx="${B + 9}" cy="${B + 12}" r="4" fill="${ink}" opacity="0.45"/><circle cx="${B + 2}" cy="${B - 24}" r="3.5" fill="${ink}" opacity="0.45"/>` +
      txt(B, B + 80, "PIZZA", { size: 26, anchor: "middle", fill: ink, extra: `opacity="0.6" letter-spacing="6"` }) +
      `<path d="M8 8L${2 * B - 8} 8" stroke="#b8925c" stroke-width="3"/>`);
    // floor, far (+u) wall, front flap folded flat
    s += box(o, -B, B, -B, B, 0, zB, kraft, 1.6);
    s += flat(o, [[-B + 4, -B + 4], [B - 4, -B + 4], [B - 4, B - 4], [-B + 4, B - 4]], zB, "#ecd8b4");
    s += box(o, B - 4, B, -B, B, zB, 26, kraft, 1.4);
    s += box(o, -B, B, B, B + 46, 0, 2, kraft, 1.4);
    s += G_(faceTop(o, -B, B, 2), `<path d="M14 10H${2 * B - 14}M14 36H${2 * B - 14}" stroke="#b8925c" stroke-width="1.4" stroke-dasharray="6 5"/>`);
  }
  // wooden board + handle toward +v
  const wood = M.wood;
  s += cyl(o, 0, 0, 100, zB, zB + 8, wood, { seg: 56, sw: 1.6 });
  s += G_(faceTop(o, 0, 0, zB + 8), `<path d="M-80 -30Q-20 -40 70 -20M-88 10Q0 0 86 18M-70 46Q0 38 64 58M-50 -66Q0 -74 48 -64" fill="none" stroke="${darken(wood.t, 0.12)}" stroke-width="1.6"/>`);
  s += rbox(o, -22, 22, 86, 170, zB, zB + 8, 10, wood, { sw: 1.6 });
  s += G_(faceTop(o, 0, 152, zB + 8), `<ellipse cx="0" cy="0" rx="8" ry="8" fill="${darken(wood.s, 0.45)}"/><path d="M-14 -40V-14M14 -40V-14" stroke="${darken(wood.t, 0.12)}" stroke-width="1.4"/>`);
  // pizza slices
  const rot = opts.rot ?? -22.5, gap = n > 1 ? 2.6 : 0, crust = { f: "#d9a05b", s: "#b97f3e", t: "#e8bb7a", st: "#8a5523" };
  const tops = [ // [r, angle°, kind]  kind: o olive, b basil, m mushroom, t toast
    [30, 10, "o"], [58, 34, "m"], [70, 70, "o"], [40, 95, "b"], [62, 128, "t"], [26, 150, "m"], [70, 170, "o"], [46, 200, "b"], [66, 222, "m"],
    [32, 248, "o"], [64, 268, "t"], [50, 296, "o"], [72, 318, "b"], [36, 338, "m"], [14, 300, "t"], [52, 4, "b"], [18, 60, "t"], [74, 102, "t"], [16, 200, "o"],
  ];
  const sl = [];
  for (let i = 0; i < n; i++) {
    const a0 = rot + (i * 360) / n, a1 = rot + ((i + 1) * 360) / n, am = (a0 + a1) / 2;
    const bu = Math.cos(am * DEG), bvv = Math.sin(am * DEG), gu = n > 1 ? gap * bu : 0, gv = n > 1 ? gap * bvv : 0;
    const steps = Math.max(4, Math.round((a1 - a0) / 6));
    const arc = (r) => Array.from({ length: steps + 1 }, (_, j) => { const a = (a0 + ((a1 - a0) * j) / steps) * DEG; return [gu + r * Math.cos(a), gv + r * Math.sin(a)]; });
    const plan = n > 1 ? [[gu, gv], ...arc(R)] : circlePlan(0, 0, R, 56);
    let g = loft(o, plan, plan, zP0, zP1, crust, { sw: 1.4, topFill: "#f2c66d" });
    // top: crust rim band + toppings, clipped to the slice
    const inner = n > 1 ? [[gu, gv], ...arc(R - 11)] : circlePlan(0, 0, R - 11, 56);
    const cid = `${p}-sc-${i}`;
    let tp = `<defs><clipPath id="${cid}"><polygon points="${plan.map((q) => `${f(q[0])},${f(q[1])}`).join(" ")}"/></clipPath></defs><g clip-path="url(#${cid})">`;
    tp += `<polygon points="${plan.map((q) => `${f(q[0])},${f(q[1])}`).join(" ")}" fill="#e2a85e"/><polygon points="${inner.map((q) => `${f(q[0])},${f(q[1])}`).join(" ")}" fill="#f4c96a"/>`;
    tp += `<polygon points="${inner.map((q) => `${f(q[0])},${f(q[1])}`).join(" ")}" fill="none" stroke="#f9dc8c" stroke-width="3" opacity="0.7"/>`;
    for (const [r, a, kd] of tops) {
      const x = gu + r * Math.cos(a * DEG), y = gv + r * Math.sin(a * DEG);
      if (kd === "o") tp += `<circle cx="${f(x)}" cy="${f(y)}" r="5.2" fill="#2b2d31"/><circle cx="${f(x)}" cy="${f(y)}" r="2" fill="#f4c96a"/>`;
      else if (kd === "b") tp += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="8" ry="4.2" transform="rotate(${a + 30} ${f(x)} ${f(y)})" fill="#3f9a4e"/><path d="M${f(x - 6)} ${f(y)}H${f(x + 6)}" transform="rotate(${a + 30} ${f(x)} ${f(y)})" stroke="#8fd19b" stroke-width="1"/>`;
      else if (kd === "m") tp += `<path d="M${f(x - 7)} ${f(y + 1)}A7 6 0 0 1 ${f(x + 7)} ${f(y + 1)}Z" fill="#efe2c8" stroke="#a88e64" stroke-width="1"/><rect x="${f(x - 2)}" y="${f(y + 1)}" width="4" height="5" fill="#e6d6b4"/>`;
      else tp += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="7" ry="5" fill="#d99a3e" opacity="0.55"/>`;
    }
    tp += `</g>`;
    g += G_(faceTop(o, 0, 0, zP1), tp);
    const d1 = sv(bu, bvv), pull = opts.pulled?.[i] ?? 0;
    const cen = at(o, gu + R * 0.55 * bu, gv + R * 0.55 * bvv, zP1);
    sl.push({ i, key: -(gu + R * 0.5 * bu) * SA * SE + (gv + R * 0.5 * bvv) * CA * SE,
      svg: `<g id="${p}-s-${i}" data-du="${f4(d1[0])}" data-dv="${f4(d1[1])}" data-pull="${pull}"${pull ? ` transform="translate(${f(d1[0] * pull)},${f(d1[1] * pull)})"` : ""}>${g}</g>`, cen });
  }
  s += sl.slice().sort((a, b) => a.key - b.key).map((q) => q.svg).join("");
  // near (−u) wall over the pizza edge
  if (withBox) s += box(o, -B, -B + 4, -B, B, zB, 26, kraft, 1.4);
  const anchors = {
    top: at(o, 0, withBox ? -B : 0, withBox ? zB + 2 * B + 40 : 80), center: at(o, 0, 0, zP1), pizza: at(o, 0, 0, zP1), ground: at(o),
    slices: sl.map((q) => q.cen), lid: at(o, 0, -B, zB + B), board: at(o, 0, 130, zB + 8),
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-B, B, -B, B, 0, 26], [-B, B, -B - 5, -B, zB, zB + 2 * B]], center: anchors.center, glowR: 200, k: K }), anchors: scaleAnchors(o, K, anchors) };
}

// =====================================================================================
// 死地址投递箱 burnBox — 焊死的钢制投递箱（约 150×120×190）：顶上只有一个投入口；没有门、没有锁孔，
// 正面原来门的位置一圈焊缝，原锁孔位置被一块圆钢片焊死；正面黑铭牌"死地址"。
// opts: plate="死地址", sub="0x…dEaD", cards=1（预置可投入的凭证张数）, loaded=false（第 0 张一开始就悬在投入口上方）
// 可动：ID-card-i（KITX06.burn 投入：出现在投入口上方 → 落进去消失）
// anchors: top, center, ground, slot（投入口）, plate（铭牌中心）, card（卡片悬停位置）
// =====================================================================================
export function burnBox(o, opts = {}) {
  const p = opts.id ?? "bb6", atk = isAtk(opts), K = opts.scale ?? 1;
  const u0 = -75, u1 = 75, v0 = -60, v1 = 60, zb = 10, zT = 172, zS = 184;
  const body = atk ? mat("#c9463c") : { f: "#6b7078", s: "#50555c", t: "#848991", st: "#24272b" };
  let s = contactShadow(o, 150, 120);
  // base plate with anchor bolts
  s += box(o, u0 - 18, u1 + 18, v0 - 16, v1 + 16, 0, zb, M.steel, 1.4);
  for (const [a, b] of [[u0 - 9, v0 - 7], [u1 + 9, v0 - 7], [u0 - 9, v1 + 7], [u1 + 9, v1 + 7]]) s += cyl(o, a, b, 5, zb, zb + 5, M.chrome, { seg: 6, sw: 1 });
  s += rbox(o, u0, u1, v0, v1, zb, zT, 6, body, { sw: 2 });
  s += rbox(o, u0 - 5, u1 + 5, v0 - 5, v1 + 5, zT, zT + 6, 6, { ...body, f: lighten(body.f, 0.1), t: lighten(body.t, 0.08) }, { sw: 1.6 });
  // slot housing on top
  s += box(o, -50, 50, -16, 16, zT + 6, zS, M.steelLight, 1.4);
  s += flat(o, [[-42, -5], [42, -5], [42, 5], [-42, 5]], zS, "#0e0f11", "#3b3e44", 1.2);
  // weld bead helper (in a face frame, along a polyline)
  const bead = (ptsL, step = 5.2, r = 2.8) => {
    let g = "";
    for (let k = 0; k < ptsL.length - 1; k++) {
      const [x0, y0] = ptsL[k], [x1, y1] = ptsL[k + 1], L = Math.hypot(x1 - x0, y1 - y0), m = Math.max(1, Math.round(L / step));
      for (let j = 0; j < m; j++) {
        const x = x0 + ((x1 - x0) * j) / m, y = y0 + ((y1 - y0) * j) / m;
        g += `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="#a3a8af" stroke="#3b3e44" stroke-width="0.7"/><path d="M${f(x - 1.8)} ${f(y - 0.6)}A2 2 0 0 1 ${f(x + 1.2)} ${f(y - 1.6)}" stroke="#e1e4e7" stroke-width="1" fill="none"/>`;
      }
    }
    return g;
  };
  // −u face: seam beads along the vertical corner + stencil arrow
  const mU = frameU(o, u0, v0, zT), Dd = v1 - v0, Hh = zT - zb;
  s += G_(matStr(mU), `<rect x="10" y="12" width="${Dd - 20}" height="${Hh - 24}" rx="4" fill="none" stroke="${darken(body.f, 0.18)}" stroke-width="1.6"/>` +
    bead([[Dd / 2, 14], [Dd / 2, Hh - 14]], 5.4, 2.4) +
    `<path d="M${Dd / 2 - 22} 40L${Dd / 2 - 22} 60M${Dd / 2 - 28} 54L${Dd / 2 - 22} 62L${Dd / 2 - 16} 54" stroke="${lighten(body.f, 0.3)}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  // front face: welded-shut door outline, welded keyhole patch, nameplate
  const mF = frameV(o, u0, v1, zT), Ww = u1 - u0;
  let ff = `<rect x="18" y="20" width="${Ww - 36}" height="${Hh - 34}" rx="3" fill="none" stroke="${darken(body.s, 0.4)}" stroke-width="2.4"/>`;
  ff += bead([[18, 20], [Ww - 18, 20], [Ww - 18, Hh - 14], [18, Hh - 14], [18, 20]]);
  // old hinge stubs, ground flush
  for (const y of [40, Hh - 40]) ff += `<rect x="${Ww - 22}" y="${y - 10}" width="8" height="20" rx="2" fill="${darken(body.s, 0.12)}" stroke="${body.st}" stroke-width="1"/>`;
  // keyhole patch (welded disc)
  const kx = 36, ky = Hh * 0.62;
  ff += `<circle cx="${kx}" cy="${ky}" r="11" fill="${lighten(body.s, 0.12)}" stroke="${body.st}" stroke-width="1.2"/>` +
    Array.from({ length: 14 }, (_, j) => { const a = (j / 14) * 2 * Math.PI; return `<circle cx="${f(kx + 12.5 * Math.cos(a))}" cy="${f(ky + 12.5 * Math.sin(a))}" r="2.3" fill="#a3a8af" stroke="#3b3e44" stroke-width="0.6"/>`; }).join("");
  // nameplate
  const plate = opts.plate ?? "死地址", sub = opts.sub ?? "0x…dEaD", pw = 96, px = (Ww - pw) / 2, py = 34;
  ff += `<rect x="${px + 2}" y="${py + 3}" width="${pw}" height="50" rx="4" fill="rgba(0,0,0,0.25)"/><rect x="${px}" y="${py}" width="${pw}" height="50" rx="4" fill="#1c1d20" stroke="#c9cdd2" stroke-width="1.8"/>` +
    txt(Ww / 2, py + 27, plate, { size: 21, anchor: "middle", fill: "#ffffff" }) + txt(Ww / 2, py + 43, sub, { size: 9.5, mono: true, anchor: "middle", fill: "#9aa0a8", weight: 700 }) +
    [[px + 6, py + 6], [px + pw - 6, py + 6], [px + 6, py + 44], [px + pw - 6, py + 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#9aa0a8"/>`).join("");
  ff += `<rect x="${Ww / 2 - 34}" y="${Hh - 46}" width="68" height="18" rx="3" fill="${darken(body.s, 0.25)}"/>` + txt(Ww / 2, Hh - 33, "NO EXIT", { size: 10, mono: true, anchor: "middle", fill: lighten(body.s, 0.35), weight: 800, extra: `letter-spacing="2"` });
  s += G_(matStr(mF), ff);
  // front vertical corner bead (3D)
  s += G_(faceV(o, u0, v1, zT), bead([[1, 10], [1, Hh - 6]], 6, 2.2));
  // cards (standing, above the slot) — clipped to the space above the slot line
  const nc = opts.cards ?? 1, zc = zS + 14;
  const clip = [at(o, -600, 0, zS), at(o, 600, 0, zS), at(o, 600, 0, zS + 900), at(o, -600, 0, zS + 900)];
  let cs = "";
  for (let k = 0; k < nc; k++) {
    const m = frameV(o, -30, 0, zc + 36), drop = sv(0, 0, -(36 + 24));
    cs += `<g id="${p}-card-${k}" opacity="${k === 0 && opts.loaded ? 1 : 0}" data-dx="${f(drop[0])}" data-dy="${f(drop[1])}">${G_(matStr(m), certFace({ atk: opts.cardAtk }))}</g>`;
  }
  s += `<defs><clipPath id="${p}-cc"><polygon points="${pts(clip)}"/></clipPath></defs><g clip-path="url(#${p}-cc)">${cs}</g>`;
  // slot lip in front of the slit (static)
  s += `<g id="${p}-flap">${G_(faceV(o, -42, 6, zS + 6), `<rect x="0" y="0" width="84" height="6" rx="2" fill="#d4d7db" stroke="#5a5e65" stroke-width="1.2"/><rect x="2" y="1" width="80" height="1.6" fill="#f4f5f6"/>`)}</g>`;
  const anchors = { top: at(o, 0, 0, zS + 90), center: at(o, 0, 0, zT / 2), ground: at(o), slot: at(o, 0, 0, zS), plate: applyM(mF, Ww / 2, py + 25), card: at(o, 0, 0, zc + 18) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0, u1, v0, v1, zb, zT + 6], [-50, 50, -16, 16, zT + 6, zS], [u0 - 18, u1 + 18, v0 - 16, v1 + 16, 0, zb]], center: anchors.center, glowR: 160, k: K }), anchors: scaleAnchors(o, K, anchors) };
}

export const CATALOG_EXT = { roundCutter, decimalRuler, shareDispenser, shareCert, pizza, burnBox };
/** runtime-ext.js contents — inline after iso.runtimeJs() */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
