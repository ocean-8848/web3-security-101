// Generates compositions/story.html for ep07/seg5a「⑤ 授权风险」(one isometric world, one camera).
// Run: node src/build-story.mjs
import fs from "node:fs";
import { G, at, f, camAt, wlab, wpin, kitCss, runtimeJs, CHECK, BADGE } from "../../../kit/iso.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { P, ZA, ZB, ZC, off } from "./layout.mjs";
import { world, A, LSTART } from "./world.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const LN = T.lines.map((_, i) => lineAt(T, i));
const w = (term, line, nth = 0) => wordAt(T, term, { line, nth }).start;
const J = (v) => JSON.stringify(v);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];

// ------------------------------------------------------------------ labels (world, counter-scaled)
let labels = "";
const lab = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, (cls + " hide").trim(), a); };
const pin = (id, p, html, a = "c") => { labels += wpin(id, p, html, a); };
const up = (p, dz) => [p[0], p[1] - dz];

// zone A
lab("lb-you", off(A.alice.top, 70, 0), "你", "lab-g", "b");
lab("lb-alice", off(A.alice.top, 70, 0), "Alice", "lab-g", "b");
lab("lb-other", up(A.bob.top, 0), "另一个地址", "lab-g", "b");
lab("lb-bob", up(A.bob.top, 0), "Bob", "lab-r", "b");
lab("lb-appr", off(A.walA.top, -40, -30), "approve = 允许别人代你转出", "lab-cs", "b");
lab("lb-ex", off(A.alice.ground, -60, 40), "示例", "lab-g lab-sm", "t");
const KC = off(A.kcAto, 85, -150);
lab("lb-k100", KC, "额度 100", "", "l");
lab("lb-k0", KC, "额度 0", "lab-g", "l");
lab("lb-k50", KC, "额度 50", "", "l");
lab("lb-k0b", KC, "额度 0", "lab-g", "l");
const CT = off(A.ctr.top, 0, -6);
lab("lb-cq", CT, "Bob 最多拿走 ？", "lab-ink", "b");
lab("lb-c0", CT, "Bob 已拿走 0 枚", "lab-ink", "b");
lab("lb-c100", CT, "Bob 已拿走 100 枚", "lab-rs", "b");
lab("lb-c150", CT, "Bob 已拿走 <b style=\"font-size:44px\">150</b> 枚", "lab-rs", "b");
lab("lb-c100b", CT, "Bob 已拿走 100 枚", "lab-ink", "b");
lab("lb-ans", off(A.ctr.top, 0, -90), "150 枚", "lab-rs", "b");
lab("lb-blk", off(A.blk.top, 30, 0), "区块", "lab-g lab-sm", "b");
lab("lb-stay", off(A.ctr.ground, 110, -20), "停在 100 · 不会再多拿", "lab-gs", "l");
pin("ck-stay", off(A.ctr.ground, 80, -20), CHECK("ckst", 52, "hide"));
// letters' own labels (move with the letters)
const LTXT = { A1: ["改成 50", ""], B1: ["花 100", "lab-rs"], B2: ["花 50", "lab-rs"], A2: ["减 50", ""], B3: ["花 100", "lab-rs"] };
for (const k of Object.keys(LTXT)) lab("lb-l" + k, off(A["l" + k].top, 0, -6), LTXT[k][0], (LTXT[k][1] + " lab-sm").trim(), "b");
pin("bx-A2", off(A.mp.route[5], -40, -110), BADGE("bxa2", 56, "hide"));
lab("lb-rb", off(A.mp.route[5], -40, 50), "回滚", "lab-rs", "t");

// zone B
lab("lb-user", A.user.top, "用户", "lab-g", "b");
lab("lb-inf", off(A.kcIstart, 0, -240), "额度 ∞", "lab-cs", "b");
lab("lb-proto", off(A.proto.top, 0, -10), "协议合约", "", "b");
lab("lb-pwn", off(A.proto.top, 0, -10), "协议被攻破", "lab-rs", "b");
lab("lb-atkB", off(A.atkB.top, 0, 0), "攻击者", "lab-rs", "b");
lab("lb-all", off(A.walB.ground, -20, 40), "钱包里全部这种代币", "lab-r", "t");
lab("lb-nodep", off(A.walB.top, -20, -10), "从没存进协议", "lab-ink", "b");
lab("lb-phish", off(A.phish.top, 0, 0), "钓鱼网站", "lab-rs", "b");
lab("lb-sig", off(A.phish.ground, 40, 50), "诱导签 approve / permit", "lab-rs", "t");

// zone C
lab("lb-rt", off(A.rt.top, 0, -20), "路由合约", "", "b");
lab("lb-hold", off(A.rt.top, 0, -20), "路由合约 · 持有用户授权", "lab-cs", "b");
lab("lb-users", off(A.wals[2].top, 0, -10), "授权过的用户", "lab-g", "b");
lab("lb-rule", off(A.rule.top, 0, -10), "规则 · 持有授权 → 禁止任意目标和任意 calldata", "lab-gs", "b");
lab("lb-atkC", A.atkC.top, "攻击者", "lab-rs", "b");
lab("lb-tf", off(A.pT.mid, 40, 40), "transferFrom（受害者 → 攻击者）", "lab-rs", "t");
lab("lb-vic", off(A.wals[1].top, 0, -10), "受害者", "lab-rs", "b");
lab("lb-tok", A.tok.top, "代币合约", "lab-g lab-sm", "b");
lab("lb-pool", off(A.route.ground, 0, 30), "池子地址：由用户填写", "", "t");
lab("lb-fake", A.fake.top, "攻击者的池子", "lab-rs", "b");
lab("lb-payer", off(A.fake.ground, 10, 40), "付款人 = 任意授权用户", "lab-rs", "t");
lab("lb-q1", off(A.cp.top, 0, -8), "刚才调用的地址？ ✓", "lab-gs", "b");
lab("lb-q2", off(A.cp.top, 0, -72), "真实池子？ 没问", "lab-rs", "b");
// the open input box on the router's slot (L16) and its sealed state (L24)
const IB = off(A.rt.slot, -150, -90);
pin("ib", IB, `<div class="ibox hide" id="ibx"><div class="ih">调用参数 · 用户填写</div>
  <div class="ir"><span class="k">目标</span><span class="v"><span class="vv" id="ib-t">任意</span></span></div>
  <div class="ir"><span class="k">calldata</span><span class="v"><span class="vv" id="ib-c">任意</span></span></div>
  <div class="seal" id="ib-seal"><span>禁止任意目标<br>禁止任意 calldata</span></div></div>`, "r");
pin("ck-ib", off(IB, -10, -130), CHECK("ckib", 60, "hide"));

// ------------------------------------------------------------------ cameras
const Cc = (pt, k, sx = 960, sy = 540) => camAt(pt, sx, sy, k);
const CAMS = {
  a0: Cc(off(ZA, -600, 80), 1.3, 900, 746),
  a1: Cc(off(ZA, -420, 150), 1.2, 900, 600),
  aw: Cc(off(ZA, 0, 60), 1.0, 960, 560),
  am: Cc(off(ZA, 30, 60), 0.9, 457, 416),
  b0: Cc(off(ZB, -220, 60), 1.1, 960, 600),
  b1: Cc(off(ZB, -40, 60), 1.0, 960, 590),
  ph: Cc(off(ZB, 260, -200), 0.9, 960, 560),
  c0: Cc(off(ZC, -330, -120), 0.95, 960, 590),
  c1: Cc(off(ZC, 40, -60), 0.95, 960, 600),
  c2: Cc(off(ZC, -60, 80), 0.95, 900, 620),
  c3: Cc(off(ZC, -230, 160), 0.9, 760, 760),
  end: Cc(off(ZC, -60, 220), 0.85, 780, 600),
};

// ------------------------------------------------------------------ times
const TM = {
  t0: w("授权", 0),
  appr: w("approve", 1), other: w("另一个地址", 1), out: w("代你转出", 1),
  q: w("最后一道题", 2), alice: w("Alice", 2), b100: w("100", 2), gai: w("改成", 2),
  bob3: w("Bob", 3), qiang: w("抢先", 3), most: w("最多", 3),
  a150: w("150", 4), spend: w("先花掉", 4), old: w("100", 4),
  newq: w("新额度", 5), again: w("再花", 5), n50: w("50", 5),
  race: w("approve", 6),
  m1: w("之一", 7), set0: w("先设成", 7), look: w("看旧额度", 7), setn: w("再设新值", 7),
  m2: w("之二", 8), sda: w("safeDecreaseAllowance", 8), rel: w("相对减少", 8), front: w("抢先", 8), rb: w("回滚", 8),
  force: w("forceApprove", 9), compat: w("兼容", 9), norace: w("不解决", 9),
  inf: w("无限授权", 10),
  pwn: w("攻破", 11), atk: w("攻击者", 11), take: w("转走", 11), all: w("全部", 11),
  nodep: w("从没", 12),
  phish: w("钓鱼网站", 13), sig: w("approve", 13), permit: w("permit", 13),
  combo: w("最危险", 14), any: w("任意调用", 14),
  router: w("路由合约", 15), hold: w("持有", 15),
  tgt: w("任意目标", 16), cd: w("calldata", 16),
  let: w("让它", 17), tf: w("transferFrom", 17), vic: w("受害者", 17), self: w("转给自己", 17),
  y23: w("2023", 18), sushi: w("Sushi", 18),
  pool: w("池子地址", 19), fill: w("用户填写", 19),
  own: w("自己的池子", 20), cbk: w("回调", 20), payer: w("付款人", 20),
  only: w("只问", 21), last: w("刚才调用", 21),
  notask: w("没有问", 22), real: w("真实的池子", 22),
  pub: w("公开分析", 23), m330: w("330", 23),
  rule: w("规则是", 24), hold2: w("持有授权", 24), ban: w("禁止", 24), cd2: w("calldata", 24),
};
const END = LN[24].speechEnd;

// ------------------------------------------------------------------ letter paths (canvas deltas from each letter's start)
const MP = A.mp, BL = A.blk.blocks[1];
const rr = MP.route; // entry → exit polyline
const dl = (k, pts) => pts.map((p) => sub(p, LSTART[k]));
const PATHS = {
  A1in: dl("A1", [rr[0], MP.slots[11]]),
  B1cut: dl("B1", [MP.slots[0]]),
  B1out: dl("B1", [rr[5], BL]),
  A1out: dl("A1", [rr[1], rr[2], rr[3], rr[4], rr[5], BL]),
  B2go: dl("B2", [off(BL, -40, 20)]),
  A2in: dl("A2", [rr[0], MP.slots[11]]),
  B3cut: dl("B3", [MP.slots[0]]),
  B3out: dl("B3", [rr[5], BL]),
  A2out: dl("A2", [rr[1], rr[2], rr[3], rr[4], rr[5], off(BL, -60, 30)]),
  A2back: dl("A2", [off(rr[5], -40, 20)]),
};
// ∞ card: user's hand → protocol slot → attacker
const KI0 = A.kcIstart;
const KI = { toProto: sub(off(A.proto.slot, 0, 140), KI0), toAtk: sub(off(A.atkB.ground, 60, 20), KI0) };
// Alice's card: wallet → Bob's hand
const KA = sub(A.kcAto, A.kcAstart);
// coins → attacker
const GB = { g1: sub(off(A.atkB.ground, -60, 10), A.gB1.ground), g2: sub(off(A.atkB.ground, -20, 40), A.gB2.ground) };
const GC = sub(off(A.atkC.ground, -70, 20), A.gC.ground);

// ------------------------------------------------------------------ screen cards
const termCard = (id, term, def) => `<div class="tcard hide" id="${id}"><div class="tt">${term}</div><div class="td">${def}</div></div>`;
const TERMS = [
  ["tc1", "抢先打包", "让自己的交易排在别人那笔前面执行", TM.qiang],
  ["tc2", "forceApprove", "兼容要求先归零再改额度的代币", TM.force + 0.1],
  ["tc3", "无限授权", "额度设成最大值 · 永远用不完", TM.inf],
  ["tc4", "路由合约", "替用户去调用各个池子的合约", TM.router],
  ["tc5", "calldata", "告诉对方调用哪个函数、带什么参数", TM.cd - 0.1],
];
const chip = (id, txt, cls = "") => `<span class="pc ${cls}" id="${id}">${txt}</span>`;
const arrow = (id) => `<span class="pa" id="${id}">→</span>`;
const panel = `<div class="mit hide" id="mit">
  <div class="mh">缓解 approve 竞态</div>
  <div class="mr" id="mr1"><span class="mn">①</span>${chip("p1a", "approve(0)")}${arrow("p1x")}${chip("p1b", "旧额度被花了吗？")}${arrow("p1y")}${chip("p1c", "approve(50)")}</div>
  <div class="mr" id="mr2"><span class="mn">②</span>${chip("p2a", "safeDecreaseAllowance(50)")}${arrow("p2x")}${chip("p2b", "已被花掉 → 回滚", "red")}</div>
  <div class="mr" id="mr3"><span class="mn"></span>${chip("p3a", "forceApprove → 兼容 USDT 类代币", "gray")}<span class="pc strike" id="p3b">解决竞态</span></div>
</div>`;
const CE = { x: 800, y: 118, w: 1090 };
const cardE = `<div class="k-code hide" id="cardE" style="left:${CE.x}px;top:${CE.y}px;width:${CE.w}px">
  <div class="c-head">路由的回调校验<span class="c-tag">Solidity · 简化</span></div>
  <div class="c-row" id="ce0"><span id="ce0h">require(msg.sender == lastCalledPool);</span><span class="c-chip" id="ce0c" style="opacity:0">没检查是不是真实池子</span></div>
  <div class="c-row" id="ce1">(address tokenIn, address from) = abi.decode(data, …);</div>
  <div class="c-row" id="ce2">IERC20(tokenIn).safeTransferFrom(from, msg.sender, amt);</div>
  <div class="c-row" id="ce3"><span class="c-cm">// from = 任意授权过的用户</span></div>
</div>`;
const SEC = SCRIPT.sections;

// ------------------------------------------------------------------ html
const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 88px; }
    .tcard { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px; padding: 14px 24px 16px 22px; box-shadow: 0 12px 26px rgba(70,60,40,0.12); }
    .tcard .tt { font-size: 32px; font-weight: 900; color: #1c1c1c; line-height: 1.25; white-space: nowrap; }
    .tcard .td { margin-top: 6px; font-size: 29px; font-weight: 700; color: #4a463f; line-height: 1.3; }
    .card { position: absolute; left: 48px; top: 120px; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); padding: 20px 30px 22px; white-space: nowrap; }
    .card .ev-d { font-size: 30px; font-weight: 700; color: #6d685e; margin-bottom: 4px; }
    .card .ev-t { font-size: 44px; font-weight: 900; }
    .card .ev-r { margin-top: 12px; font-size: 36px; font-weight: 900; display: flex; align-items: center; gap: 14px; }
    .card .ev-r .lab { position: static; }
    .card .red { color: #c3352b; }
    #kw { position: absolute; left: 0; right: 0; top: 118px; text-align: center; }
    #kw .k-big { display: inline-block; font-size: 56px; background: #fffdf8; border-radius: 18px; padding: 12px 40px 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    #kw .k-big b { color: #c3352b; }
    .mit { position: absolute; left: 1010px; top: 590px; width: 870px; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); padding: 18px 26px 20px; }
    .mit .mh { font-size: 34px; font-weight: 900; margin-bottom: 10px; }
    .mit .mr { display: flex; align-items: center; gap: 10px; height: 64px; }
    .mit .mn { width: 40px; font-size: 34px; font-weight: 900; color: #1d93ba; }
    .mit .pc { font-size: 30px; font-weight: 800; padding: 4px 14px 6px; border-radius: 10px; background: #e5f4f9; color: #17809f; white-space: nowrap; opacity: 0; }
    .mit .pc.red { background: #fdeae7; color: #c3352b; }
    .mit .pc.gray { background: #f1ede5; color: #1c1c1c; }
    .mit .pc.strike { background: #fdeae7; color: #c3352b; position: relative; }
    .mit .pc.strike::after { content: ""; position: absolute; left: 6px; right: 6px; top: 52%; height: 4px; background: #e0453a; transform: scaleX(var(--sx, 0)); transform-origin: 0 50%; }
    .mit .pa { font-size: 30px; font-weight: 900; color: #8a8478; opacity: 0; }
    .mit .pc, .mit .pa { font-family: "Noto Sans SC", sans-serif; }
    .mit #p1a, .mit #p1c, .mit #p2a { font-family: "JetBrains Mono", "Noto Sans SC", monospace; font-weight: 700; }
    .ibox { width: 420px; background: #ffffff; border: 4px solid #e0453a; border-radius: 14px; padding: 12px 18px 14px; box-shadow: 0 12px 26px rgba(70,60,40,0.14); position: relative; overflow: hidden; }
    .ibox .ih { font-size: 28px; font-weight: 800; color: #6d685e; margin-bottom: 6px; white-space: nowrap; }
    .ibox .ir { display: flex; align-items: center; gap: 12px; height: 54px; }
    .ibox .k { width: 140px; font-size: 30px; font-weight: 800; font-family: "JetBrains Mono", "Noto Sans SC", monospace; white-space: nowrap; }
    .ibox .v { flex: 1; height: 44px; border: 2px dashed #b8b0a1; border-radius: 8px; display: flex; align-items: center; padding-left: 12px; }
    .ibox .vv { font-size: 32px; font-weight: 900; color: #c3352b; opacity: 0; }
    .ibox .seal { position: absolute; inset: 0; background: repeating-linear-gradient(135deg, #8d939b 0 18px, #9aa0a8 18px 36px); display: flex; align-items: center; justify-content: center; opacity: 0; }
    .ibox .seal span { background: #1c1c1c; color: #fff; font-size: 30px; font-weight: 900; line-height: 1.3; padding: 6px 16px 8px; border-radius: 10px; white-space: nowrap; text-align: center; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world()}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div id="kw"><div class="k-big hide" id="kw1"><b>approve 竞态</b> · 100 + 50 = 150</div><div class="k-big hide" id="kw2" style="position:absolute;left:50%;top:0;transform:translateX(-50%)">最危险的组合 · <b>任意调用 + 授权</b></div></div>
      ${panel}
      ${cardE}
      <div class="card hide" id="ev">
        <div class="ev-d">2023 年 4 月</div>
        <div class="ev-t">Sushi · RouteProcessor2</div>
        <div class="ev-r" id="ev-loss" style="opacity:0"><span class="red">约 330 万美元被盗</span><span class="lab lab-g lab-sm">Hacken · The Block 分析</span></div>
      </div>
      ${TERMS.map(([id, t, d]) => termCard(id, t, d)).join("")}
      ${pills(5, { sections: SEC })}
      <div class="k-title" id="ttl-card"><div class="t-main">⑤ 授权风险</div><div class="t-sub">approve 竞态 · 无限授权 · 任意调用</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E2.runtimeExtJs()}
${E3.runtimeExtJs()}
${E4.runtimeExtJs()}
${E5.runtimeExtJs()}
${E6.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${J(CAMS)};
      const PATHS = ${J(PATHS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const fade = (sel, t, to, d) => tl.to(sel, { opacity: to, duration: d || 0.3, ease: "power1.out" }, t);
      const hideGrow = (id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); };
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      const swapLab = (a, b, t) => { out(a, t, 0.15); pop(b, t + 0.1); };
      // moving things: an SVG wrapper <g> plus its label pins, along canvas-delta polylines (seek-safe progress tween)
      const last = {};
      function path(key, els, t, dur, pts, opt) {
        opt = opt || {};
        const P0 = last[key] || [0, 0], Pp = [P0].concat(pts), L = [0];
        for (let i = 1; i < Pp.length; i++) L.push(L[i - 1] + Math.hypot(Pp[i][0] - Pp[i - 1][0], Pp[i][1] - Pp[i - 1][1]));
        last[key] = Pp[Pp.length - 1];
        const tot = L[L.length - 1] || 1, lift = opt.lift || 0, o = { k: 0 };
        const nodes = els.map((s) => document.querySelector(s));
        tl.fromTo(o, { k: 0 }, { k: 1, duration: dur, ease: opt.ease || "power1.inOut", immediateRender: false, onUpdate: function () {
          const d = o.k * tot; let j = 1; while (j < Pp.length - 1 && L[j] < d) j++;
          const q = (d - L[j - 1]) / ((L[j] - L[j - 1]) || 1);
          const x = Pp[j - 1][0] + (Pp[j][0] - Pp[j - 1][0]) * q, y = Pp[j - 1][1] + (Pp[j][1] - Pp[j - 1][1]) * q - lift * Math.sin(Math.PI * o.k);
          nodes.forEach((n) => { if (n instanceof SVGElement) n.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ")"); else n.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)"; });
        } }, t);
      }
      const L = (k) => ["#m" + k, "#lb-l" + k + "-pin"];

      KIT.camSet(tl, CAMS.a0);
      ["bo", "ct", "ab", "ph", "ac", "fk", "cbk", "rd", "rl", "wb", "us", "pr", "gB1", "gB2"].forEach(hideGrow);
      tl.set("#prR", { opacity: 0 }, 0);

      // ===== 0–1.75 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.3);

      // ===== L0 授权: the road sign; Alice and her wallet
      pop("#lb-you", ${f(TM.t0 - 0.4)});

      // ===== L1 approve = let another address move your tokens: the card leaves the wallet for Bob
      KIT.cam(tl, ${f(LN[1].start - 0.3)}, CAMS.a1, 1.2);
      pop("#lb-appr", ${f(TM.appr)});
      grow("bo", ${f(TM.other - 0.4)}, 0.5); pop("#lb-other", ${f(TM.other)});
      path("kA", ["#mkA"], ${f(TM.out - 0.3)}, 1.0, [${J(KA)}], { lift: 60, ease: "power2.inOut" });

      // ===== L2 example: Alice approved Bob 100, wants 50
      KIT.cam(tl, ${f(LN[2].start - 0.1)}, CAMS.aw, 1.4);
      out("#lb-appr", ${f(LN[2].start - 0.1)}, 0.2);
      pop("#lb-ex", ${f(TM.q)});
      swapLab("#lb-you", "#lb-alice", ${f(TM.alice - 0.1)});
      swapLab("#lb-other", "#lb-bob", ${f(TM.alice + 0.5)});
      pop("#lb-k100", ${f(TM.b100)});
      grow("ct", ${f(TM.b100 + 0.3)}, 0.4); pop("#lb-blk", ${f(TM.b100 + 0.5)});
      tl.set("#mA1", { opacity: 1 }, ${f(TM.gai - 0.2)}); pop("#lb-lA1", ${f(TM.gai - 0.2)});
      path("A1", L("A1"), ${f(TM.gai + 0.3)}, 1.3, PATHS.A1in);

      // ===== L3 Bob cuts in front
      tl.set("#mB1", { opacity: 1 }, ${f(TM.bob3)}); pop("#lb-lB1", ${f(TM.bob3)});
      path("B1", L("B1"), ${f(TM.qiang)}, 1.0, PATHS.B1cut, { lift: 90, ease: "power2.inOut" });
      pop("#lb-cq", ${f(TM.most)});

      // ===== L4 150; first he spends the old 100
      pop("#lb-ans", ${f(TM.a150)}, 0.3);
      out("#lb-ans", ${f(TM.spend - 0.3)}, 0.2);
      swapLab("#lb-cq", "#lb-c0", ${f(TM.spend - 0.3)});
      path("B1", L("B1"), ${f(TM.spend)}, 0.8, PATHS.B1out, { ease: "power1.in" });
      out("#mB1, #lb-lB1", ${f(TM.spend + 0.8)}, 0.2);
      KIT.count(tl, "ct", ${f(TM.old - 0.2)}, 0.6, 0, 100);
      swapLab("#lb-c0", "#lb-c100", ${f(TM.old + 0.2)});
      swapLab("#lb-k100", "#lb-k0", ${f(TM.old + 0.2)});

      // ===== L5 the new allowance lands, he spends 50 more → 150 (key frame)
      path("A1", L("A1"), ${f(TM.newq - 0.2)}, 1.0, PATHS.A1out, { ease: "power1.inOut" });
      out("#mA1, #lb-lA1", ${f(TM.newq + 0.8)}, 0.2);
      swapLab("#lb-k0", "#lb-k50", ${f(TM.newq + 0.7)});
      tl.set("#mB2", { opacity: 1 }, ${f(TM.again - 0.4)}); pop("#lb-lB2", ${f(TM.again - 0.4)});
      path("B2", L("B2"), ${f(TM.again - 0.2)}, 0.6, PATHS.B2go, { lift: 120, ease: "power2.inOut" });
      out("#mB2, #lb-lB2", ${f(TM.again + 0.45)}, 0.2);
      KIT.count(tl, "ct", ${f(TM.n50)}, 0.5, 100, 150);
      swapLab("#lb-c100", "#lb-c150", ${f(TM.n50 + 0.3)});
      swapLab("#lb-k50", "#lb-k0b", ${f(TM.n50 + 0.3)});

      // ===== L6 approve race
      pop("#kw1", ${f(TM.race - 0.2)}, 0.35);

      // ===== L7 mitigation ①: set 0, check, set the new value
      out("#kw1", ${f(LN[7].start + 0.6)}, 0.2);
      KIT.cam(tl, ${f(LN[7].start - 0.2)}, CAMS.am, 1.2);
      pop("#mit", ${f(TM.m1 - 0.2)}, 0.35);
      fade("#p1a", ${f(TM.set0)}, 1); fade("#p1x", ${f(TM.look - 0.2)}, 1); fade("#p1b", ${f(TM.look)}, 1);
      fade("#p1y", ${f(TM.setn - 0.2)}, 1); fade("#p1c", ${f(TM.setn)}, 1);

      // ===== L8 mitigation ②: relative decrease — the replay reverts, the counter stays at 100
      fade("#p2a", ${f(TM.sda)}, 1);
      out("#lb-c150, #lb-k0b", ${f(TM.m2 - 0.1)}, 0.2);
      KIT.count(tl, "ct", ${f(TM.m2)}, 0.4, 150, 0);
      pop("#lb-c0", ${f(TM.m2 + 0.3)}); pop("#lb-k100", ${f(TM.m2 + 0.3)});
      tl.set("#mA2", { opacity: 1 }, ${f(TM.sda)}); pop("#lb-lA2", ${f(TM.sda)});
      path("A2", L("A2"), ${f(TM.sda + 0.3)}, 1.2, PATHS.A2in);
      tl.set("#mB3", { opacity: 1 }, ${f(TM.rel)}); pop("#lb-lB3", ${f(TM.rel)});
      path("B3", L("B3"), ${f(TM.rel + 0.3)}, 0.8, PATHS.B3cut, { lift: 90, ease: "power2.inOut" });
      path("B3", L("B3"), ${f(TM.front - 0.4)}, 0.7, PATHS.B3out, { ease: "power1.in" });
      out("#mB3, #lb-lB3", ${f(TM.front + 0.3)}, 0.2);
      KIT.count(tl, "ct", ${f(TM.front + 0.2)}, 0.5, 0, 100);
      swapLab("#lb-c0", "#lb-c100b", ${f(TM.front + 0.5)});
      swapLab("#lb-k100", "#lb-k0", ${f(TM.front + 0.5)});
      fade("#p2x", ${f(TM.front)}, 1);
      path("A2", L("A2"), ${f(TM.rb - 1.0)}, 0.8, PATHS.A2out, { ease: "power1.in" });
      path("A2", L("A2"), ${f(TM.rb - 0.15)}, 0.45, PATHS.A2back, { ease: "back.out(2)" });
      pop("#bxa2", ${f(TM.rb)}, 0.3);
      fade("#p2b", ${f(TM.rb)}, 1);
      pop("#lb-rb", ${f(TM.rb)});
      pop("#lb-stay", ${f(TM.rb + 0.25)}); pop("#ckst", ${f(TM.rb + 0.3)}, 0.3);

      // ===== L9 forceApprove only fixes compatibility
      out("#mA2, #lb-lA2, #lb-rb", ${f(LN[9].start - 0.2)}, 0.2);
      fade("#p3a", ${f(TM.compat)}, 1);
      fade("#p3b", ${f(TM.norace - 0.1)}, 1);
      tl.fromTo("#p3b", { "--sx": 0 }, { "--sx": 1, duration: 0.4, ease: "power2.out", immediateRender: false }, ${f(TM.norace + 0.4)});

      // ===== L10 infinite approval: the ∞ card goes into the protocol
      KIT.cam(tl, ${f(LN[10].start - 0.3)}, CAMS.b0, 1.4);
      out("#mit, #lb-stay, #ckst, #lb-c100b, #lb-k0", ${f(LN[10].start - 0.2)}, 0.25);
      ["wb", "pr", "us", "gB1", "gB2"].forEach((id, i) => grow(id, ${f(LN[10].start - 0.2)} + i * 0.12, 0.5));
      out("#lb-blk", ${f(TM.inf - 1.6)}, 0.2);
      pop("#lb-user", ${f(TM.inf - 1.4)}); pop("#lb-proto", ${f(TM.inf - 1.2)});
      tl.set("#mkI", { opacity: 1 }, ${f(TM.inf - 0.6)});
      tl.fromTo("#mkI", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, ${f(TM.inf - 0.6)});
      pop("#lb-inf", ${f(TM.inf)});
      out("#lb-inf", ${f(TM.inf + 0.9)}, 0.15);
      path("kI", ["#mkI", "#lb-inf-pin"], ${f(TM.inf + 0.7)}, 0.9, [${J(KI.toProto)}], { lift: 60 });

      // ===== L11 protocol hacked: the attacker gets the card, the whole balance leaves the wallet
      KIT.cam(tl, ${f(LN[11].start)}, CAMS.b1, 1.2);
      fade("#prR", ${f(TM.pwn - 0.2)}, 1, 0.35);
      swapLab("#lb-proto", "#lb-pwn", ${f(TM.pwn - 0.2)});
      grow("ab", ${f(TM.atk - 0.4)}, 0.5); pop("#lb-atkB", ${f(TM.atk)});
      path("kI", ["#mkI"], ${f(TM.atk + 0.2)}, 0.8, [${J(KI.toAtk)}], { lift: 80 });
      KIT.door(tl, "wb", ${f(TM.take - 0.3)}, 105, 0.8);
      path("g1", ["#gB1"], ${f(TM.take)}, 1.0, [${J(GB.g1)}], { lift: 70 });
      path("g2", ["#gB2"], ${f(TM.take + 0.35)}, 1.0, [${J(GB.g2)}], { lift: 70 });
      pop("#lb-all", ${f(TM.all)});

      // ===== L12 even if you never deposited
      pop("#lb-nodep", ${f(TM.nodep - 0.1)});

      // ===== L13 phishing sites ask for approve / permit
      KIT.cam(tl, ${f(LN[13].start - 0.2)}, CAMS.ph, 1.3);
      out("#lb-all", ${f(LN[13].start)}, 0.2);
      grow("ph", ${f(TM.phish)}, 0.6); pop("#lb-phish", ${f(TM.phish + 0.4)});
      pop("#lb-sig", ${f(TM.sig - 0.1)});

      // ===== L14 the most dangerous combo: any call + approval → the router
      KIT.cam(tl, ${f(LN[14].start - 0.3)}, CAMS.c0, 1.6);
      out("#lb-phish, #lb-sig, #lb-nodep, #lb-pwn, #lb-atkB, #lb-user", ${f(LN[14].start - 0.3)}, 0.2);
      pop("#kw2", ${f(TM.combo + 0.3)}, 0.35);
      pop("#lb-rt", ${f(TM.any)});

      // ===== L15 the router holds users' approvals
      out("#kw2", ${f(LN[15].start - 0.1)}, 0.2);
      swapLab("#lb-rt", "#lb-hold", ${f(TM.hold)});
      pop("#lb-users", ${f(TM.router + 0.3)});
      ${[0, 1, 2, 3].map((i) => `tl.fromTo("#cglow${i}", { opacity: 0 }, { opacity: 0.35, duration: 0.25, immediateRender: false }, ${f(TM.hold)} + ${i} * 0.18); tl.fromTo("#lead${i}", { opacity: 0.85 }, { opacity: 1, strokeWidth: 5, duration: 0.25, immediateRender: false }, ${f(TM.hold)} + ${i} * 0.18);`).join("\n      ")}

      // ===== L16 …and lets the user pick any target and any calldata
      KIT.cam(tl, ${f(LN[16].start - 0.2)}, CAMS.c1, 1.2);
      out("#lb-users", ${f(LN[16].start)}, 0.2);
      out("#lb-hold, #lb-rt", ${f(LN[16].start)}, 0.2);
      grow("ac", ${f(LN[16].start)}, 0.5); pop("#lb-atkC", ${f(LN[16].start + 0.4)});
      pop("#ibx", ${f(TM.tgt - 0.6)}, 0.3);
      fade("#ib-t", ${f(TM.tgt)}, 1, 0.2); fade("#ib-c", ${f(TM.cd)}, 1, 0.2);

      // ===== L17 → transferFrom(victim → attacker)
      fade("#pTg", ${f(TM.let)}, 1, 0.4);
      KITX01.dash(tl, "pT-flow", ${f(TM.tf)}, 2.6, -220);
      fade("#pT-flow", ${f(TM.tf)}, 1, 0.2);
      pop("#lb-tok", ${f(TM.let + 0.3)});
      pop("#lb-tf", ${f(TM.tf)});
      pop("#lb-vic", ${f(TM.vic)});
      path("gC", ["#gC"], ${f(TM.vic + 0.2)}, 1.4, [${J(GC)}], { lift: 140, ease: "power2.inOut" });

      // ===== L18 Sushi RouteProcessor2 (2023-04)
      out("#lb-tf, #lb-vic, #lb-tok, #lb-hold, #pT-flow", ${f(LN[18].start - 0.1)}, 0.2);
      out("#ibx", ${f(LN[18].start - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LN[18].start)}, CAMS.c2, 1.4);
      pop("#ev", ${f(TM.y23)}, 0.35);

      // ===== L19 the pool address is user-supplied
      pop("#lb-pool", ${f(TM.pool)});
      grow("rd", ${f(TM.pool - 0.4)}, 0.5);

      // ===== L20 the attacker's own pool; in the callback, any approved user becomes the payer
      grow("fk", ${f(TM.own - 0.4)}, 0.5); pop("#lb-fake", ${f(TM.own)});
      fade("#pFg", ${f(TM.own + 0.6)}, 1, 0.3);
      fade("#pF-flow", ${f(TM.own + 0.8)}, 1, 0.2);
      KITX01.dash(tl, "pF-flow", ${f(TM.own + 0.8)}, 1.6, 160);
      grow("cbk", ${f(TM.cbk - 0.5)}, 0.4);
      KITX04.callArm(tl, "cbk", ${f(TM.cbk)}, 1, 0.7);
      pop("#lb-payer", ${f(TM.payer - 0.1)});
      pop("#cardE", ${f(TM.payer + 0.3)}, 0.35);

      // ===== L21 the callback check only asks "is it the address we just called?"
      KIT.cam(tl, ${f(LN[21].start - 0.2)}, CAMS.c3, 1.0);
      tl.to("#ce0h", { backgroundColor: "rgba(42,163,201,0.22)", duration: 0.3 }, ${f(TM.only)});
      pop("#lb-q1", ${f(TM.last)});
      KIT.arm(tl, "cpk", ${f(TM.last + 0.4)}, true, 0.6);

      // ===== L22 …never "is it a real pool?" (key frame)
      pop("#lb-q2", ${f(TM.notask)});
      tl.to("#ce0h", { backgroundColor: "rgba(224,69,58,0.16)", duration: 0.3 }, ${f(TM.real - 0.2)});
      fade("#ce0c", ${f(TM.real)}, 1, 0.3);

      // ===== L23 ~3.3M stolen (third-party analysis)
      fade("#ev-loss", ${f(TM.pub)}, 1, 0.3);

      // ===== L24 the rule: approval holders must not allow any target / any calldata
      out("#cardE", ${f(LN[24].start - 0.2)}, 0.25);
      out("#ev, #lb-payer, #lb-q1, #lb-q2, #lb-pool, #pF-flow, #lb-fake", ${f(LN[24].start)}, 0.25);
      KITX04.callArm(tl, "cbk", ${f(LN[24].start)}, 0, 0.6);
      KIT.cam(tl, ${f(LN[24].start - 0.1)}, CAMS.end, 1.5);
      grow("rl", ${f(TM.rule)}, 0.6); pop("#lb-rule", ${f(TM.hold2)}, 0.3);
      fade("#ib-t, #ib-c", ${f(LN[24].start)}, 0, 0.01);
      pop("#ibx", ${f(TM.ban - 0.4)}, 0.3);
      fade("#ib-seal", ${f(TM.ban + 0.2)}, 1, 0.3);
      tl.fromTo("#ib-seal", { y: -60 }, { y: 0, duration: 0.35, ease: "power3.in", immediateRender: false }, ${f(TM.ban + 0.2)});
      pop("#ckib", ${f(TM.cd2)}, 0.3);

      // ===== term cards (top-left, one at a time, ~3.4 s each)
      ${TERMS.map(([id, , , t]) => `pop("#${id}", ${f(t)}, 0.3); out("#${id}", ${f(t + 3.4)}, 0.2);`).join("\n      ")}

      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL, "end", END);
