// props.mjs — seg4 自补拟物件（与 kit 同一投影；只在本段用）
import { at, f, pts, box, rbox, cyl, frustum, M, C, mat, darken, lighten, faceV, faceU, faceTop, contactShadow } from "../../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
export const wrap = (id, o, inner, extra = "") => { const [ox, oy] = at(o); return `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}" ${extra}>${inner}</g>`; };

/** flat gold coin (ETH) lying on the ground or at height z */
export function coin(o, { id, z = 0, r = 26, op = 1 } = {}) {
  let s = cyl(o, 0, 0, r, z, z + 8, M.gold, { sw: 1.4 });
  s += `<g transform="${faceTop(o, 0, 0, z + 8)}"><circle r="${r * 0.62}" fill="none" stroke="#a87612" stroke-width="2"/>
    <path d="M0 ${-r * 0.42}L${r * 0.26} 0L0 ${r * 0.42}L${-r * 0.26} 0Z" fill="#a87612" opacity="0.8"/></g>`;
  return { svg: wrap(id, o, s, `opacity="${op}"`), anchors: { top: at(o, 0, 0, z + 40), c: at(o, 0, 0, z + 4) } };
}

/** glass savings jar with coins stacked inside (ids id-c0..), first `n0` visible */
export function jar(o, { id, n = 7, n0 = 0 } = {}) {
  const R = 66, H = 176;
  let s = contactShadow(o, 110, 70);
  s += cyl(o, 0, 0, R + 10, 0, 14, M.ink, { sw: 1.4 });
  for (let i = 0; i < n; i++) {
    const z = 16 + i * 11;
    s += `<g id="${id}-c${i}" opacity="${i < n0 ? 1 : 0}">${cyl(o, (i % 2) * 4 - 2, ((i * 3) % 3) * 3 - 3, 46, z, z + 9, M.gold, { sw: 1.2 })}</g>`;
  }
  s += cyl(o, 0, 0, R, 14, H, M.glass, { sw: 2 });
  s += `<path d="M${pts([at(o, -R * 0.5, R * 0.75, 40)])}L${pts([at(o, -R * 0.5, R * 0.75, H - 20)])}" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.7"/>`;
  s += cyl(o, 0, 0, R + 6, H, H + 12, M.steelLight, { sw: 1.4 });
  s += `<g transform="${faceTop(o, 0, 0, H + 12)}"><rect x="-26" y="-5" width="52" height="10" rx="4" fill="#25282c"/></g>`;
  return { svg: wrap(id, o, s), anchors: { top: at(o, 0, 0, H + 80), mouth: at(o, 0, 0, H + 12), mid: at(o, 0, 0, H / 2), ground: at(o) } };
}

/** pedestal with a big red push button (id-btn moves down) */
export function button(o, { id } = {}) {
  let s = contactShadow(o, 70, 50);
  s += box(o, -44, 44, -44, 44, 0, 14, M.ink, 1.4);
  s += box(o, -32, 32, -32, 32, 14, 104, M.white, 1.6);
  s += `<g transform="${faceV(o, -32, 32, 90)}"><rect x="10" y="8" width="44" height="22" rx="3" fill="#e0453a"/><path d="M14 13L50 25M50 13L14 25" stroke="#ffffff" stroke-width="2"/></g>`;
  s += cyl(o, 0, 0, 30, 104, 110, M.ink, { sw: 1.2 });
  s += `<g id="${id}-btn">${cyl(o, 0, 0, 24, 110, 128, M.red, { sw: 1.4 })}</g>`;
  return { svg: wrap(id, o, s), anchors: { top: at(o, 0, 0, 190), btn: at(o, 0, 0, 128) } };
}

/** odometer-style counter: front display shows one of several states (id-s0..) */
export function counter(o, { id, states } = {}) {
  const u0 = -110, u1 = 110, v0 = -50, v1 = 50, H = 170;
  let s = contactShadow(o, 150, 80);
  s += box(o, u0 - 8, u1 + 8, v0 - 8, v1 + 8, 0, 14, M.ink, 1.4);
  s += rbox(o, u0, u1, v0, v1, 14, H, 10, M.white, { sw: 2 });
  let face = `<rect x="20" y="22" width="180" height="84" rx="8" fill="#14262d" stroke="#5d636b" stroke-width="3"/>`;
  states.forEach((st, i) => {
    face += `<g id="${id}-s${i}" opacity="${i === 0 ? 1 : 0}">${st.bg ? `<rect x="22" y="24" width="176" height="80" rx="7" fill="${st.bg}"/>` : ""}<text x="110" y="${80}" text-anchor="middle" ${MONO} font-size="${st.size ?? 44}" font-weight="800" fill="${st.fill ?? "#9ad9ee"}">${st.text}</text></g>`;
  });
  face += `<rect x="30" y="120" width="160" height="12" rx="6" fill="#d3d9de"/>`;
  s += `<g transform="${faceV(o, u0, v1, H - 6)}">${face}</g>`;
  // roller wheels on the −u side
  s += `<g transform="${faceU(o, u0, v0, H - 30)}"><circle cx="50" cy="50" r="30" fill="#c9ced4" stroke="#5d636b" stroke-width="3"/><circle cx="50" cy="50" r="8" fill="#5d636b"/></g>`;
  return { svg: wrap(id, o, s), anchors: { top: at(o, 0, 0, H + 60), face: at(o, 0, v1, H - 70), ground: at(o) } };
}

/** small archway (a code path): two posts + lintel + an unlit lamp */
export function arch(o, { id } = {}) {
  let s = contactShadow(o, 80, 50);
  for (const v of [-56, 56]) { s += box(o, -14, 14, v - 12, v + 12, 0, 8, M.ink, 1.2); s += box(o, -9, 9, v - 8, v + 8, 8, 150, M.steelLight, 1.4); }
  s += box(o, -16, 16, -76, 76, 150, 172, M.white, 1.6);
  s += cyl(o, 0, 0, 16, 172, 180, M.ink, { sw: 1.2 });
  s += `<g id="${id}-lamp">${frustum(o, 0, 0, 13, 9, 180, 204, { f: "#c7c9cc", s: "#a9adb2", t: "#e0e2e4", st: "#6e747c" }, { sw: 1.2 })}</g>`;
  return { svg: wrap(id, o, s), anchors: { top: at(o, 0, 0, 240), mid: at(o, 0, 0, 40), ground: at(o) } };
}

/** small number token (a cube) */
export const token = (o, { id, m = M.blue, z = 0 } = {}) => wrap(id, o, rbox(o, -16, 16, -16, 16, z, z + 32, 5, m, { sw: 1.4 }));

/** thin block slab on a time axis */
export const slab = (o, { id, op = 1 } = {}) => wrap(id, o, rbox(o, -14, 14, -36, 36, 0, 72, 5, M.blue, { sw: 1.4 }) +
  `<path d="M${pts([at(o, -14, -20, 52)])}L${pts([at(o, -14, 20, 52)])}M${pts([at(o, -14, -20, 38)])}L${pts([at(o, -14, 10, 38)])}" stroke="#ffffff" stroke-width="3" opacity="0.8"/>`, `opacity="${op}"`);

/** time-axis strip on the ground (u from u0 to u1) */
export function strip(o, { id, u0, u1 } = {}) {
  let s = box(o, u0, u1, -54, 54, 0, 6, M.white, 1.4);
  let ticks = "";
  for (let u = u0 + 20; u < u1; u += 40) ticks += `M${pts([at(o, u, 46, 6)])}L${pts([at(o, u, 54, 6)])}`;
  s += `<path d="${ticks}" stroke="#b8b0a1" stroke-width="2"/>`;
  s += `<path d="M${pts([at(o, u1 - 10, -24, 6)])}L${pts([at(o, u1 + 34, 0, 6)])}L${pts([at(o, u1 - 10, 24, 6)])}Z" fill="#b8b0a1"/>`;
  return wrap(id, o, s);
}

/** lock panel: a steel door post whose −u face carries a keyhole plate + status LED (id-led) */
export function lockPanel(o, { id } = {}) {
  const T = 44, Wv = 130, H = 300, zk = 130;
  let s = contactShadow(o, 90, 120);
  s += box(o, -6, T + 6, -Wv - 6, Wv + 6, 0, 14, M.ink, 1.4);
  s += box(o, 0, T, -Wv, Wv, 14, H, M.steel, 2);
  // door seam on the +v face + handle
  s += `<g transform="${faceU(o, 0, -Wv, H)}">
    <rect x="16" y="16" width="${2 * Wv - 32}" height="${H - 46}" rx="6" fill="none" stroke="#4b4f56" stroke-width="3"/>
    <circle cx="${Wv}" cy="${H - zk}" r="40" fill="#d6a64a" stroke="#7a5716" stroke-width="3"/>
    <circle cx="${Wv}" cy="${H - zk}" r="30" fill="none" stroke="#ecc778" stroke-width="3"/>
    <rect x="${Wv - 22}" y="${H - zk - 5}" width="44" height="10" rx="5" fill="#25282c"/>
    <circle id="${id}-led-h" cx="${Wv}" cy="${H - 250}" r="18" fill="#3c3f45" opacity="0"/>
    <circle id="${id}-led" cx="${Wv}" cy="${H - 250}" r="10" fill="#3c3f45" stroke="rgba(0,0,0,0.35)" stroke-width="1"/></g>`;
  s += box(o, -4, T + 4, -Wv - 4, Wv + 4, H, H + 12, M.steelLight, 1.4);
  return { svg: wrap(id, o, s), anchors: { top: at(o, T / 2, 0, H + 70), hole: at(o, 0, 0, zk), ground: at(o) } };
}

/** a sheet of paper standing slightly tilted — the memory copy (id-body) */
export function sheet(o, { id, title = "副本" } = {}) {
  let s = contactShadow(o, 70, 40);
  s += `<g transform="${faceV(o, -60, 0, 160)}"><g transform="skewY(0)"><rect x="0" y="0" width="120" height="150" rx="4" fill="#fffdf8" stroke="#b8b0a1" stroke-width="2"/>
    <path d="M96 0V24H120" fill="#ebe6dc" stroke="#b8b0a1" stroke-width="2"/>
    <text x="14" y="34" ${FONT} font-size="22" font-weight="900" fill="#1c1c1c">${title}</text>
    <path d="M14 60H104M14 82H104M14 104H80" stroke="#cfc7b8" stroke-width="5" stroke-linecap="round"/></g></g>`;
  return { svg: wrap(id, o, s), anchors: { top: at(o, 0, 0, 230), mid: at(o, 0, 0, 90) } };
}

export { C, mat, darken, lighten };
