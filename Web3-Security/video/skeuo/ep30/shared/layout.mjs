// ep30「联盟大厦」shared world layout — one continuous isometric world, fixed for all six segments:
//   import * as L from "../../shared/layout.mjs";   (from ep30/segN/src/build-story.mjs)
//   zone positions (A_*, B_*, C_*, D_*, E_*, F_* below); L.EXT, L.rect, L.fit, L.R, L.INSIDE, L.ZONE_RECTS, L.CAMS, L.world.
// Positions only; ids, states, labels and per-shot opts stay in each segment. Object ids must never be `cam` or `root`.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Like ep28, every position is written as a SCREEN px offset (X, Y) from its zone's anchor (U0, 0), converted to world (u, v)
//   (so the numbers read as on-screen ground positions at camera scale 1). The visitor route (native SVG dashed teal arrow) runs
//   along +u at v = 0 through every anchor: L.routeAt(u) gives a point on it, L.ROUTE_U its start / end.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): `scale` = the opts.scale to pass to the object. Only kit person / ledgerBook, E04 tellerCounter,
//   E05 keycard, E07 parcel, E09 rotaWheel, E11 snapshotCamera / mintPress, E16 forkSwitch, E17 peerPanel, E22 wrench and E24 saltShaker
//   take opts.scale. Everything else here that carries `scale` IGNORES it: the segment MUST put it with the wrap helper
//   (translate · scale · translate around its ground point) and rescale its anchors — marked "(wrap X!)" below; rect() / CAMS already
//   assume the scaled size. E01 signBoard (size, w) and kit doc (w, h) are sized by their own opts (rect() assumes the ep27/28 sizes:
//   docStanding = standing default, docFlat = flat card, docNote = small note); kit magnifier and beacon are original size (magnifier lifted with `z`).
//   E01 firewall: A uses len 160 (wrap 0.5!), B the gate len 160 (wrap 0.6!), E len 120 (wrap 0.4!).
// Zones (left → right, anchors U0 on v = 0; screen X of an anchor = 0.819·U0, screen Y = −0.287·U0):
//   A 记账大厅 U0 = 0 · B 门禁大堂 U0 = 4200 (广场 X < −900, 写字楼 −900..250, 不成立角 front, 阶梯 500, Ronin 850..1410)
//   · C Fabric 流水线 U0 = 8800 (①②③ back X −1250..180, 策略 / Raft 400..1400, 隐私角 front-left, 确定性角 front-right)
//   · D 治理层 U0 = 13400 (根 CA X < −700, 管理员 −450..310, 配置 / 退出 500..1220, 共谋 front-left, 云 front-right)
//   · E 两座别馆 U0 = 18200 (Corda X < 0, Besu 230..830, P2P front 130..830, 退役 ≥ 1000) · F 问询台 U0 = 22600.
// Native-SVG areas (hash label, path tags, title card, plaza, gate numbers, org dots, hash tags, partition, zone tags …) are given as a
//   ground origin + a box kind in EXT, so the segment knows where it may draw them.
// Overlap rule used by the check: within a zone no two object rects intersect, except the plaza floor and the five persons standing on it (INSIDE).
import { Wp, camAt } from "../../kit/iso.mjs";

/** zone-local placer: (X, Y) = SCREEN px offset (world-canvas px at camera scale 1) from the zone's anchor (U0, 0). */
const zone = (U0) => (X, Y, extra = {}) => ({ u: Math.round(U0 + 0.8192 * X - 1.1472 * Y), v: Math.round(0.5736 * X + 1.6383 * Y), ...extra });

export const U_A = 0, U_B = 4200, U_C = 8800, U_D = 13400, U_E = 18200, U_F = 22600;
/** visitor route (native SVG dashed teal arrow on the floor, v = 0): from left of A to the F desk */
export const ROUTE_U = [-1800, U_F + 1400];
export const routeAt = (u) => ({ u: Math.round(u), v: 0 });

// ---------------------------------------------------------------- A 记账大厅 (seg1 全段; seg2 L0) — U0 = 0
const a = zone(U_A);
export const A_RACKS = [a(-700, -100), a(-450, -100), a(450, -100), a(700, -100)].map((q) => ({ ...q, scale: 0.5 })); // kit rack ×4 tag "Org1"–"Org4" (wrap 0.5!)
export const A_CARDS = A_RACKS.map((q, i) => a([-700, -450, 450, 700][i] + 85, -80, { scale: 0.5 })); // E05 keycard ×4 green "有效证书" 0.5, right of each rack
export const A_LEDGERS = [-700, -450, 450, 700].map((X) => a(X, 40, { scale: 0.4 })); // kit ledgerBook ×4 "世界状态" 0.4, in front of each rack (left two "A B C", right two "A C B")
export const A_CHAIN = a(0, -260, { scale: 0.6 });          // kit chain n 3 (wrap 0.6!), last block labels "区块"
export const A_HASHLBL = a(0, -400);                         // native SVG hash label "同一个哈希" above the chain, EXT.hashLbl
export const A_FUNNEL = a(0, -10, { scale: 0.6 });          // E03 hashFunnel "解析" (wrap 0.6!), under the chain
export const A_PATHS = [a(-220, -60), a(220, -60)];          // native SVG path tags: left teal "交易 A B C" → left racks, right red "交易 A C B" → right racks, EXT.pathTag
export const A_FORK = a(0, 150, { scale: 0.6 });            // E16 forkSwitch "账本分叉" 0.6 (thrown), in front of the funnel
export const A_PROOF = a(1000, 120);                         // E02 proofCard "编码无歧义" (original size), repair corner (small text "修复版本 2.2.14 / 2.5.5")
export const A_GATE = a(-1050, 300, { scale: 0.5 });        // E01 firewall len 160 "门禁" (wrap 0.5!), outside, front-left
export const A_ATTACKER = a(-1250, 330, { scale: 0.4 });    // kit person attacker 0.4, grey, held outside the gate
export const A_TITLE = a(0, 390);                            // native SVG title card "风险在哪里？" + three lines, EXT.titleCard
export const A_TAG = a(-700, 300);                           // native SVG zone tag "记账大厅", EXT.zoneTag

// ---------------------------------------------------------------- B 门禁大堂 (seg2 全段; seg3 L0) — U0 = 4200
const b = zone(U_B);
export const B_PLAZA = b(-1300, 50);                         // native SVG round plaza "公共广场" (floor), EXT.plaza — the five persons stand on it
export const B_CROWD = [b(-1420, 40), b(-1340, 90), b(-1250, 20), b(-1180, 100), b(-1300, -30)].map((q) => ({ ...q, scale: 0.35 })); // kit person ×5 0.35
export const B_PCHAIN = b(-1500, -250, { scale: 0.35 });    // kit chain n 3 (wrap 0.35!), small, behind the plaza
export const B_DEPOSIT = b(-1050, -250, { scale: 0.45 });   // kit safe "押金" (wrap 0.45!)
export const B_SIGN = b(-800, -230);                         // E01 signBoard plate "联盟大厦" (default size)
export const B_GATE = b(-600, 0, { scale: 0.6 });           // E01 firewall len 160 "门禁闸机" (wrap 0.6!), card reader
export const B_HERO = b(-480, 80, { scale: 0.6 });          // E05 keycard teal role "成员" 0.6 (the hero badge, swiped at the gate)
export const B_TELLER = b(-250, -150, { scale: 0.55 });     // E04 tellerCounter "前台 · 发工牌" 0.55
export const B_STACK = [b(-60, -60), b(-25, -50), b(10, -40)].map((q) => ({ ...q, scale: 0.45 })); // E05 keycard ×3 0.45, badge stack by the counter
export const B_MASTER = b(150, -130, { scale: 0.6 });       // kit key "万能钥匙" (wrap 0.6!)
export const B_STAFF = b(150, 30, { scale: 0.45 });         // kit person engineer "物业" 0.45
export const B_CAMERA = b(-700, 380, { scale: 0.5 });       // E11 snapshotCamera "监控" 0.5 (metaphor-break corner)
export const B_ALARM = b(-500, 380);                         // kit beacon "报警" (original size)
export const B_SIGNERS = [b(-330, 330), b(-200, 290), b(-70, 330)].map((q) => ({ ...q, scale: 0.4 })); // kit person signer ×3 "多数成员" 0.4
export const B_BOOK = b(-200, 420, { scale: 0.5 });         // kit ledgerBook "业务状态" 0.5 (red dashed box + grey "合法" drawn by the segment)
export const B_ROLES = b(500, -80, { scale: 0.7 });         // E05 roleBoard title "攻击者控制的资源" (wrap 0.7!), four rows
export const B_KEYS = Array.from({ length: 9 }, (_, i) => b(850 + i * 70, 150, { scale: 0.35 })); // kit key ×9 (wrap 0.35!), five turn red
export const B_METER = b(1150, -80, { scale: 0.6 });        // E05 thresholdMeter max 9 th 5 "Ronin 桥" (wrap 0.6!)
export const B_TAG = b(-1300, 350);                          // native SVG zone tag "门禁大堂", EXT.zoneTag

// ---------------------------------------------------------------- C Fabric 流水线 (seg3 全段; seg4 L0) — U0 = 8800
const c = zone(U_C);
export const C_ENDORSERS = [c(-1200, -100), c(-950, -100)].map((q) => ({ ...q, scale: 0.5 })); // kit rack ×2 "背书节点" tag "Org1" "Org2" (wrap 0.5!)
export const C_RWSETS = [c(-1200, 120), c(-950, 120)].map((q) => ({ ...q, scale: 0.6 })); // E02 sigPaper ×2 "读写集" (wrap 0.6!)
export const C_SORTER = c(-550, -50, { scale: 0.6 });       // E01 sorter blockLabel "区块" "排序服务" (wrap 0.6! no walk for its letters)
export const C_LETTER = c(-400, 100);                        // E01 letter red-grey "无效" (original size), the rejected tx left in the block
export const C_GATE = c(-150, -50, { scale: 0.55 });        // kit checkpoint n "③" "背书策略 · 读集版本" (wrap 0.55!)
export const C_STATE = c(100, -20, { scale: 0.5 });         // kit ledgerBook "世界状态" 0.5
export const C_NUMS = [c(-1075, 250), c(-550, 150), c(-150, 150)]; // native SVG floor numbers ①②③, EXT.gateNum
export const C_POLICY = [c(450, -150), c(650, -150)];        // kit doc standing ×2 title "背书策略", lines ["通道成员多数"] green / ["任一组织"] red
export const C_ORGDOTS = c(550, 0);                          // native SVG four org dots under the policy boards, EXT.orgDots
export const C_RAFT = [900, 1010, 1120, 1230, 1340].map((X) => c(X, 0, { scale: 0.35 })); // kit rack ×5 "Raft" (wrap 0.35!), one turns red (leader)
export const C_RAFTLBL = c(1120, 120);                       // native SVG labels "崩溃容错 · 只防宕机" → "BFT · 分运营方", EXT.raftLbl
export const C_SAFE = c(-900, 450, { scale: 0.55 });        // kit safe "私有数据集合" (wrap 0.55!), door open, row "客户等级"
export const C_TRANSIENT = c(-650, 450);                     // kit envelope "transient" (default size)
export const C_FUNNEL = c(-450, 450, { scale: 0.45 });      // E03 hashFunnel "哈希" (wrap 0.45!), the second funnel
export const C_HASHTAGS = [c(-200, 330), c(-200, 400), c(-200, 470)]; // native SVG hash tags "A" "B" "C", EXT.hashTag
export const C_OUTSIDER = c(-20, 450, { scale: 0.4 });      // kit person attacker grey "圈外组织" 0.4
export const C_SALT = c(150, 450, { scale: 0.8 });          // E24 saltShaker "随机盐" 0.8
export const C_CLOCK = c(500, 450, { scale: 0.5 });         // kit clock "本地时间" (wrap 0.5!)
export const C_DIE = c(650, 450, { scale: 0.6 });           // E02 die "随机数" (wrap 0.6!)
export const C_DETSETS = [c(850, 450), c(1000, 450)].map((q) => ({ ...q, scale: 0.6 })); // E02 sigPaper ×2 (wrap 0.6!), mismatch red ✕ → match
export const C_TAG = c(-1300, 300);                          // native SVG zone tag "Fabric 流水线", EXT.zoneTag

// ---------------------------------------------------------------- D 治理层 (seg4 全段; seg5 L0) — U0 = 13400
const d = zone(U_D);
export const D_HSM = d(-1200, -100, { scale: 0.7 });        // kit hsm "根 CA · 离线" (wrap 0.7!), cut network line = native SVG
export const D_ONLINE = d(-950, -100, { scale: 0.5 });      // kit rack "在线服务器" (wrap 0.5!), broken demo
export const D_ICA = [d(-1200, 150), d(-1000, 150)].map((q) => ({ ...q, scale: 0.5 })); // kit seal ×2 "中间 CA" (wrap 0.5!)
export const D_CADOCS = [d(-1150, 380), d(-850, 380)];       // kit doc ×2 flat "身份 CA" / "TLS CA" (docFlat size)
export const D_WALL = d(-990, 380);                          // native SVG teal partition between the two CA docs, EXT.partition
export const D_VENDOR = d(-350, -100, { scale: 0.6 });      // kit desk "技术服务商" (wrap 0.6!)
export const D_VSTAFF = d(-350, 80, { scale: 0.45 });       // kit person engineer 0.45 (the vendor)
export const D_ADMINCARDS = [d(-180, -120), d(-140, -100), d(-100, -80)].map((q) => ({ ...q, scale: 0.5 })); // E05 keycard ×3 "Org1" "Org2" "Org3" 管理员 0.5
export const D_HOMES = [d(0, -150), d(130, -110), d(260, -70)].map((q) => ({ ...q, scale: 0.4 })); // kit rack ×3 (wrap 0.4!), each org's own rack the cards fly back to
export const D_CONFIG = d(550, -150);                        // kit doc standing title "通道配置"
export const D_SEALS = [d(500, 50), d(680, 50), d(860, 50)].map((q) => ({ ...q, scale: 0.5 })); // kit seal ×3 (wrap 0.5!), multi-org signatures
export const D_TRAIL = d(800, -150, { scale: 0.45 });       // kit ledgerBook "变更留痕" 0.45
export const D_REVOKED = d(1000, -150, { scale: 0.5 });     // E05 keycard red ✕ "吊销" 0.5
export const D_SHARED = d(1150, -150, { scale: 0.45 });     // kit ledgerBook "已分发数据" 0.45
export const D_HOUR = d(1050, 50, { scale: 0.5 });          // kit hourglass "不会自动过期" (wrap 0.5!), sand still
export const D_COLLUDERS = [d(-350, 380), d(-250, 420), d(-150, 380)].map((q) => ({ ...q, scale: 0.4 })); // kit person signer ×3 "达到门槛" 0.4
export const D_FAKE = d(-250, 520, { scale: 0.45 });        // kit ledgerBook red "虚假状态" 0.45
export const D_DIGEST = d(50, 450);                          // kit doc flat "账本摘要" (docFlat size)
export const D_PUBCHAIN = d(350, 450, { scale: 0.4 });      // kit chain n 3 "公链" (wrap 0.4!)
export const D_BUCKETS = [d(700, 450), d(870, 450), d(1040, 450)].map((q) => ({ ...q, scale: 0.6 })); // kit bucket ×3 "云账户" (wrap 0.6!), first one holds all racks
export const D_TAG = d(-1450, 250);                          // native SVG zone tag "治理层", EXT.zoneTag

// ---------------------------------------------------------------- E 两座别馆 (seg5 全段; seg6 L0) — U0 = 18200
const e = zone(U_E);
export const E_CORDA = [e(-1300, -100), e(-1100, -100), e(-900, -100)].map((q) => ({ ...q, scale: 0.45 })); // kit rack ×3 "Corda 节点" (wrap 0.45!)
export const E_NOTARY = [e(-650, -120), e(-420, -80), e(-190, -40)].map((q) => ({ ...q, scale: 0.45 })); // E04 tellerCounter ×3 0.45: [0] "公证人", [1][2] appear as the cluster
export const E_SEAL = e(-650, 130, { scale: 0.5 });         // kit seal "公证" (wrap 0.5!)
export const E_STATE = e(-420, 130);                         // kit doc flat "同一状态" (stamped twice = red) (docFlat size)
export const E_PARCEL = e(-1200, 200, { scale: 0.6 });      // E07 parcel "对方数据" 0.6
export const E_MAG = e(-1000, 250);                          // kit magnifier "先校验" (original size, z per segment)
export const E_ACCEPT = e(0, 200);                         // kit doc standing title "always-accept" red ✕, small tag "只用于测试"
export const E_ROTA = e(300, -100, { scale: 0.6 });         // E09 rotaWheel "QBFT 验证者" 4 seats, one red, 0.6
export const E_MINT = e(550, -100, { scale: 0.5 });         // E11 mintPress "原生币" 0.5, red coins
export const E_CONTRACT = e(750, -100);                      // kit doc standing title "合同" grey
export const E_PANEL = e(350, 250, { scale: 0.6 });         // E17 peerPanel "验证者 P2P 端口" 0.6
export const E_FW = e(180, 280, { scale: 0.4 });            // E01 firewall len 120 "网络层限制" (wrap 0.4!)
export const E_ADMIT = [e(550, 250), e(730, 250), e(550, 380), e(730, 380)]; // kit doc ×4 "本地准入" (docNote size)
export const E_LEGACY = [e(1050, -100), e(1250, -100)].map((q) => ({ ...q, scale: 0.45 })); // kit rack ×2 grey tag "GoQuorum" "Tessera" (wrap 0.45!), lamps off
export const E_SIGN = e(1500, -50);                          // E01 signBoard plate "已归档 · 已弃用" (default size)
export const E_WRENCH = e(1100, 150, { scale: 0.6 });       // E22 wrench "自行维护" 0.6
export const E_MIGRATE = e(1300, 200);                       // native SVG teal arrow "迁移", EXT.arrow
export const E_TAGS = [e(-1100, 380), e(450, -350)];         // native SVG hall tags "Corda 馆" / "Besu 馆", EXT.zoneTag

// ---------------------------------------------------------------- F 问询台 (seg6 全段) — U0 = 22600
const g = zone(U_F);
export const F_DESK = g(-300, 0, { scale: 0.7 });           // kit desk "问询台" (wrap 0.7!)
export const F_ASSUME = g(-550, -50);                        // kit doc standing title "安全假设", lines ["依赖哪几家组织"]
export const F_HERO = g(-120, -120, { scale: 0.7 });        // E05 keycard (the hero badge) 0.7, back at the desk
export const F_USER = g(100, 50, { scale: 0.5 });           // kit person (user) 0.5
export const F_PHONE = g(200, 50, { scale: 0.5 });          // kit phone "上链了，不可篡改" (wrap 0.5!)
export const F_QS = [g(450, -100), g(720, -100), g(990, -100)]; // E01 signBoard plate ×3 "谁能写" / "谁能看" / "谁能改规则" (default size)
export const F_ERASE = g(-500, 300);                         // kit doc flat "删除 · 更正" (docFlat size)
export const F_ANCHOR = g(-150, 300, { scale: 0.4 });       // kit chain n 3 "公链锚定" (wrap 0.4!)
export const F_AUDIT = g(100, 300);                          // kit doc flat "审计报告" (docFlat size)
export const F_SIGN = g(-850, -50);                          // E01 signBoard plate "问询台" (default size)
export const F_TAG = g(-850, 300);                           // native SVG zone tag "问询台", EXT.zoneTag

// ---------------------------------------------------------------- footprints
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 (from ep17–ep28 layouts:
// visible geometry only). [x0, y0, x1, y1]; y0 includes signs / heads. E02 die has no earlier measurement: estimated.
export const EXT = {
  rack: [-113, -349, 113, 51], keycard: [-28, -85, 26, 9], ledgerBook: [-158, -89, 158, 74], chain3: [-213, -171, 213, 85],
  hashFunnel: [-111, -294, 111, 54], forkSwitch: [-44, -117, 53, 23], proofCard: [-61, -158, 59, 23],
  firewall160: [-150, -215, 150, 56], firewall120: [-117, -203, 117, 43], person: [-50, -208, 50, 7], personAtk: [-50, -229, 50, 7],
  safe: [-180, -376, 181, 82], signPlate: [-146, -245, 119, 54], tellerCounter: [-228, -343, 241, 92], key: [-75, -35, 84, 31],
  snapshotCamera: [-52, -162, 47, 22], beacon: [-61, -118, 61, 30], roleBoard: [-208, -366, 202, 77], thresholdMeter: [-52, -290, 71, 26],
  sigPaper: [-84, -264, 79, 31], sorter: [-211, -281, 253, 76], letter: [-28, -56, 26, 0], checkpoint: [-172, -305, 115, 80],
  docStanding: [-51, -154, 49, 12], docFlat: [-89, -45, 141, 58], docNote: [-70, -47, 98, 36], envelope: [-72, -36, 72, 34],
  saltShaker: [-27, -95, 27, 14], clock: [-76, -193, 61, 2], die: [-40, -70, 40, 20], hsm: [-97, -119, 97, 44], seal: [-146, -142, 147, 69],
  desk: [-147, -272, 147, 74], hourglass: [-56, -201, 56, 28], bucket: [-76, -164, 76, 28], parcel: [-38, -57, 38, 18],
  magnifier: [-58, -260, 120, -105], rotaWheel: [-112, -113, 112, 56], mintPress: [-114, -238, 114, 55], peerPanel: [-78, -156, 78, 33],
  wrench: [-57, -68, 56, 19], phone: [-70, -195, 58, 27],
  // native-SVG areas, from their ground origin
  hashLbl: [-110, -30, 110, 10], pathTag: [-80, -30, 80, 10], titleCard: [-220, -140, 220, 10], zoneTag: [-110, -24, 110, 30],
  plaza: [-280, -110, 280, 110], gateNum: [-30, -20, 30, 20], orgDots: [-100, -20, 100, 20], raftLbl: [-180, -20, 180, 20],
  hashTag: [-60, -25, 60, 10], partition: [-12, -170, 12, 35], arrow: [-80, -20, 80, 20],
};
// rect(o, kind, scale) → world-canvas bbox [x0, y0, x1, y1] of that object standing at o (z lifts it)
export const rect = (o, kind, scale = o.scale ?? 1) => {
  const [X, Y] = Wp(o.u, o.v, o.z ?? 0); const q = EXT[kind];
  return [X + q[0] * scale, Y + q[1] * scale, X + q[2] * scale, Y + q[3] * scale];
};
/** camera that fits the union of rects into the screen box [x0,y0,x1,y1] */
export const fit = (rects, [x0, y0, x1, y1], kmax = 1.4) => {
  const X0 = Math.min(...rects.map((q) => q[0])), Y0 = Math.min(...rects.map((q) => q[1]));
  const X1 = Math.max(...rects.map((q) => q[2])), Y1 = Math.max(...rects.map((q) => q[3]));
  const k = Math.min(kmax, (x1 - x0) / (X1 - X0), (y1 - y0) / (Y1 - Y0));
  return camAt([(X0 + X1) / 2, (Y0 + Y1) / 2], (x0 + x1) / 2, (y0 + y1) / 2, Math.round(k * 1000) / 1000);
};

// ---------------------------------------------------------------- per-area rect groups (named; the check script reads these)
const r = (o, kind) => rect(o, kind);
export const R = {
  // A
  nodes: [...A_RACKS.map((q) => r(q, "rack")), ...A_CARDS.map((q) => r(q, "keycard")), ...A_LEDGERS.map((q) => r(q, "ledgerBook"))],
  door: [r(A_GATE, "firewall160"), r(A_ATTACKER, "personAtk"), r(A_TAG, "zoneTag")],
  hash: [r(A_CHAIN, "chain3"), r(A_HASHLBL, "hashLbl"), r(A_FUNNEL, "hashFunnel"), ...A_PATHS.map((q) => r(q, "pathTag")), r(A_FORK, "forkSwitch"),
    r(A_PROOF, "proofCard")],
  titleA: [r(A_TITLE, "titleCard")],
  // B
  plaza: [r(B_PCHAIN, "chain3"), r(B_DEPOSIT, "safe"), r(B_TAG, "zoneTag")],
  gate: [r(B_SIGN, "signPlate"), r(B_GATE, "firewall160"), r(B_HERO, "keycard"), r(B_TELLER, "tellerCounter"), ...B_STACK.map((q) => r(q, "keycard")),
    r(B_MASTER, "key"), r(B_STAFF, "person")],
  breakB: [r(B_CAMERA, "snapshotCamera"), r(B_ALARM, "beacon"), ...B_SIGNERS.map((q) => r(q, "person")), r(B_BOOK, "ledgerBook")],
  roles: [r(B_ROLES, "roleBoard")],
  ronin: [...B_KEYS.map((q) => r(q, "key")), r(B_METER, "thresholdMeter")],
  // C
  pipe: [...C_ENDORSERS.map((q) => r(q, "rack")), ...C_RWSETS.map((q) => r(q, "sigPaper")), r(C_SORTER, "sorter"), r(C_LETTER, "letter"),
    r(C_GATE, "checkpoint"), r(C_STATE, "ledgerBook"), ...C_NUMS.map((q) => r(q, "gateNum")), r(C_TAG, "zoneTag")],
  policy: [...C_POLICY.map((q) => r(q, "docStanding")), r(C_ORGDOTS, "orgDots"), ...C_RAFT.map((q) => r(q, "rack")), r(C_RAFTLBL, "raftLbl")],
  privacy: [r(C_SAFE, "safe"), r(C_TRANSIENT, "envelope"), r(C_FUNNEL, "hashFunnel"), ...C_HASHTAGS.map((q) => r(q, "hashTag")),
    r(C_OUTSIDER, "personAtk"), r(C_SALT, "saltShaker")],
  det: [r(C_CLOCK, "clock"), r(C_DIE, "die"), ...C_DETSETS.map((q) => r(q, "sigPaper"))],
  // D
  ca: [r(D_HSM, "hsm"), r(D_ONLINE, "rack"), ...D_ICA.map((q) => r(q, "seal")), ...D_CADOCS.map((q) => r(q, "docFlat")), r(D_WALL, "partition"), r(D_TAG, "zoneTag")],
  admin: [r(D_VENDOR, "desk"), r(D_VSTAFF, "person"), ...D_ADMINCARDS.map((q) => r(q, "keycard")), ...D_HOMES.map((q) => r(q, "rack"))],
  config: [r(D_CONFIG, "docStanding"), ...D_SEALS.map((q) => r(q, "seal")), r(D_TRAIL, "ledgerBook"), r(D_REVOKED, "keycard"), r(D_SHARED, "ledgerBook"),
    r(D_HOUR, "hourglass")],
  collude: [...D_COLLUDERS.map((q) => r(q, "person")), r(D_FAKE, "ledgerBook"), r(D_DIGEST, "docFlat"), r(D_PUBCHAIN, "chain3")],
  cloud: [...D_BUCKETS.map((q) => r(q, "bucket"))],
  // E
  corda: [...E_CORDA.map((q) => r(q, "rack")), ...E_NOTARY.map((q) => r(q, "tellerCounter")), r(E_SEAL, "seal"), r(E_STATE, "docFlat"),
    r(E_PARCEL, "parcel"), r(E_MAG, "magnifier"), r(E_ACCEPT, "docStanding"), r(E_TAGS[0], "zoneTag")],
  besu: [r(E_ROTA, "rotaWheel"), r(E_MINT, "mintPress"), r(E_CONTRACT, "docStanding"), r(E_TAGS[1], "zoneTag")],
  p2p: [r(E_PANEL, "peerPanel"), r(E_FW, "firewall120"), ...E_ADMIT.map((q) => r(q, "docNote"))],
  legacy: [...E_LEGACY.map((q) => r(q, "rack")), r(E_SIGN, "signPlate"), r(E_WRENCH, "wrench"), r(E_MIGRATE, "arrow")],
  // F
  desk: [r(F_DESK, "desk"), r(F_ASSUME, "docStanding"), r(F_HERO, "keycard"), r(F_USER, "person"), r(F_PHONE, "phone"), ...F_QS.map((q) => r(q, "signPlate"))],
  user: [r(F_ERASE, "docFlat"), r(F_ANCHOR, "chain3"), r(F_AUDIT, "docFlat")],
  signF: [r(F_SIGN, "signPlate"), r(F_TAG, "zoneTag")],
};
// standing on the plaza floor on purpose — excluded from the overlap check
export const INSIDE = { B: [r(B_PLAZA, "plaza"), ...B_CROWD.map((q) => r(q, "person"))] };
export const ZONE_RECTS = {
  A: [...R.nodes, ...R.door, ...R.hash, ...R.titleA],
  B: [...R.plaza, ...R.gate, ...R.breakB, ...R.roles, ...R.ronin],
  C: [...R.pipe, ...R.policy, ...R.privacy, ...R.det],
  D: [...R.ca, ...R.admin, ...R.config, ...R.collude, ...R.cloud],
  E: [...R.corda, ...R.besu, ...R.p2p, ...R.legacy],
  F: [...R.desk, ...R.user, ...R.signF],
};
const Z = ZONE_RECTS;
const SAFE = [100, 280, 1820, 860];                      // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for code cards / event cards at the sides

// ---------------------------------------------------------------- camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur)
export const CAMS = {
  // 全景：A–F 整座联盟大厦（seg6 L8–L10、L13–L14 结束卡）
  wide: fit([...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E, ...Z.F], [60, 220, 1860, 860], 1),
  // 分区全景
  A: fit(Z.A, SAFE),
  B: fit([...Z.B, ...INSIDE.B], SAFE),
  C: fit(Z.C, SAFE),
  D: fit(Z.D, SAFE),
  E: fit(Z.E, SAFE),
  F: fit(Z.F, SAFE),
  // A 四台机柜 + 工牌 + 账本 + 门外门禁与攻击者（seg1 起点 L0–L3）
  nodesA: fit([...R.nodes, ...R.door], SAFE),
  // A 区块链 + 哈希漏斗两路 + 扳道器 + 证明卡 + 四本账本（seg1 L4–L9）
  hashA: fit([...R.hash, ...R.nodes], SAFE),
  // A 大厅全景 + 门外门禁 + 题卡（seg1 L10–L14 终点；seg2 起点）
  hallA: fit(Z.A, SAFE),
  // B 门禁闸机 + 前台 + 工牌堆 + 万能钥匙 + 物业（seg2 L0–L5）
  gateB: fit(R.gate, MID),
  // B 广场 vs 写字楼 + 监控报警 vs 改写账本（seg2 L6–L12）
  metaphorB: fit([...R.plaza, ...INSIDE.B, ...R.gate, ...R.breakB], SAFE),
  // B 资源阶梯 roleBoard（+ 前台 / 万能钥匙在左侧）（seg2 L13–L17）
  rolesB: fit([...R.roles, r(B_MASTER, "key"), r(B_STAFF, "person")], MID),
  // B Ronin 角：九把钥匙 + 门槛表（seg2 L18–L20 终点；seg3 起点）
  roninB: fit(R.ronin, MID),
  // C 三道关：背书节点 + 读写集 + 排序服务 + 关卡 + 世界状态（seg3 L0–L5）
  pipeC: fit(R.pipe, SAFE),
  // C 策略牌 + 五台 Raft 机柜 + 关卡（seg3 L6–L12）
  policyC: fit([...R.policy, r(C_GATE, "checkpoint")], SAFE),
  // C 私有数据保险柜 + 信封 + 哈希漏斗 + 三张哈希签 + 圈外组织 + 盐罐（seg3 L13–L17）
  privacyC: fit(R.privacy, MID),
  // C 时钟 + 骰子 + 两张读写集（seg3 L18–L19 终点；seg4 起点）
  detC: fit(R.det, MID),
  // D 根 CA 加密机 + 在线服务器 + 中间 CA 公章 + 身份 / TLS CA + 隔板（seg4 L0–L5）
  caD: fit(R.ca, SAFE),
  // D 服务商工位 + 三张管理员卡 + 三台自家机柜（seg4 L6–L9）
  adminD: fit(R.admin, MID),
  // D 通道配置 + 三枚公章 + 变更留痕 + 吊销工牌 + 已分发数据 + 沙漏（seg4 L10–L14）
  configD: fit(R.config, MID),
  // D 三名成员 + 红账本 + 账本摘要 → 公链（seg4 L15–L18）
  colludeD: fit(R.collude, MID),
  // D 云桶拆分（seg4 L19 终点；seg5 起点）
  cloudD: fit(R.cloud, MID, 1.2),
  // E Corda 节点 + 公证人柜台 + 同一状态 + 包裹 + 放大镜 + always-accept（seg5 L0–L7）
  cordaE: fit(R.corda, SAFE),
  // E Besu 轮值台 + 铸币机 + 合同（seg5 L8–L14）
  besuE: fit(R.besu, MID, 1.3),
  // E 插线板 + 防火墙 + 四份本地准入（seg5 L15–L17）
  p2pE: fit(R.p2p, MID, 1.3),
  // E 退役机柜 + 牌子 + 扳手 + 迁移箭头（seg5 L18–L21 终点；seg6 起点）
  legacyE: fit(R.legacy, MID, 1.3),
  // F 问询台 + 安全假设 + 工牌 + 用户 / 手机 + 三块牌子 + 删除更正 / 锚定 / 审计（seg6 L0–L7、L11–L12）
  deskF: fit(Z.F, SAFE),
};
/** alias (ep11 convention): the whole world */
export const world = CAMS.wide;
CAMS.world = CAMS.wide;
