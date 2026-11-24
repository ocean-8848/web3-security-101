// Generates compositions/story.html for ep08/seg2「② 借来的本金」(one isometric world「价格集市」, one camera).
// Run: node src/build-story.mjs
// Layout: ../../shared/layout.mjs (positions + CAMS, shared by all six segments; not edited here).
// Opens on CAMS.center (seg1 ends there), ends static on CAMS.left (seg3 opens there).
import fs from "node:fs";
import { at, Wp, G, f, toScreen, gridSvg, worldSvg, wlab, wpin, box, M, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
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
const we = (term, line, nth = 0) => wordAt(T, term, { line, nth }).end;

// ---------------------------------------------------------------- cameras (shared presets + one local close-up)
const CAMS = {
  center: L.CAMS.center, centerRight: L.CAMS.centerRight, left: L.CAMS.left, leftCenter: L.CAMS.leftCenter, market: L.CAMS.market,
  // local: flashDesk close-up (L3–L7), attacker stop at the counter front included
  desk: L.fit([L.rect(L.DESK, "flashDesk"), L.rect(L.ATK.desk, "person")], [420, 300, 1500, 860], 1.6),
};
const fromScreen = (cam, [sx, sy]) => G((sx - cam.x) / cam.scale, (sy - cam.y) / cam.scale);   // screen point → ground {u, v}

// ---------------------------------------------------------------- objects
const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const A = {};
const up = (p, d) => [p[0], p[1] - d];
const rel = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });
const hid = (id, svg) => `<g id="${id}" opacity="0">${svg}</g>`;
const mover = (id, p, svg, vis = true) => `<g id="${id}" data-px="${f(p[0])}" data-py="${f(p[1])}"${vis ? "" : ' opacity="0"'}>${svg}</g>`;

// ---- 中区
const vm = E1.vending(L.VEND, { id: "vm" }); A.vm = vm.anchors; add(L.VEND, vm.svg);
const lg = O.ledgerBook(L.LEDGER, { id: "lg", scale: L.LEDGER.scale }); A.lg = lg.anchors; add(L.LEDGER, lg.svg);
const pOr = E1.pipe(L.VEND, { id: "p-or", pts: L.PIPE.oracle }); A.por = pOr.anchors; items.push({ y: at(L.VEND)[1] + 0.5, svg: pOr.svg });
// ---- 右区
const orc = E1.miniVend(L.ORACLE, { id: "orc", kind: "oracle" }); A.orc = orc.anchors; add(L.ORACLE, orc.svg);
const tw = X.twapRecorder(L.TWAP, { id: "tw" }); add(L.TWAP, tw.svg);
const kn = O.knifeSwitch(L.KNIFE, { id: "kn" }); add(L.KNIFE, kn.svg);
L.TOWERS.forEach((t, i) => add(t, O.tower(t, { id: "tow" + i }).svg));
// ---- 左区
const desk = E1.flashDesk(L.DESK, { id: "fd" }); A.fd = desk.anchors; add(L.DESK, desk.svg);
// empty collateral tray on the counter's right end (L5) and a wooden threshold sill in front of the counter (L6)
const trayO = rel(L.DESK, 80, -10);
add(trayO, hid("tray", box(L.DESK, 50, 112, -32, 12, 104, 108, M.steelLight, 1.4) + `<path d="M${[at(L.DESK, 58, -26, 108.5), at(L.DESK, 104, -26, 108.5), at(L.DESK, 104, 6, 108.5), at(L.DESK, 58, 6, 108.5)].map((p) => `${f(p[0])},${f(p[1])}`).join("L")}Z" fill="none" stroke="#2aa3c9" stroke-width="2.4" stroke-dasharray="7 5"/>`), 60);
const sillO = rel(L.DESK, 0, 150);
add(sillO, hid("sill", box(L.DESK, -110, 110, 140, 162, 0, 20, M.wood, 1.4)));
A.trayTop = at(L.DESK, 81, -10, 112); A.sill = at(L.DESK, 0, 151, 22);
const amm = X.ammPool(L.AMM, { id: "amm" }); A.amm = amm.anchors; add(L.AMM, amm.svg);
const atk = O.person(L.ATK.pool, { id: "atk", role: "attacker" }); A.atk = atk.anchors;
add(L.ATK.desk, hid("atkv", mover("atkw", Wp(L.ATK.pool.u, L.ATK.pool.v), atk.svg)), 1);
// rule sign in front-right of the pool (L22): ground point placed from the CAMS.left screen
const RULE = fromScreen(L.CAMS.left, [1500, 880]);
const rule = E1.signBoard(RULE, { id: "rule", style: "plate", text: "一笔交易内可变 = 攻击者的输入", size: 30 }); A.rule = rule.anchors;
add(RULE, `<g id="rulew" data-ox="${f(at(RULE)[0])}" data-oy="${f(at(RULE)[1])}">${rule.svg}</g>`);
// coin thrown from the attacker into the vending's coin slot (L20)
const coinP = at(L.ATK.mid, 20, 10, 120);
const coinSvg = `<ellipse cx="${f(coinP[0])}" cy="${f(coinP[1])}" rx="26" ry="26" fill="#e2b33c" stroke="#7a5716" stroke-width="3.5"/><ellipse cx="${f(coinP[0])}" cy="${f(coinP[1])}" rx="15" ry="15" fill="none" stroke="#a87d17" stroke-width="3"/>`;
items.push({ y: 1e5, svg: mover("coin", coinP, coinSvg, false) });

// ---- 左前 · 集市街（比喻）
const st = X.marketStall(L.STALL, { id: "st" }); A.st = st.anchors; add(L.STALL, st.svg);
const tc = E4.tellerCounter(L.TELLER, { id: "tc", sign: "当铺", cash: 1 }); A.tc = tc.anchors; add(L.TELLER, tc.svg);
const fr = O.person(L.FRIEND, { id: "fr", role: "engineer" }); A.fr = fr.anchors; add(L.FRIEND, fr.svg);
const you = O.person(L.YOU, { id: "you", role: "signer" }); A.you = you.anchors;
// a 1-gram bar the "you" figure carries (L11)
const barO = rel(L.YOU, 34, 34);
const bar1 = (o, z, id) => `<g id="${id}" opacity="0">${box(o, -14, 14, -8, 8, z, z + 9, M.gold, 1.2)}</g>`;
const YOU_G = Wp(L.YOU.u, L.YOU.v);
add(L.YOU, mover("youw", YOU_G, you.svg + bar1(barO, 100, "you-g")), 2);
// teller counter keeps the 1-gram bar on its top (L12–L15)
const tcBarO = rel(L.TELLER, -60, 30);
add(L.TELLER, bar1(tcBarO, 117, "tc-g"), 3);
A.tcBar = at(tcBarO, 0, 0, 130);
// pile of gold bars next to the street spot (bought out, L10–L13)
const pileO = rel(L.YOU, 110, -120);
const pileBars = () => { let s = ""; [[-48, 0], [0, 0], [48, 0], [-24, 0, 1], [24, 0, 1], [0, 0, 2]].forEach(([du, dv, lv = 0]) => { s += box(pileO, du - 22, du + 22, dv - 12, dv + 12, lv * 12, lv * 12 + 12, M.gold, 1.1); }); return s; };
add(pileO, hid("gpile", pileBars()), 1);
A.gpile = at(pileO, 0, 0, 50);

items.sort((a, b) => a.y - b.y);
// price tags travelling along the price pipe, oracle → contract (L1)
const PP = L.PIPE.oracle.map(([du, dv, z]) => at(L.VEND, du, dv, z + 34)).reverse();
const tag = (i) => { const p = PP[0]; return mover("pt" + i, p, `<g transform="translate(${f(p[0])},${f(p[1])})"><rect x="-70" y="-30" width="140" height="56" rx="12" fill="#ffffff" stroke="#2aa3c9" stroke-width="5"/><text x="0" y="12" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-weight="900" font-size="34" fill="#17809f">2,000</text></g>`, false); };
const tags = [0, 1, 2].map(tag).join("");
const world = worldSvg("wsvg", gridSvg({ u0: -4800, u1: 3400, v0: -1800, v1: 2400 }) + items.map((x) => x.svg).join("\n") + tags, [-3300, -1400, 6600, 3500]);

// ---------------------------------------------------------------- labels (world, counter-scaled)
let labels = "";
const lb = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, cls + " hide", a); };
const pin = (id, p, html, a = "c") => { labels += wpin(id, p, html, a); };
lb("lb-vm", up(A.vm.top, 10), "借贷合约", "lab-ink");
lb("lb-orc", up(A.orc.top, 10), "预言机", "lab-cs");
lb("lb-price", up(A.orc.top, 10), "交出 · 价格", "lab-cs");
lb("lb-fd", up(A.fd.top, 6), "闪电贷", "lab-ink");
lb("lb-steps", up(A.fd.frameTag, 14), `<span class="stp" id="stp0">借款</span> → <span class="stp" id="stp1">使用</span> → <span class="stp" id="stp2">还款</span>`, "lab-ink", "b");
lb("lb-1tx", [A.fd.frameTag[0] - 10, A.fd.frameTag[1] + 30], "一笔交易", "lab-cs", "r");
lb("lb-rb", up(A.fd.top, 6), "未还 → 整笔回滚", "lab-cs");
lb("lb-noc", [A.trayTop[0] + 70, A.trayTop[1] - 20], "无需抵押", "lab-cs", "l");
lb("lb-sill", [A.sill[0] + 150, A.sill[1] + 10], `<span class="strk">本金门槛<i id="sill-x"></i></span>`, "lab-ink", "l");
// gold dot matrix over the desk: the pool's whole liquidity, each dot one share
let ldots = ""; for (let i = 0; i < 24; i++) ldots += `<i class="dd" id="ld${i}"></i>`;
pin("liq", up(A.fd.top, 70), `<div class="dmx hide" id="liqm"><div class="dmx-h">闪电贷池 · 全部流动性</div><div class="dmx-g" style="grid-template-columns:repeat(8,26px)">${ldots}</div></div>`, "b");
lb("lb-atk", up(A.atk.head, 46), "任何人", "lab-r");
// market
lb("lb-meta", Wp(L.YOU.u - 120, L.YOU.v + 280), "比喻", "lab-g", "t");
lb("lb-st", up(A.st.top, 8), "菜市场 · 黄金摊", "lab-ink");
lb("lb-tc", up(A.tc.top, 8), "当铺", "lab-ink");
lb("lb-fr", up(A.fr.head, 44), "朋友", "lab-ink");
lb("lb-you", up(A.you.head, 44), "你", "lab-ink");
lb("lb-val", [(A.tc.top[0] + A.st.board[0]) / 2, Math.min(A.tc.top[1], A.st.board[1]) - 110], "按最新成交价估值", "lab-cs");
lb("lb-hi", [A.st.board[0] + 90, A.st.board[1]], "离谱高价", "lab-rs", "l");
lb("lb-all", up(A.gpile, 20), "全部黄金", "lab-ink");
lb("lb-1g", [A.tcBar[0] - 20, A.tcBar[1] - 40], "1 克", "lab-ink", "r");
lb("lb-v100", up(A.tc.window1 ?? A.tc.top, 70), "估值 100 万", "lab-r");
lb("lb-75", [A.tc.cashOut[0] + 40, A.tc.cashOut[1] + 20], "借出 75 万", "lab-ink", "l");
const YH = [A.you.head[0] + A.tc.customer[0] - YOU_G[0], A.you.head[1] + A.tc.customer[1] - YOU_G[1]];
lb("lb-gain", [YH[0] - 60, YH[1] - 30], "+75 万 − 损耗", "lab-r", "r");
lb("lb-left", [A.tcBar[0] - 20, A.tcBar[1] - 40], "只剩 1 克 · 普通价格", "lab-rs", "r");
// "1 亿" dot pile: starts at the friend, handed to "you", paid to the stall, returned
let ydots = ""; for (let i = 0; i < 10; i++) ydots += `<i class="dd"></i>`;
const YI0 = [A.fr.head[0] - 10, A.fr.head[1] + 150];
pin("yi", YI0, `<div class="dmx hide" id="yim"><div class="dmx-h">1 亿</div><div class="dmx-g" style="grid-template-columns:repeat(5,22px)">${ydots}</div><div class="dmx-f">每点 1000 万</div></div>`, "c");
const YI_YOU = [A.you.head[0] - 150, A.you.head[1] + 120], YI_ST = [A.st.counter[0] + 10, A.st.counter[1] + 40];
// left zone (L18–L22)
lb("lb-q", up(A.atk.head, 46), "一笔交易里 · 能改什么？", "lab-r");
lb("lb-spot", [A.amm.dial[0], A.amm.dial[1] - 70], "现货价 ↑", "lab-rs");
lb("lb-slip", [A.amm.top[0] + 150, A.amm.top[1] + 120], "只要付得起滑点", "lab-r", "l");
lb("lb-bal0", [A.vm.coinSlot[0] - 150, A.vm.coinSlot[1] - 40], "余额读数 1,000", "lab-ink", "r");
lb("lb-bal1", [A.vm.coinSlot[0] - 150, A.vm.coinSlot[1] - 40], "余额读数 1,001", "lab-rs", "r");
// L21 combo: three actions chained into the contract
const CH = [up(A.fd.top, -40), up(A.amm.dial, 0), A.vm.coinSlot];
labels += `<svg class="wsvg" style="left:0;top:0;overflow:visible" width="10" height="10"><path id="combo" d="M${CH.map((p) => `${f(p[0])},${f(p[1])}`).join("L")}" fill="none" stroke="#e0453a" stroke-width="8" stroke-dasharray="22 14" stroke-linecap="round" opacity="0"/></svg>`;
lb("ch0", up(CH[0], 20), "① 借来本金", "lab-rs");
lb("ch1", up(CH[1], 90), "② 推现货价", "lab-rs");
lb("ch2", [CH[2][0] - 170, CH[2][1] - 40], "③ 转入资产", "lab-rs", "r");
lb("ch3", up(A.vm.top, 10), "调用目标协议", "lab-r");

// ---------------------------------------------------------------- screen overlays
const iconSvg = (fn, o, ext, id, sc) => {
  const r = fn(o, { id }); const [x0, y0, x1, y1] = ext; const [X0, Y0] = at(o);
  return `<svg width="${f((x1 - x0) * sc)}" height="${f((y1 - y0) * sc)}" viewBox="${f(X0 + x0)} ${f(Y0 + y0)} ${f(x1 - x0)} ${f(y1 - y0)}">${r.svg}</svg>`;
};
const ICO = { u: 0, v: 0 };
const icTw = iconSvg(X.twapRecorder, ICO, L.EXT.twapRecorder, "ic-tw", 0.24);
const icOr = iconSvg(E1.miniVend, ICO, L.EXT.miniVend, "ic-or", 0.17);
const ROWS = [
  { id: "r0", n: "池子储备比例", chip: "可变", c: "x" },
  { id: "r1", n: "LP 代币价格 <span class=\"sm\">按储备算</span>", chip: "可变", c: "x" },
  { id: "r2", n: "合约余额", chip: "可变", c: "x" },
  { id: "r3", n: "金库份额价格 <span class=\"tg\">捐赠</span>", chip: "可变", c: "x" },
  { id: "r4", n: `<span class="ic" data-layout-ignore>${icTw}</span>TWAP`, chip: "当前区块很难撼动", c: "ok" },
  { id: "r5", n: `<span class="ic" data-layout-ignore>${icOr}</span>链下聚合`, chip: "一笔交易改不动", c: "ok" },
];
const list = `<div class="lst hide" id="lst"><div class="l-h">一笔交易内 · 读数可变吗</div>
  ${ROWS.map((r) => `<div class="l-r hide" id="${r.id}"><span class="l-n">${r.n}</span><span class="l-c ${r.c}">${r.chip}</span></div>`).join("")}
  <div class="l-note hide" id="lnote">会过时 · 撞上下限</div></div>`;
const words = `<div class="wc" id="wc0"><span class="wc-e">？</span><span class="wc-t hide" id="wc0t">预言机</span></div>
  <div class="wc" id="wc1"><span class="wc-e">？</span><span class="wc-t hide" id="wc1t">闪电贷</span></div>`;
const days = `<div class="days hide" id="days"><div class="d-bar" id="dbar"><i></i><i></i><i></i><i></i></div>
  <div class="d-t" id="dt">借钱 · 买金 · 典当 · 卖金 · 还钱 = <b>好几天</b></div><div class="d-x" id="dx"></div></div>
  <div class="dot1 hide" id="dot1"><i></i><span>同一区块 · 同一笔交易</span></div>`;
const txFrame = `<div class="txf hide" id="txf" data-layout-allow-overlap><span class="txf-t">一笔交易</span></div>`;

// term cards (kit/screen.mjs)
const TC = termCards([
  { id: "spot", t: "现货价", d: "AMM 池当前储备比例决定的瞬时价格", at: w("现货价", 19) },
  { id: "slip", t: "滑点", d: "大额交易推动价格造成的额外成本", at: w("滑点", 19) },
  { id: "lp", t: "LP 代币", d: "存入 AMM 池后拿到的份额凭证", at: w("LP代币", 23) },
  { id: "twap", t: "TWAP", d: "一段时间内按时间加权的平均价", at: w("时间加权平均价", 25) },
]);

// ---------------------------------------------------------------- times
const TM = {
  two: w("两个词", 0),
  orc1: w("预言机", 1), data1: w("数据", 1), give1: w("交给合约", 1),
  price2: w("价格", 2),
  fl3: w("闪电贷", 3), b3: w("借款", 3), u3: w("使用", 3), r3: w("还款", 3), tx3: w("同一笔交易", 3),
  noret: w("没有归还", 4), rb4: w("回滚", 4), nth4: w("什么都没发生", 4),
  risk5: w("没有风险", 5), col5: w("不需要抵押", 5),
  cap6: w("本金", 6), sill6: w("门槛", 6),
  any7: w("任何人", 7), all7: w("全部流动性", 7),
  meta8: w("打个比方", 8), pawn8: w("当铺", 8), mkt8: w("菜市场", 8), last8: w("最新成交价", 8),
  fr9: w("朋友", 9), yi9: w("1亿", 9),
  hi10: w("离谱的高价", 10), all10: w("全部黄金", 10),
  g11: w("1克", 11), pawn11: w("当铺", 11),
  v12: w("估值", 12), lend12: w("借给你", 12),
  sell13: w("卖回", 13), ret13: w("还给朋友", 13),
  earn14: w("赚到", 14), loss14: w("损耗", 14),
  left15: w("只剩", 15), norm15: w("普通价格", 15),
  no16: w("不成立", 16), days16: w("好几天", 16),
  chain17: w("链上", 17), blk17: w("同一个区块", 17), nobody17: w("没有人", 17),
  atk18: w("攻击者", 18), what18: w("改变什么", 18),
  amm19: w("AMM", 19), spot19: w("现货价", 19), pos19: w("想要的位置", 19), slip19: w("滑点", 19),
  in20: w("转入资产", 20), bal20: w("余额读数", 20),
  combo21: w("组合", 21), tgt21: w("目标协议", 21),
  rule22: w("规则", 22), inp22: w("输入参数", 22),
  res23: w("储备比例", 23), var23a: w("可变", 23, 0), lp23: w("LP代币价格", 23), var23b: w("可变", 23, 1),
  bal24: w("合约的余额", 24), share24: w("金库份额价格", 24), don24: w("捐赠", 24),
  twap25: w("时间加权平均价", 25), off25: w("链下聚合", 25),
  stale26: w("过时", 26), bound26: w("上下限", 26),
};
const W = (o) => Wp(o.u, o.v);
const D = (from, to) => [f(to[0] - from[0]), f(to[1] - from[1])];

const html = `<template>
  <style>
${kitCss()}
${screenCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 84px; }
    .wc { position: absolute; top: 112px; height: 76px; min-width: 210px; border: 4px dashed #b9b1a2; border-radius: 16px; background: rgba(255,253,248,0.7);
      display: flex; align-items: center; justify-content: center; padding: 0 26px; opacity: 0; }
    #wc0 { left: 60px; } #wc1 { left: 300px; }
    .wc-e { position: absolute; font-size: 40px; font-weight: 900; color: #b9b1a2; }
    .wc-t { font-size: 42px; font-weight: 900; color: #1d93ba; white-space: nowrap; }
    .wc.on { border: 4px solid #2aa3c9; background: #fffdf8; }
    .stp { opacity: 0.5; }
    .strk { position: relative; display: inline-block; }
    .strk i { position: absolute; left: -6px; right: -6px; top: 52%; height: 6px; border-radius: 3px; background: #e0453a; transform: scaleX(0); transform-origin: 0 50%; }
    .dmx { background: #fffdf8; border-radius: 14px; padding: 10px 14px 12px; box-shadow: 0 6px 16px rgba(70,60,40,0.12); text-align: center; }
    .dmx-h { font-size: 28px; font-weight: 900; white-space: nowrap; margin-bottom: 8px; }
    .dmx-f { font-size: 20px; font-weight: 700; color: #6d685e; white-space: nowrap; margin-top: 6px; }
    .dmx-g { display: grid; gap: 6px; justify-content: center; }
    .dd { display: block; width: 22px; height: 22px; border-radius: 50%; background: #e2b33c; border: 2px solid #a87d17; box-sizing: border-box; }
    #liqm .dd { width: 26px; height: 26px; opacity: 0.25; }
    .lst { position: absolute; left: 1292px; top: 110px; width: 576px; background: #fffdf8; border-radius: 18px; padding: 16px 22px 18px; box-shadow: 0 12px 28px rgba(70,60,40,0.14); }
    .l-h { font-size: 30px; font-weight: 900; margin-bottom: 8px; white-space: nowrap; }
    .l-r { display: flex; align-items: center; justify-content: space-between; height: 62px; border-top: 2px solid #ebe6dc; gap: 10px; }
    .l-n { font-size: 28px; font-weight: 800; white-space: nowrap; display: flex; align-items: center; gap: 8px; }
    .l-n .sm { font-size: 22px; font-weight: 700; color: #6d685e; }
    .l-n .tg { font-size: 20px; font-weight: 800; color: #e0453a; border: 2px solid #e0453a; border-radius: 6px; padding: 0 6px 1px; }
    .l-n .ic { display: inline-flex; width: 58px; justify-content: center; }
    .l-c { font-size: 24px; font-weight: 900; color: #fff; border-radius: 8px; padding: 3px 12px 5px; white-space: nowrap; }
    .l-c.x { background: #e0453a; }
    .l-c.ok { background: #1f9d55; }
    .l-note { margin-top: 6px; text-align: right; font-size: 24px; font-weight: 800; color: #6d685e; white-space: nowrap; }
    .days { position: absolute; left: 300px; top: 150px; width: 1320px; height: 110px; }
    .d-bar { position: absolute; left: 0; right: 0; top: 18px; height: 10px; border-radius: 5px; background: #3b3e44; display: flex; justify-content: space-between; transform-origin: 50% 50%; }
    .d-bar i { width: 10px; height: 30px; margin-top: -10px; border-radius: 5px; background: #3b3e44; }
    .d-t { position: absolute; left: 0; right: 0; top: 52px; text-align: center; font-size: 32px; font-weight: 800; white-space: nowrap; color: #1c1c1c; }
    .d-t b { font-weight: 900; }
    .d-x { position: absolute; left: -20px; right: -20px; top: 20px; height: 7px; border-radius: 4px; background: #e0453a; transform: scaleX(0); transform-origin: 0 50%; }
    .dot1 { position: absolute; left: 860px; top: 150px; width: 200px; height: 60px; }
    .dot1 i { position: absolute; left: 82px; top: 6px; width: 36px; height: 36px; border-radius: 50%; background: #1d93ba; box-shadow: 0 0 0 8px rgba(42,163,201,0.25); }
    .dot1 span { position: absolute; left: 50%; top: 56px; transform: translateX(-50%); font-size: 34px; font-weight: 900; color: #17809f; white-space: nowrap; background: #fffdf8; border-radius: 12px; padding: 4px 18px 8px; }
    .txf { position: absolute; left: 150px; top: 280px; width: 1620px; height: 600px; border: 6px solid #2aa3c9; border-radius: 26px; background: rgba(42,163,201,0.05); }
    .txf-t { position: absolute; left: 24px; top: -26px; font-size: 30px; font-weight: 900; color: #fff; background: #1d93ba; border-radius: 10px; padding: 2px 16px 5px; white-space: nowrap; }
    .rwd { position: absolute; left: 50%; top: 50%; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      ${words}${days}${txFrame}${list}${TC.html}
      ${pills(2, { sections: SECTIONS })}
      <div class="k-title" id="ttl-card"><div class="t-main">② 借来的本金</div><div class="t-sub">闪电贷 · 一笔交易内的读数</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E4.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const X1 = window.KITX01, X4 = window.KITX04, X8 = window.KITX08;
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const flash = (sel, t, n, lo) => tl.fromTo(sel, { opacity: 1 }, { opacity: lo == null ? 0.2 : lo, duration: 0.14, yoyo: true, repeat: (n || 3) * 2 - 1, ease: "power1.inOut", immediateRender: false }, t);
      tl.set("#rulew", { scaleY: 0, svgOrigin: $("rulew").getAttribute("data-ox") + " " + $("rulew").getAttribute("data-oy") }, 0);
${TC.js}

      // ===== 0–1.6 · seg1 end framing (center) under the title card
      KIT.camSet(tl, CAMS.center);
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.15);
      pop("#lb-vm", 1.4, 0.3);
      // ===== L0 two words: two empty word slots
      fadeIn("#wc0", ${f(TM.two - 0.1)}, 0.3); fadeIn("#wc1", ${f(TM.two + 0.1)}, 0.3);
      // ===== L1 oracle: pipe to the right zone, price tags flow into the contract
      KIT.cam(tl, ${f(LS[1] - 0.3)}, CAMS.centerRight, 1.3);
      out(".wc-e", 0, 0); tl.set("#wc0 .wc-e", { opacity: 1 }, 0); tl.set("#wc1 .wc-e", { opacity: 1 }, 0);
      out("#wc0 .wc-e", ${f(TM.orc1)}, 0.15); fadeIn("#wc0t", ${f(TM.orc1)}, 0.25); tl.set("#wc0", { className: "wc on" }, ${f(TM.orc1)});
      pop("#lb-orc", ${f(TM.orc1 + 0.3)}, 0.3);
      [0, 1, 2].forEach((i) => {
        const t0 = ${f(TM.data1)} + i * 0.9;
        fadeIn("#pt" + i, t0, 0.2);
        X1.walk(tl, "pt" + i, t0, 2.4, ${JSON.stringify(PP.slice(1).map((p) => [f(p[0]), f(p[1])]))}, "none");
        out("#pt" + i, t0 + 2.3, 0.2);
      });
      // ===== L2 usually a price: dial needle swings, label
      X1.needle(tl, "orc", ${f(TM.price2 - 0.3)}, 18, 0.4); X1.needle(tl, "orc", ${f(TM.price2 + 0.2)}, -6, 0.5);
      tl.set("#lb-orc", { opacity: 0 }, ${f(TM.price2 - 0.1)}); pop("#lb-price", ${f(TM.price2 - 0.1)}, 0.3);
      // ===== L3 flash loan: pan to the desk, transaction frame, borrow → use → repay
      out("#lb-price, #lb-vm", ${f(LS[3] - 0.4)}, 0.2);
      KIT.cam(tl, ${f(LS[3] - 0.4)}, CAMS.desk, 1.6);
      out("#wc1 .wc-e", ${f(TM.fl3)}, 0.15); fadeIn("#wc1t", ${f(TM.fl3)}, 0.25); tl.set("#wc1", { className: "wc on" }, ${f(TM.fl3)});
      pop("#lb-fd", ${f(TM.fl3 + 0.2)}, 0.3);
      fadeIn("#fd-frame", ${f(TM.b3 - 0.4)}, 0.3); pop("#lb-1tx", ${f(TM.b3 - 0.3)}, 0.3); pop("#lb-steps", ${f(TM.b3 - 0.2)}, 0.3);
      tl.to("#stp0", { opacity: 1, duration: 0.2 }, ${f(TM.b3)}); tl.to("#stp1", { opacity: 1, duration: 0.2 }, ${f(TM.u3)}); tl.to("#stp2", { opacity: 1, duration: 0.2 }, ${f(TM.r3)});
      // ===== L4 not repaid → the whole transaction rolls back (gold out, then rewound into place)
      out("#lb-fd, #lb-steps", ${f(LS[4] - 0.1)}, 0.2);
      X1.pileOut(tl, "fd", ${f(TM.noret)}, 0.6);
      tl.to("#fd-frame", { attr: { stroke: "#e0453a" }, duration: 0.15 }, ${f(TM.noret + 0.5)});
      tl.to("#fd-frame", { attr: { stroke: "#2aa3c9" }, duration: 0.15 }, ${f(TM.rb4)});
      flash("#fd-frame", ${f(TM.rb4)}, 3);
      X1.pileIn(tl, "fd", ${f(TM.rb4 + 0.1)}, 0.5);
      pop("#lb-rb", ${f(TM.rb4)}, 0.3);
      // ===== L5 no risk to the lender, no collateral
      fadeIn("#tray", ${f(TM.col5 - 0.4)}, 0.3); pop("#lb-noc", ${f(TM.col5)}, 0.3);
      // ===== L6 capital is no longer a barrier
      out("#lb-rb", ${f(LS[6] - 0.1)}, 0.2);
      fadeIn("#sill", ${f(TM.cap6 - 0.3)}, 0.3); pop("#lb-sill", ${f(TM.cap6)}, 0.3);
      tl.to("#sill-x", { scaleX: 1, duration: 0.4, ease: "power2.out" }, ${f(TM.sill6 + 0.2)});
      tl.to("#sill", { opacity: 0.3, duration: 0.4 }, ${f(TM.sill6 + 0.3)});
      // ===== L7 anyone can borrow all of the pool's liquidity
      out("#lb-noc", ${f(LS[7] - 0.1)}, 0.2);
      fadeIn("#atkv", ${f(TM.any7 - 0.2)}, 0.3);
      X1.walk(tl, "atkw", ${f(TM.any7)}, 1.2, [${JSON.stringify(W(L.ATK.desk).map(f))}]);
      pop("#lb-atk", ${f(TM.any7 + 0.3)}, 0.3);
      pop("#liqm", ${f(TM.all7 - 0.5)}, 0.3);
      for (let i = 0; i < 24; i++) tl.to("#ld" + i, { opacity: 1, duration: 0.1 }, ${f(TM.all7 - 0.2)} + i * 0.035);
      // ===== L8 metaphor: pawnshop values gold at the market's last trade price
      out("#lb-atk, #liqm, #lb-sill, #lb-1tx, #wc0, #wc1", ${f(LS[8] - 0.1)}, 0.25);
      out("#fd-frame, #tray", ${f(LS[8] + 0.6)}, 0.3);
      KIT.cam(tl, ${f(LS[8] - 0.2)}, CAMS.market, 1.5);
      pop("#lb-meta", ${f(TM.meta8)}, 0.3);
      pop("#lb-tc", ${f(TM.pawn8)}, 0.3); pop("#lb-st", ${f(TM.mkt8)}, 0.3);
      pop("#lb-val", ${f(TM.last8)}, 0.3);
      // ===== L9 you borrow 1 亿 from a friend
      out("#lb-val, #lb-st", ${f(LS[9] - 0.1)}, 0.2);
      pop("#lb-fr", ${f(TM.fr9 - 0.2)}, 0.3); pop("#lb-you", ${f(TM.fr9)}, 0.3);
      pop("#yim", ${f(TM.fr9)}, 0.3);
      tl.to("#yi-pin", { x: ${D(YI0, YI_YOU)[0]}, y: ${D(YI0, YI_YOU)[1]}, duration: 0.8, ease: "power2.inOut" }, ${f(TM.yi9)});
      // ===== L10 buy all the gold at an absurd price
      X8.stallPrice(tl, "st", ${f(TM.hi10)}, "¥ 4800", true); pop("#lb-hi", ${f(TM.hi10 + 0.2)}, 0.3);
      tl.to("#yi-pin", { x: ${D(YI0, YI_ST)[0]}, y: ${D(YI0, YI_ST)[1]}, duration: 0.7, ease: "power2.inOut" }, ${f(TM.hi10 + 0.3)});
      X8.goldTo(tl, "st", ${f(TM.all10 - 0.2)}, 0, 0.9);
      fadeIn("#gpile", ${f(TM.all10 + 0.3)}, 0.4); pop("#lb-all", ${f(TM.all10 + 0.5)}, 0.3);
      // ===== L11 take 1 gram to the pawnshop
      out("#lb-hi, #lb-all, #lb-fr, #lb-you", ${f(LS[11] - 0.1)}, 0.2);
      fadeIn("#you-g", ${f(TM.g11 - 0.2)}, 0.2);
      X1.walk(tl, "youw", ${f(TM.g11)}, 1.5, [${JSON.stringify(A.tc.customer.map(f))}]);
      // ===== L12 valued at 100 万, lends 75 万
      out("#you-g", ${f(LS[12])}, 0.2); fadeIn("#tc-g", ${f(LS[12])}, 0.2); pop("#lb-1g", ${f(LS[12] + 0.1)}, 0.3);
      pop("#lb-v100", ${f(TM.v12)}, 0.3);
      X4.cashOut(tl, "tc", 0, ${f(TM.lend12)}, 0.7); pop("#lb-75", ${f(TM.lend12 + 0.6)}, 0.3);
      // ===== L13 sell the gold back, return 1 亿 to the friend
      out("#lb-v100, #lb-75, #lb-1g", ${f(LS[13] - 0.1)}, 0.2);
      out("#gpile", ${f(TM.sell13)}, 0.4); X8.goldTo(tl, "st", ${f(TM.sell13 + 0.1)}, 9, 0.8);
      X8.stallPrice(tl, "st", ${f(TM.sell13 + 0.5)}, "¥ 480", false);
      tl.to("#yi-pin", { x: 0, y: 0, duration: 0.8, ease: "power2.inOut" }, ${f(TM.ret13)});
      // ===== L14 you keep 75 万 minus slippage
      out("#yim", ${f(LS[14])}, 0.3);
      pop("#lb-gain", ${f(TM.earn14)}, 0.3);
      // ===== L15 the pawnshop holds 1 gram at the ordinary price
      pop("#lb-left", ${f(TM.left15)}, 0.3);
      // ===== L16 the metaphor breaks: in reality this takes days
      out("#lb-gain, #lb-left, #lb-tc", ${f(LS[16] - 0.1)}, 0.2);
      fadeIn("#days", ${f(TM.no16)}, 0.3);
      tl.to("#dx", { scaleX: 1, duration: 0.45, ease: "power2.out" }, ${f(TM.days16 + 0.5)});
      // ===== L17 on-chain: same block, same transaction — the whole scene squeezed into one instant
      pop("#txf", ${f(TM.chain17)}, 0.4);
      out("#dt, #dx", ${f(TM.blk17 - 0.3)}, 0.2);
      tl.to("#dbar", { scaleX: 0.02, duration: 0.7, ease: "power3.inOut" }, ${f(TM.blk17 - 0.3)});
      out("#dbar", ${f(TM.blk17 + 0.35)}, 0.15);
      pop("#dot1", ${f(TM.blk17 + 0.35)}, 0.3);
      tl.to("#txf", { scale: 0.96, duration: 0.6, ease: "power2.inOut", transformOrigin: "50% 50%" }, ${f(TM.nobody17)});
      // ===== L18 back to the left zone: what can an attacker change inside one transaction?
      out("#txf, #dot1, #days, #lb-meta, #sill", ${f(LS[18] - 0.25)}, 0.3);
      KIT.cam(tl, ${f(LS[18] - 0.25)}, CAMS.left, 1.5);
      X1.walk(tl, "atkw", ${f(LS[18])}, 1.1, [${JSON.stringify(W(L.ATK.mid).map(f))}]);
      pop("#lb-q", ${f(TM.what18 - 0.2)}, 0.3);
      // ===== L19 push any AMM spot price — as long as the slippage is affordable
      out("#lb-q", ${f(LS[19] + 0.4)}, 0.2);
      X8.poolPump(tl, "amm", ${f(TM.amm19)}, { side: "R", n: 3, gap: 0.5, L: 0.15, R: 0.95, deg: 62, read: "6,000" });
      pop("#lb-spot", ${f(TM.pos19)}, 0.3);
      pop("#lb-slip", ${f(TM.slip19)}, 0.3);
      // ===== L20 transfer assets straight into the contract → its balance reading changes
      out("#lb-spot, #lb-slip", ${f(LS[20] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[20] - 0.2)}, CAMS.leftCenter, 1.1);
      pop("#lb-bal0", ${f(LS[20] + 0.6)}, 0.3);
      fadeIn("#coin", ${f(TM.in20 - 0.1)}, 0.15);
      X1.walk(tl, "coin", ${f(TM.in20)}, 1.2, ${JSON.stringify([[f((coinP[0] + A.vm.coinSlot[0]) / 2), f(Math.min(coinP[1], A.vm.coinSlot[1]) - 420)], A.vm.coinSlot.map(f)])}, "power1.inOut");
      out("#coin", ${f(TM.in20 + 1.15)}, 0.1);
      tl.set("#lb-bal0", { opacity: 0 }, ${f(TM.bal20)}); pop("#lb-bal1", ${f(TM.bal20)}, 0.3); flash("#lb-bal1", ${f(TM.bal20 + 0.35)}, 2, 0.4);
      // ===== L21 combine these with the call into the target protocol
      out("#lb-bal1", ${f(LS[21] - 0.1)}, 0.2);
      pop("#ch0", ${f(LS[21] + 0.1)}, 0.25); pop("#ch1", ${f(LS[21] + 0.35)}, 0.25); pop("#ch2", ${f(LS[21] + 0.6)}, 0.25);
      tl.fromTo("#combo", { opacity: 0, strokeDashoffset: 600 }, { opacity: 1, strokeDashoffset: 0, duration: 1.0, ease: "power1.inOut", immediateRender: false }, ${f(TM.combo21 - 0.3)});
      pop("#ch3", ${f(TM.tgt21)}, 0.3);
      // ===== L22 the rule sign: anything mutable within one transaction = attacker input
      out("#ch0, #ch1, #ch2, #ch3, #combo", ${f(LS[22] - 0.15)}, 0.25);
      KIT.cam(tl, ${f(LS[22] - 0.15)}, CAMS.left, 1.1);
      KIT.grow(tl, "rulew", ${f(TM.rule22)}, 0.5);
      // pool calms back to its normal reading while the sign stands (seg3 opens on a normal pool)
      X8.poolRed(tl, "amm", ${f(TM.inp22 + 0.6)}, false); X8.poolRead(tl, "amm", ${f(TM.inp22 + 0.6)}, "2,000", false);
      X8.poolNeedle(tl, "amm", ${f(TM.inp22 + 0.6)}, -6, 0.8); X8.poolLevel(tl, "amm", ${f(TM.inp22 + 0.6)}, 0.55, 0.55, 0.8);
      // ===== L23–L26 the checklist (top right)
      pop("#lst", ${f(LS[23] - 0.2)}, 0.3);
      pop("#r0", ${f(TM.res23)}, 0.25); pop("#r1", ${f(TM.lp23)}, 0.25);
      pop("#r2", ${f(TM.bal24)}, 0.25); pop("#r3", ${f(TM.share24)}, 0.25);
      pop("#r4", ${f(TM.twap25)}, 0.25); pop("#r5", ${f(TM.off25)}, 0.25);
      pop("#lnote", ${f(TM.stale26)}, 0.3);
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes");
console.log(TC.report);
console.log("RULE", JSON.stringify(RULE), "CAMS.desk", JSON.stringify(CAMS.desk));
