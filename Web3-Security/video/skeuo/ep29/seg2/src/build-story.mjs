// Generates compositions/story.html for ep29/seg2「② 七道关」(one isometric world, one camera).
// Run: node src/build-story.mjs   (from the seg2 project root or anywhere)
// Objects: ../../kit/objects.mjs + ./props.mjs. Layout constants: ./layout.mjs (shared with later segments).
import fs from "node:fs";
import {
  at, Wp, f, pts, box, rbox, M, CE, U, V, matStr, camAt, gridSvg, worldSvg, wlab, wpin, dashCurve, kitCss, runtimeJs, mat,
} from "../../kit/iso.mjs";
import * as O from "../../kit/objects.mjs";
import { pills } from "../../kit/pills.mjs";
import { termCards, termJs } from "../../kit/terms.mjs";
// 术语卡（2026-11-15 第二轮返工）：时间按旧时间（= timing_old），revoice.py 按句拉伸
const TERMS = [
  { id: "tc1", t1: "MPC", t2: "多方各持密钥分片 · 合作产生签名", t0: 41.20, t1s: 44.20 },
  { id: "tc2", t1: "多签", t2: "多人各自签名 · 凑够规定人数才能执行", t0: 44.39, t1s: 47.90 },
  { id: "tc3", t1: "RPC 节点", t2: "提供链上数据读取和交易广播的节点", t0: 66.67, t1s: 70.30 },
];
import { monitor, podium, hero, packet, slot, arrow, arrowV, chainGhost, pen } from "./props.mjs";
import { ROAD, GATES, STOP, USER, PHONE, CHAIN, CHAIN_LAST, PROPS, BRANCH, RPC, ARROWS } from "./layout.mjs";

const T = JSON.parse(fs.readFileSync(new URL("../timing.json", import.meta.url), "utf8"));
const TOTAL = T.total;
const W0 = { u: 0, v: 0 };
const TOP = matStr([U[0], U[1], V[0], V[1], 0, 0]);   // ground plane frame at world origin

// ---------------------------------------------------------------- ground: road, branch, slots, arrows, outline
const roadLen = ROAD.u1 - ROAD.u0;
let ground = `<defs>
  <mask id="road-mask" maskUnits="userSpaceOnUse" x="-20000" y="-20000" width="40000" height="40000">
    <path id="road-mask-p" transform="${TOP}" d="M${ROAD.u0} 0H${ROAD.u1}" stroke="#ffffff" stroke-width="420" fill="none" stroke-dasharray="${roadLen} ${roadLen}" stroke-dashoffset="${roadLen}"/></mask>
  <mask id="road-mask2" maskUnits="userSpaceOnUse" x="-20000" y="-20000" width="40000" height="40000">
    <path id="road-mask2-p" transform="${TOP}" d="M${ROAD.u0} 0H${ROAD.u1}" stroke="#ffffff" stroke-width="420" fill="none" stroke-dasharray="${roadLen} ${roadLen}" stroke-dashoffset="${roadLen}"/></mask>
  <mask id="br-mask" maskUnits="userSpaceOnUse" x="-20000" y="-20000" width="40000" height="40000">
    <path id="br-mask-p" transform="${TOP}" d="M${BRANCH.u} ${BRANCH.v0 - 10}V${BRANCH.v1 + 40}" stroke="#ffffff" stroke-width="240" fill="none" stroke-dasharray="${BRANCH.v1 - BRANCH.v0 + 50} ${BRANCH.v1 - BRANCH.v0 + 50}" stroke-dashoffset="${BRANCH.v1 - BRANCH.v0 + 50}"/></mask>
</defs>`;
const H = ROAD.half;
let roadInner = `<rect x="${ROAD.u0}" y="${-H}" width="${roadLen}" height="${2 * H}" fill="#f8f6f1" stroke="#d6cfc1" stroke-width="5"/>`;
const roadLine = `<path d="M${ROAD.u0 + 30} 0H${ROAD.u1 - 20}" stroke="#cfc7b8" stroke-width="8" stroke-dasharray="70 60"/>`;
for (const g of GATES) roadInner += `<rect x="${g.u - 64}" y="${-H + 6}" width="12" height="${2 * H - 12}" fill="#ffffff" stroke="#e2dccf" stroke-width="1.5"/>`;
ground += `<g id="road" mask="url(#road-mask)"><g transform="${TOP}">${roadInner}</g></g><g id="road-line" mask="url(#road-mask2)"><g transform="${TOP}">${roadLine}</g></g>`;
ground += `<g id="branch" mask="url(#br-mask)"><g transform="${TOP}"><rect x="${BRANCH.u - BRANCH.half}" y="${BRANCH.v0 - 6}" width="${2 * BRANCH.half}" height="${BRANCH.v1 - BRANCH.v0 + 30}" fill="#f8f6f1" stroke="#d6cfc1" stroke-width="4"/>
  <path d="M${BRANCH.u} ${BRANCH.v0 + 20}V${BRANCH.v1}" stroke="#d3ccbf" stroke-width="5" stroke-dasharray="40 36"/></g></g>`;
GATES.forEach((g, i) => { ground += slot("slot" + i, { u: g.u, v: 0 }, g.n); });
// L11 outline around the whole path (road + branch), world-canvas px
const ol = [[ROAD.u0 - 20, -H - 20], [ROAD.u1 + 20, -H - 20], [ROAD.u1 + 20, H + 20], [BRANCH.u + BRANCH.half + 20, H + 20], [BRANCH.u + BRANCH.half + 20, BRANCH.v1 + 40],
  [BRANCH.u - BRANCH.half - 20, BRANCH.v1 + 40], [BRANCH.u - BRANCH.half - 20, H + 20], [ROAD.u0 - 20, H + 20]].map(([u, v]) => Wp(u, v, 0));
let olLen = 0; for (let i = 0; i < ol.length; i++) { const a = ol[i], b = ol[(i + 1) % ol.length]; olLen += Math.hypot(b[0] - a[0], b[1] - a[1]); }
olLen = Math.ceil(olLen);
const outline = `<path id="outline" d="M${pts([ol[0]])}${ol.slice(1).map((p) => "L" + pts([p])).join("")}Z" fill="rgba(42,163,201,0.05)" stroke="#2aa3c9" stroke-width="12" stroke-linejoin="round" stroke-dasharray="${olLen} ${olLen}" stroke-dashoffset="${olLen}" fill-opacity="0"/>`;
// L10 arrows
let arrows = ARROWS.map((a, i) => arrow("ar" + i, a.a, a.b, 0, 1)).join("");
arrows += arrowV("ar-br", BRANCH.u, BRANCH.v1 - 120, BRANCH.v0 + 60, 1);

// ---------------------------------------------------------------- objects (painter's order by ground y)
const items = [];
const add = (o, svg) => items.push({ y: at(o)[1], svg });
const A = {};

// start: user + phone
const phoneScr2 = `<rect x="0" y="0" width="76" height="150" fill="#ffffff"/><rect x="0" y="0" width="76" height="24" fill="#ece7dd"/>
  <text x="8" y="17" font-family="Noto Sans SC, sans-serif" font-size="12" font-weight="700" fill="#5f5a50">交易所</text>
  <text x="8" y="50" font-family="Noto Sans SC, sans-serif" font-size="17" font-weight="900" fill="#1c1c1c">提现</text>
  <text x="8" y="78" font-family="JetBrains Mono, monospace" font-size="16" font-weight="800" fill="#1c1c1c">20,000</text>
  <text x="8" y="95" font-family="Noto Sans SC, sans-serif" font-size="12" font-weight="700" fill="#6d685e">USDT</text>
  <rect id="ph-btn" x="8" y="112" width="60" height="28" rx="7" fill="#1d93ba"/><text x="38" y="131" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="14" font-weight="900" fill="#ffffff">提现</text>`;
const user = O.person(USER, { id: "user", color: "#3f7d99" }); A.user = user.anchors; add(USER, user.svg);
const phone = O.phone(PHONE, { id: "phone", screen2: phoneScr2 }); A.phone = phone.anchors; add(PHONE, phone.svg);

// ① ledger on a plinth
{
  const o = PROPS.ledger, ph = 60;
  const lb = O.ledgerBook(o, { id: "ledg-book", scale: 1.05 });
  const k = 1.05, Hp = 84 * k;
  const row = `<polyline points="${pts([[18, Hp - 22], [116, Hp - 22]].map(([u, v]) => at(o, u * k, v, 24.5 * k)))}" stroke="#1d93ba" stroke-width="7" stroke-linecap="round" fill="none"/>`;
  const [ox, oy] = at(o);
  const svg = `<g id="ledg" class="kobj" data-ox="${f(ox)}" data-oy="${f(oy)}">
    ${box(o, -170, 170, -112, 112, 0, ph, M.plinth, 1.6)}
    <g transform="translate(0,${f(-ph * CE)})">${lb.svg}<g id="ledg-row" opacity="0">${row}</g></g></g>`;
  A.ledger = { top: at(o, 0, 0, ph + 110), row: at(o, 70, Hp - 22, ph + 26) };
  add(o, svg);
}
// gates
const gate = GATES.map((g, i) => {
  const r = O.checkpoint({ u: g.u, v: g.v }, { id: "g" + i, n: g.n, road: false, armUp: i === 6 });
  add({ u: g.u, v: g.v }, r.svg); return r;
});
// ② wallet backend
const wallet = O.rack(PROPS.wallet, { id: "wallet", tag: "WALLET" }); A.wallet = wallet.anchors; add(PROPS.wallet, wallet.svg);
// ③ shield + approver + podium
const shield = O.shield(PROPS.shield, { id: "shield" }); A.shield = shield.anchors; add(PROPS.shield, shield.svg);
const appr = O.person(PROPS.approver, { id: "appr", role: "signer" }); A.appr = appr.anchors; add(PROPS.approver, appr.svg);
const pod = podium(PROPS.podium, { id: "pod" }); A.pod = pod.anchors; add(PROPS.podium, pod.svg);
// ④ monitor + viewer + magnifier
const hexScr = `<rect x="0" y="0" width="320" height="200" fill="#0f2a33"/>
  ${["0xa9059cbb", "000000000000…", "…04a817c800"].map((s, i) => `<text x="18" y="${54 + i * 52}" font-family="JetBrains Mono, monospace" font-size="30" font-weight="700" fill="#9ad9ee">${s}</text>`).join("")}`;
const zhScr = `<rect x="0" y="0" width="320" height="200" fill="#ffffff"/><rect x="0" y="0" width="320" height="10" fill="#1d93ba"/>
  <text x="18" y="62" font-family="Noto Sans SC, sans-serif" font-size="40" font-weight="900" fill="#1c1c1c">转账</text>
  <text x="18" y="118" font-family="JetBrains Mono, monospace" font-size="32" font-weight="800" fill="#1c1c1c">20,000 USDT</text>
  <text x="18" y="172" font-family="Noto Sans SC, sans-serif" font-size="32" font-weight="900" fill="#17809f">→ 用户地址</text>`;
const mon = monitor(PROPS.monitor, { id: "mon", screen: hexScr, screen2: zhScr }); A.mon = mon.anchors; add(PROPS.monitor, mon.svg);
const viewer = O.person(PROPS.viewer, { id: "viewer", role: "signer" }); A.viewer = viewer.anchors; add(PROPS.viewer, viewer.svg);
const mag = O.magnifier(PROPS.magnifier, { id: "mag", z: 110 }); A.mag = mag.anchors;
items.push({ y: at(PROPS.magnifier)[1] + 400, svg: `<g id="mag-mv">${mag.svg}</g>` }); // in front of the screen
// ⑤ signers: MPC rack, HSM, multisig signers ; padlock (end)
const mpc = O.rack(PROPS.mpc, { id: "mpc", tag: "MPC" }); A.mpc = mpc.anchors; add(PROPS.mpc, mpc.svg);
const hsm = O.hsm(PROPS.hsm, { id: "hsm" }); A.hsm = hsm.anchors; add(PROPS.hsm, hsm.svg);
const sig = PROPS.signers.map((o, i) => { const r = O.person(o, { id: "sig" + i, role: "signer", scale: 1.0 }); add(o, r.svg); return r; });
{ // padlock + key on a sill in front of gate ⑤'s window (lifted to z, scaled)
  const L = PROPS.padlock, lock = O.padlock({ u: L.u, v: L.v }, { id: "lock" }), [lx, ly] = at({ u: L.u, v: L.v });
  const sill = box({ u: GATES[4].u, v: GATES[4].v }, -50, 50, -96, -78, L.z - 6, L.z, M.white, 1.4);
  const tf = (p) => [lx + (p[0] - lx) * L.scale, ly + (p[1] - ly) * L.scale - L.z * CE];
  A.lock = { top: tf(lock.anchors.top), center: tf(lock.anchors.center) };
  items.push({ y: at({ u: GATES[4].u, v: GATES[4].v })[1] + 1, svg: `<g id="sill" opacity="0">${sill}</g>` + `<g transform="translate(0,${f(-L.z * CE)}) translate(${f(lx)},${f(ly)}) scale(${L.scale}) translate(${f(-lx)},${f(-ly)})">${lock.svg}</g>` });
}
// ⑥ tower ; ⑦ chain
const tower = O.tower(PROPS.tower, { id: "tower" }); A.tower = tower.anchors; add(PROPS.tower, tower.svg);
const chain = O.chain({ u: CHAIN.u, v: CHAIN.v }, { id: "chain", n: CHAIN.n });
const cl = { u: CHAIN_LAST.u, v: CHAIN_LAST.v };
const hiM = { f: "#c9f0ff", s: "#a5e3f7", t: "#effbff", st: "#2aa3c9" };
const chainHi = `<g id="chain-hi" opacity="0">${rbox(cl, -50, 50, -50, 50, 0, 100, 10, hiM, { sw: 3 })}</g>`;
A.chain = chain.anchors; add({ u: CHAIN.u, v: CHAIN.v }, chain.svg + chainHi);
// RPC branch
const rpc = O.rpc(RPC, { id: "rpc" }); A.rpc = rpc.anchors; add(RPC, rpc.svg);

items.sort((a, b) => a.y - b.y);
// hero + packets + seal on top (they ride over the road in front of every booth)
const heroSvg = hero().svg;
const pkts = [0, 1, 2].map((i) => packet("pk" + i)).join("");
const seal = O.seal(PROPS.seal, { id: "seal", paper: false, stamped: false }); A.seal = seal.anchors;
const curve = dashCurve("cv-ph", A.phone.screen, A.ledger.top.map((v, i) => v + (i ? 60 : 0)), { color: "#1d93ba", c1: [A.phone.screen[0] - 40, A.phone.screen[1] - 260], c2: [A.ledger.top[0] - 60, A.ledger.top[1] - 120] });
ground += chainGhost("chain-ghost", { u: CHAIN.u, v: CHAIN.v }, CHAIN.n);
const world = worldSvg("wsvg", gridSvg({ u0: -2400, u1: 6400, v0: -2400, v1: 2800 }) + ground + `<g id="outline-g">${outline}</g>` + `<g id="arrows">${arrows}</g>` +
  items.map((x) => x.svg).join("\n") + heroSvg + pkts + seal.svg + curve.svg + pen("pen"), [-1800, -2800, 7000, 4400]);

// ---------------------------------------------------------------- labels
const G_ = GATES.map((g, i) => gate[i].anchors);
let labels = "";
GATES.forEach((g, i) => { labels += wlab("lb-g" + i, G_[i].top, `<b class="gn">${g.n}</b>${g.name}`, "lab-gate hide"); });
labels += wlab("lb-chain", at(cl, 0, 0, 170), "链上", "lab-cs hide");
labels += wlab("lb-amt", A.phone.top, "提现 20,000 USDT", "lab-cs hide");
labels += wlab("lb-ex", [A.phone.top[0] + 20, A.phone.top[1] - 70], "示例", "lab-g hide");
labels += wlab("lb-ledger", A.ledger.top, "账本 · 新增「提现单 #示例」", "hide");
labels += wlab("lb-wallet", A.wallet.top, "钱包后台", "hide");
labels += wlab("lb-tx", at(STOP[1], 0, 0, 70), "待签交易", "lab-cs hide");
labels += wlab("lb-shield", A.shield.top, "风控规则", "hide");
labels += wlab("lb-r1", [A.shield.top[0], A.shield.top[1] - 116], "金额 ✓", "lab-gs hide");
labels += wlab("lb-r2", [A.shield.top[0], A.shield.top[1] - 58], "地址 ✓", "lab-gs hide");
labels += wlab("lb-appr", A.appr.top, "审批人", "hide");
labels += wlab("lb-ok", [A.pod.ground[0] + 10, A.pod.ground[1] + 24], "批准 ✓", "lab-gs hide", "t");
labels += wlab("lb-mon1", A.mon.top, "原始字节", "lab-g hide");
labels += wlab("lb-mon2", A.mon.top, "翻译出来的文字", "lab-cs hide");
labels += wlab("lb-viewer", [A.viewer.head[0] - 50, A.viewer.head[1]], "审批人 · 看不懂", "lab-g hide", "r");
labels += wlab("lb-mpc", A.mpc.top, "MPC 节点", "hide");
labels += wlab("lb-hsm", A.hsm.top, "加密机 HSM", "hide");
labels += wlab("lb-sig", at(PROPS.signers[1], 0, 0, 230), "多签签名人", "hide");
labels += wlab("lb-rpc", A.rpc.top, "数据源 · RPC 节点", "hide");
labels += wlab("lb-br", at({ u: BRANCH.u, v: (BRANCH.v0 + BRANCH.v1) / 2 }, 90, 0, 0), "支线", "lab-g hide", "r");
ARROWS.forEach((a, i) => { labels += wlab("lb-ck" + i, at(W0, (a.a + a.b) / 2 + 30, H + 10, 0), "已检查 ✓", "hide", "t"); });
labels += wlab("lb-ckb", at(W0, BRANCH.u + 110, (BRANCH.v0 + BRANCH.v1) / 2 - 60, 0), "已检查 ✓", "hide", "l");
labels += wlab("lb-path", at(W0, 700, -1500, 0), "签名路径", "lab-cs lab-xl hide");
labels += wlab("lb-key", [A.lock.center[0] - 70, A.lock.center[1] - 10], "私钥 · 只在这里", "lab-gs hide", "r");
labels += wpin("lb-q", [A.seal.stamp[0] + 95, A.seal.stamp[1] + 30], `<div class="qbadge hide" id="qb">?</div>`, "c");
labels += wlab("lb-goal", [A.seal.stamp[0] + 150, A.seal.stamp[1] + 30], "攻击者的目标", "lab-rs hide", "l");
// account card next to the chain
const acct = `<div class="acct hide" id="acct"><div class="ah">链上账户状态</div>
  <div class="ar" id="ar-bal"><div class="fl" id="fl-bal"></div><span class="k">余额</span><span class="v" id="bal0">—</span><span class="v vch hide" id="bal1">−20,000 USDT</span></div>
  <div class="ar" id="ar-code"><div class="fl" id="fl-code"></div><span class="k">代码</span><span class="v vg">—</span><span class="chip hide" id="ch-code">也可能变</span></div>
  <div class="ar" id="ar-perm"><div class="fl" id="fl-perm"></div><span class="k">权限</span><span class="v vg">—</span><span class="chip hide" id="ch-perm">也可能变</span></div></div>`;
labels += wpin("acct", at(cl, 160, -40, 220), acct, "l");

// ---------------------------------------------------------------- cameras
const C = (u, v, z, k, sx = 960, sy = 480) => camAt(Wp(u, v, z), sx, sy, k);
const CAMS = {
  over: camAt([1600, -620], 960, 505, 0.39),
  draw0: C(-260, 0, 0, 0.74, 760, 560),        // L0 opening: close on the road start
  draw1: camAt([1851, -692], 960, 500, 0.44),  // L0 end: the whole seven-stop road + chain
  start: C(-470, -60, 110, 1.05, 940, 500),
  g1: C(-200, -170, 110, 0.98, 960, 520),
  g2: C(470, -200, 130, 1.0, 960, 520),
  g3: C(1170, -180, 120, 0.98, 960, 520),
  g4: C(1760, -260, 150, 1.12, 980, 520),
  g5: C(2560, -240, 130, 0.86, 920, 540),
  g6: C(3800, -160, 170, 0.66, 960, 520),
  g7: C(4230, -120, 130, 0.95, 860, 540),
  rpc: C(2620, 360, 90, 0.64, 960, 600),
  end: C(2520, -200, 110, 0.78, 940, 560),
};

// ---------------------------------------------------------------- paths (world u,v,z) for the hero + packets
const arc = (A0, B0, h, n = 28) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [A0[0] + (B0[0] - A0[0]) * t, A0[1] + (B0[1] - A0[1]) * t, A0[2] + (B0[2] - A0[2]) * t + 4 * h * t * (1 - t)]; });
const S = STOP.map((s) => [s.u, s.v, 6]);
const ledgerTop = [PROPS.ledger.u, PROPS.ledger.v, 100];
const walletIn = [PROPS.wallet.u, PROPS.wallet.v + 90, 170];
const chainIn = [CHAIN_LAST.u, CHAIN_LAST.v, 112];
const PATHS = {
  fromLedger: arc(ledgerTop, S[0], 170),
  m01: [S[0], S[1]], m12: [S[1], S[2]], m23: [S[2], S[3]], m34: [S[3], S[4]], m45: [S[4], S[5]],
  toWallet: arc(S[1], walletIn, 140), fromWallet: arc(walletIn, S[1], 140),
  toChain: arc(S[5], chainIn, 520, 40),
  pk: [[RPC.u, RPC.v, 150], [RPC.u, RPC.v - 90, 30], [BRANCH.u, BRANCH.v0 + 10, 30], [GATES[4].u + 50, -60, 40], [GATES[4].u + 30, -150, 90]],
};
const heroInit = Wp(...ledgerTop);

// ---------------------------------------------------------------- times (from timing.json words)
const W = T.words;
const wt = (line, text, k = 0) => { const m = W.filter((w) => w.line === line && w.text === text); if (!m[k]) throw new Error(`word ${line}:${text}`); return m[k].start; };
const TM = {
  draw: wt(0, "画"), user: wt(1, "用户"), ti: wt(1, "提"), amt: wt(1, "2 万"), ex: wt(1, "示例"),
  g1: wt(2, "第一"), g1n: wt(2, "业务"), press: wt(2, "点下"), ledger: wt(2, "账本"), slip: wt(2, "提现单"),
  g2: wt(3, "第二"), g2n: wt(3, "请求"), wallet: wt(3, "钱包"), xl: wt(3, "翻译"), tx: wt(3, "待"),
  g3: wt(4, "第三"), g3n: wt(4, "风控"), rule: wt(4, "规则"), amtc: wt(4, "金额"), addr: wt(4, "地址"), big: wt(4, "大额"), appr: wt(4, "批准"),
  g4: wt(5, "第四"), g4n: wt(5, "显示"), viewer: wt(5, "审批"), cant: wt(5, "不"), he: wt(5, "他"), xl2: wt(5, "翻译"), text: wt(5, "文字"),
  g5: wt(6, "第五"), g5n: wt(6, "签名"), mpc: wt(6, "MPC"), hsm: wt(6, "硬件"), msig: wt(6, "多"), ren: wt(6, "人"),
  g6: wt(7, "第六"), g6n: wt(7, "广播"), signed: wt(7, "签好"), send: wt(7, "发"),
  g7: wt(8, "第七"), g7n: wt(8, "链"), bal: wt(8, "余额"), chg: wt(8, "变"), code: wt(8, "代码"), perm: wt(8, "权限"),
  br: wt(9, "还有"), brn: wt(9, "支线"), read: wt(9, "读链"), decide: wt(9, "决定"), from: wt(9, "来自"), rpcw: wt(9, "RPC"),
  note: wt(10, "注意"), arrow: wt(10, "箭头"), up: wt(10, "上游"),
  intent: wt(11, "从意"), whole: wt(11, "整"), path: wt(11, "签名"),
  key: wt(12, "私钥"), only: wt(12, "只"), atk: wt(12, "攻击者"), fifth2: wt(12, "第五", 1), sign2: wt(12, "签出"),
};
const LINES = T.lines.map((l) => ({ s: l.start, e: l.start + l.dur }));

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    .lab-gate { background: #ffffff; border-color: #2aa3c9; color: #1c1c1c; font-size: 32px; font-weight: 900; }
    .lab-gate .gn { display: inline-block; color: #ffffff; background: #1d93ba; border-radius: 8px; padding: 0 8px; margin-right: 4px; font-weight: 900; }
    .lab-xl { font-size: 56px; font-weight: 900; padding: 8px 30px 12px; border-radius: 16px; }
    .qbadge { width: 78px; height: 78px; border-radius: 50%; background: #e0453a; border: 5px solid #ffffff; color: #ffffff; font-size: 52px; font-weight: 900;
      display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 14px rgba(160,40,30,0.28); line-height: 1; }
    .acct { width: 470px; background: #fffdf8; border-radius: 18px; box-shadow: 0 14px 30px rgba(70,60,40,0.12); padding: 16px 22px 18px; }
    .acct .ah { font-size: 32px; font-weight: 900; height: 50px; line-height: 46px; border-bottom: 3px solid #1c1c1c; margin-bottom: 8px; }
    .acct .ar { position: relative; display: flex; align-items: center; height: 56px; padding: 0 12px; font-size: 30px; font-weight: 700; }
    .acct .fl { position: absolute; left: 0; top: 4px; right: 0; bottom: 4px; border-radius: 10px; background: #d9eff6; opacity: 0; }
    .acct .k { position: relative; width: 88px; color: #6d685e; }
    .acct .v { position: relative; font-family: "JetBrains Mono", monospace; font-weight: 800; color: #1c1c1c; }
    .acct .vg { color: #9a9488; }
    .acct .vch { position: absolute; left: 100px; }
    .acct .chip { position: relative; margin-left: auto; font-size: 30px; font-weight: 900; color: #ffffff; background: #1d93ba; border-radius: 8px; padding: 0 12px 2px; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 84px; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels}</div>
      </div>
      ${termCards(TERMS)}${pills(2)}
      <div class="k-title" id="ttl-card"><div class="t-main">七道关</div><div class="t-sub">从意图到链上</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
    (function () {
      const CAMS = ${JSON.stringify(CAMS)};
      const PATHS = ${JSON.stringify(PATHS)};
      const CA = Math.cos(35 * Math.PI / 180), SA = Math.sin(35 * Math.PI / 180), CE = Math.cos(30 * Math.PI / 180);
      const Wp = (u, v, z) => [u * CA + v * SA, -u * SA * 0.5 + v * CA * 0.5 - (z || 0) * CE];
      const r2 = (n) => Math.round(n * 100) / 100;
      const IO = "power2.inOut";
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      // ---- path follower (seek-safe: every frame is a function of the tween's progress)
      const pathFn = (P) => { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1], P[i][2] - P[i - 1][2]));
        return (p) => { const d = p * L[L.length - 1]; let i = 1; while (i < L.length - 1 && L[i] < d) i++; const s = (d - L[i - 1]) / ((L[i] - L[i - 1]) || 1);
          return [0, 1, 2].map((k) => P[i - 1][k] + (P[i][k] - P[i - 1][k]) * s); }; };
      const heroAt = (q) => { const a = Wp(q[0], q[1], q[2]), b = Wp(q[0], q[1], 0), k = Math.max(0.35, 1 - q[2] / 700);
        $("hero").setAttribute("transform", "translate(" + r2(a[0]) + "," + r2(a[1]) + ")");
        $("hero-sh").setAttribute("transform", "translate(" + r2(b[0]) + "," + r2(b[1]) + ") scale(" + r2(k) + ")"); };
      const follow = (t, dur, P, place, ease) => { const fn = pathFn(P), o = { p: 0 };
        tl.fromTo(o, { p: 0 }, { p: 1, duration: dur, ease: ease || IO, immediateRender: false, onUpdate: () => place(fn(o.p)) }, t); };
      const hero = (t, dur, key, ease) => follow(t, dur, PATHS[key], heroAt, ease);
      const pkAt = (id) => (q) => { const a = Wp(q[0], q[1], q[2]); $(id).setAttribute("transform", "translate(" + r2(a[0]) + "," + r2(a[1]) + ")"); };
      heroAt(PATHS.fromLedger[0]);
      const grown = new Set();
      const grow = (id, t, d) => { if (!grown.has(id)) { grown.add(id); const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); } KIT.grow(tl, id, t, d); };

      KIT.camSet(tl, CAMS.draw0);
      // ===== 0–1.6 title card → pill
      tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.3);
      // ===== L0 a pen draws the road (surface, then centre line), seven numbered stops, a faint chain outline at the end
      const D0 = 1.6, DD = 1.75, RL = ${roadLen}, U0 = ${ROAD.u0};
      KIT.cam(tl, D0, CAMS.draw1, 2.0, "power1.inOut");
      fadeIn("#pen", D0, 0.12);
      { const o = { p: 0 }; tl.fromTo(o, { p: 0 }, { p: 1, duration: DD, ease: "power1.inOut", immediateRender: false, onUpdate: () => {
          const a = Wp(U0 + o.p * RL, 0, 0); $("pen").setAttribute("transform", "translate(" + r2(a[0]) + "," + r2(a[1]) + ")"); } }, D0); }
      tl.fromTo("#road-mask-p", { attr: { "stroke-dashoffset": RL } }, { attr: { "stroke-dashoffset": 0 }, duration: DD, ease: "power1.inOut", immediateRender: false }, D0);
      tl.fromTo("#road-mask2-p", { attr: { "stroke-dashoffset": RL } }, { attr: { "stroke-dashoffset": 0 }, duration: DD, ease: "power1.inOut", immediateRender: false }, D0 + 0.22);
      out("#pen", D0 + DD + 0.05, 0.2);
      // the pen passes stop i when the (power1.inOut) front reaches its u
      const inv = (x) => { let lo = 0, hi = 1; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; (gsap.parseEase("power1.inOut")(m) < x ? (lo = m) : (hi = m)); } return lo; };
      const GU = ${JSON.stringify(GATES.map((g) => g.u))};
      GU.forEach((u, i) => { const t = D0 + DD * inv((u - U0) / RL);
        fadeIn("#slot" + i, t, 0.15);
        tl.fromTo("#slot" + i + "-c", { scale: 0.4, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.35, ease: "back.out(1.6)", immediateRender: false }, t);
        tl.fromTo("#slot" + i + "-pin", { scale: 0, transformOrigin: "50% 94%" }, { scale: 1, transformOrigin: "50% 94%", duration: 0.35, ease: "back.out(1.6)", immediateRender: false }, t + 0.05); });
      tl.fromTo("#chain-ghost", { opacity: 0 }, { opacity: 0.85, duration: 0.3, immediateRender: false }, D0 + DD - 0.25);
      KIT.pop(tl, "#lb-chain", D0 + DD + 0.1);
      grow("chain", ${f(LINES[1].s + 0.3)});
      out("#chain-ghost", ${f(LINES[1].s + 0.6)}, 0.3);
      // ===== L1 user + phone
      KIT.cam(tl, ${f(LINES[1].s - 0.35)}, CAMS.start, 1.0);
      grow("user", ${f(TM.user)});
      grow("phone", ${f(TM.user + 0.25)});
      KIT.swap(tl, "#phone-scr", "#phone-scr2", ${f(TM.ti)}, 0.25);
      KIT.pop(tl, "#lb-amt", ${f(TM.amt)});
      KIT.pop(tl, "#lb-ex", ${f(TM.ex)});
      // ===== L2 gate ① business intent: ledger gets a new slip, the slip becomes the envelope
      KIT.cam(tl, ${f(LINES[2].s - 0.3)}, CAMS.g1, 1.0);
      out("#lb-ex", ${f(LINES[2].s - 0.3)});
      out("#slot0", ${f(TM.g1)}, 0.2); grow("g0", ${f(TM.g1)});
      KIT.pop(tl, "#lb-g0", ${f(TM.g1n)});
      tl.to("#ph-btn", { attr: { fill: "#1f9d55" }, duration: 0.15 }, ${f(TM.press + 0.1)});
      grow("ledg", ${f(TM.ledger - 0.15)});
      KIT.draw(tl, "cv-ph", ${f(TM.ledger + 0.2)}, 0.55);
      out("#lb-amt", ${f(TM.ledger - 0.2)});
      KIT.pop(tl, "#ledg-row", ${f(TM.slip - 0.3)}, 0.3);
      KIT.pop(tl, "#lb-ledger", ${f(TM.slip)});
      fadeIn("#hero, #hero-sh", ${f(TM.slip + 0.25)}, 0.15);
      hero(${f(TM.slip + 0.3)}, 0.85, "fromLedger");
      KIT.swap(tl, "#hero-doc", "#hero-env", ${f(TM.slip + 1.15)}, 0.3);
      out("#cv-ph", ${f(TM.slip + 1.0)}, 0.3);
      // ===== L3 gate ② request construction: into the wallet backend, out with a "to-sign tx" byte strip
      KIT.cam(tl, ${f(LINES[3].s - 0.25)}, CAMS.g2, 1.0);
      out("#lb-ledger", ${f(LINES[3].s - 0.25)});
      KIT.arm(tl, "g0", ${f(LINES[3].s - 0.2)}, true, 0.6);
      out("#lb-g0", ${f(LINES[3].s - 0.25)});
      hero(${f(TM.g2 + 0.05)}, 1.1, "m01");
      out("#slot1", ${f(TM.g2)}, 0.2); grow("g1", ${f(TM.g2)});
      KIT.pop(tl, "#lb-g1", ${f(TM.g2n)});
      grow("wallet", ${f(TM.wallet)});
      KIT.pop(tl, "#lb-wallet", ${f(TM.wallet + 0.3)});
      hero(${f(TM.xl - 0.9)}, 0.6, "toWallet", "power2.in");
      out("#hero, #hero-sh", ${f(TM.xl - 0.4)}, 0.15);
      [0, 1, 2].forEach((i) => { KIT.led(tl, "wallet-act-" + i, ${f(TM.xl - 0.2)} + i * 0.12, "blue"); KIT.led(tl, "wallet-act-" + i, ${f(TM.xl + 0.35)} + i * 0.12, "green"); });
      tl.set("#hero-strip", { opacity: 1 }, ${f(TM.xl + 0.3)});
      fadeIn("#hero, #hero-sh", ${f(TM.xl + 0.45)}, 0.12);
      hero(${f(TM.xl + 0.45)}, 0.6, "fromWallet", "power2.out");
      KIT.pop(tl, "#lb-tx", ${f(TM.tx)});
      // ===== L4 gate ③ risk & approval
      out("#lb-g1", ${f(LINES[4].s - 0.25)});
      KIT.cam(tl, ${f(LINES[4].s - 0.25)}, CAMS.g3, 1.0);
      out("#lb-tx, #lb-wallet", ${f(LINES[4].s - 0.25)});
      KIT.arm(tl, "g1", ${f(LINES[4].s - 0.2)}, true, 0.6);
      hero(${f(TM.g3 + 0.05)}, 1.1, "m12");
      out("#slot2", ${f(TM.g3)}, 0.2); grow("g2", ${f(TM.g3)});
      KIT.pop(tl, "#lb-g2", ${f(TM.g3n)});
      grow("shield", ${f(TM.rule - 0.1)});
      KIT.pop(tl, "#lb-shield", ${f(TM.rule + 0.2)});
      KIT.pop(tl, "#lb-r1", ${f(TM.amtc)});
      KIT.pop(tl, "#lb-r2", ${f(TM.addr)});
      grow("appr", ${f(TM.big)});
      grow("pod", ${f(TM.big + 0.15)});
      KIT.pop(tl, "#lb-appr", ${f(TM.big + 0.4)});
      tl.fromTo("#pod-btn", { y: 0 }, { y: 7, duration: 0.12, ease: "power2.in", immediateRender: false }, ${f(TM.appr - 0.05)});
      tl.to("#pod-btn", { y: 0, duration: 0.2, ease: "power2.out" }, ${f(TM.appr + 0.12)});
      KIT.pop(tl, "#lb-ok", ${f(TM.appr + 0.1)});
      KIT.pop(tl, "#hero-ok", ${f(TM.appr + 0.25)}, 0.3);
      // ===== L5 gate ④ display & decode
      out("#lb-g2", ${f(LINES[5].s - 0.25)});
      KIT.cam(tl, ${f(LINES[5].s - 0.25)}, CAMS.g4, 1.0);
      out("#lb-shield, #lb-r1, #lb-r2, #lb-appr, #lb-ok", ${f(LINES[5].s - 0.25)});
      KIT.arm(tl, "g2", ${f(LINES[5].s - 0.2)}, true, 0.6);
      hero(${f(TM.g4 + 0.05)}, 1.1, "m23");
      out("#slot3", ${f(TM.g4)}, 0.2); grow("g3", ${f(TM.g4)});
      KIT.pop(tl, "#lb-g3", ${f(TM.g4n)});
      grow("mon", ${f(TM.g4n + 0.55)});
      KIT.pop(tl, "#lb-mon1", ${f(TM.g4n + 0.9)});
      grow("viewer", ${f(TM.viewer)});
      KIT.pop(tl, "#lb-viewer", ${f(TM.cant)});
      grow("mag", ${f(TM.he)});
      tl.fromTo("#mag-mv", { x: -50, y: 18 }, { x: 80, y: -28, duration: 1.4, ease: "power1.inOut", immediateRender: false }, ${f(TM.he + 0.2)});
      KIT.swap(tl, "#mon-scr", "#mon-scr2", ${f(TM.xl2)}, 0.3);
      out("#lb-mon1, #lb-viewer", ${f(TM.xl2)});
      KIT.pop(tl, "#lb-mon2", ${f(TM.xl2 + 0.25)});
      // ===== L6 gate ⑤ signing: MPC / HSM / multisig, the seal stamps the envelope
      out("#lb-g3", ${f(LINES[6].s - 0.25)});
      KIT.cam(tl, ${f(LINES[6].s - 0.25)}, CAMS.g5, 1.0);
      out("#lb-mon2", ${f(LINES[6].s - 0.25)});
      KIT.arm(tl, "g3", ${f(LINES[6].s - 0.2)}, true, 0.6);
      hero(${f(TM.g5 + 0.05)}, 1.1, "m34");
      out("#slot4", ${f(TM.g5)}, 0.2); grow("g4", ${f(TM.g5)});
      KIT.pop(tl, "#lb-g4", ${f(TM.g5n)});
      grow("seal", ${f(TM.g5n + 0.4)});
      grow("mpc", ${f(TM.mpc)}); KIT.pop(tl, "#lb-mpc", ${f(TM.mpc + 0.3)});
      grow("hsm", ${f(TM.hsm)}); KIT.pop(tl, "#lb-hsm", ${f(TM.hsm + 0.3)});
      [0, 1, 2].forEach((i) => grow("sig" + i, ${f(TM.msig)} + i * 0.12));
      KIT.pop(tl, "#lb-sig", ${f(TM.msig + 0.4)});
      KIT.stamp(tl, "seal", ${f(TM.ren - 0.25)});
      tl.set("#hero-seal", { opacity: 1 }, ${f(TM.ren + 0.41)});
      // ===== L7 gate ⑥ broadcast: tower sends, the envelope flies onto the chain
      out("#lb-g4", ${f(LINES[7].s - 0.25)});
      KIT.cam(tl, ${f(LINES[7].s - 0.25)}, CAMS.g6, 1.0);
      out("#lb-mpc, #lb-hsm, #lb-sig", ${f(LINES[7].s - 0.25)});
      { const og = $("seal").getAttribute("data-ox") + " " + $("seal").getAttribute("data-oy");
        tl.to("#seal", { scaleY: 0, svgOrigin: og, duration: 0.3, ease: "power2.in" }, ${f(LINES[7].s - 0.15)}); }
      tl.set("#seal-mark", { opacity: 0 }, ${f(LINES[7].s + 0.2)});
      KIT.arm(tl, "g4", ${f(LINES[7].s - 0.1)}, true, 0.6);
      hero(${f(TM.g6 + 0.1)}, 1.0, "m45");
      out("#slot5", ${f(TM.g6)}, 0.2); grow("g5", ${f(TM.g6)});
      KIT.pop(tl, "#lb-g5", ${f(TM.g6n)});
      [0, 1, 2, 3].forEach((i) => tl.set("#tower-wave-" + i, { opacity: 0 }, 0));
      grow("tower", ${f(TM.g6n + 0.2)});
      [0].forEach((r) => [0, 1, 2, 3].forEach((i) => { const t0 = ${f(TM.signed)} + r * 0.6 + i * 0.1;
        tl.fromTo("#tower-wave-" + i, { opacity: 0 }, { opacity: 1 - i * 0.2, duration: 0.12, immediateRender: false }, t0);
        tl.to("#tower-wave-" + i, { opacity: 0, duration: 0.2 }, t0 + 0.35); }));
      KIT.arm(tl, "g5", ${f(TM.send - 0.6)}, true, 0.5);
      hero(${f(TM.send)}, 1.0, "toChain");
      out("#hero, #hero-sh", ${f(TM.send + 0.92)}, 0.15);
      [0, 1, 2, 3].forEach((i) => tl.to("#tower-wave-" + i, { opacity: 1 - i * 0.2, duration: 0.12 }, ${f(TM.send - 0.1)} + i * 0.06));
      [0, 1, 2, 3].forEach((i) => tl.to("#tower-wave-" + i, { opacity: 0, duration: 0.25 }, ${f(TM.send + 0.7)}));
      // ===== L8 gate ⑦ on-chain state
      out("#lb-g5", ${f(LINES[8].s - 0.25)});
      KIT.cam(tl, ${f(LINES[8].s - 0.25)}, CAMS.g7, 1.0);
      fadeIn("#chain-hi", ${f(TM.send + 1.0)}, 0.2);
      tl.to("#chain-hi", { opacity: 0.55, duration: 0.5 }, ${f(TM.send + 1.3)});
      out("#slot6", ${f(TM.g7)}, 0.2); grow("g6", ${f(TM.g7)});
      KIT.pop(tl, "#lb-g6", ${f(TM.g7n)});
      KIT.pop(tl, "#acct", ${f(TM.g7n + 0.5)}, 0.3);
      KIT.swap(tl, "#bal0", "#bal1", ${f(TM.chg)}, 0.25);
      fadeIn("#fl-bal", ${f(TM.chg)}, 0.15); tl.to("#fl-bal", { opacity: 0, duration: 0.5 }, ${f(TM.chg + 0.5)});
      fadeIn("#fl-code", ${f(TM.code)}, 0.15); tl.to("#fl-code", { opacity: 0, duration: 0.5 }, ${f(TM.code + 0.55)});
      KIT.pop(tl, "#ch-code", ${f(TM.code + 0.1)});
      fadeIn("#fl-perm", ${f(TM.perm)}, 0.15); tl.to("#fl-perm", { opacity: 0, duration: 0.5 }, ${f(TM.perm + 0.55)});
      KIT.pop(tl, "#ch-perm", ${f(TM.perm + 0.1)});
      // ===== L9 data-source branch: RPC node feeds gate ⑤
      KIT.cam(tl, ${f(LINES[9].s - 0.25)}, CAMS.rpc, 1.1);
      out("#acct, #lb-g6, #lb-chain", ${f(LINES[9].s - 0.25)}, 0.25);
      tl.to("#lb-g4", { opacity: 1, duration: 0.3 }, ${f(LINES[9].s + 0.4)});
      tl.fromTo("#br-mask-p", { attr: { "stroke-dashoffset": ${BRANCH.v1 - BRANCH.v0 + 50} } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.9, ease: "power2.inOut", immediateRender: false }, ${f(TM.br + 0.1)});
      KIT.pop(tl, "#lb-br", ${f(TM.brn)});
      grow("rpc", ${f(TM.read - 0.6)});
      [0, 1, 2].forEach((i) => { const t0 = ${f(TM.read)} + i * 0.55;
        fadeIn("#pk" + i, t0, 0.15);
        follow(t0, 1.6, PATHS.pk, pkAt("pk" + i), "power1.inOut");
        out("#pk" + i, t0 + 1.5, 0.15); });
      [0, 1, 2].forEach((i) => { const t0 = ${f(TM.decide)} + 0.6 + i * 0.55;
        fadeIn("#pk" + i, t0, 0.15);
        follow(t0, 1.6, PATHS.pk, pkAt("pk" + i), "power1.inOut");
        out("#pk" + i, t0 + 1.5, 0.15); });
      KIT.pop(tl, "#lb-rpc", ${f(TM.from)});
      // ===== L10 every arrow is a hand-off of trust
      KIT.cam(tl, ${f(LINES[10].s - 0.3)}, CAMS.over, 1.2);
      out("#lb-br, #lb-rpc", ${f(LINES[10].s - 0.3)});
      for (let i = 0; i < 7; i++) tl.to("#lb-g" + i, { opacity: 1, duration: 0.3 }, ${f(LINES[10].s + 0.2)} + i * 0.06);
      tl.to("#lb-chain", { opacity: 1, duration: 0.3 }, ${f(LINES[10].s + 0.6)});
      const arT = ${f(TM.arrow - 0.2)};
      for (let i = 0; i < 6; i++) {
        const L = +$("ar" + i + "-s").getAttribute("stroke-dasharray").split(" ")[0];
        tl.fromTo("#ar" + i + "-s", { attr: { "stroke-dashoffset": L } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.35, ease: "power2.out", immediateRender: false }, arT + i * 0.14);
        KIT.pop(tl, "#ar" + i + "-h", arT + i * 0.14 + 0.3, 0.2);
      }
      { const L = +$("ar-br-s").getAttribute("stroke-dasharray").split(" ")[0];
        tl.fromTo("#ar-br-s", { attr: { "stroke-dashoffset": L } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.35, ease: "power2.out", immediateRender: false }, arT + 0.9);
        KIT.pop(tl, "#ar-br-h", arT + 1.2, 0.2); }
      for (let i = 0; i < 6; i++) KIT.pop(tl, "#lb-ck" + i, ${f(TM.up)} + i * 0.1);
      KIT.pop(tl, "#lb-ckb", ${f(TM.up)} + 0.6);
      // ===== L11 the whole thing is the signing path
      tl.fromTo("#outline", { attr: { "stroke-dashoffset": ${olLen} } }, { attr: { "stroke-dashoffset": 0 }, duration: 2.2, ease: "power1.inOut", immediateRender: false }, ${f(TM.intent)});
      tl.to("#outline", { attr: { "fill-opacity": 1 }, duration: 0.5 }, ${f(TM.intent + 2.25)});
      KIT.pop(tl, "#lb-path", ${f(TM.path)}, 0.3);
      // ===== L12 the private key lives only at gate ⑤
      KIT.cam(tl, ${f(LINES[12].s - 0.1)}, CAMS.end, 1.1);
      out("#lb-path", ${f(LINES[12].s - 0.1)});
      const dim = ["g0", "g1", "g2", "g3", "g5", "g6", "ledg", "wallet", "shield", "appr", "pod", "mon", "viewer", "mag", "tower", "chain", "chain-hi", "user", "phone", "rpc", "arrows", "lb-g0", "lb-g1", "lb-g2", "lb-g3", "lb-g5", "lb-g6", "lb-chain"];
      out("#lb-ck0, #lb-ck1, #lb-ck2, #lb-ck3, #lb-ck4, #lb-ck5, #lb-ckb", ${f(LINES[12].s + 0.2)}, 0.4);
      tl.to(dim.map((d) => "#" + d).join(","), { opacity: 0.22, duration: 0.6, ease: "power1.inOut" }, ${f(LINES[12].s + 0.2)});
      tl.to("#outline", { attr: { "stroke-opacity": 0.3, "fill-opacity": 0.3 }, duration: 0.6 }, ${f(LINES[12].s + 0.2)});
      fadeIn("#sill", ${f(TM.only - 0.1)}, 0.2);
      grow("lock", ${f(TM.only)});
      KIT.pop(tl, "#lb-key", ${f(TM.only + 0.3)});
      { const og = $("seal").getAttribute("data-ox") + " " + $("seal").getAttribute("data-oy");
        tl.fromTo("#seal", { scaleY: 0, svgOrigin: og }, { scaleY: 1, svgOrigin: og, duration: 0.45, ease: "back.out(1.4)", immediateRender: false }, ${f(TM.fifth2 - 0.2)}); }
      KIT.pop(tl, "#qb", ${f(TM.sign2)}, 0.3);
      KIT.pop(tl, "#lb-goal", ${f(TM.sign2 + 0.2)});
      tl.set({}, {}, ${f(TOTAL)});
      ${termJs(TERMS)}
    window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "bytes");
