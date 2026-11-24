// Builds compositions/showcase.html — ep16 kit-ext showcase (2 screens, 10 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as E7 from "../../../../ep07/kit-ext/objects-ext.mjs";
import * as X from "../../objects-ext.mjs";

const CAMS = { s1: camAt([700, 470], 960, 640, 1.7), s2: camAt([3150, 520], 960, 650, 1.35) };
const Y_ = (o) => -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;

const items = [];
// ---- screen 1 · finality signal: pending → normal (finalized green) → blink; broken (rolled back); scale 0.7
items.push([X.finalitySignal, G(480, 560), { id: "sg1", state: "pending" }, "pending → normal"]);
items.push([X.finalitySignal, G(760, 520), { id: "sg2" }, "normal → broken"]);
items.push([X.finalitySignal, G(1000, 560), { id: "sg3", state: "broken", scale: 0.7 }, "broken · 0.7", "lab-r"]);
items.push([E7.dispatchDesk, G(700, 760), { id: "desk", scale: 0.8 }, "dispatchDesk 0.8"]);
items.push([O.person, G(300, 700), { id: "ps1", role: "signer" }, "person"]);
// ---- screen 2 · fork switch at the fork: normal → thrown; reorg; broken
const SW = G(3000, 560);
items.push([X.forkSwitch, SW, { id: "sw" }, "扳道器"]);
const swA = X.forkSwitch(SW, { id: "tmp" }).anchors;
items.push([O.chain, G(swA.branchA[0] + 190, swA.branchA[1] - 40), { id: "chA", n: 2 }, ""]);
items.push([O.chain, G(swA.branchB[0] + 190, swA.branchB[1] + 40), { id: "chB", n: 2, state: "attacker" }, ""]);
items.push([X.forkSwitch, G(3520, 430), { id: "swR", state: "reorg", scale: 0.8 }, "reorg · 0.8", "lab-r"]);
items.push([X.forkSwitch, G(3560, 760), { id: "swB", state: "broken", scale: 0.8 }, "broken · 0.8", "lab-r"]);
items.push([O.person, G(2700, 720), { id: "ps2", role: "engineer" }, "person"]);

const built = items.map(([fn, o, opts, label, cls]) => ({ Y: Y_(o), o, opts, label, cls, r: fn(o, opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
const labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm", "b")).join("");

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 6000, v0: -4000, v1: 5000 }) + objSvg, [-600, -1000, 5200, 3000]);
const titles = ["最终性信号柱 · unsafe / safe / finalized", "道岔扳道器 · 扳杆 / 方向牌 / 灯"];
const titleHtml = titles.map((t, i) => `<div class="ttl${i ? " hide" : ""}" id="ttl-${i}">${t}</div>`).join("");

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-wrap { position: absolute; left: 56px; top: 34px; }
    .ttl { position: absolute; left: 0; top: 0; white-space: nowrap; font-size: 40px; font-weight: 900; }
    #kit-sub { position: absolute; left: 56px; top: 96px; font-size: 28px; font-weight: 700; color: #6d685e; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="showcase" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div id="ttl-wrap">${titleHtml}</div>
      <div id="kit-sub">ep16 补充拟物物件 · 与 dispatchDesk / person / chain 比例对照</div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E7.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      KIT.camSet(tl, CAMS.s1);
      // ---- screen 1
      KITX16.sig(tl, "sg1", 0.8, -1, 0.3);
      KITX16.sig(tl, "sg1", 1.4, 2, 0.9);
      KITX16.sigBlink(tl, "sg1", 2.6, 2, 2, 0.8);
      KITX16.sigBad(tl, "sg2", 1.6, true);
      KITX16.sigBad(tl, "sg3", 2.4, false);
      // ---- screen 2
      KIT.cam(tl, 4.4, CAMS.s2, 0.8);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 4.6, 0.3);
      KITX16.flip(tl, "sw", 5.8, true);
      KITX16.flip(tl, "swR", 6.0, false);
      KITX16.swBad(tl, "swB", 7.6, false);
      KITX16.flip(tl, "sw", 8.2, false);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.mkdirSync(new URL("../compositions/", import.meta.url), { recursive: true });
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
