start: CAMS.quizA (= seg1 end; L0 pans left to signB)
end: CAMS.delegB (static; seg3 cam0 should be delegB, then move right to shopC at L0)

# ep19 seg2 review

- termCards: 授权@5.47s×3.6s，Gas@39.27s×3.6s，链下签名@44.39s×3.6s，NFT@53.36s×3s，Permit2@56.52s×3.6s，EIP-7702@61.57s×3.6s，owner@91.95s×3.6s
- hyperframes check: 0 errors. The warnings left are line_unread on the default title-card subtitle (segbase), composition_file_too_large, clip_media_fit (narration 124.48 s vs slot 124.54 s), and dead_stretch (kit SVG animation).
- layout_lint: passes (checked every 0.5 s up to 124.5 s).
- Images viewed: 2 contact sheets (9 frames + 4 frames).

## Notes / deviations
- Continuity: the A objects visible at the end of seg1 (dispatchDesk, both addrPlates, attacker, clock) are rebuilt statically. Labels 真实收款方 / 投毒地址 / "?" start shown and fade out at L0. The seg1 quiz card is not reproduced; the title card covers 0–1.6 s.
- L4: the doc has no flip helper, so the flip is a GSAP scaleX 0→1 pulse plus a red world label "背面：同意交出房门钥匙". The key flies to a red "持单人" label beside the parcel.
- L11: "the attacker submits it on chain" is shown as a copy of the permit cheque sliding onto the chain end, labelled "别人代为提交". The attacker person does not walk over.
- L25: on delegB the phone is out of frame, so the "可信设备" is a kit hwWallet next to the delegate tag. Its screen switches from hex to the spender / 额度 / 期限 fields, and a magnifier slides in.
- L17 key frame uses a segment-only camera, loginB (phone + approve/permit cheques + chain + gas pump).
- In vaultB (L20) the owner→攻击者 label and the 5547 万 dot legend nearly touch. Lint passes.
