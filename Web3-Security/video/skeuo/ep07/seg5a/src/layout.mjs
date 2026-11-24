// layout.mjs — ep07 seg5a「⑤ 授权风险」world layout.
// The world (「收发站」) is fixed by seg1: ../../seg1/src/layout.mjs (import only, never edit).
// seg5a lives in the 远景 band (screen y ≈ −1000, same height as seg1's bridge), to the right of the bridge's
// far bank (BR_BNB / CHAIN_BNB / LEND_POOL), three zones left → right along the screen-level direction:
//   A 授权 · approve 竞态   B 无限授权 · 钓鱼   C 路由 · 任意调用 + 授权（Sushi）
// Positions below are world-canvas ground points [X, Y] (G(X, Y) → {u, v}).
import { G, at } from "../../../kit/iso.mjs";

let S1 = {};
try { S1 = await import("../../seg1/src/layout.mjs"); } catch { S1 = {}; }
export const FROM_SEG1 = !!S1.BRIDGE;
export const LY = S1;

const xy = (p) => (p == null ? null : Array.isArray(p) ? p : at(p));
/** canvas ground point at world offset (du, dv) from canvas point base */
export const rel = (base, du, dv) => at(G(base[0], base[1]), du, dv, 0);
/** canvas ground point at canvas offset (dx, dy) */
export const off = (p, dx, dy) => [p[0] + dx, p[1] + dy];

// seg1 far-bank scenery (static here, only for continuity when the camera passes)
export const BRIDGE = xy(S1.BRIDGE) ?? at({ u: 1400, v: -1500 });
export const BR_BNB = xy(S1.BR_BNB) ?? at({ u: 1900, v: -1440 });
export const CHAIN_BNB = xy(S1.CHAIN_BNB) ?? at({ u: 2000, v: -1820 });
export const BR_ETH = xy(S1.BR_ETH) ?? at({ u: 930, v: -1440 });
export const CHAIN_ETH = xy(S1.CHAIN_ETH) ?? at({ u: 780, v: -1820 });

// zone origins: right of the far bank, same screen height as the bridge deck
const Y0 = BRIDGE[1] + 40;
export const ZA = [BR_BNB[0] + 1150, Y0];
export const ZB = [ZA[0] + 1700, Y0];
export const ZC = [ZB[0] + 1900, Y0];

export const P = {
  // ---- A · approve race
  signA: off(ZA, -760, -200),
  walA: off(ZA, -680, 60),
  alice: off(ZA, -470, 170),
  bob: off(ZA, -170, 300),
  mp: off(ZA, 300, 20),
  blk: off(ZA, 760, -170),
  ctr: off(ZA, 700, 210),
  // ---- B · infinite approval + phishing
  walB: off(ZB, -560, 40),
  user: off(ZB, -360, 170),
  proto: off(ZB, 60, -60),
  atkB: off(ZB, 420, 200),
  phish: off(ZB, 380, -430),
  // ---- C · router (any call + approval), Sushi RouteProcessor2
  rt: off(ZC, 0, 0),
  wals: [off(ZC, -900, -300), off(ZC, -700, -380), off(ZC, -500, -460), off(ZC, -300, -540)],
  tok: off(ZC, 620, -270),
  atkC: off(ZC, 640, 120),
  fake: off(ZC, -620, 250),
  cb: off(ZC, -470, 250),
  cp: off(ZC, -250, 300),
  route: off(ZC, 300, 250),
  rule: off(ZC, 60, 470),
};
