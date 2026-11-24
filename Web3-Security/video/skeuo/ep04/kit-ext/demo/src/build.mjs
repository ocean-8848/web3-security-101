// Builds compositions/showcase.html — ep04 kit-ext showcase (3 screens, 12 s).
// Run: node src/build.mjs
import fs from "node:fs";
import { G, at, camAt, worldSvg, gridSvg, wlab, kitCss, runtimeJs, box, faceV, M } from "../../../../kit/iso.mjs";
import * as O from "../../../../kit/objects.mjs";
import * as E1 from "../../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../objects-ext.mjs";
import { pills } from "../../../../kit/pills.mjs";

const CAMS = { s1: camAt([960, 640], 960, 600, 1.0), s2: camAt([2760, 640], 960, 620, 1.2), s3: camAt([4820, 660], 960, 600, 1.0) };
const items = []; // { o, svg, label?, lab: {id, p, html, cls, anchor} }
const add = (r, o, lab) => { items.push({ Y: at(o)[1], svg: r.svg, lab }); return r; };
const obj = (fn, Xg, Yg, opts, label, cls) => { const o = G(Xg, Yg), r = fn(o, opts); return add(r, o, label ? { id: "lb-" + opts.id, p: r.anchors.top, html: label, cls: (cls ?? "") + " lab-sm" } : null); };

// ---------------- screen 1 · Bank vending with function hasps, attacker + callback arm
obj(O.person, 300, 760, { id: "ps", role: "signer" }, "person");
obj(O.safe, 500, 600, { id: "safe", plate: "VAULT" }, "safe");
const oVm = G(980, 620);
const vm = obj(E1.vending, 980, 620, { id: "vm", sign: "BANK" }, "Bank（ep01 vending）");
const hb = (i, opts) => { const b = X.vendButton(oVm, i); return add(X.hasp(b.o, { ...opts, z: b.z, scale: b.scale }), b.o); };
const h0 = hb(0, { id: "h0", locked: true });
const h1 = hb(1, { id: "h1", locked: false });
const h2 = hb(2, { id: "h2", locked: true, shared: true });
const h3 = hb(3, { id: "h3", locked: true, transient: true, plate: false });
const oB = G(1500, 860);
obj(E1.miniVend, 1500, 860, { id: "mB", kind: "plain", label: "B" }, "另一台合约 B");
const bb = X.miniButton(oB, 0); const hB = add(X.hasp(bb.o, { id: "hB", z: bb.z, scale: bb.scale, shared: true }), bb.o);
obj(E1.miniVend, 640, 900, { id: "mA", kind: "attacker" }, "攻击合约", "lab-rs");
const arm = obj(X.callbackArm, 790, 930, { id: "cb", target: vm.anchors.buttons[0], coin: true, maxReach: 560 }, "回调弹簧臂", "lab-r");
const chainSvg = X.haspChain("h2", [h2.anchors.eye, hB.anchors.eye], { shown: false }).svg;

// ---------------- screen 2 · teller counter, enlarged hasps on a test plaque
const tc = obj(X.tellerCounter, 2620, 620, { id: "tc", cash: 3, stock: 1 }, "银行柜台（柜员比喻）");
obj(O.person, 2620 + (tc.anchors.customer[0] - at(G(2620, 620))[0]), 620 + (tc.anchors.customer[1] - at(G(2620, 620))[1]), { id: "cu", role: "signer" }, "顾客");
const plaque = (Xg, Yg, id) => { const o = G(Xg, Yg); let s = box(o, -90, 140, -14, 0, 0, 170, M.white, 1.6) + box(o, -96, 146, -18, 4, 0, 8, M.plinth, 1.2);
  s += `<g transform="${faceV(o, 0, 0.5, 100)}"><circle cx="0" cy="0" r="16" fill="#7d828a"/><circle cx="0" cy="0" r="12" fill="#f4f5f6" stroke="rgba(0,0,0,0.3)"/></g>`;
  items.push({ Y: at(o)[1], svg: `<g id="${id}">${s}</g>` }); return o; };
const pq1 = plaque(3180, 520, "pq1"), pq2 = plaque(3220, 790, "pq2");
const H1 = add(X.hasp(pq1, { id: "H1", z: 100, scale: 2.4, locked: true }), pq1);
const H2 = add(X.hasp(pq2, { id: "H2", z: 100, scale: 2.4, locked: true, transient: true }), pq2);

// ---------------- screen 3 · pickup locker, oracle ghost needle, compiler tape + card
const lk = obj(X.pickupLocker, 4200, 600, { id: "lk", amounts: { 5: "1 ETH", 2: "0.4", 9: "2.5" }, blank: true }, "取件柜（拉取式支付）");
obj(O.person, 4330, 860, { id: "pp", role: "engineer" }, "取件人");
const oOr = G(4800, 470);
obj(E1.miniVend, 4800, 470, { id: "or", kind: "oracle", needle: -20 }, "价格表盘 + 幽灵指针");
items.push({ Y: at(oOr)[1] + 0.01, svg: X.oracleGhost(oOr, { id: "or", deg: 52, shown: false }).svg });
const oM = G(5060, 860);
obj(E3.contractMachine, 5060, 860, { id: "vy", name: "Vyper" }, "编译器（ep03 contractMachine）");
const mo = X.machineOut(oM);
const tp = add(X.punchCard(mo.o, { id: "tp", z: mo.z, s: 0, red: [9, 10, 11], redShown: false }), mo.o, null);
obj(X.punchCard, 5500, 600, { id: "card", kind: "card", red: [6, 7] }, "字节码打孔卡");

const objSvg = items.slice().sort((a, b) => a.Y - b.Y).map((b) => b.svg).join("\n") + chainSvg;
let labels = items.filter((b) => b.lab).map((b) => wlab(b.lab.id, b.lab.p, b.lab.html, b.lab.cls)).join("");
const hl = (id, h, i, html, cls) => wlab(id, [h.anchors.plate[0] + 120, h.anchors.plate[1] - 120 + i * 52], html, cls + " lab-sm", "l");
labels += hl("lb-h0", h0, 0, "btn0 · 锁扣（锁）", "lab-gs") + hl("lb-h1", h1, 1, "btn1 · 锁扣（开）", "lab-g") + hl("lb-h2", h2, 2, "btn2 · shared 铁链", "") + hl("lb-h3", h3, 3, "btn3 · 瞬态锁", "lab-cs");
labels += wlab("lb-H1", H1.anchors.top, "函数锁扣 ×2.4", "lab-sm") + wlab("lb-H2", [H2.anchors.top[0] + 40, H2.anchors.top[1]], "瞬态锁 EIP-1153 ×2.4", "lab-cs lab-sm");
labels += wlab("lb-tp", tp.anchors.end, "吐出的纸带", "lab-sm", "t");

const world = worldSvg("world-svg", gridSvg({ u0: -3000, u1: 9000, v0: -4000, v1: 6000 }) + objSvg, [-600, -800, 7000, 3000]);
const titles = [["1 / 3", "弹簧臂与函数锁扣"], ["2 / 3", "柜台与锁的近景"], ["3 / 3", "取件柜 · 幽灵指针 · 打孔纸带"]];
const titleHtml = titles.map(([n, t], i) => `<div class="ttl${i ? " hide" : ""}" id="ttl-${i}"><span class="ttl-n">${n}</span>${t}</div>`).join("");
const sections = ["顺序写反了", "交出控制权", "四种重入", "CEI与锁", "回调入口"];
const btn1 = vm.anchors.buttons[1];

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
      <div id="kit-sub">ep04 补充拟物物件 · 与 kit 原物件比例对照</div>
      ${pills(4, { sections })}
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E3.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      KIT.camSet(tl, CAMS.s1);
      // ---- screen 1: arm pokes the locked withdraw (blocked), then presses the open button
      KITX04.chainOn(tl, "h2", 0.4, 0.8);
      KITX04.callArm(tl, "cb", 0.5, 0.86, 0.4);
      KITX04.callArm(tl, "cb", 1.0, 0, 0.35);
      KITX04.callArm(tl, "cb", 1.5, 1, 0.45, { target: ${JSON.stringify(btn1)} });
      KITX01.press(tl, "vm", 1, 1.9, "red", 0.4);
      KITX04.op4(tl, "#cb-coin", 1.4, 0, 0.2);
      KITX04.hasp(tl, "h0", 2.6, false, 0.7);
      KITX04.hasp(tl, "h1", 2.6, true, 0.7);
      KITX04.haspSand(tl, "h3", 0.4, 3.0);
      // ---- screen 2
      KIT.cam(tl, 3.6, CAMS.s2, 0.7);
      KIT.swap(tl, "#ttl-0", "#ttl-1", 3.8, 0.3);
      KITX04.cashOut(tl, "tc", 0, 4.5); KITX04.cashOut(tl, "tc", 1, 5.0); KITX04.cashOut(tl, "tc", 2, 5.5);
      KITX04.stock(tl, "tc", 4.5, 0.02, 1.6);
      KITX04.pen(tl, "tc", 6.3, true, 0.3);
      KITX04.hasp(tl, "H1", 4.5, false, 0.8);
      KITX04.hasp(tl, "H1", 6.0, true, 0.8);
      KITX04.haspSand(tl, "H2", 4.5, 2.6);
      // ---- screen 3
      KIT.cam(tl, 7.4, CAMS.s3, 0.8);
      KIT.swap(tl, "#ttl-1", "#ttl-2", 7.6, 0.3);
      KITX04.lockerWrite(tl, "lk", 5, 8.4); KITX04.lockerWrite(tl, "lk", 2, 8.5); KITX04.lockerWrite(tl, "lk", 9, 8.6);
      KITX04.lockerDoor(tl, "lk", 5, 8.9, 105, 0.8);
      KITX04.lockerTake(tl, "lk", 5, 9.8);
      KITX04.ghostOn(tl, "or", 8.4, true);
      KITX04.ghost(tl, "or", 8.4, 52, 0.01);
      KITX04.ghostWobble(tl, "or", 8.6, 1.6, 52, 9, 0.5);
      KITX03.spin(tl, "vy", 8.4, 1.6, 2);
      KITX04.tape(tl, "tp", 8.4, 1, 1.6);
      KITX04.tapeMark(tl, "tp", 10.1, "flash");
      window.__timelines["showcase"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/showcase.html", import.meta.url), html);
console.log("wrote compositions/showcase.html", html.length);
