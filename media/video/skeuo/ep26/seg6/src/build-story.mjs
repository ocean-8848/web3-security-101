// ep26/seg6「⑥ 放在模型外」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.defendD（BRIEF）。
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
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E8 from "../../../ep08/kit-ext/objects-ext.mjs";
import * as E14 from "../../../ep14/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.wide（全集最后一段，结束卡）

// 段内位置（layout.mjs 之外）：L7 另一台机器人、L11 用户自己的主钱包
const ez = (X, Y) => ({ u: Math.round(16900 + 0.8192 * X - 1.1472 * Y), v: Math.round(0.5736 * X + 1.6383 * Y) });
const E_OBOT = { ...ez(-480, 40), scale: 0.8 };
const E_UMAIN = { ...ez(1120, -560), scale: 0.5 };
const E_TRUST0 = ez(-1120, 110);                                   // L9 带"不可信"标记的信封起点
const EPIPE = { u: 16400, v: -665 };                               // 闸口资金管：智能体 → 三道关卡 → 低额钱包
// 段内镜头：gateE 右移，左侧留出代码卡 B 的位置；answerE 加进智能体（L13–L15 机器人在边界框外）
const CAMS = {
  ...L.CAMS,
  gateE2: L.fit([...L.R.gate, ...L.R.guard, L.rect(E_OBOT, "liqBot")], [680, 280, 1820, 860], 1.4),
  answerE2: L.fit([...L.R.answer, L.rect(L.E_AGENT, "liqBot")], [100, 280, 1820, 860], 1.4),
};
const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E3, E5, E7, E8, E14, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
const P = (q) => q.map((p) => `${f(p[0])},${f(p[1])}`).join(" ");
/** 不支持 scale 的物件：绕地面点包一层缩放，并换算 anchors 里的点 */
function W(key, o, r, k, dy = 0, opts = {}) {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, r, dy, { ...opts, wrap: (svg) => `<g transform="translate(${f(gx)},${f(gy)}) scale(${k}) translate(${f(-gx)},${f(-gy)})">${svg}</g>` });
  for (const [n, v] of Object.entries(A[key] || {})) if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number") A[key][n] = sc(v);
}
const plate = (key, o, text) => put(key, o, E1.signBoard(o, { id: key, text, style: "plate", size: 32 }));

// 石板路 + 贯穿全街的资金管
{ const R0 = L.ROAD; add({ u: R0.u0, v: -4000 }, `<polygon points="${P([Wp(R0.u0, R0.v0), Wp(R0.u1, R0.v0), Wp(R0.u1, R0.v1), Wp(R0.u0, R0.v1)])}" fill="#dcd7cd" stroke="#cbc4b6" stroke-width="2"/>`, -20000); }
put("pipe", L.PIPE.o, E1.pipe(L.PIPE.o, { id: "pipe", pts: L.PIPE.pts, r: 8 }), -20000);

// A · 奖池金库（全景背景）
put("a-safe", L.A_SAFE, O.safe(L.A_SAFE, { id: "a-safe", gold: true, plate: "奖池" }));
put("a-frey", L.A_FREYSA, E8.liqBot(L.A_FREYSA, { id: "a-frey", scale: 1.4, scr: "绝不转账" }));
put("a-player", L.A_PLAYER, O.person(L.A_PLAYER, { id: "a-player", role: "attacker", scale: 0.55 }));
put("a-prompt", L.A_PROMPT, O.doc(L.A_PROMPT, { id: "a-prompt", w: 150, h: 190, standing: true, title: "提示词", lines: ["绝不转账"] }));
W("a-cm", L.A_CM, E3.contractMachine(L.A_CM, { id: "a-cm", name: "合约" }), 0.55);
put("a-aide", L.A_AIDE, E8.liqBot(L.A_AIDE, { id: "a-aide", scale: 1.1, scr: "新助理" }));
put("a-any", L.A_ANYONE, O.person(L.A_ANYONE, { id: "a-any", role: "signer", scale: 0.5 }));
["AI 是目标", "攻击人", "攻击代码", "开发工具", "防御工具"].forEach((tx, i) => plate(`a-x${i}`, L.A_CROSS[i], tx));
plate("a-sign", L.A_SIGN, "奖池金库");
// B · 智能体车间
put("b-agent", L.B_AGENT, E8.liqBot(L.B_AGENT, { id: "b-agent", scale: 1.4, scr: "transfer" }));
W("b-hotw", L.B_HOTW, O.hotWallet(L.B_HOTW, { id: "b-hotw" }), 0.7);
W("b-chain", L.B_CHAIN, O.chain(L.B_CHAIN, { id: "b-chain", n: 3, title: "链上" }), 0.6);
W("b-phone", L.B_PHONE, O.phone(L.B_PHONE, { id: "b-phone" }), 0.7);
W("b-brw", L.B_BROWSER, O.browserWin(L.B_BROWSER, { id: "b-brw", title: "网页" }), 0.45);
W("b-cab", L.B_CABINET, E3.slotCabinet(L.B_CABINET, { id: "b-cab", title: "长期记忆" }), 0.6);
W("b-panel", L.B_PANEL, E5.funcPanel(L.B_PANEL, { id: "b-panel", title: "运维面板" }), 0.6);
put("b-atk", L.B_ATK, O.person(L.B_ATK, { id: "b-atk", role: "attacker", scale: 0.5 }));
plate("b-sign", L.B_SIGN, "智能体车间");
// C · 会议室与开户台
W("c-lap", L.C_LAPTOP, O.laptop(L.C_LAPTOP, { id: "c-lap" }), 0.8);
put("c-emp", L.C_EMPLOYEE, O.person(L.C_EMPLOYEE, { id: "c-emp", role: "signer", scale: 0.5 }));
W("c-phone", L.C_PHONE, O.phone(L.C_PHONE, { id: "c-phone" }), 0.7);
put("c-mask", L.C_MASK, X.faceMask(L.C_MASK, { id: "c-mask", scale: 0.8 }));
L.C_SCAM.forEach((q, i) => put(`c-scam${i}`, q, O.person(q, { id: `c-scam${i}`, role: "attacker", scale: 0.45 })));
put("c-vic", L.C_VICTIM, O.person(L.C_VICTIM, { id: "c-vic", role: "signer", scale: 0.45 }));
put("c-code", L.C_CODE, O.doc(L.C_CODE, { id: "c-code", w: 90, h: 110, title: "暗语" }));
L.C_FAMILY.forEach((q, i) => put(`c-fam${i}`, q, O.person(q, { id: `c-fam${i}`, role: "signer", scale: 0.45 })));
W("c-conf", L.C_CONFIRM, O.phone(L.C_CONFIRM, { id: "c-conf" }), 0.7);
plate("c-sign0", L.C_SIGN[0], "会议室"); plate("c-sign1", L.C_SIGN[1], "开户台");
// D · 代码工坊（seg5 终点 defendD = 本段首帧）
put("d-grader", L.D_GRADER, E14.gradingMachine(L.D_GRADER, { id: "d-grader", scale: 0.7 }));
L.D_SHEETS.forEach((q, i) => put(`d-sheet${i}`, q, E14.answerSheet(q, { id: `d-sheet${i}`, scale: 0.7, title: ["SCONE-bench", "EVMbench"][i] })));
put("d-audit", L.D_AUDIT, E8.liqBot(L.D_AUDIT, { id: "d-audit", scale: 1.1, scr: "审计" }));
put("d-mag", L.D_MAG, O.magnifier(L.D_MAG, { id: "d-mag" }));
L.D_CMS.forEach((q, i) => W(`d-cm${i}`, q, E3.contractMachine(q, { id: `d-cm${i}`, name: "BSC" }), 0.45));
W("d-hour", L.D_HOUR, O.hourglass(L.D_HOUR, { id: "d-hour" }), 0.7);
W("d-desk", L.D_DESK, O.desk(L.D_DESK, { id: "d-desk" }), 0.65);
put("d-dev", L.D_DEV, O.person(L.D_DEV, { id: "d-dev", role: "engineer", scale: 0.5 }));
put("d-orc", L.D_ORACLE, E1.miniVend(L.D_ORACLE, { id: "d-orc", kind: "oracle", scale: 0.8 }));
put("d-extp", L.D_EXTP, E7.parcel(L.D_EXTP, { id: "d-extp", scale: 0.8, state: "attacker" }));
put("d-lot", L.D_LOT, E7.emptyLot(L.D_LOT, { id: "d-lot", scale: 0.6 }));
put("d-squat", L.D_SQUAT, E1.signBoard(L.D_SQUAT, { id: "d-squat", text: "抢注", style: "wood", size: 32 }));
put("d-atk", L.D_ATK, O.person(L.D_ATK, { id: "d-atk", role: "attacker", scale: 0.45 }));
L.D_DESKS.forEach((q, i) => W(`d-desks${i}`, q, O.desk(q, { id: `d-desks${i}` }), 0.55));
W("d-rack", L.D_RACK, O.rack(L.D_RACK, { id: "d-rack" }), 0.55);
W("d-shield", L.D_SHIELD, O.shield(L.D_SHIELD, { id: "d-shield" }), 0.7);
put("d-eng", L.D_ENG, O.person(L.D_ENG, { id: "d-eng", role: "engineer", scale: 0.5 }));
plate("d-sign0", L.D_SIGN[0], "找漏洞"); plate("d-sign1", L.D_SIGN[1], "写代码");

// E · 控制闸口与用户角（本段主场）
put("epipe", EPIPE, E1.pipe(EPIPE, { id: "epipe", pts: [[0, 0, 4], [1400, 0, 4]], r: 8 }), -300);
put("agent", L.E_AGENT, E8.liqBot(L.E_AGENT, { id: "agent", scale: 1.3, scr: "待命" }));
W("fw", L.E_FW, E1.firewall(L.E_FW, { id: "fw", len: 140 }), 0.6, 0, { grow: true });
L.E_CHECKS.forEach((q, i) => W(`chk${i}`, q, O.checkpoint(q, { id: `chk${i}`, n: ["①", "②", "③"][i], armUp: true, road: false }), 0.5));
W("hotw", L.E_HOTW, O.hotWallet(L.E_HOTW, { id: "hotw" }), 0.6);
W("esafe", L.E_SAFE, O.safe(L.E_SAFE, { id: "esafe", gold: true }), 0.8);
W("meter", L.E_METER, E5.thresholdMeter(L.E_METER, { id: "meter", max: 5, th: 4, level: 0, thText: "上限" }), 0.6);
put("hww", L.E_HWW, O.hwWallet(L.E_HWW, { id: "hww" }));
put("appr", L.E_APPROVER, O.person(L.E_APPROVER, { id: "appr", role: "engineer", scale: 0.5 }));
W("ecab", L.E_CABINET, E3.slotCabinet(L.E_CABINET, { id: "ecab", n: 4, title: "记忆" }), 0.45);
W("echain", L.E_CHAIN, O.chain(L.E_CHAIN, { id: "echain", n: 3, title: "链上" }), 0.5);
W("epanel", L.E_PANEL, E5.funcPanel(L.E_PANEL, { id: "epanel", title: "运维面板" }), 0.5);
W("lock", L.E_LOCK, O.padlock(L.E_LOCK, { id: "lock" }), 0.5, 0, { grow: true });
W("ecm", L.E_CM, E3.contractMachine(L.E_CM, { id: "ecm", name: "合约限额" }), 0.55);
put("eprompt", L.E_PROMPT, O.doc(L.E_PROMPT, { id: "eprompt", w: 110, h: 140, standing: true, title: "提示词", lines: ["绝不转账"] }));
put("you", L.E_YOU, O.person(L.E_YOU, { id: "you", role: "signer", scale: 0.55 }));
{ const [gx, gy] = at(L.E_USAFE), k = 0.6, r = O.safe(L.E_USAFE, { id: "usafe-s", variant: "hot" });
  add(L.E_USAFE, `<g id="usafe-mv"><g transform="translate(${f(gx)},${f(gy)}) scale(${k}) translate(${f(-gx)},${f(-gy)})">${r.svg}</g></g>`);
  A.usafe = { top: [gx, gy - 250 * k], ground: [gx, gy] }; }
W("umain", E_UMAIN, O.safe(E_UMAIN, { id: "umain", gold: true }), 0.5);
put("ubot", L.E_UBOT, E8.liqBot(L.E_UBOT, { id: "ubot", scale: 0.9, scr: "AI" }));
put("obot", E_OBOT, E8.liqBot(E_OBOT, { id: "obot", scale: 0.8, scr: "输出" }), 0, { grow: true });
plate("e-sign0", L.E_SIGN[0], "控制闸口"); plate("e-sign1", L.E_SIGN[1], "用户角");

// 信封（隐藏，fadeIn 后 X1.walk）
const LT = (key, o, st, dy = 40) => add(o, S.hid(`${key}-h`, E1.letter(o, { id: key, w: 60, h: 40, state: st }).svg), dy);
const P0 = at(EPIPE, 120, 0), PCHK = L.E_CHECKS.map((q) => at({ u: q.u, v: EPIPE.v }));
LT("ltr-unk", { u: EPIPE.u + 120, v: EPIPE.v }, "attacker");
LT("ltr-in", E_OBOT, "normal");
LT("ltr-trust", E_TRUST0, "normal");
LT("ltr-req", L.E_LETTER, "normal");

// 原生 SVG：主资产与管道之间断开的灰线、余额读数线、提示词划线、安全边界
{ const p1 = at({ u: 17800, v: EPIPE.v }), p2 = A.esafe.ground, m = (a) => [p1[0] + (p2[0] - p1[0]) * a, p1[1] + (p2[1] - p1[1]) * a];
  add(L.E_SAFE, S.hid("cut", `<g stroke="#9a9488" stroke-width="5" stroke-dasharray="12 9" fill="none"><polyline points="${P([p1, m(0.38)])}"/><polyline points="${P([m(0.62), p2])}"/></g>`), 200); }
add(L.E_CHAIN, S.hid("rd-line", `<polyline points="${P([A.echain.top, A.agent.center])}" fill="none" stroke="#2aa3c9" stroke-width="5" stroke-dasharray="10 8"/>`), 300);
{ const c = A.eprompt.center; add(L.E_PROMPT, S.hid("strike", `<g stroke="#e0453a" stroke-width="7" stroke-dasharray="14 8" stroke-linecap="round"><line x1="${f(c[0] - 55)}" y1="${f(c[1] - 60)}" x2="${f(c[0] + 55)}" y2="${f(c[1] + 45)}"/><line x1="${f(c[0] + 55)}" y1="${f(c[1] - 60)}" x2="${f(c[0] - 55)}" y2="${f(c[1] + 45)}"/></g>`), 400); }
function hull(pts) {
  pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], hi = [];
  for (const p of pts) { while (lo.length > 1 && cr(lo.at(-2), lo.at(-1), p) <= 0) lo.pop(); lo.push(p); }
  for (const p of pts.reverse()) { while (hi.length > 1 && cr(hi.at(-2), hi.at(-1), p) <= 0) hi.pop(); hi.push(p); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}
const box4 = (r, pd) => [[r[0] - pd, r[1] - pd], [r[2] + pd, r[1] - pd], [r[2] + pd, r[3] + pd], [r[0] - pd, r[3] + pd]];
const HCHK = hull(L.E_CHECKS.flatMap((q) => box4(L.rect(q, "checkpoint"), 18)));
const RCM = L.rect(L.E_CM, "contractMachine");
add(L.E_CM, S.hid("bound", `<g fill="rgba(31,157,85,0.06)" stroke="#1f9d55" stroke-width="7" stroke-linejoin="round"><polygon points="${P(HCHK)}"/><rect x="${f(RCM[0] - 22)}" y="${f(RCM[1] - 22)}" width="${f(RCM[2] - RCM[0] + 44)}" height="${f(RCM[3] - RCM[1] + 44)}" rx="18"/></g>`), 3000);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-agent", up(A.agent.top, 10), "智能体 · 加固后", "lab-cs lab-sm");
lb("lb-model", up(A.agent.top, 70), `模型里的规则 <span id="x-model" style="display:inline-block;color:#e0453a;font-weight:900;opacity:0">✕</span>`, "lab-g lab-sm");
lb("lb-code", up(A.chk1.top, 30), "钱包层 · 代码限制", "lab-cs lab-sm");
["额度", "白名单", "人工确认"].forEach((tx, i) => lb(`lb-chk${i}`, up(A[`chk${i}`].top, 6), tx, "lab-ink lab-sm"));
lb("lb-meter", up(A.meter.top, 6), "单日额度", "lab-cs lab-sm");
lb("x-unk", up(PCHK[1], 70), "✕ 未知地址", "lab-rs lab-sm");
lb("lb-hotw", [A.hotw.ground[0] + 10, A.hotw.ground[1] + 8], "独立低额钱包", "lab-gs lab-sm", "t");
lb("lb-esafe", up(A.esafe.top, 6), "主资产 · 不交给它", "lab-ink lab-sm");
lb("lb-hww", up(A.hww.top, 30), "解码后的交易", "lab-cs lab-sm");
lb("lb-appr", up(A.appr.top, 6), "审批人", "lab-g lab-sm", "l");
lb("lb-fw", up(A.fw.top, 6), "输入隔离", "lab-cs lab-sm");
lb("lb-obot", up(A.obot.top, 6), "另一个模型", "lab-g lab-sm");
lb("x-in", up(A.fw.gateFront, 60), "✕", "lab-rs lab-sm", "c");
lb("lb-cab", up(A.ecab.top, 6), "记忆 · 校验来源 ✓", "lab-gs lab-sm");
lb("lb-chain", up(A.echain.top, 6), "读取余额", "lab-cs lab-sm");
lb("lb-panel", up(A.lock.top, 6), "运维面板 · 加固", "lab-gs lab-sm", "l");
lb("lb-trust", up(at(E_TRUST0), 70), "不可信", "lab-g lab-sm");
lb("lb-trust2", up(A.agent.top, 70), "标记 ≠ 拦截", "lab-r lab-sm");
lb("lb-you", up(A.you.top, 6), "你", "lab-ink lab-sm");
lb("lb-usafe", up([A.usafe.top[0] + 70, A.usafe.top[1] + 150], 6), "独立钱包 · 少量资金", "lab-gs lab-sm");
lb("lb-umain", up(A.umain.top, 6), "主钱包 · 留在身后", "lab-ink lab-sm");
lb("lb-ubot", up(A.ubot.top, 6), "AI 机器人", "lab-cs lab-sm");
lb("lb-ecm", up(A.ecm.top, 6), "合约限额", "lab-ink lab-sm");
lb("lb-prompt", up(A.eprompt.top, 6), "会被说服绕过", "lab-r lab-sm");
lb("lb-agentred", up(A.agent.top, 10), "转账 = 收款", "lab-rs lab-sm");
lb("x-req", up(A.ecm.slot, 40), "✕ 合约拒绝", "lab-rs lab-sm");
lb("lb-req", up(at(L.E_LETTER), 70), "转账请求", "lab-g lab-sm");
lb("lb-bound", up(A.chk2.top, 70), `安全边界${gtag("解读")}`, "lab-gs");

// ---------------------------------------------------------------- 屏幕层卡片
const C = { x: 60, y: 300, w: 590 };
const card = codeCard("cb", { ...C, head: "钱包工具里的限额", tag: "示意", rows: [
  { html: "单笔上限 · 写在合约里" }, { html: "单日上限 · 写在合约里" }, { html: "收款地址 · 必须在白名单" }, { html: "新地址/授权/大额 → 人工确认" }] });
const sc2 = (p) => S.scr("gateE2", p);
S.curve("cv-m", [C.x + C.w + 4, codeRowY(C.y, 1)], sc2(A.meter.center ?? A.meter.top), { color: "#e0453a" });
S.curve("cv-w", [C.x + C.w + 4, codeRowY(C.y, 2)], sc2(A.chk1.plate ?? A.chk1.top), { color: "#e0453a" });
S.curve("cv-h", [C.x + C.w + 4, codeRowY(C.y, 3)], sc2(A.hww.screen ?? A.hww.top), { color: "#e0453a" });
const html = card
  + kw("kw-ai", "<b>AI</b> 生成的代码", { x: 80, y: 300, size: 40 })
  + ck("ck0", "审查", { x: 80, y: 400, w: 300 }) + ck("ck1", "测试", { x: 80, y: 480, w: 300 }) + ck("ck2", "审计", { x: 80, y: 560, w: 300 })
  + kw("kw-q", "规则写在哪里，才挡得住<b>说服</b>？", { x: 470, y: 150, size: 48, accent: "#1d93ba" });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  quota: w("额度", 3), white: w("白名单", 4), iso: w("权限隔离", 5), human: w("人工确认", 6), dec: w("解码", 6),
  inIso: w("输入隔离", 7), mem: w("记忆", 8), chain: w("链上", 8), panel: w("运维面板", 8),
  mark: w("不可信", 9), enough: w("不够", 9), review: w("审查", 10), test: w("测试", 10), audit: w("审计", 10),
  mainW: w("主钱包", 11), indep: w("独立钱包", 11), prompt: w("提示词", 13), bypass: w("绕过", 13), refuse: w("拒绝", 14), bound: w("安全边界", 15),
};
const t = (x) => f(x);
const walk = (id, t0, dur, pts) => `X1.walk(tl, "${id}", ${f(t0)}, ${f(dur)}, ${JSON.stringify(pts.map((p) => [Math.round(p[0]), Math.round(p[1])]))});`;

S.build({
  cam0: "defendD", sub: "规则写进代码，模型说什么都没用",
  grid: { u0: -4700, u1: 22600, v0: -13900, v1: 14100 }, box: [-1890, -7790, 18500, 10490],   // 盖住本段镜头 defendD / gateE / userE / answerE / wide（含上一段终点 defendD）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "白名单", d: "只允许事先列出的对象通过", at: w("白名单", 4) },
    { id: "t1", t: "解码", d: "把交易数据翻译成人能读的内容", at: w("解码", 6) },
  ],
  end: { title: "AI 与 Web3 安全", line: "能挡住说服的，是模型之外的代码", next: "审计、测试与开发流程", at: LS[16] + 0.6, nextAt: w("下一集", 16) },
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 回到持有钱包的智能体：右移到闸口（段内 gateE2 = gateE 右移，左侧留给代码卡）
      cam(${t(LS[0] + 0.1)}, "gateE2", 1.8); X8.botLamp(tl, "agent", ${t(LS[0] + 1.6)}, 1.4, 2, true); pop("#lb-agent", ${t(LS[0] + 1.8)}, 0.25);
      // ===== L1 防线不能放在模型里：头顶灰色"模型"框 + 红叉
      out("#lb-agent", ${t(LS[1] - 0.1)}, 0.2); pop("#lb-model", ${t(LS[1] + 0.3)}, 0.25); pop("#x-model", ${t(w("不能放", 1))}, 0.25); bump("#x-model", ${t(w("不可靠", 1))}, 1.2, 1);
      // ===== L2 钱包层用代码限制：三道关卡依次落下道闸
      out("#lb-model, #x-model", ${t(LS[2] - 0.2)}, 0.2); pop("#lb-code", ${t(LS[2] + 0.2)}, 0.25);
      [0, 1, 2].forEach((i) => KIT.arm(tl, "chk" + i, ${t(w("代码", 2))} + i * 0.45, false, 0.5));
      // ===== L3 额度：代码卡 B，额度表刻度亮起
      out("#lb-code", ${t(LS[3] - 0.2)}, 0.2); pop("#cb", ${t(TM.quota)}, 0.3); pop("#lb-chk0", ${t(TM.quota + 0.2)}, 0.25);
      hot("#cb-r0", ${t(w("单笔", 3))}); hot("#cb-r1", ${t(w("单日", 3))}); draw("cv-m", ${t(w("单日", 3) + 0.2)}, 0.6);
      X5.fill(tl, "meter", ${t(w("单日", 3) + 0.4)}, 3, 1.2); pop("#lb-meter", ${t(w("单日", 3) + 0.4)}, 0.25); flash("#lb-chk0", ${t(w("超额", 3))}, 2);
      // ===== L4 白名单：未知地址的信封过了第一道，在第二道前停下
      out("#cv-m", ${t(LS[4] - 0.2)}, 0.2); tl.to("#cb-r0, #cb-r1", { backgroundColor: "rgba(0,0,0,0)", duration: 0.2 }, ${t(LS[4] - 0.2)});
      pop("#lb-chk1", ${t(TM.white)}, 0.25); hot("#cb-r2", ${t(TM.white + 0.2)}); draw("cv-w", ${t(TM.white + 0.4)}, 0.6);
      fadeIn("#ltr-unk-h", ${t(w("预设", 4))}, 0.25); KIT.arm(tl, "chk0", ${t(w("预设", 4) + 0.3)}, true, 0.4);
      ${walk("ltr-unk", w("预设", 4) + 0.4, 1.6, [PCHK[1].map((v, j) => v + (j ? 0 : -60))])}
      KIT.arm(tl, "chk0", ${t(w("预设", 4) + 1.9)}, false, 0.4); pop("#x-unk", ${t(w("预设", 4) + 2.1)}, 0.25);
      // ===== L5 权限隔离：低额钱包亮绿，主资产与管道断开
      out("#cv-w, #x-unk, #ltr-unk-h", ${t(LS[5] - 0.2)}, 0.2); tl.to("#cb-r2", { backgroundColor: "rgba(0,0,0,0)", duration: 0.2 }, ${t(LS[5] - 0.2)});
      pop("#lb-hotw", ${t(w("低额度钱包", 5))}, 0.25); bump("#hotw", ${t(w("低额度钱包", 5))}, 1.08, 1);
      fadeIn("#cut", ${t(w("主资产", 5))}, 0.4); pop("#lb-esafe", ${t(w("主资产", 5) + 0.2)}, 0.25);
      // ===== L6 人工确认：第三道关卡 + 审批人手里的设备显示解码后的交易
      pop("#lb-chk2", ${t(TM.human)}, 0.25); hot("#cb-r3", ${t(TM.human + 0.2)}); draw("cv-h", ${t(TM.human + 0.4)}, 0.6);
      pop("#lb-appr", ${t(w("人工审批", 6))}, 0.25); pop("#lb-hww", ${t(TM.dec)}, 0.25); bump("#hww", ${t(TM.dec + 0.2)}, 1.12, 1);
      // ===== L7 输入隔离：墙立起，另一台机器人的信封被翼闸挡住
      out("#cb, #cv-h, #lb-hotw, #lb-esafe, #lb-appr, #lb-hww", ${t(LS[7] - 0.2)}, 0.2);
      grow("fw", ${t(TM.inIso)}, 0.6); pop("#lb-fw", ${t(TM.inIso + 0.4)}, 0.25); grow("obot", ${t(w("模型的输出", 7))}, 0.5); pop("#lb-obot", ${t(w("模型的输出", 7) + 0.3)}, 0.25);
      fadeIn("#ltr-in-h", ${t(w("不能直接", 7) - 0.4)}, 0.25);
      ${walk("ltr-in", w("不能直接", 7) - 0.2, 1.0, [A.fw.gateFront])}
      KIT.led(tl, "fw-led", ${t(w("不能直接", 7) + 0.8)}, "#e0453a"); pop("#x-in", ${t(w("不能直接", 7) + 0.9)}, 0.25);
      // ===== L8 记忆校验、链上读余额、面板加固
      out("#ltr-in-h, #x-in, #lb-obot", ${t(LS[8] - 0.2)}, 0.2);
      pop("#lb-cab", ${t(TM.mem + 0.3)}, 0.25); fadeIn("#rd-line", ${t(TM.chain)}, 0.4); pop("#lb-chain", ${t(TM.chain + 0.2)}, 0.25);
      grow("lock", ${t(TM.panel)}, 0.5); pop("#lb-panel", ${t(TM.panel + 0.3)}, 0.25);
      // ===== L9 打上"不可信"标记：有用但不够，信封仍飘向智能体，小屏变红
      out("#lb-cab, #lb-chain, #lb-panel, #rd-line, #lb-fw", ${t(LS[9] - 0.2)}, 0.2);
      fadeIn("#ltr-trust-h", ${t(LS[9] + 0.3)}, 0.25); bump("#ltr-trust-h", ${t(LS[9] + 1.6)}, 1.15, 1); pop("#lb-trust", ${t(TM.mark)}, 0.25);
      out("#lb-trust", ${t(TM.enough - 0.1)}, 0.2);
      ${walk("ltr-trust", TM.enough, 1.2, [A.agent.claw ?? A.agent.center])}
      X8.botScr(tl, "agent", ${t(TM.enough + 1.2)}, "照做?", true); pop("#lb-trust2", ${t(TM.enough + 1.3)}, 0.25);
      // ===== L10 团队：AI 写的代码走审查、测试、审计（屏幕层左侧）
      out("#ltr-trust-h, #lb-trust2", ${t(LS[10] - 0.2)}, 0.2); X8.botScr(tl, "agent", ${t(LS[10])}, "待命", false);
      pop("#kw-ai", ${t(LS[10] + 0.4)}, 0.3); pop("#ck0", ${t(TM.review)}, 0.25); pop("#ck1", ${t(TM.test)}, 0.25); pop("#ck2", ${t(TM.audit)}, 0.25);
      // ===== L11 用户：主钱包留在身后，只把少量资金的独立钱包交给 AI 机器人
      out("#kw-ai, #ck0, #ck1, #ck2, #lb-meter", ${t(LS[11] - 0.2)}, 0.2);
      cam(${t(LS[11])}, "userE", 1.6); pop("#lb-you", ${t(LS[11] + 1.5)}, 0.25); pop("#lb-umain", ${t(TM.mainW)}, 0.25); bump("#umain", ${t(TM.mainW + 0.3)}, 1.06, 1);
      pop("#lb-ubot", ${t(w("机器人", 11))}, 0.25); X8.botLamp(tl, "ubot", ${t(w("机器人", 11) + 0.2)}, 1.2, 1, false); bump("#usafe-mv", ${t(TM.indep - 0.4)}, 1.06, 1);
      tl.to("#usafe-mv", { x: 70, y: 150, duration: 1.0, ease: "power2.inOut" }, ${t(TM.indep + 0.3)});
      pop("#lb-usafe", ${t(Math.min(TM.indep + 0.6, LS[12] - 0.9))}, 0.25);
      // ===== L12 回到开头的问题：合约限额 + 提示词 + 关卡，题卡回到画面
      out("#lb-you, #lb-ubot, #lb-umain, #lb-usafe", ${t(LS[12] - 0.2)}, 0.2);
      cam(${t(LS[12])}, "answerE2", 1.5); pop("#kw-q", ${t(LS[12] + 0.5)}, 0.3);
      pop("#lb-ecm", ${t(LS[12] + 1.3)}, 0.25); pop("#lb-req", ${t(LS[12] + 1.4)}, 0.25); fadeIn("#ltr-req-h", ${t(LS[12] + 1.4)}, 0.25);
      // ===== L13 提示词里的规则被说服绕过：文件划掉，机器人小屏变红
      bump("#eprompt", ${t(TM.prompt)}, 1.08, 1); fadeIn("#strike", ${t(TM.bypass - 0.2)}, 0.3); pop("#lb-prompt", ${t(TM.bypass)}, 0.25);
      X8.botScr(tl, "agent", ${t(TM.bypass + 0.2)}, "转账=收款", true);
      // ===== L14 关键画面：转账请求投进合约限额，投信口亮、被弹回，红叉；资金管不动
      out("#lb-req", ${t(LS[14])}, 0.2);
      ${walk("ltr-req", LS[14] + 0.3, 1.0, [A.ecm.slot])}
      X3.slot(tl, "ecm", ${t(LS[14] + 1.3)}, true); X3.spin(tl, "ecm", ${t(LS[14] + 1.3)}, 0.8, 0.25, "power2.out");
      ${walk("ltr-req", TM.refuse, 0.7, [at(L.E_LETTER)])}
      X3.slot(tl, "ecm", ${t(TM.refuse + 0.4)}, false); pop("#x-req", ${t(TM.refuse)}, 0.25); bump("#x-req", ${t(w("没用", 14))}, 1.15, 1);
      // ===== L15 安全边界放在模型之外：绿框住合约机器和三道关卡，机器人在框外
      out("#kw-q", ${t(LS[15] - 0.2)}, 0.25); fadeIn("#bound", ${t(TM.bound)}, 0.5); pop("#lb-bound", ${t(TM.bound + 0.3)}, 0.3);
      // ===== L16 下一集：拉到全景 + 结束卡
      out("#lb-bound, #x-req, #lb-prompt, #lb-ecm, #lb-chk0, #lb-chk1, #lb-chk2", ${t(LS[16] - 0.2)}, 0.2);
      cam(${t(LS[16])}, "wide", 1.6);
`,
});
