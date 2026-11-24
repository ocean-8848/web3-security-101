// Generates compositions/story.html for ep02/seg5「⑤ 门限与量子」(one isometric world, one camera).
// Run: node src/build-story.mjs      — layout P, cameras CAMS, times TM all live here; see SPEC.md.
import fs from "node:fs";
import { G, at, Wp, f, camAt, gridSvg, worldSvg, wlab, flat, box, kitCss, runtimeJs, CE } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const LN = T.lines.map((_, i) => lineAt(T, i));
const w = (term, opt) => wordAt(T, term, opt).start;

// ------------------------------------------------------------------ world layout (screen-ground X, Y → G) — see SPEC.md
// World (u, v) aligned with seg1's src/layout.mjs: the signing desk branches off the production line at SIGN_DESK,
// the chain sits at the end of the line (CHAIN). Zone A = the MPC table at the desk; zone B = post-quantum, beyond the chain.
import { LINE, SIGN_DESK, CHAIN } from "../../seg1/src/layout.mjs";
import { termCss, termHtml, termJs } from "../../kit-ext/termcard.mjs";
const S = 100; // puzzle piece size
const DU = [-420, 0, 420];
const PP = DU.map((d) => ({ u: SIGN_DESK.u + d, v: -790 }));          // three participants (in front of the belt edge v −880)
const PZ = DU.map((d) => ({ u: SIGN_DESK.u + d, v: -650 }));          // their key-share pieces on the floor
const PC = DU.map((d) => ({ u: SIGN_DESK.u + d - 175, v: -760 }));    // proof cards (screen-left of each person)
const SEAL = { u: SIGN_DESK.u, v: -440 };
const KEYR = { u: SIGN_DESK.u + 700, v: -560 };                        // attacker's assembled red key (L5)
const DIE = { u: SIGN_DESK.u + 700, v: -760 };
const CRATES = [[1960, -760, "BNB tss-lib"], [2200, -760, "Multichain"], [1960, -520, "THORChain"], [2200, -520, "Axelar"]];
const QC = { u: 3350, v: -760 };
const qo = QC;
const VIT = { u: QC.u - 10, v: QC.v + 380 };
const qs = Wp(QC.u, QC.v);
const ADDR1 = G(qs[0] + 580, qs[1] + 140);
const HASH = G(qs[0] - 400, qs[1] + 170);
const HG = G(qs[0] - 300, qs[1] - 140);

const items = [];
const A_ = {};
const add = (Y, svg) => items.push({ y: Y, svg });
const mk = (key, fn, xy, opts, dy = 0) => { const o = xy; const r = fn(o, opts); A_[key] = r.anchors; add(at(o)[1] + dy, r.svg); return r; };

// world context from seg1/seg2: the production line belt (the chain at CHAIN stays off-frame, not drawn)
// it lies behind everything else here (v ≤ −880), so they are painted first
mk("belt", X.conveyor, { u: (LINE.u0 + LINE.u1) / 2, v: LINE.v }, { id: "belt", len: LINE.u1 - LINE.u0, width: 2 * LINE.half }, -1e5);
// participants (p3 has an attacker twin at the same spot, hidden until L4)
mk("p1", O.person, PP[0], { id: "p1", role: "engineer" });
mk("p2", O.person, PP[1], { id: "p2", role: "signer" });
mk("p3", O.person, PP[2], { id: "p3", role: "engineer" });
{ const r = O.person(PP[2], { id: "p3a", role: "attacker" }); A_.p3a = r.anchors; add(at(PP[2])[1] + 0.5, `<g id="p3a-wrap" opacity="0">${r.svg}</g>`); }
// proof cards
PC.forEach((xy, i) => mk("pc" + i, X.proofCard, xy, { id: "pc" + i, text: "证明" }));
// puzzle pieces: one single-piece set per participant, placed so piece i lands on PZ[i]
PZ.forEach((t, i) => {
  const o = { u: t.u - (-1.5 * S + i * S + S / 2), v: t.v - S / 2 };
  const r = X.puzzleSet(o, { id: "pz" + i, size: S, pieces: [i], assembled: true });
  A_["pz" + i] = { ...r.anchors, c: at(t, 0, 0, 18) };
  add(at(t)[1], r.svg);
});
// attacker's assembled red key (L5)
{ const t = KEYR, r = X.puzzleSet(t, { id: "pzR", size: 82, assembled: true, pieceStates: ["attacker", "attacker", "attacker"] });
  A_.pzR = r.anchors; add(at(t)[1], `<g id="pzR-wrap" opacity="0">${r.svg}</g>`); }
mk("seal", O.seal, SEAL, { id: "seal", stamped: false, markText: "签名" });
{ const r = X.die(DIE, { id: "die", top: 3, size: 46 }); A_.die = r.anchors; add(at(DIE)[1], `<g id="die-wrap" opacity="0">${r.svg}</g>`); }
// open-source library crates (L8)
const crate = (xy, id) => {
  const o = { u: xy[0], v: xy[1] };
  const body = { f: "#e9ebee", s: "#cfd3d8", t: "#f6f7f8", st: "#5d636b" };
  let s = box(o, -52, 52, -44, 44, 0, 70, body) + box(o, -56, 56, -48, 48, 70, 82, { f: "#2aa3c9", s: "#1d93ba", t: "#5cc0e0", st: "#155e77" });
  s += flat(o, [[-52, 44], [52, 44], [52, 44], [-52, 44]], 30, "none");
  const [ox, oy] = at(o);
  return { svg: `<g id="${id}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}">${s}</g>`, anchors: { top: at(o, 0, 0, 130), ground: at(o) } };
};
CRATES.forEach(([x, y], i) => { const r = crate([x, y], "cr" + i); A_["cr" + i] = r.anchors; add(at({ u: x, v: y })[1], r.svg); });

// zone B
mk("qc", X.quantum, QC, { id: "qc", plate: "QUANTUM" });
{ // vitrine (on-chain, public) holding address 2 + its exposed public key
  const plate = X.addrPlate({ u: VIT.u + 40, v: VIT.v - 20 }, { id: "a2", text: "地址 2" });
  const k = O.key({ u: VIT.u - 50, v: VIT.v + 40 }, { id: "pk2" });
  const inner = X.liftSvg(plate.svg + k.svg, X.VITRINE_FLOOR);
  const r = X.vitrine(VIT, { id: "vit", w: 300, d: 200, h: 230, inner });
  A_.vit = r.anchors; A_.pk2 = [k.anchors.center[0], k.anchors.center[1] - X.VITRINE_FLOOR * CE];
  add(at(VIT)[1], r.svg);
}
mk("a1", X.addrPlate, ADDR1, { id: "a1", text: "地址 1" });
{ const t = { u: ADDR1.u + 20, v: ADDR1.v + 150 }; const r = X.cloth(t, { id: "cl1" }); A_.cl1 = r.anchors; add(at(t)[1], r.svg); }
mk("hash", O.shield, HASH, { id: "hash" });
mk("hg", O.hourglass, HG, { id: "hg" });

// chips peeled off the honest pieces (L4): 3 rounds × 2 sources
const CHIPS = [];
let chipSvg = "";
for (let r = 0; r < 3; r++) for (const src of [0, 1]) {
  const id = `chip${r}${src}`, c = A_["pz" + src].c, d = A_.pz2.c;
  const o = PZ[src];
  const pl = [[-24, -24], [24, -24], [24, 24], [-24, 24]].map(([a, b]) => [a + (r - 1) * 26, b + (src ? 12 : -12)]);
  chipSvg += `<g id="${id}" opacity="0">${flat(o, pl, 22, src ? "#3fa9cf" : "#5cc0e0", "#e0453a", 3)}</g>`;
  CHIPS.push({ id, dx: f(d[0] - c[0]), dy: f(d[1] - c[1]) });
}
// teal links piece → seal (L1)
const linkSvg = [0, 1, 2].map((i) => { const a = A_["pz" + i].c, b = A_.seal.mark; const mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 10;
  return `<path id="lk${i}" d="M${f(a[0])} ${f(a[1])}Q${f(mx)} ${f(my)} ${f(b[0])} ${f(b[1])}" fill="none" stroke="#2aa3c9" stroke-width="5" stroke-dasharray="12 9" stroke-linecap="round" opacity="0"/>`; }).join("");

items.sort((a, b) => a.y - b.y);
const world = worldSvg("wsvg", gridSvg({ u0: -2600, u1: 5200, v0: -2600, v1: 4400 }) + items.map((x) => x.svg).join("\n") + linkSvg + chipSvg, [-600, -400, 5200, 2200]);

// ------------------------------------------------------------------ labels
let labels = "";
const lab = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, (cls + " hide").trim(), a); };
const up = (p, dy) => [p[0], p[1] - dy];
lab("lb-tss", up(A_.p2.top, 40), "门限签名 · TSS / MPC", "lab-ink");
lab("lb-sh0", [A_.pz0.c[0], A_.pz0.c[1] + 40], "分片 1", "", "t");
lab("lb-sh1", [A_.pz1.c[0] + 92, A_.pz1.c[1] + 4], "分片 2", "", "l");
lab("lb-sh2", [A_.pz2.c[0], A_.pz2.c[1] + 40], "分片 3", "", "t");
lab("lb-zk", up(A_.pc1.top, 0), "零知识证明", "lab-gs");
lab("lb-sign", [A_.seal.ground[0] + 170, A_.seal.ground[1] + 10], "合作产生签名", "lab-cs", "l");
lab("lb-meta", [A_.seal.ground[0] - 40, A_.seal.ground[1] + 100], "比喻 · 解读", "lab-g", "t");
lab("lb-nopz", [A_.pz1.c[0] + 90, A_.pz1.c[1] + 50], "分片 ≠ 拼图", "lab-g", "l");
lab("lb-steal", [A_.pz2.c[0] + 110, A_.pz2.c[1] - 70], "<s>风险在有人偷拼图</s>", "lab-r", "l");
lab("lb-skip", up(A_.pc2.top, 0), "省掉一步证明", "lab-rs");
lab("lb-atk", up(A_.p3.top, 0), "恶意参与方", "lab-rs");
lab("lb-ext", [A_.pz2.c[0] + 100, A_.pz2.c[1] + 30], "多次签名 · 逐步提取分片", "lab-rs", "l");
lab("lb-param", up(A_.pc2.top, 0), "缺：参数证明", "lab-rs");
lab("lb-full", up(A_.pzR.top, 10), "完整私钥", "lab-rs");
lab("lb-die", up(A_.die.top, 10), "一次猜中", "lab-rs");
CRATES.forEach(([, , name], i) => lab("lb-cr" + i, A_["cr" + i].top, name, ""));
lab("lb-libs", up(A_.cr1.top, 90), "受影响的开源库", "lab-ink");
// zone B
lab("lb-qc", A_.qc.top, "足够大的量子计算机", "lab-ink");
lab("lb-vit", up(A_.vit.top, 0), "链上 · 公开可见", "");
lab("lb-pk2", [A_.pk2[0] + 70, A_.pk2[1] + 60], "公钥 → ECDSA / EdDSA 私钥", "lab-rs", "l");
lab("lb-hash", A_.hash.top, "哈希函数 · 受影响较小", "lab-gs");
lab("lb-a2", [A_.vit.ground[0] + 10, A_.vit.ground[1] + 60], "地址 2 · 已签过名 · 公钥已暴露", "lab-rs", "t");
lab("lb-a1", A_.a1.top, "地址 1 · 从未签名", "lab-gs");
lab("lb-cl", [A_.cl1.ground[0] + 10, A_.cl1.ground[1] + 50], "公钥 · 未暴露", "lab-gs", "t");
lab("lb-p2pkh", up(A_.a1.top, 66), "比特币 P2PKH 等", "lab-g");
lab("lb-hg", A_.hg.top, "迁移周期 · 以年计", "lab-cs");

// ------------------------------------------------------------------ cameras
const C = (P, sx, sy, k) => camAt(P, sx, sy, k);
const desk = Wp(SIGN_DESK.u, -640);
const CAMS = {
  open: C(desk, 960, 600, 1.0),
  l1: C(desk, 960, 590, 1.1),
  l4: C(Wp(SIGN_DESK.u + 80, -640), 960, 590, 1.12),
  ev: C(desk, 1180, 600, 0.92),
  libs: C(Wp(1560, -640), 1060, 600, 0.86),
  qa: C(Wp(QC.u, QC.v + 120), 1180, 620, 0.92),
  qa2: C(Wp(QC.u + 120, QC.v + 200), 1250, 620, 0.88),
  end: C(Wp(QC.u + 60, QC.v + 140), 1260, 620, 0.86),
};

// ------------------------------------------------------------------ times
const TM = {
  tss: w("门限签名"), mpc: w("MPC"), multi: w("多方"), shard: w("分片"), coop: w("合作产生签名"), zk: w("零知识证明"),
  meta: w("打个比方"), pz: w("拼图"), stamp2: w("合作盖章"), show: w("出示证明"), rule: w("守规矩"), hide: w("不亮出"),
  bad: w("不准"), notpz: w("分片不是拼图"), steal: w("偷拼图"),
  skip: w("省掉一步证明"), mal: w("恶意参与方"), many: w("多次签名"), ext: w("逐步提取"),
  fb: w("Fireblocks"), bf: w("BitForge"), gg: w("GG18"), param: w("参数证明"), full: w("完整私钥"),
  lin: w("Lindell17"), dev: w("偏离论文"), n200: w("200"), n15: w("15"),
  vc: w("Verichains"), tsh: w("TSSHOCK"), three: w("三类攻击"), n128: w("128"), down: w("降到"), guess: w("直接猜中"),
  tsslib: w("tss-lib"), mc: w("Multichain"), thor: w("THORChain"), axl: w("Axelar"), noloss: w("没有报告"),
  lesson: w("教训"), simp: w("简化"), vendor: w("选供应商"), fix: w("修复"), audit: w("审计报告"),
  pq: w("后量子"), qcw: w("量子计算机"), frompk: w("从公钥"), hashw: w("哈希函数"),
  p2pkh: w("P2PKH"), first: w("第一次签名"), never: w("从未签过名"), safer: w("更安全"),
  nist: w("NIST"), pub: w("已发布"), bip: w("BIP-360"), draft: w("草案"),
  eth: w("以太坊基金会"), y2029: w("2029"), plan: w("规划", { line: 13 }), nopromise: w("不是承诺"),
  years: w("以年计"), inv: w("盘点资产"), reuse: w("避免地址重复使用"), track: w("跟踪"),
};

// 15 dots
const dots15 = Array.from({ length: 15 }, (_, i) => `<i class="dt" id="dt${i}"></i>`).join("");

// 术语卡（RETROFIT-deps 第 2 类）
const TERMS = [
  { id: "tc1", t1: "零知识证明", t2: "证明自己守规矩 · 但不亮出秘密", at: w("零知识证明", { line: 1 }) },
  { id: "tc2", t1: "GG18 / GG20", t2: "两种门限签名协议", at: w("GG18", { line: 5 }), top: 440 },
  { id: "tc3", t1: "NIST", t2: "美国国家标准与技术研究院", at: w("NIST", { line: 12 }), top: 520 },
];

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 88px; }
    .lab s { text-decoration-thickness: 4px; text-decoration-color: #e0453a; }
    .card { position: absolute; left: 60px; top: 130px; width: 690px; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12);
      padding: 26px 34px 30px; opacity: 0; }
    .card .ct { font-size: 40px; font-weight: 900; white-space: nowrap; line-height: 1.2; }
    .card .cs { margin-top: 6px; font-size: 30px; font-weight: 700; color: #6d685e; white-space: nowrap; }
    .card .row { display: flex; align-items: center; gap: 14px; margin-top: 18px; font-size: 32px; font-weight: 700; white-space: nowrap; }
    .card .row .k { color: #6d685e; min-width: 0; }
    .chip { display: inline-block; font-size: 30px; font-weight: 800; border-radius: 10px; padding: 2px 14px 4px; white-space: nowrap; }
    .chip-r { background: #e0453a; color: #fff; }
    .chip-g { background: #1f9d55; color: #fff; }
    .chip-gray { background: #fff; color: #1c1c1c; border: 3px solid #cfc7b8; padding: 0 12px 2px; }
    .chip-c { background: #1d93ba; color: #fff; }
    .mono { font-family: "JetBrains Mono", "Noto Sans SC", monospace; }
    .big { font-size: 64px; font-weight: 900; font-variant-numeric: tabular-nums; line-height: 1; }
    .dots { display: flex; flex-wrap: wrap; gap: 10px; width: 600px; margin-top: 12px; }
    .dt { display: block; width: 30px; height: 30px; border-radius: 50%; background: #e0453a; opacity: 0; }
    .tiles { display: flex; gap: 14px; margin-top: 16px; }
    .tile { width: 196px; height: 92px; border-radius: 12px; border: 3px solid #cfc7b8; background: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 30px; font-weight: 800; color: #8a8478; }
    .tile.on { border-color: #e0453a; color: #c3352b; background: #fdeae7; }
    .strike { position: relative; display: inline-block; }
    .strike::after { content: ""; position: absolute; left: -6px; right: -6px; top: 52%; height: 6px; background: #e0453a; border-radius: 3px; transform: scaleX(var(--s, 0)); transform-origin: 0 50%; }
    .box { width: 40px; height: 40px; border-radius: 8px; border: 4px solid #cfc7b8; background: #fff; flex: none; position: relative; }
    .box .ck { position: absolute; inset: -4px; border-radius: 8px; background: #1f9d55; opacity: 0; }
    .box .ck svg { position: absolute; left: 6px; top: 7px; }
    .axis { position: relative; height: 150px; margin-top: 18px; }
    .axis .ln { position: absolute; left: 20px; right: 40px; top: 60px; height: 8px; background: #1c1c1c; border-radius: 4px; transform-origin: 0 50%; }
    .axis .tk { position: absolute; top: 46px; width: 8px; height: 36px; background: #1c1c1c; border-radius: 4px; }
    .axis .tx { position: absolute; top: 92px; font-size: 32px; font-weight: 800; white-space: nowrap; transform: translateX(-50%); }
    .axis .mk { position: absolute; top: 34px; width: 34px; height: 34px; border-radius: 50%; background: #fff; border: 6px dashed #8a8478; transform: translateX(-50%); }
    .axis .gt { position: absolute; top: -8px; font-size: 30px; font-weight: 700; white-space: nowrap; transform: translateX(-50%); }
    #todo { position: absolute; left: 60px; top: 130px; display: flex; flex-direction: column; gap: 16px; }
    #todo .td { display: flex; align-items: center; gap: 16px; background: #fffdf8; border-radius: 16px; box-shadow: 0 12px 26px rgba(70,60,40,0.12);
      padding: 18px 30px 20px; font-size: 38px; font-weight: 900; white-space: nowrap; opacity: 0; }
    #todo .n { display: inline-flex; width: 48px; height: 48px; border-radius: 50%; background: #1d93ba; color: #fff; font-size: 30px; align-items: center; justify-content: center; }
    #todo .hd { font-size: 32px; font-weight: 800; color: #6d685e; opacity: 0; }
${termCss}
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>

      <div class="card" id="ev1">
        <div class="ct">BitForge · Fireblocks 披露</div>
        <div class="cs">2023 年 8 月</div>
        <div class="row" id="ev1-r1"><span class="chip chip-c mono">GG18 / GG20</span><span>实现缺少</span><span class="chip chip-r">参数证明</span></div>
        <div class="row" id="ev1-r2"><span class="k">后果：</span><span style="color:#c3352b">恶意参与方提取完整私钥</span></div>
      </div>
      <div class="card" id="ev2">
        <div class="ct">BitForge · <span class="mono">Lindell17</span></div>
        <div class="row" id="ev2-r1"><span class="chip chip-r">实现偏离论文</span></div>
        <div class="row" id="ev2-r2"><span class="k">约</span><span class="big" id="n200">0</span><span>次签名请求 → 私钥</span></div>
        <div class="row" id="ev2-r3" style="margin-top:22px"><span>影响 15 家以上钱包服务商</span></div>
        <div class="cs" id="ev2-lg" style="font-size:28px">每个点 = 1 家</div>
        <div class="dots">${dots15}</div>
      </div>
      <div class="card" id="ev3">
        <div class="ct">TSSHOCK · Verichains 披露</div>
        <div class="cs">三类攻击</div>
        <div class="tiles"><div class="tile on" id="tl0">例：重复次数</div><div class="tile" id="tl1">②</div><div class="tile" id="tl2">③</div></div>
        <div class="row" id="ev3-r1" style="margin-top:24px"><span class="k">证明重复次数</span><span class="big strike" id="n128">128</span><span class="big" id="arw" style="opacity:0">→ 1</span></div>
        <div class="row" id="ev3-r2" style="opacity:0"><span class="chip chip-r">可以直接猜中</span></div>
      </div>
      <div class="card" id="ev4">
        <div class="ct">选 MPC 供应商 · 要问</div>
        <div class="cs">MPC 库不能按论文简化</div>
        <div class="row" style="margin-top:26px"><div class="box"><div class="ck" id="ck0"><svg width="28" height="22" viewBox="0 0 28 22"><path d="M3 11l7 7L25 3" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div><span>按论文完整实现，没有简化？</span></div>
        <div class="row"><div class="box"><div class="ck" id="ck1"><svg width="28" height="22" viewBox="0 0 28 22"><path d="M3 11l7 7L25 3" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div><span>修复了 BitForge · TSSHOCK？</span></div>
        <div class="row"><div class="box"><div class="ck" id="ck2"><svg width="28" height="22" viewBox="0 0 28 22"><path d="M3 11l7 7L25 3" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div><span>有审计报告？</span></div>
      </div>
      <div class="card" id="noloss" style="left:60px;top:140px;width:auto;padding:16px 30px 18px;background:#1f9d55;color:#fff">
        <div style="font-size:36px;font-weight:900;white-space:nowrap">两项披露都没有报告实际资金损失</div>
      </div>
      <div class="card" id="st">
        <div class="ct">后量子迁移现状</div>
        <div class="cs">截至 2026 年 11 月</div>
        <div class="row" id="st-r0" style="opacity:0"><span>NIST 后量子标准</span><span class="chip chip-g">已发布</span></div>
        <div class="row" id="st-r1" style="opacity:0"><span>比特币 <span class="mono">BIP-360</span></span><span class="chip chip-gray">草案</span></div>
        <div class="row" id="st-r2" style="opacity:0"><span>以太坊</span><span class="chip chip-gray">规划</span></div>
      </div>
      <div class="card" id="ax" style="top:470px">
        <div class="cs" style="margin-top:0">以太坊基金会目标</div>
        <div class="axis">
          <div class="ln" id="ax-ln"></div>
          <div class="tk" style="left:20px"></div><div class="tx" style="left:24px">2026</div>
          <div class="mk" id="ax-mk" style="left:520px;opacity:0"></div><div class="tx" id="ax-t" style="left:520px;opacity:0">约 2029</div>
        </div>
        <div class="row" style="margin-top:0"><span id="ax-g" style="opacity:0">完成核心基础设施</span><span class="chip chip-gray" id="st-pl" style="opacity:0">规划 · 非承诺</span></div>
      </div>
      <div id="todo">
        <div class="hd" id="td-h">现在能做的</div>
        <div class="td" id="td0"><span class="n">1</span>盘点资产</div>
        <div class="td" id="td1"><span class="n">2</span>避免地址重复使用</div>
        <div class="td" id="td2"><span class="n">3</span>跟踪各链迁移计划</div>
      </div>

      ${termHtml(TERMS)}
      ${pills(5, { sections: SCRIPT.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">⑤ 门限与量子</div><div class="t-sub">省掉一步证明 · 公钥一旦暴露</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const CHIPS = ${JSON.stringify(CHIPS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const hid = (id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); };
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      const card = (sel, t) => tl.fromTo(sel, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: "expo.out", immediateRender: false }, t);

      KIT.camSet(tl, CAMS.open);
      ["p1","p2","p3","pc0","pc1","pc2","pz0","pz1","pz2","seal","cr0","cr1","cr2","cr3","qc","vit","a1","cl1","hash","hg"].forEach(hid);

      // ===== 0–1.6 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.3);

      // ===== L0 threshold signing: three participants
      grow("p1", ${f(LN[0].start - 0.1)}); grow("p2", ${f(LN[0].start + 0.05)}); grow("p3", ${f(LN[0].start + 0.2)});
      grow("seal", ${f(TM.tss)});
      pop("#lb-tss", ${f(TM.tss + 0.2)});

      // ===== L1 each holds a key share; signing together; zero-knowledge proof every step
      KIT.cam(tl, ${f(LN[1].start - 0.2)}, CAMS.l1, 1.2);
      grow("pz0", ${f(TM.shard - 0.3)}); grow("pz1", ${f(TM.shard - 0.15)}); grow("pz2", ${f(TM.shard)});
      pop("#lb-sh0", ${f(TM.shard + 0.2)}); pop("#lb-sh1", ${f(TM.shard + 0.3)}); pop("#lb-sh2", ${f(TM.shard + 0.4)});
      [0,1,2].forEach((i) => fadeIn("#lk" + i, ${f(TM.coop)} + i * 0.08, 0.3));
      KIT.stamp(tl, "seal", ${f(TM.coop + 0.1)});
      pop("#lb-sign", ${f(TM.coop + 0.5)});
      out("#lb-sh0, #lb-sh1, #lb-sh2", ${f(TM.zk - 0.9)}, 0.2);
      grow("pc0", ${f(TM.zk - 0.4)}); grow("pc1", ${f(TM.zk - 0.25)}); grow("pc2", ${f(TM.zk - 0.1)});
      pop("#lb-zk", ${f(TM.zk + 0.2)});

      // ===== L2 metaphor: puzzle pieces, show the proof, never the piece
      out("#lb-sign, #lb-zk", ${f(LN[2].start)}, 0.2);
      out("#lk0, #lk1, #lk2", ${f(LN[2].start)}, 0.2);
      tl.set("#seal-mark", { opacity: 0 }, ${f(LN[2].start + 0.2)});
      pop("#lb-meta", ${f(TM.meta)});
      KIT.stamp(tl, "seal", ${f(TM.stamp2 - 0.2)});
      [0,1,2].forEach((i) => tl.fromTo("#pc" + i + "-card", { y: 0 }, { y: -26, duration: 0.25, ease: "power2.out", yoyo: true, repeat: 1, immediateRender: false }, ${f(TM.show)} + i * 0.35));
      [0,1,2].forEach((i) => tl.fromTo("#pz" + i + "-pc-" + i, { y: 0 }, { y: -4, duration: 0.2, ease: "power1.out", yoyo: true, repeat: 1, immediateRender: false }, ${f(TM.hide)} + i * 0.1));

      // ===== L3 where the metaphor fails
      pop("#lb-nopz", ${f(TM.notpz)});
      pop("#lb-steal", ${f(TM.steal - 0.2)});

      // ===== L4 key image: one proof skipped → the malicious party peels shares off, signing after signing
      KIT.cam(tl, ${f(LN[4].start - 0.2)}, CAMS.l4, 1.0);
      out("#lb-meta, #lb-nopz, #lb-steal, #lb-tss", ${f(LN[4].start - 0.2)}, 0.2);
      tl.set("#seal-mark", { opacity: 0 }, ${f(LN[4].start)});
      KIT.swap(tl, "#pc2-card", "#pc2-slot", ${f(TM.skip + 0.2)}, 0.3);
      pop("#lb-skip", ${f(TM.skip + 0.4)});
      KIT.swap(tl, "#p3", "#p3a-wrap", ${f(TM.mal)}, 0.35);
      out("#lb-skip", ${f(TM.mal - 0.1)}, 0.15);
      pop("#lb-atk", ${f(TM.mal + 0.25)});
      const rounds = [${f(TM.many - 0.6)}, ${f(TM.many + 0.75)}, ${f(TM.ext + 0.6)}];
      rounds.forEach((t0, r) => {
        KIT.stamp(tl, "seal", t0);
        [0, 1].forEach((src) => {
          const c = CHIPS[r * 2 + src];
          tl.set("#" + c.id, { opacity: 1, x: 0, y: 0 }, t0 + 0.66);
          tl.to("#" + c.id, { x: c.dx, duration: 0.7, ease: "power1.inOut" }, t0 + 0.7);
          tl.to("#" + c.id, { y: c.dy - 60, duration: 0.35, ease: "power2.out" }, t0 + 0.7);
          tl.to("#" + c.id, { y: c.dy, duration: 0.35, ease: "power2.in" }, t0 + 1.05);
          tl.to("#pz" + src + "-pc-" + src, { opacity: 1 - 0.2 * (r + 1), duration: 0.3 }, t0 + 0.7);
        });
      });
      pop("#lb-ext", ${f(TM.ext)});

      // ===== L5 BitForge GG18/GG20: missing parameter proof → full key
      KIT.cam(tl, ${f(LN[5].start - 0.3)}, CAMS.ev, 1.2);
      out("#lb-ext, #lb-atk", ${f(LN[5].start - 0.3)}, 0.2);
      card("#ev1", ${f(TM.fb - 0.2)});
      pop("#lb-param", ${f(TM.param)});
      out(CHIPS.map((c) => "#" + c.id).join(","), ${f(TM.full - 0.4)}, 0.2);
      out("#pz2", ${f(TM.full - 0.4)}, 0.25);
      fadeIn("#pzR-wrap", ${f(TM.full - 0.3)}, 0.3);
      KIT.assemble(tl, "pzR", ${f(TM.full - 0.3)}, true, 0.6);
      pop("#lb-full", ${f(TM.full)});

      // ===== L6 Lindell17: deviates from the paper; ~200 signing requests; 15+ providers
      tl.to("#ev1", { opacity: 0, duration: 0.2 }, ${f(LN[6].start - 0.2)});
      out("#lb-param, #lb-full", ${f(LN[6].start - 0.2)}, 0.2);
      card("#ev2", ${f(LN[6].start)});
      { const o = { v: 0 }; tl.fromTo(o, { v: 0 }, { v: 200, duration: 2.2, ease: "power1.inOut", immediateRender: false, onUpdate: () => { $("n200").textContent = Math.round(o.v); } }, ${f(TM.n200 - 1.2)}); }
      [${f(TM.dev - 0.4)}, ${f(TM.dev + 0.9)}].forEach((t0) => KIT.stamp(tl, "seal", t0));
      for (let i = 0; i < 15; i++) tl.to("#dt" + i, { opacity: 1, duration: 0.12 }, ${f(TM.n15 - 0.3)} + i * 0.05);

      // ===== L7 TSSHOCK: three attack classes; 128 → 1 repetitions, guessed in one try
      tl.to("#ev2", { opacity: 0, duration: 0.2 }, ${f(LN[7].start - 0.2)});
      card("#ev3", ${f(LN[7].start)});
      tl.fromTo("#n128", { "--s": 0 }, { "--s": 1, duration: 0.3, ease: "power2.out", immediateRender: false }, ${f(TM.down)});
      fadeIn("#arw", ${f(TM.down + 0.15)}, 0.25);
      fadeIn("#die-wrap", ${f(TM.down)}, 0.25);
      KIT.roll(tl, "die-d", ${f(TM.guess - 0.4)}, 5);
      KIT.roll(tl, "die-d", ${f(TM.guess - 0.2)}, 2);
      KIT.roll(tl, "die-d", ${f(TM.guess)}, 6);
      fadeIn("#ev3-r2", ${f(TM.down + 0.7)}, 0.25);
      pop("#lb-die", ${f(TM.guess + 0.1)});

      // ===== L8 affected open-source libraries; no reported losses
      KIT.cam(tl, ${f(LN[8].start - 0.2)}, CAMS.libs, 1.1);
      tl.to("#ev3", { opacity: 0, duration: 0.2 }, ${f(LN[8].start + 0.5)});
      out("#lb-die, #die-wrap", ${f(LN[8].start - 0.3)}, 0.2);
      [["cr0", "${TM.tsslib}"], ["cr1", "${TM.mc}"], ["cr2", "${TM.thor}"], ["cr3", "${TM.axl}"]].forEach(([id, t], i) => { grow(id, +t - 0.25); pop("#lb-cr" + i, +t); });
      pop("#lb-libs", ${f(TM.tsslib - 0.6)});
      card("#noloss", ${f(TM.noloss - 0.3)});

      // ===== L9 lesson: questions for an MPC vendor
      KIT.cam(tl, ${f(LN[9].start - 0.2)}, CAMS.ev, 1.1);
      tl.to("#noloss", { opacity: 0, duration: 0.2 }, ${f(LN[9].start - 0.2)});
      out("#lb-libs, #lb-cr0, #lb-cr1, #lb-cr2, #lb-cr3", ${f(LN[9].start - 0.2)}, 0.2);
      card("#ev4", ${f(TM.lesson)});
      fadeIn("#ck0", ${f(TM.simp)}, 0.2);
      fadeIn("#ck1", ${f(TM.fix)}, 0.2);
      fadeIn("#ck2", ${f(TM.audit)}, 0.2);
      KIT.swap(tl, "#pc2-slot", "#pc2-card", ${f(TM.simp + 0.2)}, 0.3);

      // ===== L10 post-quantum: quantum computer aims at the public key in the on-chain vitrine
      KIT.cam(tl, ${f(LN[10].start - 0.4)}, CAMS.qa, 1.6);
      tl.to("#ev4", { opacity: 0, duration: 0.25 }, ${f(LN[10].start - 0.4)});
      ["cr0","cr1","cr2","cr3"].forEach((id) => { const g = $(id); tl.to("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy"), duration: 0.3, ease: "power2.in" }, ${f(LN[9].start - 0.2)}); });
      out("#pzR-wrap, #lb-full", ${f(LN[10].start - 0.4)}, 0.3);
      grow("vit", ${f(TM.pq - 0.4)}); pop("#lb-vit", ${f(TM.pq)});
      grow("qc", ${f(TM.qcw - 0.3)}, 0.6); pop("#lb-qc", ${f(TM.qcw + 0.2)});
      fadeIn("#qc-beam", ${f(TM.frompk)}, 0.4);
      pop("#lb-pk2", ${f(TM.frompk + 0.3)});
      grow("hash", ${f(TM.hashw - 0.3)}); pop("#lb-hash", ${f(TM.hashw + 0.1)});

      // ===== L11 public key exposed only after the first signature
      KIT.cam(tl, ${f(LN[11].start - 0.2)}, CAMS.qa2, 1.2);
      out("#lb-qc, #lb-vit, #lb-pk2", ${f(LN[11].start - 0.2)}, 0.2);
      grow("a1", ${f(TM.p2pkh - 0.3)}); grow("cl1", ${f(TM.p2pkh - 0.1)});
      pop("#lb-p2pkh", ${f(TM.p2pkh + 0.2)});
      pop("#lb-a2", ${f(TM.first)});
      pop("#lb-a1", ${f(TM.never)}); pop("#lb-cl", ${f(TM.never + 0.3)});

      // ===== L12 status (as of 2026-11)
      KIT.cam(tl, ${f(LN[12].start - 0.2)}, CAMS.end, 1.0);
      out("#lb-p2pkh, #lb-hash", ${f(LN[12].start - 0.2)}, 0.2);
      card("#st", ${f(LN[12].start)});
      fadeIn("#st-r0", ${f(TM.nist)}, 0.25);
      fadeIn("#st-r1", ${f(TM.bip)}, 0.25);

      // ===== L13 Ethereum: ~2029, a plan not a promise
      fadeIn("#st-r2", ${f(TM.eth)}, 0.25);
      card("#ax", ${f(TM.eth + 0.3)});
      tl.fromTo("#ax-ln", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power2.out", immediateRender: false }, ${f(TM.eth + 0.4)});
      fadeIn("#ax-mk", ${f(TM.y2029 - 0.1)}, 0.2); fadeIn("#ax-t", ${f(TM.y2029)}, 0.2); fadeIn("#ax-g", ${f(TM.y2029 + 0.5)}, 0.25);
      pop("#st-pl", ${f(TM.plan)});

      // ===== L14 what to do now; migration measured in years — hold
      tl.to("#st, #ax", { opacity: 0, duration: 0.25 }, ${f(LN[14].start - 0.2)});
      grow("hg", ${f(LN[14].start)}); pop("#lb-hash", ${f(LN[14].start + 0.3)}); pop("#lb-hg", ${f(TM.years - 0.2)});
      KIT.sand(tl, "hg", ${f(LN[14].start + 0.3)}, ${f(TOTAL - 1.2 - LN[14].start - 0.3)});
      fadeIn("#td-h", ${f(TM.inv - 0.6)}, 0.2);
      card("#td0", ${f(TM.inv - 0.1)}); card("#td1", ${f(TM.reuse)}); card("#td2", ${f(TM.track)});
      tl.set({}, {}, ${f(TOTAL)});

      ${termJs(TERMS)}      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes; total", TOTAL);
