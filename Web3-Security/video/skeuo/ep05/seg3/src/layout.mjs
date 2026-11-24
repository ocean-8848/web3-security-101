// layout.mjs — seg3 world coordinates (u, v), aligned with the episode world fixed by seg1 (../../seg1/src/layout.mjs):
// main contract machine at the origin with its button panel in front, Parity corner at LIB / WALLETS.
// seg3-only props are placed relative to MAIN and kept clear of seg1's reserved zones (TRON / KEYS / BRIDGE / USER).
import { MAIN, MAIN_PANEL, LIB, LIB_PANEL, WALLETS, PIPE_Z, PIPE_IN_Z } from "../../seg1/src/layout.mjs";

const o = (u, v) => ({ u, v });
const M = (du, dv) => o(MAIN.u + du, MAIN.v + dv);
export const LY = {
  LIB, LIB_PANEL, WALLETS, PIPE_Z, PIPE_IN_Z,
  LESSON: o(-800, -300),
  ATK_P: o(-1720, -660),
  // main avenue
  MC: MAIN, FP: MAIN_PANEL,
  CAB: M(-290, -260),
  EX: M(420, 300), DIAL: M(400, 570), POST: M(610, 550),
  TOK: M(640, -40), MAG: M(640, 110),
  VIC: M(-700, 500), VKEY: M(-770, 600), AUTH0: M(-620, 490), AUTH1: M(-160, 60),
  ATK: M(560, 780),
  // ownership (front-left of the panel)
  OWN: M(-460, 360), KC: M(-390, 390), MBX: M(-1010, 550), TRAY: M(-590, 480),
  // signature (front-right of the panel)
  REC: M(430, 580), SIG: M(650, 620), KADM: M(210, 440),
  // three roadside signboards, in front of the avenue (clear of TRON_ZONE)
  SB: [M(-200, 1500), M(700, 2130), M(1600, 2760)],
};
const S = LY.SB;
Object.assign(LY, {
  SCM: o(S[0].u + 300, S[0].v + 380),
  OWN2: o(S[1].u + 150, S[1].v + 400), SHR: o(S[1].u + 330, S[1].v + 390), UP: o(S[1].u + 520, S[1].v + 370),
  WM: o(S[2].u + 300, S[2].v + 380), CTOR: o(S[2].u + 320, S[2].v + 680),
});
