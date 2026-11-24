// layout.mjs — seg2「调用上下文」世界布局。与 seg1 的世界坐标对齐（../../seg1/src/layout.mjs、seg1/SPEC.md）：
// 大道沿 +u，中线 v = 0，半宽 110；三台合约机器在路后侧 v = −270，u = 0 / 560 / 1120（seg1 的攻击者合约、灰色 A、B 台位，
// seg2 改作 A、B、C）；管理员 / 笔记本 / 挂锁钥匙在左区原位。seg2 新增：每台机器左后方自己的存储抽屉柜（相对机器 u −354、v −330，
// 机器 −u 侧传送管平接到柜子 +u 侧面）、A→B 路面三条车道、比喻层道具。
// 投影与 kit 相同：Wp(u,v,z) = (0.819u + 0.574v, −0.287u + 0.410v − 0.866z)。
import { Wp } from "../../../kit/iso.mjs";

export const ROAD = { u0: -560, u1: 1850, v0: -110, v1: 110, mid: 0 };   // = seg1 ROAD
export const MACH_V = -270;
/** 三台合约机器原点（= seg1 三个台位） */
export const MACH = { A: { u: 0, v: MACH_V }, B: { u: 560, v: MACH_V }, C: { u: 1120, v: MACH_V } };
export const OUT = (m) => ({ u: m.u + 50, v: m.v + 150 });           // 出件槽前方的地面点
/** 抽屉柜相对机器的偏移 */
export const CAB_DU = -354, CAB_DV = -330;
export const CAB = Object.fromEntries(Object.entries(MACH).map(([k, m]) => [k, { u: m.u + CAB_DU, v: m.v + CAB_DV }]));
export const CAB_OPTS = { n: 4 };
export const PIPE = { len: 270, z: 64 };

// 左区 · 用户侧（= seg1）
export const USER = { u: -900, v: -10 };      // 管理员 / 用户（EOA）
export const LAPTOP = { u: -700, v: 40 };
export const KEY = { u: -1120, v: 40 };       // 挂锁 + 钥匙（私钥）
export const DELEG = { u: -1000, v: -400, k: 0.62 }; // EIP-7702 委托的小号合约机器
export const MAG1 = { u: -1420, v: 60 };     // 检测器 1：有没有代码？
export const MAG2 = { u: -640, v: -170 };     // 检测器 2：msg.sender == tx.origin？

// 右区 · 链上
export const CHAIN = { u: 2000, v: -420, n: 3 };

// A → B 的三条并行车道（路面上），沿 u
export const TRACK = { u0: -40, u1: 620, v: [-70, 10, 90], names: ["call", "delegatecall", "staticcall"], lab: [60, 320, 580] };
// B 的规程手册平放在 B、C 之间（delegatecall 时飞到 A 前方第二条车道起点）
export const MANUAL_HOME = { u: 840, v: -300 };
export const MANUAL_AT_A = { u: 110, v: 10 };

// 比喻层（政务大厅）
export const COUNTER = { u: 560, v: 10 };     // 唯一的窗口，在 B 正前方的路面上
export const CLERK0 = { u: -60, v: 160 };
export const CLERK_AT_B = { u: 460, v: 160 };
export const OPEN_BOOK = { u: -130, v: 20 };
export const STANCH = [{ u: 360, v: 230 }, { u: 780, v: 230 }];

export const P = (u, v, z = 0) => Wp(u, v, z);
