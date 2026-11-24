// ep15「签名街」shared world layout — one continuous isometric world, fixed for all six segments:
//   import { SIGN_A, RACK, ATK_A, HOTSAFE, PLATE_A, TAG_A, CORE_A, SWITCH, CLOCK, BEACON,
//            SIGN_B, COUNTER, SIGNER_B, HELPER_B, CHEQUE_B, AUTH_B, AUTH2_B, SEAL_B, KEY_B, LINKS_B,
//            SIGN_C, LETTERS, SORTER, GATE, ACCOUNT, PUMP, FUNNEL, UCHEQUE, PCHEQUE, CHAIN_A, CHAIN_B, STEPS, IMPL, SKEY,
//            SIGN_D, DSAFE, PLATE_D, TAG_D, DCHEQUE, DCORE_OK, DCORE_BAD, CHAINS_D, BATCH, MAG_D, SWEEPS, DOTS_D, SLOTS, DCORE_DEV, BROWSER_D,
//            SIGN_E, PHONE, MALEXT, METER_E, GUARDS, MKEY, KEYCARDS, GAME, TOKSAFE, DOTS_E,
//            SIGN_F, ORDER, SOLVER, SETTLE, VULN, FPIPE, BOND, SIGN_V1, RESOLVER, PERMIT, PKEY, OFFSIG, DOTS_F, DOTS_F2,
//            ROAD, ZTAGS, EXT, rect, fit, ZONE_RECTS, CAMS, world } from "../../shared/layout.mjs";
// (from ep15/segN/src/build-story.mjs). Positions only; ids, states, labels and per-shot opts stay in each segment.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Every position is written as S(X, Y) = the world point whose ground lands on world-canvas px (X, Y) (iso.G, rounded) —
// so the numbers read as on-screen ground positions at camera scale 1. `scale` = the scale to give the object.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): kit person, E01 miniVend, E04 tellerCounter, E05 keycard, E08 liqBot, E09 cheque, E10 coreModule
//   and ep15 delegateTag / gasPump take opts.scale. Everything else IGNORES it. Entries below marked "wrap" (PLATE_D = E02 addrPlate 1.3,
//   CHAINS_D = kit chain 0.7, SLOTS = E03 slotCabinet 0.7, METER_E = E05 thresholdMeter 0.7, TOKSAFE / BOND = kit safe 0.8, DSAFE = kit safe 0.7)
//   MUST be put with the wrap helper (translate · scale · translate around the ground point) and their anchors rescaled; rect() / CAMS
//   already assume the scaled size. TAG_A / TAG_D = { o, opts } from ep15 delegateTagOn — the tag's clip sits on the plate's post
//   (TAG_D already accounts for PLATE_D's 1.3 wrap): put("tag", TAG_D.o, X.delegateTag(TAG_D.o, { id: "tag", ...TAG_D.opts, state … })).
// Zones (world-canvas px; one street, left → right along screen X; Y ≈ −650..450 for every zone):
//   A 托管机房 (X ≈ −750..860, anchor 0) · B 银行柜台 (X ≈ 1150..2690, anchor 1900) · C 4337 流水线 (X ≈ 3060..5700, anchor 4100)
//   · D 地址门牌街 7702 (X ≈ 6110..8650, anchor 7100) · E 钥匙与守护人 (X ≈ 9000..10800, anchor 9850) · F 意图集市 (X ≈ 11150..13320, anchor 12100).
// Neighbouring zones are ≥ ~280 canvas px apart edge to edge (A–B ≈ 290, B–C ≈ 370, C–D ≈ 400, D–E ≈ 350, E–F ≈ 360); every per-zone
// framing in CAMS holds only its own zone's objects. The stone road (native SVG) runs in front of all zones: ROAD (canvas-px band).
// The whole street is ≈ 14 000 canvas px wide, so CAMS.wide is k ≈ 0.12 — objects read as silhouettes; put zone names on screen cards.
// Native-SVG areas (dot matrices, ground step labels, short chains, zone tags) are a ground origin + a box kind in EXT.
import { Wp, G, camAt } from "../../kit/iso.mjs";
import { delegateTagOn } from "../kit-ext/objects-ext.mjs";

/** world ground point for world-canvas px (X, Y); extra fields (scale, z …) copied in */
const S = (X, Y, extra = {}) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
/** zone-local placer: positions below are written relative to the zone's anchor px */
const zone = (OX, OY) => (X, Y, extra) => S(OX + X, OY + Y, extra);
/** axis-aligned pipe route a → b for E01 pipe: { o, pts } — put(id, r.o, E1.pipe(r.o, { id, pts: r.pts })). Leaves a along u first, then v. */
const route = (a, b, z = 90, a0 = [0, 0], b0 = [0, 0]) => {
  const du = b.u + b0[0] - a.u, dv = b.v + b0[1] - a.v;
  return { o: { u: a.u, v: a.v }, pts: [[a0[0], a0[1], z], [du, a0[1], z], [du, dv, z]] };
};

// ---- A 最左·托管机房 (seg1 L0–L7; seg6 L4, L7–L10): anchor = hot-wallet safe area
const a = zone(0, 0);
export const SIGN_A = a(-620, -260);                     // E01 signBoard plate "托管机房"
export const RACK = a(-300, -200);                       // kit rack tag "内部签名服务" (original size; leds green → red)
export const ATK_A = a(-130, -60, { scale: 0.7 });       // kit person attacker 0.7, beside the rack
export const HOTSAFE = a(150, -240);                     // kit safe variant "hot" "以太坊热钱包" (original size)
export const PLATE_A = a(120, 40);                       // E02 addrPlate text "热钱包地址" (original size)
export const TAG_A = delegateTagOn(PLATE_A);             // ep15 delegateTag on PLATE_A's post (attacker "委托 → 攻击者合约"; seg6 L9 → cleared)
export const CORE_A = a(330, 60, { scale: 0.7 });        // E10 coreModule state attacker "攻击者合约" 0.7 (red dashed line from TAG_A text)
export const SWITCH = a(620, -180);                      // kit knifeSwitch text "提现服务" (pulled open in seg1 L4)
export const CLOCK = a(560, 150);                        // kit clock "约 3 小时 50 分"
export const BEACON = a(800, 120);                       // kit beacon "代码变化告警"

// ---- B 左中·银行柜台·比喻 (seg1 L8–L10; seg2 L0–L9)
const b = zone(1900, 0);
export const SIGN_B = b(-560, -260);                     // E01 signBoard plate "比喻 · 银行柜台"
export const COUNTER = b(0, -60, { scale: 0.8 });        // E04 tellerCounter 0.8
export const SIGNER_B = b(-300, 120, { scale: 0.7 });    // kit person signer "本人" 0.7
export const HELPER_B = b(-120, 200, { scale: 0.7 });    // kit person engineer "助理" 0.7
export const CHEQUE_B = b(80, 170, { scale: 0.8 });      // E09 cheque title "转账单" 0.8 (fields "金额 · 收款人")
export const AUTH_B = b(320, 120);                       // kit doc standing "授权书" (["每天 100 元以内","代付账单"])
export const AUTH2_B = b(345, 140);                      // kit doc standing red "授权书 · 全部财产" — deliberately lands on AUTH_B (seg2 L7 "压到第一份上")
export const SEAL_B = b(40, 360);                        // kit seal "本人签字"
export const KEY_B = b(-420, -80);                       // kit key (seg2 L2 key "=" cheque with red X) — in front of the sign, left of the counter
export const LINKS_B = b(520, 80);                       // three short native-SVG chains + "撤销" tag (seg2 L9), EXT.linksB

// ---- C 中间偏左·ERC-4337 流水线 (seg2 L10–L18; seg3 全段; seg6 L1)
const c = zone(4100, 0);
export const SIGN_C = c(-900, -300);                     // E01 signBoard plate "ERC-4337"
export const LETTERS = [c(-700, 60), c(-760, 90), c(-820, 120)]; // E01 letter ×3 "用户操作" queued at the sorter's input (walk them only on the original-size sorter)
export const SORTER = c(-380, 0);                        // E01 sorter "Bundler" letters 3, blockLabel "一笔交易" (original size)
export const GATE = c(150, 0);                           // kit checkpoint n "EntryPoint" (original size)
export const ACCOUNT = c(750, -250);                     // E05 accountSafe "智能账户" owners 3 (original size)
export const PUMP = c(700, 200);                         // ep15 gasPump "Paymaster" (scale 1; nozzle → ACCOUNT anchor in seg2 L16)
export const FUNNEL = c(-450, 380);                      // E03 hashFunnel inputs ["字段","字段"], output "用户操作哈希" (original size)
export const UCHEQUE = c(-200, 420);                     // E09 cheque "用户签名" labels ["链 ID","nonce","有效期","…","…"]
export const PCHEQUE = c(950, 260);                      // E09 cheque "Paymaster 签名" (same labels)
export const CHAIN_A = c(1350, -380);                    // kit chain n 3 title "链 A" (original size)
export const CHAIN_B = c(1350, -60);                     // kit chain n 3 title "链 B" (original size); "防重放" green barrier between the two (native)
export const STEPS = c(100, 220);                        // ground labels "1 验证" "2 执行" + the teal divider (native SVG), EXT.steps
export const IMPL = c(1400, 280);                        // E10 coreModule "实现合约" state broken (Biconomy corner)
export const SKEY = c(1580, 300, { scale: 0.8 });        // E05 keycard "会话密钥" 0.8

// ---- D 中间偏右·EIP-7702 地址门牌街 (seg4 全段; seg6 L2–L3, L5)
const d = zone(7100, 0);
export const SIGN_D = d(-850, -320);                     // E01 signBoard plate "EIP-7702"
export const DSAFE = d(-560, -220, { scale: 0.7 });      // kit safe "资产" 0.7 (wrap!) — L12 red line from the batch doc, L13 dots flow out of it
export const PLATE_D = d(-300, 0, { scale: 1.3 });       // E02 addrPlate text "普通地址" 1.3 (wrap!) — the hero plate
export const TAG_D = delegateTagOn(PLATE_D, { plateScale: 1.3 }); // ep15 delegateTag on PLATE_D's post (normal "委托 → 钱包实现" ↔ attacker "委托 → 恶意合约")
export const DCHEQUE = d(-600, 130);                     // E09 cheque "授权" labels ["链 ID","合约地址","nonce"]
export const DCORE_OK = d(-80, -200, { scale: 0.7 });    // E10 coreModule "钱包实现" normal 0.7
export const DCORE_BAD = d(-60, 60, { scale: 0.7 });     // E10 coreModule "恶意合约" attacker 0.7
export const CHAINS_D = [d(-100, -470), d(130, -470), d(360, -470)].map((q) => ({ ...q, scale: 0.7 })); // kit chain n 2 "链 1/2/3" 0.7 (wrap!)
export const BATCH = d(150, 220);                        // kit doc standing "批量执行" ["1 授权","2 兑换","3 转走全部"]
export const MAG_D = d(300, 330);                        // kit magnifier "逐项解码" (move it along the doc rows with a translate)
export const SWEEPS = [d(450, -80), d(550, -20), d(650, 40)].map((q) => ({ ...q, scale: 0.6 })); // E01 miniVend kind attacker "扫币合约" ×3 0.6
export const DOTS_D = d(-420, 260);                      // red dot matrix (15 dots; then 10 + 15) flowing from DSAFE, EXT.dotsD
export const SLOTS = d(950, 250, { scale: 0.7 });        // E03 slotCabinet title "存储" 0.7 (wrap!)
export const DCORE_DEV = d(720, 300, { scale: 0.7 });    // E10 coreModule (new delegate reading old storage; init socket) 0.7
export const BROWSER_D = d(1350, 150);                   // kit browserWin "升级为智能账户？" (original size)

// ---- E 右中·钥匙与守护人 (seg5 L0–L12; seg6 L6)
const e = zone(9850, 0);
export const SIGN_E = e(-700, -300);                     // E01 signBoard plate "登录与会话"
export const PHONE = e(-400, -80);                       // kit phone (fingerprint "Passkey 解锁")
export const MALEXT = e(-50, -200);                      // kit browserWin state attacker "恶意扩展" (original size)
export const METER_E = e(-300, 250, { scale: 0.7 });     // E05 thresholdMeter thText "恢复" max 3 th 2, 0.7 (wrap!)
export const GUARDS = [e(-470, 230), e(-380, 360), e(-160, 330)].map((q) => ({ ...q, scale: 0.6 })); // kit person signer ×3 "守护人" 0.6
export const MKEY = e(100, 120);                         // kit key "主密钥"
export const KEYCARDS = [e(300, 180), e(390, 210), e(480, 240), e(570, 270), e(660, 300), e(750, 330)].map((q) => ({ ...q, scale: 0.7 })); // E05 keycard ×6 "会话密钥" 0.7
export const GAME = e(450, -100, { scale: 0.7 });        // E01 miniVend kind plain "游戏合约" 0.7
export const TOKSAFE = e(800, -180, { scale: 0.8 });     // kit safe "代币 / NFT" 0.8 (wrap!), closed, green glow
export const DOTS_E = e(520, -40);                       // red dot matrix (40 dots) out of GAME, EXT.dotsE

// ---- F 最右·意图集市 (seg5 L13–L27; seg6 L6, start)
const fz = zone(12100, 0);
export const SIGN_F = fz(-800, -300);                    // E01 signBoard plate "意图与授权"
export const ORDER = fz(-500, -60);                      // kit doc standing "意图订单" ["1 ETH →","至少 3000 USDC","期限"]
export const SOLVER = fz(-280, 120, { scale: 0.8 });     // E08 liqBot "Solver" 0.8
export const SETTLE = fz(0, -150);                       // E03 contractMachine name "结算合约" tone light (original size)
export const VULN = fz(420, 120, { scale: 0.8 });        // E01 miniVend kind attacker "有漏洞的合约" 0.8
export const FPIPE = route(SETTLE, VULN, 60, [120, 0], [0, -40]); // E01 pipe "DAI · 无限授权" settle → vulnerable contract
export const BOND = fz(100, 280, { scale: 0.8 });        // kit safe gold "保证金" 0.8 (wrap!) — L20 door opens, gold back to SETTLE
export const SIGN_V1 = fz(500, -380);                    // E01 signBoard plate "已弃用 · Fusion v1" (grey)
export const RESOLVER = fz(300, -120, { scale: 0.7 });   // kit person engineer "Resolver" 0.7
export const PERMIT = fz(1000, -100);                    // E03 contractMachine name "Permit2" tone gray (original size)
export const PKEY = fz(900, 180);                        // kit key "无限授权"
export const OFFSIG = fz(1150, 200);                     // E09 cheque "链下签名" (state attacker in L26)
export const DOTS_F = fz(550, 280);                      // red dot matrix (17 / 50 dots) from the settlement side, EXT.dotsF
export const DOTS_F2 = fz(1250, -260);                   // red dot matrix (14 dots) for Permit2 phishing, EXT.dotsF2

// ---- street furniture (native SVG)
export const ROAD = { x0: -900, x1: 13500, y0: 470, y1: 590 }; // light-grey stone road band in front of all zones (canvas px)
export const ZTAGS = { A: S(-700, 520), B: S(1300, 520), C: S(3150, 520), D: S(6200, 520), E: S(9100, 520), F: S(11300, 520) }; // ground zone tags on the road, EXT.ztag

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 (measured from the rendered SVGs:
// visible geometry only, contact shadows / glow and hidden layers excluded). [x0, y0, x1, y1]; y0 includes signs / dials / heads.
// delegateTag alone is [-25, -73, 25, -5]; hung via delegateTagOn it stays inside its addrPlate's box.
export const EXT = {
  signA: [-130, -239, 102, 48], signB: [-192, -261, 165, 70], sign4337: [-143, -244, 115, 53], sign7702: [-143, -244, 115, 53],
  signE: [-146, -245, 119, 54], signF: [-146, -245, 119, 54], signV1: [-231, -275, 204, 84],
  rack: [-113, -349, 113, 51], person: [-50, -208, 50, 7], personAtk: [-50, -229, 50, 7], safeHot: [-117, -250, 117, 52], safe: [-180, -376, 181, 82],
  addrPlate: [-56, -174, 57, 10], delegateTag: [-25, -73, 25, -5], coreModule: [-73, -179, 73, 32], knifeSwitch: [-153, -344, 133, 48],
  clock: [-76, -193, 61, 2], beacon: [-61, -118, 61, 30], tellerCounter: [-228, -343, 241, 92], cheque: [-75, -124, 74, 24],
  docStanding: [-84, -261, 82, 23], seal: [-146, -142, 147, 69], key: [-75, -35, 84, 31], letter: [-28, -56, 26, 0], sorter: [-211, -281, 253, 76],
  checkpoint: [-213, -307, 284, 143], accountSafe: [-259, -375, 259, 106], gasPump: [-64, -165, 64, 31], hashFunnel: [-111, -293, 111, 54],
  chain3: [-213, -171, 213, 85], chain2: [-139, -145, 139, 59], keycard: [-28, -85, 26, 9], miniVend: [-72, -197, 72, 31],
  slotCabinet: [-209, -467, 209, 90], browserWin: [-201, -332, 201, 81], magnifier: [-58, -260, 120, -105], phone: [-70, -195, 58, 27],
  thresholdMeter: [-52, -290, 92, 26], liqBot: [-40, -77, 45, 20], contractMachine: [-155, -246, 218, 76],
  linksB: [0, -80, 220, 60], steps: [-120, 0, 240, 60], dotsD: [0, 0, 260, 130], dotsE: [0, 0, 240, 120], dotsF: [0, 0, 240, 130], dotsF2: [0, 0, 200, 110],
  ztag: [-80, -20, 200, 40],
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
const R = {
  signA: rect(SIGN_A, "signA"), rack: rect(RACK, "rack"), atkA: rect(ATK_A, "personAtk"), hotsafe: rect(HOTSAFE, "safeHot"), plateA: rect(PLATE_A, "addrPlate"),
  coreA: rect(CORE_A, "coreModule"), switch: rect(SWITCH, "knifeSwitch"), clock: rect(CLOCK, "clock"), beacon: rect(BEACON, "beacon"),
  signB: rect(SIGN_B, "signB"), counter: rect(COUNTER, "tellerCounter"), signer: rect(SIGNER_B, "person"), helper: rect(HELPER_B, "person"),
  chequeB: rect(CHEQUE_B, "cheque"), auth: rect(AUTH_B, "docStanding"), auth2: rect(AUTH2_B, "docStanding"), seal: rect(SEAL_B, "seal"), keyB: rect(KEY_B, "key"), links: rect(LINKS_B, "linksB"),
  signC: rect(SIGN_C, "sign4337"), letters: LETTERS.map((q) => rect(q, "letter")), sorter: rect(SORTER, "sorter"), gate: rect(GATE, "checkpoint"),
  account: rect(ACCOUNT, "accountSafe"), pump: rect(PUMP, "gasPump"), funnel: rect(FUNNEL, "hashFunnel"), ucheque: rect(UCHEQUE, "cheque"), pcheque: rect(PCHEQUE, "cheque"),
  chainA: rect(CHAIN_A, "chain3"), chainB: rect(CHAIN_B, "chain3"), steps: rect(STEPS, "steps"), impl: rect(IMPL, "coreModule"), skey: rect(SKEY, "keycard"),
  signD: rect(SIGN_D, "sign7702"), dsafe: rect(DSAFE, "safe"), plateD: rect(PLATE_D, "addrPlate"), dcheque: rect(DCHEQUE, "cheque"),
  dcoreOk: rect(DCORE_OK, "coreModule"), dcoreBad: rect(DCORE_BAD, "coreModule"), chainsD: CHAINS_D.map((q) => rect(q, "chain2")), batch: rect(BATCH, "docStanding"),
  magD: rect(MAG_D, "magnifier"), sweeps: SWEEPS.map((q) => rect(q, "miniVend")), dotsD: rect(DOTS_D, "dotsD"), slots: rect(SLOTS, "slotCabinet"),
  dcoreDev: rect(DCORE_DEV, "coreModule"), browserD: rect(BROWSER_D, "browserWin"),
  signE: rect(SIGN_E, "signE"), phone: rect(PHONE, "phone"), malext: rect(MALEXT, "browserWin"), meter: rect(METER_E, "thresholdMeter"),
  guards: GUARDS.map((q) => rect(q, "person")), mkey: rect(MKEY, "key"), cards: KEYCARDS.map((q) => rect(q, "keycard")), game: rect(GAME, "miniVend"),
  toksafe: rect(TOKSAFE, "safe"), dotsE: rect(DOTS_E, "dotsE"),
  signF: rect(SIGN_F, "signF"), order: rect(ORDER, "docStanding"), solver: rect(SOLVER, "liqBot"), settle: rect(SETTLE, "contractMachine"), vuln: rect(VULN, "miniVend"),
  bond: rect(BOND, "safe"), signV1: rect(SIGN_V1, "signV1"), resolver: rect(RESOLVER, "person"), permit: rect(PERMIT, "contractMachine"), pkey: rect(PKEY, "key"),
  offsig: rect(OFFSIG, "cheque"), dotsF: rect(DOTS_F, "dotsF"), dotsF2: rect(DOTS_F2, "dotsF2"),
};
export const ZONE_RECTS = {
  A: [R.signA, R.rack, R.atkA, R.hotsafe, R.plateA, R.coreA, R.switch, R.clock, R.beacon],
  B: [R.signB, R.counter, R.signer, R.helper, R.chequeB, R.auth, R.auth2, R.seal, R.keyB, R.links],
  C: [R.signC, ...R.letters, R.sorter, R.gate, R.account, R.pump, R.funnel, R.ucheque, R.pcheque, R.chainA, R.chainB, R.steps, R.impl, R.skey],
  D: [R.signD, R.dsafe, R.plateD, R.dcheque, R.dcoreOk, R.dcoreBad, ...R.chainsD, R.batch, R.magD, ...R.sweeps, R.dotsD, R.slots, R.dcoreDev, R.browserD],
  E: [R.signE, R.phone, R.malext, R.meter, ...R.guards, R.mkey, ...R.cards, R.game, R.toksafe, R.dotsE],
  F: [R.signF, R.order, R.solver, R.settle, R.vuln, R.bond, R.signV1, R.resolver, R.permit, R.pkey, R.offsig, R.dotsF, R.dotsF2],
};
const Z = ZONE_RECTS;
const SAFE = [100, 280, 1820, 860];                      // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for code cards / event cards at the sides
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur). Screen bboxes are [x0, y0, x1, y1] on the 1920×1080 frame.
export const CAMS = {
  // ---- A 托管机房
  A: fit(Z.A, SAFE),                                                                        // A 全景（seg6 L4）
  hotA: fit([R.rack, R.atkA, R.hotsafe, R.plateA, R.coreA], MID),                           // 机柜 + 攻击者 + 热钱包 + 门牌/挂牌 + 攻击者合约（seg1 起点 L0–L3）
  clockA: fit([R.plateA, R.coreA, R.switch, R.clock, R.beacon], MID),                       // 门牌/挂牌 + 闸刀 + 时钟 + 告警灯（seg1 L4–L7；seg6 L7–L10）
  // ---- B 银行柜台
  bankB: fit(Z.B, SAFE),                                                                    // seg1 L8–L10 终点；seg2 L0–L9
  // ---- C 4337 流水线
  flowC: fit(Z.C, SAFE),                                                                    // 全景（seg2 L10、L17–L18 终点；seg3 L22–L23 终点；seg4 起点）
  hashC: fit([R.sorter, ...R.letters, R.funnel, R.ucheque], MID),                           // 哈希漏斗 + 用户签名支票（seg3 L0–L6）
  payC: fit([R.pump, R.pcheque, R.gate], MID),                                              // 加油机 + Paymaster 签名 + 道闸（seg3 L7、L9–L11）
  ownerC: fit([R.account, R.chainA, R.chainB], MID),                                        // 智能账户 + 链 A / 链 B（seg3 L12–L19）
  bicoC: fit([R.impl, R.skey, R.pcheque], MID),                                             // Biconomy 角（seg3 L20–L21）
  envC: fit([...R.letters, R.sorter, R.gate, R.account, R.pump, R.steps], SAFE),            // 跟着信封走：信封 → Bundler → 道闸 → 智能账户 / 加油机（seg2 L11–L16）
  // ---- D 7702
  D: fit(Z.D, SAFE),                                                                        // D 全景
  plateD: fit([R.dsafe, R.plateD, R.dcheque, R.dcoreOk, R.dcoreBad], MID),                  // 门牌 + 挂牌 + 授权支票 + 两个合约（seg4 L0–L7；seg6 L2、L5）
  chainsD: fit([R.plateD, R.dcoreOk, R.dcoreBad, ...R.chainsD], MID),                       // 拉开看三条链（seg4 L8–L10）
  batchD: fit([R.dsafe, R.plateD, R.batch, R.magD, ...R.sweeps, R.dotsD], SAFE),            // 批量文件 + 扫币合约 + 资产柜 + 点阵（seg4 L11–L18）
  devD: fit([R.slots, R.dcoreDev, R.browserD], MID),                                        // 存储柜 + 新合约 + 网页（seg4 L19–L26 终点；seg5 起点）
  // ---- E 钥匙与守护人
  E: fit(Z.E, SAFE),                                                                        // E 全景
  passE: fit([R.phone, R.malext, R.meter, ...R.guards], MID),                               // Passkey + 恶意扩展 + 守护人（seg5 L0–L5）
  sessionE: fit([R.mkey, ...R.cards, R.game, R.toksafe, R.dotsE], MID),                     // 会话密钥 + 游戏合约 + 代币保险柜（seg5 L6–L12）
  // ---- F 意图集市
  F: fit(Z.F, SAFE),                                                                        // F 全景
  intentF: fit([R.order, R.solver, R.settle, R.vuln, R.bond, R.signV1, R.resolver, R.dotsF], SAFE), // 意图订单 + Solver + 结算合约 + 有漏洞的合约 + 保证金 + Fusion v1（seg5 L13–L23）
  permitF: fit([R.permit, R.pkey, R.offsig, R.dotsF2], MID),                                // Permit2（seg5 L24–L27 终点；seg6 起点）
  // ---- across zones
  EF: fit([...Z.E, ...Z.F], SAFE),                                                          // E + F（seg6 L6：会话密钥与 Permit2 旧授权依次撤销）
  wide: fit([...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E, ...Z.F], [60, 200, 1860, 860], 1),     // 签名街全景（seg6 L0、L11–L12）
};
/** whole-street summary: zones in order with their anchor px and the cam to use */
export const world = {
  name: "签名街",
  zones: [
    { id: "A", name: "托管机房", anchor: [0, 0], cam: "A" }, { id: "B", name: "银行柜台", anchor: [1900, 0], cam: "bankB" },
    { id: "C", name: "4337 流水线", anchor: [4100, 0], cam: "flowC" }, { id: "D", name: "地址门牌街", anchor: [7100, 0], cam: "D" },
    { id: "E", name: "钥匙与守护人", anchor: [9850, 0], cam: "E" }, { id: "F", name: "意图集市", anchor: [12100, 0], cam: "F" },
  ],
  road: ROAD,
};
