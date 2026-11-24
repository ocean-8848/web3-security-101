// ep26「一条智能体大街」shared world layout — one continuous isometric world, fixed for all six segments:
//   import * as L from "../../shared/layout.mjs";   (from ep26/segN/src/build-story.mjs)
//   L.ROAD / L.PIPE / L.pipeAt; zone positions (A_*, B_*, C_*, D_*, E_* below); L.EXT, L.rect, L.fit, L.ZONE_RECTS, L.CAMS, L.world.
// Positions only; ids, states, labels and per-shot opts stay in each segment. Object ids must never be `cam` or `root`.
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// Like ep11, every position is written as a SCREEN px offset (X, Y) from its zone's anchor (U0, 0) on the road, converted to world (u, v)
//   (so the numbers read as on-screen ground positions at camera scale 1). The stone road + teal money pipe run straight along +u at
//   v = 0 through all five zones (screen line Y = −0.35·X through each anchor): "behind the road" = v < 0, "in front" = v > 0.
// SCALE CAVEAT (kit/SEGBASE.md 常见坑 1): `scale` = the opts.scale to pass to the object. Only kit person, E05 keycard, E07 oddCoin /
//   parcel / scale / emptyLot, E01 miniVend, E04 oracleGhost, E08 liqBot, E11 snapshotCamera, E13 passport, E14 gradingMachine /
//   answerSheet and E26 faceMask take opts.scale. Everything else here that carries `scale` IGNORES it: the segment MUST put it with
//   the wrap helper (translate · scale · translate around its ground point) and rescale its anchors — marked "(wrap X!)" below;
//   rect() / CAMS already assume the scaled size. E01 pipe (r, pts), E01 signBoard (size, w), kit doc (w, h), E01 letter (w, h),
//   E01 firewall (len) are sized by their own opts instead (the w / h / len / size given below are the ones rect() assumes).
// Zones (left → right along the road, anchors U0 on v = 0):
//   A 奖池金库 U0 = 0 (vault X < 600, rule 850..1450, 助理角 1800..2350, 五岔路口 ≥ 2550) · B 智能体车间 U0 = 6000
//   · C 会议室与开户台 U0 = 9300 (会议室 X < 0, 开户台 X ≥ 0) · D 代码工坊 U0 = 13100 (找漏洞 X < −300, 写代码 150..700,
//   供应链 ≥ 850, 防御角 in front of 找漏洞) · E 控制闸口与用户角 U0 = 16900 (闸口 X < 700, 答题 650..1000, 用户角 ≥ 1250).
// seg2 L0–L5 "放大器" board + icon rows belong on the screen layer (the wide shot is too small for world SVG).
// Native-SVG areas (dot matrices, cables) are given as a ground origin + a box kind in EXT.
import { Wp, camAt } from "../../kit/iso.mjs";

/** zone-local placer: (X, Y) = SCREEN px offset (world-canvas px at camera scale 1) from the zone's anchor on the road (U0, 0).
 *  The road runs through the anchor along screen Y = −0.35·X; Y above that line = behind the road (v < 0), below = in front (v > 0). */
const zone = (U0) => (X, Y, extra = {}) => ({ u: Math.round(U0 + 0.8192 * X - 1.1472 * Y), v: Math.round(0.5736 * X + 1.6383 * Y), ...extra });

// ---------------------------------------------------------------- road + money pipe (whole world)
export const ROAD = { u0: -1600, u1: 20200, v0: -110, v1: 110 };   // light-grey stone road (native SVG), ground strip along +u
/** E01 pipe "资金管" (thin r, teal; dashes turn red when money leaves): put("pipe", PIPE.o, E1.pipe(PIPE.o, { id: "pipe", pts: PIPE.pts, r: 8 })) */
export const PIPE = { o: { u: -1500, v: 0 }, pts: [[0, 0, 4], [21500, 0, 4]] };
/** pipe point at world u (coins rolling along it): { u, v: 0 } */
export const pipeAt = (u) => ({ u, v: 0 });

// ---------------------------------------------------------------- A 奖池金库 (seg1 全段; seg2 全段) — U0 = 0
const a = zone(0);
export const A_SAFE = a(-50, -230);                        // kit safe gold plate "奖池" (original size)
export const A_FREYSA = a(230, 60, { scale: 1.4 });       // E08 liqBot "Freysa" 1.4, scr "绝不转账" (stands in front of the safe)
export const A_PLAYER = a(-520, -40, { scale: 0.55 });     // kit person attacker "玩家" 0.55 (walks in from the left)
export const A_SESSION = a(-280, 270, { w: 110, h: 130 }); // kit doc title "新会话" (w 110 h 130; red dashed frame = segment's)
export const A_COINS = [-150, -240, -330, -420].map((X) => a(X, -0.35 * X, { scale: 0.5 })); // E07 oddCoin ×4 0.5 (on the road pipe, toward the player)
export const A_DOTS = a(240, -470);                        // 47-dot gold matrix area beside / above the safe (seg1 L5), EXT.dotsA
export const A_KEY = a(430, 170, { scale: 0.5 });          // kit key "完好" (wrap 0.5!) — seg1 L6 corner key
export const A_PROMPT = a(950, -560, { w: 150, h: 190 });  // kit doc standing title "提示词" lines ["绝不转账"] (w 150 h 190)
export const A_CM = a(1300, -600, { scale: 0.55 });        // E03 contractMachine name "合约" (wrap 0.55!), small "绝不转账" under the plate
export const A_LETTER = a(1120, -380);                     // E01 letter "转账请求" (w 60 h 40), between doc and machine
export const A_AIDE = a(1900, -820, { scale: 1.1 });       // E08 liqBot "新助理" 1.1
export const A_CARD = a(1990, -830, { scale: 0.55 });      // E05 keycard "支付卡" 0.55 (hang it on the robot's chest)
export const A_ANYONE = a(2250, -620, { scale: 0.5 });     // kit person signer "任何人" 0.5
export const A_NOTE = a(2100, -600, { w: 90, h: 110 });    // kit doc title "纸条" (w 90 h 110)
export const A_CROSS = [[2700, -170], [2950, 140], [3200, -170], [3450, 140], [3700, -170]].map(([X, dY]) => a(X, -0.35 * X + dY)); // E01 signBoard plate ×5 (size 32): AI 是目标 / 攻击人 / 攻击代码 / 开发工具 / 防御工具 (back row 0/2/4, front row 1/3)
export const A_SIGN = a(-850, 450);                        // E01 signBoard plate "奖池金库"

// ---------------------------------------------------------------- B 智能体车间 (seg2 L21; seg3 全段; seg4 L0) — U0 = 6000
const b = zone(6000);
export const B_AGENT = b(0, -150, { scale: 1.4 });         // E08 liqBot "智能体" 1.4 (nameplate swaps to "Bankr" in seg3 L6–L9)
export const B_HOTW = b(330, -230, { scale: 0.7 });        // kit hotWallet "钱包工具" screen "transfer / approve" (wrap 0.7!)
export const B_CHAIN = b(650, -400, { scale: 0.6 });       // kit chain n 3 title "链上" (wrap 0.6!)
export const B_PHONE = b(-650, -420, { scale: 0.7 });      // kit phone "用户消息" (wrap 0.7!)
export const B_BROWSER = b(-470, -480, { scale: 0.45 });   // kit browserWin title "网页" (wrap 0.45!)
export const B_CABINET = b(-750, 60, { scale: 0.6 });      // E03 slotCabinet title "长期记忆" (wrap 0.6!)
export const B_MANUAL = b(-200, 380, { scale: 0.7 });      // E03 manual title "工具说明" (MCP) (wrap 0.7!)
export const B_PANEL = b(300, 300, { scale: 0.6 });        // E05 funcPanel title "运维面板" (wrap 0.6!)
export const B_GROK = b(-300, -420, { scale: 1.1 });       // E08 liqBot "Grok" 1.1
export const B_FW = b(-150, -260, { scale: 0.6, len: 120 }); // E01 firewall len 120 "屏蔽模型间指令" (wrap 0.6!) between Grok and the agent
export const B_NFT = b(150, -420, { scale: 0.55 });        // E05 keycard "会员 NFT" 0.55
export const B_ORDER = b(-220, -380);                      // E01 letter "转账指令" (w 60 h 40), Grok → agent
export const B_HIST = b(-470, 260, { w: 130, h: 160 });    // kit doc title "历史记录" (red dashed, grey blur bars) (w 130 h 160)
export const B_PARCEL = b(0, 420, { scale: 0.9 });         // E07 parcel "钱包 MCP 包" 0.9
export const B_KEYS = [b(-150, 520, { scale: 0.6 }), b(80, 540, { scale: 0.6 })]; // kit key ×2 "SSH 私钥" / red "Solana 私钥" (wrap 0.6!)
export const B_ATK = b(560, 200, { scale: 0.5 });          // kit person attacker "攻击者" 0.5 (panel corner; can walk to the memory corner)
export const B_REPLIES = [b(380, 450), b(450, 470), b(520, 490)]; // E01 letter ×3 "回复" (w 60 h 40), queued at the panel
export const B_ETH = b(200, 120, { scale: 0.5 });          // E07 oddCoin "55.5 ETH" 0.5
export const B_SCALE = b(850, 250, { scale: 0.7 });        // E07 scale "钱包状态" 0.7 (Lobstar Wilde)
export const B_TOKENS = [b(980, 300), b(1040, 330), b(1100, 360)].map((q) => ({ ...q, scale: 0.45 })); // E07 oddCoin ×3 "代币" 0.45
export const B_DOTS = b(100, -760);                        // 20-dot matrix area (seg3 L9), EXT.dotsB
export const B_SIGN = b(-1000, 450);                       // E01 signBoard plate "智能体车间"

// ---------------------------------------------------------------- C 会议室与开户台 (seg4 全段; seg5 L0) — U0 = 9300
const c = zone(9300);
export const C_LAPTOP = c(-700, -150, { scale: 0.8 });     // kit laptop (native-SVG video call grid, one cell "高管") (wrap 0.8!)
export const C_EMPLOYEE = c(-450, -80, { scale: 0.5 });    // kit person signer "员工" 0.5
export const C_EXT = c(-900, -50, { scale: 0.8 });         // E07 parcel "扩展" 0.8 (red)
export const C_PHONE = c(-450, 350, { scale: 0.7 });       // kit phone video call (wrap 0.7!)
export const C_MASK = c(-300, 420, { scale: 0.8 });        // E26 faceMask "换脸" 0.8 (KITX26.maskMove → in front of C_PHONE)
export const C_SCAM = [c(-650, 330), c(-580, 360)].map((q) => ({ ...q, scale: 0.45 })); // kit person attacker ×2 "诈骗集团" 0.45 (beside / behind the phone)
export const C_VICTIM = c(-100, 450, { scale: 0.45 });     // kit person signer "受害者" 0.45 (faces the phone)
export const C_CAMERA = c(300, -300, { scale: 0.6 });      // E11 snapshotCamera "活体检测" 0.6 (lens faces +v → the passport)
export const C_PASSPORT = c(380, -250, { scale: 0.7 });    // E13 passport "KYC" 0.7
export const C_CABLE = c(60, -330);                        // red dashed "虚拟摄像头注入" cable start (native SVG), EXT.cable
export const C_PHISH = [0, 1, 2, 3, 4, 5].map((i) => c(600 + 60 * i, -420 - 20 * i)); // E01 letter ×6 "钓鱼" 中/EN/日/한/ES/FR (w 60 h 40)
export const C_CODE = c(650, 150, { w: 90, h: 110 });      // kit doc title "暗语" (w 90 h 110)
export const C_FAMILY = [c(520, 120), c(800, 180)].map((q) => ({ ...q, scale: 0.45 })); // kit person signer ×2 "家人" 0.45
export const C_CONFIRM = c(1000, 0, { scale: 0.7 });       // kit phone "换渠道确认" (green check) (wrap 0.7!)
export const C_DOTS = c(300, -760);                        // 17-dot matrix + two dot columns (seg4 L12–L14, in frame, above), EXT.dotsC
export const C_SIGN = [c(-1100, 560), c(1200, -580)];      // E01 signBoard plate ×2 "会议室" / "开户台"

// ---------------------------------------------------------------- D 代码工坊 (seg5 全段; seg6 L0) — U0 = 13100
const d = zone(13100);
export const D_GRADER = d(-800, -250, { scale: 0.7 });     // E14 gradingMachine "基准" 0.7
export const D_SHEETS = [d(-1000, -200), d(-920, -170)].map((q) => ({ ...q, scale: 0.7 })); // E14 answerSheet ×2 "SCONE-bench" / "EVMbench" 0.7
export const D_AUDIT = d(-600, -60, { scale: 1.1 });       // E08 liqBot "审计 AI" 1.1
export const D_MAG = d(-450, -40);                         // kit magnifier (original size), held by the audit AI
export const D_CMS = [d(-350, -380), d(-120, -450)].map((q) => ({ ...q, scale: 0.45 })); // E03 contractMachine ×2 "BSC 合约" (wrap 0.45!)
export const D_HOUR = d(-1150, 150, { scale: 0.7 });       // kit hourglass "利用窗口" (wrap 0.7!)
export const D_DOTS = d(-1200, -720);                      // 405 / 46 / 100-bar / 22-box area (seg5 L1–L7), EXT.dotsD
export const D_DESK = d(250, -200, { scale: 0.65 });       // kit desk "开发机" (wrap 0.65!)
export const D_DEV = d(350, 40, { scale: 0.5 });           // kit person engineer 0.5 (at the dev machine)
export const D_ORACLE = d(600, -330, { scale: 0.8 });      // E01 miniVend kind oracle "cbETH 价格" 0.8 + E04 oracleGhost (same origin, id, scale 0.8)
export const D_BAD = d(560, -660);                         // 18-dot "约 178 万美元坏账" area above the oracle (seg5 L12), EXT.dotsBad
export const D_EXTP = d(900, 0, { scale: 0.8 });           // E07 parcel "Solidity 扩展" 0.8 (red)
export const D_LOT = d(1100, 100, { scale: 0.6 });         // E07 emptyLot "不存在的包名" 0.6
export const D_SQUAT = d(1160, 80);                        // E01 signBoard wood "抢注" (size 32) — planted ON the lot (intended overlap with D_LOT)
export const D_ATK = d(1300, 40, { scale: 0.45 });         // kit person attacker 0.45
export const D_DESKS = [d(950, -450), d(1150, -520), d(1350, -590)].map((q) => ({ ...q, scale: 0.55 })); // kit desk ×3 "钱包工程师" (wrap 0.55!)
export const D_RACK = d(1150, -250, { scale: 0.55 });      // kit rack "内部 AI 工具" (wrap 0.55!)
export const D_SHIELD = d(-350, 250, { scale: 0.7 });      // kit shield "初筛" (wrap 0.7!)
export const D_ENG = d(-180, 300, { scale: 0.5 });         // kit person engineer "对结论负责" 0.5
export const D_SIGN = [d(-1350, 650), d(600, 300)];        // E01 signBoard plate ×2 "找漏洞" / "写代码"

// ---------------------------------------------------------------- E 控制闸口与用户角 (seg6 全段) — U0 = 16900
const e = zone(16900);
export const E_AGENT = e(-900, -150, { scale: 1.3 });      // E08 liqBot "智能体" (hardened) 1.3
export const E_FW = e(-700, -180, { scale: 0.6, len: 140 }); // E01 firewall len 140 "输入隔离" (wrap 0.6!)
export const E_CHECKS = [e(-450, -250), e(-170, -345), e(110, -440)].map((q) => ({ ...q, scale: 0.5 })); // kit checkpoint ×3 "额度" / "白名单" / "人工确认" (wrap 0.5!)
export const E_HOTW = e(380, -520, { scale: 0.6 });        // kit hotWallet "独立低额钱包" (wrap 0.6!) — pipe end
export const E_SAFE = e(650, -380, { scale: 0.8 });        // kit safe gold "主资产" (wrap 0.8!), not on the pipe
export const E_METER = e(-500, -420, { scale: 0.6 });      // E05 thresholdMeter "单日额度" (wrap 0.6!)
export const E_HWW = e(230, 30);                         // kit hwWallet "解码后的交易" (original size)
export const E_APPROVER = e(420, 0, { scale: 0.5 });    // kit person engineer "审批人" 0.5
export const E_CABINET = e(-700, 150, { scale: 0.45 });    // E03 slotCabinet "记忆 · 校验来源" (wrap 0.45!)
export const E_CHAIN = e(-400, 250, { scale: 0.5 });       // kit chain n 3 "读取余额" (wrap 0.5!)
export const E_PANEL = e(-50, 250, { scale: 0.5 });        // E05 funcPanel "运维面板" (wrap 0.5!)
export const E_LOCK = e(160, 330, { scale: 0.5 });         // kit padlock (wrap 0.5!) — hung on the panel in seg6 L8
export const E_CM = e(900, -200, { scale: 0.55 });         // E03 contractMachine "合约限额" (wrap 0.55!) — answers the question
export const E_PROMPT = e(720, -40, { w: 110, h: 140 });   // kit doc standing title "提示词" lines ["绝不转账"] (small, w 110 h 140)
export const E_LETTER = e(850, 0);                         // E01 letter "转账请求" (w 60 h 40)
export const E_YOU = e(1300, -250, { scale: 0.55 });       // kit person signer "你" 0.55
export const E_USAFE = e(1400, -600, { scale: 0.6 });      // kit safe variant "hot" "独立钱包 · 少量资金" (wrap 0.6!)
export const E_UBOT = e(1550, -350, { scale: 0.9 });       // E08 liqBot "AI 机器人" 0.9
export const E_SIGN = [e(-1200, 560), e(1750, -100)];      // E01 signBoard plate ×2 "控制闸口" / "用户角"

// ---------------------------------------------------------------- object screen extents (scale 1, relative to the ground point;
// measured from the rendered SVGs: visible geometry only, contact shadows / glow / hidden layers excluded)
export const EXT = {
  person: [-50, -208, 50, 7], personAtk: [-50, -229, 50, 7], liqBot: [-40, -77, 45, 20], safe: [-180, -376, 181, 82], safeHot: [-117, -250, 117, 52],
  chain3: [-213, -171, 213, 85], browserWin: [-201, -332, 201, 81], slotCabinet: [-209, -467, 209, 90], manual: [-137, -91, 132, 64],
  funcPanel: [-292, -266, 296, 124], firewall120: [-117, -203, 117, 43], firewall140: [-133, -209, 133, 49], keycard: [-28, -85, 26, 9],
  letter: [-27, -54, 25, 0], signPlate: [-146, -245, 119, 54], signPlate4: [-117, -228, 89, 43], signWood: [-68, -139, 68, 14],
  docStanding: [-64, -193, 61, 16], docSmall: [-47, -161, 50, 16], docFlat: [-99, -67, 140, 52], docNote: [-70, -47, 98, 36],
  contractMachine: [-155, -250, 155, 76], parcel: [-38, -57, 38, 18], scaleE7: [-89, -212, 89, 39], emptyLot: [-159, -135, 159, 76],
  oddCoin: [-39, -111, 39, 18], laptop: [-164, -234, 141, 66], phone: [-70, -195, 58, 27], faceMask: [-37, -111, 37, 16],
  snapshotCamera: [-52, -162, 47, 22], passport: [-29, -76, 29, 12], gradingMachine: [-91, -128, 91, 43], answerSheet: [-38, -133, 38, 15],
  miniVendOracle: [-72, -261, 72, 31], desk: [-147, -272, 147, 74], rack: [-113, -349, 113, 51], shield: [-68, -218, 64, 28],
  magnifier: [-58, -284, 120, -50], hourglass: [-56, -201, 56, 28], checkpoint: [-213, -305, 284, 143], thresholdMeter: [-52, -290, 71, 26],
  hwWallet: [-73, -62, 90, 33], padlock: [-56, -138, 62, 28], key: [-75, -44, 89, 31],
  dotsA: [0, 0, 280, 110], dotsB: [0, 0, 300, 120], dotsC: [0, 0, 340, 170], cable: [0, -20, 200, 40],
  dotsD: [0, 0, 420, 200], dotsBad: [0, 0, 220, 90],
};
// rect(o, kind, scale) → world-canvas bbox [x0, y0, x1, y1] of that object standing at o
export const rect = (o, kind, scale = o.scale ?? 1) => { const [X, Y] = Wp(o.u, o.v); const q = EXT[kind]; return [X + q[0] * scale, Y + q[1] * scale, X + q[2] * scale, Y + q[3] * scale]; };
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
  vault: [r(A_SAFE, "safe"), r(A_FREYSA, "liqBot"), r(A_PLAYER, "personAtk"), r(A_SESSION, "docFlat"), ...A_COINS.map((q) => r(q, "oddCoin")),
    r(A_DOTS, "dotsA"), r(A_KEY, "key")],
  rule: [r(A_PROMPT, "docStanding"), r(A_CM, "contractMachine"), r(A_LETTER, "letter")],
  aide: [r(A_AIDE, "liqBot"), r(A_CARD, "keycard"), r(A_ANYONE, "person"), r(A_NOTE, "docNote")],
  cross: A_CROSS.map((q) => r(q, "signPlate4")),
  signA: [r(A_SIGN, "signPlate")],
  // B
  core: [r(B_AGENT, "liqBot"), r(B_HOTW, "safeHot"), r(B_CHAIN, "chain3")],
  inputs: [r(B_PHONE, "phone"), r(B_BROWSER, "browserWin"), r(B_CABINET, "slotCabinet"), r(B_MANUAL, "manual"), r(B_PANEL, "funcPanel")],
  inject: [r(B_GROK, "liqBot"), r(B_FW, "firewall120"), r(B_NFT, "keycard"), r(B_ORDER, "letter"), r(B_DOTS, "dotsB")],
  memory: [r(B_CABINET, "slotCabinet"), r(B_HIST, "docFlat")],
  tool: [r(B_MANUAL, "manual"), r(B_PARCEL, "parcel"), ...B_KEYS.map((q) => r(q, "key"))],
  panel: [r(B_PANEL, "funcPanel"), r(B_ATK, "personAtk"), ...B_REPLIES.map((q) => r(q, "letter")), r(B_ETH, "oddCoin")],
  fault: [r(B_SCALE, "scaleE7"), ...B_TOKENS.map((q) => r(q, "oddCoin"))],
  signB: [r(B_SIGN, "signPlate")],
  // C
  meet: [r(C_LAPTOP, "laptop"), r(C_EMPLOYEE, "person"), r(C_EXT, "parcel"), r(C_PHONE, "phone"), r(C_MASK, "faceMask"),
    ...C_SCAM.map((q) => r(q, "personAtk")), r(C_VICTIM, "person")],
  kyc: [r(C_CAMERA, "snapshotCamera"), r(C_PASSPORT, "passport"), r(C_CABLE, "cable"), ...C_PHISH.map((q) => r(q, "letter")),
    r(C_CODE, "docNote"), ...C_FAMILY.map((q) => r(q, "person")), r(C_CONFIRM, "phone"), r(C_DOTS, "dotsC")],
  signC: [r(C_SIGN[0], "signPlate"), r(C_SIGN[1], "signPlate")],
  // D
  bench: [r(D_GRADER, "gradingMachine"), ...D_SHEETS.map((q) => r(q, "answerSheet")), r(D_AUDIT, "liqBot"), r(D_MAG, "magnifier"),
    ...D_CMS.map((q) => r(q, "contractMachine")), r(D_HOUR, "hourglass"), r(D_DOTS, "dotsD")],
  oracle: [r(D_DESK, "desk"), r(D_DEV, "person"), r(D_ORACLE, "miniVendOracle"), r(D_BAD, "dotsBad")],
  supply: [r(D_EXTP, "parcel"), r(D_LOT, "emptyLot"), r(D_SQUAT, "signWood"), r(D_ATK, "personAtk"), ...D_DESKS.map((q) => r(q, "desk")), r(D_RACK, "rack")],
  defend: [r(D_SHIELD, "shield"), r(D_ENG, "person"), r(D_AUDIT, "liqBot"), r(D_MAG, "magnifier")],
  signD: [r(D_SIGN[0], "signPlate"), r(D_SIGN[1], "signPlate")],
  // E
  gate: [r(E_AGENT, "liqBot"), r(E_FW, "firewall140"), ...E_CHECKS.map((q) => r(q, "checkpoint")), r(E_HOTW, "safeHot"), r(E_SAFE, "safe"),
    r(E_METER, "thresholdMeter"), r(E_HWW, "hwWallet"), r(E_APPROVER, "person")],
  guard: [r(E_CABINET, "slotCabinet"), r(E_CHAIN, "chain3"), r(E_PANEL, "funcPanel"), r(E_LOCK, "padlock")],
  answer: [r(E_CM, "contractMachine"), r(E_PROMPT, "docSmall"), r(E_LETTER, "letter"), ...E_CHECKS.map((q) => r(q, "checkpoint"))],
  user: [r(E_YOU, "person"), r(E_USAFE, "safeHot"), r(E_UBOT, "liqBot")],
  signE: [r(E_SIGN[0], "signPlate"), r(E_SIGN[1], "signPlate")],
};
export const ZONE_RECTS = {
  A: [...R.vault, ...R.rule, ...R.aide, ...R.cross, ...R.signA],
  B: [...R.core, ...R.inputs, ...R.inject.slice(0, 4), r(B_HIST, "docFlat"), r(B_PARCEL, "parcel"), ...B_KEYS.map((q) => r(q, "key")),
    ...R.panel.slice(1), ...R.fault, r(B_DOTS, "dotsB"), ...R.signB],
  C: [...R.meet, ...R.kyc, ...R.signC],
  D: [...R.bench, ...R.oracle, ...R.supply, r(D_SHIELD, "shield"), r(D_ENG, "person"), ...R.signD],
  E: [...R.gate, ...R.guard, r(E_CM, "contractMachine"), r(E_PROMPT, "docSmall"), r(E_LETTER, "letter"), ...R.user, ...R.signE],
};
const Z = ZONE_RECTS;
const SAFE = [100, 280, 1820, 860];                      // default target: below the term-card corner (y ≥ 280), inside x 60–1860 / y 160–860
const MID = [300, 300, 1620, 860];                       // close-ups: a little narrower, room for code cards / cards at the sides

// ---------------------------------------------------------------- camera presets → KIT.camSet(tl, CAMS.x) / KIT.cam(tl, t, CAMS.x, dur)
export const CAMS = {
  // 全景：整条智能体大街（seg2 L0–L5 放大器、seg6 L16 结束卡）
  wide: fit([...Z.A, ...Z.B, ...Z.C, ...Z.D, ...Z.E], [60, 220, 1860, 860], 1),
  // A 奖池保险柜 + Freysa + 玩家 + 新会话文件 + 金币 + 点阵（seg1 起点 L0–L7）
  vaultA: fit(R.vault, SAFE, 1.4),
  // A 提示词文件 + 合约机器 + 转账请求信封（seg1 L8–L11 终点；seg2 起点）
  ruleA: fit(R.rule, MID, 1.4),
  // A 右半助理角：新助理 + 支付卡 + 递纸条的人（seg2 L6–L15）
  aideA: fit(R.aide, MID, 1.4),
  // A 五岔路口五块牌（seg2 L16–L20）
  crossA: fit(R.cross, SAFE, 1.4),
  // B 智能体 + 五个入口 + 钱包工具 + 链（seg2 L21 终点；seg3 起点 L0–L4）
  workshopB: fit([...R.core, ...R.inputs], SAFE, 1.4),
  // B Grok + 智能体 + 会员 NFT 卡 + 屏蔽墙 + 20 点点阵（seg3 L5–L9）
  injectB: fit([...R.inject, r(B_AGENT, "liqBot"), r(B_HOTW, "safeHot")], SAFE, 1.4),
  // B 记忆柜 + 伪造历史记录 + 智能体（seg3 L10–L14）
  memoryB: fit([...R.memory, r(B_AGENT, "liqBot")], MID, 1.4),
  // B 工具说明手册 + MCP 包 + 两把私钥（seg3 L15–L18）
  toolB: fit(R.tool, MID, 1.4),
  // B 运维面板 + 攻击者 + 回复信封 + 55.5 ETH + 台秤 + 代币（seg3 L19–L24 终点；seg4 起点）
  panelB: fit([...R.panel, ...R.fault], SAFE, 1.4),
  // C 笔记本视频会议 + 扩展包裹 + 手机视频 + 换脸面具 + 诈骗集团 + 受害者（seg4 L0–L6）
  meetC: fit(R.meet, SAFE, 1.4),
  // C 相机 + 护照 + 注入电缆 + 钓鱼信 + 暗语 + 家人 + 换渠道确认 + 点阵（seg4 L7–L18 终点；seg5 起点）
  kycC: fit(R.kyc, SAFE, 1.4),
  // D 阅卷机 + 答题卡 + 审计 AI + 放大镜 + 合约机器 + 沙漏 + 点阵（seg5 L0–L9）
  benchD: fit(R.bench, SAFE, 1.4),
  // D 开发机 + 工程师 + 报价机 + 幽灵指针 + 坏账点阵（seg5 L10–L14；代码卡 A 在左侧）
  oracleD: fit(R.oracle, MID, 1.4),
  // D 假扩展 + 荒地抢注 + 三张工位 + 内部 AI 机柜（seg5 L15–L18）
  supplyD: fit(R.supply, SAFE, 1.4),
  // D 盾 + 工程师 + 审计 AI + 放大镜（seg5 L19–L20 终点；seg6 起点）
  defendD: fit(R.defend, MID, 1.4),
  // E 加固智能体 + 输入隔离墙 + 三道关卡 + 低额钱包 + 主资产 + 额度表 + 确认设备 + 记忆 / 余额 / 面板（seg6 L0–L9）
  gateE: fit([...R.gate, ...R.guard], SAFE, 1.4),
  // E 右端用户角（seg6 L10–L11）
  userE: fit(R.user, MID, 1.4),
  // E 合约限额机器 + 被拒的信封 + 小提示词文件 + 三道关卡（seg6 L12–L15）
  answerE: fit(R.answer, SAFE, 1.4),
};
/** alias (ep11 convention): the whole world */
export const world = CAMS.wide;
CAMS.world = CAMS.wide;
