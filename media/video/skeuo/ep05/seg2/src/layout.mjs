// ep05/seg2 world layout. Shared zones come from ../../seg1/src/layout.mjs (seg1 owns them, do not move);
// everything below "seg2" is new in this segment and sits where seg1 draws nothing.
// World (u, v) ground coords; Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
export { MAIN, MAIN_PANEL, MAIN_BUTTONS, LIB, LIB_PANEL, LIB_BUTTONS, WALLETS, PIPE_Z, PIPE_IN_Z } from "../../seg1/src/layout.mjs";

// ---- seg2
// metaphor office block (L2–L5), up-right of the avenue; fades out at L6
export const OFFICE = { u: 540, v: -1380 };
// the five visitors queue in front of the panel (L7–L9), along +u at v = 760; later they act in L12, L16–L20, L23
export const QV = 760;
export const Q = {
  any: { u: -760, v: QV },          // 任意外部地址 (kit person signer)
  evil: { u: -430, v: QV },         // 恶意合约 (ep01 miniVend attacker)
  admin: { u: -150, v: QV },        // 被钓鱼的特权用户 (person signer) + laptop
  laptop: { u: 40, v: QV + 30 },
  thief: { u: 330, v: QV },         // 拿到私钥的攻击者 (person attacker) + key
  insider: { u: 620, v: QV },       // 内部人员 (person engineer) + keycard
};
// L12–L13: token machine and a minter contract on the panel's −u side
export const TOKEN = { u: -560, v: 60 };
export const AT_MINT = { u: -580, v: 330 };     // where the "any address" visitor stands to press mint
export const MINTER = { u: -330, v: -190 };      // ep01 miniVend plain (holds the MINTER card)
// L22–L25: implementation contract behind the proxy, joined by a pipe
export const IMPL = { u: -150, v: -720 };       // behind-left of the proxy (screen up-left), clear of the code card
export const IMPL_PANEL = { u: -580, v: -560 }; // its own one-button panel, to its −u side
export const AT_INIT = { u: -400, v: 470 };     // where the attacker stands to press initialize
export const AT_INIT0 = { u: -560, v: 300 };    // where the first caller stands
