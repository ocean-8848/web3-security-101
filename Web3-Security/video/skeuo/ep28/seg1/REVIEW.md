起始镜头：CAMS.daoA
结束镜头：CAMS.hallA（静止）

# ep28 seg1 自审

- 术语卡 report：`术语卡 3 张：回调@16.15s×3.6s，重入锁@27.29s×3s，编译器@30.44s×3.6s；注意：编译器 推迟 1.05s`（推迟是因为它要等重入锁卡结束，仍落在 L6 内）
- `hyperframes check`：0 error。剩 3 条 warning，都来自 segbase 或音频，本段改不了：composition_file_too_large；clip_media_fit（差 0.06 s）；line_unread（标题卡副标题停留 1.53 s）
- `layout_lint`：版面检查通过
- 看过的图：1 张 contact sheet（时间点 5 / 17.5 / 31.5 / 40.5 / 47.5 / 62.8 s）

## 镜头
L0–L3 daoA → L4–L6 curveA → L7–L8 penpieA → L9–L12 hallA。展柜里的三台售货机抬到 VITRINE_FLOOR。点阵 60、70、27 点留在 A 区，三组图例写"事故名 · 年份 + 金额"，L10 收起图例，给题卡腾位置。

## 和 BRIEF 不同的地方
- 展柜底座铭牌只写事故名（The DAO / Curve / Penpie）：底座蓝牌宽 100，放不下"· 年份"。年份写在点阵图例和事件卡里。
- hasp 没有 `state: broken`。破锁的画法是原生 SVG：红色虚线圈、裂纹、红叉。hasp 立在一根小钢杆上（z 90）。
- 第三枚币是本段自己加的位置：A_COINS[1] 再偏移 (+60, +40)，用来表现回调里"再取一次"。
- 参观路线只画了 v = 0 上 u 1000–1760 这一段，指向入口牌。原因是整条 v = 0 线会穿过 DAO 柜前面的币和账本区。
- 结尾题卡缩到 0.75，放在右上胶囊下方，保留到段尾。seg2 的首帧不会有这张卡，靠交叉淡化过渡。
- "1 点 ≈ 100 万美元"的说明删掉了：它和 Curve 点阵挤在一起。

## 未解决
- 没有。
