// props.mjs — ep01/seg2 自补的拟物小件（与 kit 同一投影）。kit / kit-ext 不改，只 import。
import { at, f, pts, box, rbox, cyl, M, mat, faceTop, faceV, faceU, contactShadow, glow, darken, lighten, wireSvg, badgeSvg, CE } from "../../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
const G_ = (tr, inner) => `<g transform="${tr}">${inner}</g>`;
const root = (id, o, inner, extra = "") => { const [ox, oy] = at(o); return `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}" ${extra}>${inner}</g>`; };

/** 交易所小楼：浅灰石材，正面玻璃门 + 两层窗，顶上招牌 */
export function exchange(id, o) {
  const wall = { f: "#e7e2d8", s: "#d3cdc0", t: "#f4f1ea", st: "#6b665c" };
  let s = contactShadow(o, 200, 160);
  s += box(o, -150, 150, -110, 110, 0, 14, M.ink, 1.2);
  s += box(o, -140, 140, -100, 100, 14, 290, wall, 2);
  s += box(o, -148, 148, -108, 108, 290, 304, mat("#3b3e44"), 1.4);
  // +v face: windows + door
  let fv = "";
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) fv += `<rect x="${22 + c * 64}" y="${24 + r * 74}" width="46" height="52" rx="3" fill="#bfe3ef" stroke="#6b665c" stroke-width="2"/><path d="M${26 + c * 64} ${30 + r * 74}l14 0" stroke="#ffffff" stroke-width="3" opacity="0.8"/>`;
  fv += `<rect x="104" y="176" width="72" height="100" rx="3" fill="#2f3338" stroke="#1c1c1c" stroke-width="2"/><path d="M140 176V276" stroke="#8d939b" stroke-width="2"/>`;
  fv += `<rect x="70" y="160" width="140" height="10" fill="#1d93ba"/>`;
  s += G_(faceV(o, -140, 100, 290), fv);
  // −u face: windows
  let fu = "";
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) fu += `<rect x="${24 + c * 56}" y="${24 + r * 80}" width="36" height="54" rx="3" fill="#a9d6e6" stroke="#6b665c" stroke-width="2"/>`;
  s += G_(faceU(o, -140, -100, 290), fu);
  // roof sign
  s += box(o, -60, -54, -6, 0, 304, 340, M.dark, 1) + box(o, 54, 60, -6, 0, 304, 340, M.dark, 1);
  s += box(o, -110, 110, -8, 2, 340, 396, M.white, 1.6);
  s += G_(faceV(o, -110, 2, 396), `<rect x="6" y="6" width="208" height="44" rx="4" fill="none" stroke="#1d93ba" stroke-width="3"/><text x="110" y="38" ${MONO} font-size="26" font-weight="800" fill="#1c1c1c" text-anchor="middle">EXCHANGE</text>`);
  return { svg: root(id, o, s), anchors: { top: at(o, 0, 0, 450), front: at(o, 0, 100, 150), door: at(o, 0, 100, 60), center: at(o, 0, 0, 150) } };
}

/** 小岗亭（客服窗口）：白色亭身、青蓝顶、窗口里空着、挂"CLOSED"小牌 */
export function booth(id, o) {
  let s = contactShadow(o, 110, 90);
  s += box(o, -70, 70, -60, 60, 0, 210, M.white, 1.8);
  s += box(o, -82, 82, -72, 72, 210, 230, mat("#1d93ba"), 1.6);
  s += G_(faceV(o, -70, 60, 210), `<rect x="18" y="26" width="104" height="82" rx="4" fill="#41464d" stroke="#1c1c1c" stroke-width="2"/><rect x="14" y="108" width="112" height="12" fill="#c9a77a" stroke="#6e5434" stroke-width="1.5"/>` +
    `<path d="M40 26L56 50M84 26L70 50" stroke="#9aa0a7" stroke-width="2"/><rect x="34" y="50" width="76" height="34" rx="3" fill="#ffffff" stroke="#6b665c" stroke-width="2"/><text x="72" y="74" ${MONO} font-size="17" font-weight="800" fill="#6b665c" text-anchor="middle">CLOSED</text>`);
  s += G_(faceU(o, -70, -60, 210), `<rect x="20" y="30" width="80" height="60" rx="4" fill="#d6d0c4"/>`);
  return { svg: root(id, o, s), anchors: { top: at(o, 0, 0, 280), window: at(o, 0, 60, 150) } };
}

/** KYC 柜台：木台面、白台身、玻璃隔板，顶部小门牌（字只是质感） */
export function kycDesk(id, o) {
  const wood = { f: "#c9a77a", s: "#a8865b", t: "#dcc29c", st: "#6e5434" };
  let s = contactShadow(o, 150, 70);
  s += box(o, -110, 110, -36, 36, 0, 90, M.white, 1.8);
  s += G_(faceV(o, -110, 36, 90), `<rect x="10" y="12" width="200" height="10" fill="#1d93ba"/>`);
  s += box(o, -118, 118, -42, 42, 90, 100, wood, 1.6);
  s += `<polygon points="${pts([at(o, -100, -10, 100), at(o, 100, -10, 100), at(o, 100, -10, 200), at(o, -100, -10, 200)])}" fill="rgba(208,234,244,0.45)" stroke="#8d939b" stroke-width="3"/>`;
  s += box(o, -60, 60, -14, -8, 200, 236, M.white, 1.4);
  s += G_(faceV(o, -60, -8, 236), `<rect x="4" y="4" width="112" height="28" fill="none" stroke="#1d93ba" stroke-width="2"/><text x="60" y="26" ${MONO} font-size="20" font-weight="800" fill="#1c1c1c" text-anchor="middle">KYC</text>`);
  return { svg: root(id, o, s), anchors: { top: at(o, 0, 0, 290), front: at(o, 0, 42, 110) } };
}

/** 剖开的地下一层：地面开口 + 内壁 + 底板。返回 back（先画）/ front（物件之后画的唇边）与开口裁剪路径 */
export function pit(id, o, u0, u1, v0, v1, depth) {
  const P = (u, v, z) => at(o, u, v, z);
  const soil = "#cdbfa6", soilD = "#b7a68a";
  let back = `<polygon points="${pts([P(u0, v0, -depth), P(u1, v0, -depth), P(u1, v1, -depth), P(u0, v1, -depth)])}" fill="#d9cfbd" stroke="#8a7a5f" stroke-width="2"/>`;
  // inner wall at v = v0 (faces +v) and at u = u1 (faces −u) are visible
  back += `<polygon points="${pts([P(u0, v0, 0), P(u1, v0, 0), P(u1, v0, -depth), P(u0, v0, -depth)])}" fill="${soilD}" stroke="#8a7a5f" stroke-width="2"/>`;
  back += `<polygon points="${pts([P(u1, v0, 0), P(u1, v1, 0), P(u1, v1, -depth), P(u1, v0, -depth)])}" fill="${soil}" stroke="#8a7a5f" stroke-width="2"/>`;
  // floor tiles
  for (let k = 1; k < 4; k++) { const u = u0 + ((u1 - u0) * k) / 4; back += `<polyline points="${pts([P(u, v0, -depth), P(u, v1, -depth)])}" fill="none" stroke="#c4b79f" stroke-width="2"/>`; }
  const lip = `<polygon points="${pts([P(u0, v0, 0), P(u1, v0, 0), P(u1, v1, 0), P(u0, v1, 0)])}" fill="none" stroke="#6e5f48" stroke-width="5" stroke-linejoin="round"/>` +
    `<polygon points="${pts([P(u0, v0, 0), P(u1, v0, 0), P(u1, v1, 0), P(u0, v1, 0)])}" fill="none" stroke="#e0453a" stroke-width="0" />`;
  const clip = `<clipPath id="${id}-clip"><polygon points="${pts([P(u0, v0, 0), P(u1, v0, 0), P(u1, v1, 0), P(u0, v1, 0)])}"/></clipPath>`;
  return { back, lip, clip, clipId: `${id}-clip`, ground: (u, v) => P(u, v, -depth) };
}

/** 一群人举手：三个小人（简化）用于"社会共识" — 用 kit person 生成后由调用方摆放，这里只给举起的手臂 */
export function raisedArm(o, k, side = 1) {
  // a thin raised arm from the shoulder (person scale k, shoulder ≈ 128k high, 33k sideways along screen-x)
  const [x0, y0] = at(o, side * 27 * k * 0.82, side * 27 * k * 0.57, 128 * k);
  return `<path d="M${f(x0)} ${f(y0)}l${f(side * 10 * k)} ${f(-70 * k)}" stroke="#3b3e44" stroke-width="${f(16 * k)}" stroke-linecap="round"/><circle cx="${f(x0 + side * 10 * k)}" cy="${f(y0 - 74 * k)}" r="${f(10 * k)}" fill="#55595f" stroke="#1c1c1c" stroke-width="1.4"/>`;
}

/** 平放的一枚金币（world） */
export function coinFlat(o, z = 0, r = 18, red = false) {
  const g = red ? { f: "#e8574c", s: "#c23a30", t: "#f6b0a8", st: "#8f2620" } : { f: "#d6a64a", s: "#b58630", t: "#ecc778", st: "#7a5716" };
  return cyl(o, 0, 0, r, z, z + 6, g, { seg: 24, sw: 1.4 }) + `<g transform="${faceTop(o, 0, 0, z + 6)}"><circle cx="0" cy="0" r="${f(r * 0.62)}" fill="none" stroke="${g.s}" stroke-width="2"/></g>`;
}

/** 地面上的青蓝虚线矩形框（"一笔交易"） */
export function groundFrame(id, o, u0, u1, v0, v1, color = "#2aa3c9") {
  const L = 2 * ((u1 - u0) + (v1 - v0));
  return `<g transform="${faceTop(o, 0, 0, 0)}"><rect id="${id}" x="${u0}" y="${v0}" width="${u1 - u0}" height="${v1 - v0}" rx="18" fill="rgba(42,163,201,0.07)" stroke="${color}" stroke-width="9" stroke-dasharray="26 16" opacity="0"/></g>`;
}
