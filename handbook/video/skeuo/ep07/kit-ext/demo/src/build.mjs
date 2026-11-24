// Builds compositions/showcase.html — ep07 kit-ext showcase (3 screens, 15 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, at, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as E1 from "../../../../ep01/kit-ext/objects-ext.mjs";
import * as X from "../../objects-ext.mjs";

const CAMS = { s1: camAt([980, 640], 960, 600, 0.95), s2: camAt([3560, 700], 960, 610, 0.92), s3: camAt([5640, 560], 960, 680, 0.95) };
const Y_ = (o) => -o.u * Math.sin(35 * Math.PI / 180) * 0.5 + o.v * Math.cos(35 * Math.PI / 180) * 0.5;

// ---- screen 1 · vending → pipe → empty lot, desk, tags, parcel
const vmO = G(470, 560), lotO = G(1280, 640);
const items = [
  [O.person, G(170, 820), { id: "ps1", role: "signer" }, "person"],
  [E1.vending, vmO, { id: "vm", sign: "OUR CONTRACT" }, "vending · 我们的合约"],
  [O.safe, G(1730, 330), { id: "sf" }, "safe"],
  [X.emptyLot, lotO, { id: "lot" }, "荒地 · 无代码地址"],
  [X.dispatchDesk, G(820, 900), { id: "dk", shown: 2, entries: ["+ 收款", "+ 发货", { text: "+ 转账", kind: "ghost" }, "+ 退款"] }, "发货登记台"],
  [X.parcel, G(560, 960), { id: "pc" }, null],
  [X.returnTag, G(1180, 1000), { id: "tgA", face: "ok", scale: 1.7 }, "回执 · true", "lab-gs"],
  [X.returnTag, G(1370, 1040), { id: "tgB", face: "false", scale: 1.7 }, "回执 · false", "lab-rs"],
  [X.returnTag, G(1560, 1080), { id: "tgC", face: "empty", scale: 1.7 }, "回执 · 空", "lab-g"],
  [X.emptyLot, G(1830, 860), { id: "lot0", zero: true, w: 180, d: 140, scale: 0.8 }, "zero · scale 0.8", "lab-g"],
];
// ---- screen 2 · eight odd coins, scale, toll clip on a pipe
const kinds = X.COIN_KINDS, names = ["不返回值", "成功报 false", "收税", "变基", "冻结", "可暂停", "转账钩子", "可升级"];
kinds.forEach((k, i) => items.push([X.oddCoin, G(2860 + i * 160, 420 + i * 18), { id: "c" + i, kind: k, num: i + 1, icon: i < 4, scale: 1.25 }, names[i], i % 2 ? "lab-sm lowlab" : ""]));
items.push([X.oddCoin, G(2700, 760), { id: "cp", kind: "plain" }, "标准币"]);
items.push([X.oddCoin, G(4280, 760), { id: "ca", kind: "mute", state: "attacker" }, "attacker", "lab-rs"]);
items.push([X.scale, G(3060, 960), { id: "sc", before: null, after: null, unit: "" }, "到账台秤"]);
const pipeO = G(3420, 1010);
items.push([E1.pipe, pipeO, { id: "pp", pts: [[-160, 0, 60], [220, 0, 60]], flow: true, flowColor: "#f0c04a" }, null]);
items.push([X.tollClip, pipeO, { id: "tc", z: 60, rate: 0.02 }, "过路收费夹"]);
items.push([O.person, G(4150, 1060), { id: "ps2", role: "engineer" }, "person"]);
// ---- screen 3 · auction stand, bidders, parcel stack
const aucO = G(5420, 500);
items.push([X.auctionStand, aucO, { id: "auc", name: "A", amount: "10 ETH" }, "拍卖台"]);
items.push([E1.miniVend, G(5000, 860), { id: "mvA", kind: "attacker" }, "A · 拒收合约", "lab-rs"]);
items.push([O.person, G(5820, 900), { id: "pB", role: "engineer" }, "B"]);
items.push([O.person, G(6100, 560), { id: "pC", role: "signer" }, "person"]);
items.push([X.parcel, G(6250, 860), { id: "pk", stack: 3 }, "包裹 · stack 3"]);
items.push([X.parcel, G(6470, 900), { id: "pl", state: "lost" }, "lost", "lab-rs"]);
items.push([X.returnTag, G(6440, 650), { id: "tgD", face: "empty", stamp: "ok", scale: 1.7 }, "空回执被盖绿勾", "lab-g"]);

const built = items.map(([fn, o, opts, label, cls]) => ({ Y: Y_(o), o, opts, label, cls, r: fn(o, opts) }));
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
const A = Object.fromEntries(built.map((b) => [b.opts.id, b.r.anchors]));
let labels = built.filter((b) => b.label).map((b) => {
  const low = (b.cls ?? "").includes("lowlab");
  return wlab("lb-" + b.opts.id, low ? [A[b.opts.id].ground[0], A[b.opts.id].ground[1] + 34] : b.r.anchors.top, b.label, (b.cls ?? "").replace("lowlab", "") + " lab-sm", low ? "t" : "b");
}).join("");
labels += wlab("lb-ghost", A.dk.entries[2], "没发生的那一笔", "lab-r lab-sm hide", "l");

// pipe from the vending machine to the lot
const dUV = { u: lotO.u - vmO.u, v: lotO.v - vmO.v };
const p1 = E1.pipe(vmO, { id: "p1", pts: [[100, 10, 70], [dUV.u * 0.5, 10, 70], [dUV.u - 60, dUV.v - 10, 70], [dUV.u - 60, dUV.v - 10, 8]], flow: true });

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 9000, v0: -4000, v1: 6000 }) + objSvg.replace(/(<g id="lot" )/, p1.svg + "$1"), [-800, -1200, 8200, 3800]);
const titles = ["外部调用 · 荒地 · 回执 · 登记台", "怪代币 · 到账台秤 · 过路收费夹", "拍卖台 · 包裹"];
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
      <div id="kit-sub">补充拟物物件 · 与 person / safe / vending 比例对照</div>
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
      KITX01.dash(tl, ["p1-flow"], 0, 4.8, 220);
      KITX07.lotPlate(tl, "lot", 0.4, true, 3);
      KITX01.walk(tl, "pc", 0.6, 1.6, [${JSON.stringify(at(lotO, 50, -50, 8))}]);
      KITX07.tagPop(tl, "tgC", 1.0);
      KITX07.tagStamp(tl, "tgC", 1.7, "ok");
      KITX07.lose(tl, "pc", 2.4, 0.6);
      KITX07.slotFlash(tl, "dk", 2.2, 2);
      KITX07.entry(tl, "dk", 2.6, 2, 0.6);
      KIT.led(tl, "dk-led", 2.6, "red");
      KIT.pop(tl, "#lb-ghost", 3.0);
      KITX07.lotGhost(tl, "lot", 3.3, 0.25, 0.4);
      KITX07.lotGhost(tl, "lot", 3.9, 0.85, 0.4);
      // ---- screen 2
      KIT.cam(tl, 4.8, CAMS.s2, 0.8);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 5.0, 0.3);
      KITX01.dash(tl, ["pp-flow"], 5.0, 4.8, 220);
      for (let i = 0; i < 8; i++) KITX07.numOn(tl, "c" + i, 5.7 + i * 0.12, true);
      for (let i = 4; i < 8; i++) KITX07.iconOn(tl, "c" + i, 6.0 + (i - 4) * 0.25);
      KITX07.coinFlip(tl, "c1", 6.3, 1, 0.9);
      KITX07.breathe(tl, "c3", 6.0, 3.6, 1.2, 0.14);
      KITX07.iconHi(tl, "c2", 6.8, true);
      KITX07.toll(tl, "tc", 6.4); KITX07.toll(tl, "tc", 7.3); KITX07.toll(tl, "tc", 8.2);
      KITX07.pileTo(tl, "sc", 5.9, 5, 0.4);
      KITX07.weigh(tl, "sc", 6.3);
      KITX07.read(tl, "sc", 6.4, "before", 1000, 0.7);
      KITX07.pileTo(tl, "sc", 7.3, 10, 0.4);
      KITX07.weigh(tl, "sc", 7.7);
      KITX07.read(tl, "sc", 7.8, "after", 1098, 0.8);
      KITX07.diff(tl, "sc", 8.7, false, "差 = 98 ≠ 100");
      KITX07.coinScale(tl, "ca", 8.0, 0.8, 0.4);
      KITX07.coinScale(tl, "ca", 8.6, 1, 0.4);
      // ---- screen 3
      KIT.cam(tl, 9.8, CAMS.s3, 0.8);
      KIT.swap(tl, "#ttl-1", "#ttl-2", 10.0, 0.3);
      KITX07.gavel(tl, "auc", 10.8);
      KITX07.refund(tl, "auc", 11.4, "bounce", 0.7);
      KITX07.board(tl, "auc", 12.7, { red: true });
      KITX07.gavel(tl, "auc", 13.1, { blocked: true });
      KITX07.lose(tl, "pk", 13.4, 0.5);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
