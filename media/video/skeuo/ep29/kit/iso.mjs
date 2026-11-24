// iso.mjs — 等距基础库（ep29 Web3 安全手册第 29 章）
// 从 s7-vivid 的 build-story 提炼。Node 端运行，所有函数返回 SVG / HTML 字符串。
// 投影：方位 35°、仰角 30°。世界坐标 (u, v, z) → 世界画布 px：
//   u 轴屏幕向量 (0.819, −0.287)  v 轴 (0.574, 0.410)  z 轴 (0, −0.866)
// 可见面：顶面、−u 面（左侧窄面，亮）、+v 面（右前宽面，暗，"正面"）。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";

const DEG = Math.PI / 180;
export const CA = Math.cos(35 * DEG), SA = Math.sin(35 * DEG); // azimuth 35°
export const SE = 0.5, CE = Math.cos(30 * DEG);                 // elevation 30°
export const U = [CA, -SA * SE];  // screen vector of +u (per world unit)
export const V = [SA, CA * SE];   // screen vector of +v
export const Z = [0, -CE];        // screen vector of +z (up)

export const f = (n) => Math.round(n * 10) / 10;
export const f4 = (n) => Math.round(n * 10000) / 10000;
/** world (u,v,z) → world-canvas px */
export const Wp = (u, v, z = 0) => [u * CA + v * SA, -u * SA * SE + v * CA * SE - z * CE];
/** world-canvas ground px (X,Y) → world {u,v} (z = 0) */
export const G = (X, Y) => ({ u: CA * X - SA * Y / SE, v: SA * X + CA * Y / SE });
/** point relative to an object origin o = {u,v} */
export const at = (o, du = 0, dv = 0, z = 0) => Wp(o.u + du, o.v + dv, z);
export const pts = (arr) => arr.map((p) => `${f(p[0])},${f(p[1])}`).join(" ");
/** screen-y of a plan normal (nu,nv): > 0 ⇒ the vertical face is visible */
export const faceVis = (nu, nv) => nu * U[1] + nv * V[1];

// ---------------------------------------------------------------- colours
export const C = {
  ground: "#efebe3", grid: "#e2ddd3", ink: "#1c1c1c", sub: "#6d685e",
  green: "#1f9d55", red: "#e0453a", teal: "#2aa3c9", tealSolid: "#1d93ba", tealText: "#17809f",
  paper: "#fffdf8", cream: "#f6f3ec",
};
const hex2 = (h) => {
  if (h.startsWith("rgba") || h.startsWith("rgb")) { const a = h.match(/[\d.]+/g).map(Number); return [a[0], a[1], a[2], a[3] ?? 1]; }
  const x = h.replace("#", ""); return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16), 1];
};
const toHex = (c) => c[3] < 1 ? `rgba(${c.map((v, i) => i < 3 ? Math.round(v) : f4(v)).join(",")})` : "#" + c.slice(0, 3).map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
/** linear mix of two colours, t in [0,1] */
export const mix = (a, b, t) => { const A = hex2(a), B = hex2(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
export const lighten = (a, t) => mix(a, "#ffffff", t);
export const darken = (a, t) => mix(a, "#000000", t);
/** material from one base colour: f = −u face, s = +v face, t = top, st = stroke */
export const mat = (base, o = {}) => ({ f: o.f ?? base, s: o.s ?? darken(base, 0.16), t: o.t ?? lighten(base, 0.28), st: o.st ?? darken(base, 0.45) });

// materials (s7 values kept verbatim where they existed)
export const M = {
  white: { f: "#f6f3ec", s: "#e3ddd1", t: "#fdfcf9", st: "#b8b0a1" },
  plinth: { f: "#efebe3", s: "#ddd7cb", t: "#f8f6f1", st: "#c3bbac" },
  dark: { f: "#45433f", s: "#2e2d2a", t: "#5a5852", st: "#24231f" },
  ink: { f: "#34363b", s: "#25272b", t: "#4a4d53", st: "#141518" },
  blue: { f: "#5cc0e0", s: "#3a9ec2", t: "#9ad9ee", st: "#2a87a8" },
  red: { f: "#e8574c", s: "#c23a30", t: "#f08a80", st: "#a8322a" },
  green: { f: "#3fb877", s: "#1f9d55", t: "#86d6a8", st: "#17804a" },
  glass: { f: "rgba(208,234,244,0.30)", s: "rgba(190,224,237,0.38)", t: "rgba(236,248,252,0.50)", st: "rgba(42,163,201,0.75)" },
  gold: { f: "#f0c04a", s: "#cf9520", t: "#ffe08a", st: "#a87612" },
  steel: { f: "#666a71", s: "#4b4f56", t: "#80858d", st: "#25282c" },
  steelLight: { f: "#a9aeb5", s: "#8b9199", t: "#c3c8ce", st: "#5a6068" },
  chrome: { f: "#d4d7db", s: "#b5b9bf", t: "#eceef0", st: "#7d828a" },
  wood: { f: "#b98454", s: "#956236", t: "#d0a172", st: "#6a4220" },
  rubber: { f: "#b3332a", s: "#8f2620", t: "#c94a40", st: "#6a1a15" },
  tealLight: { f: "#d9eff6", s: "#bfe3ef", t: "#eef8fb", st: "#2aa3c9" },
  paper: { f: "#fbf9f4", s: "#ebe6dc", t: "#fffefb", st: "#b8b0a1" },
};

// ---------------------------------------------------------------- face frames
// Each returns an SVG matrix string; local units = world units, local y runs downward.
const mstr = (m) => `matrix(${m.map((v, i) => (i < 4 ? f4(v) : f(v))).join(",")})`;
/** +v face plane (v = const): local x → +u, local y → −z. origin = (du,dv,z) */
export const frameV = (o, du, dv, z) => { const [x, y] = at(o, du, dv, z); return [U[0], U[1], 0, CE, x, y]; };
/** −u face plane (u = const): local x → +v, local y → −z */
export const frameU = (o, du, dv, z) => { const [x, y] = at(o, du, dv, z); return [V[0], V[1], 0, CE, x, y]; };
/** horizontal plane at height z: local x → +u, local y → +v */
export const frameTop = (o, du, dv, z) => { const [x, y] = at(o, du, dv, z); return [U[0], U[1], V[0], V[1], x, y]; };
/** +v-facing plane tilted back by `tilt` deg (laptop lid): local y runs down the lid toward +v */
export const frameTilt = (o, du, dv, z, tilt) => {
  const [x, y] = at(o, du, dv, z); const s = Math.sin(tilt * DEG), c = Math.cos(tilt * DEG);
  return [U[0], U[1], s * V[0], s * V[1] + c * CE, x, y];
};
export const faceV = (o, du, dv, z) => mstr(frameV(o, du, dv, z));
export const faceU = (o, du, dv, z) => mstr(frameU(o, du, dv, z));
export const faceTop = (o, du, dv, z) => mstr(frameTop(o, du, dv, z));
export const faceTilt = (o, du, dv, z, t) => mstr(frameTilt(o, du, dv, z, t));
export const matStr = mstr;
/** apply a frame matrix to a local point */
export const applyM = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

// ---------------------------------------------------------------- solids
const strokeAttr = (m, sw) => `stroke="${m.st}" stroke-width="${sw}" stroke-linejoin="round"`;
/** axis-aligned box: three lit faces + outline (s7 signature) */
export function box(o, u0, u1, v0, v1, z0, z1, m, sw = 1.6) {
  const A = (u, v, z) => at(o, u, v, z);
  const front = [A(u0, v0, z0), A(u0, v1, z0), A(u0, v1, z1), A(u0, v0, z1)];
  const side = [A(u0, v1, z0), A(u1, v1, z0), A(u1, v1, z1), A(u0, v1, z1)];
  const top = [A(u0, v0, z1), A(u1, v0, z1), A(u1, v1, z1), A(u0, v1, z1)];
  const S = strokeAttr(m, sw);
  return `<polygon points="${pts(front)}" fill="${m.f}" ${S}/><polygon points="${pts(side)}" fill="${m.s}" ${S}/><polygon points="${pts(top)}" fill="${m.t}" ${S}/>`;
}
/** all 12 edges of a box as one path d */
export function edges(o, u0, u1, v0, v1, z0, z1) {
  const c = [];
  for (const z of [z0, z1]) c.push([at(o, u0, v0, z), at(o, u1, v0, z), at(o, u1, v1, z), at(o, u0, v1, z)]);
  let d = "";
  for (const ring of c) d += `M${pts([ring[0]])}L${pts([ring[1]])}L${pts([ring[2]])}L${pts([ring[3]])}Z`;
  for (let i = 0; i < 4; i++) d += `M${pts([c[0][i]])}L${pts([c[1][i]])}`;
  return d;
}
/** the three hidden back edges (for glass) */
export function backEdges(o, u0, u1, v0, v1, z0, z1) {
  const P = (u, v, z) => pts([at(o, u, v, z)]);
  return `M${P(u1, v0, z0)}L${P(u1, v0, z1)}M${P(u1, v0, z0)}L${P(u0, v0, z0)}M${P(u1, v0, z0)}L${P(u1, v1, z0)}`;
}

// plan shapes (lists of [du,dv])
export function rrectPlan(u0, u1, v0, v1, r, seg = 6) {
  r = Math.min(r, (u1 - u0) / 2, (v1 - v0) / 2);
  const out = [];
  const corner = (cu, cv, a0) => { for (let i = 0; i <= seg; i++) { const a = (a0 + (90 * i) / seg) * DEG; out.push([cu + r * Math.cos(a), cv + r * Math.sin(a)]); } };
  corner(u1 - r, v1 - r, 0); corner(u0 + r, v1 - r, 90); corner(u0 + r, v0 + r, 180); corner(u1 - r, v0 + r, 270);
  return out;
}
export function circlePlan(du, dv, r, seg = 40, ry = r) {
  const out = []; for (let i = 0; i < seg; i++) { const a = (360 * i / seg) * DEG; out.push([du + r * Math.cos(a), dv + ry * Math.sin(a)]); } return out;
}
const shadeFor = (m, nu, nv) => {
  // −u normal → m.f ; +v normal → m.s ; blend by angle
  let t = Math.atan2(nv, -nu) / (Math.PI / 2);
  t = Math.max(-0.3, Math.min(1.25, t));
  if (t < 0) return lighten(m.f, -t * 0.25);
  if (t > 1) return darken(m.s, (t - 1) * 0.3);
  return mix(m.f, m.s, t);
};
/**
 * loft: vertical solid between a bottom plan (z0) and a top plan (z1) with the same
 * vertex count (prism when equal, frustum when scaled). Facets shaded by normal,
 * outline drawn only on silhouette / sharp creases. opts.top=false skips the cap.
 */
export function loft(o, planB, planT, z0, z1, m, opts = {}) {
  const sw = opts.sw ?? 1.6, n = planB.length;
  let area = 0; for (let i = 0; i < n; i++) { const a = planB[i], b = planB[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
  const sg = area > 0 ? 1 : -1;
  const facets = [], vis = [], nrm = [];
  for (let i = 0; i < n; i++) {
    const a = planB[i], b = planB[(i + 1) % n];
    const eu = b[0] - a[0], ev = b[1] - a[1], L = Math.hypot(eu, ev) || 1;
    const nu = (sg * ev) / L, nv = (-sg * eu) / L;
    nrm.push([nu, nv]); vis.push(faceVis(nu, nv) > 0.001);
  }
  let body = "";
  for (let i = 0; i < n; i++) {
    if (!vis[i]) continue;
    const j = (i + 1) % n, col = shadeFor(m, nrm[i][0], nrm[i][1]);
    const q = [at(o, planB[i][0], planB[i][1], z0), at(o, planB[j][0], planB[j][1], z0), at(o, planT[j][0], planT[j][1], z1), at(o, planT[i][0], planT[i][1], z1)];
    body += `<polygon points="${pts(q)}" fill="${col}" stroke="${col}" stroke-width="0.8" stroke-linejoin="round"/>`;
    facets.push(i);
  }
  // outline: bottom visible chain + silhouette / crease verticals
  let d = "";
  for (let i = 0; i < n; i++) {
    if (vis[i]) { const j = (i + 1) % n; d += `M${pts([at(o, planB[i][0], planB[i][1], z0)])}L${pts([at(o, planB[j][0], planB[j][1], z0)])}`; }
    const p = (i - 1 + n) % n;
    const crease = vis[i] && vis[p] && (nrm[i][0] * nrm[p][0] + nrm[i][1] * nrm[p][1]) < Math.cos(28 * DEG);
    if (vis[i] !== vis[p] || crease) d += `M${pts([at(o, planB[i][0], planB[i][1], z0)])}L${pts([at(o, planT[i][0], planT[i][1], z1)])}`;
  }
  const cap = opts.top === false ? "" : `<polygon points="${pts(planT.map((q) => at(o, q[0], q[1], z1)))}" fill="${opts.topFill ?? m.t}" ${strokeAttr(m, sw)}/>`;
  return body + `<path d="${d}" fill="none" ${strokeAttr(m, sw)} stroke-linecap="round"/>` + cap;
}
export const prism = (o, plan, z0, z1, m, opts) => loft(o, plan, plan, z0, z1, m, opts);
/** rounded box (rounded vertical edges) */
export const rbox = (o, u0, u1, v0, v1, z0, z1, r, m, opts) => prism(o, rrectPlan(u0, u1, v0, v1, r, opts?.seg ?? 6), z0, z1, m, opts);
/** vertical cylinder at (du,dv) */
export const cyl = (o, du, dv, r, z0, z1, m, opts = {}) => prism(o, circlePlan(du, dv, r, opts.seg ?? 40), z0, z1, m, opts);
/** frustum / cone: radius r0 at z0, r1 at z1 */
export const frustum = (o, du, dv, r0, r1, z0, z1, m, opts = {}) => loft(o, circlePlan(du, dv, r0, opts.seg ?? 40), circlePlan(du, dv, Math.max(r1, 0.01), opts.seg ?? 40), z0, z1, m, opts);
/**
 * wedge: box whose top slopes down toward `dir` ("+u","-u","+v","-v"); z1 is the high side.
 */
export function wedge(o, u0, u1, v0, v1, z0, z1, m, dir = "+v", zLow = z0, sw = 1.6) {
  const H = (u, v) => {
    const t = dir === "+u" ? (u - u0) / (u1 - u0) : dir === "-u" ? (u1 - u) / (u1 - u0) : dir === "+v" ? (v - v0) / (v1 - v0) : (v1 - v) / (v1 - v0);
    return z1 + (zLow - z1) * t;
  };
  const A = (u, v, top) => at(o, u, v, top ? H(u, v) : z0);
  const S = strokeAttr(m, sw);
  const front = [A(u0, v0, 0), A(u0, v1, 0), A(u0, v1, 1), A(u0, v0, 1)];
  const side = [A(u0, v1, 0), A(u1, v1, 0), A(u1, v1, 1), A(u0, v1, 1)];
  const top = [A(u0, v0, 1), A(u1, v0, 1), A(u1, v1, 1), A(u0, v1, 1)];
  return `<polygon points="${pts(front)}" fill="${m.f}" ${S}/><polygon points="${pts(side)}" fill="${m.s}" ${S}/><polygon points="${pts(top)}" fill="${m.t}" ${S}/>`;
}
/** shaded sphere (screen circle + radial gradient). id must be unique. */
export function sphere(id, o, du, dv, z, r, m, sw = 1.6) {
  const [x, y] = at(o, du, dv, z);
  return `<defs><radialGradient id="${id}" cx="0.36" cy="0.32" r="0.75"><stop offset="0" stop-color="${m.t}"/><stop offset="0.55" stop-color="${m.f}"/><stop offset="1" stop-color="${m.s}"/></radialGradient></defs><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#${id})" stroke="${m.st}" stroke-width="${sw}"/>`;
}
/** flat polygon on a horizontal plane at height z (plan coords) */
export const flat = (o, plan, z, fill, stroke = "none", sw = 1.6, extra = "") => `<polygon points="${pts(plan.map((q) => at(o, q[0], q[1], z)))}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" ${extra}/>`;
/** a polyline through 3D points (relative to o) */
export const line3 = (o, P, stroke, sw = 2, extra = "") => `<polyline points="${pts(P.map((q) => at(o, q[0], q[1], q[2] ?? 0)))}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
/** extrude a flat drawing: draws `inner` (local frame content) `steps` times along a screen offset, back copies tinted */
export function extrude(matrix, innerBack, innerFront, depthVec, steps = 6) {
  let s = "";
  for (let i = steps; i >= 1; i--) {
    const k = i / steps; s += `<g transform="translate(${f(depthVec[0] * k)},${f(depthVec[1] * k)})"><g transform="${mstr(matrix)}">${innerBack}</g></g>`;
  }
  return s + `<g transform="${mstr(matrix)}">${innerFront}</g>`;
}

// ---------------------------------------------------------------- ground
/** green (or red) ground glow, radial gradient on the ground plane; needs isoDefs() once per svg */
export const glow = (id, o, r, cls = "", color = "green") =>
  `<g transform="${faceTop(o, 0, 0, 0)}"><circle id="${id}" class="${cls}" cx="0" cy="0" r="${r}" fill="url(#${color === "red" ? "rglow" : "gglow"})"/></g>`;
/** shared <defs> (green/red glow gradients). Put once inside each world <svg>. */
export const isoDefs = () => `<defs>
  <radialGradient id="gglow"><stop offset="0" stop-color="#1f9d55" stop-opacity="0.42"/><stop offset="0.55" stop-color="#1f9d55" stop-opacity="0.16"/><stop offset="1" stop-color="#1f9d55" stop-opacity="0"/></radialGradient>
  <radialGradient id="rglow"><stop offset="0" stop-color="#e0453a" stop-opacity="0.36"/><stop offset="0.55" stop-color="#e0453a" stop-opacity="0.13"/><stop offset="1" stop-color="#e0453a" stop-opacity="0"/></radialGradient>
  <radialGradient id="shadowG"><stop offset="0" stop-color="#5a5040" stop-opacity="0.20"/><stop offset="1" stop-color="#5a5040" stop-opacity="0"/></radialGradient>
</defs>`;
/** soft contact shadow ellipse on the ground */
export const contactShadow = (o, ru, rv, du = 0, dv = 0) => `<g transform="${faceTop(o, du, dv, 0)}"><ellipse cx="0" cy="0" rx="${ru}" ry="${rv}" fill="url(#shadowG)"/></g>`;
/** ground grid path (world units every `step`) */
export function gridPath(u0 = -3200, u1 = 4800, v0 = -2600, v1 = 4200, step = 80) {
  let d = "";
  for (let u = Math.ceil(u0 / step) * step; u <= u1; u += step) d += `M${pts([Wp(u, v0)])}L${pts([Wp(u, v1)])}`;
  for (let v = Math.ceil(v0 / step) * step; v <= v1; v += step) d += `M${pts([Wp(u0, v)])}L${pts([Wp(u1, v)])}`;
  return d;
}
export const gridSvg = (opts = {}) => `<path d="${gridPath(opts.u0, opts.u1, opts.v0, opts.v1, opts.step)}" stroke="${C.grid}" stroke-width="2" fill="none"/>`;
/** a world <svg> covering the world canvas; content in world-canvas px */
export const worldSvg = (id, content, box = [-1500, -1600, 6000, 3600]) =>
  `<svg id="${id}" class="wsvg" width="${box[2]}" height="${box[3]}" viewBox="${box.join(" ")}" style="left:${box[0]}px;top:${box[1]}px">${isoDefs()}${content}</svg>`;

// ---------------------------------------------------------------- broken state
/** red dashed wire frame over a list of parts. part = [u0,u1,v0,v1,z0,z1] | {cyl:[du,dv,r,z0,z1]} */
export function wirePath(o, parts) {
  let d = "";
  for (const p of parts) {
    if (Array.isArray(p)) d += edges(o, ...p);
    else if (p.cyl) {
      const [du, dv, r, z0, z1] = p.cyl;
      for (const z of [z0, z1]) { const c = circlePlan(du, dv, r, 32).map((q) => at(o, q[0], q[1], z)); d += `M${pts([c[0]])}L${pts(c.slice(1))}Z`; }
      // silhouette verticals at the extreme screen-x points of the ellipse
      const a = Math.atan2(V[0], U[0]); // plan direction of max screen x
      for (const s of [1, -1]) { const du2 = du + s * r * Math.cos(a), dv2 = dv + s * r * Math.sin(a); d += `M${pts([at(o, du2, dv2, z0)])}L${pts([at(o, du2, dv2, z1)])}`; }
    } else if (p.path) d += p.path;
  }
  return d;
}
export const wireSvg = (id, o, parts, opts = {}) =>
  `<path id="${id}" d="${wirePath(o, parts)}" fill="rgba(224,69,58,0.05)" stroke="#e0453a" stroke-width="${opts.sw ?? 3}" stroke-dasharray="${opts.dash ?? "10 7"}" stroke-linejoin="round" stroke-linecap="round" opacity="${opts.opacity ?? 1}"/>`;
/** red-dot white-X badge drawn in world space (scales with the camera) */
export const badgeSvg = (id, p, r = 32, opacity = 1) => {
  const [x, y] = p, k = r * 0.38;
  return `<g id="${id}" opacity="${opacity}"><circle cx="${f(x)}" cy="${f(y + 4)}" r="${r + 4}" fill="rgba(160,40,30,0.18)"/><circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="#e0453a" stroke="#ffffff" stroke-width="4"/><path d="M${f(x - k)} ${f(y - k)}L${f(x + k)} ${f(y + k)}M${f(x + k)} ${f(y - k)}L${f(x - k)} ${f(y + k)}" stroke="#ffffff" stroke-width="${f(r * 0.2)}" stroke-linecap="round"/></g>`;
};
/** green check badge (world space) */
export const checkSvg = (id, p, r = 26, opacity = 1) => {
  const [x, y] = p;
  return `<g id="${id}" opacity="${opacity}"><circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="#1f9d55" stroke="#ffffff" stroke-width="4"/><path d="M${f(x - r * 0.42)} ${f(y + r * 0.02)}l${f(r * 0.3)} ${f(r * 0.3)}l${f(r * 0.55)} ${f(-r * 0.58)}" fill="none" stroke="#ffffff" stroke-width="${f(r * 0.2)}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
};

// ---------------------------------------------------------------- connectors
/** cubic bezier helpers (screen or world-canvas px) */
export const bez = (P0, P1, P2, P3, t) => [0, 1].map((k) => (1 - t) ** 3 * P0[k] + 3 * (1 - t) ** 2 * t * P1[k] + 3 * (1 - t) * t * t * P2[k] + t ** 3 * P3[k]);
export function bezLen(P0, P1, P2, P3, n = 400) { let L = 0, prev = P0; for (let i = 1; i <= n; i++) { const p = bez(P0, P1, P2, P3, i / n); L += Math.hypot(p[0] - prev[0], p[1] - prev[1]); prev = p; } return Math.ceil(L); }
/**
 * red dashed bezier "code row → object" connector, drawn with a mask so it can be revealed
 * by tweening `#${id}-m` strokeDashoffset from L to 0 (see runtime KIT.draw).
 * P0 start, P3 end; c1/c2 optional control points. Returns {svg, L, d}.
 */
export function dashCurve(id, P0, P3, opts = {}) {
  const P1 = opts.c1 ?? [P0[0] + (P3[0] - P0[0]) * 0.45, P0[1] + 160];
  const P2 = opts.c2 ?? [P3[0] - (P3[0] - P0[0]) * 0.35, P3[1] - 40];
  const L = bezLen(P0, P1, P2, P3);
  const d = `M${pts([P0])}C${pts([P1])} ${pts([P2])} ${pts([P3])}`;
  const col = opts.color ?? "#e0453a", hidden = opts.hidden !== false;
  const svg = `<g id="${id}"><defs><mask id="${id}-mask" maskUnits="userSpaceOnUse" x="-20000" y="-20000" width="40000" height="40000">
    <path id="${id}-m" d="${d}" fill="none" stroke="#ffffff" stroke-width="18" stroke-dasharray="${L} ${L}" stroke-dashoffset="${hidden ? L : 0}"/></mask></defs>
    <path d="${d}" fill="none" stroke="${col}" stroke-width="${opts.sw ?? 4}" stroke-dasharray="${opts.dash ?? "12 9"}" stroke-linecap="round" mask="url(#${id}-mask)"/>
    <circle id="${id}-a" cx="${f(P0[0])}" cy="${f(P0[1])}" r="8" fill="${col}" opacity="${hidden ? 0 : 1}"/>
    <circle id="${id}-b" cx="${f(P3[0])}" cy="${f(P3[1])}" r="14" fill="none" stroke="${col}" stroke-width="4" opacity="${hidden ? 0 : 1}"/></g>`;
  return { svg, L, d, P: [P0, P1, P2, P3] };
}

// ---------------------------------------------------------------- camera
/** camera so that world-canvas point P lands at screen (sx,sy) with zoom k */
export const camAt = (P, sx, sy, k) => ({ x: f(sx - k * P[0]), y: f(sy - k * P[1]), scale: k });
export const toScreen = (c, p) => [c.x + c.scale * p[0], c.y + c.scale * p[1]];

// ---------------------------------------------------------------- HTML pins / labels
export const pinAt = (id, p, inner, cls = "") => `<div class="pin ${cls}" id="${id}" style="left:${f(p[0])}px;top:${f(p[1])}px">${inner}</div>`;
/**
 * world label: HTML pinned at world-canvas point p, counter-scaled (.wl) so it keeps its
 * screen size under any camera zoom. anchor: b (label sits above p) | t | l | r | c.
 * cls: "" (teal outline) | lab-cs | lab-gs | lab-rs | lab-r | lab-g ; add "hide" to start hidden.
 */
export const wlab = (id, p, html, cls = "", anchor = "b") =>
  pinAt(id + "-pin", p, `<div class="wl"><div class="ctr a-${anchor}"><div class="lab ${cls}" id="${id}">${html}</div></div></div>`);
/** counter-scaled arbitrary HTML at p */
export const wpin = (id, p, html, anchor = "c") => pinAt(id + "-pin", p, `<div class="wl"><div class="ctr a-${anchor}">${html}</div></div>`);
/** envelope icon (s7) */
export const ENV = (red = false) => `<svg width="64" height="44" viewBox="0 0 64 44"><rect x="2" y="2" width="60" height="40" rx="5" fill="${red ? "#fde6e3" : "#ffffff"}" stroke="${red ? "#e0453a" : "#6b665c"}" stroke-width="3"/><path d="M4 5L32 26L60 5" fill="none" stroke="${red ? "#e0453a" : "#6b665c"}" stroke-width="3" stroke-linejoin="round"/></svg>`;
/** HTML red-X badge (s7). Constant screen size when placed via wpin. */
export const BADGE = (id, size = 64, cls = "") => `<div class="badge ${cls}" id="${id}" style="width:${size}px;height:${size}px"><svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 20 20"><path d="M4 4L16 16M16 4L4 16" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/></svg></div>`;
/** HTML green check badge */
export const CHECK = (id, size = 40, cls = "") => `<div class="badge badge-g ${cls}" id="${id}" style="width:${size}px;height:${size}px"><svg width="${size * 0.55}" height="${size * 0.45}" viewBox="0 0 34 28"><path d="M3 15l9 9L31 4" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;

// ---------------------------------------------------------------- assets
const here = (p) => new URL(p, import.meta.url);
/** kit.css contents (inline into each composition's <style>) */
export const kitCss = () => fs.readFileSync(here("./kit.css"), "utf8");
/** browser runtime (window.KIT helpers) — inline into each composition's <script> before your timeline */
export const runtimeJs = () => fs.readFileSync(here("./runtime.js"), "utf8");
