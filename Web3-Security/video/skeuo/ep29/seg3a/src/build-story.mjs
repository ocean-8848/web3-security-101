// Generates compositions/story.html for ep29/seg3a「③ 断在哪一关」(142.3 s).
// One isometric world (the seven-checkpoint road from seg2), one camera.
// Run: node src/build-story.mjs
import fs from "node:fs";
import {
  Wp, at, f, pts, box, rbox, cyl, flat, line3, faceV, faceTop, faceU, frameV, matStr, M, C, mat, lighten, darken,
  contactShadow, camAt, worldSvg, gridSvg, wlab, wpin, kitCss, runtimeJs, circlePlan, sphere, wedge, dashCurve, CE, V as VV, U as UU,
} from "../../kit/iso.mjs";
import * as O from "../../kit/objects.mjs";
import { pills } from "../../kit/pills.mjs";
import { termCards, termJs } from "../../kit/terms.mjs";
// 术语卡（2026-11-15 第二轮返工）：时间按旧时间（= timing_old），revoice.py 按句拉伸
const TERMS = [
  { id: "tc1", t1: "前端", t2: "浏览器里运行的网页和它加载的脚本", t0: 64.50, t1s: 68.10 },
  { id: "tc2", t1: "时间锁", t2: "操作要公开排队一段时间才能执行", t0: 94.64, t1s: 98.20, top: 36 },
  { id: "tc3", t1: "跨链桥", t2: "在两条链之间转移资产或消息的系统", t0: 116.61, t1s: 119.45 },
  { id: "tc4", t1: "LayerZero", t2: "跨链消息协议 · 桥的验证者由它提供", t0: 119.66, t1s: 123.30 },
];

// ============================================================ world layout — aligned to seg2 (src/seg2-layout.mjs, frozen copy)
// Seven checkpoints along +u (screen: lower-left → upper-right) at u = 0, 640 … 3840, origin v = −62 (road centre v = 0);
// chain at u 4480; data-source branch at u 2660 toward +v (screen: down-right) to the RPC node (2660, 1010).
import { ROAD as R2, GATES, GATE_DU, USER, PHONE, CHAIN as CH2, PROPS, BRANCH, RPC } from "./seg2-layout.mjs";
import { monitor, podium } from "./seg2-props.mjs";
export const GATE_S = GATE_DU;
const GU = (i) => GATES[i - 1].u;                 // i = 1..7
const GV = GATES[0].v;                            // −62
const NUM = ["①", "②", "③", "④", "⑤", "⑥", "⑦"];
const NAME = ["业务意图", "请求构造", "风控与审批", "显示与解码", "签名", "广播", "链上状态"];

const items = [];          // {y, svg}
const add = (o, svg, dy = 0, h = 200) => { const m = svg.match(/id="([^"]+)"/); items.push({ y: at(o)[1] + dy, svg, o, h, id: m ? m[1] : '?' }); };
const hidden = [];         // ids that start scaled to 0 (grow later)
const s2p = [];            // seg2 context props (dimmed in the overview)
const labels = [];
const L = (id, p, html, cls = "", anchor = "b") => { labels.push(wlab(id, p, html, cls + " hide", anchor)); };
const LV = (id, p, html, cls = "", anchor = "b") => { labels.push(wlab(id, p, html, cls, anchor)); };
const PIN = (id, p, html, anchor = "c") => labels.push(wpin(id, p, html, anchor));
const wrap = (id, o, inner, extra = "") => { const [x, y] = at(o); return `<g id="${id}" data-ox="${f(x)}" data-oy="${f(y)}" ${extra}>${inner}</g>`; };
const G_ = (tr, inner) => `<g transform="${tr}">${inner}</g>`;
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-family="${o.mono ? "JetBrains Mono, monospace" : "Noto Sans SC, sans-serif"}" font-size="${o.size ?? 20}" font-weight="${o.w ?? 900}" fill="${o.fill ?? "#1c1c1c"}" text-anchor="${o.a ?? "start"}">${s}</text>`;
const pos = {};            // world-canvas px of interesting points, exported to the runtime

// ------------------------------------------------------------ roads (ground) — same drawing as seg2
// road drawn exactly as seg3b draws it (seg3b's first frame must match our last)
let ground = flat({ u: 0, v: 0 }, [[-760, -148], [4200, -148], [4200, 148], [-760, 148]], 0, "#f8f6f1", "#dcd5c8", 2);
for (let u = -720; u < 4160; u += 140) ground += line3({ u: 0, v: 0 }, [[u, 0], [u + 70, 0]], "#d3ccbf", 4);
ground += flat({ u: 0, v: 0 }, [[BRANCH.u - 60, 148], [BRANCH.u + 60, 148], [BRANCH.u + 60, 950], [BRANCH.u - 60, 950]], 0, "#f8f6f1", "#dcd5c8", 2);
for (let v = 190; v < 930; v += 110) ground += line3({ u: 0, v: 0 }, [[BRANCH.u, v], [BRANCH.u, v + 55]], "#d3ccbf", 4);

// ------------------------------------------------------------ checkpoints + chain + branch RPC (seg2 end state: arms up)
const gates = [];
for (let i = 1; i <= 7; i++) {
  const o = { u: GU(i), v: GV };
  const g = O.checkpoint(o, { id: "g" + i, n: NUM[i - 1], road: false, armUp: true });
  gates[i] = g;
  add(o, g.svg);
  LV("lg" + i, g.anchors.top, `<b class="gn">${NUM[i - 1]}</b>${NAME[i - 1]}`, "lab-gate");
  pos["g" + i] = at(o, 0, 60, 0);
  L("eg" + i, g.anchors.top, i === 5 || i === 7 ? `<span class="gn">${NUM[i - 1]}</span>${NAME[i - 1]}` : NUM[i - 1], "lab-g lab-sm");
}
const CHAIN_O = { u: CH2.u, v: CH2.v };
const ch = O.chain(CHAIN_O, { id: "chain", n: CH2.n });
add(CHAIN_O, ch.svg);
LV("lchain", ch.anchors.top, "链上", "lab-cs gl");
L("echain", at(CHAIN_O, 0, 0, 200), "区块链", "lab-sm");

// ------------------------------------------------------------ seg2 context props (dimmed): user, phone, ledger, ② wallet, ③ shield/approver/podium,
// ④ monitor/viewer, ⑤ MPC/HSM/signers/padlock, ⑥ tower
const addP = (id, o, svg) => { s2p.push(id); add(o, svg); };
addP("user", USER, O.person(USER, { id: "user", color: "#3f7d99" }).svg);
addP("phone", PHONE, O.phone(PHONE, { id: "phone" }).svg);
{
  const o = PROPS.ledger, ph = 60, lb = O.ledgerBook(o, { id: "ledg-book", scale: 1.05 }), [ox, oy] = at(o);
  addP("ledg", o, `<g id="ledg" data-ox="${f(ox)}" data-oy="${f(oy)}">${box(o, -170, 170, -112, 112, 0, ph, M.plinth, 1.6)}<g transform="translate(0,${f(-ph * CE)})">${lb.svg}</g></g>`);
}
const wallet = O.rack(PROPS.wallet, { id: "wallet", tag: "WALLET" }); addP("wallet", PROPS.wallet, wallet.svg);
addP("shield", PROPS.shield, O.shield(PROPS.shield, { id: "shield" }).svg);
addP("appr", PROPS.approver, O.person(PROPS.approver, { id: "appr", role: "signer" }).svg);
addP("pod", PROPS.podium, podium(PROPS.podium, { id: "pod" }).svg);
const zhScr = `<rect x="0" y="0" width="320" height="200" fill="#ffffff"/><rect x="0" y="0" width="320" height="10" fill="#1d93ba"/>
  <text x="18" y="62" font-family="Noto Sans SC, sans-serif" font-size="40" font-weight="900" fill="#1c1c1c">转账</text>
  <text x="18" y="118" font-family="JetBrains Mono, monospace" font-size="32" font-weight="800" fill="#1c1c1c">20,000 USDT</text>
  <text x="18" y="172" font-family="Noto Sans SC, sans-serif" font-size="32" font-weight="900" fill="#17809f">→ 用户地址</text>`;
addP("mon", PROPS.monitor, monitor(PROPS.monitor, { id: "mon", screen: zhScr }).svg);
addP("viewer", PROPS.viewer, O.person(PROPS.viewer, { id: "viewer", role: "signer" }).svg);
addP("mpc", PROPS.mpc, O.rack(PROPS.mpc, { id: "mpc", tag: "MPC" }).svg);
addP("hsm", PROPS.hsm, O.hsm(PROPS.hsm, { id: "hsm" }).svg);
PROPS.signers.forEach((o, i) => addP("sig" + i, o, O.person(o, { id: "sig" + i, role: "signer", scale: 1.0 }).svg));
{
  const Lk = PROPS.padlock, lock = O.padlock({ u: Lk.u, v: Lk.v }, { id: "lock" }), [lx, ly] = at({ u: Lk.u, v: Lk.v });
  const sill = box({ u: GU(5), v: GV }, -50, 50, -96, -78, Lk.z - 6, Lk.z, M.white, 1.4);
  s2p.push("lockg");
  items.push({ y: at({ u: GU(5), v: GV })[1] + 1, o: { u: GU(5), v: GV }, id: "lockg", svg: `<g id="lockg">${sill}<g transform="translate(0,${f(-Lk.z * CE)}) translate(${f(lx)},${f(ly)}) scale(${Lk.scale}) translate(${f(-lx)},${f(-ly)})">${lock.svg}</g></g>` });
}
addP("tower", PROPS.tower, O.tower(PROPS.tower, { id: "tower" }).svg);

// ============================================================ custom skeuomorphic objects
/** flag on a pole: pole + base, red cloth in the +v face plane */
function flagObj(id, o, H = 210) {   // seg3b's flag: pole + red pennant
  let s = contactShadow(o, 34, 22) + cyl(o, 0, 0, 16, 0, 7, M.plinth, { seg: 18, sw: 1.2 }) + cyl(o, 0, 0, 4.5, 7, H, M.ink, { seg: 10, sw: 1 });
  s += sphere(id + "-k", o, 0, 0, H + 4, 7, M.chrome, 1.2);
  const t = at(o, 0, 0, H - 4);
  s += `<g id="${id}-cloth" data-sx="${f(t[0])}" data-sy="${f(t[1])}">${G_(faceV(o, 4, 0, H - 4), `<path d="M0 0L96 26L0 52Z" fill="#e0453a" stroke="#a8322a" stroke-width="2.4" stroke-linejoin="round"/><path d="M0 0L96 26L0 26Z" fill="#ffffff" opacity="0.18"/>`)}</g>`;
  return { svg: wrap(id, o, s), top: at(o, 40, 0, H + 8), mid: at(o, 100, 0, H - 30), pole: at(o, -10, 0, H - 30) };
}
/** third-party security appliance (box with shield emblem); crack overlay hidden */
function secBox(id, o) {
  const W = 220, D = 150, H = 150, u0 = -W / 2, v1 = D / 2;
  const m = { f: "#dfe4ea", s: "#c4cbd4", t: "#eef1f4", st: "#6d7580" };
  let s = contactShadow(o, 170, 110);
  for (const a of [u0 + 10, W / 2 - 26]) s += box(o, a, a + 16, v1 - 20, v1 - 6, 0, 8, M.dark, 1);
  s += rbox(o, u0, W / 2, -D / 2, v1, 8, H, 10, m, { sw: 2 });
  s += G_(faceTop(o, u0 + 20, -D / 2 + 20, H), Array.from({ length: 7 }, (_, i) => `<rect x="${i * 24}" y="0" width="12" height="${D - 40}" rx="6" fill="#cfd6de"/>`).join(""));
  let fp = `<rect x="10" y="10" width="${W - 20}" height="${H - 30}" rx="6" fill="#f7f8fa" stroke="#9aa3ad" stroke-width="2"/>`;
  fp += `<path d="M34 26Q56 18 78 26V58Q76 80 56 92Q36 80 34 58Z" fill="#1d93ba" stroke="#17809f" stroke-width="2"/><path d="M44 56l9 9l16 -18" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  fp += T(96, 52, "SECURITY", { size: 17, mono: true, w: 800, fill: "#4a5560" }) + `<rect x="96" y="64" width="96" height="8" rx="4" fill="#d3d9e0"/><rect x="96" y="80" width="70" height="8" rx="4" fill="#d3d9e0"/>`;
  fp += `<circle cx="186" cy="104" r="5" fill="#2bd46f"/>`;
  s += G_(faceV(o, u0, v1, H - 4), fp);
  // crack (front face + top), hidden until the zero-day
  const crack = G_(faceV(o, u0, v1, H), `<path d="M118 0L104 26L126 44L98 72L118 96L102 130" fill="none" stroke="#1c1c1c" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><path d="M118 0L104 26L126 44L98 72L118 96L102 130" fill="none" stroke="#e0453a" stroke-width="2.6" stroke-linejoin="round"/>`) +
    G_(faceTop(o, u0, -D / 2, H), `<path d="M118 ${D}L132 ${D - 40}L116 ${D - 70}L134 ${D - 110}" fill="none" stroke="#1c1c1c" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`);
  s += `<g id="${id}-crack" opacity="0">${crack}</g>`;
  return { svg: wrap(id, o, s), top: at(o, 0, 0, H + 40), crack: at(o, u0 + 110, v1, H * 0.45), center: at(o, 0, 0, H / 2) };
}
/** credential key-card standing in the +v plane (drawn at o, z) */
function keyCard(id, o, z, text = "凭证") {
  const m = frameV(o, -48, 0, z + 64);
  const face = `<rect x="0" y="0" width="96" height="64" rx="8" fill="#fffdf8" stroke="#6b665c" stroke-width="2.6"/><rect x="0" y="0" width="96" height="16" rx="8" fill="#1d93ba"/><rect x="0" y="10" width="96" height="6" fill="#1d93ba"/>
    <circle cx="26" cy="40" r="11" fill="none" stroke="#b58630" stroke-width="5"/><path d="M37 40H78M66 40V50M74 40V48" stroke="#b58630" stroke-width="5" stroke-linecap="round"/>`;
  let back = "";
  for (let i = 4; i >= 1; i--) back += `<g transform="translate(${f(-i * VV[0])},${f(-i * VV[1])})">${G_(matStr(m), `<rect x="0" y="0" width="96" height="64" rx="8" fill="#d8d1c4"/>`)}</g>`;
  return { svg: `<g id="${id}" opacity="0">${back}${G_(matStr(m), face)}</g>`, c: at(o, 0, 0, z + 32) };
}
/** dashed "second screen" placeholder: an empty monitor outline with a question mark */
function ghostScreen(id, o) {
  const m = frameV(o, -120, 0, 240);
  const s = contactShadow(o, 120, 50) + flat(o, [[-60, -30], [60, -30], [60, 30], [-60, 30]], 0, "none", "#9a9488", 3, `stroke-dasharray="10 8"`) +
    line3(o, [[0, 0, 0], [0, 0, 80]], "#9a9488", 4, `stroke-dasharray="8 7"`) +
    G_(matStr(m), `<rect x="0" y="0" width="240" height="160" rx="10" fill="rgba(255,253,248,0.55)" stroke="#9a9488" stroke-width="4" stroke-dasharray="14 10"/>${T(120, 112, "?", { size: 96, a: "middle", fill: "#9a9488" })}`);
  return { svg: wrap(id, o, s), top: at(o, 0, 0, 280) };
}
/** round meeting table */
function table(id, o) {
  let s = contactShadow(o, 170, 120) + cyl(o, 0, 0, 46, 0, 8, M.dark, { seg: 28, sw: 1.2 }) + cyl(o, 0, 0, 12, 8, 92, M.dark, { seg: 16, sw: 1 });
  s += cyl(o, 0, 0, 150, 92, 104, M.wood, { seg: 48, sw: 1.8 });
  return { svg: wrap(id, o, s), top: at(o, 0, 0, 104) };
}
/** paper lying on a horizontal plane at height z with blurred (unreadable) content */
function fuzzyDoc(id, o, z, red = false) {
  const Wd = 150, Hd = 190;
  const m = faceTop(o, -Wd / 2, -Hd / 2, z + 2);
  const edge = red ? "#e0453a" : "#b8b0a1";
  const body = `<rect x="0" y="0" width="${Wd}" height="${Hd}" rx="4" fill="#fffdf8" stroke="${edge}" stroke-width="2"/>
    <g filter="url(#blur3)">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="12" y="${16 + i * 18}" width="${[86, 70, 92, 60, 80, 50][i]}" height="8" rx="4" fill="#7d776b"/>`).join("")}</g>
    <g id="${id}-sm" opacity="0"><g transform="translate(86,118) rotate(-12)"><circle r="22" fill="none" stroke="#d93a2f" stroke-width="4"/><circle r="17" fill="none" stroke="#d93a2f" stroke-width="1.2"/>${T(0, 6, "签", { size: 16, a: "middle", fill: "#d93a2f" })}</g></g>`;
  return { svg: `<g id="${id}" opacity="0">${G_(`translate(0,${f(2 * CE)})`, G_(m, `<rect x="0" y="0" width="${Wd}" height="${Hd}" rx="4" fill="#d8d1c4"/>`))}${G_(m, body)}</g>`, c: at(o, 0, 0, z + 2) };
}
/** filing cabinet with a top drawer that can be open (tray out) or closed */
function cabinet(id, o) {
  const W = 200, D = 150, H = 250, u0 = -W / 2, v1 = D / 2;
  const m = M.steelLight;
  let s = contactShadow(o, 160, 110) + box(o, u0, W / 2, -D / 2, v1, 0, H, m, 2);
  // lower drawer (static)
  s += G_(faceV(o, u0, v1, 112), `<rect x="12" y="8" width="${W - 24}" height="96" rx="5" fill="#b9bec5" stroke="#5a6068" stroke-width="2"/><rect x="${W / 2 - 30}" y="30" width="60" height="12" rx="6" fill="#5a6068"/><rect x="${W / 2 - 22}" y="56" width="44" height="22" rx="2" fill="#f6f3ec" stroke="#8b9199"/>`);
  // top drawer closed face
  const closed = G_(faceV(o, u0, v1, H - 10), `<rect x="12" y="6" width="${W - 24}" height="112" rx="5" fill="#b9bec5" stroke="#5a6068" stroke-width="2"/><rect x="${W / 2 - 30}" y="30" width="60" height="12" rx="6" fill="#5a6068"/><rect x="${W / 2 - 22}" y="58" width="44" height="22" rx="2" fill="#f6f3ec" stroke="#8b9199"/>`);
  // open: tray pulled out 120 toward +v
  const dv = 120, zt0 = H - 128, zt1 = H - 16;
  let open = G_(faceV(o, u0, v1, H - 10), `<rect x="12" y="6" width="${W - 24}" height="112" rx="5" fill="#2e3136"/>`);
  open += box(o, u0 + 14, W / 2 - 14, v1 - 10, v1 + dv - 8, zt0, zt0 + 8, { f: "#9aa0a8", s: "#7d838b", t: "#c3c8ce", st: "#4b4f56" }, 1.4);
  open += `<polygon points="${pts([at(o, u0 + 14, v1 - 10, zt0 + 8), at(o, W / 2 - 14, v1 - 10, zt0 + 8), at(o, W / 2 - 14, v1 + dv - 8, zt0 + 8), at(o, u0 + 14, v1 + dv - 8, zt0 + 8)])}" fill="#3b3e44"/>`;
  open += box(o, u0 + 14, u0 + 22, v1 - 10, v1 + dv - 8, zt0, zt1 - 30, m, 1.2);
  open += box(o, u0 + 12, W / 2 - 12, v1 + dv - 8, v1 + dv + 4, zt0 - 4, zt1, { f: "#c3c8ce", s: "#b9bec5", t: "#d6dade", st: "#5a6068" }, 1.8);
  open += G_(faceV(o, u0 + 12, v1 + dv + 4, zt1), `<rect x="${W / 2 - 42}" y="34" width="60" height="12" rx="6" fill="#5a6068"/>`);
  s += `<g id="${id}-closed" opacity="0">${closed}</g><g id="${id}-open">${open}</g>`;
  return { svg: wrap(id, o, s), top: at(o, 0, 0, H + 40), tray: at(o, 0, v1 + dv / 2, zt0 + 10) };
}
/** small stone bridge along u: deck, arches on the +v face, railings, ramps */
function bridge(id, o, len = 560) {
  const hl = len / 2, hv = 110, zd = 70;
  const stone = { f: "#d9d1c3", s: "#c4baa8", t: "#ebe5da", st: "#8f8573" };
  let s = contactShadow(o, hl * 0.9, 150);
  s += wedge(o, -hl - 110, -hl, -hv, hv, 0, zd + 16, stone, "-u", 0);
  s += box(o, -hl, hl, -hv, hv, 0, zd + 16, stone, 2);
  // arches on the visible +v face
  const archW = len / 3;
  s += G_(faceV(o, -hl, hv, zd), [0, 1, 2].map((i) => `<path d="M${i * archW + 18} ${zd}V${zd * 0.55}A${archW / 2 - 18} ${zd * 0.45} 0 0 1 ${(i + 1) * archW - 18} ${zd * 0.55}V${zd}Z" fill="#8fb9c9" stroke="${stone.st}" stroke-width="2"/>`).join("") +
    `<path d="M0 ${zd + 4}H${len}" stroke="#7fb0c2" stroke-width="6"/>`);
  s += wedge(o, hl, hl + 110, -hv, hv, 0, zd + 16, stone, "+u", 0);
  // deck surface + railings
  s += flat(o, [[-hl - 100, -hv + 16], [hl + 100, -hv + 16], [hl + 100, hv - 16], [-hl - 100, hv - 16]], zd + 16.5, "#f2ede4", "none");
  for (const vv of [-hv + 6, hv - 6]) {
    for (let u = -hl; u <= hl; u += 70) s += box(o, u - 5, u + 5, vv - 5, vv + 5, zd + 16, zd + 64, { f: "#c4baa8", s: "#b0a690", t: "#ddd5c6", st: "#7d735f" }, 1.2);
    s += box(o, -hl - 4, hl + 4, vv - 6, vv + 6, zd + 60, zd + 70, stone, 1.4);
  }
  return { svg: wrap(id, o, s), top: at(o, 0, 0, zd + 150) };
}
/** red aiming reticle (screen-plane overlay) centred at p */
const reticle = (id, p) => `<g id="${id}" opacity="0" data-x="${f(p[0])}" data-y="${f(p[1])}"><g transform="translate(${f(p[0])},${f(p[1])})">
  <circle r="150" fill="none" stroke="#e0453a" stroke-width="6"/><circle r="104" fill="none" stroke="#e0453a" stroke-width="3" stroke-dasharray="14 10"/>
  <path d="M0 -190V-120M0 120V190M-190 0H-120M120 0H190" stroke="#e0453a" stroke-width="7" stroke-linecap="round"/><circle r="10" fill="#e0453a"/></g></g>`;

// ============================================================ ① Bitget scene (in front of ②)
const BG = {
  srv: PROPS.wallet, sec: { u: 280, v: 718 }, atk: { u: 720, v: 838 }, safe: { u: 1220, v: 618 }, kland: { u: 480, v: 838 },
};
L("l-bsrv", wallet.anchors.top, "② 钱包后台", "lab-sm");
const bSec = secBox("bsec", BG.sec); add(BG.sec, bSec.svg); hidden.push("bsec");
L("l-bsec", bSec.top, "第三方安全产品", "lab-sm");
L("l-zero", at(BG.sec, -110, 40, 120), "零日漏洞", "lab-rs", "r");
L("l-noname", at(BG.sec, -40, 120, 20), "产品名未公开", "lab-src", "b");  // 原锚点朝下会落进字幕区，改朝上
const bAtk = O.person(BG.atk, { id: "batk", role: "attacker", scale: 1.1 }); add(BG.atk, bAtk.svg); hidden.push("batk");
L("l-batk", at(BG.atk, 0, 0, 250), "攻击者", "lab-rs lab-sm");
L("l-tool", at(BG.atk, 30, 60, 110), `<svg width="30" height="30" viewBox="0 0 30 30"><path d="M19 3a7 7 0 0 0-6.6 9.3L3.5 21.2a2.6 2.6 0 0 0 3.7 3.7l8.9-8.9A7 7 0 0 0 26 9.4l-4.2 4.2-3.9-1.3-1.3-3.9L20.8 4.2A7 7 0 0 0 19 3z" fill="#e0453a"/></svg>定制工具`, "lab-r", "l");
const bKey = keyCard("bkey", BG.kland, 0); pos.bkeyC = bKey.c;
pos.bkeyFrom = bSec.crack; pos.bkeyAtk = at(BG.atk, 40, 30, 120);
const bSafe = O.safe(BG.safe, { id: "bsafe", plate: "COLD" }); add(BG.safe, bSafe.svg); hidden.push("bsafe");
L("l-bsafe", bSafe.anchors.top, `私钥 · 冷钱包 <b>✓</b>`, "lab-gs");
L("l-bsafe-src", at(BG.safe, 60, 160, 0), "Bitget 称", "lab-src", "r");
L("l-ikey", at(BG.kland, 0, 0, 80), "内部凭证", "lab-cs lab-sm");
// forged envelope: starts at attacker's hand, flies into the backend server
const bEnvO = { u: BG.atk.u + 70, v: BG.atk.v - 40 };
const bEnv = O.envelope(bEnvO, { id: "benv-e", state: "attacker" });
pos.benv0 = at(bEnvO, 0, 0, 120); pos.benv1 = at(BG.srv, 0, 90, 180);
L("l-forge", at(BG.srv, -60, 90, 140), "伪造的提现指令", "lab-rs", "r");

// ============================================================ ② WazirX scene (in front of ④)
const WZ = { mon: { u: 1720, v: 578 }, doc: { u: 2080, v: 538 }, pW: { u: 1340, v: 358 }, pL: { u: 2260, v: 838 } };
const monScr = `<rect x="0" y="0" width="148" height="88" fill="#ffffff"/><rect x="0" y="0" width="148" height="16" fill="#ece7dd"/>${T(6, 12, "Liminal", { size: 11, w: 800, fill: "#5f5a50" })}
  <rect x="10" y="26" width="128" height="52" rx="6" fill="#e3f4ea"/><circle cx="30" cy="52" r="12" fill="#1f9d55"/><path d="M24 52l5 5l8 -9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  ${T(48, 58, "正常交易", { size: 18, fill: "#1f9d55" })}`;
const wMon = O.desk(WZ.mon, { id: "wmon", screen: monScr }); add(WZ.mon, wMon.svg); hidden.push("wmon");
L("l-wmon", at(WZ.mon, 0, 150, 0), "托管方 Liminal 界面", "lab-sm", "t");
L("l-wshow", wMon.anchors.top, "显示：正常交易", "lab-gs");
const wDoc = O.doc(WZ.doc, { id: "wdoc", state: "attacker", standing: true, title: "实际交易", lines: ["to: 0x…", "data: ……", "签名 ✓"] });
add(WZ.doc, `<g id="wdoc-mv">${wDoc.svg}</g>`); hidden.push("wdoc");
pos.wdocShift = [at(WZ.mon, 0, 0, 0)[0] - at(WZ.doc, 0, 0, 0)[0], at(WZ.mon, 0, 0, 0)[1] - at(WZ.doc, 0, 0, 0)[1]];
L("l-wdoc", wDoc.anchors.top, "实际签的", "lab-rs");
PIN("neq", at({ u: (WZ.mon.u + WZ.doc.u) / 2 + 30, v: 498 }, 0, 0, 170), `<div class="neq hide" id="neq">≠</div>`);
const pW = O.person(WZ.pW, { id: "pw", role: "signer", scale: 1.0 }); add(WZ.pW, pW.svg); hidden.push("pw");
const pL = O.person(WZ.pL, { id: "pl", role: "engineer", scale: 1.0 }); add(WZ.pL, pL.svg); hidden.push("pl");
PIN("bubW", at(WZ.pW, 0, 0, 230), `<div class="bub hide" id="bubW"><b>WazirX</b>显示和实际不一致</div>`, "b");
PIN("bubL", at(WZ.pL, 0, 0, 230), `<div class="bub hide" id="bubL"><b>Liminal</b>我们没被攻破</div>`, "b");
L("l-wconf", at({ u: 2160, v: 1018 }, 0, 0, 0), "说法冲突 · 未见独立报告", "lab-src", "t");  // 右移，避开“托管方 Liminal 界面”

// ============================================================ ③ Bybit scene (behind ④/⑤)
const BY = {
  desk: { u: 1240, v: -862 }, atk: { u: 1420, v: -602 }, s3: { u: 1620, v: -882 }, brw: { u: 2020, v: -922 }, clk: { u: 1690, v: -622 },
  sA: { u: 2560, v: -922 }, sB: { u: 2900, v: -922 }, sC: { u: 3240, v: -922 }, ghost: { u: 2320, v: -762 },
  p: [{ u: 1830, v: -582 }, { u: 1960, v: -542 }, { u: 2090, v: -502 }],
};
const redScr = `<rect x="0" y="0" width="148" height="88" fill="#fde6e3"/><rect x="0" y="0" width="148" height="16" fill="#e0453a"/><path d="M58 30l32 32M90 30l-32 32" stroke="#e0453a" stroke-width="8" stroke-linecap="round"/>`;
const yDesk = O.desk(BY.desk, { id: "ydesk", screen2: redScr }); add(BY.desk, yDesk.svg); hidden.push("ydesk");
L("l-ydesk", yDesk.anchors.top, "开发者电脑", "lab-sm");
L("l-ydesk2", yDesk.anchors.top, "被攻破", "lab-rs");
const yAtk = O.person(BY.atk, { id: "yatk", role: "attacker", scale: 1.0 }); add(BY.atk, yAtk.svg); hidden.push("yatk");
const yS3 = O.bucket(BY.s3, { id: "ys3" }); add(BY.s3, yS3.svg); hidden.push("ys3");
L("l-ys3", yS3.anchors.top, "S3 · 前端代码", "lab-sm");
// tampered JS file rising from the bucket (standing, red) — crossfades back to normal
const jsFile = (id, red) => {
  const m = frameV(BY.s3, -45, 10, 300);
  const st = red ? "#e0453a" : "#8d939b", fill = red ? "#fde6e3" : "#ffffff";
  return `<g id="${id}" opacity="0">${G_(matStr(m), `<path d="M0 0H64L90 26V150H0Z" fill="${fill}" stroke="${st}" stroke-width="4" stroke-linejoin="round"/><path d="M64 0V26H90" fill="none" stroke="${st}" stroke-width="3"/>
    ${T(45, 70, "JS", { size: 34, mono: true, a: "middle", fill: red ? "#e0453a" : "#17809f", w: 800 })}<rect x="14" y="92" width="62" height="8" rx="4" fill="${red ? "#f3a39b" : "#d3d7dc"}"/><rect x="14" y="110" width="44" height="8" rx="4" fill="${red ? "#f3a39b" : "#d3d7dc"}"/>`)}</g>`;
};
pos.jsC = at(BY.s3, 0, 10, 230);
L("l-js", at(BY.s3, -90, 10, 200), "被改", "lab-rs", "r");
L("l-js2", at(BY.s3, -90, 10, 200), "已换回", "lab-g", "r");
const yBrw = O.browserWin(BY.brw, { id: "ybrw" }); add(BY.brw, yBrw.svg); hidden.push("ybrw");
L("l-ybrw", yBrw.anchors.top, "Safe{Wallet} 网页", "lab-sm");
L("l-ybrw2", at(BY.brw, 0, 14, 400), "同一个被篡改的前端", "lab-rs");
const ySafes = ["sA", "sB", "sC"].map((k) => { const s = O.safe(BY[k], { id: "y" + k, plate: "COLD" }); add(BY[k], s.svg); hidden.push("y" + k); return s; });
L("l-ysB", ySafes[1].anchors.top, "Bybit 冷钱包", "lab-rs");
L("l-ysA", ySafes[0].anchors.top, "不受影响", "lab-g");
L("l-ysC", ySafes[2].anchors.top, "不受影响", "lab-g");
pos.ysB = ySafes[1].anchors.center;
const yClk = O.clock(BY.clk, { id: "yclk", h: 10, m: 0 }); add(BY.clk, yClk.svg); hidden.push("yclk");
L("l-yclk", at(BY.clk, 0, 0, 190), "约 2 分钟后", "lab-cs");
const ySign = BY.p.map((o, i) => { const p = O.person(o, { id: "yp" + i, role: "signer", scale: 1.0 }); add(o, p.svg); hidden.push("yp" + i); return p; });
L("l-yp", at(BY.p[0], -120, 60, 30), "签名人", "lab-sm", "r");
const yGhost = ghostScreen("yghost", BY.ghost); add(BY.ghost, yGhost.svg); hidden.push("yghost");
L("l-yghost", yGhost.top, "第二个核对来源？", "lab-g");
// sight lines signer head → browser page
const brwPage = at(BY.brw, 0, 14, 170);
const sight = BY.p.map((o, i) => { const h = at(o, 0, 0, 170); return `<path id="ysl${i}" d="M${f(h[0])} ${f(h[1])}L${f(brwPage[0])} ${f(brwPage[1])}" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="10 8" fill="none" opacity="0"/>`; }).join("");
const yCurve = dashCurve("ycur", pos.jsC, at(BY.brw, -60, 14, 200), { c1: [pos.jsC[0] + 140, pos.jsC[1] - 160], c2: [at(BY.brw, -60, 14, 200)[0] - 120, at(BY.brw, -60, 14, 200)[1] - 160] });
const yCurve2 = dashCurve("ycur2", at(BY.brw, 150, 14, 200), at(BY.sB, -60, 120, 200), { c1: [at(BY.brw, 150, 14, 200)[0] + 160, at(BY.brw, 150, 14, 200)[1] - 160], c2: [at(BY.sB, -60, 120, 200)[0] - 160, at(BY.sB, -60, 120, 200)[1] - 200] });
const yKey = keyCard("ykey", BY.desk, 230);
pos.ykey0 = yKey.c; pos.ykey1 = at(BY.atk, 40, 20, 130); pos.ykey2 = at(BY.s3, 0, 0, 150);
L("l-ykey", yKey.c, "AWS 会话令牌", "lab-cs", "b");

// ============================================================ ④ Drift scene (behind ⑤)
const DR = { tbl: { u: 2600, v: -842 }, lock: { u: 2200, v: -682 }, hg: { u: 2960, v: -622 }, cab: { u: 3200, v: -1022 }, atk: { u: 3000, v: -862 }, clk: { u: 3460, v: -822 } };
const dTbl = table("dtbl", DR.tbl); add(DR.tbl, dTbl.svg); hidden.push("dtbl");
const ringA = [200, 260, 330, 30, 120];   // degrees around the table (plan angle)
const lit = [0, 1];
const dPs = ringA.map((a, i) => { const r = 250, o = { u: DR.tbl.u + r * Math.cos((a * Math.PI) / 180), v: DR.tbl.v + r * Math.sin((a * Math.PI) / 180) }; const p = O.person(o, { id: "dp" + i, role: "signer", scale: 0.95 }); add(o, (lit.includes(i) ? `<g id="dring${i}" opacity="0">${G_(faceTop(o, 0, 0, 1), `<circle r="70" fill="none" stroke="#1f9d55" stroke-width="8"/>`)}</g>` : "") + p.svg); hidden.push("dp" + i); return { o, p }; });
L("l-dtbl", at(DR.tbl, -60, -60, 420), "安全委员会 · 5 人", "lab-sm");
L("l-d25", at(DR.tbl, -60, -60, 420), "5 人里 2 人签名即生效", "lab-cs");
dPs.forEach((d, i) => { if (lit.includes(i)) PIN("dck" + i, at(d.o, 0, 0, 245), `<div class="ck hide" id="dck${i}"></div>`, "b"); });
const dLock = O.padlock(DR.lock, { id: "dlock" }); add(DR.lock, dLock.svg); hidden.push("dlock");
L("l-dlock", at(DR.lock, 0, 0, 230), "时间锁", "lab-sm");
L("l-dlock2", at(DR.lock, 0, 60, 0), "迁移后：没有时间锁", "lab-rs", "t");
// two pre-signed (unreadable) documents on the table, in front of the two lit members
const dDocO = [{ u: DR.tbl.u - 60, v: DR.tbl.v + 10 }, { u: DR.tbl.u + 40, v: DR.tbl.v + 60 }];
const dDocs = dDocO.map((o, i) => fuzzyDoc("ddoc" + i, o, 104));
L("l-ddoc", at(DR.tbl, -170, 40, 110), "没完全看懂 ?", "lab-r", "r");
const dHg = O.hourglass(DR.hg, { id: "dhg" }); add(DR.hg, dHg.svg); hidden.push("dhg");
L("l-dhg", at(DR.hg, 0, 0, 260), "持久 nonce · 不会过期", "lab-cs");
const dCab = cabinet("dcab", DR.cab); add(DR.cab, dCab.svg); hidden.push("dcab");
L("l-dcab", dCab.top, "签好的交易 · 先收起来", "lab-sm");
const dAtk = O.person(DR.atk, { id: "datk", role: "attacker", scale: 1.0 }); add(DR.atk, dAtk.svg); hidden.push("datk");
const dClk = O.clock(DR.clk, { id: "dclk", h: 9, m: 0 }); add(DR.clk, dClk.svg); hidden.push("dclk");
L("l-dclk", at(DR.clk, 40, 60, 0), "等待……", "lab-cs", "t");
pos.ddoc = dDocs.map((d) => d.c); pos.dtray = dCab.tray; pos.dsubmit = at({ u: GU(5) - 120, v: 0 }, 0, 0, 0);
L("l-dsub", at({ u: GU(5) - 100, v: 60 }, 0, 0, 40), "提交", "lab-rs", "t");

// ============================================================ ⑤ KelpDAO scene (data-source branch)
const KE = {
  R: [{ u: RPC.u, v: RPC.v }, { u: 2880, v: 1130 }, { u: 2380, v: 1110 }, { u: 2460, v: 1350 }, { u: 2700, v: 1430 }],
  ver: { u: 3180, v: 890 }, brg: { u: 3660, v: 952 }, other: { u: 2540, v: 1690 }, docAt: { u: 3140, v: 1330 },
};
const kR = KE.R.map((o, i) => {
  const n = O.rpc(o, { id: "kr" + i }); const r = O.rpc(o, { id: "krr" + i, state: "attacker", led: "red" });
  add(o, n.svg + (i < 2 ? `<g id="krr${i}-w" opacity="0">${r.svg}</g>` : ""));
  if (i > 0) hidden.push("kr" + i);
  return n;
});
LV("lbr", at(KE.R[0], -80, 60, 120), "数据源 RPC", "lab-cs gl", "r");
L("l-kswap", at({ u: 2780, v: 1030 }, 0, 0, 330), "被替换的两个 RPC", "lab-rs");
L("l-kddos", at(KE.R[3], -90, 60, 40), "DDoS 打掉其他节点", "lab-r", "r");
const kBrg = bridge("kbrg", KE.brg); add(KE.brg, kBrg.svg, -60); hidden.push("kbrg");
L("l-kbrg", kBrg.top, "跨链桥", "lab-sm");
const kVer = O.checkpoint(KE.ver, { id: "kver", n: "验" }); add(KE.ver, kVer.svg); hidden.push("kver");
L("l-kver", kVer.anchors.top, "验证者 × 1", "lab-cs");
L("l-kok", at(KE.ver, 60, -146, 120), "验证者本身没被攻破", "lab-gs", "l");
const verIn = at(KE.ver, -60, -60, 0);
const kLines = KE.R.map((o, i) => { const a = at(o, 0, 0, 0); return `<path id="kln${i}" d="M${f(a[0])} ${f(a[1])}L${f(verIn[0])} ${f(verIn[1])}" stroke="#2aa3c9" stroke-width="5" stroke-dasharray="12 9" fill="none" opacity="0"/>` + (i < 2 ? `<path id="klr${i}" d="M${f(a[0])} ${f(a[1])}L${f(verIn[0])} ${f(verIn[1])}" stroke="#e0453a" stroke-width="7" stroke-dasharray="14 9" fill="none" opacity="0"/>` : ""); }).join("");
const kOther = O.person(KE.other, { id: "koth", role: "engineer", scale: 1.0 }); add(KE.other, kOther.svg); hidden.push("koth");
L("l-koth", at(KE.other, -50, 0, 120), "其他人", "lab-sm", "r");
// fake data sheet (red) lands in front of the verifier; a true sheet goes to "others"
const fakeDoc = O.doc(KE.docAt, { id: "kfake", state: "attacker", title: "数据单", lines: ["区块 #…", "状态：已发送", "金额 ……"] });
pos.kfake1 = at(KE.docAt, 0, 0, 0); pos.kfake0 = at(KE.R[0], 0, 0, 140);
const trueDocO = { u: KE.other.u + 130, v: KE.other.v - 60 };
const trueDoc = O.doc(trueDocO, { id: "ktrue", title: "数据单", lines: ["区块 #…", "状态：真实", "金额 ……"], w: 160, h: 210 });
pos.ktrue1 = at(trueDocO); pos.ktrue0 = at(KE.R[0], 0, 0, 140);
L("l-kfake", at(KE.docAt, 110, -110, 10), "假数据", "lab-rs", "l");
L("l-ktrue", at(trueDocO, 0, 0, 90), "真数据", "lab-gs");
// green seal: recolour the kit seal's red mark to green
const sealO = { u: KE.docAt.u + 36, v: KE.docAt.v - 8 };
const kSeal = O.seal(sealO, { id: "kseal", paper: false, stamped: false, text: "验证者签名", markText: "签名" });
const kSealSvg = kSeal.svg.replaceAll("#d93a2f", "#1f9d55");
L("l-kseal", at(KE.docAt, -40, 150, 0), "诚实签名 ✓", "lab-gs", "t");
L("l-ksrc", at(KE.R[2], -60, -120, 280), "LayerZero 称", "lab-src", "r");
L("l-klaw", at(KE.docAt, -40, 150, 0), "责任有争议 · 诉讼中", "lab-src", "t");
// DDoS swarm: small red envelopes from off to the lower-left into nodes 2..4
const swarm = [];
for (let k = 0; k < 12; k++) {
  const tgt = 2 + (k % 3);
  const to = at(KE.R[tgt], -30 + ((k * 23) % 60), 20 + ((k * 31) % 40), 90 + ((k * 17) % 50));
  const from = [to[0] - 520 - ((k * 67) % 260), to[1] + 260 + ((k * 41) % 200)];
  swarm.push({ id: "dd" + k, from, to, t: (k * 0.07) });
}
const swarmSvg = swarm.map((s) => `<g id="${s.id}" opacity="0"><g transform="translate(${f(s.from[0])},${f(s.from[1])})"><g transform="rotate(-14)"><rect x="-30" y="-20" width="60" height="40" rx="5" fill="#fde6e3" stroke="#e0453a" stroke-width="4"/><path d="M-27 -16L0 4L27 -16" fill="none" stroke="#e0453a" stroke-width="4" stroke-linejoin="round"/></g></g></g>`).join("");

// ============================================================ flags
const FL = [   // positions = seg3b's FL
  { id: "f1", o: { u: GU(2) + 130, v: 230 }, full: "Bitget · 2026.09 · 约 3.9 亿美元", short: "Bitget", H: 210 },
  { id: "f2", o: { u: GU(4) + 130, v: 230 }, full: "WazirX · 2024.07 · 约 2.3 亿美元", short: "WazirX", H: 210 },
  { id: "f3", o: { u: GU(4) - 110, v: 230 }, full: "Bybit · 2025.02 · 约 15 亿美元", short: "Bybit", H: 470 },
  { id: "f4", o: { u: GU(5) - 20, v: 230 }, full: "Drift · 2026.04 · 约 2.85 亿美元", short: "Drift", H: 210 },
  { id: "f5", o: { u: BRANCH.u - 140, v: 960 }, full: "KelpDAO · 2026.04 · 约 2.92 亿美元", short: "KelpDAO", H: 230 },
];
FL.forEach((fl) => { const fo = flagObj(fl.id, fl.o, fl.H); add(fl.o, fo.svg); hidden.push(fl.id);
  const an = "b", tp = fl.id === "f3" ? [fo.top[0], fo.top[1] - 170] : fo.top;   // Bybit 旗子很高，标签再抬高一截，避开 ④ 关名
  L("l-" + fl.id, tp, fl.full, "lab-rs", an); L("l-" + fl.id + "s", tp, fl.short, "lab-rs lab-sm", an); });

// ============================================================ assemble world svg
const objSvg = items.slice().sort((a, b) => a.y - b.y).map((b) => b.svg).join("\n");
const fliers = bKey.svg + `<g id="benv" opacity="0">${bEnv.svg}</g>` + yKey.svg + jsFile("yjs", false) + jsFile("yjsr", true) +
  dDocs.map((d) => d.svg).join("") + `<g id="kfake-w" opacity="0">${fakeDoc.svg}</g><g id="ktrue-w" opacity="0">${trueDoc.svg}</g>` +
  `<g id="kseal-w" opacity="0">${kSealSvg}</g>` + swarmSvg;
const overlays = sight + yCurve.svg + yCurve2.svg + reticle("yret", pos.ysB);
const defs = `<defs><filter id="blur3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
const world = worldSvg("world-svg", defs + gridSvg({ u0: -2600, u1: 6200, v0: -3000, v1: 4200 }) + ground + kLines + objSvg + fliers + overlays, [-1800, -2600, 7800, 5000]);

// ============================================================ cameras
const SX = 700, SY = 500;        // world area centre (left of the event-card column)
const camW = (u, v, z, k, sx = SX, sy = SY) => camAt(Wp(u, v, z), sx, sy, k);
const fit = (P, x0, y0, x1, y1) => { const xs = P.map((q) => q[0]), ys = P.map((q) => q[1]);
  const k = Math.min((x1 - x0) / (Math.max(...xs) - Math.min(...xs)), (y1 - y0) / (Math.max(...ys) - Math.min(...ys)));
  return camAt([(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000); };
const OVP = [Wp(-330, 148), Wp(-330, -200, 340), Wp(4760, 0, 160), Wp(3058, -527, 470), Wp(BRANCH.u, RPC.v + 60), Wp(BRANCH.u + 150, 700, 0)];
const CAMS = {
  END: camAt([-420, 280], 40, 860, 0.31),                // = seg3b's first camera (PAN)
  START: camW(2520, -200, 110, 0.78, 940, 560),          // = seg2's last camera ("end")
  OV: fit(OVP, 60, 190, 1340, 860),
  G2: camW(600, 160, 170, 0.72),
  MID2: camW(1360, 120, 0, 0.46),
  G4F: camW(1820, 458, 140, 0.8),
  G4M: camW(1860, -262, 0, 0.46),
  BY1: camW(1360, -742, 150, 0.86),
  BY2: camW(1660, -782, 150, 0.82),
  BY3: camW(2240, -822, 170, 0.58),
  BY4: camW(2000, -702, 150, 0.82),
  MID45: camW(2240, 0, 0, 0.48),
  G5B: camW(2600, -762, 150, 0.9),
  DR2: camW(2900, -782, 150, 0.8),
  MID5: camW(2600, 420, 0, 0.44),
  KE: camW(2960, 1110, 120, 0.62),
  KE2: camW(2820, 1290, 110, 0.7),
  KEC: camW(3110, 1300, 30, 1.8, 640, 520),
};

// ============================================================ event cards (screen space, right column)
// same card style and positions as seg3b (src/build-story.mjs there), so the cut at 142.3 s is seamless
const EV = [
  ["②", "Bitget", "2026.09 · 约 3.9 亿美元", "Bitget 称"],
  ["④", "WazirX", "2024.07 · 约 2.3 亿美元", "说法冲突"],
  ["④", "Bybit", "2025.02 · 约 15 亿美元", "FBI 口径"],
  ["⑤", "Drift", "2026.04 · 约 2.85 亿美元", "Chainalysis 分析"],
  ["支线", "KelpDAO", "2026.04 · 约 2.92 亿美元", "LayerZero 称"],
];
const evCard = (n, name, sub, src, i) => `<div class="ev hide" id="card${i}" style="top:${(i - 1) * 116}px"><div class="ev-g${n.length > 1 ? " ev-g2" : ""}">${n}</div><div class="ev-m"><div class="ev-r1"><span class="ev-n">${name}</span><span class="ev-src hide" id="card${i}-s">${src}</span></div><div class="ev-s hide" id="card${i}-a">${sub}</div></div></div>`;
const cardsHtml = `<div id="evcol">${[1, 2, 3, 4, 5, 6].map((i) => `<div class="ev ev-empty hide" data-layout-allow-overlap id="slot${i}" style="top:${(i - 1) * 116}px"><span class="q" data-layout-ignore>${i}</span></div>`).join("")}${EV.map(([n, name, sub, src], i) => evCard(n, name, sub, src, i + 1)).join("")}</div>`;

const css = `
${kitCss()}
#root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
.lab-src { background: #ebe6dc; border-color: #ebe6dc; color: #5f5a50; font-size: 30px; box-shadow: none; }
.gl { font-size: 30px; padding: 3px 14px 5px; }
.lab-gate { background: #ffffff; border-color: #2aa3c9; color: #1c1c1c; font-size: 30px; font-weight: 900; padding: 3px 14px 5px; }
.lab-gate .gn { display: inline-block; color: #ffffff; background: #1d93ba; border-radius: 8px; padding: 0 8px; margin-right: 4px; font-weight: 900; }
.flag-s { font-size: 30px; padding: 2px 14px 4px; }
.lab b { font-weight: 900; }
.bub { position: relative; background: #ffffff; border: 3px solid #1c1c1c; border-radius: 18px; padding: 10px 22px 12px; font-size: 32px; font-weight: 800; white-space: nowrap;
  box-shadow: 0 8px 18px rgba(70,60,40,0.14); margin-bottom: 26px; }
.bub b { display: block; font-size: 30px; font-weight: 900; color: #1d93ba; }
.bub::after { content: ""; position: absolute; left: 50%; bottom: -22px; margin-left: -14px; border: 14px solid transparent; border-top: 20px solid #1c1c1c; border-bottom: 0; }
.neq { font-size: 150px; font-weight: 900; color: #e0453a; line-height: 1; text-shadow: 0 4px 0 #fffdf8; }
.ck { width: 56px; height: 56px; border-radius: 50%; background: #1f9d55; border: 4px solid #fff; box-shadow: 0 6px 14px rgba(20,110,60,0.25); position: relative; }
.ck::after { content: ""; position: absolute; left: 15px; top: 8px; width: 12px; height: 22px; border: solid #fff; border-width: 0 6px 6px 0; transform: rotate(45deg); }
#evpanel { position: absolute; left: 1360px; top: 0; width: 560px; height: 1080px; background: linear-gradient(to right, rgba(239,235,227,0) 0, #efebe3 70px); }
#evcol { position: absolute; left: 1424px; top: 128px; width: 452px; }
.ev { position: absolute; left: 0; width: 452px; height: 104px; background: #ffffff; border-radius: 16px; box-shadow: 0 0 0 0px #2aa3c9, 0 8px 20px rgba(70, 60, 40, 0.10);
  display: flex; align-items: center; gap: 14px; padding: 0 16px; }
.ev-g { flex: none; width: 54px; height: 54px; border-radius: 50%; background: #e0453a; color: #fff; font-size: 30px; font-weight: 900; display: flex; align-items: center; justify-content: center; }
.ev-g2 { width: 72px; border-radius: 27px; font-size: 28px; letter-spacing: -1px; }
.ev-m { flex: 1; min-width: 0; }
.ev-r1 { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ev-n { font-size: 30px; font-weight: 900; line-height: 1.15; white-space: nowrap; }
.ev-src { font-size: 28px; font-weight: 700; color: #6d685e; background: #f1ede5; border-radius: 8px; padding: 1px 10px 3px; white-space: nowrap; }
.ev-s { font-size: 28px; font-weight: 700; color: #4a463f; white-space: nowrap; font-variant-numeric: tabular-nums; line-height: 1.3; }
.ev-empty { background: transparent; box-shadow: none; border: 3px dashed #cfc7b8; justify-content: center; }
.ev-empty span { font-size: 34px; font-weight: 900; color: #b8b0a1; }
#veil { position: absolute; inset: 0; background: rgba(239,235,227,0.9); }
#ttl { left: 460px; top: 330px; min-height: 0; padding: 64px 40px 64px; }
#ttl .t-main { font-size: 96px; }
`;

const html = `<template>
  <style>${css}</style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels.join("")}</div>
      </div>
      <div id="evpanel"></div>
      ${cardsHtml}
      ${termCards(TERMS)}${pills(3)}
      <div id="veil"></div>
      <div class="k-title" id="ttl"><div class="t-main">断在哪一关</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
  (function () {
    const CAMS = ${JSON.stringify(CAMS)};
    const POS = ${JSON.stringify(pos)};
    const HIDDEN = ${JSON.stringify(hidden)};
    const SWARM = ${JSON.stringify(swarm)};
    const tl = gsap.timeline({ paused: true });
    const $ = (id) => document.getElementById(id);
    KIT.camSet(tl, CAMS.START);
    const S2P = ${JSON.stringify(s2p)}, DIM = 0.3, NEAR5 = ["mpc", "hsm", "sig0", "sig1", "sig2", "lockg"];
    const s2pTo = (t, op, d) => S2P.forEach((id) => tl.to("#" + id, { opacity: op, duration: d || 0.4 }, t));
    S2P.forEach((id) => tl.set("#" + id, { opacity: NEAR5.includes(id) ? 1 : 0.22 }, 0));
    // everything that grows later starts flat on the ground
    HIDDEN.forEach((id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); });
    const grow = (id, t, d) => KIT.grow(tl, id, t, d);
    const shrink = (id, t) => { const g = $(id); tl.to("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy"), duration: 0.35, ease: "power2.in" }, t); };
    const pop = (sel, t) => KIT.pop(tl, sel, t);
    const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.25, ease: "power1.in" }, t);
    const show = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
    // move an svg group by a world-px delta along an arc (lift = arc height)
    const fly = (sel, t, a, b, dur, lift, ease) => {
      const el = document.querySelector(sel), o = { s: 0 };
      const set = () => { const s = o.s, x = a[0] + (b[0] - a[0]) * s, y = a[1] + (b[1] - a[1]) * s - 4 * (lift || 0) * s * (1 - s);
        if (el instanceof SVGElement) el.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")"); else el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)"; };
      tl.fromTo(o, { s: 0 }, { s: 1, duration: dur, ease: ease || "power2.inOut", immediateRender: false, onUpdate: set }, t);
    };
    const d = (p, q) => [q[0] - p[0], q[1] - p[1]];
    const gateLabs = [1, 2, 3, 4, 5, 6, 7].map((i) => "#lg" + i).concat(["#lchain", "#lbr"]);
    const focus = (keep, t) => gateLabs.forEach((s) => { if (!keep.includes(s)) tl.to(s, { opacity: 0, duration: 0.3 }, t); else tl.to(s, { opacity: 1, duration: 0.3 }, t); });
    const allLabs = (t, op) => gateLabs.forEach((s) => tl.to(s, { opacity: op == null ? 1 : op, duration: 0.3 }, t));
    const plateRed = (i, t) => { tl.to("#g" + i + "-plate", { attr: { fill: "#e0453a" }, duration: 0.2 }, t); tl.to("#g" + i + "-plate-n", { attr: { fill: "#ffffff" }, duration: 0.2 }, t);
      tl.to("#lg" + i, { backgroundColor: "#e0453a", borderColor: "#e0453a", color: "#ffffff", duration: 0.2 }, t); tl.to("#lg" + i + " .gn", { backgroundColor: "#e0453a", duration: 0.2 }, t); };
    const RING_ON = "0 0 0 4px #2aa3c9, 0 8px 20px rgba(70, 60, 40, 0.10)", RING_OFF = "0 0 0 0px #2aa3c9, 0 8px 20px rgba(70, 60, 40, 0.10)";
    const cardOn = (i, t) => { tl.to("#slot" + i, { opacity: 0, duration: 0.3 }, t + 0.3); tl.fromTo("#card" + i, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out", immediateRender: false }, t); tl.to("#card" + i, { boxShadow: RING_ON, duration: 0.2 }, t + 0.2); };
    const cardOff = (i, t) => tl.to("#card" + i, { boxShadow: RING_OFF, duration: 0.3 }, t);
    const plant = (f, t) => { grow(f, t, 0.45); const c = $(f + "-cloth"); tl.fromTo("#" + f + "-cloth", { scaleX: 0, svgOrigin: c.getAttribute("data-sx") + " " + c.getAttribute("data-sy") }, { scaleX: 1, svgOrigin: c.getAttribute("data-sx") + " " + c.getAttribute("data-sy"), duration: 0.4, ease: "back.out(1.4)", immediateRender: false }, t + 0.35); pop("#l-" + f, t + 0.6); };
    const shortFlag = (f, t) => KIT.swap(tl, "#l-" + f, "#l-" + f + "s", t, 0.25);

    // ---------------------------------------------------------------- 0–7.2 title, road, six slots
    tl.to("#veil", { opacity: 0, duration: 0.5, ease: "power1.inOut" }, 1.55);
    KIT.cam(tl, 1.6, CAMS.OV, 1.2); s2pTo(1.6, DIM, 0.8);
    tl.to("#ttl", { x: 560, y: -330, scale: 0.28, opacity: 0, duration: 0.55, ease: "power3.in" }, 1.6);
    [1, 2, 3, 4, 5, 6].forEach((i) => pop("#slot" + i, 2.72 + i * 0.09));
    // "放到这条路上": the road's gate labels step in, ① → ⑦
    gateLabs.forEach((s, i) => tl.fromTo(s, { opacity: 0.25 }, { opacity: 1, duration: 0.2, immediateRender: false }, 5.42 + i * 0.07));
    gateLabs.forEach((s) => tl.set(s, { opacity: 0.25 }, 0));

    // ---------------------------------------------------------------- Bitget (② 7.3–31.3)
    KIT.cam(tl, 7.85, CAMS.G2, 1.15);
    focus(["#lg2"], 7.9);
    tl.to("#lg2", { backgroundColor: "#1c1c1c", borderColor: "#1c1c1c", color: "#ffffff", duration: 0.3 }, 8.2);
    tl.to("#wallet", { opacity: 1, duration: 0.4 }, 8.6); pop("#l-bsrv", 9.0);
    cardOn(1, 10.47); pop("#card1-a", 11.79);
    pop("#card1-s", 14.3);
    grow("bsec", 15.6); pop("#l-bsec", 16.0);
    show("#bsec-crack", 16.95, 0.15); tl.fromTo("#bsec", { x: -6 }, { x: 0, duration: 0.3, ease: "elastic.out(1,0.35)", immediateRender: false }, 16.95); pop("#l-zero", 17.1);
    // credential falls out of the crack, lands, then the attacker picks it up
    show("#bkey", 17.9, 0.1); fly("#bkey", 17.9, d(POS.bkeyC, POS.bkeyFrom), [0, 0], 0.6, -40, "power2.in");
    pop("#l-ikey", 18.55);
    grow("batk", 18.75);
    out("#l-ikey", 19.25);
    fly("#bkey", 19.3, [0, 0], d(POS.bkeyC, POS.bkeyAtk), 0.55, 70);
    pop("#l-batk", 20.29);
    pop("#l-tool", 21.1);
    show("#benv", 22.05, 0.15); fly("#benv", 22.1, [0, 0], d(POS.benv0, POS.benv1), 0.85, 160);
    out("#bkey", 22.1, 0.2);
    pop("#l-forge", 22.98);
    plateRed(2, 23.0);
    grow("bsafe", 25.5); pop("#l-bsafe", 26.15); pop("#l-bsafe-src", 26.5);
    pop("#l-noname", 28.3);
    // collapse, pull back, plant the flag
    const bitget = ["bsec", "batk", "bsafe"]; tl.to("#wallet", { opacity: DIM, duration: 0.4 }, 29.95);
    ["#l-bsrv", "#l-bsec", "#l-zero", "#l-batk", "#l-tool", "#l-forge", "#l-bsafe", "#l-bsafe-src", "#l-noname", "#benv"].forEach((s) => out(s, 29.9, 0.25));
    bitget.forEach((id, i) => shrink(id, 29.95 + i * 0.05));
    KIT.cam(tl, 30.0, CAMS.MID2, 1.0);
    tl.to("#lg2", { backgroundColor: "#ffffff", borderColor: "#e0453a", color: "#c3352b", duration: 0.3 }, 30.0);
    focus(["#lg2", "#lg3", "#lg4", "#lg5"], 30.0);
    plant("f1", 30.35);
    cardOff(1, 31.2);

    // ---------------------------------------------------------------- WazirX (④ front 31.5–50.3)
    shortFlag("f1", 32.0);
    KIT.cam(tl, 32.05, CAMS.G4F, 1.1);
    focus(["#lg4"], 32.1);
    tl.to("#lg4", { backgroundColor: "#1c1c1c", borderColor: "#1c1c1c", color: "#ffffff", duration: 0.3 }, 32.4);
    cardOn(2, 34.69); pop("#card2-a", 36.05);
    grow("wmon", 35.4); grow("pw", 37.7); pop("#bubW", 38.25);
    pop("#l-wmon", 40.07); pop("#l-wshow", 40.84);
    // the real document slides out from behind the monitor
    grow("wdoc", 41.5, 0.3);
    fly("#wdoc-mv", 41.55, POS.wdocShift, [0, 0], 0.7, 0, "power3.out");
    pop("#l-wdoc", 41.95); pop("#neq", 42.2);
    out("#bubW", 43.4, 0.2);
    grow("pl", 43.5); pop("#bubL", 44.15);
    pop("#l-wconf", 46.7); pop("#card2-s", 46.96);
    ["#bubL", "#l-wmon", "#l-wshow", "#l-wdoc", "#neq", "#l-wconf"].forEach((s) => out(s, 49.4, 0.25));
    ["wmon", "wdoc", "pw", "pl"].forEach((id, i) => shrink(id, 49.45 + i * 0.05));
    plateRed(4, 49.5);
    tl.to("#lg4", { backgroundColor: "#ffffff", color: "#c3352b", duration: 0.3 }, 49.75);
    KIT.cam(tl, 49.5, CAMS.G4M, 1.1);
    focus(["#lg3", "#lg4", "#lg5"], 49.5);
    plant("f2", 49.8);
    cardOff(2, 50.6);

    // ---------------------------------------------------------------- Bybit (④ behind 50.6–80.6)
    tl.to("#lg4", { scale: 1.12, duration: 0.25, ease: "power2.out", yoyo: true, repeat: 1 }, 51.3);
    shortFlag("f2", 52.5);
    // 旗子短标签会落进字幕区或被事件卡盖住：镜头离开时淡出，回到总览时再淡入
    ["#l-f1s", "#l-f2s"].forEach((x) => tl.to(x, { opacity: 0, duration: 0.2 }, 54.9));
    cardOn(3, 53.37); pop("#card3-a", 54.0); pop("#card3-s", 55.2);
    KIT.cam(tl, 54.9, CAMS.BY1, 1.15); s2pTo(54.9, 0, 0.5);
    focus([], 54.9);
    grow("ydesk", 56.4); pop("#l-ydesk", 56.9);
    KIT.swap(tl, "#ydesk-scr", "#ydesk-scr2", 57.66, 0.2); KIT.swap(tl, "#l-ydesk", "#l-ydesk2", 57.66, 0.2);
    grow("yatk", 58.25);
    show("#ykey", 59.55, 0.15); pop("#l-ykey", 59.65);
    fly("#ykey", 59.65, [0, 0], d(POS.ykey0, POS.ykey1), 0.6, 80); fly("#l-ykey-pin", 59.65, [0, 0], d(POS.ykey0, POS.ykey1), 0.6, 80);
    grow("ys3", 60.3);
    KIT.cam(tl, 60.4, CAMS.BY2, 1.0);
    fly("#ykey", 60.75, d(POS.ykey0, POS.ykey1), d(POS.ykey0, POS.ykey2), 0.7, 120); fly("#l-ykey-pin", 60.75, d(POS.ykey0, POS.ykey1), d(POS.ykey0, POS.ykey2), 0.7, 120);
    out("#ykey", 61.5, 0.2); out("#l-ykey", 61.6, 0.2);
    pop("#l-ys3", 61.6);
    // the JS file in the bucket is rewritten (rises red)
    show("#yjsr", 62.7, 0.2); fly("#yjsr", 62.7, [0, 60], [0, 0], 0.45, 0, "power3.out"); pop("#l-js", 63.0);
    grow("ybrw", 64.6);
    KIT.cam(tl, 66.2, CAMS.BY3, 1.1);
    KIT.draw(tl, "ycur", 66.4, 0.6);
    out("#l-ys3", 66.3);
    ["ysA", "ysB", "ysC"].forEach((id, i) => grow(id, 66.6 + i * 0.12));
    KIT.draw(tl, "ycur2", 67.35, 0.55);
    tl.fromTo("#yret", { opacity: 0, scale: 1.7, rotation: 45, svgOrigin: POS.ysB[0] + " " + POS.ysB[1] }, { opacity: 1, scale: 1, rotation: 0, svgOrigin: POS.ysB[0] + " " + POS.ysB[1], duration: 0.5, ease: "power3.out", immediateRender: false }, 67.6);
    pop("#l-ysB", 68.05);
    ["ysA", "ysC"].forEach((id) => tl.to("#" + id + "-solid", { opacity: 0.4, duration: 0.4 }, 68.5));
    pop("#l-ysA", 68.7); pop("#l-ysC", 68.8);
    grow("yclk", 69.6); pop("#l-yclk", 70.3); KIT.clock(tl, "yclk", 70.3, 1.0, 2);
    KIT.swap(tl, "#yjsr", "#yjs", 71.65, 0.35); KIT.swap(tl, "#l-js", "#l-js2", 71.65, 0.25);
    out("#ycur", 71.8, 0.3);
    // signers: all look at the same tampered page; no second source
    KIT.cam(tl, 73.4, CAMS.BY4, 1.0);
    ["#l-ysA", "#l-ysC", "#l-yclk", "#l-js2", "#yret", "#ycur2"].forEach((s) => out(s, 73.4, 0.3)); shrink("yclk", 73.4);
    out("#l-ysB", 73.5, 0.3);
    [0, 1, 2].forEach((i) => grow("yp" + i, 73.95 + i * 0.12)); pop("#l-yp", 74.5);
    [0, 1, 2].forEach((i) => show("#ysl" + i, 74.8 + i * 0.1, 0.3));
    tl.to("#ybrw-wire", { opacity: 1, duration: 0.3 }, 76.2); pop("#l-ybrw2", 76.3); out("#l-ybrw", 76.2);
    grow("yghost", 78.25); pop("#l-yghost", 78.6);
    // collapse, second flag on ④
    const bybit = ["ydesk", "yatk", "ys3", "ybrw", "ysA", "ysB", "ysC", "yclk", "yp0", "yp1", "yp2", "yghost"];
    ["#l-ydesk2", "#l-ybrw2", "#l-yp", "#l-yghost", "#yjs", "#ysl0", "#ysl1", "#ysl2", "#ybrw-wire", "#l-ybrw"].forEach((s) => out(s, 79.7, 0.25));
    bybit.filter((x) => x !== "yclk").forEach((id, i) => shrink(id, 79.72 + (i % 4) * 0.04));
    KIT.cam(tl, 79.7, CAMS.MID45, 1.0);
    focus(["#lg4", "#lg5"], 79.7);
    plant("f3", 80.0);
    cardOff(3, 80.8);

    // ---------------------------------------------------------------- Drift (⑤ behind 80.8–108.3)
    shortFlag("f3", 81.0);
    KIT.cam(tl, 81.0, CAMS.G5B, 1.1);
    focus(["#lg5"], 81.0);
    tl.to("#lg5", { backgroundColor: "#1c1c1c", borderColor: "#1c1c1c", color: "#ffffff", duration: 0.3 }, 81.8);
    cardOn(4, 85.3); pop("#card4-a", 86.92); pop("#card4-s", 89.7);
    grow("dtbl", 81.9);
    [0, 1, 2, 3, 4].forEach((i) => grow("dp" + i, 82.1 + i * 0.1));
    pop("#l-dtbl", 90.95);
    [0, 1].forEach((i) => { show("#dring" + i, 92.15 + i * 0.15, 0.25); pop("#dck" + i, 92.3 + i * 0.15); });
    KIT.swap(tl, "#l-dtbl", "#l-d25", 92.5, 0.25);
    grow("dlock", 93.8); pop("#l-dlock", 94.1);
    KIT.broke(tl, "dlock", 94.6, { ghost: 0.3 }); KIT.swap(tl, "#l-dlock", "#l-dlock2", 94.7, 0.25);
    show("#ddoc0", 96.3, 0.2); show("#ddoc1", 96.45, 0.2);
    pop("#ddoc0-sm", 97.05); pop("#ddoc1-sm", 97.3);
    out("#l-d25", 97.8, 0.2); pop("#l-ddoc", 98.1);
    out("#l-dlock2", 99.8);
    KIT.cam(tl, 99.9, CAMS.DR2, 1.1);
    tl.to("#l-f3s", { opacity: 0, duration: 0.2 }, 94.0);
    grow("dhg", 100.35); pop("#l-dhg", 101.25);
    KIT.sand(tl, "dhg", 100.9, 0.01);
    grow("dcab", 102.2); pop("#l-dcab", 102.6);
    out("#l-dhg", 104.1); out("#l-ddoc", 104.1);
    grow("datk", 104.35);
    [0, 1].forEach((i) => fly("#ddoc" + i, 104.75 + i * 0.15, [0, 0], d(POS.ddoc[i], POS.dtray), 0.7, 140));
    KIT.swap(tl, "#dcab-open", "#dcab-closed", 105.55, 0.25);
    [0, 1].forEach((i) => out("#ddoc" + i, 105.5, 0.15));
    grow("dclk", 105.1); pop("#l-dclk", 105.3); KIT.clock(tl, "dclk", 105.4, 1.25, 600);
    KIT.swap(tl, "#dcab-closed", "#dcab-open", 106.75, 0.2);
    [0, 1].forEach((i) => { show("#ddoc" + i, 106.85, 0.1); fly("#ddoc" + i, 106.9 + i * 0.1, d(POS.ddoc[i], POS.dtray), d(POS.ddoc[i], POS.dsubmit), 0.6, 160); });
    pop("#l-dsub", 107.25);
    plateRed(5, 107.45);
    const drift = ["dtbl", "dp0", "dp1", "dp2", "dp3", "dp4", "dlock", "dhg", "dcab", "datk", "dclk"];
    ["#l-dcab", "#l-dclk", "#l-dsub", "#ddoc0", "#ddoc1", "#dring0", "#dring1", "#dck0", "#dck1", "#ddoc0-sm", "#ddoc1-sm"].forEach((s) => out(s, 107.6, 0.25));
    drift.forEach((id, i) => shrink(id, 107.62 + (i % 4) * 0.04));
    tl.to("#lg5", { backgroundColor: "#ffffff", color: "#c3352b", duration: 0.3 }, 107.8);
    KIT.cam(tl, 107.6, CAMS.MID5, 1.0); s2pTo(107.7, DIM, 0.6);
    focus(["#lg5", "#lbr"], 107.6);
    plant("f4", 107.85);
    cardOff(4, 108.6);

    // ---------------------------------------------------------------- KelpDAO (branch 108.4–140.3)
    shortFlag("f4", 109.0);
    KIT.cam(tl, 108.9, CAMS.KE, 1.2);
    focus(["#lbr"], 109.0);
    tl.to("#lbr", { backgroundColor: "#1c1c1c", borderColor: "#1c1c1c", color: "#ffffff", duration: 0.3 }, 109.75);
    [1, 2, 3, 4].forEach((i) => grow("kr" + i, 109.85 + i * 0.1));
    cardOn(5, 112.74); pop("#card5-a", 114.07);
    grow("kbrg", 116.6); pop("#l-kbrg", 116.95);
    grow("kver", 117.75); pop("#l-kver", 118.0);
    [0, 1, 2, 3, 4].forEach((i) => show("#kln" + i, 118.3 + i * 0.06, 0.3));
    pop("#l-ksrc", 119.9); pop("#card5-s", 120.1);
    KIT.swap(tl, "#kr0", "#krr0-w", 122.5, 0.3); KIT.swap(tl, "#kr1", "#krr1-w", 122.7, 0.3); pop("#l-kswap", 123.0);
    SWARM.forEach((s) => { show("#" + s.id, 124.4 + s.t, 0.08); fly("#" + s.id, 124.4 + s.t, [0, 0], d(s.from, s.to), 0.55, 60, "power2.in"); out("#" + s.id, 124.95 + s.t, 0.1); });
    pop("#l-kddos", 124.6);
    [2, 3, 4].forEach((i) => { KIT.led(tl, "kr" + i + "-led-0", 125.2, "off"); tl.to("#kr" + i + "-solid", { opacity: 0.32, duration: 0.3 }, 125.2); tl.to(["#kr" + i + "-wave-0", "#kr" + i + "-wave-1", "#kr" + i + "-wave-2"], { opacity: 0, duration: 0.2 }, 125.2); });
    [2, 3, 4].forEach((i) => out("#kln" + i, 125.4, 0.3));
    [0, 1].forEach((i) => { out("#kln" + i, 126.5, 0.2); show("#klr" + i, 126.5, 0.3); });
    out("#l-kswap", 127.6); out("#l-kddos", 127.6); out("#l-ksrc", 127.6);
    KIT.cam(tl, 127.9, CAMS.KE2, 1.0);
    grow("koth", 128.4); pop("#l-koth", 128.8);
    show("#kfake-w", 129.25, 0.1); fly("#kfake-w", 129.25, d(POS.kfake1, POS.kfake0), [0, 0], 0.75, 160);
    show("#ktrue-w", 129.5, 0.1); fly("#ktrue-w", 129.5, d(POS.ktrue1, POS.ktrue0), [0, 0], 0.85, 200);
    pop("#l-kfake", 130.1); pop("#l-ktrue", 130.4);
    pop("#l-kok", 131.6);
    // the key shot: an honest green signature on a red fake sheet
    KIT.cam(tl, 132.9, CAMS.KEC, 1.1);
    out("#l-koth", 132.9); out("#l-kok", 132.9); out("#l-ktrue", 132.9); shrink("koth", 132.9); out("#ktrue-w", 132.9, 0.3); out("#l-kbrg", 132.9);
    show("#kseal-w", 133.3, 0.3);
    KIT.stamp(tl, "kseal", 134.4);
    pop("#l-kseal", 135.15);
    KIT.swap(tl, "#l-kseal", "#l-klaw", 137.9, 0.25);
    // collapse, last flag, back to the full road
    const kelp = ["kbrg", "kver", "kr1", "kr2", "kr3", "kr4"];
    ["#l-kver", "#l-kfake", "#l-klaw", "#kfake-w", "#kseal-w", "#klr0", "#klr1", "#krr1-w"].forEach((s) => out(s, 138.5, 0.25));
    KIT.swap(tl, "#krr0-w", "#kr0", 138.5, 0.3);
    kelp.forEach((id, i) => shrink(id, 138.52 + (i % 4) * 0.04));
    tl.to("#lbr", { backgroundColor: "#ffffff", borderColor: "#e0453a", color: "#c3352b", duration: 0.3 }, 138.5);
    KIT.cam(tl, 138.5, CAMS.END, 1.2);
    ["#l-f1s", "#l-f2s", "#l-f3s"].forEach((x) => tl.to(x, { opacity: 1, duration: 0.3 }, 138.5));
    // hand-off to seg3b's first frame: its labels, no seg2 props except the tower, no side panel
    gateLabs.forEach((x) => tl.to(x, { opacity: 0, duration: 0.3 }, 138.6));
    [1, 2, 3, 4, 5, 6, 7].forEach((i) => KIT.pop(tl, "#eg" + i, 139.0 + i * 0.03)); KIT.pop(tl, "#echain", 139.25);
    S2P.forEach((id) => tl.to("#" + id, { opacity: id === "tower" ? 1 : 0, duration: 0.5 }, 138.6));
    tl.to("#evpanel", { opacity: 0, duration: 0.5 }, 138.6);
    plant("f5", 138.75); shortFlag("f5", 139.5);
    cardOff(5, 139.2);
    tl.fromTo("#slot6", { borderColor: "#cfc7b8" }, { borderColor: "#2aa3c9", duration: 0.25, yoyo: true, repeat: 1, immediateRender: false }, 140.0);
    tl.set({}, {}, 142.3);
    ${termJs(TERMS)}
    window.__timelines["story"] = tl;
  })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes;", items.length, "objects");
// debug: node src/build-story.mjs --dbg G2,BY1  → screen coords of every object's ground point under those cameras
const di = process.argv.indexOf("--dbg");
if (di > 0) for (const cn of process.argv[di + 1].split(",")) {
  const c = CAMS[cn]; console.log("== " + cn, JSON.stringify(c));
  for (const it of items) { const g = at(it.o); const x = c.x + c.scale * g[0], y = c.y + c.scale * g[1];
    if (x > -150 && x < 1500 && y > -100 && y < 1150) console.log(`  ${it.id.padEnd(10)} (${Math.round(x)}, ${Math.round(y)})`); }
}
