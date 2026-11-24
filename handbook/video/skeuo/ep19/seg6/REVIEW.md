start: CAMS.exchE (= seg5 end; moves to rolesE at L0)
end: CAMS.wide (= CAMS.world, static under the end card)

# ep19 seg6 REVIEW

- termCards: `术语卡 1 张：地址簿@58.65s×3.6s` (nothing deferred or short)
- hyperframes check: 0 errors. Warnings: composition_file_too_large (shared by all segments), text_below_floor (small world labels / phone screen text), dead_stretch 41.6–45.45s (L8: the board is static while the line is read; extra bump/flash added but the checker still flags it)
- layout_lint: 版面检查通过
- End card: title "用户侧诈骗" (short topic name, overrides the long script title), line "每次确认之前，先看清你在签什么", next "前端、DNS 与供应链安全"

## Camera path
exchE → rolesE (L0–L1) → kitE (segment-local: role board + new "普通用户工具台" right of it, L2–L8) → quizA (L9–L11) → bookA (segment-local: PHONE_A + plates + magnifier, L12) → wide (L13–L14, static)

## Notes
- All five zones are placed from shared/layout.mjs so the wide shot is populated. Objects are in roughly their end-of-episode state (they are not synced with what seg1–5 actually animate).
- Segment-local objects (all to the right of ROLES_E, X ≈ 6950–7400): 2 cheques (crossed out = 撤销), a new coin (卖出测试), phones 日常 / 大额 (wrap 1.2), old/new addrPlate on the road with a letter walking between them. The A-zone timeline (L11 key frame) is native SVG in front of the plates, with two small letters.
- roleBoard: 3 hooks, blank cards, tags "看清再签 / 能否解码 / 首尾比对" hidden at t=0 and shown per role.
- Unresolved: the phone screen fields (L2 / L3) are small at kitE scale (about 0.9); the world labels carry the meaning. At the wide shot the world is very small (overview only), and the zone pills are what you read.
