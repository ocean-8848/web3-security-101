// objects-ext.mjs — 第 15 集（账户抽象与新钱包）补充拟物物件，与 kit/objects.mjs 同一投影、同一接口
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"（delegateTag 另有 "cleared"）
//   opts.glow = true 时脚下绿色地光；opts.scale = 以地面原点等比缩放（anchors 已换算）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，KIT.grow 直接可用；另有一层 ID-mv（整件包一层，便于段里平移）。
//   gasPump 的 broken 只标正面（红虚线框 + 红叉），整件不变虚；ID-wire 为空，不要用 KIT.broke，改用 KITX15.pumpBad。
// 动画助手在 runtime-ext.js（window.KITX15，并以不覆盖的方式合并进 window.KITX），用 runtimeExtJs() 内联在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  f, f4, at, M, C, darken, lighten,
  frameV, frameU, matStr, applyM, faceTop,
  box, cyl,
  glow, contactShadow, wireSvg, badgeSvg,
} from "../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const txt = (x, y, s, o = {}) =>
  `<text ${o.id ? `id="${o.id}"` : ""} x="${f(x)}" y="${f(y)}" ${o.mono ? MONO : FONT} font-size="${o.size ?? 20}" font-weight="${o.weight ?? 900}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}" ${o.extra ?? ""}>${s}</text>`;
const isAscii = (s) => /^[\x00-\x7f]*$/.test(String(s));
/** text width in em: CJK = 1, ASCII ≈ 0.6 */
const em = (s) => [...String(s)].reduce((n, ch) => n + (/[\x00-\x7f]/.test(ch) ? 0.6 : 1), 0);
const fitSize = (s, w, max) => f(Math.min(max, w / Math.max(1, em(s))));
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
const RED = "#e0453a", TEAL = "#2aa3c9", GRAY = "#8b9199";
/** red dashed frame (local 2-D, inside a face group) + small red X dot at the top-right corner */
const badFrame = (id, x0, y0, x1, y1, on) =>
  `<g id="${id}" opacity="${on ? 1 : 0}"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="3" fill="rgba(224,69,58,0.08)" stroke="${RED}" stroke-width="2.6" stroke-dasharray="6 4"/>` +
  `<g id="${id}-x"><circle cx="${x1}" cy="${y0}" r="10" fill="${RED}" stroke="#ffffff" stroke-width="1.6"/><path d="M${x1 - 4} ${y0 - 4}L${x1 + 4} ${y0 + 4}M${x1 + 4} ${y0 - 4}L${x1 - 4} ${y0 + 4}" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/></g></g>`;
const BRASS = { f: "#d6ae55", s: "#b48a33", t: "#ecd38c", st: "#7a5a18" };

// =====================================================================================
// 委托挂牌 delegateTag — 挂在 E02 addrPlate 立柱上的黄铜行李牌：上沿金属夹扣 + 一小段链子，牌面白底，
//   第一行小字 prefix（"0xef0100"），第二行"委托 →"，第三行 target（指向的合约名）。牌面朝 +v（与门牌同向）。
// 约 56×6×76（含夹扣和链子）。origin = 夹扣正下方的地面点；夹扣高 hang（默认 76，世界单位，未缩放）。
//   挂到门牌上用 delegateTagOn(plateOrigin, { plateScale, …opts }) → { o, opts }（夹扣正好落在立柱上，plateScale 是门牌的包层倍率）。
// opts: target="钱包实现", prefix="0xef0100", hang=76, on=true（false = 还没挂上：ID-tag 透明、抬高，用 KITX15.tagDrop 落下）
// 状态：normal 青蓝边框 + 青蓝字；attacker 红边框 + 红字（target 默认"攻击者合约"）；cleared 牌面灰色盖层"已清零"（ID-clear）；broken 当 cleared 处理并加红叉。
// 可动：ID-tag（牌身连链子：落下 translate，KITX15.tagDrop / tagHide）→ ID-tag-r（摆动 rotate，KITX15.tagSwing）,
//   ID-text（牌面文字：ID-lead "委托 →"、ID-tgt target，KITX15.tagText / tagState）, ID-bd-n / ID-bd-a（青蓝 / 红边框）,
//   ID-clear（灰色"已清零"盖层，KITX15.tagClear）, ID-hl（一闪的高光，KITX15.tagPulse）
// anchors: top（夹扣上方）, center（牌中心）, ground, clip（夹扣）, text（牌面中心，供红虚线连线）
// =====================================================================================
export function delegateTag(o, opts = {}) {
  const p = opts.id ?? "dtag", K = opts.scale ?? 1;
  const st0 = opts.state ?? "normal", atk = st0 === "attacker", clr = st0 === "cleared" || st0 === "broken";
  const target = opts.target ?? (atk ? "攻击者合约" : "钱包实现"), prefix = opts.prefix ?? "0xef0100";
  const on = opts.on !== false;
  const H = opts.hang ?? 76;                     // clip height (world units, unscaled)
  const TW = 56, TH = 46, ZT = H - 14;           // tag face: u −28..28, z ZT−TH..ZT
  const TV = 3;                                  // front face plane (+v)
  let clip = "", tag = "";
  // ---- clip: a brass band on the post + spring catch
  clip += box(o, -6, 6, -4, 2, H - 5, H + 5, BRASS, 1.2);
  clip += G_(matStr(frameV(o, -6, 2, H + 5)), `<rect x="2" y="2.5" width="8" height="5" rx="1" fill="${BRASS.t}" stroke="${BRASS.st}" stroke-width="0.8"/><circle cx="6" cy="5" r="1.4" fill="${BRASS.st}"/>`);
  // ---- chain: 4 links clip → tag hole
  const links = [];
  for (let i = 0; i < 4; i++) { const z = H - 7 - i * 2.4; links.push(G_(matStr(frameV(o, 0, 1, z)), `<ellipse cx="0" cy="0" rx="${i % 2 ? 1.2 : 2}" ry="2" fill="none" stroke="${BRASS.st}" stroke-width="1.2"/>`)); }
  tag += links.join("");
  // ---- tag body: thin brass slab + white face on +v
  tag += box(o, -TW / 2, TW / 2, -TV, TV, ZT - TH, ZT, BRASS, 1.4);
  const FM = frameV(o, -TW / 2, TV, ZT);
  const tcol = atk ? RED : "#17607a";
  const tsz = fitSize(target, TW - 8, 12);
  let face = `<rect x="3" y="3" width="${TW - 6}" height="${TH - 6}" rx="3" fill="#fffdf8"/>` +
    `<rect id="${p}-bd-n" x="3" y="3" width="${TW - 6}" height="${TH - 6}" rx="3" fill="none" stroke="${TEAL}" stroke-width="2.2" opacity="${atk ? 0 : 1}"/>` +
    `<rect id="${p}-bd-a" x="3" y="3" width="${TW - 6}" height="${TH - 6}" rx="3" fill="none" stroke="${RED}" stroke-width="2.6" opacity="${atk ? 1 : 0}"/>` +
    `<circle cx="${TW / 2}" cy="2.5" r="2" fill="#5a4a20"/>` +
    txt(7, 13, prefix, { size: 5.6, weight: 700, fill: "#6d685e", mono: true }) +
    `<g id="${p}-text">` + txt(7, 25, "委托 →", { id: `${p}-lead`, size: 8.5, fill: tcol }) +
    txt(TW / 2, 38.5, target, { id: `${p}-tgt`, size: tsz, anchor: "middle", fill: tcol, mono: isAscii(target) }) + `</g>` +
    `<g id="${p}-clear" opacity="${clr ? 1 : 0}"><rect x="3" y="3" width="${TW - 6}" height="${TH - 6}" rx="3" fill="#d9d6d0" stroke="${GRAY}" stroke-width="2.2"/>` +
    txt(TW / 2, 28, "已清零", { size: 11, anchor: "middle", fill: "#6d685e" }) + `</g>` +
    `<rect id="${p}-hl" x="0" y="0" width="${TW}" height="${TH}" rx="4" fill="#fff6c8" opacity="0"/>`;
  tag += G_(matStr(FM), face);
  const [cx, cy] = at(o, 0, 0, H);
  const DROP = 26;
  const svgTag = `<g id="${p}-clipg" opacity="${on ? 1 : 0}">${clip}</g>` +
    `<g id="${p}-tag" data-dy="${-DROP}" data-on="${on ? 1 : 0}" opacity="${on ? 1 : 0}" transform="translate(0 ${on ? 0 : -DROP})">` +
    `<g id="${p}-tag-r" data-cx="${f(cx)}" data-cy="${f(cy)}" transform="rotate(0 ${f(cx)} ${f(cy)})">${tag}</g></g>`;
  const anchors = {
    top: at(o, 0, 0, H + 12), center: at(o, 0, TV, ZT - TH / 2), ground: at(o), clip: [f(cx), f(cy)], text: applyM(FM, TW / 2, TH / 2),
  };
  return {
    svg: shell(p, o, { ...opts, state: st0 === "broken" ? "broken" : st0 === "attacker" ? "attacker" : "normal" },
      { solid: svgTag, wire: [], ghost: 1, center: anchors.center, badgeR: 14, glowR: 40, k: K, attrs: `data-tstate="${st0}"` }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

/** Hang a delegateTag on an E02 addrPlate standing at plateO (wrapped at plateScale, default 1).
 *  Returns { o, opts } for delegateTag(o, opts): the tag's clip lands on the front of the plate's post, below the mailbox.
 *  opts.scale defaults to plateScale (tag grows with the plate); any other opts are passed through. */
export function delegateTagOn(plateO, opts = {}) {
  const S = opts.plateScale ?? 1, K = opts.scale ?? S;
  const { plateScale, ...rest } = opts;
  return { o: { u: plateO.u, v: plateO.v + 9 * S }, opts: { ...rest, scale: K, hang: (76 * S) / K } };
}

// =====================================================================================
// Gas 加油机 gasPump — 加油站的加油机：水泥小底座 + 竖立的青蓝机身，顶上白色灯箱写 title（+v 面），
//   +v 面一块小屏显示代付金额、屏旁一盏状态灯，−u 面一扇竖向小窗露出"押金"液位；+v 面右侧挂一把油枪，软管从机身下部接出。
// 约 90×70×160。
// opts: title="Paymaster", scr="代付 Gas"（屏幕文字）, level=0.8（押金液位 0–1）
// 状态：normal 绿灯、液位 0.8；attacker 屏幕红字"签名被重放"、液位 0.1、红灯；broken +v 面红虚线框 + 红叉、灯灭（整件不变虚）。
// 可动：ID-nozzle（油枪：挂在机身上 / 伸出插到目标，KITX15.pumpNozzle；软管 ID-hose 跟着走）, ID-level（押金液位 scaleY，KITX15.pumpLevel）,
//   ID-scr-t（屏幕文字，KITX15.pumpScr）, ID-lamp-g / ID-lamp-r（状态灯，KITX15.pumpLamp）, ID-bad（KITX15.pumpBad）
// anchors: top, center, ground, nozzle（油枪口，按挂着的位置）, scr（屏幕中心）, level（液位窗中心）, title（灯箱字中心）
// =====================================================================================
export function gasPump(o, opts = {}) {
  const p = opts.id ?? "pump", K = opts.scale ?? 1, st = opts.state ?? "normal", atk = st === "attacker", brk = st === "broken";
  const title = opts.title ?? "Paymaster";
  const scr = opts.scr ?? (atk ? "签名被重放" : "代付 Gas");
  const lv = Math.max(0, Math.min(1, opts.level ?? (atk ? 0.1 : 0.8)));
  const BODY = { f: "#3fb0d4", s: "#2a8fb3", t: "#7fcfe6", st: "#17607a" };
  const BU = 40, BV = 30, Z0 = 12, Z1 = 136, LZ1 = 160;
  let s = contactShadow(o, 66, 52);
  // ---- concrete island + body + lightbox
  s += box(o, -50, 50, -40, 40, 0, Z0, M.plinth, 1.4);
  s += G_(faceTop(o, -50, -40, Z0 + 0.1), `<path d="M6 6H94M6 74H94" stroke="#e0b93a" stroke-width="3" stroke-dasharray="8 6"/>`);
  s += box(o, -BU, BU, -BV, BV, Z0, Z1, BODY, 1.8);
  s += box(o, -BU + 4, BU - 4, -BV + 4, BV - 4, Z1, Z1 + 4, M.steel, 1.2);
  s += box(o, -BU - 4, BU + 4, -BV - 4, BV + 4, Z1 + 4, LZ1, M.white, 1.6);
  // lightbox title on +v and −u faces
  const LW = 2 * BU + 8, LH = LZ1 - Z1 - 4;
  const tsz = fitSize(title, LW - 12, 14);
  const LFv = frameV(o, -BU - 4, BV + 4, LZ1);
  s += G_(matStr(LFv), `<rect x="3" y="3" width="${LW - 6}" height="${LH - 6}" rx="2" fill="#eef8fb" stroke="${TEAL}" stroke-width="1.6"/>` +
    txt(LW / 2, LH / 2 + tsz * 0.36, title, { size: tsz, anchor: "middle", fill: "#17607a", mono: isAscii(title) }));
  s += G_(matStr(frameU(o, -BU - 4, -BV - 4, LZ1)), `<rect x="3" y="3" width="${2 * BV + 2}" height="${LH - 6}" rx="2" fill="#eef8fb" stroke="${TEAL}" stroke-width="1.4"/>` +
    `<path d="M${BV + 4 - 7} ${LH / 2 + 5}l7 -12l7 12z" fill="${TEAL}"/>`);
  // ---- +v face: screen, lamp, holster, base vent
  const FW = 2 * BU, FH = Z1 - Z0;
  const FM = frameV(o, -BU, BV, Z1);
  const ssz = fitSize(scr, 50, 11);
  let fv = `<rect x="8" y="8" width="${FW - 16}" height="34" rx="3" fill="#dfe4e8" stroke="${BODY.st}" stroke-width="1.2"/>` +
    `<rect x="12" y="12" width="52" height="26" rx="2" fill="#152126"/>` +
    txt(38, 25 + ssz * 0.36, scr, { id: `${p}-scr-t`, size: ssz, anchor: "middle", fill: atk ? "#ff8a80" : "#7fe0a6", mono: isAscii(scr) }) +
    `<circle cx="${FW - 9}" cy="25" r="4.5" fill="#5a5e65" stroke="#2b2d31" stroke-width="1"/>` +
    `<circle id="${p}-lamp-g" cx="${FW - 9}" cy="25" r="4.5" fill="#2bd46f" opacity="${!atk && !brk ? 1 : 0}"/>` +
    `<circle id="${p}-lamp-r" cx="${FW - 9}" cy="25" r="4.5" fill="#ff4a3d" opacity="${atk ? 1 : 0}"/>` +
    `<rect x="10" y="52" width="40" height="22" rx="2" fill="${lighten(BODY.s, 0.2)}" stroke="${BODY.st}" stroke-width="1"/>` +
    txt(30, 67, "GAS", { size: 10, anchor: "middle", fill: "#ffffff", mono: true }) +
    `<rect x="${FW - 22}" y="48" width="14" height="30" rx="3" fill="#2b2d31" stroke="#141518" stroke-width="1"/>` +
    [0, 1, 2, 3].map((i) => `<path d="M10 ${FH - 22 + i * 4}H${FW - 10}" stroke="${BODY.st}" stroke-width="1.2"/>`).join("");
  fv += badFrame(`${p}-bad`, 2, 2, FW - 2, FH - 2, brk);
  s += G_(matStr(FM), fv);
  // ---- −u face: deposit level window
  const UM = frameU(o, -BU, -BV, Z1);
  const WX0 = 22, WX1 = 38, WY0 = 18, WY1 = 92;
  s += G_(matStr(UM), `<rect x="${WX0 - 3}" y="${WY0 - 3}" width="${WX1 - WX0 + 6}" height="${WY1 - WY0 + 6}" rx="3" fill="#dfe4e8" stroke="${BODY.st}" stroke-width="1.2"/>` +
    `<rect x="${WX0}" y="${WY0}" width="${WX1 - WX0}" height="${WY1 - WY0}" rx="1.5" fill="#1d2a31"/>` +
    `<rect id="${p}-level" data-yb="${WY1}" data-lv="${f4(lv)}" x="${WX0}" y="${WY0}" width="${WX1 - WX0}" height="${WY1 - WY0}" rx="1.5" fill="#f0c04a" transform="translate(0 ${WY1}) scale(1 ${f4(lv)}) translate(0 ${-WY1})"/>` +
    [0.25, 0.5, 0.75].map((q) => `<path d="M${WX1} ${f(WY1 - q * (WY1 - WY0))}h4" stroke="${BODY.st}" stroke-width="1.2"/>`).join("") +
    txt((WX0 + WX1) / 2, WY1 + 16, "押金", { size: 10, anchor: "middle", fill: "#ffffff" }));
  // ---- nozzle (in the +v face plane, sitting in the holster) + hose from the lower front
  const nz = applyM(FM, FW - 15, 50);        // grip top (rest)
  const tip = applyM(FM, FW - 15 + 16, 50 + 4);
  const hose0 = applyM(FM, FW - 30, FH - 4);
  const NM = frameV(o, -BU + FW - 15, BV + 1, Z1 - 50);
  const gun = G_(matStr(NM), `<rect x="-6" y="-4" width="12" height="26" rx="3" fill="#2f3237" stroke="#141518" stroke-width="1.2"/>` +
    `<path d="M-2 -2L12 -2L18 6L14 8L8 2L-2 2Z" fill="${M.chrome.f}" stroke="${M.chrome.st}" stroke-width="1"/>` +
    `<rect x="-4" y="6" width="8" height="10" rx="2" fill="${atk ? RED : "#1f9d55"}"/>`);
  const hoseD = (gx, gy) => { const mx = (hose0[0] + gx) / 2, my = Math.max(hose0[1], gy) + 34; return `M${f(hose0[0])} ${f(hose0[1])}Q${f(mx)} ${f(my)} ${f(gx)} ${f(gy)}`; };
  const grip = applyM(NM, 0, 22);
  const nozzleSvg = `<path id="${p}-hose" d="${hoseD(grip[0], grip[1])}" data-x0="${f(hose0[0])}" data-y0="${f(hose0[1])}" data-gx="${f(grip[0])}" data-gy="${f(grip[1])}" fill="none" stroke="#1c1e21" stroke-width="5" stroke-linecap="round"/>` +
    `<g id="${p}-nozzle" data-tx="${f(tip[0])}" data-ty="${f(tip[1])}" data-k="${f4(K)}" transform="translate(0 0)">${gun}</g>`;
  s += nozzleSvg;
  const anchors = {
    top: at(o, 0, 0, LZ1 + 8), center: at(o, 0, 0, (Z0 + Z1) / 2), ground: at(o), nozzle: tip, scr: applyM(FM, 38, 25),
    level: applyM(UM, (WX0 + WX1) / 2, (WY0 + WY1) / 2), title: applyM(LFv, LW / 2, LH / 2), grip: nz,
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [], ghost: 1, badge: false, center: anchors.center, glowR: 80, k: K }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

export const CATALOG_EXT = { delegateTag, gasPump };
/** runtime-ext.js contents — inline after iso.runtimeJs() (and other chapters' runtime-ext) */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
