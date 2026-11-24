// world.mjs — static geometry for ep06 seg5a (painter-ordered SVG + anchors). Used by build-story.mjs / probe.mjs.
import { G, at, f, f4, box, cyl, rbox, M, frameV, matStr, contactShadow, worldSvg, gridSvg } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { P, rel, POOL, SORTER } from "./layout.mjs";

const items = [];
const add = (Y, svg) => items.push({ Y, svg });
export const A = {}, OR = {};
const obj = (key, fn, pt, opts, dy = 0) => { const o = G(pt[0], pt[1]); const r = fn(o, opts); A[key] = r.anchors; OR[key] = o; add(at(o)[1] + dy, r.svg); return r; };
const objAt = (key, fn, o, opts, dy = 0) => { const r = fn(o, opts); A[key] = r.anchors; OR[key] = o; add(at(o)[1] + dy, r.svg); return r; };
const grp = (id, o, s, op = 1) => { const [ox, oy] = at(o); return `<g id="${id}" data-ox="${f(ox)}" data-oy="${f(oy)}"${op === 1 ? "" : ` opacity="${op}"`}>${s}</g>`; };
const rotator = (id, m, px, py, a, inner) =>
  `<g id="${id}" data-m="${m.map((v, i) => (i < 4 ? f4(v) : f(v))).join(",")}" data-px="${px}" data-py="${py}" data-a="${a}" transform="${matStr(m)} translate(${px} ${py}) rotate(${a}) translate(${-px} ${-py})">${inner}</g>`;

/** a stack of gold bars, `layers` high, 2×2 per layer (each layer 14 high) */
const goldStack = (o, layers, w = 1) => {
  let s = contactShadow(o, 70 * w, 46 * w);
  for (let k = 0; k < layers; k++) for (const [du, dv] of [[-26, -15], [26, -15], [-26, 15], [26, 15]])
    s += box(o, (du - 24) * w, (du + 24) * w, (dv - 13) * w, (dv + 13) * w, k * 14, k * 14 + 13, M.gold, 1.1);
  return s;
};

// ------------------------------------------------------------------ zone V: the 4626 vault and its four defences
const vO = G(P.vault[0], P.vault[1]);
const vault = objAt("vault", O.safe, vO, { id: "vt", plate: "ERC-4626", gold: true });
const sdO = X.besideSafe(vO);
const sd = objAt("sd", X.shareDispenser, sdO, { id: "sd", value: 0, tickets: 4, digits: 5 }, 1);
// ③ ledger on the vault roof (z = 334)
{
  const lb = O.ledgerBook(vO, { id: "lb", scale: 1.0 });
  A.lb = { top: [lb.anchors.top[0], lb.anchors.top[1] - 334 * 0.866], center: [lb.anchors.center[0], lb.anchors.center[1] - 334 * 0.866] };
  add(at(vO)[1] + 2, `<g id="lbk" opacity="0">${E2.liftSvg(lb.svg, 334)}</g>`);
}
// ① virtual shares (ghost certificates) standing beside the dispenser
obj("ghost", X.shareCert, P.ghost, { id: "gh", stand: true, n: 3, scale: 2.0, ghost: true });
// ② burn box + deployer (engineer)
const bb = obj("burn", X.burnBox, P.burn, { id: "bb", cards: 1 });
obj("eng", O.person, P.eng, { id: "eng", role: "engineer", scale: 1.0 });
// Uniswap V2: a vitrine with locked LP certificates + padlock
{
  const o = G(P.vit[0], P.vit[1]);
  const certs = X.shareCert(o, { id: "lp", n: 5, scale: 1.7, text: "LP" });
  const pl = O.padlock(G(P.vit[0] + 70, P.vit[1] + 10), { id: "lpk" });
  const inner = E2.liftSvg(certs.svg, E2.VITRINE_FLOOR) + E2.liftSvg(pl.svg, E2.VITRINE_FLOOR);
  const vit = E2.vitrine(o, { id: "vit", w: 300, d: 180, h: 170, plate: "永久锁定", inner });
  A.vit = vit.anchors; OR.vit = o; add(at(o)[1], vit.svg);
}
// ④ checkpoint in front of the dispenser
const cp = obj("cp", O.checkpoint, P.cp, { id: "cp", n: "④", armUp: false });
// people
obj("atk", O.person, P.atk, { id: "atk", role: "attacker", scale: 1.0 });
obj("vic", O.person, P.vic, { id: "vic", role: "signer", scale: 1.0 });
// victim's deposit (carried) + attacker's donation (pushed into the vault)
{
  const o = G(...rel(P.vic, -70, -10));
  add(at(G(...P.vic))[1] + 1, grp("vgold", o, goldStack(o, 2, 0.7)));
  A.vgold = { top: at(o, 0, 0, 60) };
  const d = G(...rel(P.atk, -150, -40));
  add(at(G(...P.atk))[1] - 1, grp("dgold", d, goldStack(d, 3, 0.8)));
  A.dgold = { top: at(d, 0, 0, 70) };
  const e = G(...rel(P.eng, 90, -20));
  add(at(G(...P.eng))[1] + 1, grp("egold", e, goldStack(e, 1, 0.6)));
}
// donation stacks ×10 ×100 ×1000 (L3)
[3, 10, 30].forEach((n, i) => { const o = G(...P.don[i]); add(at(o)[1], grp("don" + i, o, goldStack(o, n, 0.7))); A["don" + i] = { top: at(o, 0, 0, n * 14 + 20), ground: at(o) }; });
// a certificate that the dispenser hands the victim / the deployer (flies)
obj("vcert", X.shareCert, rel(P.vic, 40, -60), { id: "vc", stand: true, scale: 1.5, z: 150 }, 3);

// ------------------------------------------------------------------ comparison: the unpatched vault (L11–L12)
const vvO = G(P.vv[0], P.vv[1]);
objAt("vv", O.safe, vvO, { id: "vv", plate: "ERC-4626", gold: true });
objAt("vsd", X.shareDispenser, X.besideSafe(vvO), { id: "vsd", value: 1, digits: 5 }, 1);
obj("vatk", O.person, P.vatk, { id: "vatk", role: "attacker", scale: 1.0 });
obj("vvic", O.person, P.vvic, { id: "vvic", role: "signer", scale: 1.0 });

// ------------------------------------------------------------------ seg1 right-zone scenery (static, as seg1 left it)
obj("pool", E3.contractMachine, POOL, { id: "pool", name: "POOL" });
obj("sorter", E1.sorter, SORTER, { id: "sorter", letters: 0 });

// ------------------------------------------------------------------ zone U: Uranium (fork of Uniswap V2)
obj("ura", E3.contractMachine, P.ura, { id: "ura", name: "URA" });
obj("fork", E1.signBoard, P.fork, { id: "fork", style: "plate", text: "分叉自 Uniswap V2", size: 40 });
obj("bal", E1.balance, P.bal, { id: "bal", tilt: 0, glow: false });
obj("atk3", O.person, P.atk3, { id: "atk3", role: "attacker", scale: 1.0 });
obj("lesson", E1.signBoard, P.lesson, { id: "lesson", style: "wood", text: "修改过的分叉代码 = 新代码", size: 44 });
// fee knob pedestal: steel column, gauge face (+v) with FEE dial and a needle rotator
{
  const o = G(P.knob[0], P.knob[1]);
  let s = contactShadow(o, 80, 60) + box(o, -46, 46, -46, 46, 0, 8, M.ink, 1.2) + rbox(o, -36, 36, -36, 36, 8, 150, 6, M.steelLight, { sw: 1.6 });
  const m = frameV(o, -36, 36, 146);
  s += `<g transform="${matStr(m)}"><rect x="4" y="4" width="64" height="64" rx="6" fill="#fffdf8" stroke="#5a6068" stroke-width="2"/>` +
    Array.from({ length: 9 }, (_, i) => { const a = (-210 + i * 30) * Math.PI / 180; return `<line x1="${f(36 + 22 * Math.cos(a))}" y1="${f(40 + 22 * Math.sin(a))}" x2="${f(36 + 27 * Math.cos(a))}" y2="${f(40 + 27 * Math.sin(a))}" stroke="#1c1c1c" stroke-width="${i % 4 ? 1.4 : 2.6}"/>`; }).join("") +
    `<path d="M14 54A26 26 0 0 1 58 54" fill="none" stroke="#2aa3c9" stroke-width="3" opacity="0.5"/><rect x="14" y="74" width="44" height="12" rx="3" fill="#2b2e33"/><text x="36" y="84" font-family="JetBrains Mono, monospace" font-size="9" font-weight="800" fill="#9ad9ee" text-anchor="middle">FEE</text></g>`;
  s += rotator("kn-ndl", m, 36, 40, 30, `<path d="M34 40L36 16L38 40Z" fill="#e0453a"/><circle cx="36" cy="40" r="4.5" fill="#1c1c1c"/>`);
  s += cyl(o, 0, 0, 22, 150, 166, M.ink, { sw: 1.4, seg: 24 }) + cyl(o, 0, 0, 16, 166, 186, M.steel, { sw: 1.2, seg: 24 });
  A.knob = { top: at(o, 0, 0, 230), center: at(o, 0, 0, 120), dial: [m[4] + 36 * m[0] + 40 * m[2], m[5] + 36 * m[1] + 40 * m[3]] };
  add(at(o)[1], grp("kn", o, s));
}
// one token the attacker drops into the pool (L20)
{
  const p = at(G(...rel(P.atk3, 40, -40)), 0, 0, 120);
  add(at(G(...P.atk3))[1] + 2, `<g id="tok" opacity="0"><g transform="translate(${f(p[0])},${f(p[1])})"><ellipse cx="0" cy="4" rx="15" ry="9" fill="#a7791c"/><ellipse cx="0" cy="0" rx="15" ry="9" fill="#f2c14e" stroke="#a7791c" stroke-width="1.5"/></g></g>`);
  A.tok = p;
}

items.sort((a, b) => a.Y - b.Y);
export const world = () => worldSvg("wsvg", gridSvg({ u0: -3200, u1: 9000, v0: -4000, v1: 6000 }) + items.map((x) => x.svg).join("\n"), [-1000, -1600, 9000, 4000]);
export { vault, sd, bb, cp };
