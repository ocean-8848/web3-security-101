// ep21「公司园区」shared world layout — one continuous isometric world, fixed for all six segments:
//   import * as L from "../../shared/layout.mjs";   (from ep21/segN/src/build-story.mjs)
//   A 招聘角: RECRUITER, PHONE_A, PARCEL_A, PASS_A, ENV_A, HIRE_SIGN
//   B 门禁与人事: GATE, ROLEBOARD, LEAVE, PASS_B, MAG, LOGBOOK, REPORT, REPORT_ENV, ATK_B, DOTS_B
//   C 工程师工位: LAPTOP, ENGS, DESKS, RACK, TOKEN, BROWSER_C, HWKEY_C, ISO, SHIELD_C, PARCEL_C, PARCEL_ROW, DOTS_C
//   D 签名室: VAULT, METER, SIGNERS, LAPTOPS_D, HWS_D, FRONTEND, KEYS_D, LETTERS, PHONE_D, SEAL, CHEQUE, DOTS_D
//   E 会议室: MDESK, MLAPTOP, EXEC, HOTSAFE_E, GRASS
//   F 客服柜台: TELLER, DB, ATK_F, OPSDESK, OPSSAFE, BEACON_F, DOTS_F
//   G 用户家: HLAPTOP, USER, HPHONE, HHW, APPSIGN
//   path: ROAD · framing: EXT, rect, fit, ZONE_RECTS, CAMS, world
// Positions only; ids, states, labels and per-shot opts stay in each segment. Object ids must never be `cam` or `root`.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Every position is written as a zone-local screen offset: the world point whose ground lands on world-canvas px (anchor + (X, Y))
// (iso.G, rounded) — so the numbers read as on-screen ground offsets at camera scale 1. `scale` = the opts.scale to pass to the object.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): of the objects used here only kit person / ledgerBook, E04 tellerCounter, E05 keycard,
//   E07 parcel, E09 cheque, E13 passport / container take opts.scale. Everything else IGNORES it. Where an object carries
//   `scale` + `wrap: true` below (C desks 0.75, rack 0.6, browserWin 0.5; D laptops 0.6, browserWin 0.7, phone 0.7; E hot safe 0.6;
//   F desk 0.7, dbLedger 0.7, hot safe 0.6; G laptop 0.8; B roleBoard 0.7) the segment MUST put it with the wrap helper
//   (translate · scale · translate around its ground point) and rescale its anchors; rect() / CAMS already assume the scaled size.
// Keycards (E05 keycard): A 招聘者胸前 0.35 (pin to the recruiter's chest), B 权限板上 0.4 (hang on ROLEBOARD's slots) — no own ground point.
// The slate path runs along +u (screen: up-right), zones left → right A · B · C · D · E · F · G, every zone anchor on the path centre v = 0.
// Neighbouring zones are ≥ ~400 canvas px apart edge to edge in X (layout check, see ZONE_RECTS); per-zone framings hold only their zone.
// Native-SVG areas (dot matrices, the parcel row) are a ground origin + a box kind in EXT, so the segment knows where it may draw them.
import { Wp, G, camAt, CE } from "../../kit/iso.mjs";

/** world ground point for world-canvas px (X, Y); extra fields (scale, z, wrap …) copied in */
const S = (X, Y, extra = {}) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
/** zone-local placer: positions below are written relative to the zone's anchor px */
const zone = (OX, OY) => (X, Y, extra) => S(OX + X, OY + Y, extra);
const road = (u) => Wp(u, 0);                            // zone anchor px on the path centre line
const ZU = { A: 0, B: 1750, C: 3950, D: 6950, E: 8950, F: 10650, G: 12650 };
export const ZONE_ANCHOR = Object.fromEntries(Object.entries(ZU).map(([k, u]) => [k, road(u).map(Math.round)]));

// ---- A 最左·招聘角（园区门外）(seg1 L0–L3; seg2 L12–L13; seg3 L0–L2, L16–L18; seg4 L10–L11): anchor = recruiter
const a = zone(...ZONE_ANCHOR.A);
export const RECRUITER = a(0, 0, { scale: 0.55 });        // kit person attacker 0.55 "招聘者" (E05 keycard "HR" 0.35 on the chest)
export const PHONE_A = a(-200, 40);                       // kit phone (original size): "面试邀约" → video call → "高薪岗位 · 先做个测试"
export const PARCEL_A = a(170, 80, { scale: 0.7 });       // E07 parcel 0.7 "作业" (seg1 L4 slides along the path to PARCEL_C)
export const PASS_A = a(320, 20, { scale: 0.6 });         // E13 passport fake 0.6 "冒名身份" (seg4)
export const ENV_A = a(260, 180);                         // kit envelope "zip" (seg3 L16 Radiant)
export const HIRE_SIGN = a(-120, -200);                   // E01 signBoard wood "高薪岗位"

// ---- B 左中·门禁与人事（园区大门）(seg4 L10–L14; seg5 L11–L19 终点; seg6 起点): anchor = checkpoint
const b = zone(...ZONE_ANCHOR.B);
export const GATE = b(0, 0);                              // kit checkpoint n "入" (original size; barrier lifts in seg1 L4 / seg4 L11)
export const ROLEBOARD = b(-480, -120, { scale: 0.7, wrap: true }); // E05 roleBoard "权限板" (wrap 0.7!), keycards 0.4: 代码仓库 / 云 / CI / npm / 域名 / 社交账号 / 多签
export const LEAVE = b(-560, 200);                        // kit doc standing "离职清单"
export const PASS_B = b(380, 260, { scale: 0.8 });        // E13 passport 0.8 (核验, three check rows)
export const MAG = b(500, 300);                           // kit magnifier (核验)
export const LOGBOOK = b(-250, 330, { scale: 0.6 });      // kit ledgerBook 0.6 "访问日志"
export const REPORT = b(520, -150);                       // E01 signBoard plate "匿名报告"
export const REPORT_ENV = b(560, -40);                    // kit envelope (the report dropped in)
export const ATK_B = b(220, 330, { scale: 0.5 });         // kit person attacker 0.5 (seg4 L11 walks through the gate with the fake passport)
export const DOTS_B = b(-130, 400);                       // dot matrix area: seg4 L14 74 dots (1 dot ≈ 1 万美元), EXT.dotsB

// ---- C 中左·工程师工位 (seg1 L4–L11 终点; seg2 起点 L0–L2; seg3 L3–L15; seg5 L1–L4; seg6 L8–L13): anchor = hero laptop
const c = zone(...ZONE_ANCHOR.C);
export const LAPTOP = c(0, 0);                            // kit laptop "工作电脑" (HERO, original size)
export const ENGS = [c(-230, 110), c(-660, 140), c(400, 120)].map((q) => ({ ...q, scale: 0.5 })); // kit person engineer ×3 0.5 ([0] beside the hero laptop)
export const DESKS = [c(-560, -30), c(460, -60), c(-80, -430)].map((q) => ({ ...q, scale: 0.75, wrap: true })); // kit desk ×3 "代码" (wrap 0.75!) — [0] left (seg3 "Ginco"), [1] right
export const RACK = c(820, -300, { scale: 0.6, wrap: true }); // kit rack tag "部署系统" (wrap 0.6!)
export const TOKEN = c(820, -170);                        // kit key "部署令牌" (seg1 L7 taken by a red attacker)
export const BROWSER_C = c(-380, -330, { scale: 0.5, wrap: true }); // kit browserWin (wrap 0.5!): cookie / SSH 密钥 / 钱包 icons
export const HWKEY_C = c(200, 170);                       // kit hwWallet "硬件密钥"
export const ISO = c(700, 180, { scale: 0.5 });           // E13 container 0.5 label "隔离环境"
export const SHIELD_C = c(-420, 300);                     // kit shield "终端防护" (seg6 L10 stays grey)
export const PARCEL_C = c(230, 30, { scale: 0.7 });       // E07 parcel 0.7 "作业" resting beside the hero laptop
export const PARCEL_ROW = c(-100, 420);                   // seg3 L13 row of parcels (0.6) along +u, EXT.parcelRow
export const DOTS_C = c(-170, 230);                       // dot matrix area: seg1 L8 63 dots (≈ 1 亿美元), seg3 L10 31 dots (≈ 1000 万美元), EXT.dotsC

// ---- D 中间·签名室 (seg2 L3–L10; seg3 L18–L21 终点; seg4 起点; seg5 L5–L10): anchor = vault
const d = zone(...ZONE_ANCHOR.D);
export const VAULT = d(0, 0);                             // kit safe plate "多签金库" (original size; seg2 three door frames in front, native SVG)
export const METER = d(300, -40);                         // E05 thresholdMeter (original size)
export const SIGNERS = [d(-740, 240), d(-480, 290), d(-220, 340)].map((q) => ({ ...q, scale: 0.5 })); // kit person signer ×3 0.5
export const LAPTOPS_D = [d(-760, 420), d(-500, 470), d(-240, 520)].map((q) => ({ ...q, scale: 0.6, wrap: true })); // kit laptop ×3 (wrap 0.6!) in front of the signers
export const HWS_D = [d(-640, 200), d(-380, 250), d(-120, 300)]; // kit hwWallet ×3, one right of each signer
export const FRONTEND = d(-560, -160, { scale: 0.7, wrap: true }); // kit browserWin title "多签前端" (wrap 0.7!) — three dashed lines from LAPTOPS_D
export const KEYS_D = [d(-1040, 120), d(-1000, 200), d(-960, 280)]; // kit key ×3 掌钥人钥匙 (metaphor; walk them to the signers)
export const LETTERS = [d(-1100, -60), d(-1040, -20), d(-980, 20)]; // E01 letter ×3 "老同事的来信" (walk them to the signers)
export const PHONE_D = d(560, 200, { scale: 0.7, wrap: true }); // kit phone "预登记电话" (wrap 0.7!)
export const SEAL = d(320, 240);                          // kit seal 审批章
export const CHEQUE = d(80, 420, { scale: 0.9 });         // E09 cheque 0.9 fields 发起 / 审批 / 执行 / 审计 (seg5 L9: signers + an extra person the segment brings in)
export const DOTS_D = d(180, 340);                        // dot matrix area: seg3 L21 50 dots (≈ 100 万美元), EXT.dotsD

// ---- E 中右·会议室 (seg2 L14; seg4 L0–L9): anchor = meeting desk
const e = zone(...ZONE_ANCHOR.E);
export const MDESK = e(0, 0);                             // kit desk 会议桌 (original size)
export const MLAPTOP = e(330, 120);                       // kit laptop (original size): video call two tiles, "Zoom 请求控制你的屏幕" popup (native SVG)
export const EXEC = e(-260, 160, { scale: 0.55 });        // kit person signer 0.55 "高管"
export const HOTSAFE_E = e(-480, -80, { scale: 0.6, wrap: true }); // kit safe variant hot (wrap 0.6!) 钱包 (seg4 L7 opens)
export const GRASS = e(-420, 240, { scale: 0.6 });        // E07 parcel 0.6 "GrassCall" (seg4 L9 red)

// ---- F 右中·客服柜台 (seg2 L15; seg4 L15–L20 终点; seg5 起点, L17 beacon inset): anchor = teller counter
const g6 = zone(...ZONE_ANCHOR.F);
export const TELLER = g6(0, 0, { scale: 0.7 });           // E04 tellerCounter 0.7 外包客服柜台 (its own cash = 收买)
export const DB = g6(-380, -140, { scale: 0.7, wrap: true }); // kit dbLedger tag "用户数据" (wrap 0.7!)
export const ATK_F = g6(-140, 220, { scale: 0.5 });       // kit person attacker 0.5 (pushes cash across the counter)
export const OPSDESK = g6(480, -40, { scale: 0.7, wrap: true }); // kit desk "运营电脑" (wrap 0.7!) CoinDCX
export const OPSSAFE = g6(560, 240, { scale: 0.6, wrap: true }); // kit safe variant hot "运营钱包" (wrap 0.6!)
export const BEACON_F = g6(-420, 180);                    // kit beacon 异常查询告警 (seg5 L17)
export const DOTS_F = g6(150, 300);                       // dot matrix area: seg4 L20 44 dots (≈ 100 万美元), EXT.dotsF

// ---- G 最右·用户家（园区外）(seg6 L0–L7): anchor = user laptop
const h = zone(...ZONE_ANCHOR.G);
export const HLAPTOP = h(0, 0, { scale: 0.8, wrap: true }); // kit laptop "存钱包的电脑" (wrap 0.8!)
export const USER = h(-240, 110, { scale: 0.6 });         // kit person signer 0.6 普通用户
export const HPHONE = h(-460, 20);                        // kit phone (original size) 来电"客服"
export const HHW = h(220, 140);                           // kit hwWallet
export const APPSIGN = h(380, -160);                      // E01 signBoard plate "官方 App"

// ---- path: light slate strip along +u through every zone anchor (native SVG, draw under everything)
export const ROAD = { u0: -900, u1: 13600, v0: -110, v1: 110 };

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 (measured from the rendered SVGs in
// earlier episodes: visible geometry only). [x0, y0, x1, y1]; y0 includes signs / heads. Native-SVG boxes are from their ground origin.
export const EXT = {
  person: [-50, -208, 50, 7], personAtk: [-50, -229, 50, 7], phone: [-70, -195, 58, 27], parcel: [-38, -56, 38, 18], passport: [-29, -76, 29, 12],
  envelope: [-96, -47, 96, 45], signWood: [-94, -155, 94, 23], signPlate: [-136, -242, 109, 50], checkpoint: [-213, -305, 284, 143],
  roleBoard: [-194, -334, 187, 72], docStanding: [-84, -261, 82, 23], magnifier: [-58, -260, 120, -105], ledgerBook: [-158, -89, 158, 74],
  laptop: [-164, -234, 141, 66], desk: [-147, -272, 147, 74], rack: [-113, -349, 113, 51], key: [-75, -35, 84, 31], browserWin: [-201, -332, 201, 81],
  hwWallet: [-73, -62, 90, 33], container: [-108, -129, 108, 47], shield: [-68, -218, 64, 28], safe: [-180, -376, 181, 82], safeHot: [-117, -250, 117, 52],
  thresholdMeter: [-52, -290, 71, 26], letter: [-28, -56, 26, 0], seal: [-146, -142, 147, 69], cheque: [-75, -124, 74, 24],
  tellerCounter: [-228, -343, 241, 92], dbLedger: [-76, -159, 76, 37], beacon: [-61, -118, 61, 30],
  dotsB: [0, 0, 420, 130], dotsC: [0, 0, 420, 130], dotsD: [0, 0, 360, 110], dotsF: [0, 0, 300, 110], parcelRow: [-20, -40, 480, 20],
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
  rec: rect(RECRUITER, "personAtk"), phoneA: rect(PHONE_A, "phone"), parcelA: rect(PARCEL_A, "parcel"), passA: rect(PASS_A, "passport"),
  envA: rect(ENV_A, "envelope"), hire: rect(HIRE_SIGN, "signWood"),
  gate: rect(GATE, "checkpoint"), board: rect(ROLEBOARD, "roleBoard"), leave: rect(LEAVE, "docStanding"), passB: rect(PASS_B, "passport"),
  mag: rect(MAG, "magnifier"), log: rect(LOGBOOK, "ledgerBook"), report: rect(REPORT, "signPlate"), renv: rect(REPORT_ENV, "envelope"),
  atkB: rect(ATK_B, "personAtk"), dotsB: rect(DOTS_B, "dotsB"),
  laptop: rect(LAPTOP, "laptop"), engs: ENGS.map((q) => rect(q, "person")), desks: DESKS.map((q) => rect(q, "desk")), rack: rect(RACK, "rack"),
  token: rect(TOKEN, "key"), browserC: rect(BROWSER_C, "browserWin"), hwC: rect(HWKEY_C, "hwWallet"), iso: rect(ISO, "container"),
  shieldC: rect(SHIELD_C, "shield"), parcelC: rect(PARCEL_C, "parcel"), prow: rect(PARCEL_ROW, "parcelRow"), dotsC: rect(DOTS_C, "dotsC"),
  vault: rect(VAULT, "safe"), meter: rect(METER, "thresholdMeter"), signers: SIGNERS.map((q) => rect(q, "person")),
  laptopsD: LAPTOPS_D.map((q) => rect(q, "laptop")), hwsD: HWS_D.map((q) => rect(q, "hwWallet")), front: rect(FRONTEND, "browserWin"),
  keysD: KEYS_D.map((q) => rect(q, "key")), letters: LETTERS.map((q) => rect(q, "letter")), phoneD: rect(PHONE_D, "phone"), seal: rect(SEAL, "seal"),
  cheque: rect(CHEQUE, "cheque"), dotsD: rect(DOTS_D, "dotsD"),
  mdesk: rect(MDESK, "desk"), mlaptop: rect(MLAPTOP, "laptop"), exec: rect(EXEC, "person"), hotE: rect(HOTSAFE_E, "safeHot"), grass: rect(GRASS, "parcel"),
  teller: rect(TELLER, "tellerCounter"), db: rect(DB, "dbLedger"), atkF: rect(ATK_F, "personAtk"), ops: rect(OPSDESK, "desk"),
  opsSafe: rect(OPSSAFE, "safeHot"), beaconF: rect(BEACON_F, "beacon"), dotsF: rect(DOTS_F, "dotsF"),
  hlaptop: rect(HLAPTOP, "laptop"), user: rect(USER, "person"), hphone: rect(HPHONE, "phone"), hhw: rect(HHW, "hwWallet"), app: rect(APPSIGN, "signPlate"),
};
export const ZONE_RECTS = {
  A: [R.rec, R.phoneA, R.parcelA, R.passA, R.envA, R.hire],
  B: [R.gate, R.board, R.leave, R.passB, R.mag, R.log, R.report, R.renv, R.atkB, R.dotsB],
  C: [R.laptop, ...R.engs, ...R.desks, R.rack, R.token, R.browserC, R.hwC, R.iso, R.shieldC, R.parcelC, R.prow, R.dotsC],
  D: [R.vault, R.meter, ...R.signers, ...R.laptopsD, ...R.hwsD, R.front, ...R.keysD, ...R.letters, R.phoneD, R.seal, R.cheque, R.dotsD],
  E: [R.mdesk, R.mlaptop, R.exec, R.hotE, R.grass],
  F: [R.teller, R.db, R.atkF, R.ops, R.opsSafe, R.beaconF, R.dotsF],
  G: [R.hlaptop, R.user, R.hphone, R.hhw, R.app],
};
const Z = ZONE_RECTS;
const SAFE_R = [100, 280, 1820, 860];                    // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for cards at the sides
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur). Screen bboxes: see the layout check.
export const CAMS = {
  // A 招聘者 + 手机邀约 + 作业包裹 + 高薪牌（seg1 起点 L0–L3；seg3 L0–L2、L16–L17）
  inviteA: fit([R.rec, R.phoneA, R.parcelA, R.hire, R.envA], MID, 1.4),
  // C 工作电脑特写，右侧留题卡位（x > 1300）（seg1 L9–L11 终点；seg2 起点；seg3 L3；seg6 L8–L10）
  laptopC: fit([R.laptop, R.parcelC, R.engs[0]], [260, 300, 1240, 840], 2.0),
  // C 三张工位 + 工作电脑 + 部署系统机柜 + 部署令牌 + 员工（seg1 L4–L8；seg2 L0–L2；seg3 L8–L14；seg6 L11–L13）
  deskC: fit([R.laptop, ...R.desks, R.rack, R.token, ...R.engs, R.browserC, R.parcelC, R.dotsC], SAFE_R, 1.4),
  // C 隔离环境集装箱 + 三类设备（硬件密钥 / 工作电脑 / 工位）+ 包裹（seg5 L1–L4）
  isoC: fit([R.iso, R.hwC, R.laptop, R.parcelC, R.engs[2], R.desks[1]], MID, 1.4),
  // D 签名人 + 笔记本 + 多签前端 + 硬件钱包 + 门槛表（seg2 L3–L5、L10；seg3 L18–L21 终点；seg4 起点）
  signD: fit([...R.signers, ...R.laptopsD, ...R.hwsD, R.front, R.vault, R.meter, R.dotsD], SAFE_R, 1.4),
  // D 金库三门比喻：金库 + 三名签名人 + 三把钥匙 + 三封信（seg2 L6–L9）
  vaultD: fit([R.vault, ...R.signers, ...R.keysD, ...R.letters, ...R.hwsD], SAFE_R, 1.4),
  // D 支票四角色 + 电话 + 公章 + 签名人（seg5 L5–L10）
  flowD: fit([R.cheque, R.phoneD, R.seal, R.meter, R.signers[1], R.signers[2], R.hwsD[2]], MID, 1.4),
  // E 会议桌 + 笔记本弹窗 + 高管 + 热钱包 + GrassCall（seg4 L0–L9）
  meetE: fit(Z.E, MID, 1.4),
  // B 门禁 + 权限板 + 匿名报告 + 离职清单 + 访问日志（seg5 L11、L13–L19 终点；seg6 起点）
  gateB: fit([R.gate, R.board, R.leave, R.log, R.report, R.renv, R.passB, R.mag], SAFE_R, 1.4),
  // B 护照核验 + 放大镜 + 门禁 + 攻击者（+ 点阵）（seg4 L10–L14；seg5 L12）
  hireB: fit([R.passB, R.mag, R.gate, R.atkB, R.dotsB], MID, 1.4),
  // F 客服柜台 + 用户数据 + 攻击者 + 运营电脑 + 运营钱包 + 告警灯（seg4 L15–L20 终点；seg5 起点）
  counterF: fit(Z.F, SAFE_R, 1.4),
  // G 用户家（seg6 L0–L7）
  homeG: fit(Z.G, MID, 1.4),
  // 各区全景（pans pass through them）
  A: fit(Z.A, SAFE_R, 1.4),
  B: fit(Z.B, SAFE_R, 1.4),
  C: fit(Z.C, SAFE_R, 1.4),
  D: fit(Z.D, SAFE_R, 1.4),
  // 园区全景：A → G 全部（seg2 L11–L18 终点；seg3 起点；seg6 L14–L15 结束卡）
  wide: fit([...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E, ...Z.F, ...Z.G], [60, 200, 1860, 860], 1),
};
// world: everything the segments need to size grid / box
export const world = { ZU, ZONE_ANCHOR, ROAD, rects: R };
