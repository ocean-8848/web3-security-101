// Builds compositions/showcase.html — ep26 kit-ext showcase (1 screen, 6 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as X from "../../objects-ext.mjs";

const CAMS = { s1: camAt([560, 470], 960, 620, 1.9) };
const Y_ = (o) => -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;

const items = [];
// mask 1.0 (circuit flash), mask 0.8 attacker preset, mask 0.8 that moves in front of the phone; phone 0.7-ish and person for scale
items.push([X.faceMask, G(360, 520), { id: "m1" }, "faceMask"]);
items.push([X.faceMask, G(490, 470), { id: "m2", state: "attacker", scale: 0.8, label: "AI 生成" }, "attacker 0.8", "lab-r"]);
items.push([X.faceMask, G(600, 560), { id: "m3", scale: 0.8 }, "0.8 · maskMove"]);
items.push([O.phone, G(760, 470), { id: "ph" }, "phone"]);
items.push([O.person, G(420, 660), { id: "ps", role: "attacker", scale: 0.45 }, "person 0.45"]);

const built = items.map(([fn, o, opts, label, cls]) => ({ Y: Y_(o), o, opts, label, cls, r: fn(o, opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
const labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm", "b")).join("");
const dot = (q, c) => `<circle cx="${q[0]}" cy="${q[1]}" r="2.2" fill="${c}"/>`;
const A = Object.fromEntries(built.map((b) => [b.opts.id, b.r.anchors]));
const dots = ["m1", "m2", "m3"].map((k) => dot(A[k].mask, "#e0453a") + dot(A[k].plate, "#1f9d55") + dot(A[k].top, "#2aa3c9")).join("");
// m3 → in front of the phone screen
const D3 = [A.ph.screen[0] - A.m3.mask[0] - 20, A.ph.screen[1] - A.m3.mask[1] + 10];

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
      <div class="ttl" id="ttl-0">换脸面具 · 电路纹闪 · 贴到屏幕前 · 红描边</div>
      <div id="kit-sub">ep26 补充拟物物件 · 与 phone / person 比例对照（锚点：红 mask · 绿 plate · 蓝 top）</div>
    </div>
  </div>
  <script>
${runtimeJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      KIT.camSet(tl, CAMS.s1);
      KITX26.circuit(tl, "m1", 0.6, 1.2, 2);
      KITX26.maskMove(tl, "m3", 1.8, ${JSON.stringify(D3)}, 1.0);
      KITX26.maskRed(tl, "m3", 3.0, true);
      KITX26.circuit(tl, "m3", 3.3, 0.9);
      tl.to({}, { duration: 0.01 }, 5.9);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
