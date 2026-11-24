// props.mjs — seg3 自补的小拟物件（与 kit 同一投影；只在本段用）
import { at, f, pts, box, rbox, cyl, M, faceTop, faceV, faceU, contactShadow, line3, CE } from "../../../kit/iso.mjs";

export const wrap = (id, o, inner, extra = "") => { const [ox, oy] = at(o); return `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}" ${extra}>${inner}</g>`; };
/** lift an SVG string by z world units */
export const lift = (svg, z) => `<g transform="translate(0,${f(-z * CE)})">${svg}</g>`;

/** flat ETH coin at height z (r = radius). Red variant = stolen coin. */
export function coin(o, { id, z = 0, r = 16, op = 1, red = false } = {}) {
  const m = red ? { f: "#e8574c", s: "#c23a30", t: "#f6a59d", st: "#8f2620" } : M.gold;
  let s = cyl(o, 0, 0, r, z, z + 6, m, { sw: 1.3 });
  s += `<g transform="${faceTop(o, 0, 0, z + 6)}"><circle r="${r * 0.62}" fill="none" stroke="${red ? "#8f2620" : "#a87612"}" stroke-width="1.6"/>
    <path d="M0 ${-r * 0.42}L${r * 0.26} 0L0 ${r * 0.42}L${-r * 0.26} 0Z" fill="${red ? "#8f2620" : "#a87612"}" opacity="0.8"/></g>`;
  return { svg: wrap(id, o, s, `opacity="${op}"`), anchors: { c: at(o, 0, 0, z + 3), top: at(o, 0, 0, z + 40) } };
}

/** wooden-top pedestal (ledger desk): u ±80, v ±100, top z = 100 (same as seg1 layout DESK) */
export function pedestal(o, { id, hu = 80, hv = 100, h = 100 } = {}) {
  let s = contactShadow(o, hu * 1.4, hv * 1.1);
  s += box(o, -hu + 8, hu - 8, -hv + 8, hv - 8, 0, h - 12, M.white, 1.6);
  s += `<g transform="${faceV(o, -hu + 8, hv - 8, h - 22)}"><rect x="14" y="10" width="${2 * hu - 44}" height="${h - 44}" rx="5" fill="none" stroke="#c9c2b4" stroke-width="2"/></g>`;
  s += box(o, -hu, hu, -hv, hv, h - 12, h, M.wood, 1.6);
  return { svg: wrap(id, o, s), anchors: { top: at(o, 0, 0, h + 60) } };
}

/** call-depth ruler: steel post with ticks, a red cap plate at the limit */
export function ruler(o, { id, h = 560 } = {}) {
  let s = contactShadow(o, 40, 30);
  s += box(o, -22, 22, -22, 22, 0, 10, M.ink, 1.2);
  s += box(o, -6, 6, -6, 6, 10, h, M.steelLight, 1.4);
  // ticks on the +v face
  let tk = "";
  for (let i = 0; i <= 20; i++) { const zz = 20 + ((h - 40) * i) / 20, big = i % 5 === 0; tk += line3(o, [[-6, 6, zz], [big ? 18 : 10, 6, zz]], "#3b3e44", big ? 3 : 1.6); }
  s += tk;
  s += box(o, -26, 26, -4, 4, h, h + 26, M.red, 1.4);
  return { svg: wrap(id, o, s), anchors: { top: at(o, 0, 0, h + 70), cap: at(o, 26, 0, h + 13), mid: at(o, 12, 6, h / 2) } };
}
