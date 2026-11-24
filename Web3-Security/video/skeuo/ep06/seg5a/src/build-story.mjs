// Generates compositions/story.html for ep06/seg5a「⑤ 守住余数」(one isometric world, one camera).
// Run: node src/build-story.mjs
import fs from "node:fs";
import { G, at, f, camAt, toScreen, wlab, wpin, dashCurve, kitCss, runtimeJs, CHECK, BADGE } from "../../../kit/iso.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { P, rel } from "./layout.mjs";
import { world, A, OR } from "./world.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const LN = T.lines.map((_, i) => lineAt(T, i));
const w = (term, opt) => wordAt(T, term, opt).start;
const J = (v) => JSON.stringify(v);
const off = (p, dx, dy) => [p[0] + dx, p[1] + dy];
/** world (du, dv) between two canvas ground points */
const dUV = (from, to) => { const a = G(from[0], from[1]), b = G(to[0], to[1]); return [b.u - a.u, b.v - a.v]; };

// ------------------------------------------------------------------ labels (world, counter-scaled)
let labels = "";
const lab = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, (cls + " hide").trim(), a); };
const pin = (id, p, html, a = "c") => { labels += wpin(id, p, html, a); };
const V = A.vault, SD = A.sd;
const slot = (n) => `<div class="slot hide" id="slot${n}">${"①②③④"[n - 1]}</div>`;
// four empty spots around the vault (L0)
const SLOTP = [off(A.ghost.ground, -30, 30), off(A.burn.ground, -20, 40), off(A.lb.top, 0, -20), off(A.cp.top, -30, 210)];
SLOTP.forEach((p, i) => pin("sl" + (i + 1), p, slot(i + 1)));
// ① virtual shares
lab("lb-d1", off(A.ghost.top, -40, -20), "① 虚拟份额 · OpenZeppelin ≥ 4.9", "lab-cs", "b");
lab("lb-ctr", off(SD.counter, -10, -60), "总份额", "lab-sm", "b");
lab("lb-gh", off(A.ghost.ground, -20, 40), "不存在的份额 · 只参与计算", "lab-g", "t");
pin("ck-vic3", off(SD.shelf, 40, 10), CHECK("ckv3", 52, "hide"));
lab("lb-vic3", off(SD.shelf, 80, 30), "受害者照样拿到份额", "lab-gs", "l");
lab("lb-don", off(A.don2.ground, 50, -170), "捐赠 × 10<sup>offset</sup>", "lab-rs", "l");
["×10", "×100", "×1000"].forEach((t, i) => lab("lb-dn" + i, off(A["don" + i].top, 0, -4), t, "lab-g lab-sm", "b"));
lab("lb-off", off(A.don0.ground, -90, 80), "offset = 1 · 2 · 3", "lab-g lab-sm", "t");
// ② burn
lab("lb-d2", off(A.burn.top, 0, -10), "② 初始存款销毁", "lab-cs", "b");
lab("lb-dead", off(A.burn.ground, 60, 30), "份额 → 死地址 · 永远取不出", "lab-ink", "t");
lab("lb-never", off(SD.counter, -40, -60), "金库永远不为空", "lab-cs", "b");
lab("lb-ex", off(SD.ground, -40, 40), "1000 · 示例数", "lab-g lab-sm", "t");
lab("lb-uni", off(A.vit.top, 0, -10), "Uniswap V2 · MINIMUM_LIQUIDITY = 1000", "", "b");
lab("lb-lock", off(A.vit.ground, -30, 40), "首次添加流动性 · 永久锁定 1000 份 LP", "lab-ink", "t");
// ③ internal accounting
lab("lb-d3", off(A.lb.top, 0, -40), "③ 内部记账 · totalAssets（状态变量）", "lab-cs", "b");
lab("lb-same", off(A.lb.top, 240, 40), "账簿数字不变", "lab-gs", "l");
lab("lb-price", off(SD.counter, -40, -60), "份额价格不变", "lab-gs", "b");
pin("ck-led", off(A.lb.top, 200, 40), CHECK("ckl", 52, "hide"));
lab("lb-push", off(A.atk.top, 0, -10), "直接转入", "lab-rs", "b");
// ④ min shares
lab("lb-d4", off(A.cp.top, 0, -10), "④ 最小份额检查", "lab-cs", "b");
lab("lb-req", off(A.cp.top, 230, 30), "require(shares > 0)", "lab-ink", "l");
lab("lb-min", off(A.vic.top, 40, -10), "用户侧 · minSharesOut", "", "b");
lab("lb-zero", off(A.cp.ground, 120, 30), "0 份额", "lab-rs", "t");
lab("lb-rb", off(A.vic.ground, 40, 40), "回滚 ≠ 损失", "lab-gs", "t");
pin("ck-rb", off(A.vic.top, -60, 40), CHECK("ckrb", 56, "hide"));
// comparison
lab("lb-vv", off(A.vv.top, -40, -20), "漏洞版", "lab-r", "b");
lab("lb-fix", off(A.cp.top, 150, -60), "修复版 · 四种防御都装上", "lab-gs", "l");
lab("lb-loss", off(A.vvic.center, -50, 0), "受害者损失资产", "lab-rs", "r");
pin("bx-vvic", off(A.vvic.top, 0, 30), BADGE("bxvv", 60, "hide"));
lab("lb-nop", off(A.atk.ground, 40, 40), "攻击无利可图", "lab-rs", "t");
pin("bx-atk", off(A.atk.top, 0, 30), BADGE("bxa", 60, "hide"));
pin("ck-vic", off(A.vic.top, 0, 30), CHECK("ckv", 56, "hide"));
// Uranium
lab("lb-fee", off(A.knob.top, 0, -6), "手续费 0.3% <span class=\"gt\">公开分析</span>", "lab-ink", "b");
lab("lb-fee2", off(A.knob.top, 0, -6), "手续费 0.3% → 0.16% <span class=\"gt\">公开分析</span>", "lab-ink", "b");
const BL = A.bal;
lab("lb-mL", off(BL.panL, 0, -20), "左边 × 1000", "", "b");
lab("lb-mL2", off(BL.panL, 0, -20), "左边 × 10000", "lab-cs", "b");
lab("lb-mR", off(BL.panR, 0, -20), "右边 × 1000²", "lab-r", "b");
lab("lb-miss", off(BL.panR, 105, -48), "漏改", "lab-rs", "l");
lab("lb-100", off(BL.foot, 0, 30), "左边放大 10000² / 1000² = 100 倍", "lab-ink", "t");
lab("lb-k", off(BL.foot, 0, 30), "x × y ≥ k", "lab-ink", "t");
lab("lb-k2", off(BL.foot, 0, 30), "x × y ≥ k / 100", "lab-rs", "t");
lab("lb-tiny", off(A.atk3.top, 0, -10), "极少量代币", "lab-rs", "b");
lab("lb-ura", off(A.ura.top, 0, -10), "Uranium Finance", "lab-cs", "b");
lab("lb-sync", off(A.lesson.top, 330, 40), "改过的常数 · 每个使用位置都同步", "lab-cs", "l");

// ------------------------------------------------------------------ cameras
const Cc = (pt, k, sx = 960, sy = 540) => camAt(pt, sx, sy, k);
const CAMS = {
  wide: Cc([1400, -60], 1.0, 1080, 600),
  d1: Cc([1330, 0], 1.15, 760, 560),
  atk: Cc([1720, -140], 1.0, 1080, 620),
  burn: Cc([1080, -20], 1.1, 1000, 600),
  vit: Cc([760, -120], 1.05, 1080, 620),
  led: Cc([1640, -220], 1.0, 1060, 640),
  cp: Cc([1720, 40], 1.05, 1000, 600),
  cmp: Cc([1300, 180], 0.74, 980, 520),
  pan: Cc([2700, -230], 0.62, 960, 560),
  ura: Cc([3560, -420], 0.95, 1100, 600),
  bal: Cc([4060, -420], 1.2, 660, 640),
  res: Cc([3860, -330], 0.9, 720, 620),
  end: Cc([3860, -300], 0.82, 680, 640),
};

// ------------------------------------------------------------------ times
const TM = {
  four: w("四种做法"),
  virt: w("虚拟份额"), oz: w("OpenZeppelin"), v49: w("4.9"),
  calc: w("计算份额"), offp: w("偏移次方", { line: 2 }), plus1: w("总资产", { line: 2 }),
  atk: w("攻击者", { line: 3 }), same: w("同样的损失"), don: w("捐赠", { line: 3 }), times: w("倍的资金"),
  burn: w("初始存款销毁"), deploy: w("部署时"), dead: w("死地址"),
  never: w("永远不会"),
  uni: w("Uniswap", { line: 6 }), lock: w("永久锁定"),
  inner: w("内部记账"), state: w("状态变量"), noBal: w("不读余额"),
  much: w("捐赠多少"), price: w("份额价格"),
  minc: w("最小份额检查"), zero: w("份额是0"), user: w("用户也可以"),
  vic: w("受害者", { line: 10 }), rb: w("回滚", { line: 10 }), z0: w("0份额", { line: 10 }),
  prove: w("怎么证明"), two: w("两个结果"),
  vuln: w("漏洞版"), lossA: w("损失资产"), fix: w("修复版"), nop: w("无利可图"),
  other: w("另一种失误"),
  lp: w("LP", { line: 6 }), rb9: w("回滚", { line: 9 }),
  y2021: w("2021"), ura: w("Uranium"), fork: w("分叉自"),
  pub: w("公开分析"), fee: w("手续费"), f016: w("0.16"),
  left: w("左边", { line: 16 }), l1w: w("1万"),
  right: w("右边", { line: 17 }), sq: w("平方", { line: 17 }), miss: w("漏改"),
  x100: w("100倍"),
  inv: w("不变量"), degr: w("退化"), pct1: w("百分之一"),
  tiny: w("极少量"), p99: w("99"),
  rep: w("公开报道"), m50: w("5000万"),
  lesson: w("修改过的"), newc: w("新代码"),
  consts: w("改过的常数"), every: w("每一个使用位置"), sync: w("同步"),
};
const END = Math.min(TOTAL - 1.0, LN[23].speechEnd + 0.15);

// ------------------------------------------------------------------ screen cards
const CARD_D = { x: 1000, y: 118, w: 880 };
const cardD = `<div class="k-code hide" id="cardD" style="left:${CARD_D.x}px;top:${CARD_D.y}px;width:${CARD_D.w}px">
  <div class="c-head">份额公式 · 虚拟份额<span class="c-tag">OpenZeppelin ≥ 4.9</span></div>
  <div class="c-row" id="cd0">shares = assets * (totalSupply <span class="tl" id="cd-o">+ 10**offset</span>)</div>
  <div class="c-row" id="cd1">         / (totalAssets <span class="tl" id="cd-1">+ 1</span>)  <span class="c-cm">// 向下取整</span></div>
</div>`;
const cardD2 = `<div class="k-code hide" id="cardD2" style="left:${CARD_D.x}px;top:${CARD_D.y}px;width:${CARD_D.w}px">
  <div class="c-head">总资产从哪来<span class="c-tag">内部记账</span></div>
  <div class="c-row" id="cd2"><span class="strike" id="cd2s">totalAssets = asset.balanceOf(this)</span></div>
  <div class="c-row" id="cd3" style="opacity:0">totalAssets = _totalAssets  <span class="c-cm">// 状态变量</span></div>
</div>`;
const CARD_E = { x: 880, y: 118, w: 1000 };
const swp = (id, a, b) => `<span class="swp"><span id="${id}a">${a}</span><span id="${id}b" style="opacity:0">${b}</span></span>`;
const cardE = `<div class="k-code hide" id="cardE" style="left:${CARD_E.x}px;top:${CARD_E.y}px;width:${CARD_E.w}px">
  <div class="c-head">swap() 余额检查 · Uranium<span class="c-tag">Solidity</span></div>
  <div class="c-row" id="ce0">balance0.mul(<span class="k" id="ek0">10000</span>).sub(amount0In.mul(16))<span class="c-chip ok" id="ce0c" style="opacity:0">左 · 已改</span></div>
  <div class="c-row" id="ce1">require(b0Adj.mul(b1Adj) &gt;=</div>
  <div class="c-row" id="ce2">    r0.mul(r1).mul(<span class="k" id="ek1">${swp("ek1", "1000**2", "10000**2")}</span>));<span class="c-chipw"><span class="c-chip" id="ce2c" style="opacity:0">右 · 漏改</span><span class="c-chip ok" id="ce2g" style="opacity:0">右 · 同步</span></span></div>
  <div class="c-row" id="ce3"><span class="c-cm">// 应为 .mul(10000**2)</span></div>
</div>`;
const rowY = (c, i) => c.y + 24 + 56 + 50 * i + 25;
// leader: card E row 2 → right pan multiplier (camera "bal" is still during L17)
const ov = [];
const S = (cam, p) => toScreen(CAMS[cam], p);
{
  const P0 = [CARD_E.x + 34 + 19 * 18 + 70, rowY(CARD_E, 2) + 20], P3 = off(S("bal", BL.panR), 30, -24 * 1.2 - 50);
  ov.push(dashCurve("lnE", P0, P3, { color: "#e0453a", c1: [P0[0] - 20, P0[1] + 90], c2: [P3[0] + 160, P3[1] - 40] }).svg);
}
const ovSvg = `<svg id="ovl" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">${ov.join("")}</svg>`;
// reserves: 100 dots, each = 1 %
const dots = Array.from({ length: 100 }, (_, i) => `<i class="d${i === 0 ? " keep" : ""}" id="rd${i}"></i>`).join("");
const SEC = SCRIPT.sections;

// ------------------------------------------------------------------ html
const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 88px; }
    .slot { width: 76px; height: 76px; border-radius: 50%; border: 5px dashed #2aa3c9; background: rgba(255,253,248,0.9); color: #1d93ba; font-size: 44px; font-weight: 900; line-height: 66px; text-align: center; }
    .k-code .tl { border-radius: 8px; padding: 0 4px; }
    .k-code .k { border-radius: 8px; padding: 0 4px; }
    .k-code .strike { position: relative; }
    .k-code .strike::after { content: ""; position: absolute; left: -6px; right: -6px; top: 50%; height: 4px; background: #e0453a; transform: scaleX(var(--sx, 0)); transform-origin: 0 50%; }
    .k-code .c-chip.ok { background: #1f9d55; }
    .k-code .c-chipw { display: inline-grid; } .k-code .c-chipw > span { grid-area: 1 / 1; }
    #legend sup, .lab sup { font-size: 28px; }
    .lab .gt { font-size: 26px; font-weight: 700; color: #1c1c1c; background: #ebe6dc; border-radius: 8px; padding: 0 10px 2px; }
    .k-code .swp { display: inline-grid; } .k-code .swp > span { grid-area: 1 / 1; }
    .card { position: absolute; left: 60px; top: 118px; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); padding: 20px 30px 22px; white-space: nowrap; }
    .card .ev-d { font-size: 30px; font-weight: 700; color: #6d685e; margin-bottom: 4px; }
    .card .ev-t { font-size: 44px; font-weight: 900; }
    .card .ev-r { margin-top: 12px; font-size: 36px; font-weight: 900; display: flex; align-items: center; gap: 14px; }
    .card .ev-r .lab { position: static; }
    .card .red { color: #c3352b; }
    #legend { position: absolute; left: 56px; top: 118px; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); padding: 16px 26px 16px; white-space: nowrap; }
    #legend .h { font-size: 30px; font-weight: 800; color: #6d685e; margin-bottom: 4px; }
    #legend .r { display: flex; align-items: center; gap: 12px; height: 52px; font-size: 30px; font-weight: 800; opacity: 0.28; }
    #legend .r .n { color: #1d93ba; font-size: 34px; width: 36px; }
    #legend .r .b { color: #17809f; font-weight: 700; }
    #kw { position: absolute; left: 0; right: 0; top: 118px; text-align: center; }
    #kw .k-big { display: inline-block; font-size: 56px; background: #fffdf8; border-radius: 18px; padding: 12px 40px 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    #kw .k-big b { color: #1d93ba; }
    .tcard { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
      padding: 14px 26px 18px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
    .tcard.tc-leg { top: 424px; }
    .tcard.tc-ev { top: 360px; }
    .tcard .t1 { font-size: 32px; font-weight: 900; white-space: nowrap; }
    .tcard .t2 { margin-top: 6px; font-size: 29px; font-weight: 700; color: #3d3a35; white-space: nowrap; }
    #res { position: absolute; left: 1360px; top: 300px; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); padding: 18px 26px 18px; }
    #res .t { font-size: 32px; font-weight: 900; margin-bottom: 12px; white-space: nowrap; }
    #res .g { display: grid; grid-template-columns: repeat(10, 34px); gap: 8px; }
    #res .d { display: block; width: 34px; height: 34px; border-radius: 50%; background: #2aa3c9; }
    #res .cap { font-size: 28px; font-weight: 700; color: #6d685e; margin-top: 12px; white-space: nowrap; }
    #res .cap2 { font-size: 32px; font-weight: 900; color: #c3352b; margin-top: 4px; white-space: nowrap; opacity: 0; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world()}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div id="legend" class="hide">
        <div class="h">四种做法 · 各挡住攻击的哪一步</div>
        <div class="r" id="lg1"><span class="n">①</span>虚拟份额<span class="b">→ 捐赠成本 × 10<sup>offset</sup></span></div>
        <div class="r" id="lg2"><span class="n">②</span>初始存款销毁<span class="b">→ 金库永不为空</span></div>
        <div class="r" id="lg3"><span class="n">③</span>内部记账<span class="b">→ 捐赠不改价格</span></div>
        <div class="r" id="lg4"><span class="n">④</span>最小份额检查<span class="b">→ 0 份额就回滚</span></div>
      </div>
      ${cardD}${cardD2}${cardE}
      <div id="kw"><div class="k-big hide" id="kw1">修好了 · 怎么证明？<b>要两个结果</b> <span class="lab lab-g lab-sm" style="position:static;vertical-align:8px">解读</span></div><div class="k-big hide" id="kw2" style="position:absolute;left:50%;top:0;transform:translateX(-50%)">最后一个案例 · <b>另一种失误</b></div></div>
      <div class="card hide" id="ev">
        <div class="ev-d">2021 年 4 月 · BNB Chain</div>
        <div class="ev-t">Uranium Finance</div>
        <div class="ev-r" id="ev-loss" style="opacity:0"><span class="red">损失约 5000 万美元</span><span class="lab lab-g lab-sm">公开报道</span></div>
      </div>
      <div id="res" class="hide"><div class="t">池子储备</div><div class="g">${dots}</div><div class="cap">每点 = 储备的 1%</div><div class="cap2" id="res2">约 99% 被换出</div></div>
      ${ovSvg}
      <div class="tcard tc-leg hide" id="tcL"><div class="t1">LP 代币</div><div class="t2">加流动性换来的池子份额</div></div>
      <div class="tcard tc-leg hide" id="tcR"><div class="t1">回滚</div><div class="t2">撤销这次调用的全部状态修改</div></div>
      <div class="tcard tc-ev hide" id="tcK"><div class="t1">分叉</div><div class="t2">照搬现成项目的代码再改动</div></div>
      ${pills(5, { sections: SEC })}
      <div class="k-title" id="ttl-card"><div class="t-main">⑤ 守住余数</div><div class="t-sub">四种防御 · 一个分叉的教训</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E2.runtimeExtJs()}
${E3.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${J(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const term = (id, t0, t1) => { KIT.pop(tl, "#" + id, t0, 0.3); out("#" + id, t1, 0.25); };
      const fade = (sel, t, to, d) => tl.to(sel, { opacity: to, duration: d || 0.3, ease: "power1.out" }, t);
      const hideGrow = (id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); };
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      const hidden = (ids) => ids.forEach((id) => tl.set("#" + id, { opacity: 0 }, 0));
      const hot = (sel, t, color) => tl.to(sel, { backgroundColor: color || "rgba(42,163,201,0.22)", duration: 0.3 }, t);
      const lg = (n, t) => tl.to("#lg" + n, { opacity: 1, duration: 0.3 }, t);

      KIT.camSet(tl, CAMS.wide);
      ["gh", "bb", "eng", "egold", "vit", "cp", "atk", "vic", "vgold", "dgold", "don0", "don1", "don2", "vv", "vsd", "vatk", "vvic",
       "ura", "fork", "bal", "atk3", "lesson", "kn"].forEach(hideGrow);
      hidden(["vc"]);

      // ===== 0–1.75 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.3);

      // ===== L0 four ways: four empty spots light up around the vault
      [1, 2, 3, 4].forEach((n, i) => pop("#slot" + n, ${f(LN[0].start + 0.5)} + i * 0.2, 0.3));
      pop("#legend", ${f(TM.four - 0.2)}, 0.35);

      // ===== L1 virtual shares + offset (OZ ≥ 4.9)
      KIT.cam(tl, ${f(LN[1].start - 0.2)}, CAMS.d1, 1.2);
      out("#slot2, #slot3, #slot4", ${f(LN[1].start - 0.2)}, 0.2);
      lg(1, ${f(TM.virt)});
      out("#slot1", ${f(TM.virt)}, 0.2);
      grow("gh", ${f(TM.virt)}, 0.5);
      pop("#lb-ctr", ${f(TM.virt + 0.4)});
      pop("#lb-d1", ${f(TM.oz)});
      pop("#lb-gh", ${f(TM.v49 + 0.3)});

      // ===== L2 formula: total supply + 10^offset, total assets + 1
      pop("#cardD", ${f(TM.calc - 0.1)}, 0.35);
      hot("#cd-o", ${f(TM.offp - 0.2)});
      hot("#cd-1", ${f(TM.plus1 + 0.2)});

      // ===== L3 replay the attack: the donation is no longer enough; the needed donation grows ×10^offset
      KIT.cam(tl, ${f(LN[3].start - 0.3)}, CAMS.atk, 1.3);
      out("#cardD, #lb-ctr, #lb-d1, #lb-gh", ${f(LN[3].start - 0.3)}, 0.25);
      grow("atk", ${f(TM.atk - 0.3)}); grow("dgold", ${f(TM.atk - 0.1)});
      {
        const d = ${J(dUV(rel(P.atk, -150, -40), V.ground))};
        KITX06.carry(tl, "dgold", ${f(TM.atk + 0.5)}, d[0] + 140, d[1] + 150, 0, 0.9, 0);
        out("#dgold", ${f(TM.atk + 1.35)}, 0.2);
      }
      KITX06.issue(tl, "sd", ${f(TM.same)}, 0);
      pop("#ckv3", ${f(TM.same + 0.5)}, 0.3); pop("#lb-vic3", ${f(TM.same + 0.6)});
      ${[0, 1, 2].map((i) => `grow("don${i}", ${f(TM.don)} + ${i} * 0.4, 0.6); pop("#lb-dn${i}", ${f(TM.don + 0.3)} + ${i} * 0.4);`).join(" ")}
      pop("#lb-don", ${f(TM.don + 1.3)}); pop("#lb-off", ${f(TM.times)});

      // ===== L4 burn the initial deposit's shares
      KIT.cam(tl, ${f(LN[4].start - 0.3)}, CAMS.burn, 1.3);
      out("#lb-don, #lb-off, #lb-dn0, #lb-dn1, #lb-dn2, #ckv3, #lb-vic3", ${f(LN[4].start - 0.3)}, 0.2);
      tl.to("#don0, #don1, #don2", { opacity: 0, duration: 0.3 }, ${f(LN[4].start)});
      tl.set("#atk", { opacity: 0 }, ${f(LN[4].start + 0.3)});
      lg(2, ${f(TM.burn)});
      out("#slot2", ${f(TM.burn)}, 0.2);
      grow("bb", ${f(TM.burn)}, 0.5); pop("#lb-d2", ${f(TM.burn + 0.5)});
      grow("eng", ${f(TM.deploy - 0.4)}); grow("egold", ${f(TM.deploy - 0.2)});
      {
        const d = ${J(dUV(rel(P.eng, 90, -20), SD.ground))};
        KITX06.carry(tl, "egold", ${f(TM.deploy + 0.3)}, d[0] + 30, d[1] + 70, 60, 0.8, 30);
        out("#egold", ${f(TM.deploy + 1.1)}, 0.15);
      }
      KITX06.tally(tl, "sd", ${f(TM.deploy + 1.1)}, 0.8, 0, 1000);
      KITX06.issue(tl, "sd", ${f(TM.deploy + 1.3)}, 1);
      KITX06.burn(tl, "bb", ${f(TM.dead - 0.3)}, 0);
      pop("#lb-dead", ${f(TM.dead + 0.2)});

      // ===== L5 the vault is never empty
      pop("#lb-never", ${f(TM.never - 0.3)}); pop("#lb-ex", ${f(TM.never)});
      tl.fromTo("#sd-ctr", { opacity: 1 }, { opacity: 0.55, duration: 0.18, yoyo: true, repeat: 3, immediateRender: false }, ${f(TM.never)});

      // ===== L6 Uniswap V2 locks 1000 LP forever
      KIT.cam(tl, ${f(LN[6].start - 0.2)}, CAMS.vit, 1.3);
      out("#lb-dead, #lb-ex, #lb-d2, #lb-never", ${f(LN[6].start - 0.2)}, 0.2);
      grow("vit", ${f(TM.uni - 0.3)}, 0.6);
      pop("#lb-uni", ${f(TM.uni + 0.3)});
      pop("#lb-lock", ${f(TM.lock)});
      term("tcL", ${f(TM.lp)}, ${f(TM.lp + 3.6)});

      // ===== L7 internal accounting
      KIT.cam(tl, ${f(LN[7].start - 0.2)}, CAMS.led, 1.3);
      out("#lb-uni, #lb-lock", ${f(LN[7].start - 0.2)}, 0.2);
      lg(3, ${f(TM.inner)});
      out("#slot3", ${f(TM.inner)}, 0.2);
      fade("#lbk", ${f(TM.inner)}, 1, 0.2);
      tl.fromTo("#lbk", { y: -80 }, { y: 0, duration: 0.5, ease: "bounce.out", immediateRender: false }, ${f(TM.inner)});
      pop("#lb-d3", ${f(TM.state - 0.2)});
      pop("#cardD2", ${f(TM.state)}, 0.35);
      tl.fromTo("#cd2s", { "--sx": 0 }, { "--sx": 1, duration: 0.4, ease: "power2.out", immediateRender: false }, ${f(TM.noBal - 0.1)});
      tl.to("#cd2", { opacity: 0.45, duration: 0.3 }, ${f(TM.noBal + 0.3)});
      fade("#cd3", ${f(TM.noBal + 0.3)}, 1, 0.3);

      // ===== L8 donations no longer move the price
      out("#cardD2", ${f(TM.much + 0.9)}, 0.25);
      tl.set("#atk", { opacity: 1 }, ${f(LN[8].start - 0.3)});
      KITX06.carry(tl, "dgold", ${f(LN[8].start - 0.35)}, 0, 0, 0, 0.01); tl.set("#dgold", { opacity: 1 }, ${f(LN[8].start - 0.3)});
      pop("#lb-push", ${f(TM.much - 0.1)});
      {
        const d = ${J(dUV(rel(P.atk, -150, -40), V.ground))};
        KITX06.carry(tl, "dgold", ${f(TM.much)}, d[0] + 140, d[1] + 150, 0, 0.9, 0);
        out("#dgold", ${f(TM.much + 0.85)}, 0.2);
      }
      pop("#lb-same", ${f(TM.much + 1.0)});
      pop("#ckl", ${f(TM.much + 1.0)}, 0.3);
      pop("#lb-price", ${f(TM.price)});

      // ===== L9 minimum-share check
      KIT.cam(tl, ${f(LN[9].start - 0.2)}, CAMS.cp, 1.3);
      term("tcR", ${f(TM.rb9)}, ${f(TM.rb9 + 3.6)});
      out("#lb-push, #lb-same, #ckl, #lb-price, #lb-d3", ${f(LN[9].start - 0.2)}, 0.2);
      tl.to("#atk", { opacity: 0, duration: 0.2 }, ${f(LN[9].start - 0.2)});
      lg(4, ${f(TM.minc)});
      out("#slot4", ${f(TM.minc)}, 0.2);
      grow("cp", ${f(TM.minc)}, 0.6); pop("#lb-d4", ${f(TM.minc + 0.5)});
      pop("#lb-req", ${f(TM.zero - 0.1)});
      grow("vic", ${f(TM.user - 0.4)}); grow("vgold", ${f(TM.user - 0.2)});
      out("#lb-req", ${f(TM.user + 0.2)}, 0.2);
      pop("#lb-min", ${f(TM.user + 0.3)});

      // ===== L10 the victim's transaction reverts instead of returning 0 shares
      out("#lb-min", ${f(LN[10].start - 0.1)}, 0.2);
      KITX06.carry(tl, "vgold", ${f(TM.vic)}, -300, 0, 0, 0.8, 0, "power2.in");
      pop("#lb-zero", ${f(TM.vic + 0.7)});
      tl.fromTo("#cp-arm", { opacity: 1 }, { opacity: 0.5, duration: 0.12, yoyo: true, repeat: 3, immediateRender: false }, ${f(TM.vic + 0.8)});
      KITX06.carry(tl, "vgold", ${f(TM.rb)}, 0, 0, 0, 0.7, 30, "power2.out");
      out("#lb-zero", ${f(TM.rb + 0.6)}, 0.2);
      pop("#lb-rb", ${f(TM.rb + 0.6)}); pop("#ckrb", ${f(TM.rb + 0.7)}, 0.3);

      // ===== L11 two results — the unpatched vault on the left, the patched one on the right
      KIT.cam(tl, ${f(LN[11].start - 0.3)}, CAMS.cmp, 1.4);
      out("#lb-rb, #ckrb, #lb-req, #lb-d4", ${f(LN[11].start - 0.3)}, 0.2);
      out("#legend", ${f(LN[11].start - 0.3)}, 0.2);
      tl.set("#atk", { opacity: 1 }, ${f(LN[11].start)});
      ["vv", "vsd", "vatk", "vvic"].forEach((id, i) => grow(id, ${f(LN[11].start + 0.2)} + i * 0.12, 0.5));
      pop("#lb-vv", ${f(TM.prove)}); pop("#lb-fix", ${f(TM.prove + 0.2)});
      pop("#kw1", ${f(TM.two - 0.4)}, 0.35);

      // ===== L12 unpatched: victim loses; patched: attack unprofitable
      pop("#bxvv", ${f(TM.lossA - 0.4)}, 0.3); pop("#lb-loss", ${f(TM.lossA - 0.2)});
      pop("#bxa", ${f(TM.nop - 0.5)}, 0.3); pop("#lb-nop", ${f(TM.nop - 0.3)});
      pop("#ckv", ${f(TM.nop + 0.1)}, 0.3);

      // ===== L13 another mistake — pan right past the Balancer pool
      KIT.cam(tl, ${f(LN[13].start - 0.3)}, CAMS.pan, 1.2);
      out("#kw1, #lb-vv, #lb-fix, #bxvv, #lb-loss, #bxa, #lb-nop, #ckv", ${f(LN[13].start - 0.3)}, 0.25);
      pop("#kw2", ${f(LN[13].start)}, 0.35);

      // ===== L14 Uranium Finance, a Uniswap V2 fork
      KIT.cam(tl, ${f(LN[14].start - 0.6)}, CAMS.ura, 1.5);
      out("#kw2", ${f(LN[14].start + 0.4)}, 0.25);
      pop("#ev", ${f(TM.y2021)}, 0.35);
      grow("ura", ${f(TM.ura - 0.2)}, 0.6); pop("#lb-ura", ${f(TM.ura + 0.3)});
      term("tcK", ${f(TM.fork + 0.2)}, ${f(TM.fork + 3.8)});
      grow("fork", ${f(TM.fork - 0.2)}, 0.6);

      // ===== L15 fee 0.3% → 0.16% (public analysis)
      grow("kn", ${f(LN[15].start)}, 0.5);
      pop("#lb-fee", ${f(TM.pub)});
      KIT.rot(tl, "kn-ndl", ${f(TM.f016 - 0.3)}, -25, 0.7);
      out("#lb-fee", ${f(TM.f016)}, 0.15); pop("#lb-fee2", ${f(TM.f016 + 0.05)});

      // ===== L16 left side: 1000 → 10000
      KIT.cam(tl, ${f(LN[16].start - 0.3)}, CAMS.bal, 1.3);
      out("#ev, #lb-fee2, #lb-ura", ${f(LN[16].start - 0.3)}, 0.25);
      grow("bal", ${f(LN[16].start - 0.1)}, 0.6);
      pop("#cardE", ${f(TM.left - 0.2)}, 0.35);
      pop("#lb-mL", ${f(TM.left)});
      out("#lb-mL", ${f(TM.l1w - 0.3)}, 0.15); pop("#lb-mL2", ${f(TM.l1w - 0.2)});
      hot("#ek0", ${f(TM.l1w - 0.3)}); fade("#ce0c", ${f(TM.l1w)}, 1, 0.3);

      // ===== L17 right side still 1000² — missed
      pop("#lb-mR", ${f(TM.right)});
      hot("#ek1", ${f(TM.sq - 0.2)}, "rgba(224,69,58,0.18)");
      KIT.draw(tl, "lnE", ${f(TM.sq)}, 0.7);
      pop("#lb-miss", ${f(TM.miss - 0.1)}); fade("#ce2c", ${f(TM.miss)}, 1, 0.3);

      // ===== L18 the left side is amplified 100×
      out("#lnE", ${f(LN[18].start - 0.1)}, 0.2);
      out("#lb-miss", ${f(LN[18].start)}, 0.2);
      KITX01.tilt(tl, "bal", ${f(TM.x100 - 0.5)}, 28, 0.8);
      tl.to("#lb-mL2-pin", { y: 48, duration: 0.8, ease: "back.out(1.6)" }, ${f(TM.x100 - 0.5)});
      tl.to("#lb-mR-pin", { y: -16, duration: 0.8, ease: "back.out(1.6)" }, ${f(TM.x100 - 0.5)});
      pop("#lb-100", ${f(TM.x100)});

      // ===== L19 the invariant degrades to k / 100 (key frame)
      out("#lb-100", ${f(TM.inv - 0.3)}, 0.15); pop("#lb-k", ${f(TM.inv - 0.1)});
      out("#lb-k", ${f(TM.degr)}, 0.15); pop("#lb-k2", ${f(TM.degr + 0.05)});
      KIT.broke(tl, "bal", ${f(TM.degr)}, { ghost: 1, badge: false });

      // ===== L20 tiny input → ~99% of reserves out
      KIT.cam(tl, ${f(LN[20].start - 0.3)}, CAMS.res, 1.3);
      out("#cardE, #lb-mL2, #lb-mR", ${f(LN[20].start - 0.3)}, 0.25);
      pop("#res", ${f(LN[20].start)}, 0.35);
      grow("atk3", ${f(TM.tiny - 0.4)}); pop("#lb-tiny", ${f(TM.tiny)});
      {
        const d = ${J(dUV(rel(P.atk3, 40, -40), rel(P.ura, -30, 120)))};
        tl.set("#tok", { opacity: 1 }, ${f(TM.tiny + 0.2)});
        KITX06.carry(tl, "tok", ${f(TM.tiny + 0.3)}, d[0], d[1], 0, 0.7, 60);
        out("#tok", ${f(TM.tiny + 1.0)}, 0.15);
      }
      ${"" /* 99 dots leave, one stays */}
      for (let i = 1; i < 100; i++) tl.to("#rd" + i, { backgroundColor: "rgba(224,69,58,0)", boxShadow: "inset 0 0 0 3px #e0453a", duration: 0.25 }, ${f(TM.tiny + 1.0)} + (99 - i) * 0.018);
      fade("#res2", ${f(TM.p99)}, 1, 0.3);
      KIT.led(tl, "ura-led", ${f(TM.tiny + 1.0)}, "red");

      // ===== L21 ~$50M (public reporting)
      pop("#ev", ${f(TM.rep - 0.3)}, 0.35);
      fade("#ev-loss", ${f(TM.m50 - 0.4)}, 1, 0.3);

      // ===== L22 a modified fork is new code
      KIT.cam(tl, ${f(LN[22].start - 0.3)}, CAMS.end, 1.3);
      out("#res, #lb-tiny, #lb-k2", ${f(LN[22].start - 0.3)}, 0.25);
      grow("lesson", ${f(TM.lesson - 0.2)}, 0.7);

      // ===== L23 every place a changed constant is used must change too
      out("#ev", ${f(LN[23].start - 0.2)}, 0.2);
      pop("#cardE", ${f(TM.consts - 0.1)}, 0.35);
      tl.to("#ek0, #ek1", { backgroundColor: "rgba(42,163,201,0.25)", duration: 0.3 }, ${f(TM.consts + 0.2)});
      fade("#ce2c", ${f(TM.every - 0.2)}, 0, 0.2);
      fade("#ek1a", ${f(TM.every)}, 0, 0.2); fade("#ek1b", ${f(TM.every + 0.1)}, 1, 0.25); fade("#ce2g", ${f(TM.every + 0.3)}, 1, 0.25);
      pop("#lb-sync", ${f(TM.sync - 0.3)});
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL, "end", END);
