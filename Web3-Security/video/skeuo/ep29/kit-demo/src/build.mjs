// Builds compositions/showcase.html — the ep29 kit showcase (3 screens, ~12 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, at, f, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs } from "../../kit/iso.mjs";
import * as O from "../../kit/objects.mjs";
import { pills } from "../../kit/pills.mjs";

const K = 0.78;
const CAMS = { s1: camAt([1180, 640], 960, 560, K), s2: camAt([3880, 640], 960, 560, K), s3: camAt([6560, 640], 960, 560, K) };

// [constructor, X, Y, opts, label, labelClass]
const items = [
  // ---- screen 1 · wallets & credentials
  [O.safe, 260, 560, { id: "cs", plate: "COLD" }, "保险柜 · 冷钱包"],
  [O.hotWallet, 900, 600, { id: "hot", open: 0 }, "热钱包（外挂键盘）"],
  [O.laptop, 1380, 620, { id: "lap" }, "笔记本"],
  [O.hwWallet, 1820, 640, { id: "hw" }, "硬件钱包"],
  [O.dbLedger, 2230, 600, { id: "db" }, "数据库 · 账本"],
  [O.padlock, 120, 1010, { id: "lock" }, "挂锁 + 钥匙"],
  [O.key, 470, 1030, { id: "key" }, "钥匙"],
  [O.seal, 900, 1020, { id: "seal", stamped: false }, "公章 + 印痕"],
  [O.doc, 1360, 1020, { id: "doc", stamp: true }, "提现单"],
  [O.envelope, 1740, 1030, { id: "env" }, "信封"],
  [O.ledgerBook, 2140, 1020, { id: "ledger" }, "账本"],
  // ---- screen 2 · infrastructure & gates
  [O.rack, 2940, 600, { id: "rack", tag: "MPC-01" }, "签名集群 / MPC"],
  [O.hsm, 3400, 560, { id: "hsm" }, "加密机 HSM"],
  [O.rpc, 3700, 640, { id: "rpc" }, "RPC 节点"],
  [O.tower, 4120, 620, { id: "tower" }, "广播塔"],
  [O.browserWin, 4720, 620, { id: "brw" }, "Safe{Wallet} 网页"],
  [O.checkpoint, 2960, 1000, { id: "g1", n: "①" }, "关卡 · 正常", "lab-g"],
  [O.checkpoint, 3560, 1000, { id: "g4", n: "④", state: "broken" }, "关卡 · 断了", "lab-rs"],
  [O.chain, 4250, 1050, { id: "chain", blockStates: ["normal", "normal", "normal", "attacker"] }, "区块链"],
  [O.bucket, 4900, 1030, { id: "s3" }, "S3 存储桶"],
  // ---- screen 3 · people & signals
  [O.desk, 5640, 600, { id: "desk" }, "员工工位"],
  [O.phone, 6060, 660, { id: "phone" }, "手机"],
  [O.person, 6330, 640, { id: "p1", role: "signer" }, "签名人"],
  [O.person, 6540, 650, { id: "p2", role: "engineer" }, "工程师"],
  [O.person, 6760, 660, { id: "p3", role: "attacker" }, "攻击者", "lab-rs"],
  [O.knifeSwitch, 7250, 600, { id: "sw" }, "熔断开关"],
  [O.beacon, 5560, 1040, { id: "alarm" }, "警报灯"],
  [O.hourglass, 5920, 1040, { id: "hg" }, "沙漏"],
  [O.clock, 6320, 1040, { id: "clock", h: 3, m: 50 }, "时钟 3:50"],
  [O.shield, 6760, 1040, { id: "shield" }, "策略引擎"],
  [O.magnifier, 7200, 1060, { id: "mag" }, "放大镜 · 核对"],
];

const built = items.map(([fn, X, Y, opts, label, cls]) => ({ X, Y, opts, label, cls, r: fn(G(X, Y), opts) }));
// painter's order: far (small ground Y) first
const objSvg = built.slice().sort((a, b) => a.Y - b.Y).map((b) => b.r.svg).join("\n");
let labels = built.map((b) => wlab("lb-" + b.opts.id, b.r.anchors.top, b.label, (b.cls ?? "") + " lab-sm")).join("");
const A = Object.fromEntries(built.map((b) => [b.opts.id, b.r.anchors]));
labels += wlab("lb-core", A.cs.coreLabel, "实现合约（锁芯）", "lab-cs lab-sm hide", "t");
labels += wlab("lb-coreatk", A.cs.coreLabel, "攻击者锁芯", "lab-rs lab-sm hide", "t");

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 9000, v0: -4000, v1: 6000 }) + objSvg, [-1000, -1200, 9800, 3600]);

const titles = [["1 / 3", "钱包与凭证"], ["2 / 3", "基础设施与关卡"], ["3 / 3", "人与信号"]];
const titleHtml = titles.map(([n, t], i) => `<div class="ttl${i ? " hide" : ""}" id="ttl-${i}"><span class="ttl-n">${n}</span>${t}</div>`).join("");

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
      <div id="kit-sub">ep29 拟物等距物件库 · 示例</div>
      ${pills(2)}
    </div>
  </div>
  <script>
${runtimeJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      KIT.camSet(tl, CAMS.s1);
      // ---- screen 1: vault door opens, the lock core is swapped, the seal stamps
      KIT.door(tl, "cs", 0.9, 105, 1.1);
      KIT.pop(tl, "#lb-core", 2.05);
      KIT.swap(tl, "#cs-core", "#cs-core-atk", 2.75, 0.3);
      tl.to("#lb-core", { opacity: 0, duration: 0.2 }, 2.7);
      KIT.pop(tl, "#lb-coreatk", 2.8);
      KIT.door(tl, "hot", 1.6, 100, 1.0);
      KIT.stamp(tl, "seal", 1.3);
      // ---- screen 2: barrier lifts, cluster lights go red
      KIT.cam(tl, 3.7, CAMS.s2, 1.0);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 4.0, 0.3);
      KIT.arm(tl, "g1", 4.9, true, 0.8);
      ["rack-led-0", "rack-led-1", "rack-led-2"].forEach((id, i) => KIT.led(tl, id, 5.5 + i * 0.18, "red"));
      KIT.led(tl, "hsm-led-0", 6.1, "red");
      [0, 1, 2, 3].forEach((i) => tl.fromTo("#tower-wave-" + i, { opacity: 0 }, { opacity: 1 - i * 0.2, duration: 0.2, immediateRender: false }, 5.0 + i * 0.12));
      // ---- screen 3: switch pulled, alarm spins, sand runs, clock advances
      KIT.cam(tl, 7.4, CAMS.s3, 1.0);
      KIT.swap(tl, "#ttl-1", "#ttl-2", 7.7, 0.3);
      KIT.toggle(tl, "sw", 8.7, false, 0.5);
      KIT.beacon(tl, "alarm", 9.0, 2.95, 0.9);
      KIT.sand(tl, "hg", 8.8, 3.0);
      KIT.clock(tl, "clock", 9.2, 1.6, 40);
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
