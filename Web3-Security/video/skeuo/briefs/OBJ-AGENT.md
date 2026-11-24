# 物件 + 世界布局简报（epNN）

Work in `/Users/k/Workon/Learning/web3/web3-security-101/Web3-Security/video/skeuo/`. Budget: **at most 35 turns**, at most 3 images.

**Part A: objects** (skip if BRIEF section 2 lists none).
- Build the objects from the "需要新补的拟物物件" table in `epNN/BRIEF.md` section 2 into `epNN/kit-ext/`. Keep them simple: one body, the listed moving parts and states, nothing extra.
- Copy the conventions of `ep11/kit-ext/` (read its README and object source as the template): `objects-ext.mjs` with `CATALOG_EXT` and `runtimeExtJs()`; `runtime-ext.js` exposing `window.KITX<NN>`, merged into `KITX` without overwriting; `README.md`; `demo/`; `showcase.png`.
- Support `opts.scale` with scaled anchors. Helpers take `(tl, id, t, …)` and are seek-safe. Never use the id `cam`.
- Finish: demo `npx hyperframes check` has no errors → `showcase.png` → `node tools/catalog.mjs`.

**Part B: layout.**
- Write `epNN/shared/layout.mjs` in the same format as `ep11/shared/layout.mjs`. Take zones, objects per zone, scales, per-segment start/end zones and the expected CAMS list from BRIEF section 2.
- Objects that ignore `opts.scale` (list in `kit/SEGBASE.md` 常见坑): keep the scale in layout with a "wrap" comment.
- Export positions, `EXT`, `rect`, `fit`, `ZONE_RECTS`, and `CAMS` per zone plus close-ups/wides section 4 clearly needs, and `world`.
- Constraints: no overlaps within a zone; key objects inside x 60–1860, y 160–860 at their zone's framing; keep x<620,y<260 clear where you can. Verify with a throwaway script, then delete it.

**Then:** `python3 tools/new_seg.py epNN`; set each starter's camera to its BRIEF start zone; fill any `TODO 副标题`; make sure each starter has its term cards (add by hand if none were parsed); `node src/build-story.mjs` in every segment.

Rules: no video render; no pkill/killall; don't edit `kit/` or other episodes except what `catalog.mjs` writes; no git.

Report back briefly: object import line, opts, anchors, helpers; layout import line and CAMS table; whether every starter builds and has term cards; anything you couldn't do.
