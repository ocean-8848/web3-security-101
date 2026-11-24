// ep25/seg3「③ 前排拦截」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.exitC（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：整座追赃城（seg2 L2–L6、L15–L20；seg6 L7–L13 结束卡）
//   heistA       A 被盗现场：热钱包 + 五枚币 + 攻击者 + 暂停闸 + 时间锁 + mETH 机器 + cmETH 份额（seg1 起点 L0–L1；seg3 L1–L4）
//   mintB        B 发行方：两台铸币机 + 攻击者地址牌 + 冻结锁 + 37 分钟钟 + AMM 池 + 点阵（seg1 L2–L12 终点；seg2 起点 L0–L1；seg3 L5–L10）
//   lawB         B 右半法规角：限制令 / 解除冻结 / 公章 / T3 牌 / GENIUS / 6 小时钟，右边缘露出 C 的跨链桥（seg3 L11–L17）
//   exitC        C 出城口：四个出口 + 关卡 + 分散地址 + 国道 + 劫匪（seg2 L7–L14、L21–L22 终点；seg3 起点 L0）
//   counterC     C 交易所柜台 + 风控名单 + 关卡特写（seg3 L18–L20 终点；seg4 起点 L0）
//   chainD       D 链级冻结：链 + 验证者转台 + 多签保险箱 + 安全委员会（seg4 L1–L9）
//   talkD        D 谈判：喊话塔 + 赏金信封 + 归还签 + 点阵（seg4 L10–L15）
//   courtD       D 法院：天平 + 云存储桶 + 私钥 + 沙漏 + 两份文件（seg4 L16–L20 终点；seg5 起点）
//   warE         E 作战室：工位 + 告警灯 + 时钟 + 暂停闸 + 地址清单（seg5 L0–L3、L15–L16）
//   notifyE      E 通知：地址清单 + 五封信 + 五块收件牌 + 登记台（seg5 L4–L6）
//   prepE        E 准备：喊话塔（左）+ 证据保全相机 + 机柜 + 报案 + 安全港盾 + 监控放大镜 + 值守板（seg5 L7–L14、L17 终点；seg6 起点）
//   userE        E 用户角：你 + 手机 + 全新地址 + 新助记词 + 新设备 + 两份记录 + 追回诈骗者（seg6 L0–L6）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.counterC

// 段内镜头：B 区铸币机 + T3 牌 + 法规角点阵（L7–L9）
const bAll = L.fit([L.rect(L.MINT[0], "mintPress"), L.rect(L.MINT[1], "mintPress"), ...L.ADDR_B.map((q) => L.rect(q, "addrPlate")),
  L.rect(L.AMM, "ammPool"), L.rect(L.T3, "signPlate"), L.rect(L.DOTS_LAW, "dotsLaw")], [100, 280, 1820, 860], 1.4);
const S = segInit(import.meta.url, { cams: { ...L.CAMS, bAll }, ext: [E1, E2, E3, E4, E6, E8, E11] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;
const P = (o) => at(o);                                         // 世界画布点
const zc = (U0) => (du, dv) => ({ u: U0 + du, v: dv });
const za = zc(0), zb = zc(3200), zC = zc(6900);
/** 不支持 opts.scale 的物件：绕地面点包一层并换算 anchors；hid 给出时整组先隐藏 */
function wput(key, o, r, k, dy = 0, hid) {
  const [gx, gy] = P(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, r, dy, { wrap: (svg) => { const g = `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`; return hid ? S.hid(hid, g) : g; } });
  for (const n of Object.keys(A[key])) { const v = A[key][n]; if (Array.isArray(v) && typeof v[0] === "number" && v.length === 2) A[key][n] = sc(v); }
}
const poly = (pts, attrs) => `<polygon points="${pts.map((p) => P(p).map((x) => x.toFixed(1)).join(",")).join(" ")}" ${attrs}/>`;
/** 点阵：n 点，cols 列，原生 SVG 圆，整组隐藏 */
function dots(id, o, n, cols, { fill = "#1f9d55", stroke = "none", sp = 20, r = 6.5 } = {}) {
  const [x0, y0] = P(o); let s = "";
  for (let i = 0; i < n; i++) s += `<circle cx="${x0 + 10 + (i % cols) * sp}" cy="${y0 + 10 + Math.floor(i / cols) * sp}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  add(o, S.hid(id, s), 900);
}

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 石板路 + 资金管（全程），国道（C 出城后）
add({ u: 0, v: 0 }, poly([{ u: L.ROAD.u0, v: L.ROAD.v0 }, { u: L.ROAD.u1, v: L.ROAD.v0 }, { u: L.ROAD.u1, v: L.ROAD.v1 }, { u: L.ROAD.u0, v: L.ROAD.v1 }],
  `fill="#dcd6cb" stroke="#c4bcae" stroke-width="2"`), -1e6);
add(L.HIGHWAY, poly([zC(1700, -230), zC(2900, -230), zC(2900, 230), zC(1700, 230)], `fill="#c9c6c0" stroke="#aaa59c" stroke-width="2"`)
  + poly([zC(1750, -6), zC(2850, -6), zC(2850, 6), zC(1750, 6)], `fill="#fffdf8" opacity="0.9"`), -1e6 + 1);
put("pipe", L.PIPE.o, E1.pipe(L.PIPE.o, { id: "pipe", pts: L.PIPE.pts, r: 8, flowColor: "#e0453a" }), -1e6 + 2);

// A 被盗现场
put("hotsafe", L.HOTSAFE, O.safe(L.HOTSAFE, { id: "hotsafe", variant: "hot", plate: "热钱包", open: 105, state: "broken" }));
put("atkA", L.ATK_A, O.person(L.ATK_A, { id: "atkA", role: "attacker", scale: L.ATK_A.scale }));
wput("pause", L.PAUSE_A, O.knifeSwitch(L.PAUSE_A, { id: "pause", on: false, text: "协议暂停" }), 0.7);
wput("tlock", L.TLOCK_A, E1.timeLock(L.TLOCK_A, { id: "tlock", frac: 1 }), 0.6);
wput("meth", L.METH, E3.contractMachine(L.METH, { id: "meth", name: "mETH" }), 0.55);
L.CMETH.forEach((q, i) => put(`cm${i}`, q, E6.shareCert(q, { id: `cm${i}`, scale: q.scale, text: "cmETH", stand: true })));
add(L.CMETH[0], S.hid("cmGlow", poly([za(1190, -240), za(1650, -240), za(1650, -100), za(1190, -100)], `fill="#1f9d55" fill-opacity="0.12" stroke="#1f9d55" stroke-width="4" stroke-dasharray="10 6"`)), -40);
const ENG_A = za(-520, -120);
put("engA", ENG_A, O.person(ENG_A, { id: "engA", role: "engineer", scale: 0.5 }), 0, { grow: true });
put("signA", L.SIGN_A, E1.signBoard(L.SIGN_A, { id: "signA", style: "plate", text: "被盗现场" }));
dots("dA", L.DOTS_A, 43, 11, { sp: 26, r: 8.5 });
{ const [x0, y0] = P(L.DOTS_A); add(L.DOTS_A, S.hid("dAring", `<rect x="${x0 - 14}" y="${y0 - 14}" width="318" height="132" rx="40" fill="none" stroke="#1f9d55" stroke-width="5"/>`), 901); }
// 攻击者伸向 mETH 出口 → 被时间锁挡住
{ const a0 = up(A.atkA.top, 4), a1 = A.tlock.center, mx = (a0[0] + a1[0]) / 2, my = Math.min(a0[1], a1[1]) - 120;
  add(L.TLOCK_A, S.hid("reach", `<path d="M${a0[0]} ${a0[1]} Q${mx} ${my} ${a1[0] - 30} ${a1[1] + 10}" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="12 8"/>
    <g transform="translate(${a1[0] - 30},${a1[1] + 10})"><circle r="24" fill="#fff" stroke="#e0453a" stroke-width="4"/><path d="M-11 -11L11 11M11 -11L-11 11" stroke="#e0453a" stroke-width="5" stroke-linecap="round"/></g>`), 600); }

// B 发行方路口（铸币机一侧）
L.MINT.forEach((q, i) => put(`mint${i}`, q, E11.mintPress(q, { id: `mint${i}`, scale: q.scale, plate: ["USDT", "USDC"][i] })));
L.ADDR_B.forEach((q, i) => wput(`addrB${i}`, q, E2.addrPlate(q, { id: `addrB${i}`, text: "攻击者地址" }), q.scale));
const LKB = zb(-450, 215);
wput("lkB", LKB, O.padlock(LKB, { id: "lkB" }), 0.6, 0, "lkBg");
put("clk37", L.CLOCK_B[0], O.clock(L.CLOCK_B[0], { id: "clk37" }));
put("amm", L.AMM, E8.ammPool(L.AMM, { id: "amm", scale: L.AMM.scale, labelL: "USDT", labelR: "ETH" }));
put("signB", L.SIGN_B, E1.signBoard(L.SIGN_B, { id: "signB", style: "plate", text: "发行方路口" }));
// B 法规角
put("t3", L.T3, E1.signBoard(L.T3, { id: "t3", style: "plate", text: "T3 金融犯罪部门", size: 34 }), 0, { grow: true });
const DOC_REQ = zb(1000, 150);
put("dreq", DOC_REQ, O.doc(DOC_REQ, { id: "dreq", title: "执法请求", standing: true, lines: ["请求冻结", "地址 · 金额"] }), 0, { grow: true });
wput("seal", L.SEAL_B, O.seal(L.SEAL_B, { id: "seal", markText: "法院", stamped: false }), L.SEAL_B.scale);
put("dtro", L.DOC_TRO, O.doc(L.DOC_TRO, { id: "dtro", title: "临时限制令", standing: true, stampText: "法院", lines: ["冻结 USDC", "约 5760 万美元"] }), 0, { grow: true });
put("dlift", L.DOC_LIFT, O.doc(L.DOC_LIFT, { id: "dlift", title: "解除冻结", standing: true, lines: ["8 月 · 法官", "未证明不可弥补损害"] }), 400, { grow: true });
put("dgen", L.DOC_GENIUS, O.doc(L.DOC_GENIUS, { id: "dgen", title: "GENIUS 法案", standing: true, lines: ["冻结", "扣押", "阻止转账"] }), 0, { grow: true });
put("clk6", L.CLOCK_B[1], O.clock(L.CLOCK_B[1], { id: "clk6" }), 0, { grow: true });
dots("dT3", L.DOTS_LAW, 45, 15);
dots("dTro", L.DOTS_LAW, 58, 15, { fill: "#2aa3c9" });
dots("dTroG", L.DOTS_LAW, 58, 15, { fill: "none", stroke: "#a39d92" });
dots("dDrift", L.DOTS_LAW, 23, 12, { fill: "#e0453a" });

// C 出城口
wput("bridge", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "bridge" }), L.BRIDGE.scale);
wput("mixer", L.LOTTERY, E2.lottery(L.LOTTERY, { id: "mixer", plate: "混币器" }), L.LOTTERY.scale);
put("stall", L.STALL, E8.marketStall(L.STALL, { id: "stall", scale: L.STALL.scale, head: "场外交易" }));
put("counter", L.COUNTER, E4.tellerCounter(L.COUNTER, { id: "counter", scale: L.COUNTER.scale, sign: "交易所 · 风控" }));
L.CHECKS.forEach((q, i) => wput(`chk${i}`, q, O.checkpoint(q, { id: `chk${i}`, n: "①②③④"[i], armUp: true }), q.scale));
put("rdoc", L.RISKDOC, O.doc(L.RISKDOC, { id: "rdoc", title: "风控名单", standing: true, lines: ["地址 4", "地址 5", "地址 6"] }));
L.ADDR_C.forEach((q, i) => wput(`addrC${i}`, q, E2.addrPlate(q, { id: `addrC${i}`, text: `地址 ${i + 1}` }), q.scale));
put("robber", L.ROBBER, O.person(L.ROBBER, { id: "robber", role: "attacker", scale: L.ROBBER.scale }));
// L20 劫匪绕开柜台 → 场外交易摊（红虚线箭头）
const RB = P(L.ROBBER), RT = P(zC(560, -300)), RM = P(zC(1250, -60));
add(zC(560, -300), S.hid("dodge", `<path d="M${RB[0]} ${RB[1] - 20} Q${RM[0] + 60} ${RM[1] + 90} ${RT[0] + 24} ${RT[1] + 6}" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="12 8"/>
  <path d="M${RT[0] + 4} ${RT[1] - 4} l30 -4 l-14 24 z" fill="#e0453a"/>`), 2000);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
// L0 三道拦截点（资金管上方，exitC 画面里从左到右）
[["① 协议", -1050], ["② 发行方", -150], ["③ 交易所", 750]].forEach(([s, du], i) => lb(`lb-row${i}`, up(P(zC(du, 0)), 60), s, "lab-cs"));
lb("lb-pause", up(A.pause.top, 8), "协议暂停", "lab-ink");
lb("lb-tlock", up(A.tlock.top, 8), "提款延迟 8 小时", "lab-ink");
lb("lb-meth", [A.meth.center[0] - 95, A.meth.center[1]], "mETH Protocol", "lab-ink", "r");
lb("lb-eng", up(A.engA.top, 6), "有人值守", "lab-cs lab-sm");
lb("lb-cm", [P(za(1420, -100))[0], P(za(1420, -100))[1] + 30], "cmETH 留在协议里", "lab-g lab-sm", "t");
{ const [x0, y0] = P(L.DOTS_A); lb("lb-dA", [x0 + 145, y0 + 128], "约 4300 万美元 cmETH · 每点约 100 万", "lab-g lab-sm", "t");
  lb("lb-dAmax", [x0 + 312, y0 + 50], "单项最多", "lab-g", "l"); }
lb("lb-mint0", up(A.mint0.top, 8), "USDT 发行方", "lab-ink");
lb("lb-mint1", up(A.mint1.top, 8), "USDC 发行方", "lab-ink");
lb("lb-lkB", [A.lkB.ground[0], A.lkB.ground[1] + 16], "合约层冻结", "lab-cs lab-sm", "t");
{ const g = A.t3.ground; ["Tether", "TRON", "TRM"].forEach((s, i) => lb(`lb-t3${i}`, [g[0] - 240 + i * 240, g[1] + 16], s, "lab-cs lab-sm", "t")); }
{ const [x0, y0] = P(L.DOTS_LAW);
  lb("lb-dT3", [x0 + 150, y0 + 96], "4.5 亿美元以上 · 自报", "lab-g lab-sm", "t");
  lb("lb-dTro", [x0 + 150, y0 + 96], "约 5760 万美元 USDC · 每点约 100 万", "lab-cs lab-sm", "t");
  lb("lb-dTroG", [x0 + 150, y0 + 96], "冻结解除", "lab-ink lab-sm", "t");
  lb("lb-dDrift", [x0 + 150, y0 + 60], "约 2.32 亿美元转走", "lab-r lab-sm", "t");
  lb("lb-claim", [x0 + 130, y0 + 20], "个人指控 · 未见 Circle 回应", "lab-ink lab-sm", "c"); }
lb("lb-clk6", up(A.clk6.top, 8), "约 6 小时", "lab-r");
lb("lb-counter", up(A.counter.top, 10), "第三道 · 交易所冻结", "lab-cs");
lb("lb-hit", [A.rdoc.center[0] + 70, A.rdoc.center[1]], "命中", "lab-r", "l");
lb("lb-robber", up(A.robber.top, 6), "攻击者", "lab-r lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const src = (id, s) => `<div class="ev-src" id="${id}">${s}</div>`;
const html = [
  kw("kw-design", "事先<b>设计</b>", { x: 660, y: 120, size: 38, accent: "#2aa3c9" }),
  kw("kw-watch", "有人<b>值守</b>", { x: 660, y: 196, size: 38, accent: "#2aa3c9" }),
  evt("e-bybit", `Bybit 被盗 · 2025 年 2 月${src("s-bybit", "The Block 报道")}`, { top: 120 }),
  evt("e-t3", `T3 成立 · 2024 年 9 月${src("s-t3", "The Block 报道 · TRM")}`, { top: 124 }),
  kw("kw-gate", "门槛", { x: 640, y: 120, size: 38, accent: "#1c1c1c" }),
  kw("kw-lag", `时延<i class="rdot"></i>`, { x: 790, y: 124, size: 38, accent: "#1c1c1c" }),
  kw("kw-rev", `可能被撤销<i class="rdot"></i>`, { x: 960, y: 128, size: 38, accent: "#1c1c1c" }),
  evt("e-libra", `LIBRA 案 · 2025 年 5 月${src("s-libra", "Cointelegraph 报道")}`, { top: 128, color: "#e0453a" }),
  evt("e-drift", `Drift 被盗 · 2026 年 4 月${src("s-drift", "The Block 报道")}`, { top: 132, color: "#e0453a" }),
  evt("e-genius", `GENIUS 法案 · 2025 年 7 月${src("s-genius", "法律原文")}`, { top: 136 }),
  kw("kw-hour", "时效：<b>小时级</b>", { x: 660, y: 124, size: 40, accent: "#17809f" }),
].join("\n");
const css = `
  .ev-src{margin-top:6px;font-size:28px;font-weight:600;color:#6d685e;opacity:0}
  .rdot{display:inline-block;width:14px;height:14px;border-radius:50%;background:#e0453a;margin-left:10px;vertical-align:middle}
  #lb-claim{color:#6d685e;border-color:#a39d92;background:#f4f1ea}`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  delay: w("延迟提款", 1), design: w("事先设计", 2), watch: w("有人值守", 2),
  bybit: w("Bybit", 3), tdelay: w("提款延迟", 3), pause: w("暂停了合约", 3), back: w("追回约", 3),
  most: w("追回最多", 4), mint: w("稳定币发行方", 5), freeze: w("冻结一个地址", 6),
  t3: w("T3", 7), self: w("累计冻结", 8),
  gate: w("有门槛", 9), lag: w("有时延", 9), rev: w("撤销", 9),
  req: w("执法请求", 10), court: w("法院命令", 10),
  libra: w("LIBRA", 11), tro: w("临时限制令", 12), froze: w("冻结了", 12),
  lift: w("解除了冻结", 13), drift: w("Drift", 14), lagc: w("延迟了", 15), gone: w("转走", 15),
  claim: w("个人指控", 16), genius: w("GENIUS", 17), seize: w("扣押", 17),
  exch: w("交易所冻结", 18), list: w("地址清单", 19), hit: w("风控名单", 19), hour: w("小时级", 19), avoid: w("避开", 20),
};
const t = (x) => f(x);
// L20 劫匪走到场外交易摊前
const DODGE = [RT[0] + 30 - RB[0], RT[1] + 30 - RB[1]];
// L15 红点沿资金管右移（+u 方向的屏幕位移）
const FLOW = [P({ u: 700, v: 0 })[0] - P({ u: 0, v: 0 })[0], P({ u: 700, v: 0 })[1] - P({ u: 0, v: 0 })[1]];

S.build({
  cam0: "exitC", sub: "越靠前，越管用",
  grid: { u0: -2000, u1: 10900, v0: -6700, v1: 5800 }, box: [-1460, -3560, 9690, 4180],   // 盖住本段镜头 exitC / heistA / mintB / lawB / counterC（含上一段终点）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "延迟提款", d: "大额提款要等一段时间才到账", at: w("延迟提款", 1) },
    { id: "t1", t: "临时限制令", d: "法院判决前先下的紧急禁令", at: w("临时限制令", 12) },
    { id: "t2", t: "风控名单", d: "交易所拒绝或冻结的地址名单", at: w("风控名单", 19) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 从早到晚，能拦钱的地方排成一列。（exitC）
      [0, 1, 2].forEach((i) => pop("#lb-row" + i, ${t(LS[0] + 0.6)} + i * 0.5, 0.3));
      // ===== L1 最靠前的，是协议自己的暂停和延迟提款。（左移到 heistA）
      out("#lb-row0, #lb-row1, #lb-row2", ${t(LS[1] - 0.25)}, 0.2);
      cam(${t(LS[1])}, "heistA", 1.8);
      pop("#lb-pause", ${t(LS[1] + 1.8)}); pop("#lb-tlock", ${t(TM.delay)}); 
     
      // ===== L2 条件是合约里事先设计了暂停或延迟机制，而且有人值守。
      pop("#kw-design", ${t(TM.design)}); pop("#kw-watch", ${t(TM.watch)});
      grow("engA", ${t(TM.watch)}); pop("#lb-eng", ${t(TM.watch + 0.4)});
      // ===== L3 关键画面：攻击者伸手被 8 小时延迟挡住，闸刀拉下，cmETH 留住，43 点
      out("#kw-design, #kw-watch", ${t(LS[3] - 0.2)});
      pop("#e-bybit", ${t(TM.bybit)}); pop("#lb-meth", ${t(TM.bybit + 1.4)}); fadeIn("#s-bybit", ${t(TM.bybit + 0.5)}, 0.3);
      fadeIn("#reach", ${t(TM.tdelay - 0.4)}, 0.4); X1.countdown(tl, "tlock", ${t(TM.tdelay)}, 2.0, 0.55);
      KIT.toggle(tl, "pause", ${t(TM.pause)}, true, 0.5);
      fadeIn("#cmGlow", ${t(TM.back)}, 0.4); pop("#lb-cm", ${t(TM.back + 0.2)});
      fadeIn("#dA", ${t(TM.back + 0.4)}, 0.6); pop("#lb-dA", ${t(TM.back + 0.8)});
      // ===== L4 这是那次事件里，追回最多的单项。
      fadeIn("#dAring", ${t(TM.most)}, 0.4); pop("#lb-dAmax", ${t(TM.most + 0.3)});
      // ===== L5 第二道，是稳定币发行方冻结。（右移到 mintB）
      out("#e-bybit, #reach, #lb-pause, #lb-tlock, #lb-meth, #lb-eng, #lb-cm, #lb-dA, #lb-dAmax", ${t(LS[5] - 0.25)}, 0.2);
      cam(${t(LS[5])}, "mintB", 1.6);
      pop("#lb-mint0", ${t(TM.mint + 0.6)}); pop("#lb-mint1", ${t(TM.mint + 0.9)});
      // ===== L6 发行方在合约层面冻结一个地址：锁挂到地址牌上
      tl.fromTo("#lkBg", { opacity: 0, y: -90 }, { opacity: 1, y: 0, duration: 0.5, ease: "bounce.out", immediateRender: false }, ${t(TM.freeze)});
      pop("#lb-lkB", ${t(TM.freeze + 0.5)});
      // ===== L7 T3 成立（拉到 bAll：铸币机 + T3 牌 + 点阵）
      out("#lb-lkB", ${t(LS[7] - 0.2)}, 0.2);
      cam(${t(LS[7])}, "bAll", 1.4);
      grow("t3", ${t(TM.t3)}); [0, 1, 2].forEach((i) => pop("#lb-t3" + i, ${t(TM.t3 + 0.5)} + i * 0.25, 0.25));
      pop("#e-t3", ${t(TM.t3 + 0.2)}); fadeIn("#s-t3", ${t(TM.t3 + 0.6)}, 0.3);
      // ===== L8 自报累计冻结 4.5 亿美元以上：45 点绿
      fadeIn("#dT3", ${t(TM.self)}, 0.6); pop("#lb-dT3", ${t(TM.self + 0.5)});
      // ===== L9 门槛、时延、可能被撤销
      out("#e-t3", ${t(LS[9] - 0.2)}, 0.2);
      pop("#kw-gate", ${t(TM.gate)}); pop("#kw-lag", ${t(TM.lag)}); pop("#kw-rev", ${t(TM.rev)});
      // ===== L10 门槛：执法请求或法院命令（lawB）
      out("#lb-t30, #lb-t31, #lb-t32, #dT3, #lb-dT3, #lb-mint0, #lb-mint1", ${t(LS[10] - 0.25)}, 0.2);
      cam(${t(LS[10])}, "lawB", 1.4);
      out("#kw-gate, #kw-lag, #kw-rev", ${t(LS[10] + 1.6)}, 0.25);
      grow("dreq", ${t(TM.req)}); KIT.stamp(tl, "seal", ${t(TM.court)});
      // ===== L11 撤销的例子：LIBRA 案
      pop("#e-libra", ${t(TM.libra)});
      // ===== L12 临时限制令冻结约 5760 万美元：58 点青蓝
      grow("dtro", ${t(TM.tro)}); fadeIn("#s-libra", ${t(TM.tro)}, 0.3);
      fadeIn("#dtro-stampmark", ${t(TM.tro + 0.8)}, 0.2);
      fadeIn("#dTro", ${t(TM.froze)}, 0.6); pop("#lb-dTro", ${t(TM.froze + 0.4)});
      // ===== L13 8 月法官解除冻结：解除冻结压到上面，点阵变灰空心
      grow("dlift", ${t(TM.lift)});
      tl.to("#dlift", { x: ${f(P(L.DOC_TRO)[0] - P(L.DOC_LIFT)[0] + 40)}, y: ${f(P(L.DOC_TRO)[1] - P(L.DOC_LIFT)[1] + 30)}, duration: 0.7, ease: "power2.out" }, ${t(TM.lift + 0.5)});
      out("#dTro, #lb-dTro", ${t(TM.lift + 0.6)}, 0.4); fadeIn("#dTroG", ${t(TM.lift + 0.6)}, 0.4); pop("#lb-dTroG", ${t(TM.lift + 1.0)});
      // ===== L14 时延的例子：Drift
      out("#e-libra, #dTroG, #lb-dTroG, #dreq", ${t(LS[14] - 0.2)}, 0.2);
      pop("#e-drift", ${t(TM.drift)});
      // ===== L15 延迟约 6 小时，约 2.32 亿美元转走（23 红点沿资金管流向跨链桥）
      grow("clk6", ${t(TM.lagc - 0.3)}); pop("#lb-clk6", ${t(TM.lagc + 0.2)}); KIT.clock(tl, "clk6", ${t(TM.lagc + 0.2)}, 7.0, 360);
      fadeIn("#s-drift", ${t(TM.lagc)}, 0.3);
      fadeIn("#dDrift", ${t(TM.lagc + 1.2)}, 0.4); pop("#lb-dDrift", ${t(TM.lagc + 1.5)});
      tl.to("#dDrift", { x: ${f(FLOW[0])}, y: ${f(FLOW[1])}, opacity: 0.25, duration: 2.2, ease: "power1.in" }, ${t(TM.gone)});
      // ===== L16 个人指控、未见回应
      out("#lb-dDrift", ${t(LS[16] - 0.2)}, 0.2); pop("#lb-claim", ${t(TM.claim)});
      // ===== L17 GENIUS 法案：冻结 / 扣押 / 阻止转账
      out("#e-drift, #lb-claim, #dDrift", ${t(LS[17] - 0.2)}, 0.2);
      grow("dgen", ${t(TM.genius)}); pop("#e-genius", ${t(TM.genius + 0.2)}); fadeIn("#s-genius", ${t(TM.genius + 0.8)}, 0.3);
     
      // ===== L18 第三道，交易所冻结（右移到 counterC）
      out("#e-genius, #lb-clk6", ${t(LS[18] - 0.25)}, 0.2);
      cam(${t(LS[18])}, "counterC", 1.8);
      pop("#lb-counter", ${t(LS[19] + 0.4)});
      // ===== L19 地址清单 / 风控名单命中 → 道闸落下，小时级
      pop("#lb-hit", ${t(TM.hit)}); KIT.arm(tl, "chk3", ${t(TM.hit + 0.3)}, false);
      pop("#kw-hour", ${t(TM.hour)});
      // ===== L20 攻击者会避开合规交易所：劫匪绕开柜台走向场外交易摊
            pop("#lb-robber", ${t(LS[20] + 0.2)}); fadeIn("#dodge", ${t(TM.avoid - 0.2)}, 0.5);
      tl.to("#robber", { x: ${f(DODGE[0])}, y: ${f(DODGE[1])}, duration: 2.0, ease: "power1.inOut" }, ${t(TM.avoid + 0.2)});
      out("#lb-robber, #kw-hour", ${t(TM.avoid + 0.3)}, 0.2);
`,
});
