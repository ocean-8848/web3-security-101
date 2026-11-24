// objects-ext.mjs — 第 14 集（ZK 与证明系统）补充拟物物件，与 kit/objects.mjs 同一投影、同一接口
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"
//   opts.glow = true 时脚下绿色地光；opts.scale = 以地面原点等比缩放（anchors 已换算）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，KIT.grow 直接可用；另有一层 ID-mv（整件包一层，便于段里平移）。
//   broken 只标出"坏的那一处"（红虚线框 + 红叉），整件不变虚；ID-wire 为空，不要用 KIT.broke，
//   改用 KITX14.sheetBad / KITX14.machineBad。
// 动画助手在 runtime-ext.js（window.KITX14，并以不覆盖的方式合并进 window.KITX），用 runtimeExtJs() 内联在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  f, f4, at, pts, M, C, darken,
  frameV, frameU, matStr, applyM, faceTop,
  box, wedge,
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
/** round stamp (local 2-D): green check or red X */
const stamp = (id, x, y, r, ok, on) =>
  `<g id="${id}" opacity="${on ? 1 : 0}"><circle cx="${x}" cy="${y}" r="${r}" fill="${ok ? GREEN : RED}" stroke="#ffffff" stroke-width="1.8"/>` +
  (ok ? `<path d="M${f(x - r * 0.45)} ${f(y)}l${f(r * 0.32)} ${f(r * 0.34)}l${f(r * 0.6)} ${f(-r * 0.64)}" fill="none" stroke="#ffffff" stroke-width="${f(r * 0.24)}" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="M${f(x - r * 0.38)} ${f(y - r * 0.38)}L${f(x + r * 0.38)} ${f(y + r * 0.38)}M${f(x + r * 0.38)} ${f(y - r * 0.38)}L${f(x - r * 0.38)} ${f(y + r * 0.38)}" stroke="#ffffff" stroke-width="${f(r * 0.24)}" stroke-linecap="round"/>`) + `</g>`;
const CLIP = { f: "#3a3c41", s: "#2a2c30", t: "#4c4f55", st: "#141518" };
const DEF_FILLED = [[1], [2], [0], [3], [1]];

// =====================================================================================
// 答题卡 answerSheet — 一张立在黑色小夹座上的答题卡：米白卡面、青蓝边框，顶部一条青蓝页眉（"答题卡"）；卡面 rows 行 × cols 个椭圆涂格，每行左侧写题号。
// 约 90×20×140（卡面 90×120，底座 z 0–18）。卡面在 v = 1.5 的竖直面里，正面朝 +v（看向观众）。
// opts: rows=5, cols=4, filled（每行涂了哪几格：数组的数组，或每行一个数字；默认每行 1 格）, blank=false（true = 正常涂格先隐藏，用 KITX14.sheetFill 按行逐个出现）,
//   mark（"ok" 绿勾 / "bad" 红叉 / "none"；默认 attacker "ok"，其他 "none"）, title="答题卡"（页眉字，"" 不画）
// 状态：normal 每行涂 1 格（墨色）；attacker 最后一行其余格也涂成红色（ID-extra 显示 = 4 格全涂），判分章仍是绿勾（= 照样判对）；
//   broken 卡面红虚线框 + 红叉。整件不变虚。
// 可动：ID-fill（正常涂格，逐行 ID-fill-0..：KITX14.sheetFill）, ID-extra（最后一行多涂的格，红：KITX14.sheetExtra）,
//   ID-mark（右上角判分章 ID-mark-ok / ID-mark-bad：KITX14.sheetMark）, ID-bad（KITX14.sheetBad）
// anchors: top, center, ground, rows[0..rows-1]（每行涂格区中心）, mark（右上角判分章）, extra（最后一行多涂格的中心）
// =====================================================================================
export function answerSheet(o, opts = {}) {
  const p = opts.id ?? "sheet", K = opts.scale ?? 1, st = opts.state ?? "normal", atk = st === "attacker", brk = st === "broken";
  const rows = Math.max(1, opts.rows ?? 5), cols = Math.max(1, opts.cols ?? 4);
  const fl = opts.filled ?? DEF_FILLED;
  const fillOf = (r) => { const q = Array.isArray(fl) ? fl[r % fl.length] : fl; return (Array.isArray(q) ? q : [q]).filter((c) => c >= 0 && c < cols); };
  const blank = !!opts.blank;
  const mark = opts.mark ?? (atk ? "ok" : "none");
  const title = opts.title ?? "答题卡";
  const W = 90, H = 120, Z0 = 18, Z1 = Z0 + H, HD = 16;
  let s = contactShadow(o, 52, 22);
  // clip stand (back part)
  s += box(o, -34, 34, -12, 12, 0, 10, CLIP, 1.4);
  s += box(o, -22, 22, -5, -1.5, 10, 26, CLIP, 1.2);
  // card slab
  s += box(o, -W / 2, W / 2, -1.5, 1.5, Z0, Z1, M.paper, 1.2);
  const FM = frameV(o, -W / 2, 1.5, Z1);
  let c = `<rect x="0" y="0" width="${W}" height="${H}" fill="#fbf8f0" stroke="${TEAL}" stroke-width="2.4"/>` +
    `<rect x="0" y="0" width="${W}" height="${HD}" fill="${TEAL}"/>` +
    (title ? txt(6, 11.5, title, { size: 9.5, fill: "#ffffff" }) : "");
  const y0 = HD + 8, y1 = H - 8, rh = (y1 - y0) / rows;
  const cx0 = 30, cx1 = 80, cstep = cols > 1 ? (cx1 - cx0) / (cols - 1) : 0;
  const ox = (j) => (cols > 1 ? cx0 + j * cstep : (cx0 + cx1) / 2);
  const ry = Math.min(4.4, rh * 0.28), rx = Math.min(6.2, cstep ? cstep * 0.36 : 6.2);
  const oval = (j, yy, fill, stroke, extra = "") => `<ellipse cx="${f(ox(j))}" cy="${f(yy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" ${extra}/>`;
  const rowY = [];
  let fills = "";
  for (let r = 0; r < rows; r++) {
    const yy = y0 + rh * (r + 0.5); rowY.push(yy);
    if (r) c += `<path d="M4 ${f(y0 + rh * r)}L${W - 4} ${f(y0 + rh * r)}" stroke="#e6dfd0" stroke-width="1"/>`;
    c += txt(11, yy + 3.6, String(r + 1), { size: 10, anchor: "middle", fill: C.ink, mono: true });
    for (let j = 0; j < cols; j++) c += oval(j, yy, "#ffffff", "#8fc9dc");
    fills += `<g id="${p}-fill-${r}" opacity="${blank ? 0 : 1}">${fillOf(r).map((j) => oval(j, yy, C.ink, C.ink)).join("")}</g>`;
  }
  c += `<g id="${p}-fill" data-n="${rows}">${fills}</g>`;
  const last = rows - 1, extraCols = [...Array(cols).keys()].filter((j) => !fillOf(last).includes(j));
  c += `<g id="${p}-extra" data-n="${extraCols.length}">` +
    extraCols.map((j, i) => `<g id="${p}-extra-${i}" opacity="${atk ? 1 : 0}">${oval(j, rowY[last], RED, "#a8322a")}</g>`).join("") + `</g>`;
  const MX = W - 10, MY = 8;
  c += `<g id="${p}-mark" data-state="${mark}">${stamp(p + "-mark-ok", MX, MY, 9, true, mark === "ok")}${stamp(p + "-mark-bad", MX, MY, 9, false, mark === "bad")}</g>`;
  c += badFrame(`${p}-bad`, -4, -4, W + 4, H + 4, brk);
  s += G_(matStr(FM), c);
  // clip front tab (over the card bottom)
  s += box(o, -22, 22, 1.5, 5, 12, 26, CLIP, 1.2);
  s += G_(matStr(frameV(o, -22, 5, 26)), `<rect x="16" y="4" width="12" height="3" rx="1.5" fill="#6b6f76"/>`);

  const L = (x, y) => applyM(FM, x, y);
  const ex = extraCols.length ? extraCols.reduce((a, j) => a + ox(j), 0) / extraCols.length : (cx0 + cx1) / 2;
  const anchors = {
    top: at(o, 0, 0, Z1 + 14), center: L(W / 2, H / 2), ground: at(o),
    rows: rowY.map((yy) => L((cx0 + cx1) / 2, yy)), mark: L(MX, MY), extra: L(ex, rowY[last]),
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [], ghost: 1, badge: false, center: anchors.center, glowR: 70, k: K }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

// =====================================================================================
// 阅卷机 / 验证器 gradingMachine — 一台桌面光学阅卷机：浅灰机身，后半是一道向前（+v）下斜的斜面顶，斜面上一道横向进卡口（fed 时露出卡片上沿）；
//   正面（+v）一块深色显示窗 + 一盏判定灯 + 一道出卡缝，前方一只出卡托盘；−u 侧面一块铭牌写 title。
// 约 160×120×100（机身 u ±80、v −45..45，托盘伸到 v 74；斜面顶 z 100 → 70）。
// opts: title="阅卷机"（D 区写"验证器"）, lamp="off"（"green" / "red" / "off"；attacker 默认 "green"）, fed=false（进卡口有卡）,
//   screen（显示窗文字；默认 lamp green → "通过"，red → "不通过"，否则空）
// 状态：normal 灯灭或绿灯"通过"；attacker 灯仍是绿的"通过"，机身外一圈红虚线（= 判对了错的东西）；broken 正面红虚线框 + 红叉，灯灭。整件不变虚。
// 可动：ID-card（进卡口里的卡，KITX14.card 升起 / 下沉读入）, ID-lamp（判定灯 ID-lamp-g / -r：KITX14.lamp）, ID-scr（显示窗，文字 ID-scr-t：KITX14.scr）,
//   ID-ring（外圈红虚线：KITX14.ring）, ID-bad（KITX14.machineBad）；一次判卷：KITX14.grade（卡下沉 → 灯 + 屏幕字）
// anchors: top, center, ground, slot（进卡口）, lamp, tray（出卡托盘中心）, scr（显示窗中心）, plate（铭牌中心）
// =====================================================================================
export function gradingMachine(o, opts = {}) {
  const p = opts.id ?? "gm", K = opts.scale ?? 1, st = opts.state ?? "normal", atk = st === "attacker", brk = st === "broken";
  const lampS = brk ? "off" : opts.lamp ?? (atk ? "green" : "off");
  const scrT = String(opts.screen ?? (lampS === "green" ? "通过" : lampS === "red" ? "不通过" : ""));
  const title = String(opts.title ?? "阅卷机");
  const fed = !!opts.fed;
  const U0 = -80, U1 = 80, V0 = -45, V1 = 45, ZB = 56, ZH = 100, ZL = 70, VW = 15;
  const BODY = M.steelLight, BODYL = { f: "#d7dade", s: "#c2c6cc", t: "#eceef0", st: "#7d828a" };
  let s = contactShadow(o, 110, 62, 0, 12);
  // lower body + sloped upper housing
  s += box(o, U0, U1, V0, V1, 0, ZB, BODYL, 1.6);
  s += wedge(o, U0, U1, V0, VW, ZB, ZH, BODY, "+v", ZL, 1.6);
  // slot on the slope at v = SV
  const SV = -12, H = (v) => ZH + (ZL - ZH) * ((v - V0) / (VW - V0)), SZ = H(SV);
  const slotPoly = [at(o, -56, SV - 4, H(SV - 4)), at(o, 56, SV - 4, H(SV - 4)), at(o, 56, SV + 4, H(SV + 4)), at(o, -56, SV + 4, H(SV + 4))];
  s += `<polygon points="${pts(slotPoly)}" fill="#26282c" stroke="#141518" stroke-width="1.2"/>`;
  // card in the slot (clipped at the slot line; runtime translates ID-card down to "read it in")
  const CW = 88, CH = 30, CU = -CW / 2;
  const CM = frameV(o, CU, SV, SZ);
  const cardIn = `<rect x="0" y="${-CH}" width="${CW}" height="${CH + 4}" fill="#fbf8f0" stroke="${TEAL}" stroke-width="2"/><rect x="0" y="${-CH}" width="${CW}" height="9" fill="${TEAL}"/>` +
    [0, 1].map((i) => `<path d="M8 ${-CH + 16 + i * 7}L${CW - 8} ${-CH + 16 + i * 7}" stroke="#cfc6b4" stroke-width="1.4"/>`).join("");
  s += `<defs><clipPath id="${p}-cclip" clipPathUnits="userSpaceOnUse"><rect x="-4" y="-80" width="${CW + 8}" height="80"/></clipPath></defs>` +
    G_(matStr(CM), `<g id="${p}-card" data-d="${CH + 4}" data-up="${fed ? 1 : 0}" transform="translate(0 ${fed ? 0 : CH + 4})">${cardIn}</g>`, `clip-path="url(#${p}-cclip)"`);
  // slot front lip (over the card bottom)
  s += `<polyline points="${pts([at(o, -56, SV + 4, H(SV + 4)), at(o, 56, SV + 4, H(SV + 4))])}" stroke="#141518" stroke-width="2.2" fill="none"/>`;

  // −u side nameplate
  const PM = frameU(o, U0, V0, ZB);
  const tsz = isAscii(title) ? 13 : title.length > 4 ? 12 : 16;
  s += G_(matStr(PM), `<rect x="14" y="10" width="62" height="28" rx="3" fill="#fffdf8" stroke="${C.ink}" stroke-width="1.6"/>` +
    txt(45, 24 + tsz * 0.36, title, { id: p + "-plate-t", size: tsz, anchor: "middle", mono: isAscii(title) }) +
    `<circle cx="18" cy="14" r="1.6" fill="#7d828a"/><circle cx="72" cy="34" r="1.6" fill="#7d828a"/>`);

  // +v front: display window, lamp, exit slit
  const FM = frameV(o, U0, V1, ZB);
  const SX0 = 18, SX1 = 98, SY0 = 9, SY1 = 33, LX = 128, LY = 21, LR = 10;
  const scol = lampS === "red" ? "#ff8a80" : "#7fe0a6";
  let fr = `<rect x="${SX0 - 3}" y="${SY0 - 3}" width="${SX1 - SX0 + 6}" height="${SY1 - SY0 + 6}" rx="4" fill="#8b9199" stroke="#5a6068" stroke-width="1"/>` +
    `<g id="${p}-scr"><rect x="${SX0}" y="${SY0}" width="${SX1 - SX0}" height="${SY1 - SY0}" rx="2.5" fill="#1d2a31"/>` +
    txt((SX0 + SX1) / 2, (SY0 + SY1) / 2 + 5, scrT, { id: p + "-scr-t", size: 14, anchor: "middle", fill: scol }) + `</g>`;
  fr += `<circle cx="${LX}" cy="${LY}" r="${LR + 3}" fill="#8b9199" stroke="#5a6068" stroke-width="1"/>` +
    `<g id="${p}-lamp" data-s="${lampS}"><circle cx="${LX}" cy="${LY}" r="${LR}" fill="#4a4d53"/>` +
    `<g id="${p}-lamp-g" opacity="${lampS === "green" ? 1 : 0}"><circle cx="${LX}" cy="${LY}" r="${LR + 7}" fill="${GREEN}" opacity="0.22"/><circle cx="${LX}" cy="${LY}" r="${LR}" fill="#3fd17f"/><circle cx="${LX - 3}" cy="${LY - 3}" r="3" fill="#ffffff" opacity="0.7"/></g>` +
    `<g id="${p}-lamp-r" opacity="${lampS === "red" ? 1 : 0}"><circle cx="${LX}" cy="${LY}" r="${LR + 7}" fill="${RED}" opacity="0.22"/><circle cx="${LX}" cy="${LY}" r="${LR}" fill="#ff5b4f"/><circle cx="${LX - 3}" cy="${LY - 3}" r="3" fill="#ffffff" opacity="0.7"/></g></g>`;
  fr += `<rect x="30" y="42" width="100" height="5" rx="2" fill="#2a2c30"/>`;
  fr += badFrame(`${p}-bad`, SX0 - 8, SY0 - 8, LX + LR + 8, SY1 + 8, brk);
  s += G_(matStr(FM), fr);
  // output tray
  s += box(o, -54, 54, V1, V1 + 29, 3, 6, M.steel, 1.2);
  s += box(o, -54, 54, V1 + 26, V1 + 29, 6, 12, M.steel, 1.2);

  // attacker ring: dashed rounded rect around the projected body
  const corners = [];
  for (const u of [U0, U1]) for (const v of [V0, V1 + 29]) for (const z of [0, ZH]) corners.push(at(o, u, v, z));
  const xs = corners.map((q) => q[0]), ys = corners.map((q) => q[1]), pad = 12;
  const rx0 = Math.min(...xs) - pad, ry0 = Math.min(...ys) - pad - 18, rx1 = Math.max(...xs) + pad, ry1 = Math.max(...ys) + pad;
  const over = `<rect id="${p}-ring" x="${f(rx0)}" y="${f(ry0)}" width="${f(rx1 - rx0)}" height="${f(ry1 - ry0)}" rx="22" fill="none" stroke="${RED}" stroke-width="3.2" stroke-dasharray="11 7" opacity="${atk ? 1 : 0}"/>`;

  const anchors = {
    top: at(o, 0, SV, SZ + CH + 14), center: at(o, 0, 0, 50), ground: at(o),
    slot: at(o, 0, SV, SZ), lamp: applyM(FM, LX, LY), tray: at(o, 0, V1 + 14, 8), scr: applyM(FM, (SX0 + SX1) / 2, (SY0 + SY1) / 2),
    plate: applyM(PM, 45, 24),
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [], ghost: 1, badge: false, center: anchors.center, glowR: 120, k: K, over }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

export const CATALOG_EXT = { answerSheet, gradingMachine };
/** runtime-ext.js contents — inline after iso.runtimeJs() (and other chapters' runtime-ext) */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
