// ep09「交易码头与签名柜台」shared world layout — one continuous isometric world, fixed for all six segments:
//   import { AMM, YOU, LETTER, METER, DOTS, AUCTION, MEMPOOL, SEARCHER, LENS, SORTER, CHAIN, PROPOSER, BLOCKDOC, STATIONS, BNB, TRON, MANTLE,
//            COMMIT, BOT, BATCH, SWAPVM, BANK, CHEQUE, CLAIM, SEAL, FUNNEL, SKEY, TWIN, ECLOCK, ZERO, ADMIN, SIGS, BYTES, WALLET1271,
//            PERMIT, EHW, ECLOCK2, VAULT, DESKS, SIGNERS, SIGNER_HW, FMETER, FLENS, SHIELD, KNIFE, ROLES, PIPE, PIPE_Z,
//            EXT, rect, fit, ZONE_RECTS, CAMS } from "../../shared/layout.mjs";
// (from ep09/segN/src/build-story.mjs). Positions only; ids, states, labels and per-shot opts stay in each segment.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Every position is written as S(X, Y) = the world point whose ground lands on world-canvas px (X, Y) (iso.G, rounded) —
// so the numbers read as on-screen ground positions at camera scale 1. `scale` = the opts.scale to pass to the object.
// Zones (world-canvas px, left → right):
//   A′ 拍卖比喻 (X ≈ −1530..−1000, Y ≈ 110..570) · A 交易广场 (X ≈ −310..380, Y ≈ −250..100, the ammPool at the origin)
//   B 内存池与构建场 straight above A (X ≈ −730..1250, Y ≈ −1350..−570; the sorter sits right behind the pool so CAMS.poolSorter works)
//   · D 协议设计角 right of A (X ≈ 960..2150, Y ≈ −270..120)
//   C 三链排序台 upper middle (X ≈ 1700..3880, Y ≈ −1920..−1230) · E 签名柜台 right (X ≈ 4770..8160, Y ≈ −850..150; sub-areas bank / claim / traps)
//   F 多签金库 far right (X ≈ 9450..11370, Y ≈ −680..340).
// Neighbouring zones are ≥ ~600 canvas px apart edge to edge, except A–B (≈ 320: the sorter is right behind the pool for seg2 L12–L19), A–D and A–A′ (camera "nudges");
// the per-zone framings in CAMS hold only their own zone's key objects. Per-object screen bboxes at each framing are quoted next to CAMS.
import { Wp, G, camAt } from "../../kit/iso.mjs";

/** world ground point for world-canvas px (X, Y); extra fields (scale …) copied in */
const S = (X, Y, extra = {}) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };

// ---- A 左前·交易广场 (seg1 L0–L3, L7–L13; seg2 L16–L23; seg3 L0–L8; seg6 L5, L7–L12)
export const AMM = S(0, 0);                              // ep08 ammPool, read "2,000"; outR spout ≈ (90, −23)
export const METER = S(230, 40, { scale: 0.9 });         // ep05 thresholdMeter "最小输出" beside the USDC spout, thText "最少 19000"
export const YOU = S(-260, 90);                          // kit person signer "你", front-left of the pool
export const LETTER = S(-215, 110, { z: 70 });           // ep01 letter "你的交易" held in front of YOU (pass opts.z); KITX01.walk it into PIPE.tx
export const DOTS = [-300, 160];                         // world-canvas px: 10 coin dots at YOU's feet / red profit dots (HTML pins)

// ---- A′ 左前角·拍卖比喻 (seg2 L20–L22): further −u (screen left-down) of A
export const AUCTION = {
  stand: S(-1250, 430),                                  // ep07 auctionStand (board "最高出价")
  you: S(-1480, 570),                                    // kit person signer "你" (raising the paddle)
  other: S(-1040, 570),                                  // kit person engineer "旁边的人"
};

// ---- B 左后·内存池与构建场 (seg1 L4–L6, L14–L15; seg2 L0–L15, L19; seg3 L1–L2): straight behind A (screen up)
export const MEMPOOL = S(-420, -1000);                   // ep01 mempool (entry −u front, exit +u back)
export const SEARCHER = S(-40, -700);                    // kit person attacker "搜索者", outside the rail, front-right of the pool
export const LENS = S(-60, -600);                        // kit magnifier held by the searcher, lens toward the queue (floats; overlaps its holder only)
export const SORTER = S(350, -650);                       // ep01 sorter plate "构建者", letters 3, red [0, 2]; belt runs +u, in-end faces the mempool exit
export const CHAIN = S(840, -1010);                     // kit chain n 3 ("区块"), starts at the sorter out-end
export const PROPOSER = S(1150, -1030);                  // kit person engineer "提议者" at the chain's end
export const BLOCKDOC = S(1170, -900, { scale: 0.5 });  // kit doc "区块" + price tag at the proposer's feet

// ---- C 中后·三链排序台 (seg3 L13–L22; seg4 L0): three stations in one row, 800 px apart
export const STATIONS = { bnb: S(2000, -1500), tron: S(2800, -1500), mantle: S(3600, -1500) };
const st = (k, dx, dy, extra) => { const [X, Y] = Wp(STATIONS[k].u, STATIONS[k].v); return S(X + dx, Y + dy, extra); };
export const BNB = {
  sign: st("bnb", -150, -150),                           // ep01 signBoard plate "BNB Chain"
  wheel: st("bnb", 0, 40),                               // ep09 rotaWheel n 6, speed 3 (转得快)
  clock: st("bnb", 190, 0),                              // kit clock "0.45 秒"
  mempool: st("bnb", 260, 200, { scale: 0.45 }),         // ep01 mempool small, n 3 ("红 · 你 · 红")
};
export const TRON = {
  sign: st("tron", -170, -170),                          // signBoard plate "TRON"
  wheel: st("tron", 0, 40, { scale: 1.2 }),              // rotaWheel n 27 (一格一格转)
  gauge: st("tron", 250, 10),                            // ep03 gasGauge label "优先费" + red X
};
export const MANTLE = {
  sign: st("mantle", -230, -200),                        // signBoard plate "Mantle"
  sorter: st("mantle", 0, 40, { scale: 0.6 }),           // ep01 sorter small, plate "排序器"
  operator: st("mantle", 230, 60),                       // kit person engineer "运营者"
  src: [Wp(STATIONS.mantle.u, STATIONS.mantle.v)[0] + 300, Wp(STATIONS.mantle.u, STATIONS.mantle.v)[1] - 150], // world-canvas px for the "L2BEAT" source tag
};

// ---- D 中前·协议设计角 (seg3 L4–L12): right of A, same baseline
export const SWAPVM = S(1050, 30, { scale: 0.7 });       // ep01 vending "交换合约" (code card A's red lines; 金库 / 自动复投 / 清算 tags beside it)
export const COMMIT = S(1450, 30, { scale: 1.3 });       // ep09 commitBox
export const BOT = S(1700, 90, { scale: 1.3 });          // ep08 liqBot scr "复制"
export const BATCH = S(1960, -80);                       // ep01 signBoard wood "批量拍卖 · 统一价格"

// ---- E 右区·签名柜台 (seg4 all; seg5 L0–L14): three sub-areas bank · claim · traps
export const BANK = S(5000, -500);                       // ep04 tellerCounter sign "银行"
export const CHEQUE = S(5450, -300, { scale: 1.8 });     // ep09 cheque (between the bank and the claim contracts)
export const CLAIM = {                                   // two ep01 vending "领取合约", same address on two chains
  eth: S(5900, -450, { scale: 0.8 }),
  bnb: S(6450, -450, { scale: 0.8 }),
  ethSign: S(5650, -600, { scale: 0.8 }),                // signBoard plate "以太坊"
  bnbSign: S(6200, -600, { scale: 0.8 }),                // signBoard plate "BNB Chain"
  ethRoll: S(6060, -330, { scale: 0.5 }),                // ep02 rollCounter (nonce, value 0), front-right of each vending
  bnbRoll: S(6610, -330, { scale: 0.5 }),
};
export const SEAL = S(5950, -150, { scale: 0.7 });       // kit seal markText "域"
export const FUNNEL = S(6400, -120, { scale: 0.8 });     // ep03 hashFunnel "类型哈希"
export const SKEY = S(5500, 0, { scale: 0.7 });          // ep03 selectorKey (A 钥匙 → B 锁)
export const TWIN = S(6150, -120, { scale: 0.45 });      // ep01 vending small, the twin contract (seg4 L11; grow it in)
export const ECLOCK = S(5700, -150, { scale: 0.7 });     // kit clock (seg4 L12 截止时间)
export const ZERO = S(7150, -500, { scale: 0.8 });       // ep07 emptyLot zero:true (ecrecover → 零地址)
export const ADMIN = S(7450, -650, { scale: 0.5 });      // ep07 emptyLot small = admin 门牌 "0" (seg5 L2)
export const SIGS = [S(7150, -150, { scale: 0.8 }), S(7330, -150, { scale: 0.8 })]; // ep02 sigPaper ×2 (tag "s" / "翻转")
export const BYTES = [S(7600, -250), S(7600, -130)];     // ep03 byteBlock rows "ab|c" / "a|bc"
export const WALLET1271 = S(8000, -450, { scale: 0.6 }); // ep05 accountSafe (ERC-1271)
export const PERMIT = { pool: S(8000, 0, { scale: 0.5 }), letter: S(7800, 80) }; // ep01 mempool small entrance + letter "permit 签名"
export const EHW = S(7200, 120, { scale: 0.8 });         // kit hwWallet "0x…" (seg5 L13)
export const ECLOCK2 = S(7600, 60, { scale: 0.7 });      // kit clock (seg5 L14 任意时间)

// ---- F 远右·多签金库 (seg5 L15–L26; seg6 L0–L4)
export const VAULT = S(10950, -380, { scale: 0.8 });     // kit safe (cold-wallet multisig; core → "attacker")
export const DESKS = [S(9600, -250), S(10050, -250), S(10500, -250)]; // kit desk ×3, screens = browserWin-style pages (page "普通转账", page2 "delegatecall")
// seated signers: kit person signer at each desk's chair anchor (desk local +u 50, +v 35) — they overlap their own desk by design
export const SIGNERS = DESKS.map((d) => ({ u: d.u + 50, v: d.v + 35 }));
export const SIGNER_HW = DESKS.map((d) => { const [X, Y] = Wp(d.u, d.v); return S(X + 180, Y + 130, { scale: 0.4 }); }); // kit hwWallet beside each desk
export const FMETER = S(11250, -200, { scale: 0.8 });    // ep05 thresholdMeter (多签阈值)
export const FLENS = S(10100, 100, { scale: 0.8 });       // kit magnifier (独立解码)
export const SHIELD = S(10880, -120, { scale: 0.8 });    // kit shield "白名单", in front of the vault
export const KNIFE = S(11200, 50, { scale: 0.6 });       // kit knifeSwitch "额外审批"
export const ROLES = {                                   // seg6 L0–L4: three roles standing in front of the desks
  eng: S(9700, 330),                                     // engineer
  aud: S(10000, 330),                                     // auditor (+ FLENS)
  user: S(10300, 330),                                    // ordinary user (signer)
};

// ---- pipes: ep01 pipe polylines [du, dv, z] relative to AMM (pipe(AMM, { pts }))
export const PIPE_Z = 40;
const rel = (p, du = 0, dv = 0) => [p.u + du - AMM.u, p.v + dv - AMM.v];
const MPIN = rel(MEMPOOL, -290, 84), SOIN = rel(SORTER, -230, 0);
export const PIPE = {
  // A → B: pool's +u face → +u → −v up to the mempool entry row → +u into the entry (−u front corner) (seg1 L4)
  tx: [[140, -30, PIPE_Z], [MPIN[0] - 180, -30, PIPE_Z], [MPIN[0] - 180, MPIN[1], PIPE_Z], [MPIN[0] - 10, MPIN[1], PIPE_Z]],
  // 私有通道 (covered pipe, appears in seg3 L1): pool's +u face → +u past the mempool's +u side → −v → into the sorter's in-end, never touching the mempool
  private: [[140, 30, 70], [SOIN[0] - 60, 30, 70], [SOIN[0] - 60, SOIN[1], 70], [SOIN[0] - 5, SOIN[1], 78]],
};

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 (measured from the rendered SVGs:
// visible geometry only, contact shadows and hidden layers excluded). [x0, y0, x1, y1]; y0 includes signs / dials / heads.
export const EXT = {
  ammPool: [-136, -215, 136, 61], thresholdMeter: [-52, -290, 146, 26], person: [-50, -208, 50, 7], letter: [-28, -56, 26, 0],
  auctionStand: [-114, -307, 88, 84], mempool: [-305, -346, 305, 139], magnifier: [-58, -260, 120, -105], sorter: [-211, -281, 253, 76],
  chain3: [-213, -171, 213, 85], doc: [-156, -85, 156, 82], signPlate: [-153, -247, 125, 56], signWood: [-189, -188, 189, 56],
  rotaWheel: [-112, -113, 112, 56], clock: [-76, -193, 61, 2], gasGauge: [-96, -256, 84, 32], liqBot: [-40, -77, 45, 20],
  commitBox: [-94, -175, 95, 40], vending: [-126, -330, 126, 55], tellerCounter: [-228, -343, 241, 92], cheque: [-75, -124, 74, 24],
  rollCounter: [-134, -117, 134, 30], seal: [-146, -142, 147, 69], hashFunnel: [-111, -294, 111, 54], selectorKey: [-148, -179, 275, 25],
  emptyLot: [-159, -135, 159, 76], sigPaper: [-84, -264, 79, 31], byteBlock: [-7, -74, 171, 5], accountSafe: [-259, -375, 259, 106],
  safe: [-180, -376, 181, 82], desk: [-147, -272, 147, 74], hwWallet: [-73, -60, 289, 33], shield: [-68, -218, 64, 28], knifeSwitch: [-153, -344, 133, 48],
};
// rect(o, kind, scale) → world-canvas bbox [x0, y0, x1, y1] of that object standing at o
export const rect = (o, kind, scale = o.scale ?? 1) => { const [X, Y] = Wp(o.u, o.v); const e = EXT[kind]; return [X + e[0] * scale, Y + e[1] * scale, X + e[2] * scale, Y + e[3] * scale]; };
// fit(rects, screenRect, kmax) → camera {x, y, scale} for KIT.cam / KIT.camSet, fitting the union of rects into screenRect
export const fit = (rects, [x0, y0, x1, y1], kmax = 1.4) => {
  const X0 = Math.min(...rects.map((r) => r[0])), Y0 = Math.min(...rects.map((r) => r[1]));
  const X1 = Math.max(...rects.map((r) => r[2])), Y1 = Math.max(...rects.map((r) => r[3]));
  const k = Math.min(kmax, (x1 - x0) / (X1 - X0), (y1 - y0) / (Y1 - Y0));
  return camAt([(X0 + X1) / 2, (Y0 + Y1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};

// key objects per zone (the rects each framing must hold)
export const ZONE_RECTS = {
  A: [rect(AMM, "ammPool"), rect(METER, "thresholdMeter"), rect(YOU, "person")],
  auction: [rect(AUCTION.stand, "auctionStand"), rect(AUCTION.you, "person"), rect(AUCTION.other, "person")],
  B: [rect(MEMPOOL, "mempool"), rect(SEARCHER, "person"), rect(LENS, "magnifier"), rect(SORTER, "sorter"), rect(CHAIN, "chain3"), rect(PROPOSER, "person"), rect(BLOCKDOC, "doc")],
  C: [
    rect(BNB.sign, "signPlate"), rect(BNB.wheel, "rotaWheel"), rect(BNB.clock, "clock"), rect(BNB.mempool, "mempool"),
    rect(TRON.sign, "signPlate"), rect(TRON.wheel, "rotaWheel"), rect(TRON.gauge, "gasGauge"),
    rect(MANTLE.sign, "signPlate"), rect(MANTLE.sorter, "sorter"), rect(MANTLE.operator, "person"),
  ],
  D: [rect(SWAPVM, "vending"), rect(COMMIT, "commitBox"), rect(BOT, "liqBot"), rect(BATCH, "signWood")],
  bank: [rect(BANK, "tellerCounter"), rect(CHEQUE, "cheque")],
  E: [
    rect(CHEQUE, "cheque"), rect(CLAIM.eth, "vending"), rect(CLAIM.bnb, "vending"), rect(CLAIM.ethSign, "signPlate"), rect(CLAIM.bnbSign, "signPlate"),
    rect(CLAIM.ethRoll, "rollCounter"), rect(CLAIM.bnbRoll, "rollCounter"), rect(SEAL, "seal"), rect(FUNNEL, "hashFunnel"), rect(SKEY, "selectorKey"),
    rect(TWIN, "vending"), rect(ECLOCK, "clock"),
  ],
  traps: [
    rect(ZERO, "emptyLot"), rect(ADMIN, "emptyLot"), ...SIGS.map((q) => rect(q, "sigPaper")), ...BYTES.map((q) => rect(q, "byteBlock")),
    rect(WALLET1271, "accountSafe"), rect(PERMIT.pool, "mempool"), rect(PERMIT.letter, "letter"), rect(EHW, "hwWallet"), rect(ECLOCK2, "clock"),
  ],
  F: [rect(VAULT, "safe"), ...DESKS.map((q) => rect(q, "desk")), ...SIGNER_HW.map((q) => rect(q, "hwWallet")), rect(FMETER, "thresholdMeter"),
    rect(FLENS, "magnifier"), rect(SHIELD, "shield"), rect(KNIFE, "knifeSwitch")],
  roles: Object.values(ROLES).map((p) => rect(p, "person")),
};
const Z = ZONE_RECTS;
const SAFE = [100, 280, 1820, 860];                      // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur). Screen bboxes below are [x0, y0, x1, y1] on the 1920×1080 frame.
export const CAMS = {
  // A 池子与"你"（seg1 起点、seg2 终点、seg3 起点、seg6 收尾前）— k 1.40 · you 490,502–630,803 · pool 734,366–1114,753 · meter 1181,357–1430,756
  A: fit(Z.A, [300, 300, 1620, 860], 1.4),
  // A′ 拍卖比喻（seg2 L20–L22）— k 1.23 · 你 627,595–751,860 · stand 832,300–1082,782 · 旁边的人 1169,595–1293,860
  auction: fit(Z.auction, [300, 300, 1620, 860], 1.4),
  // B 内存池 + 构建场全景（seg1 终点、seg2 起点）— k 0.75 · mempool 219,280–677,644 · searcher 696,609–771,770 (lens 675,645 in hand) · sorter 868,592–1216,860
  //   · chain 1235,404–1554,596 · proposer 1590,361–1665,522 · doc 1584,583–1701,646
  B: fit(Z.B, SAFE, 1.4),
  // 近景：内存池 + 搜索者 + 放大镜（seg1 L5–L6，seg3 L2 扑空）— k 0.86 · mempool 623,300–1147,716 · searcher 1168,676–1253,860 · lens 1144,717–1297,850; sorter / chain show at the right edge
  mempool: fit([rect(MEMPOOL, "mempool"), rect(SEARCHER, "person"), rect(LENS, "magnifier")], [260, 300, 1660, 860], 1.4),
  // 近景：构建者 → 区块 → 提议者 + 价签（seg2 L1–L4）— k 0.84 · sorter 492,559–883,860 · chain 904,348–1263,564 · proposer 1303,300–1387,481 · doc 1296,549–1428,620; mempool at the left edge
  build: fit([rect(SORTER, "sorter"), rect(CHAIN, "chain3"), rect(PROPOSER, "person"), rect(BLOCKDOC, "doc")], [200, 300, 1720, 860], 1.4),
  // 池子 + 构建者同框（seg2 L12–L19 三明治三步；seg3 L1–L2 私有通道）— k 0.64 · sorter 955,200–1253,429 · pool 779,660–953,837 · meter 984,656–1098,838 · you 667,722–731,860
  //   (mempool / searcher upper-left, D zone at the right edge)
  poolSorter: fit([...Z.A, rect(SORTER, "sorter")], [200, 200, 1720, 860], 1.4),
  // D 协议设计角（seg3 L9–L12）— k 1.20 · swapvm 300,430–511,752 · commitBox 738,435–1032,769 · bot 1121,659–1253,810 · batch sign 1268,350–1720,642
  D: fit(Z.D, [300, 300, 1720, 860], 1.4),
  // A + D 同框：代码卡 A 的红线落到量筒 / 现货价表 / 交换合约（seg3 L4–L8；代码卡放上方 y < 420）— k 0.72 · you 80,610–151,764 · pool 204,540–399,738 · meter 433,536–561,739
  //   · swapvm 990,550–1117,743 · commitBox 1252,553–1428,753 · bot 1482,687–1561,778 · batch 1570,502–1840,677; B zone shows above y ≈ 400
  AD: fit([...Z.A, ...Z.D], [80, 420, 1840, 860], 1.4),
  // C 三站并排（seg3 L13、L21–L22，seg3 终点、seg4 起点）— k 0.79 · BNB sign 100,330–319,569 · wheel 251,586–427,719 · clock 429,491–537,644 · mempool 436,678–652,850
  //   · TRON sign 715,314–934,553 · wheel 863,568–1075,728 · gauge 1090,449–1232,676 · Mantle sign 1297,290–1516,529 · sorter 1500,541–1719,710 · operator 1741,526–1820,695
  C: fit(Z.C, SAFE, 1.4),
  // 近景：各站（seg3 L14–L15 / L16–L18 / L19–L20）；左右会露出相邻站的边
  // bnb k 0.85 · sign 712,300–948,557 · wheel 875,575–1065,719 · clock 1067,473–1183,639 · mempool 1075,675–1308,860
  bnb: fit([rect(BNB.sign, "signPlate"), rect(BNB.wheel, "rotaWheel"), rect(BNB.clock, "clock"), rect(BNB.mempool, "mempool")], [400, 300, 1620, 860], 1.4),
  // tron k 1.07 · sign 659,300–956,623 · wheel 861,643–1148,860 · gauge 1168,483–1361,790
  tron: fit([rect(TRON.sign, "signPlate"), rect(TRON.wheel, "rotaWheel"), rect(TRON.gauge, "gasGauge")], [400, 300, 1620, 860], 1.4),
  // mantle k 1.05 · sign 661,300–953,618 · sorter 931,635–1224,860 · operator 1254,614–1359,840
  mantle: fit([rect(MANTLE.sign, "signPlate"), rect(MANTLE.sorter, "sorter"), rect(MANTLE.operator, "person")], [400, 300, 1620, 860], 1.4),
  // E 领取合约 ×2 + 支票 + 印章（seg4 L8–L23，seg4 终点、seg5 起点）— k 0.71 · cheque 476,475–667,665 · ETH vending 820,340–963,559 · BNB vending 1211,339–1354,558
  //   · signs 627,280–785,453 / 1018,280–1176,453 · rolls 958,571–1053,623 / 1349,571–1444,623 · seal 854,670–1000,775 · funnel 1184,595–1310,793
  //   · selectorKey 533,758–744,860 · twin 1029,657–1109,780 · clock 711,645–780,742; bank at the left edge, traps at the right edge
  E: fit(Z.E, SAFE, 1.4),
  // 近景：银行柜台 + 支票（seg4 L1–L7 支票比喻）— k 0.96 · teller 572,300–1020,716 · cheque 1092,605–1348,860
  bank: fit(Z.bank, [300, 300, 1620, 860], 1.4),
  // 近景：支票（seg4 L5、L8–L9 五格；seg5 L0）— k 1.88 · cheque 708,340–1212,840
  cheque: fit([rect(CHEQUE, "cheque")], [560, 340, 1360, 840], 2.4),
  // E 验签陷阱区（seg5 L1–L14）— k 0.67 · zero 580,354–751,467 · admin 813,280–920,351 · sigPaper 620,519–708,678 / 741,519–829,678 · bytes 963,544–1082,597 / 963,625–1082,678
  //   · accountSafe 1131,309–1340,502 · permit mempool 1134,646–1338,808 · letter 1083,778–1119,815 · hwWallet 660,810–854,860 · clock 932,711–996,803
  traps: fit(Z.traps, SAFE, 1.4),
  // F 多签金库（seg5 L15–L26，seg5 终点、seg6 起点）— k 0.76 · desks 230,401–454,665 / 573,402–797,666 / 917,401–1141,665 · hw 457,690… / 800,690… / 1143,690–1254,718
  //   · vault 1262,280–1483,560 · shield 1277,575–1358,725 · meter 1569,470–1690,663 · knife 1493,680–1624,860 · lens 688,717–797,812
  F: fit(Z.F, SAFE, 1.4),
  // 近景：三个工位 + 保险柜（seg5 L17–L22 假界面）— k 1.02 · desks 120,484–421,838 / 580,484–881,838 / 1041,484–1341,838 · vault 1504,322–1800,697
  desks: fit([...DESKS.map((q) => rect(q, "desk")), rect(VAULT, "safe")], [120, 300, 1800, 860], 1.4),
  // F 三角色站位（seg6 L0–L4）— k 0.68 · desks 557,280–756,514 / 861,280–1059,514 / 1164,280–1363,514 · lens 962,560–1059,643 · eng 690,715–757,860 · aud 892,715–960,860 · user 1095,715–1162,860
  roles: fit([...Z.roles, ...DESKS.map((q) => rect(q, "desk")), rect(FLENS, "magnifier")], SAFE, 1.4),
  // 全景：所有区（seg6 L10–L12 拉远收尾）— k 0.14
  world: fit([...Z.auction, ...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E, ...Z.traps, ...Z.F, ...Z.roles], [60, 200, 1860, 860], 1),
};
