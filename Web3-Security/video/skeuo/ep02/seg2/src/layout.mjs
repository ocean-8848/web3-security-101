// layout.mjs — ep02/seg2 世界坐标。生产线、工位、签名台、链上、seg1 金库角全部取自 seg1/src/layout.mjs（seg1 定稿，本段只对齐）。
// 本段新增：告示区（段首）、比喻保险柜、攻击者 GPU 枚举机（生产线外侧，链上右侧）。用世界画布地面坐标 G(X, Y) 摆放。
import { G } from "../../../kit/iso.mjs";
import * as S1 from "../../seg1/src/layout.mjs";
export { S1 };

const PADV = S1.LINE.v - 150;                       // 工位中心 v（seg1：线后侧，方块中心 v = −1650）
const st = (i) => ({ u: S1.STATIONS[i].u, v: PADV });
export const S = { ent: st(0), mn: st(1), seed: st(2), tree: st(3), key: st(4), addr: st(5) };
export const BELT = { u: (S1.LINE.u0 + S1.LINE.u1) / 2, v: S1.LINE.v, len: S1.LINE.u1 - S1.LINE.u0, width: 2 * S1.LINE.half };
export const VIT = { w: 300, d: 230, h: 230 };
export const ADDR_IN = [{ du: -95, dv: -45 }, { du: 0, dv: 5 }, { du: 95, dv: 55 }];
export const CHAIN = S1.CHAIN;
const D = S1.SIGN_DESK;
export const SIGN = {
  path: [{ u: D.u, v: S1.LINE.v + S1.LINE.half + 10 }, { u: D.u, v: D.v - 120 }],
  seal: { u: D.u, v: D.v },
  msg: { u: D.u - 240, v: D.v - 30 },
  cup: { u: D.u + 260, v: D.v - 60 },
  out: { u: D.u - 110, v: D.v + 340 },
  hash: { u: D.u + 560, v: D.v + 150 },
};
const sign = G(1880, 120);
export const NOTICE = { sign, ex: [-420, 0, 420].map((du) => ({ u: sign.u + du, v: sign.v + 480 })) };
const safe = G(2520, -480);
const g0 = G(1380, -1160);
export const META = {
  safe,
  thief: { u: safe.u, v: safe.v + 330 },
  gpu: [g0, G(1660, -1060), G(1940, -960)],
  thiefAtGpu: { u: g0.u - 40, v: g0.v + 260 },
  beacon: G(2200, -1300),
};
