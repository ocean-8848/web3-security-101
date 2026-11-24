// ep27/seg3「③ 测试三层」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.gatesB（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：A 展台 + B–E 整条流水线，八道关口都在画内（seg2 L0–L3、L13–L17、L21；seg6 L1、L11 结束卡）
//   incidentA    A 售货机 + 攻击者 + 流出的币 + 点阵（seg1 起点 L0–L5）
//   versionA     A 两张版本卡 + 审计报告 + 公章 + 题卡 + 售货机（seg1 L6–L11 终点；seg2 起点）
//   planeB       B 比喻角：模型飞机 + 图纸 + 风洞 + 公章 + 黑匣子 + 塔 + 扳手 + 焊死投递箱（seg2 L4–L12）
//   gatesB       B 关口 ①②③ + 传送带 + 放大镜 + 告警灯（seg2 L18–L23 终点；seg3 起点）
//   specB        B 规格台 + 规格文件 + 天平 + 角色板 + 编码规范（seg3 L0–L3）
//   unitC        C 阅卷机 + 答题卡 + 关口 ④（seg3 L4–L5）
//   fuzzC        C 摇奖机 + 金库份额机 + 份额 + 台秤 + 取整刀（seg3 L6–L10；代码卡 A 在左侧）
//   invC         C 银行柜台 + 回调臂 + 顺序条 + 天平 + 按钮面板 + 不变量清单（seg3 L11–L21；代码卡 B 在右侧）
//   formalC      C 证明卡 + 数学库机器 + 小工程师 + 关口 ⑤（seg3 L22–L24 终点；seg4 起点）
//   auditD       D 冰封版本卡 + 规格文件 + 两名审计 + 竞赛小人 + 竞赛牌 + 修复单 + 编译器手册 + 关口 ⑥（seg4 L0–L7）
//   deployD      D 笔记本 + 链 + 浏览器 + 部署账户 + 钥匙 + 多签保险柜 + 时间锁 + 关口 ⑦（seg4 L8–L12）
//   chainD       D 三块链牌 + 刻度尺 + 时钟 + 回执签 + 两枚币 + 分叉扳道器（seg4 L13–L19 终点；seg5 起点）
//   monitorE     E 关口 ⑧ + 合约 + 监控墙 + 赏金（seg5 L0–L7）
//   warE         E 值班 + 闸刀 + 作战室 + 安全地址 + 冻结 + 公告，带上合约和告警灯（seg5 L8–L14）
//   methE        E mETH 售货机 + 沙漏 + 闸刀 + 塔 + cmETH 币（seg5 L15–L19 终点；seg6 起点 L0）
//   checkE       E 核对台：审计版本卡 + 线上字节码 + 放大镜 + 证明卡 + 改动小卡（seg6 L2–L10）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E14 from "../../../ep14/kit-ext/objects-ext.mjs";
import * as E22 from "../../../ep22/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

// ends static on CAMS.formalC
const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E3, E4, E5, E6, E7, E14, E22, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
/** 不支持 opts.scale 的物件：绕地面点包一层缩放，并换算 anchors（SEGBASE 常见坑 1） */
const wput = (key, o, r, k, dy = 0, extra = {}) => {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, r, dy, { ...extra, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  const isP = (v) => Array.isArray(v) && v.length >= 2 && typeof v[0] === "number" && typeof v[1] === "number";
  for (const [n, v] of Object.entries(A[key])) if (isP(v)) A[key][n] = sc(v); else if (Array.isArray(v) && v.every(isP)) A[key][n] = v.map(sc);
};
const zcard = (o) => ({ ...o, z: L.BELT_Z });
// 传送带（B、C 两段）+ 关口 ①–⑤
put("beltB", L.BELT[0].o, E2.conveyor(L.BELT[0].o, { id: "beltB", len: L.BELT[0].len, width: L.BELT_W }));
put("beltC", L.BELT[1].o, E2.conveyor(L.BELT[1].o, { id: "beltC", len: L.BELT[1].len, width: L.BELT_W }));
const GATES = [...L.B_GATES, ...L.C_GATES], GN = ["①", "②", "③", "④", "⑤"];
const GNAME = ["规格与威胁模型", "编码规范", "静态分析", "测试", "形式化验证"];
GATES.forEach((o, i) => wput(`g${i + 1}`, o, O.checkpoint(o, { id: `g${i + 1}`, n: GN[i], road: false }), 0.6));
put("cardB", L.B_CARD, E4.punchCard(zcard(L.B_CARD), { id: "cardB", kind: "card", title: "版本", scale: 0.7 }), 0.2);
put("cardC", L.C_CARD, E4.punchCard(zcard(L.C_CARD), { id: "cardC", kind: "card", title: "版本", scale: 0.7 }), 0.2);
put("magB", L.B_MAG, O.magnifier(L.B_MAG, { id: "magB", z: 150 }), 0.5);
L.B_BEACONS.forEach((o, i) => put(`bcn${i}`, o, O.beacon(o, { id: `bcn${i}` })));
// B 比喻角（gatesB 起始画面左下角能看到，不加标签）
put("plane", L.B_PLANE, X.planeModel(L.B_PLANE, { id: "plane", scale: 0.9 }));
put("bprint", L.B_BLUEPRINT, O.doc(L.B_BLUEPRINT, { id: "bprint", title: "图纸", w: 140, h: 110 }));
wput("sealB", L.B_SEAL, O.seal(L.B_SEAL, { id: "sealB" }), 0.6);
wput("hsmB", L.B_HSM, O.hsm(L.B_HSM, { id: "hsmB", plate: "黑匣子" }), 0.6);
wput("towerB", L.B_TOWER, O.tower(L.B_TOWER, { id: "towerB" }), 0.5);
put("wrench", L.B_WRENCH, E22.wrench(L.B_WRENCH, { id: "wrench", scale: 0.8 }));
put("burn", L.B_BURN, E6.burnBox(L.B_BURN, { id: "burn", plate: "不可升级", scale: 0.6 }));
// B 规格台
wput("deskB", L.B_DESK, O.desk(L.B_DESK, { id: "deskB" }), 0.6);
put("spec", L.B_SPEC, O.doc(L.B_SPEC, { id: "spec", title: "规格", lines: ["前置条件", "后置条件", "不变量"], standing: true, w: 120, h: 150 }), 0, { grow: true });
wput("bal", L.B_BAL, E1.balance(L.B_BAL, { id: "bal" }), 0.6);
wput("roles", L.B_ROLES, E5.roleBoard(L.B_ROLES, { id: "roles", title: "特权角色" }), 0.6);
wput("manual", L.B_MANUAL, E3.manual(L.B_MANUAL, { id: "manual", title: "编码规范", sub: "" }), 0.6);
put("signB", L.B_SIGN, E1.signBoard(L.B_SIGN, { id: "signB", style: "plate", text: "设计台" }));
// C 单元测试
put("gm", L.C_GRADER, E14.gradingMachine(L.C_GRADER, { id: "gm", title: "单元测试", scale: 0.7 }));
put("sheet", L.C_SHEET, E14.answerSheet(L.C_SHEET, { id: "sheet", title: "想到的情况", scale: 0.7 }));
// C 模糊测试
wput("lot", L.C_LOTTERY, E2.lottery(L.C_LOTTERY, { id: "lot", plate: "随机输入" }), 0.6);
put("disp", L.C_DISP, E6.shareDispenser(L.C_DISP, { id: "disp", scale: 0.7 }));
put("cert", L.C_CERT, E6.shareCert(L.C_CERT, { id: "cert", scale: 0.8 }));
put("scl", L.C_SCALE, E7.scale(L.C_SCALE, { id: "scl", scale: 0.7 }));
put("rc", L.C_CUTTER, E6.roundCutter(L.C_CUTTER, { id: "rc", scale: 0.55, labels: { L: "金库", R: "用户" } }));
// C 不变量测试
put("bank", L.C_COUNTER, E4.tellerCounter(L.C_COUNTER, { id: "bank", scale: 0.7, sign: "银行", cash: 4 }));
put("cba", L.C_CALLBACK, E4.callbackArm(L.C_CALLBACK, { id: "cba", scale: 0.7, s: 0, target: A.bank.slot }));
wput("bal2", L.C_BAL, E1.balance(L.C_BAL, { id: "bal2" }), 0.7);
wput("panel", L.C_PANEL, E5.funcPanel(L.C_PANEL, { id: "panel", buttons: ["存款", "取款", "转账"], title: "BANK · 外部函数" }), 0.6);
put("invl", L.C_INVLIST, O.doc(L.C_INVLIST, { id: "invl", title: "不变量清单", lines: ["余额 ≥ 存款", "取回 ≤ 存入", ""], standing: true, w: 120, h: 150 }), 0, { grow: true });
// C 形式化验证
put("proof", L.C_PROOF, E2.proofCard(L.C_PROOF, { id: "proof", missing: true }));
wput("math", L.C_MATHLIB, E3.contractMachine(L.C_MATHLIB, { id: "math", name: "数学库" }), 0.5);
put("eng", L.C_ENG, O.person(L.C_ENG, { id: "eng", role: "engineer", scale: 0.45 }), 0, { grow: true });
put("signC", L.C_SIGN, E1.signBoard(L.C_SIGN, { id: "signC", style: "plate", text: "测试车间" }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
// 关口名（seg2 结尾就在）+ 告警灯"已结论"
GATES.forEach((o, i) => lb(`lb-g${i + 1}`, up(A[`g${i + 1}`].top, 6), GNAME[i], "lab-g lab-sm"));
L.B_BEACONS.forEach((o, i) => lb(`lb-bc${i}`, up(A[`bcn${i}`].top, 4), "已结论", "lab-gs lab-xs"));
// L0–L3 规格台
lb("lb-desk", up(A.deskB.top, 6), "规格台", "lab-ink lab-sm");
lb("lb-pre", up(A.spec.top, 70), "前置条件 · 调用前", "lab-cs lab-sm");
lb("lb-post", up(A.spec.top, 12), "后置条件 · 调用后", "lab-cs lab-sm");
lb("lb-bal", up(A.bal.top, 6), "不变量 · 任何时候都成立", "lab-gs lab-sm");
lb("lb-roles", up(A.roles.top, 6), "每个特权角色 · 最大破坏力", "lab-rs lab-sm");
(A.roles.cards || []).slice(0, 4).forEach((p, i) => pin(`lb-rx${i}`, p, `<span class="lab lab-rs lab-xs hide" id="lb-rx${i}-in">!</span>`));
// L5 单元测试
lb("lb-gm", up(A.gm.top, 6), "单元测试", "lab-ink lab-sm");
lb("lb-sheet", up(A.sheet.top, 6), "想到的情况", "lab-cs lab-sm", "r");
// L6–L10 模糊测试
lb("lb-lot", up(A.lot.top, 6), "随机输入", "lab-cs lab-sm");
const AMT = ["37", "1,000,000", "5", "250,000", "7"];
AMT.forEach((v, i) => lb(`lb-amt${i}`, [A.lot.tray[0] + 60 + i * 2, A.lot.tray[1] - 10 + i], v, "lab-ink lab-xs", "l"));
lb("lb-disp", up(A.disp.top, 6), "金库", "lab-ink lab-sm");
lb("lb-scl", up(A.scl.top, 6), "取回 ≤ 存入", "lab-cs lab-sm");
lb("lb-ok", [A.scl.top[0] + 60, A.scl.top[1] + 40], "通过", "lab-gs lab-sm", "l");
lb("lb-bad", [A.scl.top[0] + 62, A.scl.top[1] + 41], "取回 &gt; 存入 · 失败", "lab-rs lab-sm", "l");
lb("lb-rc", [A.rc.trayL[0], A.rc.trayL[1] + 8], "舍入偏向金库", "lab-gs lab-sm", "t");
// L11–L21 不变量测试
lb("lb-panel", up(A.panel.top, 6), "调用顺序随机", "lab-cs lab-sm");
lb("lb-bank", [A.bank.top[0] - 60, A.bank.top[1] - 4], "银行合约", "lab-ink lab-sm");
lb("lb-bal2", [A.bal2.foot[0], A.bal2.foot[1] + 10], "余额 ≥ 存款总和", "lab-gs lab-sm", "t");
lb("lb-cba", [A.cba.ground[0] + 40, A.cba.ground[1] + 6], "回调", "lab-rs lab-xs", "t");
const OR = at(L.C_ORDER);
lb("lb-o1", [OR[0] - 70, OR[1] + 10], "存款", "lab-cs lab-sm", "c");
lb("lb-o2", [OR[0] + 50, OR[1] + 10], "→ 回调", "lab-rs lab-sm", "c");
lb("lb-o3", [OR[0] + 180, OR[1] + 10], "→ 转账", "lab-cs lab-sm", "c");
lb("lb-oq", [OR[0] + 50, OR[1] - 40], "?", "lab-ink lab-sm", "b");
lb("lb-only", [OR[0] - 150, OR[1] - 60], "只随机参数", "lab-ink lab-sm", "b");
lb("lb-only-x", [OR[0] - 149, OR[1] - 59], "只随机参数 ✕", "lab-rs lab-sm", "b");
lb("lb-found", [A.bal2.top[0], A.bal2.top[1] - 8], "发现", "lab-gs lab-sm");
lb("lb-wrap", [A.cba.ground[0] + 40, A.cba.ground[1] + 52], "封装合约", "lab-cs lab-xs", "t");
const IL = A.invl.top, ILx = IL[0] + 100;
lb("lb-inv1", [ILx, IL[1] + 30], "✓ 余额 ≥ 存款", "lab-gs lab-xs", "l");
lb("lb-inv2", [ILx, IL[1] + 74], "✓ 取回 ≤ 存入", "lab-gs lab-xs", "l");
lb("lb-inv3", [ILx, IL[1] + 132], "健康因子 ≥ 1 或可被清算<br>清算后协议不亏", "lab-dash lab-xs", "l");
lb("lb-euler", [ILx, IL[1] - 14], `Euler 事故 ${gtag("示例")}`, "lab-rs lab-xs", "l");
lb("lb-miss", [ILx, IL[1] + 222], "测试工具 · 不会发现", "lab-off lab-xs", "l");
// L22–L24 形式化验证
lb("lb-math", up(A.math.top, 6), "数学库", "lab-ink lab-sm");
const MR = [A.math.top[0] + 110, A.math.top[1] + 70];
lb("lb-liq", MR, "清算逻辑", "lab-cs lab-xs", "l");
lb("lb-bridge", [MR[0], MR[1] + 44], "跨链桥证明验证", "lab-cs lab-xs", "l");
lb("lb-proof", up(A.proof.top, 6), "所有输入 · 所有状态", "lab-gs lab-sm");
lb("lb-eng", up(A.eng.top, 6), "规格编写成本高", "lab-ink lab-xs");

// ---------------------------------------------------------------- 屏幕层卡片
const CA = { x: 60, y: 590, w: 620 }, CB = { x: 466, y: 96, w: 600 };
const cardA = codeCard("ca", { ...CA, head: "模糊测试", tag: gtag("示意"), mono: true, rows: [
  "function testFuzz(uint96 <b>assets</b>)",
  "  shares = vault.deposit(assets)",
  "  back   = vault.redeem(shares)",
  "  assertLe(back, assets)  // 取回 ≤ 存入",
] });
const cardB = codeCard("cbk", { ...CB, head: "不变量测试", tag: gtag("示意"), mono: true, rows: [
  "targetContract(handler)  // 随机调用",
  "function invariant_solvent()",
  "  assertGe(bank.balance, sumOfDeposits)",
] });
S.curve("cvA0", [CA.x + CA.w + 4, codeRowY(CA.y, 0)], S.scr("fuzzC", A.lot.tray), { color: "#e0453a" });
S.curve("cvA3", [CA.x + CA.w + 4, codeRowY(CA.y, 3)], S.scr("fuzzC", A.scl.pan), { color: "#e0453a" });
S.curve("cvB0", [CB.x + CB.w + 4, codeRowY(CB.y, 0)], S.scr("invC", A.panel.top), { color: "#e0453a" });
S.curve("cvB2", [CB.x + CB.w + 4, codeRowY(CB.y, 2)], S.scr("invC", A.bal2.top), { color: "#e0453a" });
const TIER = (id, txt, y) => `<div class="tier hide" id="${id}" style="left:400px;top:${y}px">${txt}</div>`;
const html = cardA + cardB + TIER("tr0", "单元测试 · 想到的情况", 330) + TIER("tr1", "模糊测试 · 随机输入", 254) + TIER("tr2", "不变量测试 · 随机顺序", 178)
  + kw("kw-q", `先猜一道题 <b>?</b>`, { x: 1180, y: 120, size: 40, accent: "#2aa3c9" });
const css = `
  #ca .c-row, #cbk .c-row { font-size: 24px; }
  .lab-xs { font-size: 22px; padding: 2px 10px 4px; border-radius: 8px; }
  .lab-dash { background: #fff6f4; border: 3px dashed #e0453a; color: #c3352b; }
  .lab-off { background: #e6e2da; border-color: #b5afa3; color: #8a857b; }
  .tier { position: absolute; width: 360px; padding: 10px 18px; border-radius: 12px; background: #fffdf8; border-left: 8px solid #2aa3c9;
    box-shadow: 0 8px 20px rgba(70,60,40,0.12); font-size: 30px; font-weight: 900; white-space: nowrap; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  pre: w("调用前", 1), post: w("调用后", 1), inv: w("不变量", 2), role: w("特权角色", 3),
  unit: w("单元测试", 5), fuzz: w("模糊测试", 6), dep: w("存进去", 7), wd: w("取出来", 7),
  more: w("取回的", 9), fail: w("失败", 9), round: w("舍入", 10),
  order: w("调用的顺序", 11), bank: w("银行合约", 12), check: w("检查", 13), solv: w("余额", 13),
  dep15: w("存款", 15), cb15: w("回调", 15), tr15: w("转账", 15),
  only: w("只随机参数", 16), no: w("通常不能", 17), seq: w("随机调用序列", 18), wrapc: w("封装合约", 18), find: w("发现", 18),
  only19: w("写下的不变量", 19), euler: w("Euler", 20), hf: w("健康因子", 20), miss: w("不会发现", 21),
  liq: w("清算逻辑", 22), bridge: w("跨链桥", 22), formal: w("形式化验证", 22), proof: w("证明", 23), all: w("所有输入", 23),
  cost: w("规格难写", 24),
};
const t = (x) => f(x);

S.build({
  cam0: "gatesB", sub: "随机的是输入，还是调用顺序",
  grid: { u0: 1200, u1: 9600, v0: -4400, v1: 3900 }, box: [1300, -3100, 6000, 2900],   // 盖住本段镜头 gatesB · specB · unitC · fuzzC · invC · formalC
  shown: ["#lb-g1", "#lb-g2", "#lb-g3", "#lb-bc0", "#lb-bc1", "#lb-bc2"], css, html,
  terms: [
    { id: "t0", t: "舍入", d: "除不尽时取整，零头归哪一方", at: w("舍入", 10) },
    { id: "t1", t: "重入", d: "合约在外部调用中被再次调用进来", at: w("重入", 15) },
    { id: "t2", t: "健康因子", d: "抵押与借款之比，过低就会被清算", at: w("健康因子", 20) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      const PR = (i, tt) => X5.press(tl, "panel", i, tt);
      // ===== L0 测试之前，先要写清楚测什么。
      cam(${t(LS[0] + 0.2)}, "specB", 1.6);
      pop("#lb-desk", ${t(LS[0] + 1.3)}); grow("spec", ${t(LS[0] + 1.5)});
      // ===== L1 规格里，写出每个函数调用前要满足什么，调用后保证什么。
      bump("#spec", ${t(LS[1] + 0.3)}, 1.06, 1); pop("#lb-pre", ${t(TM.pre)}); pop("#lb-post", ${t(TM.post)});
      // ===== L2 再写出系统的不变量，也就是任何时候都必须成立的性质。
      pop("#lb-bal", ${t(TM.inv)}); X1.tilt(tl, "bal", ${t(TM.inv + 0.3)}, -2, 0.5); X1.tilt(tl, "bal", ${t(TM.inv + 0.9)}, 6, 0.8);
      // ===== L3 还要列出每个特权角色，最多能造成多大破坏。
      pop("#lb-roles", ${t(TM.role)}); [0, 1, 2, 3].forEach((i) => pop("#lb-rx" + i + "-in", ${t(TM.role + 0.6)} + i * 0.25, 0.2));
      // ===== L4 有了这些，测试分三层。
      out("#lb-bc0, #lb-bc1, #lb-bc2", ${t(LS[4] - 0.2)});
      out("#lb-desk, #lb-pre, #lb-post, #lb-bal, #lb-roles, #lb-rx0-in, #lb-rx1-in, #lb-rx2-in, #lb-rx3-in", ${t(LS[4] - 0.2)});
      cam(${t(LS[4])}, "unitC", 1.5); pop("#lb-g4", ${t(LS[4] + 1.2)});
      pop("#tr0", ${t(LS[4] + 1.2)}); pop("#tr1", ${t(LS[4] + 1.5)}); pop("#tr2", ${t(LS[4] + 1.8)});
      // ===== L5 第一层，单元测试，验证你想到的情况。
      pop("#lb-gm", ${t(TM.unit)}); pop("#lb-sheet", ${t(TM.unit + 0.3)}); bump("#tr0", ${t(TM.unit)}, 1.08, 1);
      X5.moveUV(tl, "sheet", ${t(TM.unit + 1.0)}, ${L.C_GRADER.u - L.C_SHEET.u}, ${L.C_GRADER.v - L.C_SHEET.v - 20}, 70, 0.8, 30);
      out("#sheet, #lb-sheet", ${t(TM.unit + 1.8)}, 0.3); X14.card(tl, "gm", ${t(TM.unit + 1.8)}, true, 0.3);
      X14.grade(tl, "gm", ${t(TM.unit + 2.2)}, "green", "通过");
      // ===== L6 第二层，模糊测试，让工具生成大量随机输入。
      out("#tr0, #tr1, #tr2, #lb-gm", ${t(LS[6] - 0.2)}); cam(${t(LS[6])}, "fuzzC", 1.4);
      pop("#lb-lot", ${t(TM.fuzz + 0.6)}); KIT.drum(tl, "lot", ${t(TM.fuzz + 0.8)}, 2.4, 3);
      [0, 1].forEach((i) => KIT.ballOut(tl, "lot", ${t(TM.fuzz + 1.6)} + i * 0.9, 0.5));
      pop("#lb-amt0", ${t(TM.fuzz + 2.0)}); out("#lb-amt0", ${t(LE[6])}, 0.2);
      // ===== L7 比如一个金库，存进去，马上取出来，用户不能多拿。
      pop("#ca", ${t(LS[7])}); draw("cvA0", ${t(LS[7] + 0.5)}); pop("#lb-disp", ${t(LS[7] + 0.3)}); pop("#lb-scl", ${t(LS[7] + 0.6)});
      X6.issue(tl, "disp", ${t(TM.dep)}, 0); X6.tally(tl, "disp", ${t(TM.dep)}, 0.5, 0, 100);
      draw("cvA3", ${t(TM.wd)}); X7.weigh(tl, "scl", ${t(TM.wd)}); X7.read(tl, "scl", ${t(TM.wd)}, "before", 100, 0.3); X7.read(tl, "scl", ${t(TM.wd + 0.3)}, "after", 100, 0.3);
      X7.diff(tl, "scl", ${t(TM.wd + 0.6)}, true, "≤"); pop("#lb-ok", ${t(TM.wd + 0.7)});
      // ===== L8 工具会换着各种随机金额，一遍遍去试。
      [1, 2, 3].forEach((k) => { const tt = ${t(LS[8] + 0.2)} + (k - 1) * 1.0;
        KIT.ballOut(tl, "lot", tt, 0.4); pop("#lb-amt" + k, tt + 0.1, 0.15); out("#lb-amt" + k, tt + 0.85, 0.12);
        X7.weigh(tl, "scl", tt + 0.4); X7.read(tl, "scl", tt + 0.4, "before", [0, 1000000, 5, 250000][k], 0.2); X7.read(tl, "scl", tt + 0.5, "after", [0, 1000000, 5, 250000][k], 0.2); });
      KIT.drum(tl, "lot", ${t(LS[8])}, 3.0, 4);
      // ===== L9 只要有一个金额，让取回的比存入的多，测试就失败。
      KIT.ballOut(tl, "lot", ${t(LS[9] + 0.2)}, 0.4); pop("#lb-amt4", ${t(LS[9] + 0.3)});
      X7.read(tl, "scl", ${t(TM.more)}, "before", 7, 0.2); X7.read(tl, "scl", ${t(TM.more + 0.2)}, "after", 8, 0.2); X7.diff(tl, "scl", ${t(TM.more + 0.4)}, false, "&gt;");
      hot("#ca-r3", ${t(TM.more + 0.4)}); out("#lb-ok", ${t(TM.fail - 0.15)}, 0.12); pop("#lb-bad", ${t(TM.fail)});
      out("#lb-bad, #lb-amt4", ${t(LE[9] - 0.1)}, 0.2); X7.diff(tl, "scl", ${t(LE[9])}, true, "≤"); pop("#lb-ok", ${t(LE[9] + 0.05)});
      // ===== L10 这条性质背后的规则是，舍入必须偏向金库。
      X6.cut(tl, "rc", ${t(TM.round + 0.4)}, "L"); pop("#lb-rc", ${t(TM.round + 1.2)});
      // ===== L11 第三层，不变量测试，随机的不是参数，是调用的顺序。
      out("#ca, #cvA0, #cvA3, #lb-lot, #lb-disp, #lb-scl, #lb-ok, #lb-rc", ${t(LS[11] - 0.2)}); cam(${t(LS[11])}, "invC", 1.5);
      pop("#lb-bank", ${t(LS[11] + 1.3)}); [0, 1, 2].forEach((i) => PR(i, ${t(TM.order)} + i * 0.3)); pop("#lb-panel", ${t(TM.order + 0.2)});
      // ===== L12 比如一个银行合约，存款、取款、转账，被随机组合着连续调用。
      pop("#cbk", ${t(TM.bank)}); draw("cvB0", ${t(TM.bank + 0.5)});
      [0, 2, 1, 0].forEach((b, k) => { const tt = ${t(LS[12] + 2.0)} + k * 0.85; PR(b, tt); X4.cashOut(tl, "bank", k, tt + 0.2, 0.5); });
      // ===== L13 每一步之后都检查一次，银行的余额，不少于所有存款加起来。
      draw("cvB2", ${t(TM.check)}); pop("#lb-bal2", ${t(TM.solv)});
      [1, 2, 0, 1].forEach((b, k) => { const tt = ${t(TM.check + 0.6)} + k * 1.05; PR(b, tt); X1.tilt(tl, "bal2", tt + 0.25, 2, 0.3); X1.tilt(tl, "bal2", tt + 0.6, 6, 0.35); bump("#lb-bal2", tt + 0.6, 1.08, 1); });
      // ===== L14 先猜一道题。
      out("#cbk, #cvB0, #cvB2, #lb-panel", ${t(LS[14] - 0.2)}); pop("#kw-q", ${t(LS[14])});
      // ===== L15 一个重入漏洞，要先调用存款，再在回调里调用转账，才会触发。
      pop("#lb-o1", ${t(TM.dep15)}); X4.callArm(tl, "cba", ${t(TM.cb15)}, 1, 0.6); pop("#lb-cba", ${t(TM.cb15 + 0.2)}); pop("#lb-o2", ${t(TM.cb15)}); pop("#lb-o3", ${t(TM.tr15)});
      // ===== L16 只随机参数的模糊测试，能发现它吗？
      pop("#lb-only", ${t(TM.only)}); pop("#lb-oq", ${t(TM.only + 0.6)});
      // ===== L17 通常不能，因为它不会打乱调用顺序。
      out("#lb-only", ${t(TM.no)}, 0.15); pop("#lb-only-x", ${t(TM.no + 0.05)});
      // ===== L18 不变量测试生成随机调用序列，再配上能触发回调的封装合约，才有机会发现。
      out("#kw-q, #lb-oq", ${t(LS[18] - 0.2)}); PR(0, ${t(TM.seq)}); bump("#lb-o1", ${t(TM.seq)}, 1.1, 1);
      pop("#lb-wrap", ${t(TM.wrapc)}); X4.callArm(tl, "cba", ${t(TM.wrapc + 0.3)}, 0.6, 0.3); X4.callArm(tl, "cba", ${t(TM.wrapc + 0.65)}, 1, 0.3); bump("#lb-o2", ${t(TM.wrapc + 0.4)}, 1.1, 1);
      PR(2, ${t(TM.wrapc + 1.1)}); bump("#lb-o3", ${t(TM.wrapc + 1.1)}, 1.1, 1); X4.cashOut(tl, "bank", 3, ${t(TM.wrapc + 1.2)}, 0.5);
      X1.tilt(tl, "bal2", ${t(TM.find - 0.5)}, -16, 0.5); KIT.broke(tl, "bal2", ${t(TM.find - 0.1)}, { ghost: 1, badge: false });
      out("#lb-bal2", ${t(TM.find - 0.2)}, 0.15); pop("#lb-found", ${t(TM.find)});
      // ===== L19 但要注意，不变量测试只检查你写下的不变量。
      out("#lb-o1, #lb-o2, #lb-o3, #lb-only-x, #lb-cba, #lb-wrap", ${t(LS[19] - 0.2)});
      grow("invl", ${t(LS[19])}); pop("#lb-inv1", ${t(TM.only19)}); pop("#lb-inv2", ${t(TM.only19 + 0.3)});
      // ===== L20 Euler 事故里那一条，每个账户健康因子不低于 1，或者能被清算，而且清算后协议不亏。
      pop("#lb-euler", ${t(TM.euler)}); pop("#lb-inv3", ${t(TM.hf)});
      // ===== L21 如果它没写进测试，工具也不会发现。
      flash("#lb-inv3", ${t(LS[21])}, 2, 0.4); pop("#lb-miss", ${t(TM.miss)});
      // ===== L22 核心数学库、清算逻辑、跨链桥的证明验证，还可以再做形式化验证。
      KIT.fixed(tl, "bal2", ${t(LS[22] - 0.4)}); X1.tilt(tl, "bal2", ${t(LS[22] - 0.4)}, 6, 0.4);
      out("#lb-bank, #lb-found, #lb-inv1, #lb-inv2, #lb-inv3, #lb-euler, #lb-miss", ${t(LS[22] - 0.2)}); cam(${t(LS[22])}, "formalC", 1.4);
      pop("#lb-math", ${t(LS[22] + 1.2)}); X3.spin(tl, "math", ${t(LS[22] + 1.2)}, 4.0, 2);
      pop("#lb-liq", ${t(Math.max(TM.liq, LS[22] + 1.5))}); pop("#lb-bridge", ${t(TM.bridge)}); pop("#lb-g5", ${t(TM.formal)});
      // ===== L23 它用数学方法证明，代码在所有输入和状态下都满足规格。
      KIT.swap(tl, "#proof-slot", "#proof-card", ${t(TM.proof)}, 0.3); bump("#proof", ${t(TM.proof + 0.3)}, 1.06, 1); pop("#lb-proof", ${t(TM.all)}); X3.spin(tl, "math", ${t(TM.all + 1.0)}, 2.0, 1); bump("#lb-proof", ${t(TM.all + 1.6)}, 1.06, 1);
      // ===== L24 代价是规格难写，需要专门的人才。
      grow("eng", ${t(LS[24])}); pop("#lb-eng", ${t(TM.cost + 0.2)});
`,
});
