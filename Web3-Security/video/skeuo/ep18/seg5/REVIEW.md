start: CAMS.tiersE
end: CAMS.flowE (static from ~L16; zone E, seg6 starts in E on rolesE)

# ep18 seg5 review

- termCards report: 术语卡 5 张：热钱包@8.63s×3.6s，温钱包@18.26s×3.6s，水位@30.41s×3.6s，风控引擎@62.65s×3.6s，白名单@78.97s×3.6s
- `npx hyperframes check`: 0 errors. Warnings: composition file size; narration 93.24s vs slot 93.32s; title-card subtitle shown 1.53s (segbase title card); dead_stretch 43.62–46.89s (L10, rack turns red + label + flash are in that window, so the checker still flags it).
- `layout_lint`: passed.
- Snapshot: 1 contact sheet (8 frames: 4.5 / 16 / 33 / 45.5 / 53.5 / 69 / 81 / 91.5s).

Shots: L0–L7 on tiersE (users send letters to the hot safe; tier labels; cold dots plus signers with hwWallets; timeLock; HSM; meter fill; hot safe turns attacker; pipe flow plus tollClips). L8–L15 on hsmE (question cards; rack turns attacker; red doc moves into the HSM and the seal stamps while "✓ 私钥不可导出" stays lit; dashed "这里" gap; shield grows; code card B rows 1–3 and 5 with curves). L16–L20 on flowE (doc, ledger, 4-step bar, ticks on the shield, card B row 4, signers plus phone, chain plus magnifier "✓ 一致").

Unresolved / notes:
- BRIEF says seg5 starts in D and moves to E at L0. The starter's cam0 is tiersE and seg4 has no `ends static` comment, so this segment starts on tiersE as the starter set it. Check this against seg4's end.
- At flowE, code card B (L16–L19) covers the top of the hot safe and the meter. They are only background there.
- In L20 the chain and magnifier are small, scaled to 0.45 and 0.6.
- "用途：大额转出" on the withdrawal slip is illustrative wording.
