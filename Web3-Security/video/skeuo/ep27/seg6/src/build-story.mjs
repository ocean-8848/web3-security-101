// ep27/seg6「⑥ 写进流水线」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.methE（BRIEF）。
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
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E14 from "../../../ep14/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.world (= wide) + end card

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E3, E4, E5, E7, E14, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// wrap helper for objects without opts.scale (SEGBASE 常见坑 1)
const wput = (key, o, obj, k = o.scale ?? 1) => {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, obj, 0, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const v = A[key][n]; if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number") A[key][n] = sc(v); }
};
const sput = (key, o, fn, opts = {}) => put(key, o, fn(o, { id: key, scale: o.scale, ...opts }));
// belt (B → E) + version cards riding it
L.BELT.forEach((b, i) => put("belt" + i, b.o, E2.conveyor(b.o, { id: "belt" + i, len: b.len, width: L.BELT_W })));
[L.B_CARD, L.C_CARD, L.D_CARD, L.E_CARD].forEach((o, i) => sput("bcard" + i, o, E4.punchCard, { kind: "card", title: "版本", z: L.BELT_Z }));
// eight gates ①–⑧
const GATES = [...L.B_GATES, ...L.C_GATES, ...L.D_GATES, L.E_GATE];
GATES.forEach((o, i) => wput("g" + (i + 1), o, O.checkpoint(o, { id: "g" + (i + 1), n: "①②③④⑤⑥⑦⑧"[i], road: false }), 0.6));
// zone signs
[[L.A_SIGN, "事故展台"], [L.B_SIGN, "设计台"], [L.C_SIGN, "测试车间"], [L.D_SIGN, "审计与部署"], [L.E_SIGNS[0], "监控与应急"], [L.E_SIGNS[1], "核对台"]]
  .forEach(([o, text], i) => put("zs" + i, o, E1.signBoard(o, { id: "zs" + i, style: "plate", text })));
// A 事故展台 (wide only)
sput("aVend", L.A_VEND, E1.vending, { sign: "金库合约" });
sput("aCard1", L.A_CARD_AUDIT, E4.punchCard, { kind: "card", title: "审计版本" });
sput("aCard2", L.A_CARD_LIVE, E4.punchCard, { kind: "card", title: "上线版本" });
put("aRep", L.A_REPORT, O.doc(L.A_REPORT, { id: "aRep", title: "审计报告", stamp: true, w: 120, h: 150 }));
// B 设计台 (wide only)
sput("plane", L.B_PLANE, X.planeModel);
wput("bDesk", L.B_DESK, O.desk(L.B_DESK, { id: "bDesk" }));
put("bSpec", L.B_SPEC, O.doc(L.B_SPEC, { id: "bSpec", title: "规格", standing: true, w: 120, h: 150 }));
L.B_BEACONS.forEach((o, i) => put("bBcn" + i, o, O.beacon(o, { id: "bBcn" + i })));
// C 测试车间 (wide only)
sput("cGrader", L.C_GRADER, E14.gradingMachine);
wput("cLot", L.C_LOTTERY, E2.lottery(L.C_LOTTERY, { id: "cLot", plate: "随机输入" }));
sput("cBank", L.C_COUNTER, E4.tellerCounter);
put("cProof", L.C_PROOF, E2.proofCard(L.C_PROOF, { id: "cProof" }));
wput("cMath", L.C_MATHLIB, E3.contractMachine(L.C_MATHLIB, { id: "cMath", name: "数学库" }));
// D 审计与部署 (wide only)
wput("dIce", L.D_ICE, E5.iceShell(L.D_ICE, { id: "dIce" }));
L.D_AUDITORS.forEach((o, i) => sput("dAud" + i, o, O.person, { role: "engineer" }));
wput("dLap", L.D_LAPTOP, O.laptop(L.D_LAPTOP, { id: "dLap" }));
wput("dMsig", L.D_MSIG, O.safe(L.D_MSIG, { id: "dMsig" }));
L.D_CHAINS.forEach((o, i) => put("dCh" + i, o, E1.signBoard(o, { id: "dCh" + i, style: "plate", size: 28, text: ["BNB Chain", "TRON", "Mantle"][i] })));
// E 监控与应急
sput("eVend", L.E_VEND, E1.vending, { sign: "合约" });
wput("eRack", L.E_RACK, O.rack(L.E_RACK, { id: "eRack" }));
sput("eGauge", L.E_GAUGE, E3.gasGauge, { label: "TVL" });
put("eBcn", L.E_BEACON, O.beacon(L.E_BEACON, { id: "eBcn" }));
wput("eFlash", L.E_FLASH, E1.flashDesk(L.E_FLASH, { id: "eFlash" }));
wput("eAdmin", L.E_ADMIN, E5.funcPanel(L.E_ADMIN, { id: "eAdmin", title: "管理员函数" }));
wput("eQueue", L.E_QUEUE, E1.timeLock(L.E_QUEUE, { id: "eQueue" }));
sput("eOracle", L.E_ORACLE, E1.miniVend, { kind: "oracle" });
L.E_LEDGERS.forEach((o, i) => sput("eLed" + i, o, O.ledgerBook));
put("eBounty", L.E_BOUNTY, E1.signBoard(L.E_BOUNTY, { id: "eBounty", text: "漏洞赏金", size: 32 }));
sput("eWhite", L.E_WHITEHAT, O.person, { role: "engineer" });
sput("eGold", L.E_GOLD, E7.oddCoin);
sput("eDuty", L.E_DUTY, O.person, { role: "engineer" });
wput("ePause", L.E_PAUSE, O.knifeSwitch(L.E_PAUSE, { id: "ePause", on: true }));
L.E_DESKS.forEach((o, i) => wput("eDesk" + i, o, O.desk(o, { id: "eDesk" + i })));
L.E_CREW.forEach((o, i) => sput("eCrew" + i, o, O.person, { role: "engineer" }));
wput("eSafe", L.E_SAFE, O.safe(L.E_SAFE, { id: "eSafe" }));
wput("eFreeze", L.E_FREEZE, E5.iceShell(L.E_FREEZE, { id: "eFreeze" }));
put("eNotice", L.E_NOTICE, O.doc(L.E_NOTICE, { id: "eNotice", title: "公告 · 复盘", standing: true, w: 120, h: 150 }));
// mETH 角 (seg5 end / seg6 start)
sput("meth", L.E_METH, E1.vending, { sign: "mETH" });
wput("hour", L.E_HOUR, O.hourglass(L.E_HOUR, { id: "hour" }));
wput("pause2", L.E_PAUSE2, O.knifeSwitch(L.E_PAUSE2, { id: "pause2", on: true }));
wput("tower", L.E_TOWER, O.tower(L.E_TOWER, { id: "tower" }));
sput("cmeth", L.E_CMETH, E7.oddCoin);
// 核对台
sput("chk", L.E_CHKCARD, E4.punchCard, { kind: "card", title: "审计版本" });
put("bytes", L.E_BYTES, E3.byteBlock(L.E_BYTES, { id: "bytes", text: "线上字节码", bytes: 16 }));
put("mag", L.E_MAG, O.magnifier(L.E_MAG, { id: "mag", z: 120 }));
put("proof", L.E_PROOF, E2.proofCard(L.E_PROOF, { id: "proof" }));
// "改动" cards row (native SVG) + hidden "已审查" stamps
// seg-local spot for the change cards: front-right of the bench (layout's E_CHANGES sits under the captions in checkE)
const CHG = { u: Math.round(L.U_E + 0.8192 * 2700 - 1.1472 * -150), v: Math.round(0.5736 * 2700 + 1.6383 * -150) };
{
  const [gx, gy] = at(CHG); let cards = "", stamps = [];
  for (let i = 0; i < 4; i++) {
    const x = gx + i * 100, y = gy - 60;
    cards += `<g><rect x="${x}" y="${y}" width="78" height="50" rx="5" fill="#fff" stroke="#8a857c" stroke-width="1.6"/>`
      + `<text x="${x + 39}" y="${y + 22}" font-size="15" text-anchor="middle" fill="#1c1c1c" font-family="Noto Sans SC">改动 ${i + 1}</text>`
      + `<line x1="${x + 12}" y1="${y + 34}" x2="${x + 66}" y2="${y + 34}" stroke="#c9c3b8" stroke-width="3"/></g>`;
    stamps.push(S.hid("st" + i, `<g transform="rotate(-12 ${x + 52} ${y + 30})"><rect x="${x + 22}" y="${y + 18}" width="62" height="24" rx="4" fill="rgba(31,157,85,0.12)" stroke="#1f9d55" stroke-width="2.4"/>`
      + `<text x="${x + 53}" y="${y + 35}" font-size="13" font-weight="700" text-anchor="middle" fill="#1f9d55" font-family="Noto Sans SC">已审查</text></g>`));
  }
  add(CHG, cards + stamps.join(""), 0);
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-chk", up(A.chk.top, 8), "审计版本 · <b>提交哈希</b>", "lab-cs");
lb("lb-bytes", up(A.bytes.top, 40), "线上字节码", "lab-cs");
{ const m = [(A.chk.center[0] + A.bytes.center[0]) / 2 + 30, (A.chk.center[1] + A.bytes.center[1]) / 2 - 150];
  lb("lb-eq", m, `<span style="font-size:44px;line-height:1">=</span>`, "lab-g", "c"); }
lb("lb-chg", [at(CHG)[0] + 190, at(CHG)[1] - 70], "上线后的每一次改动", "lab-ink lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
// role cards (L0–L4, top centre)
const ROLES = [["dev", "开发者", "写一条不变量", `<svg viewBox="0 0 40 30" width="40" height="30"><line x1="20" y1="4" x2="20" y2="26" stroke="#1c1c1c" stroke-width="2"/><line x1="6" y1="9" x2="34" y2="9" stroke="#1c1c1c" stroke-width="2"/><path d="M2 18 L6 9 L10 18 Z M30 18 L34 9 L38 18 Z" fill="#2aa3c9"/><rect x="13" y="25" width="14" height="3" fill="#1c1c1c"/></svg>`],
  ["aud", "审计者", "核对哈希与字节码", `<svg viewBox="0 0 44 30" width="44" height="30"><rect x="2" y="4" width="16" height="22" rx="2" fill="#fff" stroke="#1c1c1c" stroke-width="1.6"/><circle cx="7" cy="10" r="1.6"/><circle cx="12" cy="15" r="1.6"/><circle cx="7" cy="20" r="1.6"/><rect x="24" y="11" width="18" height="9" fill="#2aa3c9"/><line x1="30" y1="11" x2="30" y2="20" stroke="#fff"/><line x1="36" y1="11" x2="36" y2="20" stroke="#fff"/></svg>`],
  ["lead", "负责人", "谁能按暂停？", `<svg viewBox="0 0 34 34" width="34" height="34"><rect x="5" y="3" width="24" height="28" rx="3" fill="#e8e3da" stroke="#1c1c1c" stroke-width="1.6"/><line x1="12" y1="24" x2="12" y2="9" stroke="#1c1c1c" stroke-width="3"/><line x1="22" y1="24" x2="22" y2="9" stroke="#1c1c1c" stroke-width="3"/><rect x="9" y="8" width="16" height="4" fill="#e0453a"/><circle cx="17" cy="28" r="2" fill="#2bd46f"/></svg>`]];
let html = ROLES.map(([id, name, act, icon], i) => `<div class="rc" id="rc-${id}" style="left:${616 + i * 344}px"><div class="rc-on" id="rc-${id}-on"></div>`
  + `<div class="rc-name">${name}</div><div class="rc-act" id="rc-${id}-act">${icon}<span>${act}</span></div></div>`).join("");
// quiz card (L5–L9): comes from under the pills to top centre
html += `<div class="qz" id="qz">通过审计 <span class="qz-op"><span id="qz-eq">=</span><span id="qz-neq">≠</span><span id="qz-x">✕</span></span> 线上代码安全？</div>`;
// wide-shot gate markers (screen layer; wide k 0.115)
const GS = GATES.map((o, i) => { const [x, y] = S.scr("wide", A["g" + (i + 1)].center); return [Math.round(x), Math.round(y)]; });
const SKIP = 3;  // gate ④
html += GS.map(([x, y], i) => `<div class="gm" id="gm${i}" style="left:${x - 22}px;top:${y - 22}px"></div>`
  + `<div class="gok" id="gok${i}" style="left:${x - 17}px;top:${y - 62}px">✓</div>`).join("");
html += kw("kw-gate", `审计 = <b>一个关口</b> ${gtag("解读")}`, { x: 700, y: 130, size: 40 });
html += `<div class="gskip" id="gskip" style="left:${GS[SKIP][0] - 36}px;top:${GS[SKIP][1] - 40}px"><span>跳过？</span></div>`;
// return dashed line behind the belt (E end → gate ①), drawn at L11 in wide
S.curve("cv-back", S.scr("wide", Wp(L.BELT_U[1], -500)), S.scr("wide", Wp(L.BELT_U[0] + 400, -500)), { color: "#2aa3c9" });
const css = `
  .rc { position:absolute; top:112px; width:330px; height:108px; background:#fff; border-radius:12px; box-shadow:0 8px 20px rgba(70,60,40,.12);
    border:2px solid #d8d2c6; opacity:0; font-family:"Noto Sans SC",sans-serif; padding:10px 16px; box-sizing:border-box; }
  .rc-on { position:absolute; inset:-2px; border:3px solid #1f9d55; border-radius:12px; opacity:0; }
  .rc-name { font-size:28px; font-weight:700; color:#1c1c1c; }
  .rc-act { display:flex; align-items:center; gap:10px; margin-top:4px; font-size:26px; color:#19809f; white-space:nowrap; opacity:0; }
  .qz { position:absolute; left:620px; top:120px; width:680px; text-align:center; background:#fff; border-radius:14px; padding:16px 20px; box-sizing:border-box;
    box-shadow:0 10px 24px rgba(70,60,40,.14); border-left:6px solid #2aa3c9; font:700 34px "Noto Sans SC",sans-serif; color:#1c1c1c; opacity:0; }
  .qz-op { position:relative; display:inline-block; width:44px; }
  #qz-neq, #qz-x { position:absolute; left:0; right:0; top:0; opacity:0; color:#e0453a; }
  #qz-x { font-size:48px; top:-10px; }
  .gm { position:absolute; width:44px; height:44px; border-radius:50%; border:3px solid #2aa3c9; box-sizing:border-box; opacity:0; }
  .gok { position:absolute; width:34px; height:34px; border-radius:50%; background:#1f9d55; color:#fff; font:700 22px/34px sans-serif; text-align:center; opacity:0; }
  .gskip { position:absolute; width:72px; height:72px; border:3px dashed #e0453a; border-radius:8px; box-sizing:border-box; opacity:0; }
  .gskip span { position:absolute; left:50%; bottom:78px; transform:translateX(-50%); white-space:nowrap; background:#fff; color:#e0453a; border:2px solid #e0453a;
    border-radius:8px; padding:2px 10px; font:700 22px "Noto Sans SC",sans-serif; }
`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  dev: w("开发者", 2), inv: w("不变量", 2), aud: LS[3], hash: w("提交哈希", 3), lead: LS[4], pause: w("暂停", 4),
  no: LS[7], hash8: w("提交哈希", 8), eq9: w("等于", 9), chg: w("每一次改动", 9), gate: w("关口", 10),
};
const t = (x) => f(x);

S.build({
  cam0: "methE", sub: "审计是一个关口，不是免检证书",
  grid: { u0: -3900, u1: 21200, v0: -12300, v1: 13400 }, box: [-1100, -7100, 17000, 9700],   // 盖住本段镜头 methE · wide · checkE
  shown: [], css, html,
  terms: [
    { id: "t0", t: "字节码", d: "合约编译后真正部署到链上的代码", at: w("字节码", 3) },
  ],
  end: { title: "审计、测试与开发流程", line: "审计是流水线上的一个关口，不是一张免检证书", next: "事故案例库", at: LS[11] - 0.3, nextAt: w("下一集", 11) },
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 最后，按角色各做一件事。  三张角色卡（灰）
      ${[0, 1, 2].map((i) => `tl.to("#rc-${ROLES[i][0]}", { opacity: 0.5, duration: 0.3 }, ${f(LS[0] + 0.2 + i * 0.25)});`).join(" ")}
      // ===== L1 先对照八个关口问一句，哪一个是你们跳过的？  拉到 wide；八道关卡逐个闪；④ 红虚线框"跳过？"
      cam(${f(LS[1])}, "wide", 1.4);
      ${GS.map((_, i) => `pop("#gm${i}", ${f(LS[1] + 1.5 + i * 0.18)}, 0.2); out("#gm${i}", ${f(LS[1] + 1.85 + i * 0.18)}, 0.25);`).join(" ")}
      pop("#gskip", ${f(LS[1] + 3.2)}, 0.3);
      out("#gskip", ${f(LS[2] - 0.2)});
      // ===== L2 开发者 … 写下一条不变量  → checkE；开发者卡亮
      cam(${f(LS[2])}, "checkE", 1.6);
      tl.to("#rc-dev", { opacity: 1, duration: 0.25 }, ${f(TM.dev)}); fadeIn("#rc-dev-on", ${f(TM.dev)});
      fadeIn("#rc-dev-act", ${f(TM.inv)}, 0.3);
      // ===== L3 审计者：提交哈希 vs 线上字节码
      tl.to("#rc-aud", { opacity: 1, duration: 0.25 }, ${f(TM.aud)}); fadeIn("#rc-aud-on", ${f(TM.aud)}); out("#rc-dev-on", ${f(TM.aud)});
      fadeIn("#rc-aud-act", ${f(TM.hash)}, 0.3);
      pop("#lb-chk", ${f(TM.hash)}, 0.25); pop("#lb-bytes", ${f(TM.hash + 0.8)}, 0.25);
      // ===== L4 负责人：谁有权按暂停
      tl.to("#rc-lead", { opacity: 1, duration: 0.25 }, ${f(TM.lead)}); fadeIn("#rc-lead-on", ${f(TM.lead)}); out("#rc-aud-on", ${f(TM.lead)});
      fadeIn("#rc-lead-act", ${f(TM.pause)}, 0.3);
      // ===== L5 回到开头的问题  角色卡收起，题卡从右上回到中央
      out(".rc, #lb-chk, #lb-bytes", ${f(LS[5] - 0.2)}, 0.3);
      tl.set("#qz", { x: 520, y: 20, scale: 0.6 }, 0);
      fadeIn("#qz", ${f(LS[5] + 0.15)}, 0.3);
      tl.to("#qz", { x: 0, y: 0, scale: 1, duration: 0.8, ease: "power2.out" }, ${f(LS[5] + 0.2)});
      // ===== L6 通过审计能证明线上代码安全吗
      bump("#qz", ${f(LS[6] + 0.2)}, 1.05, 1);
      // ===== L7 不能：= 打红叉 → ≠
      fadeIn("#qz-x", ${f(TM.no)}, 0.15); out("#qz-x, #qz-eq", ${f(TM.no + 0.5)}, 0.2); fadeIn("#qz-neq", ${f(TM.no + 0.55)}, 0.2);
      // ===== L8 只对那个提交哈希成立：审计版本卡亮
      pop("#lb-chk", ${f(TM.hash8)}, 0.25); bump("#chk", ${f(TM.hash8 + 0.1)}, 1.06, 1);
      // ===== L9 关键画面：放大镜在版本卡与字节码之间来回，绿色"="；改动卡依次盖"已审查"
      pop("#lb-bytes", ${f(LS[9] + 0.1)}, 0.25);
      tl.to("#mag", { x: -110, y: 20, duration: 0.7, ease: "power1.inOut" }, ${f(LS[9] + 0.3)});
      tl.to("#mag", { x: 90, y: -30, duration: 0.9, ease: "power1.inOut" }, ${f(LS[9] + 1.0)});
      tl.to("#mag", { x: 0, y: 0, duration: 0.6, ease: "power1.inOut" }, ${f(LS[9] + 1.9)});
      bump("#lb-chk", ${f(LS[9] + 0.6)}, 1.08, 1); bump("#lb-bytes", ${f(LS[9] + 1.5)}, 1.08, 1);
      pop("#lb-eq", ${f(TM.eq9 + 0.3)}, 0.3);
      pop("#lb-chg", ${f(TM.chg - 0.2)}, 0.25);
      ${[0, 1, 2, 3].map((i) => `pop("#st${i}", ${f(TM.chg + 0.4 + i * 0.45)}, 0.2);`).join(" ")}
      // ===== L10 审计是流水线上的一个关口，不是免检证书  拉到全景：八道关卡全亮绿，回流虚线；"审计 = 一个关口"
      out("#qz, #lb-chk, #lb-bytes, #lb-eq, #lb-chg", ${f(LS[10] - 0.2)}, 0.25);
      cam(${f(LS[10])}, "world", 1.4);
      ${GS.map((_, i) => `pop("#gok${i}", ${f(LS[10] + 1.4 + i * 0.12)}, 0.2);`).join(" ")}
      draw("cv-back", ${f(LS[10] + 1.8)}, 1.0);
      pop("#kw-gate", ${f(TM.gate)}, 0.3);
      // ===== L11 下一集讲事故案例库  结束卡（停在 CAMS.world）
      out("#kw-gate, .gok", ${f(LS[11] - 0.45)}, 0.2);
`,
});
