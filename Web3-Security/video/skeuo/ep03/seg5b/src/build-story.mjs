// seg5b「⑤ 回滚与Gas · 今天能做什么」— 生成 compositions/story.html
// 运行：node src/build-story.mjs
// 一个连续的等距世界 + 一台镜头：
//   上方：调用链大道（A → B → C，seg5a 的世界）；下方一排三个角色，每人走到自己的小场景做一件事；
//   最右边：seg1 的钩子场景（管理员 + 钓鱼页 + 攻击者合约 + 权限检查关卡 + 金库）；最后结束卡。
import fs from "node:fs";
import { G, at, f, Wp, camAt, toScreen, worldSvg, gridSvg, wlab, wpin, kitCss, runtimeJs, CHECK, dashCurve, C as COL } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { pills } from "../../../kit/pills.mjs";
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
// ground strip between two {u,v} points (width in world units)
const gstrip = (a, b, wd, fill, stroke = "none", extra = "") => {
  const du = b.u - a.u, dv = b.v - a.v, l = Math.hypot(du, dv), nu = (-dv / l) * wd / 2, nv = (du / l) * wd / 2;
  const q = [Wp(a.u + nu, a.v + nv), Wp(b.u + nu, b.v + nv), Wp(b.u - nu, b.v - nv), Wp(a.u - nu, a.v - nv)];
  return `<polygon points="${q.map(P).join(" ")}" fill="${fill}" stroke="${stroke}" stroke-width="2" ${extra}/>`;
};
// ground line a→b (drawable: pathLength 1) with an arrowhead at b
const gline = (id, a, b, color, sw = 9, extra = "") => {
  const du = b.u - a.u, dv = b.v - a.v, l = Math.hypot(du, dv), eu = du / l, ev = dv / l;
  const tip = Wp(b.u, b.v), bb = { u: b.u - eu * 44, v: b.v - ev * 44 };
  const hw = 26, l1 = Wp(bb.u - ev * hw, bb.v + eu * hw), l2 = Wp(bb.u + ev * hw, bb.v - eu * hw);
  return `<g id="${id}" ${extra}><path id="${id}-p" d="M${P(Wp(a.u, a.v))}L${P(Wp(bb.u, bb.v))}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="butt"/>` +
    `<polygon id="${id}-h" points="${P(tip)} ${P(l1)} ${P(l2)}" fill="${color}" opacity="0"/></g>`;
};
// scale a whole object about its ground point (screen-space scale keeps the iso projection)
const scaled = (svg, o, k) => { const g = at(o); return `<g transform="translate(${f(g[0])},${f(g[1])}) scale(${k}) translate(${f(-g[0])},${f(-g[1])})">${svg}</g>`; };

// ------------------------------------------------------------------ 上方：调用链大道（seg5a 的世界）
const RO = G(420, 600);
ground.push(gstrip(uv(RO, -260, 40), uv(RO, 1460, 40), 300, "#f8f6f1", "#dcd5c8"));
const MACH = [["mA", "A", 0], ["mB", "B", 560], ["mC", "C", 1120]];
MACH.forEach(([id, name, du]) => add(X.contractMachine, uv(RO, du, 0), { id, name }));
{ // an envelope travelling along the avenue (between A and B)
  const eo = uv(RO, 280, 90);
  const r = O.envelope(eo, { id: "envA" });
  items.push({ Y: at(eo)[1], svg: r.svg });
}

// ------------------------------------------------------------------ 一排三个角色
const ROLES = [
  { name: "写合约的人", role: "engineer", color: "#2a9fc6" },
  { name: "审计的人", role: "signer", color: "#3b3e44" },
  { name: "做升级的人", role: "signer", color: "#5b7086" },
];
const LX = (i) => 560 + 420 * i, LY = 1030; // lineup (canvas px)
const ZP = [[260, 2240], [2060, 2240], [3860, 2240]]; // each role's spot in its own zone
const MOVE = ROLES.map((_, i) => [f(ZP[i][0] - LX(i)), f(ZP[i][1] - LY)]);
ROLES.forEach((r, i) => add(O.person, G(LX(i), LY), { id: `p${i}`, role: r.role, color: r.color, scale: 1.3 }, ZP[i][1] - LY));

// ------------------------------------------------------------------ zone 1 · 写合约的人：搜 tx.origin
const Z1 = ZP[0];
add(O.laptop, G(Z1[0] + 300, Z1[1] + 40), { id: "z1l", screen: `<rect x="0" y="0" width="222" height="146" fill="#1f2226"/>` +
  `<text x="12" y="30" font-family="JetBrains Mono, monospace" font-size="17" font-weight="700" fill="#9ad9ee">$ grep tx.origin</text>` +
  `<rect x="12" y="50" width="150" height="8" rx="4" fill="#3b3e44"/><rect x="12" y="68" width="110" height="8" rx="4" fill="#3b3e44"/>` +
  `<rect x="8" y="88" width="206" height="22" rx="4" fill="#5a2320"/><text x="14" y="104" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700" fill="#ffb3ab">require(tx.origin…</text>` });

// ------------------------------------------------------------------ zone 2 · 审计的人：每一处 delegatecall，目标地址由谁决定？
const Z2 = ZP[1];
const z2A = G(Z2[0] + 420, Z2[1] - 120), z2B = G(Z2[0] + 980, Z2[1] - 400), z2C = G(Z2[0] + 1040, Z2[1] + 10);
add(X.contractMachine, z2A, { id: "z2a", name: "A" });
add(X.contractMachine, z2B, { id: "z2b", name: "B", tone: "gray" });
add(X.contractMachine, z2C, { id: "z2c", name: "C", tone: "gray" });
const tA = uv(z2A, 150, 0), tB = uv(z2B, -150, 40), tC = uv(z2C, -150, -30);
const tA2 = uv(z2A, 120, 110);
ground.push(gstrip(tA, tB, 70, "#f8f6f1", "#dcd5c8") + gstrip(tA2, tC, 70, "#f8f6f1", "#dcd5c8"));
ground.push(gline("trk1", tA, tB, "#2aa3c9") + gline("trk2", tA2, tC, "#2aa3c9"));
{ // the auditor's magnifier (hovers over each track in turn)
  const mo = uv(tA, (tB.u - tA.u) * 0.5, (tB.v - tA.v) * 0.5);
  const r = O.magnifier(mo, { id: "z2m", z: 120 });
  overlay.push(`<g id="z2m-w" opacity="0">${r.svg}</g>`);
  const m2 = uv(tA2, (tC.u - tA2.u) * 0.5, (tC.v - tA2.v) * 0.5);
  A.z2m = { d: [f(at(m2)[0] - at(mo)[0]), f(at(m2)[1] - at(mo)[1])], mid1: at(mo), mid2: at(m2) };
}

// ------------------------------------------------------------------ zone 3 · 做升级的人：手写前三个槽，再和工具对
const Z3 = ZP[2];
const cabO = G(Z3[0] + 980, Z3[1] - 150);
const cabOpts = { id: "z3cab", n: 5, fill: { 0: [{ bytes: 20, color: "teal" }, { bytes: 1, color: "green" }], 1: [{ bytes: 12, color: "ink" }], 2: [{ bytes: 32, color: "gray" }] } };
add(X.slotCabinet, cabO, cabOpts);

// ------------------------------------------------------------------ 钩子场景（seg1）：管理员 → 钓鱼页 → 攻击者合约 → 权限检查 → 金库
const gO = G(7700, 2000);
ground.push(gstrip(uv(gO, -720, 62), uv(gO, 640, 62), 300, "#f8f6f1", "#dcd5c8"));
add(O.checkpoint, gO, { id: "gate", n: "", armUp: true, road: false });
add(O.safe, uv(gO, 470, 30), { id: "vault", plate: "VAULT" });
add(X.contractMachine, uv(gO, -560, 40), { id: "mX", name: "攻击", state: "attacker" });
const phish = `<rect x="0" y="0" width="222" height="146" fill="#fde6e3"/><rect x="0" y="0" width="222" height="30" fill="#e0453a"/>` +
  `<text x="111" y="22" font-family="Noto Sans SC, sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">领取空投</text>` +
  `<text x="111" y="74" font-family="Noto Sans SC, sans-serif" font-size="26" font-weight="900" fill="#c3352b" text-anchor="middle">+ 5,000</text>` +
  `<rect x="56" y="96" width="110" height="34" rx="8" fill="#e0453a"/><text x="111" y="120" font-family="Noto Sans SC, sans-serif" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">领取</text>`;
const adminO = uv(gO, -1240, -60);
add(O.person, adminO, { id: "adm", role: "signer", scale: 1.3 });
add(O.laptop, uv(gO, -1000, 150), { id: "admL", screen: phish });
add(O.key, uv(adminO, -40, 230), { id: "admK", stand: true });
{ // EIP-7702: a small delegated contract machine grows behind the admin (L6)
  const mo = uv(adminO, -270, -170);
  const r = X.contractMachine(mo, { id: "m7702", name: "7702" });
  items.push({ Y: at(mo)[1], svg: scaled(r.svg, mo, 0.62) });
  const g = at(mo), k = 0.62, sc = (p) => [g[0] + (p[0] - g[0]) * k, g[1] + (p[1] - g[1]) * k];
  A.m7702 = { top: sc(r.anchors.top), center: sc(r.anchors.center) };
  overlay.push(`<path id="l7702" d="M${P(A.adm.center)}Q${P([(A.adm.center[0] + A.m7702.center[0]) / 2 - 60, (A.adm.center[1] + A.m7702.center[1]) / 2 - 20])} ${P(A.m7702.center)}" fill="none" stroke="#2aa3c9" stroke-width="5" stroke-dasharray="12 10" opacity="0"/>`);
}
{ // the attacker's envelope, held in front of the barrier
  const eo = uv(gO, -150, 70);
  const r = O.envelope(eo, { id: "envH", state: "attacker" });
  overlay.push(r.svg);
  A.envH = { top: at(eo, 0, 0, 40) };
}

// ------------------------------------------------------------------ labels (world, counter-scaled)
let LB = "";
const lab = (id, p, html, cls = "", anchor = "b") => { LB += wlab(id, p, html, cls + " hide", anchor); };
const up = (p, d) => [p[0], p[1] - d];
ROLES.forEach((r, i) => { lab(`lp${i}`, A[`p${i}`].top, r.name, "lab-g"); lab(`lpa${i}`, A[`p${i}`].top, r.name, "lab-ink"); });
lab("l0-ch", up(at(uv(RO, 560, 0), 0, 0, 230), 30), "调用链 · A → B → C", "lab-g lab-sm");
// zone 1
lab("l1-l", up(A.z1l.top, 0), "全局搜索", "lab-sm");
// zone 2
lab("l2-a", A.z2a.top, "被审合约");
lab("l2-t1", at(uv(tA, (tB.u - tA.u) * 0.42, (tB.v - tA.v) * 0.42)), `<span style="font-family:'JetBrains Mono',monospace">delegatecall</span>`, "lab-cs lab-sm", "c");
lab("l2-t2", at(uv(tA2, (tC.u - tA2.u) * 0.42, (tC.v - tA2.v) * 0.42)), `<span style="font-family:'JetBrains Mono',monospace">delegatecall</span>`, "lab-cs lab-sm", "c");
LB += wpin("q1", [A.z2b.top[0] + 150, A.z2b.top[1] + 40], `<div class="qcard hide" id="q1c"><div class="qmark">?</div><div class="qtxt">目标地址<br>由谁决定</div></div>`, "l");
LB += wpin("q2", [A.z2c.top[0] + 150, A.z2c.top[1] + 40], `<div class="qcard hide" id="q2c"><div class="qmark">?</div><div class="qtxt">目标地址<br>由谁决定</div></div>`, "l");
// zone 3: the hand-written note + the tool's read-out
const NOTE = [["0 号", "owner · paused"], ["1 号", "fee"], ["2 号", "total"]];
LB += wpin("nt", [Z3[0] + 470, Z3[1] - 500], `<div class="note hide" id="ntc"><div class="nt-h">不看工具 · 先手写</div>` +
  NOTE.map(([a, b], i) => `<div class="nt-r"><div class="nt-w" id="nt${i}"><span class="nt-k">${a}</span>${b}</div><div class="nt-ok hide" id="ntk${i}">${CHECK(`ntki${i}`, 40)}</div></div>`).join("") + `</div>`, "c");
lab("l3-c", A.z3cab.top, "工具读出的存储", "lab-sm");
[0, 1, 2].forEach((i) => lab(`l3-d${i}`, [A.z3cab.drawersOpen[0][0] + 215, A.z3cab.drawersOpen[0][1] - 10 - i * 62], `${NOTE[i][0]} ${NOTE[i][1]}`, "lab-sm", "l"));
lab("l3-ok", [A.z3cab.drawersOpen[0][0] + 215, A.z3cab.drawersOpen[0][1] + 62], "一致 ✓", "lab-gs", "l");
// hook scene
lab("l4-adm", A.adm.top, "管理员", "lab-g");
lab("l4-k", [A.admK.top[0] - 60, A.admK.top[1] + 30], "私钥 ✓ 还在", "lab-gs", "r");
lab("l4-ph", A.admL.top, "钓鱼页面", "lab-r lab-sm");
lab("l4-x", A.mX.top, "攻击者合约", "lab-rs");
lab("l4-v", A.vault.top, "金库", "lab-cs");
lab("l4-g", up(A.gate.top, 0), "权限检查");
lab("l4-env", up(A.envH.top, 10), "调用", "lab-r lab-sm");
LB += wpin("q4", [A.mX.top[0] - 120, A.mX.top[1] - 120], `<div class="qcard hide" id="q4c"><div class="qmark">?</div><div class="qtxt">金库为什么<br>认了攻击者</div></div>`, "r");
// the gate's read-out (what the check asks)
const RD = `<div class="rd hide" id="rdc"><div class="rd-h">权限检查在问<span class="rd-tag hide" id="rd-tag">解读</span></div>
  <div class="rd-s"><div class="rd-row" id="rd1"><div class="rd-q">谁发起的这笔交易？</div><div class="rd-a"><span class="mono">tx.origin</span> → 管理员<span class="rd-x hide" id="rd1x">✗ 问错了</span></div></div>
  <div class="rd-row hide" id="rd2"><div class="rd-q">谁在直接调用我？</div><div class="rd-a"><span class="mono">msg.sender</span> → 攻击者合约<span class="rd-ok hide" id="rd2k">✓ 拦下</span></div></div></div><div class="rd-pre hide" id="l6-pre">前提：权限只认直接调用者</div></div>`;
LB += wpin("rd", at(uv(gO, 330, 420), 0, 0, 0), RD, "t");
lab("l6-m", [A.m7702.top[0] - 20, A.m7702.top[1] - 4], "委托执行代码 · EIP-7702", "lab-sm");
LB += wpin("q6", [A.m7702.top[0] + 40, A.m7702.top[1] - 80], `<div class="qcard qc-t hide" id="q6c"><div class="qmark">?</div><div class="qtxt">人还是合约<div class="qsub"><span class="mono strike">msg.sender == tx.origin</span> 已不可靠</div></div></div>`, "b");

// ------------------------------------------------------------------ cameras
const fit = (Pts, x0, y0, x1, y1) => {
  const xs = Pts.map((p) => p[0]), ys = Pts.map((p) => p[1]);
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  const k = Math.min((x1 - x0) / (bx1 - bx0), (y1 - y0) / (by1 - by0));
  return camAt([(bx0 + bx1) / 2, (by0 + by1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};
const C0 = camAt([980, 640], 960, 560, 0.86);
// zone cameras: put the role's feet at screen (sx, 830)
const zc = (Z, sx, k) => camAt([Z[0], Z[1]], sx, 820, k);
const CZ1 = zc(Z1, 330, 0.95), CZ2 = zc(Z2, 300, 0.9), CZ3 = zc(Z3, 300, 0.9);
const CH = fit([A.adm.top, A.adm.ground, A.admK.ground, A.vault.top, at(uv(gO, 640, 210)), A.mX.top, [A.adm.top[0], A.adm.top[1] - 120]], 140, 150, 1780, 860);
const CH2 = camAt([(960 - CH.x) / CH.scale - 330, (540 - CH.y) / CH.scale - 60], 960, 540, CH.scale); // L6: move left toward the admin
const CEND = camAt([(960 - CH.x) / CH.scale, (540 - CH.y) / CH.scale], 960, 540, CH.scale * 0.86);
const CAMS = { C0, CZ1, CZ2, CZ3, CH, CH2, CEND };

// zone 1 code card (screen layer) + the red dashed link from the hot row to the laptop
const CARD = { x: 960, y: 210 };
const rowY = (i) => CARD.y + 24 + 56 + 50 * i + 25; // c-head 56 + rows 50
const lapS = toScreen(CZ1, A.z1l.screen);
const link1 = dashCurve("lk1", [CARD.x + 6, rowY(1)], [lapS[0] + 40, lapS[1] - 30], { c1: [CARD.x - 120, rowY(1) + 40], c2: [lapS[0] + 120, lapS[1] - 160] });

// ------------------------------------------------------------------ assemble
const srt = (arr) => arr.slice().sort((a, b) => a.Y - b.Y).map((b) => b.svg).join("\n");
const world = worldSvg("wsvg", gridSvg({ u0: -3000, u1: 9000, v0: -3000, v1: 9000 }) + ground.join("") + srt(items) + overlay.join(""), [-1500, -1500, 10000, 5000]);

const D = (o) => JSON.stringify(o);
const T = {
  l0: L(0).start, l1: L(1).start, l2: L(2).start, l3: L(3).start, l4: L(4).start, l5: L(5).start, l6: L(6).start, l7: L(7).start,
  each: w("每个人"), search: w("搜一遍"), txo: w("tx.origin"), confirm: w("确认"), perm: w("权限判断"),
  find: w("找出"), dc: w("delegatecall"), ask: w("问一句"), target: w("目标地址"),
  nolook: w("不看工具"), write: w("写出"), tool: w("工具对"),
  adm: w("管理员", { line: 4 }), key: w("私钥"), vault: w("金库", { line: 4 }), atk: w("攻击者", { line: 4 }),
  wrong: w("问错了"), asked: w("它问的是"), who: w("谁发起"), should: w("该问"), direct: w("直接调用我"),
  pre: w("前提"), human: w("人还是合约"), eip: w("EIP"), simple: w("简单比较"),
  next: w("下一集"),
};

const html = `<template>
  <style>
${kitCss()}
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #sec { position: absolute; left: 56px; top: 32px; }
    .mono { font-family: "JetBrains Mono", monospace; }
    .qcard { display: flex; align-items: center; gap: 20px; background: #fffdf8; border: 3px solid #2aa3c9; border-radius: 18px; padding: 14px 26px 16px 18px;
      box-shadow: 0 14px 30px rgba(70, 60, 40, 0.14); white-space: nowrap; }
    .qmark { width: 62px; height: 62px; border-radius: 50%; background: #1d93ba; color: #fff; font-size: 46px; font-weight: 900; line-height: 62px; text-align: center; flex: none; }
    .qtxt { font-size: 34px; font-weight: 900; line-height: 1.25; color: #1c1c1c; }
    .qsub { margin-top: 6px; font-size: 28px; font-weight: 700; color: #6d685e; }
    .strike { color: #c3352b; text-decoration: line-through; text-decoration-thickness: 4px; }
    .qc-t .qtxt { font-size: 36px; }
    /* zone 1 */
    #card { left: ${CARD.x}px; top: ${CARD.y}px; width: 840px; }
    #card .c-row { overflow: visible; }
    .alt { position: absolute; left: 0; top: 0; }
    .c-green { color: #1f9d55; font-weight: 800; }
    #ring { position: absolute; left: 204px; top: 2px; width: 186px; height: 46px; border: 5px solid #e0453a; border-radius: 50%; }
    #mag { position: absolute; left: 520px; top: 70px; width: 120px; height: 120px; }
    #hit { position: absolute; left: 470px; top: 54px; }
    #chk { position: absolute; left: ${CARD.x}px; top: ${CARD.y + 368}px; display: flex; align-items: center; gap: 18px; background: #fffdf8; border-radius: 16px;
      padding: 14px 26px 16px 18px; box-shadow: 0 10px 24px rgba(70, 60, 40, 0.12); font-size: 34px; font-weight: 900; white-space: nowrap; }
    #chk .bx { position: relative; width: 50px; height: 50px; border-radius: 10px; border: 4px solid #8a8478; background: #ffffff; flex: none; }
    #chk .bx-on { position: absolute; inset: -4px; border-radius: 10px; background: #1f9d55; display: flex; align-items: center; justify-content: center; }
    #chk b { color: #1f9d55; font-size: 40px; }
    /* zone 3 note (hand-written) */
    .note { width: 470px; background: #fffdf8; border-radius: 14px; padding: 18px 26px 18px; box-shadow: 0 14px 30px rgba(70, 60, 40, 0.14);
      background-image: repeating-linear-gradient(#fffdf8 0 58px, #d9e9ef 58px 60px); background-position: 0 66px; transform: rotate(-2deg); }
    .nt-h { font-size: 28px; font-weight: 700; color: #6d685e; height: 62px; line-height: 50px; white-space: nowrap; }
    .nt-r { position: relative; height: 60px; display: flex; align-items: center; }
    .nt-w { font-family: "LXGW WenKai", "Noto Sans SC", sans-serif; font-size: 40px; color: #1c1c1c; white-space: nowrap; clip-path: inset(0 100% 0 0); }
    .nt-k { color: #1d93ba; margin-right: 18px; }
    .nt-ok { position: absolute; right: -6px; top: 8px; }
    /* hook read-out */
    .rd { width: 640px; background: #fffdf8; border-radius: 18px; padding: 18px 26px 20px; box-shadow: 0 14px 30px rgba(70, 60, 40, 0.14); border-top: 8px solid #2aa3c9; }
    .rd-h { font-size: 28px; font-weight: 700; color: #6d685e; white-space: nowrap; display: flex; align-items: center; gap: 14px; }
    .rd-tag { font-size: 24px; color: #6d685e; border: 2px solid #cfc7b8; border-radius: 8px; padding: 0 10px 2px; }
    .rd-s { position: relative; height: 120px; margin-top: 8px; }
    .rd-row { position: absolute; left: 0; top: 0; }
    .rd-q { font-size: 40px; font-weight: 900; white-space: nowrap; }
    .rd-a { margin-top: 6px; font-size: 32px; font-weight: 700; color: #3b3e44; white-space: nowrap; display: flex; align-items: center; gap: 10px; }
    .rd-a .mono { font-size: 30px; color: #17809f; }
    .rd-pre { margin-top: 12px; padding-top: 12px; border-top: 2px dashed #d3ccbf; font-size: 32px; font-weight: 900; color: #1c1c1c; white-space: nowrap; }
    .rd-x, .rd-ok { margin-left: 14px; font-size: 28px; font-weight: 900; color: #fff; border-radius: 8px; padding: 0 12px 2px; }
    .rd-x { background: #e0453a; } .rd-ok { background: #1f9d55; }
    #ovl { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; overflow: visible; pointer-events: none; }
    #veil { position: absolute; inset: 0; background: #efebe3; opacity: 0; }
    #endcard { position: absolute; left: 140px; top: 230px; width: 1640px; background: #fffdf8; border-radius: 28px; box-shadow: 0 18px 40px rgba(70, 60, 40, 0.14);
      text-align: center; padding: 58px 40px 56px; opacity: 0; }
    #endcard .e-main { font-size: 64px; font-weight: 900; line-height: 1.15; white-space: nowrap; color: #1c1c1c; }
    #endcard .e-main .e-ch { color: #1d93ba; }
    #endcard .e-rule { width: 120px; height: 6px; border-radius: 3px; background: #2aa3c9; margin: 34px auto 30px; }
    #endcard .e-next { margin-top: 22px; font-size: 36px; font-weight: 700; color: #3b3e44; white-space: nowrap; }
    #endcard .e-note { font-size: 40px; font-weight: 900; color: #1d93ba; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${LB}</div>
      </div>
      <svg id="ovl" viewBox="0 0 1920 1080" data-layout-ignore>${link1.svg}</svg>
      <div class="k-code hide" id="card">
        <div class="c-head">金库合约<span class="c-tag">卡 A · Solidity</span></div>
        <div class="c-row">function withdraw() external {</div>
        <div class="c-row" id="row1"><span id="r1a" class="alt">    require(<span class="c-red">tx.origin</span> == owner);  <span class="c-red">// ✗</span></span><span id="r1b" class="alt hide">    require(<span class="c-green">msg.sender</span> == owner); <span class="c-green">// ✓</span></span>
          <div id="ring" class="hide"></div><div id="hit" class="hide"><span class="lab lab-rs lab-sm">命中 1 处</span></div></div>
        <div class="c-row c-cm">    ...</div>
        <div class="c-row">}</div>
        <svg id="mag" class="hide" viewBox="0 0 120 120"><circle cx="48" cy="48" r="36" fill="rgba(207,232,241,0.55)" stroke="#2b2d31" stroke-width="9"/>
          <path d="M30 34A22 22 0 0 1 52 24" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M75 75L108 108" stroke="#2b2d31" stroke-width="14" stroke-linecap="round"/></svg>
      </div>
      <div id="chk" class="hide"><div class="bx"><div class="bx-on hide" id="bxon"><svg width="34" height="34" viewBox="0 0 24 24"><path d="M4 12.5L10 18L20 6" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>
        <span>拿 <span class="mono">tx.origin</span> 做权限判断：<b>0</b> 处</span></div>
      <div id="sec"><div class="lab lab-ink hide" id="sec-l">⑤ 回滚与Gas · 今天能做什么</div></div>
      ${pills(5, { sections: SCRIPT.sections })}
      <div id="veil"></div>
      <div id="endcard">
        <div class="e-main">${SCRIPT.title}</div>
        <div class="e-rule"></div>
        <div class="e-note" id="e-note">金库该问的是：谁在直接调用我</div>
        <div class="e-next" id="e-next">下一集 · 重入：最古老、也最常复发的合约漏洞</div>
      </div>
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
    const draw = (sel, t, d) => tl.fromTo(sel, { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: d || 0.6, ease: "power2.inOut", immediateRender: false }, t);
    const GROW = [["p0", 2.2], ["p1", 2.35], ["p2", 2.5], ["z1l", 5.3], ["z2a", 11.5], ["z2b", 11.65], ["z2c", 11.8], ["z3cab", 17.5], ["m7702", T.human - 0.1]];
    GROW.forEach(function (g) { const el = document.getElementById(g[0]); tl.set("#" + g[0], { scaleY: 0, svgOrigin: el.getAttribute("data-ox") + " " + el.getAttribute("data-oy") }, 0); KIT.grow(tl, g[0], g[1]); });
    KIT.camSet(tl, C.C0);
    tl.set("#mag", { x: 0, y: 0 }, 0);

    // ---------------- L0 · 每人一件事
    pop("#sec-l", 0.25);
    pop("#l0-ch", 0.3);
    KITX.spin(tl, "mA", 0.2, 1.6, 0.6, "power2.out");
    [0, 1, 2].forEach(function (i) { pop("#lp" + i, 3.0 + i * 0.12); });

    // ---------------- L1 · 写合约的人
    const t1 = T.l1 - 0.35;
    KIT.cam(tl, t1, C.CZ1, 1.1);
    tl.to("#p0, #lp0-pin, #lpa0-pin", { x: MV[0][0], y: MV[0][1], duration: 1.1, ease: "power2.inOut" }, t1);
    out("#sec-l, #l0-ch", t1, 0.3);
    tl.to("#lp0", { opacity: 0, duration: 0.15 }, T.l1 + 0.2); pop("#lpa0", T.l1 + 0.2);
    out("#lp1, #lp2", t1, 0.2);
    pop("#card", T.l1 + 0.6);
    pop("#l1-l", T.search);
    fin("#mag", T.search + 0.1, 0.2);
    tl.to("#mag", { y: 150, duration: 0.7, ease: "power1.inOut" }, T.search + 0.3);
    tl.to("#mag", { x: -250, y: 10, duration: 0.6, ease: "power2.inOut" }, T.search + 1.05);
    tl.fromTo("#ring", { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.6)", immediateRender: false }, T.txo + 0.1);
    out("#mag", T.txo + 0.3, 0.2);
    pop("#hit", T.txo + 0.35);
    KIT.draw(tl, "lk1", T.txo + 0.45, 0.5);
    // fix: the row is rewritten to msg.sender, checkbox ticks
    pop("#chk", T.confirm);
    out("#ring, #hit, #lk1", T.confirm + 0.75, 0.25);
    KIT.swap(tl, "#r1a", "#r1b", T.confirm + 0.9, 0.35);
    tl.fromTo("#bxon", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.8)", immediateRender: false }, T.perm);

    // ---------------- L2 · 审计的人
    const t2 = T.l2 - 0.4;
    KIT.cam(tl, t2, C.CZ2, 1.1);
    tl.to("#p1, #lp1-pin, #lpa1-pin", { x: MV[1][0], y: MV[1][1], duration: 1.1, ease: "power2.inOut" }, t2);
    out("#card, #chk, #lpa0, #l1-l", t2, 0.3);
    tl.to("#lp1", { opacity: 0, duration: 0.15 }, T.l2 + 0.2); pop("#lpa1", T.l2 + 0.2);
    pop("#l2-a", 12.0);
    fin("#z2m-w", T.find, 0.25);
    draw("#trk1-p", T.dc - 0.1, 0.55); fin("#trk1-h", T.dc + 0.4, 0.15); pop("#l2-t1", T.dc + 0.3);
    tl.to("#z2m-w", { x: ${A.z2m.d[0]}, y: ${A.z2m.d[1]}, duration: 0.55, ease: "power2.inOut" }, T.dc + 0.55);
    draw("#trk2-p", T.dc + 0.75, 0.55); fin("#trk2-h", T.dc + 1.25, 0.15); pop("#l2-t2", T.dc + 1.1);
    out("#z2m-w", T.ask + 0.2, 0.25);
    pop("#q1c", T.target); pop("#q2c", T.target + 0.35);

    // ---------------- L3 · 做升级的人
    const t3 = T.l3 - 0.45;
    KIT.cam(tl, t3, C.CZ3, 1.1);
    tl.to("#p2, #lp2-pin, #lpa2-pin", { x: MV[2][0], y: MV[2][1], duration: 1.1, ease: "power2.inOut" }, t3);
    out("#lpa1, #l2-a, #l2-t1, #l2-t2, #q1c, #q2c", t3, 0.3);
    tl.to("#lp2", { opacity: 0, duration: 0.15 }, T.l3 + 0.2); pop("#lpa2", T.l3 + 0.2);
    pop("#l3-c", 18.0);
    tl.to("#l3-c", { opacity: 0.35, duration: 0.25 }, T.nolook);
    pop("#ntc", T.nolook + 0.2);
    [0, 1, 2].forEach(function (i) { tl.fromTo("#nt" + i, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "none", immediateRender: false }, T.write + 0.05 + i * 0.85); });
    tl.to("#l3-c", { opacity: 1, duration: 0.2 }, T.tool - 0.3);
    [0, 1, 2].forEach(function (i) { KITX.drawer(tl, "z3cab", i, T.tool - 0.25 + i * 0.12, true, 0.5); });
    [0, 1, 2].forEach(function (i) { pop("#l3-d" + i, T.tool + 0.2 + i * 0.1); KITX.mark(tl, "z3cab", i, T.tool + 0.45 + i * 0.15, "green"); pop("#ntk" + i, T.tool + 0.45 + i * 0.15); });
    pop("#l3-ok", T.tool + 0.6);

    // ---------------- L4 · 回到开头
    const t4 = T.l4 - 0.4;
    KIT.cam(tl, t4, C.CH, 1.3);
    out("#lpa2, #l3-c, #l3-d0, #l3-d1, #l3-d2, #l3-ok, #ntc", t4, 0.3);
    KITX.spin(tl, "mX", T.l4 + 0.4, 1.8, -1.2, "power2.out");
    pop("#l4-adm", T.adm); pop("#l4-ph", T.adm + 0.3);
    pop("#l4-k", T.key);
    pop("#l4-v", T.vault); pop("#l4-g", T.vault + 0.2);
    pop("#l4-x", T.atk - 0.3); pop("#l4-env", T.atk);
    pop("#q4c", T.atk + 0.25);

    // ---------------- L5 · 金库问错了问题
    out("#q4c", T.l5 - 0.1, 0.25);
    pop("#rdc", T.wrong - 0.2);
    pop("#rd-tag", T.wrong + 0.3);
    tl.fromTo("#rd1", { opacity: 0 }, { opacity: 1, duration: 0.25, immediateRender: false }, T.asked);
    tl.set("#rd1", { opacity: 0 }, 0);
    pop("#rd1x", T.who + 0.7);
    out("#rd1", T.should - 0.05, 0.2);
    fin("#rd2", T.should + 0.15, 0.25);
    KIT.arm(tl, "gate", T.direct + 0.35, false, 0.5);
    KITX.moveUV(tl, "envH", T.direct + 0.75, -170, 0, 0, 0.5, 30, "power2.out");
    tl.to("#l4-env-pin", { x: ${f(-170 * 0.819)}, y: ${f(170 * 0.287)}, duration: 0.5, ease: "power2.out" }, T.direct + 0.75);
    pop("#rd2k", T.direct + 0.9);

    // ---------------- L6 · 前提与 EIP-7702
    pop("#l6-pre", T.pre);
    KIT.cam(tl, T.human - 0.6, C.CH2, 1.0);
    out("#rdc, #l4-adm, #l4-ph", T.human - 0.6, 0.3);
    tl.to("#l7702", { opacity: 1, duration: 0.3 }, T.human + 0.35);
    pop("#l6-m", T.eip);
    KITX.spin(tl, "m7702", T.eip, 1.2, 1, "power2.inOut");
    pop("#q6c", T.simple - 0.6);

    // ---------------- L7 · 结束卡
    KIT.cam(tl, T.l7 - 0.1, C.CEND, 1.0);
    out("#q6c, #l6-m, #l4-x, #l4-g, #l4-env", T.l7 - 0.1, 0.3);
    tl.to("#veil", { opacity: 0.74, duration: 0.45, ease: "power1.inOut" }, T.l7);
    tl.fromTo("#endcard", { opacity: 0, scale: 0.94, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, T.l7 + 0.1);
    tl.set("#e-next, #e-note", { opacity: 0 }, 0);
    fin("#e-note", T.l7 + 0.5, 0.3);
    fin("#e-next", T.next + 0.9, 0.3);
    tl.set({}, {}, ${TOTAL});
    window.__timelines["story"] = tl;
  })();
  </script>
</template>
`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("wrote compositions/story.html", html.length, "total", TOTAL, D(T));
