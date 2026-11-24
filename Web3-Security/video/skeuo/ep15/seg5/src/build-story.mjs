// ep15/seg5「⑤ 范围与边界」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.devD（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   A            ---- A 托管机房
//   hotA         
//   clockA       
//   bankB        ---- B 银行柜台
//   flowC        ---- C 4337 流水线
//   hashC        
//   payC         
//   ownerC       
//   bicoC        
//   envC         
//   D            ---- D 7702
//   plateD       
//   chainsD      
//   batchD       
//   devD         
//   E            ---- E 钥匙与守护人
//   passE        
//   sessionE     
//   F            ---- F 意图集市
//   intentF      
//   permitF      
//   EF           ---- across zones
//   wide         
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E10 from "../../../ep10/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.permitF

// 段内镜头：会话密钥那一镜把世界压到右侧，左边留给代码卡 D 和前端代码卡
const sessE = L.fit([L.rect(L.MKEY, "key"), ...L.KEYCARDS.map((q) => L.rect(q, "keycard")), L.rect(L.GAME, "miniVend"), L.rect(L.TOKSAFE, "safe"), L.rect(L.DOTS_E, "dotsE")], [760, 300, 1820, 860]);
const S = segInit(import.meta.url, { cams: { ...L.CAMS, sessE }, ext: [E1, E3, E5, E8, E9, E10, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 助手
const px = (X0, Y0, extra = {}) => { const q = G(X0, Y0); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
const eZ = (x, y, e) => px(9850 + x, y, e), fZ = (x, y, e) => px(12100 + x, y, e);
const isPt = (v) => Array.isArray(v) && v.length === 2 && typeof v[0] === "number";
/** 不支持 scale 的物件：绕地面点包一层缩放，并换算 anchors（SEGBASE 常见坑 1） */
function putK(key, o, r, k, dy = 0, hidId) {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  const g = (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`;
  put(key, o, r, dy, { wrap: (svg) => (hidId ? S.hid(hidId, g(svg)) : g(svg)) });
  for (const n of Object.keys(A[key])) if (isPt(A[key][n])) A[key][n] = sc(A[key][n]);
}
/** 点阵：n 个点，cols 列，从世界画布点 p 起排；每点一个 id（id-i） */
const dots = (id, p, n, cols, { color = "#e0453a", step = 26, r = 8 } = {}) =>
  S.hid(id, Array.from({ length: n }, (_, i) => `<circle id="${id}-${i}" cx="${f(p[0] + (i % cols) * step + r)}" cy="${f(p[1] + Math.floor(i / cols) * step + r)}" r="${r}" fill="${color}"/>`).join(""));
const rbox = (id, [x0, y0, x1, y1], pad = 12) => S.hid(id, `<rect x="${f(x0 - pad)}" y="${f(y0 - pad)}" width="${f(x1 - x0 + 2 * pad)}" height="${f(y1 - y0 + 2 * pad)}" rx="14" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="14 10"/>`);
const ring = (id, [cx, cy], rx, ry) => S.hid(id, `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${rx}" ry="${ry}" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="14 10"/>`);
const wline = (id, a, b, color = "#e0453a") => S.hid(id, `<path d="M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}" stroke="${color}" stroke-width="5" stroke-dasharray="14 10" fill="none" stroke-linecap="round"/>`);
const TOP = { u: 0, v: 99999 };                          // 叠加层（红框、连线、点阵）按纵深排在最前

// ---------------------------------------------------------------- 世界物件
// D 区（上段段尾，镜头起点）
putK("slots", L.SLOTS, E3.slotCabinet(L.SLOTS, { id: "slots", title: "存储" }), 0.7);
put("dcoreDev", L.DCORE_DEV, E10.coreModule(L.DCORE_DEV, { id: "dcoreDev", scale: 0.7, ver: "新实现" }));
put("brD", L.BROWSER_D, O.browserWin(L.BROWSER_D, { id: "brD", title: "钱包网页", heading: "升级为智能账户？", button: "确认升级" }));

// E 区：Passkey 与守护人
put("signE", L.SIGN_E, E1.signBoard(L.SIGN_E, { id: "signE", style: "plate", text: "登录与会话" }));
const fp = `<rect x="0" y="0" width="76" height="150" fill="#eef8f2"/><g fill="none" stroke="#1f9d55" stroke-width="3.2" stroke-linecap="round">
  <path d="M24 70a14 14 0 0 1 28 0v14"/><path d="M18 64a20 20 0 0 1 40 0v22"/><path d="M30 72a8 8 0 0 1 16 0v18"/><path d="M38 72v22"/></g>
  <circle cx="58" cy="112" r="12" fill="#1f9d55"/><path d="M52 112l4 4 8-8" stroke="#fff" stroke-width="3" fill="none"/>`;
put("phone", L.PHONE, O.phone(L.PHONE, { id: "phone", screen2: fp }));
put("malext", L.MALEXT, O.browserWin(L.MALEXT, { id: "malext", state: "attacker", title: "恶意扩展", heading: "确认交易", button: "签名" }));
put("chqA", eZ(-250, 40), E9.cheque(eZ(-250, 40), { id: "chqA", state: "attacker", title: "攻击者构造", scale: 0.7, copies: 0 }), 0, { wrap: (s) => S.hid("chqA-w", s) });
putK("meter", L.METER_E, E5.thresholdMeter(L.METER_E, { id: "meter", max: 3, th: 2, level: 0, thText: "恢复" }), 0.7);
L.GUARDS.forEach((g, i) => put("g" + i, g, O.person(g, { id: "g" + i, role: "signer", scale: 0.6 }), 0, { grow: true }));
put("g1r", L.GUARDS[1], O.person(L.GUARDS[1], { id: "g1r", state: "attacker", scale: 0.6 }), 1, { wrap: (s) => S.hid("g1r-w", s) });

// E 区：会话密钥
put("mkey", L.MKEY, O.key(L.MKEY, { id: "mkey" }));
L.KEYCARDS.forEach((c, i) => put("kc" + i, c, E5.keycard(c, { id: "kc" + i, scale: 0.7, color: "#1d93ba", text: "SESSION", holder: "0x5e55…0001" }), 0, { wrap: (s) => S.hid("kc" + i + "-w", s) }));
put("game", L.GAME, E1.miniVend(L.GAME, { id: "game", kind: "plain", scale: 0.7 }));
const atkE = eZ(300, 30, { scale: 0.6 });
put("atkE", atkE, O.person(atkE, { id: "atkE", state: "attacker", scale: 0.6 }), 0, { grow: true });
putK("toksafe", L.TOKSAFE, O.safe(L.TOKSAFE, { id: "toksafe", plate: "代币 / NFT", glow: false }), 0.8);

// F 区：意图集市
put("signF", L.SIGN_F, E1.signBoard(L.SIGN_F, { id: "signF", style: "plate", text: "意图与授权" }));
put("order", L.ORDER, O.doc(L.ORDER, { id: "order", standing: true, title: "意图订单", lines: ["1 ETH →", "至少 3000 USDC", "期限"] }), 0, { grow: true });
put("solver", L.SOLVER, E8.liqBot(L.SOLVER, { id: "solver", scale: 0.8, scr: "Solver" }));
put("settle", L.SETTLE, E3.contractMachine(L.SETTLE, { id: "settle", name: "结算合约", tone: "light" }));
put("fpipe", L.FPIPE.o, E1.pipe(L.FPIPE.o, { id: "fpipe", pts: L.FPIPE.pts }), 0, { grow: true });
put("vuln", L.VULN, E1.miniVend(L.VULN, { id: "vuln", kind: "attacker", scale: 0.8 }), 0, { grow: true });
putK("bond", L.BOND, O.safe(L.BOND, { id: "bond", plate: "保证金", gold: true }), 0.8);
put("signV1", L.SIGN_V1, E1.signBoard(L.SIGN_V1, { id: "signV1", style: "plate", text: "已弃用 · Fusion v1", color: "#9a958b" }), 0, { grow: true });
put("resolver", L.RESOLVER, O.person(L.RESOLVER, { id: "resolver", role: "engineer", scale: 0.7 }), 0, { grow: true });
put("permit", L.PERMIT, E3.contractMachine(L.PERMIT, { id: "permit", name: "Permit2", tone: "gray" }));
put("pkey", L.PKEY, O.key(L.PKEY, { id: "pkey" }), 0, { grow: true });
put("offsig", L.OFFSIG, E9.cheque(L.OFFSIG, { id: "offsig", title: "链下签名" }), 0, { grow: true });
put("offsigA", L.OFFSIG, E9.cheque(L.OFFSIG, { id: "offsigA", state: "attacker", title: "链下签名", copies: 0 }), 1, { wrap: (s) => S.hid("offsigA-w", s) });

const dKey = [(A.permit.slot ?? A.permit.front)[0] - A.pkey.center[0], (A.permit.slot ?? A.permit.front)[1] - A.pkey.center[1]];
const dOff = [((A.permit.front ?? A.permit.center)[0] - A.offsig.center[0]) * 0.45, ((A.permit.front ?? A.permit.center)[1] - A.offsig.center[1]) * 0.45];
lb("lb-pkey", [A.pkey.center[0] + dKey[0] * 0.4 - 40, A.pkey.center[1] + dKey[1] * 0.4 + 50], "无限授权", "lab-rs lab-sm", "t");
// 叠加层（原生 SVG，默认隐藏）
const pE = at(L.DOTS_E), pF = at(L.DOTS_F), pF2 = at(L.DOTS_F2);
const goldP = A.bond.front ?? A.bond.center;
add(TOP, [
  rbox("meterBox", L.rect(L.METER_E, "thresholdMeter", 0.7)),
  wline("g01", A.g0.head ?? A.g0.top, A.g1.head ?? A.g1.top),
  dots("dotsE", pE, 40, 8),
  wline("trust", A.solver.top, A.settle.front ?? A.settle.center),
  dots("dotsF17", pF, 17, 6),
  dots("dotsF50", [pF[0] - 20, pF[1] - 10], 50, 10, { step: 24, r: 7 }),
  S.hid("goldBars", [0, 1, 2].map((i) => `<rect x="${f(goldP[0] - 36 + i * 26)}" y="${f(goldP[1] - 12 - i * 6)}" width="30" height="14" rx="3" fill="#d6a531" stroke="#a87d1c" stroke-width="2"/>`).join("")),
  rbox("resBox", L.rect(L.RESOLVER, "person", 0.7), 10),
  S.hid("fakeOrd", `<g transform="translate(${f(A.settle.out?.[0] ?? A.settle.center[0])},${f(A.settle.out?.[1] ?? A.settle.center[1])})"><rect x="-34" y="-44" width="68" height="88" rx="6" fill="#fff6f4" stroke="#e0453a" stroke-width="3"/><path d="M-22 -24h44M-22 -8h44M-22 8h30" stroke="#e0453a" stroke-width="4"/></g>`),
  dots("dotsF2", pF2, 14, 7),
  ring("pkeyRing", [A.pkey.center[0] + dKey[0] * 0.4, A.pkey.center[1] + dKey[1] * 0.4], 110, 60),
  ring("offRing", [A.offsig.center[0] + dOff[0], A.offsig.center[1] + dOff[1]], 120, 90),
].join(""), 0);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-pass", up(A.phone.top, 10), "Passkey 解锁", "lab-gs");
lb("lb-phish", [A.phone.center[0] - 170, A.phone.center[1] - 40], "钓鱼网站", "lab-rs", "r");
lb("lb-block", [A.phone.center[0] - 150, A.phone.center[1] + 40], "挡住", "lab-gs lab-sm", "r");
lb("lb-mal", up(A.malext.top, 10), "恶意扩展", "lab-rs");
lb("lb-chq", up(A.chqA.top, 6), "攻击者构造的操作", "lab-r lab-sm");
lb("lb-g", up(A.g2.top, 10), "守护人", "lab-cs lab-sm");
lb("lb-meter", up(A.meter.top, 10), "恢复 2 / 3", "lab-cs");
lb("lb-same", [(A.g0.top[0] + A.g1.top[0]) / 2, Math.min(A.g0.top[1], A.g1.top[1]) - 40], "同一个账号", "lab-rs lab-sm");
lb("lb-entry", [A.meter.center[0] + 90, A.meter.center[1]], "恢复成了入口", "lab-rs", "l");
lb("lb-mkey", up(A.mkey.top, 30), "主密钥", "lab-ink lab-sm");
lb("lb-kc", up(A.kc0.top, 8), "会话密钥", "lab-cs lab-sm");
lb("lb-copy", [A.kc5.top[0] + 10, A.kc5.top[1] - 20], "所有用户 · 同一把密钥", "lab-rs lab-sm", "l");
lb("lb-game", up(A.game.top, 10), "游戏合约", "lab-ink lab-sm");
lb("lb-dotsE", [pE[0] + 110, pE[1] + 150], "约 40 万美元 · 每点约 1 万", "lab-r lab-sm", "t");
lb("lb-9000", [pE[0] + 110, pE[1] - 20], "约 9000 个钱包受影响", "lab-g lab-sm");
lb("lb-safe", up(A.toksafe.top, 10), "代币 / NFT 没受影响", "lab-gs");
lb("lb-order", up(A.order.top, 10), "意图订单", "lab-ink lab-sm");
lb("lb-solver", up(A.solver.top, 10), "Solver", "lab-cs lab-sm");
lb("lb-ex", [A.order.center[0] - 130, A.order.center[1] - 20], `1 ETH → 至少 3000 USDC ${gtag("示例", "font-size:22px")}`, "lab-cs lab-sm", "r");
lb("lb-wide1", [A.order.center[0] - 130, A.order.center[1] - 20], "至少 300 USDC ?", "lab-rs lab-sm", "r");
lb("lb-wide2", [A.order.center[0] - 130, A.order.center[1] + 90], "期限 30 天 ?", "lab-rs lab-sm", "r");
lb("lb-trust", [(A.solver.top[0] + A.settle.center[0]) / 2, (A.solver.top[1] + A.settle.center[1]) / 2 - 10], "信任边界", "lab-r lab-sm");
lb("lb-settle", up(A.settle.top, 10), "结算合约", "lab-ink lab-sm");
lb("lb-new", [A.solver.center[0], A.solver.center[1] + 40], "新加入的 Solver", "lab-rs lab-sm", "t");
lb("lb-pipe", up(A.fpipe.mid, 30), "DAI · 无限授权", "lab-rs lab-sm");
lb("lb-vuln", up(A.vuln.top, 10), "有漏洞的合约", "lab-r lab-sm");
lb("lb-dotsF", [pF[0] + 80, pF[1] + 90], "约 16.6 万美元 · 约一周的手续费", "lab-r lab-sm", "t");
lb("lb-slash", up(A.bond.top, 10), "罚没赔偿", "lab-gs lab-sm");
lb("lb-res", up(A.resolver.top, 8), "Resolver", "lab-cs lab-sm");
lb("lb-trust2", up(A.resolver.top, 120), "来自结算合约 → 信任", "lab-rs lab-sm");
lb("lb-dots50", [pF[0] + 100, pF[1] + 140], "约 500 万美元 · 每点约 10 万", "lab-r lab-sm", "t");
lb("lb-back", [pF[0] + 100, pF[1] - 20], "大部分经谈判退回", "lab-g lab-sm");
lb("lb-permit", up(A.permit.top, 10), "Permit2 · 统一授权合约", "lab-ink lab-sm");

lb("lb-off", up(A.offsig.top, 10), "链下签名", "lab-cs lab-sm");
lb("lb-off2", up(A.offsig.top, 10), "钓鱼签名", "lab-rs lab-sm");
lb("lb-dotsF2", [pF2[0] + 90, pF2[1] - 10], "约 140 万美元 · 每点约 10 万", "lab-r lab-sm");
lb("lb-ok", [A.permit.center[0], A.permit.center[1] - 10], "✓ 合约本身没被攻破", "lab-gs lab-sm", "c");

// ---------------------------------------------------------------- 屏幕层卡片
const CD = { x: 60, y: 140, w: 640 };
const cardD = codeCard("cd", { ...CD, head: "会话密钥的四个范围", tag: "示例", mono: true, rows: [
  { html: "target   = 游戏合约", chip: "✓", chipCls: "ok" },
  { html: "selector = play()", chip: "✓", chipCls: "ok" },
  { html: "spent + amount &lt;= 0.1 ETH", chip: "✓ 累计", chipCls: "ok" },
  { html: "expiry   = 24 小时", chip: "✓", chipCls: "ok" },
] });
const cardF = codeCard("cf", { x: 60, y: 560, w: 640, head: "前端代码 · app.js", tag: "示意", mono: true, rows: [
  { html: "const sessionKey =" },
  { html: "&nbsp;&nbsp;\"0x……\"  // 私钥明文", chip: "私钥", chipCls: "x" },
] });
const html = cardD + cardF +
  kw("kw-pk", `Passkey 保护登录 · <b>不保护签名内容</b>`, { x: 380, y: 150, size: 44, accent: "#e0453a" }) +
  evt("ev-cardex", `<b>Cardex</b> · Abstract L2 · 2025 年 2 月<br>${gtag("The Block · Decrypt 报道", "margin-left:0")}`, { color: "#e0453a", top: 120 }) +
  evt("ev-cow", `<b>CoW Swap</b> · 2023 年 2 月<br>${gtag("CoW 事后报告 · CIP-22", "margin-left:0")}`, { color: "#e0453a", top: 124 }) +
  evt("ev-1inch", `<b>1inch Fusion v1</b> · 2025 年 3 月<br>${gtag("1inch 公告 · BlockSec 分析", "margin-left:0")}`, { color: "#e0453a", top: 128 }) +
  evt("ev-p2doc", `<b>Permit2</b> · Uniswap 部署<br>${gtag("Uniswap Permit2 文档", "margin-left:0")}`, { top: 132 }) +
  evt("ev-p2", `<b>Permit2 钓鱼</b> · 2024 年 10 月<br>约 140 万美元 ${gtag("Decrypt 报道", "margin-left:0")}`, { color: "#e0453a", top: 136 });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {};
const t = (x) => f(x);
const sv = (dx, dy) => [dx, dy];
const dGold = [(A.settle.center[0] - goldP[0]), (A.settle.center[1] - goldP[1])];
const dPh = [A.phone.center[0] - (A.phone.center[0] - 170), 0];
const dChq = [A.malext.center[0] - A.chqA.center[0], A.malext.center[1] - A.chqA.center[1]];
const dRes = [A.resolver.center[0] - (A.settle.out ?? A.settle.center)[0], A.resolver.center[1] - (A.settle.out ?? A.settle.center)[1]];

S.build({
  cam0: "devD", sub: "授权的范围，就是出事时的损失范围",
  grid: { u0: 4800, u1: 12600, v0: 2200, v1: 9500 }, box: [7300, -1100, 6500, 2000],   // D 段尾 → E → F
  shown: [], css, html,
  terms: [
    { id: "t0", t: "Passkey", d: "用设备芯片保存私钥的登录凭证", at: w("Passkey", 1) },
    { id: "t1", t: "Solver", d: "替意图找成交路径并结算的角色", at: w("Solver", 13) },
    { id: "t2", t: "罚没", d: "没收违规参与者押下的保证金", at: w("罚没", 20) },
    { id: "t3", t: "Resolver", d: "替订单完成成交的第三方角色", at: w("Resolver", 21) },
    { id: "t4", t: "无限授权", d: "允许合约转走该代币的任意数量", at: w("无限授权", 25) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 账户变成合约，登录和授权的方式也变了。 横移到 E
      cam(${t(LS[0] + 0.2)}, "passE", 2.2);
      // ===== L1 Passkey：指纹解锁 + 绿勾
      KIT.swap(tl, "#phone-scr", "#phone-scr2", ${t(LS[1] + 0.6)}, 0.4); pop("#lb-pass", ${t(LS[1] + 0.9)});
      // ===== L2 钓鱼网站被弹开；恶意扩展亮红
      out("#lb-pass", ${t(LS[2] - 0.1)}); pop("#lb-phish", ${t(LS[2] + 0.3)});
      tl.fromTo("#lb-phish", { x: -40 }, { x: 60, duration: 0.45, ease: "power2.in", immediateRender: false }, ${t(LS[2] + 0.7)});
      tl.to("#lb-phish", { x: -80, duration: 0.5, ease: "power2.out" }, ${t(LS[2] + 1.15)}); pop("#lb-block", ${t(LS[2] + 1.15)});
      pop("#lb-mal", ${t(LS[2] + 3.0)}); flash("#lb-mal", ${t(LS[2] + 3.4)}, 3);
      // ===== L3 解锁后照样能请你签攻击者构造的操作
      out("#lb-phish, #lb-block", ${t(LS[3] - 0.2)});
      tl.fromTo("#chqA-w", { x: ${dChq[0]}, y: ${dChq[1]}, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.9, ease: "power2.out", immediateRender: false }, ${t(LS[3] + 0.3)});
      pop("#lb-chq", ${t(LS[3] + 1.2)}); pop("#lb-pass", ${t(LS[3] + 1.2)}); pop("#kw-pk", ${t(LS[3] + 1.6)});
      // ===== L4 社交恢复：守护人 + 液位升到 2
      out("#kw-pk, #lb-chq, #lb-mal, #lb-pass", ${t(LS[4] - 0.2)});
      grow("g0", ${t(LS[4] + 0.3)}); grow("g1", ${t(LS[4] + 0.5)}); grow("g2", ${t(LS[4] + 0.7)}); pop("#lb-g", ${t(LS[4] + 1.0)});
      X5.fill(tl, "meter", ${t(LS[4] + 1.4)}, 2, 1.4); pop("#lb-meter", ${t(LS[4] + 2.6)});
      // ===== L5 守护人不独立 / 被盗：同一个账号，一人变红，恢复成了入口
      out("#lb-g", ${t(LS[5] + 0.1)}); fadeIn("#g01", ${t(LS[5] + 0.3)}, 0.4); pop("#lb-same", ${t(LS[5] + 0.5)});
      fadeIn("#g1r-w", ${t(LS[5] + 1.6)}, 0.4); out("#g1", ${t(LS[5] + 1.6)}, 0.4);
      fadeIn("#meterBox", ${t(LS[5] + 2.4)}, 0.3); out("#lb-meter", ${t(LS[5] + 2.3)}); pop("#lb-entry", ${t(LS[5] + 2.6)});
      // ===== L6 会话密钥：主密钥旁生出一张卡
      out("#lb-same, #lb-entry, #meterBox, #g01", ${t(LS[6] - 0.2)});
      cam(${t(LS[6])}, "sessE", 1.4); pop("#lb-mkey", ${t(LS[6] + 1.2)});
      tl.fromTo("#kc0-w", { x: -120, y: -30, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.7, ease: "power2.out", immediateRender: false }, ${t(LS[6] + 1.8)});
      pop("#lb-kc", ${t(LS[6] + 2.4)});
      // ===== L7 四件事：代码卡 D 逐行绿勾
      pop("#cd", ${t(LS[7] + 0.2)}); [0, 1, 2, 3].forEach((i) => pop("#cd-c" + i, ${t(LS[7] + 1.4)} + i * 1.1, 0.25));
      // ===== L8 Cardex：同一把会话密钥复制给所有用户（关键画面）
      pop("#ev-cardex", ${t(LS[8] + 0.2)}); out("#lb-mkey", ${t(LS[8] + 0.2)});
      [1, 2, 3, 4, 5].forEach((i) => tl.fromTo("#kc" + i + "-w", { x: -90 * i, y: -30 * i, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.5, ease: "power2.out", immediateRender: false }, ${t(LS[8] + 1.4)} + i * 0.3));
      pop("#lb-copy", ${t(LS[8] + 3.2)}); grow("atkE", ${t(LS[8] + 3.4)}); pop("#lb-game", ${t(LS[8] + 3.6)});
      // ===== L9 私钥写在前端代码里
      pop("#cf", ${t(LS[9] + 0.2)}); pop("#cf-c1", ${t(LS[9] + 1.0)}); hot("#cf-r1", ${t(LS[9] + 1.0)}, "#fbe1de");
      // ===== L10 约 9000 个钱包、约 40 万美元：40 点从游戏合约流出
      fadeIn("#dotsE", ${t(LS[10] + 0.2)}, 0.1);
      tl.fromTo("#dotsE circle", { opacity: 0 }, { opacity: 1, duration: 0.12, stagger: 0.04, immediateRender: false }, ${t(LS[10] + 0.2)});
      pop("#lb-9000", ${t(LS[10] + 0.6)}); pop("#lb-dotsE", ${t(LS[10] + 2.0)});
      // ===== L11 代币 / NFT 没受影响（关键画面）
      fadeIn("#toksafe-glow", ${t(LS[11] + 0.4)}, 0.5); pop("#lb-safe", ${t(LS[11] + 0.6)});
      // ===== L12 范围限制起了作用：target 行闪绿
      hot("#cd-r0", ${t(LS[12] + 0.2)}, "#d9f2e3"); flash("#cd-c0", ${t(LS[12] + 0.3)}, 3, 0.3);
      // ===== L13 意图：横移到 F；订单立起，Solver 驶到订单前
      out("#cd, #cf, #ev-cardex, #lb-kc, #lb-copy, #lb-game, #lb-9000, #lb-dotsE, #lb-safe, #dotsE", ${t(LS[13] - 0.2)});
      X5.fly(tl, "solver", 0, 220, 80, 0.01);
      cam(${t(LS[13])}, "intentF", 2.0); grow("order", ${t(LS[13] + 1.6)}); pop("#lb-order", ${t(LS[13] + 2.0)});
      X5.fly(tl, "solver", ${t(LS[13] + 2.4)}, 0, 0, 1.2); pop("#lb-solver", ${t(LS[13] + 3.6)});
      // ===== L14 1 ETH → 至少 3000 USDC（示例）
      pop("#lb-ex", ${t(LS[14] + 0.4)}); flash("#lb-ex", ${t(LS[14] + 2.6)}, 2, 0.4);
      // ===== L15 条件太宽：最低成交量太低、期限太久
      out("#lb-ex", ${t(LS[15] + 1.6)}, 0.2); pop("#lb-wide1", ${t(LS[15] + 1.8)}); pop("#lb-wide2", ${t(LS[15] + 3.2)});
      // ===== L16 Solver 与结算合约之间：信任边界
      out("#lb-wide1, #lb-wide2, #lb-order", ${t(LS[16] - 0.2)}); pop("#lb-settle", ${t(LS[16] + 0.4)});
      fadeIn("#trust", ${t(LS[16] + 1.0)}, 0.5); pop("#lb-trust", ${t(LS[16] + 1.5)});
      // ===== L17 CoW Swap 新加入的 Solver
      out("#lb-trust, #trust", ${t(LS[17] - 0.2)}); pop("#ev-cow", ${t(LS[17] + 0.2)});
      X8.botLamp(tl, "solver", ${t(LS[17] + 1.4)}, 1.6, 2, true); pop("#lb-new", ${t(LS[17] + 1.6)});
      // ===== L18 DAI 无限授权给有漏洞的合约
      grow("fpipe", ${t(LS[18] + 0.8)}); grow("vuln", ${t(LS[18] + 1.4)}); pop("#lb-vuln", ${t(LS[18] + 2.0)}); pop("#lb-pipe", ${t(LS[18] + 2.6)});
      // ===== L19 约一周手续费被取走：17 点
      fadeIn("#dotsF17", ${t(LS[19] + 0.2)}, 0.1);
      tl.fromTo("#dotsF17 circle", { opacity: 0, x: -60, y: -40 }, { opacity: 1, x: 0, y: 0, duration: 0.3, stagger: 0.08, immediateRender: false }, ${t(LS[19] + 0.2)});
      pop("#lb-dotsF", ${t(LS[19] + 1.8)}); flash("#lb-dotsF", ${t(LS[19] + 3.4)}, 2, 0.4);
      // ===== L20 罚没保证金赔偿：柜门开，金条回到结算合约
      out("#lb-new, #lb-pipe", ${t(LS[20] - 0.2)});
      KIT.door(tl, "bond", ${t(LS[20] + 0.3)}, 105, 1.0); fadeIn("#goldBars", ${t(LS[20] + 1.0)}, 0.3);
      X5.fly(tl, "goldBars", ${t(LS[20] + 1.4)}, ${f(dGold[0])}, ${f(dGold[1])}, 1.2, 60); pop("#lb-slash", ${t(LS[20] + 1.6)});
      // ===== L21 1inch Fusion v1：已弃用仍有 Resolver 在用
      out("#ev-cow", ${t(LS[21] - 0.3)}); out("#lb-slash, #lb-dotsF, #dotsF17, #goldBars, #lb-vuln", ${t(LS[21] - 0.2)});
      pop("#ev-1inch", ${t(LS[21] + 0.2)}); grow("signV1", ${t(LS[21] + 2.2)}); grow("resolver", ${t(LS[21] + 3.6)}); pop("#lb-res", ${t(LS[21] + 4.2)});
      // ===== L22 只凭调用者是结算合约就信任
      pop("#lb-trust2", ${t(LS[22] + 0.6)}); fadeIn("#resBox", ${t(LS[22] + 1.2)}, 0.3);
      // ===== L23 伪造订单：50 点流出，随后大部分退回
      fadeIn("#fakeOrd", ${t(LS[23] + 0.2)}, 0.3); X5.fly(tl, "fakeOrd", ${t(LS[23] + 0.4)}, ${f(dRes[0])}, ${f(dRes[1])}, 1.0, 40);
      fadeIn("#dotsF50", ${t(LS[23] + 1.4)}, 0.1);
      tl.fromTo("#dotsF50 circle", { opacity: 0 }, { opacity: 1, duration: 0.1, stagger: 0.03, immediateRender: false }, ${t(LS[23] + 1.4)});
      pop("#lb-dots50", ${t(LS[23] + 2.4)});
      tl.to(Array.from({ length: 42 }, (_, i) => "#dotsF50-" + i), { attr: { fill: "#b8b0a1" }, opacity: 0.35, duration: 0.25, stagger: 0.02 }, ${t(LS[23] + 3.4)});
      pop("#lb-back", ${t(LS[23] + 3.8)});
      // ===== L24 Permit2：统一授权合约
      out("#ev-1inch", ${t(LS[24] - 0.3)}); out("#lb-trust2, #resBox, #lb-res, #lb-dots50, #lb-back, #lb-settle, #lb-solver, #dotsF50, #fakeOrd", ${t(LS[24] - 0.2)});
      cam(${t(LS[24])}, "permitF", 1.4); pop("#ev-p2doc", ${t(LS[24] + 0.6)}); pop("#lb-permit", ${t(LS[24] + 1.4)});
      // ===== L25 无限授权 + 一个链下签名就能转走
      grow("pkey", ${t(LS[25] + 0.3)}); pop("#lb-pkey", ${t(LS[25] + 0.8)});
      X5.fly(tl, "pkey", ${t(LS[25] + 1.4)}, ${f(dKey[0] * 0.4)}, ${f(dKey[1] * 0.4)}, 0.8);
      grow("offsig", ${t(LS[25] + 2.6)}); pop("#lb-off", ${t(LS[25] + 3.0)});
      X5.fly(tl, "offsig", ${t(LS[25] + 3.6)}, ${f(dOff[0])}, ${f(dOff[1])}, 0.8); X5.fly(tl, "offsigA-w", ${t(LS[25] + 3.6)}, ${f(dOff[0])}, ${f(dOff[1])}, 0.8);
      // ===== L26 PEPE 持有者约 140 万美元：签名切攻击者，14 点
      out("#ev-p2doc", ${t(LS[26] - 0.2)}); pop("#ev-p2", ${t(LS[26] + 0.2)});
      fadeIn("#offsigA-w", ${t(LS[26] + 1.4)}, 0.4); out("#offsig", ${t(LS[26] + 1.4)}, 0.4); out("#lb-off", ${t(LS[26] + 1.3)}); pop("#lb-off2", ${t(LS[26] + 1.6)});
      fadeIn("#dotsF2", ${t(LS[26] + 2.4)}, 0.1);
      tl.fromTo("#dotsF2 circle", { opacity: 0 }, { opacity: 1, duration: 0.12, stagger: 0.06, immediateRender: false }, ${t(LS[26] + 2.4)});
      pop("#lb-dotsF2", ${t(LS[26] + 3.4)}); flash("#lb-dotsF2", ${t(LS[26] + 4.8)}, 2, 0.4);
      // ===== L27 合约本身没被攻破；风险 = 无限授权 + 链下签名（段尾静止在 permitF）
      pop("#lb-ok", ${t(LS[27] + 0.4)}); fadeIn("#pkeyRing", ${t(LS[27] + 3.0)}, 0.4); fadeIn("#offRing", ${t(LS[27] + 3.6)}, 0.4);
`,
});
