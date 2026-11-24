# REVIEW · ep05 / seg3「③ 借出的权限」（138.4 秒）

## 创作取舍

- 世界：import `../../seg1/src/layout.mjs`（主合约机器在原点、主按钮台 MAIN_PANEL、Parity 角落 LIB / LIB_PANEL / 三个钱包 / delegatecall 总管与 seg1 同一画法）。本段自补物件都在 `src/layout.mjs`，相对 MAIN 摆放，避开 seg1 预留的 TRON / KEYS / BRIDGE / USER 区；三块告示牌放在大道前方（+v）。
- 镜头：段首标题卡「③ 借出的权限」0–1.6 s 飞入胶囊 → Parity 角落（7 月：信封经钱包走 delegatecall 管道进库合约，库的代码手册送回钱包，翻到 initWallet；攻击者经钱包调用，"owner = 攻击者"，金条运走 + 点阵卡）→ 11 月：同一角落，库合约自己被接管、按 kill、红虚线框 + 烟团 → 教训木牌 → 右移到主大道（execute 附加按钮台 + 目标拨盘 + DATA 投信口；受害者、授权书、代币合约、攻击者；delegatecall 时存储柜抽屉被翻红）→ 按钮台左前（门卡、信箱、待接收托盘）→ 按钮台右前（ecrecover 机、空白 0x0 卡）→ 三块告示牌逐块推近。
- 时间线卡"Parity · 2017 · 以太坊"两节点，7 月 / 11 月依次点亮，L5 两点同亮表示"教训相同"。L6 起左上"六种缺陷"编号槽（1–3 已亮，4/5/6 随讲随亮，名称红签只在当句显示），段尾六槽全亮。
- 口径：7 月金额"约 15.3 万 ETH · 约合 3000 万美元"，灰框"手册 6.1 节"；点阵每点 1 万 ETH，15 点 + 1 点半透明表示"约"。代码卡 D / E 标"示例"，F 标"示意"（第 2 行是讲稿说法的示意写法）。"权限没有被偷 · 是被借走了"加灰标签"解读"。卡 D 注释只写 `transferFrom(受害者, 攻击者, 金额)`，不写地址。
- 自补物件（`src/props.mjs`）：DATA 投信口立柱、ecrecover 机、碎纸机、待接收托盘、金条、金币、烟团、脚手架框。kit / ep01 / ep02 / ep03 / ep05 kit-ext 只 import 未改。ep03 `contractMachine` 名字超过 5 个字符时小屏宽度为负，"MyWallet"用 5 字符占位生成后替换铭牌字（不改库）。

## 自审（每句中点 + 0.8 s + 段尾；过程帧在 `review/final/`、`review/fix/`；成片逐句拼图 `review/seg3-lines.jpg`，取自 renders/seg3.mp4）

修过的问题：
1. seg1 layout 出来后整体改为 import：主机器从 (1390,900) 平移到原点，Parity 角落换成 seg1 的一排钱包 + 总管 + 两键库按钮台；告示牌从原定右侧挪到前方，避开 TRON_ZONE。
2. `contractMachine` 长名字导致 `<rect width<0>` 控制台报错 → 占位名 + 换字。
3. 主大道几个镜头物件被代码卡 D 挡住 → L8 起卡 D 折叠成两行（只留 `target.call(data)` 与注释）；execute 镜头重定取景。
4. L12 讲 delegatecall 时卡 D 仍显示 call → 叠一行 `target.delegatecall(data)` 替换。
5. Parity 镜头里"被接管的是库合约自己"压在时间线卡上、库标签被卡遮住 → 镜头下移、L1 起收掉库标签。
6. 代币合约被存储柜挡住、存储柜在所有权镜头里占满上方 → 存储柜挪到主机器左后。
7. "币到了攻击者手里"拖到 L12 与 delegatecall 标签重叠 → 改为 L12 讲到 delegatecall 时淡出。
8. "transferFrom(…)" 红签与"目标：代币合约"重叠 → 红签只写 transferFrom，目标标签放到拨盘下方。
9. 信箱太小、"一步生效"压住地址签 → 信箱 ×1.6，提示签上移；"两步转移"签在 acceptOwnership 出现前收掉。
10. 告示牌间距太近、邻牌和别牌的道具挤进画面 → 牌距加大、每牌镜头 k 1.15。
11. 教训木牌在大道镜头里一直露在左边 → L6 收起。
12. contrast：编号槽空位字色加深；`#sln*` 绝对定位加 `data-layout-allow-overflow`。

检查：`hyperframes check` 0 error。保留的 warning：
- `composition_file_too_large`：story.html 由 `src/build-story.mjs` 生成，一个连续世界一台镜头。
- `line_unread`（标题卡副标题 1.6 s）：PIPELINE 规定段首标题卡 0–1.6 s。

## 仍存在的问题

- 主大道中景（k 0.72）物件偏小；授权书只是机器侧面一张立着的纸，靠"持有授权 · 代币"标签读懂。
- 告示牌上的三行字（误解 / 事实 / 影响）在 k 1.15 下约 20–24 px，只当质感，关键结论靠旁边的 wlab 标签。
- L13 "权限被借走"大字卡压在场景中部约 2.8 s。
- 按钮台读卡器、0x0 门卡很小（k 1.2 下约 50 px），"0 == 0"靠红标签表达。
- L24 旧构造函数"掉到正面"用一台新长出的红色单键按钮台表示，没有做从背面掉落的动作。
- 声音只确认音轨存在与时长，未人耳试听。

## 2026-11-15 第二轮返工（RETROFIT-deps）

- 配音第 20 句改为"所以比对前，先排除零地址"，按新时间轴重建；原"以后单独讲"标签改为"比对前先排除零地址"，按"排除零地址"定时。
- 术语卡：delegatecall（top 280，避开时间线卡）、代币授权（top 320）、ecrecover（top 360，避开代码卡）、renounceOwnership（top 240，避开路牌标签）。
