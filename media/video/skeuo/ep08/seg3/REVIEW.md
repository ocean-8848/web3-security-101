开场预设：CAMS.left（seg2 L18 起回到左区，按 seg2 结尾在 CAMS.left 估计）
结尾预设：CAMS.left（静止，ammPool broken 红框红叉、价格管仍插在池子表上、attacker 站在 ATK.mid；seg4 L0 从这里平移向右区）

# ep08 seg3 ③ 推高现货价 · REVIEW

## 做了什么
- `src/build-story.mjs` 生成 `compositions/story.html`。物件：E01 vending / pipe / flashDesk，E02 rollCounter，kit ledgerBook / person，ep08 ammPool ×2（主池 + AMM_ALT 浅池）。世界坐标全部来自 `shared/layout.mjs`；本段另定义了三个机位（只在本文件里）：`readW`（L9–L11 池子 + 合约在下、代码卡 A 在上）、`steps`（L12–L17 五步路线，含 ATK.vend）、`poolL`（L21–L25 池子在左、事件卡在右）。
- 镜头：left →(L0) leftCenter →(L1) pool →(L9) readW →(L12) steps →(L18) center →(L20) pool →(L21) poolL →(L26) left。
- L0 价格管（PIPE.pool）淡入，管内红色虚线流动；L1–L2 公式卡；L3 题卡"先猜 · 示例 · 忽略手续费"；L4 点阵（ETH 每点 100 枚、USDC 每点 20 万）；L5 "400 万 USDC"点阵飞进右料斗 + poolPump；L6 "?"；L7 "≈ 18,000"红、USDC 补满 30 点、ETH 剩 3⅓ 点；L8 rollCounter 1→9 +"× 9 · 1 笔交换"。
- L9–L11 代码卡 A，第 1 行红虚线→池子右罐，第 4 行→合约出货口；第 2 行红 chip"一笔交易可推高"。
- L12–L17 顶部"一笔交易 · 五个动作"条 + 沿路线 5 个编号位；attacker 走 desk→pool→vend→pool→desk，金条、代币随身；L15 合约出币 + 金点阵"借出"；L17 青蓝"一笔交易"框收拢五步。
- L18 center：左侧对比卡（抵押品 1 点 vs 借款 9 点红虚线）、ledgerBook 红线框 +"坏账"；L19 右侧利润算式卡逐行出现。
- L20 深池 / 浅池同样一推；L21–L25 右上三张事件卡（均标"公开报道"），Cream 卡里小金库图标：硬币投入、红箭头上翘；L26 三卡收成一行 + "一笔交易就能改写的数据"，红虚线连回池子，池子 broken。
- 术语卡只用 `termCards()`；坏账按 BRIEF 不再出卡（seg1 已出）。

## termCards().report
术语卡 2 张：恒定乘积@5.98s×3.6s，金库份额价格@120.7s×3.6s

## 检查
- `npx hyperframes check`：0 error。剩余 warning：文件过大、标题卡副标题停留 1.5 s（段首规则固定 0–1.6 s）、101–105 s bZx 卡静止 3.6 s（配音在念卡上内容）。
- `node ../../tools/layout_lint.mjs .`：版面检查通过。
- 抽帧共看 3 张拼图（12 帧缩半）。

## 未解决 / 给统筹
- 开场衔接是按 BRIEF 推测的：本段假定 seg2 结尾为 CAMS.left、池子 normal、flashDesk 框关闭、attacker 在 ATK.mid、价格管未接池子。如 seg2 结尾池子仍是被推高状态，需要两段对一下。
- 结尾 attacker 回到 ATK.mid，flashDesk 金条在，手续费硬币已淡出；合约出货口前散落的出币（dispense）留在中区，seg4 开场不在画面里。
- L20 浅池缩放 0.7，表盘指针在全画面下偏小，"浅池冲得更高"主要靠标签传达。
- AMM 池在画面里最多 2 个，符合 kit-ext 的体积提示。
