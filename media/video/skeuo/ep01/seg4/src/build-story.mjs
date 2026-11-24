// Generates compositions/story.html for ep01/seg4「④ 损失往哪走」(one isometric world, one camera).
// Run: node src/build-story.mjs
import fs from "node:fs";
import { at, Wp, f, U, camAt, gridSvg, worldSvg, wlab, wpin, dashCurve, kitCss, runtimeJs, pts } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { vending, bridge, letter, signBoard, runtimeExtJs } from "../../kit-ext/objects-ext.mjs";
import { GALLERY } from "../../seg1/src/layout.mjs";
import * as S3 from "../../seg3/src/layout.mjs";
import { platform, pillar, board, dotList, wrench, manualBook, coinSplit, spotlight, groundRing, ghostSpot, scaled, scalePt } from "./props.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const L = (i) => lineAt(T, i);
const w = (term, line, o = {}) => wordAt(T, term, { line, ...o }).start;

// ================================================================ world layout (u, v) — see SPEC.md
const YR = { 2016: 0, 2017: 220, 2018: 300, 2019: 380, 2020: 460, 2021: 540, 2022: 760, 2023: 1000, 2024: 1180, 2025: 1500, 2026: 2350 };
const BV = -60;                                                 // board / pillar row
const B = { dao: 120, ron: 880, dmm: 1300, byb: 1620, bal: 1980, bn: 2470, cmp: 2670 };
const P = {
  book: { u: 120, v: 320 }, wr: { u: -110, v: 330 },
  bridge: { u: 820, v: 600 }, key: { u: 590, v: 540 },
  desk: { u: 1400, v: 430 }, env: { u: 1150, v: 490 },
  safe: { u: 1760, v: 380 }, coin: { u: 2090, v: 300 }, hot: { u: 2560, v: 380 },
};
// local → episode world: world = local + (DU, DV)  (seg1 GALLERY: u −1000…1500, v 1380…1620)
export const DU = GALLERY.u0 + 150, DV = (GALLERY.v0 + GALLERY.v1) / 2;
const LOC = (o) => ({ u: o.u - DU, v: o.v - DV });
const VG = { vm: { u: -1300, v: -330 }, mg: { u: -1500, v: -290 }, icons: [-1000, -800, -600, -400, -200].map((u) => ({ u, v: -400 })) };
const PQ = ["① 控制流", "② 权限", "③ 数学", "④ 数据可信度", "⑤ 经济设计", "⑥ 系统与运营"].map((t, i) => ({ t, o: LOC(S3.PLATES[i]) }));
const o_ = (u, v = BV) => ({ u, v });

const back = [], mid = [], front = [], top = [];
const A = {};
const addTo = (arr, o, svg, dy = 0) => arr.push({ y: at(o)[1] + dy, svg });

// ---- plaques (from seg3)
const PLW = [340, 340, 340, 340, 340, 410];
PQ.forEach((p, i) => { const s = signBoard(p.o, { id: "pq" + i, style: "plate", text: p.t, w: PLW[i], h: i === 5 ? 92 : 80, size: 36, color: i === 5 ? "#1d93ba" : "#2aa3c9" }); A["pq" + i] = s.anchors; addTo(back, p.o, s.svg); });
// seg3's last picture (split boards + their objects), faded out once the camera leaves
const S3P = [
  [S3.BOARD_L, (o) => signBoard(o, { id: "s3bl", text: "链与基础设施", size: 44 })],
  [S3.BOARD_R, (o) => signBoard(o, { id: "s3br", text: "人、设备和流程", size: 44 })],
  [S3.L_RPC, (o) => O.rpc(o, { id: "s3rp" })], [S3.L_CHAIN, (o) => O.chain(o, { id: "s3ch", n: 2 })], [S3.L_LOCK, (o) => O.padlock(o, { id: "s3lk", key: false })],
  [S3.R_CALLER, (o) => O.person(o, { id: "s3pc", role: "signer" })], [S3.R_LAPTOP, (o) => O.laptop(o, { id: "s3lp" })], [S3.R_KEY, (o) => O.key(o, { id: "s3ky", stand: true })],
  [S3.AI_MAG, (o) => O.magnifier(o, { id: "s3mg", z: 120 })],
];
const S3PTS = [];
S3P.forEach(([w, fn]) => { const o = LOC(w), r = fn(o); S3PTS.push(r.anchors.top, at(o, 0, 0, 0)); addTo(back, o, `<g class="s3x">${r.svg}</g>`); });
// ---- audit vignette (behind the gallery)
const avm = vending(VG.vm, { id: "avm", scale: 0.8 }); A.avm = avm.anchors;
addTo(back, VG.vm, spotlight(VG.vm, { id: "spot", r: 190 }), -400);
addTo(back, VG.vm, avm.svg);
const amg = O.magnifier(VG.mg, { id: "amg", z: 130 }); A.amg = amg.anchors;
const ICON = [
  (o) => O.key(o, { id: "ic0", stand: true }),
  (o) => { const s = O.safe(o, { id: "ic1s", plate: "" }); return { svg: scaled("ic1", o, 0.45, s.svg), anchors: { top: scalePt(o, 0.45, s.anchors.top) } }; },
  (o) => { const s = O.browserWin(o, { id: "ic2s" }); return { svg: scaled("ic2", o, 0.42, s.svg), anchors: { top: scalePt(o, 0.42, s.anchors.top) } }; },
  (o) => O.person(o, { id: "ic3", role: "attacker", scale: 0.9 }),
  (o) => O.person(o, { id: "ic4", role: "engineer", scale: 0.9 }),
];
const icons = VG.icons.map((o, i) => { const r = ICON[i](o); addTo(back, o, r.svg); return r; });
addTo(back, VG.icons[0], groundRing({ u: 0, v: -400 }, { id: "ring", u0: -1100, u1: -90, v0: -110, v1: 110 }), -500);
back.push({ y: at(VG.mg)[1] + 1, svg: `<g id="amg-mv">${amg.svg}</g>` });

// ---- gallery platform, pillars, boards
const plat = platform({ u: 0, v: 0 }, { u0: -150, u1: 2800 });
for (const [yr, u] of Object.entries(YR)) {
  const small = yr >= 2017 && yr <= 2021;
  const pl = pillar(o_(u), { id: "pl" + yr, h: small ? 70 : 110, small }); A["pl" + yr] = pl; addTo(mid, o_(u), pl.svg);
}
const BD = {
  dao: board(o_(B.dao), { id: "bdao", rows: 1, dots: dotList(0.6) }),
  ron: board(o_(B.ron), { id: "bron", rows: 2, dots: dotList(6.2) }),
  dmm: board(o_(B.dmm), { id: "bdmm", rows: 1, dots: dotList(3.05) }),
  byb: board(o_(B.byb), { id: "bbyb", rows: 3, dots: dotList(15) }),
  bal: board(o_(B.bal), { id: "bbal", rows: 1, cols: 4, divider: 2, dots: [{ col: 0.5, row: 0, frac: 0.948 }, { col: 2, row: 0 }, { col: 3, row: 0, frac: 0.28 }] }),
  bn: board(o_(B.bn), { id: "bbn", rows: 13, dots: dotList(63.4) }),
  cmp: board(o_(B.cmp), { id: "bcmp", rows: 12, dots: dotList(60), groups: [[0, 3], [3, 6], [6, 9], [9, 12]], frame: "#9fd3e4" }),
};
for (const [k, b] of Object.entries(BD)) { addTo(mid, o_(B[k]), b.svg, 0.5); }

// ---- front props
const book = manualBook(P.book, { id: "book" }), wr = wrench(P.wr, { id: "wr" });
addTo(front, P.book, book.svg); addTo(front, P.wr, wr.svg);
const br = bridge(P.bridge, { id: "br", river: 120 }); A.br = br.anchors; addTo(front, P.bridge, br.svg);
const rk = O.key(P.key, { id: "rkey" });
front.push({ y: 1e5, svg: ghostSpot(P.key, { id: "rkey-ghost", ru: 80, rv: 44 }) + `<g id="rkey-mv" style="opacity:0">${rk.svg}</g>` });
const dsk = O.desk(P.desk, { id: "dsk", screen2: `<rect x="0" y="0" width="148" height="88" fill="#fde6e3"/><rect x="0" y="0" width="148" height="16" fill="#e0453a"/><path d="M60 30L88 58M88 30L60 58" stroke="#e0453a" stroke-width="8" stroke-linecap="round"/>` });
A.dsk = dsk.anchors; addTo(front, P.desk, dsk.svg);
const env = letter(P.env, { id: "env", state: "attacker", w: 80, h: 52 }); A.env = env.anchors;
addTo(front, P.env, `<g id="env-w" opacity="0">${env.svg}</g>`);
const sf = O.safe(P.safe, { id: "bys", core: "attacker", plate: "COLD" });
addTo(front, P.safe, scaled("bysg", P.safe, 0.6, sf.svg)); A.bys = { top: scalePt(P.safe, 0.6, sf.anchors.top) };
const hw = O.hotWallet(P.hot, { id: "bnh" });
addTo(front, P.hot, scaled("bnhg", P.hot, 0.75, hw.svg)); A.bnh = { top: scalePt(P.hot, 0.75, hw.anchors.top) };
const coin = coinSplit(P.coin, { id: "coin" }); A.coin = coin; addTo(front, P.coin, coin.svg);

[back, mid, front].forEach((a) => a.sort((x, y) => x.y - y.y));

// ---- world curves
const bybTop = BD.byb.anchors.top, cmpTop = BD.cmp.anchors.top;
const cvCopy = dashCurve("cv-copy", [bybTop[0], bybTop[1] - 40], [cmpTop[0], cmpTop[1] - 30], { color: "#1d93ba", c1: [bybTop[0] + 200, bybTop[1] - 520], c2: [cmpTop[0] - 200, cmpTop[1] - 360] });
const TR0 = Wp(-100, -250, 540), TR1 = Wp(2150, -250, 540);
const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const cvTrend = dashCurve("cv-trend", TR0, TR1, { color: "#1d93ba", sw: 9, dash: "28 14", c1: lerp(TR0, TR1, 0.33), c2: lerp(TR0, TR1, 0.66) });
const ah = (() => { const d = [U[0], U[1]], n = [-d[1], d[0]], L0 = 44, W0 = 26; const tip = [TR1[0] + d[0] * 30, TR1[1] + d[1] * 30];
  const b = [tip[0] - d[0] * L0, tip[1] - d[1] * L0]; return `<polygon id="trend-ah" opacity="0" points="${pts([tip, [b[0] + n[0] * W0, b[1] + n[1] * W0], [b[0] - n[0] * W0, b[1] - n[1] * W0]])}" fill="#1d93ba"/>`; })();
// 4× line: top of the 12th row across both boards
const r12a = at(o_(B.bn), -BD.bn.w / 2 - 30, 6, 46 + 12 + 12 * 30), r12b = at(o_(B.cmp), BD.cmp.w / 2 + 30, 6, 46 + 12 + 12 * 30);
// Balancer: two label points above the board, with leader lines to each half
const BAL = o_(B.bal), balZ1 = BD.bal.z1;
const H1 = at(BAL, -BD.bal.w / 2 + 12 + 0.5 * 30 + 15, 6, balZ1 - 4), H2 = at(BAL, -BD.bal.w / 2 + 12 + 2.5 * 30 + 15, 6, balZ1 - 4);
const BL1 = at(BAL, -150, 6, balZ1 + 120), BL2 = at(BAL, 150, 6, balZ1 + 240);
const leaders = `<g id="bal-lead" opacity="0"><path d="M${pts([H1])}L${pts([BL1])}" stroke="#8d857a" stroke-width="3" stroke-dasharray="6 5"/><path d="M${pts([H2])}L${pts([BL2])}" stroke="#8d857a" stroke-width="3" stroke-dasharray="6 5"/></g>`;
const x4line = `<path id="x4line" opacity="0" d="M${pts([r12a])}L${pts([r12b])}" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 8"/>`;

const world = worldSvg("wsvg", gridSvg({ u0: -3000, u1: 4400, v0: -1800, v1: 2000 }) + back.map((x) => x.svg).join("\n") + plat +
  mid.map((x) => x.svg).join("\n") + front.map((x) => x.svg).join("\n") + cvCopy.svg + x4line + leaders + cvTrend.svg + ah, [-3200, -2600, 8000, 5000]);

// ================================================================ labels (world, counter-scaled)
const cat = (id, n) => `<span class="cat" id="${id}">${n}</span>`;
let labels = "";
// year plates below the platform front edge
for (const yr of [2016, 2022, 2023, 2024, 2025, 2026]) labels += wlab("yr" + yr, A["pl" + yr].top, String(yr), "lab-g lab-sm hide");
labels += wlab("yr1721", A.pl2019.top, "2017–2021", "lab-g lab-sm hide");
// detailed event labels
const T_ = (k) => BD[k].anchors.top;
labels += wlab("lb-dao", T_("dao"), `${cat("c1-dao", "①")}2016 · The DAO · 约 6000 万美元`, "hide");
labels += wlab("lb-ron", T_("ron"), `${cat("c1-ron", "⑥")}2022 · Ronin 跨链桥 · 约 6.2 亿美元`, "hide");
labels += wlab("lb-dmm", T_("dmm"), `${cat("c1-dmm", "⑥")}2024 · DMM Bitcoin · 约 3.05 亿美元`, "hide");
labels += wlab("lb-byb", T_("byb"), `${cat("c1-byb", "⑥")}2025 · Bybit · 约 15 亿美元`, "hide");
labels += wlab("lb-bn", T_("bn"), `${cat("c1-bn", "⑥")}2026.10 · Binance 热钱包 · 约 63.4 亿美元<span class="srcchip" id="bn-src">Binance 初步报告</span>`, "hide");
labels += wlab("lb-bal", T_("bal"), `${cat("c1-bal", "③")}2025 · Balancer V2 · 舍入方向`, "hide");
// short labels for wide shots
const SHORT = { dao: ["①", "The DAO", 2016], ron: ["⑥", "Ronin", 2022], dmm: ["⑥", "DMM", 2024], byb: ["⑥", "Bybit", 2025], bal: ["③", "Balancer", 2025], bn: ["⑥", "Binance", 2026] };
for (const [k, [n, name, yr]] of Object.entries(SHORT)) { const p = k === "bal" ? at(o_(B.bal), 0, 6, BD.bal.z1 + 120) : T_(k);
  labels += wlab("ls-" + k, p, `${cat("c2-" + k, n)}${name}<span class="yr">${yr}</span>`, "lab-sm hide"); }
// 2016 extras
const D0 = o_(B.dao);
const ccard = (id, p, n, txt) => wpin(id, p, `<div class="ccard hide" id="${id}">${cat(id + "-n", n)}${txt}</div>`, "c");
labels += ccard("cc-re", at(D0, 180, -60, 160), "①", "重入");
labels += ccard("cc-ov", at(D0, 400, -60, 150), "③", "溢出");
labels += wlab("lb-book", [ (book.top[0] + wr.top[0]) / 2, Math.min(book.top[1], wr.top[1]) - 10], "编译器 · 库 成熟了", "lab-cs lab-sm hide");
// Ronin
labels += wlab("lb-rkey", at(P.key, 20, 0, 110), "验证者私钥", "lab-r hide");
// DMM
labels += wlab("lb-env", at(P.env, 0, 0, 120), "入口 · 假招聘", "lab-r lab-sm hide");
labels += wlab("lb-desk", at(P.desk, 100, -40, 230), "落点 · 供应商终端", "lab-r lab-sm hide", "l");
// Bybit
labels += wlab("lb-bys", [A.bys.top[0] + 10, A.bys.top[1] - 4], "前端与签名界面", "lab-r lab-sm hide");
// Binance / 4x
[0, 1, 2, 3].forEach((k) => { labels += wlab("lx" + k, BD.cmp.anchors.rowR(3 * k + 1.5), (k ? "" : "Bybit ") + "×" + (k + 1), "lab-cs lab-sm hide", "l"); });
labels += wlab("lb-x4", T_("bn"), "＞ 4 倍 · 按 Binance 口径", "lab-rs hide");
// trend banner
labels += wlab("lb-tr0", [TR0[0] + 40, TR0[1] - 18], "代码漏洞", "lab-cs hide");
labels += wlab("lb-tr1", [TR1[0] - 70, TR1[1] - 30], "跨链桥与运营安全", "lab-cs hide");
// audit vignette
const ICN = ["私钥", "多签", "前端", "社工", "内部人"];
icons.forEach((r, i) => { labels += wlab("li" + i, [r.anchors.top[0], r.anchors.top[1] - (i === 0 ? 10 : 0)], ICN[i], "lab-sm hide"); });
labels += wlab("lb-aud", A.amg.top, "代码审计", "hide");
labels += wlab("lb-noaud", at({ u: -600, v: -400 }, 0, 0, 330), "审计覆盖不到", "lab-rs hide");
// Balancer
labels += wlab("lb-math", at(o_(B.bal), 0, 0, 330), "③ 数学类 · 没有消失", "lab-cs hide");
labels += wlab("lb-cut", [coin.cutTop[0] + 10, coin.cutTop[1] - 6], "舍入方向出错", "lab-r lab-sm hide");
labels += wlab("lb-b1", BL1, "Balancer 官方复盘 · 约 9480 万美元", "lab-g hide");
labels += wlab("lb-b2", BL2, "早期报道 · 约 1.28 亿美元", "lab-g hide");
labels += wlab("lb-mature", BD.bal.anchors.right, "成熟协议也会出错", "lab-r hide", "l");

// ================================================================ cameras
const fit = (PS, { w = 1700, h = 640, cx = 960, cy = 470, kmax = 1.3, kmin = 0.2 } = {}) => {
  const xs = PS.map((p) => p[0]), ys = PS.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const k = Math.max(kmin, Math.min(w / (x1 - x0), h / (y1 - y0), kmax));
  return camAt([(x0 + x1) / 2, (y0 + y1) / 2], cx, cy, f(k));
};
const box3 = (u0, u1, v0, v1, z0, z1) => [Wp(u0, v0, z0), Wp(u1, v0, z0), Wp(u0, v1, z0), Wp(u1, v1, z0), Wp(u0, v0, z1), Wp(u1, v1, z1), Wp(u0, v1, z1), Wp(u1, v0, z1)];
const CAMS = {
  plaq: fit(S3PTS, { kmax: 1.25 }),
  wide0: fit(box3(-150, 2800, -150, 300, 0, 200), { h: 700 }),
  y2016: camAt(Wp(B.dao, BV, 90), 860, 450, 1.5),
  cmp: fit(box3(2300, 2800, -60, 120, 0, 520), { h: 640, cy: 500, kmax: 1.2 }),
  y2022: fit(box3(520, 1000, -60, 620, 0, 220), { h: 600 }),
  y2024: fit(box3(1100, 1560, -60, 520, 0, 260), { h: 560, kmax: 1.15 }),
  y2025: fit(box3(1520, 1900, -60, 440, 0, 220), { h: 520, kmax: 1.1 }),
  y2026: fit(box3(1500, 2800, -60, 420, 0, 560), { h: 620, cy: 500 }),
  wide: fit(box3(-150, 2800, -250, 300, 0, 540), { h: 720, cy: 500 }),
  vign: fit(box3(-1650, -100, -500, -250, 0, 380), { h: 600, cy: 470 }),
  bal: fit(box3(1760, 2200, -60, 330, 0, 420), { h: 600, cy: 545, kmax: 1.15 }),
};

// ================================================================ times
const TM = {
  kj: w("口径", 1), approx: w("约数", 1),
  y16: w("2016", 2), dao: w("The", 2), re: w("重入", 2), m6k: w("6000", 2),
  ov: w("溢出", 3), comp: w("编译器", 3), less: w("少了", 3),
  ron: w("Ronin", 4), r62: w("6.2", 4), rkey: w("验证者私钥", 4),
  dmm: w("DMM", 5), d305: w("3.05", 5), hire: w("假招聘", 5), vend: w("供应商", 5),
  byb: w("Bybit", 6), b15: w("15", 6), fe: w("前端", 6),
  bn: w("Binance", 7), hw: w("热钱包", 7), b634: w("63.4", 7), proj: w("项目方", 7),
  x4: w("4倍", 8), over: w("超过", 8),
  trend: w("趋势", 9), code: w("代码漏洞", 9), bridge: w("跨链桥", 9),
  pk: w("私钥", 10), ms: w("多签", 10), fe2: w("前端", 10), so: w("社工", 10), ins: w("内部人", 10), aud: w("代码审计", 10), noaud: w("覆盖不到", 10),
  math: w("数学类", 11), bal: w("Balancer", 11), round: w("舍入方向", 11),
  b9480: w("9480", 12), b128: w("1.28", 12), early: w("早期报道", 12), mature: w("成熟的协议", 12),
};
const LS = T.lines.map((l) => f(l.start));
const tm = Object.fromEntries(Object.entries(TM).map(([k, v]) => [k, f(v)]));
const DOTS = Object.fromEntries(Object.entries(BD).map(([k, b]) => [k, b.ids]));
const YEARS = Object.keys(YR);
const ENVW = [at(P.env), at({ u: 1290, v: 520 })];

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    .cat { display: inline-block; min-width: 34px; text-align: center; font-weight: 900; color: #ffffff; background: #1d93ba; border-radius: 8px; padding: 0 6px 2px; margin-right: 10px; }
    .srcchip { display: inline-block; margin-left: 12px; font-size: 26px; font-weight: 700; color: #6d685e; background: #f1ede5; border: 2px solid #cfc7b8; border-radius: 8px; padding: 0 10px 2px; opacity: 0; }
    .yr { margin-left: 10px; font-weight: 700; color: #8a8478; }
    .ccard { white-space: nowrap; font-family: "JetBrains Mono", "Noto Sans SC", monospace; font-size: 34px; font-weight: 800; background: #ffffff; border-radius: 12px;
      border-left: 10px solid #e0453a; padding: 6px 20px 8px 14px; box-shadow: 0 8px 18px rgba(70,60,40,0.14); }
    #src { position: absolute; right: 48px; bottom: 192px; }
    #leg { position: absolute; right: 48px; bottom: 252px; }
    #leg .lgd { width: 24px; height: 24px; border-radius: 50%; background: #e0453a; display: inline-block; }
    #ttl-card { min-height: 0; padding: 56px 40px 50px; }
    .tcard { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
      padding: 14px 26px 18px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
    .tcard .t1 { font-size: 32px; font-weight: 900; white-space: nowrap; }
    .tcard .t2 { margin-top: 6px; font-size: 29px; font-weight: 700; color: #3d3a35; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div class="lab lab-sm hide" id="leg"><i class="lgd"></i>= 1 亿美元</div>
      <div class="lab lab-g lab-sm hide" id="src">公开报道 + 安全公司年度统计 · 事发时美元估值 · 约数</div>
      <div class="tcard hide" id="term1" style="top:300px"><div class="t1">验证者</div><div class="t2">替跨链桥确认交易、签名放行的节点</div></div>
      <div class="tcard hide" id="term2" style="top:300px"><div class="t1">热钱包</div><div class="t2">日常提币用的钱包 · 余额有上限</div></div>
      ${pills(4, { sections: SCRIPT.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">④ 损失往哪走</div><div class="t-sub">损失的规模与趋势</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const TM = ${JSON.stringify(tm)};
      const LS = ${JSON.stringify(LS)};
      const DOTS = ${JSON.stringify(DOTS)};
      const YEARS = ${JSON.stringify(YEARS)};
      const ENVW = ${JSON.stringify(ENVW)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const hideObj = (id) => tl.set("#" + id, { scaleY: 0, svgOrigin: $(id).getAttribute("data-ox") + " " + $(id).getAttribute("data-oy") }, 0);
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      const fill = (ids, t, dur) => { const n = ids.length, st = n > 1 ? dur / (n - 1) : 0;
        ids.forEach((id, i) => tl.fromTo("#" + id, { opacity: 0, attr: { r: 3 } }, { opacity: 1, attr: { r: 12 }, duration: 0.22, ease: "back.out(2)", immediateRender: false }, t + i * st)); };
      const pulse = (sel, t) => { tl.to(sel, { scale: 1.35, duration: 0.14, ease: "power2.out", transformOrigin: "50% 50%" }, t); tl.to(sel, { scale: 1, duration: 0.22, ease: "power2.in" }, t + 0.14); };

      // ---- initial state
      YEARS.forEach((y) => hideObj("pl" + y));
      ["bdao", "bron", "bdmm", "bbyb", "bbal", "bbn", "bcmp", "book", "wr", "br", "dsk", "bysg", "bnhg", "coin", "avm", "ic0", "ic1", "ic2", "ic3", "ic4", "amg"].forEach(hideObj);
      KIT.camSet(tl, CAMS.plaq);

      // ===== 0–1.6 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.25);
      // ===== L0 pan from the six plaques to the loss gallery; year pillars rise
      KIT.cam(tl, 1.55, CAMS.wide0, 2.6);
      tl.to(".s3x", { opacity: 0, duration: 0.6 }, 2.6);
      YEARS.forEach((y, i) => grow("pl" + y, 2.7 + i * 0.16, 0.45));
      ["2016", "1721", "2022", "2023", "2024", "2025", "2026"].forEach((y, i) => KIT.pop(tl, "#yr" + y, 3.0 + i * 0.2));
      // ===== L1 the basis for every number
      KIT.pop(tl, "#src", TM.kj + 0.1, 0.3);
      KIT.pop(tl, "#leg", TM.approx - 3.2, 0.3);
      KIT.cam(tl, LS[1] + 5.6, CAMS.y2016, 2.2);
      out("#yr2016, #yr1721, #yr2022, #yr2023, #yr2024, #yr2025, #yr2026", LS[2] - 0.3, 0.25);
      // ===== L2 2016 The DAO: 0.6 dot
      grow("bdao", TM.y16 - 0.1, 0.5);
      KIT.pop(tl, "#cc-re", TM.re, 0.3);
      fill(DOTS.dao, TM.m6k, 0);
      KIT.pop(tl, "#lb-dao", TM.m6k + 0.1);
      // ===== L3 code bugs; compilers and libraries matured
      KIT.pop(tl, "#cc-ov", TM.ov, 0.3);
      grow("book", TM.comp - 0.1, 0.45); grow("wr", TM.comp + 0.25, 0.45);
      KIT.pop(tl, "#lb-book", TM.comp + 0.5);
      tl.to("#cc-re, #cc-ov", { opacity: 0.28, duration: 0.6, ease: "power1.inOut" }, TM.less - 0.4);
      // ===== L4 2022 Ronin bridge: validator keys
      out("#lb-book, #lb-dao", LS[4] - 0.2);
      out("#cc-re, #cc-ov", LS[4] - 0.2);
      KIT.cam(tl, LS[4] - 0.2, CAMS.y2022, 1.3);
      grow("br", LS[4] + 0.2, 0.6);
      fadeIn("#rkey-mv", LS[4] + 0.6, 0.3);
      grow("bron", TM.ron - 0.1, 0.5);
      KIT.pop(tl, "#lb-ron", TM.ron + 0.3);
      fill(DOTS.ron, TM.r62 - 0.3, 0.8);
      KIT.pop(tl, "#lb-rkey", TM.rkey - 0.6);
      const term = (id, t0, t1) => { KIT.pop(tl, "#" + id, t0, 0.3); out("#" + id, t1, 0.25); };
      term("term1", TM.rkey, TM.rkey + 2.8);
      tl.set("#rkey-ghost", { opacity: 1 }, TM.rkey + 0.2);
      tl.to("#rkey-mv", { x: 260, y: -260, opacity: 0, duration: 0.8, ease: "power2.in" }, TM.rkey + 0.2);
      KIT.broke(tl, "br-booth", TM.rkey + 0.5);
      // ===== L5 2024 DMM Bitcoin: fake hiring → vendor terminal
      out("#lb-rkey, #lb-ron", LS[5] - 0.2);
      KIT.cam(tl, LS[5] - 0.2, CAMS.y2024, 1.2);
      grow("dsk", LS[5] + 0.2, 0.5);
      grow("bdmm", TM.dmm - 0.1, 0.5);
      KIT.pop(tl, "#lb-dmm", TM.dmm + 0.3);
      fill(DOTS.dmm, TM.d305 - 0.2, 0.5);
      fadeIn("#env-w", TM.hire - 0.3, 0.25);
      KIT.pop(tl, "#lb-env", TM.hire);
      KITX.walk(tl, "env", TM.hire + 0.4, 0.9, ENVW, "power2.inOut");
      out("#lb-env", TM.vend - 0.3);
      tl.to("#env-w", { opacity: 0, duration: 0.2 }, TM.vend - 0.15);
      KIT.swap(tl, "#dsk-scr", "#dsk-scr2", TM.vend - 0.1, 0.25);
      KIT.pop(tl, "#lb-desk", TM.vend);
      // ===== L6 2025 Bybit: front end and signing UI
      out("#lb-desk, #lb-dmm", LS[6] - 0.2);
      KIT.cam(tl, LS[6] - 0.2, CAMS.y2025, 1.2);
      grow("bysg", LS[6] + 0.3, 0.5);
      grow("bbyb", TM.byb - 0.1, 0.5);
      KIT.pop(tl, "#lb-byb", TM.byb + 0.3);
      fill(DOTS.byb, TM.b15 - 0.2, 0.8);
      KIT.door(tl, "bys", TM.fe - 0.7, 105, 0.9);
      KIT.pop(tl, "#lb-bys", TM.fe);
      // ===== L7 2026 Binance hot wallet: 63.4 dots, towering
      out("#lb-bys", LS[7] - 0.2);
      KIT.cam(tl, LS[7] - 0.2, CAMS.y2026, 1.3);
      grow("bnhg", LS[7] + 0.5, 0.5);
      grow("bbn", TM.bn - 0.1, 0.55);
      KIT.pop(tl, "#lb-bn", TM.bn + 0.3);
      fill(DOTS.bn, TM.b634 - 0.4, 1.6);
      KIT.pop(tl, "#bn-src", TM.proj);
      term("term2", TM.hw, TM.hw + 3.6);
      // ===== L8 4 copies of Bybit stand beside it — still short of Binance
      out("#lb-byb, #lb-bn", LS[8] - 0.1);
      grow("bcmp", LS[8] + 0.1, 0.5);
      KIT.draw(tl, "cv-copy", LS[8] + 0.3, 0.7);
      [0, 1, 2, 3].forEach((k) => { const t = LS[8] + 1.0 + k * 0.5;
        fill(DOTS.cmp.slice(15 * k, 15 * k + 15), t, 0.25); tl.to("#bcmp-g-" + k, { opacity: 1, duration: 0.2 }, t); KIT.pop(tl, "#lx" + k, t + 0.1); });
      out("#cv-copy", TM.x4 - 1.3, 0.3);
      KIT.cam(tl, TM.x4 - 1.4, CAMS.cmp, 1.0);
      tl.to("#x4line", { opacity: 1, duration: 0.25 }, TM.x4 - 0.6);
      KIT.pop(tl, "#lb-x4", TM.x4 - 0.5, 0.3);
      // ===== L9 wide: the trend from code bugs to bridges & operations
      out("#lb-dao, #lb-ron, #lb-dmm, #lx0, #lx1, #lx2, #lx3, #lb-x4, #x4line", LS[9] - 0.1, 0.25);
      KIT.cam(tl, LS[9] - 0.2, CAMS.wide, 1.5);
      ["dao", "ron", "dmm", "byb", "bn"].forEach((k, i) => KIT.pop(tl, "#ls-" + k, LS[9] + 0.6 + i * 0.12));
      ["dao", "ron", "dmm", "byb", "bn"].forEach((k, i) => pulse("#c2-" + k, LS[9] + 1.4 + i * 0.3));
      KIT.pop(tl, "#lb-tr0", TM.code - 0.1);
      KIT.draw(tl, "cv-trend", TM.code + 0.1, 1.3);
      tl.set("#cv-trend-b", { opacity: 0 }, TM.code + 1.4);
      KIT.pop(tl, "#trend-ah", TM.code + 1.3, 0.25);
      KIT.pop(tl, "#lb-tr1", TM.bridge - 0.1);
      // ===== L10 behind the gallery: what a code audit covers
      out("#ls-dao, #ls-ron, #ls-dmm, #ls-byb, #ls-bn, #lb-tr0, #lb-tr1, #trend-ah, #cv-trend", LS[10] - 0.2, 0.25);
      KIT.cam(tl, LS[10] - 0.3, CAMS.vign, 1.2);
      grow("avm", LS[10] - 0.1, 0.5);
      [TM.pk, TM.ms, TM.fe2, TM.so, TM.ins].forEach((t, i) => { grow("ic" + i, t - 0.1, 0.4); KIT.pop(tl, "#li" + i, t + 0.15); });
      grow("amg", TM.aud - 0.2, 0.4); KIT.pop(tl, "#lb-aud", TM.aud);
      tl.to("#spot", { opacity: 1, duration: 0.4 }, TM.aud + 0.1);
      tl.fromTo("#amg-mv", { x: -40, y: 20 }, { x: 40, y: -20, duration: 1.0, ease: "power1.inOut", immediateRender: false }, TM.aud + 0.1);
      tl.to("#ring", { opacity: 1, duration: 0.35 }, TM.noaud - 0.2);
      KIT.pop(tl, "#lb-noaud", TM.noaud);
      // ===== L11 Balancer V2: rounding direction
      out("#li0, #li1, #li2, #li3, #li4, #lb-aud, #lb-noaud", LS[11] - 0.2, 0.25);
      KIT.cam(tl, LS[11] - 0.3, CAMS.bal, 1.3);
      tl.to("#avm, #amg-mv, #ic0, #ic1, #ic2, #ic3, #ic4, #spot, #ring", { opacity: 0, duration: 0.5 }, LS[11] + 0.2);
      KIT.pop(tl, "#lb-math", TM.math);
      out("#lb-math", TM.bal - 0.5);
      grow("bbal", TM.bal - 0.2, 0.5);
      KIT.pop(tl, "#lb-bal", TM.bal + 0.2);
      grow("coin", TM.bal + 0.1, 0.5);
      tl.to("#coin-cut", { opacity: 1, duration: 0.2 }, TM.round - 0.1);
      tl.to("#coin-R", { x: 70, y: 18, duration: 0.6, ease: "power2.out" }, TM.round + 0.25);
      tl.to("#coin-Rr", { opacity: 1, duration: 0.3 }, TM.round + 0.5);
      KIT.pop(tl, "#lb-cut", TM.round + 0.4);
      // ===== L12 two numbers side by side, then the whole gallery
      out("#lb-cut", LS[12] - 0.1);
      out("#lb-bal", LS[12] - 0.1); tl.to("#bal-lead", { opacity: 1, duration: 0.3 }, TM.b9480 - 0.2);
      fill([DOTS.bal[0]], TM.b9480, 0); KIT.pop(tl, "#lb-b1", TM.b9480 + 0.1);
      fill(DOTS.bal.slice(1), TM.b128 - 0.2, 0.3); KIT.pop(tl, "#lb-b2", TM.b128);
      KIT.pop(tl, "#lb-mature", TM.mature);
      out("#lb-b1, #lb-b2, #lb-mature, #bal-lead", TM.mature + 1.4, 0.25);
      KIT.cam(tl, TM.mature + 1.3, CAMS.wide, 1.6);
      ["dao", "ron", "dmm", "byb", "bal", "bn"].forEach((k, i) => KIT.pop(tl, "#ls-" + k, TM.mature + 2.0 + i * 0.1));
      KIT.pop(tl, "#lb-tr0", TM.mature + 2.3); KIT.pop(tl, "#lb-tr1", TM.mature + 2.4);
      tl.to("#cv-trend", { opacity: 1, duration: 0.3 }, TM.mature + 2.2); KIT.pop(tl, "#trend-ah", TM.mature + 2.3);
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes", JSON.stringify(CAMS));
