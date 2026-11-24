// seg4 world layout — aligned to seg1's shared world (ep05/seg1/src/layout.mjs):
//   main contract machine MAIN at (u,v)=(0,0), its function panel MAIN_PANEL (0,300), TRON block at TRON_ZONE (1300,1200).
// Positions below were designed as world-canvas ground points (X,Y) and are shifted by two offsets:
//   P(...)  — group anchored on the main panel (developer corner left of the panel, L0 / L16–L18)
//   T(...)  — group anchored on TRON_ZONE (account safe = TRON_ZONE exactly)
import { G, Wp } from "../../../kit/iso.mjs";
import { MAIN, MAIN_PANEL, TRON_ZONE } from "../../seg1/src/layout.mjs";

export { MAIN };
const fpS = Wp(MAIN_PANEL.u, MAIN_PANEL.v), trS = Wp(TRON_ZONE.u, TRON_ZONE.v);
export const PO = [fpS[0] + 500, fpS[1] - 600];   // design FP was G(-500,600)
export const TO = [trS[0] - 950, trS[1] - 560];   // design ACCT was G(950,560)
const P = (X, Y) => G(X + PO[0], Y + PO[1]);
const T = (X, Y) => G(X + TO[0], Y + TO[1]);
export const tW = (p) => [p[0] + TO[0], p[1] + TO[1]];   // shift a design world-canvas point of the TRON group

// ---- main avenue: the function panel; developer corner on its left (role board + received address + x-ray safe)
export const FP = MAIN_PANEL;
export const RB = P(-1080, 380);       // roleBoard（owner 空挂钩）
export const AP = P(-1520, 840);       // addrPlate（收到的地址）
export const AP_XRAY = P(-1290, 700);  // 地址背后透视出的账户柜（0.6 倍）
export const MAG = P(-1060, 900);      // 放大镜起点

// ---- TRON block (L1–L15)
export const EOA = T(200, 470);        // 以太坊 EOA：kit hotWallet + 一把钥匙
export const EOA_KEY = T(290, 640);
export const TM = T(540, 430);         // thresholdMeter（柜子左后方；柜门向右开，右前方留空）
export const ACCT = TRON_ZONE;         // accountSafe
export const CHAIN = T(1520, 130);     // Witness → 出块节点
export const VICTIM = T(400, 960);
export const PHONE = T(530, 990);
export const ATK = T(1650, 820);
export const HG = T(1830, 720);
export const OTC = T(950, 1620);       // 场外交易小桌（前方，L14 才出现）
