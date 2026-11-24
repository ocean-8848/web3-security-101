// Generates compositions/story.html for ep05/seg1「① 没人初始化」(one isometric world, one camera).
// Run: node src/build-story.mjs
import fs from "node:fs";
import { at, Wp, f, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, kitCss, runtimeJs, CE } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { pipe, runtimeExtJs as rt01 } from "../../../ep01/kit-ext/objects-ext.mjs";
import { contractMachine, runtimeExtJs as rt03 } from "../../../ep03/kit-ext/objects-ext.mjs";
import { funcPanel, keycard, iceShell, runtimeExtJs as rt05 } from "../../kit-ext/objects-ext.mjs";
import { termCss, termCards } from "../../kit-ext/terms.mjs";
import { MAIN, MAIN_PANEL, MAIN_BUTTONS, LIB, LIB_PANEL, LIB_BUTTONS, WALLETS, PIPE_Z, PIPE_IN_Z, LIB_USER, LIB_LOCK, LIB_KEY, ICE_BOX } from "./layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const script = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const L = (i) => lineAt(T, i);
const w = (term, line, o = {}) => wordAt(T, term, { line, ...o }).start;

// ---------------------------------------------------------------- objects (painter's order by ground y)
const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const A = {};

// ---- main avenue (appears at L10)
const mainM = contractMachine(MAIN, { id: "mm", name: "APP" }); A.mm = mainM.anchors; add(MAIN, mainM.svg);
const mainP = funcPanel(MAIN_PANEL, { id: "mp", buttons: MAIN_BUTTONS }); A.mp = mainP.anchors; add(MAIN_PANEL, mainP.svg);

// ---- Parity corner
const lib = contractMachine(LIB, { id: "lib", name: "LIB", code: ["owner:", "0x0"] }); A.lib = lib.anchors; add(LIB, lib.svg);
const libP = funcPanel(LIB_PANEL, { id: "lp", buttons: [{ name: LIB_BUTTONS[0], guard: "none" }, { name: LIB_BUTTONS[1], guard: "card" }] });
A.lp = libP.anchors; add(LIB_PANEL, libP.svg);
// dust on the Library panel's sloped deck (nobody ever touched it)
{
  const zS = (dv) => 150 - (dv + 85) * Math.tan((20 * Math.PI) / 180);
  let d = "";
  let s = 7;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let k = 0; k < 70; k++) {
    const du = -118 + rnd() * 236, dv = -78 + rnd() * 150, q = at(LIB_PANEL, du, dv, zS(dv) + 1);
    d += `<ellipse cx="${f(q[0])}" cy="${f(q[1])}" rx="${f(2 + rnd() * 4)}" ry="${f(1.2 + rnd() * 2)}" fill="#cfc8bb" opacity="${f(0.55 + rnd() * 0.4)}"/>`;
  }
  for (let k = 0; k < 4; k++) { const du = -100 + k * 62, dv = -30 + (k % 2) * 50, q = at(LIB_PANEL, du, dv, zS(dv) + 1);
    d += `<ellipse cx="${f(q[0])}" cy="${f(q[1])}" rx="26" ry="10" fill="#d8d2c6" opacity="0.5"/>`; }
  add(LIB_PANEL, `<g id="dust" opacity="0">${d}</g>`, 1);
}
// wallets + ice shells (far → near)
WALLETS.forEach((W, i) => {
  const hw = O.hotWallet(W, { id: "w" + i }); A["w" + i] = hw.anchors;
  const ice = iceShell(W, { id: "ice" + i, box: ICE_BOX, on: false, seed: "ice" + i });
  A["ice" + i] = ice.anchors;
  add(W, hw.svg + ice.svg);
});
// delegatecall pipes: risers + one manifold into the Library's −u face (drawn over wallets/ice)
const du = (W) => W.u - LIB.u;
const far = WALLETS[WALLETS.length - 1];
const pm = pipe(LIB, { id: "pm", flow: true, pts: [[du(far), 0, 232], [du(far), 0, PIPE_Z], [-150, 0, PIPE_Z], [-150, 0, PIPE_IN_Z], [-112, 0, PIPE_IN_Z]] });
let pipesSvg = pm.svg;
WALLETS.slice(0, -1).forEach((W, i) => { const r = pipe(W, { id: "pr" + i, flow: true, pts: [[0, 0, 232], [0, 0, PIPE_Z]] }); pipesSvg += r.svg; });
items.push({ y: at(WALLETS[0])[1] + 2000, svg: `<g id="pipes">${pipesSvg}</g>` });

// user + owner card + intact padlock / key
const usr = O.person(LIB_USER, { id: "usr", role: "signer" }); A.usr = usr.anchors; add(LIB_USER, usr.svg);
const CARD = { u: LIB_USER.u + 46, v: LIB_USER.v + 30 };
const card = keycard(CARD, { id: "oc", role: "owner", z: 96, scale: 1.5, holder: "0x…user" }); A.oc = card.anchors; add(CARD, card.svg.replace('<g id="oc"', '<g id="oc" opacity="0"'), 2);
const lock = O.padlock(LIB_LOCK, { id: "lk" }); A.lk = lock.anchors; add(LIB_LOCK, lock.svg);
const key = O.key(LIB_KEY, { id: "ky" }); A.ky = key.anchors; add(LIB_KEY, key.svg);
items.sort((a, b) => a.y - b.y);

// smoke puff over the Library (L5)
const smokeC = [[0, 0, 250, 46], [-60, 20, 230, 38], [55, -10, 270, 40], [-20, -30, 300, 34], [30, 40, 210, 32], [-80, -10, 290, 28], [80, 30, 240, 30]];
const smoke = `<g id="smoke">${smokeC.map(([a, b, z, r], i) => { const q = at(LIB, a, b, z); return `<circle id="sm-${i}" cx="${f(q[0])}" cy="${f(q[1])}" r="${r}" fill="${i % 2 ? "#9b958a" : "#b7b1a6"}" opacity="0"/>`; }).join("")}</g>`;

const world = worldSvg("wsvg", gridSvg({ u0: -3400, u1: 2600, v0: -2600, v1: 2200 }) + items.map((x) => x.svg).join("\n") + smoke, [-3400, -1800, 6000, 3600]);

// ---------------------------------------------------------------- labels (world, counter-scaled)
const up = (p, dy, dx = 0) => [p[0] + dx, p[1] - dy];
const CHK = `<svg width="28" height="24" viewBox="0 0 44 36"><path d="M5 19L17 30L39 6" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const mono = (s) => `<span class="mono">${s}</span>`;
let labels = "";
labels += wlab("lb-lib", up(A.lib.top, 0), "库合约 · Library", "hide");
labels += wlab("lb-wal", up(A.w1.top, 10), "Parity 多签钱包", "hide");
labels += wlab("lb-share", at(LIB, -200, 0, PIPE_Z + 30), "共用同一份代码", "lab-cs lab-sm hide", "b");
labels += wlab("lb-init", [A.lp.plates[0][0] - 20, A.lp.plates[0][1] + 34], mono("initialize()"), "lab-sm hide", "t");
labels += wlab("lb-kill", [A.lp.plates[1][0] + 30, A.lp.plates[1][1] + 34], mono("kill()"), "lab-sm hide", "t");
labels += wlab("lb-own0", at(LIB, 120, 0, 215), `${mono("owner")} = 空`, "lab-g hide", "l");
labels += wlab("lb-own1", at(LIB, 120, 0, 215), `${mono("owner")} = 这名用户`, "lab-ink hide", "l");
labels += wlab("lb-never", at(LIB_PANEL, 60, 150, 0), "部署后从未初始化", "lab-g hide", "t");
labels += wlab("lb-usr", [A.usr.head[0] - 50, A.usr.head[1]], "普通用户", "hide", "r");
labels += wlab("lb-card", [A.oc.face[0] - 50, A.oc.face[1]], "owner", "lab-ink lab-sm hide", "r");
labels += wlab("lb-only", [A.lp.readers[1][0] + 40, A.lp.readers[1][1] + 6], `${CHK}只认 owner`, "lab-gs lab-sm hide", "l");
labels += wlab("lb-gone", up(A.lib.top, -20), "库合约已销毁", "lab-rs hide");
labels += wlab("lb-lost", up(A.w2.top, 20, -40), "失去代码逻辑", "lab-r hide");
labels += wlab("lb-lock", at(LIB_LOCK, -70, 0, 70), `${CHK}破解：无`, "lab-gs hide", "r");
labels += wlab("lb-key", [A.ky.center[0] + 120, A.ky.center[1] + 10], `${CHK}私钥：未被盗`, "lab-gs hide", "l");
labels += wlab("lb-nochk", [A.lp.covers[0][0] - 50, A.lp.covers[0][1] - 20], "没有权限检查", "lab-rs hide", "r");
// question badges over the main panel's five buttons (L11)
MAIN_BUTTONS.forEach((_, i) => { labels += wpin("q" + i, up(A.mp.btns[i], 70), `<div class="qb hide" id="qb-${i}">?</div>`, "c"); });
labels += wlab("lb-main", up(A.mm.top, 0), "合约", "hide");

// ---------------------------------------------------------------- cameras (fit world boxes into screen rects)
const bx = (o, u0, u1, v0, v1, z0, z1) => { const r = []; for (const a of [u0, u1]) for (const b of [v0, v1]) for (const c of [z0, z1]) r.push(at(o, a, b, c)); return r; };
const B = {
  lib: bx(LIB, -118, 118, -108, 108, 0, 290),
  panel: bx(LIB_PANEL, -138, 138, -95, 105, 0, 175),
  usr: bx(LIB_USER, -40, 40, -40, 40, 0, 300),
  card: bx(CARD, -60, 60, -10, 10, 90, 170),
  wal: WALLETS.flatMap((W) => bx(W, -135, 110, -95, 95, 0, PIPE_Z + 20)),
  w0: bx(WALLETS[0], -135, 110, -95, 95, 0, PIPE_Z + 20),
  lock: bx(LIB_LOCK, -60, 60, -30, 30, 0, 140),
  key: bx(LIB_KEY, -70, 100, -40, 40, 0, 20),
  main: [...bx(MAIN, -118, 118, -108, 108, 0, 300), ...bx(MAIN_PANEL, -294, 294, -95, 105, 0, 175)],
};
const fit = (pts, [x0, y0, x1, y1], kmax = 2) => {
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  const bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys);
  const k = Math.min(kmax, (x1 - x0) / bw, (y1 - y0) / bh);
  return camAt([(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};
const CAMS = {
  open0: fit([...B.lib, ...B.wal], [300, 210, 1620, 860]),
  open1: fit([...B.lib, ...B.wal], [250, 170, 1670, 880]),
  user: fit([...B.lib, ...B.panel, ...B.usr, ...B.w0], [240, 150, 1640, 870]),
  wide: fit([...B.lib, ...B.wal, ...B.panel], [200, 190, 1700, 870]),
  panel: fit([...B.lib, ...B.panel], [480, 150, 1440, 870]),
  kill: fit([...B.lib, ...B.panel, ...B.usr], [380, 140, 1560, 870]),
  wal: fit([...B.lib, ...B.wal], [160, 200, 1640, 870]),
  ice: fit([...B.lib, ...B.wal, ...B.panel], [40, 240, 1100, 870]),
  safe: fit([...B.panel, ...B.usr, ...B.lock, ...B.key], [380, 150, 1540, 870]),
  key: fit([...B.panel, ...B.usr, ...B.key], [360, 140, 1560, 870]),
  far: fit([...B.lib, ...B.panel, ...B.main], [200, 200, 1720, 860]),
  main: fit(B.main, [760, 190, 1900, 900]),
};

// ---------------------------------------------------------------- dot matrix: 51 dots × 1 万 ETH
const dots = Array.from({ length: 51 }, (_, i) => `<span class="dw"><span class="dt${i === 50 ? " dt-half" : ""}" id="dt-${i}"></span></span>`).join("");

// ---------------------------------------------------------------- times
const TM = {
  y2017: w("2017", 0), eth: w("以太坊", 0), odd: w("怪事", 0),
  user: w("有个用户", 1), lib: w("库合约", 1), initF: w("初始化函数", 1),
  parity: w("Parity", 2), share: w("共用", 2),
  deploy: w("部署之后", 3), never: w("从来没有人", 3),
  so: w("于是", 4), owner: w("owner", 4),
  kill: w("kill", 5), destroy: w("销毁", 5),
  dep: w("依赖", 6), lose: w("失去", 6),
  n51: w("51", 7), freeze: w("冻结", 7),
  crack: w("破解", 8), key: w("私钥", 8),
  only: w("只是调用了一个", 9), nochk: w("没有权限检查", 9),
  ac: w("访问控制", 10),
  each: w("每个按钮", 11), same: w("同一个问题", 11), who: w("谁有权", 11),
};

// term cards (RETROFIT-deps rule 2)
const TC = termCards([
  { id: "init", t: "初始化函数", d: "部署后设定 owner 等初始值的函数", at: TM.initF },
  { id: "ms", t: "多签", d: "凑够规定人数的签名才能动用的钱包", at: w("多签", 2) },
  { id: "own", t: "owner", d: "合约的所有者 · 权限最高的地址", at: TM.owner },
]);

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    .lab .mono, .mono { font-family: "JetBrains Mono", monospace; font-weight: 800; }
    #night { position: absolute; inset: 0; background: #1d2333; opacity: 0; pointer-events: none; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 60px 40px 54px; }
    #ttl-card .t-main { font-size: 92px; }
    #when { position: absolute; left: 48px; top: 34px; }
    /* frozen dot matrix */
    .fz { position: absolute; left: 1150px; top: 120px; width: 700px; background: #ffffff; border-radius: 22px; padding: 26px 34px 28px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    .fz-big { font-size: 60px; font-weight: 900; white-space: nowrap; line-height: 1.1; }
    .fz-big b { color: #e0453a; }
    .fz-dots { margin-top: 18px; display: grid; grid-template-columns: repeat(13, 38px); gap: 9px 10px; }
    .dw { display: inline-block; width: 38px; height: 38px; border-radius: 50%; border: 3px dashed #d3ccbf; position: relative; }
    .dt { position: absolute; left: -3px; top: -3px; width: 38px; height: 38px; border-radius: 50%; background: #8ccbe3; border: 3px solid #3f93b8; opacity: 0; }
    .dt-half { background: #d3ecf5; border-style: dashed; }
    .fz-foot { margin-top: 16px; display: flex; align-items: center; gap: 12px; font-size: 30px; font-weight: 700; color: #6d685e; white-space: nowrap; }
    .fz-foot .lg { display: inline-block; width: 26px; height: 26px; border-radius: 50%; background: #8ccbe3; border: 3px solid #3f93b8; }
    .tag-g { margin-left: auto; font-size: 28px; font-weight: 700; color: #6d685e; background: #f1ede5; border-radius: 8px; padding: 2px 12px 4px; }
    /* question badges + closing line */
    .qb { width: 76px; height: 76px; border-radius: 50%; background: #1c1c1c; color: #ffffff; border: 6px solid #ffffff; font-size: 52px; font-weight: 900;
      display: flex; align-items: center; justify-content: center; line-height: 1; box-shadow: 0 8px 18px rgba(70,60,40,0.22); font-family: "Inter", "Noto Sans SC", sans-serif; }
    #kw { position: absolute; left: 72px; top: 110px; }
    #kw .k-big { font-size: 112px; }
    #kw .en { margin-top: 8px; font-family: "Inter", sans-serif; font-size: 48px; font-weight: 900; color: #6d685e; }
${termCss()}
    #ask { position: absolute; left: 72px; top: 330px; font-size: 76px; font-weight: 900; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div id="night"></div>
      <div class="lab lab-g hide" id="when">2017 年 11 月 · 以太坊</div>
      <div class="fz hide" id="fz">
        <div class="fz-big">约 51 万 ETH · <b>冻结</b></div>
        <div class="fz-dots">${dots}</div>
        <div class="fz-foot"><span class="lg"></span>1 点 = 1 万 ETH<span class="tag-g">口径 · Parity 复盘</span></div>
      </div>
      <div id="kw"><div class="k-big hide" id="kw-big">访问控制</div><div class="en hide" id="kw-en">Access Control</div></div>
      <div class="hide" id="ask">谁有权按这个按钮？</div>
      ${pills(1, { sections: script.sections })}
      ${TC.html}
      <div class="k-title" id="ttl-card"><div class="t-main">① 没人初始化</div><div class="t-sub">访问控制与权限</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${rt01()}
${rt03()}
${rt05()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pulse = (sel, t, s) => tl.fromTo(sel, { scale: 1 }, { scale: s || 1.15, duration: 0.16, yoyo: true, repeat: 1, ease: "power1.inOut", immediateRender: false }, t);
      const PIPES = ["pr0-flow", "pr1-flow", "pm-flow"];

      KIT.camSet(tl, CAMS.open0);
      ["mm", "mp", "lp", "usr", "oc", "lk", "ky"].forEach((id) => tl.set("#" + id, { scaleY: 0, svgOrigin: $(id).getAttribute("data-ox") + " " + $(id).getAttribute("data-oy") }, 0));
      tl.fromTo("#night", { opacity: 0 }, { opacity: 0.22, duration: 0.5, ease: "power1.out", immediateRender: false }, 0);
      // delegatecall flow keeps moving while the library lives
      KITX01.dash(tl, PIPES, 0, ${f(TM.destroy + 0.4)}, ${f((TM.destroy + 0.4) * 34)});
      KITX03.spin(tl, "lib", 0, ${f(TM.destroy)}, ${f(TM.destroy / 6)});

      // ===== 0–1.6 title card → pill; night tone over the Parity corner
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.25);
      KIT.cam(tl, 0.8, CAMS.open1, 4.8, "sine.inOut");
      // ===== L0 2017-11 · Ethereum
      KIT.pop(tl, "#when", ${f(TM.y2017)}, 0.3);
      KIT.pop(tl, "#lb-lib", ${f(TM.odd - 0.3)});
      // ===== L1 a user calls the library's initialize
      KIT.cam(tl, ${f(L(1).start - 0.2)}, CAMS.user, 1.1);
      tl.to("#night", { opacity: 0.12, duration: 1.2, ease: "power1.inOut" }, ${f(L(1).start)});
      KIT.grow(tl, "lp", ${f(TM.user - 0.1)}, 0.5);
      fadeIn("#dust", ${f(TM.user + 0.3)}, 0.3);
      KIT.grow(tl, "usr", ${f(TM.user + 0.15)}, 0.45);
      KIT.pop(tl, "#lb-usr", ${f(TM.user + 0.45)});
      KIT.pop(tl, "#lb-init", ${f(TM.initF)});
      pulse("#lb-init", ${f(TM.initF + 0.4)}, 1.1);
      // ===== L2 shared by Parity multisig wallets
      KIT.cam(tl, ${f(L(2).start - 0.2)}, CAMS.wide, 1.0);
      tl.to("#night", { opacity: 0, duration: 1.0, ease: "power1.inOut" }, ${f(L(2).start)});
      out("#lb-usr", ${f(L(2).start - 0.2)}, 0.2);
      KIT.pop(tl, "#lb-wal", ${f(TM.parity)});
      KIT.pop(tl, "#lb-share", ${f(TM.share - 0.1)});
      PIPES.forEach((id, i) => { tl.to("#" + id, { attr: { stroke: "#7fdcff" }, duration: 0.12 }, ${f(TM.share)} + i * 0.22); tl.to("#" + id, { attr: { stroke: "#2aa3c9" }, duration: 0.3 }, ${f(TM.share + 0.25)} + i * 0.22); });
      ["w2", "w1", "w0"].forEach((id, i) => KIT.led(tl, id + "-led", ${f(TM.share)} + i * 0.22, "blue"));
      ["w2", "w1", "w0"].forEach((id, i) => KIT.led(tl, id + "-led", ${f(TM.share + 0.35)} + i * 0.22, "green"));
      // ===== L3 never initialized: owner = empty, dust on the panel
      out("#lb-wal, #lb-share, #lb-init", ${f(L(3).start - 0.2)}, 0.2);
      KIT.cam(tl, ${f(L(3).start - 0.25)}, CAMS.panel, 1.0);
      KIT.pop(tl, "#lb-own0", ${f(TM.deploy + 0.2)});
      KIT.pop(tl, "#lb-never", ${f(TM.never)});
      // ===== L4 he becomes owner
      out("#lb-never", ${f(L(4).start - 0.2)}, 0.2);
      KIT.cam(tl, ${f(L(4).start - 0.3)}, CAMS.kill, 0.9);
      KIT.pop(tl, "#lb-init", ${f(L(4).start - 0.1)});
      KITX05.press(tl, "lp", 0, ${f(TM.so + 0.15)}, {});
      tl.to("#dust", { opacity: 0, duration: 0.5, ease: "power1.out" }, ${f(TM.so + 0.2)});
      KIT.swap(tl, "#lb-own0", "#lb-own1", ${f(TM.owner - 0.35)}, 0.25);
      KITX05.fly(tl, "oc", 0, ${f(A.lib.center[0] - A.oc.center[0])}, ${f(A.lib.center[1] - A.oc.center[1] - 80)}, 0.01);
      tl.set("#oc", { scaleY: 1, opacity: 1 }, ${f(TM.owner - 0.3)});
      KITX05.fly(tl, "oc", ${f(TM.owner - 0.3)}, 0, 0, 0.75, 140);
      KIT.pop(tl, "#lb-card", ${f(TM.owner + 0.45)});
      // ===== L5 calls kill (reader: owner → green), library destroyed (key frame)
      out("#lb-init", ${f(L(5).start)}, 0.2);
      KIT.pop(tl, "#lb-kill", ${f(TM.kill - 0.25)});
      KITX05.swipe(tl, "lp", 1, ${f(TM.kill)}, true);
      KIT.pop(tl, "#lb-only", ${f(TM.kill + 0.35)});
      KITX05.press(tl, "lp", 1, ${f(TM.kill + 0.55)}, { status: "red" });
      KIT.broke(tl, "lib", ${f(TM.destroy)});
      out("#lb-own1, #lb-lib", ${f(TM.destroy)}, 0.2);
      KIT.pop(tl, "#lb-gone", ${f(TM.destroy + 0.25)});
      ${JSON.stringify(smokeC.map((c) => c[3]))}.forEach((r, i) => {
        const t0 = ${f(TM.destroy - 0.05)} + i * 0.06;
        tl.fromTo("#sm-" + i, { opacity: 0, scale: 0.4, y: 0, transformOrigin: "50% 50%" }, { opacity: 0.85, scale: 1, y: -20, duration: 0.35, ease: "power2.out", immediateRender: false }, t0);
        tl.to("#sm-" + i, { opacity: 0, scale: 1.7, y: -90, duration: 1.4, ease: "power1.in" }, t0 + 0.35);
      });
      // ===== L6 wallets lose their code: flows go dark one by one, LEDs to grey
      out("#lb-kill, #lb-only", ${f(L(6).start)}, 0.2);
      KIT.cam(tl, ${f(L(6).start - 0.2)}, CAMS.wal, 1.0);
      ["pm-flow", "pr1-flow", "pr0-flow"].forEach((id, i) => out("#" + id, ${f(TM.lose - 0.3)} + i * 0.3, 0.3));
      ["w2", "w1", "w0"].forEach((id, i) => KIT.led(tl, id + "-led", ${f(TM.lose)} + i * 0.3, "off"));
      KIT.pop(tl, "#lb-lost", ${f(TM.lose + 0.2)});
      // ===== L7 ≈ 510k ETH frozen
      KIT.cam(tl, ${f(L(7).start - 0.25)}, CAMS.ice, 0.9);
      out("#lb-gone, #lb-card", ${f(L(7).start - 0.2)}, 0.2);
      ["ice0", "ice1", "ice2"].forEach((id, i) => KITX05.freeze(tl, id, ${f(TM.n51 - 0.3)} + i * 0.25, 0.9, "up"));
      KIT.pop(tl, "#fz", ${f(TM.n51 - 0.2)}, 0.3);
      for (let i = 0; i < 51; i++) tl.fromTo("#dt-" + i, { opacity: 0, scale: 0.4 }, { opacity: i === 50 ? 0.55 : 1, scale: 1, duration: 0.16, ease: "back.out(1.6)", immediateRender: false }, ${f(TM.n51 + 0.1)} + i * 0.022);
      out("#lb-lost", ${f(TM.freeze)}, 0.2);
      // ===== L8 nothing cracked, no key stolen
      out("#fz", ${f(L(8).start - 0.2)}, 0.25);
      KIT.cam(tl, ${f(L(8).start - 0.25)}, CAMS.safe, 1.0);
      KIT.grow(tl, "lk", ${f(TM.crack - 0.4)}, 0.4);
      KIT.pop(tl, "#lb-lock", ${f(TM.crack)});
      KIT.grow(tl, "ky", ${f(TM.key - 0.45)}, 0.4);
      KIT.pop(tl, "#lb-key", ${f(TM.key - 0.05)});
      // ===== L9 only an unguarded function (key frame): intact key vs bare button
      KIT.cam(tl, ${f(L(9).start - 0.2)}, CAMS.key, 1.0);
      KIT.pop(tl, "#lb-only", ${f(L(9).start + 0.3)});
      KITX05.guard(tl, "lp", 0, ${f(TM.nochk - 0.15)}, "broken");
      KIT.pop(tl, "#lb-nochk", ${f(TM.nochk + 0.1)}, 0.3);
      pulse("#lb-nochk", ${f(TM.nochk + 0.8)}, 1.08);
      // ===== L10 this episode: access control — over to the main avenue
      out("#lb-lock, #lb-key, #lb-only, #when", ${f(L(10).start - 0.1)}, 0.25);
      KIT.cam(tl, ${f(L(10).start - 0.1)}, CAMS.far, 1.0, "power2.in");
      KIT.grow(tl, "mm", ${f(L(10).start + 0.3)}, 0.5);
      KIT.grow(tl, "mp", ${f(L(10).start + 0.55)}, 0.5);
      KIT.cam(tl, ${f(L(10).start + 0.9)}, CAMS.main, 1.1, "power2.out");
      out("#lb-nochk", ${f(L(10).start + 0.6)}, 0.2);
      KIT.pop(tl, "#kw-big", ${f(TM.ac)}, 0.35);
      fadeIn("#kw-en", ${f(TM.ac + 0.3)}, 0.3);
      KITX03.spin(tl, "mm", ${f(L(10).start + 0.6)}, 8, 1.2, "power1.out");
      // ===== L11 every button: who may press it?
      for (let i = 0; i < 5; i++) KIT.pop(tl, "#qb-" + i, ${f(TM.each)} + i * 0.16, 0.3);
      out("#kw-en", ${f(TM.who - 0.3)}, 0.2);
      KIT.pop(tl, "#ask", ${f(TM.who)}, 0.35);
      ${TC.js}
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes", TM);
