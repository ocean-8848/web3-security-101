// props.mjs — seg3 自补的小物件（同一投影，复用 kit/iso.mjs 的几何）
import { at, f, pts, box, faceV, faceU, M, mat, CE, contactShadow, line3, darken } from "../../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;

/** 路边编号牌：木柱 + 正面朝 +v 的白色方牌，中间黑底圆号 */
export function numSign(o, { id = "ns", n = "1" } = {}) {
  const [ox, oy] = at(o);
  const wood = M.wood, woodD = { f: "#a06e40", s: "#7f5128", t: "#b98454", st: "#5a3818" };
  let s = contactShadow(o, 70, 40);
  s += box(o, -28, 28, -22, 22, 0, 10, M.dark, 1.2);
  s += box(o, -9, 9, -8, 8, 10, 170, woodD, 1.4);
  s += box(o, -84, 84, 8, 18, 150, 300, wood, 1.8);
  s += `<g transform="${faceV(o, -84, 18, 300)}">
    <rect x="10" y="10" width="148" height="130" rx="6" fill="#fffdf8" stroke="#cfc7b8" stroke-width="2"/>
    <circle cx="84" cy="75" r="46" fill="#1c1c1c"/>
    <text x="84" y="96" text-anchor="middle" ${FONT} font-size="60" font-weight="900" fill="#ffffff">${n}</text></g>`;
  return { svg: `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}"><g id="${id}-solid">${s}</g></g>`, anchors: { top: at(o, 0, 18, 330), plate: at(o, 0, 18, 225), ground: at(o) } };
}

/** 抽屉柜往上的"无限延伸"：虚线轮廓 + 抽屉分隔线，越往上越淡（mask） */
export function ghostColumn(o, { id = "ghost", u0 = -192, u1 = 192, v0 = -75, v1 = 75, z0 = 436, z1 = 2700, dh = 58 } = {}) {
  const W = u1 - u0, D = v1 - v0, H = z1 - z0;
  const [, yb] = at(o, 0, v1, z0), [, yt] = at(o, 0, v1, z1);
  const [ox, oy] = at(o, 0, v1, z0);
  let inner = `<rect x="0" y="0" width="${W}" height="${H}" fill="rgba(42,163,201,0.07)" stroke="#2aa3c9" stroke-width="3" stroke-dasharray="14 10"/>`;
  for (let z = dh; z < H; z += dh) inner += `<path d="M14 ${H - z}H${W - 14}" stroke="#2aa3c9" stroke-width="2" stroke-dasharray="8 10" opacity="0.7"/>`;
  let side = `<rect x="0" y="0" width="${D}" height="${H}" fill="rgba(42,163,201,0.04)" stroke="#2aa3c9" stroke-width="3" stroke-dasharray="14 10"/>`;
  const svg = `<defs><linearGradient id="${id}-gr" gradientUnits="userSpaceOnUse" x1="0" y1="${f(yb)}" x2="0" y2="${f(yt)}">
      <stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="0.35" stop-color="#fff" stop-opacity="0.45"/><stop offset="1" stop-color="#fff" stop-opacity="0.12"/></linearGradient>
    <mask id="${id}-mk" maskUnits="userSpaceOnUse" x="-20000" y="-20000" width="40000" height="40000"><rect x="-20000" y="-20000" width="40000" height="40000" fill="url(#${id}-gr)"/></mask></defs>
    <g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}" opacity="0"><g mask="url(#${id}-mk)">
      <g transform="${faceU(o, u0, v0, z1)}">${side}</g>
      <g transform="${faceV(o, u0, v1, z1)}">${inner}</g></g></g>`;
  return { svg };
}

/** 合约机器 −u 侧到抽屉柜 +u 侧的传送管（直管，沿 −u） */
export function pipeU(o, { id = "pipe", u0, u1, v, z = 110, atk = false } = {}) {
  const P = [[u0, v, z], [u1, v, z]];
  let s = line3(o, P, "#2b2d31", 28) + line3(o, P, atk ? "#c9463c" : "#9aa0a8", 21) + line3(o, P.map(([a, b, c]) => [a, b, c + 6]), "#e6e8ea", 5);
  for (let u = u0 - 60; u > u1 + 20; u -= 70) {
    const c = at(o, u, v, z);
    s += `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="15" ry="16" fill="#c3c8ce" stroke="#2b2d31" stroke-width="1.8"/>`;
  }
  // 落地支架
  for (let u = u0 - 40; u > u1 + 30; u -= 120) s = box(o, u - 6, u + 6, v - 6, v + 6, 0, z - 12, M.steel, 1.2) + box(o, u - 14, u + 14, v - 12, v + 12, 0, 5, M.ink, 1) + s;
  return `<g id="${id}">${s}</g>`;
}

/** 地面上的细虚线栏（不占槽的"拦线"） */
export function groundLine(o, { id = "gl", u0, u1, v, color = "#1d93ba" } = {}) {
  const a = at(o, u0, v, 0), b = at(o, u1, v, 0);
  let posts = "";
  for (const u of [u0, u1]) posts += box(o, u - 5, u + 5, v - 5, v + 5, 0, 46, mat(color), 1);
  const a2 = at(o, u0, v, 40), b2 = at(o, u1, v, 40);
  return `<g id="${id}" opacity="0"><path d="M${pts([a])}L${pts([b])}" stroke="${color}" stroke-width="5" stroke-dasharray="14 10" opacity="0.6"/>${posts}
    <path d="M${pts([a2])}L${pts([b2])}" stroke="${color}" stroke-width="4" stroke-dasharray="10 8"/></g>`;
}

/** 竖直标尺（两端短横） */
export function vRuler(p0, p1, { id = "vr", color = "#1f9d55" } = {}) {
  const L = Math.ceil(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]));
  return `<g id="${id}"><path id="${id}-p" d="M${pts([p0])}L${pts([p1])}" stroke="${color}" stroke-width="5" stroke-dasharray="${L} ${L}" stroke-dashoffset="${L}" data-l="${L}"/>
    <g id="${id}-ends" opacity="0"><path d="M${f(p0[0] - 22)} ${f(p0[1])}H${f(p0[0] + 22)}M${f(p1[0] - 22)} ${f(p1[1])}H${f(p1[0] + 22)}" stroke="${color}" stroke-width="5" stroke-linecap="round"/></g></g>`;
}

export const liftY = (z) => -z * CE;
export { darken };
