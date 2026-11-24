// layout.mjs — seg3「③ 攻击面地图」世界布局。对齐 seg1 定下的世界坐标（../../seg1/src/layout.mjs）：
//   售货机 VEND (0,0)，正面 +v 朝向交易之路；交易之路沿 +u，中线 v = 330，半宽 110（西南 → 东北）。
// seg3 在这条路上摆出"一笔交易经过的环节"：用户 → 钱包与前端 → 内存池 → 构建者 → 售货机（目标合约）
//   → 右侧三台外部合约 → 东北方向沿路过跨链桥 → 对岸合约。路前方（+v，东南侧）一排六大类挂牌。
// 投影与 kit 相同：Wp(u,v,z) = (0.819u + 0.574v, −0.287u + 0.410v − 0.866z)。
import { VEND as V1, ROAD as R1 } from "../../seg1/src/layout.mjs";

export const VEND = V1;                                   // (0,0)
export const ROAD = { ...R1 };                            // u0 −2200 … u1 2200, v 330, half 110
const RV = ROAD.v;

// ---- 起点：用户 / 攻击者 + 钱包前端（笔记本）
export const USER = { u: -1960, v: RV - 40 };
export const ATK = { u: -2170, v: RV + 50 };
export const LAPTOP = { u: -1690, v: RV - 200 };          // 路后侧
export const TX0 = { u: -1830, v: RV + 10 };              // 交易信封出现处

// ---- 内存池（地台 532×304，压在路上）、分拣机（带面沿 +u，出口对齐内存池出口 v = RV − 84）
export const MP = { u: -1160, v: RV };
export const SO = { u: -470, v: RV - 84 };
export const MAG = { u: -1250, v: RV + 330 };              // 从外面看进内存池的放大镜

// ---- 目标合约右侧三台外部合约（沿 +u，与售货机同一排）
export const MINI = { token: { u: 330, v: 0 }, dex: { u: 550, v: 0 }, oracle: { u: 770, v: 0 } };

// ---- 跨链桥：架在东北段的路上；对岸售货机放在桥的 farBank
export const BRIDGE = { u: 1260, v: RV };

// ---- 底层（L11–L12）：路面下方的共识层与节点，整体下沉 BASE_Z
export const BASE_Z = 400;
export const SLAB = { u0: -1480, u1: 200, v0: RV - 180, v1: RV + 150, z: 110 };
export const BASE = { u0: -1480, u1: 200, v0: RV - 180, v1: RV + 150 };
export const BCHAIN = { u: -640, v: RV - 10 };
export const BRPC = [{ u: -1180, v: RV }, { u: -150, v: RV + 20 }];

// ---- 六大类挂牌：路前方一排（v = 820），u 间距 400；⑥ 略大
export const PLATE_V = 820;
export const PLATES = [-1000, -560, -120, 320, 760, 1200].map((u) => ({ u, v: PLATE_V }));

// ---- L15–L19 道具
export const KEYDROP = { u: -230, v: -10 };               // 掉在维修门旁的钥匙
export const DOC = { u: 640, v: 170 };                    // 签过的文件（重放），在预言机前
export const TRADER = { u: 500, v: 250 };                 // 经济设计：套利小人
export const STACK = { u: 640, v: 280 };                  // 越来越鼓的钱
export const CALLER = { u: -1660, v: 600 };               // 打电话的小人（社会工程）

// ---- L21–L22：⑥ 拆成两块木牌（⑥ 两侧，路前方更远处）；物件摆在木牌斜下方，不挡牌面
export const BOARD_L = { u: 650, v: 820 };
export const BOARD_R = { u: 1550, v: 820 };
export const L_RPC = { u: 250, v: 1180 };
export const L_CHAIN = { u: 560, v: 1180 };
export const L_LOCK = { u: 830, v: 1200 };
export const R_CALLER = { u: 1150, v: 1180 };
export const R_LAPTOP = { u: 1340, v: 1170 };
export const R_KEY = { u: 1570, v: 1250 };
export const AI_MAG = { u: 950, v: 900 };
