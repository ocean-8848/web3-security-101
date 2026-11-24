start: CAMS.methE
end: CAMS.world (= wide) + end card

# ep27 seg6 review

- Continuity: cam0 = methE, which is seg5's end preset. The mETH corner (vending "mETH" 0.6, hourglass, knifeSwitch, tower, cmETH coin) and the rest of zone E are placed from layout.mjs, so the first frame is not empty. The labels of the mETH corner are not re-shown, so they may differ from seg5's last frame (the crossfade and title card cover this).
- Cameras: L0 methE → L1 wide → L2–L9 checkE → L10 world (wide) → end card at LS[11]-0.3 (closing line on screen for about 3.9 s).
- Wide shot (k 0.115): every wide-shot marking is on the screen layer. That covers the gate flash rings, gate ④'s red dashed "跳过？" box, the eight green ✓ marks, the return dashed curve (`S.curve` via `S.scr("wide", …)`) and the "审计 = 一个关口 · 解读" keyword card. The whole world is placed for the wide shot: the belt B–E, the 8 gates, the zone signs and the main objects of each zone.
- Deviation: the "改动" cards row uses a local spot `CHG` (front-right of the bench). layout's `E_CHANGES` puts it under the captions in checkE.
- Deviation: the BRIEF has "审计 = 一个关口" as a world ground label at L10 and the full-pipeline-green beat at L11. The pull to wide moved to L10, with the label as a screen keyword card. At L11 the end card covers the frame, so the wide finale would have been hidden.
- termCards report: `术语卡 1 张：字节码@19.2s×3.6s`
- hyperframes check: passed, 0 errors. Remaining warnings:
  - default title subtitle `line_unread`
  - `#qz-eq` / `#qz-x` overlap (intentional: the cross is drawn over "=")
  - "跳过？" at 22 px is below the 28 px type floor
  - `dead_stretch` 38.99–42.61 s: the magnifier moves inside `#cam`, which the sampler can't see; the snapshot confirms the motion
  - file size
- layout_lint: passed.
- Images viewed: 1 (contact sheet at 2.5, 7.8, 26.5, 34.7, 45.6, 49.8 s).
- Unresolved: none blocking.
