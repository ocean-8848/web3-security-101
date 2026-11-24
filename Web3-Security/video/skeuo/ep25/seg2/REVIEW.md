start: CAMS.mintB (= seg1 end)
end: CAMS.exitC (static from ~107.3 s; seg3 starts on exitC)

# ep25 seg2 review

- Shots: mintB (L0–L1) → wide (L2–L6) → exitC (L7–L14) → wide (L15–L20) → exitC (L21–L22, end).
- Continuity with seg1's last frame: the five hero coins sit on zone B's road at u 2000…2440, with tickers, highlight pills and "?" marks. The padlocks hang 70 world px above LOCK_B. The clock reads 12:40. ETH/TRX out-coins are there, and so are the "Tether/Circle · 发行方" labels. The "?" marks and highlights fade during the title card (1.0 s), and the padlocks drop back at L0. seg1's own code fades its 79 red dots (#dR) at its L7, so they are not reproduced here. seg1's question card (`#kw-q`, a screen card) is not reproduced; the crossfade covers it.
- Wide shot (scale 0.10): every marking is screen-layer and drawn large. That covers the red pipe overlay, the green-to-red rings and cards, the magnifier with a cyan trail, the padlock icon, the four numbered route nodes, the six-address fan, the cut mark, the hourglass and the step cards.
- Key frame L10: the robber walks onto the native-SVG highway. The car plate flips from USDT to BTC, and arms ②–④ drop behind him (① dropped in L9 to block the coins).
- 术语卡 4 张：原生币@17.47s×3.6s，跨链桥@43.32s×3.6s，混币器@82.09s×3.41s，场外交易@85.64s×3.6s
- hyperframes check: 0 errors. Warnings: composition_file_too_large, and line_unread on the title-card subtitle. The title-card timing comes from segbase, not this segment.
- layout_lint: 版面检查通过
- Images viewed: 1 contact sheet (8 frames).

Unresolved / notes
- The L21 dot matrix is a screen card (20×5 dots + legend) rather than world-native dots, because exitC at 0.487 makes world dots too small.
- In wide, the circle for "exchange deposits" sits on the counter's projected point. At 0.10 the counter itself is only a few pixels.
- The "比喻" tag was restyled after the snapshot, and so was the drawing order of the node-2 / fan pair. Neither change has been re-snapshotted (check and lint pass).
