// Builds compositions/showcase.html — ep17 kit-ext showcase (2 screens, 10 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as X from "../../objects-ext.mjs";

const CAMS = { s1: camAt([700, 470], 960, 620, 1.9), s2: camAt([3180, 520], 960, 640, 1.7) };
const Y_ = (o) => -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;

const items = [];
// ---- screen 1 · view window: live traffic → delayed chip → replay (grey + rec + red frame)
items.push([X.viewWindow, G(560, 520), { id: "win1" }, "看街的窗 · live"]);
items.push([O.person, G(400, 640), { id: "ps1", role: "signer", scale: 0.6 }, "person 0.6"]);
items.push([X.viewWindow, G(860, 460), { id: "win2", mode: "delayed", scale: 0.8 }, "delayed · 0.8", "lab-r"]);
items.push([X.viewWindow, G(940, 700), { id: "win3", mode: "replay", scale: 0.8 }, "replay · 0.8", "lab-r"]);
// ---- screen 2 · peer panel: diverse → eclipsed (lamp stays green) → anchored; scaled attacker; kit rpc for size
items.push([X.peerPanel, G(3000, 520), { id: "pp" }, "对等连接插线板 · diverse"]);
items.push([X.peerPanel, G(3420, 420), { id: "ppA", state: "attacker", scale: 0.7, label: "被包围" }, "attacker · 0.7", "lab-rs"]);
items.push([X.peerPanel, G(3420, 680), { id: "ppB", mode: "anchored", scale: 0.7 }, "anchored · 0.7", "lab-r"]);
items.push([O.rpc, G(2720, 640), { id: "rpc1" }, "rpc"]);

const built = items.map(([fn, o, opts, label, cls]) => ({ Y: Y_(o), o, opts, label, cls, r: fn(o, opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
const labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm", "b")).join("");

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 6000, v0: -4000, v1: 5000 }) + objSvg, [-600, -1000, 5200, 3000]);
const titles = ["看街的窗 · 车流 / 延迟 / 录像", "对等连接插线板 · 线缆变红 / 锚点插头"];
const titleHtml = titles.map((t, i) => `<div class="ttl${i ? " hide" : ""}" id="ttl-${i}">${t}</div>`).join("");

const html = `<template>
  <style>
${kitCss()}
    #scene { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-wrap { position: absolute; left: 56px; top: 34px; }
    .ttl { position: absolute; left: 0; top: 0; white-space: nowrap; font-size: 40px; font-weight: 900; }
    #kit-sub { position: absolute; left: 56px; top: 96px; font-size: 28px; font-weight: 700; color: #6d685e; white-space: nowrap; }
  </style>
  <div id="scene" data-composition-id="showcase" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div id="ttl-wrap">${titleHtml}</div>
      <div id="kit-sub">ep17 补充拟物物件 · 与 person / rpc 比例对照</div>
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
      KITX17.winFlow(tl, "win1", 0.3, 1.6, 50);
      KITX17.winMode(tl, "win1", 2.0, "delayed");
      KITX17.winFlow(tl, "win1", 2.0, 1.2, 18);
      KITX17.winMode(tl, "win1", 3.3, "replay");
      KITX17.winFlow(tl, "win2", 0.3, 4, 20);
      KITX17.winMode(tl, "win3", 2.5, "live");
      KITX17.winFlow(tl, "win3", 2.8, 1.6, 50);
      // ---- screen 2
      KIT.cam(tl, 4.6, CAMS.s2, 0.8);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 4.8, 0.3);
      KITX17.peerRed(tl, "pp", 5.8, "all", true, 0.15);
      KITX17.peerMode(tl, "pp", 7.8, "anchored", 0.05);
      KITX17.peerLamp(tl, "ppA", 6.5, "red");
      KITX17.peerMode(tl, "ppB", 6.0, "diverse");
      KITX17.peerMode(tl, "ppB", 7.5, "anchored");
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
