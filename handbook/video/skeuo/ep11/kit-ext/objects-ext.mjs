// objects-ext.mjs — 第 11 集（DeFi 经济安全）补充拟物物件，与 kit/objects.mjs 同一投影、同一接口
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"
//   opts.glow = true 时脚下绿色地光；opts.scale = 以地面原点等比缩放（anchors 已换算）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，KIT.grow 直接可用；另有一层 ID-mv（整件包一层，便于段里平移）。
//   两个物件的 broken 都只标出"缺的那一处"（红虚线框 + 红叉），整件不变虚；ID-wire 为空，不要用 KIT.broke，
//   改用 KITX11.lensBad / KITX11.limitBad。
// 动画助手在 runtime-ext.js（window.KITX11，并以不覆盖的方式合并进 window.KITX），用 runtimeExtJs() 内联在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  U, CE, f, f4, at, pts, M, C, lighten, darken,
  frameV, frameU, frameTop, matStr, applyM, faceV, faceU, faceTop,
  box, line3, cyl,
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
const mArr = (m) => m.map((v, i) => (i < 4 ? f4(v) : f(v))).join(",");
/** group rotated about local (px,py) inside face matrix m; runtime rewrites its transform (data-m / data-px / data-py / data-a) */
function rotator(id, m, px, py, a, inner, extra = "") {
  const tr = `${matStr(m)} translate(${px} ${py}) rotate(${f(a)}) translate(${-px} ${-py})`;
  return `<g id="${id}" data-m="${mArr(m)}" data-px="${px}" data-py="${py}" data-a="${f(a)}" transform="${tr}" ${extra}>${inner}</g>`;
}
const RED = "#e0453a", GREEN = "#1f9d55", TEAL = "#2aa3c9";
/** red dashed frame (local 2-D, inside a face group); x = true adds the small red X dot at the top-right corner */
const badFrame = (id, x0, y0, x1, y1, on, x = true) =>
  `<g id="${id}" opacity="${on ? 1 : 0}"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="3" fill="rgba(224,69,58,0.08)" stroke="${RED}" stroke-width="2.4" stroke-dasharray="5 3"/>` +
  (x ? `<g id="${id}-x"><circle cx="${x1}" cy="${y0}" r="7.5" fill="${RED}" stroke="#ffffff" stroke-width="1.4"/><path d="M${x1 - 3} ${y0 - 3}L${x1 + 3} ${y0 + 3}M${x1 + 3} ${y0 - 3}L${x1 - 3} ${y0 + 3}" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round"/></g>` : "") + `</g>`;

// materials
const WOOD = { f: "#9a6539", s: "#7a4b29", t: "#b98454", st: "#4a2a12" };      // dark camera wood
const WOODL = { f: "#b98454", s: "#956236", t: "#d0a172", st: "#6a4220" };     // tripod legs / lens board
const LEATHER = [{ f: "#3a3430", s: "#2a2522", t: "#4a433e", st: "#141110" }, { f: "#2f2a27", s: "#221e1b", t: "#3e3834", st: "#141110" }];
const BRASS = { f: "#d6ae55", s: "#b48a33", t: "#ecd38c", st: "#7a5a18" };
const IRON = { f: "#646a72", s: "#4c5158", t: "#81878f", st: "#26292d" };
const IRON_D = { f: "#4e535a", s: "#3b3f45", t: "#6a7078", st: "#1c1e21" };
const STEEL_L = M.steelLight;

// =====================================================================================
// 快照相机 snapshotCamera — 老式木质箱式相机立在三脚架上：深色木箱 + 黄铜镜头筒 + 前伸（+v）的折叠皮腔，顶上一只闪光灯泡托架（反光碗 + 灯泡）；
//   木箱正面下沿一道黄铜出片口，吐出一张白边相片（像拍立得那样挂在出片口下），相片里是一张缩小的余额表（表头文字 + 三行横线，不写数字）。
// 约 90×70×170（含三脚架）。镜头朝 +v（右前方）：要"对着"某物件，就把那件放在相机的 +v 方向。
// opts: photo="提案前的区块"（相片表头字）, shot=false（false = 相片还没吐出；true = 已挂在出片口下、正面朝外）, sub="区块 N−1"（表头下小字，"" 不画）
// 状态：normal 木色 + 黄铜，相片青蓝框（地光默认关）；attacker 相片红框；broken 镜头位置红虚线框 + 红叉（= 没有快照），灯泡不亮。整件不变虚。
// 可动：ID-flash（闪光白色光圈，KITX11.flash）, ID-shutter（快门叶片，KITX11.shutter）, ID-photo（相片滑出并翻到正面，KITX11.photo；
//   层 ID-photo-s 平移、ID-photo-f 翻转、ID-photo-back / -front 两面，表头字 ID-photo-t）, ID-bulb（灯泡亮，KITX11.bulb）, ID-lens-bad（KITX11.lensBad）
//   一次拍照：KITX11.snap（灯泡亮 → 闪光 + 快门 → 相片吐出）
// anchors: top, center, ground, front（镜头正面中心）, lens, bulb, flash, slot（出片口）, photo（相片吐出后的中心）, body（木箱中心）, tripod
// =====================================================================================
export function snapshotCamera(o, opts = {}) {
  const p = opts.id ?? "snap", K = opts.scale ?? 1, st = opts.state ?? "normal", atk = st === "attacker", brk = st === "broken";
  const shot = !brk && !!opts.shot;
  const head = opts.photo ?? "提案前的区块", sub = opts.sub ?? "区块 N−1";
  const frameC = atk ? RED : TEAL;
  // body box, bellows, lens
  const bu0 = -42, bu1 = 42, bv0 = -30, bv1 = 10, bz0 = 90, bz1 = 146;
  const LZ = 119, LV0 = 34, LV1 = 44, LR = 13;
  let s = contactShadow(o, 62, 56, 0, -4);

  // ---- tripod: back leg, hub, front legs (front legs drawn later, in front of the hub)
  const hub = [0, -8, 86];
  const leg = (to) => line3(o, [hub, to], WOODL.st, 7) + line3(o, [hub, to], WOODL.f, 4.2) + line3(o, [[hub[0] + 0.8, hub[1], hub[2]], [to[0] + 0.8, to[1], to[2]]], WOODL.t, 1.2);
  const feet = [[0, -46, 0], [-34, 24, 0], [34, 24, 0]];
  s += leg(feet[0]);
  s += box(o, -9, 9, -17, 1, 80, 90, M.steel, 1.2);
  s += leg(feet[1]) + leg(feet[2]);
  for (const ft of feet) s += G_(faceTop(o, ft[0], ft[1], 0.2), `<ellipse cx="0" cy="0" rx="4" ry="4" fill="#3b3e44"/>`);
  // tripod centre column + brass clamp
  s += box(o, -4, 4, -12, -4, 60, 82, BRASS, 1);
  s += line3(o, [[0, -8, 62], [-20, 6, 40], [20, 6, 40], [0, -8, 62]], "#6b7178", 1.4);

  // ---- body (dark wood), brass corners, strap handle on top
  s += box(o, bu0, bu1, bv0, bv1, bz0, bz1, WOOD, 1.8);
  const BH = bz1 - bz0, BW = bu1 - bu0, BD = bv1 - bv0;
  // −u face: grain + brass corner plates
  s += G_(faceU(o, bu0, bv0, bz1), [10, 22, 34, 46].map((y) => `<path d="M3 ${y}Q${BD / 2} ${y + 2.5} ${BD - 3} ${y}" stroke="${darken(WOOD.f, 0.16)}" stroke-width="1" fill="none"/>`).join("") +
    `<rect x="${BD / 2 - 9}" y="${BH / 2 - 5}" width="18" height="10" rx="2" fill="${BRASS.f}" stroke="${BRASS.st}" stroke-width="1"/><circle cx="${BD / 2}" cy="${BH / 2}" r="2.2" fill="${BRASS.st}"/>`);
  // +v face (front): brass corners
  const FBm = frameV(o, bu0, bv1, bz1);
  let fb = "";
  for (const [x, y, sx, sy] of [[0, 0, 1, 1], [BW, 0, -1, 1], [0, BH, 1, -1], [BW, BH, -1, -1]])
    fb += `<path d="M${x} ${y + sy * 12}L${x} ${y}L${x + sx * 12} ${y}" stroke="${BRASS.f}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  fb += [8, 20, 32, 44].map((y) => `<path d="M14 ${y}Q${BW / 2} ${y + 2} ${BW - 14} ${y}" stroke="${darken(WOOD.s, 0.14)}" stroke-width="1" fill="none"/>`).join("");
  // photo slot (bottom edge of the front face)
  const SL0 = 18, SL1 = BW - 18, SY = BH - 5;
  fb += `<rect x="${SL0 - 3}" y="${SY - 4}" width="${SL1 - SL0 + 6}" height="7" rx="2" fill="${BRASS.f}" stroke="${BRASS.st}" stroke-width="1"/><rect x="${SL0}" y="${SY - 1.5}" width="${SL1 - SL0}" height="2.6" rx="1" fill="#1a1512"/>`;
  s += G_(matStr(FBm), fb);
  // top: leather strap handle + brass plate
  s += G_(faceTop(o, 0, bv0 + BD / 2, bz1 + 0.1), `<rect x="-20" y="-5" width="40" height="10" rx="5" fill="#2f2a27" stroke="#141110" stroke-width="1"/><rect x="-6" y="-3" width="12" height="6" rx="1.5" fill="${BRASS.f}"/>`);

  // ---- bellows: 4 pleats shrinking toward the lens board
  for (let i = 0; i < 4; i++) {
    const t0 = i / 4, w = 32 - 10 * t0, zb = 98 + 6 * t0, zt = 140 - 6 * t0, v0 = bv1 + i * 6, v1 = v0 + 6;
    s += box(o, -w, w, v0, v1, zb, zt, LEATHER[i % 2], 1.2);
  }
  // lens board
  s += box(o, -22, 22, 34 - 4, LV0, 100, 138, WOODL, 1.4);
  // ---- brass lens barrel (stacked discs along +v), glass, shutter blades
  for (let v = LV0; v < LV1; v += 1) s += G_(faceV(o, 0, v, LZ), `<circle cx="0" cy="0" r="${LR}" fill="${v === LV0 ? BRASS.st : BRASS.s}"/>`);
  const LFm = frameV(o, 0, LV1, LZ);
  let lf = `<circle cx="0" cy="0" r="${LR}" fill="${BRASS.f}" stroke="${BRASS.st}" stroke-width="1.4"/><circle cx="0" cy="0" r="${LR - 2.5}" fill="none" stroke="${BRASS.t}" stroke-width="1"/>` +
    `<circle cx="0" cy="0" r="9" fill="#1d2a31" stroke="#0e1418" stroke-width="1"/><circle cx="0" cy="0" r="5.5" fill="#2c4552"/><circle cx="-3" cy="-3.5" r="2.4" fill="#ffffff" opacity="0.65"/>`;
  // shutter: six blades closing over the glass (hidden = open)
  let bl = "";
  for (let i = 0; i < 6; i++) { const a = i * 60; bl += `<path d="M0 0L9.2 0A9.2 9.2 0 0 1 4.6 7.97Z" transform="rotate(${a})" fill="#3a3f45" stroke="#1c1e21" stroke-width="0.8"/>`; }
  lf += `<g id="${p}-shutter" opacity="0">${bl}<circle cx="0" cy="0" r="1.6" fill="#1c1e21"/></g>`;
  lf += badFrame(`${p}-lens-bad`, -22, -22, 22, 22, brk);
  s += G_(matStr(LFm), lf);

  // ---- flash: rod on the −u back corner, reflector dish facing +v, bulb
  const FU = -28, FV = -14, FZ = 172;
  s += line3(o, [[FU, FV, bz1], [FU, FV, FZ - 8]], "#3b3e44", 4.4) + line3(o, [[FU, FV, bz1], [FU, FV, FZ - 8]], "#a9aeb5", 2);
  s += G_(faceV(o, FU, FV, FZ), `<circle cx="0" cy="0" r="13" fill="#c3c8ce" stroke="#5a5e65" stroke-width="1.4"/><circle cx="0" cy="0" r="9" fill="#eceef0" stroke="#a9aeb5" stroke-width="1"/>`);
  s += G_(faceV(o, FU, FV + 5, FZ), `<circle cx="0" cy="0" r="5.6" fill="#f4f1e6" stroke="#8b9199" stroke-width="1"/><path d="M-2 1.5Q0 -3 2 1.5" stroke="#b3a98d" stroke-width="0.9" fill="none"/>` +
    `<g id="${p}-bulb" opacity="0"><circle cx="0" cy="0" r="12" fill="#fff6c8" opacity="0.55"/><circle cx="0" cy="0" r="5.6" fill="#fffbe6" stroke="#f0c04a" stroke-width="1.2"/></g>`);

  // ---- photo: hangs below the slot in the front-face plane; slides out of a clip, flips back → front
  const PW = SL1 - SL0 - 4, PH = 44;
  const PFm = frameV(o, bu0 + SL0 + 2, bv1 + 0.6, bz0 + 3.6);
  const rows = [0, 1, 2].map((i) => `<path d="M7 ${23 + i * 6}H${PW - 7}" stroke="#8b9199" stroke-width="1.3" stroke-linecap="round"/><path d="M7 ${23 + i * 6}H${16 + ((i * 7) % 11)}" stroke="${frameC}" stroke-width="1.6" stroke-linecap="round"/>`).join("");
  const front = `<rect x="0" y="0" width="${PW}" height="${PH}" rx="1.5" fill="#ffffff" stroke="#9a958b" stroke-width="0.8"/>` +
    `<rect x="3" y="3" width="${PW - 6}" height="${PH - 10}" rx="1" fill="#eef8fb" stroke="${frameC}" stroke-width="1.6"/>` +
    txt(PW / 2, 10.5, head, { id: `${p}-photo-t`, size: 5.6, anchor: "middle", fill: atk ? RED : "#17607a", mono: isAscii(head) }) +
    (sub ? txt(PW / 2, 17, sub, { size: 4.6, weight: 700, anchor: "middle", fill: "#6d685e" }) : "") + rows;
  const back = `<rect x="0" y="0" width="${PW}" height="${PH}" rx="1.5" fill="#d9d4c8" stroke="#9a958b" stroke-width="0.8"/><path d="M6 8H${PW - 6}M6 14H${PW - 16}" stroke="#c3bcad" stroke-width="1.2"/>`;
  s += `<defs><clipPath id="${p}-pclip"><rect x="-4" y="-0.5" width="${PW + 8}" height="${PH + 6}"/></clipPath></defs>`;
  s += G_(matStr(PFm), `<g clip-path="url(#${p}-pclip)"><g id="${p}-photo" data-on="${shot ? 1 : 0}" data-ph="${PH + 2}" data-pw="${PW}">` +
    `<g id="${p}-photo-s" transform="translate(0 ${shot ? 0 : -(PH + 2)})"><g id="${p}-photo-f">` +
    `<g id="${p}-photo-back" opacity="${shot ? 0 : 1}">${back}</g><g id="${p}-photo-front" opacity="${shot ? 1 : 0}">${front}</g></g></g></g></g>`);

  // ---- flash burst (world space, above everything)
  const [fx, fy] = at(o, FU, FV + 6, FZ);
  const flash = `<defs><radialGradient id="${p}-fg"><stop offset="0" stop-color="#ffffff" stop-opacity="1"/><stop offset="0.35" stop-color="#fffbe6" stop-opacity="0.85"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient></defs>` +
    `<g id="${p}-flash" opacity="0" data-cx="${f(fx)}" data-cy="${f(fy)}"><circle cx="${f(fx)}" cy="${f(fy)}" r="62" fill="url(#${p}-fg)"/>` +
    Array.from({ length: 8 }, (_, i) => { const a = (i * 45 * Math.PI) / 180; return `<path d="M${f(fx + 16 * Math.cos(a))} ${f(fy + 16 * Math.sin(a))}L${f(fx + 44 * Math.cos(a))} ${f(fy + 44 * Math.sin(a))}" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>`; }).join("") + `</g>`;

  const anchors = {
    top: at(o, FU, FV, FZ + 16), center: at(o, 0, 0, 110), ground: at(o), front: applyM(LFm, 0, 0), lens: applyM(LFm, 0, 0),
    bulb: at(o, FU, FV + 5, FZ), flash: [fx, fy], slot: applyM(FBm, BW / 2, SY), photo: applyM(PFm, PW / 2, PH / 2), body: at(o, 0, bv0 + BD / 2, bz0 + BH / 2),
    tripod: at(o, 0, -8, 50),
  };
  return {
    svg: shell(p, o, opts, { solid: s, over: flash, wire: [], ghost: 1, badge: false, glowDefault: false, center: anchors.center, glowR: 80, k: K }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

// =====================================================================================
// 铸币机 mintPress — 工业螺旋冲压机：铸铁门形机架（底座 + 两根立柱 + 横梁），横梁上一只大飞轮（顶面水平转）+ 一根竖立的摇柄；
//   螺杆带着中间的冲头上下，冲头下方是模座；模座前面一条出币斜槽落进前面的托盘（托盘里几摞硬币，高度可变）；
//   −u 侧立柱外挂一块钥匙面板，keys 个钥匙孔（每孔上方一盏小灯）；横梁正面一个读数窗（已铸数量）；
//   横梁右端（+u）立一根"限额"刻度柱 + 红色挡块（到限额时挡块落下卡住飞轮）；横梁左端（−u）一盏熔断灯；底座正面青蓝铭牌"发行方"。
// 约 180×140×220（底座 180×140，横梁顶 198，飞轮 206，限额柱顶约 248）。
// opts: keys=1（1 或 3 个钥匙孔）, keyIn=0（已插入的钥匙数，从 0 号孔起；attacker 默认 1）, atkKey（红钥匙：孔号，或 true = 0 号；attacker 默认 0）,
//   count="1000"（读数窗文字；attacker 默认 "8000万"）, limit=true（true = 限额柱和挡块；false = 那一格红虚线框）, stop=false（挡块已落下）,
//   lamp="green"|"red"|"off"（熔断灯）, pile=0.35（0–1 托盘硬币高度；attacker 默认 1）, plate="发行方"（铭牌字）
// 状态：normal 铸铁灰 + 青蓝铭牌，绿灯；attacker 插着一把红钥匙、读数窗红字、硬币溢出托盘、斜槽前喷出红色硬币点阵；
//   broken 限额柱位置红虚线框 + 红叉（= 没有限额）。整件不变虚。
// 可动：ID-wheel（飞轮，KITX11.wheel；摇柄 ID-peg 跟着转）, ID-ram（冲头，KITX11.ram）, ID-coins（托盘硬币，KITX11.coins；每枚 ID-coin-N）,
//   ID-count（读数窗；字 ID-count-t、红底 ID-count-red，KITX11.count）, ID-limit（挡块，KITX11.limit；整根限额柱 ID-limit-bar，KITX11.limitShow）,
//   ID-limit-bad（KITX11.limitBad）, ID-lamp（熔断灯；层 ID-lamp-green / -red，KITX11.lamp）, ID-key-0..2（钥匙；层 -b 黄铜 / -r 红，KITX11.key；孔上小灯 ID-kl-N-g / -r）,
//   ID-spill / ID-spray（溢出的硬币 / 斜槽前的红色点阵，KITX11.spill）, ID-plate-t（铭牌字）。一次铸币：KITX11.mint（飞轮转 + 冲头连冲 + 硬币长高）
// anchors: top, center, ground, front（横梁正面中心）, plate, count, keyPanel, keys[]（钥匙孔）, wheel, ram, die, chute（斜槽口）, tray, coins（硬币堆顶）,
//   limit（限额柱中部）, stop（挡块）, lamp
// =====================================================================================
export function mintPress(o, opts = {}) {
  const p = opts.id ?? "mint", K = opts.scale ?? 1, st = opts.state ?? "normal", atk = st === "attacker", brk = st === "broken";
  const nk = opts.keys === 3 ? 3 : 1;
  const keyIn = Math.max(0, Math.min(nk, opts.keyIn ?? (atk ? 1 : 0)));
  const atkKey = opts.atkKey === true ? 0 : opts.atkKey ?? (atk ? 0 : -1);
  const count = String(opts.count ?? (atk ? "8000万" : "1000"));
  const limitOn = !brk && opts.limit !== false;
  const stop = limitOn && !!opts.stop;
  const lamp0 = opts.lamp ?? "green";
  const pile0 = Math.max(0, Math.min(1, opts.pile ?? (atk ? 1 : 0.35)));
  const plate = opts.plate ?? "发行方";
  const ZB = 22, ZC1 = 170, ZT = 198, ZW = 206, WR = 50;
  let s = contactShadow(o, 118, 92);

  // ---- base plinth
  s += box(o, -90, 90, -70, 70, 0, ZB, IRON_D, 1.8);
  s += G_(faceTop(o, -90, -70, ZB + 0.1), `<rect x="5" y="5" width="170" height="130" rx="4" fill="none" stroke="${darken(IRON_D.t, 0.12)}" stroke-width="1.4"/>` +
    [[10, 10], [170, 10], [10, 130], [170, 130]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${lighten(IRON_D.t, 0.2)}" stroke="${IRON_D.st}" stroke-width="0.8"/>`).join(""));
  // nameplate on the base front (+v)
  s += G_(faceV(o, -90, 70, ZB), `<rect x="52" y="3" width="76" height="16" rx="2.5" fill="#ffffff" stroke="${TEAL}" stroke-width="1.8"/>` +
    txt(90, 15.2, plate, { id: `${p}-plate-t`, size: 11.5, anchor: "middle", fill: "#17607a", mono: isAscii(plate) }));

  // ---- right column (+u, farther), die, ram + screw, left column
  const column = (u0, u1) => {
    let c = box(o, u0, u1, -22, 22, ZB, ZC1, IRON, 1.6);
    c += G_(faceV(o, u0, 22, ZC1), `<path d="M4 6V${ZC1 - ZB - 6}" stroke="${lighten(IRON.s, 0.18)}" stroke-width="1.2"/>`);
    c += G_(faceU(o, u0, -22, ZC1), `<path d="M6 6V${ZC1 - ZB - 6}M38 6V${ZC1 - ZB - 6}" stroke="${lighten(IRON.f, 0.16)}" stroke-width="1.2"/>`);
    return c;
  };
  s += column(50, 70);
  // die (模座) + blank on top
  s += box(o, -30, 30, -22, 22, ZB, 56, IRON_D, 1.6);
  s += box(o, -14, 14, -12, 12, 56, 60, STEEL_L, 1.1);
  s += cyl(o, 0, 0, 9, 60, 62.5, M.gold, { seg: 20, sw: 0.9 });
  // ram + screw (moves as one: ID-ram)
  let ram = cyl(o, 0, 0, 6.5, 128, ZT - 2, M.chrome, { seg: 20, sw: 1 });
  for (let z = 134; z < ZC1; z += 7) ram += line3(o, [[-6.5, 0, z], [0, 6.5, z + 3], [6.5, 0, z + 6]], "#7d828a", 1.1);
  ram += box(o, -24, 24, -18, 18, 92, 128, IRON, 1.6);
  ram += box(o, -12, 12, -10, 10, 82, 92, M.chrome, 1.2);
  ram += G_(faceV(o, -24, 18, 128), `<rect x="6" y="6" width="36" height="24" rx="2" fill="none" stroke="${lighten(IRON.s, 0.2)}" stroke-width="1.2"/>`);
  s += `<g id="${p}-ram" data-dz="34">${ram}</g>`;
  s += column(-70, -50);

  // ---- key panel on the −u side of the left column
  const KP = { u: -82, v0: -30, v1: 30, z0: 70, z1: 140 };
  s += box(o, KP.u, -70, KP.v0, KP.v1, KP.z0, KP.z1, STEEL_L, 1.4);
  const KPm = frameU(o, KP.u, KP.v0, KP.z1), KPW = KP.v1 - KP.v0, KPH = KP.z1 - KP.z0;
  const kx = nk === 3 ? [12, 30, 48] : [30];
  let kp = `<rect x="4" y="4" width="${KPW - 8}" height="${KPH - 8}" rx="3" fill="#c3c8ce" stroke="#5a6068" stroke-width="1"/>` +
    txt(KPW / 2, 15, "钥匙", { size: 8.5, anchor: "middle", fill: "#3b3e44" });
  kx.forEach((x, i) => {
    const on = i < keyIn, red = on && i === atkKey;
    kp += `<circle cx="${x}" cy="27" r="4" fill="#3c3f45" stroke="#1c1e21" stroke-width="0.8"/>` +
      `<circle id="${p}-kl-${i}-g" cx="${x}" cy="27" r="4" fill="#2bd46f" opacity="${on && !red ? 1 : 0}"/><circle id="${p}-kl-${i}-r" cx="${x}" cy="27" r="4" fill="#ff4a3d" opacity="${red ? 1 : 0}"/>` +
      `<circle cx="${x}" cy="46" r="7" fill="#8b9199" stroke="#3b3e44" stroke-width="1.2"/><circle cx="${x}" cy="44.5" r="2.6" fill="#141518"/><path d="M${x} 45V51" stroke="#141518" stroke-width="2.2" stroke-linecap="round"/>`;
  });
  s += G_(matStr(KPm), kp);
  // keys: stick out of the keyholes along −u (shaft + bow ring in the u-z plane)
  const keyHoles = kx.map((x) => applyM(KPm, x, 46));
  kx.forEach((x, i) => {
    const kv = KP.v0 + x, kz = KP.z1 - 46, on = i < keyIn, red = on && i === atkKey;
    const keyArt = (c) => line3(o, [[KP.u, kv, kz], [KP.u - 18, kv, kz]], c.st, 5) + line3(o, [[KP.u, kv, kz], [KP.u - 18, kv, kz]], c.f, 2.8) +
      G_(faceV(o, KP.u - 26, kv, kz), `<circle cx="0" cy="0" r="8.5" fill="${c.f}" stroke="${c.st}" stroke-width="1.6"/><circle cx="0" cy="0" r="3.4" fill="#efebe3" stroke="${c.st}" stroke-width="1"/>`);
    s += `<g id="${p}-key-${i}" opacity="${on ? 1 : 0}" data-on="${on ? 1 : 0}" data-du="${f4(U[0])}" data-dv="${f4(U[1])}" transform="translate(${on ? 0 : f(-U[0] * 22)} ${on ? 0 : f(-U[1] * 22)})">` +
      `<g id="${p}-key-${i}-b" opacity="${red ? 0 : 1}">${keyArt(BRASS)}</g><g id="${p}-key-${i}-r" opacity="${red ? 1 : 0}">${keyArt(M.red)}</g></g>`;
  });

  // ---- crossbeam with the mint counter window
  s += box(o, -74, 74, -26, 26, ZC1, ZT, IRON, 1.8);
  const CBm = frameV(o, -74, 26, ZT);
  const cw0 = 26, cw1 = 112, csz = Math.min(15, (cw1 - cw0 - 10) / (Math.max(3, count.length) * (isAscii(count) ? 0.62 : 1)));
  s += G_(matStr(CBm), `<rect x="${cw0 - 3}" y="3" width="${cw1 - cw0 + 6}" height="22" rx="3" fill="#8b9199" stroke="#3b3e44" stroke-width="1.2"/>` +
    `<g id="${p}-count"><rect x="${cw0}" y="6" width="${cw1 - cw0}" height="16" rx="2" fill="#152126"/>` +
    `<rect id="${p}-count-red" x="${cw0}" y="6" width="${cw1 - cw0}" height="16" rx="2" fill="#3a1412" opacity="${atk ? 1 : 0}"/>` +
    txt((cw0 + cw1) / 2, 19, count, { id: `${p}-count-t`, size: f(csz), anchor: "middle", fill: atk ? "#ff6a5c" : "#7fe3a8", mono: isAscii(count) }) + `</g>` +
    `<circle cx="8" cy="14" r="2.4" fill="${lighten(IRON.s, 0.3)}"/><circle cx="140" cy="14" r="2.4" fill="${lighten(IRON.s, 0.3)}"/>`);

  // ---- limit post (+u end of the beam): graduated bar + red stop block; broken / limit:false → red dashed frame
  const LU0 = 58, LU1 = 68, LZ1 = 248, SB = { u0: 42, u1: 74, v0: -9, v1: 9, h: 12, up: 234, down: ZW + 3 };
  let lim = box(o, LU0, LU1, -6, 6, ZT, LZ1, { f: "#f6f3ec", s: "#e3ddd1", t: "#fdfcf9", st: "#5a5e65" }, 1.2);
  lim += G_(faceV(o, LU0, 6, LZ1), Array.from({ length: 8 }, (_, i) => `<path d="M0 ${4 + i * 5.6}H${i % 2 ? 4 : 7}" stroke="#3b3e44" stroke-width="1"/>`).join("") +
    `<rect x="0" y="0" width="10" height="5" fill="${RED}"/>`);
  lim += G_(faceU(o, LU0, -6, LZ1), txt(6, 16, "限", { size: 8, anchor: "middle", fill: "#3b3e44" }) + txt(6, 27, "额", { size: 8, anchor: "middle", fill: "#3b3e44" }));
  const stopBox = box(o, SB.u0, SB.u1, SB.v0, SB.v1, SB.up, SB.up + SB.h, M.red, 1.4) +
    G_(faceV(o, SB.u0, SB.v1, SB.up + SB.h), `<path d="M4 6H${SB.u1 - SB.u0 - 4}" stroke="#ffffff" stroke-width="1.6" stroke-dasharray="3 3"/>`);
  const dropY = (SB.up - SB.down) * CE;
  const limBar = `<g id="${p}-limit-bar" opacity="${limitOn ? 1 : 0}">${lim}</g>`;
  const stopG = `<g id="${p}-limit-o" opacity="${limitOn ? 1 : 0}"><g id="${p}-limit" data-dy="${f(dropY)}" data-on="${stop ? 1 : 0}" transform="translate(0 ${stop ? f(dropY) : 0})">${stopBox}</g></g>`;
  const limBad = G_(faceV(o, SB.u0, 0, LZ1 + 2), badFrame(`${p}-limit-bad`, -4, 0, SB.u1 - SB.u0 + 4, LZ1 - ZT + 2, !limitOn, brk || opts.limit !== false));

  // ---- flywheel (horizontal, turns in the top plane) + crank peg
  const WTm = frameTop(o, 0, 0, ZW);
  let wheelBase = cyl(o, 0, 0, 10, ZT, ZW, M.chrome, { seg: 20, sw: 1 });
  wheelBase += G_(faceTop(o, 0, 0, ZW - 5), `<circle cx="0" cy="0" r="${WR}" fill="none" stroke="${IRON_D.st}" stroke-width="10"/><circle cx="0" cy="0" r="${WR}" fill="none" stroke="${IRON_D.s}" stroke-width="7.5"/>`);
  let wh = `<circle cx="0" cy="0" r="${WR}" fill="none" stroke="${IRON.st}" stroke-width="10"/><circle cx="0" cy="0" r="${WR}" fill="none" stroke="${IRON.t}" stroke-width="7"/>`;
  for (let i = 0; i < 4; i++) { const a = i * 45; wh += `<path d="M${-WR + 3} 0H${WR - 3}" transform="rotate(${a})" stroke="${IRON.st}" stroke-width="6"/><path d="M${-WR + 3} 0H${WR - 3}" transform="rotate(${a})" stroke="${IRON.f}" stroke-width="3.6"/>`; }
  for (let i = 0; i < 8; i++) { const a = (i * 45 + 22.5) * Math.PI / 180; wh += `<circle cx="${f(WR * Math.cos(a))}" cy="${f(WR * Math.sin(a))}" r="2" fill="${IRON.st}"/>`; }
  wh += `<circle cx="0" cy="0" r="11" fill="${IRON.t}" stroke="${IRON.st}" stroke-width="1.6"/><circle cx="0" cy="0" r="4.5" fill="${M.chrome.f}" stroke="${IRON.st}" stroke-width="1"/>`;
  const PEG_R = 40, PEG_A = 90;   // peg stands on the rim's +v side at rest
  const pegLocal = [PEG_R * Math.cos(PEG_A * Math.PI / 180), PEG_R * Math.sin(PEG_A * Math.PI / 180)];
  const pegAt = applyM(WTm, pegLocal[0], pegLocal[1]), [wcx, wcy] = applyM(WTm, 0, 0);
  const peg = cyl(o, 0, 0, 4.5, ZW, ZW + 22, BRASS, { seg: 16, sw: 1 }) + cyl(o, 0, 0, 6, ZW + 22, ZW + 26, BRASS, { seg: 16, sw: 1 });
  const wheel = wheelBase + rotator(`${p}-wheel`, WTm, 0, 0, 0, wh) +
    `<g id="${p}-peg" data-m="${mArr(WTm)}" data-lx="${f(pegLocal[0])}" data-ly="${f(pegLocal[1])}" transform="translate(${f(pegAt[0] - wcx)} ${f(pegAt[1] - wcy)})">${peg}</g>`;

  // ---- breaker lamp (−u end of the beam)
  const LMu = -64;
  let lampSvg = cyl(o, LMu, 0, 7, ZT, ZT + 6, M.steel, { seg: 18, sw: 1 });
  const [lx, ly] = at(o, LMu, 0, ZT + 13);
  const dome = (fill, st) => `<path d="M${f(lx - 8)} ${f(ly + 5)}A8 9 0 0 1 ${f(lx + 8)} ${f(ly + 5)}Z" fill="${fill}" stroke="${st}" stroke-width="1.3"/><ellipse cx="${f(lx - 2.5)}" cy="${f(ly - 1)}" rx="2" ry="3" fill="#ffffff" opacity="0.55"/>`;
  lampSvg += `<g id="${p}-lamp">${dome("#5a5e65", "#2b2d31")}` +
    `<g id="${p}-lamp-green" opacity="${lamp0 === "green" ? 1 : 0}"><circle cx="${f(lx)}" cy="${f(ly + 1)}" r="15" fill="#2bd46f" opacity="0.28"/>${dome("#2bd46f", "#17804a")}</g>` +
    `<g id="${p}-lamp-red" opacity="${lamp0 === "red" ? 1 : 0}"><circle cx="${f(lx)}" cy="${f(ly + 1)}" r="15" fill="#ff4a3d" opacity="0.3"/>${dome("#ff4a3d", "#a8322a")}</g></g>`;

  s += limBar + wheel + lampSvg + stopG + limBad;

  // ---- chute: from the die's front down to the tray
  const ch = [[-10, 22, 48], [10, 22, 48], [10, 46, 31], [-10, 46, 31]];
  s += `<polygon points="${pts(ch.map((q) => at(o, ...q)))}" fill="${STEEL_L.t}" stroke="${STEEL_L.st}" stroke-width="1.2" stroke-linejoin="round"/>`;
  s += `<polygon points="${pts([[-10, 22, 48], [-10, 46, 31], [-10, 46, 37], [-10, 22, 54]].map((q) => at(o, ...q)))}" fill="${STEEL_L.f}" stroke="${STEEL_L.st}" stroke-width="1.2" stroke-linejoin="round"/>`;
  s += `<polygon points="${pts([[10, 22, 48], [10, 46, 31], [10, 46, 37], [10, 22, 54]].map((q) => at(o, ...q)))}" fill="${STEEL_L.s}" stroke="${STEEL_L.st}" stroke-width="1.2" stroke-linejoin="round" opacity="0.9"/>`;
  // ---- tray
  s += box(o, -38, 38, 44, 70, ZB, 31, M.steel, 1.4);
  s += G_(faceTop(o, -38, 44, 31.1), `<rect x="3" y="3" width="70" height="20" rx="2" fill="${darken(M.steel.t, 0.25)}"/>`);
  // coins: 6 stacks × 7 layers; visible count = round(pile·42)
  const stacks = [[-24, 52], [-4, 52], [16, 52], [-16, 62], [4, 62], [24, 62]];
  const order = stacks.map((q, i) => ({ q, i, d: q[1] * 0.41 - q[0] * 0.287 })).sort((a, b) => a.d - b.d);
  const NL = 7, NC = stacks.length * NL, vis0 = Math.round(pile0 * NC);
  const coinIdx = (si, l) => l * stacks.length + si;   // fill order: layer by layer
  let coins = "";
  for (const { q, i } of order) for (let l = 0; l < NL; l++) {
    const n = coinIdx(i, l);
    coins += `<g id="${p}-coin-${n}" opacity="${n < vis0 ? 1 : 0}">${cyl(o, q[0], q[1], 7.5, 31 + l * 3.6, 31 + l * 3.6 + 3, M.gold, { seg: 16, sw: 0.8 })}</g>`;
  }
  s += `<g id="${p}-coins" data-n="${NC}" data-pile="${f4(pile0)}">${coins}</g>`;
  // spill (coins over the tray rim, on the base top) + red coin dot spray in front of the chute (attacker)
  let spill = "";
  for (const [u, v, z] of [[-46, 58, ZB], [-52, 46, ZB], [44, 52, ZB], [-30, 74, 0], [6, 80, 0], [30, 76, 0]]) spill += cyl(o, u, v, 7.5, z, z + 3, M.gold, { seg: 16, sw: 0.8 });
  for (let i = 0; i < 16; i++) {
    const a = (i * 137.5) % 360, r = 18 + ((i * 29) % 46), u = r * Math.cos(a * Math.PI / 180) * 0.9, v = 96 + Math.abs(r * Math.sin(a * Math.PI / 180)) * 0.7;
    const [x, y] = at(o, u, v, 0);
    spill += `<circle cx="${f(x)}" cy="${f(y)}" r="5" fill="${RED}" stroke="#a8322a" stroke-width="1"/>`;
  }
  s += `<g id="${p}-spill" opacity="${atk ? 1 : 0}">${spill}</g>`;

  const anchors = {
    top: at(o, 0, 0, LZ1 + 6), center: at(o, 0, 0, 110), ground: at(o), front: applyM(CBm, 74, 14), plate: at(o, 0, 70, ZB / 2),
    count: applyM(CBm, (cw0 + cw1) / 2, 14), keyPanel: applyM(KPm, KPW / 2, KPH / 2), keys: keyHoles,
    wheel: at(o, 0, 0, ZW), ram: at(o, 0, 18, 110), die: at(o, 0, 22, 40), chute: at(o, 0, 46, 31), tray: at(o, 0, 57, 31),
    coins: at(o, 0, 57, 31 + Math.max(1, Math.round(pile0 * NL)) * 3.6), limit: at(o, (LU0 + LU1) / 2, 6, (ZT + LZ1) / 2),
    stop: at(o, (SB.u0 + SB.u1) / 2, SB.v1, (stop ? SB.down : SB.up) + SB.h / 2), lamp: [lx, ly],
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [], ghost: 1, badge: false, glowDefault: false, center: anchors.center, glowR: 120, k: K,
      attrs: `data-nl="${NL}"` }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

export const CATALOG_EXT = { snapshotCamera, mintPress };
/** runtime-ext.js contents — inline after iso.runtimeJs() (and other chapters' runtime-ext) */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
