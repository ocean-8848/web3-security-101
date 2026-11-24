// layout.mjs — ep06/seg2「② 五类缺陷」world coordinates (u, v), aligned to seg1's「整数工坊」.
// Shared positions come from ../../seg1/src/layout.mjs (seg1 is authoritative): CUTTER, CUT_USER, CUT_CTR, HOLDERS,
// VAULT, SLOT_CAB, OVF_CTR (+ z), BEC_SPOT, BRIDGE_ZONE, EVM_FRAME. seg2 only adds props around them.
// New positions are given as screen-ground points (canvas X right, Y down; kit G(X, Y)) so they are easy to frame.
import { G, Wp } from "../../../kit/iso.mjs";
export * from "../../seg1/src/layout.mjs";
import { CUTTER, OVF_CTR, BEC_SPOT, BRIDGE_ZONE } from "../../seg1/src/layout.mjs";

const rel = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });

// ---- 左区 · 溢出车间 (seg1: cabinet SLOT_CAB, odometer OVF_CTR on a z-60 steel block, BEC_SPOT proposal)
export const BEC = BEC_SPOT;                       // ep03 contractMachine "BEC" (grows at L3)
export const ATK = G(-1760, 300);                  // attacker (sender) in front of the BEC machine
export const GATE = G(-1180, 470);                 // balance-check gate (L9)
export const RCV = [G(-930, 330), G(-800, 430)];   // two receivers (L10) with dot pillars
export const DESKS = [G(-2350, -150), G(-2130, -90)]; // exchanges, far behind (L11)
export const DOORS = [0, 1, 2].map((i) => G(-1250 + i * 160, 260)); // unchecked / asm / cast (L13), in front of the odometer
export const TROUGH = G(-1530, 700);               // uint128 trough (L15)
export const LAMP = rel(OVF_CTR, 120, -4);         // 0.8 default-check lamp on top of the odometer

// ---- 中区 · 取整台: a wide mulDiv bed behind-left of the cutter (L20–L21)
export const CUTTER_W = G(Wp(CUTTER.u, CUTTER.v)[0] - 420, Wp(CUTTER.u, CUTTER.v)[1] - 330);

// ---- five category signs on the front road (L0–L1, L22), below the cutter zone
export const SIGNS = [0, 1, 2, 3, 4].map((i) => rel(G(-700, 1250), i * 400, 0));

// ---- 远景 · 跨链 (seg1 BRIDGE_ZONE)
export const BRIDGE = BRIDGE_ZONE;
export const R_ETH = rel(BRIDGE, -520, 200);
export const R_TRON = rel(BRIDGE, -600, -330);
export const R_BSC = rel(BRIDGE, 600, 200);
export const MINI = rel(BRIDGE, 0, 8);             // small cutter on the bridge crown
export const MINI_Z = 86;
