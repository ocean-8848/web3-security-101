// world.mjs — static geometry for ep07 seg5a「⑤ 授权风险」(painter-ordered SVG + anchors).
import { G, at, f, cyl, M, contactShadow, worldSvg, gridSvg } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import { P, rel, off, BRIDGE, BR_BNB, CHAIN_BNB, BR_ETH, CHAIN_ETH } from "./layout.mjs";

const items = [];
const add = (Y, svg) => items.push({ Y, svg });
export const A = {}, OR = {};
const obj = (key, fn, pt, opts, dy = 0) => { const o = G(pt[0], pt[1]); const r = fn(o, opts); A[key] = r.anchors; OR[key] = o; add(at(o)[1] + dy, r.svg); return r; };
const grp = (id, o, s, extra = "") => { const [ox, oy] = at(o); return `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}"${extra}>${s}</g>`; };
/** world (du, dv) between two canvas ground points */
export const dUV = (from, to) => { const a = G(from[0], from[1]), b = G(to[0], to[1]); return [b.u - a.u, b.v - a.v]; };
/** scale an object's svg about its ground point (static props only) */
const scaled = (svg, o, k) => { const [x, y] = at(o); return `<g transform="translate(${f(x)} ${f(y)}) scale(${k}) translate(${f(-x)} ${f(-y)})">${svg}</g>`; };
const sA = (o, k, p) => { const [x, y] = at(o); return [x + (p[0] - x) * k, y + (p[1] - y) * k]; };

/** a short stack of gold coins (n coins, 2 columns) */
const coins = (o, n, r = 17) => {
  let s = contactShadow(o, r * 2.4, r * 1.6);
  const cols = [[-12, -6], [14, 8]];
  for (let c = 0; c < cols.length; c++) for (let k = 0; k < n; k++) s += cyl(o, cols[c][0], cols[c][1], r, k * 6, k * 6 + 5.4, M.gold, { seg: 22, sw: 1 });
  return s;
};

// ------------------------------------------------------------------ seg1 far bank (static scenery)
obj("br", E1.bridge, BRIDGE, { id: "br" });
obj("bbnb", E3.contractMachine, BR_BNB, { id: "bbnb", name: "BNB" });
obj("cbnb", O.chain, CHAIN_BNB, { id: "cbnb", n: 3 });
obj("beth", E3.contractMachine, BR_ETH, { id: "beth", name: "ETH" });
obj("ceth", O.chain, CHAIN_ETH, { id: "ceth", n: 3 });

// ------------------------------------------------------------------ zone A: approve race
obj("signA", E1.signBoard, P.signA, { id: "sgA", text: "授权", size: 56, style: "wood" });
obj("walA", O.hotWallet, P.walA, { id: "wa", gold: true });
obj("alice", O.person, P.alice, { id: "al", role: "signer", scale: 1.0 });
obj("bob", O.person, P.bob, { id: "bo", role: "attacker", scale: 1.0 });
obj("mp", E1.mempool, P.mp, { id: "mp", n: 0, sign: "等待打包" });
obj("blk", O.chain, P.blk, { id: "bk", n: 2 });
obj("ctr", E2.rollCounter, P.ctr, { id: "ct", digits: 3, value: 0 });

// Alice's keycard (allowance 100): starts at the wallet's front, ends in Bob's hand
{
  const o = G(...rel(P.walA, 40, 130));
  const r = E5.keycard(o, { id: "kcA", role: "upgrader", text: "ALLOW", scale: 2.2, z: 110, lanyard: false });
  A.kcA = r.anchors; OR.kcA = o;
  add(at(G(...P.bob))[1] + 60, `<g id="mkA">${r.svg}</g>`);
  A.kcAto = rel(P.bob, 40, 75); // ground point in front of Bob's hand
  A.kcAstart = rel(P.walA, 40, 130);
}
// letters (transactions). Built at their senders; moved with GSAP x/y on the wrapper <g id="m*">
const LET = { w: 84, h: 54, lift: 12 };
const letterAt = (key, pt, red) => {
  const o = G(...pt), r = E1.letter(o, { id: "l" + key, ...LET, state: red ? "attacker" : "normal" });
  A["l" + key] = r.anchors; add(5000 + items.length, `<g id="m${key}" opacity="0">${r.svg}</g>`); return pt;
};
export const LSTART = {
  A1: letterAt("A1", rel(P.alice, 70, 60), false),     // Alice: approve(50)
  B1: letterAt("B1", rel(P.bob, 80, 40), true),        // Bob: spend 100
  B2: letterAt("B2", rel(P.bob, 80, 40), true),        // Bob: spend 50
  A2: letterAt("A2", rel(P.alice, 70, 60), false),     // Alice: decrease 50 (mitigation ②)
  B3: letterAt("B3", rel(P.bob, 80, 40), true),        // Bob: spend 100 (mitigation ②)
};

// ------------------------------------------------------------------ zone B: infinite approval + phishing
obj("walB", O.hotWallet, P.walB, { id: "wb", gold: true });
obj("user", O.person, P.user, { id: "us", role: "signer", scale: 1.0 });
obj("proto", E3.contractMachine, P.proto, { id: "pr", name: "协议" });
obj("protoR", E3.contractMachine, P.proto, { id: "prR", name: "协议", state: "attacker" }, 0.01);
obj("atkB", O.person, P.atkB, { id: "ab", role: "attacker", scale: 1.0 });
obj("phish", O.browserWin, P.phish, { id: "ph", state: "attacker", title: "•••••••••••", heading: "授权请求", button: "签名" });
{
  const o = G(...rel(P.user, 60, 40));
  const r = E5.keycard(o, { id: "kcI", role: "upgrader", text: "∞", scale: 2.2, z: 110, lanyard: false });
  A.kcI = r.anchors; add(at(o)[1] + 300, `<g id="mkI" opacity="0">${r.svg}</g>`);
  A.kcIstart = rel(P.user, 60, 40);
}
// gold coins in front of the user's wallet (flow to the attacker)
["gB1", "gB2"].forEach((id, i) => {
  const o = G(...rel(P.walB, 20 + i * 70, 150 + i * 30));
  add(at(o)[1] + 1, grp(id, o, coins(o, 4)));
  A[id] = { top: at(o, 0, 0, 50), ground: at(o) };
});

// ------------------------------------------------------------------ zone C: the router (any call + approval)
const rt = obj("rt", E3.contractMachine, P.rt, { id: "rt", name: "路由" });
obj("tok", E1.miniVend, P.tok, { id: "tk", kind: "token" });
obj("atkC", O.person, P.atkC, { id: "ac", role: "attacker", scale: 1.0 });
obj("fake", E1.miniVend, P.fake, { id: "fk", kind: "attacker" });
obj("cp", O.checkpoint, P.cp, { id: "cpk", n: "?", armUp: false });
const rd = obj("route", O.doc, P.route, { id: "rd", title: "路线", lines: ["pool: ______", "tokenIn: USDC", "amountIn: 100"], standing: true, w: 160, h: 200 });
obj("rule", E1.signBoard, P.rule, { id: "rl", style: "wood", text: "持有授权 → 禁止任意目标和任意 calldata", size: 34 });
// a row of user wallets behind the router (scaled 0.55), each with its keycard plugged into the router's roof
const WK = 0.55;
A.wals = [];
P.wals.forEach((pt, i) => {
  const o = G(...pt), r = O.hotWallet(o, { id: "w" + i, gold: true });
  add(at(o)[1], scaled(r.svg, o, WK));
  A.wals.push({ top: sA(o, WK, r.anchors.top), center: sA(o, WK, r.anchors.center), ground: at(o) });
});
// keycards on the router roof (z = 210), four along v
A.cards = [];
[-84, -32, 20, 72].forEach((du, i) => {
  const o = { u: OR.rt.u + du, v: OR.rt.v + 78 };
  const r = E5.keycard(o, { id: "kc" + i, role: "upgrader", text: "ALLOW", scale: 0.8, z: 214, lanyard: false });
  A.cards.push(r.anchors);
  add(at(OR.rt)[1] + 2 + i * 0.1, `<g id="mkc${i}">${r.svg}</g>`);
});
// leads: wallet → card (cyan dashed), drawn on top
{
  let s = "";
  A.wals.forEach((w, i) => {
    const a = w.center, b = A.cards[i].face;
    s += `<path id="lead${i}" d="M${f(a[0])} ${f(a[1])} Q${f((a[0] + b[0]) / 2)} ${f(Math.min(a[1], b[1]) - 60)} ${f(b[0])} ${f(b[1])}" fill="none" stroke="#2aa3c9" stroke-width="3.5" stroke-dasharray="10 9" opacity="0.85"/>`;
    s += `<circle id="cglow${i}" cx="${f(b[0])}" cy="${f(b[1])}" r="34" fill="#2aa3c9" opacity="0"/>`;
  });
  add(9000, `<g id="leads">${s}</g>`);
}
// pipe: router (+u face) → token (−u face)
{
  const [du, dv] = dUV(P.rt, P.tok);
  const r = E1.pipe(OR.rt, { id: "pT", pts: [[118, 30, 96], [du - 160, 30, 96], [du - 160, dv, 96], [du - 62, dv, 96]], flow: false, flowColor: "#f0c04a" });
  add(at(OR.rt)[1] - 1, `<g id="pTg" opacity="0">${r.svg}</g>`);
  A.pT = r.anchors;
}
// pipe: router (−u face) → fake pool (+u face)
{
  const [du, dv] = dUV(P.rt, P.fake);
  const r = E1.pipe(OR.rt, { id: "pF", pts: [[-118, 40, 70], [du + 200, 40, 70], [du + 200, dv, 70], [du + 62, dv, 70]], flow: false, flowColor: "#e0453a" });
  add(at(G(...P.fake))[1] - 1, `<g id="pFg" opacity="0">${r.svg}</g>`);
  A.pF = r.anchors;
}
// callback arm next to the fake pool, reaching for the router's front slot
obj("cb", E4.callbackArm, P.cb, { id: "cbk", target: A.rt.slot, s: 0 });
// gold coins next to wallet #1 (flow to the attacker in L17)
{
  const o = G(...rel(P.wals[1], 40, 120));
  add(at(o)[1] + 1, grp("gC", o, coins(o, 3)));
  A.gC = { top: at(o, 0, 0, 40), ground: at(o) };
}

items.sort((a, b) => a.Y - b.Y);
export const world = () => worldSvg("wsvg", gridSvg({ u0: -2000, u1: 12000, v0: -6000, v1: 4000 }) + items.map((x) => x.svg).join("\n"), [-1000, -3200, 11000, 4800]);
