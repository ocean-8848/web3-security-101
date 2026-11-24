// ep08「价格集市」shared world layout — one continuous isometric world, fixed for all six segments:
//   import { VEND, LEDGER, GOLD, ROLES, LIQ, AMM, AMM_ALT, DESK, ATK, STALL, TELLER, YOU, FRIEND,
//            ORACLE, TWAP, METER, COIN, CLOCK, DOC, KNIFE, TOWERS, DOCK, PIPE, PIPE_Z, EXT, rect, fit, ZONE_RECTS, CAMS } from "../../shared/layout.mjs";
// (from ep08/segN/src/build-story.mjs). Positions only; ids, states, labels and per-shot opts stay in each segment.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// 借贷合约 (ep01 vending, 全片主角) sits at the world origin.
// Screen-ground (world-canvas px) positions noted as ≈ (x, y) = Wp(u, v, 0).
// Left → right on screen: 左区 AMM + 闪电贷 (x ≈ −2450..−1570) · 中区 借贷合约 (0, 0) · 右区 预言机站 (x ≈ 1380..2930, y ≈ −250)
//   · 远右 L2 码头 (x ≈ 3690..4830, higher, y ≈ −650..−1050); 左前 集市街 (+v of the left zone) sits straight below it (y ≈ 1660).
// Neighbouring zones are ≥ ~1000 canvas px apart edge to edge, so each zone framing in CAMS shows only its own zone,
// and the camera pans between neighbours (left ↔ center ↔ right ↔ dock, left ↕ market).
// Per-object screen bboxes (1920×1080) at each framing are quoted next to CAMS.
import { Wp, camAt } from "../../kit/iso.mjs";

// ---- 中区 · 借贷合约
export const VEND = { u: 0, v: 0 };                     // ep01 vending (200u × 150v × 300z), wlab "借贷合约"; +u face → price pipe, −u face → pool pipe (seg3)
export const LEDGER = { u: -280, v: -120, scale: 0.6 }; // kit ledgerBook "坏账" page, beside the vending's −u side ≈ (−298, 31)
export const GOLD = { u: -130, v: 250 };                // dot pile of lent-out gold in front of the tray (trayOut ≈ (64, 66)) ≈ (37, 140)
export const ROLES = {                                  // seg6 L0: three kit persons in front-right of the vending
  eng: { u: -20, v: 550 },                              // engineer ≈ (299, 231)
  aud: { u: 110, v: 640 },                              // auditor + kit magnifier ≈ (457, 231)
  user: { u: 240, v: 730 },                             // ordinary user (signer) ≈ (615, 230)
};

// ---- 巡场 · 清算机器人 lane: in front (+v) of the vending; liqBot n:3 rows extend toward +u (≈ +220 x, −130 y on screen)
export const LIQ = {
  enter: { u: -1310, v: 300 },                          // off-frame start, left of the center framing ≈ (−901, 499)
  stop: { u: -460, v: 310 },                            // queue head in front of the vending, clear of GOLD and LEDGER ≈ (−199, 259)
  roam: { u: -900, v: 590 },                            // seg6 L6: a bot hovering far off, not approaching ≈ (−399, 500)
};
LIQ.path = [LIQ.enter, LIQ.stop];                       // KITX.walk ground points, enter → stop

// ---- 左区 · AMM 池与闪电贷 (seg2 L18–L25, seg3, seg4 L0), screen-left of the vending
export const AMM = { u: -1790, v: -760 };               // ep08 ammPool (≈ 240 × 130 × 210) ≈ (−1902, 202)
export const AMM_ALT = { u: -1600, v: -460, scale: 0.7 }; // second pool slot, right of the main one (seg3 L20 shallow pool; seg4 L8 "INV") ≈ (−1574, 270)
export const DESK = { u: -2100, v: -1270 };             // ep01 flashDesk (incl. frame:true box), behind-left of the pool ≈ (−2449, 82)
export const ATK = {                                    // kit person attacker; ground stops for KITX.walk
  mid: { u: -2020, v: -850 },                           // between desk and pool (seg2 L18) ≈ (−2142, 231)
  desk: { u: -2200, v: -930 },                          // at the counter's front ≈ (−2336, 250)
  pool: { u: -1790, v: -520 },                          // in front of the pool's hoppers ≈ (−1765, 300)
  vend: { u: 20, v: 380 },                              // at the vending's coin-slot panel (seg2 L20, seg3 L14) ≈ (234, 150)
};
ATK.path = [ATK.desk, ATK.pool, ATK.vend, ATK.pool, ATK.desk]; // seg3 L13–L17 five-step route

// ---- 左前 · 比喻角 集市街 (seg2 L8–L17): in front (+v) of the left zone, straight below it on screen
export const STALL = { u: -3830, v: 1370 };             // ep08 marketStall (≈ 220 × 120 × 275) ≈ (−2352, 1660)
export const TELLER = { u: -3260, v: 1770 };            // ep04 tellerCounter sign "当铺", across the street ≈ (−1655, 1660)
export const YOU = { u: -3660, v: 1740 };               // kit person signer "你", in the street ≈ (−2000, 1762)
export const FRIEND = { u: -4110, v: 1370 };            // kit person engineer "朋友", left of the stall ≈ (−2581, 1740)

// ---- 右区 · 预言机站 (seg1, seg4 L12–L23, seg5 L0–L23, seg6 L7–L11): station row on one baseline, towers behind it
export const ORACLE = { u: 2170, v: 910 };              // ep01 miniVend kind "oracle" + ep04 oracleGhost (same origin) ≈ (2300, −250)
export const TWAP = { u: 1930, v: 520 };                // ep08 twapRecorder, screen-left of the oracle, behind the price pipe ≈ (1879, −341)
export const METER = { u: 2450, v: 1100 };              // ep05 thresholdMeter (LUNA floor), screen-right of the oracle ≈ (2638, −252)
export const COIN = { u: 1880, v: 1050 };               // ep07 oddCoin "cbETH" / "LUNA", front-left of the oracle, in front of the pipe ≈ (2142, −109)
export const CLOCK = { u: 2130, v: 1270 };              // kit clock (heartbeat / 停摆), front-right of the oracle ≈ (2473, −91)
export const DOC = { u: 2400, v: 1410 };                // kit doc "治理提案" (lies flat, ≈ 315 × 165 on screen) lands front-right of the meter (seg1 L0, seg6 L10) ≈ (2775, −111)
export const KNIFE = { u: 1500, v: 540 };               // kit knifeSwitch, left end of the station (toward the contract), just behind the pipe's jog ≈ (1538, −209)
export const TOWERS = [                                 // kit tower ×3 (≈ 210 × 500 on screen), bases just above the station tops
  { u: 2340, v: 50 },                                   // ≈ (1945, −651)
  { u: 2620, v: 250 },                                  // ≈ (2290, −649)
  { u: 2900, v: 440 },                                  // ≈ (2628, −651)
];

// ---- 远右 · L2 码头 (seg5 L24–L31): further +u, higher on screen than the station
export const DOCK = {
  sorter: { u: 4020, v: 1230 },                         // ep01 sorter, plate "排序器"; belt runs +u ≈ (3998, −649)
  beacon: { u: 4340, v: 1380 },                         // kit beacon (sequencer up/down), past the block box ≈ (4347, −679)
  timeLock: { u: 4420, v: 1630 },                       // ep01 timeLock (grace period) ≈ (4556, −600)
  clock: { u: 4680, v: 1620 },                          // kit clock "最长 12 小时" ≈ (4763, −679)
  chain: { u: 4400, v: 520 },                           // kit chain n 3, wlab "L1", behind the sorter ≈ (3903, −1049)
};

// ---- 价格管 & other pipes: ep01 pipe polylines [du, dv, z] relative to the given origin (pipe(origin, { pts }))
export const PIPE_Z = 110;                              // price pipes leave the vending at this height
const J = 1200;                                         // jog: +u out of the vending to u 1200 (≈ (983, −439)), then +v to the station row
export const PIPE = {
  // relative to VEND. → ORACLE −u face ≈ (2254, −329); last run passes in front of KNIFE / TWAP and behind COIN
  oracle: [[100, 0, PIPE_Z], [J, 0, PIPE_Z], [J, ORACLE.v, PIPE_Z], [ORACLE.u - 55, ORACLE.v, PIPE_Z]],
  // relative to VEND. seg4 L1 / seg5 L20: same run, then a −v tee between TWAP and ORACLE into the recorder's front-right
  twap: [[100, 0, PIPE_Z], [J, 0, PIPE_Z], [J, ORACLE.v, PIPE_Z], [TWAP.u + 90, ORACLE.v, PIPE_Z], [TWAP.u + 90, TWAP.v + 60, 70]],
  // relative to VEND. seg3: −u face → −u to u −1500 (≈ (−1229, 335)) → −v to the pool's v → rises over the USDC tank → spot-price dial ≈ (−1890, −19)
  pool: [[-100, 0, PIPE_Z], [-1500, 0, PIPE_Z], [AMM.u + 290, AMM.v, PIPE_Z], [AMM.u + 290, AMM.v, 250], [AMM.u + 15, AMM.v, 250]],
  // relative to DOCK.chain. 强制提交通道 (r 6): chain front → −u behind the sorter → +v → its in-end ≈ (3802, −606)
  force: [[-100, 70, 30], [-660, 70, 30], [-660, DOCK.sorter.v - DOCK.chain.v, 30], [DOCK.sorter.u - DOCK.chain.u - 240, DOCK.sorter.v - DOCK.chain.v, 30]],
};

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 (measured from the kit SVGs).
// [x0, y0, x1, y1]; y0 includes antennas / dials / signs, y1 the front shadow.
export const EXT = {
  vending: [-126, -330, 126, 59], ledgerBook: [-158, -97, 158, 74], person: [-50, -222, 50, 20], liqBot3: [-41, -133, 182, 20],
  ammPool: [-138, -227, 138, 62], flashDesk: [-223, -328, 223, 103], marketStall: [-133, -284, 136, 56], tellerCounter: [-228, -343, 241, 101],
  miniVend: [-72, -290, 72, 34], twapRecorder: [-108, -178, 124, 72], thresholdMeter: [-52, -326, 52, 26], oddCoin: [-40, -120, 41, 19],
  clock: [-75, -203, 61, 2], knifeSwitch: [-153, -344, 133, 48], doc: [-155, -80, 160, 85], tower: [-106, -450, 106, 53],
  sorter: [-211, -296, 257, 82], beacon: [-64, -142, 64, 32], timeLock: [-68, -182, 69, 30], chain: [-217, -173, 217, 86],
};
// rect(o, kind, scale) → world-canvas bbox [x0, y0, x1, y1] of that object standing at o
export const rect = (o, kind, scale = o.scale ?? 1) => { const [X, Y] = Wp(o.u, o.v); const e = EXT[kind]; return [X + e[0] * scale, Y + e[1] * scale, X + e[2] * scale, Y + e[3] * scale]; };
// fit(rects, screenRect, kmax) → camera {x, y, scale} for KIT.cam / KIT.camSet, fitting the union of rects into screenRect (same as ep07 seg1)
export const fit = (rects, [x0, y0, x1, y1], kmax = 1.4) => {
  const X0 = Math.min(...rects.map((r) => r[0])), Y0 = Math.min(...rects.map((r) => r[1]));
  const X1 = Math.max(...rects.map((r) => r[2])), Y1 = Math.max(...rects.map((r) => r[3]));
  const k = Math.min(kmax, (x1 - x0) / (X1 - X0), (y1 - y0) / (Y1 - Y0));
  return camAt([(X0 + X1) / 2, (Y0 + Y1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};

// key objects per zone (the rects each framing must hold)
export const ZONE_RECTS = {
  center: [rect(VEND, "vending"), rect(LEDGER, "ledgerBook"), rect(LIQ.stop, "liqBot3")],
  left: [rect(AMM, "ammPool"), rect(DESK, "flashDesk"), rect(ATK.mid, "person"), rect(AMM_ALT, "ammPool")],
  market: [rect(STALL, "marketStall"), rect(TELLER, "tellerCounter"), rect(YOU, "person"), rect(FRIEND, "person")],
  right: [rect(KNIFE, "knifeSwitch"), rect(TWAP, "twapRecorder"), rect(ORACLE, "miniVend"), rect(METER, "thresholdMeter"), rect(COIN, "oddCoin"), rect(CLOCK, "clock"), rect(DOC, "doc")],
  roles: Object.values(ROLES).map((p) => rect(p, "person")),
  towers: TOWERS.map((t) => rect(t, "tower")),
  dock: [rect(DOCK.sorter, "sorter"), rect(DOCK.beacon, "beacon"), rect(DOCK.timeLock, "timeLock"), rect(DOCK.clock, "clock"), rect(DOCK.chain, "chain")],
};
const Z = ZONE_RECTS;
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur). fit() puts the listed rects into the given screen rect
// (inside x 60–1860, y 160–860; top-left term card and top-right pills / event cards kept clear where possible).
// Screen bboxes below are [x0, y0, x1, y1] on the 1920×1080 frame.
export const CAMS = {
  // k 0.92 · vending 847,300–1079,658 · ledger 601,579–776,673 · liqBot ×3 at LIQ.stop 742,719–947,860; x > 1240 free for code cards A / B
  center: fit(Z.center, [460, 300, 1220, 860], 1.4),
  // k 0.92 · same plus ROLES: engineer 1054,612–1146,834 · auditor 1199–1291 · user 1345–1437 (seg6 L0–L6)
  centerWide: fit([...Z.center, ...Z.roles], [200, 300, 1700, 860], 1.4),
  // k 1.04 · flashDesk 352,280–814,727 · attacker (ATK.mid) 848,544–952,795 · ammPool 1006,509–1292,808 · AMM_ALT 1388,650–1588,860
  left: fit(Z.left, [300, 280, 1640, 860], 1.4),
  // k 1.42 · close-up: ammPool 760,339–1153,750 · AMM_ALT 1285,533–1560,821 (attacker at ATK.mid 544,387; desk cut off at the left edge)
  pool: fit([rect(AMM, "ammPool"), rect(AMM_ALT, "ammPool")], [760, 320, 1560, 840], 1.6),
  // k 1.20 · friend 228,542–348,833 · marketStall 404,371–728,780 · 你 927,569–1047,860 · 当铺 1128,300–1692,834
  market: fit(Z.market, [200, 300, 1720, 860], 1.4),
  // k 0.98 · knife 202,344–482,728 · twap 580,378–807,623 · oracle 1026,358–1167,674 · meter 1376,320–1478,664
  //   · coin 903,661–983,797 · clock 1193,598–1326,799 · doc 1409,699–1718,860; tower legs show above y ≈ 300 (whole towers: CAMS.nodes)
  right: fit(Z.right, [120, 320, 1800, 860], 1.4),
  // k 1.11 · close-up: twap 273,363–531,641 · oracle 779,340–939,699 · coin 641,684–730,838 · clock 969,613–1120,840 · meter 1177,297–1292,688
  //   (seg1 L0–L3, seg6 L7–L9; x > 1300 free under the event card)
  oracle: fit([rect(ORACLE, "miniVend"), rect(COIN, "oddCoin"), rect(CLOCK, "clock")], [580, 340, 1180, 840], 1.6),
  // k 0.68 · towers 760..1350, y 170–513 · knife 369,544–564,811 · twap 632,567 · oracle 943,553–1041,773 · meter 1187,527–1258,766 (seg4 L12–L16, seg5 L20)
  nodes: fit([rect(TWAP, "twapRecorder"), rect(ORACLE, "miniVend"), rect(METER, "thresholdMeter"), rect(COIN, "oddCoin"), rect(CLOCK, "clock"), ...Z.towers], [160, 170, 1760, 860], 1.4),
  // k 1.10 · oracle 705,363–864,720 · clock 893,634–1043,860 · meter 1100,320–1215,708; right half free for LUNA cards (seg5 L5–L11)
  meter: fit([rect(ORACLE, "miniVend"), rect(METER, "thresholdMeter"), rect(CLOCK, "clock")], [560, 320, 1360, 860], 1.6),
  // k 0.89 · L1 chain 456,280–840,509 · sorter 546,525–961,860 · beacon 985,635–1098,789 · timeLock 1166,670–1288,857 · clock 1344,581–1464,763
  dock: fit(Z.dock, [200, 280, 1720, 860], 1.4),
  // k 0.63 · desk 80,420 … pool 477,559–651,741 … vending 1681,368–1840,612 (seg3 L12–L18 five-step route)
  leftCenter: fit([...Z.left, ...Z.center], [80, 280, 1840, 860], 1.4),
  // k 0.53 · vending 221,475–354,680 … knife 1021,357–1172,564 … oracle 1466,364–1542,535 … meter 1656–1711 (seg2 L1 price pipe, seg5 L31 knife + bots)
  centerRight: fit([...Z.center, ...Z.right], [80, 280, 1840, 860], 1.4),
  // k 0.32 · left + center + right with towers, market just off the bottom edge (seg1 L11 three labels)
  wide: fit([...Z.left, ...Z.center, ...Z.right, ...Z.towers], [60, 200, 1860, 880], 1),
  // k 0.23 · every zone incl. 集市街 (bottom-left) and L2 码头 (top-right) (seg6 L11 全景)
  world: fit([...Z.left, ...Z.market, ...Z.center, ...Z.right, ...Z.towers, ...Z.dock], [60, 180, 1860, 860], 1),
};
