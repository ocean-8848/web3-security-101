start: voteE
end: world (= wide)

# ep16 seg6 自审

- 术语卡 report：`术语卡 1 张：finalized 标签@8.38s×3.6s`
- `npx hyperframes check`：0 error。剩余警告：标题卡副标题 line_unread（segbase 标题卡 1.6 秒，非本段可控）、composition 文件行数、旁白 67.28s vs 槽 67.34s。
- `layout_lint`：版面检查通过（每 0.5s，到 67.3s）。
- 看图：2 张 contact sheet（10 帧：3.5/10/17/24/32/37/45/50/55/60.5 + 末帧）。

## 实现要点
- 本段自建全部五个区的物件（A–E 主要物件 + 石板路 extraSvg），全景镜头里五区都有东西；点阵、份额阶梯底座省略。
- 段内镜头：`deskA6`（A 入账台近景，右侧让给卡片）、`replayA`（A 转台/机柜/参与率/主链/入账台/信号柱/检查点/告警灯，L8–L11 一镜到底，两条红虚线都在这一镜里画）。
- 代码卡 A 为放进 620px 改短：`if (head - blk >= N)` / `if (blk <= get("finalized"))`，各拆成两行（credit 单独一行），行尾 ✗ / ✓ chip。
- L1–L2 用"入账条件 · 每条链单独定"卡（五条链类型 + 以太坊 finalized chip、PoW 小链 rentCost chip），代替 BRIEF 写的"代码卡 A 第 4 行 / 卡 B 第 2 行"。
- L7 用 `CAMS.E`（闸刀不在 voteE 里）。L8 直接切 `replayA`（不用 upgradeA，转台/机柜/表都在镜头里）。
- 主链用 n 5，原点 +90u，第 5 块开场隐藏，L10 长出。

## 未解决
- 角色条（交易所/节点运营/普通用户）在 deskA6、voteE 镜头里压住画面上沿的主链块/排序器一角（lint 不报，可接受）。
- replayA 镜头偏宽，右缘露出 B 区牌子；物件较小。
- L12 全景里资源分类板的 bump 看不出（镜头 ~0.13 倍），靠屏幕层六张卡表达。
