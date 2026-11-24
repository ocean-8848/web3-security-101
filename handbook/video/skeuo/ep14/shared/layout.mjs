// ep14「证明流水线」shared world layout — one continuous isometric world, fixed for all six segments:
//   import { PLATE_A, RULE, SHEET, GRADER, AUTHOR, PROVER_ATK, BITS, MAG_A, TAGS,
//            PLATE_T, MERKLE, HASHBOOK, POOL, PROTECT, TEAM_T, SHADOW_T, BUGLIST,
//            PLATE_B, SIGNERS, PUZZLE, JAR, BURN, KEYS_B, ZDOC, ZMINT,
//            PLATE_C, PROVER, ZKVM, LOOKUP, COMMITTEE, PSWITCH,
//            DIVIDE, DIVSIGN, ROAD, CARDS,
//            PLATE_D, VERIFIER, L1CHAIN, INCARD, CLOCK_D, LEDGER,
//            PLATE_E, DEPREC, SETTLE, VAULT, ADMINKEY, COUNTER, GRID32, ATTACKERS, DOTS_E, BEACON_E, BOUNTY, ECARDS,
//            PLATE_F, PLATFORM, L2CHAIN, L2LINK, CHALLENGER, MAG_F, HOUR_DAYS, VPROOF, HOUR_HRS, MODE, RCLOCK, STAIRS, STAGES, METER_F, TLOCK_F, PHONE_F,
//            EXT, rect, fit, ZONE_RECTS, CAMS, world } from "../../shared/layout.mjs";
// (from ep14/segN/src/build-story.mjs). Positions only; ids, states, labels and per-shot opts stay in each segment.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Every position is written as S(X, Y) = the world point whose ground lands on world-canvas px (X, Y) (iso.G, rounded) —
// so the numbers read as on-screen ground positions at camera scale 1. `scale` = the opts.scale to pass to the object.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): kit person, E06 burnBox, E07 returnTag / dispatchDesk, E11 mintPress, E12 merkleTree and
//   ep14 answerSheet / gradingMachine take opts.scale (anchors already scaled). Everything else IGNORES it. Where such an object carries
//   `scale` below — POOL / PROTECT (kit safe 0.7), ZKVM (E10 coreModule 0.7), LOOKUP (E03 slotCabinet 0.7), COMMITTEE / METER_F
//   (E05 thresholdMeter 0.7), CLOCK_D (kit clock 1.3), L2CHAIN (kit chain 0.8) — the segment MUST "wrap" it (translate · scale · translate
//   around its ground point) and rescale its anchors; rect() / CAMS already assume the scaled size. These carry `wrap: true` as a reminder.
// The road: one straight conveyor along +u at v = 0 (ROAD.from → ROAD.to), every zone's anchor sits on it, so a proof card can walk
//   A → B → C → D → E on the road. Zones (anchor u along the road, world units):
//   A 出题台 u 0 (anchor = answer sheet) · A后 Tornado 角 straight behind A (v −1500) · B 设置仪式 u 1300 · C 证明器 u 2600
//   · 链下|链上 分界 u 3250 · D 验证器 u 3900 · E 结算 u 5200 · F L2 观察台 behind-right of E (u 7000, v −800).
// On screen the road climbs to the upper-right (≈ −0.35 px per px), so each zone sits up-right of the previous one; the per-zone
// framings in CAMS hold only their own zone's key objects. Native-SVG areas (32-cell board, dot cluster, Stage stairs, L2 platform,
// divider line) are given as a ground origin + a box kind in EXT, so the segment knows where it may draw them.
import { Wp, G, camAt } from "../../kit/iso.mjs";

/** world ground point for world-canvas px (X, Y); extra fields (scale, z …) copied in */
const S = (X, Y, extra = {}) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
/** zone-local placer: positions below are written relative to the zone's anchor px */
const zone = (OX, OY) => (X, Y, extra) => S(OX + X, OY + Y, extra);
const zoneAt = (u, v) => { const [X, Y] = Wp(u, v); return zone(Math.round(X), Math.round(Y)); };
const W = { wrap: true };

// ---- A 最左·出题台（电路）(seg2 L2–L3, L9–L18; seg3 L0–L10, L17–L20; seg6 L1): anchor = answer sheet, on the road
const a = zoneAt(0, 0);
export const SHEET = a(0, 0, { scale: 1.2 });            // ep14 answerSheet (hero) 1.2
export const GRADER = a(330, -115);                      // ep14 gradingMachine title "阅卷机" (scale 1), on the road right of the sheet
export const RULE = a(-330, -20);                        // kit doc standing "评分规则 = 电路" (5 constraint lines)
export const PLATE_A = a(-660, -90);                     // E01 signBoard plate "电路 · 出题台" (size 30)
export const AUTHOR = a(-470, 170, { scale: 0.7 });      // kit person engineer "出题人" 0.7
export const PROVER_ATK = a(170, 150, { scale: 0.7 });   // kit person attacker "考生 / 恶意证明者" 0.7
export const BITS = a(-290, 290);                        // E03 byteBlock n 5 "5 个二进制位" (extends +u to the right)
export const MAG_A = a(-150, -90);                       // kit magnifier "静态分析" (lens hovers up-right of this point, over the rule doc's right edge)
export const TAGS = [a(470, 110), a(600, 150)];          // E07 returnTag ok "正测试" / false "反测试" (scale 1)

// ---- A后 Tornado 角 (seg3 L11–L16): straight behind A (−v)
const t = zoneAt(0, -1500);
export const MERKLE = t(0, 0, { scale: 0.8 });           // E12 merkleTree rootText "根" 0.8
export const HASHBOOK = t(-340, 70);                     // E03 manual title "哈希实现" open
export const BUGLIST = t(-360, -210);                    // kit doc standing "公开漏洞清单"
export const POOL = t(320, -60, { scale: 0.7, ...W });   // kit safe gold "资金池" (wrap 0.7!)
export const PROTECT = t(640, 90, { scale: 0.7, ...W }); // kit safe "保护" door open, green glow (wrap 0.7!)
export const TEAM_T = t(400, 200, { scale: 0.7 });       // kit person engineer "团队" 0.7
export const SHADOW_T = t(140, 170, { scale: 0.7 });     // kit person attacker 0.7 (silhouette)
export const PLATE_T = t(-60, -260);                     // optional plate "Tornado Cash · 2019" (size 30) — or use the event card instead

// ---- B 左中·设置仪式（可信设置）(seg2 L6; seg4 L1–L7): anchor = puzzle set centre, on the road
const b = zoneAt(1300, 0);
export const PUZZLE = b(-40, 40);                        // E02 puzzleSet assembled false (three pieces, one in front of each signer)
export const SIGNERS = [b(-260, -90), b(60, -150), b(330, -40)].map((q) => ({ ...q, scale: 0.6 })); // kit person signer ×3 "参与者" 0.6
export const JAR = b(-480, 150);                         // E02 seedJar label "有毒废料" lit
export const BURN = b(-560, -150, { scale: 0.7 });       // E06 burnBox "销毁" 0.7
export const KEYS_B = [b(260, -290), b(420, -230)];      // kit key ×2 "证明密钥" / "验证密钥" (rise from the circle in seg4 L2)
export const PLATE_B = b(-180, -330);                    // E01 signBoard plate "可信设置" (size 30)
export const ZDOC = b(500, 200);                         // Zcash corner: kit doc standing "设置产物" (3 ink + 2 red lines)
export const ZMINT = b(720, 250, { scale: 0.6 });        // Zcash corner: E11 mintPress nameplate "ZEC" 0.6 (no dot matrix)

// ---- C 中间偏左·证明器（链下）(seg2 L4; seg4 L8–L11): anchor = prover machine, on the road
const c = zoneAt(2600, 0);
export const PROVER = c(0, 0);                           // E03 contractMachine name "证明器" tone gray (original size); proof card leaves at anchors.out
export const ZKVM = c(320, -150, { scale: 0.7, ...W });  // E10 coreModule "zkVM" (wrap 0.7!)
export const LOOKUP = c(-480, -60, { scale: 0.7, ...W }); // Plonky2 corner: E03 slotCabinet title "查找表" (wrap 0.7!)
export const COMMITTEE = c(240, 300, { scale: 0.7, ...W }); // ZKsync corner: E05 thresholdMeter thText "安全委员会" max 3 th 2 (wrap 0.7!)
export const PSWITCH = c(520, 250);                      // ZKsync corner: kit knifeSwitch text "证明生产" (pulled in seg4 L11)
export const PLATE_C = c(-160, -330);                    // E01 signBoard plate "证明器 · 链下" (size 30)

// ---- 链下 | 链上 分界 (全片): native SVG teal line across the road + small plate
export const DIVIDE = S(...Wp(3250, 0));                 // the line crosses the road here, running along v (EXT.divide)
export const DIVSIGN = S(...Wp(3250, 260));              // E01 signBoard plate "链下 | 链上" (size 22), in front of the road

// ---- D 中间偏右·验证器（链上）(seg1 L9; seg2 L5, L17; seg4 L12–L19; seg5 L0): anchor = verifier, on the road
const d = zoneAt(3900, 0);
export const VERIFIER = d(0, 0, { scale: 1.2 });         // ep14 gradingMachine title "验证器" 1.2 (same model as GRADER)
export const L1CHAIN = d(-60, -330);                      // kit chain n 4 title "L1" (original size), behind the verifier along u
export const INCARD = d(-280, 98);                       // E02 proofCard on the road, about to enter the verifier slot
export const CLOCK_D = d(260, 170, { scale: 1.3, ...W }); // kit clock "钟面" (wrap 1.3!)
export const LEDGER = d(470, 250, { scale: 0.8 });       // E07 dispatchDesk "只能用一次的记录" 0.8
export const PLATE_D = d(-480, -180);                    // E01 signBoard plate "验证器 · 链上" (size 30)

// ---- E 右侧·结算（业务合约）(seg1 L0–L8; seg2 L7; seg5 L0–L9; seg6 L2, L6–L8): anchor = settle machine, on the road
const e = zoneAt(5200, 0);
export const SETTLE = e(0, 0);                           // E03 contractMachine name "结算" tone light (original size)
export const VAULT = e(540, -270);                       // kit safe gold "Aztec Connect" (original size, door can open)
export const ATTACKERS = [e(300, -190), e(800, -110)].map((q) => ({ ...q, scale: 0.7 })); // kit person attacker ×2 0.7, either side of the vault
export const DOTS_E = e(420, 20);                        // red dot matrix area (native SVG, 114 dots → 110 + 4), EXT.dotsE, flowing out of the vault
export const ADMINKEY = e(850, 140);                     // kit key state broken "管理员密钥 · 已放弃"
export const COUNTER = e(240, 190);                      // E02 rollCounter digits 2 value 32 "笔数字段"
export const GRID32 = e(-270, 250);                      // 4×8 = 32 cell board (native SVG on the ground), EXT.grid32
export const ECARDS = [0, 1, 2, 3, 4].map((i) => e(-250 - i * 122, Math.round(0.35 * (250 + i * 122)))); // E02 proofCard ×5 in a row on the road (seg1 L2)
export const BEACON_E = e(-640, -40);                    // kit beacon "监控"
export const BOUNTY = e(-560, -250);                     // kit doc standing "赏金范围"
export const PLATE_E = e(-240, -330);                    // E01 signBoard plate "结算 · 业务合约" (size 30)
export const DEPREC = e(110, -470);                      // E01 signBoard plate "已弃用" (gray, size 30)

// ---- F 最右端后方·L2 观察台 (seg5 L10–L17; seg6 L3–L5): behind-right of E, on a raised platform (native SVG slab, EXT.platform)
const fz = zoneAt(7000, -800);
export const PLATFORM = fz(0, 0);                        // platform centre (draw a low slab, ≈ 1500 × 700 screen px, EXT.platform)
export const L2CHAIN = fz(-40, -230, { scale: 0.8, ...W }); // kit chain n 3 title "L2" (wrap 0.8!)
export const L2LINK = { from: L2CHAIN, to: L1CHAIN };    // native dashed line L2 chain → D's L1 chain (seg5 L10)
export const CHALLENGER = fz(-470, 60, { scale: 0.7 });  // fraud-proof side: kit person engineer "挑战者" 0.7
export const MAG_F = fz(-360, 40);                       // kit magnifier (lens up-right of this point, toward the L2 chain)
export const HOUR_DAYS = fz(-620, 140);                  // kit hourglass "几天"
export const VPROOF = fz(-80, 130);                      // validity-proof side: E02 proofCard "有效性证明"
export const HOUR_HRS = fz(70, 160);                     // kit hourglass "几小时"
export const MODE = fz(330, 50);                         // kit knifeSwitch text "证明模式"
export const RCLOCK = fz(540, 300);                      // kit clock "回滚 约 1.5 小时" (original size)
export const PHONE_F = fz(-160, 370);                    // kit phone screen "Stage ?"
export const STAIRS = fz(880, -130);                     // Stage stairs (native SVG, three steps rising to the upper-right), EXT.stairs
export const STAGES = [fz(680, -20), fz(880, -130), fz(1080, -240)]; // E01 signBoard plate "Stage 0" / "Stage 1" / "Stage 2" (size 22), one per step
export const METER_F = fz(560, -330, { scale: 0.7, ...W }); // E05 thresholdMeter thText "安全委员会" (wrap 0.7!), by Stage 0–1
export const TLOCK_F = fz(1270, -150);                   // E01 timeLock "时间锁 / 退出窗口", by Stage 2
export const PLATE_F = fz(-420, -300);                   // E01 signBoard plate "L2" (size 30)

// the road (native SVG strip along v = 0) and the proof card's stops along it
export const ROAD = { from: { u: -900, v: 0 }, to: { u: 6100, v: 0 }, halfWidth: 70 };
export const CARDS = { a: SHEET, b: PUZZLE, c: PROVER, divide: DIVIDE, d: INCARD, e: SETTLE };

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 (measured from the rendered SVGs:
// visible geometry only, contact shadows / glow and hidden layers excluded). [x0, y0, x1, y1]; y0 includes signs / dials / heads.
// Native-SVG areas are the boxes reserved for them, from their ground origin.
export const EXT = {
  answerSheet: [-38, -133, 38, 15], gradingMachine: [-91, -128, 91, 43], docStanding: [-84, -261, 107, 23], plate: [-148, -237, 120, 54],
  plateS: [-103, -214, 76, 39], person: [-50, -208, 50, 7], personAtk: [-50, -229, 50, 7], byteBlock: [-7, -74, 171, 5],
  magnifier: [-58, -260, 120, -105], returnTag: [-30, -62, 29, 7], merkleTree: [-92, -182, 92, 39], manual: [-137, -94, 132, 64],
  safe: [-180, -376, 181, 82], key: [-75, -35, 84, 31], puzzleSet: [-200, -85, 286, 129], seedJar: [-63, -170, 63, 29], burnBox: [-120, -202, 120, 58],
  mintPress: [-114, -238, 114, 55], contractMachine: [-155, -246, 185, 76], coreModule: [-73, -179, 73, 32], slotCabinet: [-209, -467, 209, 90],
  thresholdMeter: [-52, -290, 137, 26], knifeSwitch: [-153, -344, 133, 48], chain4: [-287, -197, 287, 110], chain3: [-213, -171, 213, 85],
  proofCard: [-61, -158, 59, 23], clock: [-76, -193, 61, 2], dispatchDesk: [-113, -147, 113, 44], rollCounter: [-52, -90, 52, 24],
  beacon: [-61, -118, 61, 30], hourglass: [-56, -201, 56, 28], timeLock: [-64, -182, 64, 27], phone: [-70, -195, 58, 27],
  grid32: [-130, -40, 150, 80], dotsE: [0, -10, 300, 130], stairs: [-300, -170, 320, 150], platform: [-760, -420, 760, 340], divide: [-120, -90, 120, 90],
};
// rect(o, kind, scale) → world-canvas bbox [x0, y0, x1, y1] of that object standing at o
export const rect = (o, kind, scale = o.scale ?? 1) => { const [X, Y] = Wp(o.u, o.v); const q = EXT[kind]; return [X + q[0] * scale, Y + q[1] * scale, X + q[2] * scale, Y + q[3] * scale]; };
// fit(rects, screenRect, kmax) → camera {x, y, scale} for KIT.cam / KIT.camSet, fitting the union of rects into screenRect
export const fit = (rects, [x0, y0, x1, y1], kmax = 1.4) => {
  const X0 = Math.min(...rects.map((q) => q[0])), Y0 = Math.min(...rects.map((q) => q[1]));
  const X1 = Math.max(...rects.map((q) => q[2])), Y1 = Math.max(...rects.map((q) => q[3]));
  const k = Math.min(kmax, (x1 - x0) / (X1 - X0), (y1 - y0) / (Y1 - Y0));
  return camAt([(X0 + X1) / 2, (Y0 + Y1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};

// key objects per zone (the rects each framing must hold)
const R = {
  sheet: rect(SHEET, "answerSheet"), grader: rect(GRADER, "gradingMachine"), rule: rect(RULE, "docStanding"), plateA: rect(PLATE_A, "plate"),
  author: rect(AUTHOR, "person"), proverAtk: rect(PROVER_ATK, "personAtk"), bits: rect(BITS, "byteBlock"), magA: rect(MAG_A, "magnifier"),
  tags: TAGS.map((q) => rect(q, "returnTag")),
  merkle: rect(MERKLE, "merkleTree"), hashbook: rect(HASHBOOK, "manual"), buglist: rect(BUGLIST, "docStanding"), pool: rect(POOL, "safe"),
  protect: rect(PROTECT, "safe"), teamT: rect(TEAM_T, "person"), shadowT: rect(SHADOW_T, "personAtk"), plateT: rect(PLATE_T, "plate"),
  puzzle: rect(PUZZLE, "puzzleSet"), signers: SIGNERS.map((q) => rect(q, "person")), jar: rect(JAR, "seedJar"), burn: rect(BURN, "burnBox"),
  keysB: KEYS_B.map((q) => rect(q, "key")), plateB: rect(PLATE_B, "plate"), zdoc: rect(ZDOC, "docStanding"), zmint: rect(ZMINT, "mintPress"),
  prover: rect(PROVER, "contractMachine"), zkvm: rect(ZKVM, "coreModule"), lookup: rect(LOOKUP, "slotCabinet"), committee: rect(COMMITTEE, "thresholdMeter"),
  pswitch: rect(PSWITCH, "knifeSwitch"), plateC: rect(PLATE_C, "plate"),
  verifier: rect(VERIFIER, "gradingMachine"), l1: rect(L1CHAIN, "chain4"), incard: rect(INCARD, "proofCard"), clockD: rect(CLOCK_D, "clock"),
  ledger: rect(LEDGER, "dispatchDesk"), plateD: rect(PLATE_D, "plate"),
  settle: rect(SETTLE, "contractMachine"), vault: rect(VAULT, "safe"), attackers: ATTACKERS.map((q) => rect(q, "personAtk")), dotsE: rect(DOTS_E, "dotsE"),
  adminkey: rect(ADMINKEY, "key"), counter: rect(COUNTER, "rollCounter"), grid32: rect(GRID32, "grid32"), ecards: ECARDS.map((q) => rect(q, "proofCard")),
  beaconE: rect(BEACON_E, "beacon"), bounty: rect(BOUNTY, "docStanding"), plateE: rect(PLATE_E, "plate"), deprec: rect(DEPREC, "plate"),
  l2: rect(L2CHAIN, "chain3"), challenger: rect(CHALLENGER, "person"), magF: rect(MAG_F, "magnifier"), hourDays: rect(HOUR_DAYS, "hourglass"),
  vproof: rect(VPROOF, "proofCard"), hourHrs: rect(HOUR_HRS, "hourglass"), mode: rect(MODE, "knifeSwitch"), rclock: rect(RCLOCK, "clock"),
  phoneF: rect(PHONE_F, "phone"), stairs: rect(STAIRS, "stairs"), stages: STAGES.map((q) => rect(q, "plateS")), meterF: rect(METER_F, "thresholdMeter"),
  tlockF: rect(TLOCK_F, "timeLock"), plateF: rect(PLATE_F, "plate"),
};
export const ZONE_RECTS = {
  A: [R.sheet, R.grader, R.rule, R.plateA, R.author, R.proverAtk, R.bits, R.magA, ...R.tags],
  T: [R.merkle, R.hashbook, R.buglist, R.pool, R.protect, R.teamT, R.shadowT, R.plateT],
  B: [R.puzzle, ...R.signers, R.jar, R.burn, ...R.keysB, R.plateB, R.zdoc, R.zmint],
  C: [R.prover, R.zkvm, R.lookup, R.committee, R.pswitch, R.plateC],
  D: [R.verifier, R.l1, R.incard, R.clockD, R.ledger, R.plateD],
  E: [R.settle, R.vault, ...R.attackers, R.dotsE, R.adminkey, R.counter, R.grid32, ...R.ecards, R.beaconE, R.bounty, R.plateE, R.deprec],
  F: [R.l2, R.challenger, R.magF, R.hourDays, R.vproof, R.hourHrs, R.mode, R.rclock, R.phoneF, R.stairs, ...R.stages, R.meterF, R.tlockF, R.plateF],
};
const Z = ZONE_RECTS;
const SAFE = [100, 280, 1820, 860];                      // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for code cards at the sides
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur). Screen bboxes below are [x0, y0, x1, y1] on the 1920×1080 frame
// (from the layout check), on the line right above each key; every key rect lands inside x 60–1860, y 160–860 and none enters x<620,y<260.
// Stage plates (STAGES) stand on the STAIRS area on purpose — that overlap is the only one inside a zone.
export const CAMS = {
  // 全景：证明流水线 A → F（seg1 终点 L11、seg2 起点 L0–L1、L8、L16–L17；seg6 L0、L9–L11）
  //   k 0.208
  wide: fit([...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E, ...Z.F], [60, 200, 1860, 860], 1),
  // A 出题台：规则文件 + 出题人 + 答题卡 + 阅卷机（seg2 L2–L3、L18 终点；seg3 起点 L0–L2、L9–L10、L17–L20 防御；seg4 起点；seg6 L1）
  //   k 0.9 · sheet 999,451–1082,611 · grader 1255,376–1419,530 · rule 668,342–840,597 · plateA 314,300–555,562 · author 586,617–649,752 · proverAtk 1162,585–1225,734
  //   bits 773,789–934,860 · magA 853,280–1013,419 · tags0 1437,638–1490,700 · tags1 1553,674–1606,736
  ruleA: fit(Z.A, SAFE, 1.4),
  // 近景：答题卡 + 阅卷机 + 规则文件 + 两个小人（seg2 L9–L15 阅卷机比喻；seg3 L3、L8）
  //   k 1.228 · sheet 956,449–1068,667 · grader 1305,347–1528,557 · rule 504,300–738,649 · author 392,675–477,860 · proverAtk 1177,632–1263,835
  sheetA: fit([R.sheet, R.grader, R.rule, R.author, R.proverAtk], MID, 1.4),
  // 近景：5 个二进制位 + 答题卡 + 阅卷机（seg3 L4–L8 玩具例子，留左侧给代码卡 B）
  //   k 1.041 · bits 857,778–1042,860 · sheet 1118,387–1213,572 · grader 1414,300–1604,478 · proverAtk 1306,542–1378,714
  bitsA: fit([R.bits, R.sheet, R.grader, R.proverAtk], [640, 300, 1820, 860], 1.6),
  // A后 Tornado 角（seg3 L11–L16）
  //   k 0.826 · merkle 780,570–902,716 · hashbook 446,671–668,801 · buglist 474,301–632,536 · pool 1001,424–1210,688 · protect 1265,547–1474,812 · teamT 1142,736–1200,860
  //   shadowT 928,699–986,835 · plateT 669,280–890,520
  tornA: fit(Z.T, SAFE, 1.4),
  // B 设置仪式：三人 + 拼图 + 种子罐 + 销毁箱 + 两把钥匙（seg2 L6；seg4 L1–L4）
  //   k 0.778 · puzzle 828,686–1206,852 · signers0 789,554–836,654 · signers1 1038,507–1085,607 · signers2 1248,593–1294,693 · jar 592,705–690,860 · burn 514,494–644,636
  //   keysB0 1158,468–1282,519 · keysB1 1283,515–1406,566 · plateB 759,280–967,506
  setupB: fit([R.puzzle, ...R.signers, R.jar, R.burn, ...R.keysB, R.plateB], SAFE, 1.4),
  // 近景：B 的 Zcash 角（seg4 L5–L7）
  //   k 1.022 · zdoc 806,508–1001,799 · zmint 1047,680–1186,860 · keysB1 734,300–896,368
  zcashB: fit([R.zdoc, R.zmint, ...R.keysB.slice(1)], MID, 1.4),
  // C 证明器 + zkVM + 查找表（seg2 L4；seg4 L8–L9）
  //   k 0.902 · prover 936,570–1243,860 · zkvm 1318,543–1410,676 · lookup 510,443–774,794 · plateC 797,280–1039,542
  proverC: fit([R.prover, R.zkvm, R.lookup, R.plateC], SAFE, 1.4),
  // 近景：C 的 ZKsync 角：安全委员会 + 证明生产闸刀 + 证明器出口（seg4 L10–L11）
  //   k 0.992 · committee 915,640–1046,860 · pswitch 1077,451–1360,839 · prover 560,300–897,620
  committeeC: fit([R.committee, R.pswitch, R.prover], MID, 1.4),
  // D 验证器 + L1 链 + 进料证明卡（seg1 L9；seg2 L5、L17；seg4 L12–L13、L15、L18–L19 终点；seg5 起点；seg6 L7）
  //   k 0.714 · verifier 906,547–1062,693 · l1 736,280–1146,499 · incard 741,614–826,743 · plateD 536,359–727,566 · clockD 1100,599–1227,780 · ledger 1255,751–1384,860
  verifD: fit([R.verifier, R.l1, R.incard, R.plateD, R.clockD, R.ledger], SAFE, 1.4),
  // 近景：D 钟面 + 登记簿 + 验证器（seg4 L14–L17）
  //   k 1.276 · clockD 878,393–1106,716 · ledger 1156,665–1387,860 · verifier 533,300–812,562
  clockD: fit([R.clockD, R.ledger, R.verifier], MID, 1.4),
  // E 近景：Aztec Connect 保险柜 + 一排证明卡 + 结算机 + 攻击者 + 点阵（seg1 起点 L0–L7；seg5 L0–L1；seg6 L6）
  //   k 0.642 · vault 1101,319–1333,613 · settle 771,576–989,783 · attackers0 1040,509–1085,615 · attackers1 1361,560–1406,666 · dotsE 1139,740–1332,830
  //   deprec 846,280–1018,467 · ecards0 670,689–747,805 · ecards1 592,716–669,832 · ecards2 514,744–591,860
  aztecE: fit([R.vault, R.settle, ...R.attackers, R.dotsE, R.deprec, ...R.ecards.slice(0, 3)], SAFE, 1.4),
  // E 近景：结算机 + 32 格板 + 笔数字段（seg1 L8；seg2 L7；seg5 L2–L9；seg6 L2、L8）
  //   k 0.973 · settle 654,300–985,613 · grid32 415,743–688,860 · counter 988,636–1089,747 · ecards0 502,471–619,647 · dotsE 1213,549–1505,685
  settleE: fit([R.settle, R.grid32, R.counter, R.ecards[0], R.dotsE], MID, 1.4),
  // F 观察台全景（seg5 L10–L15；seg6 起点、L3–L5）
  //   k 0.621 · l2 625,385–837,513 · challenger 442,560–486,654 · magF 496,477–607,573 · hourDays 336,576–405,718 · vproof 668,596–743,708 · hourHrs 764,588–834,730
  //   mode 866,431–1043,674 · rclock 1044,680–1129,801 · phoneF 613,722–692,860 · stairs 1116,427–1501,626 · stages0 1114,468–1225,625 · stages1 1238,400–1350,557
  //   stages2 1362,331–1474,488 · meterF 1081,282–1163,420 · tlockF 1505,407–1584,537 · plateF 403,280–570,461
  l2F: fit(Z.F, SAFE, 1.4),
  // 近景：F Stage 台阶 + 安全委员会 + 时间锁（seg5 L16–L17 终点）
  //   k 0.888 · stairs 804,507–1355,791 · stages0 801,565–960,790 · stages1 979,468–1138,692 · stages2 1157,370–1316,594 · meterF 754,300–872,496 · tlockF 1360,478–1474,664
  //   mode 446,512–700,860
  stageF: fit([R.stairs, ...R.stages, R.meterF, R.tlockF, R.mode], MID, 1.4),
  // 中景：D + E（seg1 L9 从 E 往左带到 D、seg5 L0 从 D 横移到 E 的中途）
  //   k 0.425
  DE: fit([...Z.D, ...Z.E], SAFE, 1),
  // 中景：E + F + D 的 L1 链（seg5 L10 拉高看到 F 与 L1 的连线）
  //   k 0.321
  EF: fit([R.l1, R.verifier, ...Z.E, ...Z.F], SAFE, 1),
};
export const world = CAMS.wide;
