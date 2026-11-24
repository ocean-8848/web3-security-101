// ep23「一座交易所机场」shared world layout — one continuous isometric world, fixed for all six segments:
//   import * as L from "../../shared/layout.mjs";   (from ep23/segN/src/build-story.mjs)
//   A 入境口·充值: SIGN_A, CHAIN, MAG, ADDR_A, SCALE, ODD_A, RETURN_TAG, DOC_OMNI, CKPT_A, FINALITY, RPC
//   B 金库区: SIGN_B, COLD, WARM, METER, HOT, HOT_ETH, KNIFE, TOLL, ADDR_B, TAG_B, MINIVEND, BEACON, CLOCK, DOTS_B, LETTER_OUT
//   C 签名间: SIGN_C, LEDGER, SHIELD, RACK, HSM, CONTAINER, WD_DOC, DESKS, ENGINEERS, KEYCARD, AI_C, ATK_C, EVENT_C, DOTS_C, DEF_C
//   D 合规检查站: SIGN_D, OPS_D, ATK_D, CKPT_D, GAUGE, PASSPORT, TELLER, PLATES_D, COINS_D, LOCKS_D, NATIVE_D, DOTS_FRZ,
//                BALANCE, PLEA_D, DOTS_PLEA, USER_D, WD_D, SEAL, REVIEW_D
//   E 用户柜台: SIGN_E, USER_E, PHONE, MANUAL, TIMELOCK, WL_DOC
//   path: ROAD · framing: EXT, rect, fit, ZONE_RECTS, CAMS, world
// Positions only; ids, states, labels and per-shot opts stay in each segment. Object ids must never be `cam` or `root`.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Every position is written as a zone-local screen offset: the world point whose ground lands on world-canvas px (anchor + (X, Y))
// (iso.G, rounded) — so the numbers read as on-screen ground offsets at camera scale 1. `scale` = the opts.scale to pass to the object.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): of the objects used here only kit person, E01 miniVend, E03 gasGauge, E04 tellerCounter,
//   E05 keycard, E07 oddCoin / scale / returnTag / tollClip, E13 passport / container, E15 delegateTag, E16 finalitySignal take
//   opts.scale. Everything else IGNORES it. Where an object carries `scale` + `wrap: true` below (A chain 0.7, addrPlate 0.6, rpc 0.8,
//   checkpoint 0.6; B warm safe 0.8, hot safes 0.65, thresholdMeter 0.7, knifeSwitch 0.5; C dbLedger / shield / rack 0.8, hsm 0.7,
//   desk 0.65; D checkpoint 0.75, padlock 0.6, balance 0.7, plea docs 0.5, withdraw doc 0.5, seal 0.6; E phone 0.8, manual 0.6,
//   timeLock 0.7, whitelist doc 0.8) the segment MUST put it with the wrap helper (translate · scale · translate around its ground
//   point) and rescale its anchors; rect() / CAMS already assume the scaled size.
// TAG_B = { o, opts } from ep15 delegateTagOn — hangs on ADDR_B's post (original-size plate):
//   put("tag", L.TAG_B.o, E15.delegateTag(L.TAG_B.o, { id: "tag", ...L.TAG_B.opts, … })); seg6 L4 close-up: delegateTagOn(L.ADDR_B, { scale: 1.2 }).
// LOCKS_D sit on COINS_D (same ground point, z lifts them onto the coin) — overlap on purpose, left out of the overlap check.
// kit doc has no size opts: flat doc is [-156,-85,156,82]; small docs below are `standing: true` and wrapped.
// signBoard plate takes size / w. Pipes (E01 pipe) are routed per segment from the anchors (pts relative to the start object).
// The slate path runs along +u (screen: up-right), zones left → right A · B · C · D · E, every zone anchor on v = 0.
// Native-SVG areas (dot matrices, event boards, defence plaques, review boxes) are a ground origin + a box kind in EXT.
import { Wp, G, camAt, CE } from "../../kit/iso.mjs";
import { delegateTagOn } from "../../ep15/kit-ext/objects-ext.mjs";

/** world ground point for world-canvas px (X, Y); extra fields (scale, z, wrap …) copied in */
const S = (X, Y, extra = {}) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
/** zone-local placer: positions below are written relative to the zone's anchor px */
const zone = (OX, OY) => (X, Y, extra) => S(OX + X, OY + Y, extra);
const road = (u) => Wp(u, 0);                            // zone anchor px on the path centre line
const ZU = { A: 0, B: 3300, C: 6000, D: 9000, E: 12100 };
export const ZONE_ANCHOR = Object.fromEntries(Object.entries(ZU).map(([k, u]) => [k, road(u).map(Math.round)]));

// ---- A 最左·入境口·充值 (seg2 L8、L11、L13、L17; seg3 全段 终点 checksA; seg4 起点; seg6 L2 链上剪影): anchor = scale
const a = zone(...ZONE_ANCHOR.A);
export const SIGN_A = a(-1000, -260);                            // E01 signBoard plate "入境口 · 充值"
export const CHAIN = a(-760, 0, { scale: 0.7, wrap: true });     // kit chain n 4 (wrap 0.7!)
export const MAG = a(-500, -40);                                 // kit magnifier "充值扫描" (original size), sweeps CHAIN
export const ADDR_A = [a(-560, 200), a(-440, 240), a(-320, 280)].map((q) => ({ ...q, scale: 0.6, wrap: true })); // E02 addrPlate "充值地址 1/2/3" (wrap 0.6!)
export const SCALE = a(-200, -40, { scale: 0.9 });               // E07 scale 0.9 "实际到账" 台秤
export const ODD_A = [a(-60, 160), a(30, 190)].map((q) => ({ ...q, scale: 0.7 })); // E07 oddCoin 0.7: 真币 / 假代币
export const RETURN_TAG = a(-180, 180, { scale: 0.7 });          // E07 returnTag 0.7 (ok / false)
export const DOC_OMNI = a(60, -60);                              // kit doc standing "Omni-USDT 交易" (original size), line "valid = false"
export const CKPT_A = [a(360, 0), a(680, 0), a(1000, 0), a(1320, 0)].map((q) => ({ ...q, scale: 0.6, wrap: true })); // kit checkpoint ①–④ (wrap 0.6!)
export const FINALITY = a(1540, 140, { scale: 0.7 });            // E16 finalitySignal 0.7, beside ④
export const RPC = [a(700, 320), a(1100, 320)].map((q) => ({ ...q, scale: 0.8, wrap: true })); // kit rpc "节点 1" / "节点 2" (wrap 0.8!)

// ---- B 中左·金库区 (seg1 全段 起点 hotB / 终点 delegB; seg2 起点、L12–L15; seg4 L15–L16; seg6 L0–L9): anchor = hot wallets
const b = zone(...ZONE_ANCHOR.B);
export const SIGN_B = b(-1100, -300);                            // E01 signBoard plate "金库 · 冷钱包"
export const COLD = b(-760, -20);                                // kit safe plate "冷钱包" gold (original size)
export const WARM = b(-420, 0, { scale: 0.8, wrap: true });      // kit safe plate "温钱包" (wrap 0.8!)
export const METER = b(-520, 280, { scale: 0.7, wrap: true });   // E05 thresholdMeter "水位" (wrap 0.7!)
export const HOT = [b(-100, 40), b(140, 90), b(380, 140)].map((q) => ({ ...q, scale: 0.65, wrap: true })); // kit safe variant hot "XRP / BTC / ETH 热钱包" (wrap 0.65!)
export const HOT_ETH = HOT[2];                                   // 主角
export const KNIFE = [b(-100, 300), b(140, 350), b(380, 400)].map((q) => ({ ...q, scale: 0.5, wrap: true })); // kit knifeSwitch "分链熔断" ×3, in front of each hot wallet (wrap 0.5!)
export const TOLL = b(560, 100, { scale: 0.8 });                 // E07 tollClip 0.8 "暂停提现", on the hot wallets' exit pipe
export const ADDR_B = b(720, 220);                               // E02 addrPlate text "热钱包地址" (original size)
export const TAG_B = delegateTagOn(ADDR_B);                      // E15 delegateTag (prefix "0xef0100", target "攻击者合约")
export const MINIVEND = b(900, -60, { scale: 0.6 });             // E01 miniVend kind attacker 0.6 "攻击者合约" (right-back)
export const BEACON = b(100, -300);                              // kit beacon (original size)
export const CLOCK = b(-180, -260);                              // kit clock (original size) "23:56 UTC" / "00:10 UTC"
export const DOTS_B = b(300, -520);                              // seg1 L6 dot matrix 63 (9 × 7), EXT.dotsB
export const LETTER_OUT = b(1300, -260);                         // E01 letter fly-out target (off to the right, outside hotB)

// ---- C 中间·签名间 (seg2 L16–L24; seg4 全段 终点 signC; seg5 起点; seg6 L10): anchor = signing rack
const c = zone(...ZONE_ANCHOR.C);
export const SIGN_C = c(-1100, -300);                            // E01 signBoard plate "登机口 · 提币"
export const LEDGER = c(-560, -40, { scale: 0.8, wrap: true });  // kit dbLedger tag "内部账本" (wrap 0.8!)
export const SHIELD = c(-300, -60, { scale: 0.8, wrap: true });  // kit shield "风控引擎" (wrap 0.8!)
export const RACK = c(0, -60, { scale: 0.8, wrap: true });       // kit rack tag "签名服务" (wrap 0.8!)
export const HSM = c(240, 40, { scale: 0.7, wrap: true });       // kit hsm (wrap 0.7!)
export const CONTAINER = c(200, -140, { scale: 0.5 });           // E13 container 0.5 "容器" (appears beside the rack, seg4 L13)
export const WD_DOC = c(-400, 260, { scale: 0.5, wrap: true });  // kit doc standing "提现单" (wrap 0.5!), travels ledger → shield → rack
export const DESKS = [c(-700, 420), c(-400, 480), c(-100, 540)].map((q) => ({ ...q, scale: 0.65, wrap: true })); // kit desk 工位 1/2/3 (wrap 0.65!)
export const ENGINEERS = [c(-560, 460), c(-260, 520), c(40, 580)].map((q) => ({ ...q, scale: 0.5 })); // kit person engineer 0.5 "工程师 1/2/3"
export const KEYCARD = c(-760, 520, { scale: 0.6 });             // E05 keycard role "部署令牌" 0.6, in front of desk 1
export const AI_C = c(-230, 330);                                // native small screen "AI 工具" (seg4 L11), EXT.aiC
export const ATK_C = c(-920, 140, { scale: 0.55 });              // kit person attacker 0.55 (C 区左后)
export const EVENT_C = c(360, -260);                             // seg4 L3–L6 Bitget event board + "第三方安全产品" box (native SVG), EXT.eventC
export const DOTS_C = c(360, -200);                              // seg4 L3 dot matrix 39, EXT.dotsC
export const DEF_C = c(-700, -380);                              // seg4 L20–L23 three defence plaques (native SVG), EXT.defC

// ---- D 中右·合规检查站 (seg2 L3、L5、L9; seg5 全段 终点 freezeD; seg6 起点、L15): anchor = lane of four checkpoints
const d = zone(...ZONE_ANCHOR.D);
export const SIGN_D = d(-1500, -260);                            // E01 signBoard plate "安检 · 边检"
export const OPS_D = d(-1250, -300);                             // seg5 L5 red "操作钱包" box (native SVG), EXT.opsD
export const ATK_D = [d(-1340, 40), d(-1220, 150), d(-1100, 260)].map((q) => ({ ...q, scale: 0.5 })); // kit person attacker 0.5: 盗款者 / 名单上的人 / 洗钱者
export const CKPT_D = [d(-880, 0), d(-480, 0), d(-80, 0), d(320, 0)].map((q) => ({ ...q, scale: 0.75, wrap: true })); // kit checkpoint ①–④ (wrap 0.75!)
export const GAUGE = d(-440, 300, { scale: 0.7 });               // E03 gasGauge label "风险" 0.7, beside ②
export const PASSPORT = d(-40, 220, { scale: 0.55 });            // E13 passport 0.55 "发起人 / 受益人", beside ③
export const TELLER = d(760, 20, { scale: 0.6 });                // E04 tellerCounter 0.6 "另一家服务商"
export const PLATES_D = [d(200, 360), d(520, 360)];              // E01 signBoard plate "FATF · 1000 美元 / 欧元" / "欧盟 · 服务商之间 · 不设门槛"
export const COINS_D = [d(1060, 100), d(1180, 150)].map((q) => ({ ...q, scale: 0.6 })); // E07 oddCoin 0.6: USDT / USDC
export const LOCKS_D = COINS_D.map((q) => ({ u: q.u, v: q.v, z: 30, scale: 0.6, wrap: true })); // kit padlock "Tether 冻结" / "Circle 冻结" (wrap 0.6!), on the coins
export const NATIVE_D = [d(1080, 300), d(1200, 340)].map((q) => ({ ...q, scale: 0.6 })); // E07 oddCoin 0.6: BTC / XRP (native, no lock)
export const DOTS_FRZ = d(960, -420);                            // seg5 L16 two-row dot matrix (97 + 82), EXT.dotsFrz
export const BALANCE = d(1460, -40, { scale: 0.7, wrap: true }); // E01 balance "代价" (wrap 0.7!)
export const PLEA_D = [d(1420, 200), d(1560, 240)].map((q) => ({ ...q, scale: 0.5, wrap: true })); // kit doc standing "认罪协议" Binance / KuCoin · OKX (wrap 0.5!)
export const DOTS_PLEA = d(1340, -420);                          // seg5 L19 dot matrix 43, EXT.dotsPlea
export const USER_D = d(1780, 140, { scale: 0.5 });              // kit person signer 0.5 普通用户
export const WD_D = d(1700, 320, { scale: 0.5, wrap: true });    // kit doc standing "提现单" (wrap 0.5!) of the normal user
export const SEAL = d(1840, 330, { scale: 0.6, wrap: true });    // kit seal markText "冻结" (wrap 0.6!), stamps onto WD_D in seg5 L21
export const REVIEW_D = d(1640, 470);                            // seg5 L21 "人工复核" / "申诉" boxes (native SVG), EXT.reviewD

// ---- E 最右·用户柜台 (seg6 L11–L14): anchor = phone
const e = zone(...ZONE_ANCHOR.E);
export const SIGN_E = e(-500, -260);                             // E01 signBoard plate "用户柜台"
export const USER_E = e(-380, 120, { scale: 0.55 });             // kit person signer 0.55 "用户"
export const PHONE = e(-160, -20, { scale: 0.8, wrap: true });   // kit phone screen "官方 App" (wrap 0.8!)
export const MANUAL = e(140, 160, { scale: 0.6, wrap: true });   // E03 manual title "地址簿" (wrap 0.6!)
export const TIMELOCK = e(300, -40, { scale: 0.7, wrap: true }); // E01 timeLock "新地址冷却期" (wrap 0.7!)
export const WL_DOC = e(-60, 280, { scale: 0.8, wrap: true });   // kit doc standing "提币白名单" (wrap 0.8!)

// ---- path: light slate strip along +u through A → E (native SVG, draw under everything)
export const ROAD = { u0: -1600, u1: 13000, v0: -110, v1: 110 };

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 (measured from the rendered SVGs in
// earlier episodes: visible geometry only). [x0, y0, x1, y1]; y0 includes signs / heads. Native-SVG boxes are from their ground origin.
export const EXT = {
  signPlate: [-136, -242, 109, 50], chain: [-217, -173, 217, 86], magnifier: [-58, -260, 120, -105], addrPlate: [-56, -174, 57, 10],
  scale: [-93, -214, 93, 44], oddCoin: [-39, -109, 39, 18], returnTag: [-30, -62, 29, 7], docStanding: [-84, -261, 82, 23],
  doc: [-156, -85, 156, 82], checkpoint: [-213, -305, 284, 143], finalitySignal: [-28, -196, 80, 14], rpc: [-77, -258, 78, 38],
  safe: [-180, -376, 181, 82], safeHot: [-117, -250, 117, 52], thresholdMeter: [-52, -290, 71, 26], knifeSwitch: [-153, -344, 133, 48],
  tollClip: [-32, -155, 44, 15], delegateTag: [-25, -73, 25, -5], miniVend: [-72, -197, 72, 31], beacon: [-61, -118, 61, 30],
  clock: [-76, -193, 61, 2], letter: [-28, -56, 26, 0],
  dbLedger: [-76, -159, 76, 37], shield: [-68, -218, 64, 28], rack: [-113, -349, 113, 51], hsm: [-97, -119, 97, 44],
  container: [-108, -129, 108, 47], desk: [-147, -272, 147, 74], person: [-50, -208, 50, 7], personAtk: [-50, -229, 50, 7],
  keycard: [-28, -85, 26, 9], gasGauge: [-96, -256, 84, 32], passport: [-29, -76, 29, 12], tellerCounter: [-228, -343, 241, 92],
  padlock: [-56, -138, 62, 28], balance: [-163, -258, 163, 40], seal: [-146, -142, 147, 69], phone: [-70, -195, 58, 27],
  manual: [-137, -94, 132, 64], timeLock: [-64, -182, 64, 27],
  dotsB: [0, 0, 220, 160], aiC: [-60, -60, 60, 0], eventC: [0, -200, 440, 0], dotsC: [0, 0, 280, 90], defC: [0, -90, 520, 0],
  opsD: [-70, -70, 70, 0], dotsFrz: [0, 0, 300, 150], dotsPlea: [0, 0, 220, 110], reviewD: [0, -60, 260, 0],
};
// rect(o, kind, scale) → world-canvas bbox [x0, y0, x1, y1] of that object standing at o (o.z lifts it)
export const rect = (o, kind, scale = o.scale ?? 1) => {
  const [X, Y0] = Wp(o.u, o.v), Y = Y0 - (o.z ?? 0) * CE * scale, q = EXT[kind];
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
const R = {
  signA: rect(SIGN_A, "signPlate"), chain: rect(CHAIN, "chain"), mag: rect(MAG, "magnifier"), addrA: ADDR_A.map((q) => rect(q, "addrPlate")),
  scale: rect(SCALE, "scale"), oddA: ODD_A.map((q) => rect(q, "oddCoin")), ret: rect(RETURN_TAG, "returnTag"), omni: rect(DOC_OMNI, "docStanding"),
  ckA: CKPT_A.map((q) => rect(q, "checkpoint")), fin: rect(FINALITY, "finalitySignal"), rpc: RPC.map((q) => rect(q, "rpc")),
  signB: rect(SIGN_B, "signPlate"), cold: rect(COLD, "safe"), warm: rect(WARM, "safe"), meter: rect(METER, "thresholdMeter"),
  hot: HOT.map((q) => rect(q, "safeHot")), knife: KNIFE.map((q) => rect(q, "knifeSwitch")), toll: rect(TOLL, "tollClip"),
  addrB: rect(ADDR_B, "addrPlate"), vend: rect(MINIVEND, "miniVend"), beacon: rect(BEACON, "beacon"), clock: rect(CLOCK, "clock"), dotsB: rect(DOTS_B, "dotsB"),
  signC: rect(SIGN_C, "signPlate"), ledger: rect(LEDGER, "dbLedger"), shield: rect(SHIELD, "shield"), rack: rect(RACK, "rack"), hsm: rect(HSM, "hsm"),
  container: rect(CONTAINER, "container"), wdC: rect(WD_DOC, "docStanding"), desks: DESKS.map((q) => rect(q, "desk")),
  engs: ENGINEERS.map((q) => rect(q, "person")), keycard: rect(KEYCARD, "keycard"), ai: rect(AI_C, "aiC"), atkC: rect(ATK_C, "personAtk"),
  eventC: rect(EVENT_C, "eventC"), dotsC: rect(DOTS_C, "dotsC"), defC: rect(DEF_C, "defC"),
  signD: rect(SIGN_D, "signPlate"), ops: rect(OPS_D, "opsD"), atkD: ATK_D.map((q) => rect(q, "personAtk")), ckD: CKPT_D.map((q) => rect(q, "checkpoint")),
  gauge: rect(GAUGE, "gasGauge"), passport: rect(PASSPORT, "passport"), teller: rect(TELLER, "tellerCounter"), platesD: PLATES_D.map((q) => rect(q, "signPlate")),
  coins: COINS_D.map((q) => rect(q, "oddCoin")), locks: LOCKS_D.map((q) => rect(q, "padlock")), native: NATIVE_D.map((q) => rect(q, "oddCoin")),
  dotsFrz: rect(DOTS_FRZ, "dotsFrz"), balance: rect(BALANCE, "balance"), plea: PLEA_D.map((q) => rect(q, "docStanding")), dotsPlea: rect(DOTS_PLEA, "dotsPlea"),
  userD: rect(USER_D, "person"), wdD: rect(WD_D, "docStanding"), seal: rect(SEAL, "seal"), review: rect(REVIEW_D, "reviewD"),
  signE: rect(SIGN_E, "signPlate"), userE: rect(USER_E, "person"), phone: rect(PHONE, "phone"), manual: rect(MANUAL, "manual"),
  tlock: rect(TIMELOCK, "timeLock"), wl: rect(WL_DOC, "docStanding"),
};
// (LOCKS_D overlay COINS_D on purpose and are not in ZONE_RECTS)
export const ZONE_RECTS = {
  A: [R.signA, R.chain, R.mag, ...R.addrA, R.scale, ...R.oddA, R.ret, R.omni, ...R.ckA, R.fin, ...R.rpc],
  B: [R.signB, R.cold, R.warm, R.meter, ...R.hot, ...R.knife, R.toll, R.addrB, R.vend, R.beacon, R.clock, R.dotsB],
  C: [R.signC, R.ledger, R.shield, R.rack, R.hsm, R.container, R.wdC, ...R.desks, ...R.engs, R.keycard, R.ai, R.atkC, R.eventC, R.dotsC, R.defC],
  D: [R.signD, R.ops, ...R.atkD, ...R.ckD, R.gauge, R.passport, R.teller, ...R.platesD, ...R.coins, ...R.native, R.dotsFrz, R.balance,
    ...R.plea, R.dotsPlea, R.userD, R.wdD, R.seal, R.review],
  E: [R.signE, R.userE, R.phone, R.manual, R.tlock, R.wl],
};
const Z = ZONE_RECTS;
const SAFE_R = [100, 280, 1820, 860];                    // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for cards at the sides
const SIGNS = [R.signA, R.signB, R.signC, R.signD, R.signE];
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur).
export const CAMS = {
  // A 区块链 + 充值地址 ×3 + 扫描放大镜 + 台秤 + 真 / 假代币 + returnTag + Omni 交易（seg3 L0–L17）
  intakeA: fit([R.signA, R.chain, R.mag, ...R.addrA, R.scale, ...R.oddA, R.ret, R.omni], SAFE_R, 1.4),
  // A 四道入账检查 ①–④ + 确认数信号 + 两个节点 + 台秤（seg3 L18–L25 终点；seg4 起点）
  checksA: fit([R.scale, ...R.ckA, R.fin, ...R.rpc], SAFE_R, 1.4),
  // B 冷 / 温 / 热三层金库 + 水位表 + 管道（seg2 L12–L15）
  vaultB: fit([R.signB, R.cold, R.warm, R.meter, ...R.hot, ...R.knife], SAFE_R, 1.4),
  // B 三只热钱包 + 熔断闸刀 + 暂停闸 + 告警灯 + 时钟 + 点阵（seg1 起点 L0–L9；seg4 L16；seg6 L9）
  hotB: fit([...R.hot, ...R.knife, R.toll, R.addrB, R.beacon, R.clock, R.dotsB], SAFE_R, 1.4),
  // B ETH 热钱包 + 地址立柱 + 委托挂牌 + 攻击者合约，题卡在右侧（seg1 L10–L14 终点；seg2 起点；seg4 L15；seg6 L0–L6）
  delegB: fit([R.hot[2], R.knife[2], R.toll, R.addrB, R.vend], [240, 300, 1380, 860], 1.6),
  // C 账本 → 风控 → 签名服务 + HSM + 容器 + 提现单 + 三条防线牌（seg4 L0–L6、L20–L24 终点；seg5 起点；seg6 L10）
  signC: fit([R.ledger, R.shield, R.rack, R.hsm, R.container, R.wdC, R.defC, R.eventC, R.dotsC], SAFE_R, 1.4),
  // C 三个工位 + 工程师 + 部署令牌 + AI 工具 + 攻击者 + 签名服务 / 容器（seg4 L7–L14、L17–L19）
  devC: fit([...R.desks, ...R.engs, R.keycard, R.ai, R.atkC, R.rack, R.container, R.hsm], SAFE_R, 1.4),
  // D 四道合规关卡 + 风险表 + 护照 + 另一家服务商 + 三类攻击者 + 门槛牌（seg5 L0–L14）
  gateD: fit([R.signD, R.ops, ...R.atkD, ...R.ckD, R.gauge, R.passport, R.teller, ...R.platesD], SAFE_R, 1.4),
  // D 冻结锁 + 两行点阵 + 原生币 + 代价天平 + 认罪协议 + 误冻的普通用户（seg5 L15–L23 终点；seg6 起点）
  freezeD: fit([...R.coins, ...R.locks, ...R.native, R.dotsFrz, R.balance, ...R.plea, R.dotsPlea, R.userD, R.wdD, R.seal, R.review], SAFE_R, 1.4),
  // E 用户柜台：手机 + 地址簿 + 冷却期时间锁 + 提币白名单 + 用户（seg6 L11–L14）
  userE: fit(Z.E, MID, 1.4),
  // A 充值扫描 → C 签名服务 → 回到 B 热钱包的整条流水线（seg2 L16–L24 终点；seg3 起点）
  flowAC: fit([R.chain, R.mag, ...R.addrA, ...R.hot, R.toll, R.ledger, R.shield, R.rack, R.hsm, R.wdC], SAFE_R, 1.4),
  // A–D 中景，五块机场指示牌都在画内（seg2 L0–L11）
  airport: fit([...SIGNS, R.chain, R.cold, ...R.hot, R.rack, ...R.ckD], SAFE_R, 1.4),
  // 各区全景（pans pass through them）
  A: fit(Z.A, SAFE_R, 1.4),
  B: fit(Z.B, SAFE_R, 1.4),
  C: fit(Z.C, SAFE_R, 1.4),
  D: fit(Z.D, SAFE_R, 1.4),
  E: fit(Z.E, SAFE_R, 1.4),
  // 整座机场全景：A → E（seg6 L15–L16 结束卡）
  wide: fit([...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E], [60, 200, 1860, 860], 1),
};
// world: everything the segments need to size grid / box
export const world = { ZU, ZONE_ANCHOR, ROAD, rects: R };
