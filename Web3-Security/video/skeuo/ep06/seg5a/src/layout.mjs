// layout.mjs — ep06 seg5a「⑤ 守住余数」world layout (canvas ground points [X, Y]; G(X, Y) → {u, v}).
// The 4626 vault (中右区·金库) is the anchor. If seg1 has published its layout (../../seg1/src/layout.mjs) and it
// exports VAULT / POOL (canvas [X,Y] or world {u,v}), those win; otherwise the kit-ext README's vault point
// G(3280, 560) is used (same point the ep06 kit-ext demo uses). See SPEC.md.
import { G, at } from "../../../kit/iso.mjs";

let S1 = {};
try { S1 = await import("../../seg1/src/layout.mjs"); } catch { S1 = {}; }
const asXY = (p) => (p == null ? null : Array.isArray(p) ? p : typeof p.u === "number" ? at(p) : null);

/** canvas ground point at world offset (du, dv) from canvas point base */
export const rel = (base, du, dv) => at(G(base[0], base[1]), du, dv, 0);

export const VAULT = asXY(S1.VAULT) ?? [3280, 560];
// right zone (Uranium pool) — up-right of the vault, between it and seg1's Balancer pool
export const POOL = asXY(S1.POOL) ?? [3060, -80];
export const SORTER = asXY(S1.SORTER) ?? [2600, 80];
export const CUTTER = asXY(S1.CUTTER) ?? [0, 0];
// Uranium pool: one more machine to the right of seg1's Balancer pool, before the far bridge zone
export const URA = asXY(S1.URANIUM) ?? rel(POOL, 750, 0);
export const FROM_SEG1 = !!S1.VAULT;

const V = VAULT;
export const P = {
  vault: V,
  // ① virtual shares: a ghost stack standing on the −u side of the dispenser
  ghost: rel(V, -330, 250),
  // ② burn box + deployer, ④ checkpoint in front of the dispenser outlet
  burn: rel(V, -660, -60),
  eng: rel(V, -700, 170),
  cp: rel(V, -190, 470),
  vic: rel(V, 230, 560),
  // Uniswap V2 vitrine (locked LP)
  vit: rel(V, -900, -400),
  atk: rel(V, 300, 330),
  don: [rel(V, 420, -40), rel(V, 520, 40), rel(V, 620, 120)],     // donation stacks ×10 ×100 ×1000
  // comparison: the unpatched vault to the left (L11–L12)
  vv: rel(V, -1100, 700),
  vatk: rel(V, -800, 1000),
  vvic: rel(V, -1330, 1050),

  // Uranium zone
  ura: URA,
  knob: rel(URA, -340, 60),
  fork: rel(URA, -60, -330),
  bal: rel(URA, 430, 250),
  atk3: rel(URA, -170, 380),
  lesson: rel(URA, -40, 720),
};
