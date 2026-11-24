// Builds compositions/showcase.html — ep12 kit-ext showcase (2 screens, 8 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as X from "../../objects-ext.mjs";

const CAMS = { s1: camAt([700, 440], 960, 600, 2.2), s2: camAt([2800, 470], 960, 620, 1.6) };
const Y_ = (o) => -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;

const items = [];
// ---- screen 1 · normal tree: proof path lights up, leaf 1 flips red, path turns red, root still shows the green check
items.push([X.merkleTree, G(640, 480), { id: "mt1" }, "Merkle 树 · normal"]);
items.push([O.person, G(400, 560), { id: "ps1", role: "engineer" }, "person"]);
items.push([X.merkleTree, G(930, 430), { id: "mtS", scale: 0.6, path: true }, "scale 0.6 · path"]);
// ---- screen 2 · attacker (forged leaf, check passes) and broken (zero root) side by side
items.push([X.merkleTree, G(2560, 480), { id: "mtA", state: "attacker", path: true }, "attacker · 伪造叶子"]);
items.push([X.merkleTree, G(3060, 480), { id: "mtB", state: "broken" }, "broken · 零值根"]);

const built = items.map(([fn, o, opts, label, cls]) => ({ Y: Y_(o), o, opts, label, cls, r: fn(o, opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
const labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm", "b")).join("");

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 6000, v0: -4000, v1: 5000 }) + objSvg, [-600, -1000, 5200, 3000]);
const titles = ["Merkle 树挂牌架 · 证明路径 / 叶子翻红", "attacker 伪造叶子仍通过 · broken 根是零值"];
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
      <div id="kit-sub">ep12 补充拟物物件 · 与 person 比例对照</div>
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
      KITX12.path(tl, "mt1", 0.8, true, 0.9);
      KITX12.rootState(tl, "mt1", 1.7, "ok");
      KITX12.leaf(tl, "mt1", 2.2, true);
      KITX12.pathTone(tl, "mt1", 2.7, "red");
      KITX12.rootText(tl, "mtS", 2.2, "0x00", "red");
      KITX12.rootState(tl, "mtS", 2.2, "bad");
      // ---- screen 2
      KIT.cam(tl, 4.0, CAMS.s2, 0.8);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 4.2, 0.3);
      KITX12.path(tl, "mtB", 5.2, true, 0.8);
      KITX12.rootState(tl, "mtB", 6.4, "normal");
      KITX12.rootText(tl, "mtB", 6.4, "根");
      KITX12.leaf(tl, "mtA", 6.4, false);
      KITX12.pathTone(tl, "mtA", 6.8, "teal");
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
