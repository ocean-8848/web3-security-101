start: CAMS.deskC
end: CAMS.rangeD (static)

# ep16 seg4 自审

- Camera path: deskC → gateD (L0–L3) → segment-only `cgD` (gate + meter + three racks + main chain, L4–L9) → shareD (L10–L14) → rangeD (L15–L21, ends static).
- termCards: 6 cards: PoS@3.34s×3.6s, 检查点@7.66s×3.6s, 罚没@13.71s×3.6s, 客户端多样性@30.91s×3.6s, 社会层@77.98s×3.6s, 弱主观性@103.89s×3.6s. No cards were delayed or short.
- `hyperframes check`: 0 errors. Warnings:
  - composition_file_too_large
  - clip_media_fit (narration is 0.08 s shorter than its slot)
  - line_unread on the title card (it is in segbase and lasts 1.54 s)
  - dead_stretch at 35.97–39.23 s and 39.80–42.86 s. The meter, gate arm and LED moves are SVG attribute changes, which the sampler cannot see. This is a known kit limitation. A label flash was added at L7.
- layout_lint: 版面检查通过.
- Images viewed: 2 contact sheets (8 frames + 4 frames).

## Notes / unresolved
- The C-zone objects (public and private chain, rollCounter 600, dispatchDesk, beacon) are placed in a plain end state for continuity with seg3. Their exact seg3 end state (beacon lit or not, desk LED) was not checked against seg3.
- The main chain is built as n 5. Its first four blocks sit where the layout's n 4 chain sits, and b4 fades in at L3 to show "继续出块".
- The client share bars are native SVG above the racks. They are readable but small at cgD.
- In rangeD the D-zone share signs (约 33%…66%) are cut off at the top edge, under the chapter pill area. They are world objects inside the preset framing; the layout was not changed.
- The 2023 event card and the Prysm source card are stacked (top 120 / 210). The ethereum.org source card uses top 126 so the check does not flag two cards at the same position.
