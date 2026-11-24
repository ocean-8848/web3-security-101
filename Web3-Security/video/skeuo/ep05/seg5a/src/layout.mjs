// layout.mjs — ep05 seg5a「⑤ 慢升级快暂停」world layout, aligned to the「权限街区」world fixed by seg1
// (../../seg1/src/layout.mjs — imported, never edited): main contract at world origin, main panel at (0, 300),
// role board at seg1's KEYS_ZONE (same spot seg5b uses), Parity corner drawn as seg1 left it.
// Points below are world-canvas ground points [X, Y] (G(X, Y) → {u, v}); the main contract machine is canvas (0, 0).
// Zones: K key office (role board at KEYS_ZONE behind the machine; knob / kill switch / vault on the panel's +u side)
//        T time-lock street on the machine's −u side, between the main avenue and the Parity corner
//        B three bridges in the back row (Ronin → Token Hub → Mantle L2), starting near seg1's BRIDGE_ZONE.
import { G, at } from "../../../kit/iso.mjs";
import { MAIN, MAIN_PANEL, KEYS_ZONE, LIB, LIB_PANEL, WALLETS, ICE_BOX } from "../../seg1/src/layout.mjs";

/** canvas ground point at world offset (du, dv) from canvas point base */
export const rel = (base, du, dv) => at(G(base[0], base[1]), du, dv, 0);
const C = (o) => at(o);                    // world {u,v} → canvas ground point

const CM = C(MAIN);                       // [0, 0]
const PANEL = C(MAIN_PANEL);
const BOARD = C(KEYS_ZONE);               // ≈ [250, −640]
const BELT = rel(CM, -560, -230);         // conveyor centre (inside the glass case); its +u end points at the machine
const KNOB = rel(PANEL, 370, -10);
const SW = rel(KNOB, 330, 0);
const VAULT = rel(SW, 330, 30);
const B1 = [850, -1080], B2 = [2250, -1350], B3 = [3650, -1650];

export const P = {
  cm: CM, panel: PANEL,
  board: BOARD,                           // roleBoard (4 roles) — swaps to the Ronin key board in place (L16)
  knob: KNOB,                             // PARAM_ADMIN knob pedestal at the panel's +u end
  sw: SW,                                 // kill switch (PAUSER)
  bot: rel(SW, 60, 230),                  // monitoring bot (rpc)
  vault: VAULT,                           // protocol vault
  user: rel(VAULT, 200, 250),             // user who exits with gold (L12)
  ownerCard: rel(BOARD, -110, 190),       // big owner card hovering in front of the board (L1)

  belt: BELT,
  lock: rel(BELT, 395, 0),                // time lock at the conveyor's +u end (between belt and machine)
  msig: rel(BELT, -820, 330),             // proposer multisig (kit safe)
  meter: rel(BELT, -330, 560),            // threshold meter 3 / 5
  signers: [[-860, 560], [-720, 640], [-580, 700], [-430, 740], [-300, 780]].map((q) => rel(BELT, q[0], q[1])),
  guard: rel(BELT, 60, 290),              // guardian (engineer) in front of the glass
  watch: rel(BELT, 120, -250),            // community member
  mag: rel(BELT, -90, -250),              // magnifier

  // Parity corner, as seg1 left it (static scenery)
  lib: C(LIB), libPanel: C(LIB_PANEL), wallets: WALLETS.map(C), iceBox: ICE_BOX,

  b1: B1, b2: B2, b3: B3,
  atk: rel(BOARD, 380, 260),              // attacker who grabs the Ronin keys (right of the board)
  cp2: rel(B2, -520, 0),                  // Token Hub relayer checkpoint on the road before bridge 2
  atk2: rel(B2, -560, 180),
  hubList: rel(B2, -330, 300),
  cm3: rel(B3, -520, -110),               // Mantle bridge contract
  fp3: rel(B3, -520, 140),                // its one-button panel (upgrade)
  safe3: rel(B3, -860, 560),              // security council multisig
  lock3: rel(B3, -560, 420),              // the missing time lock (dashed)
  meter3: rel(B3, -1120, 600),
  sign3: rel(B3, 120, -190),              // "信任假设" sign above the bridge
  user3: rel(B3, -250, 330),
};
