start: CAMS.monitorA
end: CAMS.windowB (static)

# ep17 seg2 ② 你读的是谁的链 · REVIEW

## What was done
- A zone, reproducing seg1's end state as a guess: two replaced RPCs red, external RPCs broken, the switch thrown, monitor still showing "一切正常 ✓", the bridge wrapped at 0.6, and pipes to the bridge. This seg did not read seg1's code, so the coordinator should compare it with seg1's last frame.
- B zone pipeline: chain → node client → RPC → indexer → exchange desk (0.8). There are 4 E01 pipes with flow dashes, 4 layer boards, and a grey dashed ✗ slot to the right of each board, which turns into a red ✗ for that layer.
- Camera: monitorA → pipeB (L0) → clientB (L5) → pipeB (L9) → routeB (L12) → windowB (L17), then holds.
- L1: a red dashed curve labelled "直接读链" with ✗ on it. L6: Infura event card and source card. L7: minority fork grows, with a red dashed curve to it. L8: "MetaMask 等" label turns grey. L9: a red entry on the desk ledger saying withdrawals are paused.
- L10/L11: the RPC lamp goes red, flashes, then greys, with labels 宕机 / 限流 / 过期. The indexer gets labels ⌛延迟 and 解释错.
- L13: BGP shown as a teal curve into the switch; the switch flips and a red curve runs to the attacker server (rack wrapped at 0.7). L14–L16: phishing site (wrapped at 0.6), three event/source card pairs, and three red dot clusters (3 / 38 / 5) with a legend card on the right ("每点约 5 万美元" plus one row per incident).
- L17–L21: the comparison sign grows, then the window (live → delayed → replay, with world labels 延迟 / ● 播录像) and the watcher. L20 adds a second window as a translucent ghost with "✓ 换一扇再看". At L21 KIT.broke gives it a red dashed frame and a red ✗ is added, plus the label "只有一个 RPC".
- Road: a native SVG band drawn at the bottom layer.

## Checks
- termCards: 术语卡 4 张：索引器@10.1s×3.6s，共识 bug@30.7s×3.6s，BGP 劫持@55.85s×3.6s，SDK@71.01s×3.6s (none delayed or short)
- `hyperframes check`: 0 errors. Warnings left: composition_file_too_large, and line_unread on the title card (the segbase 1.6 s title card; this seg does not control it).
- layout_lint: passes.
- Images viewed: 3 contact sheets in total (two from the 10-frame snapshot, plus a recheck of the 104.5 s frame).

## Unresolved / for the coordinator
- In the windowB framing, the attacker server, the phishing site and the "网络路由" board with its red ✗ also show at the left and bottom edges. They are neighbours in the shared layout. seg3's first frame must keep the same end state: the window in replay, the translucent second window with red frame and ✗, and the "只有一个 RPC" and "● 播录像" labels.
- The dot clusters are small in routeB (k 0.569, about 4 px per dot), but readable together with the legend card.
