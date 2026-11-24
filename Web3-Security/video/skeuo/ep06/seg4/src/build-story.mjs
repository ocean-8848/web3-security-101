// Generates compositions/story.html for ep06/seg4「④ 金库通胀」（首存者通胀攻击）.
// Run: node src/build-story.mjs
// World: 整数工坊. Mid = 取整刀 (roundCutter); mid-right = 金库 (kit safe "ERC-4626") + 份额出票机 (shareDispenser, −u side).
// The vault door stays open from L3 to L14 so the viewer always sees how much gold is inside.
// Gold inside the vault is drawn by this script (clipped to the door opening): demo / 1 wei / donation / victim.
// Rounding close-ups (L2, L11) are a picture-in-picture inset with its own small cutter.
import fs from "node:fs";
import { G, at, f, CE, M, box, faceTop, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, BADGE, CHECK, kitCss, runtimeJs, pts } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as LY from "./layout.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const w = (term, line, o = {}) => wordAt(T, term, { line, ...o }).start;
const we = (term, line, o = {}) => wordAt(T, term, { line, ...o }).end;
const L = (i) => lineAt(T, i);
const items = [];
const A = {};
const add = (y, svg) => items.push({ y, svg });
const put = (name, r, o, dy = 0) => { A[name] = r.anchors; add(at(o)[1] + dy, r.svg); return r; };
const up = (p, dy) => [p[0], p[1] - dy];
const rt = (p, dx, dy = 0) => [p[0] + dx, p[1] + dy];
const mid = (a, b, t = 0.5) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const VO = LY.VAULT;

// ---------------------------------------------------------------- gold helpers
const GB = { l: 56, w: 26, h: 16 };
/** a stack of gold bars around origin o: layers[k] = [cols, rows] per layer (bottom first); z0 = base height */
function goldStack(o, layers, z0 = 0, gap = 4) {
  const boxes = [];
  layers.forEach(([nc, nr], k) => {
    const W = nc * GB.l + (nc - 1) * gap, D = nr * GB.w + (nr - 1) * gap;
    for (let c = 0; c < nc; c++) for (let r = 0; r < nr; r++) {
      const u0 = -W / 2 + c * (GB.l + gap), v0 = -D / 2 + r * (GB.w + gap), z = z0 + k * GB.h;
      boxes.push({ u0, v0, z, key: [v0, -u0, z] });
    }
  });
  boxes.sort((a, b) => a.z - b.z || a.v0 - b.v0 || b.u0 - a.u0);
  return boxes.map((b) => box(o, b.u0, b.u0 + GB.l, b.v0, b.v0 + GB.w, b.z, b.z + GB.h, M.gold, 1.2)).join("");
}
const groupAt = (id, o, svg, op = 1) => { const g = at(o); return `<g id="${id}" data-ox="${f(g[0])}" data-oy="${f(g[1])}" opacity="${op}">${svg}</g>`; };

// ================================================================ objects
// ---- mid: the rounding cutter (L0)
put("rc", X.roundCutter(LY.CUTTER, { id: "rc", dir: "down", pileL: 3, stock: 1, chip: 0.5 }), LY.CUTTER);

// ---- the vault: safe + share dispenser + mail slot on the top plate
put("vault", O.safe(VO, { id: "vault", plate: "ERC-4626", gold: false }), VO);
put("sd", X.shareDispenser(LY.DISP, { id: "sd", value: 0, tickets: 2 }), LY.DISP, 0.1);
// safe geometry (kit safe): W 290, D 240, zf 14, H 320 → top plate at z 339; opening ui ±117, v1 120, z 42..306
const SAFE = { ui0: -117, ui1: 117, v1: 120, vb: -94, zi0: 42, zi1: 306, zs: 174, top: 339 };
{
  const open = [at(VO, SAFE.ui0, SAFE.v1, SAFE.zi0), at(VO, SAFE.ui1, SAFE.v1, SAFE.zi0), at(VO, SAFE.ui1, SAFE.v1, SAFE.zi1), at(VO, SAFE.ui0, SAFE.v1, SAFE.zi1)];
  const inside = (id, o, layers, z0, op = 0) => groupAt(id, o, goldStack(o, layers, z0), op);
  let g = `<defs><clipPath id="vin-c"><polygon points="${pts(open)}"/></clipPath></defs><g clip-path="url(#vin-c)">`;
  g += inside("g-demo", { u: VO.u - 30, v: VO.v + 60 }, [[2, 1]], SAFE.zi0);
  g += groupAt("g-wei", VO, box(VO, -100, -88, 70, 78, SAFE.zi0, SAFE.zi0 + 5, M.gold, 1), 0);
  g += inside("g-don", { u: VO.u + 6, v: VO.v + 30 }, [[3, 3], [3, 3], [3, 3], [3, 2], [2, 2], [2, 1]], SAFE.zi0);
  g += inside("g-vic", { u: VO.u + 6, v: VO.v + 40 }, [[3, 3], [3, 3], [3, 2], [2, 2], [2, 1]], SAFE.zs + 6);
  g += `</g>`;
  add(at(VO)[1] + 0.2, g);
  // mail slot (brass) on the top plate + its highlight ring
  const slot = `<g transform="${faceTop(VO, -52, -14, SAFE.top)}"><rect x="0" y="0" width="104" height="28" rx="5" fill="#c9a24a" stroke="#7a5d1c" stroke-width="2"/>
    <rect x="10" y="9" width="84" height="10" rx="3" fill="#1d2024"/></g>`;
  const ring = `<g id="slotHi" opacity="0" transform="${faceTop(VO, -66, -26, SAFE.top)}"><rect x="0" y="0" width="132" height="52" rx="12" fill="none" stroke="#2aa3c9" stroke-width="7"/></g>`;
  add(at(VO)[1] + 0.3, slot + ring);
  A.slot = at(VO, 0, 0, SAFE.top);
  A.gold = at(VO, 0, 80, 90);
  A.inside = at(VO, 0, 100, 150);
}
// attacker's 1-wei crumb (carried into the dispenser coin slot)
const CRUMB_O = { u: LY.ATK.u + 40, v: LY.ATK.v + 30 };
add(at(CRUMB_O)[1] + 1, groupAt("crumb", CRUMB_O, box(CRUMB_O, -8, 8, -5, 5, 110, 116, M.gold, 1), 0));
A.crumb = at(CRUMB_O, 0, 0, 113);

// people
put("atk", O.person(LY.ATK, { id: "atk", role: "attacker" }), LY.ATK);
put("vic", O.person(LY.VIC, { id: "vic", role: "signer" }), LY.VIC);
// gold piles on the ground
add(at(LY.ATK_PILE)[1], groupAt("p-don", LY.ATK_PILE, goldStack(LY.ATK_PILE, [[3, 3], [3, 3], [3, 2], [2, 2], [2, 1], [1, 1]])));
A.pDon = at(LY.ATK_PILE, 0, 0, 120);
add(at(LY.VIC_PILE)[1], groupAt("p-vic", LY.VIC_PILE, goldStack(LY.VIC_PILE, [[3, 3], [3, 3], [3, 2], [2, 2], [2, 1]])));
A.pVic = at(LY.VIC_PILE, 0, 0, 105);
const OUT_A = { u: LY.ATK_OUT.u - 80, v: LY.ATK_OUT.v }, OUT_B = { u: LY.ATK_OUT.u + 110, v: LY.ATK_OUT.v + 60 };
add(at(OUT_A)[1], groupAt("p-outA", OUT_A, goldStack(OUT_A, [[3, 3], [3, 3], [3, 2], [2, 2], [2, 1], [1, 1]])));
add(at(OUT_B)[1], groupAt("p-outB", OUT_B, goldStack(OUT_B, [[3, 3], [3, 3], [3, 2], [2, 2], [2, 1]])));
A.outA = at(OUT_A, 0, 0, 110); A.outB = at(OUT_B, 0, 0, 95);

// the attacker's share certificate (red edge) — built on the dispenser's catch shelf
const CERT_O = { u: LY.DISP.u, v: LY.DISP.v + 67 };
put("ac", X.shareCert(CERT_O, { id: "ac", state: "attacker", scale: 1.3, z: 61 }), CERT_O, 0.5);
const ATK_HAND = { du: LY.ATK.u - CERT_O.u + 46, dv: LY.ATK.v - CERT_O.v + 26, dz: 125 - 61 };
A.acHand = at(CERT_O, ATK_HAND.du, ATK_HAND.dv, 125 + 30);

// ---- front-running lane (L15): a strip of road + two letters
{
  const a = at(LY.LANE0), b = at(LY.LANE1);
  const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy), nx = -dy / n * 46, ny = dx / n * 46;
  const road = `<g id="lane" opacity="0"><polygon points="${pts([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]])}" fill="#ddd6c9" stroke="#c6bead" stroke-width="2"/>
    <path d="M${f(a[0] + dx * 0.08)} ${f(a[1] + dy * 0.08)}L${f(b[0] - dx * 0.05)} ${f(b[1] - dy * 0.05)}" stroke="#ffffff" stroke-width="4" stroke-dasharray="18 14"/></g>`;
  add(Math.min(a[1], b[1]) - 200, road);
  A.lane = { a, b, at: (t) => [a[0] + dx * t, a[1] + dy * t] };
}
const laneUV = (t) => ({ u: LY.LANE0.u + (LY.LANE1.u - LY.LANE0.u) * t, v: LY.LANE0.v + (LY.LANE1.v - LY.LANE0.v) * t });
const LV = laneUV(0.25), LA = { u: LY.ATK.u + 140, v: LY.ATK.v + 210 };
{ const r = E1.letter(LV, { id: "lv" }); A.lv = r.anchors; add(at(LV)[1], `<g id="lvw" opacity="0">${r.svg}</g>`); }
{ const r = E1.letter(LA, { id: "la", state: "attacker" }); A.la = r.anchors; add(at(LA)[1], `<g id="law" opacity="0">${r.svg}</g>`); }
const LANE_PTS = { vBack: at(laneUV(0.62)), aMid: at(laneUV(0.42)), aHead: at(laneUV(0.12)) };

// ---- balance (L16)
put("bal", E1.balance(LY.BAL, { id: "bal", tilt: 14, glow: false }), LY.BAL);

// ---- L18: the donation the attacker would need, as a growing gold column (right of the safe)
add(at(LY.STACK)[1], groupAt("p-need", LY.STACK, goldStack(LY.STACK, Array.from({ length: 48 }, () => [2, 2]))));
A.need = at(LY.STACK, 0, 0, 48 * GB.h + 30);

// ---- pizza metaphor (L19–L21)
put("pz", X.pizza(LY.PIZZA, { id: "pz", slices: 1 }), LY.PIZZA);
{
  let disc = "";
  for (let k = 0; k < 14; k++) disc += cylDisc(LY.PIZZA, 24 + k * 10, k === 13);
  add(at(LY.PIZZA)[1] + 0.5, groupAt("pz-100", LY.PIZZA, disc));
  A.pz100 = at(LY.PIZZA, 0, 0, 24 + 14 * 10 + 40);
}
function cylDisc(o, z, topping) {
  // one whole pizza lying flat: crust rim (side) + cheese top; the top one shows toppings
  const c = at(o, 0, 0, z), top = at(o, 0, 0, z + 6), rx = 86, ry = 86 * 0.5;
  let s = `<path d="M${f(c[0] - rx)} ${f(c[1])}A${rx} ${ry} 0 0 0 ${f(c[0] + rx)} ${f(c[1])}L${f(top[0] + rx)} ${f(top[1])}A${rx} ${ry} 0 0 1 ${f(top[0] - rx)} ${f(top[1])}Z" fill="#c98a3c" stroke="#7a4c18" stroke-width="1.4"/>
    <ellipse cx="${f(top[0])}" cy="${f(top[1])}" rx="${rx}" ry="${ry}" fill="#dfa24e" stroke="#7a4c18" stroke-width="1.4"/>
    <ellipse cx="${f(top[0])}" cy="${f(top[1])}" rx="${rx * 0.84}" ry="${ry * 0.84}" fill="#f4d27a"/>`;
  if (topping) for (const [dx, dy, col] of [[-36, -6, "#3f4a2a"], [20, -14, "#5d7a2e"], [40, 8, "#3f4a2a"], [-10, 14, "#b58a5a"], [-48, 10, "#5d7a2e"], [8, -2, "#3f4a2a"]])
    s += `<ellipse cx="${f(top[0] + dx)}" cy="${f(top[1] + dy * 0.9)}" rx="7" ry="4.5" fill="${col}"/>`;
  return s;
}
put("c1", O.person(LY.CUST1, { id: "c1", role: "attacker" }), LY.CUST1);
put("c2", O.person(LY.CUST2, { id: "c2", role: "signer" }), LY.CUST2);
{
  let s = "";
  for (let k = 0; k < 6; k++) s += box(LY.COINS, -20, 20, -20, 20, k * 7, k * 7 + 6, M.gold, 1.2);
  add(at(LY.COINS)[1], groupAt("coins", LY.COINS, s));
  A.coins = at(LY.COINS, 0, 0, 60);
}

items.sort((a, b) => a.y - b.y);
const world = worldSvg("wsvg", gridSvg({ u0: -2600, u1: 4200, v0: -1800, v1: 3800 }) + items.map((x) => x.svg).join("\n"), [-2200, -1800, 6000, 4400]);

// ================================================================ PIP cutters (screen inset)
function pipSvg(id, opts) {
  const o = { u: 0, v: 0 };
  const r = X.roundCutter(o, { id, dir: "down", ...opts });
  const c = r.anchors.center;
  const vb = [c[0] - 320, c[1] - 175, 660, 440];
  return { svg: `<svg class="pipsvg" viewBox="${vb.join(" ")}" width="540" height="360">${gridSvg({ u0: -800, u1: 800, v0: -800, v1: 800 })}${r.svg}</svg>`, A: r.anchors, vb };
}
const P1 = pipSvg("pc1", { stock: 1, chip: 0.5, pileL: 1 });
const P2 = pipSvg("pc2", { stock: 0, chip: 0.96, pileL: 0 });
const pipPos = (P, p) => [(p[0] - P.vb[0]) * 540 / 660, (p[1] - P.vb[1]) * 360 / 440 + 60];

// ================================================================ cameras
const VC = A.vault.center;
const CAMS = {
  rc: camAt(rt(A.rc.center, 0, -20), 960, 560, 1.15),
  form: camAt(rt(VC, -60, -40), 900, 640, 1.0),
  door: camAt(rt(VC, -40, -10), 860, 620, 1.05),
  atk: camAt(up(A.vault.top, 30), 900, 330, 0.8),
  vic: camAt(up(A.vault.top, 30), 860, 390, 0.72),
  out: camAt(up(A.vault.top, 30), 1000, 390, 0.72),
  lane: camAt(LY.VW(-20, 330), 960, 560, 1.25),
  bal: camAt(up(A.bal.center, 40), 1000, 560, 1.3),
  cond: camAt(LY.VW(260, 40), 1240, 600, 0.8),
  pz: camAt(LY.VW(-850, 390), 900, 560, 1.15),
  cmp: camAt(LY.VW(-520, 170), 960, 560, 0.8),
};

// ================================================================ labels (world)
let labels = "";
// L0 cutter
labels += wlab("lb-dir", rt(A.rc.leverDn, -40, 0), "方向写对了", "lab-gs hide", "r");
labels += wlab("lb-rem", rt(A.rc.trayL, 0, 14), "余数 → 协议", "lab-cs lab-sm hide", "t");
labels += wpin("qm", rt(A.rc.top, 160, -20), `<div class="qm hide" id="qmi">?</div>`, "c");
// vault
labels += wlab("lb-safe", up(A.vault.top, 30), "金库安全吗？", "lab-g hide");
labels += wlab("lb-no", up(A.vault.top, 30), "不一定", "lab-r hide");
labels += wlab("lb-4626", up(A.vault.top, 30), "ERC-4626 金库", "hide");
labels += wlab("lb-bal", rt(A.vault.ground, 40, 70), "balanceOf · 柜里有多少算多少", "lab-sm hide", "t");
labels += wlab("lb-slot", up(A.slot, 70), "直接转账也算", "lab-cs hide");
labels += wlab("lb-ex", up(A.vault.top, 30), "示例数字", "lab-g hide");
labels += wlab("lb-ts0", rt(A.sd.counter, -90, -60), "总份额 0", "lab-ink lab-sm hide", "r");
labels += wlab("lb-ts1", rt(A.sd.counter, -90, -60), "总份额 1", "lab-ink lab-sm hide", "r");
labels += wlab("lb-ts1b", rt(A.sd.counter, -90, -60), "总份额 仍是 1", "lab-rs lab-sm hide", "r");
labels += wlab("lb-ts0b", rt(A.sd.counter, -90, -60), "总份额 0", "lab-ink lab-sm hide", "r");
labels += wlab("lb-ta0", up(A.vault.top, 30), "总资产 0", "lab-ink hide");
labels += wlab("lb-ta1", up(A.vault.top, 30), "总资产 1 wei", "lab-ink hide");
labels += wlab("lb-ta2", up(A.vault.top, 30), "总资产 1 万 USDC + 1", "lab-ink hide");
labels += wlab("lb-ta3", up(A.vault.top, 30), "总资产 ≈ 19999 USDC", "lab-ink hide");
labels += wlab("lb-ta4", up(A.vault.top, 30), "总资产 ≈ 0", "lab-ink hide");
labels += wlab("lb-atk", up(A.atk.head ?? A.atk.top, 40), "攻击者", "lab-rs lab-sm hide");
labels += wlab("lb-wei", rt(A.crumb, -40, -10), "存入 1 wei", "lab-r lab-sm hide", "r");
labels += wlab("lb-1s", rt(A.acHand, -40, 20), "拿到 1 份额", "lab-rs lab-sm hide", "r");
labels += wlab("lb-1w", up(A.pDon, 30), "1 万 USDC", "lab-r hide");
labels += wlab("lb-nodep", rt(A.sd.top, -20, -10), "不走 deposit", "lab-r lab-sm hide", "r");
labels += wpin("bx-dep", rt(A.sd.center, 0, -20), BADGE("bx-depi", 56, "hide"), "c");
labels += wlab("lb-all", rt(A.acHand, -40, 20), "1 份 = 全部", "lab-rs hide", "r");
labels += wlab("lb-vic", up(A.vic.head ?? A.vic.top, 40), "受害者", "lab-ink lab-sm hide");
labels += wlab("lb-9999", rt(A.pVic, -80, 0), "9999 USDC", "hide", "r");
labels += wlab("lb-0s", rt(A.sd.slot, 70, 30), "0 份额", "lab-rs hide", "l");
labels += wpin("bx-vic", up(A.vic.head ?? A.vic.top, 120), BADGE("bx-vici", 64, "hide"), "c");
labels += wlab("lb-empty", rt(A.vic.head ?? A.vic.top, 60, 30), "一份也没拿到", "lab-r lab-sm hide", "l");
labels += wlab("lb-19999", up(mid(A.outA, A.outB), 120), "取回 ≈ 19999 USDC", "lab-rs hide");
labels += wlab("lb-own", rt(A.outA, -80, 0), "自己的 1 万", "lab-g lab-sm hide", "r");
labels += wlab("lb-vdep", rt(A.outB, 60, -80), "受害者的 9999", "lab-r lab-sm hide", "l");
labels += wlab("lb-gift", rt(mid(A.vic.ground, A.outB), 150, -75), "受害者的存款 → 归了这 1 份额", "lab-rs hide", "t");
// lane
labels += wlab("lb-lv", up(A.lv.top, 0), "受害者的第一笔存款", "lab-sm hide");
labels += wlab("lb-la", up(LANE_PTS.aHead, 110), "攻击者的交易 · 先执行", "lab-rs lab-sm hide");
labels += wlab("lb-lv2", rt(LANE_PTS.vBack, 70, -50), "受害者的存款", "lab-sm hide", "l");
labels += wlab("lb-fr", rt(A.lane.b, 40, -60), "抢跑", "lab-g hide", "l");
labels += wlab("lb-lane", rt(A.lane.b, 30, 20), "交易排队", "lab-g lab-sm hide", "l");
// balance
labels += wlab("lb-panL", rt(A.bal.panL, -60, 0), "捐赠额 = 攻击成本", "lab-r lab-sm hide", "r");
labels += wlab("lb-panR", rt(A.bal.panR, 60, 0), "受害者存款", "lab-sm hide", "l");
labels += wlab("lb-prof", up(A.bal.top, 70), "接近 → 有利可图", "lab-rs hide");
// need column
labels += wlab("lb-need", up(A.need, 0), "所需捐赠", "lab-g lab-sm hide");
// pizza
labels += wlab("lb-meta", up(A.pz.top, 40), "比喻", "lab-g hide");
labels += wlab("lb-c1", up(A.c1.head ?? A.c1.top, 40), "第一个顾客", "lab-rs lab-sm hide");
labels += wlab("lb-1blk", rt(A.pz.pizza, 120, 40), "整张只切成 1 块", "lab-sm hide", "l");
labels += wlab("lb-100", rt(A.pz100, 110, 30), "偷偷塞进 100 张", "lab-r hide", "l");
labels += wlab("lb-c2", up(A.c2.head ?? A.c2.top, 40), "下一个顾客", "lab-ink lab-sm hide");
labels += wlab("lb-99", rt(A.coins, 0, -45), "付 99 张的钱", "lab-sm hide", "t");
labels += wlab("lb-101", up(A.pz100, 0), "1 块 = 101 张", "lab-rs hide");
labels += wpin("bx-c2", rt(A.c2.center, 70, -110), BADGE("bx-c2i", 60, "hide"), "c");
labels += wlab("lb-none", rt(A.c2.center, 110, -110), "一块也分不到", "lab-r lab-sm hide", "l");
labels += wlab("lb-cmpv", rt(up(A.vault.top, 30), -200), "1 份额 = 整个金库", "lab-rs hide");

// world dashed lines
const dGift = dashCurve("dGift", up(A.vic.center, 20), rt(A.outB, 30, -10), { c1: rt(A.vic.center, -200, -260), c2: rt(A.outB, 200, -260) });
const worldLines = `<svg class="wsvg" style="left:0;top:0" width="10" height="10" overflow="visible">${dGift.svg}</svg>`;

// ================================================================ screen layer
// code card D (L1–L4)
const codeHtml = `<div class="k-code" id="cardD"><div class="c-head">份额公式<span class="c-tag">ERC-4626</span></div>
  <div class="c-row" id="cd0"><span class="c-bar" id="cb0"></span>shares = assets * totalSupply / totalAssets <span class="c-cm">// 向下取整</span></div>
  <div class="c-row" id="cd1"><span class="c-bar" id="cb1"></span>totalAssets = asset.balanceOf(address(this)) <span class="c-cm">// 任何人都能转入</span></div></div>`;
// object formula above the vault (L1)
const ICON = {
  bar: `<svg width="46" height="30" viewBox="0 0 46 30"><path d="M8 10L38 10L44 24L2 24Z" fill="#e3b341" stroke="#8a6414" stroke-width="2.4" stroke-linejoin="round"/><path d="M10 13L36 13" stroke="#f6dc8a" stroke-width="2.4"/></svg>`,
  cert: `<svg width="46" height="32" viewBox="0 0 46 32"><rect x="2" y="3" width="42" height="26" rx="4" fill="#fbf8f1" stroke="#2aa3c9" stroke-width="3"/><circle cx="13" cy="16" r="6" fill="#1d93ba"/><rect x="23" y="13" width="15" height="5" rx="2" fill="#2aa3c9"/></svg>`,
  pile: `<svg width="46" height="34" viewBox="0 0 46 34"><path d="M4 22L20 22L24 31L0 31Z M24 22L40 22L44 31L20 31Z M14 12L30 12L34 21L10 21Z" fill="#e3b341" stroke="#8a6414" stroke-width="2.2" stroke-linejoin="round"/></svg>`,
};
const formHtml = `<div class="form hide" id="form"><span class="ft hide" id="f0">${ICON.bar}存入资产</span><span class="fo hide" id="f1">×</span><span class="ft hide" id="f2">${ICON.cert}总份额</span><span class="fo hide" id="f3">÷</span><span class="ft hide" id="f4">${ICON.pile}总资产</span></div>`;
labels += wpin("formp", up(A.vault.top, 120), formHtml, "b");
// steps bar (L5–L14)
const steps = ["① 存 1 wei", "② 转入 1 万", "③ 受害者存 9999", "④ 赎回"];
const stepHtml = `<div id="steps" class="hide"><div class="sh">首存者攻击</div>${steps.map((s, i) => `<div class="sc" id="sc${i}">${s}</div>`).join("")}<div class="sx">示例数字</div></div>`;
// calc card (L10–L11)
const calcHtml = `<div id="calc" class="hide"><div class="cl1"><span id="k0" class="hide">9999 USDC</span><span id="k1" class="hide"> × 1</span><span id="k2" class="hide"> ÷ 略多于 1 万 USDC</span></div>
  <div class="cl2 hide" id="k3">≈ 0.9999 份 <b>&lt; 1</b> <span class="arr">→ 向下取整 →</span> <b class="z">0</b></div></div>`;
// condition card (L17–L18)
const condHtml = `<div id="cond" class="hide"><div class="ch">成立条件</div>
  <div class="cbar"><div class="cred"></div><div class="mk" id="mk"></div></div>
  <div class="cticks"><span>几乎为空</span><span>很大</span></div><div class="cnote">金库规模</div>
  <div class="cline hide" id="cl0">金库必须几乎是空的</div><div class="cline hide" id="cl1">规模越大 → 攻击成本越高</div></div>`;
// PIP insets
const pip1 = `<div class="pip hide" id="pip1" data-layout-allow-overlap><div class="ph">deposit · 向下取整</div>${P1.svg}
  <div class="pl pl-cs" style="left:${f(pipPos(P1, P1.A.trayL)[0] - 40)}px;top:${f(pipPos(P1, P1.A.trayL)[1] + 6)}px">协议</div>
  <div class="pl pl-rs" style="left:${f(pipPos(P1, P1.A.trayR)[0] - 10)}px;top:${f(pipPos(P1, P1.A.trayR)[1] + 6)}px">调用者</div>
  <div class="pok hide" id="pok1">方向没错 ✓</div></div>`;
const pip2 = `<div class="pip hide" id="pip2" data-layout-allow-overlap><div class="ph">0.9999 份 · 向下取整</div>${P2.svg}
  <div class="pl pl-cs" style="left:${f(pipPos(P2, P2.A.trayL)[0] - 40)}px;top:${f(pipPos(P2, P2.A.trayL)[1] + 6)}px">协议</div>
  <div class="pl pl-rs" style="left:${f(pipPos(P2, P2.A.trayR)[0] - 10)}px;top:${f(pipPos(P2, P2.A.trayR)[1] + 6)}px">调用者</div>
  <div class="pok pno hide" id="pok2">整份不到 · 全切掉</div></div>`;

// L3: red dashed line from code row 2 → gold inside the vault (screen layer, cam = door)
const D_FROM = [700, 196];
const dB = dashCurve("dB", D_FROM, toScreen(CAMS.door, rt(A.gold, -30, 0)), { c1: [760, 330], c2: rt(toScreen(CAMS.door, A.gold), -160, -120) });
const screenLines = `<svg class="wsvg" style="left:0;top:0" width="1920" height="1080" overflow="visible">${dB.svg}</svg>`;

// ================================================================ times
const TM = {
  s0: L(0).start, dir0: w("方向", 0), safe0: w("金库", 0), no0: w("不一定", 0),
  s1: L(1).start, f1: w("份额公式", 1), dep1: w("存入资产", 1), mul1: w("乘以总份额", 1), div1: w("除以总资产", 1),
  s2: L(2).start, dn2: w("向下取整", 2), ok2: w("方向没错", 2),
  s3: L(3).start, ta3: w("总资产", 3), rd3: w("代币余额", 3),
  s4: L(4).start, any4: w("任何人", 4), tr4: w("直接转账", 4),
  s5: L(5).start, how5: w("攻击怎么走", 5), emp5: w("金库是空的", 5),
  s6: L(6).start, wei6: w("1 wei", 6), get6: w("拿到", 6),
  s7: L(7).start, nod7: w("不走存款函数", 7), tr7: w("直接往金库转入", 7), usd7: w("1 万 USDC", 7),
  s8: L(8).start, ts8: w("总份额只有", 8), ta8: w("总资产是", 8), p18: w("再加 1 个最小单位", 8),
  s9: L(9).start, v9: w("受害者", 9), d9: w("9999", 9),
  s10: L(10).start, a10: w("9999", 10), m10: w("乘以 1", 10), d10: w("除以略多于", 10),
  s11: L(11).start, lt11: w("小于 1", 11), dn11: w("向下取整", 11), z11: w("是 0", 11),
  s12: L(12).start, in12: w("进了金库", 12), no12: w("一份也没拿到", 12),
  s13: L(13).start, rd13: w("赎回", 13), get13: w("取回", 13),
  s14: L(14).start, all14: w("全部资产", 14), gift14: w("等于捐给了它", 14),
  s15: L(15).start, fr15: w("抢跑", 15), first15: w("第一笔存款交易", 15),
  s16: L(16).start, cost16: w("捐赠额", 16), dep16: w("受害者的存款", 16), near16: w("接近捐赠额", 16), prof16: w("有利可图", 16),
  s17: L(17).start, cond17: w("成立条件", 17), emp17: w("几乎是空的", 17),
  s18: L(18).start, big18: w("规模越大", 18), cost18: w("攻击成本越高", 18),
  s19: L(19).start, pz19: w("披萨店", 19), c19: w("第一个顾客", 19), one19: w("只切成 1 块", 19),
  s20: L(20).start, put20: w("塞进", 20), h20: w("100 张", 20),
  s21: L(21).start, c21: w("下一个顾客", 21), p21: w("99 张的钱", 21), v21: w("值 101 张", 21), none21: w("一块也分不到", 21),
};

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #cardD { left: 56px; top: 30px; width: 1210px; }
    .qm { width: 96px; height: 96px; border-radius: 50%; background: #ffffff; border: 4px solid #2aa3c9; color: #17809f; font-size: 64px; font-weight: 900;
      display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 18px rgba(70,60,40,0.14); }
    .form { display: flex; align-items: center; gap: 12px; background: #fffdf8; border-radius: 16px; padding: 10px 20px; box-shadow: 0 10px 24px rgba(70,60,40,0.14); white-space: nowrap; }
    .form .ft { display: inline-flex; align-items: center; gap: 8px; font-size: 32px; font-weight: 800; }
    .form .fo { font-size: 44px; font-weight: 900; color: #1d93ba; }
    #steps { position: absolute; left: 56px; top: 30px; display: flex; align-items: center; gap: 12px; }
    #steps .sh { font-size: 40px; font-weight: 900; margin-right: 6px; white-space: nowrap; }
    #steps .sc { font-size: 28px; font-weight: 800; padding: 4px 14px 6px; border-radius: 10px; background: #ffffff; border: 3px solid #d3ccbf; color: #8a8478; white-space: nowrap; }
    #steps .sx { font-size: 28px; font-weight: 700; padding: 4px 14px 6px; border-radius: 10px; background: #ffffff; border: 3px solid #cfc7b8; color: #6d685e; white-space: nowrap; margin-left: 10px; }
    #calc { position: absolute; left: 56px; top: 112px; background: #fffdf8; border-radius: 18px; padding: 16px 30px 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); border-left: 8px solid #1c1c1c; }
    #calc .cl1 { font-size: 44px; font-weight: 900; white-space: nowrap; font-variant-numeric: tabular-nums; }
    #calc .cl2 { margin-top: 8px; font-size: 40px; font-weight: 800; white-space: nowrap; }
    #calc .cl2 b { color: #c3352b; } #calc .cl2 .arr { color: #6d685e; font-size: 34px; } #calc .cl2 .z { font-size: 56px; }
    #cond { position: absolute; left: 56px; top: 200px; width: 600px; background: #fffdf8; border-radius: 18px; padding: 18px 28px 22px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    #cond .ch { font-size: 40px; font-weight: 900; }
    #cond .cbar { position: relative; margin-top: 30px; height: 26px; border-radius: 13px; background: linear-gradient(90deg, #e0453a 0%, #e0453a 18%, #d9d3c7 34%, #d9d3c7 100%); }
    #cond .mk { position: absolute; left: 20px; top: -16px; width: 22px; height: 58px; border-radius: 6px; background: #1c1c1c; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
    #cond .cticks { display: flex; justify-content: space-between; margin-top: 12px; font-size: 30px; font-weight: 800; }
    #cond .cticks span:first-child { color: #c3352b; }
    #cond .cnote { font-size: 28px; font-weight: 700; color: #6d685e; text-align: center; margin-top: -40px; }
    #cond .cline { margin-top: 18px; font-size: 32px; font-weight: 800; white-space: nowrap; }
    .pip { position: absolute; left: 1324px; top: 470px; width: 540px; height: 430px; background: #f6f2ea; border-radius: 20px; overflow: hidden;
      box-shadow: 0 16px 34px rgba(70,60,40,0.18); border: 4px solid #ffffff; }
    .pip .ph { position: absolute; left: 0; top: 0; right: 0; height: 60px; background: #1c1c1c; color: #fff; font-size: 30px; font-weight: 800; padding: 9px 22px; white-space: nowrap; font-family: "Noto Sans SC", sans-serif; }
    .pip .pipsvg { position: absolute; left: 0; top: 60px; }
    .pip .pl { position: absolute; font-size: 28px; font-weight: 800; padding: 1px 12px 3px; border-radius: 8px; white-space: nowrap; }
    .pip .pl-cs { background: #1d93ba; color: #fff; } .pip .pl-rs { background: #e0453a; color: #fff; }
    .pip .pok { position: absolute; right: 18px; top: 76px; font-size: 30px; font-weight: 900; color: #fff; background: #1f9d55; border-radius: 10px; padding: 2px 14px 4px; white-space: nowrap; }
    .pip .pno { background: #e0453a; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        ${worldLines}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      ${screenLines}
      ${codeHtml}${stepHtml}${calcHtml}${condHtml}${pip1}${pip2}
      ${pills(4, { sections: SCRIPT.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">④ 金库通胀</div><div class="t-sub">ERC-4626 首存者攻击 · 四步</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const K = window.KITX06, K1 = window.KITX01;
      const $ = (id) => document.getElementById(id);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const op = (sel, t, to, d) => tl.to(sel, { opacity: to, duration: d == null ? 0.3 : d, ease: "power1.inOut" }, t);
      const out = (sel, t, d) => op(sel, t, 0, d || 0.2);
      const hideG = (id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); };
      const chip = (i, t, on) => tl.to("#sc" + i, on ? { backgroundColor: "#e0453a", borderColor: "#e0453a", color: "#ffffff", duration: 0.25 } : { backgroundColor: "#ffffff", borderColor: "#e0453a", color: "#c3352b", duration: 0.25 }, t);
      const rowOn = (i, t) => { tl.fromTo("#cd" + i, { backgroundColor: "rgba(253,234,231,0)" }, { backgroundColor: "rgba(253,234,231,1)", duration: 0.3, immediateRender: false }, t); tl.fromTo("#cb" + i, { scaleY: 0 }, { scaleY: 1, duration: 0.3, immediateRender: false }, t); };
      const rowOff = (i, t) => { tl.to("#cd" + i, { backgroundColor: "rgba(253,234,231,0)", duration: 0.25 }, t); tl.to("#cb" + i, { scaleY: 0, duration: 0.25 }, t); };
      KIT.camSet(tl, CAMS.rc);
      ["atk", "vic", "p-don", "p-vic", "p-outA", "p-outB", "bal", "p-need", "pz", "pz-100", "c1", "c2", "coins", "ac"].forEach(hideG);
      tl.set("#cb0, #cb1", { scaleY: 0, transformOrigin: "50% 100%" }, 0);
      tl.set("#cardD", { x: -1400 }, 0); tl.set("#cardD", { opacity: 0 }, 0); tl.set("#cardD", { opacity: 1 }, ${f(TM.s1 - 0.05)});

      // ===== 0–1.6 title card → into the pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.4, ease: "power3.in", immediateRender: false }, 1.4);

      // ===== L0 direction is right — is the vault safe?
      K.feed(tl, "rc", ${f(TM.s0 - 0.2)}, 0.6);
      K.lever(tl, "rc", ${f(TM.dir0 - 0.2)}, "down");
      pop("#lb-dir", ${f(TM.dir0 + 0.2)});
      K.cut(tl, "rc", ${f(TM.dir0 + 0.5)}, "L");
      pop("#lb-rem", ${f(TM.dir0 + 1.2)});
      pop("#qmi", ${f(TM.safe0 - 0.2)});
      tl.to("#qm-pin", { x: 900, y: -60, duration: 1.2, ease: "power2.in" }, ${f(TM.safe0 + 0.5)});
      out("#qmi", ${f(TM.safe0 + 1.4)}, 0.25);
      KIT.cam(tl, ${f(TM.safe0 + 0.4)}, CAMS.form, 1.3);
      out("#lb-dir, #lb-rem", ${f(TM.safe0 + 0.4)});
      pop("#lb-safe", ${f(TM.no0 - 0.4)});
      KIT.swap(tl, "#lb-safe", "#lb-no", ${f(TM.no0 + 0.1)}, 0.25);

      // ===== L1 the share formula
      tl.to("#cardD", { x: 0, duration: 0.6, ease: "power3.out" }, ${f(TM.s1)});
      rowOn(0, ${f(TM.f1)});
      KIT.swap(tl, "#lb-no", "#lb-4626", ${f(TM.s1)}, 0.25);
      out("#lb-4626", ${f(TM.dep1 - 0.4)});
      pop("#form", ${f(TM.dep1 - 0.3)});
      pop("#f0", ${f(TM.dep1)}); pop("#f1", ${f(TM.mul1)}); pop("#f2", ${f(TM.mul1 + 0.3)}); pop("#f3", ${f(TM.div1)}); pop("#f4", ${f(TM.div1 + 0.3)});

      // ===== L2 rounding down: right direction (PIP)
      pop("#pip1", ${f(TM.s2)}, 0.35);
      K.feed(tl, "pc1", ${f(TM.s2 + 0.3)}, 0.5);
      K.cut(tl, "pc1", ${f(TM.dn2 + 0.3)}, "L");
      pop("#pok1", ${f(TM.ok2)});

      // ===== L3 totalAssets reads the balance
      out("#pip1, #form", ${f(TM.s3)}, 0.25);
      KIT.cam(tl, ${f(TM.s3)}, CAMS.door, 1.0);
      rowOff(0, ${f(TM.ta3)}); rowOn(1, ${f(TM.ta3)});
      KIT.door(tl, "vault", ${f(TM.ta3)}, 105, 1.0);
      op("#g-demo", ${f(TM.ta3 + 0.5)}, 1, 0.3);
      KIT.draw(tl, "dB", ${f(TM.rd3 - 0.2)}, 0.6);
      pop("#lb-bal", ${f(TM.rd3 + 0.3)});

      // ===== L4 anyone can raise it by a direct transfer
      out("#lb-bal, #dB", ${f(TM.s4)});
      tl.fromTo("#slotHi", { opacity: 0 }, { opacity: 1, duration: 0.3, yoyo: true, repeat: 5, immediateRender: false }, ${f(TM.any4 - 0.2)});
      pop("#lb-slot", ${f(TM.any4 + 0.3)});

      // ===== L5 the attack: empty vault
      tl.to("#cardD", { x: -1400, duration: 0.45, ease: "power3.in" }, ${f(TM.s5 - 0.1)}); out("#cardD", ${f(TM.s5 + 0.4)}, 0.05);
      rowOff(1, ${f(TM.s5)});
      out("#lb-slot", ${f(TM.s5)});
      KIT.cam(tl, ${f(TM.s5)}, CAMS.atk, 1.2);
      pop("#steps", ${f(TM.how5)});
      out("#g-demo", ${f(TM.emp5 - 0.2)}, 0.4);
      pop("#lb-ta0", ${f(TM.emp5)}); pop("#lb-ts0", ${f(TM.emp5 + 0.2)});

      // ===== L6 step 1: deposit 1 wei → 1 share
      chip(0, ${f(TM.s6)}, true);
      KIT.grow(tl, "atk", ${f(TM.s6 - 0.2)}, 0.45); pop("#lb-atk", ${f(TM.s6 + 0.2)});
      op("#crumb", ${f(TM.wei6 - 0.3)}, 1, 0.2); pop("#lb-wei", ${f(TM.wei6)});
      K.carry(tl, "crumb", ${f(TM.wei6 + 0.4)}, ${f(LY.DISP.u + 60 - CRUMB_O.u)}, ${f(LY.DISP.v + 50 - CRUMB_O.v)}, 20, 0.6, 40);
      out("#crumb", ${f(TM.wei6 + 1.0)}, 0.1);
      op("#g-wei", ${f(TM.wei6 + 1.1)}, 1, 0.2);
      KIT.swap(tl, "#lb-ta0", "#lb-ta1", ${f(TM.wei6 + 1.1)}, 0.2);
      K.tally(tl, "sd", ${f(TM.get6 - 0.5)}, 0.5, 0, 1);
      KIT.swap(tl, "#lb-ts0", "#lb-ts1", ${f(TM.get6 - 0.1)}, 0.2);
      K.issue(tl, "sd", ${f(TM.get6 - 0.2)}, 0);
      tl.set("#ac", { scaleY: 1 }, ${f(TM.get6 + 0.5)}); out("#sd-ticket-0", ${f(TM.get6 + 0.5)}, 0.05);
      K.carry(tl, "ac", ${f(TM.get6 + 0.6)}, ${f(ATK_HAND.du)}, ${f(ATK_HAND.dv)}, ${f(ATK_HAND.dz)}, 0.7, 60);
      out("#lb-wei", ${f(TM.get6 + 0.6)});
      pop("#lb-1s", ${f(TM.get6 + 0.9)});

      // ===== L7 step 2: transfer 10k USDC directly
      chip(0, ${f(TM.s7)}, false); chip(1, ${f(TM.s7)}, true);
      out("#lb-1s", ${f(TM.s7 + 0.8)});
      KIT.grow(tl, "p-don", ${f(TM.s7 + 0.1)}, 0.5); pop("#lb-1w", ${f(TM.s7 + 0.5)});
      pop("#bx-depi", ${f(TM.nod7)}); pop("#lb-nodep", ${f(TM.nod7 + 0.2)});
      tl.fromTo("#slotHi", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, ${f(TM.tr7)});
      out("#lb-1w", ${f(TM.tr7 + 0.2)});
      K.carry(tl, "p-don", ${f(TM.tr7 + 0.3)}, ${f(VO.u - LY.ATK_PILE.u)}, ${f(VO.v - LY.ATK_PILE.v)}, ${SAFE.top + 30}, 1.0, 120);
      tl.to("#p-don", { scale: 0.2, opacity: 0, svgOrigin: "${f(at(VO, 0, 0, SAFE.top)[0])} ${f(at(VO, 0, 0, SAFE.top)[1])}", duration: 0.35, ease: "power2.in" }, ${f(TM.tr7 + 1.3)});
      op("#g-don", ${f(TM.tr7 + 1.45)}, 1, 0.35);
      KIT.swap(tl, "#lb-ta1", "#lb-ta2", ${f(TM.usd7)}, 0.25);
      out("#slotHi, #bx-depi, #lb-nodep", ${f(L(7).end - 0.3)});

      // ===== L8 totalSupply 1, totalAssets 10k + 1
      tl.fromTo("#lb-ts1-pin .lab", { scale: 1 }, { scale: 1.18, duration: 0.25, yoyo: true, repeat: 1, immediateRender: false }, ${f(TM.ts8)});
      tl.fromTo("#lb-ta2-pin .lab", { scale: 1 }, { scale: 1.12, duration: 0.25, yoyo: true, repeat: 1, immediateRender: false }, ${f(TM.ta8)});
      pop("#lb-all", ${f(TM.p18 + 0.4)});

      // ===== L9 step 3: victim deposits 9999
      chip(1, ${f(TM.s9)}, false); chip(2, ${f(TM.s9)}, true);
      out("#lb-all", ${f(TM.s9)});
      KIT.cam(tl, ${f(TM.s9)}, CAMS.vic, 1.0);
      KIT.grow(tl, "vic", ${f(TM.v9 - 0.1)}, 0.45); pop("#lb-vic", ${f(TM.v9 + 0.3)});
      KIT.grow(tl, "p-vic", ${f(TM.d9 - 0.3)}, 0.45); pop("#lb-9999", ${f(TM.d9)});

      // ===== L10 the share calculation
      pop("#calc", ${f(TM.s10)});
      pop("#k0", ${f(TM.a10)}); pop("#k1", ${f(TM.m10)}); pop("#k2", ${f(TM.d10)});

      // ===== L11 < 1 → rounds down to 0 (PIP)
      pop("#k3", ${f(TM.lt11)});
      pop("#pip2", ${f(TM.s11 - 0.3)}, 0.3);
      tl.set("#pc2-stock", { opacity: 0 }, 0);
      K.feed(tl, "pc2", ${f(TM.s11)}, 0.4);
      K.cut(tl, "pc2", ${f(TM.dn11)}, "L");
      pop("#pok2", ${f(TM.dn11 + 0.6)});
      KIT.led(tl, "sd-led", ${f(TM.z11)}, "red");
      pop("#lb-0s", ${f(TM.z11)});

      // ===== L12 victim's assets go in, no share (key frame)
      out("#pip2", ${f(TM.s12 + 0.5)}, 0.25);
      out("#lb-9999", ${f(TM.s12)});
      K.carry(tl, "p-vic", ${f(TM.s12 + 0.1)}, ${f(VO.u - LY.VIC_PILE.u)}, ${f(VO.v + 150 - LY.VIC_PILE.v)}, 60, 0.9, 40);
      tl.to("#p-vic", { opacity: 0, duration: 0.25 }, ${f(TM.s12 + 0.95)});
      op("#g-vic", ${f(TM.s12 + 1.0)}, 1, 0.35);
      KIT.swap(tl, "#lb-ta2", "#lb-ta3", ${f(TM.in12)}, 0.25);
      KIT.swap(tl, "#lb-ts1", "#lb-ts1b", ${f(TM.in12 + 0.2)}, 0.25);
      pop("#bx-vici", ${f(TM.no12)}); pop("#lb-empty", ${f(TM.no12 + 0.2)});

      // ===== L13 step 4: redeem the 1 share → ≈ 19999 USDC
      chip(2, ${f(TM.s13)}, false); chip(3, ${f(TM.s13)}, true);
      out("#calc, #lb-0s", ${f(TM.s13)});
      KIT.led(tl, "sd-led", ${f(TM.s13)}, "off");
      KIT.cam(tl, ${f(TM.s13)}, CAMS.out, 1.0);
      K.carry(tl, "ac", ${f(TM.rd13 - 0.1)}, 0, 0, 0, 0.7, 60);
      out("#ac", ${f(TM.rd13 + 0.65)}, 0.15);
      K.tally(tl, "sd", ${f(TM.rd13 + 0.6)}, 0.5, 1, 0);
      KIT.swap(tl, "#lb-ts1b", "#lb-ts0b", ${f(TM.rd13 + 0.7)}, 0.2);
      out("#g-don, #g-vic, #g-wei", ${f(TM.get13 - 0.3)}, 0.4);
      KIT.swap(tl, "#lb-ta3", "#lb-ta4", ${f(TM.get13)}, 0.25);
      KIT.grow(tl, "p-outA", ${f(TM.get13 - 0.1)}, 0.45); KIT.grow(tl, "p-outB", ${f(TM.get13 + 0.15)}, 0.45);
      pop("#lb-19999", ${f(TM.get13 + 0.6)});

      // ===== L14 that 1 share = all; victim's deposit gifted to it
      chip(3, ${f(TM.s14)}, false);
      out("#lb-19999, #lb-empty, #lb-ts0b, #lb-ta4", ${f(TM.gift14 - 0.6)});
      pop("#lb-own", ${f(TM.all14)}); pop("#lb-vdep", ${f(TM.all14 + 0.3)});
      KIT.draw(tl, "dGift", ${f(TM.gift14 - 0.4)}, 0.7);
      pop("#lb-gift", ${f(TM.gift14)});

      // ===== L15 front-running
      out("#lb-own, #lb-vdep, #lb-gift, #dGift, #bx-vici, #lb-ta4, #lb-ts0b, #lb-atk, #lb-vic, #steps", ${f(TM.s15 - 0.1)});
      out("#p-outA, #p-outB", ${f(TM.s15 - 0.1)}, 0.3);
      KIT.door(tl, "vault", ${f(TM.s15 - 0.1)}, 0, 0.8);
      KIT.cam(tl, ${f(TM.s15 - 0.1)}, CAMS.lane, 1.0);
      op("#lane", ${f(TM.s15 + 0.2)}, 1, 0.3);
      op("#lvw", ${f(TM.s15 + 0.4)}, 1, 0.3); pop("#lb-lv", ${f(TM.s15 + 0.6)}); pop("#lb-lane", ${f(TM.s15 + 0.6)});
      op("#law", ${f(TM.fr15 - 0.5)}, 1, 0.2);
      K1.walk(tl, "la", ${f(TM.fr15 - 0.3)}, 0.6, [${JSON.stringify(LANE_PTS.aMid)}]);
      K1.walk(tl, "lv", ${f(TM.fr15 + 0.1)}, 0.6, [${JSON.stringify(LANE_PTS.vBack)}]);
      K1.walk(tl, "la", ${f(TM.fr15 + 0.3)}, 0.6, [${JSON.stringify(LANE_PTS.aHead)}]);
      out("#lb-lv", ${f(TM.fr15 - 0.3)}, 0.15);
      pop("#lb-la", ${f(TM.fr15 + 0.9)}); pop("#lb-lv2", ${f(TM.fr15 + 0.8)});
      pop("#lb-fr", ${f(TM.first15)});

      // ===== L16 cost = donation; profitable when the deposit is close to it
      out("#lb-fr, #lb-lane, #lb-la, #lb-lv2, #lane, #lvw, #law", ${f(TM.s16 - 0.1)});
      KIT.cam(tl, ${f(TM.s16 - 0.1)}, CAMS.bal, 1.0);
      KIT.grow(tl, "bal", ${f(TM.s16 + 0.2)}, 0.5);
      out("#vic", ${f(TM.s16 - 0.1)}, 0.3);
      pop("#lb-panL", ${f(TM.cost16)});
      pop("#lb-panR", ${f(TM.dep16)});
      K1.tilt(tl, "bal", ${f(TM.near16 - 0.2)}, 2, 1.0);
      pop("#lb-prof", ${f(TM.prof16)});
      pop("#lb-atk", ${f(TM.prof16 - 0.2)});

      // ===== L17 condition: the vault must be nearly empty
      out("#lb-panL, #lb-panR, #lb-prof", ${f(TM.s17 - 0.1)});
      KIT.cam(tl, ${f(TM.s17 - 0.1)}, CAMS.cond, 1.0);
      out("#bal", ${f(TM.s17 + 0.2)}, 0.3);
      pop("#cond", ${f(TM.cond17)});
      pop("#cl0", ${f(TM.emp17)});

      // ===== L18 bigger vault → higher cost
      tl.to("#mk", { x: 520, duration: 1.6, ease: "power2.inOut" }, ${f(TM.big18 - 0.2)});
      KIT.grow(tl, "p-need", ${f(TM.big18)}, 1.8);
      pop("#lb-need", ${f(TM.big18 + 0.4)});
      pop("#cl1", ${f(TM.cost18)});

      // ===== L19 metaphor: one customer buys the whole pizza, one slice
      out("#cond, #lb-need, #lb-atk", ${f(TM.s19 + 0.4)});
      out("#atk, #ac", ${f(TM.s19 + 0.2)}, 0.4);
      out("#p-need", ${f(TM.s19 - 0.1)}, 0.4);
      KIT.cam(tl, ${f(TM.s19 - 0.1)}, CAMS.pz, 1.2);
      KIT.grow(tl, "pz", ${f(TM.pz19 - 0.2)}, 0.5); pop("#lb-meta", ${f(TM.pz19)});
      KIT.grow(tl, "c1", ${f(TM.c19 - 0.2)}, 0.45); pop("#lb-c1", ${f(TM.c19 + 0.2)});
      pop("#lb-1blk", ${f(TM.one19)});

      // ===== L20 sneaks in 100 pizzas
      out("#lb-1blk", ${f(TM.put20 - 0.2)});
      KIT.grow(tl, "pz-100", ${f(TM.put20)}, 1.2);
      pop("#lb-100", ${f(TM.h20)});

      // ===== L21 next customer pays for 99, gets nothing; compare with the vault
      out("#lb-100", ${f(TM.s21)});
      KIT.cam(tl, ${f(TM.s21)}, CAMS.cmp, 1.2);
      KIT.grow(tl, "c2", ${f(TM.c21 - 0.1)}, 0.45); pop("#lb-c2", ${f(TM.c21 + 0.3)});
      KIT.grow(tl, "coins", ${f(TM.p21 - 0.2)}, 0.4); pop("#lb-99", ${f(TM.p21 + 0.1)});
      pop("#lb-101", ${f(TM.v21)});
      pop("#lb-none", ${f(TM.none21 + 0.2)});
      pop("#lb-cmpv", ${f(TM.none21 + 0.6)});
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL, "aligned:", LY.ALIGNED);
