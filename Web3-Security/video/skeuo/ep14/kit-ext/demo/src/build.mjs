// Builds compositions/showcase.html — ep14 kit-ext showcase (2 screens, 8 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as X from "../../objects-ext.mjs";

const CAMS = { s1: camAt([700, 470], 960, 620, 2.0), s2: camAt([2800, 500], 960, 640, 1.6) };
const Y_ = (o) => -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;

const items = [];
// ---- screen 1 · answer sheet fills row by row, enters the grading machine, green lamp; attacker sheet (row 5 all filled) still ok
items.push([X.answerSheet, G(470, 520), { id: "sh1", blank: true }, "答题卡 · normal"]);
items.push([X.gradingMachine, G(760, 470), { id: "gm1" }, "阅卷机"]);
items.push([O.person, G(330, 600), { id: "ps1", role: "engineer", scale: 0.7 }, "person 0.7"]);
items.push([X.answerSheet, G(1010, 560), { id: "sh2", scale: 0.8 }, "scale 0.8 → attacker", "lab-r"]);
// ---- screen 2 · verifier (attacker ring, still green), broken one
items.push([X.gradingMachine, G(2560, 500), { id: "gmA", title: "验证器", state: "attacker", fed: true, screen: "满足电路" }, "attacker · 判对了错的东西"]);
items.push([X.gradingMachine, G(3000, 500), { id: "gmB", state: "broken", scale: 0.8 }, "broken 0.8"]);
items.push([X.answerSheet, G(2780, 640), { id: "sh3", state: "broken", scale: 0.7 }, "broken", "lab-r"]);

const built = items.map(([fn, o, opts, label, cls]) => ({ Y: Y_(o), o, opts, label, cls, r: fn(o, opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
const labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm", "b")).join("");

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 6000, v0: -4000, v1: 5000 }) + objSvg, [-600, -1000, 5200, 3000]);
const titles = ["答题卡 + 阅卷机 · 逐行涂格 / 读入 / 判定灯", "验证器 attacker（照样绿灯）· broken"];
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
      <div id="kit-sub">ep14 补充拟物物件 · 与 person 比例对照</div>
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
      KITX14.sheetFill(tl, "sh1", 0.5);
      KITX14.card(tl, "gm1", 1.8, true, 0.4);
      KITX14.grade(tl, "gm1", 2.4, "green");
      KITX14.sheetMark(tl, "sh1", 3.0, "ok");
      KITX14.sheetExtra(tl, "sh2", 1.6, true);
      KITX14.sheetMark(tl, "sh2", 2.4, "ok");
      // ---- screen 2
      KIT.cam(tl, 4.0, CAMS.s2, 0.8);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 4.2, 0.3);
      KITX14.grade(tl, "gmA", 5.0, "green", "满足电路");
      KITX14.ring(tl, "gmA", 6.2, false);
      KITX14.lamp(tl, "gmA", 6.2, "red");
      KITX14.scr(tl, "gmA", 6.2, "不通过", "red");
      KITX14.machineBad(tl, "gmB", 6.4, false);
      KITX14.sheetBad(tl, "sh3", 6.4, false);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
