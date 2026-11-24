// Builds compositions/showcase.html — ep11 kit-ext showcase (2 screens, 10 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as E9 from "../../../../ep09/kit-ext/objects-ext.mjs";
import * as X from "../../objects-ext.mjs";

const CAMS = { s1: camAt([760, 470], 960, 620, 1.9), s2: camAt([3220, 560], 960, 640, 1.45) };
const Y_ = (o) => -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;

const items = [];
// ---- screen 1 · snapshot camera facing the ballot box: bulb, flash, shutter, photo slides out and flips; broken one = no snapshot
items.push([X.snapshotCamera, G(560, 520), { id: "snap1" }, "快照相机"]);
items.push([E9.commitBox, G(860, 650), { id: "box", scale: 0.8, name: "投票箱" }, "commitBox 0.8"]);
items.push([O.person, G(380, 660), { id: "ps1", role: "signer" }, "person"]);
items.push([X.snapshotCamera, G(1060, 420), { id: "camB", state: "broken", scale: 0.8 }, "broken · 没有快照", "lab-r"]);
// ---- screen 2 · mint press: 3 keys go in, it mints, limit block drops, breaker lamp red; attacker (red key, overflow); broken (no limit)
items.push([X.mintPress, G(3000, 560), { id: "mp", keys: 3, count: "1000" }, "铸币机 · keys 3"]);
items.push([X.mintPress, G(3560, 470), { id: "mpA", state: "attacker", scale: 0.7 }, "attacker", "lab-rs"]);
items.push([X.mintPress, G(3560, 800), { id: "mpB", state: "broken", scale: 0.7 }, "broken · 没有限额", "lab-r"]);
items.push([O.person, G(2700, 760), { id: "ps2", role: "engineer" }, "person"]);

const built = items.map(([fn, o, opts, label, cls]) => ({ Y: Y_(o), o, opts, label, cls, r: fn(o, opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
const labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm", "b")).join("");

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 6000, v0: -4000, v1: 5000 }) + objSvg, [-600, -1000, 5200, 3000]);
const titles = ["快照相机 · 闪光拍下提案前的区块", "铸币机 · 钥匙 / 铸币 / 限额挡块 / 熔断灯"];
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
      <div id="kit-sub">ep11 补充拟物物件 · 与 commitBox / person 比例对照</div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E9.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      KIT.camSet(tl, CAMS.s1);
      // ---- screen 1
      KITX11.snap(tl, "snap1", 0.8);
      KITX11.lensBad(tl, "camB", 2.8, false);
      KITX11.snap(tl, "camB", 3.0, { dur: 0.8 });
      KITX11.photoText(tl, "camB", 3.0, "区块 N−1");
      // ---- screen 2
      KIT.cam(tl, 4.8, CAMS.s2, 0.8);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 5.0, 0.3);
      KITX11.key(tl, "mp", 5.6, 0);
      KITX11.key(tl, "mp", 5.9, 1);
      KITX11.key(tl, "mp", 6.2, 2, true, true);
      KITX11.mint(tl, "mp", 6.7, 1.6, 2, 0.9);
      KITX11.count(tl, "mp", 7.3, "5000");
      KITX11.limit(tl, "mp", 8.3, true);
      KITX11.lamp(tl, "mp", 8.6, "red");
      KITX11.count(tl, "mp", 8.6, "限额", "red");
      KITX11.mint(tl, "mpA", 5.6, 2.4, 3);
      KITX11.limitBad(tl, "mpB", 7.6, false);
      KITX11.limitShow(tl, "mpB", 7.6, true);
      KITX11.limit(tl, "mpB", 8.2, true);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
