// props.mjs — ep06/seg2 small props in the kit projection (kit / kit-ext untouched).
import { at, f, pts, box, rbox, cyl, frustum, faceTop, faceV, faceU, M, CE, U, V, contactShadow, wirePath } from "../../../kit/iso.mjs";

export const lift = (svg, z) => `<g transform="translate(0,${f(-z * CE)})">${svg}</g>`;
const G_ = (m, inner) => `<g transform="${m}">${inner}</g>`;
const ox = (o) => at(o).map(f).join(" ");

/** steel pedestal (the odometer stands on it) */
export function pedestal(id, o, { w = 330, d = 90, h = 150 } = {}) {
  const steel = { f: "#a9aeb5", s: "#8b9199", t: "#c3c8ce", st: "#4b5058" };
  let s = contactShadow(o, w * 0.6, 70);
  s += rbox(o, -w / 2 - 10, w / 2 + 10, -d / 2 - 10, d / 2 + 10, 0, 10, 6, M.ink, { sw: 1.4 });
  s += rbox(o, -w / 2 + 30, w / 2 - 30, -d / 2 + 8, d / 2 - 8, 10, h - 12, 6, steel, { sw: 1.8 });
  s += rbox(o, -w / 2, w / 2, -d / 2, d / 2, h - 12, h, 6, steel, { sw: 1.8 });
  s += G_(faceV(o, -w / 2 + 30, d / 2 - 8, h - 24), [0, 1, 2, 3].map((i) => `<rect x="${20 + i * 64}" y="20" width="44" height="8" rx="4" fill="#6f757d"/>`).join(""));
  return `<g id="${id}" data-ox="${f(at(o)[0])}" data-oy="${f(at(o)[1])}">${s}</g>`;
}

/** small signal lamp on a stem; dome fill animates via #ID-dome (attr fill) */
export function lamp(id, o, z = 0) {
  let s = cyl(o, 0, 0, 20, z, z + 10, M.ink, { seg: 24, sw: 1.4 }) + cyl(o, 0, 0, 5, z + 10, z + 40, M.steel ?? M.ink, { seg: 16, sw: 1.2 });
  const c = at(o, 0, 0, z + 66);
  s += `<circle id="${id}-halo" cx="${f(c[0])}" cy="${f(c[1])}" r="46" fill="#1f9d55" opacity="0"/>`;
  s += `<circle id="${id}-dome" cx="${f(c[0])}" cy="${f(c[1])}" r="26" fill="#5c6168" stroke="#2b2d31" stroke-width="2"/>`;
  s += `<path d="M${f(c[0] - 9)} ${f(c[1] - 8)}a11 11 0 0 1 9 -6" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8"/>`;
  return `<g id="${id}" data-ox="${f(at(o)[0])}" data-oy="${f(at(o)[1])}">${s}</g>`;
}

/** red outline (solid) around a world box — flash with opacity */
export const redBox = (id, o, part, sw = 5) => `<path id="${id}" d="${wirePath(o, [part])}" fill="rgba(224,69,58,0.10)" stroke="#e0453a" stroke-width="${sw}" stroke-linejoin="round" opacity="0"/>`;

/** a small steel door frame with a half-open teal door (−u hinge), facing +v */
export function smallDoor(id, o, { w = 80, h = 150 } = {}) {
  const fr = { f: "#5d636b", s: "#474c53", t: "#767c84", st: "#25282c" };
  let s = contactShadow(o, 70, 30);
  s += box(o, -w / 2 - 12, w / 2 + 12, -8, 8, 0, 6, M.ink, 1.2);
  s += G_(faceV(o, -w / 2, 0, h), `<rect x="0" y="0" width="${w}" height="${h}" fill="#1d2024"/>`);
  // open door leaf: hinge at u = -w/2, swung 55° toward +v
  const a = 55 * Math.PI / 180, lu = Math.cos(a) * w, lv = Math.sin(a) * w;
  const P = (du, dv, z) => at(o, -w / 2 + du, dv, z);
  s += `<polygon points="${pts([P(0, 0, 0), P(lu, lv, 0), P(lu, lv, h), P(0, 0, h)])}" fill="#2aa3c9" stroke="#155e77" stroke-width="2" stroke-linejoin="round"/>`;
  const k = at(o, -w / 2 + lu * 0.85, lv * 0.85, h * 0.5);
  s += `<circle cx="${f(k[0])}" cy="${f(k[1])}" r="5" fill="#d9dde2" stroke="#155e77" stroke-width="1.5"/>`;
  s += box(o, -w / 2 - 12, -w / 2, -8, 8, 0, h + 12, fr, 1.4);
  s += box(o, w / 2, w / 2 + 12, -8, 8, 0, h + 12, fr, 1.4);
  s += box(o, -w / 2 - 12, w / 2 + 12, -8, 8, h, h + 14, fr, 1.4);
  return `<g id="${id}" data-ox="${f(at(o)[0])}" data-oy="${f(at(o)[1])}">${s}</g>`;
}

/** tall red dot pillar ("每个点 = 1 个单位"): stacked discs, top far above the frame */
export function pillar(id, o, { r = 24, h = 1900, step = 16 } = {}) {
  const red = { f: "#e0453a", s: "#c3352b", t: "#f07a70", st: "#7a1d17" };
  let s = contactShadow(o, 60, 30);
  s += cyl(o, 0, 0, r, 0, h, red, { seg: 28, sw: 1.6 });
  // visible front half-rings between discs
  const ring = (z) => {
    const P = [];
    for (let i = 0; i <= 24; i++) {
      const a = Math.atan2(V[1], U[1]) - Math.PI / 2 + (i / 24) * Math.PI;
      P.push(at(o, r * Math.cos(a), r * Math.sin(a), z));
    }
    return `M${pts([P[0]])}L${pts(P.slice(1))}`;
  };
  let d = "";
  for (let z = step; z < h; z += step) d += ring(z);
  s += `<path d="${d}" fill="none" stroke="#a62a21" stroke-width="2"/>`;
  return `<g id="${id}" data-ox="${f(at(o)[0])}" data-oy="${f(at(o)[1])}">${s}</g>`;
}

/** open steel trough `len` long (along u), split into back / front so a block can sit inside */
export function trough(id, o, { len = 230, d = 44, h = 22 } = {}) {
  const st = { f: "#a9aeb5", s: "#8b9199", t: "#c3c8ce", st: "#4b5058" };
  const back = `<g id="${id}-b">${contactShadow(o, len * 0.6, 50, len / 2, 0)}${box(o, -6, len + 6, -d / 2 - 6, d / 2 + 6, 0, 4, st, 1.4)}${box(o, -6, len + 6, -d / 2 - 6, -d / 2, 4, h, st, 1.4)}${box(o, len, len + 6, -d / 2, d / 2, 4, h, st, 1.4)}</g>`;
  const front = `<g id="${id}-f">${box(o, -6, 0, -d / 2, d / 2, 4, h, st, 1.4)}${box(o, -6, len + 6, d / 2, d / 2 + 6, 4, h, st, 1.4)}</g>`;
  return { back, front };
}

/** grow helper ids need data-ox/oy: wrap any svg */
export const grp = (id, o, svg, extra = "") => `<g id="${id}" data-ox="${f(at(o)[0])}" data-oy="${f(at(o)[1])}" ${extra}>${svg}</g>`;
