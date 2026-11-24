// ep17「读链大街」shared world layout — one continuous isometric world, fixed for all six segments:
//   import * as L from "../../shared/layout.mjs";   (from ep17/segN/src/build-story.mjs; segbase starters already do this)
//   A: SIGNA, BRIDGE, FAKE, EXTRPC, FORKA, ATKA, DESKA, DOTSA, APIPE, ALETTER
//   B: CHAINB, NODEB, RPCB, IDXB, EXCHB, BPIPE, LAYERS, MINORITY, FORKB, ATKSRV, PHISH, DOTSB, SIGNWIN, WINDOW, WATCHER
//   C: SIGNC, PEER, ADDR, ATKNODES, ATKCHAIN, VICTIM, RESTART, BACKUP, PORTRPC, FIREWALL, JWT, SCAN, EXEC, CONS, ENGINE
//   D: SIGND, HOSTS, VKEYS, OPS, CLOCKD, ETHCHAIN, SLASHDB, WAITD, DOPPEL, BUILDER, RELAY, HEADER, PROPOSER, BUNDLES, DOTS20, DOTS100
//   E: SIGNE, QRPC, METERE, CMPE, DESKE, KNIFEE, CLIENTS, ROLES, PHONE
//   ROAD, EXT, rect, fit, ZONE_RECTS, CAMS, world
// Positions only; ids, states, labels and per-shot opts stay in each segment. Never use the ids `cam` or `root` (#cam is the stage camera).
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Every position is written as S(X, Y) = the world point whose ground lands on world-canvas px (X, Y) (iso.G, rounded) —
// so the numbers read as on-screen ground positions at camera scale 1. `scale` = the opts.scale to pass to the object.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): only kit person / ledgerBook, E05 keycard, E07 dispatchDesk, E09 commitBox, E16 forkSwitch and
//   ep17 viewWindow / peerPanel take opts.scale. Everything else IGNORES it. Where such an object carries `scale` + `wrap: true` below
//   (BRIDGE = E01 bridge 0.6, MINORITY = kit chain 0.8, ATKSRV = kit rack 0.7, PHISH = kit browserWin 0.6, EXEC / CONS = kit rack 0.7,
//   METERE = E05 thresholdMeter 0.8, CLIENTS = kit rack 0.75), the segment MUST put it with the wrap helper (translate · scale · translate
//   around its ground point) and rescale its anchors; rect() / CAMS already assume the scaled size.
// The street runs along +u (left → right on screen, rising ≈ 0.35 px per px): each zone's anchor sits on the u axis through A.
// Zones (zone anchor in world-canvas px; local boxes are relative to it):
//   A 跨链桥头 (0, 0)          local X ≈ −980..1060, Y ≈ −460..450
//   B 数据管线街 (2600, −911)  local X ≈ −1190..1750, Y ≈ −350..660
//   C 节点小屋 (5600, −1963)   local X ≈ −1030..1430, Y ≈ −530..570
//   D 验证者机房 (8300, −2909) local X ≈ −1030..1830, Y ≈ −410..490
//   E 仲裁台 (11400, −3995)    local X ≈ −1030..1810, Y ≈ −520..520
// Neighbouring zones are ≥ ~240 canvas px apart edge to edge along X. Native-SVG areas (dot matrices) are a ground origin + an EXT box.
// EXT for dbLedger / firewall / viewWindow / peerPanel is estimated from their 3-D boxes (not measured from a render) — leave ~20 px slack.
import { Wp, G, camAt } from "../../kit/iso.mjs";

/** world ground point for world-canvas px (X, Y); extra fields (scale, z, wrap …) copied in */
const S = (X, Y, extra = {}) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
/** zone-local placer: positions below are written relative to the zone's anchor px */
const zone = (OX, OY) => (X, Y, extra) => S(OX + X, OY + Y, extra);
/** zone anchor on the street (+u axis through A) */
const ZY = (OX) => Math.round(-OX * 0.287 / 0.819);
/** axis-aligned pipe route a → b for E01 pipe: { o, pts } — put(id, r.o, E1.pipe(r.o, { id, pts: r.pts })). Leaves a along u first, then v. */
const route = (a, b, z = 90, a0 = [0, 0], b0 = [0, 0]) => {
  const du = b.u + b0[0] - a.u, dv = b.v + b0[1] - a.v;
  return { o: { u: a.u, v: a.v }, pts: [[a0[0], a0[1], z], [du, a0[1], z], [du, dv, z]] };
};

// ---- A 跨链桥头·KelpDAO (seg1 全段; seg5 L0–L3, L10; seg6 L6–L9)
const a = zone(0, 0);
export const SIGNA = a(-760, -80);                       // E01 signBoard plate "跨链桥 · KelpDAO"
export const BRIDGE = a(-300, 60, { scale: 0.6, wrap: true }); // E01 bridge booth normal (岗亭 = 跨链验证者) — wrap 0.6!
export const FAKE = [a(150, -60), a(330, 0)];            // kit rpc ×2 "被替换的节点" (attacker from seg1 L3)
export const EXTRPC = [a(800, -200), a(980, -140)];      // kit rpc ×2 "外部 RPC" (broken in seg1 L6)
export const FORKA = a(620, 80, { scale: 0.8 });         // E16 forkSwitch labels ["外部 RPC","被替换的节点"], thrown in seg1 L7
export const ATKA = a(20, 170, { scale: 0.7 });          // kit person attacker 0.7
export const DESKA = a(520, 380);                        // kit desk "监控" (screen "一切正常 ✓")
export const DOTSA = a(-650, 300);                       // dot matrix area (29 dots, 1 dot ≈ 1000 万美元), EXT.dotsA
export const APIPE = {                                   // E01 pipe routes (world units): replaced RPC → bridge booth, external RPC → fork
  fake0: route(FAKE[0], BRIDGE, 60, [-60, 0], [80, 0]),
  fake1: route(FAKE[1], BRIDGE, 40, [-60, 20], [80, 30]),
  ext: route(EXTRPC[0], FORKA, 40, [0, 60], [40, 0]),
};
export const ALETTER = [a(-20, 40, { z: 60 }), a(60, 80, { z: 60 })]; // E01 letter red "伪造数据" / teal "真实数据" start points

// ---- B 数据管线街·分层 (seg2 全段; seg5 L14)
const OB = 2600, b = zone(OB, ZY(OB));
export const CHAINB = b(-900, 0);                        // kit chain n 4 "P2P 网络"
export const NODEB = b(-380, 0);                         // kit rack tag "节点客户端" (original size)
export const RPCB = b(-80, 0);                           // kit rpc "RPC 服务"
export const IDXB = b(200, 0);                           // kit dbLedger tag "索引器"
export const EXCHB = b(480, 0, { scale: 0.8 });          // E07 dispatchDesk "交易所系统" 0.8
export const BPIPE = {                                   // E01 pipe chain → node → RPC → indexer → desk
  node: route(CHAINB, NODEB, 50, [240, 0], [-90, 0]),
  rpc: route(NODEB, RPCB, 60, [90, 0], [-60, 0]),
  idx: route(RPCB, IDXB, 50, [60, 0], [-70, 0]),
  desk: route(IDXB, EXCHB, 40, [70, 0], [-80, 0]),
};
export const LAYERS = [b(-380, 320), b(-60, 320), b(230, 320), b(820, 400)]; // E01 signBoard plate ×4 "节点客户端" "RPC 服务" "索引器" "网络路由"
export const MINORITY = b(-850, 300, { scale: 0.8, wrap: true }); // kit chain n 3 "少数派分叉" (blockStates all attacker) — wrap 0.8!
export const FORKB = b(800, 100, { scale: 0.9 });        // E16 forkSwitch labels ["真实服务器","攻击者服务器"] (BGP)
export const ATKSRV = b(1100, -80, { scale: 0.7, wrap: true }); // kit rack tag "攻击者服务器" attacker — wrap 0.7!
export const PHISH = b(1150, 220, { scale: 0.6, wrap: true });  // kit browserWin title "钓鱼站" attacker — wrap 0.6!
export const DOTSB = b(950, 520);                        // 3 dot clusters (MyEtherWallet 3 / KLAYswap 38 / Celer 5, 1 dot ≈ 5 万美元), EXT.dotsB
export const SIGNWIN = b(1380, -60);                     // E01 signBoard plate "比喻 · 窗户"
export const WINDOW = b(1600, 0, { scale: 1 });          // ep17 viewWindow "屏幕" (front faces +v → the watcher stands down-right of it)
export const WATCHER = b(1720, 130, { scale: 0.6 });     // kit person signer 0.6 "看窗的人"

// ---- C 节点小屋·P2P 与端口 (seg3 全段; seg5 L13)
const OC = 5600, c = zone(OC, ZY(OC));
export const SIGNC = c(-900, -150);                      // E01 signBoard plate "P2P 网络"
export const PEER = c(-500, 0, { scale: 1 });            // ep17 peerPanel "对等连接" (8 ports)
export const ADDR = c(-50, -60);                         // E03 slotCabinet title "地址表" (original size)
export const ATKNODES = [c(-820, 60), c(-740, 110), c(-660, 160)].map((q) => ({ ...q, scale: 0.55 })); // kit person attacker ×3 0.55 "攻击者节点"
export const ATKCHAIN = c(-400, 380);                    // kit chain n 3 "攻击者给的链" attacker (original size)
export const VICTIM = c(450, -40);                       // kit rack tag "受害节点" (original size; "同步 ✓" screen drawn by the segment)
export const RESTART = c(780, 40);                       // kit knifeSwitch text "重启"
export const BACKUP = c(1100, -60);                      // kit rpc "备用节点" attacker
export const PORTRPC = c(180, 330);                      // kit rpc (side port tag "8545" drawn by the segment)
export const FIREWALL = c(500, 500);                     // E01 firewall len 200 "只放行 P2P 端口"
export const JWT = c(800, 520, { scale: 0.8 });          // E05 keycard "JWT" 0.8
export const SCAN = c(-60, 620);                         // kit magnifier (attacker "扫描")
export const EXEC = c(1050, 380, { scale: 0.7, wrap: true });  // kit rack tag "执行客户端" — wrap 0.7!
export const CONS = c(1350, 480, { scale: 0.7, wrap: true });  // kit rack tag "共识客户端" — wrap 0.7!
export const ENGINE = route(EXEC, CONS, 60, [60, 0], [-60, 0]); // E01 pipe "Engine API"

// ---- D 验证者机房·签名 (seg4 全段; seg6 L3)
const OD = 8300, d = zone(OD, ZY(OD));
export const SIGND = d(-900, -150);                      // E01 signBoard plate "验证者机房"
export const HOSTS = [d(-500, 0), d(-150, -60)];         // kit rack ×2 tag "主机 A" "备用机 B" (original size)
export const VKEYS = [d(-500, 150), d(-150, 110)];       // kit key ×2 (the same "验证者密钥", one copy per host)
export const OPS = d(-780, 180, { scale: 0.6 });         // kit person engineer 0.6 "运维"
export const CLOCKD = d(150, -120);                      // kit clock h 3 (凌晨)
export const ETHCHAIN = d(-350, 380);                    // kit chain n 4 "以太坊网络"
export const SLASHDB = d(150, 200, { scale: 0.8 });      // kit ledgerBook "防罚没数据" 0.8
export const WAITD = d(380, 60);                         // kit hourglass "至少 2 个 epoch"
export const DOPPEL = d(420, 320);                       // kit shield "分身检测"
export const BUILDER = d(900, -60);                      // E01 sorter "构建者" blockLabel "区块" (original size; no walk on a scaled sorter)
export const RELAY = d(1350, 40, { scale: 0.8 });        // E09 commitBox name "relay" 0.8
export const HEADER = d(1600, -100);                     // kit doc standing title "区块头"
export const PROPOSER = d(1800, 60, { scale: 0.6 });     // kit person signer 0.6 "提议者" → swap to attacker 0.7 "恶意提议者" at the same spot
export const BUNDLES = [d(700, 150, { z: 0 }), d(760, 180, { z: 0 }), d(820, 210, { z: 0 })]; // E01 letter ×3 "交易包"
export const DOTS20 = d(1000, 260);                      // 20 dots (1 dot ≈ 100 万美元), EXT.dots20
export const DOTS100 = d(1350, 220);                     // 10 × 10 dots (1 dot = 1% 区块), EXT.dots100

// ---- E 仲裁台·防御 + 收尾 (seg5 L3–L16; seg6 全段)
const OE = 11400, e = zone(OE, ZY(OE));
export const SIGNE = e(-900, -150);                      // E01 signBoard plate "多源仲裁"
export const QRPC = [e(-500, 0), e(-280, 40), e(-60, 80)]; // kit rpc ×3 "自建节点" "第三方 A" "第三方 A 的第二个节点"
export const METERE = e(250, -40, { scale: 0.8, wrap: true }); // E05 thresholdMeter "法定数" th 2 — wrap 0.8!
export const CMPE = e(-300, -260);                       // kit magnifier "比对" (above the three RPCs)
export const DESKE = e(600, 60, { scale: 0.8 });         // E07 dispatchDesk "入账 / 跨链放行" 0.8
export const KNIFEE = e(850, -80);                       // kit knifeSwitch text "入账"
export const CLIENTS = [e(-400, 370), e(-150, 420)].map((q) => ({ ...q, wrap: true, scale: 0.75 })); // kit rack ×2 "客户端 A" "客户端 B" — wrap 0.75!
export const ROLES = e(1400, 0);                         // E05 roleBoard title "今天做一件事" (original size)
export const PHONE = e(1750, 150);                       // kit phone "钱包" (screen "换个 RPC 再看")

// street (native SVG): ground polyline along +u from A's left edge to E's right edge, world-canvas px
export const ROAD = [[-1100, 440], [OE + 1900, ZY(OE + 1900) + 440]];

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 ([x0, y0, x1, y1]; y0 includes signs / heads).
export const EXT = {
  signPlate: [-218, -270, 191, 79], signPlate5: [-146, -245, 119, 54], bridge: [-367, -208, 367, 207], rpc: [-77, -258, 78, 38],
  forkSwitch: [-44, -116, 53, 23], person: [-50, -208, 50, 7], personAtk: [-50, -229, 50, 7], desk: [-147, -272, 147, 74],
  chain3: [-213, -171, 213, 85], chain4: [-287, -197, 287, 110], rack: [-113, -349, 113, 51], dbLedger: [-80, -200, 80, 45],
  dispatchDesk: [-113, -147, 113, 44], browserWin: [-201, -332, 201, 81], viewWindow: [-78, -192, 88, 38], peerPanel: [-78, -156, 78, 33],
  slotCabinet: [-209, -467, 209, 90], knifeSwitch: [-153, -344, 133, 48], firewall: [-180, -225, 180, 70], keycard: [-28, -85, 26, 9],
  magnifier: [-58, -260, 120, -105], key: [-75, -35, 84, 31], clock: [-76, -193, 61, 2], ledgerBook: [-158, -97, 158, 74],
  hourglass: [-56, -201, 56, 28], shield: [-68, -218, 64, 28], sorter: [-211, -281, 253, 76], commitBox: [-94, -175, 95, 40],
  docStanding: [-84, -261, 82, 23], letter: [-28, -56, 26, 0], thresholdMeter: [-52, -290, 89, 26], roleBoard: [-194, -334, 187, 72],
  phone: [-70, -195, 58, 27],
  dotsA: [0, 0, 300, 100], dotsB: [0, 0, 420, 140], dots20: [0, 0, 260, 80], dots100: [0, 0, 200, 200],
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

// key objects per zone, by name (the rects each framing must hold)
const R = {
  signA: rect(SIGNA, "signPlate"), bridge: rect(BRIDGE, "bridge"), fake0: rect(FAKE[0], "rpc"), fake1: rect(FAKE[1], "rpc"),
  ext0: rect(EXTRPC[0], "rpc"), ext1: rect(EXTRPC[1], "rpc"), forkA: rect(FORKA, "forkSwitch"), atkA: rect(ATKA, "personAtk"),
  deskA: rect(DESKA, "desk"), dotsA: rect(DOTSA, "dotsA"),
  chainB: rect(CHAINB, "chain4"), nodeB: rect(NODEB, "rack"), rpcB: rect(RPCB, "rpc"), idxB: rect(IDXB, "dbLedger"), exchB: rect(EXCHB, "dispatchDesk"),
  layer0: rect(LAYERS[0], "signPlate5"), layer1: rect(LAYERS[1], "signPlate5"), layer2: rect(LAYERS[2], "signPlate5"), layer3: rect(LAYERS[3], "signPlate5"),
  minority: rect(MINORITY, "chain3"), forkB: rect(FORKB, "forkSwitch"), atkSrv: rect(ATKSRV, "rack"), phish: rect(PHISH, "browserWin"),
  dotsB: rect(DOTSB, "dotsB"), signWin: rect(SIGNWIN, "signPlate5"), window: rect(WINDOW, "viewWindow"), watcher: rect(WATCHER, "person"),
  signC: rect(SIGNC, "signPlate"), peer: rect(PEER, "peerPanel"), addr: rect(ADDR, "slotCabinet"),
  atkN0: rect(ATKNODES[0], "personAtk"), atkN1: rect(ATKNODES[1], "personAtk"), atkN2: rect(ATKNODES[2], "personAtk"), atkChain: rect(ATKCHAIN, "chain3"),
  victim: rect(VICTIM, "rack"), restart: rect(RESTART, "knifeSwitch"), backup: rect(BACKUP, "rpc"), portRpc: rect(PORTRPC, "rpc"),
  firewall: rect(FIREWALL, "firewall"), jwt: rect(JWT, "keycard"), scan: rect(SCAN, "magnifier"), exec: rect(EXEC, "rack"), cons: rect(CONS, "rack"),
  signD: rect(SIGND, "signPlate"), hostA: rect(HOSTS[0], "rack"), hostB: rect(HOSTS[1], "rack"), key0: rect(VKEYS[0], "key"), key1: rect(VKEYS[1], "key"),
  ops: rect(OPS, "person"), clockD: rect(CLOCKD, "clock"), ethChain: rect(ETHCHAIN, "chain4"), slashDb: rect(SLASHDB, "ledgerBook"),
  waitD: rect(WAITD, "hourglass"), doppel: rect(DOPPEL, "shield"), builder: rect(BUILDER, "sorter"), relay: rect(RELAY, "commitBox"),
  header: rect(HEADER, "docStanding"), proposer: rect(PROPOSER, "personAtk", 0.7), bundle0: rect(BUNDLES[0], "letter"), bundle2: rect(BUNDLES[2], "letter"),
  dots20: rect(DOTS20, "dots20"), dots100: rect(DOTS100, "dots100"),
  signE: rect(SIGNE, "signPlate"), q0: rect(QRPC[0], "rpc"), q1: rect(QRPC[1], "rpc"), q2: rect(QRPC[2], "rpc"), meterE: rect(METERE, "thresholdMeter"),
  cmpE: rect(CMPE, "magnifier"), deskE: rect(DESKE, "dispatchDesk"), knifeE: rect(KNIFEE, "knifeSwitch"), client0: rect(CLIENTS[0], "rack"),
  client1: rect(CLIENTS[1], "rack"), roles: rect(ROLES, "roleBoard"), phone: rect(PHONE, "phone"),
};
export const RECTS = R;
const pick = (s) => s.split(" ").map((k) => R[k]);
export const ZONE_RECTS = {
  A: pick("signA bridge fake0 fake1 ext0 ext1 forkA atkA deskA dotsA"),
  B: pick("chainB nodeB rpcB idxB exchB layer0 layer1 layer2 layer3 minority forkB atkSrv phish dotsB signWin window watcher"),
  C: pick("signC peer addr atkN0 atkN1 atkN2 atkChain victim restart backup portRpc firewall jwt scan exec cons"),
  D: pick("signD hostA hostB key0 key1 ops clockD ethChain slashDb waitD doppel builder relay header proposer bundle0 bundle2 dots20 dots100"),
  E: pick("signE q0 q1 q2 meterE cmpE deskE knifeE client0 client1 roles phone"),
};
const Z = ZONE_RECTS;
const SAFE = [100, 280, 1820, 860];                      // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for code cards / question card at the sides
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur). Screen bboxes are [x0, y0, x1, y1] on the 1920×1080 frame.
export const CAMS = {
  // A 近景：桥岗亭 + 两个被替换的 RPC + 桥头牌 + 攻击者（seg1 起点 L0–L5；seg5 L0–L2 回摇）
  //   k 0.953 · signA 300,326–689,658 · bridge 736,597–1155,835 · fake0 1302,356–1450,638 · fake1 1473,413–1620,695 · atkA 1217,668–1284,826
  bridgeA: fit(pick("signA bridge fake0 fake1 atkA"), MID, 1.4),
  // A 近景：外部 RPC ×2 + 扳道器 + 被替换的 RPC（seg1 L6–L8；seg5 L10 插回）
  //   k 1.006 · ext0 1118,300–1274,598 · ext1 1299,361–1455,659 · forkA 979,748–1057,860 · fake0 465,441–621,739 · fake1 645,501–801,799
  failA: fit(pick("ext0 ext1 forkA fake0 fake1"), MID, 1.4),
  // A 监控工位 + 被替换的 RPC（连线），右侧留题卡位置（seg1 L9–L12 终点、seg2 起点；seg6 L6–L9）
  //   k 0.725 · deskA 852,609–1065,860 · fake0 635,300–747,515 · fake1 765,344–877,558 · forkA 1006,522–1062,602
  monitorA: fit(pick("deskA fake0 fake1 forkA"), [300, 300, 1400, 860], 1.4),
  // A 全区（点阵 29 点在左下）
  //   k 0.636 · signA 313,349–573,571 · bridge 604,530–884,688 · fake0 981,369–1080,557 · fake1 1095,407–1194,595 · ext0 1395,280–1493,468
  //   ext1 1509,318–1607,507 · forkA 1307,563–1356,634 · atkA 925,578–969,683 · deskA 1172,640–1359,860 · dotsA 521,762–712,826
  A: fit(Z.A, SAFE, 1.4),
  // B 数据管线全景：链 → 节点 → RPC → 索引器 → 入账台 + 三块层牌 + 少数派分叉（seg2 L0–L4、L10–L11 横移到这里）
  //   k 0.802 · chainB 256,402–716,648 · nodeB 812,280–993,601 · rpcB 1081,353–1205,591 · idxB 1304,400–1432,596 · exchB 1519,466–1664,588
  //   layer0 785,620–997,860 · layer1 1042,620–1255,860 · layer2 1274,620–1487,860 · minority 389,691–662,855
  pipeB: fit(pick("chainB nodeB rpcB idxB exchB layer0 layer1 layer2 minority"), SAFE, 1.4),
  // B 近景：节点客户端 + 少数派分叉 + 主链（seg2 L5–L9）
  //   k 0.774 · chainB 502,418–946,655 · nodeB 1039,300–1214,610 · minority 630,697–894,855 · layer0 1013,628–1218,860 · rpcB 1298,371–1418,600
  clientB: fit(pick("chainB nodeB minority layer0 rpcB"), MID, 1.4),
  // B 近景：扳道器 + 攻击者服务器 + 钓鱼站 + 网络路由牌 + 三簇点阵（seg2 L12–L16）
  //   k 0.569 · forkB 892,482–941,553 · atkSrv 1040,300–1130,459 · phish 1045,496–1183,637 · layer3 843,572–994,743 · dotsB 1000,780–1239,860
  //   exchB 681,418–784,504
  routeB: fit(pick("forkB atkSrv phish layer3 dotsB exchB"), MID, 1.4),
  // B 窗户比喻：只有一扇窗 + 看窗的人 + 比喻牌（seg2 L17–L21 终点、seg3 起点；seg5 L14）
  //   k 1.276 · window 998,445–1210,738 · watcher 1213,695–1289,860 · signWin 631,300–969,681
  windowB: fit(pick("window watcher signWin"), MID, 1.4),
  // B 全区
  //   k 0.575 · chainB 116,367–446,544 · nodeB 515,280–645,510 · rpcB 708,332–797,502 · idxB 867,366–959,507 · exchB 1022,413–1126,501 · layer0 495,524–648,696
  //   layer1 680,524–832,696 · layer2 846,524–999,696 · layer3 1186,570–1338,741 · minority 211,575–407,692 · forkB 1235,478–1285,550 · atkSrv 1385,294–1476,455
  //   phish 1390,492–1529,635 · dotsB 1345,780–1586,860 · signWin 1507,305–1660,477 · window 1673,370–1769,503 · watcher 1770,483–1804,558
  B: fit(Z.B, SAFE, 1.4),
  // C 近景：插线板 + 地址表 + 攻击者节点 + 攻击者给的链 + P2P 牌（seg3 L0–L10；seg5 L13 插镜）
  //   k 0.564 · signC 600,361–831,557 · peer 904,510–992,616 · addr 1084,300–1320,614 · atkN0 752,560–783,634 · atkN1 797,588–828,661 · atkN2 843,617–874,690
  //   atkChain 884,715–1125,860
  peerC: fit(pick("signC peer addr atkN0 atkN1 atkN2 atkChain"), MID, 1.4),
  // C 近景：受害节点 + 重启闸刀 + 备用节点（seg3 L11–L16）
  //   k 1.174 · victim 466,300–731,770 · restart 807,400–1143,860 · backup 1272,383–1454,731
  nodeC: fit(pick("victim restart backup"), MID, 1.4),
  // C 近景：防火墙 + JWT + 扫描放大镜 + 8545 RPC + 执行 / 共识客户端（seg3 L17–L21 终点、seg4 起点）
  //   k 0.854 · firewall 674,541–981,793 · jwt 1064,692–1101,756 · scan 300,613–452,745 · portRpc 488,367–621,620 · exec 1229,422–1364,661
  //   cons 1485,507–1620,746
  portC: fit(pick("firewall jwt scan portRpc exec cons"), MID, 1.4),
  // C 全区
  //   k 0.529 · signC 286,336–503,521 · peer 572,476–654,576 · addr 741,280–962,575 · atkN0 429,524–458,593 · atkN1 472,550–501,619 · atkN2 514,577–543,645
  //   atkChain 553,669–779,805 · victim 1056,353–1175,564 · restart 1209,398–1361,605 · backup 1419,390–1501,547 · portRpc 932,597–1014,753
  //   firewall 1047,704–1238,860 · jwt 1289,798–1312,837 · scan 815,749–910,831 · exec 1391,630–1475,778 · cons 1550,683–1633,831
  C: fit(Z.C, SAFE, 1.4),
  // D 两台机柜 + 密钥 + 运维 + 时钟 + 以太坊网络 + 防罚没数据 / 等待 / 分身检测（seg4 L0–L11）
  //   k 0.637 · signD 450,280–710,502 · hostA 771,325–915,580 · hostB 995,287–1139,542 · key0 795,621–897,663 · key1 1019,595–1120,637 · ops 646,583–684,665
  //   clockD 1209,348–1296,472 · ethChain 756,664–1122,860 · slashDb 1177,626–1338,713 · waitD 1368,458–1439,604 · doppel 1386,613–1470,769
  slashD: fit(pick("signD hostA hostB key0 key1 ops clockD ethChain slashDb waitD doppel"), SAFE, 1.4),
  // D relay 区：构建者 + relay 投标箱 + 区块头 + 提议者 + 交易包 + 点阵（seg4 L12–L19 终点、seg5 起点；seg6 L3）
  //   k 0.717 · builder 555,314–888,570 · relay 975,487–1084,610 · header 1148,300–1267,504 · proposer 1327,487–1377,605 · bundle0 543,626–581,666
  //   bundle2 629,669–668,709 · dots20 778,745–965,802 · dots100 1030,717–1173,860
  relayD: fit(pick("builder relay header proposer bundle0 bundle2 dots20 dots100"), MID, 1.4),
  // D 全区
  //   k 0.582 · signD 101,305–339,508 · hostA 394,347–526,579 · hostB 598,312–730,544 · key0 416,617–509,655 · key1 620,593–713,632 · ops 280,582–315,657
  //   clockD 794,367–874,481 · ethChain 380,656–714,835 · slashDb 765,621–912,701 · waitD 940,468–1005,601 · doppel 956,609–1033,752 · builder 1152,351–1422,559
  //   relay 1493,491–1581,592 · header 1633,340–1730,505 · proposer 1779,491–1819,587 · bundle0 1142,604–1174,637 · bundle2 1212,639–1244,672
  //   dots20 1333,701–1484,747 · dots100 1537,678–1654,794
  D: fit(Z.D, SAFE, 1.4),
  // E 多源仲裁台：三个 RPC + 比对 + 法定数表 + 入账台 + 入账闸刀 + 客户端 A / B（seg5 L3–L16 终点、seg6 起点）
  //   k 0.593 · signE 337,339–580,546 · q0 658,435–750,611 · q1 789,459–880,635 · q2 919,483–1010,658 · cmpE 788,280–894,372 · meterE 1124,427–1191,577
  //   deskE 1302,554–1410,645 · knifeE 1413,337–1583,569 · client0 712,652–813,830 · client1 861,682–962,860
  quorumE: fit(pick("signE q0 q1 q2 cmpE meterE deskE knifeE client0 client1"), SAFE, 1.4),
  // E 角色板 + 手机（seg6 L0–L5）
  //   k 1.097 · roles 630,300–1048,745 · phone 1150,617–1290,860
  rolesE: fit(pick("roles phone"), MID, 1.4),
  // E 全区
  //   k 0.588 · signE 100,341–340,546 · q0 418,436–509,610 · q1 547,460–638,634 · q2 676,483–767,657 · meterE 880,428–946,577 · cmpE 547,282–651,374
  //   deskE 1057,554–1163,644 · knifeE 1167,339–1335,569 · client0 472,652–572,828 · client1 619,681–719,858 · roles 1466,392–1690,631 · phone 1745,562–1820,692
  E: fit(Z.E, SAFE, 1.4),
  // 读链大街全景 A → E（seg6 L10–L11 结束卡）
  //   k 0.125
  wide: fit([...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E], [70, 200, 1850, 860], 1),
};
export const world = CAMS.wide;                          // alias: whole-street framing
