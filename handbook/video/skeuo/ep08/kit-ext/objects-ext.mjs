// objects-ext.mjs — 第 08 集（预言机与价格操纵）补充拟物物件，与 kit/objects.mjs 同一投影、同一接口
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"
//   opts.glow = true 时脚下绿色地光；opts.scale = 以地面原点等比缩放（anchors 已换算）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，KIT.grow / broke / fixed 直接可用。
// 动画助手在 runtime-ext.js（window.KITX08，并以不覆盖的方式合并进 window.KITX），用 runtimeExtJs() 内联在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  U, V, CE, f, f4, at, pts, M, C, lighten, darken, mat,
  frameV, frameU, frameTop, frameTilt, matStr, applyM, faceV, faceU, faceTop,
  box, rbox, cyl, frustum, loft, wedge, line3, rrectPlan, circlePlan, sphere,
  glow, contactShadow, wireSvg, badgeSvg,
} from "../../kit/iso.mjs";

const DEG = Math.PI / 180;
const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const txt = (x, y, s, o = {}) =>
  `<text ${o.id ? `id="${o.id}"` : ""} x="${f(x)}" y="${f(y)}" ${o.mono ? MONO : FONT} font-size="${o.size ?? 20}" font-weight="${o.weight ?? 900}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}" ${o.extra ?? ""}>${s}</text>`;
const LED = { green: "#2bd46f", red: "#ff4a3d", off: "#3c3f45", blue: "#5cc0e0" };
function shell(p, o, opts, s) {
  const st = opts.state ?? "normal", broken = st === "broken";
  const glowOn = (opts.glow ?? s.glowDefault ?? false) && !broken;
  const [ox, oy] = at(o);
  const glowSvg = s.glowR ? `<g id="${p}-glow" opacity="${glowOn ? 1 : 0}">${glow(p + "-gl", s.glowAt ?? o, s.glowR)}</g>` : "";
  const k = s.k ?? 1, sc0 = k !== 1 ? `<g transform="translate(${f(ox)} ${f(oy)}) scale(${f4(k)}) translate(${f(-ox)} ${f(-oy)})">` : "", sc1 = k !== 1 ? "</g>" : "";
  return `<g id="${p}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}" data-state="${st}" data-k="${f4(k)}" ${s.attrs ?? ""}>${sc0}${s.under ?? ""}${glowSvg}${s.shadow ?? ""}
  <g id="${p}-solid" opacity="${broken ? opts.ghost ?? s.ghost ?? 0.18 : 1}">${s.solid}</g>
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
/** group rotated about local (px,py) inside face matrix m; runtime rewrites its transform (data-m / data-px / data-py / data-a) */
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
/** plan angle whose direction points straight down the screen (the visible "front" of a cylinder) */
const TH_FRONT = Math.atan2(V[1], U[1]);
/** points of the visible front half of a horizontal circle (du,dv,r) at height z */
const frontArc = (o, du, dv, r, z, a0 = -90, a1 = 90, n = 24) => {
  const P = [];
  for (let i = 0; i <= n; i++) { const a = TH_FRONT + (a0 + ((a1 - a0) * i) / n) * DEG; P.push(at(o, du + r * Math.cos(a), dv + r * Math.sin(a), z)); }
  return P;
};
/** screen silhouette of a vertical cylinder (front half body between z0 and z1) */
const cylBody = (o, du, dv, r, z0, z1) => [...frontArc(o, du, dv, r, z0), ...frontArc(o, du, dv, r, z1).reverse()];
const ellipse = (o, du, dv, r, z, fill, stroke = "none", sw = 1.2, extra = "") =>
  `<polygon points="${pts(circlePlan(du, dv, r, 40).map((q) => at(o, q[0], q[1], z)))}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" ${extra}/>`;
const CAST = { f: "#62666d", s: "#4a4e55", t: "#7b8088", st: "#23262a" };
const CHROME = M.chrome;
const GOLD = M.gold;
const TEAL_COIN = M.blue;
const WOOD = M.wood;
const WOOD_D = { f: "#8a5a32", s: "#6f4524", t: "#a87443", st: "#4a2c14" };
const RED = "#e0453a";

// =====================================================================================
// AMM 池 ammPool — 两只立式玻璃储罐（左金币 ETH、右青蓝币 USDC）共用钢底座，底部粗连通管 + 阀门轮；中间短柱顶上半圆"现货价"表（墨针 + 数字窗）；罐顶进料斗、罐前出料口
// 约 240×130×210。opts: lvlL / lvlR（两罐币堆高度 0–1，默认 0.55 / 0.55，attacker 默认 0.18 / 0.95）, deg（指针角度，0° 竖直，±70°，默认 −6，attacker 62）,
//   read（数字窗文字，默认 "2,000"）, labelL / labelR（底座铭牌，默认 ETH / USDC）, ghost（broken 时实体透明度，默认 0.4）
// 可动：ID-lvlL / ID-lvlR（币堆高度，KITX08.poolLevel）, ID-needle（指针，KITX08.poolNeedle）+ ID-needle-r（红针层）+ ID-needle-t1/-t2（红色残影，KITX08.poolRed）,
//   ID-readout（数字窗，KITX08.poolRead）, ID-hopL / ID-hopR（进料斗闪亮，KITX08.hop）, ID-dropL/R（落入的币）+ ID-outL/R（滑出的币）（KITX08.poolSwap / poolPump）
// anchors: top, center, ground, tankL, tankR, dial（表盘中心）, readout, hopL, hopR, outL, outR（出料口）, valve
// =====================================================================================
export function ammPool(o, opts = {}) {
  const p = opts.id ?? "amm", K = opts.scale ?? 1, atk = isAtk(opts);
  const lvl = { L: opts.lvlL ?? (atk ? 0.18 : 0.55), R: opts.lvlR ?? (atk ? 0.95 : 0.55) };
  const deg = opts.deg ?? (atk ? 62 : -6);
  const TU = 66, R = 46, zB = 22, zT = 156, z0 = 28, Hc = 116;
  let s = contactShadow(o, 170, 90);
  // ---- base: cast steel plinth with feet + nameplates on the front
  s += rbox(o, -124, 124, -64, 64, 0, zB, 6, CAST, { sw: 1.6 });
  s += G_(faceTop(o, 0, 0, zB), `<rect x="-118" y="-58" width="236" height="116" rx="4" fill="none" stroke="${lighten(CAST.t, 0.15)}" stroke-width="1.2"/>` +
    [[-112, -52], [112, -52], [-112, 52], [112, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${darken(CAST.t, 0.25)}"/><circle cx="${x - 0.6}" cy="${y - 0.6}" r="1.2" fill="#c3c8ce"/>`).join(""));
  const mBase = frameV(o, -124, 64, zB);
  const plate = (cx, label, col) => `<rect x="${cx - 24}" y="3.5" width="48" height="15" rx="2" fill="#f6f3ec" stroke="#9a958b" stroke-width="1"/><rect x="${cx - 21}" y="6" width="5" height="10" rx="1" fill="${col}"/>` +
    txt(cx + 4, 15, label, { size: 10, mono: true, anchor: "middle", weight: 800 });
  s += G_(matStr(mBase), plate(124 - TU, opts.labelL ?? "ETH", GOLD.s) + plate(124 + TU, opts.labelR ?? "USDC", TEAL_COIN.s) +
    `<path d="M6 ${zB - 4}H242" stroke="${darken(CAST.s, 0.2)}" stroke-width="1"/>`);
  // ---- centre post (behind the pipe and the gauge)
  s += cyl(o, 0, -22, 4.5, zB, 168, M.steel, { seg: 20, sw: 1.2 });
  // ---- a tank
  const tank = (side) => {
    const du = side === "L" ? -TU : TU, coin = side === "L" ? GOLD : TEAL_COIN, glyph = side === "L" ? "Ξ" : "$";
    let t = "";
    // interior back wall seen through the glass
    t += `<polygon points="${pts(cylBody(o, du, 0, R, zB, zT))}" fill="rgba(170,205,218,0.35)"/>`;
    t += ellipse(o, du, 0, R, zB + 6, "rgba(120,160,175,0.35)");
    // coin pile body (full height, clipped to the level) + cap (moved up to the level)
    const [, yc0] = at(o, du, 0, z0), hs = Hc * CE, yTop = yc0 - lvl[side] * hs;
    const rc = R - 4;
    let body = cyl(o, du, 0, rc, z0, z0 + Hc, coin, { seg: 40, sw: 1.2 });
    for (let z = z0 + 6; z < z0 + Hc; z += 6) body += `<polyline points="${pts(frontArc(o, du, 0, rc, z, -86, 86, 18))}" fill="none" stroke="${coin.st}" stroke-width="0.8" opacity="0.5"/>`;
    for (let z = z0 + 3; z < z0 + Hc; z += 12) body += `<polyline points="${pts(frontArc(o, du, 0, rc, z, -20, 30, 6))}" fill="none" stroke="${coin.t}" stroke-width="1.6" opacity="0.7"/>`;
    const [bx] = at(o, du, 0, 0);
    let cap = ellipse(o, du, 0, rc, z0, coin.t, coin.st, 1.2);
    const rnd = rng(p + side);
    for (let i = 0; i < 4; i++) {
      const a = (i * 97 + 20) * DEG, rr = 12 + rnd() * 16, cu = du + rr * Math.cos(a), cv = rr * Math.sin(a);
      cap += ellipse(o, cu, cv, 9, z0 + 1.5, coin.s, coin.st, 1) + ellipse(o, cu, cv, 9, z0 + 3, coin.f, coin.st, 1) + ellipse(o, cu, cv, 6, z0 + 3.1, "none", coin.t, 1);
      cap += G_(faceTop(o, cu, cv, z0 + 3.2), txt(0, 3.5, glyph, { size: 9, anchor: "middle", fill: coin.st, weight: 900 }));
    }
    t += `<defs><clipPath id="${p}-lvl${side}-cp"><rect id="${p}-lvl${side}-c" x="${f(bx - R - 10)}" y="${f(yTop)}" width="${2 * R + 20}" height="${f(yc0 - yTop + 200)}"/></clipPath></defs>`;
    t += `<g id="${p}-lvl${side}" data-lvl="${lvl[side]}" data-y0="${f(yc0)}" data-hs="${f(hs)}"><g clip-path="url(#${p}-lvl${side}-cp)">${body}</g>` +
      `<g id="${p}-lvl${side}-cap" transform="translate(0 ${f(-lvl[side] * hs)})">${cap}</g></g>`;
    // front glass + graduation + highlights
    t += `<polygon points="${pts(cylBody(o, du, 0, R, zB, zT))}" fill="rgba(220,240,248,0.22)" stroke="rgba(42,135,168,0.85)" stroke-width="1.6" stroke-linejoin="round"/>`;
    for (let z = z0 + 10, i = 0; z < zT - 4; z += 18, i++) t += `<polyline points="${pts(frontArc(o, du, 0, R, z, 30, i % 2 ? 46 : 56, 6))}" fill="none" stroke="#2a87a8" stroke-width="1.6"/>`;
    t += line3(o, [[du + R * Math.cos(TH_FRONT - 58 * DEG), R * Math.sin(TH_FRONT - 58 * DEG), zB + 10], [du + R * Math.cos(TH_FRONT - 58 * DEG), R * Math.sin(TH_FRONT - 58 * DEG), zT - 8]], "#ffffff", 6, `opacity="0.55"`);
    t += line3(o, [[du + R * Math.cos(TH_FRONT - 44 * DEG), R * Math.sin(TH_FRONT - 44 * DEG), zB + 16], [du + R * Math.cos(TH_FRONT - 44 * DEG), R * Math.sin(TH_FRONT - 44 * DEG), zT - 14]], "#ffffff", 2, `opacity="0.6"`);
    // steel bands + lid + hopper
    t += cyl(o, du, 0, R + 2, zB, zB + 6, M.steelLight, { seg: 40, sw: 1.2 });
    t += cyl(o, du, 0, R + 2, zT - 6, zT, M.steelLight, { seg: 40, sw: 1.2 });
    t += cyl(o, du, 0, R + 3, zT, zT + 6, CAST, { seg: 40, sw: 1.3 });
    for (let i = 0; i < 8; i++) { const a = (i * 45) * DEG; t += G_(faceTop(o, du + (R - 1) * Math.cos(a), (R - 1) * Math.sin(a), zT + 6), `<circle r="2" fill="#a9aeb5" stroke="#3b3e44" stroke-width="0.8"/>`); }
    t += frustum(o, du, 0, 10, 24, zT + 6, zT + 30, CHROME, { seg: 32, sw: 1.3 });
    t += ellipse(o, du, 0, 20, zT + 30.2, "#2b2d31");
    t += `<g id="${p}-hop${side}" opacity="0">${ellipse(o, du, 0, 28, zT + 30, "rgba(42,163,201,0.18)", "#2aa3c9", 4)}</g>`;
    // outlet spout (front, +v)
    t += box(o, du - 8, du + 8, R - 6, R + 16, z0, z0 + 12, CHROME, 1.2);
    t += G_(faceV(o, du - 8, R + 16, z0 + 12), `<rect x="3" y="3" width="10" height="6" rx="1.5" fill="#141518"/>`);
    // falling coin (above the hopper) and outgoing coin (at the spout)
    const d0 = at(o, du, 0, zT + 64), d1 = at(o, du, 0, zT + 26);
    t += `<g id="${p}-drop${side}" opacity="0" data-dx="0" data-dy="${f(d1[1] - d0[1])}">${G_(faceV(o, du, 0, zT + 64), `<circle r="8" fill="${coin.f}" stroke="${coin.st}" stroke-width="1.4"/><circle r="5" fill="none" stroke="${coin.t}" stroke-width="1"/>`)}</g>`;
    const s0 = at(o, du, R + 14, z0 + 6), s1 = at(o, du, R + 64, 2);
    t += `<g id="${p}-out${side}" opacity="0" data-dx="${f(s1[0] - s0[0])}" data-dy="${f(s1[1] - s0[1])}">${ellipse(o, du, R + 14, 8, z0 + 4, coin.s, coin.st, 1)}${ellipse(o, du, R + 14, 8, z0 + 6, coin.f, coin.st, 1)}</g>`;
    return t;
  };
  s += tank("R") + tank("L");
  // ---- connecting pipe (front gap between the tanks) + valve wheel
  const pv = 28, pz = 40;
  const P0 = [-34, pv, pz], P1 = [34, pv, pz];
  s += line3(o, [P0, P1], "#4b4f56", 22) + line3(o, [P0, P1], "#a9aeb5", 18) + `<g transform="translate(0 -5)">${line3(o, [P0, P1], "#eceef0", 4)}</g>`;
  for (const u of [-27, 27]) s += G_(faceU(o, u, pv, pz), `<ellipse cx="0" cy="0" rx="13" ry="13" fill="#8b9199" stroke="#25282c" stroke-width="1.2"/><circle cx="0" cy="-9" r="1.6" fill="#3b3e44"/><circle cx="0" cy="9" r="1.6" fill="#3b3e44"/>`);
  s += box(o, -3, 3, pv - 3, pv + 3, pz + 8, pz + 18, M.steel, 1);
  const wheel = circlePlan(0, pv, 13, 28);
  s += `<polygon points="${pts(wheel.map((q) => at(o, q[0], q[1], pz + 19)))}" fill="none" stroke="#17607a" stroke-width="5" stroke-linejoin="round"/>` +
    `<polygon points="${pts(wheel.map((q) => at(o, q[0], q[1], pz + 20)))}" fill="none" stroke="#2aa3c9" stroke-width="3" stroke-linejoin="round"/>` +
    [0, 60, 120].map((a) => line3(o, [[13 * Math.cos(a * DEG), pv + 13 * Math.sin(a * DEG), pz + 20], [-13 * Math.cos(a * DEG), pv - 13 * Math.sin(a * DEG), pz + 20]], "#1d93ba", 2.2)).join("") +
    G_(faceTop(o, 0, pv, pz + 20.5), `<circle r="3.4" fill="#d4d7db" stroke="#3b3e44" stroke-width="1"/>`);
  // ---- spot-price gauge on the post
  const zc = 186, gv = -14, GR = 36;
  const mF = frameV(o, 0, gv, zc);
  const housing = (fill, stroke) => `<path d="M${-GR - 4} 24V0A${GR + 4} ${GR + 4} 0 0 1 ${GR + 4} 0V24Z" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round"/>`;
  for (let i = 6; i >= 1; i--) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(mF), housing(i === 6 ? "#2b2d31" : "#3b3e44", i === 6 ? "#141518" : "none"))}</g>`;
  let dial = housing("#4a4d53", "#141518");
  dial += `<path d="M${-GR} 0A${GR} ${GR} 0 0 1 ${GR} 0Z" fill="#fffdf6" stroke="#9a958b" stroke-width="1"/>`;
  const arcPt = (a, r) => [r * Math.sin(a * DEG), -r * Math.cos(a * DEG)];
  const arc = (a0, a1, r) => { const A = arcPt(a0, r), B = arcPt(a1, r); return `M${f(A[0])} ${f(A[1])}A${r} ${r} 0 0 1 ${f(B[0])} ${f(B[1])}`; };
  dial += `<path d="${arc(38, 72, GR - 6)}" fill="none" stroke="${RED}" stroke-width="5" opacity="0.85"/><path d="${arc(-72, 38, GR - 6)}" fill="none" stroke="#bfe3ef" stroke-width="5"/>`;
  for (let a = -70; a <= 70; a += 10) { const A = arcPt(a, GR - 2), B = arcPt(a, a % 30 === 0 ? GR - 12 : GR - 8); dial += `<path d="M${f(A[0])} ${f(A[1])}L${f(B[0])} ${f(B[1])}" stroke="${C.ink}" stroke-width="${a % 30 === 0 ? 1.6 : 1}"/>`; }
  dial += txt(0, -13, "现货价", { size: 6.5, anchor: "middle", fill: "#6d685e", weight: 800 });
  dial += `<rect x="-24" y="5" width="48" height="15" rx="2" fill="#17262b" stroke="#141518" stroke-width="1"/>`;
  dial += txt(0, 16.5, opts.read ?? (atk ? "6,000" : "2,000"), { id: `${p}-readout`, size: 10, mono: true, anchor: "middle", fill: atk ? "#ff6a5d" : "#9ad9ee", weight: 800 });
  s += G_(matStr(mF), dial);
  const ndl = (col, w = 2.6) => `<path d="M${-w} 4L0 ${-(GR - 5)}L${w} 4Z" fill="${col}"/>`;
  const trailA = (k) => deg - (atk ? k * 26 : 0);
  s += rotator(`${p}-needle-t1`, mF, 0, 0, trailA(2), ndl(RED, 2.2), `opacity="${atk ? 0.22 : 0}"`);
  s += rotator(`${p}-needle-t2`, mF, 0, 0, trailA(1), ndl(RED, 2.4), `opacity="${atk ? 0.42 : 0}"`);
  s += rotator(`${p}-needle`, mF, 0, 0, deg, `<g transform="translate(1.5 2)" opacity="0.25">${ndl("#1c1c1c")}</g>${ndl(C.ink)}<g id="${p}-needle-r" opacity="${atk ? 1 : 0}">${ndl(RED)}</g>`);
  s += G_(matStr(mF), `<circle r="4.2" fill="#d4d7db" stroke="#3b3e44" stroke-width="1.2"/><circle r="1.6" fill="#3b3e44"/>`);
  const anchors = {
    top: at(o, 0, 0, 262), center: at(o, 0, 0, 90), ground: at(o),
    tankL: at(o, -TU, R, 90), tankR: at(o, TU, R, 90), dial: applyM(mF, 0, -16), readout: applyM(mF, 0, 12),
    hopL: at(o, -TU, 0, zT + 30), hopR: at(o, TU, 0, zT + 30), outL: at(o, -TU, R + 16, z0 + 6), outR: at(o, TU, R + 16, z0 + 6), valve: at(o, 0, pv, pz + 20),
  };
  return {
    svg: shell(p, o, opts, { solid: s, ghost: 0.4, wire: [[-124, 124, -64, 64, 0, zB], { cyl: [-TU, 0, R, zB, zT + 6] }, { cyl: [TU, 0, R, zB, zT + 6] }, [-GR - 4, GR + 4, gv - 6, gv, zc - 24, zc + GR + 4]], center: at(o, 0, 0, 110), badgeR: 34, glowR: 210, k: K }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

// =====================================================================================
// 均价记录仪 twapRecorder — 老式走纸记录仪：灰色铸铁机箱 + 斜面玻璃窗，窗里白色方格纸从右往左走，墨色记录笔画价格曲线；纸上罩青蓝半透明"窗口框"，上方读数窗显示均值；−u 侧调窗口长度的旋钮
// 约 200×90×150。opts: win（窗口框宽度，纸面单位，默认 56，最大约 120）, avg（读数，默认 "2,000"）, off（纸带初始走过的距离，默认 0）, spike=false（红色尖峰一开始就显示）, spikeAt=70（尖峰在纸面的位置）, trail（红色台阶线，attacker 默认显示）
// 可动：ID-paper / ID-paper-ink（纸带平移，KITX08.paper）, ID-pen（笔尖，跟着曲线走；KITX08.penKick 额外跳一下）, ID-spike（KITX08.spike）, ID-win（窗口框宽度，KITX08.winTo，旋钮 ID-knob 跟着转）,
//   ID-avg（读数窗，KITX08.avg）, ID-trail（多区块持续抬升的红色台阶线，KITX08.trail 从左往右画出）
// anchors: top, center, ground, window（纸窗中心）, avg（读数窗）, pen（笔尖初始位置）, spike（尖峰顶）, knob
// =====================================================================================
export function twapRecorder(o, opts = {}) {
  const p = opts.id ?? "twap", K = opts.scale ?? 1, atk = isAtk(opts);
  const u0 = -100, u1 = 100, v0 = -45, v1 = 45, zHi = 150, zLo = 72, zp = 6;
  let s = contactShadow(o, 150, 70);
  s += box(o, u0 + 4, u1 - 4, v0 + 4, v1 - 4, 0, zp, M.ink, 1.2);
  s += wedge(o, u0, u1, v0, v1, zp, zHi, CAST, "+v", zLo, 1.8);
  // ---- +v front: paper exit slot + curled paper tongue, vents, maker plate
  const mFr = frameV(o, u0, v1, zLo), FH = zLo - zp;
  let fr = `<rect x="6" y="5" width="${u1 - u0 - 12}" height="${FH - 10}" rx="3" fill="none" stroke="${lighten(CAST.s, 0.16)}" stroke-width="1.6"/>`;
  fr += `<rect x="40" y="10" width="96" height="7" rx="2" fill="#141518"/>`;
  let tongue = `<path d="M44 14H132V34Q132 44 122 44H54Q44 44 44 36Z" fill="#fffefb" stroke="#b8b0a1" stroke-width="1"/>`;
  for (let x = 52; x < 132; x += 12) tongue += `<path d="M${x} 15V43" stroke="#d6e4e8" stroke-width="0.8"/>`;
  tongue += `<path d="M44 26H132M44 36H132" stroke="#d6e4e8" stroke-width="0.8"/><path d="M46 30L60 27L72 31L86 25L98 29L112 24L130 28" fill="none" stroke="${C.ink}" stroke-width="1.2"/>`;
  tongue += `<path d="M54 44Q44 44 44 36" fill="none" stroke="#9a958b" stroke-width="1.2"/>`;
  fr += tongue;
  for (let i = 0; i < 6; i++) fr += `<rect x="${148 + i * 7}" y="14" width="3" height="26" rx="1.5" fill="${darken(CAST.s, 0.35)}"/>`;
  fr += `<rect x="146" y="46" width="44" height="12" rx="2" fill="#2b2d31" stroke="#141518" stroke-width="1"/>` + txt(168, 55, "TWAP", { size: 8, mono: true, anchor: "middle", fill: "#d3d7dc", weight: 700 });
  s += G_(matStr(mFr), fr);
  // ---- −u side: window-length knob
  const mK = frameU(o, u0, 0, 54);
  let kn = `<circle r="21" fill="#2b2d31" stroke="#141518" stroke-width="1.2"/>`;
  for (let a = -135; a <= 135; a += 27) { const c = Math.cos((a - 90) * DEG), sN = Math.sin((a - 90) * DEG); kn += `<path d="M${f(18 * c)} ${f(18 * sN)}L${f(21 * c)} ${f(21 * sN)}" stroke="#d3d7dc" stroke-width="1.2"/>`; }
  for (let i = 4; i >= 1; i--) s += `<g transform="translate(${f(-i * U[0])},${f(-i * U[1])})">${G_(matStr(mK), `<circle r="14" fill="${i === 4 ? "#141518" : "#3b3e44"}"/>`)}</g>`;
  s += G_(matStr(mK), kn);
  s += `<g transform="translate(${f(-4 * U[0])},${f(-4 * U[1])})">${G_(matStr(mK), `<circle r="14" fill="#55595f" stroke="#141518" stroke-width="1.2"/>` + Array.from({ length: 16 }, (_, i) => { const a = i * 22.5 * DEG; return `<path d="M${f(11 * Math.cos(a))} ${f(11 * Math.sin(a))}L${f(14 * Math.cos(a))} ${f(14 * Math.sin(a))}" stroke="#2b2d31" stroke-width="1.4"/>`; }).join(""))}</g>`;
  // ---- sloped face: LCD, plate, window with paper
  const tilt = Math.atan2(v1 - v0, zHi - zLo) / DEG;
  const mT = frameTilt(o, u0, v0, zHi, tilt);
  const PW = 172, PH = 72, WX = 14, WY = 34, penX = Math.round(PW * 0.72), OFFMAX = 800;
  const winW = Math.min(penX - 4, opts.win ?? 56);
  // curve samples along paper X (step 3)
  const rnd = rng(p + ":curve"), N = Math.ceil((penX + OFFMAX) / 3) + 2, mid = PH * 0.56;
  const ys = []; let nz = 0;
  for (let i = 0; i < N; i++) { const X = i * 3; nz = nz * 0.7 + (rnd() - 0.5) * 3.2; ys.push(f(mid + 6 * Math.sin(X / 23) + 3.5 * Math.sin(X / 9.7 + 1) + nz)); }
  const yAt = (X) => { const i = Math.max(0, Math.min(N - 2, Math.floor(X / 3))), q = X / 3 - i; return ys[i] + (ys[i + 1] - ys[i]) * q; };
  const off0 = opts.off ?? 0, spikeX = opts.spikeAt ?? 70;
  let sl = `<rect x="4" y="4" width="${u1 - u0 - 8}" height="${Math.hypot(v1 - v0, zHi - zLo) - 8}" rx="4" fill="none" stroke="${lighten(CAST.t, 0.12)}" stroke-width="1.6"/>`;
  sl += `<rect x="14" y="10" width="44" height="16" rx="2" fill="#2b2d31" stroke="#141518" stroke-width="1"/>` + txt(36, 21.5, "AVG·T", { size: 7.5, mono: true, anchor: "middle", fill: "#d3d7dc", weight: 700 });
  sl += `<circle cx="68" cy="18" r="3" fill="${LED.green}" stroke="rgba(0,0,0,0.35)"/><circle cx="78" cy="18" r="3" fill="${LED.off}" stroke="rgba(0,0,0,0.35)"/>`;
  // LCD avg readout
  sl += `<rect id="${p}-avg-bg" x="96" y="7" width="84" height="22" rx="3" fill="#17262b" stroke="${atk ? RED : "#141518"}" stroke-width="${atk ? 2.4 : 1.2}"/>`;
  sl += txt(101, 15, "均值", { size: 5.5, fill: "#6d8c94", weight: 800 });
  sl += txt(176, 24, opts.avg ?? (atk ? "2,900" : "2,000"), { id: `${p}-avg`, size: 13, mono: true, anchor: "end", fill: atk ? "#ff6a5d" : "#9ad9ee", weight: 800 });
  // bezel
  sl += `<rect x="${WX - 6}" y="${WY - 6}" width="${PW + 12}" height="${PH + 12}" rx="6" fill="#d4d7db" stroke="#5a5e65" stroke-width="1.4"/><rect x="${WX - 3}" y="${WY - 3}" width="${PW + 6}" height="${PH + 6}" rx="4" fill="#25282c"/>`;
  // window content in window coords
  let w = `<defs><clipPath id="${p}-wc"><rect x="0" y="0" width="${PW}" height="${PH}"/></clipPath><clipPath id="${p}-pc"><rect x="0" y="0" width="${penX}" height="${PH}"/></clipPath>
    <clipPath id="${p}-tc"><rect id="${p}-trail-c" x="0" y="0" width="${atk || opts.trail ? PW : 0}" height="${PH}"/></clipPath></defs>`;
  w += `<rect x="0" y="0" width="${PW}" height="${PH}" fill="#fffefb"/>`;
  for (let y = 6, i = 0; y < PH; y += 6, i++) w += `<path d="M0 ${y}H${PW}" stroke="${i % 4 === 3 ? "#bcd3da" : "#e1ecef"}" stroke-width="${i % 4 === 3 ? 1 : 0.7}"/>`;
  let grid = "";
  for (let X = 0, i = 0; X < penX + OFFMAX + PW; X += 6, i++) grid += `<path d="M${X} 0V${PH}" stroke="${i % 4 === 0 ? "#bcd3da" : "#e1ecef"}" stroke-width="${i % 4 === 0 ? 1 : 0.7}"/>`;
  w += `<g clip-path="url(#${p}-wc)"><g id="${p}-paper" transform="translate(${-off0} 0)">${grid}</g></g>`;
  const curveD = "M" + ys.map((y, i) => `${i * 3} ${y}`).join("L");
  const spikeD = `M${spikeX - 5} ${f(yAt(spikeX - 5))}L${spikeX - 1.5} ${f(yAt(spikeX - 5) - 8)}L${spikeX} 5L${spikeX + 2} ${f(yAt(spikeX + 5) - 6)}L${spikeX + 5} ${f(yAt(spikeX + 5))}`;
  w += `<g clip-path="url(#${p}-pc)"><g id="${p}-paper-ink" transform="translate(${-off0} 0)"><path d="${curveD}" fill="none" stroke="${C.ink}" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<g id="${p}-spike" opacity="${opts.spike ? 1 : 0}"><path d="${spikeD}" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linejoin="round"/><path d="${spikeD}" fill="none" stroke="${RED}" stroke-width="2.2" stroke-linejoin="round"/></g></g></g>`;
  // red staircase trail (attacker keeps pushing over several blocks)
  let st = `M6 ${f(mid)}`, ty = mid;
  for (let x = 6; x < penX; x += 20) { st += `H${Math.min(penX, x + 20)}`; if (x + 20 < penX) { ty -= 6.5; st += `V${f(ty)}`; } }
  w += `<g id="${p}-trail" data-pw="${PW}" clip-path="url(#${p}-tc)"><path d="${st}V${PH}H6Z" fill="rgba(224,69,58,0.12)"/><path d="${st}" fill="none" stroke="${RED}" stroke-width="2.6" stroke-linejoin="round"/></g>`;
  // window frame (right edge fixed at the pen)
  w += `<g id="${p}-win" data-pen="${penX}" data-w="${winW}" data-max="${penX - 4}"><rect id="${p}-win-r" x="${penX - winW}" y="1.5" width="${winW}" height="${PH - 3}" fill="rgba(42,163,201,0.16)" stroke="#2aa3c9" stroke-width="2.4"/>` +
    `<rect id="${p}-win-h" x="${penX - winW - 2.5}" y="${PH / 2 - 9}" width="5" height="18" rx="2" fill="#1d93ba" stroke="#ffffff" stroke-width="1"/></g>`;
  // pen (arm from the right bezel; tip follows the curve)
  const pen0 = yAt(penX + off0);
  w += `<g id="${p}-pen" data-x="${penX}" transform="translate(0 ${f(pen0)})"><path d="M${penX + 3} -1.6H${PW + 8}V1.6H${penX + 3}Z" fill="#a9aeb5" stroke="#3b3e44" stroke-width="0.8"/>` +
    `<path d="M${penX + 6} -4L${penX} 0L${penX + 6} 4Z" fill="${C.ink}"/><circle cx="${penX + 9}" cy="0" r="2.4" fill="#1d93ba" stroke="#ffffff" stroke-width="0.8"/></g>`;
  // glass highlights
  w += `<rect x="0" y="0" width="${PW}" height="${PH}" fill="rgba(220,240,248,0.12)"/><path d="M${PW * 0.08} 0L${PW * 0.2} 0L${PW * 0.04} ${PH}L${-PW * 0.08} ${PH}Z" fill="#ffffff" opacity="0.25" clip-path="url(#${p}-wc)"/>` +
    `<path d="M${PW * 0.26} 0L${PW * 0.3} 0L${PW * 0.14} ${PH}L${PW * 0.1} ${PH}Z" fill="#ffffff" opacity="0.2" clip-path="url(#${p}-wc)"/>`;
  sl += `<g transform="translate(${WX} ${WY})" id="${p}-wdata" data-ys="${ys.join(",")}" data-off="${off0}">${w}</g>`;
  s += G_(matStr(mT), sl);
  // knob pointer (rotates with the window length)
  const kDeg = -135 + (270 * winW) / (penX - 4);
  s += `<g transform="translate(${f(-4 * U[0])},${f(-4 * U[1])})">${rotator(`${p}-knob`, mK, 0, 0, kDeg, `<path d="M-1.6 0V-12H1.6V0Z" fill="#f6f3ec"/><circle r="3" fill="#2b2d31"/>`, `data-max="${penX - 4}"`)}</g>`;
  const anchors = {
    top: at(o, 0, 0, 205), center: at(o, 0, 0, 80), ground: at(o),
    window: applyM(mT, WX + PW / 2, WY + PH / 2), avg: applyM(mT, 138, 18), pen: applyM(mT, WX + penX, WY + pen0), spike: applyM(mT, WX + spikeX - off0, WY + 5), knob: applyM(mK, 0, 0),
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0, u1, v0, v1, 0, zHi]], center: anchors.center, glowR: 170, k: K }), anchors: scaleAnchors(o, K, anchors) };
}

// =====================================================================================
// 菜市场黄金摊 marketStall — 条纹遮阳篷（米白 + 青蓝）木摊位，台面两堆小金条，摊后小黑板价目牌（白粉笔写价），篷檐挂一盏小灯
// 约 220×120×275（价目牌立在篷后、高出篷顶，免得被篷挡住）。opts: price（价目牌，默认 "¥ 480"，attacker 默认 "¥ 4800" 红色大字）, head（牌头，默认 "今日金价 / 克"）, gold=9（台面金条根数 0–9）, lamp=true（灯亮）
// 可动：ID-board（价目牌）/ ID-board-v（价格字，KITX08.stallPrice 擦掉重写、可变红）, ID-gold / ID-gold-k（金条，KITX08.goldTo 逐根搬空 / 搬回）, ID-lamp（灯光，KITX08.stallLamp）
// anchors: top, center, ground, board（价目牌中心）, gold（台面金条堆）, counter（摊位正面）, lamp
// =====================================================================================
export function marketStall(o, opts = {}) {
  const p = opts.id ?? "stall", K = opts.scale ?? 1, atk = isAtk(opts);
  const nGold = Math.max(0, Math.min(9, opts.gold ?? 9));
  let s = contactShadow(o, 170, 100);
  // awning geometry
  const au0 = -118, au1 = 118, av0 = -64, av1 = 68, az0 = 214, az1 = 196;
  const azAt = (v) => az0 + ((v - av0) / (av1 - av0)) * (az1 - az0);
  const post = (u, v) => box(o, u - 3.5, u + 3.5, v - 3.5, v + 3.5, 0, azAt(v), WOOD, 1.2);
  s += post(106, -56) + post(-106, -56);
  // ---- chalk price board on two tall legs behind the stall, standing clear above the awning
  const bu0 = -54, bw = 108, bh = 50, bz1 = 274, bv = -60;
  s += box(o, bu0 + 6, bu0 + 12, bv - 7, bv - 2, 0, bz1 - 6, WOOD_D, 1) + box(o, bu0 + bw - 12, bu0 + bw - 6, bv - 7, bv - 2, 0, bz1 - 6, WOOD_D, 1);
  const mB = frameV(o, bu0, bv, bz1);
  for (let i = 4; i >= 1; i--) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(mB), `<rect x="0" y="0" width="${bw}" height="${bh}" rx="2" fill="${i === 4 ? "#4a2c14" : "#6f4524"}"/>`)}</g>`;
  const priceTxt = opts.price ?? (atk ? "¥ 4800" : "¥ 480");
  let bd = `<rect x="0" y="0" width="${bw}" height="${bh}" rx="2" fill="#a87443" stroke="#4a2c14" stroke-width="1.2"/><rect x="4.5" y="4.5" width="${bw - 9}" height="${bh - 9}" rx="1" fill="#27322e"/>`;
  bd += `<ellipse cx="30" cy="28" rx="22" ry="7" fill="#ffffff" opacity="0.05"/><ellipse cx="70" cy="14" rx="16" ry="5" fill="#ffffff" opacity="0.06"/>`;
  bd += txt(bw / 2, 14, opts.head ?? "今日金价 / 克", { size: 7, anchor: "middle", fill: "#d9d6cc", weight: 700 });
  bd += `<path d="M14 17.5Q48 15.5 82 17.5" stroke="#d9d6cc" stroke-width="0.8" fill="none" opacity="0.7"/>`;
  bd += txt(bw / 2, atk ? 36 : 34, priceTxt, { id: `${p}-board-v`, size: atk ? 19 : 16, anchor: "middle", fill: atk ? "#ff6a5d" : "#f4f2ea", weight: 900, extra: `data-red="${atk ? 1 : 0}"` });
  bd += `<rect x="6" y="${bh - 3}" width="${bw - 12}" height="3" rx="1" fill="#6f4524"/><rect x="20" y="${bh - 4.5}" width="8" height="2" rx="1" fill="#f4f2ea"/>`;
  s += `<g id="${p}-board">${G_(matStr(mB), bd)}</g>`;
  // ---- counter
  const cu0 = -100, cu1 = 100, cv0 = -12, cv1 = 48, cz = 74;
  const BODY = atk ? mat("#c9463c") : { f: "#b98454", s: "#956236", t: "#d0a172", st: "#5a3518" };
  s += box(o, cu0, cu1, cv0, cv1, 0, cz, BODY, 1.6);
  const mC = frameV(o, cu0, cv1, cz), CW = cu1 - cu0;
  let cf = "";
  for (let x = 20; x < CW; x += 20) cf += `<path d="M${x} 3V${cz - 3}" stroke="${darken(BODY.s, 0.22)}" stroke-width="1.3"/><path d="M${x + 1.3} 3V${cz - 3}" stroke="${lighten(BODY.s, 0.1)}" stroke-width="0.7"/>`;
  cf += `<rect x="5" y="5" width="${CW - 10}" height="${cz - 10}" rx="2" fill="none" stroke="${lighten(BODY.s, 0.2)}" stroke-width="2"/><rect x="7.5" y="7.5" width="${CW - 15}" height="${cz - 15}" rx="1.5" fill="none" stroke="${darken(BODY.s, 0.3)}" stroke-width="1"/>`;
  cf += `<circle cx="${CW / 2}" cy="${cz / 2}" r="15" fill="${GOLD.f}" stroke="${GOLD.st}" stroke-width="1.6"/><circle cx="${CW / 2}" cy="${cz / 2}" r="11.5" fill="none" stroke="${GOLD.t}" stroke-width="1.2"/>` +
    txt(CW / 2, cz / 2 + 5, "金", { size: 13, anchor: "middle", fill: GOLD.st, weight: 900 });
  s += G_(matStr(mC), cf);
  s += box(o, cu0 - 4, cu1 + 4, cv0 - 4, cv1 + 4, cz, cz + 6, { f: BODY.t, s: BODY.f, t: lighten(BODY.t, 0.12), st: BODY.st }, 1.4);
  s += G_(faceTop(o, 0, 0, cz + 6), `<path d="M${cu0} ${cv0 + 12}H${cu1}M${cu0} ${cv0 + 34}H${cu1}" stroke="${darken(BODY.t, 0.12)}" stroke-width="1"/><rect x="-92" y="6" width="150" height="34" rx="2" fill="#f2ead8" opacity="0.6"/>`);
  // ---- gold bars (index = placement order; removal goes from the top index down)
  const zG = cz + 6, bh2 = 9;
  const spots = [[-80, 20, 0], [-50, 20, 0], [-20, 20, 0], [-65, 20, 1], [-35, 20, 1], [-50, 20, 2], [24, 22, 0], [54, 22, 0], [39, 22, 1]];
  const bar = (u, v, z) => loft(o, rrectPlan(u - 14, u + 14, v - 8, v + 8, 1.4, 2), rrectPlan(u - 11, u + 11, v - 5.5, v + 5.5, 1.2, 2), z, z + bh2, GOLD, { sw: 1.1 }) +
    G_(faceTop(o, u, v, z + bh2 + 0.1), `<rect x="-8" y="-2.6" width="16" height="5.2" rx="0.6" fill="none" stroke="${GOLD.st}" stroke-width="0.6" opacity="0.7"/><path d="M-7 -3.2H5" stroke="#fff6d0" stroke-width="1" opacity="0.8"/>`);
  const order = spots.map((q, i) => i).sort((a, b) => spots[a][2] - spots[b][2] || spots[b][0] - spots[a][0]);
  let gold = "";
  for (const i of order) { const [u, v, row] = spots[i]; gold += `<g id="${p}-gold-${i}" opacity="${i < nGold ? 1 : 0}">${bar(u, v, zG + row * bh2)}</g>`; }
  s += `<g id="${p}-gold" data-n="${nGold}">${gold}</g>`;
  // ---- front posts
  s += post(-106, 56) + post(106, 56);
  // ---- awning: stripes along v
  const NS = 10, sw = (au1 - au0) / NS;
  let aw = "";
  // −u side edge strip
  aw += `<polygon points="${pts([at(o, au0, av0, az0), at(o, au0, av1, az1), at(o, au0, av1, az1 - 9), at(o, au0, av0, az0 - 9)])}" fill="#2a87a8" stroke="#1d6d88" stroke-width="1.2" stroke-linejoin="round"/>`;
  for (let i = 0; i < NS; i++) {
    const ua = au0 + i * sw, ub = ua + sw;
    aw += `<polygon points="${pts([at(o, ua, av0, az0), at(o, ub, av0, az0), at(o, ub, av1, az1), at(o, ua, av1, az1)])}" fill="${i % 2 ? "#5cc0e0" : "#f6efdf"}" stroke="${i % 2 ? "#3a9ec2" : "#e3d8c1"}" stroke-width="0.8" stroke-linejoin="round"/>`;
  }
  aw += `<polygon points="${pts([at(o, au0, av0, az0), at(o, au1, av0, az0), at(o, au1, av1, az1), at(o, au0, av1, az1)])}" fill="none" stroke="#2a87a8" stroke-width="1.6" stroke-linejoin="round"/>`;
  // front scalloped valance
  const mV = frameV(o, au0, av1, az1);
  let vl = "";
  for (let i = 0; i < NS; i++) vl += `<path d="M${f(i * sw)} 0h${f(sw)}v8a${f(sw / 2)} 6 0 0 1 ${f(-sw)} 0z" fill="${i % 2 ? "#3a9ec2" : "#e9dfc8"}" stroke="${i % 2 ? "#2a87a8" : "#cdbf9f"}" stroke-width="1"/>`;
  vl += `<path d="M0 0.8H${au1 - au0}" stroke="#2a87a8" stroke-width="1.6"/>`;
  aw += G_(matStr(mV), vl);
  s += aw;
  // ---- lamp under the front edge
  const lu = 70, lv = av1 - 4, lz = az1 - 22;
  const lp = at(o, lu, lv, lz);
  s += line3(o, [[lu, lv, az1 - 6], [lu, lv, lz + 7]], "#3b3e44", 1.6);
  s += frustum(o, lu, lv, 4, 8.5, lz + 3, lz + 9, M.steel, { seg: 18, sw: 1 });
  s += `<g id="${p}-lamp" opacity="${opts.lamp === false ? 0 : 1}"><circle cx="${f(lp[0])}" cy="${f(lp[1] + 4)}" r="26" fill="url(#${p}-lg)"/></g>`;
  s += `<defs><radialGradient id="${p}-lg"><stop offset="0" stop-color="#fff2c4" stop-opacity="0.95"/><stop offset="0.4" stop-color="#ffe08a" stop-opacity="0.45"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></radialGradient></defs>`;
  s += sphere(`${p}-bulb`, o, lu, lv, lz, 5.5, { f: "#fff3c8", s: "#f0d37a", t: "#ffffff", st: "#a88a3a" }, 1);
  const anchors = {
    top: at(o, 0, -60, 300), center: at(o, 0, 0, 90), ground: at(o),
    board: applyM(mB, bw / 2, bh / 2), gold: at(o, -20, 20, zG + 24), counter: applyM(mC, CW / 2, cz / 2), lamp: lp,
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [[cu0, cu1, cv0, cv1, 0, cz + 6], [bu0, bu0 + bw, bv - 6, bv, 0, bz1], [au0, au1, av0, av1, az1 - 9, az0]], center: anchors.center, badgeR: 32, glowR: 190, k: K }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

// =====================================================================================
// 清算机器人 liqBot — 小型四轮工厂机器人：墨色底盘、青蓝机身、顶上旋转小灯、正面小屏（读到的价格）、前伸两指夹爪（抓抵押品）
// 约 70×60×90。opts: scr（小屏文字，默认 "$2,000"）, open=false（夹爪张开）, lamp=false（灯一开始就亮）, n=1（排成一队，沿 +u 往后排，间距 gap=86）
// 可动：ID-lamp（灯 + 旋转光束 ID-beam，KITX08.botLamp）, ID-claw-l / ID-claw-r（夹爪开合，KITX08.claw / grab）, ID-scr（小屏换字，KITX08.botScr）；
//   n>1 时第 k 台的部件前缀是 ID-k（例如 ID-1-claw-l）。根元素（及每台 ID-k）带 data-px/py，可用 KITX01.walk / KITX06.carry 移动
// anchors: top, center, ground, scr（小屏）, claw（夹爪尖）, lamp, bots[]（n>1 时每台的地面点）
// =====================================================================================
export function liqBot(o, opts = {}) {
  const p = opts.id ?? "bot", K = opts.scale ?? 1, atk = isAtk(opts), n = Math.max(1, opts.n ?? 1), gap = opts.gap ?? 86;
  const BODY = atk ? M.red : { f: "#5cc0e0", s: "#3a9ec2", t: "#9ad9ee", st: "#1d6d88" };
  const one = (q, o2) => {
    let s = contactShadow(o2, 46, 36);
    const wheel = (u, v) => {
      let w = "";
      const m = frameU(o2, u, v, 11);
      for (let i = 6; i >= 1; i--) w += `<g transform="translate(${f(i * U[0])},${f(i * U[1])})">${G_(matStr(m), `<circle r="11" fill="${i === 6 ? "#141518" : "#25272b"}"/>`)}</g>`;
      w += G_(matStr(m), `<circle r="11" fill="#2b2d31" stroke="#141518" stroke-width="1.2"/><circle r="5.5" fill="#a9aeb5" stroke="#3b3e44" stroke-width="1"/><circle r="1.8" fill="#3b3e44"/>` +
        [0, 90, 180, 270].map((a) => `<rect x="-1" y="-10.5" width="2" height="3" fill="#45484e" transform="rotate(${a + 45})"/>`).join(""));
      return w;
    };
    // far wheels (+u side) first
    s += wheel(28, -18) + wheel(28, 18);
    s += box(o2, -28, 28, -28, 28, 6, 20, M.ink, 1.3);
    s += G_(faceV(o2, -28, 28, 20), `<rect x="4" y="4" width="48" height="6" rx="2" fill="#141518"/>` + [10, 22, 34, 46].map((x) => `<circle cx="${x}" cy="7" r="1.4" fill="#a9aeb5"/>`).join(""));
    s += wheel(-28, -18) + wheel(-28, 18);
    // body
    s += rbox(o2, -24, 24, -22, 20, 20, 64, 6, BODY, { sw: 1.5 });
    const mS = frameV(o2, -24, 20, 64);
    s += G_(matStr(mS), `<rect x="6" y="6" width="36" height="20" rx="3" fill="#2b2d31" stroke="#141518" stroke-width="1.2"/><rect x="8.5" y="8.5" width="31" height="15" rx="1.5" fill="#17262b"/>` +
      txt(24, 19.5, opts.scr ?? "$2,000", { id: `${q}-scr`, size: 8, mono: true, anchor: "middle", fill: "#9ad9ee", weight: 800 }) +
      `<path d="M10 9.5H22" stroke="#ffffff" stroke-width="1" opacity="0.15"/>` +
      [0, 1, 2].map((i) => `<rect x="12" y="${31 + i * 3.4}" width="24" height="1.6" rx="0.8" fill="${BODY.st}" opacity="0.7"/>`).join(""));
    s += G_(faceU(o2, -24, -22, 64), `<rect x="8" y="8" width="26" height="26" rx="3" fill="none" stroke="${lighten(BODY.f, 0.3)}" stroke-width="1.4"/><circle cx="21" cy="21" r="4" fill="${BODY.st}" opacity="0.5"/>`);
    // head cap + lamp
    s += rbox(o2, -12, 12, -12, 10, 64, 70, 3, M.ink, { sw: 1.2 });
    s += cyl(o2, 0, -1, 6.5, 70, 74, M.steel, { seg: 20, sw: 1 });
    const lp = at(o2, 0, -1, 80);
    s += `<g id="${q}-lamp" opacity="${opts.lamp ? 1 : 0}"><circle cx="${f(lp[0])}" cy="${f(lp[1])}" r="16" fill="${LED.blue}" opacity="0.35"/></g>`;
    const mL = frameTop(o2, 0, -1, 79);
    s += rotator(`${q}-beam`, mL, 0, 0, 0, `<path d="M0 0L34 -7L34 7Z" fill="${LED.blue}" opacity="0.35"/>`, `opacity="${opts.lamp ? 1 : 0}"`);
    s += `<path d="M${f(lp[0] - 6)} ${f(lp[1] + 5)}V${f(lp[1] - 1)}A6 6 0 0 1 ${f(lp[0] + 6)} ${f(lp[1] - 1)}V${f(lp[1] + 5)}Z" fill="rgba(208,234,244,0.85)" stroke="#2a87a8" stroke-width="1.2"/>` +
      `<circle id="${q}-lamp-c" cx="${f(lp[0])}" cy="${f(lp[1] + 1)}" r="3.2" fill="${opts.lamp ? LED.blue : "#8fb7c4"}"/><path d="M${f(lp[0] - 3.5)} ${f(lp[1] - 3)}q2 -2 4 -1.5" stroke="#ffffff" stroke-width="1.2" fill="none"/>`;
    // claw arm + fingers (top-plane)
    s += box(o2, -4, 4, 20, 40, 32, 38, M.steel, 1.1);
    s += cyl(o2, 0, 40, 5.5, 31, 39, M.steelLight, { seg: 16, sw: 1 });
    const mC = frameTop(o2, 0, 40, 35);
    const finger = (sx) => `<path d="M${sx * 2} 0C${sx * 10} 4 ${sx * 11} 12 ${sx * 6} 19L${sx * 3} 17C${sx * 6} 12 ${sx * 5} 6 ${sx * 0.5} 3Z" fill="#c3c8ce" stroke="#3b3e44" stroke-width="1.2" stroke-linejoin="round"/>`;
    const ang = opts.open ? 22 : 0;
    s += rotator(`${q}-claw-l`, mC, -1.5, 0, -ang, finger(-1), `data-open="-22"`);
    s += rotator(`${q}-claw-r`, mC, 1.5, 0, ang, finger(1), `data-open="22"`);
    const g = at(o2);
    return {
      svg: `<g id="${q}" data-px="${f(g[0])}" data-py="${f(g[1])}">${s}</g>`,
      a: { scr: applyM(mS, 24, 16), claw: at(o2, 0, 58, 35), lamp: lp, ground: g },
    };
  };
  let solid = "";
  const bots = [];
  for (let k = n - 1; k >= 0; k--) {
    const q = n === 1 ? p + "-b" : `${p}-${k}`;
    const r = one(n === 1 ? p : `${p}-${k}`, { u: o.u + k * gap, v: o.v });
    bots[k] = r.a;
    solid += n === 1 ? r.svg.replace(`<g id="${p}" `, `<g id="${q}" `) : r.svg;
  }
  const a0 = bots[0], g = at(o);
  const anchors = { top: at(o, 0, 0, 128), center: at(o, 0, 0, 44), ground: g, scr: a0.scr, claw: a0.claw, lamp: a0.lamp, bots: bots.map((b) => b.ground) };
  const wire = Array.from({ length: n }, (_, k) => [-30 + k * gap, 30 + k * gap, -28, 28, 0, 74]);
  return {
    svg: shell(p, o, opts, { solid, wire, center: at(o, 0, 0, 44), badgeR: 18, glowR: 70, k: K, attrs: `data-px="${f(g[0])}" data-py="${f(g[1])}"` }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

export const CATALOG_EXT = { ammPool, twapRecorder, marketStall, liqBot };
/** runtime-ext.js contents — inline after iso.runtimeJs() (and other chapters' runtime-ext) */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
