// objects-ext.mjs — 第 10 集（可升级合约与代理）补充拟物物件，与 kit/objects.mjs 同一投影、同一接口
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"
//   opts.glow = true 时脚下绿色地光；opts.scale = 以地面原点等比缩放（anchors 已换算）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，KIT.grow 直接可用；另有一层 ID-mv（KITX10.push 平移整件用）。
//   coreModule 的 broken 只标出"缺的拉杆 / 未初始化的首页卡"（红虚线 + 红叉），不整体变虚；所以 ID-wire 为空，不要用 KIT.broke，
//   改用 KITX10.leverBad / KITX10.cardBad。
// 动画助手在 runtime-ext.js（window.KITX10，并以不覆盖的方式合并进 window.KITX），用 runtimeExtJs() 内联在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  U, V, CE, f, f4, at, pts, M, C, lighten, darken,
  frameV, matStr, applyM, faceV, faceU, faceTop,
  box, line3,
  glow, contactShadow, wireSvg, badgeSvg,
} from "../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const txt = (x, y, s, o = {}) =>
  `<text ${o.id ? `id="${o.id}"` : ""} x="${f(x)}" y="${f(y)}" ${o.mono ? MONO : FONT} font-size="${o.size ?? 20}" font-weight="${o.weight ?? 900}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}" ${o.extra ?? ""}>${s}</text>`;
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
const mArr = (m) => m.map((v, i) => (i < 4 ? f4(v) : f(v))).join(",");
/** group rotated about local (px,py) inside face matrix m; runtime rewrites its transform (data-m / data-px / data-py / data-a) */
function rotator(id, m, px, py, a, inner, extra = "") {
  const tr = `${matStr(m)} translate(${px} ${py}) rotate(${f(a)}) translate(${-px} ${-py})`;
  return `<g id="${id}" data-m="${mArr(m)}" data-px="${px}" data-py="${py}" data-a="${f(a)}" transform="${tr}" ${extra}>${inner}</g>`;
}
function gearD(cx, cy, r, n = 10, h = 5) {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a0 = (i / (n * 2)) * 2 * Math.PI, a1 = ((i + 1) / (n * 2)) * 2 * Math.PI, rr = i % 2 ? r : r + h;
    d += (i === 0 ? `M${f(cx + rr * Math.cos(a0))} ${f(cy + rr * Math.sin(a0))}` : `L${f(cx + rr * Math.cos(a0))} ${f(cy + rr * Math.sin(a0))}`) + `L${f(cx + rr * Math.cos(a1))} ${f(cy + rr * Math.sin(a1))}`;
  }
  return d + "Z";
}
const RED = "#e0453a", GREEN = "#1f9d55", TEAL = "#2aa3c9";
/** red dashed frame + small red X dot (local 2-D, inside a face group) */
const badFrame = (id, x0, y0, x1, y1, on) =>
  `<g id="${id}" opacity="${on ? 1 : 0}"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="3" fill="rgba(224,69,58,0.08)" stroke="${RED}" stroke-width="2.4" stroke-dasharray="5 3"/>` +
  `<circle cx="${x1}" cy="${y0}" r="7.5" fill="${RED}" stroke="#ffffff" stroke-width="1.4"/><path d="M${x1 - 3} ${y0 - 3}L${x1 + 3} ${y0 + 3}M${x1 + 3} ${y0 - 3}L${x1 - 3} ${y0 + 3}" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round"/></g>`;

// =====================================================================================
// 实现机芯（散件）coreModule — 售货机维修门里 impl 同款的机芯单独拿出来：竖立的金属机芯盒（青蓝侧板 + 银色前框），前面一扇深色观察窗露出
//   两枚咬合的黄铜齿轮和一小块绿色电路板；正面上方白底铭牌写版本；顶上一个镀铬拉杆插座 + 短拉杆（升级函数，可有可无）；
//   正面下方黄铜卡座插一张"首页"卡（初始化：空白 = 未初始化 / 写主人名）；底下一辆带两只小轮的托板推车，推把在 −u 端（从 −u 侧推进售货机维修门）
// 约 90×70×130（机芯盒，不含推车；含推车总高约 150，拉杆再高约 45）。放进 vending 维修门时用 scale ≈ 0.45（与 impl 同大），并设 cart:false。
// opts: ver="V1"（铭牌字；attacker 默认 "恶意"）, lever=true（拉杆在不在）, owner=""（首页卡上的字；"" = 空白未初始化；attacker 默认 "攻击者"）,
//   cart=true（推车）, skin="blue"|"red"|"green"（机身颜色；attacker 默认 red）, bad="lever"|"card"（broken 时标哪一处，默认 lever）
// 状态：normal 青蓝 + 银（地光默认关，opts.glow 打开）；attacker 机身红、铭牌和首页卡红色描边；
//   broken bad:"lever" 拉杆缺失、拉杆位置红虚线框 + 红叉（新实现忘了带升级函数），bad:"card" 首页卡空白 + 红虚线框（未初始化）。整件不变虚。
// 可动：ID-gear-0/1（齿轮，KITX10.gears）, ID-lever（拉杆显示 / 拔掉，KITX10.lever；摆动 ID-lever-r，KITX10.pull）, ID-lever-bad（KITX10.leverBad）,
//   ID-card（首页卡；层 ID-card-off / -on / -red / -green，字 ID-card-t，KITX10.card）, ID-card-bad（KITX10.cardBad）,
//   ID-plate（铭牌；层 -red，字 ID-plate-t，KITX10.plate）, ID-skin-blue / -red / -green（机身，KITX10.skin）,
//   ID-cart / ID-cart-h（推车 / −u 端推把）, ID-wheel-0/1（轮子，KITX10.roll；整件平移 ID-mv，KITX10.push 推着走时轮子跟着转）
// anchors: top, center, ground, front, plate, card, gears, lever（拉杆头）, socket（插座顶）, cart（托板前沿中点）, handle, wheels[]
// =====================================================================================
export function coreModule(o, opts = {}) {
  const p = opts.id ?? "core", K = opts.scale ?? 1, st = opts.state ?? "normal", atk = st === "attacker", brk = st === "broken";
  const hasCart = opts.cart !== false;
  const zc = hasCart ? 22 : 0, H = 130, zT = zc + H;
  const u0 = -45, u1 = 45, v0 = -35, v1 = 35, W = u1 - u0;
  const bad = brk ? opts.bad ?? "lever" : null;
  const leverOn = bad === "lever" ? false : opts.lever !== false;
  const owner = bad === "card" ? "" : opts.owner ?? (atk ? "攻击者" : "");
  const ver = opts.ver ?? (atk ? "恶意" : "V1");
  const skin0 = opts.skin ?? (atk ? "red" : "blue");
  const SK = {
    blue: { f: "#3fa9cf", s: "#5cc0e0", t: "#9ad9ee", st: "#1f7896" },
    red: { f: "#d94a3f", s: "#e8574c", t: "#f08a80", st: "#a8322a" },
    green: { f: "#2f9e5e", s: "#3fb871", t: "#86d8a8", st: "#1b6b3d" },
  };
  const STEEL = { f: "#6b7178", s: "#8b9199", t: "#a9aeb5", st: "#3b3e44" };
  let s = contactShadow(o, hasCart ? 82 : 66, hasCart ? 62 : 50);

  // ---- cart: back casters, deck, front wheels; push handle on the −u end (drawn after the body, it stands in front of the −u face)
  const cu = 58, cv = 44, wr = 10;
  let cart = "";
  if (hasCart) {
    for (const u of [-38, 38]) cart += G_(faceV(o, u, -cv + 2, wr), `<circle cx="0" cy="0" r="${wr}" fill="#2b2d31"/><circle cx="0" cy="0" r="4.5" fill="#8b9199"/>`);
    cart += box(o, -cu, cu, -cv, cv, 12, 20, STEEL, 1.4);
    cart += G_(faceV(o, -cu, cv, 20), `<path d="M6 4H${2 * cu - 6}" stroke="${lighten(STEEL.s, 0.3)}" stroke-width="1.2"/>`);
    cart += G_(faceTop(o, 0, 0, 20.1), [-30, -15, 0, 15, 30].map((v) => `<path d="M-${cu - 6} ${v}H${cu - 6}" stroke="${darken(STEEL.t, 0.12)}" stroke-width="1"/>`).join(""));
    [-38, 38].forEach((u, i) => {
      const m = frameV(o, u, cv + 1.5, wr);
      const inner = `<circle cx="0" cy="0" r="${wr}" fill="#2b2d31" stroke="#141518" stroke-width="1"/><circle cx="0" cy="0" r="6" fill="#c3c8ce" stroke="#4b4f56" stroke-width="1"/>` +
        `<path d="M0 -6V6M-5.2 -3L5.2 3M-5.2 3L5.2 -3" stroke="#4b4f56" stroke-width="1.3"/><circle cx="0" cy="0" r="1.8" fill="#2b2d31"/>`;
      cart += rotator(`${p}-wheel-${i}`, m, 0, 0, 0, inner);
    });
  }
  const HU = -cu - 6, hdl = !hasCart ? "" :
    line3(o, [[-cu + 4, -30, 20], [HU, -30, 92], [HU, 30, 92], [-cu + 4, 30, 20]], "#3b3e44", 6.5) +
    line3(o, [[-cu + 4, -30, 20], [HU, -30, 92], [HU, 30, 92], [-cu + 4, 30, 20]], "#a9aeb5", 3.4) +
    line3(o, [[HU, -24, 92], [HU, 24, 92]], "#2b2d31", 7.5);
  s += `<g id="${p}-cart">${cart}</g>`;

  // ---- body skins (crossfade)
  for (const [name, m] of Object.entries(SK)) {
    let b = box(o, u0, u1, v0, v1, zc, zT, m, 1.8);
    // −u face: vent slots + screws
    b += G_(faceU(o, u0, v0, zT), Array.from({ length: 5 }, (_, i) => `<rect x="14" y="${20 + i * 12}" width="${v1 - v0 - 28}" height="5" rx="2.5" fill="${darken(m.f, 0.22)}"/>`).join("") +
      [[6, 6], [v1 - v0 - 6, 6], [6, H - 6], [v1 - v0 - 6, H - 6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="${lighten(m.f, 0.35)}"/>`).join(""));
    b += G_(faceTop(o, u0, v0, zT + 0.1), `<rect x="5" y="5" width="${W - 10}" height="${v1 - v0 - 10}" rx="3" fill="none" stroke="${darken(m.t, 0.12)}" stroke-width="1.2"/>`);
    s += `<g id="${p}-skin-${name}" opacity="${name === skin0 ? 1 : 0}">${b}</g>`;
  }
  s += `<g id="${p}-cart-h">${hdl}</g>`;
  // ---- top: lever socket (chrome block) + lever
  s += box(o, -10, 10, -9, 9, zT, zT + 8, { f: "#a9aeb5", s: "#c3c8ce", t: "#e1e4e8", st: "#4b4f56" }, 1.2);
  s += G_(faceTop(o, 0, 0, zT + 8.1), `<rect x="-3" y="-6" width="6" height="12" rx="2" fill="#2b2d31"/>`);
  const LM = frameV(o, 0, 0, zT + 8);
  const leverIn = `<path d="M0 0L-14 -38" stroke="#3b3e44" stroke-width="6" stroke-linecap="round"/><path d="M0 0L-14 -38" stroke="#c3c8ce" stroke-width="3" stroke-linecap="round"/>` +
    `<circle cx="-15" cy="-42" r="7.5" fill="${TEAL}" stroke="#17607a" stroke-width="1.6"/><circle cx="-17" cy="-44.5" r="2.4" fill="#ffffff" opacity="0.7"/>`;
  s += `<g id="${p}-lever" opacity="${leverOn ? 1 : 0}" data-on="${leverOn ? 1 : 0}"><g id="${p}-lever-m">${rotator(`${p}-lever-r`, LM, 0, 0, 0, leverIn)}</g></g>`;

  // ---- front (+v) face: silver frame, plate, gear window, circuit board, card holder
  const FVm = frameV(o, u0, v1, zT), FV = matStr(FVm);
  let fr = `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="5" fill="#d4d7db" stroke="#5a5e65" stroke-width="1.6"/>` +
    `<rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="4" fill="none" stroke="#f1f3f5" stroke-width="1"/>`;
  for (const [x, y] of [[8, 8], [W - 8, 8], [8, H - 8], [W - 8, H - 8]]) fr += `<circle cx="${x}" cy="${y}" r="1.8" fill="#8b9199"/>`;
  // plate
  fr += `<g id="${p}-plate"><rect x="14" y="10" width="${W - 28}" height="22" rx="3" fill="#ffffff" stroke="${TEAL}" stroke-width="2"/>` +
    `<g id="${p}-plate-red" opacity="${atk ? 1 : 0}"><rect x="14" y="10" width="${W - 28}" height="22" rx="3" fill="#fde6e3" stroke="${RED}" stroke-width="2.4"/></g>` +
    txt(W / 2, 26.5, ver, { id: `${p}-plate-t`, size: 15, anchor: "middle", fill: atk ? RED : "#17607a", mono: /^[\x00-\x7f]*$/.test(ver) }) + `</g>`;
  // gear window
  fr += `<rect x="9" y="37" width="${W - 18}" height="58" rx="3" fill="#22343b" stroke="#5a5e65" stroke-width="1.4"/>` +
    `<rect x="11" y="39" width="${W - 22}" height="54" rx="2" fill="none" stroke="#33505a" stroke-width="1"/>`;
  // circuit board (lower right of the window)
  fr += `<rect x="58" y="70" width="22" height="21" rx="2" fill="#2e7d4f" stroke="#1d5233" stroke-width="1"/>` +
    `<rect x="63" y="76" width="9" height="8" rx="1" fill="#1c1c1c"/><path d="M61 73H77M61 88H66V84M75 88V79H78M72 80H76" stroke="#d8b75a" stroke-width="1" fill="none"/>` +
    `<circle cx="61" cy="73" r="1.2" fill="#d8b75a"/><circle cx="77" cy="73" r="1.2" fill="#d8b75a"/><circle cx="66" cy="84" r="1.2" fill="#d8b75a"/>`;
  s += G_(FV, fr);
  // brass gears (meshing; gear-1 turns the other way, faster)
  const BR = "#c9a14a", BRS = "#7a5a18", BRH = "#ecd38c";
  const gearSvg = (gx, gy, r, n) => `<path d="${gearD(gx, gy, r, n, r * 0.3)}" fill="${BR}" stroke="${BRS}" stroke-width="1.2"/><circle cx="${gx}" cy="${gy}" r="${f(r * 0.55)}" fill="none" stroke="${BRH}" stroke-width="1.2"/>` +
    `<circle cx="${gx}" cy="${gy}" r="${f(r * 0.28)}" fill="${BRS}"/><path d="M${gx - r * 0.5} ${gy}H${gx + r * 0.5}" stroke="${BRS}" stroke-width="1.6"/>`;
  s += rotator(`${p}-gear-0`, FVm, 30, 68, 0, gearSvg(30, 68, 13, 10), `data-ratio="1"`);
  s += rotator(`${p}-gear-1`, FVm, 52, 55, 9, gearSvg(52, 55, 8.5, 7), `data-ratio="${f4(-10 / 7)}"`);
  s += G_(FV, `<path d="M11 39L24 39L11 62Z" fill="#ffffff" opacity="0.12"/>`);
  // card holder + card
  const CX0 = 18, CX1 = W - 18, CY0 = 102, CY1 = 121;
  let cd = `<rect x="${CX0 - 4}" y="${CY0 - 4}" width="${CX1 - CX0 + 8}" height="${CY1 - CY0 + 8}" rx="2.5" fill="#b8975a" stroke="#6e5420" stroke-width="1.2"/>` +
    `<path d="M${CX0 - 2} ${CY0 - 1.5}H${CX1 + 2}" stroke="#e6cf96" stroke-width="1"/>`;
  const cardLayer = (id, fill, stroke, vis) => `<g id="${id}" opacity="${vis ? 1 : 0}"><rect x="${CX0}" y="${CY0}" width="${CX1 - CX0}" height="${CY1 - CY0}" rx="1.5" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/></g>`;
  const tone0 = atk ? "red" : "on";
  cd += `<g id="${p}-card" data-on="${owner ? 1 : 0}">` +
    `<g id="${p}-card-off" opacity="${owner ? 0 : 1}"><rect x="${CX0}" y="${CY0}" width="${CX1 - CX0}" height="${CY1 - CY0}" rx="1.5" fill="#f6f3ec" stroke="#9a958b" stroke-width="0.8"/>` +
    `<path d="M${CX0 + 6} ${CY0 + 7}H${CX1 - 6}M${CX0 + 6} ${CY0 + 13}H${CX1 - 14}" stroke="#ddd6c8" stroke-width="1.4" stroke-linecap="round"/></g>` +
    cardLayer(`${p}-card-on`, "#d9eff6", TEAL, owner && tone0 === "on") + cardLayer(`${p}-card-red`, "#fde6e3", RED, owner && tone0 === "red") +
    cardLayer(`${p}-card-green`, "#ddf3e5", GREEN, false) +
    `<g id="${p}-card-tx" opacity="${owner ? 1 : 0}">${txt(W / 2, CY1 - 5, owner || "主人", { id: `${p}-card-t`, size: 11, anchor: "middle", fill: atk ? RED : "#17607a" })}</g></g>`;
  cd += badFrame(`${p}-card-bad`, CX0 - 7, CY0 - 7, CX1 + 7, CY1 + 7, bad === "card");
  s += G_(FV, cd);
  // lever missing: red dashed frame where the lever would stand (u-z plane through the socket)
  s += G_(matStr(LM), badFrame(`${p}-lever-bad`, -26, -54, 12, 2, bad === "lever"));

  const wheelsA = hasCart ? [-38, 38].map((u) => at(o, u, cv + 1.5, wr)) : [];
  const anchors = {
    top: at(o, 0, 0, zT + 70), center: at(o, 0, 0, zc + H / 2), ground: at(o), front: at(o, 0, v1, zc + H / 2),
    plate: applyM(FVm, W / 2, 21), card: applyM(FVm, W / 2, (CY0 + CY1) / 2), gears: applyM(FVm, 40, 64),
    lever: applyM(LM, -15, -42), socket: at(o, 0, 0, zT + 8), cart: at(o, 0, cv, 16), handle: hasCart ? at(o, HU, 0, 92) : at(o, u1, 0, zT), wheels: wheelsA,
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [], ghost: 1, badge: false, glowDefault: false, center: anchors.center, glowR: 90, k: K,
      attrs: `data-wr="${wr}"` }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

export const CATALOG_EXT = { coreModule };
/** runtime-ext.js contents — inline after iso.runtimeJs() (and other chapters' runtime-ext) */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
