// Generates compositions/story.html for ep29/seg1 (one isometric world, one camera).
// Objects come from the shared skeuomorphic kit (../../kit). Run: node src/build-story.mjs
// Static geometry is baked into the HTML so the HyperFrames desktop app can edit it.
import fs from "node:fs";
import {
  G, at, Wp, f, pts, box, M, faceTop, camAt, toScreen, gridPath, isoDefs, wireSvg, edges,
  pinAt, wlab, wpin, BADGE, CHECK, bezLen, kitCss, runtimeJs, CA, SA, SE,
} from "../../kit/iso.mjs";
import { safe, laptop, hwWallet, padlock, browserWin, bucket, envelope, person, checkpoint } from "../../kit/objects.mjs";
import { pills } from "../../kit/pills.mjs";
import { termCards, termJs } from "../../kit/terms.mjs";
// 术语卡（2026-11-15 第二轮返工）：时间按旧时间（= timing_old），revoice.py 按句拉伸
const TERMS = [
  { id: "tc1", t1: "实现合约", t2: "提供代码逻辑的合约", t0: 27.77, t1s: 31.15, left: 890, top: 84 },
];

const sc = (o, k, inner) => { const [x, y] = at(o); return `<g transform="translate(${f(x)},${f(y)}) scale(${k}) translate(${f(-x)},${f(-y)})">${inner}</g>`; };

// ---------- world layout (world-canvas px of each object's ground centre)
const B = G(700, 640);                 // Safe{Wallet} browser window
const S3 = G(440, 650);                // S3 bucket left of the browser
const S = [G(1040, 770), G(1510, 830), G(1980, 890)]; // signer stations
const HUB = G(2300, 830);
const V = G(2700, 760);                // the cold-wallet safe
const GATE_N = ["业务意图", "请求构造", "风控与审批", "显示与解码", "签名", "广播", "链上状态"];
const NUM = ["①", "②", "③", "④", "⑤", "⑥", "⑦"];
const G0 = G(1000, 1000);
const GSP = 330;
const GT = GATE_N.map((_, i) => ({ u: G0.u + i * GSP, v: G0.v }));

// ---------- objects (each collected with its ground Y for painter's order)
const items = [];
const add = (o, svg) => items.push({ y: at(o)[1], svg });

// browser + S3 bucket (normal and tampered copies, crossfaded at 33.81)
const brw = browserWin(B, { id: "brw" });
add(B, brw.svg + `<g id="brw-hint" opacity="0">${wireSvg("brw-hint-p", B, [[-196, 196, -20, 20, 8, 320]], { sw: 2.5, dash: "10 8" })}</g>`);
const s3 = bucket(S3, { id: "s3" });
const s3r = bucket(S3, { id: "s3r", state: "attacker" });
add(S3, s3.svg + `<g id="s3r-w" opacity="0">${s3r.svg}</g>`);

// signer stations: person + laptop + hardware wallet + padlock with key
const lapScreen = (i) => `<rect x="0" y="0" width="222" height="146" fill="#cfc9be"/>
  <rect id="scr-on-${i}" opacity="0" x="0" y="0" width="222" height="146" fill="#ffffff"/>
  <g id="ui-${i}" opacity="0">
    <rect x="0" y="0" width="222" height="28" fill="#ece7dd"/>
    <text x="10" y="20" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="#5f5a50">Safe{Wallet}</text>
    <rect id="btn-${i}" x="118" y="108" width="94" height="30" rx="7" fill="#c9c3b7"/>
    <text x="165" y="129" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="18" font-weight="900" fill="#ffffff">确认</text>
  </g>
  <g id="ui2-${i}" opacity="0"><text x="12" y="60" font-family="Noto Sans SC, sans-serif" font-size="24" font-weight="900" fill="#1c1c1c">操作：转账</text></g>
  <g id="ui3-${i}" opacity="0"><rect x="8" y="72" width="150" height="30" rx="7" fill="#e3f4ea"/>
    <text x="18" y="94" font-family="Noto Sans SC, sans-serif" font-size="20" font-weight="900" fill="#1f9d55">✓ 看起来正常</text></g>`;
const lap = [], lock = [];
for (let i = 0; i < 3; i++) {
  const o = S[i], rel = (du, dv) => ({ u: o.u + du, v: o.v + dv });
  const pO = rel(-215, 40), hO = rel(0, 140), kO = rel(215, -40);
  add(pO, person(pO, { id: "sgr-" + i, role: "signer", scale: 1.0 }).svg);
  lap[i] = laptop(o, { id: "lap" + i, screen: lapScreen(i) });
  add(o, lap[i].svg);
  add(hO, sc(hO, 0.55, hwWallet(hO, { id: "hw" + i, screenText: "确认?" }).svg));
  lock[i] = padlock(kO, { id: "pl" + i });
  add(kO, lock[i].svg);
}

// the cold wallet: kit safe; gold bars drawn by us (so each bar can fly out) inside the cavity clip
const vault = safe(V, { id: "v", plate: "COLD", gold: false });
const BAR = { l: 56, w: 26, h: 16 };
const BARS = [
  [-103, 50, 42], [-41, 50, 42], [21, 50, 42], [-103, 78, 42], [-41, 78, 42], [21, 78, 42], [-72, 64, 58], [-10, 64, 58],
  [-99, 68, 180], [-37, 68, 180], [-75, 68, 196],
];
const barBox = (b) => box(V, b[0], b[0] + BAR.l, b[1], b[1] + BAR.w, b[2], b[2] + BAR.h, M.gold, 1.2);
const goldIn = `<g clip-path="url(#v-cav-c)">${BARS.map((b, i) => `<g id="gold-${i}">${barBox(b)}</g>`).join("")}</g>`;
const goldFly = BARS.map((b, i) => `<g id="goldf-${i}" opacity="0">${barBox(b)}</g>`).join("");
const vIdx = vault.svg.indexOf('<g id="v-door"');
add(V, vault.svg.slice(0, vIdx) + goldIn + vault.svg.slice(vIdx));
const coreP = vault.anchors.core;

// envelope hub
const hubP = at(HUB, 0, 0, 60);

items.sort((a, b) => a.y - b.y);
const objSvg = items.map((x) => x.svg).join("\n") + goldFly;

// ---------- gates (chapter road): kit checkpoints along one long road
const roadU0 = -320, roadU1 = 6 * GSP + 320;
let road = `<polygon points="${pts([at(G0, roadU0, -86), at(G0, roadU1, -86), at(G0, roadU1, 210), at(G0, roadU0, 210)])}" fill="#f8f6f1" stroke="#dcd5c8" stroke-width="2"/>`;
for (let u = roadU0 + 20; u < roadU1 - 60; u += 130) road += `<polyline points="${pts([at(G0, u, 62), at(G0, u + 70, 62)])}" stroke="#d3ccbf" stroke-width="4" stroke-linecap="round"/>`;
let gates = "";
for (let i = 6; i >= 0; i--) gates += checkpoint(GT[i], { id: "g" + i, n: NUM[i], road: false }).svg;
const gAnch = GT.map((o, i) => checkpoint(o, { id: "tmp" + i, n: NUM[i], road: false }).anchors);

// ---------- cameras: screen = k * world + (x, y)
const vMid = at(V, 0, 0, 170);
const CAM = {
  c1: camAt(vMid, 840, 560, 1.12),
  c1b: camAt(vMid, 840, 560, 1.24),
  c2: camAt([1500, 700], 980, 560, 0.98),
  c3: camAt(lap[1].anchors.screen, 1180, 480, 1.6),
  c45: camAt(at(V, 60, 0, 170), 1150, 590, 0.85),
  c6: camAt([1700, 650], 960, 520, 0.6),
  c8: camAt(at(GT[3]), 880, 935, 0.85),
  c7: camAt(at(G0), 250, 880, 0.8),
};

// ---------- HTML pins in world-canvas space
const BUCKET = `<svg width="40" height="34" viewBox="0 0 40 34"><path d="M8 10C12 4 28 4 32 10" fill="none" stroke="#2aa3c9" stroke-width="3"/><ellipse cx="20" cy="11" rx="15" ry="5" fill="#d9eff6" stroke="#2aa3c9" stroke-width="3"/><path d="M5 11L9 30Q20 34 31 30L35 11" fill="#d9eff6" stroke="#2aa3c9" stroke-width="3" stroke-linejoin="round"/></svg>`;
// small iso envelope as an inline svg centred on (0,0), so it can be moved as a pin
const envSvg = (id, red, w = 84) => {
  const e = envelope({ u: 0, v: 0 }, { id, state: red ? "attacker" : "normal", w, h: Math.round(w * 0.66) });
  return `<svg class="envsvg" width="1" height="1" viewBox="0 0 1 1" style="overflow:visible">${e.svg}</svg>`;
};
let objPins = "";
objPins += wlab("l-brw", brw.anchors.top, "Safe{Wallet} 网页", "");
objPins += wlab("l-s3", brw.anchors.top, `${BUCKET}<span>前端 JS · 托管在 AWS S3</span>`, "stk1 hide");
objPins += pinAt("bdg-brw-pin", brw.anchors.center, `<div class="wl"><div class="ctr a-c">${BADGE("bdg-brw", 76, "hide")}</div></div>`);
objPins += wlab("l-js", at(B, 0, 14, 352), "篡改的 JS 只针对 Bybit 冷钱包", "lab-r stk2 hide");
objPins += wlab("l-vault", vault.anchors.top, "Bybit 冷钱包 · Safe 多签", "");
objPins += wlab("l-impl", vault.anchors.coreLabel, "实现合约（锁芯）", "lab-cs hide", "t");
objPins += wlab("l-atk", vault.anchors.coreLabel, "攻击者合约", "lab-rs hide", "t");
objPins += wlab("l-sign", at(S[1], 0, -80, 250), "签名人（示意）", "hide");
for (let i = 0; i < 3; i++) objPins += wpin(`lk-ck-${i}`, at(S[i], 245, -40, 120), CHECK(`lk-ck-${i}-b`, 40, "hide"), "c");
objPins += wlab("l-key", at(S[0], 215, -40, 190), "私钥 · 未泄露", "lab-gs hide", "b");
objPins += wlab("l-key2", at(S[1], 0, 230, 0), "钥匙 ✓ 一直安全", "lab-gs hide", "t");
const envStart = S.map((o) => at(o, 0, -75, 230));
for (let i = 0; i < 3; i++) {
  objPins += pinAt(`env-pin-${i}`, envStart[i], `<div class="envw" id="env-${i}" style="opacity:0">${envSvg("e" + i, false)}<div class="env-red" style="opacity:0">${envSvg("er" + i, true)}</div></div>`);
}
objPins += pinAt("hubx-pin", hubP, `<div class="ctr a-c"><svg id="hubx" class="hide" width="104" height="104" viewBox="0 0 20 20"><path d="M3 3L17 17M17 3L3 17" stroke="#e0453a" stroke-width="2.4" stroke-linecap="round"/></svg></div>`);
objPins += wlab("l-file", at(HUB, 0, 0, 150), "文件 ✗ 被换了", "lab-rs hide");

let gatePinsHtml = "";
GT.forEach((o, i) => { gatePinsHtml += wlab(`l-g${i}`, gAnch[i].top, `<span class="gn">${NUM[i]}</span>${GATE_N[i]}`, "lab-g hide"); });
const genvStart = at(G0, -280, 62, 20);
gatePinsHtml += pinAt("genv-pin", genvStart, `<div class="envw" id="genv" style="opacity:0">${envSvg("ge", false, 96)}</div>`);

const SVGBOX = [-1500, -1600, 6000, 3600];
const wsvg = (id, content) => `<svg id="${id}" class="wsvg" width="${SVGBOX[2]}" height="${SVGBOX[3]}" viewBox="${SVGBOX.join(" ")}" style="left:${SVGBOX[0]}px;top:${SVGBOX[1]}px">${content}</svg>`;

// ---------- screen-space curve: operation row -> the (opened) lock core
const P0 = [600, 441];
const E = toScreen(CAM.c45, coreP);
const P1 = [P0[0] + 300, P0[1] + 200];
const P2 = [E[0] - 260, E[1] + 40];
const L = bezLen(P0, P1, P2, E);
const curveD = `M${pts([P0])}C${pts([P1])} ${pts([P2])} ${pts([E])}`;

const K = {
  CAM, P0, P1, P2, E, L,
  hub: hubP, envStart,
  gateOrigins: GT.map((o) => at(o)),
  genvStart, gstep: [CA, -SA * SE],
  objCentre: [1750, 700],
};

let dots = "";
for (let i = 0; i < 15; i++) {
  const c = i % 5, r = Math.floor(i / 5);
  const st = `left:${150 + c * 76}px;top:${150 + r * 76}px`;
  dots += `<i class="slot" style="${st}"></i><i class="dot" id="dot-${i}" style="${st}"></i>`;
}
const curveSvg = `<svg id="curve" width="1920" height="1080" viewBox="0 0 1920 1080">
        <defs><mask id="cv-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
          <path id="cv-mpath" d="${curveD}" fill="none" stroke="#ffffff" stroke-width="16" stroke-dasharray="${L} ${L}" stroke-dashoffset="${L}"/></mask></defs>
        <path d="${curveD}" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 9" stroke-linecap="round" mask="url(#cv-mask)"/>
        <circle id="cv-dot" class="hide" cx="${f(P0[0])}" cy="${f(P0[1])}" r="8" fill="#e0453a"/>
        <circle id="cv-end" class="hide" cx="${f(E[0])}" cy="${f(E[1])}" r="16" fill="none" stroke="#e0453a" stroke-width="4"/>
      </svg>`;

const tpl = fs.readFileSync(new URL("./story.tpl", import.meta.url), "utf8");
const out = tpl
  .replace("/*KITCSS*/", () => kitCss())
  .replace("<!--GRIDSVG-->", () => wsvg("grid-svg", `<path d="${gridPath(-3400, 4800, -2600, 4200, 80)}" stroke="#e2ddd3" stroke-width="2" fill="none"/>`))
  .replace("<!--GATESVG-->", () => wsvg("gate-svg", `${isoDefs()}<g id="road-g" opacity="0">${road}</g>${gates}`))
  .replace("<!--OBJSVG-->", () => wsvg("obj-svg", `${isoDefs()}${objSvg}`))
  .replace("<!--OBJPINS-->", () => objPins)
  .replace("<!--GATEPINS-->", () => gatePinsHtml)
  .replace("<!--CURVE-->", () => curveSvg)
  .replace("<!--FLYENV-->", () => envSvg("fe", true, 90))
  .replace("<!--DOTS-->", () => dots)
  .replace("<!--PILLS-->", () => termCards(TERMS) + pills(1))
  .replace("/*TERMS*/", () => termJs(TERMS))
  .replace("/*KITJS*/", () => runtimeJs())
  .replace("/*K*/", () => `const K = ${JSON.stringify(K)};`);
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), out);
console.log("wrote compositions/story.html", out.length, "curve L", L, "E", E.map(f), "core", coreP.map(f));
