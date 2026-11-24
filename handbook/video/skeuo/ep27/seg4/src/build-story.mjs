// ep27/seg4「④ 审计与上线」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.formalC（BRIEF）。
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
import * as E16 from "../../../ep16/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.chainD

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E3, E4, E5, E6, E7, E16, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 包一层缩放 / 移动 / 隐藏的助手
const isPt = (v) => Array.isArray(v) && v.length === 2 && typeof v[0] === "number";
/** wput(key, o, r, {k, gid, hide, dy, grow, lift}) — k ≠ 1：绕地面点缩放并换算 anchors；gid：外包 <g id>（GSAP 平移用）；hide：外包开场透明 */
function wput(key, o, r, { k = 1, gid, hide = false, dy = 0, grow = false, lift = 0 } = {}) {
  const [gx, gy] = at(o);
  const wrap = (svg) => {
    let s = k === 1 ? svg : `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`;
    if (lift) s = `<g transform="translate(0,${-lift})">${s}</g>`;
    return gid ? `<g id="${gid}"${hide ? ' opacity="0"' : ""}>${s}</g>` : s;
  };
  put(key, o, r, dy, { wrap, grow });
  for (const n in A[key]) { const v = A[key][n]; if (isPt(v)) A[key][n] = [gx + (v[0] - gx) * k, gy + (v[1] - gy) * k - lift]; }
}
const dW = (o1, o2) => { const a = at(o1), b = at(o2); return [b[0] - a[0], b[1] - a[1]]; };   // 世界画布位移
const LIFT = L.BELT_Z * 0.866;

// ---------------------------------------------------------------- 世界物件
// 传送带 C · D · E
L.BELT.slice(1).forEach((s) => put("belt" + s.zone, s.o, E2.conveyor(s.o, { id: "belt" + s.zone, len: s.len, width: L.BELT_W })));
// C 形式化角（seg3 段尾画面）
wput("gate5", L.C_GATES[1], O.checkpoint(L.C_GATES[1], { id: "gate5", n: "⑤", road: false, armUp: true }), { k: 0.6 });
put("proof", L.C_PROOF, E2.proofCard(L.C_PROOF, { id: "proof" }));
wput("mlib", L.C_MATHLIB, E3.contractMachine(L.C_MATHLIB, { id: "mlib", name: "数学库" }), { k: 0.5 });
put("ceng", L.C_ENG, O.person(L.C_ENG, { id: "ceng", role: "engineer", scale: 0.45 }));
// D 关口 ⑥⑦
wput("gate6", L.D_GATES[0], O.checkpoint(L.D_GATES[0], { id: "gate6", n: "⑥", road: false }), { k: 0.6 });
wput("gate7", L.D_GATES[1], O.checkpoint(L.D_GATES[1], { id: "gate7", n: "⑦", road: false }), { k: 0.6 });
put("dsign", L.D_SIGN, E1.signBoard(L.D_SIGN, { id: "dsign", style: "plate", text: "审计与部署", size: 32 }));
// 版本卡：从关口 ⑤ 之后出发（u 7700），沿传送带走到 ⑥ 前 → ⑥⑦ 之间 → 过 ⑦
const VC0 = L.beltAt(7700), VC_U = [L.D_CARD.u, L.U_D - Math.round(300 / 0.8192), L.U_D + Math.round(700 / 0.8192)];
const vcDelta = (u) => dW(VC0, L.beltAt(u));
{
  const r = E4.punchCard(VC0, { id: "vc", kind: "card", title: "版本", scale: 0.7 });
  const [tx, ty] = [r.anchors.top[0], r.anchors.top[1]];
  const dots = Array.from({ length: 8 }, (_, i) => { const cx = tx - 77 + i * 22, cy = ty - 16;
    return `<circle cx="${cx}" cy="${cy}" r="9" fill="#d6cfc2" stroke="#8a8478" stroke-width="1.5"/>` +
      `<circle id="vd${i}" cx="${cx}" cy="${cy}" r="9" fill="#1f9d55" stroke="#14703c" stroke-width="1.5"${i < 5 ? "" : ' opacity="0"'}/>`; }).join("");
  wput("vc", VC0, { svg: r.svg + dots, anchors: r.anchors }, { gid: "vc-mv", lift: LIFT, dy: 400 });
}
// 审计
wput("icard", L.D_ICE, E4.punchCard(L.D_ICE, { id: "icard", kind: "card", title: "提交哈希", scale: 0.6 }), { gid: "icard-v", hide: true });
wput("ice", L.D_ICE, E5.iceShell(L.D_ICE, { id: "ice", on: false, w: 280, d: 160, h: 280 }), { k: 0.6, dy: 1 });
wput("sdoc", L.D_SPECDOC, O.doc(L.D_SPECDOC, { id: "sdoc", w: 140, h: 110, title: "规格" }), { gid: "sdoc-mv" });
L.D_AUDITORS.forEach((o, i) => put("aud" + i, o, O.person(o, { id: "aud" + i, role: "engineer", scale: 0.5 })));
wput("dmag", L.D_MAG, O.magnifier(L.D_MAG, { id: "dmag", z: 120 }), { gid: "dmag-mv", hide: true, dy: 200 });
L.D_CONTEST.forEach((o, i) => put("ct" + i, o, O.person(o, { id: "ct" + i, role: "engineer", scale: 0.35 }), 0, { grow: true }));
put("c4", L.D_C4, E1.signBoard(L.D_C4, { id: "c4", style: "wood", text: "Code4rena · Sherlock · Cantina", size: 24 }), 0, { grow: true });
put("fdoc", L.D_FIXDOC, O.doc(L.D_FIXDOC, { id: "fdoc", w: 140, h: 110, title: "修复" }));
{ const [fx, fy] = at(L.D_FIXDOC); add(L.D_FIXDOC, S.hid("patch", `<rect x="${fx + 10}" y="${fy - 30}" width="46" height="30" rx="4" fill="#e0453a" opacity="0.9" transform="rotate(-12 ${fx + 33} ${fy - 15})"/>`), 2); }
wput("comp", L.D_COMPILER, E3.manual(L.D_COMPILER, { id: "comp", title: "编译器版本", sub: "Vyper", pageTitle: "已知 bug" }), { k: 0.5 });
// 部署
const scr = `<rect width="222" height="146" fill="#1c1c1c"/><text x="14" y="34" fill="#9ad9ee" font-size="20" font-family="monospace">deploy.s.sol</text>
  <text x="14" y="70" fill="#e9e5dc" font-size="17" font-family="monospace">new Vault()</text><text x="14" y="98" fill="#e9e5dc" font-size="17" font-family="monospace">init(params)</text>
  <text x="14" y="126" fill="#5fd08a" font-size="17" font-family="monospace">transfer → 多签</text>`;
wput("lap", L.D_LAPTOP, O.laptop(L.D_LAPTOP, { id: "lap", screen: scr }), { k: 0.7 });
wput("chn", L.D_CHAIN, O.chain(L.D_CHAIN, { id: "chn", n: 3 }), { k: 0.5 });
const page = (ok) => `<rect width="380" height="300" fill="#ffffff"/><rect width="380" height="44" fill="#e9e5dc"/>
  <text x="20" y="30" font-size="22" fill="#1c1c1c" font-weight="700">合约 · 源码</text>
  ${ok ? `<circle cx="190" cy="150" r="56" fill="#1f9d55"/><path d="M162 150l20 20 36-40" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="190" y="252" font-size="34" fill="#1f9d55" font-weight="900" text-anchor="middle">源码已验证</text>`
    : `<rect x="40" y="90" width="300" height="16" fill="#e2ddd3"/><rect x="40" y="124" width="240" height="16" fill="#e2ddd3"/><rect x="40" y="158" width="270" height="16" fill="#e2ddd3"/>
  <text x="190" y="252" font-size="30" fill="#8a8478" font-weight="700" text-anchor="middle">字节码</text>`}`;
wput("brw", L.D_BROWSER, O.browserWin(L.D_BROWSER, { id: "brw", title: "区块浏览器", page: page(false), page2: page(true) }), { k: 0.45 });
put("dep", L.D_DEPLOYER, O.person(L.D_DEPLOYER, { id: "dep", role: "engineer", scale: 0.5 }));
wput("dkey", L.D_KEY, O.key(L.D_KEY, { id: "dkey" }), { k: 0.6, gid: "dkey-mv" });
wput("msig", L.D_MSIG, O.safe(L.D_MSIG, { id: "msig" }), { k: 0.7 });
wput("tlk", L.D_TLOCK, E1.timeLock(L.D_TLOCK, { id: "tlk", open: true }), { k: 0.6 });
// 链差异角
const CH = ["BNB Chain", "TRON", "Mantle"];
L.D_CHAINS.forEach((o, i) => put("ch" + i, o, E1.signBoard(o, { id: "ch" + i, style: "plate", text: CH[i], size: 28 }), 0, { grow: true }));
wput("rul", L.D_RULER, E6.decimalRuler(L.D_RULER, { id: "rul", places: 18, chain: "BSC-USD", scale: 0.6 }), { gid: "rul-v", hide: true });
wput("clk", L.D_CLOCK, O.clock(L.D_CLOCK, { id: "clk" }), { k: 0.6, gid: "clk-v", hide: true });
wput("rt", L.D_RETTAG, E7.returnTag(L.D_RETTAG, { id: "rt", face: "ok", scale: 1.0 }), { gid: "rt-v", hide: true });
L.D_COINS.forEach((o, i) => wput("cn" + i, o, E7.oddCoin(o, { id: "cn" + i, kind: "plain", scale: 0.6 }), { gid: "cn" + i + "-v", hide: true }));
wput("fork", L.D_FORK, E16.forkSwitch(L.D_FORK, { id: "fork", scale: 0.6, thrown: true, labels: ["主网分叉", "本地"] }), { gid: "fork-v", hide: true });

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
// 段首（seg3 段尾）可见
lb("lb-g5", up(A.gate5.top, 6), "形式化验证", "lab-g lab-sm");
lb("lb-proof", up(A.proof.top, 8), "证明", "lab-gs lab-sm");
lb("lb-mlib", up(A.mlib.top, 8), "数学库", "lab-cs lab-sm");
lb("lb-g6", up(A.gate6.top, 6), "外部审计", "lab-g lab-sm");
lb("lb-g7", up(A.gate7.top, 6), "安全部署", "lab-g lab-sm");
// 审计
lb("lb-hash", up(A.ice.top, 8), "冻结 · 提交哈希", "lab-cs lab-sm");
const LOCK = `<svg width="26" height="30" viewBox="0 0 26 30"><path d="M6 13V9a7 7 0 0 1 14 0v4" stroke="#fff" stroke-width="3.5" fill="none"/><rect x="2" y="13" width="22" height="16" rx="3" fill="#fff"/></svg>`;
lb("lb-lock", up(A.ice.top, 8), `${LOCK}审计后不改`, "lab-ink lab-sm");
lb("lb-sdoc", up(A.aud0.top, 70), "规格 · 威胁模型 · 测试覆盖率", "lab-cs lab-sm");
lb("lb-aud0", up(A.aud0.top, 6), "审计方 A", "lab-g lab-sm", "r");
lb("lb-aud1", up(A.aud1.top, 6), "审计方 B", "lab-g lab-sm", "l");
lb("lb-focus", up(A.dmag.top, 6), "侧重不同", "lab-cs lab-sm");
lb("lb-ct", up(A.ct1.top, 10), "审计竞赛 · 覆盖面广", "lab-cs lab-sm");
lb("lb-fix", up(A.fdoc.top, 140), "修复 → 复审", "lab-r lab-sm");
lb("lb-comp", up(A.comp.top, 10), "编译器版本 · 已知 bug", "lab-r lab-sm");
// 部署
lb("lb-lap", up(A.lap.top, 6), "部署脚本", "lab-cs lab-sm");
lb("lb-rev", [A.lap.top[0] + 40, A.lap.top[1] + 60], "✓ 已评审", "lab-gs lab-sm", "l");
lb("lb-env", up(A.lap.top, 60), `<span id="env-in" class="env"><i>✉</i><span>部署</span><span>初始化</span></span>`, "", "b");
lb("lb-tx", up(A.chn.top, 8), "同一笔交易", "lab-cs lab-sm");
lb("lb-brw", up(A.brw.top, 6), "源码已验证", "lab-gs lab-sm");
lb("lb-dep", up(A.dep.top, 6), "部署账户", "lab-g lab-sm");
lb("lb-roles", up(A.dep.top, 140), `<span class="rl">管理员</span><span class="rl">升级</span><span class="rl">铸币</span>`, "lab-cs lab-sm");
lb("lb-roles-x", up(A.dep.top, 140), `<span class="rl x">管理员</span><span class="rl x">升级</span><span class="rl x">铸币</span>`, "lab-g lab-sm");
lb("lb-msig", up(A.msig.top, 6), "多签", "lab-cs lab-sm");
lb("lb-tlk", up(A.tlk.top, 6), "时间锁", "lab-cs lab-sm", "l");
// 链差异角
lb("lb-eth", [at(L.D_CHAINS[0])[0] - 330, at(L.D_CHAINS[0])[1] - 170], "以太坊 ✓", "lab-gs");
lb("lb-neq", [at(L.D_CHAINS[0])[0] - 190, at(L.D_CHAINS[0])[1] - 170], "≠", "lab-r");
lb("lb-rul", [A.rul.top[0], A.rul.ground[1] + 12], "精度 18 位", "lab-cs lab-sm", "t");
lb("lb-clk", up(A.clk.top, 6), "出块 0.45 秒", "lab-cs lab-sm");
lb("lb-fermi", [A.clk.ground[0], A.clk.ground[1] + 10], "Fermi 升级后", "lab-g lab-sm", "t");
lb("lb-blk", [A.clk.center[0] + 60, A.clk.center[1] - 20], `<span class="blk">区块 N · 10:00:07</span><span class="blk">区块 N+1 · 10:00:07</span>`, "", "l");
lb("lb-rt", up(A.rt.top, 6), "USDT 返回值", "lab-cs lab-sm");
lb("lb-nile", [A.rt.ground[0], A.rt.ground[1] + 10], "Nile · Shasta 实测", "lab-gs lab-sm", "t");
lb("lb-evm", [A.rt.ground[0] - 40, A.rt.ground[1] + 110], `<s>本地 EVM</s> ✕`, "lab-r lab-sm", "t");
lb("lb-mnt", up(A.cn0.top, 6), "MNT · 原生币", "lab-cs lab-sm", "r");
lb("lb-erc", up(A.cn1.top, 6), "ETH · ERC-20", "lab-g lab-sm", "l");
lb("lb-fork", [A.fork.ground[0], A.fork.ground[1] + 10], "主网分叉", "lab-cs lab-sm", "t");
L.D_CHAINS.forEach((o, i) => lb("lb-ok" + i, up(A["ch" + i].top, 6), "✓ 已测", "lab-gs lab-sm"));

// ---------------------------------------------------------------- 屏幕层卡片
const html = [
  evt("ev-vy", `<b>公开报道</b> · 2023 Vyper 编译器事故`),
  ck("ck0", "所有者 = 预期", { x: 90, y: 400, w: 440, kind: "g" }),
  ck("ck1", "费率 = 预期", { x: 90, y: 492, w: 440, kind: "g" }),
  ck("ck2", "预言机地址 = 预期", { x: 90, y: 584, w: 440, kind: "g" }),
  kw("kw-eth", `以太坊测过 <b>≠</b> 目标链能跑`, { x: 90, y: 330, size: 46 }),
].join("");
const css = `
  .env { display: inline-flex; gap: 8px; align-items: center; background: #fff; border: 3px solid #1d93ba; border-radius: 12px; padding: 6px 12px; font: 700 26px "Noto Sans SC", sans-serif; }
  .env i { font-style: normal; color: #1d93ba; font-size: 30px; } .env span { background: #e6f4f9; border-radius: 8px; padding: 2px 10px; color: #1c1c1c; }
  .rl { margin: 0 4px; } .rl.x { text-decoration: line-through; color: #8a8478; }
  .blk { display: block; background: #fff; border: 2px solid #2aa3c9; border-radius: 8px; padding: 2px 12px; margin: 4px 0; font: 700 24px "Noto Sans SC", sans-serif; color: #1c1c1c; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  freeze: w("冻结", 1), hash: w("提交哈希", 1), spec: w("规格", 2), give: w("交给", 2), two: w("两家", 3), side: w("各有侧重", 3),
  contest: w("审计竞赛", 4), wide: w("覆盖面", 4), fix: w("修复", 5), re: w("复审", 5), comp: w("编译器", 6), bug: w("已知", 6), vy: w("Vyper", 6),
  nochg: w("一个字", 7), script: w("脚本", 9), review: w("评审", 9), same: w("同一笔", 10), src: w("验证源码", 11), vscript: w("验证脚本", 11),
  exp: w("预期", 11), hand: w("移交", 12), revoke: w("撤销", 12), target: w("目标链", 13), notmean: w("不代表", 14),
  bsc: w("BSC", 15), p18: w("18", 15), blk: w("0.45", 16), same2: w("一样", 16), ret: w("返回值", 17), nile: w("Nile", 17), local: w("本地", 17),
  mnt: w("MNT", 18), erc: w("ERC", 18), fork: w("主网分叉", 19), run: w("跑一遍", 19),
};
const t = (x) => f(x);
// 世界位移（GSAP x / y，世界画布 px）
const [v0x, v0y] = vcDelta(VC_U[0]), [v1x, v1y] = vcDelta(VC_U[1]), [v2x, v2y] = vcDelta(VC_U[2]);
const [sdx, sdy] = [ (at(L.D_AUDITORS[0])[0] + at(L.D_AUDITORS[1])[0]) / 2 - at(L.D_SPECDOC)[0] - 30, at(L.D_AUDITORS[0])[1] - at(L.D_SPECDOC)[1] + 30 ];
const [mx, my] = dW(L.D_MAG, L.D_FIXDOC);
const keyT = [A.msig.center[0] - A.dkey.center[0], A.msig.center[1] - A.dkey.center[1]];
// 信封标签（反向缩放，屏幕 px）：笔记本顶 → 链顶，deployD 镜头倍率
const kD = L.CAMS.deployD.scale, envD = [(A.chn.top[0] - A.lap.top[0]) * kD, (A.chn.top[1] - A.lap.top[1]) * kD];

S.build({
  cam0: "formalC", sub: "审计冻结一个版本，部署守住这个版本",
  grid: { u0: 6100, u1: 14200, v0: -4200, v1: 4000 }, box: [5400, -4400, 5700, 2900],   // 盖住本段镜头 formalC · auditD · deployD · chainD
  shown: ["#lb-g5", "#lb-proof", "#lb-mlib"], css, html,
  terms: [
    { id: "t0", t: "提交哈希", d: "代码仓库里某一个版本的唯一编号", at: w("提交哈希", 1) },
    { id: "t1", t: "多签", d: "多人里够数的人签名才能执行", at: w("多签", 12) },
    { id: "t2", t: "主网分叉", d: "在本地复制主网状态进行测试", at: w("主网分叉", 19) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 测试做足了，才轮到外部审计。 镜头右移到 auditD，版本卡沿传送带到关口 ⑥ 前
      out("#lb-g5, #lb-proof, #lb-mlib", ${t(LS[0] - 0.1)});
      cam(${t(LS[0])}, "auditD", 1.8, "power2.inOut");
      pop("#lb-g6", ${t(LS[0] + 1.9)});
      tl.to("#vc-mv", { x: ${f(v0x)}, y: ${f(v0y)}, duration: 2.2, ease: "power1.inOut" }, ${t(LS[0] + 0.1)});
      // ===== L1 冻结代码，对象是提交哈希
      fadeIn("#icard-v", ${t(TM.freeze - 0.3)}, 0.3); X5.freeze(tl, "ice", ${t(TM.freeze)}, 1.0, "up");
      pop("#lb-hash", ${t(TM.hash)}); bump("#vc-mv", ${t(TM.hash)}, 1.05);
      // ===== L2 规格、威胁模型、测试覆盖率交给审计方
      pop("#lb-aud0", ${t(LS[2])}); pop("#lb-aud1", ${t(LS[2] + 0.15)});
      tl.to("#sdoc-mv", { x: ${f(sdx)}, y: ${f(sdy)}, duration: 0.9, ease: "power2.inOut" }, ${t(TM.give - 0.6)});
      pop("#lb-sdoc", ${t(TM.spec)});
      // ===== L3 两家以上审计，各有侧重
      out("#lb-sdoc", ${t(LS[3] - 0.2)});
      fadeIn("#dmag-mv", ${t(TM.two)}, 0.3); bump("#aud0, #aud1", ${t(TM.two)}, 1.08);
      pop("#lb-focus", ${t(TM.side)});
      // ===== L4 审计竞赛
      out("#lb-focus, #lb-aud0, #lb-aud1", ${t(LS[4] - 0.2)});
      grow("c4", ${t(LS[4] + 0.2)}); [0, 1, 2, 3].forEach((i) => grow("ct" + i, ${t(TM.contest - 0.3)} + i * 0.15));
      pop("#lb-ct", ${t(TM.wide)});
      // ===== L5 修完要复审：放大镜移到修复单
      out("#lb-ct", ${t(LS[5] - 0.2)});
      fadeIn("#patch", ${t(TM.fix)}, 0.3);
      tl.to("#dmag-mv", { x: ${f(mx)}, y: ${f(my)}, duration: 1.0, ease: "power2.inOut" }, ${t(TM.fix + 0.4)});
      pop("#lb-fix", ${t(TM.re)});
      // ===== L6 编译器版本，已知 bug
      out("#lb-fix", ${t(LS[6] - 0.2)});
      X3.book(tl, "comp", ${t(TM.comp)}, 150, 0.8); pop("#lb-comp", ${t(TM.bug)});
      pop("#ev-vy", ${t(TM.vy - 0.6)}); out("#ev-vy", ${t(LS[7] + 1.2)});
      // ===== L7 审计后不改；关口 ⑥ 抬杆，版本卡通过
      out("#lb-comp, #lb-hash", ${t(LS[7] - 0.2)}); out("#dmag-mv", ${t(LS[7] - 0.2)});
      pop("#lb-lock", ${t(TM.nochg)}); bump("#lb-lock", ${t(TM.nochg + 0.6)}, 1.1);
      KIT.arm(tl, "gate6", ${t(LE[7] - 1.6)}, true);
      tl.to("#vc-mv", { x: ${f(v1x)}, y: ${f(v1y)}, duration: 1.2, ease: "power1.inOut" }, ${t(LE[7] - 1.1)});
      fadeIn("#vd5", ${t(LE[7] - 0.6)}, 0.2);
      // ===== L8 接着是部署
      out("#lb-lock, #lb-g6", ${t(LS[8] - 0.2)}); pop("#lb-g7", ${t(LS[8] + 1.4)});
      cam(${t(LS[8])}, "deployD", 1.4, "power2.inOut");
      // ===== L9 脚本部署，脚本要评审
      pop("#lb-lap", ${t(TM.script)}); bump("#lap", ${t(TM.script + 0.2)}, 1.05); pop("#lb-rev", ${t(TM.review)});
      // ===== L10 部署和初始化同一笔交易
      out("#lb-lap", ${t(LS[10] - 0.2)}); pop("#lb-env", ${t(LS[10])});
      tl.to("#env-in", { x: ${f(envD[0])}, y: ${f(envD[1])}, duration: 1.1, ease: "power2.inOut" }, ${t(TM.same - 0.3)});
      out("#lb-env", ${t(TM.same + 0.9)}); flash("#chn-b2", ${t(TM.same + 0.9)}, 2, 0.4); pop("#lb-tx", ${t(TM.same + 1.0)});
      // ===== L11 验证源码 + 验证脚本对比参数
      out("#lb-tx, #lb-rev", ${t(LS[11] - 0.2)});
      KIT.swap(tl, "#brw-page", "#brw-page2", ${t(TM.src)}, 0.35); pop("#lb-brw", ${t(TM.src + 0.3)});
      [0, 1, 2].forEach((i) => pop("#ck" + i, ${t(TM.vscript)} + i * 0.35, 0.3));
      // ===== L12 关键画面：钥匙进多签，时间锁扣上，角色划掉，关口 ⑦ 抬杆
      out("#ck0, #ck1, #ck2, #lb-brw, #lb-g7", ${t(LS[12] - 0.2)});
      pop("#lb-dep", ${t(LS[12])}); pop("#lb-roles", ${t(LS[12] + 0.2)});
      tl.to("#dkey-mv", { x: ${f(keyT[0])}, y: ${f(keyT[1])}, duration: 1.0, ease: "power2.inOut" }, ${t(TM.hand)});
      out("#dkey-mv", ${t(TM.hand + 1.0)}, 0.2); pop("#lb-msig", ${t(TM.hand + 0.8)});
      X1.unlock(tl, "tlk", ${t(TM.hand + 1.3)}, false, 0.4); pop("#lb-tlk", ${t(TM.hand + 1.4)});
      out("#lb-roles", ${t(TM.revoke)}); pop("#lb-roles-x", ${t(TM.revoke + 0.3)});
      KIT.arm(tl, "gate7", ${t(TM.revoke + 0.6)}, true);
      tl.to("#vc-mv", { x: ${f(v2x)}, y: ${f(v2y)}, duration: 1.2, ease: "power1.inOut" }, ${t(TM.revoke + 1.0)});
      fadeIn("#vd6", ${t(TM.revoke + 1.6)}, 0.2);
      // ===== L13 在目标链上测：镜头到 chainD，三块链牌立起
      out("#lb-dep, #lb-roles-x, #lb-msig, #lb-tlk", ${t(LS[13] - 0.2)});
      cam(${t(LS[13])}, "chainD", 1.4, "power2.inOut");
      [0, 1, 2].forEach((i) => grow("ch" + i, ${t(TM.target)} + i * 0.25));
      // ===== L14 以太坊测过 ≠ 目标链能跑
      pop("#lb-eth", ${t(LS[14])}); pop("#lb-neq", ${t(TM.notmean)}); pop("#kw-eth", ${t(TM.notmean)});
      // ===== L15 BSC-USD 精度 18 位
      out("#lb-eth, #lb-neq, #kw-eth", ${t(LS[15] - 0.2)});
      fadeIn("#rul-v", ${t(TM.bsc)}, 0.4); X6.slider(tl, "rul", ${t(TM.bsc + 0.5)}, 12, 1.0); pop("#lb-rul", ${t(TM.p18)}); bump("#ch0", ${t(TM.bsc)}, 1.06);
      // ===== L16 出块 0.45 秒，相邻时间戳可能一样
      fadeIn("#clk-v", ${t(LS[16])}, 0.3); KIT.clock(tl, "clk", ${t(LS[16] + 0.3)}, 1.0, 1);
      pop("#lb-clk", ${t(TM.blk)}); pop("#lb-fermi", ${t(TM.blk + 0.5)}); pop("#lb-blk", ${t(TM.same2 - 0.8)});
      // ===== L17 TRON：USDT 返回值，Nile / Shasta 实测
      out("#lb-clk, #lb-fermi, #lb-blk", ${t(LS[17] - 0.2)});
      fadeIn("#rt-v", ${t(TM.ret - 0.2)}, 0.2); X7.tagPop(tl, "rt", ${t(TM.ret - 0.2)}); pop("#lb-rt", ${t(TM.ret)}); bump("#ch1", ${t(LS[17])}, 1.06);
      pop("#lb-nile", ${t(TM.nile)}); pop("#lb-evm", ${t(TM.local)});
      // ===== L18 Mantle：MNT 原生币，ETH 是 ERC-20
      out("#lb-rt, #lb-nile, #lb-evm", ${t(LS[18] - 0.2)});
      bump("#ch2", ${t(LS[18])}, 1.06);
      fadeIn("#cn0-v", ${t(TM.mnt - 0.3)}, 0.3); pop("#lb-mnt", ${t(TM.mnt)});
      fadeIn("#cn1-v", ${t(TM.erc - 0.6)}, 0.3); pop("#lb-erc", ${t(TM.erc)});
      // ===== L19 测试网 / 主网分叉上跑完整测试
      out("#lb-mnt, #lb-erc, #lb-rul", ${t(LS[19] - 0.2)});
      fadeIn("#fork-v", ${t(TM.fork - 0.5)}, 0.3); X16.flip(tl, "fork", ${t(TM.fork)}, false, 0.9); pop("#lb-fork", ${t(TM.fork + 0.3)});
      [0, 1, 2].forEach((i) => pop("#lb-ok" + i, ${t(TM.run)} + i * 0.25));
`,
});
