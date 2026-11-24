// Builds compositions/showcase.html — ep02 kit-ext showcase (4 screens, 16 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, at, f, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs, line3 } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as X from "../../objects-ext.mjs";
import { pills } from "../../../../kit/pills.mjs";

const K = 0.7;
const SX = [1100, 4100, 7100, 10100];
const CAMS = SX.map((x) => camAt([x, 700], 960, 560, K));
const SECTIONS = ["种子只有32位", "各管什么", "熵不够", "nonce泄密", "门限与量子", "怎么守"];

// [constructor, X, Y, opts, label, labelClass]
const items = [
  // ---- screen 1 · 熵源与转盘（含 kit 原物件对照比例）
  [X.lottery, 220, 560, { id: "lot", glow: true }, "摇奖机 · CSPRNG"],
  [X.lottery, 700, 560, { id: "lots", size: "small", plate: "" }, "小号滚筒"],
  [X.prngCounter, 1040, 600, { id: "prng" }, "PRNG 计数器"],
  [X.comboDial, 1460, 560, { id: "d32" }, "32 位转盘"],
  [X.comboDial, 1960, 540, { id: "d256", rings: 8 }, "256 位转盘"],
  [O.person, 300, 1040, { id: "p1", role: "signer" }, "kit 人物"],
  [O.safe, 760, 1040, { id: "safe", plate: "金库" }, "kit 保险柜"],
  [O.laptop, 1260, 1060, { id: "lap" }, "kit 笔记本"],
  [X.shaft, 1660, 960, { id: "sh", a: [-170, 0, 110], b: [170, 0, 110], hi: false }, "传动轴"],
  // ---- screen 2 · 私钥生产线
  [X.conveyor, 3400, 640, { id: "belt", len: 900 }, "传送带 · 生产线"],
  [X.mnemonicPlate, 3000, 980, { id: "mn" }, "金属助记词板"],
  [X.seedJar, 3520, 1000, { id: "seed" }, "种子罐"],
  [X.deriveTree, 3960, 960, { id: "tree" }, "派生树"],
  [X.addrPlate, 4380, 900, { id: "a1", text: "地址 1" }, "地址门牌"],
  [X.addrPlate, 4560, 1000, { id: "a2", text: "地址 2" }, ""],
  [X.vitrine, 4760, 560, { id: "vit", w: 260, d: 160, h: 220, inner: X.liftSvg(X.addrPlate(G(4760, 560), { id: "a3", text: "地址 3" }).svg, X.VITRINE_FLOOR) }, "玻璃展柜 · 公开"],
  [O.chain, 4100, 400, { id: "chain", n: 3 }, "kit 区块链"],
  [O.key, 3000, 400, { id: "k0" }, "kit 钥匙"],
  // ---- screen 3 · 攻击者工作台与签名
  [X.gpuRig, 6200, 560, { id: "gpu", cable: "cut" }, "GPU 枚举机 · 网线剪断"],
  [X.rollCounter, 6640, 700, { id: "ctr", digits: 10, value: 0 }, "滚动计数器"],
  [O.person, 6560, 1040, { id: "atk", role: "attacker" }, "kit 攻击者", "lab-rs"],
  [X.curveBoard, 7280, 520, { id: "ec" }, "椭圆曲线板"],
  [X.diceCup, 7800, 600, { id: "cup", dice: [4, 4] }, "nonce 骰子杯"],
  [X.die, 8180, 640, { id: "die", top: 6, black: true }, "偏置骰子"],
  [X.sigPaper, 6960, 1040, { id: "s1" }, "签名纸 · r 签条"],
  [X.sigPaper, 7300, 1060, { id: "s2" }, ""],
  [X.cloth, 7780, 1060, { id: "cl" }, "遮布 · 盖着钥匙"],
  [X.kMachine, 8200, 1000, { id: "km" }, "确定性 k 机器"],
  // ---- screen 4 · 门限与量子
  [X.puzzleSet, 9500, 980, { id: "pz", pieceStates: ["normal", "normal", "normal"] }, "拼图块 · 三方各持一块"],
  [O.person, 9080, 760, { id: "q1", role: "engineer" }, ""],
  [O.person, 9500, 700, { id: "q2", role: "signer" }, ""],
  [O.person, 9920, 760, { id: "q3", role: "engineer" }, ""],
  [X.proofCard, 9240, 1200, { id: "pc1" }, "证明卡"],
  [X.proofCard, 9760, 1220, { id: "pc2", missing: false }, "证明卡 · 缺失"],
  [X.quantum, 10620, 640, { id: "qc" }, "量子计算机"],
  [X.kMachine, 11160, 1000, { id: "km2", missing: "key" }, "k 机器 · 缺私钥管", "lab-rs"],
  [O.seal, 10520, 1100, { id: "seal", stamped: false }, "kit 公章"],
];

const built = items.map(([fn, Xc, Y, opts, label, cls]) => ({ X: Xc, Y, opts, label, cls, r: fn(G(Xc, Y), opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
let labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm")).join("");
const A = Object.fromEntries(built.map((b) => [b.opts.id, b.r.anchors]));
// extra demo labels
labels += wlab("lb-r", [(A.s1.tag[0] + A.s2.tag[0]) / 2, Math.min(A.s1.tag[1], A.s2.tag[1]) - 30], "r 值重复", "lab-rs lab-sm hide");
labels += wlab("lb-leak", [A.tree.ground[0], A.tree.ground[1] + 40], "一个种子泄露 · 整棵树", "lab-rs lab-sm hide", "t");
// red dashed link between the two r tags (world layer, hidden until drawn)
const link = `<path id="rlink" d="M${f(A.s1.tag[0])} ${f(A.s1.tag[1])}Q${f((A.s1.tag[0] + A.s2.tag[0]) / 2)} ${f(Math.min(A.s1.tag[1], A.s2.tag[1]) - 50)} ${f(A.s2.tag[0])} ${f(A.s2.tag[1])}" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="10 8" opacity="0"/>`;

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 14000, v0: -8000, v1: 8000 }) + objSvg + link, [-1000, -1400, 13600, 3800]);
const titles = [["1 / 4", "熵源与转盘 · 对照 kit 比例"], ["2 / 4", "私钥生产线"], ["3 / 4", "枚举机与签名"], ["4 / 4", "门限签名与量子"]];
const titleHtml = titles.map(([n, t], i) => `<div class="ttl${i ? " hide" : ""}" id="ttl-${i}"><span class="ttl-n">${n}</span>${t}</div>`).join("");

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-wrap { position: absolute; left: 56px; top: 34px; }
    .ttl { position: absolute; left: 0; top: 0; white-space: nowrap; font-size: 40px; font-weight: 900; }
    .ttl-n { display: inline-block; margin-right: 16px; font-family: "JetBrains Mono", monospace; font-size: 28px; font-weight: 700; color: #ffffff;
      background: #1d93ba; border-radius: 8px; padding: 2px 12px 4px; vertical-align: 6px; }
    #kit-sub { position: absolute; left: 56px; top: 96px; font-size: 28px; font-weight: 700; color: #6d685e; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="showcase" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div id="ttl-wrap">${titleHtml}</div>
      <div id="kit-sub">ep02 补充拟物物件 · 示例</div>
      ${pills(1, { sections: SECTIONS })}
    </div>
  </div>
  <script>
${runtimeJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      KIT.camSet(tl, CAMS[0]);
      // ---- screen 1: drums tumble, ball drops, PRNG clicks, dials turn, shaft spins
      KIT.drum(tl, "lot", 0.6, 2.6, 2);
      KIT.drum(tl, "lots", 0.8, 2.2, 1.5);
      KIT.ballOut(tl, "lot", 2.9, 0.7);
      KIT.tick(tl, "prng", 0.6, 5, 2.0);
      KIT.dialTurn(tl, "d32", 0.6, 200, 2.4);
      KIT.dialTurn(tl, "d256", 0.6, 120, 2.4);
      KIT.shaftSpin(tl, "sh", 0.6, 2.4, 260);
      // ---- screen 2: belt runs, plate engraved, tree leaks, flag up
      KIT.cam(tl, 3.8, CAMS[1], 1.0);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 4.1, 0.3);
      KIT.belt(tl, "belt", 4.6, 2.8, 300);
      for (let i = 0; i < 12; i++) tl.fromTo("#mn-w-" + i, { opacity: 0 }, { opacity: 1, duration: 0.1, immediateRender: false }, 4.4 + i * 0.12);
      KIT.swap(tl, "#seed-seed", "#seed-seed-atk", 5.8, 0.25);
      KIT.leak(tl, "tree", 6.0, 0.15);
      KIT.pop(tl, "#lb-leak", 6.2);
      KIT.rot(tl, "a1-flag", 5.0, -90, 0.5);
      // ---- screen 3: fans spin, counter rolls, cup lifts on two equal dice, r tags turn red, cloth lifts, k emitted
      KIT.cam(tl, 7.8, CAMS[2], 1.0);
      KIT.swap(tl, "#ttl-1", "#ttl-2", 8.1, 0.3);
      KIT.fans(tl, "gpu", 8.4, 3.4, 3);
      KIT.count(tl, "ctr", 8.5, 3.0, 0, 4294967295, "power2.in");
      KIT.cupShake(tl, "cup", 8.6, 0.9);
      KIT.roll(tl, "cup-d0", 9.0, 2); KIT.roll(tl, "cup-d0", 9.3, 4);
      KIT.cup(tl, "cup", 9.6, true, 0.6);
      KIT.drawPath(tl, "ec-curve", 8.4, 1.4);
      KIT.swap(tl, "#s1-tag", "#s1-tag-red", 10.0, 0.25);
      KIT.swap(tl, "#s2-tag", "#s2-tag-red", 10.0, 0.25);
      tl.fromTo("#rlink", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 10.2);
      KIT.pop(tl, "#lb-r", 10.3);
      KIT.unveil(tl, "cl", 10.4, 0.6);
      KIT.emit(tl, "km", 10.2, 0.9);
      // ---- screen 4: puzzle assembles, a proof card goes missing, quantum beam on
      KIT.cam(tl, 11.9, CAMS[3], 1.0);
      KIT.swap(tl, "#ttl-2", "#ttl-3", 12.2, 0.3);
      KIT.assemble(tl, "pz", 12.9, true, 0.9);
      KIT.swap(tl, "#pc2-card", "#pc2-slot", 13.6, 0.3);
      KIT.swap(tl, "#pz-pc-2-n", "#pz-pc-2-r", 13.9, 0.3);
      tl.fromTo("#qc-beam", { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: false }, 14.0);
      KIT.emit(tl, "km2", 13.2, 0.8);
      KIT.stamp(tl, "seal", 12.8);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
