start: CAMS.B
end: CAMS.C (static, last move ends ~106.7s; seg3 cam0 = C)

# ep10 seg2 review

- termCards report: `术语卡 1 张：存储冲突@106.26s×3.6s` (at = LS[19] + 2.4: the word itself is spoken at ~108.2s, too close to the segment end for a 3.6s card, so the card and the 存储冲突 keyword come in ~2s early, during 所以都有同一个风险)
- hyperframes check: 0 errors. Remaining warnings:
  - line_unread on the title-card subtitle (starter / segbase title card, 1.54s on screen) — not touched
  - dead_stretch 83.0–86.5s: L16 has uc1 gears + uvend bump there, but they are SVG attribute moves inside #cam that the sampler can't see (known kit limitation)
  - composition_file_too_large (generated file)
- layout_lint: 版面检查通过
- Contact sheet (9/21/49/57/74/87/101/109s) checked: B anatomy delegatecall (cyan curve + red curve to drawer 0, 0 号槽 100→90), L10 V1 out / V2 in, L11 hourglass + crossed timeLock, trans / uups / beacon stands, final C frame with three red curves meeting at 存储冲突.

## Unresolved / notes
- UUPS L15–L16: the 0.25-scale coreModule inside uvend's open maintenance door is small at k 1.4; the lever pull / red lever-missing frame read mainly through the labels 升级函数在实现 → 再也不能升级 (plus the door padlock bump).
- L4 drawer values 100 → 90 are illustrative (no fact claim).
- Beacon vault "机芯换色" is done as V1 → V2 labels + gears spin on all three vaults (E01 impl only has blue / attacker-red skins).
