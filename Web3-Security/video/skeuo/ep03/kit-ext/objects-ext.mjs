// objects-ext.mjs — 第 03 章补充拟物物件（与 kit/objects.mjs 同一投影、同一接口）
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"
//   opts.glow = true 时脚下绿色地光
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x
// 运行时动画助手在 runtime-ext.js（window.KITX），用 runtimeExtJs() 内联，放在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  CA, SA, SE, CE, U, V, f, f4, at, pts, M, C, lighten, darken, mat,
  frameV, frameU, frameTop, matStr, applyM, faceV, faceU, faceTop,
  box, rbox, cyl, frustum, wedge, flat, line3, circlePlan,
  glow, contactShadow, wireSvg, badgeSvg,
} from "../../kit/iso.mjs";

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
/** approximate text width (CJK = 1 em, latin ≈ 0.6 em) */
const tw = (s, size, mono = false) => [...String(s)].reduce((a, c) => a + (/[⺀-￿]/.test(c) ? 1 : mono ? 0.6 : 0.58) * size, 0);
function gearD(cx, cy, r, n = 10, h = 5) {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a0 = (i / (n * 2)) * 2 * Math.PI, a1 = ((i + 1) / (n * 2)) * 2 * Math.PI, rr = i % 2 ? r : r + h;
    const p0 = [cx + rr * Math.cos(a0), cy + rr * Math.sin(a0)], p1 = [cx + rr * Math.cos(a1), cy + rr * Math.sin(a1)];
    d += (i === 0 ? `M${f(p0[0])} ${f(p0[1])}` : `L${f(p0[0])} ${f(p0[1])}`) + `L${f(p1[0])} ${f(p1[1])}`;
  }
  return d + "Z";
}
function shell(p, o, opts, s) {
  const st = opts.state ?? "normal", broken = st === "broken";
  const glowOn = (opts.glow ?? s.glowDefault ?? false) && !broken;
  const [ox, oy] = at(o);
  const glowSvg = s.glowR ? `<g id="${p}-glow" opacity="${glowOn ? 1 : 0}">${glow(p + "-gl", s.glowAt ?? o, s.glowR)}</g>` : "";
  return `<g id="${p}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}" data-state="${st}">${s.under ?? ""}${glowSvg}${s.shadow ?? ""}
  <g id="${p}-solid" opacity="${broken ? opts.ghost ?? 0.18 : 1}">${s.solid}</g>
  ${wireSvg(p + "-wire", o, s.wire, { opacity: broken ? 1 : 0 })}
  ${badgeSvg(p + "-x", s.center, s.badgeR ?? 30, broken && opts.badge !== false ? 1 : 0)}${s.over ?? ""}</g>`;
}
const isAtk = (opts) => opts.state === "attacker";
const mArr = (m) => m.map((v, i) => (i < 4 ? f4(v) : f(v))).join(",");
function rotator(id, m, px, py, a, inner, extra = "") {
  const tr = `${matStr(m)} translate(${px} ${py}) rotate(${f(a)}) translate(${-px} ${-py})`;
  return `<g id="${id}" data-m="${mArr(m)}" data-px="${px}" data-py="${py}" data-a="${f(a)}" transform="${tr}" ${extra}>${inner}</g>`;
}
const P = (q) => pts([q]);
const polyD = (arr) => `M${arr.map(P).join("L")}Z`;
const chromeGrad = (id) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f5f6"/><stop offset="0.5" stop-color="#c3c7cc"/><stop offset="1" stop-color="#7d828a"/></linearGradient></defs>`;
const TEAL = { f: "#5cc0e0", s: "#3a9ec2", t: "#9ad9ee", st: "#1f7896" };
const brass = { f: "#d6a64a", s: "#b58630", t: "#ecc778", st: "#7a5716" };

// =====================================================================================
// 合约机器 contractMachine — 齿轮外露的方形机器（约 220×200×220）
// opts: name="A"（正面铭牌大字）, tone:"light"|"gray", slotLit=false（投信口亮）, pipe=0（−u 侧传送管长度，0 不画）,
//       pipeZ=120, led="green", code=["60 80 60 40","52 34 80 15"]（小屏两行）
// 可动：ID-gear-0 / ID-gear-1（顶部咬合齿轮）、ID-gear-2 / ID-gear-3（−u 侧舷窗里的齿轮）——KITX.spin 同步转动；
//       ID-slot-glow（投信口亮边，KITX.slot）；ID-led（KIT.led）；ID-scr（小屏内容组，本地 92×40，可 KIT.swap 到 ID-scr2）
// anchors: top, center, ground, front, slot（投信口中心）, out（出件槽前方）, plate（铭牌中心）, pipeEnd, gears[]
// =====================================================================================
export function contractMachine(o, opts = {}) {
  const p = opts.id ?? "cm", atk = isAtk(opts), gray = opts.tone === "gray";
  const body = atk ? mat("#d65248", { st: "#8f2620" }) : gray ? { f: "#b4b9c0", s: "#9aa0a8", t: "#cdd1d6", st: "#5d636b" } : { f: "#eef1f3", s: "#d3d9de", t: "#f8f9fa", st: "#7f8b95" };
  const accent = atk ? "#a8322a" : "#2aa3c9";
  const GC = atk ? { fill: "#e8574c", hi: "#f6a59d", st: "#7a1d17", hole: "#b8382e" } : { fill: "#3aa9cf", hi: "#a6e0f2", st: "#155e77", hole: "#1f7f9f" };
  const u0 = -110, u1 = 110, v0 = -100, v1 = 100, zb = 14, zT = 190, zH = zT + 18, W = u1 - u0, D = v1 - v0;
  let s = contactShadow(o, 175, 135);
  s += rbox(o, u0 - 8, u1 + 8, v0 - 8, v1 + 8, 0, zb, 10, M.ink, { sw: 1.4 });
  s += rbox(o, u0, u1, v0, v1, zb, zT, 14, body, { sw: 2 });
  // top deck: panel seam + bolts
  s += G_(faceTop(o, u0 + 12, v0 + 12, zT), `<rect x="0" y="0" width="${W - 24}" height="${D - 24}" rx="8" fill="none" stroke="${darken(body.t, 0.12)}" stroke-width="2"/>` +
    [[8, 8], [W - 32, 8], [8, D - 32], [W - 32, D - 32]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${darken(body.t, 0.22)}"/>`).join(""));
  // gear housing, back half
  const hM = atk ? mat("#a8322a") : M.steel;
  s += box(o, -100, 100, -46, -26, zT, zH, hM, 1.4);
  s += flat(o, [[-100, -26], [100, -26], [100, -12], [-100, -12]], zH - 2, "#141518");
  // gears (vertical, plane v = vg), clipped above the housing slot
  const vg = -14, mg = frameV(o, 0, vg, 0), gz = zT + 26;
  const n0 = 12, r0 = 42, n1 = 8, r1 = 28, gh = 7, g0u = -32, g1u = g0u + r0 + r1 + gh;
  const gear = (cx, cy, r, n, h) => {
    let g = `<path d="${gearD(cx, cy, r, n, h)}" fill="${GC.fill}" stroke="${GC.st}" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="${cx}" cy="${cy}" r="${f(r * 0.8)}" fill="none" stroke="${GC.hi}" stroke-width="2" opacity="0.85"/>`;
    if (r > 20) for (let k = 0; k < 5; k++) { const a = (k * 72 + 18) * DEG; g += `<circle cx="${f(cx + r * 0.52 * Math.cos(a))}" cy="${f(cy + r * 0.52 * Math.sin(a))}" r="${f(r * 0.15)}" fill="${GC.hole}" stroke="${GC.st}" stroke-width="1"/>`; }
    g += `<circle cx="${cx}" cy="${cy}" r="${f(r * 0.26)}" fill="${GC.hi}" stroke="${GC.st}" stroke-width="1.6"/><circle cx="${cx}" cy="${cy}" r="${f(r * 0.1)}" fill="${GC.st}"/>`;
    return g;
  };
  const clipPoly = [at(o, -140, vg, zH - 4), at(o, 140, vg, zH - 4), at(o, 140, vg, zH + 140), at(o, -140, vg, zH + 140)];
  let gs = "";
  for (const k of [10, 7, 4]) for (const i of [0, 1]) gs += `<use href="#${p}-gear-${i}" transform="translate(${f(-k * V[0])},${f(-k * V[1])})" style="filter:brightness(0.62)"/>`;
  gs += rotator(p + "-gear-0", mg, g0u, -gz, 0, gear(g0u, -gz, r0, n0, gh), `data-ratio="1"`);
  gs += rotator(p + "-gear-1", mg, g1u, -gz, 0, gear(g1u, -gz, r1, n1, gh), `data-ratio="${-n0 / n1}"`);
  s += `<defs><clipPath id="${p}-gc"><polygon points="${pts(clipPoly)}"/></clipPath></defs><g clip-path="url(#${p}-gc)">${gs}</g>`;
  // gear housing, front half
  s += box(o, -100, 100, -12, 6, zT, zH, hM, 1.4);
  s += G_(faceV(o, -100, 6, zH), `<rect x="0" y="5" width="200" height="4" fill="${accent}"/>` + [14, 186].map((x) => `<circle cx="${x}" cy="12" r="2.5" fill="#c9cdd2"/>`).join(""));
  // front face (+v)
  const mF = frameV(o, u0, v1, zT);
  let fp = `<rect x="14" y="8" width="${W - 28}" height="8" fill="${accent}"/>`;
  // nameplate
  const nm = opts.name ?? "A";
  const pw = Math.max(64, tw(nm, 40) + 22);
  fp += `<rect x="24" y="26" width="${f(pw)}" height="56" rx="6" fill="#fffdf8" stroke="#7d828a" stroke-width="2"/>` +
    [[29, 31], [19 + pw, 31], [29, 77], [19 + pw, 77]].map(([x, y]) => `<circle cx="${f(x)}" cy="${y}" r="2" fill="#9aa0a8"/>`).join("") +
    txt(24 + pw / 2, 69, nm, { size: 40, anchor: "middle", fill: atk ? "#c3352b" : C.ink });
  // little code screen
  const code = opts.code ?? ["60 80 60 40", "52 34 80 15"];
  const sx = 24 + pw + 12, sw = W - 24 - sx;
  fp += `<rect x="${f(sx)}" y="26" width="${f(sw)}" height="40" rx="4" fill="#0f2a33" stroke="#141518" stroke-width="1.6"/>
    <g id="${p}-scr">${code.map((l, i) => txt(sx + 8, 42 + i * 16, l, { size: 12, mono: true, weight: 700, fill: atk ? "#ffb3ab" : "#9ad9ee" })).join("")}</g><g id="${p}-scr2" opacity="0">${opts.screen2 ?? ""}</g>`;
  fp += ledSvg(p + "-led", W - 32, 76, 4.5, opts.led ?? "green") + `<circle cx="${W - 48}" cy="76" r="3" fill="#9aa0a8"/>`;
  // mail slot (calldata in)
  fp += `<rect x="36" y="90" width="148" height="28" rx="9" fill="#c9cdd2" stroke="#5a5e65" stroke-width="1.6"/><rect x="38" y="92" width="144" height="6" rx="3" fill="#eef0f2"/>
    <rect x="46" y="100" width="128" height="10" rx="5" fill="#141518"/>
    <g id="${p}-slot-glow" opacity="${opts.slotLit ? 1 : 0}"><rect x="40" y="95" width="140" height="20" rx="10" fill="rgba(92,192,224,0.35)"/><rect x="46" y="100" width="128" height="10" rx="5" fill="none" stroke="#5cc0e0" stroke-width="3"/></g>` +
    txt(110, 132, "CALLDATA", { size: 10, mono: true, weight: 800, anchor: "middle", fill: darken(body.s, 0.35), extra: `letter-spacing="2"` });
  // vents + output slot
  for (let i = 0; i < 7; i++) fp += `<rect x="${24 + i * 12}" y="142" width="6" height="22" rx="3" fill="${darken(body.s, 0.18)}"/>`;
  fp += `<rect x="128" y="144" width="64" height="16" rx="3" fill="#141518" stroke="#5a5e65" stroke-width="1.4"/>`;
  s += G_(matStr(mF), fp);
  // output chute
  s += wedge(o, 18, 82, v1, v1 + 34, zb, zT - 160, M.chrome, "+v", zb + 4, 1.4);
  // −u face: band + porthole with gears
  const mU = frameU(o, u0, v0, zT);
  s += G_(matStr(mU), `<rect x="14" y="8" width="${D - 28}" height="8" fill="${accent}"/>
    <circle cx="100" cy="86" r="48" fill="#c9cdd2" stroke="#5a5e65" stroke-width="2"/><circle cx="100" cy="86" r="40" fill="#1f2a30" stroke="#3b3e44" stroke-width="2"/>` +
    Array.from({ length: 8 }, (_, k) => { const a = k * 45 * DEG; return `<circle cx="${f(100 + 44 * Math.cos(a))}" cy="${f(86 + 44 * Math.sin(a))}" r="2.2" fill="#7d828a"/>`; }).join("") +
    `<rect x="70" y="146" width="60" height="16" rx="3" fill="#d9dcdf" stroke="#7d828a" stroke-width="1"/>` + txt(100, 158, "EVM", { size: 11, mono: true, anchor: "middle", fill: "#3b3e44", weight: 800 }));
  const cw = applyM(mU, 100, 86);
  const clipW = `<circle cx="100" cy="86" r="39" transform="${matStr(mU)}"/>`;
  s += `<defs><clipPath id="${p}-wc">${clipW}</clipPath></defs><g clip-path="url(#${p}-wc)">` +
    rotator(p + "-gear-2", mU, 100, 86, 0, gear(100, 86, 24, 8, 6).replaceAll(GC.fill, lighten(GC.fill, 0.1)), `data-ratio="2"`) +
    rotator(p + "-gear-3", mU, 132, 118, 0, gear(132, 118, 15, 5, 6), `data-ratio="${-2 * 8 / 5}"`) +
    `</g>` + G_(matStr(mU), `<circle cx="100" cy="86" r="39" fill="rgba(208,234,244,0.18)"/><path d="M72 70A34 34 0 0 1 96 54" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`);
  // pipe from the −u face toward −v
  let pipeEnd = null;
  if (opts.pipe) {
    const L = opts.pipe, pz = opts.pipeZ ?? 64, pv = -40;
    const path = [[u0 - 2, pv, pz], [u0 - 44, pv, pz], [u0 - 44, pv - L, pz]];
    s += "<!--pipe-legs-->";
    s += line3(o, path, "#2b2d31", 28) + line3(o, path, atk ? "#c9463c" : "#9aa0a8", 21) + line3(o, path.map(([a, b, c]) => [a, b, c + 6]), "#e6e8ea", 5);
    const ring = (q, r) => { const c = at(o, ...q); return `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${r}" ry="${f(r * 1.05)}" fill="#c3c8ce" stroke="#2b2d31" stroke-width="1.8"/><ellipse cx="${f(c[0] - 2)}" cy="${f(c[1] - 3)}" rx="${f(r * 0.35)}" ry="${f(r * 0.2)}" fill="#f4f5f6"/>`; };
    // floor stands under the run (drawn first so the tube sits on them)
    let legs = "";
    for (const q of [[u0 - 44, pv, 0], ...Array.from({ length: Math.floor(L / 90) }, (_, k) => [u0 - 44, pv - (k + 1) * 90, 0])]) {
      legs += box(o, q[0] - 6, q[0] + 6, q[1] - 6, q[1] + 6, 0, pz - 12, M.steel, 1.2) + box(o, q[0] - 14, q[0] + 14, q[1] - 12, q[1] + 12, 0, 5, M.ink, 1);
    }
    s = s.replace("<!--pipe-legs-->", legs);
    for (let k = 1; k * 70 < L; k++) s += ring([u0 - 44, pv - k * 70, pz], 15);
    s += ring(path[1], 17) + ring(path[0], 18) + ring(path[2], 19);
    pipeEnd = at(o, ...path[2]);
  }
  const anchors = {
    top: at(o, 0, vg, gz + r0 + 70), center: at(o, 0, 0, 100), ground: at(o), front: at(o, 0, v1, 100),
    slot: applyM(mF, 110, 105), out: at(o, 50, v1 + 34, 14), plate: applyM(mF, 24 + pw / 2, 54), porthole: cw,
    pipeEnd, gears: [0, 1, 2, 3].map((i) => `${p}-gear-${i}`), led: p + "-led", screenM: mF,
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [[u0, u1, v0, v1, 0, zT], [-100, 100, -46, 6, zT, zH], [g0u - r0 - gh, g1u + r1 + gh, vg - 8, vg, zH, gz + r0 + gh]], center: anchors.center, glowR: 210 }),
    anchors,
  };
}

// =====================================================================================
// 字节格块 byteBlock — 按字节数定长的彩色条块，每格一道刻槽
// origin = 条块左端（−u 端）中心的地面点；opts: bytes=20, color="teal"|"green"|"ink"|"gray"|"red"|"#hex",
//   cell=10（每字节宽，和 slotCabinet 一致）, depth=24, h=14, z=0（离地高度）, over=0（末尾几格画成红色"溢出"，在 ID-over 组里）, text（顶面小字）
// anchors: top, center, ground, left, right, len
// =====================================================================================
const BYTEC = { teal: TEAL, green: M.green, ink: M.ink, gray: { f: "#c9cdd2", s: "#aab0b7", t: "#e1e4e7", st: "#6e747c" }, red: M.red };
function blockSvg(o, du, dv, z, bytes, color, cell, dep, h, extra = {}) {
  const m = BYTEC[color] ?? mat(color);
  const L = bytes * cell, a = du, b = du + L, c0 = dv - dep / 2, c1 = dv + dep / 2;
  let s = box(o, a, b, c0, c1, z, z + h, m, 1.3);
  let d = "";
  for (let k = 1; k < bytes; k++) { const x = a + k * cell; d += `M${P(at(o, x, c0, z + h))}L${P(at(o, x, c1, z + h))}L${P(at(o, x, c1, z))}`; }
  if (d) s += `<path d="${d}" fill="none" stroke="${m.st}" stroke-width="1" opacity="0.45"/>`;
  s += `<path d="M${P(at(o, a + 2, c0 + 3, z + h))}L${P(at(o, b - 2, c0 + 3, z + h))}" stroke="#ffffff" stroke-width="1.6" opacity="0.5"/>`;
  if (extra.over) {
    const ou = b - extra.over * cell;
    s += `<g id="${extra.overId}">${box(o, ou, b, c0 - 0.5, c1 + 0.5, z - 0.5, z + h + 0.5, M.red, 1.6)}</g>`;
  }
  if (extra.text) s += G_(faceTop(o, a + 4, dv, z + h), txt(0, 4, extra.text, { size: Math.min(12, dep * 0.5), mono: true, weight: 800, fill: color === "ink" ? "#ffffff" : "#1c1c1c" }));
  return s;
}
export function byteBlock(o, opts = {}) {
  const p = opts.id ?? "bb", bytes = opts.bytes ?? 20, cell = opts.cell ?? 10, dep = opts.depth ?? 24, h = opts.h ?? 14, z = opts.z ?? 0;
  const color = isAtk(opts) ? "red" : opts.color ?? "teal", L = bytes * cell;
  let s = z < 4 ? contactShadow(o, L * 0.55 + 20, dep + 14, L / 2, 0) : "";
  s += blockSvg(o, 0, 0, z, bytes, color, cell, dep, h, { over: opts.over ?? 0, overId: p + "-over", text: opts.text });
  const anchors = { top: at(o, L / 2, 0, z + h + 34), center: at(o, L / 2, 0, z + h / 2), ground: at(o, L / 2, 0, 0), left: at(o, 0, 0, z + h / 2), right: at(o, L, 0, z + h / 2), len: L };
  return { svg: shell(p, o, opts, { solid: s, wire: [[0, L, -dep / 2, dep / 2, z, z + h]], center: anchors.center, badgeR: 18, glowR: L * 0.6 + 30, glowAt: { u: o.u + L / 2, v: o.v } }), anchors };
}

// =====================================================================================
// 存储抽屉柜 slotCabinet — 竖立钢制档案柜，一列 n 个抽屉（0 号在最下），顶部铭牌 "Storage"
// opts: n=6, cell=10（每字节格宽，柜宽 = 32·cell + 64）, dh=58（抽屉高）, labels=["0","1",…], title="Storage",
//   open={i: 距离 | true}（初始拉出，true = maxOut）, maxOut=104, fill={i:[{bytes,color,at?,over?,text?}]}（抽屉里的字节块）,
//   tags={i:"private"}（抽屉面贴纸）, glass=false（玻璃罩，ID-glass）
// 可动：ID-d{i}（抽屉，KITX.drawer 沿 +v 拉出/推回）、ID-hl-{i}（抽屉面描边，KITX.mark）、ID-fill-{i}（格块组）、
//       ID-flash-{i}（红闪，KITX.clearDrawer 清空）、ID-blk-{i}-{j}（单个格块）、ID-glass（玻璃罩）
// anchors: top, center, ground, header, drawers[i]（关着时抽屉面中心）, drawersOpen[i]（全开时）, cells[i]（全开时 0 号格中心）,
//          cellStep（每格屏幕位移）, openVec（每拉出 1 单位的屏幕位移）, maxOut
// 另导出 cabinetCell(o, opts, i, k, s) → 世界 {u, v, z}：把 byteBlock 放进 i 号抽屉第 k 格（抽屉拉出 s）用
// =====================================================================================
function cabGeom(opts = {}) {
  const n = opts.n ?? 6, cell = opts.cell ?? 10, dh = opts.dh ?? 58;
  const W = 32 * cell + 64, D = 150, u0 = -W / 2, u1 = W / 2, v0 = -D / 2, v1 = D / 2, zb = 16, zTop = zb + n * dh, zH = zTop + 64, stile = 14;
  const a = u0 + stile + 2, b = u1 - stile - 2, Dd = 132, maxOut = opts.maxOut ?? 104;
  const cellD = 30, cv1 = v1 - 12, cv0 = cv1 - cellD, cu0 = a + (b - a - 32 * cell) / 2;
  return { n, cell, dh, W, D, u0, u1, v0, v1, zb, zTop, zH, stile, a, b, Dd, maxOut, cellD, cv0, cv1, cu0, tz: (i) => zb + (i + 1) * dh - 10 };
}
export function cabinetCell(o, opts, i, k = 0, s) {
  const g = cabGeom(opts); s = s ?? g.maxOut;
  return { u: o.u + g.cu0 + k * g.cell, v: o.v + (g.cv0 + g.cv1) / 2 + s, z: g.tz(i) };
}
export function slotCabinet(o, opts = {}) {
  const p = opts.id ?? "cab", atk = isAtk(opts), g = cabGeom(opts);
  const { n, cell, dh, W, D, u0, u1, v0, v1, zb, zTop, zH, stile, a, b, Dd, maxOut, cv0, cv1, cu0 } = g;
  const body = atk ? mat("#c9463c") : { f: "#9aa1a9", s: "#7c838c", t: "#b4bac1", st: "#3f454c" };
  const front = atk ? mat("#e06a60", { st: "#8f2620" }) : { f: "#dfe3e7", s: "#c9ced4", t: "#eceef1", st: "#5d636b" };
  let s = contactShadow(o, W * 0.62, 125);
  s += box(o, u0 - 6, u1 + 6, v0 - 6, v1 + 6, 0, zb, M.ink, 1.4);
  s += box(o, u0, u1, v0, v1, zb, zTop, body, 2);
  // drawer cavities on the front face
  s += G_(faceV(o, u0, v1, zTop), Array.from({ length: n }, (_, i) => `<rect x="${stile}" y="${(n - 1 - i) * dh + 1}" width="${W - 2 * stile}" height="${dh - 2}" fill="#1d2024"/>`).join(""));
  const sideFace = `<polygon points="${pts([at(o, u0, v0, zb), at(o, u0, v1, zb), at(o, u0, v1, zTop), at(o, u0, v0, zTop)])}" fill="${body.f}" stroke="${body.st}" stroke-width="2" stroke-linejoin="round"/>` +
    G_(faceU(o, u0, v0, zTop), Array.from({ length: n }, (_, i) => `<rect x="14" y="${i * dh + 10}" width="${D - 28}" height="${dh - 20}" rx="4" fill="none" stroke="${darken(body.f, 0.12)}" stroke-width="2"/><circle cx="${D / 2}" cy="${i * dh + dh / 2}" r="3" fill="${lighten(body.f, 0.25)}"/>`).join(""));
  const stileFace = `<polygon points="${pts([at(o, u0, v1, zb), at(o, u0 + stile, v1, zb), at(o, u0 + stile, v1, zTop), at(o, u0, v1, zTop)])}" fill="${body.s}" stroke="${body.st}" stroke-width="2" stroke-linejoin="round"/>`;
  // drawers bottom → top (upper drawers overlap lower ones when pulled out)
  const fills = opts.fill ?? {}, tags = opts.tags ?? {}, open = opts.open ?? {};
  const red = "#e0453a";
  for (let i = 0; i < n; i++) {
    const dz0 = zb + i * dh, dz1 = dz0 + dh, tz = g.tz(i), vb = v1 - Dd;
    let d = "";
    // tray: −u wall, rim, floor
    d += `<polygon points="${pts([at(o, a, vb, dz0 + 4), at(o, a, v1, dz0 + 4), at(o, a, v1, tz), at(o, a, vb, tz)])}" fill="${front.s}" stroke="${front.st}" stroke-width="1.2" stroke-linejoin="round"/>`;
    d += flat(o, [[a, vb], [b, vb], [b, v1], [a, v1]], tz, front.t, front.st, 1.2);
    d += flat(o, [[a + 5, vb + 5], [b - 5, vb + 5], [b - 5, v1 - 5], [a + 5, v1 - 5]], tz, "#b9bfc6", "none");
    d += line3(o, [[a + 5, v1 - 5, tz], [a + 5, vb + 5, tz], [b - 5, vb + 5, tz]], "#8d949c", 2.5);
    // 32 byte cells
    let cells = `<rect x="-3" y="-3" width="${32 * cell + 6}" height="${cv1 - cv0 + 6}" rx="3" fill="#f6f7f8" stroke="#8d949c" stroke-width="1.2"/>`;
    for (let k = 0; k < 32; k++) cells += `<rect x="${f(k * cell + 0.8)}" y="0" width="${f(cell - 1.6)}" height="${cv1 - cv0}" rx="1.6" fill="#eef0f2" stroke="#b3b9c0" stroke-width="0.8"/><circle cx="${f(k * cell + cell / 2)}" cy="${(cv1 - cv0) / 2}" r="${f(cell * 0.17)}" fill="#a3aab2"/>`;
    for (let k = 8; k < 32; k += 8) cells += `<path d="M${k * cell} -3V${cv1 - cv0 + 3}" stroke="#6e757d" stroke-width="1.6"/>`;
    d += G_(faceTop(o, cu0, cv0, tz), cells);
    // byte blocks
    let fb = "", ck = 0;
    (fills[i] ?? []).forEach((B, j) => {
      const k = B.at ?? ck; ck = k + B.bytes;
      fb += `<g id="${p}-blk-${i}-${j}">${blockSvg(o, cu0 + k * cell, (cv0 + cv1) / 2, tz, B.bytes, B.color ?? "teal", cell, cv1 - cv0 - 8, 10, { over: B.over, overId: `${p}-blk-${i}-${j}-over`, text: B.text })}</g>`;
    });
    d += `<g id="${p}-fill-${i}">${fb}</g>`;
    d += `<g id="${p}-flash-${i}" opacity="0">${flat(o, [[cu0 - 3, cv0 - 3], [cu0 + 32 * cell + 3, cv0 - 3], [cu0 + 32 * cell + 3, cv1 + 3], [cu0 - 3, cv1 + 3]], tz + 11, "rgba(224,69,58,0.55)", red, 3)}</g>`;
    // front panel
    d += box(o, a, b, v1, v1 + 6, dz0 + 1, dz1 - 1, front, 1.4);
    const Wf = b - a, Hf = dh - 2, lab = (opts.labels ?? [])[i] ?? String(i);
    const lw = Math.max(54, tw(lab, 22, true) + 18);
    let fp = `<rect x="16" y="${Hf / 2 - 16}" width="${f(lw)}" height="32" rx="3" fill="#fffdf8" stroke="#5d636b" stroke-width="1.8"/>` +
      `<rect x="13" y="${Hf / 2 - 19}" width="${f(lw + 6)}" height="5" rx="2" fill="#9aa0a8"/>` +
      txt(16 + lw / 2, Hf / 2 + 8, lab, { size: 22, mono: true, weight: 800, anchor: "middle" });
    const hx = Wf / 2 + 10;
    fp += `<rect x="${hx - 60}" y="${Hf / 2 - 9}" width="120" height="18" rx="4" fill="#5d636b"/>
      <rect x="${hx - 52}" y="${Hf / 2 - 5}" width="104" height="11" rx="5.5" fill="url(#${p}-hg)" stroke="#3b3e44" stroke-width="1.2"/>`;
    fp += `<circle cx="${Wf - 26}" cy="${Hf / 2}" r="5" fill="#3b3e44"/><rect x="${Wf - 27}" y="${Hf / 2 - 1}" width="2" height="6" fill="#c9cdd2"/>`;
    if (tags[i]) {
      const tg = tags[i], tws = tw(tg, 14, true) + 34;
      fp += `<g transform="translate(${f(Wf - 52 - tws)},${Hf / 2 - 13}) rotate(-4)"><rect x="0" y="0" width="${f(tws)}" height="26" rx="4" fill="#ffffff" stroke="#1c1c1c" stroke-width="1.8"/>
        <rect x="8" y="11" width="12" height="10" rx="2" fill="#1c1c1c"/><path d="M10.5 11V8A3.5 3.5 0 0 1 17.5 8V11" fill="none" stroke="#1c1c1c" stroke-width="2"/>` +
        txt(26, 18, tg, { size: 14, mono: true, weight: 800 }) + `</g>`;
    }
    fp += `<rect id="${p}-hl-${i}" x="1.5" y="1.5" width="${Wf - 3}" height="${Hf - 3}" rx="3" fill="none" stroke="#2aa3c9" stroke-width="5" opacity="0"/>`;
    d += G_(faceV(o, a, v1 + 6, dz1 - 1), fp);
    const s0 = open[i] === true ? maxOut : open[i] ?? 0;
    s += `<g id="${p}-d${i}" data-s="${s0}" data-max="${maxOut}" transform="translate(${f(s0 * V[0])},${f(s0 * V[1])})">${d}</g>`;
  }
  // occluders redrawn over the drawer interiors that run inside the carcass
  s += sideFace + stileFace;
  s += box(o, u0, u1, v0, v1, zTop, zH, body, 2);
  s += box(o, u0 - 6, u1 + 6, v0 - 6, v1 + 6, zH, zH + 8, { ...body, t: lighten(body.t, 0.08) }, 1.6);
  const title = opts.title ?? "Storage", ttw = tw(title, 26) + 40;
  s += G_(faceV(o, u0, v1, zH), `<rect x="${W / 2 - ttw / 2}" y="12" width="${f(ttw)}" height="40" rx="6" fill="${atk ? "#a8322a" : "#1d93ba"}" stroke="${atk ? "#7a1d17" : "#155e77"}" stroke-width="1.6"/>` +
    txt(W / 2, 41, title, { size: 26, anchor: "middle", fill: "#ffffff", weight: 900, extra: `font-family="Inter, Noto Sans SC, sans-serif"` }) +
    [[16, 16], [W - 16, 16], [16, 48], [W - 16, 48]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${lighten(body.s, 0.3)}"/>`).join(""));
  s += G_(faceU(o, u0, v0, zH), `<rect x="16" y="14" width="${D - 32}" height="36" rx="4" fill="none" stroke="${darken(body.f, 0.12)}" stroke-width="2"/>`);
  s = chromeGrad(p + "-hg") + s;
  // glass case
  const gu0 = u0 - 12, gu1 = u1 + 12, gv0 = v0 - 12, gv1 = v1 + 26, gz = zH + 22;
  const gl = `<polygon points="${pts([at(o, gu0, gv0, 0), at(o, gu0, gv1, 0), at(o, gu0, gv1, gz), at(o, gu0, gv0, gz)])}" fill="rgba(208,234,244,0.22)"/>
    <polygon points="${pts([at(o, gu0, gv1, 0), at(o, gu1, gv1, 0), at(o, gu1, gv1, gz), at(o, gu0, gv1, gz)])}" fill="rgba(190,224,237,0.26)"/>
    <polygon points="${pts([at(o, gu0, gv0, gz), at(o, gu1, gv0, gz), at(o, gu1, gv1, gz), at(o, gu0, gv1, gz)])}" fill="rgba(236,248,252,0.35)"/>
    <path d="M${P(at(o, gu1, gv0, gz))}L${P(at(o, gu1, gv0, 0))}" stroke="rgba(42,163,201,0.45)" stroke-width="2"/>
    <path d="${polyD([at(o, gu0, gv0, gz), at(o, gu1, gv0, gz), at(o, gu1, gv1, gz), at(o, gu0, gv1, gz)])}M${P(at(o, gu0, gv0, gz))}L${P(at(o, gu0, gv0, 0))}L${P(at(o, gu0, gv1, 0))}L${P(at(o, gu1, gv1, 0))}L${P(at(o, gu1, gv1, gz))}M${P(at(o, gu0, gv1, 0))}L${P(at(o, gu0, gv1, gz))}" fill="none" stroke="rgba(42,163,201,0.85)" stroke-width="3" stroke-linejoin="round"/>
    <path d="M${P(at(o, gu0 + 30, gv1, gz - 40))}L${P(at(o, gu0 + 90, gv1, gz - 100))}M${P(at(o, gu0 + 40, gv1, gz - 90))}L${P(at(o, gu0 + 70, gv1, gz - 120))}" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.7"/>`;
  s += `<g id="${p}-glass" opacity="${opts.glass ? 1 : 0}">${gl}</g>`;
  const mid = (i) => zb + i * dh + dh / 2;
  const anchors = {
    top: at(o, 0, 0, zH + 60), center: at(o, 0, 0, zTop / 2), ground: at(o), header: at(o, 0, v1, zH - 32),
    drawers: Array.from({ length: n }, (_, i) => at(o, 0, v1 + 6, mid(i))),
    drawersOpen: Array.from({ length: n }, (_, i) => at(o, 0, v1 + 6 + maxOut, mid(i))),
    drawerLabels: Array.from({ length: n }, (_, i) => at(o, a + 16, v1 + 6, mid(i))),
    cells: Array.from({ length: n }, (_, i) => at(o, cu0 + cell / 2, (cv0 + cv1) / 2 + maxOut, g.tz(i))),
    cellStep: [f(cell * U[0]), f(cell * U[1])], openVec: [f4(V[0]), f4(V[1])], maxOut,
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0, u1, v0, v1, 0, zH + 8]], center: anchors.center, glowR: W * 0.75 }), anchors };
}

// =====================================================================================
// 哈希漏斗 hashFunnel — 绞肉机样的小机器：顶部金属漏斗、−u 侧摇柄、正面出料孔板 + 斜槽
// opts: inputs=["键 k","槽 3"]（上方两张输入卡）, output="哈希位置"（吐出的卡）, text="keccak256"（正面铭牌）, done=false（输出卡初始可见）
// 可动：ID-in-0 / ID-in-1（输入卡，KITX.hash 落入漏斗）、ID-crank（摇柄）、ID-out（输出卡，从孔板飞出）、ID-led
// anchors: top, center, ground, hopper（漏斗口）, port（出料孔）, out（输出卡中心）, inputs[]（两张输入卡中心）, crank
// =====================================================================================
export function hashFunnel(o, opts = {}) {
  const p = opts.id ?? "hf", atk = isAtk(opts);
  const bodyM = atk ? mat("#d65248", { st: "#8f2620" }) : { f: "#d4d7db", s: "#b5b9bf", t: "#eceef0", st: "#6e747c" };
  const hopM = atk ? mat("#e06a60", { st: "#8f2620" }) : { f: "#c3c8ce", s: "#a3a9b1", t: "#dde0e4", st: "#5a6068" };
  const band = atk ? M.red : TEAL;
  const hv = -4, zc = 120, zh0 = 132, zh1 = 206, rh0 = 34, rh1 = 84;
  const rAt = (z) => rh0 + ((rh1 - rh0) * (z - zh0)) / (zh1 - zh0);
  let s = contactShadow(o, 140, 110);
  s += rbox(o, -86, 86, -76, 76, 0, 12, 8, M.ink, { sw: 1.4 });
  s += rbox(o, -70, 70, -62, 62, 12, zc, 12, bodyM, { sw: 2 });
  s += G_(faceTop(o, -58, -50, zc), `<rect x="0" y="0" width="116" height="100" rx="8" fill="none" stroke="${darken(bodyM.t, 0.12)}" stroke-width="2"/>`);
  s += cyl(o, 0, hv, 38, zc, zh0, M.steel, { sw: 1.4 });
  s += frustum(o, 0, hv, rh0, rAt(168), zh0, 168, hopM, { sw: 1.8, top: false });
  s += frustum(o, 0, hv, rAt(168), rAt(180), 168, 180, band, { sw: 1.6, top: false });
  s += frustum(o, 0, hv, rAt(180), rh1, 180, zh1, hopM, { sw: 1.8, top: false });
  // hopper mouth: dark interior + inner hole + rim
  const rim = circlePlan(0, hv, rh1, 48).map((q) => at(o, q[0], q[1], zh1));
  s += `<defs><clipPath id="${p}-mc"><polygon points="${pts(rim)}"/></clipPath></defs>`;
  s += `<polygon points="${pts(rim)}" fill="#3b3f45"/>`;
  s += `<g clip-path="url(#${p}-mc)"><polygon points="${pts(circlePlan(-14, hv + 14, rh1 - 6, 40).map((q) => at(o, q[0], q[1], zh1)))}" fill="#5a5e65"/>${flat(o, circlePlan(0, hv, rh0 - 4, 32), zh0 + 6, "#141518")}
    ${gearRing(o, hv, zh0 + 8)}</g>`;
  s += `<polygon points="${pts(rim)}" fill="none" stroke="#8d939b" stroke-width="7" stroke-linejoin="round"/><polygon points="${pts(rim)}" fill="none" stroke="#eceef0" stroke-width="2.4" stroke-linejoin="round"/>`;
  // front face (+v)
  const mF = frameV(o, -70, 62, zc), ttl = opts.text ?? "keccak256", tww = tw(ttl, 14, true) + 22;
  let fp = `<rect x="${70 - tww / 2}" y="10" width="${f(tww)}" height="24" rx="4" fill="${atk ? "#a8322a" : "#1d93ba"}"/>` + txt(70, 27, ttl, { size: 14, mono: true, anchor: "middle", fill: "#ffffff", weight: 800 });
  fp += `<circle cx="72" cy="66" r="31" fill="rgba(0,0,0,0.25)"/><circle cx="70" cy="64" r="31" fill="#4b4f56" stroke="#1d1f23" stroke-width="2"/>
    <circle cx="70" cy="64" r="24" fill="url(#${p}-dg)" stroke="#5a5e65" stroke-width="1.5"/>`;
  for (let k = 0; k < 7; k++) { const a = k * 60 * DEG, r = k === 6 ? 0 : 12; fp += `<circle cx="${f(70 + r * Math.cos(a))}" cy="${f(64 + r * Math.sin(a))}" r="3.6" fill="#1d1f23"/>`; }
  fp += [[16, 46], [124, 46], [16, 96], [124, 96]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${darken(bodyM.s, 0.2)}"/>`).join("");
  fp += ledSvg(p + "-led", 120, 20, 4.5, "off");
  s += `<defs><radialGradient id="${p}-dg" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#f4f5f6"/><stop offset="0.6" stop-color="#b9bdc3"/><stop offset="1" stop-color="#7d828a"/></radialGradient></defs>` + G_(matStr(mF), fp);
  s += wedge(o, -32, 32, 62, 106, 12, 30, M.steelLight, "+v", 16, 1.4);
  // −u face: boss + crank
  const mU = frameU(o, -70, -62, zc);
  s += G_(matStr(mU), `<circle cx="62" cy="40" r="18" fill="#4b4f56" stroke="#1d1f23" stroke-width="2"/><circle cx="62" cy="40" r="10" fill="#9aa0a8"/>`);
  const mC = frameU(o, -80, -62, zc);
  const crank = `<rect x="56" y="-18" width="12" height="62" rx="6" fill="#7d828a" stroke="#2b2d31" stroke-width="1.6"/><rect x="58" y="-16" width="4" height="56" rx="2" fill="#d4d7db"/>
    <circle cx="62" cy="-14" r="11" fill="${M.wood.f}" stroke="${M.wood.st}" stroke-width="1.8"/><circle cx="59" cy="-17" r="3.5" fill="${M.wood.t}"/><circle cx="62" cy="40" r="7" fill="#5a5e65" stroke="#2b2d31" stroke-width="1.4"/>`;
  s += `<use href="#${p}-crank" transform="translate(${f(5 * U[0])},${f(5 * U[1])})" style="filter:brightness(0.6)"/>` + rotator(p + "-crank", mC, 62, 40, 0, crank);
  // input cards (clipped to stay above the hopper's front rim)
  const card = (w, h, label) => `<rect x="0" y="0" width="${w}" height="${h}" rx="5" fill="#fffdf8" stroke="#2aa3c9" stroke-width="2.6"/><rect x="5" y="5" width="${w - 10}" height="4" rx="2" fill="#bfe3ef"/>` +
    txt(w / 2, h / 2 + 9, label, { size: Math.min(22, (w - 12) / Math.max(1, tw(label, 1, true))), mono: true, weight: 800, anchor: "middle" });
  const ins = opts.inputs ?? ["键 k", "槽 3"];
  const cardW = (l) => Math.max(66, tw(l, 22, true) + 22);
  let lx = 0; const wsum = ins.reduce((a, l) => a + cardW(l), 0) + 14 * (ins.length - 1);
  // clip: everything above the front half of the rim
  const front = rim.slice().sort((A, B) => A[0] - B[0]);
  const xl = front[0], xr = front[front.length - 1];
  const lower = rim.filter((q) => q[1] >= xl[1] + (xr[1] - xl[1]) * ((q[0] - xl[0]) / (xr[0] - xl[0]))).sort((A, B) => A[0] - B[0]);
  const clipC = [[xl[0] - 400, xl[1]], xl, ...lower, xr, [xr[0] + 400, xr[1]], [xr[0] + 400, xr[1] - 900], [xl[0] - 400, xl[1] - 900]];
  let cs = "", inputs = [];
  ins.forEach((l, k) => {
    const w = cardW(l), h = 50, mI = frameV(o, -wsum / 2 + lx, hv, 296 + (k % 2) * 14);
    cs += `<g id="${p}-in-${k}" data-dy="${f(118 * CE)}" opacity="${opts.done ? 0 : 1}"><g transform="translate(${f(-4 * V[0])},${f(-4 * V[1])})">${G_(matStr(mI), `<rect x="0" y="0" width="${w}" height="${h}" rx="5" fill="#9fc9d8"/>`)}</g>${G_(matStr(mI), card(w, h, l))}</g>`;
    inputs.push(applyM(mI, w / 2, h / 2)); lx += w + 14;
  });
  s += `<defs><clipPath id="${p}-cc"><polygon points="${pts(clipC)}"/></clipPath></defs><g clip-path="url(#${p}-cc)">${cs}</g>`;
  // output card
  const outL = opts.output ?? "哈希位置", ow = Math.max(110, tw(outL, 22) + 30), oh = 54;
  const mO = frameV(o, -10, 128, 92);
  const port = applyM(mF, 70, 64), oc = applyM(mO, ow / 2, oh / 2);
  const outCard = `<rect x="0" y="0" width="${f(ow)}" height="${oh}" rx="6" fill="#fffdf8" stroke="#1d93ba" stroke-width="3"/><rect x="0" y="0" width="12" height="${oh}" rx="4" fill="#1d93ba"/>` +
    txt(ow / 2 + 6, oh / 2 + 8, outL, { size: 22, anchor: "middle", weight: 900 });
  s += `<g id="${p}-out" data-dx="${f(port[0] - oc[0])}" data-dy="${f(port[1] - oc[1])}" opacity="${opts.done ? 1 : 0}"><g transform="translate(${f(-4 * V[0])},${f(-4 * V[1])})">${G_(matStr(mO), `<rect x="0" y="0" width="${f(ow)}" height="${oh}" rx="6" fill="#8fbfd0"/>`)}</g>${G_(matStr(mO), outCard)}</g>`;
  const anchors = { top: at(o, 0, hv, 380), center: at(o, 0, 0, 80), ground: at(o), hopper: at(o, 0, hv, zh1), port, out: oc, inputs, crank: applyM(mC, 62, 40) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-70, 70, -62, 62, 0, zc], { cyl: [0, hv, rh1, zh0, zh1] }, [-32, 32, 62, 106, 0, 30]], center: anchors.center, glowR: 160 }), anchors };
}
/** auger blades glimpsed inside the hopper */
function gearRing(o, hv, z) {
  let d = "";
  for (let k = 0; k < 3; k++) { const a = (k * 120) * DEG; d += `M${P(at(o, 0, hv, z))}L${P(at(o, 26 * Math.cos(a), hv + 26 * Math.sin(a), z + 10))}`; }
  return `<path d="${d}" stroke="#8d939b" stroke-width="5" stroke-linecap="round"/>`;
}

// =====================================================================================
// 规程手册 manual — 厚蓝皮活页手册，平放；左侧（−u）是活页脊，封面绕书脊翻开
// opts: title="B 的代码", sub="规程手册", open=0（封面角度°，0 合上，180 摊平）, pageTitle, pageText（内页大字，如"清空 0 号抽屉"）
// 可动：ID-cover（封面，KITX.book 翻开/合上，真 3D 绕书脊转）、ID-page（第一页内容组）
// anchors: top, center, ground, page（内页中心）, title（封面标签中心，合上时）, hinge
// =====================================================================================
const coverState = (o, u0, v0, zP, a, T) => {
  const [hx, hy] = at(o, u0, v0, zP), r = a * DEG, c = Math.cos(r), sn = Math.sin(r);
  const m = [c * U[0], c * U[1] - sn * CE, V[0], V[1], hx, hy];
  const th = [sn * U[0] * T, (sn * U[1] + c * CE) * T];
  return { m, th, outVis: 0.574 * sn + 0.578 * c > 0, hx, hy };
};
export function manual(o, opts = {}) {
  const p = opts.id ?? "book", atk = isAtk(opts);
  const cov = atk ? mat("#d65248", { st: "#8f2620" }) : { f: "#2f8fb8", s: "#23759a", t: "#3fa6d0", st: "#164f69" };
  const Wc = 210, Dc = 160, u0 = -Wc / 2, v0 = -Dc / 2, v1 = Dc / 2, T = 5, zP = 32;
  let s = contactShadow(o, 160, 115);
  s += box(o, u0, u0 + Wc, v0, v1, 0, T, cov, 1.6);
  s += box(o, u0 + 8, u0 + Wc - 5, v0 + 5, v1 - 5, T, zP, M.paper, 1.4);
  // page edges on +v face and the free (+u) end is hidden; draw page lines on the +v face
  s += G_(faceV(o, u0 + 8, v1 - 5, zP), Array.from({ length: 8 }, (_, k) => `<path d="M2 ${3 + k * 3.2}H${Wc - 15}" stroke="#d6cfc1" stroke-width="1"/>`).join(""));
  // divider tabs sticking out of the +v edge
  [["#2aa3c9", 40, 12], ["#1f9d55", 92, 18], ["#e0453a", 144, 24]].forEach(([c, x, z]) => { s += box(o, u0 + x, u0 + x + 26, v1 - 5, v1 + 5, z, z + 3, mat(c), 1); });
  // first page
  const mP = frameTop(o, u0 + 8, v0 + 5, zP);
  const pw = Wc - 13, ph = Dc - 10;
  let pg = `<rect x="0" y="0" width="${pw}" height="${ph}" fill="#fffdf8"/><path d="M22 0V${ph}" stroke="#f0b9b3" stroke-width="1.4"/>`;
  for (const yy of [16, 52, 106]) pg += `<circle cx="10" cy="${yy}" r="3.6" fill="#e3ddd1" stroke="#b8b0a1" stroke-width="1"/>`;
  for (let k = 0; k < 8; k++) pg += `<path d="M30 ${44 + k * 13}H${pw - 12}" stroke="#e3ddd1" stroke-width="1.2"/>`;
  pg += txt(32, 26, opts.pageTitle ?? "§ 规程", { size: 15, weight: 800, fill: "#1f7896" });
  if (opts.pageText) pg += txt(32, 66, opts.pageText, { size: Math.min(24, (pw - 44) / Math.max(1, tw(opts.pageText, 1))), weight: 900 });
  else pg += [0, 1, 2, 3].map((k) => `<rect x="32" y="${50 + k * 26}" width="${[120, 96, 140, 80][k]}" height="7" rx="3.5" fill="#cfc7b8"/>`).join("");
  s += `<g id="${p}-page">${G_(matStr(mP), pg)}</g>`;
  // ring-binder spine on the −u side
  s += rbox(o, u0 - 10, u0 + 10, v0, v1, 0, zP + T, 8, cov, { sw: 1.6 });
  s += G_(faceU(o, u0 - 10, v0, zP + T - 6), [30, 80, 130].map((x) => `<rect x="${x - 9}" y="4" width="18" height="${zP - 8}" rx="6" fill="#c9cdd2" stroke="#5a5e65" stroke-width="1.4"/><rect x="${x - 5}" y="6" width="5" height="${zP - 12}" rx="2" fill="#f4f5f6"/>`).join(""));
  // cover
  const a0 = opts.open ?? 0, cs = coverState(o, u0, v0, zP, a0, T);
  const ttl = opts.title ?? "B 的代码", sub = opts.sub ?? "规程手册";
  const lw = Math.max(120, tw(ttl, 28) + 36);
  const outer = `<rect x="0" y="0" width="${Wc}" height="${Dc}" rx="6" fill="${cov.t}" stroke="${cov.st}" stroke-width="2"/>
    <rect x="0" y="0" width="22" height="${Dc}" rx="4" fill="${cov.f}"/><path d="M22 0V${Dc}" stroke="${cov.st}" stroke-width="1.4"/>
    ${[30, 80, 130].map((y) => `<circle cx="11" cy="${y}" r="4" fill="#d4d7db" stroke="#5a5e65" stroke-width="1.2"/>`).join("")}
    <rect x="30" y="8" width="${Wc - 38}" height="${Dc - 16}" rx="4" fill="none" stroke="${lighten(cov.t, 0.35)}" stroke-width="2"/>
    <rect x="${(Wc + 22) / 2 - lw / 2}" y="${Dc / 2 - 36}" width="${f(lw)}" height="72" rx="6" fill="#fffdf8" stroke="${cov.st}" stroke-width="1.8"/>` +
    txt((Wc + 22) / 2, Dc / 2 + 2, ttl, { size: 28, anchor: "middle", weight: 900, fill: atk ? "#c3352b" : C.ink }) +
    txt((Wc + 22) / 2, Dc / 2 + 26, sub, { size: 14, anchor: "middle", weight: 700, fill: "#6d685e" }) +
    `<path d="M${Wc - 22} 0H${Wc - 6}Q${Wc} 0 ${Wc} 6V22Z" fill="#d4d7db" stroke="#7d828a" stroke-width="1"/><path d="M${Wc - 22} ${Dc}H${Wc - 6}Q${Wc} ${Dc} ${Wc} ${Dc - 6}V${Dc - 22}Z" fill="#d4d7db" stroke="#7d828a" stroke-width="1"/>`;
  const inner = `<rect x="0" y="0" width="${Wc}" height="${Dc}" rx="6" fill="#d9eff6" stroke="${cov.st}" stroke-width="2"/><rect x="34" y="${Dc - 54}" width="${Wc - 52}" height="42" rx="4" fill="#bfe3ef" stroke="#7fbfd6" stroke-width="1.2"/>`;
  const ms = matStr(cs.m), tr = `translate(${f(cs.th[0])},${f(cs.th[1])})`;
  s += `<g id="${p}-cover" data-hx="${f(cs.hx)}" data-hy="${f(cs.hy)}" data-t="${T}" data-a="${a0}">
    <g id="${p}-cover-th" transform="${cs.outVis ? tr + " " : ""}${ms}"><rect x="0" y="0" width="${Wc}" height="${Dc}" rx="6" fill="${cov.st}"/></g>
    <g id="${p}-cover-out" transform="${ms}" opacity="${cs.outVis ? 1 : 0}">${outer}</g>
    <g id="${p}-cover-in" transform="${cs.outVis ? "" : tr + " "}${ms}" opacity="${cs.outVis ? 0 : 1}"><g transform="translate(${Wc},0) scale(-1,1)">${inner}</g></g></g>`;
  const c0 = coverState(o, u0, v0, zP, 0, T);
  const anchors = { top: at(o, 0, 0, zP + 80), center: at(o, 0, 0, zP / 2), ground: at(o), page: applyM(mP, pw / 2 + 10, ph / 2), title: applyM(c0.m, (Wc + 22) / 2, Dc / 2), hinge: [cs.hx, cs.hy], cover: p + "-cover" };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0 - 10, u0 + Wc, v0, v1, 0, zP + T]], center: anchors.center, glowR: 170 }), anchors };
}

// =====================================================================================
// 调用帧堆叠 frameStack — 托盘架：底座 + 四根立柱 + 每层导轨，n 层半透明托盘（A 在最下）
// opts: n=3（层数）, labels=["A","B","C"], filled=labels.length（初始放了几层，其余隐藏待 KITX.push）, items=true（托盘上的"改动"）
// 可动：ID-t{i}-g（整层，含厚度）、ID-t{i}（托盘面，KITX.tip 绕前沿翻倒）、ID-t{i}-items（托盘上的改动，翻倒时滑落清空）、ID-t{i}-red（红闪）
// anchors: top, center, ground, trays[i]（托盘中心）, tabs[i]（托盘标签处）
// =====================================================================================
export function frameStack(o, opts = {}) {
  const p = opts.id ?? "fs", atk = isAtk(opts), n = opts.n ?? 3;
  const labels = opts.labels ?? ["A", "B", "C", "D", "E"].slice(0, n), filled = opts.filled ?? labels.length;
  const TW = 200, TD = 140, gap = 58, z0 = 30, Hr = z0 + n * gap + 18;
  const TC = atk ? { fill: "rgba(232,87,76,0.42)", st: "#a8322a", rim: "rgba(255,255,255,0.75)", tab: "#c23a30" } : { fill: "rgba(92,192,224,0.36)", st: "#1f7896", rim: "rgba(255,255,255,0.8)", tab: "#1d93ba" };
  let s = contactShadow(o, 160, 115);
  s += rbox(o, -120, 120, -86, 86, 0, 14, 8, M.ink, { sw: 1.4 });
  const post = (u, v) => cyl(o, u, v, 5.5, 14, Hr, M.chrome, { seg: 14, sw: 1.2 });
  const rail = (u, z) => line3(o, [[u, -78, z], [u, 78, z]], "#7d828a", 5) + line3(o, [[u, -78, z + 1.5], [u, 78, z + 1.5]], "#e6e8ea", 1.6);
  s += post(-110, -78) + post(110, -78);
  s += line3(o, [[-110, -78, Hr], [110, -78, Hr], [110, 78, Hr]], "#7d828a", 5);
  for (let i = 0; i < n; i++) s += rail(106, z0 + i * gap - 3);
  let defs = "";
  for (let i = 0; i < n; i++) {
    const zi = z0 + i * gap, [hx, hy] = at(o, -TW / 2, TD / 2, zi);
    const m = [U[0], U[1], -V[0], -V[1], hx, hy], ms = matStr(m);
    defs += `<g id="${p}-t${i}-sl" transform="${ms}"><rect x="0" y="0" width="${TW}" height="${TD}" rx="10" fill="${TC.st}"/></g>`;
    const lab = labels[i] ?? "";
    let face = `<rect x="0" y="0" width="${TW}" height="${TD}" rx="10" fill="${TC.fill}" stroke="${TC.st}" stroke-width="2.6"/>
      <rect x="10" y="10" width="${TW - 20}" height="${TD - 20}" rx="6" fill="none" stroke="${TC.rim}" stroke-width="2.2"/>
      <rect x="${TW / 2 - 24}" y="${TD - 18}" width="48" height="9" rx="4.5" fill="rgba(255,255,255,0.65)" stroke="${TC.st}" stroke-width="1.4"/>
      <rect x="16" y="14" width="${Math.max(44, tw(lab, 26) + 18)}" height="38" rx="7" fill="${TC.tab}"/>` + txt(16 + Math.max(44, tw(lab, 26) + 18) / 2, 43, lab, { size: 26, anchor: "middle", fill: "#ffffff" });
    const items = `<g id="${p}-t${i}-items" opacity="${opts.items === false ? 0 : 1}">
      <rect x="84" y="24" width="44" height="58" rx="3" fill="#fffdf8" stroke="#b8b0a1" stroke-width="1.4"/><path d="M92 38H120M92 50H116M92 62H120" stroke="#cfc7b8" stroke-width="3"/>
      <g transform="rotate(10 156 66)"><rect x="134" y="36" width="44" height="58" rx="3" fill="#fffdf8" stroke="#b8b0a1" stroke-width="1.4"/><path d="M142 50H170M142 62H164" stroke="#cfc7b8" stroke-width="3"/><circle cx="166" cy="80" r="7" fill="none" stroke="#d93a2f" stroke-width="2"/></g>
      <rect x="28" y="70" width="44" height="18" rx="3" fill="#3a9ec2" stroke="#1f7896" stroke-width="1.4"/><rect x="28" y="94" width="30" height="18" rx="3" fill="#1f9d55" stroke="#17804a" stroke-width="1.4"/></g>`;
    const red = `<rect id="${p}-t${i}-red" x="0" y="0" width="${TW}" height="${TD}" rx="10" fill="rgba(224,69,58,0.35)" stroke="#e0453a" stroke-width="4" opacity="0"/>`;
    s += `<g id="${p}-t${i}-g" opacity="${i < filled ? 1 : 0}">` +
      [7, 5, 3].map((k) => `<use href="#${p}-t${i}-sl" transform="translate(0,${f(k * CE)})" opacity="0.45"/>`).join("") +
      `<g id="${p}-t${i}" data-hx="${f(hx)}" data-hy="${f(hy)}" data-a="0" transform="${ms}">${face}${items}${red}</g></g>`;
  }
  s = `<defs>${defs}</defs>` + s;
  for (let i = 0; i < n; i++) s += rail(-106, z0 + i * gap - 3);
  s += post(-110, 78) + post(110, 78);
  s += line3(o, [[-110, -78, Hr], [-110, 78, Hr], [110, 78, Hr]], "#7d828a", 5);
  for (const [u, v] of [[-110, -78], [110, -78], [-110, 78], [110, 78]]) s += cyl(o, u, v, 8, Hr - 2, Hr + 6, M.ink, { seg: 14, sw: 1 });
  const anchors = {
    top: at(o, 0, 0, Hr + 50), center: at(o, 0, 0, Hr / 2), ground: at(o),
    trays: Array.from({ length: n }, (_, i) => at(o, 0, 0, z0 + i * gap + 2)),
    tabs: Array.from({ length: n }, (_, i) => at(o, -TW / 2 + 36, TD / 2 - 30, z0 + i * gap + 2)),
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-120, 120, -86, 86, 0, 14], [-110, 110, -78, 78, 14, Hr]], center: anchors.center, glowR: 170 }), anchors };
}

// =====================================================================================
// gas 油表 gasGauge — 汽车式半圆油表，立在短柱上；E 在左、F 在右，表盘下沿写 "gas"
// opts: value=1（1 = F，0 = E）, label="gas", scale2（替换刻度组的 SVG，可选）
// 可动：ID-needle（指针，KITX.gauge 推到某个值）、ID-lamp（低油量灯，到 E 变红）、ID-scale / ID-scale2（KIT.swap 换刻度圈）
// anchors: top, center, ground, dial（表盘中心偏上）, hub（指针轴）
// =====================================================================================
export function gasGauge(o, opts = {}) {
  const p = opts.id ?? "gas", atk = isAtk(opts);
  const R = 88, T = 22, zc = 150, AMIN = -72, AMAX = 72;
  const caseM = atk ? mat("#c9463c", { st: "#7a1d17" }) : { f: "#3b3e44", s: "#2b2d31", t: "#4d5158", st: "#141518" };
  let s = contactShadow(o, 110, 62);
  s += rbox(o, -64, 64, -44, 36, 0, 14, 8, M.dark, { sw: 1.4 });
  s += cyl(o, 0, -11, 11, 14, zc - 30, M.chrome, { seg: 18, sw: 1.2 });
  const mF = frameV(o, 0, 0, zc);
  const Rr = R + 14, hb = 46;
  const housing = `M${-Rr} ${hb - 14}L${-Rr} 0A${Rr} ${Rr} 0 0 1 ${Rr} 0L${Rr} ${hb - 14}Q${Rr} ${hb} ${Rr - 14} ${hb}L${-Rr + 14} ${hb}Q${-Rr} ${hb} ${-Rr} ${hb - 14}Z`;
  for (let i = T; i >= 2; i -= 2) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(mF), `<path d="${housing}" fill="${caseM.s}" stroke="${caseM.st}" stroke-width="${i === T ? 1.8 : 0}"/>`)}</g>`;
  const dial = `M${-R} 24L${-R} 0A${R} ${R} 0 0 1 ${R} 0L${R} 24Q${R} 34 ${R - 10} 34L${-R + 10} 34Q${-R} 34 ${-R} 24Z`;
  let face = `<path d="${housing}" fill="${caseM.f}" stroke="${caseM.st}" stroke-width="2"/><path d="${housing}" fill="none" stroke="${lighten(caseM.f, 0.25)}" stroke-width="2" transform="scale(0.965)"/>
    <path d="${dial}" fill="#fffdf8" stroke="#8d939b" stroke-width="2"/>`;
  const pol = (deg, r) => [r * Math.sin(deg * DEG), -r * Math.cos(deg * DEG)];
  const scale = (dense) => {
    let g = "";
    const arc = (a0, a1, r) => { const A = pol(a0, r), B = pol(a1, r); return `M${f(A[0])} ${f(A[1])}A${r} ${r} 0 0 1 ${f(B[0])} ${f(B[1])}`; };
    g += `<path d="${arc(AMIN, AMIN + (dense ? 32 : 20), R - 13)}" fill="none" stroke="#e0453a" stroke-width="9"/>`;
    const N = dense ? 24 : 16;
    for (let k = 0; k <= N; k++) {
      const a = AMIN + ((AMAX - AMIN) * k) / N, major = k % (N / 4) === 0;
      const A = pol(a, R - (major ? 26 : 17)), B = pol(a, R - 8);
      g += `<line x1="${f(A[0])}" y1="${f(A[1])}" x2="${f(B[0])}" y2="${f(B[1])}" stroke="#1c1c1c" stroke-width="${major ? 4 : 1.8}" stroke-linecap="round"/>`;
    }
    const E = pol(-56, R - 44), F = pol(56, R - 44), H = pol(0, R - 42);
    g += txt(E[0], E[1] + 9, "E", { size: 26, anchor: "middle", fill: "#c3352b" }) + txt(F[0], F[1] + 9, "F", { size: 26, anchor: "middle" }) + txt(H[0], H[1] + 7, "½", { size: 20, anchor: "middle", weight: 800 });
    // fuel pump icon
    g += `<g transform="translate(${-R + 8},8) scale(0.85)"><rect x="0" y="0" width="14" height="20" rx="2" fill="#5a5e65"/><rect x="3" y="3" width="8" height="6" rx="1" fill="#fffdf8"/><path d="M14 5H18V16Q18 19 20 19" fill="none" stroke="#5a5e65" stroke-width="2"/></g>`;
    return g;
  };
  face += `<g id="${p}-scale">${scale(false)}</g><g id="${p}-scale2" opacity="0">${opts.scale2 ?? scale(true)}</g>`;
  face += txt(0, 31, opts.label ?? "gas", { size: 19, mono: true, weight: 800, anchor: "middle", fill: "#1c1c1c" });
  face += ledSvg(p + "-lamp", R - 16, 20, 5.5, (opts.value ?? 1) <= 0.06 ? "red" : "off");
  s += G_(matStr(mF), face);
  const v = opts.value ?? 1, deg = AMIN + (AMAX - AMIN) * v;
  const needle = `<path d="M-3 2L-5 14L5 14L3 2Z" fill="#1c1c1c" opacity="0.25" transform="translate(2,3)"/><path d="M-4.5 0L0 ${-(R - 16)}L4.5 0L3 14L-3 14Z" fill="#1c1c1c" opacity="0.22" transform="translate(3,4)"/>
    <path d="M-4.5 0L0 ${-(R - 16)}L4.5 0L3 14L-3 14Z" fill="#1c1c1c" stroke="#000000" stroke-width="1"/><path d="M-1 -4L0 ${-(R - 22)}" stroke="#8d939b" stroke-width="1.4"/>`;
  s += rotator(p + "-needle", mF, 0, 0, deg, needle, `data-min="${AMIN}" data-max="${AMAX}"`);
  s += G_(matStr(mF), `<circle cx="0" cy="0" r="11" fill="url(#${p}-hg)" stroke="#2b2d31" stroke-width="1.6"/><circle cx="0" cy="0" r="3" fill="#2b2d31"/>
    <path d="${(() => { const A = pol(-62, R - 5), B = pol(-22, R - 5); return `M${f(A[0])} ${f(A[1])}A${R - 5} ${R - 5} 0 0 1 ${f(B[0])} ${f(B[1])}`; })()}" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.75"/>`);
  s = `<defs><radialGradient id="${p}-hg" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#c3c7cc"/><stop offset="1" stop-color="#6e737b"/></radialGradient></defs>` + s;
  const anchors = { top: at(o, 0, 0, zc + Rr + 50), center: at(o, 0, 0, zc - 10), ground: at(o), dial: applyM(mF, 0, -40), hub: applyM(mF, 0, 0), needle: p + "-needle", lamp: p + "-lamp" };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-Rr, Rr, -T, 0, zc - hb, zc + Rr], [-64, 64, -44, 36, 0, 14]], center: anchors.center, glowR: 130 }), anchors };
}

// =====================================================================================
// 选择器钥匙 selectorKey — 钥匙齿只有 4 个（4 字节），齿深由选择器每个字节决定；手柄铭牌写函数名
// opts: name="transfer(address,uint256)", selector="a9059cbb"（8 位 hex，可带 0x）, stand=true（立着；false 平放）, z=70（立着时中心高度）, nameSize=18
// 同一 selector → 齿形完全一样；不同函数名、同 selector 的两把钥匙就是"名字不同、齿形相同"
// 可动：ID-teeth-hl（齿区青蓝描边，默认隐藏，KIT.pop / opacity 动画）、ID-name（铭牌文字组）
// anchors: top, center, ground, tip（钥匙尖）, bow（手柄中心）, teeth（齿区中心下沿）, name
// =====================================================================================
export function selectorKey(o, opts = {}) {
  const p = opts.id ?? "sk", atk = isAtk(opts);
  const K = atk ? { f: "#e8574c", s: "#c23a30", t: "#f6a59d", st: "#7a1d17" } : brass;
  const name = opts.name ?? "transfer(address,uint256)";
  const hex = String(opts.selector ?? "a9059cbb").replace(/^0x/, "").padEnd(8, "0").slice(0, 8).toLowerCase();
  const bytes = [0, 1, 2, 3].map((i) => parseInt(hex.slice(2 * i, 2 * i + 2), 16) || 0);
  const ns = opts.nameSize ?? 18, nw = tw(name, ns, true);
  const bw = Math.max(130, nw + 66), bh = 80, L = 176;
  const tx = [30, 66, 102, 138], depth = bytes.map((b) => 6 + Math.round((b / 255) * 18));
  let blade = `M0 -22H16V-11H${L - 14}L${L} -2L${L - 8} 11`;
  for (let k = 3; k >= 0; k--) blade += `H${tx[k] + 26}L${tx[k] + 21} ${11 + depth[k]}H${tx[k] + 5}L${tx[k]} 11`;
  blade += `H16V22H0Z`;
  const bow = `M${-bw + 18} ${-bh / 2}H-6Q4 ${-bh / 2} 4 ${-bh / 2 + 12}V${bh / 2 - 12}Q4 ${bh / 2} -6 ${bh / 2}H${-bw + 18}Q${-bw} ${bh / 2} ${-bw} ${bh / 2 - 18}V${-bh / 2 + 18}Q${-bw} ${-bh / 2} ${-bw + 18} ${-bh / 2}Z`;
  const shape = (fill) => `<path d="${bow}" fill="${fill}" stroke="${K.st}" stroke-width="2" stroke-linejoin="round"/><path d="${blade}" fill="${fill}" stroke="${K.st}" stroke-width="2" stroke-linejoin="round"/>`;
  let front = shape(K.f);
  front += `<circle cx="${-bw + 20}" cy="0" r="10" fill="#efebe3" stroke="${K.st}" stroke-width="1.8"/>`;
  front += `<path d="M${-bw + 14} ${-bh / 2 + 6}H-10" stroke="${K.t}" stroke-width="3.5" stroke-linecap="round"/><path d="M20 -7H${L - 18}" stroke="${K.t}" stroke-width="2.6" stroke-linecap="round"/>`;
  front += `<path d="M20 1H${L - 24}" stroke="${K.st}" stroke-width="1.2" opacity="0.45"/>`;
  front += bytes.map((b, k) => txt(tx[k] + 13, 8, hex.slice(2 * k, 2 * k + 2), { size: 10, mono: true, weight: 800, anchor: "middle", fill: K.st })).join("");
  front += `<rect x="${-bw + 38}" y="-24" width="${bw - 50}" height="48" rx="6" fill="#fffdf8" stroke="${K.st}" stroke-width="1.6"/>`;
  front += `<g id="${p}-name">${txt(-bw + 38 + (bw - 50) / 2, ns * 0.36, name, { size: ns, mono: true, weight: 800, anchor: "middle", fill: atk ? "#c3352b" : C.ink })}</g>`;
  front += `<rect id="${p}-teeth-hl" x="${tx[0] - 6}" y="-14" width="${tx[3] + 32 - tx[0]}" height="${14 + 11 + Math.max(...depth) + 6}" rx="6" fill="none" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="8 5" opacity="0"/>`;
  const stand = opts.stand !== false, c = (L - bw) / 2;
  let s = contactShadow(o, (bw + L) * 0.42, 50, 0, stand ? 0 : 10);
  const zz = stand ? opts.z ?? 70 : 6;
  const mF = stand ? frameV(o, -c - (L + bw) / 2 + bw, 0, zz) : frameTop(o, -c - (L + bw) / 2 + bw, 0, zz);
  for (let i = 6; i >= 1; i--) {
    const off = stand ? [-i * V[0], -i * V[1]] : [0, i * CE];
    s += `<g transform="translate(${f(off[0])},${f(off[1])})">${G_(matStr(mF), shape(K.s))}</g>`;
  }
  s += G_(matStr(mF), front);
  const top = applyM(mF, (L - bw) / 2, -bh / 2);
  const outline = [[-bw, -bh / 2], [4, -bh / 2], [4, -11], [L, -2], [L - 8, 11 + Math.max(...depth)], [4, bh / 2], [-bw, bh / 2]].map(([x, y]) => applyM(mF, x, y));
  const anchors = {
    top: [top[0], top[1] - 40], center: applyM(mF, (L - bw) / 2, 0), ground: at(o), tip: applyM(mF, L, 0), bow: applyM(mF, -bw / 2, 0),
    teeth: applyM(mF, (tx[0] + tx[3] + 26) / 2, 11 + Math.max(...depth)), name: applyM(mF, -bw + 38 + (bw - 50) / 2, 0), len: bw + L,
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [{ path: polyD(outline) }], center: anchors.center, badgeR: 24, glowR: (bw + L) * 0.45 }), anchors };
}

// =====================================================================================
// 告示牌 signboard — 路边木框白色告示牌：两根木柱、顶檐、左上编号、顶上小灯；三行 误解 / 事实 / 影响
// opts: n="1"（编号）, myth, fact, impact（三行文字）, struck=false（误解行红色删除线已划上）, blank=false（只显示行名，内容隐藏）,
//       lamp=false（顶灯亮绿）, w=440, h=240
// 可动：ID-myth / ID-fact / ID-impact（三行内容组）、ID-strike（删除线，stroke-dashoffset 动画）、ID-lamp（顶灯）
//       KITX.sign(tl, ID, t, "myth"|"strike"|"fact"|"impact"|"lamp"|"all")
// anchors: top, center, ground, myth, fact, impact（三行中心）, plate（编号）
// =====================================================================================
export function signboard(o, opts = {}) {
  const p = opts.id ?? "sign", atk = isAtk(opts);
  const w = opts.w ?? 440, h = opts.h ?? 240, zb = 104, zt = zb + h;
  const wood = atk ? mat("#c9463c", { st: "#7a1d17" }) : M.wood, woodD = { f: "#a06e40", s: "#7f5128", t: "#b98454", st: "#5a3818" };
  let s = contactShadow(o, w * 0.56, 58, 0, -10);
  for (const x of [-w / 2 + 56, w / 2 - 56]) {
    s += box(o, x - 18, x + 18, -30, 0, 0, 10, M.dark, 1.2);
    s += box(o, x - 10, x + 10, -22, -8, 10, zt - 16, woodD, 1.4);
    s += G_(faceV(o, x - 10, -8, zb - 6), `<path d="M3 10H17M3 40H17M3 70H17" stroke="${woodD.st}" stroke-width="1" opacity="0.5"/>`);
  }
  s += box(o, -w / 2, w / 2, -8, 0, zb, zt, wood, 1.8);
  s += box(o, -w / 2 - 10, w / 2 + 10, -16, 8, zt, zt + 12, woodD, 1.6);
  // top lamp
  s += box(o, w / 2 - 66, w / 2 - 34, -10, 4, zt + 12, zt + 30, M.ink, 1.2);
  s += G_(faceV(o, w / 2 - 66, 4, zt + 30), ledSvg(p + "-lamp", 16, 9, 5.5, opts.lamp ? "green" : "off"));
  const mP = frameV(o, -w / 2, 0, zt), pw = w - 28, ph = h - 28;
  let pn = `<rect x="14" y="14" width="${pw}" height="${ph}" rx="4" fill="#fffdf8" stroke="#cfc7b8" stroke-width="1.6"/>`;
  pn += `<path d="M14 ${14 + 3}H${14 + pw}" stroke="#e3ddd1" stroke-width="2"/>`;
  // wood grain on the frame
  pn += `<path d="M4 6Q${w / 3} 2 ${w - 4} 7M4 ${h - 6}Q${w / 2} ${h - 2} ${w - 4} ${h - 7}" fill="none" stroke="${darken(wood.f, 0.15)}" stroke-width="1.4"/>`;
  pn += `<circle cx="44" cy="46" r="20" fill="#1c1c1c"/>` + txt(44, 54, opts.n ?? "1", { size: 22, anchor: "middle", fill: "#ffffff" });
  const X0 = 124, avail = pw + 14 - X0 - 12;
  const fit = (s2, max) => Math.min(max, avail / Math.max(1, tw(s2, 1)));
  const rowY = [58, 120, 182];
  ["误解", "事实", "影响"].forEach((l, k) => { pn += txt(72, rowY[k] + 4, l, { size: 20, weight: 800, fill: "#8a8478" }); });
  pn += `<path d="M24 ${rowY[0] + 20}H${pw + 4}M24 ${rowY[1] + 20}H${pw + 4}" stroke="#e3ddd1" stroke-width="2" stroke-dasharray="6 5"/>`;
  const hide = opts.blank ? 0 : 1;
  const myth = opts.myth ?? "", fact = opts.fact ?? "", impact = opts.impact ?? "";
  const ms = fit(myth, 26), fs2 = fit(fact, 26), is = Math.min(22, (avail - 28) / Math.max(1, tw(impact, 1)));
  pn += `<g id="${p}-myth" opacity="${myth ? hide : 0}">${txt(X0, rowY[0] + 6, myth, { size: f(ms), weight: 800, fill: "#3b3e44" })}</g>`;
  const sl = tw(myth, ms) + 12;
  pn += `<path id="${p}-strike" d="M${X0 - 6} ${rowY[0] - 3}H${f(X0 + sl)}" stroke="#e0453a" stroke-width="5" stroke-linecap="round" stroke-dasharray="${f(sl + 8)} ${f(sl + 8)}" stroke-dashoffset="${opts.struck ? 0 : f(sl + 8)}" data-l="${f(sl + 8)}" opacity="${myth ? 1 : 0}"/>`;
  pn += `<g id="${p}-fact" opacity="${fact ? hide : 0}">${txt(X0, rowY[1] + 6, fact, { size: f(fs2), weight: 900 })}</g>`;
  const iw = tw(impact, is) + 28;
  pn += `<g id="${p}-impact" opacity="${impact ? hide : 0}"><rect x="${X0}" y="${rowY[2] - 20}" width="${f(iw)}" height="38" rx="19" fill="#1d93ba"/>${txt(X0 + iw / 2, rowY[2] + 6, impact, { size: f(is), weight: 800, anchor: "middle", fill: "#ffffff" })}</g>`;
  s += G_(matStr(mP), pn);
  const anchors = {
    top: at(o, 0, 0, zt + 70), center: at(o, 0, 0, (zb + zt) / 2), ground: at(o), plate: applyM(mP, 44, 46),
    myth: applyM(mP, X0 + avail / 2, rowY[0]), fact: applyM(mP, X0 + avail / 2, rowY[1]), impact: applyM(mP, X0 + avail / 2, rowY[2]), lamp: p + "-lamp",
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-w / 2, w / 2, -8, 0, zb, zt], [-w / 2 - 10, w / 2 + 10, -16, 8, zt, zt + 12]], center: anchors.center, glowR: w * 0.55 }), anchors };
}

/** catalogue: name → constructor */
export const CATALOG_EXT = { contractMachine, slotCabinet, byteBlock, hashFunnel, manual, frameStack, gasGauge, selectorKey, signboard };
/** browser runtime (window.KITX helpers) — inline after iso.runtimeJs() */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
