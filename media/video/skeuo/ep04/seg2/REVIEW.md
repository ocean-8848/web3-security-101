# REVIEW · ep04 / seg2「② 交出控制权」

## 做法
- `node src/build-story.mjs` 生成 `compositions/story.html`。物件：kit（person、ledgerBook、chain、magnifier）、ep01（vending、miniVend、pipe、letter、signBoard、flashDesk）、ep02（rollCounter）、ep03（contractMachine、frameStack）、ep04（callbackArm、tellerCounter）。只 import，未改任何 kit / kit-ext。自补 `src/props.mjs`：账本台、硬币、NFT 卡、窗口灯。
- 世界坐标抄 seg1 `src/layout.mjs`（Bank、调用栈、账本台、攻击合约、弹簧臂），新增物件都放在 seg1 没用的位置，见 SPEC.md。

## 自审（逐句中点 + 0.8 s + 段尾抽帧，共三轮）
第一轮发现并修掉的：
- Bank 与调用栈镜头倍率太小（物件只占 1/4 画面）→ Bank 1.2、调用栈 2.0。
- 六个接收方间距 310 互相压叠，标签串在一起 → 间距 460，每个出口单独镜头，换出口时淡出上一处标签。
- 前提牌两块在屏幕上重叠 → 改用屏幕地面点并排；说明标签一上一下错开。
- 放大镜没对准柜台账本 → 按账本锚点反算位置；"账本 · 余额 100"与"还是 100"改为切换。
- 比喻层物件在回到 Bank 后仍出现在前提镜头左缘 → L10 淡出。
- L19 信封飞向画面外 → 改成从接收方飞回管口并淡出。
- 链区：木牌挡住机器正面、标签与硬币标签重叠、TriggerSmartContract 标签出画 → 木牌移到机器左侧，结论标签放机器右侧两行，缩短文字，镜头左移。
- "现实：两个窗口同时接待"压到胶囊 / 关键词卡 → 移到 1 号窗口灯左侧，同时撤掉"比喻"关键词卡（印章已标明比喻）。
- 闪电贷借款人在出口 6 镜头里压到字幕区 → L21 淡出。

## check
- 无 error。保留的 warning：标题卡 1.6 s（按 PIPELINE 段首规则）；116.5–119.8 s dead_stretch（TRON 段"不执行 fallback"的停顿，动作在 #cam 里，取样器看不到）；文件行数大。

## 仍存在的问题
- 柜员在玻璃后面颜色偏淡，只靠"柜员"标签认出。
- 出口 3 的 ERC-777 钩子用弹簧臂缩小版，伸出后像一根红色梯子，形意一般。
- 链区机器上的铭牌"合约"字小，"同一份代码"靠标签说明。
- 声音只测了时长和音轨存在，没有人耳试听。
