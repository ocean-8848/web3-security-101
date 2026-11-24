// objects-ext.mjs — 第 20 集（前端、DNS 与供应链）补充拟物物件，与 kit/objects.mjs 同一投影、同一接口
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"
//   opts.glow = true 时脚下绿色地光；opts.scale = 以地面原点等比缩放（anchors 已换算）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，KIT.grow / KIT.broke 直接可用；另有一层 ID-mv（整件包一层）。
// 动画助手在 runtime-ext.js（window.KITX20，并以不覆盖的方式合并进 window.KITX），用 runtimeExtJs() 内联在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
// id 不要取 cam / root（舞台容器同名）。
import fs from "node:fs";
import {
  U, V, CE, f, f4, at, C, M, darken, matStr, faceV, faceTop,
  box, cyl, glow, contactShadow, wireSvg, badgeSvg,
} from "../../kit/iso.mjs";

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
/** vertical-plane frame whose local +x runs along the ground direction (cos a, sin a), local +y = down; origin at (du,dv,z) */
const frameDir = (o, du, dv, z, aDeg) => {
  const r = (aDeg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  const [x, y] = at(o, du, dv, z);
  return [c * U[0] + s * V[0], c * U[1] + s * V[1], 0, CE, x, y];
};
const mArr = (m) => m.map((v, i) => (i < 4 ? f4(v) : f(v))).join(",");

// =====================================================================================
// 域名路牌 dnsSignpost — 水泥小底座 + 墨色立杆（约 200 高），杆顶一块横向箭头牌（白底青蓝框，约 150×40，写 domain），
//   杆身中部一块小方牌"DNS"（朝 +v，看向观众）。箭头牌绕立杆在水平面里转动：dir 1 指向 +u（画面右上），−1 指向 −u（画面左上）；
//   转到 90° 时箭头指向 +v（朝观众）。牌面文字在任何角度都保持正读。
// 约 160×80×220。
// opts: domain="curve.fi"（箭头牌上的字）, dir=1（1 = 指向 +u，−1 = 指向 −u）, label="DNS"（杆身小方牌字，"" 不画）, state, scale, glow
// 状态：normal 白底青蓝框青蓝字；attacker 箭头牌换红框红字（立杆不变）；broken 整件变虚 + 红叉（kit 通用 ID-wire，可用 KIT.broke）。
// 可动：ID-arm（箭头牌 rotator：data-a 当前角度，0 = +u，180 = −u；KITX20.turn 转到任意角度，KITX20.flip 扳到另一边），
//   ID-arm-n / ID-arm-r（青蓝 / 红两套牌面，KITX20.red 切换），ID-arm-lit（箭头牌一层青蓝光，KITX20.lit），ID-arm-t / ID-arm-tr（牌面字），
//   一次劫持：KITX20.hijack（扳到另一边 + 中途变红）；KITX20.restore（扳回 + 变回青蓝）
// anchors: top（杆顶上方）, tip（箭头尖，初始 dir）, tipFlip（扳到另一边后的箭头尖）, arm（箭头牌中心）, center, ground, dns（小方牌中心）, pole（立杆中部）
// =====================================================================================
export function dnsSignpost(o, opts = {}) {
  const p = opts.id ?? "dns", K = opts.scale ?? 1, st = opts.state ?? "normal", atk = st === "attacker";
  const domain = opts.domain ?? "curve.fi", label = opts.label ?? "DNS";
  const a0 = (opts.dir ?? 1) < 0 ? 180 : 0;
  const ZB = 14, ZP = 212, AZ1 = 206, AH = 40;     // base top, pole top, arm top, arm height
  const AX0 = -12, AX1 = 122, ATIP = 152;          // arm local x: behind pole → body end → tip
  let s = contactShadow(o, 50, 40, 0, 0);
  // base: concrete slab + small plinth
  const CON = { f: "#c9c4ba", s: "#b2aca0", t: "#dcd8cf", st: "#8f897d" };
  s += box(o, -34, 34, -26, 26, 0, 8, CON, 1.4);
  s += box(o, -14, 14, -12, 12, 8, ZB, CON, 1.2);
  // pole
  s += cyl(o, 0, 0, 5.5, ZB, ZP, M.ink, { seg: 18, sw: 1.2 });
  s += cyl(o, 0, 0, 7.5, ZP, ZP + 6, M.steel, { seg: 18, sw: 1 });
  // small square plate "DNS" on the +v side of the pole, middle height
  if (label) {
    const pw = Math.max(44, String(label).length * 14 + 16), ph = 30, pz = 118;
    s += G_(faceV(o, -pw / 2, 6.5, pz + ph / 2),
      `<rect x="0" y="0" width="${pw}" height="${ph}" rx="3" fill="${C.paper}" stroke="${C.ink}" stroke-width="2"/>` +
      `<text x="${pw / 2}" y="${ph / 2 + 7}" ${isAscii(label) ? MONO : FONT} font-size="19" font-weight="900" fill="${C.ink}" text-anchor="middle">${label}</text>`);
    // two clamps
    for (const z of [pz + 6, pz + ph - 6]) s += box(o, -3, 3, 4, 7, z - 2, z + 2, M.steel, 0.8);
  }
  // arm (rotator) — local frame: x along the arrow, y down from the arm's top edge
  const body = (stroke, txtFill, idT) => {
    const d = `M${AX0} 0H${AX1}L${ATIP} ${AH / 2}L${AX1} ${AH}H${AX0}Z`;
    const tc = (AX0 + AX1) / 2 + 4, size = Math.min(22, Math.floor(((AX1 - AX0 - 16) / Math.max(1, String(domain).length)) * 1.6));
    return `<path d="${d}" transform="translate(2.5 3)" fill="${darken(stroke, 0.35)}" opacity="0.35"/>` +
      `<path d="${d}" fill="${C.paper}" stroke="${stroke}" stroke-width="3.2" stroke-linejoin="round"/>` +
      `<path d="M${AX0 + 5} 5H${AX1 - 2}L${ATIP - 8} ${AH / 2}L${AX1 - 2} ${AH - 5}H${AX0 + 5}Z" fill="none" stroke="${stroke}" stroke-width="1" opacity="0.5"/>` +
      `<g class="dns-tx" data-cx="${f(tc)}"><text id="${idT}" x="${f(tc)}" y="${AH / 2 + 7.5}" ${isAscii(domain) ? MONO : FONT} font-size="${size}" font-weight="900" fill="${txtFill}" text-anchor="middle">${domain}</text></g>`;
  };
  const lit = `<path d="M${AX0 - 6} -6H${AX1 + 2}L${ATIP + 10} ${AH / 2}L${AX1 + 2} ${AH + 6}H${AX0 - 6}Z" fill="${TEAL}" opacity="0.28"/>`;
  const mA = frameDir(o, 0, 0, AZ1, a0);
  const mir = mA[0] < 0;
  const flipTx = (inner) => inner.replace(/<g class="dns-tx" data-cx="([\d.-]+)">/g, (m0, cx) => mir ? `<g class="dns-tx" data-cx="${cx}" transform="translate(${cx} 0) scale(-1 1) translate(${-cx} 0)">` : m0);
  const armInner = `<g id="${p}-arm-lit" opacity="0">${lit}</g>` +
    `<g id="${p}-arm-n" opacity="${atk ? 0 : 1}">${flipTx(body(TEAL, C.tealText, p + "-arm-t"))}</g>` +
    `<g id="${p}-arm-r" opacity="${atk ? 1 : 0}">${flipTx(body(RED, RED, p + "-arm-tr"))}</g>`;
  const [px, py] = at(o, 0, 0, AZ1);
  s += `<g id="${p}-arm" data-a="${a0}" data-a0="${a0}" data-px="${f(px)}" data-py="${f(py)}" data-ux="${f4(U[0])}" data-uy="${f4(U[1])}" data-vx="${f4(V[0])}" data-vy="${f4(V[1])}" data-ce="${f4(CE)}" data-m="${mArr(mA)}" transform="${matStr(mA)}">${armInner}</g>`;
  // pole cap over the arm's root
  s += G_(faceTop(o, 0, 0, ZP + 6.1), `<circle cx="0" cy="0" r="5" fill="${M.steel.t}" stroke="${M.steel.st}" stroke-width="0.8"/>`);

  const tipAt = (a) => { const r = (a * Math.PI) / 180; return at(o, ATIP * Math.cos(r), ATIP * Math.sin(r), AZ1 - AH / 2); };
  const midAt = (a) => { const r = (a * Math.PI) / 180, m = (AX0 + ATIP) / 2; return at(o, m * Math.cos(r), m * Math.sin(r), AZ1 - AH / 2); };
  const anchors = {
    top: at(o, 0, 0, ZP + 16), tip: tipAt(a0), tipFlip: tipAt(180 - a0), arm: midAt(a0), center: at(o, 0, 0, 110), ground: at(o),
    dns: at(o, 0, 7, 133), pole: at(o, 0, 0, 80),
  };
  return {
    svg: shell(p, o, opts, {
      solid: s, wire: [[-34, 34, -26, 26, 0, 14], { cyl: [0, 0, 6, ZB, ZP] }], center: anchors.center, glowR: 70, k: K,
    }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

export const CATALOG_EXT = { dnsSignpost };
/** runtime-ext.js contents — inline after iso.runtimeJs() (and other chapters' runtime-ext) */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
