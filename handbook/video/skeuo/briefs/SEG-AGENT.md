# 段代理简报（epNN segK）

Work in `/Users/k/Workon/Learning/web3/web3-security-101/handbook/video/skeuo/epNN/segK/`. The starter `src/build-story.mjs` already exists (built on `kit/segbase.mjs`, with imports, pills, title card + subtitle, starting camera, term cards; the last segment also has the end card). Fill in the `// SHOTS` section line by line. Use Edit, not full rewrites.

Read only:
- `hf/kit/SEGBASE.md`: the API and the "常见坑" section. Read it carefully, especially scaling objects and helper names.
- `hf/PIPELINE.md` sections 0 and 0.5.
- `epNN/BRIEF.md` section 2, and your segment in section 4 (`### segK`). Section 3 only if you need a code card.
- `epNN/shared/layout.mjs`. Do not change it; add extra positions or segment-only cameras locally.
- `epNN/kit-ext/README.md` (if it exists).
- Only the OBJECTS.md rows and other-episode kit-ext README entries for the objects you actually use.

Rules that bit earlier episodes:
- Never give an object the id `cam` or `root` (they clash with the stage `#cam` and `#root`; `root` once blanked a whole segment).
- If the segment visits several zones, widen the starter's `grid`/`box` to cover every camera it uses.
- Last segment: check the end card (title = short topic name, not the long script title; closing line; next = the topic named in the last sentence), and end on `CAMS.world` with grid/box covering all zones.

Continuity: your first frame must equal the previous segment's last frame. Check BRIEF section 2: if the previous segment ends on a different preset than your starter's `cam0`, set `cam0` to that end preset and move to your own start at L0 — and you MUST also place that zone's key objects (positions from layout.mjs) so the first 2 s are not an empty grid. A title card over an empty background is a bug. If placing them is impractical, keep your own `cam0` instead (the crossfade + title card cover the cut). End static on the next segment's start zone from BRIEF section 2. Write both preset names as the first lines of REVIEW.md.

Self-review:
1. Build, check and lint in one Bash call: `node src/build-story.mjs && npx hyperframes check; node ../../tools/layout_lint.mjs .`. Fix check errors and lint findings.
2. One `npx hyperframes snapshot` of the key frames; look only at its contact sheet(s). No more than 4 images in total.
3. Write REVIEW.md.

At most 25 turns: batch related edits, don't re-read files.
Do not render. No pkill/killall. Edit only `epNN/segK/`. No git.

Report back briefly: start and end presets; termCards report line; final lint result; images viewed; anything unresolved.
