start: CAMS.casesD (seg4 ends on it), moves to CAMS.guardE at L0
end: CAMS.rolesE (static, matches seg6 cam0)

# ep19 seg5 ⑤ 拦在每一步 · REVIEW

## What was done
- World: stone road (native SVG), all of zone D (for the opening casesD frame), and zone E's defence objects (phone ×1.4 wrap, cheque 1.3, shield, addrPlate + delegateTag, scale, checkpoint, whitelist plate, hourglass, fake USDT coin, two address plates, magnifier, two ledgers, standing doc, user). The four action icons and their barriers are native SVG.
- Segment-only cameras: `walletR` and `exchR` (walletE / exchE groups fitted to x 640–1830), which leave the left side free for code card A/B and the listing checklist.
- L0 casesD→guardE; L1 two green check cards; L2 icons light in order; L3 barriers drop + green glow (key frame); L4–L11 wallet layer (hex→decoded fields, cheque fields green/red, "无法解析" screen, shield + 3 warnings, delegate tag red→"审计过的实现" + web letter bounced, scale simulation + card B, domain gate drops on a fake-domain letter, amount slot → "额度 100 USDT"); L12–L17 exchange layer (whitelist + cooldown sand, address head/tail compare, zero-value rows folded, fake USDT bounced, listing checklist, risk-list rows); L18 camera to rolesE, doc "官方从不要求签名领取" grows.

## termCards report
术语卡 4 张：交易模拟@44.14s×3.6s，DApp@53.55s×3.6s，白名单@59.84s×3s，冷却期@62.99s×3.6s；注意：冷却期 推迟 1.38s

## Checks
- `hyperframes check`: 0 errors. Remaining warnings: title-card subtitle line_unread (segbase default), 3 × dead_stretch (motion inside #cam SVG is invisible to the sampler, a known kit limitation), and the composition file size.
- `layout_lint`: passed (sampled every 0.5 s to 92.2 s).
- Images viewed: 2 contact sheets + 1 single frame (91.5 s).

## Unresolved / notes for the coordinator
- seg4 was still a blank starter when this was built, so the opening casesD frame uses the D objects in their BRIEF default states (stall "↑", pool 新币/USDT, burnBox 貔貅盘, mintPress 隐藏增发, boards SQUID/LIBRA/979 个) with no labels. Recheck the seg4→seg5 seam once seg4 is done.
- BRIEF lists seg5 as ending on exchE. I ended on rolesE so the last frame matches seg6's cam0. The roleBoard (ROLES_E) is **not** in this segment's world. If seg6 shows it at frame 0, add it here (or seg6 grows it). The doc label "官方从不要求签名领取" stays visible at the end.
- BRIEF L16 "D 区 burnBox 远景闪红框" was skipped because zone D is off-screen in exchR. The checklist cards carry that line.
- BRIEF L8 asked for the delegate request to come from a browserWin. It is drawn as a red letter with the label "✕ 网站发起". L10's fake site is likewise a red letter, labelled "仿冒域名 · 拦下".
