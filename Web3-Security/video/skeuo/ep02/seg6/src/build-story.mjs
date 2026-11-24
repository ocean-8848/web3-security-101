// seg6「⑥ 怎么守」— 生成 compositions/story.html
// 运行：node src/build-story.mjs
// 一个连续的等距世界 + 一台镜头：
//   中间：私钥生产线（熵源 → 助记词 → 种子 → 派生树 → 私钥 → 地址），支线签名台，尽头链上签名；四块告示牌 = 四层防御
//   前方：三个角色（钱包开发者 / 审计和安全团队 / 普通用户），各自的小场景
//   后方：seg1 的钩子场景（32 位小转盘经传动轴带动 256 位大转盘 + 金库）
//   最后：三块告示牌翻成三个条件 → 结束卡（最后 2.5 s 完全静止）
import fs from "node:fs";
import { G, at, f, Wp, camAt, toScreen, worldSvg, gridSvg, wlab, wpin, kitCss, runtimeJs, CHECK, BADGE, box, cyl, faceV, M } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import * as HL from "../../seg1/src/layout.mjs";
import { edges, contactShadow } from "../../../kit/iso.mjs";
import { loadTiming, wordAt as WA, lineAt } from "../../../kit/timing.mjs";
import { termCss, termHtml, termJs } from "../../kit-ext/termcard.mjs";

const TM = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = TM.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const w = (s, o) => WA(TM, s, o).start;
const L = (i) => lineAt(TM, i);

// ------------------------------------------------------------------ helpers
const items = [], ground = [], overlay = [], A = {};
const B0 = G(700, 1300);
const S = (d, dv = 0) => ({ u: B0.u + d, v: B0.v + dv });
const uv = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });
const P = (p) => `${f(p[0])},${f(p[1])}`;
const push = (o, svg, extraY = 0) => items.push({ Y: at(o)[1] + extraY, svg });
const add = (fn, o, opts, extraY = 0, wrap = null) => {
  const r = fn(o, opts);
  push(o, wrap ? `<g id="${wrap}">${r.svg}</g>` : r.svg, extraY);
  A[opts.id] = r.anchors; return r;
};
const gstrip = (a, b, wd, fill, stroke = "none") => {
  const du = b.u - a.u, dv = b.v - a.v, l = Math.hypot(du, dv), nu = (-dv / l) * wd / 2, nv = (du / l) * wd / 2;
  const q = [Wp(a.u + nu, a.v + nv), Wp(b.u + nu, b.v + nv), Wp(b.u - nu, b.v - nv), Wp(a.u - nu, a.v - nv)];
  return `<polygon points="${q.map(P).join(" ")}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
};
// ground arrow a→b (drawable, pathLength 1)
const gline = (id, a, b, color, sw = 9, z = 0) => {
  const Wp_ = Wp; const Wp2 = (u, v) => Wp_(u, v, z);
  const du = b.u - a.u, dv = b.v - a.v, l = Math.hypot(du, dv), eu = du / l, ev = dv / l;
  const tip = Wp2(b.u, b.v), bb = { u: b.u - eu * 44, v: b.v - ev * 44 };
  const hw = 26, l1 = Wp2(bb.u - ev * hw, bb.v + eu * hw), l2 = Wp2(bb.u + ev * hw, bb.v - eu * hw);
  return `<g id="${id}"><path id="${id}-p" d="M${P(Wp2(a.u, a.v))}L${P(Wp2(bb.u, bb.v))}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" fill="none" stroke="${color}" stroke-width="${sw}"/>` +
    `<polygon id="${id}-h" points="${P(tip)} ${P(l1)} ${P(l2)}" fill="${color}" opacity="0"/></g>`;
};
// a gold coin stack (asset), drawn at ground point o (z offset)
const coins = (o, z = 0) => cyl(o, 0, 0, 30, z, z + 10, M.gold) + cyl(o, 0, 0, 30, z + 12, z + 22, M.gold) + cyl(o, 0, 0, 30, z + 24, z + 34, M.gold);
// hanging sign board: two steel posts, a white panel on the +v face; text groups switch by opacity
const BW = 460, BH = 150;
function board(id, o, zTop, texts) {
  const h = BW / 2;
  let s = `<g id="${id}" class="kobj" data-ox="${f(at(o)[0])}" data-oy="${f(at(o)[1])}">`;
  s += cyl(o, -h + 24, -4, 9, 0, zTop + 20, M.steel, { seg: 14 }) + cyl(o, h - 24, -4, 9, 0, zTop + 20, M.steel, { seg: 14 });
  s += box(o, -h - 10, h + 10, -10, 6, zTop + 18, zTop + 30, M.steel, 1.2);
  // chains
  for (const x of [-h + 70, h - 70]) s += `<path d="M${P(at(o, x, 0, zTop + 18))}L${P(at(o, x, 0, zTop))}" stroke="#4b4f56" stroke-width="3" stroke-dasharray="5 3"/>`;
  s += box(o, -h, h, -8, 0, zTop - BH, zTop, M.white, 1.6);
  const fv = faceV(o, -h, 0, zTop);
  s += `<g transform="${fv}"><rect x="8" y="8" width="${BW - 16}" height="${BH - 16}" rx="10" fill="#fffdf8" stroke="#2aa3c9" stroke-width="5"/>`;
  s += `<g id="${id}-dash"><rect x="70" y="56" width="${BW - 140}" height="12" rx="6" fill="#e2ddd3"/><rect x="120" y="84" width="${BW - 240}" height="12" rx="6" fill="#e2ddd3"/></g>`;
  texts.forEach(([key, txt, kind], i) => {
    const bg = kind === "g" ? `<rect x="8" y="8" width="${BW - 16}" height="${BH - 16}" rx="10" fill="#1f9d55"/>` : "";
    s += `<g id="${id}-${key}" opacity="0">${bg}<text x="${BW / 2}" y="${BH / 2 + 20}" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-weight="900" font-size="${txt.length > 7 ? 46 : 58}" fill="${kind === "g" ? "#ffffff" : "#1c1c1c"}">${txt}</text></g>`;
  });
  s += `</g></g>`;
  return { svg: s, top: at(o, 0, 0, zTop + 40), center: at(o, 0, 0, zTop - BH / 2) };
}

// ------------------------------------------------------------------ 生产线
const SEG = 320;
for (let d = -160; d < 3000; d += SEG) add(X.conveyor, S(d + SEG / 2, 0), { id: `belt${Math.round(d)}`, len: SEG });
// ① 熵源：先是 PRNG 小计数器（红虚线），再换成摇奖机 CSPRNG
add(X.prngCounter, S(80, 250), { id: "prng", state: "broken", ghost: 0.5 }, 0, "st1a");
add(X.lottery, S(80, 250), { id: "lot", glow: true }, 1, "st1b");
add(X.mnemonicPlate, S(520, 250), { id: "mn" });
add(X.seedJar, S(900, 250), { id: "seed" });
add(X.deriveTree, S(1270, 250), { id: "tree" });
add(O.padlock, S(1660, 250), { id: "pk" });
// ⑥ 地址：旧（正常 / 红）叠放，修复后强制迁移到新地址
["a1", "a2"].forEach((id, i) => {
  const o = S(2050 + i * 190, 250);
  const n = X.addrPlate(o, { id, text: `地址 ${i + 1}` }), r = X.addrPlate(o, { id: id + "r", text: `地址 ${i + 1}`, state: "attacker" });
  push(o, `<g id="${id}-n">${n.svg}</g><g id="${id}-r" opacity="0">${r.svg}</g>`);
  A[id] = n.anchors;
  add(X.addrPlate, S(2050 + i * 190, -420), { id: id + "new", text: `新地址 ${i + 1}`, glow: true });
});
// 生产线尽头：链上（签名公开）
add(O.chain, S(3260, 30), { id: "chn", n: 3 });
const SIGS = [0, 1, 2, 3].map((i) => ({ id: `sg${i}`, o: S(2700 + i * 170, 470) }));
SIGS.forEach((s) => add(X.sigPaper, s.o, { id: s.id }));
ground.push(gstrip(S(2600, 470), S(3300, 470), 230, "#e8f4f8", "#bfe3ef"));
add(O.beacon, S(3420, 470), { id: "bcn" });
{ // monitoring magnifier (moves over the signatures)
  const mo = S(2700, 470);
  const r = O.magnifier(mo, { id: "mmag", z: 140 });
  overlay.push(`<g id="mmag-w" opacity="0">${r.svg}</g>`);
  const step = at(S(2870, 470)), a0 = at(mo);
  A.mmag = { dx: f(step[0] - a0[0]), dy: f(step[1] - a0[1]) };
}
// r 签条重复：sg1 与 sg3 之间红虚线
overlay.push(`<path id="rlink" d="M${P(A.sg1.tag)}Q${f((A.sg1.tag[0] + A.sg3.tag[0]) / 2)} ${f(Math.min(A.sg1.tag[1], A.sg3.tag[1]) - 90)} ${P(A.sg3.tag)}" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="12 9" opacity="0"/>`);

// 生成层：浏览器 / WASM 里自己替换随机源（红叉）
{
  const bo = S(-330, 760);
  const page = `<rect x="0" y="0" width="380" height="300" fill="#ffffff"/>
    <rect x="30" y="34" width="150" height="110" rx="10" fill="#5a4fcf"/><text x="105" y="104" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="800" font-size="40" fill="#ffffff">WASM</text>
    <rect x="200" y="34" width="150" height="110" rx="10" fill="#f0db4f"/><text x="275" y="104" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="800" font-size="44" fill="#323330">JS</text>
    <rect x="30" y="176" width="320" height="86" rx="10" fill="#fdeae7" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 8"/>
    <text x="190" y="232" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-weight="900" font-size="36" fill="#c3352b">自换随机源</text>`;
  add(O.browserWin, bo, { id: "brw", title: "浏览器扩展", page });
}
// 签名层：支线 + 确定性 k 机器 + 公章
ground.push(gstrip(S(1660, 120), S(1660, 900), 110, "#f8f6f1", "#dcd5c8"));
add(X.kMachine, S(1500, 820), { id: "km", glow: true });
add(O.seal, S(1840, 840), { id: "seal" });
// 靶号 · MPC：MPC 证明卡（两张起初缺失）
const PCS = [0, 1, 2].map((i) => ({ id: `pc${i}`, o: S(1300 + i * 190, 1380), miss: i !== 1 }));
PCS.forEach((p) => add(X.proofCard, p.o, { id: p.id, missing: p.miss }));
// 靶号工具（单圈 32 位小转盘机）不碰金库地址
add(X.comboDial, S(380, 1180), { id: "vt" });
add(O.safe, S(780, 1100), { id: "vsafe", plate: "金库" });
add(X.addrPlate, S(1010, 1290), { id: "vaddr", text: "金库地址" });

// 告示牌（四层）
const BOARDS = {
  bGen: board("bGen", S(80, -230), 600, [["t", "生成层"], ["c", "① 熵满 256 位", "g"]]),
  bSig: board("bSig", S(1500, 600), 560, [["t", "签名层"], ["c", "② nonce 不可预测", "g"]]),
  bMon: board("bMon", S(2950, 250), 560, [["t", "监控层"]]),
  bImp: board("bImp", S(1470, 1130), 560, [["t", "靶号 · MPC 库"], ["c", "③ 实现不偏离标准", "g"]]),
};
const BO = { bGen: S(80, -230), bSig: S(1500, 600), bMon: S(2950, 250), bImp: S(1470, 1130) };
Object.entries(BOARDS).forEach(([k, b]) => push(BO[k], b.svg, -2));

// ------------------------------------------------------------------ 三个角色（前方）
const RV = 2750;
const ROLES = [
  { id: "p0", name: "钱包开发者", role: "engineer", d: 0 },
  { id: "p1", name: "审计和安全团队", role: "signer", d: 1150 },
  { id: "p2", name: "普通用户", role: "signer", color: "#5b7086", d: 2300 },
];
const LPOS = (i) => S(1050 + i * 430, RV - 850);
ROLES.forEach((r, i) => {
  const zo = S(r.d, RV), lo = LPOS(i);
  const pr = O.person(lo, { id: r.id, role: r.role, color: r.color, scale: 1.35 });
  push(lo, pr.svg, at(zo)[1] - at(lo)[1]);
  A[r.id] = pr.anchors;
  r.mv = [f(at(zo)[0] - at(lo)[0]), f(at(zo)[1] - at(lo)[1])];
  A[r.id + "z"] = { top: [pr.anchors.top[0] + r.mv[0], pr.anchors.top[1] + r.mv[1]], ground: [pr.anchors.ground[0] + r.mv[0], pr.anchors.ground[1] + r.mv[1]] };
});
// 开发者：笔记本
add(O.laptop, S(330, RV - 40), { id: "dl", screen: `<rect x="0" y="0" width="222" height="146" fill="#1f2226"/>` +
  `<text x="12" y="30" font-family="JetBrains Mono, monospace" font-size="17" font-weight="700" fill="#9ad9ee">$ grep keygen/</text>` +
  `<rect x="12" y="50" width="150" height="8" rx="4" fill="#3b3e44"/><rect x="12" y="68" width="110" height="8" rx="4" fill="#3b3e44"/><rect x="12" y="86" width="170" height="8" rx="4" fill="#3b3e44"/>` +
  `<text x="12" y="126" font-family="JetBrains Mono, monospace" font-size="16" font-weight="700" fill="#86d6a8">0 matches</text>` });
// 审计：金库 + 管理员热钱包，各带地址门牌
add(O.safe, S(1600, RV - 160), { id: "asafe", plate: "金库" });
add(X.addrPlate, S(1600, RV + 150), { id: "aa1", text: "金库地址" });
add(O.hotWallet, S(1950, RV - 120), { id: "ahot" });
add(X.addrPlate, S(1950, RV + 150), { id: "aa2", text: "管理员" });
{
  const mo = S(1600, RV + 150);
  const r = O.magnifier(mo, { id: "amag", z: 200 });
  overlay.push(`<g id="amag-w" opacity="0">${r.svg}</g>`);
  const b = at(S(1950, RV + 150)), a0 = at(mo);
  A.amag = { dx: f(b[0] - a0[0]), dy: f(b[1] - a0[1]) };
}
// 用户：手机（主流钱包生成助记词）+ 旧地址 → 新钱包新地址
const mnScr = `<rect x="0" y="0" width="76" height="26" fill="#1f9d55"/><text x="38" y="19" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="13" font-weight="900" fill="#ffffff">助记词</text>` +
  Array.from({ length: 12 }, (_, i) => `<rect x="${8 + (i % 2) * 34}" y="${36 + Math.floor(i / 2) * 15}" width="26" height="8" rx="4" fill="#9fd9b8"/>`).join("") +
  `<rect x="8" y="${150 - 36}" width="60" height="24" rx="7" fill="#1f9d55"/>`;
add(O.phone, S(2560, RV - 60), { id: "uph", screen: mnScr });
const UO = S(2850, RV - 130), UN = S(3250, RV + 60);
{
  const n = X.addrPlate(UO, { id: "uo", text: "旧地址" }), r = X.addrPlate(UO, { id: "uor", text: "旧地址", state: "attacker" });
  push(UO, `<g id="uo-n">${n.svg}</g><g id="uo-r" opacity="0">${r.svg}</g>`);
  A.uo = n.anchors;
}
add(X.addrPlate, UN, { id: "un", text: "新地址", glow: true });
ground.push(gline("uarr", uv(UO, 120, 60), uv(UN, -110, -40), "#1f9d55"));
{ // asset (coins) that moves from the old to the new address
  const co = uv(UO, 70, 80);
  overlay.push(`<g id="ucoin">${coins(co)}</g>`);
  const b = at(uv(UN, -40, 40)), a0 = at(co);
  A.ucoin = { dx: f(b[0] - a0[0]), dy: f(b[1] - a0[1]) };
  const eo = uv(UO, -60, 330);
  overlay.push(`<g id="uenv-w" opacity="0">${O.envelope(eo, { id: "uenv" }).svg}</g>`);
  A.uenv = { top: at(eo, 0, 0, 60) };
}
// 迁移箭头（生产线旧地址 → 新地址）
["a1", "a2"].forEach((id, i) => overlay.push(gline(`marr${i}`, S(2050 + i * 190 + 40, 190), S(2050 + i * 190 + 40, -330), "#1f9d55", 8, 96)));

// ------------------------------------------------------------------ 钩子场景（与 seg1 对齐：ep02/seg1/src/layout.mjs 的相对位置，整体平移到 HO）
// 金库(门开 105°) + 顶上信箱 → 256 位大转盘 → Profanity 机器（外壳已透明，内装 32 位小转盘），传动轴小转盘 −u 侧 → 大转盘 +u 侧
const HO = S(250, -2250);
const hw = (p) => uv(HO, p.u, p.v);
function profMachine(o, id, inner) { // 同 seg1 的 Profanity 机器（段尾状态：外壳 0.1、青蓝虚线轮廓）
  const W = 150, v0 = -80, v1 = 90, H = 300;
  const body = { f: "#f6f3ec", s: "#ddd7cb", t: "#ffffff", st: "#5d636b" };
  const teal = { f: "#2aa3c9", s: "#1d93ba", t: "#5cc0e0", st: "#155e77" };
  let back = contactShadow(o, W * 1.2, 110);
  back += box(o, -W, W, v0, v1, 0, 14, M.steel, 1.4);
  back += box(o, -W, W, v0, v0 + 12, 14, H, { f: "#e4dfd4", s: "#cfc8ba", t: "#f1ede5", st: "#5d636b" }, 1.4);
  back += box(o, W - 12, W, v0, v1, 14, H, body, 1.4);
  let shell = box(o, -W, -W + 12, v0, v1, 0, H, body, 1.6);
  shell += box(o, -W, W, v1 - 12, v1, 0, H, body, 1.6);
  shell += box(o, -W - 6, W + 6, v0 - 6, v1 + 6, H, H + 16, teal, 1.6);
  const outline = `<path d="${edges(o, -W, W, v0, v1, 0, H + 16)}" fill="none" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="14 10" stroke-linejoin="round"/>`;
  const [ox, oy] = at(o);
  const svg = `<g id="${id}" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}">${back}${inner}<g id="${id}-shell" opacity="0.1">${shell}</g><g id="${id}-ol">${outline}</g></g>`;
  return { svg, anchors: { top: at(o, 0, 0, H + 70), center: at(o, 0, 0, H / 2), ground: at(o) } };
}
{
  const vo = hw(HL.VAULT);
  const sf = O.safe(vo, { id: "hsafe", plate: "金库", gold: false }); A.hsafe = sf.anchors;
  const mb = X.addrPlate(hw(HL.MAILBOX), { id: "hmb", text: "地址" });
  A.hmb = { top: [mb.anchors.top[0], mb.anchors.top[1] - HL.MAILBOX.z * 0.866] };
  push(vo, sf.svg + `<g id="hmbw" opacity="0">${X.liftSvg(mb.svg, HL.MAILBOX.z)}</g>`);
  add(X.comboDial, hw(HL.DIAL256), { id: "d256", rings: 8 });
  const d32 = X.comboDial(hw(HL.DIAL32), { id: "d32" }); A.d32 = d32.anchors;
  const po = hw(HL.PROF);
  const pr = profMachine(po, "prof", d32.svg); A.prof = pr.anchors;
  const sh = X.shaft(po, { id: "sh", a: [HL.SHAFT_A[0] - HL.PROF.u, HL.SHAFT_A[1] - HL.PROF.v, HL.SHAFT_A[2]], b: [HL.SHAFT_B[0] - HL.PROF.u, HL.SHAFT_B[1] - HL.PROF.v, HL.SHAFT_B[2]] });
  A.sh = sh.anchors;
  push(po, pr.svg + sh.svg);
}

// ------------------------------------------------------------------ labels
let LB = "";
const lab = (id, p, html, cls = "", anchor = "b") => { LB += wlab(id, p, html, cls + " hide", anchor); };
const up = (p, d) => [p[0], p[1] - d];
const mono = (s) => `<span style="font-family:'JetBrains Mono',monospace">${s}</span>`;
// 生成层
lab("l1-prng", up(A.prng.top, 0), "PRNG · 32 位种子", "lab-r lab-sm");
lab("l1-lot", up(A.lot.top, 10), "CSPRNG / 硬件随机源", "lab-gs");
lab("l1-256", [A.lot.center[0] + 140, A.lot.center[1] + 30], "满 256 位熵", "lab-gs lab-sm", "l");
lab("l1-brw", up(A.brw.top, 0), "✗ 不在 WASM / 浏览器 JS 里自己替换", "lab-rs lab-sm");
// 签名层
lab("l2-km", up(A.km.top, 0), "标准 EdDSA · RFC 6979", "lab-gs");
LB += wpin("ck", [A.km.center[0] + 360, A.km.center[1] - 40], `<div class="ckc hide" id="ckc"><div class="ck-h">验证封装层</div>
  <div class="ck-r" id="ck0"><span class="bx"><span class="bx-on hide" id="ck0k">✓</span></span>已知答案测试</div>
  <div class="ck-r" id="ck1"><span class="bx"><span class="bx-on hide" id="ck1k">✓</span></span>差分测试</div></div>`, "l");
// 监控层
lab("l3-sig", up(A.sg0.top, 30), "自家地址的签名", "lab-sm");
lab("l3-r", [(A.sg1.tag[0] + A.sg3.tag[0]) / 2, Math.min(A.sg1.tag[1], A.sg3.tag[1]) - 70], `${mono("r")} 值重复`, "lab-rs");
lab("l3-b", up(A.bcn.top, 0), "告警", "lab-rs lab-sm");
// 靶号 · MPC
lab("l4-vt", up(A.vt.top, 0), "靶号工具", "lab-r");
lab("l4-vs", up(A.vsafe.top, 0), "管理员 / 金库地址", "lab-cs lab-sm");
LB += wpin("vx", [(A.vt.center[0] + A.vaddr.center[0]) / 2 - 40, A.vt.center[1] - 10], `<div class="hide" id="vxi">${BADGE("vxb", 76)}</div>`, "c");
lab("l4-vx", [(A.vt.center[0] + A.vaddr.center[0]) / 2 - 40, A.vt.center[1] + 50], "不用来生成", "lab-rs lab-sm", "t");
lab("l4-pc", [A.pc1.top[0], A.pc1.top[1] - 10], "MPC 库 · 逐项审计证明", "lab-cs");
lab("l4-up", [A.pc2.center[0] + 120, A.pc2.center[1] + 20], "及时升级 ✓", "lab-gs lab-sm", "l");
// 迁移
lab("l5-fix", up(A.a2.top, 20), "生成缺陷 · 已修复", "lab-r lab-sm");
lab("l5-mig", [A.a2new.top[0] + 60, A.a2new.top[1] + 10], "强制迁移到新地址", "lab-gs", "l");
// 角色
ROLES.forEach((r) => lab(`ln-${r.id}`, A[r.id].top, r.name, "lab-ink"));
lab("l9-ph", up(A.uph.top, 0), "主流钱包 · 生成助记词", "lab-gs lab-sm");
lab("l9-env", up(A.uenv.top, 0), "公告 · 随机数缺陷", "lab-r lab-sm");
lab("l9-un", up(A.un.top, 0), "新钱包 · 新地址", "lab-gs lab-sm");
lab("l8-a1", up(A.asafe.top, 0), "金库", "lab-cs lab-sm");
lab("l8-a2", up(A.ahot.top, 0), "管理员", "lab-cs lab-sm");
LB += wpin("aq", [A.ahot.center[0] + 230, A.ahot.center[1] - 60], `<div class="ckc hide" id="aqc"><div class="ck-h">是不是靶号工具生成的？</div>
  <div class="ck-r"><span class="bx"><span class="bx-on hide" id="aq0k">✓</span></span>金库地址 · 已查</div>
  <div class="ck-r"><span class="bx"><span class="bx-on hide" id="aq1k">✓</span></span>管理员地址 · 已查</div></div>`, "l");
// 钩子
lab("h-32", up(A.prof.top, 0), "Profanity · 32 位种子", "lab-r");
lab("h-256", up(A.d256.top, 0), "私钥 · 256 位", "");
lab("h-256x", up(A.d256.top, 0), "私钥 · 实际只有 32 位", "lab-rs");
lab("h-safe", up(A.hmb.top, 0), "Wintermute 金库", "lab-cs lab-sm");
lab("h-sh", [A.sh.center[0], A.sh.center[1] + 70], "强度 = 生成它的熵", "lab-cs", "t");
LB += wpin("hq", [A.d256.top[0], A.d256.top[1] - 80], `<div class="qcard hide" id="hqc"><div class="qmark">?</div><div class="qtxt">256 位的私钥<br>为什么只值 32 位</div></div>`, "b");

// ------------------------------------------------------------------ cameras
const fit = (Pts, x0, y0, x1, y1) => {
  const xs = Pts.map((p) => p[0]), ys = Pts.map((p) => p[1]);
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  const k = Math.min((x1 - x0) / (bx1 - bx0), (y1 - y0) / (by1 - by0));
  return camAt([(bx0 + bx1) / 2, (by0 + by1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};
const C0 = fit([at(S(-480, 760), 0, 0, 0), at(S(3400, 0)), BOARDS.bGen.top, at(S(3200, 1240)), at(S(1240, 1300))], 80, 120, 1840, 900);
const C1 = fit([BOARDS.bGen.top, A.brw.top, A.brw.ground, at(S(-500, 900)), at(S(400, 300)), at(S(260, 250), 0, 0, 0)], 120, 130, 1800, 880);
const C2 = fit([BOARDS.bSig.top, A.km.ground, A.seal.ground, at(S(1250, 900)), [A.km.center[0] + 760, A.km.center[1]]], 120, 150, 1800, 870);
const C3 = fit([BOARDS.bMon.top, A.sg0.ground, A.bcn.ground, A.bcn.top, A.sg3.ground, at(S(2600, 560)), [A.sg0.top[0], A.sg0.top[1] - 120]], 140, 170, 1780, 870);
const C4 = fit([BOARDS.bImp.top, A.pc0.ground, A.pc2.ground, A.vaddr.ground, A.vsafe.top, A.vt.top, A.vt.ground, [A.pc2.center[0] + 260, A.pc2.center[1]]], 120, 160, 1800, 870);
const C5 = fit([[A.a1.top[0], A.a1.top[1] - 70], A.a1.ground, A.a2new.ground, A.a1new.top, [A.a2new.top[0] + 520, A.a2new.top[1]], [A.a2.ground[0], A.a2.ground[1] + 60]], 260, 200, 1660, 860);
const C6 = fit([A.p0.top, A.p2.top, A.p0.ground, A.p2.ground, [A.p0.top[0] - 80, A.p0.top[1] - 60], [A.p2.ground[0] + 120, A.p2.ground[1]]], 360, 200, 1560, 860);
const zc = (pid, sx, k) => camAt(A[pid].ground, sx, 800, k);
const C7 = camAt(A.p0z.ground, 380, 820, 1.0), C8 = fit([A.p1z.top, A.p1z.ground, A.asafe.top, A.aa2.ground, [A.ahot.center[0] + 760, A.ahot.center[1]], [A.p1z.ground[0] - 120, A.p1z.ground[1]]], 120, 180, 1800, 870);
const C9 = fit([A.p2z.top, A.p2z.ground, A.un.ground, A.uo.top, A.uenv.top, A.un.top, [A.p2z.top[0] - 120, A.p2z.top[1]]], 160, 180, 1760, 870);
const C10 = fit([A.hmb.top, A.hsafe.ground, A.prof.top, A.prof.ground, A.d256.ground, [A.d256.top[0], A.d256.top[1] - 230], [A.hsafe.ground[0] - 60, A.hsafe.ground[1] + 60]], 140, 130, 1780, 880);
const bc = (b, k) => camAt([BOARDS[b].center[0], BOARDS[b].center[1] + 150], 960, 470, k);
const C12 = bc("bGen", 0.9), C12b = bc("bSig", 0.9), C12c = bc("bImp", 0.9);
const CEND = fit([BOARDS.bGen.top, BOARDS.bSig.top, BOARDS.bImp.top, A.lot.ground, A.pc2.ground], 160, 120, 1760, 960);
const CAMS = { C0, C1, C2, C3, C4, C5, C6, C7, C8, C9, C10, C12, C12b, C12c, CEND };

// screen layer: developer's code card + its link to the laptop
const CARD = { x: 920, y: 210 };
const rowY = (i) => CARD.y + 24 + 56 + 50 * i + 25;
const lapS = toScreen(C7, A.dl.screen);

// ------------------------------------------------------------------ assemble
const srt = (arr) => arr.slice().sort((a, b) => a.Y - b.Y).map((b) => b.svg).join("\n");
const world = worldSvg("wsvg", gridSvg({ u0: -4000, u1: 8000, v0: -4000, v1: 8000 }) + ground.join("") + srt(items) + overlay.join(""), [-2000, -2000, 9000, 6000]);

const D = (o) => JSON.stringify(o);
const T = {
  l: TM.lines.map((_, i) => L(i).start),
  gen: w("生成层"), cs: w("CSPRNG"), hw: w("硬件随机源"), full: w("满"), wasm: w("WASM"), swap: w("替换"),
  sig: w("签名层"), eddsa: w("EdDSA"), rfc: w("RFC"), kat: w("已知答案测试"), diff: w("差分测试"), wrap: w("封装层"),
  mon: w("监控层"), scan: w("扫描"), dup: w("重复"),
  vt: w("靶号工具"), adm: w("管理员"), mpc: w("MPC"), audit: w("审计证明"), upg: w("及时升级"),
  fix: w("修复后"), force: w("强制"), newA: w("新地址"),
  role: w("按角色"),
  dev: w("钱包开发者"), grep: w("搜一遍"), ts: w("时间戳种子"), mr: w("Math"), mt: w("MT"),
  aud: w("审计和安全团队"), vault: w("金库", { line: 8 }), admin: w("管理员", { line: 8 }), vt2: w("靶号工具", { line: 8 }),
  user: w("普通用户"), main: w("主流钱包"), mnem: w("助记词"), ann: w("公告"), bug: w("随机数缺陷"), move: w("转到"), newW: w("新钱包"),
  back: w("回到开头"), q256: w("256", { line: 10 }), q32: w("32", { line: 10 }),
  strength: w("强度", { line: 11 }), entropy: w("熵", { line: 11 }), only32: w("只有", { line: 11 }), more: w("位数再多"),
  three: w("三个条件"), c1: w("熵满"), c2: w("nonce"), c3: w("实现"),
  detail: w("种子", { line: 13 }), next: w("下一集"),
};

// 术语卡（RETROFIT-deps 第 2 类）
const TERMS = [
  { id: "tc1", t1: "差分测试", t2: "同一输入喂给多个实现 · 比对输出", at: w("差分测试", { line: 2 }) },
  { id: "tc2", t1: "<code>r</code> 值", t2: "签名的一部分 · nonce 重复它就重复", at: w("r值", { line: 3 }) },
  { id: "tc3", t1: "<code>Math.random</code>", t2: "JS 自带的普通随机数 · 不是 CSPRNG", at: w("Math", { line: 7 }) },
];

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #sec { position: absolute; left: 56px; top: 32px; }
    #sec .lab { position: absolute; left: 0; top: 0; }
    .mono { font-family: "JetBrains Mono", monospace; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    .qcard { display: flex; align-items: center; gap: 20px; background: #fffdf8; border: 3px solid #2aa3c9; border-radius: 18px; padding: 14px 26px 16px 18px;
      box-shadow: 0 14px 30px rgba(70, 60, 40, 0.14); white-space: nowrap; }
    .qmark { width: 62px; height: 62px; border-radius: 50%; background: #1d93ba; color: #fff; font-size: 46px; font-weight: 900; line-height: 62px; text-align: center; flex: none; }
    .qtxt { font-size: 36px; font-weight: 900; line-height: 1.25; color: #1c1c1c; }
    .ckc { background: #fffdf8; border-radius: 18px; padding: 16px 28px 18px; box-shadow: 0 14px 30px rgba(70, 60, 40, 0.14); border-top: 8px solid #2aa3c9; white-space: nowrap; }
    .ck-h { font-size: 32px; font-weight: 900; color: #1c1c1c; margin-bottom: 8px; }
    .ck-r { display: flex; align-items: center; gap: 16px; height: 62px; font-size: 34px; font-weight: 700; color: #1c1c1c; }
    .bx { position: relative; width: 46px; height: 46px; border-radius: 10px; border: 4px solid #8a8478; background: #ffffff; flex: none; }
    .bx-on { position: absolute; inset: -4px; border-radius: 10px; background: #1f9d55; color: #fff; font-size: 34px; font-weight: 900; line-height: 46px; text-align: center; }
    #card { left: ${CARD.x}px; top: ${CARD.y}px; width: 860px; }
    #card .c-row { overflow: visible; }
    .rk { position: absolute; right: 0; top: 4px; }
    .c-green { color: #1f9d55; font-weight: 800; }
    #mag { position: absolute; left: 380px; top: 70px; width: 120px; height: 120px; }
    #res { position: absolute; left: ${CARD.x}px; top: ${CARD.y + 330}px; display: flex; align-items: center; gap: 18px; background: #fffdf8; border-radius: 16px;
      padding: 14px 26px 16px 18px; box-shadow: 0 10px 24px rgba(70, 60, 40, 0.12); font-size: 36px; font-weight: 900; white-space: nowrap; }
    #res b { color: #1f9d55; font-size: 42px; }
    #veil { position: absolute; inset: 0; background: #efebe3; opacity: 0; }
    #endcard { position: absolute; left: 190px; top: 250px; width: 1540px; background: #fffdf8; border-radius: 28px; box-shadow: 0 18px 40px rgba(70, 60, 40, 0.14);
      text-align: center; padding: 58px 40px 56px; opacity: 0; }
    #endcard .e-main { font-size: 76px; font-weight: 900; line-height: 1.15; white-space: nowrap; color: #1c1c1c; }
    #endcard .e-main .e-ch { color: #1d93ba; }
    #endcard .e-rule { width: 120px; height: 6px; border-radius: 3px; background: #2aa3c9; margin: 34px auto 30px; }
    #endcard .e-sub { font-size: 38px; font-weight: 700; color: #3b3e44; white-space: nowrap; }
    #endcard .e-note { margin-top: 18px; font-size: 40px; font-weight: 900; color: #1d93ba; white-space: nowrap; }
    #endcard .e-next { margin-top: 22px; font-size: 36px; font-weight: 700; color: #3b3e44; white-space: nowrap; }
${termCss}
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${LB}</div>
      </div>
      <div class="k-code hide" id="card">
        <div class="c-head">密钥生成代码<span class="c-tag">搜一遍</span></div>
        <div class="c-row" id="row0">时间戳种子<span class="rk hide" id="rk0"><span class="lab lab-gs lab-sm">0 处 ✓</span></span></div>
        <div class="c-row" id="row1">${mono("Math.random")}<span class="rk hide" id="rk1"><span class="lab lab-gs lab-sm">0 处 ✓</span></span></div>
        <div class="c-row" id="row2">${mono("mt19937")}<span class="rk hide" id="rk2"><span class="lab lab-gs lab-sm">0 处 ✓</span></span></div>
        <svg id="mag" class="hide" viewBox="0 0 120 120"><circle cx="48" cy="48" r="36" fill="rgba(207,232,241,0.55)" stroke="#2b2d31" stroke-width="9"/>
          <path d="M30 34A22 22 0 0 1 52 24" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M75 75L108 108" stroke="#2b2d31" stroke-width="14" stroke-linecap="round"/></svg>
      </div>
      <div id="res" class="hide">${CHECK("resk", 50)}<span>弱随机源：<b>都没有</b></span></div>
      <div id="sec">
        <div class="lab lab-ink hide" id="sec0">⑥ 怎么守 · 按层防御</div>
        <div class="lab lab-ink hide" id="sec1">按角色 · 今天就能做一件事</div>
        <div class="lab lab-ink hide" id="sec2">回到开头的问题</div>
      </div>

      ${termHtml(TERMS)}      ${pills(6, { sections: SCRIPT.sections })}
      <div class="k-title" id="ttl-card"><div class="t-main">⑥ 怎么守</div><div class="t-sub">按层防御 · 按角色一件事</div></div>
      <div id="veil"></div>
      <div id="endcard">
        <div class="e-main">私钥从哪里来</div>
        <div class="e-rule"></div>
        <div class="e-sub">256 位的私钥 · 为什么只值 32 位</div>
        <div class="e-note" id="e-note">私钥只有它的种子那么强</div>
        <div class="e-next" id="e-next">下一集 · EVM 与 Solidity 安全基础</div>
      </div>
    </div>
  </div>
  <script>
${runtimeJs()}
${X.runtimeExtJs()}
  (function () {
    const C = ${D(CAMS)};
    const T = ${D(T)};
    const MV = ${D(ROLES.map((r) => r.mv))};
    const tl = gsap.timeline({ paused: true });
    const pop = (sel, t) => KIT.pop(tl, sel, t);
    const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.25, ease: "power2.in" }, t);
    const fin = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.3, ease: "power2.out", immediateRender: false }, t);
    const draw = (sel, t, d) => tl.fromTo(sel, { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: d || 0.6, ease: "power2.inOut", immediateRender: false }, t);
    const brd = (id, key, t) => { out("#" + id + "-dash", t, 0.2); fin("#" + id + "-" + key, t + 0.1, 0.3); };
    const L = T.l;
    // objects that grow in later
    const GROW = [["lot", T.cs + 0.1], ["a1new", T.newA - 0.2], ["a2new", T.newA - 0.05],
      ["p0", T.role - 0.3], ["p1", T.role - 0.15], ["p2", T.role], ["vt", T.vt - 0.3], ["vsafe", T.adm - 0.4], ["vaddr", T.adm - 0.2], ["pc0", T.audit - 0.7], ["pc1", T.audit - 0.6], ["pc2", T.audit - 0.5], ["bImp", T.vt - 0.45],
      ["dl", T.dev + 0.2], ["asafe", T.aud + 0.1], ["ahot", T.aud + 0.25], ["aa1", T.vault], ["aa2", T.admin],
      ["uph", T.main - 0.2], ["un", T.newW - 0.3],
      ["prof", L[10] - 0.2], ["d256", L[10] - 0.05], ["hsafe", L[10] + 0.1]];
    GROW.forEach(function (g) { const el = document.getElementById(g[0]); tl.set("#" + g[0], { scaleY: 0, svgOrigin: el.getAttribute("data-ox") + " " + el.getAttribute("data-oy") }, 0); KIT.grow(tl, g[0], g[1]); });
    gsap.set("#sh, #uo-n, #uo-r, #ucoin, #uarr", { opacity: 0 });
    gsap.set("#st1b", { opacity: 0 });
    KIT.camSet(tl, C.C0);

    // ---------------- 标题卡 → 胶囊
    tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.5);

    // ---------------- L0 · 按层：生产线全景，四块空告示牌
    pop("#sec0", 1.7);
    KIT.belt(tl, "belt-160", 0.2, 2.8, 120);

    // ---------------- L1 · 生成层
    KIT.cam(tl, L[1] - 0.4, C.C1, 1.2);
    brd("bGen", "t", T.gen);
    pop("#l1-prng", T.gen + 0.3);
    out("#l1-prng", T.cs - 0.1, 0.2);
    tl.to("#st1a", { opacity: 0, duration: 0.3 }, T.cs);
    tl.set("#st1b", { opacity: 1 }, T.cs);
    pop("#l1-lot", T.cs + 0.4);
    KIT.drum(tl, "lot", T.cs + 0.6, 3.2, 2.5);
    KIT.ballOut(tl, "lot", T.full - 0.2, 0.7);
    pop("#l1-256", T.full);
    KIT.grow(tl, "brw", T.wasm - 0.5);
    tl.set("#brw", { scaleY: 0, svgOrigin: document.getElementById("brw").getAttribute("data-ox") + " " + document.getElementById("brw").getAttribute("data-oy") }, 0);
    pop("#l1-brw", T.swap - 0.2);

    // ---------------- L2 · 签名层
    out("#l1-prng, #l1-lot, #l1-256, #l1-brw", L[2] - 0.4, 0.25);
    KIT.cam(tl, L[2] - 0.4, C.C2, 1.2);
    brd("bSig", "t", T.sig);
    pop("#l2-km", T.eddsa);
    KIT.emit(tl, "km", T.rfc, 1.0);
    KIT.stamp(tl, "seal", T.rfc + 1.1);
    pop("#ckc", T.kat - 0.2);
    pop("#ck0k", T.kat + 0.6);
    pop("#ck1k", T.diff + 0.5);
    tl.fromTo(".ck-h", { color: "#1c1c1c" }, { color: "#1d93ba", duration: 0.3, immediateRender: false }, T.wrap);

    // ---------------- L3 · 监控层
    out("#ckc, #l2-km", L[3] - 0.4, 0.25);
    KIT.cam(tl, L[3] - 0.4, C.C3, 1.1);
    brd("bMon", "t", T.mon);
    pop("#l3-sig", T.mon + 0.4);
    fin("#mmag-w", T.scan - 0.1, 0.25);
    tl.to("#mmag-w", { x: ${A.mmag.dx}, y: ${A.mmag.dy}, duration: 0.5, ease: "power2.inOut" }, T.scan + 0.3);
    tl.to("#mmag-w", { x: ${f(A.mmag.dx * 2)}, y: ${f(A.mmag.dy * 2)}, duration: 0.5, ease: "power2.inOut" }, T.scan + 0.9);
    tl.to("#mmag-w", { x: ${f(A.mmag.dx * 3)}, y: ${f(A.mmag.dy * 3)}, duration: 0.5, ease: "power2.inOut" }, T.dup - 0.4);
    KIT.swap(tl, "#sg1-tag", "#sg1-tag-red", T.dup + 0.1, 0.25);
    KIT.swap(tl, "#sg3-tag", "#sg3-tag-red", T.dup + 0.1, 0.25);
    tl.fromTo("#rlink", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, T.dup + 0.3);
    pop("#l3-r", T.dup + 0.4);
    out("#mmag-w", T.dup + 0.5, 0.25);
    KIT.beacon(tl, "bcn", T.dup + 0.6, 2.4, 0.8);
    pop("#l3-b", T.dup + 0.7);

    // ---------------- L4 · 靶号工具 · MPC 库
    out("#l3-sig, #l3-r, #l3-b", L[4] - 0.4, 0.25);
    KIT.cam(tl, L[4] - 0.4, C.C4, 1.1);
    brd("bImp", "t", T.vt);
    pop("#l4-vt", T.vt + 0.2);
    pop("#l4-vs", T.adm);
    pop("#vxi", T.adm + 0.6); pop("#l4-vx", T.adm + 0.7);
    pop("#l4-pc", T.audit - 0.5);
    KIT.swap(tl, "#pc0-slot", "#pc0-card", T.audit + 0.2, 0.3);
    KIT.swap(tl, "#pc2-slot", "#pc2-card", T.audit + 0.7, 0.3);
    pop("#l4-up", T.upg);

    // ---------------- L5 · 修复后强制迁移
    out("#l4-vt, #l4-vs, #vxi, #l4-vx, #l4-pc, #l4-up", L[5] - 0.4, 0.25);
    KIT.cam(tl, L[5] - 0.4, C.C5, 1.1);
    KIT.swap(tl, "#a1-n", "#a1-r", L[5] + 0.2, 0.3);
    KIT.swap(tl, "#a2-n", "#a2-r", L[5] + 0.3, 0.3);
    pop("#l5-fix", T.fix);
    draw("#marr0-p", T.force, 0.5); fin("#marr0-h", T.force + 0.45, 0.15);
    draw("#marr1-p", T.force + 0.15, 0.5); fin("#marr1-h", T.force + 0.6, 0.15);
    pop("#l5-mig", T.newA + 0.3);

    // ---------------- L6 · 按角色
    KIT.cam(tl, L[6] - 0.5, C.C6, 1.3);
    out("#sec0, #l5-fix, #l5-mig", L[6] - 0.4, 0.2); pop("#sec1", L[6]);
    ["p0", "p1", "p2"].forEach(function (id, i) { pop("#ln-" + id, T.role + 0.4 + i * 0.15); });

    // ---------------- L7 · 钱包开发者
    KIT.cam(tl, L[7] - 0.4, C.C7, 1.1);
    out("#ln-p1, #ln-p2", L[7] - 0.4, 0.2);
    [0, 1, 2].forEach(function (i) { tl.to("#p" + i + ", #ln-p" + i + "-pin", { x: MV[i][0], y: MV[i][1], duration: 1.1, ease: "power2.inOut" }, L[7] - 0.4); });
    pop("#card", T.grep);
    fin("#mag", T.grep + 0.3, 0.2);
    tl.fromTo("#mag", { y: -40 }, { y: 10, duration: 0.5, ease: "power2.inOut", immediateRender: false }, T.ts - 0.3);
    pop("#rk0", T.ts + 0.6);
    tl.to("#mag", { y: 60, duration: 0.45, ease: "power2.inOut" }, T.mr - 0.2);
    pop("#rk1", T.mr + 0.5);
    tl.to("#mag", { y: 110, duration: 0.45, ease: "power2.inOut" }, T.mt - 0.2);
    pop("#rk2", T.mt + 0.5);
    out("#mag", T.mt + 0.7, 0.2);
    pop("#res", T.mt + 0.3);

    // ---------------- L8 · 审计和安全团队
    KIT.cam(tl, L[8] - 0.4, C.C8, 1.1);
    out("#card, #res, #ln-p0", L[8] + 0.2, 0.25);
    pop("#ln-p1", L[8] + 0.6);
    pop("#l8-a1", T.vault + 0.2); pop("#l8-a2", T.admin + 0.2);
    pop("#aqc", T.vt2 - 0.2);
    fin("#amag-w", T.vt2, 0.2);
    pop("#aq0k", T.vt2 + 0.7);
    tl.to("#amag-w", { x: ${A.amag.dx}, y: ${A.amag.dy}, duration: 0.6, ease: "power2.inOut" }, T.vt2 + 0.9);
    pop("#aq1k", T.vt2 + 1.7);
    out("#amag-w", T.vt2 + 2.1, 0.2);

    // ---------------- L9 · 普通用户
    KIT.cam(tl, L[9] - 0.4, C.C9, 1.1);
    out("#ln-p1, #aqc, #l8-a1, #l8-a2", L[9] - 0.4, 0.25);
    pop("#ln-p2", L[9] + 0.6);
    pop("#l9-ph", T.mnem);
    fin("#uo-n, #ucoin", T.ann - 0.6, 0.3);
    fin("#uenv-w", T.ann, 0.25);
    tl.fromTo("#uenv-w", { y: -160 }, { y: 0, duration: 0.6, ease: "power3.out", immediateRender: false }, T.ann);
    pop("#l9-env", T.bug);
    KIT.swap(tl, "#uo-n", "#uo-r", T.bug + 0.3, 0.3);
    fin("#uarr", T.move - 0.3, 0.1);
    draw("#uarr-p", T.move - 0.3, 0.5); fin("#uarr-h", T.move + 0.15, 0.15);
    tl.to("#ucoin", { x: ${A.ucoin.dx}, y: ${A.ucoin.dy}, duration: 1.0, ease: "power2.inOut" }, T.move + 0.2);
    pop("#l9-un", T.newW);

    // ---------------- L10 · 回到开头
    KIT.cam(tl, L[10] - 0.6, C.C10, 1.5);
    out("#sec1, #ln-p2, #l9-ph, #l9-env, #l9-un", L[10] - 0.6, 0.25);
    pop("#sec2", L[10] + 0.2);
    fin("#sh", L[10] + 0.4, 0.3);
    fin("#hmbw", L[10] + 0.5, 0.3);
    KIT.door(tl, "hsafe", 0.05, 105, 0.05);
    pop("#h-safe", L[10] + 0.6);
    pop("#h-32", T.q256 - 0.4);
    pop("#h-256", T.q256);
    KIT.dialTurn(tl, "d32", T.q256 + 0.3, 200, 2.6);
    KIT.dialTurn(tl, "d256", T.q256 + 0.3, 200, 2.6);
    KIT.shaftSpin(tl, "sh", T.q256 + 0.3, 2.6, 240);
    pop("#hqc", T.q32);

    // ---------------- L11 · 答案
    out("#hqc", L[11] - 0.2, 0.25);
    tl.to("#sh-hi", { opacity: 0.6, duration: 0.4 }, T.strength);
    pop("#h-sh", T.strength + 0.2);
    KIT.dialTurn(tl, "d32", T.entropy, 160, 2.2);
    KIT.dialTurn(tl, "d256", T.entropy, 160, 2.2);
    KIT.shaftSpin(tl, "sh", T.entropy, 2.2, 200);
    tl.to("#d256-solid", { opacity: 0.4, duration: 0.5 }, T.only32);
    out("#h-256", T.only32, 0.2); pop("#h-256x", T.only32 + 0.15);

    // ---------------- L12 · 三个条件（告示牌翻绿）
    KIT.cam(tl, L[12] - 0.5, C.C12, 1.5);
    KIT.cam(tl, T.c2 - 0.75, C.C12b, 0.8);
    KIT.cam(tl, T.c3 - 0.75, C.C12c, 0.8);
    out("#sec2, #h-sh, #h-32, #h-256x, #h-safe", L[12] - 0.5, 0.25);
    out("#l3-sig, #l3-r, #l3-b", L[12] - 0.5, 0.01);
    [["bGen", T.c1], ["bSig", T.c2], ["bImp", T.c3]].forEach(function (b) {
      out("#" + b[0] + "-t", b[1] - 0.1, 0.2);
      tl.fromTo("#" + b[0] + "-c", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out", immediateRender: false }, b[1]);
    });
    tl.to("#bMon", { opacity: 0.35, duration: 0.4 }, T.three);
    KIT.drum(tl, "lot", T.c1, 1.6, 1);
    KIT.emit(tl, "km", T.c2, 0.9);

    // ---------------- L13 · 结束卡（${f(TOTAL - 2.5)} s 起完全静止）
    KIT.cam(tl, L[13] - 0.4, C.CEND, 1.0);
    tl.to("#veil", { opacity: 0.76, duration: 0.45, ease: "power1.inOut" }, L[13] - 0.1);
    tl.fromTo("#endcard", { opacity: 0, scale: 0.94, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, L[13]);
    tl.set("#e-note, #e-next", { opacity: 0 }, 0);
    fin("#e-note", Math.min(T.detail - 0.6, ${f(TOTAL - 3.6)}), 0.3);
    fin("#e-next", Math.min(T.next, ${f(TOTAL - 2.9)}), 0.3);
    tl.set({}, {}, ${TOTAL});

    ${termJs(TERMS)}    window.__timelines["story"] = tl;
  })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "total", TOTAL, D(T));
