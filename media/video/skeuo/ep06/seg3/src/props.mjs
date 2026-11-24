// props.mjs — ep06/seg3 自补的小拟物件（与 kit 同一投影，只在本段用）
import { at, f, box, rbox, cyl, M, faceTop, faceV, contactShadow, line3, CE } from "../../../kit/iso.mjs";

export const wrap = (id, o, inner, extra = "") => { const [ox, oy] = at(o); return `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}" ${extra}>${inner}</g>`; };
const GOLD = M.gold;
const T = (x, y, s, size, o = {}) => `<text x="${x}" y="${y}" font-family="${o.mono ? "JetBrains Mono" : "Noto Sans SC"}" font-size="${size}" font-weight="${o.w ?? 800}" fill="${o.fill ?? "#1c1c1c"}" text-anchor="${o.anchor ?? "middle"}">${s}</text>`;

/** gold bar (asset) at height z */
export function goldBar(o, { id, z = 0, op = 1, k = 1 } = {}) {
  let s = box(o, -26 * k, 26 * k, -12 * k, 12 * k, z, z + 14 * k, GOLD, 1.3);
  s += `<g transform="${faceTop(o, -20 * k, -7 * k, z + 14 * k)}"><rect x="0" y="0" width="${40 * k}" height="${14 * k}" rx="2" fill="none" stroke="#a87612" stroke-width="1.2"/></g>`;
  return { svg: wrap(id, o, s, `opacity="${op}"`), anchors: { c: at(o, 0, 0, z + 7) } };
}

/** single small gold chip (remainder) at height z */
export function chipBit(o, { id, z = 0, op = 1 } = {}) {
  const s = box(o, -9, 9, -6, 6, z, z + 6, GOLD, 1.1);
  return { svg: wrap(id, o, s, `opacity="${op}"`), anchors: { c: at(o, 0, 0, z + 3) } };
}

/** heap of remainder chips: cone of small gold blocks, each `${id}-k` (opacity 0) revealed in order k = 0.. (bottom first) */
export function chipHeap(o, { id, rings = 7, r0 = 120 } = {}) {
  const cells = [];
  for (let L = 0; L < rings; L++) {
    const R = r0 * (1 - L / rings), z = L * 13;
    const n = Math.max(1, Math.round(R / 9));
    for (let j = 0; j < n; j++) {
      const a = (j / n) * Math.PI * 2 + L * 0.7;
      for (const rr of [R, R * 0.55, R * 0.15]) {
        if (rr < 6 && j > 0) continue;
        cells.push({ du: rr * Math.cos(a), dv: rr * Math.sin(a) * 0.8, z, L });
      }
    }
  }
  // reveal order: by layer, then far → near; paint order: by layer, then by screen depth
  cells.forEach((c, i) => { c.y = at(o, c.du, c.dv, 0)[1]; c.i = i; });
  const order = cells.slice().sort((a, b) => a.L - b.L || a.y - b.y);
  order.forEach((c, k) => { c.k = k; });
  const s = order.map((c) => `<g id="${id}-${c.k}" opacity="0">${box(o, c.du - 9, c.du + 9, c.dv - 6, c.dv + 6, c.z, c.z + 6, GOLD, 1)}</g>`).join("");
  return { svg: wrap(id, o, contactShadow(o, r0 + 20, r0 * 0.8) + s), n: order.length, anchors: { top: at(o, 0, 0, rings * 13 + 50), c: at(o, 0, 0, 20), ground: at(o) } };
}

/** teal wire cube = "一笔交易" frame (dashed edges) */
export function wireCube(o, { id, u0, u1, v0, v1, h } = {}) {
  const st = `stroke-dasharray="14 9"`;
  const P = (a, b, z) => [a, b, z];
  const E = [
    [P(u0, v0, 0), P(u1, v0, 0)], [P(u1, v0, 0), P(u1, v1, 0)], [P(u1, v1, 0), P(u0, v1, 0)], [P(u0, v1, 0), P(u0, v0, 0)],
    [P(u0, v0, h), P(u1, v0, h)], [P(u1, v0, h), P(u1, v1, h)], [P(u1, v1, h), P(u0, v1, h)], [P(u0, v1, h), P(u0, v0, h)],
    [P(u0, v0, 0), P(u0, v0, h)], [P(u1, v0, 0), P(u1, v0, h)], [P(u1, v1, 0), P(u1, v1, h)], [P(u0, v1, 0), P(u0, v1, h)],
  ];
  const back = E.filter((e, i) => [0, 1, 9].includes(i)), front = E.filter((e, i) => ![0, 1, 9].includes(i));
  const draw = (arr, op) => arr.map((e) => line3(o, e, "#1d93ba", 4, `${st} opacity="${op}"`)).join("");
  const fill = `<polygon points="${[[u0, v1], [u1, v1], [u1, v1]].length && [at(o, u0, v1, 0), at(o, u1, v1, 0), at(o, u1, v1, h), at(o, u0, v1, h)].map((q) => q.map(f).join(",")).join(" ")}" fill="#2aa3c9" opacity="0.05"/>`;
  return {
    back: wrap(id + "-bk", o, draw(back, 0.6), `opacity="0"`),
    front: wrap(id, o, fill + draw(front, 1), `opacity="0"`),
    anchors: { tag: at(o, u0, v1, h), top: at(o, (u0 + u1) / 2, (v0 + v1) / 2, h) },
  };
}

/** red loop arrow lying on the ground (round trip) */
export function loopArrow(o, { id, ru = 150, rv = 110 } = {}) {
  const N = 48, pts = [];
  for (let i = 0; i <= N * 0.9; i++) { const a = (i / N) * Math.PI * 2; pts.push(at(o, ru * Math.cos(a), rv * Math.sin(a), 0)); }
  const d = "M" + pts.map((p) => p.map(f).join(" ")).join("L");
  const a1 = (0.9) * Math.PI * 2, tip = at(o, ru * Math.cos(a1 + 0.12), rv * Math.sin(a1 + 0.12), 0);
  const b1 = at(o, (ru + 22) * Math.cos(a1 - 0.06), (rv + 22) * Math.sin(a1 - 0.06), 0), b2 = at(o, (ru - 22) * Math.cos(a1 - 0.06), (rv - 22) * Math.sin(a1 - 0.06), 0);
  const s = `<path d="${d}" fill="none" stroke="#e0453a" stroke-width="10" stroke-linecap="round" opacity="0.9"/>
    <polygon points="${[tip, b1, b2].map((p) => p.map(f).join(",")).join(" ")}" fill="#e0453a"/>`;
  return { svg: wrap(id, o, s, `opacity="0"`), anchors: { c: at(o) } };
}

/** price rail (KyberSwap): long steel rail on two feet, tick marks, a teal tick-boundary post, a cursor `${id}-cur` */
export function priceRail(o, { id, L = 520, post = 300, cur = 200 } = {}) {
  let s = contactShadow(o, L * 0.55, 60, L / 2, 0);
  for (const u of [30, L - 30]) s += box(o, u - 10, u + 10, -14, 14, 0, 46, M.ink, 1.2);
  s += box(o, 0, L, -14, 14, 46, 60, M.steelLight, 1.4);
  s += `<g transform="${faceV(o, 0, 14, 60)}">` + Array.from({ length: Math.floor(L / 20) + 1 }, (_, k) => `<line x1="${k * 20}" y1="0" x2="${k * 20}" y2="${k % 5 ? 5 : 10}" stroke="#3b3e44" stroke-width="${k % 5 ? 1 : 2}"/>`).join("") + `</g>`;
  // tick boundary post
  s += box(o, post - 5, post + 5, -5, 5, 60, 190, { f: "#2aa3c9", s: "#1d93ba", t: "#7fd0ea", st: "#17809f" }, 1.2);
  s += `<g transform="${faceV(o, post - 26, 5, 214)}"><rect x="0" y="0" width="52" height="24" rx="5" fill="#1d93ba"/>${T(26, 18, "tick", 16, { mono: true, fill: "#fff" })}</g>`;
  const curSvg = box(o, cur - 12, cur + 12, -20, 20, 56, 100, M.ink, 1.3) +
    `<g transform="${faceV(o, cur - 12, 20, 100)}"><rect x="5" y="6" width="14" height="30" rx="3" fill="#fff" opacity="0.85"/><line x1="12" y1="6" x2="12" y2="36" stroke="#1d93ba" stroke-width="2.4"/></g>`;
  s += `<g id="${id}-cur">${curSvg}</g>`;
  return { svg: wrap(id, o, `<g id="${id}-solid">${s}</g>`), anchors: { top: at(o, post, 0, 260), post: at(o, post, 0, 190), cur: at(o, cur, 0, 110), ground: at(o), mid: at(o, L / 2, 0, 0) } };
}

/** liquidity block (teal slab) at height z */
export function liqBlock(o, { id, u0 = 0, u1 = 120, v0 = -40, v1 = 40, z = 0, h = 46, red = false } = {}) {
  if (red) {
    const P = (a, b, c) => [a, b, c];
    const E = [[P(u0, v0, z), P(u1, v0, z), P(u1, v1, z), P(u0, v1, z), P(u0, v0, z)], [P(u0, v0, z + h), P(u1, v0, z + h), P(u1, v1, z + h), P(u0, v1, z + h), P(u0, v0, z + h)],
      [P(u0, v1, z), P(u0, v1, z + h)], [P(u1, v1, z), P(u1, v1, z + h)], [P(u1, v0, z), P(u1, v0, z + h)], [P(u0, v0, z), P(u0, v0, z + h)]];
    const s = E.map((e) => line3(o, e, "#e0453a", 4, `stroke-dasharray="12 8"`)).join("") +
      `<polygon points="${[at(o, u0, v1, z), at(o, u1, v1, z), at(o, u1, v1, z + h), at(o, u0, v1, z + h)].map((q) => q.map(f).join(",")).join(" ")}" fill="#e0453a" opacity="0.10"/>`;
    return { svg: wrap(id, o, s, `opacity="0"`), anchors: { top: at(o, (u0 + u1) / 2, (v0 + v1) / 2, z + h) } };
  }
  const s = box(o, u0, u1, v0, v1, z, z + h, { f: "#5cc0e0", s: "#3a9ec2", t: "#9ad9ee", st: "#1f7896" }, 1.6);
  return { svg: wrap(id, o, s), anchors: { top: at(o, (u0 + u1) / 2, (v0 + v1) / 2, z + h) } };
}

/** counter with a wooden top (pizza shop) */
export function shopCounter(o, { id, w = 260, d = 120, h = 96 } = {}) {
  let s = contactShadow(o, w * 0.7, d * 0.8);
  s += box(o, -w / 2, w / 2, -d / 2, d / 2, 0, h - 10, { f: "#e9e3d6", s: "#cfc6b4", t: "#f4efe6", st: "#7d7466" }, 1.5);
  s += box(o, -w / 2 - 8, w / 2 + 8, -d / 2 - 8, d / 2 + 8, h - 10, h, M.wood, 1.5);
  return { svg: wrap(id, o, s), anchors: { top: at(o, 0, 0, h), z: h } };
}
export const lift = (svg, z) => `<g transform="translate(0,${f(-z * CE)})">${svg}</g>`;
