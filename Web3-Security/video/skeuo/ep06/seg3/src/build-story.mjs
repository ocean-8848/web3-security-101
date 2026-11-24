// Generates compositions/story.html for ep06/seg3「③ 舍入方向」.
// Run: node src/build-story.mjs
// World = 整数工坊: 比喻角（披萨店，取整台左后） · 中区取整台 · 中右区金库（保险柜 + 份额出票机） ·
// 右区池子（分拣机 + 稳定池 + 天平 + 小取整刀） · 更右 KyberSwap（合约机器 + 小取整刀 + 价格滑轨）。
import fs from "node:fs";
import { G, at, f, box, M, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, kitCss, runtimeJs, BADGE } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { LY, CUT_CTR_Z, BELT_Z } from "./layout.mjs";
import { goldBar, chipHeap, wireCube, loopArrow, priceRail, liqBlock, shopCounter } from "./props.mjs";

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
const ofs = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });
// ep03 contractMachine: long names squeeze the code screen to a negative width → build with a short placeholder, then swap the text.
const machine = (o, opts, name, size = 30) => {
  const r = E3.contractMachine(o, { ...opts, name: "Walle" });
  r.svg = r.svg.replace(/font-size="40"([^>]*)>Walle<\/text>/, `font-size="${size}"$1>${name}</text>`);
  return r;
};

// ================================================================ world
// 中区·取整台
put("rc", X.roundCutter(LY.RC, { id: "rc", dir: "down", stock: 4, chip: 0.5, cutAt: 6 }), LY.RC);
add(at(LY.RCNT)[1], `<g id="rcntp" data-ox="${f(at(LY.RCNT)[0])}" data-oy="${f(at(LY.RCNT)[1])}">${box(LY.RCNT, -80, 80, -32, 32, 0, CUT_CTR_Z, M.steel, 1.6)}</g>`);
put("rcnt", E2.rollCounter(LY.RCNT, { id: "rcnt", digits: 4, value: 0, z: CUT_CTR_Z }), LY.RCNT, 1);
const heap = chipHeap(LY.HEAP, { id: "heap", rings: 11, r0: 100 });
put("heap", heap, LY.HEAP);
const cube = wireCube(LY.RC, { id: "cube", u0: -290, u1: 250, v0: -170, v1: 230, h: 360 });
add(at(LY.RC)[1] - 400, cube.back); add(at(LY.RC)[1] + 400, cube.front); A.cube = cube.anchors;
const scr1 = `<rect width="148" height="88" fill="#10151a"/>` + ["fuzz · 重复 N 次", "x=7 · 误差→协议 ✓", "x=93 · 误差→协议 ✓", "x=512 · 误差→协议 ✓"].map((s, i) =>
  `<text id="dk-l${i}" x="8" y="${18 + i * 20}" font-family="JetBrains Mono, Noto Sans SC" font-size="11" font-weight="700" fill="${i ? "#7fd0ea" : "#ffffff"}" opacity="${i ? 0 : 1}">${s}</text>`).join("");
const scr2 = `<rect width="148" height="88" fill="#3a0f0c"/><rect x="14" y="16" width="120" height="56" rx="6" fill="#e0453a"/><text x="74" y="52" text-anchor="middle" font-family="Noto Sans SC" font-size="26" font-weight="900" fill="#fff">反例</text>`;
put("desk", O.desk(LY.DESK, { id: "desk", screen: scr1, screen2: scr2 }), LY.DESK);
{ const r = O.magnifier(LY.RC, { id: "mag" }), rc = A.rc; const lens = r.anchors.lens ?? r.anchors.center;
  const d = [rc.chip[0] - lens[0] + 6, rc.chip[1] - lens[1] - 30];
  r.svg = `<g transform="translate(${f(d[0])},${f(d[1])})">${r.svg}</g>`;
  r.anchors = Object.fromEntries(Object.entries(r.anchors).map(([k, v]) => [k, Array.isArray(v) && typeof v[0] === "number" ? [v[0] + d[0], v[1] + d[1]] : v]));
  put("mag", r, LY.RC, 900); }
// 中右区·金库
const SD = X.besideSafe(LY.SAFE);
put("vault", O.safe(LY.SAFE, { id: "vault", plate: "ERC-4626", gold: true }), LY.SAFE);
put("sd", X.shareDispenser(SD, { id: "sd", value: 1000, tickets: 3 }), SD, 1);
put("user", O.person(LY.USER, { id: "user", role: "signer" }), LY.USER);
put("atk", O.person(ofs(LY.USER, 40, 20), { id: "atk", role: "attacker" }), ofs(LY.USER, 40, 20), 1);
const HAND = ofs(LY.USER, 70, 10);
put("gbA", goldBar(HAND, { id: "gbA", z: 120, op: 0 }), HAND, 300);
put("gbB", goldBar(HAND, { id: "gbB", z: 120, op: 0 }), HAND, 301);
const VOUT = ofs(LY.SAFE, -40, 60);
put("gbC", goldBar(VOUT, { id: "gbC", z: 130, op: 0 }), VOUT, 900);
put("gbD", goldBar(VOUT, { id: "gbD", z: 130, op: 0 }), VOUT, 901);
put("crtA", X.shareCert(HAND, { id: "crtA", stand: true, scale: 1.4, z: 110 }), HAND, 302);
put("crtB", X.shareCert(HAND, { id: "crtB", stand: true, scale: 1.4, z: 110 }), HAND, 303);
put("loop", loopArrow(ofs(LY.USER, 120, -150), { id: "loop", ru: 210, rv: 150 }), ofs(LY.USER, 120, -150), -600);
// 比喻角·披萨店
put("pctr", shopCounter(LY.PIZ, { id: "pctr", w: 300, d: 170, h: 96 }), LY.PIZ);
{ const r = X.pizza(LY.PIZ, { id: "pz", slices: 8 }); r.svg = `<g transform="translate(0,${f(-96 * 0.866)})">${r.svg}</g>`;
  const sh = (p) => [p[0], p[1] - 96 * 0.866];
  r.anchors = { ...r.anchors, top: sh(r.anchors.top), lid: sh(r.anchors.lid), pizza: sh(r.anchors.pizza) };
  put("pz", r, LY.PIZ, 2); }
put("clerk", O.person(LY.CLERK, { id: "clerk", role: "engineer" }), LY.CLERK);
put("cust", O.person(LY.CUST, { id: "cust", role: "signer" }), LY.CUST);
put("cmpl", O.envelope(ofs(LY.CUST, 200, -60), { id: "cmpl" }), ofs(LY.CUST, 200, -60));
const PICK = ofs(LY.CUST, -40, -150);
put("pick", shopCounter(PICK, { id: "pick", w: 130, d: 100, h: 80 }), PICK);
// 右区·池子（Balancer）
put("sort", E1.sorter(LY.SORT, { id: "sort", letters: 0, blockLabel: "1 笔" }), LY.SORT);
const LET = [0, 1, 2, 3, 4, 5].map((i) => { const o = ofs(LY.SORT, 130 - i * 66, 0); return put("lt" + i, E1.letter(o, { id: "lt" + i, z: BELT_Z }), LY.SORT, 10 - i); });
put("pool", E3.contractMachine(LY.POOL, { id: "pool", name: "POOL" }), LY.POOL);
put("bal", E1.balance(LY.BAL, { id: "bal", tilt: 0 }), LY.BAL);
put("mini", X.roundCutter(LY.MINI, { id: "mini", dir: "down", scale: 0.85, stock: 3 }), LY.MINI);
put("atk2", O.person(LY.ATK, { id: "atk2", role: "attacker" }), LY.ATK);
// 更右·KyberSwap
put("kyb", machine(LY.KYB, { id: "kyb" }, "Kyber", 34), LY.KYB);
put("kcut", X.roundCutter(LY.KCUT, { id: "kcut", dir: "up", scale: 0.8, load: true, stock: 3 }), LY.KCUT);
put("rail", priceRail(LY.RAIL, { id: "rail", L: 520, post: 300, cur: 170 }), LY.RAIL);
put("liq", liqBlock(LY.RAIL, { id: "liq", u0: 170, u1: 290, v0: -120, v1: -50, z: 0, h: 50 }), LY.RAIL, -2);
put("liq2", liqBlock(LY.RAIL, { id: "liq2", u0: 310, u1: 430, v0: -120, v1: -50, z: 0, h: 50, red: true }), LY.RAIL, -1);

items.sort((a, b) => a.y - b.y);
const world = worldSvg("wsvg", gridSvg({ u0: -3200, u1: 7600, v0: -2600, v1: 4600 }) + items.map((x) => x.svg).join("\n"), [-1600, -1400, 9000, 4200]);

// ================================================================ cameras
const P = (o, du = 0, dv = 0, z = 0) => at(o, du, dv, z);
const CAMS = {
  cut: camAt(P(LY.RC, -10, 30, 110), 960, 600, 1.5),
  vault: camAt([750, -40], 1000, 730, 0.66),
  loop: camAt([640, -20], 1000, 640, 0.78),
  pizza: camAt([-720, 640], 960, 540, 1.1),
  frame: camAt(P(LY.RC, 60, 80, 150), 900, 560, 0.86),
  bal: camAt([2750, 0], 1060, 600, 0.9),
  kyb: camAt([4550, 260], 1000, 600, 1.0),
  mag: camAt(P(LY.RC, 60, 0, 120), 960, 580, 1.4),
  wide: camAt(P(LY.RC, 40, 160, 100), 960, 600, 1.0),
};
const sc = (cam, p) => toScreen(CAMS[cam], p);

// ================================================================ world labels
let labels = "";
const up = (p, dy) => [p[0], p[1] - dy];
const rt = (p, dx, dy = 0) => [p[0] + dx, p[1] + dy];
const R = A.rc;
labels += wlab("lb-rc", up(R.top, 10), "取整刀", "hide");
labels += wlab("lb-rem", up(R.chip, 26), "余数", "lab-ink hide");
labels += wlab("lb-tL", rt(R.trayL, -10, 6), "协议？", "lab-cs hide", "t");
labels += wlab("lb-tR", rt(R.trayR, 10, 6), "调用者？", "lab-rs hide", "t");
labels += wlab("lb-tLok", rt(R.trayL, -10, 6), "协议 ✓", "lab-gs hide", "t");
labels += wlab("lb-tRno", rt(R.trayR, 10, 6), "调用者 ✗", "lab-g hide", "t");
labels += wlab("lb-vault", up(A.vault.top, 0), "ERC-4626 金库", "hide");
labels += wlab("lb-sd", rt(A.sd.top, -40, 0), "份额出票机", "hide", "r");
labels += wlab("lb-user", up(A.user.head, 70), "用户", "lab-ink hide");
labels += wlab("lb-want3", rt(A.user.head, 70, -40), "要 3 份", "hide", "l");
labels += wlab("lb-wantA", rt(A.user.head, 70, -40), "要取资产", "hide", "l");
labels += wlab("lb-lvdn", rt(R.lever, -40, 0), "向下 ↓", "lab-cs hide", "r");
labels += wlab("lb-lvup", rt(R.lever, -40, 0), "向上 ↑", "lab-ink hide", "r");
labels += wlab("lb-plus", up(R.trayLTop, 60), "+1 粒 → 协议", "lab-cs lab-sm hide");
labels += wlab("lb-atk", up(A.atk.head, 70), "攻击者", "lab-rs hide");
labels += wlab("lb-wrong", rt(R.lever, -40, 0), "方向反了 ✗", "lab-rs hide", "r");
labels += wlab("lb-rt", P(ofs(LY.USER, 120, -150), 0, 150, 0), "往返套利", "lab-rs hide", "t");
labels += wlab("lb-mint", up(A.sd.top, 10), "mint 1 份", "lab-r hide");
labels += wlab("lb-redeem", up(A.sd.top, 10), "redeem 1 份", "lab-r hide");
labels += wlab("lb-net", up(R.trayRTop, 60), "每圈 +1 个单位 → 调用者", "lab-rs lab-sm hide");
labels += wlab("lb-once", rt(R.trayRTop, 60, -40), "单次：1 个单位", "lab-sm hide", "l");
labels += wlab("lb-cnt", up(A.rcnt.top ?? P(LY.RCNT, 0, 0, 120), 0), "循环次数", "hide");
labels += wlab("lb-nofee", rt(A.heap.ground, 0, 60), "无手续费时", "lab-g hide", "t");
labels += wlab("lb-pz", up(A.pz.top, 0), "一张 = 8 块", "hide");
labels += wlab("lb-pay", up(A.cust.head, 70), "付 1/3 张的钱", "lab-ink hide");
labels += wlab("lb-div", rt(A.pz.pizza, 0, -170), "8 ÷ 3 = 2.67 块", "hide");
labels += wlab("lb-2", rt(A.pz.pizza, -150, -90), "2 块？", "lab-g hide");
labels += wlab("lb-3", rt(A.pz.pizza, 150, -90), "3 块？", "lab-g hide");
labels += wlab("lb-give3", up(A.cust.head, 70), "拿到 3 块", "lab-r hide");
labels += wlab("lb-tally", up(A.cust.head, 70), "付 2/3 张（5.33 块）· 拿 6 块", "lab-rs hide");
labels += wlab("lb-cmpl", up(A.cmpl.top, 10), "投诉", "lab-g hide");
labels += wlab("lb-tx", rt(A.cube.tag, -12, 0), "一笔交易", "lab-cs hide", "r");
labels += wlab("lb-wei", rt(R.trayR, 60, -10), "每次多拿 1 wei", "lab-rs hide", "l");
labels += wlab("lb-k", up(A.rcnt.top ?? P(LY.RCNT, 0, 0, 120), 0), "几千次", "lab-rs hide");
// Balancer
labels += wlab("lb-sort", up(A.sort.top ?? P(LY.SORT, 0, 0, 300), 0), "一笔批量交换", "hide");
labels += wlab("lb-pool", up(A.pool.top, 0), "Balancer V2 · 稳定池", "hide");
labels += wlab("lb-small", P(LY.SORT, -60, 0, 300), "大量小额交换", "lab-r hide");
labels += wlab("lb-mini", rt(A.mini.trayR, 10, 4), "舍入 → 攻击者", "lab-rs lab-sm hide", "t");
labels += wlab("lb-atk2", up(A.atk2.head, 70), "攻击者", "lab-rs hide");
labels += wlab("lb-bal", rt(A.bal.top, -60, 20), "不变量", "hide", "r");
labels += wlab("lb-manip", rt(A.bal.top, -60, 20), "不变量 · 被操纵", "lab-rs hide", "r");
// KyberSwap
labels += wlab("lb-kyb", up(A.kyb.top, 0), "KyberSwap Elastic", "hide");
labels += wlab("lb-should", rt(A.kcut.lever, -30, -40), "应：向上 ↑", "hide", "r");
labels += wlab("lb-actual", rt(A.kcut.lever, -30, 30), "实际：向下 ↓", "lab-rs hide", "r");
labels += wlab("lb-tick", up(A.rail.post, 70), "tick 界线", "lab-cs lab-sm hide");
labels += wlab("lb-price", rt(A.rail.cur, 0, 40), "价格", "lab-sm hide", "t");
labels += wlab("lb-nocross", rt(A.kyb.top, 0, 70), "池子判断：未越过 ✗", "lab-rs hide", "t");
labels += wlab("lb-twice", up(A.liq2.top, 20), "同一段流动性 · 算两次", "lab-rs hide");
// tests
labels += wlab("lb-single", rt(A.mag.lens ?? A.rc.chip, 120, -40), "单步：可忽略", "lab-cs hide", "l");
labels += wlab("lb-amp", rt(A.heap.c, 210, -40), "批量 · 循环：放大", "lab-rs hide", "l");
labels += wlab("lb-desk", up(A.desk.top, 0), "模糊测试", "hide");
labels += wlab("lb-N", up(A.rcnt.top ?? P(LY.RCNT, 0, 0, 120), 0), "重复 N 次", "lab-ink hide");
labels += wlab("lb-cex", rt(A.desk.screen, -100, -10), "反例", "lab-rs hide", "r");
// BPT price column (world-pinned card)
const colDots = Array.from({ length: 8 }, (_, i) => `<i id="pc${i}" class="pcd${i > 2 ? " hide" : ""}"></i>`).join("");
labels += wpin("pcol", rt(A.bal.top, 170, -170), `<div id="pcol" class="hide"><div class="pc-h">份额价格（BPT）</div><div class="pc-col">${colDots}</div></div>`, "c");

// ================================================================ times
const TM = {
  rem0: w("丢掉余数", 0), who0: w("余数归谁", 0),
  rule1: w("规则", 1), pro1: w("余数归协议", 1), no1: w("不归调用者", 1),
  erc2: w("ERC", 2), erc4626: w("ERC-4626", 2), four2: w("四个函数", 2), dir2: w("四个方向", 2),
  dep3: w("deposit", 3), give3: w("给资产", 3), take3: w("拿份额", 3), dn3: w("向下取整", 3), less3: w("少给", 3),
  mint4: w("mint", 4), spec4: w("指定份额", 4), pay4: w("多少资产", 4), up4: w("向上取整", 4), more4: w("多收", 4),
  wd5: w("withdraw", 5), spec5: w("指定资产", 5), up5: w("向上取整", 5), more5: w("多扣", 5),
  rd6: w("redeem", 6), hand6: w("交出份额", 6), take6: w("拿资产", 6), dn6: w("向下取整", 6), less6: w("少给", 6),
  out7: w("给出去的", 7), in7: w("收进来的", 7),
  rev8: w("方向反了", 8), rt8: w("往返套利", 8),
  mint9: w("mint", 9), rd9: w("redeem", 9), net9: w("净赚", 9),
  small10: w("单次很小", 10), fee10: w("没有手续费", 10), k10: w("上千次", 10),
  meta11: w("打个比方", 11), slice11: w("按块卖", 11), eight11: w("切 8 块", 11),
  third12: w("三分之一张", 12), dec12: w("店员要决定", 12), two12: w("2 块", 12), three12: w("3 块", 12),
  more13: w("总往多了给", 13), smart13: w("聪明的顾客", 13), again13: w("反复买", 13),
  no14: w("不成立", 14), cmpl14: w("投诉", 14),
  wei15: w("1 wei", 15), tx15: w("一笔交易", 15), k15: w("几千次", 15),
  bal16: w("Balancer", 16), pub16: w("公开分析", 16), batch16: w("批量交换", 16),
  chain17: w("串联", 17), small17: w("小额交换", 17), acc17: w("朝自己累积", 17),
  inv18: w("不变量", 18), px18: w("份额价格", 18), man18: w("操纵", 18),
  usd19: w("9480", 19), val19: w("事发时估值", 19), only19: w("部署的池子", 19),
  third20: w("第三方分析", 20), usd20: w("1.28", 20), cite20: w("写明口径", 20),
  y21: w("2023", 21), kyb21: w("KyberSwap", 21), dir21: w("方向上", 21),
  up22: w("向上取整", 22), dn22: w("向下取整", 22),
  mis23: w("误判", 23), tick23: w("tick", 23), liq23: w("同一段流动性", 23), two23: w("两次", 23),
  off24: w("官方复盘", 24), usd24: w("5620", 24),
  one25: w("单步测试", 25), ign25: w("忽略", 25),
  batch26: w("批量", 26), amp26: w("放大", 26),
  n27: w("重复 N 次", 27), fuzz27: w("模糊测试", 27),
};

// ================================================================ screen-layer HTML
const CC = { x: 56, y: 118, w: 960 };
const row = (i, fn, what, arrow, verb) => `<div class="cc-row" id="cc${i}"><span class="cc-bar" id="cc${i}-bar"></span><span class="cc-fn">${fn}</span><span class="cc-ar">→</span><span class="cc-what">${what}</span>
  <span class="cc-dir ${arrow === "↓" ? "dn" : "upd"}">${arrow} ${arrow === "↓" ? "向下" : "向上"}</span><span class="cc-verb" id="cc${i}-v">${verb}</span></div>`;
const cardC = `<div class="k-code hide" id="cardC"><div class="c-head">ERC-4626 · 四个函数的取整方向</div>
  ${row(0, "deposit(assets)", "份额", "↓", "少给")}
  ${row(1, "mint(shares)", "资产", "↑", "多收")}
  ${row(2, "withdraw(assets)", "份额", "↑", "多扣")}
  ${row(3, "redeem(shares)", "资产", "↓", "少给")}
  <div class="cc-foot" id="ccFoot">余数归协议 · 不归调用者</div>
  <div class="cc-foot2 hide" id="ccFoot2">给出去的 <b class="dn">↓</b> · 收进来的 <b>↑</b><span class="c-tag">解读</span></div></div>`;
const kw = `<div id="kw" class="hide"><span class="kw-a">余数归协议</span><span class="kw-dot">·</span><span class="kw-b">不归调用者</span></div>`;
const metaTag = `<div id="meta" class="hide"><span class="mt-t">比喻</span><span class="mt-s">披萨店按块卖</span></div>`;
const stampNo = `<div id="nohold" class="hide"><div class="nh-t">比喻在这里不成立</div><div class="nh-s">披萨店会被投诉 · 合约不会</div></div>`;
const tag = (t, id = "") => `<span class="ev-tag" ${id ? `id="${id}"` : ""}>${t}</span>`;
const evBal = `<div id="evBal" class="ev hide"><div class="ev-h">Balancer V2 · 2025 年 11 月 · 多链 ${tag("Check Point、Verichains 等分析", "evPub")}</div></div>
  <div id="evAmt" class="ev ev2 hide"><div class="ev-row">
    <div class="ev-amt hide" id="amtA"><div class="ev-n">约 9480 万美元</div><div class="ev-tags">${tag("Balancer 官方复盘")}${tag("事发时估值", "tgA2")}${tag("只含 Balancer 部署的池子", "tgA3")}</div></div>
    <div class="ev-div hide" id="evDiv"></div>
    <div class="ev-amt hide" id="amtB"><div class="ev-n">约 1.28 亿美元</div><div class="ev-tags">${tag("Check Point 早期分析")}</div></div>
  </div>
  <div class="ev-cite hide" id="evCite">两个数字口径不同 · 引用时写明口径</div></div>`;
const evKyb = `<div id="evKyb" class="ev hide"><div class="ev-h">KyberSwap Elastic · 2023 年 11 月 · 多链</div></div>
  <div id="evKA" class="ev ev2 hide"><div class="ev-row"><div class="ev-amt" id="amtK"><div class="ev-n">受影响资产 约 5620 万美元</div><div class="ev-tags">${tag("KyberSwap 官方复盘")}</div></div></div></div>`;

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #cardC { left: ${CC.x}px; top: ${CC.y}px; width: ${CC.w}px; padding-bottom: 20px; }
    #cardC .cc-row { position: relative; height: 56px; display: flex; align-items: center; font-size: 30px; font-weight: 700; color: #b5ae9f; white-space: nowrap; }
    #cardC .cc-bar { position: absolute; left: -18px; top: 10px; width: 6px; height: 36px; background: #2aa3c9; border-radius: 3px; opacity: 0; }
    #cardC .cc-fn { width: 330px; font-family: "JetBrains Mono", monospace; font-variant-ligatures: none; }
    #cardC .cc-ar { width: 54px; }
    #cardC .cc-what { width: 110px; }
    #cardC .cc-dir { width: 190px; font-weight: 900; }
    #cardC .cc-verb { font-weight: 900; opacity: 0; }
    #cardC .cc-row.on { color: #1c1c1c; }
    #cardC .cc-row.on .dn { color: #1d93ba; }
    #cardC .cc-foot, #cardC .cc-foot2 { margin-top: 10px; padding-top: 12px; border-top: 2px solid #ebe5da; font-size: 34px; font-weight: 900; white-space: nowrap; }
    #cardC .cc-foot2 { position: absolute; left: 34px; right: 34px; bottom: 20px; background: #ffffff; }
    #cardC .cc-foot2 .dn { color: #1d93ba; }
    #cardC .cc-foot2 .c-tag { position: absolute; right: 0; top: 14px; }
    #kw { position: absolute; left: 0; right: 0; top: 132px; text-align: center; }
    #kw span { display: inline-block; font-size: 64px; font-weight: 900; vertical-align: middle; }
    #kw .kw-a { background: #fffdf8; color: #1f9d55; border-radius: 18px; padding: 10px 30px 14px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    #kw .kw-dot { margin: 0 18px; color: #6d685e; }
    #kw .kw-b { background: #fffdf8; color: #6d685e; border-radius: 18px; padding: 10px 30px 14px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    #meta { position: absolute; left: 56px; top: 40px; display: flex; align-items: center; gap: 16px; }
    #meta .mt-t { font-size: 40px; font-weight: 900; color: #4a463f; background: #fffdf8; border: 3px solid #b9b1a2; border-radius: 12px; padding: 2px 20px 6px; }
    #meta .mt-s { font-size: 32px; font-weight: 800; color: #6d685e; }
    #nohold { position: absolute; left: 560px; top: 210px; width: 800px; text-align: center; background: #fffdf8; border: 6px solid #8a8478; border-radius: 22px; padding: 22px 20px 26px; transform: rotate(-4deg); box-shadow: 0 14px 30px rgba(70,60,40,0.16); }
    #nohold .nh-t { font-size: 60px; font-weight: 900; color: #4a463f; }
    #nohold .nh-s { margin-top: 6px; font-size: 32px; font-weight: 800; color: #6d685e; }
    .ev { position: absolute; left: 56px; top: 40px; background: #fffdf8; border-radius: 18px; padding: 18px 28px 22px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); border-left: 10px solid #e0453a; }
    .ev2 { top: 140px; border-left-color: #cfc7b8; }
    .ev .ev-h { font-size: 36px; font-weight: 900; white-space: nowrap; display: flex; align-items: center; gap: 14px; }
    .ev .ev-row { display: flex; align-items: stretch; gap: 26px; margin-top: 4px; }
    .ev .ev-n { font-size: 58px; font-weight: 900; white-space: nowrap; line-height: 1.15; }
    .ev .ev-tags { display: flex; gap: 10px; margin-top: 4px; }
    .ev .ev-tag { font-size: 28px; font-weight: 700; color: #4a463f; background: #f1ede5; border: 2px solid #cfc7b8; border-radius: 10px; padding: 1px 12px 3px; white-space: nowrap; }
    .ev .ev-div { width: 4px; background: #cfc7b8; border-radius: 2px; }
    .ev .ev-cite { margin-top: 12px; font-size: 32px; font-weight: 800; color: #1c1c1c; white-space: nowrap; }
    .tcard { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
      padding: 14px 26px 18px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
    .tcard.tc-low { top: 156px; }
    .tcard .t1 { font-size: 32px; font-weight: 900; white-space: nowrap; }
    .tcard .t2 { margin-top: 6px; font-size: 29px; font-weight: 700; color: #3d3a35; white-space: nowrap; }
    #pcol { background: #fffdf8; border-radius: 14px; padding: 10px 16px 14px; box-shadow: 0 10px 22px rgba(70,60,40,0.12); text-align: center; }
    #pcol .pc-h { font-size: 28px; font-weight: 800; white-space: nowrap; }
    #pcol .pc-col { display: flex; flex-direction: column-reverse; align-items: center; gap: 6px; margin-top: 8px; }
    #pcol .pcd { display: block; width: 30px; height: 30px; border-radius: 50%; background: #2aa3c9; }
    #pcol .pcd.red { background: #e0453a; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      ${cardC}${kw}${metaTag}${stampNo}${evBal}${evKyb}
      <div class="tcard hide" id="tcE"><div class="t1">ERC-4626</div><div class="t2">代币化金库的标准接口</div></div>
      <div class="tcard hide" id="tcW"><div class="t1">wei</div><div class="t2">链上金额的最小单位</div></div>
      <div class="tcard tc-low hide" id="tcI"><div class="t1">不变量</div><div class="t2">任何操作后都必须成立的条件</div></div>
      <div class="tcard tc-low hide" id="tcT"><div class="t1">tick</div><div class="t2">池子里离散的价格刻度</div></div>
      <div class="tcard hide" id="tcF"><div class="t1">模糊测试</div><div class="t2">用大量随机输入反复检验</div></div>
      ${pills(3, { sections: SCRIPT.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">③ 舍入方向</div><div class="t-sub">四个函数 · 往返套利 · 两个案例</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E2.runtimeExtJs()}
${E3.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const K6 = window.KITX06, K1 = window.KITX01, K3 = window.KITX03;
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const fin = (sel, t, d) => tl.to(sel, { opacity: 1, duration: d || 0.25, ease: "power1.out" }, t);
      const term = (id, t0, t1) => { KIT.pop(tl, "#" + id, t0, 0.3); if (t1 != null) out("#" + id, t1, 0.25); };
      const slideIn = (sel, t) => tl.fromTo(sel, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out", immediateRender: false }, t);
      const slideOut = (sel, t) => tl.to(sel, { opacity: 0, x: -40, duration: 0.3, ease: "power2.in" }, t);
      const hideG = (id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); };
      const shrink = (id, t) => { const g = $(id); tl.to("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy"), duration: 0.35, ease: "power2.in" }, t); };
      const grow = (id, t, d) => KIT.grow(tl, id, t, d || 0.45);
      const swap = (a, b, t) => KIT.swap(tl, a, b, t, 0.25);
      const rowOn = (i, t) => { tl.set("#cc" + i, { className: "cc-row on" }, t); tl.to("#cc" + i + "-bar", { opacity: 1, duration: 0.15 }, t); };
      const rowOff = (i, t) => tl.to("#cc" + i + "-bar", { opacity: 0, duration: 0.15 }, t);
      const heapTo = (from, to, t, d) => { for (let k = from; k < to; k++) tl.to("#heap-" + k, { opacity: 1, duration: 0.08 }, t + (k - from) * d / Math.max(1, to - from)); };
      // world offset helper → K6.carry (du, dv, dz are world units from the build position)
      const carry = (id, t, du, dv, dz, d, lift) => K6.carry(tl, id, t, du, dv, dz, d || 0.7, lift == null ? 60 : lift);

      KIT.camSet(tl, CAMS.cut);
      ["rcnt", "rcntp", "desk", "mag", "user", "atk", "loop", "pctr", "pz", "clerk", "cust", "cmpl", "pick", "kyb", "kcut", "rail", "liq", "atk2"].forEach(hideG);
      ["#gbA", "#gbB", "#gbC", "#gbD", "#crtA", "#crtB", "#liq2", "#loop"].forEach((s) => tl.set(s, { opacity: 0 }, 0));
      tl.set("#loop", { scaleY: 1 }, 0);

      // ===== 0–1.6 title card → flies into the pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.2);

      // ===== L0 integer division drops the remainder; whose is it?
      pop("#lb-rc", 1.7);
      K6.blade(tl, "rc", ${f(TM.rem0)}, true);
      pop("#lb-rem", ${f(TM.rem0 + 0.3)});
      out("#lb-rc", ${f(TM.who0 - 0.3)});
      pop("#lb-tL", ${f(TM.who0)}); pop("#lb-tR", ${f(TM.who0 + 0.25)});

      // ===== L1 the remainder goes to the protocol, not the caller
      pop("#kw", ${f(TM.rule1)}, 0.35);
      out("#lb-rem", ${f(TM.pro1 - 0.2)});
      K6.chip(tl, "rc", ${f(TM.pro1)}, "L", 0.7);
      swap("#lb-tL", "#lb-tLok", ${f(TM.pro1 + 0.6)});
      swap("#lb-tR", "#lb-tRno", ${f(TM.no1 + 0.1)});
      tl.to("#rc-pileR", { opacity: 0.35, duration: 0.3 }, ${f(TM.no1 + 0.1)});
      K6.blade(tl, "rc", ${f(TM.no1 + 0.6)}, false);

      // ===== L2 ERC-4626 vault: four functions, four directions
      const c2 = ${f(L(2).start - 0.15)};
      out("#kw, #lb-tLok, #lb-tRno", c2, 0.25);
      tl.to("#rc-pileR", { opacity: 1, duration: 0.3 }, c2);
      KIT.cam(tl, c2, CAMS.vault, 1.4);
      pop("#lb-vault", ${f(TM.erc2)});
      KIT.door(tl, "vault", ${f(TM.erc2 + 0.1)}, 105, 1.0);
      pop("#lb-sd", ${f(TM.erc2 + 0.5)});
      grow("user", ${f(TM.four2 - 0.2)}); pop("#lb-user", ${f(TM.four2 + 0.2)});
      term("tcE", ${f(TM.erc4626)}, ${f(TM.dir2 - 0.3)});
      slideIn("#cardC", ${f(TM.dir2)});
      K6.chipReset(tl, "rc", ${f(TM.dir2)});

      // ===== L3 deposit: assets in, shares rounded DOWN (fewer shares)
      rowOn(0, ${f(TM.dep3)});
      out("#lb-sd, #lb-vault", ${f(TM.dep3)});
      fin("#gbA", ${f(TM.give3 - 0.2)}, 0.15);
      carry("gbA", ${f(TM.give3)}, ${f(SD.u + 10 - HAND.u)}, ${f(SD.v + 60 - HAND.v)}, 10, 0.8, 70);
      out("#gbA", ${f(TM.give3 + 0.8)}, 0.1);
      K6.tally(tl, "sd", ${f(TM.take3 - 0.2)}, 0.6, 1000, 1002);
      K6.issue(tl, "sd", ${f(TM.take3)}, 0);
      K6.lever(tl, "rc", ${f(TM.dn3 - 0.3)}, "down"); pop("#lb-lvdn", ${f(TM.dn3 - 0.1)});
      K6.cut(tl, "rc", ${f(TM.dn3 + 0.1)}, "L");
      pop("#lb-plus", ${f(TM.dn3 + 0.8)});
      fin("#cc0-v", ${f(TM.less3)}, 0.2);

      // ===== L4 mint: shares fixed, assets rounded UP (charge more)
      out("#lb-plus", ${f(L(4).start - 0.2)}); rowOff(0, ${f(L(4).start - 0.1)});
      rowOn(1, ${f(TM.mint4)});
      pop("#lb-want3", ${f(TM.spec4)});
      K6.chipReset(tl, "rc", ${f(TM.spec4)});
      out("#lb-lvdn", ${f(TM.pay4)});
      K6.lever(tl, "rc", ${f(TM.up4 - 0.4)}, "up"); pop("#lb-lvup", ${f(TM.up4 - 0.2)});
      fin("#gbB", ${f(TM.up4 - 0.3)}, 0.15);
      carry("gbB", ${f(TM.up4 - 0.1)}, ${f(SD.u + 10 - HAND.u)}, ${f(SD.v + 60 - HAND.v)}, 10, 0.8, 70);
      out("#gbB", ${f(TM.up4 + 0.7)}, 0.1);
      K6.cut(tl, "rc", ${f(TM.up4 + 0.3)}, "L");
      pop("#lb-plus", ${f(TM.up4 + 1.0)});
      fin("#cc1-v", ${f(TM.more4)}, 0.2);
      K6.tally(tl, "sd", ${f(TM.more4)}, 0.6, 1002, 1005);
      K6.issue(tl, "sd", ${f(TM.more4 + 0.2)}, 1);
      out("#lb-want3", ${f(TM.more4 + 0.6)});

      // ===== L5 withdraw: assets fixed, shares rounded UP (burn more)
      out("#lb-plus", ${f(L(5).start - 0.2)}); rowOff(1, ${f(L(5).start - 0.1)});
      rowOn(2, ${f(TM.wd5)});
      pop("#lb-wantA", ${f(TM.spec5)});
      K6.chipReset(tl, "rc", ${f(TM.spec5)});
      fin("#crtA", ${f(TM.up5 - 0.4)}, 0.15);
      carry("crtA", ${f(TM.up5 - 0.2)}, ${f(SD.u + 10 - HAND.u)}, ${f(SD.v + 60 - HAND.v)}, 10, 0.8, 70);
      out("#crtA", ${f(TM.up5 + 0.6)}, 0.1);
      K6.cut(tl, "rc", ${f(TM.up5 + 0.2)}, "L");
      pop("#lb-plus", ${f(TM.up5 + 0.9)});
      fin("#cc2-v", ${f(TM.more5)}, 0.2);
      K6.tally(tl, "sd", ${f(TM.more5)}, 0.6, 1005, 1002);
      fin("#gbC", ${f(TM.more5 + 0.1)}, 0.15);
      carry("gbC", ${f(TM.more5 + 0.2)}, ${f(HAND.u - VOUT.u)}, ${f(HAND.v - VOUT.v)}, -10, 0.9, 60);
      out("#lb-wantA", ${f(TM.more5 + 0.6)});

      // ===== L6 redeem: shares in, assets rounded DOWN (fewer assets)
      out("#lb-plus, #gbC", ${f(L(6).start - 0.2)}); rowOff(2, ${f(L(6).start - 0.1)});
      rowOn(3, ${f(TM.rd6)});
      fin("#crtB", ${f(TM.hand6 - 0.2)}, 0.15);
      carry("crtB", ${f(TM.hand6)}, ${f(SD.u + 10 - HAND.u)}, ${f(SD.v + 60 - HAND.v)}, 10, 0.8, 70);
      out("#crtB", ${f(TM.hand6 + 0.8)}, 0.1);
      K6.tally(tl, "sd", ${f(TM.hand6 + 0.8)}, 0.5, 1002, 1001);
      fin("#gbD", ${f(TM.take6 - 0.1)}, 0.15);
      carry("gbD", ${f(TM.take6)}, ${f(HAND.u - VOUT.u)}, ${f(HAND.v - VOUT.v)}, -10, 0.9, 60);
      K6.chipReset(tl, "rc", ${f(TM.take6)});
      out("#lb-lvup", ${f(TM.dn6 - 0.4)});
      K6.lever(tl, "rc", ${f(TM.dn6 - 0.3)}, "down"); pop("#lb-lvdn", ${f(TM.dn6 - 0.1)});
      K6.cut(tl, "rc", ${f(TM.dn6 + 0.1)}, "L");
      pop("#lb-plus", ${f(TM.dn6 + 0.8)});
      fin("#cc3-v", ${f(TM.less6)}, 0.2);

      // ===== L7 one line: what goes out rounds down, what comes in rounds up
      out("#lb-plus, #gbD", ${f(L(7).start - 0.2)}); rowOff(3, ${f(L(7).start - 0.1)});
      [0, 1, 2, 3].forEach((i) => tl.to("#cc" + i + "-bar", { opacity: 1, duration: 0.2 }, ${f(TM.out7)}));
      out("#ccFoot", ${f(TM.out7 - 0.1)}, 0.15);
      pop("#ccFoot2", ${f(TM.out7)}, 0.3);

      // ===== L8 wrong direction → round-trip arbitrage
      const c8 = ${f(L(8).start - 0.2)};
      slideOut("#cardC", c8);
      out("#lb-lvdn, #lb-user", c8);
      shrink("user", c8);
      KIT.cam(tl, c8, CAMS.loop, 1.2);
      grow("atk", ${f(TM.rev8 + 0.1)}); pop("#lb-atk", ${f(TM.rev8 + 0.4)});
      K6.lever(tl, "rc", ${f(TM.rev8 + 0.3)}, "up");
      pop("#lb-wrong", ${f(TM.rev8 + 0.5)});
      fin("#loop", ${f(TM.rt8 - 0.1)}, 0.4);
      pop("#lb-rt", ${f(TM.rt8)});
      K6.chipReset(tl, "rc", ${f(TM.rt8)});

      // ===== L9 mint 1 → redeem 1, each lap +1 unit for the caller
      out("#lb-atk", ${f(TM.mint9 - 0.2)});
      pop("#lb-mint", ${f(TM.mint9)});
      K6.cut(tl, "rc", ${f(TM.mint9 + 0.3)}, "R");
      swap("#lb-mint", "#lb-redeem", ${f(TM.rd9)});
      K6.chipReset(tl, "rc", ${f(TM.rd9)});
      K6.cut(tl, "rc", ${f(TM.rd9 + 0.2)}, "R");
      swap("#lb-redeem", "#lb-mint", ${f(TM.net9 - 0.3)});
      K6.chipReset(tl, "rc", ${f(TM.net9 - 0.3)});
      K6.cut(tl, "rc", ${f(TM.net9)}, "R");
      pop("#lb-net", ${f(TM.net9 + 0.2)});
      K6.chipReset(tl, "rc", ${f(TM.net9 + 1.1)}); K6.cut(tl, "rc", ${f(TM.net9 + 1.3)}, "R");
      K6.chipReset(tl, "rc", ${f(TM.net9 + 2.4)}); K6.cut(tl, "rc", ${f(TM.net9 + 2.6)}, "R");

      // ===== L10 tiny once, but without fees it loops a thousand times
      out("#lb-mint, #lb-net", ${f(TM.small10 - 0.2)});
      K6.chipReset(tl, "rc", ${f(TM.small10 - 0.1)});
      pop("#lb-once", ${f(TM.small10)});
      grow("rcntp", ${f(TM.fee10 - 0.5)}); grow("rcnt", ${f(TM.fee10 - 0.4)}); pop("#lb-cnt", ${f(TM.fee10 - 0.1)});
      pop("#lb-nofee", ${f(TM.fee10)});
      out("#lb-once", ${f(TM.fee10 + 0.4)});
      KIT.count(tl, "rcnt", ${f(TM.fee10)}, ${f(TM.k10 + 0.8 - TM.fee10)}, 0, 1000, "power2.in");
      K6.pile(tl, "rc", "R", ${f(TM.fee10 + 0.3)}, 9);
      heapTo(0, ${Math.round(heap.n * 0.4)}, ${f(TM.fee10 + 0.2)}, ${f(TM.k10 + 0.8 - TM.fee10)});

      // ===== L11 metaphor: pizza by the slice, 8 slices
      const c11 = ${f(L(11).start - 0.2)};
      out("#lb-wrong, #lb-rt, #lb-nofee, #lb-cnt, #loop", c11); shrink("atk", c11);
      pop("#meta", ${f(TM.meta11)}, 0.3);
      KIT.cam(tl, c11, CAMS.pizza, 1.5);
      ["pctr", "pz", "clerk", "cust", "pick"].forEach((id, k) => grow(id, ${f(TM.meta11 + 0.2)} + k * 0.12));
      pop("#lb-pz", ${f(TM.eight11)});

      // ===== L12 pay for 1/3 of a pizza → 2 or 3 slices?
      pop("#lb-pay", ${f(TM.third12)});
      out("#lb-pz", ${f(TM.dec12 - 0.2)});
      pop("#lb-div", ${f(TM.dec12)});
      pop("#lb-2", ${f(TM.two12)}); pop("#lb-3", ${f(TM.three12)});

      // ===== L13 always round up → the clever customer keeps buying 1/3
      out("#lb-div, #lb-2", ${f(TM.more13 - 0.2)});
      tl.to("#lb-3", { borderColor: "#e0453a", color: "#c3352b", duration: 0.2 }, ${f(TM.more13)});
      const S = ${JSON.stringify(A.pz.slices)};
      const custP = ${JSON.stringify(at(LY.CUST, 0, 0, 0))};
      const give = (i, t, k) => { carry("pz-s-" + i, t, ${f(PICK.u - LY.PIZ.u)} - 30 + (k % 3) * 26, ${f(PICK.v - LY.PIZ.v)} - 16 + (k % 3) * 8, -14 + Math.floor(k / 3) * 7, 0.7, 50); };
      [0, 1, 2].forEach((i, k) => give(i, ${f(TM.more13 + 0.2)} + k * 0.12, k));
      out("#lb-pay, #lb-3", ${f(TM.more13 + 0.6)});
      pop("#lb-give3", ${f(TM.more13 + 0.9)});
      [3, 4, 5].forEach((i, k) => give(i, ${f(TM.again13)} + k * 0.12, k + 3));
      swap("#lb-give3", "#lb-tally", ${f(TM.again13 + 0.8)});

      // ===== L14 where the metaphor breaks: the shop gets complaints
      out("#lb-tally", ${f(TM.no14 - 0.3)}, 0.2);
      pop("#nohold", ${f(TM.no14 - 0.1)}, 0.35);
      grow("cmpl", ${f(TM.cmpl14 - 0.2)}); pop("#lb-cmpl", ${f(TM.cmpl14)});

      // ===== L15 in a contract, +1 wei repeats thousands of times inside one transaction (key frame)
      const c15 = ${f(L(15).start - 0.2)};
      out("#nohold, #meta, #lb-tally, #lb-cmpl", c15, 0.25);
      KIT.cam(tl, c15, CAMS.frame, 1.4);
      pop("#lb-wei", ${f(TM.wei15)});
      fin("#cube-bk", ${f(TM.wei15 - 0.3)}, 0.4); fin("#cube", ${f(TM.wei15 - 0.3)}, 0.4);
      pop("#lb-tx", ${f(TM.wei15)});
      for (let i = 0; i < 12; i++) { const t0 = ${f(TM.tx15 + 0.3)} + i * 0.34; K6.blade(tl, "rc", t0, true, 0.1); K6.blade(tl, "rc", t0 + 0.12, false, 0.16); }
      swap("#lb-cnt", "#lb-k", ${f(TM.k15)});
      KIT.count(tl, "rcnt", ${f(TM.tx15 + 0.3)}, 4.0, 1000, 4096, "power1.in");
      heapTo(${Math.round(heap.n * 0.4)}, ${Math.round(heap.n * 0.85)}, ${f(TM.tx15 + 0.3)}, 3.6);

      term("tcW", ${f(TM.wei15 + 0.3)}, ${f(Math.min(TM.wei15 + 3.9, L(16).start - 0.1))});
      // ===== L16 back to Balancer — public analysis: inside the stable pool's batch swap
      const c16 = ${f(L(16).start - 0.2)};
      out("#lb-wei, #lb-tx, #lb-k", c16);
      KIT.cam(tl, c16, CAMS.bal, 1.8);
      pop("#evBal", ${f(TM.bal16)}, 0.35);
      tl.set("#evPub", { opacity: 0 }, 0); pop("#evPub", ${f(TM.pub16)});
      pop("#lb-pool", ${f(TM.pub16 + 0.6)});
      pop("#lb-sort", ${f(TM.batch16)});
      grow("atk2", ${f(TM.batch16 + 0.4)}); pop("#lb-atk2", ${f(TM.batch16 + 0.8)});

      // ===== L17 chained small swaps, each rounding accumulates toward the attacker
      out("#lb-sort", ${f(TM.small17 - 0.2)}); pop("#lb-small", ${f(TM.small17)});
      const lt0 = ${JSON.stringify(A.lt0.center)}, blk = ${JSON.stringify(A.sort.blockIn ?? A.sort.block)};
      ${JSON.stringify([0, 1, 2, 3, 4, 5])}.forEach((i) => {
        const t0 = ${f(TM.chain17)} + i * 0.7;
        K1.walk(tl, "lt" + i, t0, 1.6 + i * 0.05, [[blk[0], blk[1]]], "power1.inOut");
        tl.to("#lt" + i, { opacity: 0, duration: 0.15 }, t0 + 1.55 + i * 0.05);
      });
      K1.dash(tl, ["sort-belt-0", "sort-belt-1"], ${f(TM.chain17)}, 5.0, -400);
      K6.cuts(tl, "mini", ${f(TM.chain17 + 0.3)}, "R", 5, 0.95);
      pop("#lb-mini", ${f(TM.acc17)});

      // ===== L18 invariant and share price are manipulated
      term("tcI", ${f(TM.inv18)}, ${f(Math.min(TM.inv18 + 3.6, TM.usd19 - 0.35))});
      out("#lb-small", ${f(L(18).start - 0.1)});
      pop("#lb-bal", ${f(TM.inv18)});
      K1.tilt(tl, "bal", ${f(TM.inv18 + 0.2)}, -16, 1.0);
      pop("#pcol", ${f(TM.px18)});
      for (let i = 3; i < 8; i++) tl.to("#pc" + i, { opacity: 1, duration: 0.12 }, ${f(TM.px18 + 0.3)} + (i - 3) * 0.14);
      tl.set(".pcd", { className: "pcd red" }, ${f(TM.man18)});
      swap("#lb-bal", "#lb-manip", ${f(TM.man18)});
      KIT.broke(tl, "bal", ${f(TM.man18 + 0.1)}, { ghost: 1, badge: false });

      // ===== L19 ~$94.8M (official post-mortem, value at the time, Balancer-deployed pools only)
      pop("#evAmt", ${f(TM.usd19 - 0.1)}, 0.3); out("#lb-pool", ${f(TM.usd19 - 0.2)}); pop("#amtA", ${f(TM.usd19 - 0.1)}, 0.3);
      tl.set("#tgA2, #tgA3", { opacity: 0 }, 0);
      pop("#tgA2", ${f(TM.val19)}); pop("#tgA3", ${f(TM.only19)});

      // ===== L20 ~$128M (early third-party analysis) — cite the basis
      pop("#evDiv", ${f(TM.third20 - 0.2)});
      pop("#amtB", ${f(TM.third20)}, 0.3);
      pop("#evCite", ${f(TM.cite20 - 1.6)});

      // ===== L21 KyberSwap Elastic, Nov 2023
      const c21 = ${f(L(21).start - 0.2)};
      out("#lb-mini, #lb-manip, #pcol, #lb-atk2", c21, 0.25);
      KIT.cam(tl, c21, CAMS.kyb, 1.8);
      out("#evBal, #evAmt", ${f(TM.y21 - 0.3)}, 0.25); pop("#evKyb", ${f(TM.y21)}, 0.35);
      ["kyb", "kcut", "rail", "liq"].forEach((id, k) => grow(id, c21 + 0.6 + k * 0.15));
      pop("#lb-kyb", ${f(TM.kyb21)});

      // ===== L22 should round up, written as round down
      pop("#lb-should", ${f(TM.up22)});
      K6.lever(tl, "kcut", ${f(TM.dn22 - 0.1)}, "down");
      pop("#lb-actual", ${f(TM.dn22 + 0.2)});
      KIT.broke(tl, "kcut", ${f(TM.dn22 + 0.4)}, { ghost: 1, badge: false });

      // ===== L23 pool misjudges the tick crossing → the same liquidity counted twice
      term("tcT", ${f(TM.tick23)}, ${f(Math.min(TM.tick23 + 3.6, TM.usd24 - 0.6))});
      pop("#lb-tick", ${f(TM.mis23 - 0.2)}); pop("#lb-price", ${f(TM.mis23 - 0.1)});
      out("#lb-price", ${f(TM.tick23 + 0.2)});
      K6.carry(tl, "rail-cur", ${f(TM.tick23 - 0.3)}, 190, 0, 0, 1.0, 0, "power2.inOut");
      pop("#lb-nocross", ${f(TM.tick23 + 0.6)});
      fin("#liq2", ${f(TM.two23 - 0.4)}, 0.3);
      pop("#lb-twice", ${f(TM.two23)});

      // ===== L24 official post-mortem: affected assets ~$56.2M
      pop("#evKA", ${f(TM.usd24 - 0.4)}, 0.3);

      // ===== L25 single-step test: negligible
      const c25 = ${f(L(25).start - 0.2)};
      out("#evKyb, #evKA, #lb-kyb, #lb-should, #lb-actual, #lb-tick, #lb-nocross, #lb-twice", c25, 0.25);
      KIT.cam(tl, c25, CAMS.mag, 1.6);
      tl.set("#cube-bk, #cube", { opacity: 0 }, c25);
      K6.chipReset(tl, "rc", c25);
      grow("mag", ${f(TM.one25)}, 0.4);
      K6.cut(tl, "rc", ${f(TM.one25 + 0.1)}, "R");
      pop("#lb-single", ${f(TM.one25 + 0.5)});

      // ===== L26 batched / looped paths amplify it
      out("#lb-single", ${f(L(26).start - 0.1)});
      shrink("mag", ${f(L(26).start - 0.1)});
      KIT.cam(tl, ${f(L(26).start - 0.1)}, CAMS.wide, 1.4);
      heapTo(${Math.round(heap.n * 0.85)}, ${heap.n}, ${f(TM.batch26)}, 0.8);
      { const g = $("heap"); tl.to("#heap", { scale: 1.7, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy"), duration: 1.4, ease: "power2.inOut" }, ${f(TM.batch26)}); }
      pop("#lb-amp", ${f(TM.batch26 + 0.4)});

      // ===== L27 fuzz: repeat the same operation N times
      out("#lb-amp", ${f(TM.n27 - 0.3)});
      pop("#lb-N", ${f(TM.n27)});
      out("#lb-k", ${f(TM.n27)}, 0.1);
      KIT.count(tl, "rcnt", ${f(TM.n27)}, 2.4, 0, 9999, "power1.in");
      grow("desk", ${f(L(27).start)}); pop("#lb-desk", ${f(TM.fuzz27)});
      term("tcF", ${f(TM.fuzz27)}, null);
      [1, 2, 3].forEach((i) => tl.to("#dk-l" + i, { opacity: 1, duration: 0.1 }, ${f(TM.fuzz27)} + i * 0.3));
      KIT.swap(tl, "#desk-scr", "#desk-scr2", ${f(TM.fuzz27 + 1.3)}, 0.2);
      pop("#lb-cex", ${f(TM.fuzz27 + 1.4)});
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL, "heap", heap.n);
