start: CAMS.A
end: CAMS.B (static from ~119.5s; seg3 cam0 = B)

# ep11 seg2 review

- 术语卡 4 张：预言机@64.16s×3.6s，滑点@71.56s×3.6s，治理代币@84.98s×3.6s，抵押率@119.46s×3.6s
  - The 抵押率 card is moved up to LS[23] + 1.6 (the word is spoken at about 122.4s), so it is not cut off by the end of the segment.
- `npx hyperframes check`: passed, 0 errors. Warnings:
  - composition_file_too_large (generated file).
  - line_unread on the starter's title subtitle (owned by segbase).
  - 3 × dead_stretch (23.7–26.8, 90.8–94.2, 100.8–103.9). The motion in those stretches is SVG attributes inside `#cam` (liqBot grab, twapRecorder paper, bot lamps), which the sampler does not see. The ep08 README lists this as known.
- `layout_lint`: 版面检查通过 (checked every 0.5s up to 124.5s).
- Images looked at: 1 (contact-sheet.jpg, 8 frames: 8, 30, 51, 57, 66, 105, 115, 124s).

## Camera route
balance (L0–L10) → A (L11–L12) → B (L13) → liq (L14–L16) → xvs (L17–L22) → B (L23, static end).
grid/box cover the union of these views (canvas X −1974..1898, Y −2353..862).

## Open points / simplifications
- Code card B is hidden during L9–L10 so it does not cover 账户 A, then comes back at L11. In the balance close-up, the card sits over the edge of the vending machine (world layer; the lint does not count this).
- L5: the bot that repays the debt only shows its lamp and the label 替账户还债. No ink-dot stack flies back to the vending machine.
- L19: the BTC/ETH coins slide off and fade out. There is no signer pushing a cart.
- L17: the cyan dashed curve from XVS points toward zone A on screen. There is no pipe.
- The twapRecorder paper curve follows the object's built-in shape. The 76 → 144 rise and the fall afterwards are carried by the world labels and the readout text, not by an exact curve.
- The reflexivity ring is fairly small at the xvs framing (about 200 × 125 px). The labels are readable in the contact sheet.
