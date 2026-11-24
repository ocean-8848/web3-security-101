start: CAMS.E
end: CAMS.F (static from 163.8s to 167.56s)

# ep09 seg5 review

- termCards: 术语卡 6 张：ecrecover@6.62s×3.6s，紧凑编码@41.39s×3.6s，ERC-1271@58.24s×3.6s，拒绝服务@65.44s×3.6s，冷钱包@99.92s×3.6s，delegatecall@115.01s×3.6s (none delayed or short)
- `npx hyperframes check`: 0 errors. Warnings:
  - `line_unread` on the title-card subtitle. The 1.53s title card is fixed by segbase.
  - `dead_stretch` at 139.6–142.7s (L23). The flash on the desk screens at 140.3s happens inside `#cam` SVG, which the sampler cannot see. This is the same known limitation as the kit.
- `layout_lint`: passes.
- Snapshots: 3 contact sheets viewed (6 + 3 + 3 frames).

## Camera route
E (L0) → tZero (L1–L2) → tSigs (L3–L5) → tBytes (L6–L7) → tWallet (L8) → tPermit (L9–L12) → tPhish (L13–L14) → F (L15–L16) → desks (L17–L19) → F (L20–L26).
The `t*` presets are local close-ups defined in build-story with `L.fit` on the layout positions. `shared/layout.mjs` is unchanged.

## Local additions
- Extra positions: BADSIG, GATE (a kit checkpoint used as the 验签闸门), USED (doc 已使用), PVM (a small 存款合约 vending at the permit pool exit), PL2 and THIEF (phishing), TXDOC.
- `sc()` wrapper: most kit and ext objects ignore `opts.scale`. Only vending, emptyLot, cheque and person honour it. This helper scales the SVG about the ground origin and scales the anchors to match, so the `scale` values in layout.mjs apply.

## Unresolved
- The E-zone objects at the start are rebuilt from BRIEF section 2: cheque filled, vending ×2, signs, rolls, seal, funnel, key, twin and clock. They have not been compared against seg4's actual final frame.
- The tZero close-up still shows neighbouring E objects at its edges. This is readable but busy.
- The Bybit vault door opens at L19 so the core swap is visible, and it stays open through the end.
