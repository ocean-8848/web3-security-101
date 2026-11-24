start: CAMS.linkB (same as seg2 end; B objects placed, so the frame under the title card is not empty) → L0 to counterC
end: CAMS.staffD (static, = seg4 cam0)

- termCards: 术语卡 3 张：运营商@5.82s×3.6s，验证器 App@32.87s×3.6s，暴力破解@50.65s×3.6s
- hyperframes check: 0 errors (warnings: composition file length, narration 0.06 s shorter than slot, title subtitle under its read floor; all come from segbase defaults)
- layout_lint: 版面检查通过
- Images viewed: 3 contact sheets (12 + 3 frames)

Fixes made after review: event cards shortened (they overflowed on the right), 粉丝 label moved off the fan checkmarks, 版权侵权 label timing (it had stayed on until L18), the 50-dot matrix now hides before the move to staffD.

Not resolved:
- The four entry plaques in postD (换卡 / 暴力破解 / 交接关掉 MFA / 冒充官方) are native SVG text. At postD scale they are too small to read. Counter-scaled labels would overlap each other at the current 192 px spacing. A fix would mean stacking them, or showing them as screen cards.
- The simCards (simA, simA2) are small in counterC and staffD. They can be recognised by colour, not by detail.
- The browserWin title bar always reads "官方 X 账号". The account-name swap (Vitalik / Mandiant → Phantom in red) is done inside the page.
