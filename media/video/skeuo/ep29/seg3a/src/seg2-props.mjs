// FROZEN COPY of ../../seg2/src/ (copied 2026-11-14) — seg2 world layout, do not edit here.
// props.mjs — seg2 自补的拟物物件（kit 里没有的），同一投影、同一画法。
import { at, f, pts, box, rbox, cyl, M, C, U, V, CE, CA, SA, SE, faceV, faceTop, frameTop, matStr, contactShadow, applyM, frameV } from "../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const root = (p, o, inner) => { const [x, y] = at(o); return `<g id="${p}" class="kobj" data-ox="${f(x)}" data-oy="${f(y)}"><g id="${p}-solid">${inner}</g></g>`; };

// ------------------------------------------------------------------ 显示器（④ 显示与解码）
// 台座 + 立柱 + 大屏；屏幕在 +v 面，本地 320×200；ID-scr（十六进制字节）/ ID-scr2（翻译后的中文，初始隐藏）
export const MON = { w: 320, h: 200 };
export function monitor(o, opts = {}) {
  const p = opts.id ?? "mon";
  let s = contactShadow(o, 190, 90);
  s += rbox(o, -80, 80, -46, 16, 0, 12, 8, M.ink, { sw: 1.4 });
  s += box(o, -10, 10, -30, -14, 12, 96, M.ink, 1.2);
  s += box(o, -178, 178, -16, 6, 78, 312, M.ink, 1.8);
  const scr = `<rect x="0" y="0" width="${MON.w + 16}" height="${MON.h + 16}" rx="5" fill="#1d1f23"/>
    <defs><clipPath id="${p}-sc"><rect x="0" y="0" width="${MON.w}" height="${MON.h}" rx="3"/></clipPath></defs>
    <g transform="translate(8,8)" clip-path="url(#${p}-sc)">
      <g id="${p}-scr">${opts.screen ?? ""}</g><g id="${p}-scr2" opacity="0">${opts.screen2 ?? ""}</g></g>`;
  s += G_(faceV(o, -168, 6, 304), scr);
  const m = frameV(o, -168, 6, 304);
  const anchors = { top: at(o, 0, 0, 350), screen: applyM(m, 8 + MON.w / 2, 8 + MON.h / 2), center: at(o, 0, 0, 190), ground: at(o), m };
  return { svg: root(p, o, s), anchors };
}

// ------------------------------------------------------------------ 审批台（③ 大额人工批准）
// 白色立式控制台 + 斜面顶 + 绿色大按钮（ID-btn，可按下）+ 正面"批准"字
export function podium(o, opts = {}) {
  const p = opts.id ?? "pod";
  let s = contactShadow(o, 80, 60);
  s += box(o, -40, 40, -34, 34, 0, 104, M.white, 1.6);
  s += box(o, -46, 46, -40, 40, 104, 112, M.dark, 1.4);
  s += G_(faceV(o, -40, 34, 96), `<rect x="10" y="8" width="60" height="26" rx="4" fill="#1f9d55"/><text x="40" y="28" ${FONT} font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">批准</text>`);
  s += `<g id="${p}-btn">${cyl(o, 0, 0, 20, 112, 124, M.green, { seg: 24, sw: 1.4 })}</g>`;
  const anchors = { top: at(o, 0, 0, 180), btn: at(o, 0, 0, 124), ground: at(o) };
  return { svg: root(p, o, s), anchors };
}

// ------------------------------------------------------------------ 主角：提现单 / 信封（平放，沿路走）
// 本地平面坐标（x → +u，y → +v），中心在原点；外层 <g id=hero> 由运行时平移到 Wp(u,v,z)。
// 部件：hero-doc（提现单纸）/ hero-env（信封）/ hero-strip（待签交易字节封条）/ hero-ok（审批绿勾）/ hero-seal（红色印痕）
export const HERO = { w: 170, h: 110 };
export function hero() {
  const m = [U[0], U[1], V[0], V[1], 0, 0];
  const T = (inner) => `<g transform="${matStr(m)}">${inner}</g>`;
  const W = HERO.w, H = HERO.h, x0 = -W / 2, y0 = -H / 2;
  const red = "#d93a2f";
  const docW = 120, docH = 156;
  const doc = `<g transform="translate(0,${f(3 * CE)})">${T(`<rect x="${-docW / 2}" y="${-docH / 2}" width="${docW}" height="${docH}" rx="3" fill="#ddd6c9"/>`)}</g>` +
    T(`<path d="M${-docW / 2} ${-docH / 2}H${docW / 2 - 22}L${docW / 2} ${-docH / 2 + 22}V${docH / 2}H${-docW / 2}Z" fill="#fffdf8" stroke="#b8b0a1" stroke-width="2"/>
      <path d="M${docW / 2 - 22} ${-docH / 2}V${-docH / 2 + 22}H${docW / 2}Z" fill="#e8e2d6" stroke="#b8b0a1" stroke-width="1.4"/>
      <text x="${-docW / 2 + 12}" y="${-docH / 2 + 30}" ${FONT} font-size="22" font-weight="900" fill="#1c1c1c">提现单</text>
      <rect x="${-docW / 2 + 12}" y="${-docH / 2 + 38}" width="${docW - 24}" height="2.5" fill="#1c1c1c"/>
      ${[0, 1, 2].map((i) => `<rect x="${-docW / 2 + 12}" y="${-docH / 2 + 54 + i * 22}" width="${[86, 70, 92][i]}" height="9" rx="4" fill="#e3ddd1"/>`).join("")}
      <text x="${-docW / 2 + 12}" y="${docH / 2 - 16}" ${MONO} font-size="14" font-weight="800" fill="#17809f">20,000 USDT</text>`);
  const env = `<g transform="translate(0,${f(4 * CE)})">${T(`<rect x="${x0}" y="${y0}" width="${W}" height="${H}" rx="7" fill="#d8d1c4"/>`)}</g>` +
    T(`<rect x="${x0}" y="${y0}" width="${W}" height="${H}" rx="7" fill="#ffffff" stroke="#6b665c" stroke-width="3"/>
      <path d="M${x0 + 3} ${y0 + 4}L0 ${y0 + H * 0.56}L${-x0 - 3} ${y0 + 4}" fill="none" stroke="#6b665c" stroke-width="3" stroke-linejoin="round"/>`);
  const strip = T(`<rect x="${x0 + 10}" y="${y0 + 70}" width="${W - 20}" height="28" rx="3" fill="#1d93ba"/>
      ${Array.from({ length: 14 }, (_, i) => `<rect x="${x0 + 16 + i * 10.6}" y="${y0 + 74}" width="${[6, 3, 5, 3, 7, 4, 3, 6, 3, 5, 7, 3, 4, 6][i]}" height="20" rx="1" fill="#ffffff" opacity="0.85"/>`).join("")}`);
  const ok = T(`<circle cx="${-x0 - 30}" cy="${y0 + 32}" r="19" fill="#1f9d55" stroke="#ffffff" stroke-width="3"/><path d="M${-x0 - 39} ${y0 + 32}l6 6l12 -12" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`);
  const star = (cx, cy, R, r) => { let d = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r : R; d += `${i ? "L" : "M"}${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))}`; } return d + "Z"; };
  const seal = T(`<g transform="rotate(-10 -34 6)"><circle cx="-34" cy="6" r="30" fill="none" stroke="${red}" stroke-width="5"/><circle cx="-34" cy="6" r="24" fill="none" stroke="${red}" stroke-width="1.4"/>
      <path d="${star(-34, 2, 11, 4.6)}" fill="${red}"/><text x="-34" y="26" ${FONT} font-size="10" font-weight="900" fill="${red}" text-anchor="middle">核准</text></g>`);
  const shadow = `<g transform="${matStr(m)}"><ellipse cx="0" cy="0" rx="120" ry="84" fill="url(#shadowG)"/></g>`;
  const svg = `<g id="hero-sh" opacity="0">${shadow}</g>
  <g id="hero" opacity="0"><g id="hero-doc">${doc}</g><g id="hero-env" opacity="0">${env}</g>
    <g id="hero-strip" opacity="0">${strip}</g><g id="hero-ok" opacity="0">${ok}</g><g id="hero-seal" opacity="0">${seal}</g></g>`;
  return { svg };
}

// ------------------------------------------------------------------ 数据包（支线 RPC → ⑤）
export function packet(id) {
  const o = { u: 0, v: 0 };
  return `<g id="${id}" opacity="0">${box(o, -16, 16, -16, 16, 0, 30, M.blue, 1.4)}${G_(faceTop(o, -16, -16, 30), `<rect x="7" y="7" width="18" height="18" rx="3" fill="#ffffff" opacity="0.7"/>`)}</g>`;
}

// ------------------------------------------------------------------ 路面上的编号空位（第 0 句，关卡还没长出来）
export function slot(id, o, n) {
  return `<g id="${id}" opacity="0">${G_(faceTop(o, 0, 0, 0.5), `<circle cx="0" cy="0" r="96" fill="rgba(42,163,201,0.06)" stroke="#2aa3c9" stroke-width="5" stroke-dasharray="16 12"/>
    <text x="0" y="22" ${FONT} font-size="64" font-weight="900" fill="#2aa3c9" text-anchor="middle">${n}</text>`)}</g>`;
}

// ------------------------------------------------------------------ 路面箭头（第 10 句：一次信任传递）
// 沿 u 从 a 到 b（v = vv），世界画布 px 里画：杆用 stroke-dashoffset 画出，箭头头部弹出
export function arrow(id, a, b, vv = 0, z = 1, color = "#1d93ba") {
  const P0 = at({ u: 0, v: 0 }, a, vv, z), P1 = at({ u: 0, v: 0 }, b, vv, z);
  const L = Math.ceil(Math.hypot(P1[0] - P0[0], P1[1] - P0[1]));
  const head = [at({ u: 0, v: 0 }, b - 6, vv - 44, z), at({ u: 0, v: 0 }, b + 70, vv, z), at({ u: 0, v: 0 }, b - 6, vv + 44, z)];
  return `<g id="${id}"><path id="${id}-s" d="M${pts([P0])}L${pts([P1])}" stroke="${color}" stroke-width="16" stroke-linecap="round" fill="none" stroke-dasharray="${L} ${L}" stroke-dashoffset="${L}"/>
    <polygon id="${id}-h" points="${pts(head)}" fill="${color}" stroke="${color}" stroke-width="4" stroke-linejoin="round" opacity="0"/></g>`;
}
/** 沿 v 方向的箭头（支线） */
export function arrowV(id, uu, a, b, z = 1, color = "#1d93ba") {
  const P0 = at({ u: 0, v: 0 }, uu, a, z), P1 = at({ u: 0, v: 0 }, uu, b, z);
  const L = Math.ceil(Math.hypot(P1[0] - P0[0], P1[1] - P0[1])), sg = Math.sign(b - a);
  const head = [at({ u: 0, v: 0 }, uu - 40, b - sg * 6, z), at({ u: 0, v: 0 }, uu, b + sg * 64, z), at({ u: 0, v: 0 }, uu + 40, b - sg * 6, z)];
  return `<g id="${id}"><path id="${id}-s" d="M${pts([P0])}L${pts([P1])}" stroke="${color}" stroke-width="14" stroke-linecap="round" fill="none" stroke-dasharray="${L} ${L}" stroke-dashoffset="${L}"/>
    <polygon id="${id}-h" points="${pts(head)}" fill="${color}" stroke="${color}" stroke-width="4" stroke-linejoin="round" opacity="0"/></g>`;
}
