// ep11/seg6「⑥ 今天能做什么」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.E（BRIEF 第 2 节镜头路线）。
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
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
import { G } from "../../../kit/iso.mjs";
// ends static on CAMS.world

// ---- 段内专用位置（A 区，世界画布 px）和镜头
const P = (X0, Y0, extra = {}) => { const q = G(X0, Y0); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
const PHONE = P(-1040, 330);                 // kit phone（普通用户，L3–L4）
const DISC = P(980, 620);                   // E01 signBoard plate「清算折扣」（L7）
const DLOCK = P(980, 660);                  // kit padlock「有上限」，抬到牌子下沿
const CAMX = {
  ...L.CAMS,
  user: L.fit([L.rect(PHONE, "phone"), L.rect(L.BORROWER, "person")], [300, 300, 1200, 860], 1.4),
  fix: L.fit([L.rect(L.PANEL, "funcPanel"), L.rect(L.VEND, "vending"), L.rect(L.BAL, "balance"), L.rect(L.BADA, "badA"),
    ...L.ALIQ.map((q) => L.rect(q, "liqBot")), L.rect(DISC, "signPlate")], [880, 300, 1720, 860], 1.4),
};

const S = segInit(import.meta.url, { cams: CAMX, ext: [E1, E5, E8, E9, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// E 赎回窗口（起点）
put("q", L.QUEUE, E1.mempool(L.QUEUE, { id: "q", n: 5, sign: "赎回队列" }));
put("w8", L.WAIT8, E1.timeLock(L.WAIT8, { id: "w8", frac: 0.4 }));
put("pause", L.PAUSE, O.knifeSwitch(L.PAUSE, { id: "pause", on: false, text: "暂停" }));
put("alarm", L.ALARM, O.beacon(L.ALARM, { id: "alarm" }));
L.TEAM.forEach((q, i) => put("tm" + i, q, O.person(q, { id: "tm" + i, role: "engineer" })));
put("atk", L.ATTACKER, O.person(L.ATTACKER, { id: "atk", role: "attacker" }));
put("cmeth", L.CMETH, E1.miniVend(L.CMETH, { id: "cmeth", kind: "token", label: "cmETH", scale: L.CMETH.scale }));
put("sh", L.SHIELD, O.shield(L.SHIELD, { id: "sh", glow: true }));
L.WAITERS.forEach((q, i) => put("wt" + i, q, O.person(q, { id: "wt" + i, role: "signer", scale: q.scale })));
// D 铸币厂（全景用）
put("mp", L.MINT, X.mintPress(L.MINT, { id: "mp", keys: 1 }));
put("resv", L.RESV, O.safe(L.RESV, { id: "resv", gold: true }));
put("usdc", L.USDC, E1.miniVend(L.USDC, { id: "usdc", kind: "token", label: "USDC", scale: L.USDC.scale }));
put("usr", L.USR, E1.miniVend(L.USR, { id: "usr", kind: "token", label: "USR", scale: L.USR.scale }));
put("dex", L.DEX, E8.ammPool(L.DEX, { id: "dex", scale: L.DEX.scale }));
put("upr", L.UPRICE, E8.twapRecorder(L.UPRICE, { id: "upr", scale: L.UPRICE.scale }));
// C 议事厅 + 奖励站（全景用）
put("ballot", L.BALLOT, E9.commitBox(L.BALLOT, { id: "ballot", scale: L.BALLOT.scale }));
put("meter", L.METER, E5.thresholdMeter(L.METER, { id: "meter", thText: "2/3" }));
put("treas", L.TREASURY, O.safe(L.TREASURY, { id: "treas", gold: true }));
put("snap", L.SNAP, X.snapshotCamera(L.SNAP, { id: "snap" }));
put("tlock", L.TLOCK, E1.timeLock(L.TLOCK, { id: "tlock" }));
put("veto", L.VETO, O.knifeSwitch(L.VETO, { id: "veto" }));
put("rw", L.REWARD, E1.vending(L.REWARD, { id: "rw", scale: L.REWARD.scale }));
put("rh", L.RHOUR, O.hourglass(L.RHOUR, { id: "rh" }));
// B 清算市场（全景用）
put("xvs", L.XVS, E1.miniVend(L.XVS, { id: "xvs", kind: "token", label: "XVS", scale: L.XVS.scale }));
put("price", L.PRICE, E8.twapRecorder(L.PRICE, { id: "price" }));
put("cpool", L.CPOOL, E8.ammPool(L.CPOOL, { id: "cpool", scale: L.CPOOL.scale }));
L.BLIQ.forEach((q, i) => put("bl" + i, q, E8.liqBot(q, { id: "bl" + i, scale: q.scale })));
// A 借贷大厅（L1–L7 主场）
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm" }));
put("fp", L.PANEL, E5.funcPanel(L.PANEL, { id: "fp", title: "入口", buttons: [
  { name: "存入", guard: "card" }, { name: "借款", guard: "card" }, { name: "取出", guard: "card" }, { name: "捐赠", guard: "broken" }] }));
put("bal", L.BAL, E1.balance(L.BAL, { id: "bal" }));
put("res", L.RESERVE, O.safe(L.RESERVE, { id: "res", gold: true }));
put("brw", L.BORROWER, O.person(L.BORROWER, { id: "brw", role: "signer" }));
L.ALIQ.forEach((q, i) => put("al" + i, q, E8.liqBot(q, { id: "al" + i })));
const PH_S1 = `<rect width="76" height="150" rx="6" fill="#fffdf8"/><text x="38" y="62" font-size="20" font-weight="900" text-anchor="middle" fill="#1d93ba">收益</text><text x="38" y="92" font-size="20" font-weight="900" text-anchor="middle" fill="#1d93ba">来源?</text>`;
const PH_S2 = `<rect width="76" height="150" rx="6" fill="#fffdf8"/>` + ["储备", "赎回", "冻结"].map((s, i) =>
  `<rect x="8" y="${30 + i * 36}" width="14" height="14" rx="3" fill="none" stroke="#1d93ba" stroke-width="2.5"/><text x="28" y="${43 + i * 36}" font-size="15" font-weight="900" fill="#1c1c1c">${s}</text>`).join("");
put("ph", PHONE, O.phone(PHONE, { id: "ph", screen: PH_S1, screen2: PH_S2 }));
put("disc", DISC, E1.signBoard(DISC, { id: "disc", style: "plate", text: "清算折扣", sub: "随缺口变大", size: 34 }), 0, { grow: true });
put("dlock", DLOCK, O.padlock(DLOCK, { id: "dlock" }), 0, { grow: true, wrap: (svg) => `<g transform="translate(0,-55)">${svg}</g>` });
for (const n of ["top", "center", "ground"]) if (A.dlock[n]) A.dlock[n] = [A.dlock[n][0], A.dlock[n][1] - 55];
// 放大镜：悬在 0 号按钮上方，L2 依次飞过 4 个按钮
const B0 = A.fp.btns[0];
const MAGO = P(B0[0] - 20, B0[1] + 150);
put("mag", MAGO, O.magnifier(MAGO, { id: "mag" }), 0, { grow: true });
const MAGD = A.fp.btns.map((b) => [b[0] - B0[0], b[1] - B0[1]]);
// 坏账红虚线框（原生 SVG）
const [bx, by] = Wp(L.BADA.u, L.BADA.v), BQ = L.EXT.badA;
add(L.BADA, S.hid("badA", `<rect x="${bx + BQ[0]}" y="${by + BQ[1]}" width="${BQ[2] - BQ[0]}" height="${BQ[3] - BQ[1]}" rx="10" fill="rgba(224,69,58,0.12)" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 8"/>`), 60);
// 各区绿色地光（L8 全景）
const ZG = ["A", "B", "C", "R", "D", "E"].map((k) => {
  const R = L.ZONE_RECTS[k], x0 = Math.min(...R.map((q) => q[0])), x1 = Math.max(...R.map((q) => q[2])), y0 = Math.min(...R.map((q) => q[1])), y1 = Math.max(...R.map((q) => q[3]));
  const rx = (x1 - x0) / 2 + 60;
  return `<ellipse cx="${(x0 + x1) / 2}" cy="${y1 - (y1 - y0) * 0.3}" rx="${rx}" ry="${Math.round(rx * 0.32)}" fill="url(#zgG)"/>`;
}).join("");
add(G(0, -99999), `<defs><radialGradient id="zgG"><stop offset="0" stop-color="#1f9d55" stop-opacity="0.45"/><stop offset="1" stop-color="#1f9d55" stop-opacity="0"/></radialGradient></defs>` + S.hid("zglow", ZG));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-sh", up(A.sh.top, 8), "延迟 = 安全参数", "lab-cs");
lb("lb-fp", up(A.fp.top, 8), "入口", "lab-ink");
lb("lb-miss", [A.fp.readers[3][0], A.fp.readers[3][1] + 46], "缺健康检查", "lab-rs", "t");
lb("lb-hc", [A.fp.readers[3][0] + 4, A.fp.readers[3][1] + 46], "健康检查 ✓", "lab-gs", "t");
lb("lb-user", up(A.brw.top, 8), "普通用户", "lab-ink lab-sm");
lb("lb-nobig", [A.ph.center[0] + 70, A.ph.center[1]], "说不清 → 不投大额", "lab-rs", "l");
lb("lb-bal", up(A.bal.top, 8), "健康因子", "lab-cs lab-sm");
lb("lb-bad", [bx + 30, by + 80], "坏账", "lab-rs lab-sm", "t");
lb("lb-cap", [A.dlock.center[0] + 60, A.dlock.center[1] + 10], "有上限", "lab-gs", "l");

// ---------------------------------------------------------------- 屏幕层卡片
const CB = { x: 60, y: 300, w: 840 }, CA = { x: 60, y: 280, w: 790 };
const cardB = codeCard("cb", { ...CB, head: "偿付不变量", tag: "示意", rows: [
  "HF = Σ(抵押品价值 × 清算阈值) / Σ(借款价值)", "HF &lt; 1  →  可被清算", "Σ(所有资产) ≥ Σ(所有存款人的债权)"] });
const cardA = codeCard("ca", { ...CA, head: "捐赠函数", tag: "示意", mono: true, rows: [
  "function donateToReserves(amt) {", "  balance[msg.sender] -= amt;", "  reserves += amt;",
  `<span id="rA" class="rA">  // 缺：require(healthFactor(…) &gt;= 1)</span><span id="rB" class="rB">  require(healthFactor(msg.sender) &gt;= 1);</span>`, "}"] });
S.curve("cvA", [CA.x + CA.w + 4, codeRowY(CA.y, 3)], S.scr("fix", A.fp.readers[3]), { color: "#e0453a" });
S.curve("cvD", S.scr("fix", A.disc.board), S.scr("fix", [bx + 30, by + 25]), { color: "#e0453a" });
const OPS = ["存入", "借款", "取出", "捐赠"];
const html = [
  ...["写协议的人", "审计的人", "普通用户"].map((s, i) => ck("role" + i, s, { x: 300 + i * 440, y: 160, w: 380, kind: "c", icon: String(i + 1) })),
  kw("kw-r1", "写协议的人 · <b>写成公式再测试</b>", { x: 700, y: 130 }),
  kw("kw-r2", "审计的人 · <b>逐个入口核对</b>", { x: 704, y: 134 }),
  kw("kw-r3", "普通用户 · <b>先问收益从哪来</b>", { x: 708, y: 138 }),
  kw("kw-sc", "稳定币 ≠ <b>无风险资产</b>", { x: 712, y: 142, accent: "#e0453a" }),
  cardB, ...OPS.map((s, i) => ck("op" + i, s, { x: 60 + i * 212, y: 610, w: 196 })),
  ...["查储备", "查赎回规则", "查发行方冻结权限"].map((s, i) => ck("sc" + i, s, { x: 1300, y: 330 + i * 100, w: 500, kind: "n" })),
  cardA, evt("ev", `Euler Finance · 损失约 <b>1.97 亿美元</b>${gtag("公开报道")}`),
  kw("kw-cond", `成立条件 · 清算折扣 <b>随缺口变大</b>${gtag("解读")}`, { x: 716, y: 146, accent: "#e0453a" }),
  kw("kw-fin", "规则的每一种组合 · 守住 <b>偿付不变量</b>", { x: 520, y: 104, size: 52 }),
].join("");
const css = `
    .rB { display: none; color: #1f9d55; } .rA { color: #e0453a; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  formula: w("公式", 1), test: w("不变量测试", 1), entry: w("入口", 2), each: w("逐个", 2),
  noBig: w("不要投入", 3), resv: w("储备", 4), redeem: w("赎回", 4), frz: w("冻结", 4),
  fn: w("每个函数", 5), loss: w("损失", 5), path: w("一条路径", 6), nochk: w("却不检查", 6),
  disc: w("清算折扣", 7), gap: w("随缺口", 7), profit: w("变成利润", 7), keep: w("守住", 8),
};
const t = (x) => f(x);

S.build({
  cam0: "E", sub: "守住偿付不变量",
  grid: { u0: -3300, u1: 8900, v0: -5700, v1: 6700 }, box: [-1400, -2900, 8000, 4600],   // E → A → world：盖住全部五区
  shown: ["#lb-sh"], css, html,
  terms: [
    { id: "t0", t: "不变量测试", d: "随机操作后检查不变量是否仍成立", at: w("不变量测试", 1) },
  ],
  end: { title: "DeFi 经济安全", line: "代码没错，规则错了：每一种组合都要守住偿付不变量", next: "跨链桥安全", at: LS[9] - 0.8, nextAt: w("下一集", 9) },
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 最后，每个人今天就能做一件事。
      [0, 1, 2].forEach((i) => pop("#role" + i, ${t(LS[0] + 0.3)} + i * 0.35));
      // ===== L1 写协议的人，把偿付不变量写成一条公式，再用不变量测试去验证它。
      out("#role0, #role1, #role2, #lb-sh", ${t(LS[1] - 0.2)}); cam(${t(LS[1])}, "balance", 2.4, "power2.inOut");
      pop("#kw-r1", ${t(LS[1] + 0.2)}); pop("#lb-bal", ${t(LS[1] + 2.5)}); pop("#cb", ${t(TM.formula - 0.6)}); hot("#cb-r2", ${t(TM.formula)});
      [0, 1, 2, 3].forEach((i) => { const s = ${t(TM.test + 0.1)} + i * 0.36; pop("#op" + i, s); X1.tilt(tl, "bal", s, 1, 0.15); X1.tilt(tl, "bal", s + 0.17, 6, 0.15); });
      // ===== L2 审计的人，列出每一个改变抵押品和债务的入口，逐个核对有没有健康检查。
      out("#cb, #op0, #op1, #op2, #op3, #kw-r1, #lb-bal", ${t(LS[2] - 0.2)}); cam(${t(LS[2])}, "donate", 1.4);
      pop("#kw-r2", ${t(LS[2] + 0.2)}); pop("#lb-fp", ${t(LS[2] + 1.2)}); grow("mag", ${t(TM.entry - 0.3)}); X5.swipe(tl, "fp", 0, ${t(TM.entry + 0.3)}, true);
      const MD = ${JSON.stringify(MAGD)};
      [1, 2, 3].forEach((i) => { const s = ${t(TM.each)} + (i - 1) * 0.6; X5.fly(tl, "mag", s, MD[i][0], MD[i][1], 0.4);
        if (i < 3) X5.swipe(tl, "fp", i, s + 0.4, true); });
      flash("#fp-gap-3", ${t(TM.each + 1.6)}, 2); pop("#lb-miss", ${t(TM.each + 1.7)});
      // ===== L3 普通用户，收益来源说不清楚的产品，不要投入大额。
      out("#kw-r2, #lb-fp, #lb-miss, #mag", ${t(LS[3] - 0.2)}); cam(${t(LS[3])}, "user", 1.4);
      pop("#kw-r3", ${t(LS[3] + 0.2)}); pop("#lb-user", ${t(LS[3] + 1.0)}); pop("#lb-nobig", ${t(TM.noBig)});
      // ===== L4 稳定币也不是无风险资产。先查它的储备，赎回规则，和发行方的冻结权限。
      out("#kw-r3, #lb-nobig", ${t(LS[4] - 0.2)}); pop("#kw-sc", ${t(LS[4] + 0.1)});
      out("#ph-scr", ${t(TM.resv - 0.4)}); fadeIn("#ph-scr2", ${t(TM.resv - 0.3)});
      pop("#sc0", ${t(TM.resv)}); pop("#sc1", ${t(TM.redeem)}); pop("#sc2", ${t(TM.frz)});
      // ===== L5 回到开头。每个函数都没有错，协议为什么损失约 1.97 亿美元？
      out("#kw-sc, #lb-user", ${t(LS[5] - 0.2)}); out("#sc0, #sc1, #sc2", ${t(TM.fn - 0.3)}); cam(${t(LS[5])}, "fix", 1.6, "power2.inOut");
      pop("#ev", ${t(LS[5] + 0.6)}); pop("#lb-fp", ${t(LS[5] + 1.4)}); pop("#ca", ${t(TM.fn)});
      flash("#fp-gap-3", ${t(TM.fn + 0.6)}, 2); pop("#lb-miss", ${t(TM.fn + 0.7)});
      pop("#lb-bal", ${t(TM.loss - 0.2)}); X1.tilt(tl, "bal", ${t(TM.loss)}, -16, 0.8); fadeIn("#badA", ${t(TM.loss + 0.4)}, 0.4); pop("#lb-bad", ${t(TM.loss + 0.7)}); bump("#ev", ${t(TM.loss + 0.9)}, 1.06);
      // ===== L6 因为规则允许一条路径，减少抵押品，却不检查健康因子。（关键画面）
      hot("#ca-r3", ${t(LS[6] + 0.2)}); draw("cvA", ${t(TM.path)}); flash("#ca-r3", ${t(TM.path + 0.7)}, 2);
      tl.set("#rA", { display: "none" }, ${t(TM.nochk + 0.6)}); tl.set("#rB", { display: "inline" }, ${t(TM.nochk + 0.6)});
      fadeIn("#rB", ${t(TM.nochk + 0.6)}); hot("#ca-r3", ${t(TM.nochk + 0.6)}, "#e6f4ec"); out("#cvA, #lb-miss", ${t(TM.nochk + 0.6)});
      X5.guard(tl, "fp", 3, ${t(TM.nochk + 0.7)}, "card"); X5.swipe(tl, "fp", 3, ${t(TM.nochk + 1.1)}, true);
      pop("#lb-hc", ${t(TM.nochk + 1.2)}); X1.tilt(tl, "bal", ${t(TM.nochk + 1.2)}, 6, 0.8);
      // ===== L7 这个答案成立的前提是，清算折扣会随缺口变大，缺口才能变成利润。（关键画面）
      out("#ev, #ca", ${t(LS[7] - 0.2)}); pop("#kw-cond", ${t(LS[7] + 0.3)}); grow("disc", ${t(TM.disc)});
      draw("cvD", ${t(TM.gap + 0.3)});
      grow("dlock", ${t(TM.profit)}); pop("#lb-cap", ${t(TM.profit + 0.4)}); out("#cvD", ${t(TM.profit + 0.3)});
      tl.to("#badA", { scale: 0, svgOrigin: "${bx + 30} ${by + 25}", duration: 0.6, ease: "power2.in" }, ${t(TM.profit + 0.4)}); out("#lb-bad", ${t(TM.profit + 0.4)});
      // ===== L8 代码没错，规则错了。规则的每一种组合，都要守住偿付不变量。
      out("#kw-cond, #lb-hc, #lb-cap, #lb-bal, #lb-fp", ${t(LS[8] - 0.2)}); cam(${t(LS[8])}, "world", 2.4, "power2.inOut");
      fadeIn("#zglow", ${t(LS[8] + 2.0)}, 0.8); pop("#kw-fin", ${t(LS[8] + 2.2)}); out("#kw-fin", ${t(LS[9] - 1.05)});
      // ===== L9 下一集讲跨链桥安全。（结束卡，静止在 world）
`,
});
