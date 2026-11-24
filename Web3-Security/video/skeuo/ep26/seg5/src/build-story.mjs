// ep26/seg5「⑤ 代码两边」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.kycC（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：整条智能体大街（seg2 L0–L5 放大器、seg6 L16 结束卡）
//   vaultA       A 奖池保险柜 + Freysa + 玩家 + 新会话文件 + 金币 + 点阵（seg1 起点 L0–L7）
//   ruleA        A 提示词文件 + 合约机器 + 转账请求信封（seg1 L8–L11 终点；seg2 起点）
//   aideA        A 右半助理角：新助理 + 支付卡 + 递纸条的人（seg2 L6–L15）
//   crossA       A 五岔路口五块牌（seg2 L16–L20）
//   workshopB    B 智能体 + 五个入口 + 钱包工具 + 链（seg2 L21 终点；seg3 起点 L0–L4）
//   injectB      B Grok + 智能体 + 会员 NFT 卡 + 屏蔽墙 + 20 点点阵（seg3 L5–L9）
//   memoryB      B 记忆柜 + 伪造历史记录 + 智能体（seg3 L10–L14）
//   toolB        B 工具说明手册 + MCP 包 + 两把私钥（seg3 L15–L18）
//   panelB       B 运维面板 + 攻击者 + 回复信封 + 55.5 ETH + 台秤 + 代币（seg3 L19–L24 终点；seg4 起点）
//   meetC        C 笔记本视频会议 + 扩展包裹 + 手机视频 + 换脸面具 + 诈骗集团 + 受害者（seg4 L0–L6）
//   kycC         C 相机 + 护照 + 注入电缆 + 钓鱼信 + 暗语 + 家人 + 换渠道确认 + 点阵（seg4 L7–L18 终点；seg5 起点）
//   benchD       D 阅卷机 + 答题卡 + 审计 AI + 放大镜 + 合约机器 + 沙漏 + 点阵（seg5 L0–L9）
//   oracleD      D 开发机 + 工程师 + 报价机 + 幽灵指针 + 坏账点阵（seg5 L10–L14；代码卡 A 在左侧）
//   supplyD      D 假扩展 + 荒地抢注 + 三张工位 + 内部 AI 机柜（seg5 L15–L18）
//   defendD      D 盾 + 工程师 + 审计 AI + 放大镜（seg5 L19–L20 终点；seg6 起点）
//   gateE        E 加固智能体 + 输入隔离墙 + 三道关卡 + 低额钱包 + 主资产 + 额度表 + 确认设备 + 记忆 / 余额 / 面板（seg6 L0–L9）
//   userE        E 右端用户角（seg6 L10–L11）
//   answerE      E 合约限额机器 + 被拒的信封 + 小提示词文件 + 三道关卡（seg6 L12–L15）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f, ZONE } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as E13 from "../../../ep13/kit-ext/objects-ext.mjs";
import * as E14 from "../../../ep14/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.defendD

// 段内镜头：oracleD 的物件整体右移，给左侧代码卡 A 留位
const CAMS = { ...L.CAMS, oracleDL: L.fit(L.R.oracle, [760, 300, 1820, 860], 1.4) };
const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E3, E4, E7, E8, E11, E13, E14, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 不支持 opts.scale 的物件：绕地面点包一层并换算 anchors
const wput = (key, o, k, r, dy = 0, extra = {}) => {
  const [gx, gy] = at(o);
  put(key, o, r, dy, { ...extra, wrap: (svg) => `<g id="${key}-wrap"><g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g></g>` });
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; }
};

// ---------------------------------------------------------------- 世界物件
// C 开户台（上一段终点 kycC 的关键物件，保证开场 2 秒不空）
put("snapc", L.C_CAMERA, E11.snapshotCamera(L.C_CAMERA, { id: "snapc", scale: 0.6 }));
put("pass", L.C_PASSPORT, E13.passport(L.C_PASSPORT, { id: "pass", scale: 0.7, title: "KYC" }));
L.C_PHISH.forEach((q, i) => put(`ph${i}`, q, E1.letter(q, { id: `ph${i}`, state: "attacker" })));
put("codew", L.C_CODE, O.doc(L.C_CODE, { id: "codew", title: "暗语", w: 90, h: 110 }));
L.C_FAMILY.forEach((q, i) => put(`fam${i}`, q, O.person(q, { id: `fam${i}`, role: "signer", scale: q.scale })));
wput("cfm", L.C_CONFIRM, 0.7, O.phone(L.C_CONFIRM, { id: "cfm" }));
put("sgC1", L.C_SIGN[1], E1.signBoard(L.C_SIGN[1], { id: "sgC1", style: "plate", text: "开户台", size: 32 }));

// D 找漏洞
put("gm", L.D_GRADER, E14.gradingMachine(L.D_GRADER, { id: "gm", title: "基准", scale: 0.7 }));
L.D_SHEETS.forEach((q, i) => put(`sh${i}`, q, E14.answerSheet(q, { id: `sh${i}`, scale: 0.7 }), 0, { grow: true }));
put("aud", L.D_AUDIT, E8.liqBot(L.D_AUDIT, { id: "aud", scale: 1.1, scr: "审计" }));
put("mag", L.D_MAG, O.magnifier(L.D_MAG, { id: "mag" }), 30);
L.D_CMS.forEach((q, i) => wput(`cm${i}`, q, 0.45, E3.contractMachine(q, { id: `cm${i}`, name: "BSC" })));
wput("hg", L.D_HOUR, 0.7, O.hourglass(L.D_HOUR, { id: "hg" }));
put("sgD0", L.D_SIGN[0], E1.signBoard(L.D_SIGN[0], { id: "sgD0", style: "plate", text: "找漏洞", size: 32 }));
// D 写代码
wput("dk", L.D_DESK, 0.65, O.desk(L.D_DESK, { id: "dk" }));
put("dev", L.D_DEV, O.person(L.D_DEV, { id: "dev", role: "engineer", scale: 0.5 }));
put("ov", L.D_ORACLE, E1.miniVend(L.D_ORACLE, { id: "ov", kind: "oracle", scale: 0.8, needle: 30 }));
put("ovg", L.D_ORACLE, E4.oracleGhost(L.D_ORACLE, { id: "ov", scale: 0.8, deg: -62, real: 30, shown: false }), 0.01);
put("sgD1", L.D_SIGN[1], E1.signBoard(L.D_SIGN[1], { id: "sgD1", style: "plate", text: "写代码", size: 32 }));
// D 供应链
put("px", L.D_EXTP, E7.parcel(L.D_EXTP, { id: "px", scale: 0.8 }));
put("lot", L.D_LOT, E7.emptyLot(L.D_LOT, { id: "lot", scale: 0.6 }));
put("sq", L.D_SQUAT, E1.signBoard(L.D_SQUAT, { id: "sq", style: "wood", text: "抢注", size: 32, color: "#e0453a" }), 1, { grow: true });
put("atk", L.D_ATK, O.person(L.D_ATK, { id: "atk", role: "attacker", scale: 0.45 }), 0, { grow: true });
L.D_DESKS.forEach((q, i) => wput(`dw${i}`, q, 0.55, O.desk(q, { id: `dw${i}` })));
wput("rk", L.D_RACK, 0.55, O.rack(L.D_RACK, { id: "rk" }));
// D 防御角
wput("shd", L.D_SHIELD, 0.7, O.shield(L.D_SHIELD, { id: "shd" }));
put("eng", L.D_ENG, O.person(L.D_ENG, { id: "eng", role: "engineer", scale: 0.5 }));

// ---------------------------------------------------------------- 原生 SVG：点阵、框、柱
const [dx0, dy0] = at(L.D_DOTS);
const circ = (x, y, r, fill, extra = "") => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${fill}" ${extra}/>`;
const DOT_TOP = { u: L.D_DOTS.u, v: L.D_DOTS.v + 4000 };   // 排序靠后：画在物件上面
{
  const d405 = [], d405r = [];
  for (let i = 0; i < 405; i++) { const x = dx0 + 7 + (i % 30) * 13.5, y = dy0 + 7 + Math.floor(i / 30) * 13.5; d405.push(circ(x, y, 4, "#2aa3c9")); if (i % 9 === 4 && d405r.length < 46) d405r.push(circ(x, y, 4.6, "#e0453a")); }
  add(DOT_TOP, S.hid("d405", d405.join("")));
  add(DOT_TOP, S.hid("d405r", d405r.join("")), 1);
  const d46 = []; for (let i = 0; i < 46; i++) d46.push(circ(dx0 + 40 + (i % 10) * 34, dy0 + 30 + Math.floor(i / 10) * 34, 11, "#e0453a"));
  add(DOT_TOP, S.hid("d46", d46.join("")), 2);
  const b100 = []; for (let i = 0; i < 100; i++) { const x = dx0 + 12 + (i % 25) * 16.3, y = dy0 + 60 + Math.floor(i / 25) * 16.3;
    b100.push(i < 46 ? circ(x, y, 5.5, "#2aa3c9") : circ(x, y, 4.5, "none", `stroke="#9a9488" stroke-width="2"`)); }
  add(DOT_TOP, S.hid("bar100", b100.join("")), 3);
  const bx = [], bxx = []; for (let i = 0; i < 22; i++) { const x = dx0 + 22 + (i % 11) * 36, y = dy0 + 60 + Math.floor(i / 11) * 40;
    bx.push(`<rect x="${x}" y="${y}" width="26" height="26" rx="4" fill="#d8d2c6" stroke="#9a9488" stroke-width="2"/>`);
    bxx.push(`<path d="M${x + 5} ${y + 5}L${x + 21} ${y + 21}M${x + 21} ${y + 5}L${x + 5} ${y + 21}" stroke="#6f6a60" stroke-width="3" stroke-linecap="round"/>`); }
  add(DOT_TOP, S.hid("box22", bx.join("")), 4);
  add(DOT_TOP, S.hid("box22x", bxx.join("")), 5);
  add(DOT_TOP, S.hid("bars2", `<rect x="${dx0 + 90}" y="${dy0 + 20}" width="70" height="180" rx="6" fill="#2aa3c9"/>`
    + `<rect x="${dx0 + 260}" y="${dy0 + 150}" width="70" height="50" rx="6" fill="#b8b0a1"/>`
    + `<path d="M${dx0 + 40} ${dy0 + 201}H${dx0 + 380}" stroke="#1c1c1c" stroke-width="3"/>`), 6);
  // 两台 BSC 合约机器：各一个红点，第二台再加红虚线框
  L.D_CMS.forEach((q, i) => { const p = A[`cm${i}`].top; add({ u: q.u, v: q.v + 4000 }, S.hid(`cmdot${i}`, circ(p[0], p[1] + 30, 12, "#e0453a", `stroke="#fff" stroke-width="3"`))); });
  const [c1x, c1y] = at(L.D_CMS[1]);
  add({ u: L.D_CMS[1].u, v: L.D_CMS[1].v + 4000 }, S.hid("cmbad", `<rect x="${c1x - 80}" y="${c1y - 130}" width="160" height="175" rx="10" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 8"/>`), 1);
  // 模拟器外框：罩住整组找漏洞物件
  const RB = L.R.bench; const fx0 = Math.min(...RB.map((q) => q[0])) - 14, fy0 = Math.min(...RB.map((q) => q[1])) - 14;
  const fx1 = Math.max(...RB.map((q) => q[2])) + 14, fy1 = Math.max(...RB.map((q) => q[3])) + 14;
  add({ u: L.D_DOTS.u, v: L.D_DOTS.v + 9000 }, S.hid("simf", `<rect x="${fx0}" y="${fy0}" width="${fx1 - fx0}" height="${fy1 - fy0}" rx="18" fill="rgba(42,163,201,0.05)" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="16 10"/>`));
  S.SIMF = [fx0, fy0, fx1, fy1];
  // 坏账 18 点
  const [bdx, bdy] = at(L.D_BAD); const bad = []; for (let i = 0; i < 18; i++) bad.push(circ(bdx + 22 + (i % 6) * 34, bdy + 18 + Math.floor(i / 6) * 28, 10, "#e0453a"));
  add({ u: L.D_BAD.u, v: L.D_BAD.v + 4000 }, S.hid("dbad", bad.join("")));
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-gm", up(A.gm.top, 6), "基准", "lab-ink lab-sm");
lb("lb-sh0", up(A.sh0.top, 6), "SCONE-bench", "lab-cs lab-sm", "r");
lb("lb-sh1", [A.sh1.ground[0], A.sh1.ground[1] + 12], "EVMbench", "lab-cs lab-sm", "t");
lb("lb-aud", [A.aud.ground[0], A.aud.ground[1] + 12], "审计 AI", "lab-ink lab-sm", "t");
lb("lb-cms", [(A.cm0.ground[0] + A.cm1.ground[0]) / 2, Math.max(A.cm0.ground[1], A.cm1.ground[1]) + 10], "BSC 合约", "lab-ink lab-sm", "t");
lb("lb-cmbad", [A.cm1.top[0] + 90, A.cm1.top[1] + 60], "后来被真实利用", "lab-rs lab-sm", "l");
lb("lb-hg", [A.hg.ground[0], A.hg.ground[1] + 12], "利用窗口", "lab-ink lab-sm", "t");
lb("lb-fix", [A.hg.top[0] + 60, A.hg.top[1] + 40], "修复要更快", "lab-gs", "l");
lb("lb-simf", [S.SIMF[0] + 20, S.SIMF[1] + 8], "模拟器", "lab-cs", "t");
const DR = [dx0 + 440, dy0 + 100];
lb("lb-d405", DR, "405 个合约", "lab-cs lab-sm", "l");
lb("lb-d46", [DR[0] + 2, DR[1] + 2], "约 460 万美元 · 模拟环境", "lab-r lab-sm", "l");
lb("lb-bar", [DR[0] + 4, DR[1] + 4], "最佳检测率约 46%", "lab-cs lab-sm", "l");
lb("lb-box", [DR[0] + 6, DR[1] + 6], "22 起真实事件 · 端到端利用 0", "lab-g lab-sm", "l");
lb("lb-bb", [dx0 + 125, dy0 + 14], "基准", "lab-cs lab-sm");
lb("lb-br", [dx0 + 295, dy0 + 144], "真实系统", "lab-g lab-sm");
lb("lb-ov", up(A.ov.top, 6), "cbETH 价格", "lab-ink lab-sm");
lb("lb-dk", [A.dk.ground[0] - 40, A.dk.ground[1] + 30], "开发机", "lab-ink lab-sm", "t");
lb("lb-ai", A.dk.screen, "AI 写的代码", "lab-cs lab-sm", "c");
lb("lb-coau", [A.dk.screen[0] + 3, A.dk.screen[1]], "共同作者：AI 编程助手", "lab-g lab-sm", "c");
lb("lb-audsay", [A.dk.screen[0], A.dk.screen[1] + 40], "审计员公开指出", "lab-g lab-sm", "t");
lb("lb-ghost", [A.ovg.tip[0] - 50, A.ovg.tip[1]], "约 1.12 美元", "lab-rs lab-sm", "r");
lb("lb-bad", [at(L.D_BAD)[0] + 240, at(L.D_BAD)[1] + 45], "约 178 万美元坏账", "lab-r lab-sm", "l");
lb("lb-noai", [A.ov.ground[0] + 20, A.ov.ground[1] + 30], "项目方未归因于 AI · 人也会犯", "lab-g lab-sm", "t");
lb("lb-px", up(A.px.top, 70), "Solidity 扩展", "lab-rs lab-sm");
lb("lb-50", [A.px.ground[0], A.px.ground[1] + 16], "约 50 万美元", "lab-r lab-sm", "t");
lb("lb-lot", [A.lot.ground[0] - 40, A.lot.ground[1] + 60], "不存在的包名", "lab-g lab-sm", "t");
lb("lb-hall", [A.atk.top[0] + 40, A.atk.top[1] - 10], "幻觉包名", "lab-rs", "l");
lb("lb-desks", up(A.dw1.top, 10), "钱包工程师", "lab-ink lab-sm");
lb("lb-own", A.dw0.screen, "已控制", "lab-rs lab-sm", "c");
lb("lb-rk", [A.rk.ground[0], A.rk.ground[1] + 14], "内部 AI 工具", "lab-cs lab-sm", "t");
lb("lb-undis", A.rk.center, "未公开", "lab-g lab-sm", "c");
lb("lb-shd", up(A.shd.top, 6), "初筛", "lab-cs lab-sm");
const SL = [A.shd.center[0] - 110, A.shd.center[1] - 40];
["初筛", "测试草稿", "告警分诊"].forEach((t, i) => lb(`lb-d${i}`, [SL[0], SL[1] + i * 58], t, "lab-gs lab-sm", "r"));
lb("lb-eng", [A.eng.ground[0], A.eng.ground[1] + 12], "工程师", "lab-ink lab-sm", "t");
const EL = [A.eng.top[0] + 80, A.eng.top[1] + 20];
["业务逻辑", "能否利用", "对结论负责"].forEach((t, i) => lb(`lb-h${i}`, [EL[0], EL[1] + i * 58], t, "lab-cs lab-sm", "l"));

// ---------------------------------------------------------------- 屏幕层卡片
const CA = { x: 60, y: 300, w: 640 };
const cardA = codeCard("ca", { ...CA, head: "价格包装器", tag: gtag("示意"), mono: true, rows: [
  { html: "// cbETH 的美元价格" },
  { html: "rate  = cbETH / ETH 汇率" },
  { html: "price = rate", chip: "✗ 漏乘", chipCls: "x" },
  { html: "price = rate × ETH / USD", chip: "✓ 应为", chipCls: "ok" },
] });
S.curve("cva", [CA.x + CA.w + 4, codeRowY(CA.y, 2)], S.scr("oracleDL", A.ovg.tip), { color: "#e0453a" });
S.curve("cv1", S.scr("supplyD", A.dw0.screen), S.scr("supplyD", A.rk.top), { color: "#e0453a" });
S.curve("cv2", S.scr("supplyD", A.rk.top), S.scr("supplyD", A.dw1.screen), { color: "#e0453a" });
S.curve("cv3", S.scr("supplyD", A.rk.top), S.scr("supplyD", A.dw2.screen), { color: "#e0453a" });
const ET = ZONE.event.top, ST = ZONE.event.top + 76;
const SRC = "#6f6a60";
const html = cardA
  + evt("e1", "2025 年 12 月 · SCONE-bench", { top: ET }) + evt("s1", "Anthropic", { top: ST, color: SRC })
  + evt("s6", "公开研究与复评", { top: ST + 3, color: SRC })
  + evt("e11", "Moonwell · 2026 年 2 月 · Base", { top: ET + 3 }) + evt("s12", "The Block · rekt.news 报道", { top: ST + 6, color: SRC })
  + evt("e15", "2025 年 7 月 · 插件市场", { top: ET + 6 }) + evt("s15", "Kaspersky", { top: ST + 9, color: SRC })
  + evt("s16", "CSA 研究笔记", { top: ST + 12, color: SRC })
  + evt("e17", "Binance · 2026 年 10 月", { top: ET + 9 }) + evt("s17", "Binance 初步报告", { top: ST + 15, color: SRC });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {};
const t = (x) => f(x);

S.build({
  cam0: "kycC", sub: "AI 找漏洞更便宜，修复就要更快",
  grid: { u0: 7500, u1: 16900, v0: -4600, v1: 4500 }, box: [6500, -5030, 6950, 3010],   // 盖住本段镜头 kycC / benchD / oracleD / supplyD / defendD（含上一段终点 kycC）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "基准", d: "统一题目、用来比较能力的测试集", at: w("基准", 5) },
    { id: "t1", t: "端到端", d: "从发现漏洞到完成利用的全过程", at: w("端到端", 7) },
    { id: "t2", t: "坏账", d: "清算后仍收不回来的借款", at: w("坏账", 12) },
    { id: "t3", t: "分诊", d: "按轻重缓急给告警排序", at: w("分诊", 19) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 镜头右移到找漏洞
      cam(${t(LS[0])}, "benchD", 1.8); bump("#sgD0", ${t(LS[0] + 1.9)});
      pop("#lb-gm", ${t(LS[0] + 1.8)}); pop("#lb-aud", ${t(LS[0] + 1.9)}); pop("#lb-cms", ${t(LS[0] + 2.0)}); pop("#lb-hg", ${t(LS[0] + 2.1)});
      // ===== L1 SCONE-bench 插进阅卷机 + 405 点
      pop("#e1", ${t(LS[1] + 0.2)}); pop("#s1", ${t(LS[1] + 0.6)});
      grow("sh0", ${t(LS[1] + 1.4)}); pop("#lb-sh0", ${t(LS[1] + 1.8)});
      X14.card(tl, "gm", ${t(LS[1] + 2.4)}, true); X14.card(tl, "gm", ${t(LS[1] + 3.0)}, false); X14.lamp(tl, "gm", ${t(LS[1] + 3.5)}, "green");
      fadeIn("#d405", ${t(LS[1] + 4.6)}, 0.8); pop("#lb-d405", ${t(LS[1] + 5.2)}); flash("#d405", ${t(LS[1] + 7.0)}, 2, 0.5);
      out("#e1, #s1", ${t(LE[1])});
      // ===== L2 46 点红色点阵
      fadeIn("#d405r", ${t(LS[2] + 2.2)}, 0.6); flash("#d405r", ${t(LS[2] + 3.6)}, 2, 0.4); bump("#lb-d46", ${t(LS[2] + 8.4)});
      out("#d405, #d405r, #lb-d405", ${t(LS[2] + 5.0)}); fadeIn("#d46", ${t(LS[2] + 5.3)}, 0.6); pop("#lb-d46", ${t(LS[2] + 6.2)});
      // ===== L3 放大镜扫过两台 BSC 合约
      tl.to("#mag", { x: ${f(A.cm0.center[0] - A.mag.lens[0])}, y: ${f(A.cm0.center[1] - A.mag.lens[1])}, duration: 0.8, ease: "power2.inOut" }, ${t(LS[3] + 0.4)});
      fadeIn("#cmdot0", ${t(LS[3] + 1.3)}, 0.3);
      tl.to("#mag", { x: ${f(A.cm1.center[0] - A.mag.lens[0])}, y: ${f(A.cm1.center[1] - A.mag.lens[1])}, duration: 0.8, ease: "power2.inOut" }, ${t(LS[3] + 1.9)});
      fadeIn("#cmdot1", ${t(LS[3] + 2.8)}, 0.3);
      fadeIn("#cmbad", ${t(LS[3] + 4.6)}, 0.4); pop("#lb-cmbad", ${t(LS[3] + 5.0)});
      tl.to("#mag", { x: 0, y: 0, duration: 0.8, ease: "power2.inOut" }, ${t(LS[3] + 5.8)});
      // ===== L4 模拟器外框
      fadeIn("#simf", ${t(LS[4] + 0.2)}, 0.5); pop("#lb-simf", ${t(LS[4] + 0.6)});
      // ===== L5 EVMbench 插入
      out("#simf, #lb-simf, #d46, #lb-d46, #cmbad, #lb-cmbad", ${t(LS[5])});
      grow("sh1", ${t(LS[5] + 0.3)}); pop("#lb-sh1", ${t(LS[5] + 0.6)});
      X14.card(tl, "gm", ${t(LS[5] + 1.0)}, true); X14.card(tl, "gm", ${t(LS[5] + 1.6)}, false);
      // ===== L6 100 点横条 46 / 54
      pop("#s6", ${t(LS[6] + 0.3)}); fadeIn("#bar100", ${t(LS[6] + 0.8)}, 0.6); pop("#lb-bar", ${t(LS[6] + 2.6)});
      // ===== L7 22 起真实事件，全部打叉
      out("#bar100, #lb-bar, #s6", ${t(LS[7])}); fadeIn("#box22", ${t(LS[7] + 0.2)}, 0.5); fadeIn("#box22x", ${t(LS[7] + 2.6)}, 0.4); pop("#lb-box", ${t(LS[7] + 3.0)});
      // ===== L8 基准高、真实系统低
      out("#box22, #box22x, #lb-box", ${t(LS[8])}); X14.lamp(tl, "gm", ${t(LS[8] + 0.2)}, "off");
      fadeIn("#bars2", ${t(LS[8] + 0.5)}, 0.5); pop("#lb-bb", ${t(LS[8] + 1.0)}); pop("#lb-br", ${t(LS[8] + 3.4)});
      // ===== L9 利用窗口缩小、沙流变快
      tl.to("#hg-wrap", { scale: 0.8, svgOrigin: "${f(at(L.D_HOUR)[0])} ${f(at(L.D_HOUR)[1])}", duration: 0.5, ease: "power2.inOut" }, ${t(LS[9] + 0.3)});
      KIT.sand(tl, "hg", ${t(LS[9] + 0.6)}, 1.4); pop("#lb-fix", ${t(LS[9] + 2.4)});
      // ===== L10 写代码：镜头移到报价机
      out("#lb-gm, #lb-aud, #lb-cms, #lb-hg, #lb-fix, #lb-sh0, #lb-sh1, #lb-bb, #lb-br, #bars2", ${t(LS[10] - 0.2)});
      cam(${t(LS[10])}, "oracleDL", 1.4); bump("#sgD1", ${t(LS[10] + 1.5)});
      pop("#lb-ov", ${t(LS[10] + 1.3)}); pop("#lb-dk", ${t(LS[10] + 1.4)}); pop("#lb-ai", ${t(LS[10] + 1.6)});
      // ===== L11 代码卡 A
      pop("#e11", ${t(LS[11] + 0.3)}); pop("#ca", ${t(LS[11] + 1.0)});
      pop("#ca-c2", ${t(LS[11] + 6.2)}); hot("#ca-r2", ${t(LS[11] + 6.2)}); pop("#ca-c3", ${t(LS[11] + 8.0)});
      // ===== L12 关键画面：幽灵指针掉到约 1.12 美元 + 坏账点阵
      pop("#s12", ${t(LS[12] + 0.3)}); X4.ghostOn(tl, "ov", ${t(LS[12] + 0.4)}, true); X4.ghostWobble(tl, "ov", ${t(LS[12] + 0.5)}, 1.2, -62);
      draw("cva", ${t(LS[12] + 1.0)}); pop("#lb-ghost", ${t(LS[12] + 1.6)});
      fadeIn("#dbad", ${t(LS[12] + 4.4)}, 0.6); pop("#lb-bad", ${t(LS[12] + 5.2)});
      // ===== L13 共同作者：AI 编程助手
      out("#ca, #cva, #e11, #lb-ai", ${t(LS[13])}); pop("#lb-coau", ${t(LS[13] + 1.2)}); pop("#lb-audsay", ${t(LS[13] + 2.2)});
      // ===== L14 项目方未归因于 AI
      out("#lb-audsay", ${t(LS[14] + 0.2)}); pop("#lb-noai", ${t(LS[14] + 0.6)});
      // ===== L15 供应链：假 Solidity 扩展落下
      out("#lb-ov, #lb-dk, #lb-coau, #lb-audsay, #lb-noai, #lb-ghost, #lb-bad, #s12", ${t(LS[15] - 0.2)});
      cam(${t(LS[15])}, "supplyD", 1.4); pop("#e15", ${t(LS[15] + 0.3)}); pop("#s15", ${t(LS[15] + 0.7)});
      tl.set("#px", { opacity: 0, y: -140 }, 0); tl.to("#px", { opacity: 1, duration: 0.2 }, ${t(LS[15] + 1.5)});
      tl.to("#px", { y: 0, duration: 0.7, ease: "bounce.out" }, ${t(LS[15] + 1.5)});
      X7.parcelLabel(tl, "px", ${t(LS[15] + 2.2)}, "red"); pop("#lb-px", ${t(LS[15] + 2.3)}); flash("#lb-px", ${t(LS[15] + 3.8)}, 2); pop("#lb-50", ${t(LS[15] + 6.0)});
      // ===== L16 幻觉包名：攻击者在荒地插牌抢注
      out("#e15, #s15", ${t(LS[16])}); pop("#s16", ${t(LS[16] + 0.4)}); pop("#lb-lot", ${t(LS[16] + 0.6)});
      grow("atk", ${t(LS[16] + 2.0)}); grow("sq", ${t(LS[16] + 2.8)}); pop("#lb-hall", ${t(LS[16] + 4.6)});
      // ===== L17 内部 AI 工具 → 另外两台电脑
      out("#s16", ${t(LS[17])}); pop("#e17", ${t(LS[17] + 0.3)}); pop("#s17", ${t(LS[17] + 0.7)});
      pop("#lb-desks", ${t(LS[17] + 1.0)}); pop("#lb-rk", ${t(LS[17] + 1.4)}); pop("#lb-own", ${t(LS[17] + 3.0)});
      draw("cv1", ${t(LS[17] + 4.4)}); draw("cv2", ${t(LS[17] + 5.4)}); draw("cv3", ${t(LS[17] + 5.6)});
      // ===== L18 未公开
      pop("#lb-undis", ${t(LS[18] + 0.6)});
      // ===== L19 防御角：AI 初筛、测试草稿、告警分诊
      out("#lb-px, #lb-50, #lb-lot, #lb-hall, #lb-desks, #lb-rk, #lb-own, #lb-undis, #cv1, #cv2, #cv3, #e17, #s17", ${t(LS[19] - 0.2)});
      cam(${t(LS[19])}, "defendD", 1.4); pop("#lb-shd", ${t(LS[19] + 1.4)});
      pop("#lb-d0", ${t(LS[19] + 2.0)}); pop("#lb-d1", ${t(LS[19] + 3.0)}); pop("#lb-d2", ${t(LS[19] + 4.0)});
      // ===== L20 要靠人
      pop("#lb-eng", ${t(LS[20] + 0.3)});
      pop("#lb-h0", ${t(LS[20] + 1.0)}); pop("#lb-h1", ${t(LS[20] + 2.6)}); pop("#lb-h2", ${t(LS[20] + 4.4)});
`,
});
