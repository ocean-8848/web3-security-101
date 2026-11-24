start: CAMS.deskA (first segment, no previous)
end: CAMS.quizA (static from ~40s; = seg2 start)

# ep19 seg1 review

- Camera: deskA (L0–L2) → xferA (local cam, deskA+platesA+phone, L3–L5) → userA (L6–L8) → quizA (L9–L11, static to end).
- 术语卡 report: 术语卡 2 张：USDT@5.79s×3.6s，交易记录@15.24s×3.6s
- `npx hyperframes check`: 0 errors. Warnings: composition_file_too_large, clip_media_fit (audio 48.08 vs 48.14), line_unread on the starter title subtitle (segbase title card, not touched).
- layout_lint: 版面检查通过.
- Images viewed: 2 contact sheets (9 frames + 4 frames).
- Fixes made after review: event card leaves at L6 (it covered the desk under userA); quiz card moved up so it no longer hides the attacker in quizA; entry labels spaced so they don't collide with the plate labels.

Unresolved / notes:
- The letters and phone screen text are texture-sized; the readable text sits in world labels.
- The kw card "不偷钥匙 · 骗你动手" slightly overlaps the desk top in userA (screen card over world, readable).
- No magnifier in seg1 (quizA leaves room for MAG_A; seg4/seg6 use it).
