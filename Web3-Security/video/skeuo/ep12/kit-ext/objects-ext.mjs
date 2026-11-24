// objects-ext.mjs — 第 12 集（跨链桥安全）补充拟物物件，与 kit/objects.mjs 同一投影、同一接口
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"
//   opts.glow = true 时脚下绿色地光；opts.scale = 以地面原点等比缩放（anchors 已换算）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，KIT.grow 直接可用；另有一层 ID-mv（整件包一层，便于段里平移）。
//   broken 只标出"缺的那一处"（根铭牌红虚线框 + 红叉），整件不变虚；ID-wire 为空，不要用 KIT.broke，改用 KITX12.rootState。
// 动画助手在 runtime-ext.js（window.KITX12，并以不覆盖的方式合并进 window.KITX），用 runtimeExtJs() 内联在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  f, f4, at, M, C, darken,
  frameV, matStr, applyM, faceTop,
  box, line3,
  glow, contactShadow, wireSvg, badgeSvg,
} from "../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const txt = (x, y, s, o = {}) =>
  `<text ${o.id ? `id="${o.id}"` : ""} x="${f(x)}" y="${f(y)}" ${o.mono ? MONO : FONT} font-size="${o.size ?? 20}" font-weight="${o.weight ?? 900}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}" ${o.extra ?? ""}>${s}</text>`;
const isAscii = (s) => /^[\x00-\x7f]*$/.test(String(s));
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
const RED = "#e0453a", GREEN = "#1f9d55", TEAL = "#2aa3c9";
/** red dashed frame (local 2-D, inside a face group); x = true adds the small red X dot at the top-right corner */
const badFrame = (id, x0, y0, x1, y1, on, x = true) =>
  `<g id="${id}" opacity="${on ? 1 : 0}"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="3" fill="rgba(224,69,58,0.08)" stroke="${RED}" stroke-width="2.4" stroke-dasharray="5 3"/>` +
  (x ? `<g id="${id}-x"><circle cx="${x1}" cy="${y0}" r="8.5" fill="${RED}" stroke="#ffffff" stroke-width="1.4"/><path d="M${x1 - 3.4} ${y0 - 3.4}L${x1 + 3.4} ${y0 + 3.4}M${x1 + 3.4} ${y0 - 3.4}L${x1 - 3.4} ${y0 + 3.4}" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/></g>` : "") + `</g>`;
/** small green check dot (local 2-D) */
const okDot = (id, x, y, on) =>
  `<g id="${id}" opacity="${on ? 1 : 0}"><circle cx="${x}" cy="${y}" r="9" fill="${GREEN}" stroke="#ffffff" stroke-width="1.6"/><path d="M${x - 4} ${y}l3 3l5.4 -5.6" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const WOOD = M.wood;

// =====================================================================================
// Merkle 树挂牌架 merkleTree — 木质 A 字形挂牌架：两对斜腿 + 顶上横梁 + 底下一根拉杆；横梁正中挂一块大铭牌 = 根（写 rootText），
//   下面两层细绳：中层 2 块、底层 4 块叶子牌（白底青蓝框，牌面三道横线，不写真实数据）。从一块叶子沿绳子到根有一条可点亮的证明路径（青蓝粗线）。
// 约 180×60×180（腿脚 u ±82、v ±30；横梁顶 z 178）。全部牌子挂在 v = 6 的竖直面里，正面朝 +v（看向观众）。
// opts: rootText="根"（broken 默认 "0x00"）, leaf=-1（被替换的叶子序号 0–3；-1 = 无，attacker 默认 1）, path=false（true = 证明路径已点亮）
// 状态：normal 木色架 + 青蓝牌、路径青蓝；attacker 第 leaf 块叶子红牌、路径红、根牌右上角仍亮绿勾（= 校验被骗过）；
//   broken 根铭牌红虚线框 + 红叉 + "0x00"（= 根是零值，任何叶子都"通过"）。整件不变虚。
// 可动：ID-root（根铭牌：KITX12.rootText 换字、KITX12.rootState 绿勾 / 红虚线框）, ID-path（证明路径：KITX12.path 点亮 / 熄灭，KITX12.pathTone 青蓝 / 红），
//   ID-leaf（可翻的那块叶子 = leaf ≥ 0 时的第 leaf 块，否则第 1 块：KITX12.leaf 翻成红牌 / 翻回）。证明路径总是从 ID-leaf 那块出发。
// anchors: top（横梁上方）, center, ground, root（根铭牌中心）, mids[0..1]（中层牌中心）, leaves[0..3]（叶子牌中心，左 → 右）, leaf（ID-leaf 中心）
// =====================================================================================
export function merkleTree(o, opts = {}) {
  const p = opts.id ?? "mt", K = opts.scale ?? 1, st = opts.state ?? "normal", atk = st === "attacker", brk = st === "broken";
  const leafOpt = opts.leaf ?? (atk ? 1 : -1);
  const LI = leafOpt >= 0 && leafOpt <= 3 ? leafOpt : 1, leafRed = leafOpt >= 0 && leafOpt <= 3;
  const rootT = String(opts.rootText ?? (brk ? "0x00" : "根"));
  const pathOn = !!opts.path;
  const LU = 82, LV = 30, ZB = 168, PV = 6;
  let s = contactShadow(o, 110, 50);

  // legs: slanted posts from the feet (±LU, ±LV, 0) to the beam (±LU, 0, ZB)
  const post = (u, v) => line3(o, [[u, v, 0], [u, 0, ZB]], WOOD.st, 9) + line3(o, [[u, v, 0], [u, 0, ZB]], WOOD.f, 6) + line3(o, [[u + 1.4, v, 0], [u + 1.4, 0, ZB]], WOOD.t, 1.6);
  s += post(-LU, -LV) + post(LU, -LV);
  // back tie bar + top beam
  s += line3(o, [[-LU, -LV * 0.86, 24], [LU, -LV * 0.86, 24]], WOOD.st, 7) + line3(o, [[-LU, -LV * 0.86, 24], [LU, -LV * 0.86, 24]], WOOD.f, 4.4);
  s += box(o, -LU - 8, LU + 8, -5, 5, ZB, ZB + 10, WOOD, 1.4);

  // ---- hanging boards, in the +v-facing plane v = PV: local x = u, local y = −z
  const FM = frameV(o, 0, PV, 0);
  const R = { x0: -40, x1: 40, y0: -160, y1: -126 };                  // root plate
  const MIDX = [-36, 36], MW = 22, MY0 = -110, MY1 = -90;            // middle plates
  const LEAFX = [-54, -18, 18, 54], LW = 15, LY0 = -64, LY1 = -40;   // leaves
  const cord = (x0, y0, x1, y1) => `<path d="M${x0} ${y0}L${x1} ${y1}" stroke="#7a6a55" stroke-width="1.6" stroke-linecap="round"/>`;
  let b = "";
  // cords: beam → root, root → mids, mids → leaves
  b += cord(-26, -ZB, -26, R.y0) + cord(26, -ZB, 26, R.y0);
  for (const mx of MIDX) b += cord(mx * 0.55, R.y1, mx, MY0);
  LEAFX.forEach((lx, i) => { const mx = MIDX[i < 2 ? 0 : 1]; b += cord(mx + (lx < mx ? -8 : 8), MY1, lx, LY0); });
  // nail heads on the beam
  b += [-26, 26].map((x) => `<circle cx="${x}" cy="${-ZB + 1}" r="2.6" fill="${darken(WOOD.st, 0.2)}"/>`).join("");
  // proof path (drawn over the cords, under the plates): leaf top → mid bottom → mid top → root bottom → root centre
  const pm = MIDX[LI < 2 ? 0 : 1], lx = LEAFX[LI];
  const P = [[lx, LY0], [pm + (lx < pm ? -8 : 8), MY1], [pm, (MY0 + MY1) / 2], [pm * 0.55, R.y1], [0, (R.y0 + R.y1) / 2]];
  let plen = 0; for (let i = 1; i < P.length; i++) plen += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
  plen = Math.ceil(plen) + 2;
  const pd = "M" + P.map((q) => `${f(q[0])} ${f(q[1])}`).join("L");
  const pline = (id, col, on) => `<path id="${id}" d="${pd}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="${on ? 1 : 0}" stroke-dasharray="${plen} ${plen}" stroke-dashoffset="${pathOn ? 0 : plen}"/>`;
  b += `<g id="${p}-path" data-len="${plen}" data-on="${pathOn ? 1 : 0}">${pline(p + "-path-t", TEAL, !atk)}${pline(p + "-path-r", RED, atk)}</g>`;

  // plates
  const plate = (x0, y0, x1, y1, red, lines = 3) => {
    const w = x1 - x0, h = y1 - y0, stc = red ? RED : TEAL, fill = red ? "#fde6e3" : "#fffdf8", lc = red ? "#e8938b" : "#9fd3e4";
    let q = `<rect x="${x0 + 1.5}" y="${y0 + 2}" width="${w}" height="${h}" rx="2.5" fill="rgba(60,40,20,0.18)"/>` +
      `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="2.5" fill="${fill}" stroke="${stc}" stroke-width="2.2"/>`;
    for (let i = 0; i < lines; i++) { const yy = y0 + (h * (i + 1)) / (lines + 1); q += `<path d="M${x0 + w * 0.18} ${f(yy)}L${x0 + w * (i === lines - 1 ? 0.6 : 0.82)} ${f(yy)}" stroke="${lc}" stroke-width="2" stroke-linecap="round"/>`; }
    return q;
  };
  for (const mx of MIDX) b += plate(mx - MW, MY0, mx + MW, MY1, false, 2);
  LEAFX.forEach((x, i) => {
    if (i === LI) {
      b += `<g id="${p}-leaf" data-cx="${x}" data-red="${leafRed ? 1 : 0}" transform="translate(0 0)">` +
        `<g id="${p}-leaf-n" opacity="${leafRed ? 0 : 1}">${plate(x - LW, LY0, x + LW, LY1, false)}</g>` +
        `<g id="${p}-leaf-r" opacity="${leafRed ? 1 : 0}">${plate(x - LW, LY0, x + LW, LY1, true)}</g></g>`;
    } else b += plate(x - LW, LY0, x + LW, LY1, false);
  });
  // root plate
  const rootFill = brk ? RED : C.ink, rsz = isAscii(rootT) ? (rootT.length > 5 ? 13 : 17) : (rootT.length > 3 ? 13 : 18);
  b += `<g id="${p}-root">` +
    `<rect x="${R.x0 + 2}" y="${R.y0 + 2.5}" width="${R.x1 - R.x0}" height="${R.y1 - R.y0}" rx="4" fill="rgba(60,40,20,0.2)"/>` +
    `<rect id="${p}-root-b" x="${R.x0}" y="${R.y0}" width="${R.x1 - R.x0}" height="${R.y1 - R.y0}" rx="4" fill="#fffdf8" stroke="${TEAL}" stroke-width="3"/>` +
    `<rect x="${R.x0 + 4}" y="${R.y0 + 4}" width="${R.x1 - R.x0 - 8}" height="${R.y1 - R.y0 - 8}" rx="2.5" fill="none" stroke="#bfe3ef" stroke-width="1.2"/>` +
    txt(0, (R.y0 + R.y1) / 2 + rsz * 0.36, rootT, { id: p + "-root-t", size: rsz, anchor: "middle", fill: rootFill, mono: isAscii(rootT) }) +
    badFrame(`${p}-root-bad`, R.x0 - 4, R.y0 - 4, R.x1 + 4, R.y1 + 4, brk) +
    okDot(`${p}-root-ok`, R.x1, R.y0, atk) + `</g>`;
  s += G_(matStr(FM), b);

  // front legs + front tie bar (in front of the boards)
  s += line3(o, [[-LU, LV * 0.86, 24], [LU, LV * 0.86, 24]], WOOD.st, 7) + line3(o, [[-LU, LV * 0.86, 24], [LU, LV * 0.86, 24]], WOOD.f, 4.4);
  s += post(-LU, LV) + post(LU, LV);
  for (const [u, v] of [[-LU, -LV], [LU, -LV], [-LU, LV], [LU, LV]]) s += G_(faceTop(o, u, v, 0.2), `<ellipse cx="0" cy="0" rx="6" ry="4" fill="${darken(WOOD.st, 0.25)}"/>`);

  const L = (x, y) => applyM(FM, x, y);
  const anchors = {
    top: at(o, 0, 0, ZB + 22), center: at(o, 0, 0, 90), ground: at(o),
    root: L(0, (R.y0 + R.y1) / 2), mids: MIDX.map((x) => L(x, (MY0 + MY1) / 2)), leaves: LEAFX.map((x) => L(x, (LY0 + LY1) / 2)),
    leaf: L(LEAFX[LI], (LY0 + LY1) / 2),
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [], ghost: 1, badge: false, glowDefault: false, center: anchors.center, glowR: 120, k: K,
      attrs: `data-li="${LI}"` }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

export const CATALOG_EXT = { merkleTree };
/** runtime-ext.js contents — inline after iso.runtimeJs() (and other chapters' runtime-ext) */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
