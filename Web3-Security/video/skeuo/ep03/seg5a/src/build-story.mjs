// Generates compositions/story.html for ep03/seg5a「⑤ 回滚与Gas」(one isometric world, one camera).
// Run: node src/build-story.mjs
import fs from "node:fs";
import { at, Wp, f, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, kitCss, runtimeJs, CE } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { wordAt as _wa } from "../../../kit/timing.mjs";
import { termCss, termHtml, termJs } from "../../kit-ext/termcards.mjs";
import { jerrycan, catchNet, failBlock, pipe, arrowZ } from "./props.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
// 术语卡（RETROFIT-deps 第 2 节）
const TERMS = [
  { id: 'tm1', term: '调用帧', def: '每一次调用各自的执行现场', at: _wa(T, '调用帧', { line: 1 }).start },
  { id: 'tm2', top: 440, term: 'CEI', def: '先检查、再改状态、最后外部交互', at: _wa(T, 'CEI', { line: 8 }).start },
  { id: 'tm3', term: 'Fusaka · Glamsterdam', def: '以太坊协议升级的代号', at: _wa(T, 'Fusaka', { line: 9 }).start },
  { id: 'tm4', top: 484, term: 'SafeMath', def: '0.8 以前用来检查溢出的算术库', at: _wa(T, 'SafeMath', { line: 10 }).start },
];
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const L = (i) => lineAt(T, i);
const w = (term, opt) => wordAt(T, term, opt).start;

// ------------------------------------------------------------------ world layout (u, v) — see SPEC.md
const P = {
  user: { u: -780, v: 280 },
  A: { u: 0, v: 0 }, B: { u: 460, v: 0 }, C: { u: 920, v: 0 },
  cab: { u: -380, v: -400 },
  fs1: { u: 260, v: -640 }, fs2: { u: 860, v: -640 },
  net: { u: 860, v: -640 },
  gA: { u: -430, v: 300 }, gB: { u: 330, v: 360 },
  wallet: { u: 2300, v: 1000 }, can: { u: 2300, v: 1640 }, lock: { u: 1980, v: 1060 },
  solc: { u: -900, v: 1700 }, tcab: { u: -440, v: 1720 }, hg: { u: -200, v: 1830 },
  env: { u: -560, v: 150 },
};

const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const A_ = {};
const mk = (key, fn, o, opts) => { const r = fn(o, opts); A_[key] = r.anchors; add(o, r.svg); return r; };

mk("user", O.person, P.user, { id: "user", role: "signer" });
mk("A", X.contractMachine, P.A, { id: "mA", name: "A" });
mk("B", X.contractMachine, P.B, { id: "mB", name: "B" });
mk("C", X.contractMachine, P.C, { id: "mC", name: "C" });
mk("cab", X.slotCabinet, P.cab, { id: "cab", n: 3, fill: { 0: [{ bytes: 20, color: "teal" }, { bytes: 8, color: "green" }] } });
mk("fs1", X.frameStack, P.fs1, { id: "fs1", filled: 1 });
mk("fs2", X.frameStack, P.fs2, { id: "fs2" });
mk("gA", X.gasGauge, P.gA, { id: "gA", value: 1 });
mk("gB", X.gasGauge, P.gB, { id: "gB", value: 0.1 });
mk("wallet", O.hotWallet, P.wallet, { id: "wal" });
mk("lock", O.padlock, P.lock, { id: "lock" });
mk("solc", X.contractMachine, P.solc, { id: "solc", name: "solc", tone: "gray", code: ["0.8.24", "pragma"] });
{ // transient drawer: half-transparent one-drawer cabinet
  const r = X.slotCabinet(P.tcab, { id: "tcab", n: 1, title: "Transient", fill: { 0: [{ bytes: 1, color: "green" }] } });
  A_.tcab = r.anchors; add(P.tcab, `<g id="tcab-wrap" opacity="0">${r.svg}</g>`);
}
mk("hg", O.hourglass, P.hg, { id: "hg" });
// net in front of stack 2 (drawn after the stack)
{ const r = catchNet(P.net, { id: "net", z: 112 }); A_.net = r.anchors; add(P.net, r.svg, 60); }
// can (moves) — drawn above the wallet
const can = jerrycan(P.can, { id: "can" }); A_.can = can.anchors; add(P.can, can.svg, 200);
// pipe for call{value} (L8): from the front, straight into the wallet door
const pp = pipe(P.wallet, [[0, 820, 70], [0, 420, 70], [0, 150, 70]], { id: "pipe" });
add({ u: P.wallet.u, v: P.wallet.v + 100 }, pp.svg, 2);
// envelope (L12) — flat on a z-lift group so it rides in front of the machines
const env = O.envelope({ u: 0, v: 0 }, { id: "env", w: 110, h: 72 });
// failure blocks (L4)
const fbC = failBlock({ u: P.fs2.u, v: P.fs2.v + 60 }, 150, { id: "fbC" });
const fbB = failBlock({ u: P.fs2.u + 40, v: P.fs2.v + 60 }, 92, { id: "fbB" });
// bubble arrows on stack 1 (front-left post side)
const arrows = arrowZ("ar1", P.fs1, -150, 90, 150, 100) + arrowZ("ar2", P.fs1, -150, 90, 92, 42);

items.sort((a, b) => a.y - b.y);
const envPos = (u) => at({ u, v: 150 }, 0, 0, 96);
const world = worldSvg("wsvg", gridSvg({ u0: -2400, u1: 3400, v0: -2200, v1: 2600 }) +
  items.map((x) => x.svg).join("\n") + arrows + fbC.svg + fbB.svg +
  `<g id="env-g" opacity="0"><g transform="translate(${f(envPos(P.env.u)[0])},${f(envPos(P.env.u)[1])})">${env.svg}</g></g>`, [-2000, -2000, 5600, 4200]);

// ------------------------------------------------------------------ labels
const SEC = SCRIPT.sections;
let labels = "";
const lab = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, (cls + " hide").trim(), a); };
lab("lb-A", A_.A.top, "合约 A", "lab-sm");
lab("lb-B", A_.B.top, "合约 B", "lab-sm");
lab("lb-C", A_.C.top, "合约 C", "lab-sm");
lab("lb-gA", A_.gA.top, "A 的 gas", "lab-sm");
lab("lb-fs1", A_.fs1.top, "调用帧", "lab-sm");
lab("lb-cab", A_.cab.top, "A 的存储", "lab-sm");
lab("lb-oog", [A_.gA.top[0], A_.gA.top[1] - 60], "gas 用完 → 回滚", "lab-rs");
lab("lb-req", A_.fs1.top, "require / revert", "lab-ink");
lab("lb-bub", [A_.fs1.center[0] - 150, A_.fs1.center[1]], "冒泡 C → B → A", "lab-rs", "r");
lab("lb-low", A_.fs2.top, "低级 call", "lab-ink");
lab("lb-nob", [A_.fs2.center[0] + 160, A_.fs2.center[1] + 40], "不冒泡 · B、A 不回滚", "lab-gs", "l");
lab("lb-catch", [A_.net.top[0] + 120, A_.net.top[1]], "try / catch", "lab-cs", "l");
lab("lb-c-ok", [A_.net.center[0] + 150, A_.net.center[1] + 40], "接住 C 的失败", "lab-gs", "l");
lab("lb-c-no", [A_.net.center[0] + 150, A_.net.center[1] + 120], "接不住 B 自己的失败", "lab-rs", "l");
lab("lb-gB", A_.gB.top, "B 的 gas", "lab-sm");
lab("lb-B-out", [A_.gB.top[0], A_.gB.top[1] - 60], "B 耗尽", "lab-rs");
lab("lb-A-fin", [A_.gA.top[0], A_.gA.top[1] - 60], "A 用 1/64 收尾 ✓", "lab-gs");
lab("lb-eip150", [A_.gA.ground[0] - 90, A_.gA.ground[1] - 80], "EIP-150", "lab-g", "r");
lab("lb-can", A_.can.top, "只有 2300 gas", "lab-cs");
lab("lb-old", [A_.can.top[0], A_.can.top[1] - 62], "曾当作防重入", "lab-g old");
lab("lb-wal", A_.wallet.top, "合约钱包", "");
lab("lb-fail", [A_.wallet.front[0] + 80, A_.wallet.front[1] - 40], "转账失败", "lab-rs", "l");
lab("lb-eips", [A_.wallet.top[0], A_.wallet.top[1] - 62], "gas 价格调整 · EIP-1884 · EIP-2929", "lab-g");
lab("lb-pipe", [at(P.wallet, -40, 600, 80)[0] - 30, at(P.wallet, -40, 600, 80)[1] + 10], "call 转账", "lab-cs", "r");
lab("lb-cei", A_.lock.top, "CEI · 重入锁", "lab-gs");
lab("lb-fus", [A_.gA.hub[0] + 140, A_.gA.hub[1] + 60], "Fusaka", "lab-cs", "l");
lab("lb-gla", [A_.gA.hub[0] + 140, A_.gA.hub[1] + 120], "Glamsterdam · 尚未上线", "lab-g", "l");
lab("lb-fix", [A_.gA.top[0], A_.gA.top[1] - 4], "<s>固定 gas 够用</s>", "lab-r", "b");
lab("lb-solc", [A_.solc.top[0] + 70, A_.solc.top[1] + 70], "编译器 solc", "", "l");
lab("lb-tcab", A_.tcab.top, "瞬态存储 · 只在本交易有效", "lab-cs");
lab("lb-tlock", [A_.tcab.drawers[0][0] + 160, A_.tcab.drawers[0][1] + 10], "低成本重入锁", "lab-gs", "l");
lab("lb-xchain", [A_.hg.ground[0] - 20, A_.hg.ground[1] + 34], "跨链部署前 · 确认目标链支持", "lab-g", "t");
lab("lb-user", A_.user.top, "用户", "lab-sm");
// control-of-flow label that rides with the envelope
labels += wlab("lb-ctl", [envPos(P.env.u)[0], envPos(P.env.u)[1] - 70], "控制权", "lab-ink hide");
lab("lb-q1", [0, 0], "交给谁？", "lab-cs", "l");
lab("lb-q2", A_.cab.top, "谁的存储？", "lab-cs");
lab("lb-q3", A_.fs1.top, "谁回滚？", "lab-cs");
// "false + returndata" slip (L3) — flies from C's tray to B's tray of stack 2
labels += wpin("slip", A_.fs2.trays[2], `<div class="slip hide" id="slip-c">false + 返回数据</div>`, "c");

// ------------------------------------------------------------------ cameras
const C = (u, v, z, k, sx = 960, sy = 520) => camAt(Wp(u, v, z), sx, sy, k);
const CAMS = {
  open: C(460, -150, 120, 0.8, 960, 560),
  wide: C(420, -160, 120, 0.9, 960, 560),
  l1: C(-230, -200, 120, 0.98, 960, 560),
  l2: C(260, -640, 130, 1.12, 960, 400),
  l3: C(560, -640, 130, 0.98, 960, 430),
  l4: C(860, -560, 110, 1.22, 960, 420),
  l5: C(-60, 160, 130, 0.8, 1310, 660),
  xfer: C(2230, 1180, 100, 1.05, 1360, 560),
  l9: C(-430, 300, 160, 1.35, 1000, 580),
  comp: C(-640, 1760, 110, 1.05, 1250, 600),
  end: C(140, -230, 110, 0.74, 980, 560),
};
for (const k in CAMS) CAMS[k] = { ...CAMS[k] };

// screen-layer dashed curves (code card rows → world objects) for the transfer camera
const card = { x: 60, y: 150, w: 880 };
const rowY = (i) => card.y + 24 + 56 + 25 + i * 50;
const scr = (p) => toScreen(CAMS.xfer, p);
const canScr = scr(A_.can.front);
const cv1 = dashCurve("cv1", [card.x + card.w + 4, rowY(0)], canScr, { c1: [card.x + card.w + 140, rowY(0) + 30], c2: [canScr[0] - 120, canScr[1] - 120] });
const pipeScr = scr(at(P.wallet, 0, 560, 80));
const cv3 = dashCurve("cv3", [card.x + card.w + 4, rowY(2)], pipeScr, { c1: [card.x + card.w + 140, rowY(2) + 30], c2: [pipeScr[0] - 140, pipeScr[1] - 60] });

// ------------------------------------------------------------------ times
const TM = {
  gas0: w("gas", { line: 0 }), back0: w("回滚", { line: 0 }),
  instr: w("指令"), use: w("消耗"), out1: w("用完"), frame1: w("调用帧"), rb1: w("回滚", { line: 1 }),
  req: w("require"), err: w("自定义错误"), rb2: w("回滚", { line: 2 }), bub: w("冒泡", { line: 2 }),
  low: w("低级"), fail3: w("失败", { line: 3 }), nob: w("不冒泡"), ret: w("false"), rdata: w("返回数据"),
  trycatch: w("try"), ext4: w("外部调用", { line: 4 }), fail4: w("失败", { line: 4 }), cant: w("接不住"), inner: w("本合约内部"),
  ext5: w("外部调用", { line: 5 }), fwd: w("转发", { line: 5 }), n63: w("63"), callee: w("被调用方"), exh: w("耗尽"), caller: w("调用方还剩"), n1: w("1", { line: 5 }), fin: w("收尾"),
  old: w("过时"), transfer: w("transfer"), n2300: w("2300"), anti: w("防重入", { line: 6 }),
  price: w("价格"), recv: w("接收方"), wallet: w("合约钱包"), fail7: w("失败", { line: 7 }),
  rec: w("推荐"), call8: w("call", { line: 8 }), cei: w("CEI"), lock8: w("重入锁", { line: 8 }),
  rules: w("规则"), fus: w("Fusaka"), gla: w("Glamsterdam"), fixed: w("固定"),
  compiler: w("编译器"), v08: w("0.8", { line: 10 }), noov: w("不检查溢出"), safem: w("SafeMath"),
  v0824: w("0.8.24"), tstore: w("瞬态存储"), lowc: w("低成本"), lock11: w("重入锁", { line: 11 }), xchain: w("跨链"),
  together: w("放在一起"), every: w("每一次调用"), ctrl: w("控制权"),
  who: w("交给了谁"), whose: w("谁的存储"), whorb: w("谁回滚"),
};
const LN = T.lines.map((_, i) => L(i));

// dot matrix geometry (L5)
const DOT = 26, GAP = 9, STEP = DOT + GAP, GX_A = 34, GX_B = 34 + 8 * STEP + 92, GY = 112;
let dots = "";
for (let i = 0; i < 64; i++) { const r = Math.floor(i / 8), c = i % 8; dots += `<div class="d" id="d${i}" style="left:${GX_A + c * STEP}px;top:${GY + r * STEP}px"></div>`; }
let slots = "";
for (let i = 0; i < 64; i++) { const r = Math.floor(i / 8), c = i % 8; slots += `<div class="ds" style="left:${GX_B + c * STEP}px;top:${GY + r * STEP}px"></div>`; }
const mxW = GX_B + 8 * STEP + 26;

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 88px; }
    .old { opacity: 0; }
    .lab s { text-decoration-thickness: 4px; text-decoration-color: #e0453a; }
    .slip { font-family: "JetBrains Mono", "Noto Sans SC", monospace; font-size: 30px; font-weight: 800; background: #fffdf8; color: #1c1c1c; border: 3px solid #1c1c1c;
      border-radius: 6px; padding: 6px 16px 8px; box-shadow: 0 8px 16px rgba(70,60,40,0.16); white-space: nowrap; }
    /* 63/64 dot card */
    #mx { position: absolute; left: 60px; top: 150px; width: ${mxW}px; height: ${GY + 8 * STEP + 70}px; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    #mx .mt { position: absolute; left: 34px; top: 22px; font-size: 36px; font-weight: 900; white-space: nowrap; }
    #mx .mt small { font-size: 28px; font-weight: 700; color: #6d685e; margin-left: 14px; }
    #mx .d { position: absolute; width: ${DOT}px; height: ${DOT}px; border-radius: 50%; background: #1d93ba; }
    #mx .ds { position: absolute; width: ${DOT}px; height: ${DOT}px; border-radius: 50%; border: 2.5px dashed #d3ccbf; }
    #mx .cap { position: absolute; top: ${GY + 8 * STEP + 14}px; font-size: 30px; font-weight: 900; white-space: nowrap; }
    #mx .ring { position: absolute; width: ${DOT + 22}px; height: ${DOT + 22}px; border-radius: 50%; border: 5px solid #1f9d55; left: ${GX_A - 11}px; top: ${GY - 11}px; }
    /* code card */
    #code { left: ${card.x}px; top: ${card.y}px; width: ${card.w}px; }
    #code .c-row { font-size: 29px; }
    /* solc version strip */
    #ver { position: absolute; left: 60px; top: 150px; width: 900px; height: 300px; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    #ver .vt { position: absolute; left: 34px; top: 22px; font-size: 36px; font-weight: 900; white-space: nowrap; }
    #ver .ax { position: absolute; left: 40px; right: 40px; top: 150px; height: 8px; background: #1c1c1c; border-radius: 4px; }
    #ver .seg { position: absolute; top: 140px; height: 28px; border-radius: 8px; }
    #ver .tk { position: absolute; top: 128px; width: 6px; height: 52px; background: #1c1c1c; border-radius: 3px; }
    #ver .tl { position: absolute; top: 188px; font-family: "JetBrains Mono", monospace; font-size: 32px; font-weight: 800; transform: translateX(-50%); white-space: nowrap; }
    #ver .sl { position: absolute; top: 236px; font-size: 30px; font-weight: 900; white-space: nowrap; }
    #ver .mk { position: absolute; top: 84px; width: 0; height: 0; border-left: 18px solid transparent; border-right: 18px solid transparent; border-top: 30px solid #1d93ba; transform: translateX(-50%); }
    #ver .vtag { position: absolute; top: 76px; font-size: 28px; font-weight: 700; color: #6d685e; white-space: nowrap; }
    #kw { position: absolute; left: 60px; top: 130px; white-space: nowrap; }
    #kw .k-big { display: inline-block; font-size: 66px; background: #fffdf8; border-radius: 18px; padding: 14px 40px 20px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    #kw .k-big b { color: #1d93ba; }
    .scr { position: absolute; left: 0; top: 0; overflow: visible; }
${termCss}
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div id="mx" class="hide">
        <div class="mt">剩余 gas<small>每个点 = 1/64</small></div>
        ${slots}${dots}
        <div class="ring hide" id="ring"></div>
        <div class="cap" id="cap-a" style="left:${GX_A}px;opacity:0">A 留下 1/64</div>
        <div class="cap" id="cap-b" style="left:${GX_B}px;opacity:0;color:#17809f">转给 B · 63/64</div>
      </div>
      <div class="k-code hide" id="code">
        <div class="c-head">转 ETH 的写法<span class="c-tag">示例</span></div>
        <div class="c-row" id="cr0">to.transfer(amount); <span class="c-cm">// 2300 gas</span></div>
        <div class="c-row" id="cr1">to.send(amount);     <span class="c-cm">// 2300 gas</span></div>
        <div class="c-row" id="cr2"><span class="c-bar" id="cr2-bar" style="opacity:0"></span>(bool ok, ) = to.call{value: amount}("");</div>
      </div>
      <svg class="scr" width="1920" height="1080" viewBox="0 0 1920 1080">${cv1.svg}${cv3.svg}</svg>
      <div id="ver" class="hide">
        <div class="vt">solc 版本</div>
        <div class="ax"></div>
        <div class="seg" id="seg-old" style="left:40px;width:300px;background:rgba(224,69,58,0.22);border:3px solid #e0453a;opacity:0"></div>
        <div class="seg" id="seg-new" style="left:600px;width:258px;background:rgba(29,147,186,0.2);border:3px solid #1d93ba;opacity:0"></div>
        <div class="tk" style="left:337px"></div><div class="tk" style="left:597px"></div>
        <div class="tl" style="left:340px">0.8</div><div class="tl" style="left:600px">0.8.24</div>
        <div class="sl" id="sl-old" style="left:40px;color:#c3352b;opacity:0">不检查溢出 · 需要 SafeMath</div>
        <div class="sl" id="sl-new" style="left:560px;color:#17809f;opacity:0">支持瞬态存储</div>
        <div class="mk" id="vmk" style="left:190px"></div>
      </div>
      <div id="kw"><div class="k-big hide" id="kwc">每次调用 都可能<b>交出控制权</b></div><div class="lab lab-g hide" id="interp" style="margin-left:18px;vertical-align:28px">解读</div></div>
      ${termHtml(TERMS)}
      ${pills(5, { sections: SEC })}
      <div class="k-title" id="ttl-card"><div class="t-main">⑤ 回滚与Gas</div><div class="t-sub">失败时谁回滚</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const grown = new Set();
      const grow = (id, t, d) => { if (!grown.has(id)) { grown.add(id); const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); } KIT.grow(tl, id, t, d); };
      const shrink = (id, t) => { const g = $(id); tl.to("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy"), duration: 0.3, ease: "power2.in" }, t); };
      const ptr = (i, from, to) => { /* screen-layer helpers */ };

      KIT.camSet(tl, CAMS.open);
      // pre-hide everything that grows later
      ["mA","mB","mC","cab","fs1","fs2","gA","gB","wal","lock","solc","hg","can","user"].forEach((id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); grown.add(id); });

      // ===== 0–1.6 title card → pill ; world assembles behind it
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.3);

      // ===== L0 the three machines, A's gauge, the frame stack
      KIT.cam(tl, ${f(LN[0].start)}, CAMS.wide, 2.6, "power1.inOut");
      grow("mA", ${f(LN[0].start + 0.1)}); grow("mB", ${f(LN[0].start + 0.25)}); grow("mC", ${f(LN[0].start + 0.4)});
      pop("#lb-A", ${f(LN[0].start + 0.5)}); pop("#lb-B", ${f(LN[0].start + 0.6)}); pop("#lb-C", ${f(LN[0].start + 0.7)});
      grow("gA", ${f(TM.gas0 - 0.1)}); pop("#lb-gA", ${f(TM.gas0 + 0.2)});
      grow("fs1", ${f(TM.back0 - 0.15)}); pop("#lb-fs1", ${f(TM.back0 + 0.15)});
      grow("cab", ${f(TM.back0 + 0.1)}); pop("#lb-cab", ${f(TM.back0 + 0.4)});

      // ===== L1 every instruction burns gas; out of gas → the frame rolls back
      KIT.cam(tl, ${f(LN[1].start - 0.3)}, CAMS.l1, 1.1);
      out("#lb-B, #lb-C", ${f(LN[1].start - 0.3)});
      KITX.drawer(tl, "cab", 0, ${f(TM.instr - 0.2)}, true, 0.6);
      KITX.mark(tl, "cab", 0, ${f(TM.instr + 0.3)}, "teal");
      KITX.spin(tl, "mA", ${f(TM.instr)}, ${f(TM.out1 + 0.25 - TM.instr)}, 3, "steps(9)");
      KITX.gauge(tl, "gA", ${f(TM.instr)}, 0, ${f(TM.out1 + 0.25 - TM.instr)}, "steps(9)");
      KIT.led(tl, "mA-led", ${f(TM.out1 + 0.25)}, "red");
      KITX.tip(tl, "fs1", 0, ${f(TM.frame1 - 0.1)}, { keep: true });
      KITX.mark(tl, "cab", 0, ${f(TM.frame1)}, "red");
      KITX.clearDrawer(tl, "cab", 0, ${f(TM.rb1 - 0.2)});
      KITX.drawer(tl, "cab", 0, ${f(TM.rb1 + 0.3)}, false, 0.5);
      KITX.mark(tl, "cab", 0, ${f(TM.rb1 + 0.8)}, "off");
      pop("#lb-oog", ${f(TM.rb1)});

      // ===== L2 require/revert bubbles C → B → A
      KIT.cam(tl, ${f(LN[2].start - 0.3)}, CAMS.l2, 1.1);
      out("#lb-oog, #lb-cab, #lb-gA, #lb-fs1, #lb-A", ${f(LN[2].start - 0.3)});
      KITX.gauge(tl, "gA", ${f(LN[2].start - 0.3)}, 1, 0.6);
      KIT.led(tl, "mA-led", ${f(LN[2].start - 0.2)}, "green");
      KITX.push(tl, "fs1", 0, ${f(LN[2].start - 0.1)});
      KITX.fade(tl, "#gA", ${f(LN[2].start + 0.4)}, 0, 0.3);
      KITX.push(tl, "fs1", 1, ${f(TM.req + 0.05)});
      KITX.spin(tl, "mB", ${f(TM.req + 0.05)}, 0.8, 1);
      KITX.push(tl, "fs1", 2, ${f(TM.req + 0.35)});
      KITX.spin(tl, "mC", ${f(TM.req + 0.35)}, 1.2, 1.2, "power2.out");
      pop("#lb-req", ${f(TM.err)});
      KIT.led(tl, "mC-led", ${f(TM.rb2 - 0.2)}, "red");
      KITX.tip(tl, "fs1", 2, ${f(TM.rb2 - 0.1)}, { keep: true });
      tl.fromTo("#ar1-s", { attr: { "stroke-dashoffset": $("ar1-s").getAttribute("stroke-dasharray").split(" ")[0] } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.3, ease: "power2.out", immediateRender: false }, ${f(TM.rb2 + 0.45)});
      pop("#ar1-h", ${f(TM.rb2 + 0.7)}, 0.15);
      KIT.led(tl, "mB-led", ${f(TM.rb2 + 0.75)}, "red");
      KITX.tip(tl, "fs1", 1, ${f(TM.rb2 + 0.75)}, { keep: true });
      tl.fromTo("#ar2-s", { attr: { "stroke-dashoffset": $("ar2-s").getAttribute("stroke-dasharray").split(" ")[0] } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.3, ease: "power2.out", immediateRender: false }, ${f(TM.rb2 + 1.25)});
      pop("#ar2-h", ${f(TM.rb2 + 1.5)}, 0.15);
      KIT.led(tl, "mA-led", ${f(TM.rb2 + 1.55)}, "red");
      KITX.tip(tl, "fs1", 0, ${f(TM.rb2 + 1.55)}, { keep: true });
      pop("#lb-bub", ${f(TM.bub - 0.2)});

      // ===== L3 low-level call: only C's frame tips; B gets a "false" slip
      KIT.cam(tl, ${f(LN[3].start - 0.3)}, CAMS.l3, 1.0);
      ["mA","mB","mC"].forEach((m) => KIT.led(tl, m + "-led", ${f(LN[3].start)}, "green"));
      grow("fs2", ${f(TM.low)});
      pop("#lb-low", ${f(TM.low + 0.3)});
      KITX.tip(tl, "fs2", 2, ${f(TM.fail3)}, {});
      pop("#slip-c", ${f(TM.ret - 0.1)}, 0.25);
      { const a = ${JSON.stringify(A_.fs2.trays[2])}, b = ${JSON.stringify(A_.fs2.trays[1])};
        tl.fromTo("#slip-pin", { x: 0, y: 0 }, { x: b[0] - a[0] + 30, y: b[1] - a[1] - 20, duration: 0.6, ease: "power2.inOut", immediateRender: false }, ${f(TM.ret + 0.2)}); }
      pop("#lb-nob", ${f(TM.rdata)});

      // ===== L4 try/catch: the net catches C's failure, not B's own
      KIT.cam(tl, ${f(LN[4].start - 0.3)}, CAMS.l4, 1.0);
      out("#lb-bub, #lb-req, #lb-nob, #slip-c", ${f(LN[4].start - 0.3)});
      KITX.push(tl, "fs2", 2, ${f(LN[4].start - 0.1)});
      fadeIn("#net", ${f(TM.trycatch)}, 0.3);
      pop("#lb-catch", ${f(TM.trycatch + 0.2)});
      KITX.tip(tl, "fs2", 2, ${f(TM.ext4)}, {});
      fadeIn("#fbC", ${f(TM.ext4 + 0.15)}, 0.12);
      KITX.moveUV(tl, "fbC", ${f(TM.ext4 + 0.2)}, 0, 80, -110, 0.6, 0, "power2.in");
      KITX.fade(tl, "#net-on", ${f(TM.fail4)}, 1, 0.2);
      pop("#lb-c-ok", ${f(TM.fail4 + 0.1)});
      KITX.tip(tl, "fs2", 1, ${f(TM.cant)}, { keep: true });
      fadeIn("#fbB", ${f(TM.cant + 0.15)}, 0.12);
      KITX.moveUV(tl, "fbB", ${f(TM.cant + 0.2)}, 30, 260, -92, 0.7, 0, "power2.in");
      pop("#lb-c-no", ${f(TM.inner)});

      // ===== L5 63/64: A forwards 63 dots to B, keeps 1; B runs dry, A finishes with its 1/64
      KIT.cam(tl, ${f(LN[5].start - 0.35)}, CAMS.l5, 1.1);
      out("#lb-catch, #lb-c-ok, #lb-c-no, #lb-low, #net", ${f(LN[5].start - 0.35)});
      out("#fbC, #fbB", ${f(LN[5].start - 0.35)});
      KITX.push(tl, "fs2", 1, ${f(LN[5].start)}); KITX.push(tl, "fs2", 2, ${f(LN[5].start + 0.1)});
      KITX.push(tl, "fs1", 0, ${f(LN[5].start)}); KITX.push(tl, "fs1", 1, ${f(LN[5].start + 0.1)}); KITX.push(tl, "fs1", 2, ${f(LN[5].start + 0.2)});
      out("#ar1, #ar2", ${f(LN[5].start)});
      pop("#lb-A", ${f(LN[5].start + 0.2)}); pop("#lb-B", ${f(LN[5].start + 0.3)}); pop("#lb-gA", ${f(LN[5].start + 0.3)});
      KITX.fade(tl, "#gA", ${f(LN[5].start)}, 1, 0.3);
      grow("gB", ${f(TM.ext5 + 0.2)}); pop("#lb-gB", ${f(TM.ext5 + 0.5)});
      KIT.pop(tl, "#mx", ${f(TM.ext5)}, 0.35);
      for (let i = 1; i < 64; i++) tl.to("#d" + i, { x: ${GX_B - GX_A}, duration: 0.55, ease: "power2.inOut" }, ${f(TM.fwd)} + (63 - i) * 0.012);
      tl.to("#cap-b", { opacity: 1, duration: 0.25 }, ${f(TM.n63 - 0.1)});
      tl.to("#cap-a", { opacity: 1, duration: 0.25 }, ${f(TM.n63 + 0.1)});
      KITX.gauge(tl, "gA", ${f(TM.fwd + 0.1)}, 0.08, 1.0);
      KITX.gauge(tl, "gB", ${f(TM.fwd + 0.2)}, 0.97, 1.0);
      KITX.spin(tl, "mB", ${f(TM.callee)}, 1.1, 2.5, "steps(10)");
      KITX.gauge(tl, "gB", ${f(TM.callee)}, 0, 1.1, "steps(10)");
      for (let i = 1; i < 64; i++) tl.to("#d" + i, { backgroundColor: "#e0453a", opacity: 0.4, duration: 0.2 }, ${f(TM.callee)} + (63 - i) * 0.017);
      KIT.led(tl, "mB-led", ${f(TM.exh + 0.4)}, "red");
      out("#lb-gB", ${f(TM.exh)}, 0.15); pop("#lb-B-out", ${f(TM.exh + 0.2)});
      tl.to("#cap-b", { color: "#c3352b", duration: 0.2 }, ${f(TM.exh + 0.3)});
      tl.to("#d0", { backgroundColor: "#1f9d55", duration: 0.2 }, ${f(TM.n1 - 0.2)});
      pop("#ring", ${f(TM.n1 - 0.1)}, 0.3);
      KITX.spin(tl, "mA", ${f(TM.fin - 0.4)}, 0.8, 0.5, "power2.out");
      out("#lb-gA", ${f(TM.fin - 0.45)}, 0.15); pop("#lb-A-fin", ${f(TM.fin - 0.3)});
      pop("#lb-eip150", ${f(TM.fin + 0.1)});

      // ===== L6 transfer/send forward only 2300 gas — once used as a re-entrancy guard
      KIT.cam(tl, ${f(LN[6].start - 0.35)}, CAMS.xfer, 1.2);
      out("#mx, #lb-B-out, #lb-A-fin, #lb-eip150, #lb-A, #lb-B", ${f(LN[6].start - 0.35)}, 0.25);
      KIT.led(tl, "mB-led", ${f(LN[6].start)}, "green");
      grow("wal", ${f(TM.old)}); pop("#lb-wal", ${f(TM.old + 0.35)});
      KIT.pop(tl, "#code", ${f(TM.transfer - 0.2)}, 0.3);
      tl.to("#cr0, #cr1", { backgroundColor: "#fdeae7", duration: 0.2 }, ${f(TM.transfer + 0.1)});
      grow("can", ${f(TM.n2300 - 0.3)});
      pop("#lb-can", ${f(TM.n2300)});
      KIT.draw(tl, "cv1", ${f(TM.n2300 + 0.2)}, 0.6);
      tl.fromTo("#lb-old", { opacity: 0 }, { opacity: 0.75, duration: 0.3, immediateRender: false }, ${f(TM.anti - 0.6)});

      // ===== L7 gas prices changed: the can runs dry before the contract wallet's door opens
      out("#cv1", ${f(LN[7].start - 0.1)}, 0.25);
      out("#lb-old, #lb-can", ${f(LN[7].start)}, 0.2);
      pop("#lb-eips", ${f(TM.price)});
      KITX.moveUV(tl, "can", ${f(TM.recv - 0.3)}, 0, -380, 0, 1.0, 0, "power2.inOut");
      KIT.door(tl, "wal", ${f(TM.wallet + 0.1)}, 28, 0.6);
      tl.fromTo("#can-lvl", { scaleY: 1, transformOrigin: "50% 100%" }, { scaleY: 0, transformOrigin: "50% 100%", duration: 1.2, ease: "steps(6)", immediateRender: false }, ${f(TM.wallet)});
      tl.to("#can-lvl", { fill: "#e0453a", duration: 0.1 }, ${f(TM.wallet + 0.8)});
      KIT.door(tl, "wal", ${f(TM.fail7 - 0.5)}, 0, 0.4);
      pop("#lb-fail", ${f(TM.fail7 - 0.1)});

      // ===== L8 recommended: call{value} through a thick pipe + CEI / re-entrancy lock
      out("#lb-fail, #lb-eips", ${f(LN[8].start)}, 0.2);
      out("#can", ${f(LN[8].start)}, 0.3);
      tl.to("#cr0, #cr1", { opacity: 0.4, backgroundColor: "rgba(0,0,0,0)", duration: 0.3 }, ${f(TM.rec)});
      tl.to("#cr2", { backgroundColor: "#e3f3f8", duration: 0.25 }, ${f(TM.rec)});
      tl.set("#cr2", { borderRadius: "10px", margin: "0 -16px", padding: "0 16px" }, 0);
      fadeIn("#cr2-bar", ${f(TM.rec)}, 0.2);
      tl.set("#pipe", { opacity: 1 }, ${f(TM.call8 - 0.4)});
      ["#pipe-body", "#pipe-in", "#pipe-hi"].forEach((s, k) => tl.to(s, { attr: { "stroke-dashoffset": 0 }, duration: 0.7, ease: "power2.out" }, ${f(TM.call8 - 0.4)} + k * 0.04));
      KIT.draw(tl, "cv3", ${f(TM.call8 + 0.2)}, 0.6);
      pop("#lb-pipe", ${f(TM.call8 + 0.1)});
      KIT.door(tl, "wal", ${f(TM.call8 + 0.4)}, 100, 0.8);
      fadeIn("#pipe-flow", ${f(TM.call8 + 0.3)}, 0.2);
      tl.fromTo("#pipe-flow", { attr: { "stroke-dashoffset": 0 } }, { attr: { "stroke-dashoffset": -580 }, duration: 4.2, ease: "none", immediateRender: false }, ${f(TM.call8 + 0.3)});
      grow("lock", ${f(TM.cei - 0.2)});
      pop("#lb-cei", ${f(TM.cei)});

      // ===== L9 gas rules keep changing: the gauge's scale is swapped
      KIT.cam(tl, ${f(LN[9].start - 0.35)}, CAMS.l9, 1.2);
      out("#code, #cv3", ${f(LN[9].start - 0.35)}, 0.25);
      out("#lb-pipe, #lb-cei, #lb-wal", ${f(LN[9].start - 0.3)});
      KITX.gauge(tl, "gA", ${f(LN[9].start)}, 1, 0.6);
      pop("#lb-fix", ${f(TM.rules + 0.3)});
      KIT.swap(tl, "#gA-scale", "#gA-scale2", ${f(TM.fus - 0.2)}, 0.4);
      pop("#lb-fus", ${f(TM.fus)});
      pop("#lb-gla", ${f(TM.gla)});
      tl.to("#lb-fix", { backgroundColor: "#fdeae7", duration: 0.2 }, ${f(TM.fixed)});
      tl.fromTo("#lb-fix s", { textDecorationColor: "rgba(224,69,58,0)" }, { textDecorationColor: "rgba(224,69,58,1)", duration: 0.2, immediateRender: false }, ${f(TM.fixed)});

      // ===== L10 compiler: < 0.8 no overflow checks, SafeMath
      KIT.cam(tl, ${f(LN[10].start - 0.35)}, CAMS.comp, 1.2);
      out("#lb-fix, #lb-fus, #lb-gla", ${f(LN[10].start - 0.35)}, 0.2);
      KITX.fade(tl, "#gA", ${f(LN[10].start - 0.35)}, 0, 0.3);
      grow("solc", ${f(TM.compiler)}); pop("#lb-solc", ${f(TM.compiler + 0.35)});
      KITX.spin(tl, "solc", ${f(TM.compiler + 0.2)}, 1.4, 1);
      KIT.pop(tl, "#ver", ${f(TM.v08 - 0.3)}, 0.3);
      fadeIn("#seg-old", ${f(TM.v08)}, 0.25);
      fadeIn("#sl-old", ${f(TM.noov)}, 0.25);

      // ===== L11 0.8.24: transient storage — a drawer that lives only for this tx — as a cheap lock
      tl.to("#vmk", { x: 410, duration: 0.9, ease: "power2.inOut" }, ${f(TM.v0824 - 0.2)});
      fadeIn("#seg-new", ${f(TM.v0824 + 0.5)}, 0.25);
      tl.to("#seg-old, #sl-old", { opacity: 0.35, duration: 0.3 }, ${f(TM.v0824 + 0.5)});
      fadeIn("#sl-new", ${f(TM.tstore)}, 0.25);
      tl.fromTo("#tcab-wrap", { opacity: 0 }, { opacity: 0.62, duration: 0.3, immediateRender: false }, ${f(TM.tstore - 0.2)});
      grow("hg", ${f(TM.tstore)});
      pop("#lb-tcab", ${f(TM.tstore + 0.3)});
      KITX.drawer(tl, "tcab", 0, ${f(TM.lowc - 0.4)}, true, 0.5);
      KITX.mark(tl, "tcab", 0, ${f(TM.lowc)}, "green");
      pop("#lb-tlock", ${f(TM.lowc + 0.1)});
      KIT.sand(tl, "hg", ${f(TM.tstore + 0.3)}, ${f(LN[11].end - TM.tstore - 0.6)});
      pop("#lb-xchain", ${f(TM.xchain)});
      out("#lb-tlock", ${f(TM.xchain)}, 0.2);

      // ===== L12 the chapter in one line: every call may hand control to someone else
      KIT.cam(tl, ${f(LN[12].start - 0.3)}, CAMS.end, 1.4);
      out("#ver, #lb-solc, #lb-tcab, #lb-tlock, #lb-xchain", ${f(LN[12].start - 0.3)}, 0.25);
      KIT.led(tl, "mC-led", ${f(LN[12].start)}, "green");
      KITX.fade(tl, "#gA", ${f(LN[12].start)}, 1, 0.4);
      KITX.gauge(tl, "gB", ${f(LN[12].start)}, 0.7, 0.6); KIT.led(tl, "mB-led", ${f(LN[12].start)}, "green");
      grow("user", ${f(TM.together)}); pop("#lb-user", ${f(TM.together + 0.3)});
      pop("#lb-A", ${f(TM.together + 0.2)}); pop("#lb-B", ${f(TM.together + 0.3)}); pop("#lb-C", ${f(TM.together + 0.4)});
      fadeIn("#env-g", ${f(TM.every - 0.4)}, 0.2);
      pop("#lb-ctl", ${f(TM.every - 0.3)});
      const hops = [${P.A.u}, ${P.B.u}, ${P.C.u}], machines = ["mA", "mB", "mC"];
      const DU = [${[P.A.u, P.B.u, P.C.u].map((u) => { const a = envPos(P.env.u), b = envPos(u); return JSON.stringify([f(b[0] - a[0]), f(b[1] - a[1])]); }).join(",")}];
      const hopT = [${f(TM.every)}, ${f(TM.every + 1.05)}, ${f(TM.every + 2.1)}];
      hops.forEach((u, i) => {
        tl.to("#env-g", { x: DU[i][0], y: DU[i][1], duration: 0.7, ease: "power2.inOut" }, hopT[i]);
        tl.to("#lb-ctl-pin", { x: DU[i][0], y: DU[i][1], duration: 0.7, ease: "power2.inOut" }, hopT[i]);
        KITX.slot(tl, machines[i], hopT[i] + 0.55, true);
        KITX.spin(tl, machines[i], hopT[i] + 0.6, 0.9, 1, "power2.out");
        if (i > 0) KITX.slot(tl, machines[i - 1], hopT[i] + 0.2, false);
      });
      KIT.pop(tl, "#kwc", ${f(TM.ctrl - 0.2)}, 0.35);

      // ===== L13 three questions + "解读"
      { const e = DU[2], p0 = ${JSON.stringify(envPos(P.env.u))};
        tl.set("#lb-q1-pin", { left: p0[0] + e[0] + 90, top: p0[1] + e[1] + 10 }, 0); }
      pop("#lb-q1", ${f(TM.who)});
      out("#lb-cab", ${f(TM.whose - 0.3)}, 0.15);
      pop("#lb-q2", ${f(TM.whose)});
      pop("#lb-q3", ${f(TM.whorb)});
      pop("#interp", ${f(TM.whorb + 0.6)}, 0.3);
      tl.set({}, {}, ${f(TOTAL)});
${termJs(TERMS)}
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL);
