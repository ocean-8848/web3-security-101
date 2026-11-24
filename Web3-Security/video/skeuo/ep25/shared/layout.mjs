// ep25「一座追赃城」shared world layout — one continuous isometric world, fixed for all six segments:
//   import { ROAD, PIPE, HOTSAFE, HERO, ATK_A, PAUSE_A, TLOCK_A, METH, CMETH, SIGN_A, DOTS_A,
//            MINT, ADDR_B, LOCK_B, CLOCK_B, AMM, OUTCOIN, DOTS_B, DOC_TRO, DOC_LIFT, DOC_GENIUS, SEAL_B, T3, DOTS_LAW, SIGN_B,
//            BRIDGE, LOTTERY, STALL, COUNTER, CHECKS, RISKDOC, ADDR_C, COINS_C, ROBBER, HIGHWAY, PLATE_CAR, DOTS_C, SIGN_C,
//            CHAIN, ROTA, MSIG, KEYCARD, ENG_D, DOTS_D, SIGN_D, TOWER_D, ENVELOPE, BOUNTY, RTAG, DOTS_TALK,
//            BAL, BUCKET, KEY_D, LOCK_D, HOURGLASS, DOC_SEIZE, DOC_RETURN, DOTS_COURT,
//            DESKS, ENG_E, BEACON, CLOCK_E, PAUSE_E, LIST, LETTER0, RECIPS, DISPATCH, DOC_FULL,
//            SNAPCAM, RACK, DOC_REPORT, TOWER_E, SHIELD, MAGNIFIER, ROLEBOARD, DOC_TRACE, DOTS_E, SIGN_E,
//            USER, PHONE, NEWADDR, MNEMONIC, HWW, DOC_REC, DOC_RECEIPT, SCAMMER,
//            EXT, rect, fit, ZONE_RECTS, CAMS } from "../../shared/layout.mjs";
// (from ep25/segN/src/build-story.mjs). Positions only; ids, states, labels and per-shot opts stay in each segment.
// Object ids must never be `cam` or `root`.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Unlike ep11 (screen-px placer), positions here are written in WORLD units relative to each zone's anchor on the road:
//   z(du, dv) = { u: U0 + du, v: dv }. The stone road + red money pipe run straight along +u at v = 0 through all five zones,
//   so "behind the road" = negative dv (screen up-left), "in front of the road" = positive dv (screen down-right).
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): `scale` = the opts.scale to pass to the object. Only kit person, E05 keycard, E06 shareCert,
//   E07 oddCoin / returnTag / dispatchDesk, E04 tellerCounter, E08 ammPool / marketStall, E09 rotaWheel, E11 mintPress / snapshotCamera
//   take opts.scale. Everything else here that carries `scale` IGNORES it: the segment MUST put it with the wrap helper
//   (translate · scale · translate around its ground point) and rescale its anchors — marked "(wrap X!)" below; rect() / CAMS already
//   assume the scaled size. E01 pipe (r, pts), E01 signBoard (size, w), kit doc (w, h), kit envelope (w, h), E01 letter (w, h) are sized
//   by their own opts instead.
// Zones (left → right along the road, anchors U0 on v = 0):
//   A 被盗现场 U0 = 0 · B 发行方路口 U0 = 3200 (mint half du < 600, law corner du ≥ 700) · C 出城口 U0 = 6900 (highway leaves at du 1700)
//   · D 链上法庭 U0 = 11200 (chain du < 0, talk du 300..1000, court du ≥ 1200) · E 应急作战室与用户角 U0 = 15900 (war du < −250,
//   notify −250..1150, prep 1300..2600, user ≥ 2800).
// Native-SVG areas (dot matrices, the highway, the car plate) are given as a ground origin + a box kind in EXT.
import { Wp, camAt } from "../../kit/iso.mjs";

/** zone-local placer in world units: (du, dv) → { u: U0 + du, v: dv, ...extra } */
const zone = (U0) => (du, dv, extra = {}) => ({ u: U0 + du, v: dv, ...extra });

// ---------------------------------------------------------------- road + money pipe (whole world)
export const ROAD = { u0: -1400, u1: 20000, v0: -110, v1: 110 };   // stone road (native SVG), ground strip along +u
/** E01 pipe "资金管" (thin r, red flowColor), embedded in the road: put("pipe", PIPE.o, E1.pipe(PIPE.o, { id: "pipe", pts: PIPE.pts, r: 8 })) */
export const PIPE = { o: { u: 120, v: 0 }, pts: [[0, 0, 4], [19400, 0, 4]] };
/** pipe point at world u (for coins rolling along it / numbered route nodes): { u, v: 0 } */
export const pipeAt = (u) => ({ u, v: 0 });

// ---------------------------------------------------------------- A 被盗现场 (seg1 L0–L1; seg2 L2; seg3 L1–L4)
const a = zone(0);
export const HOTSAFE = a(0, -380);                        // kit safe variant "hot" plate "热钱包" (original size), door open, state broken
export const HERO = [a(260, 0), a(380, 0), a(500, 0), a(620, 0), a(740, 0)].map((q) => ({ ...q, scale: 0.55 })); // E07 oddCoin ×5 USDT/USDC/BTC/XRP/SOL 0.55 (start on the road)
export const ATK_A = a(200, 360, { scale: 0.55 });        // kit person attacker "攻击者" 0.55 (stands by, no action)
export const PAUSE_A = a(-750, -300, { scale: 0.7 });     // kit knifeSwitch "协议暂停" (wrap 0.7!)
export const TLOCK_A = a(950, -380, { scale: 0.6 });      // E01 timeLock "提款延迟 8 小时" (wrap 0.6!)
export const METH = a(1450, -520, { scale: 0.55 });       // E03 contractMachine "mETH Protocol" (wrap 0.55!)
export const CMETH = [a(1250, -170), a(1360, -170), a(1470, -170), a(1580, -170)].map((q) => ({ ...q, scale: 0.8 })); // E06 shareCert ×4 "cmETH" 0.8
export const SIGN_A = a(-700, 330);                       // E01 signBoard plate "被盗现场"
export const DOTS_A = a(900, 300);                        // dot matrix area (seg3 L3: 43 dots), EXT.dotsA

// ---------------------------------------------------------------- B 发行方路口 (seg1 L2–L12; seg2 L0–L1; seg3 L5–L17)
const b = zone(3200);
export const MINT = [b(-650, -520), b(-200, -560)].map((q) => ({ ...q, scale: 0.55 })); // E11 mintPress ×2 "USDT 发行方" / "USDC 发行方" 0.55
export const ADDR_B = [b(-600, 170), b(-450, 170), b(-300, 170)].map((q) => ({ ...q, scale: 0.7 }));         // E02 addrPlate ×3 "攻击者地址" (wrap 0.7!)
export const LOCK_B = [b(-640, -200), b(-200, -230)].map((q) => ({ ...q, scale: 0.6 }));                      // kit padlock ×2 (wrap 0.6!) — drop onto ADDR_B / coins
export const CLOCK_B = [b(-1050, -250), b(1000, 330)];   // kit clock ×2 (original size): "37 分钟" (mint side) · "约 6 小时" (law corner, seg3 L15)
export const AMM = b(250, -260, { scale: 0.6 });          // E08 ammPool labelL "USDT" labelR "ETH" 0.6 (DEX swap)
export const OUTCOIN = [b(480, 0), b(580, 0)].map((q) => ({ ...q, scale: 0.5 }));                            // E07 oddCoin ×2 "ETH" / "TRX" 0.5 (on the road)
export const DOTS_B = b(-1000, 380);                      // dot matrix area (seg1 L2–L8: 97 / 82 / 79 / 27 / 100-bar), EXT.dotsB
export const DOC_TRO = b(850, -480);                      // kit doc standing "临时限制令" (w 200 h 260)
export const DOC_LIFT = b(1100, -480);                    // kit doc standing "解除冻结" (slides over DOC_TRO in seg3 L13)
export const DOC_GENIUS = b(1450, -150);                  // kit doc standing "GENIUS 法案"
export const SEAL_B = b(950, -130, { scale: 0.6 });       // kit seal markText "法院" (wrap 0.6!)
export const T3 = b(1450, -560);                          // E01 signBoard plate "T3 金融犯罪部门" (+ three name tags, native SVG)
export const DOTS_LAW = b(1150, 330);                     // dot matrix area (seg3 L8 45 / L12 58 / L15 23 dots), EXT.dotsLaw
export const SIGN_B = b(-1200, 330);                      // E01 signBoard plate "发行方路口"

// ---------------------------------------------------------------- C 出城口 (seg2 L3–L22; seg3 L18–L20; seg4 L0)
const c = zone(6900);
export const BRIDGE = c(-850, -620, { scale: 0.6 });      // E01 bridge (booth = "跨链桥 · 兑换服务") (wrap 0.6!)
export const LOTTERY = c(-100, -560, { scale: 0.55 });    // E02 lottery plate "混币器" (wrap 0.55!)
export const STALL = c(450, -560, { scale: 0.55 });       // E08 marketStall head "场外交易" 0.55
export const COUNTER = c(1050, -600, { scale: 0.6 });     // E04 tellerCounter sign "交易所 · 风控" 0.6
export const CHECKS = [c(-700, -200), c(-100, -200), c(450, -200), c(1050, -200)].map((q) => ({ ...q, scale: 0.5 })); // kit checkpoint ×4 (wrap 0.5!), one per exit, same order
export const RISKDOC = c(1420, -440);                     // kit doc standing "风控名单" beside the counter
export const ADDR_C = [c(-700, 330), c(-560, 300), c(-420, 280), c(-280, 280), c(-140, 300), c(0, 330)].map((q) => ({ ...q, scale: 0.55 })); // E02 addrPlate ×6 "地址 1…6" (wrap 0.55!) fan
export const COINS_C = [c(-1100, 0), c(-1000, 0), c(-900, 0)].map((q) => ({ ...q, scale: 0.45 })); // E07 oddCoin ×3 0.45 (to be scattered)
export const ROBBER = c(1550, 220, { scale: 0.5 });       // kit person attacker "劫匪" 0.5 (walks onto the highway)
export const HIGHWAY = c(1700, 0);                        // grey highway (native SVG), ground strip from here along +u, EXT.highway
export const PLATE_CAR = c(2100, 260);                    // car-plate tag "USDT" → "BTC" (native SVG), EXT.plateCar
export const DOTS_C = c(300, 330);                        // dot matrix area (seg2 L21: 100 dots), EXT.dotsC
export const SIGN_C = c(-1650, 450);                      // E01 signBoard plate "出城口"

// ---------------------------------------------------------------- D 链上法庭 (seg4 全段; seg5 L0)
const d = zone(11200);
export const CHAIN = d(-1000, -560, { scale: 0.7 });      // kit chain n 4 title "Sui" (wrap 0.7!)
export const ROTA = d(-800, 300, { scale: 0.6 });         // E09 rotaWheel plate "验证者" 0.6
export const MSIG = d(-350, -620, { scale: 0.6 });        // E05 accountSafe "三方共管多签" keys 3 (wrap 0.6!)
export const KEYCARD = d(-380, 260, { scale: 0.55 });     // E05 keycard "Arbitrum 安全委员会" 0.55
export const ENG_D = [d(-280, 330), d(-180, 330), d(-80, 330)].map((q) => ({ ...q, scale: 0.45 })); // kit person engineer ×3 0.45
export const DOTS_D = d(-1250, 500);                      // dot matrix area (seg4 L2–L4: 22 dots), EXT.dotsD
export const TOWER_D = d(400, -560, { scale: 0.5 });      // kit tower "链上喊话" (wrap 0.5!)
export const ENVELOPE = d(700, 280);                      // kit envelope "赏金 10%" (w 90 h 56)
export const BOUNTY = [d(840, 280), d(930, 280)].map((q) => ({ ...q, scale: 0.45 }));     // E07 oddCoin ×2 0.45
export const RTAG = [d(380, 260), d(500, 260)].map((q) => ({ ...q, scale: 0.7 }));        // E07 returnTag ×2 "归还" 0.7
export const DOTS_TALK = d(450, 480);                     // dot matrix area (seg4 L11 61 / L12 20 dots), EXT.dotsTalk
export const BAL = d(1550, -560, { scale: 0.7 });         // E01 balance (court scales) (wrap 0.7!)
export const BUCKET = d(1400, 250, { scale: 0.8 });       // kit bucket "云存储" (wrap 0.8!)
export const KEY_D = d(1560, 250, { scale: 0.6 });        // kit key "私钥文件" (wrap 0.6!) — rises out of the bucket
export const LOCK_D = d(1700, 250, { scale: 0.5 });       // kit padlock (wrap 0.5!) — opens on decryption
export const HOURGLASS = d(2050, -300, { scale: 0.7 });   // kit hourglass "好几年" (wrap 0.7!)
export const DOC_SEIZE = d(1950, 230);                    // kit doc standing "没收"
export const DOC_RETURN = d(2200, 230);                   // kit doc standing "实物返还申请"
export const DOTS_COURT = d(1500, 520);                   // dot matrix area (seg4 L18: 95 dots), EXT.dotsCourt
export const SIGN_D = [d(-1450, 330), d(800, -350), d(1150, -300)]; // E01 signBoard plate ×3 "链级冻结" / "谈判" / "法院"

// ---------------------------------------------------------------- E 应急作战室与用户角 (seg5 全段; seg6 L0–L6)
const e = zone(15900);
export const DESKS = [e(-1500, -520), e(-1200, -520), e(-900, -520)].map((q) => ({ ...q, scale: 0.65 })); // kit desk ×3 (wrap 0.65!), alert screens native SVG
export const ENG_E = [e(-1450, -220), e(-1150, -220), e(-850, -220)].map((q) => ({ ...q, scale: 0.5 })); // kit person engineer ×3 0.5
export const BEACON = e(-1800, -300);                     // kit beacon "发现异常" (original size)
export const CLOCK_E = e(-1700, 300);                     // kit clock "T+0" → "T+6h" (original size), 6-step ring native SVG
export const PAUSE_E = e(-550, -480, { scale: 0.6 });     // kit knifeSwitch "暂停提币" (wrap 0.6!)
export const LIST = e(-650, 300);                         // kit doc standing "地址清单" lines 被盗地址 / 攻击者地址 / 下一跳
export const LETTER0 = e(-650, 300);                      // E01 letter ×5 (w 60 h 40) all start here, fly to RECIPS[i]
export const RECIPS = [e(-150, -600), e(150, -600), e(450, -600), e(750, -600), e(1050, -600)]; // small E01 signBoard plate ×5 (size 34, EXT.signSmall): 稳定币发行方 / 交易所风控 / 跨链桥 · 兑换服务 / SEAL 911 / 链上分析公司
export const DISPATCH = e(350, 300, { scale: 0.6 });      // E07 dispatchDesk "通知登记" 0.6
export const DOC_FULL = e(-200, 330);                     // kit doc standing "完整报告" (grey, seg5 L6)
export const TOWER_E = e(1350, -560, { scale: 0.5 });      // kit tower "链上喊话" (wrap 0.5!) — left side of prepE
export const SNAPCAM = e(1700, -300, { scale: 0.6 });     // E11 snapshotCamera "证据保全" 0.6 (lens +v)
export const RACK = e(1950, -620, { scale: 0.6 });        // kit rack "服务器镜像" (wrap 0.6!)
export const DOC_REPORT = e(1450, 280);                   // kit doc standing "报案"
export const SHIELD = e(2250, -250, { scale: 0.7 });      // kit shield "安全港" (wrap 0.7!)
export const MAGNIFIER = e(2100, 330);                    // kit magnifier "链上监控" (original size)
export const ROLEBOARD = e(2500, -600, { scale: 0.5 });   // E05 roleBoard "值守 · 演练" (wrap 0.5!)
export const DOC_TRACE = e(1750, 300);                    // kit doc standing "追踪结论" (seg5 L17)
export const DOTS_E = e(2400, 300);                       // dot matrix area (seg5 L13: 100 dots 10 × 10), EXT.dotsE
export const SIGN_E = [e(-2000, 330), e(2850, -350)];     // E01 signBoard plate ×2 "应急作战室" / "用户角"
export const USER = e(3100, 250, { scale: 0.55 });        // kit person signer "你" 0.55
export const PHONE = e(3150, -200, { scale: 0.8 });       // kit phone (approvals list, native SVG screen) (wrap 0.8!)
export const NEWADDR = e(3450, -450);                     // E02 addrPlate "全新地址" (original size)
export const MNEMONIC = e(3750, -560, { scale: 0.6 });    // E02 mnemonicPlate "新助记词" (wrap 0.6!)
export const HWW = e(3850, -250);                         // kit hwWallet "新设备" (original size)
export const DOC_REC = e(3300, 330);                      // kit doc standing "被盗记录"
export const DOC_RECEIPT = e(3550, 330);                  // kit doc standing "报案回执"
export const SCAMMER = e(3950, 250, { scale: 0.5 });      // kit person attacker "追回诈骗" 0.5 (holding a phone)

// ---------------------------------------------------------------- object screen extents (scale 1, relative to the ground point)
export const EXT = {
  safeHot: [-117, -250, 117, 52], oddCoin: [-39, -109, 39, 18], person: [-50, -208, 50, 7], personAtk: [-50, -229, 50, 7],
  knifeSwitch: [-153, -344, 133, 48], timeLock: [-64, -182, 64, 27], contractMachine: [-155, -246, 155, 76], shareCert: [-35, -17, 35, 16],
  signPlate: [-130, -239, 102, 48], signSmall: [-113, -233, 86, 42], mintPress: [-114, -238, 114, 55], addrPlate: [-56, -174, 57, 10], padlock: [-56, -138, 62, 28],
  clock: [-76, -193, 61, 2], ammPool: [-136, -215, 136, 61], docStanding: [-84, -261, 82, 23], seal: [-146, -142, 147, 69],
  bridge: [-367, -208, 367, 207], lottery: [-150, -260, 150, 96], marketStall: [-133, -279, 136, 56], tellerCounter: [-228, -343, 241, 92],
  checkpoint: [-213, -305, 284, 143], chain4: [-287, -197, 287, 110], rotaWheel: [-112, -113, 112, 56], accountSafe: [-259, -375, 259, 106],
  keycard: [-28, -85, 26, 9], tower: [-106, -450, 106, 53], envelope: [-54, -27, 54, 26], returnTag: [-30, -62, 29, 7],
  balance: [-163, -258, 163, 40], bucket: [-76, -164, 76, 28], key: [-75, -35, 84, 31], hourglass: [-56, -201, 56, 28],
  desk: [-147, -272, 147, 74], beacon: [-61, -118, 61, 30], letter: [-28, -56, 26, 0], dispatchDesk: [-113, -147, 113, 44],
  snapshotCamera: [-52, -162, 47, 22], rack: [-113, -349, 113, 51], shield: [-68, -218, 64, 28], magnifier: [-58, -260, 120, -105],
  roleBoard: [-194, -334, 187, 72], phone: [-70, -195, 58, 27], mnemonicPlate: [-110, -215, 110, 50], hwWallet: [-73, -62, 90, 33],
  dotsA: [0, 0, 300, 110], dotsB: [0, 0, 520, 150], dotsLaw: [0, 0, 300, 110], dotsC: [0, 0, 320, 120], dotsD: [0, 0, 240, 90],
  dotsTalk: [0, 0, 300, 110], dotsCourt: [0, 0, 320, 120], dotsE: [0, 0, 200, 200], highway: [0, -330, 780, 90], plateCar: [-50, -40, 50, 10],
};

export const rect = (o, kind, scale = o.scale ?? 1) => { const [X, Y] = Wp(o.u, o.v); const q = EXT[kind]; return [X + q[0] * scale, Y + q[1] * scale, X + q[2] * scale, Y + q[3] * scale]; };
/** camera that fits the union of rects into the screen box [x0,y0,x1,y1] */
export const fit = (rects, [x0, y0, x1, y1], kmax = 1.4) => {
  const X0 = Math.min(...rects.map((q) => q[0])), Y0 = Math.min(...rects.map((q) => q[1]));
  const X1 = Math.max(...rects.map((q) => q[2])), Y1 = Math.max(...rects.map((q) => q[3]));
  const k = Math.min(kmax, (x1 - x0) / (X1 - X0), (y1 - y0) / (Y1 - Y0));
  return camAt([(X0 + X1) / 2, (Y0 + Y1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};

// ---------------------------------------------------------------- per-area rect groups
const R = {
  heist: [rect(HOTSAFE, "safeHot"), ...HERO.map((q) => rect(q, "oddCoin")), rect(ATK_A, "personAtk"), rect(PAUSE_A, "knifeSwitch"),
    rect(TLOCK_A, "timeLock"), rect(METH, "contractMachine"), ...CMETH.map((q) => rect(q, "shareCert")), rect(DOTS_A, "dotsA")],
  signA: [rect(SIGN_A, "signPlate")],
  mint: [...MINT.map((q) => rect(q, "mintPress")), ...ADDR_B.map((q) => rect(q, "addrPlate")), ...LOCK_B.map((q) => rect(q, "padlock")),
    rect(CLOCK_B[0], "clock"), rect(AMM, "ammPool"), ...OUTCOIN.map((q) => rect(q, "oddCoin")), rect(DOTS_B, "dotsB")],
  law: [rect(DOC_TRO, "docStanding"), rect(DOC_LIFT, "docStanding"), rect(DOC_GENIUS, "docStanding"), rect(SEAL_B, "seal"), rect(T3, "signPlate"),
    rect(CLOCK_B[1], "clock"), rect(DOTS_LAW, "dotsLaw")],
  signB: [rect(SIGN_B, "signPlate")],
  exit: [rect(BRIDGE, "bridge"), rect(LOTTERY, "lottery"), rect(STALL, "marketStall"), rect(COUNTER, "tellerCounter"), ...CHECKS.map((q) => rect(q, "checkpoint")),
    rect(RISKDOC, "docStanding"), ...ADDR_C.map((q) => rect(q, "addrPlate")), ...COINS_C.map((q) => rect(q, "oddCoin")), rect(ROBBER, "personAtk"),
    rect(HIGHWAY, "highway"), rect(PLATE_CAR, "plateCar"), rect(DOTS_C, "dotsC")],
  signC: [rect(SIGN_C, "signPlate")],
  chain: [rect(CHAIN, "chain4"), rect(ROTA, "rotaWheel"), rect(MSIG, "accountSafe"), rect(KEYCARD, "keycard"), ...ENG_D.map((q) => rect(q, "person")),
    rect(DOTS_D, "dotsD"), rect(SIGN_D[0], "signPlate")],
  talk: [rect(TOWER_D, "tower"), rect(ENVELOPE, "envelope"), ...BOUNTY.map((q) => rect(q, "oddCoin")), ...RTAG.map((q) => rect(q, "returnTag")),
    rect(DOTS_TALK, "dotsTalk"), rect(SIGN_D[1], "signPlate")],
  court: [rect(BAL, "balance"), rect(BUCKET, "bucket"), rect(KEY_D, "key"), rect(LOCK_D, "padlock"), rect(HOURGLASS, "hourglass"),
    rect(DOC_SEIZE, "docStanding"), rect(DOC_RETURN, "docStanding"), rect(DOTS_COURT, "dotsCourt"), rect(SIGN_D[2], "signPlate")],
  war: [...DESKS.map((q) => rect(q, "desk")), ...ENG_E.map((q) => rect(q, "person")), rect(BEACON, "beacon"), rect(CLOCK_E, "clock"),
    rect(PAUSE_E, "knifeSwitch"), rect(LIST, "docStanding"), rect(SIGN_E[0], "signPlate")],
  notify: [rect(LIST, "docStanding"), ...RECIPS.map((q) => rect(q, "signSmall")), rect(DISPATCH, "dispatchDesk"), rect(DOC_FULL, "docStanding")],
  prep: [rect(TOWER_E, "tower"), rect(SNAPCAM, "snapshotCamera"), rect(RACK, "rack"), rect(DOC_REPORT, "docStanding"), rect(SHIELD, "shield"),
    rect(MAGNIFIER, "magnifier"), rect(ROLEBOARD, "roleBoard"), rect(DOC_TRACE, "docStanding"), rect(DOTS_E, "dotsE")],
  user: [rect(USER, "person"), rect(PHONE, "phone"), rect(NEWADDR, "addrPlate"), rect(MNEMONIC, "mnemonicPlate"), rect(HWW, "hwWallet"),
    rect(DOC_REC, "docStanding"), rect(DOC_RECEIPT, "docStanding"), rect(SCAMMER, "personAtk"), rect(SIGN_E[1], "signPlate")],
};
export const ZONE_RECTS = {
  A: [...R.heist, ...R.signA],
  B: [...R.mint, ...R.law, ...R.signB],
  C: [...R.exit, ...R.signC],
  D: [...R.chain, ...R.talk, ...R.court],
  E: [...R.war, ...R.notify, ...R.prep, ...R.user],
};
const Z = ZONE_RECTS;
const SAFE = [100, 280, 1820, 860];                      // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for code cards / cards at the sides

// ---------------------------------------------------------------- camera presets (screen bboxes per framing: run a throwaway check)
export const CAMS = {
  // 全景：整座追赃城（seg2 L2–L6、L15–L20；seg6 L7–L13 结束卡）
  wide: fit([...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E], [60, 220, 1860, 860], 1),
  // A 被盗现场：热钱包 + 五枚币 + 攻击者 + 暂停闸 + 时间锁 + mETH 机器 + cmETH 份额（seg1 起点 L0–L1；seg3 L1–L4）
  heistA: fit(R.heist, SAFE, 1.4),
  // B 发行方：两台铸币机 + 攻击者地址牌 + 冻结锁 + 37 分钟钟 + AMM 池 + 点阵（seg1 L2–L12 终点；seg2 起点 L0–L1；seg3 L5–L10）
  mintB: fit(R.mint, SAFE, 1.4),
  // B 右半法规角：限制令 / 解除冻结 / 公章 / T3 牌 / GENIUS / 6 小时钟，右边缘露出 C 的跨链桥（seg3 L11–L17）
  lawB: fit([...R.law, rect(BRIDGE, "bridge")], SAFE, 1.4),
  // C 出城口：四个出口 + 关卡 + 分散地址 + 国道 + 劫匪（seg2 L7–L14、L21–L22 终点；seg3 起点 L0）
  exitC: fit(R.exit, SAFE, 1.4),
  // C 交易所柜台 + 风控名单 + 关卡特写（seg3 L18–L20 终点；seg4 起点 L0）
  counterC: fit([rect(COUNTER, "tellerCounter"), rect(CHECKS[3], "checkpoint"), rect(RISKDOC, "docStanding"), rect(STALL, "marketStall"), rect(ROBBER, "personAtk")], MID, 1.4),
  // D 链级冻结：链 + 验证者转台 + 多签保险箱 + 安全委员会（seg4 L1–L9）
  chainD: fit(R.chain, SAFE, 1.4),
  // D 谈判：喊话塔 + 赏金信封 + 归还签 + 点阵（seg4 L10–L15）
  talkD: fit(R.talk, MID, 1.4),
  // D 法院：天平 + 云存储桶 + 私钥 + 沙漏 + 两份文件（seg4 L16–L20 终点；seg5 起点）
  courtD: fit(R.court, SAFE, 1.4),
  // E 作战室：工位 + 告警灯 + 时钟 + 暂停闸 + 地址清单（seg5 L0–L3、L15–L16）
  warE: fit(R.war, SAFE, 1.4),
  // E 通知：地址清单 + 五封信 + 五块收件牌 + 登记台（seg5 L4–L6）
  notifyE: fit(R.notify, SAFE, 1.4),
  // E 准备：喊话塔（左）+ 证据保全相机 + 机柜 + 报案 + 安全港盾 + 监控放大镜 + 值守板（seg5 L7–L14、L17 终点；seg6 起点）
  prepE: fit(R.prep, SAFE, 1.4),
  // E 用户角：你 + 手机 + 全新地址 + 新助记词 + 新设备 + 两份记录 + 追回诈骗者（seg6 L0–L6）
  userE: fit(R.user, SAFE, 1.4),
};
CAMS.world = CAMS.wide;                                  // alias (ep11 convention)
