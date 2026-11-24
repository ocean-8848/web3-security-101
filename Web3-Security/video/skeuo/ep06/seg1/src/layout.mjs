// ep06「整数工坊」world layout — fixed by seg1「① 一次只错一点点」, shared by later segments:
//   import { CUTTER, VAULT, SORTER, POOL, ... } from "../../seg1/src/layout.mjs";
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// The rounding cutter (全片主角) sits at the world origin. Screen-ground positions noted as G(X, Y) (kit/iso.mjs G).
// Left → right on screen: 溢出车间 (G≈−1500) · 取整台 (G 0) · 金库 (G 1500) · 池子 (G≈2600–3100) · 跨链远景 (G≈4300, −650).

// ---- 中区 · 取整台 (main stage, seg1 / seg3 / seg4 come back here)
export const CUTTER = { u: 0, v: 0 };                 // ep06 roundCutter, scale 1.25 (≈ 400 × 225, blade-up handle ≈ 330 high); feed from −u
export const CUT_USER = { u: -330, v: 40 };           // kit person (signer) at the feed end (−u) of the cutter
export const CUT_CTR = { u: 330, v: -170 };           // ep02 rollCounter (4 digits) on a steel pedestal (z 70), behind-right of the cutter
export const CUT_CTR_Z = 70;
export const HOLDERS = [{ u: 400, v: 90 }, { u: 400, v: 230 }, { u: 400, v: 370 }]; // kit person ×3 「其他持有人」, each with a standing shareCert
// seg1 swaps two cutter instances on the same origin: "rcA" (stock 6, chip 1, L2–L5) → "rc" (stock 1, chip 0.5 = 1.5 单位, L6 →, segment end state)

// ---- 中右区 · 金库 (seg3–seg5a)
export const VAULT = { u: 1300, v: 760 };             // kit safe, plate "ERC-4626" ≈ G(1500, −60); dispenser = besideSafe(VAULT)

// ---- 右区 · 池子 (seg1 open / seg3 / seg5a)
export const SORTER = { u: 2040, v: 1620 };           // ep01 sorter (letters 0): belt along +u (u −230..170), block crate at du 232 ≈ G(2600, 80)
export const POOL = { u: 2600, v: 1620 };             // ep03 contractMachine name "POOL" (Balancer V2 稳定池; full name only as wlab) ≈ G(3060, −80)
export const MINI_CUTTER = { u: 2250, v: 1930 };      // ep06 roundCutter scale 0.85, in front of the crate (seg1 L5 / seg3 L17 small cutter)
export const SORTER_ATK = { u: 1730, v: 1700 };       // kit person attacker at the belt input
export const BELT_Z = 78;                             // sorter belt top

// ---- 左区 · 溢出车间 (seg2 first half). seg1 only shows the cabinet + a free-standing odometer.
export const SLOT_CAB = { u: -1000, v: -840 };        // ep03 slotCabinet (n 4) ≈ G(−1300, −60)
export const OVF_CTR = { u: -1440, v: -560 };         // ep02 rollCounter (10 digits) on a pedestal (z 60) ≈ G(−1500, 140)
export const OVF_CTR_Z = 60;
export const BEC_SPOT = { u: -1500, v: -1000 };       // proposal: BEC contractMachine (seg2 L3 grows it here)

// ---- 远景 · 跨链 (seg2 L23–L28, seg5b L6) — proposal, not shown in seg1
export const BRIDGE_ZONE = { u: 4270, v: 1400 };      // ≈ G(4300, −650)

// ---- seg1 EVM frame (L10): ground rectangle around the whole workshop, world (u0, u1, v0, v1)
export const EVM_FRAME = [-1900, 3050, -1350, 2350];
