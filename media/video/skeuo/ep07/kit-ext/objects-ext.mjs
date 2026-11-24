// objects-ext.mjs — 第 07 集（外部调用与代币兼容性）补充拟物物件，与 kit/objects.mjs 同一投影、同一接口
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"
//   opts.glow = true 时脚下绿色地光；opts.scale = 以地面原点等比缩放（anchors 已换算）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，KIT.grow / broke / fixed 直接可用。
// 动画助手在 runtime-ext.js（window.KITX07，并以不覆盖的方式合并进 window.KITX），用 runtimeExtJs() 内联在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  CA, SA, SE, CE, U, V, f, f4, at, pts, M, C, lighten, darken, mat,
  frameV, frameU, frameTop, matStr, applyM, faceV, faceU, faceTop,
  box, rbox, cyl, frustum, loft, wedge, flat, line3, edges, circlePlan,
  glow, contactShadow, wireSvg, badgeSvg,
} from "../../kit/iso.mjs";
import { ledgerBook } from "../../kit/objects.mjs";

const DEG = Math.PI / 180;
const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const txt = (x, y, s, o = {}) =>
  `<text x="${f(x)}" y="${f(y)}" ${o.mono ? MONO : FONT} font-size="${o.size ?? 20}" font-weight="${o.weight ?? 900}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}" ${o.extra ?? ""}>${s}</text>`;
const LED = { green: "#2bd46f", red: "#ff4a3d", off: "#3c3f45", blue: "#5cc0e0" };
const ledSvg = (id, x, y, r, color) => {
  const c = LED[color] ?? color;
  return `<circle id="${id}-h" cx="${f(x)}" cy="${f(y)}" r="${f(r * 2.1)}" fill="${c}" opacity="${color === "off" ? 0 : 0.35}"/><circle id="${id}" cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" stroke="rgba(0,0,0,0.35)" stroke-width="1"/>`;
};
function shell(p, o, opts, s) {
  const st = opts.state ?? "normal", broken = st === "broken";
  const glowOn = (opts.glow ?? s.glowDefault ?? false) && !broken;
  const [ox, oy] = at(o);
  const glowSvg = s.glowR ? `<g id="${p}-glow" opacity="${glowOn ? 1 : 0}">${glow(p + "-gl", s.glowAt ?? o, s.glowR)}</g>` : "";
  const k = s.k ?? 1, sc0 = k !== 1 ? `<g transform="translate(${f(ox)} ${f(oy)}) scale(${f4(k)}) translate(${f(-ox)} ${f(-oy)})">` : "", sc1 = k !== 1 ? "</g>" : "";
  return `<g id="${p}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}" data-state="${st}" data-k="${f4(k)}" ${s.attrs ?? ""}>${sc0}${s.under ?? ""}${glowSvg}${s.shadow ?? ""}
  <g id="${p}-solid" opacity="${broken ? opts.ghost ?? 0.18 : 1}">${s.solid}</g>
  ${wireSvg(p + "-wire", o, s.wire, { opacity: broken ? 1 : 0 })}
  ${badgeSvg(p + "-x", s.center, (s.badgeR ?? 30) / k, broken && opts.badge !== false ? 1 : 0)}${s.over ?? ""}${sc1}</g>`;
}
function scaleAnchors(o, k, A) {
  if (k === 1) return A;
  const [ox, oy] = at(o);
  const sp = (q) => [f(ox + (q[0] - ox) * k), f(oy + (q[1] - oy) * k)];
  const isPt = (q) => Array.isArray(q) && q.length === 2 && typeof q[0] === "number";
  const out = {};
  for (const [key, val] of Object.entries(A)) {
    if (isPt(val)) out[key] = sp(val);
    else if (Array.isArray(val) && val.length && isPt(val[0])) out[key] = val.map(sp);
    else out[key] = val;
  }
  return out;
}
const isAtk = (opts) => opts.state === "attacker";
const mArr = (m) => m.map((v, i) => (i < 4 ? f4(v) : f(v))).join(",");
function rotator(id, m, px, py, a, inner, extra = "") {
  const tr = `${matStr(m)} translate(${px} ${py}) rotate(${f(a)}) translate(${-px} ${-py})`;
  return `<g id="${id}" data-m="${mArr(m)}" data-px="${px}" data-py="${py}" data-a="${f(a)}" transform="${tr}" ${extra}>${inner}</g>`;
}
/** screen offset of a world displacement (du, dv, dz) */
const sv = (du, dv, dz = 0) => [du * U[0] + dv * V[0], du * U[1] + dv * V[1] - dz * CE];
/** deterministic pseudo-random generator seeded by a string */
function rng(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
}
const WOOD = M.wood;
const WOOD_D = { f: "#8a5a32", s: "#6f4524", t: "#a87443", st: "#4a2c14" };
const CAST = { f: "#55595f", s: "#3f4348", t: "#6c7077", st: "#1e2023" };
const CHROME = M.chrome;
const GOLD = M.gold;

// =====================================================================================
// 荒地 emptyLot — 无代码地址 / 零地址：约 260×200 的夯土地块，碎石、枯草、四角木桩 + 松垂麻绳，
// 前沿一根门牌桩（白底青蓝框，空白）。地块中心没有建筑，只有青蓝虚线地基轮廓（"这里本该有代码"）。
// opts: w=260, d=200, zero=false（门牌写 0x000…0，只是质感）, plateText（自定义门牌字）, ghost=0.85（地基虚线初始透明度）
// 可动：ID-plate（门牌，ID-plate-hi 高亮框，KITX07.lotPlate 闪）, ID-ghost（地基虚线，KITX07.lotGhost）
// anchors: top, center, ground, plate（门牌中心）, drop（包裹落点，地块中心地面）
// =====================================================================================
export function emptyLot(o, opts = {}) {
  const p = opts.id ?? "lot", K = opts.scale ?? 1, atk = isAtk(opts);
  const W = opts.w ?? 260, D = opts.d ?? 200, u0 = -W / 2, u1 = W / 2, v0 = -D / 2, v1 = D / 2, zg = 8;
  const rnd = rng(p + ":lot");
  const DIRT = atk ? { f: "#b5655a", s: "#94493f", t: "#cf8a7e", st: "#6e2f28" } : { f: "#a8794c", s: "#8a603a", t: "#c79e6e", st: "#6a4826" };
  let s = contactShadow(o, W * 0.72, D * 0.72);
  s += rbox(o, u0, u1, v0, v1, 0, zg, 12, DIRT, { sw: 1.6 });
  // ---- top texture (local = plan u,v)
  let tex = "";
  for (let i = 0; i < 9; i++) {
    const cu = u0 + 20 + rnd() * (W - 40), cv = v0 + 18 + rnd() * (D - 36);
    tex += `<ellipse cx="${f(cu)}" cy="${f(cv)}" rx="${f(14 + rnd() * 22)}" ry="${f(9 + rnd() * 14)}" fill="${rnd() > 0.5 ? "#bb9061" : "#d2ab7c"}" opacity="0.55"/>`;
  }
  // tyre ruts / cracks
  for (let i = 0; i < 6; i++) {
    let cu = u0 + 24 + rnd() * (W - 48), cv = v0 + 20 + rnd() * (D - 40), d = `M${f(cu)} ${f(cv)}`;
    for (let j = 0; j < 4; j++) { cu += (rnd() - 0.5) * 26; cv += 6 + rnd() * 10; d += `L${f(cu)} ${f(cv)}`; }
    tex += `<path d="${d}" fill="none" stroke="#7e5a35" stroke-width="1.3" stroke-linecap="round" opacity="0.7"/>`;
  }
  const PEB = ["#9a948a", "#b7b0a4", "#857d70", "#cfc8bb", "#a39c90"];
  for (let i = 0; i < 46; i++) {
    const cu = u0 + 10 + rnd() * (W - 20), cv = v0 + 10 + rnd() * (D - 20), r = 1.6 + rnd() * 3.4, c = PEB[Math.floor(rnd() * PEB.length)];
    tex += `<ellipse cx="${f(cu + 0.8)}" cy="${f(cv + 0.9)}" rx="${f(r)}" ry="${f(r * 0.75)}" fill="#6a4826" opacity="0.35"/><ellipse cx="${f(cu)}" cy="${f(cv)}" rx="${f(r)}" ry="${f(r * 0.75)}" fill="${c}"/><ellipse cx="${f(cu - r * 0.3)}" cy="${f(cv - r * 0.3)}" rx="${f(r * 0.35)}" ry="${f(r * 0.25)}" fill="#ffffff" opacity="0.5"/>`;
  }
  s += G_(faceTop(o, 0, 0, zg), tex);
  // ---- ghost foundation (dashed teal outline where a building should be)
  const gu0 = u0 + 50, gu1 = u1 - 50, gv0 = v0 + 42, gv1 = v1 - 42;
  const gs = `<rect x="${gu0}" y="${gv0}" width="${gu1 - gu0}" height="${gv1 - gv0}" fill="rgba(42,163,201,0.08)" stroke="#2aa3c9" stroke-width="3" stroke-dasharray="10 7"/>` +
    `<path d="M${gu0 + (gu1 - gu0) * 0.55} ${gv0}V${gv1}M${gu0} ${gv0 + (gv1 - gv0) * 0.5}H${gu0 + (gu1 - gu0) * 0.55}" stroke="#2aa3c9" stroke-width="1.8" stroke-dasharray="6 6" fill="none" opacity="0.8"/>` +
    [[gu0, gv0, 1, 1], [gu1, gv0, -1, 1], [gu1, gv1, -1, -1], [gu0, gv1, 1, -1]].map(([x, y, a, b]) => `<path d="M${x + 14 * a} ${y}H${x}V${y + 14 * b}" stroke="#1d93ba" stroke-width="4" fill="none" stroke-linecap="round"/>`).join("");
  s += `<g id="${p}-ghost" opacity="${opts.ghost ?? 0.85}">${G_(faceTop(o, 0, 0, zg + 0.4), gs)}</g>`;
  // ---- dry grass tufts (screen-space blades)
  const tuft = (du, dv, n = 5) => {
    const [x, y] = at(o, du, dv, zg); let g = "";
    for (let i = 0; i < n; i++) {
      const a = -90 + (i - (n - 1) / 2) * 16 + (rnd() - 0.5) * 8, L = 10 + rnd() * 9;
      const ex = x + L * Math.cos(a * DEG), ey = y + L * Math.sin(a * DEG), cx = x + L * 0.5 * Math.cos((a + 8) * DEG), cy = y + L * 0.6 * Math.sin((a + 8) * DEG);
      g += `<path d="M${f(x + (i - n / 2) * 1.2)} ${f(y)}Q${f(cx)} ${f(cy)} ${f(ex)} ${f(ey)}" fill="none" stroke="${["#b3a061", "#9a8848", "#c8b57a"][i % 3]}" stroke-width="1.7" stroke-linecap="round"/>`;
    }
    return g;
  };
  const tufts = [[u0 + 30, v0 + 30], [u1 - 40, v0 + 24], [u0 + 22, v1 - 34], [u1 - 26, v1 - 50], [12, v0 + 22], [u1 - 70, v1 - 22], [-40, v1 - 20]];
  // ---- stakes + sagging rope
  const ins = 9, zs = zg + 62, zr = zs - 8;
  const C4 = [[u0 + ins, v0 + ins], [u1 - ins, v0 + ins], [u1 - ins, v1 - ins], [u0 + ins, v1 - ins]];
  const stake = ([a, b]) => box(o, a - 4, a + 4, b - 4, b + 4, zg - 2, zs, WOOD, 1.2) + box(o, a - 5, a + 5, b - 5, b + 5, zs - 14, zs - 10, WOOD_D, 1);
  const rope = (A, B) => {
    const P = []; for (let i = 0; i <= 14; i++) { const t = i / 14; P.push([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, zr - 16 * Math.sin(Math.PI * t)]); }
    return line3(o, P, "#6f5330", 3.4) + `<g transform="translate(0,-0.9)">${line3(o, P, "#cfae74", 1.3)}</g>`;
  };
  s += rope(C4[0], C4[1]) + rope(C4[1], C4[2]);
  s += tufts.filter(([, b]) => b < 0).map(([a, b]) => tuft(a, b)).join("");
  s += stake(C4[0]) + stake(C4[1]);
  s += tufts.filter(([, b]) => b >= 0).map(([a, b]) => tuft(a, b)).join("");
  s += stake(C4[2]);
  s += rope(C4[0], C4[3]) + rope(C4[3], C4[2]);
  s += stake(C4[3]);
  // ---- signpost at the front edge
  const ux = u0 + 52, bw = 92, bh = 58, zb0 = 40, zb1 = zb0 + bh, bv = v1 + 14;
  s += box(o, ux - 4, ux + 4, bv - 8, bv - 2, 0, zb1 - 6, WOOD, 1.2);
  s += G_(faceTop(o, ux, bv - 5, 0), `<ellipse cx="0" cy="0" rx="9" ry="7" fill="#6a4826" opacity="0.35"/>`);
  const mP = frameV(o, ux - bw / 2, bv, zb1);
  const ptxt = opts.plateText ?? (opts.zero ? "0x000…0" : "");
  let pl = box(o, ux - bw / 2, ux + bw / 2, bv - 4, bv, zb0, zb1, M.white, 1.4);
  pl += G_(matStr(mP), `<rect x="4" y="4" width="${bw - 8}" height="${bh - 8}" rx="3" fill="#ffffff" stroke="${atk ? "#e0453a" : "#2aa3c9"}" stroke-width="3"/>
    <rect x="8" y="8" width="${bw - 16}" height="${bh - 16}" rx="2" fill="none" stroke="${atk ? "#f08a80" : "#bfe3ef"}" stroke-width="1"/>
    <circle cx="9" cy="9" r="1.8" fill="#9aa0a8"/><circle cx="${bw - 9}" cy="9" r="1.8" fill="#9aa0a8"/>` +
    (ptxt ? txt(bw / 2, bh / 2 + 5, ptxt, { size: 13, mono: true, anchor: "middle", fill: C.ink, weight: 800 }) : "") +
    `<rect id="${p}-plate-hi" x="1" y="1" width="${bw - 2}" height="${bh - 2}" rx="4" fill="rgba(42,163,201,0.06)" stroke="#2aa3c9" stroke-width="5" opacity="0"/>`);
  s += `<g id="${p}-plate">${pl}</g>`;
  const anchors = { top: at(o, 0, 0, 120), center: at(o, 0, 0, zg), ground: at(o), plate: applyM(mP, bw / 2, bh / 2), drop: at(o, 0, 0, zg), plateTop: at(o, ux, bv, zb1 + 6) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0, u1, v0, v1, 0, zg], [ux - bw / 2, ux + bw / 2, bv - 4, bv, zb0, zb1]], center: at(o, 0, 0, 40), glowR: 220, k: K }), anchors: scaleAnchors(o, K, anchors) };
}

// =====================================================================================
// 快递包裹 parcel — 瓦楞纸箱（60×48×44）：十字胶带、−u 侧"向上"箭头、+v 面白色面单（条码 + 两行横线）。
// opts: stack=1（叠几个）, z=0（离地高度）, state:"lost"（没有送达的包裹：箱体淡红虚线空壳 + 红面单）
// 可动：ID-real（实体）/ ID-lost（红虚线空壳）— KITX07.lose(tl,ID,t) 由实变空；ID-label（面单）/ ID-label-r（红面单）
//       KITX07.parcelLabel(tl,ID,t,"red"|"normal")；第 k 个箱子 ID-b-k
// 根元素带 data-px/py（底部中心），可用 KITX01.walk 或 KITX06.carry 移动。
// anchors: top, center, ground, label（面单中心）
// =====================================================================================
export function parcel(o, opts = {}) {
  const p = opts.id ?? "parcel", K = opts.scale ?? 1, n = Math.max(1, opts.stack ?? 1), z0 = opts.z ?? 0, atk = isAtk(opts);
  const lost = opts.state === "lost";
  const W = 60, D = 48, H = 44, u0 = -W / 2, u1 = W / 2, v0 = -D / 2, v1 = D / 2;
  const CARD = atk ? mat("#d0645a", { st: "#8f2620" }) : { f: "#cfa168", s: "#b58650", t: "#e0bb85", st: "#7d5a30" };
  const TAPE = atk ? "#f2c2bc" : "#e8d3a2", TAPE_E = atk ? "#c9877e" : "#b89c62";
  const offs = (k) => [k % 2 ? 4 : 0, k % 2 ? -3 : 0];
  let real = "", ghost = "";
  for (let k = 0; k < n; k++) {
    const [du, dv] = offs(k), zb = z0 + k * H;
    const A = (a, b, z) => at(o, a + du, b + dv, z);
    let b = box(o, u0 + du, u1 + du, v0 + dv, v1 + dv, zb, zb + H, CARD, 1.5);
    // flap seam + tape on top
    b += G_(faceTop(o, du, dv, zb + H), `<rect x="${u0}" y="-6" width="${W}" height="12" fill="${TAPE}" stroke="${TAPE_E}" stroke-width="0.8" opacity="0.95"/><path d="M${u0 + 2} 0H${u1 - 2}" stroke="${darken(CARD.t, 0.2)}" stroke-width="1"/>
      <rect x="-5" y="${v0}" width="10" height="${D}" fill="${TAPE}" stroke="${TAPE_E}" stroke-width="0.8" opacity="0.9"/>`);
    // tape running down the +v face and the −u face
    b += G_(faceV(o, u0 + du, v1 + dv, zb + H), `<rect x="${W / 2 - 5}" y="0" width="10" height="15" fill="${TAPE}" stroke="${TAPE_E}" stroke-width="0.8"/><path d="M${W / 2 - 5} 15l2.5 2 2.5-2 2.5 2 2.5-2" fill="${TAPE}" stroke="${TAPE_E}" stroke-width="0.6"/>
      <path d="M2 ${H - 3}H${W - 2}" stroke="${darken(CARD.s, 0.12)}" stroke-width="1"/>`);
    b += G_(faceU(o, u0 + du, v0 + dv, zb + H), `<rect x="${D / 2 - 6}" y="0" width="12" height="13" fill="${TAPE}" stroke="${TAPE_E}" stroke-width="0.8"/>
      <path d="M10 ${H - 10}v-12m-3.5 3.5l3.5-3.5 3.5 3.5M18 ${H - 10}v-12m-3.5 3.5l3.5-3.5 3.5 3.5" fill="none" stroke="#5a3f1f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="${D - 18}" y="${H - 16}" width="10" height="8" fill="none" stroke="#5a3f1f" stroke-width="1.2"/><path d="M${D - 16} ${H - 12}h6" stroke="#5a3f1f" stroke-width="1"/>`);
    // shipping label on +v face (top box carries the animated label)
    const lab = (red) => {
      const ink = red ? "#e0453a" : C.ink;
      let bars = ""; let x = 7;
      for (let i = 0; i < 13; i++) { const w = [1, 2, 1, 3, 1, 1, 2][i % 7]; bars += `<rect x="${x}" y="15" width="${w}" height="9" fill="${ink}"/>`; x += w + 1.2; }
      return `<rect x="3" y="3" width="30" height="24" rx="1.5" fill="${red ? "#fde6e3" : "#ffffff"}" stroke="${red ? "#e0453a" : "#b8b0a1"}" stroke-width="${red ? 1.8 : 1}"/>
        <rect x="6" y="6.5" width="16" height="2" rx="1" fill="${ink}"/><rect x="6" y="10.5" width="22" height="1.6" rx="0.8" fill="${red ? "#f08a80" : "#9a958b"}"/>${bars}`;
    };
    const mL = frameV(o, u0 + 6 + du, v1 + dv, zb + H - 14);
    if (k === n - 1) b += `<g id="${p}-label">${G_(matStr(mL), lab(false))}</g><g id="${p}-label-r" opacity="${lost ? 1 : 0}">${G_(matStr(mL), lab(true))}</g>`;
    else b += G_(matStr(mL), lab(false));
    real += `<g id="${p}-b-${k}">${b}</g>`;
    // red dashed empty shell
    const P4 = (pp) => pts(pp);
    ghost += `<polygon points="${P4([A(u0, v0, zb), A(u0, v1, zb), A(u0, v1, zb + H), A(u0, v0, zb + H)])}" fill="rgba(224,69,58,0.10)"/>
      <polygon points="${P4([A(u0, v1, zb), A(u1, v1, zb), A(u1, v1, zb + H), A(u0, v1, zb + H)])}" fill="rgba(224,69,58,0.16)"/>
      <polygon points="${P4([A(u0, v0, zb + H), A(u1, v0, zb + H), A(u1, v1, zb + H), A(u0, v1, zb + H)])}" fill="rgba(224,69,58,0.06)"/>
      <path d="${edges({ u: o.u + du, v: o.v + dv }, u0, u1, v0, v1, zb, zb + H)}" fill="none" stroke="#e0453a" stroke-width="2.4" stroke-dasharray="7 5" stroke-linejoin="round"/>` +
      (k === n - 1 ? G_(matStr(mL), `<rect x="3" y="3" width="30" height="24" rx="1.5" fill="#fde6e3" stroke="#e0453a" stroke-width="1.8"/><path d="M10 9l16 12M26 9l-16 12" stroke="#e0453a" stroke-width="2.4" stroke-linecap="round"/>`) : "");
  }
  const sh = `<g transform="${faceTop(o, 0, 0, z0)}"><ellipse cx="0" cy="0" rx="${W * 0.8}" ry="${D * 0.8}" fill="url(#shadowG)"/></g>`;
  const s = `<g id="${p}-real" opacity="${lost ? 0 : 1}">${sh}${real}</g><g id="${p}-lost" opacity="${lost ? 1 : 0}">${ghost}</g>`;
  const zt = z0 + n * H, g = at(o, 0, 0, z0);
  const anchors = { top: at(o, 0, 0, zt + 34), center: at(o, 0, 0, z0 + (n * H) / 2), ground: g, foot: g, label: at(o, u0 + 24, v1, zt - 29) };
  return {
    svg: shell(p, o, { ...opts, state: lost ? "normal" : opts.state }, { solid: s, wire: [[u0, u1, v0, v1, z0, zt]], center: anchors.center, badgeR: 18, k: K, attrs: `data-px="${f(g[0])}" data-py="${f(g[1])}"` }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

// =====================================================================================
// 回执签 returnTag — 从管子回程口弹出的硬卡纸小签（约 70×40，立着，上沿穿绳孔 + 一截棉绳，脚下黑色小夹座）
// 卡面三种：ok（绿边，墨字 true）、false（红边，false）、empty（灰虚线边，空白，只有一个 ∅ 压印）
// opts: face="ok"|"false"|"empty", stamp=null|"ok"|"x"（叠印：绿勾"被当成成功" / 红叉）, z=0, stand=true, scale=1（近景建议 1.4–1.8）
// 可动：ID-face-ok / ID-face-false / ID-face-empty（KITX07.tagFace 或 KIT.swap 切换）, ID-stamp-ok / ID-stamp-x（KITX07.tagStamp）,
//       ID-pop（弹出用的内层组，KITX07.tagPop；根 ID 留给 carry / walk）
// anchors: top, center, ground, face（卡面中心）, hole（穿绳孔）
// =====================================================================================
export function returnTag(o, opts = {}) {
  const p = opts.id ?? "tag", K = opts.scale ?? 1, z = opts.z ?? 0, stand = opts.stand !== false, face = opts.face ?? "ok";
  const W = 70, H = 40, lift = stand ? 9 : 0, zt = z + lift + H;
  const m = frameV(o, -W / 2, 0, zt);
  let s = `<g transform="${faceTop(o, 0, 0, z)}"><ellipse cx="0" cy="0" rx="${W * 0.55}" ry="14" fill="url(#shadowG)"/></g>`;
  if (stand) {
    s += box(o, -16, 16, -7, 5, z, z + lift + 3, M.ink, 1.2);
    s += G_(faceTop(o, 0, -1, z + lift + 3), `<rect x="-13" y="-1.6" width="26" height="3.2" fill="#141518"/>`);
  }
  // string loop (behind the card)
  const [hx, hy] = applyM(m, W / 2, 7);
  s += `<path d="M${f(hx)} ${f(hy)}C${f(hx - 14)} ${f(hy - 26)} ${f(hx + 18)} ${f(hy - 34)} ${f(hx + 6)} ${f(hy - 14)}" fill="none" stroke="#8a7a5a" stroke-width="2" stroke-linecap="round"/>`;
  // thickness
  for (let i = 3; i >= 1; i--) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(m), `<rect x="0" y="0" width="${W}" height="${H}" rx="4" fill="#d8d1c4"/>`)}</g>`;
  const faces = {
    ok: `<rect x="0" y="0" width="${W}" height="${H}" rx="4" fill="#ffffff" stroke="#b8b0a1" stroke-width="1"/><rect x="2.5" y="2.5" width="${W - 5}" height="${H - 5}" rx="3" fill="#f4fbf6" stroke="#1f9d55" stroke-width="3.6"/>` +
      txt(W / 2, 32, "true", { size: 19, mono: true, anchor: "middle", weight: 800 }),
    false: `<rect x="0" y="0" width="${W}" height="${H}" rx="4" fill="#ffffff" stroke="#b8b0a1" stroke-width="1"/><rect x="2.5" y="2.5" width="${W - 5}" height="${H - 5}" rx="3" fill="#fff5f4" stroke="#e0453a" stroke-width="3.6"/>` +
      txt(W / 2, 32, "false", { size: 19, mono: true, anchor: "middle", weight: 800 }),
    empty: `<rect x="0" y="0" width="${W}" height="${H}" rx="4" fill="#fbf9f4" stroke="#b8b0a1" stroke-width="1"/><rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="3" fill="none" stroke="#9a958b" stroke-width="2.2" stroke-dasharray="5 4"/>` +
      `<circle cx="${W / 2 + 0.7}" cy="${25.7}" r="6.5" fill="none" stroke="#ffffff" stroke-width="1.8"/><path d="M${W / 2 - 6.3} 33.7L${W / 2 + 7.7} 17.7" stroke="#ffffff" stroke-width="1.8"/>` +
      `<circle cx="${W / 2}" cy="25" r="6.5" fill="none" stroke="#c9c3b7" stroke-width="1.8"/><path d="M${W / 2 - 7} 33L${W / 2 + 7} 17" stroke="#c9c3b7" stroke-width="1.8"/>`,
  };
  const grom = `<circle cx="${W / 2}" cy="7" r="4.2" fill="#d4d7db" stroke="#7d828a" stroke-width="1.2"/><circle cx="${W / 2}" cy="7" r="2" fill="#6d685e"/>`;
  let fc = "";
  for (const k of ["ok", "false", "empty"]) fc += `<g id="${p}-face-${k}" opacity="${face === k ? 1 : 0}">${faces[k]}${grom}</g>`;
  const stamp = (kind) => kind === "ok"
    ? `<g transform="translate(${W - 10} ${H - 8}) rotate(-12)"><circle r="13" fill="rgba(31,157,85,0.14)" stroke="#1f9d55" stroke-width="2.6"/><circle r="10" fill="none" stroke="#1f9d55" stroke-width="0.9"/><path d="M-6 0.5l4 4.5 8.5-9" fill="none" stroke="#1f9d55" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></g>`
    : `<g transform="translate(${W - 10} ${H - 8}) rotate(-12)"><circle r="13" fill="rgba(224,69,58,0.14)" stroke="#e0453a" stroke-width="2.6"/><circle r="10" fill="none" stroke="#e0453a" stroke-width="0.9"/><path d="M-5 -5l10 10M5 -5l-10 10" stroke="#e0453a" stroke-width="3.4" stroke-linecap="round"/></g>`;
  fc += `<g id="${p}-stamp-ok" opacity="${opts.stamp === "ok" ? 1 : 0}">${stamp("ok")}</g><g id="${p}-stamp-x" opacity="${opts.stamp === "x" ? 1 : 0}">${stamp("x")}</g>`;
  s += G_(matStr(m), fc);
  const [ox, oy] = at(o, 0, 0, z);
  const solid = `<g id="${p}-pop" data-ox="${f(ox)}" data-oy="${f(oy)}">${s}</g>`;
  const anchors = { top: at(o, 0, 0, zt + 34), center: applyM(m, W / 2, H / 2), face: applyM(m, W / 2, H / 2), ground: at(o, 0, 0, z), hole: [hx, hy] };
  return { svg: shell(p, o, opts, { solid, wire: [[-W / 2, W / 2, -3, 0, z + lift, zt]], center: anchors.center, badgeR: 16, k: K }), anchors: scaleAnchors(o, K, anchors) };
}

// =====================================================================================
// 发货登记台 dispatchDesk — 窄长木柜台（约 200×100×112）：竖拼木板正面 + 凸框，台面一本 kit ledgerBook（登记簿），
// 右页是一张新页，可逐行写入记录；台前镀铬"回执投入口"，−u 侧挂一盏小灯。
// opts: entries（数组，每项字符串或 {text, kind:"ok"|"ghost"}；默认 4 行），shown=0（一开始已写好的行数），led="off", book=true
// 可动：ID-entry-i（第 i 行墨迹：ok 墨色 / ghost 红色"没发生的那一笔"，KITX07.entry 写出）, ID-led（KIT.led）, ID-slot-hi（投入口高亮，KITX07.slotFlash）
// anchors: top, center, ground, slot（回执投入口）, book（登记簿页面中心）, entries[]（每行起点）, led
// =====================================================================================
export function dispatchDesk(o, opts = {}) {
  const p = opts.id ?? "desk7", K = opts.scale ?? 1, atk = isAtk(opts);
  const u0 = -96, u1 = 96, v0 = -46, v1 = 46, zb = 8, zc = 104, zt = 112;
  const body = atk ? mat("#c9463c") : { f: "#a87346", s: "#8a5a32", t: "#c08b5c", st: "#4f3018" };
  let s = contactShadow(o, 170, 90);
  s += box(o, u0 + 4, u1 - 4, v0 + 4, v1 - 4, 0, zb, M.ink, 1.2);
  s += box(o, u0, u1, v0, v1, zb, zc, body, 1.8);
  // front planks + raised frame
  const mF = frameV(o, u0, v1, zc);
  const FW = u1 - u0, FH = zc - zb;
  let ff = "";
  for (let x = 24; x < FW; x += 24) ff += `<path d="M${x} 4V${FH - 3}" stroke="${darken(body.s, 0.2)}" stroke-width="1.4"/><path d="M${x + 1.4} 4V${FH - 3}" stroke="${lighten(body.s, 0.12)}" stroke-width="0.8"/>`;
  for (let i = 0; i < 6; i++) ff += `<path d="M${10 + i * 31} ${18 + (i % 3) * 22}q6 3 12 0" stroke="${darken(body.s, 0.12)}" stroke-width="1" fill="none"/>`;
  ff += `<rect x="6" y="6" width="${FW - 12}" height="${FH - 12}" rx="3" fill="none" stroke="${lighten(body.s, 0.22)}" stroke-width="2.2"/><rect x="8.5" y="8.5" width="${FW - 17}" height="${FH - 17}" rx="2" fill="none" stroke="${darken(body.s, 0.3)}" stroke-width="1.2"/>`;
  // return slot (chrome bezel)
  const sx = FW * 0.62, sy = 22, sw = 64, shh = 26;
  ff += `<rect x="${sx}" y="${sy}" width="${sw}" height="${shh}" rx="5" fill="#d4d7db" stroke="#5a5e65" stroke-width="1.6"/><rect x="${sx + 3}" y="${sy + 2}" width="${sw - 6}" height="3" rx="1.5" fill="#f4f5f6"/>
    <rect x="${sx + 8}" y="${sy + 11}" width="${sw - 16}" height="7" rx="3.5" fill="#141518"/><rect x="${sx + 10}" y="${sy + 17}" width="${sw - 20}" height="1.4" fill="#45484e"/>
    <rect id="${p}-slot-hi" x="${sx - 3}" y="${sy - 3}" width="${sw + 6}" height="${shh + 6}" rx="7" fill="none" stroke="#2aa3c9" stroke-width="4" opacity="0"/>`;
  ff += `<rect x="${sx + 6}" y="${sy + shh + 6}" width="${sw - 12}" height="14" rx="2" fill="#eef0f2" stroke="#7d828a" stroke-width="1"/>` + txt(sx + sw / 2, sy + shh + 17, "回执 ▼", { size: 10, anchor: "middle", fill: "#3b3e44", weight: 800 });
  // brass-free plaque on the left
  ff += `<rect x="20" y="22" width="62" height="20" rx="3" fill="#2b2d31" stroke="#141518" stroke-width="1.2"/>` + txt(51, 36, "DISPATCH", { size: 9, mono: true, anchor: "middle", fill: "#d3d7dc", weight: 700 });
  s += G_(matStr(mF), ff);
  // −u face: panel + wall lamp
  const mU = frameU(o, u0, v0, zc);
  s += G_(matStr(mU), `<rect x="6" y="6" width="${v1 - v0 - 12}" height="${FH - 12}" rx="3" fill="none" stroke="${lighten(body.f, 0.18)}" stroke-width="2"/>
    <rect x="${(v1 - v0) / 2 - 6}" y="2" width="12" height="16" rx="2" fill="#3b3e44"/><path d="M${(v1 - v0) / 2} 14v6" stroke="#3b3e44" stroke-width="3"/>
    <circle cx="${(v1 - v0) / 2}" cy="27" r="10" fill="#2b2d31" stroke="#141518" stroke-width="1.4"/>` + ledSvg(p + "-led", (v1 - v0) / 2, 27, 6.5, opts.led ?? "off"));
  // top slab
  s += box(o, u0 - 6, u1 + 6, v0 - 6, v1 + 6, zc, zt, { f: body.t, s: body.f, t: lighten(body.t, 0.12), st: body.st }, 1.6);
  s += G_(faceTop(o, 0, 0, zt), `<path d="M${u0} ${v0 + 14}H${u1}M${u0} ${v0 + 44}H${u1}M${u0} ${v0 + 74}H${u1}" stroke="${darken(body.t, 0.12)}" stroke-width="1"/>`);
  // ledger book on the top (kit ledgerBook, lifted by zt)
  const kB = 0.55, oB = { u: o.u - 4, v: o.v };
  const zLift = sv(0, 0, zt);
  if (opts.book !== false) {
    s += `<g transform="translate(0 ${f(zLift[1])})">${ledgerBook(oB, { id: p + "-book", scale: kB }).svg}</g>`;
    // fresh right-hand page (same profile as kit ledgerBook)
    const prof = [[0, 9], [6, 16], [14, 21], [26, 24], [40, 25], [70, 24.5], [100, 23.5], [124, 22]].map(([u, zz]) => [u * kB, zz * kB]);
    const Hp = 84 * kB;
    const zAt = (u) => { for (let i = 1; i < prof.length; i++) if (u <= prof[i][0]) { const a = prof[i - 1], b = prof[i]; return a[1] + ((u - a[0]) / (b[0] - a[0])) * (b[1] - a[1]); } return prof[prof.length - 1][1]; };
    const Z = (zz) => zt + zz + 0.4;
    const surf = [...prof.map(([u, zz]) => at(oB, u, -Hp + 2, Z(zz))), ...prof.slice().reverse().map(([u, zz]) => at(oB, u, Hp - 2, Z(zz)))];
    s += `<polygon points="${pts(surf)}" fill="#fffdf6" stroke="none"/>`;
    const uu = [8, 20, 40, 60, 68].map((x) => x);
    for (let i = 0; i < 6; i++) { const vv = -Hp + 12 + i * 13; s += line3(oB, uu.map((u) => [u, vv, Z(zAt(u))]), "#d8d0c0", 1); }
    s += line3(oB, uu.map((u) => [u, -Hp + 6, Z(zAt(u))]), "#2aa3c9", 2.2);
  }
  // entries (written on the fresh page, top plane approximation at the page height)
  const E = (opts.entries ?? ["+ 收款", "+ 发货", "+ 转账", "+ 退款"]).map((e) => (typeof e === "string" ? { text: e, kind: "ok" } : e));
  const shown = opts.shown ?? 0, zE = zt + 13.6;
  const entryPts = [];
  let es = "";
  E.slice(0, 6).forEach((e, i) => {
    const vv = -84 * kB + 10 + i * 13, col = e.kind === "ghost" ? "#e0453a" : C.ink;
    const mT = frameTop({ u: o.u - 4, v: o.v }, 6, vv, zE);
    const w = 62;
    es += `<g id="${p}-entry-${i}" opacity="${i < shown ? 1 : 0}" data-w="${w}">${G_(matStr(mT), `<defs><clipPath id="${p}-ec-${i}"><rect id="${p}-entry-${i}-c" x="-2" y="-12" width="${i < shown ? w + 4 : 0}" height="16"/></clipPath></defs>
      <g clip-path="url(#${p}-ec-${i})">${txt(0, 0, e.text, { size: 9.5, fill: col, weight: 900 })}<path d="M0 2.4H${w - 6}" stroke="${col}" stroke-width="${e.kind === "ghost" ? 1.6 : 1.1}" ${e.kind === "ghost" ? 'stroke-dasharray="3 2"' : ""}/></g>`)}</g>`;
    entryPts.push(at({ u: o.u - 4, v: o.v }, 6, vv, zE));
  });
  s += es;
  const anchors = { top: at(o, 0, 0, zt + 70), center: at(o, 0, 0, zc / 2), ground: at(o), slot: applyM(mF, sx + sw / 2, sy + shh / 2), book: at(oB, 0, 0, zt + 14), entries: entryPts, led: applyM(mU, (v1 - v0) / 2, 27) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0, u1, v0, v1, 0, zt], [-76, 72, -50, 50, zt, zt + 16]], center: anchors.center, glowR: 180, k: K }), anchors: scaleAnchors(o, K, anchors) };
}

// =====================================================================================
// 怪代币 oddCoin — 大硬币（直径 80、厚 8，齿纹币边）竖立在黑色小底座的镀铬卡托上；币面中央一个浮雕图标。
// kind: plain（标准 ERC-20，无图标）| mute（嘴封胶带：不返回值）| liar（绿勾 + 红"false"小旗：成功却报失败）
//       | tax（币边缺口 + 小剪刀：收税）| rebase（币面 ↕，旁边上下箭头：余额自动变化）| frozen（结霜 + 雪花 + 冰溜子：黑名单冻结）
//       | pause（暂停键 ‖）| hook（币背伸出弹簧钩 + 币面钩子：转账钩子）| upgrade（扳手 + 螺丝：可升级）
// opts: kind, num（底座编号牌，1–8；省略则不写）, numLit=false（编号牌亮青蓝）, icon=true（false 时图标先隐藏）, state:"attacker"（红币）
// 可动：ID-coin（整枚币，KITX07.coinFlip 翻转 / coinScale 缩放 / breathe 呼吸）, ID-icon（图标，KITX07.iconOn 显出）,
//       ID-icon-hi（图标高亮环，KITX07.iconHi）, ID-num / ID-num-lit（编号牌，KITX07.numOn）, ID-chip（tax 缺口掉下的碎屑）
// anchors: top, center, ground, face（币面中心）, base（底座顶面）, num（编号牌）
// =====================================================================================
export const COIN_KINDS = ["mute", "liar", "tax", "rebase", "frozen", "pause", "hook", "upgrade"];
export function oddCoin(o, opts = {}) {
  const p = opts.id ?? "coin", K = opts.scale ?? 1, atk = isAtk(opts), kind = opts.kind ?? "plain";
  const R = 40, T = 8, zp = 24, zc = zp + 8 + R;
  const g = atk ? { hi: "#f6a399", mid: "#e0453a", lo: "#b8332a", rim: "#9c2a22", dk: "#7a1d17", emb: "#f4b2aa" }
    : { hi: "#fff0b0", mid: "#f0c04a", lo: "#d39a22", rim: "#b98318", dk: "#8a5f10", emb: "#ffe9a0" };
  let s = contactShadow(o, 70, 46);
  // pedestal
  s += rbox(o, -34, 34, -22, 22, 0, zp - 6, 4, M.ink, { sw: 1.4 });
  s += rbox(o, -30, 30, -18, 18, zp - 6, zp, 3, { f: "#4a4d53", s: "#34363b", t: "#5d6168", st: "#141518" }, { sw: 1.2 });
  // number plate on the pedestal front
  const mN = frameV(o, -34, 22, zp - 6);
  const num = opts.num != null ? String(opts.num) : "";
  if (num) {
    s += G_(matStr(mN), `<g id="${p}-num"><rect x="23" y="2.5" width="22" height="13" rx="2" fill="#f6f3ec" stroke="#9a958b" stroke-width="1"/>${txt(34, 13.3, num, { size: 11, mono: true, anchor: "middle", weight: 800 })}</g>
      <g id="${p}-num-lit" opacity="${opts.numLit ? 1 : 0}"><rect x="22" y="1.5" width="24" height="15" rx="2.5" fill="#1d93ba" stroke="#ffffff" stroke-width="1.2"/>${txt(34, 13.3, num, { size: 11, mono: true, anchor: "middle", weight: 800, fill: "#ffffff" })}</g>`);
  }
  // cradle prongs (back halves before the coin)
  const prong = (du) => box(o, du - 4, du + 4, -9, -3, zp, zp + 14, CHROME, 1);
  const prongF = (du) => box(o, du - 4, du + 4, 3 + T, 9 + T, zp, zp + 14, CHROME, 1);
  s += prong(-20) + prong(20);
  // ---- the coin, drawn in its own +v plane frame centred on the coin
  const mC = frameV(o, 0, T / 2 + 2, zc);
  const notch = kind === "tax";
  const coinD = (r) => {
    if (!notch) return `M${r} 0A${r} ${r} 0 1 1 ${-r} 0A${r} ${r} 0 1 1 ${r} 0Z`;
    const a0 = -38 * DEG, a1 = -14 * DEG, ri = r - 13;
    const P = (a, rr) => `${f(rr * Math.cos(a))} ${f(rr * Math.sin(a))}`;
    return `M${P(a1, r)}A${r} ${r} 0 1 1 ${P(a0, r)}L${P(a0 + 4 * DEG, ri)}L${P((a0 + a1) / 2, ri + 3)}L${P(a1 - 4 * DEG, ri)}Z`;
  };
  // local offset of the −v direction in this frame (exact for the unflipped coin)
  const bx = -V[0] / U[0], by = (-V[1] - bx * U[1]) / CE;
  let cn = `<defs><linearGradient id="${p}-cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${g.hi}"/><stop offset="0.45" stop-color="${g.mid}"/><stop offset="1" stop-color="${g.lo}"/></linearGradient>
    <linearGradient id="${p}-cf" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${g.hi}"/><stop offset="0.5" stop-color="${g.mid}"/><stop offset="1" stop-color="${g.lo}"/></linearGradient></defs>`;
  // hook (behind the coin)
  if (kind === "hook") {
    let coil = `M${f(R * 0.35)} ${f(-R * 0.35)}`;
    for (let i = 1; i <= 9; i++) { const t = i / 9, x = R * 0.35 + t * 34, y = -R * 0.35 - t * 34, w = i % 2 ? 6 : -6; coil += `L${f(x + w * 0.7)} ${f(y + w * 0.7)}`; }
    const ex = R * 0.35 + 34, ey = -R * 0.35 - 34;
    cn += `<path d="${coil}" fill="none" stroke="#5a5e65" stroke-width="3.2" stroke-linejoin="round"/><path d="${coil}" fill="none" stroke="#c3c8ce" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M${f(ex)} ${f(ey)}l4 -14c2 -9 14 -9 15 0c1 7 -5 10 -9 7" fill="none" stroke="#3b3e44" stroke-width="4" stroke-linecap="round"/><path d="M${f(ex)} ${f(ey)}l4 -14c2 -9 14 -9 15 0c1 7 -5 10 -9 7" fill="none" stroke="#c3c8ce" stroke-width="1.4" stroke-linecap="round"/>`;
  }
  // rim (stacked back copies → thickness), reeded edge on the back-most copy
  for (let i = 6; i >= 1; i--) {
    const k = (i / 6) * T;
    cn += `<path d="${coinD(R)}" transform="translate(${f(bx * k)} ${f(by * k)})" fill="${i === 6 ? g.dk : g.rim}" stroke="${i === 6 ? g.dk : "none"}" stroke-width="1.2"/>`;
  }
  cn += `<path d="${coinD(R)}" transform="translate(${f(bx * T * 0.5)} ${f(by * T * 0.5)})" fill="none" stroke="${g.emb}" stroke-width="2.2" stroke-dasharray="1.6 2.4" opacity="0.8"/>`;
  // front face: outer lip, denticles, inner field
  cn += `<path d="${coinD(R)}" fill="url(#${p}-cg)" stroke="${g.dk}" stroke-width="1.6"/>`;
  cn += `<circle r="${R - 6}" fill="url(#${p}-cf)" stroke="${g.rim}" stroke-width="1.2"/><circle r="${R - 3}" fill="none" stroke="${g.emb}" stroke-width="1.6" stroke-dasharray="1.4 2.6"/>`;
  cn += `<circle r="${R - 8.5}" fill="none" stroke="${g.emb}" stroke-width="0.8" opacity="0.8"/>`;
  if (notch) cn += `<path d="${coinD(R)}" fill="none" stroke="${g.dk}" stroke-width="1.6"/>`;
  // emboss helper: shadow / highlight / body
  const emb = (d, sw = 0, fillBody = g.mid) => sw
    ? `<path d="${d}" transform="translate(1.3 1.3)" fill="none" stroke="${g.dk}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" transform="translate(-0.7 -0.7)" fill="none" stroke="${g.emb}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${fillBody}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="${d}" transform="translate(1.3 1.3)" fill="${g.dk}"/><path d="${d}" transform="translate(-0.7 -0.7)" fill="${g.emb}"/><path d="${d}" fill="${fillBody}"/>`;
  let ic = "";
  if (kind === "plain") {
    ic += emb(`M0 -18L15.6 -9V9L0 18L-15.6 9V-9Z`, 3.2) + emb(`M0 -8L7 -4V4L0 8L-7 4V-4Z`);
  } else if (kind === "mute") {
    ic += emb(`M-11 -12a4 4 0 1 0 0.1 0Z`) + emb(`M11 -12a4 4 0 1 0 0.1 0Z`);
    ic += emb(`M-14 9Q0 16 14 9`, 3);
    const tape = (rot) => `<g transform="translate(0 9) rotate(${rot})"><rect x="-21" y="-5.5" width="42" height="11" rx="1" fill="rgba(90,60,20,0.25)" transform="translate(1 1.4)"/><rect x="-21" y="-5.5" width="42" height="11" rx="1" fill="#efe4c6" stroke="#b9a77a" stroke-width="1"/>
      <path d="M-21 -5.5l-2 2.7 2 2.7-2 2.7 2 2.9M21 -5.5l2 2.7-2 2.7 2 2.7-2 2.9" fill="#efe4c6" stroke="#b9a77a" stroke-width="0.8"/><path d="M-17 -2H17" stroke="#ffffff" stroke-width="1.2" opacity="0.7"/></g>`;
    ic += tape(-16) + tape(16);
  } else if (kind === "liar") {
    ic += `<path d="M-15 1l10 10 20 -21" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M-15 1l10 10 20 -21" fill="none" stroke="#1f9d55" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    // little red "false" flag on a pole clipped to the coin's upper-right edge
    const bx0 = R * 0.62, by0 = -R * 0.62;
    ic += `<path d="M${f(bx0)} ${f(by0)}L${f(bx0 + 7)} ${f(by0 - 40)}" stroke="#3b3e44" stroke-width="2.6" stroke-linecap="round"/><circle cx="${f(bx0 + 7)}" cy="${f(by0 - 41)}" r="2.4" fill="#d4d7db" stroke="#3b3e44" stroke-width="1"/>
      <path d="M${f(bx0 + 7)} ${f(by0 - 38)}h40l-5 8 5 8h-40Z" fill="#e0453a" stroke="#a8322a" stroke-width="1.2" stroke-linejoin="round"/>` +
      txt(bx0 + 25, by0 - 25.5, "false", { size: 10, mono: true, anchor: "middle", fill: "#ffffff", weight: 800 }) +
      `<rect x="${f(bx0 - 3)}" y="${f(by0 - 2)}" width="7" height="6" rx="1" fill="#7d828a" transform="rotate(10 ${f(bx0)} ${f(by0)})"/>`;
  } else if (kind === "tax") {
    // scissors: two finger loops at lower-left, blades opening toward the notch (upper right)
    const sc = `<g transform="rotate(-28)">
      <circle cx="-17" cy="-5" r="6" fill="none" stroke="#3b3e44" stroke-width="3.4"/><circle cx="-17" cy="7" r="6" fill="none" stroke="#3b3e44" stroke-width="3.4"/>
      <path d="M-11 -3L18 -9L20 -7L-6 3Z" fill="#d4d7db" stroke="#5a5e65" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M-11 5L18 9L20 7L-6 -1Z" fill="#eceef0" stroke="#5a5e65" stroke-width="1.2" stroke-linejoin="round"/>
      <circle cx="-3" cy="1" r="2.2" fill="#3b3e44"/></g>`;
    ic += `<g transform="translate(-2 4)">${sc}</g>`;
  } else if (kind === "rebase") {
    ic += emb(`M0 -21L9 -10H3.5V10H9L0 21L-9 10H-3.5V-10H-9Z`);
    ic += emb(`M-20 -2H-12M12 -2H20`, 2.4);
  } else if (kind === "frozen") {
    let sf = "";
    for (let i = 0; i < 6; i++) {
      const a = i * 60;
      sf += `<g transform="rotate(${a})"><path d="M0 0V-21M0 -12l-6 -6M0 -12l6 -6M0 -5l-4 -4M0 -5l4 -4" fill="none" stroke="#2f7fa8" stroke-width="2.6" stroke-linecap="round"/></g>`;
    }
    ic += sf;
  } else if (kind === "pause") {
    ic += emb(`M0 -23a23 23 0 1 0 0.1 0Z`, 3) + emb(`M-11 -12h7v24h-7ZM4 -12h7v24h-7Z`);
  } else if (kind === "hook") {
    ic += emb(`M4 -20V6a8 8 0 1 1 -16 0V1`, 4.6) + emb(`M-12 1l-4 6M-12 1l4 6`, 2.6) + emb(`M-2 -20h12`, 3.6);
  } else if (kind === "upgrade") {
    // screw head (lower-left) + open-end wrench (diagonal, jaw at upper right)
    ic += emb(`M-13 4a9 9 0 1 0 0.1 0Z`) + `<path d="M-19 13H-7" stroke="${g.dk}" stroke-width="2.4" stroke-linecap="round" transform="rotate(45 -13 13)"/>`;
    const jc = [11, -11], jr = 7, P = (a) => `${f(jc[0] + jr * Math.cos(a * DEG))} ${f(jc[1] + jr * Math.sin(a * DEG))}`;
    ic += emb(`M-8 8L6 -6`, 6) + emb(`M${P(-10)}A${jr} ${jr} 0 1 1 ${P(-80)}`, 5);
  }
  // icon group (frost overlay for frozen goes on the face too)
  let pre = "";
  if (kind === "frozen") {
    pre += `<circle r="${R - 1}" fill="rgba(214,238,248,0.55)"/>`;
    const rr = rng(p + ":frost");
    for (let i = 0; i < 26; i++) { const a = rr() * 2 * Math.PI, d = rr() * (R - 6); pre += `<circle cx="${f(d * Math.cos(a))}" cy="${f(d * Math.sin(a))}" r="${f(0.8 + rr() * 1.8)}" fill="#ffffff" opacity="0.85"/>`; }
    // icicles along the lower rim
    let ice = "";
    for (let i = 0; i < 7; i++) { const a = (60 + i * 10) * DEG, x = R * Math.cos(a), y = R * Math.sin(a) - 1, L = 7 + ((i * 7) % 5) * 2.4; ice += `<path d="M${f(x - 3)} ${f(y)}L${f(x)} ${f(y + L)}L${f(x + 3)} ${f(y)}Z" fill="#dff1f9" stroke="#7fb8d6" stroke-width="0.9"/>`; }
    pre += ice;
  }
  const iconOn = opts.icon !== false;
  cn += pre + `<g id="${p}-icon" opacity="${iconOn ? 1 : 0}">${ic}</g>`;
  // gloss
  cn += `<path d="M${-R * 0.72} ${-R * 0.28}A${R * 0.78} ${R * 0.78} 0 0 1 ${-R * 0.1} ${-R * 0.76}" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.55"/>`;
  let coin = `<g id="${p}-coin" data-a="0" data-s="1">${cn}</g>`;
  // outside the flip group: rebase arrows, highlight ring, tax chip
  let side = "";
  if (kind === "rebase") {
    side += `<path d="M${R + 14} -8V-30M${R + 7} -23L${R + 14} -31L${R + 21} -23" fill="none" stroke="#1d93ba" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${R + 14} 8V30M${R + 7} 23L${R + 14} 31L${R + 21} 23" fill="none" stroke="#1d93ba" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  if (notch) {
    const a = -26 * DEG;
    side += `<g id="${p}-chip" opacity="${opts.chip === false ? 0 : 1}"><path d="M${f((R + 9) * Math.cos(a))} ${f((R + 9) * Math.sin(a) - 4)}l9 3 -3 8 -9 -2Z" fill="${g.mid}" stroke="${g.dk}" stroke-width="1.2" stroke-linejoin="round"/></g>`;
  }
  side += `<circle id="${p}-icon-hi" r="${R + 6}" fill="none" stroke="#2aa3c9" stroke-width="4" opacity="0"/>`;
  s += G_(matStr(mC), coin + side);
  s += prongF(-20) + prongF(20);
  const anchors = { top: at(o, 0, 0, zc + R + (kind === "liar" || kind === "hook" ? 64 : 26)), center: at(o, 0, 0, zc), face: applyM(mC, 0, 0), ground: at(o), base: at(o, 0, 0, zp), num: applyM(mN, 34, 9) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-34, 34, -22, 22, 0, zp], [-R, R, 0, T, zp + 8, zc + R]], center: anchors.center, badgeR: 22, glowR: 90, k: K }), anchors: scaleAnchors(o, K, anchors) };
}

// =====================================================================================
// 到账台秤 scale — 商店电子台秤：低平秤台（不锈钢秤盘）+ 后立柱 + 显示头。显示头正面是青蓝底 LCD，
// 两行"前 / 后"读数，下面一条"差 = …"（相等绿、不等红）。约 150×110×195。
// opts: before（"前"读数，数字或字符串，null 为空）, after, diff（字符串）, diffOk（true 绿 / false 红 / 省略 = 不显示）,
//       unit=""（读数后缀）, pile=0（秤盘上金币枚数，最多 15）
// 可动：ID-lcd-before / ID-lcd-after（读数行；数值文字 ID-lcd-before-v / ID-lcd-after-v，KITX07.read 滚动）,
//       ID-diff（差值条，KITX07.diff）, ID-pile-k（秤盘金币，KITX07.pileTo）, ID-pan（秤盘，KITX07.press 压下）, ID-led
// anchors: top, center, ground, pan（秤盘中心）, lcd（LCD 中心）, diff（差值条中心）
// =====================================================================================
export function scale(o, opts = {}) {
  const p = opts.id ?? "scale", K = opts.scale ?? 1, atk = isAtk(opts);
  const u0 = -75, u1 = 75, v0 = -55, v1 = 55, zb = 26;
  const body = atk ? mat("#c9463c") : M.ink;
  let s = contactShadow(o, 130, 90);
  // rear column + display head (drawn first: it is behind the platform)
  const hu0 = -66, hu1 = 66, hv0 = v0 - 6, hv1 = v0 + 14, hz0 = 112, hz1 = 196;
  s += box(o, -9, 9, v0 - 2, v0 + 12, zb, hz0, CHROME, 1.4);
  s += rbox(o, hu0, hu1, hv0, hv1, hz0, hz1, 8, body, { sw: 1.8 });
  const mH = frameV(o, hu0, hv1, hz1);
  const HW = hu1 - hu0, HH = hz1 - hz0;
  const fmt = (v) => (v == null ? "" : typeof v === "number" ? v.toLocaleString("en-US") : String(v));
  const unit = opts.unit ?? "";
  const row = (key, y, label, v) => `<g id="${p}-lcd-${key}">` + txt(14, y, label, { size: 15, fill: "#0b3b4a", weight: 900 }) +
    `<text id="${p}-lcd-${key}-v" x="${HW - 16}" y="${y}" ${MONO} font-size="17" font-weight="800" fill="#0b3b4a" text-anchor="end" data-unit="${unit}">${fmt(v)}${v == null ? "" : unit}</text></g>`;
  const dOk = opts.diffOk;
  let hf = `<rect x="4" y="4" width="${HW - 8}" height="${HH - 8}" rx="6" fill="#141518"/>
    <rect x="9" y="8" width="${HW - 18}" height="48" rx="3" fill="#7fd0e6" stroke="#0e4252" stroke-width="1.6"/>
    <rect x="9" y="8" width="${HW - 18}" height="10" rx="3" fill="#ffffff" opacity="0.18"/>
    <path d="M12 32H${HW - 12}" stroke="#0b3b4a" stroke-width="0.8" opacity="0.4"/>` +
    row("before", 27, "前", opts.before ?? null) + row("after", 50, "后", opts.after ?? null);
  hf += `<g id="${p}-diff" opacity="${dOk == null ? 0 : 1}" data-ok="${dOk == null ? "" : dOk ? 1 : 0}"><rect id="${p}-diff-bg" x="9" y="61" width="${HW - 18}" height="16" rx="3" fill="${dOk === false ? "#e0453a" : "#1f9d55"}"/>` +
    `<text id="${p}-diff-v" x="${HW / 2}" y="73.5" ${FONT} font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">${opts.diff ?? ""}</text></g>`;
  hf += ledSvg(p + "-led", HW - 12, 69, 2.6, "off");
  s += G_(matStr(mH), hf);
  // platform
  s += rbox(o, u0, u1, v0, v1, 4, zb, 10, body, { sw: 1.8 });
  s += box(o, u0 + 8, u1 - 8, v0 + 8, v1 - 8, 0, 4, { f: "#2b2d31", s: "#1e1f23", t: "#3b3e44", st: "#101113" }, 1);
  // front face of the platform: brand strip + 4 keys
  const mF = frameV(o, u0 + 10, v1, zb - 2);
  s += G_(matStr(mF), `<rect x="0" y="4" width="${u1 - u0 - 20}" height="${zb - 10}" rx="3" fill="#25272b"/>` +
    [0, 1, 2, 3].map((i) => `<rect x="${60 + i * 18}" y="7" width="13" height="9" rx="2" fill="${i === 3 ? "#1d93ba" : "#4a4d53"}" stroke="#141518" stroke-width="0.8"/>`).join("") +
    txt(8, 15, "SCALE", { size: 8, mono: true, fill: "#9aa0a8", weight: 700 }));
  // pan (stainless) on 4 stubs
  const SS = { f: "#dfe2e6", s: "#c4c8ce", t: "#f1f3f5", st: "#6e747c" };
  let pan = "";
  for (const [a, b] of [[-50, -30], [50, -30], [-50, 40], [50, 40]]) pan += cyl(o, a, b, 4, zb, zb + 6, CHROME, { seg: 12, sw: 1 });
  pan += rbox(o, -64, 64, -42, 50, zb + 6, zb + 10, 8, SS, { sw: 1.5 });
  pan += G_(faceTop(o, 0, 4, zb + 10), `<rect x="-58" y="-40" width="116" height="84" rx="6" fill="none" stroke="#c4c8ce" stroke-width="1.6"/>` +
    Array.from({ length: 7 }, (_, i) => `<path d="M${-50 + i * 16} -36L${-40 + i * 16} 40" stroke="#ffffff" stroke-width="2" opacity="0.35"/>`).join(""));
  // gold coin pile on the pan
  const zP = zb + 10, np = Math.min(15, opts.pile ?? 0), maxPile = 15;
  const spots = [[-26, -6], [0, -6], [26, -6], [-13, 20], [13, 20]];
  const pileEl = (i) => { const [a, b] = spots[i % 5], lv = Math.floor(i / 5); return `<g id="${p}-pile-${i}" opacity="${i < np ? 1 : 0}">${cyl(o, a, b, 11, zP + lv * 5, zP + lv * 5 + 5, GOLD, { seg: 22, sw: 1 })}</g>`; };
  // painter order: far spots first, each spot bottom → top
  for (const si of [0, 1, 2, 3, 4]) for (let lv = 0; lv < 3; lv++) pan += pileEl(lv * 5 + si);
  s += `<g id="${p}-pan">${pan}</g>`;
  const anchors = { top: at(o, 0, v0, hz1 + 34), center: at(o, 0, 0, 60), ground: at(o), pan: at(o, 0, 4, zP), lcd: applyM(mH, HW / 2, 32), diff: applyM(mH, HW / 2, 69) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0, u1, v0, v1, 0, zb + 10], [hu0, hu1, hv0, hv1, hz0, hz1], [-9, 9, v0 - 2, v0 + 12, zb, hz0]], center: anchors.center, glowR: 150, k: K }), anchors: scaleAnchors(o, K, anchors) };
}
export const weighScale = scale;

// =====================================================================================
// 过路收费夹 tollClip — 夹在 ep01 pipe 上的铸铁管夹（约 70×50×60 + 上部铡刀架）：两半铸铁卡箍 + 侧耳螺栓，
// 卡箍顶上一侧是铡刀架（两根导柱 + 横梁 + 斜口刀片），另一侧是一个小收费杯（钢杯，杯里金屑堆）。
// 金币经过时刀片落下切下一小截，碎屑弹进收费杯。
// 用法：o = 管道轴线的地面投影点；opts.z = 管道中心高度（ep01 pipe 的 pts 里的 z）, opts.r = 管半径（默认 9）, opts.axis = "u"|"v"（管道走向）
// opts: rate=0.02（只影响杯里初始金屑堆高）, pile（直接给初始块数，0–8）
// 可动：ID-blade（刀片，KITX07.blade / toll）, ID-chip（切下的金屑）, ID-cup-k（杯中金屑，KITX07.cup 设数量）
// anchors: top, center, ground, cup（杯口）, clamp（卡箍正面中心）, cut（刀口落点，管顶）
// =====================================================================================
export function tollClip(o, opts = {}) {
  const p = opts.id ?? "toll", K = opts.scale ?? 1, atk = isAtk(opts), axis = opts.axis ?? "u";
  const zp = opts.z ?? 60, r = opts.r ?? 9;
  const IRON = atk ? mat("#b8392f") : CAST;
  // (a = along pipe, b = across) → (du, dv)
  const UV = (a, b) => (axis === "u" ? [a, b] : [-b, a]);
  const B = (a0, a1, b0, b1, z0, z1, m, sw = 1.4) => { const [x0, y0] = UV(a0, b0), [x1, y1] = UV(a1, b1); return box(o, Math.min(x0, x1), Math.max(x0, x1), Math.min(y0, y1), Math.max(y0, y1), z0, z1, m, sw); };
  const A = (a, b, z) => { const [du, dv] = UV(a, b); return at(o, du, dv, z); };
  const zc0 = zp - r - 7, zc1 = zp + r + 7;
  let s = "";
  // lower saddle + upper cap with a parting line, side lugs with bolts
  s += B(-26, 26, -17, 17, zc0, zp, IRON, 1.6);
  s += B(-26, 26, -17, 17, zp, zc1, { ...IRON, f: lighten(IRON.f, 0.06), t: lighten(IRON.t, 0.06) }, 1.6);
  for (const sb of [-1, 1]) {
    const b0 = sb < 0 ? -27 : 17, b1 = sb < 0 ? -17 : 27;
    s += B(-20, 20, b0, b1, zp - 5, zp + 5, IRON, 1.2);
  }
  // bolts on the lugs (hex heads on top of each lug)
  for (const sb of [-22, 22]) for (const a of [-12, 12]) {
    const [du, dv] = UV(a, sb);
    s += cyl(o, du, dv, 4, zp + 5, zp + 9, M.steel, { seg: 6, sw: 1 });
  }
  // casting ribs on the visible long face
  const ribFace = axis === "u" ? faceV(o, -26, 17, zc1) : faceU(o, -17, -26, zc1);
  s += G_(ribFace, [8, 18, 34, 44].map((x) => `<rect x="${x}" y="3" width="3" height="${zc1 - zc0 - 6}" rx="1.5" fill="${lighten(IRON.s, 0.14)}"/>`).join("") +
    `<path d="M2 ${zc1 - zp}H50" stroke="${darken(IRON.s, 0.4)}" stroke-width="1.4"/>` + txt(26, zc1 - zp - 4, "TOLL", { size: 6, mono: true, anchor: "middle", fill: lighten(IRON.s, 0.35), weight: 700 }));
  // ---- guillotine frame at a = −12 (two posts across the pipe + header beam)
  const ag = -12, zh = zc1 + 58;
  for (const b of [-13, 13]) s += B(ag - 3.5, ag + 3.5, b - 3.5, b + 3.5, zc1, zh, M.steel, 1.2);
  s += B(ag - 5, ag + 5, -17, 17, zh, zh + 8, M.steel, 1.2);
  // blade in the plane perpendicular to the pipe (a = ag): visible −u face when axis u, +v face when axis v
  const bladeUp = 30, bw = 22, bh = 26;
  const mB = axis === "u" ? frameU(o, ag, -bw / 2, zc1 + bladeUp + bh) : (() => { const [du, dv] = UV(ag, -bw / 2); return frameV(o, du - bw, dv, zc1 + bladeUp + bh); })();
  // blade travel: from z = zc1 + bladeUp to just into the cap slot (z = zp + r - 2)
  const travel = (zc1 + bladeUp) - (zp + r - 4);
  const dy = travel * CE;
  const blade = `<path d="M0 0H${bw}V${bh - 10}L0 ${bh}Z" fill="#dfe2e6" stroke="#4b4f56" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M0 ${bh}L${bw} ${bh - 10}" stroke="#ffffff" stroke-width="2"/><rect x="0" y="0" width="${bw}" height="7" fill="#7d828a" stroke="#4b4f56" stroke-width="1"/>
    <circle cx="5" cy="3.5" r="1.6" fill="#3b3e44"/><circle cx="${bw - 5}" cy="3.5" r="1.6" fill="#3b3e44"/>`;
  s += `<g id="${p}-blade" data-dy="${f(dy)}">${G_(matStr(mB), blade)}<path d="M${pts([A(ag, 0, zh)])}L${pts([A(ag, 0, zc1 + bladeUp + bh)])}" stroke="#3b3e44" stroke-width="2.4"/></g>`;
  // ---- toll cup at a = +13 on the cap
  const ac = 13, [cu, cv] = UV(ac, 0), zcup0 = zc1 + 6, zcup1 = zc1 + 30;
  s += B(ac - 7, ac + 7, -7, 7, zc1, zcup0, M.steel, 1);
  s += frustum(o, cu, cv, 9, 13, zcup0, zcup1, M.steelLight, { seg: 28, sw: 1.4, top: false });
  s += G_(faceTop(o, cu, cv, zcup1), `<ellipse cx="0" cy="0" rx="13" ry="13" fill="#3b3e44" stroke="#5a6068" stroke-width="1.4"/><ellipse cx="0" cy="0" rx="10.5" ry="10.5" fill="#2b2d31"/>`);
  // gold flakes in the cup (rising pile)
  const n0 = Math.max(0, Math.min(8, opts.pile ?? Math.round((opts.rate ?? 0.02) * 150)));
  let cup = "";
  for (let k = 0; k < 8; k++) {
    const zz = zcup1 - 14 + k * 2.6, ang = k * 77;
    cup += `<g id="${p}-cup-${k}" opacity="${k < n0 ? 1 : 0}">${G_(faceTop(o, cu + 3 * Math.cos(ang * DEG), cv + 3 * Math.sin(ang * DEG), Math.min(zz, zcup1 + 4)), `<path d="M-6 -3L5 -5L7 2L-4 5Z" fill="#f0c04a" stroke="#a87612" stroke-width="1" transform="rotate(${ang})"/>`)}</g>`;
  }
  s += `<g id="${p}-cup">${cup}</g>`;
  s += G_(faceTop(o, cu, cv, zcup1), `<ellipse cx="0" cy="0" rx="13" ry="13" fill="none" stroke="#c3c8ce" stroke-width="2"/>`);
  // chip that flies from the blade into the cup
  const cut = A(ag, 0, zp + r), cupP = A(ac, 0, zcup1 + 2);
  s += `<g id="${p}-chip" opacity="0" data-dx="${f(cupP[0] - cut[0])}" data-dy="${f(cupP[1] - cut[1])}"><path d="M${f(cut[0] - 5)} ${f(cut[1] - 2)}l9 -3 3 6 -9 3Z" fill="#f0c04a" stroke="#a87612" stroke-width="1.2" stroke-linejoin="round"/></g>`;
  const anchors = { top: A(0, 0, zh + 40), center: A(0, 0, zp), ground: at(o), cup: cupP, clamp: A(0, 17, zp), cut };
  const [w0, w1] = [UV(-27, -27), UV(27, 27)];
  return { svg: shell(p, o, opts, { solid: s, wire: [[Math.min(w0[0], w1[0]), Math.max(w0[0], w1[0]), Math.min(w0[1], w1[1]), Math.max(w0[1], w1[1]), zc0, zh + 8]], center: anchors.center, badgeR: 18, k: K }), anchors: scaleAnchors(o, K, anchors) };
}

// =====================================================================================
// 拍卖台 auctionStand — 木质拍卖讲台（约 130×90×136）+ 台后"最高出价"翻牌板（两根立柱，约 120 宽，顶高约 240）。
// 讲台正面雕花板（凸框 + 拱形内板 + 圆形花饰），台面木砧 + 木槌；台前一条镀铬退款滑槽滑向出价者站位。
// opts: name="A"（最高出价者）, amount="10 ETH", head="最高出价", red=false（牌框变红：被卡死）, gavelUp=false
// 可动：ID-gavel（木槌，KITX07.gavel 敲一下 / gavelTo 举起放下；也可用 KIT.rot）, ID-board（翻牌，KITX07.board 换名字 / 数额 / 红色）,
//       ID-refund（退款金币，KITX07.refund "out" 滑出 / "bounce" 被弹回）, ID-chute-red（滑槽红闪）
// anchors: top, center, ground, board（牌面中心）, chute（滑槽底端）, chuteTop（滑槽口）, bidder（出价者站位，地面）, gavel（槌头）
// =====================================================================================
export function auctionStand(o, opts = {}) {
  const p = opts.id ?? "auc", K = opts.scale ?? 1, atk = isAtk(opts);
  const body = atk ? mat("#c9463c") : { f: "#9c6a3e", s: "#7d522c", t: "#b9875a", st: "#4a2c14" };
  const dark = atk ? mat("#a8322a") : WOOD_D;
  let s = contactShadow(o, 150, 120, 0, -10);
  // ---- board behind (posts + flip board)
  const bv = -84, bu0 = -72, bu1 = 72, bz0 = 186, bz1 = 280;
  for (const u of [-66, 66]) s += box(o, u - 5, u + 5, bv - 11, bv - 1, 0, bz1 + 6, dark, 1.2);
  s += box(o, bu0 - 4, bu1 + 4, bv - 6, bv, bz0 - 4, bz1 + 4, dark, 1.4);
  const mBd = frameV(o, bu0, bv, bz1);
  const BW = bu1 - bu0, BH = bz1 - bz0, red = !!opts.red;
  const boardFace = (nm, am, rd) => `<rect x="0" y="0" width="${BW}" height="${BH}" rx="3" fill="#ffffff" stroke="${rd ? "#e0453a" : "#b8b0a1"}" stroke-width="${rd ? 4 : 1.4}"/>
    <rect x="3" y="3" width="${BW - 6}" height="17" rx="2" fill="${rd ? "#e0453a" : "#1d93ba"}"/>` +
    txt(BW / 2, 16, opts.head ?? "最高出价", { size: 12, anchor: "middle", fill: "#ffffff" }) +
    `<text id="${p}-board-name" x="${BW / 2}" y="${BH - 27}" ${FONT} font-size="40" font-weight="900" fill="${C.ink}" text-anchor="middle">${nm}</text>` +
    `<path d="M14 ${BH - 18}H${BW - 14}" stroke="#e3ddd1" stroke-width="1.2"/>` +
    `<text id="${p}-board-amt" x="${BW / 2}" y="${BH - 6}" ${MONO} font-size="14" font-weight="800" fill="#6d685e" text-anchor="middle">${am}</text>`;
  s += `<g transform="${matStr(mBd)}"><g id="${p}-board" data-name="${opts.name ?? "A"}" data-amt="${opts.amount ?? "10 ETH"}" data-red="${red ? 1 : 0}" data-cx="${BW / 2}" data-cy="${BH / 2}">` +
    `<g id="${p}-board-n">${boardFace(opts.name ?? "A", opts.amount ?? "10 ETH", false)}</g>` +
    `<g id="${p}-board-r" opacity="${red ? 1 : 0}"><rect x="0" y="0" width="${BW}" height="${BH}" rx="3" fill="none" stroke="#e0453a" stroke-width="4.5"/><rect x="3" y="3" width="${BW - 6}" height="17" rx="2" fill="#e0453a"/>` +
    txt(BW / 2, 16, opts.head ?? "最高出价", { size: 12, anchor: "middle", fill: "#ffffff" }) + `</g></g></g>`;
  // little split-flap hinge rings on top of the board
  for (const x of [22, BW - 22]) { const [hx, hy] = applyM(mBd, x, 0); s += `<circle cx="${f(hx)}" cy="${f(hy - 2)}" r="4" fill="none" stroke="#5a5e65" stroke-width="2.4"/>`; }
  // ---- lectern
  const u0 = -64, u1 = 64, v0 = -42, v1 = 42, zt = 150;
  s += box(o, u0 - 8, u1 + 8, v0 - 8, v1 + 8, 0, 10, dark, 1.4);
  s += box(o, u0, u1, v0, v1, 10, zt - 10, body, 1.8);
  // carved front panel
  const mF = frameV(o, u0, v1, zt - 10), FW = u1 - u0, FH = zt - 20;
  const hl = lighten(body.s, 0.22), sh = darken(body.s, 0.32);
  let cf = `<rect x="7" y="6" width="${FW - 14}" height="${FH - 12}" rx="3" fill="none" stroke="${hl}" stroke-width="2.4"/><rect x="9.5" y="8.5" width="${FW - 19}" height="${FH - 17}" rx="2" fill="none" stroke="${sh}" stroke-width="1.4"/>`;
  const ax = FW / 2, ar = (FW - 40) / 2, ay = 34;
  cf += `<path d="M20 ${FH - 16}V${ay}A${ar} ${ar} 0 0 1 ${FW - 20} ${ay}V${FH - 16}Z" fill="${darken(body.s, 0.08)}" stroke="${sh}" stroke-width="1.6"/>
    <path d="M22 ${FH - 18}V${ay}A${ar - 2} ${ar - 2} 0 0 1 ${FW - 22} ${ay}" fill="none" stroke="${hl}" stroke-width="1.2"/>`;
  // rosette
  let ros = "";
  for (let i = 0; i < 8; i++) ros += `<ellipse cx="0" cy="-8.5" rx="4" ry="7.5" fill="${lighten(body.s, 0.1)}" stroke="${sh}" stroke-width="1" transform="rotate(${i * 45})"/>`;
  cf += `<g transform="translate(${ax} ${ay + 26})">${ros}<circle r="5" fill="${hl}" stroke="${sh}" stroke-width="1"/></g>`;
  cf += `<path d="M28 ${FH - 26}H${FW - 28}" stroke="${hl}" stroke-width="1.4"/><path d="M28 ${FH - 24}H${FW - 28}" stroke="${sh}" stroke-width="1"/>`;
  // chute mouth (chrome) low on the front, left side
  const cmx = 24, cmy = FH - 46;
  cf += `<rect x="${cmx - 14}" y="${cmy - 9}" width="28" height="18" rx="4" fill="#d4d7db" stroke="#5a5e65" stroke-width="1.4"/><rect x="${cmx - 10}" y="${cmy - 4}" width="20" height="9" rx="2" fill="#141518"/>`;
  s += G_(matStr(mF), cf);
  // −u face panel
  s += G_(faceU(o, u0, v0, zt - 10), `<rect x="7" y="6" width="${v1 - v0 - 14}" height="${FH - 12}" rx="3" fill="none" stroke="${lighten(body.f, 0.2)}" stroke-width="2.2"/><rect x="9.5" y="8.5" width="${v1 - v0 - 19}" height="${FH - 17}" rx="2" fill="none" stroke="${darken(body.f, 0.25)}" stroke-width="1.2"/>`);
  // cornice + top
  s += box(o, u0 - 6, u1 + 6, v0 - 6, v1 + 6, zt - 10, zt - 4, dark, 1.2);
  s += box(o, u0 - 8, u1 + 8, v0 - 8, v1 + 8, zt - 4, zt, { f: body.t, s: body.f, t: lighten(body.t, 0.1), st: body.st }, 1.4);
  // sound block + gavel
  const gu = -20, gv = 8;
  s += cyl(o, gu, gv, 17, zt, zt + 8, dark, { seg: 28, sw: 1.2 });
  const mG = frameV(o, gu + 3.5, gv, zt + 8); // head (scaled about the pivot) lands over the block // gavel plane: local x → +u, y down; pivot at handle end
  const L = 62, piv = [L, -6], GK = 1.35;
  const gav = `<defs><linearGradient id="${p}-gh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d0a172"/><stop offset="0.5" stop-color="#8a5a32"/><stop offset="1" stop-color="#5a3518"/></linearGradient></defs>
    <rect x="12" y="${piv[1] - 2.8}" width="${L - 8}" height="5.6" rx="2.8" fill="url(#${p}-gh)" stroke="#4a2c14" stroke-width="1"/>
    <rect x="${L - 4}" y="${piv[1] - 3.6}" width="10" height="7.2" rx="3.6" fill="#5a3518" stroke="#3a1f0c" stroke-width="1"/>
    <rect x="0" y="${piv[1] - 12}" width="24" height="12" rx="2" fill="url(#${p}-gh)" stroke="#4a2c14" stroke-width="1.2" transform="translate(0 6)"/>
    <ellipse cx="2" cy="${piv[1]}" rx="2.4" ry="6" fill="#b98454" stroke="#4a2c14" stroke-width="1"/>
    <rect x="6" y="${piv[1] - 6}" width="2.4" height="12" fill="#5a3518"/><rect x="16" y="${piv[1] - 6}" width="2.4" height="12" fill="#5a3518"/>`;
  s += rotator(p + "-gavel", mG, piv[0], piv[1], opts.gavelUp ? 48 : 0, `<g transform="translate(${piv[0]} ${piv[1]}) scale(${GK}) translate(${-piv[0]} ${-piv[1]})">${gav}</g>`, `data-up="48"`);
  // ---- refund chute: from the mouth down to the floor toward +v
  const cu0 = u0 + cmx, ctop = [cu0, v1, 46], cbot = [cu0, v1 + 120, 6];
  const chW = 13;
  const Q = (a, b, zz) => at(o, a, b, zz);
  const floor = [Q(cu0 - chW, ctop[1], ctop[2]), Q(cu0 + chW, ctop[1], ctop[2]), Q(cu0 + chW, cbot[1], cbot[2]), Q(cu0 - chW, cbot[1], cbot[2])];
  let ch = "";
  // legs
  ch += box(o, cu0 - 3, cu0 + 3, v1 + 60, v1 + 66, 0, 26, M.steel, 1);
  ch += box(o, cu0 - 3, cu0 + 3, v1 + 110, v1 + 116, 0, 8, M.steel, 1);
  ch += `<polygon points="${pts(floor)}" fill="#c4c8ce" stroke="#5a5e65" stroke-width="1.4" stroke-linejoin="round"/>`;
  ch += line3(o, [[cu0, ctop[1] + 4, ctop[2]], [cu0, cbot[1] - 4, cbot[2]]], "#eef0f2", 2);
  // rails (left rail low, right rail drawn after coin as front lip)
  const rail = (a, hh, col) => `<polygon points="${pts([Q(a, ctop[1], ctop[2]), Q(a, cbot[1], cbot[2]), Q(a, cbot[1], cbot[2] + hh), Q(a, ctop[1], ctop[2] + hh)])}" fill="${col}" stroke="#5a5e65" stroke-width="1.2" stroke-linejoin="round"/>`;
  ch += rail(cu0 - chW, 8, "#dfe2e6");
  ch += box(o, cu0 - chW - 2, cu0 + chW + 2, cbot[1] - 2, cbot[1] + 4, 0, 10, CHROME, 1.2);
  s += ch;
  // refund coin (lying disc that slides down the chute)
  const cs = Q(cu0, ctop[1] + 10, ctop[2] - 2), ce = Q(cu0, cbot[1] - 12, cbot[2] + 2);
  const coinDisc = `${G_(faceTop(o, cu0, ctop[1] + 10, ctop[2] + 2), `<ellipse cx="0" cy="0" rx="10" ry="10" fill="#cf9520" stroke="#a87612" stroke-width="1.2" transform="translate(${f(-0)} 0)"/>`)}` +
    `<g transform="translate(0 -3)">${G_(faceTop(o, cu0, ctop[1] + 10, ctop[2] + 2), `<ellipse cx="0" cy="0" rx="10" ry="10" fill="#f0c04a" stroke="#a87612" stroke-width="1.2"/><ellipse cx="0" cy="0" rx="6.5" ry="6.5" fill="none" stroke="#ffe08a" stroke-width="1.2"/>`)}</g>`;
  s += `<g id="${p}-refund" opacity="${opts.refund ? 1 : 0}" data-dx="${f(ce[0] - cs[0])}" data-dy="${f(ce[1] - cs[1])}">${coinDisc}</g>`;
  s += rail(cu0 + chW, 8, "#b5b9bf");
  s += `<g id="${p}-chute-red" opacity="0"><polygon points="${pts(floor)}" fill="rgba(224,69,58,0.35)" stroke="#e0453a" stroke-width="3" stroke-dasharray="8 5" stroke-linejoin="round"/></g>`;
  const anchors = {
    top: at(o, 0, bv, bz1 + 40), center: at(o, 0, 0, 70), ground: at(o), board: applyM(mBd, BW / 2, BH / 2),
    chute: Q(cu0, cbot[1], 6), chuteTop: Q(cu0, ctop[1], ctop[2]), bidder: at(o, cu0 - 10, v1 + 190, 0), gavel: applyM(mG, 62 - 50 * 1.35, piv[1]),
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0 - 8, u1 + 8, v0 - 8, v1 + 8, 0, zt], [bu0 - 4, bu1 + 4, bv - 6, bv, bz0 - 4, bz1 + 4], [cu0 - chW, cu0 + chW, v1, v1 + 120, 0, 46]], center: anchors.center, glowR: 200, k: K }), anchors: scaleAnchors(o, K, anchors) };
}

export const CATALOG_EXT = { emptyLot, parcel, returnTag, dispatchDesk, oddCoin, scale, tollClip, auctionStand };
/** runtime-ext.js contents — inline after iso.runtimeJs() (and other chapters' runtime-ext) */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
