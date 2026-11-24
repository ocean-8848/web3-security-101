start: CAMS.ruleA
end: CAMS.ruleA (static from ~98.4s; seg4 cam0 = ruleA)

# ep14 seg3 review

- termCards: 术语卡 3 张：Circom@8.25s×3.6s，信号@17.63s×3.6s，Merkle 根@70.99s×3.6s
- hyperframes check: 0 errors. Warnings: composition_file_too_large (generated file), line_unread on the title-card subtitle (comes from the segbase title card, not the shots)
- layout_lint: passed (every 0.5s, to 100.6s)
- Images viewed: 2 contact sheets (12 frames total)

## Camera route
ruleA (L0–L1) → codeA (segment-local camera, A objects on the left, code card A on the right, L2–L3) → bitsA (L4–L8) → ruleA (L9–L10) → tornR (segment-local camera, Tornado corner on the left, card A on the right, L11–L16) → ruleA (L17–L20, ends static)

## Continuity with seg2
- The rule doc is 240×260, the same as in seg2. Frame 0 shows the end state of seg2: line 5 is boxed in red as "漏写", answer-sheet row 5 has all 4 cells filled in red, the sheet carries a green check, and the grader shows a green lamp with "通过". The sheet and lamp reset during the first camera move (L2).
- The Tornado-corner objects (two safes, gold dots, merkleTree, manual, bug list, team) sit just above the ruleA framing. They are hidden at t=0, fade in at L11 and fade out after L17, so they do not show in the A shots. Seg2 and seg4 may still show them at the top edge of ruleA.

## Unresolved / notes
- The cell labels b0…b4 and the red "30" are drawn as native text on the front face of the byteBlock. At bitsA they are small but readable.
- The "形式化验证" small doc (L19) sits partly behind the answer sheet. It is readable in the snapshot.
- No object uses the id `cam` or `root`.
