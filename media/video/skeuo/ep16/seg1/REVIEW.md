start: CAMS.upgradeA
end: CAMS.deskA (static)

# ep16 seg1 review

- Camera: upgradeA (L0–L4) → A (L5–L7, so meter + signal + rack are all on screen) → deskA (L8 to end, static).
- termCards: 术语卡 4 张：Fusaka@5.78s×3.46s，客户端@9.39s×3.6s，slot@17.15s×3s，验证者@20.3s×3.6s；注意：验证者 推迟 1.56s
- hyperframes check: passed, 0 errors (warnings: file too large; starter title subtitle shown 1.53s, which segbase controls).
- layout_lint: 版面检查通过（每 0.5s 一次，共检查到 48.7s）
- Images viewed: 2 (one contact sheet of 8 frames, one frame at 37s).

Notes / deviations from BRIEF
- L6–L7 stay on CAMS.A instead of deskA, because L7 needs the rack and meter. deskA starts at L8.
- The question card sits top-right from L6 (the event card leaves at L6). At L9 it shrinks to 0.88 rather than moving: the code card takes the top-left, and a smaller scale would push text below the 28px floor.
- L10 strike-through goes on the code card's row 2 (gray line) and the ledger entry fades to 40%. There is no line drawn on the ledger page itself.
- L7 "假设" is a gray world label beside the meter. The meter level really drops to 7/12 and refills to 9/12 off-screen during the L8 camera move.
- Main chain is n 5 at CHAINA +90u (b0–b3 match the n 4 positions): b3 is the red dashed empty slot and b4 fades in at L3.
- Unresolved: in deskA the top of the main chain (blocks #2/#3) is cut off at the top edge behind the code card. It's world context, not flagged by lint.
