start: CAMS.hotB
end: CAMS.delegB (static from ~49 s; matches seg2 cam0)

# ep23 seg1 自审

- 术语卡 report：`术语卡 2 张：热钱包@4.8s×3.6s，EIP-7702 委托@56.94s×3.6s`（无推迟、无偏短）
- `npx hyperframes check`：0 error（Lint 1 警告 composition 文件长；Runtime 1 警告音频 67.98 vs 68.04；Craft 2 警告：标题卡副标题 1.53 s 读不完（segbase 标题卡固有）、25.6–29.6 s dead_stretch（实际有 KIT.clock 指针转动 + 信封 + 告警灯，检测未计入））
- `layout_lint`：版面检查通过
- 看图：2 张拼图（14/22/34/45/60/67 s，及 14/67 s 复查）

## 做法
- B 区：冷钱包、温钱包（0.8 包层）、三只热钱包（0.65 包层）、三把熔断闸刀（0.5 包层）、告警灯、时钟、热钱包地址门牌 + 委托挂牌（on:false，L12 tagDrop）、攻击者合约 miniVend、真币 oddCoin（L13 从左飞来停在门牌左侧半空）。
- 出口管：每只热钱包一根短管 → 汇流管（沿 v）→ 出口（沿 u，tollClip 夹在 L.TOLL）。L2 每只 3 封红信封沿管道飞出画外；L4 ETH 绕闸红虚线 + 3 封信封沿绕行路线飞出。
- 点阵 63（9×7）在 DOTS_B，L7 红虚线外框。
- 题卡、"保管者 / 检查站"剪影是屏幕层；L14 题卡缩到右上胶囊下（scale 0.8），两块剪影放在右侧空白区（左侧会压到热钱包）。

## 未解决 / 注意
- tollClip "变绿" 用绿色标签"暂停提现"表达，物件本身没有绿色状态。
- 段尾题卡与两块剪影留在画面上，seg2 开场没有它们，靠交叉淡化过渡。
- 剪影不在画面"左右两侧"，而是并排在右侧（避让物件）。
