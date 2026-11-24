// objects-ext.mjs — 第 24 集（数据与隐私）补充拟物物件，与 kit/objects.mjs 同一投影、同一接口
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken"
//   opts.glow = true 时脚下绿色地光；opts.scale = 以地面原点等比缩放（anchors 已换算）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，KIT.grow 直接可用；另有一层 ID-mv（整件包一层）。
// 动画助手在 runtime-ext.js（window.KITX24，并以不覆盖的方式合并进 window.KITX），用 runtimeExtJs() 内联在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
// id 不要取 cam / root（舞台容器同名）。
import fs from "node:fs";
import { CE, f, f4, at, C, M, cyl, frustum, flat, circlePlan, glow, contactShadow, wireSvg, badgeSvg } from "../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
const isAscii = (s) => /^[\x00-\x7f]*$/.test(String(s));
const RED = "#e0453a";
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
// 盐罐 saltShaker — 等距小盐罐（约 50×50×90）：透明玻璃圆柱罐身，里面白色细颗粒（点阵小圆）占约 2/3，顶上银色钢盖带 5 个小孔；
//   罐身正面贴一张米白小标签写 label（"盐 · 32 字节" 这类带 " · " 的会拆成大字 + 小字两行）。
// opts: label="盐", level=0.66（0–1，颗粒高度）, state（"broken" = 盐已删除：罐身空、标签上一道红色斜线，整件不变虚、不出红叉）, scale, glow
// 可动：ID-grains（颗粒组，KITX24.empty 清空 / KITX24.refill 装回）, ID-cap（盖子，KITX24.capLift）,
//       ID-puff（盖孔上方飘出的 8 粒盐，KITX24.shake 抖一下就撒出）, ID-slash（标签红斜线，empty 时出现）
// anchors: top（盖顶上方）, center（罐身中心）, ground, spout（盖孔上方，颗粒飘出的起点）, label（标签中心）
// =====================================================================================
export function saltShaker(o, opts = {}) {
  const p = opts.id ?? "salt", K = opts.scale ?? 1, st = opts.state ?? "normal", broken = st === "broken";
  const R = 25, ZB = 4, ZJ = 66, ZC1 = 80, ZC2 = 88;
  const level = Math.max(0, Math.min(1, opts.level ?? 0.66));
  const gh = Math.max(2, (ZJ - ZB - 4) * level);
  const raw = String(opts.label ?? "盐");
  const [l1, l2] = raw.includes(" · ") ? [raw.split(" · ")[0], raw.split(" · ").slice(1).join(" · ")] : [raw, ""];
  // front-most point of the round body (normal points at the viewer): its tangent projects to pure screen-horizontal
  const FN = [-0.574, 0.819];
  const front = (r, z) => at(o, FN[0] * r, FN[1] * r, z);
  const faceF = (r, z) => { const [x, y] = front(r, z); return `matrix(1,0,0,${f4(CE)},${f(x)},${f(y)})`; };

  let s = contactShadow(o, 34, 22);
  // glass base (thick bottom)
  s += cyl(o, 0, 0, R, 0, ZB, { f: "rgba(190,224,237,0.55)", s: "rgba(170,210,226,0.6)", t: "rgba(236,248,252,0.7)", st: "rgba(42,163,201,0.75)" }, { sw: 1.2 });
  // grains: white cylinder + speckles on its front
  let gr = cyl(o, 0, 0, R - 3, ZB, ZB + gh, { f: "#f7f5f0", s: "#e6e1d6", t: "#ffffff", st: "#cfc8ba" }, { sw: 0.8 });
  let dots = "";
  for (let i = 0; i < 46; i++) {
    const x = ((i * 37) % 41) - 20, zz = ((i * 23) % 29) / 29 * (gh - 3) + 1.5;
    const rr = 1.1 + ((i * 7) % 5) * 0.18;
    dots += `<circle cx="${f(x)}" cy="${f(-zz)}" r="${f(rr)}" fill="${i % 3 ? "#d8d2c5" : "#ffffff"}" stroke="#bdb5a6" stroke-width="0.4"/>`;
  }
  gr += `<g transform="${faceF(R - 3, ZB)}">${dots}</g>`;
  // top surface speckles
  let top = "";
  for (let i = 0; i < 14; i++) {
    const a = (i * 137.5 * Math.PI) / 180, rr = (R - 6) * Math.sqrt((i + 0.5) / 14);
    const [x, y] = at(o, Math.cos(a) * rr, Math.sin(a) * rr, ZB + gh);
    top += `<circle cx="${f(x)}" cy="${f(y)}" r="1.3" fill="#d8d2c5"/>`;
  }
  s += `<g id="${p}-grains" opacity="${broken ? 0 : 1}">${gr}${top}</g>`;
  // glass body (translucent, no cap so the grains show) + rim + highlights
  s += cyl(o, 0, 0, R, ZB, ZJ, M.glass, { top: false, sw: 1.4 });
  s += flat(o, circlePlan(0, 0, R, 40), ZJ, "rgba(236,248,252,0.35)", M.glass.st, 1.2);
  const [hx0, hy0] = at(o, -0.94 * R, 0.34 * R, ZB + 6), [hx1, hy1] = at(o, -0.94 * R, 0.34 * R, ZJ - 6);
  s += `<path d="M${f(hx0)} ${f(hy0)}L${f(hx1)} ${f(hy1)}" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.8"/>`;
  // label (two lines when "a · b")
  const LW = 40, LH = l2 ? 27 : 20, LZ = 18 + LH;
  const fs1 = Math.min(15, Math.floor((LW - 6) / Math.max(1, l1.length) * (isAscii(l1) ? 1.6 : 1)));
  const fs2 = Math.min(8.5, Math.floor((LW - 4) / Math.max(1, l2.length) * (isAscii(l2) ? 1.7 : 1.05)));
  let lab = `<rect x="${-LW / 2}" y="0" width="${LW}" height="${LH}" rx="2.5" fill="#fbf6e9" stroke="#b8b0a1" stroke-width="1"/>` +
    `<text x="0" y="${l2 ? 14 : 15}" ${isAscii(l1) ? MONO : FONT} font-size="${fs1}" font-weight="900" fill="${C.ink}" text-anchor="middle">${l1}</text>` +
    (l2 ? `<text x="0" y="${LH - 4}" ${isAscii(l2) ? MONO : FONT} font-size="${fs2}" font-weight="700" fill="${C.sub}" text-anchor="middle">${l2}</text>` : "") +
    `<path id="${p}-slash" d="M${-LW / 2 - 3} ${LH + 2}L${LW / 2 + 3} -2" stroke="${RED}" stroke-width="3" stroke-linecap="round" opacity="${broken ? 1 : 0}"/>`;
  s += `<g id="${p}-label" transform="${faceF(R + 0.5, LZ)}">${lab}</g>`;
  // cap: steel band + dome + 5 holes
  let cap = cyl(o, 0, 0, R + 1.5, ZJ - 2, ZC1, M.chrome, { top: false, sw: 1.4 });
  for (let i = 0; i < 3; i++) cap += `<g transform="${faceF(R + 1.6, ZJ + 1 + i * 4.5)}"><path d="M-22 0H22" stroke="${M.chrome.st}" stroke-width="0.6" opacity="0.45"/></g>`;
  cap += frustum(o, 0, 0, R + 1.5, 15, ZC1, ZC2, M.chrome, { sw: 1.4 });
  const holes = [[0, 0], [7, 0], [-7, 0], [0, 7], [0, -7]];
  for (const [du, dv] of holes) cap += flat(o, circlePlan(du, dv, 1.9, 12), ZC2, M.steel.s, M.steel.st, 0.6);
  s += `<g id="${p}-cap">${cap}</g>`;
  // puff: 8 grains just above the spout, hidden until KITX24.shake
  const [sx, sy] = at(o, 0, 0, ZC2 + 4);
  let puff = "";
  for (let i = 0; i < 8; i++) puff += `<circle id="${p}-puff-${i}" cx="${f(sx + ((i * 5) % 9) - 4)}" cy="${f(sy - ((i * 3) % 5))}" r="${f(1.6 + (i % 3) * 0.4)}" fill="#ffffff" stroke="#b8b0a1" stroke-width="0.5" opacity="0"/>`;
  const over = `<g id="${p}-puff">${puff}</g>`;

  const anchors = {
    top: at(o, 0, 0, ZC2 + 14), center: at(o, 0, 0, ZJ / 2), ground: at(o), spout: [f(sx), f(sy)],
    label: front(R, LZ - LH / 2),
  };
  return {
    svg: shell(p, o, opts, { solid: s, over, wire: [], ghost: 1, badge: false, center: anchors.center, glowR: 60, badgeR: 18, k: K }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

export const CATALOG_EXT = { saltShaker };
/** runtime-ext.js contents — inline after iso.runtimeJs() (and other chapters' runtime-ext) */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
