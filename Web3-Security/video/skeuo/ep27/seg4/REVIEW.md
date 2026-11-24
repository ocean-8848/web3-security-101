start: CAMS.formalC
end: CAMS.chainD

# seg4 review

- Camera path: formalC (cam0, same as the end of seg3) → L0 auditD → L8 deployD → L13 chainD, then holds still to the end.
- First frame: the C belt, gate ⑤ (arm up), the proof card, the 数学库 machine, the small engineer and the version card (dots ①–⑤ lit) are all placed, with the labels 形式化验证 / 证明 / 数学库 already showing. So the title card does not sit over an empty grid.
- termCards: 术语卡 3 张：提交哈希@8.56s×3.6s，多签@65.07s×3.6s，主网分叉@107.08s×3.6s
- `hyperframes check`: 0 errors. Three warnings, all left as they are:
  - composition_file_too_large
  - clip_media_fit: 0.06 s gap between the audio and the slot
  - line_unread: the title-card subtitle is on screen 1.54 s; this comes from the segbase default and was not touched here
- layout_lint: passed, with 0 findings.
- Images viewed: 1 contact sheet, with frames at 1 / 24 / 42 / 58 / 69 / 92 / 110 s.

## Open / for the coordinator
- auditD and deployD come from shared/layout.mjs and are wide (scale ≈ 0.59 / 0.51). The D objects therefore look small: auditors, key, laptop. The labels counter-scale and stay readable, but the L12 key-into-safe moment is small on screen. If it needs to read better, this is a layout.mjs camera change (for example, fitting deployD to the safe, deployer and timeLock).
- I could not see the exact last frame of seg3. This segment assumes that at the end of seg3 the version card is just past gate ⑤ (belt u 7700) and the ⑤ arm is up. If seg3 ends differently, adjust `VC0` and `armUp` on gate5.
- The ice-frozen 提交哈希 card reads mostly as an ice block at this zoom. The cyan label 冻结 · 提交哈希 carries the meaning.
