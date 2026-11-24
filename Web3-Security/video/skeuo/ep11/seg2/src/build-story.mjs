// ep11/seg2「② 偿付不变量」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.A（BRIEF 第 2 节镜头路线）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   donate       近景：入口面板（捐赠按钮）+ 借贷合约（seg1 起点 L0–L2、L4、L11–L12；seg5 L3–L4；seg6 L2、L5–L6）
//   balance      近景：天平 + 点阵 + 坏账框 + 两台清算机器人（seg1 L3、L6–L10；seg2 L0–L10；seg6 L1、L7）
//   A            A 借贷大厅中景：售货机 + 入口 + 天平 + 储备 + 坏账框（seg1 终点 L13、seg2 起点、seg2 L11–L12、seg6 结束前回到 A）
//   B            B 清算市场全景（seg2 L13、seg2 终点 L23 供应上限牌、seg3 起点）
//   xvs          近景：XVS + 供应上限 / 抵押率牌 + 价格曲线 + 反身性环（seg2 L17–L23；seg5 L5）
//   liq          近景：价格曲线 + 预言机 / 延迟 + 卖不出的摊位 + 三台清算机器人 + 红点坏账（seg2 L14–L16、L20；seg5 L6）
//   C            C 治理议事厅全景（seg3 L1–L2、L8 一笔交易大框、L10–L11）
//   vote         近景：快照相机 + 投票箱 + 门限表 + 提案 + 1 天沙漏（seg3 L3–L7、L13）
//   guard        近景：门限表 → 时间锁 → 国库 + 守护者否决 + 提案 / 锁 / 重新计时（seg3 L14–L15）
//   reward       C 前排奖励站（seg3 L16–L20；seg3 终点、seg4 起点）
//   Cwide        C 议事厅 + 奖励站远景（seg3 L0 从 B 移过来、seg5 L10 带过快照相机和时间锁）
//   D            D 铸币厂全景：铸币机 + 储备 + 下游三路（seg4 L0、L19 终点；seg5 起点）
//   offchain     近景：链下储备 / 硅谷银行 + 铸币机 + 提货单 / 作废章 + 链下管理人（seg4 L1–L10、L15）
//   mint         近景：铸币机钥匙面板 + 1/3 门限表 + 红钥匙 + USDC / USR（seg4 L11–L14；seg5 L7–L8）
//   market       近景：DEX 池 + 三个交易所摊位 + USDC 价格 + 下游借贷协议（seg4 L9、L16–L18；seg5 L9）
//   E            E 赎回窗口全景（seg5 L11–L12、L16–L17 终点；seg6 起点 L0）
//   queue        近景：赎回队列 + 8 小时时间锁 + 暂停闸刀 + 警报灯 + 团队（seg5 L13–L15）
//   world        全景：所有区（seg5 L0–L2 从 D 拉远、seg6 L8 结束卡前拉远）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f, ZONE } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.B

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E5, E8, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const P = (X0, Y0, extra = {}) => ({ ...G(X0, Y0), ...extra });   // world point at canvas px
const off = (p, dx, dy) => [p[0] + dx, p[1] + dy];

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// A 借贷大厅（seg1 末尾状态：天平右沉、红色坏账点阵）
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm", sign: "借贷合约" }));
put("panel", L.PANEL, E5.funcPanel(L.PANEL, { id: "panel", title: "入口",
  buttons: ["存入", "借款", "取出", "捐赠"].map((name, i) => ({ name, guard: i === 3 ? "broken" : "card" })) }));
put("bal", L.BAL, E1.balance(L.BAL, { id: "bal", tilt: -16 }));
put("res", L.RESERVE, O.safe(L.RESERVE, { id: "res", gold: true }));
put("pbal", L.APIPE.bal.o, E1.pipe(L.APIPE.bal.o, { id: "pbal", pts: L.APIPE.bal.pts }));
put("pres", L.APIPE.reserve.o, E1.pipe(L.APIPE.reserve.o, { id: "pres", pts: L.APIPE.reserve.pts }));
put("borrower", L.BORROWER, O.person(L.BORROWER, { id: "borrower", role: "signer" }));
put("liqB", L.LIQUIDATOR, O.person(L.LIQUIDATOR, { id: "liqB", role: "attacker" }), 0, { grow: true });
put("aliq0", L.ALIQ[0], E8.liqBot(L.ALIQ[0], { id: "aliq0", scr: "还债" }));
put("aliq1", L.ALIQ[1], E8.liqBot(L.ALIQ[1], { id: "aliq1", scr: "清算" }));
const DEP = [0, 1, 2, 3, 4].map((i) => P(600 + i * 60, -330 + i * 25, { scale: 0.5 }));
DEP.forEach((q, i) => put("dep" + i, q, O.person(q, { id: "dep" + i, role: "signer", scale: 0.5 }), 0, { grow: true }));
// B 清算市场
put("xvs", L.XVS, E1.miniVend(L.XVS, { id: "xvs", kind: "token", label: "XVS", scale: 0.8 }));
put("cap", L.CAP, E1.signBoard(L.CAP, { id: "cap", style: "plate", text: "供应上限", size: 34, glow: true }), 0, { grow: true });
put("rate", L.RATE, E1.signBoard(L.RATE, { id: "rate", style: "plate", text: "抵押率 ↓", size: 34, glow: true }), 0, { grow: true });
put("price", L.PRICE, E8.twapRecorder(L.PRICE, { id: "price", avg: "76" }));
put("oracle", L.ORACLE, E1.miniVend(L.ORACLE, { id: "oracle", kind: "oracle", label: "预言机", scale: 0.6 }));
put("ohour", L.OHOUR, O.hourglass(L.OHOUR, { id: "ohour" }));
put("cpool", L.CPOOL, E8.ammPool(L.CPOOL, { id: "cpool", scale: 0.8 }));
put("stall0", L.STALLS[0], E8.marketStall(L.STALLS[0], { id: "stall0", scale: 0.7, head: "收购价", price: "?" }));
put("stall1", L.STALLS[1], E8.marketStall(L.STALLS[1], { id: "stall1", scale: 0.7, head: "收购价", price: "—", gold: 0, lamp: false }));
L.BLIQ.forEach((q, i) => put("bliq" + i, q, E8.liqBot(q, { id: "bliq" + i, scale: 0.8, open: true, scr: "$" })));

// 原生 SVG：点阵、坏账框、尺子、搬走的硬币、反身性环、红点坏账
const dot = (x, y, c, r = 4.5) => `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${c}"/>`;
const [dX, dY] = Wp(L.DOTS.u, L.DOTS.v);
const gDots = [], iDots = [], rDots = [];
for (let k = 0; k < 70; k++) gDots.push(dot(dX + 30 + (k % 10) * 13, dY + 22 + Math.floor(k / 10) * 13, "#1f9d55"));
for (let k = 0; k < 90; k++) (k >= 70 ? rDots : iDots).push(dot(dX + 230 + (k % 10) * 13, dY + 14 + Math.floor(k / 10) * 13, k >= 70 ? "#e0453a" : "#1c1c1c"));
add(L.DOTS, `<g id="dots">${gDots.join("")}${iDots.join("")}<g id="dots-red">${rDots.join("")}</g></g>`, 0);
const [bX, bY] = Wp(L.BADA.u, L.BADA.v);
add(L.BADA, `<g id="badbox"><rect x="${f(bX - 90)}" y="${f(bY - 20)}" width="240" height="90" rx="8" fill="rgba(224,69,58,.06)" stroke="#e0453a" stroke-width="3" stroke-dasharray="10 7"/><text x="${f(bX + 30)}" y="${f(bY + 36)}" text-anchor="middle" font-size="30" font-weight="700" fill="#e0453a">坏账</text></g>`, 0);
const pL = A.bal.panL;
add(L.BAL, S.hid("ruler", `<rect x="${f(pL[0] - 70)}" y="${f(pL[1] - 10)}" width="140" height="16" rx="4" fill="#2aa3c9" stroke="#1d93ba" stroke-width="2"/>` +
  [0, 1, 2, 3, 4, 5, 6].map((k) => `<line x1="${f(pL[0] - 60 + k * 20)}" y1="${f(pL[1] - 10)}" x2="${f(pL[0] - 60 + k * 20)}" y2="${f(pL[1] - 2)}" stroke="#fff" stroke-width="2"/>`).join("")), 200);
const [lX, lY] = Wp(L.LIQUIDATOR.u, L.LIQUIDATOR.v);
const PILE = [lX - 90, lY + 20];
const coins = (cx, cy, n, c) => Array.from({ length: n }, (_, k) => `<ellipse cx="${f(cx + (k % 4) * 12 - 18)}" cy="${f(cy - Math.floor(k / 4) * 7)}" rx="10" ry="5" fill="${c}" stroke="#8a6d10" stroke-width="1.2"/>`).join("");
add(L.BAL, S.hid("haul", coins(pL[0], pL[1] + 30, 12, "#d4a62a")), 220);
const RS = Wp(L.RESERVE.u, L.RESERVE.v);
add(L.RESERVE, S.hid("resgap", `<rect x="${f(RS[0] - 120)}" y="${f(RS[1] - 300)}" width="240" height="110" rx="8" fill="rgba(224,69,58,.08)" stroke="#e0453a" stroke-width="3" stroke-dasharray="10 7"/>`), 300);
const XT = A.xvs.tray ?? A.xvs.front;
add(L.XVS, S.hid("loot", coins(XT[0] - 20, XT[1] + 30, 8, "#d4a62a") + coins(XT[0] + 40, XT[1] + 40, 8, "#6b7a99").replaceAll("#8a6d10", "#3c4660")), 120);
const [rX, rY] = Wp(L.RING.u, L.RING.v), RX = 150, RY = 92;
const ep = (a) => [rX + RX * Math.cos(a * Math.PI / 180), rY + RY * Math.sin(a * Math.PI / 180)];
const arc = (i, c) => {
  const a0 = -90 + i * 90 + 10, a1 = a0 + 70, [x0, y0] = ep(a0), [x1, y1] = ep(a1);
  const r = a1 * Math.PI / 180, tx = -RX * Math.sin(r), ty = RY * Math.cos(r), n = Math.hypot(tx, ty), ux = tx / n, uy = ty / n;
  const head = `${f(x1 + ux * 16)},${f(y1 + uy * 16)} ${f(x1 - uy * 9)},${f(y1 + ux * 9)} ${f(x1 + uy * 9)},${f(y1 - ux * 9)}`;
  return S.hid("arc" + i, `<path d="M${f(x0)} ${f(y0)} A${RX} ${RY} 0 0 1 ${f(x1)} ${f(y1)}" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/><polygon points="${head}" fill="${c}"/>`);
};
add(L.RING, [0, 1, 2].map((i) => arc(i, "#2aa3c9")).join("") + arc(3, "#e0453a"), 0);
const [kX, kY] = Wp(L.BADB.u, L.BADB.v), bb = [];
for (let k = 0; k < 60; k++) bb.push(dot(kX - 78 + (k % 15) * 14, kY - 18 + Math.floor(k / 15) * 14, "#e0453a", 5));
add(L.BADB, S.hid("badB", bb.join("")), 0);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-panL", up(A.bal.panL, 70), "抵押品 × 阈值", "lab-cs lab-sm");
lb("lb-panR", up(A.bal.panR, 70), "借款", "lab-ink lab-sm");
lb("lb-th", off(pL, -80, -6), "清算阈值", "lab-cs lab-sm", "r");
lb("lb-hf", up(A.bal.top, 20), "健康因子", "lab-cs");
lb("lb-safe", up(A.bal.top, 20), "HF &gt; 1 · 安全", "lab-g");
lb("lb-liq", up(A.bal.top, 20), "HF &lt; 1 · 可被清算", "lab-r");
lb("lb-repay", up(A.aliq0.top, 10), "替账户还债", "lab-cs lab-sm");
lb("lb-take", off(A.aliq1.claw, 0, 24), "折扣拿走抵押品", "lab-cs lab-sm", "t");
lb("lb-fee", off(A.aliq1.claw, 0, 24), "折扣 = 报酬", "lab-g lab-sm", "t");
lb("lb-disc", off(A.aliq1.claw, 0, 24), "折扣", "lab-r", "t");
lb("lb-A", up(A.borrower.top, 10), "账户 A", "lab-ink lab-sm");
lb("lb-B", up(A.liqB.top, 10), "账户 B", "lab-r lab-sm");
lb("lb-same", [(A.borrower.top[0] + A.liqB.top[0]) / 2, Math.min(A.borrower.top[1], A.liqB.top[1]) - 150], "同一方", "lab-r lab-sm");
lb("lb-profit", off(PILE, 0, 40), "坏账 → 利润", "lab-r", "t");
lb("lb-dep", up(A.dep2.top, 14), "存款人", "lab-ink lab-sm");
lb("lb-inv", up(A.res.top, 10), "资产 ≥ 债权", "lab-cs");
lb("lb-resbad", [RS[0], RS[1] - 245], "坏账", "lab-r", "c");
lb("lb-drop", up(A.price.top, 10), "价格暴跌", "lab-r lab-sm");
lb("lb-lag", up(A.ohour.top, 10), "预言机延迟", "lab-r lab-sm");
lb("lb-late", off(A.bliq2.ground, 30, 4), "清算来不及", "lab-r lab-sm", "l");
lb("lb-gas", up(A.bliq1.top, 12), "gas", "lab-r lab-sm", "r");
lb("lb-slip", up(A.bliq1.top, 12), "滑点", "lab-r lab-sm", "l");
lb("lb-cheap", up(A.stall0.top, 10), "卖不出好价钱", "lab-r lab-sm");
lb("lb-xvs", up(A.xvs.top, 10), "自家治理代币 → 抵押品", "lab-cs lab-sm");
lb("lb-76", up(A.price.top, 10), "约 76 美元", "lab-ink");
lb("lb-144", up(A.price.top, 10), "约 144 美元", "lab-r");
lb("lb-loot", off(XT, 10, 70), "借走 BTC · ETH", "lab-ink lab-sm", "t");
lb("lb-liq2", up(A.bliq1.top, 14), "清算约 2 亿美元以上", "lab-cs lab-sm");
lb("lb-bad2", off([kX, kY], 30, 50), "坏账约 9500 万美元以上", "lab-r lab-sm", "t");
const rl = [["价格上涨", ep(-45), "l"], ["借款增加", ep(45), "l"], ["卖压增加", ep(135), "r"], ["价格下跌", ep(225), "r"]];
rl.forEach(([txt, p, an], i) => lb("lb-r" + i, off(p, an === "l" ? 14 : -14, 0), txt, i === 3 ? "lab-r lab-sm" : "lab-cs lab-sm", an));
lb("lb-bad3", off([kX, kY], 30, 50), "坏账出现", "lab-r", "t");

// ---------------------------------------------------------------- 屏幕层卡片
const CB = { x: 60, y: 300, w: 470 };
const card = codeCard("cb", { ...CB, head: "偿付不变量", tag: "示意", mono: true, rows: [
  `<span id="hfw" class="hfw">HF</span> = Σ(抵押×阈值)/Σ(借款)`,
  `HF &lt; 1  →  可被清算`,
  `Σ(所有资产) ≥ Σ(存款人债权)`,
] });
S.curve("cv-bal", [CB.x + CB.w + 4, codeRowY(CB.y, 0)], S.scr("balance", up(A.bal.top, -40)), { color: "#e0453a" });
S.curve("cv-res", [CB.x + CB.w + 4, codeRowY(CB.y, 2)], S.scr("A", off(RS, -100, -200)), { color: "#e0453a" });
S.curve("cv-same", S.scr("balance", up(A.borrower.top, 40)), S.scr("balance", up(A.liqB.top, 40)), { color: "#e0453a", c1: S.scr("balance", up(A.borrower.top, 200)), c2: S.scr("balance", up(A.liqB.top, 200)) });
S.curve("cv-profit", S.scr("balance", [bX + 150, bY + 25]), S.scr("balance", off(PILE, -30, 10)), { color: "#e0453a" });
S.curve("cv-xvs", S.scr("xvs", off(XT, 0, 40)), off(S.scr("xvs", off(XT, 0, 40)), -60, 150), { color: "#2aa3c9" });
S.curve("cv-ring", S.scr("xvs", ep(200)), S.scr("xvs", [kX - 90, kY]), { color: "#e0453a", c1: S.scr("xvs", [rX - RX - 40, rY - 160]), c2: S.scr("xvs", [kX - 160, kY - 120]) });
const html = card +
  `<div id="g-exact" class="gnote hide" style="left:1300px;top:330px">${gtag("准确说法")} 偿付不变量</div>` +
  evt("ev-euler", "Omniscia 复盘 · BlockSec 分析") +
  kw("kw-notatk", "坏账 <b>不一定</b> 来自攻击", { x: 700, y: 150, size: 40, accent: "#e0453a" }) +
  evt("ev-venus", "Venus · 2021 年 5 月 · BNB Chain", { top: ZONE.event.top + 6 }) +
  evt("ev-block", "The Block 报道", { top: ZONE.event.top + 12 }) +
  `<div id="g-claim" class="gnote hide" style="left:1290px;top:340px">${gtag("项目方称")} 价格可能被操纵</div>`;
const css = `.hfw{border-radius:5px;padding:0 3px}
.gnote{position:absolute;background:#fff;border-radius:12px;padding:10px 16px;font-size:28px;color:#1c1c1c;box-shadow:0 4px 14px rgba(0,0,0,.08)}`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  th: w("清算阈值", 2), hf: w("健康因子", 3), lt: w("小于", 4), repay: w("偿还", 5), take: w("拿走", 5),
  bad: w("坏账", 10), crash: w("暴跌", 14), lag: w("延迟", 14), late: w("来不及", 14), reward: w("奖励", 15), slip: w("滑点", 15),
  up: w("涨到", 18), liq: w("清算金额", 20), bad20: w("坏账", 20),
  r0: w("价格上涨", 22), r1: w("借款增加", 22), r2: w("卖压增加", 22), r3: w("价格下跌", 22), r4: w("坏账出现", 22),
  cap: w("供应上限", 23), rate: w("抵押率", 23),
};
const t = (x) => f(x);

S.build({
  cam0: "A", sub: "抵押打折以后要盖住借款",
  grid: { u0: -3000, u1: 4800, v0: -5400, v1: 2900 }, box: [-2400, -2800, 4800, 4000],   // A + B 两区所有镜头（并集约 X −1974..1898, Y −2353..862）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "预言机", d: "把链外价格报给合约的服务", at: w("预言机", 14) },
    { id: "t1", t: "滑点", d: "成交价偏离预期报价的幅度", at: w("滑点", 15) },
    { id: "t2", t: "治理代币", d: "持有者能投票决定协议规则的代币", at: w("治理代币", 17) },
    { id: "t3", t: "抵押率", d: "每 1 美元抵押品最多能借多少", at: LS[23] + 1.6 },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先给准确的说法。
      cam(${t(LS[0])}, "balance", 1.4); pop("#g-exact", ${t(LS[0] + 0.6)});
      // ===== L1 借贷协议靠一条不变量运转：每个账户的抵押品，打折以后，要盖得住借款。
      pop("#cb", ${t(LS[1] + 0.2)}); out("#g-exact", ${t(LS[1] + 1.4)});
      X1.tilt(tl, "bal", ${t(LS[1] + 0.4)}, 6); out("#dots-red, #badbox", ${t(LS[1] + 0.4)});
      draw("cv-bal", ${t(LS[1] + 1.2)}); pop("#lb-panL", ${t(LS[1] + 2.6)}); pop("#lb-panR", ${t(LS[1] + 3.0)});
      // ===== L2 打折的比例，叫清算阈值。
      fadeIn("#ruler", ${t(TM.th)}, 0.4); pop("#lb-th", ${t(TM.th + 0.3)});
      // ===== L3 抵押品价值乘以清算阈值，再除以借款，就是健康因子。
      tl.to("#hfw", { boxShadow: "0 0 0 3px #2aa3c9", backgroundColor: "rgba(42,163,201,.15)", duration: 0.3 }, ${t(TM.hf)});
      out("#lb-th", ${t(LS[3] + 3.6)}); pop("#lb-hf", ${t(TM.hf + 0.2)});
      // ===== L4 健康因子大于 1，账户安全。小于 1，任何人都可以清算它。
      out("#lb-hf, #ruler", ${t(LS[4] - 0.1)}); X1.tilt(tl, "bal", ${t(LS[4] + 0.2)}, 12); pop("#lb-safe", ${t(LS[4] + 0.6)});
      out("#lb-safe", ${t(TM.lt - 0.2)}); X1.tilt(tl, "bal", ${t(TM.lt)}, -14); pop("#lb-liq", ${t(TM.lt + 0.4)}); hot("#cb-r1", ${t(TM.lt + 0.3)});
      // ===== L5 清算，是第三方替账户偿还债务，再以折扣拿走抵押品。
      out("#lb-liq", ${t(LS[5] - 0.1)}); X8.botLamp(tl, "aliq0", ${t(LS[5] + 0.2)}); X8.botLamp(tl, "aliq1", ${t(LS[5] + 0.4)});
      pop("#lb-repay", ${t(TM.repay)}); X8.grab(tl, "aliq1", ${t(TM.take)}); pop("#lb-take", ${t(TM.take + 0.3)});
      // ===== L6 折扣，是给清算人的报酬。
      out("#lb-take, #lb-repay", ${t(LS[6] - 0.2)}); pop("#lb-fee", ${t(LS[6] + 0.3)});
      // ===== L7 回到 Euler。按 Omniscia 和 BlockSec 的复盘，捐赠以后，账户已经资不抵债。
      out("#lb-fee, #lb-panL, #lb-panR", ${t(LS[7] - 0.2)}); pop("#ev-euler", ${t(LS[7] + 0.3)});
      X1.tilt(tl, "bal", ${t(LS[7] + 1.2)}, -16); fadeIn("#dots-red, #badbox", ${t(LS[7] + 1.4)}, 0.5);
      // ===== L8 而 Euler 的清算折扣，会随资不抵债的程度变大。
      pop("#lb-disc", ${t(LS[8] + 0.3)});
      X1.tilt(tl, "bal", ${t(LS[8] + 1.3)}, -19); tl.to("#lb-disc", { scale: 1.3, duration: 0.3 }, ${t(LS[8] + 1.3)});
      X1.tilt(tl, "bal", ${t(LS[8] + 2.7)}, -22); tl.to("#lb-disc", { scale: 1.6, duration: 0.3 }, ${t(LS[8] + 2.7)});
      // ===== L9 攻击者用另一个账户来清算它，以很大的折扣拿走抵押品。
      out("#ev-euler, #cb, #cv-bal", ${t(LS[9] - 0.2)}); grow("liqB", ${t(LS[9] + 0.2)}); pop("#lb-B", ${t(LS[9] + 0.8)}); pop("#lb-A", ${t(LS[9] + 1.2)});
      draw("cv-same", ${t(LS[9] + 1.6)}); pop("#lb-same", ${t(LS[9] + 2.1)});
      // ===== L10 缺口越大，折扣越大。坏账，变成了利润。
      out("#lb-same, #cv-same", ${t(LS[10] - 0.2)}); tl.to("#lb-disc", { scale: 1.9, duration: 0.3 }, ${t(LS[10] + 0.2)});
      X8.grab(tl, "aliq1", ${t(LS[10] + 0.2)}); fadeIn("#haul", ${t(LS[10] + 0.3)}, 0.3);
      tl.to("#haul", { x: ${f(PILE[0] - pL[0])}, y: ${f(PILE[1] - pL[1] - 30)}, duration: 1.2, ease: "power2.inOut" }, ${t(LS[10] + 0.6)});
      draw("cv-profit", ${t(TM.bad)}); pop("#lb-profit", ${t(TM.bad + 0.4)});
      // ===== L11 整个协议也有一条不变量：所有资产，要盖得住所有存款人的债权。
      out("#lb-disc, #lb-profit, #cv-profit, #lb-A, #lb-B", ${t(LS[11] - 0.2)}); cam(${t(LS[11])}, "A", 1.4); pop("#cb", ${t(LS[11] + 0.3)});
      hot("#cb-r2", ${t(LS[11] + 0.6)}); [0, 1, 2, 3, 4].forEach((i) => grow("dep" + i, ${t(LS[11] + 1.0)} + i * 0.12));
      pop("#lb-dep", ${t(LS[11] + 1.9)}); draw("cv-res", ${t(LS[11] + 2.2)}); pop("#lb-inv", ${t(LS[11] + 2.7)});
      // ===== L12 盖不住的部分，就是坏账。
      fadeIn("#resgap", ${t(LS[12] + 0.2)}, 0.4); pop("#lb-resbad", ${t(LS[12] + 0.5)});
      // ===== L13 坏账不一定来自攻击。
      out("#cb, #cv-res, #lb-inv, #lb-dep, #lb-resbad, #resgap", ${t(LS[13] - 0.2)}); cam(${t(LS[13])}, "B", 1.6);
      pop("#kw-notatk", ${t(LS[13] + 0.4)});
      // ===== L14 价格暴跌，预言机延迟，清算来不及，都会留下坏账。
      out("#kw-notatk", ${t(LS[14] + 0.6)}); cam(${t(LS[14] + 0.4)}, "liq", 1.2);
      X8.paper(tl, "price", ${t(TM.crash)}, 120, 1.0); X8.avg(tl, "price", ${t(TM.crash)}, "↓", true); pop("#lb-drop", ${t(TM.crash + 0.2)});
      KIT.sand(tl, "ohour", ${t(TM.lag)}, 2.4); pop("#lb-lag", ${t(TM.lag + 0.2)});
      X8.botScr(tl, "bliq2", ${t(TM.late)}, "…", true); pop("#lb-late", ${t(TM.late + 0.2)});
      // ===== L15 清算人是逐利的。奖励覆盖不了 gas 和滑点，就没人清算。
      out("#lb-drop, #lb-lag, #lb-late", ${t(LS[15] - 0.2)}); X8.botScr(tl, "bliq1", ${t(LS[15] + 0.6)}, "奖励");
      pop("#lb-gas", ${t(TM.reward + 0.8)}); pop("#lb-slip", ${t(TM.slip)}); X8.botScr(tl, "bliq1", ${t(TM.slip + 0.3)}, "亏", true);
      X1.walk(tl, "bliq1", ${t(LE[15] - 1.5)}, 1.2, ${JSON.stringify([off(at(L.BLIQ[1]), -200, 70)].map((p) => p.map(Math.round)))});
      // ===== L16 抵押品流动性不足，清算人拿到手，也卖不出好价钱。
      out("#lb-gas, #lb-slip", ${t(LS[16] - 0.2)}); X8.grab(tl, "bliq0", ${t(LS[16] + 0.3)});
      X1.walk(tl, "bliq0", ${t(LS[16] + 1.0)}, 1.4, ${JSON.stringify([off(at(L.STALLS[0]), -130, 80)].map((p) => p.map(Math.round)))});
      X8.stallPrice(tl, "stall0", ${t(LS[16] + 2.6)}, "低价", true); pop("#lb-cheap", ${t(LS[16] + 2.9)});
      // ===== L17 再看一个例子。2021 年 5 月，BNB Chain 上的 Venus，允许用户拿自己的治理代币 XVS 做抵押。
      out("#lb-cheap", ${t(LS[17] - 0.2)}); cam(${t(LS[17])}, "xvs", 1.4); pop("#ev-venus", ${t(LS[17] + 1.0)});
      bump("#xvs", ${t(LS[17] + 2.2)}, 1.08); pop("#lb-xvs", ${t(LS[17] + 2.6)}); draw("cv-xvs", ${t(LS[17] + 3.2)});
      // ===== L18 按 The Block 报道，XVS 短时间里，从约 76 美元涨到约 144 美元。
      out("#ev-venus, #lb-xvs, #cv-xvs", ${t(LS[18] - 0.2)}); pop("#ev-block", ${t(LS[18] + 0.3)}); pop("#lb-76", ${t(LS[18] + 0.8)});
      X8.avg(tl, "price", ${t(LS[18] + 0.8)}, "76"); X8.paper(tl, "price", ${t(TM.up)}, 200, 2.0); X8.penKick(tl, "price", ${t(TM.up + 1.2)});
      X8.avg(tl, "price", ${t(TM.up + 1.6)}, "144", true); out("#lb-76", ${t(TM.up + 1.2)}); pop("#lb-144", ${t(TM.up + 1.5)});
      // ===== L19 抵押能力跟着上涨，有人借走了大量 BTC 和 ETH。
      out("#ev-block", ${t(LS[19] - 0.2)}); fadeIn("#loot", ${t(LS[19] + 0.5)}, 0.4); pop("#lb-loot", ${t(LS[19] + 1.0)});
      tl.to("#loot", { x: 140, y: 60, duration: 1.2, ease: "power2.in" }, ${t(LS[19] + 2.6)}); out("#loot", ${t(LS[19] + 3.6)});
      // ===== L20 XVS 回落以后，清算金额约 2 亿美元以上，仍然留下约 9500 万美元以上的坏账。
      out("#lb-144, #lb-loot", ${t(LS[20] - 0.2)}); X8.paper(tl, "price", ${t(LS[20] + 0.2)}, 120, 1.2); X8.avg(tl, "price", ${t(LS[20] + 0.6)}, "↓", true);
      X1.walk(tl, "bliq1", ${t(TM.liq - 0.8)}, 1.0, ${JSON.stringify([at(L.BLIQ[1]).map(Math.round)])});
      X1.walk(tl, "bliq0", ${t(TM.liq - 0.8)}, 1.0, ${JSON.stringify([at(L.BLIQ[0]).map(Math.round)])});
      [0, 1, 2].forEach((i) => X8.botLamp(tl, "bliq" + i, ${t(TM.liq + 0.3)} + i * 0.1));
      pop("#lb-liq2", ${t(TM.liq + 0.5)}); fadeIn("#badB", ${t(TM.bad20)}, 0.6); pop("#lb-bad2", ${t(TM.bad20 + 0.4)});
      // ===== L21 项目方称，价格可能被操纵。
      out("#lb-liq2", ${t(LS[21] - 0.2)}); X8.spike(tl, "price", ${t(LS[21] + 0.2)}, true); pop("#g-claim", ${t(LS[21] + 0.4)});
      // ===== L22 这叫反身性。价格上涨，借款增加，卖压增加，价格下跌，坏账出现。
      out("#g-claim, #lb-bad2", ${t(LS[22] - 0.2)});
      [${[TM.r0, TM.r1, TM.r2, TM.r3].map(f).join(", ")}].forEach((tt, i) => { fadeIn("#arc" + i, tt, 0.4); pop("#lb-r" + i, tt + 0.2); });
      draw("cv-ring", ${t(TM.r4)}); pop("#lb-bad3", ${t(TM.r4 + 0.3)}); flash("#badB", ${t(TM.r4 + 0.5)}, 2);
      // ===== L23 所以，低流动性的抵押品，要有供应上限和更低的抵押率。
      out("#arc0, #arc1, #arc2, #arc3, #lb-r0, #lb-r1, #lb-r2, #lb-r3, #cv-ring, #lb-bad3", ${t(LS[23] - 0.2)});
      cam(${t(LS[23])}, "B", 1.6); grow("cap", ${t(Math.max(TM.cap, LS[23] + 1.0))}); grow("rate", ${t(Math.max(TM.rate, LS[23] + 1.6))});
`,
});
