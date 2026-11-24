// Builds compositions/showcase.html — ep27 kit-ext showcase (1 screen, 6 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as E22 from "../../../../ep22/kit-ext/objects-ext.mjs";
import * as X from "../../objects-ext.mjs";

const CAMS = { s1: camAt([560, 470], 960, 600, 1.8) };
const Y_ = (o) => -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;

const items = [];
// plane 1.0 (wing highlights + teal pulse), plane 0.9 broken preset, plane 0.9 that gets its break mark at runtime; wrench + person for scale
items.push([X.planeModel, G(300, 480), { id: "pl1" }, "planeModel"]);
items.push([X.planeModel, G(620, 400), { id: "pl2", state: "broken", scale: 0.9, label: "broken" }, "broken 0.9", "lab-r"]);
items.push([X.planeModel, G(700, 640), { id: "pl3", scale: 0.9 }, "0.9 · wingBreak"]);
items.push([E22.wrench, G(880, 520), { id: "wr", scale: 0.8 }, "wrench 0.8"]);
items.push([O.person, G(420, 700), { id: "ps", role: "engineer", scale: 0.5 }, "person 0.5"]);

const built = items.map(([fn, o, opts, label, cls]) => ({ Y: Y_(o), o, opts, label, cls, r: fn(o, opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
const labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm", "b")).join("");
const dot = (q, c) => `<circle cx="${q[0]}" cy="${q[1]}" r="2.4" fill="${c}"/>`;
const A = Object.fromEntries(built.map((b) => [b.opts.id, b.r.anchors]));
const dots = ["pl1", "pl2", "pl3"].map((k) => dot(A[k].wingL, "#e0453a") + dot(A[k].wingR, "#e0453a") + dot(A[k].nose, "#1f9d55") + dot(A[k].top, "#2aa3c9")).join("");

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
      <div class="ttl" id="ttl-0">模型飞机 · 机翼标红 · 断口 · 整机高亮</div>
      <div id="kit-sub">ep27 补充拟物物件 · 与 wrench / person 比例对照（锚点：红 wingL/R · 绿 nose · 蓝 top）</div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E22.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      KIT.camSet(tl, CAMS.s1);
      KITX27.planeHi(tl, "pl1", 0.6, 1.2, 2);
      KITX27.wingRed(tl, "pl1", 2.0, "L", true);
      KITX27.wingRed(tl, "pl1", 2.4, "R", true);
      KITX27.wingRed(tl, "pl3", 2.0, "L", true);
      KITX27.wingBreak(tl, "pl3", 2.6, "L", true);
      tl.to({}, { duration: 0.01 }, 5.9);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
