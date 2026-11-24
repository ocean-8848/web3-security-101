# SPEC · ep07 / seg1「① 没收到的钱」

GOAL:    看完能说出"Qubit 桥没收到 ETH 却记了一笔存款"，以及"低级 call 一个没有代码的地址，返回 true 且返回数据为空"。
OUTPUT:  HyperFrames，1920 × 1080，30 fps
TIME:    56.66 s；配音是时钟（L0 从 1.6 s 开始），无音乐。源：`src/build-story.mjs` → `compositions/story.html`（`node src/build-story.mjs`）。

## 世界坐标「收发站」（本集固定，seg2 起对齐它）

常量全部在 `src/layout.mjs`，后面各段 `import { … } from "../../seg1/src/layout.mjs"`。投影与 kit 相同：`Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866)`。我们的合约在世界原点。屏幕上：左下是调用码头，中间是我们的合约，右边是登记台；跨链桥在很远的上方（屏幕 y ≈ −1100…−1400）。

| 东西 | 世界 (u, v) | 备注 |
| --- | --- | --- |
| 我们的合约（ep01 `vending`，sign "OUR CONTRACT"） | VEND (0, 0) | wlab "我们的合约" |
| 发货登记台（ep07 `dispatchDesk`） | DESK (330, 170) | +u 侧；entries[0] = ghost "+ 转账"（seg1 段尾已写出） |
| 码头回执签（`returnTag` scale 1.6） | TAG_DOCK (−175, 120) | 回程口；seg1 L10 飞进登记台投入口后隐藏 |
| 快递员（建议） | COURIER (120, 330) | seg2 比喻镜头 |
| 管道总管 | 从售货机 −u 面 (−100, 0, z 110) 出发 → u = HEADER_U (−300) 处沿 v 的集管 → 四根支管沿 −u 到目标 | PIPES.token / lot / bomb / gas（相对 VEND 的折线），id `ptoken` `plot` `pbomb` `pgas` |
| token（ep01 `miniVend` token） | DOCK.token (−700, −600) | |
| 荒地 = 无代码地址（ep07 `emptyLot`） | DOCK.lot (−760, −210) | 支管 `plot` 最后一段落在荒地上；段尾地块上有红虚线空包裹 `pc`（scale 1.5，lot + (50, 10)） |
| 返回数据炸弹（ep03 `contractMachine` name "C"） | DOCK.bomb (−800, 220) | |
| gas 不足（ep01 `miniVend` plain） | DOCK.gas (−700, 720) | ep03 `gasGauge` 在 GAUGE (−560, 840) |
| 四种结局（seg1 L13） | FATE.liar (−500, −500) `oddCoin` liar；FATE.fail (−520, 300) `returnTag` false+红叉；FATE.stall (−370, 880) kit `hourglass` | 段尾都在场上 |
| 代币陈列架（建议，seg3） | SHELF_ZONE (900, 700) | |
| 拍卖场（建议，seg4） | AUCTION_ZONE (1700, 1500) | |
| 跨链桥（ep01 `bridge`） | BRIDGE (1700, −2000) | 近岸 −u = 以太坊，远岸 +u = BNB Chain |
| 桥 · 以太坊侧（`contractMachine` "ETH"） | BR_ETH (1260, −1800) | 桥头前方 |
| 桥的 ETH 金库（kit `hotWallet` gold:false） | ETH_VAULT (880, −1830) | 段内门已打开（空） |
| 以太坊链（kit `chain` n 3） | CHAIN_ETH (1150, −2250) | |
| 桥 · BNB Chain 侧（`contractMachine` "BNB"） | BR_BNB (2150, −1800) | |
| BNB Chain（kit `chain` n 3） | CHAIN_BNB (2250, −2250) | |
| qXETH 堆（16 枚青蓝币） | QX_PILE (2150, −1610) | |
| 借贷池（建议，seg2 L27） | LEND_POOL (2520, −1560) | seg1 未建 |
| 零地址荒地（`emptyLot` scale 0.8） | ZERO_LOT (1140, −1510) | seg1 没挂"零地址"标签（seg2 L18 再揭示） |
| 桥的调用管 | BR_PIPE（相对 BR_ETH，从正面落到 ZERO_LOT） | id `brp` |
| 桥的回执签（`returnTag` empty scale 1.8 + 绿勾） | TAG_BR (1420, −1560) | seg5b L8 可回到这里 |
| EVM 框（L9 地面虚线框） | EVM_FRAME u −900..150, v −360..230 | L10 已淡出 |

镜头用 `fit(世界包围盒点, 屏幕矩形)` 自动取景（`CAMS`）：open0/open1 桥全景 → eth（金库 + 以太坊侧，k≈1.08）→ bnb（BNB 侧 + qXETH 堆）→ br3（桥全景偏左，右侧金额卡）→ call（以太坊侧机器 + 零地址荒地 + 回执，k≈1.1）→ dock（售货机 + 荒地 + 回执，k≈1.4）→ evm → desk（加登记台）→ wide（整个码头 + 登记台，k≈0.7）。

段尾状态（seg2 起手可接）：镜头 wide；四台目标机器 + 四根管道（流动虚线停住）+ 四个红标签"撒谎""不存在""失败""拖延"；顶部白卡"每一个外部调用 = 把命运交给别人"；登记台已写红色 ghost 一行；荒地上一只红虚线空包裹。

## LOOK

- 第 0 节风格。红 = ETH 没到、被当成成功、账上多出的那一笔、地上没收到、四种结局；绿 = true / 绿勾（字面意义"返回成功"）；青蓝 = 中性组件、低级 call、qXETH、EVM 框；灰虚线 = 占位（true ? / false ? / 返回数据：空）。
- 字：世界标签 32 px，金额 88 px，关键词卡 56 px，术语卡 32/29 px，标题卡 92/40 px。

## 术语卡（左上 (48, 120)，同时只一张）

| 术语 | 定义 | 出现 |
| --- | --- | --- |
| 跨链桥 | 在两条链之间转移资产的系统 | L0「跨链桥」3.86–7.46 s |
| 外部调用 | 合约去调用别人的合约或地址 | L4「外部调用」19.08–21.9 s |
| 低级 call | 直接调用地址 · 失败不自动回滚 | L6「低级」22.46–26.06 s |
| EVM | 以太坊虚拟机 · 执行合约字节码 | L9「EVM」31.62–35.22 s |

## SHOTS

0–1.6 标题卡压在桥全景上，1.25 s 飞向胶囊 · L0 右上事件卡"2022 年 1 月 · Qubit 跨链桥"，两条链标签 · L1 推近以太坊侧：金库门打开，里面空，"ETH 没到" · L2 移到 BNB 侧：机器齿轮转，16 枚 qXETH 一枚接一枚落成一堆，"qXETH · 越铸越多" · L3 拉回桥全景，金额卡"约 8000 万美元 / 损失 · 公开报道" · L4 推到以太坊侧机器：一根管子落到一块空地，回程口弹出空白回执"返回 · 空"，盖绿勾"被当成成功"（关键画面一）· L5 镜头掠到收发站，我们的合约长出 · L6 一根管子从售货机伸向荒地，"低级 call"，荒地门牌闪、地基虚线亮，"没有代码的地址" · L7 管内流动，"true ?""false ?"两个虚线占位 · L8 回执签弹出"true"，占位变绿"true"，"返回数据：空" · L9 EVM 地面框 + "目标没有代码 ≠ 失败" · L10 登记台长出，"true + 空 → 当成转账成功"，回执飞进投入口 · L11 登记簿写出红色一行，"账上 · 多了一笔转账"；荒地上出现红虚线空包裹，"地上 · 什么也没收到"（关键画面二）· L12 拉远整个码头，另三台机器和管子长出、四管一起流动，顶部关键词卡 · L13 依次"失败""撒谎""拖延"（沙漏开始漏）"不存在"，段尾静止约 1 s。

BANNED：黄色荧光笔；屏幕念字幕；讲稿 / BRIEF 外的事实（地址、哈希、攻击交易细节、资源 ID 真值）；金额不挂口径；"手册"或任何章节编号、检查项编号；把"无代码地址返回成功"泛化到高级调用。
