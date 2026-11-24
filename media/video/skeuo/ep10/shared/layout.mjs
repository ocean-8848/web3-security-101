// ep10「售货机维修厂」shared world layout — one continuous isometric world, fixed for all six segments:
//   import { BRIDGE, BVEND, BCORE, GATE, ROOTSIGN, CONFIRM, LETTERS, COPIERS, VEND, STORE, CORE, ENGINEER, USERS, ULETTERS, HOURGLASS, TLOCK_X,
//            STANDS, TRANS, UUPS, BEACON, CAB, EIP, MANUALS, BYTES, MAG, KEYS, SVEND, EPROXY, EIMPL, ECARDS, DEPLOYER, ATTACKER, ELETTERS, EHOUR,
//            PADLOCK, VICTIMS, ROLL, GATES, GSIGNS, ROADEND, SHIELD, METER, TLOCK, KNIFE, QCORES, COMP, MANTLE, ROLLBACK, ROLES, RLENS, CHAINS,
//            EXT, rect, fit, ZONE_RECTS, CAMS } from "../../shared/layout.mjs";
// (from ep10/segN/src/build-story.mjs). Positions only; ids, states, labels and per-shot opts stay in each segment.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Every position is written as S(X, Y) = the world point whose ground lands on world-canvas px (X, Y) (iso.G, rounded) —
// so the numbers read as on-screen ground positions at camera scale 1. `scale` = the opts.scale to pass to the object.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): E03 slotCabinet, kit checkpoint, kit tower, E02 rollCounter IGNORE opts.scale.
//   Where such an object carries `scale` below (STORE 0.8, EIP 0.5, GATES 0.6, BEACON.tower 0.6, ROLL 0.6), the segment MUST put it with the
//   wrap helper (translate · scale · translate around its ground point) and rescale its anchors; rect() / CAMS already assume the scaled size.
//   Objects that do support opts.scale (E01 vending, kit person, E05 keycard, kit ledgerBook, ep10 coreModule) just take opts.scale.
// Zones (world-canvas px; a "售货机维修厂" strip, front row +v / back row −v):
//   F 升级审批路 far left (X ≈ −7110..−4130, Y ≈ −1030..820; sub-areas road / gov / compound / mantle / roles / rollback)
//   · A 河边桥头 Nomad (X ≈ −3490..−1630, Y ≈ −410..500, the bridge at (−2000, 0))
//   · B 维修间 in the middle of the front row (X ≈ −820..680, Y ≈ −470..260, the hero vending at the origin)
//   · C 三种代理展台 straight behind B (X ≈ −1060..1120, Y ≈ −1440..−940) · D 存储档案室 right of C (X ≈ 1780..3760, Y ≈ −1780..−800)
//   · E 初始化台 in front of D, right end of the front row (X ≈ 1770..3350, Y ≈ −330..250).
// Front row left → right is F · A · B · E (seg4 L14 pans E → B → A); C / D sit behind B / E.
// Neighbouring zones are ≥ ~460 canvas px apart edge to edge (B–C ≈ 465, D–E ≈ 463, F–A ≈ 637, C–D ≈ 657, A–B ≈ 817, B–E ≈ 1166);
// the per-zone framings in CAMS hold only their own zone's key objects. Per-object screen bboxes at each framing are quoted next to CAMS.
import { Wp, G, camAt } from "../../kit/iso.mjs";

/** world ground point for world-canvas px (X, Y); extra fields (scale, z …) copied in */
const S = (X, Y, extra = {}) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
/** zone-local placer: positions below are written relative to the zone's anchor px */
const zone = (OX, OY) => (X, Y, extra) => S(OX + X, OY + Y, extra);

// ---- A 河边桥头·Nomad (seg1 L0–L11; seg4 L14–L20; seg5 L0; seg6 L6–L8): anchor = bridge
const a = zone(-2000, 0);
export const BRIDGE = a(0, 0);                            // E01 bridge (original size); road runs along u at the bridge's v, near bank = −u
export const BVEND = a(-620, -150, { scale: 0.8 });      // E01 vending "桥合约", maintDoor open (−u door faces BCORE)
export const BCORE = a(-960, -110);                      // ep10 coreModule "升级" on its cart, pushed into BVEND's door (KITX10.push to A.bvend.maint)
const road = (du) => ({ u: BRIDGE.u + du, v: BRIDGE.v });  // a point on the bridge road (same v as the bridge), du along +u
export const GATE = road(-1260);                         // kit checkpoint "可信根检查" on the bridge road, booth behind (−v), arm across +v
export const ROOTSIGN = a(-1360, 280);                   // E01 signBoard plate "可信根" on the approach side of the gate
export const CONFIRM = a(-560, 200);                     // kit doc standing "确认表" (lines: 全零 → 已确认), between the gate and the bridge
export const LETTERS = [road(-1480), road(-1540), road(-1600)]; // E01 letter queue on the road just before the gate (walk them through A.gate.road; they overlap the gate by design)
export const COPIERS = [-300, -180, -60, 60, 180, 300].map((X) => a(X, 340, { scale: 0.6 })); // kit person attacker ×6 (scale 0.6) in front of the bridge, copying the envelope

// ---- B 维修间·代理解剖 (seg1 L12; seg2 L0–L11; seg5 —; seg6 L9): anchor = hero vending
const b = zone(0, 0);
export const VEND = b(0, 0);                              // E01 vending "代理" (scale 1, maintDoor on its −u face, impl "V1", gold = funds)
export const STORE = b(-480, -180, { scale: 0.8 });      // E03 slotCabinet n 4 "存储" (wrap 0.8!), −u side behind the vending; pipe it to the vending's −u face
export const CORE = b(-330, 120);                        // ep10 coreModule "V2" on its cart, in front of the open maintenance door
export const ENGINEER = b(-520, 160);                    // kit person engineer (维修工 / 管理员), behind the cart
export const USERS = [b(240, 250), b(380, 250)];        // kit person signer ×2 in front of the coin slot (+v face, right)
export const ULETTERS = USERS.map((q) => { const [X, Y] = Wp(q.u, q.v); return S(X + 45, Y + 20, { z: 70 }); }); // E01 letter held by each user (pass opts.z)
export const HOURGLASS = b(-760, 200);                   // kit hourglass "真实机器：要花时间" (seg2 L11, left)
export const TLOCK_X = b(620, 120);                      // E01 timeLock + red X "没有时间锁：一笔交易" (seg2 L11, right)

// ---- C 三种代理展台 (seg2 L12–L19; seg3 L0, L24; seg5 L2): straight behind B, three stands 700 px apart
const c = zone(0, -1150);
export const STANDS = { trans: S(-700, -1150), uups: S(0, -1150), beacon: S(700, -1150) };
export const TRANS = {
  sign: c(-930, -40),                                    // E01 signBoard plate "透明代理"
  vend: c(-700, 0, { scale: 0.55 }),                     // E01 vending "代理" 0.55
  admin: c(-550, 40),                                    // kit person engineer "管理员" (kit key in hand: KEY below, overlaps its holder only)
  key: c(-500, 60, { z: 60 }),                           // kit key held by the admin
  rule: c(-700, 190),                                    // E01 signBoard wood "管理员：不转发" sub "其他人：只转发", size 22
};
export const UUPS = {
  sign: c(-230, -40),                                    // E01 signBoard plate "UUPS"
  vend: c(0, 0, { scale: 0.55 }),                        // E01 vending 0.55, maintDoor open; coreModule (cart:false, scale ≈ 0.25) sits at A.uups.impl — no own rect
};
export const BEACON = {
  sign: c(470, -40),                                     // E01 signBoard plate "信标代理"
  tower: c(700, -40, { scale: 0.6 }),                    // kit tower "信标" (wrap 0.6!)
  vaults: [c(850, 60, { scale: 0.4 }), c(960, 110, { scale: 0.4 }), c(1070, 160, { scale: 0.4 })], // E01 vending "金库" ×3, scale 0.4 (signal arcs land on their maint doors)
};

// ---- D 存储档案室 (seg3 L0–L23): right of C, back row; anchor = big cabinet
const d = zone(2700, -1150);
export const CAB = d(0, 0);                               // E03 slotCabinet n 5 "代理存储" (original size), tags / open per shot
export const EIP = d(520, -520, { scale: 0.5 });         // E03 slotCabinet n 1 "EIP-1967" (wrap 0.5!), far back = "高架上" (draw a shelf post if wanted)
export const MANUALS = [d(-620, 200), d(-160, 260)];     // E03 manual ×2 open 180 ("实现 V1" / "实现 V2"), in front-left of the cabinet
export const BYTES = d(260, 160);                        // E03 byteBlock 32 bytes (pulled out of drawer 1; cut down to 20 in seg3 L12)
export const MAG = d(-700, -60);                         // kit magnifier (floats; sweeps the manuals in seg3 L19 / L23)
export const KEYS = [d(700, 80), d(760, 250)];           // E03 selectorKey ×2 selector 42966c68 ("burn(uint256)" / "collate_propagate_storage(bytes16)")
export const SVEND = d(1000, 60, { scale: 0.5 });        // E01 vending "代理" 0.5 (coin slot = lock hole)

// ---- E 初始化台 (seg4 L0–L13; seg6 L1): in front of D, right end of the front row; anchor = proxy vending
const e = zone(2200, 0);
export const EPROXY = e(0, 0, { scale: 0.7 });            // E01 vending "代理" 0.7
export const EIMPL = e(400, 0, { scale: 0.7 });          // E01 vending "实现合约" 0.7 (glass empty, "存储：空")
export const ECARDS = [EPROXY, EIMPL].map((q) => ({ u: q.u, v: q.v, z: 220, scale: 0.8 })); // E05 keycard "主人" on top of each vending (opts.z 220 = vending roof at 0.7) — sits on its vending by design
export const DEPLOYER = e(-300, 150);                    // kit person signer "部署者"
export const ATTACKER = e(650, 180);                     // kit person attacker
export const ELETTERS = [e(60, 240), e(340, 240)];       // E01 letter "部署" / "初始化"
export const EHOUR = e(200, 220);                        // kit hourglass between the two letters (空隙)
export const PADLOCK = e(560, -130);                     // kit padlock beside the impl's card slot (lift it onto the keycard with a translate if wanted)
export const VICTIMS = [e(800, -200, { scale: 0.4 }), e(950, -140, { scale: 0.4 }), e(1100, -80, { scale: 0.4 })]; // E01 vending ×3 0.4 broken (pipe from EIMPL)
export const ROLL = e(-260, -160, { scale: 0.6 });       // E02 rollCounter (optional, 初始化次数; wrap 0.6!)

// ---- F 升级审批路 (seg5 L1–L20; seg6 L0–L5): far left; anchor = gate ①; the road runs along +u (screen up-right)
const ff = zone(-6500, 0);
const STEP = [311, -109];                                 // one gate further along the road (Δu ≈ 380)
export const GATES = [0, 1, 2, 3, 4, 5].map((i) => ff(i * STEP[0], i * STEP[1], { scale: 0.6 })); // kit checkpoint n 1..6 (wrap 0.6!) on one road (same v)
export const GSIGNS = GATES.map((_, i) => ff(i * STEP[0] - 150, i * STEP[1] - 240)); // E01 signBoard plate "只追加" "布局比对" "分叉测试" "审计" "时间锁" "部署后验证", behind each booth (reads as "above")
export const ROADEND = ff(1955, -685, { scale: 0.5 });   // E01 vending "代理" 0.5 at the road's end, on the road; maintDoor (−u) faces the road
export const SHIELD = ff(-330, 60);                      // kit shield "最高等级" at the road entrance (seg5 L1)
export const METER = ff(330, 311);                       // E05 thresholdMeter thText "多签" (roadside, seg5 L3)
export const TLOCK = ff(700, 250);                       // E01 timeLock ("约 7 天"), the lock that blocks both modules (seg5 L4–L10)
export const QCORES = [ff(520, 300), ff(870, 230)];       // ep10 coreModule ×2 queued either side of TLOCK (red "恶意升级" / green "紧急修复")
export const KNIFE = ff(1150, 160);                      // kit knifeSwitch "暂停" (red dashed frame = none, seg5 L8; solid in L10)
export const COMP = ff(1500, 250, { scale: 0.45 });      // E01 vending "奖励合约" 0.45; coin dots spray to its front-right (≈ +100..+300, +0..+150 px)
export const MANTLE = {                                  // seg5 L11–L14, in front (+v) of the gov cluster
  l1Sign: ff(200, 650),                                  // E01 signBoard wood "L1"
  l1Vend: ff(420, 700, { scale: 0.45 }),                 // E01 vending "桥 · 门户" 0.45
  l1Meter: ff(620, 700),                                 // E05 thresholdMeter "6/14"
  l1Lock: ff(820, 700),                                  // E01 timeLock "无延迟" + red X
  l2Sign: ff(1150, 650),                                 // E01 signBoard wood "L2"
  l2Vend: ff(1380, 700, { scale: 0.45 }),                // E01 vending "你的协议" 0.45
};
export const ROLLBACK = [ff(2150, -560), ff(2300, -450)]; // ep10 coreModule "V2" (backing out) / "V1" (pushed back in) + bent arrow, beyond the road's end
export const ROLES = { eng: ff(-500, 450), aud: ff(-330, 450), user: ff(-160, 450) }; // seg6 L0–L4: engineer / auditor / ordinary user (signer)
export const RLENS = ff(-280, 470);                      // kit magnifier held by the auditor (floats; overlaps its holder only)
export const CHAINS = [ff(-560, 800, { scale: 0.4 }), ff(-360, 800, { scale: 0.4 }), ff(-160, 800, { scale: 0.4 })]; // seg6 L5: E01 vending ×3 0.4 "链 A / 链 B / 链 C"

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 (measured from the rendered SVGs:
// visible geometry only, contact shadows / glow and hidden layers excluded). [x0, y0, x1, y1]; y0 includes signs / dials / heads.
export const EXT = {
  bridge: [-367, -208, 367, 207], checkpoint: [-213, -305, 284, 143], doc: [-84, -261, 82, 23], letter: [-28, -56, 26, 0], person: [-50, -208, 50, 7],
  vending: [-126, -330, 126, 55], vendingOpen: [-180, -330, 126, 55], slotCabinet4: [-209, -367, 209, 90], slotCabinet5: [-209, -417, 209, 90],
  slotCabinet1: [-209, -216, 209, 90], timeLock: [-64, -182, 64, 27], key: [-75, -35, 84, 31], tower: [-106, -417, 106, 53],
  signPlate: [-130, -239, 102, 48], signPlate5: [-146, -245, 119, 54], signWood: [-68, -146, 68, 14], signRule: [-92, -158, 92, 22],
  manual: [-304, -87, 132, 95], byteBlock32: [-7, -109, 269, 5], selectorKey: [-148, -141, 169, 25], magnifier: [-58, -260, 120, -105],
  keycard: [-28, -85, 26, 9], hourglass: [-56, -201, 56, 28], padlock: [-56, -138, 62, 28], rollCounter: [-134, -117, 134, 30],
  thresholdMeter: [-52, -290, 92, 26], knifeSwitch: [-153, -344, 133, 48], coreModule: [-73, -179, 73, 32], shield: [-68, -218, 64, 28],
};
// rect(o, kind, scale) → world-canvas bbox [x0, y0, x1, y1] of that object standing at o
export const rect = (o, kind, scale = o.scale ?? 1) => { const [X, Y] = Wp(o.u, o.v); const e = EXT[kind]; return [X + e[0] * scale, Y + e[1] * scale, X + e[2] * scale, Y + e[3] * scale]; };
// fit(rects, screenRect, kmax) → camera {x, y, scale} for KIT.cam / KIT.camSet, fitting the union of rects into screenRect
export const fit = (rects, [x0, y0, x1, y1], kmax = 1.4) => {
  const X0 = Math.min(...rects.map((r) => r[0])), Y0 = Math.min(...rects.map((r) => r[1]));
  const X1 = Math.max(...rects.map((r) => r[2])), Y1 = Math.max(...rects.map((r) => r[3]));
  const k = Math.min(kmax, (x1 - x0) / (X1 - X0), (y1 - y0) / (Y1 - Y0));
  return camAt([(X0 + X1) / 2, (Y0 + Y1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};

// key objects per zone (the rects each framing must hold)
export const ZONE_RECTS = {
  A: [rect(BRIDGE, "bridge"), rect(BVEND, "vendingOpen"), rect(BCORE, "coreModule"), rect(GATE, "checkpoint"), rect(ROOTSIGN, "signPlate"), rect(CONFIRM, "doc"),
    ...COPIERS.map((q) => rect(q, "person"))],
  B: [rect(VEND, "vendingOpen"), rect(STORE, "slotCabinet4"), rect(CORE, "coreModule"), rect(ENGINEER, "person"), ...USERS.map((q) => rect(q, "person")),
    rect(HOURGLASS, "hourglass"), rect(TLOCK_X, "timeLock")],
  trans: [rect(TRANS.sign, "signPlate"), rect(TRANS.vend, "vending"), rect(TRANS.admin, "person"), rect(TRANS.rule, "signRule")],
  uups: [rect(UUPS.sign, "signPlate"), rect(UUPS.vend, "vendingOpen")],
  beacon: [rect(BEACON.sign, "signPlate"), rect(BEACON.tower, "tower"), ...BEACON.vaults.map((q) => rect(q, "vending"))],
  D: [rect(CAB, "slotCabinet5"), rect(EIP, "slotCabinet1"), ...MANUALS.map((q) => rect(q, "manual")), rect(BYTES, "byteBlock32"), rect(MAG, "magnifier"),
    ...KEYS.map((q) => rect(q, "selectorKey")), rect(SVEND, "vending")],
  E: [rect(EPROXY, "vending"), rect(EIMPL, "vending"), rect(DEPLOYER, "person"), rect(ATTACKER, "person"), ...ELETTERS.map((q) => rect(q, "letter")),
    rect(EHOUR, "hourglass"), rect(PADLOCK, "padlock"), ...VICTIMS.map((q) => rect(q, "vending")), rect(ROLL, "rollCounter")],
  road: [...GATES.map((q) => rect(q, "checkpoint")), ...GSIGNS.map((q, i) => rect(q, i === 5 ? "signPlate5" : "signPlate")), rect(ROADEND, "vendingOpen"), rect(SHIELD, "shield")],
  gov: [rect(METER, "thresholdMeter"), rect(TLOCK, "timeLock"), ...QCORES.map((q) => rect(q, "coreModule")), rect(KNIFE, "knifeSwitch")],
  compound: [rect(COMP, "vending"), rect(KNIFE, "knifeSwitch"), rect(TLOCK, "timeLock"), rect(QCORES[1], "coreModule")],
  mantle: [rect(MANTLE.l1Sign, "signWood"), rect(MANTLE.l1Vend, "vendingOpen"), rect(MANTLE.l1Meter, "thresholdMeter"), rect(MANTLE.l1Lock, "timeLock"),
    rect(MANTLE.l2Sign, "signWood"), rect(MANTLE.l2Vend, "vending")],
  rollback: [rect(GATES[4], "checkpoint"), rect(GATES[5], "checkpoint"), rect(ROADEND, "vendingOpen"), ...ROLLBACK.map((q) => rect(q, "coreModule"))],
  roles: [...Object.values(ROLES).map((q) => rect(q, "person")), rect(RLENS, "magnifier"), ...CHAINS.map((q) => rect(q, "vending"))],
};
const Z = ZONE_RECTS;
Z.C = [...Z.trans, ...Z.uups, ...Z.beacon];
Z.F = [...Z.road, ...Z.gov, ...Z.compound, ...Z.mantle, ...Z.rollback, ...Z.roles];
const SAFE = [100, 280, 1820, 860];                      // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur). Screen bboxes below are [x0, y0, x1, y1] on the 1920×1080 frame
// (from the layout check), on the line(s) right above each key.
export const CAMS = {
  // A 桥头全景（seg1 起点、seg4 终点、seg5 起点、seg6 L6–L8）
  //   k 0.631 · bridge 1083,410–1546,672 · bvend 832,280–986,475 · bcore 662,359–754,492 · gate 529,577–842,860 · rootsign 374,568–520,749 · confirm 908,503–1013,682
  //   copier0 1106,677–1144,759 · copier1 1182,678–1220,759 · copier2 1257,677–1295,759 · copier3 1333,677–1371,759 · copier4 1409,677–1447,759 · copier5 1484,677–1522,759
  //   letter0 532,774–566,809 · letter1 501,785–535,820 · letter2 470,796–504,831
  A: fit(Z.A, SAFE, 1.4),
  // 近景：检查口 + 可信根牌 + 确认表 + 排队的信（seg1 L3–L8、seg4 L15–L20、seg6 L8）
  //   k 1.025 · gate 693,401–1202,860 · rootsign 441,385–679,679 · confirm 1309,280–1479,571 · letter0 697,721–753,778 · letter1 647,738–702,796 · letter2 597,756–652,813
  gate: fit([rect(GATE, "checkpoint"), rect(ROOTSIGN, "signPlate"), rect(CONFIRM, "doc"), ...LETTERS.map((q) => rect(q, "letter"))], SAFE, 1.4),
  // 近景：桥合约维修门 + 机芯推车 + 确认表（seg1 L1–L2、L10，seg6 L7）
  //   k 0.879 · bvend 952,300–1168,571 · bcore 716,410–844,596 · confirm 1058,610–1204,860
  door: fit([rect(BVEND, "vendingOpen"), rect(BCORE, "coreModule"), rect(CONFIRM, "doc")], [300, 300, 1620, 860], 1.4),
  // B 维修间（seg1 终点、seg2 起点、seg6 L9）
  //   k 0.794 · vend 870,394–1113,699 · store 499,280–764,570 · core 692,609–808,776 · eng 560,618–639,789 · user0 1163,689–1243,860 · user1 1274,689–1354,860
  //   hour 365,655–454,837 · tlockx 1454,607–1555,772
  B: fit(Z.B, SAFE, 1.4),
  // 近景：代理解剖 — 售货机 + 存储柜 + 推车机芯（seg2 L1–L10）
  //   k 0.896 · vend 1032,428–1306,773 · store 614,300–913,627 · core 832,671–963,860
  anatomy: fit([rect(VEND, "vendingOpen"), rect(STORE, "slotCabinet4"), rect(CORE, "coreModule")], [300, 300, 1620, 860], 1.4),
  // C 三个展台并排（seg2 L12、L19，seg2 终点、seg3 起点）
  //   k 0.789 · tsign 100,381–283,607 · tvend 329,457–439,625 · admin 463,468–542,638 · rule 312,626–457,768 · usign 652,380–835,607 · uvend 858,458–991,625
  //   bsign 1204,381–1388,607 · tower 1439,372–1539,594 · vault0 1567,544–1647,666 · vault1 1654,584–1733,705 · vault2 1741,623–1820,745
  C: fit(Z.C, SAFE, 1.4),
  // 近景：各展台（seg2 L13–L14 / L15–L16 / L17–L18；seg3 L24 回指透明台；seg5 L2 不用，在 F 区）
  //   k 1.141 · tsign 690,300–955,627 · tvend 1022,411–1180,652 · admin 1216,426–1330,672 · rule 997,655–1207,860
  trans: fit(Z.trans, [400, 300, 1620, 860], 1.4),
  //   k 1.4 · usign 710,363–1034,765 · uvend 1075,500–1310,797
  uups: fit(Z.uups, [400, 300, 1620, 860], 1.4),
  //   k 1.185 · bsign 548,313–823,654 · tower 899,300–1050,634 · vault0 1093,559–1212,741 · vault1 1222,618–1342,801 · vault2 1353,677–1472,860
  beacon: fit(Z.beacon, [400, 300, 1620, 860], 1.4),
  // C + D 同框：0 号抽屉的红虚线连到展台方向的售货机（seg3 L5）— k 0.373
  CD: fit([...Z.C, ...Z.D], [60, 300, 1860, 860], 1.4),
  // D 档案室全景（seg3 终点、seg4 起点）
  //   k 0.59 · cab 796,405–1042,704 · eip 1164,280–1287,370 · man0 374,717–631,825 · man1 645,753–903,860 · bytes 1068,681–1231,748 · mag 472,462–577,553
  //   key0 1245,614–1432,712 · key1 1280,715–1467,813 · svend 1472,588–1546,702
  D: fit(Z.D, SAFE, 1.4),
  // 近景：大抽屉柜 + 两本手册 + 字节条（seg3 L0–L5、L8–L19）
  //   k 0.751 · cab 951,280–1265,661 · man0 415,678–742,815 · man1 760,723–1087,860 · bytes 1298,632–1505,717
  cab: fit([rect(CAB, "slotCabinet5"), ...MANUALS.map((q) => rect(q, "manual")), rect(BYTES, "byteBlock32")], SAFE, 1.4),
  // 近景：抽屉柜 + 高架 EIP-1967 小柜（seg3 L6–L7 镜头抬向高架）
  //   k 0.78 · cab 635,465–961,860 · eip 1122,300–1285,419
  eip: fit([rect(CAB, "slotCabinet5"), rect(EIP, "slotCabinet1")], [300, 300, 1620, 860], 1.4),
  // 近景：档案室角落 — 两把选择器钥匙 + 小售货机（seg3 L20–L23）
  //   k 1.4 · key0 603,376–1047,608 · key1 687,614–1131,846 · svend 1141,314–1317,584
  keys: fit([...KEYS.map((q) => rect(q, "selectorKey")), rect(SVEND, "vending")], [300, 300, 1620, 860], 1.4),
  // E 初始化台（seg4 L0–L13）
  //   k 1 · eproxy 471,381–648,651 · eimpl 871,381–1048,650 · dep 210,554–310,769 · atk 1160,584–1260,799 · eletter0 591,796–645,852 · eletter1 871,796–925,852
  //   ehour 704,631–816,860 · padlock 1064,344–1182,510 · victim0 1309,280–1410,434 · victim1 1459,340–1560,494 · victim2 1609,400–1710,554 · roll 220,382–381,470
  E: fit(Z.E, SAFE, 1.4),
  // F 审批路：6 道关卡 + 路尽头的代理（seg5 L15–L19；seg5 终点、seg6 起点）
  //   k 0.519 · gate0 474,719–628,859 · gate1 635,663–789,802 · gate2 796,606–951,746 · gate3 957,550–1112,689 · gate4 1119,493–1274,633 · gate5 1280,437–1435,576
  //   gsign0 394,566–515,715 · gsign1 556,509–676,658 · gsign2 717,453–838,602 · gsign3 878,396–999,545 · gsign4 1040,340–1160,489 · gsign5 1193,280–1331,435
  //   roadend 1508,373–1587,473 · shield 333,733–401,860
  F: fit(Z.road, SAFE, 1.4),
  // 多签 + 时间锁 + 两只排队机芯（seg5 L3–L4、L9–L10）
  //   k 1.112 · meter 401,508–562,860 · tlock 799,561–942,793 · qcore0 589,620–752,854 · qcore1 978,542–1141,777 · knife 1200,280–1518,716
  gov: fit(Z.gov, SAFE, 1.4),
  // Compound 小站（seg5 L5–L8）
  //   k 1.257 · tlock 381,597–542,860 · qcore1 584,576–767,841 · knife 835,280–1194,773 · comp 1396,640–1539,857
  compound: fit(Z.compound, SAFE, 1.4),
  // Mantle 小站（seg5 L11–L14）
  //   k 1.318 · m.l1Sign 100,485–279,695 · m.l1Vend 373,547–555,775 · m.l1Meter 674,361–864,778 · m.l1Lock 922,503–1091,779 · m.l2Sign 1352,485–1531,696
  //   m.l2Vend 1670,547–1820,776
  mantle: fit(Z.mantle, SAFE, 1.4),
  // 路尽头 + 回滚（seg5 L19–L20）
  //   k 1.161 · gate4 230,548–577,860 · gate5 591,422–937,734 · roadend 1100,280–1277,503 · rb0 1345,409–1515,654 · rb1 1520,537–1690,782
  rollback: fit(Z.rollback, SAFE, 1.4),
  // 三个角色 + 三条链的小副本（seg6 L0–L5）
  //   k 0.947 · role.eng 780,310–875,514 · role.aud 941,311–1036,514 · role.user 1102,310–1196,514 · chain0 723,714–818,860 · chain1 912,714–1008,860
  //   chain2 1102,714–1197,860
  roles: fit(Z.roles, SAFE, 1.4),
  // 全景：所有区（seg6 L10 结束卡前拉远）— k 0.166
  world: fit([...Z.F, ...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E], [60, 200, 1860, 860], 1),
};
