// Small props for ep04/seg4 that the kits do not have (same projection / materials as kit).
import { at, box, cyl, sphere, faceTop, faceV, pts, f, M, contactShadow } from "../../../kit/iso.mjs";

// Ledger desk (matches seg1 layout: pedestal u ±80, v ±100, wooden top at z = 100)
export function desk(o, { id = "desk", top = 100 } = {}) {
  let s = contactShadow(o, 150, 120);
  s += box(o, -72, 72, -92, 92, 0, top - 12, M.white, 1.6);
  s += box(o, -80, 80, -100, 100, top - 12, top, M.wood, 1.6);
  return { svg: `<g id="${id}">${s}</g>`, anchors: { top: at(o, 0, 0, top + 60), ground: at(o) } };
}

// Flat arrow lying on the ground from plan point A to B (both {u,v}), width w.
export function groundArrow(id, A, B, { w = 26, head = 46, color = "#1d93ba", z = 1 } = {}) {
  const du = B.u - A.u, dv = B.v - A.v, L = Math.hypot(du, dv), eu = du / L, ev = dv / L, nu = -ev, nv = eu;
  const P = (s, n) => at({ u: A.u, v: A.v }, eu * s + nu * n, ev * s + nv * n, z);
  const poly = [P(0, -w / 2), P(L - head, -w / 2), P(L - head, -w), P(L, 0), P(L - head, w), P(L - head, w / 2), P(0, w / 2)];
  return `<polygon id="${id}" points="${pts(poly)}" fill="${color}" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" opacity="0"/>`;
}

// Status lamp on a short post (L16 "锁状态可查"): base + post + glass bulb; bulb id `${id}-bulb`.
export function lamp(o, { id = "lamp", z0 = 0 } = {}) {
  let s = cyl(o, 0, 0, 16, z0, z0 + 10, M.ink, { seg: 20 });
  s += cyl(o, 0, 0, 5, z0 + 10, z0 + 46, M.chrome, { seg: 12 });
  const c = at(o, 0, 0, z0 + 62);
  s += `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="17" fill="#cfd4d8" stroke="#3b3e44" stroke-width="2"/>`;
  s += `<circle id="${id}-bulb" cx="${f(c[0])}" cy="${f(c[1])}" r="15" fill="#1f9d55" opacity="0"/>`;
  s += `<circle cx="${f(c[0] - 5)}" cy="${f(c[1] - 6)}" r="4.5" fill="#ffffff" opacity="0.8"/>`;
  return { svg: `<g id="${id}">${s}</g>`, anchors: { top: at(o, 0, 0, z0 + 84), bulb: c, ground: at(o) } };
}
