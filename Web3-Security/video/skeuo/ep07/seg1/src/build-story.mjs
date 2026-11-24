// Generates compositions/story.html for ep07/seg1「① 没收到的钱」(one isometric world「收发站」, one camera).
// Run: node src/build-story.mjs
import fs from "node:fs";
import { at, f, cyl, flat, camAt, gridSvg, worldSvg, wlab, kitCss, runtimeJs, M } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { vending, miniVend, pipe, bridge, runtimeExtJs as rt01 } from "../../../ep01/kit-ext/objects-ext.mjs";
import { contractMachine, gasGauge, runtimeExtJs as rt03 } from "../../../ep03/kit-ext/objects-ext.mjs";
import { emptyLot, returnTag, dispatchDesk, parcel, oddCoin, runtimeExtJs as rt07 } from "../../kit-ext/objects-ext.mjs";
import { VEND, DESK, TAG_DOCK, DOCK, GAUGE, PIPES, FATE, BRIDGE, BR_ETH, ETH_VAULT, CHAIN_ETH, BR_BNB, CHAIN_BNB, QX_PILE, ZERO_LOT, BR_PIPE, TAG_BR, EVM_FRAME } from "./layout.mjs";

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
const rel = (o, d) => ({ u: o.u + d[0], v: o.v + d[1] });

// 远景 · 跨链桥
put("br", BRIDGE, bridge(BRIDGE, { id: "br" }));
put("ceth", CHAIN_ETH, O.chain(CHAIN_ETH, { id: "ceth", n: 3 }));
put("cbnb", CHAIN_BNB, O.chain(CHAIN_BNB, { id: "cbnb", n: 3 }));
put("breth", BR_ETH, contractMachine(BR_ETH, { id: "breth", name: "ETH" }));
put("brbnb", BR_BNB, contractMachine(BR_BNB, { id: "brbnb", name: "BNB" }));
put("ethv", ETH_VAULT, O.hotWallet(ETH_VAULT, { id: "ethv", gold: false, plate: "ETH" }));
put("zlot", ZERO_LOT, emptyLot(ZERO_LOT, { id: "zlot", scale: 0.8, ghost: 0.5 }));
// bridge call pipe: drawn after the lot (it lies over the lot's +u edge), before the machine
const brp = pipe(BR_ETH, { id: "brp", pts: BR_PIPE });
items.push({ y: at(ZERO_LOT)[1] + 1, svg: brp.svg });
A.brp = brp.anchors;
put("tgb", TAG_BR, returnTag(TAG_BR, { id: "tgb", face: "empty", scale: 1.8 }));
// qXETH tokens (teal discs) piling up in front of the BNB-side machine
const QX = [];
[[0, 0, 0], [34, 6, 0], [-30, 10, 0], [4, 36, 0], [40, 42, 0], [-34, 46, 0], [70, 18, 0], [-64, 26, 0], [2, 4, 7], [36, 12, 7], [-28, 16, 7], [6, 40, 7], [20, 22, 14], [-12, 26, 14], [72, 50, 0], [-60, 64, 0]].forEach(([du, dv, z], i) => {
  const o = rel(QX_PILE, [du, dv]);
  QX.push({ id: "qx" + i, P: at(o, 0, 0, z + 3) });
  items.push({ y: at(QX_PILE)[1] + 2 + i * 0.01, svg: `<g id="qx${i}" opacity="0">${cyl(o, 0, 0, 17, z, z + 6, M.blue, { sw: 1.2 })}<g transform="translate(${f(at(o, 0, 0, z + 6)[0])},${f(at(o, 0, 0, z + 6)[1])}) scale(1,0.55)"><circle r="10" fill="none" stroke="#a6e0f2" stroke-width="2"/></g></g>` });
});

// 中心 · 我们的合约 + 登记台
put("vm", VEND, vending(VEND, { id: "vm", sign: "OUR CONTRACT" }));
put("desk", DESK, dispatchDesk(DESK, { id: "desk", entries: [{ text: "+ 转账", kind: "ghost" }] }));
put("tg", TAG_DOCK, returnTag(TAG_DOCK, { id: "tg", face: "empty", scale: 1.6 }));
// 左区 · 调用码头
put("tok", DOCK.token, miniVend(DOCK.token, { id: "tok", kind: "token" }));
put("lot", DOCK.lot, emptyLot(DOCK.lot, { id: "lot", ghost: 0.35 }));
put("bomb", DOCK.bomb, contractMachine(DOCK.bomb, { id: "bomb", name: "C" }));
put("gasv", DOCK.gas, miniVend(DOCK.gas, { id: "gasv", kind: "plain" }));
put("gauge", GAUGE, gasGauge(GAUGE, { id: "gauge", value: 0.7 }));
const PO = {};
for (const k of ["token", "lot", "bomb", "gas"]) {
  const r = pipe(VEND, { id: "p" + k, pts: PIPES[k] });
  PO[k] = r.anchors;
  // pipes lie between the vending (drawn first: u large) and their target — draw them right after the vending
  items.push({ y: k === "lot" ? at(DOCK.lot)[1] + 1 : at(VEND)[1] + 0.5, svg: r.svg });   // the lot pipe dips onto the lot: draw it over the lot
}
// lost parcel on the lot (L11) and the four "fates" (L13)
const PARCEL = rel(DOCK.lot, [50, 10]);
put("pc", PARCEL, parcel(PARCEL, { id: "pc", state: "lost", scale: 1.5 }), 200);
const LIAR = FATE.liar, FAIL = FATE.fail, HG = FATE.stall;
put("liar", LIAR, oddCoin(LIAR, { id: "liar", kind: "liar", scale: 1.0 }));
put("tgf", FAIL, returnTag(FAIL, { id: "tgf", face: "false", stamp: "x", scale: 1.5 }));
put("hg", HG, O.hourglass(HG, { id: "hg" }));
items.sort((a, b) => a.y - b.y);

// EVM frame (ground rectangle, under the dock)
const [eu0, eu1, ev0, ev1] = EVM_FRAME, O0 = { u: 0, v: 0 };
const evm = `<g id="evm" opacity="0">${flat(O0, [[eu0, ev0], [eu1, ev0], [eu1, ev1], [eu0, ev1]], 0, "rgba(42,163,201,0.08)", "#2aa3c9", 8, 'stroke-dasharray="34 22"')}</g>`;
const world = worldSvg("wsvg", gridSvg({ u0: -2000, u1: 3400, v0: -3200, v1: 2000 }) + evm + items.map((x) => x.svg).join("\n"), [-2600, -2800, 5600, 4000]);

// ---------------------------------------------------------------- labels (world, counter-scaled)
const up = (p, dy, dx = 0) => [p[0] + dx, p[1] - dy];
let labels = "";
labels += wlab("lb-ceth", up(A.ceth.top, 0), "以太坊", "hide");
labels += wlab("lb-cbnb", up(A.cbnb.top, 90), "BNB Chain", "hide");
labels += wlab("lb-breth", up(A.breth.top, 0), "桥 · 以太坊侧", "hide");
labels += wlab("lb-brbnb", up(A.brbnb.top, 0), "桥 · BNB Chain 侧", "hide");
labels += wlab("lb-noeth", up(A.ethv.top, 0, 0), "ETH 没到", "lab-rs hide");
labels += wlab("lb-qx", up(at(QX_PILE, 0, 60, 0), -30, 0), "qXETH · 越铸越多", "lab-cs hide", "t");
labels += wlab("lb-tgb", up(A.tgb.top, 4), "返回 · 空", "lab-g hide");
labels += wlab("lb-tgb2", [A.tgb.face[0] + 70, A.tgb.face[1] + 10], "被当成成功", "lab-r hide", "l");
labels += wlab("lb-vm", up(A.vm.top, 0), "我们的合约", "lab-ink hide");
labels += wlab("lb-call", up(at(VEND, -460, -210, 70), 26), "低级 call", "lab-cs hide");
labels += wlab("lb-lot", up(A.lot.top, 0, -20), "没有代码的地址", "hide");
labels += wlab("lb-qt", [A.tg.face[0] - 80, A.tg.face[1] - 40], "true ?", "lab-q hide", "r");
labels += wlab("lb-qf", [A.tg.face[0] - 80, A.tg.face[1] + 34], "false ?", "lab-q hide", "r");
labels += wlab("lb-true", [A.tg.face[0] - 80, A.tg.face[1] - 40], "true", "lab-gs hide", "r");
labels += wlab("lb-data", [A.tg.face[0] + 56, A.tg.face[1] + 6], "返回数据：空", "lab-q hide", "l");
labels += wlab("lb-evm", at(O0, eu0, ev0, 0), "EVM", "lab-cs hide", "b");
labels += wlab("lb-nofail", up(A.lot.top, 0, -20), "目标没有代码 ≠ 失败", "lab-ink hide");
labels += wlab("lb-eq", up(A.desk.top, 20), "true + 空 → 当成转账成功", "lab-r hide");
labels += wlab("lb-book", up(A.desk.top, 20), "账上 · 多了一笔转账", "lab-rs hide");
labels += wlab("lb-ground", up(A.pc.top, 6), "地上 · 什么也没收到", "lab-rs hide");
labels += wlab("lb-f1", up(A.tgf.top, 0), "失败", "lab-rs hide");
labels += wlab("lb-f2", up(A.liar.top, 0), "撒谎", "lab-rs hide");
labels += wlab("lb-f3", up(A.hg.top, 0), "拖延", "lab-rs hide");
labels += wlab("lb-f4", up(A.lot.top, 0, -20), "不存在", "lab-rs hide");

// ---------------------------------------------------------------- cameras (fit world boxes into screen rects)
const bx = (o, u0, u1, v0, v1, z0, z1) => { const r = []; for (const a of [u0, u1]) for (const b of [v0, v1]) for (const c of [z0, z1]) r.push(at(o, a, b, c)); return r; };
const B = {
  bridge: bx(BRIDGE, -260, 260, -120, 120, 0, 200),
  breth: bx(BR_ETH, -120, 120, -110, 110, 0, 290),
  ethv: bx(ETH_VAULT, -100, 100, -85, 85, 0, 300),
  ceth: bx(CHAIN_ETH, -280, 280, -60, 60, 0, 220),
  brbnb: bx(BR_BNB, -120, 120, -110, 110, 0, 290),
  cbnb: bx(CHAIN_BNB, -280, 280, -60, 60, 0, 220),
  pile: bx(QX_PILE, -80, 80, -10, 100, 0, 30),
  zlot: bx(ZERO_LOT, -110, 110, -85, 85, 0, 80),
  tgb: bx(TAG_BR, -60, 60, -20, 20, 0, 160),
  vm: bx(VEND, -100, 100, -75, 75, 0, 360),
  tg: bx(TAG_DOCK, -60, 60, -20, 20, 0, 200),
  lot: bx(DOCK.lot, -130, 130, -100, 100, 0, 170),
  desk: bx(DESK, -100, 100, -50, 50, 0, 200),
  tok: bx(DOCK.token, -60, 60, -50, 50, 0, 260),
  bomb: bx(DOCK.bomb, -120, 120, -110, 110, 0, 290),
  gas: [...bx(DOCK.gas, -60, 60, -50, 50, 0, 220), ...bx(GAUGE, -70, 70, -45, 40, 0, 260), ...bx(FATE.stall, -60, 60, -60, 60, 0, 260)],
};
const fit = (pts, [x0, y0, x1, y1], kmax = 2) => {
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  const bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys);
  const k = Math.min(kmax, (x1 - x0) / bw, (y1 - y0) / bh);
  return camAt([(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};
const BR_ALL = [...B.bridge, ...B.breth, ...B.ethv, ...B.ceth, ...B.brbnb, ...B.cbnb, ...B.pile];
const DOCK_ALL = [...B.vm, ...B.tg, ...B.lot, ...B.desk, ...B.tok, ...B.bomb, ...B.gas];
const CAMS = {
  open0: fit(BR_ALL, [200, 240, 1720, 860]),
  open1: fit(BR_ALL, [120, 250, 1800, 900]),
  eth: fit([...B.breth, ...B.ethv, ...B.ceth], [640, 250, 1560, 870], 1.3),
  bnb: fit([...B.brbnb, ...B.cbnb, ...B.pile], [500, 250, 1500, 870], 1.3),
  br3: fit(BR_ALL, [60, 300, 1200, 880]),
  call: fit([...B.breth, ...B.zlot, ...B.tgb], [620, 320, 1760, 900], 1.35),
  dock: fit([...B.vm, ...B.tg, ...B.lot], [480, 200, 1800, 880], 1.6),
  evm: fit([...bx(O0, eu0, eu1, ev0, ev1, 0, 0), ...B.vm], [620, 200, 1840, 880], 1.6),
  desk: fit([...B.vm, ...B.tg, ...B.lot, ...B.desk], [100, 200, 1820, 880], 1.6),
  wide: fit(DOCK_ALL, [60, 240, 1860, 900]),
};

// ---------------------------------------------------------------- times
const TM = {
  y2022: w("2022", 0), qubit: w("Qubit", 0), xbr: w("跨链桥", 0),
  eth1: w("以太坊", 1), noeth: w("没有收到", 1),
  bnb: w("BNB", 2), mint: w("铸造", 2), qx: w("qXETH", 2),
  pub: w("公开报道", 3), amt: w("8000", 3),
  trust: w("相信", 4), ext: w("外部调用", 4), res: w("结果", 4),
  guess: w("先猜", 5),
  low: w("低级", 6), nocode: w("没有代码", 6),
  qt: w("true", 7), qf: w("false", 7),
  ans: w("答案", 8), t8: w("true", 8), data8: w("返回数据", 8), empty8: w("空的", 8),
  evm: w("EVM", 9), fail9: w("失败", 9),
  succ: w("成功", 10), emptyR: w("空返回", 10), xfer: w("转账成功", 10),
  rec: w("记下", 11), never: w("没有发生", 11),
  ext12: w("外部调用", 12), fate: w("命运", 12),
  f1: w("失败", 13), f2: w("撒谎", 13), f3: w("拖延", 13), f4: w("不存在", 13),
};

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 60px 40px 54px; }
    #ttl-card .t-main { font-size: 92px; }
    .lab.lab-q { background: #fffdf8; border-style: dashed; border-color: #9a958b; color: #6d685e; }
    .card { position: absolute; background: #ffffff; border-radius: 22px; padding: 22px 32px 26px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    .tag { display: inline-block; font-size: 28px; font-weight: 700; color: #6d685e; background: #f1ede5; border-radius: 8px; padding: 2px 12px 4px; white-space: nowrap; }
    #ev { right: 48px; top: 100px; width: 640px; }
    #ev .e-when { font-size: 40px; font-weight: 900; white-space: nowrap; }
    #ev-amt { right: 48px; top: 214px; width: 640px; }
    #ev-amt .e-big { font-size: 88px; font-weight: 900; line-height: 1.08; white-space: nowrap; color: #e0453a; font-variant-numeric: tabular-nums; }
    #ev-amt .e-cap { margin-top: 10px; display: flex; gap: 12px; align-items: center; font-size: 30px; font-weight: 700; color: #6d685e; white-space: nowrap; }
    .tcard { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
      padding: 14px 26px 18px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
    .tcard .t1 { font-size: 32px; font-weight: 900; white-space: nowrap; }
    .tcard .t2 { margin-top: 6px; font-size: 29px; font-weight: 700; color: #3d3a35; white-space: nowrap; }
    .tcard .t1 code, .tcard .t2 code { font-family: "JetBrains Mono", monospace; font-weight: 800; }
    #key { left: 330px; top: 116px; width: 1260px; text-align: center; padding: 22px 30px 26px; }
    #key .k1 { font-size: 56px; font-weight: 900; white-space: nowrap; }
    #key .k1 b { color: #1d93ba; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div class="card hide" id="ev"><div class="e-when">2022 年 1 月 · Qubit 跨链桥</div></div>
      <div class="card hide" id="ev-amt"><div class="e-big">约 8000 万美元</div><div class="e-cap">损失<span class="tag">CoinDesk 报道</span></div></div>
      <div class="tcard hide" id="tc1"><div class="t1">跨链桥</div><div class="t2">在两条链之间转移资产的系统</div></div>
      <div class="tcard hide" id="tc2"><div class="t1">外部调用</div><div class="t2">合约去调用别人的合约或地址</div></div>
      <div class="tcard hide" id="tc3"><div class="t1">低级 <code>call</code></div><div class="t2">直接调用地址 · 失败不自动回滚</div></div>
      <div class="tcard hide" id="tc4"><div class="t1">EVM</div><div class="t2">以太坊虚拟机 · 执行合约字节码</div></div>
      <div class="card hide" id="key"><div class="k1">每一个外部调用 = <b>把命运交给别人</b></div></div>
      ${pills(1, { sections: script.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">① 没收到的钱</div><div class="t-sub">外部调用与代币兼容性</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${rt01()}
${rt03()}
${rt07()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const QX = ${JSON.stringify(QX)};
      const QX_OUT = ${JSON.stringify(A.brbnb.out)};
      const TG_FLY = ${JSON.stringify([f(A.desk.slot[0] - A.tg.face[0]), f(A.desk.slot[1] - A.tg.face[1])])};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.3, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const hideGrow = (ids) => ids.forEach((id) => tl.set("#" + id, { scaleY: 0, svgOrigin: $(id).getAttribute("data-ox") + " " + $(id).getAttribute("data-oy") }, 0));
      const term = (id, t0, t1) => { KIT.pop(tl, "#" + id, t0, 0.3); out("#" + id, t1, 0.25); };

      KIT.camSet(tl, CAMS.open0);
      hideGrow(["vm", "desk", "tok", "bomb", "gasv", "gauge", "liar", "hg"]);
      KITX01.dash(tl, "br-ripple", 0, ${f(L(4).end)}, 220);

      // ===== 0–1.6 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.25);
      KIT.cam(tl, 0.4, CAMS.open1, 1.6, "sine.inOut");
      // ===== L0 Qubit bridge
      KIT.pop(tl, "#ev", ${f(TM.y2022)}, 0.3);
      KIT.pop(tl, "#lb-ceth", ${f(TM.qubit)});
      KIT.pop(tl, "#lb-cbnb", ${f(TM.qubit + 0.15)});
      out("#lb-cbnb", ${f(L(1).start - 0.3)}, 0.2);
      KIT.pop(tl, "#lb-cbnb", ${f(L(2).start + 0.6)});
      term("tc1", ${f(TM.xbr)}, ${f(TM.xbr + 3.6)});
      // ===== L1 Ethereum side: the bridge's ETH vault is empty
      KIT.cam(tl, ${f(L(1).start - 0.25)}, CAMS.eth, 1.0);
      KIT.pop(tl, "#lb-breth", ${f(TM.eth1 + 0.1)});
      KIT.door(tl, "ethv", ${f(TM.noeth - 0.7)}, 105, 0.8);
      KIT.pop(tl, "#lb-noeth", ${f(TM.noeth)});
      // ===== L2 BNB side mints qXETH, more and more
      out("#lb-breth, #lb-noeth", ${f(L(2).start - 0.2)}, 0.2);
      KIT.cam(tl, ${f(L(2).start - 0.15)}, CAMS.bnb, 1.2);
      KIT.pop(tl, "#lb-brbnb", ${f(TM.bnb + 0.2)});
      KITX03.spin(tl, "brbnb", ${f(TM.mint - 0.3)}, ${f(L(2).end - TM.mint + 0.3)}, 4);
      QX.forEach((q, i) => {
        const t = ${f(TM.mint)} + i * Math.max(0.12, 0.34 - i * 0.016);
        tl.fromTo("#" + q.id, { x: QX_OUT[0] - q.P[0], y: QX_OUT[1] - q.P[1] - 14, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.45, ease: "power2.in", immediateRender: false }, t);
      });
      KIT.pop(tl, "#lb-qx", ${f(TM.qx)});
      // ===== L3 ≈ 80M USD (public reports)
      KIT.cam(tl, ${f(L(3).start - 0.3)}, CAMS.br3, 1.1);
      out("#lb-qx", ${f(L(3).start - 0.2)}, 0.2);
      KIT.pop(tl, "#lb-breth", ${f(L(3).start + 0.2)});
      KIT.pop(tl, "#ev-amt", ${f(TM.amt - 0.7)}, 0.3);
      // ===== L4 the bridge trusted an external call: an empty receipt gets a green tick
      out("#ev, #ev-amt", ${f(L(4).start - 0.2)}, 0.25);
      out("#lb-ceth, #lb-cbnb, #lb-brbnb", ${f(L(4).start - 0.2)}, 0.2);
      KIT.cam(tl, ${f(L(4).start - 0.25)}, CAMS.call, 1.0);
      fadeIn("#brp", ${f(TM.trust)}, 0.35);
      tl.set("#brp-flow", { opacity: 1 }, ${f(TM.trust + 0.2)});
      KITX01.dash(tl, "brp-flow", ${f(TM.trust + 0.2)}, 2.0, 120);
      term("tc2", ${f(TM.ext)}, ${f(L(6).start + 0.3)});
      KITX07.tagPop(tl, "tgb", ${f(TM.ext + 0.55)}, 0.4);
      KIT.pop(tl, "#lb-tgb", ${f(TM.ext + 0.8)});
      KITX07.tagStamp(tl, "tgb", ${f(TM.res)}, "ok");
      KIT.pop(tl, "#lb-tgb2", ${f(TM.res + 0.25)});
      // ===== L5 to the dock: our contract
      out("#lb-tgb, #lb-tgb2, #lb-breth", ${f(L(5).start - 0.25)}, 0.2);
      KIT.cam(tl, ${f(L(5).start - 0.35)}, CAMS.dock, 1.4, "power2.inOut");
      KIT.grow(tl, "vm", ${f(TM.guess - 0.1)}, 0.5);
      KIT.pop(tl, "#lb-vm", ${f(TM.guess + 0.4)});
      // ===== L6 low-level call to an address with no code
      out("#tc2", ${f(L(6).start - 0.05)}, 0.15);
      term("tc3", ${f(TM.low)}, ${f(TM.low + 3.6)});
      fadeIn("#plot", ${f(TM.low - 0.1)}, 0.4);
      KIT.pop(tl, "#lb-call", ${f(TM.low + 0.3)});
      KITX07.lotPlate(tl, "lot", ${f(TM.nocode)}, true, 3);
      KITX07.lotGhost(tl, "lot", ${f(TM.nocode)}, 1, 0.6);
      KIT.pop(tl, "#lb-lot", ${f(TM.nocode + 0.2)});
      // ===== L7 true or false? flow in the pipe, two empty slots
      tl.set("#plot-flow", { opacity: 1 }, ${f(L(7).start - 0.3)});
      KITX01.dash(tl, "plot-flow", ${f(L(7).start - 0.3)}, ${f(L(8).start - L(7).start + 0.6)}, 260);
      out("#lb-vm", ${f(L(7).start - 0.2)}, 0.2);
      KIT.pop(tl, "#lb-qt", ${f(TM.qt)});
      KIT.pop(tl, "#lb-qf", ${f(TM.qf)});
      // ===== L8 answer: true, with empty return data
      KITX07.tagFace(tl, "tg", 0, "ok", 0.01);
      KITX07.tagPop(tl, "tg", ${f(TM.t8 - 0.15)}, 0.4);
      KIT.swap(tl, "#lb-qt", "#lb-true", ${f(TM.t8)}, 0.25);
      out("#lb-qf", ${f(TM.t8 + 0.1)}, 0.25);
      KIT.pop(tl, "#lb-data", ${f(TM.data8)});
      // ===== L9 the EVM doesn't fail a call just because the target has no code
      out("#lb-lot", ${f(L(9).start - 0.1)}, 0.2);
      KIT.cam(tl, ${f(L(9).start - 0.2)}, CAMS.evm, 1.0);
      fadeIn("#evm", ${f(TM.evm - 0.1)}, 0.5);
      KIT.pop(tl, "#lb-evm", ${f(TM.evm + 0.1)});
      term("tc4", ${f(TM.evm)}, ${f(TM.evm + 3.6)});
      KIT.pop(tl, "#lb-nofail", ${f(TM.fail9 - 0.3)});
      // ===== L10 success + empty return treated as a transfer → receipt goes into the desk
      out("#lb-evm, #lb-nofail, #lb-call", ${f(L(10).start - 0.2)}, 0.2);
      tl.to("#evm", { opacity: 0, duration: 0.4 }, ${f(L(10).start - 0.2)});
      KIT.cam(tl, ${f(L(10).start - 0.25)}, CAMS.desk, 1.1);
      KIT.grow(tl, "desk", ${f(L(10).start + 0.1)}, 0.45);
      KIT.pop(tl, "#lb-eq", ${f(TM.emptyR)});
      out("#lb-true, #lb-data", ${f(TM.xfer - 0.4)}, 0.2);
      tl.to("#tg", { x: TG_FLY[0] * 0.5, y: Math.min(TG_FLY[1], 0) - 150, duration: 0.5, ease: "power1.out" }, ${f(TM.xfer)});
      tl.to("#tg", { x: TG_FLY[0], y: TG_FLY[1], scale: 0.5, transformOrigin: "50% 50%", duration: 0.45, ease: "power2.in" }, ${f(TM.xfer + 0.5)});
      tl.to("#tg", { opacity: 0, duration: 0.15 }, ${f(TM.xfer + 0.85)});
      KITX07.slotFlash(tl, "desk", ${f(TM.xfer + 0.9)}, 2);
      // ===== L11 it records a transfer that never happened (key frame: on the book, not on the ground)
      KITX07.entry(tl, "desk", ${f(TM.rec - 0.1)}, 0, 0.6);
      KIT.swap(tl, "#lb-eq", "#lb-book", ${f(TM.rec)}, 0.25);
      fadeIn("#pc", ${f(TM.never - 0.2)}, 0.4);
      KIT.pop(tl, "#lb-ground", ${f(TM.never + 0.1)});
      // ===== L12 every external call hands your fate to someone else — the whole dock
      out("#lb-book, #lb-ground", ${f(L(12).start - 0.2)}, 0.2);
      KIT.cam(tl, ${f(L(12).start - 0.2)}, CAMS.wide, 1.4, "power2.inOut");
      ["tok", "bomb", "gasv", "gauge"].forEach((id, i) => KIT.grow(tl, id, ${f(L(12).start + 0.3)} + i * 0.15, 0.45));
      ["#ptoken", "#pbomb", "#pgas"].forEach((id, i) => fadeIn(id, ${f(L(12).start + 0.5)} + i * 0.15, 0.35));
      tl.set("#ptoken-flow, #pbomb-flow, #pgas-flow", { opacity: 1 }, ${f(TM.ext12)});
      KITX01.dash(tl, ["ptoken-flow", "plot-flow", "pbomb-flow", "pgas-flow"], ${f(TM.ext12)}, ${f(L(13).end - TM.ext12 - 1.0)}, 900);
      KIT.pop(tl, "#key", ${f(TM.ext12 - 0.2)}, 0.3);
      // ===== L13 fail · lie · stall · not exist
      KIT.grow(tl, "liar", ${f(TM.f2 - 0.35)}, 0.35);
      KIT.grow(tl, "hg", ${f(TM.f3 - 0.35)}, 0.35);
      fadeIn("#tgf", ${f(TM.f1 - 0.3)}, 0.3);
      KIT.pop(tl, "#lb-f1", ${f(TM.f1)});
      KIT.pop(tl, "#lb-f2", ${f(TM.f2)});
      KIT.pop(tl, "#lb-f3", ${f(TM.f3)});
      KIT.sand(tl, "hg", ${f(TM.f3)}, ${f(L(13).end - TM.f3 - 1.0)});
      KIT.pop(tl, "#lb-f4", ${f(TM.f4)});
      KITX07.lotPlate(tl, "lot", ${f(TM.f4)}, true, 2);
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
// initial hidden state baked into the markup (a tl.set at 0 doesn't render on frame 0)
let out = html;
for (const id of ["brp", "plot", "ptoken", "pbomb", "pgas", "pc", "tgf", "tgb-pop", "tg-pop"]) {
  const k = `<g id="${id}" `;
  if (!out.includes(k)) throw new Error("no element " + id);
  out = out.replace(k, `<g id="${id}" opacity="0" `);
}
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), out);
console.log("wrote compositions/story.html", html.length, "bytes", JSON.stringify(CAMS), JSON.stringify(TM));
