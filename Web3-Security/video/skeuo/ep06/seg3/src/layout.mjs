// layout.mjs — ep06/seg3 world positions, aligned with the episode world fixed by seg1 (../../seg1/src/layout.mjs):
// 取整刀在世界原点；金库 VAULT + 出票机 besideSafe(VAULT)；池子区 SORTER / POOL / MINI_CUTTER / SORTER_ATK；计数器 CUT_CTR（钢台 z 70）。
// seg3-only props are placed relative to those anchors with screen-ground offsets (G is linear, so base + G(dX, dY)
// moves dX px right / dY px down on the ground at camera k = 1).
import { G } from "../../../kit/iso.mjs";
import { CUTTER, CUT_CTR, CUT_CTR_Z, VAULT, SORTER, POOL, MINI_CUTTER, SORTER_ATK, BELT_Z } from "../../seg1/src/layout.mjs";

const g = (b, X, Y) => { const d = G(X, Y); return { u: b.u + d.u, v: b.v + d.v }; };
export { CUT_CTR_Z, BELT_Z };
export const LY = {
  // 中区·取整台
  RC: CUTTER,
  RCNT: CUT_CTR,              // rollCounter on a steel pedestal (seg1 同位)
  HEAP: g(CUTTER, 330, 170),  // 碎屑堆（红托盘右前）
  DESK: g(CUTTER, -420, 260), // 模糊测试台（左前）
  // 中右区·金库
  SAFE: VAULT,
  USER: g(CUTTER, 860, 110),
  // 比喻角（左前空地，离溢出车间够远）
  PIZ: g(CUTTER, -820, 620),
  CLERK: g(CUTTER, -1070, 600),
  CUST: g(CUTTER, -520, 820),
  // 右区·池子（Balancer）
  SORT: SORTER,
  POOL,
  MINI: MINI_CUTTER,
  ATK: SORTER_ATK,
  BAL: g(POOL, 300, 270),
  // 更右·KyberSwap（池子区右侧空地）
  KYB: g(POOL, 1550, 180),
  KCUT: g(POOL, 1200, 420),
  RAIL: g(POOL, 1630, 460),
};
