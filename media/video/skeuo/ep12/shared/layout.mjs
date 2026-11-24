// ep12「两岸桥城」shared world layout — one continuous isometric world, fixed for all six segments:
//   import { BRIDGE, BOOTH, BOOTH_PROOF, VALID, VALID_GROUP, VKEYS, SMFRAME, SMPLATE, AXPLATE, METER, RELAYER, CURTAIN,
//            VEND, SAFE, USER, CHAINA, LETTER, MSG, DOTSA,
//            MINTB, BAL, CHAINB, SWITCH, BEACON, QUEUE, QLETTERS, DOTSC,
//            STALLS, MSIGD, SEALD, HEADERS, MAGD, HOURD, CHALLENGER, BEACOND, ZKPROOF, CURVE, COREM, UPKEY, TLOCKD,
//            WALL, TREE, WSIG, SYSACC, SELKEY, PSAFE, WLIST, LOT, RTAGE, RPCS, VALIDE, ELETTER, RSETH,
//            TELLER, LEDGERF, FAKE, RTAGF, CHAINT, IDEM, CONFS,
//            EXT, rect, fit, ZONE_RECTS, CAMS, world } from "../../shared/layout.mjs";
// (from ep12/segN/src/build-story.mjs). Positions only; ids, states, labels and per-shot opts stay in each segment.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Every position is written as S(X, Y) = the world point whose ground lands on world-canvas px (X, Y) (iso.G, rounded) —
// so the numbers read as on-screen ground positions at camera scale 1. `scale` = the opts.scale to pass to the object.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): of the objects used here only kit person / ledgerBook, E01 vending / miniVend, E04 tellerCounter,
//   E07 emptyLot / returnTag / oddCoin, E09 cheque, E11 mintPress and ep12 merkleTree take opts.scale. Everything else IGNORES it. Where such an
//   object carries `scale` below it is marked "wrap": the segment MUST put it with the wrap helper (translate · scale · translate around its
//   ground point) and rescale its anchors; rect() / CAMS already assume the scaled size. Wrapped here: VKEYS (kit key 0.4), MSIGD (E05
//   thresholdMeter 0.7), CURVE (E02 curveBoard 0.6), COREM (E10 coreModule 0.6), PSAFE (kit safe 0.6). Do not walk E01 letters on a wrapped object.
// Zones (world-canvas px; front row +v = larger Y, back row −v = smaller Y; left → right = X):
//   A 左岸前·A 链金库 (X ≈ −2540..−1690, Y ≈ −400..590)
//   · E 左岸后·事故档案馆, straight behind A (X ≈ −2560..−1300, Y ≈ −1680..−740)
//   · B 中·桥与验证者平台 (X ≈ −1440..370, Y ≈ −560..330; the bridge at the origin, its river runs along v through it,
//     near bank = −u = screen lower-left; the validator platform sits on the near bank, left of the bridge)
//   · C 右岸前·B 链铸币与对账 (X ≈ 640..1840, Y ≈ −230..950)
//   · D 右岸后·四种验证展台, behind C (X ≈ 520..2770, Y ≈ −1460..−790; four stalls along X, the upgrade corner at the right end)
//   · F 最右前·交易所充值柜台 (X ≈ 2250..3120, Y ≈ −150..680).
// Front row left → right is A · B · C · F; E sits behind A, D behind C. Neighbouring zones are ≥ ~250 canvas px apart edge to edge
// (A–B ≈ 280, A–E ≈ 340, B–E ≈ 280, B–C ≈ 270, B–D ≈ 330, C–F ≈ 410, C–D ≈ 560); the per-zone framings in CAMS hold only their own zone's key objects.
// Native-SVG areas (dot matrices, the archive wall, the Sky Mavis dashed frame, the trust-boundary curtain) are given as a ground origin
// + a box kind in EXT, so the segment knows where it may draw them.
import { Wp, G, camAt } from "../../kit/iso.mjs";

/** world ground point for world-canvas px (X, Y); extra fields (scale, z …) copied in */
const S = (X, Y, extra = {}) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
/** zone-local placer: positions below are written relative to the zone's anchor px */
const zone = (OX, OY) => (X, Y, extra) => S(OX + X, OY + Y, extra);

// ---- B 中·桥与验证者平台·Ronin (seg1 全段; seg2 L0–L3, L8–L15, L22–L23; seg3 L1–L4; seg4 L1–L4; seg5 L1–L2; seg6 L2, L5–L8): anchor = bridge
const b = zone(0, 0);
export const BRIDGE = b(0, 0);                            // E01 bridge river 170 (original size, hero); booth "normal" / "attacker"; road along u, near bank = −u
// the booth stands at world (BRIDGE.u − 216, BRIDGE.v − 128) inside the bridge object (anchors.booth); the proof card stands in front of its window
export const BOOTH = { u: BRIDGE.u - 216, v: BRIDGE.v - 128 };      // the booth inside E01 bridge (= bridge anchors.booth); for framing only, EXT.booth
export const BOOTH_PROOF = { u: BRIDGE.u - 216, v: BRIDGE.v - 92 }; // E02 proofCard "证明" (original size; missing in seg4) — overlaps the booth on purpose
// 9 validators on the near-bank wooden platform: a 3 × 3 world grid (i along u ×240, j along v ×200) from VALID0.
//   index 0–3 = "Sky Mavis" (the 2 × 2 block i 0–1 / j 0–1), 4 = "Axie DAO 授权" (i 2, j 0), 5–8 = "其他验证者".
const VALID0 = b(-1120, 80);
const grid = (i, j, extra) => ({ u: VALID0.u + 240 * i, v: VALID0.v + 200 * j, ...extra });
const VIJ = [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [0, 2], [1, 2], [2, 1], [2, 2]];
export const VALID = VIJ.map(([i, j]) => grid(i, j, { scale: 0.6 }));   // kit person signer ×9 0.6
export const VALID_GROUP = ["sky", "sky", "sky", "sky", "axie", "other", "other", "other", "other"];
export const VKEYS = VALID.map((q) => ({ u: q.u, v: q.v, scale: 0.4, lift: 150 })); // kit key ×9 (wrap 0.4!), drawn `lift` px (scale-1 canvas) above the person's ground point (over the head); red = 被控制
export const SMFRAME = grid(0, 0);                       // teal dashed frame round the 4 Sky Mavis validators (native SVG), EXT.smFrame from here
export const SMPLATE = grid(0.5, -2.2);                  // E01 signBoard plate size 24 "Sky Mavis", behind the 2 × 2 block
export const AXPLATE = grid(2, -2.2);                    // E01 signBoard plate size 24 "Axie DAO 授权" (red small sign "本应撤销" is the segment's wlab on its anchor)
export const METER = b(-470, -140);                      // E05 thresholdMeter max 9, th 5, thText "5/9" (original size), beside the booth
export const RELAYER = b(-420, 160, { scale: 0.7 });     // kit person engineer "中继者" 0.7, at the near end of the bridge road (walks the letter over)
export const CURTAIN = { u: BRIDGE.u, v: BRIDGE.v };     // trust boundary: teal dashed vertical curtain along v over the river (native SVG), EXT.curtain — on the bridge on purpose

// ---- A 左岸前·A 链金库 (seg2 L4–L8; seg5 L3–L4; seg6 L1): far left, front row; anchor = vending
const a = zone(-1980, 250);
export const VEND = a(0, 0, { scale: 0.8 });             // E01 vending sign "桥合约 · A 链" 0.8
export const SAFE = a(-380, 40);                         // kit safe gold "锁定" (original size; door opens)
export const USER = a(250, 120, { scale: 0.8 });         // kit person signer "用户" 0.8
export const CHAINA = a(-120, -450);                     // kit chain n 4, title "A 链" (original size), behind the safe along +u
export const LETTER = a(150, 70);                        // E01 letter "存款事件" (original size; walks to the bridge: BRIDGE anchors.nearRoad)
export const MSG = a(0, 200, { scale: 0.8 });            // E09 cheque "消息" 0.8, fields 用户 / 金额 / 序号 / 源链 / 目标链
export const DOTSA = a(-450, 200);                       // dot matrix 100 dots (10 × 10, 1 dot = 1 USDT, 示例) going into the safe, EXT.dots

// ---- C 右岸前·B 链铸币与对账 (seg2 L10–L11, L19; seg5 L8–L9; seg6 L8): right of the river, front row; anchor = mint press
const c = zone(960, 350);
export const MINTB = c(0, 0, { scale: 0.8 });            // E11 mintPress plate "映射代币" 0.8 (limit true / false, lamp, pile)
export const BAL = c(300, 40);                           // E01 balance "两侧对账": left pan "A 链锁定", right pan "B 链铸造" (original size)
export const CHAINB = c(80, -380);                       // kit chain n 4, title "B 链" (original size), behind the mint press
export const SWITCH = c(620, 60);                        // kit knifeSwitch "自动暂停"
export const BEACON = c(820, 80);                        // kit beacon (monitoring)
export const QUEUE = c(420, 460);                        // E01 mempool sign "延迟队列" (no scale parameter; original size)
export const QLETTERS = 3;                               // letters in the queue: E01 mempool n 3 (its own slots; do not walk them on a wrapped queue)
export const DOTSC = c(-320, 110);                       // dot matrix area: seg2 L11 the same 100 dots appear; seg5 L9 two columns "锁定 ≥ 铸造", EXT.dotsC

// ---- D 右岸后·四种验证展台 (seg3 L0–L22; seg4 L0; seg5 L10): straight behind C; four stalls along X, then the upgrade corner
const d = zone(1400, -900);
const CX = [-720, -240, 240, 720];                       // stall centres (zone px)
export const STALLS = CX.map((x) => d(x, -330));         // E01 signBoard plate size 30: "多签 / MPC" "轻客户端" "乐观证明" "零知识证明"
export const MSIGD = d(CX[0] - 120, 0, { scale: 0.7 });  // stall 1: E05 thresholdMeter max 5, th 3, thText "M/N" (wrap 0.7!)
export const SEALD = d(CX[0] + 100, 40);                 // stall 1: kit seal
export const HEADERS = d(CX[1] - 60, 20, { scale: 0.7 }); // stall 2: kit ledgerBook "A 链区块头" 0.7
export const MAGD = d(CX[1] + 120, -10);                 // stall 2: kit magnifier (hovers; its bbox is above the ground point)
export const HOURD = d(CX[2] - 110, 0);                  // stall 3: kit hourglass "挑战期"
export const CHALLENGER = d(CX[2] + 20, 40, { scale: 0.6 }); // stall 3: kit person signer "挑战者" 0.6
export const BEACOND = d(CX[2] + 150, 20);               // stall 3: kit beacon
export const ZKPROOF = d(CX[3] - 110, 10);               // stall 4: E02 proofCard text "ZK 证明" (original size)
export const CURVE = d(CX[3] + 60, 0, { scale: 0.6 });   // stall 4: E02 curveBoard "电路" (wrap 0.6!)
export const COREM = d(1100, 0, { scale: 0.6 });         // upgrade corner: E10 coreModule "新实现" (wrap 0.6!)
export const UPKEY = d(1250, 40);                        // upgrade corner: kit key, red = "升级权限" (original size)
export const TLOCKD = d(1300, -200);                     // upgrade corner: E01 timeLock "时间锁" (only from seg5 L10)

// ---- E 左岸后·事故档案馆 (seg4 L0, L5–L26; seg5 L5–L7): straight behind A; archive wall at the back, five corners in two rows
const e = zone(-1900, -1100);
export const WALL = e(-40, -300);                        // archive wall (native SVG light panel) with 4 drawer labels 私钥 / 验证逻辑 / 初始化 / 存款伪造, EXT.wall
export const TREE = e(-560, 0);                          // ep12 merkleTree "Merkle 树" (scale 1; attacker seg4 L6–L8, broken seg4 L16–L17)
export const WSIG = e(-300, 20);                         // E02 proofCard missing "守护者签名" (Wormhole)
export const SYSACC = e(-150, 20);                       // kit doc standing "系统账户" (state attacker = 伪造)
export const SELKEY = e(110, 30);                        // E03 selectorKey name "替换公钥" (Poly; original size)
export const PSAFE = e(350, 0, { scale: 0.6 });          // kit safe "特权合约" (wrap 0.6!)
export const WLIST = e(520, 50);                         // kit padlock "白名单"
export const LOT = e(-500, 300, { scale: 0.6 });         // E07 emptyLot zero true, plate "零地址" 0.6 (Qubit)
export const RTAGE = e(-330, 300);                       // E07 returnTag "true" (scale 1)
export const RPCS = [e(-50, 320), e(150, 320)];          // kit rpc ×2 "RPC" (attacker = red)
export const VALIDE = e(320, 320, { scale: 0.7 });       // kit person engineer "验证者" 0.7 (single validator, KelpDAO)
export const ELETTER = e(420, 330);                      // E01 letter state attacker
export const RSETH = e(560, 320, { scale: 0.6 });        // E01 miniVend kind token "rsETH" 0.6

// ---- F 最右前·交易所充值柜台 (seg5 L11–L17; seg6 L0, L3–L4): right of C, end of the front row; anchor = teller counter
const fz = zone(2500, 400);
export const TELLER = fz(0, 0, { scale: 0.8 });          // E04 tellerCounter "交易所充值" 0.8
export const LEDGERF = fz(-120, 220, { scale: 0.8 });    // kit ledgerBook "内部账本" 0.8
export const FAKE = fz(300, 120, { scale: 0.8 });        // E07 oddCoin "假币" 0.8
export const RTAGF = fz(420, 100);                       // E07 returnTag receipt "成功" green / "失败" red (scale 1)
export const CHAINT = fz(360, -380);                     // kit chain n 3, title "TRON", blockStates middle "attacker"
export const IDEM = fz(150, 260, { scale: 0.6 });        // E09 cheque "幂等键" 0.6 (two fields: 交易哈希 + 日志序号)
export const CONFS = fz(560, 220);                       // kit hourglass "确认数"

// ---------------------------------------------------------------- framing
// Each object's on-screen footprint relative to its ground point, world-canvas px at scale 1 (measured from the rendered SVGs with the opts
// used here: visible geometry only, contact shadows / glow and hidden layers excluded). [x0, y0, x1, y1]; y0 includes signs / dials / heads.
// The bridge box includes its river (±380 along v). Native-SVG areas (smFrame … dotsC) are the boxes reserved for them, from their ground origin.
export const EXT = {
  bridge: [-367, -208, 367, 207], vending: [-126, -330, 126, 55], safe: [-180, -376, 181, 82], person: [-50, -208, 50, 7],
  chain4: [-287, -197, 287, 110], chain3: [-213, -171, 213, 85], letter: [-29, -56, 26, 0], cheque: [-75, -124, 74, 24],
  plate24: [-137, -228, 110, 51], plate30: [-133, -232, 106, 49], key: [-75, -35, 84, 31], thresholdMeter: [-52, -290, 89, 26],
  proofCard: [-61, -158, 59, 23], mintPress: [-114, -238, 114, 55], balance: [-163, -258, 163, 40], knifeSwitch: [-153, -344, 133, 48],
  beacon: [-61, -118, 61, 30], mempool: [-305, -346, 305, 139], seal: [-146, -142, 147, 69], ledgerBook: [-158, -89, 158, 74],
  magnifier: [-58, -260, 120, -105], hourglass: [-60, -201, 60, 28], curveBoard: [-169, -348, 138, 54], coreModule: [-73, -179, 73, 32],
  timeLock: [-64, -182, 64, 27], merkleTree: [-92, -182, 92, 39], docStanding: [-84, -261, 82, 23], selectorKey: [-148, -122, 113, 25],
  padlock: [-56, -138, 62, 28], emptyLot: [-159, -135, 159, 76], returnTag: [-30, -62, 29, 7], rpc: [-77, -258, 78, 38],
  miniVend: [-72, -197, 72, 31], tellerCounter: [-228, -343, 241, 92], oddCoin: [-39, -109, 39, 18],
  booth: [-50, -175, 50, 30], smFrame: [-70, -170, 380, 130], curtain: [-30, -260, 60, 230], wall: [-620, -280, 620, 0], dots: [0, 0, 140, 140], dotsC: [0, 0, 220, 140],
};
// rect(o, kind, scale) → world-canvas bbox [x0, y0, x1, y1] of that object standing at o (o.lift raises it, for VKEYS)
export const rect = (o, kind, scale = o.scale ?? 1) => {
  const [X, Y0] = Wp(o.u, o.v), Y = Y0 - (o.lift ?? 0), q = EXT[kind];
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
  valid: [...VALID.map((q) => rect(q, "person")), ...VKEYS.map((q) => rect(q, "key")), rect(SMPLATE, "plate24"), rect(AXPLATE, "plate24")],
  booth: [rect(BOOTH_PROOF, "proofCard"), rect(METER, "thresholdMeter")],
  bankA: [rect(VEND, "vending"), rect(SAFE, "safe"), rect(USER, "person"), rect(LETTER, "letter"), rect(MSG, "cheque"), rect(DOTSA, "dots")],
  mintB: [rect(MINTB, "mintPress"), rect(CHAINB, "chain4"), rect(DOTSC, "dotsC")],
  recon: [rect(BAL, "balance"), rect(SWITCH, "knifeSwitch"), rect(BEACON, "beacon"), rect(QUEUE, "mempool")],
  dMulti: [rect(STALLS[0], "plate30"), rect(MSIGD, "thresholdMeter"), rect(SEALD, "seal")],
  dLight: [rect(STALLS[1], "plate30"), rect(HEADERS, "ledgerBook"), rect(MAGD, "magnifier")],
  dOpt: [rect(STALLS[2], "plate30"), rect(HOURD, "hourglass"), rect(CHALLENGER, "person"), rect(BEACOND, "beacon")],
  dZk: [rect(STALLS[3], "plate30"), rect(ZKPROOF, "proofCard"), rect(CURVE, "curveBoard")],
  upgrade: [rect(COREM, "coreModule"), rect(UPKEY, "key"), rect(TLOCKD, "timeLock")],
  eTree: [rect(TREE, "merkleTree")],
  eSig: [rect(WSIG, "proofCard"), rect(SYSACC, "docStanding")],
  eKey: [rect(SELKEY, "selectorKey"), rect(PSAFE, "safe"), rect(WLIST, "padlock")],
  eZero: [rect(LOT, "emptyLot"), rect(RTAGE, "returnTag")],
  eRpc: [...RPCS.map((q) => rect(q, "rpc")), rect(VALIDE, "person"), rect(ELETTER, "letter"), rect(RSETH, "miniVend")],
  cexTag: [rect(FAKE, "oddCoin"), rect(RTAGF, "returnTag"), rect(CHAINT, "chain3"), rect(CONFS, "hourglass")],
};
export const ZONE_RECTS = {
  A: [...R.bankA, rect(CHAINA, "chain4")],
  B: [rect(BRIDGE, "bridge"), ...R.valid, ...R.booth, rect(RELAYER, "person")],
  C: [...R.mintB, ...R.recon],
  D: [...STALLS.map((q) => rect(q, "plate30")), ...R.dMulti.slice(1), ...R.dLight.slice(1), ...R.dOpt.slice(1), ...R.dZk.slice(1), ...R.upgrade],
  E: [rect(WALL, "wall"), ...R.eTree, ...R.eSig, ...R.eKey, ...R.eZero, ...R.eRpc],
  F: [rect(TELLER, "tellerCounter"), rect(LEDGERF, "ledgerBook"), rect(IDEM, "cheque"), ...R.cexTag],
};
const Z = ZONE_RECTS;
const SAFE_R = [100, 280, 1820, 860];                    // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for code cards / checklists at the sides
// Camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur). Screen bboxes: see the comment above each key.
export const CAMS = {
  // 近景：9 人验证者平台 + 两块分组牌 + 门限表（seg1 起点；seg6 L2、L5–L7 回到这里给答案）
  valid: fit([...R.valid, rect(METER, "thresholdMeter")], MID, 1.4),
  // B 桥全景：桥 + 平台 + 岗亭 + 门限表 + 中继者，两岸同框（seg1 终点 "凭什么相信？"；seg2 L0–L3、L8–L9；seg4 L1–L4；seg5 L1–L2）
  bridge: fit(Z.B, SAFE_R, 1.4),
  // 近景：岗亭 + 证明卡 + 门限表（seg2 L12–L15；seg4 L1–L4 证明卡 missing）
  booth: fit([...R.booth, rect(BOOTH, "booth")], MID, 1.4),
  // A 金库全景：售货机 + 保险柜 + 用户 + 存款事件 + 消息 + 点阵 + A 链（seg2 L4–L7；seg5 L3–L4；seg6 L1）
  bankA: fit(Z.A, SAFE_R, 1.4),
  // 近景：铸币机 + B 链 + 点阵（seg2 L10–L11、seg2 终点 "信谁？"；seg3 起点）
  mintB: fit(R.mintB, MID, 1.4),
  // 近景：两侧对账天平 + 自动暂停闸刀 + 监控灯 + 延迟队列（seg2 L19；seg5 L8–L9；seg6 L8）
  recon: fit(R.recon, SAFE_R, 1.4),
  // D 四摊全景 + 尽头升级角（seg3 L0、seg4 L0；seg5 L10 远景带过）
  hallD: fit(Z.D, SAFE_R, 1.4),
  dMulti: fit(R.dMulti, MID, 1.4),                         // 摊 1 多签 / MPC（seg3）
  dLight: fit(R.dLight, MID, 1.4),                         // 摊 2 轻客户端（seg3）
  dOpt: fit(R.dOpt, MID, 1.4),                             // 摊 3 乐观证明（seg3）
  dZk: fit(R.dZk, MID, 1.4),                               // 摊 4 零知识证明（seg3）
  // 近景：展台尽头 新实现 + 红色升级钥匙 + 时间锁（seg3 终点；seg5 L10）
  upgrade: fit(R.upgrade, MID, 1.4),
  // E 档案墙全景（seg4 L0、L5；seg5 起点 L0、L5–L7）
  filesE: fit(Z.E, SAFE_R, 1.4),
  eTree: fit(R.eTree, MID, 1.4),                           // Merkle 树（seg4 L6–L8 BNB、L16–L17 Nomad；seg5 L5–L6）
  eSig: fit(R.eSig, MID, 1.4),                             // Wormhole 证明卡 + 系统账户（seg4）
  eKey: fit(R.eKey, MID, 1.4),                             // Poly 选择器钥匙 + 特权合约 + 白名单（seg4）
  eZero: fit(R.eZero, MID, 1.4),                           // Qubit 零地址空地 + true 回执（seg4）
  eRpc: fit(R.eRpc, MID, 1.4),                             // KelpDAO 单验证者角（seg4 终点 "冗余"）
  // F 柜台全景（seg5 L11–L12、L17 终点；seg6 起点 L0、L3–L4）
  cexF: fit(Z.F, SAFE_R, 1.4),
  // 近景：假币 + 回执 + TRON 区块 + 确认数（seg5 L13–L17）
  cexTag: fit(R.cexTag, MID, 1.4),
  // 宽景：两岸 = 两座城，A · B · C 前排同框（seg2 L16–L22 两岸 / C→A 反向）
  wide: fit([...Z.A, ...Z.B, ...Z.C], [60, 280, 1860, 860], 1),
  // 全景：所有区（seg6 结束卡前拉远）
  world: fit([...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E, ...Z.F], [60, 200, 1860, 860], 1),
};
// zone-letter aliases (same framings)
Object.assign(CAMS, { A: CAMS.bankA, B: CAMS.bridge, C: fit(Z.C, SAFE_R, 1.4), D: CAMS.hallD, E: CAMS.filesE, F: CAMS.cexF });
export const world = CAMS.world;
