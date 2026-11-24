// Generates compositions/story.html for ep06/seg2「② 五类缺陷」(one isometric world, one camera).
// Run: node src/build-story.mjs
// Objects: kit + ep01/ep02/ep03 kit-ext (import only) + ep06 kit-ext + ./props.mjs. Layout: ./layout.mjs.
import fs from "node:fs";
import { at, Wp, f, box, flat, M, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, wireSvg, CHECK, BADGE, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { lift, lamp, redBox, smallDoor, pillar, trough, grp } from "./props.mjs";
import * as L from "./layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = T.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const SECTIONS = SCRIPT.sections;
const LN = T.lines.map((_, i) => lineAt(T, i));
const LS = LN.map((l) => l.start), LE = LN.map((l) => l.end);
const w = (term, line, nth = 0) => wordAt(T, term, { line, nth }).start;

// ---------------------------------------------------------------- objects
const items = [];
const add = (o, svg, dy = 0) => items.push({ y: at(o)[1] + dy, svg });
const A = {};
const W3 = (u, v, z = 0) => Wp(u, v, z);
const wrap = (id, svg) => `<g id="${id}">${svg}</g>`;
const up = (p, d) => [p[0], p[1] - d];

// five category signs (plate signs on a front road)
const NAMES = ["溢出", "截断", "先除后乘", "舍入方向", "单位不一致"];
const NUM = ["①", "②", "③", "④", "⑤"];
L.SIGNS.forEach((o, i) => {
  const a = E1.signBoard(o, { id: `sg${i}a`, style: "plate", text: NUM[i], w: 330, size: 46 });
  const b = E1.signBoard(o, { id: `sg${i}b`, style: "plate", text: `${NUM[i]} ${NAMES[i]}`, w: 330, size: 46 });
  A["sg" + i] = b.anchors; add(o, a.svg); add(o, `<g id="sg${i}b-w" opacity="0">${b.svg}</g>`, 0.1);
});

// ---- seg1 world, end state (continuity: seg2 opens on seg1's last frame)
const rc0 = X.roundCutter(L.CUTTER, { id: "rc0", dir: "down", stock: 1, chip: 0.5, bladeUp: false, pileR: 9 }); A.rc0 = rc0.anchors; add(L.CUTTER, rc0.svg, 0.1);
{ const u = O.person(L.CUT_USER, { id: "usr", role: "signer" }); add(L.CUT_USER, u.svg); }
{ const UC = { u: L.CUT_USER.u + 20, v: L.CUT_USER.v + 75 }; add(UC, X.shareCert(UC, { id: "ucert", stand: true, scale: 1.5 }).svg); }
add(L.CUT_CTR, `<g id="ctrp">${box(L.CUT_CTR, -80, 80, -32, 32, 0, L.CUT_CTR_Z, M.steel, 1.6)}</g>`);
add(L.CUT_CTR, E2.rollCounter(L.CUT_CTR, { id: "ctr4", digits: 4, value: 1000, z: L.CUT_CTR_Z }).svg, 1);
L.HOLDERS.forEach((H, i) => {
  add(H, O.person(H, { id: "h" + i, role: "signer", scale: 1.0 }).svg);
  const Cc = { u: H.u - 10, v: H.v + 52 };
  add(Cc, X.shareCert(Cc, { id: "hc" + i, stand: true, scale: 1.3 }).svg.replace(`id="hc${i}-solid"`, `id="hc${i}-solid" opacity="0.4"`));
});
const vault = O.safe(L.VAULT, { id: "vault", plate: "ERC-4626" }); A.vault = vault.anchors; add(L.VAULT, vault.svg);
{ const SD = X.besideSafe(L.VAULT); add(SD, X.shareDispenser(SD, { id: "sd" }).svg); }
add(L.SORTER, E1.sorter(L.SORTER, { id: "so", letters: 0, blockLabel: "#N", sealed: true }).svg);
add(L.POOL, E3.contractMachine(L.POOL, { id: "pool", name: "POOL", code: ["60 80", "52 34"] }).svg);
add(L.MINI_CUTTER, X.roundCutter(L.MINI_CUTTER, { id: "rcS", dir: "down", scale: 0.85, pileR: 9 }).svg);
add(L.SORTER_ATK, O.person(L.SORTER_ATK, { id: "satk", role: "attacker" }).svg);

// ---- left zone · overflow workshop (seg1 cabinet + odometer; seg2 adds the BEC story around them)
const bec = E3.contractMachine(L.BEC, { id: "bec", name: "BEC" }); A.bec = bec.anchors; add(L.BEC, bec.svg);
add(L.BEC, wireSvg("sock", L.BEC, [[-70, 70, -60, 60, 214, 262]], { opacity: 0 }), 0.2);
const OZ = L.OVF_CTR_Z;
add(L.OVF_CTR, `<g id="ped">${box(L.OVF_CTR, -170, 170, -36, 36, 0, OZ, M.steel, 1.6)}</g>`);
const ctr = E2.rollCounter(L.OVF_CTR, { id: "ovf", digits: 10, z: OZ }); A.ctr = ctr.anchors; add(L.OVF_CTR, ctr.svg, 1);
add(L.OVF_CTR, redBox("ctrR", L.OVF_CTR, [-150, 150, -25, 25, OZ, OZ + 76]), 1.2);
add(L.OVF_CTR, lamp("lmp", L.LAMP, OZ + 76), 1.3);
const atk = O.person(L.ATK, { id: "atk", role: "attacker" }); A.atk = atk.anchors; add(L.ATK, atk.svg);
const ltO = [{ u: L.ATK.u + 110, v: L.ATK.v - 30 }, { u: L.ATK.u + 150, v: L.ATK.v + 30 }];
ltO.forEach((o, i) => { const l = E1.letter(o, { id: "lt" + i, state: "attacker", z: 90 }); A["lt" + i] = l.anchors; add(o, `<g id="lt${i}-mv" opacity="0">${l.svg}</g>`, 2); });
const gate = O.checkpoint(L.GATE, { id: "gate", n: "≥" }); A.gate = gate.anchors; add(L.GATE, gate.svg);
L.RCV.forEach((o, i) => {
  const p = O.person(o, { id: "rv" + i, role: "signer" }); A["rv" + i] = p.anchors; add(o, p.svg);
  const po = { u: o.u + 80, v: o.v + 10 }; A["pl" + i] = at(po, 0, 0, 640); add(po, pillar("pl" + i, po), 1);
});
const SCR = (txt, bg, fg) => `<rect x="0" y="0" width="148" height="88" fill="${bg}"/><rect x="0" y="0" width="148" height="18" fill="${fg}" opacity="0.85"/>
  <text x="74" y="62" font-family="Noto Sans SC, sans-serif" font-size="28" font-weight="900" fill="${fg}" text-anchor="middle">${txt}</text>`;
L.DESKS.forEach((o, i) => { const d = O.desk(o, { id: "dk" + i, screen: SCR("充提", "#dff1f7", "#1d93ba"), screen2: SCR("暂停", "#fde6e3", "#e0453a") }); A["dk" + i] = d.anchors; add(o, d.svg); });
L.DOORS.forEach((o, i) => { add(o, smallDoor("dr" + i, o)); A["dr" + i] = at(o, 0, 0, 175); });
const cab = E3.slotCabinet(L.SLOT_CAB, { id: "cab", n: 4, fill: { 3: [{ bytes: 3, color: "red", at: 0 }, { bytes: 29, color: "teal", at: 3 }] } });
A.cab = cab.anchors; add(L.SLOT_CAB, cab.svg);
// truncation: 32-byte block (16 red high bytes + 16 teal low bytes) slides into a 16-byte trough
const CELL = 14, TL = 16 * CELL;
const tr = trough("tr", L.TROUGH, { len: TL });
const tbO = { u: L.TROUGH.u - 2 * TL - 60, v: L.TROUGH.v };
const tbR = E3.byteBlock(tbO, { id: "tbR", bytes: 16, color: "red", cell: CELL, z: 4, depth: 32, h: 16 });
const tbT = E3.byteBlock({ u: tbO.u + TL, v: tbO.v }, { id: "tbT", bytes: 16, color: "teal", cell: CELL, z: 4, depth: 32, h: 16 });
add(L.TROUGH, grp("trw", L.TROUGH, tr.back + `<g id="tb">${wrap("tbRw", tbR.svg)}${tbT.svg}</g>` + tr.front));
A.tr = at(L.TROUGH, TL / 2, 0, 60); A.tb = at(tbO, TL, 0, 60);

// centre · the cutter reloaded for 7÷5 = 1.4 and 21÷5 = 4.2 (swapped in over rc0) + wide mulDiv bed
const rcA = X.roundCutter(L.CUTTER, { id: "rcA", stock: 1, chip: 0.4, cutAt: 1, dir: "down", pileR: 9 }); A.rc = rcA.anchors; add(L.CUTTER, `<g id="rcA-w" opacity="0">${rcA.svg}</g>`, 0.2);
const rcB = X.roundCutter(L.CUTTER, { id: "rcB", stock: 4, chip: 0.2, cutAt: 4, dir: "down", pileR: 9 }); add(L.CUTTER, `<g id="rcB-w" opacity="0">${rcB.svg}</g>`, 0.3);
const rcW = X.roundCutter(L.CUTTER_W, { id: "rcW", scale: 1.4, load: false, dir: "up" }); A.rcW = rcW.anchors; add(L.CUTTER_W, rcW.svg);

// far right · bridge + precision rulers + small cutter on the crown + a porter with a price card
const br = E1.bridge(L.BRIDGE, { id: "br" }); A.br = br.anchors; add(L.BRIDGE, br.svg);
const rE = X.decimalRuler(L.R_ETH, { id: "rE", places: 6, chain: "ETH", scale: 1.25 }); A.rE = rE.anchors; add(L.R_ETH, rE.svg);
const rT = X.decimalRuler(L.R_TRON, { id: "rT", places: 6, chain: "TRON", scale: 1.25 }); A.rT = rT.anchors; add(L.R_TRON, rT.svg);
const rB = X.decimalRuler(L.R_BSC, { id: "rB", places: 18, chain: "BSC", scale: 1.25, slider: 5.5 }); A.rB = rB.anchors; add(L.R_BSC, rB.svg);
const mini = X.roundCutter(L.MINI, { id: "rcM", scale: 0.42, stock: 2, chip: 0.5, cutAt: 2, dir: "down" }); A.rcM = mini.anchors;
add(L.MINI, grp("rcMw", L.MINI, lift(mini.svg, L.MINI_Z)), 80);
const PC0 = { u: L.BRIDGE.u - 420, v: L.BRIDGE.v + 40 };
const pc = O.person(PC0, { id: "pc", role: "engineer", scale: 0.75 }); A.pc = pc.anchors;
const pdO = { u: PC0.u + 40, v: PC0.v + 30 };
const pd = O.doc(pdO, { id: "pd", title: "6 位", lines: ["price", "1e6"], standing: true, w: 110, h: 130 }); A.pd = pd.anchors;
add(PC0, `<g id="pcw">${pc.svg}${lift(pd.svg, 70)}</g>`, 120);
const oMg = { u: L.R_BSC.u - 360, v: L.R_BSC.v + 110 };
const mg = O.magnifier(oMg, { id: "mg", z: 60 }); A.mg = mg.anchors; add(oMg, mg.svg);
items.sort((a, b) => a.y - b.y);

// seg1's EVM ground frame (still on screen at seg1's end; fades under the title card)
const [eu0, eu1, ev0, ev1] = L.EVM_FRAME, O0 = { u: 0, v: 0 };
const evm = `<g id="evm">${flat(O0, [[eu0, ev0], [eu1, ev0], [eu1, ev1], [eu0, ev1]], 0, "rgba(42,163,201,0.07)", "#2aa3c9", 10, 'stroke-dasharray="40 26"')}</g>`;
const world = worldSvg("wsvg", gridSvg({ u0: -3000, u1: 5600, v0: -2400, v1: 3400 }) + evm + items.map((x) => x.svg).join("\n"), [-3600, -2400, 9400, 4800]);

// ---------------------------------------------------------------- labels (world)
let labels = "";
const lb = (id, p, html, cls = "", a = "b") => { labels += wlab(id, p, html, cls + " hide", a); };
const pin = (id, p, html, a = "c") => { labels += wpin(id, p, html, a); };
const SUP = (n) => `<sup>${n}</sup>`;
lb("lb-next", up(A.sg3.top, 6), "下一段", "lab-g lab-sm", "b");
// seg1 end-state labels (fade under the title card)
labels += wlab("s1t1", up(A.ctr.top, 30), "数学缺陷", "lab-cs") + wlab("s1t2", [A.rc0.lever[0] - 40, A.rc0.lever[1]], "舍入方向", "lab-cs", "r") + wlab("s1t3", up(A.vault.top, 10), "金库通胀", "lab-cs");
// overflow
lb("lb-wrap", up(A.ctr.top, 10), "超过上限 → 回绕", "lab-rs", "b");
lb("lb-sol", W3(L.BEC.u - 120, L.BEC.v + 60, 230), "Solidity 0.4", "lab-g", "r");
lb("lb-sock", W3(L.BEC.u + 10, L.BEC.v - 40, 300), "溢出检查：没有", "lab-r", "b");
lb("lb-form", up(W3(L.BEC.u + 10, L.BEC.v - 40, 300), 66), "总额 = 接收人数 × 每人金额", "lab-ink", "b");
ltO.forEach((o, i) => lb("lb-lt" + i, W3(o.u, o.v, 150), "2" + SUP(255), "lab-rs lab-sm", i ? "l" : "r"));
lb("lb-two", W3(L.ATK.u - 80, L.ATK.v + 40, 120), "2 个接收地址", "lab-r", "r");
lb("lb-mul", up(A.ctr.top, 10), "2 × 2" + SUP(255) + " = 2" + SUP(256), "lab-ink mid", "b");
lb("lb-256", up(A.ctr.top, 10), "256 位上限 → 回绕成 0", "lab-rs mid", "b");
lb("lb-gate", up(A.gate.plate, 40), "余额 ≥ 总额", "lab-ink", "b");
lb("lb-ge0", up(A.gate.plate, 40), "余额 ≥ 0", "lab-ink", "b");
lb("lb-pass", W3(L.GATE.u + 140, L.GATE.v + 40, 60), "直接通过", "lab-rs", "l");
pin("snd", up(A.atk.head, 60), `<div class="lab lab-ink hide" id="lb-snd">发送者余额 <span class="dts"><i></i><i></i><i></i><i></i></span> 扣 0</div>`, "b");
lb("lb-rcv", W3(L.RCV[1].u + 60, L.RCV[1].v + 80, 0), "两个接收者 · 各收 2" + SUP(255), "lab-ink", "t");
lb("lb-mint", A.pl0, "凭空铸出", "lab-rs", "r");
lb("lb-ex", up(A.dk1.top ?? at(L.DESKS[1], 0, 0, 260), 0), "多家交易所 · 暂停 BEC 充提", "lab-rs", "b");
lb("lb-rep", W3(L.DESKS[0].u - 40, L.DESKS[0].v + 120, 0), "公开报道", "lab-g", "t");
lb("lb-08", W3(L.LAMP.u + 40, L.LAMP.v, OZ + 150), "0.8 起 · 默认检查", "lab-gs", "l");
lb("lb-rev", W3(L.OVF_CTR.u - 175, L.OVF_CTR.v + 20, OZ + 40), "超过上限 → 整笔回滚", "lab-gs", "r");
pin("ck-rev", W3(L.LAMP.u + 10, L.LAMP.v, OZ + 200), CHECK("ck-rev-i", 52, "hide"));
["unchecked 块", "内联汇编", "类型转换"].forEach((t, i) => lb("lb-dr" + i, up(A["dr" + i], i * 70), t, "lab-ink", "b"));
lb("lb-silent", W3(L.OVF_CTR.u - 175, L.OVF_CTR.v + 20, OZ + 40), "静默回绕 · 不报错", "lab-rs", "r");
lb("lb-shift", [A.cab.drawersOpen[3][0] + 150, A.cab.drawersOpen[3][1] - 10], "x << n · 高位被移出丢掉", "lab-rs", "l");
lb("lb-u256", A.tb, "uint256 · 32 字节", "lab-cs", "b");
lb("lb-u128", W3(L.TROUGH.u + TL + 40, L.TROUGH.v, 30), "uint128 · 16 字节", "lab-ink", "l");
lb("lb-trunc", W3(L.TROUGH.u - TL, L.TROUGH.v + 160, 0), "uint128(x) · 高位丢掉 · 不报错", "lab-rs", "t");
// cutter
lb("lb-cA", up(A.rc.top, 30), "7 ÷ 5 = 1.4 → 1", "lab-ink", "b");
lb("lb-cB", up(A.rc.top, 30), "21 ÷ 5 = 4.2 → 4", "lab-ink", "b");
lb("lb-mdv", up(A.rcW.top, 20), "mulDiv", "lab-cs", "b");
lb("lb-512", up(A.rcW.top, 20), "mulDiv · 中间值 512 位", "lab-cs", "b");
lb("lb-dir", [A.rcW.leverDn[0] - 30, A.rcW.leverDn[1] + 20], "指定方向：向下 ↓", "lab-cs", "r");
// bridge
lb("lb-rE", [A.rE.top[0], A.rE.top[1] + 0], "以太坊 · USDT · 6 位", "", "b");
lb("lb-rT", [A.rT.top[0] + 20, A.rT.top[1] + 0], "TRON · USDT · 6 位", "", "l");
lb("lb-rB", [A.rB.top[0], A.rB.top[1] + 0], "BNB Chain · BSC-USD · 18 位", "lab-cs", "b");
// end-of-segment copy: anchored by its right edge so the far-right camera does not crop it
lb("lb-rB2", [A.rB.top[0] + 20, A.rB.top[1] - 40], "BNB Chain · BSC-USD · 18 位", "lab-cs", "r");
lb("lb-copy", W3(PC0.u - 40, PC0.v + 90, 0), "以太坊的代码 · 原样搬过去", "lab-ink", "t");
lb("lb-hard", [A.rB.cells[10][0], A.rB.cells[10][1] + 26], "写死 6 位精度", "lab-rs", "t");
lb("lb-x12", up(A.rB.top, 70), "× 10" + SUP(12), "lab-rs big", "b");
lb("lb-dec", up(A.rB.head, 90), "decimals() = 18", "lab-cs", "b");
pin("ck-dec", [A.rB.dot[0] + 0, A.rB.dot[1] - 80], CHECK("ck-dec-i", 56, "hide"));
lb("lb-conv", up(A.br.crown ?? A.br.top, 150), "显式换算 · 处理余数", "lab-cs", "b");
lb("lb-proto", [A.rcM.trayL[0] - 10, A.rcM.trayL[1] - L.MINI_Z * 0.866 + 20], "余数 → 协议", "lab-cs lab-sm", "t");

// ---------------------------------------------------------------- cameras (fit world boxes into screen rects, as seg1)
const bx = (o, u0, u1, v0, v1, z0, z1) => { const r = []; for (const a of [u0, u1]) for (const b of [v0, v1]) for (const c of [z0, z1]) r.push(at(o, a, b, c)); return r; };
const fit = (pts, [x0, y0, x1, y1], kmax = 2) => {
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  const bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys);
  const k = Math.min(kmax, (x1 - x0) / bw, (y1 - y0) / bh);
  return camAt([(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};
const SD0 = X.besideSafe(L.VAULT);
const B = {
  rc: bx(L.CUTTER, -215, 215, -120, 180, 0, 330),
  vault: [...bx(L.VAULT, -150, 150, -125, 125, 0, 340), ...bx(SD0, -60, 60, -45, 45, 0, 200)],
  left: [...bx(L.SLOT_CAB, -200, 200, -60, 60, 0, 430), ...bx(L.OVF_CTR, -170, 170, -36, 36, 0, 160)],
  ovf: bx(L.OVF_CTR, -170, 170, -36, 36, 0, 260),
  bec: bx(L.BEC, -120, 120, -110, 110, 0, 280),
  atk: bx(L.ATK, -40, 200, -60, 60, 0, 300),
  gate: bx(L.GATE, -60, 60, -200, 40, 0, 300),
  rcv: L.RCV.flatMap((o) => bx(o, -40, 120, -40, 40, 0, 420)),
  desks: L.DESKS.flatMap((o) => bx(o, -130, 130, -70, 70, 0, 260)),
  doors: L.DOORS.flatMap((o) => bx(o, -60, 60, -10, 10, 0, 240)),
  cab: bx(L.SLOT_CAB, -200, 200, -60, 200, 0, 450),
  tr: bx(L.TROUGH, -2 * TL - 60, TL + 10, -40, 40, 0, 40),
  rcW: bx(L.CUTTER_W, -280, 280, -150, 230, 0, 420),
  signs: L.SIGNS.flatMap((o) => bx(o, -170, 170, -10, 10, 0, 220)),
  bridge: [...bx(L.R_ETH, -320, 320, -20, 20, 0, 130), ...bx(L.R_TRON, -320, 320, -20, 20, 0, 130), ...bx(L.R_BSC, -390, 390, -20, 20, 0, 130), ...bx(L.BRIDGE, -260, 260, -60, 60, 0, 200)],
  bsc: [...bx(L.BRIDGE, -420, 260, -60, 60, 0, 200), ...bx(L.R_BSC, -390, 390, -240, 20, 0, 200)],
  mini: [...bx(L.BRIDGE, -260, 260, -60, 60, 0, 200), ...bx(L.R_ETH, 0, 320, -20, 20, 0, 100)],
};
const CAMS = {
  three: fit([...B.left, ...B.rc, ...B.vault], [80, 200, 1840, 860]),
  signs: fit(B.signs, [140, 260, 1780, 860], 1.0),
  ctr: fit(B.ovf, [560, 300, 1360, 860], 1.5),
  bec: fit([...B.bec, ...B.ovf, ...B.atk], [80, 300, 880, 880], 1.3),
  gate: fit([...B.bec, ...B.ovf, ...B.atk, ...B.gate, ...B.rcv.filter((q, i) => i % 2 === 0)], [80, 300, 1840, 900], 1.0),
  wide: fit([...B.bec, ...B.atk, ...B.gate, ...B.desks, ...B.rcv.filter((q, i) => i % 2 === 0)], [80, 200, 1840, 880], 1.0),
  chk: fit([...B.ovf, ...B.doors, ...B.bec], [200, 260, 1720, 880], 1.3),
  cab: fit(B.cab, [380, 200, 1460, 860], 1.4),
  tr: fit(B.tr, [360, 360, 1560, 820], 1.5),
  cut: fit(B.rc, [1000, 430, 1860, 880], 1.3),
  cutW: fit([...B.rc, ...B.rcW], [120, 300, 1800, 900], 1.3),
  sign4: fit(bx(L.SIGNS[3], -500, 300, -10, 10, 0, 220), [300, 300, 1620, 860], 1.2),
  sign5: fit(bx(L.SIGNS[4], -500, 300, -10, 10, 0, 220), [300, 300, 1620, 860], 1.2),
  bridge: fit(B.bridge, [80, 260, 1840, 860], 1.2),
  bsc: fit(B.bsc, [80, 240, 1840, 860], 1.2),
  mini: fit(B.mini, [200, 260, 1720, 860], 1.6),
};

// ---------------------------------------------------------------- screen overlays: code cards, dot panel, leaders
const CARD = { A: { x: 900, y: 112, w: 980 }, B: { x: 1000, y: 112, w: 880 } };
const rowY = (c, i) => c.y + 24 + 56 + 50 * i + 25;
const chip = (t, cls = "") => `<span class="c-chip ${cls}">${t}</span>`;
const cardA = `<div class="k-code hide" id="cardA" style="left:${CARD.A.x}px;top:${CARD.A.y}px;width:${CARD.A.w}px">
  <div class="c-head">BEC 批量转账（节选）<span class="c-tag">Solidity 0.4</span></div>
  <div class="c-row" id="ca0">uint256 amount = uint256(cnt) * _value;<span class="c-cm">  // → 0</span></div>
  <div class="c-row" id="ca1">require(bal[msg.sender] >= amount);</div>
  <div class="c-row" id="ca2">bal[msg.sender] = bal[msg.sender].sub(amount);</div>
  <div class="c-row" id="ca3">bal[to[i]] = bal[to[i]].add(_value);</div>
</div>`;
const cardB = `<div class="k-code hide" id="cardB" style="left:${CARD.B.x}px;top:${CARD.B.y}px;width:${CARD.B.w}px">
  <div class="c-head">先除后乘<span class="c-tag">示例数字</span></div>
  <div class="c-row" id="cb0">a / b * c   <span class="c-cm">// 7 / 5 * 3 = 3</span>${chip("✗")}</div>
  <div class="c-row" id="cb1">a * c / b   <span class="c-cm">// 7 * 3 / 5 = 4</span>${chip("✓", "ok hide")}</div>
  <div class="c-row" id="cb2">Math.mulDiv(a, c, b, Rounding.Floor)</div>
</div>`;
// dot panel (screen) — each dot = 1 unit
const DX = 150, DS = 34, DD = 26, ROWA = 104, ROWB = 262;
const dot = (id, x, y, cls = "") => `<i class="dt ${cls}" id="${id}" style="left:${x}px;top:${y}px"></i>`;
let mx = `<div class="mx-h">7 × 3 ÷ 5 <span class="gtag">示例</span></div>`;
mx += `<div class="mx-l" style="top:${ROWA - 8}px">先除</div><div class="mx-l" style="top:${ROWB - 8}px">先乘</div>`;
for (let i = 0; i < 7; i++) mx += dot("da" + i, DX + i * DS, ROWA, "hide");
mx += `<div class="gbox hide" id="ga" style="left:${DX - 7}px;top:${ROWA - 7}px;width:${4 * DS + DD + 14}px"></div>`;
mx += `<div class="mx-s hide" id="sa" style="left:${DX}px;top:${ROWA + 40}px">÷ 5 = 1 · 余数丢掉</div>`;
mx += `<div class="mx-op hide" id="opa" style="left:${DX + 7 * DS + 30}px;top:${ROWA - 14}px">× 3 →</div>`;
for (let i = 0; i < 3; i++) mx += dot("ra" + i, DX + 7 * DS + 150 + i * DS, ROWA, "hide");
mx += `<div class="mx-r hide" id="resA" style="left:${DX + 7 * DS + 270}px;top:${ROWA - 26}px">= 3</div>`;
for (let i = 0; i < 21; i++) mx += dot("db" + i, DX + i * DS, ROWB, "hide");
for (let g = 0; g < 4; g++) mx += `<div class="gbox hide" id="gb${g}" style="left:${DX + g * 5 * DS - 6}px;top:${ROWB - 7}px;width:${4 * DS + DD + 12}px"></div>`;
mx += `<div class="mx-s hide" id="sb" style="left:${DX}px;top:${ROWB + 40}px">÷ 5 = 4 · 余 1 丢掉</div>`;
mx += `<div class="mx-r hide" id="resB" style="left:${DX + 380}px;top:${ROWB + 26}px">= 4</div>`;
mx += `<div class="mx-cmp hide" id="cmp">先除少了 1 · 丢掉的误差被 × 3 放大</div>`;
const panel = `<div class="mx hide" id="mx">${mx}</div>`;
const S = (cam, p) => toScreen(CAMS[cam], p);
const ov = [];
const sc = (id, P0, P3, o) => { const c = dashCurve(id, P0, P3, o); ov.push(c.svg); return c; };
const RED = "#e0453a", TEAL = "#1d93ba";
const lead = (id, card, row, P3, color, bend = 160) => {
  const P0 = [card.x - 4, rowY(card, row)];
  sc(id, P0, P3, { color, c1: [P0[0] - bend, P0[1] + 10], c2: [P3[0] + 60, P3[1] - bend] });
};
lead("cv-a0", CARD.A, 0, S("bec", A.ctr.window), RED);
lead("cv-a2", CARD.A, 2, S("gate", up(A.atk.head, 10)), RED, 220);
lead("cv-a3", CARD.A, 3, S("gate", up(A.rv1.head, 10)), RED, 120);
const PX = 56, PY = 116;      // panel origin on screen
lead("cv-b0", CARD.B, 0, [PX + DX + 7 * DS + 330, PY + ROWA + 13], RED, 80);
lead("cv-b1", CARD.B, 1, [PX + DX + 21 * DS + 40, PY + ROWB + 60], TEAL, 80);
lead("cv-b2", CARD.B, 2, S("cutW", up(A.rcW.center, 40)), TEAL, 140);
const ovSvg = `<svg id="ovl" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">${ov.join("")}</svg>`;

// five-defect strip (top-left)
const strip = `<div class="dz hide" id="dz"><span class="dz-t">五类缺陷</span>${NUM.map((n, i) => `<span class="dz-s" id="dz${i}">${i + 1}</span>`).join("")}<span class="dz-n">${NAMES.map((d, i) => `<span class="dz-name" id="dzn${i}">${d}</span>`).join("")}</span></div>`;

// ---------------------------------------------------------------- times
const TM = {
  math: w("数学缺陷", 0), five: w("五类", 0),
  n: NAMES.map((t) => w(t, 1)),
  c1: w("第一类", 2), lim: w("上限", 2), wrap2: w("回绕", 2),
  y2018: w("2018", 3), bec: w("BEC", 3), batch: w("批量转账", 3),
  v04: w("0.4", 4), sol: w("Solidity", 4), noChk: w("没有溢出检查", 4),
  total: w("总额", 5), cnt: w("接收人数", 5), each: w("每人的金额", 5),
  atk: w("攻击者", 6), two: w("2个接收地址", 6), each6: w("每人", 6),
  mul7: w("2乘以", 7), p256: w("256次方", 7),
  max8: w("上限", 8), wrap8: w("回绕成了", 8),
  chk9: w("余额检查", 9), pass9: w("直接通过", 9), snd9: w("发送者", 9), zero9: w("也是", 9),
  rcv10: w("两个接收者", 10), got10: w("各自收到", 10),
  thin: w("凭空出现", 11), rep: w("公开报道", 11), halt: w("暂停", 11),
  v08: w("0.8", 12), dflt: w("默认检查", 12),
  three: w("三处", 13), silent: w("静默回绕", 13), unch: w("unchecked", 13), asm: w("内联汇编", 13), cast: w("类型转换", 13),
  shift: w("移位", 14),
  c2: w("第二类", 15), big: w("大类型", 15), small: w("小类型", 15), high: w("高位", 15), noErr: w("不报错", 15),
  c3: w("第三类", 16), dbm: w("先除后乘", 16), ex: w("7乘3", 16), by5: w("除以5", 16),
  div17: w("先除", 17), eq1: w("等于1", 17), drop17: w("余数丢掉", 17), x3: w("再乘3", 17), res3: w("结果是3", 17),
  mul18: w("先乘", 18), n21: w("21", 18), div18: w("再除以5", 18), res4: w("结果是4", 18),
  less: w("少了1", 19), lost: w("丢掉的误差", 19), amp: w("放大", 19),
  mfd: w("先乘后除", 20), mdv: w("mulDiv", 20),
  b512: w("512", 21), noOf: w("不会溢出", 21), dir21: w("舍入方向", 21),
  c4: w("第四类", 22), nextSeg: w("下一段", 22), c5: w("第五类", 22), unit: w("单位不一致", 22),
  usdt: w("USDT", 23), eth: w("以太坊", 23), six: w("6位小数", 23), tron: w("TRON", 23),
  bnb: w("BNB", 24), bsc: w("BSC", 24), e18: w("18位", 24),
  copy: w("原样搬过去", 25), hard: w("写死", 25),
  amp26: w("放大", 26), e12: w("12次方", 26),
  readDec: w("decimals", 27), read27: w("读取", 27), noHard: w("不要写死", 27),
  bridge28: w("跨链桥", 28), conv: w("显式换算", 28), rem: w("余数", 28),
};

// movement deltas
const DL = (from, to) => [f(to[0] - from[0]), f(to[1] - from[1])];
const MV = {
  lt: [0, 1].map((i) => DL(A["lt" + i].center, A.bec.slot)),
};
const crown = { u: L.BRIDGE.u, v: L.BRIDGE.v };
const PORT = [
  [crown.u - 60 - PC0.u, crown.v - 30 - PC0.v, 70],           // up to the crown
  [L.R_BSC.u - 400 - PC0.u, L.R_BSC.v - 240 - PC0.v, 0],     // down to the far bank, beside the 18-place ruler
];

const GROWN = ["lmp", "rcW", "bec", "atk", "gate", "rv0", "rv1", "pl0", "pl1", "dk0", "dk1", "dr0", "dr1", "dr2", "trw",
  "rE", "rT", "rB", "mg", "rcMw", ...[0, 1, 2, 3, 4].map((i) => `sg${i}a`)];

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 84px; }
    .kw { position: absolute; left: 56px; top: 116px; font-size: 42px; font-weight: 900; color: #1c1c1c; background: #fffdf8; border-radius: 16px; padding: 10px 28px 14px;
      box-shadow: 0 10px 24px rgba(70,60,40,0.12); white-space: nowrap; }
    .kw b { color: #1d93ba; }
    .gtag { display: inline-block; font-size: 30px; font-weight: 800; color: #6d685e; background: #ebe6dc; border-radius: 8px; padding: 2px 12px 4px; margin-left: 12px; vertical-align: 6px; }
    .kw .gtag { margin: 0 14px 0 0; }
    .k-code .c-chip.ok { background: #1f9d55; }
    .k-code .c-row { white-space: pre; }
    .lab sup { font-size: 0.62em; vertical-align: 0.55em; line-height: 0; }
    .lab.big { font-size: 64px; padding: 6px 26px 12px; }
    .lab.mid { font-size: 42px; padding: 6px 22px 10px; }
    .dts { display: inline-flex; gap: 6px; margin: 0 6px; }
    .dts i { width: 20px; height: 20px; border-radius: 50%; background: #1f9d55; display: inline-block; }
    .dz { position: absolute; left: 56px; top: 30px; height: 60px; display: flex; align-items: center; gap: 10px; background: #fffdf8; border-radius: 14px; padding: 0 18px;
      box-shadow: 0 6px 16px rgba(70,60,40,0.10); }
    .dz-t { font-size: 30px; font-weight: 900; margin-right: 6px; white-space: nowrap; }
    .dz-s { width: 44px; height: 44px; border-radius: 10px; border: 3px dashed #c9c1b2; color: #8a8478; font: 800 28px/38px "Noto Sans SC", sans-serif; text-align: center; }
    .dz-s.lit { border: 3px solid #1d93ba; color: #1d93ba; }
    .dz-s.cur { background: #1c1c1c; border-color: #1c1c1c; color: #ffffff; }
    .dz-n { position: relative; width: 190px; height: 44px; margin-left: 8px; }
    .dz-name { position: absolute; left: 0; top: 0; font-size: 30px; font-weight: 800; line-height: 44px; white-space: nowrap; opacity: 0; }
    .mx { position: absolute; left: ${PX}px; top: ${PY}px; width: 900px; height: 440px; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); }
    .mx-h { position: absolute; left: 28px; top: 18px; font-size: 40px; font-weight: 900; white-space: nowrap; }
    .mx-l { position: absolute; left: 28px; font-size: 32px; font-weight: 900; color: #1d93ba; }
    .mx-s { position: absolute; font-size: 30px; font-weight: 700; color: #6d685e; white-space: nowrap; }
    .mx-op { position: absolute; font-size: 40px; font-weight: 900; white-space: nowrap; }
    .mx-r { position: absolute; font-size: 56px; font-weight: 900; white-space: nowrap; }
    .mx-cmp { position: absolute; left: 28px; top: 380px; font-size: 32px; font-weight: 900; color: #ffffff; background: #e0453a; border-radius: 10px; padding: 2px 16px 6px; white-space: nowrap; }
    .dt { position: absolute; width: ${DD}px; height: ${DD}px; border-radius: 50%; background: #1f9d55; display: block; }
    .gbox { position: absolute; height: ${DD + 14}px; border: 3px solid #1d93ba; border-radius: 12px; }
    #fp-x { display: none; }
    .tcard { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
      padding: 14px 26px 18px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
    .tcard.tc-low { top: 214px; }
    .tcard .t1 { font-size: 32px; font-weight: 900; white-space: nowrap; }
    .tcard .t1 code { font-family: "JetBrains Mono", monospace; font-weight: 800; }
    .tcard .t2 { margin-top: 6px; font-size: 29px; font-weight: 700; color: #3d3a35; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div class="kw hide" id="kw-five">合约里的数学缺陷 · 分成 <b>五类</b></div>
      <div class="kw hide" id="kw-bec">2018 年 4 月 · 以太坊 · <b>BEC</b> 批量转账</div>
      <div class="kw hide" id="kw-08">0.8 以后 · 算术<b>默认检查溢出</b></div>
      <div class="kw hide" id="kw-unit">同样叫 USDT · <b>小数位</b>不一样</div>
      <div class="kw hide" id="kw-rule"><b>永远从合约读 decimals()</b> · 不要写死</div>
      ${strip}${cardA}${cardB}${panel}${ovSvg}
      <div class="tcard tc-low hide" id="tcS"><div class="t1">Solidity</div><div class="t2">编写以太坊合约的编程语言</div></div>
      <div class="tcard hide" id="tcU"><div class="t1"><code>unchecked</code> 块</div><div class="t2">不做溢出检查的代码块</div></div>
      <div class="tcard hide" id="tcB"><div class="t1">跨链桥</div><div class="t2">在两条链之间转移资产或消息的系统</div></div>
      ${pills(2, { sections: SECTIONS })}
      <div class="k-title" id="ttl-card"><div class="t-main">② 五类缺陷</div><div class="t-sub">合约里的数学缺陷</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${E1.runtimeExtJs()}
${E2.runtimeExtJs()}
${E3.runtimeExtJs()}
${X.runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const MV = ${JSON.stringify(MV)};
      const PORT = ${JSON.stringify(PORT)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const X3 = window.KITX03, X6 = window.KITX06;
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const flash = (sel, t, n, lo) => tl.fromTo(sel, { opacity: 1 }, { opacity: lo == null ? 0.25 : lo, duration: 0.16, yoyo: true, repeat: (n || 3) * 2 - 1, ease: "power1.inOut", immediateRender: false }, t);
      const swap = (a, b, t, d) => KIT.swap(tl, a, b, t, d || 0.25);
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      ${JSON.stringify(GROWN)}.forEach((id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); });
      const slot = (i, cls, t) => tl.set("#dz" + i, { className: "dz-s " + cls }, t);
      const dzName = (i, t) => { [0, 1, 2, 3, 4].forEach((j) => tl.to("#dzn" + j, { opacity: j === i ? 1 : 0, duration: 0.2 }, t)); };
      const hot = (id, t) => tl.to("#" + id, { backgroundColor: "#fdeae7", duration: 0.2 }, t);
      const cool = (id, t) => tl.to("#" + id, { backgroundColor: "rgba(253,234,231,0)", duration: 0.2 }, t);
      const teal = (id, t) => tl.to("#" + id, { backgroundColor: "#dff1f7", duration: 0.2 }, t);
      const dome = (t, c) => { tl.to("#lmp-dome", { attr: { fill: c }, duration: 0.15 }, t); tl.to("#lmp-halo", { attr: { fill: c }, opacity: c === "#5c6168" ? 0 : 0.3, duration: 0.15 }, t); };
      const count = (t, d, a, b, e) => KIT.count(tl, "ovf", t, d, a, b, e);
      const term = (id, t0, t1) => { KIT.pop(tl, "#" + id, t0, 0.3); out("#" + id, t1, 0.25); };
      ["#cb0", "#cb1", "#cb2", "#ca0", "#ca1", "#ca2", "#ca3"].forEach((s) => tl.set(s, { backgroundColor: "rgba(253,234,231,0)" }, 0));

      KIT.camSet(tl, CAMS.three);
      out("#s1t1, #s1t2, #s1t3", 0.7, 0.3); out("#evm", 0.8, 0.5);
      KIT.cam(tl, 1.25, CAMS.signs, 1.4);
      // ===== 0–1.6 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.2);
      // ===== L0 five kinds: five blank plates along the road
      pop("#kw-five", ${f(TM.math)}, 0.3);
      [0, 1, 2, 3, 4].forEach((i) => grow("sg" + i + "a", ${f(TM.five - 0.4)} + i * 0.12, 0.45));
      // ===== L1 the five names flip in
      ${JSON.stringify(TM.n.map(f))}.forEach((t, i) => { swap("#sg" + i + "a", "#sg" + i + "b-w", t - 0.1, 0.3); });
      pop("#lb-next", ${f(TM.n[3] + 0.4)}, 0.3);
      // ===== L2 #1 overflow: the odometer rolls past its maximum back to zero
      out("#kw-five, #lb-next", ${f(LS[2] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[2] - 0.2)}, CAMS.ctr, 1.3);
      pop("#dz", ${f(TM.c1)}, 0.3); [0, 1, 2, 3, 4].forEach((i) => slot(i, "lit", ${f(TM.c1)} + i * 0.06)); slot(0, "cur", ${f(TM.c1 + 0.4)}); dzName(0, ${f(TM.c1 + 0.4)});
      KIT.setCount && count(${f(LS[2] + 0.4)}, 0.01, 9999999990, 9999999990);
      count(${f(TM.lim)}, ${f(TM.wrap2 - TM.lim)}, 9999999990, 9999999999.0, "power1.inOut");
      count(${f(TM.wrap2)}, 0.5, 9999999999.0, 10000000000, "power2.in");
      flash("#ctrR", ${f(TM.wrap2 + 0.45)}, 3, 0); tl.set("#ctrR", { opacity: 0 }, ${f(TM.wrap2 + 1.5)});
      pop("#lb-wrap", ${f(TM.wrap2 + 0.4)}, 0.3);
      // ===== L3 BEC 2018-04
      out("#lb-wrap", ${f(LS[3] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[3] - 0.1)}, CAMS.bec, 1.2);
      grow("bec", ${f(TM.bec - 0.5)}, 0.5);
      pop("#kw-bec", ${f(TM.y2018)}, 0.3);
      X3.spin(tl, "bec", ${f(TM.batch)}, 1.2, 1, "power2.inOut");
      // ===== L4 Solidity 0.4, no overflow check
      pop("#lb-sol", ${f(TM.v04)}, 0.3);
      term("tcS", ${f(TM.sol)}, ${f(Math.min(TM.sol + 3.6, TM.noChk - 0.1))});
      fadeIn("#sock", ${f(TM.noChk - 0.2)}, 0.2); flash("#sock", ${f(TM.noChk)}, 2, 0.3);
      pop("#lb-sock", ${f(TM.noChk + 0.1)}, 0.3);
      // ===== L5 total = receivers × amount
      out("#lb-sol", ${f(LS[5])}, 0.2);
      pop("#cardA", ${f(TM.total - 0.2)}, 0.35); hot("ca0", ${f(TM.total + 0.2)});
      pop("#lb-form", ${f(TM.cnt)}, 0.3);
      // ===== L6 attacker: 2 receivers × 2^255 each
      grow("atk", ${f(TM.atk - 0.3)}, 0.45); out("#lb-form", ${f(TM.atk - 0.2)}, 0.2);
      [0, 1].forEach((i) => { fadeIn("#lt" + i + "-mv", ${f(TM.two)} + i * 0.25, 0.25); pop("#lb-lt" + i, ${f(TM.two + 0.2)} + i * 0.25, 0.25); });
      pop("#lb-two", ${f(TM.two + 0.1)}, 0.3);
      [0, 1].forEach((i) => { out("#lb-lt" + i, ${f(LE[6] - 0.6)} + i * 0.3, 0.15); X3.fly(tl, "lt" + i + "-mv", ${f(LE[6] - 0.6)} + i * 0.3, +MV.lt[i][0], +MV.lt[i][1], 0.7, 90); out("#lt" + i + "-mv", ${f(LE[6] + 0.08)} + i * 0.3, 0.12); });
      X3.slot(tl, "bec", ${f(LE[6] - 0.1)}, true);
      // ===== L7 2 × 2^255 = 2^256 — the odometer races to the top
      out("#lb-two", ${f(LS[7])}, 0.2);
      X3.slot(tl, "bec", ${f(LS[7] + 0.4)}, false);
      pop("#lb-mul", ${f(TM.mul7)}, 0.3);
      count(${f(TM.mul7)}, ${f(LE[7] - 0.2 - TM.mul7)}, 10000000000, 19999999990, "power2.in");
      // ===== L8 just over the 256-bit limit: wraps to 0
      count(${f(TM.max8 - 0.3)}, 0.6, 19999999990, 20000000000, "power2.in");
      swap("#lb-mul", "#lb-256", ${f(TM.max8)}, 0.25);
      flash("#ctrR", ${f(TM.max8 + 0.3)}, 3, 0); tl.set("#ctrR", { opacity: 0 }, ${f(TM.max8 + 1.4)});
      KIT.draw(tl, "cv-a0", ${f(TM.wrap8)}, 0.6);
      // ===== L9 the balance check compares against 0 → passes; sender loses 0
      out("#cv-a0, #lb-sock, #sock, #lb-256", ${f(LS[9] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[9] - 0.2)}, CAMS.gate, 1.2);
      grow("gate", ${f(LS[9] + 0.2)}, 0.45);
      cool("ca0", ${f(TM.chk9)}); hot("ca1", ${f(TM.chk9)});
      pop("#lb-gate", ${f(TM.chk9)}, 0.3);
      swap("#lb-gate", "#lb-ge0", ${f(TM.chk9 + 0.9)}, 0.25);
      KIT.arm(tl, "gate", ${f(TM.pass9 - 0.2)}, true, 0.6);
      pop("#lb-pass", ${f(TM.pass9)}, 0.3);
      cool("ca1", ${f(TM.snd9)}); hot("ca2", ${f(TM.snd9)});
      pop("#lb-snd", ${f(TM.snd9 + 0.2)}, 0.3);
      KIT.draw(tl, "cv-a2", ${f(TM.zero9 - 0.2)}, 0.6);
      // ===== L10 two receivers each get 2^255
      out("#cv-a2, #lb-pass", ${f(LS[10] - 0.1)}, 0.2);
      cool("ca2", ${f(TM.rcv10)}); hot("ca3", ${f(TM.rcv10)});
      grow("rv0", ${f(TM.rcv10 - 0.2)}, 0.4); grow("rv1", ${f(TM.rcv10)}, 0.4);
      pop("#lb-rcv", ${f(TM.rcv10 + 0.3)}, 0.3);
      grow("pl0", ${f(TM.got10)}, 1.3); grow("pl1", ${f(TM.got10 + 0.15)}, 1.3);
      KIT.draw(tl, "cv-a3", ${f(TM.got10 + 0.3)}, 0.6);
      // ===== L11 tokens from nothing; exchanges halt BEC deposits/withdrawals (public reports)
      out("#cv-a3, #cardA, #lb-ge0, #lb-256", ${f(LS[11] - 0.1)}, 0.2);
      pop("#lb-mint", ${f(TM.thin)}, 0.3);
      KIT.cam(tl, ${f(TM.thin + 0.3)}, CAMS.wide, 1.4);
      grow("dk0", ${f(TM.rep - 0.6)}, 0.4); grow("dk1", ${f(TM.rep - 0.45)}, 0.4);
      pop("#lb-rep", ${f(TM.rep)}, 0.3);
      swap("#dk0-scr", "#dk0-scr2", ${f(TM.halt)}, 0.25); swap("#dk1-scr", "#dk1-scr2", ${f(TM.halt + 0.15)}, 0.25);
      pop("#lb-ex", ${f(TM.halt + 0.2)}, 0.3);
      out("#kw-bec", ${f(TM.halt)}, 0.2);
      // ===== L12 from 0.8 on: checked by default → over the limit the whole call reverts
      out("#lb-mint, #lb-rep, #lb-ex, #lb-rcv, #lb-snd", ${f(LS[12] - 0.1)}, 0.2);
      out("#pl0, #pl1, #rv0, #rv1, #dk0, #dk1, #gate", ${f(LS[12])}, 0.4);
      KIT.cam(tl, ${f(LS[12] - 0.1)}, CAMS.chk, 1.2);
      pop("#kw-08", ${f(TM.v08)}, 0.3); grow("lmp", ${f(TM.v08)}, 0.35);
      dome(${f(TM.dflt - 0.2)}, "#1f9d55"); pop("#lb-08", ${f(TM.dflt - 0.1)}, 0.3);
      count(${f(TM.dflt)}, 0.9, 20000000000, 29999999999.0, "power2.in");
      flash("#lmp-dome", ${f(TM.dflt + 0.9)}, 2, 0.4);
      count(${f(TM.dflt + 1.5)}, 0.6, 29999999999.0, 20000000000, "power2.inOut");
      pop("#lb-rev", ${f(TM.dflt + 1.5)}, 0.3); pop("#ck-rev-i", ${f(TM.dflt + 1.7)}, 0.3);
      // ===== L13 but three places still wrap silently: unchecked, inline assembly, type conversion
      out("#lb-rev, #ck-rev-i, #kw-08", ${f(LS[13] + 0.3)}, 0.2);
      [0, 1, 2].forEach((i) => grow("dr" + i, ${f(TM.three - 0.2)} + i * 0.12, 0.4));
      term("tcU", ${f(TM.unch)}, ${f(TM.unch + 3.6)});
      pop("#lb-dr0", ${f(TM.unch)}, 0.25); pop("#lb-dr1", ${f(TM.asm)}, 0.25); pop("#lb-dr2", ${f(TM.cast)}, 0.25);
      dome(${f(TM.silent - 0.3)}, "#5c6168"); out("#lb-08", ${f(TM.silent - 0.3)}, 0.2);
      count(${f(TM.silent - 0.2)}, 1.2, 20000000000, 30000000000, "power2.in");
      pop("#lb-silent", ${f(TM.silent + 0.9)}, 0.3);
      // ===== L14 shifts don't check either: bits shifted out of the top are gone
      out("#lb-silent, #lb-dr0, #lb-dr1, #lb-dr2", ${f(LS[14] - 0.2)}, 0.2);
      KIT.cam(tl, ${f(LS[14] - 0.25)}, CAMS.cab, 0.9);
      X3.drawer(tl, "cab", 3, ${f(LS[14] + 0.2)}, true, 0.5);
      X6.carry(tl, "cab-blk-3-0", ${f(TM.shift + 0.2)}, -3 * 10, 0, 0, 0.5);
      X6.carry(tl, "cab-blk-3-1", ${f(TM.shift + 0.2)}, -3 * 10, 0, 0, 0.5);
      X6.carry(tl, "cab-blk-3-0", ${f(TM.shift + 0.8)}, -3 * 10 - 20, 30, -120, 0.45);
      out("#cab-blk-3-0", ${f(TM.shift + 1.0)}, 0.25);
      pop("#lb-shift", ${f(TM.shift + 0.6)}, 0.3);
      // ===== L15 #2 truncation: big type → small type, high bytes dropped, no error
      out("#lb-shift", ${f(LS[15] - 0.1)}, 0.2);
      slot(0, "lit", ${f(TM.c2)}); slot(1, "cur", ${f(TM.c2)}); dzName(1, ${f(TM.c2)});
      KIT.cam(tl, ${f(LS[15] - 0.1)}, CAMS.tr, 1.0);
      grow("trw", ${f(LS[15] + 0.4)}, 0.5);
      pop("#lb-u256", ${f(TM.big)}, 0.3);
      pop("#lb-u128", ${f(TM.small)}, 0.3);
      out("#lb-u256", ${f(TM.small + 0.2)}, 0.2);
      X6.carry(tl, "tb", ${f(TM.small + 0.2)}, ${TL + 60}, 0, 0, 0.8);
      flash("#tbRw", ${f(TM.high)}, 2, 0.35);
      X6.carry(tl, "tbRw", ${f(TM.high + 0.7)}, -20, 40, -140, 0.5);
      out("#tbRw", ${f(TM.high + 0.95)}, 0.25);
      pop("#lb-trunc", ${f(TM.noErr - 0.2)}, 0.3);
      // ===== L16 #3 divide before multiply · 7 × 3 ÷ 5 (example numbers)
      out("#lb-trunc, #lb-u128", ${f(LS[16] - 0.1)}, 0.2);
      out("#dr0, #dr1, #dr2, #trw", ${f(LS[16] + 0.2)}, 0.4);
      slot(1, "lit", ${f(TM.c3)}); slot(2, "cur", ${f(TM.c3)}); dzName(2, ${f(TM.c3)});
      KIT.cam(tl, ${f(LS[16] - 0.1)}, CAMS.cut, 1.4);
      pop("#cardB", ${f(TM.dbm)}, 0.35);
      pop("#mx", ${f(TM.dbm + 0.5)}, 0.35);
      [0, 1, 2, 3, 4, 5, 6].forEach((i) => fadeIn("#da" + i, ${f(TM.ex)} + i * 0.06, 0.15));
      swap("#rc0", "#rcA-w", ${f(LS[16] + 0.6)}, 0.3);
      X6.feed(tl, "rcA", ${f(TM.by5 - 0.3)}, 0.6);
      pop("#lb-cA", ${f(TM.by5)}, 0.3);
      // ===== L17 divide first: 7 ÷ 5 = 1, remainder dropped; × 3 = 3
      hot("cb0", ${f(TM.div17)});
      pop("#ga", ${f(TM.eq1 - 0.2)}, 0.3); pop("#sa", ${f(TM.eq1)}, 0.3);
      X6.blade(tl, "rcA", ${f(TM.drop17 - 0.3)}, true);
      tl.to("#da5, #da6", { backgroundColor: "#e0453a", duration: 0.15 }, ${f(TM.drop17 - 0.1)});
      tl.to("#da5, #da6", { y: 40, opacity: 0, duration: 0.5, ease: "power2.in" }, ${f(TM.drop17 + 0.3)});
      tl.to("#rcA-chip", { y: 70, opacity: 0, duration: 0.5, ease: "power2.in" }, ${f(TM.drop17 - 0.05)});
      X6.blade(tl, "rcA", ${f(TM.drop17 + 0.5)}, false);
      pop("#opa", ${f(TM.x3 - 0.1)}, 0.25);
      [0, 1, 2].forEach((i) => fadeIn("#ra" + i, ${f(TM.x3 + 0.2)} + i * 0.12, 0.15));
      pop("#resA", ${f(TM.res3 + 0.2)}, 0.3);
      KIT.draw(tl, "cv-b0", ${f(TM.res3 + 0.3)}, 0.5);
      // ===== L18 multiply first: 7 × 3 = 21, ÷ 5 = 4
      out("#cv-b0", ${f(LS[18] - 0.1)}, 0.2); cool("cb0", ${f(LS[18])}); hot("cb1", ${f(TM.mul18)});
      swap("#rcA-w, #lb-cA", "#rcB-w", ${f(LS[18] + 0.1)}, 0.35);
      [0, 1, 2, 3, 4, 5, 6].forEach((i) => fadeIn("#db" + i, ${f(TM.mul18 + 0.1)} + i * 0.03, 0.12));
      for (let k = 1; k < 3; k++) for (let i = 0; i < 7; i++) fadeIn("#db" + (k * 7 + i), ${f(TM.n21 - 0.3)} + (k - 1) * 0.3 + i * 0.025, 0.12);
      [0, 1, 2, 3].forEach((g) => pop("#gb" + g, ${f(TM.div18)} + g * 0.15, 0.25));
      pop("#lb-cB", ${f(TM.div18)}, 0.3);
      X6.blade(tl, "rcB", ${f(TM.res4 - 0.4)}, true);
      tl.to("#db20", { backgroundColor: "#e0453a", duration: 0.15 }, ${f(TM.res4 - 0.3)});
      tl.to("#rcB-chip", { y: 70, opacity: 0, duration: 0.5, ease: "power2.in" }, ${f(TM.res4 - 0.15)});
      tl.to("#db20", { y: 40, opacity: 0, duration: 0.5, ease: "power2.in" }, ${f(TM.res4 + 0.1)});
      X6.blade(tl, "rcB", ${f(TM.res4 + 0.4)}, false);
      pop("#sb", ${f(TM.res4 - 0.2)}, 0.3); pop("#resB", ${f(TM.res4 + 0.2)}, 0.3);
      KIT.draw(tl, "cv-b1", ${f(TM.res4 + 0.3)}, 0.5);
      // ===== L19 divide-first lost 1 — the dropped error was amplified by × 3
      out("#cv-b1", ${f(LS[19] - 0.1)}, 0.2); cool("cb1", ${f(LS[19])});
      tl.to("#resA", { color: "#e0453a", duration: 0.2 }, ${f(TM.less - 0.1)});
      tl.set("#da5, #da6", { y: 0, backgroundColor: "rgba(224,69,58,0)", border: "3px dashed #e0453a" }, ${f(TM.lost - 0.3)});
      fadeIn("#da5, #da6", ${f(TM.lost - 0.3)}, 0.25);
      pop("#cmp", ${f(TM.less)}, 0.3);
      // ===== L20 so multiply before divide — better: mulDiv
      out("#mx, #lb-cB", ${f(LS[20] - 0.1)}, 0.25);
      KIT.cam(tl, ${f(LS[20] - 0.1)}, CAMS.cutW, 1.2);
      hot("cb1", ${f(TM.mfd)}); tl.to("#cb1 .c-chip", { opacity: 1, duration: 0.2 }, ${f(TM.mfd + 0.3)});
      cool("cb1", ${f(TM.mdv - 0.2)}); teal("cb2", ${f(TM.mdv - 0.2)});
      grow("rcW", ${f(TM.mfd - 0.2)}, 0.5);
      pop("#lb-mdv", ${f(TM.mdv)}, 0.3);
      KIT.draw(tl, "cv-b2", ${f(TM.mdv + 0.2)}, 0.6);
      // ===== L21 512-bit intermediate, no overflow, rounding direction chosen
      swap("#lb-mdv", "#lb-512", ${f(TM.b512 - 0.1)}, 0.25);
      X6.lever(tl, "rcW", ${f(TM.dir21 - 0.2)}, "down");
      pop("#lb-dir", ${f(TM.dir21 + 0.1)}, 0.3);
      // ===== L22 #4 rounding direction: next segment → #5 units
      out("#cardB, #cv-b2, #lb-512, #lb-dir", ${f(LS[22] - 0.1)}, 0.2);
      slot(2, "lit", ${f(TM.c4)}); slot(3, "cur", ${f(TM.c4)}); dzName(3, ${f(TM.c4)});
      KIT.cam(tl, ${f(LS[22] - 0.1)}, CAMS.sign4, 1.1);
      pop("#lb-next", ${f(TM.nextSeg - 0.2)}, 0.3); flash("#sg3b-w", ${f(TM.nextSeg)}, 2, 0.4);
      out("#lb-next", ${f(TM.c5 - 0.2)}, 0.2);
      slot(3, "lit", ${f(TM.c5)}); slot(4, "cur", ${f(TM.c5)}); dzName(4, ${f(TM.c5)});
      KIT.cam(tl, ${f(TM.c5 - 0.3)}, CAMS.sign5, 0.6);
      KIT.cam(tl, ${f(TM.unit + 0.1)}, CAMS.bridge, 1.4);
      // ===== L23 USDT: Ethereum 6 decimals, TRON 6 decimals
      pop("#kw-unit", ${f(TM.usdt)}, 0.3);
      grow("rE", ${f(TM.eth - 0.3)}, 0.5); pop("#lb-rE", ${f(TM.six - 0.2)}, 0.3);
      grow("rT", ${f(TM.tron - 0.3)}, 0.5); pop("#lb-rT", ${f(TM.tron + 0.3)}, 0.3);
      // ===== L24 BNB Chain BSC-USD: 18 decimals
      grow("rB", ${f(TM.bnb - 0.3)}, 0.6); pop("#lb-rB", ${f(TM.e18 - 0.3)}, 0.3);
      // ===== L25 the Ethereum code copied over with 6 hard-coded
      out("#kw-unit", ${f(LS[25] - 0.1)}, 0.2);
      KIT.cam(tl, ${f(LS[25] - 0.1)}, CAMS.bsc, 1.2);
      pop("#lb-copy", ${f(LS[25] + 0.1)}, 0.3);
      X6.carry(tl, "pcw", ${f(TM.copy - 0.3)}, +PORT[0][0], +PORT[0][1], +PORT[0][2], 1.0, 0, "power1.in");
      X6.carry(tl, "pcw", ${f(TM.copy + 0.7)}, +PORT[1][0], +PORT[1][1], +PORT[1][2], 1.2, 0, "power1.out");
      out("#lb-copy", ${f(TM.hard - 0.4)}, 0.2);
      X6.shiftDot(tl, "rB", ${f(TM.hard)}, 12, { dur: 0.9 });
      pop("#lb-hard", ${f(TM.hard + 0.9)}, 0.3);
      // ===== L26 amounts blown up by 10^12
      X6.slider(tl, "rB", ${f(LS[26] + 0.2)}, 17.5, 1.2);
      pop("#lb-x12", ${f(LS[26] + 0.9)}, 0.35);
      // ===== L27 always read decimals from the contract
      out("#lb-x12, #lb-hard", ${f(LS[27] - 0.1)}, 0.2);
      pop("#kw-rule", ${f(LS[27] + 0.1)}, 0.3);
      grow("mg", ${f(TM.read27 - 0.5)}, 0.5);
      pop("#lb-dec", ${f(TM.read27 + 0.1)}, 0.3);
      X6.rulerOk(tl, "rB", ${f(TM.noHard - 0.4)});
      X6.shiftDot(tl, "rB", ${f(TM.noHard - 0.4)}, 0, { flash: false, red: false, dur: 0.7 });
      X6.slider(tl, "rB", ${f(TM.noHard - 0.2)}, 5.5, 0.8);
      pop("#ck-dec-i", ${f(TM.noHard + 0.5)}, 0.3);
      // ===== L28 bridge between precisions: explicit conversion, remainder handled
      out("#kw-rule, #lb-dec, #ck-dec-i, #mg, #pcw", ${f(LS[28] - 0.1)}, 0.25);
      KIT.cam(tl, ${f(LS[28] - 0.1)}, CAMS.mini, 1.2);
      grow("rcMw", ${f(TM.bridge28 + 0.2)}, 0.5);
      term("tcB", ${f(TM.bridge28)}, ${f(TM.bridge28 + 3.6)});
      swap("#lb-rB", "#lb-rB2", ${f(LS[28] + 0.2)}, 0.3);
      pop("#lb-conv", ${f(TM.conv)}, 0.3);
      X6.cut(tl, "rcM", ${f(TM.conv + 0.5)}, "L");
      pop("#lb-proto", ${f(TM.rem)}, 0.3);
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
// ep03 contractMachine: nameplate rect can go negative-width → clamp to 0
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html.replace(/width="-[0-9.]+"/g, 'width="0"'));
console.log("wrote compositions/story.html", html.length, "bytes");
