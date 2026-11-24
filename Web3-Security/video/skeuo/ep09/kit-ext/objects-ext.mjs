// objects-ext.mjs — 第 09 集（MEV 与签名安全）补充拟物物件，与 kit/objects.mjs 同一投影、同一接口
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"（cheque 另有 "filled"）
//   opts.glow = true 时脚下绿色地光；opts.scale = 以地面原点等比缩放（anchors 已换算）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，KIT.grow 直接可用。
//   cheque / commitBox 的 broken 只标出"缺的那一格 / 空白名牌"（红虚线 + 红叉），不整体变虚；所以它们的 ID-wire 为空，不要用 KIT.broke，
//   改用 KITX09.field(…, "bad") / KITX09.nameBad。
// 动画助手在 runtime-ext.js（window.KITX09，并以不覆盖的方式合并进 window.KITX），用 runtimeExtJs() 内联在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  U, V, CE, f, f4, at, pts, M, C, lighten, darken,
  frameV, frameU, frameTop, matStr, applyM, faceV, faceU, faceTop,
  box, cyl, frustum, line3, circlePlan,
  glow, contactShadow, wireSvg, badgeSvg,
} from "../../kit/iso.mjs";

const DEG = Math.PI / 180;
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
  return `<g id="${p}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}" data-state="${st}" data-k="${f4(k)}" ${s.attrs ?? ""}>${sc0}${s.under ?? ""}${glowSvg}${s.shadow ?? ""}
  <g id="${p}-solid" opacity="${broken ? opts.ghost ?? s.ghost ?? 0.18 : 1}">${s.solid}</g>
  ${wireSvg(p + "-wire", o, s.wire, { opacity: broken && s.wire.length ? 1 : 0 })}
  ${badgeSvg(p + "-x", s.center, (s.badgeR ?? 30) / k, broken && s.badge !== false && opts.badge !== false ? 1 : 0)}${s.over ?? ""}${sc1}</g>`;
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
/** screen offset of a world displacement (du, dv, dz) */
const sv = (du, dv, dz = 0) => [du * U[0] + dv * V[0], du * U[1] + dv * V[1] - dz * CE];
/** plan angle whose direction points straight down the screen (the visible "front" of a cylinder) */
const TH_FRONT = Math.atan2(V[1], U[1]);
const ellipse = (o, du, dv, r, z, fill, stroke = "none", sw = 1.2, extra = "") =>
  `<polygon points="${pts(circlePlan(du, dv, r, 40).map((q) => at(o, q[0], q[1], z)))}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" ${extra}/>`;
const WOOD = M.wood;
const WOOD_D = { f: "#8a5a32", s: "#6f4524", t: "#a87443", st: "#4a2c14" };
const RED = "#e0453a", GREEN = "#1f9d55", TEAL = "#2aa3c9";

// =====================================================================================
// 支票 / 签名消息 cheque — 立在小木夹座上的横版支票：米白防伪纹纸、青蓝细边框、左上徽记、右上金额框、横排五个带标签的字段槽、右下墨色签名笔迹；
//   身后可叠 3 张半透明复印件（错位排开，可单独滑出）
// 约 180×20×112（立着，票面 180×100）。opts: amount（金额框文字，默认 "100"；链上版写 "领取"）, fields（五格初始状态数组，每项 "blank" | "filled" | "bad" | "warn"）,
//   labels（五格标签，默认 编号 nonce / 链 ID / 合约地址 / 截止时间 / 用途）, vals（filled 时格里的值）, missing=1（broken 时缺的那一格）,
//   copies（初始可见的复印件数 0–3，attacker 默认 3）, signed=true（签名笔迹一开始就画好）, title="支票"
// 状态：normal 五格空白灰虚线；filled 五格写入绿边；attacker 复印件红色描边（被重放）；broken 缺的那一格红虚线 + 红叉（整张不变虚）
// 可动：ID-f0…ID-f4（字段格；层 ID-fi-blank / -fill / -bad / -bad-x，KITX09.field / fields）, ID-sig（签名笔迹，KITX09.sign 描出）,
//   ID-copy-0..2（复印件，KITX09.copies 淡入并错位滑出、KITX09.copyTo 滑到任意世界画布点、KITX09.copyRed 变红）, ID-amt（金额文字，KITX09.amt 换字）
// anchors: top, center, ground, fields[]（五格中心）, amt, sig, emblem, copies[]（三张复印件错位后的中心）
// =====================================================================================
export function cheque(o, opts = {}) {
  const p = opts.id ?? "chq", K = opts.scale ?? 1, st = opts.state ?? "normal", atk = st === "attacker", brk = st === "broken";
  const W = 180, H = 100, zTop = 112, u0 = -90;
  const miss = opts.missing ?? 1;
  const F = opts.fields ?? Array.from({ length: 5 }, (_, i) => (st === "filled" ? "filled" : brk && i === miss ? "bad" : "blank"));
  const LABELS = opts.labels ?? ["编号 nonce", "链 ID", "合约地址", "截止时间", "用途"];
  const VALS = opts.vals ?? ["#7", "1", "0xC1…", "12:00", "领取"];
  const nCopies = Math.max(0, Math.min(3, opts.copies ?? (atk ? 3 : 0)));
  const mF = frameV(o, u0, 0, zTop);
  const FX = (i) => 8 + i * 33.5, FW = 30, FY0 = 55, FY1 = 77;
  // signature scribble (deterministic polyline) + its length
  const sig = [];
  for (let i = 0; i <= 70; i++) {
    const s = i / 70;
    sig.push([112 + 54 * s + 3.2 * Math.cos(s * Math.PI * 11), 88 - 4.2 * Math.sin(s * Math.PI * 5.5) * (1 - 0.35 * s) - 2.4 * Math.sin(s * Math.PI * 11) + 2 * s]);
  }
  let sigLen = 0;
  for (let i = 1; i < sig.length; i++) sigLen += Math.hypot(sig[i][0] - sig[i - 1][0], sig[i][1] - sig[i - 1][1]);
  sigLen = Math.ceil(sigLen + 2);
  const sigD = "M" + sig.map((q) => `${f(q[0])} ${f(q[1])}`).join("L") + `M164 92q4 -3 8 -1`;
  // ---- one face (full = the real cheque; otherwise a photocopy)
  const face = (full, red) => {
    const line = red ? RED : TEAL, sub = red ? "#c9776f" : "#6d685e";
    let s = `<rect x="0" y="0" width="${W}" height="${H}" rx="3" fill="${full ? "#fbf8ef" : red ? "#fdf1ef" : "#f7f6f2"}" stroke="${red ? RED : "#b8b0a1"}" stroke-width="${red ? 1.8 : 1}"/>`;
    // guilloche security waves
    for (let j = 0; j < 4; j++) {
      const P = [];
      for (let x = 8; x <= W - 8; x += 4) P.push([x, 30 + j * 5 + 2.4 * Math.sin(x / 7 + j * 1.3)]);
      s += `<polyline points="${pts(P)}" fill="none" stroke="${red ? "#f3c9c4" : "#d6ecf3"}" stroke-width="0.8"/>`;
    }
    s += `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="2" fill="none" stroke="${line}" stroke-width="1.3"/><rect x="5.5" y="5.5" width="${W - 11}" height="${H - 11}" rx="1.5" fill="none" stroke="${line}" stroke-width="0.5" opacity="0.7"/>`;
    // emblem + title
    s += `<circle cx="16" cy="16" r="8" fill="${red ? "#fde6e3" : "#e7f5fa"}" stroke="${line}" stroke-width="1.4"/><path d="M16 10.5L20.5 16L16 21.5L11.5 16Z" fill="${line}"/><circle cx="16" cy="16" r="1.6" fill="#ffffff"/>`;
    s += txt(28, 15.5, opts.title ?? "支票", { size: 9, fill: red ? RED : C.ink }) + txt(28, 22.5, "No. 0007", { size: 4.8, mono: true, fill: sub, weight: 700 });
    // amount box
    s += `<rect x="104" y="8" width="68" height="22" rx="2" fill="#ffffff" stroke="${red ? RED : "#9a958b"}" stroke-width="1"/>` + txt(107, 14, "金额", { size: 4.5, fill: sub, weight: 700 });
    s += txt(140, 26, opts.amount ?? "100", { id: full ? `${p}-amt` : undefined, size: 14, anchor: "middle", fill: red ? RED : C.ink, weight: 900 });
    // payee line
    s += txt(8, 41.5, "付给", { size: 5, fill: sub, weight: 700 }) + `<path d="M21 42H98" stroke="#cfc8ba" stroke-width="0.8"/>`;
    // field slots
    for (let i = 0; i < 5; i++) {
      const x = FX(i);
      s += txt(x + FW / 2, 52, LABELS[i], { size: 4.6, anchor: "middle", fill: sub, weight: 700 });
      if (!full) { s += `<rect x="${x}" y="${FY0}" width="${FW}" height="${FY1 - FY0}" rx="1.5" fill="#ffffff" stroke="${red ? RED : "#a8a196"}" stroke-width="${red ? 1.2 : 0.9}" stroke-dasharray="2.5 2"/>`; continue; }
      const sti = F[i] ?? "blank", cx = x + FW / 2, cy = (FY0 + FY1) / 2;
      const blank = `<rect x="${x}" y="${FY0}" width="${FW}" height="${FY1 - FY0}" rx="1.5" fill="#ffffff" stroke="#a8a196" stroke-width="1" stroke-dasharray="2.5 2"/>`;
      const fill = `<rect x="${x}" y="${FY0}" width="${FW}" height="${FY1 - FY0}" rx="1.5" fill="#eaf7ef" stroke="${GREEN}" stroke-width="1.8"/>` +
        txt(cx, cy + 2.6, VALS[i], { size: 7, anchor: "middle", mono: /^[#0-9x:.…a-fA-F ]+$/.test(VALS[i]), fill: C.ink, weight: 800 });
      const bad = `<rect x="${x - 1}" y="${FY0 - 1}" width="${FW + 2}" height="${FY1 - FY0 + 2}" rx="1.5" fill="rgba(224,69,58,0.08)" stroke="${RED}" stroke-width="1.8" stroke-dasharray="3.5 2.2"/>` +
        `<g id="${p}-f${i}-bad-x" opacity="${sti === "warn" ? 0 : 1}"><circle cx="${cx}" cy="${cy}" r="6.5" fill="${RED}" stroke="#ffffff" stroke-width="1.2"/><path d="M${cx - 2.6} ${cy - 2.6}L${cx + 2.6} ${cy + 2.6}M${cx + 2.6} ${cy - 2.6}L${cx - 2.6} ${cy + 2.6}" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/></g>`;
      s += `<g id="${p}-f${i}" data-st="${sti}"><g id="${p}-f${i}-blank" opacity="${sti === "blank" ? 1 : 0}">${blank}</g><g id="${p}-f${i}-fill" opacity="${sti === "filled" ? 1 : 0}">${fill}</g>` +
        `<g id="${p}-f${i}-bad" opacity="${sti === "bad" || sti === "warn" ? 1 : 0}">${bad}</g></g>`;
    }
    // signature
    s += `<path d="M108 94.5H172" stroke="#9a958b" stroke-width="0.8"/>` + txt(108, 99.5, "签名", { size: 4.4, fill: sub, weight: 700 });
    if (full) {
      const signed = opts.signed !== false;
      s += `<path id="${p}-sig" data-len="${sigLen}" d="${sigD}" fill="none" stroke="#1c2b4a" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${sigLen}" stroke-dashoffset="${signed ? 0 : sigLen}"/>`;
    } else {
      s += `<path d="${sigD}" fill="none" stroke="${red ? "#c9776f" : "#5a6478"}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += txt(W / 2, 46, "复印件", { size: 15, anchor: "middle", fill: red ? RED : "#8a8478", weight: 900, extra: `opacity="0.28" transform="rotate(-10 ${W / 2} 40)"` });
    }
    return s;
  };
  const C0 = applyM(mF, W / 2, H / 2);
  let s = "";
  // ---- photocopies behind (drawn first); each rests at an up-right offset, slides out from behind the cheque
  const rest = (k) => sv((k + 1) * 20, -(k + 1) * 8, (k + 1) * 12);
  for (let k = 2; k >= 0; k--) {
    const [rx, ry] = rest(k), vis = k < nCopies;
    s += `<g id="${p}-copy-${k}" data-rx="${f(rx)}" data-ry="${f(ry)}" data-cx="${f(C0[0])}" data-cy="${f(C0[1])}" data-op="0.72" opacity="${vis ? 0.72 : 0}" transform="translate(${vis ? f(rx) : 0} ${vis ? f(ry) : 0})">` +
      `<g id="${p}-copy-${k}-n" opacity="${atk ? 0 : 1}">${G_(matStr(mF), face(false, false))}</g><g id="${p}-copy-${k}-r" opacity="${atk ? 1 : 0}">${G_(matStr(mF), face(false, true))}</g></g>`;
  }
  // ---- wooden clip stand (base + back jaw)
  s += contactShadow(o, 110, 34);
  s += box(o, -64, 64, -13, 13, 0, 12, WOOD, 1.4);
  s += G_(faceTop(o, 0, 0, 12.1), `<path d="M-60 -4H60M-60 4H60" stroke="${darken(WOOD.t, 0.18)}" stroke-width="1"/>`);
  s += G_(faceV(o, -64, 13, 12), `<path d="M6 6H122" stroke="${darken(WOOD.s, 0.2)}" stroke-width="1"/>`);
  s += box(o, -16, 16, -9, -1, 12, 28, WOOD_D, 1.2);
  // ---- paper thickness + face
  for (let i = 2; i >= 1; i--) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(mF), `<rect x="0" y="0" width="${W}" height="${H}" rx="3" fill="${i === 2 ? "#cfc7b6" : "#e2dbcc"}"/>`)}</g>`;
  s += G_(matStr(mF), face(true, false));
  // ---- front jaw + brass screw
  s += box(o, -16, 16, 1, 9, 12, 28, WOOD_D, 1.2);
  s += G_(faceV(o, -16, 9, 28), `<circle cx="16" cy="8" r="3" fill="#d4d7db" stroke="#5a5e65" stroke-width="1"/><path d="M14 8H18" stroke="#5a5e65" stroke-width="0.9"/>`);
  const anchors = {
    top: at(o, 0, 0, zTop + 26), center: C0, ground: at(o),
    fields: Array.from({ length: 5 }, (_, i) => applyM(mF, FX(i) + FW / 2, (FY0 + FY1) / 2)),
    amt: applyM(mF, 140, 20), sig: applyM(mF, 140, 88), emblem: applyM(mF, 16, 16),
    copies: [0, 1, 2].map((k) => { const [rx, ry] = rest(k); return [C0[0] + rx, C0[1] + ry]; }),
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [], ghost: 1, badge: false, center: C0, glowR: 120, k: K, attrs: `data-n="${nCopies}"` }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

// =====================================================================================
// 出块轮值台 rotaWheel — 低矮圆形木质转台（会议转盘）：深色木底座 + 木鼓身 + 浅色台面，台面边缘一圈小座位，每座一个墨色圆头小人偶；
//   中心镀铬立柱顶上一根青蓝指针臂，指向"当前出块者"，被指的人偶头顶亮一盏小灯、脚下青蓝光圈；鼓身正面一块铭牌（座位数）
// 约 220×220×120。opts: n=12（座位数；TRON 用 27，BNB Chain 用少量示意）, at=0（当前出块者座号，0 在最前方，按屏幕顺时针编号）,
//   speed=1（spin 默认转速，圈/秒）, plate（铭牌文字，默认 "n 座"）, red=[]（一开始就变红的座号）, lamp=true（灯一开始就亮）
// 状态：normal 墨色人偶、青蓝指针；attacker 不整体用，单个座位用 KITX09.seat(…, "red") 变红（"出块者仍能决定顺序"）
// 可动：ID-arm（指针臂，rotator；厚度层 ID-arm-b 跟着转）→ KITX09.point / spin / tick；ID-seat-0..n-1（座位人偶，层 -ink / -red / -hl 光圈）→ KITX09.seat / seats；
//   ID-lamp（当前出块者头灯，跟着指针跳座）→ KITX09.lamp；ID-plate（铭牌，文字 ID-plate-t）→ KITX09.plate
// anchors: top, center, ground, hub（柱顶）, plate, lamp（当前座的灯位）, seats[]（每座人偶头顶）, arm（当前指针尖）
// =====================================================================================
export function rotaWheel(o, opts = {}) {
  const p = opts.id ?? "rota", K = opts.scale ?? 1, n = Math.max(3, Math.round(opts.n ?? 12));
  const cur = (((opts.at ?? 0) % n) + n) % n, red = new Set(opts.red ?? []), lampOn = opts.lamp !== false;
  const R0 = 112, RD = 104, RT = 108, zP = 10, zD = 38, zT = 46, RS = 86, zArm = 106;
  const WOOD_T = { f: "#c99566", s: "#a8743f", t: "#e0b88a", st: "#6a4220" };
  const th = (k) => TH_FRONT + (k * 2 * Math.PI) / n;
  const seatUV = (k) => [RS * Math.cos(th(k)), RS * Math.sin(th(k))];
  let s = contactShadow(o, 150, 120);
  // ---- turntable
  s += cyl(o, 0, 0, R0, 0, zP, WOOD_D, { seg: 48, sw: 1.4 });
  s += cyl(o, 0, 0, RD, zP, zD, WOOD, { seg: 48, sw: 1.4 });
  for (let a = -78; a <= 78; a += 12) {
    const q = TH_FRONT + a * DEG;
    s += line3(o, [[RD * Math.cos(q), RD * Math.sin(q), zP + 2], [RD * Math.cos(q), RD * Math.sin(q), zD - 2]], darken(WOOD.s, 0.14), 1);
  }
  s += cyl(o, 0, 0, RT, zD, zT, WOOD_T, { seg: 48, sw: 1.4 });
  s += ellipse(o, 0, 0, RT - 5, zT + 0.2, "none", darken(WOOD_T.t, 0.12), 1.2) + ellipse(o, 0, 0, 62, zT + 0.2, lighten(WOOD_T.t, 0.12), darken(WOOD_T.t, 0.15), 1.2) +
    ellipse(o, 0, 0, 56, zT + 0.3, "none", darken(WOOD_T.t, 0.1), 0.8);
  // ---- name plate on the drum front (tangent to the drum)
  const tq = [Math.sin(TH_FRONT), -Math.cos(TH_FRONT)];
  const tx = tq[0] * U[0] + tq[1] * V[0], ty = tq[0] * U[1] + tq[1] * V[1];
  const PW = 52, PH = 18, rP = RD + 2.5;
  const pc = at(o, rP * Math.cos(TH_FRONT) - (PW / 2) * tq[0], rP * Math.sin(TH_FRONT) - (PW / 2) * tq[1], zD - 5);
  const mP = [tx, ty, 0, CE, pc[0], pc[1]];
  s += `<g id="${p}-plate">${G_(matStr(mP), `<rect x="0" y="0" width="${PW}" height="${PH}" rx="2" fill="#f6f3ec" stroke="#5a3518" stroke-width="1.2"/><rect x="2" y="2" width="${PW - 4}" height="${PH - 4}" rx="1.4" fill="none" stroke="${TEAL}" stroke-width="1"/>` +
    `<circle cx="4.5" cy="${PH / 2}" r="1.3" fill="#8b9199"/><circle cx="${PW - 4.5}" cy="${PH / 2}" r="1.3" fill="#8b9199"/>` +
    txt(PW / 2, PH / 2 + 3.6, opts.plate ?? `${n} 座`, { id: `${p}-plate-t`, size: 10, anchor: "middle", weight: 900 }))}</g>`;
  // ---- seats
  const INK = { f: "#3b3e44", s: "#2b2d31", t: "#55595f", st: "#141518" };
  s += `<defs><radialGradient id="${p}-hgi" cx="0.36" cy="0.32" r="0.75"><stop offset="0" stop-color="#6a6e75"/><stop offset="0.55" stop-color="#3b3e44"/><stop offset="1" stop-color="#25272b"/></radialGradient>` +
    `<radialGradient id="${p}-hgr" cx="0.36" cy="0.32" r="0.75"><stop offset="0" stop-color="#f08a80"/><stop offset="0.55" stop-color="#e8574c"/><stop offset="1" stop-color="#c23a30"/></radialGradient>` +
    `<radialGradient id="${p}-lg"><stop offset="0" stop-color="#fff6d6" stop-opacity="1"/><stop offset="0.45" stop-color="#ffe69a" stop-opacity="0.55"/><stop offset="1" stop-color="#ffe69a" stop-opacity="0"/></radialGradient></defs>`;
  // screen-space vertical solid of revolution (radius r0 at z0 → r1 at z1): body + lit top ellipse (cheap enough for 27 seats)
  const solid = (du, dv, r0, r1, z0, z1, m, sw = 1) => {
    const b = at(o, du, dv, z0), q = at(o, du, dv, z1);
    return `<path d="M${f(b[0] - r0)} ${f(b[1])}L${f(q[0] - r1)} ${f(q[1])}L${f(q[0] + r1)} ${f(q[1])}L${f(b[0] + r0)} ${f(b[1])}A${r0} ${f(r0 / 2)} 0 0 1 ${f(b[0] - r0)} ${f(b[1])}Z" fill="${m.s}" stroke="${m.st}" stroke-width="${sw}" stroke-linejoin="round"/>` +
      `<path d="M${f(b[0] - r0 * 0.55)} ${f(b[1] + r0 * 0.42)}L${f(q[0] - r1 * 0.55)} ${f(q[1] + r1 * 0.42)}" stroke="${m.f}" stroke-width="${f(r0 * 0.7)}" stroke-linecap="round" opacity="0.8"/>` +
      `<ellipse cx="${f(q[0])}" cy="${f(q[1])}" rx="${r1}" ry="${f(r1 / 2)}" fill="${m.t}" stroke="${m.st}" stroke-width="${sw}"/>`;
  };
  const fig = (du, dv, m, grad) => {
    const hc = at(o, du, dv, zT + 28);
    return solid(du, dv, 6.6, 4.4, zT + 5, zT + 22, m) +
      `<circle cx="${f(hc[0])}" cy="${f(hc[1])}" r="6.2" fill="url(#${grad})" stroke="${m.st}" stroke-width="1.1"/>`;
  };
  const seat = (k) => {
    const [du, dv] = seatUV(k);
    let g = `<g id="${p}-seat-${k}-hl" opacity="${k === cur && lampOn ? 1 : 0}">${ellipse(o, du, dv, 12.5, zT + 0.5, "rgba(42,163,201,0.28)", TEAL, 2)}</g>`;
    g += solid(du, dv, 7.5, 7.5, zT, zT + 5, M.steel);
    g += `<g id="${p}-seat-${k}-ink">${fig(du, dv, INK, `${p}-hgi`)}</g><g id="${p}-seat-${k}-red" opacity="${red.has(k) ? 1 : 0}">${fig(du, dv, M.red, `${p}-hgr`)}</g>`;
    return `<g id="${p}-seat-${k}">${g}</g>`;
  };
  const yC = at(o)[1];
  const order = Array.from({ length: n }, (_, k) => k).sort((a, b) => at(o, ...seatUV(a))[1] - at(o, ...seatUV(b))[1]);
  const back = order.filter((k) => at(o, ...seatUV(k))[1] < yC), front = order.filter((k) => at(o, ...seatUV(k))[1] >= yC);
  s += back.map(seat).join("");
  // ---- centre column
  s += cyl(o, 0, 0, 16, zT, zT + 6, M.steel, { seg: 28, sw: 1.2 });
  s += cyl(o, 0, 0, 7, zT + 6, zArm - 3, M.chrome, { seg: 24, sw: 1.2 });
  s += front.map(seat).join("");
  // ---- pointer arm (top-plane rotator) + thickness layer
  const a0 = th(0) / DEG, aCur = th(cur) / DEG;
  const armShape = (fill, stroke) => `<path d="M-9 -5H${RS - 5}A5 5 0 0 1 ${RS - 5} 5H-9A5 5 0 0 1 -9 -5Z" fill="${fill}" stroke="${stroke}" stroke-width="1.3" stroke-linejoin="round"/>`;
  s += rotator(`${p}-arm-b`, frameTop(o, 0, 0, zArm - 4), 0, 0, aCur, armShape("#1d6d88", "#14506a"));
  s += rotator(`${p}-arm`, frameTop(o, 0, 0, zArm), 0, 0, aCur, armShape("#5cc0e0", "#1d6d88") + `<path d="M4 -1.6H${RS - 12}" stroke="#d9f1f8" stroke-width="1.4" stroke-linecap="round"/>` +
    `<circle cx="${RS - 4}" cy="0" r="4" fill="#1d93ba" stroke="#ffffff" stroke-width="1"/>`);
  s += cyl(o, 0, 0, 9, zArm, zArm + 5, M.chrome, { seg: 24, sw: 1.2 }) + G_(faceTop(o, 0, 0, zArm + 5.1), `<circle r="3" fill="#8b9199" stroke="#3b3e44" stroke-width="0.8"/>`);
  // ---- lamp over the current seat (runtime moves it)
  const lampPts = Array.from({ length: n }, (_, k) => at(o, ...seatUV(k), zT + 44));
  const L0 = lampPts[cur], cordH = (zArm - 4 - (zT + 44)) * CE;
  s += `<g id="${p}-lamp" opacity="${lampOn ? 1 : 0}" transform="translate(${f(L0[0])} ${f(L0[1])})"><path d="M0 ${f(-cordH)}V-4" stroke="#3b3e44" stroke-width="1.2"/>` +
    `<circle r="13" fill="url(#${p}-lg)"/><circle r="3.6" fill="#fff3c8" stroke="#a88a3a" stroke-width="0.9"/></g>`;
  s += `<g id="${p}-rdata" data-n="${n}" data-a0="${f4(a0)}" data-at="${cur}" data-speed="${opts.speed ?? 1}" data-lamps="${lampPts.map((q) => `${f(q[0])},${f(q[1])}`).join(";")}"></g>`;
  const anchors = {
    top: at(o, 0, 0, 150), center: at(o, 0, 0, 60), ground: at(o), hub: at(o, 0, 0, zArm + 5), plate: applyM(mP, PW / 2, PH / 2), lamp: L0,
    seats: Array.from({ length: n }, (_, k) => at(o, ...seatUV(k), zT + 35)), arm: at(o, ...seatUV(cur), zArm),
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [{ cyl: [0, 0, R0, 0, zT] }, { cyl: [0, 0, 9, zT, zArm + 5] }], center: anchors.center, badgeR: 34, glowR: 170, k: K }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

// =====================================================================================
// 提交揭示投标箱 commitBox — 深色木质投标箱：顶上一道窄投信口；正面整块前门（下沿铰链，可翻下），门上磨砂玻璃窗（只看到信封轮廓）和黄铜名牌插槽（写发送者）；
//   −u 侧一把挂锁。投进去的信封口上一枚青蓝火漆封印（印"哈希"）；第二阶段挂锁打开、前门翻下，露出展开的信"答案"
// 约 140×110×150。opts: name="发送者"（名牌；"" = 空白，attacker / broken 默认空白）, env=false（箱里一开始就有信封）, answer="答案"（展开信上的字）,
//   seal="哈希"（火漆字）, open=0（前门初始角度°，0 关、90 平放）, unlocked=false（挂锁一开始就开着）
// 状态：normal 青蓝名牌、绿色地光；attacker 名牌空白 + 窗里透出红信封（红信被收下）；broken 名牌空白处红虚线框（整只箱子不变虚）
// 可动：ID-slot（投信口亮，KITX09.slot）, ID-env（信封从口上落入；内层 ID-env-m 平移，KITX09.drop）, ID-env-in（窗里信封轮廓）, ID-env-c（箱内信封）,
//   ID-name（名牌；ID-name-on / -off 两层、文字 ID-name-t，KITX09.nameTag）, ID-name-bad（红虚线框，KITX09.nameBad）,
//   ID-lock（挂锁；锁梁 ID-lock-sh，KITX09.lock）, ID-door（前门，按铰链翻下，KITX09.flap）, ID-ans（展开的信，KITX09.reveal）,
//   ID-copy（机器人复制的红信封；内层 ID-copy-m，KITX09.copyIn 收下 / 弹回）, ID-copy-in（窗里红信封轮廓）
// anchors: top, center, ground, slot, drop（信封起落点上方）, window, name, lock, door（门中心）, answer（箱内信中心）
// =====================================================================================
export function commitBox(o, opts = {}) {
  const p = opts.id ?? "cbox", K = opts.scale ?? 1, st = opts.state ?? "normal", atk = st === "attacker", brk = st === "broken";
  const u0 = -70, u1 = 70, v0 = -55, v1 = 55, zF = 6, zB = 140, zL = 150;
  const DW = { f: "#5e3c22", s: "#4a2e18", t: "#7a5232", st: "#22140a" };
  const DWL = { f: "#6c4628", s: "#55361d", t: "#8a603a", st: "#22140a" };
  const name = opts.name ?? (atk || brk ? "" : "发送者");
  const hasEnv = !!opts.env || atk;
  let s = contactShadow(o, 112, 92);
  // ---- feet + body
  for (const [u, v] of [[u1 - 10, v0 + 10], [u0 + 10, v0 + 10], [u1 - 10, v1 - 10], [u0 + 10, v1 - 10]]) s += box(o, u - 6, u + 6, v - 6, v + 6, 0, zF, M.ink, 1);
  s += box(o, u0, u1, v0, v1, zF, zB, DW, 1.6);
  // −u face: frame-and-panel + grain
  s += G_(faceU(o, u0, v0, zB), `<rect x="8" y="8" width="${v1 - v0 - 16}" height="${zB - zF - 16}" rx="2" fill="none" stroke="${lighten(DW.f, 0.14)}" stroke-width="1.6"/>` +
    `<rect x="10.5" y="10.5" width="${v1 - v0 - 21}" height="${zB - zF - 21}" rx="1.5" fill="none" stroke="${darken(DW.f, 0.3)}" stroke-width="1"/>` +
    [24, 46, 70, 96].map((y) => `<path d="M14 ${y}Q40 ${y - 4} ${v1 - v0 - 14} ${y + 2}" fill="none" stroke="${darken(DW.f, 0.18)}" stroke-width="0.8"/>`).join(""));
  // ---- lid + slot
  s += box(o, u0 - 4, u1 + 4, v0 - 4, v1 + 4, zB, zL, DWL, 1.4);
  s += G_(faceTop(o, 0, 0, zL + 0.1), `<rect x="-${u1 - 6}" y="-${v1 - 6}" width="${2 * (u1 - 6)}" height="${2 * (v1 - 6)}" rx="3" fill="none" stroke="${lighten(DWL.t, 0.12)}" stroke-width="1.2"/>` +
    `<rect x="-46" y="-8" width="92" height="16" rx="5" fill="#c3c8ce" stroke="#5a5e65" stroke-width="1.2"/><rect x="-40" y="-3.5" width="80" height="7" rx="3" fill="#120a04"/>` +
    `<g id="${p}-slot" opacity="0"><rect x="-50" y="-11" width="100" height="22" rx="7" fill="rgba(42,163,201,0.18)" stroke="${TEAL}" stroke-width="3.5"/></g>`);
  // ---- envelope falling into the slot (clipped above the slot line)
  const sA = at(o, -40, 0, zL), sB = at(o, 40, 0, zL);
  const clip = (id) => `<defs><clipPath id="${id}"><polygon points="${pts([sA, sB, [sB[0], sB[1] - 400], [sA[0], sA[1] - 400]])}"/></clipPath></defs>`;
  const EW = 52, EH = 36, zE = zL + 46;
  const envFace = (red) => `<rect x="0" y="0" width="${EW}" height="${EH}" rx="3" fill="${red ? "#fde6e3" : "#ffffff"}" stroke="${red ? RED : "#6b665c"}" stroke-width="2"/>` +
    `<path d="M3 3L${EW / 2} ${EH * 0.56}L${EW - 3} 3" fill="none" stroke="${red ? RED : "#6b665c"}" stroke-width="2" stroke-linejoin="round"/>` +
    (red ? txt(EW / 2, EH - 5, "复制", { size: 8, anchor: "middle", fill: RED }) :
      `<circle cx="${EW / 2}" cy="${EH * 0.56}" r="9" fill="#1d6d88" stroke="#14506a" stroke-width="1.2"/><circle cx="${EW / 2}" cy="${EH * 0.56}" r="6.5" fill="none" stroke="#5cc0e0" stroke-width="0.8"/>` +
      txt(EW / 2, EH * 0.56 + 2.6, opts.seal ?? "哈希", { size: 6.5, anchor: "middle", fill: "#ffffff" }));
  const dy = (EH + 50) * CE;
  const env = (id, red) => `${clip(id + "-cp")}<g id="${id}" clip-path="url(#${id}-cp)"><g id="${id}-m" opacity="0" data-dx="0" data-dy="${f(dy)}">` +
    `${G_(faceV(o, -EW / 2, 0, zE + EH), envFace(red))}</g></g>`;
  // ---- interior (seen through the front opening once the door is down)
  const DU0 = u0 + 6, DU1 = u1 - 6, DZ0 = zF + 4, DZ1 = zB - 6, DH = DZ1 - DZ0, DWd = DU1 - DU0;
  const opening = [at(o, DU0, v1, DZ0), at(o, DU1, v1, DZ0), at(o, DU1, v1, DZ1), at(o, DU0, v1, DZ1)];
  let cav = `<polygon points="${pts(opening)}" fill="#1e1209"/>`;
  cav += `<polygon points="${pts([at(o, DU0, v0 + 8, DZ0), at(o, DU1, v0 + 8, DZ0), at(o, DU1, v0 + 8, DZ1), at(o, DU0, v0 + 8, DZ1)])}" fill="#3a2414"/>`;
  cav += `<polygon points="${pts([at(o, DU1, v0 + 8, DZ0), at(o, DU1, v1, DZ0), at(o, DU1, v1, DZ1), at(o, DU1, v0 + 8, DZ1)])}" fill="#2b190d"/>`;
  cav += `<polygon points="${pts([at(o, DU0, v0 + 8, DZ0), at(o, DU1, v0 + 8, DZ0), at(o, DU1, v1, DZ0), at(o, DU0, v1, DZ0)])}" fill="#4d311b"/>`;
  cav += `<g id="${p}-env-c" opacity="${hasEnv ? 1 : 0}">${G_(faceV(o, -EW / 2, 4, DZ0 + EH + 2), envFace(atk))}</g>`;
  const AW = 66, AH = 82;
  cav += `<g id="${p}-ans" opacity="0">${G_(faceV(o, -AW / 2, 10, DZ0 + AH + 6), `<path d="M0 ${AH - 26}L${AW / 2} ${AH - 8}L${AW} ${AH - 26}V${AH}H0Z" fill="#e9e4d8" stroke="#6b665c" stroke-width="1.4" stroke-linejoin="round"/>` +
    `<rect x="5" y="0" width="${AW - 10}" height="${AH - 14}" rx="2" fill="#fffefb" stroke="#9a958b" stroke-width="1.2"/>` +
    txt(AW / 2, 30, opts.answer ?? "答案", { id: `${p}-ans-t`, size: 15, anchor: "middle" }) +
    `<path d="M14 42H${AW - 14}M14 50H${AW - 20}" stroke="#cfc8ba" stroke-width="1.6" stroke-linecap="round"/>` +
    `<path d="M0 ${AH}L${AW / 2} ${AH - 16}L${AW} ${AH}" fill="none" stroke="#6b665c" stroke-width="1.4"/>`)}</g>`;
  s += `<defs><clipPath id="${p}-cav-cp"><polygon points="${pts(opening)}"/></clipPath></defs><g clip-path="url(#${p}-cav-cp)">${cav}</g>`;
  // ---- front door (hinged at its bottom edge; runtime rebuilds the matrix from the angle)
  const hinge = at(o, DU0, v1, DZ0), phi0 = opts.open ?? 0;
  const doorM = (phi) => {
    const sn = Math.sin(phi * DEG), cs = Math.cos(phi * DEG), D0 = sn * V[0], D1 = sn * V[1] - cs * CE;
    return [U[0], U[1], -D0, -D1, hinge[0] + DH * D0, hinge[1] + DH * D1];
  };
  const WX0 = 24, WX1 = DWd - 24, WY0 = 12, WY1 = 66, NX0 = 34, NX1 = DWd - 34, NY0 = 82, NY1 = 102;
  let dr = `<rect x="0" y="0" width="${DWd}" height="${DH}" rx="3" fill="${DW.s}" stroke="${DW.st}" stroke-width="1.4"/>`;
  dr += `<rect x="5" y="5" width="${DWd - 10}" height="${DH - 10}" rx="2" fill="none" stroke="${lighten(DW.s, 0.14)}" stroke-width="1.4"/><rect x="7.5" y="7.5" width="${DWd - 15}" height="${DH - 15}" rx="1.5" fill="none" stroke="${darken(DW.s, 0.3)}" stroke-width="0.9"/>`;
  for (const y of [74, 108, 116]) dr += `<path d="M10 ${y}Q${DWd / 2} ${y - 3} ${DWd - 10} ${y + 1}" fill="none" stroke="${darken(DW.s, 0.18)}" stroke-width="0.8"/>`;
  // frosted window: chrome bezel + frosted pane + blurred silhouettes
  dr += `<rect x="${WX0 - 4}" y="${WY0 - 4}" width="${WX1 - WX0 + 8}" height="${WY1 - WY0 + 8}" rx="4" fill="#c3c8ce" stroke="#5a5e65" stroke-width="1.2"/>`;
  dr += `<rect x="${WX0}" y="${WY0}" width="${WX1 - WX0}" height="${WY1 - WY0}" rx="2" fill="#2a1a0e"/>`;
  const sil = (id, red, vis, dx) => {
    const cx = (WX0 + WX1) / 2 + dx, cy = (WY0 + WY1) / 2 + 4, col = red ? "224,69,58" : "60,52,44";
    return `<g id="${id}" opacity="${vis ? 1 : 0}">` + [[30, 20, 0.16], [26, 17, 0.22], [22, 14, 0.3]].map(([w, h, a]) => `<rect x="${cx - w}" y="${cy - h}" width="${2 * w}" height="${2 * h}" rx="${h * 0.5}" fill="rgba(${col},${a})"/>`).join("") +
      (red ? "" : `<circle cx="${cx}" cy="${cy + 2}" r="7" fill="rgba(29,109,136,0.45)"/>`) + `</g>`;
  };
  dr += `<rect x="${WX0}" y="${WY0}" width="${WX1 - WX0}" height="${WY1 - WY0}" rx="2" fill="rgba(236,242,244,0.72)"/>`;
  dr += sil(`${p}-env-in`, false, hasEnv && !atk, -4) + sil(`${p}-copy-in`, true, atk, 6);
  dr += `<rect x="${WX0}" y="${WY0}" width="${WX1 - WX0}" height="${WY1 - WY0}" rx="2" fill="rgba(246,250,251,0.38)"/>`;
  for (let i = 0; i < 9; i++) dr += `<path d="M${WX0 + 4 + i * 9} ${WY1 - 2}L${WX0 + 14 + i * 9} ${WY0 + 2}" stroke="#ffffff" stroke-width="${i % 3 ? 0.6 : 1.4}" opacity="${i % 3 ? 0.35 : 0.55}"/>`;
  dr += `<path d="M${WX0 + 3} ${WY0 + 3}H${WX1 - 3}" stroke="#ffffff" stroke-width="1" opacity="0.6"/>`;
  // latch tab at the top
  dr += `<rect x="${DWd / 2 - 10}" y="-2" width="20" height="9" rx="2" fill="#c3c8ce" stroke="#5a5e65" stroke-width="1"/><circle cx="${DWd / 2}" cy="2.5" r="1.6" fill="#5a5e65"/>`;
  // brass name holder + card
  dr += `<rect x="${NX0 - 4}" y="${NY0 - 4}" width="${NX1 - NX0 + 8}" height="${NY1 - NY0 + 8}" rx="2.5" fill="#b8975a" stroke="#6e5420" stroke-width="1.2"/>` +
    `<path d="M${NX0 - 2} ${NY0 - 1.5}H${NX1 + 2}" stroke="#e6cf96" stroke-width="1"/><circle cx="${NX0 - 1}" cy="${(NY0 + NY1) / 2}" r="1.3" fill="#6e5420"/><circle cx="${NX1 + 1}" cy="${(NY0 + NY1) / 2}" r="1.3" fill="#6e5420"/>`;
  dr += `<g id="${p}-name" data-on="${name ? 1 : 0}"><g id="${p}-name-off" opacity="${name ? 0 : 1}"><rect x="${NX0}" y="${NY0}" width="${NX1 - NX0}" height="${NY1 - NY0}" rx="1.5" fill="#f6f3ec" stroke="#9a958b" stroke-width="0.8"/></g>` +
    `<g id="${p}-name-on" opacity="${name ? 1 : 0}"><rect x="${NX0}" y="${NY0}" width="${NX1 - NX0}" height="${NY1 - NY0}" rx="1.5" fill="#d9eff6" stroke="${TEAL}" stroke-width="1.4"/>` +
    txt((NX0 + NX1) / 2, NY1 - 6, name || "发送者", { id: `${p}-name-t`, size: 9.5, anchor: "middle", fill: "#17607a" }) + `</g></g>`;
  dr += `<g id="${p}-name-bad" opacity="${brk ? 1 : 0}"><rect x="${NX0 - 7}" y="${NY0 - 7}" width="${NX1 - NX0 + 14}" height="${NY1 - NY0 + 14}" rx="3" fill="rgba(224,69,58,0.08)" stroke="${RED}" stroke-width="2.4" stroke-dasharray="5 3"/>` +
    `<circle cx="${NX1 + 7}" cy="${NY0 - 7}" r="7" fill="${RED}" stroke="#ffffff" stroke-width="1.4"/><path d="M${NX1 + 4.2} ${NY0 - 9.8}L${NX1 + 9.8} ${NY0 - 4.2}M${NX1 + 9.8} ${NY0 - 9.8}L${NX1 + 4.2} ${NY0 - 4.2}" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/></g>`;
  // hinges at the bottom edge
  dr += [16, DWd - 30].map((x) => `<rect x="${x}" y="${DH - 6}" width="14" height="6" rx="1.5" fill="#8b9199" stroke="#3b3e44" stroke-width="0.9"/>`).join("");
  s += `<g id="${p}-door" data-hx="${f(hinge[0])}" data-hy="${f(hinge[1])}" data-h="${DH}" data-uv="${f4(U[0])},${f4(U[1])},${f4(V[0])},${f4(V[1])},${f4(CE)}" data-a="${phi0}" transform="matrix(${mArr(doorM(phi0))})">${dr}</g>`;
  // ---- padlock on the −u side (hasp near the front edge)
  const mLk = frameU(o, u0, v1 - 20, 112);
  s += G_(matStr(mLk), `<rect x="-9" y="-12" width="14" height="22" rx="2" fill="#a9aeb5" stroke="#3b3e44" stroke-width="1"/><circle cx="-2" cy="-6" r="1.6" fill="#3b3e44"/><circle cx="-2" cy="5" r="1.6" fill="#3b3e44"/>` +
    `<rect x="3" y="-4" width="14" height="6" rx="2" fill="#8b9199" stroke="#3b3e44" stroke-width="1"/><circle cx="14" cy="-1" r="3" fill="none" stroke="#3b3e44" stroke-width="1.6"/>`);
  const unl = !!opts.unlocked;
  s += `<g id="${p}-lock">${G_(matStr(mLk), `<g id="${p}-lock-sh" data-y="${unl ? -7 : 0}" transform="translate(0 ${unl ? -7 : 0})"><path d="M8.5 9V2.5A5.5 5.5 0 0 1 19.5 2.5V9" fill="none" stroke="#8b9199" stroke-width="3.2"/><path d="M8.5 9V2.5A5.5 5.5 0 0 1 19.5 2.5V9" fill="none" stroke="#d4d7db" stroke-width="1.2"/></g>` +
    `<rect x="5.5" y="8" width="17" height="15" rx="3" fill="#c9a14a" stroke="#7a5a18" stroke-width="1.2"/><path d="M7.5 10.5H20.5" stroke="#ecd38c" stroke-width="1"/>` +
    `<circle cx="14" cy="15" r="2" fill="#3b2a08"/><path d="M14 16V19.5" stroke="#3b2a08" stroke-width="1.6"/>`)}</g>`;
  // envelopes above the slot last (they rise above the lid)
  s += env(`${p}-env`, false) + env(`${p}-copy`, true);
  const m0 = doorM(phi0);
  const anchors = {
    top: at(o, 0, 0, zL + 100), center: at(o, 0, 0, 75), ground: at(o), slot: at(o, 0, 0, zL), drop: at(o, 0, 0, zE + EH + 10),
    window: applyM(m0, (WX0 + WX1) / 2, (WY0 + WY1) / 2), name: applyM(m0, (NX0 + NX1) / 2, (NY0 + NY1) / 2), lock: applyM(mLk, 14, 15),
    door: applyM(m0, DWd / 2, DH / 2), answer: at(o, 0, 10, DZ0 + AH / 2 + 6),
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [], ghost: 1, badge: false, glowDefault: true, center: anchors.center, glowR: 130, k: K }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

export const CATALOG_EXT = { cheque, rotaWheel, commitBox };
/** runtime-ext.js contents — inline after iso.runtimeJs() (and other chapters' runtime-ext) */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
