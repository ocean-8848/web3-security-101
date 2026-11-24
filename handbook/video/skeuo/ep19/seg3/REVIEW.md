start: CAMS.delegB (= seg2 end) → L0 pans to CAMS.shopC
end: CAMS.trendC (static; = seg4 start)

# ep19 seg3 「③ 钓鱼套件」自审

- 术语卡 report：`术语卡 2 张：分发者@12.26s×3.6s，EVM@108.13s×3.6s`
- `npx hyperframes check`：0 error。警告：composition_file_too_large（segbase 产物）、line_unread（标题卡副标题 1.54 s，segbase 固定时长）、3 处 dead_stretch（87.6–91.0、97.6–101.0、103.7–106.7 s；这几段的动作都是 #cam 里 SVG 点阵的淡入，取样器看不到，snapshot 可见在动）。
- `layout_lint`：版面检查通过。
- 看图：1 张 contact sheet（0.5 / 4.5 / 16.8 / 31.5 / 46.9 / 62 / 85.5 / 112 s）。

## 镜头
L0 delegB → shopC；L2 splitC；L8 botsC；L10 kitsC；L16 trendC（静止到段尾）。

## 未解决 / 给统筹
- 衔接：seg2 写这份时还是起稿状态。本段在 B 区只放了 delegB 镜头里的 4 件（门牌"你的地址"、委托牌"扫币合约" attacker、攻击者、Permit2 支票 copies 3），没有 B 区点阵；如果 seg2 末帧的门牌文字 / 点阵状态不同，需要对齐。标题卡盖住 0–1.6 s，影响小。
- trendC 镜头框住了木牌 + 机器人 + 点阵，点阵在画面里偏小（每点约 7 px 半径 × 相机倍率），能读但不够醒目；要放大得改 shared/layout 的 DOTS_C 框或 trendC 取景，本段没改。
- 披萨分账用 X6.carry 把 1 块 / 4 块分别朝开发者 / 分发者挪了一段（没送到人手里）。
