// ep04 world layout — fixed by seg1「① 顺序写反了」, shared by later segments (import or copy the numbers).
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs to the upper-right on screen, +v to the lower-right; the front (+v) faces of machines face the viewer.
// "Bank Street": attacker zone (front-left) → Bank (centre) → third-party protocols (right / back).

// ---- centre zone · Bank contract (ep01 vending, sign "BANK"), 200(u) × 150(v) × 312(z incl. cap)
export const BANK = { u: 0, v: 0 };
export const BANK_TOP = 312;                         // cap top z; the call stack sits on it
export const BANK_BTN = 0;                           // btn-0 = withdraw (btn-1 transfer, btn-2 deposit … later segs)
export const TRAY = [-24, 82, 20];                   // world (u,v,z) just outside the dispenser tray (relative to BANK)

// call stack (ep03 frameStack, n = 3, labels #1 #2 #3) sitting on the Bank's roof, scaled 0.8 about its ground origin
export const STACK = { u: 0, v: 0, z: BANK_TOP, scale: 0.8, n: 3 };

// ledger desk on the Bank's −u side: wooden-top pedestal + kit ledgerBook (scale 0.55) + ep02 rollCounter (1 digit, "your balance")
export const DESK = { u: -330, v: -40 };             // pedestal u ±80, v ±100, top z = 100
export const DESK_TOP = 100;
export const LEDGER = { u: -330, v: -78 };           // ledgerBook on the desk (back half)
export const COUNTER = { u: -330, v: 52 };           // rollCounter on the desk (front half), faces +v, drawn ×1.6 about its base
export const COUNTER_SCALE = 1.6;

// ---- left/front zone · attacker
export const ATK = { u: -380, v: 380 };              // attacker person (seg1 L6) and, from L8, attacker contract (ep01 miniVend attacker)
export const ARM = { u: -250, v: 400 };              // ep04 callbackArm next to the attacker contract; target = Bank btn-0
export const PILE = { u: -150, v: 470 };             // where dispensed coins land (in front of the attacker contract)

// ---- right zone · third-party protocols (seg1 shows them only as background in the opening wide shot)
export const LEND_SAFE = { u: 1900, v: -250 };        // lending protocol vault (kit safe)
export const ORACLE = { u: 2150, v: 80 };            // ep01 miniVend oracle (price dial)
export const DEX = { u: 1870, v: 330 };               // ep01 miniVend dex (AMM pool)
// pipes (ep01 pipe, z 70): DEX portR → ORACLE portL-ish, ORACLE → LEND_SAFE side

// event card / screen props are screen-layer, not world.
