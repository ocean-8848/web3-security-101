// props.mjs — seg4 自补的小物件（同一投影，复用 kit/iso.mjs 的几何）
import { at, f, pts, box, rbox, faceV, faceTop, M, mat, V, CE, contactShadow, line3, flat, circlePlan, darken, lighten } from "../../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;
const STONE = { f: "#e3ddd1", s: "#d2c9b9", t: "#efeae0", st: "#8d857a" };
const grp = (id, o, inner, extra = "") => { const [ox, oy] = at(o); return `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}" ${extra}>${inner}</g>`; };

/** 长廊地台：一条长石台 */
export function platform(o, { u0, u1, v0 = -150, v1 = 150, h = 16 }) {
  let s = box(o, u0, u1, v0, v1, 0, h, STONE, 1.6);
  s += line3(o, [[u0 + 20, v1 - 22, h], [u1 - 20, v1 - 22, h]], "#d6cebf", 2);
  return `<g id="plat">${s}</g>`;
}

/** 年份立柱：石柱 + 柱头 */
export function pillar(o, { id, h = 110, small = false }) {
  const r = small ? 10 : 14, b = small ? 16 : 22;
  let s = contactShadow(o, 40, 26);
  s += box(o, -b, b, -b, b, 16, 26, STONE, 1.2);
  s += rbox(o, -r, r, -r, r, 26, 16 + h, 4, { f: "#ece6da", s: "#d8d0c1", t: "#f6f2ea", st: "#8d857a" }, { sw: 1.4 });
  s += box(o, -b + 2, b - 2, -b + 2, b - 2, 16 + h, 26 + h, STONE, 1.2);
  return { svg: grp(id, o, s), top: at(o, 0, 0, 36 + h) };
}

/**
 * 展板：两根钢腿 + 白色立板，正面（+v）画点阵。每个点 = 1 亿美元，每行 cols 个，自下而上。
 * dots: [{col,row,frac}]，row 0 = 最下一行。返回点的 id 列表（按填充顺序）。
 */
export const PITCH = 30, DR = 12, PAD = 12;
export function board(o, { id, rows, cols = 5, dots, z0 = 46, divider = null, groups = null, frame = "#cfc7b8" }) {
  const w = cols * PITCH + PAD * 2, h = rows * PITCH + PAD * 2, z1 = z0 + h;
  let s = contactShadow(o, w * 0.62, 34);
  for (const su of [-(w / 2 - 16), w / 2 - 16]) s += box(o, su - 5, su + 5, -5, 5, 16, z0, M.steel, 1.2) + box(o, su - 12, su + 12, -12, 12, 16, 22, M.dark, 1);
  s += box(o, -w / 2, w / 2, -6, 6, z0, z1, M.white, 1.6);
  let fc = `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="4" fill="#fffdf8" stroke="${frame}" stroke-width="3"/>`;
  const cx = (c) => PAD + c * PITCH + PITCH / 2, cy = (r) => h - PAD - r * PITCH - PITCH / 2;
  if (divider != null) fc += `<path d="M${PAD + divider * PITCH} ${PAD - 4}V${h - PAD + 4}" stroke="#a9a293" stroke-width="3"/>`;
  if (groups) groups.forEach((g, k) => {
    const yT = cy(g[1] - 1) - PITCH / 2, yB = cy(g[0]) + PITCH / 2;
    fc += `<g id="${id}-g-${k}" opacity="0"><rect x="${PAD - 5}" y="${f(yT + 2)}" width="${w - 2 * PAD + 10}" height="${f(yB - yT - 4)}" rx="8" fill="none" stroke="#1d93ba" stroke-width="3" stroke-dasharray="8 5"/></g>`;
  });
  const ids = [];
  dots.forEach((d, i) => {
    const did = `${id}-d-${i}`; ids.push(did);
    const x = cx(d.col), y = cy(d.row), fr = d.frac ?? 1;
    if (fr < 1) {
      fc += `<circle cx="${x}" cy="${y}" r="${DR}" fill="none" stroke="#c9c1b2" stroke-width="2.4" stroke-dasharray="4 3"/>`;
      fc += `<clipPath id="${did}-c"><rect x="${x - DR - 1}" y="${y - DR - 1}" width="${f((2 * DR + 2) * fr)}" height="${2 * DR + 2}"/></clipPath>`;
      fc += `<circle id="${did}" cx="${x}" cy="${y}" r="${DR}" fill="#e0453a" opacity="0" clip-path="url(#${did}-c)"/>`;
    } else fc += `<circle id="${did}" cx="${x}" cy="${y}" r="${DR}" fill="#e0453a" opacity="0"/>`;
  });
  s += `<g transform="${faceV(o, -w / 2, 6, z1)}">${fc}</g>`;
  const rowZ = (r) => z0 + PAD + r * PITCH; // world z of the bottom edge of row r
  return { svg: grp(id, o, s), ids, w, h, z1,
    anchors: { top: at(o, 0, 6, z1 + 8), left: at(o, -w / 2 - 8, 6, (z0 + z1) / 2), right: at(o, w / 2 + 8, 6, (z0 + z1) / 2), rowR: (r) => at(o, w / 2 + 8, 6, rowZ(r)), rowL: (r) => at(o, -w / 2 - 8, 6, rowZ(r)), mid: at(o, 0, 6, (z0 + z1) / 2) } };
}
/** n 个 1 亿美元 → 自下而上、每行 cols 个的点；小数部分是最后一个缺口点 */
export function dotList(value, cols = 5, startRow = 0, startCol = 0, width = cols) {
  const out = []; const full = Math.floor(value + 1e-9), frac = value - full;
  for (let i = 0; i < full; i++) out.push({ col: startCol + (i % width), row: startRow + Math.floor(i / width) });
  if (frac > 0.001) out.push({ col: startCol + (full % width), row: startRow + Math.floor(full / width), frac });
  return out;
}

/** 平放的扳手（钢） */
export function wrench(o, { id }) {
  const shape = (fill, st) => `<path d="M0 -9H128L140 -24H170L184 -10H160V10H184L170 24H140L128 9H0Q-10 0 0 -9Z" fill="${fill}" stroke="${st}" stroke-width="2" stroke-linejoin="round"/><circle cx="18" cy="0" r="4" fill="#efebe3" stroke="${st}" stroke-width="1.4"/>`;
  let s = contactShadow(o, 110, 46, 80, 0);
  for (let i = 6; i >= 1; i--) s += `<g transform="translate(0,${f(i * CE)})"><g transform="${faceTop(o, -10, 0, 6)}">${shape("#8d939b", "#4b4f56")}</g></g>`;
  s += `<g transform="${faceTop(o, -10, 0, 6)}">${shape("#c9cdd2", "#4b4f56")}<rect x="30" y="-3" width="90" height="3" rx="1.5" fill="#eef0f2"/></g>`;
  return { svg: grp(id, o, s), top: at(o, 80, 0, 60) };
}

/** 合上的手册（编译器 / 库）：青蓝封皮 + 白页 */
export function manualBook(o, { id }) {
  const cover = { f: "#2aa3c9", s: "#1d86a8", t: "#4fb8d8", st: "#155e77" };
  let s = contactShadow(o, 90, 70);
  s += box(o, -70, 70, -52, 52, 0, 6, cover, 1.4);
  s += box(o, -66, 66, -48, 50, 6, 34, { f: "#f7f3ea", s: "#e9e3d6", t: "#fbf8f1", st: "#9a9282" }, 1.2);
  for (let z = 10; z < 34; z += 5) s += line3(o, [[-64, 50, z], [64, 50, z]], "#d8d1c3", 1);
  s += box(o, -70, 70, -52, 52, 34, 40, cover, 1.4);
  s += box(o, -74, -64, -52, 52, 0, 40, { f: "#1d86a8", s: "#17708d", t: "#2aa3c9", st: "#155e77" }, 1.4);
  s += `<g transform="${faceTop(o, -50, -36, 40)}"><rect x="0" y="0" width="96" height="16" rx="3" fill="#ffffff" opacity="0.9"/><rect x="0" y="26" width="64" height="8" rx="3" fill="#bfe3ef"/><rect x="0" y="42" width="80" height="8" rx="3" fill="#bfe3ef"/></g>`;
  return { svg: grp(id, o, s), top: at(o, 0, 0, 90) };
}

/** 立着的硬币（正面朝 +v），沿竖线切成大小两块；右边小块可单独移动、变红 */
export function coinSplit(o, { id, R = 54, cutFrac = 0.62 }) {
  const T = 9, cut = 2 * R * cutFrac;
  const face = (fill, ring, st) => `<circle cx="${R}" cy="${R}" r="${R}" fill="${fill}" stroke="${st}" stroke-width="2.4"/><circle cx="${R}" cy="${R}" r="${R - 9}" fill="none" stroke="${ring}" stroke-width="3"/>` +
    `<path d="M${R - 22} ${R - 18}A26 26 0 0 1 ${R + 14} ${R - 26}" fill="none" stroke="#fff3c4" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`;
  const part = (pid, x0, x1, gold) => {
    let g = `<clipPath id="${pid}-c"><rect x="${x0}" y="-4" width="${x1 - x0}" height="${2 * R + 8}"/></clipPath>`;
    let stack = "";
    for (let i = T; i >= 1; i--) stack += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})"><g transform="${faceV(o, -R, 0, 2 * R + 2)}"><g clip-path="url(#${pid}-c)">${face(gold ? "#c99a2e" : "#b8392f", gold ? "#c99a2e" : "#b8392f", gold ? "#8a6516" : "#8f2620")}</g></g></g>`;
    g += stack + `<g transform="${faceV(o, -R, 0, 2 * R + 2)}"><g clip-path="url(#${pid}-c)">${face(gold ? "#e9bd4c" : "#e0453a", gold ? "#d2a334" : "#c23a30", gold ? "#8a6516" : "#8f2620")}` +
      `<path d="M${x0 === 0 ? x1 : x0} 0V${2 * R}" stroke="${gold ? "#8a6516" : "#8f2620"}" stroke-width="2.4"/></g></g>`;
    return g;
  };
  let s = `<g transform="${faceTop(o, 0, -4, 0)}"><ellipse cx="0" cy="0" rx="${R + 10}" ry="18" fill="url(#shadowG)"/></g>`;
  s += `<g id="${id}-L">${part(id + "-l", 0, cut, true)}</g>`;
  s += `<g id="${id}-R"><g id="${id}-Rg">${part(id + "-r", cut, 2 * R, true)}</g><g id="${id}-Rr" opacity="0">${part(id + "-rr", cut, 2 * R, false)}</g></g>`;
  const c0 = at(o, -R + cut, 6, 2 * R + 26), c1 = at(o, -R + cut, 6, -14);
  s += `<path id="${id}-cut" d="M${pts([c0])}L${pts([c1])}" stroke="#e0453a" stroke-width="4" stroke-dasharray="10 7" opacity="0"/>`;
  return { svg: grp(id, o, s), top: at(o, 0, 0, 2 * R + 40), right: at(o, R + 10, 0, R), cutTop: c0 };
}

/** 地面光圈（审计覆盖范围）：青蓝淡底 + 虚线边 */
export function spotlight(o, { id, r = 200, color = "#2aa3c9", dash = true, fillOp = 0.12 }) {
  const plan = circlePlan(0, 0, r, 64);
  return `<g id="${id}" opacity="0">${flat(o, plan, 1, color, color, 4, `fill-opacity="${fillOp}" ${dash ? `stroke-dasharray="14 9"` : ""}`)}</g>`;
}
/** 地面红虚线圈（圈住审计覆盖不到的五样东西） */
export function groundRing(o, { id, u0, u1, v0, v1, color = "#e0453a" }) {
  const r = 40, plan = [];
  const corner = (cu, cv, a0) => { for (let k = 0; k <= 8; k++) { const a = (a0 + k * 90 / 8) * Math.PI / 180; plan.push([cu + r * Math.cos(a), cv + r * Math.sin(a)]); } };
  corner(u1 - r, v1 - r, 0); corner(u0 + r, v1 - r, 90); corner(u0 + r, v0 + r, 180); corner(u1 - r, v0 + r, 270);
  return `<g id="${id}" opacity="0">${flat(o, plan, 1, color, color, 4, `fill-opacity="0.06" stroke-dasharray="14 9"`)}</g>`;
}
/** 地面红虚线小圈（钥匙原来的位置） */
export function ghostSpot(o, { id, ru = 70, rv = 40 }) {
  const plan = circlePlan(0, 0, ru, 40, rv);
  return `<g id="${id}" opacity="0">${flat(o, plan, 1, "#e0453a", "#e0453a", 3.4, `fill-opacity="0.08" stroke-dasharray="10 7"`)}</g>`;
}
/** 包一层缩放（kit 物件没有 scale 参数时） */
export function scaled(id, o, k, svg) {
  const [ox, oy] = at(o);
  return `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}"><g transform="translate(${f(ox)},${f(oy)}) scale(${k}) translate(${f(-ox)},${f(-oy)})">${svg}</g></g>`;
}
export const scalePt = (o, k, p) => { const [ox, oy] = at(o); return [ox + (p[0] - ox) * k, oy + (p[1] - oy) * k]; };
