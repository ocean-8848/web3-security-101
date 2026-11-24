// Builds compositions/showcase.html — ep22 kit-ext showcase (1 screen, 6 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as E2 from "../../../../ep02/kit-ext/objects-ext.mjs";
import * as X from "../../objects-ext.mjs";

const CAMS = { s1: camAt([700, 520], 960, 600, 1.45) };
const Y_ = (o) => -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;

const items = [];
// left: victim phone + teal SIM, attacker SIM (red) + flat SIM ready for a slot; right: wrench vs gpuRig, attacker wrench; person for scale
items.push([O.phone, G(260, 470), { id: "ph" }, "phone"]);
items.push([X.simCard, G(420, 520), { id: "simV", tone: "teal" }, "simCard · tone teal"]);
items.push([X.simCard, G(560, 600), { id: "simA", state: "attacker" }, "attacker", "lab-r"]);
items.push([X.simCard, G(380, 700), { id: "simF", stand: false, state: "attacker", label: "新卡" }, "stand false"]);
items.push([X.simCard, G(560, 420), { id: "simB", state: "broken", scale: 0.6 }, "broken 0.6", "lab-r"]);
items.push([O.person, G(700, 700), { id: "ps", role: "signer" }, "person"]);
items.push([E2.gpuRig, G(930, 420), { id: "gpu" }, "gpuRig"]);
items.push([X.wrench, G(950, 640), { id: "wr", scale: 0.9 }, "wrench 0.9"]);
items.push([X.wrench, G(1180, 560), { id: "wrA", state: "attacker", scale: 0.6 }, "attacker 0.6", "lab-r"]);

const built = items.map(([fn, o, opts, label, cls]) => ({ Y: Y_(o), o, opts, label, cls, r: fn(o, opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
const labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm", "b")).join("");
const dot = (q, c) => `<circle cx="${q[0]}" cy="${q[1]}" r="3.5" fill="${c}"/>`;
const A = Object.fromEntries(built.map((b) => [b.opts.id, b.r.anchors]));
const dots = dot(A.simV.chip, "#e0453a") + dot(A.simV.center, "#1f9d55") + dot(A.simF.chip, "#e0453a") + dot(A.wr.head, "#e0453a") + dot(A.wr.center, "#1f9d55");

const world = worldSvg("world-svg", gridSvg({ u0: -2000, u1: 3000, v0: -2000, v1: 3000 }) + objSvg + dots, [-400, -600, 2400, 2000]);
const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    .ttl { position: absolute; left: 56px; top: 34px; white-space: nowrap; font-size: 40px; font-weight: 900; }
    #kit-sub { position: absolute; left: 56px; top: 96px; font-size: 28px; font-weight: 700; color: #6d685e; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="showcase" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div class="ttl" id="ttl-0">SIM 卡 · 芯片闪烁　扳手 vs 算力机</div>
      <div id="kit-sub">ep22 补充拟物物件 · 与 phone / person / gpuRig 比例对照（锚点：红 chip / head · 绿 center）</div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E2.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      KIT.camSet(tl, CAMS.s1);
      KITX22.chipFlash(tl, "simV", 0.8, 3, "teal");
      KITX22.chip(tl, "simA", 2.2, true, "red");
      KITX22.chip(tl, "simF", 2.6, true);
      KITX22.chip(tl, "simV", 3.2, true, "gold");
      tl.to({}, { duration: 0.01 }, 5.9);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
