start: CAMS.A
end: CAMS.C (camera arrives at 113.8 s; last label pops at about 117.4 s; seg4 cam0 = C)

# ep09 seg3 review

术语卡 4 张：私有交易通道@7.99s×3.6s，超级代表@93.64s×3.6s，优先费@97.77s×3.6s，排序器@105.84s×3.6s

- `node src/build-story.mjs`: OK, no warnings about motion during the final hold.
- `npx hyperframes check`: 0 errors. Warnings:
  - composition_file_too_large
  - clip_media_fit: the audio is 0.06 s shorter than the slot
  - line_unread: title subtitle, 1.54 s. That timing comes from segbase.
  - dead_stretch 86.8–89.9 s: the BNB wheel spin and the world-label pop are SVG or counter-scaled motion, which the sampler can't see. This is the same known kit issue.
- `node ../../tools/layout_lint.mjs .`: passes. It found a seat-label overlap at L18, which is now fixed.
- Snapshots: 1 contact sheet (6 frames at 16.9 / 46.5 / 67.2 / 72.6 / 103.2 / 120.5 s). It showed an empty tray outline sitting in the D-zone frames before L12. That is fixed (it now fades in at L12) but I did not take a new snapshot to check it.

## Deviations from the BRIEF / open items
- The meter uses `thText: "最小输出"` instead of "最少 19000", because the threshold line moves during this segment (L1 up, L6 down, L7 to the bottom). The coordinator should check this against how seg1/seg2/seg6 set up the meter. Other segments weren't built yet when this was written, so world-state continuity at the A-zone start is unverified.
- L11 follows the narration order, not the BRIEF order. First the name tag says "发送者" and the copy bounces. Then, on "不然", the tag goes blank and the red copy is accepted. The BRIEF had blank first, then bound.
- Code card: it has 4 rows (swap signature / require / spot-price minOut / minOut = 0), not the BRIEF's row numbers 1 / 5 / 6. It sits at x 560–1380, y 110–~415, so it covers the B zone during L4–L8.
- The four-layer "stairs" are a screen-layer stepper (top right, x 1400–1760, y 100–312), not world labels. It lights each layer as the narration reaches it and is removed at L13.
- L6 keyword reads "现货价被推高 → 保护线跟着失守", not just "跟着被推高", because the meter line goes down while the price goes up.
- The BNB source card uses the BRIEF's "公开资料". That is not one of the PIPELINE source-type labels (公开报道 etc.), so please confirm.
- Not in the world: the blockdoc price tag and BNB clock hand animation (KIT.clock) are not used.
