// objects-ext.mjs — 第 13 集（非 EVM 生态）补充拟物物件，与 kit/objects.mjs 同一投影、同一接口
// 每个物件：objName(origin, opts) → { svg, anchors }
//   origin = 世界坐标 {u, v}（iso.G(X,Y) 换算）；opts.id = id 前缀；opts.state = "normal" | "broken" | "attacker"
//   opts.glow = true 时脚下绿色地光；opts.scale = 以地面原点等比缩放（anchors 已换算）
// DOM 结构与 kit 相同：<g id=ID> → ID-glow / ID-solid / ID-wire / ID-x，KIT.grow / KIT.broke / KIT.fixed 直接可用；另有一层 ID-mv（整件包一层）。
//   两个物件的 broken 都是 kit 惯例：整件变虚 + 红虚线框 + 红叉（= 被拒收），所以 normal ↔ broken 用 KIT.broke / KIT.fixed。
// 动画助手在 runtime-ext.js（window.KITX13，并以不覆盖的方式合并进 window.KITX），用 runtimeExtJs() 内联在 kit 的 runtimeJs() 之后。
// 只用确定性逻辑：无 Math.random、无 Date。
import fs from "node:fs";
import {
  U, V, CE, f, f4, at, M, C, mat, darken, lighten,
  frameV, frameU, matStr, applyM, faceTop,
  box, glow, contactShadow, wireSvg, badgeSvg,
} from "../../kit/iso.mjs";

const FONT = `font-family="Noto Sans SC, sans-serif"`;
const MONO = `font-family="JetBrains Mono, monospace"`;
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const txt = (x, y, s, o = {}) =>
  `<text ${o.id ? `id="${o.id}"` : ""} x="${f(x)}" y="${f(y)}" ${o.mono ? MONO : FONT} font-size="${o.size ?? 20}" font-weight="${o.weight ?? 900}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}" ${o.extra ?? ""}>${s}</text>`;
const isAscii = (s) => /^[\x00-\x7f]*$/.test(String(s));
/** font size so that text s fits into width w (CJK ≈ 1 em, ASCII mono ≈ 0.6 em) */
const fitSize = (s, w, max) => { s = String(s); const em = isAscii(s) ? 0.62 * s.length : s.length; return Math.min(max, w / Math.max(1, em)); };
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
const mArr = (m) => m.map((v, i) => (i < 4 ? f4(v) : f(v))).join(",");
/** swing matrix: a vertical panel hinged at screen point (hx, hy); local x runs along cos(a)·d0 + sin(a)·d1 (screen vectors), local y = −z */
const swingM = (hx, hy, d0, d1, a) => {
  const r = (a * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  return [c * d0[0] + s * d1[0], c * d0[1] + s * d1[1], 0, CE, hx, hy];
};

// =====================================================================================
// 账户护照 passport — 一本立在小黑夹座上的护照：硬封面青蓝色，压一枚金色圆形徽记和 title；翻开（封面绕左边铰链向观众一侧转开）
//   露出内页三行字段 fields，每行右侧一个检查格（空 / 绿勾 / 红叉）。封面正面朝 +v（看向观众）。
// 约 60×24×80（夹座 56×20×7，护照本 48 宽、68 高，顶 z 78）。
// opts: title="账户", fields=["owner","类型","地址"]（最多 3 行）, open=false, fake=false（true = 右下角红色"伪造"戳已显示）,
//   checks=[]（每格初始 "ok" | "bad" | ""），scale
// 状态：normal 青蓝封面、检查格空；attacker 封面与 normal 一样，只有封边一道细红线（外观看不出）；broken 整件变虚 + 红虚线框 + 红叉（= 被拒收）。
// 可动：ID-cover（封面翻开 / 合上，KITX13.cover；层 -front / -inside）, ID-check-0..2（KITX13.check：-ok 绿勾 / -bad 红叉）,
//   ID-fake（红戳，KITX13.fake）, ID-title（封面字，KITX13.title）
// anchors: top, center, ground, cover（封面中心，合上时）, title, fake, page（内页中心）, checks[0..2]（检查格中心）
// =====================================================================================
export function passport(o, opts = {}) {
  const p = opts.id ?? "pass", K = opts.scale ?? 1, st = opts.state ?? "normal", atk = st === "attacker";
  const title = String(opts.title ?? "账户");
  const fields = (opts.fields ?? ["owner", "类型", "地址"]).slice(0, 3);
  const open = !!opts.open, fake = !!opts.fake, chk0 = opts.checks ?? [];
  const W = 48, H = 68, BU0 = -24, BV1 = 3, BZ0 = 10, BZ1 = 78;
  const COV = mat("#2f93b8", { st: "#1d6a86" }), PAGE = M.paper, STAND = M.ink;
  let s = contactShadow(o, 40, 18);

  // ---- stand: base + back jaw
  s += box(o, -28, 28, -10, 10, 0, 7, STAND, 1.2);
  s += box(o, -18, 18, -8, -3, 7, 18, STAND, 1);
  // ---- book block (spine / page edges) + top page edge
  s += box(o, BU0, -BU0, -3, BV1, BZ0, BZ1, COV, 1.4);
  s += `<polygon points="${[at(o, BU0 + 2, -2, BZ1 + 0.1), at(o, -BU0 - 1, -2, BZ1 + 0.1), at(o, -BU0 - 1, BV1 - 1, BZ1 + 0.1), at(o, BU0 + 2, BV1 - 1, BZ1 + 0.1)].map((q) => `${f(q[0])},${f(q[1])}`).join(" ")}" fill="${PAGE.t}"/>`;
  // ---- inner page (under the cover): three field rows, a check box on each
  const FM = frameV(o, BU0, BV1 + 0.05, BZ1);
  const ROWY = [17, 34, 51], CX0 = 35, CS = 9;
  let pg = `<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="1.5" fill="${PAGE.f}" stroke="${PAGE.st}" stroke-width="0.8"/>`;
  pg += `<rect x="4" y="4.5" width="${W - 8}" height="5" rx="1" fill="#d9eff6"/>`;
  fields.forEach((fl, i) => {
    const y = ROWY[i], fs = fitSize(fl, 26, 7.5);
    pg += txt(4.5, y + 2.6, fl, { size: fs, mono: isAscii(fl), weight: 800, fill: "#3d4148" });
    pg += `<path d="M4.5 ${y + 6}L${CX0 - 3} ${y + 6}" stroke="#c9c2b4" stroke-width="0.9"/>`;
    const cx = CX0, cy = y - CS / 2 + 1, st0 = chk0[i] ?? "";
    pg += `<g id="${p}-check-${i}"><rect x="${cx}" y="${f(cy)}" width="${CS}" height="${CS}" rx="1.4" fill="#ffffff" stroke="#55595f" stroke-width="1.1"/>` +
      `<g id="${p}-check-${i}-ok" opacity="${st0 === "ok" ? 1 : 0}"><rect x="${cx - 0.5}" y="${f(cy - 0.5)}" width="${CS + 1}" height="${CS + 1}" rx="1.6" fill="${GREEN}"/><path d="M${cx + 2} ${f(cy + 4.6)}l2.2 2.3l4 -4.6" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>` +
      `<g id="${p}-check-${i}-bad" opacity="${st0 === "bad" ? 1 : 0}"><rect x="${cx - 0.5}" y="${f(cy - 0.5)}" width="${CS + 1}" height="${CS + 1}" rx="1.6" fill="${RED}"/><path d="M${cx + 2.4} ${f(cy + 2.4)}l4.2 4.2M${cx + 6.6} ${f(cy + 2.4)}l-4.2 4.2" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/></g></g>`;
  });
  pg += `<path d="M4.5 61L30 61" stroke="#c9c2b4" stroke-width="0.9"/><path d="M4.5 64.5L22 64.5" stroke="#c9c2b4" stroke-width="0.9"/>`;
  s += G_(matStr(FM), pg);

  // ---- cover (hinged at the −u edge, swings toward the viewer)
  const [hx, hy] = at(o, BU0, BV1 + 0.4, BZ1);
  const A_OPEN = 155, a0 = open ? A_OPEN : 0;
  const CM = swingM(hx, hy, U, V, a0);
  const tSize = fitSize(title, 40, 11);
  let front = `<rect x="0" y="0" width="${W}" height="${H}" rx="2" fill="${COV.f}" stroke="${COV.st}" stroke-width="1.3"/>` +
    `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="1.5" fill="none" stroke="${lighten(COV.f, 0.3)}" stroke-width="0.8"/>` +
    `<circle cx="${W / 2}" cy="24" r="10.5" fill="none" stroke="#f0c04a" stroke-width="1.6"/><circle cx="${W / 2}" cy="24" r="6" fill="none" stroke="#f0c04a" stroke-width="1"/>` +
    `<path d="M${W / 2 - 10.5} 24L${W / 2 + 10.5} 24M${W / 2} 13.5L${W / 2} 34.5" stroke="#f0c04a" stroke-width="0.8"/>` +
    txt(W / 2, 47 + tSize * 0.36, title, { id: p + "-title", size: tSize, anchor: "middle", fill: "#ffffff", mono: isAscii(title) }) +
    `<rect x="12" y="57" width="${W - 24}" height="3" rx="1.5" fill="#f0c04a" opacity="0.8"/>`;
  if (atk) front += `<path d="M${W - 1.3} 1.5L${W - 1.3} ${H - 1.5}" stroke="${RED}" stroke-width="1.6"/>`;
  front += `<g id="${p}-fake" opacity="${fake ? 1 : 0}" transform="rotate(-14 ${W - 13} ${H - 13})"><rect x="${W - 27}" y="${H - 20}" width="27" height="13" rx="2" fill="rgba(255,255,255,0.85)" stroke="${RED}" stroke-width="1.6"/>` +
    txt(W - 13.5, H - 10.3, "伪造", { size: 9, anchor: "middle", fill: RED }) + `</g>`;
  const inside = `<rect x="0" y="0" width="${W}" height="${H}" rx="2" fill="${PAGE.s}" stroke="${COV.st}" stroke-width="1.3"/>` +
    `<rect x="${W - 22}" y="10" width="16" height="20" rx="1.5" fill="#cfd6dc" stroke="#9aa3ab" stroke-width="0.8"/>` +
    `<path d="M${W - 40} 40L${W - 6} 40M${W - 40} 46L${W - 12} 46M${W - 40} 52L${W - 18} 52" stroke="#bdb5a6" stroke-width="0.9"/>`;
  const frontOn = a0 < 125;
  s += `<g id="${p}-cover" data-hx="${f(hx)}" data-hy="${f(hy)}" data-a="${a0}" data-open="${A_OPEN}" transform="matrix(${mArr(CM)})">` +
    `<g id="${p}-cover-front" opacity="${frontOn ? 1 : 0}">${front}</g><g id="${p}-cover-inside" opacity="${frontOn ? 0 : 1}">${inside}</g></g>`;
  // ---- front jaw of the stand (over the bottom of the cover)
  s += box(o, -18, 18, BV1 + 1, BV1 + 6, 7, 15, STAND, 1);

  const L = (x, y) => applyM(FM, x, y), LC = (x, y) => applyM(swingM(hx, hy, U, V, 0), x, y);
  const anchors = {
    top: at(o, 0, 0, BZ1 + 10), center: at(o, 0, BV1, 44), ground: at(o),
    cover: LC(W / 2, H / 2), title: LC(W / 2, 47), fake: LC(W - 13.5, H - 13.5), page: L(W / 2, H / 2),
    checks: ROWY.slice(0, fields.length).map((y) => L(CX0 + CS / 2, y + 1)),
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [[BU0, -BU0, -3, BV1, BZ0, BZ1], [-28, 28, -10, 10, 0, 7]], center: anchors.center, badgeR: 16, glowR: 60, k: K,
      attrs: `data-kind="passport"` }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

// =====================================================================================
// 集装箱 container — 一只等距集装箱：瓦楞钢板箱身（墨灰，tone "teal" 时青蓝），侧面（+v，看向观众）写 label；
//   两扇门在 −u 端（看得见的那一端；+u 端在等距视角里是背面），每扇门两根竖向锁杆，前门（靠观众）的锁杆上挂一枚封条小牌。
// 约 200×90×95（u ±100、v ±45、顶 z 95）。
// opts: label="UTXO", tone="slate"|"teal", open=false（前门已开）, inside=open（门内货物剪影可见）, seal="green"|"red", scale
// 状态：normal 封条绿、货物剪影白底青蓝；attacker 封条仍绿，货物剪影变红（= 封条对、内容解释错）；broken 整件变虚 + 红虚线框 + 红叉。
// 可动：ID-door（前门绕外侧铰链转开 / 关上，KITX13.door）, ID-seal（封条 -g / -r，KITX13.seal）, ID-inside（货物剪影 -n / -r，KITX13.inside）
// anchors: top, center, ground, label（侧面字中心）, door（前门中心，关着时）, seal（封条，关着时）, inside（门内中心）
// =====================================================================================
export function container(o, opts = {}) {
  const p = opts.id ?? "ctr", K = opts.scale ?? 1, st = opts.state ?? "normal", atk = st === "attacker";
  const label = String(opts.label ?? "UTXO");
  const open = !!opts.open, insideOn = opts.inside ?? open, seal0 = opts.seal ?? "green";
  const U0 = -100, U1 = 100, V0 = -45, V1 = 45, ZT = 95;
  const BODY = opts.tone === "teal" ? mat("#2f8fb0", { st: "#1b5e78" }) : mat("#4d545c", { st: "#23272c" });
  const ridge = darken(BODY.s, 0.18), ridgeL = lighten(BODY.s, 0.12);
  let s = contactShadow(o, 150, 80);

  s += box(o, U0, U1, V0, V1, 0, ZT, BODY, 1.8);
  // ---- +v side: corrugation + top / bottom rails + label
  const SM = frameV(o, U0, V1, ZT), SW = U1 - U0;
  let sd = "";
  for (let x = 8; x < SW - 4; x += 8) sd += `<path d="M${x} 7L${x} ${ZT - 7}" stroke="${x % 16 ? ridge : ridgeL}" stroke-width="${x % 16 ? 1.6 : 1}"/>`;
  sd += `<rect x="0" y="0" width="${SW}" height="6" fill="${darken(BODY.s, 0.1)}" stroke="${BODY.st}" stroke-width="1"/><rect x="0" y="${ZT - 6}" width="${SW}" height="6" fill="${darken(BODY.s, 0.1)}" stroke="${BODY.st}" stroke-width="1"/>`;
  for (const x of [0, SW - 9]) sd += `<rect x="${x}" y="0" width="9" height="9" fill="${darken(BODY.s, 0.25)}" stroke="${BODY.st}" stroke-width="0.8"/><rect x="${x}" y="${ZT - 9}" width="9" height="9" fill="${darken(BODY.s, 0.25)}" stroke="${BODY.st}" stroke-width="0.8"/>`;
  const lsz = fitSize(label, 120, 34);
  sd += `<rect x="${SW / 2 - 70}" y="${ZT / 2 - lsz * 0.75}" width="140" height="${f(lsz * 1.5)}" rx="3" fill="${darken(BODY.s, 0.22)}" opacity="0.75"/>`;
  sd += txt(SW / 2, ZT / 2 + lsz * 0.36, label, { id: p + "-label", size: lsz, anchor: "middle", fill: "#ffffff", mono: isAscii(label) });
  s += G_(matStr(SM), sd);
  // ---- top: a few ridges
  let tp = "";
  for (let x = 14; x < SW - 6; x += 22) tp += `<path d="M${x} 6L${x} ${V1 - V0 - 6}" stroke="${darken(BODY.t, 0.1)}" stroke-width="1.2"/>`;
  s += G_(faceTop(o, U0, V0, ZT + 0.1), tp);

  // ---- −u end: door frame, interior (front half), back door, front door (swings out toward −u)
  const EM = frameU(o, U0, V0, ZT), ED = V1 - V0, MIDX = ED / 2;
  const doorPanel = (w, sealHere) => {
    let d = `<rect x="0" y="0" width="${w}" height="${ZT - 8}" fill="${BODY.f}" stroke="${BODY.st}" stroke-width="1.3"/>`;
    for (let x = 5; x < w - 2; x += 6) d += `<path d="M${x} 6L${x} ${ZT - 14}" stroke="${ridge}" stroke-width="1"/>`;
    for (const x of [w * 0.3, w * 0.72]) {
      d += `<rect x="${f(x - 1.6)}" y="2" width="3.2" height="${ZT - 12}" rx="1.4" fill="#b9bec4" stroke="#5f656c" stroke-width="0.8"/>`;
      d += `<rect x="${f(x - 3)}" y="${ZT / 2 - 4}" width="6" height="9" rx="1" fill="#8d939a" stroke="#4a4f55" stroke-width="0.8"/>`;
    }
    if (sealHere) {
      const sx = w * 0.3, sy = ZT / 2 + 6;
      const tag = (fill, stc) => `<path d="M${f(sx)} ${f(sy)}L${f(sx)} ${f(sy + 6)}" stroke="#3a3d42" stroke-width="1"/><rect x="${f(sx - 5)}" y="${f(sy + 6)}" width="10" height="13" rx="2" fill="${fill}" stroke="${stc}" stroke-width="1.1"/><circle cx="${f(sx)}" cy="${f(sy + 9)}" r="1.3" fill="#ffffff"/>`;
      d += `<g id="${p}-seal" data-c="${seal0}"><g id="${p}-seal-g" opacity="${seal0 === "red" ? 0 : 1}">${tag("#3fb877", "#17804a")}</g><g id="${p}-seal-r" opacity="${seal0 === "red" ? 1 : 0}">${tag("#e8574c", "#a8322a")}</g></g>`;
    }
    return d;
  };
  let en = `<rect x="0" y="0" width="${ED}" height="${ZT}" fill="${darken(BODY.f, 0.15)}" stroke="${BODY.st}" stroke-width="1.6"/>`;
  en += `<rect x="${MIDX}" y="4" width="${ED - MIDX - 3}" height="${ZT - 8}" fill="#1b1e22"/>`;
  // cargo silhouettes (cards standing inside)
  const cards = (fill, stc, lc) => [[MIDX + 5, 40], [MIDX + 15, 34], [MIDX + 26, 44]].map(([x, y]) =>
    `<rect x="${x}" y="${y}" width="13" height="${ZT - 6 - y}" rx="1.5" fill="${fill}" stroke="${stc}" stroke-width="1.2"/><path d="M${x + 3} ${y + 8}L${x + 10} ${y + 8}M${x + 3} ${y + 14}L${x + 8} ${y + 14}" stroke="${lc}" stroke-width="1.4"/>`).join("");
  en += `<g id="${p}-inside" data-on="${insideOn ? 1 : 0}" data-red="${atk ? 1 : 0}" opacity="${insideOn ? 1 : 0}">` +
    `<g id="${p}-inside-n" opacity="${atk ? 0 : 1}">${cards("#fffdf8", TEAL, "#9fd3e4")}</g><g id="${p}-inside-r" opacity="${atk ? 1 : 0}">${cards("#fde6e3", RED, "#e8938b")}</g></g>`;
  en += G_(`translate(3 4)`, doorPanel(MIDX - 3, false));
  s += G_(matStr(EM), en);
  // front door: hinge at v = V1 − 3, closed it runs toward −v; opens toward −u
  const [hx, hy] = at(o, U0 - 0.3, V1 - 3, ZT - 4);
  const NV = [-V[0], -V[1]], NU = [-U[0], -U[1]];
  const A_OPEN = 105, a0 = open ? A_OPEN : 0;
  const DW = ED - MIDX - 3;
  // door panel drawn hinge-side at local x = 0 → mirror the panel so its seal bar sits near the centre seam
  s += `<g id="${p}-door" data-hx="${f(hx)}" data-hy="${f(hy)}" data-a="${a0}" data-open="${A_OPEN}" transform="matrix(${mArr(swingM(hx, hy, NV, NU, a0))})">` +
    G_(`translate(${DW} 0) scale(-1 1)`, doorPanel(DW, true)) + `</g>`;

  const LE = (x, y) => applyM(EM, x, y), LS = (x, y) => applyM(SM, x, y);
  const anchors = {
    top: at(o, 0, 0, ZT + 10), center: at(o, 0, 0, ZT / 2), ground: at(o),
    label: LS(SW / 2, ZT / 2), door: LE(MIDX + DW / 2, ZT / 2), seal: LE(ED - 3 - DW * 0.7, ZT / 2 + 22), inside: LE(MIDX + DW / 2, ZT * 0.6),
  };
  return {
    svg: shell(p, o, opts, { solid: s, wire: [[U0, U1, V0, V1, 0, ZT]], center: anchors.center, badgeR: 30, glowR: 170, k: K,
      attrs: `data-kind="container"` }),
    anchors: scaleAnchors(o, K, anchors),
  };
}

export const CATALOG_EXT = { passport, container };
/** runtime-ext.js contents — inline after iso.runtimeJs() (and other chapters' runtime-ext) */
export const runtimeExtJs = () => fs.readFileSync(new URL("./runtime-ext.js", import.meta.url), "utf8");
