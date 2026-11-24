start: CAMS.B
end: CAMS.reward (static from ~101.3s, = seg4 cam0)

# seg3 review

- termCards report: `术语卡 3 张：闪电贷@28.82s×3.6s，时间锁@67.11s×3.6s，法定人数@72.09s×3.6s` (none deferred / short)
- `npx hyperframes check`: passed, 0 errors. Warnings left: composition_file_too_large (kit-wide), narration 106.78s vs slot 106.84s (scaffold), title subtitle "借来的票也是票" 1.53s < floor (segbase title card, not in SHOTS)
- `layout_lint`: 版面检查通过（每 0.5s，到 106.8s）
- Snapshot: 12 frames (3–106s), looked at 2 contact sheets only

## Camera path
B → Cwide (L0) → C (L1–L2) → voteL (L3–L4) → C (L5–L12) → voteL (L13) → guardR (L14) → guard (L15) → rewardL (L16–L19) → reward (L20, static end).
Local cams `voteL` / `guardR` / `rewardL` = same object sets as vote / guard / reward, fitted into x 900–1820 to leave the left for code cards C / D.

## Deviations from BRIEF / notes
- L4 "紧急通道": uses commitBox front door (`X9.flap` 60°) + red label instead of a hand-drawn side door; door closes at L13.
- L8 "一笔交易" frame is a screen-layer rect over CAMS.C (flashDesk `frame` not used); the five step chips sit in a row just above the frame.
- L10 date corner "前一天" done as a red label "提前 1 天提交" over the proposal, plus the 1 天 hourglass running out.
- L13 "相片里没有借来的金条": photo label "提案前的区块" only; flashDesk gold is already gone by then. The photo text is small at voteL.
- L15 padlock and clock grow at their layout spots (padlock not lifted onto the proposal); clock hands rewind by −230 min.
- L17 gold bars flying from flashDesk → reward: not drawn (flashDesk is off-frame); shown as coin burst + label "同一笔交易：存入 · 领奖 · 取出".
- L20 "规模" sits on the reward coin spray (flashDesk is not in the end framing); "时间" sits over the 随时间累积 hourglass.
- B zone is rebuilt statically for the opening (no reflexivity ring); check it matches seg2's end state.
