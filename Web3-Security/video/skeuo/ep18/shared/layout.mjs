// ep18「钥匙街」shared world layout — one continuous isometric world, fixed for all six segments:
//   import { SAFE_A, METER_A, BOARD_A, SIGNERS_A, WALLETS_A, KEYS_A, UIWIN_A, ATK_A, DOTS_A,
//            VIT, PHONE_B, LAPTOP_B, HW_B, SAFE_B, LOCKS_B, PUZZLE_B, HSM_B, SEAL_B, MNEMO_B, DIAL_B, KEYS_B, BOARD_B,
//            CONV, BOARDS_C, PRNG_C, GPU_C, ADDR_C, VAULT_C, ADMIN_C, PHONE_C, DB_C, WIN_C, APIKEY_C, LETTER_C,
//            RACKS_C, CEO_C, CLOUD_C, DOTS_GEN, DOTS_STORE, DOTS_REL, DOTS_BACK, CPIPE,
//            DESKS_D, SIGNERS_D, LAPTOP_D, HW_D, UIWIN_D, CHEQUE_UI, CHEQUE_REAL, SEAL_D, MAG_D, VEND_D, CLOCK_D, PHONE_D, FUNNEL_D, SRC_D,
//            COLD_E, WARM_E, HOT_E, TLOCK_E, METER_E, TOLL_E, HSM_E, SEAL_E, RACK_E, SHIELD_E, DOC_E, LEDGER_E, USERS_E, ROLES_E, EPIPE,
//            ROAD, EXT, rect, fit, ZONE_RECTS, CAMS, world } from "../../shared/layout.mjs";
// (from ep18/segN/src/build-story.mjs). Positions only; ids, states, labels and per-shot opts stay in each segment.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Every position is written as S(X, Y) = the world point whose ground lands on world-canvas px (X, Y) (iso.G, rounded) —
// so the numbers read as on-screen ground positions at camera scale 1. `scale` = the opts.scale to pass to the object.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): of the objects used here only kit person / ledgerBook, E05 keycard, E07 tollClip and E09 cheque
//   take opts.scale. Everything else IGNORES it. Where such an object carries `scale` below it is marked "wrap": the segment MUST put it with
//   the wrap helper (translate · scale · translate around its ground point) and rescale its anchors; rect() / CAMS already assume the scaled size.
// Zones (world-canvas px, left → right along the street; zone anchors all at Y = 0):
//   B 方案陈列馆 far left (anchor X −5900; X ≈ −6860..−4410)
//   · C 钥匙流水线 left-middle (anchor X −2700; X ≈ −4040..−1350; the conveyor runs along u, so it climbs to the right on screen)
//   · A 冷钱包金库 middle (anchor X 0; X ≈ −920..990, the gold safe at the anchor)
//   · D 签名台 right next to A (anchor X 2400; X ≈ 1780..3870)
//   · E 交易所三层钱包 far right (anchor X 5300; X ≈ 4520..6890).
// Neighbouring zones are ≥ ~650 canvas px apart edge to edge (B–C ≈ 380 incl. the conveyor's ends, C–A ≈ 430, A–D ≈ 790, D–E ≈ 650);
// the per-zone framings in CAMS hold only their own zone's key objects. Every key object of a framing sits inside x 60–1860 / y 160–860 at that framing (checked).
// Native-SVG areas (dot matrices, the CEO cloud box, the street) are given as a ground origin + a box kind in EXT.
// The street (浅灰石板路) is native SVG: ROAD = the two world-canvas px end points of its centre line, a ground band (≈ 160 px tall)
// drawn under the items layer, so it passes behind every zone's front row.
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
export const ROAD = [[-7300, 560], [7300, 560]];        // street centre line, world-canvas px (native SVG band ≈ 160 px tall)

// ---- A 中·冷钱包金库 (seg1 全段; seg4 L0–L1; seg6 L9–L12): anchor = gold safe
const a = zone(0, 0);
export const SAFE_A = a(0, -80);                         // kit safe gold, plate "WazirX 冷钱包" (original size)
export const METER_A = a(330, -120);                     // E05 thresholdMeter max 6, th 4, thText "6 选 4" (original size)
export const BOARD_A = a(-420, -150);                    // E01 signBoard plate "冷钱包 · 大部分资产"
const SX = [-800, -480, -160, 160, 480, 800], SY = [330, 250, 210, 210, 250, 330]; // signers' half circle in front of the safe
export const SIGNERS_A = SX.map((x, i) => a(x, SY[i], { scale: 0.6 }));       // kit person signer ×6 0.6
export const WALLETS_A = SX.map((x, i) => a(x + 105, SY[i] + 30));            // kit hwWallet ×6 (original size), screen "确认?"
export const KEYS_A = SX.map((x, i) => a(x + 40, SY[i] + 110, { scale: 0.6 })); // kit key ×6 0.6 (wrap!), each on a small native-SVG plate, in front of its signer
export const UIWIN_A = a(0, 560, { scale: 0.6 });        // kit browserWin "签名界面" 0.6 (wrap!), in front of the signers from seg1 L4
export const ATK_A = a(950, 100, { scale: 0.7 });        // kit person attacker 0.7
export const DOTS_A = a(230, -40);                       // dot matrix (23 dots, 1 dot ≈ 1000 万美元) floating out of the safe, EXT.dotsA

// ---- B 最左·方案陈列馆 (seg2 全段; seg6 L5–L8): five vitrines in a row; anchor = the middle (multisig) vitrine
const b = zone(-5900, 0);
export const VIT = [-840, -420, 0, 420, 840].map((x) => b(x, 0)); // E02 vitrine ×5 (w 160, d 120, h 150), plates "软件钱包" "硬件钱包" "多签" "MPC" "HSM"
export const PHONE_B = b(-840, -10, { scale: 0.7 });     // kit phone "助记词钱包" 0.7 (wrap!) inside vitrine 0
export const LAPTOP_B = b(-840, 230, { scale: 0.7 });    // kit laptop 0.7 (wrap!) in front of vitrine 0
export const HW_B = b(-420, -10);                        // kit hwWallet (original size) inside vitrine 1
export const SAFE_B = b(0, -10, { scale: 0.6 });         // kit safe (default) 0.6 (wrap!) inside vitrine 2
export const LOCKS_B = [-40, 0, 40].map((dx) => b(dx, 30, { scale: 0.5, z: 70 })); // kit padlock ×3 0.5 (wrap!) on the safe door (lift by z)
export const PUZZLE_B = b(380, 230);                     // E02 puzzleSet assembled false (original size) in front of vitrine 3 ("MPC")
export const HSM_B = b(840, -10, { scale: 0.8 });        // kit hsm 0.8 (wrap!) inside vitrine 4
export const SEAL_B = b(840, 230);                       // kit seal (original size) in front of vitrine 4
export const MNEMO_B = b(-520, 330);                     // E02 mnemonicPlate "12 / 24 个单词" in front of vitrines 0/1
export const DIAL_B = b(-280, 340, { scale: 0.7 });      // E02 comboDial rings 8 "256 位" 0.7 (wrap!)
export const KEYS_B = [b(-120, 450), b(120, 450)];       // kit key ×2 (original size): 原钥匙 + 复制出的红钥匙 (state attacker)
export const BOARD_B = b(1300, 150);                     // E01 signBoard plate "盲签风险" (header of the blind-signing table, seg2 L15–L17)

// ---- C 左中·钥匙流水线 (seg3 全段; seg6 L2–L4): anchor = conveyor centre; stations stand in front (+Y) of the belt
const c = zone(-2700, 0);
export const CONV = c(0, 0, { len: 3200 });              // E02 conveyor len 3200 along u (screen ≈ −1310,+460 → +1310,−460)
const lineY = (x) => Math.round(-0.35 * x);              // screen Y of the belt line at local x
export const BOARDS_C = [-1100, -660, -220, 220, 660, 1100].map((x) => c(x, lineY(x) - 120)); // E01 signBoard plate ×6 "生成""存储""使用""备份""轮换""销毁"
//   生成站 (seg3 L2–L10)
export const PRNG_C = c(-1250, 560);                     // E02 prngCounter window "32 位"
export const GPU_C = c(-1000, 640, { scale: 0.8 });      // E02 gpuRig "GPU 反推" 0.8 (wrap!)
export const ADDR_C = c(-780, 520);                      // E02 addrPlate text "靶号地址"
export const VAULT_C = c(-760, 900, { scale: 0.6 });     // kit safe "金库" 0.6 (wrap!)
export const ADMIN_C = c(-590, 880, { scale: 0.8 });     // E05 keycard "管理员" 0.8, beside the vault's card slot
//   存储站 (seg3 L11–L15)
export const PHONE_C = c(-460, 420);                     // kit phone "Slope 钱包" (original size)
export const DB_C = c(-120, 330);                        // kit dbLedger tag "日志服务器" (original size)
//   发布站 (seg3 L16–L20)
export const WIN_C = c(250, 180, { scale: 0.6 });        // kit browserWin "Chrome 商店" 0.6 (wrap!)
export const APIKEY_C = c(470, 250, { scale: 0.8 });     // E05 keycard "API Key" attacker 0.8
export const LETTER_C = c(560, 180, { z: 0 });           // E01 letter "v2.68" red
//   备份站 (seg3 L21–L27)
export const RACKS_C = [c(840, 0), c(1010, -60), c(1180, -120)].map((q) => ({ ...q, scale: 0.7 })); // kit rack ×3 "MPC 节点" 0.7 (wrap!)
export const CEO_C = c(1200, 200, { scale: 0.6 });       // kit person signer "CEO" 0.6
export const CLOUD_C = c(700, -400);                     // red dashed box "CEO 个人云账户" (native SVG) around racks + CEO, EXT.cloudC
//   dot matrices (native SVG)
export const DOTS_GEN = c(-1300, 720);                   // L8 16 dots (1 dot ≈ 1000 万美元), EXT.dotsC16
export const DOTS_STORE = c(-300, 470);                  // L13 4 dots (1 dot ≈ 100 万美元), EXT.dotsC4
export const DOTS_REL = c(250, 300);                     // L18 9 dots (1 dot ≈ 100 万美元), EXT.dotsC9
export const DOTS_BACK = c(780, 300);                    // L22 13 dots (1 dot ≈ 1000 万美元), EXT.dotsC13
export const CPIPE = { log: route(PHONE_C, DB_C, 60, [60, 0], [-70, 0]) }; // E01 pipe phone → log server

// ---- D 中偏右·签名台 (seg4 全段; seg6 L12): right next to A
const d = zone(2400, 0);
//   签名界面 vs 实际交易 (seg4 L2–L10)
export const UIWIN_D = d(-500, -60, { scale: 0.6 });     // kit browserWin "签名界面" 0.6 (wrap!) — what the signers see
export const CHEQUE_UI = d(-500, 120);                   // E09 cheque green "转账" (under the window)
export const SEAL_D = d(-150, -40);                      // kit seal — what actually gets signed
export const CHEQUE_REAL = d(-150, 190);                 // E09 cheque red "合约升级" (red dashed "≠" to CHEQUE_UI)
export const VEND_D = d(150, -60);                       // E01 miniVend kind attacker "恶意合约" (original size)
//   核对流程 (seg4 L11–L17)
export const FUNNEL_D = d(450, -40);                     // E03 hashFunnel inputs ["to","data"], output "交易哈希" (original size)
export const HW_D = d(500, 180, { scale: 1.6 });         // kit hwWallet 1.6 (wrap!) screen "0x3fa…" → readable fields
export const MAG_D = d(780, 120);                        // kit magnifier "独立解码"
export const LAPTOP_D = d(850, -250);                    // kit laptop "自己的设备" (original size)
export const CLOCK_D = d(1100, -120);                    // kit clock "提前 8 天"
export const PHONE_D = d(1100, 120);                     // kit phone "电话确认" (original size)
//   三个工位 (seg4 L18–L19)
export const DESKS_D = [d(-300, 560), d(150, 600), d(600, 640)]; // kit desk ×3 (original size)
export const SIGNERS_D = DESKS_D.map((q, i) => d([-110, 340, 790][i], [580, 620, 660][i], { scale: 0.55 })); // kit person signer ×3 0.55, right of each desk
export const SRC_D = [d(1050, 480), d(1350, 560)];       // E01 signBoard plate ×2 "WazirX 称" "Liminal 称" (side-by-side sources)

// ---- E 最右·交易所三层钱包 (seg5 全段; seg6 L0–L8, L14): anchor = warm safe
const e = zone(5300, 0);
export const COLD_E = e(-600, -150);                     // kit safe gold "冷钱包" (original size)
export const WARM_E = e(0, -150);                        // kit safe default "温钱包" (original size)
export const TLOCK_E = e(260, -60, { scale: 0.6 });      // E01 timeLock "时间窗口" 0.6 (wrap!)
export const HOT_E = e(600, -150);                       // kit safe variant "hot" "热钱包" (original size)
export const METER_E = e(850, -150, { scale: 0.8 });     // E05 thresholdMeter "水位" max 10, level low, 0.8 (wrap!)
export const TOLL_E = [e(-300, -40), e(380, -30)];       // E07 tollClip ×2 "限额" (original size), clamp on the two pipes
export const EPIPE = {                                   // E01 pipe routes (world units): cold → warm → hot
  coldWarm: route(COLD_E, WARM_E, 60, [120, 0], [-120, 0]),
  warmHot: route(WARM_E, HOT_E, 60, [120, 0], [-90, 0]),
};
export const RACK_E = e(380, 350);                       // kit rack tag "签名服务器" (original size; attacker from seg5 L10)
export const SHIELD_E = e(570, 330);                     // kit shield "风控引擎" — between the signing server and the HSM
export const HSM_E = e(780, 200);                        // kit hsm (original size), beside the hot wallet
export const SEAL_E = e(1040, 250);                      // kit seal (HSM 落章)
export const DOC_E = e(150, 330);                        // kit doc standing title "提现单"
export const LEDGER_E = e(-200, 350, { scale: 0.8 });    // kit ledgerBook "审批记录" 0.8
export const USERS_E = [e(-750, 250), e(-650, 300), e(-550, 350)].map((q) => ({ ...q, scale: 0.5 })); // kit person ×3 0.5 users (E01 letter 提币)
export const ROLES_E = e(1400, -100);                    // E05 roleBoard title "今天做一件事" (original size)

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 (visible geometry; contact shadows / glow
// and hidden layers excluded; values reused from earlier episodes' measurements where available). [x0, y0, x1, y1]; y0 includes signs / heads.
// conveyor is given for len 3200 (its bbox is the whole diagonal belt, so it is not used for overlap checks).
export const EXT = {
  safe: [-180, -376, 181, 82], safeHot: [-117, -250, 117, 52], thresholdMeter: [-52, -290, 92, 26], signPlate: [-218, -270, 191, 79],
  signPlate2: [-113, -233, 86, 42], signPlate5: [-146, -245, 119, 54], person: [-50, -208, 50, 7], personAtk: [-50, -229, 50, 7],
  hwWallet: [-73, -62, 90, 33], key: [-75, -35, 84, 31], browserWin: [-201, -332, 201, 81], vitrine: [-111, -212, 112, 53],
  phone: [-70, -195, 58, 27], laptop: [-164, -234, 141, 66], padlock: [-56, -138, 62, 28], puzzleSet: [-200, -85, 286, 129],
  hsm: [-97, -119, 97, 44], seal: [-146, -142, 147, 69], mnemonicPlate: [-110, -215, 110, 50], comboDial: [-181, -390, 160, 60],
  conveyor: [-1352, -620, 1352, 510], prngCounter: [-85, -140, 110, 40], gpuRig: [-143, -349, 143, 56], addrPlate: [-56, -174, 57, 10],
  keycard: [-28, -85, 26, 9], dbLedger: [-80, -200, 80, 45], letter: [-28, -56, 26, 0], rack: [-113, -349, 113, 51],
  cheque: [-75, -124, 74, 24], miniVend: [-72, -220, 72, 31], hashFunnel: [-111, -294, 111, 54], magnifier: [-58, -260, 120, -105],
  clock: [-76, -193, 61, 2], desk: [-147, -272, 147, 74], timeLock: [-64, -182, 64, 27], tollClip: [-32, -155, 44, 15],
  shield: [-68, -218, 64, 28], docStanding: [-84, -261, 82, 23], ledgerBook: [-158, -97, 158, 74], roleBoard: [-194, -334, 187, 72],
  dotsA: [0, 0, 260, 100], dotsC16: [0, 0, 300, 100], dotsC4: [0, 0, 200, 80], dotsC9: [0, 0, 200, 80], dotsC13: [0, 0, 300, 100],
  cloudC: [0, 0, 620, 660],
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
export const GROUPS = {
  walletsA: null, rolesE: null,
  vaultA: [rect(SAFE_A, "safe"), rect(METER_A, "thresholdMeter"), rect(BOARD_A, "signPlate"), rect(DOTS_A, "dotsA")],
  signersA: [...SIGNERS_A.map((q) => rect(q, "person")), ...KEYS_A.map((q) => rect(q, "key")), ...WALLETS_A.map((q) => rect(q, "hwWallet")), rect(UIWIN_A, "browserWin")],
  softB: [rect(VIT[0], "vitrine"), rect(VIT[1], "vitrine"), rect(LAPTOP_B, "laptop"), rect(MNEMO_B, "mnemonicPlate"), rect(DIAL_B, "comboDial")],
  multiB: [rect(VIT[2], "vitrine"), rect(VIT[3], "vitrine"), rect(PUZZLE_B, "puzzleSet")],
  hsmB: [rect(VIT[3], "vitrine"), rect(VIT[4], "vitrine"), rect(SEAL_B, "seal"), rect(BOARD_B, "signPlate")],
  keyB: [...KEYS_B.map((q) => rect(q, "key")), rect(VIT[2], "vitrine"), rect(DIAL_B, "comboDial")],
  genC: [rect(PRNG_C, "prngCounter"), rect(GPU_C, "gpuRig"), rect(ADDR_C, "addrPlate"), rect(VAULT_C, "safe"), rect(ADMIN_C, "keycard"),
    rect(DOTS_GEN, "dotsC16"), rect(BOARDS_C[0], "signPlate2")],
  storeC: [rect(PHONE_C, "phone"), rect(DB_C, "dbLedger"), rect(DOTS_STORE, "dotsC4"), rect(BOARDS_C[1], "signPlate2")],
  releaseC: [rect(WIN_C, "browserWin"), rect(APIKEY_C, "keycard"), rect(LETTER_C, "letter"), rect(DOTS_REL, "dotsC9"), rect(BOARDS_C[2], "signPlate2"), rect(BOARDS_C[3], "signPlate2")],
  backupC: [...RACKS_C.map((q) => rect(q, "rack")), rect(CEO_C, "person"), rect(CLOUD_C, "cloudC"), rect(DOTS_BACK, "dotsC13"), rect(BOARDS_C[4], "signPlate2")],
  uiD: [rect(UIWIN_D, "browserWin"), rect(CHEQUE_UI, "cheque"), rect(SEAL_D, "seal"), rect(CHEQUE_REAL, "cheque"), rect(VEND_D, "miniVend")],
  checkD: [rect(FUNNEL_D, "hashFunnel"), rect(HW_D, "hwWallet"), rect(MAG_D, "magnifier"), rect(LAPTOP_D, "laptop"), rect(CLOCK_D, "clock"), rect(PHONE_D, "phone")],
  desksD: [...DESKS_D.map((q) => rect(q, "desk")), ...SIGNERS_D.map((q) => rect(q, "person")), ...SRC_D.map((q) => rect(q, "signPlate5"))],
  tiersE: [rect(COLD_E, "safe"), rect(WARM_E, "safe"), rect(TLOCK_E, "timeLock"), rect(HOT_E, "safeHot"), rect(METER_E, "thresholdMeter"),
    ...TOLL_E.map((q) => rect(q, "tollClip")), ...USERS_E.map((q) => rect(q, "person"))],
  hsmE: [rect(RACK_E, "rack"), rect(SHIELD_E, "shield"), rect(HSM_E, "hsm"), rect(SEAL_E, "seal"), rect(HOT_E, "safeHot")],
  flowE: [rect(DOC_E, "docStanding"), rect(LEDGER_E, "ledgerBook"), rect(RACK_E, "rack"), rect(SHIELD_E, "shield"), rect(HSM_E, "hsm"), rect(SEAL_E, "seal")],
};
const R = GROUPS;
GROUPS.walletsA = [...WALLETS_A.map((q) => rect(q, "hwWallet")), ...SIGNERS_A.map((q) => rect(q, "person"))];
GROUPS.rolesE = [rect(ROLES_E, "roleBoard"), rect(METER_E, "thresholdMeter"), rect(HOT_E, "safeHot")];
// key objects per zone (the rects each framing must hold; the conveyor's diagonal bbox is left out)
export const ZONE_RECTS = {
  A: [...R.vaultA, ...R.signersA, rect(ATK_A, "personAtk")],
  B: [...VIT.map((q) => rect(q, "vitrine")), rect(LAPTOP_B, "laptop"), rect(PUZZLE_B, "puzzleSet"), rect(SEAL_B, "seal"), rect(MNEMO_B, "mnemonicPlate"),
    rect(DIAL_B, "comboDial"), ...KEYS_B.map((q) => rect(q, "key")), rect(BOARD_B, "signPlate")],
  C: [...R.genC, ...R.storeC, ...R.releaseC, ...R.backupC, ...BOARDS_C.map((q) => rect(q, "signPlate2"))],
  D: [...R.uiD, ...R.checkD, ...R.desksD],
  E: [...R.tiersE, rect(RACK_E, "rack"), rect(SHIELD_E, "shield"), rect(HSM_E, "hsm"), rect(SEAL_E, "seal"), rect(DOC_E, "docStanding"),
    rect(LEDGER_E, "ledgerBook"), rect(ROLES_E, "roleBoard")],
};
const Z = ZONE_RECTS;
const SAFE = [100, 280, 1820, 860];                      // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for code cards / question cards at the sides
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur). Screen bboxes: run the layout check (k and union bbox noted per key).
export const CAMS = {
  // 全景：钥匙街五个区（seg6 L13–L14 → 结束卡）
  wide: fit([...Z.B, ...Z.C, ...Z.A, ...Z.D, ...Z.E], [90, 200, 1830, 860], 1),
  // A 冷钱包金库中景：金库 + 门槛表 + 六个签名人（区全景）
  A: fit(Z.A, SAFE, 1.4),
  // 近景：金库 + 门槛表 + 牌子 + 点阵（seg1 起点 L0–L2；seg4 L0–L1；seg6 L9–L12）
  vaultA: fit(R.vaultA, MID, 1.4),
  // A 六个签名人 + 钥匙 + 硬件钱包 + 签名界面（seg1 L3–L7）
  signersA: fit(R.signersA, SAFE, 1.4),
  // A 六台硬件钱包特写，右上留题卡位（seg1 L8–L11 终点；seg2 起点前）
  walletsA: fit(R.walletsA, [100, 380, 1500, 860], 1.4),
  // B 五个展柜全景（seg2 L0–L4）
  schemesB: fit(Z.B, SAFE, 1.4),
  B: fit(Z.B, SAFE, 1.4),
  // B 软件钱包 + 硬件钱包展柜 + 助记词板 + 密码转盘（seg2 L5–L8；seg6 L5–L8）
  softB: fit(R.softB, MID, 1.4),
  // B 多签 + MPC 展柜 + 拼图（seg2 L9–L12）
  multiB: fit(R.multiB, MID, 1.4),
  // B HSM 展柜 + 盲签表头（seg2 L13–L17）
  hsmB: fit(R.hsmB, MID, 1.4),
  // B 比喻钥匙（原钥匙 + 红钥匙）+ 多签展柜（seg2 L18–L24 终点；seg3 起点前）
  keyB: fit(R.keyB, MID, 1.4),
  // C 流水线全景（seg3 L0–L1）
  lineC: fit(Z.C, SAFE, 1.4),
  C: fit(Z.C, SAFE, 1.4),
  // C 生成站（seg3 L2–L10）
  genC: fit(R.genC, MID, 1.4),
  // C 存储站（seg3 L11–L15）
  storeC: fit(R.storeC, MID, 1.4),
  // C 发布站（seg3 L16–L20）
  releaseC: fit(R.releaseC, MID, 1.4),
  // C 备份站：MPC 节点 + 云账户框 + CEO（seg3 L21–L27 终点）
  backupC: fit(R.backupC, MID, 1.4),
  // D 签名台全景
  D: fit(Z.D, SAFE, 1.4),
  // D 签名界面 vs 实际交易 + 恶意合约（seg4 L2–L10）
  uiD: fit(R.uiD, MID, 1.4),
  // D 哈希漏斗 + 大号硬件钱包 + 放大镜 + 自己的设备 / 时钟 / 电话（seg4 L11–L17）
  checkD: fit(R.checkD, MID, 1.4),
  // D 三个工位 + 两块来源牌（seg4 L18–L19 终点；seg5 起点前）
  desksD: fit(R.desksD, SAFE, 1.4),
  // E 三层全景：冷 / 温 / 热 + 水位 + 限额 + 用户（seg5 L0–L7）
  tiersE: fit(R.tiersE, SAFE, 1.4),
  E: fit(Z.E, SAFE, 1.4),
  // E HSM + 签名服务器 + 风控盾牌 + 热钱包（seg5 L8–L15）
  hsmE: fit(R.hsmE, MID, 1.4),
  // E 提现单 + 审批记录 + 风控链（seg5 L16–L20 终点）
  flowE: fit(R.flowE, MID, 1.4),
  // E 角色板（seg6 L0–L4）
  rolesE: fit(R.rolesE, MID, 1.4),
};
CAMS.world = CAMS.wide;                                  // alias
export const world = CAMS.world;
