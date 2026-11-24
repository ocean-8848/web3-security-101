// objects-ext.mjs — 第 16 集（共识层与链级安全）补充拟物物件，与 kit/objects.mjs 同一投影、同一接口
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state 见各物件
//   opts.glow = true 时脚下绿色地光；opts.scale = 以地面原点等比缩放（anchors 已换算）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，另有一层 ID-mv（整件包一层）。
//   两个物件的 broken 都只标出"出问题的那一处"（红虚线框 + 红叉），整件不变虚；ID-wire 为空，不要用 KIT.broke，
//   改用 KITX16.sigBad / KITX16.swBad。
// 动画助手在 runtime-ext.js（window.KITX16，并以不覆盖的方式合并进 window.KITX），用 runtimeExtJs() 内联在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  f, f4, at, M, C, darken,
  frameV, frameU, matStr, applyM, faceV, faceU, faceTop,
  box, cyl, contactShadow, wireSvg, badgeSvg,
} from "../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const isAscii = (s) => /^[\x00-\x7f]*$/.test(String(s));
const txt = (x, y, s, o = {}) =>
  `<text ${o.id ? `id="${o.id}"` : ""} x="${f(x)}" y="${f(y)}" ${o.mono ?? isAscii(s) ? MONO : FONT} font-size="${o.size ?? 12}" font-weight="${o.weight ?? 800}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}" dominant-baseline="central">${s}</text>`;
const em = (s) => [...String(s)].reduce((n, ch) => n + (/[\x00-\x7f]/.test(ch) ? 0.6 : 1), 0);
function shell(p, o, opts, s) {
  const st = opts.state ?? "normal", broken = st === "broken";
  const glowOn = (opts.glow ?? false) && !broken && st !== "attacker";
  const [ox, oy] = at(o);
  const glowSvg = `<g id="${p}-glow" opacity="${glowOn ? 1 : 0}"><g transform="${faceTop(o, 0, 0, 0)}"><ellipse cx="0" cy="0" rx="${s.glowR}" ry="${s.glowR}" fill="${C.green}" opacity="0.16"/></g></g>`;
  const k = s.k ?? 1, sc0 = k !== 1 ? `<g transform="translate(${f(ox)} ${f(oy)}) scale(${f4(k)}) translate(${f(-ox)} ${f(-oy)})">` : "", sc1 = k !== 1 ? "</g>" : "";
  return `<g id="${p}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}" data-state="${st}" data-k="${f4(k)}"><g id="${p}-mv" data-k="${f4(k)}">${sc0}${glowSvg}
  <g id="${p}-solid">${s.solid}</g>
  ${wireSvg(p + "-wire", o, [], { opacity: 0 })}
  ${badgeSvg(p + "-x", s.center, 30 / k, 0)}${s.over ?? ""}${sc1}</g></g>`;
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
const mArr = (m) => m.map((v, i) => (i < 4 ? f4(v) : f(v))).join(",");
/** group rotated about local (px,py) inside face matrix m; runtime rewrites its transform (data-m / data-px / data-py / data-a) */
function rotator(id, m, px, py, a, inner, extra = "") {
  const tr = `${matStr(m)} translate(${px} ${py}) rotate(${f(a)}) translate(${-px} ${-py})`;
  return `<g id="${id}" data-m="${mArr(m)}" data-px="${px}" data-py="${py}" data-a="${f(a)}" transform="${tr}" ${extra}>${inner}</g>`;
}
const RED = "#e0453a", GREEN = "#2bd46f", TEAL = "#3fc3ec", OFF = "#4a4d53";
/** red dashed frame (local 2-D, inside a face group) + red X dot at the top-right corner */
const badFrame = (id, x0, y0, x1, y1, on) =>
  `<g id="${id}" opacity="${on ? 1 : 0}"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="3" fill="rgba(224,69,58,0.08)" stroke="${RED}" stroke-width="2.4" stroke-dasharray="5 3"/>` +
  `<g><circle cx="${x1}" cy="${y0}" r="8" fill="${RED}" stroke="#ffffff" stroke-width="1.4"/><path d="M${x1 - 3.2} ${y0 - 3.2}L${x1 + 3.2} ${y0 + 3.2}M${x1 + 3.2} ${y0 - 3.2}L${x1 - 3.2} ${y0 + 3.2}" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/></g></g>`;
const CONC = { f: "#c9c4b8", s: "#b0aa9d", t: "#dcd8ce", st: "#878172" };
const IRON = { f: "#4e535a", s: "#3b3f45", t: "#6a7078", st: "#1c1e21" };

// =====================================================================================
// 最终性信号柱 finalitySignal — 铁路信号柱：水泥小底座 + 墨色立杆，顶上黑色竖长信号头（正面朝 +v），自上而下三盏圆灯（带遮光檐），
//   每盏灯右侧一块白底小铭牌写 labels（自上而下，默认 ["finalized","safe","unsafe"]）。
// 约 40×40×200。
// opts: labels=["finalized","safe","unsafe"]（自上而下）, lit（亮到第几档：0 = 只亮 unsafe，1 = 亮到 safe，2 = 亮到 finalized；-1 全灭），scale
// 状态：normal（lit 默认 2，finalized 绿）；pending（lit 默认 1，finalized 灯灭 = 未最终确定）；
//   broken（finalized 灯变红 + 那一格红虚线框红叉 = 被回滚；lit 默认 1）；attacker（亮着的灯全是红色）。
// 灯号 = 档位：ID-lamp-0 = 最下 unsafe（青蓝），ID-lamp-1 = 中 safe（青蓝），ID-lamp-2 = 最上 finalized（绿）。
//   每盏灯：ID-lamp-i-on（亮层），ID-lamp-i-red（红层）。ID-bad = finalized 那一格的红虚线框 + 红叉。
// 可动：KITX16.sig / sigLamp / sigBlink / sigBad
// anchors: top, center, ground, head（信号头中心）, lamps（[unsafe, safe, finalized] 三盏灯中心，与灯号一致）,
//   unsafe / safe / finalized（同上，单独点）, plates（三块铭牌中心，同序）
// =====================================================================================
export function finalitySignal(o, opts = {}) {
  const p = opts.id ?? "fsig", K = opts.scale ?? 1, st = opts.state ?? "normal";
  const atk = st === "attacker", brk = st === "broken";
  const labels = opts.labels ?? ["finalized", "safe", "unsafe"];   // top → bottom
  const lit = opts.lit ?? (st === "pending" || brk ? 1 : 2);
  let s = contactShadow(o, 40, 34);
  // base + pole
  s += box(o, -20, 20, -20, 20, 0, 14, CONC, 1.4);
  s += box(o, -12, 12, -12, 12, 14, 20, CONC, 1.2);
  s += cyl(o, 0, 0, 4.5, 20, 124, M.ink, { seg: 16, sw: 1.2 });
  // head: box u −16..16, v −9..9, z 124..206; front face (+v) carries the lamps
  const HU0 = -16, HU1 = 16, HV1 = 9, HZ0 = 124, HZ1 = 206;
  s += box(o, HU0, HU1, -9, HV1, HZ0, HZ1, { f: "#2a2c30", s: "#1d1f22", t: "#3c3f44", st: "#0d0e10" }, 1.6);
  s += box(o, HU0 - 2, HU1 + 2, -11, HV1 + 2, HZ1, HZ1 + 5, M.ink, 1.2);           // cap
  const FM = frameV(o, HU0, HV1, HZ1);                                               // local x → +u (0..32), y → −z (0..82)
  const LY = [68, 41, 14];                                                           // lamp 0 (unsafe, bottom) .. lamp 2 (finalized, top)
  const onCol = (i) => (atk ? RED : i === 2 ? GREEN : TEAL);
  let face = "";
  for (let i = 0; i < 3; i++) {
    const cy = LY[i], cx = 16;
    const on = i <= lit && !(brk && i === 2);
    face += `<g id="${p}-lamp-${i}"><circle cx="${cx}" cy="${cy}" r="10.5" fill="#111214"/><circle cx="${cx}" cy="${cy}" r="8.2" fill="${OFF}"/>` +
      `<g id="${p}-lamp-${i}-on" opacity="${on ? 1 : 0}"><circle cx="${cx}" cy="${cy}" r="15" fill="${onCol(i)}" opacity="0.28"/><circle cx="${cx}" cy="${cy}" r="8.2" fill="${onCol(i)}"/><circle cx="${cx - 2.6}" cy="${cy - 2.6}" r="2.4" fill="#ffffff" opacity="0.7"/></g>` +
      `<g id="${p}-lamp-${i}-red" opacity="${brk && i === 2 ? 1 : 0}"><circle cx="${cx}" cy="${cy}" r="15" fill="${RED}" opacity="0.3"/><circle cx="${cx}" cy="${cy}" r="8.2" fill="${RED}"/><circle cx="${cx - 2.6}" cy="${cy - 2.6}" r="2.4" fill="#ffffff" opacity="0.6"/></g>` +
      `<path d="M${cx - 12} ${cy - 9}A12 12 0 0 1 ${cx + 12} ${cy - 9}" fill="none" stroke="#0d0e10" stroke-width="3.2" stroke-linecap="round"/></g>`;
  }
  // label plates to the right of the head, same plane
  const PX = 38, PW = Math.max(52, ...labels.map((t) => em(t) * 10.5 + 12)), PH = 17;
  for (let i = 0; i < 3; i++) {
    const cy = LY[i], lab = labels[2 - i] ?? "";
    face += `<path d="M32 ${cy}L${PX} ${cy}" stroke="#2a2c30" stroke-width="2.4"/>` +
      `<rect x="${PX}" y="${cy - PH / 2}" width="${f(PW)}" height="${PH}" rx="2.5" fill="#ffffff" stroke="${i === 2 ? "#17804a" : "#2a87a8"}" stroke-width="1.4"/>` +
      txt(PX + PW / 2, cy + 0.5, lab, { size: 10.5, anchor: "middle", fill: i === 2 ? "#17804a" : "#17809f", id: `${p}-plate-${i}` });
  }
  face += badFrame(p + "-bad", -6, LY[2] - 17, PX + PW + 4, LY[2] + 17, brk);
  s += G_(matStr(FM), face);
  const lamps = LY.map((y) => applyM(FM, 16, y)), plates = LY.map((y) => applyM(FM, PX + PW / 2, y));
  const anchors = {
    top: at(o, 0, 0, HZ1 + 12), center: at(o, 0, 0, 110), ground: at(o), head: applyM(FM, 16, 41),
    lamps, unsafe: lamps[0], safe: lamps[1], finalized: lamps[2], plates,
  };
  return {
    svg: shell(p, o, opts, { solid: s, center: anchors.head, glowR: 60, k: K }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

// =====================================================================================
// 道岔扳道器 forkSwitch — 铁路扳道器：水泥小基座上的铸铁机箱；正面（+v）前方一根长扳杆（红白相间握把），绕底部轴在 u-z 面里摆动；
//   机箱顶上立一块圆形方向牌（白底，正面朝 +v），一支箭头指向原链（右上，往 −v 的后方分支）或新链（右下，往 +v 的前方分支）；
//   机箱 −u 侧面一盏小灯（绿 / 红）。
// 约 70×50×110。
// opts: thrown（false = 指向原链；true = 已扳到新链）, labels=["原链","新链"]（箭头两端小字：上 = 原链，下 = 新链）, scale
// 状态：normal（指向原链，灯绿）；reorg（扳杆扳下，箭头指向新链，灯红；thrown 默认 true）；
//   attacker（同 reorg，箭头红色）；broken（整件外一圈红虚线框 + 红叉；thrown 默认 false）。
// 可动：ID-lever（扳杆，绕轴转约 60°）、ID-disc（方向箭头，转向另一支）、ID-lamp（-green / -red 两层）、ID-bad（红虚线框）
//   KITX16.flip / lever / disc / swLamp / swBad
// anchors: top, center, ground, disc（方向牌中心）, lamp, lever（扳杆握把，按初始位置）,
//   branchA（原链接点，地面，后方 −v）, branchB（新链接点，地面，前方 +v）, root（分叉点，地面，−u 侧，来路）
// =====================================================================================
export function forkSwitch(o, opts = {}) {
  const p = opts.id ?? "fork", K = opts.scale ?? 1, st = opts.state ?? "normal";
  const atk = st === "attacker", brk = st === "broken", reorg = st === "reorg" || atk;
  const thrown = opts.thrown ?? reorg;
  const labels = opts.labels ?? ["原链", "新链"];
  let s = contactShadow(o, 52, 42);
  s += box(o, -36, 36, -26, 30, 0, 12, CONC, 1.4);
  // housing
  s += box(o, -24, 24, -18, 16, 12, 64, IRON, 1.6);
  s += box(o, -27, 27, -21, 19, 64, 69, { f: "#5c6168", s: "#474b51", t: "#777d85", st: "#1c1e21" }, 1.2);
  // rivets + plate on the front face
  const FF = frameV(o, -24, 16, 64);                                   // local 0..48 × 0..52
  s += G_(matStr(FF), [[5, 5], [43, 5], [5, 47], [43, 47]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#8a9098"/>`).join("") +
    `<rect x="9" y="12" width="30" height="12" rx="2" fill="#2a2c30" stroke="#8a9098" stroke-width="0.8"/>` +
    `<path d="M14 18h20" stroke="#8a9098" stroke-width="1.2" stroke-dasharray="3 2"/>`);
  // lamp on the −u side face
  const FU = frameU(o, -24, -18, 64);                                  // local x → +v (0..34), y → −z
  const lc = [17, 18];
  s += G_(matStr(FU), `<circle cx="${lc[0]}" cy="${lc[1]}" r="7.5" fill="#111214"/><circle cx="${lc[0]}" cy="${lc[1]}" r="5.6" fill="${OFF}"/>` +
    `<g id="${p}-lamp-green" opacity="${reorg ? 0 : 1}"><circle cx="${lc[0]}" cy="${lc[1]}" r="11" fill="${GREEN}" opacity="0.3"/><circle cx="${lc[0]}" cy="${lc[1]}" r="5.6" fill="${GREEN}"/></g>` +
    `<g id="${p}-lamp-red" opacity="${reorg ? 1 : 0}"><circle cx="${lc[0]}" cy="${lc[1]}" r="11" fill="${RED}" opacity="0.32"/><circle cx="${lc[0]}" cy="${lc[1]}" r="5.6" fill="#ff4a3d"/></g>`, `id="${p}-lamp"`);
  // disc post + disc (plane v = 0, faces +v)
  s += cyl(o, 0, 0, 3, 69, 84, M.ink, { seg: 12, sw: 1 });
  const DZ = 102, DR = 18;
  const DM = frameV(o, 0, 0, DZ);                                      // local origin = disc centre
  const aA = -45, aB = 55;                                             // arrow angle (deg, screen-ish): up-right = 原链, down-right = 新链
  const arrow = `<path d="M-11 0H7" stroke="${atk ? RED : C.ink}" stroke-width="4.2" stroke-linecap="round"/><path d="M4 -7L13 0L4 7Z" fill="${atk ? RED : C.ink}"/>`;
  s += G_(matStr(DM), `<circle cx="0" cy="0" r="${DR + 2.5}" fill="#1c1e21"/><circle cx="0" cy="0" r="${DR}" fill="#ffffff" stroke="#c9c4b8" stroke-width="1"/>` +
    `<circle cx="0" cy="0" r="2.6" fill="${C.ink}"/>`);
  s += rotator(p + "-disc", DM, 0, 0, thrown ? aB : aA, arrow, `data-a0="${aA}" data-a1="${aB}"`);
  s += G_(matStr(DM), `<text x="${DR + 6}" y="-12" ${FONT} font-size="10" font-weight="900" fill="#17804a" dominant-baseline="central">${labels[0]}</text>` +
    `<text x="${DR + 6}" y="13" ${FONT} font-size="10" font-weight="900" fill="${RED}" dominant-baseline="central">${labels[1]}</text>`);
  // lever: pivot bracket in front of the housing, plane v = 24
  const LM = frameV(o, 8, 24, 14);                                     // local origin = pivot
  const L0 = 30, L1 = -30, LL = 66;
  s += G_(faceV(o, 0, 24, 22), `<rect x="0" y="0" width="16" height="10" rx="2" fill="#3b3f45" stroke="#1c1e21" stroke-width="1"/>`);
  const stripes = [0, 1, 2, 3, 4].map((i) => `<rect x="-3.4" y="${-LL + 2 + i * 7}" width="6.8" height="7" fill="${i % 2 ? "#ffffff" : RED}"/>`).join("");
  const leverIn = `<rect x="-2.6" y="${-LL + 30}" width="5.2" height="${LL - 30}" fill="#5c6168" stroke="#1c1e21" stroke-width="1"/>` +
    `<rect x="-3.6" y="${-LL}" width="7.2" height="38" rx="3" fill="#ffffff" stroke="#6a1a15" stroke-width="1.2"/>${stripes}` +
    `<circle cx="0" cy="${-LL}" r="5" fill="${RED}" stroke="#6a1a15" stroke-width="1.2"/>`;
  s += rotator(p + "-lever", LM, 0, 0, thrown ? L1 : L0, leverIn, `data-a0="${L0}" data-a1="${L1}"`);
  s += G_(matStr(LM), `<circle cx="0" cy="0" r="4.6" fill="#8a9098" stroke="#1c1e21" stroke-width="1.2"/>`);
  // broken: dashed frame around the whole switch (screen-ish plane)
  const BM = frameV(o, -44, 34, 128);
  s += G_(matStr(BM), badFrame(p + "-bad", 0, 0, 104, 132, brk));
  const lev = (a) => applyM(LM, Math.sin(a * Math.PI / 180) * LL, -Math.cos(a * Math.PI / 180) * LL);
  const anchors = {
    top: at(o, 0, 0, DZ + DR + 10), center: at(o, 0, 0, 50), ground: at(o), disc: applyM(DM, 0, 0), lamp: applyM(FU, lc[0], lc[1]),
    lever: lev(thrown ? L1 : L0), branchA: at(o, 70, -48, 0), branchB: at(o, 70, 48, 0), root: at(o, -70, 0, 0),
  };
  return {
    svg: shell(p, o, opts, { solid: s, center: anchors.center, glowR: 70, k: K }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

export const CATALOG_EXT = { finalitySignal, forkSwitch };
/** runtime-ext.js contents — inline after iso.runtimeJs() (and other chapters' runtime-ext) */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
