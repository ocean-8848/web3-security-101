// props.mjs — seg3 自补的拟物小件（与 kit 同一投影）。kit / kit-ext 不改，只 import。
import { at, Wp, f, f4, pts, box, rbox, cyl, M, mat, faceTop, faceV, faceU, frameV, matStr, contactShadow, CE, U, V, darken } from "../../../kit/iso.mjs";

const MONO = `font-family="JetBrains Mono, monospace"`;
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const TOP = faceTop({ u: 0, v: 0 }, 0, 0, 0);

/** 路面：浅色路面 + 虚线中线，沿 u（u0..u1），中线 v，半宽 half */
export function road(id, u0, u1, v, half) {
  return `<g id="${id}" transform="${TOP}"><rect x="${u0}" y="${v - half}" width="${u1 - u0}" height="${2 * half}" fill="#f8f6f1" stroke="#d6cfc1" stroke-width="5"/>
    <path d="M${u0 + 30} ${v}H${u1 - 30}" stroke="#d3ccbf" stroke-width="7" stroke-dasharray="70 60"/></g>`;
}
/** 小路：任意矩形（u0..u1, v0..v1）路面 */
export function walkway(id, u0, u1, v0, v1) {
  return `<g id="${id}" transform="${TOP}"><rect x="${u0}" y="${v0}" width="${u1 - u0}" height="${v1 - v0}" fill="#f8f6f1" stroke="#d6cfc1" stroke-width="4"/></g>`;
}

/** 立着的信封（交易），青蓝描边 = 本段主角；结构与 kit-ext letter 相同，带 data-px/py 供 KITX.walk */
export function txLetter(id, o, opts = {}) {
  const W = opts.w ?? 84, H = opts.h ?? 54, lift = opts.lift ?? 12, st = "#1d93ba", fill = "#eaf7fb";
  const m = frameV(o, -W / 2, 0, lift + H);
  let s = `<g transform="${faceTop(o, 0, 0, 0)}"><ellipse cx="0" cy="0" rx="${W * 0.5}" ry="12" fill="url(#shadowG)"/></g>`;
  for (let i = 4; i >= 1; i--) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(m), `<rect x="0" y="0" width="${W}" height="${H}" rx="4" fill="#9fd3e4"/>`)}</g>`;
  s += G_(matStr(m), `<rect x="0" y="0" width="${W}" height="${H}" rx="4" fill="${fill}" stroke="${st}" stroke-width="3.4"/><path d="M3 4L${W / 2} ${H * 0.58}L${W - 3} 4" fill="none" stroke="${st}" stroke-width="3.2" stroke-linejoin="round"/>
    <rect x="${W - 17}" y="${H - 16}" width="12" height="11" rx="1.5" fill="#1d93ba"/>`);
  const g = at(o);
  return { svg: `<g id="${id}" data-px="${f(g[0])}" data-py="${f(g[1])}" opacity="0">${s}</g>`, anchors: { top: at(o, 0, 0, lift + H + 24), ground: g } };
}

/** 封好的区块箱（与 sorter 末端的区块箱同款），可整体 walk */
export function crate(id, o, label = "#N") {
  const bm = { f: "#5cc0e0", s: "#3a9ec2", t: "#9ad9ee", st: "#1f7896" }, cs = 48, ch = 70;
  let s = contactShadow(o, 70, 56);
  s += rbox(o, -cs, cs, -cs, cs, 0, ch, 9, bm, { sw: 2, topFill: bm.t });
  s += rbox(o, -cs - 3, cs + 3, -cs - 3, cs + 3, ch, ch + 8, 9, mat("#2f9fc4", { st: "#155e77" }), { sw: 1.6 });
  s += G_(faceV(o, -cs + 10, cs, ch - 8), `<rect x="0" y="0" width="${2 * cs - 20}" height="20" rx="4" fill="#ffffff" opacity="0.92"/><text x="${cs - 10}" y="15" ${MONO} font-size="14" font-weight="800" fill="#17809f" text-anchor="middle">${label}</text>`);
  const g = at(o);
  return { svg: `<g id="${id}" data-px="${f(g[0])}" data-py="${f(g[1])}" opacity="0">${s}</g>`, anchors: { top: at(o, 0, 0, ch + 60) } };
}

/** 红色虚线圈（世界画布平面里的椭圆），中心 P */
export function ring(id, P, rx, ry, color = "#e0453a") {
  return `<g id="${id}" opacity="0"><ellipse cx="${f(P[0])}" cy="${f(P[1])}" rx="${rx}" ry="${ry}" fill="rgba(224,69,58,0.05)" stroke="${color}" stroke-width="6" stroke-dasharray="18 12"/></g>`;
}
/** 跨越边界的小箭头：青蓝（可信一侧）→ 红（不可信一侧）。P 是圈上的点，dir 是单位方向（屏幕） */
export function crossArrow(id, P, dir, len = 120) {
  const [dx, dy] = dir, a = [P[0] - dx * len * 0.5, P[1] - dy * len * 0.5], b = [P[0] + dx * len * 0.5, P[1] + dy * len * 0.5];
  const nx = -dy, ny = dx, h = 22;
  const head = [[b[0] + dx * h, b[1] + dy * h], [b[0] + nx * h * 0.7, b[1] + ny * h * 0.7], [b[0] - nx * h * 0.7, b[1] - ny * h * 0.7]];
  return `<g id="${id}" opacity="0"><path d="M${pts([a])}L${pts([P])}" stroke="#2aa3c9" stroke-width="12" stroke-linecap="round"/>
    <path d="M${pts([P])}L${pts([b])}" stroke="#e0453a" stroke-width="12" stroke-linecap="round"/><polygon points="${pts(head)}" fill="#e0453a"/></g>`;
}

/** 地面切开的一层（路面下的土层截面）：只画 −u 面和 +v 面 */
export function soil(id, S) {
  const o = { u: 0, v: 0 }, A = (u, v, z) => at(o, u, v, z);
  const layers = [["#d8cdb8", 0, 0.35], ["#c9b99c", 0.35, 0.7], ["#b9a582", 0.7, 1]];
  let s = "";
  for (const [c, a, b] of layers) {
    const z0 = -S.z * a, z1 = -S.z * b;
    s += `<polygon points="${pts([A(S.u0, S.v0, z0), A(S.u0, S.v1, z0), A(S.u0, S.v1, z1), A(S.u0, S.v0, z1)])}" fill="${c}"/>`;
    s += `<polygon points="${pts([A(S.u0, S.v1, z0), A(S.u1, S.v1, z0), A(S.u1, S.v1, z1), A(S.u0, S.v1, z1)])}" fill="${darken(c, 0.08)}"/>`;
  }
  s += `<path d="M${pts([A(S.u0, S.v0, 0)])}L${pts([A(S.u0, S.v0, -S.z)])}L${pts([A(S.u0, S.v1, -S.z)])}L${pts([A(S.u1, S.v1, -S.z)])}L${pts([A(S.u1, S.v1, 0)])}M${pts([A(S.u0, S.v1, 0)])}L${pts([A(S.u0, S.v1, -S.z)])}" fill="none" stroke="#8a7a5f" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<path d="M${pts([A(S.u0, S.v0, 0)])}L${pts([A(S.u0, S.v1, 0)])}L${pts([A(S.u1, S.v1, 0)])}" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="16 10"/>`;
  return `<g id="${id}" opacity="0">${s}</g>`;
}
/** 底层平台：一块下沉 dz 的地台（顶面网格 + 侧面） */
export function basePlatform(id, B, dz) {
  const o = { u: 0, v: 0 }, A = (u, v, z) => at(o, u, v, z), z1 = -dz, z0 = -dz - 22;
  let s = box(o, B.u0, B.u1, B.v0, B.v1, z0, z1, { f: "#e2dccf", s: "#cfc7b6", t: "#ebe6dc", st: "#a99f8c" }, 2);
  let g = "";
  for (let u = Math.ceil(B.u0 / 80) * 80; u <= B.u1; u += 80) g += `M${pts([A(u, B.v0, z1)])}L${pts([A(u, B.v1, z1)])}`;
  for (let v = Math.ceil(B.v0 / 80) * 80; v <= B.v1; v += 80) g += `M${pts([A(B.u0, v, z1)])}L${pts([A(B.u1, v, z1)])}`;
  s += `<path d="${g}" stroke="#d9d2c4" stroke-width="2" fill="none"/>`;
  return `<g id="${id}" opacity="0">${s}</g>`;
}
/** 竖直虚线（路面 → 底层），世界点 (u,v) 从 z0 到 z1 */
export function vline(o, z0, z1, color = "#b9b0a0") {
  return `<path d="M${pts([at(o, 0, 0, z0)])}L${pts([at(o, 0, 0, z1)])}" stroke="${color}" stroke-width="4" stroke-dasharray="10 10" fill="none"/>`;
}
/** 把一段物件 SVG 整体下沉 dz（世界 z） */
export const sink = (svg, dz) => `<g transform="translate(0,${f(dz * CE)})">${svg}</g>`;

/** 小人手里的电话（社会工程）：贴在头侧的话筒 + 声波 */
export function phoneAt(id, head, k = 1) {
  const [x, y] = head;
  return `<g id="${id}"><g transform="translate(${f(x + 22 * k)},${f(y + 4 * k)}) rotate(28)"><rect x="-9" y="-26" width="18" height="52" rx="7" fill="#1c1c1c" stroke="#000" stroke-width="1.4"/><rect x="-6" y="-21" width="12" height="34" rx="3" fill="#5cc0e0"/></g>
    <path d="M${f(x + 46 * k)} ${f(y - 22 * k)}q12 14 0 30M${f(x + 58 * k)} ${f(y - 32 * k)}q20 24 0 50" fill="none" stroke="#e0453a" stroke-width="4" stroke-linecap="round"/></g>`;
}

/** 红色手套：拨动表盘指针（预言机被操纵），手指指向 P */
export function glove(id, P) {
  const [x, y] = P;
  return `<g id="${id}" opacity="0"><g transform="translate(${f(x)},${f(y)})">
    <path d="M10 6C26 0 46 -2 66 4L70 30C52 40 30 42 14 36C4 32 2 12 10 6Z" fill="#e0453a" stroke="#8f2620" stroke-width="3" stroke-linejoin="round"/>
    <path d="M10 8L-34 -10C-42 -13 -46 -3 -38 2L4 22Z" fill="#e8574c" stroke="#8f2620" stroke-width="3" stroke-linejoin="round"/>
    <path d="M24 34C24 44 34 48 40 40" fill="none" stroke="#8f2620" stroke-width="3"/>
    <rect x="66" y="0" width="22" height="34" rx="5" fill="#a8322a" stroke="#6a1a15" stroke-width="2.4"/></g></g>`;
}

/** 一摞硬币（越来越鼓）：每枚 #id-i，依次显现 */
export function coinStack(id, o, n = 8) {
  const g = M.gold;
  let s = contactShadow(o, 44, 30);
  for (let i = 0; i < n; i++) {
    const du = (i % 2) * 6 - 3, z = i * 9;
    s += `<g id="${id}-${i}" opacity="0">${cyl(o, du, 0, 24, z, z + 9, g, { seg: 24, sw: 1.3 })}</g>`;
  }
  return `<g id="${id}">${s}</g>`;
}

/** 维修门挂锁位置的红色虚线框（缺少检查） */
export function dashBox(id, P, w, h) {
  return `<g id="${id}" opacity="0"><rect x="${f(P[0] - w / 2)}" y="${f(P[1] - h / 2)}" width="${w}" height="${h}" rx="6" fill="rgba(224,69,58,0.06)" stroke="#e0453a" stroke-width="4" stroke-dasharray="9 6"/></g>`;
}

/** 世界画布里的细连线（挂牌 → 物件）：青蓝细虚线，可用 stroke-dashoffset 画出 */
export function thinLine(id, P0, P1, bow = -80, color = "#2aa3c9") {
  const mx = (P0[0] + P1[0]) / 2, my = (P0[1] + P1[1]) / 2 + bow;
  const d = `M${pts([P0])}Q${pts([[mx, my]])} ${pts([P1])}`;
  const L = Math.ceil(Math.hypot(P1[0] - P0[0], P1[1] - P0[1]) * 1.2 + Math.abs(bow));
  return { svg: `<g id="${id}" opacity="0"><defs><mask id="${id}-mk" maskUnits="userSpaceOnUse" x="-20000" y="-20000" width="40000" height="40000"><path id="${id}-m" d="${d}" fill="none" stroke="#fff" stroke-width="20" stroke-dasharray="${L} ${L}" stroke-dashoffset="${L}"/></mask></defs>
    <path d="${d}" fill="none" stroke="${color}" stroke-width="5" stroke-dasharray="12 9" stroke-linecap="round" mask="url(#${id}-mk)"/><circle cx="${f(P1[0])}" cy="${f(P1[1])}" r="12" fill="none" stroke="${color}" stroke-width="5"/><circle cx="${f(P0[0])}" cy="${f(P0[1])}" r="7" fill="${color}"/></g>`, L };
}
