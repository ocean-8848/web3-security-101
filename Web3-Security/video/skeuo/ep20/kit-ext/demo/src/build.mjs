// Builds compositions/showcase.html — ep20 kit-ext showcase (1 screen, 6 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as X from "../../objects-ext.mjs";

const CAMS = { s1: camAt([640, 470], 960, 640, 1.55) };
const Y_ = (o) => -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;

const items = [];
// dnsSignpost between a real server (right front, green) and a clone (left back, red); person for scale; attacker / broken / 0.6 variants
items.push([X.dnsSignpost, G(560, 520), { id: "sign" }, "dnsSignpost · dir 1"]);
items.push([O.rack, G(820, 560), { id: "real", tag: "真服务器" }, "真服务器"]);
items.push([O.rack, G(300, 420), { id: "clone", tag: "克隆站", state: "attacker", leds: ["red", "red", "red"] }, "克隆站"]);
items.push([O.person, G(470, 700), { id: "ps", role: "signer" }, "person"]);
items.push([X.dnsSignpost, G(1040, 380), { id: "signA", state: "attacker", dir: -1, scale: 0.6 }, "attacker · dir −1 · 0.6", "lab-r"]);
items.push([X.dnsSignpost, G(1060, 700), { id: "signB", state: "broken", scale: 0.6 }, "broken", "lab-r"]);

const built = items.map(([fn, o, opts, label, cls]) => ({ Y: Y_(o), o, opts, label, cls, r: fn(o, opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
const labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm", "b")).join("");
const tipDots = ["tip", "tipFlip", "dns", "arm"].map((k, i) => { const q = built[0].r.anchors[k]; return `<circle cx="${q[0]}" cy="${q[1]}" r="4" fill="${["#e0453a", "#1f9d55", "#2aa3c9", "#f0c04a"][i]}"/>`; }).join("");

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 4000, v0: -3000, v1: 3000 }) + objSvg + tipDots, [-600, -1000, 3000, 2400]);
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
      <div class="ttl" id="ttl-0">域名路牌 · 箭头牌扳向克隆站</div>
      <div id="kit-sub">ep20 补充拟物物件 · 与 rack / person 比例对照（锚点：红 tip · 绿 tipFlip · 青 dns · 黄 arm）</div>
    </div>
  </div>
  <script>
${runtimeJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      KIT.camSet(tl, CAMS.s1);
      KITX20.lit(tl, "sign", 0.6, true);
      KITX20.lit(tl, "sign", 1.4, false);
      KITX20.hijack(tl, "sign", 2.0, 1.2);
      KITX20.restore(tl, "signA", 2.0, 1.2);
      KITX20.turn(tl, "signB", 2.0, 90, 0.8);
      tl.to({}, { duration: 0.01 }, 5.9);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
