start: CAMS.cosmosE
end: CAMS.world (end card)

# ep13 seg6 review

- Route: cosmosE → cexF (L0–L1) → segment-only cexL (= fit(ZONE_RECTS.F) into screen x 700–1820, leaving the left side for the 接入清单 card; L2–L9) → passB (L10–L11) → wide (L12–L13) → world (L14–L15, end card).
- Term cards: 术语卡 2 张：denom@24.88s×3.6s，回滚@28.99s×3.6s (none delayed or short)
- End card: title 非 EVM 生态安全 · closing line 换一种账户模型，就换一组漏洞 · next ZK 与证明系统的安全 (the topic named in the last sentence).
- `hyperframes check`: passed with 0 errors. Warnings: the file is large (725 lines); the narration is 0.08 s shorter than the slot; the title card is on screen 1.53 s, below the line_unread floor (handled by segbase); dead_stretch at 36.6–39.6 s and 68.2–71.5 s (the SVG passport and hourglass animations are invisible to the sampler, a known kit issue).
- layout_lint: passed. I fixed one overlap first: the 失败 and 同名假币 labels overlapped, so I moved 同名假币 to the right of the coin.
- Snapshots viewed: 2 contact sheets (7 frames + 1 frame).

## Unresolved / notes
- At wide (L12–L13), the two E 应用链 chains run slightly past the right edge of the frame. CAMS.wide is fitted to the gates only. I left it as it is.
- In L11 only passport ps0 (normal) and ps3 (系统账户, fake) open and get checked. ps1 and ps2 stay closed.
- The "?" bubbles in L13 use lab-ink, a dark chip with a teal "?". They sit to the left of each gate's input label.
