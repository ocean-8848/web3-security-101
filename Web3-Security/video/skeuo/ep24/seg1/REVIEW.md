start: CAMS.callB
end: CAMS.homeA (static from ~47 s; L13 only draws the cyan line + label, last action 67.1 s)

# ep24 seg1 review

- 术语卡 report: 术语卡 2 张：外包客服@6.64s×3.6s，SEC@34.6s×3.6s
- `npx hyperframes check`: 0 errors. Warnings: composition_file_too_large (structural, all segments), craft dead_stretch 14.87–18.50 s (false positive: the 69-dot rows fade in, the legends pop and the ledger flashes in that window; visible in the 17 s frame).
- `layout_lint`: 版面检查通过.
- Snapshot contact sheet viewed once (8 frames: 4 / 11.8 / 17 / 27.5 / 40 / 44.5 / 58.5 / 69.5 s). 1 image total.

## Notes
- seg1 is the first segment, so there is no continuity constraint at the start. It starts on callB with all B objects placed.
- End frame (homeA) contains: sign "用户家", user, phone (incoming-call screen), addrPlate "住址", hwWallet, parcel, SIM "手机号", two envelopes, whitelist doc, the "先猜 / 他是真客服吗？" card shrunk to the top right (scale 0.8), and the cyan dashed line plus the "导出的数据" label. The two attackers (ATK_CALL, ATK_DOOR) are deliberately **not** placed, so the answer is not given away. seg2 should not expect them in its first frame.
- WL_A doc: the title is "白名单" with the line "提币地址". The kit `doc` title is fixed at 30 px, so "提币白名单" would overflow a 120-wide sheet. seg2/seg6 should use the same title.
- The dbLedger has no `tag` option, so "客服后台" is a world label (pops at L0, hidden from L8).
- The L4 and L7 red dashed lines are screen-layer curves (S.curve). They cross the desk area or the sign pole, which is acceptable for a dashed overlay.

## Unresolved
- None blocking.
