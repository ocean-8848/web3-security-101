// ep07「收发站」world layout — fixed by seg1「① 没收到的钱」, shared by later segments:
//   import { VEND, DESK, DOCK, PIPES, BRIDGE, ... } from "../../seg1/src/layout.mjs";
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// 我们的合约 (ep01 vending, 全片主角) sits at the world origin.
// Screen-ground (world-canvas px) positions noted as ≈ (x, y) = Wp(u, v, 0).
// Left → right on screen: 左区·调用码头 (x −900..−200) · 我们的合约 (0, 0) · 发货登记台 (≈ 360, −30)
//   · 中区·代币陈列架 / 右区·拍卖场 (proposals, +u/+v of the desk) · 远景·跨链桥 high above (y ≈ −1000).

// ---- 中心 · 我们的合约 + 发货登记台
export const VEND = { u: 0, v: 0 };                     // ep01 vending (200u × 150v × 300z), sign "OUR CONTRACT"; wlab "我们的合约"
export const DESK = { u: 330, v: 170 };                 // ep07 dispatchDesk (≈192 × 92 × 112) on the +u side ≈ (368, −25)
export const TAG_DOCK = { u: -175, v: 120 };            // returnTag (scale 1.6) — the "回程口" of the dock pipes, front-left of the vending ≈ (−74, 99)
export const PORT_Z = 110;                              // dock pipes leave the vending's −u face at this height
export const COURIER = { u: 120, v: 330 };              // proposal: kit person (engineer) = 快递员 for the metaphor shots (seg2)

// ---- 左区 · 调用码头: one trunk leaves the vending's −u face (v 0), meets a header that runs along v at u −300,
// and four branches tee off along −u to the four targets (pipes share the trunk/header, so they read as one manifold).
// order top-left → bottom-right on screen: token · 荒地 · 返回数据炸弹 · gas 不足
export const DOCK = {
  token: { u: -700, v: -600 },                          // ep01 miniVend kind "token" ≈ (−918, −45)
  lot: { u: -760, v: -210 },                            // ep07 emptyLot (260 × 200) = 无代码地址 ≈ (−743, 132)
  bomb: { u: -800, v: 220 },                            // ep03 contractMachine name "C" (返回数据炸弹, seg2 L9) ≈ (−529, 320)
  gas: { u: -700, v: 720 },                             // ep01 miniVend kind "plain" (gas 不足) ≈ (−160, 496)
};
export const GAUGE = { u: -560, v: 840 };               // ep03 gasGauge in front of the gas branch, beside the gas miniVend
export const HEADER_U = -300;                           // header pipe runs along v at this u
const branch = (v, uEnd, zEnd) => [[-100, 0, PORT_Z], [HEADER_U, 0, PORT_Z], [HEADER_U, v, PORT_Z], [uEnd, v, zEnd]];
// pipe polylines, relative to VEND, [du, dv, z]
export const PIPES = {
  token: branch(-600, -645, 70),
  lot: [...branch(-210, -600, 60), [-640, -210, 14]],
  bomb: branch(220, -690, 70),
  gas: branch(720, -645, 70),
};
// seg1 L13 "fates" next to each branch (in front of it)
export const FATE = { liar: { u: -500, v: -500 }, fail: { u: -520, v: 300 }, stall: { u: -370, v: 880 } };

// ---- 中区 · 代币陈列架 (seg3) — proposal, not built in seg1
export const SHELF_ZONE = { u: 900, v: 700 };           // ≈ (1139, 29): eight oddCoins in a row along u, scale + tollClip below

// ---- 右区 · 拍卖场与分发线 (seg4) — proposal, not built in seg1
export const AUCTION_ZONE = { u: 1700, v: 1500 };       // ≈ (2253, 127)

// ---- 远景 · 跨链桥 (seg1 L0–L4, seg2 L17–L29, seg5b L7–L8) — built in seg1
// Machines stand in FRONT (+v) of the bridge ends, chains behind (−v); the near bank (−u) is 以太坊, far bank (+u) is BNB Chain.
export const BRIDGE = { u: 1700, v: -2000 };            // ep01 bridge (Lh 260, river half-width 170) ≈ (244, −1308)
export const BR_ETH = { u: 1260, v: -1800 };            // ep03 contractMachine name "ETH" = 桥 · 以太坊侧 ≈ (−1, −1100)
export const ETH_VAULT = { u: 880, v: -1830 };          // kit hotWallet (gold:false, plate "ETH") = 桥的 ETH 金库, opens empty in L1
export const CHAIN_ETH = { u: 1150, v: -2250 };         // kit chain n 3, wlab "以太坊"
export const BR_BNB = { u: 2150, v: -1800 };            // ep03 contractMachine name "BNB" = 桥 · BNB Chain 侧 (mints qXETH)
export const CHAIN_BNB = { u: 2250, v: -2250 };         // kit chain n 3, wlab "BNB Chain"
export const QX_PILE = { u: 2150, v: -1610 };           // qXETH tokens pile up here, in front of BR_BNB's out slot
export const LEND_POOL = { u: 2520, v: -1560 };         // proposal: ep03 contractMachine "借贷池" (seg2 L27), not built in seg1
export const ZERO_LOT = { u: 1140, v: -1510 };          // ep07 emptyLot scale 0.8 (zero:true in seg2 L18); seg1 L4 pipe from BR_ETH ends here
export const BR_PIPE = [[-70, 100, 50], [-70, 225, 50], [-70, 250, 12]]; // relative to BR_ETH: out of the front (+v) face → down onto the lot
export const TAG_BR = { u: 1420, v: -1560 };            // returnTag (scale 1.8) — return port of the bridge's call, L4

// ---- seg1 EVM frame (L9): ground rectangle around vending + lot pipe + lot, world (u0, u1, v0, v1)
export const EVM_FRAME = [-900, 150, -360, 230];
