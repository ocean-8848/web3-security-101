// Builds compositions/showcase.html — ep13 kit-ext showcase (2 screens, 8 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as X from "../../objects-ext.mjs";

const CAMS = { s1: camAt([700, 450], 960, 620, 2.6), s2: camAt([2850, 470], 960, 620, 1.7) };
const Y_ = (o) => -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;

const items = [];
// ---- screen 1 · passports: cover opens, checks tick / cross, fake stamp, a rejected one; person 0.7 for scale
items.push([X.passport, G(560, 470), { id: "ps0" }, "passport · normal"]);
items.push([X.passport, G(720, 470), { id: "ps1", state: "attacker", title: "系统账户" }, "attacker · 系统账户"]);
items.push([X.passport, G(880, 470), { id: "ps2", scale: 0.7, open: true, checks: ["ok", "ok", "bad"] }, "scale 0.7 · open"]);
items.push([O.person, G(400, 520), { id: "pp", role: "signer", scale: 0.7 }, "person 0.7"]);
// ---- screen 2 · containers: door opens, cargo shows, attacker cargo red, seal turns red; one broken
items.push([X.container, G(2600, 470), { id: "ct0" }, "container · normal"]);
items.push([X.container, G(3050, 400), { id: "ct1", state: "attacker", tone: "teal", label: "BRC-20" }, "attacker · teal"]);
items.push([X.container, G(3060, 620), { id: "ct2", scale: 0.6, state: "broken" }, "broken · 0.6", "lab-r"]);
items.push([O.person, G(2380, 560), { id: "pq", role: "engineer", scale: 0.7 }, "person 0.7"]);

const built = items.map(([fn, o, opts, label, cls]) => ({ Y: Y_(o), o, opts, label, cls, r: fn(o, opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
const labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm", "b")).join("");

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 6000, v0: -4000, v1: 5000 }) + objSvg, [-600, -1000, 5200, 3000]);
const titles = ["账户护照 · 翻开 / 检查格 / 伪造戳 / 拒收", "集装箱 · 开门 / 货物剪影 / 封条"];
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
      <div id="kit-sub">ep13 补充拟物物件 · 与 person 0.7 比例对照</div>
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
      KITX13.cover(tl, "ps0", 0.8);
      KITX13.check(tl, "ps0", 1.6, 0, "ok");
      KITX13.check(tl, "ps0", 1.9, 1, "ok");
      KITX13.check(tl, "ps0", 2.2, 2, "ok");
      KITX13.fake(tl, "ps1", 1.4);
      KITX13.cover(tl, "ps1", 1.8);
      KITX13.check(tl, "ps1", 2.6, 1, "bad");
      KITX13.check(tl, "ps2", 1.2, 2, "ok");
      KIT.broke(tl, "ps1", 3.0, { ghost: 0.3 });
      // ---- screen 2
      KIT.cam(tl, 4.0, CAMS.s2, 0.8);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 4.2, 0.3);
      KITX13.door(tl, "ct0", 5.0);
      KITX13.inside(tl, "ct0", 5.3, true);
      KITX13.seal(tl, "ct0", 6.6, "red");
      KITX13.door(tl, "ct1", 5.4);
      KITX13.inside(tl, "ct1", 5.6, true);
      KIT.fixed(tl, "ct2", 6.4);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
