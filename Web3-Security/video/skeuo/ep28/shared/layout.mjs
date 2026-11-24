// ep28「事故档案馆」shared world layout — one continuous isometric world, fixed for all six segments:
//   import * as L from "../../shared/layout.mjs";   (from ep28/segN/src/build-story.mjs)
//   zone positions (A_*, B_*, C_*, D_*, E_*, F_* below); L.EXT, L.rect, L.fit, L.R, L.ZONE_RECTS, L.CAMS, L.world.
// Positions only; ids, states, labels and per-shot opts stay in each segment. Object ids must never be `cam` or `root`.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Like ep27, every position is written as a SCREEN px offset (X, Y) from its zone's anchor (U0, 0), converted to world (u, v)
//   (so the numbers read as on-screen ground positions at camera scale 1). The visitor route (native SVG dashed teal arrow) runs
//   along +u at v = 0 through every anchor: L.routeAt(u) gives a point on it, L.ROUTE_U its start / end.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): `scale` = the opts.scale to pass to the object. Only kit person / ledgerBook, E01 vending / miniVend,
//   E04 callbackArm / hasp / punchCard, E05 keycard, E06 shareDispenser / shareCert, E07 emptyLot / returnTag / oddCoin, E08 ammPool, E09 cheque,
//   E11 mintPress, E14 gradingMachine and E16 forkSwitch take opts.scale. Everything else here that carries `scale` IGNORES it: the segment MUST
//   put it with the wrap helper (translate · scale · translate around its ground point) and rescale its anchors — marked "(wrap X!)" below;
//   rect() / CAMS already assume the scaled size. E02 vitrine (w, d, h), E01 signBoard (size, w), kit doc (w, h) are sized by their own opts
//   (the values given below are the ones rect() assumes); kit magnifier is original size, lifted with its own `z`.
// Vitrines (E02 vitrine, floor z = VITRINE_FLOOR 40): the exhibit inside stands on the SAME ground point as its vitrine, lifted by z 40
//   (put it inside opts.inner or draw it right after the vitrine's back panes) — those pairs overlap on purpose; nothing else does.
// Zones (left → right, anchors U0 on v = 0; screen X of an anchor = 0.819·U0, screen Y = −0.287·U0):
//   A 门厅 U0 = 0 (DAO X −800 · Curve 0 · Penpie 800, 入口牌 X 1350) · B 阅览厅 U0 = 4000 (比喻角 X < −250, 阅读位 −240..−30, 档案柜 250,
//   展墙 550..1390, 模式墙 in front 20..780) · C 代码展厅 U0 = 8400 (① X −1000 · ② 0 · ③ 1000) · D 改动展厅 U0 = 13100 (④ −1000 · ⑤ 0 · ⑥ 1000)
//   · E 钥匙与人展厅 U0 = 17850 (⑦ X < −570 · mETH −480..−270 · ⑧ 170..1130 · NFT 墙 ≥ 1150) · F 复盘台 U0 = 21800 (复盘台 X < 650 · 空展柜 1050).
// Native-SVG areas (dot matrices, chain label, pattern wall, badges, empty box, partition, zone tags) are given as a ground origin + a box kind in EXT.
// Overlap rule used by the check: within a zone no two object rects intersect, except a vitrine and the exhibit standing on its ground point.
import { Wp, camAt } from "../../kit/iso.mjs";

/** zone-local placer: (X, Y) = SCREEN px offset (world-canvas px at camera scale 1) from the zone's anchor (U0, 0). */
const zone = (U0) => (X, Y, extra = {}) => ({ u: Math.round(U0 + 0.8192 * X - 1.1472 * Y), v: Math.round(0.5736 * X + 1.6383 * Y), ...extra });

export const U_A = 0, U_B = 4000, U_C = 8400, U_D = 13100, U_E = 17850, U_F = 21800;
/** visitor route (native SVG dashed teal arrow on the floor, v = 0): from left of A to the F desk */
export const ROUTE_U = [-1500, U_F + 700];
export const routeAt = (u) => ({ u: Math.round(u), v: 0 });

// ---------------------------------------------------------------- A 门厅·三只展柜 (seg1 全段; seg2 L0) — U0 = 0
const a = zone(U_A);
// vitrine sizes: A ×3 w 300 d 220 h 260 · C/D/E w 420 d 300 h 280 · F w 260 d 200 h 240
export const A_VIT = [a(-800, 0), a(0, 0), a(800, 0)];      // E02 vitrine ×3 plate "The DAO · 2016" / "Curve · 2023" / "Penpie · 2024" (w 300 d 220 h 260)
export const A_VEND = A_VIT.map((q) => ({ ...q, scale: 0.45, z: 40 })); // E01 vending ×3 sign "The DAO" / "Curve" / "Penpie" 0.45, inside each vitrine (z 40)
export const A_LEDGER = a(-560, 200, { scale: 0.45 });       // kit ledgerBook "余额" 0.45, front-right of the DAO vitrine
export const A_ARM = a(-1060, 120, { scale: 0.45 });         // E04 callbackArm "回调" 0.45, left of the DAO vitrine (target = vending slot)
export const A_COINS = [a(-720, 230, { scale: 0.4 }), a(-680, 260, { scale: 0.4 })]; // E07 oddCoin ×2 0.4 rolling out of the DAO vending
export const A_HASP = a(240, 160, { scale: 0.5 });           // E04 hasp "重入锁" 0.5 (state broken at L6), front-right of the Curve vitrine
export const A_MANUAL = a(-260, 200, { scale: 0.5 });        // E03 manual title "Vyper 编译器" (wrap 0.5!), front-left of the Curve vitrine
export const A_PANEL = a(800, 220, { scale: 0.45 });         // E05 funcPanel buttons [存入, 领奖] (wrap 0.45!), in front of the Penpie vitrine
export const A_DOTS = [a(-940, -560), a(-140, -580), a(660, -500)]; // red dot matrices above each vitrine: 60 / 70 / 27 dots (10 per row), EXT.dots60 / dots70 / dots27
export const A_LINE = a(400, 260);                           // label "先交互 → 后记账" on the red dashed line through the three vitrines (native SVG), EXT.hallLabel
export const A_SIGN = a(1350, -100);                         // E01 signBoard plate "事故档案馆" (entrance, fades in at seg1 L12)
export const A_TAG = a(-1150, 380);                          // floor zone tag "A · 门厅" (native SVG), EXT.zoneTag

// ---------------------------------------------------------------- B 阅览厅 (seg2 全段; seg3 L0) — U0 = 4000
const b = zone(U_B);
// 比喻角
export const B_TOWER = b(-1250, -60, { scale: 0.5 });        // kit tower "塔台" (wrap 0.5!)
export const B_HSM = b(-1060, 90, { scale: 0.6 });           // kit hsm label "黑匣子" (wrap 0.6!)
export const B_REPORT = b(-880, -40, { w: 120, h: 150 });    // kit doc standing title "公开报告" (w 120 h 150; "1970 年代" small text)
export const B_SEAL = b(-900, 190, { scale: 0.6 });          // kit seal "独立机构" (wrap 0.6!) → stamps the public report at L8
// 对照
export const B_POSTMORTEM = b(-560, -40, { w: 120, h: 150 }); // kit doc standing title "项目复盘" (w 120 h 150; red dashed corner gap + "?")
export const B_FIRM = b(-430, 150, { w: 140, h: 110 });      // kit doc title "安全公司分析" (w 140 h 110)
export const B_CHAIN = b(-620, 330, { scale: 0.45 });        // kit chain n 3 "链上数据" (wrap 0.45!)
export const B_OVERLAP = b(-560, 120);                       // teal overlap area "多方一致" between the three sources (native SVG), EXT.overlap
// 阅读位
export const B_DESK = b(-150, 200, { scale: 0.6 });          // kit desk (wrap 0.6!)
export const B_READER = b(-30, 290, { scale: 0.5 });         // kit person engineer "读报告" 0.5
// 归档
export const B_CABINET = b(250, -50, { scale: 0.7 });        // E03 slotCabinet title "根因类别" (wrap 0.7!; labels = 根因类别)
export const B_WALLS = [b(560, -200), b(840, -200), b(1120, -200), b(560, 120), b(840, 120), b(1120, 120)]; // E01 signBoard plate ×6 (size 28):
//   "以太坊与多链" / "BNB Chain" / "TRON" / "Mantle" / "代码之外" / "NFT 与 GameFi"
export const B_BLANK = b(1400, 120);                         // E01 signBoard plate, blank, red dashed frame ("没有摆上展墙", L16)
export const B_PATTERNS = b(400, 380);                       // pattern wall (native SVG): 8 empty badge slots ①–⑧ (①–⑤ teal "代码与版本", ⑥–⑧ ink "签名 · 密钥 · 人"), EXT.patternWall
export const B_TAG = b(-1350, 380);                          // floor zone tag "B · 阅览厅", EXT.zoneTag

// ---------------------------------------------------------------- C 代码展厅 ①②③ (seg3 全段; seg4 L0) — U0 = 8400
const c = zone(U_C);
// ① 先交互后记账
export const C1_VIT = c(-1000, 0);                           // E02 vitrine plate "Fei Rari · 2022" (w 420 d 300 h 280)
export const C1_VEND = { ...C1_VIT, scale: 0.6, z: 40 };     // E01 vending "Fei Rari" 0.6, inside
export const C1_ARM = c(-1330, 90, { scale: 0.55 });         // E04 callbackArm 0.55, left of the vitrine
export const C1_PANEL = c(-1000, 300, { scale: 0.5 });       // E05 funcPanel buttons [借款, 还款, 退出] (wrap 0.5!; 退出 has no lock)
export const C1_HASPS = [c(-760, 210, { scale: 0.5 }), c(-700, 250, { scale: 0.5 })]; // E04 hasp ×2 0.5 shared true (chainTo all buttons, green at L5)
export const C1_SIGN = c(-1480, -100);                       // E01 signBoard plate "① 先交互后记账"
// ② 零值有含义
export const C2_VIT = c(0, 0);                               // E02 vitrine plate "Nomad · 2022"
export const C2_BRIDGE = { ...C2_VIT, scale: 0.4, z: 40 };   // E01 bridge "Nomad" river 80 (wrap 0.4!), inside
export const C2_ROOT = c(330, -80, { w: 120, h: 150 });      // kit doc standing title "可信根" lines ["全零"] (w 120 h 150)
export const C2_LOT = c(-150, 300, { scale: 0.5 });          // E07 emptyLot plateText "零地址" zero true 0.5
export const C2_TAG = c(60, 300, { scale: 0.8 });            // E07 returnTag face "true" "Qubit" 0.8
export const C2_PROOF = c(360, 260);                         // E02 proofCard text "零 = 无效" (original size)
export const C2_SIGN = c(-460, -100);                        // E01 signBoard plate "② 零值有含义"
// ③ 可变数据当事实
export const C3_VIT = c(1000, 0);                            // E02 vitrine plate "Cream · 2021"
export const C3_POOL = { ...C3_VIT, scale: 0.6, z: 40 };     // E08 ammPool "池子储备" 0.6, inside
export const C3_ORACLE = c(1380, -60, { scale: 0.6 });       // E01 miniVend kind oracle "单一 DEX 价格" 0.6
export const C3_SHARE = c(1380, 230, { scale: 0.6 });        // E06 shareDispenser "份额价格" 0.6
export const C3_CERT = c(1500, 340, { scale: 0.8 });         // E06 shareCert 0.8
export const C3_GOOD = c(1650, -60, { scale: 0.6 });         // E01 miniVend kind oracle "抗操纵预言机" 0.6 (green, defence)
export const C3_LEDGER = c(1680, 240, { scale: 0.6 });       // kit ledgerBook "内部记账" 0.6
export const C3_SIGN = c(540, -100);                         // E01 signBoard plate "③ 可变数据当事实"
export const C_TAG = c(-1650, 420);                          // floor zone tag "C · 代码展厅", EXT.zoneTag

// ---------------------------------------------------------------- D 改动展厅 ④⑤⑥ (seg4 全段; seg5 L0) — U0 = 13100
const d = zone(U_D);
// ④ 新函数绕过检查
export const D4_VIT = d(-1000, 0);                           // E02 vitrine plate "Euler · 2023"
export const D4_VEND = { ...D4_VIT, scale: 0.6, z: 40 };     // E01 vending "Euler" 0.6, inside
export const D4_PANEL = d(-1000, 320, { scale: 0.55 });      // E05 funcPanel buttons [存款, 借款, 捐赠] (wrap 0.55!)
export const D4_GATE = d(-600, 330, { scale: 0.55 });        // kit checkpoint "健康检查" (wrap 0.55!) — moves to the routes' join at L5 (segment's tween)
export const D4_BAL = d(-1400, 260, { scale: 0.6 });         // E01 balance "健康检查" (wrap 0.6!)
export const D4_GRADER = d(-1360, 60, { scale: 0.6 });       // E14 gradingMachine "不变量测试" 0.6
export const D4_SIGN = d(-1520, -120);                       // E01 signBoard plate "④ 新函数绕过检查"
// ⑤ 改动未重审
export const D5_VIT = d(0, 0);                               // E02 vitrine plate "Uranium · 2021"
export const D5_MACH = [d(-110, 0, { scale: 0.5, z: 40 }), d(110, 0, { scale: 0.5, z: 40 })]; // E03 contractMachine ×2 name "Uniswap V2" / "Uranium" (wrap 0.5!), inside
export const D5_DIFF = d(-120, 290, { scale: 0.7 });         // E04 punchCard title "差异" 0.7 (one red cell "只改了一行")
export const D5_BAL = d(150, 300, { scale: 0.6 });           // E01 balance "恒定乘积检查" (wrap 0.6!; tilt at L8)
export const D5_MAG = d(-380, 470);                          // kit magnifier (original size, z ≈ 120) → slides over the diff card at L10
export const D5_SEAL = d(380, 250, { scale: 0.5 });          // kit seal markText "重审" (wrap 0.5!)
export const D5_SIGN = d(-460, -150);                        // E01 signBoard plate "⑤ 改动未重审"
// ⑥ 盲签
export const D6_VIT = d(1000, 0);                            // E02 vitrine plate "Bybit · 2025"
export const D6_UI = { ...D6_VIT, scale: 0.45, z: 40 };      // kit browserWin title "多签界面" (wrap 0.45!), inside
export const D6_SIGNERS = [d(800, 300, { scale: 0.5 }), d(900, 340, { scale: 0.5 })]; // kit person signer ×2 0.5
export const D6_CHEQUE = d(1230, 300, { scale: 0.8 });       // E09 cheque "实际签下" 0.8 (one red row "delegatecall")
export const D6_KEYCARD = d(1430, 210, { scale: 0.7 });      // E05 keycard "账户权限" 0.7 (TRON; slides toward an attacker silhouette)
export const D6_HW = d(1450, 10, { scale: 0.7 });            // kit hwWallet screenText "解码后内容" (wrap 0.7!)
export const D6_SHIELD = d(1610, 40, { scale: 0.5 });        // kit shield "白名单" (wrap 0.5!)
export const D6_SIGN = d(540, -150);                         // E01 signBoard plate "⑥ 盲签"
export const D_TAG = d(-1650, 440);                          // floor zone tag "D · 改动展厅", EXT.zoneTag

// ---------------------------------------------------------------- E 钥匙与人展厅 ⑦⑧ (seg5 全段; seg6 L0) — U0 = 17850
const e = zone(U_E);
// ⑦ 密钥集中
export const E7_VIT = e(-1350, 0);                           // E02 vitrine plate "Ronin · 2022", holds the nine keys
export const E7_KEYS = [-1, 0, 1].flatMap((r) => [-1, 0, 1].map((k) => e(-1350 + 90 * k + 20 * r, 55 * r, { scale: 0.4, z: 40 }))); // kit key ×9 (wrap 0.4!), inside, 3 × 3
export const E7_METER = e(-1000, -100, { scale: 0.6 });      // E05 thresholdMeter max 9 th 5 "Ronin" (wrap 0.6!)
export const E7_RACK = e(-880, -80, { scale: 0.45 });        // kit rack "MPC 节点" (wrap 0.45!) → drops into the bucket at L2
export const E7_BUCKET = e(-880, 200, { scale: 0.7 });       // kit bucket "个人云账户" (wrap 0.7!)
export const E7_SAFE = e(-1300, 400, { scale: 0.6 });        // kit safe "多签" (wrap 0.6!; "5 人中 2 人")
export const E7_NOLOCK = e(-1120, 420);                      // red dashed empty box "时间锁" (native SVG), EXT.emptyBox — E7_TLOCK fills it at L6
export const E7_TLOCK = e(-1120, 420, { scale: 0.6 });       // E01 timeLock green (wrap 0.6!), same spot as the empty box (appears at L6)
export const E7_SWITCH = e(-650, 260, { scale: 0.55 });      // kit knifeSwitch "速率限制" / "暂停" (wrap 0.55!), shared by ⑦ and the mETH corner
export const E7_SIGN = e(-1780, -150);                       // E01 signBoard plate "⑦ 密钥集中"
// mETH 角
export const EM_VEND = e(-400, -50, { scale: 0.5 });         // E01 vending sign "mETH" 0.5
export const EM_HOUR = e(-300, 200, { scale: 0.55 });        // kit hourglass "8 小时" (wrap 0.55!)
export const EM_COINS = [e(-490, 180, { scale: 0.45 }), e(-440, 210, { scale: 0.45 }), e(-390, 240, { scale: 0.45 })]; // E07 oddCoin ×3 "cmETH" 0.45
// ⑧ 人是入口
export const E8_DESKS = [e(250, 0, { scale: 0.5 }), e(650, 0, { scale: 0.5 })]; // kit desk ×2 (wrap 0.5!) — 签名 / 开发
export const E8_WALL = e(450, 0);                            // teal partition "签名 / 开发分开" between the desks (native SVG), EXT.partition
export const E8_STAFF = [e(200, 160, { scale: 0.45 }), e(320, 180, { scale: 0.45 }), e(700, 160, { scale: 0.45 })]; // kit person engineer ×3 0.45
export const E8_QUIZ = e(430, 300, { w: 140, h: 110 });      // kit doc title "招聘测试题" (w 140 h 110)
export const E8_PDF = e(760, 310, { w: 140, h: 110 });       // kit doc title "PDF" (w 140 h 110)
export const E8_LAPTOP = e(250, -250, { scale: 0.55 });      // kit laptop "开发者设备" (wrap 0.55!)
export const E8_AGENT = e(960, 100, { scale: 0.45 });        // kit person engineer "外包客服" 0.45
export const E8_DATA = e(1060, 250, { scale: 0.5 });         // kit ledgerBook "用户数据" 0.5
export const E8_PAIR = [e(820, -170, { scale: 0.45 }), e(890, -140, { scale: 0.45 })]; // kit person ×2 0.45 "两人确认"
export const E8_KEY = e(1040, -170, { scale: 0.5 });         // kit key "离职收回" (wrap 0.5!)
export const E8_SIGN = e(-60, -200);                         // E01 signBoard plate "⑧ 人是入口"
// NFT 与 GameFi 墙
export const EN_SIGN = e(1330, -220);                        // E01 signBoard plate "NFT 与 GameFi"
export const EN_PHONE = e(1340, 110, { scale: 0.5 });        // kit phone "社交账号" (wrap 0.5!)
export const EN_UI = e(1560, -40, { scale: 0.35 });          // kit browserWin "前端" (wrap 0.35!)
export const EN_MINT = e(1760, 150, { scale: 0.5 });         // E11 mintPress "铸币权限" 0.5
export const EN_INSIDER = e(1560, 270, { scale: 0.4 });      // kit person "内部人" 0.4
export const E_TAG = e(-1750, 470);                          // floor zone tag "E · 钥匙与人展厅", EXT.zoneTag

// ---------------------------------------------------------------- F 复盘台 (seg6 全段) — U0 = 21800
const f = zone(U_F);
export const F_DESK = f(-500, 100, { scale: 0.7 });          // kit desk "复盘台" (wrap 0.7!)
export const F_DOC = f(-150, -40, { w: 200, h: 280 });       // kit doc standing title "复盘" (w 200 h 280; 7 lines)
export const F_CHAIN = f(150, 250, { scale: 0.5 });          // kit chain n 3 "攻击交易" (wrap 0.5!; cells "T0 引入" / "T1 攻击" / "T2 响应")
export const F_STACK = f(350, 0, { scale: 0.6 });            // E03 frameStack "调用树" (wrap 0.6!)
export const F_MAG = f(100, 160);                            // kit magnifier (original size, z ≈ 120) → over one chain cell at L5
export const F_FORK = f(600, 210, { scale: 0.6 });           // E16 forkSwitch "本地 / 分叉环境" 0.6
export const F_WOOD = f(660, -100);                          // E01 signBoard wood "事件库 = 线索" (size 24)
export const F_SIGN = f(-860, -150);                         // E01 signBoard plate "复盘台"
export const F_BADGES = f(0, -470);                          // row of eight pattern badges above the desk (native SVG), EXT.badges
export const F_VIT = f(1050, 50);                            // E02 vitrine plate "新漏洞？", empty (w 260 d 200 h 240)
export const F_BADGES2 = f(1050, 300);                       // badges row beside the empty vitrine (seg6 L13), EXT.badges2
export const F_TAG = f(-1000, 420);                          // floor zone tag "F · 复盘台", EXT.zoneTag

// ---------------------------------------------------------------- object screen extents (scale 1, relative to the ground point;
// from earlier episodes' measured EXT tables or measured from the rendered SVG: visible geometry only)
export const EXT = {
  vending: [-126, -330, 126, 55], person: [-50, -208, 50, 7], oddCoin: [-39, -111, 39, 18], ledgerBook: [-158, -89, 158, 74],
  callbackArm: [-49, -107, 79, 24], hasp: [-28, -151, 32, 21], manual: [-137, -91, 132, 64],
  funcPanel2: [-164, -221, 234, 161], funcPanel3: [-207, -236, 338, 161],
  vitA: [-200, -348, 200, 95], vitC: [-272, -399, 272, 129], vitF: [-178, -321, 178, 85],
  signPlate: [-146, -245, 119, 54], signWood: [-81, -143, 81, 18],
  tower: [-106, -417, 106, 53], hsm: [-97, -119, 97, 44], docStanding: [-51, -154, 49, 12], docBig: [-90, -300, 90, 24], docFlat: [-89, -45, 141, 58],
  seal: [-146, -142, 147, 69], chain3: [-213, -171, 213, 85], desk: [-147, -272, 147, 74], slotCabinet: [-209, -467, 209, 90],
  bridge: [-293, -198, 340, 182], emptyLot: [-164, -135, 164, 105], returnTag: [-30, -62, 29, 7], proofCard: [-61, -159, 59, 46],
  ammPool: [-136, -215, 136, 61], miniVendOracle: [-72, -261, 72, 31], shareDispenser: [-78, -204, 82, 184], shareCert: [-35, -17, 35, 16],
  checkpoint: [-213, -305, 284, 143], balance: [-163, -267, 163, 40], gradingMachine: [-91, -128, 91, 43], contractMachine: [-155, -250, 169, 76],
  punchCard: [-121, -168, 120, 45], magnifier: [-58, -260, 120, -105], browserWin: [-201, -332, 201, 81], cheque: [-60, -65, 172, 95],
  keycard: [-28, -45, 46, 30], hwWallet: [-73, -62, 90, 33], shield: [-68, -218, 64, 28],
  key: [-75, -35, 84, 31], thresholdMeter: [-52, -290, 71, 26], rack: [-113, -349, 113, 51], bucket: [-76, -164, 76, 28], safe: [-180, -376, 181, 82],
  timeLock: [-64, -182, 64, 27], knifeSwitch: [-153, -344, 133, 48], hourglass: [-56, -201, 56, 28], laptop: [-164, -234, 141, 66],
  phone: [-70, -195, 58, 27], mintPress: [-114, -238, 114, 55], frameStack: [-148, -265, 148, 70], forkSwitch: [-44, -117, 53, 23],
  // native-SVG areas, from their ground origin
  dots60: [0, 0, 280, 130], dots70: [0, 0, 280, 150], dots27: [0, 0, 280, 70], hallLabel: [-120, -32, 120, 12],
  overlap: [-130, -60, 130, 60], patternWall: [-380, -160, 380, 10], emptyBox: [-55, -130, 55, 12], partition: [-12, -170, 12, 35],
  badges: [-400, -70, 400, 0], badges2: [-300, -60, 300, 0], zoneTag: [-110, -24, 110, 30],
};
// rect(o, kind, scale) → world-canvas bbox [x0, y0, x1, y1] of that object standing at o (z lifts it)
export const rect = (o, kind, scale = o.scale ?? 1) => {
  const [X, Y] = Wp(o.u, o.v, o.z ?? 0); const q = EXT[kind];
  return [X + q[0] * scale, Y + q[1] * scale, X + q[2] * scale, Y + q[3] * scale];
};
/** camera that fits the union of rects into the screen box [x0,y0,x1,y1] */
export const fit = (rects, [x0, y0, x1, y1], kmax = 1.4) => {
  const X0 = Math.min(...rects.map((q) => q[0])), Y0 = Math.min(...rects.map((q) => q[1]));
  const X1 = Math.max(...rects.map((q) => q[2])), Y1 = Math.max(...rects.map((q) => q[3]));
  const k = Math.min(kmax, (x1 - x0) / (X1 - X0), (y1 - y0) / (Y1 - Y0));
  return camAt([(X0 + X1) / 2, (Y0 + Y1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};

// ---------------------------------------------------------------- per-area rect groups (named; the check script reads these)
const r = (o, kind) => rect(o, kind);
export const R = {
  // A
  dao: [r(A_VIT[0], "vitA"), r(A_LEDGER, "ledgerBook"), r(A_ARM, "callbackArm"), ...A_COINS.map((q) => r(q, "oddCoin")), r(A_DOTS[0], "dots60")],
  curve: [r(A_VIT[1], "vitA"), r(A_HASP, "hasp"), r(A_MANUAL, "manual"), r(A_DOTS[1], "dots70")],
  penpie: [r(A_VIT[2], "vitA"), r(A_PANEL, "funcPanel2"), r(A_DOTS[2], "dots27")],
  hallA: [r(A_LINE, "hallLabel"), r(A_SIGN, "signPlate"), r(A_TAG, "zoneTag")],
  // B
  aviation: [r(B_TOWER, "tower"), r(B_HSM, "hsm"), r(B_REPORT, "docStanding"), r(B_SEAL, "seal"), r(B_POSTMORTEM, "docStanding"), r(B_FIRM, "docFlat"),
    r(B_CHAIN, "chain3")],   // B_OVERLAP ("多方一致") is drawn over the three sources on purpose: framed in aviationB, not overlap-checked
  reading: [r(B_DESK, "desk"), r(B_READER, "person")],
  walls: [r(B_CABINET, "slotCabinet"), ...B_WALLS.map((q) => r(q, "signPlate")), r(B_BLANK, "signPlate")],
  patterns: [r(B_PATTERNS, "patternWall"), r(B_CABINET, "slotCabinet")],
  tagB: [r(B_TAG, "zoneTag")],
  // C
  reentry: [r(C1_VIT, "vitC"), r(C1_ARM, "callbackArm"), r(C1_PANEL, "funcPanel3"), ...C1_HASPS.map((q) => r(q, "hasp")), r(C1_SIGN, "signPlate")],
  zero: [r(C2_VIT, "vitC"), r(C2_ROOT, "docStanding"), r(C2_LOT, "emptyLot"), r(C2_TAG, "returnTag"), r(C2_PROOF, "proofCard"), r(C2_SIGN, "signPlate")],
  price: [r(C3_VIT, "vitC"), r(C3_ORACLE, "miniVendOracle"), r(C3_SHARE, "shareDispenser"), r(C3_CERT, "shareCert"), r(C3_GOOD, "miniVendOracle"),
    r(C3_LEDGER, "ledgerBook"), r(C3_SIGN, "signPlate")],
  tagC: [r(C_TAG, "zoneTag")],
  // D
  check: [r(D4_VIT, "vitC"), r(D4_PANEL, "funcPanel3"), r(D4_GATE, "checkpoint"), r(D4_BAL, "balance"), r(D4_GRADER, "gradingMachine"), r(D4_SIGN, "signPlate")],
  fork: [r(D5_VIT, "vitC"), r(D5_DIFF, "punchCard"), r(D5_BAL, "balance"), r(D5_MAG, "magnifier"), r(D5_SEAL, "seal"), r(D5_SIGN, "signPlate")],
  sign: [r(D6_VIT, "vitC"), ...D6_SIGNERS.map((q) => r(q, "person")), r(D6_CHEQUE, "cheque"), r(D6_KEYCARD, "keycard"), r(D6_HW, "hwWallet"),
    r(D6_SHIELD, "shield"), r(D6_SIGN, "signPlate")],
  tagD: [r(D_TAG, "zoneTag")],
  // E
  keys: [r(E7_VIT, "vitC"), r(E7_METER, "thresholdMeter"), r(E7_RACK, "rack"), r(E7_BUCKET, "bucket"), r(E7_SAFE, "safe"), r(E7_NOLOCK, "emptyBox"),
    r(E7_SWITCH, "knifeSwitch"), r(E7_SIGN, "signPlate")],
  meth: [r(EM_VEND, "vending"), r(EM_HOUR, "hourglass"), ...EM_COINS.map((q) => r(q, "oddCoin")), r(E7_SWITCH, "knifeSwitch")],
  people: [...E8_DESKS.map((q) => r(q, "desk")), r(E8_WALL, "partition"), ...E8_STAFF.map((q) => r(q, "person")), r(E8_QUIZ, "docFlat"), r(E8_PDF, "docFlat"),
    r(E8_LAPTOP, "laptop"), r(E8_AGENT, "person"), r(E8_DATA, "ledgerBook"), ...E8_PAIR.map((q) => r(q, "person")), r(E8_KEY, "key"), r(E8_SIGN, "signPlate")],
  nft: [r(EN_SIGN, "signPlate"), r(EN_PHONE, "phone"), r(EN_UI, "browserWin"), r(EN_MINT, "mintPress"), r(EN_INSIDER, "person")],
  tagE: [r(E_TAG, "zoneTag")],
  // F
  desk: [r(F_DESK, "desk"), r(F_DOC, "docBig"), r(F_CHAIN, "chain3"), r(F_STACK, "frameStack"), r(F_MAG, "magnifier"), r(F_FORK, "forkSwitch"),
    r(F_WOOD, "signWood"), r(F_SIGN, "signPlate"), r(F_BADGES, "badges")],
  vitrine: [r(F_VIT, "vitF"), r(F_BADGES2, "badges2")],
  tagF: [r(F_TAG, "zoneTag")],
};
// exhibits standing inside a vitrine (same ground point, z 40) — drawn inside, excluded from the overlap check
export const INSIDE = {
  A: [...A_VEND.map((q) => r(q, "vending"))],
  C: [r(C1_VEND, "vending"), r(C2_BRIDGE, "bridge"), r(C3_POOL, "ammPool")],
  D: [r(D4_VEND, "vending"), ...D5_MACH.map((q) => r(q, "contractMachine")), r(D6_UI, "browserWin")],
  E: [...E7_KEYS.map((q) => r(q, "key"))],
};
export const ZONE_RECTS = {
  A: [...R.dao, ...R.curve, ...R.penpie, ...R.hallA],
  B: [...R.aviation, ...R.reading, ...R.walls, R.patterns[0], ...R.tagB],
  C: [...R.reentry, ...R.zero, ...R.price, ...R.tagC],
  D: [...R.check, ...R.fork, ...R.sign, ...R.tagD],
  E: [...R.keys, ...R.meth.slice(0, -1), ...R.people, ...R.nft, ...R.tagE],
  F: [...R.desk, ...R.vitrine, ...R.tagF],
};
const Z = ZONE_RECTS;
const SAFE = [100, 280, 1820, 860];                      // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for code cards / event cards at the sides

// ---------------------------------------------------------------- camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur)
export const CAMS = {
  // 全景：A–F 整座档案馆（seg2 L0–L2；seg6 L10–L12、L14–L15 结束卡）
  wide: fit([...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E, ...Z.F], [60, 220, 1860, 860], 1),
  // 分区全景：A 门厅
  A: fit(Z.A, SAFE),
  // 分区全景：B 阅览厅
  B: fit(Z.B, SAFE),
  // 分区全景：C 代码展厅
  C: fit(Z.C, SAFE),
  // 分区全景：D 改动展厅
  D: fit(Z.D, SAFE),
  // 分区全景：E 钥匙与人展厅
  E: fit(Z.E, SAFE),
  // 分区全景：F 复盘台
  F: fit(Z.F, SAFE),
  // A DAO 展柜 + 账本 + 回调臂 + 币 + 60 点阵（seg1 起点 L0–L3）
  daoA: fit(R.dao, MID),
  // A Curve 展柜：破锁 + 编译器手册 + 70 点阵（seg1 L4–L6）
  curveA: fit(R.curve, MID),
  // A Penpie 展柜：按钮面板 + 空锁框 + 27 点阵（seg1 L7–L8）
  penpieA: fit(R.penpie, MID),
  // A 三只展柜 + 串联红线标签 + 入口牌（seg1 L9–L12 终点；seg2 起点）
  hallA: fit([...R.dao, ...R.curve, ...R.penpie, r(A_LINE, "hallLabel"), r(A_SIGN, "signPlate")], SAFE),
  // B 比喻角：塔台、黑匣子、公开报告、公章、项目复盘、安全公司分析、链 + 阅读位（seg2 L3–L11）
  aviationB: fit([...R.aviation, ...R.reading, r(B_OVERLAP, "overlap")], SAFE),
  // B 档案柜 + 六面展墙 + 空白牌 + 阅读位（seg2 L12–L16）
  wallsB: fit([...R.walls, ...R.reading], SAFE),
  // B 模式墙 + 档案柜（seg2 L17–L18 终点；seg3 起点）
  patternsB: fit(R.patterns, MID),
  // C ① 柜：Fei Rari + 回调臂 + 按钮面板 + 两把共享锁 + 牌（seg3 L0–L5；代码卡 A 在右侧）
  reentryC: fit([...R.reentry, r(C1_VEND, "vending")], MID),
  // C ② 柜：Nomad 桥 + 可信根 + 零地址荒地 + 回执签 + 证明卡 + 牌（seg3 L6–L12）
  zeroC: fit([...R.zero, r(C2_BRIDGE, "bridge")], MID),
  // C ③ 柜：池子 + 单一价格机 + 份额机 + 份额 + 防御预言机 + 内部账本 + 牌（seg3 L13–L18 终点；seg4 起点）
  priceC: fit([...R.price, r(C3_POOL, "ammPool")], MID),
  // D ④ 柜：Euler + 按钮面板 + 关卡 + 天平 + 阅卷机 + 牌（seg4 L0–L5）
  checkD: fit([...R.check, r(D4_VEND, "vending")], MID),
  // D ⑤ 柜：两台合约机器 + 差异卡 + 天平 + 放大镜 + 公章 + 牌（seg4 L6–L10）
  forkD: fit([...R.fork, ...D5_MACH.map((q) => r(q, "contractMachine"))], MID),
  // D ⑥ 柜：多签界面 + 签名人 + 支票 + 权限卡 + 硬件钱包 + 盾牌 + 牌（seg4 L11–L17 终点；seg5 起点）
  signD: fit([...R.sign, r(D6_UI, "browserWin")], MID),
  // E ⑦ 柜：九把钥匙 + 门槛表 + 机柜 + 云桶 + 保险柜 + 时间锁空框 + 闸刀 + 牌（seg5 L0–L6）
  keysE: fit([...R.keys, ...E7_KEYS.map((q) => r(q, "key"))], MID),
  // E mETH 角：售货机 + 8 小时沙漏 + 暂停闸刀 + 三枚 cmETH（seg5 L7–L8）
  methE: fit(R.meth, MID),
  // E ⑧ 柜：两张桌 + 隔板 + 员工 + 测试题 + PDF + 笔记本 + 客服 + 用户数据 + 两人确认 + 收回钥匙 + 牌（seg5 L9–L15）
  peopleE: fit(R.people, MID),
  // E NFT 与 GameFi 墙：牌 + 手机 + 前端 + 铸币机 + 内部人（seg5 L16 终点；seg6 起点）
  nftE: fit(R.nft, MID),
  // F 复盘台：复盘文件 + 链 + 调用树 + 放大镜 + 扳道器 + 木牌 + 徽章行 + 牌（seg6 L0–L9）
  deskF: fit(R.desk, SAFE),
  // F 空展柜 + 八枚徽章（seg6 L13）
  vitrineF: fit(R.vitrine, MID),
};
/** alias (ep11 convention): the whole world */
export const world = CAMS.wide;
CAMS.world = CAMS.wide;
