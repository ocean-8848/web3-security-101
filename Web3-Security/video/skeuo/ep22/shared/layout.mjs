// ep22「从链上到家门口的一条街」shared world layout — one continuous isometric world, fixed for all six segments:
//   import * as L from "../../shared/layout.mjs";   (from ep22/segN/src/build-story.mjs)
//   A 链上: CHAIN, EXPLORER, MAG, CHAIN_SIGN
//   B 线索桌: CLUE_DESK, ATK_B, PUB_PHONE, KYC_DB, ORDER, TICKET, DOSSIER, ADDR_B, SLOTS_B
//   C 运营商门店: TELLER, PHONE_V, SIM_V, SIM_A, PHONE_A, FAKE_ID, CARRIER_SIGN, PORT_LOCK, ATK_C
//   D 账号广场: TOWER, POST, FANS, FAN_SAFES, LETTERS, ENTRIES, DOTS_D1, ACCT_LAPTOP, FIDO, ROLEBOARD, MAILBOX, PLAYBOOK,
//              STAFF_DESK, STAFF, STAFF_PHONE, EXCH_SAFE, DOTS_D2
//   E 家: DOOR_PLATE, HOME_DESK, HOLDER, FAMILY, MSIG_SAFE, TLOCK, CARRY_HW, CODE_PHONE, WINDOW, POSTER, WRENCH, GPU, DOTS_E, EVENTS
//   F 异地: REMOTE, REMOTE_LAPTOP, METER, REMOTE_SIGN
//   path: ROAD, GRASS · framing: EXT, rect, fit, ZONE_RECTS, CAMS, world
// Positions only; ids, states, labels and per-shot opts stay in each segment. Object ids must never be `cam` or `root`.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Every position is written as a zone-local screen offset: the world point whose ground lands on world-canvas px (anchor + (X, Y))
// (iso.G, rounded) — so the numbers read as on-screen ground offsets at camera scale 1. `scale` = the opts.scale to pass to the object.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): of the objects used here only kit person / ledgerBook, E04 tellerCounter, E05 keycard,
//   E07 parcel, E13 passport, E17 viewWindow and ep22 simCard / wrench take opts.scale. Everything else IGNORES it. Where an object carries
//   `scale` + `wrap: true` below (A chain 0.7, browserWin 0.6; B desk 0.75, phone 0.7, dbLedger 0.7, addrPlate 0.6; D tower 0.8,
//   browserWin 0.7, fan safes 0.45, roleBoard 0.7, staff desk 0.7, staff phone 0.7; E desk 0.8, safe 0.9, phone 0.7, gpuRig 0.7;
//   F laptop 0.6, thresholdMeter 0.8) the segment MUST put it with the wrap helper (translate · scale · translate around its ground point)
//   and rescale its anchors; rect() / CAMS already assume the scaled size.
// Keycards (E05 keycard 0.4) hang on ROLEBOARD's slots — no own ground point. Letters (E01 letter) fly from TOWER to FANS: LETTERS are
//   their landing points beside the fans. kit doc / envelope take w / h (sizes in comments); signBoard takes size / w.
// The slate path runs along +u (screen: up-right), zones left → right A · B · C · D · E · (grass) · F, every zone anchor on v = 0.
// Native-SVG areas (dot matrices, clue slots, entry plaques, event boards) are a ground origin + a box kind in EXT.
import { Wp, G, camAt, CE } from "../../kit/iso.mjs";

/** world ground point for world-canvas px (X, Y); extra fields (scale, z, wrap …) copied in */
const S = (X, Y, extra = {}) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
/** zone-local placer: positions below are written relative to the zone's anchor px */
const zone = (OX, OY) => (X, Y, extra) => S(OX + X, OY + Y, extra);
const road = (u) => Wp(u, 0);                            // zone anchor px on the path centre line
const ZU = { A: 0, B: 2000, C: 4300, D: 7300, E: 11300, F: 13300 };
export const ZONE_ANCHOR = Object.fromEntries(Object.entries(ZU).map(([k, u]) => [k, road(u).map(Math.round)]));

// ---- A 最左·链上 (seg2 L10–L12、L16): anchor = block explorer
const a = zone(...ZONE_ANCHOR.A);
export const CHAIN = a(-420, -60, { scale: 0.7, wrap: true });   // kit chain n 4 (wrap 0.7!)
export const EXPLORER = a(120, 20, { scale: 0.6, wrap: true });  // kit browserWin title "区块浏览器" (wrap 0.6!): 地址 + 余额条 + 三行交易历史
export const MAG = a(380, 120);                                  // kit magnifier (original size), sweeps the address
export const CHAIN_SIGN = a(-760, 200);                          // E01 signBoard plate "链上数据"

// ---- B 左中·线索桌 (seg2 L13–L19 终点; seg3 起点 L0; seg5 L5 远景): anchor = clue desk
const b = zone(...ZONE_ANCHOR.B);
export const CLUE_DESK = b(0, -40, { scale: 0.75, wrap: true }); // kit desk "线索桌" (wrap 0.75!), screen: 拼图式档案页
export const ATK_B = b(-200, 110, { scale: 0.5 });               // kit person attacker 0.5, at the desk
export const PUB_PHONE = b(-520, -20, { scale: 0.7, wrap: true }); // kit phone "公开信息" (wrap 0.7!): 照片 + 采访截图
export const KYC_DB = b(-560, 260, { scale: 0.7, wrap: true });  // kit dbLedger tag "KYC 数据" (wrap 0.7!)
export const ORDER = b(-300, 300, { scale: 0.6 });               // E07 parcel 0.6, waybill "订单"
export const TICKET = b(-60, 330);                               // kit doc title "客服工单" (default w / h)
export const DOSSIER = b(330, 170, { scale: 0.6 });              // kit ledgerBook 0.6 "目标档案" (rows "余额高" / "住址已知")
export const ADDR_B = b(500, -60, { scale: 0.6, wrap: true });   // E02 addrPlate text "住址" (wrap 0.6!), pulled to the dossier
export const SLOTS_B = b(0, -310);                               // three empty clue slots above the desk (native SVG), EXT.slotsB

// ---- C 中左·运营商门店 (seg1 L5–L11 终点; seg2 起点; seg3 L0–L8; seg5 L14; seg6 L9–L13): anchor = victim's SIM
const c = zone(...ZONE_ANCHOR.C);
export const TELLER = c(-560, -20, { scale: 0.75 });             // E04 tellerCounter 0.75 (clerk = 客服)
export const CARRIER_SIGN = c(-900, -200);                       // E01 signBoard plate "运营商"
export const FAKE_ID = c(-390, 210, { scale: 0.6 });             // E13 passport fake 0.6 "伪造证件"
export const PHONE_V = c(-150, -10);                             // kit phone "手机号" (victim, original size)
export const SIM_V = c(0, 90);                                   // ep22 simCard tone teal "SIM" (victim's card; 1.0 close-up, 0.6 on the counter)
export const SIM_A = c(200, 150);                                // ep22 simCard state attacker (new card, red)
export const PHONE_A = c(360, 20);                               // kit phone attacker (the attacker's new phone, original size)
export const ATK_C = c(560, 120, { scale: 0.55 });               // kit person attacker 0.55
export const PORT_LOCK = c(-120, 260);                           // kit padlock "号码转移锁" (lift it onto SIM_V with a translate in seg5 L14 / seg6 L14)

// ---- D 中间·账号广场 (seg1 起点 L0–L4; seg3 L9–L23 终点; seg4 起点; seg5 L12–L20 终点; seg6 起点 L6–L8): anchor = account laptop
const d = zone(...ZONE_ANCHOR.D);
export const TOWER = d(-1080, -60, { scale: 0.8, wrap: true });  // kit tower "官方账号" (wrap 0.8!), signal arcs = posting
export const POST = d(-720, -160, { scale: 0.7, wrap: true });   // kit browserWin title "官方 X 账号" (wrap 0.7!), one post card inside
export const FANS = [d(-1300, 230), d(-1160, 290), d(-1010, 320), d(-860, 310), d(-720, 270)].map((q) => ({ ...q, scale: 0.42 })); // kit person ×5 浅灰 0.42 "粉丝"
export const FAN_SAFES = [d(-1240, 420), d(-1040, 450), d(-840, 440)].map((q) => ({ ...q, scale: 0.45, wrap: true })); // kit safe variant hot ×3 (wrap 0.45!)
export const LETTERS = FANS.slice(0, 3).map((q) => ({ u: q.u + 40, v: q.v - 40 })); // E01 letter landing points (fly from TOWER)
export const ENTRIES = d(-900, -520);                            // four entry plaques / 15 account squares row (native SVG), EXT.entries
export const DOTS_D1 = d(-580, 360);                             // seg3 L14 / L18 dot matrix (69 / 50 dots), EXT.dotsD1
export const ACCT_LAPTOP = d(40, -40);                           // kit laptop "账号设置" (original size): MFA / 恢复方式 rows
export const FIDO = d(260, 110);                                 // kit hwWallet screenText "FIDO2" (original size) "硬件安全密钥"
export const ROLEBOARD = d(420, -260, { scale: 0.7, wrap: true }); // E05 roleBoard "关键人员" (wrap 0.7!), keycards 0.4: 创始人 / 签名人 / 运维 / 账号管理员
export const MAILBOX = d(-140, 230);                             // kit envelope "专用邮箱" (w 140 h 70)
export const PLAYBOOK = d(560, 120);                             // kit doc standing "被盗预案"
export const STAFF_DESK = d(1000, -20, { scale: 0.7, wrap: true }); // kit desk "交易所员工" (wrap 0.7!)
export const STAFF = d(800, 150, { scale: 0.5 });                // kit person engineer 0.5 "交易所员工"
export const STAFF_PHONE = d(1150, 200, { scale: 0.7, wrap: true }); // kit phone (wrap 0.7!) on / beside the desk ("特权凭证")
export const EXCH_SAFE = d(1400, -120);                          // kit safe plate "交易所" (original size)
export const DOTS_D2 = d(1150, 300);                             // seg3 L21 dot matrix (40 dots), EXT.dotsD2

// ---- E 中右·家 (seg2 L0–L10; seg4 全段 终点; seg5 起点 L0–L11; seg6 L0–L5): anchor = holder
const e = zone(...ZONE_ANCHOR.E);
export const DOOR_PLATE = e(-760, 60);                           // E02 addrPlate text "门牌" (original size)
export const POSTER = e(-1080, 120);                             // E01 signBoard wood "海报" (metaphor; three rows wiped in seg5 L1)
export const WINDOW = e(-560, -220, { scale: 0.6 });             // E17 viewWindow 0.6 (窗外小街：日常路线)
export const HOME_DESK = e(-250, -120, { scale: 0.8, wrap: true }); // kit desk (wrap 0.8!) 家里书桌
export const CODE_PHONE = e(-520, 230, { scale: 0.7, wrap: true }); // kit phone "暗号" (wrap 0.7!)
export const HOLDER = e(0, 80, { scale: 0.6 });                  // kit person signer 0.6 持币人
export const FAMILY = [e(-330, 150), e(-210, 220)].map((q) => ({ ...q, scale: 0.5 })); // kit person 浅灰 ×2 0.5 家属
export const CARRY_HW = e(120, 210);                             // kit hwWallet (original size) 随身设备
export const MSIG_SAFE = e(420, -160, { scale: 0.9, wrap: true }); // kit safe plate "多签" (wrap 0.9!) = the bank-grade "door"
export const TLOCK = e(700, -20);                                // E01 timeLock "时间锁"
export const GPU = e(560, 260, { scale: 0.7, wrap: true });      // E02 gpuRig "算力" (wrap 0.7!)
export const WRENCH = e(320, 330, { scale: 0.9 });               // ep22 wrench 0.9 (beside the gpuRig, seg2 L2–L4)
export const DOTS_E = e(-1000, -520);                            // seg4 L4–L5 four-row dot matrix (74 / 106 / 170 / 147), EXT.dotsE
export const EVENTS = e(-200, 620);                              // seg4 L8–L21 event boards (×4, native SVG), EXT.events

// ---- F 最右·异地 (seg5 L7、L10; seg6 L14): across a strip of grass; anchor = remote signer
const g = zone(...ZONE_ANCHOR.F);
export const REMOTE = g(0, 60, { scale: 0.55 });                 // kit person signer 0.55 "异地的另一人"
export const REMOTE_LAPTOP = g(220, 120, { scale: 0.6, wrap: true }); // kit laptop "另一台设备" (wrap 0.6!)
export const METER = g(-260, -80, { scale: 0.8, wrap: true });   // E05 thresholdMeter 两格：本人 + 异地 (wrap 0.8!)
export const REMOTE_SIGN = g(300, -160);                         // E01 signBoard plate "异地"

// ---- path: light slate strip along +u through A → E (native SVG, draw under everything); grass strip between E and F
export const ROAD = { u0: -1200, u1: 12300, v0: -110, v1: 110 };
export const GRASS = { u0: 12300, u1: 12900, v0: -400, v1: 400 };

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 (measured from the rendered SVGs in
// earlier episodes: visible geometry only; simCard / wrench from their geometry). [x0, y0, x1, y1]; y0 includes signs / heads.
// Native-SVG boxes are from their ground origin.
export const EXT = {
  chain: [-217, -173, 217, 86], browserWin: [-201, -332, 201, 81], magnifier: [-58, -260, 120, -105], signPlate: [-136, -242, 109, 50],
  desk: [-147, -272, 147, 74], person: [-50, -208, 50, 7], personAtk: [-50, -229, 50, 7], phone: [-70, -195, 58, 27], dbLedger: [-76, -159, 76, 37],
  parcel: [-38, -56, 38, 18], doc: [-156, -85, 156, 82], ledgerBook: [-158, -89, 158, 74], addrPlate: [-56, -174, 57, 10],
  tellerCounter: [-228, -343, 241, 92], passport: [-29, -76, 29, 12], padlock: [-56, -138, 62, 28], simCard: [-36, -70, 36, 16],
  tower: [-106, -417, 106, 53], safe: [-180, -376, 181, 82], safeHot: [-117, -250, 117, 52], laptop: [-164, -234, 141, 66], hwWallet: [-73, -62, 90, 33],
  roleBoard: [-194, -334, 187, 72], envelope: [-72, -36, 72, 34], docStanding: [-84, -261, 82, 23], timeLock: [-64, -182, 64, 27],
  viewWindow: [-78, -192, 88, 38], signWood: [-94, -155, 94, 23], gpuRig: [-143, -349, 143, 56], wrench: [-63, -60, 60, 26],
  thresholdMeter: [-52, -290, 71, 26],
  slotsB: [-240, -70, 240, 0], entries: [-380, -70, 380, 0], dotsD1: [0, 0, 380, 110], dotsD2: [0, 0, 300, 110], dotsE: [0, 0, 640, 170],
  events: [0, -150, 1000, 0],
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
  chain: rect(CHAIN, "chain"), explorer: rect(EXPLORER, "browserWin"), mag: rect(MAG, "magnifier"), chainSign: rect(CHAIN_SIGN, "signPlate"),
  clueDesk: rect(CLUE_DESK, "desk"), atkB: rect(ATK_B, "personAtk"), pubPhone: rect(PUB_PHONE, "phone"), kyc: rect(KYC_DB, "dbLedger"),
  order: rect(ORDER, "parcel"), ticket: rect(TICKET, "doc"), dossier: rect(DOSSIER, "ledgerBook"), addrB: rect(ADDR_B, "addrPlate"), slotsB: rect(SLOTS_B, "slotsB"),
  teller: rect(TELLER, "tellerCounter"), carrier: rect(CARRIER_SIGN, "signPlate"), fakeId: rect(FAKE_ID, "passport"), phoneV: rect(PHONE_V, "phone"),
  simV: rect(SIM_V, "simCard"), simA: rect(SIM_A, "simCard"), phoneA: rect(PHONE_A, "phone"), atkC: rect(ATK_C, "personAtk"), portLock: rect(PORT_LOCK, "padlock"),
  tower: rect(TOWER, "tower"), post: rect(POST, "browserWin"), fans: FANS.map((q) => rect(q, "person")), fanSafes: FAN_SAFES.map((q) => rect(q, "safeHot")),
  entries: rect(ENTRIES, "entries"), dotsD1: rect(DOTS_D1, "dotsD1"), acct: rect(ACCT_LAPTOP, "laptop"), fido: rect(FIDO, "hwWallet"),
  board: rect(ROLEBOARD, "roleBoard"), mail: rect(MAILBOX, "envelope"), playbook: rect(PLAYBOOK, "docStanding"),
  staffDesk: rect(STAFF_DESK, "desk"), staff: rect(STAFF, "person"), staffPhone: rect(STAFF_PHONE, "phone"), exch: rect(EXCH_SAFE, "safe"), dotsD2: rect(DOTS_D2, "dotsD2"),
  door: rect(DOOR_PLATE, "addrPlate"), poster: rect(POSTER, "signWood"), window: rect(WINDOW, "viewWindow"), homeDesk: rect(HOME_DESK, "desk"),
  codePhone: rect(CODE_PHONE, "phone"), holder: rect(HOLDER, "person"), family: FAMILY.map((q) => rect(q, "person")), carry: rect(CARRY_HW, "hwWallet"),
  msig: rect(MSIG_SAFE, "safe"), tlock: rect(TLOCK, "timeLock"), gpu: rect(GPU, "gpuRig"), wrench: rect(WRENCH, "wrench"), dotsE: rect(DOTS_E, "dotsE"),
  events: rect(EVENTS, "events"),
  remote: rect(REMOTE, "person"), remoteLaptop: rect(REMOTE_LAPTOP, "laptop"), meter: rect(METER, "thresholdMeter"), remoteSign: rect(REMOTE_SIGN, "signPlate"),
};
export const ZONE_RECTS = {
  A: [R.chain, R.explorer, R.mag, R.chainSign],
  B: [R.clueDesk, R.atkB, R.pubPhone, R.kyc, R.order, R.ticket, R.dossier, R.addrB, R.slotsB],
  C: [R.teller, R.carrier, R.fakeId, R.phoneV, R.simV, R.simA, R.phoneA, R.atkC, R.portLock],
  D: [R.tower, R.post, ...R.fans, ...R.fanSafes, R.entries, R.dotsD1, R.acct, R.fido, R.board, R.mail, R.playbook,
    R.staffDesk, R.staff, R.staffPhone, R.exch, R.dotsD2],
  E: [R.door, R.poster, R.window, R.homeDesk, R.codePhone, R.holder, ...R.family, R.carry, R.msig, R.tlock, R.gpu, R.wrench, R.dotsE, R.events],
  F: [R.remote, R.remoteLaptop, R.meter, R.remoteSign],
};
const Z = ZONE_RECTS;
const SAFE_R = [100, 280, 1820, 860];                    // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for cards at the sides
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur).
export const CAMS = {
  // A 区块链 + 区块浏览器 + 放大镜 + "链上数据"（seg2 L10–L12）
  chainA: fit(Z.A, MID, 1.4),
  // B 线索桌 + 三类线索 + 目标档案 + 住址牌（seg2 L13–L17、L19 终点；seg3 起点）
  linkB: fit(Z.B, SAFE_R, 1.4),
  // C SIM 卡 ×2 + 两部手机特写，题卡位置在右侧（seg1 L5–L11 终点；seg2 起点；seg3 L3–L8；seg6 L9–L13）
  simC: fit([R.phoneV, R.simV, R.simA, R.phoneA, R.portLock], [260, 300, 1380, 860], 1.6),
  // C 运营商柜台 + 伪造证件 + 号码转移锁 + 受害者手机 / 攻击者新卡（seg3 L0–L2；seg5 L14）
  counterC: fit([R.teller, R.carrier, R.fakeId, R.phoneV, R.simV, R.simA, R.portLock], SAFE_R, 1.4),
  // D 广播塔 + 官方账号帖子 + 粉丝 + 粉丝钱包 + 入口牌 + 点阵（seg1 起点 L0–L4；seg3 L9–L18）
  postD: fit([R.tower, R.post, ...R.fans, ...R.fanSafes, R.entries, R.dotsD1], SAFE_R, 1.4),
  // D 账号设置笔记本 + 硬件密钥 + 关键人员板 + 专用邮箱 + 被盗预案（seg5 L12–L20 终点；seg6 起点 L6–L8）
  acctD: fit([R.acct, R.fido, R.board, R.mail, R.playbook], MID, 1.4),
  // D 交易所员工工位 + 员工 + 手机 + 交易所金库 + 点阵（seg3 L19–L23 终点；seg4 起点）
  staffD: fit([R.staffDesk, R.staff, R.staffPhone, R.exch, R.dotsD2], MID, 1.4),
  // E 门牌 + 家（书桌 / 窗）+ 持币人 + 家属 + 海报 + 暗号手机 + 点阵（seg4 L0–L7、L16–L17、L21 终点；seg5 起点 L0–L5；seg6 L0–L5）
  homeE: fit([R.door, R.poster, R.window, R.homeDesk, R.codePhone, R.holder, ...R.family, R.carry, R.dotsE], SAFE_R, 1.4),
  // E 多签金库 + 时间锁 + 扳手 / 算力机比喻 + 持币人 + 随身设备（seg2 L0–L9；seg5 L6–L11）
  safeE: fit([R.msig, R.tlock, R.gpu, R.wrench, R.holder, R.carry], MID, 1.4),
  // E 门口旁的事件牌（seg4 L8–L15、L18–L20，"镜头稍右移"）
  eventsE: fit([R.events, R.door, ...R.family, R.holder, R.carry], SAFE_R, 1.4),
  // E 右侧（金库 / 时间锁 / 持币人）到草地对面的 F 异地（门槛表）（seg5 L7、L10）
  remoteF: fit([R.msig, R.tlock, R.holder, R.carry, ...Z.F], SAFE_R, 1.4),
  // 各区全景（pans pass through them）
  A: fit(Z.A, SAFE_R, 1.4),
  B: fit(Z.B, SAFE_R, 1.4),
  C: fit(Z.C, SAFE_R, 1.4),
  D: fit(Z.D, SAFE_R, 1.4),
  E: fit(Z.E, SAFE_R, 1.4),
  F: fit(Z.F, SAFE_R, 1.4),
  // 整条街全景：A → F（seg2 L18；seg6 L14–L15 结束卡）
  wide: fit([...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E, ...Z.F], [60, 200, 1860, 860], 1),
};
// world: everything the segments need to size grid / box
export const world = { ZU, ZONE_ANCHOR, ROAD, GRASS, rects: R };
