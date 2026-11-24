// props.mjs — seg4 自补物件（同 kit 投影；只在本段用）
import { at, f, pts, CE, SA, CA, M, box, contactShadow, faceTop, faceV, frameTop, circlePlan, line3 } from "../../../kit/iso.mjs";

const depth = (u, v, z) => -u * SA * CE + v * CA * CE + z * 0.5;

/** wrap an svg into a movable group <g id=ID data-ox data-oy> (ground origin o) */
export const wrap = (id, o, inner, extra = "") => { const [x, y] = at(o); return `<g id="${id}" data-ox="${f(x)}" data-oy="${f(y)}" ${extra}>${inner}</g>`; };

/** transparent glass cup (inverted, mouth on the felt) — drawn as one flattened translucent group */
export function glassCup(o, opts = {}) {
  const p = opts.id ?? "gc", r0 = opts.r0 ?? 62, r1 = opts.r1 ?? 50, z0 = opts.z0 ?? 10, h = opts.h ?? 118;
  const ring = (r, z) => circlePlan(0, 0, r, 48).map((q) => at(o, q[0], q[1], z));
  const B = ring(r0, z0), T = ring(r1, z0 + h);
  // silhouette: extreme screen-x points
  const ix = (P) => { let a = 0, b = 0; P.forEach((q, i) => { if (q[0] < P[a][0]) a = i; if (q[0] > P[b][0]) b = i; }); return [a, b]; };
  const [ba, bb] = ix(B), [ta, tb] = ix(T);
  const side = `<polygon points="${pts([B[ba], T[ta], T[tb], B[bb]])}" fill="#d0eaf4"/>`;
  const body = `<g opacity="0.42">${side}<polygon points="${pts(B)}" fill="#d0eaf4"/><polygon points="${pts(T)}" fill="#e6f5fa"/></g>`;
  // front bottom rim (depth>0), top rim, silhouette edges
  const front = circlePlan(0, 0, r0, 72).filter((q) => depth(q[0], q[1], 0) >= 0).sort((A, Bq) => (A[0] * CA + A[1] * SA) - (Bq[0] * CA + Bq[1] * SA));
  let edges = line3(o, front.map((q) => [q[0], q[1], z0]), "#2aa3c9", 3);
  edges += `<polygon points="${pts(T)}" fill="none" stroke="#2aa3c9" stroke-width="3"/>`;
  edges += `<path d="M${pts([B[ba]])}L${pts([T[ta]])}M${pts([B[bb]])}L${pts([T[tb]])}" stroke="#2aa3c9" stroke-width="3"/>`;
  const hl0 = at(o, -r0 * 0.6, r0 * 0.55, z0 + 20), hl1 = at(o, -r1 * 0.6, r1 * 0.55, z0 + h - 20);
  edges += `<path d="M${pts([hl0])}L${pts([hl1])}" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity="0.8"/>`;
  return { svg: `<g id="${p}">${body}${edges}</g>`, anchors: { top: at(o, 0, 0, z0 + h + 50) } };
}

/** lattice tile lying on the ground: a skewed point lattice, a few points ringed red ("格方法") */
export function latticeTile(o, opts = {}) {
  const p = opts.id ?? "lat", W = opts.w ?? 360, H = opts.h ?? 260;
  let c = `<rect x="0" y="0" width="${W}" height="${H}" rx="10" fill="#fdfdfb" stroke="#c3c8ce" stroke-width="5"/>`;
  const b1 = [46, 10], b2 = [16, 40];
  const P = [];
  for (let i = -4; i < 12; i++) for (let j = -4; j < 10; j++) { const x = 20 + i * b1[0] + j * b2[0], y = 18 + i * b1[1] + j * b2[1]; if (x > 14 && x < W - 14 && y > 14 && y < H - 14) P.push([x, y]); }
  // lattice lines through the basis
  for (let j = -6; j < 12; j++) { const x0 = 20 + j * b2[0] - 6 * b1[0], y0 = 18 + j * b2[1] - 6 * b1[1]; c += `<line x1="${x0}" y1="${y0}" x2="${x0 + 20 * b1[0]}" y2="${y0 + 20 * b1[1]}" stroke="#e1e7ea" stroke-width="1.5"/>`; }
  for (let i = -6; i < 14; i++) { const x0 = 20 + i * b1[0] - 6 * b2[0], y0 = 18 + i * b1[1] - 6 * b2[1]; c += `<line x1="${x0}" y1="${y0}" x2="${x0 + 20 * b2[0]}" y2="${y0 + 20 * b2[1]}" stroke="#e1e7ea" stroke-width="1.5"/>`; }
  c = `<g><defs><clipPath id="${p}-cp"><rect x="0" y="0" width="${W}" height="${H}" rx="10"/></clipPath></defs>` + c.replace(/<line/g, `<line clip-path="url(#${p}-cp)"`);
  P.forEach((q) => { c += `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="5" fill="#1d93ba"/>`; });
  const hot = P.filter((_, i) => i % 11 === 5).slice(0, 4);
  c += `<g id="${p}-hot" opacity="${opts.hot ? 1 : 0}">` + hot.map((q) => `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="13" fill="none" stroke="#e0453a" stroke-width="4"/>`).join("") + `</g></g>`;
  let s = contactShadow(o, W * 0.6, H * 0.5);
  s += box(o, -W / 2, W / 2, -H / 2, H / 2, 0, 8, M.white, 1.4);
  s += `<g transform="${faceTop(o, -W / 2, -H / 2, 8)}">${c}</g>`;
  return { svg: wrap(p, o, s), anchors: { top: at(o, 0, 0, 80), center: at(o, 0, 0, 8), ground: at(o) } };
}

/** a casing (packaging layer) around something: back faces + front edges, teal, translucent */
export function casing(o, opts = {}) {
  const p = opts.id ?? "case", W = opts.w / 2, D = opts.d / 2, H = opts.h;
  const A = (u, v, z) => at(o, u, v, z);
  const back = [[A(-W, -D, 0), A(W, -D, 0), A(W, -D, H), A(-W, -D, H)], [A(W, -D, 0), A(W, D, 0), A(W, D, H), A(W, -D, H)]]
    .map((q) => `<polygon points="${pts(q)}" fill="rgba(208,234,244,0.35)" stroke="#2aa3c9" stroke-width="2" stroke-opacity="0.6"/>`).join("");
  const floor = `<polygon points="${pts([A(-W, -D, 0), A(W, -D, 0), A(W, D, 0), A(-W, D, 0)])}" fill="rgba(208,234,244,0.25)"/>`;
  const front = [[A(-W, -D, 0), A(-W, D, 0), A(-W, D, H), A(-W, -D, H)], [A(-W, D, 0), A(W, D, 0), A(W, D, H), A(-W, D, H)], [A(-W, -D, H), A(W, -D, H), A(W, D, H), A(-W, D, H)]]
    .map((q, i) => `<polygon points="${pts(q)}" fill="rgba(208,234,244,${i === 2 ? 0.22 : 0.12})" stroke="#2aa3c9" stroke-width="4" stroke-linejoin="round"/>`).join("");
  const bolts = [[-W, D, H], [W, D, H], [-W, D, 0], [W, D, 0], [-W, -D, H]].map((q) => { const P = A(...q); return `<circle cx="${f(P[0])}" cy="${f(P[1])}" r="7" fill="#1d93ba"/>`; }).join("");
  return {
    back: `<g id="${p}-back">${floor}${back}</g>`, front: `<g id="${p}-front">${front}${bolts}</g>`,
    anchors: { top: at(o, 0, 0, H + 40), frontTop: at(o, 0, D, H), backL: at(o, -W, -D, H), center: at(o, 0, 0, H / 2) },
  };
}

/** a short raised pedestal with something lifted on top */
export function pedestal(o, opts = {}) {
  const r = opts.r ?? 46, z = opts.z ?? 150;
  return contactShadow(o, r * 1.3, r) + box(o, -r, r, -r, r, 0, z, M.steelLight, 1.4) + box(o, -r - 6, r + 6, -r - 6, r + 6, z - 6, z, M.chrome, 1.2);
}

/** phone screen content (76×150): wallet app */
export const walletScreen = (title, accent = "#1d93ba") => `<rect x="0" y="0" width="76" height="28" fill="${accent}"/><text x="38" y="19" font-family="Noto Sans SC, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">${title}</text>
  <circle cx="38" cy="54" r="14" fill="#e4f2f7" stroke="${accent}" stroke-width="2"/><rect x="10" y="78" width="56" height="7" rx="3.5" fill="#ddd6c9"/><rect x="16" y="92" width="44" height="7" rx="3.5" fill="#e6e0d4"/>
  <rect x="8" y="114" width="60" height="24" rx="7" fill="${accent}"/>`;
