start: CAMS.kycC (= seg4 end; L0 pans to benchD)
end: CAMS.defendD (static; = seg6 start)

# ep26 seg5 review

- C-zone key objects placed for the opening frames: camera, passport, 6 phishing letters, code doc, family x2, confirm phone, "开户台" sign.
- Segment-only camera `oracleDL` = L.fit(R.oracle, [760,300,1820,860]): the oracle shot shifted right so code card A (x 60–700, y 300) sits on the left. Used L10–L14.
- termCards: 术语卡 4 张：基准@34.22s×3.6s，端到端@45.22s×3.6s，坏账@78.38s×3.6s，分诊@120.26s×3.6s
- hyperframes check: passed, 0 errors. Warnings: file size, narration 0.06 s shorter than the slot, subtitle line_unread on the title card (shared by every segment), and 5 dead_stretch warnings (3.0–3.7 s: 8–20 s, 90–97 s).
- layout_lint: passed.
- Snapshot contact sheet (1 image) at 1/9/20/28/50/75/95/110/127 s: objects are recognizable and each beat shows on screen.

Unresolved / notes
- No stone road or money pipe is drawn. This matches seg4, which draws neither.
- The dead_stretch warnings remain after extra flashes were added in L1, L2 and L15. The waits are between narration beats.
- L17 "已控制" sits on desk 0's screen and crosses the red curve start, which is intended. The supply shot is busy but lint-clean.
