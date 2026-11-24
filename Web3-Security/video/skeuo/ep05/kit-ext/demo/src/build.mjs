// Builds compositions/showcase.html — ep05 kit-ext showcase (3 screens, 12 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as X from "../../objects-ext.mjs";
import { pills } from "../../../../kit/pills.mjs";

const CAMS = { s1: camAt([860, 660], 960, 620, 0.9), s2: camAt([3060, 620], 960, 600, 0.8), s3: camAt([5640, 760], 960, 610, 0.8) };

const panelBtns = [
  { name: "mint", guard: "none" },
  { name: "initialize", guard: "card", rd: "off" },
  { name: "kill", guard: "broken" },
  { name: "upgrade", guard: "none" },
  { name: "pause", guard: "card" },
];
// [constructor, X, Y, opts, label, labelClass]
const items = [
  // ---- screen 1 · button console + keycards, with kit person / safe for scale
  [O.person, 140, 640, { id: "ps", role: "signer" }, "person"],
  [O.safe, 470, 560, { id: "safe", plate: "VAULT" }, "safe"],
  [X.funcPanel, 1080, 600, { id: "fp", buttons: panelBtns, lamps: true }, "函数按钮台 funcPanel"],
  [X.keycard, 330, 980, { id: "kU", role: "upgrader", scale: 1.5 }, "UPGRADER"],
  [X.keycard, 520, 1010, { id: "kP", role: "param", scale: 1.5 }, "PARAM_ADMIN"],
  [X.keycard, 710, 1040, { id: "kS", role: "pauser", scale: 1.5 }, "PAUSER"],
  [X.keycard, 900, 1070, { id: "kM", role: "minter", scale: 1.5 }, "MINTER"],
  [X.keycard, 1110, 1090, { id: "k0", blank: true, scale: 1.5 }, "blank · 0x0"],
  [X.keycard, 1330, 1110, { id: "kA", state: "attacker", pose: "flat", scale: 1.5 }, "attacker · 平放", "lab-rs"],
  [O.person, 1560, 1000, { id: "pe", role: "engineer" }, "person"],
  [X.keycard, 1640, 1080, { id: "k1", role: "upgrader", lanyard: false }, "原尺寸"],
  // ---- screen 2 · TRON account safe + threshold meter
  [O.person, 2000, 780, { id: "pv", role: "signer" }, "person"],
  [O.safe, 2300, 560, { id: "safe2", plate: "SAFE" }, "kit safe"],
  [X.accountSafe, 2880, 600, { id: "acct", inserted: ["active-0", "witness-0"] }, "账户门禁柜 accountSafe"],
  [X.thresholdMeter, 3500, 720, { id: "tm", max: 5, th: 3, pipe: 120 }, "阈值刻度柱"],
  [X.accountSafe, 3900, 720, { id: "acctX", owners: "attacker", inserted: true }, "owners: attacker", "lab-rs"],
  // ---- screen 3 · role board, ronin board, ice
  [X.roleBoard, 5050, 560, { id: "rb", empty: [0] }, "角色门卡挂板 roleBoard"],
  [X.roleBoard, 5900, 560, { id: "rk", hooks: 9, group: [0, 1, 2, 3] }, "hooks: 9 · Ronin"],
  [O.hotWallet, 5200, 1080, { id: "hw" }, "冰封 · up"],
  [O.person, 5560, 1120, { id: "pf", role: "signer" }, "person"],
  [O.safe, 6150, 1080, { id: "safe3", plate: "VAULT" }, "冰封 · drop"],
];
const ices = [
  [X.iceShell, 5200, 1080, { id: "iceA", box: [-110, 110, -95, 95, 0, 236], on: false }],
  [X.iceShell, 6150, 1080, { id: "iceB", box: [-160, 160, -135, 135, 0, 340], on: false, seed: "b" }],
];

const built = items.map(([fn, Xg, Yg, opts, label, cls]) => ({ Y: Yg, opts, label, cls, r: fn(G(Xg, Yg), opts) }));
const ib = ices.map(([fn, Xg, Yg, opts]) => ({ Y: Yg + 0.5, opts, r: fn(G(Xg, Yg), opts) }));
const objSvg = built.concat(ib).sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
let labels = built.map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm")).join("");
const A = Object.fromEntries(built.map((b) => [b.opts.id, b.r.anchors]));
labels += wlab("lb-ok", A.fp.readers[1], "刷卡 · 绿", "lab-gs lab-sm hide", "t");

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 9000, v0: -4000, v1: 6000 }) + objSvg, [-1000, -1200, 8200, 3800]);
const titles = [["1 / 3", "按钮台与门卡"], ["2 / 3", "账户门禁柜与阈值"], ["3 / 3", "挂板与冰封"]];
const titleHtml = titles.map(([n, t], i) => `<div class="ttl${i ? " hide" : ""}" id="ttl-${i}"><span class="ttl-n">${n}</span>${t}</div>`).join("");
const sections = ["没人初始化", "门没装锁", "借出的权限", "账户层权限", "慢升级快暂停"];

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-wrap { position: absolute; left: 56px; top: 34px; }
    .ttl { position: absolute; left: 0; top: 0; white-space: nowrap; font-size: 40px; font-weight: 900; }
    .ttl-n { display: inline-block; margin-right: 16px; font-family: "JetBrains Mono", monospace; font-size: 28px; font-weight: 700; color: #ffffff;
      background: #1d93ba; border-radius: 8px; padding: 2px 12px 4px; vertical-align: 6px; }
    #kit-sub { position: absolute; left: 56px; top: 96px; font-size: 28px; font-weight: 700; color: #6d685e; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="showcase" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div id="ttl-wrap">${titleHtml}</div>
      <div id="kit-sub">ep05 补充拟物物件 · 与 kit 原物件比例对照</div>
      ${pills(2, { sections })}
    </div>
  </div>
  <script>
${runtimeJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const K = window.KITX05;
      KIT.camSet(tl, CAMS.s1);
      // ---- screen 1: guard on mint, swipe ok, press; initialize lid opens + press; upgrade welded; pause swipe fails
      K.guard(tl, "fp", 0, 0.6, "card");
      K.swipe(tl, "fp", 0, 1.3, true);
      K.press(tl, "fp", 0, 1.9);
      K.lid(tl, "fp", 1, 0.7, 100, 0.6);
      K.press(tl, "fp", 1, 1.5, { hold: true });
      KIT.led(tl, "fp-lamp-1", 1.6, "green");
      K.swipe(tl, "fp", 1, 1.0, true);
      KIT.pop(tl, "#lb-ok", 1.5);
      K.guard(tl, "fp", 3, 2.0, "plate", 0.5);
      K.swipe(tl, "fp", 4, 2.4, false);
      K.press(tl, "fp", 2, 2.8);
      // ---- screen 2
      KIT.cam(tl, 3.7, CAMS.s2, 0.7);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 3.8, 0.3);
      K.ring(tl, "acct", "owner", 4.5, true);
      K.keyIn(tl, "acct", "owner-0", 4.6);
      K.fill(tl, "tm", 5.0, 2, 0.5);
      K.keyIn(tl, "acct", "owner-1", 5.4);
      K.fill(tl, "tm", 5.8, 3, 0.4);
      KIT.door(tl, "acct", 6.4, 100, 0.9);
      K.coinIn(tl, "acct", 6.2, 3, 0.3);
      K.cores(tl, "acctX", 4.6, "normal");
      K.cores(tl, "acctX", 5.0, "attacker");
      K.gate(tl, "acctX", 5.8, true);
      K.coinIn(tl, "acctX", 6.4, 2, 0.3);
      K.coinOut(tl, "acctX", 7.0);
      // ---- screen 3
      KIT.cam(tl, 7.7, CAMS.s3, 0.7);
      KIT.swap(tl, "#ttl-1", "#ttl-2", 7.8, 0.3);
      K.hang(tl, "rb", 0, 8.6);
      K.fade(tl, "#rk-grpf", 8.4, 0.25, 0.2); K.fade(tl, "#rk-grpf", 8.7, 1, 0.2);
      K.freeze(tl, "iceA", 8.6, 1.0, "up");
      K.freeze(tl, "iceB", 9.6, 0.8, "drop");
      K.moveUV(tl, "rk-grp", 10.4, -30, 70, 30, 0.7, 30);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
