// Generates compositions/story.html for ep01/seg2「② 代码就是金库」(one isometric world, one camera).
// Run: node src/build-story.mjs
// Objects: ../../../kit/objects.mjs + ../../kit-ext/objects-ext.mjs (import only) + ./props.mjs. Layout: ./layout.mjs.
import fs from "node:fs";
import { G, at, Wp, f, U, V, matStr, camAt, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, BADGE, CHECK, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import { vending, miniVend, pipe, firewall, flashDesk, runtimeExtJs } from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { loadTiming, wordAt, lineAt } from "../../../kit/timing.mjs";
import { exchange, booth, kycDesk, pit, raisedArm, groundFrame } from "./props.mjs";
import * as L from "./layout.mjs";

const T = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = T.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const SECTIONS = SCRIPT.sections;
const LN = T.lines.map((_, i) => lineAt(T, i));
const LS = LN.map((l) => l.start);
const w = (term, line, nth = 0) => wordAt(T, term, { line, nth }).start;
const W3 = (u, v, z = 0) => Wp(u, v, z);
const add = L.add;

// ---------------------------------------------------------------- seg1 world (start frame = seg1 last frame)
const { PLAZA, VEND, ROAD, GALLERY, BY, SAFE, BROWSER, DOC, SEAL, SIGNERS } = L.S1;
const TOPM = matStr([U[0], U[1], V[0], V[1], 0, 0]);
const OUTL = "#cfc7b8";
const outline = `<g id="outl"><g transform="${TOPM}">
  <rect x="${PLAZA.u0}" y="${PLAZA.v0}" width="${PLAZA.u1 - PLAZA.u0}" height="${PLAZA.v1 - PLAZA.v0}" rx="60" fill="none" stroke="${OUTL}" stroke-width="10" stroke-dasharray="60 40"/>
  <rect x="${ROAD.u0}" y="${ROAD.v - ROAD.half}" width="${ROAD.u1 - ROAD.u0}" height="${2 * ROAD.half}" fill="#f6f3ec" stroke="${OUTL}" stroke-width="8"/>
  <path d="M${ROAD.u0 + 40} ${ROAD.v}H${ROAD.u1 - 40}" stroke="${OUTL}" stroke-width="8" stroke-dasharray="70 60"/>
  <circle cx="${VEND.u}" cy="${VEND.v}" r="300" fill="#f6f3ec" stroke="${OUTL}" stroke-width="8" stroke-dasharray="40 26"/>
  <rect x="${VEND.u - 100}" y="${VEND.v - 75}" width="200" height="150" rx="10" fill="#ebe5da" stroke="${OUTL}" stroke-width="8"/>
  <rect x="${GALLERY.u0}" y="${GALLERY.v0}" width="${GALLERY.u1 - GALLERY.u0}" height="${GALLERY.v1 - GALLERY.v0}" rx="16" fill="#f6f3ec" stroke="${OUTL}" stroke-width="8"/>
  ${Array.from({ length: 11 }, (_, i) => { const u = GALLERY.u0 + 110 + i * ((GALLERY.u1 - GALLERY.u0 - 220) / 10); return `<circle cx="${f(u)}" cy="${(GALLERY.v0 + GALLERY.v1) / 2}" r="26" fill="none" stroke="${OUTL}" stroke-width="7"/>`; }).join("")}
  <rect x="${BY.u - 980}" y="${BY.v - 360}" width="1580" height="1020" rx="40" fill="none" stroke="${OUTL}" stroke-width="8" stroke-dasharray="40 26"/>
</g></g>`;
const FONT = `font-family="Noto Sans SC, sans-serif"`;
const byItems = [];
{
  const addB = (o, svg, dy = 0) => byItems.push({ y: at(o)[1] + dy, svg });
  const vault = O.safe(SAFE, { id: "vault", plate: "COLD", gold: false, core: "attacker", open: 105, state: "broken", ghost: 0.75 }); addB(SAFE, vault.svg);
  const page = `<rect x="12" y="54" width="356" height="234" rx="8" fill="#faf8f4"/>
  <text x="34" y="96" ${FONT} font-size="30" font-weight="900" fill="#1c1c1c">新交易</text>
  <text x="300" y="94" text-anchor="middle" ${FONT} font-size="15" font-weight="700" fill="#7d776b">待签名</text>
  <rect x="34" y="114" width="300" height="14" rx="7" fill="#ddd6c9"/><rect x="34" y="140" width="240" height="14" rx="7" fill="#ddd6c9"/><rect x="34" y="166" width="270" height="14" rx="7" fill="#ddd6c9"/>
  <rect x="34" y="208" width="312" height="62" rx="12" fill="#1f9d55"/>
  <text x="190" y="249" text-anchor="middle" ${FONT} font-size="28" font-weight="900" fill="#ffffff">确认签名</text>`;
  addB(BROWSER, O.browserWin(BROWSER, { id: "brw", page, state: "broken", ghost: 1, badge: false }).svg);
  addB(DOC, O.doc(DOC, { id: "tx", title: "交易" }).svg);
  addB(DOC, O.seal(SEAL, { id: "seal", paper: false, stamped: true }).svg.replaceAll("#d93a2f", "#1c1c1c"), 1);
  SIGNERS.forEach((p, i) => addB(p, O.person(p, { id: `sg${i}`, role: "signer" }).svg));
  const lensAt = [vault.anchors.core[0] + 10, vault.anchors.core[1] - 70];
  const MG = G(lensAt[0], lensAt[1] + (150 + 62 + 110) * 0.866);
  addB(MG, O.magnifier(MG, { id: "bmag", z: 150 }).svg);
  byItems.sort((a, b) => a.y - b.y);
}

// ---------------------------------------------------------------- objects
const items = [];
const A = {};
const put = (id, o, r, dy = 0, wrap = null) => { A[id] = r.anchors; items.push({ y: at(o)[1] + dy, svg: wrap ? wrap(r.svg) : r.svg }); return r; };
const mv = (id) => (svg) => `<g id="mv-${id}">${svg}</g>`;

// protagonist + chain
put("vm", L.VM, vending(L.VM, { id: "vm", maintDoor: "hidden" }), 0, (s) => `<g id="vmw">${s}</g>`);
put("chain", L.CHAIN, O.chain(L.CHAIN, { id: "chain", n: 3 }));
// people
for (const [id, q] of Object.entries(L.PPL)) put(id, q, O.person(q, { id, role: q.role, scale: 0.9 }), 0, mv(id));
put("atk", L.ATK, O.person(L.ATK, { id: "atk", role: "attacker", scale: 0.95 }), 0, mv("atk"));
put("clk", L.CLOCK, O.clock(L.CLOCK, { id: "clk" }));
put("key", L.KEY, O.key(L.KEY, { id: "key", stand: true }));
put("mag", L.MAG, O.magnifier(L.MAG, { id: "mag", z: 70 }), 400, (s) => `<g id="mv-mag" opacity="0">${s}</g>`);
put("booth", L.BOOTH, booth("booth", L.BOOTH));
// composability
put("tok", L.TOK, miniVend(L.TOK, { id: "tok", kind: "token" }));
put("dex", L.DEX, miniVend(L.DEX, { id: "dex", kind: "dex" }));
put("orc", L.ORC, miniVend(L.ORC, { id: "orc", kind: "oracle" }));
put("pp0", L.VM, pipe(L.VM, { id: "pp0", pts: [[100, 0, 64], [L.TOK.u - 55, 0, 64]], flow: true }), -1, (s) => `<g id="ppw0" opacity="0">${s}</g>`);
put("pp1", L.TOK, pipe(L.TOK, { id: "pp1", pts: [[55, 0, 64], [L.DEX.u - L.TOK.u - 55, 0, 64]], flow: true }), -1, (s) => `<g id="ppw1" opacity="0">${s}</g>`);
put("pp2", L.DEX, pipe(L.DEX, { id: "pp2", pts: [[55, 0, 64], [L.ORC.u - L.DEX.u - 55, 0, 64]], flow: true }), -1, (s) => `<g id="ppw2" opacity="0">${s}</g>`);
// comparison: Web2 column
const W2 = L.WEB2, CX = L.CEX;
put("rack", add(W2, { u: -90, v: -150 }), O.rack(add(W2, { u: -90, v: -150 }), { id: "rack" }));
put("db", add(W2, { u: 170, v: -60 }), O.dbLedger(add(W2, { u: 170, v: -60 }), { id: "db" }));
put("fw", add(W2, { u: 0, v: 250 }), firewall(add(W2, { u: 0, v: 250 }), { id: "fw", len: 300 }));
put("emp", add(W2, { u: 0, v: 470 }), O.person(add(W2, { u: 0, v: 470 }), { id: "emp", role: "engineer", scale: 0.8 }), 0, mv("emp"));
put("atk2", add(W2, { u: -230, v: 330 }), O.person(add(W2, { u: -230, v: 330 }), { id: "atk2", role: "attacker", scale: 0.8 }), 0, mv("atk2"));
// CEX column
put("ex", add(CX, { u: 0, v: -120 }), exchange("ex", add(CX, { u: 0, v: -120 })));
put("book", add(CX, { u: -230, v: 120 }), O.ledgerBook(add(CX, { u: -230, v: 120 }), { id: "book" }));
put("kyc", add(CX, { u: 0, v: 280 }), kycDesk("kyc", add(CX, { u: 0, v: 280 })));
put("cust", add(CX, { u: 0, v: 470 }), O.person(add(CX, { u: 0, v: 470 }), { id: "cust", role: "signer", scale: 0.8 }), 0, mv("cust"));
put("atk3", add(CX, { u: -260, v: 40 }), O.person(add(CX, { u: -260, v: 40 }), { id: "atk3", role: "attacker", scale: 0.8 }));
// VM column extras
put("fl", L.FLASH, flashDesk(L.FLASH, { id: "fl", gold: false, frame: true }));
put("caller", { u: 230, v: 420 }, miniVend({ u: 230, v: 420 }, { id: "caller", kind: "plain", scale: 0.55 }), 0, mv("caller"));
for (let i = 0; i < 3; i++) {
  const q = L.CROWD[i];
  const r = O.person(q, { id: "cr" + i, role: "signer", scale: 0.75 });
  put("cr" + i, q, r, 0, (s) => `<g id="crw${i}">${s}<g id="arm${i}" opacity="0">${raisedArm(q, 0.75, 1)}</g></g>`);
}
// basement under the exchange: pit + safe (= multisig contract)
const PIT = { o: add(CX, { u: 0, v: 0 }), u0: -180, u1: 180, v0: 110, v1: 410, d: 200 };
const pt = pit("pit", PIT.o, PIT.u0, PIT.u1, PIT.v0, PIT.v1, PIT.d);
const SF = add(CX, { u: 10, v: 185 }), SFK = 0.6, SFDZ = (PIT.d - 2) * Math.cos(Math.PI / 6);
const sf = O.safe(SF, { id: "sf", plate: "COLD" });
const [sfx, sfy] = at(SF);
const sfT = (p) => [sfx + (p[0] - sfx) * SFK, sfy + (p[1] - sfy) * SFK + SFDZ];
A.sf = { core: sfT(sf.anchors.core), top: sfT(sf.anchors.top), center: sfT(sf.anchors.center) };
items.push({ y: at(PIT.o, 0, PIT.v0)[1] + 0.5, svg: `<g id="pitg" opacity="0"><g clip-path="url(#pit-clip)">${pt.back}<g transform="translate(0,${f(SFDZ)}) translate(${f(sfx)},${f(sfy)}) scale(${SFK}) translate(${f(-sfx)},${f(-sfy)})">${sf.svg}</g></g>${pt.lip}</g>` });
items.sort((a, b) => a.y - b.y);

// ground layer: transaction frame (L12), deploy curve (L1)
let ground = groundFrame("txf", L.VM, -170, 330, -130, 420);
const cvDeploy = dashCurve("cv-dep", at(L.CHAIN, 0, 50, 100), at(L.VM, -40, 0, 20), { color: "#2aa3c9", c1: [at(L.CHAIN, 0, 50, 260)[0] + 40, at(L.CHAIN, 0, 50, 260)[1]], c2: [at(L.VM, -40, 0, 140)[0] - 120, at(L.VM, -40, 0, 140)[1]] });
const atkHead = at(L.ATK, 0, 0, 230);
const cvKey = dashCurve("cv-key", atkHead, at(L.KEY, 40, 0, 60), { c1: [atkHead[0] + 20, atkHead[1] - 120], c2: [at(L.KEY, 40, 0, 60)[0] - 60, at(L.KEY, 40, 0, 60)[1] - 140] });
const bybit = at(add(CX, { u: -330, v: -480 }), 0, 0, 0);
const cvBy = dashCurve("cv-by", A.sf.core, bybit, { color: "#2aa3c9", c1: [A.sf.core[0] - 260, A.sf.core[1] - 60], c2: [bybit[0] + 200, bybit[1] + 160] });

const defs = `<defs>${pt.clip}</defs>`;
const world = worldSvg("wsvg", defs + gridSvg({ u0: -3400, u1: 3600, v0: -3200, v1: 3000 }) + outline + `<g id="bybit">${byItems.map((x) => x.svg).join("")}</g>` + ground + cvDeploy.svg + items.map((x) => x.svg).join("\n") + cvKey.svg + cvBy.svg, [-3400, -2600, 6200, 4400]);

// ---------------------------------------------------------------- world labels
const off = (p, dx, dy) => [p[0] + dx, p[1] + dy];
let labels = "";
labels += wlab("lb-sc", A.vm.top, "智能合约", "lab-cs hide");
labels += wlab("lb-out", off(A.vm.trayOut, 50, -50), "可以转出资产", "hide", "l");
labels += wlab("lb-dep", off(at(L.CHAIN, 0, 0, 120), -60, 0), "区块链", "lab-g lab-sm hide", "b");
// L2 four traits
labels += wlab("t-pub", off(at(L.VM, -100, 0, 280), -30, 0), "公开", "hide", "r");
labels += wlab("t-irr", off(at(L.VM, 100, 75, 280), 30, 0), "不可撤回", "hide", "l");
labels += wlab("t-fund", off(at(L.VM, -100, 0, 120), -30, 0), "直接控制资金", "hide", "r");
labels += wlab("t-any", off(at(L.VM, 100, 75, 120), 30, 0), "任何人可调用", "hide", "l");
// L3 params
const btn = A.vm.buttons;
labels += wlab("pa0", off(btn[3], 22, 42), "f(1)", "lab-ink lab-sm hide", "l");
labels += wlab("pa1", off(btn[0], 22, -34), "f(99999)", "lab-ink lab-sm hide", "l");
labels += wlab("pa2", off(btn[2], 22, 4), "f(0)", "lab-ink lab-sm hide", "l");
labels += wlab("lb-args", at(L.PPL.pB, 60, 0, 250), "任意参数 · 任意顺序", "hide");
// L4 metaphor sign
labels += wlab("lb-meta", A.vm.top, "比喻：广场上的售货机", "lab-g hide");
// L5 balance
labels += wlab("lb-bal", off(A.vm.glass, 0, -150), "合约余额", "lab-cs hide");
// L6 schematic
labels += wlab("lb-byte", off(A.vm.schem, -40, -70), "字节码：一定公开", "hide", "r");
labels += wlab("lb-src", off(A.vm.schem, -40, 0), "源码：通常公开", "lab-g hide", "r");
// L7
labels += wlab("lb-24", at(L.CLOCK, 0, 0, 230), "全天候", "lab-cs hide");
labels += wlab("lb-world", at(L.PPL.pF, 0, 0, 260), "全世界的人", "lab-g hide");
// L8
labels += wpin("wr", off(A.vm.side, -110, -20), `<div class="wrench hide" id="wr-i">${WRENCH()}</div>`);
labels += wlab("lb-nomod", off(A.vm.side, -110, 70), "✕ 不可修改", "lab-g hide", "t");
// L9
labels += wlab("lb-proxy", off(A.vm.maintTop, -10, -10), "升级代理", "lab-cs hide", "b");
labels += wlab("lb-key", at(L.KEY, 0, 0, 170), "升级密钥", "hide", "b");
labels += wlab("lb-tgt", at(L.KEY, 40, 0, 0), "攻击目标", "lab-rs hide", "t");
// L10
labels += wlab("lb-cs", A.booth.top, "客服 · 无人", "lab-g hide");
labels += wlab("lb-irr", off(at(L.VM, -24, 75 + 230, 0), 20, 40), "交易不可逆", "lab-ink hide", "t");
// L11
labels += wlab("lb-one", at(L.PPL.pA, 0, 0, 250), "一次只服务一个人", "lab-g hide");
// L12
labels += wlab("lb-tx", at(L.VM, -170, 420, 0), "一笔交易", "lab-cs hide", "r");
// L13
labels += wlab("lb-comp", at(L.DEX, 0, -200, 330), "可组合性", "lab-cs hide");
labels += wpin("ring", at(L.TOK, -78, 0, 64), `<div class="ring hide" id="ring-i"></div>`);
labels += wlab("lb-bug", off(at(L.TOK, -78, 0, 64), 0, 70), "漏洞常出在这里", "lab-r hide", "t");
labels += wlab("lb-tokn", A.tok.top, "代币", "lab-sm hide"); labels += wlab("lb-dexn", A.dex.top, "DEX", "lab-sm hide"); labels += wlab("lb-orcn", A.orc.top, "预言机", "lab-sm hide");
// L15
labels += wpin("ok-fw", at(add(W2, { u: 0, v: 250 }), 0, 0, 260), CHECK("ok-fw-c", 64, "hide"));
labels += wpin("ok-kyc", at(add(CX, { u: 0, v: 280 }), 0, 0, 330), CHECK("ok-kyc-c", 64, "hide"));
// L16
labels += wlab("lb-api", off(A.vm.panel, 0, 230), "public 函数 = 对全世界开放的 API", "lab-ink hide", "t");
// L17
labels += wpin("rw-db", at(add(W2, { u: 170, v: -60 }), 0, 0, 260), `<div class="rowc hide" id="rw-db-i"><span class="rt">转账 100</span><span class="rs" id="rs-db"></span><span class="rr hide" id="rr-db">已改回</span></div>`, "b");
labels += wpin("rw-bk", at(add(CX, { u: -230, v: 120 }), 0, 0, 120), `<div class="rowc hide" id="rw-bk-i"><span class="rt">转账 100</span><span class="rs" id="rs-bk"></span><span class="rr hide" id="rr-bk">已改回</span></div>`, "b");
// L18
labels += wpin("st-irr", off(A.vm.trayOut, 260, 30), `<div class="gstamp hide" id="st-irr-i">不可逆</div>`);
labels += wlab("lb-up", off(A.vm.maintTop, 0, -10), "升级", "lab-cs hide", "b");
labels += wlab("lb-soc", at(L.CROWD[0], -90, 0, 60), "社会共识", "lab-cs hide", "r");
labels += wpin("bx-up", A.vm.maint, BADGE("bx-up-b", 64, "hide"));
labels += wlab("lb-nofix", off(A.vm.maint, 0, 50), "无升级权限 → 修不了", "lab-rs hide", "t");
// L19
labels += wlab("lb-fw", at(add(W2, { u: -230, v: 330 }), 0, 0, 240), "绕过防火墙", "lab-r hide");
labels += wlab("lb-in", at(add(CX, { u: -260, v: 40 }), 0, 0, 240), "攻破内部系统", "lab-r hide");
// L20
labels += wpin("gas", off(A.vm.coinSlot, 60, 30), `<div class="gas hide" id="gas-i"></div>`);
labels += wlab("lb-gas", off(A.vm.top, 0, -10), "一笔交易的 gas", "lab-r hide", "b");
labels += wlab("lb-fl", off(A.fl.center, -240, 10), "<span style=\"display:block;text-align:center;line-height:1.3\">闪电贷 · 上亿美元<br>同一笔交易内借还</span>", "lab-cs hide", "r");
// L21
labels += wlab("lb-fix", at(L.KEY, -20, 0, 200), "修复能力", "lab-gs hide", "r");
labels += wlab("lb-atks", at(L.KEY, 60, 0, 200), "攻击面", "lab-rs hide", "l");
labels += wlab("lb-exn", at(add(CX, { u: -140, v: -120 }), 0, 0, 230), "中心化交易所", "hide", "r");
// L22
labels += wlab("lb-cold", off(A.sf.top, 0, -10), "冷钱包 = 多签合约", "lab-cs hide", "b");
labels += wlab("lb-core", off(A.sf.core, 70, 0), "实现合约", "lab-sm hide", "l");
labels += wlab("lb-by", bybit, "如：开头的 Safe（Bybit）", "hide", "t");

function WRENCH() {
  return `<svg width="120" height="120" viewBox="0 0 120 120"><g transform="rotate(-35 60 60)"><rect x="52" y="34" width="16" height="74" rx="7" fill="#9aa0a7" stroke="#4b4f56" stroke-width="3"/>
  <path d="M60 6a22 22 0 0 0-14 39h28a22 22 0 0 0-14-39zm-8 6v16h16V12" fill="#b9bdc3" stroke="#4b4f56" stroke-width="3" stroke-linejoin="round"/></g></svg>`;
}

// ---------------------------------------------------------------- cameras
const C = (u, v, z, k, sx = 960, sy = 560) => camAt(Wp(u, v, z), sx, sy, k);
const CAMS = {
  start: C(0, 80, 60, 0.5, 960, 540),
  open: C(-40, -80, 150, 1.3, 960, 600),
  glass: C(-10, 75, 200, 1.75, 1000, 560),
  side: C(-100, 0, 170, 1.55, 1060, 560),
  crowd: C(60, 120, 120, 0.95, 960, 560),
  door: C(-160, 0, 150, 1.25, 900, 500),
  out: C(60, 230, 110, 0.85, 900, 560),
  one: C(120, 160, 130, 1.05, 960, 560),
  comp: C(400, 40, 120, 0.92, 960, 600),
  cmp: C(-600, -420, 60, 0.66, 960, 700),
  door2: C(-180, 40, 140, 1.35, 960, 600),
  cex: C(-600, -190, 0, 1.12, 1000, 580),
};
const S = (cam, p) => toScreen(CAMS[cam], p);

// ---------------------------------------------------------------- screen overlays
const colX = [S("cmp", at(W2, 0, 60, 0))[0], S("cmp", at(CX, 0, 60, 0))[0], S("cmp", at(L.VM, 60, 60, 0))[0]].map((x) => Math.round(x));
const TB = { y: 104, rh: 64, colW: 400, labX: 36 };
const chips = [
  [["先鉴权", "ok"], ["先过 KYC", "ok"], ["任何地址 · 任何合约", "tl"]],
  [["可改数据库", "ok"], ["可改内部账本", "ok"], ["不可逆", "ink"]],
  [["绕过防火墙", "gr"], ["攻破内部系统", "gr"], ["一笔 gas", "rd"]],
];
const rowNames = ["谁能调用", "能否回滚", "攻击成本"];
let table = `<div id="tbl">`;
["Web2 后端", "中心化交易所", "智能合约"].forEach((h, c) => { table += `<div class="th hide" id="th${c}" style="left:${colX[c] - TB.colW / 2}px;top:${TB.y}px;width:${TB.colW}px">${h}</div>`; });
rowNames.forEach((r, i) => {
  const y = TB.y + 74 + i * TB.rh;
  table += `<div class="tr hide" id="tr${i}" style="top:${y}px"><span>${["第一", "第二", "第三"][i]} · ${r}</span></div>`;
  chips[i].forEach(([txt, cls], c) => { table += `<div class="tc hide ${cls}" id="tc${i}${c}" style="left:${colX[c] - TB.colW / 2}px;top:${y}px;width:${TB.colW}px"><span>${cls === "ok" ? "✓ " : ""}${txt}</span></div>`; });
});
table += `</div>`;
// nested-call card (L12)
const nest = `<div class="nest hide" id="nest"><div class="nh">一笔交易之内</div>
  <div class="nseq"><span class="call hide" id="c0">f()</span><span class="call hide" id="c1">f()</span><span class="call hide" id="c2">f()</span><span class="nt hide" id="nt0">反复调用</span></div></div>
  <div class="nest hide" id="nest2" style="top:300px">
  <div class="nb" id="nb0"><span>f() {</span><div class="nb in hide" id="nb1"><span>f() {</span><div class="nb in hide" id="nb2"><span>f()</span></div><span>}</span></div><span>}</span></div>
  <div class="nrow"><span class="nt hide" id="nt1">嵌套调用</span></div></div>`;

// ---------------------------------------------------------------- times
const TM = {
  dep: w("部署", 1), auto: w("自动执行", 1), hold: w("持有资产", 1), outA: w("转出资产", 1),
  pub: w("公开的", 2), irr: w("不可撤回", 2), fund: w("直接控制资金", 2), anyone: w("任何人", 3), args: w("任意参数", 3), order: w("任意顺序", 3),
  meta: w("打个比方", 4), vend: w("自动售货机", 4),
  gold: w("真金白银", 5), bal: w("合约余额", 5),
  circ: w("电路图", 6), byte: w("字节码", 6), src: w("源码", 6),
  world7: LS[7], allday: w("全天候", 7), coin: w("投币", 7), press: w("按按钮", 7), hit: w("拍打", 7),
  nofix: w("不能打开维修", 8),
  door: w("维修门", 9), proxy: w("升级代理", 9), key: w("钥匙", 9), tgt: w("攻击目标", 9),
  wrong: w("吐错了钱", 10), cs: w("客服", 10), irr10: w("不可逆", 10),
  fail: w("不成立", 11), one: w("一次只服务", 11),
  tx: w("一笔交易", 12), rep: w("反复调用", 12), nest: w("嵌套调用", 12),
  dozens: w("几十台", 13), join: w("拼在一起", 13), comp: w("可组合性", 13), bug: w("漏洞", 13),
  web2: w("Web2", 14), cex: w("中心化交易所", 14), three: w("三个", 14),
  who: w("谁能调用", 15), auth: w("鉴权", 15), kyc: w("KYC", 15),
  anyAddr: w("任何地址", 16), anyC: w("任何合约", 16), pubf: w("public", 16), api: w("API", 16),
  rb: w("回滚", 17), dbw: w("数据库", 17), book: w("内部账本", 17),
  irr18: w("不可逆", 18), up: w("升级", 18), soc: w("社会共识", 18), cant: w("修不了", 18),
  cost: w("攻击成本", 19), fw: w("防火墙", 19), inner: w("内部系统", 19),
  gas: w("gas", 20), flash: w("闪电贷", 20), yi: w("上亿美元", 20),
  fix: w("修复能力", 21), atks: w("攻击面", 21), stolen: w("可能被盗", 21),
  exch: w("交易所", 22), cold: w("冷钱包", 22), multi: w("多签合约", 22), safe: w("Safe", 22),
};
const tm = Object.fromEntries(Object.entries(TM).map(([k, v]) => [k, f(v)]));
const LSf = LS.map(f);
// person walk targets (deltas in world-canvas px)
const dW = (a, b) => { const p = W3(b.u - a.u, b.v - a.v, 0); return [f(p[0]), f(p[1])]; };
const MV = {
  emp: dW({ u: 0, v: 470 }, { u: 0, v: 40 }),
  cust: dW({ u: 0, v: 470 }, { u: 0, v: 380 }),
  caller: dW({ u: 230, v: 420 }, { u: 120, v: 190 }),
  atkKey: dW(L.ATK, { u: L.KEY.u - 80, v: L.KEY.v + 200 }),
  atkSlot: dW(L.ATK, { u: 150, v: 230 }),
  pA1: dW(L.PPL.pA, { u: 140, v: 190 }),
  mag: (() => { const p = W3(0, 120, 0); return [f(p[0]), f(p[1])]; })(),
};

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 84px; }
    .kw { position: absolute; left: 56px; top: 34px; font-size: 36px; font-weight: 900; color: #1c1c1c; background: #fffdf8; border-radius: 16px; padding: 10px 26px 14px;
      box-shadow: 0 10px 24px rgba(70,60,40,0.12); white-space: nowrap; }
    .kw.gr { color: #6d685e; border: 4px solid #cfc7b8; }
    .stamp { position: absolute; font-size: 44px; font-weight: 900; color: #6d685e; border: 6px solid #8a8478; border-radius: 12px; padding: 6px 26px 10px; transform: rotate(-6deg); background: rgba(255,253,248,0.92); white-space: nowrap; }
    .wrench { width: 120px; height: 120px; }
    .qpin { position: absolute; left: 48px; top: 836px; display: inline-flex; align-items: center; gap: 12px; background: #ffffff; border-radius: 18px; padding: 8px 22px 10px 10px;
      font-size: 30px; font-weight: 900; white-space: nowrap; box-shadow: 0 12px 28px rgba(70,60,40,0.16); }
    .qpin .qc-q { width: 44px; height: 44px; border-radius: 50%; background: #1c1c1c; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 30px; flex: none; }
    .ring { width: 120px; height: 120px; margin: -60px 0 0 -60px; border: 6px dashed #e0453a; border-radius: 50%; }
    .gas { width: 26px; height: 26px; border-radius: 50%; background: #d6a64a; border: 3px solid #7a5716; }
    .gstamp { font-size: 34px; font-weight: 900; color: #6d685e; border: 5px solid #8a8478; border-radius: 10px; padding: 2px 18px 6px; transform: rotate(-8deg); background: rgba(255,253,248,0.9); white-space: nowrap; }
    .rowc { position: relative; display: flex; align-items: center; gap: 14px; background: #fffdf8; border-radius: 12px; box-shadow: 0 8px 18px rgba(70,60,40,0.14); padding: 6px 18px 8px; white-space: nowrap; }
    .rowc .rt { font-family: "JetBrains Mono", "Noto Sans SC", monospace; font-size: 30px; font-weight: 800; }
    .rowc .rs { position: absolute; left: 14px; top: 50%; width: 150px; height: 5px; background: #1c1c1c; transform-origin: 0 50%; transform: scaleX(0); }
    .rowc .rr { font-size: 30px; font-weight: 900; color: #1f9d55; }
    #tbl .th, #tbl .tc, #tbl .tr { position: absolute; height: 58px; display: flex; align-items: center; justify-content: center; white-space: nowrap; }
    #tbl .th { font-size: 34px; font-weight: 900; background: #1c1c1c; color: #fff; border-radius: 12px; }
    #tbl .tr { left: 0; width: 1920px; justify-content: flex-start; padding-left: ${TB.labX}px; }
    #tbl .tr span { font-size: 30px; font-weight: 900; color: #1c1c1c; background: #fffdf8; border-radius: 10px; padding: 4px 14px 6px; box-shadow: 0 6px 14px rgba(70,60,40,0.10); }
    #tbl .tc span { font-size: 30px; font-weight: 900; border-radius: 10px; padding: 4px 18px 6px; }
    #tbl .tc.ok span { background: #1f9d55; color: #fff; }
    #tbl .tc.tl span { background: #1d93ba; color: #fff; }
    #tbl .tc.ink span { background: #1c1c1c; color: #fff; }
    #tbl .tc.gr span { background: #fffdf8; color: #1c1c1c; border: 3px solid #cfc7b8; }
    #tbl .tc.rd span { background: #fffdf8; color: #c3352b; border: 3px solid #e0453a; }
    .nest { position: absolute; left: 56px; top: 120px; width: 540px; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); padding: 20px 24px 22px; }
    .nest .nh { font-size: 32px; font-weight: 900; height: 52px; border-bottom: 3px solid #1d93ba; margin-bottom: 14px; color: #1d93ba; }
    .nest .nb { border: 4px solid #2aa3c9; border-radius: 12px; padding: 8px 14px 12px; background: rgba(42,163,201,0.06); }
    .nest .nseq { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .nest .call { font-family: "JetBrains Mono", monospace; font-size: 30px; font-weight: 800; border: 4px solid #2aa3c9; border-radius: 10px; padding: 0 10px 2px; }
    .nest .nseq .nt { margin-left: auto; }
    .nest .nb span { font-family: "JetBrains Mono", monospace; font-size: 30px; font-weight: 800; }
    .nest .nb.in { margin-top: 8px; }
    .nest .nrow { display: flex; gap: 14px; margin-top: 14px; }
    .nest .nt { white-space: nowrap; font-size: 30px; font-weight: 900; color: #fff; background: #1d93ba; border-radius: 10px; padding: 2px 14px 5px; }
    .tcard { position: absolute; left: 48px; top: 120px; max-width: 560px; background: #ffffff; border-left: 6px solid #2aa3c9; border-radius: 12px;
      padding: 14px 26px 18px 22px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); }
    .tcard .t1 { font-size: 32px; font-weight: 900; white-space: nowrap; }
    .tcard .t2 { margin-top: 6px; font-size: 29px; font-weight: 700; color: #3d3a35; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      <div class="qpin" id="qpin"><span class="qc-q">?</span><span>有漏洞吗？</span></div>
      <div class="kw gr hide" id="kw-meta">比喻 · 广场上的售货机</div>
      <div class="stamp hide" id="stamp-i" style="left:600px;top:150px">比喻在这里不成立</div>
      ${nest}${table}
      <div class="tcard hide" id="term1" style="top:390px"><div class="t1">KYC</div><div class="t2">核验用户真实身份：姓名、证件、住址</div></div>
      <div class="tcard hide" id="term2" style="top:390px"><div class="t1">gas</div><div class="t2">在链上执行交易要付的手续费</div></div>
      ${pills(2, { sections: SECTIONS })}
      <div class="k-title" id="ttl-card"><div class="t-main">② 代码就是金库</div><div class="t-sub">公开 · 不可撤回 · 直接控制资金</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${runtimeExtJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const MV = ${JSON.stringify(MV)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.3, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.25, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d);
      const hideGrow = (ids) => ids.forEach((id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); });
      const walk = (id, t, d, dur, ease) => tl.to("#mv-" + id, { x: +d[0], y: +d[1], duration: dur || 1.0, ease: ease || "power1.inOut" }, t);
      const grow = (id, t, d) => KIT.grow(tl, id, t, d);
      hideGrow(["vm", "chain", "pA", "pB", "pC", "pD", "pE", "pF", "atk", "clk", "key", "booth", "tok", "dex", "orc", "rack", "db", "fw", "emp", "atk2", "ex", "book", "kyc", "cust", "atk3", "fl", "caller", "cr0", "cr1", "cr2"]);

      KIT.camSet(tl, CAMS.start);
      KIT.cam(tl, 1.55, CAMS.open, 1.9);
      out("#qpin", 1.5, 0.3);
      out("#bybit", ${f(LS[1])}, 0.3);
      // ===== 0–1.6 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.25);
      // ===== L1 chain → vending machine grows from it; holds and pays out assets
      grow("chain", ${f(LS[1] - 0.6)}, 0.5); pop("#lb-dep", ${f(LS[1] - 0.2)});
      KIT.draw(tl, "cv-dep", ${tm.dep}, 0.6);
      grow("vm", ${f(TM.dep + 0.5)}, 0.6);
      pop("#lb-sc", ${f(TM.auto)});
      KITX.gears(tl, "vm", ${tm.auto}, 1.6, 1.5);
      KITX.press(tl, "vm", 1, ${f(TM.outA - 0.3)});
      KITX.dispense(tl, "vm", ${tm.outA}, { n: 1, dist: 1.4 });
      pop("#lb-out", ${f(TM.outA + 0.3)});
      // ===== L2 four traits
      out("#lb-out, #lb-dep, #cv-dep", ${f(LS[2] - 0.1)}); out("#chain", ${f(LS[2])}, 0.4);
      pop("#t-pub", ${tm.pub}); pop("#t-irr", ${tm.irr}); pop("#t-fund", ${tm.fund}); pop("#t-any", ${f(LS[3])});
      // ===== L3 anyone, any args, any order
      out("#t-pub, #t-irr, #t-fund, #t-any, #lb-sc", ${f(TM.anyone + 0.6)});
      KIT.cam(tl, ${f(LS[3] - 0.2)}, CAMS.one, 1.0);
      grow("pA", ${tm.anyone}); grow("pB", ${f(TM.anyone + 0.15)}); grow("pC", ${f(TM.anyone + 0.3)});
      KITX.press(tl, "vm", 3, ${tm.args}); pop("#pa0", ${tm.args});
      KITX.press(tl, "vm", 0, ${f(TM.args + 0.5)}); pop("#pa1", ${f(TM.args + 0.5)});
      KITX.press(tl, "vm", 2, ${f(TM.order + 0.1)}); pop("#pa2", ${f(TM.order + 0.1)});
      pop("#lb-args", ${tm.order});
      // ===== L4 metaphor
      out("#pa0, #pa1, #pa2, #lb-args", ${f(LS[4] - 0.1)});
      out("#mv-pA, #mv-pB, #mv-pC", ${f(LS[4] - 0.1)}, 0.3);
      KIT.cam(tl, ${f(LS[4] - 0.1)}, CAMS.open, 1.0);
      pop("#kw-meta", ${tm.meta}, 0.3);
      KITX.gears(tl, "vm", ${f(TM.meta + 0.8)}, 2.6, 2);
      pop("#lb-meta", ${tm.vend});
      // ===== L5 real money = contract balance
      out("#lb-meta", ${f(LS[5] - 0.2)});
      KIT.cam(tl, ${f(LS[5] - 0.2)}, CAMS.glass, 1.0);
      pop("#lb-bal", ${tm.bal});
      // ===== L6 the circuit diagram on the side
      out("#lb-bal", ${f(LS[6] - 0.1)});
      KIT.cam(tl, ${f(LS[6] - 0.1)}, CAMS.side, 1.0);
      fadeIn("#mv-mag", ${f(TM.circ + 0.4)}, 0.3);
      walk("mag", ${f(TM.circ + 0.5)}, MV.mag, 2.2, "sine.inOut");
      pop("#lb-byte", ${tm.byte}); pop("#lb-src", ${tm.src});
      // ===== L7 the whole world, day and night
      out("#mv-mag, #lb-byte, #lb-src", ${f(LS[7] - 0.1)});
      KIT.cam(tl, ${f(LS[7] - 0.15)}, CAMS.crowd, 1.0);
      tl.set("#mv-pA, #mv-pB, #mv-pC", { opacity: 1 }, ${f(LS[7])});
      tl.set("#pA, #pB, #pC", { scaleY: 0 }, ${f(LS[7])});
      ["pA", "pD", "pB", "pE", "pC", "pF"].forEach((id, i) => grow(id, ${f(LS[7] + 0.1)} + i * 0.16, 0.4));
      grow("atk", ${f(LS[7] + 1.1)}, 0.4);
      pop("#lb-world", ${f(LS[7] + 0.5)});
      grow("clk", ${f(TM.allday - 0.3)}); pop("#lb-24", ${tm.allday}); KIT.clock(tl, "clk", ${tm.allday}, 1.4, 720);
      KITX.press(tl, "vm", 1, ${tm.press}); KITX.press(tl, "vm", 4, ${f(TM.press + 0.25)});
      tl.to("#vmw", { keyframes: { x: [0, -6, 6, -4, 3, 0] }, duration: 0.5, ease: "none" }, ${tm.hit});
      // ===== L8 sealed: cannot be opened for repair
      out("#lb-world, #lb-24", ${f(LS[8] - 0.1)}); out("#clk", ${f(LS[8] + 0.2)}, 0.35);
      KIT.cam(tl, ${f(LS[8] - 0.2)}, CAMS.door, 0.9);
      tl.to("#vm-rivets", { opacity: 1, duration: 0.4 }, ${f(LS[8] + 0.2)});
      tl.fromTo("#wr-i", { opacity: 0, x: -120, rotation: 0 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", immediateRender: false }, ${f(TM.nofix - 0.5)});
      tl.to("#wr-i", { x: -70, rotation: -25, duration: 0.3, ease: "back.out(2)" }, ${f(TM.nofix)});
      pop("#lb-nomod", ${f(TM.nofix + 0.15)});
      // ===== L9 a maintenance door = upgrade proxy; the key becomes the target
      out("#wr-i, #lb-nomod", ${f(LS[9] - 0.1)});
      pop("#vm-maint", ${tm.door}, 0.4);
      pop("#lb-proxy", ${tm.proxy});
      grow("key", ${f(TM.key - 0.2)}); pop("#lb-key", ${tm.key});
      KIT.draw(tl, "cv-key", ${f(TM.tgt - 0.4)}, 0.6); pop("#lb-tgt", ${tm.tgt});
      // ===== L10 pays out wrongly: no customer service; irreversible
      out("#cv-key, #lb-tgt, #lb-key, #lb-proxy", ${f(LS[10] - 0.1)});
      tl.to("#vm-rivets", { opacity: 0, duration: 0.3 }, ${f(LS[10] - 0.1)});
      KIT.cam(tl, ${f(LS[10] - 0.15)}, CAMS.out, 1.0);
      KITX.dispense(tl, "vm", ${tm.wrong}, { n: 5, start: 1, dist: 3.4, dur: 0.9 });
      grow("booth", ${f(TM.cs - 0.4)}); pop("#lb-cs", ${tm.cs});
      pop("#lb-irr", ${tm.irr10});
      // ===== L11 where the metaphor breaks: one customer at a time
      out("#lb-cs, #lb-irr, #kw-meta", ${f(LS[11] - 0.1)});
      out("#mv-pB, #mv-pC, #mv-pD, #mv-pE, #mv-pF, #mv-atk, #booth", ${f(LS[11] - 0.1)}, 0.35);
      KIT.cam(tl, ${f(LS[11] - 0.15)}, CAMS.one, 1.0);
      pop("#stamp-i", ${tm.fail}, 0.3);
      pop("#lb-one", ${tm.one});
      // ===== L12 inside one transaction: repeated and nested calls
      out("#stamp-i, #lb-one", ${f(LS[12] - 0.1)});
      fadeIn("#txf", ${tm.tx}, 0.4); pop("#lb-tx", ${f(TM.tx + 0.2)});
      pop("#nest", ${f(TM.tx + 0.1)}, 0.3);
      [0, 1, 2].forEach((i) => { KITX.press(tl, "vm", 2, ${f(TM.rep - 0.9)} + i * 0.4, "blue", 0.2); pop("#c" + i, ${f(TM.rep - 0.9)} + i * 0.4, 0.2); });
      pop("#nt0", ${tm.rep});
      pop("#nest2", ${f(TM.nest - 0.5)}, 0.3); pop("#nb1", ${f(TM.nest)}); pop("#nb2", ${f(TM.nest + 0.3)}); pop("#nt1", ${f(TM.nest + 0.3)});
      KITX.press(tl, "vm", 2, ${f(TM.nest)}, "blue", 0.6);
      // ===== L13 composability
      out("#txf, #lb-tx", ${f(LS[13] - 0.1)}); out("#nest, #nest2", ${f(LS[13] + 1.4)});
      out("#mv-pA", ${f(LS[13] - 0.1)}, 0.3);
      KIT.cam(tl, ${f(LS[13] - 0.15)}, CAMS.comp, 1.1);
      grow("tok", ${tm.dozens}); grow("dex", ${f(TM.dozens + 0.2)}); grow("orc", ${f(TM.dozens + 0.4)});
      pop("#lb-tokn", ${f(TM.dozens + 0.4)}); pop("#lb-dexn", ${f(TM.dozens + 0.6)}); pop("#lb-orcn", ${f(TM.dozens + 0.8)});
      fadeIn("#ppw0", ${tm.join}, 0.3); fadeIn("#ppw1", ${f(TM.join + 0.2)}, 0.3); fadeIn("#ppw2", ${f(TM.join + 0.4)}, 0.3);
      KITX.dash(tl, ["pp0-flow", "pp1-flow", "pp2-flow"], ${tm.join}, ${f(LS[14] - TM.join)}, 400);
      pop("#lb-comp", ${tm.comp});
      pop("#ring-i", ${tm.bug}, 0.3); pop("#lb-bug", ${f(TM.bug + 0.2)});
      // ===== L14 compare with Web2 back end and an exchange
      out("#lb-comp, #ring-i, #lb-bug, #lb-tokn, #lb-dexn, #lb-orcn", ${f(LS[14] - 0.1)});
      out("#tok, #dex, #orc, #ppw0, #ppw1, #ppw2", ${f(LS[14])}, 0.4);
      KIT.cam(tl, ${f(LS[14] - 0.1)}, CAMS.cmp, 1.4);
      out("#vm-coin-0, #vm-coin-1, #vm-coin-2, #vm-coin-3, #vm-coin-4, #vm-coin-5", ${f(LS[14])}, 0.3);
      grow("rack", ${f(TM.web2 - 0.2)}); grow("db", ${tm.web2}); grow("fw", ${f(TM.web2 + 0.2)});
      grow("ex", ${f(TM.cex - 0.1)}); grow("book", ${f(TM.cex + 0.2)}); grow("kyc", ${f(TM.cex + 0.4)});
      pop("#th0", ${tm.web2}); pop("#th1", ${tm.cex}); pop("#th2", ${f(TM.cex + 0.9)});
      [0, 1, 2].forEach((i) => pop("#tr" + i, ${tm.three} + i * 0.12));
      tl.to("#tr1, #tr2", { opacity: 0.35, duration: 0.2 }, ${f(TM.three + 0.6)});
      // ===== L15 who can call: Web2 authenticates, exchange checks KYC
      grow("emp", ${f(LS[15])}); walk("emp", ${f(TM.auth - 0.6)}, MV.emp, 1.6);
      KITX.gate(tl, "fw", ${f(TM.auth - 0.2)}, true); KIT.led(tl, "fw-led", ${f(TM.auth - 0.2)}, "green"); pop("#ok-fw-c", ${tm.auth}, 0.3);
      pop("#tc00", ${tm.auth});
      grow("cust", ${f(TM.auth + 0.6)}); walk("cust", ${f(TM.auth + 0.8)}, MV.cust, 0.8);
      pop("#ok-kyc-c", ${tm.kyc}, 0.3); pop("#tc01", ${tm.kyc});
      // ===== L16 anyone at all may call the contract
      out("#ok-fw-c, #ok-kyc-c", ${f(LS[16])});
      KITX.gate(tl, "fw", ${f(LS[16])}, false);
      tl.set("#mv-atk, #mv-pA, #mv-pB", { opacity: 1 }, ${f(LS[16])});
      tl.set("#pA, #pB, #atk", { scaleY: 0 }, ${f(LS[16])});
      grow("pA", ${tm.anyAddr}, 0.4); grow("pB", ${f(TM.anyAddr + 0.2)}, 0.4);
      grow("caller", ${tm.anyC}, 0.4); walk("caller", ${f(TM.anyC + 0.3)}, MV.caller, 0.9);
      pop("#tc02", ${tm.anyAddr});
      pop("#lb-api", ${tm.pubf});
      // ===== L17 can mistakes be rolled back: Web2 and exchanges, yes
      out("#lb-api", ${f(LS[17] - 0.1)});
      tl.to("#tr0", { opacity: 0.35, duration: 0.2 }, ${f(LS[17])}); tl.to("#tr1", { opacity: 1, duration: 0.2 }, ${f(LS[17])});
      pop("#rw-db-i", ${tm.dbw}, 0.3); tl.to("#rs-db", { scaleX: 1, duration: 0.4 }, ${f(TM.dbw + 0.4)}); pop("#rr-db", ${f(TM.dbw + 0.8)}); pop("#tc10", ${f(TM.dbw + 0.8)});
      pop("#rw-bk-i", ${tm.book}, 0.3); tl.to("#rs-bk", { scaleX: 1, duration: 0.4 }, ${f(TM.book + 0.3)}); pop("#rr-bk", ${f(TM.book + 0.6)}); pop("#tc11", ${f(TM.book + 0.6)});
      // ===== L18 the contract: irreversible; only upgrade or social consensus; no upgrade key → no fix
      pop("#tc12", ${tm.irr18});
      out("#mv-pA, #mv-pB, #mv-caller", ${f(LS[18])}, 0.3);
      KITX.dispense(tl, "vm", ${f(TM.irr18 - 0.4)}, { n: 1, start: 6, dist: 2.2 });
      pop("#st-irr-i", ${tm.irr18}, 0.3);
      pop("#lb-up", ${tm.up});
      ["cr0", "cr1", "cr2"].forEach((id, i) => grow(id, ${f(TM.up + 0.4)} + i * 0.12, 0.4));
      tl.to("#arm0, #arm1, #arm2", { opacity: 1, duration: 0.2 }, ${f(TM.soc - 0.1)});
      pop("#lb-soc", ${tm.soc});
      pop("#bx-up-b", ${f(TM.cant - 0.4)}, 0.3); pop("#lb-nofix", ${f(TM.cant - 0.2)});
      // ===== L19 attack cost elsewhere: get past a firewall or break into internal systems
      out("#st-irr-i, #lb-up, #lb-soc, #bx-up-b, #lb-nofix, #rw-db-i, #rw-bk-i", ${f(LS[19] - 0.1)});
      out("#crw0, #crw1, #crw2", ${f(LS[19] - 0.1)}, 0.3);
      tl.to("#tr1", { opacity: 0.35, duration: 0.2 }, ${f(LS[19])}); tl.to("#tr2", { opacity: 1, duration: 0.2 }, ${f(LS[19])});
      grow("atk2", ${f(TM.fw - 0.5)}); pop("#lb-fw", ${tm.fw}); pop("#tc20", ${tm.fw});
      grow("atk3", ${f(TM.inner - 0.4)}); pop("#lb-in", ${tm.inner}); pop("#tc21", ${tm.inner});
      // ===== L20 here: one transaction's gas; flash loans lend 100M+ inside the same transaction
      out("#lb-fw, #lb-in", ${f(LS[20])});
      tl.set("#mv-atk", { x: +MV.atkSlot[0], y: +MV.atkSlot[1] }, ${f(LS[20])});
      grow("atk", ${f(LS[20] + 0.1)}, 0.4);
      pop("#gas-i", ${f(TM.gas - 0.3)}, 0.2);
      tl.fromTo("#gas-pin", { x: 0, y: 0 }, { x: -60, y: -30, duration: 0.5, ease: "power2.in", immediateRender: false }, ${f(TM.gas)});
      out("#gas-i", ${f(TM.gas + 0.45)}, 0.1);
      pop("#lb-gas", ${tm.gas}); pop("#tc22", ${tm.gas});
      const term = (id, t0, t1) => { KIT.pop(tl, "#" + id, t0, 0.3); out("#" + id, t1, 0.25); };
      term("term1", ${tm.kyc}, ${f(Math.min(TM.kyc + 3.6, LS[16] + 3.0))});
      term("term2", ${tm.gas}, ${f(TM.gas + 3.6)});
      grow("fl", ${f(TM.flash - 0.3)});
      KITX.flash(tl, "fl", ${f(TM.flash + 0.3)}, 2.4);
      pop("#lb-fl", ${f(TM.yi - 0.3)});
      // ===== L21 upgradeable = fix capability AND attack surface (key frame)
      out("#lb-gas, #lb-fl, #fl, #kyc, #mv-cust, #book", ${f(LS[21] - 0.1)});
      out("#tbl", ${f(LS[21] - 0.1)}, 0.3);
      KIT.cam(tl, ${f(LS[21] - 0.2)}, CAMS.door2, 1.1);
      tl.to("#mv-atk", { x: +MV.atkKey[0], y: +MV.atkKey[1], duration: 1.2, ease: "power1.inOut" }, ${f(LS[21] - 0.2)});
      pop("#lb-fix", ${tm.fix}); pop("#lb-atks", ${tm.atks});
      // ===== L22 exchanges can't escape either: the cold wallet may be a multisig contract
      out("#lb-fix, #lb-atks", ${f(LS[22] - 0.05)});
      KIT.cam(tl, ${f(LS[22] - 0.1)}, CAMS.cex, 1.2);
      out("#atk3, #mv-atk2, #mv-emp", ${f(LS[22])}, 0.3);
      pop("#lb-exn", ${f(TM.exch + 0.2)});
      fadeIn("#pitg", ${f(TM.cold - 0.5)}, 0.4);
      pop("#lb-cold", ${f(TM.cold + 0.2)});
      KIT.door(tl, "sf", ${f(TM.cold + 0.4)}, 105, 1.0);
      pop("#lb-core", ${f(TM.multi + 0.2)});
      KIT.draw(tl, "cv-by", ${f(TM.safe - 0.9)}, 0.7); pop("#lb-by", ${f(TM.safe - 0.3)});
      tl.set({}, {}, ${f(TOTAL)});
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes");
