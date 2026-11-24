start: CAMS.C
end: CAMS.D (static from ~127.9s; seg4 cam0 = D)

# ep10 seg3 review

- termCards report: `术语卡 4 张：EIP-1967@28.48s×3.6s，映射@40.06s×3.6s，ERC-7201@88.17s×3.6s，函数选择器@102.63s×3.6s`
- `npx hyperframes check`: passed, 0 errors. Warnings: composition_file_too_large (kit-generated), clip_media_fit (narration 132.78s vs slot 132.84s), text_below_floor (code-card rows at 22–26px, mostly `#cI` which is 22px so `collate_propagate_storage(bytes16)` fits in 530px).
- `layout_lint`: 版面检查通过.
- Images viewed: 2 (contact-sheet-1.jpg, contact-sheet-2.jpg from one snapshot, 16 frames).

## Camera route
C → cab (L0) → CD (L5) → eip (L6–L7) → cab (L8–L19) → keys (L20–L23) → D (L24, static end).

## Notes / unresolved
- C-zone stands are rebuilt from BRIEF/layout (seg2 source not read). The UUPS stand uses the vending's built-in `impl` module, not a separate `coreModule`. If seg2's last frame shows a coreModule or lever there, the seg2→seg3 cut may show a small difference.
- L4: "实现地址" and "管理员" on drawer 0 are offset, not stacked, to keep layout_lint clean. Both are red and flash.
- L14: the empty balances drawer is drawer 3, the new mapping base after the shift. The brief asked for a red dashed box + ✕; this uses a red drawer outline + a "余额：空 ✕" label.
- L17: the three crossed-out icons are red mini check cards (删除 / 换位 / 改类型), not pictograms.
- L18: reserved slots are shown as drawer 4 marked green "预留空槽". No extra drawers were added.
- L23: the "magnifier over the two lists" is a screen-layer SVG magnifier, with the conflicting rows highlighted via `hot`.
- L15–L19: the rule cards on the right partly cover the far keys/small vending in the cab framing. Lint does not flag this.
