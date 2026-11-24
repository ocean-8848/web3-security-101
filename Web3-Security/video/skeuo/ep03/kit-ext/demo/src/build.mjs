// Builds compositions/showcase.html — ep03 kit-ext showcase (3 screens, 12 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as X from "../../objects-ext.mjs";
import { pills } from "../../../../kit/pills.mjs";

const CAMS = { s1: camAt([1120, 740], 960, 600, 0.8), s2: camAt([3560, 680], 960, 590, 1.0), s3: camAt([6000, 760], 960, 590, 0.9) };

const cabOpts = {
  id: "cab", open: { 0: true, 1: 64 }, tags: { 5: "private" },
  fill: { 0: [{ bytes: 20, color: "teal" }, { bytes: 1, color: "green" }], 1: [{ bytes: 12, color: "ink" }], 2: [{ bytes: 32, color: "gray" }], 3: [{ bytes: 20, color: "teal" }, { bytes: 1, color: "green" }, { bytes: 11, color: "ink" }] },
};
// [constructor, X, Y, opts, label, labelClass]
const items = [
  // ---- screen 1 · machines & storage, with kit person / laptop / safe for scale
  [O.person, 120, 700, { id: "ps", role: "signer" }, "person"],
  [O.laptop, 400, 760, { id: "lap" }, "laptop"],
  [O.safe, 790, 600, { id: "safe", plate: "VAULT" }, "safe"],
  [X.contractMachine, 1290, 600, { id: "mA", name: "A", pipe: 200 }, "合约机器 A"],
  [X.slotCabinet, 1800, 640, cabOpts, "存储抽屉柜"],
  [X.contractMachine, 440, 1120, { id: "mX", name: "攻击", state: "attacker", slotLit: true }, "attacker", "lab-rs"],
  [X.contractMachine, 900, 1140, { id: "mG", name: "B", tone: "gray" }, "tone: gray"],
  [X.contractMachine, 1360, 1160, { id: "mK", name: "C", state: "broken" }, "broken"],
  // ---- screen 2 · flow props
  [X.hashFunnel, 2840, 640, { id: "hf", inputs: ["键 k", "槽 3"], output: "哈希位置" }, "哈希漏斗"],
  [X.manual, 3280, 760, { id: "bk", title: "B 的代码", pageText: "清空 0 号抽屉" }, "规程手册"],
  [X.frameStack, 3680, 620, { id: "fs" }, "调用帧堆叠"],
  [X.gasGauge, 4110, 640, { id: "g1", value: 1 }, "gas 油表 · 调用方"],
  [X.gasGauge, 4330, 900, { id: "g2", value: 0.35 }, "被调用方"],
  // ---- screen 3 · keys, boards, byte blocks
  [X.byteBlock, 5100, 560, { id: "bOwner", bytes: 20, color: "teal" }, "owner · 20"],
  [X.byteBlock, 5420, 640, { id: "bPaused", bytes: 1, color: "green" }, "paused · 1"],
  [X.byteBlock, 5560, 540, { id: "bFee", bytes: 12, color: "ink", over: 1 }, "fee · 12 溢出 1"],
  [X.byteBlock, 5960, 560, { id: "bTotal", bytes: 32, color: "gray" }, "total · 32"],
  [X.selectorKey, 5250, 960, { id: "k1", name: "transfer(address,uint256)", selector: "a9059cbb" }, "选择器钥匙"],
  [X.selectorKey, 5290, 1150, { id: "k2", name: "fooBar_42(bytes)", selector: "a9059cbb" }, "同齿形 · 不同名"],
  [X.signboard, 6050, 1000, { id: "sg1", n: "1", myth: "private 变量是保密的", fact: "链上存储任何人都能读", impact: "不能存秘密", blank: true }, "告示牌 · 逐行翻出"],
  [X.signboard, 6680, 1040, { id: "sg2", n: "8", myth: "函数名不同就不会撞", fact: "选择器只有前 4 字节", impact: "可构造同选择器", struck: true, lamp: true }, "告示牌 · 完成态"],
  [O.person, 5760, 1220, { id: "pe", role: "engineer" }, "person"],
];

const built = items.map(([fn, Xg, Yg, opts, label, cls]) => ({ Y: Yg, opts, label, cls, r: fn(G(Xg, Yg), opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
let labels = built.map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm")).join("");
const A = Object.fromEntries(built.map((b) => [b.opts.id, b.r.anchors]));
labels += wlab("lb-scr", A.cab.drawersOpen[0], "0 号槽 · 32 格", "lab-cs lab-sm", "l");

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 9000, v0: -4000, v1: 6000 }) + objSvg, [-1000, -1200, 7800, 3600]);
const titles = [["1 / 3", "合约机器与存储"], ["2 / 3", "流程道具"], ["3 / 3", "钥匙 · 告示牌 · 字节块"]];
const titleHtml = titles.map(([n, t], i) => `<div class="ttl${i ? " hide" : ""}" id="ttl-${i}"><span class="ttl-n">${n}</span>${t}</div>`).join("");
const sections = ["借来的身份", "调用上下文", "存储槽", "八个误解", "回滚与Gas"];

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
      <div id="kit-sub">ep03 补充拟物物件 · 与 kit 原物件比例对照</div>
      ${pills(3, { sections })}
    </div>
  </div>
  <script>
${runtimeJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      KIT.camSet(tl, CAMS.s1);
      // ---- screen 1
      KITX.spin(tl, "mA", 0.5, 3.0, 2);
      KITX.spin(tl, "mX", 0.5, 3.0, -1.5);
      KITX.slot(tl, "mA", 0.7, true);
      KITX.drawer(tl, "cab", 3, 1.0, true, 0.6);
      KITX.mark(tl, "cab", 0, 1.6, "green");
      KITX.drawer(tl, "cab", 1, 1.6, 0, 0.5);
      KITX.clearDrawer(tl, "cab", 3, 2.3);
      KITX.mark(tl, "cab", 3, 2.3, "red");
      // ---- screen 2
      KIT.cam(tl, 3.6, CAMS.s2, 0.8);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 3.8, 0.3);
      KITX.hash(tl, "hf", 4.6);
      KITX.book(tl, "bk", 4.6, 178, 1.0);
      KITX.tip(tl, "fs", 2, 5.6, { keep: true });
      KITX.push(tl, "fs", 2, 6.8);
      KITX.gauge(tl, "g1", 4.6, 0, 1.6, "steps(8)");
      KITX.gauge(tl, "g2", 4.8, 0.9, 1.0);
      KIT.swap(tl, "#g2-scale", "#g2-scale2", 6.0, 0.3);
      // ---- screen 3
      KIT.cam(tl, 7.4, CAMS.s3, 0.8);
      KIT.swap(tl, "#ttl-1", "#ttl-2", 7.6, 0.3);
      KITX.sign(tl, "sg1", 8.4, "all");
      KITX.fade(tl, "#k1-teeth-hl", 9.0, 1, 0.2); KITX.fade(tl, "#k2-teeth-hl", 9.0, 1, 0.2);
      KITX.fade(tl, "#bFee-over", 8.4, 0.25, 0.2); KITX.fade(tl, "#bFee-over", 8.7, 1, 0.2);
      KITX.fade(tl, "#bFee-over", 9.0, 0.25, 0.2); KITX.fade(tl, "#bFee-over", 9.3, 1, 0.2);
      KITX.moveUV(tl, "bPaused", 9.4, 0, -80, 0, 0.6, 30);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
