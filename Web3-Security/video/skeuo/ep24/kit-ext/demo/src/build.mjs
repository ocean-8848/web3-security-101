// Builds compositions/showcase.html — ep24 kit-ext showcase (1 screen, 6 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as E3 from "../../../../ep03/kit-ext/objects-ext.mjs";
import * as E9 from "../../../../ep09/kit-ext/objects-ext.mjs";
import * as X from "../../objects-ext.mjs";

const CAMS = { s1: camAt([580, 500], 960, 640, 1.9) };
const Y_ = (o) => -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;

const items = [];
// funnel + commitBox for scale; three shakers: full (shakes), 32-byte label (empties), broken preset 0.7; person for scale
items.push([E3.hashFunnel, G(300, 560), { id: "fn" }, "hashFunnel"]);
items.push([X.saltShaker, G(440, 500), { id: "s1" }, "saltShaker"]);
items.push([X.saltShaker, G(560, 560), { id: "s2", label: "盐 · 32 字节" }, "label 盐 · 32 字节"]);
items.push([X.saltShaker, G(680, 500), { id: "s3", state: "broken", scale: 0.7 }, "broken 0.7", "lab-r"]);
items.push([E9.commitBox, G(830, 470), { id: "cb", scale: 0.7 }, "commitBox 0.7"]);
items.push([O.person, G(470, 690), { id: "ps", role: "signer", scale: 0.55 }, "person 0.55"]);

const built = items.map(([fn, o, opts, label, cls]) => ({ Y: Y_(o), o, opts, label, cls, r: fn(o, opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
const labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm", "b")).join("");
const dot = (q, c) => `<circle cx="${q[0]}" cy="${q[1]}" r="2.2" fill="${c}"/>`;
const A = Object.fromEntries(built.map((b) => [b.opts.id, b.r.anchors]));
const dots = ["s1", "s2", "s3"].map((k) => dot(A[k].spout, "#e0453a") + dot(A[k].center, "#1f9d55") + dot(A[k].label, "#2aa3c9")).join("");

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
      <div class="ttl" id="ttl-0">盐罐 · 撒盐 · 删盐</div>
      <div id="kit-sub">ep24 补充拟物物件 · 与 hashFunnel / commitBox / person 比例对照（锚点：红 spout · 绿 center · 蓝 label）</div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E3.runtimeExtJs()}
${E9.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      KIT.camSet(tl, CAMS.s1);
      KITX24.capLift(tl, "s1", 0.6, true);
      KITX24.capLift(tl, "s1", 1.3, false);
      KITX24.shake(tl, "s1", 1.8, [-60, -30]);
      KITX24.shake(tl, "s1", 2.5, [-60, -30]);
      KITX24.empty(tl, "s2", 3.0);
      tl.to({}, { duration: 0.01 }, 5.9);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
