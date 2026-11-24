// Builds compositions/showcase.html — ep01 kit-ext showcase (4 screens, 16 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, at, f, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as X from "../../objects-ext.mjs";
import { pills } from "../../../../kit/pills.mjs";

const K = 0.74;
const CAMS = {
  s1: camAt([1180, 620], 960, 580, K), s2: camAt([4020, 620], 960, 580, K),
  s3: camAt([6620, 640], 960, 580, K), s4: camAt([9420, 640], 960, 580, K),
  z1: camAt([1150, 560], 960, 560, 1.25),
};
// debug: ZOOM="X,Y,K" pins every camera to one close-up (for snapshot review only)
if (process.env.ZOOM) { const [zx, zy, zk] = process.env.ZOOM.split(",").map(Number); for (const k of Object.keys(CAMS)) CAMS[k] = camAt([zx, zy], 960, 560, zk); }
const tok = G(4560, 560), dexO = { u: tok.u + 230, v: tok.v }, orc = { u: tok.u + 460, v: tok.v };
const br = G(6450, 640);

// [constructor, origin, opts, label, labelClass]
const items = [
  // ---- screen 1 · protagonist vending machine vs kit objects (scale)
  [O.safe, G(330, 640), { id: "cs", plate: "COLD" }, "kit 保险柜"],
  [O.person, G(640, 760), { id: "p1", role: "signer" }, "kit 人物"],
  [O.laptop, G(700, 990), { id: "lap" }, "kit 笔记本"],
  [X.vending, G(1100, 680), { id: "vm", maintDoor: true }, "售货机 · 智能合约"],
  [O.person, G(1470, 860), { id: "p3", role: "attacker" }, "攻击者", "lab-rs"],
  [X.vending, G(1760, 610), { id: "vm2", scale: 0.6, coins: "low", rivets: true, glow: false }, "scale 0.6 · 铆钉"],
  [X.vending, G(1980, 860), { id: "vm3", scale: 0.6, state: "attacker" }, "attacker", "lab-rs"],
  [X.timeLock, G(1560, 1120), { id: "tl0", frac: 0.75 }, "时间锁"],
  // ---- screen 2 · transaction road
  [X.mempool, G(3200, 700), { id: "mp", n: 9, red: [4] }, "内存池 · 公开排队"],
  [X.sorter, G(3980, 740), { id: "sorter", letters: 2, blockLabel: "#18" }, "分拣机 · 构建者 / 排序器"],
  [X.miniVend, orc, { id: "orc", kind: "oracle" }, "预言机"],
  [X.pipe, dexO, { id: "pp2", pts: [[55, 0, 64], [230 - 55, 0, 64]], flow: true }, null],
  [X.miniVend, dexO, { id: "dex", kind: "dex" }, "DEX"],
  [X.pipe, tok, { id: "pp1", pts: [[55, 0, 64], [230 - 55, 0, 64]], flow: true }, null],
  [X.miniVend, tok, { id: "tok", kind: "token" }, "代币"],
  [X.miniVend, G(4700, 1060), { id: "evil", kind: "attacker" }, "攻击者合约", "lab-rs"],
  [X.letter, G(4400, 1020), { id: "lt", state: "attacker" }, "信封（交易）", "lab-r"],
  // ---- screen 3 · bridge + firewall
  [X.bridge, br, { id: "br" }, "跨链桥 · 消息层岗亭"],
  [X.vending, G(6890, 470), { id: "far", scale: 0.55 }, "对岸合约"],
  [X.firewall, G(7480, 1030), { id: "fw" }, "防火墙 + 门禁闸机"],
  [O.person, G(7300, 1200), { id: "p4", role: "engineer" }, null],
  // ---- screen 4 · flash loan, invariant, signs
  [X.flashDesk, G(8640, 660), { id: "fl", gold: false, frame: true }, "闪电贷柜台"],
  [X.balance, G(9330, 640), { id: "bal", tilt: 6 }, "天平 · 不变量"],
  [X.signBoard, G(9900, 560), { id: "sg1", text: "链与基础设施" }, null],
  [X.signBoard, G(10180, 860), { id: "sg2", text: "人、设备和流程" }, null],
  [X.signBoard, G(9280, 1080), { id: "sg3", style: "plate", text: "⑥ 系统与运营", size: 36 }, null],
  [X.timeLock, G(8900, 1080), { id: "tl", frac: 0.6 }, "时间锁"],
  [O.person, G(9700, 1040), { id: "p5", role: "signer" }, null],
];

const built = items.map(([fn, o, opts, label, cls], i) => ({ i, o, Y: at(o)[1], opts, label, cls, r: fn(o, opts) }));
const order = built.slice().sort((a, b) => a.Y - b.Y || a.i - b.i);
// pipes / far vending keep their declared neighbours: bridge first, then the far vending (it sits on the far bank)
const objSvg = order.map((b) => b.r.svg).join("\n");
const A = Object.fromEntries(built.map((b) => [b.opts.id, b.r.anchors]));
let labels = built.filter((b) => b.label).map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm")).join("");
labels += wlab("lb-impl", A.vm.maintTop, "实现合约（维修门后）", "lab-cs lab-sm hide", "b");
labels += wlab("lb-impl2", A.vm.maintTop, "被换成攻击者实现", "lab-rs lab-sm hide", "b");
labels += wlab("lb-schem", A.vm.schem, "电路图 = 代码公开", "lab-sm hide", "c");
labels += wlab("lb-broke", A.bal.panLlow, "不变量被打破", "lab-rs lab-sm hide", "t");

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 11000, v0: -6000, v1: 8000 }) + objSvg, [-1000, -1500, 12800, 4200]);

const titles = [["1 / 4", "主角：售货机 = 智能合约"], ["2 / 4", "交易之路"], ["3 / 4", "跨链桥与防火墙"], ["4 / 4", "闪电贷 · 不变量 · 牌子"]];
const titleHtml = titles.map(([n, t], i) => `<div class="ttl${i ? " hide" : ""}" id="ttl-${i}"><span class="ttl-n">${n}</span>${t}</div>`).join("");

// sorter arm targets (relative to the shoulder): belt letter top ≈ bz+lift+H = 78+2+42 = 122 → dz = 246-122 = 124
const sh = A.sorter.shoulderUVZ; // [-20, 0, 246]
const beltTop = (du) => [du - sh[0], sh[2] - 128];

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
      <div id="kit-sub">ep01 补充物件 kit-ext · 示例</div>
      ${pills(2)}
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
      [0, 2, 4, 1].forEach((i, k) => KITX.press(tl, "vm", i, 0.4 + k * 0.28));
      KITX.gears(tl, "vm", 0.3, 3.6, 3);
      KITX.dispense(tl, "vm", 1.0, { n: 3 });
      KITX.sideDoor(tl, "vm", 1.6, 105, 1.0);
      KIT.pop(tl, "#lb-impl", 2.4);
      KIT.swap(tl, "#vm-impl", "#vm-impl-atk", 3.0, 0.3);
      tl.to("#lb-impl", { opacity: 0, duration: 0.2 }, 2.95);
      KIT.pop(tl, "#lb-impl2", 3.05);
      KITX.dispense(tl, "vm", 3.1, { n: 3, start: 3, color: "red", dist: 1.6 });
      KITX.countdown(tl, "tl0", 0.3, 3.4, 0);
      KITX.unlock(tl, "tl0", 3.8);
      tl.to("#vm2-rivets", { opacity: 1, duration: 0.01 }, 0);
      // ---- screen 2
      KIT.cam(tl, 4.0, CAMS.s2, 1.0);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 4.2, 0.3);
      KITX.walk(tl, "mp-env-0", 4.6, 1.2, [${JSON.stringify(A.mp.exit)}, ${JSON.stringify(A.sorter.in)}]);
      KITX.walk(tl, "mp-env-4", 5.0, 0.8, [${JSON.stringify(A.mp.slots[0])}]);
      KITX.dash(tl, ["sorter-belt-0", "sorter-belt-1"], 4.4, 3.6, 160);
      KITX.reach(tl, "sorter", 4.6, ...${JSON.stringify(beltTop(-190))}, 0.6);
      KITX.reach(tl, "sorter", 5.4, ...${JSON.stringify(beltTop(-126))}, 0.5);
      KITX.reach(tl, "sorter", 6.1, 150, 110, 0.7);
      KITX.armPose(tl, "sorter", 7.2, 0, 0, 0.5);
      tl.to("#sorter-lid", { opacity: 1, duration: 0.25 }, 7.0);
      KITX.needle(tl, "orc", 4.8, 55, 0.6);
      KITX.needle(tl, "orc", 5.6, -45, 0.7);
      KITX.needle(tl, "orc", 6.6, 10, 0.5);
      KITX.dash(tl, ["pp1-flow", "pp2-flow"], 4.2, 3.8, 220);
      [0, 1, 2].forEach((i) => KITX.press(tl, "dex", i, 5.2 + i * 0.3, "blue"));
      KITX.walk(tl, "lt", 5.0, 1.4, [${JSON.stringify(at(G(4400, 1020), 200, -60))}]);
      // ---- screen 3
      KIT.cam(tl, 8.0, CAMS.s3, 1.0);
      KIT.swap(tl, "#ttl-1", "#ttl-2", 8.2, 0.3);
      KITX.dash(tl, "br-ripple", 8.0, 4.0, 300);
      KITX.gate(tl, "fw", 9.4, true, 0.4);
      KITX.gate(tl, "fw", 10.8, false, 0.4);
      KIT.broke(tl, "br-booth", 10.4);
      KIT.led(tl, "fw-led", 10.8, "red");
      // ---- screen 4
      KIT.cam(tl, 12.0, CAMS.s4, 1.0);
      KIT.swap(tl, "#ttl-2", "#ttl-3", 12.2, 0.3);
      KITX.flash(tl, "fl", 12.8, 1.0);
      KITX.tilt(tl, "bal", 13.2, 12, 0.8);
      KITX.tilt(tl, "bal", 14.4, -16, 0.7, "power2.inOut");
      KIT.broke(tl, "bal", 14.6, { ghost: 1, badge: false });
      KIT.pop(tl, "#lb-broke", 14.8);
      KITX.countdown(tl, "tl", 12.4, 2.4, 0);
      KITX.unlock(tl, "tl", 14.9);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
