// Builds compositions/showcase.html — ep09 kit-ext showcase (3 screens, 15 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as E8 from "../../../../ep08/kit-ext/objects-ext.mjs";
import * as X from "../../objects-ext.mjs";

const CAMS = { s1: camAt([960, 640], 960, 600, 1.2), s2: camAt([3600, 660], 960, 600, 1.15), s3: camAt([5860, 640], 960, 600, 1.2) };
const Y_ = (o) => -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;

const items = [];
// ---- screen 1 · cheque: signed, five fields filled, copies slide out and turn red, one slot goes bad; attacker / broken presets
items.push([O.person, G(380, 900), { id: "ps1", role: "signer" }, "person"]);
items.push([X.cheque, G(820, 820), { id: "chq", scale: 2.3, signed: false }, "支票 · 签名消息"]);
items.push([X.cheque, G(1400, 560), { id: "chqA", state: "attacker", scale: 1.3, amount: "领取" }, "attacker · 被重放", "lab-rs"]);
items.push([X.cheque, G(1520, 900), { id: "chqB", state: "broken", scale: 1.3, missing: 1, amount: "领取", fields: ["filled", "bad", "filled", "filled", "filled"] }, "broken · 缺链 ID", "lab-r"]);
// ---- screen 2 · rotaWheel: TRON 27 seats ticking one by one, BNB Chain few seats spinning fast
items.push([X.rotaWheel, G(3300, 700), { id: "tron", n: 27, scale: 1.55, plate: "27 座" }, "出块轮值台 · n 27"]);
items.push([X.rotaWheel, G(4060, 600), { id: "bnb", n: 6, scale: 1.05, speed: 3, at: 2 }, "n 6 · 转得快"]);
items.push([O.person, G(4180, 960), { id: "ps2", role: "engineer" }, "person"]);
// ---- screen 3 · commitBox: envelope dropped, red copy bounced, phase two reveal; attacker / broken presets; liqBot for scale
items.push([E8.liqBot, G(5200, 930), { id: "bot", scr: "复制", lamp: true }, "liqBot", "lab-g"]);
items.push([X.commitBox, G(5640, 800), { id: "box", scale: 1.75 }, "提交揭示投标箱"]);
items.push([X.commitBox, G(6260, 560), { id: "boxA", state: "attacker", scale: 1.05 }, "attacker · 名牌空白", "lab-rs"]);
items.push([X.commitBox, G(6380, 900), { id: "boxB", state: "broken", scale: 1.05 }, "broken", "lab-r"]);
items.push([O.person, G(5000, 760), { id: "ps3", role: "signer" }, "person"]);

const built = items.map(([fn, o, opts, label, cls]) => ({ Y: Y_(o), o, opts, label, cls, r: fn(o, opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
const A = Object.fromEntries(built.map((b) => [b.opts.id, b.r.anchors]));
const labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm", "b")).join("");

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 9000, v0: -4000, v1: 6000 }) + objSvg, [-800, -1200, 8600, 3800]);
const titles = ["支票 · 签名消息（五个字段）", "出块轮值台 · TRON 27 座 / 少量座位", "提交揭示投标箱"];
const titleHtml = titles.map((t, i) => `<div class="ttl${i ? " hide" : ""}" id="ttl-${i}">${t}</div>`).join("");
const P = (p) => JSON.stringify(p);

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
      <div id="kit-sub">ep09 补充拟物物件 · 与 person / liqBot 比例对照</div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E8.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      KIT.camSet(tl, CAMS.s1);
      // ---- screen 1
      KITX09.sign(tl, "chq", 0.4, 0.9);
      KITX09.amt(tl, "chq", 1.2, "领取");
      KITX09.fields(tl, "chq", 1.5, ["filled", "filled", "filled", "filled", "filled"], 0.28);
      KITX09.copies(tl, "chq", 3.0, 3, 0.6);
      KITX09.copyRed(tl, "chq", 3.7, true);
      KITX09.field(tl, "chq", 4.0, 1, "bad");
      KITX09.copyTo(tl, "chqA", 1.0, 2, ${P(A.chqA.copies[2].map((v, i) => v + (i ? -40 : 90)))}, 1.0);
      // ---- screen 2
      KIT.cam(tl, 4.8, CAMS.s2, 0.8);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 5.0, 0.3);
      KITX09.tick(tl, "tron", 5.6, 7, 0.42);
      KITX09.spin(tl, "bnb", 5.6, 1.6, 4, 4);
      KITX09.spin(tl, "bnb", 7.6, 1.2, 3, 1);
      KITX09.seat(tl, "tron", 8.9, 7, "red");
      KITX09.seats(tl, "tron", 9.0, "dim", [7], 0.5);
      KITX09.plate(tl, "bnb", 8.6, "少量");
      // ---- screen 3
      KIT.cam(tl, 9.8, CAMS.s3, 0.8);
      KIT.swap(tl, "#ttl-1", "#ttl-2", 10.0, 0.3);
      KITX09.drop(tl, "box", 10.4, 0.7);
      KITX09.copyIn(tl, "box", 11.4, false, 0.9);
      KITX09.copyIn(tl, "boxA", 11.4, true, 0.8);
      KITX08.botScr(tl, "bot", 11.2, "复制", true);
      KITX09.reveal(tl, "box", 12.6);
      KITX09.nameBad(tl, "boxB", 12.8, true);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
