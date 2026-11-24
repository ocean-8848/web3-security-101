// seg5b「⑤ 回调入口 · 今天能做什么」— 生成 compositions/story.html
// 运行：node src/build-story.mjs
// 一个连续的等距世界 + 一台镜头：
//   上方：seg1 的钩子场景（攻击者 + 攻击合约 + 回调弹簧臂 → Bank 售货机 + 账本读数 + 调用栈）；
//   下方一排三个角色（写合约的人 / 审计的人 / 普通用户），每人走到自己的小场景做一件事；
//   之后镜头回到钩子场景给出答案；最后结束卡（最后 2.5 秒完全静止）。
import fs from "node:fs";
import { G, at, f, Wp, CE, M, box, camAt, toScreen, worldSvg, gridSvg, wlab, wpin, kitCss, runtimeJs, dashCurve } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt as WA, lineAt } from "../../../kit/timing.mjs";
// 钩子场景的世界坐标直接取 seg1 的 layout.mjs（seg1 定的"银行街"，只 import 不改）
import { BANK, BANK_TOP, STACK, DESK, DESK_TOP, LEDGER, COUNTER, ATK, ARM } from "../../seg1/src/layout.mjs";

const TM = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = TM.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const w = (s, o) => WA(TM, s, o).start;
const L = (i) => lineAt(TM, i);

// ------------------------------------------------------------------ helpers
const items = [], ground = [], overlay = [], A = {};
const add = (fn, o, opts, extraY = 0) => { const r = fn(o, opts); items.push({ Y: at(o)[1] + extraY, svg: r.svg }); A[opts.id] = r.anchors; return r; };
const uv = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });
const P = (p) => `${f(p[0])},${f(p[1])}`;
const gstrip = (a, b, wd, fill, stroke = "none") => {
  const du = b.u - a.u, dv = b.v - a.v, l = Math.hypot(du, dv), nu = (-dv / l) * wd / 2, nv = (du / l) * wd / 2;
  const q = [Wp(a.u + nu, a.v + nv), Wp(b.u + nu, b.v + nv), Wp(b.u - nu, b.v - nv), Wp(a.u - nu, a.v - nv)];
  return `<polygon points="${q.map(P).join(" ")}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
};

// ------------------------------------------------------------------ 上方：钩子场景（与 seg1 同一摆位）
const vm = add(E1.vending, BANK, { id: "vm", sign: "BANK", maintDoor: true });
{ // call stack on the Bank's roof (scaled 0.8 about its ground origin, lifted to BANK_TOP) — same as seg1
  const r = E3.frameStack({ u: STACK.u, v: STACK.v }, { id: "fs", n: STACK.n, labels: ["#1", "#2", "#3"], filled: 1 });
  const [gx, gy] = Wp(STACK.u, STACK.v, 0), lift = STACK.z * CE, k = STACK.scale;
  const sT = (p) => [gx + (p[0] - gx) * k, gy - lift + (p[1] - gy) * k];
  A.fs = { top: sT(r.anchors.top), trays: r.anchors.trays.map(sT), center: sT(r.anchors.center) };
  items.push({ Y: at(BANK)[1] + 0.5, svg: `<g transform="translate(${f(gx)},${f(gy - lift)}) scale(${k}) translate(${f(-gx)},${f(-gy)})">${r.svg}</g>` });
}
{ // ledger desk (−u side): pedestal + wood top + ledgerBook + rollCounter "your balance" — same as seg1
  let sv = box(DESK, -80, 80, -100, 100, 0, DESK_TOP - 8, M.white, 1.6) + box(DESK, -88, 88, -108, 108, DESK_TOP - 8, DESK_TOP, M.wood, 1.4);
  sv += E2.liftSvg(O.ledgerBook(LEDGER, { id: "lg", scale: 0.55 }).svg, DESK_TOP);
  const c = E2.rollCounter(COUNTER, { id: "ctr", digits: 1, value: 1, z: DESK_TOP });
  sv += c.svg; A.ctr = c.anchors;
  items.push({ Y: at(DESK)[1], svg: `<g id="desk">${sv}</g>` });
}
add(E1.miniVend, ATK, { id: "mA", kind: "attacker" }, 0.2);
add(X.callbackArm, ARM, { id: "cb", target: vm.anchors.buttons[0], coin: false });
// 右区第三方协议（seg1 的远景）本段不出镜：L0 全景里它会顶到右上角胶囊，故不画

// ------------------------------------------------------------------ 一排三个角色
const ROLES = [
  { name: "写合约的人", role: "engineer", color: "#2a9fc6" },
  { name: "审计的人", role: "signer", color: "#3b3e44" },
  { name: "普通用户", role: "signer", color: "#5b7086" },
];
const LX = (i) => -380 + 380 * i, LY = 640;
const ZP = [[-700, 1900], [1200, 1900], [3100, 1900]];
const MOVE = ROLES.map((_, i) => [f(ZP[i][0] - LX(i)), f(ZP[i][1] - LY)]);
ROLES.forEach((r, i) => add(O.person, G(LX(i), LY), { id: `p${i}`, role: r.role, color: r.color, scale: 1.6 }, ZP[i][1] - LY));

// ------------------------------------------------------------------ zone 1 · 写合约的人：笔记本上的 withdraw
const Z1 = ZP[0];
add(O.laptop, G(Z1[0] + 330, Z1[1] + 40), { id: "z1l", screen: `<rect x="0" y="0" width="222" height="146" fill="#1f2226"/>` +
  `<text x="12" y="28" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700" fill="#9ad9ee">withdraw()</text>` +
  `<rect x="12" y="44" width="150" height="8" rx="4" fill="#3b3e44"/>` +
  `<rect x="8" y="62" width="206" height="22" rx="4" fill="#5a2320"/><text x="14" y="78" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700" fill="#ffb3ab">.call{value: amt}</text>` +
  `<rect x="12" y="96" width="170" height="8" rx="4" fill="#3b3e44"/><rect x="12" y="114" width="90" height="8" rx="4" fill="#3b3e44"/>` });

// ------------------------------------------------------------------ zone 2 · 审计的人：编译器版本 + 部署链
const Z2 = ZP[1];
const z2M = G(Z2[0] + 470, Z2[1] - 130), z2C = G(Z2[0] + 1080, Z2[1] - 20);
add(E3.contractMachine, z2M, { id: "z2m", name: "编译器" });
add(O.chain, z2C, { id: "z2c", n: 3 });
{
  const r = O.magnifier(uv(z2M, 0, 160), { id: "z2g", z: 150 });
  overlay.push(`<g id="z2g-w" opacity="0">${r.svg}</g>`);
  A.z2g = r.anchors;
}

// ------------------------------------------------------------------ zone 3 · 普通用户：审计报告 → 新金库
const Z3 = ZP[2];
add(O.doc, G(Z3[0] + 380, Z3[1] - 40), { id: "z3d", title: "审计报告", standing: true, stampText: "已审计" });
add(O.seal, G(Z3[0] + 640, Z3[1] + 60), { id: "z3s", stamped: false });
add(O.safe, G(Z3[0] + 1380, Z3[1] - 30), { id: "z3v", plate: "NEW" });

// ------------------------------------------------------------------ labels (world, counter-scaled)
let LB = "";
const lab = (id, p, html, cls = "", anchor = "b") => { LB += wlab(id, p, html, cls + " hide", anchor); };
const up = (p, d) => [p[0], p[1] - d];
ROLES.forEach((r, i) => { lab(`lp${i}`, A[`p${i}`].top, r.name, "lab-g"); lab(`lpa${i}`, A[`p${i}`].top, r.name, "lab-ink"); });
// hook scene
lab("h-bank", at(BANK, -100, -40, 250), "Bank 合约", "", "r");
lab("h-atk", [A.mA.top[0], A.mA.top[1] - 10], "攻击合约", "lab-rs");
lab("h-ctr", [A.ctr.window[0] - 50, A.ctr.window[1] + 8], "你的余额", "", "r");
lab("h-old", [A.ctr.window[0] - 50, A.ctr.window[1] + 70], "清零 · 还在排队", "lab-g", "r");
lab("h-new", [A.ctr.window[0] - 50, A.ctr.window[1] + 70], "先清零", "lab-gs", "r");
lab("h-fs", [A.fs.top[0], A.fs.top[1]], "调用栈", "lab-cs");
A.fs.trays.forEach((p, i) => lab(`h-r${i}`, [p[0] + 120, p[1] + 4 - 10 * i], `第 ${i + 1} 层读到余额 <b>1</b>`, "lab-r lab-sm", "l"));
lab("h-r1ok", [A.fs.trays[1][0] + 120, A.fs.trays[1][1] + 4 - 10], "第 2 层读到 <b>0</b> · 回滚", "lab-gs lab-sm", "l");
{ // vault dot panel (10 dots = 10 ETH) — same panel as seg1
  const dots10 = Array.from({ length: 10 }, (_, i) => `<span class="vdt" id="vd-${i}"></span>`).join("");
  LB += wpin("vp", at(BANK, 120, 90, 150), `<div class="vpanel hide" id="vpanel"><div class="vp-h">金库 <b>10 ETH</b><span class="ren">示例题</span></div><div class="vp-d">${dots10}</div><div class="vp-n hide" id="vp-n">被取走 10 / 10</div><div class="vp-n vp-ok hide" id="vp-ok">只被取走 1 / 10</div></div>`, "l");
}
// zone 1
lab("z1-l", A.z1l.top, "Bank 合约源码", "lab-sm");
// zone 2
lab("z2-m", A.z2m.top, "编译器版本", "");
lab("z2-c", up(A.z2c.top, 0), "部署链", "");
LB += wpin("q2a", [A.z2m.top[0] + 150, A.z2m.top[1] + 70], `<div class="qcard hide" id="q2ac"><div class="qmark">?</div><div class="qtxt">有没有已知的<br>锁 bug</div></div>`, "l");
LB += wpin("q2b", [A.z2c.last[0] + 90, A.z2c.last[1] - 30], `<div class="qcard hide" id="q2bc"><div class="qmark">?</div><div class="qtxt">转原生币会触发<br><span class="mono">fallback</span>？</div></div>`, "l");
// zone 3
lab("z3-d", A.z3d.top, "审计报告", "lab-cs");
LB += wpin("q3", [A.z3d.top[0] + 190, A.z3d.top[1] + 60], `<div class="qcard hide" id="q3c"><div class="qmark">?</div><div class="qtxt">范围覆盖<br>你要用的合约？</div></div>`, "l");
lab("z3-v", A.z3v.top, "新金库", "");
lab("z3-vn", [A.z3v.top[0] + 120, A.z3v.top[1] + 46], "未审计", "lab-g lab-sm", "l");

// ------------------------------------------------------------------ cameras
const fit = (Pts, x0, y0, x1, y1) => {
  const xs = Pts.map((p) => p[0]), ys = Pts.map((p) => p[1]);
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  const k = Math.min((x1 - x0) / (bx1 - bx0), (y1 - y0) / (by1 - by0));
  return camAt([(bx0 + bx1) / 2, (by0 + by1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};
const hookPts = [A.mA.top, A.mA.ground, A.cb.ground, A.vm.top, A.fs.top, A.vm.ground, A.ctr.ground, A.vm.trayOut, at(DESK, -100, 0, 0)];
const CS = fit(hookPts, 260, 150, 1660, 900);                           // 段首：停在 Bank（承接 seg5a）
const C0 = fit([...hookPts, A.p0.top, A.p2.top, A.p0.ground, A.p2.ground], 300, 250, 1500, 880);
const zc = (Z, sx, k) => camAt([Z[0], Z[1]], sx, 830, k);
const CZ1 = zc(Z1, 340, 0.95), CZ2 = zc(Z2, 300, 0.86), CZ3 = zc(Z3, 330, 0.9);
const CZ4 = camAt([Z3[0] + 700, Z3[1]], 960, 830, 0.86);
const CH = fit([...hookPts, [A.fs.trays[0][0] + 480, A.fs.trays[0][1]]], 620, 150, 1860, 900);                           // 回到开头：右侧留给前提卡
const CEND = camAt([(960 - CH.x) / CH.scale, (540 - CH.y) / CH.scale], 960, 540, CH.scale * 0.88);
const CAMS = { CS, C0, CZ1, CZ2, CZ3, CZ4, CH, CEND };

// zone 1 code card (screen) + red dashed link from the call row to the laptop
const CARD = { x: 880, y: 170 };
const rowY = (i) => CARD.y + 24 + 56 + 50 * i + 25;
const lapS = toScreen(CZ1, A.z1l.screen);
const link1 = dashCurve("lk1", [CARD.x + 6, rowY(2)], [lapS[0] + 60, lapS[1] - 20], { c1: [CARD.x - 140, rowY(2) + 30], c2: [lapS[0] + 160, lapS[1] - 180] });

// zone 3 / L4 dot matrices (screen layer at CZ4)
const pS = toScreen(CZ4, [A.p2.top[0] + +MOVE[2][0], A.p2.top[1] + +MOVE[2][1]]), vS = toScreen(CZ4, A.z3v.center);
const WAL = { x: f(pS[0] - 170), y: f(pS[1] - 300) }, VAU = { x: f(vS[0] - 400), y: f(vS[1] - 60) };

// ------------------------------------------------------------------ assemble
const srt = (arr) => arr.slice().sort((a, b) => a.Y - b.Y).map((b) => b.svg).join("\n");
const world = worldSvg("wsvg", gridSvg({ u0: -3000, u1: 9000, v0: -3000, v1: 9000 }) + ground.join("") + srt(items) + overlay.join(""), [-1500, -1500, 10000, 5500]);

const D = (o) => JSON.stringify(o);
const T = {
  l0: L(0).start, l1: L(1).start, l2: L(2).start, l3: L(3).start, l4: L(4).start, l5: L(5).start, l6: L(6).start, l7: L(7).start, l8: L(8).start, l9: L(9).start,
  each: w("每个人"), first: w("第一个"), hand: w("交出去"), ask: w("问一句"), which: w("哪些状态"),
  comp: w("编译器版本"), bug: w("锁bug"), chain: w("部署链"), native: w("原生币"), fb: w("fallback"),
  report: w("审计报告"), scope: w("范围"), nores: w("没有审计"), newv: w("新金库"), only: w("只放"),
  back: w("回到开头"), once: w("只调用一次"), all: w("全部"),
  give: w("先给钱"), book: w("后记账"), layer: w("每一层"), same: w("同一个旧余额"),
  pre: w("前提"), exec: w("执行代码"), state: w("状态", { line: 7 }),
  order: w("顺序写对"), second: w("第二层"), zero: w("就是0"),
  next: w("下一集"),
};

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #sec { position: absolute; left: 56px; top: 32px; }
    .mono { font-family: "JetBrains Mono", monospace; }
    .lab b { font-family: "JetBrains Mono", monospace; font-size: 1.15em; }
    .qcard { display: flex; align-items: center; gap: 20px; background: #fffdf8; border: 3px solid #2aa3c9; border-radius: 18px; padding: 14px 26px 16px 18px;
      box-shadow: 0 14px 30px rgba(70, 60, 40, 0.14); white-space: nowrap; }
    .qmark { width: 62px; height: 62px; border-radius: 50%; background: #1d93ba; color: #fff; font-size: 46px; font-weight: 900; line-height: 62px; text-align: center; flex: none; }
    .qtxt { font-size: 34px; font-weight: 900; line-height: 1.25; color: #1c1c1c; }
    .ren { display: inline-block; margin-left: 14px; font-family: "JetBrains Mono", monospace; font-size: 28px; font-weight: 700; color: #6d685e;
      border: 2px solid #cfc7b8; border-radius: 8px; padding: 0 8px 2px; vertical-align: 4px; }
    /* zone 1 */
    #card { left: ${CARD.x}px; top: ${CARD.y}px; width: 960px; }
    #card .c-row { overflow: visible; white-space: pre; }
    #ring { position: absolute; left: 22px; top: 0px; width: 640px; height: 50px; border: 5px solid #e0453a; border-radius: 26px; }
    #mag { position: absolute; left: 640px; top: 230px; width: 120px; height: 120px; }
    .chip { display: inline-block; margin-left: 14px; font-family: "Noto Sans SC", sans-serif; font-size: 28px; font-weight: 900; color: #fff; border-radius: 8px; padding: 0 10px 2px; line-height: 38px; vertical-align: 2px; }
    .chip-r { background: #e0453a; } .chip-g { background: #8a8478; }
    #q1 { position: absolute; left: ${CARD.x}px; top: ${CARD.y + 420}px; }
    #q1 .qtxt { font-size: 40px; }
    /* L4 dot matrices */
    .mx { position: absolute; background: #fffdf8; border-radius: 16px; padding: 14px 18px 16px; box-shadow: 0 10px 24px rgba(70, 60, 40, 0.12); }
    .mx-h { font-size: 28px; font-weight: 900; white-space: nowrap; margin-bottom: 10px; }
    .mx-g { position: relative; width: 300px; height: 128px; }
    .mx-v { width: 140px; height: 54px; }
    .dt { position: absolute; width: 50px; height: 50px; border-radius: 50%; background: #1d93ba; }
    #wal { left: ${WAL.x}px; top: ${WAL.y}px; } #vau { left: ${VAU.x}px; top: ${VAU.y}px; }
    #only { position: absolute; left: 960px; top: 150px; transform: translateX(-50%); }
    /* hook: question + premise + mini code card */
    .vpanel { background: #ffffff; border-radius: 18px; padding: 16px 22px 18px; box-shadow: 0 10px 22px rgba(70,60,40,0.12); }
    .vp-h { font-size: 32px; font-weight: 700; white-space: nowrap; }
    .vp-h b { font-weight: 900; }
    .vp-d { margin-top: 10px; display: grid; grid-template-columns: repeat(5, 40px); gap: 10px; }
    .vdt { display: inline-block; width: 40px; height: 40px; border-radius: 50%; background: #1d93ba; }
    .vp-n { margin-top: 10px; font-size: 30px; font-weight: 900; color: #e0453a; white-space: nowrap; }
    .vp-ok { color: #1f9d55; }
    #vp-ok { margin-top: -38px; }
    #hq { position: absolute; left: 70px; top: 130px; }
    #hq .qtxt { font-size: 38px; }
    #hq .ans { color: #e0453a; }
    .pre { position: absolute; left: 70px; width: 470px; background: #fffdf8; border-radius: 16px; padding: 16px 22px 18px; box-shadow: 0 12px 26px rgba(70, 60, 40, 0.13);
      border-left: 10px solid #1d93ba; }
    .pre-n { font-size: 28px; font-weight: 800; color: #1d93ba; white-space: nowrap; }
    .pre-t { font-size: 36px; font-weight: 900; line-height: 1.3; }
    #pre1 { top: 170px; } #pre2 { top: 360px; }
    #pre-tag { position: absolute; left: 70px; top: 120px; }
    #mc { left: 70px; top: 150px; width: 640px; padding: 18px 26px; }
    #mc .c-row { white-space: pre; font-size: 28px; }
    #mc .mrow { position: absolute; left: 26px; }
    #ovl { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; overflow: visible; pointer-events: none; }
    #veil { position: absolute; inset: 0; background: #efebe3; opacity: 0; }
    #endcard { position: absolute; left: 160px; top: 200px; width: 1600px; background: #fffdf8; border-radius: 28px; box-shadow: 0 18px 40px rgba(70, 60, 40, 0.14);
      text-align: center; padding: 50px 40px 54px; opacity: 0; }
    #endcard .e-ch { font-size: 40px; font-weight: 900; color: #1d93ba; letter-spacing: 0.04em; }
    #endcard .e-main { margin-top: 0; font-size: 76px; font-weight: 900; line-height: 1.15; white-space: nowrap; color: #1c1c1c; }
    #endcard .e-rule { width: 120px; height: 6px; border-radius: 3px; background: #2aa3c9; margin: 32px auto 28px; }
    #endcard .e-next { font-size: 36px; font-weight: 700; color: #3b3e44; white-space: nowrap; }
    #endcard .e-note { margin-bottom: 18px; font-size: 40px; font-weight: 900; color: #1d93ba; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${LB}</div>
      </div>
      <svg id="ovl" viewBox="0 0 1920 1080" data-layout-ignore>${link1.svg}</svg>
      <!-- zone 1 -->
      <div class="k-code hide" id="card">
        <div class="c-head">Bank 合约<span class="c-tag">卡 A · Solidity</span></div>
        <div class="c-row">function withdraw() external {</div>
        <div class="c-row">  uint amt = balances[msg.sender];</div>
        <div class="c-row" id="row2"><span class="c-red">  msg.sender.call{value: amt}("");</span><span class="chip chip-r hide" id="ch1">① 交出控制权</span><div id="ring" class="hide"></div></div>
        <div class="c-row" id="row3">  balances[msg.sender] = 0;<span class="chip chip-g hide" id="ch2">② 还没执行</span></div>
        <div class="c-row">}</div>
        <svg id="mag" class="hide" viewBox="0 0 120 120"><circle cx="48" cy="48" r="36" fill="rgba(207,232,241,0.55)" stroke="#2b2d31" stroke-width="9"/>
          <path d="M30 34A22 22 0 0 1 52 24" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M75 75L108 108" stroke="#2b2d31" stroke-width="14" stroke-linecap="round"/></svg>
      </div>
      <div id="q1" class="hide"><div class="qcard"><div class="qmark">?</div><div class="qtxt">那一刻 · 哪些状态还没更新？</div></div></div>
      <!-- zone 3 · L4 -->
      <div class="mx hide" id="vau"><div class="mx-h">只放一小部分</div><div class="mx-g mx-v"></div></div>
      <div class="mx hide" id="wal"><div class="mx-h">你的资金</div><div class="mx-g">
        ${Array.from({ length: 10 }, (_, i) => `<div class="dt" id="dt${i}" style="left:${(i % 5) * 62}px;top:${Math.floor(i / 5) * 66}px"></div>`).join("")}</div></div>
      <!-- hook -->
      <div id="hq" class="hide"><div class="qcard"><div class="qmark">?</div><div class="qtxt">只调用一次 withdraw<br>能取走多少？<span class="ans hide" id="hq-a"> 全部 10 ETH</span></div></div></div>
      <div id="pre-tag" class="lab lab-g lab-sm hide">这个答案的前提 · 解读</div>
      <div class="pre hide" id="pre1"><div class="pre-n">前提 ①</div><div class="pre-t">收款方能执行代码</div></div>
      <div class="pre hide" id="pre2"><div class="pre-n">前提 ②</div><div class="pre-t">交出控制权之前<br>状态还没更新</div></div>
      <div class="k-code hide" id="mc">
        <div class="c-head">把顺序写对<span class="c-tag">卡 A → 修复</span></div>
        <div style="position:relative;height:100px">
          <div class="c-row mrow" id="mr1" style="top:0">msg.sender.call{value: amt}("");</div>
          <div class="c-row mrow" id="mr2" style="top:50px"><span id="mr2t">balances[msg.sender] = 0;</span></div>
        </div>
      </div>
      <div id="sec"><div class="lab lab-ink hide" id="sec-l">⑤ 回调入口 · 今天能做什么</div></div>
      ${pills(5, { sections: SCRIPT.sections })}
      <div id="veil"></div>
      <div id="endcard">
        <div class="e-main">${SCRIPT.title}</div>
        <div class="e-rule"></div>
        <div class="e-note" id="e-note">把顺序写对 · 第二层读到的就是 0</div>
        <div class="e-next" id="e-next">下一集 · 访问控制与权限：谁有权按这个按钮</div>
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
    const MV = ${D(MOVE)};
    const T = ${D(T)};
    const tl = gsap.timeline({ paused: true });
    const pop = (sel, t) => KIT.pop(tl, sel, t);
    const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.25, ease: "power2.in" }, t);
    const fin = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.3, ease: "power2.out", immediateRender: false }, t);
    const GROW = [["p0", 2.0], ["p1", 2.15], ["p2", 2.3], ["z1l", T.l1 + 0.6], ["z2m", T.l2 + 0.3], ["z2c", T.chain - 0.2], ["z3d", T.l3 + 0.3], ["z3s", T.l3 + 0.45], ["z3v", T.l4 - 0.3]];
    GROW.forEach(function (g) { const el = document.getElementById(g[0]); tl.set("#" + g[0], { scaleY: 0, svgOrigin: el.getAttribute("data-ox") + " " + el.getAttribute("data-oy") }, 0); KIT.grow(tl, g[0], g[1]); });
    KIT.camSet(tl, C.CS);
    tl.set("#mag", { x: 0, y: 0 }, 0);

    // ---------------- L0 · 每人一件事（全景缩到上方，下方一排三个人）
    pop("#sec-l", 0.2);
    pop("#h-bank", 0.3); pop("#h-atk", 0.4);
    KIT.cam(tl, 1.0, C.C0, 1.3);
    [0, 1, 2].forEach(function (i) { pop("#lp" + i, T.each + 0.3 + i * 0.15); });

    // ---------------- L1 · 写合约的人
    const t1 = T.l1 - 0.35;
    KIT.cam(tl, t1, C.CZ1, 1.2);
    tl.to("#p0, #lp0-pin, #lpa0-pin", { x: MV[0][0], y: MV[0][1], duration: 1.2, ease: "power2.inOut" }, t1);
    out("#sec-l, #h-bank, #h-atk", t1, 0.3);
    tl.to("#lp0", { opacity: 0, duration: 0.15 }, T.l1 + 0.3); pop("#lpa0", T.l1 + 0.3);
    out("#lp1, #lp2", t1, 0.2);
    pop("#card", T.l1 + 0.9);
    pop("#z1-l", T.l1 + 1.0);
    fin("#mag", T.first - 0.1, 0.2);
    tl.fromTo("#mag", { x: 0, y: 0 }, { x: -260, y: -150, duration: 0.8, ease: "power2.inOut", immediateRender: false }, T.first);
    tl.fromTo("#ring", { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.6)", immediateRender: false }, T.hand);
    pop("#ch1", T.hand + 0.2);
    out("#mag", T.hand + 0.4, 0.2);
    KIT.draw(tl, "lk1", T.hand + 0.3, 0.5);
    pop("#q1", T.ask + 0.2);
    pop("#ch2", T.which);
    tl.fromTo("#row3", { backgroundColor: "rgba(224,69,58,0)" }, { backgroundColor: "rgba(224,69,58,0.10)", duration: 0.3, immediateRender: false }, T.which);

    // ---------------- L2 · 审计的人
    const t2 = T.l2 - 0.4;
    KIT.cam(tl, t2, C.CZ2, 1.2);
    tl.to("#p1, #lp1-pin, #lpa1-pin", { x: MV[1][0], y: MV[1][1], duration: 1.2, ease: "power2.inOut" }, t2);
    out("#card, #q1, #lpa0, #z1-l, #lk1", t2, 0.3);
    tl.to("#lp1", { opacity: 0, duration: 0.15 }, T.l2 + 0.3); pop("#lpa1", T.l2 + 0.3);
    pop("#z2-m", T.comp);
    KITX03.spin(tl, "z2m", T.comp, 2.0, 1, "power2.inOut");
    fin("#z2g-w", T.comp + 0.1, 0.25);
    pop("#q2ac", T.bug);
    pop("#z2-c", T.chain);
    tl.to("#z2g-w", { x: ${f(at(uv(z2C, 0, 0))[0] - at(uv(z2M, 0, 160))[0])}, y: ${f(at(uv(z2C, 0, 0))[1] - at(uv(z2M, 0, 160))[1] + 60)}, duration: 0.7, ease: "power2.inOut" }, T.chain);
    pop("#q2bc", T.fb - 0.3);

    // ---------------- L3 · 普通用户：审计报告
    const t3 = T.l3 - 0.45;
    KIT.cam(tl, t3, C.CZ3, 1.2);
    tl.to("#p2, #lp2-pin, #lpa2-pin", { x: MV[2][0], y: MV[2][1], duration: 1.2, ease: "power2.inOut" }, t3);
    out("#lpa1, #z2-m, #z2-c, #q2ac, #q2bc, #z2g-w", t3, 0.3);
    tl.to("#lp2", { opacity: 0, duration: 0.15 }, T.l3 + 0.3); pop("#lpa2", T.l3 + 0.3);
    pop("#z3-d", T.report);
    KIT.stamp(tl, "z3s", T.report + 0.1);
    tl.to("#z3d-stampmark", { opacity: 1, duration: 0.15 }, T.report + 0.7);
    pop("#q3c", T.scope);

    // ---------------- L4 · 没审计的新金库：只放一小撮
    KIT.cam(tl, T.l4 - 0.35, C.CZ4, 1.0);
    out("#q3c", T.l4 - 0.35, 0.25);
    pop("#z3-v", T.newv); pop("#z3-vn", T.newv + 0.2);
    pop("#wal", T.newv + 0.3); pop("#vau", T.newv + 0.4);
    [8, 9].forEach(function (i, k) {
      tl.to("#dt" + i, { x: ${f(VAU.x - WAL.x)} - ((i % 5) * 62) + k * 62, y: ${f(VAU.y - WAL.y)} - 66, duration: 0.7, ease: "power2.inOut" }, T.only + k * 0.12);
    });

    // ---------------- L5 · 回到开头
    const t5 = T.l5 - 0.4;
    KIT.cam(tl, t5, C.CH, 1.4);
    out("#wal, #vau, #lpa2, #z3-d, #z3-v, #z3-vn", t5, 0.3);
    pop("#h-bank", T.back + 0.6); pop("#h-atk", T.back + 0.9); pop("#vpanel", T.back + 1.1);
    pop("#h-ctr", T.once - 0.2); pop("#h-fs", T.once);
    pop("#hq", T.once + 0.2);
    KITX04.armPress(tl, "cb", T.once + 0.6);
    KITX01.press(tl, "vm", 0, T.once + 1.0, "red");
    pop("#hq-a", T.all);

    // ---------------- L6 · 先给钱后记账；每层读同一个旧余额
    pop("#h-r0", T.give - 0.2);
    KITX01.dispense(tl, "vm", T.give, { n: 3, start: 0, color: "red" });
    pop("#h-old", T.book);
    KITX04.armPress(tl, "cb", T.book + 0.3);
    KITX01.press(tl, "vm", 0, T.book + 0.7, "red");
    KITX03.push(tl, "fs", 1, T.book + 0.8);
    pop("#h-r1", T.book + 1.0);
    KITX01.dispense(tl, "vm", T.book + 1.1, { n: 3, start: 3, color: "red" });
    KITX04.armPress(tl, "cb", T.same - 0.6);
    KITX01.press(tl, "vm", 0, T.same - 0.2, "red");
    KITX03.push(tl, "fs", 2, T.same - 0.1);
    pop("#h-r2", T.same + 0.1);
    KITX01.dispense(tl, "vm", T.same, { n: 2, start: 6, color: "red" });
    tl.to(".vm-stock, #vm-shelf-0, #vm-shelf-1, #vm-shelf-2", { opacity: 0.08, duration: 1.2, stagger: 0.3 }, T.give + 0.2);
    out("#hq", T.same + 0.4, 0.3);
    for (let i = 0; i < 10; i++) tl.to("#vd-" + i, { backgroundColor: "#e0453a", duration: 0.15 }, T.give + 0.2 + i * ((T.same + 0.3 - T.give) / 10));
    pop("#vp-n", T.same + 0.6);

    // ---------------- L7 · 前提
    pop("#pre-tag", T.pre);
    pop("#pre1", T.exec - 0.6);
    tl.fromTo("#mA-solid", { filter: "drop-shadow(0 0 0px rgba(224,69,58,0))" }, { filter: "drop-shadow(0 0 18px rgba(224,69,58,0.9))", duration: 0.4, immediateRender: false }, T.exec - 0.4);
    pop("#pre2", T.state - 0.3);

    // ---------------- L8 · 顺序写对：第二层读到 0
    out("#pre-tag, #pre1, #pre2", T.l8 - 0.3, 0.25);
    tl.to("#mA-solid", { filter: "drop-shadow(0 0 0px rgba(224,69,58,0))", duration: 0.25 }, T.l8 - 0.3);
    pop("#mc", T.l8 - 0.1);
    tl.to("#mr2", { y: -50, duration: 0.5, ease: "power2.inOut" }, T.order + 0.2);
    tl.to("#mr1", { y: 50, duration: 0.5, ease: "power2.inOut" }, T.order + 0.2);
    tl.to("#mr2t", { color: "#1f9d55", duration: 0.3 }, T.order + 0.5);
    // replay: ledger clears first, so layer 2 reads 0 and rolls back; only 1 coin went out
    KIT.count(tl, "ctr", T.order + 0.6, 0.5, 1, 0);
    KIT.swap(tl, "#h-old", "#h-new", T.order + 0.6, 0.3);
    out("#h-r2", T.second - 0.3, 0.2);
    KITX03.tip(tl, "fs", 2, T.second - 0.3, { dur: 0.45 });
    KIT.swap(tl, "#h-r1", "#h-r1ok", T.second, 0.3);
    KITX03.tip(tl, "fs", 1, T.zero, { dur: 0.45 });
    tl.to(".vm-stock, #vm-shelf-0, #vm-shelf-1, #vm-shelf-2", { opacity: 1, duration: 0.5 }, T.second);
    for (let i = 1; i < 8; i++) tl.to("#vm-coin-" + i, { opacity: 0, duration: 0.3 }, T.second);
    tl.set("#vm-coin-0-g", { opacity: 1 }, T.second + 0.15); tl.set("#vm-coin-0-r", { opacity: 0 }, T.second + 0.15);
    for (let i = 1; i < 10; i++) tl.to("#vd-" + i, { backgroundColor: "#1d93ba", duration: 0.2 }, T.second + 0.1 + i * 0.03);
    out("#vp-n", T.second, 0.2); pop("#vp-ok", T.zero + 0.1);

    // ---------------- L9 · 结束卡（最后 2.5 秒完全静止）
    KIT.cam(tl, T.l9 - 0.1, C.CEND, 1.0);
    out("#mc, #h-bank, #h-atk, #h-ctr, #h-new, #h-fs, #h-r0, #h-r1ok, #vpanel", T.l9 - 0.2, 0.25);
    tl.to("#veil", { opacity: 0.74, duration: 0.45, ease: "power1.inOut" }, T.l9);
    tl.fromTo("#endcard", { opacity: 0, scale: 0.94, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, T.l9 + 0.1);
    tl.set("#e-next, #e-note", { opacity: 0 }, 0);
    fin("#e-note", Math.min(T.l9 + 0.45, ${TOTAL} - 2.5 - 0.35), 0.3);
    fin("#e-next", Math.min(T.next + 0.9, ${TOTAL} - 2.5 - 0.35), 0.3);
    tl.set({}, {}, ${TOTAL});
    window.__timelines["story"] = tl;
  })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "total", TOTAL, D(T));
