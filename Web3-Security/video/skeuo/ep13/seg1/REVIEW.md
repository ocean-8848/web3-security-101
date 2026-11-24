start: mintB (redefined locally in seg1, see below)
end: solB (static from ~60.9s; seg2 cam0 = solB)

# ep13 seg1 review

- termCards report: 术语卡 2 张：系统账户@18.08s×3.6s，守护者@23.04s×3.6s
- hyperframes check: passed, 0 errors. Warnings: composition_file_too_large, clip_media_fit (audio 63.94s vs 64.02s), line_unread on the title card (segbase default), dead_stretch 3.6–7.2s (motion is SVG-attribute flywheel spin, which the sampler doesn't see).
- layout_lint: 版面检查通过 (every 0.5s, through 64.0s)
- Images viewed: 4 contact sheets (8 frames; 4 frames; 2 frames; 2 frames)

## Cameras
- `mintB` is overridden locally: the shared framing put the mint press under the right-hand event card. The local fit covers mint press + program machine + proof card + dot spill in [300,440,1500,860]. Name unchanged; seg1 has no previous segment.
- `roadB` (local) at L12: gates A–B–C along the road ("换一条链"; gates A and C fade in). The shared `solB` doesn't reach them. L13 pushes back to `solB` and holds.

## Deviations from BRIEF
- L3: passport ps3 slides to just in front of the program machine (not inside), so the L10 red curve and L11 broken frame stay visible.
- L6 inset: shows vending + Storage cabinet side by side (drawer "地址" pulled out), not a literal far shot of zone A.
- Code card A shows a struck-through placeholder row `read_sysvar(acct)` (not a real function name) plus the fixed row `require(acct.key == SYSVAR_ID)`, both tagged 示意.
- L0–L4 sources go on a grey line inside the event card. L9 brings them back as a separate source card.

## Unresolved
- The E11 mintPress at scale 0.6 renders much smaller on screen than layout EXT `mintPress` × 0.6 predicts. It's readable as a press with the label and red dot matrix next to it, but small. A coordinator glance at ~10s is worth it. A possible fix is to drop to scale 0.8 or to push in tighter.
