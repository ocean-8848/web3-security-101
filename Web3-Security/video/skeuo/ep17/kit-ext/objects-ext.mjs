// objects-ext.mjs — 第 17 集（节点、RPC 与验证者基础设施）补充拟物物件，与 kit/objects.mjs 同一投影、同一接口
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"
//   opts.glow = true 时脚下绿色地光；opts.scale = 以地面原点等比缩放（anchors 已换算）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，KIT.grow / KIT.broke 直接可用；另有一层 ID-mv（整件包一层）。
// 动画助手在 runtime-ext.js（window.KITX17，并以不覆盖的方式合并进 window.KITX），用 runtimeExtJs() 内联在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  C, f, f4, at, M, darken, frameV, matStr, applyM, faceTop, box, cyl, contactShadow, wireSvg, badgeSvg, glow,
} from "../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const txt = (x, y, s, o = {}) =>
  `<text ${o.id ? `id="${o.id}"` : ""} x="${f(x)}" y="${f(y)}" ${FONT} font-size="${o.size ?? 20}" font-weight="${o.weight ?? 900}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}" ${o.extra ?? ""}>${s}</text>`;
function shell(p, o, opts, s) {
  const st = opts.state ?? "normal", broken = st === "broken";
  const glowOn = (opts.glow ?? false) && !broken && st !== "attacker";
  const [ox, oy] = at(o);
  const glowSvg = s.glowR ? `<g id="${p}-glow" opacity="${glowOn ? 1 : 0}">${glow(p + "-gl", o, s.glowR)}</g>` : "";
  const k = s.k ?? 1, sc0 = k !== 1 ? `<g transform="translate(${f(ox)} ${f(oy)}) scale(${f4(k)}) translate(${f(-ox)} ${f(-oy)})">` : "", sc1 = k !== 1 ? "</g>" : "";
  return `<g id="${p}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}" data-state="${st}" data-k="${f4(k)}" ${s.attrs ?? ""}><g id="${p}-mv" data-k="${f4(k)}">${sc0}${glowSvg}${s.shadow ?? ""}
  <g id="${p}-solid" opacity="${broken ? 0.18 : 1}">${s.solid}</g>
  ${wireSvg(p + "-wire", o, s.wire, { opacity: broken ? 1 : 0 })}
  ${badgeSvg(p + "-x", s.center, (s.badgeR ?? 30) / k, broken && opts.badge !== false ? 1 : 0)}${sc1}</g></g>`;
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
const RED = "#e0453a", GREEN = "#1f9d55", TEAL = "#2aa3c9", GREY = "#b9b4aa";
const WOOD = { f: "#b98454", s: "#956236", t: "#d0a172", st: "#6a4220" };
const PANEL = { f: "#2f3540", s: "#232831", t: "#454c58", st: "#11141a" };
const lampSvg = (p, cx, cy, r, color) =>
  `<circle cx="${cx}" cy="${cy}" r="${r + 1.5}" fill="#3b3e44"/>` +
  `<circle id="${p}-lamp-green" cx="${cx}" cy="${cy}" r="${r}" fill="${GREEN}" opacity="${color === "green" ? 1 : 0}"/>` +
  `<circle id="${p}-lamp-red" cx="${cx}" cy="${cy}" r="${r}" fill="${RED}" opacity="${color === "red" ? 1 : 0}"/>` +
  `<circle cx="${cx - r * 0.35}" cy="${cy - r * 0.35}" r="${r * 0.35}" fill="#ffffff" opacity="0.6"/>`;

// =====================================================================================
// 看街的窗 viewWindow — 立在地上的一扇木窗：两根短木脚 + 木窗框 + 前伸的窗台，正面朝 +v；窗里不是玻璃而是一块屏幕：
//   浅色天空 + 一条灰色小街 + 三辆青蓝简笔小车，屏幕下沿一条细进度条；窗台前挂一块白底小牌（label），窗台右端一盏小灯。
// 约 150×30×170（窗台前伸到 v 30）。
// opts: mode="live"|"delayed"|"replay", label="屏幕", scale, state
// 状态（mode）：live 车流（用 KITX17.winFlow 推）、小灯绿；delayed 屏幕右下"延迟"小牌亮（青蓝），车流慢一拍；
//   replay 左上红点 + "录像"亮，屏幕画面变灰，屏幕红虚线框。state attacker 窗框内沿红色；broken 整件变虚 + 红叉（kit 同款）。
// 可动：ID-cars（小车组，每辆 ID-car-0..2，KITX17.winFlow 平移，出右边从左边回来）、ID-delay（"延迟"小牌，层 ID-delay-on）、
//   ID-rec（红点 + "录像"）、ID-grey（屏幕变灰层）、ID-bad（屏幕红虚线框）、ID-lamp（层 ID-lamp-green / -red）、ID-bar（进度条填充）
// anchors: top, center, ground, screen（屏幕中心，供红虚线连线）, sill（窗台正面中心）, label（小牌中心）, lamp
// =====================================================================================
export function viewWindow(o, opts = {}) {
  const p = opts.id ?? "win", K = opts.scale ?? 1, st = opts.state ?? "normal", atk = st === "attacker";
  const mode = opts.mode ?? "live", label = opts.label ?? "屏幕";
  const U0 = -75, U1 = 75, V0 = -12, V1 = 12, Z0 = 40, Z1 = 170, W = U1 - U0, H = Z1 - Z0;
  let s = contactShadow(o, 92, 34, 0, 4);
  // legs
  for (const u of [-58, 50]) s += box(o, u, u + 8, -6, 6, 0, Z0 + 4, WOOD, 1.2);
  // frame body
  s += box(o, U0, U1, V0, V1, Z0, Z1, WOOD, 1.8);
  // front face: frame border + screen
  const Fm = frameV(o, U0, V1, Z1);
  const B = 12, SX0 = B, SX1 = W - B, SY0 = B, SY1 = H - B - 16;   // screen rect (local); sill sits below
  const SW = SX1 - SX0, SH = SY1 - SY0;
  let fr = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="3" fill="none" stroke="${darken(WOOD.f, 0.2)}" stroke-width="1.2"/>`;
  fr += `<rect x="${SX0 - 3}" y="${SY0 - 3}" width="${SW + 6}" height="${SH + 6}" rx="3" fill="${atk ? RED : "#5a3a1c"}"/>`;
  fr += `<defs><clipPath id="${p}-sclip"><rect x="${SX0}" y="${SY0}" width="${SW}" height="${SH}" rx="2"/></clipPath></defs>`;
  let scr = `<rect x="${SX0}" y="${SY0}" width="${SW}" height="${SH}" fill="#dff1f6"/>`;
  // houses on the far side of the street
  for (const [x, w, h] of [[8, 22, 30], [34, 16, 22], [54, 26, 36], [84, 18, 26], [104, 20, 32]])
    scr += `<rect x="${SX0 + x}" y="${SY0 + 52 - h}" width="${w}" height="${h}" fill="#c9d6dc" stroke="#9fb1b9" stroke-width="0.8"/>`;
  // street
  scr += `<rect x="${SX0}" y="${SY0 + 52}" width="${SW}" height="30" fill="#8e9399"/><path d="M${SX0} ${SY0 + 67}H${SX1}" stroke="#ffffff" stroke-width="1.6" stroke-dasharray="8 6"/>`;
  scr += `<rect x="${SX0}" y="${SY0 + 82}" width="${SW}" height="${SH - 82}" fill="#c9c3b6"/>`;
  // cars: drawn at local x = 0, moved by translate(x) (data-x0 = start x, data-span = wrap span)
  const span = SW + 40, carX = [10, 52, 92], carY = [SY0 + 56, SY0 + 69, SY0 + 56];
  const car = (i) => {
    const y = carY[i];
    return `<g id="${p}-car-${i}" data-x0="${carX[i]}" transform="translate(${SX0 - 20 + carX[i]} 0)">` +
      `<rect x="0" y="${y + 2}" width="22" height="8" rx="2.5" fill="${TEAL}" stroke="#17607a" stroke-width="0.8"/>` +
      `<path d="M4 ${y + 2}L7 ${y - 3}H15L18 ${y + 2}Z" fill="#7fcbe2" stroke="#17607a" stroke-width="0.8"/>` +
      `<circle cx="6" cy="${y + 10}" r="2.4" fill="#1c1c1c"/><circle cx="16" cy="${y + 10}" r="2.4" fill="#1c1c1c"/></g>`;
  };
  scr += `<g id="${p}-cars" data-span="${span}" data-x="${SX0 - 20}" data-s="0">${[0, 1, 2].map(car).join("")}</g>`;
  // grey replay wash
  scr += `<rect id="${p}-grey" x="${SX0}" y="${SY0}" width="${SW}" height="${SH}" fill="#9a958b" opacity="${mode === "replay" ? 0.55 : 0}"/>`;
  fr += `<g clip-path="url(#${p}-sclip)">${scr}</g>`;
  // progress bar
  fr += `<rect x="${SX0}" y="${SY1 - 4}" width="${SW}" height="4" fill="#5b6066"/><rect id="${p}-bar" x="${SX0}" y="${SY1 - 4}" width="${SW * 0.62}" height="4" fill="${TEAL}"/>`;
  // "延迟" chip (bottom-right) and "录像" (top-left)
  fr += `<g id="${p}-delay"><rect x="${SX1 - 34}" y="${SY1 - 20}" width="30" height="13" rx="3" fill="${GREY}"/>` +
    `<rect id="${p}-delay-on" x="${SX1 - 34}" y="${SY1 - 20}" width="30" height="13" rx="3" fill="${TEAL}" opacity="${mode === "delayed" ? 1 : 0}"/>` +
    txt(SX1 - 19, SY1 - 10.5, "延迟", { size: 9, anchor: "middle", fill: "#ffffff" }) + `</g>`;
  fr += `<g id="${p}-rec" opacity="${mode === "replay" ? 1 : 0}"><rect x="${SX0 + 3}" y="${SY0 + 3}" width="36" height="14" rx="3" fill="#ffffff" opacity="0.85"/>` +
    `<circle cx="${SX0 + 10}" cy="${SY0 + 10}" r="4" fill="${RED}"/>` + txt(SX0 + 26, SY0 + 14, "录像", { size: 9, anchor: "middle", fill: RED }) + `</g>`;
  fr += `<g id="${p}-bad" opacity="${mode === "replay" ? 1 : 0}"><rect x="${SX0 - 1}" y="${SY0 - 1}" width="${SW + 2}" height="${SH + 2}" rx="3" fill="none" stroke="${RED}" stroke-width="2.6" stroke-dasharray="6 4"/></g>`;
  s += G_(matStr(Fm), fr);
  // sill: sticks out to the front
  const SZ = Z0 + 14;
  s += box(o, U0 - 8, U1 + 8, V0, V1 + 18, SZ - 8, SZ, WOOD, 1.4);
  // label plate hanging from the sill front
  const Lm = frameV(o, -32, V1 + 18.5, SZ - 8);
  s += G_(matStr(Lm), `<rect x="0" y="1" width="64" height="20" rx="3" fill="${C.paper}" stroke="#9a958b" stroke-width="1"/>` + txt(32, 16, label, { size: 13, anchor: "middle" }));
  // lamp on the sill top (right end)
  const [lx, ly] = at(o, U1 - 2, V1 + 9, SZ + 3);
  s += `<g>${lampSvg(p, f(lx), f(ly), 4.2, "green")}</g>`;
  const anchors = {
    top: at(o, 0, 0, Z1 + 16), center: at(o, 0, 0, (Z0 + Z1) / 2), ground: at(o), screen: applyM(Fm, (SX0 + SX1) / 2, (SY0 + SY1) / 2),
    sill: at(o, 0, V1 + 18, SZ - 4), label: applyM(Lm, 32, 11), lamp: [lx, ly],
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [[U0, U1, V0, V1 + 18, 0, Z1]], center: anchors.center, glowR: 100, k: K, attrs: `data-mode="${mode}"` }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

// =====================================================================================
// 对等连接插线板 peerPanel — 一块立式网络插线板：墨色金属立板装在小底座上，正面顶部一块白底小铭牌（label），下面一排 n 个网口，
//   每个网口插一根短线缆垂下、线缆末端一个圆形小标签（来源颜色）；立板顶上一盏状态灯。
// 约 160×40×120。
// opts: n=8, colors（每根线缆颜色 "ink"|"teal"|"red"|"green"；默认墨 / 青蓝相间 = 不同运营方）, anchorsOn=false（前 2 根换成绿色锚点插头）,
//   mode="diverse"|"eclipsed"|"anchored"（eclipsed = 全部红色覆盖、灯仍绿；anchored = anchorsOn 且 2 号起红）, label="对等连接", lamp="green", scale, state
// 状态：diverse / eclipsed / anchored 见上。state attacker = eclipsed 外观；broken 整件变虚 + 红叉。
// 可动：ID-cables（线缆组；每根 ID-cable-i，红色覆盖层 ID-cable-i-red，KITX17.peerRed 逐根 / 全部变红）、
//   ID-anchor（两只绿色锚点插头，KITX17.peerAnchor 弹入 / 隐藏）、ID-lamp（层 ID-lamp-green / -red，KITX17.peerLamp）
// anchors: top, center, ground, ports[]（n 个网口中心，供连线）, tags[]（线缆末端小标签中心）, lamp, plate
// =====================================================================================
export function peerPanel(o, opts = {}) {
  const p = opts.id ?? "peer", K = opts.scale ?? 1, st = opts.state ?? "normal";
  const n = Math.max(1, opts.n ?? 8), label = opts.label ?? "对等连接";
  const mode = st === "attacker" ? "eclipsed" : opts.mode ?? (opts.anchorsOn ? "anchored" : "diverse");
  const anchorsOn = opts.anchorsOn ?? mode === "anchored";
  const COL = { ink: "#2b2f36", teal: TEAL, red: RED, green: GREEN };
  const colors = Array.from({ length: n }, (_, i) => (opts.colors && opts.colors[i]) || (i % 2 ? "teal" : "ink"));
  const redAt = (i) => mode === "eclipsed" || (mode === "anchored" && i >= 2 && opts.mode === "anchored");
  const U0 = -80, U1 = 80, V0 = -8, V1 = 8, Z0 = 14, Z1 = 116, W = U1 - U0, H = Z1 - Z0;
  let s = contactShadow(o, 100, 40, 0, 2);
  // base + feet
  s += box(o, -70, 70, -20, 20, 0, Z0, M.steel, 1.4);
  // panel
  s += box(o, U0, U1, V0, V1, Z0, Z1, PANEL, 1.8);
  const Fm = frameV(o, U0, V1, Z1);
  let fr = `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="3" fill="none" stroke="#56606d" stroke-width="1"/>`;
  // screws
  for (const [x, y] of [[8, 8], [W - 8, 8], [8, H - 8], [W - 8, H - 8]]) fr += `<circle cx="${x}" cy="${y}" r="2" fill="#8b9199"/>`;
  // name plate (top strip)
  fr += `<rect x="${W / 2 - 42}" y="9" width="84" height="20" rx="3" fill="${C.paper}" stroke="#9a958b" stroke-width="1"/>` + txt(W / 2, 24, label, { size: 13, anchor: "middle" });
  // ports
  const gap = (W - 24) / n, PY = 44, ports = [], tags = [];
  let cab = "", anc = "";
  for (let i = 0; i < n; i++) {
    const x = 12 + gap * (i + 0.5);
    fr += `<rect x="${f(x - 6.5)}" y="${PY - 5.5}" width="13" height="11" rx="1.5" fill="#14171c" stroke="#6b7480" stroke-width="1"/><rect x="${f(x - 3.5)}" y="${PY - 2.5}" width="7" height="3" fill="${TEAL}" opacity="0.7"/>`;
    ports.push(applyM(Fm, x, PY));
    const sway = ((i * 5) % 7) - 3, ty = H - 14 + ((i * 3) % 4);
    const path = `M${f(x)} ${PY + 4}C${f(x)} ${PY + 22} ${f(x + sway)} ${ty - 16} ${f(x + sway)} ${ty - 6}`;
    const one = (c) => `<path d="${path}" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"/><rect x="${f(x - 4)}" y="${PY - 1}" width="8" height="7" rx="1" fill="${c}"/><circle cx="${f(x + sway)}" cy="${ty}" r="6" fill="${c}" stroke="#ffffff" stroke-width="1.2"/>`;
    cab += `<g id="${p}-cable-${i}">${one(COL[colors[i]] ?? COL.ink)}<g id="${p}-cable-${i}-red" opacity="${redAt(i) ? 1 : 0}">${one(RED)}</g></g>`;
    tags.push(applyM(Fm, x + sway, ty));
    if (i < 2) {
      // green anchor plug: bigger plug + anchor glyph on the tag
      anc += `<rect x="${f(x - 5.5)}" y="${PY - 3}" width="11" height="10" rx="1.5" fill="${GREEN}" stroke="#ffffff" stroke-width="1"/>` +
        `<path d="${path}" stroke="${GREEN}" stroke-width="4" fill="none" stroke-linecap="round"/>` +
        `<circle cx="${f(x + sway)}" cy="${ty}" r="7.5" fill="${GREEN}" stroke="#ffffff" stroke-width="1.4"/>` +
        `<path d="M${f(x + sway)} ${ty - 4.5}V${ty + 4}M${f(x + sway - 3)} ${ty - 2}H${f(x + sway + 3)}M${f(x + sway - 4)} ${ty + 1}Q${f(x + sway)} ${ty + 6} ${f(x + sway + 4)} ${ty + 1}" stroke="#ffffff" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
    }
  }
  fr += `<g id="${p}-cables">${cab}</g><g id="${p}-anchor" opacity="${anchorsOn ? 1 : 0}">${anc}</g>`;
  s += G_(matStr(Fm), fr);
  // status lamp on top
  s += cyl(o, 0, 0, 7, Z1, Z1 + 6, M.steel, { seg: 20, sw: 0.8 });
  const [lx, ly] = at(o, 0, 0, Z1 + 12);
  s += lampSvg(p, f(lx), f(ly), 6, opts.lamp ?? "green");
  const anchors = {
    top: at(o, 0, 0, Z1 + 26), center: at(o, 0, 0, (Z0 + Z1) / 2), ground: at(o), ports, tags, lamp: [lx, ly], plate: applyM(Fm, W / 2, 19),
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [[U0, U1, -20, 20, 0, Z1]], center: anchors.center, glowR: 110, k: K, attrs: `data-n="${n}" data-mode="${mode}"` }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

export const CATALOG_EXT = { viewWindow, peerPanel };
/** runtime-ext.js contents — inline after iso.runtimeJs() (and other chapters' runtime-ext) */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
