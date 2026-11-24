// props.mjs — seg5a 自补拟物件（与 kit 同一投影）：油罐、接网、失败块、粗管、冒泡箭头
import { at, f, pts, box, rbox, cyl, M, mat, faceV, faceTop, line3, contactShadow, CE, U, V } from "../../../kit/iso.mjs";

const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const shellG = (p, o, inner, extra = "") => { const [ox, oy] = at(o); return `<g id="${p}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}" ${extra}><g id="${p}-solid">${inner}</g></g>`; };

/** jerrycan: steel fuel can, handle on top, spout, a level window on the +v face (ID-lvl scales down) */
export function jerrycan(o, opts = {}) {
  const p = opts.id ?? "can";
  const body = mat("#3a9ec2", { st: "#155e77" });
  const u0 = -46, u1 = 46, v0 = -24, v1 = 24, z1 = 120;
  let s = contactShadow(o, 70, 40);
  s += rbox(o, u0, u1, v0, v1, 0, z1, 8, body, { sw: 2 });
  // embossed X on front, level window
  s += G_(faceV(o, u0, v1, z1), `<rect x="8" y="10" width="${u1 - u0 - 16}" height="${z1 - 20}" rx="6" fill="none" stroke="#9ad9ee" stroke-width="2.5"/>
    <rect x="${(u1 - u0) / 2 - 12}" y="22" width="24" height="76" rx="4" fill="#0f2a33" stroke="#155e77" stroke-width="2"/>
    <g id="${p}-lvlg"><rect id="${p}-lvl" x="${(u1 - u0) / 2 - 9}" y="25" width="18" height="70" rx="3" fill="#7fe0a8"/></g>`);
  // handle (three bars) + spout
  s += line3(o, [[-34, -6, z1], [-34, -6, z1 + 22], [10, -6, z1 + 22], [10, -6, z1]], "#155e77", 9) + line3(o, [[-34, -6, z1 + 1], [-34, -6, z1 + 22], [10, -6, z1 + 22], [10, -6, z1 + 1]], "#5cc0e0", 4);
  s += cyl(o, 30, 6, 9, z1, z1 + 22, M.steel, { seg: 14, sw: 1.2 }) + cyl(o, 30, 6, 11, z1 + 22, z1 + 28, M.ink, { seg: 14, sw: 1 });
  const anchors = { top: at(o, 0, 0, z1 + 60), center: at(o, 0, 0, z1 / 2), ground: at(o), front: at(o, 0, v1, z1 / 2) };
  return { svg: shellG(p, o, s), anchors };
}

/** catch net: a sagging rope mesh hung on two short poles, in front of a tray stack. ID-on (green) overlays ID-off (teal) */
export function catchNet(o, opts = {}) {
  const p = opts.id ?? "net", z = opts.z ?? 110, u0 = -110, u1 = 110, v0 = 70, v1 = 210, sag = 40;
  const zAt = (u, v) => z - sag * Math.sin(Math.PI * (u - u0) / (u1 - u0)) * Math.sin(Math.PI * (v - v0) / (v1 - v0));
  const mesh = (col, w) => {
    let d = "";
    for (let i = 0; i <= 8; i++) { const u = u0 + (u1 - u0) * i / 8; d += line3(o, Array.from({ length: 13 }, (_, k) => { const v = v0 + (v1 - v0) * k / 12; return [u, v, zAt(u, v)]; }), col, w); }
    for (let k = 0; k <= 6; k++) { const v = v0 + (v1 - v0) * k / 6; d += line3(o, Array.from({ length: 17 }, (_, i) => { const u = u0 + (u1 - u0) * i / 16; return [u, v, zAt(u, v)]; }), col, w); }
    return d;
  };
  let s = "";
  for (const [u, v] of [[u0, v1], [u1, v1]]) s += cyl(o, u, v, 5, 0, z + 6, M.chrome, { seg: 12, sw: 1 }) + cyl(o, u, v, 12, 0, 5, M.ink, { seg: 12, sw: 1 });
  const rim = line3(o, [[u0, v0, z], [u1, v0, z], [u1, v1, z], [u0, v1, z], [u0, v0, z]], "#155e77", 5);
  s += `<g id="${p}-off">${mesh("#2aa3c9", 2.4)}${rim}</g><g id="${p}-on" opacity="0">${mesh("#1f9d55", 3)}${line3(o, [[u0, v0, z], [u1, v0, z], [u1, v1, z], [u0, v1, z], [u0, v0, z]], "#17804a", 5)}</g>`;
  const anchors = { top: at(o, 0, v1, z + 40), center: at(o, 0, (v0 + v1) / 2, z - sag), ground: at(o, 0, v1), bed: [0, (v0 + v1) / 2, z - sag] };
  return { svg: shellG(p, o, s, `opacity="0"`), anchors };
}

/** failure block: small red cube with a white ✗ on top (what falls out of a reverted frame) */
export function failBlock(o, z, opts = {}) {
  const p = opts.id ?? "fb", r = 20;
  let s = rbox(o, -r, r, -r, r, z, z + 2 * r, 5, M.red, { sw: 1.6 });
  s += G_(faceTop(o, -r, -r, z + 2 * r), `<path d="M10 10L${2 * r - 10} ${2 * r - 10}M${2 * r - 10} 10L10 ${2 * r - 10}" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>`);
  return { svg: `<g id="${p}" opacity="0">${s}</g>` };
}

/** thick teal pipe along a world polyline (call transfer) with a flowing highlight (ID-flow dash offset) */
export function pipe(o, P, opts = {}) {
  const p = opts.id ?? "pipe";
  const pp = P.map(([u, v, z]) => at(o, u, v, z));
  let L = 0; for (let i = 1; i < pp.length; i++) L += Math.hypot(pp[i][0] - pp[i - 1][0], pp[i][1] - pp[i - 1][1]);
  L = Math.ceil(L);
  const d = `M${pts([pp[0]])}${pp.slice(1).map((q) => "L" + pts([q])).join("")}`;
  const s = `<g id="${p}" opacity="0"><path id="${p}-body" d="${d}" stroke="#155e77" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke-dasharray="${L} ${L}" stroke-dashoffset="${L}"/>
    <path id="${p}-in" d="${d}" stroke="#3aa9cf" stroke-width="30" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke-dasharray="${L} ${L}" stroke-dashoffset="${L}"/>
    <path id="${p}-hi" d="${d}" stroke="#a6e0f2" stroke-width="7" stroke-linecap="round" fill="none" transform="translate(0,-8)" stroke-dasharray="${L} ${L}" stroke-dashoffset="${L}"/>
    <path id="${p}-flow" d="${d}" stroke="#ffffff" stroke-width="8" stroke-linecap="round" fill="none" stroke-dasharray="18 40" stroke-dashoffset="0" opacity="0"/></g>`;
  return { svg: s, L };
}

/** red bubbling arrow between two heights, drawn on the −u/+v corner of a stack (ID-s stroke, ID-h head) */
export function arrowZ(id, o, u, v, z0, z1) {
  const A = at(o, u, v, z0), B = at(o, u, v, z1 + 14), L = Math.ceil(Math.hypot(B[0] - A[0], B[1] - A[1]));
  const H = at(o, u, v, z1);
  return `<g id="${id}"><path id="${id}-s" d="M${pts([A])}L${pts([B])}" stroke="#e0453a" stroke-width="9" stroke-linecap="round" fill="none" stroke-dasharray="${L} ${L}" stroke-dashoffset="${L}"/>
    <path id="${id}-h" d="M${f(H[0] - 14)},${f(H[1] - 18)}L${f(H[0])},${f(H[1] + 2)}L${f(H[0] + 14)},${f(H[1] - 18)}Z" fill="#e0453a" opacity="0"/></g>`;
}

export { U, V, CE };
