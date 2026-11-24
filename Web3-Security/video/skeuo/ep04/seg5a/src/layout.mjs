// layout.mjs — seg5a world layout, aligned to the ep04 world fixed by seg1 (../../seg1/src/layout.mjs):
// Bank at world (0,0) with its ledger desk on the −u side and the call stack on its roof.
// seg5a points are world-canvas ground points [X, Y] (G(X, Y) → {u, v}); the Bank is canvas (0, 0).
// Zones: A Bank + six exits (centre) → B imBTC / Lendf.Me (right, below seg1's third-party zone)
//        → C BNB forks (down-right) → D Penpie (down-left) → back to A.
import { G, at } from "../../../kit/iso.mjs";
export { BANK, BANK_TOP, STACK, DESK, DESK_TOP, LEDGER, COUNTER, COUNTER_SCALE } from "../../seg1/src/layout.mjs";

const rel = (base, du, dv) => at(G(base[0], base[1]), du, dv, 0);   // canvas point at world offset from base

const cpB = [1560, 1490];
const P = {
  mag: [-200, 300],
  camA: [0, 60], camLock: [60, -170],

  tok: [1300, 200], atk1: [1360, 450], arm1: [1470, 490],
  lend: [1830, 260], lendS: 0.85, ldLedger: [1700, 460], ldCtr: [1640, 540],
  camB: [1600, 360],

  bnbSign: [1420, 970], orig: [1330, 1140], cpA: [1160, 1320],
  forks: [[1620, 1000], [1730, 960], [1840, 920], [1950, 880]],
  cpB, fork: rel(cpB, 470, -60), forkS: 0.85, foLedger: rel(cpB, 520, 260),
  evil: rel(cpB, -330, 60), evilArm: rel(cpB, -250, 120),
  camC: [1560, 1340], camC3: rel(cpB, 160, -40),

  pAtk: [-360, 1440], mkt: [-210, 1510], arm3: [-100, 1550],
  pen: [180, 1310], penS: 0.85,
  camD: [-50, 1410],
};
// evil token rides along the road (+u) through the gate: canvas offset
const a = at(G(0, 0), 0, 0, 0), b = at(G(0, 0), 470, 0, 0);
P.evilMove = [b[0] - a[0], b[1] - a[1]];

// six exits around the Bank (seg2 L15–L21): world direction (deg, u→v), length R, label anchor.
// Directions avoid the ledger desk on the −u side; lengths alternate so the labels do not collide.
const EXITS = [
  { name: "call 转 ETH", deg: 160, R: 330, a: "r" },
  { name: "代币 transfer", deg: 128, R: 430, a: "t" },
  { name: "ERC-777 钩子", deg: 98, R: 330, a: "t" },
  { name: "NFT 安全转账", deg: 68, R: 400, a: "l" },
  { name: "闪电贷回调", deg: 40, R: 300, a: "l" },
  { name: "用户提供的地址", deg: 12, R: 340, a: "l" },
];

export { P, EXITS };
