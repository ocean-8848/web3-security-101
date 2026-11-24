// ep11/seg4「④ 发行方风险」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.reward（BRIEF 第 2 节镜头路线）。
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
import { G } from "../../../kit/iso.mjs";
import { ZONE } from "../../../kit/segbase.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.D

// 段内专用位置 / 镜头
const dpt = (X, Y, extra = {}) => { const q = G(5000 + X, -1300 + Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
const LBOT = dpt(1180, 480, { scale: 0.6 });                 // E08 liqBot "清算"（L18），第三个摊位右边
const CAMS = {
  ...L.CAMS,
  spiralC: L.fit([L.rect(L.SPIRAL, "spiral"), L.rect(L.UPRICE, "twapRecorder"), L.rect(L.MINT, "mintPress"), L.rect(L.MSIG, "thresholdMeter")], [300, 300, 1450, 860], 1.4),
};

const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E5, E8, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// C 前排奖励站（承接 seg3 结尾）
put("rwd", L.REWARD, E1.vending(L.REWARD, { id: "rwd", sign: "REWARD", scale: L.REWARD.scale }));
put("rhour", L.RHOUR, O.hourglass(L.RHOUR, { id: "rhour" }));
put("rpool", L.RPOOL, E8.ammPool(L.RPOOL, { id: "rpool", scale: L.RPOOL.scale }));
// D 铸币厂
const wrapAt = (key, o, k) => { const [gx, gy] = at(o); return { gx, gy, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`,
  fix: () => { for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; } } }; };
put("mp", L.MINT, X.mintPress(L.MINT, { id: "mp", keys: 1, count: "1000", pile: 0.3 }));
put("resv", L.RESV, O.safe(L.RESV, { id: "resv", gold: false, plate: "储备" }));
const wS = wrapAt("svb", L.SVB, 0.7);
put("svb", L.SVB, O.safe(L.SVB, { id: "svb", plate: "SVB" }), 0, { wrap: wS.wrap }); wS.fix();
put("osign", L.OFFSIGN, E1.signBoard(L.OFFSIGN, { id: "osign", text: "链下", size: 40 }));
put("usdc", L.USDC, E1.miniVend(L.USDC, { id: "usdc", kind: "token", label: "USDC", scale: L.USDC.scale }));
put("usr", L.USR, E1.miniVend(L.USR, { id: "usr", kind: "token", label: "USR", scale: L.USR.scale }));
put("lend", L.LENDER, E1.vending(L.LENDER, { id: "lend", sign: "LEND", scale: L.LENDER.scale }));
put("dex", L.DEX, E8.ammPool(L.DEX, { id: "dex", scale: L.DEX.scale, labelL: "USDe", labelR: "USDC", read: "1.00", deg: 0 }));
L.EXCH.forEach((q, i) => put("ex" + i, q, E8.marketStall(q, { id: "ex" + i, scale: q.scale, head: "USDe", price: "1.00" })));
put("upr", L.UPRICE, E8.twapRecorder(L.UPRICE, { id: "upr", scale: L.UPRICE.scale, avg: "1.00" }));
put("bill", L.BILL, O.doc(L.BILL, { id: "bill", title: "提货单", standing: true, stamp: true }));
put("void", L.VOID, O.seal(L.VOID, { id: "void", markText: "作废", text: "银行", stamped: false }));
put("msig", L.MSIG, E5.thresholdMeter(L.MSIG, { id: "msig", max: 3, th: 1, thText: "1/3" }));
put("mkey", L.MKEY, O.key(L.MKEY, { id: "mkey", state: "attacker" }));
const wM = wrapAt("mgr", L.MANAGER, 0.6);
put("mgr", L.MANAGER, O.desk(L.MANAGER, { id: "mgr" }), 0, { wrap: wM.wrap }); wM.fix();
put("frz", L.FREEZE, O.padlock(L.FREEZE, { id: "frz" }), 6, { grow: true });
put("lbot", LBOT, E8.liqBot(LBOT, { id: "lbot", scale: LBOT.scale, scr: "0.65", open: true }));
// 管道：储备 → 铸币机（青蓝流）；铸币机 → 三路下游（红流，L19）
for (const [k, r] of Object.entries(L.DPIPE)) {
  const red = k !== "reserve";
  put("p-" + k, r.o, E1.pipe(r.o, { id: "p-" + k, pts: r.pts, ...(red ? { flowColor: "#e0453a" } : {}) }), 0.4);
}
// 原生 SVG：提货单金边、死亡螺旋、管理人亏损曲线、三处下游红框
const [bx0, by0, bx1, by1] = L.rect(L.BILL, "docStanding");
add(L.BILL, S.hid("bill-gold", `<rect x="${bx0 - 14}" y="${by0 - 14}" width="${bx1 - bx0 + 28}" height="${by1 - by0 + 28}" rx="10" fill="none" stroke="#c9a227" stroke-width="7"/>`), 8);
const [sx, sy] = at(L.SPIRAL);
const sp = []; for (let i = 0; i <= 120; i++) { const q = i / 120, a = q * Math.PI * 6, rx = 82 * (1 - 0.55 * q);
  sp.push(`${(sx + rx * Math.sin(a)).toFixed(1)},${(sy - 190 + 165 * q + rx * 0.32 * Math.cos(a)).toFixed(1)}`); }
const [ex, ey] = sp[sp.length - 1].split(",").map(Number);
add(L.SPIRAL, S.hid("spiral", `<polyline id="spiral-p" points="${sp.join(" ")}" fill="none" stroke="#e0453a" stroke-width="7" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1.2" stroke-dashoffset="1.1"/>
  <path d="M${ex - 16},${ey - 14} L${ex},${ey + 8} L${ex + 16},${ey - 14}" fill="none" stroke="#e0453a" stroke-width="7" stroke-linecap="round"/>`), 4);
const [mx, my] = A.mgr.screen ?? A.mgr.center;
add(L.MANAGER, S.hid("mgr-loss", `<rect x="${mx - 42}" y="${my - 24}" width="84" height="48" rx="3" fill="#fff"/>
  <polyline points="${mx - 36},${my - 16} ${mx - 18},${my - 12} ${mx - 4},${my - 2} ${mx + 10},${my + 4} ${mx + 34},${my + 18}" fill="none" stroke="#e0453a" stroke-width="4"/>`), 10);
const redBox = (id, rs) => { const x0 = Math.min(...rs.map((q) => q[0])) - 12, y0 = Math.min(...rs.map((q) => q[1])) - 12, x1 = Math.max(...rs.map((q) => q[2])) + 12, y1 = Math.max(...rs.map((q) => q[3])) + 12;
  return S.hid(id, `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="12" fill="none" stroke="#e0453a" stroke-width="6" stroke-dasharray="16 10"/>`); };
add(L.LENDER, redBox("rb-lend", [L.rect(L.LENDER, "vending")]), 12);
add(L.DEX, redBox("rb-dex", [L.rect(L.DEX, "ammPool")]), 12);
add(L.EXCH[2], redBox("rb-ex", L.EXCH.map((q) => L.rect(q, "marketStall"))), 12);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-mp", up(A.mp.top, 10), "发行方", "lab-ink");
lb("lb-notc", up(A.mp.top, 130), "不在合约里", "lab-rs");
lb("lb-osign", up(A.osign.top, 8), "链下资产", "lab-cs lab-sm");
lb("lb-usdc", up(A.usdc.top, 8), "USDC", "lab-cs");
lb("lb-t-resv", up(A.resv.top, 8), "储备", "lab-cs");
lb("lb-t-redeem", up(A["p-reserve"].mid ?? A["p-reserve"].center, 30), "⇠ 赎回", "lab-cs");
lb("lb-t-auth", A.mp.keyPanel, "发行方权限", "lab-cs", "r");
lb("lb-meta", up(A.bill.top, 120), "比喻", "lab-ink lab-sm");
lb("lb-bill", up(A.bill.top, 8), "提货单", "lab-ink");
lb("lb-short", up(A.resv.top, 8), "货不够", "lab-rs");
lb("lb-sealed", up(A.resv.top, 130), "仓库被封", "lab-rs");
lb("lb-worth", up(A.bill.top, 8), "不值 1 美元", "lab-rs");
lb("lb-lend", up(A.lend.top, 8), "借贷协议", "lab-ink");
lb("lb-inherit", up(A.lend.top, 130), "继承链下风险", "lab-rs");
lb("lb-svb", up(A.svb.top, 8), "硅谷银行", "lab-ink");
lb("lb-33", up(A.svb.top, 130), "约 33 亿美元储备", "lab-rs");
lb("lb-upr", up(A.upr.top, 8), "USDC 约 0.87", "lab-rs");
lb("lb-dai", up(A.upr.top, 130), "DAI 约 0.90", "lab-r lab-sm");
lb("lb-ust", up(A.spiral?.top ?? [sx, sy - 200], 10), "UST 约 400 亿美元市值", "lab-rs");
lb("lb-usr", up(A.usr.top, 8), "约 8000 万枚 USR", "lab-rs");
lb("lb-key", A.mkey.center, "铸币密钥", "lab-rs lab-sm", "t");
lb("lb-ratio", A.mp.limit, "不核对比例", "lab-rs lab-sm", "l");
lb("lb-msig", up(A.msig.top, 8), "1/3 即可铸币", "lab-ink");
lb("lb-all", A.msig.ground, "拿下一个 = 拿下全部", "lab-rs", "t");
lb("lb-mgr", up(A.mgr.top, 8), "链下管理人 · 约 9300 万美元", "lab-rs lab-sm");
lb("lb-frz", A.frz.ground, "提款冻结", "lab-rs lab-sm", "t");
lb("lb-065", up(A.ex2.top, 8), "Binance 现货 约 0.65", "lab-rs lab-sm");
lb("lb-090", up(A.ex0.top, 8), "约 0.90 以上", "lab-gs lab-sm");
lb("lb-dex", up(A.dex.top, 8), "链上 约 0.90 以上", "lab-gs lab-sm");
lb("lb-pay", up(A.lbot.top, 30), "赔付约 2.83 亿美元", "lab-rs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const ET = ZONE.event.top;
const RK = { x: 1500, y: 330, w: 340 };
const risk = codeCard("rk", { ...RK, head: "五类风险", mono: false, rows: ["储备与托管", "设计缺陷", "铸币权限", "链下策略", "定价来源"] });
const hg = `<svg width="28" height="34" viewBox="0 0 28 34" style="vertical-align:-6px"><path d="M4 2h20M4 32h20M6 2c0 10 16 10 16 15S6 22 6 32M22 2c0 10-16 10-16 15s16 5 16 15" fill="none" stroke="#1c1c1c" stroke-width="2.4"/></svg>`;
const coin = `<svg width="32" height="32" viewBox="0 0 32 32" style="vertical-align:-6px"><circle cx="16" cy="16" r="13" fill="#bdb8ae" stroke="#8c877e" stroke-width="2.5"/></svg>`;
const signers = `<div class="sg-card hide" id="sg"><div class="sg-h">StablR 签名人</div>${[0, 1, 2].map((i) => `<div class="sg-r" id="sg-r${i}"><span class="sg-dot"></span>签名人 ${i + 1}</div>`).join("")}</div>`;
const html = risk + signers +
  kw("kw-law", `现实 ${hg} 作废要走<b>法律程序</b>`, { x: 90, y: 600, size: 34, accent: "#1c1c1c" }) +
  kw("kw-chain", `链上 ${coin} 冻结 / 销毁 = <b>一笔交易</b>`, { x: 1300, y: 640, size: 34, accent: "#e0453a" }) +
  evt("ev-circle", `2023 年 3 月 · 硅谷银行倒闭 ${gtag("Circle 声明")}`, { top: ET }) +
  evt("ev-block1", `USDC / DAI 脱锚 ${gtag("The Block 报道")}`, { top: ET + 3 }) +
  evt("ev-ust", `Terra UST · 2022 年 5 月`, { top: ET + 6, color: "#e0453a" }) +
  evt("ev-ust2", `${gtag("美国司法部 · Decrypt 报道")}`, { top: ET + 88 }) +
  evt("ev-resolv", `Resolv · 2026 年 3 月`, { top: ET + 9, color: "#e0453a" }) +
  evt("ev-quill", `${gtag("QuillAudits · CertiK 分析")}`, { top: ET + 82 }) +
  evt("ev-stablr", `StablR · 2026 年 5 月 ${gtag("The Block 报道")}`, { top: ET + 12, color: "#e0453a" }) +
  evt("ev-stream", `Stream Finance · 2025 年 11 月 ${gtag("Decrypt 报道")}`, { top: ET + 15, color: "#e0453a" }) +
  evt("ev-usde", `USDe · 2025 年 10 月 10 日`, { top: ET + 18, color: "#e0453a" }) +
  evt("ev-usde2", `${gtag("The Block 报道 · 21Shares 研究")}`, { top: ET + 91 });
const css = `
  .sg-card{position:absolute;left:110px;top:380px;width:330px;background:#fff;border-radius:14px;padding:14px 18px;box-shadow:0 4px 14px rgba(0,0,0,.12);font-size:28px}
  .sg-h{font-weight:700;margin-bottom:8px;color:#1c1c1c}
  .sg-r{display:flex;align-items:center;gap:12px;padding:6px 10px;border-radius:8px;color:#1c1c1c}
  .sg-dot{width:22px;height:22px;border-radius:50%;background:#2aa3c9;display:inline-block}
  .sg-r.red .sg-dot{background:#e0453a}`;
const RED_ROW = "rgba(224,69,58,.18)";
S.curve("cv-ob", S.scr("market", A.ex2.board), S.scr("market", A.lbot.top), { color: "#e0453a" });
S.curve("cv-inh", S.scr("D", A.osign.top), S.scr("D", A.lend.center), { color: "#e0453a" });

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  resv: w("储备", 2), redeem: w("赎回", 2), auth: w("权限", 2),
  pretty: w("精美", 4), short: w("货不够", 4), sealed: w("被封", 4), voidd: w("作废", 4), worth: w("不值", 4),
  law: w("法律程序", 5), frz5: w("冻结", 5), tx: w("一笔交易", 5),
  inherit: w("继承", 6), cat1: w("储备与托管", 7),
  dai: w("DAI", 9), spiral: w("死亡螺旋", 10), cat2: w("设计缺陷", 10),
  mkey: w("铸币密钥", 13), ratio: w("比例", 13),
  any: w("任意一人", 14), all: w("全部", 14),
  frz: w("冻结", 15), other: w("其他交易所", 17), book: w("订单簿", 18), pay: w("赔付", 18),
  both: w("同时", 19),
};
const t = (x) => f(x);

S.build({
  cam0: "reward", sub: "价值在链下",
  grid: { u0: 1200, u1: 9200, v0: -3200, v1: 5100 }, box: [2300, -2700, 5000, 3200],   // 盖住 reward → D（含 spiralC / market / mint）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "赎回", d: "把代币交回发行方换回底层资产", at: w("赎回", 2) },
    { id: "t1", t: "死亡螺旋", d: "价格下跌引发抛售再加速下跌", at: w("死亡螺旋", 10) },
    { id: "t2", t: "订单簿", d: "交易所里挂单买卖的价格列表", at: w("订单簿", 18) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      const hl = (i, t) => { if (i > 0) tl.to("#rk-r" + (i - 1), { backgroundColor: "rgba(0,0,0,0)", duration: 0.2 }, t); hot("#rk-r" + i, t, "${RED_ROW}"); };
      // ===== L0 另有一类风险，根本不在合约里。
      cam(${t(1.8)}, "D", 2.2); pop("#lb-mp", ${t(3.5)}); pop("#lb-notc", ${t(3.9)});
      // ===== L1 稳定币和代币化的现实资产，把链下资产带上了链。
      out("#lb-notc", ${t(LS[1] - 0.1)}); pop("#lb-osign", ${t(LS[1] + 0.3)});
      fadeIn("#p-reserve-flow", ${t(LS[1] + 0.6)}, 0.3); X1.dash(tl, "p-reserve-flow", ${t(LS[1] + 0.6)}, 3.6, -140);
      X11.mint(tl, "mp", ${t(LS[1] + 1.6)}, 1.6, 2, 0.7); pop("#lb-usdc", ${t(LS[1] + 3.0)}); bump("#usdc", ${t(LS[1] + 3.2)});
      // ===== L2 它们值多少，不看合约代码，看链下的储备，赎回，和发行方的权限。
      pop("#lb-t-resv", ${t(TM.resv)}); pop("#lb-t-redeem", ${t(TM.redeem)}); pop("#lb-t-auth", ${t(TM.auth)});
      // ===== L3 打个比方。稳定币像一张银行开的提货单。
      out("#lb-t-resv, #lb-t-redeem, #lb-t-auth, #lb-osign, #lb-usdc, #lb-mp, #p-reserve-flow", ${t(LS[3] - 0.3)});
      cam(${t(LS[3] - 0.1)}, "offchain", 1.4); pop("#lb-meta", ${t(LS[3] + 1.0)}); pop("#lb-bill", ${t(LS[3] + 1.3)});
      tl.to("#bill-stampmark", { opacity: 1, duration: 0.3 }, ${t(LS[3] + 2.4)});
      // ===== L4 提货单印得再精美，只要仓库里的货不够，仓库被封，或者银行能随时作废它，它就不值一美元。
      fadeIn("#bill-gold", ${t(TM.pretty)}, 0.4);
      KIT.door(tl, "resv", ${t(TM.short - 0.4)}, 105, 0.9); pop("#lb-short", ${t(TM.short + 0.4)});
      pop("#lb-sealed", ${t(TM.sealed)});
      KIT.stamp(tl, "void", ${t(TM.voidd)}); out("#lb-bill, #bill-gold", ${t(TM.voidd + 0.6)});
      tl.to("#bill", { opacity: 0.4, filter: "grayscale(1)", duration: 0.5 }, ${t(TM.voidd + 0.6)}); pop("#lb-worth", ${t(TM.worth)});
      // ===== L5 比喻在这里不成立：作废提货单，要走法律程序。冻结或销毁一个地址上的代币，通常只要一笔交易。
      pop("#kw-law", ${t(TM.law - 0.3)}); pop("#kw-chain", ${t(TM.frz5)});
      // ===== L6 DeFi 协议拿它做抵押品，就继承了这些链下风险。
      out("#kw-law, #kw-chain, #lb-meta, #lb-short, #lb-sealed, #lb-worth", ${t(LS[6] - 0.3)}); KIT.door(tl, "resv", ${t(LS[6] - 0.3)}, 0, 0.8);
      cam(${t(LS[6])}, "D", 1.4); pop("#lb-lend", ${t(LS[6] + 1.5)});
      draw("cv-inh", ${t(Math.max(TM.inherit, LS[6] + 1.6))}); pop("#lb-inherit", ${t(Math.max(TM.inherit, LS[6] + 1.6) + 0.5)});
      // ===== L7 风险分五类。第一类，储备与托管。
      out("#cv-inh, #lb-inherit, #lb-lend", ${t(LS[7] - 0.2)}); pop("#rk", ${t(LS[7] + 0.2)}); hl(0, ${t(TM.cat1)});
      // ===== L8 2023 年 3 月，按 Circle 的声明，约 33 亿美元储备存在倒闭的硅谷银行。
      cam(${t(LS[8] - 0.1)}, "offchain", 1.3); pop("#ev-circle", ${t(LS[8] + 0.3)}); pop("#lb-svb", ${t(LS[8] + 1.4)});
      KIT.broke(tl, "svb", ${t(LS[8] + 2.2)}, { badge: true }); pop("#lb-33", ${t(LS[8] + 2.8)}); bump("#lb-33", ${t(LS[8] + 4.6)});
      // ===== L9 按 The Block 报道，USDC 最低跌到约 0.87 美元。以它为主要抵押的 DAI，也跌到约 0.90 美元。
      out("#ev-circle, #lb-svb, #lb-33", ${t(LS[9] - 0.2)}); cam(${t(LS[9])}, "market", 1.4); pop("#ev-block1", ${t(LS[9] + 0.4)});
      X8.paper(tl, "upr", ${t(LS[9] + 1.5)}, 120, 2.5); X8.avg(tl, "upr", ${t(LS[9] + 2.8)}, "0.87", true); pop("#lb-upr", ${t(LS[9] + 3.2)});
      pop("#lb-dai", ${t(TM.dai)});
      // ===== L10 第二类，设计缺陷。2022 年 5 月，算法稳定币 Terra UST 挤兑，进入死亡螺旋，约 400 亿美元市值蒸发。
      out("#ev-block1, #lb-upr, #lb-dai", ${t(LS[10] - 0.2)}); cam(${t(LS[10] - 0.1)}, "spiralC", 1.4); hl(1, ${t(TM.cat2)});
      pop("#ev-ust", ${t(LS[10] + 2.0)}); pop("#ev-ust2", ${t(LS[10] + 2.3)});
      fadeIn("#spiral", ${t(TM.spiral - 0.3)}, 0.2); tl.to("#spiral-p", { attr: { "stroke-dashoffset": 0 }, duration: 2.0, ease: "none" }, ${t(TM.spiral - 0.3)});
      pop("#lb-ust", ${t(TM.spiral + 1.8)});
      // ===== L11 第三类，铸币权限。
      out("#ev-ust, #ev-ust2, #lb-ust, #spiral", ${t(LS[11] - 0.25)}); cam(${t(LS[11] - 0.1)}, "mint", 1.3); hl(2, ${t(LS[11] + 0.4)});
      // ===== L12 2026 年 3 月，Resolv 被凭空铸出约 8000 万枚 USR。
      pop("#ev-resolv", ${t(LS[12] + 0.2)}); X11.key(tl, "mp", ${t(LS[12] + 0.5)}, 0, true, true);
      X11.mint(tl, "mp", ${t(LS[12] + 1.1)}, 2.0, 4, 1); X11.count(tl, "mp", ${t(LS[12] + 1.5)}, "8000万", "red");
      X11.spill(tl, "mp", ${t(LS[12] + 2.6)}, true); X11.lamp(tl, "mp", ${t(LS[12] + 2.6)}, "red"); pop("#lb-usr", ${t(LS[12] + 2.9)}); X11.wheel(tl, "mp", ${t(LS[12] + 3.4)}, 1.2, 1); bump("#lb-usr", ${t(LS[12] + 4.2)});
      // ===== L13 按 QuillAudits 和 CertiK 的分析，攻击者拿到了铸币密钥，合约也不核对铸币量和存入资产的比例。
      out("#ev-resolv", ${t(LS[13] - 0.2)}); pop("#ev-quill", ${t(LS[13] + 0.2)});
      pop("#lb-key", ${t(TM.mkey)}); bump("#mkey", ${t(TM.mkey + 0.2)});
      X11.limitShow(tl, "mp", ${t(TM.ratio - 0.3)}, false); X11.limitBad(tl, "mp", ${t(TM.ratio - 0.3)}, true); pop("#lb-ratio", ${t(TM.ratio)}); flash("#mp-limit-bad", ${t(LE[13] - 2.2)}, 3);
      // ===== L14 2026 年 5 月的 StablR，三个签名人里任意一人，就能批准铸币。拿下一个人，就拿下了全部。
      out("#ev-quill, #lb-usr, #lb-key, #lb-ratio", ${t(LS[14] - 0.2)}); pop("#ev-stablr", ${t(LS[14] + 0.2)});
      pop("#sg", ${t(LS[14] + 0.5)}); pop("#lb-msig", ${t(LS[14] + 0.9)}); X5.fill(tl, "msig", ${t(TM.any)}, 1, 0.8);
      hot("#sg-r0", ${t(TM.any + 0.3)}, "${RED_ROW}"); tl.set("#sg-r0 .sg-dot", { backgroundColor: "#e0453a" }, ${t(TM.any + 0.3)});
      [1, 2].forEach((i) => { hot("#sg-r" + i, ${t(TM.all)} + i * 0.25, "${RED_ROW}"); tl.set("#sg-r" + i + " .sg-dot", { backgroundColor: "#e0453a" }, ${t(TM.all)} + i * 0.25); });
      pop("#lb-all", ${t(Math.min(TM.all + 0.3, LS[15] - 1.2))});
      // ===== L15 第四类，链下策略。2025 年 11 月，Stream Finance 的一名外部基金管理人，亏掉约 9300 万美元，提款随即冻结。
      out("#ev-stablr, #sg, #lb-msig, #lb-all", ${t(LS[15] - 0.25)}); cam(${t(LS[15] - 0.1)}, "offchain", 1.4); hl(3, ${t(LS[15] + 0.5)});
      pop("#ev-stream", ${t(LS[15] + 1.0)}); fadeIn("#mgr-loss", ${t(LS[15] + 3.2)}, 0.4); pop("#lb-mgr", ${t(LS[15] + 4.2)});
      grow("frz", ${t(TM.frz)}); pop("#lb-frz", ${t(TM.frz + 0.4)});
      // ===== L16 第五类，定价来源。2025 年 10 月 10 日，USDe 只在 Binance 现货，跌到约 0.65 美元。
      out("#ev-stream, #mgr-loss, #lb-mgr, #lb-frz", ${t(LS[16] - 0.25)}); cam(${t(LS[16] - 0.1)}, "market", 1.4); hl(4, ${t(LS[16] + 0.5)});
      pop("#ev-usde", ${t(LS[16] + 1.0)}); pop("#ev-usde2", ${t(LS[18] + 0.2)}); X8.stallPrice(tl, "ex2", ${t(LS[16] + 4.4)}, "0.65", true); X8.stallLamp(tl, "ex2", ${t(LS[16] + 4.4)}, true, 3);
      pop("#lb-065", ${t(LS[16] + 5.2)});
      // ===== L17 链上和其他交易所，基本保持在约 0.90 美元以上。
      X8.stallPrice(tl, "ex0", ${t(LS[17] + 0.4)}, "0.90+", false); X8.stallPrice(tl, "ex1", ${t(LS[17] + 0.6)}, "0.90+", false);
      X8.poolRead(tl, "dex", ${t(LS[17] + 0.4)}, "0.90+", false); pop("#lb-dex", ${t(LS[17] + 0.6)}); pop("#lb-090", ${t(TM.other)});
      // ===== L18 Binance 用自家订单簿给抵押品估值，触发了用户清算，之后赔付约 2.83 亿美元。
      draw("cv-ob", ${t(TM.book)}); X8.botLamp(tl, "lbot", ${t(TM.book + 0.6)}, 1.2, 1); X8.grab(tl, "lbot", ${t(TM.book + 1.6)});
      pop("#lb-pay", ${t(TM.pay)});
      // ===== L19 风险会沿着抵押关系往下传。储备一出问题，所有拿它做抵押品的协议，同时受影响。
      out("#rk, #ev-usde, #ev-usde2, #cv-ob, #lb-065, #lb-090, #lb-dex, #lb-pay", ${t(LS[19] - 0.25)});
      cam(${t(LS[19])}, "D", 1.6); KIT.broke(tl, "resv", ${t(LS[19] + 2.0)}, { badge: true, ghost: 0.35 });
      fadeIn("#p-lender-flow, #p-dex-flow, #p-exch-flow", ${t(LS[19] + 2.6)}, 0.3);
      X1.dash(tl, ["p-lender-flow", "p-dex-flow", "p-exch-flow"], ${t(LS[19] + 2.6)}, 3.6, -160);
      fadeIn("#rb-lend, #rb-dex, #rb-ex", ${t(Math.min(Math.max(TM.both, LS[19] + 3.4), LS[19] + 5.6))}, 0.3);
`,
});
