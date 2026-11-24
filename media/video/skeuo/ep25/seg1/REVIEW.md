start: CAMS.heistA (first segment, no previous segment)
end: CAMS.mintB (static from about 12.2 s to the end; seg2 starts on mintB)

# ep25 seg1 review

- termCards report: 术语卡 2 张：清扫交易@8.71s×3.6s，稳定币@29.92s×3.6s (none delayed or short)
- `npx hyperframes check`: passed, 0 errors. Warnings: composition_file_too_large (expected for segbase output), and craft dead_stretch 12.61–15.98 s. In that window the lock drops (13.1 s), the 97 dots fade in, and the labels pop and bump. These are small world-layer changes, so the check seems not to count them as motion.
- `layout_lint`: passed (0 issues, checked every 0.5 s through 67.8 s).
- Images viewed: 1 contact sheet (8 frames).

## Final state at segment end (for seg2 continuity, mintB)
Visible: road + red pipe; 2 mintPress (Tether/Circle labels shown); 3 addrPlate "攻击者地址"; 2 padlocks lifted about 70 px above their LOCK_B spots; clock (at about 4 h, no label); AMM (left tank drained); ETH/TRX coins at OUTCOIN; the 5 hero coins on the B road at u = 2000…2440 (local ROW, not in layout.mjs) with ticker labels highlighted and "?" marks; 3 red arrows on the pipe at u 2560–2760; kw-q card shrunk under the pill.

## Deviations / notes
- 79 red dots (L5) reuse the DOTS_B area instead of sitting "above the pool". Above the AMM is outside the mintB frame.
- Locks stay at the layout LOCK_B spots (between the presses and the road), not hung on the addrPlates.
- SIGN_B is not placed: at SIGN_B it would cover the hero coin row. SIGN_A is placed.
- The other A-zone objects (pause switch, time lock, mETH machine, cmETH) are not placed, because seg1 does not use them. The right half of heistA is just road while the coins roll.
- At mintB the objects read small (scale 0.55 objects in a wide frame), but they are still recognizable.
