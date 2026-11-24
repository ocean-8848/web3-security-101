// ep04/seg2 world layout. The Bank-street numbers are copied from ../../seg1/src/layout.mjs (seg1 owns them);
// everything marked "seg2" is new in this segment and sits where seg1 has nothing.
// World (u, v) ground coords; Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).

// ---- from seg1 (do not move)
export const BANK = { u: 0, v: 0 };
export const BANK_TOP = 312;
export const STACK = { u: 0, v: 0, z: BANK_TOP, scale: 0.8, n: 3 };
export const DESK = { u: -330, v: -40 };             // pedestal u ±80, v ±100, top z = 100
export const DESK_TOP = 100;
export const LEDGER = { u: -330, v: -78 };
export const COUNTER = { u: -330, v: 52 };
export const ATK = { u: -380, v: 380 };              // attacker contract (miniVend attacker)
export const ARM = { u: -250, v: 400 };              // callbackArm, target Bank btn-0

// ---- seg2
// Bank → attacker contract pipe (the external call): out of the Bank front, along +v, then −u into the attacker's back
export const PIPE_ATK = { o: { u: -60, v: 75 }, pts: [[0, 0, 34], [0, 230, 34], [-300, 230, 34]] };
// premise plates (ep01 signBoard plate) on the far left: given as world-canvas ground points (screen-side by side)
export const PLATE_XY = [[-830, 330], [-590, 360]];
// metaphor: teller counter far left
export const TELLER = { u: -1500, v: -120 };
// six exits: a manifold out of the Bank front (+v) to v = 640, then along +u; branches along +v to the receivers
export const MAN = { u0: 60, v0: 75, v: 640, u1: 2760, z: 30 };
export const EX_U = [360, 820, 1280, 1740, 2200, 2660];
export const EX_V1 = 820;                            // branch end (outlet flange)
export const RCV_V = 960;                            // receiver origin v
// chains (L22–L25): three columns further right
export const CH_U = [3500, 3980, 4460];
export const CH_V = 420;                             // kit chain (n = 2)
export const CH_M = 760;                             // contract machine in front of each chain
export const CH_SIGN = 1000;                         // wooden sign (in front of the machine)
