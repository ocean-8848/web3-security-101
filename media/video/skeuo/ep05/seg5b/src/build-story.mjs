// seg5b「⑤ 慢升级快暂停 · 今天能做什么」— 生成 compositions/story.html
// 运行：node src/build-story.mjs
// 一个连续的等距世界 + 一台镜头：
//   上方：Parity 角落（seg1 的钩子场景：Library 机器 + initialize/kill 按钮台 + 三个被冻住的钱包）；
//   下方一排四个角色（写合约的人 / 审计的人 / 管私钥的人 / 普通用户），每人走到自己的小场景做一件事；
//   普通用户再走到 TRON 账户柜；镜头回到 Parity 角落给出答案；再到中区主按钮台讲"前提"；最后结束卡（最后 2.5 秒完全静止）。
import fs from "node:fs";
import { G, at, f, Wp, camAt, toScreen, worldSvg, gridSvg, wlab, wpin, kitCss, runtimeJs, CHECK, BADGE } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt as WA, lineAt } from "../../../kit/timing.mjs";
import * as HK from "./hook.mjs";
// 世界坐标与 seg1 对齐（只 import 不改）：主机器在原点、主按钮台 (0,300)、钥匙管理处、TRON 街区
import { MAIN, MAIN_PANEL, MAIN_BUTTONS, KEYS_ZONE, TRON_ZONE } from "../../seg1/src/layout.mjs";

const TM = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = TM.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const w = (s, o) => WA(TM, s, o).start;
const L = (i) => lineAt(TM, i);

// ------------------------------------------------------------------ helpers
const items = [], overlay = [], A = {};
const add = (fn, o, opts, extraY = 0) => { const r = fn(o, opts); items.push({ Y: at(o)[1] + extraY, svg: r.svg }); A[opts.id] = r.anchors; return r; };
const uv = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });

// ------------------------------------------------------------------ 上方：Parity 角落（钩子场景，坐标见 hook.mjs）
HK.build({ add, items, A, uv });

// ------------------------------------------------------------------ 一排四个角色
const ROLES = [
  { name: "写合约的人", role: "engineer", color: "#2a9fc6" },
  { name: "审计的人", role: "signer", color: "#3b3e44" },
  { name: "管私钥的人", role: "signer", color: "#5b6b7d" },
  { name: "普通用户", role: "signer", color: "#7a6a58" },
];
const PS = 1.9;                                        // person scale → 约 330 世界单位高
// 四人一排站在 Parity 角落前方（屏幕地面 G 坐标）；各 zone 的"人物站位"也用屏幕地面坐标
const LX = (i) => -2150 + 340 * i, LY = 760;
const off = (o, dx, dy) => { const p = at(o); return [p[0] + dx, p[1] + dy]; };
const ZP = [
  off(MAIN_PANEL, -470, 40),                            // zone 1：主按钮台（seg1 定的中区）
  [700, 1450],                                          // zone 2：审计（中区下方空地）
  off(KEYS_ZONE, -520, 60),                             // zone 3：钥匙管理处（seg1 建议区）
  [-3000, 1350],                                        // zone 4：普通用户（Parity 角落左下空地）
  off(TRON_ZONE, -560, 160),                            // zone 5：TRON 街区（seg1 建议区）
];
const MOVE = ROLES.map((_, i) => [f(ZP[i][0] - LX(i)), f(ZP[i][1] - LY)]);
const MOVE5 = [f(ZP[4][0] - LX(3)), f(ZP[4][1] - LY)];
ROLES.forEach((r, i) => add(O.person, G(LX(i), LY), { id: `p${i}`, role: r.role, color: r.color, scale: PS }, (i === 3 ? Math.max(ZP[3][1], ZP[4][1]) : ZP[i][1]) - LY + 30));

// ------------------------------------------------------------------ zone 1 · 写合约的人：主按钮台 + 外部函数清单
const Z1 = ZP[0];
const MP = MAIN_PANEL;
const MCH = MAIN;
add(E3.contractMachine, MCH, { id: "mcm", name: "APP" });
const MB = MAIN_BUTTONS;
add(X.funcPanel, MP, { id: "mp", buttons: MB.map((n) => ({ name: n })) });

// ------------------------------------------------------------------ zone 2 · 审计的人：实现合约 + initialize / execute
const Z2 = ZP[1];
const AP = G(Z2[0] + 470, Z2[1] - 20);
const ACM = uv(AP, 0, -290);
add(E3.contractMachine, ACM, { id: "acm", name: "Impl" });
add(X.funcPanel, AP, { id: "ap", buttons: [{ name: "initialize" }, { name: "execute" }], pitch: 130 });
{
  const r = O.magnifier(uv(AP, -80, 200), { id: "amg", z: 120 });
  overlay.push(`<g id="amg-w" opacity="0">${r.svg}</g>`); A.amg = r.anchors;
}
add(O.padlock, uv(AP, 100, 190), { id: "alk" }, 60);

// ------------------------------------------------------------------ zone 3 · 管私钥的人：角色门卡挂板
const Z3 = ZP[2];
const RB = KEYS_ZONE;
add(X.roleBoard, RB, { id: "rb", plates: ["UPGRADER", "PARAM_ADMIN", "PAUSER", "OLD_ADMIN"], roles: ["upgrader", "param", "pauser", "owner"],
  colors: [null, null, null, "#9aa0a8"], holders: ["multisig", "multisig", "bot", "person"], delays: ["≥48h 示例", "24h 示例", "无延迟", "—"] });

// ------------------------------------------------------------------ zone 4 · 普通用户：两个协议页面
const Z4 = ZP[3];
const scrA = `<rect x="0" y="0" width="222" height="146" fill="#ffffff"/><rect x="0" y="0" width="222" height="28" fill="#ece7dd"/>` +
  `<text x="10" y="20" font-family="Noto Sans SC, sans-serif" font-size="15" font-weight="800" fill="#5f5a50">协议 A · 存款</text>` +
  `<text x="12" y="56" font-family="Noto Sans SC, sans-serif" font-size="15" font-weight="800" fill="#1c1c1c">管理员</text>` +
  `<rect x="10" y="66" width="202" height="30" rx="5" fill="#fde6e3" stroke="#e0453a" stroke-width="2"/>` +
  `<text x="18" y="87" font-family="JetBrains Mono, monospace" font-size="15" font-weight="800" fill="#c3352b">0x7a3f…c91e</text>` +
  `<rect x="120" y="108" width="92" height="28" rx="6" fill="#c9c3b7"/><text x="166" y="128" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="15" font-weight="800" fill="#fff">存款</text>`;
const scrB = `<rect x="0" y="0" width="222" height="146" fill="#ffffff"/><rect x="0" y="0" width="222" height="28" fill="#ece7dd"/>` +
  `<text x="10" y="20" font-family="Noto Sans SC, sans-serif" font-size="15" font-weight="800" fill="#5f5a50">协议 B · 存款</text>` +
  `<text x="12" y="56" font-family="Noto Sans SC, sans-serif" font-size="15" font-weight="800" fill="#1c1c1c">管理员</text>` +
  `<rect x="10" y="66" width="202" height="30" rx="5" fill="#e3f4ea" stroke="#1f9d55" stroke-width="2"/>` +
  `<text x="18" y="87" font-family="Noto Sans SC, sans-serif" font-size="15" font-weight="800" fill="#17803f">多签 + 时间锁</text>` +
  `<rect x="120" y="108" width="92" height="28" rx="6" fill="#1d93ba"/><text x="166" y="128" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="15" font-weight="800" fill="#fff">存款</text>`;
add(O.laptop, G(Z4[0] + 470, Z4[1] - 110), { id: "la", screen: scrA });
add(O.laptop, G(Z4[0] + 1000, Z4[1] - 110), { id: "lb", screen: scrB });

// ------------------------------------------------------------------ zone 5 · TRON：账户柜 + 递来的私钥 / 改权限交易单
const Z5 = ZP[4];
const ASF = TRON_ZONE;
add(X.accountSafe, ASF, { id: "as" });
add(O.person, G(Z5[0] + 980, Z5[1] + 40), { id: "px", role: "signer", color: "#8a8478", scale: PS }, 30);
add(O.doc, G(Z5[0] + 780, Z5[1] + 30), { id: "dk", title: "私钥", lines: ["5Kb8…", "（别人给的）"], standing: true, w: 170, h: 200 }, 40);
add(O.doc, G(Z5[0] + 380, Z5[1] + 60), { id: "dp", title: "交易单", lines: ["修改账户权限", "Owner → 新地址"], standing: true, w: 190, h: 220 }, 40);

// ------------------------------------------------------------------ labels (world, counter-scaled)
let LB = "";
const lab = (id, p, html, cls = "", anchor = "b") => { LB += wlab(id, p, html, cls + " hide", anchor); };
const up = (p, d) => [p[0], p[1] - d];
ROLES.forEach((r, i) => { lab(`lp${i}`, up(A[`p${i}`].top, 6), r.name, "lab-g"); lab(`lpa${i}`, up(A[`p${i}`].top, 6), r.name, "lab-ink"); });
// zone 1
// zone 2
lab("z2-m", up(A.acm.top, 0), "实现合约", "");
lab("z2-pl", [A.ap.plates[0][0] - 30, A.ap.plates[0][1] + 40], "initialize · 已锁死", "lab-gs", "t");
lab("z2-ex", [A.ap.btns[1][0] + 150, A.ap.btns[1][1] - 20], "execute · 目标地址固定", "lab-gs", "l");
// zone 3
lab("z3-b", up(A.rb.top, 0), "特权私钥清单", "");
lab("z3-old", [A.rb.cards[3][0] + 40, A.rb.cards[3][1] - 10], "早已不用 · 撤销", "lab-r", "r");
// zone 4
lab("z4-a", up(A.la.top, 10), "管理员：单个地址", "lab-r");
lab("z4-ar", [A.la.top[0], A.la.top[1] - 76], "高风险信号", "lab-rs");
lab("z4-b", up(A.lb.top, 10), "管理员：多签 + 时间锁", "");
LB += wpin("z4-bc", [A.lb.top[0] + 300, A.lb.top[1] - 40], CHECK("z4-bok", 56, "hide"), "c");
// zone 5
lab("z5-t", up(A.as.top, 0), "TRON 账户", "lab-cs");
lab("z5-x", up(A.px.top, 6), "陌生人", "lab-g");
LB += wpin("z5-kx", [A.dk.center[0], A.dk.center[1] - 20], BADGE("z5-kxb", 64, "hide"), "c");
LB += wpin("z5-px", [A.dp.center[0], A.dp.center[1] - 20], BADGE("z5-pxb", 64, "hide"), "c");
// hook labels
{ const hl = HK.labels({ lab, A, up }); LB += hl; }

// ------------------------------------------------------------------ cameras
const fit = (Pts, x0, y0, x1, y1) => {
  const xs = Pts.map((p) => p[0]), ys = Pts.map((p) => p[1]);
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  const k = Math.min((x1 - x0) / (bx1 - bx0), (y1 - y0) / (by1 - by0));
  return camAt([(bx0 + bx1) / 2, (by0 + by1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};
const hookPts = HK.points(A);
const pTop = (i) => A[`p${i}`].top, pGr = (i) => A[`p${i}`].ground;
const C0 = fit([...hookPts, up(pTop(0), 60), up(pTop(3), 60), pGr(0), pGr(3)], 200, 110, 1720, 890);
const CS = fit(hookPts, 300, 140, 1620, 860);
// zone cams: 人物在 zone 中心点左侧，镜头倍率保证人物 ≥ 200 px
const zc = (Z, sx, k, sy = 760) => camAt([Z[0], Z[1]], sx, sy, k);
const CZ1 = zc(Z1, 300, 0.98, 740), CZ2 = zc(Z2, 280, 1.0, 790), CZ3 = zc(Z3, 260, 0.98, 790), CZ4 = zc(Z4, 300, 0.9, 800), CZ5 = zc(Z5, 300, 0.8, 820);
const CH = HK.cam(fit, A);
const CH2 = HK.camClose(fit, A);
const CM = camAt(at(MP, 0, 0, 80), 1180, 620, 1.05);
const CEND = CM;                                      // 结束卡下保持主按钮台机位（拉远会把钥匙管理处的挂板腿带进画面）
const CAMS = { CS, C0, CZ1, CZ2, CZ3, CZ4, CZ5, CH, CH2, CM, CEND };

// ------------------------------------------------------------------ assemble
const srt = (arr) => arr.slice().sort((a, b) => a.Y - b.Y).map((b) => b.svg).join("\n");
const world = worldSvg("wsvg", gridSvg({ u0: -4000, u1: 10000, v0: -4000, v1: 9000 }) + srt(items) + overlay.join(""), [-2500, -1500, 12000, 6000]);

const D = (o) => JSON.stringify(o);
const T = {
  each: w("每个人"),
  l1: L(1).start, list1: w("列出", { line: 1 }), one: w("逐个"), who: w("谁能调用"), why: w("凭什么安全"),
  l2: L(2).start, s_init: w("initialize", { line: 2 }), s_dc: w("delegatecall", { line: 2 }), impl: w("实现合约", { line: 2 }), target: w("目标地址"),
  l3: L(3).start, keys: w("特权私钥"), hold: w("谁持有"), where: w("放在哪"), th: w("阈值多少"), rev: w("上次撤销"),
  l4: L(4).start, admin: w("管理员权限"), single: w("单个地址"), risk: w("高风险"),
  l5: L(5).start, tron: w("TRON"), pk: w("别人给的私钥"), perm: w("修改账户权限"),
  l6: L(6).start, back: w("回到开头"), nocrack: w("没破解"), freeze: w("冻结"),
  l7: L(7).start, btn: w("按钮", { line: 7 }), whoq: w("谁有权按它"),
  l8: L(8).start, ctor: w("构造函数"), lock: w("锁死", { line: 8 }),
  l9: L(9).start, pre: w("前提"), other: w("别的按钮"), same: w("同一个问题"), less: w("少一个"), door: w("没装锁的门"),
  l10: L(10).start, next: w("算术与精度", { line: 10 }),
};

// zone 1 checklist card (screen, at CZ1)
const CL = { x: 1010, y: 150 };
const rowsZ1 = [["mint", "MINTER_ROLE"], ["initialize", "仅一次 · 锁死"], ["kill", "owner 多签"], ["upgrade", "UPGRADER"], ["pause", "PAUSER"]];
const clHtml = `<div class="k-code" id="cl"><div class="c-head">外部函数清单<span class="c-tag">示例</span></div>
  <div class="cl-h"><span class="c1">函数</span><span class="c2">谁能调用</span><span class="c3">凭什么安全</span></div>
  ${rowsZ1.map(([fn, who], i) => `<div class="cl-r" id="clr${i}"><span class="c1 mono">${fn}</span><span class="c2 hide" id="clw${i}">${who}</span><span class="c3"><span class="tick hide" id="clt${i}">✓</span></span></div>`).join("")}
</div>`;
// zone 2 search card
const SC = { x: 1060, y: 150 };
const scHtml = `<div class="k-code" id="sc"><div class="c-head">全文搜索<span class="c-tag">审计</span></div>
  <div class="sbar"><span class="mono" id="sq1">initialize</span><span class="sor">|</span><span class="mono hide" id="sq2">delegatecall</span></div>
  <div class="sres hide" id="sr1"><span class="mono">Impl · initialize()</span><span class="lab lab-gs lab-in hide" id="sr1c">已锁死 ✓</span></div>
  <div class="sres hide" id="sr2"><span class="mono">Proxy · delegatecall(target)</span><span class="lab lab-gs lab-in hide" id="sr2c">target 固定 ✓</span></div>
</div>`;
// zone 3 key table card
const KT = { x: 1000, y: 140 };
const rowsZ3 = [["UPGRADER", "5 人多签", "硬件钱包", "3 / 5", "本季度"], ["PARAM_ADMIN", "5 人多签", "硬件钱包", "3 / 5", "本季度"], ["PAUSER", "监控机器人", "服务器", "1 / 1", "本月"], ["OLD_ADMIN", "前部署者", "热钱包", "1 / 1", "从未"]];
const ktHtml = `<div class="k-code" id="kt"><div class="c-head">特权私钥清单<span class="c-tag">示例</span></div>
  <div class="kt-h"><span class="k0">角色</span><span class="k1 hide" id="kh1">持有者</span><span class="k2 hide" id="kh2">放在哪</span><span class="k3 hide" id="kh3">阈值</span><span class="k4 hide" id="kh4">上次撤销</span></div>
  ${rowsZ3.map((r, i) => `<div class="kt-r" id="ktr${i}"><span class="k0 mono">${r[0]}</span>${[1, 2, 3, 4].map((c) => `<span class="k${c} hide kc${c}${i === 3 && c === 4 ? " red" : ""}">${r[c]}</span>`).join("")}<div class="strike hide" id="kts${i}"></div></div>`).join("")}
</div>`;

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #sec { position: absolute; left: 56px; top: 32px; }
    .mono { font-family: "JetBrains Mono", monospace; }
    .qcard { display: flex; align-items: center; gap: 20px; background: #fffdf8; border: 3px solid #2aa3c9; border-radius: 18px; padding: 14px 26px 16px 18px;
      box-shadow: 0 14px 30px rgba(70, 60, 40, 0.14); white-space: nowrap; }
    .qcard.qr { border-color: #e0453a; }
    .qmark { width: 62px; height: 62px; border-radius: 50%; background: #1d93ba; color: #fff; font-size: 46px; font-weight: 900; line-height: 62px; text-align: center; flex: none; }
    .qr .qmark { background: #e0453a; }
    .qtxt { font-size: 38px; font-weight: 900; line-height: 1.25; color: #1c1c1c; }
    .qtxt .red { color: #e0453a; }
    /* zone 1 checklist */
    #cl { left: ${CL.x}px; top: ${CL.y}px; width: 840px; }
    .cl-h, .cl-r { display: flex; align-items: center; height: 62px; font-size: 32px; font-weight: 800; white-space: nowrap; }
    .cl-h { color: #7d776b; font-size: 30px; border-bottom: 2px solid #e6e0d4; }
    .cl-r { border-bottom: 1px dashed #e6e0d4; }
    .c1 { width: 250px; } .c2 { width: 300px; color: #17809f; } .c3 { width: 200px; }
    .cl-h .c2, .cl-h .c3 { color: #7d776b; }
    .tick { display: inline-block; width: 46px; height: 46px; border-radius: 50%; background: #1f9d55; color: #fff; text-align: center; line-height: 46px; font-size: 32px; font-weight: 900; }
    /* zone 2 search */
    #sc { left: ${SC.x}px; top: ${SC.y}px; width: 780px; }
    .sbar { display: flex; align-items: center; gap: 16px; height: 64px; padding: 0 20px; border: 3px solid #2aa3c9; border-radius: 32px; font-size: 32px; font-weight: 800; margin: 6px 0 14px; }
    .sor { color: #b8b0a1; }
    .sres { display: flex; align-items: center; justify-content: space-between; height: 66px; font-size: 30px; font-weight: 700; border-bottom: 1px dashed #e6e0d4; white-space: nowrap; }
    .lab-in { font-size: 30px; padding: 2px 14px 4px; }
    /* zone 3 table */
    #kt { left: ${KT.x}px; top: ${KT.y}px; width: 880px; padding: 22px 28px; }
    .kt-h, .kt-r { position: relative; display: flex; align-items: center; height: 60px; font-size: 30px; font-weight: 800; white-space: nowrap; }
    .kt-h { color: #7d776b; border-bottom: 2px solid #e6e0d4; }
    .kt-r { border-bottom: 1px dashed #e6e0d4; }
    .k0 { width: 230px; font-size: 28px; } .k1 { width: 180px; } .k2 { width: 160px; } .k3 { width: 110px; } .k4 { width: 140px; }
    .kt-r .red { color: #e0453a; }
    .strike { position: absolute; left: 0; right: 0; top: 29px; height: 4px; background: #e0453a; transform-origin: 0 50%; }
    #tr { left: 1100px; top: 150px; width: 740px; }
    .tr-r { display: flex; align-items: center; gap: 18px; height: 72px; font-size: 34px; font-weight: 900; white-space: nowrap; border-bottom: 1px dashed #e6e0d4; }
    .tx { width: 46px; height: 46px; border-radius: 50%; background: #e0453a; color: #fff; text-align: center; line-height: 46px; font-size: 28px; }
    .tv { margin-left: auto; color: #e0453a; }
    /* hook */
    #hq { position: absolute; left: 70px; top: 120px; }
    #dpan { position: absolute; left: 70px; top: 300px; }
    #hq2 { position: absolute; left: 70px; top: 120px; }
    .dp { background: #fffdf8; border-radius: 18px; padding: 16px 22px 18px; box-shadow: 0 10px 22px rgba(70,60,40,0.12); }
    .dp-h { font-size: 36px; font-weight: 900; white-space: nowrap; }
    .dp-tag { display: inline-block; margin-left: 12px; font-size: 28px; font-weight: 700; color: #6d685e; border: 2px solid #cfc7b8; border-radius: 8px; padding: 0 8px 2px; vertical-align: 4px; }
    .dp-d { margin-top: 12px; display: grid; grid-template-columns: repeat(13, 24px); gap: 8px; }
    .dd { width: 24px; height: 24px; border-radius: 50%; background: #1d93ba; }
    .dp-n { margin-top: 10px; font-size: 30px; font-weight: 700; color: #6d685e; white-space: nowrap; }
    #pre-tag { position: absolute; left: 70px; top: 120px; }
    #pre { position: absolute; left: 70px; top: 180px; width: 600px; background: #fffdf8; border-radius: 16px; padding: 18px 26px 20px; box-shadow: 0 12px 26px rgba(70, 60, 40, 0.13); border-left: 10px solid #1d93ba; }
    #pre .p-n { font-size: 30px; font-weight: 800; color: #1d93ba; white-space: nowrap; }
    #pre .p-t { font-size: 40px; font-weight: 900; line-height: 1.3; }
    #veil { position: absolute; inset: 0; background: #efebe3; opacity: 0; }
    #endcard { position: absolute; left: 160px; top: 200px; width: 1600px; background: #fffdf8; border-radius: 28px; box-shadow: 0 18px 40px rgba(70, 60, 40, 0.14);
      text-align: center; padding: 50px 40px 54px; opacity: 0; }
    #endcard .e-ch { font-size: 40px; font-weight: 900; color: #1d93ba; letter-spacing: 0.04em; }
    #endcard .e-main { margin-top: 6px; font-size: 76px; font-weight: 900; line-height: 1.15; white-space: nowrap; color: #1c1c1c; }
    #endcard .e-rule { width: 120px; height: 6px; border-radius: 3px; background: #2aa3c9; margin: 32px auto 28px; }
    #endcard .e-next { margin-top: 22px; font-size: 36px; font-weight: 700; color: #3b3e44; white-space: nowrap; }
    #endcard .e-note { font-size: 40px; font-weight: 900; color: #1d93ba; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${LB}</div>
      </div>
      <div class="hide" id="clw">${clHtml}</div>
      <div class="hide" id="scw">${scHtml}</div>
      <div class="hide" id="ktw">${ktHtml}</div>
      <div class="hide" id="trw"><div class="k-code" id="tr"><div class="c-head">在 TRON 上<span class="c-tag">普通用户</span></div>
        <div class="tr-r hide" id="tr1"><span class="tx">✕</span>别人给的私钥<span class="tv">不导入</span></div>
        <div class="tr-r hide" id="tr2"><span class="tx">✕</span>修改账户权限的交易<span class="tv">不签</span></div></div></div>
      ${HK.dotPanel()}
      <div id="hq" class="hide"><div class="qcard"><div class="qmark">?</div><div class="qtxt">没破解任何东西<br>为什么能冻结 <span class="red">约 51 万 ETH</span></div></div></div>
      <div id="hq2" class="hide"><div class="qcard qr"><div class="qmark">?</div><div class="qtxt">initialize · 谁有权按它</div></div></div>
      <div id="pre-tag" class="lab lab-g hide">这个答案的前提 · 解读</div>
      <div id="pre" class="hide"><div class="p-n">每个按钮都要回答</div><div class="p-t">少一个<br>就还是没装锁的门</div></div>
      <div id="sec"><div class="lab lab-ink hide" id="sec-l">⑤ 慢升级快暂停 · 今天能做什么</div></div>
      ${pills(5, { sections: SCRIPT.sections })}
      <div id="veil"></div>
      <div id="endcard">
        <div class="e-main">${SCRIPT.title}</div>
        <div class="e-rule"></div>
        <div class="e-note" id="e-note">每个按钮都要回答谁有权按它 · 少一个就是没装锁的门</div>
        <div class="e-next" id="e-next">下一集 · 算术与精度：差一个 wei，丢一个金库</div>
      </div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E3.runtimeExtJs()}
${X.runtimeExtJs()}
  (function () {
    const C = ${D(CAMS)};
    const MV = ${D(MOVE)}, MV5 = ${D(MOVE5)};
    const T = ${D(T)};
    const TOTAL = ${TOTAL};
    const K5 = window.KITX05;
    const tl = gsap.timeline({ paused: true });
    const pop = (sel, t) => KIT.pop(tl, sel, t);
    const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.25, ease: "power2.in" }, t);
    const fin = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.3, ease: "power2.out", immediateRender: false }, t);
    const walk = (ids, t, dx, dy, dur) => tl.to(ids, { x: dx, y: dy, duration: dur || 1.2, ease: "power2.inOut" }, t);
    KIT.camSet(tl, C.CS);
    ["alk"].forEach(function (id) { const el = document.getElementById(id); tl.set("#" + id, { scaleY: 0, svgOrigin: el.getAttribute("data-ox") + " " + el.getAttribute("data-oy") }, 0); });
    ["p0", "p1", "p2", "p3"].forEach(function (id, i) { const el = document.getElementById(id); tl.set("#" + id, { scaleY: 0, svgOrigin: el.getAttribute("data-ox") + " " + el.getAttribute("data-oy") }, 0); KIT.grow(tl, id, 1.2 + i * 0.12); });

    // ---------------- 段首：小标签过渡；L0 · 每人一件事（钩子场景缩到上方，下方一排四个人）
    pop("#sec-l", 0.15);
    KIT.cam(tl, 0.5, C.C0, 1.3);
    [0, 1, 2, 3].forEach(function (i) { pop("#lp" + i, T.each + 0.2 + i * 0.15); });
${HK.js0()}

    // ---------------- L1 · 写合约的人：外部函数清单
    const t1 = T.l1 - 0.4;
    KIT.cam(tl, t1, C.CZ1, 1.3);
    walk("#p0, #lp0-pin, #lpa0-pin", t1, MV[0][0], MV[0][1], 1.3);
    out("#sec-l, #lp1, #lp2, #lp3", t1, 0.25);
    tl.to("#lp0", { opacity: 0, duration: 0.15 }, T.l1 + 0.4); pop("#lpa0", T.l1 + 0.4);
    fin("#clw", T.list1 + 0.2, 0.3); tl.fromTo("#cl", { y: 24 }, { y: 0, duration: 0.5, ease: "power3.out", immediateRender: false }, T.list1 + 0.2);
    const dt1 = (T.why + 0.9 - T.one) / 5;
    for (let i = 0; i < 5; i++) {
      const ti = T.one + i * dt1;
      fin("#clw" + i, ti, 0.2);
      pop("#clt" + i, ti + 0.25);
      KIT.led(tl, "mp-st-" + i, ti + 0.25, "green");
      tl.fromTo("#clr" + i, { backgroundColor: "rgba(31,157,85,0)" }, { backgroundColor: "rgba(31,157,85,0.10)", duration: 0.2, immediateRender: false }, ti);
    }

    // ---------------- L2 · 审计的人：搜 initialize / delegatecall
    const t2 = T.l2 - 0.4;
    KIT.cam(tl, t2, C.CZ2, 1.3);
    walk("#p1, #lp1-pin, #lpa1-pin", t2, MV[1][0], MV[1][1], 1.3);
    out("#clw, #lpa0", t2, 0.3);
    tl.to("#lp1", { opacity: 0, duration: 0.15 }, T.l2 + 0.4); pop("#lpa1", T.l2 + 0.4);
    fin("#scw", T.s_init - 0.3, 0.3);
    pop("#z2-m", T.s_init);
    fin("#amg-w", T.s_init, 0.25);
    fin("#sq2", T.s_dc, 0.2);
    fin("#sr1", T.s_init + 0.5, 0.25); fin("#sr2", T.s_dc + 0.6, 0.25);
    // 放大镜从 initialize 移到 execute
    K5.moveUV(tl, "amg-w", T.s_dc, 130, 0, 0, 0.8);
    // 确认实现合约已锁死：钢板落下焊死 initialize
    K5.moveUV(tl, "amg-w", T.impl - 0.2, 0, 0, 0, 0.6);
    K5.guard(tl, "ap", 0, T.impl + 0.2, "plate", 0.5);
    pop("#z2-pl", T.impl + 0.8);
    pop("#sr1c", T.impl + 0.6);
    // 目标地址不由用户决定：execute 旁挂锁，目标固定
    K5.moveUV(tl, "amg-w", T.target - 0.4, 130, 0, 0, 0.6);
    KIT.grow(tl, "alk", T.target);
    pop("#z2-ex", T.target + 0.4);
    pop("#sr2c", T.target + 0.3);

    // ---------------- L3 · 管私钥的人：特权私钥清单 + 撤销旧卡
    const t3 = T.l3 - 0.4;
    KIT.cam(tl, t3, C.CZ3, 1.3);
    walk("#p2, #lp2-pin, #lpa2-pin", t3, MV[2][0], MV[2][1], 1.3);
    out("#scw, #lpa1, #z2-m, #z2-pl, #z2-ex, #amg-w", t3, 0.3);
    tl.to("#lp2", { opacity: 0, duration: 0.15 }, T.l3 + 0.4); pop("#lpa2", T.l3 + 0.4);
    pop("#z3-b", T.keys - 0.2);
    tl.set("#rb", { opacity: 0 }, 0); tl.to("#rb", { opacity: 1, duration: 0.4 }, t3 + 0.2); tl.to("#rb", { opacity: 0, duration: 0.3 }, T.l4 + 0.6);
    fin("#ktw", T.keys, 0.3);
    [["#kh1", ".kc1", T.hold], ["#kh2", ".kc2", T.where], ["#kh3", ".kc3", T.th], ["#kh4", ".kc4", T.rev]].forEach(function (c) {
      fin(c[0], c[2] - 0.1, 0.2);
      tl.fromTo(c[1], { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.08, immediateRender: false }, c[2]);
    });
    const tRev = Math.min(T.rev + 1.2, ${f(L(3).end - 1.0)});
    tl.fromTo("#kts3", { opacity: 1, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.35, ease: "power2.out", immediateRender: false }, tRev);
    pop("#z3-old", tRev);
    K5.hang(tl, "rb", 3, tRev + 0.3, false, 0.5);

    // ---------------- L4 · 普通用户：看管理员权限
    const t4 = T.l4 - 0.4;
    KIT.cam(tl, t4, C.CZ4, 1.3);
    walk("#p3, #lp3-pin, #lpa3-pin", t4, MV[3][0], MV[3][1], 1.3);
    out("#ktw, #lpa2, #z3-b, #z3-old", t4, 0.3);
    tl.to("#lp3", { opacity: 0, duration: 0.15 }, T.l4 + 0.4); pop("#lpa3", T.l4 + 0.4);
    pop("#z4-a", T.admin);
    pop("#z4-b", T.admin + 0.4);
    pop("#z4-bok", T.admin + 0.8);
    pop("#z4-ar", T.risk - 0.1);
    tl.fromTo("#la-solid", { filter: "drop-shadow(0 0 0px rgba(224,69,58,0))" }, { filter: "drop-shadow(0 0 18px rgba(224,69,58,0.9))", duration: 0.4, immediateRender: false }, T.single);

    // ---------------- L5 · TRON：不导入别人给的私钥、不签改权限的交易
    const t5 = T.l5 - 0.35;
    KIT.cam(tl, t5, C.CZ5, 1.3);
    walk("#p3, #lp3-pin, #lpa3-pin", t5, MV5[0], MV5[1], 1.3);
    out("#z4-a, #z4-ar, #z4-b, #z4-bok", t5, 0.25);
    pop("#z5-t", T.tron); pop("#z5-x", T.tron + 0.2);
    // 陌生人递来私钥纸条 → 推回去
    K5.moveUV(tl, "dk", T.pk - 0.3, -80, 0, 0, 0.5);
    pop("#z5-kxb", T.pk + 0.6); fin("#trw", T.tron + 0.3, 0.3); pop("#tr1", T.pk + 0.4);
    K5.moveUV(tl, "dk", T.pk + 0.9, 60, 0, 0, 0.5);
    // 修改账户权限的交易单 → 推开
    pop("#tr2", T.perm); pop("#z5-pxb", T.perm + 0.2);
    K5.moveUV(tl, "dp", T.perm + 0.6, -80, 60, 0, 0.5);
    KIT.led(tl, "as-out-led", T.perm + 0.4, "green");

    // ---------------- L6–L8 · 回到开头（Parity 角落）
${HK.js({ out: ["#z5-t", "#z5-x", "#z5-kxb", "#z5-pxb", "#lpa3"] })}

    // ---------------- L9 · 前提：别的按钮也要回答；少一个 = 没装锁的门
    KIT.cam(tl, T.l9 - 0.35, C.CM, 1.4);
    out("#hq, #hq2", T.l9 - 0.35, 0.25);
    pop("#pre-tag", T.pre);
    out("#trw", T.l6 - 0.4, 0.3);
    const order = [4, 3, 2, 1];
    order.forEach(function (i, k) { K5.guard(tl, "mp", i, T.other + 0.2 + k * 0.45, i === 1 ? "plate" : "card", 0.45); });
    K5.guard(tl, "mp", 0, T.same + 0.4, "broken", 0.3);
    [0, 1, 2].forEach(function (k) { tl.to("#mp-gap-0", { opacity: 0.25, duration: 0.18 }, T.less + k * 0.5); tl.to("#mp-gap-0", { opacity: 1, duration: 0.18 }, T.less + 0.25 + k * 0.5); });
    KIT.led(tl, "mp-st-0", T.less, "red");
    pop("#pre", T.less - 0.2);

    // ---------------- L10 · 结束卡（最后 2.5 秒完全静止）
    const tE = T.l10 - 0.1;
    KIT.cam(tl, tE, C.CEND, 1.0);
    out("#pre, #pre-tag", tE - 0.1, 0.25);
    tl.to("#veil", { opacity: 0.74, duration: 0.45, ease: "power1.inOut" }, tE + 0.1);
    tl.fromTo("#endcard", { opacity: 0, scale: 0.94, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, tE + 0.2);
    tl.set("#e-next, #e-note", { opacity: 0 }, 0);
    fin("#e-note", tE + 0.7, 0.3);
    fin("#e-next", Math.min(T.next, TOTAL - 2.5 - 0.35), 0.3);
    tl.set({}, {}, TOTAL);
    window.__timelines["story"] = tl;
  })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "total", TOTAL, D(T), D(CAMS));
