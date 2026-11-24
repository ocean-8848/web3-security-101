start: CAMS.walletsA
end: CAMS.keyB (static)

# ep18 seg2 review

- Continuity: cam0 = walletsA, which matches the end of seg1 (coordinator fix). L0 pans to schemesB over 1.6 s. The segment ends static on keyB, which is where seg3 starts.
- Term cards: 浏览器扩展@25.03s×3.6s, Safe@41.18s×3.6s, 分片@52.39s×3.6s. None were deferred.
- `npx hyperframes check`: 0 errors. Warnings, none blocking:
  - composition file size
  - starter title subtitle line_unread (1.53 s)
  - dead_stretch at 67.4–70.8 s (L15 row pops)
- layout_lint: passed (every 0.5 s up to 115.0 s).
- Snapshot: one contact sheet with 9 frames (6, 23, 47, 56, 66, 74, 92, 103, 112 s). Objects are recognisable and the L20 key frame reads: the 3 locks have lines to one 签名界面 card, then "退化成 1 把".

Notes / unresolved:
- Inside the vitrines, the safe is scaled to 0.42 (not 0.6) so it fits under the 150-high glass.
- The padlocks on the multisig safe are small at multiB and keyB.
- The L23 weak-spot rings are viewed at cam B, then the camera returns to keyB for L24. The three red-dashed cards (设备 / 日志 / 眼睛) are screen-layer cards at y 180.
