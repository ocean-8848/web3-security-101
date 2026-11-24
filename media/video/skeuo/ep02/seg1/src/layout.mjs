// ep02 world layout — fixed by seg1, shared by seg2–seg6 (import "../../seg1/src/layout.mjs" or copy the numbers).
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// +u runs screen lower-left → upper-right; +v runs toward the viewer (screen lower-right).

// ---------------- seg1 case corner: Wintermute vault + Profanity + dials (front zone, v ≈ 0)
export const VAULT = { u: 0, v: 0 };            // kit safe 290×240×334, door on +v face
export const MAILBOX = { u: 0, v: -20, z: 334 };// addrPlate standing on the safe roof (lifted by z)
export const DIAL256 = { u: 540, v: 0 };        // comboDial rings 8 (body u ±170, v −44..0, hub z ≈ 210)
export const PROF = { u: 1080, v: 0 };           // Profanity machine housing u ±150, v −80..90, z 0..316
export const DIAL32 = { u: 1080, v: 0 };         // comboDial rings 1, inside the Profanity housing (hub z ≈ 128)
// drive shaft: small dial −u side → big dial +u side (world u,v,z)
export const SHAFT_A = [DIAL32.u - 92, -20, 128];
export const SHAFT_B = [DIAL256.u + 170, -22, 210];

// ---------------- attacker workbench (outside the production line; seg1 L6, seg3 again)
export const RIG = { u: -300, v: 1100 };         // gpuRig (u ±128, v ±66, z ≤ 330), cable "cut" → offline; cable runs toward −u
export const ATTACKER = { u: -110, v: 1290 };     // person role attacker
export const COUNTER = { u: 330, v: 1250 };      // rollCounter 10 digits (on the ground)
export const CLOCK = { u: 560, v: 1050 };        // kit clock

// ---------------- private-key production line (seg1 L9 shows it as a dashed outline; seg2 builds it)
// conveyor along +u at v = LINE.v; six stations ① entropy ② mnemonic ③ seed ④ derive ⑤ private key ⑥ address
export const LINE = { v: -1500, u0: -880, u1: 1720, half: 70 };
export const STATIONS = [
  { n: "①", name: "熵源", u: -700 },
  { n: "②", name: "助记词", u: -260 },
  { n: "③", name: "种子", u: 180 },
  { n: "④", name: "派生", u: 620 },
  { n: "⑤", name: "私钥", u: 1060 },
  { n: "⑥", name: "地址", u: 1500 },
];
export const PAD = 110;                          // station pad half size (ground square)
export const SIGN_DESK = { u: 1060, v: -1050 };  // branch from ⑤ toward +v → signing desk (seal + doc + nonce dice cup)
export const CHAIN = { u: 2150, v: -1500 };      // kit chain at the end of the line (on-chain, public)
