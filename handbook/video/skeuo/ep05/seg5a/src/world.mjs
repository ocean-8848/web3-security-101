// world.mjs — static geometry for ep05 seg5a (painter-ordered SVG + anchors). Used by build-story.mjs.
import { G, at, Wp, CE, U, V, f, f4, box, cyl, rbox, M, faceV, faceTop, frameV, matStr, contactShadow, worldSvg, gridSvg, dashCurve } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { P, rel } from "./layout.mjs";

const items = [];
const add = (Y, svg) => items.push({ Y, svg });
export const A = {}, OR = {};
const obj = (key, fn, pt, opts, dy = 0) => { const o = G(pt[0], pt[1]); const r = fn(o, opts); A[key] = r.anchors; OR[key] = o; add(at(o)[1] + dy, r.svg); return r; };
/** scale an object's svg about its ground origin (for objects without a scale option) */
const scaled = (key, fn, pt, opts, k, dy = 0) => {
  const o = G(pt[0], pt[1]); const r = fn(o, opts); const [gx, gy] = at(o);
  const T = (q) => [gx + (q[0] - gx) * k, gy + (q[1] - gy) * k];
  const an = {}; for (const [n, v] of Object.entries(r.anchors)) an[n] = Array.isArray(v) && typeof v[0] === "number" ? T(v) : v;
  A[key] = an; OR[key] = o;
  add(gy + dy, `<g id="${opts.id}-sc" transform="translate(${f(gx)},${f(gy)}) scale(${k}) translate(${f(-gx)},${f(-gy)})">${r.svg}</g>`);
  return r;
};
/** generic rotator group (same contract as kit: data-m / data-px / data-py / data-a, driven by KIT.rot) */
const rotator = (id, m, px, py, a, inner) =>
  `<g id="${id}" data-m="${m.map((v, i) => (i < 4 ? f4(v) : f(v))).join(",")}" data-px="${px}" data-py="${py}" data-a="${a}" transform="${matStr(m)} translate(${px} ${py}) rotate(${a}) translate(${-px} ${-py})">${inner}</g>`;

// ------------------------------------------------------------------ zone K: key office around the main contract
const cm = obj("cm", E3.contractMachine, P.cm, { id: "cm", name: "APP" });
const fp = obj("fp", X.funcPanel, P.panel, { id: "fp", buttons: [
  { name: "mint", guard: "card" }, { name: "initialize", guard: "plate" }, { name: "kill", guard: "card" }, { name: "upgrade", guard: "card" }, { name: "pause", guard: "card" }] });
const rb = obj("rb", X.roleBoard, P.board, { id: "rb", empty: [0, 1, 2, 3] });
const rk = obj("rk", X.roleBoard, P.board, { id: "rk", hooks: 9, group: [0, 1, 2, 3], groupOn: false, noteOn: false }, 0.5);
// PARAM_ADMIN knob pedestal: steel column with a gauge face (+v) and a needle rotator
{
  const o = G(P.knob[0], P.knob[1]);
  let s = contactShadow(o, 80, 60) + box(o, -46, 46, -46, 46, 0, 8, M.ink, 1.2) + rbox(o, -36, 36, -36, 36, 8, 150, 6, M.steelLight, { sw: 1.6 });
  const m = frameV(o, -36, 36, 146);
  s += `<g transform="${matStr(m)}"><rect x="4" y="4" width="64" height="64" rx="6" fill="#fffdf8" stroke="#5a6068" stroke-width="2"/>` +
    Array.from({ length: 9 }, (_, i) => { const a = (-210 + i * 30) * Math.PI / 180; return `<line x1="${f(36 + 22 * Math.cos(a))}" y1="${f(40 + 22 * Math.sin(a))}" x2="${f(36 + 27 * Math.cos(a))}" y2="${f(40 + 27 * Math.sin(a))}" stroke="#1c1c1c" stroke-width="${i % 4 ? 1.4 : 2.6}"/>`; }).join("") +
    `<path d="M14 54A26 26 0 0 1 58 54" fill="none" stroke="#2aa3c9" stroke-width="3" opacity="0.5"/><rect x="14" y="74" width="44" height="12" rx="3" fill="#2b2e33"/><text x="36" y="84" font-family="JetBrains Mono, monospace" font-size="9" font-weight="800" fill="#9ad9ee" text-anchor="middle">FEE</text></g>`;
  s += rotator("kn-ndl", m, 36, 40, -40, `<path d="M34 40L36 16L38 40Z" fill="#e0453a"/><circle cx="36" cy="40" r="4.5" fill="#1c1c1c"/>`);
  s += cyl(o, 0, 0, 22, 150, 166, M.ink, { sw: 1.4, seg: 24 }) + cyl(o, 0, 0, 16, 166, 186, M.steel, { sw: 1.2, seg: 24 });
  A.knob = { top: at(o, 0, 0, 230), center: at(o, 0, 0, 120), dial: [m[4] + 36 * m[0] + 40 * m[2], m[5] + 36 * m[1] + 40 * m[3]], cap: at(o, 0, 0, 186) };
  const [ox, oy] = at(o);
  add(oy, `<g id="kn" data-ox="${f(ox)}" data-oy="${f(oy)}">${s}</g>`);
}
obj("sw", O.knifeSwitch, P.sw, { id: "sw", text: "暂停" });
const bot = obj("bot", O.rpc, P.bot, { id: "bot" });
const vault = obj("vault", O.safe, P.vault, { id: "vt", plate: "协议金库", gold: true });
// funds pipe: vault (−u side) → out toward the street (−v), flowing
{
  const o = OR.vault;
  const pp = E1.pipe(o, { id: "fpipe", r: 12, flow: true, pts: [[-145, 40, 40], [-500, 40, 40]] });
  A.fpipe = pp.anchors; add(at(o)[1] - 1, pp.svg);
}
obj("user", O.person, P.user, { id: "us", role: "signer", scale: 1.0 });
// gold bar carried by the user (L12)
{
  const o = G(P.user[0] - 40, P.user[1] + 10);
  const g = box(o, -26, 26, -12, 12, 96, 112, M.gold, 1.4);
  add(at(G(P.user[0], P.user[1]))[1] + 1, `<g id="ugold" opacity="0">${g}</g>`);
}

// owner card (L1) + four flying role cards
obj("own", X.keycard, P.ownerCard, { id: "own", role: "owner", scale: 2.4, z: 150, text: "OWNER" }, 300);
const ROLES4 = ["upgrader", "param", "pauser", "minter"];
const flyCards = ROLES4.map((r, i) => obj("fc" + i, X.keycard, P.ownerCard, { id: "fc" + i, role: r, scale: 1.2, z: 190, lanyard: false }, 301 + i));

// ------------------------------------------------------------------ Parity corner (static, seg1 end state)
obj("lib", E3.contractMachine, P.lib, { id: "lib", name: "LIB", state: "broken", badge: false, code: ["owner:", "0x0"] });
obj("libp", X.funcPanel, P.libPanel, { id: "libp", buttons: [{ name: "initialize", guard: "broken" }, { name: "kill", guard: "card", rd: "green" }] });
P.wallets.forEach((pt, i) => {
  obj("w" + i, O.hotWallet, pt, { id: "w" + i });
  obj("wi" + i, X.iceShell, pt, { id: "wi" + i, box: P.iceBox }, 0.5);
});

// ------------------------------------------------------------------ zone T: time-lock street
{
  const o = G(P.belt[0], P.belt[1]);
  const conv = E2.conveyor(o, { id: "belt", len: 560, width: 120 });
  A.belt = conv.anchors;
  // proposal docs standing on the belt deck (inside the glass case)
  const zDeck = E2.VITRINE_FLOOR + E2.CONVEYOR_TOP;
  const d1 = O.doc(G(...rel(P.belt, -230, 0)), { id: "pd1", title: "升级提案", w: 96, h: 120, standing: true, lines: ["upgrade()"] });
  const d2 = O.doc(G(...rel(P.belt, -230, 0)), { id: "pd2", title: "提案 #2", w: 96, h: 120, standing: true, lines: ["setFee()"] });
  const d3 = O.doc(G(...rel(P.belt, -230, 0)), { id: "pd3", title: "恶意", w: 96, h: 120, standing: true, state: "attacker", lines: ["drain()"] });
  A.pd1 = d1.anchors;
  const inner = E2.liftSvg(conv.svg, E2.VITRINE_FLOOR) + `<g id="pdw">${E2.liftSvg(d1.svg, zDeck)}${E2.liftSvg(d2.svg, zDeck)}${E2.liftSvg(d3.svg, zDeck)}</g>`;
  const vit = E2.vitrine(o, { id: "vit", w: 640, d: 200, h: 230, plate: "公开排队", inner });
  A.vit = vit.anchors; OR.vit = o;
  add(at(o)[1], vit.svg);
  A.beltStart = Wp(G(...rel(P.belt, -230, 0)).u, G(...rel(P.belt, -230, 0)).v, zDeck);
  A.beltEnd = Wp(G(...rel(P.belt, 240, 0)).u, G(...rel(P.belt, 240, 0)).v, zDeck);
}
obj("lock", E1.timeLock, P.lock, { id: "tlk", frac: 1 });
const msig = obj("msig", O.safe, P.msig, { id: "ms", plate: "提案者" });
obj("meter", X.thresholdMeter, P.meter, { id: "mt", max: 5, th: 3, thText: "3 / 5" });
P.signers.forEach((pt, i) => obj("sg" + i, O.person, pt, { id: "sg" + i, role: "signer", scale: 0.9 }));
// laptops for the five signers (L15), drawn small in front of each signer
const redPage = `<rect x="0" y="0" width="222" height="146" fill="#fff6f4"/><rect x="0" y="0" width="222" height="146" fill="none" stroke="#e0453a" stroke-width="10"/>
  <rect x="0" y="0" width="222" height="28" fill="#f6d3cf"/><text x="10" y="20" font-family="Noto Sans SC" font-size="14" font-weight="700" fill="#a8322a">Safe{Wallet}</text>
  <rect x="14" y="44" width="150" height="12" rx="6" fill="#efc2bd"/><rect x="14" y="66" width="110" height="12" rx="6" fill="#efc2bd"/>
  <rect x="118" y="104" width="92" height="30" rx="7" fill="#e0453a"/><text x="164" y="125" font-family="Noto Sans SC" font-size="17" font-weight="900" fill="#fff" text-anchor="middle">确认</text>`;
P.signers.forEach((pt, i) => scaled("lp" + i, O.laptop, [pt[0] + 70, pt[1] + 60], { id: "lp" + i, screen2: redPage }, 0.55, 2));
obj("guard", O.person, P.guard, { id: "gd", role: "engineer", scale: 1.0 });
obj("gdoc", O.doc, rel(P.guard, 110, 40), { id: "gdc", title: "提案", w: 80, h: 100, standing: true, lines: ["upgrade()"] }, 1);
obj("watch", O.person, P.watch, { id: "wt", role: "signer", scale: 0.9 });
obj("mag", O.magnifier, P.mag, { id: "mg", z: 60 }, 200);

// ------------------------------------------------------------------ zone B: bridges
const b1 = obj("b1", E1.bridge, P.b1, { id: "b1" });
const b2 = obj("b2", E1.bridge, P.b2, { id: "b2" });
const b3 = obj("b3", E1.bridge, P.b3, { id: "b3" });
obj("atk", O.person, P.atk, { id: "atk", role: "attacker", scale: 1.0 });
obj("cp2", O.checkpoint, P.cp2, { id: "cp2", n: "中继者" });
obj("atk2", O.person, P.atk2, { id: "atk2", role: "attacker", scale: 1.0 });
obj("hubList", O.doc, P.hubList, { id: "hl", title: "白名单", w: 150, h: 190, standing: true, lines: ["✓ 中继者 A", "✓ 中继者 B", "✓ 中继者 C"] });
obj("proof", E2.proofCard, rel(P.b2, -380, 90), { id: "pf", missing: true });
obj("cm3", E3.contractMachine, P.cm3, { id: "cm3", name: "桥合约" });
obj("fp3", X.funcPanel, P.fp3, { id: "fp3", buttons: [{ name: "upgrade", guard: "card" }], title: "BRIDGE" });
obj("safe3", O.hotWallet, P.safe3, { id: "s3", plate: "安全多签" });
obj("lock3", E1.timeLock, P.lock3, { id: "lk3", state: "broken", ghost: 0.12, badge: false });
obj("meter3", X.thresholdMeter, P.meter3, { id: "mt3", max: 14, th: 6, thText: "6 / 14", h: 300 });
// 14 small council members in two rows behind the safe
const council = [];
for (let r = 0; r < 2; r++) for (let c = 0; c < 7; c++) council.push(rel(P.safe3, -470 + c * 72 + r * 36, -330 + r * 95));
council.forEach((pt, i) => obj("cn" + i, O.person, pt, { id: "cn" + i, role: "signer", scale: 0.55 }));
obj("sign3", E1.signBoard, P.sign3, { id: "tsign", style: "plate", text: "信任假设", size: 46 });
obj("user3", O.person, P.user3, { id: "us3", role: "signer", scale: 1.0 });

// gold coins (iso discs) used for bridges / token hub
export const coin = (id, p, cls = "gold") => {
  const fill = cls === "red" ? "#e8574c" : "#f2c14e", st = cls === "red" ? "#a8322a" : "#a7791c";
  return `<g id="${id}" opacity="0"><g transform="translate(${f(p[0])},${f(p[1])})"><ellipse cx="0" cy="4" rx="17" ry="10" fill="${st}"/><ellipse cx="0" cy="0" rx="17" ry="10" fill="${fill}" stroke="${st}" stroke-width="1.5"/><ellipse cx="0" cy="0" rx="10" ry="6" fill="none" stroke="#fff3c8" stroke-width="1.4"/></g></g>`;
};
// a pile of coins on the far bank of bridge 2 (minted out of thin air)
{
  const fb = b2.anchors.farBank, o = G(fb[0], fb[1]);
  let s = "";
  const rows = [[0, 0], [30, -10], [-30, 14], [10, 26], [-14, -20], [40, 20], [-40, -6]];
  rows.forEach(([du, dv], i) => { for (let k = 0; k < 3 + (i % 3); k++) { const p = at(o, du, dv, k * 8); s += `<ellipse cx="${f(p[0])}" cy="${f(p[1] + 4)}" rx="17" ry="10" fill="#a7791c"/><ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="17" ry="10" fill="#f2c14e" stroke="#a7791c" stroke-width="1.5"/>`; } });
  add(at(o)[1], `<g id="mint2" data-ox="${f(at(o)[0])}" data-oy="${f(at(o)[1])}">${s}</g>`);
  A.mint2 = { top: at(o, 0, 0, 90), ground: at(o) };
}

// ------------------------------------------------------------------ connectors (role card → controlled part)
const TEAL = "#1d93ba";
const curve = (id, a, b, lift = 160, color = TEAL) => {
  const c1 = [a[0] + (b[0] - a[0]) * 0.3, Math.min(a[1], b[1]) - lift * 0.4 + (a[1] < b[1] ? 60 : 0)];
  const c2 = [b[0] - (b[0] - a[0]) * 0.25, b[1] - lift];
  return dashCurve(id, a, b, { color, c1, c2 });
};
const links = [
  curve("ln0", rb.anchors.cards[0], fp.anchors.btns[3], 140),
  curve("ln1", rb.anchors.cards[1], A.knob.dial, 120),
  curve("ln2", rb.anchors.cards[2], at(G(P.sw[0], P.sw[1]), 0, 10, 240), 120),
  curve("ln3", rb.anchors.cards[3], fp.anchors.btns[0], 200),
];
// user exits the vault during the delay (green dashed arrow)
const exitFrom = at(G(P.vault[0], P.vault[1]), 160, 140, 40), exitTo = at(G(P.user[0], P.user[1]), 260, 220, 40);
const lnExit = dashCurve("lnx", exitFrom, exitTo, { color: "#1f9d55", c1: [exitFrom[0] + 120, exitFrom[1] - 30], c2: [exitTo[0] - 120, exitTo[1] - 60] });
A.exitTo = exitTo;
// Mantle: bridge panel reader → council safe
const ln3m = curve("lnm", A.fp3.readers[0], at(OR.safe3, 0, 0, 360), 120);

items.sort((a, b) => a.Y - b.Y);
export const world = () => worldSvg("wsvg", gridSvg({ u0: -3200, u1: 6400, v0: -3600, v1: 3600 }) +
  items.map((x) => x.svg).join("\n") + links.map((l) => l.svg).join("") + ln3m.svg + lnExit.svg +
  coin("cr0", b1.anchors.deck[0]) + coin("cr1", b1.anchors.deck[0]) + coin("cr2", b1.anchors.deck[0]) +
  coin("bnb0", A.cp2.top), [-2400, -2600, 7200, 4400]);
export { cm, fp, rb, rk, b1, b2, b3, vault, bot, msig };
