// ep16「链上小镇」shared world layout — one continuous isometric world, fixed for all six segments:
//   import { SIGNA, ROTA, RACKA, METERA, DOTSA, CHAINA, FORKA, DESKA, FSIGA, CKPTA, BEACONA,
//            SIGNB, NOTARIES, ATKB, CONTRACT, SEALB, HOURB, ROLES,
//            SIGNC, RIGS, ARIGS, PUBCHAIN, PRIVCHAIN, FORKC, ROLLC, HOURC, DESKC, BEACONC, DOTSC,
//            SIGND, GATE, METERD, CLIENTS, CHAIND, REWRITE, SHARES, OLDKEY, NEWNODE, CPDOCS, MAGD,
//            SIGNE, KNIFE, CLOCKE, BRIDGE, MINORITY, FREEZE, SORTER, LETTERS, FSIGE, L1CHAIN, FPIPE, DESKE, CUSTODY, WITNESS, PHONE,
//            ROAD, EXT, rect, fit, ZONE_RECTS, CAMS, world } from "../../shared/layout.mjs";
// (from ep16/segN/src/build-story.mjs). Positions only; ids, states, labels and per-shot opts stay in each segment.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Every position is written as S(X, Y) = the world point whose ground lands on world-canvas px (X, Y) (iso.G, rounded) —
// so the numbers read as on-screen ground positions at camera scale 1. `scale` = the opts.scale to pass to the object.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): of the objects below only kit person, E07 dispatchDesk, E09 rotaWheel / commitBox and
//   ep16 finalitySignal / forkSwitch take opts.scale. Everything else IGNORES it. Where such an object carries `scale` below it is a
//   "wrap" object — the segment MUST put it with the wrap helper (translate · scale · translate around its ground point) and rescale its
//   anchors; rect() / CAMS already assume the scaled size:
//     METERA / METERD (E05 thresholdMeter 0.8), CKPTA (kit checkpoint 0.7), RIGS / ARIGS (E02 gpuRig 0.7), CLIENTS (kit rack 0.75),
//     BRIDGE (E01 bridge 0.6), L1CHAIN (kit chain 0.7), CUSTODY (kit safe 0.8).
//   E01 sorter stays original size (do not walk its letters on a scaled sorter).
// Zones (world-canvas px), one row left → right along the stone road (each zone a little higher on screen, like walking +u):
//   A 升级机房 (anchor 0, 0; X ≈ −890..1060, Y ≈ −470..700)
//   · B 公证处 (anchor 2700, −250)  · C 矿场 (anchor 5400, −500)  · D 检查点关卡 (anchor 8200, −750)  · E 停链广场 (anchor 11100, −1000).
// Neighbouring zones are ≥ ~250 canvas px apart edge to edge (A–B ≈ 760, B–C ≈ 600, C–D ≈ 430, D–E ≈ 260); the per-zone framings in
// CAMS hold only their own zone's key objects. Per-object screen bboxes at each framing are quoted next to CAMS.
// Native-SVG areas (dot matrices, the stone road) are given as a ground origin + a box kind in EXT.
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
const ZA = [0, 0], ZB = [2700, -250], ZC = [5400, -500], ZD = [8200, -750], ZE = [11100, -1000];

// ---- A 升级机房·开场 (seg1 全段; seg2 L0–L4; seg6 L1–L5, L8–L12): anchor = between the rota wheel and the main chain
const a = zone(...ZA);
export const SIGNA = a(-760, -200);                      // E01 signBoard plate "主网升级 · Fusaka"
export const ROTA = a(-420, 0);                          // E09 rotaWheel n 12 "验证者" (scale 1; 3 seats turn red from L2)
export const RACKA = a(-150, -120);                      // kit rack tag "Prysm" (original size; leds green → red)
export const METERA = a(60, -60, { scale: 0.8 });        // E05 thresholdMeter "参与率" th at 2/3 (wrap 0.8!), level full → ~75%
export const DOTSA = a(-560, 120);                       // 38-dot red matrix from the wheel (native SVG, 1 dot ≈ 10 ETH), EXT.dotsA
export const CHAINA = a(500, 120);                       // kit chain n 4 "主链" (original size); new blocks grow to +u (keep ≈ 180 u free on its right)
export const FORKA = a(130, 340);                        // ep16 forkSwitch (scale 1) in front of the chain's first block (seg2 L2–L3, seg6 L4)
export const DESKA = a(480, 470, { scale: 0.8 });        // E07 dispatchDesk "交易所入账" 0.8 (entries "N 个区块 ✓")
export const FSIGA = a(800, 470);                        // ep16 finalitySignal (scale 1)
export const CKPTA = a(60, 600, { scale: 0.7 });         // kit checkpoint n "检查点" (wrap 0.7!)
export const BEACONA = a(1000, 380);                     // kit beacon "最终性延迟告警" (seg6)

// ---- B 公证处·比喻 + 资源分类 (seg2 L5–L17; seg6 L12)
const b = zone(...ZB);
export const SIGNB = b(-700, -150);                      // E01 signBoard plate "比喻 · 公证处"
export const CONTRACT = b(-300, -120);                   // kit doc standing "房产买卖合同" stamp
export const NOTARIES = [b(-420, 60), b(-320, 110), b(-220, 150), b(-120, 180), b(-20, 200)].map((q) => ({ ...q, scale: 0.6 })); // kit person signer ×5 0.6 "公证员"
export const ATKB = b(250, 220, { scale: 0.7 });         // kit person attacker 0.7
export const SEALB = b(0, -60);                          // kit seal "公证"
export const HOURB = b(380, 40);                         // kit hourglass "按小时租"
export const ROLES = b(750, -40);                        // E05 roleBoard "攻击者控制了什么" (original size; six cards)

// ---- C 矿场·PoW (seg3 全段; seg6 L2)
const c = zone(...ZC);
export const SIGNC = c(-1000, -300);                     // E01 signBoard plate "PoW · 算力"
export const RIGS = [c(-700, -120), c(-490, -120), c(-280, -120)].map((q) => ({ ...q, scale: 0.7 }));  // E02 gpuRig ×3 honest (wrap 0.7!)
export const ARIGS = [c(-700, 180), c(-490, 180), c(-280, 180)].map((q) => ({ ...q, scale: 0.7 }));   // E02 gpuRig ×3 attacker "租来的算力" (wrap 0.7!)
export const FORKC = c(-60, 60);                         // ep16 forkSwitch (scale 1) at the fork, left of both chains
export const PUBCHAIN = c(300, -150);                    // kit chain n 4 "公开链" (original size), back
export const PRIVCHAIN = c(380, 200);                    // kit chain n 5 "私下链" all attacker (original size), front
export const ROLLC = c(850, -120);                       // E02 rollCounter digits 3 "确认数" (original size)
export const HOURC = c(1080, -60);                       // kit hourglass "租用时长"
export const DESKC = c(880, 430, { scale: 0.8 });        // E07 dispatchDesk "交易所" 0.8 (entries "充值 ✓" "提走 ✓")
export const BEACONC = c(1080, 380);                     // kit beacon "重组告警"
export const DOTSC = c(-650, 330);                       // two dot clusters (11 + 56, 1 dot ≈ 10 万美元) side by side, EXT.dotsC

// ---- D 检查点关卡·PoS (seg4 全段; seg6 L5)
const d = zone(...ZD);
export const SIGND = d(-950, -300);                      // E01 signBoard plate "PoS · 最终性"
export const GATE = d(-500, 0);                          // kit checkpoint n "检查点" (original size; armUp = finalized)
export const METERD = d(-60, -120, { scale: 0.8 });      // E05 thresholdMeter "投票" th 2/3 (wrap 0.8!)
export const CLIENTS = [d(150, -180), d(330, -110), d(510, -40)].map((q) => ({ ...q, scale: 0.75 })); // kit rack ×3 "客户端 A/B/C" (wrap 0.75!)
export const CHAIND = d(80, 350);                        // kit chain n 4 "主链" (original size)
export const REWRITE = d(-120, 640);                     // kit chain n 3 attacker "改写的历史" (original size), forks off CHAIND's first block toward +v
export const SHARES = [d(740, 220), d(960, 160), d(1180, 100), d(1400, 40)]; // E01 signBoard plate ×4 "约 33%" "约 34%" "约 51%" "约 66%" (staircase base = native SVG, EXT.stairs from SHARES[0])
export const OLDKEY = d(500, 520);                       // kit key attacker "旧私钥"
export const NEWNODE = d(760, 560, { scale: 0.6 });      // kit person engineer 0.6 "新节点"
export const CPDOCS = [d(940, 480), d(1290, 480)];       // kit doc standing ×2 "检查点 · 来源 1 / 2"
export const MAGD = d(1100, 800);                        // kit magnifier "比对" (floats; its box is above the ground point)

// ---- E 停链广场 (seg5 全段; seg6 L6–L7)
const e = zone(...ZE);
export const SIGNE = e(-1000, -300);                     // E01 signBoard plate "停链与回滚"
export const KNIFE = e(-700, -60);                       // kit knifeSwitch text "出块"
export const CLOCKE = e(-420, -150);                     // kit clock "约 17 小时"
export const BRIDGE = e(-560, 260, { scale: 0.6 });      // E01 bridge booth attacker "跨链桥" (wrap 0.6!)
export const MINORITY = e(-200, 60, { scale: 0.7 });     // E09 rotaWheel n 6 "少数验证者" 0.7
export const FREEZE = e(-120, 300);                      // kit seal "冻结"
export const LETTERS = [e(-60, -170, { z: 0 }), e(0, -150, { z: 0 }), e(60, -130, { z: 0 })]; // E01 letter ×3 (L2 交易), queued left of the sorter
export const SORTER = e(300, -140);                      // E01 sorter "排序器" blockLabel "unsafe" (original size — no scale)
export const FSIGE = e(650, -20);                        // ep16 finalitySignal (scale 1) — unsafe / safe / finalized main stage
export const L1CHAIN = e(500, 250, { scale: 0.7 });      // kit chain n 3 "L1" (wrap 0.7!)
export const DESKE = e(900, 150, { scale: 0.8 });        // E07 dispatchDesk "交易所" 0.8
export const CUSTODY = e(250, 640, { scale: 0.8 });      // kit safe gold "托管的客户 STEEM" (wrap 0.8!)
export const WITNESS = e(620, 560, { scale: 0.8 });      // E09 commitBox name "见证人投票" 0.8
export const PHONE = e(900, 480);                        // kit phone (seg6 L6, original size)
export const FPIPE = route(L1CHAIN, SORTER, 60, [0, -60], [60, 40]); // E01 pipe L1 → sorter "强制包含" (world units)

// stone road (native SVG): polyline of ground points through the zones, drawn under everything
export const ROAD = [S(-1100, 260), S(1300, 120), S(2700 + 1100, -100), S(5400 + 1300, -280), S(8200 + 1600, -520), S(11100 + 1300, -760)];

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 (measured from the rendered SVGs with
// the opts above: visible geometry only, contact shadows / glow and hidden layers excluded). [x0, y0, x1, y1]; y0 includes signs / heads.
export const EXT = {
  finalitySignal: [-28, -196, 80, 14], forkSwitch: [-44, -116, 53, 23],
  signA: [-218, -270, 191, 79], signB: [-176, -255, 148, 64], signC: [-156, -248, 128, 57], signD: [-172, -254, 145, 63], signE: [-146, -245, 119, 54],
  signShare: [-120, -236, 92, 45], rotaWheel: [-112, -113, 112, 56], rack: [-113, -349, 113, 51], thresholdMeter: [-52, -316, 89, 26],
  chain3: [-213, -171, 213, 85], chain4: [-287, -197, 287, 110], chain5: [-361, -223, 361, 136], checkpoint: [-213, -305, 284, 143],
  dispatchDesk: [-113, -147, 113, 44], beacon: [-61, -118, 61, 30], person: [-50, -208, 50, 7], personAtk: [-50, -229, 50, 7],
  docStanding: [-84, -261, 82, 23], seal: [-146, -142, 147, 69], hourglass: [-56, -201, 56, 28], roleBoard: [-194, -334, 187, 72],
  gpuRig: [-143, -349, 143, 56], rollCounter: [-59, -91, 60, 30], key: [-75, -35, 84, 31], magnifier: [-58, -260, 120, -105],
  knifeSwitch: [-153, -344, 133, 48], clock: [-76, -193, 61, 2], bridge: [-367, -208, 367, 207], sorter: [-211, -281, 253, 76],
  letter: [-28, -56, 26, 0], safe: [-180, -376, 181, 82], commitBox: [-94, -175, 95, 40], phone: [-70, -195, 58, 27],
  dotsA: [0, 0, 380, 110], dotsC: [0, 0, 620, 140], stairs: [-130, -20, 790, 110],
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
  signA: rect(SIGNA, "signA"), rota: rect(ROTA, "rotaWheel"), rackA: rect(RACKA, "rack"), meterA: rect(METERA, "thresholdMeter"), dotsA: rect(DOTSA, "dotsA"),
  chainA: rect(CHAINA, "chain4"), forkA: rect(FORKA, "forkSwitch"), deskA: rect(DESKA, "dispatchDesk"), fsigA: rect(FSIGA, "finalitySignal"),
  ckptA: rect(CKPTA, "checkpoint"), beaconA: rect(BEACONA, "beacon"),
  signB: rect(SIGNB, "signB"), contract: rect(CONTRACT, "docStanding"), notaries: NOTARIES.map((q) => rect(q, "person")), atkB: rect(ATKB, "personAtk"),
  sealB: rect(SEALB, "seal"), hourB: rect(HOURB, "hourglass"), roles: rect(ROLES, "roleBoard"),
  signC: rect(SIGNC, "signC"), rigs: RIGS.map((q) => rect(q, "gpuRig")), arigs: ARIGS.map((q) => rect(q, "gpuRig")), forkC: rect(FORKC, "forkSwitch"),
  pub: rect(PUBCHAIN, "chain4"), priv: rect(PRIVCHAIN, "chain5"), roll: rect(ROLLC, "rollCounter"), hourC: rect(HOURC, "hourglass"),
  deskC: rect(DESKC, "dispatchDesk"), beaconC: rect(BEACONC, "beacon"), dotsC: rect(DOTSC, "dotsC"),
  signD: rect(SIGND, "signD"), gate: rect(GATE, "checkpoint"), meterD: rect(METERD, "thresholdMeter"), clients: CLIENTS.map((q) => rect(q, "rack")),
  chainD: rect(CHAIND, "chain4"), rewrite: rect(REWRITE, "chain3"), shares: SHARES.map((q) => rect(q, "signShare")), stairs: rect(SHARES[0], "stairs"),
  oldkey: rect(OLDKEY, "key"), newnode: rect(NEWNODE, "person"), cpdocs: CPDOCS.map((q) => rect(q, "docStanding")), mag: rect(MAGD, "magnifier"),
  signE: rect(SIGNE, "signE"), knife: rect(KNIFE, "knifeSwitch"), clockE: rect(CLOCKE, "clock"), bridge: rect(BRIDGE, "bridge"), minority: rect(MINORITY, "rotaWheel"),
  freeze: rect(FREEZE, "seal"), letters: LETTERS.map((q) => rect(q, "letter")), sorter: rect(SORTER, "sorter"), fsigE: rect(FSIGE, "finalitySignal"),
  l1: rect(L1CHAIN, "chain3"), deskE: rect(DESKE, "dispatchDesk"), custody: rect(CUSTODY, "safe"), witness: rect(WITNESS, "commitBox"), phone: rect(PHONE, "phone"),
};
export const ZONE_RECTS = {
  A: [R.signA, R.rota, R.rackA, R.meterA, R.dotsA, R.chainA, R.forkA, R.deskA, R.fsigA, R.ckptA, R.beaconA],
  B: [R.signB, R.contract, ...R.notaries, R.atkB, R.sealB, R.hourB, R.roles],
  C: [R.signC, ...R.rigs, ...R.arigs, R.forkC, R.pub, R.priv, R.roll, R.hourC, R.deskC, R.beaconC, R.dotsC],
  D: [R.signD, R.gate, R.meterD, ...R.clients, R.chainD, R.rewrite, ...R.shares, R.oldkey, R.newnode, ...R.cpdocs, R.mag],
  E: [R.signE, R.knife, R.clockE, R.bridge, R.minority, R.freeze, ...R.letters, R.sorter, R.fsigE, R.l1, R.deskE, R.custody, R.witness, R.phone],
};
const Z = ZONE_RECTS;
const SAFE = [100, 280, 1820, 860];                      // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for code cards / checklists at the sides
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur). Screen bboxes: run the layout check (see the report in the
// episode notes); every key object of each framing sits inside x 60–1860, y 160–860.
export const CAMS = {
  // ---- A
  // 近景：Fusaka 牌 + 验证者转台 + Prysm 机柜 + 参与率表 + 点阵 + 主链（seg1 起点 L0–L5；seg6 L8–L9）
  upgradeA: fit([R.signA, R.rota, R.rackA, R.meterA, R.dotsA, R.chainA], SAFE, 1.4),
  // 近景：入账台 + 信号柱 + 检查点 + 告警灯（seg1 L6–L11 终点；seg2 起点；seg6 L1–L5、L10–L11）
  deskA: fit([R.deskA, R.fsigA, R.ckptA, R.beaconA], MID, 1.4),
  // 近景：主链 + 扳道器 + 信号柱（seg2 L0–L4 主链与分叉示意）
  chainA: fit([R.chainA, R.forkA, R.fsigA, R.meterA], MID, 1.4),
  // A 全区
  A: fit(Z.A, SAFE, 1.4),
  // ---- B
  // B 公证处：牌 + 合同 + 五名公证员 + 印章 + 攻击者 + 沙漏（seg2 L5–L11）
  notaryB: fit([R.signB, R.contract, ...R.notaries, R.atkB, R.sealB, R.hourB], SAFE, 1.4),
  // B 资源分类板 + 沙漏 + 攻击者 + 印章（seg2 L12–L17 终点；seg3 起点）
  resourceB: fit([R.roles, R.hourB, R.atkB, R.sealB], MID, 1.4),
  B: fit(Z.B, SAFE, 1.4),
  // ---- C
  // C 矿场全景（seg3 L0）
  mineC: fit(Z.C, SAFE, 1.4),
  // 近景：两条链 + 扳道器 + 矿机（seg3 L1–L5、L17–L21）
  forkC: fit([R.pub, R.priv, R.forkC, R.rigs[2], R.arigs[2]], MID, 1.4),
  // 近景：确认数计数器 + 沙漏 + 公开链尾（seg3 L6–L12）
  countC: fit([R.roll, R.hourC, R.pub], MID, 1.4),
  // 近景：点阵两簇 + 租来的矿机（seg3 L13–L16）
  dotsC: fit([R.dotsC, ...R.arigs], MID, 1.4),
  // 近景：入账台 + 重组告警 + 私下链尾（seg3 L22–L23 终点；seg4 起点）
  deskC: fit([R.deskC, R.beaconC, R.priv, R.roll], MID, 1.4),
  // ---- D
  // D 检查点关卡 + 投票表 + 主链（seg4 L0–L2、L7–L9）
  gateD: fit([R.signD, R.gate, R.meterD, R.chainD], SAFE, 1.4),
  // 近景：三台客户端机柜 + 投票表（seg4 L3–L6）
  clientD: fit([...R.clients, R.meterD], MID, 1.4),
  // 近景：四块份额牌阶梯（seg4 L10–L14）
  shareD: fit([...R.shares, R.stairs], MID, 1.4),
  // 近景：改写的历史 + 主链 + 旧私钥 + 新节点 + 两份检查点 + 放大镜（seg4 L15–L21 终点；seg5 起点）
  rangeD: fit([R.chainD, R.rewrite, R.oldkey, R.newnode, ...R.cpdocs, R.mag], SAFE, 1.4),
  D: fit(Z.D, SAFE, 1.4),
  // ---- E
  // E 闸刀 + 时钟 + 桥 + 少数验证者 + 冻结章（seg5 L0–L8）
  haltE: fit([R.signE, R.knife, R.clockE, R.bridge, R.minority, R.freeze], SAFE, 1.4),
  // 近景：排序器 + 信封 + 信号柱 + L1 + 入账台（seg5 L9–L16）
  seqE: fit([R.sorter, ...R.letters, R.fsigE, R.l1, R.deskE], MID, 1.4),
  // 近景：托管保险柜 + 见证人投票箱 + 手机（seg5 L17–L21 终点；seg6 起点、L6–L7）
  voteE: fit([R.custody, R.witness, R.phone], MID, 1.4),
  E: fit(Z.E, SAFE, 1.4),
  // ---- 全景：链上小镇五个区（seg6 L0、L12 → 结束卡）
  wide: fit([...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E], [70, 210, 1850, 850], 1),
};
CAMS.world = CAMS.wide;                                   // alias (older segments call the all-zones framing `world`)
/** world summary: zone anchors (world-canvas px) and the all-zones framing */
export const world = { zones: { A: ZA, B: ZB, C: ZC, D: ZD, E: ZE }, cam: CAMS.wide, road: ROAD };
