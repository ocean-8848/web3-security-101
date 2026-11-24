// layout.mjs — seg3 world coordinates. The production line, vitrine, chain, signing branch and
// attacker GPU bench are copied from seg2/src/layout.mjs (seg2 builds the line; seg3 opens on it).
import { G } from "../../../kit/iso.mjs";
export const S = { ent: { u: 0, v: 0 }, mn: { u: 460, v: 0 }, seed: { u: 920, v: 0 }, tree: { u: 1380, v: 0 }, key: { u: 1840, v: 0 }, addr: { u: 2340, v: 0 } };
export const BELTS = [[230, 160], [690, 300], [1150, 280], [1610, 280], [2010, 150]];
export const VIT = { w: 480, d: 340, h: 250 };
export const ADDR_IN = [{ du: -150, dv: -60 }, { du: 0, dv: 10 }, { du: 150, dv: 80 }];
export const CHAIN = { u: 2340, v: -480 };
export const SIGN = { seal: { u: 1830, v: 930 }, msg: { u: 1580, v: 890 }, cup: { u: 2100, v: 880 }, out: { u: 2150, v: 1250 } };
export const GPU = [G(2640, -760), G(2930, -660), G(3220, -560)];
export const THIEF = (() => { const g = G(2640, -760); return { u: g.u - 40, v: g.v + 260 }; })();
// seg3-only areas (far in front of the line so each camera frames one case)
export const C1 = { u: 0, v: 3200 }, C2 = { u: 2400, v: 3200 }, C3 = { u: 4800, v: 3200 }, CL = { u: 7200, v: 3200 };
