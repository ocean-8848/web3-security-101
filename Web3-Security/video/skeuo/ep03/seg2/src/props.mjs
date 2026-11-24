// props.mjs — seg2 自补的拟物小件（与 kit 同一投影）。kit / kit-ext 未改动。
import { at, Wp, f, pts, box, rbox, cyl, flat, line3, M, mat, faceTop, faceV, matStr, U, V, CE, contactShadow, frameTop, darken, lighten } from "../../../kit/iso.mjs";
import { envelope } from "../../../kit/objects.mjs";

const W0 = { u: 0, v: 0 };
const TOP = faceTop(W0, 0, 0, 0);
const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;

/** 大道：浅色路面 + 虚线中线 */
export function road(R) {
  return `<g id="road" transform="${TOP}"><rect x="${R.u0}" y="${R.v0}" width="${R.u1 - R.u0}" height="${R.v1 - R.v0}" fill="#f8f6f1" stroke="#d6cfc1" stroke-width="5"/>
    <path d="M${R.u0 + 30} ${R.mid}H${R.u1 - 30}" stroke="#d3ccbf" stroke-width="7" stroke-dasharray="70 60"/></g>`;
}

/** 路面箭头（沿 u，v 固定）：杆 #id-s 用 dashoffset 画出，头 #id-h 弹出 */
export function groundArrow(id, a, b, v, color = "#2aa3c9") {
  const L = b - a - 40;
  return `<g id="${id}" transform="${TOP}"><path id="${id}-s" d="M${a} ${v}H${b - 40}" stroke="${color}" stroke-width="16" stroke-linecap="round" fill="none" stroke-dasharray="${L} ${L}" stroke-dashoffset="${L}"/>
    <path id="${id}-h" d="M${b - 46} ${v - 30}L${b} ${v}L${b - 46} ${v + 30}Z" fill="${color}" opacity="0"/></g>`;
}

/** 轨道：浅槽 + 两条钢轨 + 枕木，沿 u 从 u0 到 u1，中线 v */
export function track(id, u0, u1, v) {
  let s = `<g id="${id}" opacity="0"><g transform="${TOP}"><rect x="${u0}" y="${v - 24}" width="${u1 - u0}" height="48" rx="6" fill="#e6e0d4" stroke="#cfc7b8" stroke-width="2"/>`;
  for (let x = u0 + 14; x < u1 - 8; x += 34) s += `<rect x="${x}" y="${v - 20}" width="14" height="40" rx="2" fill="#b9a585" stroke="#8a7a5f" stroke-width="1"/>`;
  s += `<path d="M${u0 + 4} ${v - 11}H${u1 - 4}M${u0 + 4} ${v + 11}H${u1 - 4}" stroke="#7d828a" stroke-width="5"/><path d="M${u0 + 4} ${v - 12.5}H${u1 - 4}M${u0 + 4} ${v + 9.5}H${u1 - 4}" stroke="#e6e8ea" stroke-width="1.6"/>`;
  s += `<rect id="${id}-hl" x="${u0}" y="${v - 24}" width="${u1 - u0}" height="48" rx="6" fill="rgba(42,163,201,0.18)" stroke="#2aa3c9" stroke-width="4" opacity="0"/></g></g>`;
  return s;
}

/** 平放的信封 + 顶面 "calldata" 字样；外层 #id 用于整体移动（KITX.fly），#id-env 是 kit 信封 */
export function letter(id, o, z = 0, opts = {}) {
  const e = envelope(o, { id: id + "-env", w: 130, h: 86, state: opts.red ? "attacker" : "normal" });
  const tag = `<g transform="${faceTop(o, -46, 8, 4)}"><rect x="0" y="0" width="92" height="22" rx="4" fill="${opts.red ? "#e0453a" : "#1d93ba"}"/><text x="46" y="16" ${MONO} font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">calldata</text></g>`;
  return `<g id="${id}" opacity="0"><g transform="translate(0,${f(-z * CE)})">${e.svg}${tag}</g></g>`;
}

/** 一枚等距硬币（金色，点阵示意） */
export function coin(o) {
  const g = { f: "#d6a64a", s: "#b58630", t: "#ecc778", st: "#7a5716" };
  return cyl(o, 0, 0, 20, 0, 8, g, { seg: 24, sw: 1.4 }) + `<g transform="${faceTop(o, 0, 0, 8)}"><circle cx="0" cy="0" r="12" fill="none" stroke="#b58630" stroke-width="2"/></g>`;
}

/** 地面圆环（address(this) 的青蓝描边） */
export function ring(id, o, r) {
  const L = Math.ceil(2 * Math.PI * r);
  return `<g transform="${faceTop(o, 0, 0, 0)}"><circle id="${id}" cx="0" cy="0" r="${r}" fill="rgba(42,163,201,0.08)" stroke="#2aa3c9" stroke-width="10" stroke-dasharray="${L} ${L}" stroke-dashoffset="${L}" fill-opacity="0"/></g>`;
}

/** 政务大厅的柜台（唯一的窗口）：木台面 + 白色台身 + 玻璃隔板 + 顶部门牌 */
export function counter(id, o) {
  const [ox, oy] = at(o);
  const wood = { f: "#c9a77a", s: "#a8865b", t: "#dcc29c", st: "#6e5434" };
  let s = contactShadow(o, 200, 90);
  s += box(o, -150, 150, -40, 40, 0, 96, M.white, 1.8);
  s += `<g transform="${faceV(o, -150, 40, 96)}"><rect x="10" y="14" width="280" height="10" fill="#2aa3c9"/>${[0, 1, 2].map((k) => `<rect x="${20 + k * 92}" y="36" width="76" height="46" rx="4" fill="none" stroke="#d6d0c4" stroke-width="2.4"/>`).join("")}</g>`;
  s += box(o, -160, 160, -48, 48, 96, 106, wood, 1.6);
  // glass partition with a speaking hole
  s += `<polygon points="${pts([at(o, -140, -10, 106), at(o, 140, -10, 106), at(o, 140, -10, 230), at(o, -140, -10, 230)])}" fill="rgba(208,234,244,0.45)" stroke="#8d939b" stroke-width="3"/>`;
  s += `<g transform="${faceV(o, -140, -10, 230)}"><rect x="110" y="96" width="60" height="28" rx="14" fill="rgba(255,255,255,0.6)" stroke="#8d939b" stroke-width="2"/><path d="M20 20L60 60M30 12L70 52" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.7"/></g>`;
  // sign on two posts
  s += box(o, -64, -58, -12, -8, 230, 262, M.dark, 1) + box(o, 58, 64, -12, -8, 230, 262, M.dark, 1);
  s += box(o, -96, 96, -14, -6, 262, 314, M.white, 1.6);
  s += `<g transform="${faceV(o, -96, -6, 314)}"><rect x="5" y="5" width="182" height="42" fill="none" stroke="#2aa3c9" stroke-width="2"/><text x="96" y="38" ${FONT} font-size="30" font-weight="900" fill="#1c1c1c" text-anchor="middle">窗口</text></g>`;
  return { svg: `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}">${s}</g>`, anchors: { top: at(o, 0, -10, 360), front: at(o, 0, 48, 100) } };
}

/** 隔离带：两根立柱 + 一条墨色带子 */
export function stanchions(id, A, B) {
  const post = (o) => cyl(o, 0, 0, 22, 0, 6, M.ink, { seg: 20, sw: 1.2 }) + cyl(o, 0, 0, 7, 6, 96, M.steelLight ?? M.steel, { seg: 14, sw: 1.2 }) + cyl(o, 0, 0, 11, 96, 108, M.ink, { seg: 16, sw: 1.2 });
  const [ox, oy] = at(A);
  const belt = `<polygon points="${pts([at(A, 0, 0, 98), at(B, 0, 0, 98), at(B, 0, 0, 84), at(A, 0, 0, 84)])}" fill="#3b3e44" stroke="#1c1c1c" stroke-width="1.4"/>`;
  return `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}">${post(A)}${belt}${post(B)}</g>`;
}

/** 办事员手里的材料：一张立着的小纸（相对人物原点） */
export function heldPaper(o, k = 0.7) {
  return `<g transform="${faceV(o, 18 * k, 30 * k, 120 * k)}"><rect x="0" y="0" width="${36 * k}" height="${48 * k}" rx="2" fill="#ffffff" stroke="#6b665c" stroke-width="2"/><path d="M${6 * k} ${12 * k}H${30 * k}M${6 * k} ${22 * k}H${30 * k}M${6 * k} ${32 * k}H${22 * k}" stroke="#b8b0a1" stroke-width="2"/></g>`;
}
