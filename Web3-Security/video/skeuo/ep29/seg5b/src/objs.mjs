// objs.mjs — seg5b 自补物件（kit 里没有的），画法与 kit/objects.mjs 一致：同一投影、三面明暗、描边。
// 每个函数返回 { svg, anchors }；根 <g id data-ox data-oy> 可被 KIT.grow 从地面长出。
import { at, f, f4, M, C, box, rbox, cyl, faceV, faceTop, faceU, frameV, matStr, applyM, contactShadow, V, U, CE, mat, darken, lighten } from "../../kit/iso.mjs";
import * as O from "../../kit/objects.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`, MONO = `font-family="JetBrains Mono, monospace"`;
export const txt = (x, y, s, o = {}) =>
  `<text x="${f(x)}" y="${f(y)}" ${o.mono ? MONO : FONT} font-size="${o.size ?? 20}" font-weight="${o.weight ?? 900}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}">${s}</text>`;
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const LED = { green: "#2bd46f", red: "#ff4a3d", off: "#3c3f45", blue: "#5cc0e0" };
export const ledSvg = (id, x, y, r, color) => {
  const c = LED[color] ?? color;
  return `<circle id="${id}-h" cx="${f(x)}" cy="${f(y)}" r="${f(r * 2.1)}" fill="${c}" opacity="${color === "off" ? 0 : 0.35}"/><circle id="${id}" cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" stroke="rgba(0,0,0,0.35)" stroke-width="1"/>`;
};
const wrap = (p, o, solid, extra = "") => { const [ox, oy] = at(o); return `<g id="${p}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}" ${extra}><g id="${p}-solid">${solid}</g></g>`; };

/** 小型服务器（服务 / 生产服务器）：深色机箱，正面三个硬盘位 + 状态灯 + 铭牌 */
export function svcBox(o, opts = {}) {
  const p = opts.id ?? "svc", W = 112, D = 96, H = 156;
  const body = opts.light ? M.steelLight : mat("#3d4046", { t: "#5a5d63", st: "#1b1c1f" });
  let s = contactShadow(o, 104, 80);
  s += rbox(o, -W / 2, W / 2, -D / 2, D / 2, 0, H, 6, body, { sw: 1.8 });
  s += G_(faceTop(o, -W / 2 + 18, -D / 2 + 18, H), Array.from({ length: 5 }, (_, i) => `<rect x="${i * 16}" y="0" width="7" height="${D - 36}" rx="3.5" fill="${darken(body.t, 0.22)}"/>`).join(""));
  let fp = `<rect x="8" y="10" width="${W - 16}" height="${H - 20}" rx="4" fill="#17181b" stroke="${lighten(body.s, 0.2)}" stroke-width="1.6"/>`;
  fp += `<rect x="16" y="18" width="${W - 32}" height="20" rx="3" fill="#e9ebee"/>` + txt(W / 2, 33, opts.tag ?? "SVC", { size: 13, anchor: "middle", mono: true, weight: 800, fill: "#3b3e44" });
  for (let k = 0; k < 3; k++) fp += `<rect x="16" y="${50 + k * 26}" width="${W - 50}" height="18" rx="3" fill="#a9aeb5" stroke="#6e737b" stroke-width="1"/><rect x="22" y="${56 + k * 26}" width="30" height="5" rx="2.5" fill="#6e737b"/>`;
  fp += ledSvg(`${p}-led-0`, W - 22, 60, 5.5, opts.led ?? "green") + ledSvg(`${p}-led-1`, W - 22, 86, 3.5, "green");
  s += G_(faceV(o, -W / 2, D / 2, H), fp);
  const anchors = { top: at(o, 0, 0, H + 34), center: at(o, 0, 0, H / 2), front: at(o, 0, D / 2, H * 0.6), ground: at(o) };
  return { svg: wrap(p, o, s), anchors };
}

/** 门禁卡式"生产令牌"：立着的卡片，红色顶带、金色芯片、挂绳孔；有厚度 */
export function keycard(o, opts = {}) {
  const p = opts.id ?? "card", z = opts.z ?? 0, k = opts.k ?? 1, Wc = 86, Hc = 124;
  const m0 = frameV(o, -Wc * k / 2, 0, z + Hc * k), m = [m0[0] * k, m0[1] * k, m0[2] * k, m0[3] * k, m0[4], m0[5]];
  const card = (fill, st) => `<rect x="0" y="0" width="${Wc}" height="${Hc}" rx="10" fill="${fill}" stroke="${st}" stroke-width="2"/>`;
  let s = "";
  for (let i = 5; i >= 1; i--) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(m), card("#d9d3c7", "#9a9488"))}</g>`;
  s += G_(matStr(m), card("#ffffff", "#a8322a") +
    `<path d="M0 10A10 10 0 0 1 10 0H${Wc - 10}A10 10 0 0 1 ${Wc} 10V34H0Z" fill="#e0453a"/>` +
    `<rect x="${Wc / 2 - 14}" y="8" width="28" height="7" rx="3.5" fill="#ffffff" stroke="#a8322a" stroke-width="1.4"/>` +
    txt(Wc / 2, 30, "PROD", { size: 14, mono: true, anchor: "middle", fill: "#ffffff", weight: 800 }) +
    `<rect x="14" y="48" width="30" height="24" rx="4" fill="#f0c04a" stroke="#a87612" stroke-width="1.6"/><path d="M14 60H44M29 48V72M22 54V66M36 54V66" stroke="#a87612" stroke-width="1.2"/>` +
    `<rect x="14" y="84" width="58" height="7" rx="3.5" fill="#cfc7b8"/><rect x="14" y="98" width="40" height="7" rx="3.5" fill="#cfc7b8"/>`);
  const anchors = { top: at(o, 0, 0, z + Hc * k + 30), center: at(o, 0, 0, z + Hc * k / 2), ground: at(o) };
  return { svg: wrap(p, o, s), anchors };
}

/** 秒表：竖直表盘（+v 面），表冠按钮、刻度、可转的指针（KIT.rot 驱动，id = ID-hand） */
export function stopwatch(o, opts = {}) {
  const p = opts.id ?? "sw", z = opts.z ?? 100, R = 50;
  const m = frameV(o, 0, 0, z); // local (0,0) = dial centre; x→+u, y→down
  const ring = (fill, st) => `<rect x="-9" y="${-R - 22}" width="18" height="14" rx="3" fill="${fill}" stroke="${st}" stroke-width="1.6"/><rect x="-14" y="${-R - 30}" width="28" height="10" rx="4" fill="${fill}" stroke="${st}" stroke-width="1.6"/>
    <g transform="rotate(40)"><rect x="-6" y="${-R - 14}" width="12" height="10" rx="2" fill="${fill}" stroke="${st}" stroke-width="1.4"/></g>
    <circle cx="0" cy="0" r="${R}" fill="${fill}" stroke="${st}" stroke-width="2"/>`;
  let s = "";
  for (let i = 8; i >= 1; i--) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(m), ring("#8b9199", "#4b4f56"))}</g>`;
  let ticks = "";
  for (let i = 0; i < 60; i++) { const a = (i / 60) * 2 * Math.PI, r0 = i % 5 ? R - 13 : R - 19; ticks += `M${f(r0 * Math.sin(a))} ${f(-r0 * Math.cos(a))}L${f((R - 9) * Math.sin(a))} ${f(-(R - 9) * Math.cos(a))}`; }
  s += G_(matStr(m), ring("#c9cdd2", "#4b4f56") + `<circle cx="0" cy="0" r="${R - 7}" fill="#fffdf8" stroke="#7d828a" stroke-width="1.6"/><path d="${ticks}" stroke="#3b3e44" stroke-width="1.6"/>
    <path d="M-30 -24A38 38 0 0 1 -10 -38" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`);
  // hand rotator (same contract as kit rotators: data-m / data-px / data-py / data-a)
  const hand = `<path d="M0 10L0 ${-R + 14}" stroke="#1d93ba" stroke-width="4" stroke-linecap="round"/><circle cx="0" cy="0" r="5" fill="#1c1c1c"/>`;
  const mm = m.map((v, i) => (i < 4 ? f4(v) : f(v)));
  s += `<g id="${p}-hand" data-m="${mm.join(",")}" data-px="0" data-py="0" data-a="0" transform="matrix(${mm.join(",")}) translate(0 0) rotate(0) translate(0 0)">${hand}</g>`;
  const anchors = { top: at(o, 0, 0, z + R + 70), center: at(o, 0, 0, z), right: at(o, R + 14, 0, z), ground: at(o) };
  return { svg: wrap(p, o, s), anchors };
}

/** 一串红色链环（委托 / 授权链子）：从世界画布点 A 到 B，n 个环交替正侧面 */
export function links(id, A, B, n = 7, color = "#e0453a", extra = "") {
  const ang = (Math.atan2(B[1] - A[1], B[0] - A[0]) * 180) / Math.PI;
  let s = "";
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, x = A[0] + (B[0] - A[0]) * t, y = A[1] + (B[1] - A[1]) * t, side = i % 2 === 1;
    const rx = 21, ry = side ? 5 : 11;
    s += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(ang)})"><ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="none" stroke="#8f2620" stroke-width="9"/><ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="none" stroke="${color}" stroke-width="5"/>${side ? "" : `<path d="M-12 -6A14 8 0 0 1 8 -9" fill="none" stroke="#f6b0a8" stroke-width="2" stroke-linecap="round"/>`}</g>`;
  }
  return `<g id="${id}" ${extra}>${s}</g>`;
}

/** 人物 + 彩色工牌（kit person，额外在胸前画一张较大的工牌和挂绳） */
export function badgePerson(o, opts = {}) {
  const k = opts.scale ?? 1.2;
  const r = O.person(o, { id: opts.id, color: opts.color, role: "signer", scale: k });
  const bd = at(o, -2 * k, 24 * k, 100 * k), bc = opts.badge ?? "#ffffff", band = opts.band ?? "#1d93ba";
  const w = 26 * k, h = 32 * k;
  const ov = `<path d="M${f(bd[0] - 14 * k)} ${f(bd[1] - 40 * k)}L${f(bd[0])} ${f(bd[1] - 4 * k)}L${f(bd[0] + 15 * k)} ${f(bd[1] - 42 * k)}" fill="none" stroke="${band}" stroke-width="3"/>
    <rect x="${f(bd[0] - w / 2)}" y="${f(bd[1] - 4 * k)}" width="${f(w)}" height="${f(h)}" rx="3" fill="${bc}" stroke="rgba(0,0,0,0.35)" stroke-width="1.2"/>
    <rect x="${f(bd[0] - w / 2)}" y="${f(bd[1] - 4 * k)}" width="${f(w)}" height="${f(10 * k)}" rx="3" fill="${band}"/>
    <rect x="${f(bd[0] - w / 2 + 4)}" y="${f(bd[1] + 10 * k)}" width="${f(w * 0.36)}" height="${f(h * 0.36)}" rx="2" fill="#cfd3d8"/>
    <rect x="${f(bd[0] + 1)}" y="${f(bd[1] + 12 * k)}" width="${f(w * 0.38)}" height="3" rx="1.5" fill="#9aa0a8"/><rect x="${f(bd[0] + 1)}" y="${f(bd[1] + 18 * k)}" width="${f(w * 0.3)}" height="3" rx="1.5" fill="#9aa0a8"/>`;
  // insert the overlay inside the person's solid group (so KIT.grow scales it too)
  const idSolid = `id="${opts.id}-solid"`;
  const i0 = r.svg.indexOf(idSolid), iWire = r.svg.indexOf(`id="${opts.id}-wire"`);
  const cut = r.svg.lastIndexOf("</g>", iWire);
  const svg = i0 > 0 && cut > 0 ? r.svg.slice(0, cut) + ov + r.svg.slice(cut) : r.svg;
  return { svg, anchors: r.anchors };
}

/** 地面上的一段路径线（pathLength=1，用 stroke-dashoffset 1→0 画出） */
export const gpath = (id, P, color, w = 9, extra = "") =>
  `<path id="${id}" d="M${P.map((q) => `${f(q[0])} ${f(q[1])}`).join("L")}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="butt" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" ${extra}/>`;

/** 地面红色虚线圈（圈出某处） */
export const groundRing = (id, o, rx, ry, color = "#e0453a") =>
  `<g id="${id}" opacity="0"><g transform="${faceTop(o, 0, 0, 0)}"><ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="rgba(224,69,58,0.06)" stroke="${color}" stroke-width="7" stroke-dasharray="20 12" stroke-linecap="round"/></g></g>`;
