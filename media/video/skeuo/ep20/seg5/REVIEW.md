start: CAMS.cdnC (= seg4 end preset, BRIEF section 2)
end: CAMS.toolF (static, = seg6 start)

# ep20 seg5 review

- termCards: 冷钱包@7.05s×3.6s，Docker@20.66s×3.6s，会话令牌@26.74s×3s，S3@29.89s×3.6s，DELEGATECALL@42.26s×3.6s，实现合约@51.44s×3.6s；注意：S3 推迟 0.79s
- `npx hyperframes check`: passed, 0 errors. Remaining warnings: composition_file_too_large, and line_unread on the segbase title subtitle (it is on screen 1.54 s, which is the standard title-card length).
- `layout_lint`: passed (sampled every 0.5 s up to 117.5 s).
- Images viewed: 4 contact sheets.

## Camera path
cdnC → (L0, pans through D/E) msigF → (L3) devA → (L6) hostC → (L7) signF → (L11) coreF → (L12) msigF → (L17) oneF* → (L20) toolF2* → (end of L23) toolF.
\* These are segment-local cameras: `oneF` frames the shared front with all five signers; `toolF2` is toolF shifted left so code card B and the hash-comparison inset fit on the right.

## Notes / unresolved
- Continuity: seg4 had not been built when this segment was written. The C-zone objects use default states (bucket, 3 rpc, CDN sign, brass API Key, hourglass, magnifier, hash log), so seg4's last frame could differ in details: key colour, a beacon, or the hourglass being visible. Check this when seg4 is done.
- The "small window C" in L12/L15/L22–L23 is a screen-layer inset card (a bucket SVG plus a red/teal JS file), not a camera cut. The three magnifiers in front of edge nodes in L23 are also drawn inside the inset.
- L17's "the rest of the frame dims" is not implemented. A camera push to oneF replaces it.
- Bystander browsers (L8) and the researcher (L13) are check cards, not world objects.
