// objects-ext.mjs — 第 01 章补充拟物物件（与 kit/objects.mjs 同一投影、同一接口）
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin  = 世界坐标 {u, v}（用 iso.G(X,Y) 换算）
//   opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"；opts.glow 绿色地光
//   opts.scale（仅 vending / miniVend）：整体缩放，围绕地面原点
// 通用 DOM：<g id=ID data-ox data-oy> → ID-glow / ID-solid / ID-wire / ID-x（与 kit 相同，KIT.broke / KIT.grow 直接可用）
// 运行时动画：kit/runtime.js（window.KIT）之后再内联 runtimeExtJs()（window.KITX）。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  CA, SA, SE, CE, U, V, f, f4, at, pts, M, C, mix, lighten, darken, mat,
  frameV, frameU, frameTop, matStr, applyM, faceV, faceU, faceTop,
  box, edges, loft, prism, rbox, cyl, frustum, sphere, flat, line3, rrectPlan, circlePlan,
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
function gearD(cx, cy, r, n = 10, h = 5) {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a0 = (i / (n * 2)) * 2 * Math.PI, a1 = ((i + 1) / (n * 2)) * 2 * Math.PI, rr = i % 2 ? r : r + h;
    d += (i === 0 ? `M${f(cx + rr * Math.cos(a0))} ${f(cy + rr * Math.sin(a0))}` : `L${f(cx + rr * Math.cos(a0))} ${f(cy + rr * Math.sin(a0))}`) + `L${f(cx + rr * Math.cos(a1))} ${f(cy + rr * Math.sin(a1))}`;
  }
  return d + "Z";
}
const isAtk = (opts) => opts.state === "attacker";
const dk = (u, v) => -u * SA * SE + v * CA * SE; // painter depth key (larger = nearer)
const r2 = (n) => Math.round(n * 100) / 100;
const mm = (a) => `matrix(${a.map(r2).join(",")})`;
const mdata = (m) => m.map((v, i) => (i < 4 ? f4(v) : f(v))).join(",");
/** in-plane rotator compatible with KIT.setRot / KIT.rot */
function rotator(id, m, px, py, a, inner, extra = "") {
  const tr = `${matStr(m)} translate(${px} ${py}) rotate(${f(a)}) translate(${-px} ${-py})`;
  return `<g id="${id}" data-m="${mdata(m)}" data-px="${px}" data-py="${py}" data-a="${f(a)}" transform="${tr}" ${extra}>${inner}</g>`;
}
/** common shell (same DOM as kit) + optional uniform scale about the ground origin */
function shell(p, o, opts, s) {
  const st = opts.state ?? "normal", broken = st === "broken", k = opts.scale ?? 1;
  const glowOn = (opts.glow ?? s.glowDefault ?? false) && !broken;
  const [ox, oy] = at(o);
  const glowSvg = s.glowR ? `<g id="${p}-glow" opacity="${glowOn ? 1 : 0}">${glow(p + "-gl", s.glowAt ?? o, s.glowR)}</g>` : "";
  let inner = `${s.under ?? ""}${glowSvg}${s.shadow ?? ""}
  <g id="${p}-solid" opacity="${broken ? opts.ghost ?? 0.18 : 1}">${s.solid}</g>
  ${wireSvg(p + "-wire", o, s.wire, { opacity: broken ? 1 : 0 })}
  ${badgeSvg(p + "-x", s.center, s.badgeR ?? 30, broken && opts.badge !== false ? 1 : 0)}${s.over ?? ""}`;
  if (k !== 1) inner = `<g transform="translate(${f(ox)},${f(oy)}) scale(${k}) translate(${f(-ox)},${f(-oy)})">${inner}</g>`;
  return `<g id="${p}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}" data-k="${k}" data-state="${st}" ${s.attrs ?? ""}>${inner}</g>`;
}
/** scale every [x,y] anchor about the ground origin (strings / matrices untouched) */
function scaleAnchors(o, k, A) {
  if (k === 1) return A;
  const [ox, oy] = at(o);
  const sc = (v) => {
    if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number") return [ox + k * (v[0] - ox), oy + k * (v[1] - oy)];
    if (Array.isArray(v) && v.length === 6 && typeof v[0] === "number") return v;
    if (Array.isArray(v)) return v.map(sc);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([a, b]) => [a, sc(b)]));
    return v;
  };
  return sc(A);
}
/** circuit-diagram sheet in a local w×h box (teal fine lines = "code is public") */
function schematic(x0, y0, w, h, c = "#2aa3c9") {
  const X = (t) => f(x0 + w * t), Y = (t) => f(y0 + h * t);
  let s = `<rect x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${f(h)}" rx="2" fill="#f7fbfc" stroke="#9fcfdf" stroke-width="1.4"/>`;
  for (let i = 1; i < 8; i++) s += `<path d="M${X(i / 8)} ${Y(0.02)}V${Y(0.98)}M${X(0.02)} ${Y(i / 8)}H${X(0.98)}" stroke="#e1f0f5" stroke-width="0.7"/>`;
  // chip
  const cx0 = 0.36, cx1 = 0.64, cy0 = 0.32, cy1 = 0.56;
  s += `<rect x="${X(cx0)}" y="${Y(cy0)}" width="${f(w * (cx1 - cx0))}" height="${f(h * (cy1 - cy0))}" rx="2" fill="${c}"/>`;
  s += `<circle cx="${X(cx0 + 0.04)}" cy="${Y(cy0 + 0.05)}" r="1.8" fill="#ffffff"/>`;
  let d = "";
  for (let i = 0; i < 4; i++) { const y = cy0 + 0.04 + i * 0.055; d += `M${X(cx0 - 0.06)} ${Y(y)}H${X(cx0)}M${X(cx1)} ${Y(y)}H${X(cx1 + 0.06)}`; }
  // traces
  d += `M${X(cx0 - 0.06)} ${Y(cy0 + 0.04)}H${X(0.14)}V${Y(0.14)}H${X(0.42)}`;
  d += `M${X(cx0 - 0.06)} ${Y(cy0 + 0.095)}H${X(0.2)}V${Y(0.72)}H${X(0.34)}`;
  d += `M${X(cx0 - 0.06)} ${Y(cy0 + 0.205)}H${X(0.26)}V${Y(0.62)}`;
  d += `M${X(cx1 + 0.06)} ${Y(cy0 + 0.04)}H${X(0.84)}V${Y(0.12)}`;
  d += `M${X(cx1 + 0.06)} ${Y(cy0 + 0.15)}H${X(0.9)}V${Y(0.7)}H${X(0.62)}`;
  d += `M${X(cx1 + 0.06)} ${Y(cy0 + 0.205)}H${X(0.76)}V${Y(0.84)}H${X(0.5)}`;
  d += `M${X(0.5)} ${Y(cy1)}V${Y(0.66)}`;
  s += `<path d="${d}" fill="none" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"/>`;
  // resistor zigzag + capacitor + ground
  s += `<path d="M${X(0.42)} ${Y(0.14)}l3 -4l4 8l4 -8l4 8l4 -8l3 4H${X(0.72)}" fill="none" stroke="${c}" stroke-width="1.5"/>`;
  s += `<path d="M${X(0.44)} ${Y(0.66)}V${Y(0.74)}M${X(0.48)} ${Y(0.66)}V${Y(0.74)}M${X(0.34)} ${Y(0.7)}H${X(0.44)}M${X(0.48)} ${Y(0.7)}H${X(0.56)}" stroke="${c}" stroke-width="1.6"/>`;
  s += `<path d="M${X(0.26)} ${Y(0.62)}V${Y(0.66)}M${X(0.2)} ${Y(0.66)}H${X(0.32)}M${X(0.22)} ${Y(0.69)}H${X(0.3)}M${X(0.24)} ${Y(0.72)}H${X(0.28)}" stroke="${c}" stroke-width="1.4"/>`;
  for (const [a, b] of [[0.14, 0.14], [0.84, 0.12], [0.9, 0.7], [0.5, 0.84], [0.62, 0.7], [0.2, 0.72]]) s += `<circle cx="${X(a)}" cy="${Y(b)}" r="2.4" fill="#ffffff" stroke="${c}" stroke-width="1.3"/>`;
  // title block
  s += `<rect x="${X(0.6)}" y="${Y(0.86)}" width="${f(w * 0.36)}" height="${f(h * 0.1)}" fill="none" stroke="#9fcfdf" stroke-width="1"/><path d="M${X(0.63)} ${Y(0.9)}H${X(0.9)}M${X(0.63)} ${Y(0.93)}H${X(0.82)}" stroke="#9fcfdf" stroke-width="1.2"/>`;
  return s;
}
/** flat iso coin (gold / red), base at height z */
function coinFlat(c, z, r, fill, st, hi) {
  return `<g transform="${faceTop(c, 0, 0, z)}"><circle cx="0" cy="${f(3.2 / 1)}" r="${r}" fill="${st}"/></g>` +
    `<g transform="${faceTop(c, 0, 0, z + 3.5)}"><circle cx="0" cy="0" r="${r}" fill="${fill}" stroke="${st}" stroke-width="1.3"/><circle cx="0" cy="0" r="${f(r * 0.62)}" fill="none" stroke="${hi}" stroke-width="1.4"/></g>`;
}
const GOLD = { fill: M.gold.f, st: M.gold.st, hi: M.gold.t };
const REDC = { fill: "#e8574c", st: "#a8322a", hi: "#f6b0a8" };

// =====================================================================================
// 自动售货机 vending — 智能合约（全片主角）
// 200（u）× 150（v）× 300（z）。+v 面：灯箱招牌、玻璃橱窗（三层货架、螺旋弹簧、金条与硬币）、
//   齿轮观察窗、右侧按钮面板（显示屏、投币口、5 个按钮、退币钮）、出货口（带翻板）。
// −u 面：贴着的电路图纸（ID-schem）；可选维修门（ID-maint，门 ID-mdoor，门后实现模块 ID-impl / ID-impl-atk）。
// opts: sign="CONTRACT", coins=true|false|"low", glass=true, maintDoor=false|true|"hidden", mdoorOpen=0（°）,
//       impl="blue"|"attacker", rivets=false, gears=true, scale=1, glow 默认 true
// 可动：ID-btn-0..4（KITX.press / KIT.led）、ID-gear-0..3（KITX.gears）、ID-mdoor（KITX.sideDoor）、
//       ID-coin-0..7（KITX.dispense，金/红）、ID-half（半枚硬币）、ID-shelf-0..2（库存，class ID-stock）、ID-glass、
//       ID-schem、ID-maint、ID-dlock（门上挂锁）、ID-rivets、ID-lcd、ID-flap
// =====================================================================================
export function vending(o, opts = {}) {
  const p = opts.id ?? "vm", atk = isAtk(opts), k = opts.scale ?? 1;
  const u0 = -100, u1 = 100, v0 = -75, v1 = 75, zf = 10, zT = 300;
  const body = atk ? { f: "#e8574c", s: "#c23a30", t: "#f08a80", st: "#8f2620" } : { f: "#2f9fc4", s: "#1f86a8", t: "#5cc0e0", st: "#155e77" };
  const capM = atk ? mat("#b8392f") : { f: "#1f7896", s: "#17637c", t: "#3d97b5", st: "#0e4252" };
  const trim = atk ? "#5e1612" : "#163a47";
  let s = contactShadow(o, 175, 135);
  s += box(o, u0 + 6, u1 - 6, v0 + 6, v1 - 6, 0, zf, M.ink, 1.2);
  s += rbox(o, u0, u1, v0, v1, zf, zT, 10, body, { sw: 2 });
  s += rbox(o, u0 - 4, u1 + 4, v0 - 4, v1 + 4, zT, zT + 12, 12, capM, { sw: 1.6 });
  // top vent grill
  s += G_(faceTop(o, -56, -44, zT + 12), Array.from({ length: 7 }, (_, i) => `<rect x="${i * 16}" y="0" width="8" height="70" rx="4" fill="${darken(capM.t, 0.22)}"/>`).join(""));

  // ---------------------------------------------------------------- −u face (side)
  const FU = faceU(o, u0, v0, zT);
  let side = `<rect x="7" y="8" width="136" height="276" rx="8" fill="none" stroke="${darken(body.f, 0.14)}" stroke-width="2"/>`;
  side += `<rect x="12" y="270" width="126" height="10" rx="3" fill="${darken(body.f, 0.2)}"/>`;
  s += G_(FU, side);
  // circuit sheet (taped)
  const schemSvg = `<g transform="rotate(-2 75 95)">${schematic(18, 30, 114, 128)}
    <rect x="10" y="24" width="30" height="11" rx="1" fill="rgba(238,228,204,0.85)" transform="rotate(-32 25 29)"/>
    <rect x="110" y="24" width="30" height="11" rx="1" fill="rgba(238,228,204,0.85)" transform="rotate(32 125 29)"/></g>`;
  s += `<g id="${p}-schem">${G_(FU, schemSvg)}</g>`;

  // maintenance door (on −u face, hinge at the back edge v=-40, swings out toward −u)
  const md = opts.maintDoor ?? false;
  const dv0 = -40, dv1 = 40, dz0 = 26, dz1 = 126, dW = dv1 - dv0, dH = dz1 - dz0, dT = 5, ub = u0 + 18;
  let maint = "";
  if (md) {
    maint += G_(faceU(o, u0, dv0 - 5, dz1 + 5), `<rect x="0" y="0" width="${dW + 10}" height="${dH + 10}" rx="4" fill="${trim}"/>`);
    const op = [at(o, u0, dv0, dz0), at(o, u0, dv1, dz0), at(o, u0, dv1, dz1), at(o, u0, dv0, dz1)];
    let cav = `<polygon points="${pts([at(o, ub, dv0, dz0), at(o, ub, dv1, dz0), at(o, ub, dv1, dz1), at(o, ub, dv0, dz1)])}" fill="#22343b"/>`;
    cav += `<polygon points="${pts([at(o, u0, dv0, dz0), at(o, ub, dv0, dz0), at(o, ub, dv0, dz1), at(o, u0, dv0, dz1)])}" fill="#2f4850"/>`;
    cav += `<polygon points="${pts([at(o, u0, dv0, dz0), at(o, ub, dv0, dz0), at(o, ub, dv1, dz0), at(o, u0, dv1, dz0)])}" fill="#3b5761"/>`;
    // implementation module on the back wall (blue / attacker red)
    const module = (A, B, S) => {
      let q = `<rect x="6" y="22" width="48" height="60" rx="6" fill="${A}" stroke="${S}" stroke-width="2"/><rect x="10" y="26" width="40" height="12" rx="3" fill="${B}"/>`;
      q += `<path d="${gearD(22, 60, 9, 9, 3)}" fill="${B}" stroke="${S}" stroke-width="1.4"/><circle cx="22" cy="60" r="3" fill="${S}"/>`;
      q += `<path d="${gearD(40, 54, 6, 7, 2.4)}" fill="${B}" stroke="${S}" stroke-width="1.2"/><circle cx="40" cy="54" r="2" fill="${S}"/>`;
      q += `<path d="M18 22V6M30 22V2M42 22V8" stroke="#9aa0a8" stroke-width="2.4"/>`;
      return q;
    };
    const implAtk = opts.impl === "attacker";
    cav += G_(faceU(o, ub, dv0, dz1), `<g id="${p}-impl" opacity="${implAtk ? 0 : 1}">${module("#5cc0e0", "#9ad9ee", "#1f7896")}</g><g id="${p}-impl-atk" opacity="${implAtk ? 1 : 0}">${module("#e8574c", "#f08a80", "#a8322a")}</g>`);
    maint += `<defs><clipPath id="${p}-mc"><polygon points="${pts(op)}"/></clipPath></defs><g clip-path="url(#${p}-mc)">${cav}</g>`;
    // door
    const deg = opts.mdoorOpen ?? 0;
    const [hx, hy] = at(o, u0, dv0, dz1);
    const ds = sideDoorState(hx, hy, dW, dT, deg);
    const panel = lighten(body.f, 0.06);
    let outer = `<rect x="0" y="0" width="${dW}" height="${dH}" rx="4" fill="${panel}" stroke="${body.st}" stroke-width="1.8"/>
      <rect x="7" y="7" width="${dW - 14}" height="${dH - 14}" rx="3" fill="none" stroke="${darken(panel, 0.18)}" stroke-width="1.6"/>`;
    for (let i = 0; i < 4; i++) outer += `<rect x="16" y="${16 + i * 9}" width="${dW - 40}" height="4" rx="2" fill="${darken(panel, 0.24)}"/>`;
    for (const [x, y] of [[5, 5], [dW - 5, 5], [5, dH - 5], [dW - 5, dH - 5]]) outer += `<circle cx="${x}" cy="${y}" r="2" fill="${lighten(panel, 0.35)}"/>`;
    // hasp + small padlock near the free edge
    outer += `<g id="${p}-dlock"><rect x="${dW - 20}" y="${dH * 0.52}" width="16" height="9" rx="2" fill="#c3c8ce" stroke="#4b4f56" stroke-width="1.2"/>
      <path d="M${dW - 17} ${dH * 0.52 + 14}v-7a5 5 0 0 1 10 0v7" fill="none" stroke="#5a6068" stroke-width="3"/>
      <rect x="${dW - 21}" y="${dH * 0.52 + 12}" width="18" height="16" rx="3" fill="#a9aeb5" stroke="#4b4f56" stroke-width="1.4"/><circle cx="${dW - 12}" cy="${dH * 0.52 + 19}" r="2" fill="#1d1f23"/></g>`;
    const inner = `<rect x="0" y="0" width="${dW}" height="${dH}" rx="4" fill="#9aa0a8" stroke="#4b4f56" stroke-width="1.8"/>
      <path d="M8 ${dH * 0.3}H${dW - 8}M8 ${dH * 0.7}H${dW - 8}" stroke="#7d828a" stroke-width="5"/><rect x="${dW - 22}" y="${dH * 0.46}" width="12" height="10" rx="2" fill="#5a6068"/><rect x="6" y="6" width="${dW - 12}" height="${dH - 12}" rx="3" fill="none" stroke="#b3b8bf" stroke-width="2"/>`;
    const P2 = (q) => `${r2(q[0])},${r2(q[1])}`, Hd = dH * CE, vis = deg > 1.5 ? 1 : 0;
    maint += `<g id="${p}-mdoor" data-hx="${r2(hx)}" data-hy="${r2(hy)}" data-w="${dW}" data-h="${dH}" data-t="${dT}" data-a="${deg}">
      <polygon id="${p}-mdoor-edge" points="${[P2(ds.F), P2(ds.I), P2([ds.I[0], ds.I[1] + Hd]), P2([ds.F[0], ds.F[1] + Hd])].join(" ")}" fill="${darken(panel, 0.1)}" stroke="${body.st}" stroke-width="1.4" opacity="${vis}"/>
      <polygon id="${p}-mdoor-top" points="${[P2([hx, hy]), P2(ds.F), P2(ds.I), P2(ds.Hn)].join(" ")}" fill="${lighten(panel, 0.2)}" stroke="${body.st}" stroke-width="1.4" opacity="${vis}"/>
      <g id="${p}-mdoor-out" transform="${mm(ds.out)}" opacity="${ds.showOut ? 1 : 0}">${outer}</g>
      <g id="${p}-mdoor-in" transform="${mm(ds.inn)}" opacity="${ds.showOut ? 0 : 1}">${inner}</g></g>`;
    for (const zz of [dz0 + 14, dz1 - 14]) maint += cyl(o, u0 - 2, dv0 - 1, 3.5, zz - 8, zz + 8, M.chrome, { sw: 1, seg: 12 });
    s += `<g id="${p}-maint" opacity="${md === "hidden" ? 0 : 1}">${maint}</g>`;
  }

  // ---------------------------------------------------------------- +v face (front)
  const FVm = frameV(o, u0, v1, zT), FV = matStr(FVm);
  let fr = `<rect x="8" y="8" width="184" height="42" rx="7" fill="${trim}"/>
    <rect x="13" y="13" width="174" height="32" rx="5" fill="${atk ? "#fde6e3" : "#e9f6fb"}"/>
    <rect x="13" y="13" width="174" height="6" rx="3" fill="#ffffff" opacity="0.7"/>` +
    txt(100, 37, opts.sign ?? "CONTRACT", { size: 19, mono: true, anchor: "middle", fill: atk ? "#a8322a" : "#17809f", weight: 800, extra: `letter-spacing="2"` }) +
    `<rect x="10" y="56" width="134" height="150" rx="6" fill="${trim}"/>
    <rect x="10" y="212" width="134" height="38" rx="5" fill="${trim}"/><rect x="15" y="216" width="124" height="30" rx="3" fill="#1d2f36"/>
    <rect x="150" y="56" width="42" height="194" rx="5" fill="#d4d7db" stroke="#7d828a" stroke-width="1.5"/>
    <rect x="152" y="58" width="38" height="4" rx="2" fill="#eceef0"/>
    <rect x="155" y="64" width="32" height="17" rx="2" fill="#0f2a33" stroke="#2b2d31" stroke-width="1"/>` +
    `<g id="${p}-lcd">${txt(171, 77, "0.00", { size: 10, mono: true, anchor: "middle", fill: atk ? "#ffb3ab" : "#9ad9ee", weight: 700 })}</g>` +
    `<rect x="158" y="88" width="26" height="32" rx="4" fill="#eceef0" stroke="#5a5e65" stroke-width="1.4"/><rect x="169" y="93" width="4.5" height="22" rx="2" fill="#141518"/>
    <circle cx="171" cy="231" r="6" fill="#c3c8ce" stroke="#4b4f56" stroke-width="1.3"/><circle cx="171" cy="231" r="2.4" fill="#7d828a"/>
    <rect x="160" y="241" width="22" height="5" rx="2.5" fill="#141518"/>
    <rect x="20" y="255" width="112" height="31" rx="6" fill="${trim}"/>
    <rect x="26" y="259" width="100" height="23" rx="4" fill="#0b0c0e"/>
    <rect x="${10}" y="252" width="0" height="0"/>`;
  // buttons
  const btnIds = [];
  for (let i = 0; i < 5; i++) {
    const cy = 132 + i * 19, id = `${p}-btn-${i}`; btnIds.push(id);
    fr += `<rect x="154" y="${cy - 1.5}" width="7" height="3" rx="1.5" fill="#9aa0a8"/><circle cx="172" cy="${cy}" r="8.5" fill="#7d828a" stroke="#4b4f56" stroke-width="1"/>
      <circle id="${id}-h" cx="172" cy="${cy}" r="13" fill="#2bd46f" opacity="0"/><circle id="${id}" cx="172" cy="${cy}" r="6.2" fill="#f4f5f6" data-base="#f4f5f6" stroke="rgba(0,0,0,0.35)" stroke-width="1"/>
      <circle cx="170" cy="${cy - 2}" r="2" fill="#ffffff" opacity="0.8"/>`;
  }
  s += G_(FV, fr);

  // cavity behind the glass
  const wu0 = -84, wu1 = 38, wz0 = 100, wz1 = 238, vb = -21;
  const op = [at(o, wu0, v1, wz0), at(o, wu1, v1, wz0), at(o, wu1, v1, wz1), at(o, wu0, v1, wz1)];
  let cav = `<polygon points="${pts([at(o, wu0, vb, wz0), at(o, wu1, vb, wz0), at(o, wu1, vb, wz1), at(o, wu0, vb, wz1)])}" fill="${atk ? "#f4dcd9" : "#dcebf0"}"/>`;
  cav += `<polygon points="${pts([at(o, wu1, vb, wz0), at(o, wu1, v1, wz0), at(o, wu1, v1, wz1), at(o, wu1, vb, wz1)])}" fill="${atk ? "#e6c3bf" : "#bcd8e2"}"/>`;
  cav += `<polygon points="${pts([at(o, wu0, vb, wz0), at(o, wu1, vb, wz0), at(o, wu1, v1, wz0), at(o, wu0, v1, wz0)])}" fill="${atk ? "#d9b2ad" : "#a9c7d2"}"/>`;
  cav += `<polygon points="${pts([at(o, wu0, vb, wz1 - 7), at(o, wu1, vb, wz1 - 7), at(o, wu1, vb, wz1), at(o, wu0, vb, wz1)])}" fill="#ffffff" opacity="0.9"/>`;
  const stock = opts.coins ?? true;
  const shelfZ = [wz0, wz0 + 46, wz0 + 92];
  const slots = [-64, -24, 16];
  const shelfM = { f: "#c3c8ce", s: "#a9aeb5", t: "#dfe2e5", st: "#5a6068" };
  shelfZ.forEach((z, si) => {
    if (si > 0) cav += box(o, wu0, wu1, vb, v1 - 4, z - 4, z, shelfM, 1);
    const items = [];
    const show = stock === true || (stock === "low" && si === 0);
    slots.forEach((cu, j) => {
      // spiral coil (helix along v)
      const N = 40, turns = 5, rr = 8, zc = z + 9;
      const helix = Array.from({ length: N + 1 }, (_, t) => { const a = (t / N) * turns * 2 * Math.PI; return [cu + rr * Math.cos(a), vb + 8 + ((v1 - 12 - vb - 8) * t) / N, zc + rr * Math.sin(a)]; });
      cav += line3(o, helix, "#8d939b", 1.3);
      if (!show) return;
      const kind = (si + j) % 2 ? "coin" : "bar";
      for (const cv of [6, 44]) {
        let q = "";
        if (kind === "bar") q = box(o, cu - 11, cu + 11, cv - 15, cv + 15, z + 1, z + 13, M.gold, 1.1) + G_(faceTop(o, cu - 7, cv - 10, z + 13), `<rect x="0" y="0" width="14" height="20" rx="2" fill="none" stroke="${M.gold.s}" stroke-width="1.2"/>`);
        else q = cyl(o, cu, cv, 10, z + 1, z + 15, M.gold, { seg: 20, sw: 1.1 }) + flat(o, circlePlan(cu, cv, 6, 20), z + 15, "none", M.gold.s, 1.2) +
          line3(o, [[cu - 10, cv + 1, z + 6], [cu - 6, cv + 8, z + 6], [cu, cv + 10, z + 6], [cu + 7, cv + 7, z + 6]], M.gold.s, 1);
        items.push({ key: dk(cu, cv), svg: q });
      }
    });
    items.sort((a, b) => a.key - b.key);
    cav += `<g id="${p}-shelf-${si}" class="${p}-stock">${items.map((x) => x.svg).join("")}</g>`;
    // price rail at the shelf front edge
    const rail = `<rect x="0" y="-2" width="${wu1 - wu0}" height="8" fill="${atk ? "#a8322a" : "#1d93ba"}"/>` + slots.map((cu) => `<rect x="${f(cu - wu0 - 8)}" y="-1" width="16" height="6" rx="1" fill="#ffffff"/>`).join("");
    cav += G_(faceV(o, wu0, v1 - 3, z + 5), rail);
  });
  s += `<defs><clipPath id="${p}-cav-c"><polygon points="${pts(op)}"/></clipPath></defs><g id="${p}-cav" clip-path="url(#${p}-cav-c)">${cav}</g>`;
  // glass
  if (opts.glass !== false) {
    s += `<g id="${p}-glass"><polygon points="${pts(op)}" fill="rgba(214,238,246,0.16)" stroke="rgba(255,255,255,0.6)" stroke-width="1.4"/>` +
      G_(faceV(o, wu0, v1, wz1), `<path d="M18 0L48 0L6 70L0 70L0 30Z" fill="#ffffff" opacity="0.28"/><path d="M62 0L72 0L18 ${wz1 - wz0}L8 ${wz1 - wz0}Z" fill="#ffffff" opacity="0.18"/>`) + `</g>`;
  }
  // gears in the mechanism window
  const gears = [[42, 231, 10, 10, 1], [64, 233, 7.5, 8, -1], [92, 229, 12, 12, 1], [118, 233, 7.5, 8, -1]];
  const gearIds = [];
  if (opts.gears !== false) {
    gears.forEach(([gx, gy, gr, gn, dir], i) => {
      const id = `${p}-gear-${i}`; gearIds.push(id);
      const inner = `<path d="${gearD(gx, gy, gr, gn, gr * 0.3)}" fill="#c3c8ce" stroke="#4b4f56" stroke-width="1.2"/><circle cx="${gx}" cy="${gy}" r="${f(gr * 0.45)}" fill="#8d939b"/><circle cx="${gx}" cy="${gy}" r="2.4" fill="#2b2d31"/><path d="M${gx - gr * 0.42} ${gy}H${gx + gr * 0.42}" stroke="#2b2d31" stroke-width="1.6"/>`;
      s += rotator(id, FVm, gx, gy, 0, inner, `data-ratio="${f4((dir * 10) / gr)}"`);
    });
    s += G_(FV, `<rect x="15" y="216" width="124" height="30" rx="3" fill="rgba(214,238,246,0.12)"/><path d="M24 216L36 216L22 246L15 246L15 232Z" fill="#ffffff" opacity="0.2"/>`);
  }
  // tray flap
  s += G_(FV, `<g id="${p}-flap"><rect x="26" y="259" width="100" height="13" rx="3" fill="rgba(140,160,170,0.55)" stroke="#5a6068" stroke-width="1"/><rect x="62" y="263" width="28" height="4" rx="2" fill="#d4d7db"/></g>`);
  // rivets (seams)
  let riv = "";
  for (let y = 18; y <= 282; y += 24) riv += `<circle cx="4.5" cy="${y}" r="2.2"/><circle cx="195.5" cy="${y}" r="2.2"/>`;
  for (let x = 20; x <= 180; x += 20) riv += `<circle cx="${x}" cy="4.5" r="2.2"/><circle cx="${x}" cy="287" r="2.2"/>`;
  let rivU = "";
  for (let y = 18; y <= 282; y += 24) rivU += `<circle cx="4.5" cy="${y}" r="2.2"/><circle cx="145.5" cy="${y}" r="2.2"/>`;
  for (let x = 20; x <= 130; x += 20) rivU += `<circle cx="${x}" cy="4.5" r="2.2"/>`;
  s += `<g id="${p}-rivets" opacity="${opts.rivets ? 1 : 0}" fill="#e9eef0" stroke="${body.st}" stroke-width="1">${G_(FV, riv)}${G_(FU, rivU)}</g>`;
  // coins for dispensing (hidden until KITX.dispense)
  const trayC = { u: o.u - 24, v: o.v + v1 + 6 };
  let coins = "";
  for (let i = 0; i < 8; i++) {
    const c = { u: trayC.u + ((i % 3) - 1) * 14, v: trayC.v };
    coins += `<g id="${p}-coin-${i}" opacity="0"><g id="${p}-coin-${i}-g">${coinFlat(c, 16, 10, GOLD.fill, GOLD.st, GOLD.hi)}</g><g id="${p}-coin-${i}-r" opacity="0">${coinFlat(c, 16, 10, REDC.fill, REDC.st, REDC.hi)}</g></g>`;
  }
  const hc = { u: trayC.u + 30, v: trayC.v + 40 };
  coins += `<g id="${p}-half" opacity="0"><g transform="${faceTop(hc, 0, 0, 0)}"><path d="M-10 3.2A10 10 0 0 1 10 3.2Z" fill="${GOLD.st}"/></g><g transform="${faceTop(hc, 0, 0, 3.5)}"><path d="M-10 0A10 10 0 0 1 10 0Z" fill="${GOLD.fill}" stroke="${GOLD.st}" stroke-width="1.3"/></g></g>`;
  const vec = (a) => `${f4(a[0])},${f4(a[1])}`;
  s += `<g id="${p}-coins" data-fu="${vec(U)}" data-fv="${vec(V)}" data-fz="0,${f4(-CE)}">${coins}</g>`;

  const btnLocal = (i) => applyM(FVm, 172, 132 + i * 19);
  const doorOpen = sideDoorState(...at(o, u0, dv0, dz1), dW, dT, 105);
  const anchors = {
    top: at(o, 0, 0, zT + 70), center: at(o, 0, 0, zT / 2), ground: at(o), front: at(o, 0, v1, zT / 2),
    sign: applyM(FVm, 100, 29), glass: at(o, (wu0 + wu1) / 2, v1, (wz0 + wz1) / 2), stock: at(o, (wu0 + wu1) / 2, 20, wz0 + 60),
    panel: applyM(FVm, 171, 170), coinSlot: applyM(FVm, 171, 104), buttons: [0, 1, 2, 3, 4].map(btnLocal), btnIds,
    tray: at(o, -24, v1, 22), trayOut: at(o, -24, v1 + 70, 0), gears: applyM(FVm, 80, 231), gearIds,
    side: at(o, u0, 0, zT / 2), schem: applyM(frameU(o, u0, v0, zT), 75, 94),
    maint: at(o, u0, 0, (dz0 + dz1) / 2), maintTop: at(o, u0 - 20, 0, dz1 + 50), impl: at(o, ub, 0, (dz0 + dz1) / 2 + 6),
    maintHinge: at(o, u0, dv0, dz1), maintFree: doorOpen.F,
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [[u0, u1, v0, v1, 0, zT + 12]], center: anchors.center, glowR: 210, glowDefault: true, badgeR: 36 }),
    anchors: scaleAnchors(o, k, anchors),
  };
}
/** side-door geometry (door in a u=const plane, hinge at its −v edge, swings toward −u) */
function sideDoorState(hx, hy, w, T, deg) {
  const a = deg * DEG, du = -Math.sin(a), dv = Math.cos(a), nu = -Math.cos(a), nv = -Math.sin(a);
  const dS = [du * U[0] + dv * V[0], du * U[1] + dv * V[1]], nS = [nu * U[0] + nv * V[0], nu * U[1] + nv * V[1]];
  const F = [hx + w * dS[0], hy + w * dS[1]], I = [F[0] - T * nS[0], F[1] - T * nS[1]], Hn = [hx - T * nS[0], hy - T * nS[1]];
  return { out: [dS[0], dS[1], 0, CE, hx, hy], inn: [-dS[0], -dS[1], 0, CE, I[0], I[1]], showOut: nu * U[1] + nv * V[1] > 0, F, I, Hn };
}

// =====================================================================================
// 小售货机 miniVend — 外部合约：kind="token"（硬币）| "dex"（互换箭头）| "oracle"（顶上表盘，指针可动）| "attacker"（红色攻击者合约）| "plain"
// 110 × 90 × 180。可动：ID-needle（oracle，KITX.needle / KIT.rot，0° 竖直向上，±70°）、ID-btn-0..2
// anchors: top, center, ground, front, icon, tray, portL（−u 面管道接口）, portR, portF, dial, btnIds
// =====================================================================================
export function miniVend(o, opts = {}) {
  const kind = opts.kind ?? "token", p = opts.id ?? "mv", k = opts.scale ?? 1;
  const atk = isAtk(opts) || kind === "attacker";
  const u0 = -55, u1 = 55, v0 = -45, v1 = 45, zf = 8, zT = 180;
  const body = atk ? { f: "#e8574c", s: "#c23a30", t: "#f08a80", st: "#8f2620" } : { f: "#f4f1ea", s: "#ddd6c9", t: "#fbfaf6", st: "#8d857a" };
  const acc = atk ? "#a8322a" : "#1d93ba", trim = atk ? "#5e1612" : "#163a47";
  let s = contactShadow(o, 100, 80);
  s += box(o, u0 + 4, u1 - 4, v0 + 4, v1 - 4, 0, zf, M.ink, 1.1);
  s += rbox(o, u0, u1, v0, v1, zf, zT, 7, body, { sw: 1.8 });
  s += rbox(o, u0 - 3, u1 + 3, v0 - 3, v1 + 3, zT, zT + 8, 8, atk ? mat("#b8392f") : { f: "#1f7896", s: "#17637c", t: "#3d97b5", st: "#0e4252" }, { sw: 1.4 });
  // side: teal stripe + small schematic + pipe port
  const FU = faceU(o, u0, v0, zT);
  s += G_(FU, `<rect x="0" y="8" width="90" height="8" fill="${acc}"/>` + schematic(16, 30, 58, 62) +
    `<circle cx="45" cy="${zT - 70}" r="13" fill="#c3c8ce" stroke="#4b4f56" stroke-width="1.6"/><circle cx="45" cy="${zT - 70}" r="7" fill="#2b2d31"/>` +
    [0, 90, 180, 270].map((a) => `<circle cx="${f(45 + 10 * Math.cos(a * DEG))}" cy="${f(zT - 70 + 10 * Math.sin(a * DEG))}" r="1.6" fill="#4b4f56"/>`).join(""));
  // front
  const FVm = frameV(o, u0, v1, zT), FV = matStr(FVm);
  const label = opts.label ?? { token: "TOKEN", dex: "DEX", oracle: "ORACLE", attacker: "", plain: "" }[kind] ?? "";
  let fr = `<rect x="6" y="6" width="98" height="22" rx="4" fill="${acc}"/>` + (label ? txt(55, 22, label, { size: 13, mono: true, anchor: "middle", fill: "#ffffff", weight: 800, extra: `letter-spacing="1"` }) : txt(55, 23, "!", { size: 17, anchor: "middle", fill: "#ffffff" }));
  fr += `<rect x="6" y="33" width="70" height="80" rx="5" fill="${trim}"/>`;
  const ix = 41, iy = 73;
  let icon = "";
  if (kind === "token") {
    icon = `<rect x="10" y="37" width="62" height="72" rx="3" fill="#e8f2f5"/>
      <circle cx="${ix + 9}" cy="${iy + 7}" r="20" fill="${M.gold.s}" stroke="${M.gold.st}" stroke-width="1.6"/>
      <circle cx="${ix - 2}" cy="${iy - 2}" r="22" fill="${M.gold.f}" stroke="${M.gold.st}" stroke-width="2"/><circle cx="${ix - 2}" cy="${iy - 2}" r="15" fill="none" stroke="${M.gold.s}" stroke-width="2.4"/>
      <path d="M${ix - 2} ${iy - 12}L${ix + 6} ${iy - 2}L${ix - 2} ${iy + 8}L${ix - 10} ${iy - 2}Z" fill="${M.gold.s}"/><path d="M${ix - 14} ${iy - 12}A16 16 0 0 1 ${ix - 2} ${iy - 18}" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8"/>`;
  } else if (kind === "dex") {
    icon = `<rect x="10" y="37" width="62" height="72" rx="3" fill="#e8f2f5"/>
      <path d="M18 60H58" stroke="#1d93ba" stroke-width="6" stroke-linecap="round"/><path d="M50 51L60 60L50 69" fill="none" stroke="#1d93ba" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M64 86H24" stroke="#155e77" stroke-width="6" stroke-linecap="round"/><path d="M32 77L22 86L32 95" fill="none" stroke="#155e77" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="18" cy="48" r="7" fill="${M.gold.f}" stroke="${M.gold.st}" stroke-width="1.4"/><circle cx="64" cy="99" r="7" fill="#5cc0e0" stroke="#1f7896" stroke-width="1.4"/>`;
  } else if (kind === "oracle") {
    icon = `<rect x="10" y="37" width="62" height="72" rx="3" fill="#0f2a33"/>` +
      [0, 1, 2, 3].map((i) => `<path d="M14 ${50 + i * 15}H68" stroke="#1f4654" stroke-width="1"/>`).join("") +
      `<polyline points="14,92 24,84 32,88 42,66 50,72 58,54 68,58" fill="none" stroke="#9ad9ee" stroke-width="3" stroke-linejoin="round"/><circle cx="68" cy="58" r="3.5" fill="#ffffff"/>`;
  } else if (kind === "attacker") {
    icon = `<rect x="10" y="37" width="62" height="72" rx="3" fill="#fbe3e0"/>
      <path d="M22 92V66A18 18 0 0 1 58 66V80" fill="none" stroke="#c23a30" stroke-width="6" stroke-linecap="round"/><path d="M49 72L58 83L67 72" fill="none" stroke="#c23a30" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else {
    icon = `<rect x="10" y="37" width="62" height="72" rx="3" fill="#dcebf0"/>`;
  }
  fr += icon;
  fr += `<rect x="82" y="33" width="22" height="104" rx="4" fill="#d4d7db" stroke="#7d828a" stroke-width="1.2"/><rect x="87" y="38" width="12" height="20" rx="2" fill="#eceef0" stroke="#5a5e65" stroke-width="1"/><rect x="91.5" y="41" width="3" height="14" rx="1.5" fill="#141518"/>`;
  const btnIds = [];
  for (let i = 0; i < 3; i++) {
    const cy = 72 + i * 18, id = `${p}-btn-${i}`; btnIds.push(id);
    fr += `<circle cx="93" cy="${cy}" r="7" fill="#7d828a"/><circle id="${id}-h" cx="93" cy="${cy}" r="11" fill="#2bd46f" opacity="0"/><circle id="${id}" cx="93" cy="${cy}" r="5" fill="#f4f5f6" data-base="#f4f5f6" stroke="rgba(0,0,0,0.35)" stroke-width="1"/>`;
  }
  fr += `<rect x="10" y="122" width="62" height="26" rx="5" fill="${trim}"/><rect x="15" y="126" width="52" height="18" rx="3" fill="#0b0c0e"/><rect x="15" y="126" width="52" height="9" rx="2" fill="rgba(140,160,170,0.55)"/>`;
  s += G_(FV, fr);
  // glass sheen on icon window
  s += G_(FV, `<path d="M16 37L30 37L10 70L10 50Z" fill="#ffffff" opacity="0.25"/>`);
  let top = at(o, 0, 0, zT + 56), dial = null;
  if (kind === "oracle") {
    const zc = zT + 62, R = 40, T = 14;
    s += cyl(o, 0, -6, 9, zT + 8, zT + 22, M.ink, { seg: 16, sw: 1.2 });
    const mF = frameV(o, 0, 0, zc);
    for (let i = T; i >= 1; i -= 2) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(mF), `<circle cx="0" cy="0" r="${R}" fill="#4b4f56" stroke="#24262a" stroke-width="${i === T ? 1.6 : 0}"/>`)}</g>`;
    let face = `<circle cx="0" cy="0" r="${R}" fill="#c3c8ce" stroke="#4b4f56" stroke-width="1.6"/><circle cx="0" cy="0" r="${R - 6}" fill="#fffdf8"/>`;
    face += `<path d="M${f(-(R - 12) * Math.sin(70 * DEG))} ${f(-(R - 12) * Math.cos(70 * DEG))}A${R - 12} ${R - 12} 0 0 1 ${f((R - 12) * Math.sin(70 * DEG))} ${f(-(R - 12) * Math.cos(70 * DEG))}" fill="none" stroke="#9ad9ee" stroke-width="5"/>`;
    for (let i = -7; i <= 7; i++) { const a = i * 10 * DEG, r0 = i % 7 === 0 || i === 0 ? R - 18 : R - 14; face += `<line x1="${f(r0 * Math.sin(a))}" y1="${f(-r0 * Math.cos(a))}" x2="${f((R - 9) * Math.sin(a))}" y2="${f(-(R - 9) * Math.cos(a))}" stroke="${C.ink}" stroke-width="${i % 7 === 0 ? 2.4 : 1.2}"/>`; }
    face += txt(0, 18, "PRICE", { size: 8, mono: true, anchor: "middle", fill: "#6d685e", weight: 700 });
    s += G_(matStr(mF), face);
    s += rotator(`${p}-needle`, mF, 0, 0, opts.needle ?? -20, `<path d="M-2.5 6L0 ${-(R - 10)}L2.5 6Z" fill="${C.ink}"/>`);
    s += G_(matStr(mF), `<circle cx="0" cy="0" r="5" fill="#1d93ba" stroke="#155e77" stroke-width="1.2"/>`);
    dial = at(o, 0, 0, zc); top = at(o, 0, 0, zc + R + 50);
  }
  const anchors = {
    top, center: at(o, 0, 0, zT / 2), ground: at(o), front: at(o, 0, v1, zT / 2), icon: applyM(FVm, 41, 73), tray: at(o, u0 + 41, v1, zT - 135),
    portL: at(o, u0, 0, 70), portR: at(o, u1, 0, 70), portF: at(o, 0, v1, 30), dial, btnIds, needle: kind === "oracle" ? `${p}-needle` : null,
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0, u1, v0, v1, 0, zT + 8]], center: anchors.center, glowR: 130, badgeR: 26 }), anchors: scaleAnchors(o, k, anchors) };
}

// =====================================================================================
// 管道 pipe — 连接合约的金属管（可组合性）。opts.pts=[[du,dv,z],...]（相对 o，世界单位，建议轴向折线）, r=9
// 可动：ID-flow（管内流动的虚线，KITX.dash 推进；默认隐藏，opacity 动画显示）
// anchors: start, end, mid, ground
// =====================================================================================
export function pipe(o, opts = {}) {
  const p = opts.id ?? "pipe", atk = isAtk(opts), r = opts.r ?? 9;
  const P = opts.pts ?? [[0, 0, 60], [200, 0, 60]];
  const col = atk ? { f: "#f08a80", s: "#d9534a", st: "#8f2620" } : { f: "#dfe2e5", s: "#a9aeb5", st: "#4b4f56" };
  const pp = P.map((q) => at(o, q[0], q[1], q[2] ?? 0));
  const d = "M" + pp.map((q) => pts([q])).join("L");
  let s = `<path d="${d}" fill="none" stroke="${col.st}" stroke-width="${2 * r + 3}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${col.s}" stroke-width="${2 * r}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${col.f}" stroke-width="${f(r * 0.9)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(0,${f(-r * 0.35)})"/>
    <path d="${d}" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.6" transform="translate(0,${f(-r * 0.62)})"/>`;
  for (const q of [pp[0], pp[pp.length - 1]]) s += `<ellipse cx="${f(q[0])}" cy="${f(q[1])}" rx="${f(r + 4)}" ry="${f(r + 4)}" fill="${col.s}" stroke="${col.st}" stroke-width="1.6"/><circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(r * 0.5)}" fill="${col.st}"/>`;
  for (let i = 1; i < pp.length - 1; i++) s += `<circle cx="${f(pp[i][0])}" cy="${f(pp[i][1])}" r="${f(r + 2.5)}" fill="${col.s}" stroke="${col.st}" stroke-width="1.4"/>`;
  s += `<path id="${p}-flow" d="${d}" fill="none" stroke="${opts.flowColor ?? (atk ? "#ffffff" : "#2aa3c9")}" stroke-width="${f(r * 0.8)}" stroke-dasharray="6 16" stroke-dashoffset="0" stroke-linecap="round" opacity="${opts.flow ? 1 : 0}" transform="translate(0,${f(-r * 0.2)})"/>`;
  const mid = pp[Math.floor(pp.length / 2)];
  const anchors = { start: pp[0], end: pp[pp.length - 1], mid, ground: at(o), center: mid, top: [mid[0], mid[1] - 40], flow: `${p}-flow` };
  return { svg: shell(p, o, opts, { solid: s, wire: [{ path: d }], center: mid, badgeR: 22 }), anchors };
}

// =====================================================================================
// 立着的信封 letter — 交易（排队、上传送带、过桥用）。opts.z（底部高度，如传送带面 78）, lift=10
// 根元素带 data-px/py（底部中心点），KITX.walk 按世界画布点移动它。state:"attacker" 红色信封
// =====================================================================================
export function letter(o, opts = {}) {
  const p = opts.id ?? "letter", red = isAtk(opts), z = opts.z ?? 0, lift = opts.lift ?? 10;
  const W = opts.w ?? 64, H = opts.h ?? 42, st = red ? "#e0453a" : "#6b665c", fill = red ? "#fde6e3" : "#ffffff";
  const m = frameV(o, -W / 2, 0, z + lift + H);
  let s = `<g transform="${faceTop(o, 0, 0, z)}"><ellipse cx="0" cy="0" rx="${W * 0.5}" ry="12" fill="url(#shadowG)"/></g>`;
  for (let i = 4; i >= 1; i--) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(m), `<rect x="0" y="0" width="${W}" height="${H}" rx="4" fill="${red ? "#e8b3ad" : "#d8d1c4"}"/>`)}</g>`;
  s += G_(matStr(m), `<rect x="0" y="0" width="${W}" height="${H}" rx="4" fill="${fill}" stroke="${st}" stroke-width="2.4"/><path d="M3 4L${W / 2} ${H * 0.58}L${W - 3} 4" fill="none" stroke="${st}" stroke-width="2.4" stroke-linejoin="round"/>
    <rect x="${W - 15}" y="${H - 14}" width="10" height="9" rx="1.5" fill="${red ? "#e0453a" : "#2aa3c9"}"/>`);
  const g = at(o, 0, 0, z);
  const anchors = { top: at(o, 0, 0, z + lift + H + 24), center: at(o, 0, 0, z + lift + H / 2), ground: g, foot: g };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-W / 2, W / 2, -4, 0, z + lift, z + lift + H]], center: anchors.center, badgeR: 18, attrs: `data-px="${f(g[0])}" data-py="${f(g[1])}"` }), anchors };
}

// =====================================================================================
// 内存池排队区 mempool — 伸缩隔离带围成的蛇形通道（栏杆透明），上方龙门架挂牌 "Mempool"，里面排着立起的信封
// 区域 u −240..240、v −126..126；入口在左前（−u，v=84），出口在右后（+u，v=−84）。
// opts: n=7（信封数，从出口往回排）, red=[槽位下标]（红色信封）, sign="Mempool"
// 可动：ID-env-0..n-1（letter，KITX.walk）、ID-sign
// anchors: top, sign, entry, exit, slots[]（15 个槽位，世界画布地面点，0 = 最靠近出口）, slotsUV[], route[]（入口→出口折线）
// =====================================================================================
export function mempool(o, opts = {}) {
  const p = opts.id ?? "mp", n = opts.n ?? 7, red = opts.red ?? [];
  const U0 = -240, U1 = 240, V0 = -126, V1 = 126;
  let s = contactShadow(o, 280, 200);
  s += box(o, U0 - 26, U1 + 26, V0 - 26, V1 + 26, 0, 5, M.plinth, 1.2);
  // painted lane chevrons
  const chev = (u, v, dir) => G_(faceTop(o, u, v, 5.2), `<path d="M${-10 * dir} -12L${10 * dir} 0L${-10 * dir} 12" fill="none" stroke="#bfe3ef" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`);
  for (const u of [-120, 40]) s += chev(u, 84, 1) + chev(u, -84, 1);
  for (const u of [120, -40]) s += chev(u, 0, -1);
  // sign gantry (behind the queue)
  const sv = V0 - 46, signText = opts.sign ?? "Mempool";
  s += box(o, -150, -138, sv - 6, sv + 6, 0, 262, M.steel, 1.4) + box(o, 138, 150, sv - 6, sv + 6, 0, 262, M.steel, 1.4);
  s += box(o, -156, 156, sv - 6, sv + 6, 252, 264, M.steel, 1.4);
  s += line3(o, [[-90, sv, 252], [-90, sv, 232]], "#4b4f56", 2.4) + line3(o, [[90, sv, 252], [90, sv, 232]], "#4b4f56", 2.4);
  s += `<g id="${p}-sign">${box(o, -124, 124, sv - 3, sv + 3, 168, 232, M.white, 1.6)}${G_(faceV(o, -124, sv + 3, 232), `<rect x="5" y="5" width="238" height="54" rx="4" fill="#ffffff" stroke="#2aa3c9" stroke-width="5"/>` + txt(124, 46, signText, { size: 36, anchor: "middle", weight: 900, extra: `font-family="Inter, Noto Sans SC, sans-serif"` }))}</g>`;
  // belts: list of [[u,v],[u,v]] — split into ≤130 pieces with posts
  const belts = [[[U1, -42], [U1, V1]], [[U0, V0], [U1, V0]], [[-160, -42], [U1, -42]], [[U0, 42], [160, 42]], [[U0, V1], [U1, V1]], [[U0, V0], [U0, 42]]];
  const items = [], postSet = new Map();
  const addPost = (u, v) => { const key = `${u},${v}`; if (!postSet.has(key)) postSet.set(key, [u, v]); };
  for (const [a, b] of belts) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), nseg = Math.ceil(L / 130);
    for (let i = 0; i < nseg; i++) {
      const A = [a[0] + ((b[0] - a[0]) * i) / nseg, a[1] + ((b[1] - a[1]) * i) / nseg], B = [a[0] + ((b[0] - a[0]) * (i + 1)) / nseg, a[1] + ((b[1] - a[1]) * (i + 1)) / nseg];
      addPost(Math.round(A[0]), Math.round(A[1])); addPost(Math.round(B[0]), Math.round(B[1]));
      const band = [at(o, A[0], A[1], 74), at(o, B[0], B[1], 74), at(o, B[0], B[1], 65), at(o, A[0], A[1], 65)];
      items.push({ key: dk((A[0] + B[0]) / 2, (A[1] + B[1]) / 2), svg: `<polygon points="${pts(band)}" fill="#2aa3c9" stroke="#17809f" stroke-width="1.2" stroke-linejoin="round"/><polyline points="${pts([at(o, A[0], A[1], 73), at(o, B[0], B[1], 73)])}" stroke="#7fcbe3" stroke-width="1.6"/>` });
    }
  }
  for (const [u, v] of postSet.values()) {
    const q = cyl(o, u, v, 12, 0, 4, M.ink, { seg: 16, sw: 1 }) + cyl(o, u, v, 3.6, 4, 78, M.chrome, { seg: 10, sw: 1 }) + cyl(o, u, v, 7, 76, 84, M.ink, { seg: 14, sw: 1 });
    items.push({ key: dk(u, v) + 0.5, svg: q });
  }
  // slots & letters
  const slotsUV = [];
  for (const u of [200, 120, 40, -40, -120]) slotsUV.push([u, -84]);
  for (const u of [-160, -80, 0, 80, 160]) slotsUV.push([u, 0]);
  for (const u of [160, 80, 0, -80, -160]) slotsUV.push([u, 84]);
  const envIds = [];
  for (let i = 0; i < Math.min(n, slotsUV.length); i++) {
    const [du, dv] = slotsUV[i], id = `${p}-env-${i}`; envIds.push(id);
    const L = letter({ u: o.u + du, v: o.v + dv }, { id, lift: 12, w: 84, h: 54, state: red.includes(i) ? "attacker" : "normal" });
    items.push({ key: dk(du, dv), svg: L.svg });
  }
  items.sort((a, b) => a.key - b.key);
  s += items.map((x) => x.svg).join("");
  const route = [[U0 - 70, 84], [200, 84], [200, 0], [-200, 0], [-200, -84], [U1 + 70, -84]].map(([u, v]) => at(o, u, v));
  const anchors = {
    top: at(o, 0, sv, 290), sign: at(o, 0, sv + 3, 200), center: at(o, 0, 0, 40), ground: at(o),
    entry: at(o, U0 - 50, 84), exit: at(o, U1 + 50, -84), slots: slotsUV.map(([u, v]) => at(o, u, v)), slotsUV, route, envIds,
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [[U0, U1, V0, V1, 0, 84], [-156, 156, sv - 6, sv + 6, 0, 264]], center: anchors.center, glowR: 300 }), anchors };
}

// =====================================================================================
// 分拣机 sorter — 区块构建者 / 排序器：传送带（沿 +u）+ 龙门立柱上倒挂的两节机械臂 + 末端敞口区块箱
// opts: letters=3（带上的信封数）, red=[下标], blockLabel="#N", sealed=false（区块箱加盖）
// 可动：ID-sh / ID-el（肩、肘，KITX.reach IK 或 KITX.armPose）、ID-belt-0/1（带面虚线，KITX.dash）、
//       ID-env-i（信封，KITX.walk）、ID-lid（区块盖）、ID-led-0..2、ID-block
// anchors: top, in, out, beltZ, beltSlots[], shoulder, block, blockIn, ledIds, envIds
// =====================================================================================
export function sorter(o, opts = {}) {
  const p = opts.id ?? "sorter", n = opts.letters ?? 3, red = opts.red ?? [];
  const Bu0 = -230, Bu1 = 170, bz = 78;
  let s = contactShadow(o, 280, 140, -20, 0);
  // gantry column (behind) + control panel
  s += box(o, -44, 4, -112, -68, 0, 8, M.dark, 1.2);
  s += box(o, -34, -6, -104, -76, 8, 272, M.steel, 1.6);
  s += box(o, -38, -2, -108, -4, 258, 274, M.steel, 1.6); // boom toward the belt
  s += box(o, -36, -4, -14, 6, 236, 260, { f: "#2f9fc4", s: "#1f86a8", t: "#5cc0e0", st: "#155e77" }, 1.4); // motor housing
  const ledIds = [0, 1, 2].map((i) => `${p}-led-${i}`);
  s += G_(faceV(o, -34, -76, 200), `<rect x="2" y="0" width="24" height="64" rx="3" fill="#2b2d31"/><rect x="5" y="4" width="18" height="14" rx="2" fill="#0f2a33"/>` + txt(14, 15, "1·2·3", { size: 6, mono: true, anchor: "middle", fill: "#9ad9ee", weight: 700 }) +
    ledIds.map((id, i) => ledSvg(id, 14, 28 + i * 12, 3.4, "green")).join(""));
  // legs (back row)
  for (const lu of [-215, -20, 150]) s += box(o, lu, lu + 10, -36, -28, 0, 64, M.dark, 1);
  // bed + rubber belt
  s += box(o, Bu0, Bu1, -38, 38, 62, 74, M.steelLight, 1.4);
  s += box(o, Bu0 + 4, Bu1 - 4, -32, 32, 74, bz, { f: "#3b3e44", s: "#2b2d31", t: "#4a4d53", st: "#141518" }, 1.2);
  s += G_(faceU(o, Bu0, -38, 74), `<circle cx="20" cy="6" r="6" fill="#c3c8ce" stroke="#4b4f56"/><circle cx="56" cy="6" r="6" fill="#c3c8ce" stroke="#4b4f56"/>`);
  const beltIds = [];
  for (const [i, bv] of [[0, -16], [1, 16]]) {
    const id = `${p}-belt-${i}`; beltIds.push(id);
    s += `<polyline id="${id}" points="${pts([at(o, Bu0 + 10, bv, bz + 0.3), at(o, Bu1 - 10, bv, bz + 0.3)])}" fill="none" stroke="#8d939b" stroke-width="3" stroke-dasharray="12 12" stroke-dashoffset="0"/>`;
  }
  s += box(o, Bu0, Bu1, -40, -36, bz, bz + 12, M.chrome, 1.2); // back rail
  // block crate at the end
  const bm = { f: "#5cc0e0", s: "#3a9ec2", t: "#9ad9ee", st: "#1f7896" }, bu = 232, cs = 48, ch = 70;
  let blk = rbox(o, bu - cs, bu + cs, -cs, cs, 0, ch, 9, bm, { sw: 2, topFill: bm.t });
  blk += flat(o, rrectPlan(bu - cs + 9, bu + cs - 9, -cs + 9, cs - 9, 5), ch + 0.3, "#1f7896", "none");
  blk += G_(faceV(o, bu - cs + 10, cs, ch - 8), `<rect x="0" y="0" width="${2 * cs - 20}" height="20" rx="4" fill="#ffffff" opacity="0.92"/>` + txt(cs - 10, 15, opts.blockLabel ?? "#N", { size: 14, anchor: "middle", mono: true, weight: 800, fill: "#17809f" }) +
    [0, 1].map((k2) => `<rect x="4" y="${30 + k2 * 12}" width="${[54, 40][k2]}" height="6" rx="3" fill="#ffffff" opacity="0.7"/>`).join(""));
  blk += `<g id="${p}-lid" opacity="${opts.sealed ? 1 : 0}">${rbox(o, bu - cs, bu + cs, -cs, cs, ch, ch + 5, 9, bm, { sw: 1.6 })}${G_(faceTop(o, bu - cs + 16, -cs + 16, ch + 5), Array.from({ length: 9 }, (_, k2) => `<rect x="${(k2 % 3) * 24}" y="${Math.floor(k2 / 3) * 24}" width="16" height="16" rx="3" fill="#ffffff" opacity="${0.35 + ((k2 * 7) % 5) * 0.1}"/>`).join(""))}</g>`;
  s += `<g id="${p}-block">${blk}</g>`;
  // letters on the belt
  const beltSlots = [], envIds = [];
  for (let i = 0; i < n; i++) {
    const du = -190 + i * 64, id = `${p}-env-${i}`; envIds.push(id);
    beltSlots.push(at(o, du, 0, bz));
    s += letter({ u: o.u + du, v: o.v }, { id, z: bz, lift: 2, state: red.includes(i) ? "attacker" : "normal" }).svg;
  }
  // front legs + front rail
  for (const lu of [-215, -20, 150]) s += box(o, lu, lu + 10, 28, 36, 0, 64, M.dark, 1);
  s += box(o, Bu0, Bu1, 36, 40, bz, bz + 12, M.chrome, 1.2);
  // arm (hangs from the boom; plane v = 0)
  const L1 = 72, L2 = 64, sz = 246, armM = frameV(o, -20, 0, sz);
  const teal = { f: "#2f9fc4", s: "#1f86a8", st: "#155e77" };
  const claw = `<rect x="-12" y="${L2 - 6}" width="24" height="10" rx="3" fill="#4b4f56"/><path d="M-10 ${L2 + 4}V${L2 + 20}L-4 ${L2 + 26}M10 ${L2 + 4}V${L2 + 20}L4 ${L2 + 26}" fill="none" stroke="#4b4f56" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  const fore = `<rect x="-6.5" y="0" width="13" height="${L2}" rx="6.5" fill="${teal.f}" stroke="${teal.st}" stroke-width="1.6"/><rect x="-2" y="8" width="4" height="${L2 - 18}" rx="2" fill="#9ad9ee" opacity="0.8"/>${claw}<circle cx="0" cy="0" r="9" fill="#d4d7db" stroke="#4b4f56" stroke-width="1.6"/><circle cx="0" cy="0" r="3" fill="#4b4f56"/>`;
  const a1 = opts.pose?.[0] ?? 0, a2 = opts.pose?.[1] ?? 0;
  const elbow = rotator(`${p}-el`, [1, 0, 0, 1, 0, L1], 0, 0, a2, fore);
  const upper = `<rect x="-8" y="0" width="16" height="${L1}" rx="8" fill="${teal.f}" stroke="${teal.st}" stroke-width="1.6"/><rect x="-2.5" y="10" width="5" height="${L1 - 22}" rx="2.5" fill="#9ad9ee" opacity="0.8"/>${elbow}<circle cx="0" cy="0" r="11" fill="#d4d7db" stroke="#4b4f56" stroke-width="1.8"/><circle cx="0" cy="0" r="4" fill="#4b4f56"/>`;
  s += `<use href="#${p}-sh" transform="translate(${f(-8 * V[0])},${f(-8 * V[1])})" style="filter:brightness(0.62)"/>`;
  s += rotator(`${p}-sh`, armM, 0, 0, a1, upper, `data-l1="${L1}" data-l2="${L2 + 24}"`);
  const anchors = {
    top: at(o, -20, -40, 330), center: at(o, 0, 0, 100), ground: at(o), in: at(o, Bu0, 0, bz), out: at(o, Bu1, 0, bz), beltZ: bz, beltSlots, envIds,
    shoulder: at(o, -20, 0, sz), shoulderUVZ: [-20, 0, sz], block: at(o, bu, 0, ch), blockIn: at(o, bu, 0, ch - 30), blockTop: at(o, bu, 0, ch + 60), ledIds, beltIds,
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [[Bu0, Bu1, -40, 40, 0, bz + 12], [-34, -6, -104, -76, 0, 274], [bu - cs, bu + cs, -cs, cs, 0, ch]], center: anchors.center, glowR: 280 }), anchors };
}

// =====================================================================================
// 跨链桥 bridge — 石拱桥（驼峰桥面）沿 u 跨过一条沿 v 流的浅蓝色河，近岸桥头有消息层 / 验证岗亭（带天线）
// opts: river=170（河半宽）, booth="normal"|"attacker", flow=false
// 子物件岗亭有自己的 ID-booth-solid / -wire / -x，可单独 KIT.broke(tl, ID+"-booth", t)
// 可动：ID-ripple（水波，KITX.dash）、ID-booth-led、ID-wave-0..1（岗亭天线信号弧）
// anchors: top, deck[]（桥面中线 13 点，左→右，世界画布）, nearRoad, farBank（对岸放售货机处的地面点）, booth, river, crown
// =====================================================================================
export function bridge(o, opts = {}) {
  const p = opts.id ?? "bridge", R = opts.river ?? 170, Lh = R + 90, Hc = 70, hw = 46, Pz = 18, zb = -22, VR = 380;
  const stone = { f: "#e3ddd1", s: "#d2c9b9", t: "#efeae0", st: "#8d857a" };
  const zt = (u) => Math.max(0, Hc * (1 - (u / Lh) ** 2));
  let s = "";
  // river (masked fade at both ends along v)
  const [ax, ay] = at(o, 0, -VR), [bx, by] = at(o, 0, VR);
  let riv = `<polygon points="${pts([at(o, -R, -VR, 0), at(o, R, -VR, zb), at(o, R, VR, zb), at(o, -R, VR, 0)])}" fill="#cbe8f2"/>`;
  riv += `<polygon points="${pts([at(o, R, -VR, zb), at(o, R, VR, zb), at(o, R, VR, 0), at(o, R, -VR, 0)])}" fill="${stone.s}" stroke="${stone.st}" stroke-width="1.2"/>`;
  riv += line3(o, [[R, -VR, -8], [R, VR, -8]], "#bdb3a2", 1.2) + line3(o, [[R, -VR, -15], [R, VR, -15]], "#bdb3a2", 1.2);
  riv += flat(o, [[-R - 12, -VR], [-R, -VR], [-R, VR], [-R - 12, VR]], 0.5, stone.t, stone.st, 1.2) + flat(o, [[R, -VR], [R + 12, -VR], [R + 12, VR], [R, VR]], 0.5, stone.t, stone.st, 1.2);
  let rip = "";
  for (let i = 0; i < 9; i++) { const u = -R + 40 + i * ((2 * R - 70) / 8), z = u < -R + 60 ? -6 : zb; rip += `M${pts([at(o, u, -VR + 40 + (i % 3) * 30, z)])}L${pts([at(o, u, VR - 40, z)])}`; }
  riv += `<path id="${p}-ripple" d="${rip}" stroke="#ffffff" stroke-width="2.4" stroke-dasharray="14 40" stroke-linecap="round" opacity="0.85"/>`;
  s += `<defs><linearGradient id="${p}-rg" gradientUnits="userSpaceOnUse" x1="${f(ax)}" y1="${f(ay)}" x2="${f(bx)}" y2="${f(by)}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.22" stop-color="#fff" stop-opacity="1"/><stop offset="0.78" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="${p}-rm" maskUnits="userSpaceOnUse" x="-20000" y="-20000" width="40000" height="40000"><rect x="-20000" y="-20000" width="40000" height="40000" fill="url(#${p}-rg)"/></mask></defs><g mask="url(#${p}-rm)">${riv}</g>`;
  // booth (near bank, behind the bridge)
  const bo = { u: o.u - Lh + 44, v: o.v - 128 }, batk = opts.booth === "attacker";
  const wall = batk ? mat("#f2d6d3", { st: "#c23a30" }) : M.white, band = batk ? "#e0453a" : "#2aa3c9";
  let bs = contactShadow(bo, 60, 50) + box(bo, -32, 32, -32, 32, 0, 6, M.plinth, 1.2) + box(bo, -27, 27, -27, 27, 6, 104, wall, 1.6);
  bs += G_(faceV(bo, -27, 27, 104), `<rect x="0" y="5" width="54" height="9" fill="${band}"/><rect x="8" y="24" width="38" height="34" rx="2" fill="#cfe8f1" stroke="#8d939b" stroke-width="2.4"/><path d="M27 24V58" stroke="#8d939b" stroke-width="2"/><rect x="5" y="62" width="44" height="5" rx="2" fill="#d6d0c4"/>`);
  bs += G_(faceU(bo, -27, -27, 104), `<rect x="0" y="5" width="54" height="9" fill="${band}"/><rect x="14" y="26" width="26" height="72" rx="2" fill="#ebe6dc" stroke="#8d939b" stroke-width="2"/><circle cx="35" cy="62" r="2.4" fill="#5a5e65"/>`);
  bs += box(bo, -33, 33, -33, 33, 104, 112, M.dark, 1.4);
  bs += cyl(bo, 12, -12, 2.4, 112, 176, M.ink, { seg: 10, sw: 1 }) + sphere(p + "-btip", bo, 12, -12, 179, 5.5, batk ? M.red : M.blue);
  const btip = at(bo, 12, -12, 179);
  for (let i = 0; i < 2; i++) { const r = 16 + i * 14, a = 38 * DEG; const arc = (sg) => `M${f(btip[0] + sg * r * Math.cos(a))} ${f(btip[1] - r * Math.sin(a))}A${r} ${r} 0 0 ${sg > 0 ? 1 : 0} ${f(btip[0] + sg * r * Math.cos(a))} ${f(btip[1] + r * Math.sin(a))}`; bs += `<path id="${p}-wave-${i}" d="${arc(1)}${arc(-1)}" fill="none" stroke="${band}" stroke-width="3.4" stroke-linecap="round" opacity="${0.9 - i * 0.25}"/>`; }
  const ledP = at(bo, -14, 33, 108);
  bs += ledSvg(`${p}-booth-led`, ledP[0], ledP[1] - 2, 4, batk ? "red" : "green");
  s += `<g id="${p}-booth"><g id="${p}-booth-solid">${bs}</g>${wireSvg(p + "-booth-wire", bo, [[-33, 33, -33, 33, 0, 112]], { opacity: 0 })}${badgeSvg(p + "-booth-x", at(bo, 0, 0, 60), 22, 0)}</g>`;
  // back newel posts
  for (const pu of [-Lh, Lh - 16]) s += box(o, pu, pu + 16, -hw - 2, -hw + 12, 0, Pz + 24, stone, 1.4);
  // intrados strip visible near the far springing
  const rx = R - 10, ry = Hc - 28 - zb;
  for (let i = 0; i < 6; i++) {
    const t0 = (i * 4) * DEG, t1 = ((i + 1) * 4) * DEG;
    const A = (t, v) => at(o, rx * Math.cos(t), v, zb + ry * Math.sin(t));
    s += `<polygon points="${pts([A(t0, hw), A(t1, hw), A(t1, -hw), A(t0, -hw)])}" fill="${mix("#a39a8b", "#8d857a", i / 6)}" stroke="${mix("#a39a8b", "#8d857a", i / 6)}" stroke-width="0.8"/>`;
  }
  // deck top (paving strips) + back parapet
  const N = 26, us = Array.from({ length: N + 1 }, (_, i) => -Lh + (2 * Lh * i) / N);
  for (let i = 0; i < N; i++) {
    const a = us[i], b = us[i + 1];
    s += `<polygon points="${pts([at(o, a, -hw + 8, zt(a)), at(o, b, -hw + 8, zt(b)), at(o, b, hw - 8, zt(b)), at(o, a, hw - 8, zt(a))])}" fill="${i % 2 ? "#e6e0d4" : "#ebe5da"}" stroke="#cfc7b8" stroke-width="1"/>`;
  }
  s += line3(o, us.map((u) => [u, 0, zt(u) + 0.3]), "#ffffff", 3, `stroke-dasharray="16 14"`);
  const backFace = [...us.map((u) => at(o, u, -hw + 8, zt(u) + Pz)), ...us.slice().reverse().map((u) => at(o, u, -hw + 8, zt(u)))];
  s += `<polygon points="${pts(backFace)}" fill="${stone.s}" stroke="${stone.st}" stroke-width="1.4" stroke-linejoin="round"/>`;
  s += `<polygon points="${pts([...us.map((u) => at(o, u, -hw, zt(u) + Pz)), ...us.slice().reverse().map((u) => at(o, u, -hw + 8, zt(u) + Pz))])}" fill="${stone.t}" stroke="${stone.st}" stroke-width="1.2" stroke-linejoin="round"/>`;
  // front face (local x = u + Lh, y = Hc − z)
  const Y = (z) => Hc - z;
  let fd = `M0 ${Y(Pz)}`;
  for (const u of us) fd += `L${f(u + Lh)} ${f(Y(zt(u) + Pz))}`;
  fd += `L${2 * Lh} ${Y(0)}L${Lh + R} ${Y(0)}L${Lh + R} ${Y(zb)}L${Lh + rx} ${Y(zb)}A${rx} ${ry} 0 0 0 ${Lh - rx} ${Y(zb)}L${Lh - R} ${Y(zb)}L${Lh - R} ${Y(0)}L0 ${Y(0)}Z`;
  let tex = "";
  for (let y = Y(Hc + Pz) + 13; y < Y(zb); y += 13) {
    const row = Math.round(y / 13); tex += `M0 ${f(y)}H${2 * Lh}`;
    for (let x = (row % 2) * 17; x < 2 * Lh; x += 34) tex += `M${f(x)} ${f(y)}v13`;
  }
  let ring = `<path d="M${Lh - rx - 18} ${Y(zb)}A${rx + 18} ${ry + 18} 0 0 1 ${Lh + rx + 18} ${Y(zb)}L${Lh + rx} ${Y(zb)}A${rx} ${ry} 0 0 0 ${Lh - rx} ${Y(zb)}Z" fill="${stone.f}" stroke="#a69e90" stroke-width="1.4"/>`;
  for (let a = 8; a < 180; a += 9) { const r0 = a * DEG; ring += `<path d="M${f(Lh + rx * Math.cos(r0))} ${f(Y(zb) - ry * Math.sin(r0))}L${f(Lh + (rx + 18) * Math.cos(r0))} ${f(Y(zb) - (ry + 18) * Math.sin(r0))}" stroke="#a69e90" stroke-width="1.2"/>`; }
  ring += `<path d="M${Lh - 9} ${f(Y(zb) - ry - 20)}H${Lh + 9}L${Lh + 7} ${f(Y(zb) - ry + 2)}H${Lh - 7}Z" fill="${stone.t}" stroke="#a69e90" stroke-width="1.4"/>`;
  const face = `<defs><clipPath id="${p}-fc"><path d="${fd}"/></clipPath></defs><path d="${fd}" fill="${stone.s}" stroke="${stone.st}" stroke-width="2" stroke-linejoin="round"/>
    <g clip-path="url(#${p}-fc)"><path d="${tex}" stroke="#bcb3a3" stroke-width="1.2" fill="none"/>${ring}</g>
    <path d="M0 ${Y(Pz) + 5}${us.map((u) => `L${f(u + Lh)} ${f(Y(zt(u) + Pz) + 5)}`).join("")}" fill="none" stroke="#bcb3a3" stroke-width="1.6"/>`;
  s += G_(faceV(o, -Lh, hw, Hc), face);
  s += `<polygon points="${pts([...us.map((u) => at(o, u, hw - 8, zt(u) + Pz)), ...us.slice().reverse().map((u) => at(o, u, hw, zt(u) + Pz))])}" fill="${stone.t}" stroke="${stone.st}" stroke-width="1.2" stroke-linejoin="round"/>`;
  // front newel posts + lamps
  for (const pu of [-Lh, Lh - 16]) {
    s += box(o, pu, pu + 16, hw - 12, hw + 2, 0, Pz + 24, stone, 1.4);
    s += cyl(o, pu + 8, hw - 5, 2.6, Pz + 24, Pz + 92, M.ink, { seg: 10, sw: 1 });
    s += box(o, pu + 1, pu + 15, hw - 12, hw + 2, Pz + 92, Pz + 112, M.tealLight, 1.2) + box(o, pu - 1, pu + 17, hw - 14, hw + 4, Pz + 112, Pz + 116, M.ink, 1);
  }
  const deck = Array.from({ length: 13 }, (_, i) => { const u = -Lh - 60 + ((2 * Lh + 120) * i) / 12; return at(o, u, 0, zt(u)); });
  const anchors = {
    top: at(o, 0, 0, Hc + Pz + 110), crown: at(o, 0, 0, Hc), center: at(o, 0, 0, 40), ground: at(o), deck,
    nearRoad: at(o, -Lh - 90, 0), farBank: at(o, Lh + 170, 0), booth: at(bo, 0, 0, 130), boothId: `${p}-booth`, river: at(o, 0, hw + 160, zb),
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-Lh, Lh, -hw, hw, 0, Hc + Pz]], center: anchors.center, glowR: 0, badgeR: 40 }), anchors };
}

// =====================================================================================
// 防火墙 firewall — 一段砖墙（两截）+ 中间的门禁闸机（两根立柱 + 玻璃翼闸 + 读卡器）
// opts: len=260（墙半长）, open=false（翼闸打开）, led="green"|"red"
// 可动：ID-flap-0/1（KITX.gate 开合）、ID-led（读卡指示灯，KIT.led）
// anchors: top, gate（通道地面中心）, gateFront, reader, wallL / wallR（墙顶中点，攀爬用）, ledId
// =====================================================================================
export function firewall(o, opts = {}) {
  const p = opts.id ?? "fw", L = opts.len ?? 260, g = 60, T = 22, H = 170;
  const brickM = { f: "#ddd3c3", s: "#cbc0ad", t: "#ebe4d8", st: "#8a7f6d" };
  const tones = ["#ded4c4", "#d6cbb9", "#e3dacc", "#d1c5b2"];
  const bricks = (w, h, dark) => {
    let q = `<rect x="0" y="0" width="${w}" height="${h}" fill="${dark ? "#b0a590" : "#bdb29e"}"/>`;
    for (let r = 0; r * 18 < h; r++) {
      const off = r % 2 ? 19 : 0, y = r * 18;
      for (let x = -off, c = 0; x < w; x += 38, c++) {
        const x0 = Math.max(0, x) + 1.5, x1 = Math.min(w, x + 38) - 1.5;
        if (x1 - x0 < 3) continue;
        const col = dark ? darken(tones[(r * 3 + c * 7) % 4], 0.08) : tones[(r * 3 + c * 7) % 4];
        q += `<rect x="${f(x0)}" y="${y + 1.5}" width="${f(x1 - x0)}" height="${Math.min(15, h - y - 1.5)}" rx="1.5" fill="${col}"/>`;
      }
    }
    return q;
  };
  const seg = (a, b) => box(o, a, b, -T, T, 0, H, brickM, 1.6) + G_(faceV(o, a, T, H), bricks(b - a, H, true)) + G_(faceU(o, a, -T, H), bricks(2 * T, H, false)) +
    box(o, a - 4, b + 4, -T - 5, T + 5, H, H + 11, { f: "#e6e1d7", s: "#d2cbbd", t: "#f3f0ea", st: "#8a7f6d" }, 1.4);
  let s = contactShadow(o, L + 60, 80);
  s += seg(g, L);
  // pedestals + flaps
  const pedM = { f: "#d4d7db", s: "#b5b9bf", t: "#eceef0", st: "#5a6068" }, pz = 98;
  const ped = (a, b, right) => {
    let q = rbox(o, a, b, -52, 52, 0, pz, 6, pedM, { sw: 1.6 });
    q += flat(o, rrectPlan(a + 4, b - 4, -46, 46, 3), pz + 0.3, "#2b2d31");
    q += G_(faceV(o, a, 52, pz - 10), `<rect x="2" y="0" width="${b - a - 4}" height="22" rx="3" fill="#1d1f23"/>` + (right ? "" : `<path d="M${(b - a) / 2 - 5} 6L${(b - a) / 2 + 3} 11L${(b - a) / 2 - 5} 16" fill="none" stroke="#2bd46f" stroke-width="2.6" stroke-linecap="round"/>`));
    q += G_(faceU(o, a, -52, pz - 14), `<rect x="8" y="0" width="88" height="6" rx="3" fill="#2aa3c9"/>`);
    return q;
  };
  s += ped(36, 56, true);
  // reader on the right pedestal (front end)
  s += box(o, 38, 54, 20, 46, pz, pz + 8, { f: "#2f9fc4", s: "#1f86a8", t: "#5cc0e0", st: "#155e77" }, 1.2);
  const rd = at(o, 46, 33, pz + 8);
  s += ledSvg(`${p}-led`, rd[0], rd[1], 4, opts.led ?? "green");
  // flaps (plane v = 0)
  const mF = frameV(o, 0, 0, 94), open = opts.open ? 0.1 : 1;
  const flapL = `<path d="M-36 0H-10Q-3 0 -3 9V54Q-3 64 -10 64H-36Z" fill="rgba(150,210,230,0.78)" stroke="#1d93ba" stroke-width="3"/><path d="M-30 7L-16 7L-30 32Z" fill="#ffffff" opacity="0.55"/>`;
  const flapR = `<path d="M36 0H10Q3 0 3 9V54Q3 64 10 64H36Z" fill="rgba(150,210,230,0.78)" stroke="#1d93ba" stroke-width="3"/><path d="M28 7L14 7L28 32Z" fill="#ffffff" opacity="0.45"/>`;
  s += G_(matStr(mF), `<g id="${p}-flap-1" data-px="36" transform="translate(36 0) scale(${open} 1) translate(-36 0)">${flapR}</g><g id="${p}-flap-0" data-px="-36" transform="translate(-36 0) scale(${open} 1) translate(36 0)">${flapL}</g>`);
  s += ped(-56, -36, false);
  s += seg(-L, -g);
  const anchors = {
    top: at(o, 0, 0, H + 70), center: at(o, 0, 0, H / 2), ground: at(o), gate: at(o, 0, 0), gateFront: at(o, 0, 110), reader: rd, ledId: `${p}-led`,
    wallL: at(o, -(L + g) / 2, 0, H + 11), wallR: at(o, (L + g) / 2, 0, H + 11), flapIds: [`${p}-flap-0`, `${p}-flap-1`],
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-L, -g, -T, T, 0, H + 11], [g, L, -T, T, 0, H + 11], [-56, 56, -52, 52, 0, pz]], center: anchors.center, glowR: 240 }), anchors };
}

// =====================================================================================
// 闪电贷柜台 flashDesk — 银色柜台 + 后方玻璃隔断与灯牌（闪电徽记）+ 台面金条堆（4 层）+ 服务铃
// opts: gold=true（金条初始可见）, frame=false（青蓝"一笔交易"框）, sign="FLASH LOAN"
// 可动：ID-pile-0..3（KITX.pileIn / pileOut / flash）、ID-frame（交易框）
// anchors: top, counter（台面中心）, pile（金堆顶）, frameTag（交易框左上角，放标签）, center, ground
// =====================================================================================
export function flashDesk(o, opts = {}) {
  const p = opts.id ?? "flash", atk = isAtk(opts);
  const silver = atk ? mat("#e8574c") : { f: "#dfe2e6", s: "#c3c8ce", t: "#f2f4f6", st: "#7d828a" };
  const W = 130, D = 46, H = 96, zt = H + 8;
  let s = contactShadow(o, 190, 110);
  // partition behind
  const pv0 = -D - 16, pv1 = -D - 8;
  s += box(o, -W, -W + 8, pv0, pv1, zt, zt + 128, M.chrome, 1.2) + box(o, W - 8, W, pv0, pv1, zt, zt + 128, M.chrome, 1.2);
  s += G_(faceV(o, -W + 8, pv1, zt + 120), `<rect x="0" y="0" width="${2 * W - 16}" height="120" fill="rgba(208,234,244,0.4)" stroke="rgba(42,163,201,0.6)" stroke-width="1.4"/><path d="M20 0L60 0L10 80L0 80L0 30Z" fill="#ffffff" opacity="0.35"/><path d="M200 0L214 0L150 120L136 120Z" fill="#ffffff" opacity="0.25"/>`);
  s += box(o, -W, W, pv0, pv1, zt + 120, zt + 132, M.chrome, 1.2);
  s += box(o, -84, 84, pv0 + 1, pv1 - 1, zt + 132, zt + 168, M.white, 1.4);
  s += G_(faceV(o, -84, pv1 - 1, zt + 168), `<rect x="4" y="4" width="160" height="28" rx="4" fill="#ffffff" stroke="#2aa3c9" stroke-width="3"/><path d="M20 7L12 20H19L15 30L26 15H19L23 7Z" fill="#1d93ba"/>` + txt(96, 26, opts.sign ?? "FLASH LOAN", { size: 15, mono: true, anchor: "middle", fill: "#17809f", weight: 800, extra: `letter-spacing="1"` }));
  // counter body
  s += box(o, -W + 6, W - 6, -D + 6, D - 6, 0, 8, M.dark, 1.2);
  s += rbox(o, -W, W, -D, D, 8, H, 6, silver, { sw: 1.8 });
  let fp = "";
  for (let i = 0; i < 3; i++) { const x = 10 + i * ((2 * W - 20) / 3); fp += `<rect x="${f(x + 4)}" y="12" width="${f((2 * W - 20) / 3 - 8)}" height="${H - 34}" rx="4" fill="none" stroke="${darken(silver.s, 0.12)}" stroke-width="2"/>`; for (let k2 = 0; k2 < 6; k2++) fp += `<path d="M${f(x + 16 + k2 * 12)} 18V${H - 30}" stroke="#ffffff" stroke-width="1.2" opacity="0.45"/>`; }
  fp += `<circle cx="${W}" cy="${(H - 8) / 2}" r="24" fill="#ffffff" stroke="#1d93ba" stroke-width="3"/><path d="M${W + 3} ${(H - 8) / 2 - 17}L${W - 9} ${(H - 8) / 2 + 2}H${W - 1}L${W - 5} ${(H - 8) / 2 + 17}L${W + 10} ${(H - 8) / 2 - 3}H${W + 2}L${W + 7} ${(H - 8) / 2 - 17}Z" fill="${atk ? "#e0453a" : "#1d93ba"}"/>`;
  fp += `<rect x="0" y="${H - 18}" width="${2 * W}" height="10" fill="${darken(silver.s, 0.2)}"/>`;
  s += G_(faceV(o, -W, D, H), fp);
  s += G_(faceU(o, -W, -D, H), `<rect x="10" y="12" width="${2 * D - 20}" height="${H - 34}" rx="4" fill="none" stroke="${darken(silver.f, 0.12)}" stroke-width="2"/>`);
  s += rbox(o, -W - 8, W + 8, -D - 8, D + 8, H, zt, 4, M.steelLight, { sw: 1.6 });
  // bell
  s += cyl(o, W - 26, D - 16, 11, zt, zt + 3, M.ink, { seg: 18, sw: 1 }) + sphere(p + "-bell", o, W - 26, D - 16, zt + 10, 10, M.chrome) + cyl(o, W - 26, D - 16, 2, zt + 18, zt + 23, M.ink, { seg: 8, sw: 0.8 });
  // gold pile
  const layers = [
    { us: [-62, -20, 22], vs: [-20, 2] }, { us: [-41, 1], vs: [-20, 2] }, { us: [-20], vs: [-20, 2] }, { us: [-20], vs: [-9] },
  ];
  const bh = 13;
  layers.forEach((Ly, li) => {
    const z0 = zt + li * bh, bars = [];
    for (const u of Ly.us) for (const v of Ly.vs) bars.push({ key: dk(u + 20, v + 10), svg: box(o, u, u + 40, v, v + 20, z0, z0 + bh, M.gold, 1.1) + G_(faceTop(o, u + 6, v + 4, z0 + bh), `<rect x="0" y="0" width="28" height="12" rx="2" fill="none" stroke="${M.gold.s}" stroke-width="1.2"/>`) });
    bars.sort((a, b) => a.key - b.key);
    s += `<g id="${p}-pile-${li}" opacity="${opts.gold === false ? 0 : 1}">${bars.map((b) => b.svg).join("")}</g>`;
  });
  // transaction frame
  const fd = edges(o, -190, 190, -118, 118, 0, 260);
  s += `<path id="${p}-frame" d="${fd}" fill="none" stroke="#2aa3c9" stroke-width="4" stroke-linejoin="round" opacity="${opts.frame ? 1 : 0}"/>`;
  const anchors = {
    top: at(o, 0, pv0, zt + 210), counter: at(o, 0, 0, zt), pile: at(o, -20, 0, zt + 4 * bh + 10), center: at(o, 0, 0, H / 2), ground: at(o),
    frameTag: at(o, -190, 118, 260), frameId: `${p}-frame`, pileIds: [0, 1, 2, 3].map((i) => `${p}-pile-${i}`),
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-W - 8, W + 8, -D - 8, D + 8, 0, zt], [-W, W, pv0, pv1, zt, zt + 168]], center: anchors.center, glowR: 210 }), anchors };
}

// =====================================================================================
// 天平 balance — 不变量：黄铜立柱、刻度弧、秤杆（可倾斜）、两只吊盘
// 左盘：硬币堆（合约余额）；右盘：一叠存款单（存款之和）。tilt>0 = 左盘下沉（左重，正常）
// opts: tilt=6, glow 默认 true
// 可动：ID-beam（秤杆 rotator）+ ID-panL / ID-panR（跟随），用 KITX.tilt(tl, ID, t, deg) 驱动
// anchors: top, pivot, panL, panR（盘心上方，放标签）, panLlow / panRlow（盘下方）, foot（底座前沿，锚的图形放这里）, center, ground
// 打破不变量：KITX.tilt(tl,ID,t,-14) + KIT.broke(tl,ID,t,{ghost:1,badge:false})（立柱红虚线框）
// =====================================================================================
export function balance(o, opts = {}) {
  const p = opts.id ?? "bal", tilt = opts.tilt ?? 6;
  const br = { f: "#d6a64a", s: "#b58630", t: "#ecc778", st: "#7a5716" };
  const L = 120, zp = 236, zpan = 126;
  // beam plane runs along the plan direction whose projection is screen-horizontal (≈19.3° from +u),
  // so any tilt reads directly on screen
  const th = Math.atan2(-U[1], V[1]), cu_ = Math.cos(th), cv_ = Math.sin(th);
  const fD = (du, dv, z) => { const [x, y] = at(o, du, dv, z); return [cu_ * U[0] + cv_ * V[0], cu_ * U[1] + cv_ * V[1], 0, CE, x, y]; };
  const mB = fD(0, 0, zp);
  const PU = (sg) => sg * L * cu_, PV = (sg) => sg * L * cv_;
  // pan groups (built at tilt 0, translated by the runtime)
  const pan = (sg, load) => {
    const cu = PU(sg), cv = PV(sg), back = [], front = [];
    for (const a of [100, 220, 340]) {
      const rp = [cu + 40 * Math.cos(a * DEG), cv + 40 * Math.sin(a * DEG), zpan + 12];
      const ln = line3(o, [[cu, cv, zp - 2], rp], "#7a5716", 1.6);
      (Math.sin(a * DEG) < 0 ? back : front).push(ln);
    }
    let q = back.join("");
    q += frustum(o, cu, cv, 28, 44, zpan, zpan + 12, br, { sw: 1.6, top: false });
    q += flat(o, circlePlan(cu, cv, 43, 40), zpan + 12, "#e2bc6c", br.st, 1.6);
    q += flat(o, circlePlan(cu, cv, 32, 40), zpan + 6, "#d6ad58", "none");
    q += load;
    q += front.join("");
    return q;
  };
  let coins = "";
  for (const [du, dv, h] of [[-12, -14, 14], [10, -8, 22], [-14, 10, 10], [8, 14, 16]].sort((a, b) => dk(a[0], a[1]) - dk(b[0], b[1]))) coins += cyl(o, PU(-1) + du, PV(-1) + dv, 10, zpan + 8, zpan + 8 + h, M.gold, { seg: 18, sw: 1 }) + flat(o, circlePlan(PU(-1) + du, PV(-1) + dv, 6, 18), zpan + 8 + h, "none", M.gold.s, 1.1);
  let slips = "";
  for (let i = 0; i < 5; i++) slips += box(o, PU(1) - 22 + (i % 2) * 2, PU(1) + 20 + (i % 2) * 2, PV(1) - 15 + (i % 3), PV(1) + 15 + (i % 3), zpan + 8 + i * 3.4, zpan + 11 + i * 3.4, M.paper, 1);
  slips += G_(faceTop(o, PU(1) - 18, PV(1) - 11, zpan + 25.5), `<rect x="0" y="0" width="22" height="4" rx="2" fill="#2aa3c9"/><rect x="0" y="9" width="32" height="3" rx="1.5" fill="#cfc7b8"/><rect x="0" y="15" width="26" height="3" rx="1.5" fill="#cfc7b8"/>`);
  const shift = (deg, sg) => { const a = -deg * DEG, ex = sg * L * Math.cos(a) - sg * L, ey = sg * L * Math.sin(a); return [ex * mB[0] + ey * mB[2], ex * mB[1] + ey * mB[3]]; };
  const tL = shift(tilt, -1), tR = shift(tilt, 1);
  let s = contactShadow(o, 170, 90);
  s += `<g id="${p}-panR" transform="translate(${f(tR[0])},${f(tR[1])})">${pan(1, slips)}</g>`;
  // base + column
  s += rbox(o, -72, 72, -50, 50, 0, 14, 6, M.ink, { sw: 1.6 });
  s += frustum(o, 0, 0, 44, 26, 14, 34, br, { sw: 1.6 });
  s += cyl(o, 0, 0, 7, 34, zp - 10, br, { seg: 16, sw: 1.2 });
  s += cyl(o, 0, 0, 12, 120, 130, br, { seg: 20, sw: 1.2 }) + cyl(o, 0, 0, 10, zp - 30, zp - 22, br, { seg: 20, sw: 1.2 });
  // scale arc (fixed, behind the needle)
  let arc = `<path d="M${f(-58 * Math.sin(35 * DEG))} ${f(-58 * Math.cos(35 * DEG))}A58 58 0 0 1 ${f(58 * Math.sin(35 * DEG))} ${f(-58 * Math.cos(35 * DEG))}" fill="none" stroke="${br.s}" stroke-width="7" stroke-linecap="round"/>`;
  for (let i = -6; i <= 6; i++) { const a = i * 5.5 * DEG; arc += `<line x1="${f(52 * Math.sin(a))}" y1="${f(-52 * Math.cos(a))}" x2="${f((i === 0 ? 40 : 46) * Math.sin(a))}" y2="${f(-(i === 0 ? 40 : 46) * Math.cos(a))}" stroke="${i === 0 ? "#1f9d55" : C.ink}" stroke-width="${i === 0 ? 3 : 1.4}"/>`; }
  s += G_(matStr(fD(-4, -10, zp)), arc);
  s += box(o, -12, 12, -9, 9, zp - 22, zp + 6, br, 1.4);
  s += `<g id="${p}-panL" transform="translate(${f(tL[0])},${f(tL[1])})">${pan(-1, coins)}</g>`;
  // beam rotator (angle = −tilt)
  const beam = `<path d="M0 0L-3 -48L0 -56L3 -48Z" fill="${C.ink}"/><rect x="${-L}" y="-4.5" width="${2 * L}" height="9" rx="4.5" fill="${br.f}" stroke="${br.st}" stroke-width="1.6"/>
    <rect x="${-L + 8}" y="-2" width="${2 * L - 16}" height="2.4" rx="1.2" fill="${br.t}"/>
    ${[-1, 1].map((sg) => `<circle cx="${sg * L}" cy="0" r="8" fill="${br.s}" stroke="${br.st}" stroke-width="1.6"/><circle cx="${sg * L}" cy="0" r="3" fill="${br.st}"/>`).join("")}
    <circle cx="0" cy="0" r="10" fill="${br.t}" stroke="${br.st}" stroke-width="1.8"/><circle cx="0" cy="0" r="3.5" fill="${br.st}"/>`;
  s += `<use href="#${p}-beam" transform="translate(${f(-6 * V[0])},${f(-6 * V[1])})" style="filter:brightness(0.7)"/>`;
  s += rotator(`${p}-beam`, mB, 0, 0, -tilt, beam, `data-l="${L}" data-tilt="${tilt}"`);
  const anchors = {
    top: at(o, 0, 0, zp + 100), pivot: at(o, 0, 0, zp), panL: at(o, PU(-1), PV(-1), zpan + 70), panR: at(o, PU(1), PV(1), zpan + 70), panLlow: at(o, PU(-1), PV(-1), zpan - 30), panRlow: at(o, PU(1), PV(1), zpan - 30),
    foot: at(o, 0, 70, 0), center: at(o, 0, 0, 120), ground: at(o), beam: `${p}-beam`,
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [{ cyl: [0, 0, 14, 14, zp + 6] }, [-72, 72, -50, 50, 0, 14]], center: at(o, 0, 0, 160), glowR: 180, glowDefault: true }), anchors };
}

// =====================================================================================
// 牌子 signBoard — style:"wood"（插在地上的木牌，两根桩）| "plate"（立杆横臂下挂的白底青蓝框牌，六大类挂牌可用）
// opts: text, sub（第二行小字）, size=40, w（默认按字数）, z（牌底离地，默认 70）
// anchors: top, board（牌面中心）, center, ground
// =====================================================================================
export function signBoard(o, opts = {}) {
  const p = opts.id ?? "sign", style = opts.style ?? "wood", text = opts.text ?? "", size = opts.size ?? 40, sub = opts.sub;
  const cw = [...text].reduce((a, ch) => a + (/[\x00-\xff]/.test(ch) ? size * 0.6 : size), 0);
  const w = opts.w ?? Math.max(160, Math.ceil(cw + 64)), h = opts.h ?? Math.round(size + 40 + (sub ? size * 0.62 + 8 : 0));
  const z0 = opts.z ?? (style === "wood" ? 60 : 110), z1 = z0 + h;
  let s = contactShadow(o, w * 0.6, 50);
  const ty = 20 + size * 0.86;
  if (style === "wood") {
    const wd = M.wood;
    for (const su of [-(w / 2 - 34), w / 2 - 34]) s += box(o, su - 7, su + 7, -14, -4, 0, z1 - 8, wd, 1.4) + G_(faceTop(o, su - 7, -14, 0), `<path d="M0 0H14V10H0Z" fill="#6a4220" opacity="0.4"/>`);
    s += box(o, -w / 2, w / 2, -4, 4, z0, z1, wd, 1.6);
    let fc = `<rect x="0" y="0" width="${w}" height="${h}" fill="#c8945f"/>`;
    const planks = Math.max(2, Math.round(h / 34));
    for (let i = 1; i < planks; i++) fc += `<path d="M0 ${f((h * i) / planks)}H${w}" stroke="#8a5a2e" stroke-width="2"/>`;
    for (let i = 0; i < 5; i++) fc += `<path d="M${8 + ((i * 53) % (w - 40))} ${f(6 + ((i * 29) % (h - 12)))}q20 -3 40 0" fill="none" stroke="#b07c48" stroke-width="1.4"/>`;
    for (const su of [-(w / 2 - 34), w / 2 - 34]) for (const yy of [10, h - 10]) fc += `<circle cx="${f(su + w / 2)}" cy="${yy}" r="2.6" fill="#5a3a1c"/>`;
    fc += txt(w / 2, ty, text, { size, anchor: "middle", fill: "#2a1a0c" });
    if (sub) fc += txt(w / 2, ty + size * 0.62 + 8, sub, { size: Math.round(size * 0.55), anchor: "middle", fill: "#4a2e14", weight: 700 });
    s += G_(faceV(o, -w / 2, 4, z1), fc);
  } else {
    const pu = -w / 2 - 26;
    s += box(o, pu - 7, pu + 7, -7, 7, 0, z1 + 46, M.dark, 1.4) + box(o, pu - 12, pu + 12, -12, 12, 0, 6, M.dark, 1.2);
    s += box(o, pu - 7, w / 2 + 10, -4, 4, z1 + 34, z1 + 44, M.dark, 1.4);
    for (const cu of [-(w / 2 - 22), w / 2 - 22]) s += line3(o, [[cu, 0, z1 + 34], [cu, 0, z1]], "#4b4f56", 2.4, `stroke-dasharray="4 3"`);
    s += box(o, -w / 2, w / 2, -3, 3, z0, z1, M.white, 1.6);
    let fc = `<rect x="3" y="3" width="${w - 6}" height="${h - 6}" rx="5" fill="#ffffff" stroke="${opts.color ?? "#2aa3c9"}" stroke-width="5"/>`;
    fc += txt(w / 2, ty, text, { size, anchor: "middle", fill: opts.ink ?? C.ink });
    if (sub) fc += txt(w / 2, ty + size * 0.62 + 8, sub, { size: Math.round(size * 0.55), anchor: "middle", fill: "#17809f", weight: 700 });
    s += `<g id="${p}-face">${G_(faceV(o, -w / 2, 3, z1), fc)}</g>`;
  }
  const anchors = { top: at(o, 0, 0, z1 + (style === "wood" ? 50 : 90)), board: at(o, 0, 4, (z0 + z1) / 2), center: at(o, 0, 0, (z0 + z1) / 2), ground: at(o), w, h };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-w / 2, w / 2, -4, 4, z0, z1]], center: anchors.center, glowR: w * 0.6, badgeR: 26 }), anchors };
}

// =====================================================================================
// 时间锁 timeLock — 挂锁正面嵌一个计时表盘（青蓝剩余时间扇环 + 指针），顶上一枚计时旋钮
// opts: frac=0.75（剩余比例）, open=false（锁梁抬起）
// 可动：ID-arc / ID-hand（KITX.countdown）、ID-shackle（KITX.unlock）、ID-led（锁定红 / 解锁绿）
// anchors: top, dial, keyhole, center, ground
// =====================================================================================
export function timeLock(o, opts = {}) {
  const p = opts.id ?? "tlock", atk = isAtk(opts), frac = opts.frac ?? 0.75, open = !!opts.open;
  const bodyM = atk ? M.red : { f: "#c4c9cf", s: "#a3a9b1", t: "#dde0e4", st: "#5a6068" };
  const bw = 64, bd = 28, bh = 120;
  let s = contactShadow(o, 90, 50);
  const lift = open ? 26 : 0;
  const sh = `<path d="M-42 12V-34A42 42 0 0 1 42 -34V12" fill="none" stroke="#4b4f56" stroke-width="16"/><path d="M-42 12V-34A42 42 0 0 1 42 -34V12" fill="none" stroke="#d4d7db" stroke-width="6"/>`;
  s += `<g id="${p}-shackle" data-lift="${f(26 * CE)}" transform="translate(0,${f(-lift * CE)})">${G_(faceV(o, 0, 0, bh), sh)}</g>`;
  s += rbox(o, -bw, bw, -bd, bd, 0, bh, 12, bodyM, { sw: 2 });
  s += cyl(o, 36, -4, 9, bh, bh + 10, M.chrome, { seg: 20, sw: 1.2 }) + G_(faceTop(o, 36, -4, bh + 10), `<path d="M-6 0H6M0 -6V6" stroke="#5a6068" stroke-width="2"/>`);
  const FVm = frameV(o, -bw, bd, bh), cx = 64, cy = 50, Rr = 24, Cc = 2 * Math.PI * Rr;
  let fc = `<rect x="10" y="8" width="108" height="6" rx="3" fill="${lighten(bodyM.s, 0.22)}"/>
    <circle cx="${cx}" cy="${cy}" r="38" fill="#2b2d31" stroke="#141518" stroke-width="1.5"/><circle cx="${cx}" cy="${cy}" r="33" fill="#fffdf8"/>`;
  for (let i = 0; i < 12; i++) { const a = (i * 30 - 90) * DEG; fc += `<line x1="${f(cx + 28 * Math.cos(a))}" y1="${f(cy + 28 * Math.sin(a))}" x2="${f(cx + 32 * Math.cos(a))}" y2="${f(cy + 32 * Math.sin(a))}" stroke="${C.ink}" stroke-width="${i % 3 ? 1.2 : 2.6}"/>`; }
  fc += `<circle id="${p}-arc" cx="${cx}" cy="${cy}" r="${Rr}" fill="none" stroke="#2aa3c9" stroke-width="9" stroke-dasharray="${f(Cc)} ${f(Cc)}" stroke-dashoffset="${f(-Cc * (1 - frac))}" transform="rotate(-90 ${cx} ${cy})" data-c="${f(Cc)}" data-frac="${frac}" opacity="0.85"/>`;
  fc += `<circle cx="${cx}" cy="100" r="6.5" fill="#1d1f23"/><path d="M${cx - 3.5} 100L${cx + 3.5} 100L${cx + 2.5} 114L${cx - 2.5} 114Z" fill="#1d1f23"/>`;
  s += G_(matStr(FVm), fc);
  s += rotator(`${p}-hand`, FVm, cx, cy, (1 - frac) * 360, `<rect x="${cx - 2.2}" y="${cy - 30}" width="4.4" height="34" rx="2.2" fill="${C.ink}"/>`);
  const lp = applyM(FVm, 104, 102);
  s += G_(matStr(FVm), `<circle cx="${cx}" cy="${cy}" r="4.5" fill="#e0453a"/><circle cx="${cx}" cy="${cy}" r="1.8" fill="#ffffff"/>`) + ledSvg(`${p}-led`, lp[0], lp[1], 4, open ? "green" : "red");
  const anchors = { top: at(o, 0, 0, bh + 90), dial: applyM(FVm, cx, cy), keyhole: applyM(FVm, cx, 104), center: at(o, 0, 0, bh / 2), ground: at(o), hand: `${p}-hand`, arc: `${p}-arc` };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-bw, bw, -bd, bd, 0, bh]], center: anchors.center, glowR: 110, badgeR: 26 }), anchors };
}

/** catalogue: name → constructor */
export const CATALOG_EXT = { vending, miniVend, pipe, letter, mempool, sorter, bridge, firewall, flashDesk, balance, signBoard, timeLock };
/** browser runtime (window.KITX) — inline after iso.runtimeJs() */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
