start: CAMS.valid
end: CAMS.bridge (static from ~59.6s)

# ep12 seg1 review

- 术语卡 report: 术语卡 2 张：验证者@15.56s×3s，门限@18.7s×3.6s；注意：门限 推迟 1.73s
  (门限 is pinned to L3 as BRIEF asks, though the word is first spoken in L10. The delay is the one-card-at-a-time queue behind 验证者.)
- hyperframes check: 0 errors. Warnings:
  - composition_file_too_large and clip_media_fit: both come from the base template.
  - line_unread on the title sub: comes from the segbase title card.
  - dead_stretch 4.12–8.62s: the slow camera move valid→bridge (3.2s→8.0s) runs inside #cam, which the sampler can't see.
- layout_lint: passed.
- Contact sheet viewed (1 image, 7 frames: 13/22/34/41.8/46.5/53.5/61.5s): letters cross the bridge, the majority rings, the Sky Mavis frame and plates, the red keys with the red meter and big "2", code card row 2 curve to the frame, keys flying to the booth, and the end on the bridge with the curtain and "凭什么相信？" all read correctly.

Shot notes:
- Camera path: valid → (L0, slow) bridge → (L2) valid → (L13) bridge.
- Meter: fills to 5 at L3, drains at L5, refills at L9, then a red overlay (mtrRw) fades in.
- Booth: KIT.broke (red dashed) at L11. The bridge object has no barrier gate, so "栏杆抬起" is not shown.
- The small keys use the kit key's normal brass colour, not teal.

Unresolved: none blocking.
