// seg4「④ 一个卡住全部」world layout — 右区·拍卖场与分发线（BRIEF §2.4）。
// 世界坐标对齐 seg1（ep07/seg1/src/layout.mjs）：拍卖台 = AUCTION_ZONE (u 1700, v 1500) ≈ 世界画布 (2253, 127)。
// 其余物件全部相对拍卖台地面点 S(dx, dy)（世界画布 px 偏移）摆放；从左到右：
//   DoS 路牌 + 被封的合约 → 拍卖台 / 取件柜 → 快递比喻 → 四种 DoS（分发线、天平、两条链）→ Akutars。
// import 失败时退回同一个默认值。
import { G, Wp } from "../../../kit/iso.mjs";

let shared = null;
try { shared = await import("../../seg1/src/layout.mjs"); } catch { shared = null; }

export const STAND = shared?.AUCTION_ZONE ?? { u: 1700, v: 1500 };
export const ALIGNED = !!shared?.AUCTION_ZONE;

const SW = Wp(STAND.u, STAND.v);
export const SWp = (dx, dy) => [SW[0] + dx, SW[1] + dy];      // world-canvas point relative to the stand ground point
const S = (dx, dy) => G(SW[0] + dx, SW[1] + dy);

// ---- L0–L1 · 路牌 + 被封住按钮的合约（拍卖台左侧）
export const SIGN = S(-1560, 60);
export const VM = S(-1150, -20);

// ---- L2–L10 · 拍卖台（STAND, scale 1.5）
export const ATK = S(265, 215);        // A：拒收合约（红色 miniVend），站在退款滑槽末端
export const ARM = S(160, 200);        // A 的 callbackArm（小红手把退款推回去）
export const BID = S(-250, 120);       // B：新出价者
export const QUEUE = [S(-430, 30), S(-560, -10), S(-690, -50)]; // 台下等着出价的人
export const LOCKER = S(470, -150);    // 取件柜（拉取式支付）

// ---- L7–L8 · 比喻：100 个包裹（拍卖台右侧）
export const HOUSE = S(1350, 60);      // 第一户
export const PARCEL0 = S(1500, 30);    // 第一个包裹，沿 +u 往后排
export const P_STEP = 100;             // 包裹间距（沿 u）
export const P_N = 12;

// ---- L11–L19 · 四种 DoS
const E = 3700;
export const SORTER = S(E, 0);
export const GAUGE = S(E - 430, -90);
export const RCPT = [0, 1, 2, 3].map((i) => S(E + 360 + i * 120, 70));
export const LOCKER2 = S(E + 960, 40);
export const BAL = S(E + 2000, 10);
export const CH_ETH = S(E + 2900, -20);
export const CH_TRON = S(E + 3450, -20);
export const HG = S(E + 3900, 70);

// ---- L20–L25 · Akutars
const F = E + 5200;
export const AK = S(F, -40);
export const AK_STAND = S(F - 560, 40);
export const AK_ATK = S(F - 420, 140);
export const AK_GATE = S(F + 560, 110);
export const AK_GOLD = S(F - 30, 190);
export const AK_LOCK = S(F + 90, 250);
export const XS = { E, F };
