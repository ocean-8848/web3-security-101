// ep27「一条安全流水线」shared world layout — one continuous isometric world, fixed for all six segments:
//   import * as L from "../../shared/layout.mjs";   (from ep27/segN/src/build-story.mjs)
//   L.BELT / L.beltAt / L.BELT_Z / L.GATES; zone positions (A_*, B_*, C_*, D_*, E_* below); L.EXT, L.rect, L.fit, L.ZONE_RECTS, L.CAMS, L.world.
// Positions only; ids, states, labels and per-shot opts stay in each segment. Object ids must never be `cam` or `root`.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Like ep26, every position is written as a SCREEN px offset (X, Y) from its zone's anchor (U0, 0), converted to world (u, v)
//   (so the numbers read as on-screen ground positions at camera scale 1). The E02 conveyor runs straight along +u at v = 0 from B to E
//   (screen line Y = −0.35·X through each anchor): "behind the belt" = v < 0 (above that line), "in front" = v > 0 (below it).
//   A 事故展台 is a separate stand to the left; the belt does not reach it.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): `scale` = the opts.scale to pass to the object. Only kit person / ledgerBook, E01 vending / miniVend,
//   E03 gasGauge, E04 punchCard / tellerCounter / callbackArm, E06 burnBox / decimalRuler / roundCutter / shareDispenser / shareCert,
//   E07 oddCoin / scale / returnTag, E14 gradingMachine / answerSheet, E16 forkSwitch, E22 wrench and E27 planeModel take opts.scale
//   (E06 roundCutter defaults to 1.25 — pass scale explicitly). Everything else here that carries `scale` IGNORES it: the segment MUST put it
//   with the wrap helper (translate · scale · translate around its ground point) and rescale its anchors — marked "(wrap X!)" below;
//   rect() / CAMS already assume the scaled size. E02 conveyor (len, width), E01 signBoard (size, w), kit doc (w, h) are sized by their own
//   opts instead (the values given below are the ones rect() assumes). kit magnifier is original size, lifted with its own `z`.
// Zones (left → right, anchors U0 on v = 0; screen X of an anchor = 0.819·U0):
//   A 事故展台 U0 = 0 (stand X −400..790) · B 设计台 U0 = 3420 (比喻角 X < −640 front-left, 关口 ①②③ on the belt, 规格台 in front)
//   · C 测试车间 U0 = 6290 (单元 X < −880 front, 模糊 −570..30 front, 不变量 140..1050 back, 形式化 ≥ 1070 front)
//   · D 审计与部署 U0 = 10260 (审计 X < −380, 部署 −170..1020, 链差异角 ≥ 900 front)
//   · E 监控与应急 U0 = 14720 (监控墙 X < −170, 作战室 220..1300, mETH 角 1510..2060, 核对台 ≥ 2300; the belt ends just before E_VEND).
// Native-SVG areas (dot matrix, quiz card, wind lines, order strip, change cards) are given as a ground origin + a box kind in EXT.
// Overlap rule used by the check: within a zone no two object rects intersect, and nothing but gates / belt cards / magnifiers touches the belt band.
import { Wp, camAt } from "../../kit/iso.mjs";

/** zone-local placer: (X, Y) = SCREEN px offset (world-canvas px at camera scale 1) from the zone's anchor (U0, 0).
 *  The belt runs through the anchor along screen Y = −0.35·X; Y above that line = behind the belt (v < 0), below = in front (v > 0). */
const zone = (U0) => (X, Y, extra = {}) => ({ u: Math.round(U0 + 0.8192 * X - 1.1472 * Y), v: Math.round(0.5736 * X + 1.6383 * Y), ...extra });
/** ground point on the belt centre line at screen X offset from the zone anchor */
const onBelt = (U0) => (X, extra = {}) => ({ u: Math.round(U0 + X / 0.8192), v: 0, ...extra });

export const U_A = 0, U_B = 3420, U_C = 6290, U_D = 10260, U_E = 14720;

// ---------------------------------------------------------------- belt (E02 conveyor, B → E, segments end to end)
export const BELT_Z = 74;                                   // E02 CONVEYOR_TOP: belt deck height (cards ride at z 74)
export const BELT_W = 90;                                   // E02 conveyor width
const BU0 = U_B - 800, BU1 = U_E - 190;                    // belt start (left of gate ①) / end (just before E_VEND)
const cuts = [BU0, (U_B + U_C) / 2, (U_C + U_D) / 2, (U_D + U_E) / 2, BU1];
/** one conveyor per zone: put(id, s.o, E2.conveyor(s.o, { id, len: s.len, width: BELT_W })) — B, C, D, E in order */
export const BELT = cuts.slice(0, -1).map((a, i) => ({ zone: "BCDE"[i], o: { u: Math.round((a + cuts[i + 1]) / 2), v: 0 }, len: Math.round(cuts[i + 1] - a) }));
/** belt point at world u (version card riding the belt: punchCard 0.7 at beltAt(u), z BELT_Z) */
export const beltAt = (u) => ({ u: Math.round(u), v: 0 });
export const BELT_U = [BU0, BU1];
/** kit checkpoint (wrap 0.6!, opts.road false): ground point at v −24 so its scaled road anchor sits on the belt centre line */
const gateAt = (U0, X) => ({ u: Math.round(U0 + X / 0.8192), v: -24, scale: 0.6 });

// ---------------------------------------------------------------- A 事故展台 (seg1 全段; seg2 L0) — U0 = 0, separate stand
const a = zone(U_A);
export const A_VEND = a(0, 0, { scale: 0.9 });              // E01 vending sign "金库合约" 0.9
export const A_ATK = a(-330, 60, { scale: 0.55 });          // kit person attacker "攻击者" 0.55
export const A_COINS = [[-150, 120], [-200, 135], [-250, 150], [-90, 190]].map(([X, Y]) => a(X, Y, { scale: 0.5 })); // E07 oddCoin ×4 0.5 (flowing out of the vending)
export const A_DOTS = a(-100, -560);                        // 45-dot red matrix area above the vending (9 × 5), EXT.dotsA
export const A_CARD_AUDIT = a(380, 0, { scale: 0.9 });      // E04 punchCard kind card title "审计版本" 0.9 (green stamp)
export const A_CARD_LIVE = a(680, 0, { scale: 0.9 });       // E04 punchCard kind card title "上线版本" 0.9 (red dashed frame = segment's)
export const A_REPORT = a(230, 170, { w: 120, h: 150 });    // kit doc title "审计报告" stamp true (w 120 h 150)
export const A_SEAL = a(520, 190, { scale: 0.7 });          // kit seal (wrap 0.7!) on the audit card side
export const A_QUIZ = a(380, -230);                         // quiz card "通过审计 = 线上代码安全？" (native SVG), EXT.quiz
export const A_SIGN = a(-250, -250);                        // E01 signBoard plate "事故展台"

// ---------------------------------------------------------------- B 设计台 · 关口 ①②③ (seg2 全段; seg3 L0–L3) — U0 = 3420
const b = zone(U_B), bb = onBelt(U_B);
// 比喻角 (front-left, left of the belt start)
export const B_PLANE = b(-1050, 250, { scale: 0.9 });       // E27 planeModel "模型飞机" 0.9
export const B_WIND = b(-1300, 220);                        // wind-tunnel flow lines (native SVG) blowing at the plane from −X, EXT.wind
export const B_BLUEPRINT = b(-1050, 420, { w: 140, h: 110 }); // kit doc title "图纸" (w 140 h 110)
export const B_SEAL = b(-780, 520, { scale: 0.6 });         // kit seal "适航认证" (wrap 0.6!)
export const B_HSM = b(-1350, 430, { scale: 0.6 });         // kit hsm "黑匣子" (wrap 0.6!)
export const B_TOWER = b(-1560, 250, { scale: 0.5 });       // kit tower "地面雷达" (wrap 0.5!)
export const B_WRENCH = b(-880, 260, { scale: 0.8 });       // E22 wrench "召回维修" 0.8
export const B_BURN = b(-760, 330, { scale: 0.6 });         // E06 burnBox plate "不可升级" 0.6
// 关口段
export const B_GATES = [-450, 0, 450].map((X) => gateAt(U_B, X)); // kit checkpoint ①②③ (wrap 0.6!, road false): 规格与威胁模型 / 编码规范 / 静态分析
export const B_CARD = bb(200, { scale: 0.7 });              // E04 punchCard on the belt (z BELT_Z) 0.7, between ② and ③
export const B_MAG = bb(200);                               // kit magnifier (original size, z ≈ 150) over the belt card
export const B_BEACONS = [[600, -420], [740, -470], [880, -520]].map(([X, Y]) => b(X, Y)); // kit beacon ×3 (original size), behind the belt right of ③, small "已结论" tags
export const B_DESK = b(-350, 380, { scale: 0.6 });         // kit desk "规格台" (wrap 0.6!)
export const B_SPEC = b(-200, 330, { w: 120, h: 150 });     // kit doc standing title "规格" lines [前置条件, 后置条件, 不变量] (w 120 h 150)
export const B_BAL = b(-30, 380, { scale: 0.6 });           // E01 balance "不变量" (wrap 0.6!)
export const B_ROLES = b(200, 340, { scale: 0.6 });         // E05 roleBoard "特权角色" (wrap 0.6!)
export const B_MANUAL = b(420, 420, { scale: 0.6 });        // E03 manual title "编码规范" (wrap 0.6!)
export const B_SIGN = b(-600, -300);                        // E01 signBoard plate "设计台"

// ---------------------------------------------------------------- C 测试车间 · 关口 ④⑤ (seg3 全段; seg4 L0) — U0 = 6290
const c = zone(U_C), cb = onBelt(U_C);
export const C_GATES = [-750, 1000].map((X) => gateAt(U_C, X)); // kit checkpoint ④⑤ (wrap 0.6!, road false): 测试 / 形式化验证
export const C_CARD = cb(-500, { scale: 0.7 });             // E04 punchCard on the belt (z BELT_Z) 0.7, past gate ④
// 单元测试
export const C_GRADER = c(-950, 560, { scale: 0.7 });       // E14 gradingMachine "单元测试" 0.7
export const C_SHEET = c(-1120, 600, { scale: 0.7 });       // E14 answerSheet title "想到的情况" 0.7
// 模糊测试 (code card A on the left of the screen)
export const C_LOTTERY = c(-480, 520, { scale: 0.6 });      // E02 lottery plate "随机输入" (wrap 0.6!)
export const C_DISP = c(-250, 470, { scale: 0.7 });         // E06 shareDispenser "金库" 0.7
export const C_CERT = c(-150, 520, { scale: 0.8 });         // E06 shareCert 0.8
export const C_SCALE = c(-30, 500, { scale: 0.7 });         // E07 scale "取回 ≤ 存入" 0.7
export const C_CUTTER = c(-60, 760, { scale: 0.55 });      // E06 roundCutter "舍入偏向金库" 0.55
// 不变量测试 (behind the belt; code card B on the right)
export const C_COUNTER = c(300, -520, { scale: 0.7 });      // E04 tellerCounter "银行" 0.7
export const C_CALLBACK = c(520, -430, { scale: 0.7 });     // E04 callbackArm "回调" 0.7 (beside the counter's cash slot)
export const C_ORDER = c(200, -380);                        // order strip "存款 → 回调 → 转账" on the ground (native SVG), EXT.order
export const C_BAL = c(720, -430, { scale: 0.7 });          // E01 balance "余额 ≥ 存款总和" (wrap 0.7!)
export const C_PANEL = c(800, -720, { scale: 0.6 });        // E05 funcPanel buttons [存款, 取款, 转账] (wrap 0.6!)
export const C_INVLIST = c(1000, -620, { w: 120, h: 150 }); // kit doc standing title "不变量清单" (w 120 h 150; last line red dashed blank)
// 形式化验证
export const C_PROOF = c(1250, -150);                       // E02 proofCard "证明" (original size)
export const C_MATHLIB = c(1450, -260, { scale: 0.5 });     // E03 contractMachine name "数学库" (wrap 0.5!)
export const C_ENG = c(1100, -60, { scale: 0.45 });         // kit person engineer 0.45 "规格编写成本高" (seg3 L24)
export const C_SIGN = c(-900, -100);                        // E01 signBoard plate "测试车间"

// ---------------------------------------------------------------- D 审计与部署 · 关口 ⑥⑦ (seg4 全段; seg5 L0) — U0 = 10260
const d = zone(U_D), db = onBelt(U_D);
export const D_GATES = [-650, 500].map((X) => gateAt(U_D, X)); // kit checkpoint ⑥⑦ (wrap 0.6!, road false): 外部审计 / 安全部署
export const D_CARD = db(-900, { scale: 0.7 });             // E04 punchCard on the belt (z BELT_Z) 0.7, arriving at gate ⑥
// 审计
export const D_ICE = d(-1150, 780, { scale: 0.6 });         // E05 iceShell (wrap 0.6!) with a punchCard 0.6 "提交哈希" frozen inside
export const D_SPECDOC = d(-860, 760, { w: 140, h: 110 });  // kit doc title "规格 · 威胁模型 · 测试覆盖率" (w 140 h 110)
export const D_AUDITORS = [d(-560, 560, { scale: 0.5 }), d(-460, 600, { scale: 0.5 })]; // kit person engineer ×2 "审计方 A" / "审计方 B" 0.5
export const D_MAG = d(-640, 700);                          // kit magnifier (original size, z ≈ 120) for the auditors / the fix doc
export const D_CONTEST = [[-300, 620], [-240, 650], [-180, 680], [-120, 710]].map(([X, Y]) => d(X, Y, { scale: 0.35 })); // kit person engineer ×4 0.35 "审计竞赛"
export const D_C4 = d(-1250, 60);                           // E01 signBoard wood "Code4rena · Sherlock · Cantina" (size 24), behind the belt
export const D_FIXDOC = d(-800, -80, { w: 140, h: 110 });   // kit doc title "修复" (w 140 h 110; red patch, "复审")
export const D_COMPILER = d(-450, -80, { scale: 0.5 });     // E03 manual title "编译器版本" (wrap 0.5!), small "已知 bug" tag
// 部署
export const D_LAPTOP = d(-50, 330, { scale: 0.7 });        // kit laptop "部署脚本" (wrap 0.7!)
export const D_CHAIN = d(250, 150, { scale: 0.5 });         // kit chain n 3 (wrap 0.5!)
export const D_BROWSER = d(650, 90, { scale: 0.45 });       // kit browserWin title "区块浏览器" (wrap 0.45!)
export const D_DEPLOYER = d(100, -280, { scale: 0.5 });     // kit person engineer "部署账户" 0.5
export const D_KEY = d(230, -320, { scale: 0.6 });          // kit key (wrap 0.6!) → handed into the multisig safe
export const D_MSIG = d(800, -500, { scale: 0.7 });         // kit safe "多签" (wrap 0.7!)
export const D_TLOCK = d(1000, -520, { scale: 0.6 });        // E01 timeLock (wrap 0.6!)
// 链差异角
export const D_CHAINS = [[1150, -60], [1450, -170], [1750, -280]].map(([X, Y]) => d(X, Y)); // E01 signBoard plate ×3 (size 28) "BNB Chain" / "TRON" / "Mantle"
export const D_RULER = d(1180, 120, { scale: 0.6 });          // E06 decimalRuler places 18 chain "BSC-USD" 0.6 (under BNB Chain)
export const D_CLOCK = d(950, 150, { scale: 0.6 });          // kit clock "0.45 秒" (wrap 0.6!)
export const D_RETTAG = d(1480, 0);                      // E07 returnTag "USDT 返回值" 1.0 (under TRON)
export const D_COINS = [d(1720, -100, { scale: 0.6 }), d(1800, -130, { scale: 0.6 })]; // E07 oddCoin ×2 0.6 "MNT" / "ETH" (under Mantle)
export const D_FORK = d(1550, 150, { scale: 0.6 });          // E16 forkSwitch "主网分叉" 0.6
export const D_SIGN = d(-1250, -300);                       // E01 signBoard plate "审计与部署"

// ---------------------------------------------------------------- E 监控与应急 · 关口 ⑧ · 核对台 (seg5 全段; seg6 全段) — U0 = 14720
const e = zone(U_E), eb = onBelt(U_E);
export const E_GATE = gateAt(U_E, -500);                    // kit checkpoint ⑧ (wrap 0.6!, road false): 监控与应急
export const E_CARD = eb(-350, { scale: 0.7 });             // E04 punchCard on the belt (z BELT_Z) 0.7, between ⑧ and the vending
export const E_VEND = e(0, 0, { scale: 0.8 });              // E01 vending "合约" 0.8, at the belt's end
// 监控墙 (behind the belt) + 赏金 (in front)
export const E_RACK = e(-1000, 0, { scale: 0.6 });          // kit rack "监控" (wrap 0.6!)
export const E_GAUGE = e(-820, -60, { scale: 0.8 });        // E03 gasGauge label "TVL" 0.8
export const E_BEACON = e(-680, -100);                      // kit beacon (original size)
export const E_FLASH = e(-540, -240, { scale: 0.45 });      // E01 flashDesk "闪电贷" (wrap 0.45!)
export const E_ADMIN = e(-350, -330, { scale: 0.5 });       // E05 funcPanel title "管理员函数" (wrap 0.5!)
export const E_QUEUE = e(-180, -380, { scale: 0.5 });       // E01 timeLock "队列" (wrap 0.5!)
export const E_ORACLE = e(-1180, 60, { scale: 0.7 });       // E01 miniVend kind oracle "预言机" 0.7
export const E_LEDGERS = [e(-1050, 550, { scale: 0.6 }), e(-820, 600, { scale: 0.6 })]; // kit ledgerBook ×2 "锁定量" / "铸造量" 0.6
export const E_BOUNTY = e(-450, 450);                       // E01 signBoard wood "漏洞赏金" (size 32)
export const E_WHITEHAT = e(-280, 420, { scale: 0.5 });     // kit person engineer "白帽" 0.5
export const E_GOLD = e(-200, 450, { scale: 0.5 });         // E07 oddCoin gold 0.5
// 应急 · 作战室
export const E_DUTY = e(250, 150, { scale: 0.5 });          // kit person engineer "值班" 0.5
export const E_PAUSE = e(420, -150, { scale: 0.6 });        // kit knifeSwitch "暂停" (wrap 0.6!)
export const E_DESKS = [e(600, 200, { scale: 0.5 }), e(800, 130, { scale: 0.5 })]; // kit desk ×2 (wrap 0.5!)
export const E_CREW = [[540, 340], [700, 330], [820, 280]].map(([X, Y]) => e(X, Y, { scale: 0.45 })); // kit person ×3 0.45 "作战室"
export const E_SAFE = e(1000, -200, { scale: 0.6 });        // kit safe "安全地址" (wrap 0.6!)
export const E_FREEZE = e(1050, 150, { scale: 0.5 });       // E05 iceShell (wrap 0.5!) with red coins "冻结"
export const E_NOTICE = e(1250, 0, { w: 120, h: 150 });     // kit doc standing title "公告 · 复盘" (w 120 h 150)
// mETH 角
export const E_METH = e(1650, -350, { scale: 0.6 });        // E01 vending sign "mETH" 0.6
export const E_HOUR = e(1550, -50, { scale: 0.6 });         // kit hourglass "提款延迟" (wrap 0.6!)
export const E_PAUSE2 = e(1780, -100, { scale: 0.6 });      // kit knifeSwitch "暂停权限" (wrap 0.6!)
export const E_TOWER = e(2000, -150, { scale: 0.5 });       // kit tower "安全社区" (wrap 0.5!)
export const E_CMETH = e(1800, 80, { scale: 0.5 });         // E07 oddCoin "cmETH" 0.5 (flows back into E_METH)
// 核对台 (right end)
export const E_CHKCARD = e(2400, -300, { scale: 0.8 });     // E04 punchCard kind card "审计版本" 0.8
export const E_BYTES = e(2600, -330);                       // E03 byteBlock text "线上字节码" (original size)
export const E_MAG = e(2550, -150);                         // kit magnifier (original size, z ≈ 120) between card and bytes
export const E_PROOF = e(2850, -350);                       // E02 proofCard (original size)
export const E_CHANGES = e(2450, -100);                     // row of small "改动" cards getting "已审查" stamps (native SVG), EXT.changes
export const E_SIGNS = [e(-1300, -200), e(3100, -80)];      // E01 signBoard plate ×2 "监控与应急" / "核对台"

// ---------------------------------------------------------------- object screen extents (scale 1, relative to the ground point;
// measured from the rendered SVGs: visible geometry only, contact shadows / glow / hidden layers excluded)
export const EXT = {
  vending: [-126, -330, 126, 55], person: [-50, -208, 50, 7], personAtk: [-50, -229, 50, 7], oddCoin: [-39, -111, 39, 18],
  punchCard: [-121, -168, 120, 45], doc: [-92, -51, 137, 48], docFlat: [-89, -45, 141, 58], docStanding: [-51, -154, 49, 12], seal: [-146, -142, 147, 69],
  signPlate: [-146, -245, 119, 54], signChain: [-126, -228, 99, 47], signWood: [-81, -143, 81, 18], signWoodL: [-205, -180, 205, 62],
  planeModel: [-87, -98, 67, 18], hsm: [-97, -119, 97, 44], tower: [-106, -417, 106, 53], wrench: [-57, -68, 56, 19], burnBox: [-120, -202, 120, 58],
  checkpoint: [-172, -305, 115, 80], magnifier: [-58, -260, 120, -105], beacon: [-61, -118, 61, 30], desk: [-147, -272, 147, 74],
  balance: [-163, -267, 163, 40], roleBoard: [-208, -366, 202, 77], manual: [-137, -91, 132, 64],
  gradingMachine: [-91, -128, 91, 43], answerSheet: [-38, -133, 38, 15], lottery: [-148, -312, 148, 69], shareDispenser: [-78, -204, 82, 184],
  shareCert: [-35, -17, 35, 16], scaleE7: [-89, -212, 89, 39], roundCutter: [-191, -279, 191, 87], tellerCounter: [-228, -343, 241, 92],
  callbackArm: [-49, -107, 79, 24], funcPanel: [-207, -236, 210, 94], proofCard: [-61, -158, 59, 23], contractMachine: [-155, -250, 169, 76],
  iceShell: [-268, -395, 268, 131], laptop: [-164, -234, 141, 66], chain3: [-213, -171, 213, 85], browserWin: [-201, -332, 201, 81],
  key: [-75, -35, 84, 31], safe: [-180, -376, 181, 82], timeLock: [-64, -182, 64, 27], decimalRuler: [-207, -174, 200, 74], clock: [-76, -193, 61, 2],
  returnTag: [-30, -62, 29, 7], forkSwitch: [-44, -117, 53, 23], rack: [-113, -349, 113, 51], gasGauge: [-96, -256, 84, 32],
  flashDesk: [-142, -285, 142, 52], miniVendOracle: [-72, -261, 72, 31], ledgerBook: [-158, -89, 158, 74], knifeSwitch: [-153, -344, 133, 48],
  hourglass: [-56, -201, 56, 28], byteBlock: [-7, -74, 171, 5],
  // native-SVG areas, from their ground origin
  dotsA: [0, 0, 300, 110], quiz: [-180, -120, 180, 0], wind: [-120, -80, 120, 40], order: [-120, -20, 220, 40], changes: [0, -60, 400, 0],
};
// rect(o, kind, scale) → world-canvas bbox [x0, y0, x1, y1] of that object standing at o
export const rect = (o, kind, scale = o.scale ?? 1) => { const [X, Y] = Wp(o.u, o.v); const q = EXT[kind]; return [X + q[0] * scale, Y + q[1] * scale, X + q[2] * scale, Y + q[3] * scale]; };
/** camera that fits the union of rects into the screen box [x0,y0,x1,y1] */
export const fit = (rects, [x0, y0, x1, y1], kmax = 1.4) => {
  const X0 = Math.min(...rects.map((q) => q[0])), Y0 = Math.min(...rects.map((q) => q[1]));
  const X1 = Math.max(...rects.map((q) => q[2])), Y1 = Math.max(...rects.map((q) => q[3]));
  const k = Math.min(kmax, (x1 - x0) / (X1 - X0), (y1 - y0) / (Y1 - Y0));
  return camAt([(X0 + X1) / 2, (Y0 + Y1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};
/** world-canvas bbox of a whole belt segment (deck + rails + legs), for framing only */
const beltRect = (u0, u1) => { const P = [[u0, -55, 80], [u1, -55, 80], [u0, 55, 0], [u1, 55, 0]].map(([u, v, z]) => Wp(u, v, z)); return [Math.min(...P.map((p) => p[0])), Math.min(...P.map((p) => p[1])), Math.max(...P.map((p) => p[0])), Math.max(...P.map((p) => p[1]))]; };

// ---------------------------------------------------------------- per-area rect groups (named; the check script reads these)
const r = (o, kind) => rect(o, kind);
export const R = {
  // A
  incident: [r(A_VEND, "vending"), r(A_ATK, "personAtk"), ...A_COINS.map((q) => r(q, "oddCoin")), r(A_DOTS, "dotsA")],
  version: [r(A_CARD_AUDIT, "punchCard"), r(A_CARD_LIVE, "punchCard"), r(A_REPORT, "doc"), r(A_SEAL, "seal"), r(A_QUIZ, "quiz"), r(A_VEND, "vending")],
  signA: [r(A_SIGN, "signPlate")],
  // B
  plane: [r(B_PLANE, "planeModel"), r(B_WIND, "wind"), r(B_BLUEPRINT, "docFlat"), r(B_SEAL, "seal"), r(B_HSM, "hsm"), r(B_TOWER, "tower"),
    r(B_WRENCH, "wrench"), r(B_BURN, "burnBox")],
  gatesB: [...B_GATES.map((q) => r(q, "checkpoint")), r(B_MAG, "magnifier"), ...B_BEACONS.map((q) => r(q, "beacon")), beltRect(BU0, U_B + 750)],
  spec: [r(B_DESK, "desk"), r(B_SPEC, "docStanding"), r(B_BAL, "balance"), r(B_ROLES, "roleBoard"), r(B_MANUAL, "manual")],
  signB: [r(B_SIGN, "signPlate")],
  // C
  unit: [r(C_GRADER, "gradingMachine"), r(C_SHEET, "answerSheet"), r(C_GATES[0], "checkpoint")],
  fuzz: [r(C_LOTTERY, "lottery"), r(C_DISP, "shareDispenser"), r(C_CERT, "shareCert"), r(C_SCALE, "scaleE7"), r(C_CUTTER, "roundCutter")],
  inv: [r(C_COUNTER, "tellerCounter"), r(C_CALLBACK, "callbackArm"), r(C_ORDER, "order"), r(C_BAL, "balance"), r(C_PANEL, "funcPanel"), r(C_INVLIST, "docStanding")],
  formal: [r(C_PROOF, "proofCard"), r(C_MATHLIB, "contractMachine"), r(C_ENG, "person"), r(C_GATES[1], "checkpoint")],
  signC: [r(C_SIGN, "signPlate")],
  // D
  audit: [r(D_ICE, "iceShell"), r(D_SPECDOC, "docFlat"), ...D_AUDITORS.map((q) => r(q, "person")), r(D_MAG, "magnifier"), ...D_CONTEST.map((q) => r(q, "person")),
    r(D_C4, "signWoodL"), r(D_FIXDOC, "docFlat"), r(D_COMPILER, "manual"), r(D_GATES[0], "checkpoint")],
  deploy: [r(D_LAPTOP, "laptop"), r(D_CHAIN, "chain3"), r(D_BROWSER, "browserWin"), r(D_DEPLOYER, "person"), r(D_KEY, "key"), r(D_MSIG, "safe"),
    r(D_TLOCK, "timeLock"), r(D_GATES[1], "checkpoint")],
  chainc: [...D_CHAINS.map((q) => r(q, "signChain")), r(D_RULER, "decimalRuler"), r(D_CLOCK, "clock"), r(D_RETTAG, "returnTag"),
    ...D_COINS.map((q) => r(q, "oddCoin")), r(D_FORK, "forkSwitch")],
  signD: [r(D_SIGN, "signPlate")],
  // E
  monitor: [r(E_GATE, "checkpoint"), r(E_VEND, "vending"), r(E_RACK, "rack"), r(E_GAUGE, "gasGauge"), r(E_BEACON, "beacon"), r(E_FLASH, "flashDesk"),
    r(E_ADMIN, "funcPanel"), r(E_QUEUE, "timeLock"), r(E_ORACLE, "miniVendOracle"), ...E_LEDGERS.map((q) => r(q, "ledgerBook")),
    r(E_BOUNTY, "signWood"), r(E_WHITEHAT, "person"), r(E_GOLD, "oddCoin")],
  war: [r(E_DUTY, "person"), r(E_PAUSE, "knifeSwitch"), ...E_DESKS.map((q) => r(q, "desk")), ...E_CREW.map((q) => r(q, "person")), r(E_SAFE, "safe"),
    r(E_FREEZE, "iceShell"), r(E_NOTICE, "docStanding")],
  meth: [r(E_METH, "vending"), r(E_HOUR, "hourglass"), r(E_PAUSE2, "knifeSwitch"), r(E_TOWER, "tower"), r(E_CMETH, "oddCoin")],
  check: [r(E_CHKCARD, "punchCard"), r(E_BYTES, "byteBlock"), r(E_MAG, "magnifier"), r(E_PROOF, "proofCard"), r(E_CHANGES, "changes")],
  signE: E_SIGNS.map((q) => r(q, "signPlate")),
};
export const ZONE_RECTS = {
  A: [...R.incident, ...R.version.slice(0, 5), ...R.signA],
  B: [...R.plane, ...R.gatesB.slice(0, -1), ...R.spec, ...R.signB],
  C: [...R.unit, ...R.fuzz, ...R.inv, ...R.formal, ...R.signC],
  D: [...R.audit, ...R.deploy, ...R.chainc, ...R.signD],
  E: [...R.monitor, ...R.war, ...R.meth, ...R.check, ...R.signE],
};
const Z = ZONE_RECTS;
const SAFE = [100, 280, 1820, 860];                      // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for code cards / cards at the sides

// ---------------------------------------------------------------- camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur)
export const CAMS = {
  // 全景：A 展台 + B–E 整条流水线，八道关口都在画内（seg2 L0–L3、L13–L17、L21；seg6 L1、L11 结束卡）
  wide: fit([...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E], [60, 220, 1860, 860], 1),
  // A 售货机 + 攻击者 + 流出的币 + 点阵（seg1 起点 L0–L5）
  incidentA: fit(R.incident, MID, 1.4),
  // A 两张版本卡 + 审计报告 + 公章 + 题卡 + 售货机（seg1 L6–L11 终点；seg2 起点）
  versionA: fit(R.version, SAFE, 1.4),
  // B 比喻角：模型飞机 + 图纸 + 风洞 + 公章 + 黑匣子 + 塔 + 扳手 + 焊死投递箱（seg2 L4–L12）
  planeB: fit(R.plane, MID, 1.4),
  // B 关口 ①②③ + 传送带 + 放大镜 + 告警灯（seg2 L18–L23 终点；seg3 起点）
  gatesB: fit(R.gatesB, SAFE, 1.4),
  // B 规格台 + 规格文件 + 天平 + 角色板 + 编码规范（seg3 L0–L3）
  specB: fit(R.spec, MID, 1.4),
  // C 阅卷机 + 答题卡 + 关口 ④（seg3 L4–L5）
  unitC: fit(R.unit, MID, 1.4),
  // C 摇奖机 + 金库份额机 + 份额 + 台秤 + 取整刀（seg3 L6–L10；代码卡 A 在左侧）
  fuzzC: fit(R.fuzz, MID, 1.4),
  // C 银行柜台 + 回调臂 + 顺序条 + 天平 + 按钮面板 + 不变量清单（seg3 L11–L21；代码卡 B 在右侧）
  invC: fit(R.inv, MID, 1.4),
  // C 证明卡 + 数学库机器 + 小工程师 + 关口 ⑤（seg3 L22–L24 终点；seg4 起点）
  formalC: fit(R.formal, MID, 1.4),
  // D 冰封版本卡 + 规格文件 + 两名审计 + 竞赛小人 + 竞赛牌 + 修复单 + 编译器手册 + 关口 ⑥（seg4 L0–L7）
  auditD: fit(R.audit, SAFE, 1.4),
  // D 笔记本 + 链 + 浏览器 + 部署账户 + 钥匙 + 多签保险柜 + 时间锁 + 关口 ⑦（seg4 L8–L12）
  deployD: fit(R.deploy, SAFE, 1.4),
  // D 三块链牌 + 刻度尺 + 时钟 + 回执签 + 两枚币 + 分叉扳道器（seg4 L13–L19 终点；seg5 起点）
  chainD: fit(R.chainc, MID, 1.4),
  // E 关口 ⑧ + 合约 + 监控墙 + 赏金（seg5 L0–L7）
  monitorE: fit(R.monitor, SAFE, 1.4),
  // E 值班 + 闸刀 + 作战室 + 安全地址 + 冻结 + 公告，带上合约和告警灯（seg5 L8–L14）
  warE: fit([...R.war, r(E_VEND, "vending"), r(E_BEACON, "beacon")], SAFE, 1.4),
  // E mETH 售货机 + 沙漏 + 闸刀 + 塔 + cmETH 币（seg5 L15–L19 终点；seg6 起点 L0）
  methE: fit(R.meth, MID, 1.4),
  // E 核对台：审计版本卡 + 线上字节码 + 放大镜 + 证明卡 + 改动小卡（seg6 L2–L10）
  checkE: fit(R.check, MID, 1.4),
};
/** alias (ep11 convention): the whole world */
export const world = CAMS.wide;
CAMS.world = CAMS.wide;
