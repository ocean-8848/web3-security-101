// objects-ext.mjs — 第 27 集（审计、测试与开发流程）补充拟物物件，与 kit/objects.mjs 同一投影、同一接口
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken"
//   opts.glow = true 时脚下绿色地光；opts.scale = 以地面原点等比缩放（anchors 已换算）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，KIT.grow 直接可用；另有一层 ID-mv（整件包一层）。
// 动画助手在 runtime-ext.js（window.KITX27，并以不覆盖的方式合并进 window.KITX），用 runtimeExtJs() 内联在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
// id 不要取 cam / root（舞台容器同名）。
import fs from "node:fs";
import { f, f4, at, C, M, box, prism, loft, faceV, faceTop, frameV, applyM, glow, contactShadow, wireSvg, badgeSvg, pts } from "../../kit/iso.mjs";

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
// 模型飞机 planeModel — 一架白色等距小客机模型：机身沿 u（机头朝 +u），约 160×140×40（机身长 160、翼展 140、机身高约 26 + 垂尾），
//   两侧后掠主翼 + 水平尾翼 + 垂直尾翼，机身两侧一条青蓝窗带、机头一块墨色驾驶舱窗；
//   架在墨色细支架上（底座 + 立杆，机身底离地约 60）；底座正面一块小牌写 label。
//   wingL = 左翼（+v 侧，靠观众，看得最清楚），wingR = 右翼（−v 侧，在机身后面）。
// opts: label="模型飞机"（底座小牌）, state（"broken" = 左翼中段一道红色虚线断口 + 红叉，翼尖段略下垂错开；整件不变虚）, scale, glow
// 可动：ID-wingL / ID-wingR（两侧机翼；各自的红色高亮层 ID-wingL-red / ID-wingR-red，KITX27.wingRed）,
//       ID-wingL-break / ID-wingR-break（红色虚线断口 + 红叉，KITX27.wingBreak）, ID-hi（整机青蓝描边高亮，KITX27.planeHi）
// anchors: top（垂尾顶上方）, center（机身中心）, ground, wingL / wingR（两侧机翼中段上表面）, nose（机头尖）, tail（垂尾中部）, plate（底座小牌）
// =====================================================================================
export function planeModel(o, opts = {}) {
  const p = opts.id ?? "plane", K = opts.scale ?? 1, st = opts.state ?? "normal", brk = st === "broken";
  const label = String(opts.label ?? "模型飞机");
  const ZB = 60, ZM = 73, ZT = 86;              // fuselage bottom / mid / top
  const WZ0 = 70, WZ1 = 73.5;                  // wing slab
  const INK = M.ink, WH = M.white;
  // fuselage plan (pointed nose at +u, tapered tail at −u), half-width w
  const fus = (w) => {
    const P = [];
    for (let i = 0; i <= 8; i++) { const a = (-90 + 180 * i / 8) * Math.PI / 180; P.push([52 + 28 * Math.cos(a), w * Math.sin(a)]); } // nose half-ellipse, v from −w to +w
    P.push([-60, w * 0.85], [-80, w * 0.35], [-80, -w * 0.35], [-60, -w * 0.85]);
    return P;
  };
  const half = 13;
  // wing plans: root on fuselage side, swept back to the tip; side = +1 (left, +v) / −1 (right, −v)
  const wingPlan = (sd) => [[28, sd * (half - 2)], [-16, sd * (half - 2)], [-40, sd * 70], [-24, sd * 70]];
  const stabPlan = (sd) => [[-56, sd * (half * 0.6)], [-74, sd * (half * 0.4)], [-84, sd * 32], [-74, sd * 32]];
  const order = (P) => P; // prism handles winding

  let s = contactShadow(o, 70, 50);
  // ---- stand: base plate, thin post, small cradle under the fuselage
  s += box(o, -32, 32, -22, 22, 0, 9, INK, 1.3);
  s += box(o, -3, 3, -3, 3, 9, ZB - 4, INK, 1.1);
  s += box(o, -12, 12, -7, 7, ZB - 5, ZB, INK, 1.1);
  // label plate on the base's +v face
  const LW = 52, LH = 8;
  const fsz = Math.min(7.5, Math.floor((LW - 6) / Math.max(1, label.length) * (isAscii(label) ? 1.6 : 1)));
  s += `<g transform="${faceV(o, -LW / 2, 22.2, 8.5)}"><rect x="0" y="0" width="${LW}" height="${LH}" rx="1.5" fill="${C.cream}" stroke="#b8b0a1" stroke-width="0.8"/>` +
    `<text x="${LW / 2}" y="${LH - 1.8}" ${isAscii(label) ? MONO : FONT} font-size="${fsz}" font-weight="900" fill="${C.ink}" text-anchor="middle">${label}</text></g>`;

  // ---- wing / stabiliser solids (with red highlight layer on top face)
  const redTop = (P, z) => `<polygon points="${pts(P.map((q) => at(o, q[0], q[1], z)))}" fill="rgba(224,69,58,0.45)" stroke="${RED}" stroke-width="2.4" stroke-linejoin="round"/>`;
  const wing = (sd, key) => {
    const P = wingPlan(sd);
    let w = prism(o, order(P), WZ0, WZ1, WH, { sw: 1.2 });
    // a thin teal stripe near the trailing edge (flap line)
    const fl = [[-13, sd * (half + 4)], [-34, sd * 62]];
    w += `<polyline points="${pts(fl.map((q) => at(o, q[0], q[1], WZ1 + 0.1)))}" fill="none" stroke="#c9c2b4" stroke-width="1.1"/>`;
    w += `<g id="${p}-${key}-red" opacity="0">${redTop(P, WZ1 + 0.2)}</g>`;
    // break mark at mid-span: red dashed jagged line across the chord + red X dot
    const bv = sd * 44;
    const j = [[-1, bv], [-9, bv + sd * 3], [-15, bv - sd * 2], [-22, bv + sd * 3], [-31, bv]];
    const [xx, xy] = at(o, -16, bv, WZ1 + 10);
    const brkSvg = `<polyline points="${pts(j.map((q) => at(o, q[0], q[1], WZ1 + 0.3)))}" fill="none" stroke="#ffffff" stroke-width="5" stroke-linejoin="round"/>` +
      `<polyline points="${pts(j.map((q) => at(o, q[0], q[1], WZ1 + 0.3)))}" fill="none" stroke="${RED}" stroke-width="2.6" stroke-dasharray="5 3" stroke-linejoin="round"/>` +
      `<polygon points="${pts([[-4, bv], [-28, bv], [-36, sd * 70], [-24, sd * 70]].map((q) => at(o, q[0], q[1], WZ1 + 0.25)))}" fill="none" stroke="${RED}" stroke-width="1.8" stroke-dasharray="4 3"/>` +
      `<circle cx="${f(xx)}" cy="${f(xy)}" r="7.5" fill="${RED}" stroke="#ffffff" stroke-width="1.4"/><path d="M${f(xx - 3)} ${f(xy - 3)}L${f(xx + 3)} ${f(xy + 3)}M${f(xx + 3)} ${f(xy - 3)}L${f(xx - 3)} ${f(xy + 3)}" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round"/>`;
    w += `<g id="${p}-${key}-break" opacity="${brk && key === "wingL" ? 1 : 0}">${brkSvg}</g>`;
    return `<g id="${p}-${key}">${w}</g>`;
  };
  const stab = (sd) => prism(o, stabPlan(sd), ZM + 4, ZM + 6.5, WH, { sw: 1.1 });

  // ---- far side first (−v): right wing, right stabiliser
  s += wing(-1, "wingR");
  s += stab(-1);
  // ---- fuselage: two lofts for a rounded cross-section
  s += loft(o, fus(half * 0.7), fus(half), ZB, ZM, WH, { sw: 1.4, top: false });
  s += loft(o, fus(half), fus(half * 0.62), ZM, ZT, WH, { sw: 1.4 });
  // window band along the +v side (in the v = +half face plane) + cockpit window near the nose
  let band = "";
  for (let u = -52; u <= 36; u += 8) band += `<rect x="${u + 52}" y="0" width="4.6" height="4.2" rx="1.2" fill="${TEAL}"/>`;
  s += `<g transform="${faceV(o, -52, half + 0.2, ZM + 6)}"><rect x="-2" y="-1.4" width="94" height="7" rx="3" fill="#d9eff6" opacity="0.9"/>${band}</g>`;
  s += `<polygon points="${pts([[62, half * 0.62, ZT - 3], [74, half * 0.45, ZT - 6], [74, half * 0.75, ZM + 2], [62, half * 0.95, ZM + 3]].map((q) => at(o, q[0], q[1], q[2])))}" fill="#2a2e33" stroke="#141518" stroke-width="0.9"/>`;
  s += `<polygon points="${pts([[63, 0, ZT - 1], [75, 0, ZT - 5], [75, half * 0.45, ZT - 6], [63, half * 0.62, ZT - 3]].map((q) => at(o, q[0], q[1], q[2])))}" fill="#3a4148" stroke="#141518" stroke-width="0.9"/>`;
  // teal cheat line along the top
  s += `<polyline points="${pts([[-70, 0, ZT + 0.2], [52, 0, ZT + 0.2]].map((q) => at(o, q[0], q[1], q[2])))}" fill="none" stroke="${TEAL}" stroke-width="1.6" stroke-linecap="round"/>`;
  // ---- vertical fin (two thin planes with a teal tip)
  const fin = "M0 0L-26 0L-30 -40L-20 -40Z";
  for (const v of [-1.6, 0, 1.6]) s += `<g transform="${faceV(o, -52, v, ZT)}"><path d="${fin}" fill="${v > 0 ? WH.s : WH.f}" stroke="${WH.st}" stroke-width="1.1" stroke-linejoin="round"/></g>`;
  s += `<g transform="${faceV(o, -52, 1.7, ZT)}"><path d="M-27 -30L-30 -40L-20 -40L-17.5 -30Z" fill="${TEAL}"/></g>`;
  // ---- near side (+v): left wing, left stabiliser
  s += stab(1);
  s += wing(1, "wingL");
  // ---- whole-plane teal highlight (outline of fuselage top + wings), hidden
  const hiP = (P, z) => `<polygon points="${pts(P.map((q) => at(o, q[0], q[1], z)))}" fill="none" stroke="#7fdcf5" stroke-width="4" opacity="0.85" stroke-linejoin="round"/>`;
  s += `<g id="${p}-hi" opacity="0">${hiP(wingPlan(1), WZ1 + 0.4)}${hiP(wingPlan(-1), WZ1 + 0.4)}${hiP(fus(half * 0.62), ZT + 0.3)}</g>`;

  const anchors = {
    top: at(o, -78, 0, ZT + 52), center: at(o, 0, 0, ZM), ground: at(o),
    wingL: at(o, -14, 42, WZ1), wingR: at(o, -14, -42, WZ1), nose: at(o, 80, 0, ZM), tail: at(o, -72, 0, ZT + 20),
    plate: at(o, 0, 22, 4.5),
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [], ghost: 1, badge: false, center: anchors.center, glowR: 90, k: K }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

export const CATALOG_EXT = { planeModel };
/** runtime-ext.js contents — inline after iso.runtimeJs() (and other chapters' runtime-ext) */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
