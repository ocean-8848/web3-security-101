start: incidentA
end: versionA (static from ~31 s; seg2 cam0 = versionA)

# ep27 seg1 review

- termCards report: `术语卡 1 张：审计@8.78s×3.6s`
- `npx hyperframes check`: passed, 0 errors. Warnings: composition_file_too_large (kit-wide); title card line_unread (segbase default title timing); 2 × dead_stretch (20–23.6 s, 45.7–49 s). The sampler can't see the world-layer SVG opacity changes there (bump of ≠ / flash of the red frame), so these are the known kit false positives.
- `layout_lint`: 版面检查通过
- Images viewed: 2 contact sheets (8 frames + 3 frames)

## Shots
- L0–L5 `incidentA`: vending "金库合约", attacker, 4 coins growing out, vending stock dims, 45-dot red matrix with legend "约 4500 万美元 / 1 点 ≈ 100 万美元", event card. L1 audit report with a green "✓ 审计报告". L2 source card "来源：审计方说明", and the two version cards grow. L3 key frame: green "审计版本" with seal, red "上线版本" with a red dashed frame, a red dashed link into the vending, and "≠". L4 the attacker and the live card bump, and the frame flashes. L5 a ground red dashed line between the cards with a red ✕ and the label "审计 → 上线 [解读]".
- L6–L11 `versionA`: "我们通过了审计" label, quiz card "先猜" → "通过审计 = 线上代码安全？", magnifier over the report plus a "审计版本" label, a red "?" over the live card, and the quiz card collapses into a red event card at top right.

## Deviations / unresolved
- L6 "通过审计" is a world label (lab-cs) above the vending, not a separate signBoard plate (A_SIGN is used for "事故展台"; there was no layout slot for a second plate).
- L11 "远处传送带与关卡轮廓淡入" was skipped. The belt starts ~2100 world px right of A, outside `versionA`, and fading in objects seg2 would not have at its first frame would break continuity.
- The segment ends with the screen-layer event card "通过审计 = 线上代码安全？" (red, top right) still visible. seg2 should either keep it briefly at L0 or accept that the crossfade removes it.
- The seal sits on the ground in front of/between the two cards (L.A_SEAL), not literally on the audit card.
