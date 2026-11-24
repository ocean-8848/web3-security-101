// Builds compositions/showcase.html — ep06 kit-ext showcase (3 screens, 12 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as X from "../../objects-ext.mjs";
import { pills } from "../../../../kit/pills.mjs";

const CAMS = { s1: camAt([960, 560], 960, 590, 1.05), s2: camAt([3330, 640], 960, 600, 0.95), s3: camAt([5820, 700], 960, 600, 0.9) };

const vaultO = G(3280, 560);
// [constructor, X, Y, opts, label, labelClass]  (or [constructor, {u,v}, null, ...])
const items = [
  // ---- screen 1 · rounding cutter, with kit person / safe for scale
  [O.person, 260, 720, { id: "ps", role: "signer" }, "person"],
  [X.roundCutter, 820, 650, { id: "rc", dir: "down", pileL: 2 }, "取整刀"],
  [O.safe, 1560, 470, { id: "safe1" }, "safe"],
  [X.roundCutter, 1500, 930, { id: "rcA", state: "attacker", bladeUp: false, load: false, scale: 0.8 }, "attacker · scale 0.8", "lab-rs"],
  // ---- screen 2 · vault + share dispenser, certificates, burn box
  [O.safe, vaultO, null, { id: "vault", plate: "ERC-4626" }, "safe · 金库"],
  [X.shareDispenser, X.besideSafe(vaultO), null, { id: "sd", value: 0, tickets: 3 }, "份额出票机"],
  [X.burnBox, 3960, 700, { id: "bx", cards: 1 }, "死地址投递箱"],
  [X.shareCert, 2700, 980, { id: "c1", n: 4, scale: 1.3 }, "凭证 · 一叠 ×1.3"],
  [X.shareCert, 2930, 1010, { id: "c2", stand: true, scale: 1.4 }, "立放 ×1.4"],
  [X.shareCert, 3150, 1050, { id: "c3", stand: true, scale: 1.4, ghost: true }, "虚拟份额"],
  [X.shareCert, 3360, 1090, { id: "c4", scale: 1.4, state: "attacker" }, "attacker", "lab-rs"],
  [O.person, 3640, 1080, { id: "pa", state: "attacker" }, "person", "lab-rs"],
  // ---- screen 3 · precision rulers, pizza
  [X.decimalRuler, 5250, 500, { id: "r6", places: 6, chain: "TRON" }, "精度尺 · 6 位"],
  [X.decimalRuler, 5350, 800, { id: "r18", places: 18, chain: "ETH" }, "精度尺 · 18 位"],
  [X.pizza, 6150, 560, { id: "pz8" }, "披萨 · 8 块"],
  [X.pizza, 6300, 1000, { id: "pz1", slices: 1, box: false }, "slices: 1 · 无盒"],
  [O.person, 5000, 1060, { id: "pe", role: "engineer" }, "person"],
];

const built = items.map(([fn, Xg, Yg, opts, label, cls]) => {
  const o = Yg == null ? Xg : G(Xg, Yg);
  const Y = -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;
  return { Y, opts, label, cls, r: fn(o, opts) };
});
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
let labels = built.map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm")).join("");
const A = Object.fromEntries(built.map((b) => [b.opts.id, b.r.anchors]));
labels += wlab("lb-trL", A.rc.trayL, "协议", "lab-cs lab-sm", "t") + wlab("lb-trR", A.rc.trayR, "调用者", "lab-rs lab-sm", "t");
labels += wlab("lb-lv", A.rc.leverUp, "拨杆", "lab-sm hide", "l");

labels += wlab("lb-dot", A.r18.cells[16], "小数点右移 12 格", "lab-r lab-sm hide", "t");
labels += wlab("lb-meta", A.pz8.lid, "比喻", "lab-g lab-sm", "c");

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 9000, v0: -4000, v1: 6000 }) + objSvg, [-800, -1200, 8000, 3800]);
const titles = [["1 / 3", "取整刀"], ["2 / 3", "金库 · 份额凭证 · 死地址"], ["3 / 3", "精度刻度尺 · 披萨"]];
const titleHtml = titles.map(([n, t], i) => `<div class="ttl${i ? " hide" : ""}" id="ttl-${i}"><span class="ttl-n">${n}</span>${t}</div>`).join("");
const sections = ["一次只错一点点", "五类缺陷", "舍入方向", "金库通胀", "守住余数"];

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
      <div id="kit-sub">ep06 补充拟物物件 · 与 kit 原物件比例对照</div>
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
      // ---- screen 1 · cutter: lever, feed, cut → protocol tray, reset, lever, cut → caller tray
      KITX06.feed(tl, "rc", 0.3, 0.6);
      KITX06.lever(tl, "rc", 0.5, "up");
      KITX06.cut(tl, "rc", 1.2, "L");
      KITX06.chipReset(tl, "rc", 2.2);
      KITX06.lever(tl, "rc", 2.2, "down");
      KITX06.cut(tl, "rc", 2.6, "R");
      // ---- screen 2 · vault door, counter, tickets, burn
      KIT.cam(tl, 3.7, CAMS.s2, 0.8);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 3.9, 0.3);
      KIT.door(tl, "vault", 4.4, 105, 1.0);
      KITX06.tally(tl, "sd", 4.6, 1.4, 0, 1000);
      KITX06.issue(tl, "sd", 5.0, 0); KITX06.issue(tl, "sd", 5.7, 1); KITX06.issue(tl, "sd", 6.4, 2);
      KITX06.burn(tl, "bx", 5.4, 0);
      KITX06.carry(tl, "c1-c-3", 6.0, 0, 70, 0, 0.6, 30);
      // ---- screen 3 · rulers, pizza
      KIT.cam(tl, 7.7, CAMS.s3, 0.8);
      KIT.swap(tl, "#ttl-1", "#ttl-2", 7.9, 0.3);
      KITX06.slider(tl, "r6", 8.6, 8.5, 0.8);
      KITX06.slider(tl, "r18", 8.6, 2.5, 0.8);
      KITX06.shiftDot(tl, "r18", 9.0, 12, { flash: true });
      KIT.pop(tl, "#lb-dot", 9.9);
      KITX06.serve(tl, "pz8", 1, 9.2, 70);
      KITX06.serve(tl, "pz1", 0, 9.6, 40);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
