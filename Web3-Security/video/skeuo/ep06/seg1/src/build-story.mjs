// Generates compositions/story.html for ep06/seg1「① 一次只错一点点」(one isometric world, one camera).
// Run: node src/build-story.mjs
import fs from "node:fs";
import { at, f, box, flat, camAt, gridSvg, worldSvg, wlab, wpin, kitCss, runtimeJs, dashCurve, M } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { sorter, letter, runtimeExtJs as rt01 } from "../../../ep01/kit-ext/objects-ext.mjs";
import { rollCounter, runtimeExtJs as rt02 } from "../../../ep02/kit-ext/objects-ext.mjs";
import { contractMachine, slotCabinet, runtimeExtJs as rt03 } from "../../../ep03/kit-ext/objects-ext.mjs";
import { roundCutter, shareDispenser, besideSafe, shareCert, runtimeExtJs as rt06 } from "../../kit-ext/objects-ext.mjs";
import { CUTTER, CUT_USER, CUT_CTR, CUT_CTR_Z, HOLDERS, VAULT, SORTER, POOL, MINI_CUTTER, SORTER_ATK, BELT_Z, SLOT_CAB, OVF_CTR, OVF_CTR_Z, EVM_FRAME } from "./layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const script = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const L = (i) => lineAt(T, i);
const w = (term, line, o = {}) => wordAt(T, term, { line, ...o }).start;

// ---------------------------------------------------------------- objects (painter's order by ground y)
const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const A = {};
const put = (key, o, r, dy = 0) => { A[key] = r.anchors; add(o, r.svg, dy); return r; };

// 中区 · 取整台: two cutter instances on the same origin (rcA: long bar, chip 1 cell; rc: 1.5 = 1 + 0.5)
put("rcA", CUTTER, roundCutter(CUTTER, { id: "rcA", dir: "down", stock: 6, chip: 1 }));
put("rc", CUTTER, roundCutter(CUTTER, { id: "rc", dir: "down", stock: 1, chip: 0.5 }), 0.1);
put("usr", CUT_USER, O.person(CUT_USER, { id: "usr", role: "signer" }));
const UCERT = { u: CUT_USER.u + 20, v: CUT_USER.v + 75 };
put("ucert", UCERT, shareCert(UCERT, { id: "ucert", stand: true, scale: 1.5 }));
add(CUT_CTR, `<g id="ctrp">${box(CUT_CTR, -80, 80, -32, 32, 0, CUT_CTR_Z, M.steel, 1.6)}</g>`);
put("ctr", CUT_CTR, rollCounter(CUT_CTR, { id: "ctr", digits: 4, value: 0, z: CUT_CTR_Z }), 1);
HOLDERS.forEach((H, i) => {
  put("h" + i, H, O.person(H, { id: "h" + i, role: "signer", scale: 1.0 }));
  const C = { u: H.u - 10, v: H.v + 52 };
  put("hc" + i, C, shareCert(C, { id: "hc" + i, stand: true, scale: 1.3 }));
});
// 金库
put("vault", VAULT, O.safe(VAULT, { id: "vault", plate: "ERC-4626" }));
const SD = besideSafe(VAULT);
put("sd", SD, shareDispenser(SD, { id: "sd" }));
// 池子
put("so", SORTER, sorter(SORTER, { id: "so", letters: 0, blockLabel: "#N" }));
put("pool", POOL, contractMachine(POOL, { id: "pool", name: "POOL", code: ["60 80", "52 34"] }));
put("rcS", MINI_CUTTER, roundCutter(MINI_CUTTER, { id: "rcS", dir: "down", scale: 0.85 }));
put("atk", SORTER_ATK, O.person(SORTER_ATK, { id: "atk", role: "attacker" }));
// 左区 · 溢出车间
put("cab", SLOT_CAB, slotCabinet(SLOT_CAB, { id: "cab", n: 4 }));
add(OVF_CTR, box(OVF_CTR, -170, 170, -36, 36, 0, OVF_CTR_Z, M.steel, 1.6));
put("ovf", OVF_CTR, rollCounter(OVF_CTR, { id: "ovf", digits: 10, value: 0, z: OVF_CTR_Z }), 1);

// letters (small swaps) riding the sorter belt — drawn over the sorter
const NL = 7, L_START = { u: SORTER.u - 205, v: SORTER.v };
let letSvg = "";
for (let i = 0; i < NL; i++) letSvg += `<g id="lt${i}w" opacity="0">${letter(L_START, { id: "lt" + i, z: BELT_Z, lift: 2, w: 46, h: 30 }).svg}</g>`;
items.push({ y: at(SORTER)[1] + 0.5, svg: letSvg });
// coins (dot-matrix units) leaving the pool machine
const NC = 8;
const coinO = { u: POOL.u + 50, v: POOL.v + 134 };
let coinSvg = "";
for (let i = 0; i < NC; i++) {
  coinSvg += `<g id="cn${i}" opacity="0">${box(coinO, -11, 11, -11, 11, 14, 22, M.gold, 1.2)}</g>`;
}
items.push({ y: at(POOL)[1] + 400, svg: coinSvg });
items.sort((a, b) => a.y - b.y);

// EVM frame (ground rectangle, under everything)
const [eu0, eu1, ev0, ev1] = EVM_FRAME, O0 = { u: 0, v: 0 };
const evm = `<g id="evm" opacity="0">${flat(O0, [[eu0, ev0], [eu1, ev0], [eu1, ev1], [eu0, ev1]], 0, "rgba(42,163,201,0.07)", "#2aa3c9", 10, 'stroke-dasharray="40 26"')}</g>`;
// L9 red dashed link: caller tray → other holders
const lk = dashCurve("lk", A.rc.trayRTop, A.hc1.center, { c1: [A.rc.trayRTop[0] + 80, A.rc.trayRTop[1] - 160], c2: [A.hc1.center[0] - 60, A.hc1.center[1] - 200], sw: 5 });

const world = worldSvg("wsvg", gridSvg({ u0: -2600, u1: 4200, v0: -2200, v1: 3200 }) + evm + items.map((x) => x.svg).join("\n") + lk.svg, [-3200, -2200, 7600, 4600]);

// ---------------------------------------------------------------- labels (world, counter-scaled)
const up = (p, dy, dx = 0) => [p[0] + dx, p[1] - dy];
const X_ = `<svg width="26" height="26" viewBox="0 0 26 26"><path d="M6 6L20 20M20 6L6 20" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/></svg>`;
let labels = "";
labels += wlab("lb-pool", up(A.pool.top, 0), "Balancer V2 · 稳定池", "hide");
labels += wlab("lb-rc", up(A.rcA.top, 0, 30), "取整", "lab-cs hide");
labels += wlab("lb-unit", up(A.rcA.trayRTop, 0, 70), "余数 · 1 个最小单位", "lab-r hide", "l");
labels += wlab("lb-atk", [A.atk.head[0] - 40, A.atk.head[1]], "攻击者", "lab-rs lab-sm hide", "r");
labels += wlab("lb-batch", up(A.so.blockTop, 50), "一笔批量交换", "lab-ink hide");
labels += wlab("lb-small", at(SORTER, 60, 0, 190), "大量小额交换", "lab-sm hide");
labels += wlab("lb-rcS", up(A.rcS.trayRTop, 16, 40), "误差 → 调用者", "lab-rs hide", "l");
labels += wlab("lb-due", up(A.rc.stock, 50), "应收 1.5", "hide");
labels += wlab("lb-got", up(A.rc.stock, 50), "只收 1", "lab-cs hide");
labels += wlab("lb-left", up(A.rc.trayRTop, 0, 60), "0.5 留给调用者", "lab-r hide", "l");
labels += wlab("lb-dir", up(A.rc.lever, 150, 10), `${X_}向下取整 · 方向错`, "lab-rs hide", "r");
labels += wlab("lb-ucert", up(A.ucert.top, 0), "得 1 份额", "lab-sm hide");
labels += wlab("lb-ctr", up(A.ctr.top, 0), "重复 1000 次", "hide");
labels += wlab("lb-hold", up(A.h1.top, 10, 60), "其他持有人", "lab-ink hide");
labels += wlab("lb-from", up(A.h1.top, 10, 60), "差额来自其他持有人", "lab-rs hide");
labels += wlab("lb-evm", at(O0, eu1, 0, 0), "EVM · 只有整数", "lab-cs hide", "t");
labels += wlab("lb-qL", up(A.rc.trayLTop, 30, -20), "协议？", "lab-cs hide");
labels += wlab("lb-qR", up(A.rc.trayRTop, 30, 30), "调用者？", "lab-rs hide");
labels += wlab("lb-t1", up(A.ovf.top, 30), "数学缺陷", "lab-cs hide");
labels += wlab("lb-t2", [A.rc.lever[0] - 40, A.rc.lever[1]], "舍入方向", "lab-cs hide", "r");
labels += wlab("lb-t3", up(A.vault.top, 10), "金库通胀", "lab-cs hide");

// ---------------------------------------------------------------- cameras (fit world boxes into screen rects)
const bx = (o, u0, u1, v0, v1, z0, z1) => { const r = []; for (const a of [u0, u1]) for (const b of [v0, v1]) for (const c of [z0, z1]) r.push(at(o, a, b, c)); return r; };
const B = {
  rc: bx(CUTTER, -215, 215, -120, 180, 0, 330),
  trays: bx(CUTTER, -180, 140, 60, 180, 0, 200),
  usr: bx(CUT_USER, -40, 40, -40, 120, 0, 300),
  ctr: bx(CUT_CTR, -90, 90, -36, 36, 0, CUT_CTR_Z + 120),
  hold: HOLDERS.flatMap((H) => bx(H, -40, 40, -40, 90, 0, 260)),
  vault: [...bx(VAULT, -150, 150, -125, 125, 0, 340), ...bx(SD, -60, 60, -45, 45, 0, 200)],
  so: bx(SORTER, -330, 290, -110, 60, 0, 330),
  pool: bx(POOL, -115, 115, -100, 180, 0, 260),
  rcS: bx(MINI_CUTTER, -180, 180, -100, 160, 0, 280),
  atk: bx(SORTER_ATK, -40, 40, -40, 40, 0, 300),
  left: [...bx(SLOT_CAB, -200, 200, -60, 60, 0, 430), ...bx(OVF_CTR, -170, 170, -36, 36, 0, 160)],
};
const fit = (pts, [x0, y0, x1, y1], kmax = 2) => {
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  const bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys);
  const k = Math.min(kmax, (x1 - x0) / bw, (y1 - y0) / bh);
  return camAt([(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};
const CAMS = {
  open0: fit([...B.so, ...B.pool], [260, 200, 1660, 860]),
  open1: fit([...B.so, ...B.pool], [300, 220, 1620, 860]),
  money: fit([...B.pool, ...B.so], [60, 260, 1000, 860]),
  cut: fit(B.rc, [520, 200, 1400, 860]),
  chip: fit([...B.rc, ...B.trays], [380, 150, 1400, 870], 1.6),
  batch: fit([...B.so, ...B.pool, ...B.atk], [120, 190, 1800, 860]),
  mini: fit([...bx(SORTER, 100, 290, -60, 60, 0, 200), ...B.rcS, ...B.atk], [150, 240, 1640, 870]),
  guess: fit([...B.rc, ...B.usr, ...B.ctr], [640, 190, 1840, 870]),
  hold: fit([...B.rc, ...B.usr, ...B.hold, ...B.ctr], [620, 170, 1860, 870]),
  wide: fit([...B.left, ...B.rc, ...B.vault, ...B.so, ...B.pool, ...B.rcS], [60, 140, 1860, 860]),
  wide2: fit([...B.left, ...B.rc, ...B.vault, ...B.so, ...B.pool, ...B.rcS], [140, 170, 1780, 840]),
  trays: fit([...B.rc, ...B.ctr], [420, 220, 1500, 860]),
  three: fit([...B.left, ...B.rc, ...B.vault], [80, 200, 1840, 860]),
};

// ---------------------------------------------------------------- dot cards
const half = `<span class="dw"><span class="dt dt-half"></span></span>`;
const dots500 = Array.from({ length: 50 }, (_, i) => `<span class="dw dw-s"><span class="dt dt-r" id="d5-${i}"></span></span>`).join("");

// ---------------------------------------------------------------- times
const TM = {
  y2025: w("2025", 0), bal: w("Balancer", 0), pool: w("稳定池", 0), took: w("取走", 0),
  rev: w("官方复盘", 1), amt: w("9480", 1),
  root: w("根因", 2), round2: w("取整错误", 2),
  small: w("误差很小", 3),
  atk: w("攻击者", 4), many: w("大量小额交换", 4), batch: w("批量交换", 4),
  each: w("每一步", 5), acc: w("累积", 5),
  guess: w("先猜", 6), share: w("份额", 6), vault6: w("金库", 6), v15: w("1.5", 6),
  mint: w("铸造", 7), due: w("应收", 7), down: w("向下取整", 7), only1: w("只收", 7),
  rep: w("重复", 8), n1000: w("1000", 8), more: w("多拿", 8),
  n500: w("500", 9), holders: w("其他持有人", 9),
  evm: w("EVM", 10), div: w("除法", 10), lose: w("丢掉余数", 10),
  who: w("归谁", 11), decide: w("决定了", 11), dig: w("慢慢抠出钱", 11),
  t1: w("数学缺陷", 12), t2: w("舍入方向", 12), t3: w("金库通胀", 12),
};

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 60px 40px 54px; }
    #ttl-card .t-main { font-size: 92px; }
    #when { position: absolute; left: 48px; top: 34px; }
    .card { position: absolute; background: #ffffff; border-radius: 22px; padding: 26px 34px 28px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    .tag { display: inline-block; font-size: 28px; font-weight: 700; color: #6d685e; background: #f1ede5; border-radius: 8px; padding: 2px 12px 4px; white-space: nowrap; }
    .tags { margin-top: 14px; display: flex; gap: 10px; flex-wrap: nowrap; }
    #amt { left: 1002px; top: 150px; width: 870px; padding-right: 30px; }
    #amt .a-cap { font-size: 32px; font-weight: 700; color: #6d685e; white-space: nowrap; }
    #amt .a-big { margin-top: 4px; font-size: 92px; font-weight: 900; line-height: 1.08; white-space: nowrap; color: #e0453a; font-variant-numeric: tabular-nums; }
    #amt .a-sep { margin: 22px 0 16px; border-top: 3px dashed #e2ddd3; }
    #amt .a-alt { font-size: 52px; font-weight: 900; white-space: nowrap; color: #1c1c1c; }
    #amt .a-alt .tag { margin-left: 16px; vertical-align: 10px; }
    #q15 { left: 64px; top: 290px; width: 560px; }
    .tcard { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
      padding: 14px 26px 18px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
    .tcard .t1 { font-size: 32px; font-weight: 900; white-space: nowrap; }
    .tcard .t2 { margin-top: 6px; font-size: 29px; font-weight: 700; color: #3d3a35; white-space: nowrap; }

    #q500 { left: 64px; top: 130px; width: 560px; }
    .q-big { font-size: 56px; font-weight: 900; white-space: nowrap; line-height: 1.15; }
    .q-big b { color: #e0453a; }
    .q-row { margin-top: 22px; display: flex; align-items: center; gap: 18px; }
    .dw { display: inline-block; width: 64px; height: 64px; border-radius: 50%; border: 3px dashed #d3ccbf; position: relative; }
    .dt { position: absolute; left: -3px; top: -3px; width: 64px; height: 64px; border-radius: 50%; background: #e9c25a; border: 3px solid #b98f1f; }
    .dt-half { clip-path: inset(0 50% 0 0); }
    .dw-s { width: 34px; height: 34px; }
    .dw-s .dt { width: 34px; height: 34px; }
    .dt-r { background: #f0a39b; border-color: #e0453a; opacity: 0; }
    .q-dots { margin-top: 18px; display: grid; grid-template-columns: repeat(10, 34px); gap: 10px 12px; }
    .q-note { margin-top: 16px; font-size: 30px; font-weight: 700; color: #6d685e; white-space: nowrap; display: flex; align-items: center; gap: 12px; }
    .q-note .tag { margin-left: auto; }
    .q-eq { font-family: "JetBrains Mono", "Noto Sans SC", monospace; font-size: 34px; font-weight: 800; margin-top: 14px; white-space: nowrap; }
    #qx-pin { }
    .qx { font-size: 46px; font-weight: 900; margin-left: 6px; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div class="lab lab-g hide" id="when">2025 年 11 月 · Balancer V2 · 多链</div>
      <div class="card hide" id="amt">
        <div class="a-cap">用户资金被盗</div>
        <div class="a-big">约 9480 万美元</div>
        <div class="tags"><span class="tag">Balancer 官方复盘</span><span class="tag">事发时估值</span><span class="tag">只含 Balancer 部署的池子</span></div>
        <div class="a-sep"></div>
        <div class="a-alt hide" id="amt2">约 1.28 亿美元<span class="tag">Check Point 早期分析</span></div>
      </div>
      <div class="card hide" id="q15">
        <div class="q-big">1 份额 = <b>1.5</b> 单位</div>
        <div class="q-row"><span class="dw"><span class="dt"></span></span>${half}</div>
        <div class="q-note">1 点 = 1 个最小单位<span class="tag">示例</span></div>
      </div>
      <div class="card hide" id="q500">
        <div class="q-big">多拿 ≈ <b>500</b> 单位</div>
        <div class="q-eq">1000 次 × 0.5</div>
        <div class="q-dots">${dots500}</div>
        <div class="q-note">1 点 = 10 个单位<span class="tag">示例</span></div>
      </div>
      <div class="tcard hide" id="tc1"><div class="t1">份额</div><div class="t2">代表金库资产按比例所有权的代币</div></div>
      <div class="tcard hide" id="tc2"><div class="t1">EVM</div><div class="t2">以太坊虚拟机 · 合约在这里执行</div></div>
      ${pills(1, { sections: script.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">① 一次只错一点点</div><div class="t-sub">算术与精度</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${rt01()}
${rt02()}
${rt03()}
${rt06()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pulse = (sel, t, s) => tl.fromTo(sel, { scale: 1 }, { scale: s || 1.15, duration: 0.16, yoyo: true, repeat: 1, ease: "power1.inOut", immediateRender: false }, t);
      const term = (id, t0, t1) => { KIT.pop(tl, "#" + id, t0, 0.3); out("#" + id, t1, 0.25); };
      const hideGrow = (ids) => ids.forEach((id) => tl.set("#" + id, { scaleY: 0, svgOrigin: $(id).getAttribute("data-ox") + " " + $(id).getAttribute("data-oy") }, 0));

      KIT.camSet(tl, CAMS.open0);
      hideGrow(["pool", "rcA", "atk", "rcS", "usr", "ucert", "ctr", "h0", "h1", "h2", "hc0", "hc1", "hc2"]);
      tl.set("#rc, #ctrp", { opacity: 0 }, 0);

      // ===== 0–1.6 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.25);
      KIT.cam(tl, 0.6, CAMS.open1, 1.6, "sine.inOut");
      // ===== L0 Balancer V2 stable pool, funds taken
      KIT.pop(tl, "#when", ${f(TM.y2025)}, 0.3);
      KIT.grow(tl, "pool", ${f(TM.bal - 0.2)}, 0.5);
      KITX03.spin(tl, "pool", ${f(TM.bal + 0.2)}, 12, 3);
      KIT.pop(tl, "#lb-pool", ${f(TM.pool)});
      {
        const dx = ${JSON.stringify(Array.from({ length: NC }, (_, i) => { const a = at(coinO), b = at(POOL, -40 + (i % 4) * 40, 300 + (i % 3) * 30, 0); return [f(b[0] - a[0]), f(b[1] - a[1])]; }))};
        let k = 0;
        for (let ts = ${f(TM.took - 0.2)}; ts < ${f(L(2).start - 1.4)}; ts += 0.34, k++) {
          const i = k % ${NC}, el = "#cn" + i;
          tl.fromTo(el, { x: 0, y: -18, opacity: 0 }, { x: dx[i][0], y: dx[i][1], opacity: 1, duration: 1.1, ease: "power1.in", immediateRender: false }, ts);
          tl.to(el, { opacity: 0, duration: 0.25, ease: "none" }, ts + 1.1);
        }
      }
      // ===== L1 ≈ 94.8M USD (official) + 128M (early third party)
      KIT.cam(tl, ${f(L(1).start - 0.2)}, CAMS.money, 1.0);
      KIT.pop(tl, "#amt", ${f(TM.rev + 0.5)}, 0.3);
      KIT.pop(tl, "#amt2", ${f(TM.amt + 0.4)}, 0.3);
      // ===== L2 root cause: rounding → cutter debuts
      out("#when, #lb-pool", ${f(L(2).start - 0.25)}, 0.25);
      out("#amt", ${f(L(2).start + 0.7)}, 0.25);
      KIT.cam(tl, ${f(L(2).start - 0.15)}, CAMS.cut, 1.3, "power2.inOut");
      KIT.grow(tl, "rcA", ${f(TM.round2 - 0.45)}, 0.5);
      KIT.pop(tl, "#lb-rc", ${f(TM.round2)});
      // ===== L3 single error is tiny: one cut, a 1-unit chip into the caller tray
      KIT.cam(tl, ${f(L(3).start - 0.3)}, CAMS.chip, 0.9);
      KITX06.feed(tl, "rcA", ${f(L(3).start - 0.3)}, 0.5);
      KITX06.cut(tl, "rcA", ${f(L(3).start + 0.25)}, "R");
      KIT.pop(tl, "#lb-unit", ${f(L(3).start + 0.95)});
      // ===== L4 many small swaps chained into one batch swap
      out("#lb-unit, #lb-rc", ${f(L(4).start - 0.15)}, 0.2);
      KIT.cam(tl, ${f(L(4).start - 0.1)}, CAMS.batch, 1.2);
      KIT.grow(tl, "atk", ${f(TM.atk - 0.1)}, 0.45);
      KIT.pop(tl, "#lb-atk", ${f(TM.atk + 0.3)});
      KIT.pop(tl, "#lb-small", ${f(TM.many)});
      KIT.pop(tl, "#lb-batch", ${f(TM.batch)});
      {
        const P0 = ${JSON.stringify(at(L_START, 0, 0, BELT_Z))}, P1 = ${JSON.stringify(at(SORTER, 185, 0, BELT_Z))}, P2 = ${JSON.stringify(at(SORTER, 232, 0, BELT_Z + 40))};
        let k = 0; const t0 = ${f(TM.many - 0.2)}, t1 = ${f(L(5).end - 0.9)};
        for (let ts = t0; ts < t1; ts += 0.3, k++) {
          const i = k % ${NL}, id = "lt" + i;
          if (k >= ${NL}) KITX01.walk(tl, id, ts - 0.02, 0.01, [P0]);
          tl.fromTo("#" + id + "w", { opacity: 0 }, { opacity: 1, duration: 0.12, immediateRender: false }, ts);
          KITX01.walk(tl, id, ts, 1.6, [P1, P2], "none");
          tl.to("#" + id + "w", { opacity: 0, duration: 0.15 }, ts + 1.48);
        }
        KITX01.dash(tl, ${JSON.stringify(A.so.beltIds)}, t0, t1 - t0 + 1.6, (t1 - t0 + 1.6) * 250);
      }
      // ===== L5 every step's error accumulates toward the caller (key frame)
      KIT.cam(tl, ${f(L(5).start - 0.35)}, CAMS.mini, 1.0);
      out("#lb-small", ${f(L(5).start - 0.3)}, 0.2);
      KIT.grow(tl, "rcS", ${f(L(5).start - 0.2)}, 0.45);
      for (let i = 0; i < 3; i++) {
        const tc = ${f(L(5).start + 0.35)} + i * 0.95;
        if (i) KITX06.chipReset(tl, "rcS", tc - 0.06);
        KITX06.cut(tl, "rcS", tc, "R");
        KITX06.pile(tl, "rcS", "R", tc + 0.92, (i + 1) * 3);
      }
      KIT.pop(tl, "#lb-rcS", ${f(TM.acc - 0.4)});
      fadeIn("#so-lid", ${f(L(5).end - 0.45)}, 0.3);
      // ===== L6 a guess: 1 share = 1.5 units (example)
      out("#lb-rcS, #lb-batch, #lb-atk", ${f(L(6).start - 0.2)}, 0.2);
      KIT.cam(tl, ${f(L(6).start - 0.1)}, CAMS.guess, 1.4, "power2.inOut");
      tl.to("#rcA", { opacity: 0, duration: 0.3 }, ${f(L(6).start + 0.6)});
      tl.fromTo("#rc", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, ${f(L(6).start + 0.6)});
      KIT.pop(tl, "#q15", ${f(TM.v15 - 0.6)}, 0.3);
      KIT.grow(tl, "usr", ${f(TM.vault6 - 0.2)}, 0.45);
      term("tc1", ${f(TM.share)}, ${f(TM.share + 3.6)});
      // ===== L7 mint 1 share: 1.5 rounded down, pays only 1
      KITX06.feed(tl, "rc", ${f(TM.mint)}, 0.6);
      KIT.pop(tl, "#lb-due", ${f(TM.due)});
      KITX06.lever(tl, "rc", ${f(TM.down - 0.35)}, "down");
      KIT.pop(tl, "#lb-dir", ${f(TM.down + 0.1)}, 0.3);
      KITX06.cut(tl, "rc", ${f(TM.down + 0.3)}, "R");
      KIT.swap(tl, "#lb-due", "#lb-got", ${f(TM.only1 - 0.1)}, 0.25);
      KIT.pop(tl, "#lb-left", ${f(TM.only1 + 0.2)});
      KIT.grow(tl, "ucert", ${f(TM.only1 + 0.6)}, 0.4);
      KIT.pop(tl, "#lb-ucert", ${f(TM.only1 + 0.9)});
      // ===== L8 repeat 1000 times: counter rolls, cuts speed up
      out("#lb-got, #lb-left, #lb-dir, #lb-ucert", ${f(L(8).start - 0.15)}, 0.2);
      fadeIn("#ctrp", ${f(L(8).start - 0.1)}, 0.2);
      KIT.grow(tl, "ctr", ${f(L(8).start - 0.1)}, 0.4);
      KIT.pop(tl, "#lb-ctr", ${f(TM.n1000 - 0.1)});
      KIT.count(tl, "ctr", ${f(TM.rep + 0.2)}, ${f(L(8).end - TM.rep - 0.5)}, 0, 1000, "power2.in");
      {
        const per = [0.62, 0.5, 0.42, 0.36, 0.32, 0.3, 0.3, 0.3];
        let t = ${f(TM.rep + 0.25)};
        per.forEach((p, i) => {
          KITX06.chipReset(tl, "rc", t - 0.05);
          KITX06.blade(tl, "rc", t, true, 0.09);
          KITX06.chip(tl, "rc", t + 0.1, "R", p * 0.55);
          KITX06.blade(tl, "rc", t + 0.12, false, p * 0.5);
          t += p;
        });
      }
      // ===== L9 ≈ 500 units, taken from the other holders
      out("#q15", ${f(L(9).start - 0.2)}, 0.2);
      KIT.cam(tl, ${f(L(9).start - 0.2)}, CAMS.hold, 1.0);
      KIT.pop(tl, "#q500", ${f(TM.n500 - 0.35)}, 0.3);
      for (let i = 0; i < 50; i++) tl.fromTo("#d5-" + i, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.14, ease: "back.out(1.6)", immediateRender: false }, ${f(TM.n500 - 0.1)} + i * 0.02);
      ["h0", "h1", "h2"].forEach((id, i) => KIT.grow(tl, id, ${f(TM.holders - 1.4)} + i * 0.12, 0.45));
      ["hc0", "hc1", "hc2"].forEach((id, i) => KIT.grow(tl, id, ${f(TM.holders - 1.2)} + i * 0.12, 0.35));
      KIT.pop(tl, "#lb-hold", ${f(TM.holders - 0.6)});
      KIT.draw(tl, "lk", ${f(TM.holders - 0.2)}, 0.7);
      ["hc0", "hc1", "hc2"].forEach((id, i) => tl.to("#" + id + "-solid", { opacity: 0.4, duration: 0.5 }, ${f(TM.holders + 0.4)} + i * 0.1));
      KIT.swap(tl, "#lb-hold", "#lb-from", ${f(TM.holders + 0.2)}, 0.25);
      // ===== L10 EVM only has integers — the whole workshop under one frame
      out("#q500, #lb-hold, #lb-from, #lb-ctr, #lk", ${f(L(10).start - 0.2)}, 0.25);
      KIT.cam(tl, ${f(L(10).start - 0.15)}, CAMS.wide, 1.4);
      fadeIn("#evm", ${f(TM.evm - 0.2)}, 0.5);
      KIT.cam(tl, ${f(L(10).start + 1.3)}, CAMS.wide2, ${f(L(11).start - L(10).start - 1.8)}, "sine.inOut");
      KIT.pop(tl, "#lb-evm", ${f(TM.evm + 0.1)}, 0.3);
      term("tc2", ${f(TM.evm)}, ${f(TM.evm + 3.6)});
      // ===== L11 whose remainder? two trays
      KIT.cam(tl, ${f(L(11).start - 0.4)}, CAMS.trays, 1.3);
      out("#lb-evm", ${f(L(11).start - 0.3)}, 0.2);
      KITX06.chipReset(tl, "rc", ${f(TM.who - 0.6)});
      KITX06.blade(tl, "rc", ${f(TM.who - 0.4)}, true, 0.2);
      KIT.pop(tl, "#lb-qL", ${f(TM.who + 0.1)}, 0.3);
      KIT.pop(tl, "#lb-qR", ${f(TM.who + 0.35)}, 0.3);
      pulse("#lb-qL", ${f(TM.decide + 0.3)}, 1.12);
      pulse("#lb-qR", ${f(TM.dig)}, 1.12);
      // ===== L12 three things: math bugs · rounding direction · vault inflation
      out("#lb-qL, #lb-qR", ${f(L(12).start - 0.2)}, 0.2);
      KIT.cam(tl, ${f(L(12).start - 0.2)}, CAMS.three, 1.3);
      KIT.pop(tl, "#lb-t1", ${f(TM.t1)}, 0.3);
      KIT.pop(tl, "#lb-t2", ${f(TM.t2)}, 0.3);
      KIT.pop(tl, "#lb-t3", ${f(TM.t3)}, 0.3);
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes", CAMS, TM);
