// layout.mjs — ep07/seg2「② 四个陷阱」world coordinates, aligned to seg1's「收发站」.
// Shared positions come from ../../seg1/src/layout.mjs (seg1 is authoritative). seg2 only adds props around them.
export * from "../../seg1/src/layout.mjs";
import { G } from "../../../kit/iso.mjs";
import { DOCK } from "../../seg1/src/layout.mjs";
const rel = (o, du, dv) => ({ u: o.u + du, v: o.v + dv });

// ---- dock (traps 1–4)
export const CK1 = { u: -320, v: 250 };              // small checkpoint "ok?" in front of the return port (trap ①)
export const CK2 = { u: -430, v: -210 };             // small checkpoint across the lot branch, before it leaves (trap ②)
export const LOT_TAG = rel(DOCK.lot, 150, -150);     // returnTag at the lot, behind the pipe end (trap ②)
export const LOT_CR = rel(DOCK.lot, -180, 60);       // courier at the lot (left edge)
export const LOT_MAG = rel(DOCK.lot, 0, 40);         // magnifier hovering over the lot
export const GAUGE_V = { u: -260, v: 380 };          // our contract's gas gauge (trap ③, L16), scaled 0.7
export const TOLL = { u: -520, v: 220 };             // tollClip on the bomb branch (trap ③ fix)
export const TOLL_Z = 87;
export const TAPE_LEN = 210;
export const FSTACK = { u: -300, v: 1100 };          // frameStack outer / inner call (trap ④)
export const ATK4 = { u: -1000, v: 760 };            // attacker who sets the gas (trap ④)
export const ATKV = G(170, 330);                       // attacker contract (L16): lies, calls back, burns gas
export const STUB_Z = [270, 225, 180];               // three short call / delegatecall / staticcall stubs on the −u face (L0)

// ---- Qubit (L17–L32), around seg1's bridge zone. Given as screen-ground points G(X, Y) so they are easy to frame.
export const ADDR_DOC = G(-540, -880);               // token address table (ETH → zero address)
export const FPANEL = G(-330, -760);                 // depositETH / deposit buttons, in front of the ETH-side bridge machine
export const WL = G(-560, -620);                     // whitelist checkpoint (scale 0.6)
export const ATKQ = G(-380, -500);                   // attacker at the bridge
export const DESK2 = G(330, -820);                   // the bridge's ledger desk
export const SEAL = G(470, -960);                    // stamp hand (old safe-transfer library), right of the return tag
export const MUTE = G(620, -880);                    // USDT that returns nothing
export const MAG2 = G(110, -860);                    // magnifier over the zero-address lot (L32)
export const ATKF = G(1000, -1180);                  // attacker on the far bank (L27)
