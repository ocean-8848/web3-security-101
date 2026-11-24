start: CAMS.inviteA
end: CAMS.laptopC

# ep21 seg1 review

- Camera path: inviteA (L0–L3) → deskC (pans 2.6 s from L4; the parcel slides from A to C and the B gate barrier lifts and drops) → laptopC (L9 to the end, static from about 47.6 s).
- termCards: 代码仓库@16.26s×3.6s, 部署令牌@33.43s×3.6s
- hyperframes check: 0 errors. Warnings left: the starter title-card subtitle line_unread (1.53 s; segbase owns it), composition_file_too_large, and narration 49.34 s vs slot 49.42 s.
- layout_lint: passes (every 0.5 s through 49.4 s).
- Images viewed: 2 contact sheets.

## Notes / unresolved
- Continuity: the end state is laptopC with the hero laptop back on its normal (code) screen. The red desk screens, curves, attacker, dots and token are reset at L9. Only the parcel "作业" and the shrunken question card (top right, under the pill) stay on screen. seg2's first frame should match this.
- The recruiter's "HR" keycard (E05, scale 0.35) is very small at inviteA. It reads as texture, not text.
- The dot legend sits low in the deskC frame (~y 890). Lint passes, but it is close to the caption band.
- The road is drawn from ROAD.u0 to u = 5600 only (A → C). Later segments draw their own.
