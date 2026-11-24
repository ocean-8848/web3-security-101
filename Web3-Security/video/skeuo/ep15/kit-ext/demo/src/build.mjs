// Builds compositions/showcase.html — ep15 kit-ext showcase (2 screens, 8 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, at, f, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as E2 from "../../../../ep02/kit-ext/objects-ext.mjs";
import * as X from "../../objects-ext.mjs";

const CAMS = { s1: camAt([700, 440], 960, 600, 2.1), s2: camAt([2800, 470], 960, 620, 1.7) };
const Y_ = (o) => -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;
const wrap = (o, k, svg) => { const [gx, gy] = at(o); return `<g transform="translate(${f(gx)} ${f(gy)}) scale(${k}) translate(${f(-gx)} ${f(-gy)})">${svg}</g>`; };

const items = [];
// ---- screen 1 · tag drops onto a plate (attacker), plate 1.3 (wrapped) with normal tag → attacker → cleared
const P1 = G(480, 470), P2 = G(800, 480);
items.push([E2.addrPlate, P1, { id: "pl1", text: "热钱包地址" }, "addrPlate + tag attacker（落下）"]);
{ const h = X.delegateTagOn(P1, { id: "tg1", state: "attacker", on: false }); items.push([X.delegateTag, h.o, h.opts]); }
items.push([E2.addrPlate, P2, { id: "pl2", text: "普通地址" }, "plate 1.3（包层）· normal → attacker → cleared", "", 1.3]);
{ const h = X.delegateTagOn(P2, { id: "tg2", plateScale: 1.3 }); items.push([X.delegateTag, h.o, h.opts]); }
items.push([O.person, G(1010, 560), { id: "ps1", role: "signer", scale: 0.7 }, "person 0.7"]);
items.push([X.delegateTag, G(330, 580), { id: "tg3", state: "cleared", scale: 1.4 }, "单独 1.4 · cleared", "lab-r"]);
// ---- screen 2 · pump: nozzle out + level drop; attacker 0.8; broken 0.7
items.push([X.gasPump, G(2560, 470), { id: "gp1" }, "gasPump · normal"]);
items.push([O.person, G(2760, 560), { id: "ps2", role: "engineer", scale: 0.7 }, "person 0.7"]);
items.push([X.gasPump, G(2980, 430), { id: "gp2", state: "attacker", scale: 0.8 }, "attacker 0.8"]);
items.push([X.gasPump, G(3060, 640), { id: "gp3", state: "broken", scale: 0.7 }, "broken 0.7", "lab-r"]);

const built = items.map(([fn, o, opts, label, cls, k]) => {
  const r = fn(o, opts);
  if (k) { const [gx, gy] = at(o); const sc = (q) => [gx + (q[0] - gx) * k, gy + (q[1] - gy) * k]; r.svg = wrap(o, k, r.svg); for (const n of Object.keys(r.anchors)) r.anchors[n] = sc(r.anchors[n]); }
  return { Y: Y_(o), o, opts, label, cls, r };
});
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
const labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm", "b")).join("");
const A = Object.fromEntries(built.map((b) => [b.opts.id, b.r.anchors]));

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 6000, v0: -4000, v1: 5000 }) + objSvg, [-600, -1000, 5200, 3000]);
const titles = ["委托挂牌 · 落下 / 轻摆 / 换状态 / 已清零", "Gas 加油机 · 油枪伸出 / 液位 / attacker / broken"];
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
      <div id="kit-sub">ep15 补充拟物物件 · 与 person 比例对照</div>
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
      KITX15.tagDrop(tl, "tg1", 0.6);
      KITX15.tagState(tl, "tg2", 1.4, "attacker", "恶意合约");
      KITX15.tagPulse(tl, "tg2", 2.2);
      KITX15.tagState(tl, "tg2", 2.8, "cleared");
      KITX15.tagState(tl, "tg3", 1.6, "normal");
      // ---- screen 2
      KIT.cam(tl, 4.0, CAMS.s2, 0.8);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 4.2, 0.3);
      KITX15.pumpNozzle(tl, "gp1", 5.0, ${JSON.stringify(A.ps2.center ?? A.ps2.top)});
      KITX15.pumpLevel(tl, "gp1", 5.7, 0.55);
      KITX15.pumpScr(tl, "gp1", 5.7, "已结算");
      KITX15.pumpState(tl, "gp2", 6.0, "normal");
      KITX15.pumpState(tl, "gp3", 6.2, "normal");
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
