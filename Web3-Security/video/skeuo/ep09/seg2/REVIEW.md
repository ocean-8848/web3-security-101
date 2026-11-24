start: CAMS.B
end: CAMS.A (static from ~115.6s; seg3 cam0 = A)

# ep09 seg2 review

- termCards: 术语卡 2 张：区块构建者@23.31s×3.6s，提议者@28.36s×3.6s
- `npx hyperframes check`: 0 errors. 1 warning (composition_file_too_large, 1769 lines, from the inlined kit runtimes). 4 info items (text_occluded on the grey/red form cards; fixed by swapping instead of stacking).
- `layout_lint`: 版面检查通过（每 0.5s 一次，共检查到 119.5s）
- Images viewed: 5 (4 half-scale pairs + 1 grid of 3)

## Camera route
B (L0) → build (L1–L4) → B (L5–L11) → poolSorter (L12–L19) → auction (L20–L22) → A (L23, end static)

## Local additions (not in shared/layout.mjs)
- `BOT = G(40, -590)`: E08 liqBot "复制" between searcher and sorter in-end, grown at L7, faded at L12
- bundles `bun1` / `bun2` at world-canvas (80, -540): three small letters + rope (custom group with data-px/py so X1.walk works)
- belt letters are standalone E01 letters at belt height z 78 (`BP(d)`); sorter built with `letters: 0`
- meter label text duplicated (`mt-tt` / `mt-tt2` "最少 ↓") for L19; restored at L21 while the camera is on A′, so A at the end shows level 3 at "最少 19000"
- red profit dots are HTML pins (`.pdot`), 6 at L18 and 6 more at L19

## Unresolved / notes
- In poolSorter the mempool is cut off at the top of the frame (shared CAMS framing), so the L13 "① 进内存池" letter sits near the top edge
- Bundle and belt letters are small at k 0.64–0.75. Readable as envelopes; the 买/你/卖 badges are only just legible
- The "② 捆成一包" label slightly overlaps the searcher's magnifier in poolSorter
- The L1 sorter arm finishes at reach(60, 70) and stays there (the rest pose is not documented)
- The L23 "同一个区块" card is screen-layer HTML (three envelope chips), not a world object
