start: CAMS.flowAC (= seg2 end)
end: CAMS.checksA (static, = seg4 cam0)

# seg3 ③ 假充值 · review

- 术语卡 report: `术语卡 2 张：部分支付@39.42s×3.6s，确认数@75.06s×3.6s`（无推迟、无偏短）
- `npx hyperframes check`: passed, 0 errors. Warnings: composition_file_too_large (generated), title subtitle line_unread (segbase title card), 3 × dead_stretch (3.4–7.2 s during the letter walk; 52.4–59.0 s around the L11 key frame, which already has label bumps).
- `layout_lint`: 版面检查通过.
- Images viewed: 2 contact sheets (10 frames: 0.5, 6, 18.5, 34, 57.5, 66, 78, 85, 92, 112.8 s).

Camera path: flowAC → L0 intakeA → L8 scaleA (local, scale close-up) → L13 intakeA → L15 A (zone wide, so the finality signal is in frame for 回滚) → L18 checksR (local: checks on the right, code card A on the left) → L24–L25 checksA.

First frame: B/C key objects from flowAC (signs, cold/warm/3 hot safes, ledger, shield, rack, HSM) are placed so the title card is not over an empty grid. seg2's end-state overlays (red attack boxes) are not reproduced; the crossfade and title card cover that.

Deviations from BRIEF:
- L14 "grey machine silhouette" for the forged event is omitted; shown as a label swap over the magnifier (来源 ? → 没查来源合约).
- L25 "new chain silhouette beside `chain`" → chain isn't in checksA, so it's two keyword cards (新链 · 按它的交易模型从头设计 / struck-through 照搬以太坊的逻辑).
- XRP readings are shown in world labels beside the scale LCD (the LCD is unreadable at this size); the diff bar goes red at L11 and green at L12.
- Code card row 3 (实际到账) curve points to the scale diff anchor instead of checkpoint ③ (③ still lifts).

Unresolved: none blocking.
