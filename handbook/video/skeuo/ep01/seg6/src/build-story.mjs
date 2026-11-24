// seg6「⑥ 今天做一件事」— 生成 compositions/story.html
// 运行：node src/build-story.mjs
// 一个连续的等距世界 + 一台镜头：
//   上方是广场（西北 Bybit 区 · 中央售货机 · 交易之路 · 东南损失长廊 · 东北跨链桥）；
//   广场南边一排四个角色，每人走到自己的小场景做一件事；
//   然后飞回 Bybit 区回答开头的问题；拉远看全景；结束卡。
import fs from "node:fs";
import { G, at, f, Wp, box, cyl, M, toScreen, dashCurve, camAt, worldSvg, gridSvg, wlab, wpin, kitCss, runtimeJs, CHECK, frameTilt, matStr } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
import { VEND, ROAD, GALLERY, BY, SAFE, BROWSER, DOC, SEAL, SIGNERS } from "../../seg1/src/layout.mjs";
import { loadTiming, wordAt as WA, lineAt } from "../../../kit/timing.mjs";

const TM = loadTiming(new URL("../timing.json", import.meta.url));
const TOTAL = TM.total;
const SCRIPT = JSON.parse(fs.readFileSync(new URL("../../script.json", import.meta.url), "utf8"));
const w = (s, o) => WA(TM, s, o).start;
const L = (i) => lineAt(TM, i);

// ------------------------------------------------------------------ helpers
const items = [], ground = [], overlay = [], A = {};
const add = (fn, o, opts, extraY = 0) => { const r = fn(o, opts); items.push({ Y: at(o)[1] + extraY, svg: r.svg }); A[opts.id] = r.anchors; return r; };
const uv = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });
const P = (p) => `${f(p[0])},${f(p[1])}`;
const gstrip = (a, b, wd, fill, stroke = "none") => {
  const du = b.u - a.u, dv = b.v - a.v, l = Math.hypot(du, dv), nu = (-dv / l) * wd / 2, nv = (du / l) * wd / 2;
  const q = [Wp(a.u + nu, a.v + nv), Wp(b.u + nu, b.v + nv), Wp(b.u - nu, b.v - nv), Wp(a.u - nu, a.v - nv)];
  return `<polygon points="${q.map(P).join(" ")}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
};
const scaled = (svg, o, k) => { const g = at(o); return `<g transform="translate(${f(g[0])},${f(g[1])}) scale(${k}) translate(${f(-g[0])},${f(-g[1])})">${svg}</g>`; };
const scP = (o, k, p) => { const g = at(o); return [g[0] + (p[0] - g[0]) * k, g[1] + (p[1] - g[1]) * k]; };

// ------------------------------------------------------------------ 广场（坐标对齐 seg1/src/layout.mjs）
const P0 = { u: 0, v: 0 };
const stripUV = (u0, u1, v, half, fill, stroke) => gstrip({ u: u0, v }, { u: u1, v }, half * 2, fill, stroke);
ground.push(stripUV(ROAD.u0, 1850, ROAD.v, ROAD.half, "#f8f6f1", "#dcd5c8"));
ground.push(stripUV(GALLERY.u0, GALLERY.u1, (GALLERY.v0 + GALLERY.v1) / 2, (GALLERY.v1 - GALLERY.v0) / 2, "#f3efe7", "#d6cfc2"));
// 中央售货机 + 外部合约
add(X.vending, VEND, { id: "pvm" });
[["token", 420], ["dex", 640]].forEach(([kind, du], i) => add(X.miniVend, uv(VEND, du, -80), { id: `pmv${i}`, kind }));
// 跨链桥（东北，路的尽头）
add(X.bridge, { u: 2120, v: ROAD.v }, { id: "pbr" });
// 损失长廊：11 根年份立柱（2016…2026）
for (let i = 0; i < 11; i++) { const po = { u: GALLERY.u0 + 110 + i * ((GALLERY.u1 - GALLERY.u0 - 220) / 10), v: (GALLERY.v0 + GALLERY.v1) / 2 }; const h = 90 + i * 14;
  items.push({ Y: at(po)[1], svg: cyl(po, 0, 0, 22, 0, h, M.white) + cyl(po, 0, 0, 30, h, h + 10, M.plinth) }); }
// Bybit 区（与 seg1 相同的物件与位置）
add(O.safe, SAFE, { id: "bv", plate: "COLD", gold: false, core: "attacker", open: 105 });
const bpage = `<rect x="12" y="54" width="356" height="234" rx="8" fill="#faf8f4"/>
  <text x="34" y="96" font-family="Noto Sans SC, sans-serif" font-size="30" font-weight="900" fill="#1c1c1c">新交易</text>
  <rect x="34" y="114" width="300" height="14" rx="7" fill="#ddd6c9"/><rect x="34" y="140" width="240" height="14" rx="7" fill="#ddd6c9"/><rect x="34" y="166" width="270" height="14" rx="7" fill="#ddd6c9"/>
  <rect x="34" y="208" width="312" height="62" rx="12" fill="#1f9d55"/>
  <text x="190" y="249" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="28" font-weight="900" fill="#ffffff">确认签名</text>`;
add(O.browserWin, BROWSER, { id: "bw", page: bpage });
add(O.doc, DOC, { id: "bdoc", title: "交易" });
{ const r = O.seal(SEAL, { id: "bseal", paper: false, stamped: true }); A.bseal = r.anchors; items.push({ Y: at(DOC)[1] + 1, svg: r.svg.replaceAll("#d93a2f", "#1c1c1c") }); }
SIGNERS.forEach((q, i) => add(O.person, q, { id: `bs${i}`, role: "signer" }));
{ // magnifier: lens just above the core (door open 105°), same placement as seg1
  const MAGZ = 150, lensAt = [A.bv.core[0] + 10, A.bv.core[1] - 70];
  add(O.magnifier, G(lensAt[0], lensAt[1] + (MAGZ + 62 + 110) * 0.866), { id: "bmag", z: MAGZ });
}
// ⑥ 挂牌（L7 立起，在 Bybit 区后方）
add(X.signBoard, { u: BY.u - 120, v: BY.v - 470 }, { id: "b6", style: "plate", text: "⑥ 系统与运营", size: 46, color: "#e0453a", z: 330 });
// 两块木牌（L9 在全景两侧亮起）
add(X.signBoard, { u: -2300, v: -300 }, { id: "wsL", text: "链与基础设施", size: 110 });
add(X.signBoard, { u: 2000, v: 1250 }, { id: "wsR", text: "人、设备和流程", size: 110 });

// ------------------------------------------------------------------ 四个角色
const ROLES = [
  { name: "写合约的人", role: "engineer", color: "#2a9fc6" },
  { name: "做审计的人", role: "signer", color: "#5b7086" },
  { name: "管钱包和运营的人", role: "signer", color: "#3b3e44" },
  { name: "普通用户", role: "signer", color: "#7a6a58" },
];
const PS = 1.85; // person scale → ≈ 200+ px tall on screen
const LX = (i) => -1150 + 330 * i, LY = 1000;               // lineup (canvas px)
const ZP = [[-900, 2700], [1800, 2700], [4500, 2700], [7200, 2700]]; // each role's spot
const MOVE = ROLES.map((_, i) => [f(ZP[i][0] - LX(i)), f(ZP[i][1] - LY)]);
ROLES.forEach((r, i) => add(O.person, G(LX(i), LY), { id: `p${i}`, role: r.role, color: r.color, scale: PS }, ZP[i][1] - LY));

// zone 1 · 写合约的人：不变量 + 找出可能打破它的函数
const Z1 = ZP[0];
add(X.balance, G(Z1[0] + 500, Z1[1] - 50), { id: "z1b", tilt: 6 });
add(X.vending, G(Z1[0] + 1120, Z1[1] - 80), { id: "z1v" });

// zone 2 · 做审计的人：清单 → 几类叠加
const Z2 = ZP[1];
add(X.signBoard, G(Z2[0] + 700, Z2[1] - 220), { id: "z2c4", style: "plate", text: "④ 数据可信度", size: 44 });
add(X.signBoard, G(Z2[0] + 980, Z2[1] - 50), { id: "z2c5", style: "plate", text: "⑤ 经济设计", size: 44 });
{
  const mo = G(Z2[0] + 200, Z2[1] + 50);
  const r = O.magnifier(mo, { id: "z2m", z: 120 });
  items.push({ Y: at(mo)[1] + 1, svg: `<g id="z2m-w" opacity="0">${r.svg}</g>` }); A.z2m = r.anchors;
}

// zone 3 · 管钱包和运营的人：最大资产、私钥、最大损失
const Z3 = ZP[2];
add(O.safe, G(Z3[0] + 960, Z3[1] - 160), { id: "z3s", plate: "VAULT" });
add(O.key, G(Z3[0] + 350, Z3[1] + 50), { id: "z3k", stand: true });

// zone 4 · 普通用户：签名时的屏幕
const Z4 = ZP[3];
const PH = G(Z4[0] + 560, Z4[1] + 10), PHK = 2.2;
{
  const scr = `<rect x="0" y="0" width="76" height="150" fill="#ffffff"/><rect x="0" y="0" width="76" height="24" fill="#ece7dd"/>` +
    `<text x="38" y="17" font-family="Noto Sans SC, sans-serif" font-size="11" font-weight="900" fill="#5f5a50" text-anchor="middle">钱包</text>` +
    `<text x="38" y="52" font-family="Noto Sans SC, sans-serif" font-size="13" font-weight="900" fill="#1c1c1c" text-anchor="middle">签名请求</text>` +
    `<rect x="10" y="64" width="56" height="7" rx="3.5" fill="#ddd6c9"/><rect x="10" y="78" width="42" height="7" rx="3.5" fill="#ddd6c9"/>` +
    `<rect x="8" y="108" width="60" height="28" rx="7" fill="#1d93ba"/><text x="38" y="127" font-family="Noto Sans SC, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">确认签名</text>`;
  const r = O.phone(PH, { id: "z4ph", screen: scr });
  // red dashed frame on the phone body (same tilted frame the phone uses)
  const DEG = Math.PI / 180, W = 86, Hh = 172, tilt = 16;
  const m = frameTilt(PH, -W / 2, -6 - Hh * Math.sin(tilt * DEG), 14 + Hh * Math.cos(tilt * DEG), tilt);
  const fr = `<g id="z4fr" opacity="0" transform="${matStr(m)}"><rect x="-8" y="-8" width="${W + 16}" height="${Hh + 16}" rx="18" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="14 9"/></g>`;
  items.push({ Y: at(PH)[1], svg: scaled(r.svg + fr, PH, PHK) });
  A.z4ph = { top: scP(PH, PHK, r.anchors.top), screen: scP(PH, PHK, r.anchors.screen) };
}

// ------------------------------------------------------------------ labels (world, counter-scaled)
let LB = "";
const lab = (id, p, html, cls = "", anchor = "b") => { LB += wlab(id, p, html, cls + " hide", anchor); };
const up = (p, d) => [p[0], p[1] - d];
const qc = (id, p, txt, anchor = "c", extra = "") => { LB += wpin(id, p, `<div class="qcard ${extra} hide" id="${id}c"><div class="qmark">?</div><div class="qtxt">${txt}</div></div>`, anchor); };
ROLES.forEach((r, i) => { const tp = i % 2 ? up(A[`p${i}`].top, 64) : A[`p${i}`].top; lab(`lp${i}`, tp, r.name, "lab-g"); lab(`lpa${i}`, tp, r.name, "lab-ink"); });
// zone 1
lab("l1-b", A.z1b.top, "不变量");
lab("l1-f", [A.z1b.top[0], A.z1b.top[1] + 4], "余额 ≥ 存款之和", "lab-cs", "t");
lab("l1-r", [A.z1v.buttons[3][0] + 40, A.z1v.buttons[3][1]], "可能打破它", "lab-r", "l");
lab("l1-v", A.z1v.top, "你的合约", "lab-sm");
overlay.push(`<circle id="z1ring" cx="${f(A.z1v.buttons[3][0])}" cy="${f(A.z1v.buttons[3][1])}" r="17" fill="none" stroke="#e0453a" stroke-width="5" opacity="0"/>`);
// zone 2: checklist card
const CL = ["输入校验", "权限修饰器", "重入保护", "溢出检查"];
LB += wpin("cl", [Z2[0] + 1430, Z2[1] - 680], `<div class="clist hide" id="clc"><div class="cl-h">审计清单</div>` +
  CL.map((t, i) => `<div class="cl-r"><div class="cl-b"><div class="cl-on hide" id="clk${i}"><svg width="30" height="30" viewBox="0 0 24 24"><path d="M4 12.5L10 18L20 6" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>${t}</div>`).join("") +
  `<div class="cl-x hide" id="clx">✕ 只打勾不够</div></div>`, "c");
lab("l2-c", [A.z2c4.top[0] + 60, A.z2c4.top[1] - 40], "几类叠加？", "lab-cs", "b");
// zone 3
lab("l3-s", A.z3s.top, "最大的一笔资产", "lab-cs");
lab("l3-k", [A.z3k.top[0], A.z3k.top[1] - 30], "私钥", "lab-sm");
qc("q3a", [Z3[0] + 330, Z3[1] - 560], "私钥在谁手里？", "c");
qc("q3b", [A.z3s.top[0] + 300, A.z3s.top[1] + 60], "被盗最多损失多少？", "l");
// zone 4
lab("l4-ph", up(A.z4ph.top, 20), "签名时看到的屏幕", "lab-sm");
lab("l4-r", [A.z4ph.screen[0] + 160, A.z4ph.screen[1] - 20], "屏幕也可能被篡改", "lab-r", "l");
// Bybit zone
lab("lb-v", A.bv.top, "Bybit 冷钱包 · Safe 多签");
lab("lb-ok", [A.bv.core[0] + 170, A.bv.core[1] - 30], "Safe 合约代码：未见被利用的漏洞", "lab-gs", "l");
lab("lb-pa", [A.bv.core[0] + 170, A.bv.core[1] + 36], "依据：Sygnia、Verichains 分析", "lab-g lab-sm", "l");
lab("lb-fe", up(A.bw.top, 0), "失守：前端与签名界面", "lab-rs");
const QP = [A.bv.top[0] - 240, A.bv.top[1] - 110];
LB += wpin("qb", QP, `<div class="qcard qb hide" id="qbc"><div class="qmark">?</div><div class="qtxt">Safe 合约代码：有漏洞吗？</div></div>`, "b");
const cvEx = dashCurve("cvex", [A.bseal.mark[0] + 6, A.bseal.mark[1] - 30], [A.bv.core[0] - 4, A.bv.core[1] + 8],
  { color: "#2aa3c9", sw: 7, dash: "20 13", c1: [A.bseal.mark[0] + 40, A.bseal.mark[1] - 360], c2: [A.bv.core[0] - 260, A.bv.core[1] - 260] });
overlay.push(cvEx.svg);
{ const [p0, p1, p2, p3] = cvEx.P, t = 0.3, b = (k) => (1 - t) ** 3 * p0[k] + 3 * (1 - t) ** 2 * t * p1[k] + 3 * (1 - t) * t * t * p2[k] + t ** 3 * p3[k];
  lab("lb-ex", [b(0) + 50, b(1) + 10], "忠实执行签下的交易", "lab-cs lab-sm", "l"); }
// L8 comparison strip (screen layer)
const CMP = `<div id="cmp" class="hide"><div class="cmp-c cmp-g">代码 <b>✓</b></div><div class="cmp-c cmp-r">资金 <b>✕</b></div></div>`;

// ------------------------------------------------------------------ cameras
const fit = (Pts, x0, y0, x1, y1) => {
  const xs = Pts.map((p) => p[0]), ys = Pts.map((p) => p[1]);
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  const k = Math.min((x1 - x0) / (bx1 - bx0), (y1 - y0) / (by1 - by0));
  return camAt([(bx0 + bx1) / 2, (by0 + by1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};
const C0 = camAt([LX(1) + 165, LY], 463, 860, 0.64);                  // lineup bottom, plaza above
const zc = (Z, sx, k) => camAt([Z[0], Z[1]], sx, 830, k);
const CZ1 = zc(Z1, 380, 0.75), CZ2 = zc(Z2, 380, 0.75), CZ3 = zc(Z3, 380, 0.75), CZ4 = zc(Z4, 520, 0.75);
const CMID = camAt([3000, 1100], 960, 540, 0.3);                      // fly-over between zone 4 and the Bybit zone
const CB = camAt(Wp(SAFE.u - 220, SAFE.v + 200, 170), 960, 520, 0.82);   // = seg1 CAMS.ask
const CPANO = fit([[A.wsL.ground[0] - 420, A.wsL.top[1]], [A.wsR.ground[0] + 420, A.wsR.ground[1]], A.b6.top, A.pbr.top, A.bs0.ground, [0, at({ u: GALLERY.u0, v: GALLERY.v1 })[1]]], 70, 150, 1850, 880);
const CEND = camAt([(960 - CPANO.x) / CPANO.scale, (540 - CPANO.y) / CPANO.scale], 960, 540, CPANO.scale * 0.92);
const QS = toScreen(CB, QP);
const CAMS = { C0, CZ1, CZ2, CZ3, CZ4, CMID, CB, CPANO, CEND };

// ------------------------------------------------------------------ assemble
const srt = (arr) => arr.slice().sort((a, b) => a.Y - b.Y).map((b) => b.svg).join("\n");
const world = worldSvg("wsvg", gridSvg({ u0: -4000, u1: 9000, v0: -4000, v1: 9000 }) + ground.join("") + srt(items) + overlay.join(""), [-3000, -2500, 12000, 7000]);

const D = (o) => JSON.stringify(o);
const T = {
  l: TM.lines.map((_, i) => L(i).start),
  each: w("每个人"), inv: w("不变量"), brk: w("打破"), fn: w("函数", { line: 1 }),
  tick: w("打勾"), ask2: w("问一问"), stack: w("几类叠加"),
  asset: w("最大的一笔资产"), who: w("私钥在谁手里"), loss: w("最多损失"),
  scene: w("开头那一幕"), screen: w("签名时"), tamper: w("篡改"),
  back: w("回到开头"), safeQ: w("Safe"), bug: w("漏洞", { line: 5 }),
  pa: w("公开分析"), faith: w("忠实"), signed: w("签下"),
  six: w("第六类"), sys: w("系统与运营"), lost: w("失守"), fe: w("前端"),
  pa2: w("公开分析", { line: 8 }), right: w("代码写对了"), money: w("钱照样"),
  why: w("为什么"), notonly: w("不只讲"),
  cats: w("六大类"), detail: w("地图", { line: 10 }), next: w("下一集"),
};

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    .qcard { display: flex; align-items: center; gap: 20px; background: #fffdf8; border: 3px solid #2aa3c9; border-radius: 18px; padding: 14px 26px 16px 18px;
      box-shadow: 0 14px 30px rgba(70, 60, 40, 0.14); white-space: nowrap; }
    .qmark { width: 62px; height: 62px; border-radius: 50%; background: #1d93ba; color: #fff; font-size: 46px; font-weight: 900; line-height: 62px; text-align: center; flex: none; }
    .qtxt { font-size: 36px; font-weight: 900; line-height: 1.25; color: #1c1c1c; }
    .qb .qtxt { font-size: 38px; }
    #qpin { position: absolute; left: 48px; top: 836px; display: inline-flex; align-items: center; gap: 12px; background: #ffffff; border-radius: 18px;
      padding: 8px 22px 10px 10px; font-size: 30px; font-weight: 900; white-space: nowrap; box-shadow: 0 12px 28px rgba(70,60,40,0.16); }
    #qpin .qc-q { width: 44px; height: 44px; border-radius: 50%; background: #1c1c1c; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 30px; flex: none; }
    .clist { width: 420px; background: #fffdf8; border-radius: 16px; padding: 18px 26px 22px; box-shadow: 0 14px 30px rgba(70, 60, 40, 0.14); position: relative; border-top: 8px solid #8a8478; }
    .cl-h { font-size: 30px; font-weight: 700; color: #6d685e; margin-bottom: 8px; }
    .cl-r { display: flex; align-items: center; gap: 16px; height: 58px; font-size: 34px; font-weight: 900; white-space: nowrap; }
    .cl-b { position: relative; width: 42px; height: 42px; border-radius: 9px; border: 4px solid #8a8478; background: #fff; flex: none; }
    .cl-on { position: absolute; inset: -4px; border-radius: 9px; background: #1f9d55; display: flex; align-items: center; justify-content: center; }
    .cl-x { position: absolute; left: 50%; top: 52%; transform: translate(-50%, -50%) rotate(-8deg); font-size: 46px; font-weight: 900; color: #6d685e;
      border: 5px solid #8a8478; border-radius: 12px; padding: 4px 20px 8px; background: rgba(255, 253, 248, 0.92); white-space: nowrap; }
    #cmp { position: absolute; right: 60px; top: 150px; display: flex; flex-direction: column; align-items: flex-end; gap: 18px; }
    .cmp-c { font-size: 52px; font-weight: 900; color: #fff; border-radius: 16px; padding: 8px 34px 12px; white-space: nowrap; box-shadow: 0 10px 24px rgba(70, 60, 40, 0.14); }
    .cmp-c b { font-size: 56px; margin-left: 8px; }
    .cmp-g { background: #1f9d55; } .cmp-r { background: #e0453a; }
    .cmp-n { font-size: 30px; font-weight: 700; color: #6d685e; border: 2px solid #cfc7b8; border-radius: 10px; padding: 4px 16px 6px; background: #fffdf8; white-space: nowrap; }
    #veil { position: absolute; inset: 0; background: #efebe3; opacity: 0; }
    #tveil { position: absolute; inset: 0; background: #efebe3; opacity: 0.82; }
    #tcard .t-main .t-n { color: #1d93ba; }
    #endcard { position: absolute; left: 140px; top: 250px; width: 1640px; background: #fffdf8; border-radius: 28px; box-shadow: 0 18px 40px rgba(70, 60, 40, 0.14);
      text-align: center; padding: 58px 40px 56px; opacity: 0; }
    #endcard .e-main { font-size: 64px; font-weight: 900; line-height: 1.15; white-space: nowrap; color: #1c1c1c; }
    #endcard .e-main .e-ch { color: #1d93ba; }
    #endcard .e-rule { width: 120px; height: 6px; border-radius: 3px; background: #2aa3c9; margin: 34px auto 30px; }
    #endcard .e-sub { font-size: 36px; font-weight: 700; color: #3b3e44; white-space: nowrap; }
    #endcard .e-note { margin-top: 16px; font-size: 40px; font-weight: 900; color: #1d93ba; white-space: nowrap; }
    #endcard .e-next { margin-top: 22px; font-size: 36px; font-weight: 700; color: #3b3e44; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${LB}</div>
      </div>
      ${CMP}
      <div class="hide" id="qpin"><span class="qc-q">?</span><span>有漏洞吗？</span></div>
      ${pills(6, { sections: SCRIPT.sections })}
      <div id="veil"></div>
      <div id="endcard">
        <div class="e-main">${SCRIPT.title}</div>
        <div class="e-rule"></div>
        <div class="e-sub" id="e-sub">六大类 · 攻击面地图 · 能力清单</div>
        <div class="e-note" id="e-note">这就是后面每一集的地图</div>
        <div class="e-next" id="e-next">下一集 · 私钥从哪里来</div>
      </div>
      <div id="tveil"></div>
      <div class="k-title" id="tcard"><div class="t-main"><span class="t-n">⑥</span> ${SCRIPT.segments[5].title}</div><div class="t-sub">合约安全全景 · 收尾</div></div>
    </div>
  </div>
  <script>
${runtimeJs()}
${X.runtimeExtJs()}
  (function () {
    const C = ${D(CAMS)};
    const MV = ${D(MOVE)};
    const T = ${D(T)};
    const tl = gsap.timeline({ paused: true });
    const pop = (sel, t) => KIT.pop(tl, sel, t);
    const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.25, ease: "power2.in" }, t);
    const fin = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.3, ease: "power2.out", immediateRender: false }, t);
    const GROW = [["z1b", T.inv - 0.2], ["z1v", T.l[1] + 0.3], ["z2c4", T.stack - 0.5], ["z2c5", T.stack - 0.25], ["z3s", T.l[3] + 0.3], ["z3k", T.l[3] + 0.5], ["b6", T.six], ["bmag", T.pa - 0.3]];
    GROW.forEach(function (g) { const el = document.getElementById(g[0]); tl.set("#" + g[0], { scaleY: 0, svgOrigin: el.getAttribute("data-ox") + " " + el.getAttribute("data-oy") }, 0); KIT.grow(tl, g[0], g[1]); });
    KIT.camSet(tl, C.C0);

    // ---------------- 段首标题卡 0–1.6
    tl.fromTo("#tcard", { opacity: 0, scale: 0.94, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out", immediateRender: false }, 0);
    tl.to("#tcard", { opacity: 0, scale: 0.97, duration: 0.3, ease: "power2.in" }, 1.35);
    tl.to("#tveil", { opacity: 0, duration: 0.45, ease: "power1.inOut" }, 1.3);

    // ---------------- L0 · 每人一件事
    [0, 1, 2, 3].forEach(function (i) { pop("#lp" + i, T.each + i * 0.15); });

    // ---------------- L1 · 写合约的人
    const t1 = T.l[1] - 0.4;
    KIT.cam(tl, t1, C.CZ1, 1.1);
    tl.to("#p0, #lp0-pin, #lpa0-pin", { x: MV[0][0], y: MV[0][1], duration: 1.1, ease: "power2.inOut" }, t1);
    out("#lp1, #lp2, #lp3", t1, 0.2);
    tl.to("#lp0", { opacity: 0, duration: 0.15 }, T.l[1] + 0.3); pop("#lpa0", T.l[1] + 0.3);
    pop("#l1-v", T.l[1] + 0.7);
    pop("#l1-b", T.inv + 0.1); pop("#l1-f", T.inv + 0.35);
    [0, 1, 2].forEach(function (i) { KITX.press(tl, "z1v", i, T.brk - 1.3 + i * 0.35); });
    KITX.press(tl, "z1v", 3, T.brk - 0.2, "red", 2.4);
    tl.fromTo("#z1ring", { opacity: 0, scale: 1.6, svgOrigin: "${f(A.z1v.buttons[3][0])} ${f(A.z1v.buttons[3][1])}" }, { opacity: 1, scale: 1, svgOrigin: "${f(A.z1v.buttons[3][0])} ${f(A.z1v.buttons[3][1])}", duration: 0.3, ease: "back.out(1.6)", immediateRender: false }, T.brk);
    KITX.tilt(tl, "z1b", T.brk + 0.1, -14, 0.7);
    pop("#l1-r", T.brk + 0.3);

    // ---------------- L2 · 做审计的人
    const t2 = T.l[2] - 0.4;
    KIT.cam(tl, t2, C.CZ2, 1.1);
    tl.to("#p1, #lp1-pin, #lpa1-pin", { x: MV[1][0], y: MV[1][1], duration: 1.1, ease: "power2.inOut" }, t2);
    out("#lpa0, #l1-v, #l1-b, #l1-f, #l1-r", t2, 0.3);
    tl.to("#lp1", { opacity: 0, duration: 0.15 }, T.l[2] + 0.3); pop("#lpa1", T.l[2] + 0.3);
    fin("#z2m-w", T.l[2] + 0.5, 0.3);
    pop("#clc", T.l[2] + 0.4);
    [0, 1, 2, 3].forEach(function (i) { tl.fromTo("#clk" + i, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(1.8)", immediateRender: false }, T.tick - 0.6 + i * 0.22); });
    tl.fromTo("#clx", { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.25, ease: "power3.out", immediateRender: false }, T.ask2 - 0.25);
    pop("#l2-c", T.stack + 0.2);

    // ---------------- L3 · 管钱包和运营的人
    const t3 = T.l[3] - 0.4;
    KIT.cam(tl, t3, C.CZ3, 1.1);
    tl.to("#p2, #lp2-pin, #lpa2-pin", { x: MV[2][0], y: MV[2][1], duration: 1.1, ease: "power2.inOut" }, t3);
    out("#lpa1, #clc, #l2-c", t3, 0.3);
    tl.to("#lp2", { opacity: 0, duration: 0.15 }, T.l[3] + 0.3); pop("#lpa2", T.l[3] + 0.3);
    pop("#l3-s", T.asset);
    pop("#l3-k", T.who - 0.2);
    pop("#q3ac", T.who + 0.1);
    pop("#q3bc", T.loss - 0.3);

    // ---------------- L4 · 普通用户
    const t4 = T.l[4] - 0.4;
    KIT.cam(tl, t4, C.CZ4, 1.1);
    tl.to("#p3, #lp3-pin, #lpa3-pin", { x: MV[3][0], y: MV[3][1], duration: 1.1, ease: "power2.inOut" }, t4);
    out("#lpa2, #l3-s, #l3-k, #q3ac, #q3bc", t4, 0.3);
    tl.to("#lp3", { opacity: 0, duration: 0.15 }, T.l[4] + 0.3); pop("#lpa3", T.l[4] + 0.3);
    pop("#l4-ph", T.screen);
    tl.to("#z4fr", { opacity: 1, duration: 0.12 }, T.tamper - 0.2);
    tl.to("#z4fr", { opacity: 0.25, duration: 0.12 }, T.tamper + 0.1);
    tl.to("#z4fr", { opacity: 1, duration: 0.12 }, T.tamper + 0.3);
    pop("#l4-r", T.tamper + 0.1);

    // ---------------- L5 · 回到开头（飞回 Bybit 区，seg1 L4 同一机位；左下角图钉展开成问号卡）
    const t5 = T.l[5] - 0.5;
    out("#lpa3, #l4-ph, #l4-r", t5, 0.25);
    KIT.cam(tl, t5, C.CMID, 0.8, "power2.in");
    KIT.cam(tl, t5 + 0.8, C.CB, 0.9, "power2.out");
    pop("#qpin", T.back);
    pop("#lb-v", t5 + 1.6);
    out("#qpin", T.safeQ - 0.1, 0.15);
    tl.fromTo("#qbc", { opacity: 0, scale: 0.5, x: ${f(48 + 150 - QS[0])}, y: ${f(866 - QS[1] + 40)}, transformOrigin: "50% 100%" }, { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.6, ease: "power3.out", immediateRender: false }, T.safeQ - 0.15);

    // ---------------- L6 · 公开分析：没有指向代码漏洞；合约忠实执行签下的交易
    out("#qbc", T.pa + 0.6, 0.25);
    pop("#lb-ok", T.pa + 0.5);
    pop("#lb-pa", T.pa + 0.8);
    KIT.draw(tl, "cvex", T.faith - 0.1, 0.9);
    pop("#lb-ex", T.signed);

    // ---------------- L7 · 第六类：系统与运营；失守的是前端和签名界面
    KIT.broke(tl, "bw", T.lost, { ghost: 1, badge: false });
    pop("#lb-fe", T.fe);
    out("#lb-ex, #cvex, #bmag", T.six, 0.25);

    // ---------------- L8 · 代码 ✓ / 资金 ✕
    pop("#cmp", T.right - 0.1);
    KIT.broke(tl, "bv", T.money, { ghost: 1 });

    // ---------------- L9 · 全景 + 两块木牌
    const t9 = T.l[9] - 0.2;
    out("#cmp, #lb-ok, #lb-pa, #lb-fe, #lb-v", t9, 0.3);
    KIT.cam(tl, t9, C.CPANO, 1.4);
    tl.fromTo("#wsL, #wsR", { opacity: 0.25 }, { opacity: 1, duration: 0.4, immediateRender: false }, t9 + 1.2);
    tl.set("#wsL, #wsR", { opacity: 0.25 }, 0);

    // ---------------- L10 · 结束卡
    KIT.cam(tl, T.l[10] - 0.1, C.CEND, 1.0);
    tl.to("#veil", { opacity: 0.74, duration: 0.45, ease: "power1.inOut" }, T.l[10]);
    tl.fromTo("#endcard", { opacity: 0, scale: 0.94, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, T.l[10] + 0.1);
    tl.set("#e-sub, #e-note, #e-next", { opacity: 0 }, 0);
    fin("#e-sub", T.cats, 0.3);
    fin("#e-note", T.detail, 0.3);
    fin("#e-next", T.next, 0.3);
    tl.set({}, {}, ${TOTAL});
    window.__timelines["story"] = tl;
  })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "total", TOTAL, D(T));
