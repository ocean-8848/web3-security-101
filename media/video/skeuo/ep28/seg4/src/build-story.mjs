// ep28/seg4「④ 改动与盲签」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.priceC（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：A–F 整座档案馆（seg2 L0–L2；seg6 L10–L12、L14–L15 结束卡）
//   A            分区全景：A 门厅
//   B            分区全景：B 阅览厅
//   C            分区全景：C 代码展厅
//   D            分区全景：D 改动展厅
//   E            分区全景：E 钥匙与人展厅
//   F            分区全景：F 复盘台
//   daoA         A DAO 展柜 + 账本 + 回调臂 + 币 + 60 点阵（seg1 起点 L0–L3）
//   curveA       A Curve 展柜：破锁 + 编译器手册 + 70 点阵（seg1 L4–L6）
//   penpieA      A Penpie 展柜：按钮面板 + 空锁框 + 27 点阵（seg1 L7–L8）
//   hallA        A 三只展柜 + 串联红线标签 + 入口牌（seg1 L9–L12 终点；seg2 起点）
//   aviationB    B 比喻角：塔台、黑匣子、公开报告、公章、项目复盘、安全公司分析、链 + 阅读位（seg2 L3–L11）
//   wallsB       B 档案柜 + 六面展墙 + 空白牌 + 阅读位（seg2 L12–L16）
//   patternsB    B 模式墙 + 档案柜（seg2 L17–L18 终点；seg3 起点）
//   reentryC     C ① 柜：Fei Rari + 回调臂 + 按钮面板 + 两把共享锁 + 牌（seg3 L0–L5；代码卡 A 在右侧）
//   zeroC        C ② 柜：Nomad 桥 + 可信根 + 零地址荒地 + 回执签 + 证明卡 + 牌（seg3 L6–L12）
//   priceC       C ③ 柜：池子 + 单一价格机 + 份额机 + 份额 + 防御预言机 + 内部账本 + 牌（seg3 L13–L18 终点；seg4 起点）
//   checkD       D ④ 柜：Euler + 按钮面板 + 关卡 + 天平 + 阅卷机 + 牌（seg4 L0–L5）
//   forkD        D ⑤ 柜：两台合约机器 + 差异卡 + 天平 + 放大镜 + 公章 + 牌（seg4 L6–L10）
//   signD        D ⑥ 柜：多签界面 + 签名人 + 支票 + 权限卡 + 硬件钱包 + 盾牌 + 牌（seg4 L11–L17 终点；seg5 起点）
//   keysE        E ⑦ 柜：九把钥匙 + 门槛表 + 机柜 + 云桶 + 保险柜 + 时间锁空框 + 闸刀 + 牌（seg5 L0–L6）
//   methE        E mETH 角：售货机 + 8 小时沙漏 + 暂停闸刀 + 三枚 cmETH（seg5 L7–L8）
//   peopleE      E ⑧ 柜：两张桌 + 隔板 + 员工 + 测试题 + PDF + 笔记本 + 客服 + 用户数据 + 两人确认 + 收回钥匙 + 牌（seg5 L9–L15）
//   nftE         E NFT 与 GameFi 墙：牌 + 手机 + 前端 + 铸币机 + 内部人（seg5 L16 终点；seg6 起点）
//   deskF        F 复盘台：复盘文件 + 链 + 调用树 + 放大镜 + 扳道器 + 木牌 + 徽章行 + 牌（seg6 L0–L9）
//   vitrineF     F 空展柜 + 八枚徽章（seg6 L13）
// ends static on CAMS.signD
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E14 from "../../../ep14/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E3, E4, E5, E6, E8, E9, E14] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- helpers
const CE = 0.866, VF = E2.VITRINE_FLOOR;
const mapA = (an, fn) => { const o = {}; for (const [k, v] of Object.entries(an)) {
  o[k] = Array.isArray(v) && typeof v[0] === "number" ? fn(v) : Array.isArray(v) && Array.isArray(v[0]) ? v.map(fn) : v; } return o; };
/** wrap scale k (+ optional lift) around o's ground point; returns { svg, anchors } rescaled */
const K = (o, r, k, lift = 0) => {
  const [gx, gy] = at(o), ly = lift * CE;
  const sc = (p) => [gx + (p[0] - gx) * k, gy - ly + (p[1] - gy) * k];
  return { svg: `<g transform="translate(${gx},${gy - ly}) scale(${k}) translate(${-gx},${-gy})">${r.svg}</g>`, anchors: mapA(r.anchors, sc) };
};
/** native-scale exhibit lifted onto the vitrine floor */
const LIFT = (r) => ({ svg: E2.liftSvg(r.svg, VF), anchors: mapA(r.anchors, (p) => [p[0], p[1] - VF * CE]) });
const VIT = (key, o, plate, inners) => {
  put(key, o, E2.vitrine(o, { id: key, w: 420, d: 300, h: 280, plate, inner: inners.map((x) => x.svg).join("") }));
};
const pts = (arr) => arr.map((o) => at(o).map((v) => v.toFixed(1)).join(",")).join(" ");
const DU = L.D4_GATE;
const badge = (id, p, n) => add({ u: 0, v: 0 }, S.hid(id, `<g transform="translate(${p[0]},${p[1]})"><circle r="30" fill="#1d93ba" stroke="#fff" stroke-width="4"/><text y="11" text-anchor="middle" font-size="32" font-weight="900" fill="#fff" font-family="sans-serif">${n}</text></g>`), 1e6);

// ---------------------------------------------------------------- C ③ 柜（上一段结尾 priceC，开场就在）
{ const pool = LIFT(E8.ammPool({ u: L.C3_VIT.u, v: L.C3_VIT.v }, { id: "c3pool", scale: 0.6 }));
  VIT("c3vit", L.C3_VIT, "Cream · 2021", [pool]); }
put("c3orc", L.C3_ORACLE, E1.miniVend(L.C3_ORACLE, { id: "c3orc", kind: "oracle", scale: 0.6 }));
put("c3share", L.C3_SHARE, E6.shareDispenser(L.C3_SHARE, { id: "c3share", scale: 0.6 }));
put("c3cert", L.C3_CERT, E6.shareCert(L.C3_CERT, { id: "c3cert", scale: 0.8 }));
put("c3good", L.C3_GOOD, E1.miniVend(L.C3_GOOD, { id: "c3good", kind: "oracle", scale: 0.6, glow: true }));
put("c3led", L.C3_LEDGER, O.ledgerBook(L.C3_LEDGER, { id: "c3led", scale: 0.6 }));
put("c3sg", L.C3_SIGN, E1.signBoard(L.C3_SIGN, { id: "c3sg", style: "plate", text: "③ 可变数据当事实", size: 28 }));

// visitor route (teal dashed, floor)
add({ u: 7100, v: -2000 }, `<polyline points="${pts([{ u: 7100, v: 0 }, { u: 16300, v: 0 }])}" fill="none" stroke="#2aa3c9" stroke-width="5" stroke-dasharray="18 14" opacity="0.55"/>`, -1e6);
// zone tag D
{ const [x, y] = at(L.D_TAG);
  add(L.D_TAG, `<g transform="translate(${x},${y})"><rect x="-110" y="-24" width="220" height="48" rx="10" fill="#fff" stroke="#2aa3c9" stroke-width="3"/><text y="10" text-anchor="middle" font-size="26" font-weight="800" fill="#1c1c1c" font-family="sans-serif">D · 改动展厅</text></g>`, -400); }

// ---------------------------------------------------------------- D ④ Euler
{ const vm = LIFT(E1.vending({ u: L.D4_VIT.u, v: L.D4_VIT.v }, { id: "evm", sign: "Euler", scale: 0.6 }));
  A.evm = vm.anchors; VIT("d4vit", L.D4_VIT, "Euler · 2023", [vm]); }
put("fp", L.D4_PANEL, K(L.D4_PANEL, E5.funcPanel(L.D4_PANEL, { id: "fp", title: "EULER · FUNCTIONS",
  buttons: [{ name: "deposit" }, { name: "borrow" }, { name: "donate" }] }), 0.55));
put("gate", L.D4_GATE, K(L.D4_GATE, O.checkpoint(L.D4_GATE, { id: "gate", n: "④" }), 0.55));
put("bal4", L.D4_BAL, K(L.D4_BAL, E1.balance(L.D4_BAL, { id: "bal4" }), 0.6));
put("grd", L.D4_GRADER, E14.gradingMachine(L.D4_GRADER, { id: "grd", scale: 0.6, title: "不变量测试" }));
put("sg4", L.D4_SIGN, E1.signBoard(L.D4_SIGN, { id: "sg4", style: "plate", text: "④ 新函数绕过检查", size: 28 }), 0, { grow: true });
badge("bdg4", [A.sg4.top[0] + 150, A.sg4.top[1] + 30], "④");
// routes: buttons → gate road (u direction). lanes 0/1 pass the gate, lane 2 (捐赠) bypasses in front of it
const PU = L.D4_PANEL.u, PV = L.D4_PANEL.v, GU = DU.u, GV = DU.v;
const lane = (i, dv) => [{ u: PU + (i - 1) * 57, v: PV + 60 }, { u: PU + (i - 1) * 57, v: GV + dv }, { u: GU + 230, v: GV + dv }];
const ln = (id, ps, col, extra = "") => `<polyline id="${id}" points="${pts(ps)}" fill="none" stroke="${col}" stroke-width="6" stroke-dasharray="16 10" stroke-linejoin="round" ${extra}/>`;
add({ u: GU, v: GV - 300 }, S.hid("rt-ok", ln("rt0", lane(0, -24), "#2aa3c9") + ln("rt1", lane(1, 0), "#2aa3c9")));
add({ u: GU, v: GV + 300 }, S.hid("rt-bad", ln("rt2", [{ u: PU + 57, v: PV + 60 }, { u: PU + 57, v: GV + 170 }, { u: GU + 230, v: GV + 170 }, { u: GU + 260, v: GV + 30 }], "#e0453a")));
add({ u: GU, v: GV - 300 }, S.hid("rt-fix", [0, 1, 2].map((i) => ln("rf" + i, [{ u: PU + (i - 1) * 57, v: PV + 60 }, { u: GU - 200, v: GV }, { u: GU + 230, v: GV }], "#1f9d55")).join("")));

// ---------------------------------------------------------------- D ⑤ Uranium
{ const ms = L.D5_MACH.map((q, i) => { const o = { u: q.u, v: q.v };
    return K(o, E3.contractMachine(o, { id: "cm" + i, name: i ? "Uranium" : "Uniswap V2", tone: i ? "light" : "gray" }), 0.5, VF); });
  A.cm0 = ms[0].anchors; A.cm1 = ms[1].anchors; VIT("d5vit", L.D5_VIT, "Uranium · 2021", ms); }
put("diff", L.D5_DIFF, E4.punchCard(L.D5_DIFF, { id: "diff", kind: "card", scale: 0.7, title: "差异", red: [9], redShown: false }));
put("bal5", L.D5_BAL, K(L.D5_BAL, E1.balance(L.D5_BAL, { id: "bal5" }), 0.6));
put("mag", L.D5_MAG, O.magnifier(L.D5_MAG, { id: "mag" }));
put("seal", L.D5_SEAL, K(L.D5_SEAL, O.seal(L.D5_SEAL, { id: "seal", markText: "重审", text: "差异审计", stamped: false }), 0.5));
put("sg5", L.D5_SIGN, E1.signBoard(L.D5_SIGN, { id: "sg5", style: "plate", text: "⑤ 改动未重审", size: 28 }), 0, { grow: true });
badge("bdg5", [A.sg5.top[0] + 140, A.sg5.top[1] + 30], "⑤");
const MAG_D = (() => { const a = at(L.D5_DIFF), b = at(L.D5_MAG); return [a[0] - b[0] - 30, a[1] - b[1] + 110]; })();

// ---------------------------------------------------------------- D ⑥ Bybit / 盲签
const HASH = `<rect x="0" y="0" width="380" height="300" fill="#f4f4f2"/><text x="190" y="120" text-anchor="middle" font-size="30" font-family="monospace" fill="#9a9a9a">0x8f3a…c41e</text><text x="190" y="170" text-anchor="middle" font-size="22" font-family="sans-serif" fill="#9a9a9a">只有哈希</text>`;
{ const o = { u: L.D6_VIT.u, v: L.D6_VIT.v };
  const ui = K(o, O.browserWin(o, { id: "ui", title: "多签界面", heading: "转账 10 ETH", button: "签名", page2: HASH }), 0.45, VF);
  A.ui = ui.anchors; VIT("d6vit", L.D6_VIT, "Bybit · 2025", [ui]); }
L.D6_SIGNERS.forEach((q, i) => put("sgn" + i, q, O.person(q, { id: "sgn" + i, role: "signer", scale: 0.5 })));
put("chq", L.D6_CHEQUE, E9.cheque(L.D6_CHEQUE, { id: "chq", scale: 0.8, title: "实际签下", state: "filled", signed: false }));
put("kc", L.D6_KEYCARD, E5.keycard(L.D6_KEYCARD, { id: "kc", scale: 0.7, role: "owner", text: "权限" }));
const ATK = { u: L.D6_KEYCARD.u + 140, v: L.D6_KEYCARD.v + 60 };
put("atk", ATK, O.person(ATK, { id: "atk", role: "attacker", scale: 0.45 }), 0, { grow: true });
put("hw", L.D6_HW, K(L.D6_HW, O.hwWallet(L.D6_HW, { id: "hw", screenText: "解码后内容" }), 0.7));
put("shd", L.D6_SHIELD, K(L.D6_SHIELD, O.shield(L.D6_SHIELD, { id: "shd" }), 0.5), 0, { grow: true });
put("sg6", L.D6_SIGN, E1.signBoard(L.D6_SIGN, { id: "sg6", style: "plate", text: "⑥ 盲签", size: 28 }), 0, { grow: true });
badge("bdg6", [A.sg6.top[0] + 110, A.sg6.top[1] + 30], "⑥");
{ const [x0, y0, x1, y1] = L.rect(L.D6_UI, "browserWin");
  add({ u: L.D6_VIT.u, v: L.D6_VIT.v + 400 }, S.hid("uibox", `<rect x="${x0 + 6}" y="${y0 + 6}" width="${x1 - x0 - 12}" height="${y1 - y0 - 50}" rx="8" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="14 9"/>`)); }

// ---------------------------------------------------------------- 世界标签
lb("lb-evm", up(A.evm.top, 6), "Euler", "lab-ink");
lb("lb-e197", up(A.evm.top, 50), "约 1.97 亿美元", "lab-r");
lb("lb-back", up(A.evm.top, 6), "大部分归还", "lab-gs lab-sm");
lb("lb-donate", up(A.fp.btns[2], 14), "捐赠", "lab-r");
lb("lb-bal4", up(A.bal4.top, 6), "健康检查", "lab-cs lab-sm");
lb("lb-nocall", A.bal4.foot ?? A.bal4.ground, "没被调用", "lab-r lab-sm", "t");
lb("lb-gate", up(A.gate.top, 6), "只拦存款 · 借款", "lab-cs lab-sm");
lb("lb-gate2", up(A.gate.top, 6), "操作后检查", "lab-gs lab-sm");
lb("lb-bypass", at({ u: GU + 40, v: GV + 170 }), "绕过", "lab-r lab-sm", "t");
lb("lb-grd", up(A.grd.top, 6), "不变量测试", "lab-gs lab-sm");
lb("lb-cm0", [A.cm0.top[0] - 60, A.cm0.top[1] - 6], "Uniswap V2", "lab-cs lab-sm");
lb("lb-cm1", [A.cm1.top[0] + 60, A.cm1.top[1] - 6], "Uranium", "lab-r lab-sm");
lb("lb-fork", up([(A.cm0.top[0] + A.cm1.top[0]) / 2, (A.cm0.top[1] + A.cm1.top[1]) / 2], 110), "分叉 →", "lab-ink lab-sm");
lb("lb-diff", up(A.diff.top, 6), "差异", "lab-cs lab-sm");
lb("lb-bal5", up(A.bal5.top, 6), "恒定乘积检查", "lab-r lab-sm");
lb("lb-e50", A.bal5.ground, "约 5000 万美元", "lab-r", "t");
lb("lb-seal", up(A.seal.top, 6), "重审", "lab-gs");
lb("lb-ui", up(A.ui.top, 6), "多签界面 · 看到的", "lab-cs lab-sm");
lb("lb-target", A.ui.ground, "只对目标地址", "lab-r lab-sm", "t");
lb("lb-chq", up(A.chq.ground, -10), "实际签下", "lab-ink lab-sm", "t");
lb("lb-dc", up(A.chq.top, 6), "delegatecall", "lab-r lab-sm");
lb("lb-neq", [A.chq.top[0] - 220, A.chq.top[1] + 40], "≠", "lab-r big-neq", "c");
lb("lb-e23", up(A.ui.top, 100), "约 2.3 亿美元 · WazirX", "lab-r lab-sm");
lb("lb-e15", up(A.chq.top, 80), "约 15 亿美元 · FBI 口径", "lab-r");
lb("lb-kc", up(A.kc.top, 6), "账户权限", "lab-r lab-sm");
lb("lb-hash", up(A.ui.top, 100), "只显示哈希", "lab-rs lab-sm");
lb("lb-hw", A.hw.ground, "硬件钱包核对", "lab-gs lab-sm", "t");
lb("lb-shd", up(A.shd.top, 6), "白名单", "lab-gs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const html = [
  evt("ev-eu", `Euler Finance · 2023 年 3 月 · 以太坊<br>${gtag("公开报道")}`, { color: "#e0453a", top: 120 }),
  evt("ev-ur", `Uranium Finance · 2021 年 4 月<br>BNB Chain ${gtag("公开报道")}`, { color: "#e0453a", top: 124 }),
  evt("ev-wz", `WazirX · 2024 年 7 月<br>${gtag("公开报道")}`, { color: "#e0453a", top: 128 }),
  evt("ev-bb", `Bybit · 2025 年 2 月<br>${gtag("FBI 口径")}`, { color: "#e0453a", top: 132 }),
  evt("ev-tr", `TRON · 权限诈骗<br>${gtag("公开安全提示")}`, { color: "#e0453a", top: 136 }),
  kw("kw4", `识别信号：<b>新入口</b>`, { x: 660, y: 150 }),
  kw("kw5", `<b>只改了一行</b>`, { x: 664, y: 150, accent: "#e0453a" }),
  kw("kw6", `识别信号：只显示<b>哈希</b>`, { x: 668, y: 150, accent: "#e0453a" }),
].join("");
const css = `.big-neq{font-size:84px !important;line-height:1;padding:0 18px !important}`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  euler: w("Euler", 1), back: w("归还", 1), donate: w("捐赠", 2), check2: w("健康检查", 2),
  other: w("别的入口", 3), miss: w("漏掉", 3), sig4: w("识别信号", 4),
  unify: w("统一", 5), inv: w("不变量测试", 5),
  ura: w("Uranium", 7), fork: w("分叉", 7), const8: w("常数", 8), fail8: w("失效", 8), loss8: w("5000", 8),
  line9: w("只改了一行", 9), reaudit: w("重审", 10), diff10: w("差异", 10),
  wz: w("WazirX", 12), neq12: w("不一致", 12), loss12: w("2.3", 12),
  bybit: w("Bybit", 13), target: w("目标地址", 13),
  blind: w("盲签", 14), dc: w("delegatecall", 14), fbi: w("FBI", 14),
  tron: w("TRON", 15), perm: w("权限", 15, 1),
  hash: w("哈希", 16), decode: w("独立解码", 17), hw: w("硬件钱包", 17), white: w("白名单", 17),
};
const t = (x) => f(x);

S.build({
  cam0: "priceC", sub: "新入口，只改一行，看不懂的签名",
  grid: { u0: 7100, u1: 16300, v0: -4000, v1: 5000 }, box: [6500, -4700, 6700, 3100],   // 盖住本段镜头 priceC · checkD · forkD · signD（priceC = 上一段结尾）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "健康检查", d: "确认借款仍被足够抵押覆盖", at: w("健康检查", 2) },
    { id: "t1", t: "不变量测试", d: "随机操作后检查必须成立的条件", at: w("不变量测试", 5) },
    { id: "t2", t: "盲签", d: "没看懂内容就签名", at: w("盲签", 14) },
    { id: "t3", t: "delegatecall", d: "借用别的合约代码改写自己的存储", at: w("delegatecall", 14) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 第四种，新增的函数，绕过了原有的检查。
      cam(${t(LS[0])}, "checkD", 1.8); grow("sg4", ${t(LS[0] + 1.2)}); fadeIn("#bdg4", ${t(LS[0] + 1.8)}, 0.4); bump("#bdg4", ${t(LS[0] + 2.3)}, 1.25, 1);
      // ===== L1 2023 年 3 月，Euler Finance 损失约 1.97 亿美元，大部分后来归还。
      pop("#lb-evm", ${t(TM.euler - 0.2)}); pop("#ev-eu", ${t(TM.euler)});
      out("#lb-evm", ${t(TM.euler + 1.6)}); pop("#lb-e197", ${t(TM.euler + 1.7)});
      out("#lb-e197", ${t(TM.back - 0.3)}); pop("#lb-back", ${t(TM.back)});
      // ===== L2 根因是新加的捐赠函数，没有做健康检查。
      out("#lb-back", ${t(LS[2] - 0.2)}); X5.press(tl, "fp", 2, ${t(TM.donate)}, { hold: true, status: "red" }); pop("#lb-donate", ${t(TM.donate)}); flash("#lb-donate", ${t(TM.donate + 0.3)}, 2);
      pop("#lb-bal4", ${t(TM.check2)}); pop("#lb-nocall", ${t(TM.check2 + 0.6)});
      // ===== L3 别的入口都检查了，偏偏新入口漏掉了。
      fadeIn("#rt-ok", ${t(TM.other)}, 0.6); pop("#lb-gate", ${t(TM.other + 0.3)});
      fadeIn("#rt-bad", ${t(TM.miss - 0.4)}, 0.6); pop("#lb-bypass", ${t(TM.miss)}); flash("#rt-bad", ${t(TM.miss + 0.3)}, 2, 0.35);
      // ===== L4 识别信号是，新增了一个能改余额或债务的入口。
      out("#ev-eu", ${t(LS[4] - 0.2)}); pop("#kw4", ${t(TM.sig4)});
      // ===== L5 防御是统一的操作后检查，所有入口都要经过，再用不变量测试兜底。
      out("#kw4, #rt-ok, #rt-bad, #lb-bypass, #lb-gate, #lb-nocall, #lb-donate", ${t(TM.unify - 0.3)});
      fadeIn("#rt-fix", ${t(TM.unify)}, 0.6); pop("#lb-gate2", ${t(TM.unify + 0.4)}); bump("#lb-gate2", ${t(TM.unify + 1.2)}, 1.15, 1);
      X14.lamp(tl, "grd", ${t(TM.inv)}, "green"); pop("#lb-grd", ${t(TM.inv)});
      // ===== L6 第五种，改动过的分叉和新版本，没有重新审计。
      out("#lb-gate2, #lb-grd, #lb-bal4", ${t(LS[6] - 0.2)});
      cam(${t(LS[6])}, "forkD", 1.6); grow("sg5", ${t(LS[6] + 1.2)}); fadeIn("#bdg5", ${t(LS[6] + 1.8)}, 0.4); bump("#bdg5", ${t(LS[6] + 2.3)}, 1.25, 1);
      // ===== L7 2021 年 4 月的 Uranium Finance，分叉了 Uniswap V2。
      pop("#ev-ur", ${t(TM.ura)}); pop("#lb-cm0", ${t(TM.ura + 0.3)}); pop("#lb-cm1", ${t(TM.ura + 0.6)}); pop("#lb-fork", ${t(TM.fork)});
      // ===== L8 改手续费时，漏改了一个常数，恒定乘积的检查就此失效，损失约 5000 万美元。
      pop("#lb-diff", ${t(LS[8])}); X4.tapeMark(tl, "diff", ${t(TM.const8)}, true); X4.tapeMark(tl, "diff", ${t(TM.const8 + 0.4)}, "flash");
      pop("#lb-bal5", ${t(TM.fail8 - 0.5)}); X1.tilt(tl, "bal5", ${t(TM.fail8)}, -16); KIT.broke(tl, "bal5", ${t(TM.fail8 + 0.5)}, { ghost: 1, badge: false });
      pop("#lb-e50", ${t(TM.loss8)});
      // ===== L9 识别信号只有一句话，只改了一行。
      out("#ev-ur, #lb-e50, #lb-fork", ${t(LS[9] - 0.2)}); pop("#kw5", ${t(TM.line9)}); bump("#diff", ${t(TM.line9 + 0.2)}, 1.08, 1);
      // ===== L10 防御是改动即重审，对差异做审计。
      out("#kw5", ${t(LS[10] + 0.4)}); tl.to("#mag", { x: ${MAG_D[0]}, y: ${MAG_D[1]}, duration: 1.0, ease: "power2.inOut" }, ${t(TM.reaudit - 0.6)});
      KIT.stamp(tl, "seal", ${t(TM.reaudit + 0.4)}); pop("#lb-seal", ${t(TM.reaudit + 0.9)}); bump("#lb-seal", ${t(TM.diff10)}, 1.15, 1);
      // ===== L11 第六种，签名人看不懂自己签的是什么。
      out("#lb-seal, #lb-diff, #lb-bal5, #lb-cm0, #lb-cm1", ${t(LS[11] - 0.2)});
      cam(${t(LS[11])}, "signD", 1.6); pop("#lb-ui", ${t(LS[11] + 1.0)}); grow("sg6", ${t(LS[11] + 1.4)}); fadeIn("#bdg6", ${t(LS[11] + 2.0)}, 0.4); bump("#bdg6", ${t(LS[11] + 2.5)}, 1.25, 1); bump("#sgn0, #sgn1", ${t(LS[11] + 3.0)}, 1.1, 1);
      // ===== L12 2024 年 7 月的 WazirX，签名人看到的，和签下的不一致，损失约 2.3 亿美元。
      pop("#ev-wz", ${t(TM.wz)}); pop("#lb-chq", ${t(TM.wz + 1.8)});
      pop("#lb-neq", ${t(TM.neq12)}); bump("#lb-neq", ${t(TM.neq12 + 0.5)}, 1.2, 1); pop("#lb-e23", ${t(TM.loss12)});
      // ===== L13 2025 年 2 月的 Bybit，多签前端的脚本被精准篡改，只对目标地址生效。
      out("#ev-wz, #lb-e23, #lb-neq", ${t(LS[13] - 0.2)}); pop("#ev-bb", ${t(TM.bybit)});
      fadeIn("#uibox", ${t(TM.target - 0.6)}, 0.5); pop("#lb-target", ${t(TM.target)});
      // ===== L14 签名人盲签了一笔 delegatecall，按 FBI 口径，损失约 15 亿美元。
      out("#lb-target", ${t(LS[14] - 0.2)}); pop("#lb-neq", ${t(TM.blind)}); X9.sign(tl, "chq", ${t(TM.blind)}, 0.9);
      X9.field(tl, "chq", ${t(TM.dc)}, 3, "bad"); pop("#lb-dc", ${t(TM.dc)}); pop("#lb-e15", ${t(TM.fbi)});
      // ===== L15 TRON 上的权限诈骗也是这一种，用户签下的，是交出自己账户的权限。
      out("#ev-bb, #lb-e15, #lb-neq, #uibox", ${t(LS[15] - 0.2)}); pop("#ev-tr", ${t(TM.tron)});
      grow("atk", ${t(TM.tron + 0.4)}); pop("#lb-kc", ${t(TM.tron + 0.8)});
      tl.to("#kc", { x: ${f(at(ATK)[0] - at(L.D6_KEYCARD)[0] - 30)}, y: ${f(at(ATK)[1] - at(L.D6_KEYCARD)[1] - 40)}, duration: 1.0, ease: "power2.inOut" }, ${t(TM.perm)});
      // ===== L16 识别信号是，签名界面只显示哈希或摘要。
      out("#ev-tr, #lb-kc, #atk", ${t(LS[16] - 0.2)}); tl.to("#kc", { x: 0, y: 0, duration: 0.6 }, ${t(LS[16] + 0.5)});
      out("#ui-page", ${t(TM.hash - 0.4)}, 0.4); fadeIn("#ui-page2", ${t(TM.hash - 0.4)}, 0.4); pop("#lb-hash", ${t(TM.hash)}); pop("#kw6", ${t(TM.hash + 0.3)});
      // ===== L17 防御是独立解码，在硬件钱包上核对，delegatecall 只许指向白名单里的合约。
      out("#kw6, #lb-hash", ${t(LS[17] + 0.8)}); pop("#lb-hw", ${t(TM.hw)}); bump("#hw", ${t(TM.hw + 0.2)}, 1.12, 1);
      grow("shd", ${t(TM.white - 0.6)}); pop("#lb-shd", ${t(TM.white)});
`,
});
