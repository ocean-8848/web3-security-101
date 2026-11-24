// ep03 world layout — fixed by seg1, shared by later segments (import or copy the numbers).
// World (u, v) ground coords; projection = kit/iso.mjs Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866).
// Road runs along +u (screen: from lower-left to upper-right), centre line v = 0, half width 110.
export const ROAD = { u0: -560, u1: 1850, half: 110 };

// left zone · user side
export const ADMIN = { u: -900, v: -10 };          // person (signer), scale 1.2
export const LAPTOP = { u: -700, v: 40 };          // laptop, screen faces +v
export const LOCK = { u: -1120, v: 40 };           // padlock + key (L9: "私钥还在")

// middle zone · call-chain avenue: contract machines sit behind the road (−v), front (+v, slot) facing the road
export const MACH_V = -270;                        // machine origin v; front face at v = −170, slot at (u, −170, 85)
export const MACHINES = [
  { id: "mAtk", u: 0, name: "攻击", state: "attacker" },  // seg1: attacker contract
  { id: "mA", u: 560, name: "A", tone: "gray" },          // seg1 L8: inserted relay contracts (gray)
  { id: "mB", u: 1120, name: "B", tone: "gray" },
];
export const SLOT = (u) => [u, MACH_V + 100, 85];          // world (u,v,z) of a machine's mail slot
export const OUT = (u) => [u + 50, MACH_V + 134, 14];      // world (u,v,z) in front of its output chute

// vault = checkpoint (permission check) + safe
export const GATE = { u: 1640, v: -62 };           // checkpoint origin (road:false); barrier plane at u ≈ 1622
export const STOP = 1480;                          // envelope waits here while the barrier is down
export const VAULT = { u: 2000, v: 0 };            // safe 290×240×334, blocks the road end
export const PARK = [1770, 30, 6];                 // envelope parked between gate and safe after passing

// L11 props
export const CABINET = { u: 2420, v: -200 };       // slotCabinet (Storage) grows behind/right of the vault
export const SIGN = { u: 760, v: 300 };            // blank signboard on the road's front side

// L10 EVM frame (ground rectangle, world u/v)
export const EVM = { u0: -280, u1: 2700, v0: -520, v1: 430 };
