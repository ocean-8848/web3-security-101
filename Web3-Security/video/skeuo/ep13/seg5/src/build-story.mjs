// ep13/seg5「⑤ 链下与跨链」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.upgC；ends static on CAMS.haltE。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         五关全景：五座海关 + 关名牌（seg2 L0–L4、L10–L16；seg6 L14–L15 结束卡）
//   evmA         A EVM 关：道闸 + 售货机 + 存储柜 + 参数包裹 + 外部调用（seg2 L5、L12）
//   solB         B Solana 关全景：道闸 + 程序机器 + 护照一字排开 + 调用者 / 攻击者 + 铸币机（seg1 L12–L13 终点；seg2 起点、L6、L17 终点；seg6 L10、L12）
//   passB        近景：护照 ×4 + 程序机器 + "无状态"框 + 调用者 / 攻击者（seg1 L2–L3、L7、L10–L11；seg3 起点 L0–L5；seg6 L11）
//   mintB        近景：wETH 铸币机 + 程序机器 + 守护者签名证明卡 + 伪造的"系统账户"护照 PASS[3]（seg1 起点 L0–L1、L4）
//   yardB        B后 账户链 + 可信根 + Cashio 点阵 + Anchor 盾（seg3 L6–L13）
//   driftB       B后 Drift 角：门限表 + 两张审批 + 沙漏 + 时间锁（seg3 L14–L20 终点；seg4 起点）
//   moveC        C Move 关：道闸 + 资源包裹（复制框）+ Cetus 角全貌（seg2 L7、L12；seg4 L0–L1）
//   cetusC       近景：Cetus 角：池子 + 开源数学库 + 位移格 + 份额机 + 份额凭证 + 攻击者 + 冻结冰壳（seg4 L2–L10）
//   verifC       近景：C 岗亭 + 放大镜"字节码验证器"（seg4 L11–L13）
//   upgC         C后 升级与部署：未审计模块 + 审计版本卡 + 单签钥匙 + 时间锁 + 多签（seg4 L14–L17 终点；seg5 起点）
//   btcD         D Bitcoin 关：道闸 + 集装箱 + Bitcoin 链 + 两台索引器（seg2 L8、L13；seg5 L0–L4）
//   lnD          D 闪电角：mempool + 截止时间钟 + 超时交易信封（seg5 L5–L7）
//   liquidD      D Liquid 角：联盟签名门限表 + L-BTC 铸币机 + 储备对账天平 + 红点阵（seg5 L8–L12）
//   cosmosE      E Cosmos 关：道闸 + 两条应用链 + 海关章 + 证明卡 + 超时牌 + 托管保险箱（seg2 L9、L13；seg5 L13–L14；seg6 起点 L0）
//   haltE        E Jackfruit 角：三台节点 + 头顶三只钟 + 出块闸刀 + 停机警报灯（seg5 L15–L17 终点）
//   cexF         F 交易所接入台全景（seg6 L0–L9）
//   listF        近景：接入清单 + 失败牌 / 同名假币 / 不可回滚沙漏 / SDK 包裹 + 柜台（seg6 L2–L5、L8）
//   world        全部区（含后院和接入台）：远景备用
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import { G } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E10 from "../../../ep10/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const CAMS2 = { ...L.CAMS, haltR: L.fit(L.ZONE_RECTS.JK, [760, 300, 1840, 860], 1.4) };   // 段内：Jackfruit 角右移，左侧留给代码卡 C
const S = segInit(import.meta.url, { cams: CAMS2, ext: [E1, E2, E5, E7, E10, E11, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
const RED = "#e0453a", TEAL = "#2aa3c9", GREEN = "#1f9d55";
// 包一层缩放（SEGBASE 常见坑 1）：绕地面点缩放 k，再上抬 lift
const wrapK = (o, k, lift = 0) => { const [gx, gy] = at(o);
  return { wrap: (svg) => `<g transform="translate(0,${-lift})"><g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g></g>`,
    fix: (key) => { const sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k - lift];
      for (const [n, p] of Object.entries(A[key])) if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = sc(p); } }; };

// 大道（原生 SVG，C 关到 E 关之后）
{ const a = L.GATES[2].u - 900, b = L.ROAD.b.u, v0 = L.GATES[2].v + 40 - 75, v1 = v0 + 150;
  const P = [Wp(a, v0), Wp(b, v0 + (L.GATES[4].v - L.GATES[2].v)), Wp(b, v1 + (L.GATES[4].v - L.GATES[2].v)), Wp(a, v1)];
  add({ u: a, v: v0 }, `<polygon points="${P.map((p) => p.join(",")).join(" ")}" fill="#d9d4ca" stroke="#cfc9bd" stroke-width="2"/>`, -20000); }

// 三座关：C（过场）、D、E
[[2, "C", "Move · 防伪芯片"], [3, "D", "Bitcoin · 只查封条"], [4, "E", "Cosmos · 互认海关章"]].forEach(([i, n, t]) => {
  put("g" + n, L.GATES[i], O.checkpoint(L.GATES[i], { id: "g" + n, n }));
  put("sg" + n, L.SIGNS[i], E1.signBoard(L.SIGNS[i], { id: "sg" + n, style: "plate", text: t, size: 40 }));
});

// C后（起始镜头，接 seg4 段尾）
put("core", L.CORE, E10.coreModule(L.CORE, { id: "core", state: "attacker" }));
put("kcard", L.KEYCARD, E5.keycard(L.KEYCARD, { id: "kcard", scale: 0.7 }));
put("ukey", L.UKEY, O.key(L.UKEY, { id: "ukey", state: "attacker" }));
put("ulock", L.ULOCK, E1.timeLock(L.ULOCK, { id: "ulock", frac: 1 }));
put("umsig", L.UMSIG, E5.thresholdMeter(L.UMSIG, { id: "umsig", max: 3, th: 2, level: 2, thText: "多签" }));

// D Bitcoin 关
const scrIdle = (n) => `<rect width="222" height="146" fill="#1d93ba"/><text x="111" y="62" text-anchor="middle" font-size="30" font-weight="900" fill="#fff">索引器 ${n}</text><text x="111" y="104" text-anchor="middle" font-size="22" fill="#dff4fb">解释交易</text>`;
const scrBal = (v, c) => `<rect width="222" height="146" fill="#fffdf8"/><text x="111" y="48" text-anchor="middle" font-size="24" font-weight="700" fill="#555">余额</text><text x="111" y="112" text-anchor="middle" font-size="58" font-weight="900" fill="${c}">${v}</text>`;
put("ctr", L.CTR, X.container(L.CTR, { id: "ctr", label: "UTXO" }));
put("btc", L.BTC, O.chain(L.BTC, { id: "btc", n: 4, title: "Bitcoin" }));
put("idxA", L.IDX[0], O.laptop(L.IDX[0], { id: "idxA", screen: scrIdle("A"), screen2: scrBal("1000", "#1c1c1c") }));
put("idxB", L.IDX[1], O.laptop(L.IDX[1], { id: "idxB", screen: scrIdle("B"), screen2: scrBal("0", RED) }));

// D 闪电角
put("mp", L.MEMPOOL, E1.mempool(L.MEMPOOL, { id: "mp", n: 4, sign: "mempool" }));
put("lck", L.LCLOCK, O.clock(L.LCLOCK, { id: "lck", h: 3, m: 20 }));
put("lt", L.LLETTER, E1.letter(L.LLETTER, { id: "lt", z: 0 }), 4);
const ENTRY = { u: L.MEMPOOL.u - 330, v: L.MEMPOOL.v + 84 };
const P_IN = at(L.LLETTER), P_IN2 = at({ u: L.LLETTER.u + 70, v: L.LLETTER.v - 30 }), P_OUT = at({ u: L.LLETTER.u - 60, v: L.MEMPOOL.v + 200 });
const P_ENT = at(ENTRY);
put("lr0", ENTRY, E1.letter(ENTRY, { id: "lr0", z: 0, state: "attacker" }), 3, { wrap: (s) => S.hid("lr0w", s) });
put("lr1", ENTRY, E1.letter(ENTRY, { id: "lr1", z: 0, state: "attacker" }), 3, { wrap: (s) => S.hid("lr1w", s) });

// D Liquid 角
const wM = wrapK(L.LMETER, 0.7);
put("lmt", L.LMETER, E5.thresholdMeter(L.LMETER, { id: "lmt", max: 5, th: 3, level: 0, thText: "多数" }), 0, { wrap: wM.wrap, grow: true }); wM.fix("lmt");
put("lmint", L.LMINT, E11.mintPress(L.LMINT, { id: "lmint", scale: 0.6, plate: "L-BTC", count: "0", pile: 0.1 }));
put("bal", L.LBAL, E1.balance(L.LBAL, { id: "bal", tilt: 0 }));
{ const [x0, y0] = at(L.DOTS_LBTC), rows = [];
  for (let r = 0; r < 10; r++) { const c = []; for (let k = 0; k < 10; k++) c.push(`<circle cx="${x0 + 7 + k * 14}" cy="${y0 + 7 + r * 14}" r="5" fill="${RED}"/>`);
    rows.push(S.hid("dt" + r, c.join(""))); }
  add(L.DOTS_LBTC, rows.join(""), 200); }
{ const p = S.rel(L.LBAL, 230, 60), [x, y] = at(p);
  add(p, S.hid("rlamp", `<ellipse cx="${x}" cy="${y}" rx="22" ry="11" fill="#1c1c1c"/><rect x="${x - 9}" y="${y - 34}" width="18" height="34" fill="#444"/><circle cx="${x}" cy="${y - 44}" r="17" fill="${TEAL}" stroke="#1d93ba" stroke-width="3"/><circle cx="${x}" cy="${y - 44}" r="34" fill="${TEAL}" opacity="0.25"/>`)); }

// E Cosmos 关
put("ch1", L.CH1, O.chain(L.CH1, { id: "ch1", n: 3, title: "应用链 1" }));
put("ch2", L.CH2, O.chain(L.CH2, { id: "ch2", n: 3, title: "应用链 2" }));
put("cseal", L.CSEAL, O.seal(L.CSEAL, { id: "cseal", text: "海关章", markText: "互认", stamped: false }));
put("esc", L.ESCROW, O.safe(L.ESCROW, { id: "esc" }));
put("ctag", L.CTAG, E7.returnTag(L.CTAG, { id: "ctag", face: "false" }), 0, { wrap: (s) => S.hid("ctagw", s) });
{ const p0 = A.ch1.top, p1 = A.ch2.top, q = at(L.CPROOF, 0, 0, 240);
  add(L.CH1, S.hid("arc", `<path d="M${p0[0]},${p0[1] - 10} Q${q[0]},${q[1] - 160} ${p1[0]},${p1[1] - 10}" fill="none" stroke="${TEAL}" stroke-width="5" stroke-dasharray="14 10"/>`), 900); }
put("cpf", L.CPROOF, E2.proofCard(L.CPROOF, { id: "cpf", text: "Merkle 证明" }), 0, { wrap: (s) => S.hid("cpfw", s) });
put("cdoc", L.CDOC, O.doc(L.CDOC, { id: "cdoc", title: "不存在证明", standing: true, state: "attacker" }), 2, { wrap: (s) => S.hid("cdocw", s) });

// E Jackfruit 角
L.NODES.forEach((q, i) => put("nd" + i, q, O.rpc(q, { id: "nd" + i })));
L.NCLOCKS.forEach((q, i) => { const w2 = wrapK(q, q.scale, q.lift);
  put("nck" + i, q, O.clock(q, { id: "nck" + i, h: 3, m: 0 }), 5, { wrap: w2.wrap }); w2.fix("nck" + i); });
put("halt", L.HALT, O.knifeSwitch(L.HALT, { id: "halt", text: "出块" }));
put("bcn", L.BEACON, O.beacon(L.BEACON, { id: "bcn" }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
// C后（接 seg4 段尾，开场可见）
lb("lb-core", up(A.core.top, 8), "未审计版本", "lab-rs lab-sm");
lb("lb-umsig", up(A.umsig.top, 8), "多签", "lab-cs lab-sm");
lb("lb-ulock", up(A.ulock.top, 8), "时间锁", "lab-cs lab-sm");
// D
lb("lb-ctr", up(A.ctr.top, 10), "链只记录", "lab-cs");
lb("lb-ctrok", up(A.ctr.top, 10), "封条 ✓", "lab-gs");
lb("lb-idx", [(A.idxA.top[0] + A.idxB.top[0]) / 2, Math.min(A.idxA.top[1], A.idxB.top[1]) - 30], "链下解释", "lab-ink");
lb("lb-ex", [(A.idxA.top[0] + A.idxB.top[0]) / 2, Math.min(A.idxA.top[1], A.idxB.top[1]) - 30], `两个余额 ${gtag("示例")}`, "lab-ink lab-sm");
const QP = [(A.idxA.center[0] + A.idxB.center[0]) / 2, (A.idxA.center[1] + A.idxB.center[1]) / 2 - 30];
lb("lb-q", QP, "?", "lab-rs", "c");
lb("lb-btc", up(A.btc.top, 14), "✓ 交易有效", "lab-gs");
lb("lb-nointerp", [QP[0], QP[1] + 58], "共识不解释铭文", "lab-ink", "t");
lb("lb-me", [A.idxA.ground[0], A.idxA.ground[1] + 26], "Magic Eden 暂停交易", "lab-rs lab-sm", "t");
lb("lb-us", [A.idxB.ground[0], A.idxB.ground[1] + 26], "UniSat 警告双花风险", "lab-rs lab-sm", "t");
// 闪电角
lb("lb-lck", up(A.lck.top, 8), "截止时间", "lab-cs");
lb("lb-lt", up(P_IN, 70), "超时交易", "lab-cs lab-sm");
lb("lb-out", [P_OUT[0], P_OUT[1] + 14], "被挤出", "lab-rs lab-sm", "t");
lb("lb-mit", up(A.mp.top, 14), "✓ 已缓解", "lab-gs");
lb("lb-wild", up(A.mp.top, 74), "未见在野利用", "lab-ink lab-sm");
// Liquid 角
lb("lb-lmt", up(A.lmt.top, 10), "联盟签名", "lab-cs");
lb("lb-lmint", up(A.lmint.top, 10), "L-BTC", "lab-cs lab-sm");
lb("lb-dots", [at(L.DOTS_LBTC)[0] + 75, at(L.DOTS_LBTC)[1] + 150], "约 4000 枚 L-BTC", "lab-rs lab-sm", "t");
lb("lb-sig", up(A.lmt.top, 10), "✓ 正常签名", "lab-gs");
lb("lb-bs", up(A.lmt.top, 64), "Blockstream 称", "lab-ink lab-sm");
lb("lb-panL", up(A.bal.panL, 6), "BTC 储备", "lab-cs lab-sm");
lb("lb-panR", up(A.bal.panR, 6), "L-BTC 发行", "lab-rs lab-sm");
{ const [x, y] = at(S.rel(L.LBAL, 230, 60)); lb("lb-rlamp", [x, y + 16], "独立对账 · 实时", "lab-cs lab-sm", "t"); }
// E
lb("lb-cpf", up(at(L.CPROOF, 0, 0, 160), 4), "Merkle 证明", "lab-cs lab-sm");
lb("lb-cdoc", up(at(L.CDOC, 0, 0, 262), 4), "不存在证明", "lab-rs lab-sm");
lb("lb-cseal", up(A.cseal.top, 8), "海关章", "lab-cs lab-sm");
lb("lb-ctag", up(at(L.CTAG, 0, 0, 70), 6), "伪造超时", "lab-rs lab-sm");
lb("lb-esc", up(A.esc.top, 8), "托管账户", "lab-cs lab-sm");
lb("lb-fix", up(A.esc.top, 64), "✓ 协调修复 · 无损失", "lab-gs");
// Jackfruit
lb("lb-same", up(A.nck1.top, 20), "同样输入 → 同样结果", "lab-cs");
L.NODES.forEach((q, i) => lb("lb-r" + i, [A["nd" + i].ground[0], A["nd" + i].ground[1] + 22], i === 0 ? "结果 ✓" : "结果 ✕", i === 0 ? "lab-gs lab-sm" : "lab-rs lab-sm", "t"));
lb("lb-halt", up(A.halt.top, 10), "停止出块", "lab-rs");

// ---------------------------------------------------------------- 屏幕层卡片
const C = { x: 60, y: 300, w: 640 };
const cardC = codeCard("ccd", { ...C, head: "授权过期判断", tag: "示意", mono: true, rows: [
  { html: "if grant.expiry &lt; local_clock_now()", chip: "本地时钟", chipCls: "x" },
  { html: "&nbsp;&nbsp;&nbsp;&nbsp;delete(grant)" },
  { html: "// 应改用区块时间", chip: "确定", chipCls: "ok" }] });
S.curve("cv-clk", [C.x + C.w + 4, codeRowY(C.y, 0)], S.scr("haltR", A.nck0.center), { color: RED });
S.curve("cv-a", S.scr("btcD", A.ctr.inside), S.scr("btcD", A.idxA.screen), { color: TEAL });
S.curve("cv-b", S.scr("btcD", A.ctr.inside), S.scr("btcD", A.idxB.screen), { color: TEAL });
const html = [
  kw("kw-q", `共识能 <b>裁决</b> 吗？`, { x: 760, y: 140, accent: RED }),
  evt("ev4", `BRC-20 索引器分歧 · 2023 到 2024 年<br>${gtag("Cointelegraph 报道")}`, { color: RED }),
  evt("ev6", `闪电网络替换循环攻击 · 2023 年 10 月披露<br>${gtag("开发者邮件列表")}`, { color: RED }),
  ck("ck7", `四家主要实现已发布缓解 ${gtag("未见在野利用")}`, { x: 600, y: 150, w: 900, kind: "g" }),
  evt("ev9", `Liquid 侧链 · 2026 年 9 月 6 日<br>约 4000 枚 L-BTC · 约 3.19 亿美元<br>${gtag("TRM 分析 · The Block 报道")}`, { color: RED }),
  ck("ck11", `范围证明验证缓存：无效输出被当作已验证 ${gtag("第三方重建 · 未确认")}`, { x: 640, y: 150, w: 1180, kind: "n" }),
  kw("kw-12", `签名对了 <b>≠</b> 状态对了`, { x: 640, y: 140, size: 52, accent: RED }),
  evt("ev14", `Dragonberry · 2022 年 10 月<br>${gtag("Cosmos 论坛复盘")}`, { color: RED }),
  evt("ev16", `Jackfruit · 2021 年 10 月<br>${gtag("Cosmos 论坛复盘")}`, { color: RED }),
  cardC,
].join("");
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  inscr: w("铭文", 1), idx1: w("索引器", 1), two: w("两家", 2), judge: w("裁决", 2), no: LS[3], tx: w("交易", 3),
  me: w("Magic", 4), us: w("UniSat", 4), dead: w("截止时间", 5), rep: w("替换", 6), out: w("挤出去", 6),
  mit: w("缓解", 7), wild: w("未见", 7), mint: w("凭空", 9), rbtc: w("真实", 9), bs: w("Blockstream", 10), sig: w("正常签了名", 10),
  root: w("范围证明", 11), unc: w("尚未确认", 11), th: LS[12], recon: w("对账", 12), merkle: w("Merkle", 13),
  fake: w("伪造", 14), tout: w("超时", 14), drain: w("掏空", 14), fix: w("协调修复", 14), same: w("确定性", 15),
  clk: w("本地时钟", 16), diff: w("不同结果", 16), stop: w("停机", 16), panic: w("panic", 17), halt: w("停止出块", 17),
};
const t = (x) => f(x);

const BOX = [1900, -4000, 6900, 3000];
const GRID = (() => { const c = [[BOX[0], BOX[1]], [BOX[0] + BOX[2], BOX[1]], [BOX[0], BOX[1] + BOX[3]], [BOX[0] + BOX[2], BOX[1] + BOX[3]]].map(([x, y]) => G(x, y));
  const r = (a) => Math.round(a / 100) * 100;
  return { u0: r(Math.min(...c.map((q) => q.u))), u1: r(Math.max(...c.map((q) => q.u))), v0: r(Math.min(...c.map((q) => q.v))), v1: r(Math.max(...c.map((q) => q.v))) }; })();

S.build({
  cam0: "upgC", sub: "链只记录，谁来解释",
  grid: GRID, box: BOX,   // C后 → D → 闪电角 / Liquid 角 → E → Jackfruit 角
  shown: ["#lb-core", "#lb-umsig", "#lb-ulock"], css, html,
  terms: [
    { id: "t0", t: "铭文", d: "写进比特币交易里的数据或资产", at: w("铭文", 1) },
    { id: "t1", t: "闪电网络", d: "比特币之上的链下支付通道网络", at: w("闪电网络", 5) },
    { id: "t2", t: "mempool", d: "等待打包的交易排队区", at: w("mempool", 6) },
    { id: "t3", t: "范围证明", d: "证明隐藏的金额落在合法范围内", at: w("范围证明", 11) },
    { id: "t4", t: "轻客户端", d: "只验证区块头和证明的精简客户端", at: w("轻客户端", 13) },
    { id: "t5", t: "确定性", d: "所有节点同样输入算出同样结果", at: w("确定性", 15) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 Bitcoin 这一关，链只记录，链下软件来解释。
      out("#lb-core, #lb-umsig, #lb-ulock", ${t(LS[0] - 0.2)}, 0.3);
      cam(${t(LS[0])}, "btcD", 1.6);
      pop("#lb-ctr", ${t(LS[0] + 1.8)}); pop("#lb-idx", ${t(LS[0] + 2.4)});
      // ===== L1 铭文和 BRC-20 的余额，不由比特币共识决定，由链下索引器解释同一批交易。
      X13.door(tl, "ctr", ${t(TM.inscr)}); X13.inside(tl, "ctr", ${t(TM.inscr + 0.3)}, true);
      draw("cv-a", ${t(TM.idx1)}); draw("cv-b", ${t(TM.idx1 + 0.3)});
      // ===== L2 先猜一道题。同一个铭文代币，两家平台显示的余额不同。比特币共识能裁决谁对吗？
      out("#lb-idx, #cv-a, #cv-b", ${t(TM.two - 0.2)});
      fadeIn("#idxA-scr2", ${t(TM.two)}, 0.3); fadeIn("#idxB-scr2", ${t(TM.two + 0.3)}, 0.3); pop("#lb-ex", ${t(TM.two + 0.5)});
      pop("#kw-q", ${t(TM.judge - 0.4)}); pop("#lb-q", ${t(TM.judge)});
      // ===== L3 不能。共识只验证交易本身，不解释铭文内容。
      out("#kw-q", ${t(TM.no + 0.6)});
      pop("#lb-btc", ${t(TM.tx)}); bump("#lb-q", ${t(TM.tx + 1.0)}, 1.3, 2); pop("#lb-nointerp", ${t(TM.tx + 1.4)});
      // ===== L4 按 Cointelegraph 报道，2023 到 2024 年，各平台的索引器版本不一致。Magic Eden 暂停交易，UniSat 警告存在双花风险。
      out("#lb-nointerp", ${t(LS[4])}); pop("#ev4", ${t(LS[4] + 0.2)});
      pop("#lb-me", ${t(TM.me)}); pop("#lb-us", ${t(TM.us)});
      // ===== L5 闪电网络的资金安全，依赖用户在截止时间前，把交易打包上链。
      out("#ev4, #lb-ctr, #lb-ex, #lb-q, #lb-btc, #lb-nointerp, #lb-me, #lb-us", ${t(LS[5] - 0.2)});
      cam(${t(LS[5])}, "lnD", 1.4);
      pop("#lb-lt", ${t(LS[5] + 1.5)}); pop("#lb-lck", ${t(TM.dead)}); KIT.clock(tl, "lck", ${t(TM.dead + 0.2)}, 2.4, 35);
      // ===== L6 2023 年 10 月披露的替换循环攻击，利用 mempool 的替换规则，把受害者的超时交易反复挤出去。
      pop("#ev6", ${t(LS[6] + 0.2)}); out("#lb-lt", ${t(TM.rep - 0.1)});
      fadeIn("#lr0w", ${t(TM.rep)}, 0.2);
      X1.walk(tl, "lr0", ${t(TM.rep + 0.1)}, 0.9, [${JSON.stringify(P_ENT)}, ${JSON.stringify(P_IN)}]);
      X1.walk(tl, "lt", ${t(TM.rep + 0.6)}, 0.6, [${JSON.stringify(P_IN)}, ${JSON.stringify(P_OUT)}]);
      pop("#lb-out", ${t(TM.rep + 1.2)});
      X1.walk(tl, "lt", ${t(TM.rep + 2.0)}, 0.6, [${JSON.stringify(P_OUT)}, ${JSON.stringify(P_IN2)}]);
      fadeIn("#lr1w", ${t(TM.out - 0.4)}, 0.2);
      X1.walk(tl, "lr1", ${t(TM.out - 0.3)}, 0.9, [${JSON.stringify(P_ENT)}, ${JSON.stringify(P_IN2)}]);
      X1.walk(tl, "lt", ${t(TM.out + 0.2)}, 0.6, [${JSON.stringify(P_IN2)}, ${JSON.stringify(P_OUT)}]);
      bump("#lb-out", ${t(TM.out + 0.8)}, 1.2, 1);
      // ===== L7 四家主要实现在披露前已发布缓解，未见在野利用。
      out("#ev6", ${t(LS[7] - 0.1)});
      out("#lb-out", ${t(LS[7] + 0.2)}); pop("#ck7", ${t(LS[7] + 0.5)}); pop("#lb-mit", ${t(TM.mit)}); bump("#ck7", ${t(TM.wild)}, 1.06, 1);
      // ===== L8 BTC 跨链桥多靠多签或联盟。
      out("#ck7, #lb-lck, #lb-mit, #lb-wild", ${t(LS[8] - 0.2)});
      cam(${t(LS[8])}, "liquidD", 1.4);
      grow("lmt", ${t(LS[8] + 1.2)}); pop("#lb-lmt", ${t(LS[8] + 1.6)}); pop("#lb-lmint", ${t(LS[8] + 1.8)});
      pop("#lb-panL", ${t(LS[8] + 2.2)}); pop("#lb-panR", ${t(LS[8] + 2.3)});
      // ===== L9 2026 年 9 月 6 日，Liquid 侧链上，被凭空铸出约 4000 枚 L-BTC，再通过正常提现换成真实 BTC，约 3.19 亿美元。
      pop("#ev9", ${t(LS[9] + 0.2)});
      X11.mint(tl, "lmint", ${t(TM.mint)}, 1.6, 2, 0.9); X11.count(tl, "lmint", ${t(TM.mint + 1.0)}, "4000", "red");
      for (let i = 0; i < 10; i++) fadeIn("#dt" + i, ${t(TM.mint + 0.8)} + i * 0.1, 0.15);
      pop("#lb-dots", ${t(TM.mint + 1.9)});
      // ===== L10 Blockstream 称签名密钥没有泄露。联盟按软件给出的链状态，正常签了名。
      out("#ev9", ${t(LS[10] - 0.1)});
      pop("#lb-bs", ${t(TM.bs)}); out("#lb-lmt", ${t(TM.sig - 0.2)}, 0.2);
      X5.fill(tl, "lmt", ${t(TM.sig - 0.6)}, 5, 1.2); pop("#lb-sig", ${t(TM.sig)});
      // ===== L11 第三方重建的根因，是范围证明的验证缓存，可能把无效输出当作已验证。官方完整复盘尚未确认。
      out("#lb-sig, #lb-bs", ${t(LS[11] - 0.2)}); pop("#ck11", ${t(TM.root)});
      // ===== L12 门限签名只保证多数人同意，不保证被同意的状态是对的。储备要由独立的对账程序实时核对。
      out("#ck11", ${t(LS[12] - 0.2)});
      pop("#lb-sig", ${t(TM.th + 0.2)});
      X1.tilt(tl, "bal", ${t(TM.th + 1.0)}, -16, 0.9); KIT.broke(tl, "bal", ${t(TM.th + 1.9)}, { ghost: 1, badge: false });
      pop("#kw-12", ${t(TM.th + 1.6)});
      fadeIn("#rlamp", ${t(TM.recon)}, 0.4); pop("#lb-rlamp", ${t(TM.recon + 0.2)});
      // ===== L13 Cosmos 这一关，各条链用轻客户端和 Merkle 证明，互认对方的状态。
      out("#kw-12, #lb-sig, #lb-lmint, #lb-dots, #lb-panL, #lb-panR, #lb-rlamp", ${t(LS[13] - 0.2)});
      cam(${t(LS[13])}, "cosmosE", 1.6);
      fadeIn("#arc", ${t(TM.merkle - 0.3)}, 0.5); fadeIn("#cpfw", ${t(TM.merkle)}, 0.3); pop("#lb-cpf", ${t(TM.merkle + 0.2)});
      KIT.stamp(tl, "cseal", ${t(TM.merkle + 0.8)}); pop("#lb-cseal", ${t(TM.merkle + 1.4)}); pop("#lb-esc", ${t(TM.merkle + 1.6)});
      // ===== L14 2022 年 10 月的 Dragonberry，ICS-23 接受了伪造的不存在证明，可以伪造 IBC 超时，掏空托管账户。这个漏洞协调修复，没有损失。
      pop("#ev14", ${t(LS[14] + 0.2)});
      out("#cpfw, #lb-cpf", ${t(TM.fake - 0.2)}, 0.3); fadeIn("#cdocw", ${t(TM.fake)}, 0.3); pop("#lb-cdoc", ${t(TM.fake + 0.3)});
      fadeIn("#ctagw", ${t(TM.tout)}, 0.25); pop("#lb-ctag", ${t(TM.tout + 0.2)});
      KIT.door(tl, "esc", ${t(TM.drain)}, 105, 1.0);
      KIT.door(tl, "esc", ${t(TM.fix)}, 0, 0.7); out("#lb-ctag, #ctagw", ${t(TM.fix)}, 0.3);
      out("#lb-esc", ${t(TM.fix)}, 0.2); pop("#lb-fix", ${t(TM.fix + 0.3)});
      // ===== L15 状态机也必须是确定性的。
      out("#ev14, #lb-fix, #lb-cdoc, #lb-cseal, #lb-esc", ${t(LS[15] - 0.2)});
      cam(${t(LS[15])}, "haltE", 1.4);
      pop("#lb-same", ${t(TM.same)});
      // ===== L16 2021 年 10 月的 Jackfruit，授权模块用节点本地时钟判断过期。不同节点算出不同结果，任何人都能让链停机。
      out("#lb-same", ${t(LS[16] - 0.2)});
      cam(${t(LS[16])}, "haltR", 1.0); pop("#ev16", ${t(LS[16] + 0.4)});
      pop("#ccd", ${t(LS[16] + 1.2)}); pop("#ccd-c0", ${t(TM.clk)}); hot("#ccd-r0", ${t(TM.clk)}, "#fde3e0"); draw("cv-clk", ${t(TM.clk + 0.2)});
      KIT.clock(tl, "nck0", ${t(TM.clk + 0.4)}, 1.0, 10); KIT.clock(tl, "nck1", ${t(TM.clk + 0.4)}, 1.0, 80); KIT.clock(tl, "nck2", ${t(TM.clk + 0.4)}, 1.0, 170);
      [0, 1, 2].forEach((i) => pop("#lb-r" + i, ${t(TM.diff)} + i * 0.2));
      pop("#ccd-c2", ${t(TM.stop)});
      // ===== L17 BeginBlock 和 EndBlock 里的 panic 或无界循环，也会让整条链停止出块。
      out("#ev16, #ccd, #cv-clk", ${t(LS[17] - 0.2)});
      cam(${t(LS[17])}, "haltE", 1.0);
      KIT.toggle(tl, "halt", ${t(TM.panic)}, false); KIT.beacon(tl, "bcn", ${t(TM.panic + 0.3)}, ${t(Math.max(1, LE[17] - 1.2 - (TM.panic + 0.3)))}, 1.0);
      pop("#lb-halt", ${t(TM.halt)});
`,
});
