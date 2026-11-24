// objects-ext.mjs — 第 22 集（人身与账号安全）补充拟物物件，与 kit/objects.mjs 同一投影、同一接口
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"
//   opts.glow = true 时脚下绿色地光；opts.scale = 以地面原点等比缩放（anchors 已换算）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，KIT.grow / KIT.broke 直接可用；另有一层 ID-mv（整件包一层）。
// 动画助手在 runtime-ext.js（window.KITX22，并以不覆盖的方式合并进 window.KITX），用 runtimeExtJs() 内联在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
// id 不要取 cam / root（舞台容器同名）。
import fs from "node:fs";
import { V, CE, f, f4, at, C, M, faceV, faceTop, box, glow, contactShadow, wireSvg, badgeSvg } from "../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const isAscii = (s) => /^[\x00-\x7f]*$/.test(String(s));
const RED = "#e0453a", TEAL = "#2aa3c9";
function shell(p, o, opts, s) {
  const st = opts.state ?? "normal", broken = st === "broken";
  const glowOn = (opts.glow ?? s.glowDefault ?? false) && !broken && st !== "attacker";
  const [ox, oy] = at(o);
  const glowSvg = s.glowR ? `<g id="${p}-glow" opacity="${glowOn ? 1 : 0}">${glow(p + "-gl", s.glowAt ?? o, s.glowR)}</g>` : "";
  const k = s.k ?? 1, sc0 = k !== 1 ? `<g transform="translate(${f(ox)} ${f(oy)}) scale(${f4(k)}) translate(${f(-ox)} ${f(-oy)})">` : "", sc1 = k !== 1 ? "</g>" : "";
  return `<g id="${p}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}" data-state="${st}" data-k="${f4(k)}" ${s.attrs ?? ""}><g id="${p}-mv" data-k="${f4(k)}">${sc0}${s.under ?? ""}${glowSvg}${s.shadow ?? ""}
  <g id="${p}-solid" opacity="${broken ? opts.ghost ?? s.ghost ?? 0.18 : 1}">${s.solid}</g>
  ${wireSvg(p + "-wire", o, s.wire, { opacity: broken && s.wire.length ? 1 : 0 })}
  ${badgeSvg(p + "-x", s.center, (s.badgeR ?? 30) / k, broken && s.badge !== false && opts.badge !== false ? 1 : 0)}${s.over ?? ""}${sc1}</g></g>`;
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
const shift = (inner, d) => `<g transform="translate(${f(d[0])},${f(d[1])})">${inner}</g>`;

// =====================================================================================
// SIM 卡 simCard — 一张立在黑色小夹座上的手机 SIM 卡（卡约 60×4×44，正面朝 +v 看向观众）：白色塑料卡身、右上角切一个斜角，
//   正面中间一块金色六格芯片（细线分格），芯片下方一行小字 label。stand:false = 平放（卡面朝上，用于插进手机卡槽），无夹座。
// 约 72×20×52（含夹座）；平放约 60×44×3。
// opts: label="SIM", state, tone（"teal" = 青蓝边，受害者原卡）, scale, stand=true, glow
// 状态：normal 白卡灰边；tone teal 青蓝边；attacker 红边 + 浅红底 + 红字；broken 整件变虚 + 红叉（kit 通用，可用 KIT.broke）。
// 可动：ID-chip（芯片组），ID-chip-lit（芯片上一层亮光，KITX22.chip 开关、KITX22.chipFlash 闪几下；颜色 gold / teal / red）。
// anchors: top（卡顶上方）, center（卡面中心）, chip（芯片中心）, ground
// =====================================================================================
export function simCard(o, opts = {}) {
  const p = opts.id ?? "sim", K = opts.scale ?? 1, st = opts.state ?? "normal", atk = st === "attacker";
  const label = opts.label ?? "SIM", stand = opts.stand !== false;
  const W = 60, H = 44, T = 4, CUT = 11;
  const edge = atk ? RED : opts.tone === "teal" ? TEAL : "#9a9387";
  const fill = atk ? "#fde3df" : opts.tone === "teal" ? "#f3fafc" : "#fdfcf9";
  const side = atk ? "#e9b3ac" : opts.tone === "teal" ? "#bfe3ef" : "#e3ddd1";
  const txt = atk ? RED : opts.tone === "teal" ? C.tealText : C.ink;
  // card outline in local face coords (x right 0..W, y down 0..H), top-right corner cut
  const outline = `M0 3Q0 0 3 0H${W - CUT}L${W} ${CUT}V${H - 3}Q${W} ${H} ${W - 3} ${H}H3Q0 ${H} 0 ${H - 3}Z`;
  const CW = 24, CH = 18, cx0 = (W - CW) / 2, cy0 = 8;
  const chipG = (lit) => `<g id="${p}-chip"><rect x="${cx0}" y="${cy0}" width="${CW}" height="${CH}" rx="3" fill="${M.gold.f}" stroke="${M.gold.st}" stroke-width="1.2"/>` +
    `<path d="M${cx0 + CW / 3} ${cy0}V${cy0 + CH}M${cx0 + (2 * CW) / 3} ${cy0}V${cy0 + CH}M${cx0} ${cy0 + CH / 2}H${cx0 + CW}" stroke="${M.gold.st}" stroke-width="0.9" fill="none"/>` +
    `<rect x="${cx0 + CW / 3 + 1.5}" y="${cy0 + 3}" width="${CW / 3 - 3}" height="${CH - 6}" rx="1.5" fill="${M.gold.t}" stroke="${M.gold.st}" stroke-width="0.7"/>` +
    `<g id="${p}-chip-lit" opacity="0">${lit}</g></g>`;
  const lit = `<rect x="${cx0 - 4}" y="${cy0 - 4}" width="${CW + 8}" height="${CH + 8}" rx="6" fill="none" stroke="#ffe08a" stroke-width="3"/>` +
    `<rect x="${cx0}" y="${cy0}" width="${CW}" height="${CH}" rx="3" fill="#fff6c8" opacity="0.65"/>`;
  const fs_ = Math.min(10, Math.floor(((W - 10) / Math.max(1, String(label).length)) * (isAscii(label) ? 1.6 : 0.95)));
  const face = `<path d="${outline}" fill="${fill}" stroke="${edge}" stroke-width="${atk || opts.tone === "teal" ? 2.4 : 1.6}" stroke-linejoin="round"/>` + chipG(lit) +
    (label ? `<text x="${W / 2}" y="${H - 7}" ${isAscii(label) ? MONO : FONT} font-size="${fs_}" font-weight="900" fill="${txt}" text-anchor="middle">${label}</text>` : "");
  const back = `<path d="${outline}" fill="${side}" stroke="${edge}" stroke-width="1.4" stroke-linejoin="round"/>`;
  let s = "", anchors, wire;
  if (stand) {
    const Z0 = 7;
    s += contactShadow(o, 40, 16);
    // black clip stand: low base + slotted block
    s += box(o, -36, 36, -10, 10, 0, 5, M.dark, 1.2);
    s += box(o, -24, 24, -6, 6, 5, 12, M.ink, 1.2);
    const fr = (dv) => faceV(o, -W / 2, dv, Z0 + H);
    const dvec = [V[0], V[1]];
    for (let i = T; i > 0; i -= 1) s += shift(G_(fr(T / 2), back), [-dvec[0] * i, -dvec[1] * i]);
    s += G_(fr(T / 2), face);
    // front lip of the clip over the card's foot
    s += box(o, -24, 24, 2, 7, 5, 12, M.ink, 1.2);
    const ch = at(o, 0, T / 2, Z0 + H - cy0 - CH / 2);
    anchors = { top: at(o, 0, 0, Z0 + H + 12), center: at(o, 0, T / 2, Z0 + H / 2), chip: ch, ground: at(o) };
    wire = [[-36, 36, -10, 10, 0, 12], [-W / 2, W / 2, -T / 2, T / 2, Z0, Z0 + H]];
  } else {
    // flat on the ground: local x → +u, local y → +v (card top edge toward −v)
    const fr = (z) => faceTop(o, -W / 2, -H / 2, z);
    s += contactShadow(o, 36, 26);
    s += shift(G_(fr(0), back), [0, 0]);
    s += shift(G_(fr(T * 0.75), back), [0, 0]);
    s += G_(fr(T), face);
    const ch = at(o, -W / 2 + W / 2, -H / 2 + cy0 + CH / 2, T);
    anchors = { top: at(o, 0, 0, 30), center: at(o, 0, 0, T), chip: ch, ground: at(o) };
    wire = [[-W / 2, W / 2, -H / 2, H / 2, 0, T]];
  }
  return {
    svg: shell(p, o, opts, { solid: s, wire, center: anchors.center, glowR: 50, badgeR: 20, k: K }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

// =====================================================================================
// 扳手 wrench — 一把银灰色活动扳手斜靠在一块小木垫上（约 120×30×40，扳手在 u 方向的竖直面里，头朝 +u 抬起）：
//   开口端两颚（上面固定颚、下面活动颚）+ 调节螺纹轮，长柄末端一个挂孔，柄上压一圈深灰防滑纹。只是工具，不带血迹、不带人手。
// opts: state（"attacker" = 柄身描红边）, scale, glow
// 状态：normal 银灰；attacker 柄身外框红色；broken 整件变虚 + 红叉（kit 通用，可用 KIT.broke）。无可动部件。
// anchors: top（扳手头上方）, center, head（开口端中心）, ground
// =====================================================================================
export function wrench(o, opts = {}) {
  const p = opts.id ?? "wrench", K = opts.scale ?? 1, st = opts.state ?? "normal", atk = st === "attacker";
  let s = contactShadow(o, 74, 28);
  // small wooden pad under the head end
  s += box(o, 26, 58, -14, 14, 0, 14, M.wood, 1.3);
  s += `<path d="M${at(o, 30, -14, 9).map(f).join(" ")}L${at(o, 54, -14, 9).map(f).join(" ")}" stroke="${M.wood.st}" stroke-width="0.8" opacity="0.5"/>`;
  // wrench silhouette in the u-z plane (local x → +u, local y → −z), tilted head-up
  const ROT = -11, Z0 = 20;
  const handle = `M-60 -5Q-66 -5 -66 0Q-66 5 -60 5H22L28 8V-8L22 -5Z`;
  const head = `M20 -7Q24 -16 34 -18L58 -26Q62 -26 62 -22L60 -12L47 -9V1L60 3Q63 4 62 8L60 12Q46 15 32 14Q22 12 20 7Z`;
  const outline = (fillH, fillB, stH, stB, swH) =>
    `<path d="${handle}" fill="${fillH}" stroke="${stH}" stroke-width="${swH}" stroke-linejoin="round"/>` +
    `<path d="${head}" fill="${fillB}" stroke="${stB}" stroke-width="1.5" stroke-linejoin="round"/>`;
  const front =
    outline(M.chrome.f, M.chrome.t, atk ? RED : M.chrome.st, M.chrome.st, atk ? 2.6 : 1.5) +
    `<circle cx="-58" cy="0" r="2.8" fill="${M.steel.s}" stroke="${M.chrome.st}" stroke-width="0.8"/>` +              // hang hole
    `<rect x="-46" y="-5" width="34" height="10" rx="2" fill="${M.dark.f}" stroke="${M.dark.st}" stroke-width="0.8"/>` +  // grip band
    Array.from({ length: 8 }, (_, i) => `<path d="M${-43 + i * 4} -5L${-45 + i * 4} 5" stroke="${M.dark.t}" stroke-width="1"/>`).join("") +
    `<path d="M47 -9H58" stroke="${M.chrome.st}" stroke-width="0.8" opacity="0.6"/>` +
    `<path d="M24 -2H42" stroke="${M.chrome.st}" stroke-width="1" opacity="0.5"/>` +                                // slider groove
    `<rect x="31" y="3" width="12" height="9" rx="4" fill="${M.steelLight.f}" stroke="${M.steel.st}" stroke-width="0.9"/>` + // worm wheel
    Array.from({ length: 4 }, (_, i) => `<path d="M${33 + i * 2.6} 3.6V11.4" stroke="${M.steel.st}" stroke-width="0.8"/>`).join("");
  const backT = outline(M.steelLight.s, M.steelLight.s, M.steel.st, M.steel.st, 1.2);
  const fr = (dv) => `${faceV(o, 0, dv, Z0)} rotate(${ROT})`;
  for (let i = 5; i >= 1; i--) s += G_(fr(-i), backT);
  s += G_(fr(0), front);
  // anchors: rotate local points into the plane
  const r = (ROT * Math.PI) / 180, cs = Math.cos(r), sn = Math.sin(r);
  const P = (x, y, dv = 0) => { const X = x * cs - y * sn, Y = x * sn + y * cs; return at(o, X, dv, Z0 - Y); };
  const anchors = { top: P(58, -40), center: P(0, 0), head: P(54, -4), ground: at(o) };
  return {
    svg: shell(p, o, opts, {
      solid: s, wire: [[26, 58, -14, 14, 0, 14], [-66, 62, -5, 1, 2, 42]], center: anchors.center, glowR: 70, badgeR: 22, k: K,
    }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

export const CATALOG_EXT = { simCard, wrench };
/** runtime-ext.js contents — inline after iso.runtimeJs() (and other chapters' runtime-ext) */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
