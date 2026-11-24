// objects-ext.mjs — 第 26 集（AI 与 Web3 安全）补充拟物物件，与 kit/objects.mjs 同一投影、同一接口
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "attacker"
//   opts.glow = true 时脚下绿色地光；opts.scale = 以地面原点等比缩放（anchors 已换算）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，KIT.grow 直接可用；另有一层 ID-mv（整件包一层）。
// 动画助手在 runtime-ext.js（window.KITX26，并以不覆盖的方式合并进 window.KITX），用 runtimeExtJs() 内联在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
// id 不要取 cam / root（舞台容器同名）。
import fs from "node:fs";
import { CE, f, f4, at, C, M, box, faceV, faceTop, frameV, applyM, matStr, glow, contactShadow, wireSvg, badgeSvg } from "../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
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

// =====================================================================================
// 换脸面具 faceMask — 一只白色硬质半脸面具（额头到鼻尖，无五官细节：两个眼洞 + 一道浅色鼻梁高光）正对 +v（观众），
//   立在墨色小托架上（底座 + 背后一根立杆）；面具背面是一层略大的墨色内壳，边缘露出一圈青蓝细电路纹（= "AI 生成"）。
//   约 70×30×110。托架底座正面一块小牌写 label。
// opts: label="换脸"（托架小牌文字）, state（"attacker" = 面具边缘一圈红色描边）, scale, glow
// 可动：ID-mask（面具本体连背壳 / 电路纹，可整体平移到手机屏幕前，KITX26.maskMove）,
//       ID-circ-hi（电路纹高亮，KITX26.circuit 闪一下）, ID-red（红色描边，KITX26.maskRed）
// anchors: top（面具顶上方）, center（面具中心）, ground, mask（面具正面中心，= center）, plate（托架小牌）
// =====================================================================================
export function faceMask(o, opts = {}) {
  const p = opts.id ?? "mask", K = opts.scale ?? 1, st = opts.state ?? "normal", atk = st === "attacker";
  const label = String(opts.label ?? "换脸");
  const MZ = 72, MV = 4;                 // face centre height, mask front plane v
  // mask outline in the +v face frame (local x → +u, local y → −z), centred on the face centre
  const face = "M-30 -26C-30 -40 -16 -38 0 -38C16 -38 30 -40 30 -26L29 2C28 18 14 30 0 34C-14 30 -28 18 -29 2Z";
  const INK = { f: "#34363b", s: "#25272b", t: "#4a4d53", st: "#141518" };

  let s = contactShadow(o, 40, 22);
  // bracket: base plate + post behind the mask + small cradle
  s += box(o, -35, 35, -15, 15, 0, 12, INK, 1.4);
  s += box(o, -3, 3, -10, -4, 12, 60, INK, 1.2);
  s += box(o, -12, 12, -10, -4, 56, 62, INK, 1.2);
  // label plate on the base's +v face
  const LW = 46, LH = 9;
  const fsz = Math.min(8, Math.floor((LW - 6) / Math.max(1, label.length) * (isAscii(label) ? 1.6 : 1)));
  s += `<g transform="${faceV(o, -LW / 2, 15.2, 10.5)}"><rect x="0" y="0" width="${LW}" height="${LH}" rx="1.5" fill="${C.cream}" stroke="#b8b0a1" stroke-width="0.8"/>` +
    `<text x="${LW / 2}" y="${LH - 2}" ${isAscii(label) ? MONO : FONT} font-size="${fsz}" font-weight="900" fill="${C.ink}" text-anchor="middle">${label}</text></g>`;

  // ---- the mask itself (moves as one group)
  const FB = faceV(o, 0, MV - 7, MZ);    // back shell plane
  const FF = faceV(o, 0, MV, MZ);        // front plane
  let mk = "";
  // back shell: a little larger, dark, with a teal circuit ring around the rim
  let circ = `<path d="${face}" transform="scale(1.1)" fill="#23262b" stroke="#141518" stroke-width="1.2"/>` +
    `<path d="${face}" transform="scale(1.05)" fill="none" stroke="${TEAL}" stroke-width="1.3" stroke-dasharray="7 3 2 3"/>`;
  for (const [x, y] of [[-31, -20], [31, -20], [-30, 6], [30, 6], [-18, 30], [18, 30], [-12, -42], [12, -42], [0, 38]])
    circ += `<circle cx="${x}" cy="${y}" r="1.8" fill="${TEAL}"/>`;
  for (const [x0, y0, x1, y1] of [[-31, -20, -33, -10], [31, -20, 33, -10], [-18, 30, -24, 26], [18, 30, 24, 26]])
    circ += `<path d="M${x0} ${y0}L${x1} ${y1}" stroke="${TEAL}" stroke-width="1.1"/>`;
  const circHi = `<g id="${p}-circ-hi" opacity="0"><path d="${face}" transform="scale(1.06)" fill="none" stroke="#7fdcf5" stroke-width="5" opacity="0.75"/>` +
    `<path d="${face}" transform="scale(1.06)" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-dasharray="7 3 2 3"/></g>`;
  mk += `<g transform="${FB}">${circ}${circHi}</g>`;
  // edge thickness: a few stacked copies between back and front planes
  for (let v = MV - 6; v < MV; v += 1.5) mk += `<g transform="${faceV(o, 0, v, MZ)}"><path d="${face}" fill="#d9d4ca" stroke="#b8b0a1" stroke-width="0.8"/></g>`;
  // front: white hard shell, eye holes, nose-bridge highlight, soft shading on the right cheek
  let fr = `<path d="${face}" fill="#fbfaf6" stroke="#b8b0a1" stroke-width="1.4"/>` +
    `<path d="M14 -34C26 -32 28 -20 27 0C26 14 18 24 8 30C18 18 22 4 21 -12C20 -24 18 -30 14 -34Z" fill="#e9e5dc" opacity="0.9"/>` +
    `<ellipse cx="-12" cy="-9" rx="7.5" ry="4.2" fill="#2a2e33"/><ellipse cx="12" cy="-9" rx="7.5" ry="4.2" fill="#2a2e33"/>` +
    `<path d="M-19 -9Q-12 -15 -5 -9" fill="none" stroke="#d6d0c4" stroke-width="1.2"/><path d="M5 -9Q12 -15 19 -9" fill="none" stroke="#d6d0c4" stroke-width="1.2"/>` +
    `<path d="M0 -20C-1.6 -8 -2.4 6 -1 20" fill="none" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round"/>` +
    `<path d="M1.8 -18C1.2 -6 1.8 8 4 19" fill="none" stroke="#e2ddd2" stroke-width="1.4" stroke-linecap="round"/>` +
    `<ellipse cx="-17" cy="-28" rx="7" ry="2.6" fill="#ffffff" opacity="0.9" transform="rotate(-12 -17 -28)"/>`;
  fr += `<g id="${p}-red" opacity="${atk ? 1 : 0}"><path d="${face}" fill="none" stroke="${RED}" stroke-width="3.2"/></g>`;
  mk += `<g transform="${FF}">${fr}</g>`;
  s += `<g id="${p}-mask" data-k="${f4(K)}">${mk}</g>`;

  const mFace = frameV(o, 0, MV, MZ);
  const anchors = {
    top: at(o, 0, MV, MZ + 38 + 14), center: applyM(mFace, 0, -2), ground: at(o), mask: applyM(mFace, 0, -2),
    plate: at(o, 0, 15, 6),
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [], ghost: 1, badge: false, center: anchors.center, glowR: 60, badgeR: 20, k: K }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

export const CATALOG_EXT = { faceMask };
/** runtime-ext.js contents — inline after iso.runtimeJs() (and other chapters' runtime-ext) */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
