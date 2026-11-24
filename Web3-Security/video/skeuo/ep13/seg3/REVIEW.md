start: passB
end: driftB (static from ~122.5s)

# ep13 seg3 review

- Cameras: passB → passNear (L0–L3, segment-only) → passB2 (L4–L5, segment-only) → yardB (L6–L13) → driftB (L14–L20). The two local cameras keep the left side clear for the code card.
- Term card report: 6 cards. owner@6.61s×3.6s, 判别字段@22.6s×3s, 跨程序调用@25.75s×3.6s, PDA@72.49s×3s, bump@75.64s×3.6s, 持久 nonce@111.96s×3.6s. 跨程序调用 is pushed back 0.41s and bump 1.1s.
- `hyperframes check`: 0 errors. The only warning is composition_file_too_large (1885 lines, caused by mintPress and the other SVGs).
- layout_lint: passes.
- Images viewed: 3 contact sheets.

## Changes from the brief
- The hero passport ps1 uses fields ["owner","签名","类型"]. L1, L2 and L3 tick boxes 0, 1 and 2 in turn. The brief says L3 ticks box 2 (类型), but it also needs a box for the L2 signature check, so I changed the fields to fit.
- L3: ps2's title changes to "另一类型" and it gets the label "冒充", then `KIT.broke`.
- L4: the CPI target is an E01 miniVend (plain, scale 0.5) placed in front of the program machine (segment-only position MINI), connected by an E01 pipe. It is labelled "program id：调用者传入" and gets a "核对 ✓" label.
- L10: the source line is a row inside the Cashio event card ("来源：rekt.news · CertiK"), not a separate source card, so the two cards don't sit on the same spot.
- L12: shown with the small card "还要做" (two rows). The machine's readout flip is skipped because the machine is not in the yardB frame.
- L19: the "描述来自 Drift 自身调查 + 未经独立验证" line is added as a row in the Drift event card.
- Bug fixed: I had given the addrPlate the id `root`, which clashed with index.html's `#root`. `grow` then set the whole stage to scaleY 0, so the frames before L8 came out blank. It is renamed `rootP`. Later episodes should avoid the ids `root` and `cam`.

## Unresolved / minor
- The hidden rows in the event cards (evC, evD) still take up space before they appear, so the card shows a blank gap.
- The L8 red dashed line and red X between the end of the rope and the trusted-root plate are drawn but small. I did not confirm them in a frame (image budget).
- After `hot`, a code-card row keeps its pink background. That is acceptable.
