// Generates compositions/story.html for ep08/seg3「③ 推高现货价」(world「价格集市」, one camera).
// Run: node src/build-story.mjs
// Objects: kit + ep01 / ep02 kit-ext (import only) + ep08 kit-ext. World positions: ../../shared/layout.mjs (do not edit);
// segment-only positions and framings are defined locally below.
// Opens on CAMS.left (seg2 end), ends static on CAMS.left with the pool broken (seg4 L0 pans from there).
import fs from "node:fs";
import { at, f, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, box, cyl, M, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { screenCss, termCards } from "../../../kit/screen.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import * as L from "../../shared/layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = T.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const SECTIONS = SCRIPT.sections;
const LN = T.lines.map((_, i) => lineAt(T, i));
const LS = LN.map((l) => l.start);
const w = (term, line, nth = 0) => wordAt(T, term, { line, nth }).start;

// ---------------------------------------------------------------- objects
const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const A = {};
const rel = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });
const up = (p, d) => [p[0], p[1] - d];

const vm = E1.vending(L.VEND, { id: "vm", sign: "LENDING" }); A.vm = vm.anchors; add(L.VEND, vm.svg);
const lg = O.ledgerBook(L.LEDGER, { id: "lg", scale: L.LEDGER.scale }); A.lg = lg.anchors; add(L.LEDGER, lg.svg);
const pp = E1.pipe(L.VEND, { id: "pp", pts: L.PIPE.pool, flowColor: "#e0453a" }); A.pp = pp.anchors;
items.push({ y: at(L.AMM)[1] - 1, svg: `<g id="ppw" opacity="0">${pp.svg}</g>` });          // behind the pool; rises over the USDC tank to the dial
const amm = X.ammPool(L.AMM, { id: "amm" }); A.amm = amm.anchors; add(L.AMM, amm.svg);
const amm2 = X.ammPool(L.AMM_ALT, { id: "amm2", scale: L.AMM_ALT.scale }); A.amm2 = amm2.anchors; add(L.AMM_ALT, `<g id="amm2w" opacity="0">${amm2.svg}</g>`);
const dk = E1.flashDesk(L.DESK, { id: "dk" }); A.dk = dk.anchors; add(L.DESK, dk.svg);
const ctr = E2.rollCounter(L.AMM_ALT, { id: "ctr", digits: 1, value: 1 }); A.ctr = ctr.anchors; add(L.AMM_ALT, `<g id="ctrw" opacity="0">${ctr.svg}</g>`, 1);
// collateral (a few tokens the attacker deposits) in front of the vending's panel
const COL = rel(L.VEND, 150, 170);
const colSvg = cyl(COL, 0, 0, 16, 0, 7, M.gold) + cyl(COL, 0, 0, 16, 8, 15, M.gold) + cyl(COL, 26, 18, 16, 0, 7, M.gold);
add(COL, `<g id="colw" opacity="0">${colSvg}</g>`);
// flash-loan fee coin on the desk counter
const FEE = rel(L.DESK, 120, 60);
add(FEE, `<g id="feew" opacity="0">${cyl(FEE, 0, 0, 14, 0, 7, M.gold)}</g>`, 1);
// attacker + carried things (walks as one group; data-px/py = ground point of ATK.mid)
const atk = O.person(L.ATK.mid, { id: "atk", role: "attacker" }); A.atk = atk.anchors;
const H = rel(L.ATK.mid, 20, 46);
const bars = [0, 1, 2].map((i) => box(H, -22, 22, -12, 12, 96 + i * 13, 108 + i * 13, M.gold)).join("");
const bigBars = [0, 1, 2, 3, 4].map((i) => box(H, -30, 30, -16, 16, 90 + i * 14, 103 + i * 14, M.gold)).join("");
const toks = cyl(H, 0, 0, 13, 100, 107, M.gold) + cyl(H, 0, 0, 13, 108, 115, M.gold) + cyl(H, 0, 0, 13, 116, 123, M.gold);
const [apx, apy] = at(L.ATK.mid);
add(L.ATK.mid, `<g id="atkw" data-px="${f(apx)}" data-py="${f(apy)}">${atk.svg}<g id="cbars" opacity="0">${bars}</g><g id="ctoks" opacity="0">${toks}</g><g id="cbig" opacity="0">${bigBars}</g></g>`, 2);
const ATKW = (o) => at(o);   // walk target = ground point (group translates by target − origin)

items.sort((a, b) => a.y - b.y);
const world = worldSvg("wsvg", gridSvg({ u0: -4600, u1: 2000, v0: -2200, v1: 2000 }) + items.map((x) => x.svg).join("\n"), [-4200, -1800, 7000, 4000]);

// ---------------------------------------------------------------- cameras
// Shared presets: CAMS.left (open / close), CAMS.pool, CAMS.leftCenter, CAMS.center. Local framings:
const CAM = {
  ...L.CAMS,
  // L9–L11: pool + pipe + vending low in frame, code card A across the top
  readW: L.fit([L.rect(L.AMM, "ammPool"), L.rect(L.VEND, "vending"), L.rect(L.LEDGER, "ledgerBook")], [170, 480, 1180, 880], 1.2),
  // L12–L17: five-step route incl. the attacker standing at the vending's panel (ATK.vend), strip + frame on top
  steps: L.fit([...L.ZONE_RECTS.left, L.rect(L.VEND, "vending"), L.rect(L.ATK.vend, "person"), L.rect(L.LEDGER, "ledgerBook")], [90, 290, 1830, 870], 1.4),
  // L21–L25: left zone in the left half, event cards stacked in the right half
  poolL: L.fit([L.rect(L.AMM, "ammPool"), L.rect(L.DESK, "flashDesk"), L.rect(L.ATK.mid, "person")], [80, 300, 1040, 860], 1.4),
};
const S = (cam, p) => toScreen(CAM[cam], p).map((v) => Math.round(v));

// ---------------------------------------------------------------- world labels
let labels = "";
const lb = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, cls + " hide", a); };
const pin = (id, p, html, a = "c") => { labels += wpin(id, p, html, a); };
lb("lb-amm", up(A.amm.top, 6), "AMM 池", "", "b");
lb("lb-vm", up(A.vm.top, 10), "借贷合约", "lab-ink", "b");
lb("lb-pp", at(L.VEND, -800, 0, L.PIPE_Z - 30), "价格管 · 读现货价", "lab-r", "t");
lb("lb-dk", up(A.dk.top, 6), "闪电贷", "lab-cs", "b");
lb("lb-x9", up(A.ctr.top, 4), "× 9 · 1 笔交换", "lab-rs", "b");
lb("lb-deep", up(A.amm.top, 6), "深池", "lab-cs", "b");
lb("lb-shal", up(A.amm2.top, 6), "浅池", "lab-r", "b");
lb("lb-bad", up(A.lg.top, 8), "坏账", "lab-rs", "b");
lb("lb-col", at(COL, 0, 0, 60), "抵押品", "lab-g lab-sm", "b");
lb("lb-fee", at(FEE, 0, 0, 40), "+ 手续费", "lab-gs lab-sm", "b");
lb("lb-read", up(A.vm.top, 20), "读到 18,000", "lab-rs lab-sm", "b");
// five numbered slots along the route (desk → pool → vending → pool → desk)
const SLOT = [up(A.amm.hopR, 70), [A.vm.coinSlot[0] - 330, A.vm.coinSlot[1] - 40], [A.vm.trayOut[0] - 330, A.vm.trayOut[1] + 10], up(A.amm.hopL, 70), up(A.dk.top, 60)];
SLOT.forEach((p, i) => pin("sn" + i, p, `<div class="sn" id="sn${i}">${i + 1}</div>`, "c"));
// lent-out gold, dot pile in front of the tray (each dot = one share of the loan)
pin("gold", up(at(L.GOLD), 20), `<div class="dots hide" id="gdots">${Array.from({ length: 10 }, () => '<i class="dg"></i>').join("")}</div>`, "b");
const routeSvg = (() => {
  const P = L.ATK.path.map((o) => at(o));
  return `<svg class="wsvg" style="left:0;top:0;overflow:visible" width="10" height="10"><path id="route" d="M${P.map((q) => `${f(q[0])},${f(q[1])}`).join("L")}" fill="none" stroke="#2aa3c9" stroke-width="5" stroke-dasharray="14 12" stroke-linecap="round" opacity="0"/></svg>`;
})();
labels += routeSvg;

// ---------------------------------------------------------------- screen overlays
const ov = [];
// card A (L9–L11)
const CA = { x: 840, y: 112, w: 1020 };
const rowY = (c, i) => c.y + 24 + 56 + 50 * i + 25;
const cardA = `<div class="k-code hide" id="cardA" style="left:${CA.x}px;top:${CA.y}px;width:${CA.w}px">
  <div class="c-head">借贷合约 · 读现货价<span class="c-tag">示例</span></div>
  <div class="c-row" id="ca0">(uint112 r0, uint112 r1, ) = pair.getReserves();</div>
  <div class="c-row" id="ca1">return uint256(r1) * 1e18 / r0;<span class="c-chip x hide" id="ca1x">✗ 一笔交易可推高</span></div>
  <div class="c-row" id="ca2">uint256 value = amt * getPrice() / 1e18;</div>
  <div class="c-row" id="ca3">uint256 maxBorrow = value * 75 / 100;<span class="c-cm"> // 示例</span></div>
</div>`;
const lead = (id, row, P3, c1, c2) => { const P0 = [CA.x - 4, rowY(CA, row)]; ov.push(dashCurve(id, P0, P3, { c1, c2 }).svg); };
{
  const tank = S("readW", A.amm.tankR), tray = S("readW", A.vm.trayOut);
  lead("cv-a0", 0, tank, [CA.x - 260, rowY(CA, 0) + 20], [tank[0] + 60, tank[1] - 220]);
  lead("cv-a3", 3, tray, [CA.x - 120, rowY(CA, 3) + 60], [tray[0] - 160, tray[1] - 120]);
}
// L26 lead: big text → pool (CAMS.left)
const BIG = { x: 1000, y: 236, w: 840 };
{
  const P3 = S("left", A.amm.tankR), P0 = [BIG.x + 220, BIG.y + 112];
  ov.push(dashCurve("cv-root", P0, P3, { c1: [P0[0] - 20, P0[1] + 120], c2: [P3[0] + 120, P3[1] - 120] }).svg);
}
const ovSvg = `<svg id="ovl" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">${ov.join("")}</svg>`;

// pool close-up (CAMS.pool) screen anchors
const PD = S("pool", A.amm.dial);
const dotRow = (n, cls, idp) => Array.from({ length: n }, (_, i) => `<i class="${cls}" id="${idp}${i}"></i>`).join("");
const poolHtml = `
  <div class="fx hide" id="fx1">ETH 数量 × USDC 数量 = <b>不变</b></div>
  <div class="fx hide" id="fx2">现货价 = USDC ÷ ETH</div>
  <div class="kw hide" id="quiz"><b>先猜</b><span class="gtag">示例 · 忽略手续费</span></div>
  <div class="dp hide" id="dpE" style="left:380px;top:760px"><div class="dp-h"><span class="dp-t" id="dpE0" data-layout-allow-overlap>1000 ETH</span><span class="dp-t r hide" id="dpE1" data-layout-allow-overlap>≈ 333 ETH</span></div><div class="dp-g e">${dotRow(10, "de", "de")}</div><div class="dp-n">每点 = 100 ETH</div></div>
  <div class="dp hide" id="dpU" style="left:1180px;top:430px"><div class="dp-h"><span class="dp-t" id="dpU0" data-layout-allow-overlap>200 万 USDC</span><span class="dp-t r hide" id="dpU1" data-layout-allow-overlap>600 万 USDC</span></div><div class="dp-g u">${dotRow(30, "du", "du")}</div><div class="dp-n">每点 = 20 万 USDC</div></div>
  <div class="dp hide" id="dp4" style="left:330px;top:250px"><div class="dp-h"><span class="dp-t r">400 万 USDC</span></div><div class="dp-g u">${dotRow(20, "du4", "dq")}</div></div>
  <div class="sp" id="spw" style="left:${PD[0]}px;top:${PD[1] - 70}px">
    <div class="sp-c hide" id="sp0" data-layout-allow-overlap>现货价 2,000</div>
    <div class="sp-c hide" id="sp1" data-layout-allow-overlap>现货价 ?</div>
    <div class="sp-c r hide" id="sp2" data-layout-allow-overlap>现货价 ≈ 18,000</div>
  </div>
  <div class="kw hide" id="kw-push" style="left:56px;top:120px">同样一推 · <b class="r">浅池冲得更高</b></div>
  <div class="kw hide" id="kw-tail" style="left:56px;top:204px"><b class="r">长尾 · 低流动性 = 风险最高</b></div>`;

// five-step strip (L12–L17), top-left
const STEPS = ["借闪电贷 · 买入推价", "存入少量抵押", "按虚高价借出", "卖回代币", "还款 + 手续费"];
const strip = `<div class="dz hide" id="dz"><span class="dz-t">一笔交易 · 五个动作</span>${STEPS.map((_, i) => `<span class="dz-s" id="dz${i}">${i + 1}</span>`).join("")}<span class="dz-n">${STEPS.map((d, i) => `<span class="dz-name" id="dzn${i}" data-layout-allow-overlap>${d}</span>`).join("")}</span></div>`;
const txFrame = `<div class="txf hide" id="txf" data-layout-allow-overlap><span class="txf-t">一笔交易</span></div>`;

// L18 compare card (left) + L19 profit card (right), CAMS.center
const cmp = `<div class="pc hide" id="cmp" style="left:80px;top:330px;width:500px">
  <div class="pc-h">交易结束后</div>
  <div class="pc-r"><span class="pc-l">抵押品 · 真实价值</span><span class="pc-d"><i class="dg"></i></span></div>
  <div class="pc-r"><span class="pc-l">借款</span><span class="pc-d">${'<i class="dg"></i>'.repeat(9)}</span></div>
  <div class="pc-f">真实价值 ≪ 借款</div>
</div>`;
const profit = `<div class="pc hide" id="prof" style="left:1260px;top:300px;width:580px">
  <div class="pc-h">利润 =</div>
  <div class="pc-q" id="pq0">借出的金额</div>
  <div class="pc-q m" id="pq1">− 两次交换的滑点</div>
  <div class="pc-q m" id="pq2">− 手续费</div>
  <div class="pc-q m" id="pq3">− 闪电贷费用</div>
</div>`;

// L21–L25 event cards (top-right, ZONE.event) + L26 row and root-cause card
const EV = [
  { id: "ev0", top: 120, h: "2020 年 2 月 · bZx", m: "约 95 万美元（两次合计）", n: "" },
  { id: "ev1", top: 290, h: "2021 年 5 月 · PancakeBunny", m: "BNB Chain · 约 4500 万美元", n: "按储备算 LP 代币价值" },
  { id: "ev2", top: 480, h: "2021 年 10 月 · Cream Finance", m: "", n: "用金库份额价格估值" },
];
const vaultIcon = `<svg class="vi" id="vi" width="150" height="104" viewBox="0 0 150 104">
  <rect x="8" y="34" width="78" height="62" rx="8" fill="#3b3e44"/><rect x="16" y="42" width="62" height="46" rx="5" fill="#5a5e66"/>
  <circle cx="47" cy="65" r="13" fill="none" stroke="#c9ccd2" stroke-width="4"/><path d="M47 52v26M34 65h26" stroke="#c9ccd2" stroke-width="3"/>
  <g id="vi-coin"><ellipse cx="47" cy="14" rx="14" ry="6" fill="#e2b33c" stroke="#a87d17" stroke-width="2"/><rect x="33" y="14" width="28" height="6" fill="#d39f22"/><ellipse cx="47" cy="20" rx="14" ry="6" fill="#d39f22" stroke="#a87d17" stroke-width="2"/></g>
  <g id="vi-arr" opacity="0"><path d="M104 88L130 30" stroke="#e0453a" stroke-width="7" stroke-linecap="round"/><path d="M116 32L132 26L136 43" fill="none" stroke="#e0453a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>
</svg>`;
const evHtml = EV.map((e, i) => `<div class="evs hide" id="${e.id}s" style="top:${e.top}px" data-layout-allow-overlap></div>
  <div class="ev hide" id="${e.id}" style="top:${e.top}px">
    <div class="ev-h">${e.h}<span class="gtag">公开报道</span></div>
    ${e.m ? `<div class="ev-m">${e.m}</div>` : ""}${i === 2 ? `<div class="ev-row"><div><div class="ev-n">${e.n}</div><div class="ev-m hide" id="ev2m">捐赠抬价 · 约 1.3 亿美元</div></div>${vaultIcon}</div>` : e.n ? `<div class="ev-n">${e.n}</div>` : ""}
  </div>`).join("");
const CH = [["bZx", "约 95 万"], ["PancakeBunny", "约 4500 万"], ["Cream", "约 1.3 亿"]];
const chips = `<div class="chips hide" id="chips">${CH.map((c) => `<span class="chip">${c[0]} · ${c[1]} 美元</span>`).join("")}</div>`;
const bigCard = `<div class="big hide" id="big" style="left:${BIG.x}px;top:${BIG.y}px;width:${BIG.w}px"><div class="big-s">三起事件 · 根因一样</div><div class="big-m">一笔交易就能改写的数据</div></div>`;

// term cards
const TC = termCards([
  { id: "cp", t: "恒定乘积", d: "两种储备数量相乘保持不变的 AMM", at: w("恒定乘积", 1) },
  { id: "vs", t: "金库份额价格", d: "金库总资产 ÷ 总份额", at: w("金库份额价格", 24) },
]);

// ---------------------------------------------------------------- times
const TM = {
  amm0: w("AMM", 0), spot0: w("现货价", 0),
  mul1: w("相乘", 1), keep1: w("保持不变", 1),
  ratio2: w("比值", 2),
  guess3: w("猜", 3), ex3: w("示例", 3),
  eth4: w("ETH", 4), usdc4: w("USDC", 4), p4: w("2000", 4),
  usdc5: w("400", 5), buy5: w("买入", 5),
  q6: w("多少", 6),
  r7: w("18000", 7), u7: w("600", 7), e7: w("333", 7),
  x9: w("9", 8), one8: w("一笔交换", 8),
  vm9: w("借贷合约", 9),
  res10: w("储备", 10), ratio10: w("比值", 10),
  val11: w("抵押品价值", 11), p75: w("75", 11), ex11: w("示例", 11),
  five12: w("五个动作", 12),
  s1: LS[13], push13: w("推高", 13),
  s2: LS[14], s3: LS[15], lend15: w("借出", 15),
  s4: LS[16], s5: LS[17], fee17: w("手续费", 17),
  end18: w("交易结束", 18), real18: w("真实价值", 18), bad18: w("坏账", 18),
  prof19: w("利润", 19), slip19: w("滑点", 19), fee19: w("手续费", 19), fl19: w("闪电贷费用", 19),
  shal20: w("越浅", 20), tail20: w("长尾", 20),
  pub21: w("公开报道", 21),
  bzx: w("bZx", 22), m95: w("95", 22),
  pb: w("PancakeBunny", 23), lp23: w("LP", 23),
  cream: w("Cream", 24), share24: w("金库份额价格", 24),
  don25: w("捐赠", 25), up25: w("抬高", 25), m13: w("1.3", 25),
  three26: w("三起事件", 26), root26: w("根因", 26), data26: w("改写", 26),
};

const html = `<template>
  <style>
${kitCss()}
${screenCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 84px; }
    .k-code .c-row { white-space: pre; }
    .k-code .c-chip.x { background: #e0453a; font-family: "Noto Sans SC", sans-serif; }
    .gtag { display: inline-block; font-size: 28px; font-weight: 800; color: #6d685e; background: #ebe6dc; border-radius: 8px; padding: 2px 12px 4px; margin-left: 14px; vertical-align: 4px; }
    .kw { position: absolute; left: 56px; top: 120px; font-size: 40px; font-weight: 900; background: #fffdf8; border-radius: 16px; padding: 10px 28px 14px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); white-space: nowrap; }
    .kw b { color: #1d93ba; } .kw b.r { color: #e0453a; }
    .fx { position: absolute; left: 640px; font-size: 40px; font-weight: 900; background: #fffdf8; border-radius: 16px; padding: 8px 28px 12px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); white-space: nowrap; }
    #fx1 { top: 112px; } #fx2 { top: 196px; color: #1d93ba; }
    .fx b { color: #1f9d55; }
    .dp { position: absolute; background: #fffdf8; border-radius: 14px; padding: 10px 14px 10px; box-shadow: 0 6px 16px rgba(70,60,40,0.12); }
    .dp-h { position: relative; height: 40px; min-width: 250px; }
    .dp-t { position: absolute; left: 0; top: 0; font-size: 30px; font-weight: 900; line-height: 40px; white-space: nowrap; }
    .dp-t.r { color: #e0453a; }
    .dp-g { display: grid; grid-template-columns: repeat(10, 24px); gap: 6px; margin-top: 6px; }
    .dp-g i { display: block; width: 24px; height: 24px; border-radius: 50%; box-sizing: border-box; }
    .dp-g.e i { background: #e2b33c; border: 2px solid #a87d17; }
    .dp-g.u i { background: #2aa3c9; border: 2px solid #17809f; }
    .dp-n { margin-top: 6px; font-size: 28px; font-weight: 700; color: #6d685e; white-space: nowrap; }
    .sp { position: absolute; width: 0; height: 0; }
    .sp-c { position: absolute; left: 0; bottom: 0; transform: translateX(-50%); font-size: 38px; font-weight: 900; white-space: nowrap; background: #1c1c1c; color: #fff; border-radius: 12px; padding: 4px 20px 8px; }
    .sp-c.r { background: #e0453a; }
    .sn { width: 46px; height: 46px; border-radius: 50%; border: 4px dashed #9a9286; background: rgba(255,253,248,0.9); color: #8a8478; font: 900 28px/38px "Noto Sans SC", sans-serif; text-align: center; box-sizing: border-box; opacity: 0; }
    .dots { display: grid; grid-template-columns: repeat(5, 24px); gap: 6px; background: #fffdf8; padding: 10px; border-radius: 12px; box-shadow: 0 6px 16px rgba(70,60,40,0.12); }
    .dg { display: inline-block; width: 24px; height: 24px; border-radius: 50%; background: #e2b33c; border: 2px solid #a87d17; box-sizing: border-box; }
    .dz { position: absolute; left: 56px; top: 120px; height: 64px; display: flex; align-items: center; gap: 10px; background: #fffdf8; border-radius: 14px; padding: 0 18px; box-shadow: 0 6px 16px rgba(70,60,40,0.10); }
    .dz-t { font-size: 30px; font-weight: 900; margin-right: 6px; white-space: nowrap; }
    .dz-s { width: 44px; height: 44px; border-radius: 10px; border: 3px dashed #c9c1b2; color: #8a8478; font: 800 28px/38px "Noto Sans SC", sans-serif; text-align: center; box-sizing: border-box; }
    .dz-s.lit { border: 3px solid #1d93ba; color: #1d93ba; }
    .dz-s.cur { background: #e0453a; border: 3px solid #e0453a; color: #ffffff; }
    .dz-n { position: relative; width: 330px; height: 44px; margin-left: 8px; }
    .dz-name { position: absolute; left: 0; top: 0; font-size: 30px; font-weight: 800; line-height: 44px; white-space: nowrap; opacity: 0; }
    .txf { position: absolute; left: 60px; top: 230px; width: 1800px; height: 650px; border: 6px dashed #2aa3c9; border-radius: 28px; background: rgba(42,163,201,0.05); }
    .txf-t { position: absolute; left: 24px; top: -28px; font-size: 32px; font-weight: 900; color: #fff; background: #1d93ba; border-radius: 10px; padding: 4px 18px 6px; white-space: nowrap; }
    .pc { position: absolute; background: #ffffff; border-radius: 18px; padding: 20px 28px 22px; box-shadow: 0 12px 28px rgba(70,60,40,0.12); }
    .pc-h { font-size: 34px; font-weight: 900; white-space: nowrap; margin-bottom: 8px; }
    .pc-r { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
    .pc-l { font-size: 28px; font-weight: 700; color: #3a3832; white-space: nowrap; }
    .pc-d { display: flex; gap: 6px; }
    .pc-r:nth-of-type(3) .dg { background: rgba(224,69,58,0.15); border: 2px dashed #e0453a; }
    .pc-f { margin-top: 14px; font-size: 30px; font-weight: 900; color: #e0453a; white-space: nowrap; }
    .pc-q { font-size: 34px; font-weight: 900; line-height: 1.5; white-space: nowrap; opacity: 0; }
    .pc-q.m { color: #6d685e; }
    .evs { position: absolute; right: 48px; width: 740px; height: 150px; border: 4px dashed #c9c1b2; border-radius: 16px; box-sizing: border-box; }
    #ev2s { height: 200px; }
    .ev { position: absolute; right: 48px; width: 740px; background: #ffffff; border-left: 6px solid #e0453a; border-radius: 14px; padding: 14px 24px 16px; box-shadow: 0 10px 24px rgba(70,60,40,0.14); box-sizing: border-box; }
    .ev-h { font-size: 32px; font-weight: 900; white-space: nowrap; }
    .ev-m { margin-top: 6px; font-size: 32px; font-weight: 900; color: #e0453a; white-space: nowrap; }
    .ev-n { margin-top: 6px; font-size: 28px; font-weight: 700; color: #3a3832; white-space: nowrap; }
    .ev-row { display: flex; justify-content: space-between; align-items: flex-end; }
    .chips { position: absolute; right: 48px; top: 112px; display: flex; gap: 14px; }
    .chip { font-size: 28px; font-weight: 800; background: #ffffff; border-left: 5px solid #e0453a; border-radius: 10px; padding: 6px 16px 8px; white-space: nowrap; box-shadow: 0 6px 16px rgba(70,60,40,0.10); }
    .big { position: absolute; background: #fffdf8; border-radius: 22px; padding: 16px 30px 22px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); text-align: center; }
    .big-s { font-size: 30px; font-weight: 800; color: #6d685e; white-space: nowrap; }
    .big-m { font-size: 56px; font-weight: 900; color: #e0453a; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      ${poolHtml}${strip}${txFrame}${cardA}${cmp}${profit}${evHtml}${chips}${bigCard}${ovSvg}${TC.html}
      ${pills(3, { sections: SECTIONS })}
      <div class="k-title" id="ttl-card"><div class="t-main">③ 推高现货价</div><div class="t-sub">AMM 现货价 · 五步路径 · 浅池</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E2.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAM)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const X1 = window.KITX01, X8 = window.KITX08;
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const walk = (t, dur, pts) => X1.walk(tl, "atkw", t, dur, pts, "power1.inOut");
      const hot = (id, t, c) => tl.to("#" + id, { backgroundColor: c || "#fdeae7", duration: 0.2 }, t);
      const cool = (id, t) => tl.to("#" + id, { backgroundColor: "rgba(253,234,231,0)", duration: 0.2 }, t);
      ["#ca0", "#ca1", "#ca2", "#ca3"].forEach((s) => tl.set(s, { backgroundColor: "rgba(253,234,231,0)" }, 0));
      const slot = (i, cls, t) => tl.set("#dz" + i, { className: "dz-s " + cls }, t);
      const dzName = (i, t) => { [0, 1, 2, 3, 4].forEach((j) => tl.to("#dzn" + j, { opacity: j === i ? 1 : 0, duration: 0.2 }, t)); };
      const step = (i, t) => {
        if (i > 0) { slot(i - 1, "lit", t); tl.to("#sn" + (i - 1), { borderColor: "#1d93ba", backgroundColor: "#ffffff", color: "#1d93ba", borderStyle: "solid", duration: 0.2 }, t); }
        slot(i, "cur", t); dzName(i, t);
        tl.to("#sn" + i, { borderColor: "#e0453a", backgroundColor: "#e0453a", color: "#ffffff", borderStyle: "solid", duration: 0.2 }, t);
        tl.fromTo("#sn" + i, { scale: 1.35 }, { scale: 1, duration: 0.4, ease: "back.out(2)", immediateRender: false }, t);
      };
      const poolReset = (id, t, dur) => { X8.poolRed(tl, id, t, false); X8.poolNeedle(tl, id, t, -6, dur); X8.poolLevel(tl, id, t, 0.55, 0.55, dur); X8.poolRead(tl, id, t, "2,000", false); };
      ${TC.js}

      // ===== 0–1.6 · title card over seg2's end framing (CAMS.left)
      KIT.camSet(tl, CAMS.left);
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.15);
      // ===== L0 most common mistake: pricing with the AMM spot price; the price pipe now plugs into the pool's dial
      KIT.cam(tl, ${f(LS[0] - 0.2)}, CAMS.leftCenter, 1.3);
      pop("#lb-vm", ${f(LS[0] + 0.6)}, 0.3); pop("#lb-amm", ${f(TM.amm0)}, 0.3);
      fadeIn("#ppw", ${f(LS[0] + 0.9)}, 0.6);
      fadeIn("#pp-flow", ${f(TM.spot0)}, 0.3);
      X1.dash(tl, ["pp-flow"], ${f(TM.spot0)}, ${f(LS[1] - TM.spot0)}, 260);
      pop("#lb-pp", ${f(TM.spot0 + 0.2)}, 0.3);
      // ===== L1 constant product (pool close-up)
      out("#lb-vm, #lb-pp, #lb-amm", ${f(LS[1] - 0.2)}, 0.2);
      KIT.cam(tl, ${f(LS[1] - 0.2)}, CAMS.pool, 1.2);
      pop("#fx1", ${f(TM.mul1)}, 0.3);
      X8.hop(tl, "amm", ${f(TM.mul1)}, "L", 1); X8.hop(tl, "amm", ${f(TM.mul1 + 0.3)}, "R", 1);
      tl.fromTo("#fx1 b", { color: "#1c1c1c" }, { color: "#1f9d55", duration: 0.3, immediateRender: false }, ${f(TM.keep1)});
      // ===== L2 spot price = ratio
      pop("#fx2", ${f(TM.ratio2 - 0.6)}, 0.3);
      pop("#sp0", ${f(TM.ratio2)}, 0.3);
      // ===== L3 guess (example, no fees)
      pop("#quiz", ${f(TM.guess3 - 0.2)}, 0.3);
      // ===== L4 1000 ETH + 2,000,000 USDC → 2000
      out("#fx1, #fx2", ${f(LS[4] - 0.1)}, 0.25);
      pop("#dpE", ${f(TM.eth4 - 0.3)}, 0.3); pop("#dpU", ${f(TM.usdc4 - 0.2)}, 0.3);
      for (let i = 10; i < 30; i++) tl.set("#du" + i, { opacity: 0 }, 0);
      tl.fromTo("#sp0", { scale: 1.2 }, { scale: 1, duration: 0.35, ease: "back.out(2)", immediateRender: false }, ${f(TM.p4)});
      // ===== L5 someone buys ETH with 4,000,000 USDC
      out("#quiz", ${f(LS[5] - 0.1)}, 0.2);
      pop("#dp4", ${f(TM.usdc5)}, 0.3);
      tl.to("#dp4", { x: ${f(S("pool", A.amm.hopR)[0] - 330 - 160)}, y: ${f(S("pool", A.amm.hopR)[1] - 250 - 120)}, scale: 0.35, duration: 0.8, ease: "power2.in" }, ${f(TM.buy5 + 0.3)});
      out("#dp4", ${f(TM.buy5 + 1.0)}, 0.15);
      X8.poolPump(tl, "amm", ${f(TM.buy5 + 0.9)}, { side: "R", n: 3, gap: 0.45, L: 0.18, R: 0.95, deg: 62, read: null });
      // ===== L6 what's the price now?
      tl.set("#sp0", { opacity: 0 }, ${f(TM.q6 - 0.1)}); pop("#sp1", ${f(TM.q6 - 0.1)}, 0.25);
      X8.poolRead(tl, "amm", ${f(TM.q6)}, "?", false);
      // ===== L7 ≈ 18000; USDC 6,000,000, ETH ≈ 333
      tl.set("#sp1", { opacity: 0 }, ${f(TM.r7)}); pop("#sp2", ${f(TM.r7)}, 0.3);
      X8.poolRead(tl, "amm", ${f(TM.r7)}, "18,000", true);
      for (let i = 10; i < 30; i++) tl.to("#du" + i, { opacity: 1, duration: 0.12 }, ${f(TM.u7)} + (i - 10) * 0.04);
      tl.set("#dpU0", { opacity: 0 }, ${f(TM.u7)}); tl.set("#dpU1", { opacity: 1 }, ${f(TM.u7)});
      for (let i = 9; i >= 3; i--) tl.to("#de" + i, { opacity: i === 3 ? 0.33 : 0.1, duration: 0.15 }, ${f(TM.e7)} + (9 - i) * 0.06);
      tl.set("#dpE0", { opacity: 0 }, ${f(TM.e7)}); tl.set("#dpE1", { opacity: 1 }, ${f(TM.e7)});
      // ===== L8 × 9 in one swap
      out("#dpE, #dpU", ${f(LS[8] - 0.1)}, 0.25);
      fadeIn("#ctrw", ${f(TM.x9 - 0.6)}, 0.3);
      KIT.count(tl, "ctr", ${f(TM.x9 - 0.5)}, 0.8, 1, 9, "power1.out");
      pop("#lb-x9", ${f(TM.one8 - 0.2)}, 0.3);
      // ===== L9 the lending contract (code card A)
      out("#sp2, #lb-x9, #ctrw", ${f(LS[9] - 0.2)}, 0.2);
      KIT.cam(tl, ${f(LS[9] - 0.2)}, CAMS.readW, 1.3);
      poolReset("amm", ${f(LS[9] + 1.2)}, 0.6);
      pop("#lb-vm", ${f(TM.vm9)}, 0.3);
      pop("#cardA", ${f(TM.vm9 + 0.4)}, 0.3);
      // ===== L10 reads reserves, ratio as price
      hot("ca0", ${f(TM.res10 - 0.2)}); hot("ca1", ${f(TM.ratio10 - 0.2)});
      KIT.draw(tl, "cv-a0", ${f(TM.res10)}, 0.7);
      pop("#ca1x", ${f(TM.ratio10 + 0.3)}, 0.25);
      X1.dash(tl, ["pp-flow"], ${f(TM.res10)}, ${f(LS[12] - TM.res10)}, 400);
      // ===== L11 collateral value × price, borrow ≤ 75 % (example)
      cool("ca0", ${f(TM.val11 - 0.2)}); cool("ca1", ${f(TM.val11 - 0.2)});
      hot("ca2", ${f(TM.val11 - 0.2)}); hot("ca3", ${f(TM.p75 - 0.3)});
      KIT.draw(tl, "cv-a3", ${f(TM.p75)}, 0.7);
      // ===== L12 five actions in one transaction
      out("#cardA, #cv-a0, #cv-a3, #lb-vm", ${f(LS[12] - 0.15)}, 0.2);
      KIT.cam(tl, ${f(LS[12] - 0.15)}, CAMS.steps, 1.3);
      walk(${f(LS[12])}, 1.0, [${JSON.stringify(ATKW(L.ATK.desk))}]);
      pop("#dz", ${f(LS[12] + 0.6)}, 0.3);
      fadeIn("#route", ${f(TM.five12 - 0.2)}, 0.4);
      for (let i = 0; i < 5; i++) tl.fromTo("#sn" + i, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(1.6)", immediateRender: false }, ${f(TM.five12)} + i * 0.18);
      // ===== L13 ① flash loan → buy in the pool → spot price up
      step(0, ${f(TM.s1)});
      X1.pileOut(tl, "dk", ${f(TM.s1 + 0.1)}, 0.5); fadeIn("#cbars", ${f(TM.s1 + 0.4)}, 0.2);
      walk(${f(TM.s1 + 0.6)}, 1.3, [${JSON.stringify(ATKW(L.ATK.pool))}]);
      out("#cbars", ${f(TM.s1 + 2.0)}, 0.2);
      X8.poolPump(tl, "amm", ${f(TM.s1 + 2.0)}, { side: "R", n: 2, gap: 0.35, L: 0.18, R: 0.95, deg: 62, read: "18,000" });
      fadeIn("#ctoks", ${f(TM.s1 + 3.0)}, 0.2);
      // ===== L14 ② deposit a few tokens as collateral
      step(1, ${f(TM.s2)});
      walk(${f(TM.s2 + 0.1)}, 1.5, [${JSON.stringify(ATKW(L.ATK.vend))}]);
      fadeIn("#colw", ${f(TM.s2 + 1.7)}, 0.3);
      tl.to("#ctoks", { opacity: 0.55, duration: 0.2 }, ${f(TM.s2 + 1.7)});
      // ===== L15 ③ protocol reads reserves at the inflated price and lends a lot
      step(2, ${f(TM.s3)});
      X1.dash(tl, ["pp-flow"], ${f(TM.s3)}, 1.6, 320);
      pop("#lb-read", ${f(TM.s3 + 0.9)}, 0.3);
      X1.dispense(tl, "vm", ${f(TM.lend15)}, { n: 6, gap: 0.12 });
      pop("#gdots", ${f(TM.lend15 + 0.5)}, 0.35);
      out("#gdots, #lb-read", ${f(TM.lend15 + 2.0)}, 0.25); fadeIn("#cbig", ${f(TM.lend15 + 2.0)}, 0.25);
      walk(${f(TM.lend15 + 2.2)}, 1.3, [${JSON.stringify(ATKW(L.ATK.pool))}]);
      // ===== L16 ④ sell the tokens back; needle returns
      step(3, ${f(TM.s4)});
      out("#ctoks", ${f(TM.s4 + 0.1)}, 0.2);
      X8.poolSwap(tl, "amm", ${f(TM.s4 + 0.1)}, "L", 0.7);
      poolReset("amm", ${f(TM.s4 + 0.4)}, 0.8);
      // ===== L17 ⑤ repay the flash loan + fee; one transaction frames all five
      step(4, ${f(TM.s5)});
      walk(${f(TM.s5)}, 0.9, [${JSON.stringify(ATKW(L.ATK.desk))}]);
      tl.to("#cbig", { opacity: 0, duration: 0.2 }, ${f(TM.s5 + 0.9)});
      X1.pileIn(tl, "dk", ${f(TM.s5 + 0.9)}, 0.5);
      fadeIn("#feew", ${f(TM.fee17)}, 0.2); pop("#lb-fee", ${f(TM.fee17 + 0.1)}, 0.3);
      slot(4, "lit", ${f(TM.s5 + 2.0)});
      tl.to("#sn4", { borderColor: "#1d93ba", backgroundColor: "#ffffff", color: "#1d93ba", duration: 0.2 }, ${f(TM.s5 + 2.0)});
      tl.fromTo("#txf", { opacity: 0, scale: 1.08, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out", immediateRender: false }, ${f(TM.s5 + 1.6)});
      // ===== L18 the transaction ends: collateral worth ≪ loan → bad debt
      out("#txf, #dz, #route, #sn0-pin, #sn1-pin, #sn2-pin, #sn3-pin, #sn4-pin, #lb-fee", ${f(LS[18] - 0.1)}, 0.25);
      KIT.cam(tl, ${f(LS[18] - 0.1)}, CAMS.center, 1.1);
      pop("#lb-col", ${f(LS[18] + 1.0)}, 0.3);
      pop("#lb-vm", ${f(LS[18] + 0.4)}, 0.3);
      pop("#cmp", ${f(TM.real18 - 0.3)}, 0.3);
      KIT.broke(tl, "lg", ${f(TM.bad18)}, { badge: false, ghost: 0.85 }); pop("#lb-bad", ${f(TM.bad18)}, 0.3);
      walk(${f(LS[18] + 1.5)}, 1.0, [${JSON.stringify(ATKW(L.ATK.mid))}]);   // off-frame: attacker back between desk and pool
      // ===== L19 profit = loan − 2× slippage − fees − flash-loan fee
      pop("#prof", ${f(TM.prof19 - 0.2)}, 0.3);
      tl.to("#pq0", { opacity: 1, duration: 0.25 }, ${f(TM.prof19 + 0.4)});
      tl.to("#pq1", { opacity: 1, duration: 0.25 }, ${f(TM.slip19 - 0.6)});
      tl.to("#pq2", { opacity: 1, duration: 0.25 }, ${f(TM.fee19 - 0.2)});
      tl.to("#pq3", { opacity: 1, duration: 0.25 }, ${f(TM.fl19 - 0.2)});
      // ===== L20 shallower pool → cheaper to push; long tail riskiest
      out("#cmp, #prof, #lb-vm, #lb-bad, #lb-col", ${f(LS[20] - 0.15)}, 0.2);
      out("#feew", ${f(LS[20])}, 0.2);   // off-frame: back to seg4's baseline desk
      KIT.cam(tl, ${f(LS[20] - 0.15)}, CAMS.pool, 1.2);
      fadeIn("#amm2w", ${f(LS[20] + 0.4)}, 0.4);
      pop("#lb-deep", ${f(LS[20] + 0.9)}, 0.3); pop("#lb-shal", ${f(LS[20] + 1.0)}, 0.3);
      pop("#kw-push", ${f(TM.shal20 - 0.4)}, 0.3);
      X8.poolPump(tl, "amm", ${f(TM.shal20)}, { side: "R", n: 2, gap: 0.45, L: 0.47, R: 0.64, deg: 14, read: null });
      X8.poolPump(tl, "amm2", ${f(TM.shal20)}, { side: "R", n: 2, gap: 0.45, L: 0.15, R: 0.95, deg: 64, read: null });
      pop("#kw-tail", ${f(TM.tail20)}, 0.3);
      // ===== L21 recurring in public reports: three event slots
      out("#kw-push, #kw-tail, #lb-deep, #lb-shal", ${f(LS[21] - 0.15)}, 0.2);
      out("#amm2w", ${f(LS[21] - 0.15)}, 0.4);
      poolReset("amm", ${f(LS[21])}, 0.6);
      KIT.cam(tl, ${f(LS[21] - 0.1)}, CAMS.poolL, 1.2);
      for (let i = 0; i < 3; i++) fadeIn("#ev" + i + "s", ${f(TM.pub21)} + i * 0.2, 0.25);
      // ===== L22–L25 bZx · PancakeBunny · Cream
      out("#ev0s", ${f(TM.bzx - 0.3)}, 0.15); pop("#ev0", ${f(TM.bzx - 0.3)}, 0.3);
      out("#ev1s", ${f(TM.pb - 0.3)}, 0.15); pop("#ev1", ${f(TM.pb - 0.3)}, 0.3);
      out("#ev2s", ${f(TM.cream - 0.3)}, 0.15); pop("#ev2", ${f(TM.cream - 0.3)}, 0.3);
      tl.fromTo("#vi-coin", { y: 0 }, { y: 30, duration: 0.5, ease: "power2.in", immediateRender: false }, ${f(TM.don25)});
      tl.to("#vi-coin", { opacity: 0, duration: 0.15 }, ${f(TM.don25 + 0.45)});
      tl.to("#vi-arr", { opacity: 1, duration: 0.3 }, ${f(TM.up25)});
      pop("#ev2m", ${f(TM.don25 - 0.2)}, 0.3);
      // ===== L26 same root cause: data one transaction can rewrite → pool broken (end static on CAMS.left)
      out("#ev0, #ev1, #ev2", ${f(LS[26] - 0.1)}, 0.25);
      KIT.cam(tl, ${f(LS[26] - 0.1)}, CAMS.left, 1.2);
      pop("#chips", ${f(TM.three26)}, 0.3);
      pop("#big", ${f(TM.root26 - 0.2)}, 0.35);
      KIT.draw(tl, "cv-root", ${f(TM.data26)}, 0.7);
      KIT.broke(tl, "amm", ${f(TM.data26 + 0.6)}, { ghost: 0.4 });
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes");
console.log(TC.report);
console.log("pool cam: hopR", S("pool", A.amm.hopR), "dial", PD, "amm2 top", S("pool", A.amm2.top), "ctr top", S("pool", A.ctr.top), "| readW", JSON.stringify(CAM.readW), "amm", S("readW", A.amm.top), "vm", S("readW", A.vm.top), "tray", S("readW", A.vm.trayOut),
  "| poolL", JSON.stringify(CAM.poolL), "amm", S("poolL", A.amm.top), "| leftCenter sn", SLOT.map((p) => S("leftCenter", p)).join(" "), "| center col", S("center", at(COL, 0, 0, 60)));
