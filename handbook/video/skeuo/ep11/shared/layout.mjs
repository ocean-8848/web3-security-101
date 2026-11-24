// ep11「DeFi 集市」shared world layout — one continuous isometric world, fixed for all six segments:
//   import { VEND, PANEL, BAL, RESERVE, BORROWER, LIQUIDATOR, ALIQ, DOTS, BADA, APIPE,
//            XVS, CAP, RATE, PRICE, ORACLE, OHOUR, CPOOL, STALLS, BLIQ, RING, BADB,
//            PROPOSAL, BALLOT, METER, TREASURY, DAYGLASS, FLASH, SNAP, TLOCK, VETO, PLOCK, RECLOCK, VOTERS,
//            REWARD, RHOUR, RPOOL, RCOINS,
//            MINT, RESV, SVB, OFFSIGN, USDC, USR, LENDER, DEX, EXCH, UPRICE, BILL, VOID, MSIG, MKEY, MANAGER, FREEZE, SPIRAL, DPIPE,
//            QUEUE, QLETTER, WAIT8, PAUSE, ALARM, TEAM, ATTACKER, CMETH, SHIELD, WAITERS,
//            EXT, rect, fit, ZONE_RECTS, CAMS } from "../../shared/layout.mjs";
// (from ep11/segN/src/build-story.mjs). Positions only; ids, states, labels and per-shot opts stay in each segment.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Every position is written as S(X, Y) = the world point whose ground lands on world-canvas px (X, Y) (iso.G, rounded) —
// so the numbers read as on-screen ground positions at camera scale 1. `scale` = the opts.scale to pass to the object.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): only kit person / ledgerBook, E01 vending / miniVend, E08 ammPool / liqBot / marketStall / twapRecorder,
//   E09 commitBox and ep11 snapshotCamera / mintPress take opts.scale. Everything else IGNORES it. Where such an object carries `scale` below
//   (SVB = kit safe 0.7, MANAGER = kit desk 0.6), the segment MUST put it with the wrap helper (translate · scale · translate around its
//   ground point) and rescale its anchors; rect() / CAMS already assume the scaled size.
// Zones (world-canvas px; front row +v = larger Y, back row −v = smaller Y; left → right = X):
//   A 借贷大厅 front-left (X ≈ −810..1010, Y ≈ −640..470, the hero vending at the origin)
//   · B 清算市场 straight behind A (X ≈ −930..715, Y ≈ −1880..−990)
//   · C 治理议事厅 middle back (X ≈ 1560..3600, Y ≈ −1740..−770) + 奖励站 middle front (X ≈ 2690..3420, Y ≈ −500..−180)
//   · D 铸币厂与储备 right back (X ≈ 4050..6100, Y ≈ −1950..−800)
//   · E 赎回窗口 right front, in front of D (X ≈ 4500..6110, Y ≈ −100..630).
// Front row left → right is A · C 奖励站 · E (seg6 L1 pans E → A); B / C 议事厅 / D sit behind them.
// Neighbouring zones are ≥ ~250 canvas px apart edge to edge (A–B ≈ 350, B–C hall ≈ 820, C hall–D ≈ 460, C hall–C stand ≈ 270, D–E ≈ 700,
// C stand–E ≈ 1080); the per-zone framings in CAMS hold only their own zone's key objects. Per-object screen bboxes at each framing are
// quoted next to CAMS. Native-SVG areas (dot matrices, the reflexivity ring, the death spiral, the reward coin spray) are given as
// a ground origin + a box kind in EXT, so the segment knows where it may draw them.
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

// ---- A 左前·借贷大厅·Euler (seg1 全段; seg2 L0–L12; seg5 L3–L4; seg6 L1–L2, L5–L8): anchor = hero vending
const a = zone(0, 0);
export const VEND = a(0, 0);                              // E01 vending "借贷合约" (scale 1, hero)
export const PANEL = a(-560, 120);                       // E05 funcPanel "入口" (original size): 存入 / 借款 / 取出 / 捐赠 (捐赠 guard "broken")
export const BAL = a(560, 120);                          // E01 balance "健康因子" (original size, hero): left pan = 抵押品 × 阈值, right pan = 借款
export const RESERVE = a(330, -260);                     // kit safe gold "协议储备" (original size), behind-right of the vending
export const BORROWER = a(-240, 300);                    // kit person signer "账户 A · 借款人"
export const LIQUIDATOR = a(960, 160);                   // kit person attacker "账户 B · 清算人" (seg2 L9)
export const ALIQ = [a(780, 230), a(880, 290)];          // E08 liqBot ×2 "清算人" (scale 1), beside the balance
export const DOTS = a(-60, 300);                         // dot matrix area (native SVG, 1 dot = 1 美元): ground box EXT.dotsA from here (≈ 560 × 150 px)
export const BADA = a(680, 380);                         // red dashed "坏账" box under the balance (native SVG / screen frame), EXT.badA
export const APIPE = {                                   // E01 pipe routes (world units, from the vending): vending → balance, vending → reserve
  bal: route(VEND, BAL, 90, [100, 0], [-150, 0]),
  reserve: route(VEND, RESERVE, 90, [0, -60], [0, 70]),
};

// ---- B 左后·清算市场·Venus 与坏账 (seg2 L13–L23; seg5 L5–L6; seg3 起点): straight behind A
const b = zone(-100, -1550);
export const XVS = b(-480, 0, { scale: 0.8 });           // E01 miniVend kind token "XVS" 0.8
export const CAP = b(-700, 120);                         // E01 signBoard plate "供应上限" in front of the XVS feed
export const RATE = b(-280, 180);                        // E01 signBoard plate "抵押率 ↓"
export const PRICE = b(0, -150);                         // E08 twapRecorder "价格" (scale 1; curve up 76 → 144, then down)
export const ORACLE = b(300, -120, { scale: 0.6 });      // E01 miniVend kind oracle "预言机" 0.6
export const OHOUR = b(430, -80);                        // kit hourglass "延迟" beside the oracle
export const CPOOL = b(-20, 200, { scale: 0.8 });        // E08 ammPool "抵押品市场" 0.8 (tank level can drop)
export const STALLS = [b(500, 200, { scale: 0.7 }), b(720, 280, { scale: 0.7 })]; // E08 marketStall ×2 "卖不出" 0.7 (the second one empty)
export const BLIQ = [b(200, 330, { scale: 0.8 }), b(290, 370, { scale: 0.8 }), b(380, 410, { scale: 0.8 })]; // E08 liqBot ×3 0.8 (claws open, screens "gas" "滑点")
export const RING = b(-200, 460);                        // reflexivity ring centre (native SVG, 4 arcs; ≈ rx 160 / ry 100 screen px), EXT.ring
export const BADB = b(500, 470);                         // red dot pile "坏账" (native SVG), EXT.badB

// ---- C 中·治理议事厅 (seg3 L0–L15; seg5 L10): middle, back row; anchor = ballot box
const c = zone(2700, -1200);
export const PROPOSAL = c(-650, -60);                    // kit doc standing "提案" (stamp / date corner)
export const BALLOT = c(-250, 0, { scale: 0.8 });        // E09 commitBox "投票箱" 0.8 (side door "紧急通道" drawn by the segment)
export const METER = c(0, -60);                          // E05 thresholdMeter thText "2/3" (level rises)
export const TREASURY = c(420, -160);                    // kit safe gold "国库" (original size)
export const DAYGLASS = c(-110, 190);                    // kit hourglass "1 天"
export const FLASH = c(-920, 330);                       // E01 flashDesk (frame "一笔交易" — the big frame around desk / box / meter / treasury is the segment's own screen rect)
export const SNAP = c(-400, -110);                       // ep11 snapshotCamera (lens faces +v → the ballot box sits in front of it, screen down-right)
export const TLOCK = c(170, 60);                         // E01 timeLock "时间锁", between the meter and the treasury
export const VETO = c(760, 40);                          // kit knifeSwitch "守护者否决"
export const PLOCK = c(-540, 110);                       // kit padlock "内容锁定" (lift it onto the proposal with a translate if wanted)
export const RECLOCK = c(-840, -120);                    // kit clock "重新计时"
export const VOTERS = [c(-440, 160), c(-360, 190), c(-280, 220), c(-200, 250)].map((q) => ({ ...q, scale: 0.6 })); // kit person signer ×4 0.6

// ---- C 前排·奖励站 (seg3 L16–L20; seg3 终点、seg4 起点): in front of the hall
const r = zone(3000, -300);
export const REWARD = r(0, 0, { scale: 0.6 });           // E01 vending "奖励合约" 0.6
export const RHOUR = r(-250, 40);                        // kit hourglass "随时间累积"
export const RPOOL = r(350, -40, { scale: 0.5 });        // E08 ammPool "池子价格" 0.5 (red dashed line from the reward formula)
export const RCOINS = r(100, 60);                         // coin dot spray from the reward tray (native SVG), EXT.rcoins

// ---- D 右后·铸币厂与储备 (seg4 全段; seg5 L0, L7–L9): right of the hall, back row; anchor = mint press
const d = zone(5000, -1300);
export const MINT = d(0, 0);                             // ep11 mintPress "发行方" (scale 1; keys 1 for Resolv, 3 for StablR)
export const RESV = d(-420, -80);                        // kit safe gold "储备" (original size), pipe → MINT
export const SVB = d(-820, -260, { scale: 0.7 });        // kit safe "硅谷银行" (wrap 0.7!), state broken in seg4 L8
export const OFFSIGN = d(-700, 0);                       // E01 signBoard wood "链下" (on the reserves' side)
export const USDC = d(320, 140, { scale: 0.6 });         // E01 miniVend kind token "USDC" 0.6
export const USR = d(440, 200, { scale: 0.6 });          // E01 miniVend kind token "USR" 0.6
export const LENDER = d(750, -250, { scale: 0.5 });      // E01 vending "借贷协议" 0.5 (downstream 1)
export const DEX = d(800, 50, { scale: 0.6 });           // E08 ammPool "DEX 池" 0.6 (downstream 2)
export const EXCH = [d(650, 330), d(830, 400), d(1010, 470)].map((q) => ({ ...q, scale: 0.6 })); // E08 marketStall ×3 "交易所" 0.6 (0.90+ / 0.90+ / 0.65 red)
export const UPRICE = d(1000, -120, { scale: 0.8 });     // E08 twapRecorder "USDC 价格" 0.8 (dips to 0.87)
export const BILL = d(-300, 330);                        // kit doc "提货单" (metaphor)
export const VOID = d(20, 400);                          // kit seal markText "作废"
export const MSIG = d(250, -250);                        // E05 thresholdMeter max 3, th 1, thText "1/3"
export const MKEY = d(-210, 90);                         // kit key, red = 铸币密钥 (fly it into A.mint.keys[0] if wanted)
export const MANAGER = d(-650, 260, { scale: 0.6 });     // kit desk "链下管理人" (wrap 0.6!), red falling curve on screen
export const FREEZE = d(-470, 180);                      // kit padlock "提款冻结" (on the withdrawal pipe)
export const SPIRAL = d(450, -450);                      // death spiral (native SVG, red, turning down), EXT.spiral
export const DPIPE = {                                   // E01 pipe routes (world units): reserve → mint, mint → three downstream paths
  reserve: route(RESV, MINT, 60, [0, 60], [-90, 0]),
  lender: route(MINT, LENDER, 60, [90, 0], [0, 40]),
  dex: route(MINT, DEX, 40, [90, 20], [-80, 0]),
  exch: route(MINT, EXCH[0], 30, [0, 70], [-70, 0]),
};

// ---- E 右前·赎回窗口·mETH (seg5 L11–L17; seg6 L0, L3–L4): in front of D, right end of the front row; anchor = redemption queue
const e = zone(5100, 250);
export const QUEUE = e(0, 0);                            // E01 mempool sign "赎回队列" (no scale parameter; original size)
export const QLETTER = e(-40, -20, { z: 0 });            // E01 letter state attacker "cmETH" inside the queue (do not walk letters on a scaled mempool)
export const WAIT8 = e(420, -150);                       // E01 timeLock "8 小时" (frac counts down)
export const PAUSE = e(650, 0);                          // kit knifeSwitch "暂停" (pulled in seg5 L14)
export const ALARM = e(400, 150);                        // kit beacon (monitoring)
export const TEAM = [e(640, 260), e(760, 300)];          // kit person engineer ×2 "团队"
export const ATTACKER = e(-450, 120);                    // kit person attacker
export const CMETH = e(-560, -160, { scale: 0.6 });      // E01 miniVend kind token "cmETH" 0.6
export const SHIELD = e(950, 120);                       // kit shield "延迟 = 安全参数"
export const WAITERS = [e(-150, 300), e(-40, 340), e(70, 380)].map((q) => ({ ...q, scale: 0.7 })); // kit person signer ×3 0.7 "正常用户"

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 (measured from the rendered SVGs:
// visible geometry only, contact shadows / glow and hidden layers excluded). [x0, y0, x1, y1]; y0 includes signs / dials / heads.
// Native-SVG areas (dotsA … rcoins) are the boxes reserved for them, from their ground origin.
export const EXT = {
  vending: [-126, -330, 126, 55], funcPanel: [-250, -251, 253, 109], balance: [-163, -258, 163, 40], safe: [-180, -376, 181, 82],
  person: [-50, -208, 50, 7], personAtk: [-50, -229, 50, 7], liqBot: [-40, -77, 45, 20], miniVend: [-72, -197, 72, 31], miniVendOracle: [-72, -261, 72, 31],
  twapRecorder: [-108, -178, 124, 72], ammPool: [-136, -215, 136, 61], marketStall: [-133, -279, 136, 56], hourglass: [-56, -201, 56, 28],
  signPlate: [-130, -239, 102, 48], signPlate3: [-113, -233, 86, 42], signWood: [-68, -146, 68, 14], docStanding: [-84, -261, 82, 23],
  commitBox: [-94, -175, 95, 40], thresholdMeter: [-52, -290, 89, 26], flashDesk: [-223, -328, 223, 103], snapshotCamera: [-52, -162, 47, 22],
  timeLock: [-64, -182, 64, 27], knifeSwitch: [-153, -344, 133, 48], padlock: [-56, -138, 62, 28], clock: [-76, -193, 61, 2],
  mintPress: [-114, -238, 114, 55], doc: [-156, -85, 156, 82], seal: [-146, -142, 147, 69], key: [-75, -35, 84, 31], desk: [-147, -272, 147, 74],
  mempool: [-305, -346, 305, 139], letter: [-28, -56, 26, 0], beacon: [-61, -118, 61, 30], shield: [-68, -218, 64, 28],
  magnifier: [-58, -260, 120, -105], phone: [-70, -195, 58, 27],
  dotsA: [0, 0, 560, 150], badA: [-90, -20, 150, 70], ring: [-160, -100, 160, 100], badB: [-90, -30, 150, 60], rcoins: [0, -20, 180, 110], spiral: [-90, -200, 90, 0],
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

// key objects per zone (the rects each framing must hold)
export const ZONE_RECTS = {
  A: [rect(VEND, "vending"), rect(PANEL, "funcPanel"), rect(BAL, "balance"), rect(RESERVE, "safe"), rect(BORROWER, "person"), rect(LIQUIDATOR, "personAtk"),
    ...ALIQ.map((q) => rect(q, "liqBot")), rect(DOTS, "dotsA"), rect(BADA, "badA")],
  B: [rect(XVS, "miniVend"), rect(CAP, "signPlate"), rect(RATE, "signPlate3"), rect(PRICE, "twapRecorder"), rect(ORACLE, "miniVendOracle"), rect(OHOUR, "hourglass"),
    rect(CPOOL, "ammPool"), ...STALLS.map((q) => rect(q, "marketStall")), ...BLIQ.map((q) => rect(q, "liqBot")), rect(RING, "ring"), rect(BADB, "badB")],
  C: [rect(PROPOSAL, "docStanding"), rect(BALLOT, "commitBox"), rect(METER, "thresholdMeter"), rect(TREASURY, "safe"), rect(DAYGLASS, "hourglass"),
    rect(FLASH, "flashDesk"), rect(SNAP, "snapshotCamera"), rect(TLOCK, "timeLock"), rect(VETO, "knifeSwitch"), rect(PLOCK, "padlock"), rect(RECLOCK, "clock"),
    ...VOTERS.map((q) => rect(q, "person"))],
  R: [rect(REWARD, "vending"), rect(RHOUR, "hourglass"), rect(RPOOL, "ammPool"), rect(RCOINS, "rcoins")],
  D: [rect(MINT, "mintPress"), rect(RESV, "safe"), rect(SVB, "safe"), rect(OFFSIGN, "signWood"), rect(USDC, "miniVend"), rect(USR, "miniVend"),
    rect(LENDER, "vending"), rect(DEX, "ammPool"), ...EXCH.map((q) => rect(q, "marketStall")), rect(UPRICE, "twapRecorder"), rect(BILL, "doc"), rect(VOID, "seal"),
    rect(MSIG, "thresholdMeter"), rect(MKEY, "key"), rect(MANAGER, "desk"), rect(FREEZE, "padlock"), rect(SPIRAL, "spiral")],
  E: [rect(QUEUE, "mempool"), rect(WAIT8, "timeLock"), rect(PAUSE, "knifeSwitch"), rect(ALARM, "beacon"), ...TEAM.map((q) => rect(q, "person")),
    rect(ATTACKER, "personAtk"), rect(CMETH, "miniVend"), rect(SHIELD, "shield"), ...WAITERS.map((q) => rect(q, "person"))],
};
const Z = ZONE_RECTS;
const SAFE = [100, 280, 1820, 860];                      // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for code cards / checklists at the sides
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur). Screen bboxes below are [x0, y0, x1, y1] on the 1920×1080 frame
// (from the layout check), on the line(s) right above each key.
export const CAMS = {
  // 近景：入口面板（捐赠按钮）+ 借贷合约（seg1 起点 L0–L2、L4、L11–L12；seg5 L3–L4；seg6 L2、L5–L6）
  //   k 1.002 · panel 491,499–995,860 · vend 1176,300–1429,686
  donate: fit([rect(PANEL, "funcPanel"), rect(VEND, "vending")], MID, 1.4),
  // 近景：天平 + 点阵 + 坏账框 + 两台清算机器人（seg1 L3、L6–L10；seg2 L0–L10；seg6 L1、L7）
  //   k 0.952 · bal 926,300–1237,584 · dots 491,717–1024,860 · badA 1110,774–1339,860 · aliq0 1252,577–1333,669 · aliq1 1348,634–1429,727
  balance: fit([rect(BAL, "balance"), rect(DOTS, "dotsA"), rect(BADA, "badA"), ...ALIQ.map((q) => rect(q, "liqBot"))], MID, 1.4),
  // A 借贷大厅中景：售货机 + 入口 + 天平 + 储备 + 坏账框（seg1 终点 L13、seg2 起点、seg2 L11–L12、seg6 结束前回到 A）
  //   k 0.534 · vend 839,443–974,649 · panel 474,550–743,742 · bal 1119,546–1293,705 · reserve 987,280–1179,525 · borrower 752,669–805,784 · liquidator 1393,583–1446,709
  //   aliq0 1302,701–1347,753 · aliq1 1355,734–1400,785 · dots 875,780–1174,860 · badA 1222,812–1350,860
  A: fit(Z.A, SAFE, 1.4),
  // B 清算市场全景（seg2 L13、seg2 终点 L23 供应上限牌、seg3 起点）
  //   k 0.653 · xvs 614,391–689,510 · cap 423,416–574,604 · rate 708,460–838,639 · price 894,280–1046,443 · oracle 1133,314–1189,428 · ohour 1209,311–1282,460
  //   cpool 880,512–1023,657 · stall0 1231,497–1354,651 · stall1 1374,550–1497,703 · bliq0 1075,670–1119,720 · bliq1 1133,696–1178,746 · bliq2 1192,722–1237,772
  //   ring 730,729–939,860 · badB 1233,781–1390,840
  B: fit(Z.B, SAFE, 1.4),
  // 近景：XVS + 供应上限 / 抵押率牌 + 价格曲线 + 反身性环（seg2 L17–L23；seg5 L5）
  //   k 0.631 · xvs 844,407–916,522 · cap 659,432–805,613 · rate 935,473–1060,647 · price 1115,300–1261,458 · ring 956,734–1158,860
  xvs: fit([rect(XVS, "miniVend"), rect(CAP, "signPlate"), rect(RATE, "signPlate3"), rect(PRICE, "twapRecorder"), rect(RING, "ring")], MID, 1.4),
  // 近景：价格曲线 + 预言机 / 延迟 + 卖不出的摊位 + 三台清算机器人 + 红点坏账（seg2 L14–L16、L20；seg5 L6）
  //   k 0.653 · price 659,300–810,463 · oracle 897,333–953,448 · ohour 973,331–1046,480 · stall0 995,517–1118,670 · stall1 1139,569–1261,722 · bliq0 839,689–883,740
  //   bliq1 897,716–942,766 · bliq2 956,742–1001,792 · badB 997,801–1154,860
  liq: fit([rect(PRICE, "twapRecorder"), rect(ORACLE, "miniVendOracle"), rect(OHOUR, "hourglass"), ...STALLS.map((q) => rect(q, "marketStall")),
    ...BLIQ.map((q) => rect(q, "liqBot")), rect(BADB, "badB")], MID, 1.4),
  // C 治理议事厅全景（seg3 L1–L2、L8 一笔交易大框、L10–L11）
  //   k 0.598 · proposal 596,409–695,579 · ballot 840,517–931,620 · meter 1003,391–1088,580 · treasury 1178,280–1394,554 · dayglass 935,594–1002,731 · flash 351,602–618,860
  //   snap 764,438–824,548 · tlock 1098,528–1175,653 · veto 1398,419–1569,653 · plock 678,584–749,683 · reclock 487,414–569,530 · voter0 753,622–789,699
  //   voter1 801,640–837,717 · voter2 850,658–886,735 · voter3 897,676–933,753
  C: fit(Z.C, SAFE, 1.4),
  // 近景：快照相机 + 投票箱 + 门限表 + 提案 + 1 天沙漏（seg3 L3–L7、L13）
  //   k 0.985 · snap 832,377–930,558 · ballot 958,507–1106,676 · meter 1226,300–1365,611 · proposal 555,329–719,609 · dayglass 1114,634–1224,860
  vote: fit([rect(SNAP, "snapshotCamera"), rect(BALLOT, "commitBox"), rect(METER, "thresholdMeter"), rect(PROPOSAL, "docStanding"), rect(DAYGLASS, "hourglass")], MID, 1.4),
  // 近景：门限表 → 时间锁 → 国库 + 守护者否决 + 提案 / 锁 / 重新计时（seg3 L14–L15）
  //   k 0.86 · meter 925,440–1046,712 · tlock 1061,636–1171,816 · treasury 1176,280–1487,674 · veto 1492,480–1738,817 · proposal 339,465–482,710 · plock 457,717–559,860
  //   reclock 182,472–300,640
  guard: fit([rect(METER, "thresholdMeter"), rect(TLOCK, "timeLock"), rect(TREASURY, "safe"), rect(VETO, "knifeSwitch"), rect(PROPOSAL, "docStanding"),
    rect(PLOCK, "padlock"), rect(RECLOCK, "clock")], SAFE, 1.4),
  // C 前排奖励站（seg3 L16–L20；seg3 终点、seg4 起点）
  //   k 1.4 · reward 776,322–988,646 · rhour 453,374–610,695 · rpool 1276,393–1467,586 · rcoins 1022,656–1274,838
  reward: fit(Z.R, MID, 1.4),
  // C 议事厅 + 奖励站远景（seg3 L0 从 B 移过来、seg5 L10 带过快照相机和时间锁）
  //   k 0.361 · proposal 740,358–800,460 · ballot 888,423–942,485 · meter 986,347–1037,461 · treasury 1092,280–1222,445 · dayglass 945,470–986,552 · flash 593,474–754,630
  //   snap 842,375–878,442 · tlock 1043,430–1090,505 · veto 1224,364–1327,505 · plock 790,464–833,523 · reclock 674,361–724,431 · voter0 835,486–857,533
  //   voter1 864,497–886,544 · voter2 893,508–915,555 · voter3 922,519–944,565 · reward 1086,727–1141,810 · rhour 1003,740–1043,823 · rpool 1215,745–1264,795
  //   rcoins 1150,813–1215,860
  Cwide: fit([...Z.C, ...Z.R], SAFE, 1.4),
  // D 铸币厂全景：铸币机 + 储备 + 下游三路（seg4 L0、L19 终点；seg5 起点）
  //   k 0.503 · mint 864,487–979,634 · resv 620,377–801,608 · svb 446,344–573,505 · offsign 535,533–604,614 · usdc 1061,618–1104,687 · usr 1121,648–1164,717
  //   lender 1267,398–1330,495 · dex 1283,567–1365,650 · exch0 1208,689–1289,790 · exch1 1298,724–1380,825 · exch2 1389,759–1470,860 · uprice 1381,475–1474,575
  //   bill 692,730–849,814 · void 858,737–1006,843 · msig 1021,335–1092,494 · mkey 778,634–858,668 · manager 550,655–639,760 · freeze 657,628–716,711
  //   spiral 1102,280–1193,380
  D: fit(Z.D, SAFE, 1.4),
  // 近景：链下储备 / 硅谷银行 + 铸币机 + 提货单 / 作废章 + 链下管理人（seg4 L1–L10、L15）
  //   k 0.585 · resv 837,319–1048,587 · svb 634,280–782,467 · offsign 739,501–818,594 · mint 1121,447–1254,618 · bill 921,729–1104,827 · void 1114,737–1286,860
  //   manager 756,643–859,764 · freeze 880,610–949,707
  offchain: fit([rect(RESV, "safe"), rect(SVB, "safe"), rect(OFFSIGN, "signWood"), rect(MINT, "mintPress"), rect(BILL, "doc"), rect(VOID, "seal"),
    rect(MANAGER, "desk"), rect(FREEZE, "padlock")], SAFE, 1.4),
  // 近景：铸币机钥匙面板 + 1/3 门限表 + 红钥匙 + USDC / USR（seg4 L11–L14；seg5 L7–L8）
  //   k 0.738 · mint 803,523–971,739 · msig 1033,300–1137,533 · mkey 677,739–794,788 · usdc 1091,715–1155,816 · usr 1180,759–1243,860
  mint: fit([rect(MINT, "mintPress"), rect(MSIG, "thresholdMeter"), rect(MKEY, "key"), rect(USDC, "miniVend"), rect(USR, "miniVend")], MID, 1.4),
  // 近景：DEX 池 + 三个交易所摊位 + USDC 价格 + 下游借贷协议（seg4 L9、L16–L18；seg5 L9）
  //   k 0.61 · dex 889,505–989,606 · exch0 799,652–897,775 · exch1 908,695–1007,817 · exch2 1018,737–1116,860 · uprice 1008,393–1121,515 · lender 870,300–947,417
  market: fit([rect(DEX, "ammPool"), ...EXCH.map((q) => rect(q, "marketStall")), rect(UPRICE, "twapRecorder"), rect(LENDER, "vending")], MID, 1.4),
  // E 赎回窗口全景（seg5 L11–L12、L16–L17 终点；seg6 起点 L0）
  //   k 0.793 · queue 556,280–1039,665 · wait8 1080,291–1181,457 · pause 1191,282–1418,593 · alarm 1066,580–1163,697 · team0 1265,596–1345,766 · team1 1360,627–1439,798
  //   attacker 401,468–480,655 · cmeth 319,334–387,442 · shield 1496,477–1601,672 · wait0 651,677–706,796 · wait1 738,709–793,828 · wait2 825,741–881,860
  E: fit(Z.E, SAFE, 1.4),
  // 近景：赎回队列 + 8 小时时间锁 + 暂停闸刀 + 警报灯 + 团队（seg5 L13–L15）
  //   k 0.858 · queue 482,300–1005,716 · wait8 1049,312–1159,491 · pause 1170,302–1415,638 · alarm 1034,624–1139,751 · team0 1250,641–1336,826 · team1 1352,676–1438,860
  queue: fit([rect(QUEUE, "mempool"), rect(WAIT8, "timeLock"), rect(PAUSE, "knifeSwitch"), rect(ALARM, "beacon"), ...TEAM.map((q) => rect(q, "person"))], MID, 1.4),
  // 全景：所有区（seg5 L0–L2 从 D 拉远、seg6 L8 结束卡前拉远）
  //   k 0.255
  world: fit([...Z.A, ...Z.B, ...Z.C, ...Z.R, ...Z.D, ...Z.E], [60, 200, 1860, 860], 1),
};
