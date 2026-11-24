start: CAMS.freezeD (= seg5 end; L0 pans left to delegB)
end: CAMS.wide (static, end card)

# ep23 seg6 ⑥ 撤销委托 — review

## What was built
- The whole airport world is populated, so the start frame and the final `wide` shot are not empty. A: sign, chain, 3 deposit plates, 4 checkpoints. B: cold/warm/3 hot safes, meter, 3 knife switches, pipe + toll clip, address plate + delegate tag (attacker), attacker miniVend, beacon, clock. C: ledger, shield, rack, HSM, withdraw doc, 3 desks + engineers. D: 4 checkpoints, red coin, USDT/USDC + padlocks, BTC/XRP coins, balance, plea docs, user, stamped withdraw doc + seal, two dot matrices (97+82 teal, 43 red). E: user, phone, manual (address book), time lock, whitelist doc. There is also a slate road from A to E.
- Segment-only cameras: `delegClk` (clock + ETH hot wallet + tag + attacker contract, L4–L6), `fixB` (B vault + revoke doc, L7–L9), `signC2` (C chain, left room for code card B, L10).
- L0 question card → L1 red "不安全" → L2 red dashed tag box + line to a mini chain "链上", grey divider "链下 | 链上" → L3 a new coin drops into the address plate and runs along a red line into the attacker contract → L4 source card "Binance 初步报告", clock 20:20 → 00:10 UTC, tag goes to `cleared` at "清零" → L5 "存活 约 3 小时 50 分" → L6 two check cards "暂停提现 ✓" and "撤销权限 ✗" → L7–L10 three numbered plaques fill in (revoke doc grows, meter fills to the limit, the three knife switches toggle one at a time, code card B row 4 turns green) → L11–L14 user counter (phone ✓✓ screen, whitelist, time-lock countdown, address book opens, official-App screen, crossed-out mail) → L15 wide: green line ledger→rack "只为真实订单签名", "拦住赃款" on the red coin at D, "不误伤普通人" on the user, grey "解读" tag → L16 end card (title "托管、充提与合规安全", next "数据与隐私安全").

## Checks
- termCards: `术语卡 1 张：冷却期@53.72s×3.6s`
- `hyperframes check`: 0 errors. Warnings: file size, the segbase title-card subtitle `line_unread`, and `dead_stretch` 46.8–50.9 s (L12; the phone label flashes at about 49.1 s, but the checker does not count it).
- layout_lint: passes.
- Images viewed: 1 contact sheet (9 frames).

## Unresolved / notes
- The L4 clock has no red sector ring. The time span is given by the labels "20:20 UTC" → "00:10 UTC" and "存活 约 3 小时 50 分". The tag is not enlarged to 1.2; the closer `delegClk` camera is used instead.
- The `wide` shot is very small, as the layout intends. Labels stay readable.
- The first frame shows D objects under `freezeD`, but without seg5's own labels or review boxes; the crossfade and title card cover the difference.
