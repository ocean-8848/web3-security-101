// ep01 world layout — fixed by seg1, shared by seg2–seg6 (import "../../seg1/src/layout.mjs").
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// Screen compass used by BRIEF: +u = 东北 (right-up), −u = 西南 (left-down), −v = 西北 (left-up), +v = 东南 (right-down).

// ---------------------------------------------------------------- plaza (one continuous square)
export const PLAZA = { u0: -2300, u1: 2300, v0: -2200, v1: 1900 };   // overall extent of things in this episode

// centre: the vending machine (= smart contract), front (+v) faces the road. 200(u)×150(v)×300(z)
export const VEND = { u: 0, v: 0 };

// SW → NE: the transaction road, runs along +u in front of the vending machine
export const ROAD = { u0: -2200, u1: 2200, v: 330, half: 110 };      // centre line v = 330, edges v 220 / 440

// SE: loss gallery plinth (seg4), runs along +u
export const GALLERY = { u0: -1000, u1: 1500, v0: 1380, v1: 1620 };

// NW: Bybit zone (seg1, seg6). BY is the zone origin; objects are placed relative to it.
export const BY = { u: -400, v: -1700 };
export const SAFE = { u: BY.u + 300, v: BY.v - 80 };                  // kit safe 290×240×334, plate COLD
export const BROWSER = { u: BY.u - 260, v: BY.v - 40 };               // kit browserWin, page faces +v
export const DOC = { u: BY.u - 150, v: BY.v + 250 };                  // flat doc (the signed transaction)
export const SEAL = { u: DOC.u + 36, v: DOC.v + 42 };                 // kit seal (paper:false), mark lands on DOC
export const SIGNERS = [                                              // three signers (count is only visual)
  { u: BY.u - 650, v: BY.v + 120 },
  { u: BY.u - 560, v: BY.v + 330 },
  { u: BY.u - 400, v: BY.v + 470 },
];

// seg1 L9: where the red attacker silhouette flashes at the plaza edge
export const ATK_EDGE = { u: 1700, v: 1600 };
