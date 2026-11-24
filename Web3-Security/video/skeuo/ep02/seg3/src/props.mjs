// seg3 local props (same projection as kit). fn(o, opts) → { svg, anchors }
import { at, f, box, cyl, M, faceV, glow, contactShadow } from "../../../kit/iso.mjs";

/** a short stack of gold bars (2 + 1), lying on the ground (or lifted by z) */
export function goldStack(o, opts = {}) {
  const p = opts.id ?? "gold", z = opts.z ?? 0, l = 54, w = 24, h = 16;
  let s = z ? "" : contactShadow(o, 50, 30);
  s += box(o, -l / 2, l / 2, -w - 2, -2, z, z + h, M.gold, 1.2) + box(o, -l / 2, l / 2, 2, w + 2, z, z + h, M.gold, 1.2);
  s += box(o, -l / 2 + 4, l / 2 - 4, -w / 2, w / 2, z + h, z + 2 * h, M.gold, 1.2);
  const [ox, oy] = at(o, 0, 0, z);
  return { svg: `<g id="${p}" data-ox="${f(ox)}" data-oy="${f(oy)}">${s}</g>`, anchors: { center: at(o, 0, 0, z + h), top: at(o, 0, 0, z + 2 * h + 30) } };
}

/** a gold coin (flat disc) — used for "assets flowing out" */
export function coin(o, opts = {}) {
  const p = opts.id ?? "coin", z = opts.z ?? 0;
  const s = cyl(o, 0, 0, 16, z, z + 6, M.gold, { sw: 1.2, seg: 20 });
  const [ox, oy] = at(o, 0, 0, z);
  return { svg: `<g id="${p}" data-ox="${f(ox)}" data-oy="${f(oy)}">${s}</g>`, anchors: { center: at(o, 0, 0, z + 3) } };
}

/** green ground glow that can be faded in (id-glow wrapper) */
export const glowG = (id, o, r) => `<g id="${id}" opacity="0">${glow(id + "-c", o, r)}</g>`;

/** laptop terminal screen (local 222×146) */
export const terminalScreen = (line) => `<rect x="0" y="0" width="222" height="146" rx="4" fill="#17191d"/>
  <rect x="0" y="0" width="222" height="18" fill="#2b2e34"/><circle cx="12" cy="9" r="4" fill="#e0453a"/><circle cx="26" cy="9" r="4" fill="#9a9488"/><circle cx="40" cy="9" r="4" fill="#9a9488"/>
  <text x="12" y="44" font-family="JetBrains Mono, monospace" font-size="15" font-weight="700" fill="#5cc0e0">$</text>
  <text x="28" y="44" font-family="Noto Sans SC, sans-serif" font-size="15" font-weight="700" fill="#e9e5dc">${line}</text>
  <rect x="12" y="62" width="150" height="8" rx="4" fill="#3a3e45"/><rect x="12" y="80" width="120" height="8" rx="4" fill="#3a3e45"/>
  <rect x="12" y="98" width="170" height="8" rx="4" fill="#3a3e45"/><rect x="12" y="118" width="10" height="16" fill="#e9e5dc"/>`;

/** browser page (local 380×300 below chrome starts at y≈42) */
export const extPage = () => `<rect x="12" y="54" width="356" height="234" rx="10" fill="#f6f3ee"/>
  <text x="190" y="96" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="26" font-weight="900" fill="#1c1c1c">Wallet Core</text>
  <rect x="140" y="120" width="100" height="100" rx="10" fill="#e1f2f8" stroke="#1d93ba" stroke-width="3"/>
  <text x="190" y="180" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="24" font-weight="800" fill="#1d93ba">WASM</text>
  <rect x="80" y="242" width="220" height="14" rx="7" fill="#ddd6c9"/>`;

/** HTML sticker "警告" (counter-scaled via wpin) */
export const sticker = (id, text) => `<div class="stk" id="${id}"><svg width="30" height="28" viewBox="0 0 30 28"><path d="M15 2L28 26H2Z" fill="#e0453a" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/><rect x="13.6" y="9" width="2.8" height="9" rx="1.4" fill="#fff"/><circle cx="15" cy="22" r="1.8" fill="#fff"/></svg>${text}</div>`;

/** HTML wrench icon */
export const wrench = (id) => `<div class="wrench" id="${id}"><svg width="120" height="120" viewBox="0 0 120 120"><g transform="rotate(-45 60 60)">
  <rect x="52" y="34" width="16" height="74" rx="8" fill="#9aa1aa" stroke="#4b4f56" stroke-width="3"/>
  <path d="M60 4a24 24 0 1 0 0.1 0Z" fill="#c3c8ce" stroke="#4b4f56" stroke-width="3"/>
  <rect x="52" y="2" width="16" height="22" fill="#efebe3" stroke="none"/>
  <path d="M52 4v18M68 4v18" stroke="#4b4f56" stroke-width="3"/></g></svg></div>`;
