// objects-ext.mjs — 第 04 章（重入）补充拟物物件（与 kit/objects.mjs 同一投影、同一接口）
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"
//   opts.glow = true 时脚下绿色地光；opts.scale 整体缩放（绕地面原点）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x
// 运行时动画助手在 runtime-ext.js（window.KITX04，并合并进 window.KITX），用 runtimeExtJs() 内联，放在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  CA, SA, SE, CE, U, V, f, f4, at, pts, M, C, lighten, darken, mat,
  frameV, frameU, frameTop, matStr, applyM, faceV, faceU, faceTop,
  box, rbox, cyl, frustum, flat, line3, circlePlan,
  glow, contactShadow, wireSvg, badgeSvg,
} from "../../kit/iso.mjs";
import { person, ledgerBook } from "../../kit/objects.mjs";

const DEG = Math.PI / 180;
const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const txt = (x, y, s, o = {}) =>
  `<text x="${f(x)}" y="${f(y)}" ${o.mono ? MONO : FONT} font-size="${o.size ?? 20}" font-weight="${o.weight ?? 900}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}" ${o.extra ?? ""}>${s}</text>`;
const mArr = (m) => m.map((v, i) => (i < 4 ? f4(v) : f(v))).join(",");
const P2 = (q) => `${f(q[0])},${f(q[1])}`;
function rotator(id, m, px, py, a, inner, extra = "") {
  const tr = `${matStr(m)} translate(${px} ${py}) rotate(${f(a)}) translate(${-px} ${-py})`;
  return `<g id="${id}" data-m="${mArr(m)}" data-px="${px}" data-py="${py}" data-a="${f(a)}" transform="${tr}" ${extra}>${inner}</g>`;
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
/** scale every [x,y] anchor about the ground origin */
function scaleAnchors(o, k, A) {
  if (k === 1) return A;
  const [ox, oy] = at(o);
  const sc = (v) => {
    if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number") return [ox + k * (v[0] - ox), oy + k * (v[1] - oy)];
    if (Array.isArray(v)) return v.map(sc);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([a, b]) => [a, sc(b)]));
    return v;
  };
  return sc(A);
}
const isAtk = (opts) => opts.state === "attacker";
const RED = { f: "#e8574c", s: "#c23a30", t: "#f08a80", st: "#8f2620" };
const TEAL = { f: "#5cc0e0", s: "#3a9ec2", t: "#9ad9ee", st: "#1f7896" };
const GOLD = M.gold;
const chromeGrad = (id, vertical = true) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="#f4f5f6"/><stop offset="0.5" stop-color="#c3c7cc"/><stop offset="1" stop-color="#7d828a"/></linearGradient></defs>`;
/** world-canvas path of a local-frame rectangle (for broken wire frames) */
const rectPath = (m, x0, y0, x1, y1) => `M${[[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map((q) => P2(applyM(m, q[0], q[1]))).join("L")}Z`;
const scaleM = (m, k) => [m[0] * k, m[1] * k, m[2] * k, m[3] * k, m[4], m[5]];

// runtime geometry shared with the browser (evaluated once in Node, so static SVG = runtime state)
const RT = (() => { const w = {}; new Function("window", fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8"))(w); return w.KITX04; })();

// =====================================================================================
// 定位助手：ep01 vending / miniVend 的第 i 个按钮、ep03 contractMachine 的出件斜槽 → {o:{u,v}, z, scale}
// 用法：const b = vendButton(vmOrigin, 0); hasp(b.o, { id:"h0", z:b.z, scale:b.scale })
// =====================================================================================
export function vendButton(oVm, i, scale = 1) { return { o: { u: oVm.u + 72 * scale, v: oVm.v + 75 * scale }, z: (168 - 19 * i) * scale, scale }; }
export function miniButton(oMv, i, scale = 1) { return { o: { u: oMv.u + 38 * scale, v: oMv.v + 45 * scale }, z: (108 - 18 * i) * scale, scale: 0.8 * scale }; }
export function machineOut(oM) { return { o: { u: oM.u + 50, v: oM.v + 134 }, z: 18 }; }

// =====================================================================================
// 回调弹簧臂 callbackArm — 攻击合约的 receive：红色底座（顶上接币托盘）+ 钢弹簧 + 红色剪刀伸缩臂 + 指着的小红手
// opts: target=[x,y]（世界画布点，手指尖要按到的位置，如 vending anchors.buttons[0]）, s=0（0 收起 / 1 伸到目标）,
//       coin=false（托盘里一枚硬币）, maxReach（运行时会换更远目标时给）, scale=1
// 可动：ID-arm（KITX04.callArm / armPress，伸缩 + 换目标）、ID-coin（托盘硬币，opacity）
// anchors: top, center, ground, mount（弹簧根部）, pan（接币托盘）, tip（当前指尖）
// =====================================================================================
export function callbackArm(o, opts = {}) {
  const p = opts.id ?? "cb", k = opts.scale ?? 1, broken = opts.state === "broken";
  const R = RED;
  let s = contactShadow(o, 62, 48);
  s += box(o, -38, 38, -32, 32, 0, 8, M.ink, 1.2);
  s += rbox(o, -33, 33, -27, 27, 8, 64, 6, R, { sw: 1.8 });
  // front (+v) panel: callback-arrow plate, vents, bolts
  s += G_(faceV(o, -33, 27, 64), `<rect x="5" y="7" width="34" height="30" rx="3" fill="#fbe3e0" stroke="${R.st}" stroke-width="1.6"/>
    <path d="M13 31V19A9 9 0 0 1 31 19V25" fill="none" stroke="${R.s}" stroke-width="3.6" stroke-linecap="round"/><path d="M26 21L31 27L36 21" fill="none" stroke="${R.s}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="45" y="${9 + i * 7}" width="14" height="3" rx="1.5" fill="${R.st}" opacity="0.7"/>`).join("")}
    ${[[4, 46], [60, 46], [4, 4], [60, 4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="${R.t}" stroke="${R.st}" stroke-width="0.8"/>`).join("")}
    <rect x="5" y="42" width="54" height="6" rx="3" fill="${R.st}" opacity="0.35"/>`);
  s += G_(faceU(o, -33, -27, 64), `<rect x="8" y="10" width="38" height="30" rx="3" fill="none" stroke="${R.st}" stroke-width="1.4" opacity="0.6"/>`);
  // catch pan (−u side) + trigger rod
  s += cyl(o, -12, -2, 19, 64, 70, M.chrome, { seg: 28, sw: 1.2 });
  s += flat(o, circlePlan(-12, -2, 14.5, 28), 70, "#3b3e44", "#24262a", 1);
  s += `<g id="${p}-coin" opacity="${opts.coin ? 1 : 0}">${cyl(o, -12, -2, 9, 70, 74, GOLD, { seg: 20, sw: 1.1 })}${flat(o, circlePlan(-12, -2, 5.5, 20), 74, "none", GOLD.s, 1.2)}</g>`;
  s += line3(o, [[6, -2, 68], [14, -2, 76]], "#2b2d31", 3.4);
  // mount tower (+u side) + hub
  s += box(o, 8, 30, -13, 13, 64, 92, R, 1.4);
  const mz = 82, mount = at(o, 19, 13, mz);
  s += G_(faceV(o, 19, 13.5, mz), `<circle cx="0" cy="0" r="9.5" fill="url(#${p}-cg)" stroke="#4b4f56" stroke-width="1.4"/><circle cx="0" cy="0" r="3.4" fill="#2b2d31"/>`) + chromeGrad(p + "-cg");
  // arm (runtime recomputes it per frame)
  const target = opts.target ?? [mount[0] + 170, mount[1] - 110];
  const [ox, oy] = at(o);
  const Tl = [ox + (target[0] - ox) / k, oy + (target[1] - oy) / k];
  const Dt = Math.hypot(Tl[0] - mount[0], Tl[1] - mount[1]);
  const LB = 30, GL = 36, DR = 24;
  const maxR = Math.max((opts.maxReach ?? 0) / k, Dt, 120);
  const N = Math.max(3, Math.ceil((maxR - GL - 30) / (LB * 0.9)));
  const P = { mx: mount[0], my: mount[1], ox, oy, k, n: N, lb: LB, gl: GL, dr: DR };
  const s0 = opts.s ?? 0;
  const Gm = RT.armGeom(P, s0, target[0], target[1]);
  const glove = `<rect x="-3" y="-8" width="10" height="16" rx="3" fill="#fbe3e0" stroke="${R.st}" stroke-width="1.6"/>
    <path d="M6 -6H20Q27 -6 27 1V14Q27 20 20 20H6Z" fill="${R.f}" stroke="${R.st}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M27 3q4.5 0 4.5 4t-4.5 4M27 11q4 0 4 3.5t-4 3.5" fill="${R.s}" stroke="${R.st}" stroke-width="1.5"/>
    <rect x="18" y="-3.6" width="18" height="7.2" rx="3.6" fill="${R.f}" stroke="${R.st}" stroke-width="1.8"/>
    <path d="M9 -6Q10 -13 17 -11" fill="none" stroke="${R.st}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M9 -2.5H22" stroke="${R.t}" stroke-width="2.2" stroke-linecap="round"/><path d="M24 -1H33" stroke="${R.t}" stroke-width="1.6" stroke-linecap="round"/>`;
  s += `<g id="${p}-arm" data-mx="${f(P.mx)}" data-my="${f(P.my)}" data-ox="${f(ox)}" data-oy="${f(oy)}" data-k="${k}" data-n="${N}" data-lb="${LB}" data-gl="${GL}" data-dr="${DR}" data-s="${s0}" data-tx="${f(target[0])}" data-ty="${f(target[1])}">
    <path id="${p}-arm-spring" d="${Gm.spring}" fill="none" stroke="#3b3e44" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path id="${p}-arm-spring-hi" d="${Gm.spring}" fill="none" stroke="#d4d7db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path id="${p}-arm-plate0" d="${Gm.plate0}" stroke="#2b2d31" stroke-width="7" stroke-linecap="round"/>
    <path id="${p}-arm-bars" d="${Gm.bars}" fill="none" stroke="${R.st}" stroke-width="7" stroke-linecap="round"/>
    <path id="${p}-arm-bars-hi" d="${Gm.bars}" fill="none" stroke="${R.f}" stroke-width="3.4" stroke-linecap="round"/>
    <path id="${p}-arm-pins" d="${Gm.pins}" fill="#eceef0" stroke="#2b2d31" stroke-width="1"/>
    <path id="${p}-arm-plateN" d="${Gm.plateN}" stroke="#2b2d31" stroke-width="7" stroke-linecap="round"/>
    <g id="${p}-arm-hand" transform="${Gm.hand}">${glove}</g></g>`;
  const anchors = { top: at(o, 0, 0, 150), center: at(o, 0, 0, 40), ground: at(o), mount, pan: at(o, -12, -2, 72), tip: [ox + (Gm.tip[0] - ox) / k, oy + (Gm.tip[1] - oy) / k] };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-38, 38, -32, 32, 0, 64], [8, 30, -13, 13, 64, 92]], center: anchors.center, badgeR: 24, glowR: 90 }), anchors: scaleAnchors(o, k, anchors) };
}

// =====================================================================================
// 银行柜台 tellerCounter — 柜员比喻：木质柜台 + 石材台面 + 玻璃隔板（两个窗口，传声孔 + 拱形递钞口）+ 递钞槽；
//   台后柜员（kit person engineer），台面上一叠绿色现金、摊开的账本、柜员的笔；右侧立柱上一根金库库存管
// opts: teller=true, cash=3（台面现金叠数）, penDown=false, stock=1（库存 0..1）, sign="BANK"
// 可动：ID-cash-0..3（KITX04.cashOut 从递钞槽滑到顾客侧）、ID-pen（KITX04.pen 落笔/抬笔，落笔时 ID-pen-mark 出现）、
//       ID-stock（KITX04.stock 库存管液位，≤0.05 变红）
// anchors: top, center, ground, teller（柜员头）, ledger（账本页面）, pen（笔尖落点）, slot（顾客侧递钞口）, cashOut（现金落点）,
//          customer（顾客站位地面点）, window2（第二个窗口）, stock
// =====================================================================================
export function tellerCounter(o, opts = {}) {
  const p = opts.id ?? "tc", atk = isAtk(opts), k = opts.scale ?? 1;
  const wood = atk ? mat("#c9463c") : { f: "#b98454", s: "#956236", t: "#d0a172", st: "#6a4220" };
  const stone = { f: "#ece7dd", s: "#d8d0c2", t: "#f8f5f0", st: "#a39a8a" };
  const bill = { f: "#7cc79a", s: "#58a87a", t: "#a6dcb9", st: "#2f7a4f" };
  const zTop = 116, vG = 4, zG = 290, w1 = -115, w2 = 115;
  let s = "";
  // teller (behind)
  let tellerA = null;
  if (opts.teller !== false) { const t = person({ u: o.u + w1, v: o.v - 108 }, { id: p + "-teller", role: "engineer", scale: 1.0 }); s += t.svg; tellerA = t.anchors; }
  s += contactShadow(o, 300, 110, 0, 10);
  // body
  s += box(o, -226, 226, -46, 66, 0, 10, M.ink, 1.2);
  s += box(o, -230, 230, -50, 70, 10, 104, wood, 1.8);
  const FV = frameV(o, -230, 70, 104);
  let fr = `<rect x="0" y="4" width="460" height="7" fill="${darken(wood.s, 0.12)}"/>`;
  for (let i = 0; i < 4; i++) {
    const x0 = 12 + i * 112, w = 100;
    fr += `<rect x="${x0}" y="18" width="${w}" height="66" rx="3" fill="${lighten(wood.s, 0.06)}" stroke="${darken(wood.s, 0.3)}" stroke-width="1.6"/>
      <path d="M${x0 + 2} ${84 - 2}V20H${x0 + w - 2}" fill="none" stroke="${lighten(wood.s, 0.32)}" stroke-width="2"/>
      <rect x="${x0 + 10}" y="28" width="${w - 20}" height="46" rx="2" fill="none" stroke="${darken(wood.s, 0.18)}" stroke-width="1.2"/>`;
  }
  fr += `<rect x="196" y="36" width="68" height="24" rx="3" fill="#d6a64a" stroke="#7a5716" stroke-width="1.4"/>` + txt(230, 53, opts.sign ?? "BANK", { size: 14, mono: true, anchor: "middle", fill: "#4a3510", weight: 800 });
  s += G_(matStr(FV), fr);
  s += G_(faceU(o, -230, -50, 104), `<rect x="10" y="18" width="100" height="66" rx="3" fill="none" stroke="${darken(wood.f, 0.25)}" stroke-width="1.6"/>`);
  // stone top
  s += box(o, -238, 238, -58, 80, 104, zTop, stone, 1.6);
  // deal trays (cash slots) under each window
  for (const uc of [w1, w2]) {
    s += flat(o, [[uc - 34, -16], [uc + 34, -16], [uc + 34, 44], [uc - 34, 44]], zTop + 0.2, "#c3c8ce", "#5a6068", 1.4);
    s += flat(o, [[uc - 26, -10], [uc + 26, -10], [uc + 26, 38], [uc - 26, 38]], zTop + 0.3, "#9aa0a8", "#6e737b", 1);
    s += line3(o, [[uc - 26, 30, zTop + 0.4], [uc + 26, 30, zTop + 0.4]], "#7d828a", 1.2);
  }
  // teller-side items: cash pile + ledger
  const nC = opts.cash ?? 3;
  const bundle = (cu, cv, z) => box(o, cu - 22, cu + 22, cv - 11, cv + 11, z, z + 7, bill, 1.1) +
    flat(o, [[cu - 4, cv - 11], [cu + 4, cv - 11], [cu + 4, cv + 11], [cu - 4, cv + 11]], z + 7.1, "#fffdf8", "none") +
    G_(faceV(o, cu - 4, cv + 11, z + 7), `<rect x="0" y="0" width="8" height="7" fill="#f2efe6"/>`) +
    G_(faceTop(o, cu - 18, cv - 7, z + 7.1), `<circle cx="7" cy="7" r="4" fill="none" stroke="${bill.st}" stroke-width="1" opacity="0.6"/>`);
  for (let i = 0; i < nC; i++) s += bundle(-188 + (i % 2) * 3, -24, zTop + i * 7);
  const lift = (inner, z) => `<g transform="translate(0,${f(-z * CE)})">${inner}</g>`;
  const lg = ledgerBook({ u: o.u - 40, v: o.v - 26 }, { id: p + "-ledger", scale: 0.34 });
  s += lift(lg.svg, zTop);
  // pen mark on the ledger (appears when the pen lands)
  const penPt = at(o, -40 + 22, -26 + 6, zTop + 8);
  s += `<g id="${p}-pen-mark" opacity="${opts.penDown ? 1 : 0}">${line3(o, [[-40 + 8, -26 + 6, zTop + 8.4], [-40 + 22, -26 + 6, zTop + 8.4]], "#1d93ba", 2.4)}${line3(o, [[-40 + 8, -26 - 4, zTop + 8.4], [-40 + 26, -26 - 4, zTop + 8.4]], "#e0453a", 1.6)}</g>`;
  // glass partition (posts, panes with arch slot + speak grill), header
  const postM = { f: "#c3c8ce", s: "#a3a9b1", t: "#dfe2e5", st: "#5a6068" };
  s += box(o, -236, -226, -2, 10, zTop, zG, postM, 1.3);
  s += box(o, -5, 5, -2, 10, zTop, zG, postM, 1.3);
  for (const uc of [w1, w2]) {
    const m = frameV(o, uc - 110, vG, zG), W = 220, H = zG - zTop;
    const arch = `M${W / 2 - 34} ${H}V${H - 10}A34 20 0 0 1 ${W / 2 + 34} ${H - 10}V${H}Z`;
    let g = `<path d="M0 0H${W}V${H}H0Z ${arch}" fill="rgba(214,238,246,0.26)" fill-rule="evenodd" stroke="rgba(42,163,201,0.55)" stroke-width="1.6"/>`;
    g += `<path d="${arch}" fill="none" stroke="#7d828a" stroke-width="2.4"/>`;
    g += `<path d="M18 0L52 0L6 64L0 64L0 26Z" fill="#ffffff" opacity="0.26"/><path d="M70 0L82 0L24 ${H - 30}L12 ${H - 30}Z" fill="#ffffff" opacity="0.16"/>`;
    // speak grill
    let holes = "";
    for (let r = 0; r < 3; r++) for (let i = 0; i < [1, 6, 12][r]; i++) { const a = (2 * Math.PI * i) / [1, 6, 12][r], rr = r * 6; holes += `<circle cx="${f(W / 2 + rr * Math.cos(a))}" cy="${f(62 + rr * Math.sin(a))}" r="1.6" fill="#5a6068"/>`; }
    g += `<circle cx="${W / 2}" cy="62" r="20" fill="rgba(255,255,255,0.18)" stroke="#9aa0a8" stroke-width="3"/>${holes}`;
    s += G_(matStr(m), g);
  }
  s += box(o, 226, 236, -2, 10, zTop, zG, postM, 1.3);
  const hdr = atk ? mat("#b8392f") : { f: "#1f7896", s: "#17637c", t: "#3d97b5", st: "#0e4252" };
  s += box(o, -240, 240, -6, 14, zG, zG + 24, hdr, 1.5);
  s += G_(faceV(o, -240, 14, zG + 24), [[w1 + 240, "1"], [w2 + 240, "2"]].map(([x, n]) => `<rect x="${x - 15}" y="4" width="30" height="16" rx="3" fill="#ffffff"/>` + txt(x, 17, n, { size: 13, mono: true, anchor: "middle", weight: 800, fill: "#155e77" })).join("") +
    `<rect x="${240 - 46}" y="6" width="92" height="12" rx="2" fill="${lighten(hdr.s, 0.12)}"/>` + txt(240, 16, "· 柜 台 ·", { size: 10, anchor: "middle", fill: "#ffffff", weight: 700 }));
  // stock tube on the right post
  const sm = frameV(o, 231 - 8, 11, 262), SH = 124, sv = Math.max(0, Math.min(1, opts.stock ?? 1));
  s += G_(matStr(sm), `<rect x="0" y="0" width="16" height="${SH + 6}" rx="5" fill="#2b2d31" stroke="#1d1f23" stroke-width="1.2"/>
    <rect x="3" y="3" width="10" height="${SH}" rx="3" fill="#0f2a33"/>
    <rect id="${p}-stock" x="3" y="${f(3 + SH * (1 - sv))}" width="10" height="${f(SH * sv)}" rx="3" fill="${sv <= 0.05 ? "#e0453a" : "#3fb877"}" data-yb="${3 + SH}" data-h="${SH}" data-v="${sv}"/>
    ${[0.25, 0.5, 0.75].map((q) => `<path d="M3 ${f(3 + SH * q)}h4" stroke="#ffffff" stroke-width="1" opacity="0.6"/>`).join("")}
    <rect x="4" y="5" width="2.4" height="${SH - 6}" rx="1.2" fill="#ffffff" opacity="0.28"/>
    <circle cx="8" cy="${SH + 16}" r="7" fill="#d6a64a" stroke="#7a5716" stroke-width="1.2"/><path d="M8 ${SH + 12}v8M5 ${SH + 14}h6" stroke="#7a5716" stroke-width="1.4"/>`);
  // pen (hovering over the ledger)
  const lift0 = 42;
  const pt = [penPt[0], penPt[1] - lift0 * CE];
  const dx = 0.42, dy = -1;
  const along = (d, n = 0) => [pt[0] + dx * d + n, pt[1] + dy * d];
  const pen = `<path d="M${P2(pt)}L${P2(along(9, -2.6))}L${P2(along(9, 2.6))}Z" fill="#c3c8ce" stroke="#4b4f56" stroke-width="1"/>
    <line x1="${f(along(8)[0])}" y1="${f(along(8)[1])}" x2="${f(along(52)[0])}" y2="${f(along(52)[1])}" stroke="#1d1f23" stroke-width="7" stroke-linecap="round"/>
    <line x1="${f(along(10)[0] - 1.5)}" y1="${f(along(10)[1])}" x2="${f(along(50)[0] - 1.5)}" y2="${f(along(50)[1])}" stroke="#4a4d53" stroke-width="2" stroke-linecap="round"/>
    <line x1="${f(along(36)[0] + 4)}" y1="${f(along(36)[1])}" x2="${f(along(50)[0] + 4)}" y2="${f(along(50)[1])}" stroke="#d4d7db" stroke-width="2" stroke-linecap="round"/>
    <line x1="${f(along(40)[0])}" y1="${f(along(40)[1])}" x2="${f(along(42)[0])}" y2="${f(along(42)[1])}" stroke="#1d93ba" stroke-width="7.4"/>`;
  const pdy = f(lift0 * CE);
  s += `<g id="${p}-pen" data-dy="${pdy}" data-y="${opts.penDown ? pdy : 0}" transform="translate(0,${opts.penDown ? pdy : 0})">${pen}</g>`;
  // moving cash bundles (hidden), slot → customer side, stacking
  let cash = "";
  for (let i = 0; i < 4; i++) {
    const a = at(o, w1, -6, zTop + 0.5), b = at(o, w1 + ((i % 2) * 6 - 3), 58, zTop + 0.5 + i * 7);
    cash += `<g id="${p}-cash-${i}" opacity="0" data-dx="${f(b[0] - a[0])}" data-dy="${f(b[1] - a[1])}">${bundle(w1, -6, zTop + 0.5)}</g>`;
  }
  s += `<g id="${p}-cash">${cash}</g>`;
  const anchors = {
    top: at(o, 0, 0, zG + 80), center: at(o, 0, 0, 120), ground: at(o), teller: tellerA ? tellerA.head : at(o, w1, -108, 200),
    ledger: at(o, -40, -26, zTop + 10), pen: penPt, slot: at(o, w1, 40, zTop + 4), cashOut: at(o, w1, 58, zTop + 14),
    customer: at(o, w1 - 175, 130, 0), window2: at(o, w2, vG, 190), window1: at(o, w1, vG, 190), stock: applyM(sm, 8, SH / 2),
  };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-238, 238, -58, 80, 0, zTop], [-240, 240, -6, 14, zTop, zG + 24]], center: anchors.center, glowR: 300, badgeR: 36 }), anchors: scaleAnchors(o, k, anchors) };
}

// =====================================================================================
// 函数锁扣 hasp — 钢制搭扣（铰链片 + 可翻转的扣板 + 锁鼻）+ 小挂锁，扣在机器正面（+v 面）的某个按钮上
// 原点 o + opts.z = 被盖住的按钮中心（用 vendButton / miniButton 算）。
// opts: z, locked=true, transient=false（瞬态锁：半透明玻璃锁体 + 内嵌小沙漏 + "EIP-1153" 铭牌）, plate=true（瞬态锁铭牌）,
//       shared=false + chainTo=[x,y] 或 [[x,y],…]（铁链连到别的锁扣/按钮；可串多点）, chainShown=true, scale=1
// 可动：ID-strap（扣板，绕左侧铰链转动）、ID-lock（挂锁）、ID-shackle（锁梁）→ KITX04.hasp(tl,ID,t,locked)；
//       ID-chain / ID-chain-k（KITX04.chainOn 逐节出现）；瞬态锁 ID-hsT / ID-hsBc / ID-hsS（KITX04.haspSand 沙漏流动）
// anchors: top, center（按钮）, ground, lock（锁体中心）, eye（铁链起点）, strapTip, plate, chainEnd（链子末端）
// =====================================================================================
export function haspChain(id, Pts, opts = {}) {
  const shown = opts.shown !== false, L = opts.link ?? 9;
  let links = "", j = 0;
  for (let si = 0; si + 1 < Pts.length; si++) {
    const A = Pts[si], B = Pts[si + 1], len = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const sag = opts.sag ?? Math.min(70, len * 0.14) * (1 - Math.abs(B[1] - A[1]) / (len + 1));
    const Cq = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + 2 * sag];
    const Q = (t) => [(1 - t) ** 2 * A[0] + 2 * (1 - t) * t * Cq[0] + t * t * B[0], (1 - t) ** 2 * A[1] + 2 * (1 - t) * t * Cq[1] + t * t * B[1]];
    const smp = Array.from({ length: 121 }, (_, i) => Q(i / 120));
    const cum = [0]; for (let i = 1; i < smp.length; i++) cum.push(cum[i - 1] + Math.hypot(smp[i][0] - smp[i - 1][0], smp[i][1] - smp[i - 1][1]));
    const tot = cum[cum.length - 1], n = Math.max(2, Math.round(tot / L));
    for (let q = 0; q < n; q++) {
      const d = ((q + 0.5) * tot) / n; let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
      const a = smp[i - 1], b = smp[i], tt = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
      const c = [a[0] + (b[0] - a[0]) * tt, a[1] + (b[1] - a[1]) * tt], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) / DEG;
      const ring = j % 2 === 0
        ? `<ellipse cx="0" cy="0" rx="${f(L * 0.72)}" ry="${f(L * 0.42)}" fill="none" stroke="#2b2d31" stroke-width="3.6"/><ellipse cx="0" cy="0" rx="${f(L * 0.72)}" ry="${f(L * 0.42)}" fill="none" stroke="#c3c8ce" stroke-width="1.7"/><path d="M${f(-L * 0.4)} ${f(-L * 0.36)}H${f(L * 0.3)}" stroke="#ffffff" stroke-width="1" opacity="0.8"/>`
        : `<rect x="${f(-L * 0.78)}" y="-2" width="${f(L * 1.56)}" height="4" rx="2" fill="#a9aeb5" stroke="#2b2d31" stroke-width="1.2"/>`;
      links += `<g id="${id}-chain-${j}" opacity="${shown ? 1 : 0}" transform="translate(${f(c[0])},${f(c[1])}) rotate(${f(ang)})">${ring}</g>`;
      j++;
    }
  }
  return { svg: `<g id="${id}-chain" data-n="${j}">${links}</g>`, n: j, end: Pts[Pts.length - 1] };
}
export function hasp(o, opts = {}) {
  const p = opts.id ?? "hasp", k = opts.scale ?? 1, z = opts.z ?? 150, atk = isAtk(opts), tr = !!opts.transient;
  const locked = opts.locked !== false, aOpen = -118;
  const F = scaleM(frameV(o, 0, 2, z), k), FS = matStr(F);
  const st = atk ? { fill: "#e8574c", hi: "#f6b0a8", st: "#8f2620", dk: "#a8322a" }
    : tr ? { fill: "rgba(92,192,224,0.34)", hi: "rgba(255,255,255,0.7)", st: "#1d93ba", dk: "rgba(29,147,186,0.6)" }
      : { fill: "#9aa0a8", hi: "#e3e6e9", st: "#3b3e44", dk: "#6e737b" };
  const screw = (x, y) => `<circle cx="${x}" cy="${y}" r="2" fill="#d4d7db" stroke="#4b4f56" stroke-width="0.8"/><path d="M${x - 1.3} ${y - 1.3}L${x + 1.3} ${y + 1.3}" stroke="#4b4f56" stroke-width="0.8"/>`;
  let s = "";
  // fixed leaves
  s += G_(FS, `<rect x="-33" y="-11" width="13" height="22" rx="2" fill="${tr ? st.fill : "#7d828a"}" stroke="${st.st}" stroke-width="1.2"/>${screw(-27, -5)}${screw(-27, 5)}
    <rect x="19" y="-11" width="12" height="22" rx="2" fill="${tr ? st.fill : "#7d828a"}" stroke="${st.st}" stroke-width="1.2"/>${screw(25, -8)}${screw(25, 8)}`);
  // strap (rotator about the hinge pin)
  const strap = `<rect x="-22" y="-6" width="56" height="15" rx="3.5" fill="rgba(0,0,0,0.22)" transform="translate(1.5,2.2)"/>
    <rect x="-24" y="-8" width="57" height="16" rx="3.5" fill="${st.fill}" stroke="${st.st}" stroke-width="1.5"/>
    <rect x="-19" y="-6.2" width="46" height="3" rx="1.5" fill="${st.hi}"/>
    <path d="M-12 3.5H14" stroke="${st.dk}" stroke-width="1.6" stroke-linecap="round"/>
    <rect x="21" y="-4.6" width="8" height="9.2" rx="2" fill="#1d1f23"/>`;
  s += rotator(`${p}-strap`, F, -21, 0, locked ? 0 : aOpen, strap, `data-open="${aOpen}"`);
  s += G_(FS, `<circle cx="-21" cy="0" r="4.6" fill="url(#${p}-cg)" stroke="#2b2d31" stroke-width="1.2"/><circle cx="-21" cy="0" r="1.4" fill="#2b2d31"/>
    <rect x="22" y="-5" width="6" height="10" rx="3" fill="none" stroke="#2b2d31" stroke-width="3.4"/><rect x="22" y="-5" width="6" height="10" rx="3" fill="none" stroke="#e3e6e9" stroke-width="1.5"/>`) + chromeGrad(p + "-cg");
  // padlock
  const by0 = 12, by1 = tr ? 46 : 31, bx0 = tr ? 11 : 15, bx1 = tr ? 39 : 35;
  const shackle = `<path d="M21 ${by0 + 3}V1A4 4 0 0 1 29 1V${by0 + 3}" fill="none" stroke="#2b2d31" stroke-width="4.6"/><path d="M21 ${by0 + 3}V1A4 4 0 0 1 29 1V${by0 + 3}" fill="none" stroke="#d4d7db" stroke-width="2"/>`;
  let body;
  if (tr) {
    const yN = 29, y0 = 21;
    body = `<rect x="${bx0}" y="${by0}" width="${bx1 - bx0}" height="${by1 - by0}" rx="4" fill="rgba(170,224,240,0.38)" stroke="#1d93ba" stroke-width="1.6" stroke-dasharray="3 2"/>
      <rect x="${bx0 + 2}" y="${by0 + 2}" width="4" height="${by1 - by0 - 4}" rx="2" fill="#ffffff" opacity="0.5"/>
      <rect x="16" y="15" width="18" height="2.6" rx="1" fill="#b98454" stroke="#6a4220" stroke-width="0.6"/><rect x="16" y="40.4" width="18" height="2.6" rx="1" fill="#b98454" stroke="#6a4220" stroke-width="0.6"/>
      <defs><clipPath id="${p}-hsTc"><rect id="${p}-hsT" x="16" y="${y0}" width="18" height="${yN - y0}" data-y0="${y0}" data-y1="${yN}"/></clipPath>
        <clipPath id="${p}-hsBcc"><rect id="${p}-hsBc" x="16" y="36" width="18" height="4.6" data-yb0="36" data-yb1="31" data-yf="40.6"/></clipPath></defs>
      <path d="M18.6 17.6H31.4L25.6 ${yN}L31.4 40.4H18.6L24.4 ${yN}Z" fill="rgba(255,255,255,0.35)" stroke="#1d93ba" stroke-width="1"/>
      <path d="M19.4 18.4H30.6L25 ${yN}Z" fill="#d8b479" clip-path="url(#${p}-hsTc)"/>
      <path d="M18.8 40.4H31.2L25 31Z" fill="#d8b479" clip-path="url(#${p}-hsBcc)"/>
      <path id="${p}-hsS" d="M25 ${yN}V40" stroke="#c9a463" stroke-width="1.2" opacity="0"/>`;
  } else {
    const bm = atk ? { f: "#e8574c", t: "#f6b0a8", st: "#8f2620" } : { f: "#c4c9cf", t: "#e3e6e9", st: "#5a6068" };
    body = `<rect x="${bx0 + 1.5}" y="${by0 + 2}" width="${bx1 - bx0}" height="${by1 - by0}" rx="3.5" fill="rgba(0,0,0,0.22)"/>
      <rect x="${bx0}" y="${by0}" width="${bx1 - bx0}" height="${by1 - by0}" rx="3.5" fill="${bm.f}" stroke="${bm.st}" stroke-width="1.5"/>
      <rect x="${bx0 + 2.5}" y="${by0 + 2}" width="${bx1 - bx0 - 5}" height="3" rx="1.5" fill="${bm.t}"/>
      <circle cx="25" cy="${by0 + 9}" r="2.4" fill="#1d1f23"/><path d="M24 ${by0 + 9}h2l0.6 6h-3.2Z" fill="#1d1f23"/>`;
  }
  const eyeY = by1 + 3;
  const eye = opts.shared ? `<circle cx="25" cy="${eyeY}" r="3.2" fill="none" stroke="#2b2d31" stroke-width="2.6"/><circle cx="25" cy="${eyeY}" r="3.2" fill="none" stroke="#c3c8ce" stroke-width="1.1"/>` : "";
  s += G_(FS, `<g id="${p}-lock" opacity="${locked ? 1 : 0}"><g id="${p}-shackle" transform="translate(0,${locked ? 0 : -7})">${shackle}</g>${body}${eye}</g>`);
  if (tr && opts.plate !== false) s += G_(FS, `<rect x="42" y="-8" width="48" height="16" rx="2.5" fill="#155e77" stroke="#0e4252" stroke-width="1"/>` + txt(66, 3.4, "EIP-1153", { size: 8.4, mono: true, anchor: "middle", fill: "#ffffff", weight: 800 }) +
    `<circle cx="45" cy="-5" r="1" fill="#9ad9ee"/><circle cx="87" cy="-5" r="1" fill="#9ad9ee"/>`);
  const anchors = {
    top: applyM(F, 0, -60), center: applyM(F, 0, 0), ground: at(o), lock: applyM(F, 25, (by0 + by1) / 2), eye: applyM(F, 25, eyeY + 3),
    strapTip: applyM(F, 33, 0), plate: applyM(F, 66, 0), chainEnd: null,
  };
  let over = "";
  if (opts.shared && opts.chainTo) {
    const tgt = Array.isArray(opts.chainTo[0]) ? opts.chainTo : [opts.chainTo];
    const ch = haspChain(p, [anchors.eye, ...tgt], { shown: opts.chainShown !== false, sag: opts.sag });
    over = ch.svg; anchors.chainEnd = ch.end;
  }
  const wire = [{ path: rectPath(F, -35, -13, tr ? 92 : 37, by1 + 4) }];
  return { svg: shell(p, o, { ...opts, scale: 1 }, { solid: s, wire, center: anchors.lock, badgeR: 14 * k, over }), anchors };
}

// =====================================================================================
// 取件柜 pickupLocker — 拉取式支付：一排青蓝快递取件柜，左侧控制柱（大屏、扫码窗、键盘），每格小门带编号牌、小屏、拉手
// opts: cols=4, rows=3, amounts={i:"1 ETH"}（格门小屏文字）, blank=true（小屏先空，KITX04.lockerWrite 写入）,
//       coins=[i,…]（格内放一叠硬币，默认 amounts 的格子）, open={i:deg}, title="PICKUP"
// 格子编号 i = 行 × cols + 列，0 号在左上。
// 可动：ID-c{i}（门，KIT.door(tl,"ID-c{i}",t,105) 或 KITX04.lockerDoor）、ID-c{i}-amt（小屏金额）、ID-c{i}-coin（KITX04.lockerTake）
// anchors: top, center, ground, front, panel（控制屏）, cells[i]（门中心）, inside[i]（格内中心）, stand（取件人站位地面点）
// =====================================================================================
export function pickupLocker(o, opts = {}) {
  const p = opts.id ?? "lk", atk = isAtk(opts), k = opts.scale ?? 1;
  const cols = opts.cols ?? 4, rows = opts.rows ?? 3, cw = 64, ch = 58, m = 10, PW = 92;
  const W = m + PW + m + cols * cw + m, u0 = -W / 2, u1 = W / 2, v0 = -38, v1 = 38, zb = 16;
  const zT = zb + m + rows * ch + m;
  const body = atk ? mat("#d65248") : { f: "#3aa9cf", s: "#2a8fb3", t: "#7ccbe6", st: "#155e77" };
  const door = atk ? { f: "#ef7b72", s: "#e8574c", st: "#8f2620", in: "#f6b0a8" } : { f: "#7fd0ea", s: "#5cc0e0", st: "#1f7896", in: "#bfe6f2" };
  const amounts = opts.amounts ?? {}, blank = opts.blank !== false;
  const coins = new Set(opts.coins ?? Object.keys(amounts).map(Number));
  const openD = opts.open ?? {};
  let s = contactShadow(o, W * 0.62, 70);
  s += box(o, u0 + 6, u1 - 6, v0 + 4, v1 - 4, 0, zb, M.ink, 1.2);
  s += box(o, u0, u1, v0, v1, zb, zT, body, 2);
  s += box(o, u0 - 4, u1 + 4, v0 - 4, v1 + 6, zT, zT + 10, { ...body, f: darken(body.f, 0.08), s: darken(body.s, 0.1) }, 1.6);
  const hdM = atk ? mat("#b8392f") : { f: "#1f7896", s: "#17637c", t: "#3d97b5", st: "#0e4252" };
  s += box(o, u0 + 6, u1 - 6, v0 + 4, v1 - 2, zT + 10, zT + 40, hdM, 1.5);
  s += G_(faceV(o, u0 + 6, v1 - 2, zT + 40), `<rect x="8" y="6" width="${W - 28}" height="18" rx="3" fill="${lighten(hdM.s, 0.1)}"/>` +
    txt(18, 20, opts.title ?? "PICKUP", { size: 13, mono: true, fill: "#ffffff", weight: 800, extra: `letter-spacing="2"` }) + txt(W - 24, 20, "取件柜", { size: 12, anchor: "end", fill: "#e6f6fb", weight: 700 }) +
    [0, 1, 2].map((i) => `<circle cx="${W / 2 - 14 + i * 14}" cy="15" r="3" fill="${i === 1 ? "#2bd46f" : "#9ad9ee"}"/>`).join(""));
  // −u side: seams + vents
  s += G_(faceU(o, u0, v0, zT), `<rect x="8" y="10" width="${v1 - v0 - 16}" height="${zT - zb - 20}" rx="4" fill="none" stroke="${darken(body.f, 0.18)}" stroke-width="1.6"/>` +
    [0, 1, 2, 3, 4].map((i) => `<rect x="18" y="${zT - zb - 60 + i * 8}" width="${v1 - v0 - 36}" height="3" rx="1.5" fill="${darken(body.f, 0.25)}"/>`).join(""));
  // control column
  const FVm = frameV(o, u0, v1, zT), FV = matStr(FVm);
  let pc = `<rect x="${m}" y="${m}" width="${PW}" height="${rows * ch}" rx="4" fill="${darken(body.s, 0.08)}" stroke="${body.st}" stroke-width="1.4"/>
    <rect x="${m + 8}" y="${m + 10}" width="${PW - 16}" height="62" rx="4" fill="#0b2530" stroke="#0e4252" stroke-width="2"/>
    <rect x="${m + 12}" y="${m + 14}" width="${PW - 24}" height="12" rx="2" fill="#1d93ba"/>` + txt(m + PW / 2, m + 24, "取件", { size: 10, anchor: "middle", fill: "#ffffff", weight: 800 }) +
    Array.from({ length: 6 }, (_, i) => `<rect x="${m + 13 + i * 11.4}" y="${m + 34}" width="9" height="12" rx="1.5" fill="#123744" stroke="#5cc0e0" stroke-width="0.8"/>`).join("") +
    `<rect x="${m + 13}" y="${m + 52}" width="${PW - 26}" height="12" rx="6" fill="#2bd46f" opacity="0.85"/>` +
    `<rect x="${m + 14}" y="${m + 82}" width="${PW - 28}" height="22" rx="3" fill="#1d1f23"/><rect x="${m + 18}" y="${m + 91}" width="${PW - 36}" height="2.4" fill="#ff4a3d" opacity="0.85"/>`;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) pc += `<rect x="${m + 20 + c * 18}" y="${m + 112 + r * 11}" width="14" height="8" rx="2" fill="#eceef0" stroke="#5a6068" stroke-width="0.8"/>`;
  pc += `<rect x="${m + 14}" y="${rows * ch - 18}" width="${PW - 28}" height="10" rx="3" fill="#0e4252"/>`;
  s += G_(FV, pc);
  // cells
  const cellU = (c) => [u0 + m + PW + m + c * cw + 3, u0 + m + PW + m + c * cw + cw - 3];
  const cellZ = (r) => [zT - m - (r + 1) * ch + 3, zT - m - r * ch - 3];
  const vb = v1 - 58, T = 5;
  const cells = [], inside = [];
  let cav = "", doors = [];
  const r2 = (n) => Math.round(n * 100) / 100, mm = (a) => `matrix(${a.map(r2).join(",")})`;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c, [cu0, cu1] = cellU(c), [cz0, cz1] = cellZ(r), dw = cu1 - cu0, dh = cz1 - cz0;
    const op = [at(o, cu0, v1, cz0), at(o, cu1, v1, cz0), at(o, cu1, v1, cz1), at(o, cu0, v1, cz1)];
    let cv = `<polygon points="${pts([at(o, cu0, vb, cz0), at(o, cu1, vb, cz0), at(o, cu1, vb, cz1), at(o, cu0, vb, cz1)])}" fill="#16404f"/>`;
    cv += `<polygon points="${pts([at(o, cu1, vb, cz0), at(o, cu1, v1, cz0), at(o, cu1, v1, cz1), at(o, cu1, vb, cz1)])}" fill="#1f5567"/>`;
    cv += `<polygon points="${pts([at(o, cu0, vb, cz0), at(o, cu1, vb, cz0), at(o, cu1, v1, cz0), at(o, cu0, v1, cz0)])}" fill="#2a6b80"/>`;
    if (coins.has(i)) {
      const cc = (cu0 + cu1) / 2;
      let q = "";
      for (let j = 0; j < 3; j++) q += cyl(o, cc - 2 + (j % 2) * 2, v1 - 26, 12, cz0 + j * 4.5, cz0 + j * 4.5 + 4.5, GOLD, { seg: 22, sw: 1 });
      q += flat(o, circlePlan(cc, v1 - 26, 7.5, 22), cz0 + 13.6, "none", GOLD.s, 1.2);
      cv += `<g id="${p}-c${i}-coin">${q}</g>`;
    }
    cav += `<defs><clipPath id="${p}-c${i}-cc"><polygon points="${pts(op)}"/></clipPath></defs><g clip-path="url(#${p}-c${i}-cc)">${cv}</g>`;
    // door (kit door geometry: hinge on the right edge, outer face local x: free edge → hinge)
    const [hx, hy] = at(o, cu1, v1, cz1), deg = openD[i] ?? 0;
    const a = deg * DEG, du = -Math.cos(a), dv = Math.sin(a), nu = Math.sin(a), nv = Math.cos(a);
    const dS = [du * CA + dv * SA, -du * SA * SE + dv * CA * SE], nS = [nu * CA + nv * SA, -nu * SA * SE + nv * CA * SE];
    const Fp = [hx + dw * dS[0], hy + dw * dS[1]], Ip = [Fp[0] - T * nS[0], Fp[1] - T * nS[1]], Hn = [hx - T * nS[0], hy - T * nS[1]];
    const outM = [-dS[0], -dS[1], 0, CE, Fp[0], Fp[1]], inM = [dS[0], dS[1], 0, CE, Hn[0], Hn[1]], showOut = nS[1] > 0, vis = deg > 1.5 ? 1 : 0, Hd = dh * CE;
    const amt = amounts[i] ?? "";
    const outer = `<rect x="0" y="0" width="${dw}" height="${dh}" rx="3" fill="${door.s}" stroke="${door.st}" stroke-width="1.5"/>
      <path d="M2 ${dh - 2}V2H${dw - 2}" fill="none" stroke="${door.f}" stroke-width="2"/>
      <rect x="5" y="5" width="18" height="11" rx="2" fill="#ffffff" stroke="${door.st}" stroke-width="0.8"/>${txt(14, 13.6, String(i + 1).padStart(2, "0"), { size: 8, mono: true, anchor: "middle", weight: 800, fill: "#155e77" })}
      <rect x="9" y="20" width="${dw - 18}" height="15" rx="2" fill="#0b2530" stroke="${door.st}" stroke-width="1"/>
      <rect id="${p}-c${i}-scr-on" x="10" y="21" width="${dw - 20}" height="13" rx="1.5" fill="#123d4b" opacity="${blank ? 0 : 1}"/>
      <g id="${p}-c${i}-amt" opacity="${blank ? 0 : 1}">${amt ? txt(dw / 2, 31, amt, { size: 8.6, mono: true, anchor: "middle", fill: "#9ad9ee", weight: 800 }) : ""}</g>
      <rect x="4" y="${dh * 0.52}" width="5" height="${dh * 0.32}" rx="2.5" fill="url(#${p}-hg)" stroke="#4b4f56" stroke-width="0.9"/>
      ${[0, 1, 2].map((j) => `<rect x="${dw - 26}" y="${dh - 12 + j * 3}" width="16" height="1.4" fill="${door.st}" opacity="0.5"/>`).join("")}`;
    const inner = `<rect x="0" y="0" width="${dw}" height="${dh}" rx="3" fill="${door.in}" stroke="${door.st}" stroke-width="1.5"/><rect x="${dw - 12}" y="${dh / 2 - 6}" width="8" height="12" rx="2" fill="#9aa0a8" stroke="#4b4f56" stroke-width="0.8"/>`;
    doors.push({ u: cu0, svg: `<g id="${p}-c${i}-door" data-hx="${r2(hx)}" data-hy="${r2(hy)}" data-w="${dw}" data-h="${dh}" data-t="${T}" data-a="${deg}">
      <polygon id="${p}-c${i}-door-top" points="${[P2([hx, hy]), P2(Fp), P2(Ip), P2(Hn)].join(" ")}" fill="${door.f}" stroke="${door.st}" stroke-width="1.2" stroke-linejoin="round" opacity="${vis}"/>
      <polygon id="${p}-c${i}-door-edge" points="${[P2(Fp), P2(Ip), P2([Ip[0], Ip[1] + Hd]), P2([Fp[0], Fp[1] + Hd])].join(" ")}" fill="${door.f}" stroke="${door.st}" stroke-width="1.2" stroke-linejoin="round" opacity="${vis}"/>
      <g id="${p}-c${i}-door-out" transform="${mm(outM)}" opacity="${showOut ? 1 : 0}">${outer}</g>
      <g id="${p}-c${i}-door-in" transform="${mm(inM)}" opacity="${showOut ? 0 : 1}">${inner}</g></g>` });
    cells.push(at(o, (cu0 + cu1) / 2, v1, (cz0 + cz1) / 2)); inside.push(at(o, (cu0 + cu1) / 2, v1 - 26, cz0 + 12));
  }
  s += cav;
  s += `<defs><linearGradient id="${p}-hg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f4f5f6"/><stop offset="1" stop-color="#8d939b"/></linearGradient></defs>`;
  s += doors.sort((a, b) => b.u - a.u).map((d) => d.svg).join("");
  const anchors = { top: at(o, 0, 0, zT + 90), center: at(o, 0, 0, zT / 2), ground: at(o), front: at(o, 0, v1, zT / 2), panel: applyM(FVm, m + PW / 2, m + 40), cells, inside, stand: at(o, (cellU(1)[0] + cellU(1)[1]) / 2, v1 + 110, 0) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0, u1, v0, v1, 0, zT + 40]], center: anchors.center, glowR: W * 0.6, badgeR: 34 }), anchors: scaleAnchors(o, k, anchors) };
}

// =====================================================================================
// 预言机幽灵指针 oracleGhost — 叠在 ep01 miniVend({kind:"oracle"}) 上：一根半透明红色"幽灵指针"（带两道残影）偏离墨色正常指针，
//   正面价格曲线窗叠一条红色尖峰。和那台 miniVend 用同一个 origin、同一个 id、同一个 scale，紧跟在它后面画。
// opts: id（= miniVend 的 id）, deg=50（幽灵指针角度，0 竖直，表盘 ±70）, real=-20（正常指针角度，残影朝它拖）, shown=true, scale=1
// 可动：ID-needle-bad（+ -t1 / -t2 残影）→ KITX04.ghost / ghostWobble；ID-ghost-solid → KITX04.ghostOn
// anchors: dial, tip（幽灵指针尖）, chart（价格曲线窗）, top, ground
// =====================================================================================
export function oracleGhost(o, opts = {}) {
  const p = opts.id ?? "mv", k = opts.scale ?? 1, deg = opts.deg ?? 50, real = opts.real ?? -20;
  const zc = 242, R = 40, mF = frameV(o, 0, 0, zc);
  const needle = (op, glowOn) => (glowOn ? `<path d="M-8 11L0 ${-(R - 2)}L8 11Z" fill="#e0453a" opacity="0.2"/>` : "") +
    `<path d="M-4.4 8L0 ${-(R - 6)}L4.4 8Z" fill="#e0453a" fill-opacity="${op}" stroke="#a8322a" stroke-opacity="${op}" stroke-width="1.2" stroke-dasharray="3.4 1.8"/>`;
  // error band on the dial rim between the true reading and the ghost reading (runtime keeps it in sync)
  const arcD = (a0, a1, r) => { const lo = Math.min(a0, a1) * DEG, hi = Math.max(a0, a1) * DEG; return `M${f(r * Math.sin(lo))} ${f(-r * Math.cos(lo))}A${r} ${r} 0 0 1 ${f(r * Math.sin(hi))} ${f(-r * Math.cos(hi))}`; };
  let s = G_(matStr(mF), `<path id="${p}-ghost-arc" d="${arcD(real, deg, R - 11)}" data-r="${R - 11}" fill="none" stroke="#ff4a3d" stroke-width="6" stroke-linecap="round" opacity="0.75"/>`);
  s += rotator(`${p}-needle-bad-t2`, mF, 0, 0, deg + (real - deg) * 0.32, needle(0.18, false));
  s += rotator(`${p}-needle-bad-t1`, mF, 0, 0, deg + (real - deg) * 0.16, needle(0.38, false));
  s += rotator(`${p}-needle-bad`, mF, 0, 0, deg, needle(0.85, true));
  s += G_(matStr(mF), `<circle cx="0" cy="0" r="8" fill="none" stroke="#e0453a" stroke-width="1.6" opacity="0.7"/><circle cx="0" cy="0" r="5" fill="#1d93ba" stroke="#155e77" stroke-width="1.2"/>`);
  // red spike over the price chart window
  const FVm = frameV(o, -55, 45, 180);
  s += G_(matStr(FVm), `<polyline points="14,92 24,84 32,88 40,78 46,50 52,42 58,62 68,40" fill="none" stroke="#ff4a3d" stroke-width="3" stroke-linejoin="round" stroke-dasharray="5 2.4"/><circle cx="52" cy="42" r="3.4" fill="#ff4a3d"/>`);
  const [ox, oy] = at(o);
  let inner = `<g id="${p}-ghost-solid" opacity="${opts.shown === false ? 0 : 1}">${s}</g>`;
  if (k !== 1) inner = `<g transform="translate(${f(ox)},${f(oy)}) scale(${k}) translate(${f(-ox)},${f(-oy)})">${inner}</g>`;
  const a = deg * DEG;
  const anchors = { dial: at(o, 0, 0, zc), tip: applyM(mF, (R - 8) * Math.sin(a), -(R - 8) * Math.cos(a)), chart: applyM(FVm, 41, 73), top: at(o, 0, 0, zc + R + 50), ground: at(o) };
  return { svg: `<g id="${p}-ghost" class="kobj" data-a="${deg}" data-real="${real}" data-ox="${f(ox)}" data-oy="${f(oy)}">${inner}</g>`, anchors: scaleAnchors(o, k, anchors) };
}

// =====================================================================================
// 字节码打孔卡 punchCard — kind:"tape"（默认）：从编译器机器（ep03 contractMachine）出件斜槽吐出的米色打孔纸带，
//   先顺斜槽滑下、再平铺在地上；kind:"card"：一张立在支架上的老式穿孔卡（和源码卡并排对比）。
// 孔位来自 bytes（hex，每字节一列，8 个数据孔 + 中间一排小链孔），red=[列号,…] 标红（"锁槽不一致"的那几列）。
// opts(tape): z=18（出口高度，用 machineOut(o) 算原点和高度）, len=360, s=1（初始吐出比例）, bytes, red=[], redShown=true
// opts(card): title="BYTECODE", cols=24, bytes, red=[], redShown=true
// 可动：ID-tape（KITX04.tape 吐出 0..1）、ID-red（KITX04.tapeMark 标红 / 闪）
// anchors: top, center, ground, start（出口）, end（纸带头）, red（第一处红列中心）
// =====================================================================================
const BYTES = "6080604052600436106100565760003560e01c80633ccfd60b14610062578063a9059cbb14610079575f5ffd5b";
const bitsOf = (hex, c) => { const h = hex.replace(/^0x/, ""), n = h.length / 2, b = parseInt(h.substr((c % n) * 2, 2), 16); return Array.from({ length: 8 }, (_, j) => (b >> (7 - j)) & 1); };
export function punchCard(o, opts = {}) {
  const p = opts.id ?? "pc", k = opts.scale ?? 1, atk = isAtk(opts);
  const red = new Set(opts.red ?? []), hex = opts.bytes ?? BYTES;
  const paper = atk ? "#f6d4cf" : "#f3ead2", edge = atk ? "#c23a30" : "#b9a77e", hole = "#3b3326";
  let s = "", redG = "", anchors;
  if ((opts.kind ?? "tape") === "tape") {
    const z = opts.z ?? 18, Wt = 44, L2 = opts.len ?? 360, run = 26, l1 = Math.hypot(run, z - 1), s0 = opts.s ?? 1;
    const d = [(run * V[0]) / l1, (run * V[1] + (z - 1) * CE) / l1], o1 = at(o, -Wt / 2, 0, z);
    const M1 = [U[0], U[1], d[0], d[1], o1[0], o1[1]], M2 = frameTop(o, -Wt / 2, run, 1);
    const tx = (j) => 5 + j * 4.25, step = 9, nCols = Math.floor((l1 + L2 - 10) / step);
    const seg = [{ M: M1, y0: 0, y1: l1 }, { M: M2, y0: l1, y1: l1 + L2 }];
    const parts = seg.map((sg, si) => {
      const len = sg.y1 - sg.y0;
      let g = si === 1 ? `<path d="M0 0H${Wt}V${len}L${Wt / 2} ${len - 8}L0 ${len}Z" fill="rgba(60,50,30,0.16)" transform="translate(2.5,3)"/>` : "";
      g += si === 1 ? `<path d="M0 0H${Wt}V${len}L${Wt / 2} ${len - 8}L0 ${len}Z" fill="${paper}" stroke="${edge}" stroke-width="1.1" stroke-linejoin="round"/>` : `<rect x="0" y="0" width="${Wt}" height="${len}" fill="${lighten(paper, 0.15)}" stroke="${edge}" stroke-width="1.1"/>`;
      g += `<path d="M1.8 0V${len - (si ? 8 : 0)}M${Wt - 1.8} 0V${len - (si ? 8 : 0)}" stroke="${darken(paper, 0.06)}" stroke-width="1"/>`;
      let rg = "";
      for (let c = 0; c < nCols; c++) {
        const gy = 6 + c * step; if (gy < sg.y0 + 2 || gy > sg.y1 - 10) continue;
        const ly = gy - sg.y0, bits = bitsOf(hex, c);
        g += `<circle cx="${f(tx(4))}" cy="${f(ly)}" r="1.1" fill="${hole}"/>`;
        bits.forEach((b, j) => { if (b) g += `<circle cx="${f(tx(j < 4 ? j : j + 1))}" cy="${f(ly)}" r="1.9" fill="${hole}"/>`; });
        if (red.has(c)) {
          rg += `<rect x="1.2" y="${f(ly - 4.2)}" width="${Wt - 2.4}" height="8.4" rx="2" fill="rgba(224,69,58,0.16)" stroke="#e0453a" stroke-width="1.5"/>`;
          bits.forEach((b, j) => { if (b) rg += `<circle cx="${f(tx(j < 4 ? j : j + 1))}" cy="${f(ly)}" r="2.1" fill="#e0453a"/>`; });
          if (!anchors?.red) anchors = { ...(anchors ?? {}), red: applyM(sg.M, Wt / 2, ly) };
        }
      }
      const clipH = si === 0 ? Math.min(l1, s0 * (l1 + L2)) : Math.max(0, s0 * (l1 + L2) - l1);
      return `<defs><clipPath id="${p}-clip${si + 1}"><rect id="${p}-clip${si + 1}r" x="-4" y="0" width="${Wt + 12}" height="${f(clipH + 0.01)}"/></clipPath></defs>` +
        G_(matStr(sg.M), `<g clip-path="url(#${p}-clip${si + 1})">${g}<g class="${p}-redpart">${rg}</g></g>`);
    });
    // move all red parts into one toggle group is not possible across clip groups → each red part shares opacity via a wrapper id per segment
    s += `<g id="${p}-tape" data-l1="${f(l1)}" data-l2="${L2}" data-s="${s0}">${parts[1]}${parts[0]}</g>`;
    s = s.replaceAll(`<g class="${p}-redpart">`, `<g class="${p}-redpart" opacity="${opts.redShown === false ? 0 : 1}">`);
    // red group handle: we wrap both red parts by id suffixes
    let n = 0; s = s.replace(new RegExp(`<g class="${p}-redpart"`, "g"), () => `<g id="${p}-red${n++ ? "-b" : ""}" class="${p}-redpart"`);
    // lip on the chute
    anchors = { top: at(o, 0, run + L2 * 0.5, 80), center: at(o, 0, run + L2 * 0.5, 1), ground: at(o), start: at(o, 0, 0, z), end: at(o, 0, run + L2, 1), red: anchors?.red ?? at(o, 0, run, 1) };
    return { svg: shell(p, o, opts, { solid: s, wire: [[-Wt / 2, Wt / 2, 0, run + L2, 0, z]], center: anchors.center, badgeR: 22 }), anchors: scaleAnchors(o, k, anchors), redIds: [`${p}-red`, `${p}-red-b`] };
  }
  // ---- card on a stand
  const cols = opts.cols ?? 24, Wc = 30 + cols * 9.6, Hc = 124, z0 = 26;
  const Fm = frameV(o, -Wc / 2, 0, z0 + Hc), FS = matStr(Fm);
  s += contactShadow(o, Wc * 0.6, 40);
  s += box(o, -Wc / 2 - 8, Wc / 2 + 8, -14, 12, 0, 10, M.steelLight, 1.4);
  const cardD = `M16 0H${Wc}V${Hc}H0V16Z`;
  s += `<g transform="translate(${f(-3 * V[0])},${f(-3 * V[1])})">${G_(FS, `<path d="${cardD}" fill="${darken(paper, 0.18)}" stroke="${edge}" stroke-width="1.2"/>`)}</g>`;
  let g = `<path d="${cardD}" fill="${paper}" stroke="${edge}" stroke-width="1.4" stroke-linejoin="round"/>`;
  g += `<path d="M10 22H${Wc - 8}" stroke="${darken(paper, 0.1)}" stroke-width="1"/>`;
  let rg = "";
  for (let c = 0; c < cols; c++) {
    const x = 20 + c * 9.6, bits = bitsOf(hex, c);
    g += txt(x + 1.6, 17, String(c + 1), { size: 5, mono: true, anchor: "middle", fill: "#8a7a55", weight: 700 });
    bits.forEach((b, j) => { const y = 28 + j * 10.4; g += b ? `<rect x="${f(x)}" y="${f(y)}" width="3.4" height="6.6" rx="0.6" fill="${hole}"/>` : `<text x="${f(x + 1.7)}" y="${f(y + 5.6)}" ${MONO} font-size="5" fill="#b3a27a" text-anchor="middle">${j}</text>`; });
    if (red.has(c)) {
      rg += `<rect x="${f(x - 3)}" y="24" width="9.4" height="86" rx="2" fill="rgba(224,69,58,0.14)" stroke="#e0453a" stroke-width="1.6"/>`;
      bits.forEach((b, j) => { if (b) rg += `<rect x="${f(x)}" y="${f(28 + j * 10.4)}" width="3.4" height="6.6" rx="0.6" fill="#e0453a"/>`; });
      if (!anchors) anchors = { red: applyM(Fm, x + 1.7, 66) };
    }
  }
  g += txt(Wc - 10, Hc - 6, opts.title ?? "BYTECODE", { size: 8, mono: true, anchor: "end", fill: "#6d5f3f", weight: 800 });
  g += `<path d="M22 4L60 4L30 50L22 50Z" fill="#ffffff" opacity="0.18"/>`;
  s += G_(FS, g + `<g id="${p}-red" opacity="${opts.redShown === false ? 0 : 1}">${rg}</g>`);
  for (const du of [-Wc / 2 + 30, Wc / 2 - 30]) s += box(o, du - 7, du + 7, -6, 6, 10, z0 + 14, M.chrome, 1.1);
  const A2 = { top: at(o, 0, 0, z0 + Hc + 60), center: at(o, 0, 0, z0 + Hc / 2), ground: at(o), red: anchors?.red ?? at(o, 0, 0, z0 + Hc / 2) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-Wc / 2 - 8, Wc / 2 + 8, -14, 12, 0, 10], [-Wc / 2, Wc / 2, -2, 2, z0, z0 + Hc]], center: A2.center, badgeR: 26 }), anchors: scaleAnchors(o, k, A2), redIds: [`${p}-red`] };
}

export const CATALOG_EXT = { callbackArm, tellerCounter, hasp, haspChain, pickupLocker, oracleGhost, punchCard };
/** browser runtime (window.KITX04, merged into window.KITX) — inline after kit's runtimeJs() */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
