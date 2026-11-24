// arch5a.mjs — seg5a 最后一帧的"完整防御架构全景"，按 seg5a/src/build-story.mjs 的布局与物件照抄，
// 直接烘焙成它的终态（seg5a 段尾：检查站已沉下、设备在位、三个熔断闸刀已拉、三人锁已转、三面旗 + 短旗标签……）。
// 世界坐标与 seg5a 完全相同（u = 480·i 为第 i 层），所以 seg5b 第一帧可以用 seg5a 的 CAM.wide 无缝接上。
import { at, Wp, f, camAt, wlab, dashCurve, badgeSvg } from "../../kit/iso.mjs";
import * as O from "../../kit/objects.mjs";
import * as X from "./objects5a.mjs";

const SP = 480;
export const uS = (i) => SP * i;
const P = (u, v) => ({ u, v });
const W = (u, v, z = 0) => Wp(u, v, z);

export function buildArch() {
  const statics = [];
  const add = (r, o) => { statics.push({ Y: W(o.u, o.v)[1], svg: r.svg }); return r; };
  const dev = {};
  dev.db = add(O.dbLedger(P(uS(0), -150), { id: "d-db" }), P(uS(0), -150));
  dev.is = add(O.hsm(P(uS(1), -150), { id: "d-is" }), P(uS(1), -150));
  dev.pe = add(O.shield(P(uS(2), -150), { id: "d-pe" }), P(uS(2), -150));
  dev.apP = add(O.person(P(uS(3) - 70, -190), { id: "d-apP", role: "signer", scale: 1.0 }), P(uS(3) - 70, -190));
  dev.ap = add(X.approveBtn(P(uS(3) + 50, -140), { id: "d-ap" }), P(uS(3) + 50, -140));
  dev.r1 = add(O.rack(P(uS(4) - 95, -165), { id: "d-r1", tag: "MPC A" }), P(uS(4) - 95, -165));
  dev.r2 = add(O.rack(P(uS(4) + 95, -165), { id: "d-r2", tag: "MPC B" }), P(uS(4) + 95, -165));
  dev.br = add(O.tower(P(uS(5), -150), { id: "d-br" }), P(uS(5), -150));
  dev.ch = add(O.chain(P(uS(6), -150), { id: "d-ch", n: 3 }), P(uS(6), -150));
  const MON = P(2420, -720), BEA = P(2250, -800);
  dev.mc = add(X.cctv(MON, { id: "d-mc" }), MON);
  dev.mb = add(O.beacon(BEA, { id: "d-mb" }), BEA);
  const DESK = P(1280, -820), WALL = P(1600, -520);
  const desk = add(O.desk(DESK, { id: "desk" }), DESK);
  const wall = add(X.wall(WALL, { id: "fw", len: 260, h: 150 }), WALL);
  const BAR1 = P(1650, 0);
  add(X.barrier(BAR1, { id: "bar1", armUp: false }), BAR1); // 段尾：落杆
  const FL1 = P(1500, 330), FL2 = P(420, 400), FL3 = P(300, 610);
  const fl1 = add(X.flag(FL1, { id: "fl1" }), FL1);
  const fl2 = add(X.flag(FL2, { id: "fl2" }), FL2);
  const fl3 = add(X.flag(FL3, { id: "fl3" }), FL3);
  const SWS = 0.65;
  const scaled = (r, o, s) => { const [ox, oy] = at(o); const sc = (q) => [f(ox + (q[0] - ox) * s), f(oy + (q[1] - oy) * s)];
    return { svg: `<g transform="translate(${f(ox)},${f(oy)}) scale(${s}) translate(${f(-ox)},${f(-oy)})">${r.svg}</g>`, anchors: Object.fromEntries(Object.entries(r.anchors).map(([k, v]) => [k, Array.isArray(v) && typeof v[0] === "number" ? sc(v) : v])) }; };
  const SWU = [2500, 2720, 2940], SWV = 420;
  const sws = SWU.map((u, i) => add(scaled(O.knifeSwitch(P(u, SWV), { id: `sw${i}`, text: ["以太坊", "比特币", "Solana"][i], on: false }), P(u, SWV), SWS), P(u, SWV)));
  const CBOX = P(3250, 470);
  const cbox = add(X.ctrlBox(CBOX, { id: "cbox" }), CBOX);
  const HW2 = P(2560, 900), BGL = P(2240, 1020);
  add(O.hotWallet(HW2, { id: "hw2" }), HW2);
  add(X.breakGlass(BGL, { id: "bgl" }), BGL);
  const LCK = P(1720, 800), A1 = P(1540, 960), A2 = P(1890, 1000), A3 = P(1990, 900);
  const lck = add(X.lockPanel(LCK, { id: "lk" }), LCK);
  add(O.person(A1, { id: "at1", role: "attacker", scale: 1.0 }), A1);
  add(O.person(A2, { id: "at2", role: "attacker", scale: 1.0 }), A2);
  add(O.person(A3, { id: "at3", role: "attacker", scale: 1.0 }), A3);

  // lines (drawn — final state)
  const lines = [];
  const deskA = desk.anchors.screen, wallP = at(WALL, 0, 0, 120);
  lines.push(dashCurve("ln-dev", [deskA[0] + 30, deskA[1] + 40], wallP, { hidden: false, c1: [deskA[0] + 60, deskA[1] + 120], c2: [wallP[0] - 40, wallP[1] - 60] }).svg);
  const monA = at(MON, -60, 0, 270);
  lines.push(dashCurve("ln-m1", monA, dev.br.anchors.tip ?? at(P(uS(5), -150), 0, 0, 300), { hidden: false, color: "#2aa3c9", c1: [monA[0] - 120, monA[1] - 120], c2: [W(uS(5), -150, 380)[0] + 120, W(uS(5), -150, 380)[1] - 80] }).svg);
  const rTop = at(P(uS(4) + 95, -165), 0, 0, 340);
  lines.push(dashCurve("ln-m2", monA, rTop, { hidden: false, color: "#2aa3c9", c1: [monA[0] - 300, monA[1] - 330], c2: [rTop[0] + 260, rTop[1] - 260] }).svg);
  const cp = cbox.anchors.port;
  sws.forEach((s, i) => { const tgt = at(P(SWU[i], SWV), 0, 10, 330 * SWS); lines.push(dashCurve(`ln-s${i}`, cp, tgt, { hidden: false, color: "#1d93ba", c1: [cp[0] - 80, cp[1] + 60 + i * 10], c2: [tgt[0] + 60, tgt[1] + 70] }).svg); });
  const bgA = at(BGL, 0, 0, 160), hwA = at(HW2, -60, 0, 120);
  lines.push(dashCurve("ln-bg", bgA, hwA, { hidden: false, color: "#1d93ba", c1: [bgA[0] + 60, bgA[1] - 140], c2: [hwA[0] - 120, hwA[1] - 120] }).svg);
  const wallX = badgeSvg("fw-x", [wallP[0], wallP[1] - 10], 30, 1);

  const under = X.floor(P(0, 0), -420, 3500, -1000, 1340, "floor") + `<g id="road">${X.road(P(0, 0), -380, 3460)}</g>`;
  const over = lines.join("") + wallX;

  // labels visible at seg5a's last frame
  let L = "";
  const lab = (id, p, html, cls = "", anchor = "b") => { L += wlab(id, p, html, cls, anchor); };
  lab("lb-db", dev.db.anchors.top, "账本");
  lab("lb-is", dev.is.anchors.top, "意图签发");
  lab("lb-pe", dev.pe.anchors.top, "策略引擎");
  lab("lb-ap", at(P(uS(3), -150), 0, 0, 250), "审批");
  lab("lb-sg", at(P(uS(4), -165), 0, 0, 380), "签名集群");
  lab("lb-br", dev.br.anchors.top, "广播");
  lab("lb-ch", dev.ch.anchors.top, "链上");
  lab("lb-mon", at(MON, -60, 0, 360), "独立监控");
  lab("lb-fs1", fl1.anchors.tip, `<span class="ok">✓ 挡住</span>Bitget`, "lab-flag lab-fs", "l");
  lab("lb-fs2", fl2.anchors.tip, `<span class="ok">✓ 挡住</span>Bybit`, "lab-flag lab-fs", "l");
  lab("lb-fs3", fl3.anchors.tip, `<span class="ok ip">解读</span>Binance`, "lab-flag lab-fs lab-interp", "l");
  const SWN = ["以太坊", "比特币", "Solana"];
  sws.forEach((s, i) => lab(`lb-swo${i}`, s.anchors.top, SWN[i], "lab-rs"));
  lab("lb-coll", at(LCK, 0, 170, 0), "单人作恶 → 需要多人共谋", "lab-rs", "t");

  const css = `
    .lab-flag { border-color: #e0453a; color: #1c1c1c; flex-direction: column; align-items: flex-start; gap: 4px; padding: 6px 16px 8px; }
    .lab-flag.lab-fs { flex-direction: row; align-items: center; gap: 10px; }
    .lab-flag .ok { background: #1f9d55; color: #fff; border-radius: 8px; padding: 0 10px 2px; }
    .lab-interp .ok.ip { background: #8a8478; }
    .lab-interp { border-color: #b8b0a1; color: #6d685e; }`;
  // static end-state tweaks applied once at load (three-key lock turned, dots red)
  const initJs = `["lk-k0","lk-k1","lk-k2"].forEach(function (id) { KIT.setRot(id, 90); document.getElementById(id).setAttribute("opacity", 1); });
    ["lk-dot0","lk-dot1","lk-dot2"].forEach(function (id) { document.getElementById(id).setAttribute("fill", "#ff4a3d"); });`;

  // the seven layers (for L8: each layer checks again)
  const layers = [
    { id: "d-db", top: dev.db.anchors.top, glow: ["d-db"] },
    { id: "d-is", top: dev.is.anchors.top, glow: ["d-is"] },
    { id: "d-pe", top: dev.pe.anchors.top, glow: ["d-pe"] },
    { id: "d-ap", top: at(P(uS(3), -150), 0, 0, 250), glow: ["d-apP"] },
    { id: "d-sg", top: at(P(uS(4), -165), 0, 0, 380), glow: ["d-r1", "d-r2"] },
    { id: "d-br", top: dev.br.anchors.top, glow: ["d-br"] },
    { id: "d-ch", top: dev.ch.anchors.top, glow: ["d-ch"] },
  ];
  const CAM_WIDE = camAt([1490, -548], 960, 515, 0.54);
  return { statics, under, over, labels: L, css, initJs, layers, CAM_WIDE, P };
}
