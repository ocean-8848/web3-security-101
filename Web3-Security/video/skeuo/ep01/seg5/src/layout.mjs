// layout.mjs — seg5 world coordinates (uv, world units ≈ px at camera 1).
// Aligned with seg1 SPEC.md / src/layout.mjs: vending machine = VEND (0,0); road v = 330; gallery and Bybit zone drawn as light outlines.
import { at, G } from "../../../kit/iso.mjs";
import { VEND } from "../../seg1/src/layout.mjs";
const P = (u, v) => ({ u, v });
const vm = { u: VEND.u, v: VEND.v };  // seg1 SPEC: plaza centre
export const LAYOUT = {
  vm,
  atk: P(-300, 330), toolbox: P(-480, 420),
  wb: P(-900, 420), board: P(-910, 200),
  cab: P(-480, 0), mag: P(-560, 260),
  mal: P(170, 330), coins: P(-200, 380),
  fl: P(560, 430),
  mp: P(1300, -100), redA: P(1080, 120), redB: P(1120, 190),
  br: P(1650, 760), oth: G(1250, 120), sdoc: G(1400, -30),
  dome: P(150, 800), atk2: P(-170, 820),
  chain: P(480, 1000), lockN: P(-560, 560),
  bal: P(-600, 650), anc: P(-560, 740),
  tlock: P(-330, 150), key: P(-200, -150),
  tok: P(450, -260), dex: P(680, -260), orc: P(910, -260), sig: P(560, 40),
  market: [0, 1, 2, 3].map((i) => P(1250 + i * 130, -560)),
  frame: { u0: -1150, u1: 1760, v0: -760, v1: 640 },
  q23: at(P(700, -120), 0, 0, 380),
  sixCenter: [-330, 120],
  extCenter: at(P(520, -120), 0, 0, 160),
  gfLabel: at(P(400, -760), 0, 0, 40),
  wideCenter: at(P(400, -80), 0, 0, 120),
};
