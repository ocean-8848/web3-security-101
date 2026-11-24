// props.mjs — seg5 自补拟物件（与 kit 同一投影；只在本段用）
import { at, f, pts, box, rbox, cyl, frustum, M, C, mat, darken, lighten, faceV, faceU, faceTop, frameV, applyM, contactShadow, line3, matStr } from "../../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;
export const wrap = (id, o, inner, extra = "") => { const [ox, oy] = at(o); return `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}" ${extra}>${inner}</g>`; };
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const BP = "#1f6f97", BPL = "#8fc3dc";

/** drafting workbench: steel legs, wooden top, a blueprint sheet with three columns (ID-cols), a pen (ID-pen) */
export function workbench(o, { id }) {
  const U0 = -200, U1 = 200, V0 = -125, V1 = 125, zt = 104;
  let s = contactShadow(o, 250, 170);
  for (const [u, v] of [[U0 + 14, V0 + 14], [U1 - 14, V0 + 14], [U0 + 14, V1 - 14], [U1 - 14, V1 - 14]]) s += box(o, u - 7, u + 7, v - 7, v + 7, 0, zt - 10, M.dark, 1.3);
  s += box(o, U0 + 12, U1 - 12, V0 + 12, V1 - 12, 30, 38, M.dark, 1.1);
  s += box(o, U0, U1, V0, V1, zt - 10, zt, M.wood, 1.6);
  // blueprint sheet
  const pw = 340, ph = 210;
  let sh = `<rect x="0" y="0" width="${pw}" height="${ph}" fill="${BP}" stroke="#155e77" stroke-width="2"/>`;
  for (let x = 20; x < pw; x += 20) sh += `<path d="M${x} 4V${ph - 4}" stroke="${BPL}" stroke-width="0.8" opacity="0.45"/>`;
  for (let y = 20; y < ph; y += 20) sh += `<path d="M4 ${y}H${pw - 4}" stroke="${BPL}" stroke-width="0.8" opacity="0.45"/>`;
  sh += `<rect x="8" y="8" width="${pw - 16}" height="${ph - 16}" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.8"/>`;
  let cols = "";
  for (const x of [pw / 3, (2 * pw) / 3]) cols += `<path d="M${f(x)} 18V${ph - 18}" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>`;
  cols += `<path d="M18 46H${pw - 18}" stroke="#ffffff" stroke-width="3" opacity="0.8"/>`;
  s += G_(faceTop(o, -pw / 2, -ph / 2, zt), sh + `<g id="${id}-cols" opacity="0">${cols}</g>`);
  // pen (moves over the sheet)
  const p0 = at(o, 40, 60, zt + 4), p1 = at(o, 120, 30, zt + 26);
  s += `<g id="${id}-pen"><path d="M${pts([p0])}L${pts([p1])}" stroke="#1c1c1c" stroke-width="9" stroke-linecap="round"/><path d="M${pts([p0])}L${pts([[p0[0] + (p1[0] - p0[0]) * 0.12, p0[1] + (p1[1] - p0[1]) * 0.12]])}" stroke="#d6a64a" stroke-width="9"/></g>`;
  const col = (k) => at(o, -pw / 2 + (pw / 3) * (k + 0.5), 0, zt);
  return { svg: wrap(id, o, `<g id="${id}-solid">${s}</g>`), anchors: { top: at(o, 0, 0, zt + 90), cols: [0, 1, 2].map(col), center: at(o, 0, 0, zt), ground: at(o), pen0: p0 } };
}

/** upright blueprint board on a steel easel: six cells (2 rows × 3) with arrows; ID-c{i} = lit overlay */
export function stepBoard(o, { id }) {
  const W = 680, H = 400, z1 = 520, z0 = z1 - H;
  let s = contactShadow(o, 380, 80);
  for (const u of [-W / 2 + 40, W / 2 - 40]) s += box(o, u - 8, u + 8, -18, -4, 0, z1 + 10, M.dark, 1.3) + box(o, u - 22, u + 22, -40, 30, 0, 8, M.dark, 1.2);
  s += box(o, -W / 2 - 10, W / 2 + 10, -4, 4, z0 - 10, z1 + 10, M.steelLight, 1.6);
  const m = frameV(o, -W / 2, 4, z1);
  let fc = `<rect x="0" y="0" width="${W}" height="${H}" fill="${BP}"/>`;
  for (let x = 20; x < W; x += 20) fc += `<path d="M${x} 0V${H}" stroke="${BPL}" stroke-width="0.8" opacity="0.35"/>`;
  for (let y = 20; y < H; y += 20) fc += `<path d="M0 ${y}H${W}" stroke="${BPL}" stroke-width="0.8" opacity="0.35"/>`;
  fc += `<rect x="10" y="10" width="${W - 20}" height="${H - 20}" fill="none" stroke="#ffffff" stroke-width="2.4" opacity="0.8"/>`;
  const cw = 190, chh = 150, gx = 30, x0 = (W - 3 * cw - 2 * gx) / 2, ys = [30, 220];
  const cells = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) cells.push([x0 + c * (cw + gx), ys[r]]);
  cells.forEach(([x, y]) => { fc += `<rect x="${x}" y="${y}" width="${cw}" height="${chh}" rx="8" fill="rgba(255,255,255,0.06)" stroke="#ffffff" stroke-width="3" stroke-dasharray="10 7" opacity="0.9"/>`; });
  // arrows
  const arr = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#ffffff" stroke-width="4"/><path d="M${x2} ${y2}l-12 -7v14z" fill="#ffffff" transform="rotate(${f((Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI)} ${x2} ${y2})"/>`;
  let arrows = arr(x0 + cw + 3, ys[0] + chh / 2, x0 + cw + gx - 3, ys[0] + chh / 2) + arr(x0 + 2 * cw + gx + 3, ys[0] + chh / 2, x0 + 2 * (cw + gx) - 3, ys[0] + chh / 2);
  arrows += arr(x0 + cw + 3, ys[1] + chh / 2, x0 + cw + gx - 3, ys[1] + chh / 2) + arr(x0 + 2 * cw + gx + 3, ys[1] + chh / 2, x0 + 2 * (cw + gx) - 3, ys[1] + chh / 2);
  arrows += `<path d="M${x0 + 2 * (cw + gx) + cw / 2} ${ys[0] + chh + 3}V${ys[0] + chh + 20}H${x0 + cw / 2}V${ys[1] - 6}" fill="none" stroke="#ffffff" stroke-width="4"/><path d="M${x0 + cw / 2} ${ys[1] - 3}l-7 -12h14z" fill="#ffffff"/>`;
  fc += arrows;
  cells.forEach(([x, y], i) => { fc += `<rect id="${id}-c${i}" x="${x}" y="${y}" width="${cw}" height="${chh}" rx="8" fill="#ffffff" stroke="#2aa3c9" stroke-width="5" opacity="0"/>`; });
  s += G_(matStr(m), fc);
  const centers = cells.map(([x, y]) => applyM(m, x + cw / 2, y + chh / 2));
  const edgesL = cells.map(([x, y]) => applyM(m, x + cw / 2, y + chh));
  return { svg: wrap(id, o, `<g id="${id}-solid">${s}</g>`), anchors: { top: at(o, 0, 0, z1 + 60), cells: centers, cellBottom: edgesL, center: at(o, 0, 0, (z0 + z1) / 2), ground: at(o), m } };
}

/** attacker's open toolbox: red steel box, lid open, tools sticking out */
export function toolbox(o, { id }) {
  const red = mat("#d84a3f", { st: "#7e2019" });
  let s = contactShadow(o, 120, 70);
  s += box(o, -80, 80, -40, 40, 0, 64, red, 1.8);
  // open lid leaning back
  const lid = [at(o, -80, -40, 64), at(o, 80, -40, 64), at(o, 80, -78, 118), at(o, -80, -78, 118)];
  s += `<polygon points="${pts(lid)}" fill="${darken("#d84a3f", 0.12)}" stroke="#7e2019" stroke-width="1.8" stroke-linejoin="round"/>`;
  // inside dark + tray
  s += `<polygon points="${pts([at(o, -74, -34, 64), at(o, 74, -34, 64), at(o, 74, 34, 64), at(o, -74, 34, 64)])}" fill="#3a1714"/>`;
  // tools
  s += line3(o, [[-50, 0, 40], [-40, -10, 120]], "#9aa0a8", 10) + line3(o, [[-40, -10, 120], [-34, -16, 134]], "#5a5e65", 16);
  s += line3(o, [[0, 6, 40], [10, 0, 108]], "#1c1c1c", 12) + line3(o, [[10, 0, 108], [14, -3, 150]], "#c3c8ce", 4);
  s += line3(o, [[40, 8, 40], [52, 0, 112]], "#7d828a", 9) + line3(o, [[36, 0, 112], [70, 0, 112]], "#4b4f56", 16);
  // handle
  s += line3(o, [[-34, 0, 64], [-34, 0, 86], [34, 0, 86], [34, 0, 64]], "#1c1c1c", 7);
  s += G_(faceV(o, -80, 40, 64), `<rect x="60" y="18" width="40" height="16" rx="3" fill="#c3c8ce" stroke="#4b4f56" stroke-width="1.4"/>`);
  return { svg: wrap(id, o, `<g id="${id}-solid">${s}</g>`), anchors: { top: at(o, 0, 0, 190), ground: at(o) } };
}

/** glass dome on a dark plinth; inner content (already built svg) sits under it */
export function dome(o, { id, inner = "" }) {
  let s = contactShadow(o, 170, 120);
  s += cyl(o, 0, 0, 150, 0, 16, M.ink, { sw: 1.4 });
  s += inner;
  const g = { f: "rgba(208,234,244,0.30)", s: "rgba(160,205,222,0.34)", t: "rgba(230,245,250,0.30)", st: "#5a9db5" };
  s += cyl(o, 0, 0, 140, 16, 210, g, { sw: 2.2 });
  s += frustum(o, 0, 0, 140, 70, 210, 250, g, { sw: 2.2 });
  s += cyl(o, 0, 0, 22, 250, 266, M.ink, { sw: 1.2 });
  const hl0 = at(o, -60, 110, 40), hl1 = at(o, -60, 110, 190);
  s += `<path d="M${pts([hl0])}L${pts([hl1])}" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity="0.7"/>`;
  return { svg: wrap(id, o, `<g id="${id}-solid">${s}</g>`), anchors: { top: at(o, 0, 0, 320), glass: at(o, 0, 140, 140), ground: at(o) } };
}

/** big wrench (red grip = attacker's) standing in the +v plane; ID-wr rotates about the jaw */
export function wrench(p, { id, scale = 1 }) {
  const [x, y] = p;
  const k = scale;
  const body = `<path d="M-14 0H-150Q-164 0 -164 14V18Q-164 32 -150 32H-14Z" fill="#c3c8ce" stroke="#4b4f56" stroke-width="2.4"/>
    <rect x="-150" y="4" width="100" height="24" rx="10" fill="#e0453a" stroke="#8f2620" stroke-width="2"/>
    <path d="M-20 -26A34 34 0 1 1 -20 58L-6 40A16 16 0 1 0 -6 -8Z" fill="#c3c8ce" stroke="#4b4f56" stroke-width="2.4"/>`;
  return `<g id="${id}" data-ox="${f(x)}" data-oy="${f(y)}"><g transform="translate(${f(x)},${f(y)}) scale(${k}) rotate(-28)">${body}</g></g>`;
}

/** stack of gold coins (moves as a group: ID) */
export function coinStack(o, { id, n = 5 }) {
  let s = contactShadow(o, 50, 34);
  for (let i = 0; i < n; i++) s += cyl(o, (i % 2) * 3 - 1.5, 0, 28, i * 9, i * 9 + 8, M.gold, { sw: 1.2, seg: 28 });
  s += `<g transform="${faceTop(o, 0, 0, n * 9 - 1)}"><circle r="17" fill="none" stroke="#a87612" stroke-width="2"/></g>`;
  return { svg: wrap(id, o, s), anchors: { top: at(o, 0, 0, n * 9 + 60), c: at(o, 0, 0, n * 9 / 2), ground: at(o) } };
}

/** ink ship anchor standing upright in the +v plane (screen-facing), base at o */
export function anchorIcon(o, { id, h = 150 }) {
  const m = frameV(o, -h * 0.45, 0, h);
  const s = h / 150;
  const pth = `<g transform="scale(${f(s)})"><circle cx="67" cy="16" r="12" fill="none" stroke="#1c1c1c" stroke-width="9"/>
    <path d="M67 28V140M38 52H96" stroke="#1c1c1c" stroke-width="11" stroke-linecap="round"/>
    <path d="M10 92Q18 146 67 146Q116 146 124 92" fill="none" stroke="#1c1c1c" stroke-width="11" stroke-linecap="round"/>
    <path d="M2 100L10 80L24 98Z M132 100L124 80L110 98Z" fill="#1c1c1c" stroke="#1c1c1c" stroke-width="5" stroke-linejoin="round"/></g>`;
  return { svg: wrap(id, o, `<g transform="${matStr(m)}">${pth}</g>`), anchors: { top: at(o, 0, 0, h + 40), ground: at(o) } };
}

/** narrow slit on the vending −u face (coins pushed straight into the contract) */
export function slit(o, { id, u0, v, z }) {
  return `<g id="${id}">${G_(faceU(o, u0, v - 50, z + 10), `<rect x="0" y="0" width="100" height="20" rx="7" fill="#0e2f3a" stroke="#e0453a" stroke-width="4"/>`)}</g>`;
}

/** face mask (pale, two eye holes) in screen plane around a head point */
export function mask(p, { id }) {
  const [x, y] = p;
  return `<g id="${id}" opacity="0"><ellipse cx="${f(x + 8)}" cy="${f(y + 4)}" rx="24" ry="30" fill="#f4efe4" stroke="#1c1c1c" stroke-width="3"/>
    <ellipse cx="${f(x - 1)}" cy="${f(y - 2)}" rx="5" ry="3.5" fill="#1c1c1c"/><ellipse cx="${f(x + 17)}" cy="${f(y - 2)}" rx="5" ry="3.5" fill="#1c1c1c"/>
    <path d="M${f(x)} ${f(y + 16)}Q${f(x + 8)} ${f(y + 21)} ${f(x + 16)} ${f(y + 16)}" fill="none" stroke="#1c1c1c" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M${f(x - 16)} ${f(y - 6)}L${f(x - 30)} ${f(y - 10)}M${f(x + 32)} ${f(y - 6)}L${f(x + 40)} ${f(y - 10)}" stroke="#1c1c1c" stroke-width="2.4"/></g>`;
}

/** iso ground rectangle outline (dashed teal) — the "whole protocol" frame */
export function groundFrame(o, { id, u0, u1, v0, v1 }) {
  const P = [at(o, u0, v0), at(o, u1, v0), at(o, u1, v1), at(o, u0, v1)];
  return `<polygon id="${id}" points="${pts(P)}" fill="rgba(42,163,201,0.06)" stroke="#2aa3c9" stroke-width="6" stroke-dasharray="22 14" stroke-linejoin="round"/>`;
}
