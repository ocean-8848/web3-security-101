// Builds compositions/showcase.html — ep08 kit-ext showcase (3 screens, 15 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, at, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as E1 from "../../../../ep01/kit-ext/objects-ext.mjs";
import * as X from "../../objects-ext.mjs";

const CAMS = { s1: camAt([1010, 620], 960, 620, 1.2), s2: camAt([3640, 700], 960, 620, 1.15), s3: camAt([5900, 640], 960, 600, 1.1) };
const Y_ = (o) => -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;

const items = [];
// ---- screen 1 · AMM pool: normal swaps → pumped by the attacker; attacker / broken presets for comparison
items.push([O.person, G(330, 930), { id: "atk1", state: "attacker" }, "attacker", "lab-rs"]);
items.push([X.ammPool, G(760, 760), { id: "amm", scale: 1.25 }, "AMM 池 · 现货价"]);
items.push([X.ammPool, G(1360, 560), { id: "ammA", state: "attacker", scale: 0.8 }, "attacker", "lab-rs"]);
items.push([X.ammPool, G(1700, 860), { id: "ammB", state: "broken", scale: 0.8 }, "broken · 不能拿来定价", "lab-r"]);
// ---- screen 2 · TWAP recorder (normal + attacker), a queue of liquidation bots
items.push([X.twapRecorder, G(3080, 640), { id: "tw", scale: 1.7, win: 40, spikeAt: 190 }, "均价记录仪"]);
items.push([X.twapRecorder, G(3980, 520), { id: "twA", state: "attacker", scale: 1.2, off: 120 }, "attacker · 持续抬价", "lab-rs"]);
items.push([X.liqBot, G(3300, 1010), { id: "bq", n: 3, gap: 92 }, "清算机器人 · n 3"]);
items.push([O.person, G(4380, 930), { id: "eng2", role: "engineer" }, "person"]);
// ---- screen 3 · market stall (normal + attacker), one bot grabbing collateral
items.push([X.marketStall, G(5640, 640), { id: "st", scale: 1.2 }, "黄金摊"]);
items.push([X.marketStall, G(6400, 560), { id: "stA", state: "attacker", gold: 4 }, "attacker · 离谱高价", "lab-rs"]);
items.push([X.liqBot, G(5200, 960), { id: "bt", scale: 1.3, lamp: true }, "清算机器人"]);
items.push([E1.vending, G(6620, 980), { id: "vm", sign: "LENDING", scale: 0.7 }, "借贷合约", "lab-g"]);
items.push([O.person, G(5980, 1000), { id: "ps3", role: "signer" }, "person"]);

const built = items.map(([fn, o, opts, label, cls]) => ({ Y: Y_(o), o, opts, label, cls, r: fn(o, opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
const A = Object.fromEntries(built.map((b) => [b.opts.id, b.r.anchors]));
const labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm", "b")).join("");

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 9000, v0: -4000, v1: 6000 }) + objSvg, [-800, -1200, 8600, 3800]);
const titles = ["AMM 池 · 一笔交易推高现货价", "均价记录仪 · 清算机器人", "菜市场黄金摊 · 清算机器人"];
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
      <div id="kit-sub">ep08 补充拟物物件 · 与 person / vending 比例对照</div>
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
      KITX08.poolSwap(tl, "amm", 0.5, "L");
      KITX08.poolLevel(tl, "amm", 0.7, 0.62, 0.48, 0.5);
      KITX08.poolNeedle(tl, "amm", 0.7, -14, 0.5);
      KITX08.poolRead(tl, "amm", 1.0, "1,980");
      KITX08.poolSwap(tl, "amm", 1.4, "R");
      KITX08.poolLevel(tl, "amm", 1.6, 0.55, 0.55, 0.5);
      KITX08.poolNeedle(tl, "amm", 1.6, -6, 0.5);
      KITX08.poolRead(tl, "amm", 1.9, "2,000");
      KITX08.poolPump(tl, "amm", 2.4, { n: 3, gap: 0.45, read: "6,000" });
      // ---- screen 2
      KIT.cam(tl, 4.8, CAMS.s2, 0.8);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 5.0, 0.3);
      KITX08.paper(tl, "tw", 5.0, 150, 4.6);
      KITX08.spike(tl, "tw", 7.0, true, 0.15);
      KITX08.penKick(tl, "tw", 7.0, 34, 0.35);
      KITX08.avg(tl, "tw", 7.2, "2,060", true);
      KITX08.winTo(tl, "tw", 7.7, 112, 0.9);
      KITX08.avg(tl, "tw", 8.6, "2,005");
      KITX08.paper(tl, "twA", 5.0, 150, 4.6);
      KITX08.trail(tl, "twA", 5.6, true, 1.6);
      KITX08.avg(tl, "twA", 7.2, "3,400", true);
      KITX08.botLamp(tl, "bq-0", 5.6, 2.4, 3);
      KITX08.botLamp(tl, "bq-1", 5.9, 2.1, 2.5);
      KITX08.botLamp(tl, "bq-2", 6.2, 1.8, 2);
      KITX01.walk(tl, "bq", 6.0, 1.6, [${JSON.stringify(at(G(3300, 1010), -120, 60, 0))}]);
      KITX08.grab(tl, "bq-0", 7.9);
      KITX08.botScr(tl, "bq-0", 8.3, "$1,500", true);
      // ---- screen 3
      KIT.cam(tl, 9.8, CAMS.s3, 0.8);
      KIT.swap(tl, "#ttl-1", "#ttl-2", 10.0, 0.3);
      KITX08.stallLamp(tl, "st", 10.7, true, 3);
      KITX08.stallPrice(tl, "st", 11.3, "¥ 4800", true);
      KITX08.goldTo(tl, "st", 11.9, 2, 0.9);
      KITX08.botLamp(tl, "bt", 11.0, 2.4, 3);
      KITX08.botScr(tl, "bt", 12.0, "$6,000", true);
      KITX01.walk(tl, "bt", 12.4, 1.2, [${JSON.stringify(at(G(5200, 960), 80, -40, 0))}]);
      KITX08.claw(tl, "bt", 13.0, true, 0.25);
      KITX08.claw(tl, "bt", 13.9, false, 0.15);
      KITX08.stallPrice(tl, "stA", 12.6, "¥ 9999", true);
      KITX08.goldTo(tl, "stA", 13.2, 9, 0.8);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
