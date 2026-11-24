// seg4 world layout — 整数工坊（BRIEF §2）：中区取整刀 + 中右区金库。
// 世界坐标对齐 seg1（ep06/seg1/src/layout.mjs）：取整刀 CUTTER = (0,0)，金库 VAULT = (1300,760)，出票机 = besideSafe(VAULT)。
// 其余物件全部相对金库 V(dx, dy) 摆放（世界画布 px 偏移）；import 失败时退回 kit-ext README 示例坐标。
import { G, Wp } from "../../../kit/iso.mjs";
import { besideSafe } from "../../kit-ext/objects-ext.mjs";

let shared = null;
try { shared = await import("../../seg1/src/layout.mjs"); } catch { shared = null; }

export const CUTTER = shared?.CUTTER ?? G(900, 650);
export const VAULT = shared?.VAULT ?? G(3280, 560);
export const DISP = besideSafe(VAULT);
export const ALIGNED = !!(shared?.CUTTER && shared?.VAULT);

const VS = Wp(VAULT.u, VAULT.v);
export const VW = (dx, dy) => [VS[0] + dx, VS[1] + dy];       // world-canvas point relative to the vault ground point
const V = (dx, dy) => G(VS[0] + dx, VS[1] + dy);

export const ATK = V(-470, 300);       // 攻击者（出票机左前）
export const ATK_PILE = V(-300, 330);  // 攻击者准备捐赠的金条堆
export const ATK_OUT = V(-640, 430);   // 赎回后攻击者脚边的金条（两堆）
export const VIC = V(470, 360);        // 受害者（柜门右前，门开 105° 时不挡）
export const VIC_PILE = V(290, 300);   // 受害者的 9999 USDC
export const LANE0 = V(-170, 210);     // 交易队列：队首（靠近出票机）
export const LANE1 = V(260, 520);      // 交易队列：队尾
export const BAL = V(820, 40);         // 天平（L16）
export const STACK = V(330, 60);       // L18 所需捐赠的金条柱（柜子右侧）
export const PIZZA = V(-850, 470);     // 比喻：披萨盒（金库左前，取整台正前方）
export const CUST1 = V(-1130, 430);    // 第一个顾客
export const CUST2 = V(-560, 640);     // 下一个顾客
export const COINS = V(-430, 590);     // 下一个顾客付的钱
