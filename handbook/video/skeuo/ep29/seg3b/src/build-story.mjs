// seg3b「③ 断在哪一关 · Binance」— builds compositions/story.html
// Run: node src/build-story.mjs
import fs from "node:fs";
import {
  G, at, f, f4, Wp, CA, SA, SE, CE, U, V, M, C, mat, darken, lighten, camAt, worldSvg, gridSvg, wlab, wpin, BADGE, CHECK,
  box, rbox, cyl, sphere, flat, line3, faceV, faceU, faceTop, frameV, frameTop, matStr, applyM, contactShadow, dashCurve,
  kitCss, runtimeJs,
} from "../../kit/iso.mjs";
import * as O from "../../kit/objects.mjs";
import { pills } from "../../kit/pills.mjs";
import { termCards, termJs } from "../../kit/terms.mjs";
// 术语卡（2026-11-15 第二轮返工）：时间按旧时间（= timing_old），revoice.py 按句拉伸
const TERMS = [
  { id: "tc1", t1: "nonce", t2: "账户的交易序号 · 每发一笔加一", t0: 37.38, t1s: 40.90 },
];

const timing = JSON.parse(fs.readFileSync(new URL("../timing.json", import.meta.url), "utf8"));
const TOTAL = timing.total;

// ------------------------------------------------------------------ world layout
// Seven gates along +u (screen: lower-left → upper-right), 480 world units apart.
const SP = 640; // aligned with seg2/SPEC.md (gate i at u=(i-1)*640, v=-62)
const GU = (i) => (i - 1) * SP; // gate i (1..7)
const P = (u, v) => ({ u, v });
const g = (o, n, id, extra = {}) => O.checkpoint(o, { id, n, road: false, ...extra });
const GN = ["①", "②", "③", "④", "⑤", "⑥", "⑦"];
const GNAME = ["业务意图", "请求构造", "风控与审批", "显示与解码", "签名", "广播", "链上状态"];
const RED_AT_START = [2, 4, 5]; // gates already flagged by seg3a

// ---------------------------------------------------------------- custom objects
const G_ = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
const wrap = (id, o, s, extra = "") => { const [ox, oy] = at(o); return `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}" ${extra}>${s}</g>`; };

/** red event flag: pole + pennant */
function flag(o, id, H = 210) {
  let s = contactShadow(o, 34, 22) + cyl(o, 0, 0, 16, 0, 7, M.plinth, { seg: 18, sw: 1.2 }) + cyl(o, 0, 0, 4.5, 7, H, M.ink, { seg: 10, sw: 1 });
  s += sphere(id + "-k", o, 0, 0, H + 4, 7, M.chrome, 1.2);
  s += G_(faceV(o, 4, 0, H - 4), `<path d="M0 0L96 26L0 52Z" fill="#e0453a" stroke="#a8322a" stroke-width="2.4" stroke-linejoin="round"/><path d="M0 0L96 26L0 26Z" fill="#ffffff" opacity="0.18"/>`);
  return { svg: wrap(id, o, s), top: at(o, 40, 0, H + 8) };
}
/** shipping container (attacker's container) */
function container(o, id) {
  const L = 118, Wd = 60, H = 128, m = mat("#d4483d", { st: "#7d1f19" });
  let s = contactShadow(o, 150, 90) + box(o, -L, L, -Wd, Wd, 0, H, m, 2.2);
  let rib = "";
  for (let x = 10; x < 2 * L - 6; x += 15) rib += `<rect x="${x}" y="8" width="7" height="${H - 16}" fill="${darken(m.s, 0.14)}"/>`;
  s += G_(faceV(o, -L, Wd, H), rib + `<rect x="0" y="0" width="${2 * L}" height="${H}" fill="none" stroke="${m.st}" stroke-width="3"/>`);
  let door = `<rect x="4" y="6" width="${Wd - 6}" height="${H - 12}" fill="${lighten(m.f, 0.04)}" stroke="${m.st}" stroke-width="2"/><rect x="${Wd + 2}" y="6" width="${Wd - 6}" height="${H - 12}" fill="${lighten(m.f, 0.04)}" stroke="${m.st}" stroke-width="2"/>`;
  for (const x of [18, 40, Wd + 18, Wd + 40]) door += `<rect x="${x}" y="10" width="4" height="${H - 20}" rx="2" fill="#d9dcdf" stroke="#5a5e65" stroke-width="1"/><rect x="${x - 4}" y="${H / 2 - 3}" width="12" height="6" rx="2" fill="#5a5e65"/>`;
  s += G_(faceU(o, -L, -Wd, H), door);
  for (const [a, b] of [[-L, -Wd], [L - 14, -Wd], [-L, Wd - 14], [L - 14, Wd - 14]]) s += box(o, a, a + 14, b, b + 14, H - 6, H + 2, M.dark, 1);
  return { svg: wrap(id, o, s), top: at(o, 0, 0, H + 40), center: at(o, 0, 0, H / 2), front: at(o, 40, Wd, H * 0.6) };
}
/** standing keycard ("容器部署令牌") — drawn relative to o at height z */
function tokenCard(o, z, id) {
  const w = 74, h = 48, m = frameV(o, -w / 2, 0, z + h);
  const face = (fill, st) => `<rect x="0" y="0" width="${w}" height="${h}" rx="7" fill="${fill}" stroke="${st}" stroke-width="1.8"/>`;
  let s = "";
  for (let i = 5; i >= 1; i--) s += `<g transform="translate(${f(-i * V[0])},${f(-i * V[1])})">${G_(matStr(m), face("#156f8d", "#0f4f65"))}</g>`;
  s += G_(matStr(m), face("#1d93ba", "#0f4f65") + `<rect x="8" y="12" width="17" height="13" rx="2" fill="#f0c04a" stroke="#a87612" stroke-width="1.2"/><path d="M8 18.5H25M16.5 12V25" stroke="#a87612" stroke-width="1"/>
    <text x="31" y="23" font-family="JetBrains Mono, monospace" font-size="11" font-weight="800" fill="#ffffff">TOKEN</text><rect x="8" y="33" width="56" height="5" rx="2.5" fill="#9ad9ee"/><rect x="${w / 2 - 7}" y="3" width="14" height="4" rx="2" fill="#0f4f65"/>`);
  return s;
}
/** a thin sheet lying flat at height z (transaction) */
const sheet = (o, z, i) => {
  const m = frameTop(o, -58, -40, z);
  return `<g id="sh-${i}" opacity="0"><g transform="translate(0,${f(2 * CE)})">${G_(matStr(m), `<rect x="0" y="0" width="116" height="80" rx="3" fill="#ddd6c9"/>`)}</g>${G_(matStr(m), `<rect x="0" y="0" width="116" height="80" rx="3" fill="#fff6f4" stroke="#e0453a" stroke-width="2"/><rect x="10" y="12" width="56" height="7" rx="3" fill="#e0453a"/><rect x="10" y="28" width="90" height="5" rx="2.5" fill="#e3ddd1"/><rect x="10" y="40" width="74" height="5" rx="2.5" fill="#e3ddd1"/><circle cx="96" cy="62" r="11" fill="none" stroke="#d93a2f" stroke-width="2.4"/>`)}</g>`;
};

// ---------------------------------------------------------------- placements
const gates = [];
for (let i = 1; i <= 7; i++) {
  const red = RED_AT_START.includes(i);
  const r = g(P(GU(i), -62), GN[i - 1], "g" + i, { armUp: true });
  if (red) r.svg = r.svg.replace(/(id="g\d-plate"[^>]*?)fill="#ffffff" stroke="#b8b0a1"/, '$1fill="#e0453a" stroke="#a8322a"').replace(/(id="g\d-plate-n"[^>]*?)fill="#1c1c1c"/, '$1fill="#ffffff"');
  gates.push({ i, o: P(GU(i), -62), r, red });
}
// branch to RPC (from gate ⑤ toward the front, as seg2)
const BR_U = 2660;
const rpcO = P(BR_U, 1010);
const rpcR = O.rpc(rpcO, { id: "rpc" });
const towerO = P(3058, -527);
const towerR = O.tower(towerO, { id: "tower" });
const chainO = P(4480, 0);
const chainR = O.chain(chainO, { id: "ch", n: 3, labels: ["#1", "#2", "#3"] });
// office (front-left of ⑤)
const deskBO = P(1250, 720), deskAO = P(1640, 1010);
const deskB = O.desk(deskBO, { id: "dB", screen2: `<rect x="0" y="0" width="148" height="88" fill="#e0453a"/><path d="M74 14L106 70H42Z" fill="#ffffff"/><rect x="71" y="32" width="6" height="20" rx="3" fill="#e0453a"/><circle cx="74" cy="60" r="3.5" fill="#e0453a"/>` });
const deskA = O.desk(deskAO, { id: "dA" });
const engB = O.person(P(deskBO.u + 190, deskBO.v + 40), { id: "pB", role: "engineer", scale: 1.0 });
const engA = O.person(P(deskAO.u + 190, deskAO.v + 40), { id: "pA", role: "engineer", scale: 1.0 });
const atkO = P(950, 1170);
const atk = O.person(atkO, { id: "atk", role: "attacker", scale: 1.1 });
// machine room (front of ⑤)
const roomU0 = 2000, roomU1 = 2860, roomV0 = -800, roomV1 = -300;
const rackO = P(2400, -470); // = seg2 ⑤ MPC rack
const rackR = O.rack(rackO, { id: "sig", tag: "SIGN-SVC" });
const sealO = P(2426, -8); // = seg2 ⑤ seal (mark at the envelope stop 2390,0)
const sealR = O.seal(sealO, { id: "seal", stamped: false, markText: "签名", text: "签名服务" });
const lockO = P(2120, -420);
const lockR = O.padlock(lockO, { id: "lock" });
const ctrO = P(2170, -690);
const ctr = container(ctrO, "ctr");
const stackO = P(2300, -320);
// off-chain controls (between ⑥ and ⑦, front)
const swO = P(3380, 560), hwsO = P(3640, 620);
const swR = O.knifeSwitch(swO, { id: "sw", text: "提现", lampOff: "#3c3f45" });
const hwsR = O.rack(hwsO, { id: "hws", tag: "HOT-SVC" });
// on-chain side
const DIV_U = 4020;
const hwO = P(4480, 760);
const hwR = O.hotWallet(hwO, { id: "hw", plate: "ETH 热钱包" });
const atk2O = P(4900, 1100);
const atk2 = O.person(atk2O, { id: "atk2", role: "attacker", scale: 1.0 });
const clkO = P(3800, 1150);
const clkR = O.clock(clkO, { id: "clk", h: 8, m: 20 });

// flags: [id, origin, label, initiallyVisible]
const FL = [
  ["f-bitget", P(GU(2) + 130, 230), "Bitget", true, 210],
  ["f-wazirx", P(GU(4) + 130, 230), "WazirX", true, 210],
  ["f-bybit", P(GU(4) - 110, 230), "Bybit", true, 470],
  ["f-drift", P(GU(5) - 20, 230), "Drift", true, 210],
  ["f-kelp", P(BR_U - 140, 960), "KelpDAO", true, 230],
  ["f-bn5", P(GU(5) - 170, 230), "Binance", false, 470],
  ["f-bn7", P(GU(7) + 130, 230), "Binance", false, 210],
];
const flags = FL.map(([id, o, label, vis, H]) => ({ id, o, label, vis, r: flag(o, id, H) }));

// ---------------------------------------------------------------- ground layer
let ground = "";
// main road (one long strip) + centre dashes
ground += flat(P(0, 0), [[-760, -148], [4200, -148], [4200, 148], [-760, 148]], 0, "#f8f6f1", "#dcd5c8", 2);
for (let u = -720; u < 4160; u += 140) ground += line3(P(0, 0), [[u, 0], [u + 70, 0]], "#d3ccbf", 4);
// branch road to RPC
ground += flat(P(0, 0), [[BR_U - 60, 148], [BR_U + 60, 148], [BR_U + 60, 950], [BR_U - 60, 950]], 0, "#f8f6f1", "#dcd5c8", 2);
for (let v = 190; v < 930; v += 110) ground += line3(P(0, 0), [[BR_U, v], [BR_U, v + 55]], "#d3ccbf", 4);
// machine room floor (raised raised-floor tiles)
let roomFloor = box(P(0, 0), roomU0, roomU1, roomV0, roomV1, 0, 8, { f: "#e6e2da", s: "#d3cdc1", t: "#f1eee8", st: "#b9b1a2" }, 1.6);
roomFloor += G_(faceTop(P(0, 0), roomU0, roomV0, 8), Array.from({ length: Math.floor((roomU1 - roomU0) / 76) }, (_, i) => `<path d="M${(i + 1) * 76} 0V${roomV1 - roomV0}" stroke="#dcd6ca" stroke-width="2"/>`).join("") + Array.from({ length: Math.floor((roomV1 - roomV0) / 76) }, (_, i) => `<path d="M0 ${(i + 1) * 76}H${roomU1 - roomU0}" stroke="#dcd6ca" stroke-width="2"/>`).join(""));
roomFloor = `<g id="room">${roomFloor}</g>`;
// off-chain / on-chain divider (dashed line on the ground, along v)
const divider = `<g id="divider" opacity="0">${line3(P(0, 0), [[DIV_U, -260], [DIV_U, 1500]], "#1c1c1c", 4, `stroke-dasharray="18 12" opacity="0.55"`)}</g>`;

// ---------------------------------------------------------------- objects (painter's order)
const items = [];
const add = (o, svg, extraY = 0) => items.push({ y: at(o)[1] + extraY, svg });
for (const gt of gates) add(gt.o, gt.r.svg);
add(rpcO, rpcR.svg); add(towerO, towerR.svg);
for (const fl of flags) add(fl.o, `<g id="${fl.id}-w" opacity="${fl.vis ? 1 : 0}">${fl.r.svg}</g>`);
add(deskBO, deskB.svg); add(deskAO, deskA.svg); add(P(deskBO.u + 190, deskBO.v + 40), engB.svg); add(P(deskAO.u + 190, deskAO.v + 40), engA.svg);
add(atkO, atk.svg);
add(rackO, rackR.svg); add(sealO, sealR.svg); add(lockO, lockR.svg);
add(swO, swR.svg); add(hwsO, hwsR.svg);
add(hwO, hwR.svg); add(atk2O, atk2.svg);
// red "7702" block overlay over chain block #4
const b4 = { u: chainO.u + 180, v: chainO.v };
const redBlock = `<g id="blkR" opacity="0">${rbox(b4, -50, 50, -50, 50, 0, 100, 10, M.red, { sw: 2 })}${G_(faceV(b4, -40, 50, 90), `<rect x="0" y="0" width="80" height="24" rx="4" fill="#ffffff"/><text x="40" y="18" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="16" font-weight="800" fill="#a8322a">7702</text><rect x="4" y="36" width="62" height="6" rx="3" fill="#ffffff" opacity="0.7"/><rect x="4" y="50" width="48" height="6" rx="3" fill="#ffffff" opacity="0.7"/>`)}</g>`;
add(chainO, chainR.svg + redBlock);
items.sort((a, b) => a.y - b.y);

// ---------------------------------------------------------------- overlay movers
// token card on desk A (moves to the attacker)
const tokO = P(deskAO.u + 74, deskAO.v + 22);
const tokenSvg = `<g id="tok" opacity="0" transform="translate(0,0)">${tokenCard(tokO, 114, "tok")}</g>`;
const tokHome = at(tokO, 0, 0, 140), tokDest = at(atkO, 20, 30, 120);
// fake interview zip (doc lying flat → flies from attacker to desk B)
const zipO = P(0, 0);
const zipSvg = `<g id="zip" opacity="0" transform="translate(0,0)">${G_(faceTop(zipO, -60, -42, 0) + " scale(1.5)", `<rect x="0" y="0" width="80" height="56" rx="4" fill="#ffffff" stroke="#6b665c" stroke-width="2.4"/><rect x="34" y="0" width="12" height="56" fill="#cfc7b8"/><path d="M34 8H46M34 16H46M34 24H46M34 32H46" stroke="#8d939b" stroke-width="2"/>`)}</g>`;
const zipFrom = at(atkO, 0, 0, 150), zipTo = deskB.anchors.screen;
// container (drops from above)
const ctrSvg = `<g id="ctrW" opacity="0">${ctr.svg}</g>`;
// sheet stack (50 tx) → flies to block #4
let stack = "";
for (let i = 0; i < 12; i++) stack += sheet(stackO, 10 + i * 5, i);
const stackSvg = `<g id="stk" transform="translate(0,0)">${stack}</g>`;
const stackC = at(stackO, 0, 0, 40);
const blk4Top = at(b4, 0, 0, 110);
// delegation chain: links from block #4 front face down to the hot-wallet top
const dA = at(b4, -10, 50, 40), dB = at(hwO, 0, 0, 236);
const dC = [(dA[0] + dB[0]) / 2 + 30, (dA[1] + dB[1]) / 2 + 40];
const NL = 9;
let links = "";
for (let i = 0; i < NL; i++) {
  const k = (i + 0.5) / NL;
  const x = (1 - k) ** 2 * dA[0] + 2 * (1 - k) * k * dC[0] + k * k * dB[0], y = (1 - k) ** 2 * dA[1] + 2 * (1 - k) * k * dC[1] + k * k * dB[1];
  const tx = 2 * (1 - k) * (dC[0] - dA[0]) + 2 * k * (dB[0] - dC[0]), ty = 2 * (1 - k) * (dC[1] - dA[1]) + 2 * k * (dB[1] - dC[1]);
  const ang = (Math.atan2(ty, tx) * 180) / Math.PI;
  const ry = i % 2 ? 4 : 11;
  links += `<g id="dl-${i}" opacity="0"><g transform="translate(${f(x)},${f(y)}) rotate(${f(ang)})"><ellipse rx="22" ry="${ry}" fill="none" stroke="#8f2620" stroke-width="10"/><ellipse rx="22" ry="${ry}" fill="none" stroke="#e8574c" stroke-width="5"/><ellipse rx="22" ry="${ry}" fill="none" stroke="#f6b3ab" stroke-width="1.6" transform="translate(-1,-2)"/></g></g>`;
}
const chainSvg = `<g id="deleg"><g id="dlA">${links.split('<g id="dl-').slice(1, 5).map((s) => '<g id="dl-' + s).join("")}</g><g id="dlB">${links.split('<g id="dl-').slice(5).map((s) => '<g id="dl-' + s).join("")}</g></g>`;
const dMid = [(dA[0] + dB[0]) / 2, (dA[1] + dB[1]) / 2 + 20];
// gold bars (drawn at canvas origin; translated along an arc)
const NB = 8;
const goldBar = (i) => `<g id="gb-${i}" opacity="0" transform="translate(0,0)">${box(P(0, 0), -24, 24, -12, 12, 0, 14, M.gold, 1.2)}</g>`;
let gold = ""; for (let i = 0; i < NB; i++) gold += goldBar(i);
const goldFrom = at(hwO, -10, 90, 70), goldTo = at(atk2O, -30, 10, 100);

// dashed curves (world canvas)
const cvLat = dashCurve("cv-lat", at(deskBO, 0, -38, 214), at(tokO, 0, 0, 150), { c1: [at(deskBO, 0, -38, 214)[0] + 120, at(deskBO, 0, -38, 214)[1] - 160], c2: [at(tokO, 0, 0, 150)[0] - 40, at(tokO, 0, 0, 150)[1] - 220] });
const cvCable = dashCurve("cv-cab", ctr.front, at(rackO, -40, 75, 120), { c1: [ctr.front[0] + 10, ctr.front[1] - 140], c2: [at(rackO, -40, 75, 120)[0] - 60, at(rackO, -40, 75, 120)[1] + 40], sw: 6 });
const swHandle = at(swO, 0, 10, 300);
const divHit = Wp(DIV_U, 900, 60);
const cvSw = dashCurve("cv-sw", swHandle, divHit, { color: "#6d685e", c1: [swHandle[0] + 160, swHandle[1] - 220], c2: [divHit[0] - 120, divHit[1] - 120], sw: 4 });

// ---------------------------------------------------------------- labels (world, counter-scaled)
let labels = "";
for (const gt of gates) labels += wlab("gl-" + gt.i, gt.r.anchors.top, gt.i === 5 || gt.i === 7 ? `<span class="gn">${GN[gt.i - 1]}</span>${GNAME[gt.i - 1]}` : GN[gt.i - 1], "lab-g lab-sm");
// 高旗子（Bybit / Binance ⑤）标签再抬高一截，避开关名标签
for (const fl of flags) labels += wlab("fl-" + fl.id, fl.id === "f-bybit" ? [fl.r.top[0], fl.r.top[1] - 170] : fl.id === "f-bn5" ? [fl.r.top[0], fl.r.top[1] - 260] : fl.r.top, fl.label, "lab-rs lab-sm" + (fl.vis ? "" : " hide"));
labels += wlab("lb-chain", at(chainO, 0, 0, 200), "区块链", "lab-sm");
// office
labels += wlab("lb-dB", deskB.anchors.top, "工程师的电脑", "hide");
labels += wlab("lb-zip", at(deskBO, -120, -40, 330), "面试作业.zip", "lab-r hide", "r");
labels += wlab("lb-dBx", at(deskBO, 0, -38, 214), "已被控制", "lab-rs hide", "t");
labels += wlab("lb-atk", atk.anchors.top, "攻击者", "lab-rs hide");
labels += wlab("lb-dA", deskA.anchors.top, "另一名工程师的电脑", "hide");
labels += wlab("lb-tok", at(tokO, 30, 0, 200), "容器部署令牌", "lab-cs hide", "l");
labels += wlab("lb-ctr", ctr.top, "攻击者的容器", "lab-rs hide");
labels += wlab("lb-sig", rackR.anchors.top, "内部签名服务", "hide");
// ⑤
labels += wlab("lb-key", at(lockO, -60, 0, 90), "私钥未泄露（Binance 称）", "lab-gs hide", "r");
labels += wlab("lb-sign", at(sealO, 130, 40, 10), "替他签", "lab-rs hide", "l");
labels += wlab("lb-n50", [at(stackO, 80, 0, 50)[0], at(stackO, 80, 0, 50)[1] - 52], `<span id="n50">0</span>&nbsp;笔`, "lab-rs hide", "l");
labels += wlab("lb-nonce", at(stackO, 80, 0, 50), "操纵 nonce", "lab-r hide", "l");
labels += wlab("lb-7702", at(stackO, 80, 0, 50), "设置 EIP-7702 委托", "lab-r hide", "l");
// hot wallet
labels += wlab("lb-hw", at(hwO, -110, 0, 160), "以太坊热钱包", "hide", "r");
labels += wlab("lb-core", hwR.anchors.coreLabel, "攻击者指定的代码", "lab-rs hide", "t");
labels += wlab("lb-deleg", [dMid[0] + 40, dMid[1]], "7702 委托", "lab-rs hide", "l");
labels += wlab("lb-deleg2", [dMid[0] + 40, dMid[1]], "委托 · 仍然有效", "lab-rs hide", "l");
labels += wlab("lb-deleg3", [dMid[0] + 40, dMid[1]], "00:10 才断开", "lab-ink hide", "l");
// ⑦ split
labels += wlab("lb-sw", at(swO, -90, 0, 340), "提现 · 已暂停", "lab-ink hide");
labels += wlab("lb-hws", at(hwsO, 100, 0, 300), "热钱包服务 · 已关闭", "lab-ink hide", "l");
labels += wpin("bx-sw", divHit, BADGE("bx-sw-b", 56, "hide"), "c");
labels += wlab("lb-atk2", atk2.anchors.top, "攻击者", "lab-rs hide");
// clock

// ---------------------------------------------------------------- cameras
const PAN = camAt([-420, 280], 40, 860, 0.31);
const CAMS = {
  PAN,
  OFF1: camAt(at(deskBO, 80, 200, 120), 900, 470, 1.12),
  OFF2: camAt([1700, -90], 920, 500, 0.95),
  G5: camAt([1890, -930], 960, 500, 1.0),
  STK: camAt(at(stackO, 60, 0, 60), 900, 540, 1.4),
  HW: camAt([4000, -1110], 960, 500, 0.98),
  SPLIT: camAt([3830, -1020], 960, 540, 1.0),
};

// ---------------------------------------------------------------- world svg
const world = worldSvg("world-svg",
  gridSvg({ u0: -3600, u1: 7600, v0: -4200, v1: 5200 }) + ground + roomFloor + divider +
  items.map((it) => it.svg).join("\n") +
  chainSvg + zipSvg + tokenSvg + ctrSvg + stackSvg + gold + cvLat.svg + cvCable.svg + cvSw.svg,
  [-2400, -2800, 9000, 5200]);

// ---------------------------------------------------------------- screen-space HTML
const EV = [
  ["②", "Bitget", "2026.09 · 约 3.9 亿美元", "Bitget 称"],
  ["④", "WazirX", "2024.07 · 约 2.3 亿美元", "说法冲突"],
  ["④", "Bybit", "2025.02 · 约 15 亿美元", "FBI 口径"],
  ["⑤", "Drift", "2026.04 · 约 2.85 亿美元", "Chainalysis 分析"],
  ["支线", "KelpDAO", "2026.04 · 约 2.92 亿美元", "LayerZero 称"],
];
const evCard = (n, name, sub, src, id, extra = "", top = 0) => `<div class="ev ${extra}" id="${id}" style="top:${top}px"><div class="ev-g${n.length > 1 ? " ev-g2" : ""}">${n}</div><div class="ev-m"><div class="ev-r1"><span class="ev-n">${name}</span><span class="ev-src">${src}</span></div><div class="ev-s">${sub}</div></div></div>`;
let evHtml = EV.map(([n, name, sub, src], i) => evCard(n, name, sub, src, "ev-" + i, "", i * 116)).join("");
evHtml += `<div class="ev ev-empty" data-layout-allow-overlap id="ev-slot" style="top:${5 * 116}px"><span>6</span></div>`;
evHtml += evCard("⑤⑦", "Binance", "2026.10 · 约 63.4 亿美元", "Binance 称", "ev-5", "ev-hot", 5 * 116);

// dot matrix panel
const DOT = 50, STEP = 60;
let dotsBN = "";
for (let i = 0; i < 63; i++) { const c = i % 9, r = Math.floor(i / 9); dotsBN += `<i class="slot" style="left:${c * STEP}px;top:${r * STEP}px"></i><i class="dot bn" id="bd-${i}" style="left:${c * STEP}px;top:${r * STEP}px"></i>`; }
dotsBN += `<i class="slot" style="left:0px;top:${7 * STEP}px"></i><i class="dot bn half" id="bd-63" style="left:0px;top:${7 * STEP}px"></i>`;
let dotsBY = "";
for (let i = 0; i < 15; i++) { const c = i % 5, r = Math.floor(i / 5); dotsBY += `<i class="slot" style="left:${c * STEP}px;top:${r * STEP}px"></i><i class="dot by" id="yd-${i}" style="left:${c * STEP}px;top:${r * STEP}px"></i>`; }
const mxHtml = `<div id="mx" data-layout-allow-overlap>
  <div id="mx-h">Binance · 2026 年 10 月 29 日</div>
  <div id="mx-chip">多条链的热钱包</div>
  <div id="mx-gbn">${dotsBN}</div>
  <div id="mx-big">约 <span id="mx-num">0.0</span> 亿美元</div>
  <div id="mx-src" class="srcb">Binance 口径</div>
  <div id="mx-by"><div id="mx-byl">对比 · Bybit 约 15 亿美元</div><div id="mx-gby">${dotsBY}</div></div>
  <div id="mx-leg"><i class="lgd"></i>每个点 = 1 亿美元</div>
</div>`;

let ticks = "";
for (let i = 0; i < 12; i++) { const a = (i * 30 * Math.PI) / 180, r0 = i % 3 ? 44 : 40; ticks += `<line x1="${f(60 + r0 * Math.sin(a))}" y1="${f(60 - r0 * Math.cos(a))}" x2="${f(60 + 50 * Math.sin(a))}" y2="${f(60 - 50 * Math.cos(a))}" stroke="#1c1c1c" stroke-width="${i % 3 ? 2 : 4}"/>`; }
const tcHtml = `<div id="tc"><svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="57" fill="#2f9fc4"/><circle cx="60" cy="60" r="52" fill="#fffdf8"/>${ticks}
  <rect id="tc-h" x="57" y="30" width="6" height="34" rx="3" fill="#1c1c1c" transform="rotate(250 60 60)"/><rect id="tc-m" x="58" y="14" width="4" height="50" rx="2" fill="#1c1c1c" transform="rotate(120 60 60)"/><circle cx="60" cy="60" r="5" fill="#e0453a"/></svg>
  <div id="tc-t"><div id="tc-l1"><span id="clk-a">20:20</span><span class="arrow">→</span><span id="clk-b">次日 00:10</span> UTC</div>
  <div id="tc-l2"><span id="tc-src" class="srci">按公开时间</span><span id="tc-dur" class="lab lab-rs">存活约 3 小时 50 分</span></div></div></div>`;
const qHtml = `<div id="qs">
  <div class="q" id="q-0"><span class="qm">?</span>告警时间</div>
  <div class="q" id="q-1"><span class="qm">?</span>内部 AI 工具怎么被利用</div>
</div>`;

const css = `
${kitCss()}
#root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
.src, .srcb { border-color: #cfc7b8 !important; color: #6d685e !important; background: #f6f3ec !important; font-size: 28px !important; box-shadow: none !important; }
.srcb { position: absolute; font-weight: 700; padding: 3px 14px 5px; border: 2px solid #cfc7b8; border-radius: 10px; white-space: nowrap; }
.zone { background: #1c1c1c; border-color: #1c1c1c; color: #ffffff; font-size: 34px; }
.zone-r { background: #ffffff; border-color: #1c1c1c; color: #1c1c1c; }
.lab .arrow { margin: 0 4px; color: #6d685e; }
#tc, #tc-src, #tc-dur, #src2, #zoff, #zon, #ev-5, #ev-tag, #ev-rep, #mx, #qs .q, #mx .dot, #hd, #mx-chip, #mx-by, #mx-src,
#dB, #dA, #pB, #pA, #atk, #room, #sig, #seal, #lock, #sw, #hws, #hw, #atk2, #clk { opacity: 0; }
#src2 { left: 56px; top: 128px; }
#zoff { position: absolute; left: 56px; top: 128px; }
#zon { position: absolute; left: 1160px; top: 128px; }
#hd { position: absolute; left: 56px; top: 34px; }
/* event cards */
#evcol { position: absolute; left: 1424px; top: 128px; width: 452px; }
.ev { position: absolute; left: 0; width: 452px; height: 104px; background: #ffffff; border-radius: 16px; box-shadow: 0 8px 20px rgba(70, 60, 40, 0.10);
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
.ev-hot { box-shadow: 0 0 0 4px #e0453a, 0 10px 24px rgba(160, 40, 30, 0.18); }
#ev-tag { position: absolute; right: 468px; top: ${5 * 116 + 26}px; }
#ev-rep { position: absolute; left: 0; top: ${6 * 116}px; }
/* dot matrix */
#mx { position: absolute; left: 70px; top: 128px; width: 1330px; height: 770px; background: #fffdf8; border-radius: 26px; box-shadow: 0 18px 40px rgba(70, 60, 40, 0.14); }
#mx-h { position: absolute; left: 56px; top: 36px; font-size: 46px; font-weight: 900; white-space: nowrap; }
#mx-chip { position: absolute; left: 56px; top: 108px; font-size: 30px; font-weight: 700; color: #ffffff; background: #1d93ba; border-radius: 12px; padding: 4px 16px 6px; white-space: nowrap; }
#mx-gbn { position: absolute; left: 60px; top: 196px; }
#mx-gby { position: absolute; left: 0; top: 62px; }
#mx .slot { position: absolute; width: ${DOT}px; height: ${DOT}px; border-radius: 50%; border: 3px dashed #d3ccbf; box-sizing: border-box; }
#mx .dot { position: absolute; width: ${DOT}px; height: ${DOT}px; border-radius: 50%; background: #e0453a; }
#mx .dot.half { clip-path: inset(0 60% 0 0); }
#mx .dot.by { background: #e0453a; }
#mx-big { position: absolute; left: 680px; top: 186px; font-size: 92px; font-weight: 900; line-height: 1.05; white-space: nowrap; font-variant-numeric: tabular-nums; }
#mx-big #mx-num { color: #e0453a; }
#mx-src { left: 686px; top: 300px; }
#mx-by { position: absolute; left: 686px; top: 404px; }
#mx-byl { font-size: 32px; font-weight: 900; white-space: nowrap; }
#mx-leg { position: absolute; left: 60px; top: 702px; display: flex; align-items: center; gap: 12px; font-size: 30px; font-weight: 700; color: #4a463f; white-space: nowrap; }
#mx-leg .lgd { width: 26px; height: 26px; border-radius: 50%; background: #e0453a; display: inline-block; }
/* timer card */
#tc { position: absolute; left: 1180px; top: 690px; display: flex; align-items: center; gap: 22px; background: #fffdf8; border-radius: 22px; padding: 16px 28px 16px 18px; box-shadow: 0 12px 28px rgba(70, 60, 40, 0.13); }
#tc-l1 { font-size: 36px; font-weight: 900; white-space: nowrap; font-variant-numeric: tabular-nums; }
#tc-l1 .arrow { margin: 0 10px; color: #6d685e; }
#clk-a { color: #1c1c1c; } #clk-b { color: #b8b0a1; }
#tc-l2 { margin-top: 10px; display: flex; gap: 12px; align-items: center; }
.srci { font-size: 28px; font-weight: 700; color: #6d685e; background: #f1ede5; border: 2px solid #cfc7b8; border-radius: 10px; padding: 2px 12px 4px; white-space: nowrap; }
/* question cards */
#qs { position: absolute; left: 56px; top: 210px; }
.q { position: absolute; left: 0; display: flex; align-items: center; gap: 16px; white-space: nowrap; font-size: 38px; font-weight: 900; color: #4a463f;
  background: #f6f3ec; border: 3px dashed #b8b0a1; border-radius: 18px; padding: 14px 28px 16px 18px; }
#q-1 { top: 104px; }
.qm { width: 52px; height: 52px; border-radius: 50%; background: #8d877b; color: #fff; font-size: 34px; display: flex; align-items: center; justify-content: center; }
`;

const html = `<template>
  <style>${css}
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div id="hd" class="lab lab-ink">断在哪一关 · 最后一起</div>
      <div id="src2" class="srcb">按 Binance 初步报告</div>
      <div id="zoff" class="lab zone">链下 · Binance 的开关</div><div id="zon" class="lab zone zone-r">链上 · 以太坊状态</div>
      <div id="evcol">${evHtml}<div id="ev-tag" class="lab lab-rs">最大的一起</div><div id="ev-rep" class="srcb">完整报告 · 还在等</div></div>
      ${mxHtml}
      ${qHtml}
      ${tcHtml}
      ${termCards(TERMS)}${pills(3)}
    </div>
  </div>
  <script>
${runtimeJs()}
  (function () {
    const CAMS = ${JSON.stringify(CAMS)};
    const K = ${JSON.stringify({ tokHome, tokDest, zipFrom, zipTo, stackC, blk4Top, goldFrom, goldTo, NB, NL, TOTAL })};
    const tl = gsap.timeline({ paused: true });
    const $ = (id) => document.getElementById(id);
    const IO = "power2.inOut";
    KIT.camSet(tl, CAMS.PAN);
    // ---- initial states
    const hideObj = ["dB", "dA", "pB", "pA", "atk", "room", "sig", "seal", "lock", "sw", "hws", "hw", "atk2"];
    const show = (id, t, d) => { tl.set("#" + id, { opacity: 1 }, t); KIT.grow(tl, id, t, d); };
    const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
    const fade = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.25, ease: "power1.in" }, t);
    const redPlate = (i, t) => { tl.to("#g" + i + "-plate", { attr: { fill: "#e0453a", stroke: "#a8322a" }, duration: 0.25 }, t); tl.to("#g" + i + "-plate-n", { attr: { fill: "#ffffff" }, duration: 0.25 }, t); };
    // quadratic arc mover (translate relative to the element's drawn position)
    function arc(id, t, dur, A, B, lift, ease, fadeEnds) {
      const el = $(id), o = { k: 0 }, Cx = (A[0] + B[0]) / 2, Cy = Math.min(A[1], B[1]) - lift;
      tl.fromTo(o, { k: 0 }, { k: 1, duration: dur, ease: ease || IO, immediateRender: false, onUpdate: function () {
        const k = o.k, x = (1 - k) * (1 - k) * A[0] + 2 * (1 - k) * k * Cx + k * k * B[0], y = (1 - k) * (1 - k) * A[1] + 2 * (1 - k) * k * Cy + k * k * B[1];
        el.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ")");
        if (fadeEnds) el.setAttribute("opacity", (k <= 0 || k >= 1) ? 0 : Math.min(1, k * 10, (1 - k) * 6).toFixed(2));
      } }, t);
    }
    function count(id, t, dur, from, to, dec, ease) {
      const el = $(id), o = { v: from };
      tl.fromTo(o, { v: from }, { v: to, duration: dur, ease: ease || "power2.out", immediateRender: false, onUpdate: function () { el.textContent = o.v.toFixed(dec); } }, t);
    }

    // ================= L0 · 最后一起，也是最大的一起 (1.6–3.7)
    pop("#hd", 0.3);
    tl.to("#ev-slot", { borderColor: "#e0453a", duration: 0.2, yoyo: true, repeat: 1 }, 1.2);
    tl.fromTo("#ev-5", { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out", immediateRender: false }, 1.72);
    tl.set("#ev-slot", { opacity: 0 }, 2.2);
    pop("#ev-tag", 2.95);
    // the two Binance flag positions are hinted (no flag yet)
    // ================= L1 · 63.4 亿美元 (4.8–12.0)
    fade("#hd", 4.5);
    fade("#ev-tag", 4.6, 0.2);
    tl.fromTo("#mx", { opacity: 0, scale: 0.28, transformOrigin: "100% 84%" }, { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out", immediateRender: false }, 4.85);
    pop("#mx-chip", 7.3);
    tl.fromTo("#mx-gbn .dot", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(1.6)", stagger: 0.014, immediateRender: false }, 8.85);
    count("mx-num", 8.85, 1.1, 0, 63.4, 1, "power1.out");
    tl.fromTo("#mx-by", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 9.8);
    tl.fromTo("#mx-gby .dot", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(1.6)", stagger: 0.03, immediateRender: false }, 10.0);
    pop("#mx-src", 11.0);
    // panel folds back into card 6; cards slide out; camera pushes into the office
    tl.to("#mx", { opacity: 0, scale: 0.28, transformOrigin: "100% 84%", duration: 0.4, ease: "power3.in" }, 12.25);
    tl.to("#evcol", { x: 520, duration: 0.6, ease: "power2.in" }, 12.6);
    KIT.cam(tl, 12.5, CAMS.OFF1, 1.2);
    tl.to("#fl-f-bitget", { opacity: 0, duration: 0.2 }, 12.6);   // 镜头推近后会被画面左缘切掉，先淡出，回到总览再淡入
    // ================= L2 · 假面试作业 (13.1–18.9)
    show("dB", 13.2); show("pB", 13.35);
    pop("#lb-dB", 13.6);
    pop("#src2", 13.9);
    show("atk", 14.9);
    pop("#lb-atk", 15.15);
    tl.fromTo("#zip", { opacity: 0 }, { opacity: 1, duration: 0.1, immediateRender: false }, 15.7);
    arc("zip", 15.7, 1.1, K.zipFrom, K.zipTo, 200, "power1.inOut", false);
    pop("#lb-zip", 16.1);
    tl.to("#zip", { opacity: 0, duration: 0.15 }, 17.05);
    KIT.swap(tl, "#dB-scr", "#dB-scr2", 17.25, 0.3);
    fade("#lb-zip", 17.3, 0.2);
    pop("#lb-dBx", 17.6);
    // ================= L3 · 另一名工程师 · 容器部署令牌 (20.0–23.5)
    KIT.cam(tl, 19.3, CAMS.OFF2, 1.2);
    fade("#src2", 19.4, 0.2);
    fade("#fl-f-kelp", 19.3, 0.2);
    pop("#fl-f-kelp", 25.6);
    show("dA", 20.1); show("pA", 20.25);
    pop("#lb-dA", 20.5);
    KIT.draw(tl, "cv-lat", 21.0, 0.8);
    tl.fromTo("#tok", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 22.2);
    pop("#lb-tok", 22.5);
    // ================= L4 · 部署容器 → 签名服务 (24.6–28.6)
    fade("#lb-tok, #lb-dA, #lb-dB", 24.6, 0.2);
    arc("tok", 24.7, 0.8, [0, 0], [K.tokDest[0] - K.tokHome[0], K.tokDest[1] - K.tokHome[1]], 120, IO, false);
    KIT.cam(tl, 25.2, CAMS.G5, 1.1);
    tl.to("#gl-3", { opacity: 0, duration: 0.2 }, 25.3);   // ③ 关名被左缘切掉
    tl.fromTo("#room", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 25.6);
    show("sig", 25.75);
    tl.set("#ctrW", { opacity: 1 }, 26.1);
    tl.fromTo("#ctrW", { y: -420 }, { y: 0, duration: 0.55, ease: "bounce.out", immediateRender: false }, 26.1);
    pop("#lb-ctr", 26.6);
    KIT.draw(tl, "cv-cab", 27.0, 0.6);
    pop("#lb-sig", 27.6);
    ["sig-led-0", "sig-led-1", "sig-led-2"].forEach((id, i) => KIT.led(tl, id, 27.7 + i * 0.1, "red"));
    // ================= L5 · 第五关：替他签 (29.7–34.4)
    fade("#lb-ctr, #lb-dBx, #lb-atk", 29.1, 0.2);
    
    redPlate(5, 30.1);
    tl.set("#f-bn5-w", { opacity: 1 }, 30.2); KIT.grow(tl, "f-bn5", 30.2);
    pop("#fl-f-bn5", 30.55);
    show("seal", 30.9);
    show("lock", 31.7);
    pop("#lb-key", 32.05);
    KIT.stamp(tl, "seal", 33.05);
    pop("#lb-sign", 33.85);
    // ================= L6 · 50 笔 nonce / 7702 (35.4–41.0)
    fade("#lb-sign, #lb-sig, #lb-key", 35.3, 0.2);
    KIT.cam(tl, 35.4, CAMS.STK, 1.0);
    tl.to("#fl-f-bn5", { opacity: 0, duration: 0.2 }, 35.5);   // 抬高的旗子标签会钻到右上角章节胶囊下面，推近期间先淡出
    for (let i = 0; i < 12; i++) tl.fromTo("#sh-" + i, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.18, ease: "power2.out", immediateRender: false }, 36.55 + i * 0.07);
    pop("#lb-n50", 36.6);
    count("n50", 36.6, 0.9, 0, 50, 0, "power1.out");
    pop("#lb-nonce", 37.35);
    tl.to("#lb-nonce", { opacity: 0, duration: 0.2 }, 38.6);
    pop("#lb-7702", 38.75);
    // ================= L7 · 热钱包执行攻击者代码 (42.0–45.9)
    fade("#lb-7702, #lb-n50", 41.0, 0.2);
    KIT.cam(tl, 41.0, CAMS.HW, 1.3);
    tl.to("#gl-7", { opacity: 0, duration: 0.2 }, 41.1);   // ⑦ 关名被左缘切掉
    arc("stk", 41.1, 1.15, [0, 0], [K.blk4Top[0] - K.stackC[0], K.blk4Top[1] - K.stackC[1]], 260, IO, false);
    tl.to("#stk", { opacity: 0, duration: 0.2 }, 42.2);
    tl.to("#blkR", { opacity: 1, duration: 0.25 }, 42.25);
    show("hw", 42.3);
    pop("#lb-hw", 42.7);
    for (let i = 0; i < K.NL; i++) tl.fromTo("#dl-" + i, { opacity: 0 }, { opacity: 1, duration: 0.12, immediateRender: false }, 43.2 + i * 0.07);
    pop("#lb-deleg", 43.6);
    KIT.door(tl, "hw", 43.8, 105, 0.8);
    KIT.swap(tl, "#hw-core", "#hw-core-atk", 44.65, 0.3);
    pop("#lb-core", 44.75);
    // gold starts leaving
    show("atk2", 45.3);
    for (let i = 0; i < K.NB; i++) for (let c = 0; c < 12; c++) {
      const t0 = 45.6 + c * 1.28 + i * 0.16;
      if (t0 + 1.2 > 61.0) continue;
      arc("gb-" + i, t0, 1.2, K.goldFrom, K.goldTo, 130, "power1.inOut", true);
    }
    // ================= L8 · 第七关：暂停提现、关热钱包服务 (46.9–51.8)
    fade("#lb-hw, #lb-core", 46.4, 0.2);
    KIT.cam(tl, 46.3, CAMS.SPLIT, 1.2);
    redPlate(7, 47.5);
    tl.set("#f-bn7-w", { opacity: 1 }, 47.6); KIT.grow(tl, "f-bn7", 47.6);
    pop("#fl-f-bn7", 47.95);
    show("sw", 48.5); show("hws", 48.65);
    pop("#lb-atk2", 48.8);
    KIT.toggle(tl, "sw", 49.45, false, 0.5);
    pop("#lb-sw", 49.95);
    ["hws-led-0", "hws-led-1", "hws-led-2", "hws-act-0", "hws-act-1", "hws-act-2"].forEach((id, i) => KIT.led(tl, id, 50.6 + (i % 3) * 0.12, "off"));
    pop("#lb-hws", 51.3);
    // ================= L9 · 委托是链上状态 (52.9–56.0)
    tl.to("#divider", { opacity: 1, duration: 0.4 }, 53.0);
    pop("#zoff", 53.2); pop("#zon", 53.7);
    tl.to("#lb-deleg", { opacity: 0, duration: 0.15 }, 53.9);
    pop("#lb-deleg2", 54.0);
    KIT.draw(tl, "cv-sw", 54.6, 0.7);
    pop("#bx-sw-b", 55.3);
    // ================= L10 · 存活约 3 小时 50 分 (57.1–61.5)
    fade("#lb-sw, #lb-hws, #lb-atk2", 56.9, 0.2);
    pop("#tc", 57.25);
    pop("#tc-src", 57.8);
    tl.fromTo("#tc-m", { rotation: 120, svgOrigin: "60 60" }, { rotation: 120 + 1380, svgOrigin: "60 60", duration: 2.6, ease: "power1.inOut", immediateRender: false }, 58.4);
    tl.fromTo("#tc-h", { rotation: 250, svgOrigin: "60 60" }, { rotation: 250 + 115, svgOrigin: "60 60", duration: 2.6, ease: "power1.inOut", immediateRender: false }, 58.4);
    tl.to("#clk-a", { color: "#b8b0a1", duration: 0.2 }, 60.9);
    tl.to("#clk-b", { color: "#17809f", duration: 0.2 }, 60.9);
    pop("#tc-dur", 60.5);
    // the delegation finally breaks at 00:10
    tl.to("#dl-4", { opacity: 0, duration: 0.12 }, 61.0);
    tl.to("#dlA", { x: -14, y: -26, opacity: 0, duration: 0.6, ease: "power2.out" }, 61.05);
    tl.to("#dlB", { x: 10, y: 60, opacity: 0, duration: 0.6, ease: "power2.in" }, 61.05);
    tl.to("#lb-deleg2", { opacity: 0, duration: 0.15 }, 61.0);
    pop("#lb-deleg3", 61.15);
    // ================= L11 · 还没说清 / 完整报告还在等 (62.6–69.4)
    pop("#q-0", 62.75);
    pop("#q-1", 63.85);
    fade("#q-0, #q-1", 66.0, 0.3);
    fade("#tc, #lb-deleg3, #zoff, #zon, #bx-sw-b, #cv-sw, #lb-tok, #lb-sig", 66.0, 0.25);
    KIT.cam(tl, 66.1, CAMS.PAN, 1.2);
    tl.to("#fl-f-bitget, #gl-3, #gl-7, #fl-f-bn5", { opacity: 1, duration: 0.3 }, 66.1);
    fade("#hw, #atk2, #divider, #deleg", 66.4, 0.4);
    tl.to("#evcol", { x: 0, duration: 0.7, ease: "power3.out" }, 66.4);
    pop("#ev-rep", 68.05);
    ${termJs(TERMS)}
    window.__timelines["story"] = tl;
  })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "PAN", PAN);
