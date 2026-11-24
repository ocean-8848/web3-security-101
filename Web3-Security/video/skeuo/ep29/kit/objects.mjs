// objects.mjs — 拟物等距物件（ep29）
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin  = 世界坐标 {u, v}（用 iso.G(X,Y) 从世界画布地面 px 换算）
//   opts.id = id 前缀（同一画面多个实例必须不同）；所有内部 id 都是 `${id}-xxx`
//   opts.state = "normal" | "broken" | "attacker"
//   opts.glow  = true 时脚下绿色地光（只给"正常"物件；checkpoint 默认开）
// 通用结构（供 GSAP / KIT 运行时动画）：
//   <g id=ID data-ox data-oy>          物件根（KIT.grow 用 data-ox/oy 作底部原点）
//     <g id=ID-glow>                   地光
//     <g id=ID-solid>                  实体
//     <path id=ID-wire>                红色虚线线框（broken 时 opacity 1）
//     <g id=ID-x>                      红叉徽章（broken 时 opacity 1）
// anchors 全部是世界画布 px（与 iso.wlab / iso.pinAt 同一坐标系）。
import {
  CA, SA, SE, CE, U, V, f, f4, at, pts, M, C, mix, lighten, darken, mat,
  frameV, frameU, frameTop, frameTilt, matStr, applyM, faceV, faceU, faceTop, faceTilt,
  box, edges, loft, prism, rbox, cyl, frustum, wedge, sphere, flat, line3, rrectPlan, circlePlan,
  glow, contactShadow, wireSvg, badgeSvg, checkSvg,
} from "./iso.mjs";

const DEG = Math.PI / 180;
const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const txt = (x, y, s, o = {}) =>
  `<text x="${f(x)}" y="${f(y)}" ${o.mono ? MONO : FONT} font-size="${o.size ?? 20}" font-weight="${o.weight ?? 900}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}" ${o.extra ?? ""}>${s}</text>`;
const LED = { green: "#2bd46f", red: "#ff4a3d", off: "#3c3f45", blue: "#5cc0e0" };
const ledSvg = (id, x, y, r, color) => {
  const c = LED[color] ?? color;
  return `<circle id="${id}-h" cx="${f(x)}" cy="${f(y)}" r="${f(r * 2.1)}" fill="${c}" opacity="${color === "off" ? 0 : 0.35}"/><circle id="${id}" cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" stroke="rgba(0,0,0,0.35)" stroke-width="1"/>`;
};
/** gear path centred at (cx,cy) */
function gearD(cx, cy, r, n = 10, h = 5) {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a0 = (i / (n * 2)) * 2 * Math.PI, a1 = ((i + 1) / (n * 2)) * 2 * Math.PI, rr = i % 2 ? r : r + h;
    const p0 = [cx + rr * Math.cos(a0), cy + rr * Math.sin(a0)], p1 = [cx + rr * Math.cos(a1), cy + rr * Math.sin(a1)];
    d += (i === 0 ? `M${f(p0[0])} ${f(p0[1])}` : `L${f(p0[0])} ${f(p0[1])}`) + `L${f(p1[0])} ${f(p1[1])}`;
  }
  return d + "Z";
}
const star5 = (cx, cy, R, r) => { let d = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r : R; d += `${i ? "L" : "M"}${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))}`; } return d + "Z"; };

/** common shell: glow / solid / wire / badge */
function shell(p, o, opts, s) {
  const st = opts.state ?? "normal", broken = st === "broken";
  const glowOn = (opts.glow ?? s.glowDefault ?? false) && !broken;
  const [ox, oy] = at(o);
  const glowSvg = s.glowR ? `<g id="${p}-glow" opacity="${glowOn ? 1 : 0}">${glow(p + "-gl", s.glowAt ?? o, s.glowR)}</g>` : "";
  return `<g id="${p}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}" data-state="${st}">${s.under ?? ""}${glowSvg}${s.shadow ?? ""}
  <g id="${p}-solid" opacity="${broken ? opts.ghost ?? 0.18 : 1}">${s.solid}</g>
  ${wireSvg(p + "-wire", o, s.wire, { opacity: broken ? 1 : 0 })}
  ${badgeSvg(p + "-x", s.center, s.badgeR ?? 30, broken && opts.badge !== false ? 1 : 0)}${s.over ?? ""}</g>`;
}
const isAtk = (opts) => opts.state === "attacker";
/** rotator group: content drawn in a plane frame m (array), rotated about local (px,py) by a deg */
function rotator(id, m, px, py, a, inner, extra = "") {
  const tr = `${matStr(m)} translate(${px} ${py}) rotate(${f(a)}) translate(${-px} ${-py})`;
  return `<g id="${id}" data-m="${m.map((v, i) => (i < 4 ? f4(v) : f(v))).join(",")}" data-px="${px}" data-py="${py}" data-a="${f(a)}" transform="${tr}" ${extra}>${inner}</g>`;
}

// =====================================================================================
// 保险柜 safe — 冷钱包 / Safe 多签；variant:"hot" = 热钱包（小、浅色、外挂数字键盘）
// opts: open (门开角度°, 0 关, 105 全开), core:"blue"|"attacker", gold:true, plate:"冷钱包"
// 可动：ID-door（KIT.door 开合，绕右侧铰链）；ID-core（蓝色锁芯）/ ID-core-atk（红色攻击者锁芯，KIT.swap）
// anchors: top, front, center, core（门开 105° 时锁芯中心）, hinge
// =====================================================================================
export function safe(o, opts = {}) {
  const p = opts.id ?? "safe", hot = opts.variant === "hot", atk = isAtk(opts);
  const W = hot ? 190 : 290, D = hot ? 160 : 240, H = hot ? 210 : 320, zf = 14;
  const u0 = -W / 2, u1 = W / 2, v0 = -D / 2, v1 = D / 2, zT = zf + H;
  const body = atk ? mat("#c9463c") : hot ? M.steelLight : M.steel;
  const doorM = atk ? mat("#d65248") : hot ? { f: "#b4b9c0", s: "#9aa0a8", t: "#cdd1d6", st: "#5d636b" } : { f: "#70757d", s: "#5a5f67", t: "#868b93", st: "#25282c" };
  const m = hot ? 20 : 28; // frame margin around door opening
  const ui0 = u0 + m, ui1 = u1 - m, zi0 = zf + m, zi1 = zT - m, dw = ui1 - ui0, dh = zi1 - zi0, T = hot ? 14 : 20;
  const vb = v0 + 26;
  let s = contactShadow(o, W * 0.75, D * 0.75);
  // feet
  for (const [a, b] of [[u1 - 34, v0 + 12], [u0 + 12, v0 + 12], [u1 - 34, v1 - 34], [u0 + 12, v1 - 34]]) s += box(o, a, a + 22, b, b + 22, 0, zf, M.ink, 1.2);
  // body + top plate
  s += rbox(o, u0, u1, v0, v1, zf, zT, 18, body, { sw: 2 });
  s += rbox(o, u0 + 10, u1 - 10, v0 + 10, v1 - 10, zT, zT + 5, 12, { ...body, f: lighten(body.f, 0.08), t: lighten(body.t, 0.1) }, { sw: 1.4 });
  // side panel seam + rivets on −u face
  s += G_(faceU(o, u0, v0 + 18, zT - 14), `<rect x="0" y="0" width="${D - 36}" height="${H - 28}" rx="8" fill="none" stroke="${darken(body.f, 0.18)}" stroke-width="2"/>` +
    [0, 1, 2, 3].map((i) => `<circle cx="${10 + (i % 2) * (D - 56)}" cy="${10 + Math.floor(i / 2) * (H - 48)}" r="3" fill="${lighten(body.f, 0.2)}"/>`).join(""));
  // door frame recess on the front face
  s += G_(faceV(o, ui0 - 7, v1, zi1 + 7), `<rect x="0" y="0" width="${dw + 14}" height="${dh + 14}" rx="6" fill="${darken(body.s, 0.3)}" stroke="${body.st}" stroke-width="2"/>`);
  // cavity (clipped to the opening)
  const op = [at(o, ui0, v1, zi0), at(o, ui1, v1, zi0), at(o, ui1, v1, zi1), at(o, ui0, v1, zi1)];
  const IN = { back: "#2a2c31", wall: "#3b3e44", floor: "#4b4f56" };
  let cav = `<polygon points="${pts([at(o, ui0, vb, zi0), at(o, ui1, vb, zi0), at(o, ui1, vb, zi1), at(o, ui0, vb, zi1)])}" fill="${IN.back}"/>`;
  cav += `<polygon points="${pts([at(o, ui1, vb, zi0), at(o, ui1, v1, zi0), at(o, ui1, v1, zi1), at(o, ui1, vb, zi1)])}" fill="${IN.wall}"/>`;
  cav += `<polygon points="${pts([at(o, ui0, vb, zi0), at(o, ui1, vb, zi0), at(o, ui1, v1, zi0), at(o, ui0, v1, zi0)])}" fill="${IN.floor}"/>`;
  const zs = zi0 + dh * 0.5;
  // gold under the shelf (floor) — far rows first
  const GB = hot ? { l: 40, w: 20, h: 12 } : { l: 56, w: 26, h: 16 };
  const goldRow = (z, vv, us) => us.map((uu) => box(o, uu, uu + GB.l, vv, vv + GB.w, z, z + GB.h, M.gold, 1.2)).join("");
  if (opts.gold !== false) {
    const n = hot ? 2 : 3, du = GB.l + 6, ustart = ui0 + 14;
    const us = Array.from({ length: n }, (_, i) => ustart + i * du);
    cav += goldRow(zi0, v1 - 70, us) + goldRow(zi0, v1 - 42, us) + goldRow(zi0 + GB.h, v1 - 56, us.slice(0, n - 1).map((x) => x + du / 2));
  }
  // shelf
  cav += box(o, ui0, ui1, vb, v1 - 8, zs, zs + 6, { f: "#8d929a", s: "#6e737b", t: "#a3a8af", st: "#2b2e33" }, 1.2);
  if (opts.gold !== false) {
    const us = hot ? [ui0 + 20] : [ui0 + 18, ui0 + 18 + GB.l + 6];
    cav += goldRow(zs + 6, v1 - 52, us) + goldRow(zs + 6 + GB.h, v1 - 52, us.slice(0, 1).map((x) => x + GB.l / 2 - 4));
  }
  s += `<defs><clipPath id="${p}-cav-c"><polygon points="${pts(op)}"/></clipPath></defs><g id="${p}-cav" clip-path="url(#${p}-cav-c)">${cav}</g>`;

  // ---- door (outer face, inner face with lock core, edge strips) — geometry as runtime.setDoor
  const deg = opts.open ?? 0;
  const [hx, hy] = at(o, ui1, v1, zi1);
  const dState = (a) => {
    const r = a * DEG, du = -Math.cos(r), dv = Math.sin(r), nu = Math.sin(r), nv = Math.cos(r);
    const dS = [du * CA + dv * SA, -du * SA * SE + dv * CA * SE], nS = [nu * CA + nv * SA, -nu * SA * SE + nv * CA * SE];
    const F = [hx + dw * dS[0], hy + dw * dS[1]], I = [F[0] - T * nS[0], F[1] - T * nS[1]], Hn = [hx - T * nS[0], hy - T * nS[1]];
    return { out: [-dS[0], -dS[1], 0, CE, F[0], F[1]], inn: [dS[0], dS[1], 0, CE, Hn[0], Hn[1]], showOut: nS[1] > 0, F, I, Hn };
  };
  const ds = dState(deg);
  const r2 = (n) => Math.round(n * 100) / 100;
  const mm = (a) => `matrix(${a.map(r2).join(",")})`;
  // outer face content (local x: free edge → hinge, y down)
  const dialR = hot ? 0 : 42, cx = dw * 0.4, cyD = dh * 0.36, cyH = hot ? dh * 0.48 : dh * 0.7;
  let outer = `<rect x="0" y="0" width="${dw}" height="${dh}" rx="6" fill="${doorM.s}" stroke="${doorM.st}" stroke-width="2"/>
    <rect x="12" y="12" width="${dw - 24}" height="${dh - 24}" rx="5" fill="none" stroke="${lighten(doorM.s, 0.18)}" stroke-width="2.4"/>
    <rect x="15" y="15" width="${dw - 30}" height="${dh - 30}" rx="4" fill="none" stroke="${darken(doorM.s, 0.25)}" stroke-width="1.6"/>`;
  // nameplate
  const plate = opts.plate ?? (hot ? "" : "");
  outer += `<rect x="${dw / 2 - (hot ? 34 : 50)}" y="${hot ? 22 : 26}" width="${hot ? 68 : 100}" height="${hot ? 18 : 24}" rx="3" fill="#d9dcdf" stroke="#7d828a" stroke-width="1.5"/>` +
    (plate ? txt(dw / 2, hot ? 36 : 44, plate, { size: hot ? 12 : 16, anchor: "middle", fill: "#3b3e44", weight: 700 }) :
      `<rect x="${dw / 2 - (hot ? 22 : 34)}" y="${hot ? 29 : 35}" width="${hot ? 44 : 68}" height="4" rx="2" fill="#9aa0a8"/>`);
  if (!hot) {
    // combination dial
    let ticks = "";
    for (let i = 0; i < 40; i++) { const a = (i / 40) * 2 * Math.PI, r0 = i % 5 ? dialR - 6 : dialR - 10; ticks += `M${f(cx + r0 * Math.cos(a))} ${f(cyD + r0 * Math.sin(a))}L${f(cx + (dialR - 2) * Math.cos(a))} ${f(cyD + (dialR - 2) * Math.sin(a))}`; }
    outer += `<defs><radialGradient id="${p}-dg" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#f4f5f6"/><stop offset="0.6" stop-color="#b9bdc3"/><stop offset="1" stop-color="#7d828a"/></radialGradient></defs>
      <circle cx="${cx + 3}" cy="${cyD + 4}" r="${dialR + 6}" fill="rgba(0,0,0,0.25)"/>
      <circle cx="${cx}" cy="${cyD}" r="${dialR + 6}" fill="#2b2d31" stroke="#16171a" stroke-width="2"/>
      <circle cx="${cx}" cy="${cyD}" r="${dialR}" fill="url(#${p}-dg)" stroke="#5d636b" stroke-width="1.5"/>
      <path d="${ticks}" stroke="#2b2d31" stroke-width="1.6"/>
      <circle cx="${cx}" cy="${cyD}" r="${dialR * 0.42}" fill="#2b2d31"/><circle cx="${cx - 3}" cy="${cyD - 3}" r="${dialR * 0.18}" fill="#5a5e65"/>
      <path d="M${cx - 5} ${cyD - dialR - 12}L${cx + 5} ${cyD - dialR - 12}L${cx} ${cyD - dialR - 5}Z" fill="#f4f5f6"/>`;
  } else {
    // hot wallet: small status LED + digital lock slot instead of a dial
    outer += `<rect x="${cx - 26}" y="${dh * 0.26}" width="52" height="22" rx="4" fill="#1d2024" stroke="#5d636b" stroke-width="1.5"/>${ledSvg(p + "-led", cx + 14, dh * 0.26 + 11, 4, "green")}
      <rect x="${cx - 20}" y="${dh * 0.26 + 7}" width="22" height="8" rx="2" fill="#2d6e83"/>`;
  }
  // three-spoke handle
  const hr = hot ? 24 : 44;
  let spokes = "";
  for (const a of [-90, 30, 150]) {
    const r = a * DEG, ex = cx + hr * Math.cos(r), ey = cyH + hr * Math.sin(r);
    spokes += `<line x1="${cx}" y1="${cyH}" x2="${f(ex)}" y2="${f(ey)}" stroke="#2b2d31" stroke-width="${hot ? 6 : 8}" stroke-linecap="round"/>
      <line x1="${cx}" y1="${cyH}" x2="${f(ex)}" y2="${f(ey)}" stroke="#c9cdd2" stroke-width="${hot ? 2.5 : 3.5}" stroke-linecap="round"/>
      <circle cx="${f(ex)}" cy="${f(ey)}" r="${hot ? 6 : 8.5}" fill="url(#${p}-hg)" stroke="#2b2d31" stroke-width="1.6"/>`;
  }
  outer += `<defs><radialGradient id="${p}-hg" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#c3c7cc"/><stop offset="1" stop-color="#6e737b"/></radialGradient></defs>
    <circle cx="${cx + 3}" cy="${cyH + 4}" r="${hot ? 9 : 13}" fill="rgba(0,0,0,0.25)"/>${spokes}
    <circle cx="${cx}" cy="${cyH}" r="${hot ? 9 : 13}" fill="url(#${p}-hg)" stroke="#2b2d31" stroke-width="2"/>`;
  // keyhole near the free edge
  outer += `<circle cx="${dw * 0.82}" cy="${dh * 0.5}" r="${hot ? 5 : 7}" fill="#1d2024"/><path d="M${dw * 0.82 - 3} ${dh * 0.5}L${dw * 0.82 + 3} ${dh * 0.5}L${dw * 0.82 + 2} ${dh * 0.5 + (hot ? 10 : 14)}L${dw * 0.82 - 2} ${dh * 0.5 + (hot ? 10 : 14)}Z" fill="#1d2024"/>`;
  // inner face: steel panel + lock core module + bolts (local x: hinge → free edge)
  const innerPanel = `<rect x="0" y="0" width="${dw}" height="${dh}" rx="6" fill="#9a9fa7" stroke="#4b4f56" stroke-width="2"/>
    <rect x="10" y="10" width="${dw - 20}" height="${dh - 20}" rx="4" fill="#b3b8bf" stroke="#7d828a" stroke-width="1.5"/>`;
  const coreW = dw * 0.56, coreH = dh * (hot ? 0.46 : 0.42), kx = dw * 0.18, ky = (dh - coreH) / 2;
  const boltYs = hot ? [ky + coreH * 0.3, ky + coreH * 0.7] : [ky + coreH * 0.18, ky + coreH * 0.5, ky + coreH * 0.82];
  const core = (fillA, fillB, stroke) => {
    let k = `<rect x="${kx + 3}" y="${ky + 4}" width="${coreW}" height="${coreH}" rx="8" fill="rgba(0,0,0,0.22)"/>`;
    // bolts reach past the free edge
    for (const by of boltYs) k += `<rect x="${kx + coreW - 6}" y="${by - 7}" width="${dw - kx - coreW + 22}" height="14" rx="4" fill="#d9dcdf" stroke="#5d636b" stroke-width="1.6"/><rect x="${kx + coreW - 6}" y="${by - 7}" width="${dw - kx - coreW + 22}" height="5" rx="2" fill="#f2f3f4"/>`;
    k += `<rect x="${kx}" y="${ky}" width="${coreW}" height="${coreH}" rx="8" fill="${fillA}" stroke="${stroke}" stroke-width="2.4"/>
      <rect x="${kx + 6}" y="${ky + 6}" width="${coreW - 12}" height="${coreH * 0.22}" rx="4" fill="${fillB}"/>`;
    const g1 = [kx + coreW * 0.34, ky + coreH * 0.6], g2 = [kx + coreW * 0.66, ky + coreH * 0.52];
    const gr = Math.min(coreW, coreH) * 0.2;
    k += `<path d="${gearD(g1[0], g1[1], gr, 10, gr * 0.28)}" fill="${fillB}" stroke="${stroke}" stroke-width="1.6"/><circle cx="${g1[0]}" cy="${g1[1]}" r="${f(gr * 0.35)}" fill="${stroke}"/>
      <path d="${gearD(g2[0], g2[1], gr * 0.7, 8, gr * 0.24)}" fill="${fillB}" stroke="${stroke}" stroke-width="1.6"/><circle cx="${g2[0]}" cy="${g2[1]}" r="${f(gr * 0.25)}" fill="${stroke}"/>`;
    // connecting rod
    k += `<rect x="${kx + coreW - 14}" y="${boltYs[0] - 4}" width="8" height="${boltYs[boltYs.length - 1] - boltYs[0] + 8}" rx="3" fill="${stroke}"/>`;
    return k;
  };
  const coreAtk = opts.core === "attacker";
  const inner = innerPanel +
    `<g id="${p}-core" opacity="${coreAtk ? 0 : 1}">${core("#5cc0e0", "#9ad9ee", "#1f7896")}</g>` +
    `<g id="${p}-core-atk" opacity="${coreAtk ? 1 : 0}">${core("#e8574c", "#f08a80", "#a8322a")}</g>`;
  const P2 = (q) => `${r2(q[0])},${r2(q[1])}`, Hd = dh * CE, vis = deg > 1.5 ? 1 : 0;
  const door = `<g id="${p}-door" data-hx="${r2(hx)}" data-hy="${r2(hy)}" data-w="${dw}" data-h="${dh}" data-t="${T}" data-a="${deg}">
    <polygon id="${p}-door-top" points="${[P2([hx, hy]), P2(ds.F), P2(ds.I), P2(ds.Hn)].join(" ")}" fill="${doorM.t}" stroke="${doorM.st}" stroke-width="1.6" stroke-linejoin="round" opacity="${vis}"/>
    <polygon id="${p}-door-edge" points="${[P2(ds.F), P2(ds.I), P2([ds.I[0], ds.I[1] + Hd]), P2([ds.F[0], ds.F[1] + Hd])].join(" ")}" fill="${doorM.f}" stroke="${doorM.st}" stroke-width="1.6" stroke-linejoin="round" opacity="${vis}"/>
    <g id="${p}-door-out" transform="${mm(ds.out)}" opacity="${ds.showOut ? 1 : 0}">${outer}</g>
    <g id="${p}-door-in" transform="${mm(ds.inn)}" opacity="${ds.showOut ? 0 : 1}">${inner}</g></g>`;
  s += door;
  // hinge barrels (on the body, right edge of the opening)
  for (const zz of [zi1 - dh * 0.22, zi0 + dh * 0.22]) s += cyl(o, ui1 + 2, v1 + 2, hot ? 5 : 7, zz - (hot ? 14 : 20), zz + (hot ? 14 : 20), M.chrome, { sw: 1.2, seg: 16 });
  // hot wallet: keypad hanging outside on the −u face
  if (hot) {
    const kz = zf + H * 0.72, kv = -16;
    s += line3(o, [[u0 - 4, kv + 30, kz - 70], [u0 - 26, kv + 34, kz - 92], [u0 - 30, kv + 10, kz - 110], [u0 - 4, kv - 8, zf + 30]], "#2b2d31", 3.5);
    s += box(o, u0 - 16, u0 - 2, kv - 22, kv + 30, kz - 74, kz, M.ink, 1.4);
    let keys = `<rect x="5" y="5" width="42" height="14" rx="2" fill="#5cc0e0"/>` + txt(26, 16, "****", { size: 10, mono: true, anchor: "middle", fill: "#0f3a48" });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) keys += `<rect x="${6 + c * 14}" y="${24 + r * 12}" width="11" height="9" rx="2" fill="#e9ebee" stroke="#8b9199" stroke-width="0.8"/>`;
    s += G_(faceU(o, u0 - 16, kv - 22, kz), keys);
  }
  const coreLocal = [kx + coreW / 2, ky + coreH / 2];
  const dOpen = dState(105);
  const anchors = {
    top: at(o, 0, 0, zT + 64), front: at(o, 0, v1, zf + H / 2), center: at(o, 0, 0, zf + H / 2), ground: at(o),
    hinge: [hx, hy], core: applyM(dOpen.inn, coreLocal[0], coreLocal[1]), coreLabel: applyM(dOpen.inn, dw * 0.5, dh + 26), coreNow: applyM(ds.inn, coreLocal[0], coreLocal[1]),
    door: p + "-door", coreId: p + "-core", coreAtkId: p + "-core-atk",
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [[u0, u1, v0, v1, zf, zT], [u0 + 10, u1 - 10, v0 + 10, v1 - 10, zT, zT + 5]], center: anchors.center, glowR: W * 0.9 }),
    anchors,
  };
}
export const hotWallet = (o, opts = {}) => safe(o, { ...opts, variant: "hot", id: opts.id ?? "hot" });

// =====================================================================================
// 笔记本电脑 laptop — opts.screen（SVG 字符串，本地坐标 222×146，原点在屏幕显示区左上）
// opts.screen2（备用内容，初始隐藏）、opts.off（黑屏）
// 可动：ID-scr / ID-scr2（KIT.swap 替换屏幕内容）
// anchors: top, screen（屏幕中心）, front, keyboard
// =====================================================================================
export const LAPTOP_SCREEN = { w: 222, h: 146 };
export function laptop(o, opts = {}) {
  const p = opts.id ?? "laptop", atk = isAtk(opts);
  const alu = atk ? mat("#e8574c") : { f: "#e3e6e9", s: "#c6cbd1", t: "#f1f2f4", st: "#8d939b" };
  const W = 240, Dp = 160, tilt = 12, Lh = 166, vh = -Dp / 2 + 6, zb = 12;
  let s = contactShadow(o, 170, 120);
  s += rbox(o, -W / 2, W / 2, -Dp / 2, Dp / 2, 0, zb, 8, alu, { sw: 1.6 });
  // keyboard + trackpad on the deck
  let kb = `<rect x="0" y="0" width="208" height="78" rx="5" fill="${darken(alu.t, 0.12)}"/>`;
  const rows = [14, 14, 13, 12];
  rows.forEach((n, r) => { const kw = (200 - (n - 1) * 3) / n; for (let c = 0; c < n; c++) kb += `<rect x="${f(4 + c * (kw + 3))}" y="${4 + r * 15}" width="${f(kw)}" height="12" rx="2" fill="#fbfbfc" stroke="#a9aeb5" stroke-width="0.7"/>`; });
  kb += `<rect x="54" y="64" width="100" height="11" rx="2" fill="#fbfbfc" stroke="#a9aeb5" stroke-width="0.7"/>`;
  kb += `<rect x="70" y="88" width="68" height="40" rx="5" fill="${darken(alu.t, 0.06)}" stroke="#a9aeb5" stroke-width="1"/>`;
  s += G_(faceTop(o, -104, -Dp / 2 + 16, zb), kb);
  // lid: back plate (thickness) then bezel + display
  const lidTopV = vh - Lh * Math.sin(tilt * DEG), lidTopZ = zb + Lh * Math.cos(tilt * DEG);
  const m = frameTilt(o, -W / 2, lidTopV, lidTopZ, tilt);
  const back = [-7 * Math.cos(tilt * DEG) * V[0], -7 * Math.cos(tilt * DEG) * V[1] - 7 * Math.sin(tilt * DEG) * CE];
  s += `<g transform="translate(${f(back[0])},${f(back[1])})">${G_(matStr(m), `<rect x="0" y="0" width="${W}" height="${Lh}" rx="12" fill="${alu.s}" stroke="${alu.st}" stroke-width="1.6"/>`)}</g>`;
  const SW = LAPTOP_SCREEN.w, SH = LAPTOP_SCREEN.h;
  const defScreen = opts.off ? `<rect x="0" y="0" width="${SW}" height="${SH}" fill="#2f3237"/>` : laptopDefaultScreen();
  const scr = `<rect x="0" y="0" width="${W}" height="${Lh}" rx="12" fill="#26272a" stroke="#141518" stroke-width="1.6"/>
    <circle cx="${W / 2}" cy="6" r="2" fill="#4a4d53"/>
    <defs><clipPath id="${p}-sc"><rect x="0" y="0" width="${SW}" height="${SH}" rx="3"/></clipPath></defs>
    <g transform="translate(9,11)" clip-path="url(#${p}-sc)"><rect x="0" y="0" width="${SW}" height="${SH}" fill="#ffffff"/>
      <g id="${p}-scr">${opts.screen ?? defScreen}</g><g id="${p}-scr2" opacity="0">${opts.screen2 ?? ""}</g></g>`;
  s += G_(matStr(m), scr);
  // hinge bar
  s += line3(o, [[-W / 2 + 14, vh - 2, zb + 2], [W / 2 - 14, vh - 2, zb + 2]], "#7d828a", 6);
  const anchors = { top: at(o, 0, lidTopV, lidTopZ + 24), screen: applyM(m, 9 + SW / 2, 11 + SH / 2), front: at(o, 0, Dp / 2, zb), keyboard: at(o, 0, 0, zb), ground: at(o), center: at(o, 0, -20, 70), screenM: m, scr: p + "-scr", scr2: p + "-scr2" };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-W / 2, W / 2, -Dp / 2, Dp / 2, 0, zb], [-W / 2, W / 2, lidTopV - 4, vh, zb, lidTopZ]], center: anchors.center, glowR: 190 }), anchors };
}
/** generic wallet UI for screens (SW×SH local); title / main line / button */
export function laptopDefaultScreen(o = {}) {
  const SW = o.w ?? LAPTOP_SCREEN.w, SH = o.h ?? LAPTOP_SCREEN.h;
  return `<rect x="0" y="0" width="${SW}" height="28" fill="#ece7dd"/>` + txt(10, 20, o.title ?? "Safe{Wallet}", { size: 14, weight: 700, fill: "#5f5a50", extra: `font-family="Inter, sans-serif"` }) +
    (o.line ? txt(12, 62, o.line, { size: 22 }) : `<rect x="12" y="42" width="120" height="10" rx="5" fill="#ddd6c9"/><rect x="12" y="62" width="160" height="10" rx="5" fill="#ddd6c9"/><rect x="12" y="82" width="96" height="10" rx="5" fill="#ddd6c9"/>`) +
    `<rect x="${SW - 104}" y="${SH - 40}" width="92" height="30" rx="7" fill="${o.btn ?? "#c9c3b7"}"/>` + txt(SW - 58, SH - 19, o.btnText ?? "确认", { size: 17, anchor: "middle", fill: "#ffffff" });
}

// =====================================================================================
// 硬件钱包 hwWallet — 通用小设备：小屏 + 两个按键 + USB 线（无品牌外观）
// opts.screenText（默认 "确认?"）
// 可动：ID-scr / ID-scr2（屏幕内容，本地 70×40）, ID-btn-0/1
// =====================================================================================
export function hwWallet(o, opts = {}) {
  const p = opts.id ?? "hw", atk = isAtk(opts);
  const bodyM = atk ? M.red : { f: "#3b3e44", s: "#2b2d31", t: "#4d5158", st: "#141518" };
  const L = 140, Wd = 74, Hh = 20, u0 = -L / 2, v0 = -Wd / 2;
  let s = contactShadow(o, 110, 70, 30, 10);
  // USB cable on the ground, out of the +u end
  const cable = [[L / 2 + 12, 0, 8], [L / 2 + 50, 2, 4], [L / 2 + 86, 26, 3], [L / 2 + 92, 64, 3], [L / 2 + 120, 86, 3], [L / 2 + 160, 84, 3]];
  s += line3(o, cable, "#1d1f23", 7) + line3(o, cable, "#5a5e65", 2.2);
  s += box(o, L / 2 + 156, L / 2 + 196, 76, 92, 0, 12, M.ink, 1.2) + box(o, L / 2 + 196, L / 2 + 220, 78, 90, 2, 10, M.chrome, 1.2);
  s += box(o, L / 2 - 4, L / 2 + 14, -9, 9, 4, 14, M.chrome, 1.2);
  // body
  s += rbox(o, u0, -u0, v0, -v0, 0, Hh, 14, bodyM, { sw: 1.8 });
  // top: screen + buttons
  const screen = opts.screen ?? `<rect x="0" y="0" width="70" height="40" fill="#0f2a33"/>` + txt(35, 26, opts.screenText ?? "确认?", { size: 15, anchor: "middle", fill: "#9ad9ee" });
  s += G_(faceTop(o, u0 + 14, v0 + 14, Hh), `<rect x="-3" y="-3" width="76" height="46" rx="5" fill="#141518"/>
    <defs><clipPath id="${p}-sc"><rect x="0" y="0" width="70" height="40" rx="2"/></clipPath></defs>
    <g clip-path="url(#${p}-sc)"><g id="${p}-scr">${screen}</g><g id="${p}-scr2" opacity="0">${opts.screen2 ?? ""}</g></g>`);
  for (const [i, dv] of [[0, -14], [1, 14]]) s += `<g id="${p}-btn-${i}">${cyl(o, L / 2 - 28, dv, 9, Hh, Hh + 5, M.chrome, { sw: 1.2, seg: 24 })}</g>`;
  const anchors = { top: at(o, 0, 0, Hh + 40), screen: at(o, u0 + 49, 0, Hh), center: at(o, 0, 0, Hh / 2), ground: at(o), scr: p + "-scr", scr2: p + "-scr2" };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0, -u0, v0, -v0, 0, Hh]], center: anchors.center, badgeR: 24, glowR: 120 }), anchors };
}

// =====================================================================================
// 挂锁 + 钥匙 padlock — opts.key=true 钥匙插在锁里；钥匙单独画用 key()
// anchors: top, center, keyhole
// =====================================================================================
const brass = { f: "#d6a64a", s: "#b58630", t: "#ecc778", st: "#7a5716" };
export function padlock(o, opts = {}) {
  const p = opts.id ?? "lock", atk = isAtk(opts);
  const bodyM = atk ? M.red : { f: "#c4c9cf", s: "#a3a9b1", t: "#dde0e4", st: "#5a6068" };
  const bw = 56, bd = 24, bh = 78;
  let s = contactShadow(o, 70, 40);
  // shackle (in the v=0 plane), drawn before the body so the body hides its feet
  const sh = `<path d="M${-bw + 14} 6V-26A${bw - 14} ${bw - 14} 0 0 1 ${bw - 14} -26V6" fill="none" stroke="#5a6068" stroke-width="13"/>
    <path d="M${-bw + 14} 6V-26A${bw - 14} ${bw - 14} 0 0 1 ${bw - 14} -26V6" fill="none" stroke="#d4d7db" stroke-width="5"/>`;
  s += G_(faceV(o, 0, 0, bh), sh);
  s += rbox(o, -bw, bw, -bd, bd, 0, bh, 10, bodyM, { sw: 1.8 });
  // front details
  const kz = bh * 0.52;
  s += G_(faceV(o, -bw, bd, bh), `<rect x="8" y="8" width="${bw * 2 - 16}" height="7" rx="3" fill="${lighten(bodyM.s, 0.2)}"/>
    <circle cx="${bw}" cy="${bh - kz}" r="8" fill="#1d1f23"/><path d="M${bw - 4} ${bh - kz}L${bw + 4} ${bh - kz}L${bw + 3} ${bh - kz + 16}L${bw - 3} ${bh - kz + 16}Z" fill="#1d1f23"/>`);
  if (opts.key !== false) s += keyInserted(o, 0, bd, kz);
  const anchors = { top: at(o, 0, 0, bh + 60), center: at(o, 0, 0, bh / 2), keyhole: at(o, 0, bd, kz), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-bw, bw, -bd, bd, 0, bh]], center: anchors.center, badgeR: 26, glowR: 110 }), anchors };
}
/** key sticking out of a keyhole at (du, dv, z) along +v; bow in the u=const plane */
function keyInserted(o, du, dv, z) {
  const kk = `<rect x="0" y="-4" width="40" height="8" rx="2" fill="${brass.s}" stroke="${brass.st}" stroke-width="1.4"/>
    <circle cx="62" cy="0" r="22" fill="${brass.f}" stroke="${brass.st}" stroke-width="1.8"/><circle cx="66" cy="0" r="8" fill="#efebe3" stroke="${brass.st}" stroke-width="1.4"/>
    <path d="M44 -16A22 22 0 0 1 72 -20" fill="none" stroke="${brass.t}" stroke-width="3" stroke-linecap="round"/>`;
  // thickness: a darker copy offset along −u
  return `<g transform="translate(${f(-4 * U[0])},${f(-4 * U[1])})" opacity="0.9">${G_(faceU(o, du + 4, dv, z), kk.replaceAll(brass.f, brass.s))}</g>` + G_(faceU(o, du, dv, z), kk);
}
/** standalone key lying flat (or opts.stand=true standing) — brass */
export function key(o, opts = {}) {
  const p = opts.id ?? "key", atk = isAtk(opts);
  const K = atk ? { f: "#e8574c", s: "#c23a30", t: "#f08a80", st: "#a8322a" } : brass;
  const shape = (fill) => `<circle cx="0" cy="0" r="30" fill="${fill}" stroke="${K.st}" stroke-width="2"/><circle cx="-6" cy="0" r="11" fill="#efebe3" stroke="${K.st}" stroke-width="1.6"/>
    <path d="M26 -8H128V8H118V20H108V8H98V16H88V8H26Z" fill="${fill}" stroke="${K.st}" stroke-width="2" stroke-linejoin="round"/>`;
  const front = shape(K.f) + `<path d="M-18 -22A30 30 0 0 1 14 -27" fill="none" stroke="${K.t}" stroke-width="4" stroke-linecap="round"/><rect x="34" y="-3" width="84" height="3" rx="1.5" fill="${K.t}"/>`;
  let s = contactShadow(o, 110, 50, 30, 0);
  const z = opts.stand ? 40 : 8;
  const mF = opts.stand ? frameV(o, -40, 0, 60) : frameTop(o, -40, 0, z);
  for (let i = 6; i >= 1; i--) s += `<g transform="translate(0,${f(i * CE)})">${G_(matStr(mF), shape(K.s))}</g>`;
  s += G_(matStr(mF), front);
  const anchors = { top: at(o, 20, 0, 70), center: at(o, 10, 0, z), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-70, 90, -32, 32, 0, 12]], center: anchors.center, badgeR: 24 }), anchors };
}

// =====================================================================================
// 公章 seal — 木柄圆印章 + 纸 + 红色印痕（"钥匙盖在什么文件上"）
// opts: paper=true, stamped=true（印痕可见）, text="签名专用", markText 中心两字 "核准"
// 可动：ID-stamp（印章，静止在一旁；KIT.stamp 让它盖下去）, ID-mark（印痕）
// anchors: top, mark（印痕中心）, stamp
// =====================================================================================
export function seal(o, opts = {}) {
  const p = opts.id ?? "seal", atk = isAtk(opts);
  let s = contactShadow(o, 170, 120);
  const mc = [-36, 8]; // mark centre on the paper
  if (opts.paper !== false) {
    s += box(o, -120, 120, -84, 84, 0, 3, M.paper, 1.4);
    s += G_(faceTop(o, -120, -84, 3), `<rect x="16" y="14" width="96" height="10" rx="3" fill="#cfc7b8"/>` +
      [0, 1, 2, 3, 4].map((i) => `<rect x="16" y="${40 + i * 20}" width="${[200, 180, 196, 150, 120][i]}" height="6" rx="3" fill="#e3ddd1"/>`).join(""));
  }
  const red = "#d93a2f";
  const mark = `<g transform="${faceTop(o, mc[0], mc[1], 3.5)}">
    <circle cx="0" cy="0" r="46" fill="none" stroke="${red}" stroke-width="6"/><circle cx="0" cy="0" r="39" fill="none" stroke="${red}" stroke-width="1.6"/>
    <path d="${star5(0, -6, 15, 6.5)}" fill="${red}"/>
    <defs><path id="${p}-arc" d="M-30 6A30 30 0 1 1 30 6"/></defs>
    <text ${FONT} font-size="11" font-weight="900" fill="${red}" letter-spacing="2"><textPath href="#${p}-arc" startOffset="50%" text-anchor="middle">${opts.text ?? "签名专用章"}</textPath></text>
    ${txt(0, 28, opts.markText ?? "核准", { size: 13, anchor: "middle", fill: red })}</g>`;
  s += `<g id="${p}-mark" opacity="${opts.stamped === false ? 0 : 1}">${mark}</g>`;
  // the stamp (built at the mark centre; parked aside by a translate)
  const wood = atk ? M.red : M.wood;
  let st = contactShadow({ u: o.u + mc[0], v: o.v + mc[1] }, 46, 30);
  const so = { u: o.u + mc[0], v: o.v + mc[1] };
  st += cyl(so, 0, 0, 42, 0, 10, M.rubber, { sw: 1.4 });
  st += frustum(so, 0, 0, 41, 37, 10, 34, wood, { sw: 1.6 });
  st += frustum(so, 0, 0, 14, 11, 34, 70, wood, { sw: 1.4 });
  st += frustum(so, 0, 0, 11, 22, 70, 98, wood, { sw: 1.4 });
  st += sphere(p + "-knob", so, 0, 0, 104, 24, wood);
  st += G_(faceTop(so, 0, 0, 34), `<path d="M-30 -10Q0 -16 30 -8M-32 4Q0 -2 31 6M-26 16Q0 12 26 18" fill="none" stroke="${darken(wood.t, 0.15)}" stroke-width="1.4"/>`);
  const aside = at(o, 70, -20, 0), here = at(so, 0, 0, 0);
  const ax = f(aside[0] - here[0]), ay = f(aside[1] - here[1]);
  s += `<g id="${p}-stamp" data-ax="${ax}" data-ay="${ay}" transform="translate(${ax},${ay})">${st}</g>`;
  const anchors = { top: at(o, 30, -20, 160), mark: at(so, 0, 0, 4), stamp: [here[0] + +ax, here[1] + +ay - 60], center: at(o, 0, 0, 40), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-120, 120, -84, 84, 0, 3], { cyl: [70 + mc[0] - mc[0], -20, 42, 0, 128] }], center: anchors.center, glowR: 180 }), anchors };
}

// =====================================================================================
// 文件 / 提现单 doc — 带折角、几行字、可盖章的纸
// opts: title="提现单", lines=[...]（可选，每行文字），stamp=false（右下角盖红章）, standing=false（立起来）
// 可动：ID-stampmark（红章，opacity 动画即"盖章"）, ID-body（纸面内容组）
// =====================================================================================
export function doc(o, opts = {}) {
  const p = opts.id ?? "doc", atk = isAtk(opts);
  const Wd = opts.w ?? 200, Hd = opts.h ?? 260, ear = 34;
  const edge = atk ? "#e0453a" : "#b8b0a1";
  const paper = (fill) => `<path d="M0 0H${Wd - ear}L${Wd} ${ear}V${Hd}H0Z" fill="${fill}" stroke="${edge}" stroke-width="${atk ? 2.6 : 1.6}" stroke-linejoin="round"/>`;
  let c = paper(atk ? "#fff6f4" : "#fffdf8") + `<path d="M${Wd - ear} 0V${ear}H${Wd}Z" fill="#e8e2d6" stroke="${edge}" stroke-width="1.4" stroke-linejoin="round"/>`;
  c += txt(16, 40, opts.title ?? "提现单", { size: 30 }) + `<rect x="16" y="50" width="${Wd - 32}" height="2.5" fill="${C.ink}"/>`;
  const lines = opts.lines;
  if (lines) lines.forEach((l, i) => { c += txt(16, 90 + i * 30, l, { size: 17, weight: 700, fill: "#4a463f", mono: /^[0-9a-zA-Z]/.test(l) }); });
  else {
    const labels = ["收款", "金额", "用途"];
    labels.forEach((l, i) => { c += txt(16, 92 + i * 36, l, { size: 18, weight: 700, fill: "#6d685e" }) + `<rect x="64" y="${78 + i * 36}" width="${[110, 84, 100][i]}" height="16" rx="4" fill="#e3ddd1"/>`; });
  }
  c += `<path d="M16 ${Hd - 30}H86" stroke="#9a9488" stroke-width="1.6"/>` + txt(16, Hd - 36, "签名", { size: 15, weight: 700, fill: "#9a9488" });
  const red = "#d93a2f";
  c += `<g id="${p}-stampmark" opacity="${opts.stamp ? 1 : 0}"><g transform="translate(${Wd - 46},${Hd - 48}) rotate(-12)">
    <circle cx="0" cy="0" r="30" fill="none" stroke="${red}" stroke-width="4"/><circle cx="0" cy="0" r="25" fill="none" stroke="${red}" stroke-width="1.2"/>
    <path d="${star5(0, -3, 10, 4.3)}" fill="${red}"/>${txt(0, 19, opts.stampText ?? "核准", { size: 9, anchor: "middle", fill: red })}</g></g>`;
  let s = "";
  let anchors;
  if (opts.standing) {
    s += contactShadow(o, 110, 40, 0, 10);
    const m = frameV(o, -Wd / 2, 0, Hd + 6);
    for (let i = 4; i >= 1; i--) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(m), paper("#e3ddd1"))}</g>`;
    s += `<g id="${p}-body">${G_(matStr(m), c)}</g>`;
    anchors = { top: at(o, 0, 0, Hd + 40), center: at(o, 0, 0, Hd / 2), stamp: applyM(m, Wd - 46, Hd - 48), ground: at(o), m };
  } else {
    s += contactShadow(o, 140, 110);
    const m = frameTop(o, -Wd / 2, -Hd / 2, 3);
    s += `<g transform="translate(0,${f(3 * CE)})">${G_(matStr(m), paper("#ddd6c9"))}</g>`;
    s += `<g id="${p}-body">${G_(matStr(m), c)}</g>`;
    anchors = { top: at(o, 0, 0, 96), center: at(o, 0, 0, 3), stamp: applyM(m, Wd - 46, Hd - 48), ground: at(o), m };
  }
  const wire = opts.standing ? [[-Wd / 2, Wd / 2, -4, 0, 0, Hd + 6]] : [[-Wd / 2, Wd / 2, -Hd / 2, Hd / 2, 0, 3]];
  return { svg: shell(p, o, opts, { solid: s, wire, center: anchors.center, badgeR: 28, glowR: 150 }), anchors };
}

/** iso envelope lying flat (the HTML ENV icon in iso.mjs stays the s7 one) */
export function envelope(o, opts = {}) {
  const p = opts.id ?? "env", red = isAtk(opts);
  const W = opts.w ?? 160, H = opts.h ?? 106, st = red ? "#e0453a" : "#6b665c", fill = red ? "#fde6e3" : "#ffffff";
  const m = frameTop(o, -W / 2, -H / 2, 3);
  const c = `<rect x="0" y="0" width="${W}" height="${H}" rx="6" fill="${fill}" stroke="${st}" stroke-width="3"/><path d="M3 4L${W / 2} ${H * 0.58}L${W - 3} 4" fill="none" stroke="${st}" stroke-width="3" stroke-linejoin="round"/>`;
  const s = contactShadow(o, 90, 60) + `<g transform="translate(0,${f(3 * CE)})">${G_(matStr(m), `<rect x="0" y="0" width="${W}" height="${H}" rx="6" fill="#d8d1c4"/>`)}</g>` + G_(matStr(m), c);
  const anchors = { top: at(o, 0, 0, 40), center: at(o, 0, 0, 3), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-W / 2, W / 2, -H / 2, H / 2, 0, 3]], center: anchors.center, badgeR: 22 }), anchors };
}

// =====================================================================================
// 账本 ledger — 摊开的厚账簿（ledgerBook）；数据库圆柱 + 账簿（dbLedger）
// opts.scale（ledgerBook 缩放）
// =====================================================================================
export function ledgerBook(o, opts = {}) {
  const p = opts.id ?? "ledger", k = opts.scale ?? 1, atk = isAtk(opts);
  const cover = atk ? M.red : mat("#3f6f82", { st: "#1f3f4c" });
  const Wp = 124 * k, Hp = 84 * k, cz = 6 * k;
  const prof = [[0, 9], [6, 16], [14, 21], [26, 24], [40, 25], [70, 24.5], [100, 23.5], [124, 22]].map(([u, z]) => [u * k, z * k]);
  const zAt = (u) => { u = Math.abs(u); for (let i = 1; i < prof.length; i++) if (u <= prof[i][0]) { const a = prof[i - 1], b = prof[i]; return a[1] + ((u - a[0]) / (b[0] - a[0])) * (b[1] - a[1]); } return prof[prof.length - 1][1]; };
  let s = contactShadow(o, 190 * k, 120 * k);
  s += box(o, -Wp - 6 * k, Wp + 6 * k, -Hp - 6 * k, Hp + 6 * k, 0, cz, cover, 1.6);
  // left outer page-edge face (−u, visible) and front page-edge faces (+v)
  const zL = zAt(Wp);
  s += `<polygon points="${pts([at(o, -Wp, -Hp, cz), at(o, -Wp, Hp, cz), at(o, -Wp, Hp, zL), at(o, -Wp, -Hp, zL)])}" fill="#efe9dc" stroke="#b8b0a1" stroke-width="1.4"/>`;
  for (const sg of [-1, 1]) {
    const front = [at(o, 0, Hp, cz), ...prof.map(([u, z]) => at(o, sg * u, Hp, z)), at(o, sg * Wp, Hp, cz)];
    s += `<polygon points="${pts(front)}" fill="#e9e2d3" stroke="#b8b0a1" stroke-width="1.4" stroke-linejoin="round"/>`;
    for (let i = 1; i <= 3; i++) { const zz = cz + ((zL - cz) * i) / 4; s += line3(o, [[sg * 16 * k, Hp, zz], [sg * Wp, Hp, zz]], "#d3cbbb", 1); }
  }
  // page surfaces
  for (const sg of [-1, 1]) {
    const surf = [...prof.map(([u, z]) => at(o, sg * u, -Hp, z)), ...prof.slice().reverse().map(([u, z]) => at(o, sg * u, Hp, z))];
    s += `<polygon points="${pts(surf)}" fill="${sg < 0 ? "#fffdf6" : "#f8f4ea"}" stroke="#b8b0a1" stroke-width="1.4" stroke-linejoin="round"/>`;
    // header band + ruled lines + a column rule
    const uu = [14, 40, 70, 100, 116].map((x) => x * k);
    const row = (vv, col, w = 1) => line3(o, uu.map((u) => [sg * u, vv, zAt(u) + 0.3]), col, w);
    s += row(-Hp + 14 * k, "#2aa3c9", 3 * k);
    for (let i = 0; i < 8; i++) s += row(-Hp + (30 + i * 16) * k, "#d8d0c0", 1.2);
    s += line3(o, [[sg * 84 * k, -Hp + 8 * k, zAt(84 * k) + 0.3], [sg * 84 * k, Hp - 8 * k, zAt(84 * k) + 0.3]], "#2aa3c9", 1.2);
    // ledger entries (little ink strokes)
    for (let i = 0; i < 7; i++) {
      const vv = -Hp + (24 + i * 16) * k, a = 18 + ((i * 37) % 30), b = 88 + ((i * 13) % 14);
      s += line3(o, [[sg * a * k, vv, zAt(a * k) + 0.4], [sg * (a + 30) * k, vv, zAt((a + 30) * k) + 0.4]], "#6d685e", 2.2 * k);
      s += line3(o, [[sg * b * k, vv, zAt(b * k) + 0.4], [sg * (b + 18) * k, vv, zAt((b + 18) * k) + 0.4]], "#1c1c1c", 2.2 * k);
    }
  }
  // ribbon bookmark
  s += line3(o, [[2 * k, -Hp + 4 * k, 10 * k], [6 * k, 10 * k, 12 * k], [3 * k, Hp + 2 * k, 10 * k], [6 * k, Hp + 14 * k, 2 * k]], "#2aa3c9", 5 * k);
  const anchors = { top: at(o, 0, 0, 70 * k), center: at(o, 0, 0, 20 * k), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-Wp - 6 * k, Wp + 6 * k, -Hp - 6 * k, Hp + 6 * k, 0, 26 * k]], center: anchors.center, glowR: 190 * k }), anchors };
}
export function dbLedger(o, opts = {}) {
  const p = opts.id ?? "db", atk = isAtk(opts);
  const m = atk ? M.red : M.blue, r = 74, h = 40, gap = 7;
  let s = contactShadow(o, 110, 80);
  for (let i = 0; i < 3; i++) {
    const z0 = i * (h + gap);
    s += cyl(o, 0, 0, r, z0, z0 + h, m, { sw: 1.8 });
    // little status lights on each disk front
    const pnt = at(o, 0, r, z0 + h / 2);
    s += `<circle cx="${f(pnt[0] + 30)}" cy="${f(pnt[1] - 6)}" r="4" fill="#ffffff" opacity="0.85"/><rect x="${f(pnt[0] - 40)}" y="${f(pnt[1] - 3)}" width="44" height="5" rx="2.5" fill="#ffffff" opacity="0.6" transform="rotate(-12 ${f(pnt[0] - 18)} ${f(pnt[1])})"/>`;
  }
  const top = 3 * h + 2 * gap;
  const lb = ledgerBook({ u: o.u, v: o.v }, { id: p + "-book", scale: 0.48, state: atk ? "attacker" : "normal" });
  // lift the small ledger onto the top disk
  s += `<g transform="translate(0,${f(-top * CE)})">${lb.svg}</g>`;
  const anchors = { top: at(o, 0, 0, top + 60), center: at(o, 0, 0, top / 2), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [{ cyl: [0, 0, r, 0, top] }], center: anchors.center, glowR: 160 }), anchors };
}

// =====================================================================================
// 服务器机柜 rack — 签名集群 / MPC 节点：三层服务器，每层指示灯
// opts.leds = ["green","green","green"]（"red"/"off"）, opts.units=3, opts.tag 机柜铭牌
// 可动：ID-led-0..2（KIT.led 变色），ID-act-0..2（小活动灯）
// =====================================================================================
export function rack(o, opts = {}) {
  const p = opts.id ?? "rack", atk = isAtk(opts);
  const cab = atk ? mat("#b8392f") : M.ink;
  const W = 170, D = 150, H = 340, u0 = -W / 2, v0 = -D / 2, v1 = D / 2, n = opts.units ?? 3;
  const leds = opts.leds ?? Array(n).fill("green");
  let s = contactShadow(o, 150, 120);
  for (const [a, b] of [[u0 + 6, v1 - 20], [W / 2 - 22, v1 - 20]]) s += box(o, a, a + 16, b, b + 14, 0, 10, M.dark, 1.2);
  s += box(o, u0, W / 2, v0, v1, 10, H, cab, 2);
  // top vents
  s += G_(faceTop(o, u0 + 30, v0 + 30, H), Array.from({ length: 6 }, (_, i) => `<rect x="${i * 18}" y="0" width="8" height="${D - 60}" rx="4" fill="${darken(cab.t, 0.25)}"/>`).join(""));
  // side vents (−u)
  s += G_(faceU(o, u0, v0 + 20, H - 30), Array.from({ length: 9 }, (_, i) => `<rect x="${i * 12}" y="0" width="5" height="70" rx="2.5" fill="${darken(cab.f, 0.3)}"/><rect x="${i * 12}" y="${H - 150}" width="5" height="70" rx="2.5" fill="${darken(cab.f, 0.3)}"/>`).join(""));
  // front frame + recess
  s += G_(faceV(o, u0, v1, H), `<rect x="10" y="12" width="${W - 20}" height="${H - 34}" rx="4" fill="#141518" stroke="${lighten(cab.s, 0.15)}" stroke-width="2"/>` +
    Array.from({ length: 16 }, (_, i) => `<circle cx="17" cy="${26 + i * 18}" r="1.6" fill="#5a5e65"/><circle cx="${W - 17}" cy="${26 + i * 18}" r="1.6" fill="#5a5e65"/>`).join(""));
  // server units, each a real slab sticking out of the rack
  const uh = 66, gap = (H - 50 - n * uh) / (n + 1);
  const unitM = { f: "#c9cdd2", s: "#dfe2e5", t: "#eef0f2", st: "#5a5e65" };
  for (let i = 0; i < n; i++) {
    const zt = H - 26 - gap - i * (uh + gap), zb = zt - uh;
    s += box(o, u0 + 24, W / 2 - 24, v1 - 8, v1 + 8, zb, zt, unitM, 1.4);
    let fp = "";
    for (let k = 0; k < 7; k++) fp += `<rect x="${10 + k * 7}" y="12" width="3.5" height="${uh - 24}" rx="1.7" fill="#9aa0a8"/>`;
    for (let k = 0; k < 3; k++) fp += `<rect x="${56 + k * 13}" y="10" width="10" height="${uh - 20}" rx="2" fill="#b3b8bf" stroke="#7d828a" stroke-width="1"/><rect x="${58 + k * 13}" y="${uh - 18}" width="6" height="3" rx="1.5" fill="#5a5e65"/>`;
    fp += `<rect x="2" y="6" width="4" height="${uh - 12}" rx="2" fill="#7d828a"/><rect x="${W - 54}" y="6" width="4" height="${uh - 12}" rx="2" fill="#7d828a"/>`;
    fp += ledSvg(`${p}-led-${i}`, W - 66, 22, 6.5, leds[i]) + ledSvg(`${p}-act-${i}`, W - 66, 44, 3.2, leds[i] === "off" ? "off" : "green");
    s += G_(faceV(o, u0 + 24, v1 + 8, zt), fp);
  }
  if (opts.tag) s += G_(faceV(o, u0, v1, H), `<rect x="${W / 2 - 44}" y="-2" width="88" height="14" rx="3" fill="#e9ebee"/>` + txt(W / 2, 9.5, opts.tag, { size: 10, anchor: "middle", mono: true, weight: 700, fill: "#2b2d31" }));
  const anchors = { top: at(o, 0, 0, H + 30), front: at(o, 0, v1, H / 2), center: at(o, 0, 0, H / 2), ground: at(o), leds: Array.from({ length: n }, (_, i) => `${p}-led-${i}`) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0, W / 2, v0, v1, 0, H]], center: anchors.center, glowR: 190 }), anchors };
}

// 加密机 HSM — 厚重小机箱：LCD + 小键盘 + 盾形徽记 + 防拆封条
export function hsm(o, opts = {}) {
  const p = opts.id ?? "hsm", atk = isAtk(opts);
  const m = atk ? mat("#c9463c") : { f: "#575b62", s: "#3f4248", t: "#6c7078", st: "#1d1f23" };
  const W = 160, D = 120, H = 84, u0 = -W / 2, v1 = D / 2;
  let s = contactShadow(o, 130, 90);
  for (const a of [u0 + 8, W / 2 - 22]) s += box(o, a, a + 14, v1 - 18, v1 - 4, 0, 6, M.dark, 1);
  s += rbox(o, u0, W / 2, -D / 2, v1, 6, H, 8, m, { sw: 2 });
  // top: shield emblem + grooves
  s += G_(faceTop(o, u0 + 16, -D / 2 + 16, H), `<path d="M30 6Q46 0 62 6V30Q60 46 46 54Q32 46 30 30Z" fill="${lighten(m.t, 0.15)}" stroke="${m.st}" stroke-width="1.5"/>` +
    [0, 1, 2, 3].map((i) => `<rect x="${80 + i * 14}" y="6" width="6" height="${D - 44}" rx="3" fill="${darken(m.t, 0.2)}"/>`).join(""));
  // front panel
  let fp = `<rect x="10" y="12" width="64" height="30" rx="3" fill="#0f2a33" stroke="#141518" stroke-width="1.5"/>` + txt(42, 32, "HSM", { size: 15, anchor: "middle", mono: true, fill: "#9ad9ee", weight: 700 });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) fp += `<rect x="${86 + c * 13}" y="${10 + r * 11}" width="10" height="8" rx="1.5" fill="#d9dcdf" stroke="#5a5e65" stroke-width="0.6"/>`;
  fp += ledSvg(p + "-led-0", 136, 16, 4.5, opts.led ?? "green");
  fp += `<rect x="128" y="34" width="22" height="16" rx="2" fill="#c3c8ce" stroke="#7d828a" stroke-width="0.8"/><path d="M132 38H146M132 42H146M132 46H142" stroke="#7d828a" stroke-width="1"/>`;
  fp += `<rect x="10" y="52" width="64" height="6" rx="3" fill="${darken(m.s, 0.3)}"/>`;
  s += G_(faceV(o, u0, v1, H - 4), fp);
  const anchors = { top: at(o, 0, 0, H + 30), center: at(o, 0, 0, H / 2), ground: at(o), led: p + "-led-0" };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0, W / 2, -D / 2, v1, 0, H]], center: anchors.center, badgeR: 26, glowR: 140 }), anchors };
}

// RPC 节点 — 小服务器 + 天线 + 信号弧（ID-wave-0..2）
export function rpc(o, opts = {}) {
  const p = opts.id ?? "rpc", atk = isAtk(opts);
  const m = atk ? M.red : { f: "#eceef0", s: "#d3d7dc", t: "#f7f8f9", st: "#8d939b" };
  const W = 120, D = 110, H = 130, u0 = -W / 2, v1 = D / 2;
  let s = contactShadow(o, 110, 90);
  s += rbox(o, u0, W / 2, -D / 2, v1, 0, H, 8, m, { sw: 1.8 });
  let fp = "";
  for (let r = 0; r < 4; r++) fp += `<rect x="12" y="${14 + r * 10}" width="${W - 24}" height="5" rx="2.5" fill="${darken(m.s, 0.18)}"/>`;
  fp += `<rect x="12" y="62" width="${W - 24}" height="40" rx="5" fill="#2b2d31"/>` + txt(W / 2, 87, "RPC", { size: 15, mono: true, anchor: "middle", fill: "#9ad9ee", weight: 700 });
  fp += ledSvg(p + "-led-0", 22, H - 16, 4, opts.led ?? "green") + `<circle cx="${W - 22}" cy="${H - 16}" r="7" fill="#d3d7dc" stroke="#5a5e65" stroke-width="1.5"/><path d="M${W - 22} ${H - 21}V${H - 16}" stroke="#5a5e65" stroke-width="1.6"/>`;
  s += G_(faceV(o, u0, v1, H), fp);
  // antenna
  s += cyl(o, 30, -26, 9, H, H + 10, M.ink, { seg: 16, sw: 1.2 }) + cyl(o, 30, -26, 3, H + 10, H + 100, M.ink, { seg: 12, sw: 1 });
  s += sphere(p + "-tip", o, 30, -26, H + 104, 8, M.blue);
  const tip = at(o, 30, -26, H + 104);
  let waves = "";
  for (let i = 0; i < 3; i++) {
    const r = 22 + i * 18, a = 38 * DEG;
    const arc = (sg) => `M${f(tip[0] + sg * r * Math.cos(a))} ${f(tip[1] - r * Math.sin(a))}A${r} ${r} 0 0 ${sg > 0 ? 1 : 0} ${f(tip[0] + sg * r * Math.cos(a))} ${f(tip[1] + r * Math.sin(a))}`;
    waves += `<path id="${p}-wave-${i}" d="${arc(1)}${arc(-1)}" fill="none" stroke="#2aa3c9" stroke-width="4" stroke-linecap="round" opacity="${0.95 - i * 0.22}"/>`;
  }
  s += waves;
  const anchors = { top: at(o, 0, 0, H + 150), center: at(o, 0, 0, H / 2), tip, ground: at(o), led: p + "-led-0", waves: [0, 1, 2].map((i) => `${p}-wave-${i}`) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[u0, W / 2, -D / 2, v1, 0, H], [26, 34, -30, -22, H, H + 110]], center: anchors.center, badgeR: 26, glowR: 130 }), anchors };
}

// =====================================================================================
// 关卡 checkpoint — 岗亭 + 道闸（红白横杆）+ 门牌编号；路沿 u 方向，横杆沿 +v 横跨道路
// opts: n="④"（门牌）, armUp=false, state normal（默认绿色地光）/ broken
// 可动：ID-arm（KIT.arm 抬杆 / 落杆）, ID-plate（门牌底板）, ID-plate-n（门牌字）
// anchors: top（门牌上方，放名字标签）, plate, road（路中心）, armTip
// =====================================================================================
export function checkpoint(o, opts = {}) {
  const p = opts.id ?? "gate", st = opts.state ?? "normal", broken = st === "broken", atk = isAtk(opts);
  const bu0 = -52, bu1 = 52, bv0 = -196, bv1 = -96, bh = 176;
  const wall = atk ? mat("#f2d6d3", { st: "#c23a30" }) : M.white;
  let s = contactShadow(o, 120, 80, 0, -146);
  // booth base, walls, details
  s += box(o, bu0 - 8, bu1 + 8, bv0 - 8, bv1 + 8, 0, 8, M.plinth, 1.4);
  s += box(o, bu0, bu1, bv0, bv1, 8, bh, wall, 1.8);
  const band = atk ? "#e0453a" : "#2aa3c9";
  // +v face: big window + band
  s += G_(faceV(o, bu0, bv1, bh), `<rect x="0" y="6" width="${bu1 - bu0}" height="12" fill="${band}"/>
    <rect x="12" y="34" width="${bu1 - bu0 - 24}" height="66" rx="3" fill="#cfe8f1" stroke="#8d939b" stroke-width="3"/>
    <path d="M${(bu1 - bu0) / 2} 34V100" stroke="#8d939b" stroke-width="3"/><path d="M20 44L38 40M20 56L52 48" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <rect x="8" y="104" width="${bu1 - bu0 - 16}" height="6" rx="2" fill="#d6d0c4"/>`);
  // −u face: door with small window + band
  s += G_(faceU(o, bu0, bv0, bh), `<rect x="0" y="6" width="${bv1 - bv0}" height="12" fill="${band}"/>
    <rect x="30" y="38" width="44" height="${bh - 46}" rx="2" fill="#ebe6dc" stroke="#8d939b" stroke-width="2.4"/>
    <rect x="38" y="48" width="28" height="30" rx="2" fill="#cfe8f1" stroke="#8d939b" stroke-width="2"/><circle cx="66" cy="${bh * 0.55}" r="3" fill="#5a5e65"/>`);
  // roof
  s += box(o, bu0 - 12, bu1 + 12, bv0 - 12, bv1 + 12, bh, bh + 14, M.dark, 1.6);
  s += box(o, bu0 - 4, bu1 + 4, bv0 - 4, bv1 + 4, bh + 14, bh + 20, { f: "#5a5852", s: "#45433f", t: "#6c6a64", st: "#24231f" }, 1.2);
  // number plate on two posts above the roof
  const pv = (bv0 + bv1) / 2 + 8, pz0 = bh + 30, pz1 = bh + 92, pw = 50;
  s += box(o, -30, -26, pv - 2, pv + 2, bh + 20, pz0, M.dark, 1) + box(o, 26, 30, pv - 2, pv + 2, bh + 20, pz0, M.dark, 1);
  s += box(o, -pw, pw, pv - 4, pv + 4, pz0, pz1, broken ? M.red : M.white, 1.6);
  const plateFill = broken ? "#e0453a" : "#ffffff", plateText = broken ? "#ffffff" : C.ink;
  s += G_(faceV(o, -pw, pv + 4, pz1), `<rect id="${p}-plate" x="0" y="0" width="${pw * 2}" height="${pz1 - pz0}" fill="${plateFill}" stroke="${broken ? "#a8322a" : "#b8b0a1"}" stroke-width="1.6"/>
    <rect x="5" y="5" width="${pw * 2 - 10}" height="${pz1 - pz0 - 10}" fill="none" stroke="${broken ? "#ffffff" : "#2aa3c9"}" stroke-width="2"/>
    <text id="${p}-plate-n" x="${pw}" y="${(pz1 - pz0) / 2 + 15}" ${FONT} font-size="40" font-weight="900" fill="${plateText}" text-anchor="middle">${opts.n ?? "①"}</text>`);
  // barrier: housing + arm (rotator in the u=0 plane) + rest post
  const hv0 = -88, hv1 = -58, pzv = -73, pzz = 66, L = 262;
  s += box(o, -16, 16, hv0, hv1, 0, 72, M.white, 1.6) + box(o, -18, 18, hv0 - 2, hv1 + 2, 72, 80, M.red, 1.4);
  s += G_(faceU(o, -16, hv0, 60), `<rect x="6" y="0" width="${hv1 - hv0 - 12}" height="18" rx="2" fill="#e3ddd1" stroke="#b8b0a1" stroke-width="1"/>`);
  // rest post at the far side of the road
  s += box(o, -7, 7, pzv + L - 12, pzv + L + 2, 0, 58, M.white, 1.4) + G_(faceU(o, -7, pzv + L - 12, 58), `<path d="M0 0H14V6H0Z" fill="#e0453a"/><path d="M2 -2L7 -10L12 -2" fill="none" stroke="#5a5e65" stroke-width="3"/>`);
  let arm = `<rect x="-46" y="-12" width="40" height="24" rx="3" fill="#3b3e44" stroke="#1d1f23" stroke-width="1.4"/>`;
  arm += `<rect x="0" y="-7" width="${L}" height="14" rx="7" fill="#ffffff" stroke="#8d939b" stroke-width="1.6"/>`;
  for (let x = 18; x < L - 10; x += 52) arm += `<rect x="${x}" y="-7" width="26" height="14" fill="#e0453a"/>`;
  arm += `<rect x="0" y="-7" width="${L}" height="14" rx="7" fill="none" stroke="#8d939b" stroke-width="1.6"/><circle cx="0" cy="0" r="9" fill="#5a5e65" stroke="#1d1f23" stroke-width="1.6"/><circle cx="0" cy="0" r="3" fill="#d4d7db"/>`;
  const mArm = frameU(o, -18, pzv, pzz);
  const a0 = opts.armUp ? -78 : 0;
  s += `<use href="#${p}-arm" transform="translate(${f(10 * U[0])},${f(10 * U[1])})" style="filter:brightness(0.72)"/>`;
  s += rotator(p + "-arm", mArm, 0, 0, a0, arm, `data-up="-78"`);
  const anchors = { top: at(o, 0, pv, pz1 + 28), plate: at(o, 0, pv + 4, (pz0 + pz1) / 2), road: at(o, 0, 40, 0), center: at(o, 0, -146, bh / 2), armTip: applyM(mArm, L, 0), ground: at(o), arm: p + "-arm" };
  const wire = [[bu0, bu1, bv0, bv1, 0, bh], [bu0 - 12, bu1 + 12, bv0 - 12, bv1 + 12, bh, bh + 20], [-pw, pw, pv - 4, pv + 4, pz0, pz1], [-16, 16, hv0, hv1, 0, 80], [-18, -10, pzv, pzv + L, pzz - 7, pzz + 7]];
  // road under the barrier (runs along u); opts.road=false to omit (e.g. when the scene draws one long road)
  const road = opts.road === false ? "" : flat(o, [[-200, -86], [200, -86], [200, 210], [-200, 210]], 0, "#f8f6f1", "#dcd5c8", 2) +
    line3(o, [[-190, 62], [-120, 62]], "#d3ccbf", 4) + line3(o, [[-60, 62], [10, 62]], "#d3ccbf", 4) + line3(o, [[70, 62], [140, 62]], "#d3ccbf", 4) +
    flat(o, [[-40, -84], [-30, -84], [-30, 208], [-40, 208]], 0.5, "#ffffff", "none");
  return { svg: shell(p, o, { ...opts, glow: opts.glow ?? true }, { under: road, solid: s, wire, center: at(o, 0, -40, 90), glowR: 210, glowAt: { u: o.u, v: o.v + 40 }, badgeR: 36 }), anchors };
}

// =====================================================================================
// 广播塔 tower — 格构发射塔 + 信号弧（ID-wave-0..3）
// =====================================================================================
export function tower(o, opts = {}) {
  const p = opts.id ?? "tower", atk = isAtk(opts);
  const H = 330, b = 62, t = 12, nSeg = 6;
  const ink = atk ? "#c23a30" : "#4a4d53", back = atk ? "#e8a49e" : "#b3b0a8";
  let s = contactShadow(o, 120, 100);
  s += box(o, -b - 14, b + 14, -b - 14, b + 14, 0, 8, M.plinth, 1.4);
  const cr = (z) => b + (t - b) * (z / H);
  const corner = (k, z) => { const r = cr(z); return [[-r, -r], [r, -r], [r, r], [-r, r]][k].concat([z]); };
  const faceLines = (k1, k2, col, w) => {
    let d = "";
    for (let i = 0; i < nSeg; i++) {
      const z0 = (H * i) / nSeg + 8, z1 = (H * (i + 1)) / nSeg + 8;
      const A = corner(k1, z0), B = corner(k2, z0), C2 = corner(k1, z1), D2 = corner(k2, z1);
      d += line3(o, [A, D2], col, w) + line3(o, [B, C2], col, w) + line3(o, [C2, D2], col, w);
    }
    return d;
  };
  // back faces (v0 face: corners 0-1, u1 face: corners 1-2) then legs then front faces
  s += faceLines(0, 1, back, 2) + faceLines(1, 2, back, 2);
  for (const k of [1]) s += line3(o, [corner(k, 8), corner(k, H + 8)], back, 4);
  for (const k of [0, 2, 3]) s += line3(o, [corner(k, 8), corner(k, H + 8)], ink, 5.5);
  s += faceLines(3, 0, ink, 2.6) + faceLines(2, 3, ink, 2.6);
  // platform + mast + tip
  s += box(o, -cr(250) - 10, cr(250) + 10, -cr(250) - 10, cr(250) + 10, 250, 256, M.dark, 1.2);
  s += cyl(o, 0, 0, 4, H + 8, H + 80, M.ink, { seg: 12, sw: 1 });
  s += sphere(p + "-tip", o, 0, 0, H + 86, 10, atk ? M.red : M.blue);
  for (const zz of [H + 30, H + 55]) s += line3(o, [[-14, 0, zz], [14, 0, zz]], ink, 3);
  const tip = at(o, 0, 0, H + 86);
  let waves = "";
  for (let i = 0; i < 4; i++) {
    const r = 30 + i * 24, a = 34 * DEG;
    const arc = (sg) => `M${f(tip[0] + sg * r * Math.cos(a))} ${f(tip[1] - r * Math.sin(a))}A${r} ${r} 0 0 ${sg > 0 ? 1 : 0} ${f(tip[0] + sg * r * Math.cos(a))} ${f(tip[1] + r * Math.sin(a))}`;
    waves += `<path id="${p}-wave-${i}" d="${arc(1)}${arc(-1)}" fill="none" stroke="${atk ? "#e0453a" : "#2aa3c9"}" stroke-width="5" stroke-linecap="round" opacity="${f(1 - i * 0.2)}"/>`;
  }
  s += waves;
  const anchors = { top: at(o, 0, 0, H + 190), tip, center: at(o, 0, 0, H / 2), ground: at(o), waves: [0, 1, 2, 3].map((i) => `${p}-wave-${i}`) };
  return { svg: shell(p, o, opts, { solid: s, wire: [{ path: wirePyramid(o, b, t, 8, H + 8) }, [-4, 4, -4, 4, H + 8, H + 90]], center: anchors.center, glowR: 170 }), anchors };
}
function wirePyramid(o, b, t, z0, z1) {
  const c = (r, z) => [[-r, -r], [r, -r], [r, r], [-r, r]].map(([u, v]) => at(o, u, v, z));
  const B = c(b, z0), T = c(t, z1);
  let d = "";
  for (const R of [B, T]) d += `M${pts([R[0]])}L${pts([R[1]])}L${pts([R[2]])}L${pts([R[3]])}Z`;
  for (let i = 0; i < 4; i++) d += `M${pts([B[i]])}L${pts([T[i]])}`;
  return d;
}

// =====================================================================================
// 区块链 chain — n 个区块沿 +u 排开，相邻用铁链环连接
// opts: n=4, labels=["#1","#2",...], blockStates=["normal",...,"attacker"]
// 可动：ID-b0..b{n-1}（每个区块组），ID-l0..（链环组）
// anchors: top, blocks[]（每块顶部）, last
// =====================================================================================
export function chain(o, opts = {}) {
  const p = opts.id ?? "chain", n = opts.n ?? 4, sp = 180, cs = 100;
  const states = opts.blockStates ?? Array(n).fill(opts.state === "attacker" ? "attacker" : "normal");
  const blockM = (st) => (st === "attacker" ? M.red : { f: "#5cc0e0", s: "#3a9ec2", t: "#9ad9ee", st: "#1f7896" });
  let s = "";
  const bc = (i) => ({ u: o.u + (i - (n - 1) / 2) * sp, v: o.v });
  const link = (i) => {
    const a = bc(i), uA = a.u + cs / 2 - 6, uB = a.u + sp - cs / 2 + 6, mid = { u: (uA + uB) / 2, v: o.v };
    const z = cs / 2;
    const ring = (rx, ry) => `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="none" stroke="#4b4f56" stroke-width="9"/><ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="none" stroke="#b9bdc3" stroke-width="3.5"/>`;
    return `<g id="${p}-l${i}">${G_(faceTop(mid, -22, 0, z), ring(26, 11))}${G_(faceV(mid, 22, 0, z), ring(26, 11))}</g>`;
  };
  for (let i = n - 1; i >= 0; i--) {
    const c = bc(i), m = blockM(states[i]);
    let b = contactShadow(c, 90, 70) + rbox(c, -cs / 2, cs / 2, -cs / 2, cs / 2, 0, cs, 10, m, { sw: 2 });
    b += G_(faceV(c, -cs / 2 + 10, cs / 2, cs - 10), `<rect x="0" y="0" width="${cs - 20}" height="22" rx="4" fill="#ffffff" opacity="0.9"/>` +
      txt((cs - 20) / 2, 17, (opts.labels ?? [])[i] ?? `#${i + 1}`, { size: 15, anchor: "middle", mono: true, weight: 800, fill: states[i] === "attacker" ? "#a8322a" : "#17809f" }) +
      [0, 1, 2].map((k) => `<rect x="4" y="${34 + k * 14}" width="${[62, 48, 56][k]}" height="6" rx="3" fill="#ffffff" opacity="0.7"/>`).join(""));
    b += G_(faceTop(c, -cs / 2 + 16, -cs / 2 + 16, cs), Array.from({ length: 9 }, (_, k) => `<rect x="${(k % 3) * 24}" y="${Math.floor(k / 3) * 24}" width="16" height="16" rx="3" fill="#ffffff" opacity="${0.35 + ((k * 7) % 5) * 0.1}"/>`).join(""));
    s += `<g id="${p}-b${i}">${b}</g>`;
    if (i > 0) s += link(i - 1);
  }
  const blocks = Array.from({ length: n }, (_, i) => at(bc(i), 0, 0, cs + 20));
  const anchors = { top: at(o, 0, 0, cs + 60), blocks, last: blocks[n - 1], center: at(o, 0, 0, cs / 2), ground: at(o) };
  const wire = Array.from({ length: n }, (_, i) => { const du = (i - (n - 1) / 2) * sp; return [du - cs / 2, du + cs / 2, -cs / 2, cs / 2, 0, cs]; });
  return { svg: shell(p, o, opts, { solid: s, wire, center: anchors.center, glowR: 260 }), anchors };
}

// =====================================================================================
// 浏览器窗口 browserWin（Safe{Wallet} 网页那种）— 底座 + 立板 + 仿射贴网页 380×300
// opts.title, opts.page（自定义 SVG，本地 380×300）, opts.page2（替换内容，初始隐藏）
// 可动：ID-page / ID-page2
// =====================================================================================
export function browserWin(o, opts = {}) {
  const p = opts.id ?? "brw", atk = isAtk(opts);
  let s = contactShadow(o, 230, 90);
  s += box(o, -210, 210, -50, 50, 0, 14, M.plinth) + box(o, -190, 190, -14, 14, 14, 314, atk ? mat("#f6dcd9", { st: "#c23a30" }) : M.white);
  const title = opts.title ?? "Safe{Wallet}";
  const chrome = `<rect x="0" y="0" width="380" height="300" rx="10" fill="#ffffff" stroke="${atk ? "#e0453a" : "#b8b0a1"}" stroke-width="2"/>
    <path d="M0 10a10 10 0 0 1 10-10h360a10 10 0 0 1 10 10v32H0z" fill="#ece7dd"/>
    <circle cx="20" cy="21" r="6" fill="#d9d3c7"/><circle cx="40" cy="21" r="6" fill="#d9d3c7"/><circle cx="60" cy="21" r="6" fill="#d9d3c7"/>
    <rect x="84" y="10" width="280" height="22" rx="11" fill="#ffffff"/>
    <path d="M96 17v-2a4 4 0 0 1 8 0v2M94 17h12v9h-12z" fill="none" stroke="#7d776b" stroke-width="1.8"/>
    <text x="114" y="27" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#5f5a50">${title}</text>`;
  const defPage = `<rect x="12" y="54" width="70" height="234" rx="8" fill="#e8f3f7"/>
    <rect x="24" y="70" width="46" height="10" rx="5" fill="#9fd3e5"/><rect x="24" y="92" width="46" height="10" rx="5" fill="#c9e6f0"/><rect x="24" y="114" width="46" height="10" rx="5" fill="#c9e6f0"/>
    <rect x="96" y="56" width="270" height="134" rx="10" fill="#faf8f4" stroke="#ddd6c9" stroke-width="2"/>
    <text x="112" y="92" ${FONT} font-size="26" font-weight="900" fill="#1c1c1c">${opts.heading ?? "新交易"}</text>
    <rect x="112" y="110" width="200" height="12" rx="6" fill="#ddd6c9"/><rect x="112" y="134" width="160" height="12" rx="6" fill="#ddd6c9"/><rect x="112" y="158" width="220" height="12" rx="6" fill="#ddd6c9"/>
    <rect x="96" y="206" width="270" height="62" rx="12" fill="#1d93ba"/>
    <text x="231" y="247" text-anchor="middle" ${FONT} font-size="28" font-weight="900" fill="#ffffff">${opts.button ?? "发起签名"}</text>`;
  s += G_(faceV(o, -190, 14, 314), chrome + `<g id="${p}-page">${opts.page ?? defPage}</g><g id="${p}-page2" opacity="0">${opts.page2 ?? ""}</g>`);
  const anchors = { top: at(o, 0, 14, 352), center: at(o, 0, 0, 164), ground: at(o), pageM: frameV(o, -190, 14, 314), page: p + "-page", page2: p + "-page2" };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-190, 190, -14, 14, 14, 314], [-210, 210, -50, 50, 0, 14]], center: anchors.center, badgeR: 38, glowR: 260 }), anchors };
}

// 云存储桶 bucket（S3）— 上宽下窄的桶 + 提手 + 露出的文件
export function bucket(o, opts = {}) {
  const p = opts.id ?? "s3", atk = isAtk(opts);
  const m = atk ? mat("#f6c9c4", { st: "#c23a30" }) : M.tealLight, stc = atk ? "#c23a30" : "#2aa3c9";
  const r0 = 56, r1 = 76, H = 112;
  let s = contactShadow(o, 100, 80);
  s += frustum(o, 0, 0, r0, r1, 0, H, m, { sw: 2.4, top: false });
  // rim + interior
  s += flat(o, circlePlan(0, 0, r1, 48), H, "#a9d8e8", stc, 2.4);
  const rimC = at(o, 0, 0, H);
  // files sticking out (clipped above the front rim)
  const files = [[-26, -14, -10], [10, -24, 8], [30, 6, 16]].map(([du, dv, rot], i) => {
    const fm = frameV(o, du - 22, dv, H + 46 - i * 6);
    return `<g transform="${matStr(fm)}"><g transform="rotate(${rot} 22 40)"><path d="M0 0H32L44 12V80H0Z" fill="#ffffff" stroke="#8d939b" stroke-width="2"/><path d="M32 0V12H44" fill="none" stroke="#8d939b" stroke-width="2"/>
      ${txt(22, 34, "JS", { size: 14, mono: true, anchor: "middle", fill: stc, weight: 800 })}<rect x="8" y="44" width="28" height="4" rx="2" fill="#d3d7dc"/><rect x="8" y="54" width="22" height="4" rx="2" fill="#d3d7dc"/></g></g>`;
  }).join("");
  // clip region = rim ellipse ∪ everything above the rim's centre line
  s += `<defs><clipPath id="${p}-fc"><polygon points="${pts(circlePlan(0, 0, r1 - 3, 48).map((q) => at(o, q[0], q[1], H)))}"/><rect x="${f(rimC[0] - 200)}" y="${f(rimC[1] - 400)}" width="400" height="400"/></clipPath></defs><g clip-path="url(#${p}-fc)">${files}</g>`;
  // front rim band drawn again over the files' feet
  const frontRim = circlePlan(0, 0, r1, 48).map((q) => at(o, q[0], q[1], H)).filter((_, i, arr) => arr[i][1] >= rimC[1] - 0.01);
  s += `<polyline points="${pts(frontRim.sort((a, b) => a[0] - b[0]))}" fill="none" stroke="${stc}" stroke-width="3"/>`;
  // handle (semi-ellipse in the v=0 plane)
  s += G_(faceV(o, 0, 0, H), `<path d="M${-r1 + 2} 0C${-r1 + 10} -70 ${r1 - 10} -70 ${r1 - 2} 0" fill="none" stroke="${stc}" stroke-width="5" stroke-linecap="round"/>`);
  s += G_(faceV(o, -24, r0 + (r1 - r0) * 0.45, H * 0.45), txt(24, 0, "S3", { size: 28, anchor: "middle", fill: stc }));
  const anchors = { top: at(o, 0, 0, H + 100), center: at(o, 0, 0, H / 2), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [{ cyl: [0, 0, r1, 0, H] }], center: anchors.center, badgeR: 28, glowR: 150 }), anchors };
}

// =====================================================================================
// 员工工位 desk — 桌子 + 显示器（屏幕插槽 148×88）+ 键盘 + 椅子 + 杯子
// 手机 phone — 斜靠在小支架上，屏幕插槽 76×150
// =====================================================================================
export function desk(o, opts = {}) {
  const p = opts.id ?? "desk", atk = isAtk(opts);
  const top = atk ? mat("#f2d6d3", { st: "#c23a30" }) : { f: "#e9d9c2", s: "#d3bea0", t: "#f4e7d4", st: "#9a8466" };
  const leg = M.dark, zt = 104;
  let s = contactShadow(o, 210, 150, 0, 40);
  for (const [a, b] of [[120, -66], [-128, -66]]) s += box(o, a, a + 8, b, b + 8, 0, zt, leg, 1);
  s += box(o, 120, 128, 58, 66, 0, zt, leg, 1);
  s += box(o, -130, 130, -70, 70, zt, zt + 10, top, 1.6);
  s += box(o, -128, -120, 58, 66, 0, zt, leg, 1);
  // monitor
  s += box(o, -30, 30, -52, -26, zt + 10, zt + 13, M.ink, 1) + box(o, -5, 5, -48, -40, zt + 13, zt + 60, M.ink, 1);
  s += box(o, -84, 84, -46, -38, zt + 50, zt + 160, M.ink, 1.6);
  const SW = 148, SH = 88;
  s += G_(faceV(o, -84, -38, zt + 160), `<rect x="0" y="0" width="168" height="110" rx="4" fill="#1d1f23"/>
    <defs><clipPath id="${p}-sc"><rect x="0" y="0" width="${SW}" height="${SH}" rx="2"/></clipPath></defs>
    <g transform="translate(10,9)" clip-path="url(#${p}-sc)"><rect x="0" y="0" width="${SW}" height="${SH}" fill="#ffffff"/>
    <g id="${p}-scr">${opts.screen ?? `<rect x="0" y="0" width="${SW}" height="16" fill="#ece7dd"/><rect x="8" y="26" width="90" height="8" rx="4" fill="#ddd6c9"/><rect x="8" y="42" width="120" height="8" rx="4" fill="#ddd6c9"/><rect x="8" y="58" width="70" height="8" rx="4" fill="#ddd6c9"/>`}</g>
    <g id="${p}-scr2" opacity="0">${opts.screen2 ?? ""}</g></g>`);
  // keyboard, mouse, mug
  s += box(o, -54, 34, 2, 30, zt + 10, zt + 13, { f: "#e3e6e9", s: "#c6cbd1", t: "#f4f5f6", st: "#8d939b" }, 1);
  s += G_(faceTop(o, -50, 5, zt + 13), Array.from({ length: 36 }, (_, i) => `<rect x="${(i % 12) * 7}" y="${Math.floor(i / 12) * 7}" width="5" height="5" rx="1" fill="#c9cdd2"/>`).join(""));
  s += rbox(o, 50, 66, 8, 20, zt + 10, zt + 15, 5, M.chrome, { sw: 1 });
  s += cyl(o, 96, -20, 11, zt + 10, zt + 36, M.blue, { seg: 24, sw: 1.4 }) + flat(o, circlePlan(96, -20, 8, 24), zt + 36, "#5b3a22");
  // chair (in front of the desk, facing it)
  const c = { u: o.u - 10, v: o.v + 120 };
  for (const a of [0, 72, 144, 216, 288]) { const r = a * DEG; s += line3(c, [[0, 0, 10], [42 * Math.cos(r), 42 * Math.sin(r), 6]], "#2b2d31", 5); }
  for (const a of [0, 72, 144, 216, 288]) { const r = a * DEG; const q = at(c, 42 * Math.cos(r), 42 * Math.sin(r), 3); s += `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="4.5" fill="#1d1f23"/>`; }
  s += cyl(c, 0, 0, 4, 10, 52, M.chrome, { seg: 12, sw: 1 });
  s += rbox(c, -36, 36, -34, 34, 52, 62, 10, M.ink, { sw: 1.6 });
  s += box(c, -32, 32, 34, 42, 62, 140, M.ink, 1.6);
  s += G_(faceV(c, -32, 42, 136), `<rect x="8" y="8" width="48" height="56" rx="8" fill="${lighten(M.ink.s, 0.1)}"/>`);
  const anchors = { top: at(o, 0, -42, zt + 200), screen: at(o, 0, -38, zt + 110), center: at(o, 0, 0, zt), chair: at(c, 0, 0, 60), ground: at(o), scr: p + "-scr", scr2: p + "-scr2" };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-130, 130, -70, 70, 0, zt + 10], [-84, 84, -46, -38, zt + 50, zt + 160], [-46, 26, 86, 162, 0, 140]], center: anchors.center, glowR: 240 }), anchors };
}
export function phone(o, opts = {}) {
  const p = opts.id ?? "phone", atk = isAtk(opts);
  const W = 86, Hh = 172, tilt = 16;
  let s = contactShadow(o, 80, 50);
  // dock
  s += wedge(o, -54, 54, -34, 24, 0, 22, M.ink, "+v", 10);
  const topV = -6 - Hh * Math.sin(tilt * DEG), topZ = 14 + Hh * Math.cos(tilt * DEG);
  const m = frameTilt(o, -W / 2, topV, topZ, tilt);
  const body = (fill, st) => `<rect x="0" y="0" width="${W}" height="${Hh}" rx="14" fill="${fill}" stroke="${st}" stroke-width="1.6"/>`;
  for (let i = 8; i >= 1; i--) { const off = [-i * Math.cos(tilt * DEG) * V[0], -i * Math.cos(tilt * DEG) * V[1] - i * Math.sin(tilt * DEG) * CE]; s += `<g transform="translate(${f(off[0])},${f(off[1])})">${G_(matStr(m), body(atk ? "#c23a30" : "#7d828a", atk ? "#a8322a" : "#4b4f56"))}</g>`; }
  const SW = 76, SH = 150;
  s += G_(matStr(m), body(atk ? "#e8574c" : "#26272a", "#141518") + `<defs><clipPath id="${p}-sc"><rect x="0" y="0" width="${SW}" height="${SH}" rx="9"/></clipPath></defs>
    <g transform="translate(5,11)" clip-path="url(#${p}-sc)"><rect x="0" y="0" width="${SW}" height="${SH}" fill="#ffffff"/>
    <g id="${p}-scr">${opts.screen ?? `<rect x="0" y="0" width="${SW}" height="26" fill="#ece7dd"/><rect x="8" y="40" width="60" height="7" rx="3.5" fill="#ddd6c9"/><rect x="8" y="56" width="44" height="7" rx="3.5" fill="#ddd6c9"/><rect x="8" y="${SH - 40}" width="60" height="26" rx="7" fill="#1d93ba"/>`}</g>
    <g id="${p}-scr2" opacity="0">${opts.screen2 ?? ""}</g></g><rect x="${W / 2 - 14}" y="4" width="28" height="5" rx="2.5" fill="#141518"/>`);
  s += box(o, -50, 50, 18, 30, 0, 26, M.ink, 1.4);
  const anchors = { top: at(o, 0, topV, topZ + 26), screen: applyM(m, 5 + SW / 2, 11 + SH / 2), center: at(o, 0, -20, 90), ground: at(o), scr: p + "-scr", scr2: p + "-scr2" };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-W / 2, W / 2, topV - 6, 0, 0, topZ]], center: anchors.center, badgeR: 26, glowR: 120 }), anchors };
}

// =====================================================================================
// 人物 person — 极简等距小人（无脸，圆头 + 身体）
// opts.role = "signer"（墨色）| "engineer"（青蓝）| "attacker"（红色帽衫轮廓）；或 opts.color 自定
// =====================================================================================
export function person(o, opts = {}) {
  const p = opts.id ?? "person", role = opts.state === "attacker" ? "attacker" : opts.role ?? "signer", k = opts.scale ?? 1.2;
  const base = opts.color ?? { signer: "#3b3e44", engineer: "#2a9fc6", attacker: "#e0453a" }[role];
  const m = mat(base, role === "attacker" ? { st: "#8f2620" } : {});
  const dark = mat(darken(base, 0.18), { st: darken(base, 0.5) });
  const headM = role === "attacker" ? mat("#c23a30", { t: "#e8574c", st: "#8f2620" }) : mat(lighten(base, 0.2), { st: darken(base, 0.45) });
  // ellipse plans whose long axis runs along the screen-x direction (35°), so the figure reads broad-shouldered
  const ell = (rx, ry, du = 0, dv = 0, n = 32) => Array.from({ length: n }, (_, i) => { const t = (2 * Math.PI * i) / n, x = rx * Math.cos(t), y = ry * Math.sin(t); return [du + x * CA - y * SA, dv + x * SA + y * CA]; });
  const ax = (d) => [d * CA, d * SA]; // offset along the screen-x axis
  let s = contactShadow(o, 64 * k, 48 * k);
  for (const sg of [1, -1]) { const [du, dv] = ax(sg * 11 * k); s += cyl(o, du, dv, 11 * k, 0, 66 * k, dark, { seg: 18, sw: 1.4 }); }
  for (const sg of [1, -1]) { const [du, dv] = ax(sg * 33 * k); s += loft(o, ell(9 * k, 9 * k, du, dv, 16), ell(10 * k, 10 * k, du * 0.92, dv * 0.92, 16), 72 * k, 132 * k, m, { sw: 1.4, top: false }); }
  s += loft(o, ell(26 * k, 18 * k), ell(33 * k, 21 * k), 60 * k, 128 * k, m, { sw: 1.8 });
  s += loft(o, ell(33 * k, 21 * k), ell(15 * k, 11 * k), 128 * k, 144 * k, m, { sw: 1.8 });
  const hc = at(o, 0, 0, 170 * k), hr = 26 * k;
  if (role === "attacker") {
    const H = (x, y) => `${f(hc[0] + x * k)} ${f(hc[1] + y * k)}`;
    s += `<path d="M${H(-34, 26)}C${H(-40, -14)} ${H(-20, -44)} ${H(2, -44)}C${H(28, -42)} ${H(40, -12)} ${H(35, 26)}Q${H(0, 34)} ${H(-34, 26)}Z" fill="${headM.f}" stroke="#8f2620" stroke-width="2.4" stroke-linejoin="round"/>`;
    s += `<ellipse cx="${f(hc[0] + 6 * k)}" cy="${f(hc[1] + 2 * k)}" rx="${f(19 * k)}" ry="${f(23 * k)}" fill="#3a1714"/>`;
    const pc = at(o, -4 * k, 20 * k, 84 * k);
    s += `<path d="M${f(pc[0] - 18 * k)} ${f(pc[1] - 8 * k)}H${f(pc[0] + 20 * k)}L${f(pc[0] + 24 * k)} ${f(pc[1] + 12 * k)}H${f(pc[0] - 22 * k)}Z" fill="${darken(base, 0.08)}" stroke="#8f2620" stroke-width="2"/>`;
    const ds = at(o, 0, 22 * k, 132 * k);
    s += `<path d="M${f(ds[0] - 4 * k)} ${f(ds[1])}v${f(22 * k)}M${f(ds[0] + 10 * k)} ${f(ds[1] - 3 * k)}v${f(22 * k)}" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>`;
  } else {
    s += cyl(o, 0, 0, 9 * k, 140 * k, 150 * k, mat(lighten(base, 0.1)), { seg: 16, sw: 1.2 });
    s += sphere(p + "-head", o, 0, 0, 170 * k, hr, headM, 1.8);
    if (role === "engineer") {
      const bd = at(o, -2 * k, 22 * k, 104 * k);
      s += `<path d="M${f(bd[0] - 12 * k)} ${f(bd[1] - 36 * k)}L${f(bd[0])} ${f(bd[1] - 6 * k)}L${f(bd[0] + 13 * k)} ${f(bd[1] - 38 * k)}" fill="none" stroke="#ffffff" stroke-width="2.2"/><rect x="${f(bd[0] - 8 * k)}" y="${f(bd[1] - 6 * k)}" width="${f(16 * k)}" height="${f(20 * k)}" rx="2" fill="#ffffff"/><rect x="${f(bd[0] - 5 * k)}" y="${f(bd[1] + 6 * k)}" width="${f(10 * k)}" height="3" fill="#2a9fc6"/>`;
    }
  }
  const anchors = { top: at(o, 0, 0, 210 * k), head: hc, center: at(o, 0, 0, 95 * k), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [{ cyl: [0, 0, 34 * k, 0, 144 * k] }, [-22 * k, 22 * k, -22 * k, 22 * k, 144 * k, 196 * k]], center: anchors.center, badgeR: 26, glowR: 110 * k }), anchors };
}

// =====================================================================================
// 熔断开关 knifeSwitch — 墙上的大闸刀：底板 + 上方夹口 + 两片闸刀 + 绝缘横把 + 指示灯
// opts.on=true（合上）；lampOn="#2bd46f" lampOff="#ff4a3d"
// 可动：KIT.toggle(tl, ID, t, on) — 两片刀 ID-blade-0/1 同步转动 + 横把 ID-bar 跟随 + 指示灯 ID-lamp
// =====================================================================================
export function knifeSwitch(o, opts = {}) {
  const p = opts.id ?? "sw", atk = isAtk(opts);
  const on = opts.on !== false, aOn = 0, aOff = 118;
  let s = contactShadow(o, 170, 60, 0, 0);
  // wall slab: +v face is the mounting face
  s += box(o, -150, 150, -36, 0, 0, 330, M.white, 1.8);
  s += box(o, -158, 158, -42, 6, 0, 10, M.plinth, 1.2);
  const plateM = atk ? M.red : M.ink;
  s += box(o, -84, 84, 0, 10, 60, 300, plateM, 1.6);
  const lampOn = opts.lampOn ?? "#2bd46f", lampOff = opts.lampOff ?? "#ff4a3d";
  s += G_(faceV(o, -84, 10, 300), `<rect x="10" y="10" width="148" height="220" rx="4" fill="none" stroke="${lighten(plateM.s, 0.2)}" stroke-width="2"/>` +
    `<rect x="44" y="16" width="80" height="22" rx="3" fill="#f6f3ec"/>` + txt(84, 33, opts.text ?? "熔断", { size: 16, anchor: "middle" }) +
    `<circle cx="140" cy="27" r="11" fill="#141518"/><circle id="${p}-lamp" cx="140" cy="27" r="8" fill="${on ? lampOn : lampOff}" data-on="${lampOn}" data-off="${lampOff}"/>` +
    txt(30, 72, "ON", { size: 12, mono: true, fill: "#d3d7dc", weight: 700 }) + txt(30, 214, "OFF", { size: 12, mono: true, fill: "#d3d7dc", weight: 700 }));
  const zc = 252, zp = 110, L = zc - zp; // clips at top, pivots at bottom
  const blade = `<rect x="2" y="${-L - 6}" width="12" height="${L + 12}" rx="3" fill="#d4d7db" stroke="#5a5e65" stroke-width="1.6"/><rect x="4" y="${-L}" width="4" height="${L}" rx="2" fill="#f4f5f6"/><circle cx="8" cy="0" r="8" fill="#7d828a" stroke="#2b2d31" stroke-width="1.6"/><circle cx="8" cy="0" r="3" fill="#2b2d31"/>`;
  const parts = [];
  for (const [i, du] of [[1, 30], [0, -30]]) { // far blade (+u) first
    let q = box(o, du - 10, du + 10, 10, 26, zc - 26, zc + 6, M.chrome, 1.2) + box(o, du - 10, du + 10, 10, 22, zp - 14, zp + 10, M.chrome, 1.2);
    const mB = frameU(o, du, 10, zp);
    q += `<use href="#${p}-blade-${i}" transform="translate(${f(5 * U[0])},${f(5 * U[1])})" style="filter:brightness(0.7)"/>`;
    q += rotator(`${p}-blade-${i}`, mB, 8, 0, on ? aOn : aOff, blade);
    parts.push(q);
  }
  s += parts.join("");
  // handle bar between the blade tips (runtime keeps it attached)
  const tip = (du, a) => { const mB = frameU(o, du, 10, zp), r = a * DEG; return applyM(mB, 8 + L * Math.sin(r), -L * Math.cos(r)); };
  const a = on ? aOn : aOff, t0 = tip(-30, a), t1 = tip(30, a);
  s += `<line id="${p}-bar" x1="${f(t0[0])}" y1="${f(t0[1])}" x2="${f(t1[0])}" y2="${f(t1[1])}" stroke="#1d1f23" stroke-width="16" stroke-linecap="round"/>
    <line id="${p}-bar-hi" x1="${f(t0[0])}" y1="${f(t0[1])}" x2="${f(t1[0])}" y2="${f(t1[1])}" stroke="#4a4d53" stroke-width="5" stroke-linecap="round" transform="translate(0,-3)"/>`;
  s = `<g id="${p}-sw" data-l="${L}" data-on="${aOn}" data-off="${aOff}" data-a="${on ? aOn : aOff}">${s}</g>`;
  const anchors = { top: at(o, 0, 0, 370), center: at(o, 0, 10, 180), handle: [(t0[0] + t1[0]) / 2, (t0[1] + t1[1]) / 2], ground: at(o), lamp: p + "-lamp" };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-150, 150, -36, 0, 0, 330], [-84, 84, 0, 10, 60, 300]], center: anchors.center, glowR: 200 }), anchors };
}

// =====================================================================================
// 警报灯 beacon — 旋转警示灯：KIT.beacon(tl, ID, t, dur, period) 让灯束旋转 + 灯罩明暗
// 可动：ID-beam（水平面里旋转的光束）, ID-lit（灯罩点亮层）
// =====================================================================================
export function beacon(o, opts = {}) {
  const p = opts.id ?? "alarm";
  const zb = 44;
  let s = contactShadow(o, 70, 56);
  s += rbox(o, -46, 46, -46, 46, 0, zb, 8, M.white, { sw: 1.6 });
  s += cyl(o, 0, 0, 36, zb, zb + 16, M.ink, { sw: 1.6 });
  // beam (horizontal plane at lamp height), hidden until KIT.beacon runs
  const zl = zb + 44;
  const wedgeP = (a0, a1, r) => `M0 0L${f(r * Math.cos(a0 * DEG))} ${f(r * Math.sin(a0 * DEG))}A${r} ${r} 0 0 1 ${f(r * Math.cos(a1 * DEG))} ${f(r * Math.sin(a1 * DEG))}Z`;
  const beam = `<defs><radialGradient id="${p}-bg" cx="0" cy="0" r="240" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff4a3d" stop-opacity="0.55"/><stop offset="1" stop-color="#ff4a3d" stop-opacity="0"/></radialGradient></defs>
    <path d="${wedgeP(-14, 14, 240)}" fill="url(#${p}-bg)"/><path d="${wedgeP(166, 194, 240)}" fill="url(#${p}-bg)"/>`;
  s += `<g id="${p}-beamg" opacity="0">${rotator(p + "-beam", frameTop(o, 0, 0, zl), 0, 0, 0, beam)}</g>`;
  // dome: glass, inner reflector, lit overlay, cap
  const dome = (fill, stroke) => loft(o, circlePlan(0, 0, 32, 32), circlePlan(0, 0, 27, 32), zb + 16, zb + 70, { f: fill, s: fill, t: fill, st: stroke }, { sw: 1.8, top: false });
  s += dome("rgba(232,170,164,0.55)", "#a8322a");
  s += box(o, -6, 6, -16, 16, zb + 22, zb + 60, { f: "#c9cdd2", s: "#b3b8bf", t: "#e3e6e9", st: "#7d828a" }, 1);
  s += `<g id="${p}-lit" opacity="0">${dome("rgba(255,74,61,0.85)", "#a8322a")}</g>`;
  s += cyl(o, 0, 0, 22, zb + 70, zb + 80, M.ink, { sw: 1.4 });
  const hl = at(o, -20, 14, zb + 58);
  s += `<path d="M${f(hl[0])} ${f(hl[1])}l2 -26" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`;
  const anchors = { top: at(o, 0, 0, zb + 120), center: at(o, 0, 0, zl), ground: at(o), beam: p + "-beam", lit: p + "-lit" };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-46, 46, -46, 46, 0, zb], { cyl: [0, 0, 32, zb, zb + 80] }], center: anchors.center, badgeR: 26, glowR: 110 }), anchors };
}

// =====================================================================================
// 沙漏 hourglass — 木框 + 玻璃 + 沙；KIT.sand(tl, ID, t, dur)：上沙下降、下沙堆高
// 时钟 clock — 双铃闹钟；指针 ID-hh / ID-mh（KIT.clock 推进分钟）；opts.h, opts.m
// =====================================================================================
export function hourglass(o, opts = {}) {
  const p = opts.id ?? "hg";
  const wood = M.wood, H = 200, zt = H - 12;
  let s = contactShadow(o, 80, 64);
  s += cyl(o, 0, 0, 56, 0, 14, wood, { sw: 1.6 });
  const posts = [0, 120, 240].map((a) => [44 * Math.cos((a + 15) * DEG), 44 * Math.sin((a + 15) * DEG)]);
  const depth = ([u, v]) => -u * SA * SE + v * CA * SE;
  const back = posts.filter((q) => depth(q) < 0), front = posts.filter((q) => depth(q) >= 0);
  for (const q of back) s += cyl(o, q[0], q[1], 5, 14, zt, wood, { seg: 12, sw: 1.2 });
  // glass silhouette: body of revolution → screen x = ±r(z); smooth profile sampled finely
  const zN = 98, half = 84;
  const rOf = (z) => { const d = Math.min(1, Math.abs(z - zN) / half); let r = 5 + 35 * Math.pow(Math.sin((Math.PI / 2) * Math.min(1, d / 0.6)), 1.3); if (d > 0.8) r -= ((d - 0.8) / 0.2) * 7; return r; };
  const c0 = at(o, 0, 0, 0);
  const Y = (z) => c0[1] - z * CE;
  const zs = Array.from({ length: 49 }, (_, i) => zN - half + (2 * half * i) / 48);
  const Lp = zs.map((z) => [c0[0] - rOf(z), Y(z)]), Rp = zs.map((z) => [c0[0] + rOf(z), Y(z)]).reverse();
  const glassD = `M${pts([Lp[0]])}` + Lp.slice(1).map((q) => `L${pts([q])}`).join("") + Rp.map((q) => `L${pts([q])}`).join("") + "Z";
  const sand = "#d8b479", sandD = "#b99358";
  const zLevel = 150, yLevel = Y(zLevel), yNeck = Y(zN);
  s += `<path d="${glassD}" fill="rgba(208,234,244,0.35)"/>`;
  s += `<defs><clipPath id="${p}-gc"><path d="${glassD}"/></clipPath><clipPath id="${p}-tc"><rect id="${p}-sandT" x="${f(c0[0] - 60)}" y="${f(yLevel)}" width="120" height="${f(yNeck - yLevel + 4)}"/></clipPath></defs>
    <g clip-path="url(#${p}-gc)"><g clip-path="url(#${p}-tc)"><path d="${glassD}" fill="${sand}"/></g></g>`;
  const bb = Y(zN - half), pk = Y(zN - half + 40);
  s += `<path id="${p}-stream" d="M${f(c0[0])} ${f(yNeck)}V${f(pk)}" stroke="${sand}" stroke-width="2.6" opacity="${opts.flowing ? 1 : 0}"/>`;
  s += `<g clip-path="url(#${p}-gc)"><g id="${p}-sandB"><path d="M${f(c0[0] - 46)} ${f(bb + 4)}L${f(c0[0] - 46)} ${f(Y(zN - half + 12))}Q${f(c0[0] - 16)} ${f(pk + 8)} ${f(c0[0])} ${f(pk)}Q${f(c0[0] + 16)} ${f(pk + 8)} ${f(c0[0] + 46)} ${f(Y(zN - half + 12))}L${f(c0[0] + 46)} ${f(bb + 4)}Z" fill="${sand}" stroke="${sandD}" stroke-width="1.2"/></g></g>`;
  s += `<path d="${glassD}" fill="none" stroke="rgba(42,163,201,0.8)" stroke-width="2.4" stroke-linejoin="round"/>`;
  s += `<path d="M${f(c0[0] - 24)} ${f(Y(162))}Q${f(c0[0] - 30)} ${f(Y(140))} ${f(c0[0] - 20)} ${f(Y(122))}M${f(c0[0] - 26)} ${f(Y(62))}Q${f(c0[0] - 31)} ${f(Y(42))} ${f(c0[0] - 22)} ${f(Y(28))}" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.75"/>`;
  for (const q of front) s += cyl(o, q[0], q[1], 5, 14, zt, wood, { seg: 12, sw: 1.2 });
  s += cyl(o, 0, 0, 56, zt, H, wood, { sw: 1.6 });
  s = `<g id="${p}-hg" data-neck="${f(c0[0])} ${f(yNeck)}" data-bot="${f(c0[0])} ${f(bb)}" data-y0="${f(yLevel)}" data-y1="${f(yNeck)}">${s}</g>`;
  const anchors = { top: at(o, 0, 0, H + 40), center: at(o, 0, 0, H / 2), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [{ cyl: [0, 0, 56, 0, H] }], center: anchors.center, glowR: 110 }), anchors };
}
export function clock(o, opts = {}) {
  const p = opts.id ?? "clock", atk = isAtk(opts);
  const R = 74, zc = 110, T = 26;
  const caseM = atk ? M.red : { f: "#2f9fc4", s: "#1f86a8", t: "#5cc0e0", st: "#155e77" };
  let s = contactShadow(o, 90, 50);
  // feet + bells (behind)
  for (const du of [-44, 44]) s += line3(o, [[du * 0.7, -T / 2, zc - R * 0.7], [du, -T / 2, 6]], "#2b2d31", 6);
  const mF = frameV(o, 0, 0, zc);
  for (const [du, sg] of [[-46, -1], [46, 1]]) {
    const bc = at(o, du, -T / 2, zc + R * 0.86);
    s += `<path d="M${f(bc[0] - 24)} ${f(bc[1] + 6)}A24 22 0 0 1 ${f(bc[0] + 24)} ${f(bc[1] + 6)}Z" fill="${caseM.t}" stroke="${caseM.st}" stroke-width="1.8" transform="rotate(${sg * 24} ${f(bc[0])} ${f(bc[1])})"/>`;
  }
  const hb = at(o, 0, -T / 2, zc + R + 14);
  s += `<path d="M${f(hb[0] - 26)} ${f(hb[1] + 14)}Q${f(hb[0])} ${f(hb[1] - 12)} ${f(hb[0] + 26)} ${f(hb[1] + 14)}" fill="none" stroke="#2b2d31" stroke-width="5" stroke-linecap="round"/>`;
  // case: extruded disc along −v
  for (let i = T; i >= 1; i -= 2) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(mF), `<circle cx="0" cy="0" r="${R}" fill="${caseM.s}" stroke="${caseM.st}" stroke-width="${i === T ? 1.8 : 0}"/>`)}</g>`;
  let face = `<circle cx="0" cy="0" r="${R}" fill="${caseM.f}" stroke="${caseM.st}" stroke-width="1.8"/><circle cx="0" cy="0" r="${R - 10}" fill="#fffdf8" stroke="#cfc7b8" stroke-width="1.5"/>`;
  for (let i = 0; i < 60; i++) { const a = (i * 6 - 90) * DEG, r0 = i % 5 ? R - 16 : R - 22; face += `<line x1="${f(r0 * Math.cos(a))}" y1="${f(r0 * Math.sin(a))}" x2="${f((R - 13) * Math.cos(a))}" y2="${f((R - 13) * Math.sin(a))}" stroke="${i % 5 ? "#b8b0a1" : C.ink}" stroke-width="${i % 5 ? 1.2 : 3}"/>`; }
  for (const [n, a] of [[12, -90], [3, 0], [6, 90], [9, 180]]) face += txt(f((R - 34) * Math.cos(a * DEG)), f((R - 34) * Math.sin(a * DEG) + 6), n, { size: 16, anchor: "middle", weight: 800 });
  s += G_(matStr(mF), face);
  const h = opts.h ?? 3, mi = opts.m ?? 50;
  s += rotator(p + "-hh", mF, 0, 0, (h % 12) * 30 + mi * 0.5, `<rect x="-3.5" y="-36" width="7" height="44" rx="3.5" fill="${C.ink}"/>`);
  s += rotator(p + "-mh", mF, 0, 0, mi * 6, `<rect x="-2.5" y="-54" width="5" height="64" rx="2.5" fill="${C.ink}"/>`);
  s += G_(matStr(mF), `<circle cx="0" cy="0" r="6" fill="#e0453a"/><circle cx="0" cy="0" r="2.5" fill="#ffffff"/>`);
  const anchors = { top: at(o, 0, 0, zc + R + 50), center: at(o, 0, 0, zc), ground: at(o), hh: p + "-hh", mh: p + "-mh" };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-R, R, -T, 0, zc - R, zc + R]], center: anchors.center, glowR: 120 }), anchors };
}

// =====================================================================================
// 盾牌 shield（策略引擎）— 立在底座上的厚盾 + 白色对勾
// 放大镜 magnifier（解码/核对）— 厚镜框 + 玻璃高光 + 手柄，悬在地面上方
// =====================================================================================
export function shield(o, opts = {}) {
  const p = opts.id ?? "shield", atk = isAtk(opts);
  const m = atk ? M.red : { f: "#5cc0e0", s: "#2f9fc4", t: "#9ad9ee", st: "#1f7896" };
  let s = contactShadow(o, 100, 60);
  s += rbox(o, -56, 56, -34, 34, 0, 24, 8, M.plinth, { sw: 1.4 });
  const W = 74, Hs = 186;
  const shp = `M${-W} 8Q0 -14 ${W} 8L${W} 76Q${W - 6} 150 0 ${Hs}Q${-W + 6} 150 ${-W} 76Z`;
  const mF = frameV(o, 0, 6, 24 + Hs + 8);
  for (let i = 18; i >= 1; i -= 1.5) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(mF), `<path d="${shp}" fill="${m.s}" stroke="${m.st}" stroke-width="${i > 16 ? 1.8 : 0}"/>`)}</g>`;
  const inner = `M${-W + 14} 18Q0 0 ${W - 14} 18L${W - 14} 76Q${W - 20} 136 0 ${Hs - 18}Q${-W + 20} 136 ${-W + 14} 76Z`;
  const face = `<path d="${shp}" fill="${m.f}" stroke="${m.st}" stroke-width="2"/><path d="M0 -3V${Hs}" stroke="none"/><path d="M0 -3Q${W} 0 ${W} 8L${W} 76Q${W - 6} 150 0 ${Hs}Z" fill="${m.s}" opacity="0.55"/>
    <path d="${inner}" fill="none" stroke="#ffffff" stroke-width="5" opacity="0.9"/>
    ${atk ? `<path d="M-24 52L24 104M24 52L-24 104" stroke="#ffffff" stroke-width="13" stroke-linecap="round"/>` : `<path d="M-30 80L-8 104L32 54" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`}`;
  s += G_(matStr(mF), face);
  const anchors = { top: at(o, 0, 0, 24 + Hs + 40), center: at(o, 0, 6, 24 + Hs / 2), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-W, W, -12, 6, 24, 24 + Hs + 8], [-56, 56, -34, 34, 0, 24]], center: anchors.center, glowR: 150 }), anchors };
}
export function magnifier(o, opts = {}) {
  const p = opts.id ?? "mag", atk = isAtk(opts);
  const z0 = opts.z ?? 40, R = 62, rimC = atk ? "#c23a30" : "#2b2d31";
  let s = contactShadow(o, 110, 60, 10, 0);
  const mF = frameV(o, 0, 0, z0 + R + 110);
  const ring = (st, w) => `<circle cx="0" cy="0" r="${R}" fill="none" stroke="${st}" stroke-width="${w}"/>`;
  const handle = (fill) => `<g transform="rotate(42)"><rect x="${R + 4}" y="-9" width="26" height="18" rx="3" fill="#c9cdd2" stroke="#5a5e65" stroke-width="1.4"/><rect x="${R + 28}" y="-13" width="96" height="26" rx="13" fill="${fill}"/></g>`;
  for (let i = 12; i >= 1; i -= 1.5) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(mF), ring("#5a5e65", 16) + handle(atk ? "#a8322a" : "#1d1f23"))}</g>`;
  s += G_(matStr(mF), `<circle cx="0" cy="0" r="${R}" fill="rgba(208,234,244,0.45)"/>` + ring(rimC, 16) + ring("#7d828a", 3) + handle(atk ? "#e0453a" : "#34363b") +
    `<path d="M-40 -22A46 46 0 0 1 -14 -44" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity="0.85"/><circle cx="-44" cy="-4" r="4" fill="#ffffff" opacity="0.8"/>`);
  const anchors = { top: at(o, 0, 0, z0 + R * 2 + 140), lens: applyM(mF, 0, 0), center: applyM(mF, 30, 30), ground: at(o) };
  return { svg: shell(p, o, opts, { solid: s, wire: [[-R - 10, R + 90, -12, 0, z0, z0 + 2 * R + 110]], center: anchors.lens, badgeR: 28, glowR: 110 }), anchors };
}

/** catalogue: name → constructor (for docs / showcase loops) */
export const CATALOG = {
  safe, hotWallet, laptop, hwWallet, padlock, key, seal, doc, envelope, ledgerBook, dbLedger, rack, hsm, rpc,
  checkpoint, tower, chain, browserWin, bucket, desk, phone, person, knifeSwitch, beacon, hourglass, clock, shield, magnifier,
};
