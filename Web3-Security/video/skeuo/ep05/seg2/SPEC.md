# SPEC · ep05 / seg2「② 门没装锁」

GOAL:    看完能复述"每个改状态的函数都要回答谁可以调用我"；说出写字楼比喻在哪不成立（不可升级的合约不能换锁）；对前三种缺陷各说出修复：`onlyRole`、改看 `msg.sender`、`initializer` + 构造函数锁死实现合约。
OUTPUT:  HyperFrames，1920 × 1080，30 fps
TIME:    130.96 s（配音是时钟，段首 0–1.6 s 标题卡），无音乐
LOOK:    统一视觉见 `../../PIPELINE.md` 第 0 节；代码卡 = kit `.k-code`（JetBrains Mono 30 px）。

## 世界坐标

`src/layout.mjs`。共享区域直接 `export … from "../../seg1/src/layout.mjs"`（seg1 为准）：MAIN (0,0) 合约机器 "Contract"，MAIN_PANEL (0,300) 5 键按钮台 mint/initialize/kill/upgrade/pause；LIB (−1180,−930)、LIB_PANEL (−1180,−630)、WALLETS、管道高度。

| seg2 新增 | 世界 (u, v) | 说明 |
| --- | --- | --- |
| 写字楼（比喻层） | OFFICE (540,−1380) | L2–L5，L6 淡出 |
| 五类来访者队列 | v = 760：any −760 / evil −430 / admin −150 + 笔记本 40 / thief 330 / insider 620 | L7–L9；之后 any 去按 mint、admin+evil 演 tx.origin、thief 抢 initialize |
| 代币机、MINTER 合约 | TOKEN (−560,60)，MINTER (−330,−190)，AT_MINT (−580,330) | L11–L13 |
| 透明背板 | MAIN 的 −u 面外挂玻璃壳 | L14–L15 |
| 实现合约 + 自己的按钮台 | IMPL (−150,−720)，IMPL_PANEL (−580,−560)，管道从 MAIN 背面沿 −v | L22–L25；L26 淡出 |
| 抢跑位置 | AT_INIT0 (−560,300)，AT_INIT (−400,470) | L23 |

seg1 提议的 USER_ZONE（−2510,−1120）没用：tx.origin 一段直接让队列里的"被钓鱼的特权用户"和"恶意合约"就地出演，镜头不用跨 2700 px。

段尾状态：Parity 角落近景，Library 的 initialize 上红虚线空位 + 青蓝虚线钢板轮廓"本该有：锁死"，顶部"解读"关键词。

## SHOTS

0. 0–1.6 标题卡「② 门没装锁 / 谁可以调用我 · 前三种缺陷」→ 收进胶囊。
1. L0–L1 主按钮台近景：五个问号；pause 贴"deposit"贴纸 +"任何人"；"安全论证"文件 + 绿勾。
2. L2–L5 写字楼（灰"比喻"）：大堂门 public 三人走进；机房门 onlyOwner 刷卡开门；"比喻在这里不成立"印章，锁匠换读卡器（绿勾）。
3. L6 回到合约：mint 红虚线空位"装错的锁"，机身铆钉一圈，"不可升级：装错就永远错"。
4. L7–L9 拉远：排队线，五类来访者依次出现 + "5 类"。
5. L10 六格缺陷条（1–3 点亮）。
6. L11–L13 卡 A：any 走到 mint 按下、代币机吐币；卡 A 第 2 行红线 → mint；扣读卡器护罩，any 刷卡红叉；MINTER 合约门卡刷卡绿灯；第 4 行青蓝线 → 读卡器。
7. L14–L15 透明背板里的内部按钮："Solidity < 0.5 · 默认 public"，三人伸手，按钮变红。
8. L16–L20 卡 B：管理员 + 笔记本（领取空投页）→ 信封 → 攻击者合约 → 红信封 → upgrade 读卡器；"读到 tx.origin = 管理员"绿灯按下、"检查通过"（红）+ 红线；换成"读到 msg.sender = 攻击者合约"红叉"拒绝" + 青蓝线（关键画面）。
9. L21–L24 卡 C：initialize"未初始化"；实现合约 + 管道"代理 / 克隆"；owner 空 → 地址 A → 攻击者·被改写；initializer：已初始化灯绿、护罩扣上、第二次刷卡红叉；第 4 行青蓝线。
10. L25 实现合约自己的 initialize 被钢板焊死"_disableInitializers()"；第 5 行青蓝线。
11. L26 Parity 角落：红虚线空位"当年：没有检查"，青蓝虚线钢板"本该有：锁死"，"解读"。静止。

BANNED: 深色虚空、霓虹/光晕、黄色荧光笔、三卡并排、硬切、凭空堆物件、具体地址/哈希/金额；画面不暗示 2017 年漏写了 `_disableInitializers` 这个函数名（只说"锁死实现合约"这一步）。
QA: 每句中点 + 0.8 s + 段尾 −0.5 s（`REVIEW.md`）。
