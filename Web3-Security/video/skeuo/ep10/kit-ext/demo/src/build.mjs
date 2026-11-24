// Builds compositions/showcase.html — ep10 kit-ext showcase (2 screens, 10 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as E1 from "../../../../ep01/kit-ext/objects-ext.mjs";
import * as X from "../../objects-ext.mjs";

const CAMS = { s1: camAt([820, 640], 960, 620, 1.25), s2: camAt([3300, 640], 960, 600, 1.15) };
const Y_ = (o) => -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;

const items = [];
// ---- screen 1 · V2 module on its cart: gears turn, owner card written, lever pulled, pushed toward the open maintenance door
items.push([E1.vending, G(1080, 560), { id: "vm", sign: "代理", maintDoor: true, mdoorOpen: 105 }, "vending · 代理"]);
items.push([X.coreModule, G(520, 800), { id: "core", ver: "V2" }, "实现机芯 · V2"]);
items.push([O.person, G(330, 870), { id: "ps1", role: "engineer" }, "person"]);
// ---- screen 2 · states: attacker / broken lever / broken card / green skin / cart:false at impl size (0.45)
items.push([X.coreModule, G(2700, 560), { id: "cA", state: "attacker", scale: 0.9 }, "attacker", "lab-rs"]);
items.push([X.coreModule, G(3080, 560), { id: "cB", state: "broken", ver: "V2", scale: 0.9 }, "broken · 缺拉杆", "lab-r"]);
items.push([X.coreModule, G(3460, 560), { id: "cC", state: "broken", bad: "card", scale: 0.9 }, "broken · 未初始化", "lab-r"]);
items.push([X.coreModule, G(2900, 880), { id: "cG", ver: "修复", skin: "green", owner: "多签", glow: true, scale: 0.9 }, "skin green", "lab-g"]);
items.push([X.coreModule, G(3330, 900), { id: "cS", cart: false, scale: 0.45 }, "cart:false · 0.45"]);
items.push([O.person, G(3700, 900), { id: "ps2", role: "signer" }, "person"]);

const built = items.map(([fn, o, opts, label, cls]) => ({ Y: Y_(o), o, opts, label, cls, r: fn(o, opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
const A = Object.fromEntries(built.map((b) => [b.opts.id, b.r.anchors]));
const labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm", "b")).join("");

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 6000, v0: -4000, v1: 5000 }) + objSvg, [-600, -1000, 5200, 3000]);
const titles = ["实现机芯 · 推车推进维修门", "状态：attacker / broken / 绿色 / 机芯尺寸"];
const titleHtml = titles.map((t, i) => `<div class="ttl${i ? " hide" : ""}" id="ttl-${i}">${t}</div>`).join("");
const P = (p) => JSON.stringify(p);
// push target: the cart's ground point stops just in front of the vending's −u maintenance door
const doorStop = [A.vm.maint[0] - 150, A.vm.maint[1] + 150];

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
      <div id="kit-sub">ep10 补充拟物物件 · 与 vending / person 比例对照</div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      KIT.camSet(tl, CAMS.s1);
      // ---- screen 1
      KITX10.gears(tl, "core", 0.3, 4.2, 2.5);
      KITX10.card(tl, "core", 0.9, "部署者");
      KITX10.pull(tl, "core", 1.4, 0.7);
      KITX10.lever(tl, "core", 2.3, false);
      KITX10.lever(tl, "core", 2.9, true);
      KITX10.push(tl, "core", 3.2, ${P(doorStop)}, 1.2);
      KITX10.gears(tl, "vm", 3.4, 1.2, 1);
      // ---- screen 2
      KIT.cam(tl, 4.8, CAMS.s2, 0.8);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 5.0, 0.3);
      KITX10.leverBad(tl, "cB", 6.0, false);
      KITX10.lever(tl, "cB", 6.0, true);
      KITX10.cardBad(tl, "cC", 6.4, false);
      KITX10.card(tl, "cC", 6.4, "攻击者", "red");
      KITX10.skin(tl, "cA", 6.8, "blue");
      KITX10.plate(tl, "cA", 6.8, "V1");
      KITX10.card(tl, "cA", 6.8, "部署者");
      KITX10.gears(tl, "cG", 5.6, 3.0, 2);
      KITX10.gears(tl, "cS", 5.6, 3.0, 2);
      KITX10.card(tl, "cS", 7.2, "主人", "green");
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
