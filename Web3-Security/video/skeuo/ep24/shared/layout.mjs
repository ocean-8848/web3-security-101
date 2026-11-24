// ep24「一条数据街」shared world layout — one continuous isometric world, fixed for all six segments:
//   import * as L from "../../shared/layout.mjs";   (from ep24/segN/src/build-story.mjs)
//   A 用户家: SIGN_A, USER_A, PHONE_A, ADDR_A, HW_A, PARCEL_A, SIM_A, ENV_A, WL_A, ATK_CALL, ATK_DOOR, LIST_A, MANUAL, BANK_A, BOOK_CHAIN
//   B 外包客服中心: SIGN_B, LEDGER, DESKS, AGENTS, RECRUITER, BRIBE, BRIBE_COINS, STACK_B, VAULT_B, PADLOCK_B, KEY_B, BEACON_B, DOTS_B
//   C 第三方街: SIGN_C, STALL_PLATES, PARCELS_C, ORDER_DOC, PHONE_C, SIM_C, CRED_DOC, BUCKET_C, TICKET_DOC, LETTERS_C, MAG_C, ATK_C,
//               DOTS_C (×3), FORUM_C
//   D 链上广场: SIGN_D, CHAIN_D, ADDR_D, MAG_D, TELLER_D, LOTTERY_D, CLOCK_D, PHONE_D, PEOPLE_D, COINS_IN, COINS_OUT, TX_D,
//               SIGN_COURT, BALANCE, MAG_COURT, DOCS_COURT
//   E 控制室与链上档案: SIGN_E1, DESK_E, SHIELD_E, CKPT_E, DISPATCH_E, BEACON_E, SEAL_E, DOCS_E, TIMELOCK_E, KEYCARD_E, LIST_E, DARKWEB_E,
//               SIGN_E2, CHAIN_E, FUNNEL, GPU, SALT, COMMIT, KEY_E, PADLOCK_E, RACK_E
//   path: ROAD · framing: EXT, rect, fit, ZONE_RECTS, CAMS, world
// Positions only; ids, states, labels and per-shot opts stay in each segment. Object ids must never be `cam` or `root`.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Every position is written as a zone-local screen offset: the world point whose ground lands on world-canvas px (anchor + (X, Y))
// (iso.G, rounded) — so the numbers read as on-screen ground offsets at camera scale 1. `scale` = the opts.scale to pass to the object.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): of the objects used here only kit person, E04 tellerCounter, E05 keycard, E07 oddCoin /
//   parcel / dispatchDesk, E09 commitBox, E22 simCard and E24 saltShaker take opts.scale. Everything else IGNORES it. Where an object
//   carries `scale` + `wrap: true` below (A phone 0.8, manual 0.8; B desk 0.65, padlock / key 0.6; C phone 0.6, bucket 0.8;
//   D chain 0.8, addrPlate 0.7, lottery 0.6, balance 0.7, phone 0.7; E desk 0.65, shield 0.7, checkpoint 0.6, seal 0.6, timeLock 0.6,
//   hashFunnel 0.7, gpuRig 0.6, rack 0.6, chain 0.6, key / padlock 0.7) the segment MUST put it with the wrap helper
//   (translate · scale · translate around its ground point) and rescale its anchors; rect() / CAMS already assume the scaled size.
// kit doc / envelope / E01 letter take w / h instead of scale: positions carry `w`, `h` (and `scale` = w/200 for doc, only for rect()).
//   Docs below are `standing: true` unless noted. Pass w / h, NOT wrap. E01 signBoard plate takes size / w; E01 pipe is routed per
//   segment from anchors (pts relative to the start object) — the slate ROAD carries the main pipe at v = 0.
// Overlap on purpose (left out of the overlap check): BRIBE_COINS sit in BRIBE; PADLOCK_B / KEY_B sit inside the dashed VAULT_B frame;
//   MAG_COURT is the magnifier's landing spot on the BALANCE tray (seg4 L18) — move MAG_D there, don't put a second magnifier.
// Native-SVG areas (dot matrices, list cards, dashed frame, forum board, tx node, dark-web board) are a ground origin + a box kind in EXT.
// The slate path runs along +u (screen: up-right), zones left → right A · B · C · D · E, every zone anchor on v = 0.
import { Wp, G, camAt, CE } from "../../kit/iso.mjs";

/** world ground point for world-canvas px (X, Y); extra fields (scale, z, wrap …) copied in */
const S = (X, Y, extra = {}) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
/** zone-local placer: positions below are written relative to the zone's anchor px */
const zone = (OX, OY) => (X, Y, extra) => S(OX + X, OY + Y, extra);
const road = (u) => Wp(u, 0);                            // zone anchor px on the path centre line
const ZU = { A: 0, B: 3300, C: 6300, D: 9300, E: 13000 };
export const ZONE_ANCHOR = Object.fromEntries(Object.entries(ZU).map(([k, u]) => [k, road(u).map(Math.round)]));
const DOC = (w, h) => ({ w, h, scale: w / 200 });        // kit doc size → rect scale

// ---- A 最左·用户家 (seg1 L8–L13 终点 homeA; seg2 起点 homeA、L3–L7 bookA、L8–L12; seg6 L2–L10): anchor = user's phone
const a = zone(...ZONE_ANCHOR.A);
export const SIGN_A = a(-760, -300);                             // E01 signBoard plate "用户家"
export const USER_A = a(-260, 60, { scale: 0.55 });              // kit person signer 0.55 "用户"
export const PHONE_A = a(-120, 20, { scale: 0.8, wrap: true });  // kit phone 来电页 / 官方 App 页 (wrap 0.8!)
export const ADDR_A = a(-600, 20);                               // E02 addrPlate text "住址" (original size) — 家门口的信箱
export const HW_A = a(160, 100);                                 // kit hwWallet (original size)
export const PARCEL_A = a(330, 60, { scale: 0.8 });              // E07 parcel 0.8 "硬件钱包" (seg6 L3 收件标签改"代收点")
export const SIM_A = a(40, 170, { scale: 0.7 });                 // E22 simCard 0.7 "手机号"
export const ENV_A = [a(-440, 260, { w: 90, h: 56 }), a(-260, 300, { w: 90, h: 56 })]; // kit envelope 90×56 "交易所邮箱" / "电商邮箱"
export const WL_A = a(-60, 300, DOC(120, 150));                  // kit doc standing title "提币白名单" w 120 h 150
export const ATK_CALL = a(420, -160, { scale: 0.5 });            // kit person attacker 0.5 打电话的冒充者 (right back)
export const ATK_DOOR = a(-720, 120, { scale: 0.5 });            // kit person attacker 0.5 住址旁的人身威胁剪影 (seg2 L11)
export const LIST_A = a(150, -240);                             // seg2 L1–L3 "名单" card floating over A (native SVG), EXT.listA
export const MANUAL = a(900, 140, { scale: 0.8, wrap: true });   // E03 manual title "肥羊通讯录" (wrap 0.8!), roadside between A and B
export const BANK_A = a(700, -40);                               // seg2 L6 grey "银行流水" card with lock (native SVG), EXT.bankA
export const BOOK_CHAIN = a(900, -300);                          // seg2 L6–L7 public chain strip above the book (native SVG), EXT.bookChain

// ---- B 中左·外包客服中心 (seg1 起点 callB; seg2 L13–L19 终点 backB; seg3 起点; seg6 L0–L1): anchor = dbLedger "客服后台"
const b = zone(...ZONE_ANCHOR.B);
export const SIGN_B = b(-1000, -320);                            // E01 signBoard plate "外包客服中心"
export const LEDGER = b(-60, -140);                              // kit dbLedger tag "客服后台" (original size) — 主角
export const DESKS = [b(-520, 120), b(-220, 190), b(80, 260)].map((q) => ({ ...q, scale: 0.65, wrap: true })); // kit desk 工位 1/2/3 (wrap 0.65!)
export const AGENTS = DESKS.map((q, i) => b([-390, -90, 210][i], [160, 230, 300][i], { scale: 0.5 })); // kit person engineer 0.5 "客服 1/2/3"
export const RECRUITER = b(-760, -140, { scale: 0.5 });          // kit person attacker 0.5 "招募者" (B 区左后)
export const BRIBE = b(-560, -150, { w: 110, h: 70 });           // kit envelope 110×70 收买的钱 (slides to desk 2 in seg1 L1)
export const BRIBE_COINS = [b(-590, -165), b(-560, -170), b(-530, -165)].map((q) => ({ ...q, scale: 0.5 })); // E07 oddCoin 0.5 ×3, peeking out of BRIBE
export const STACK_B = b(170, -110, DOC(130, 170));              // kit doc standing title "导出" w 130 h 170 ×3 — the export pile (same spot, z per sheet)
export const VAULT_B = b(360, -220);                             // grey dashed frame "不在数据里" around padlock + key (native SVG), EXT.vaultB
export const PADLOCK_B = b(430, -90, { scale: 0.6, wrap: true }); // kit padlock "密码" (wrap 0.6!), inside VAULT_B
export const KEY_B = b(570, -60, { scale: 0.6, wrap: true });    // kit key "私钥" (wrap 0.6!), inside VAULT_B
export const BEACON_B = b(-300, -260);                           // kit beacon (original size), 告警 — off-frame in callB
export const DOTS_B = b(-620, -440);                             // seg1 L2 69 dots / L6 40 dots (native SVG), EXT.dotsB

// ---- C 中间·第三方街 (seg3 全段 起点 streetC 终点 weakC; seg4 起点; seg5 L9–L10 方向): anchor = street centre
const c = zone(...ZONE_ANCHOR.C);
export const SIGN_C = c(-1150, -300);                            // E01 signBoard plate "第三方街"
export const STALL_PLATES = [c(-720, -240), c(-260, -240), c(200, -240), c(660, -240)]; // E01 signBoard plate ①"电商与营销库" ②"破产案服务商" ③"客服工单平台" ④"邮件供应商"
// ① 电商与营销库
export const PARCELS_C = [c(-800, 40), c(-730, 70), c(-660, 100)].map((q) => ({ ...q, scale: 0.7 })); // E07 parcel 0.7 ×3
export const ORDER_DOC = c(-560, 40, DOC(120, 150));             // kit doc standing "订单 · 收货地址" w 120 h 150
// ② 破产案服务商
export const PHONE_C = c(-340, 40, { scale: 0.6, wrap: true });  // kit phone 员工手机 (wrap 0.6!)
export const SIM_C = c(-250, 90, { scale: 0.7 });                // E22 simCard 0.7
export const CRED_DOC = c(-150, 40, DOC(120, 150));              // kit doc standing "债权人文件" (lines 姓名 / 地址 / 邮箱 / 余额) w 120 h 150
// ③ 客服工单平台
export const BUCKET_C = c(140, 40, { scale: 0.8, wrap: true });  // kit bucket 工单库 (wrap 0.8!)
export const TICKET_DOC = c(290, 40, DOC(120, 150));             // kit doc standing "工单" w 120 h 150
// ④ 邮件供应商
export const LETTERS_C = [c(560, 40), c(630, 70), c(700, 100), c(770, 130)].map((q) => ({ ...q, w: 60, h: 40 })); // E01 letter 60×40 ×4
export const MAG_C = c(-430, 340);                               // kit magnifier (original size), sweeps the four stalls (L19)
export const ATK_C = c(60, 300, { scale: 0.5 });                 // kit person attacker 0.5 walking the street
export const DOTS_C = [c(-860, 170), c(100, 170), c(560, 180)]; // dot matrices in front of stalls ①/③/④ (native SVG): seg3 L3–L4 100 + 27 (+2), EXT.dotsC1;
                                                                 //   L14–L15 66 (+40 ring), EXT.dotsC3; L17 57, EXT.dotsC4
export const FORUM_C = c(-930, -80);                             // seg3 L5 grey "论坛" board (native SVG), EXT.forumC

// ---- D 中右·链上广场 (seg4 全段 起点 plazaD、L11–L14 coinjoinD、终点 courtD; seg5 起点): anchor = plaza centre
const d = zone(...ZONE_ANCHOR.D);
export const SIGN_D = d(-1150, -320);                            // E01 signBoard plate "链上广场"
export const CHAIN_D = d(-560, -140, { scale: 0.8, wrap: true }); // kit chain n 4 公开账本 (wrap 0.8!)
export const ADDR_D = [d(-820, 220), d(-680, 260), d(-540, 300), d(-400, 340)].map((q) => ({ ...q, scale: 0.7, wrap: true })); // E02 addrPlate "地址 1/2/3/4" (wrap 0.7!)
export const MAG_D = d(-220, 140);                               // kit magnifier "链上分析" (original size)
export const TELLER_D = d(180, -20, { scale: 0.6 });             // E04 tellerCounter 0.6 sign "交易所 · KYC"
export const LOTTERY_D = d(540, 160, { scale: 0.6, wrap: true }); // E02 lottery plate "混币器" (wrap 0.6!)
export const CLOCK_D = d(-60, -220);                             // kit clock (original size) 时间模式
export const PHONE_D = d(-1000, 80, { scale: 0.7, wrap: true }); // kit phone 社交页 "0x… · name.eth" (wrap 0.7!)
export const PEOPLE_D = [d(-700, 520), d(-580, 520), d(-460, 520), d(-340, 520)].map((q) => ({ ...q, scale: 0.45 })); // kit person signer 0.45 ×4 (CoinJoin)
export const COINS_IN = [d(-700, 620), d(-580, 620), d(-460, 620), d(-340, 620)].map((q) => ({ ...q, scale: 0.55 })); // E07 oddCoin 0.55 输入 ×4
export const TX_D = d(-200, 620);                                // CoinJoin tx node (native SVG), EXT.txD
export const COINS_OUT = [d(-60, 620), d(20, 620), d(100, 620), d(180, 620)].map((q) => ({ ...q, scale: 0.55 })); // E07 oddCoin 0.55 等额输出 ×4
export const SIGN_COURT = d(860, -260);                          // E01 signBoard plate "法庭"
export const BALANCE = d(920, 160, { scale: 0.7, wrap: true });  // E01 balance 法庭天平 (wrap 0.7!)
export const MAG_COURT = d(840, 250);                            // landing spot of MAG_D on the balance tray (seg4 L18) — not a second object
export const DOCS_COURT = [d(1140, 120, DOC(120, 150)), d(1270, 170, DOC(120, 150))]; // kit doc standing "判决" / "上诉维持" w 120 h 150

// ---- E 最右·控制室 (左半) 与链上档案 (右半) (seg5 全段 ctrlE → 终点 archiveE; seg6 起点): anchor = between the two halves
const e = zone(...ZONE_ANCHOR.E);
export const SIGN_E1 = e(-1300, -320);                           // E01 signBoard plate "控制室"
export const DESK_E = e(-1000, 0, { scale: 0.65, wrap: true });  // kit desk 屏幕 "证件号 ****" (wrap 0.65!)
export const SHIELD_E = e(-760, -120, { scale: 0.7, wrap: true }); // kit shield "最小权限" (wrap 0.7!)
export const CKPT_E = e(-560, 40, { scale: 0.6, wrap: true });   // kit checkpoint 门牌 "导出审批" (wrap 0.6!)
export const DISPATCH_E = e(-1100, 260, { scale: 0.6 });         // E07 dispatchDesk 0.6 "查询登记"
export const BEACON_E = e(-880, 280);                            // kit beacon "异常告警" (original size)
export const SEAL_E = e(-660, 300, { scale: 0.6, wrap: true });  // kit seal markText "水印" (wrap 0.6!)
export const DOCS_E = [e(-440, 300, DOC(120, 150)), e(-330, 340, DOC(120, 150))]; // kit doc standing "合同" / "泄露通知" w 120 h 150
export const TIMELOCK_E = e(-300, -140, { scale: 0.6, wrap: true }); // E01 timeLock "提币冷却" (wrap 0.6!)
export const KEYCARD_E = e(-860, 80, { scale: 0.55 });           // E05 keycard 0.55 "工单权限", beside the desk screen
export const LIST_E = e(-1260, 100, DOC(120, 150));              // kit doc standing "数据清单" w 120 h 150 (seg5 L1)
export const DARKWEB_E = e(-120, 260);                           // seg5 L13 grey "暗网" board (native SVG), EXT.darkwebE
export const SIGN_E2 = e(150, -340);                             // E01 signBoard plate "链上档案"
export const CHAIN_E = e(900, -260, { scale: 0.6, wrap: true }); // kit chain n 3 "公链" (wrap 0.6!)
export const FUNNEL = e(420, 0, { scale: 0.7, wrap: true });     // E03 hashFunnel 输入 "邮箱" (wrap 0.7!)
export const GPU = e(200, 220, { scale: 0.6, wrap: true });      // E02 gpuRig "枚举机" (wrap 0.6!)
export const SALT = e(580, 220);                                 // E24 saltShaker label "盐 · 32 字节" (scale 1)
export const COMMIT = e(760, 60, { scale: 0.7 });                // E09 commitBox 0.7 "承诺"
export const KEY_E = e(980, 220, { scale: 0.7, wrap: true });    // kit key "解密密钥" (wrap 0.7!), red-X destroyed in seg5 L21
export const PADLOCK_E = e(1120, 200, { scale: 0.7, wrap: true }); // kit padlock 锁住"密文"卡 (wrap 0.7!)
export const RACK_E = e(1180, -20, { scale: 0.6, wrap: true });  // kit rack "节点" (wrap 0.6!), 密文副本仍在

// ---- path: light slate strip along +u through A → E (native SVG, draw under everything); main data pipe runs on v = 0
export const ROAD = { u0: -1600, u1: 14800, v0: -110, v1: 110 };

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 (measured from the rendered SVGs in
// earlier episodes: visible geometry only; lottery and saltShaker measured here). [x0, y0, x1, y1]; y0 includes signs / heads.
// docStanding / envelope / letter are for the default size (doc 200×260) — rect() scales docs by w/200; envelopes are listed per size.
export const EXT = {
  signPlate: [-136, -242, 109, 50], person: [-50, -208, 50, 7], personAtk: [-50, -229, 50, 7], phone: [-70, -195, 58, 27],
  addrPlate: [-56, -174, 57, 10], hwWallet: [-73, -62, 90, 33], parcel: [-38, -56, 38, 18], simCard: [-36, -70, 36, 16],
  env90: [-53, -25, 53, 25], env110: [-65, -30, 65, 30], docStanding: [-84, -261, 82, 23], manual: [-137, -94, 132, 64],
  dbLedger: [-76, -159, 76, 37], desk: [-147, -272, 147, 74], oddCoin: [-39, -109, 39, 18], padlock: [-56, -138, 62, 28],
  key: [-75, -35, 84, 31], beacon: [-61, -118, 61, 30], bucket: [-76, -164, 76, 28], letter: [-28, -56, 26, 0],
  magnifier: [-58, -260, 120, -105], chain4: [-287, -197, 287, 110], chain3: [-213, -171, 213, 85],
  tellerCounter: [-228, -343, 241, 92], lottery: [-150, -260, 150, 96], clock: [-76, -193, 61, 2], balance: [-163, -258, 163, 40],
  shield: [-68, -218, 64, 28], checkpoint: [-213, -305, 284, 143], dispatchDesk: [-113, -147, 113, 44], seal: [-146, -142, 147, 69],
  timeLock: [-64, -182, 64, 27], keycard: [-28, -85, 26, 9], hashFunnel: [-111, -294, 111, 54], gpuRig: [-143, -349, 143, 56],
  saltShaker: [-27, -95, 27, 14], commitBox: [-94, -175, 95, 40], rack: [-113, -349, 113, 51],
  listA: [-200, -180, 200, 0], bankA: [-60, -80, 60, 0], bookChain: [-200, -60, 200, 0], vaultB: [0, 0, 290, 200], dotsB: [0, 0, 240, 150],
  dotsC1: [0, 0, 340, 150], dotsC3: [0, 0, 240, 150], dotsC4: [0, 0, 220, 120], forumC: [-80, -70, 80, 0], txD: [-40, -40, 40, 0], darkwebE: [-70, -60, 70, 0],
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
  signA: rect(SIGN_A, "signPlate"), userA: rect(USER_A, "person"), phoneA: rect(PHONE_A, "phone"), addrA: rect(ADDR_A, "addrPlate"),
  hwA: rect(HW_A, "hwWallet"), parcelA: rect(PARCEL_A, "parcel"), simA: rect(SIM_A, "simCard"), envA: ENV_A.map((q) => rect(q, "env90")),
  wlA: rect(WL_A, "docStanding"), atkCall: rect(ATK_CALL, "personAtk"), atkDoor: rect(ATK_DOOR, "personAtk"), listA: rect(LIST_A, "listA"),
  manual: rect(MANUAL, "manual"), bankA: rect(BANK_A, "bankA"), bookChain: rect(BOOK_CHAIN, "bookChain"),
  signB: rect(SIGN_B, "signPlate"), ledger: rect(LEDGER, "dbLedger"), desks: DESKS.map((q) => rect(q, "desk")), agents: AGENTS.map((q) => rect(q, "person")),
  recruiter: rect(RECRUITER, "personAtk"), bribe: rect(BRIBE, "env110"), bribeCoins: BRIBE_COINS.map((q) => rect(q, "oddCoin")),
  stack: rect(STACK_B, "docStanding"), vault: rect(VAULT_B, "vaultB"), padlockB: rect(PADLOCK_B, "padlock"), keyB: rect(KEY_B, "key"),
  beaconB: rect(BEACON_B, "beacon"), dotsB: rect(DOTS_B, "dotsB"),
  signC: rect(SIGN_C, "signPlate"), plates: STALL_PLATES.map((q) => rect(q, "signPlate")), parcelsC: PARCELS_C.map((q) => rect(q, "parcel")),
  orderDoc: rect(ORDER_DOC, "docStanding"), phoneC: rect(PHONE_C, "phone"), simC: rect(SIM_C, "simCard"), credDoc: rect(CRED_DOC, "docStanding"),
  bucket: rect(BUCKET_C, "bucket"), ticketDoc: rect(TICKET_DOC, "docStanding"), letters: LETTERS_C.map((q) => rect(q, "letter")),
  magC: rect(MAG_C, "magnifier"), atkC: rect(ATK_C, "personAtk"), dotsC: [rect(DOTS_C[0], "dotsC1"), rect(DOTS_C[1], "dotsC3"), rect(DOTS_C[2], "dotsC4")], forum: rect(FORUM_C, "forumC"),
  signD: rect(SIGN_D, "signPlate"), chainD: rect(CHAIN_D, "chain4"), addrD: ADDR_D.map((q) => rect(q, "addrPlate")), magD: rect(MAG_D, "magnifier"),
  teller: rect(TELLER_D, "tellerCounter"), lottery: rect(LOTTERY_D, "lottery"), clockD: rect(CLOCK_D, "clock"), phoneD: rect(PHONE_D, "phone"),
  people: PEOPLE_D.map((q) => rect(q, "person")), coinsIn: COINS_IN.map((q) => rect(q, "oddCoin")), tx: rect(TX_D, "txD"),
  coinsOut: COINS_OUT.map((q) => rect(q, "oddCoin")), signCourt: rect(SIGN_COURT, "signPlate"), balance: rect(BALANCE, "balance"),
  magCourt: rect(MAG_COURT, "magnifier"), docsCourt: DOCS_COURT.map((q) => rect(q, "docStanding")),
  signE1: rect(SIGN_E1, "signPlate"), deskE: rect(DESK_E, "desk"), shieldE: rect(SHIELD_E, "shield"), ckptE: rect(CKPT_E, "checkpoint"),
  dispatch: rect(DISPATCH_E, "dispatchDesk"), beaconE: rect(BEACON_E, "beacon"), sealE: rect(SEAL_E, "seal"), docsE: DOCS_E.map((q) => rect(q, "docStanding")),
  tlock: rect(TIMELOCK_E, "timeLock"), keycard: rect(KEYCARD_E, "keycard"), listE: rect(LIST_E, "docStanding"), darkweb: rect(DARKWEB_E, "darkwebE"),
  signE2: rect(SIGN_E2, "signPlate"), chainE: rect(CHAIN_E, "chain3"), funnel: rect(FUNNEL, "hashFunnel"), gpu: rect(GPU, "gpuRig"),
  salt: rect(SALT, "saltShaker"), commit: rect(COMMIT, "commitBox"), keyE: rect(KEY_E, "key"), padlockE: rect(PADLOCK_E, "padlock"), rackE: rect(RACK_E, "rack"),
};
// (BRIBE_COINS, PADLOCK_B / KEY_B (inside VAULT_B) and MAG_COURT overlay other objects on purpose; the overlap check skips them)
export const ZONE_RECTS = {
  A: [R.signA, R.userA, R.phoneA, R.addrA, R.hwA, R.parcelA, R.simA, ...R.envA, R.wlA, R.atkCall, R.atkDoor, R.listA, R.manual, R.bankA, R.bookChain],
  B: [R.signB, R.ledger, ...R.desks, ...R.agents, R.recruiter, R.bribe, R.stack, R.vault, R.beaconB, R.dotsB],
  C: [R.signC, ...R.plates, ...R.parcelsC, R.orderDoc, R.phoneC, R.simC, R.credDoc, R.bucket, R.ticketDoc, ...R.letters, R.magC, R.atkC, ...R.dotsC, R.forum],
  D: [R.signD, R.chainD, ...R.addrD, R.magD, R.teller, R.lottery, R.clockD, R.phoneD, ...R.people, ...R.coinsIn, R.tx, ...R.coinsOut,
    R.signCourt, R.balance, ...R.docsCourt],
  E: [R.signE1, R.deskE, R.shieldE, R.ckptE, R.dispatch, R.beaconE, R.sealE, ...R.docsE, R.tlock, R.keycard, R.listE, R.darkweb,
    R.signE2, R.chainE, R.funnel, R.gpu, R.salt, R.commit, R.keyE, R.padlockE, R.rackE],
};
const Z = ZONE_RECTS;
const SAFE_R = [100, 280, 1820, 860];                    // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for cards at the sides
const LEFT = [160, 300, 1340, 860];                      // keeps the right third free for the 题卡 (seg1 L8–L13, seg6 L6–L10)
const STALL = (i, extra = []) => fit([R.plates[i], ...extra], MID, 1.4);
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur).
export const CAMS = {
  // A 用户 + 来电手机 + 信箱 + 硬件钱包 + 包裹 + SIM + 两只邮箱 + 白名单 + 两个攻击者，右侧留给题卡（seg1 L8–L13 终点；seg2 起点、L8–L12；seg6 L2–L10）
  homeA: fit([R.userA, R.phoneA, R.addrA, R.hwA, R.parcelA, R.simA, ...R.envA, R.wlA, R.atkCall, R.atkDoor], LEFT, 1.4),
  // A–B 之间的肥羊通讯录 + 银行流水卡 + 上方链条 + 用户家（seg2 L3–L7 比喻）
  bookA: fit([R.manual, R.bankA, R.bookChain, R.userA, R.phoneA, R.addrA, R.listA], SAFE_R, 1.4),
  // B 三个客服工位 + 客服后台 + 招募者 + 收买信封 + 导出摞 + 密码私钥框 + 点阵（seg1 起点 L0–L7）
  callB: fit([R.ledger, ...R.desks, ...R.agents, R.recruiter, R.bribe, R.stack, R.vault, R.dotsB], SAFE_R, 1.4),
  // B 客服后台特写 + 导出摞 + 密码私钥框 + 收买信封 + 客服 2 工位（seg2 L13–L19 终点；seg3 起点；seg6 L0–L1）
  backB: fit([R.ledger, R.stack, R.vault, R.desks[1], R.agents[1], R.bribe], MID, 1.4),
  // C 四个摊位全景 + 点阵 + 论坛牌，支管从左边 B 接过来（seg3 L0–L1、L5–L6）
  streetC: fit([R.signC, ...R.plates, ...R.parcelsC, R.orderDoc, R.phoneC, R.simC, R.credDoc, R.bucket, R.ticketDoc, ...R.letters, R.atkC, ...R.dotsC, R.forum], SAFE_R, 1.4),
  // C 摊位近景 ①–④（seg3 L2–L8 / L9–L12 / L13–L15 / L16–L18），①③④ 含各自的点阵 DOTS_C[0..2]
  stall1C: STALL(0, [...R.parcelsC, R.orderDoc, R.forum, R.dotsC[0]]),
  stall2C: STALL(1, [R.phoneC, R.simC, R.credDoc]),
  stall3C: STALL(2, [R.bucket, R.ticketDoc, R.dotsC[1]]),
  stall4C: STALL(3, [...R.letters, R.dotsC[2]]),
  // C 放大镜停在一个摊位上，四家都在画内（seg3 L19 终点；seg4 起点）
  weakC: fit([...R.plates, ...R.parcelsC, R.orderDoc, R.phoneC, R.simC, R.credDoc, R.bucket, R.ticketDoc, ...R.letters, R.magC], MID, 1.4),
  // D 链 + 四个地址 + 放大镜 + 交易所柜台 + 混币器 + 时钟 + 社交页手机（seg4 L0–L10）
  plazaD: fit([R.chainD, ...R.addrD, R.magD, R.teller, R.lottery, R.clockD, R.phoneD], SAFE_R, 1.4),
  // D 四个人 + 4 进 4 出的币 + 交易节点（seg4 L11–L14）
  coinjoinD: fit([...R.people, ...R.coinsIn, R.tx, ...R.coinsOut], MID, 1.4),
  // D 法庭天平 + 判决 / 上诉维持 + 放大镜落点 + 混币器 + 交易所柜台（seg4 L15–L23 终点；seg5 起点）
  courtD: fit([R.signCourt, R.balance, R.magCourt, ...R.docsCourt, R.lottery, R.teller], SAFE_R, 1.4),
  // E 控制室全部防御物件（遮蔽屏幕、最小权限、导出审批、查询登记、告警、水印、合同 / 通知、提币冷却、工单权限、数据清单、暗网牌）；
  //   左边缘就是通回 B 的方向（seg5 L0–L13）
  ctrlE: fit([R.deskE, R.shieldE, R.ckptE, R.dispatch, R.beaconE, R.sealE, ...R.docsE, R.tlock, R.keycard, R.listE, R.darkweb], SAFE_R, 1.4),
  // E 链上档案：公链、哈希漏斗、枚举机、盐罐、承诺箱、密钥、挂锁、节点（seg5 L14–L21 终点；seg6 起点）
  archiveE: fit([R.chainE, R.funnel, R.gpu, R.salt, R.commit, R.keyE, R.padlockE, R.rackE], SAFE_R, 1.4),
  // 各区全景（pans pass through them）
  A: fit(Z.A, SAFE_R, 1.4),
  B: fit(Z.B, SAFE_R, 1.4),
  C: fit(Z.C, SAFE_R, 1.4),
  D: fit(Z.D, SAFE_R, 1.4),
  E: fit(Z.E, SAFE_R, 1.4),
  // 整条数据街全景：A → E（seg6 L11–L12 结束卡）
  wide: fit([...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E], [60, 200, 1860, 860], 1),
};
// world: everything the segments need to size grid / box
export const world = { ZU, ZONE_ANCHOR, ROAD, rects: R };
