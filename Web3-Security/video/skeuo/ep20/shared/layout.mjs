// ep20「发布街」shared world layout — one continuous isometric world, fixed for all six segments:
//   import * as L from "../../shared/layout.mjs";   (from ep20/segN/src/build-story.mjs)
//   A 开发者工位: DESK, DEV, DOCKER, REPO, TOKEN · B 依赖与构建: CONV, PARCELS, NPM, PINLOCK, CI, MAINT, ATK_B, MAIL, LEAVE
//   C 托管与 CDN: BUCKET, EDGES, CDNSIGN, APIKEY, HOUR5, MAG, HASHLOG · D 域名路口: SIGNPOST, SIGN_ANG, REAL, CLONE, CERT, CERT2,
//   REGDESK, REGSIGN, ATK_D, LOCKS, HWKEY, BEACON, BACKUP, MIGCLOCK · E 用户端: BROWSER, USER, PHONE, CHEQUE, VEND, DOTS_E, CHECKLIST,
//   TELLER, VAULT, BANKBOOK, LETTERS · F 签名台: SAFE, CORE, METER, SAFEUI, SIGNERS, HWS, LAPTOP, SHIELD, CHECKPT, BYBIT, DOTS_F
//   street: ROAD, PIPE, STATIONS · framing: EXT, rect, fit, ZONE_RECTS, CAMS, world
// Positions only; ids, states, labels and per-shot opts stay in each segment. Object ids must never be `cam` or `root`.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Every position is written as a zone-local screen offset: the world point whose ground lands on world-canvas px (anchor + (X, Y))
// (iso.G, rounded) — so the numbers read as on-screen ground offsets at camera scale 1. `scale` = the opts.scale to pass to the object.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): of the objects used here only kit person / ledgerBook, E01 vending, E04 tellerCounter, E07 parcel,
//   E09 cheque, E10 coreModule, E13 container and ep20 dnsSignpost take opts.scale. Everything else IGNORES it. Where such an object carries
//   `scale` + `wrap: true` below (REPO dbLedger 0.7, CI rack 0.7, REAL / CLONE rack 0.7, REGDESK desk 0.8, VAULT safe 0.5, SAFEUI browserWin 0.7,
//   LAPTOP laptop 0.8) the segment MUST put it with the wrap helper (translate · scale · translate around its ground point) and rescale its
//   anchors; rect() / CAMS already assume the scaled size.
// The street runs along +u (screen: up-right), zones left → right A · B · C · D · E · F, every zone anchor sits on the road centre line v = 0.
//   A 开发者工位 u 0 · B 依赖与构建 u 1650 · C 托管与 CDN u 3300 · D 域名路口 u 5350 · E 用户端 u 7650 · F 签名台 u 9800.
// Neighbouring zones are ≥ ~250 canvas px apart edge to edge in X (see the layout check numbers next to ZONE_RECTS);
// the per-zone framings in CAMS hold only their own zone's key objects.
// NOTE seg1 L8 asks for D's signpost "画面右上角" while the camera is on E: on this street D lies LEFT-and-lower of E (A→F runs along +u),
//   so that moment needs an inset / picture-in-picture (or a wide move), not a single framing.
import { Wp, G, camAt, CE } from "../../kit/iso.mjs";

/** world ground point for world-canvas px (X, Y); extra fields (scale, z, wrap …) copied in */
const S = (X, Y, extra = {}) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
/** zone-local placer: positions below are written relative to the zone's anchor px */
const zone = (OX, OY) => (X, Y, extra) => S(OX + X, OY + Y, extra);
const road = (u) => Wp(u, 0);                            // zone anchor px on the road centre line
const ZU = { A: 0, B: 1650, C: 3300, D: 5350, E: 7650, F: 9800 };
export const ZONE_ANCHOR = Object.fromEntries(Object.entries(ZU).map(([k, u]) => [k, road(u).map(Math.round)]));

// ---- A 最左·开发者工位 (seg2 L12; seg5 L3–L5): anchor = desk
const a = zone(...ZONE_ANCHOR.A);
export const DESK = a(0, 0);                              // kit desk, screen "代码" (original size)
export const DEV = a(-190, 120, { scale: 0.55 });         // kit person engineer 0.55 "开发者"
export const DOCKER = a(260, -40, { scale: 0.5 });        // E13 container label "Docker" 0.5 (seg5 → state attacker)
export const REPO = a(-300, -60, { scale: 0.7, wrap: true }); // kit dbLedger tag "代码仓库" (wrap 0.7!)
export const TOKEN = a(220, 160);                         // kit key "AWS 会话令牌" (seg5: red attacker walks off with it — bring the attacker in from screen right)

// ---- B 左中·依赖与构建 (seg2 L12; seg4 L0–L13, L21–L23): anchor = conveyor centre (belt along +u: npm side −u, CI side +u)
const b = zone(...ZONE_ANCHOR.B);
export const CONV = b(0, 0, { len: 520 });                // E02 conveyor len 520 (deck z 74 = CONVEYOR_TOP)
export const PARCELS = [-180, -60, 60, 180].map((du) => ({ u: CONV.u + du, v: CONV.v, z: 92.5, scale: 0.8 })); // E07 parcel ×4 0.8 on the belt (z 92.5 × 0.8 = deck 74); slide along u
export const NPM = b(-420, -60);                          // E01 signBoard plate "npm 仓库" (packages drop from here onto the belt's −u end)
export const PINLOCK = b(-340, 140);                      // kit padlock "锁定版本" at the belt's entrance (−u end)
export const CI = b(400, -80, { scale: 0.7, wrap: true }); // kit rack tag "CI 构建" (wrap 0.7!) at the belt's +u end
export const MAINT = b(-80, 230, { scale: 0.5 });         // kit person engineer 0.5 "维护者"
export const ATK_B = b(-260, 290, { scale: 0.5 });        // kit person attacker 0.5
export const MAIL = b(-170, 350);                         // kit envelope "请重置 2FA" (walk it from ATK_B to MAINT)
export const LEAVE = b(380, 280);                         // kit doc standing "离职清单" (npm 一行漏打勾)

// ---- C 中间·托管与 CDN (seg2 L12; seg4 L14–L20, L24; seg5 L6, L22–L23): anchor = middle edge node
const c = zone(...ZONE_ANCHOR.C);
export const BUCKET = c(-380, 0);                         // kit bucket "S3" (exposed JS files; seg5 one turns red)
export const EDGES = [c(-60, -40), c(110, 0), c(280, 40)]; // kit rpc ×3 edge nodes in a row (original size)
export const CDNSIGN = c(170, -340);                      // E01 signBoard plate "CDN" behind / above the edge-node row
export const APIKEY = c(420, 170);                        // kit key "API Key" (seg4 red, L24 replaced by a green one)
export const HOUR5 = c(470, -60);                         // kit hourglass "约 5 小时" beside the edge nodes (seg4 L11)
export const MAG = c(-110, 270);                          // kit magnifier (hash compare; seg5 L23 the segment may add small ones in front of EDGES)
export const HASHLOG = c(150, 250, { scale: 0.7 });       // kit ledgerBook "版本哈希 + 访问日志" 0.7

// ---- D 中间偏右·域名路口 (seg1 L8; seg3 全段): anchor = signpost
const d = zone(...ZONE_ANCHOR.D);
export const SIGNPOST = d(0, 0);                          // ep20 dnsSignpost domain "curve.fi" (scale 1; dir 1 = arm points +u → REAL)
export const REAL = d(380, -90, { scale: 0.7, wrap: true });  // kit rack tag "真服务器" green (wrap 0.7!), on the arm's +u side
export const CLONE = d(-540, -60, { scale: 0.7, wrap: true }); // kit rack tag "克隆站" attacker, leds all red (wrap 0.7!), on the −u side
// arm angles (deg, for KITX20.turn) that point exactly at REAL / CLONE; flip (0 ↔ 180) is close enough for a quick cut
export const SIGN_ANG = Object.fromEntries([["real", REAL], ["clone", CLONE]].map(([k, q]) =>
  [k, (Math.round((Math.atan2(q.v - SIGNPOST.v, q.u - SIGNPOST.u) * 180) / Math.PI) + 360) % 360]));
export const CERT = d(560, 120);                          // kit doc standing "证书" (green lock badge) at REAL's door
export const CERT2 = d(-780, 40);                         // kit doc standing "证书" — the clone's identical copy (seg3 L6)
export const REGDESK = d(-150, 300, { scale: 0.8, wrap: true }); // kit desk "注册商" counter (wrap 0.8!)
export const REGSIGN = d(-420, 230);                      // E01 signBoard plate "注册商"
export const ATK_D = d(40, 400, { scale: 0.55 });         // kit person attacker 0.55 (walks to REGDESK in seg3 L2)
export const LOCKS = [d(170, 180), d(290, 230)];          // kit padlock ×2 "注册商锁" "注册局锁" (seg3 L17 lift them onto the signpost pole: A.sign.pole)
export const HWKEY = d(160, 340);                         // kit hwWallet "硬件密钥" (seg3 L18 plug into REGDESK)
export const BEACON = d(620, 300);                        // kit beacon (domain monitoring)
export const BACKUP = d(420, 420);                        // E01 signBoard wood "备用域名" / "新域名"
export const MIGCLOCK = d(-640, 440);                     // kit clock "迁移当天"

// ---- E 右中·用户端 (seg1 全段; seg2 L0–L10; seg6 L0–L4, L8–L11): anchor = hero browser
const e = zone(...ZONE_ANCHOR.E);
export const BROWSER = e(0, 0);                           // kit browserWin (HERO, original size): page = 真页面 curve.fi + 绿锁, page2 = 克隆页
export const USER = e(-300, 120, { scale: 0.6 });         // kit person signer 0.6 "用户"
export const PHONE = e(-430, 40);                         // kit phone (wallet, screen "授权？" / "签名？")
export const CHEQUE = e(270, 200, { scale: 0.9 });        // E09 cheque 0.9 "授权" (spender / 额度)
export const VEND = e(430, -60, { scale: 0.7 });          // E01 vending plate "已审计" 0.7 (always green)
export const DOTS_E = e(-200, 260);                       // dot matrix area (native SVG): seg1 L5 57 dots (1 dot ≈ 1 万美元), EXT.dotsE from here
export const CHECKLIST = e(650, 150);                     // kit doc standing "用户侧" checklist (seg6 L0)
// bank metaphor cluster (seg2 L6–L10), behind-left of the browser
export const TELLER = e(-650, -400, { scale: 0.7 });      // E04 tellerCounter 0.7 (the segment sticks a small kit doc "收款账号" on its glass)
export const VAULT = e(-330, -470, { scale: 0.5, wrap: true }); // kit safe small (wrap 0.5!) "金库"
export const BANKBOOK = e(-330, -330, { scale: 0.5 });    // kit ledgerBook 0.5 "账本"
export const LETTERS = [e(-900, -250), e(-860, -190), e(-820, -130)]; // E01 letter ×3 customer remittances (walk them to the sticker)

// ---- F 最右·签名台（多签）(seg5 L0–L2, L7–L21; seg6 L7): anchor = safe
const g = zone(...ZONE_ANCHOR.F);
export const SAFE = g(0, 0);                              // kit safe plate "冷钱包多签" (original size)
export const CORE = g(300, -40, { scale: 0.6 });          // E10 coreModule "实现合约" 0.6 (seg5 L11 swapped for a red one)
export const METER = g(450, -60);                         // E05 thresholdMeter (original size)
export const SAFEUI = g(-520, 60, { scale: 0.7, wrap: true }); // kit browserWin title "Safe 网页前端" (wrap 0.7!) — the single point
export const SIGNERS = [g(-620, 300), g(-460, 340), g(-300, 380)].map((q) => ({ ...q, scale: 0.5 })); // kit person signer ×3 0.5
export const HWS = [g(-620, 400), g(-440, 450), g(-260, 500)]; // kit hwWallet ×3 (one in front of each signer; screen "0x3f…a9")
export const LAPTOP = g(200, 300, { scale: 0.8, wrap: true }); // kit laptop "独立工具" (wrap 0.8!)
export const SHIELD = g(500, 230);                        // kit shield "普通调用"
export const CHECKPT = g(800, 200);                       // kit checkpoint "委托调用 · 单独审批"
export const BYBIT = g(-420, -260);                       // E01 signBoard plate "Bybit 多签地址"
export const DOTS_F = g(-100, 470);                       // dot matrix area: seg5 L1 150 dots (1 dot ≈ 1000 万美元), EXT.dotsF from here

// ---- street: road strip + pipe along +u, behind the zones' front rows
export const ROAD = { u0: -900, u1: 10900, v0: -110, v1: 110 };   // native SVG ground strip (light slate), draw under everything
export const PIPE_V = -160, PIPE_Z = 24;
// E01 pipe: put("pipe", PIPE.o, E1.pipe(PIPE.o, { id: "pipe", pts: PIPE.pts, r: 7 })) — one straight run A → E along u
export const PIPE = { o: { u: ZU.A - 400, v: PIPE_V }, pts: [[0, 0, PIPE_Z], [ZU.E - ZU.A + 400, 0, PIPE_Z]] };
// per-station points on the pipe (world-canvas px, z included) for lighting it station by station (seg2 L12) / turning a stretch red
export const STATIONS = Object.fromEntries(
  [["A", DESK], ["repo", REPO], ["B", CONV], ["ci", CI], ["C", BUCKET], ["cdn", EDGES[1]], ["D", SIGNPOST], ["E", BROWSER]]
    .map(([k, q]) => [k, Wp(q.u, PIPE_V, PIPE_Z).map(Math.round)]));

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 (measured from the rendered SVGs:
// visible geometry only, contact shadows / glow and hidden layers excluded). [x0, y0, x1, y1]; y0 includes signs / dials / heads.
// dnsSignpost covers both arm directions. Native-SVG areas (dotsE, dotsF) are the boxes reserved for them, from their ground origin.
export const EXT = {
  person: [-50, -208, 50, 7], personAtk: [-50, -229, 50, 7], browserWin: [-201, -332, 201, 81], phone: [-70, -195, 58, 27],
  desk: [-147, -272, 147, 74], dbLedger: [-76, -159, 76, 37], key: [-75, -35, 84, 31], rack: [-113, -349, 113, 51], padlock: [-56, -138, 62, 28],
  envelope: [-96, -47, 96, 45], docStanding: [-84, -261, 82, 23], hourglass: [-56, -201, 56, 28], bucket: [-76, -164, 76, 28], rpc: [-77, -258, 78, 38],
  magnifier: [-58, -260, 120, -105], ledgerBook: [-158, -89, 158, 74], hwWallet: [-73, -62, 90, 33], beacon: [-61, -118, 61, 30], clock: [-76, -193, 61, 2],
  safe: [-180, -376, 181, 82], laptop: [-164, -234, 141, 66], shield: [-68, -218, 64, 28], checkpoint: [-213, -305, 284, 143],
  vending: [-126, -330, 126, 55], signPlate: [-136, -242, 109, 50], signPlateL: [-189, -260, 161, 69], signWood: [-94, -155, 94, 23], letter: [-28, -56, 26, 0],
  conveyor: [-264, -173, 265, 96], tellerCounter: [-228, -343, 241, 92], thresholdMeter: [-52, -290, 71, 26], parcel: [-38, -56, 38, 18],
  cheque: [-75, -124, 74, 24], coreModule: [-73, -179, 73, 32], container: [-108, -129, 108, 47], dnsSignpost: [-127, -222, 127, 20],
  dotsE: [0, 0, 400, 140], dotsF: [0, 0, 400, 120],
};
// rect(o, kind, scale) → world-canvas bbox [x0, y0, x1, y1] of that object standing at o (o.z lifts it, e.g. parcels on the belt)
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
  desk: rect(DESK, "desk"), dev: rect(DEV, "person"), docker: rect(DOCKER, "container"), repo: rect(REPO, "dbLedger"), token: rect(TOKEN, "key"),
  conv: rect(CONV, "conveyor"), parcels: PARCELS.map((q) => rect(q, "parcel")), npm: rect(NPM, "signPlate"), pin: rect(PINLOCK, "padlock"), ci: rect(CI, "rack"),
  maint: rect(MAINT, "person"), atkB: rect(ATK_B, "personAtk"), mail: rect(MAIL, "envelope"), leave: rect(LEAVE, "docStanding"),
  bucket: rect(BUCKET, "bucket"), edges: EDGES.map((q) => rect(q, "rpc")), cdn: rect(CDNSIGN, "signPlate"), apikey: rect(APIKEY, "key"),
  hour: rect(HOUR5, "hourglass"), mag: rect(MAG, "magnifier"), hlog: rect(HASHLOG, "ledgerBook"),
  sign: rect(SIGNPOST, "dnsSignpost"), real: rect(REAL, "rack"), clone: rect(CLONE, "rack"), cert: rect(CERT, "docStanding"), cert2: rect(CERT2, "docStanding"),
  regdesk: rect(REGDESK, "desk"), regsign: rect(REGSIGN, "signPlate"), atkD: rect(ATK_D, "personAtk"), locks: LOCKS.map((q) => rect(q, "padlock")),
  hwkey: rect(HWKEY, "hwWallet"), beacon: rect(BEACON, "beacon"), backup: rect(BACKUP, "signWood"), clock: rect(MIGCLOCK, "clock"),
  browser: rect(BROWSER, "browserWin"), user: rect(USER, "person"), phone: rect(PHONE, "phone"), cheque: rect(CHEQUE, "cheque"), vend: rect(VEND, "vending"),
  dotsE: rect(DOTS_E, "dotsE"), list: rect(CHECKLIST, "docStanding"), teller: rect(TELLER, "tellerCounter"), vault: rect(VAULT, "safe"),
  bbook: rect(BANKBOOK, "ledgerBook"), letters: LETTERS.map((q) => rect(q, "letter")),
  safe: rect(SAFE, "safe"), core: rect(CORE, "coreModule"), meter: rect(METER, "thresholdMeter"), safeui: rect(SAFEUI, "browserWin"),
  signers: SIGNERS.map((q) => rect(q, "person")), hws: HWS.map((q) => rect(q, "hwWallet")), laptop: rect(LAPTOP, "laptop"), shield: rect(SHIELD, "shield"),
  checkpt: rect(CHECKPT, "checkpoint"), bybit: rect(BYBIT, "signPlateL"), dotsF: rect(DOTS_F, "dotsF"),
};
export const ZONE_RECTS = {
  A: [R.desk, R.dev, R.docker, R.repo, R.token],
  B: [R.conv, ...R.parcels, R.npm, R.pin, R.ci, R.maint, R.atkB, R.mail, R.leave],
  C: [R.bucket, ...R.edges, R.cdn, R.apikey, R.hour, R.mag, R.hlog],
  D: [R.sign, R.real, R.clone, R.cert, R.cert2, R.regdesk, R.regsign, R.atkD, ...R.locks, R.hwkey, R.beacon, R.backup, R.clock],
  E: [R.browser, R.user, R.phone, R.cheque, R.vend, R.dotsE, R.list, R.teller, R.vault, R.bbook, ...R.letters],
  F: [R.safe, R.core, R.meter, R.safeui, ...R.signers, ...R.hws, R.laptop, R.shield, R.checkpt, R.bybit, R.dotsF],
};
const Z = ZONE_RECTS;
const SAFE_R = [100, 280, 1820, 860];                    // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for code cards / checklists at the sides
// address bar strip of the hero browser (top ~110 px of the window incl. title bar)
const BAR = (() => { const q = R.browser; return [q[0], q[1], q[2], q[1] + 120]; })();
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur). Screen bboxes: see the layout check (run once, numbers below).
export const CAMS = {
  // A 开发者工位：桌 + 开发者 + Docker + 代码仓库 + 会话令牌（seg5 L3–L5）
  devA: fit(Z.A, MID, 1.4),
  // B 依赖传送带 + npm 牌 + 锁 + 维护者 / 攻击者 / 钓鱼邮件（seg4 L0–L5, L21）
  depsB: fit([R.conv, ...R.parcels, R.npm, R.pin, R.maint, R.atkB, R.mail], MID, 1.4),
  // B CI 机柜 + 离职清单 + 传送带（seg4 L6–L13）
  buildB: fit([R.ci, R.leave, R.conv, ...R.parcels, R.maint], MID, 1.4),
  // C S3 桶（+ 第一台边缘节点、放大镜）（seg5 L6）
  hostC: fit([R.bucket, R.edges[0], R.mag], MID, 1.4),
  // C 边缘节点 ×3 + CDN 牌 + API Key + 5 小时沙漏 + 哈希日志（seg4 L14–L24 终点；seg5 起点）
  cdnC: fit([...R.edges, R.cdn, R.apikey, R.hour, R.hlog], MID, 1.4),
  // D 路牌 + 两台机柜（+ 两张证书）（seg3 L0–L8）
  dnsD: fit([R.sign, R.real, R.clone, R.cert, R.cert2], SAFE_R, 1.4),
  // D 注册商柜台 + 牌 + 攻击者 + 迁移时钟（seg3 L9–L16）
  regD: fit([R.regdesk, R.regsign, R.atkD, R.clock, R.sign], MID, 1.4),
  // D 两把锁 + 硬件密钥 + 告警灯 + 备用域名牌 + 路牌（seg3 L17–L21 终点；seg4 起点）
  guardD: fit([R.sign, ...R.locks, R.hwkey, R.beacon, R.backup], MID, 1.4),
  // E 用户 + 浏览器 + 支票 + 钱包（+ 点阵）（seg1 起点 L0–L5；seg6 L0）
  userE: fit([R.user, R.browser, R.cheque, R.phone, R.dotsE], MID, 1.4),
  // E 地址栏 + 锁特写，右侧留题卡位（seg1 L9–L11 终点；seg6 L8）
  barE: fit([BAR], [200, 340, 1300, 700], 2.4),
  // E 用户 + 浏览器 + 合约（seg1 L6–L8；seg2 起点 L0–L5）
  contractE: fit([R.user, R.browser, R.vend, R.phone, R.cheque], MID, 1.4),
  // E 银行柜台比喻：柜台 + 金库 + 账本 + 三封汇款（seg2 L6–L10）
  bankE: fit([R.teller, R.vault, R.bbook, ...R.letters], MID, 1.4),
  // E 全区（seg6 L5–L7、L11 拉开）
  E: fit(Z.E, SAFE_R, 1.4),
  // F 多签全景（seg5 L0–L2）
  msigF: fit(Z.F, SAFE_R, 1.4),
  // F 签名人 + 硬件钱包 + Safe 前端 + Bybit 牌（seg5 L7–L10, L17–L19）
  signF: fit([...R.signers, ...R.hws, R.safeui, R.bybit], MID, 1.4),
  // F 保险柜 + 实现合约 + 门槛表（seg5 L11–L16）
  coreF: fit([R.safe, R.core, R.meter], MID, 1.4),
  // F 独立工具 + 盾牌 + 关卡（+ 第三台硬件钱包，比哈希）（seg5 L20–L23 终点；seg6 起点）
  toolF: fit([R.laptop, R.shield, R.checkpt, R.hws[2]], MID, 1.4),
  // 各区全景（zone framings; seg5 L0 / L7 pans pass through them）
  A: fit(Z.A, SAFE_R, 1.4),
  B: fit(Z.B, SAFE_R, 1.4),
  C: fit(Z.C, SAFE_R, 1.4),
  D: fit(Z.D, SAFE_R, 1.4),
  F: fit(Z.F, SAFE_R, 1.4),
  // 发布街全景：A → F 全部（seg2 L11–L15 终点；seg3 起点；seg6 L12 结束卡）
  wide: fit([...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E, ...Z.F], [60, 200, 1860, 860], 1),
};
// world: everything the segments need to size grid / box
export const world = { ZU, ZONE_ANCHOR, ROAD, PIPE, rects: R };
