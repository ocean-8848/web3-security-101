start: CAMS.exitC (= seg2 end; zone C objects placed, so the title card sits on the full exit scene)
end: CAMS.counterC (static from ~114.6 s; = seg4 cam0)

# ep25 seg3 ③ 前排拦截 — self-review

- Camera route: L0 exitC → L1 heistA → L5 mintB → L7 `bAll` (segment-local: mint presses + addr plates + AMM + T3 sign + law dots) → L10 lawB → L18 counterC.
- termCards report: 术语卡 3 张：延迟提款@8.59s×3.6s，临时限制令@63.55s×3.6s，风控名单@108.61s×3.6s
- `hyperframes check`: passed, 0 errors. Warnings: file size (generated), narration slot 0.08 s longer than the audio, 3 × craft `dead_stretch` (17.3–20.4, 84.4–87.9, 104.6–107.9 s). Those times did not move when I added actions in those windows, so they look like they come from index.html/captions, not from the story timeline.
- `layout_lint`: passed (checked every 0.5 s up to 117.5 s).
- Images viewed: 1 contact sheet (0.3/23/46/71/86/96/108/117 s). Objects are recognisable and each frame matches its line: L3 key frame (reach arrow blocked at the time lock, switch, green cmETH frame, 43 dots), T3 + 45 dots, LIBRA docs + grey dots, 6-hour clock + 23 red dots flowing right, GENIUS doc, counter + risk list "命中" + gate down + robber walking to the OTC stall.

## Deviations / notes
- Event and source share one card: the source is a second line inside the card, faded in at the line the BRIEF names. Card tops are staggered 120–136 px so check doesn't flag them as stacked.
- L13: there's no padlock in the law corner, so "锁打开" is shown as the 58 teal dots turning grey and hollow, labelled "冻结解除". "解除冻结" slides over "临时限制令".
- L6 padlock is a new local lock dropped onto the middle attacker address plate (zb(-450,215)); the layout's LOCK_B locks are not placed.
- Local positions: engineer za(-520,-120), "执法请求" doc zb(1000,150) (faded out at L14 before the 6-hour clock appears).
- Hero coins (A), out-coins (B), C coins, car plate and the C sign are not placed in this segment.

## Unresolved
- I didn't read seg2's final state, so exit labels or coin states from seg2's last frame may not match exactly. The crossfade and title card cover the first 1.6 s.
