开场机位：CAMS.left（seg3 的结尾；BRIEF 没写 seg3 结尾用哪个预设，这里按 seg3 L26 回指 ammPool 推断）
结尾机位：CAMS.oracle（静止，seg5 L0 从这里开始）

# seg4 ④ 三类价格源 · 自审

## 做了什么
- `src/build-story.mjs` 生成 `compositions/story.html`（117.46 s）。只 import `shared/layout.mjs`，没有改它。
- 本段自己定义的位置：INV 浅池 {u 1500, v 1150, ×0.7}、攻击者 {1150, 1250}、LP 凭证 {1700, 1250}、4 封垃圾交易信封。它们都在价格管前方，位于记录仪下方。
- 镜头路线：left → wide（L0）→ rec（自定义，记录仪近景，L1–L6）→ inv（自定义，L7–L11）→ nodes（L12–L16）→ right（L17–L18）→ lp（自定义，L19–L20）→ right（L21）→ oracle（L22–L23，最后约 1 秒静止）。
- 价格管的变化：开场是 seg3 留下的红色池子管，L0 拔掉；L1 接 PIPE.twap；L12 换成 PIPE.oracle；L17 两根管并存，分岔点就是"多源比较"接头；L22 只留 oracle 管。
- 左上角"三类价格源"导航条，逐类点亮；右上角 Inverse 事件卡，带"公开报道"标签；L11 对比卡（✓ 一笔交易 / ✗ 多区块 + 资本）；L23 两问卡，配幽灵指针（错）和闹钟闪动（停）。
- 术语卡报告：术语卡 5 张：提议者@30.51s×3.6s，套利@45.91s×3.6s，偏离阈值@68.6s×3.6s，LP 代币@97.05s×3.6s，不变量@102.96s×3.6s
  （"心跳"在 L15 有配音当场解释，没有出卡。）

## 检查
- `npx hyperframes check`：0 error。剩下 3 条 warning：
  - composition 文件过大，原因是物件 SVG。
  - 标题卡副标题 line_unread（段首标题卡规定 1.6 s）。
  - dead_stretch 4.3–8.2 s：这段时间记录仪的纸带一直在走，动的是 SVG 属性，取样器看不到。kit 已知问题。
- `node ../../tools/layout_lint.mjs .`：版面检查通过。修过一处：L20「AMM 池」与「不变量」两个标签重叠。
- 抽帧共看了 2 张图（9 帧拼图 1 张、3 帧拼图 1 张）。按抽帧结果把「一笔交易推高」「连续多个区块」「垃圾交易」三个标签挪开，不再压在闸刀和攻击者身上。

## 没解决 / 需统筹确认
- 开场机位 CAMS.left 是推断的。如果 seg3 最后停在 CAMS.pool，把 `KIT.camSet(tl, CAMS.left)` 改成 `CAMS.pool` 就行（池子是 broken，红色池子管在开场可见）。
- 右区常驻物件：本段画了 thresholdMeter（默认参数）、clock、knifeSwitch（合上）、三座 tower。seg5 开场如果给量筒用了别的参数，或者画了 COIN、DOC，接缝处会有一点跳变。本段没有画 COIN、DOC。
- 结尾静止画面里还留着两问卡和红色幽灵指针。seg5 开场若是干净的报价机，需要在 seg5 开头淡出，或者在统筹拼接时接受这一下切换。
- Inverse 事件卡第一行出现时，下面已经留好金额行的空位（L10 才填入），L7–L9 卡片下半部是空的。
- LP 一段借用了 INV 浅池（标签换成"AMM 池"），罐子铭牌上写的仍是 INV/ETH，但在这个倍率下只是质感，读不出来。
