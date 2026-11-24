// layout.mjs — 签名路径（七道关）的世界布局常量。seg2 建立，seg3a/3b/4/5a/5b 沿用。
// 世界坐标 (u, v, z)，与 ../../kit/iso.mjs 相同（方位 35°、仰角 30°；1 单位 ≈ 相机倍率 1 时 1 px）。
// 道路沿 +u 方向（屏幕上从左下伸向右上），道路中线 v = 0，路面 v ∈ [-148, 148]。
// 检查站（kit checkpoint）的原点放在 v = GATE_V = -62，这样它自带路面的中线正好落在 v = 0；
// 岗亭在道路后侧（-v，屏幕左上），道闸在 u = 关卡u - 18 的平面里横跨路面。
import { Wp } from "../../kit/iso.mjs";

export const ROAD = { u0: -760, u1: 4200, half: 148, v: 0 };      // 主路范围
export const GATE_DU = 640;                                       // 相邻两关的 u 间距
export const GATE_V = -62;                                        // checkpoint 原点的 v
export const GATE_NAMES = ["业务意图", "请求构造", "风控与审批", "显示与解码", "签名", "广播", "链上状态"];
export const GATE_NUMS = ["①", "②", "③", "④", "⑤", "⑥", "⑦"];
/** 七个检查站的原点（world u,v）：u = 0, 640, …, 3840 */
export const GATES = GATE_NAMES.map((name, i) => ({ i, n: GATE_NUMS[i], name, u: i * GATE_DU, v: GATE_V }));
/** 信封在第 i 关前的停靠点（路中线，道闸前 170） */
export const STOP = GATES.map((g) => ({ u: g.u - 170, v: 0 }));

// 起点与终点
export const USER = { u: -600, v: -10 };          // 用户（人物）
export const PHONE = { u: -440, v: 150 };         // 手机
export const CHAIN = { u: 4480, v: 0, n: 3 };     // 区块链（3 块，沿 u 排开，块间距 180）→ 方块 u = 4300 / 4480 / 4660
export const CHAIN_LAST = { u: 4660, v: 0, z: 100 };

// 每关的配套物件（都在道路后侧 -v，屏幕上落在本关岗亭的左上方；关名标签在门牌正上方）
export const PROPS = {
  ledger: { u: -280, v: -420 },            // ① 账本（放在台座上，台座高 60）
  wallet: { u: 498, v: -527 },             // ② 钱包后台服务器（rack，铭牌 WALLET）
  shield: { u: 1098, v: -384 },            // ③ 风控盾牌
  approver: { u: 925, v: -432 },           // ③ 审批人
  podium: { u: 990, v: -321 },             // ③ 审批按钮台
  monitor: { u: 1741, v: -528 },           // ④ 显示器（屏幕朝 +v）
  viewer: { u: 1497, v: -406 },            // ④ 看屏幕的审批人
  magnifier: { u: 1690, v: -400 },         // ④ 放大镜（扫过屏幕）
  mpc: { u: 2400, v: -470 },               // ⑤ MPC 节点（rack）
  hsm: { u: 2327, v: -225 },               // ⑤ 加密机
  signers: [{ u: 2839, v: -257 }, { u: 2938, v: -260 }, { u: 3038, v: -263 }], // ⑤ 多签签名人（示意）
  seal: { u: 2390 + 36, v: -8 },           // ⑤ 公章（印痕中心 = 信封停靠点 STOP[4]）
  padlock: { u: 2592, v: -136, z: 72, scale: 0.8 }, // ⑤ 私钥：挂锁 + 钥匙，摆在岗亭窗台上（段尾）
  tower: { u: 3058, v: -527 },             // ⑥ 广播塔
};

// 支线：数据源 RPC（从第 ⑤ 关右侧伸向道路前侧 +v，屏幕右下）
export const BRANCH = { u: 2660, v0: 148, v1: 950, half: 60 };
export const RPC = { u: 2660, v: 1010 };

// 箭头（第 10 句）：第 i 关 → 第 i+1 关，路面中线上 u ∈ [g_i + 110, g_{i+1} - 250]
export const ARROWS = GATES.slice(0, 6).map((g) => ({ a: g.u + 110, b: g.u + GATE_DU - 250 }));

/** world → world-canvas px */
export const P = (u, v, z = 0) => Wp(u, v, z);
