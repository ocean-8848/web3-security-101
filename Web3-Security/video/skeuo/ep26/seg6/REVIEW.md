start: CAMS.defendD (= seg5 end; zone D objects placed from layout.mjs, so frame 0 is not empty)
end: CAMS.wide (static, end card "AI 与 Web3 安全")

# ep26 seg6 review

- termCards report: 术语卡 2 张：白名单@20.01s×3.6s，解码@38.49s×3.6s
- hyperframes check: 0 errors. Warnings: line_unread on the starter's title subtitle (title card timing comes from segbase); dead_stretch at 54.7–58.7, 68.5–72.0 and 72.3–75.5 s. These did not change after I added moves at those times, so the detector probably does not see world-layer tweens.
- layout_lint: 版面检查通过
- Images viewed: 1 contact sheet (9 frames: 0.5 / 23.5 / 37 / 50 / 58.5 / 74.5 / 85 / 89.5 / 95.5 s)

## Notes
- Segment-only cameras: `gateE2` is gateE fitted to x 680–1820, which leaves the left side for code card B and the L10 审查/测试/审计 cards. `answerE2` is answerE plus the agent, so at L15 the robot is visibly outside the green boundary frame. Start, end and the userE camera are the shared presets.
- The wide end shot has background objects for zones A–C (main pieces only) and most of zone D. All the markings on that shot are screen-layer (end card only).
- Extra local positions: E_OBOT (L7 "另一个模型" robot), E_UMAIN (L11 user's main wallet, gold safe wrapped at 0.5), E_TRUST0 (L9 letter start), EPIPE (local pipe agent → 3 checkpoints → low-limit wallet).
- Checkpoint door plates show ①②③. The names 额度 / 白名单 / 人工确认 are world labels.
- The hwWallet screen keeps its default text. "解码后的交易" is a label above it.

## Unresolved
- No final render checked. The L11 usafe slide and the L14 letter bounce were only checked by timing, not frame by frame.
