// props.mjs — ep02/seg2 自补的拟物小件（与 kit 同一投影；kit / kit-ext 只 import，不改）。
import { at, Wp, f, pts, box, rbox, cyl, M, faceTop, faceV, contactShadow } from "../../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;
const shell = (id, o, solid, extra = "") => {
  const [ox, oy] = at(o);
  return `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}"><g id="${id}-solid">${solid}</g>${extra}</g>`;
};

/** 挂牌告示：两根钢立柱 + 横梁吊着白色告示板，板面写两行字（+v 面）。anchors: top, word（"实现"标签中心） */
export function signboard(o, { id = "sign", line1 = "", line2a = "", word = "" } = {}) {
  const W = 400, zb = 150, zt = 400;
  let s = contactShadow(o, 480, 90);
  for (const u of [-W - 30, W + 30]) {
    s += cyl(o, u, 0, 30, 0, 14, M.steel, { seg: 20, sw: 1.2 });
    s += cyl(o, u, 0, 10, 14, zt + 40, M.steelLight, { seg: 16, sw: 1.2 });
  }
  s += box(o, -W - 40, W + 40, -10, 10, zt + 40, zt + 58, M.steel, 1.4);
  // chains
  for (const u of [-W + 60, W - 60]) s += `<path d="M${pts([at(o, u, 0, zt + 40)])}L${pts([at(o, u, 6, zt + 4)])}" stroke="#5d636b" stroke-width="3" stroke-dasharray="5 3"/>`;
  s += rbox(o, -W, W, -8, 8, zb, zt, 8, M.white, { sw: 2 });
  // face: local x along u (0..2W), y down from zt
  const H = zt - zb;
  s += `<g transform="${faceV(o, -W, 8, zt)}">
    <rect x="16" y="14" width="${2 * W - 32}" height="${H - 28}" rx="6" fill="none" stroke="#d9d2c4" stroke-width="3"/>
    <text x="${W}" y="${H * 0.42}" ${FONT} font-size="60" font-weight="900" fill="#1c1c1c" text-anchor="middle">${line1}</text>
    <text x="${W - 70}" y="${H * 0.8}" ${FONT} font-size="60" font-weight="900" fill="#1c1c1c" text-anchor="middle">${line2a}</text>
    <g id="${id}-word"><rect x="${W + 125}" y="${H * 0.8 - 58}" width="150" height="76" rx="10" fill="#1d93ba"/>
    <text x="${W + 200}" y="${H * 0.8}" ${FONT} font-size="60" font-weight="900" fill="#ffffff" text-anchor="middle">${word}</text></g></g>`;
  return { svg: shell(id, o, s), anchors: { top: at(o, 0, 0, zt + 110), word: at(o, 200, 8, zt - H * 0.8 + 20), ground: at(o) } };
}

/** 展台：矮白色台座（物件放在上面要抬 z=24） */
export function plinth(o, id, w = 200, d = 150) {
  const s = contactShadow(o, w * 0.75, d * 0.75) + rbox(o, -w / 2, w / 2, -d / 2, d / 2, 0, 24, 8, M.plinth, { sw: 1.4 });
  return shell(id, o, s);
}
export const PLINTH_Z = 24;

/** 地面虚线框（红 = 失败；其它颜色可传）。id 可整体淡入 */
export function groundFrame(id, o, w, d, color = "#e0453a", opacity = 0) {
  return `<g id="${id}" opacity="${opacity}" transform="${faceTop(o, 0, 0, 0)}"><rect x="${-w / 2}" y="${-d / 2}" width="${w}" height="${d}" rx="14" fill="${color === "#e0453a" ? "rgba(224,69,58,0.06)" : "rgba(42,163,201,0.06)"}" stroke="${color}" stroke-width="5" stroke-dasharray="16 11"/></g>`;
}

/** 地面高亮圈（青蓝 → 可换红）：#id 外层淡入，#id-c 圆可改 stroke/fill */
export function groundRing(id, o, r) {
  return `<g id="${id}" opacity="0" transform="${faceTop(o, 0, 0, 0)}"><circle id="${id}-c" cx="0" cy="0" r="${r}" fill="rgba(42,163,201,0.16)" stroke="#2aa3c9" stroke-width="9"/></g>`;
}

/** 地面通道（支线）：浅色铺面 + 青蓝虚线中线，从 a 到 b（世界 u,v） */
export function groundPath(id, a, b, wd = 70) {
  const du = b.u - a.u, dv = b.v - a.v, L = Math.hypot(du, dv), nu = -dv / L * wd / 2, nv = du / L * wd / 2;
  const q = [at(a, nu, nv), at(b, nu, nv), at(b, -nu, -nv), at(a, -nu, -nv)];
  const m0 = at(a), m1 = at(b);
  return `<g id="${id}" opacity="0"><polygon points="${pts(q)}" fill="#f8f6f1" stroke="#d6cfc1" stroke-width="3"/>
    <path id="${id}-d" d="M${pts([m0])}L${pts([m1])}" stroke="#2aa3c9" stroke-width="5" stroke-dasharray="14 10" fill="none"/></g>`;
}

/** 哈希压印机：钢底座 + 两根立柱 + 青蓝横梁（铭牌"哈希"）+ 压头；底座上一张纸，压下后留下青蓝指纹印。
 *  #id-pl 压头（GSAP y 下压），#id-fp 指纹印（opacity）。anchors: top, paper, head */
export function hashPress(o, { id = "hp" } = {}) {
  let s = contactShadow(o, 150, 100);
  s += rbox(o, -110, 110, -70, 70, 0, 20, 8, M.steel, { sw: 1.4 });
  for (const u of [-85, 85]) s += cyl(o, u, -45, 12, 20, 250, M.chrome, { seg: 18, sw: 1.2 });
  // paper on the bed
  s += `<g transform="${faceTop(o, -62, -40, 21)}"><rect x="0" y="0" width="124" height="96" rx="3" fill="#fffdf8" stroke="#b8b0a1" stroke-width="1.6"/>
    ${[18, 34, 50, 66].map((y) => `<rect x="12" y="${y}" width="${y === 50 ? 60 : 96}" height="5" rx="2" fill="#cfc7b8"/>`).join("")}
    <g id="${id}-fp" opacity="0" transform="translate(84,62)">${[8, 14, 20, 26].map((r) => `<ellipse cx="0" cy="0" rx="${r}" ry="${r * 1.25}" fill="none" stroke="#1d93ba" stroke-width="3" stroke-dasharray="${r * 1.6} 4"/>`).join("")}</g></g>`;
  // plunger (moves)
  let pl = cyl(o, 0, 0, 10, 120, 222, M.chrome, { seg: 16, sw: 1.2 });
  pl += cyl(o, 0, 0, 36, 100, 124, M.steel, { seg: 28, sw: 1.4 });
  const plunger = `<g id="${id}-pl">${pl}</g>`;
  // crossbar
  let top = rbox(o, -112, 112, -66, -20, 222, 268, 8, M.blue, { sw: 1.6 });
  top += `<g transform="${faceV(o, -112, -20, 262)}"><rect x="70" y="6" width="84" height="30" rx="5" fill="#ffffff"/><text x="112" y="30" ${FONT} font-size="24" font-weight="900" fill="#17809f" text-anchor="middle">哈希</text></g>`;
  return { svg: shell(id, o, s + plunger + top), anchors: { top: at(o, 0, 0, 330), paper: at(o, 20, 10, 21), head: at(o, 0, 0, 100), ground: at(o) } };
}

// ---------------------------------------------------------------- seg1 end-state pieces (copied from seg1/src/build-story.mjs so the seam matches)
import { U, V, CE, matStr, frameV, edges } from "../../../kit/iso.mjs";
import * as S1 from "../../seg1/src/layout.mjs";
const MONO = `font-family="JetBrains Mono, monospace"`;
/** Profanity machine as left by seg1: shell ghosted (0.1) + teal dashed outline, the 32-bit dial inside */
export function profMachine(o, id, inner) {
  const W = 150, v0 = -80, v1 = 90, H = 300;
  const body = { f: "#f6f3ec", s: "#ddd7cb", t: "#ffffff", st: "#5d636b" };
  const teal = { f: "#2aa3c9", s: "#1d93ba", t: "#5cc0e0", st: "#155e77" };
  let back = contactShadow(o, W * 1.2, 110);
  back += box(o, -W, W, v0, v1, 0, 14, M.steel, 1.4);
  back += box(o, -W, W, v0, v0 + 12, 14, H, { f: "#e4dfd4", s: "#cfc8ba", t: "#f1ede5", st: "#5d636b" }, 1.4);
  back += box(o, W - 12, W, v0, v1, 14, H, body, 1.4);
  let shell = box(o, -W, -W + 12, v0, v1, 0, H, body, 1.6);
  shell += box(o, -W, W, v1 - 12, v1, 0, H, body, 1.6);
  shell += box(o, -W - 6, W + 6, v0 - 6, v1 + 6, H, H + 16, teal, 1.6);
  const mF = frameV(o, -W, v1, H);
  shell += `<g transform="${matStr(mF)}"><rect x="34" y="24" width="232" height="40" rx="6" fill="#1d93ba"/>
    <text x="150" y="52" text-anchor="middle" ${MONO} font-size="22" font-weight="800" fill="#ffffff">Profanity</text>
    <rect x="34" y="80" width="232" height="72" rx="8" fill="#1d1f23" stroke="#5d636b" stroke-width="2"/></g>`;
  const outline = `<path d="${edges(o, -W, W, v0, v1, 0, H + 16)}" fill="none" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="14 10" stroke-linejoin="round"/>`;
  const [ox, oy] = at(o);
  return { svg: `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}">${back}${inner}<g id="${id}-shell" opacity="0.1">${shell}</g><g id="${id}-ol">${outline}</g></g>`, anchors: { top: at(o, 0, 0, H + 70) } };
}
/** seg1 L9 dashed placeholders: belt, six station pads (①…⑥), branch to the signing desk, chain pad. ids ln-belt / ln-p0..5 / ln-br / ln-ch */
export function seg1Line() {
  const { LINE, STATIONS, PAD, SIGN_DESK, CHAIN } = S1;
  const TOPM = matStr([U[0], U[1], V[0], V[1], 0, 0]);
  const DASH = `fill="none" stroke="#a79f90" stroke-width="7" stroke-dasharray="26 18" stroke-linecap="round"`;
  let s = `<g id="ln-belt"><g transform="${TOPM}"><rect x="${LINE.u0}" y="${LINE.v - LINE.half}" width="${LINE.u1 - LINE.u0}" height="${2 * LINE.half}" rx="18" ${DASH}/></g></g>`;
  STATIONS.forEach((st, i) => {
    s += `<g id="ln-p${i}"><g transform="${TOPM}"><rect id="ln-p${i}-r" x="${st.u - PAD}" y="${LINE.v - PAD - 150}" width="${2 * PAD}" height="${2 * PAD}" rx="22" fill="#f6f3ec" fill-opacity="0.7" ${DASH}/>
      <text x="${st.u}" y="${LINE.v - 150 + 26}" text-anchor="middle" ${FONT} font-size="78" font-weight="900" fill="#b4ac9d">${st.n}</text></g></g>`;
  });
  s += `<g id="ln-br"><g transform="${TOPM}"><path d="M${SIGN_DESK.u} ${LINE.v + LINE.half + 10}L${SIGN_DESK.u} ${SIGN_DESK.v - PAD - 10}" ${DASH}/><rect x="${SIGN_DESK.u - PAD}" y="${SIGN_DESK.v - PAD}" width="${2 * PAD}" height="${2 * PAD}" rx="22" fill="#f6f3ec" fill-opacity="0.7" ${DASH}/></g></g>`;
  s += `<g id="ln-ch"><g transform="${TOPM}"><path d="M${LINE.u1 + 20} ${LINE.v}L${CHAIN.u - 140} ${LINE.v}" ${DASH}/><rect x="${CHAIN.u - 130}" y="${CHAIN.v - 130}" width="260" height="260" rx="22" fill="#f6f3ec" fill-opacity="0.7" ${DASH}/></g></g>`;
  return s;
}
/** seg1's wide camera (same formula), so seg2 opens on seg1's last frame */
export function seg1Wide(camAt, Wp) {
  const { LINE, PAD, CHAIN, STATIONS, VAULT, PROF } = S1;
  const P = [Wp(LINE.u0 - 20, LINE.v + PAD), Wp(LINE.u0, LINE.v - PAD - 260), Wp(CHAIN.u + 130, CHAIN.v - 130), Wp(CHAIN.u + 130, CHAIN.v + 130),
    Wp((STATIONS[2].u + STATIONS[3].u) / 2, LINE.v - 520, 0), Wp(VAULT.u - 145, VAULT.v + 120), Wp(PROF.u + 150, PROF.v + 90)];
  const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys) - 110, y1 = Math.max(...ys);
  const k = Math.min(1720 / (x1 - x0), 800 / (y1 - y0));
  return camAt([(x0 + x1) / 2, (y0 + y1) / 2], 960, 500, f(k * 100) / 100);
}
