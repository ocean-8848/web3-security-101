// Generates compositions/story.html for ep08/seg4「④ 三类价格源」(world「价格集市」, one camera).
// Run: node src/build-story.mjs
// Objects: kit + ep01/04/05/06 kit-ext + ep08 kit-ext (import only). World positions: ../../shared/layout.mjs (not edited);
// seg4-only positions (INV shallow pool, its attacker, LP cert, letters) are defined locally below.
// Camera: opens on CAMS.left (seg3 end), ends static on CAMS.oracle (seg5 start).
import fs from "node:fs";
import { at, Wp, f, camAt, gridSvg, worldSvg, wlab, wpin, CHECK, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E6 from "../../../ep06/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { screenCss, termCards } from "../../../kit/screen.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { VEND, LEDGER, AMM, DESK, ORACLE, TWAP, METER, CLOCK, KNIFE, TOWERS, PIPE, rect, fit, CAMS as LC } from "../../shared/layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = T.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const SECTIONS = SCRIPT.sections;
const LN = T.lines.map((_, i) => lineAt(T, i));
const LS = LN.map((l) => l.start);
const w = (term, line, nth = 0) => wordAt(T, term, { line, nth }).start;
const we = (term, line, nth = 0) => wordAt(T, term, { line, nth }).end;

// ---------------------------------------------------------------- local positions (seg4 only)
const INV = { u: 1500, v: 1150, scale: 0.7 };     // shallow pool "INV" in front of the price pipe, below the recorder ≈ (1889, 41)
const ATK_INV = { u: 1150, v: 1250 };             // attacker (own funds) left of it ≈ (1659, 182)
const CERT = { u: 1700, v: 1250 };                // LP certificate right of the pool ≈ (2110, 25)
const LET = [[-60, 230], [60, 260], [180, 230], [-170, 150]].map(([du, dv]) => ({ u: INV.u + du, v: INV.v + dv }));
const rel = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });

// ---------------------------------------------------------------- objects
const items = [];
const A = {};
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const wrap = (id, svg, op = 1) => `<g id="${id}" opacity="${op}">${svg}</g>`;

// center: lending contract + ledger
const vm = E1.vending(VEND, { id: "vm" }); A.vm = vm.anchors; add(VEND, vm.svg);
const lg = O.ledgerBook(LEDGER, { id: "lg", scale: LEDGER.scale }); add(LEDGER, lg.svg);
// left: pool (broken, as seg3 ends) + flash desk + the old pool pipe
const amm = X.ammPool(AMM, { id: "amm", state: "broken" }); A.amm = amm.anchors; add(AMM, amm.svg);
const fd = E1.flashDesk(DESK, { id: "fd" }); add(DESK, fd.svg);
const pPool = E1.pipe(VEND, { id: "pp", pts: PIPE.pool, state: "attacker" });
items.push({ y: at(AMM)[1] + 1, svg: wrap("ppw", pPool.svg) });
// right: oracle station
const tw = X.twapRecorder(TWAP, { id: "tw", win: 56, spikeAt: 297 }); A.tw = tw.anchors; add(TWAP, tw.svg);
const orc = E1.miniVend(ORACLE, { id: "orc", kind: "oracle" }); A.orc = orc.anchors; add(ORACLE, orc.svg);
const gh = E4.oracleGhost(ORACLE, { id: "orc", deg: 55, real: -20, shown: false }); A.gh = gh.anchors; add(ORACLE, gh.svg, 0.1);
const mt = E5.thresholdMeter(METER, { id: "mt" }); add(METER, mt.svg);
const ck = O.clock(CLOCK, { id: "ck" }); A.ck = ck.anchors; add(CLOCK, ck.svg);
const kn = O.knifeSwitch(KNIFE, { id: "knf" }); A.kn = kn.anchors; add(KNIFE, kn.svg);
TOWERS.forEach((t, i) => { const o = O.tower(t, { id: "tow" + i }); A["tow" + i] = o.anchors; add(t, o.svg); });
// price pipes (drawn after knife / recorder / oracle, before the front props)
const pOr = E1.pipe(VEND, { id: "po", pts: PIPE.oracle });
const pTw = E1.pipe(VEND, { id: "pt", pts: PIPE.twap });
items.push({ y: -150, svg: wrap("pow", pOr.svg, 0) + wrap("ptw", pTw.svg, 0) });
const TEE = at(VEND, TWAP.u + 90, ORACLE.v, 110);   // where the TWAP run leaves the oracle run = comparison joint
// seg4 local props
const inv = X.ammPool(INV, { id: "inv", scale: INV.scale, labelL: "INV", labelR: "ETH" }); A.inv = inv.anchors; add(INV, wrap("invw", inv.svg, 0));
const ai = O.person(ATK_INV, { id: "ai", role: "attacker" }); A.ai = ai.anchors; add(ATK_INV, wrap("aiw", ai.svg, 0));
LET.forEach((o, i) => { const l = E1.letter(o, { id: "lt" + i }); add(o, wrap("ltw" + i, l.svg, 0)); if (!i) A.lt = l.anchors; });
const cert = E6.shareCert(CERT, { id: "cert", scale: 2.6, stand: true, text: "LP" }); A.cert = cert.anchors; add(CERT, wrap("certw", cert.svg, 0));

items.sort((a, b) => a.y - b.y);
// tower → oracle signal lines (world)
const sig = TOWERS.map((_, i) => {
  const a = A["tow" + i].tip, b = A.orc.dial;
  const d = `M${f(a[0])},${f(a[1])}C${f(a[0])},${f(a[1] + 120)} ${f(b[0])},${f(b[1] - 160)} ${f(b[0])},${f(b[1] - 30)}`;
  return `<path id="sg${i}" d="${d}" fill="none" stroke="#2aa3c9" stroke-width="5" stroke-dasharray="14 10" stroke-linecap="round" opacity="0"/>`;
}).join("");
// LP: oracle price + invariant → cert
const lpLine = (id, a, b) => `<path id="${id}" d="M${f(a[0])},${f(a[1])}Q${f((a[0] + b[0]) / 2)},${f(Math.min(a[1], b[1]) - 120)} ${f(b[0])},${f(b[1])}" fill="none" stroke="#2aa3c9" stroke-width="5" stroke-dasharray="14 10" stroke-linecap="round" opacity="0"/>`;
const INVTOP = A.inv.top;
const lpl = lpLine("lp0", A.orc.dial, A.cert.top) + lpLine("lp1", [INVTOP[0] + 20, INVTOP[1] - 40], A.cert.top);
const world = worldSvg("wsvg", gridSvg({ u0: -4600, u1: 5000, v0: -2000, v1: 2400 }) + items.map((x) => x.svg).join("\n") + sig + lpl, [-3400, -2600, 9000, 5200]);

// ---------------------------------------------------------------- labels (world)
let labels = "";
const lb = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, cls + " hide", a); };
const up = (p, d) => [p[0], p[1] - d];
lb("lb-spot", up(A.amm.top, 10), "现货价 · 不能拿来定价", "lab-rs");
lb("lb-twap", up(A.tw.top, 20), "时间加权平均价 · TWAP", "lab-cs");
lb("lb-avg", [A.tw.top[0] + 150, A.tw.top[1] + 40], "窗口均值", "lab-ink", "l");
lb("lb-flat", [A.tw.top[0] + 150, A.tw.top[1] + 40], "均值几乎不动", "lab-gs", "l");
lb("lb-spk", up(A.tw.top, 20), "一笔交易推高", "lab-r");
lb("lb-lag", [A.tw.top[0] + 150, A.tw.top[1] + 40], "窗口越长 · 越滞后", "lab-ink", "l");
lb("lb-multi", up(A.tw.top, 20), "连续多个区块", "lab-rs");
lb("lb-inv", up(A.inv.top, 10), "浅池 · INV", "lab-cs");
lb("lb-own", up(A.ai.head, 40), "自有资金", "lab-rs");
lb("lb-nofl", [A.ai.head[0] - 60, A.ai.head[1] + 30], "<s>闪电贷</s>", "lab-g lab-sm", "r");
lb("lb-spam", [A.lt.top[0] + 260, A.lt.top[1] + 40], "垃圾交易 · 挡住套利", "lab-r", "l");
lb("lb-high", [A.tw.top[0] + 150, A.tw.top[1] + 40], "TWAP 输出虚高", "lab-rs", "l");
lb("lb-agg", up(A.orc.top, 10), "链下聚合预言机", "lab-cs");
lb("lb-nodes", up(A.tow1.top, 10), "链下节点", "");
lb("lb-safe", [A.orc.dial[0] + 110, A.orc.dial[1] + 20], "一笔交易 · 改不动", "lab-gs", "l");
lb("lb-hb", up(A.ck.top, 10), "心跳", "lab-cs");
lb("lb-dev", [A.orc.dial[0] + 110, A.orc.dial[1] + 20], "偏离超阈值 → 更新", "lab-cs", "l");
lb("lb-hb2", up(A.ck.top, 10), "心跳 = 最长更新间隔", "lab-cs");
lb("lb-stale", up(A.ck.top, 10), "过时", "lab-rs");
lb("lb-bound", [A.orc.dial[0] + 110, A.orc.dial[1] + 20], "撞上下限", "lab-rs", "l");
lb("lb-down", up(A.tow2.top, 10), "节点失效", "lab-rs");
lb("lb-cmp", up(TEE, 70), "多源比较 · 偏离", "lab-cs");
lb("lb-pause", up(A.kn.top, 10), "偏离超阈值 → 暂停", "lab-rs");
lb("lb-who", up(TEE, 70), "意见不一 · 听谁的？", "lab-r");
lb("lb-lp", up(A.cert.top, 30), "LP 代币", "lab-cs");
lb("lb-lpx", [A.cert.top[0] + 110, A.cert.top[1] + 70], "储备 × 现货价 ✗", "lab-rs", "l");
lb("lb-inv2", up(A.inv.top, 10), "AMM 池", "lab-cs");
lb("lb-xyk", [INVTOP[0] - 40, INVTOP[1] - 40], "不变量 x · y = k", "lab-ink", "r");
lb("lb-orp", [A.orc.dial[0] + 110, A.orc.dial[1] + 20], "外部价格", "lab-cs", "l");
lb("lb-fair", [A.cert.top[0] + 110, A.cert.top[1] + 70], "公平储备 ✓", "lab-gs", "l");
lb("lb-r1", up(A.tw.top, 20), "TWAP · 滞后", "lab-r");
lb("lb-r2", up(A.orc.top, 10), "链下聚合 · 过时", "lab-r");
lb("lb-r3", up(TEE, 70), "多源 · 复杂", "lab-r");
// block row under the recorder (each square = one block)
const NB = 6;
labels += wpin("blk", [A.tw.ground[0] - 20, A.tw.ground[1] + 90], `<div class="blk hide" id="blk">${Array.from({ length: NB }, (_, i) => `<i class="bk" id="bk${i}">${i + 1}</i>`).join("")}<span class="bk-t">区块</span></div>`, "t");
labels += wpin("pv", [A.tw.ground[0] - 20, A.tw.ground[1] + 190], `<div class="lab lab-ink hide" id="lb-prop">同一提议者连续出块 → 更便宜</div>`, "t");

// ---------------------------------------------------------------- cameras
const RT = rect(TWAP, "twapRecorder"), RI = rect(INV, "ammPool"), RA = rect(ATK_INV, "person"), RO = rect(ORACLE, "miniVend"), RC = rect(CERT, "doc", 0.5);
const CAMS = {
  left: LC.left, wide: LC.wide, nodes: LC.nodes, right: LC.right, oracle: LC.oracle,
  rec: fit([RT, [RT[0] - 60, RT[1], RT[2] + 40, RT[3] + 220]], [420, 300, 1300, 840], 2.0),     // recorder close-up + block row
  inv: fit([RT, RI, RA, [RI[0], RI[1], RI[2] + 80, RI[3] + 190]], [180, 250, 1080, 860], 1.6),  // recorder + shallow pool + attacker
  lp: fit([RI, RO, RC], [260, 260, 1500, 860], 1.4),                                           // pool + cert + oracle
};

// ---------------------------------------------------------------- terms
const TC = termCards([
  { id: "prop", t: "提议者", d: "PoS 下负责打包下一个区块的验证者", at: w("提议者", 6) },
  { id: "arb", t: "套利", d: "低买高卖，把偏离的价格拉回来", at: w("套利", 9) },
  { id: "dev", t: "偏离阈值", d: "价格变动超过这一比例就立即更新", at: w("偏离阈值", 14) },
  { id: "lp", t: "LP 代币", d: "往 AMM 池存入资金后拿到的份额凭证", at: w("LP", 19) },
  { id: "inv", t: "不变量", d: "交换前后保持不变的量，如 x·y=k", at: w("不变量", 20) },
]);

// ---------------------------------------------------------------- screen overlays
const strip = `<div class="src3 hide" id="src3"><span class="s3-t">三类价格源</span>${["TWAP", "链下聚合", "多源组合"].map((s, i) => `<span class="s3" id="s3-${i}">${"①②③"[i]} ${s}</span>`).join("")}</div>`;
const evt = `<div class="evt hide" id="evt"><div class="ev-h">2022 年 4 月 · <b>Inverse Finance</b></div><div class="ev-r" id="ev-amt">借走约 1560 万美元</div><div class="ev-tag" id="ev-tag">公开报道</div></div>`;
const cmp = `<div class="cmp hide" id="cmp"><div class="cm-h">TWAP 挡得住吗？</div><div class="cm-r ok" id="cm0">一笔交易 <b>✓</b></div><div class="cm-r no" id="cm1">多区块 + 资本 <b>✗</b></div></div>`;
const q2 = `<div class="q2 hide" id="q2"><div class="q-h">工程上要回答</div><div class="q-r" id="q2a">价格<b class="r">错了</b>，会怎样？</div><div class="q-r" id="q2b">价格<b>停了</b>，会怎样？</div></div>`;

// ---------------------------------------------------------------- times
const TM = {
  three: w("三类", 0), twap1: w("TWAP", 1), avg2: w("平均", 2), push3: w("推高", 3), small3: w("一小段", 3), none3: w("几乎不起作用", 3),
  win4: w("窗口越长", 4), lag4: w("滞后", 4), low5: w("低流动性", 5), multi5: w("连续多个区块", 5),
  pos6: w("PoS", 6), prop6: w("提议者", 6), cheap6: w("更便宜", 6),
  inv7: w("Inverse", 7), nofl8: w("没有用闪电贷", 8), own8: w("自有资金", 8), shallow8: w("浅池", 8),
  spam9: w("垃圾交易", 9), high9: w("虚高", 9), amt10: w("1560", 10),
  ok11: w("挡得住", 11), no11: w("挡不住", 11),
  agg12: w("链下聚合", 12), up13: w("写上链", 13), cant13: w("改不动", 13),
  hb14: w("心跳", 14), dev14: w("偏离阈值", 14), hb15: w("心跳", 15), max15: w("最长间隔", 15),
  stale16: w("过时", 16), bound16: w("上下限", 16), fail16: w("失效", 16),
  multi17: w("多源组合", 17), cmp17: w("互相比较", 17), pause17: w("暂停", 17), who18: w("听谁的", 18),
  lp19: w("LP", 19), res19: w("储备乘现货价", 19), ext20: w("外部预言机", 20), inv20: w("不变量", 20), fair20: w("公平储备", 20),
  wrong23: w("价格错了", 23), stop23: w("价格停了", 23),
};

const html = `<template>
  <style>
${kitCss()}
${screenCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    .src3 { position: absolute; left: 56px; top: 30px; height: 60px; display: flex; align-items: center; gap: 10px; background: #fffdf8; border-radius: 14px; padding: 0 18px; box-shadow: 0 6px 16px rgba(70,60,40,0.10); }
    .s3-t { font-size: 30px; font-weight: 900; margin-right: 6px; white-space: nowrap; }
    .s3 { font-size: 28px; font-weight: 800; color: #8a8478; border: 3px dashed #c9c1b2; border-radius: 10px; padding: 2px 12px 4px; white-space: nowrap; }
    .s3.cur { background: #1c1c1c; border: 3px solid #1c1c1c; color: #ffffff; }
    .s3.lit { border: 3px solid #1d93ba; color: #1d93ba; }
    .evt { position: absolute; right: 48px; top: 120px; max-width: 760px; background: #ffffff; border-radius: 16px; padding: 18px 28px 20px; box-shadow: 0 10px 24px rgba(70,60,40,0.14); border-left: 6px solid #e0453a; }
    .evt .ev-h { font-size: 36px; font-weight: 900; white-space: nowrap; }
    .evt .ev-r { margin-top: 8px; font-size: 34px; font-weight: 900; color: #e0453a; white-space: nowrap; opacity: 0; }
    .evt .ev-tag { display: inline-block; margin-top: 10px; font-size: 28px; font-weight: 700; color: #6d685e; background: #ebe6dc; border-radius: 8px; padding: 2px 12px 4px; opacity: 0; }
    .cmp { position: absolute; left: 1240px; top: 430px; width: 560px; background: #ffffff; border-radius: 16px; padding: 18px 26px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.14); }
    .cmp .cm-h { font-size: 32px; font-weight: 900; white-space: nowrap; margin-bottom: 8px; }
    .cmp .cm-r { font-size: 36px; font-weight: 900; padding: 6px 16px 8px; border-radius: 10px; margin-top: 8px; color: #ffffff; white-space: nowrap; opacity: 0; }
    .cmp .cm-r.ok { background: #1f9d55; } .cmp .cm-r.no { background: #e0453a; }
    .q2 { position: absolute; left: 1290px; top: 360px; width: 570px; background: #ffffff; border-radius: 20px; padding: 24px 32px 28px; box-shadow: 0 14px 30px rgba(70,60,40,0.14); }
    .q2 .q-h { font-size: 30px; font-weight: 800; color: #6d685e; white-space: nowrap; }
    .q2 .q-r { margin-top: 16px; font-size: 50px; font-weight: 900; white-space: nowrap; opacity: 0; }
    .q2 b { color: #1d93ba; } .q2 b.r { color: #e0453a; }
    .blk { display: flex; align-items: center; gap: 8px; background: #fffdf8; border-radius: 12px; padding: 8px 12px; box-shadow: 0 6px 16px rgba(70,60,40,0.12); }
    .bk { display: block; width: 40px; height: 40px; border-radius: 6px; border: 3px solid #8a8478; background: #f1ede5; font: 800 22px/34px "Noto Sans SC", sans-serif; font-style: normal; text-align: center; color: #6d685e; box-sizing: border-box; }
    .bk-t { font-size: 28px; font-weight: 800; color: #6d685e; margin-left: 4px; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      ${strip}${evt}${cmp}${q2}${TC.html}
      ${pills(4, { sections: SECTIONS })}
      <div class="k-title" id="ttl-card"><div class="t-main">④ 三类价格源</div><div class="t-sub">TWAP · 链下聚合 · 多源组合</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E4.runtimeExtJs()}
${E5.runtimeExtJs()}
${E6.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const X1 = window.KITX01, X4 = window.KITX04, X8 = window.KITX08;
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.3, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d || 0.3);
      const flash = (sel, t, n) => tl.fromTo(sel, { opacity: 1 }, { opacity: 0.25, duration: 0.16, yoyo: true, repeat: (n || 3) * 2 - 1, ease: "power1.inOut", immediateRender: false }, t);
      const draw = (sel, t, d) => tl.fromTo(sel, { opacity: 1, strokeDashoffset: 300 }, { opacity: 1, strokeDashoffset: 0, duration: d || 0.8, ease: "none", immediateRender: false }, t);
      const src = (i, t) => { [0, 1, 2].forEach((j) => tl.set("#s3-" + j, { className: "s3" + (j === i ? " cur" : j < i ? " lit" : "") }, t)); };
      const flow = (id, t, dur) => { fadeIn("#" + id + "-flow", t, 0.2); X1.dash(tl, [id + "-flow"], t, dur, -dur * 70); };
${TC.js}

      // ===== 0–1.6 · seg3 end state (left zone, broken pool + red pool pipe) under the title card
      KIT.camSet(tl, CAMS.left);
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.15);
      // ===== L0 three choices: unplug the spot price, pan right
      pop("#lb-spot", ${f(LS[0] + 0.05)});
      out("#ppw", ${f(TM.three - 0.3)}, 0.5);
      out("#lb-spot", ${f(TM.three + 0.4)}, 0.2);
      KIT.cam(tl, ${f(TM.three - 0.1)}, CAMS.wide, 1.4);
      pop("#src3", ${f(TM.three)});
      // ===== L1 TWAP: pipe plugs into the recorder
      KIT.cam(tl, ${f(LS[1] - 0.3)}, CAMS.rec, 1.6);
      fadeIn("#ptw", ${f(LS[1])}, 0.4);
      src(0, ${f(TM.twap1 - 0.2)});
      pop("#lb-twap", ${f(TM.twap1 - 0.3)});
      flow("pt", ${f(TM.twap1)}, 2.0);
      // ===== L2 weighted average: paper runs, window frame averages
      X8.paper(tl, "tw", ${f(LS[1] + 1.4)}, 160, ${f(TM.push3 - LS[1] - 1.4)});
      pop("#lb-avg", ${f(TM.avg2 - 0.2)});
      X8.winTo(tl, "tw", ${f(TM.avg2 - 0.2)}, 60, 0.4);
      // ===== L3 one tx = a thin red spike; the average hardly moves
      out("#lb-twap", ${f(LS[3])}, 0.2);
      X8.paper(tl, "tw", ${f(TM.push3)}, 70, ${f(LS[4] - TM.push3)});
      X8.spike(tl, "tw", ${f(TM.push3 - 0.1)}, true, 0.2);
      X8.penKick(tl, "tw", ${f(TM.push3 - 0.1)}, 26, 0.5);
      pop("#lb-spk", ${f(TM.push3 + 0.1)});
      tl.set("#lb-avg", { opacity: 0 }, ${f(TM.none3 - 0.1)}); pop("#lb-flat", ${f(TM.none3 - 0.1)});
      // ===== L4 longer window → more lag
      out("#lb-spk, #lb-flat", ${f(LS[4])}, 0.2);
      X8.winTo(tl, "tw", ${f(TM.win4)}, 116, 1.0);
      X8.paper(tl, "tw", ${f(TM.win4)}, 60, 3.0);
      pop("#lb-lag", ${f(TM.lag4 - 0.2)});
      // ===== L5 low liquidity: multi-block manipulation → red stair line
      out("#lb-lag", ${f(LS[5])}, 0.2);
      X8.winTo(tl, "tw", ${f(LS[5])}, 60, 0.5);
      X8.spike(tl, "tw", ${f(LS[5])}, false, 0.2);
      pop("#blk", ${f(TM.low5 - 0.2)});
      X8.trail(tl, "tw", ${f(TM.multi5 - 0.2)}, true, 1.6);
      for (let i = 0; i < ${NB}; i++) tl.to("#bk" + i, { borderColor: "#e0453a", color: "#e0453a", duration: 0.15 }, ${f(TM.multi5 - 0.2)} + i * 0.27);
      pop("#lb-multi", ${f(TM.multi5)});
      // ===== L6 PoS: the same proposer makes consecutive blocks → cheaper
      for (let i = 1; i < 5; i++) tl.to("#bk" + i, { backgroundColor: "#1c1c1c", borderColor: "#1c1c1c", color: "#ffffff", duration: 0.2 }, ${f(TM.prop6)} + (i - 1) * 0.15);
      pop("#lb-prop", ${f(TM.cheap6 - 0.6)});
      // ===== L7 Inverse Finance (Apr 2022)
      out("#lb-multi, #lb-prop, #blk", ${f(LS[7] - 0.1)}, 0.2);
      X8.trail(tl, "tw", ${f(LS[7])}, false, 0.4);
      KIT.cam(tl, ${f(LS[7] - 0.1)}, CAMS.inv, 1.3);
      pop("#evt", ${f(TM.inv7 - 0.2)});
      // ===== L8 no flash loan: own funds push up INV in a shallow pool
      fadeIn("#invw", ${f(LS[7] + 0.6)}, 0.4); pop("#lb-inv", ${f(TM.shallow8 - 0.3)});
      fadeIn("#aiw", ${f(TM.nofl8 - 0.2)}, 0.3);
      pop("#lb-nofl", ${f(TM.nofl8 + 0.2)});
      pop("#lb-own", ${f(TM.own8)});
      X8.poolPump(tl, "inv", ${f(TM.own8 + 0.4)}, { side: "R", n: 4, gap: 0.6, L: 0.2, R: 0.92, deg: 58, read: null });
      // ===== L9 spam txs block arbitrage → TWAP outputs an inflated price
      out("#lb-nofl", ${f(LS[9])}, 0.2);
      for (let i = 0; i < 4; i++) fadeIn("#ltw" + i, ${f(TM.spam9)} + i * 0.18, 0.25);
      pop("#lb-spam", ${f(TM.spam9 + 0.6)});
      X8.trail(tl, "tw", ${f(TM.spam9 + 0.4)}, true, 1.4);
      X8.avg(tl, "tw", ${f(TM.high9 - 0.3)}, "2,900", true);
      pop("#lb-high", ${f(TM.high9 - 0.2)});
      // ===== L10 about $15.6M (public reports)
      tl.to("#ev-amt", { opacity: 1, duration: 0.3 }, ${f(TM.amt10 - 0.2)});
      tl.to("#ev-tag", { opacity: 1, duration: 0.3 }, ${f(TM.amt10 + 0.3)});
      // ===== L11 blocks one tx, not capital over many blocks
      out("#lb-spam, #lb-own", ${f(LS[11] - 0.1)}, 0.2);
      pop("#cmp", ${f(LS[11])});
      tl.to("#cm0", { opacity: 1, duration: 0.25 }, ${f(TM.ok11)});
      tl.to("#cm1", { opacity: 1, duration: 0.25 }, ${f(TM.no11)});
      // ===== L12 offchain aggregation: to the oracle, towers light up
      out("#evt, #cmp, #lb-high, #lb-inv", ${f(LS[12] - 0.15)}, 0.2);
      out("#invw, #aiw, #ltw0, #ltw1, #ltw2, #ltw3", ${f(LS[12])}, 0.4);
      X8.trail(tl, "tw", ${f(LS[12])}, false, 0.4); X8.avg(tl, "tw", ${f(LS[12])}, "2,000", false);
      out("#ptw", ${f(LS[12])}, 0.4); fadeIn("#pow", ${f(LS[12])}, 0.4);
      KIT.cam(tl, ${f(LS[12] - 0.15)}, CAMS.nodes, 1.4);
      src(1, ${f(TM.agg12)});
      pop("#lb-agg", ${f(TM.agg12)});
      pop("#lb-nodes", ${f(TM.agg12 + 0.6)});
      for (let i = 0; i < 3; i++) flash("#tow" + i + "-wave-0, #tow" + i + "-wave-1, #tow" + i + "-wave-2", ${f(TM.agg12 + 0.4)} + i * 0.2, 2);
      // ===== L13 aggregated offchain, then written onchain; one tx cannot move it
      out("#lb-nodes", ${f(LS[13])}, 0.2);
      for (let i = 0; i < 3; i++) draw("#sg" + i, ${f(LS[13] + 0.2)} + i * 0.15, 1.0);
      flow("po", ${f(TM.up13)}, 3.0);
      pop("#lb-safe", ${f(TM.cant13 - 0.2)});
      // ===== L14 heartbeat + deviation threshold
      out("#lb-safe, #lb-agg", ${f(LS[14] - 0.1)}, 0.2);
      pop("#lb-hb", ${f(TM.hb14)}); KIT.clock(tl, "ck", ${f(TM.hb14)}, 0.8, 60);
      X1.needle(tl, "orc", ${f(TM.dev14)}, 2, 0.4);
      pop("#lb-dev", ${f(TM.dev14 + 0.1)});
      flash("#orc-needle", ${f(TM.dev14 + 0.5)}, 2);
      // ===== L15 heartbeat = longest interval between updates, even if unchanged
      tl.set("#lb-hb", { opacity: 0 }, ${f(TM.hb15)}); pop("#lb-hb2", ${f(TM.hb15)});
      out("#lb-dev", ${f(LS[15] + 0.2)}, 0.2);
      KIT.clock(tl, "ck", ${f(TM.max15 - 0.4)}, 1.0, 60);
      // ===== L16 risk changes direction: stale / bound / node failure
      out("#lb-hb2", ${f(LS[16])}, 0.2);
      pop("#lb-stale", ${f(TM.stale16)});
      X1.needle(tl, "orc", ${f(TM.bound16)}, -68, 0.4); pop("#lb-bound", ${f(TM.bound16 + 0.1)});
      KIT.broke(tl, "tow2", ${f(TM.fail16)}, { badge: true, ghost: 0.35 }); out("#sg2", ${f(TM.fail16)}, 0.3);
      pop("#lb-down", ${f(TM.fail16 + 0.1)});
      // ===== L17 multi-source: two pipes compared at a joint; deviation → pause
      out("#lb-stale, #lb-bound, #lb-down, #sg0, #sg1, #po-flow", ${f(LS[17] - 0.1)}, 0.2);
      KIT.fixed(tl, "tow2", ${f(LS[17])}); X1.needle(tl, "orc", ${f(LS[17])}, -20, 0.4);
      KIT.cam(tl, ${f(LS[17] - 0.1)}, CAMS.right, 1.3);
      src(2, ${f(TM.multi17)});
      fadeIn("#ptw", ${f(TM.multi17)}, 0.4);
      flow("pt", ${f(TM.cmp17 - 0.2)}, 2.2); flow("po", ${f(TM.cmp17 - 0.2)}, 2.2);
      pop("#lb-cmp", ${f(TM.cmp17)});
      KIT.toggle(tl, "knf", ${f(TM.pause17 - 0.3)}, false, 0.5);
      pop("#lb-pause", ${f(TM.pause17)});
      // ===== L18 more robust but complex: who do we listen to?
      out("#lb-pause", ${f(LS[18])}, 0.2);
      tl.set("#lb-cmp", { opacity: 0 }, ${f(TM.who18 - 0.3)}); pop("#lb-who", ${f(TM.who18 - 0.3)});
      // ===== L19 LP token: not reserves × spot price
      out("#lb-who, #pt-flow, #po-flow", ${f(LS[19] - 0.1)}, 0.2);
      KIT.toggle(tl, "knf", ${f(LS[19])}, true, 0.4);
      KIT.cam(tl, ${f(LS[19] - 0.1)}, CAMS.lp, 1.2);
      fadeIn("#invw", ${f(LS[19])}, 0.4); X8.poolLevel(tl, "inv", ${f(LS[19])}, 0.55, 0.55, 0.01); X8.poolNeedle(tl, "inv", ${f(LS[19])}, -6, 0.01); X8.poolRed(tl, "inv", ${f(LS[19])}, false);
      pop("#lb-inv2", ${f(LS[19] + 0.3)});
      fadeIn("#certw", ${f(TM.lp19 - 0.2)}, 0.3); pop("#lb-lp", ${f(TM.lp19)});
      pop("#lb-lpx", ${f(TM.res19)});
      // ===== L20 oracle price + invariant → fair reserves → LP value
      out("#lb-lpx", ${f(LS[20])}, 0.2);
      pop("#lb-orp", ${f(TM.ext20)}); draw("#lp0", ${f(TM.ext20 + 0.2)}, 0.8);
      out("#lb-inv2", ${f(TM.inv20 - 0.2)}, 0.2); pop("#lb-xyk", ${f(TM.inv20)}); draw("#lp1", ${f(TM.inv20 + 0.2)}, 0.8);
      pop("#lb-fair", ${f(TM.fair20)});
      // ===== L21 no perfect oracle: three sources, three risks
      out("#lb-orp, #lb-xyk, #lb-fair, #lb-lp, #lb-inv2, #lp0, #lp1", ${f(LS[21] - 0.15)}, 0.2);
      out("#invw, #certw", ${f(LS[21] - 0.1)}, 0.3);
      KIT.cam(tl, ${f(LS[21] - 0.15)}, CAMS.right, 1.0);
      [0, 1, 2].forEach((j) => tl.set("#s3-" + j, { className: "s3 lit" }, ${f(LS[21])}));
      pop("#lb-r1", ${f(LS[21] + 0.2)}); pop("#lb-r2", ${f(LS[21] + 0.5)}); pop("#lb-r3", ${f(LS[21] + 0.8)});
      // ===== L22 two questions: clear to the oracle close-up
      out("#lb-r1, #lb-r2, #lb-r3, #src3", ${f(LS[22] - 0.1)}, 0.2);
      out("#ptw", ${f(LS[22])}, 0.4);
      KIT.cam(tl, ${f(LS[22] - 0.1)}, CAMS.oracle, 1.3);
      pop("#q2", ${f(LS[22] + 0.4)});
      // ===== L23 wrong? (ghost needle) · stopped? (clock)
      tl.to("#q2a", { opacity: 1, duration: 0.3 }, ${f(TM.wrong23 - 0.1)});
      X4.ghostOn(tl, "orc", ${f(TM.wrong23)}, true); X4.ghost(tl, "orc", ${f(TM.wrong23)}, 55, 0.6);
      tl.to("#q2b", { opacity: 1, duration: 0.3 }, ${f(TM.stop23 - 0.1)});
      flash("#ck", ${f(TM.stop23)}, 2);
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes");
console.log(TC.report);
