// Generates compositions/story.html for ep05/seg2「② 门没装锁」(one isometric world, one camera).
// Run: node src/build-story.mjs
// Objects: kit + ep01/ep03/ep05 kit-ext (import only) + ./props.mjs. Layout: ./layout.mjs (shared zones from seg1).
import fs from "node:fs";
import { at, Wp, f, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, CHECK, BADGE, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { coin, office, rivets, glassCase, sticker, plateGhost, lift } from "./props.mjs";
import * as L from "./layout.mjs";
import { termCss, termCards } from "../../kit-ext/terms.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = T.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const SECTIONS = SCRIPT.sections;
const LN = T.lines.map((_, i) => lineAt(T, i));
const LS = LN.map((l) => l.start);
const w = (term, line, nth = 0) => wordAt(T, term, { line, nth }).start;

// ---------------------------------------------------------------- objects
const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const A = {};
const W3 = (u, v, z = 0) => Wp(u, v, z);
const wrap = (id, svg) => `<g id="${id}">${svg}</g>`;          // outer group for KITX05.fly; inner keeps KIT.grow

// main avenue: contract machine + 5-button panel (seg1 coordinates)
const cm = E3.contractMachine(L.MAIN, { id: "cm", name: "Contract" }); A.cm = cm.anchors; add(L.MAIN, cm.svg);
add(L.MAIN, rivets("rv", L.MAIN), 0.2);
const gc = glassCase(L.MAIN, { id: "gc" }); A.gc = gc.anchors; add(L.MAIN, gc.svg, 0.1);
const fp = X.funcPanel(L.MAIN_PANEL, { id: "fp", buttons: L.MAIN_BUTTONS.map((name) => ({ name })), lamps: true }); A.fp = fp.anchors; add(L.MAIN_PANEL, fp.svg);
add(L.MAIN_PANEL, sticker("stk", L.MAIN_PANEL, 4, "deposit"), 0.1);
// safety-argument doc next to the panel (L1)
const oDoc = { u: 470, v: 420 };
const dc = O.doc(oDoc, { id: "dcs", title: "安全论证", lines: ["任何人调用", "都不会出错"], w: 190, h: 220 }); A.dc = dc.anchors; add(oDoc, dc.svg);

// metaphor office
const of = office(L.OFFICE, { id: "of" }); A.of = of.anchors; add(L.OFFICE, of.svg);
const metaPeople = [-70, 0, 70].map((dv, i) => {
  const o = { u: L.OFFICE.u - 120 + i * 40, v: L.OFFICE.v + 260 + dv * 0.3 };
  const p = O.person(o, { id: "mp" + i, role: "signer", scale: 0.55 }); add(o, wrap("mp" + i + "-mv", p.svg), 1); return o;
});
const oEng = { u: L.OFFICE.u + 170, v: L.OFFICE.v + 250 };
const eng = O.person(oEng, { id: "me", role: "engineer", scale: 0.55 }); A.me = eng.anchors; add(oEng, wrap("me-mv", eng.svg), 1);
const oMeCard = { u: oEng.u + 30, v: oEng.v + 20 };
const meCard = X.keycard(oMeCard, { id: "mek", role: "owner", z: 60, scale: 0.8, lanyard: false }); add(oMeCard, wrap("mek-mv", meCard.svg), 2);
const oSmith = { u: L.OFFICE.u + 250, v: L.OFFICE.v + 230 };
const smith = O.person(oSmith, { id: "ms", role: "signer", scale: 0.55 }); A.ms = smith.anchors; add(oSmith, smith.svg, 1);

// the five visitors
const qAny = O.person(L.Q.any, { id: "q0", role: "signer" }); A.q0 = qAny.anchors; add(L.Q.any, wrap("q0-mv", qAny.svg));
const qEvil = E1.miniVend(L.Q.evil, { id: "q1", kind: "attacker" }); A.q1 = qEvil.anchors; add(L.Q.evil, qEvil.svg);
const qAdm = O.person(L.Q.admin, { id: "q2", role: "signer" }); A.q2 = qAdm.anchors; add(L.Q.admin, qAdm.svg);
const PHISH = `<rect x="0" y="0" width="222" height="146" fill="#fde6e3"/><rect x="0" y="0" width="222" height="28" fill="#e0453a"/>
  <text x="10" y="20" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="#ffffff">airdrop.example</text>
  <text x="111" y="74" font-family="Noto Sans SC, sans-serif" font-size="30" font-weight="900" fill="#c3352b" text-anchor="middle">领取空投</text>
  <rect x="56" y="96" width="110" height="34" rx="8" fill="#e0453a"/><text x="111" y="120" font-family="Noto Sans SC, sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle">立即领取</text>`;
const lap = O.laptop(L.Q.laptop, { id: "lap", screen2: PHISH }); A.lap = lap.anchors; add(L.Q.laptop, lap.svg);
const qThief = O.person(L.Q.thief, { id: "q3", role: "attacker" }); A.q3 = qThief.anchors; add(L.Q.thief, wrap("q3-mv", qThief.svg));
const oKey = { u: L.Q.thief.u + 70, v: L.Q.thief.v + 60 };
const tKey = O.key(oKey, { id: "q3k", stand: true }); add(oKey, wrap("q3k-mv", lift(tKey.svg, 40)), 1);
const qIns = O.person(L.Q.insider, { id: "q4", role: "engineer" }); A.q4 = qIns.anchors; add(L.Q.insider, qIns.svg);
const oInsCard = { u: L.Q.insider.u + 60, v: L.Q.insider.v + 50 };
const insCard = X.keycard(oInsCard, { id: "q4c", role: "owner", text: "STAFF", z: 70 }); add(oInsCard, insCard.svg, 1);
// queue line on the ground
const qLine = `<polyline id="qline" opacity="0" points="${[[-940, L.QV + 120], [820, L.QV + 120]].map(([u, v]) => W3(u, v).map(f).join(",")).join(" ")}" fill="none" stroke="#8a8478" stroke-width="4" stroke-dasharray="14 12" stroke-linecap="round"/>`;
add({ u: 0, v: L.QV - 400 }, qLine);

// L12–L13: token machine, minter contract + its card
const tk = E1.miniVend(L.TOKEN, { id: "tk", kind: "token" }); A.tk = tk.anchors; add(L.TOKEN, tk.svg);
const mc = E1.miniVend(L.MINTER, { id: "mc", kind: "plain" }); A.mc = mc.anchors; add(L.MINTER, mc.svg);
const oMcCard = { u: L.MINTER.u + 90, v: L.MINTER.v + 50 };
const mcCard = X.keycard(oMcCard, { id: "mck", role: "minter", z: 40 }); add(oMcCard, wrap("mck-mv", mcCard.svg), 1);
// L15: three passers-by reaching into the glass back
const reach = [[-420, -170], [-470, 10], [-400, 190]].map(([u, v], i) => {
  const o = { u, v }; const p = O.person(o, { id: "rp" + i, role: "signer", scale: 0.8 }); add(o, wrap("rp" + i + "-mv", p.svg)); return o;
});

// L22–L25: implementation contract + its own one-button panel, pipe from the proxy
const im = E3.contractMachine(L.IMPL, { id: "im", name: "Impl" }); A.im = im.anchors; add(L.IMPL, im.svg);
const fp2 = X.funcPanel(L.IMPL_PANEL, { id: "fq", buttons: [{ name: "initialize" }] }); A.fq = fp2.anchors; add(L.IMPL_PANEL, fp2.svg);
const pImpl = E1.pipe({ u: -60, v: -100 }, { id: "pim", pts: [[0, 0, 110], [0, L.IMPL.v + 100 - (-100), 110]] }); A.pim = pImpl.anchors; add({ u: -60, v: -400 }, pImpl.svg);

// L26: Parity corner (seg1 coordinates) — Library + its panel + wallets + delegatecall pipes
const lib = E3.contractMachine(L.LIB, { id: "lib", name: "Library" }); A.lib = lib.anchors; add(L.LIB, lib.svg);
const lfp = X.funcPanel(L.LIB_PANEL, { id: "lfp", buttons: [{ name: "initialize", guard: "none" }, { name: "kill", guard: "card" }] }); A.lfp = lfp.anchors; add(L.LIB_PANEL, lfp.svg);
add(L.LIB_PANEL, plateGhost("lghost", L.LIB_PANEL, 0, { n: 2 }), 0.2);
L.WALLETS.forEach((o, i) => { const h = O.hotWallet(o, { id: "hw" + i }); add(o, h.svg); });
{
  const W2 = L.WALLETS[L.WALLETS.length - 1];
  const p = E1.pipe(W2, { id: "lpm", pts: [[0, 0, 232], [0, 0, L.PIPE_Z], [L.LIB.u - 150 - W2.u, 0, L.PIPE_Z], [L.LIB.u - 150 - W2.u, 0, L.PIPE_IN_Z], [L.LIB.u - 112 - W2.u, 0, L.PIPE_IN_Z]] });
  add({ u: L.LIB.u - 150, v: L.LIB.v - 1 }, p.svg);
  L.WALLETS.slice(0, -1).forEach((o, i) => { const r = E1.pipe(o, { id: "lpr" + i, pts: [[0, 0, 232], [0, 0, L.PIPE_Z]] }); add(o, r.svg, 0.5); });
}
items.sort((a, b) => a.y - b.y);

// ---------------------------------------------------------------- movers (drawn above everything)
const coinsAt = A.tk.tray ?? A.tk.front;
const coins = [0, 1, 2, 3].map((i) => coin("cn" + i, { u: L.TOKEN.u + 40, v: L.TOKEN.v + 70 }, 20)).join("");
const lt1 = E1.letter({ u: L.Q.laptop.u, v: L.Q.laptop.v + 10 }, { id: "lt1", z: 40 });
const lt2 = E1.letter({ u: L.Q.evil.u, v: L.Q.evil.v + 60 }, { id: "lt2", z: 40, state: "attacker" });
const movers = coins + `<g id="lt1-mv" opacity="0">${lt1.svg}</g><g id="lt2-mv" opacity="0">${lt2.svg}</g>`;
const DL = (from, to) => [f(to[0] - from[0]), f(to[1] - from[1])];

const world = worldSvg("wsvg", gridSvg({ u0: -3200, u1: 3200, v0: -2600, v1: 2600 }) + items.map((x) => x.svg).join("\n") + movers, [-3400, -2200, 6400, 4200]);

// ---------------------------------------------------------------- labels (world)
let labels = "";
const lb = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, cls + " hide", a); };
const up = (p, d) => [p[0], p[1] - d];
const pin = (id, p, html, a = "c") => { labels += wpin(id, p, html, a); };
// L0–L1
A.fp.covers.forEach((c, i) => lb("lb-qm" + i, up(c, 20), "?", "lab-ink", "b"));
lb("lb-any", up(A.fp.covers[4], 20), "任何人", "lab-cs", "b");
lb("lb-doc", A.dc.top, "安全论证", "lab-gs", "b");
pin("ck-doc", [A.dc.center[0] + 40, A.dc.center[1] - 10], CHECK("ck-doc-i", 56, "hide"));
// metaphor
lb("lb-public", up(A.of.lobby, 0), "public · 大堂的门", "lab-cs", "t");
lb("lb-only", [A.of.reader[0] + 30, A.of.reader[1] - 60], "onlyOwner · 机房的门", "lab-ink", "l");
lb("lb-rekey", [A.of.reader[0] + 30, A.of.reader[1] - 60], "写字楼：可以换锁", "lab-gs", "l");
pin("ck-rekey", [A.of.reader[0], A.of.reader[1] - 40], CHECK("ck-rekey-i", 52, "hide"));
// L6
lb("lb-forever", W3(L.MAIN.u - 140, L.MAIN.v, 250), "不可升级：装错就永远错", "lab-rs", "r");
lb("lb-wrong", [A.fp.readers[0][0] - 40, A.fp.readers[0][1] + 40], "装错的锁", "lab-r", "r");
// queue
const qlab = (id, o, html, cls) => lb(id, W3(o.u, o.v + 150), html, cls + " lab-sm", "t");
qlab("lb-q0", L.Q.any, "任意外部地址", "");
qlab("lb-q1", L.Q.evil, "恶意合约", "lab-r");
qlab("lb-q2", { u: L.Q.admin.u + 90, v: L.Q.admin.v }, "被钓鱼的特权用户", "");
qlab("lb-q3", L.Q.thief, "拿到私钥的攻击者", "lab-r");
qlab("lb-q4", L.Q.insider, "内部人员 · 合法持有", "lab-ink");
// L12–L13
lb("lb-mintany", up(A.q0.head, 60).map((v, i) => v + (i ? 0 : 0)), "任何地址 · 给自己印币", "lab-rs", "b");
lb("lb-minter", [A.mc.front[0] - 70, A.mc.front[1] - 20], "持有 MINTER 角色", "lab-cs", "b");
// L14–L15
lb("lb-internal", [A.gc.side[0] - 30, A.gc.side[1]], "内部函数", "lab-ink", "r");
lb("lb-default", up(A.gc.top, 10), "默认 public", "lab-r", "b");
lb("lb-exposed", up(A.gc.top, 10), "忘写可见性 → 暴露给所有人", "lab-rs", "b");
// L16–L20
lb("lb-txo", [A.q2.head[0] - 40, A.q2.head[1] - 10], "tx.origin = 管理员", "lab-ink", "r");
lb("lb-evil", [A.q1.top[0] - 50, A.q1.top[1] + 60], "攻击者的合约", "lab-rs", "r");
const rd3 = A.fp.readers[3];
lb("lb-read1", [rd3[0] + 120, rd3[1] - 30], "读到 tx.origin = 管理员", "lab-ink", "l");
lb("lb-pass", [rd3[0] + 120, rd3[1] + 34], "检查通过", "lab-rs", "l");
lb("lb-read2", [rd3[0] + 120, rd3[1] - 30], "读到 msg.sender = 攻击者合约", "lab-cs", "l");
lb("lb-deny", [rd3[0] + 120, rd3[1] + 34], "拒绝", "lab-gs", "l");
pin("bx-rd0", [A.fp.readers[0][0] + 26, A.fp.readers[0][1] - 26], BADGE("bx-rd0-i", 50, "hide"));
pin("bx-rd3", [rd3[0] + 26, rd3[1] - 26], BADGE("bx-rd3-i", 50, "hide"));
// L21–L25
const lamp1 = A.fp.btns[1];
lb("lb-noinit", [lamp1[0] - 40, lamp1[1] - 70], "未初始化", "lab-g", "b");
lb("lb-inited", [lamp1[0] - 40, lamp1[1] - 70], "已初始化", "lab-gs", "b");
lb("lb-proxy", W3(L.MAIN.u - 140, L.MAIN.v, 250), "代理 / 克隆", "lab-cs", "r");
lb("lb-impl", [A.im.top[0] - 110, A.im.top[1] + 90], "实现合约", "lab-cs", "r");
const own = W3(L.MAIN.u - 130, L.MAIN.v, 210);
lb("lb-own0", own, "owner = 空", "lab-g", "r");
lb("lb-ownA", own, "owner = 地址 A", "lab-ink", "r");
lb("lb-ownX", own, "owner = 攻击者 · 被改写", "lab-rs", "r");
lb("lb-ownD", own, "owner = 部署者", "lab-gs", "r");
pin("bx-b1", [A.fp.btns[1][0] + 40, A.fp.btns[1][1] - 40], BADGE("bx-b1-i", 54, "hide"));
lb("lb-once", [A.fp.readers[1][0] - 30, A.fp.readers[1][1] + 40], "第二次 · 拒绝", "lab-rs", "r");
lb("lb-plate", up(A.fq.covers[0], 60), "_disableInitializers()", "lab-cs", "b");
lb("lb-locked", [A.fq.plates[0][0] + 10, A.fq.plates[0][1] + 40], "实现合约本身 · 锁死", "lab-ink", "t");
// L26
lb("lb-lib", up(A.lib.top, 30), "Parity 库合约 · 2017 年 11 月", "lab-g", "b");
lb("lb-should", up(A.lfp.covers[0], 70), "本该有：锁死", "lab-cs", "b");
lb("lb-gap", [A.lfp.readers[0][0] - 30, A.lfp.readers[0][1] + 30], "当年：没有检查", "lab-r", "r");

// ---------------------------------------------------------------- cameras
const C = (u, v, z, k, sx = 960, sy = 540) => camAt(Wp(u, v, z), sx, sy, k);
const CAMS = {
  ave: C(60, 220, 110, 1.45, 900, 560),
  meta: C(L.OFFICE.u + 20, L.OFFICE.v + 140, 170, 1.4, 900, 560),
  riv: C(-60, 200, 110, 1.6, 860, 560),
  queue: C(-60, 600, 90, 0.88, 900, 470),
  mint: C(-480, 250, 90, 1.4, 440, 600),
  glass: C(-200, 0, 110, 1.8, 760, 600),
  txo: C(-180, 560, 70, 1.05, 600, 600),
  init: C(-180, 300, 100, 1.25, 600, 560),
  implW: C(-260, -260, 120, 0.85, 560, 600),
  impl: C(L.IMPL_PANEL.u + 200, L.IMPL_PANEL.v - 120, 120, 1.55, 520, 560),
  lib: C(L.LIB_PANEL.u - 120, L.LIB_PANEL.v, 120, 1.35, 900, 640),
};

// ---------------------------------------------------------------- screen overlays: code cards + dashed leaders
const CARD = { A: { x: 1000, y: 120, w: 880 }, B: { x: 1080, y: 120, w: 800 }, C: { x: 940, y: 120, w: 940 } };
const rowY = (c, i) => c.y + 24 + 56 + 50 * i + 25;
const ok = `<span class="c-chip ok">✓</span>`, bad = `<span class="c-chip">✗</span>`;
const cardA = `<div class="k-code hide" id="cardA" style="left:${CARD.A.x}px;top:${CARD.A.y}px;width:${CARD.A.w}px">
  <div class="c-head">缺少权限检查<span class="c-tag">Solidity</span></div>
  <div class="c-row" id="ca0">function mint(address to, uint256 amt)</div>
  <div class="c-row" id="ca1">    external { _mint(to, amt); }  ${bad}<span class="c-cm"> 无检查</span></div>
  <div class="c-row" id="ca2">function mint(address to, uint256 amt)</div>
  <div class="c-row" id="ca3">    external onlyRole(MINTER_ROLE)  ${ok}</div>
</div>`;
const cardB = `<div class="k-code hide" id="cardB" style="left:${CARD.B.x}px;top:${CARD.B.y}px;width:${CARD.B.w}px">
  <div class="c-head">用 tx.origin 鉴权<span class="c-tag">Solidity</span></div>
  <div class="c-row" id="cb0">require(tx.origin == owner);   ${bad}</div>
  <div class="c-row" id="cb1">require(msg.sender == owner);  ${ok}</div>
</div>`;
const cardC = `<div class="k-code hide" id="cardC" style="left:${CARD.C.x}px;top:${CARD.C.y}px;width:${CARD.C.w}px">
  <div class="c-head">未保护的初始化<span class="c-tag">Solidity</span></div>
  <div class="c-row" id="cc0">function initialize(address _owner)</div>
  <div class="c-row" id="cc1">    external { owner = _owner; }  ${bad}</div>
  <div class="c-row" id="cc2">function initialize(address _owner)</div>
  <div class="c-row" id="cc3">    external initializer { ... }  ${ok}</div>
  <div class="c-row" id="cc4">constructor() { _disableInitializers(); } ${ok}</div>
</div>`;
const S = (cam, p) => toScreen(CAMS[cam], p);
const ov = [];
const sc = (id, P0, P3, o) => { const c = dashCurve(id, P0, P3, o); ov.push(c.svg); return c; };
const lead = (id, card, row, cam, wp, color) => {
  const P0 = [card.x - 4, rowY(card, row)], P3 = S(cam, wp);
  sc(id, P0, P3, { color, c1: [P0[0] - 160, P0[1] + 10], c2: [P3[0] + 80, P3[1] - 160] });
};
const RED = "#e0453a", TEAL = "#1d93ba";
lead("cv-a1", CARD.A, 1, "mint", A.fp.btns[0], RED);
lead("cv-a3", CARD.A, 3, "mint", A.fp.readers[0], TEAL);
lead("cv-b0", CARD.B, 0, "txo", A.fp.readers[3], RED);
lead("cv-b1", CARD.B, 1, "txo", A.fp.readers[3], TEAL);
lead("cv-c3", CARD.C, 3, "init", A.fp.covers[1], TEAL);
lead("cv-c4", CARD.C, 4, "impl", A.fq.covers[0], TEAL);
const ovSvg = `<svg id="ovl" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">${ov.join("")}</svg>`;

// six-defect strip (top-left)
const DEF = ["缺少权限检查", "tx.origin 鉴权", "未保护的初始化"];
const strip = `<div class="dz hide" id="dz"><span class="dz-t">六种缺陷</span>${[0, 1, 2, 3, 4, 5].map((i) => `<span class="dz-s" id="dz${i}">${i + 1}</span>`).join("")}<span class="dz-n" id="dzn">${DEF.map((d, i) => `<span class="dz-name" id="dzn${i}">${d}</span>`).join("")}</span></div>`;

// ---------------------------------------------------------------- times
const TM = {
  mod: w("修改状态", 0), who: w("谁可以调用我", 0),
  anyone: w("任何人", 1), prove: w("证明", 1), safe1: w("安全", 1),
  meta: w("打个比方", 2), bld: w("写字楼", 2),
  pub: w("public", 3), lobby: w("大堂的门", 3), enter: w("谁都能进", 3),
  only: w("onlyOwner", 4), room: w("机房的门", 4), swipe: w("刷卡", 4),
  fail: w("不成立", 5), rekey: w("换锁", 5),
  noUp: w("不能升级", 6), wrong: w("装错", 6), forever: w("永远", 6),
  doors: w("这些门", 7), five: w("五类", 7),
  any: w("任意外部地址", 8), evil: w("恶意合约", 8), phish: w("被钓鱼", 8), thief: w("拿到私钥", 8),
  ins: w("内部人员", 9), legit: w("合法持有", 9),
  six: w("六种", 10), three: w("前三种", 10),
  d1: w("第一种", 11), noChk: w("缺少权限检查", 11),
  mintF: w("增发函数", 12), pubF: w("对外公开", 12), mod12: w("修饰器", 12), anyAddr: w("任何地址", 12), print: w("印币", 12),
  onlyRole: w("onlyRole", 13), minter: w("MINTER", 13),
  old: w("老合约", 14), sol: w("Solidity", 14), dflt: w("默认", 14),
  forgot: w("忘写可见性", 15), internal: w("内部函数", 15), all: w("所有人", 15),
  d2: w("第二种", 16), txo16: w("tx.origin", 16),
  origin: w("最初签名", 17),
  airdrop: w("领空投", 18), evilC: w("攻击者的合约", 18), again: w("再来调用", 18),
  still: w("仍然是管理员", 19), pass: w("检查通过", 19),
  sender: w("msg.sender", 20), direct: w("直接调用者", 20), fake: w("冒充不了", 20),
  d3: w("第三种", 21), initF: w("初始化函数", 21),
  upg: w("可升级合约", 22), clone: w("克隆合约", 22), initW: w("initialize", 22), ctor: w("构造函数", 22),
  none: w("没人调用", 23), rep: w("重复调用", 23), first: w("谁先调用", 23), owner23: w("owner", 23),
  two: w("两步", 24), initer: w("initializer", 24), once: w("执行一次", 24),
  step2: w("第二步", 25), ctor25: w("构造函数", 25), dis: w("disableInitializers", 25), lock: w("锁死", 25),
  parity: w("Parity", 26), miss: w("缺的正是", 26),
};

// term cards (RETROFIT-deps rule 2) — below the keyword strip when it is up
const TC = termCards([
  { id: "mod", t: "修饰器", d: "函数执行前先做权限等检查的写法", at: TM.mod12 },
  { id: "sol", t: "Solidity", d: "编写以太坊合约的编程语言", at: TM.sol, top: 230 },
  { id: "vis", t: "可见性", d: "规定函数能被谁调用的设置", at: w("可见性", 15), top: 230 },
  { id: "eoa", t: "外部账户", d: "由私钥控制的普通账户 · 不是合约", at: w("外部账户", 17) },
  { id: "ctor", t: "构造函数", d: "合约部署时自动执行一次的函数", at: TM.ctor, top: 790 },
  { id: "impl", t: "实现合约", d: "存放代码逻辑、被别的合约借用的合约", at: w("实现合约", 25) },
]);

// movement deltas (world-canvas px)
const MV = {
  q0toMint: DL(at(L.Q.any), at(L.AT_MINT)),
  coin: [0, 1, 2, 3].map((i) => DL(at({ u: L.TOKEN.u + 40, v: L.TOKEN.v + 70 }, 0, 0, 20), at(L.AT_MINT, 50 - i * 14, 70 + i * 6, 40 + i * 8))),
  mck: DL(at(oMcCard, 0, 0, 40), A.fp.slots[0]),
  mp: metaPeople.map((o) => DL(at(o), A.of.lobbyIn)),
  me: DL(at(oEng), at({ u: L.OFFICE.u + 120, v: L.OFFICE.v + 200 })),
  mek: DL(at(oMeCard, 0, 0, 60), A.of.reader),
  rp: reach.map((o) => { const a = at(o), b = A.gc.side; return [f((b[0] - a[0]) * 0.35), f((b[1] - a[1]) * 0.35 + 30)]; }),
  lt1: DL(at({ u: L.Q.laptop.u, v: L.Q.laptop.v + 10 }), at(L.Q.evil, 0, 60, 0)),
  lt2: DL(at({ u: L.Q.evil.u, v: L.Q.evil.v + 60 }), [rd3[0], rd3[1] + 60]),
  q3toInit: DL(at(L.Q.thief), at(L.AT_INIT)),
  q3back: DL(at(L.Q.thief), at({ u: L.AT_INIT.u - 160, v: L.AT_INIT.v + 140 })),
  q0toInit: DL(at(L.Q.any), at(L.AT_INIT0)),
};

const GROWN = ["dcs", "of", "mp0", "mp1", "mp2", "me", "ms", "mek", "q0", "q1", "q2", "lap", "q3", "q3k", "q4", "q4c", "tk", "mc", "mck", "rp0", "rp1", "rp2", "im", "fq"];
const FADED = ["qline", "pim", "gc"];

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 84px; }
    .kw { position: absolute; left: 56px; top: 116px; font-size: 44px; font-weight: 900; color: #1c1c1c; background: #fffdf8; border-radius: 16px; padding: 10px 28px 14px;
      box-shadow: 0 10px 24px rgba(70,60,40,0.12); white-space: nowrap; }
    .kw b { color: #1d93ba; }
    .kw .gtag { display: inline-block; font-size: 30px; font-weight: 800; color: #6d685e; background: #ebe6dc; border-radius: 8px; padding: 2px 12px 4px; margin-right: 14px; vertical-align: 6px; }
    .k-code .c-chip.ok { background: #1f9d55; }
    .k-code .c-row { white-space: pre; }
    .dz { position: absolute; left: 56px; top: 30px; height: 60px; display: flex; align-items: center; gap: 10px; background: #fffdf8; border-radius: 14px; padding: 0 18px;
      box-shadow: 0 6px 16px rgba(70,60,40,0.10); }
    .dz-t { font-size: 30px; font-weight: 900; margin-right: 6px; white-space: nowrap; }
    .dz-s { width: 44px; height: 44px; border-radius: 10px; border: 3px dashed #c9c1b2; color: #8a8478; font: 800 28px/38px "Noto Sans SC", sans-serif; text-align: center; }
    .dz-s.lit { border: 3px solid #1d93ba; color: #1d93ba; }
    .dz-s.cur { background: #1c1c1c; border-color: #1c1c1c; color: #ffffff; }
    .dz-n { position: relative; width: 300px; height: 44px; margin-left: 8px; }
    .dz-name { position: absolute; left: 0; top: 0; font-size: 30px; font-weight: 800; line-height: 44px; white-space: nowrap; opacity: 0; }
    .tally { position: absolute; right: 56px; top: 120px; font-size: 40px; font-weight: 900; background: #1c1c1c; color: #fff; border-radius: 14px; padding: 8px 24px 12px; }
    .stamp { position: absolute; font-size: 40px; font-weight: 900; color: #6d685e; border: 6px solid #8a8478; border-radius: 12px; padding: 6px 26px 10px; transform: rotate(-6deg); background: rgba(255,253,248,0.92); white-space: nowrap; }
    .gnote { position: absolute; font-size: 30px; font-weight: 800; color: #6d685e; background: #ebe6dc; border-radius: 10px; padding: 4px 16px 6px; white-space: nowrap; }
${termCss()}
    #fp-lamp-0, #fp-lamp-2, #fp-lamp-3, #fp-lamp-4 { opacity: 0; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div class="kw hide" id="kw-who">每个修改状态的函数 · <b>谁可以调用我？</b></div>
      <div class="kw hide" id="kw-meta"><span class="gtag">比喻</span>合约像一栋写字楼</div>
      <div class="kw hide" id="kw-q">谁会来试这些门 · 大致 <b>五类</b></div>
      <div class="kw hide" id="kw-six">六种常见缺陷 · 先看 <b>前三种</b></div>
      <div class="kw hide" id="kw-sol">Solidity &lt; 0.5 · 函数默认 <b>public</b></div>
      <div class="kw hide" id="kw-init">可升级 / 克隆合约 · <b>initialize</b> 代替构造函数</div>
      <div class="tally hide" id="tally">5 类</div>
      <div class="stamp hide" id="stamp-m" style="left:1180px;top:200px">比喻在这里不成立</div>
      <div class="kw hide" id="kw-interp" style="top:30px"><span class="gtag">解读</span>缺的这一步：<b>锁死实现合约</b></div>
      ${strip}${cardA}${cardB}${cardC}${ovSvg}
      ${pills(2, { sections: SECTIONS })}
      ${TC.html}
      <div class="k-title" id="ttl-card"><div class="t-main">② 门没装锁</div><div class="t-sub">谁可以调用我 · 前三种缺陷</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E3.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const MV = ${JSON.stringify(MV)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const X1 = window.KITX01, X3 = window.KITX03, X5 = window.KITX05;
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const fly = (id, t, d, dur, lift, ease) => X5.fly(tl, id, t, +d[0], +d[1], dur, lift, ease);
      const flash = (sel, t, n) => tl.fromTo(sel, { opacity: 1 }, { opacity: 0.25, duration: 0.18, yoyo: true, repeat: (n || 3) * 2 - 1, ease: "power1.inOut", immediateRender: false }, t);
      const swap = (a, b, t, d) => KIT.swap(tl, a, b, t, d || 0.25);
      ${JSON.stringify(GROWN)}.forEach((id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); });
      ${JSON.stringify(FADED)}.forEach((id) => tl.set("#" + id, { opacity: 0 }, 0));
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      const show = (id, t, d) => tl.to("#" + id, { opacity: 1, duration: d || 0.35, ease: "power1.out" }, t);
      const slot = (i, cls, t) => tl.set("#dz" + i, { className: "dz-s " + cls }, t);
      const dzName = (i, t) => { [0, 1, 2].forEach((j) => tl.to("#dzn" + j, { opacity: j === i ? 1 : 0, duration: 0.2 }, t)); };

      KIT.camSet(tl, CAMS.ave);
      // ===== 0–1.6 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.2);
      // ===== L0 every state-changing function must answer: who may call me?
      pop("#kw-who", ${f(TM.mod)}, 0.3);
      [0, 1, 2, 3, 4].forEach((i) => pop("#lb-qm" + i, ${f(TM.who - 0.3)} + i * 0.1, 0.25));
      // ===== L1 if "anyone", prove anyone calling it is safe
      out("#lb-qm4", ${f(TM.anyone - 0.3)}, 0.15);
      fadeIn("#stk", ${f(TM.anyone - 0.4)}, 0.25);
      pop("#lb-any", ${f(TM.anyone)}, 0.3);
      grow("dcs", ${f(TM.prove - 0.3)}, 0.45); pop("#lb-doc", ${f(TM.prove)}, 0.25);
      pop("#ck-doc-i", ${f(TM.safe1)}, 0.3);
      // ===== L2 metaphor: an office building
      out("#kw-who, #lb-qm0, #lb-qm1, #lb-qm2, #lb-qm3, #lb-any, #lb-doc, #ck-doc-i", ${f(LS[2] - 0.1)}, 0.2);
      out("#stk", ${f(LS[2])}, 0.2);
      KIT.cam(tl, ${f(LS[2] - 0.1)}, CAMS.meta, 1.2);
      pop("#kw-meta", ${f(TM.meta + 0.2)}, 0.3);
      grow("of", ${f(LS[2] + 0.3)}, 0.6);
      // ===== L3 public = the lobby door, anyone can walk in
      [0, 1, 2].forEach((i) => grow("mp" + i, ${f(LS[3])} + i * 0.12, 0.35));
      pop("#lb-public", ${f(TM.lobby)}, 0.3);
      [0, 1, 2].forEach((i) => { fly("mp" + i + "-mv", ${f(TM.enter - 0.6)} + i * 0.35, MV.mp[i], 0.9, 0, "power1.inOut"); out("#mp" + i + "-mv", ${f(TM.enter + 0.1)} + i * 0.35, 0.2); });
      // ===== L4 onlyOwner = the server-room door, card needed
      grow("me", ${f(LS[4])}, 0.35); grow("mek", ${f(LS[4] + 0.1)}, 0.35);
      fly("me-mv", ${f(TM.only)}, MV.me, 0.8); fly("mek-mv", ${f(TM.only)}, MV.me, 0.8);
      pop("#lb-only", ${f(TM.room)}, 0.3);
      fly("mek-mv", ${f(TM.swipe - 0.5)}, MV.mek, 0.5, 20);
      KIT.led(tl, "of-led", ${f(TM.swipe)}, "green");
      swap("#of-dc", "#of-do", ${f(TM.swipe + 0.25)}, 0.3);
      // ===== L5 where it breaks: an office can change its locks
      out("#lb-only", ${f(LS[5])}, 0.2); out("#mek-mv", ${f(LS[5])}, 0.2);
      swap("#of-do", "#of-dc", ${f(LS[5])}, 0.3);
      pop("#stamp-m", ${f(TM.fail - 0.2)}, 0.3);
      grow("ms", ${f(TM.fail)}, 0.4);
      X5.fly(tl, "of-rdA", ${f(TM.rekey - 0.6)}, 70, -60, 0.5, 0, "power2.in"); out("#of-rdA", ${f(TM.rekey - 0.3)}, 0.2);
      fadeIn("#of-rdBw", ${f(TM.rekey)}, 0.2); X5.fly(tl, "of-rdB", ${f(TM.rekey - 0.3)}, 0, 0, 0.01);
      KIT.led(tl, "of-ledB", ${f(TM.rekey + 0.4)}, "green");
      pop("#lb-rekey", ${f(TM.rekey + 0.2)}, 0.3); pop("#ck-rekey-i", ${f(TM.rekey + 0.4)}, 0.3);
      // ===== L6 a contract that can't be upgraded: a wrong lock is wrong forever
      out("#kw-meta, #lb-public, #lb-rekey, #ck-rekey-i, #ms, #me-mv, #of", ${f(LS[6] - 0.1)}, 0.3);
      tl.to("#stamp-m", { x: -120, y: 120, duration: 1.0, ease: "power2.inOut" }, ${f(LS[6] - 0.1)});
      KIT.cam(tl, ${f(LS[6] - 0.1)}, CAMS.riv, 1.2);
      X5.guard(tl, "fp", 0, ${f(TM.wrong - 0.2)}, "broken");
      pop("#lb-wrong", ${f(TM.wrong)}, 0.3);
      tl.fromTo(".rv-r", { opacity: 0 }, { opacity: 1, duration: 0.12, stagger: 0.035, immediateRender: false }, ${f(TM.noUp - 0.4)});
      pop("#lb-forever", ${f(TM.forever - 0.3)}, 0.3);
      // ===== L7 who will try these doors? five kinds
      out("#stamp-m, #lb-forever, #lb-wrong", ${f(LS[7] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[7] - 0.1)}, CAMS.queue, 1.3);
      show("qline", ${f(LS[7] + 0.6)}, 0.4);
      pop("#kw-q", ${f(TM.doors)}, 0.3);
      // ===== L8 four kinds walk up
      grow("q0", ${f(TM.any - 0.2)}, 0.4); pop("#lb-q0", ${f(TM.any + 0.2)}, 0.25);
      grow("q1", ${f(TM.evil - 0.2)}, 0.4); pop("#lb-q1", ${f(TM.evil + 0.2)}, 0.25);
      grow("q2", ${f(TM.phish - 0.3)}, 0.4); grow("lap", ${f(TM.phish - 0.15)}, 0.4); pop("#lb-q2", ${f(TM.phish + 0.2)}, 0.25);
      grow("q3", ${f(TM.thief - 0.2)}, 0.4); grow("q3k", ${f(TM.thief)}, 0.35); pop("#lb-q3", ${f(TM.thief + 0.2)}, 0.25);
      // ===== L9 and insiders, who legitimately hold access
      grow("q4", ${f(TM.ins - 0.2)}, 0.4); grow("q4c", ${f(TM.ins)}, 0.35); pop("#lb-q4", ${f(TM.ins + 0.2)}, 0.25);
      pop("#tally", ${f(TM.legit)}, 0.3);
      // ===== L10 six common defects; the first three now
      out("#kw-q, #tally, #lb-q0, #lb-q1, #lb-q2, #lb-q3, #lb-q4", ${f(LS[10] - 0.1)}, 0.2);
      pop("#kw-six", ${f(TM.six - 0.2)}, 0.3);
      pop("#dz", ${f(TM.six)}, 0.3);
      [0, 1, 2].forEach((i) => slot(i, "lit", ${f(TM.three)} + i * 0.15));
      // ===== L11 #1 missing access check
      out("#kw-six", ${f(LS[11] - 0.1)}, 0.2);
      out("#q1, #q2, #lap, #q3-mv, #q3k-mv, #q4, #q4c, #qline", ${f(LS[11])}, 0.3);
      slot(0, "cur", ${f(TM.d1)}); dzName(0, ${f(TM.d1)});
      KIT.cam(tl, ${f(LS[11] - 0.1)}, CAMS.mint, 1.2);
      grow("tk", ${f(LS[11] + 0.4)}, 0.4);
      pop("#cardA", ${f(TM.noChk)}, 0.35);
      flash("#fp-gap-0", ${f(TM.noChk + 0.3)}, 2);
      // ===== L12 a public mint with no modifier: any address can print coins for itself
      fly("q0-mv", ${f(TM.mintF - 0.3)}, MV.q0toMint, 1.1, 0, "power1.inOut");
      KIT.draw(tl, "cv-a1", ${f(TM.mod12)}, 0.6);
      X5.press(tl, "fp", 0, ${f(TM.anyAddr)}, { status: "red" });
      [0, 1, 2, 3].forEach((i) => { fadeIn("#cn" + i, ${f(TM.anyAddr + 0.3)} + i * 0.18, 0.1); fly("cn" + i, ${f(TM.anyAddr + 0.35)} + i * 0.18, MV.coin[i], 0.7, 60, "power1.out"); });
      pop("#lb-mintany", ${f(TM.print - 0.3)}, 0.3);
      // ===== L13 fix: onlyRole — only an address holding MINTER
      out("#cv-a1, #lb-mintany", ${f(LS[13] - 0.1)}, 0.2);
      X5.guard(tl, "fp", 0, ${f(TM.onlyRole - 0.3)}, "card");
      X5.swipe(tl, "fp", 0, ${f(TM.onlyRole + 0.5)}, false); pop("#bx-rd0-i", ${f(TM.onlyRole + 0.9)}, 0.25);
      grow("mc", ${f(LS[13] + 0.2)}, 0.4); grow("mck", ${f(LS[13] + 0.4)}, 0.35);
      out("#bx-rd0-i", ${f(TM.minter - 0.4)}, 0.15);
      pop("#lb-minter", ${f(TM.minter - 0.2)}, 0.25);
      fly("mck-mv", ${f(TM.minter)}, MV.mck, 0.7, 50);
      X5.swipe(tl, "fp", 0, ${f(TM.minter + 0.7)}, true); X5.press(tl, "fp", 0, ${f(TM.minter + 1.2)}, { status: "green" });
      KIT.draw(tl, "cv-a3", ${f(TM.minter + 0.2)}, 0.6);
      // ===== L14 old contracts: before Solidity 0.5 functions were public by default
      out("#cardA, #cv-a3, #lb-minter, #mck-mv", ${f(LS[14] - 0.1)}, 0.2);
      out("#mc, #tk, #q0-mv", ${f(LS[14] + 0.2)}, 0.3);
      ${JSON.stringify([0, 1, 2, 3].map((i) => "#cn" + i))}.forEach((s) => out(s, ${f(LS[14])}, 0.2));
      KIT.cam(tl, ${f(LS[14] - 0.1)}, CAMS.glass, 1.2);
      show("gc", ${f(TM.old)}, 0.4);
      pop("#kw-sol", ${f(TM.sol - 0.2)}, 0.3);
      pop("#lb-internal", ${f(TM.sol + 0.3)}, 0.3);
      pop("#lb-default", ${f(TM.dflt)}, 0.3);
      // ===== L15 forget the visibility and the internal function is exposed to everyone
      [0, 1, 2].forEach((i) => { grow("rp" + i, ${f(TM.forgot - 0.3)} + i * 0.15, 0.4); fly("rp" + i + "-mv", ${f(TM.internal)} + i * 0.2, MV.rp[i], 0.6); });
      swap("#lb-default", "#lb-exposed", ${f(TM.internal)}, 0.25);
      swap("#gc-btn", "#gc-btnR", ${f(TM.all - 0.4)}, 0.2);
      tl.fromTo("#gc-fl", { opacity: 0 }, { opacity: 0.8, duration: 0.1, yoyo: true, repeat: 3, immediateRender: false }, ${f(TM.all - 0.3)});
      // ===== L16 #2 using tx.origin for authentication
      out("#kw-sol, #lb-internal, #lb-exposed, #rp0-mv, #rp1-mv, #rp2-mv", ${f(LS[16] - 0.1)}, 0.2);
      slot(0, "lit", ${f(TM.d2)}); slot(1, "cur", ${f(TM.d2)}); dzName(1, ${f(TM.d2)});
      KIT.cam(tl, ${f(LS[16] - 0.1)}, CAMS.txo, 1.3);
      out("#gc", ${f(LS[16])}, 0.3);
      fadeIn("#q1, #q2, #lap", ${f(LS[16] + 0.4)}, 0.4);
      pop("#cardB", ${f(TM.txo16)}, 0.35);
      X5.guard(tl, "fp", 3, ${f(TM.txo16 + 0.4)}, "card");
      // ===== L17 tx.origin = the external account that signed first
      pop("#lb-txo", ${f(TM.origin - 0.3)}, 0.3);
      // ===== L18 the admin claims an airdrop → attacker's contract → calls yours
      swap("#lap-scr", "#lap-scr2", ${f(TM.airdrop - 0.3)}, 0.3);
      fadeIn("#lt1-mv", ${f(TM.evilC - 0.5)}, 0.15); fly("lt1-mv", ${f(TM.evilC - 0.45)}, MV.lt1, 0.8, 70);
      out("#lt1-mv", ${f(TM.evilC + 0.35)}, 0.15);
      pop("#lb-evil", ${f(TM.evilC)}, 0.3);
      fadeIn("#lt2-mv", ${f(TM.again - 0.4)}, 0.15); fly("lt2-mv", ${f(TM.again - 0.35)}, MV.lt2, 1.0, 90);
      // ===== L19 tx.origin is still the admin: the check passes
      out("#lt2-mv", ${f(LS[19] + 0.1)}, 0.2);
      X5.swipe(tl, "fp", 3, ${f(TM.still - 0.3)}, true);
      pop("#lb-read1", ${f(TM.still)}, 0.3);
      X5.lid(tl, "fp", 3, ${f(TM.pass - 0.4)}, 95, 0.35);
      X5.press(tl, "fp", 3, ${f(TM.pass - 0.1)}, { status: "red" });
      pop("#lb-pass", ${f(TM.pass)}, 0.3);
      KIT.draw(tl, "cv-b0", ${f(TM.pass + 0.2)}, 0.6);
      // ===== L20 fix: read msg.sender, the direct caller — the contract in between can't fake it
      out("#cv-b0, #lb-pass", ${f(LS[20] - 0.1)}, 0.2);
      X5.lid(tl, "fp", 3, ${f(LS[20])}, 0, 0.35);
      X5.rd(tl, "fp", 3, ${f(LS[20])}, "off");
      swap("#lb-read1", "#lb-read2", ${f(TM.sender)}, 0.25);
      X5.swipe(tl, "fp", 3, ${f(TM.direct - 0.4)}, false);
      pop("#bx-rd3-i", ${f(TM.direct)}, 0.25);
      pop("#lb-deny", ${f(TM.direct + 0.2)}, 0.3);
      KIT.draw(tl, "cv-b1", ${f(TM.fake - 0.6)}, 0.6);
      // ===== L21 #3 unprotected initializer
      out("#cardB, #cv-b1, #lb-read2, #lb-deny, #bx-rd3-i, #lb-txo, #lb-evil", ${f(LS[21] - 0.1)}, 0.2);
      out("#q1, #q2, #lap", ${f(LS[21] + 0.2)}, 0.3);
      slot(1, "lit", ${f(TM.d3)}); slot(2, "cur", ${f(TM.d3)}); dzName(2, ${f(TM.d3)});
      KIT.cam(tl, ${f(LS[21] - 0.1)}, CAMS.init, 1.3);
      pop("#cardC", ${f(TM.initF)}, 0.35);
      pop("#lb-noinit", ${f(TM.initF + 0.3)}, 0.3);
      flash("#fp-btn-1", ${f(TM.initF + 0.2)}, 2);
      // ===== L22 upgradeable and clone contracts use initialize instead of a constructor
      out("#lb-noinit", ${f(LS[22])}, 0.2);
      KIT.cam(tl, ${f(LS[22])}, CAMS.implW, 1.2);
      grow("im", ${f(TM.upg - 0.2)}, 0.5); grow("fq", ${f(TM.upg)}, 0.45); show("pim", ${f(TM.upg + 0.3)}, 0.4);
      pop("#lb-impl", ${f(TM.upg + 0.3)}, 0.3);
      pop("#lb-proxy", ${f(TM.clone)}, 0.3);
      pop("#kw-init", ${f(TM.initW - 0.2)}, 0.3);
      // ===== L23 never called, or callable again: whoever calls first is owner
      out("#kw-init, #lb-proxy, #lb-impl", ${f(LS[23] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[23] - 0.1)}, CAMS.init, 1.1);
      pop("#lb-own0", ${f(TM.none)}, 0.3);
      // callable again: one address sets owner, then the attacker overwrites it (whoever calls first / last wins)
      X5.fly(tl, "q0-mv", ${f(LS[23] - 0.3)}, +MV.q0toInit[0], +MV.q0toInit[1], 0.01);
      fadeIn("#q0-mv", ${f(LS[23] + 0.2)}, 0.3);
      X5.press(tl, "fp", 1, ${f(TM.rep - 0.3)}, { status: "green" }); swap("#lb-own0", "#lb-ownA", ${f(TM.rep - 0.2)}, 0.2);
      X5.fly(tl, "q3-mv", ${f(TM.rep - 0.3)}, +MV.q3toInit[0], +MV.q3toInit[1], 0.01);
      fadeIn("#q3-mv", ${f(TM.rep)}, 0.3);
      X5.press(tl, "fp", 1, ${f(TM.first - 0.2)}, { status: "red" });
      swap("#lb-ownA", "#lb-ownX", ${f(TM.first - 0.1)}, 0.2);
      flash("#lb-ownX", ${f(TM.owner23)}, 2);
      // ===== L24 fix step 1: initializer — runs only once
      out("#q0-mv", ${f(LS[24])}, 0.3);
      X5.fly(tl, "q3-mv", ${f(LS[24])}, +MV.q3back[0], +MV.q3back[1], 0.6, 0, "power2.inOut");
      swap("#lb-ownX", "#lb-ownD", ${f(TM.two)}, 0.2);
      X5.press(tl, "fp", 1, ${f(TM.initer - 0.4)}, { status: "green" });
      KIT.led(tl, "fp-lamp-1", ${f(TM.initer - 0.2)}, "green");
      tl.set("#fp-lamp-1", { opacity: 1 }, 0);
      pop("#lb-inited", ${f(TM.initer)}, 0.3);
      X5.guard(tl, "fp", 1, ${f(TM.initer + 0.2)}, "card");
      KIT.draw(tl, "cv-c3", ${f(TM.initer + 0.4)}, 0.6);
      X5.swipe(tl, "fp", 1, ${f(TM.once - 0.4)}, false);
      pop("#bx-b1-i", ${f(TM.once)}, 0.25); pop("#lb-once", ${f(TM.once + 0.1)}, 0.3);
      // ===== L25 step 2: in the implementation's constructor, disable initializers — lock the implementation itself
      out("#cv-c3, #lb-once, #bx-b1-i, #lb-inited, #lb-ownD, #q3-mv", ${f(LS[25] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[25] - 0.1)}, CAMS.impl, 1.3);
      pop("#lb-impl", ${f(LS[25] + 0.6)}, 0.3);
      X3.spin(tl, "im", ${f(TM.ctor25 - 0.3)}, 1.4, 1, "power2.inOut");
      flash("#lb-impl", ${f(TM.ctor25)}, 1);
      X5.guard(tl, "fq", 0, ${f(TM.dis - 0.4)}, "plate", 0.6);
      pop("#lb-plate", ${f(TM.dis + 0.3)}, 0.3);
      KIT.draw(tl, "cv-c4", ${f(TM.dis + 0.6)}, 0.6);
      pop("#lb-locked", ${f(TM.lock)}, 0.3);
      // ===== L26 the Parity library was missing exactly this step
      out("#cardC, #cv-c4, #lb-plate, #lb-locked, #lb-impl, #dz", ${f(LS[26] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[26] - 0.1)}, CAMS.lib, 1.2);
      out("#im, #fq, #pim", ${f(LS[26] + 0.3)}, 0.3);
      pop("#lb-lib", ${f(TM.parity)}, 0.3);
      pop("#lb-gap", ${f(TM.parity + 0.4)}, 0.3);
      X5.guard(tl, "lfp", 0, ${f(TM.parity + 0.2)}, "broken");
      tl.fromTo("#lghost", { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", immediateRender: false }, ${f(TM.miss - 0.2)});
      pop("#lb-should", ${f(TM.miss)}, 0.3);
      out("#lb-lib", ${f(TM.miss + 0.1)}, 0.2);
      pop("#kw-interp", ${f(TM.miss + 0.3)}, 0.3);
      tl.set({}, {}, ${f(TOTAL)});
      ${TC.js}
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
// ep03 contractMachine: long nameplates ("Contract", "Library") leave a negative-width screen rect → clamp to 0
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html.replace(/width="-[0-9.]+"/g, 'width="0"'));
console.log("wrote compositions/story.html", html.length, "bytes");
