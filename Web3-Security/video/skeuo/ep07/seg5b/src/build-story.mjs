// seg5b「⑤ 授权风险 · 今天能做什么」— 生成 compositions/story.html，并把最后一条字幕延到段尾
// 运行：node src/build-story.mjs
// 一个连续的等距世界 + 一台镜头：
//   后上方：远景跨链桥（Qubit，钩子场景，坐标见 hook.mjs）；
//   前方一排四个工位（写合约的人 / 接代币的人 / 审计的人 / 普通用户），人物各站在自己的工位旁，镜头逐个推近；
//   回到跨链桥给出答案；最后结束卡（最后 2.5 秒完全静止）。
import fs from "node:fs";
import { G, at, f, camAt, worldSvg, gridSvg, wlab, wpin, kitCss, runtimeJs, CHECK, BADGE } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt as WA, lineAt } from "../../../kit/timing.mjs";
import * as HK from "./hook.mjs";

const TM = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = TM.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const SEG = SCRIPT.segments.find((s) => s.id === "seg5b");
const TITLE = SCRIPT.title.replace(/^\s*(第\s*\S+\s*[章节集]|\d+\s*[·.、:：])\s*/, "");
const w = (s, o) => WA(TM, s, o).start;
const L = (i) => lineAt(TM, i);

// ------------------------------------------------------------------ helpers
const items = [], overlay = [], A = {};
const add = (fn, o, opts, extraY = 0) => { const r = fn(o, opts); items.push({ Y: at(o)[1] + extraY, svg: r.svg }); A[opts.id] = r.anchors; return r; };
// 没有 scale 选项的 kit 物件：以地面原点整体缩放（anchors 同步换算）
const sc = (o, k, v) => { const [ox, oy] = at(o); const one = (p) => [f(ox + (p[0] - ox) * k), f(oy + (p[1] - oy) * k)];
  return Array.isArray(v) && typeof v[0] === "number" ? one(v) : Array.isArray(v) ? v.map((p) => (Array.isArray(p) ? one(p) : p)) : v; };
const addK = (fn, o, opts, k, extraY = 0) => {
  const r = fn(o, opts), [ox, oy] = at(o);
  items.push({ Y: at(o)[1] + extraY, svg: `<g transform="translate(${f(ox)} ${f(oy)}) scale(${k}) translate(${f(-ox)} ${f(-oy)})">${r.svg}</g>` });
  A[opts.id] = Object.fromEntries(Object.entries(r.anchors).map(([n, v]) => [n, sc(o, k, v)]));
};
const up = (p, d) => [p[0], p[1] - d];

// ------------------------------------------------------------------ 后上方：跨链桥（钩子）
HK.build({ add, items, A });

// ------------------------------------------------------------------ 前方一排四个工位
const ROLES = [
  { name: "写合约的人", role: "engineer", color: "#2a9fc6" },
  { name: "接代币的人", role: "signer", color: "#5b6b7d" },
  { name: "审计的人", role: "signer", color: "#3b3e44" },
  { name: "普通用户", role: "signer", color: "#7a6a58" },
];
const PS = 2.0;                                   // 人物约 420 世界单位高
const ROWY = 1400, SX = (i) => -430 + 880 * i;
const PP = (i) => G(SX(i) - 250, ROWY + 60);
ROLES.forEach((r, i) => add(O.person, PP(i), { id: `p${i}`, role: r.role, color: r.color, scale: PS }));

// 工位 0 · 写合约的人：工位 + 回执签（返回值）+ 荒地（目标有没有代码）
{ const s = SX(0);
  const scr = `<rect x="0" y="0" width="148" height="88" fill="#ffffff"/><rect x="0" y="0" width="148" height="14" fill="#ece7dd"/>` +
    [0, 1, 2, 3].map((i) => `<rect x="8" y="${22 + i * 16}" width="${[96, 120, 84, 108][i]}" height="6" rx="3" fill="#c9c3b7"/>`).join("");
  addK(O.desk, G(s + 10, ROWY - 170), { id: "d0", screen: scr }, 1.25);
  add(X.returnTag, G(s - 20, ROWY + 170), { id: "tg0", face: "ok", scale: 2.0 });
  add(X.emptyLot, G(s + 330, ROWY + 30), { id: "lot0", w: 220, d: 170 });
  const m = O.magnifier(G(s - 20, ROWY + 120), { id: "m0", z: 170 }); overlay.push(`<g id="m0w" opacity="0">${m.svg}</g>`); A.m0 = m.anchors;
}
// 工位 1 · 接代币的人：到账台秤 + TRON USDT（成功却报 false 的那枚币）
{ const s = SX(1);
  add(X.scale, G(s + 40, ROWY - 10), { id: "sc1", before: null, after: null, scale: 1.7 });
  add(X.oddCoin, G(s + 330, ROWY + 110), { id: "cn1", kind: "liar", scale: 1.6 });
}
// 工位 2 · 审计的人：拍卖台（推送退款）+ 拒收合约 + 放大镜
{ const s = SX(2);
  add(X.auctionStand, G(s + 60, ROWY - 110), { id: "au2", name: "B", amount: "12 ETH" });
  const bd = A.au2.bidder;
  add(E1.miniVend, G(bd[0] + 70, bd[1] + 40), { id: "mv2", kind: "attacker" });
  const m = O.magnifier(G(s - 60, ROWY + 40), { id: "m2", z: 190 }); overlay.push(`<g id="m2w" opacity="0">${m.svg}</g>`); A.m2 = m.anchors;
}
// 工位 3 · 普通用户：钱包 + 授权门卡 + 陌生红币 + 手机
{ const s = SX(3);
  addK(O.hotWallet, G(s + 20, ROWY - 140), { id: "hw3" }, 1.15);
  add(E5.keycard, G(s - 70, ROWY + 150), { id: "kc3", role: "param", text: "APPROVE", z: 150, scale: 2.0 });
  add(X.oddCoin, G(s + 230, ROWY + 90), { id: "cn3", kind: "mute", state: "attacker", scale: 1.5 });
  const W = 76, H = 150;
  const scrA = `<rect width="${W}" height="${H}" fill="#ffffff"/><rect width="${W}" height="24" fill="#ece7dd"/><text x="${W / 2}" y="17" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="800" fill="#1c1c1c">TRON</text>` +
    `<text x="${W / 2}" y="52" text-anchor="middle" font-family="Noto Sans SC" font-size="13" font-weight="800" fill="#1c1c1c">USDT</text>` +
    `<rect x="8" y="64" width="60" height="6" rx="3" fill="#ddd6c9"/><rect x="8" y="78" width="44" height="6" rx="3" fill="#ddd6c9"/>`;
  const pill = (c, t) => `<rect x="6" y="104" width="64" height="30" rx="8" fill="${c}"/><text x="${W / 2}" y="125" text-anchor="middle" font-family="Noto Sans SC" font-size="15" font-weight="900" fill="#fff">${t}</text>`;
  addK(O.phone, G(s + 380, ROWY - 30), { id: "ph3", screen: scrA + pill("#9a958b", "已广播"), screen2: scrA + pill("#1f9d55", "成功") }, 1.7);
}

// ------------------------------------------------------------------ labels (world, counter-scaled)
let LB = "";
const lab = (id, p, html, cls = "", anchor = "b") => { LB += wlab(id, p, html, cls + " hide", anchor); };
ROLES.forEach((r, i) => { const pp = [A[`p${i}`].top[0] + (i === 0 ? 50 : 0), A[`p${i}`].top[1]]; lab(`lp${i}`, up(pp, 6), r.name, "lab-g"); lab(`lpa${i}`, up(pp, 6), r.name, "lab-ink"); });
// 工位 0
lab("z0-tg", [A.tg0.ground[0], A.tg0.ground[1] + 26], "返回值 · ok", "lab-gs", "t");
lab("z0-lot", up(A.lot0.plateTop, 10), "目标有代码？", "", "b");
lab("z0-no", [A.lot0.ground[0] + 20, A.lot0.ground[1] + 70], "没有代码 → 回滚", "lab-r", "t");
LB += wpin("z0-x", up(A.lot0.center, 20), BADGE("z0-xb", 60, "hide"), "c");
// 工位 1
lab("z1-coin", up(A.cn1.top, 8), "TRON · USDT", "", "b");
lab("z1-push", [A.cn1.ground[0], A.cn1.ground[1] + 30], "推送 · 单独处理", "lab-cs", "t");
// 工位 2
lab("z2-q", [A.mv2.top[0] + 30, A.mv2.top[1] - 10], "有人拒收？", "lab-rs", "b");
// 工位 3
lab("z3-inf", [A.kc3.face[0] + 70, A.kc3.face[1] + 10], "额度 ∞", "lab-r", "l");
lab("z3-amt", [A.kc3.face[0] + 70, A.kc3.face[1] + 10], "额度 = 需要的数额", "lab-cs", "l");
lab("z3-rev", [A.kc3.face[0] + 70, A.kc3.face[1] + 10], "已撤销", "lab-gs", "l");
lab("z3-coin", up(A.cn3.top, 8), "陌生代币", "lab-rs", "b");
lab("z3-no", [A.cn3.ground[0], A.cn3.ground[1] + 30], "不卖 · 不领", "lab-ink", "t");
lab("z3-ph", up(A.ph3.top, 12), "状态：成功", "lab-gs", "b");
lab("z3-ph0", up(A.ph3.top, 12), "状态：已广播", "lab-g", "b");
// 钩子
lab("h-eth", up(A.ce.last, 10), "以太坊", "lab-g", "b");
lab("h-bnb", up(A.cb.last, 10), "BNB Chain", "lab-g", "b");
lab("h-bm", up(A.bm.top, 8), "桥 · 以太坊侧", "", "b");
lab("h-bv", [A.bv.ground[0] + 10, A.bv.ground[1] + 24], "ETH 没到", "lab-rs", "t");
lab("h-lot", [A.hlot.ground[0] - 60, A.hlot.ground[1] + 60], "零地址 · 没有代码", "lab-r", "t");
lab("h-tg", [A.htg.face[0] + 70, A.htg.face[1] + 10], "成功 + 空返回", "lab-g", "l");
LB += wpin("h-ok", [A.htg.face[0] + 46, A.htg.face[1] - 40], CHECK("h-okb", 64, "hide"), "c");
lab("h-sc", [A.hsc.center[0] + 70, A.hsc.center[1]], "余额：前 = 后 = 0", "lab-r", "l");
lab("h-tax", [A.hsc.ground[0], A.hsc.ground[1] + 26], "前提：不收转账税", "lab-g", "t");
// 中心
lab("v-vm", up(A.vm.top, 8), "我们的合约", "lab-cs", "b");
lab("v-sc", [A.vsc.ground[0], A.vsc.ground[1] + 26], "核对余额变化", "lab-gs", "t");
HK.pipeEnds(A).forEach((p, i) => { LB += wpin("v-ok" + i, up(p, 70), CHECK("v-okb" + i, 52, "hide"), "c"); });

// ------------------------------------------------------------------ cameras
const fit = (Pts, x0, y0, x1, y1, kmax = 9) => {
  const xs = Pts.map((p) => p[0]), ys = Pts.map((p) => p[1]);
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  const k = Math.min(kmax, (x1 - x0) / (bx1 - bx0), (y1 - y0) / (by1 - by0));
  return camAt([(bx0 + bx1) / 2, (by0 + by1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};
const stPts = [
  [up(A.p0.top, 70), A.p0.ground, A.d0.top, A.tg0.ground, A.lot0.ground, A.lot0.plateTop, [A.lot0.ground[0] + 140, A.lot0.ground[1]]],
  [up(A.p1.top, 70), A.p1.ground, A.sc1.top, A.sc1.ground, A.cn1.top, [A.cn1.ground[0] + 120, A.cn1.ground[1] + 80]],
  [up(A.p2.top, 70), A.p2.ground, A.au2.top, A.mv2.ground, A.mv2.top, A.au2.chute],
  [up(A.p3.top, 70), A.p3.ground, A.hw3.top, A.kc3.ground, A.cn3.ground, A.ph3.top, [A.ph3.ground[0] + 60, A.ph3.ground[1]]],
];
const rowPts = stPts.flat();
const hookPts = HK.hookPts(A);
const vendPts = HK.vendPts(A);
const CS = fit(vendPts, 160, 170, 1760, 900);
const C0 = fit(rowPts, 70, 170, 1850, 900);
const CZ = stPts.map((P) => fit(P, 70, 190, 1010, 900));
const CH = fit(HK.hookLeft(A), 100, 200, 1180, 880);
const CH2 = fit([...HK.closePts(A), [A.hlot.ground[0] - 60, A.hlot.ground[1] + 110]], 100, 170, 1180, 830, 1.7);
const CEND = fit(vendPts, 120, 170, 1800, 900);
const CAMS = { CS, C0, CZ, CH, CH2, CEND };

// ------------------------------------------------------------------ assemble world
const srt = (arr) => arr.slice().sort((a, b) => a.Y - b.Y).map((b) => b.svg).join("\n");
const world = worldSvg("wsvg", gridSvg({ u0: -9000, u1: 12000, v0: -8000, v1: 12000 }) + srt(items) + overlay.join(""), [-3500, -3600, 12000, 7800]);

const D = (o) => JSON.stringify(o);
const T = {
  each: w("每个人"),
  l1: L(1).start, ret: w("返回值", { line: 1 }), code: w("有代码"),
  l2: L(2).start, real: w("按实收记账"), tron2: w("TRON", { line: 2 }), alone: w("单独处理"),
  l3: L(3).start, loop: w("推送资金的循环"), refuse: w("有人拒收"),
  l4: L(4).start, need: w("需要的数额"), revoke: w("撤销"),
  l5: L(5).start, odd: w("陌生代币"), sell: w("不要去卖"), claim: w("也不要去领"),
  l6: L(6).start, ok6: w("成功", { line: 6 }), bc: w("已广播"),
  l7: L(7).start, back: w("回到开头"), nomoney: w("没有收到钱"), dep: w("记下了一笔存款"),
  l8: L(8).start, empty: w("空返回"), arrive: w("当成了到账"), exist: w("存不存在"),
  l9: L(9).start, say: w("对方的说法"),
  l10: L(10).start, bal: w("余额的变化"), pre: w("前提"),
  l11: L(11).start, self: w("自己核对"),
  l12: L(12).start, next: w("下一集"),
};

// 屏幕卡片
const tick = (id) => `<span class="box"><span class="tk hide" id="${id}">✓</span></span>`;
const card = (id, head, rows, extra = "", pre = "") =>
  `<div class="k-code tc" id="${id}"><div class="c-head">${head}</div>${pre}${rows.map(([rid, html, mono]) =>
    `<div class="ck-r" id="${rid}">${tick(rid + "t")}<span class="${mono ? "mono2" : ""}">${html}</span></div>`).join("")}${extra}</div>`;
const c0Html = card("c0", "写合约的人 · 今天就做", [
  ["c0r0", "require(ok);", 1],
  ["c0r1", "require(target.code.length &gt; 0);", 1],
], "", `<div class="c-pre mono2">(bool ok, ) = target.call(data);</div>`);
const c1Html = card("c1", `接代币的人 · 今天就做<span class="c-tag">示例</span>`, [
  ["c1r0", "按实收记账：转入后 − 转入前", 0],
  ["c1r1", "部署到 TRON：USDT 推送单独处理", 0],
]);
const c2Html = card("c2", "审计的人 · 今天就做", [
  ["c2r0", "找出每个推送资金的循环", 0],
], `<div class="qq hide" id="c2q"><span class="qmark">?</span>有人拒收会怎样？</div>`);
const c3Html = card("c3", "普通用户 · 今天就做", [
  ["c3r0", "只授权需要的数额 · 用完撤销", 0],
  ["c3r1", "陌生代币：不卖 · 不领", 0],
  ["c3r2", "TRON 转 USDT：看到“成功”", 0],
]);

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #sec { position: absolute; left: 56px; top: 32px; }
    #tg0-pop, #cn1, #cn3, #vsc, #hsc { opacity: 0; }
    .mono2 { font-family: "JetBrains Mono", monospace; }
    .tc { left: 1060px; top: 170px; width: 800px; }
    .c-pre { font-size: 30px; color: #8a8478; height: 56px; line-height: 56px; white-space: nowrap; }
    .ck-r { display: flex; align-items: center; gap: 20px; min-height: 76px; font-size: 32px; font-weight: 800; border-bottom: 1px dashed #e6e0d4; white-space: nowrap; border-radius: 10px; }
    .ck-r .mono2 { font-size: 30px; font-weight: 700; }
    .box { width: 48px; height: 48px; border: 4px solid #2aa3c9; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex: none; }
    .tk { width: 48px; height: 48px; border-radius: 8px; background: #1f9d55; color: #fff; font-size: 34px; font-weight: 900; line-height: 48px; text-align: center; }
    .qq { margin-top: 18px; display: inline-flex; align-items: center; gap: 16px; font-size: 38px; font-weight: 900; color: #1c1c1c; border: 3px solid #2aa3c9; border-radius: 16px; padding: 8px 22px 10px 12px; }
    .qmark { width: 56px; height: 56px; border-radius: 50%; background: #1d93ba; color: #fff; font-size: 40px; font-weight: 900; line-height: 56px; text-align: center; }
    .card { position: absolute; left: 1220px; width: 640px; background: #fffdf8; border-radius: 18px; padding: 18px 26px 20px; box-shadow: 0 12px 26px rgba(70,60,40,0.13); }
    #ev { top: 150px; border-left: 10px solid #e0453a; }
    #ev .e1 { font-size: 30px; font-weight: 800; color: #6d685e; white-space: nowrap; }
    #ev .e2 { margin-top: 4px; font-size: 54px; font-weight: 900; color: #e0453a; white-space: nowrap; }
    #ev .e3 { margin-top: 8px; display: flex; gap: 10px; }
    .gt { font-size: 28px; font-weight: 700; color: #5f5a50; border: 2px solid #cfc7b8; border-radius: 8px; padding: 1px 10px 3px; white-space: nowrap; background: #fff; }
    .gt-r { display: block; width: fit-content; margin: 0 0 6px auto; }
    .an { font-size: 36px; font-weight: 900; line-height: 1.5; white-space: nowrap; }
    .an .r { color: #e0453a; } .an .g { color: #1f9d55; } .an .b { color: #1d93ba; }
    #qq2 { top: 450px; border: 3px solid #2aa3c9; display: flex; align-items: center; gap: 16px; }
    #ans { top: 450px; border-left: 10px solid #e0453a; }
    #ans2 { top: 450px; border-left: 10px solid #1d93ba; }
    #ans3 { top: 450px; border-left: 10px solid #1f9d55; }
    #veil { position: absolute; inset: 0; background: #efebe3; opacity: 0; }
    #endcard { position: absolute; left: 160px; top: 230px; width: 1600px; background: #fffdf8; border-radius: 28px; box-shadow: 0 18px 40px rgba(70, 60, 40, 0.14);
      text-align: center; padding: 54px 40px 58px; opacity: 0; }
    #endcard .e-main { font-size: 68px; font-weight: 900; line-height: 1.15; white-space: nowrap; color: #1c1c1c; }
    #endcard .e-rule { width: 120px; height: 6px; border-radius: 3px; background: #2aa3c9; margin: 34px auto 30px; }
    #endcard .e-note { font-size: 42px; font-weight: 900; color: #1d93ba; white-space: nowrap; }
    #endcard .e-next { margin-top: 22px; font-size: 38px; font-weight: 700; color: #3b3e44; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${LB}</div>
      </div>
      <div class="hide" id="c0w">${c0Html}</div>
      <div class="hide" id="c1w">${c1Html}</div>
      <div class="hide" id="c2w">${c2Html}</div>
      <div class="hide" id="c3w">${c3Html}</div>
      <div id="ev" class="card hide"><div class="e1">2022 年 1 月 · Qubit 跨链桥</div><div class="e2">约 8000 万美元</div><div class="e3"><span class="gt">CoinDesk 报道</span></div></div>
      <div id="qq2" class="card hide"><span class="qmark">?</span><div class="an">没收到钱<br>为什么记了一笔存款</div></div>
      <div id="ans" class="card hide"><span class="gt gt-r">SlowMist 分析</span><div class="an">成功 + 空返回 → <span class="r">当成到账</span><br>没问：对方存不存在</div></div>
      <div id="ans2" class="card hide"><span class="gt gt-r">解读</span><div class="an">返回 = <span class="b">对方的说法</span></div></div>
      <div id="ans3" class="card hide"><span class="gt gt-r">解读</span><div class="an">到账看 <span class="g">余额变化</span><br><span style="font-size:30px;color:#6d685e">前提：清楚会不会收转账税</span></div></div>
      <div id="sec"><div class="lab lab-ink hide" id="sec-l">${SEG.chapter}</div></div>
      ${pills(5, { sections: SCRIPT.sections })}
      <div id="veil"></div>
      <div id="endcard">
        <div class="e-main">${TITLE}</div>
        <div class="e-rule"></div>
        <div class="e-note" id="e-note">返回只是对方的说法 · 到账看余额变化</div>
        <div class="e-next" id="e-next">下一集 · 预言机与闪电贷</div>
      </div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E3.runtimeExtJs()}
${E5.runtimeExtJs()}
${X.runtimeExtJs()}
  (function () {
    const C = ${D(CAMS)};
    const T = ${D(T)};
    const TOTAL = ${TOTAL};
    const K7 = window.KITX07, K5 = window.KITX05;
    const tl = gsap.timeline({ paused: true });
    const pop = (sel, t) => KIT.pop(tl, sel, t);
    const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.25, ease: "power2.in" }, t);
    const fin = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.3, ease: "power2.out", immediateRender: false }, t);
    const hl = (sel, t) => tl.fromTo(sel, { backgroundColor: "rgba(42,163,201,0)" }, { backgroundColor: "rgba(42,163,201,0.10)", duration: 0.2, immediateRender: false }, t);
    const cardIn = (id, t) => { fin("#" + id + "w", t, 0.3); tl.fromTo("#" + id, { y: 24 }, { y: 0, duration: 0.5, ease: "power3.out", immediateRender: false }, t); };
    const active = (i, t) => { tl.to("#lp" + i, { opacity: 0, duration: 0.15 }, t); pop("#lpa" + i, t); };
    const idle = (i, t) => { out("#lpa" + i, t, 0.15); };

    KIT.camSet(tl, C.CS);
    ["p0", "p1", "p2", "p3"].forEach(function (id, i) { const el = document.getElementById(id); tl.set("#" + id, { scaleY: 0, svgOrigin: el.getAttribute("data-ox") + " " + el.getAttribute("data-oy") }, 0); KIT.grow(tl, id, 0.9 + i * 0.12); });


    // ---------------- 段首小标签；L0 · 每人一件事（桥缩到上方，下方一排四个人）
    pop("#sec-l", 0.15);
    KIT.cam(tl, 0.6, C.C0, 1.4);
    [0, 1, 2, 3].forEach(function (i) { pop("#lp" + i, T.each + 0.1 + i * 0.15); });

    // ---------------- L1 · 写合约的人：检查返回值 + 确认目标有代码
    KIT.cam(tl, T.l1 - 0.4, C.CZ[0], 1.2);
    out("#sec-l", T.l1 - 0.4, 0.25);
    out("#lp0, #lp1, #lp2, #lp3", T.l1 - 0.4, 0.25);
    active(0, T.l1 + 0.2);
    cardIn("c0", T.l1 + 0.4);
    K7.tagPop(tl, "tg0", T.ret - 0.5, 0.4);
    fin("#tg0-pop", T.ret - 0.5, 0.2);
    fin("#m0w", T.ret - 0.3, 0.3);
    K7.tagStamp(tl, "tg0", T.ret + 0.4, "ok");
    pop("#z0-tg", T.ret + 0.5);
    hl("#c0r0", T.ret); pop("#c0r0t", T.ret + 0.5);
    pop("#z0-lot", T.code - 1.2);
    K5.fly(tl, "m0w", T.code - 1.1, ${f(A.lot0.center[0] - A.m0.lens[0])}, ${f(A.lot0.center[1] - A.m0.lens[1] + 20)}, 0.9);
    K7.lotPlate(tl, "lot0", T.code - 0.2, true, 3);
    hl("#c0r1", T.code - 0.2);
    pop("#z0-xb", T.code + 0.3); pop("#z0-no", T.code + 0.4);
    pop("#c0r1t", T.code + 0.5);

    // ---------------- L2 · 接代币的人：按实收记账；TRON 上的 USDT 推送单独处理
    KIT.cam(tl, T.l2 - 0.4, C.CZ[1], 1.2);
    out("#c0w, #m0w", T.l2 - 0.3, 0.25);
    idle(0, T.l2); active(1, T.l2 + 0.2);
    cardIn("c1", T.l2 + 0.4);
    K7.pileTo(tl, "sc1", T.l2 + 0.3, 5, 0.4); K7.weigh(tl, "sc1", T.l2 + 0.6);
    K7.read(tl, "sc1", T.l2 + 0.7, "before", 1000, 0.5);
    hl("#c1r0", T.real);
    K7.pileTo(tl, "sc1", T.real + 0.1, 10, 0.4); K7.weigh(tl, "sc1", T.real + 0.4);
    K7.read(tl, "sc1", T.real + 0.5, "after", 1098, 0.6);
    K7.diff(tl, "sc1", T.real + 1.1, true, "实收 98 → 记 98");
    pop("#c1r0t", T.real + 1.2);
    tl.fromTo("#cn1", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, T.tron2 - 0.2);
    K7.coinFlip(tl, "cn1", T.tron2 - 0.2, 1, 0.8);
    pop("#z1-coin", T.tron2);
    hl("#c1r1", T.tron2);
    pop("#z1-push", T.alone);
    pop("#c1r1t", T.alone + 0.3);

    // ---------------- L3 · 审计的人：找出推送资金的循环，问：有人拒收会怎样？
    KIT.cam(tl, T.l3 - 0.4, C.CZ[2], 1.2);
    out("#c1w", T.l3 - 0.3, 0.25);
    idle(1, T.l3); active(2, T.l3 + 0.2);
    cardIn("c2", T.l3 + 0.4);
    fin("#m2w", T.loop - 0.4, 0.3);
    K5.fly(tl, "m2w", T.loop - 0.2, ${f(A.au2.chute[0] - A.m2.lens[0] - 30)}, ${f(A.au2.chute[1] - A.m2.lens[1] - 40)}, 1.0);
    hl("#c2r0", T.loop);
    K7.gavel(tl, "au2", T.loop + 0.3);
    K7.refund(tl, "au2", T.loop + 0.9, "bounce", 0.8);
    pop("#c2r0t", T.loop + 1.0);
    pop("#z2-q", T.refuse - 0.1);
    pop("#c2q", T.refuse);
    K7.board(tl, "au2", T.refuse + 0.6, { red: true });

    // ---------------- L4 · 普通用户：只授权需要的数额，用完撤销
    KIT.cam(tl, T.l4 - 0.4, C.CZ[3], 1.2);
    out("#c2w, #m2w", T.l4 + 0.2, 0.25);
    idle(2, T.l4); active(3, T.l4 + 0.2);
    cardIn("c3", T.l4 + 0.4);
    pop("#z3-inf", T.l4 + 0.5);
    hl("#c3r0", T.need - 0.3);
    KIT.swap(tl, "#z3-inf", "#z3-amt", T.need, 0.3);
    KIT.swap(tl, "#z3-amt", "#z3-rev", T.revoke, 0.3);
    tl.to("#kc3", { opacity: 0.22, duration: 0.4 }, T.revoke);
    pop("#c3r0t", T.revoke + 0.3);

    // ---------------- L5 · 陌生代币：不卖、不领
    tl.fromTo("#cn3", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, T.odd - 0.3);
    K7.coinScale(tl, "cn3", T.odd - 0.3, 1.15, 0.3); K7.coinScale(tl, "cn3", T.odd + 0.05, 1, 0.3);
    pop("#z3-coin", T.odd);
    hl("#c3r1", T.odd);
    pop("#z3-no", T.sell);
    pop("#c3r1t", T.claim);

    // ---------------- L6 · TRON 上转 USDT：确认状态是成功，不只是已广播
    pop("#z3-ph0", T.l6 + 0.3);
    hl("#c3r2", T.l6 + 0.3);
    KIT.swap(tl, "#ph3-scr", "#ph3-scr2", T.ok6, 0.3);
    KIT.swap(tl, "#z3-ph0", "#z3-ph", T.ok6, 0.3);
    pop("#c3r2t", T.ok6 + 0.4);

    // ---------------- L7 · 回到开头：没收到钱，桥为什么记了一笔存款？
    KIT.cam(tl, T.l7 - 0.4, C.CH, 1.6);
    out("#c3w, #lpa3, #z3-rev, #z3-coin, #z3-no, #z3-ph, #z0-tg, #z0-lot, #z0-no, #z0-xb, #z1-coin, #z1-push, #z2-q", T.l7 - 0.4, 0.3);
    out("#lp0, #lp1, #lp2, #lp3", T.l7 - 0.4, 0.3);
    ["#h-eth", "#h-bnb", "#h-bm", "#h-bv"].forEach(function (s, i) { pop(s, T.back + 0.1 + i * 0.12); });
    pop("#ev", T.back + 0.3);
    pop("#qq2", T.nomoney);

    // ---------------- L8 · 成功 + 空返回当成到账；没问对方存不存在
    KIT.cam(tl, T.l8 - 0.3, C.CH2, 1.2);
    out("#qq2, #ev", T.l8 - 0.3, 0.25);
    out("#h-eth, #h-bnb, #h-bv", T.l8 - 0.3, 0.25);
    pop("#h-tg", T.empty - 0.2);
    pop("#h-okb", T.arrive);
    pop("#ans", T.arrive);
    K7.lotPlate(tl, "hlot", T.exist - 0.2, true, 3);
    pop("#h-lot", T.exist);

    // ---------------- L9 · 返回只是对方的说法
    out("#ans", T.l9 - 0.1, 0.25);
    pop("#ans2", T.say - 0.3);

    // ---------------- L10 · 看余额变化；前提是清楚会不会收税
    out("#ans2", T.l10 - 0.1, 0.25);
    pop("#ans3", T.bal - 0.2);
    KIT.grow(tl, "hsc", T.bal - 0.4); fin("#hsc", T.bal - 0.4, 0.2);
    K7.read(tl, "hsc", T.bal, "before", 0, 0.01);
    K7.read(tl, "hsc", T.bal + 0.3, "after", 0, 0.01);
    K7.diff(tl, "hsc", T.bal + 0.5, false, "差 = 0 → 没到账");
    pop("#h-sc", T.bal + 0.5);
    pop("#h-tax", T.pre);

    // ---------------- L11 · 对方未必按标准出牌，你的合约要自己核对 → 结束卡
    const tE = Math.min(T.self - 0.3, TOTAL - 2.5 - 2.4);
    out("#ans3, #h-bm, #h-lot, #h-tg, #h-okb, #h-sc, #h-tax", T.l11 - 0.4, 0.25);
    KIT.cam(tl, T.l11 - 0.4, C.CEND, 1.3);
    pop("#v-vm", T.l11 + 0.3);
    KIT.grow(tl, "vsc", T.l11 + 0.5); fin("#vsc", T.l11 + 0.5, 0.2);
    pop("#v-sc", T.l11 + 1.0);
    for (let i = 0; i < 4; i++) pop("#v-okb" + i, T.l11 + 1.0 + i * 0.3);
    out("#v-sc, #v-vm", tE, 0.2);
    tl.to("#veil", { opacity: 0.74, duration: 0.45, ease: "power1.inOut" }, tE + 0.1);
    tl.fromTo("#endcard", { opacity: 0, scale: 0.94, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, tE + 0.2);
    tl.set("#e-next, #e-note", { opacity: 0 }, 0);
    fin("#e-note", tE + 0.8, 0.3);
    fin("#e-next", Math.min(T.next + 0.2, TOTAL - 2.5 - 0.35), 0.3);
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

console.log("wrote story.html", html.length, "seg1 layout:", HK.FROM_SEG1, "total", TOTAL, D(T), D({ C0: C0.scale, CZ: CZ.map((c) => c.scale), CH: CH.scale, CH2: CH2.scale }));
