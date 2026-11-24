开场镜头：CAMS.oracle（接 seg4 L22–L23 的报价机特写）
结尾镜头：CAMS.centerRight（静止约 1 秒；seg6 L0 从这里拉到中区）

# seg5 ⑤ 安全读价 · 自审

## 做了什么
- `src/build-story.mjs` → `compositions/story.html`。物件：E01 vending / miniVend(oracle) / pipe / sorter / timeLock，kit tower ×3 / knifeSwitch / clock / person / magnifier / beacon / chain，E05 thresholdMeter，E07 oddCoin(LUNA)，ep08 twapRecorder / liqBot。
- 位置全部来自 `shared/layout.mjs`。本段另外定义了几个位置：CLK2/CLK3（L18 的另外两只心跳钟）、PULL0（提交者起点）、MAG（放大镜）、Q0/Q1（L26 涌入队伍，按排序器入口推算），还有几个本段专用的镜头：chk、chkM、nodesL、pullL、dockL，都用 `L.fit` 算出。
- 镜头顺序：oracle → chk（代码卡 B，L0–L4）→ meter（LUNA，L5–L10）→ chkM（卡 B 回指，L11）→ center（Venus，L12–L14）→ chk（四个陷阱清单卡，L15–L18）→ nodesL（降级路径，L19–L20）→ pullL（拉取式预言机，L21–L23）→ dock（L24–L28）→ dockL（代码卡 C，L29–L30）→ centerRight（L31，段尾静止）。
- 来源与口径标签：公开报道（下限 0.10、约 1100 万）、示例（0.01、1 小时）、Chainlink API 文档、Pyth 文档、L2BEAT · 截至 2026 年 11 月、Chainlink 文档。

## 术语卡
术语卡 4 张：降级路径@92.72s×3.6s，置信区间@114.33s×3.6s，排序器@118.15s×3.6s，强制提交@131.67s×3.6s
（拉取式预言机由配音当场解释，没有出卡。）

## 检查
- `npx hyperframes check`：0 error。剩下的 warning：标题卡副标题 1.5 s（各段标题卡都是这样）；dead_stretch ×3（动画在 #cam 的 SVG 属性上，取样器看不到，kit 的已知问题）；代码卡 25 px 字号低于 28 px 下限（为了让 50 字符的一行放进卡里）。
- `node ../../tools/layout_lint.mjs .`：版面检查通过。
- 看图 2 张（两张抽帧拼图，共 14 帧）。按截图修了这些：L26 的队伍和 liqBot 原来一开始就露在预言机站和中区画面里，现在先隐藏，用到时再淡入。

## 未解决 / 和 BRIEF 不同的地方
- L31：BRIEF 写的是"timeLock 扇环走完后闸刀合上"。timeLock 在 L2 码头，不在 centerRight 画面里，所以段尾闸刀保持**拉下**（暂停中），和最后一句"暂停清算和新借款"一致。seg6 如果默认闸刀是合上的，统筹请对一下（seg6 L7–L9 本来就会把画面收回到正常状态）。
- L26：BRIEF 写的是"冲向借贷合约"。借贷合约离 L2 码头很远，所以画成机器人和用户在码头里涌向排序器入口；L1 强制通道那头的两个人先到。
- L20：清算机器人"不被卡住"改用标签"清算不会全部回滚"表达，nodesL 画面里看不到中区的机器人。
- L13：LUNA 硬币用屏幕层的小金币飞进投币口，不是 oddCoin 实物。
- 码头 L27 的队伍左边那个人离画面左边缘很近，看着略挤，版面检查没报。
- L18 三只心跳钟只写"喂价 A / B / C"，没写具体心跳时长，因为讲稿没给数字。
