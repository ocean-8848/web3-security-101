start: CAMS.gatesB (= seg2 end; L0 pushes to specB)
end: CAMS.formalC (static from ~103.4 s; = seg4 cam0)

# ep27 seg3 ③ 测试三层 — self-review

- Camera route: gatesB → specB (L0) → unitC (L4) → fuzzC (L6) → invC (L11) → formalC (L22).
- 术语卡 3 张：舍入@47.49s×3.6s，重入@67.79s×3.6s，健康因子@92.89s×3.6s
- `npx hyperframes check`: 0 errors. Warnings: composition file size, a 0.01 s tween overlap at t=0, title subtitle under its reading floor (segbase title card), dead_stretch at 4.7–8.1 s and 109.9–113.3 s (SVG motion inside #cam that the sampler does not see), text_below_floor (24 px code-card rows, 22 px xs labels).
- `layout_lint`: passed (0.5 s step, through 118.2 s).
- Images viewed: 2 contact sheets (8 frames, then 2 frames).

Notes / unresolved
- B zone (gates ①②③, belt, magnifier, beacons with "已结论" tags, gate-name labels, plane corner without labels) is placed here independently of seg2. Check seg2's last frame for small differences, such as green dots on the version card, labels, or wind lines. The crossfade covers small differences.
- At the end frame, the callback arm stays extended and `bal2` is restored (fixed, tilt 6) before the camera reaches formalC. Gate ⑤ arm stays down.
- Code-card rows are 24 px (shrunk from 30 px so the rows fit the card).
- Version cards on the belt have no per-gate green dots in this segment.
