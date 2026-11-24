start: CAMS.C
end: CAMS.E (camera arrives 121.2 s; the build printed no end-hold warning)

# ep09 seg4 签名五字段 · REVIEW

- 术语卡 report：`术语卡 3 张：元交易@11.16s×3.6s，nonce@46.56s×3.6s，摘要@103.64s×3.6s`
- `npx hyperframes check`：0 error。剩余 warning：
  - 标题卡副标题 line_unread（标题卡时长由 segbase 固定 1.6 s，本段改不了）
  - dead_stretch 54.2–58.1 s（L10：复印件滑向 BNB Chain 那台 + 招牌高亮都是 SVG 动作，取样器看不到；kit 已知问题）
  - composition_file_too_large、narration 时长差 0.08 s（脚手架层面）
- `layout_lint`：版面检查通过（每 0.5 s，到 128.4 s）
- 抽帧：2 张图（6 帧拼图 1 张 + L2 单帧 1 张）

## 镜头路线
C →(L0) BC →(L4) bank →(L5) cheque →(L6) bank →(L7) BC →(L8) chqL →(L9) E →(L20) fix →(L23) E（静止收尾）。
BC / chqL / fix 是本段局部镜头（build-story.mjs 里用 L.fit 算，layout.mjs 未改）。

## 与 BRIEF 的差异 / 未解决
- L1 "箭头指向领取合约"：用"领取合约"标签弹出 + 跳动代替箭头。
- L6 复印件只有两张进银行两个窗口（tellerCounter 只有两个窗口），第三张留在支票后。
- L13 "B 锁"用红描边世界标签"B() 的锁"表示，钥匙 A() 平移过去；没有专门的锁物件。
- L19 摘要卡用两张相同的墨底标签"摘要 7f3a…c9"，没有用 hashFunnel 吐卡（漏斗留给 L22）。
- 卡 B 第 2 行改为注释行，卡 C 拆成 6 行以适配卡宽；内容与 BRIEF 第 3 节一致。
- C 区物件是 seg3 终态的静态近似（轮值台未淡出人偶等），若 seg3 末帧不同，交接处可能有细微跳变。
- 右缘陷阱区只放了 emptyLot（零地址）和两张 sigPaper，需与 seg5 的 E 镜头起始画面核对。
