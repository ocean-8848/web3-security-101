// ep13「五关大道」shared world layout — one continuous isometric world, fixed for all six segments:
//   import { ROAD, GATES, SIGNS,
//            VEND, SLOT, PARCEL_A, MINI_A, APIPE,
//            MACH, STATELESS, PASS, SIGNER, ATK_B, MINT_B, PROOF_B,
//            CHAIN_P, ROOT, ROPE, ATK_CASH, ODD_CASH, DOTS_CASH, ANCHOR_SHIELD, DMETER, SIGS, DGLASS, DLOCK,
//            PARCEL_C, DUP_C, VERIF, POOL, MANUAL, BYTE, DISP, CERT, ATK_C, ICE, ICE_DOTS,
//            CORE, KEYCARD, UKEY, ULOCK, UMSIG,
//            CTR, BTC, IDX, MEMPOOL, LCLOCK, LLETTER, LMETER, LMINT, LBAL, DOTS_LBTC,
//            CH1, CH2, CSEAL, CPROOF, CDOC, CTAG, ESCROW, NODES, NCLOCKS, HALT, BEACON,
//            TELLER, LIST, FTAG, FODD, FGLASS, FRPC, FHSM, FLAPTOP, SDK, PHONE,
//            EXT, rect, fit, ZONE_RECTS, CAMS, world } from "../../shared/layout.mjs";
// (from ep13/segN/src/build-story.mjs). Positions only; ids, states, labels and per-shot opts stay in each segment.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Every position is written as S(X, Y) = the world point whose ground lands on world-canvas px (X, Y) (iso.G, rounded) —
// so the numbers read as on-screen ground positions at camera scale 1. `scale` = the opts.scale to pass to the object.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1; checked by rendering at scale 1 and 0.5): kit person, E01 vending / miniVend, E04 tellerCounter,
//   E05 keycard, E06 shareDispenser / shareCert, E07 parcel / oddCoin / returnTag, E08 ammPool, E10 coreModule, E11 mintPress and
//   ep13 passport / container take opts.scale. Everything else IGNORES it. Where such an object carries `scale` below
//   (SLOT = E03 slotCabinet 0.6, DMETER / LMETER = E05 thresholdMeter 0.7, NCLOCKS = kit clock 0.5) the segment MUST put it with the
//   "wrap" helper (translate · scale · translate around its ground point) and rescale its anchors; rect() / CAMS already assume the scaled size.
//   NCLOCKS also carry `lift` (world-canvas px): wrap them as translate(0, −lift) after the scale so they float above the node heads.
// The road (ROAD) runs along +u through the five checkpoint ground points (kit checkpoint draws its own road strip under the arm at v ≈ +40;
//   ROAD is the long native-SVG slab between gates, from ROAD.a to ROAD.b, ROAD.w world units wide, centred on v = gate v + 40).
// Zones (world-canvas px; front row +v = larger Y, back row −v = smaller Y; left → right = X; gates step (1700, −600) ≈ pure +u):
//   A EVM 关 (gate at X 0, Y 0; X ≈ −755..945, Y ≈ −640..185)
//   · B Solana 关 (gate at 1700, −600; X ≈ 945..2570, Y ≈ −995..−215) · B后 Solana 后院 behind B (X ≈ 570..1985, Y ≈ −1765..−1150)
//   · C Move 关 (gate at 3400, −1200; X ≈ 2645..4700, Y ≈ −1535..−740) · C后 升级与部署 behind C (X ≈ 2330..3285, Y ≈ −2200..−1720)
//   · D Bitcoin 关 (gate at 5100, −1800; X ≈ 4345..6080, Y ≈ −2325..−1505) · D 闪电角 behind-left of D (X ≈ 4005..4805, Y ≈ −2945..−2460)
//     · D Liquid 角 behind-right of D (X ≈ 5165..5915, Y ≈ −2955..−2490)
//   · E Cosmos 关 (gate at 6800, −2400; X ≈ 6045..8330, Y ≈ −2990..−2130) · E Jackfruit 角 behind E (X ≈ 6225..7280, Y ≈ −3570..−3020)
//   · F 交易所接入台 in front (+v) of the road between C and D (X ≈ 4475..5940, Y ≈ −820..−35).
// Seg routes: seg1 B → B · seg2 B → wide → A … E → wide → B · seg3 B → B后 · seg4 B后 → C → C后 · seg5 C后 → D → E · seg6 E → F → B → wide.
// Objects of neighbouring zones are ≥ ~55 canvas px apart (C–F 95, D–E 57, E–Jackfruit 79, all others ≥ 120); the per-zone framings in CAMS hold only their own zone's key objects
// (wide / world are the exception, by design). Per-object screen bboxes at each framing are quoted next to CAMS.
// Native-SVG areas (dot matrices, the "无状态" frame, the duplicate-parcel frame) are given as a ground origin + a box kind in EXT.
import { Wp, G, camAt } from "../../kit/iso.mjs";

/** world ground point for world-canvas px (X, Y); extra fields (scale, z …) copied in */
const S = (X, Y, extra = {}) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
/** zone-local placer: positions below are written relative to the zone's anchor px */
const zone = (OX, OY) => (X, Y, extra) => S(OX + X, OY + Y, extra);
/** axis-aligned pipe route a → b for E01 pipe: { o, pts } — put(id, r.o, E1.pipe(r.o, { id, pts: r.pts })). Leaves a along u first, then v. */
const route = (a, b, z = 90, a0 = [0, 0], b0 = [0, 0]) => {
  const du = b.u + b0[0] - a.u, dv = b.v + b0[1] - a.v;
  return { o: { u: a.u, v: a.v }, pts: [[a0[0], a0[1], z], [du, a0[1], z], [du, dv, z]] };
};

// ---- five checkpoints on the road (kit checkpoint, original size; n "A" … "E") + their E01 signBoard plates (original size)
const GP = [[0, 0], [1700, -600], [3400, -1200], [5100, -1800], [6800, -2400]];
export const GATES = GP.map(([X, Y]) => S(X, Y));                         // kit checkpoint n "A" "B" "C" "D" "E"
export const SIGNS = GP.map(([X, Y]) => S(X - 520, Y - 60));             // E01 signBoard plate (关名), behind-left of each gate
export const ROAD = { a: { u: GATES[0].u - 900, v: GATES[0].v + 40 }, b: { u: GATES[4].u + 900, v: GATES[4].v + 40 }, w: 150 };

// ---- A EVM 关·查行李 (seg2 L5、L12): anchor = gate A
const a = zone(...GP[0]);
export const VEND = a(600, -130, { scale: 0.7 });          // E01 vending sign "合约" 0.7
export const SLOT = a(380, -360, { scale: 0.6 });          // E03 slotCabinet "自己的存储" (wrap 0.6!), right behind the vending
export const PARCEL_A = a(-380, 170, { scale: 0.8 });      // E07 parcel "参数" 0.8, on the road before the gate
export const MINI_A = a(900, -20, { scale: 0.6 });         // E01 miniVend kind plain 0.6 (外部调用 target)
export const APIPE = route(VEND, MINI_A, 60, [60, 0], [-50, 0]);   // E01 pipe "外部调用": vending → miniVend

// ---- B Solana 关·查护照 (seg1 全段; seg2 L6、L12、L17; seg3 L0–L5; seg6 L10–L11): anchor = gate B, the hero zone
const b = zone(...GP[1]);
export const MACH = b(450, 120);                           // E03 contractMachine name "程序" tone light (original size)
export const STATELESS = b(720, 60);                       // red dashed empty frame "无状态" (native SVG), EXT.stateless
export const PASS = [b(-300, 330), b(-210, 298), b(-120, 266), b(-30, 234)]; // ep13 passport ×4 (scale 1); PASS[3] = title "系统账户" attacker
export const SIGNER = b(-440, 380, { scale: 0.7 });       // kit person signer "调用者" 0.7
export const ATK_B = b(200, 380, { scale: 0.7 });          // kit person attacker 0.7
export const MINT_B = b(800, -250, { scale: 0.6 });        // E11 mintPress plate "wETH" 0.6 (tray dot matrix: draw from anchors.tray)
export const PROOF_B = b(360, -220);                       // E02 proofCard "守护者签名" (missing in the hook), at the gate booth's right

// ---- B后 Solana 后院 (seg3 L6–L20; seg4 起点): straight behind B
const by = zone(1100, -1450);
export const CHAIN_P = [by(-500, 0), by(-380, -42), by(-260, -84)];       // ep13 passport ×3 (account chain, along u)
export const ROOT = by(-110, -140);                        // E02 addrPlate text "可信根" (→ "硬编码地址 / PDA")
export const ROPE = { pts: [...CHAIN_P, ROOT], lift: 60 }; // teal rope (native SVG) through the passports' tops → the root plate (world points; lift ≈ z of the knots)
export const ATK_CASH = by(-420, 200, { scale: 0.7 });     // kit person attacker 0.7 (Cashio)
export const ODD_CASH = by(-300, 190, { scale: 0.6 });     // E07 oddCoin "无价值代币" 0.6 (a small stack)
export const DOTS_CASH = by(-230, 150);                    // red dot matrix "约 20 亿枚 CASH" (100 dots, 10 × 10), EXT.dots
export const ANCHOR_SHIELD = by(60, 40);                   // kit shield "Anchor 约束"
export const DMETER = by(330, -80, { scale: 0.7 });        // E05 thresholdMeter max 5 th 2 thText "5 人 2 签" (wrap 0.7!)
export const SIGS = [by(480, 120), by(650, 60)];           // E02 sigPaper ×2 "审批"
export const DGLASS = by(300, 240);                        // kit hourglass "约 1 分钟"
export const DLOCK = by(820, 180);                         // E01 timeLock "时间锁" (frac 0 → 1)

// ---- C Move 关·防伪芯片 (seg2 L7、L12; seg4 L0–L13): anchor = gate C
const c = zone(...GP[2]);
export const PARCEL_C = c(-380, 170, { scale: 0.8 });      // E07 parcel "资源" 0.8 (chip sticker = native SVG on its top)
export const DUP_C = c(-260, 120);                         // red dashed duplicate-parcel frame + red X (native SVG), EXT.dup
export const VERIF = c(60, 0);                             // kit magnifier "字节码验证器" — hangs at the gate booth window (overlaps the gate on purpose)
export const POOL = c(500, 150, { scale: 0.7 });           // E08 ammPool "池子" 0.7
export const MANUAL = c(820, 80);                          // E03 manual title "开源数学库" open
export const BYTE = c(420, 330);                           // E03 byteBlock "位移" n 8 (ground = its left end)
export const DISP = c(760, 330, { scale: 0.7 });           // E06 shareDispenser "流动性份额" 0.7
export const CERT = c(900, 400);                           // E06 shareCert stack (scale 1)
export const ATK_C = c(1050, 300, { scale: 0.7 });         // kit person attacker 0.7
export const ICE = c(1150, 60);                            // E05 iceShell { w: 160, d: 110, h: 80 } "冻结 约 1.62 亿美元"
export const ICE_DOTS = c(1100, 40);                       // gold dot pile under the ice (native SVG), EXT.iceDots

// ---- C后 升级与部署 (seg4 L14–L17; seg5 起点): straight behind C
const cy = zone(2800, -1850);
export const CORE = cy(0, 0);                              // E10 coreModule "未审计版本" (scale 1; attacker later)
export const KEYCARD = cy(-250, 60, { scale: 0.7 });       // E05 keycard "审计版本" 0.7
export const UKEY = cy(200, 100);                          // kit key, red = "单签升级"
export const ULOCK = cy(420, -40);                         // E01 timeLock "时间锁"
export const UMSIG = cy(-420, -60);                        // E05 thresholdMeter max 3 th 2 thText "多签" (original size; appears at L17)

// ---- D Bitcoin 关·只查封条 (seg2 L8、L13; seg5 L0–L4): anchor = gate D
const d = zone(...GP[3]);
export const CTR = d(-420, 200);                           // ep13 container "UTXO" (scale 1), on the road before the gate (doors at its −u end)
export const BTC = d(600, -330);                           // kit chain n 4 title "Bitcoin", after the gate along u
export const IDX = [d(460, 230), d(840, 140)];             // kit laptop ×2 "索引器 A" "索引器 B"
// D 闪电角 (seg5 L5–L7): behind-left of D
const ln = zone(4500, -2600);
export const MEMPOOL = ln(0, 0);                           // E01 mempool sign "mempool" (original size)
export const LCLOCK = ln(-420, 40);                        // kit clock "截止时间"
export const LLETTER = ln(-40, -20, { z: 0 });             // E01 letter "超时交易" inside the queue (walk is fine: the mempool is not scaled)
// D Liquid 角 (seg5 L8–L12): behind-right of D
const lq = zone(5500, -2750);
export const LMETER = lq(-300, 0, { scale: 0.7 });         // E05 thresholdMeter "联盟签名" (wrap 0.7!), level full + green
export const LMINT = lq(-80, 40, { scale: 0.6 });          // E11 mintPress plate "L-BTC" 0.6
export const LBAL = lq(250, 60);                           // E01 balance "储备对账": left pan "BTC 储备", right pan "L-BTC 发行"
export const DOTS_LBTC = lq(-150, 110);                    // red dot matrix "约 4000 枚 L-BTC" (100 dots), EXT.dots

// ---- E Cosmos 关·互认海关章 (seg2 L9、L13; seg5 L13–L14; seg6 L0): anchor = gate E
const e = zone(...GP[4]);
export const CH1 = e(500, -420);                           // kit chain n 3 title "应用链 1" (back row)
export const CH2 = e(860, -150);                           // kit chain n 3 title "应用链 2" (front row)
export const CSEAL = e(520, 200);                          // kit seal "海关章"
export const CPROOF = e(1150, -330);                       // E02 proofCard "Merkle 证明" (on the teal arc CH1 ↔ CH2, drawn by the segment)
export const CDOC = CPROOF;                                // kit doc standing "不存在证明" attacker — same spot, swapped in for CPROOF (never both visible)
export const CTAG = e(1000, 120);                          // E07 returnTag "超时" (red)
export const ESCROW = e(1350, 150);                        // kit safe "托管账户" (door opens)
// E Jackfruit 角 (seg5 L15–L17): behind E
const jk = zone(6500, -3200);
export const NODES = [jk(-200, 0), jk(0, 70), jk(200, 140)];             // kit rpc ×3 "节点"
export const NCLOCKS = NODES.map((q) => ({ ...q, scale: 0.5, lift: 270 })); // kit clock ×3 (wrap 0.5 + lift 270!) over each node's head, three times
export const HALT = jk(500, 0);                            // kit knifeSwitch "出块" (pulled at L16–L17)
export const BEACON = jk(720, 100);                        // kit beacon "停机"

// ---- F 交易所接入台 (seg6 L0–L9): in front (+v) of the road between C and D
const fz = zone(5000, -500);
export const TELLER = fz(0, 0, { scale: 0.8 });            // E04 tellerCounter "交易所接入" 0.8
export const LIST = fz(-380, -40);                         // kit doc standing title "接入清单" (lines written L3–L8)
export const FTAG = fz(-250, 150);                         // E07 returnTag "失败" red / "成功" green
export const FODD = fz(-120, 200, { scale: 0.8 });         // E07 oddCoin "同名假币" 0.8
export const FGLASS = fz(100, 300);                        // kit hourglass "不可回滚"
export const FRPC = [fz(380, -60), fz(540, 0)];            // kit rpc ×2 "独立节点"
export const FHSM = fz(420, 200);                          // kit hsm "签名算法"
export const FLAPTOP = fz(800, 200);                       // kit laptop "索引器版本"
export const SDK = [fz(-500, 250), fz(-430, 275), fz(-360, 300)].map((q) => ({ ...q, scale: 0.6 })); // E07 parcel ×3 "SDK" 0.6 (one turns attacker)
export const PHONE = fz(260, 440);                         // kit phone (user wallet: "账户 / 程序", one row red)

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 (measured from the rendered SVGs:
// visible geometry only, contact shadows / glow and hidden layers excluded). [x0, y0, x1, y1]; y0 includes signs / dials / heads.
// Native-SVG areas (stateless … iceDots) are the boxes reserved for them, from their ground origin.
export const EXT = {
  checkpoint: [-213, -305, 284, 143], signPlate: [-235, -276, 207, 85], person: [-42, -173, 42, 6], personAtk: [-42, -191, 42, 6],
  vending: [-126, -330, 126, 55], slotCabinet: [-209, -467, 209, 90], parcel: [-38, -56, 38, 18], miniVend: [-72, -197, 72, 31],
  contractMachine: [-155, -246, 155, 76], passport: [-29, -76, 29, 12], mintPress: [-114, -238, 114, 55], proofCard: [-61, -158, 59, 23],
  addrPlate: [-56, -174, 57, 10], oddCoin: [-39, -109, 39, 18], shield: [-68, -218, 64, 28], thresholdMeter: [-52, -290, 71, 26],
  sigPaper: [-84, -264, 79, 31], hourglass: [-56, -201, 56, 28], timeLock: [-64, -182, 64, 27], magnifier: [-58, -260, 120, -105],
  ammPool: [-136, -215, 136, 61], manual: [-137, -94, 132, 64], byteBlock: [-7, -74, 171, 5], shareDispenser: [-78, -204, 82, 187],
  shareCert: [-35, -17, 35, 16], iceShell: [-148, -134, 148, 71], coreModule: [-73, -179, 73, 32], keycard: [-28, -85, 26, 9], key: [-75, -35, 84, 31],
  container: [-108, -129, 108, 47], chain4: [-287, -197, 287, 110], chain3: [-213, -171, 213, 85], laptop: [-164, -234, 141, 66],
  mempool: [-305, -346, 305, 139], clock: [-76, -193, 61, 2], letter: [-28, -56, 26, 0], balance: [-163, -258, 163, 40],
  seal: [-146, -142, 147, 69], docStanding: [-84, -261, 82, 23], returnTag: [-30, -62, 29, 7], safe: [-180, -376, 181, 82],
  rpc: [-77, -258, 78, 38], knifeSwitch: [-153, -344, 133, 48], beacon: [-61, -118, 61, 30], tellerCounter: [-228, -343, 241, 92],
  hsm: [-97, -119, 97, 44], phone: [-70, -195, 58, 27],
  stateless: [-60, -160, 60, 10], dup: [-30, -45, 30, 14], dots: [0, 0, 150, 150], iceDots: [-60, -30, 60, 20],
};
// rect(o, kind, scale) → world-canvas bbox [x0, y0, x1, y1] of that object standing at o (o.lift moves it up)
export const rect = (o, kind, scale = o.scale ?? 1) => {
  const [X, Y0] = Wp(o.u, o.v), Y = Y0 - (o.lift ?? 0), q = EXT[kind];
  return [X + q[0] * scale, Y + q[1] * scale, X + q[2] * scale, Y + q[3] * scale];
};
// fit(rects, screenRect, kmax) → camera {x, y, scale} for KIT.cam / KIT.camSet, fitting the union of rects into screenRect
export const fit = (rects, [x0, y0, x1, y1], kmax = 1.4) => {
  const X0 = Math.min(...rects.map((q) => q[0])), Y0 = Math.min(...rects.map((q) => q[1]));
  const X1 = Math.max(...rects.map((q) => q[2])), Y1 = Math.max(...rects.map((q) => q[3]));
  const k = Math.min(kmax, (x1 - x0) / (X1 - X0), (y1 - y0) / (Y1 - Y0));
  return camAt([(X0 + X1) / 2, (Y0 + Y1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};

// key objects per zone (the rects each framing must hold)
const gate = (i) => [rect(GATES[i], "checkpoint"), rect(SIGNS[i], "signPlate")];
export const ZONE_RECTS = {
  A: [...gate(0), rect(VEND, "vending"), rect(SLOT, "slotCabinet"), rect(PARCEL_A, "parcel"), rect(MINI_A, "miniVend")],
  B: [...gate(1), rect(MACH, "contractMachine"), rect(STATELESS, "stateless"), ...PASS.map((q) => rect(q, "passport")), rect(SIGNER, "person"),
    rect(ATK_B, "personAtk"), rect(MINT_B, "mintPress"), rect(PROOF_B, "proofCard")],
  BY: [...CHAIN_P.map((q) => rect(q, "passport")), rect(ROOT, "addrPlate"), rect(ATK_CASH, "personAtk"), rect(ODD_CASH, "oddCoin"), rect(DOTS_CASH, "dots"),
    rect(ANCHOR_SHIELD, "shield"), rect(DMETER, "thresholdMeter"), ...SIGS.map((q) => rect(q, "sigPaper")), rect(DGLASS, "hourglass"), rect(DLOCK, "timeLock")],
  C: [...gate(2), rect(PARCEL_C, "parcel"), rect(DUP_C, "dup"), rect(POOL, "ammPool"), rect(MANUAL, "manual"), rect(BYTE, "byteBlock"),
    rect(DISP, "shareDispenser"), rect(CERT, "shareCert"), rect(ATK_C, "personAtk"), rect(ICE, "iceShell")],
  CY: [rect(CORE, "coreModule"), rect(KEYCARD, "keycard"), rect(UKEY, "key"), rect(ULOCK, "timeLock"), rect(UMSIG, "thresholdMeter")],
  D: [...gate(3), rect(CTR, "container"), rect(BTC, "chain4"), ...IDX.map((q) => rect(q, "laptop"))],
  LN: [rect(MEMPOOL, "mempool"), rect(LCLOCK, "clock")],
  LQ: [rect(LMETER, "thresholdMeter"), rect(LMINT, "mintPress"), rect(LBAL, "balance"), rect(DOTS_LBTC, "dots")],
  E: [...gate(4), rect(CH1, "chain3"), rect(CH2, "chain3"), rect(CSEAL, "seal"), rect(CPROOF, "proofCard"), rect(CTAG, "returnTag"), rect(ESCROW, "safe")],
  JK: [...NODES.map((q) => rect(q, "rpc")), ...NCLOCKS.map((q) => rect(q, "clock")), rect(HALT, "knifeSwitch"), rect(BEACON, "beacon")],
  F: [rect(TELLER, "tellerCounter"), rect(LIST, "docStanding"), rect(FTAG, "returnTag"), rect(FODD, "oddCoin"), rect(FGLASS, "hourglass"),
    ...FRPC.map((q) => rect(q, "rpc")), rect(FHSM, "hsm"), rect(FLAPTOP, "laptop"), ...SDK.map((q) => rect(q, "parcel")), rect(PHONE, "phone")],
};
const Z = ZONE_RECTS;
const SAFE = [100, 280, 1820, 860];                      // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for code cards / checklists at the sides
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur). Screen bboxes below are [x0, y0, x1, y1] on the 1920×1080 frame
// (from the layout check), on the line(s) right above each key.
export const CAMS = {
  // 五关全景：五座海关 + 关名牌（seg2 L0–L4、L10–L16；seg6 L14–L15 结束卡）
  //   k 0.229 · 10 key rects, union 62,200–1858,860
  wide: fit([0, 1, 2, 3, 4].flatMap(gate), [60, 200, 1860, 860], 1),
  // A EVM 关：道闸 + 售货机 + 存储柜 + 参数包裹 + 外部调用（seg2 L5、L12）
  //   k 0.703 · 6 key rects, union 363,280–1557,860
  evmA: fit(Z.A, SAFE, 1.4),
  // B Solana 关全景：道闸 + 程序机器 + 护照一字排开 + 调用者 / 攻击者 + 铸币机（seg1 L12–L13 终点；seg2 起点、L6、L17 终点；seg6 L10、L12）
  //   k 0.747 · 12 key rects, union 354,280–1566,860
  solB: fit(Z.B, SAFE, 1.4),
  // 近景：护照 ×4 + 程序机器 + "无状态"框 + 调用者 / 攻击者（seg1 L2–L3、L7、L10–L11；seg3 起点 L0–L5；seg6 L11）
  //   k 1.057 · 8 key rects, union 300,310–1620,849
  passB: fit([...PASS.map((q) => rect(q, "passport")), rect(MACH, "contractMachine"), rect(STATELESS, "stateless"), rect(SIGNER, "person"), rect(ATK_B, "personAtk")], MID, 1.4),
  // 近景：wETH 铸币机 + 程序机器 + 守护者签名证明卡 + 伪造的"系统账户"护照 PASS[3]（seg1 起点 L0–L1、L4）
  //   k 0.877 · 4 key rects, union 553,300–1367,860
  mintB: fit([rect(MINT_B, "mintPress"), rect(MACH, "contractMachine"), rect(PROOF_B, "proofCard"), rect(PASS[3], "passport")], MID, 1.4),
  // B后 账户链 + 可信根 + Cashio 点阵 + Anchor 盾（seg3 L6–L13）
  //   k 0.912 · 8 key rects, union 662,300–1258,860
  yardB: fit([...CHAIN_P.map((q) => rect(q, "passport")), rect(ROOT, "addrPlate"), rect(ATK_CASH, "personAtk"), rect(ODD_CASH, "oddCoin"), rect(DOTS_CASH, "dots"),
    rect(ANCHOR_SHIELD, "shield")], MID, 1.4),
  // B后 Drift 角：门限表 + 两张审批 + 沙漏 + 时间锁（seg3 L14–L20 终点；seg4 起点）
  //   k 1.016 · 5 key rects, union 635,300–1285,860
  driftB: fit([rect(DMETER, "thresholdMeter"), ...SIGS.map((q) => rect(q, "sigPaper")), rect(DGLASS, "hourglass"), rect(DLOCK, "timeLock")], MID, 1.4),
  // C Move 关：道闸 + 资源包裹（复制框）+ Cetus 角全貌（seg2 L7、L12；seg4 L0–L1）
  //   k 0.728 · 11 key rects, union 213,280–1707,860
  moveC: fit(Z.C, SAFE, 1.4),
  // 近景：Cetus 角：池子 + 开源数学库 + 位移格 + 份额机 + 份额凭证 + 攻击者 + 冻结冰壳（seg4 L2–L10）
  //   k 1.084 · 7 key rects, union 476,280–1444,860
  cetusC: fit([rect(POOL, "ammPool"), rect(MANUAL, "manual"), rect(BYTE, "byteBlock"), rect(DISP, "shareDispenser"), rect(CERT, "shareCert"),
    rect(ATK_C, "personAtk"), rect(ICE, "iceShell")], SAFE, 1.4),
  // 近景：C 岗亭 + 放大镜"字节码验证器"（seg4 L11–L13）
  //   k 1.25 · 2 key rects, union 649,300–1271,860
  verifC: fit([rect(GATES[2], "checkpoint"), rect(VERIF, "magnifier")], MID, 1.4),
  // C后 升级与部署：未审计模块 + 审计版本卡 + 单签钥匙 + 时间锁 + 多签（seg4 L14–L17 终点；seg5 起点）
  //   k 1.164 · 5 key rects, union 404,300–1516,860
  upgC: fit(Z.CY, MID, 1.4),
  // D Bitcoin 关：道闸 + 集装箱 + Bitcoin 链 + 两台索引器（seg2 L8、L13；seg5 L0–L4）
  //   k 0.705 · 6 key rects, union 348,280–1572,860
  btcD: fit(Z.D, SAFE, 1.4),
  // D 闪电角：mempool + 截止时间钟 + 超时交易信封（seg5 L5–L7）
  //   k 1.155 · 2 key rects, union 497,300–1423,860
  lnD: fit(Z.LN, MID, 1.4),
  // D Liquid 角：联盟签名门限表 + L-BTC 铸币机 + 储备对账天平 + 红点阵（seg5 L8–L12）
  //   k 1.209 · 4 key rects, union 507,300–1413,860
  liquidD: fit(Z.LQ, MID, 1.4),
  // E Cosmos 关：道闸 + 两条应用链 + 海关章 + 证明卡 + 超时牌 + 托管保险箱（seg2 L9、L13；seg5 L13–L14；seg6 起点 L0）
  //   k 0.674 · 8 key rects, union 190,280–1730,860
  cosmosE: fit(Z.E, SAFE, 1.4),
  // E Jackfruit 角：三台节点 + 头顶三只钟 + 出块闸刀 + 停机警报灯（seg5 L15–L17 终点）
  //   k 1.028 · 8 key rects, union 417,300–1503,860
  haltE: fit(Z.JK, MID, 1.4),
  // F 交易所接入台全景（seg6 L0–L9）
  //   k 0.739 · 13 key rects, union 419,280–1501,860
  cexF: fit(Z.F, SAFE, 1.4),
  // 近景：接入清单 + 失败牌 / 同名假币 / 不可回滚沙漏 / SDK 包裹 + 柜台（seg6 L2–L5、L8）
  //   k 0.89 · 8 key rects, union 642,300–1278,860
  listF: fit([rect(LIST, "docStanding"), rect(FTAG, "returnTag"), rect(FODD, "oddCoin"), rect(FGLASS, "hourglass"), ...SDK.map((q) => rect(q, "parcel")),
    rect(TELLER, "tellerCounter")], MID, 1.4),
  // 全部区（含后院和接入台）：远景备用
  //   k 0.176 · 88 key rects, union 160,200–1760,860
  world: fit(Object.values(Z).flat(), [60, 200, 1860, 860], 1),
};
/** all zones, for the end card / establishing shot */
export const world = CAMS.world;
