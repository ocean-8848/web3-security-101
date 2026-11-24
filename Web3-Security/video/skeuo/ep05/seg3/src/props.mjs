// props.mjs — ep05/seg3 自补的小拟物件（与 kit 同一投影，只在本段用）
import { at, f, box, rbox, cyl, M, mat, faceTop, faceV, faceU, contactShadow, line3, CE, darken } from "../../../kit/iso.mjs";

export const wrap = (id, o, inner, extra = "") => { const [ox, oy] = at(o); return `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}" ${extra}>${inner}</g>`; };
export const lift = (svg, z) => `<g transform="translate(0,${f(-z * CE)})">${svg}</g>`;
const T = (x, y, s, size, o = {}) => `<text x="${x}" y="${y}" font-family="${o.mono ? "JetBrains Mono" : "Noto Sans SC"}" font-size="${size}" font-weight="${o.w ?? 800}" fill="${o.fill ?? "#1c1c1c"}" text-anchor="${o.anchor ?? "middle"}">${s}</text>`;

/** flat coin at height z */
export function coin(o, { id, z = 0, r = 16, op = 1, red = false } = {}) {
  const m = red ? { f: "#e8574c", s: "#c23a30", t: "#f6a59d", st: "#8f2620" } : M.gold;
  let s = cyl(o, 0, 0, r, z, z + 6, m, { sw: 1.3 });
  s += `<g transform="${faceTop(o, 0, 0, z + 6)}"><circle r="${r * 0.62}" fill="none" stroke="${red ? "#8f2620" : "#a87612"}" stroke-width="1.6"/></g>`;
  return { svg: wrap(id, o, s, `opacity="${op}"`), anchors: { c: at(o, 0, 0, z + 3) } };
}

/** gold bar (ETH stand-in) at height z */
export function goldBar(o, { id, z = 0, op = 1 } = {}) {
  let s = box(o, -26, 26, -12, 12, z, z + 14, M.gold, 1.3);
  s += `<g transform="${faceTop(o, -20, -7, z + 14)}"><rect x="0" y="0" width="40" height="14" rx="2" fill="none" stroke="#a87612" stroke-width="1.2"/></g>`;
  return { svg: wrap(id, o, s, `opacity="${op}"`), anchors: { c: at(o, 0, 0, z + 7) } };
}

/** letter slot post: steel post with a mail head; slot on the +v face */
export function slotPost(o, { id } = {}) {
  let s = contactShadow(o, 70, 50);
  s += rbox(o, -34, 34, -26, 26, 0, 10, 6, M.ink, { sw: 1.3 });
  s += box(o, -12, 12, -10, 10, 10, 96, M.steelLight, 1.3);
  s += rbox(o, -46, 46, -34, 34, 96, 176, 8, M.steel, { sw: 1.6 });
  s += rbox(o, -50, 50, -38, 38, 176, 184, 6, M.ink, { sw: 1.3 });
  s += `<g transform="${faceV(o, -46, 34, 176)}"><rect x="12" y="18" width="68" height="12" rx="5" fill="#1b1d21" stroke="#9aa0a8" stroke-width="2"/>
    <rect id="${id}-glow" x="10" y="16" width="72" height="16" rx="7" fill="none" stroke="#2aa3c9" stroke-width="4" opacity="0"/>
    <rect x="16" y="44" width="60" height="22" rx="4" fill="#d9dcdf" stroke="#7d828a" stroke-width="1.4"/>${T(46, 61, "DATA", 15, { mono: true, fill: "#2b2d31" })}</g>`;
  return { svg: wrap(id, o, `<g id="${id}-solid">${s}</g>`), anchors: { slot: at(o, 0, 34, 152), top: at(o, 0, 0, 250), ground: at(o) } };
}

/** ecrecover box: off-white machine, top slot (signature in), front chute (address card out) */
export function recoverBox(o, { id } = {}) {
  const body = { f: "#eef1f3", s: "#d3d9de", t: "#f8f9fa", st: "#7f8b95" };
  let s = contactShadow(o, 120, 90);
  s += rbox(o, -78, 78, -62, 62, 0, 12, 8, M.ink, { sw: 1.3 });
  s += rbox(o, -70, 70, -55, 55, 12, 150, 10, body, { sw: 1.8 });
  s += `<g transform="${faceTop(o, -40, -8, 150)}"><rect x="0" y="0" width="80" height="16" rx="6" fill="#1b1d21" stroke="#7f8b95" stroke-width="2"/></g>`;
  s += `<g transform="${faceV(o, -70, 55, 150)}"><rect x="14" y="14" width="112" height="30" rx="5" fill="#1d93ba"/>${T(70, 36, "ecrecover", 17, { mono: true, fill: "#ffffff" })}
    <rect x="30" y="74" width="80" height="34" rx="5" fill="#2b2e33" stroke="#7f8b95" stroke-width="2"/><circle id="${id}-led" cx="122" cy="60" r="6" fill="#9aa0a8" stroke="#3b3e44" stroke-width="1.2"/></g>`;
  s += box(o, -38, 38, 55, 92, 30, 38, M.steelLight, 1.2);
  return { svg: wrap(id, o, `<g id="${id}-solid">${s}</g>`), anchors: { in: at(o, 0, 0, 160), out: at(o, 0, 80, 44), outO: { u: o.u, v: o.v + 80 }, top: at(o, 0, 0, 210), ground: at(o) } };
}

/** paper shredder: dark body, top slot, clear bin in front with shredded strips (ID-strips, hidden) */
export function shredder(o, { id } = {}) {
  let s = contactShadow(o, 100, 80);
  s += rbox(o, -60, 60, -46, 46, 0, 70, 8, mat("#c7ccd2", { st: "#5d636b" }), { sw: 1.6 });
  let strips = "";
  for (let i = 0; i < 9; i++) strips += `<rect x="${12 + i * 10}" y="${18 + (i % 3) * 6}" width="5" height="${34 - (i % 4) * 5}" rx="1" fill="${i % 3 ? "#ffffff" : "#1c1c1c"}" stroke="#9a9488" stroke-width="0.8"/>`;
  s += `<g transform="${faceV(o, -60, 46, 70)}"><rect x="6" y="6" width="108" height="58" rx="5" fill="rgba(208,234,244,0.55)" stroke="#7d828a" stroke-width="1.5"/><g id="${id}-strips" opacity="0">${strips}</g></g>`;
  s += rbox(o, -64, 64, -50, 50, 70, 108, 8, M.ink, { sw: 1.6 });
  s += `<g transform="${faceTop(o, -42, -6, 108)}"><rect x="0" y="0" width="84" height="12" rx="5" fill="#0d0e10" stroke="#5d636b" stroke-width="2"/></g>`;
  s += `<g transform="${faceV(o, -64, 50, 104)}"><rect x="10" y="8" width="44" height="18" rx="4" fill="#3b3e44"/>${T(32, 22, "SHRED", 11, { mono: true, fill: "#d0d4d9" })}<circle cx="104" cy="17" r="6" fill="#e0453a"/></g>`;
  return { svg: wrap(id, o, `<g id="${id}-solid">${s}</g>`), anchors: { in: at(o, 0, 0, 120), top: at(o, 0, 0, 170), ground: at(o) } };
}

/** pending tray ("待接收"): shallow steel tray on a short stand */
export function tray(o, { id } = {}) {
  let s = contactShadow(o, 80, 60);
  s += box(o, -10, 10, -10, 10, 0, 50, M.steelLight, 1.2);
  s += box(o, -56, 56, -42, 42, 50, 56, M.steel, 1.3);
  s += box(o, -56, 56, -42, -36, 56, 66, M.steelLight, 1.1) + box(o, -56, -50, -36, 42, 56, 66, M.steelLight, 1.1);
  s += box(o, -56, 56, 36, 42, 56, 66, M.steelLight, 1.1);
  return { svg: wrap(id, o, `<g id="${id}-solid">${s}</g>`), anchors: { c: at(o, 0, 0, 60), top: at(o, 0, 0, 120), ground: at(o) } };
}

/** grey dust cloud above a point (opacity 0, fade in/out) */
export function smoke(o, { id, z = 220 } = {}) {
  const P = [[0, 0, 0, 70], [-60, 20, 30, 52], [60, -10, 26, 56], [10, 30, 70, 46], [-30, -30, 80, 40]];
  const s = P.map(([du, dv, dz, r], i) => `<g transform="${faceTop(o, du, dv, z + dz)}"><ellipse rx="${r}" ry="${r * 0.8}" fill="${["#b9b4aa", "#a8a397", "#c9c4ba", "#9f9a8f", "#d3cec4"][i]}" opacity="0.85"/></g>`).join("");
  return { svg: wrap(id, o, s, `opacity="0"`), anchors: { top: at(o, 0, 0, z + 140) } };
}

/** grey scaffold frame around a box (contract still under construction) */
export function scaffold(o, { id, u0 = -140, u1 = 140, v0 = -125, v1 = 125, h = 280 } = {}) {
  const c = "#8a8478", P = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
  let s = "";
  for (const [u, v] of P) s += line3(o, [[u, v, 0], [u, v, h]], c, 4);
  for (const z of [10, h / 2, h]) s += line3(o, [...P.map(([u, v]) => [u, v, z]), [u0, v0, z]], c, 3);
  s += line3(o, [[u0, v1, 10], [u1, v1, h / 2]], c, 2.4) + line3(o, [[u0, v1, h / 2], [u1, v1, h]], c, 2.4);
  s += line3(o, [[u0, v0, 10], [u0, v1, h / 2]], c, 2.4) + line3(o, [[u0, v0, h / 2], [u0, v1, h]], c, 2.4);
  return { svg: wrap(id, o, s), anchors: { top: at(o, 0, 0, h + 40) } };
}
