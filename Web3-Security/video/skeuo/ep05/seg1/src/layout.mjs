// ep05「权限街区」world layout — fixed by seg1「① 没人初始化」, shared by later segments:
//   import { MAIN, MAIN_PANEL, LIB, ... } from "../../seg1/src/layout.mjs";
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; front (+v) faces look at the viewer.
// The main contract machine sits at the world origin. Screen-ground offsets are noted as G(X, Y) (kit/iso.mjs G).

// ---- centre · 按钮台大道 (main avenue): the protagonist contract + its function panel
export const MAIN = { u: 0, v: 0 };                     // ep03 contractMachine, name "Contract", 220(u) × 200(v) × ~260(z incl. gears)
export const MAIN_PANEL = { u: 0, v: 300 };             // ep05 funcPanel, 5 buttons (568 × 170, back z 150): btn 0..4 = mint, initialize, kill, upgrade, pause
export const MAIN_BUTTONS = ["mint", "initialize", "kill", "upgrade", "pause"];

// ---- centre-left · Parity 角落  (≈ G(−1500, −40) from MAIN)
export const LIB = { u: -1180, v: -930 };               // ep03 contractMachine name "Library"
export const LIB_PANEL = { u: -1180, v: -630 };         // ep05 funcPanel, 2 buttons: btn 0 = initialize (guard none), btn 1 = kill (guard card); 256 × 170
export const LIB_BUTTONS = ["initialize", "kill"];
// dependent multisig wallets (kit hotWallet, 190 × 160 × 224), in a row along −u from the Library, fronts face +v
export const WALLETS = [{ u: -1520, v: -930 }, { u: -1790, v: -930 }, { u: -2060, v: -930 }];
// delegatecall pipes (ep01 pipe, r 9): riser from each wallet top (z 232 → 300), one manifold at z 300 along v = LIB.v,
// dropping at u = LIB.u − 150 to z 170 and entering the Library's −u face at u = LIB.u − 112.
export const PIPE_Z = 300, PIPE_IN_Z = 170;
// the user (kit person signer, scale 1.2) stands at the −u end of the Library panel, next to `initialize`
export const LIB_USER = { u: -1450, v: -585 };
// seg1 L8 props next to the user: intact padlock + key (kit padlock / key)
export const LIB_LOCK = { u: -1600, v: -470 };
export const LIB_KEY = { u: -1470, v: -400 };
// iceShell box for a hotWallet (relative to its origin)
export const ICE_BOX = [-110, 110, -95, 95, 0, 236];

// ---- proposals for later segments (not shown in seg1; keep clear of the zones above)
export const USER_ZONE = { u: -2510, v: -1120 };        // ≈ G(−2700, 260): admin / signer + laptop (seg2 L16–L19)
export const TRON_ZONE = { u: 1300, v: 1200 };          // ≈ G(1750, 120): accountSafe + thresholdMeter (seg4)
export const KEYS_ZONE = { u: 940, v: -905 };           // ≈ G(250, −640): roleBoard, conveyor + timeLock (seg5a)
export const BRIDGE_ZONE = { u: 2260, v: -615 };        // ≈ G(1500, −900): ep01 bridges (Ronin / Token Hub / Mantle)
