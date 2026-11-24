// seg5b「⑤ 守住余数 · 今天能做什么」— 生成 compositions/story.html，并把最后一条字幕延到段尾
// 运行：node src/build-story.mjs
// 一个连续的等距世界 + 一台镜头：
//   上方：钩子场景（seg1 右区：Balancer 稳定池 + 批量交换分拣机 + 取整刀，坐标见 hook.mjs）；
//   下方一排四个角色（写合约的人 / 审计的人 / 做测试的人 / 普通用户），各自走到自己的小场景做一件事；
//   普通用户再走到跨链桥核对精度；镜头回到钩子场景给出答案；最后结束卡（最后 2.5 秒完全静止）。
import fs from "node:fs";
import { G, at, f, camAt, worldSvg, gridSvg, wlab, wpin, kitCss, runtimeJs, CHECK, BADGE } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt as WA, lineAt } from "../../../kit/timing.mjs";
import * as HK from "./hook.mjs";

const TM = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = TM.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const SEG = SCRIPT.segments.find((s) => s.id === "seg5b");
const w = (s, o) => WA(TM, s, o).start;
const L = (i) => lineAt(TM, i);

// ------------------------------------------------------------------ helpers
const items = [], overlay = [], A = {};
const add = (fn, o, opts, extraY = 0) => { const r = fn(o, opts); items.push({ Y: at(o)[1] + extraY, svg: r.svg }); A[opts.id] = r.anchors; return r; };
const up = (p, d) => [p[0], p[1] - d];

// ------------------------------------------------------------------ 上方：钩子场景
HK.build({ add, items, A });
overlay.push(HK.txWire(A));

// ------------------------------------------------------------------ 一排四个角色（在钩子场景前方）
const ROLES = [
  { name: "写合约的人", role: "engineer", color: "#2a9fc6" },
  { name: "审计的人", role: "signer", color: "#3b3e44" },
  { name: "做测试的人", role: "signer", color: "#5b6b7d" },
  { name: "普通用户", role: "signer", color: "#7a6a58" },
];
const PS = 1.9;                                           // 人物约 400 世界单位高
const LX = (i) => 1720 + 400 * i, LY = 720;
const ZY = 2150;
const ZP = [[-1500, ZY], [700, ZY], at(HK.CUTTER, -470, 40), [3000, ZY], (() => { const nb = at(HK.BRIDGE_ZONE, -350, 0); return [nb[0] - 470, nb[1] + 140]; })()];
const MOVE = ROLES.map((_, i) => [f(ZP[i][0] - LX(i)), f(ZP[i][1] - LY)]);
const MOVE5 = [f(ZP[4][0] - LX(3)), f(ZP[4][1] - LY)];
ROLES.forEach((r, i) => add(O.person, G(LX(i), LY), { id: `p${i}`, role: r.role, color: r.color, scale: PS }, (i === 3 ? ZP[4][1] : ZP[i][1]) - LY + 30));

// ------------------------------------------------------------------ zone 1 · 写合约的人：工位上的合约代码 + 放大镜
const Z1 = ZP[0];
const scr1 = `<rect x="0" y="0" width="148" height="88" fill="#ffffff"/><rect x="0" y="0" width="148" height="14" fill="#ece7dd"/>` +
  [0, 1, 2, 3].map((i) => `<rect x="8" y="${22 + i * 16}" width="${[96, 120, 84, 108][i]}" height="6" rx="3" fill="#c9c3b7"/><text x="${[60, 92, 54, 80][i]}" y="${29 + i * 16}" font-family="JetBrains Mono, monospace" font-size="13" font-weight="800" fill="#1d93ba">/</text>`).join("");
add(O.desk, G(Z1[0] + 430, Z1[1] - 60), { id: "d1", screen: scr1 });
{ const r = O.magnifier(G(Z1[0] + 560, Z1[1] + 60), { id: "m1", z: 150 }); overlay.push(`<g id="m1w" opacity="0">${r.svg}</g>`); A.m1 = r.anchors; }

// ------------------------------------------------------------------ zone 2 · 审计的人：四个抽屉 = 四类不受检查的位置
const Z2 = ZP[1];
const AUD = ["unchecked 块", "类型转换", "内联汇编", "移位"];
add(E3.slotCabinet, G(Z2[0] + 500, Z2[1] - 60), { id: "cb", n: 4, dh: 70, labels: ["4", "3", "2", "1"], title: "审计",
  fill: { 0: [{ bytes: 32, color: "gray" }], 1: [{ bytes: 24, color: "ink" }], 2: [{ bytes: 16, color: "teal" }, { bytes: 16, color: "gray" }], 3: [{ bytes: 32, color: "teal" }] } });

// ------------------------------------------------------------------ zone 3 · 做测试的人：取整刀重复 1000 次 + 计数器
const Z3 = ZP[2];
// 取整台（rc）和它身后的计数器（ct）来自 hook.mjs（seg1 的 CUTTER / CUT_CTR）

// ------------------------------------------------------------------ zone 4 · 普通用户：一个空的新金库 + 出票机
const Z4 = ZP[3];
const VO = G(Z4[0] + 720, Z4[1] - 150);
add(O.safe, VO, { id: "nv", gold: false, plate: "新金库" });
add(X.shareDispenser, X.besideSafe(VO), { id: "nd", value: 0, tickets: 1 }, 1);

// ------------------------------------------------------------------ zone 5 · 跨链桥两端两把精度尺
const Z5 = ZP[4];
const BO = HK.BRIDGE_ZONE;
add(E1.bridge, BO, { id: "br" });
const nb = A.br.nearRoad, fb = A.br.farBank;
add(X.decimalRuler, G(nb[0] - 40, nb[1] + 170), { id: "r6", places: 6, chain: "ETH", scale: 1.15 }, 300);
add(X.decimalRuler, G(fb[0] - 60, fb[1] + 190), { id: "r18", places: 18, chain: "BSC", scale: 1.15 }, 300);
{ const r = O.magnifier(G(nb[0] - 100, nb[1] + 330), { id: "m5", z: 160 }); overlay.push(`<g id="m5w" opacity="0">${r.svg}</g>`); A.m5 = r.anchors; }
const M5DU = (() => { const a = G(nb[0] - 100, nb[1] + 330), b = G(fb[0] - 330, fb[1] + 330); return [f(b.u - a.u), f(b.v - a.v)]; })();

// ------------------------------------------------------------------ labels (world, counter-scaled)
let LB = "";
const lab = (id, p, html, cls = "", anchor = "b") => { LB += wlab(id, p, html, cls + " hide", anchor); };
ROLES.forEach((r, i) => { lab(`lp${i}`, up(A[`p${i}`].top, 6), r.name, "lab-g"); lab(`lpa${i}`, up(A[`p${i}`].top, 6), r.name, "lab-ink"); });
// zone 3
lab("z3-n", up(A.ct.top, 8), "重复 1000 次", "");
lab("z3-L", A.rc.trayL, "→ 协议", "lab-gs", "t");
lab("z3-R", A.rc.trayR, "调用者 · 空", "lab-g", "t");
// zone 4
lab("z4-v", up(A.nv.top, 6), "新金库 · 几乎为空", "lab-g");
lab("z4-u", [(A.p3.top[0] + MOVE[3][0] + A.nd.slot[0]) / 2 + 10, A.p3.top[1] + MOVE[3][1] + 170], "别当第一个存款人", "lab-cs", "c");
// zone 5
lab("z5-6", [A.r6.head[0], A.r6.head[1] - 60], "以太坊 · USDT · 6 位", "", "b");
lab("z5-18", [A.r18.head[0], A.r18.head[1] - 60], "BNB Chain · BSC-USD · 18 位", "", "b");
lab("z5-ok", [A.r18.ground[0] + 120, A.r18.ground[1] + 50], "同一代币 · 精度不同 · 先核对", "lab-gs", "t");
// hook
lab("h-pool", up(A.hp.top, 4), "Balancer V2 · 稳定池", "");
lab("h-L", [A.hc.trayL[0] - 14, A.hc.trayL[1] + 6], "协议", "lab-cs", "r");
lab("h-R", [A.hc.trayR[0] + 14, A.hc.trayR[1] + 6], "调用者", "lab-rs", "l");
lab("h-R0", [A.hc.trayR[0] + 14, A.hc.trayR[1] + 6], "调用者 · 空", "lab-g", "l");
lab("h-tx", up(A.htx.fl, 10), "一笔交易", "lab-cs");
LB += wpin("h-ok", [A.hc.trayR[0] + 60, A.hc.trayR[1] - 60], CHECK("h-okb", 56, "hide"), "c");
LB += wpin("z4-x", [A.nd.slot[0] - 30, A.nd.slot[1] - 40], BADGE("z4-xb", 64, "hide"), "c");

// ------------------------------------------------------------------ cameras
const fit = (Pts, x0, y0, x1, y1) => {
  const xs = Pts.map((p) => p[0]), ys = Pts.map((p) => p[1]);
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  const k = Math.min((x1 - x0) / (bx1 - bx0), (y1 - y0) / (by1 - by0));
  return camAt([(bx0 + bx1) / 2, (by0 + by1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};
const hookPts = HK.hookPts(A), panoPts = HK.panoPts(A);
const pTop = (i) => A[`p${i}`].top, pGr = (i) => A[`p${i}`].ground;
const CS = fit(hookPts, 260, 150, 1660, 860);
const C0 = fit([...panoPts, up(pTop(0), 60), up(pTop(3), 60), pGr(0), pGr(3)], 200, 120, 1720, 880);
const zc = (Z, sx, k, sy = 800) => camAt([Z[0], Z[1]], sx, sy, k);
const CZ1 = zc(Z1, 260, 0.82), CZ2 = zc(Z2, 260, 0.8), CZ3 = zc(Z3, 330, 1.05, 840), CZ4 = zc(Z4, 300, 0.8, 820);
const p3at = (k) => [A.p3[k][0] + MOVE5[0], A.p3[k][1] + MOVE5[1]];
const CZ5 = fit([p3at("top"), p3at("ground"), A.r6.top, A.r6.ground, A.r18.top, A.r18.ground, A.r18.cells[A.r18.cells.length - 1], A.br.top, up(A.r18.head, 120)], 120, 170, 1760, 880);
const CH = fit(hookPts, 110, 200, 1250, 880);
const CH2 = camAt(A.hc.center, 600, 600, 1.55);
const CEND = CH;
const CAMS = { CS, C0, CZ1, CZ2, CZ3, CZ4, CZ5, CH, CH2, CEND };

// ------------------------------------------------------------------ assemble world
const srt = (arr) => arr.slice().sort((a, b) => a.Y - b.Y).map((b) => b.svg).join("\n");
const world = worldSvg("wsvg", gridSvg({ u0: -9000, u1: 12000, v0: -6000, v1: 12000 }) + srt(items) + overlay.join(""), [-3500, -2200, 12000, 5800]);

const D = (o) => JSON.stringify(o);
const T = {
  each: w("每个人"),
  l1: L(1).start, div: w("每一处除法"), rem1: w("余数归谁"),
  l2: L(2).start, a0: w("unchecked"), a1: w("类型转换"), a2: w("内联汇编"), a3: w("移位"),
  l3: L(3).start, rep: w("重复", { line: 3 }), k1000: w("1000"), flow: w("流向谁"),
  l4: L(4).start, first: w("第一个存款人"),
  l5: L(5).start, chk: w("核对份额"), zero: w("0", { line: 5 }), stop: w("立刻停下"),
  l6: L(6).start, two: w("两条链"), prec: w("精度", { line: 6 }), l6e: L(6).end,
  l7: L(7).start, back: w("回到开头"), tiny: w("只错一点点"), usd: w("9480"),
  l8: L(8).start, wrong: w("给错了人"), tx: w("一笔交易"), many: w("很多次"),
  l9: L(9).start, rev: w("反过来"), always: w("始终归协议"), anyn: w("重复多少次"), nomoney: w("抠不出钱"),
  l10: L(10).start, next: w("下一集"),
};

// zone 1 code card（示例）
const codeRows = [
  ["shares = assets * supply ", "/", " total;", "↓ 少给"],
  ["fee    = amount * bps ", "/", " 10000;", "↑ 多收"],
  ["owed   = debt * rate ", "/", " RAY;", "↑ 多收"],
];
const c1Html = `<div class="k-code" id="c1"><div class="c-head">合约里的每一处除法<span class="c-tag">示例</span></div>
  ${codeRows.map(([a, s, b, d], i) => `<div class="c-row cr" id="c1r${i}">${a}<span class="sl"><span class="ring hide" id="c1o${i}"></span>${s}</span>${b}<span class="rt hide" id="c1t${i}">余数 → 协议 <b>${d}</b></span></div>`).join("")}
</div>`;
// zone 2 checklist card
const c2Html = `<div class="k-code" id="c2"><div class="c-head">审计 · 0.8 默认检查管不到的地方</div>
  ${AUD.map((n, i) => `<div class="ck-r" id="c2r${i}"><span class="box"><span class="tk hide" id="c2t${i}">✓</span></span><span class="mono2">${n}</span><span class="ck-n hide" id="c2n${i}">逐个检查</span></div>`).join("")}
</div>`;
// zone 3 error-flow card（示例）
const c3Html = `<div class="k-code" id="c3"><div class="c-head">误差流向谁<span class="c-tag">示例</span></div>
  <div class="fl-r"><span class="fl-n">协议</span><span class="fl-bar"><span class="fl-fill" id="c3b"></span></span><span class="fl-v g" id="c3v">+余数</span></div>
  <div class="fl-r"><span class="fl-n">调用者</span><span class="fl-bar"></span><span class="fl-v">0</span></div>
  <div class="fl-ok hide" id="c3ok">✓ 余数归协议</div>
</div>`;
// zone 4 share-check card
const c4Html = `<div class="k-code" id="c4"><div class="c-head">存入后 · 核对到手份额</div>
  <div class="sh-r"><span>存入</span><b class="mono2">9999 USDC</b></div>
  <div class="sh-r"><span>到手份额</span><b class="mono2 red" id="c4z">0</b></div>
  <div class="sh-stop hide" id="c4s">0 或明显偏少 → 立刻停下</div>
  <div class="c-foot">数字为示例</div>
</div>`;

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #sec { position: absolute; left: 56px; top: 32px; }
    .mono2 { font-family: "JetBrains Mono", monospace; }
    #c1 { left: 860px; top: 150px; width: 1000px; }
    .cr { display: flex; align-items: center; height: 76px !important; line-height: 76px !important; font-size: 32px !important; }
    .sl { position: relative; display: inline-block; color: #1d93ba; font-weight: 800; }
    .ring { position: absolute; left: 50%; top: 50%; width: 52px; height: 52px; margin: -27px 0 0 -26px; border: 4px solid #2aa3c9; border-radius: 50%; }
    .rt { margin-left: auto; font-family: "Noto Sans SC", sans-serif; font-size: 30px; font-weight: 800; color: #fff; background: #1f9d55; border-radius: 10px; padding: 0 14px; line-height: 50px; }
    .rt b { font-weight: 900; }
    #c2 { left: 980px; top: 150px; width: 860px; }
    .ck-r { display: flex; align-items: center; gap: 22px; height: 78px; font-size: 34px; font-weight: 800; border-bottom: 1px dashed #e6e0d4; white-space: nowrap; }
    .box { width: 50px; height: 50px; border: 4px solid #2aa3c9; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex: none; }
    .tk { width: 50px; height: 50px; border-radius: 8px; background: #1f9d55; color: #fff; font-size: 36px; font-weight: 900; line-height: 50px; text-align: center; }
    .ck-n { margin-left: auto; font-size: 30px; color: #17809f; }
    #c3 { left: 1100px; top: 170px; width: 740px; }
    .fl-r { display: flex; align-items: center; gap: 18px; height: 76px; font-size: 34px; font-weight: 800; white-space: nowrap; }
    .fl-n { width: 120px; }
    .fl-bar { flex: 1; height: 28px; border-radius: 14px; background: #f1ede5; overflow: hidden; }
    .fl-fill { display: block; width: 100%; height: 100%; background: #1d93ba; border-radius: 14px; transform-origin: 0 50%; transform: scaleX(0); }
    .fl-v { width: 130px; text-align: right; color: #6d685e; }
    .fl-v.g { color: #1d93ba; }
    .fl-ok { margin-top: 12px; display: inline-block; font-size: 34px; font-weight: 900; color: #fff; background: #1f9d55; border-radius: 12px; padding: 4px 18px 6px; }
    #c4 { left: 1080px; top: 160px; width: 760px; }
    .sh-r { display: flex; align-items: center; justify-content: space-between; height: 80px; font-size: 36px; font-weight: 800; border-bottom: 1px dashed #e6e0d4; }
    .sh-r b { font-size: 44px; }
    .sh-r .red { color: #e0453a; font-size: 64px; }
    .sh-stop { margin-top: 18px; display: inline-block; font-size: 36px; font-weight: 900; color: #fff; background: #e0453a; border-radius: 12px; padding: 6px 20px 8px; white-space: nowrap; }
    .c-foot { margin-top: 14px; font-size: 28px; font-weight: 700; color: #8a8478; }
    #ev { position: absolute; left: 1290px; top: 150px; width: 560px; background: #fffdf8; border-radius: 18px; padding: 20px 28px 22px; box-shadow: 0 12px 26px rgba(70,60,40,0.13); border-left: 10px solid #e0453a; }
    #ev .e1 { font-size: 30px; font-weight: 800; color: #6d685e; white-space: nowrap; }
    #ev .e2 { margin-top: 6px; font-size: 56px; font-weight: 900; color: #e0453a; white-space: nowrap; }
    #ev .e3 { margin-top: 10px; display: flex; gap: 10px; }
    .gt { font-size: 28px; font-weight: 700; color: #5f5a50; border: 2px solid #cfc7b8; border-radius: 8px; padding: 1px 10px 3px; white-space: nowrap; background: #fff; }
    #qq { position: absolute; left: 1290px; top: 470px; width: 560px; display: flex; align-items: center; gap: 18px; background: #fffdf8; border: 3px solid #2aa3c9; border-radius: 18px; padding: 14px 22px; box-shadow: 0 12px 26px rgba(70,60,40,0.12); }
    .qmark { width: 60px; height: 60px; border-radius: 50%; background: #1d93ba; color: #fff; font-size: 44px; font-weight: 900; line-height: 60px; text-align: center; flex: none; }
    .qtxt { font-size: 36px; font-weight: 900; line-height: 1.3; white-space: nowrap; }
    .qtxt .r { color: #e0453a; }
    #ans { position: absolute; left: 1290px; top: 470px; width: 560px; background: #fffdf8; border-radius: 18px; padding: 16px 24px 18px; box-shadow: 0 12px 26px rgba(70,60,40,0.12); border-left: 10px solid #e0453a; }
    #ans2 { position: absolute; left: 1290px; top: 470px; width: 560px; background: #fffdf8; border-radius: 18px; padding: 16px 24px 18px; box-shadow: 0 12px 26px rgba(70,60,40,0.12); border-left: 10px solid #1f9d55; }
    .gt-r { position: absolute; right: 16px; top: 14px; }
    .an { font-size: 36px; font-weight: 900; line-height: 1.45; white-space: nowrap; }
    .an .r { color: #e0453a; } .an .g { color: #1f9d55; } .an .b { color: #1d93ba; }
    #veil { position: absolute; inset: 0; background: #efebe3; opacity: 0; }
    #endcard { position: absolute; left: 160px; top: 200px; width: 1600px; background: #fffdf8; border-radius: 28px; box-shadow: 0 18px 40px rgba(70, 60, 40, 0.14);
      text-align: center; padding: 50px 40px 54px; opacity: 0; }
    #endcard .e-ch { font-size: 40px; font-weight: 900; color: #1d93ba; letter-spacing: 0.04em; }
    #endcard .e-main { margin-top: 0; font-size: 76px; font-weight: 900; line-height: 1.15; white-space: nowrap; color: #1c1c1c; }
    #endcard .e-rule { width: 120px; height: 6px; border-radius: 3px; background: #2aa3c9; margin: 32px auto 28px; }
    #endcard .e-next { margin-top: 18px; font-size: 36px; font-weight: 700; color: #3b3e44; white-space: nowrap; }
    #endcard .e-note { font-size: 40px; font-weight: 900; color: #1d93ba; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${LB}</div>
      </div>
      <div class="hide" id="c1w">${c1Html}</div>
      <div class="hide" id="c2w">${c2Html}</div>
      <div class="hide" id="c3w">${c3Html}</div>
      <div class="hide" id="c4w">${c4Html}</div>
      <div id="ev" class="hide"><div class="e1">2025 年 11 月 · Balancer V2</div><div class="e2">约 9480 万美元</div><div class="e3"><span class="gt">Balancer 官方复盘</span><span class="gt">事发时估值</span></div></div>
      <div id="qq" class="hide"><div class="qmark">?</div><div class="qtxt">1 粒余数 → <span class="r">约 9480 万</span></div></div>
      <div id="ans" class="hide"><span class="gt gt-r">解读</span><div class="an">余数 → <span class="r">调用者</span><br>× 一笔交易里很多次</div></div>
      <div id="ans2" class="hide"><span class="gt gt-r">解读</span><div class="an">余数 → <span class="b">协议</span><br>重复多少次 · <span class="g">抠不出钱</span></div></div>
      <div id="sec"><div class="lab lab-ink hide" id="sec-l">${SEG.chapter}</div></div>
      ${pills(5, { sections: SCRIPT.sections })}
      <div id="veil"></div>
      <div id="endcard">
        <div class="e-main">${SCRIPT.title}</div>
        <div class="e-rule"></div>
        <div class="e-note" id="e-note">余数归协议 · 重复多少次也抠不出钱</div>
        <div class="e-next" id="e-next">下一集 · 外部调用与代币兼容性</div>
      </div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E2.runtimeExtJs()}
${E3.runtimeExtJs()}
${X.runtimeExtJs()}
  (function () {
    const C = ${D(CAMS)};
    const MV = ${D(MOVE)}, MV5 = ${D(MOVE5)}, M5DU = ${D(M5DU)};
    const T = ${D(T)};
    const TOTAL = ${TOTAL};
    const K6 = window.KITX06, K3 = window.KITX03;
    const tl = gsap.timeline({ paused: true });
    const pop = (sel, t) => KIT.pop(tl, sel, t);
    const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.25, ease: "power2.in" }, t);
    const fin = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.3, ease: "power2.out", immediateRender: false }, t);
    const walk = (ids, t, dx, dy, dur) => tl.to(ids, { x: dx, y: dy, duration: dur || 1.2, ease: "power2.inOut" }, t);
    KIT.camSet(tl, C.CS);
    ["p0", "p1", "p2", "p3"].forEach(function (id, i) { const el = document.getElementById(id); tl.set("#" + id, { scaleY: 0, svgOrigin: el.getAttribute("data-ox") + " " + el.getAttribute("data-oy") }, 0); KIT.grow(tl, id, 1.0 + i * 0.12); });
    K6.pile(tl, "hc", "R", 0, 3);

    // ---------------- 段首小标签；L0 · 每人一件事（钩子场景缩到上方，下方一排四个人）
    pop("#sec-l", 0.15);
    pop("#h-pool", 0.3);
    KIT.cam(tl, 0.5, C.C0, 1.3);
    [0, 1, 2, 3].forEach(function (i) { pop("#lp" + i, T.each + 0.1 + i * 0.15); });
    out("#h-pool", T.l1 - 0.4, 0.2);

    // ---------------- L1 · 写合约的人：找出每一处除法，写下余数归谁
    const t1 = T.l1 - 0.4;
    KIT.cam(tl, t1, C.CZ1, 1.3);
    walk("#p0, #lp0-pin, #lpa0-pin", t1, MV[0][0], MV[0][1], 1.3);
    out("#sec-l, #lp1, #lp2, #lp3", t1, 0.25);
    tl.to("#lp0", { opacity: 0, duration: 0.15 }, T.l1 + 0.4); pop("#lpa0", T.l1 + 0.4);
    fin("#c1w", T.l1 + 0.5, 0.3); tl.fromTo("#c1", { y: 24 }, { y: 0, duration: 0.5, ease: "power3.out", immediateRender: false }, T.l1 + 0.5);
    fin("#m1w", T.div - 0.2, 0.3);
    for (let i = 0; i < 3; i++) {
      const ti = T.div + 0.1 + i * 0.45;
      pop("#c1o" + i, ti);
      tl.fromTo("#c1r" + i, { backgroundColor: "rgba(42,163,201,0)" }, { backgroundColor: "rgba(42,163,201,0.10)", duration: 0.2, immediateRender: false }, ti);
      pop("#c1t" + i, T.rem1 - 0.5 + i * 0.25);
    }
    K6.carry(tl, "m1w", T.div, 40, -40, 0, 0.6);
    K6.carry(tl, "m1w", T.div + 0.8, -20, 20, 0, 0.6);

    // ---------------- L2 · 审计的人：四个抽屉依次拉开检查
    const t2 = T.l2 - 0.4;
    KIT.cam(tl, t2, C.CZ2, 1.3);
    walk("#p1, #lp1-pin, #lpa1-pin", t2, MV[1][0], MV[1][1], 1.3);
    out("#c1w, #lpa0, #m1w", T.l2 + 0.3, 0.3);
    tl.to("#lp1", { opacity: 0, duration: 0.15 }, T.l2 + 0.4); pop("#lpa1", T.l2 + 0.4);
    fin("#c2w", T.l2 + 0.3, 0.3);
    const ta = [T.a0, T.a1, T.a2, T.a3];
    ta.forEach(function (t, k) {
      const i = 3 - k;                                   // 最上面的抽屉 = 第 1 项
      K3.drawer(tl, "cb", i, t - 0.1, true, 0.45);
      K3.mark(tl, "cb", i, t, "teal");
      fin("#c2n" + k, t, 0.2);
      tl.fromTo("#c2r" + k, { backgroundColor: "rgba(42,163,201,0)" }, { backgroundColor: "rgba(42,163,201,0.10)", duration: 0.2, immediateRender: false }, t);
      pop("#c2t" + k, t + 0.55);
      K3.mark(tl, "cb", i, t + 0.55, "green");
      K3.drawer(tl, "cb", i, t + 0.75, false, 0.4);
    });

    // ---------------- L3 · 做测试的人：同一操作重复 1000 次，看误差流向谁
    const t3 = T.l3 - 0.4;
    KIT.cam(tl, t3, C.CZ3, 1.3);
    walk("#p2, #lp2-pin, #lpa2-pin", t3, MV[2][0], MV[2][1], 1.3);
    out("#c2w, #lpa1", T.l3 + 0.3, 0.3);
    tl.to("#lp2", { opacity: 0, duration: 0.15 }, T.l3 + 0.4); pop("#lpa2", T.l3 + 0.4);
    K6.feed(tl, "rc", T.l3 + 0.2, 0.5);
    K6.cut(tl, "rc", T.rep - 0.2, "L");
    K6.chipReset(tl, "rc", T.rep + 0.75);
    K6.cut(tl, "rc", T.rep + 0.8, "L");
    pop("#z3-n", T.rep);
    KIT.count(tl, "ct", T.rep, T.flow - T.rep + 0.3, 0, 1000, "power2.in");
    for (let n = 3; n <= 9; n++) K6.pile(tl, "rc", "L", T.rep + 1.6 + (n - 3) * 0.22, n);
    fin("#c3w", T.rep - 0.2, 0.3);
    tl.fromTo("#c3b", { scaleX: 0 }, { scaleX: 1, duration: T.flow - T.rep + 0.3, ease: "power2.in", immediateRender: false }, T.rep);
    pop("#c3ok", T.flow - 0.2);
    pop("#z3-L", T.flow);
    pop("#z3-R", T.flow + 0.3);

    // ---------------- L4 · 普通用户：别当新金库的第一个存款人
    const t4 = T.l4 - 0.4;
    KIT.cam(tl, t4, C.CZ4, 1.3);
    walk("#p3, #lp3-pin, #lpa3-pin", t4, MV[3][0], MV[3][1], 1.3);
    out("#lpa2, #z3-n, #z3-L, #z3-R", t4, 0.3);
    out("#c3w", T.l4 + 0.7, 0.3);
    tl.to("#lp3", { opacity: 0, duration: 0.15 }, T.l4 + 0.4); pop("#lpa3", T.l4 + 0.4);
    KIT.door(tl, "nv", T.l4 + 0.4, 105, 1.0);
    pop("#z4-v", T.l4 + 0.9);
    pop("#z4-u", T.first);

    // ---------------- L5 · 存入后马上核对份额：0 → 立刻停下
    out("#z4-u", T.l5 - 0.2, 0.2);
    walk("#p3, #lp3-pin, #lpa3-pin", T.l5 - 0.2, MV[3][0] + 260, MV[3][1] - 40, 0.8);
    K6.issue(tl, "nd", T.l5 + 0.6, 0);
    fin("#c4w", T.chk - 0.1, 0.3);
    tl.fromTo("#c4z", { scale: 1.6, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.4, ease: "back.out(2)", immediateRender: false }, T.zero);
    pop("#z4-xb", T.zero + 0.1);
    pop("#c4s", T.stop - 0.1);
    walk("#p3, #lp3-pin, #lpa3-pin", T.stop + 0.1, MV[3][0] - 60, MV[3][1] + 40, 0.7);

    // ---------------- L6 · 跨链：核对同一代币在两条链上的精度
    const t6 = T.l6 - 0.4;
    KIT.cam(tl, t6, C.CZ5, 1.4);
    walk("#p3, #lp3-pin, #lpa3-pin", t6, MV5[0], MV5[1], 1.4);
    out("#c4w, #z4-v, #z4-xb", T.l6 + 0.5, 0.3);
    fin("#m5w", T.l6 + 0.6, 0.3);
    pop("#z5-6", T.l6 + 0.9);
    K6.carry(tl, "m5w", T.l6 + 1.7, M5DU[0], M5DU[1], 0, 0.9);
    pop("#z5-18", T.l6 + 2.5);
    K6.slider(tl, "r6", T.two, 7.5, 0.6);
    K6.slider(tl, "r18", T.two, 12.5, 0.6);
    pop("#z5-ok", T.two + 0.4);

    // ---------------- L7 · 回到开头：1 粒余数 → 约 9480 万美元？
    const t7 = T.l7 - 0.4;
    KIT.cam(tl, t7, C.CH, 1.6);
    out("#lpa3, #z5-6, #z5-18, #z5-ok, #m5w", t7 + 0.5, 0.3);
    out("#p3, #r6, #r18", t7 + 0.2, 0.4);
    pop("#h-pool", T.back + 0.2);
    pop("#ev", T.back + 0.6);
    pop("#h-L", T.tiny - 0.2); pop("#h-R", T.tiny - 0.1);
    K6.feed(tl, "hc", T.tiny - 0.3, 0.5);
    K6.cut(tl, "hc", T.tiny + 0.3, "R");
    pop("#qq", T.usd - 0.3);

    // ---------------- L8 · 余数给错了人 + 一笔交易里重复很多次
    out("#qq", T.l8 - 0.2, 0.2);
    pop("#ans", T.wrong);
    KIT.cam(tl, T.l8 - 0.3, C.CH2, 1.2);
    out("#h-pool", T.l8 - 0.3, 0.25);
    K6.chipReset(tl, "hc", T.wrong - 0.4);
    K6.cut(tl, "hc", T.wrong - 0.3, "R");
    tl.fromTo("#htx", { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: false }, T.tx - 0.1);
    pop("#h-tx", T.tx);
    K6.chipReset(tl, "hc", T.tx + 0.5);
    K6.cuts(tl, "hc", T.tx + 0.55, "R", 2, 0.95);
    for (let n = 6; n <= 9; n++) K6.pile(tl, "hc", "R", T.many + (n - 6) * 0.2, n);
    
    // ---------------- L9 · 余数始终归协议：重复多少次也抠不出钱
    out("#ans", T.l9 - 0.1, 0.25);
    K6.lever(tl, "hc", T.rev + 0.1, "up");
    K6.pile(tl, "hc", "R", T.rev + 0.4, 0);
    KIT.swap(tl, "#h-R", "#h-R0", T.rev + 0.4, 0.3);
    pop("#ans2", T.always);
    K6.chipReset(tl, "hc", T.always - 0.2);
    K6.cuts(tl, "hc", T.always, "L", 3, 0.95);
    for (let n = 4; n <= 9; n++) K6.pile(tl, "hc", "L", T.anyn + 0.6 + (n - 4) * 0.18, n);
    pop("#h-okb", T.nomoney);

    // ---------------- L10 · 结束卡（最后 2.5 秒完全静止）
    const tE = T.l10 - 0.1;
    KIT.cam(tl, tE, C.CEND, 1.0);
    out("#ans2, #ev, #h-tx", tE - 0.1, 0.25);
    tl.to("#veil", { opacity: 0.74, duration: 0.45, ease: "power1.inOut" }, tE + 0.1);
    tl.fromTo("#endcard", { opacity: 0, scale: 0.94, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, tE + 0.2);
    tl.set("#e-next, #e-note", { opacity: 0 }, 0);
    fin("#e-note", T.l10 + 0.4, 0.3);
    fin("#e-next", Math.min(T.next + 0.9, TOTAL - 2.5 - 0.35), 0.3);
    tl.set({}, {}, TOTAL);
    window.__timelines["story"] = tl;
  })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);

// 最后一条字幕保留到段尾（最后 2.5 秒画面和字幕都静止）
const capF = new URL("../compositions/captions.html", import.meta.url);
let cap = fs.readFileSync(capF, "utf8");
const lastId = TM.captions[TM.captions.length - 1].id;
cap = cap.replace(new RegExp(`\\s*tl\\.set\\("#cap-${lastId}", \\{opacity: 0, visibility: "hidden"\\}, [0-9.]+\\);`), "");
fs.writeFileSync(capF, cap);

console.log("wrote story.html", html.length, "seg1 layout:", HK.FROM_SEG1, "total", TOTAL, D(T));
