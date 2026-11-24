// ep19「确认街」shared world layout — one continuous isometric world, fixed for all six segments:
//   import { USER_A, PHONE_A, DESK_A, ATK_A, PLATES_A, LETTERS_A, CLOCK_A, GPU_A, ROLL_A, MAG_A, ODD_A, DOTS_A,
//            WIN_B, USER_B, PHONE_B, PARCEL_B, DOC_B, KEY_B, MAG_B, CHEQUES_B, BOARDS_B, ADDR_B, DELEG_B, SHARE_B, CHAIN_B, GAS_B,
//            SAFE_B, KEYCARD_B, MINT_B, ATK_B, DOTS_B,
//            WINS_C, DEV_C, DIST_C, LAPTOP_C, RACK_C, TOWER_C, PHONE_C, PIZZA_C, BOTS_C, KITS_C, DOTS_C,
//            STALL_D, POOL_D, TEAM_D, BURN_D, MINT_D, ODD_D, TOWER_D, CASES_D,
//            PHONE_E, CHEQUE_E, SHIELD_E, ADDR_E, DELEG_E, SCALE_E, CHECK_E, ACTS_E, WL_E, HOUR_E, ADDR2_E, MAG_E, ODD_E,
//            LEDGERS_E, DOC_E, ROLES_E, USER_E,
//            ROAD, EXT, rect, fit, GROUPS, ZONE_RECTS, CAMS, world } from "../../shared/layout.mjs";
// (from ep19/segN/src/build-story.mjs). Positions only; ids, states, labels and per-shot opts stay in each segment.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// Every position is written as S(X, Y) = the world point whose ground lands on world-canvas px (X, Y) (iso.G, rounded) —
// so the numbers read as on-screen ground positions at camera scale 1. `scale` = the opts.scale to pass to the object.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): of the objects used here kit person / ledgerBook, E05 keycard, E06 shareCert / pizza / burnBox,
//   E07 parcel / dispatchDesk / oddCoin / scale, E08 liqBot / marketStall / ammPool, E09 cheque, E11 mintPress, E15 delegateTag / gasPump
//   take opts.scale (BRIEF §2). Everything else IGNORES it. Where such an object carries `scale` below it is marked "wrap": the segment MUST
//   put it with the wrap helper (translate · scale · translate around its ground point) and rescale its anchors; rect() / CAMS already
//   assume the scaled size. (kit phone C 0.7 / E 1.4, browserWin C 0.5, laptop / rack C 0.7, tower C 0.7 / D 0.6, safe B 0.7,
//   chain B 0.6, gpuRig A 0.7.)
// Zones (world-canvas px, left → right along the street; zone anchors all at Y = 0):
//   B 签名柜台 far left (anchor X −5600; X ≈ −6560..−4480)
//   · C 钓鱼工坊 left-middle (anchor X −2800; X ≈ −3550..−1630)
//   · A 转账台 middle (anchor X 0; X ≈ −530..+880, the dispatch desk left of the anchor)
//   · D 代币摊 right next to A (anchor X 2600; X ≈ 1790..3460)
//   · E 防线 far right (anchor X 5400; X ≈ 4550..6890).
// Neighbouring zones are ≥ ~650 canvas px apart edge to edge; per-zone framings in CAMS hold only their own zone's key objects.
// Native-SVG areas (dot matrices, the four action icons) are given as a ground origin + a box kind in EXT.
// The street (浅灰石板路) is native SVG: ROAD = the two world-canvas px end points of its centre line, a ground band (≈ 160 px tall)
// drawn under the items layer, so it passes behind every zone's front row.
import { Wp, G, camAt } from "../../kit/iso.mjs";

/** world ground point for world-canvas px (X, Y); extra fields (scale, z …) copied in */
const S = (X, Y, extra = {}) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
/** zone-local placer: positions below are written relative to the zone's anchor px */
const zone = (OX, OY) => (X, Y, extra) => S(OX + X, OY + Y, extra);
export const ROAD = [[-7000, 560], [7300, 560]];        // street centre line, world-canvas px (native SVG band ≈ 160 px tall)

// ---- A 中·转账台 (seg1 全段; seg4 L0–L11; seg6 L9–L13)
const a = zone(0, 0);
export const DESK_A = a(-250, 0, { scale: 0.9 });        // E07 dispatchDesk 0.9 entries: "测试 50 USDT"(绿) / "0.005 USDT"(红)
export const USER_A = a(-480, 120, { scale: 0.6 });      // kit person signer "用户" 0.6
export const PHONE_A = a(-330, 330);                     // kit phone (original size) "收款地址 0x7a…c1"
export const ATK_A = a(820, 160, { scale: 0.6 });        // kit person attacker 0.6 (enters at the edge, seg1 L3)
export const PLATES_A = [a(180, 40), a(400, 40)];        // E02 addrPlate ×2 (original size): "真实收款方" / "投毒地址" state attacker (grow in seg1 L3)
export const LETTERS_A = [a(-390, 60), a(-330, 110)];   // E01 letter: small green test letter / big red letter (walk to PLATES_A)
export const CLOCK_A = a(-60, 280);                      // kit clock "约 26 分钟"
export const GPU_A = a(650, -220, { scale: 0.7 });       // E02 gpuRig "生成相似地址" (wrap 0.7!)
export const ROLL_A = a(650, -220, { z: 320 });          // E02 rollCounter on top of the gpuRig (z 320 ≈ the 0.7 rig's top) "约 43 亿次"
export const MAG_A = a(520, 330);                        // kit magnifier (floats; slide it over PLATES_A in seg4 L8 / seg6 L12)
export const ODD_A = [a(0, -70, { scale: 0.6 }), a(80, -40, { scale: 0.6 })]; // E07 oddCoin ×2 red "USDT" 0.6 (fall into the desk, seg4 L7)
export const DOTS_A = a(60, 330);                        // dot matrix area (native SVG): 50 dots seg1 L4, 68 dots seg4 L10, EXT.dotsA

// ---- B 最左·签名柜台 (seg2 全段; seg5 L7–L8 回看)
const b = zone(-5600, 0);
export const WIN_B = b(-760, -200);                      // kit browserWin "领取空投" button "签名领取" (original size)
export const USER_B = b(-820, 220, { scale: 0.6 });      // kit person signer 0.6
export const PHONE_B = b(-620, 230);                     // kit phone (original size): hex → decoded fields
export const PARCEL_B = b(-300, 60);                     // E07 parcel 1.0
export const DOC_B = b(-450, -120);                      // kit doc standing "签收单" (back: "同意交出房门钥匙")
export const KEY_B = b(-420, 130);                       // kit key "房门钥匙" (original size)
export const MAG_B = b(-450, 480);                       // kit magnifier (seg2 L25, near the phone)
export const CHEQUES_B = [b(-100, 0), b(120, 0), b(340, 0), b(560, 0)].map((q) => ({ ...q, scale: 0.8 })); // E09 cheque ×4 0.8: approve / permit "链下" / setApprovalForAll / Permit2 copies 3
export const ADDR_B = b(780, 0);                         // E02 addrPlate (user address) = the fifth stand, 7702
export const DELEG_B = b(870, 40);                       // E15 delegateTag 1.0 target "扫币合约" attacker (hang on ADDR_B's post if wanted)
export const BOARDS_B = [b(-100, 300), b(120, 300), b(340, 300), b(560, 300), b(780, 300)]; // E01 signBoard plate ×5 (small, signPlate2 size): approve / permit / setApprovalForAll / Permit2 / 7702
export const SHARE_B = b(450, -150, { scale: 1.2 });     // E06 shareCert n 4 1.2 (NFT 系列, slides away seg2 L12)
export const CHAIN_B = b(-100, -230, { scale: 0.6 });    // kit chain n 3 "上链" (wrap 0.6!), behind the approve cheque
export const GAS_B = b(120, -230, { scale: 0.6 });       // E15 gasPump "Gas" 0.6
export const SAFE_B = b(300, -430, { scale: 0.7 });      // kit safe plate "金库合约" (wrap 0.7!)
export const KEYCARD_B = b(470, -380, { scale: 0.7 });   // E05 keycard "owner" 0.7 (ink → attacker seg2 L19)
export const MINT_B = b(660, -400, { scale: 0.6 });      // E11 mintPress 0.6 (DAI, seg2 L20)
export const ATK_B = b(980, 180, { scale: 0.6 });        // kit person attacker 0.6
export const DOTS_B = b(820, -500);                      // dot matrix area (32 / 55 / 2+1 dots), EXT.dotsB

// ---- C 左中·钓鱼工坊 (seg3 全段)
const c = zone(-2800, 0);
export const WINS_C = [c(-750, -250), c(-520, -250), c(-290, -250)].map((q) => ({ ...q, scale: 0.5 })); // kit browserWin ×3 仿冒站 (wrap 0.5!)
export const RACK_C = c(-660, 60, { scale: 0.7 });      // kit rack tag "后台" (wrap 0.7!)
export const LAPTOP_C = c(-360, 40, { scale: 0.7 });     // kit laptop "钓鱼套件" (wrap 0.7!)
export const DEV_C = c(-520, 190, { scale: 0.55 });      // kit person attacker "开发者" 0.55
export const DIST_C = c(-120, 170, { scale: 0.55 });     // kit person attacker "分发者" 0.55
export const TOWER_C = c(80, -150, { scale: 0.7 });      // kit tower "广告投放" (wrap 0.7!)
export const PHONE_C = c(250, -60, { scale: 0.7 });      // kit phone "私信" (wrap 0.7!)
export const PIZZA_C = c(100, 250, { scale: 0.8 });      // E06 pizza slices 5 0.8
export const BOTS_C = [c(420, 150), c(540, 190), c(660, 230)].map((q) => ({ ...q, scale: 0.9 })); // E08 liqBot ×3 attacker 0.9 "$" "$$" "$$$"
export const KITS_C = [c(480, -250), c(640, -250), c(800, -250)]; // E01 signBoard wood ×3 "Inferno" "Pink" "Angel"
export const DOTS_C = c(850, 50);                        // trend dot columns (49 vs 8, native SVG), EXT.dotsC

// ---- D 中偏右·代币摊 (seg4 L12–L20; seg5 L16)
const d = zone(2600, 0);
export const TOWER_D = d(-750, 150, { scale: 0.6 });     // kit tower "名人推广" (wrap 0.6!)
export const STALL_D = d(-500, -60, { scale: 0.8 });     // E08 marketStall 0.8 price board "↑"
export const POOL_D = d(-200, 120, { scale: 0.8 });      // E08 ammPool 0.8 labelL "新币" labelR "USDT"
export const TEAM_D = d(20, 200, { scale: 0.5 });        // kit person attacker "团队" 0.5
export const ODD_D = [d(-60, -150), d(0, -130), d(60, -110)].map((q) => ({ ...q, scale: 0.6 })); // E07 oddCoin ×3 新币 0.6
export const BURN_D = d(200, -50, { scale: 0.8 });       // E06 burnBox plate "貔貅盘" 0.8
export const MINT_D = d(450, 50, { scale: 0.6 });        // E11 mintPress "隐藏增发" 0.6
export const CASES_D = [d(300, 320), d(520, 320), d(740, 320)]; // E01 signBoard plate ×3 "SQUID" "LIBRA" "979 个" (signPlate2 size)

// ---- E 最右·防线 (seg5 全段; seg6 L0–L8)
const e = zone(5400, 0);
export const SHIELD_E = e(-560, -200);                   // kit shield "强警告"
export const PHONE_E = e(-750, 100, { scale: 1.4 });     // kit phone, large (wrap 1.4!)
export const CHEQUE_E = e(-520, 150, { scale: 1.3 });    // E09 cheque 1.3 (decoded fields)
export const ADDR_E = e(-330, -150);                     // E02 addrPlate
export const DELEG_E = e(-240, -110);                    // E15 delegateTag 1.0 "审计过的实现" (green)
export const SCALE_E = e(-250, 150, { scale: 0.9 });     // E07 scale 0.9 (前 / 后 / 差)
export const CHECK_E = e(80, -80);                        // kit checkpoint "域名信誉"
export const ACTS_E = [e(-600, 420), e(-350, 420), e(-100, 420), e(150, 420)]; // four action icons on the road (native SVG): 点击 / 签名 / 复制 / 粘贴, EXT.act
export const WL_E = e(520, -150);                        // E01 signBoard plate "白名单" (signPlate2 size)
export const HOUR_E = e(700, -120);                      // kit hourglass "冷却期"
export const ODD_E = e(820, -330, { scale: 0.6 });       // E07 oddCoin red "USDT" 0.6 (bounced at the deposit gate)
export const ADDR2_E = [e(440, 170), e(560, 170)];       // E02 addrPlate ×2 (首尾比对)
export const MAG_E = e(700, 420);                        // kit magnifier
export const LEDGERS_E = [e(960, -100, { scale: 0.8 }), e(960, 150, { scale: 0.8 })]; // kit ledgerBook ×2 0.8 "交易记录" / "风控名单"
export const DOC_E = e(1180, -220);                      // kit doc standing "官方从不要求签名领取"
export const ROLES_E = e(1300, 250);                     // E05 roleBoard "今天做一件事" (original size)
export const USER_E = e(1000, 380, { scale: 0.55 });     // kit person signer 0.55

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1. [x0, y0, x1, y1].
export const EXT = {
  person: [-50, -208, 50, 7], personAtk: [-50, -229, 50, 7], phone: [-70, -195, 58, 27], dispatchDesk: [-113, -147, 113, 44],
  addrPlate: [-56, -174, 57, 10], letter: [-28, -56, 26, 0], clock: [-76, -193, 61, 2], gpuRig: [-143, -349, 143, 56],
  rollCounterTop: [-134, -394, 134, -247], magnifier: [-58, -260, 120, -105], oddCoin: [-39, -109, 39, 18],
  browserWin: [-201, -332, 201, 81], parcel: [-38, -56, 38, 18], docStanding: [-84, -261, 82, 23], key: [-75, -35, 84, 31],
  cheque: [-75, -124, 74, 24], delegateTag: [-25, -73, 25, -5], signPlate2: [-113, -233, 86, 42], shareCert: [-35, -17, 35, 16],
  chain3: [-213, -171, 213, 85], gasPump: [-64, -165, 64, 31], safe: [-180, -376, 181, 82], keycard: [-28, -85, 26, 9],
  mintPress: [-114, -238, 114, 55], rack: [-113, -349, 113, 51], laptop: [-164, -234, 141, 66], tower: [-106, -417, 106, 53],
  pizza: [-165, -290, 195, 104], liqBot: [-40, -77, 45, 20], signWood: [-68, -146, 68, 14], marketStall: [-133, -279, 136, 56],
  ammPool: [-136, -215, 136, 61], burnBox: [-120, -202, 120, 58], shield: [-68, -218, 64, 28], scale: [-93, -214, 93, 44],
  checkpoint: [-213, -305, 284, 143], hourglass: [-56, -201, 56, 28], ledgerBook: [-158, -97, 158, 74], roleBoard: [-194, -334, 187, 72],
  dotsA: [0, 0, 300, 120], dotsB: [0, 0, 300, 110], dotsC: [0, 0, 320, 160], act: [-40, -90, 40, 10],
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

// rect groups = the key objects each close-up must hold (used by ZONE_RECTS and CAMS)
const plates = (arr) => arr.map((q) => rect(q, "addrPlate"));
export const GROUPS = {
  deskA: [rect(USER_A, "person"), rect(PHONE_A, "phone"), rect(DESK_A, "dispatchDesk"), ...LETTERS_A.map((q) => rect(q, "letter")), rect(PLATES_A[0], "addrPlate")],
  platesA: [rect(DESK_A, "dispatchDesk"), ...plates(PLATES_A), rect(CLOCK_A, "clock"), rect(ATK_A, "personAtk"), rect(DOTS_A, "dotsA"), ...LETTERS_A.map((q) => rect(q, "letter"))],
  userA: [rect(USER_A, "person"), rect(PHONE_A, "phone"), ...LETTERS_A.map((q) => rect(q, "letter"))],
  quizA: [...plates(PLATES_A), rect(MAG_A, "magnifier")],
  poisonA: [...plates(PLATES_A), rect(GPU_A, "gpuRig"), rect(ROLL_A, "rollCounterTop"), rect(DESK_A, "dispatchDesk"), rect(ATK_A, "personAtk"),
    rect(DOTS_A, "dotsA"), rect(MAG_A, "magnifier"), ...ODD_A.map((q) => rect(q, "oddCoin"))],
  receiptB: [rect(WIN_B, "browserWin"), rect(USER_B, "person"), rect(PHONE_B, "phone"), rect(PARCEL_B, "parcel"), rect(DOC_B, "docStanding"), rect(KEY_B, "key")],
  chequesB: [...CHEQUES_B.map((q) => rect(q, "cheque")), rect(ADDR_B, "addrPlate"), rect(DELEG_B, "delegateTag"), ...BOARDS_B.map((q) => rect(q, "signPlate2")),
    rect(SHARE_B, "shareCert"), rect(CHAIN_B, "chain3"), rect(GAS_B, "gasPump")],
  vaultB: [rect(SAFE_B, "safe"), rect(KEYCARD_B, "keycard"), rect(MINT_B, "mintPress"), rect(DOTS_B, "dotsB"), rect(CHEQUES_B[1], "cheque"), rect(SHARE_B, "shareCert")],
  delegB: [rect(ADDR_B, "addrPlate"), rect(DELEG_B, "delegateTag"), rect(ATK_B, "personAtk"), rect(DOTS_B, "dotsB"),
    rect(CHEQUES_B[3], "cheque")],
  splitC: [rect(DEV_C, "personAtk"), rect(DIST_C, "personAtk"), rect(LAPTOP_C, "laptop"), rect(RACK_C, "rack"), rect(TOWER_C, "tower"), rect(PHONE_C, "phone"), rect(PIZZA_C, "pizza")],
  botsC: [...BOTS_C.map((q) => rect(q, "liqBot")), rect(PHONE_C, "phone"), rect(PIZZA_C, "pizza")],
  kitsC: [...KITS_C.map((q) => rect(q, "signWood")), ...BOTS_C.map((q) => rect(q, "liqBot")), rect(PHONE_C, "phone")],
  trendC: [rect(DOTS_C, "dotsC"), ...KITS_C.map((q) => rect(q, "signWood")), ...BOTS_C.map((q) => rect(q, "liqBot"))],
  stallD: [rect(STALL_D, "marketStall"), rect(POOL_D, "ammPool"), rect(TEAM_D, "personAtk"), rect(BURN_D, "burnBox"), rect(MINT_D, "mintPress"),
    ...ODD_D.map((q) => rect(q, "oddCoin"))],
  casesD: [...CASES_D.map((q) => rect(q, "signPlate2")), rect(TOWER_D, "tower"), rect(STALL_D, "marketStall"), rect(BURN_D, "burnBox"), rect(MINT_D, "mintPress")],
  walletE: [rect(PHONE_E, "phone"), rect(CHEQUE_E, "cheque"), rect(SHIELD_E, "shield"), rect(SCALE_E, "scale"), rect(CHECK_E, "checkpoint"),
    rect(ADDR_E, "addrPlate"), rect(DELEG_E, "delegateTag")],
  exchE: [rect(WL_E, "signPlate2"), rect(HOUR_E, "hourglass"), ...LEDGERS_E.map((q) => rect(q, "ledgerBook")), ...plates(ADDR2_E), rect(MAG_E, "magnifier"),
    rect(ODD_E, "oddCoin"), rect(DOC_E, "docStanding")],
  rolesE: [rect(ROLES_E, "roleBoard"), rect(USER_E, "person"), rect(DOC_E, "docStanding")],
};
const R = GROUPS;
// key objects per zone (the rects each framing must hold)
export const ZONE_RECTS = {
  A: [...R.poisonA, ...R.deskA, rect(CLOCK_A, "clock")],
  B: [...R.receiptB, ...R.chequesB, ...R.vaultB, rect(ATK_B, "personAtk"), rect(MAG_B, "magnifier")],
  C: [...WINS_C.map((q) => rect(q, "browserWin")), ...R.splitC, ...R.kitsC, rect(DOTS_C, "dotsC")],
  D: [...R.stallD, ...R.casesD],
  E: [...R.walletE, ...R.exchE, ...R.rolesE, ...ACTS_E.map((q) => rect(q, "act"))],
};
const Z = ZONE_RECTS;
const SAFE = [100, 280, 1820, 860];                      // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for code cards / question cards at the sides
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur).
export const CAMS = {
  // 全景：确认街五个区（seg6 L13–L14 → 结束卡）
  wide: fit([...Z.B, ...Z.C, ...Z.A, ...Z.D, ...Z.E], [90, 200, 1830, 860], 1),
  // A 转账台全景
  A: fit(Z.A, SAFE, 1.4),
  // A 近景：用户 + 钱包 + 交易记录 + 测试信封 + 真实收款方（seg1 起点 L0–L2）
  deskA: fit(R.deskA, MID, 1.4),
  // A 交易记录 + 两个门牌 + 时钟 + 攻击者 + 点阵（seg1 L3–L5）
  platesA: fit(R.platesA, SAFE, 1.4),
  // A 用户全身 + 钱包（seg1 L6–L8）
  userA: fit(R.userA, MID, 1.6),
  // A 门牌特写，右侧留题卡位（seg1 L9–L11 终点；seg2 起点；seg6 L9–L12）
  quizA: fit(R.quizA, [200, 360, 1150, 860], 1.6),
  // A 投毒机制：门牌 + GPU + 计数器 + 交易记录 + 点阵（seg4 起点 L0–L11）
  poisonA: fit(R.poisonA, SAFE, 1.4),
  // B 签名柜台全景（seg2 L0–L2）
  signB: fit(Z.B, SAFE, 1.4),
  B: fit(Z.B, SAFE, 1.4),
  // B 签收单比喻：空投窗口 + 用户 + 手机 + 包裹 + 签收单 + 钥匙（seg2 L3–L6）
  receiptB: fit(R.receiptB, MID, 1.4),
  // B 五张支票展台 + 链 + 油泵 + NFT（seg2 L7–L17）
  chequesB: fit(R.chequesB, SAFE, 1.4),
  // B 金库 + owner 卡 + 铸币机 + 点阵（seg2 L18–L22）
  vaultB: fit(R.vaultB, MID, 1.4),
  // B 7702 委托牌 + 攻击者 + 小点阵（seg2 L23–L25 终点；seg3 起点）
  delegB: fit(R.delegB, MID, 1.4),
  // C 钓鱼工坊全景（seg3 L0–L1）
  shopC: fit(Z.C, SAFE, 1.4),
  C: fit(Z.C, SAFE, 1.4),
  // C 开发者 / 分发者 / 渠道 / 披萨（seg3 L2–L7）
  splitC: fit(R.splitC, SAFE, 1.4),
  // C 扫币机器人（seg3 L8–L9）
  botsC: fit(R.botsC, MID, 1.4),
  // C 三块套件牌 + 机器人（seg3 L10–L15）
  kitsC: fit(R.kitsC, MID, 1.4),
  // C 年度趋势点阵（seg3 L16–L20 终点；seg4 起点）
  trendC: fit(R.trendC, MID, 1.4),
  // D 代币摊全景（seg4 L12–L15）
  stallD: fit(R.stallD, SAFE, 1.4),
  D: fit(Z.D, SAFE, 1.4),
  // D 三块案例牌 + 名人推广 + 摊位（seg4 L16–L20 终点；seg5 起点）
  casesD: fit(R.casesD, SAFE, 1.4),
  // E 防线全景（seg5 L0–L3）
  guardE: fit(Z.E, SAFE, 1.4),
  E: fit(Z.E, SAFE, 1.4),
  // E 钱包层：手机 + 支票 + 盾牌 + 台秤 + 关卡 + 委托牌（seg5 L4–L11）
  walletE: fit(R.walletE, MID, 1.4),
  // E 交易所层：白名单 + 沙漏 + 账本 + 门牌 + 放大镜（seg5 L12–L18 终点）
  exchE: fit(R.exchE, MID, 1.4),
  // E 角色板（seg6 起点 L0–L8）
  rolesE: fit(R.rolesE, MID, 1.4),
};
CAMS.world = CAMS.wide;                                  // alias
export const world = CAMS.world;
