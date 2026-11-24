start: CAMS.roninB (= seg2 end; Ronin keys ×9 with 5 red + threshold meter 5/9 placed from layout.mjs, L0 pans to pipeC)
end: CAMS.detC (static from L18, = seg4 cam0)

# ep30 seg3 review

- Shots: pipeC (L0–L5) → policyC (L6–L12) → privacyC (L13–L17) → detC (L18–L19), as in BRIEF section 2.
- termCards: 术语卡 5 张：读写集@12.94s×3s，排序服务@16.09s×3.6s，崩溃容错@44.65s×3.6s，BFT@59.49s×3.6s，随机盐@80.54s×3.6s；注意：排序服务 推迟 1.43s
- hyperframes check: passed, 0 errors. Warnings: composition file size, narration 94.34s vs 94.42s slot, title subtitle under read floor (segbase title card), 读写集 term card 2.9s (pushed by 排序服务), dead_stretch 5.04–8.20s (the ①②③ labels and object bump in that window are world labels; the check does not seem to count them).
- layout_lint: 版面检查通过.
- Code cards: A (policy, L6–L8, top-left, curves to both policy boards), C (transient, L17, top centre, curves to envelope + salt shaker), B (determinism, L19, top centre, row 1 red → clock, row 2 green → rw-set 2).
- Images viewed: 2 contact sheets (8 + 4 frames).

## Unresolved / notes
- Threshold meter in the first 1.6 s is mostly behind the title card (keys are visible).
- The rejected-tx letter sits by the sorter's block box (L.C_LETTER), not inside it.
- Raft leader compromise is shown by red LEDs + a red dashed box; the "order scrambled / dropped" is a label ("顺序 3 · 1 · 延迟 2 · 丢弃 4"), not animated envelopes.
- Hash tags are written H(A)/H(B)/H(C) and "H(B + 盐)"; no invented hash strings.
