# ep13 分镜：非 EVM 生态：换一种账户模型，换一组漏洞

统一视觉（画面、物件、颜色、字幕、术语卡、结束卡、版面分区、独立成片）见 `PIPELINE.md` 第 0 节，这里不重抄。讲稿 `script.json`，多音字表 `pron.json`。

## 1. 本集骨架

- **一句话核心观点**：漏洞的本质不变，程序相信了一个不该相信的输入；变的是输入的样子。EVM 是参数和外部调用，Solana 是调用者传进来的账户，Move 是对象和数学库，Bitcoin 生态是链下索引器的解释，Cosmos 是 IBC 证明和确定性。
- **支撑结构**：
  1. 钩子：Wormhole 在 Solana 一侧收下伪造的系统账户 → 问"账户由谁提供"。
  2. 五种执行模型 + 五国海关比喻（及其不成立处）。
  3. Solana：owner / 签名 / 类型 / CPI 目标 / 系统账户五查；信任链要锚定（Cashio）；PDA 规范 bump、CPI 后再次加载；签名有效期也是输入（Drift 持久 nonce）。
  4. Move：资源安全不等于业务安全（Cetus 位移截断）；验证器本身也会错（Zellic）；升级权限和部署流程（Nemo）。
  5. Bitcoin 与 Cosmos：链只记录、链下解释（BRC-20 索引器分歧、闪电替换循环、Liquid 门限签对了错状态）；IBC 证明（Dragonberry）、确定性（Jackfruit）、BeginBlock/EndBlock 停链。
  6. 交易所接入新链的问题清单 + 用户侧 → 回答开头 → 收束。
- **关键术语**：执行模型、owner、判别字段、跨程序调用、PDA、bump、持久 nonce、截断、字节码验证器、铭文、索引器、闪电网络、mempool、范围证明、轻客户端、IBC、确定性、denom、回滚。
- **成立条件、例外和风险**："调用者传入账户"只对 Solana 成立；Anchor 约束能自动完成大部分检查，但漏写一个就等于没有；Move 类型系统的保证依赖验证器正确。
- **不确定之处**：Cashio 损失两种口径（rekt.news 约 4800 万、CertiK 约 5280 万）；Drift 的描述来自 Drift 自身调查、Chainalysis 称未经独立验证；Liquid 根因是第三方重建、官方完整复盘尚未确认；Nemo 损失是区间（约 240 万到约 260 万）。

## 2. 世界与主角（全片固定）

一个连续的等距世界，叫"**五关大道**"。一条浅灰石板大道沿 u（左→右）贯穿世界，路上依次立着五座海关，每座都是一个 kit `checkpoint`（道闸横跨大道，门牌 `n` 依次写 "A""B""C""D""E"，不写编号以外的字）+ 一块 E01 `signBoard` plate（关名）。海关后方 −v 是各关的"后院"（案例区），大道前方 +v 中段是交易所接入台。全片的"输入"都画成**过关的东西**：EVM 是行李、Solana 是护照、Move 是带芯片的货物、Bitcoin 是集装箱、Cosmos 是盖章的文书。

| 区 | 位置 | 主要物件 | 用在 |
|---|---|---|---|
| **A · EVM 关（查行李）** | 最左 | kit `checkpoint`（n "A"）；E01 `signBoard` plate（"EVM · 查行李"）；E01 `vending`（招牌"合约"，`scale` 0.7）；E03 `slotCabinet`（"自己的存储"，紧贴售货机背面）；E07 `parcel`（"参数"，`scale` 0.8，放在道闸前）；E01 `pipe`（"外部调用"，售货机接到一台 E01 `miniVend` kind plain，`scale` 0.6） | seg2 L5、L12 |
| **B · Solana 关（查护照）** | 左中，主场 | kit `checkpoint`（n "B"）；E01 `signBoard` plate（"Solana · 查护照"）；E03 `contractMachine`（`name` "程序"，`tone` light；机身旁画一个空的红虚线框"无状态"）；**新补** `passport` ×4（"账户"：owner / 类型 / 地址三栏；其中一本 `title` "系统账户"，state attacker = 伪造）；kit `person` signer（"调用者"，`scale` 0.7，双手递上护照）；kit `person` attacker（`scale` 0.7）；E11 `mintPress`（铭牌"wETH"，`scale` 0.6，托盘红色点阵）；E02 `proofCard`（"守护者签名"，钩子里 `missing` true） | seg1 全段；seg2 L6、L12、L17；seg3 L0–L5；seg6 L10–L11 |
| **B后 · Solana 后院** | B 正后方 −v | 账户链：3 本 `passport` 沿 u 排开，用原生 SVG 青蓝细绳相连，末端一根 E02 `addrPlate`（`text` "可信根"，可切 "PDA"）；Cashio：kit `person` attacker + 一叠 E07 `oddCoin`（"无价值代币"，`scale` 0.6）+ 点阵"约 20 亿枚 CASH"；kit `shield`（"Anchor 约束"）；Drift 角：E05 `thresholdMeter`（`max` 5、`th` 2，`thText` "5 人 2 签"）+ E02 `sigPaper` ×2（"审批"）+ kit `hourglass`（"约 1 分钟"）+ E01 `timeLock`（"时间锁"，`frac` 0 起） | seg3 L6–L20 |
| **C · Move 关（防伪芯片）** | 中间 | kit `checkpoint`（n "C"）；E01 `signBoard` plate（"Move · 防伪芯片"）；E07 `parcel`（"资源"，`scale` 0.8，顶面贴一枚原生 SVG 青蓝芯片贴，复制时出现的第二个箱子是红虚线框 + 红叉）；Cetus 角：E08 `ammPool`（"池子"，`scale` 0.7）+ E03 `manual`（`title` "开源数学库"，`open` true）+ E03 `byteBlock`（"位移"，`n` 8 格，左移时高位从左端掉出 = 截断）+ E06 `shareDispenser`（"流动性份额"，`scale` 0.7）+ E06 `shareCert`（成叠）+ kit `person` attacker（`scale` 0.7）；冻结：E05 `iceShell`（"冻结 约 1.62 亿美元"，罩在一小堆金色点阵上）；验证器：kit `magnifier` 挂在 C 关岗亭窗口（"字节码验证器"） | seg2 L7、L12；seg4 L0–L13 |
| **C后 · 升级与部署** | C 正后方 −v | E10 `coreModule`（"未审计版本"，可 attacker 变红）；E05 `keycard`（"审计版本"，`scale` 0.7）；kit `key`（红色 = "单签升级"）；E01 `timeLock`（"时间锁"）；E05 `thresholdMeter`（`max` 3、`th` 2，`thText` "多签"，L17 才出现） | seg4 L14–L17 |
| **D · Bitcoin 关（只查封条）** | 右中 | kit `checkpoint`（n "D"）；E01 `signBoard` plate（"Bitcoin · 只查封条"）；**新补** `container`（"UTXO"，封条可变绿 / 红）；kit `chain`（n 4，`title` "Bitcoin"，沿 u 排在关后）；两台 kit `laptop`（"索引器 A""索引器 B"，屏幕各写一个余额，L2 时两数不同）；闪电角：kit `clock`（"截止时间"）+ E01 `mempool`（龙门牌"mempool"，原尺寸）+ E01 `letter`（"超时交易"，被挤出队列）；Liquid 角：E05 `thresholdMeter`（"联盟签名"，液面满、绿灯）+ E11 `mintPress`（"L-BTC"，`scale` 0.6，红色点阵）+ E01 `balance`（"储备对账"：左盘"BTC 储备"、右盘"L-BTC 发行"） | seg2 L8、L13；seg5 L0–L12 |
| **E · Cosmos 关（互认海关章）** | 最右 | kit `checkpoint`（n "E"）；E01 `signBoard` plate（"Cosmos · 互认海关章"）；两条 kit `chain`（n 3，`title` "应用链 1""应用链 2"，前后两排）；kit `seal`（"海关章"）；E02 `proofCard`（"Merkle 证明"；Dragonberry 时换成 kit `doc` standing"不存在证明"，state attacker）；E07 `returnTag`（"超时"，红）；kit `safe`（"托管账户"，门可开）；Jackfruit 角：三台 kit `rpc`（"节点"）+ 每台头顶一个 kit `clock`（三个时间不同）；kit `knifeSwitch`（"出块"，L16–L17 拉开）+ kit `beacon`（"停机"） | seg2 L9、L13；seg5 L13–L17；seg6 L0 |
| **F · 交易所接入台** | 大道前方 +v，C 与 D 之间 | E04 `tellerCounter`（"交易所接入"，`scale` 0.8）；kit `doc` standing（`title` "接入清单"，`lines` 随 L3–L8 逐行写入）；E07 `returnTag`（"失败"红 / "成功"绿）；E07 `oddCoin`（"同名假币"，`scale` 0.8）；kit `hourglass`（"不可回滚"）；kit `rpc` ×2（"独立节点"）；kit `hsm`（"签名算法"）；kit `laptop`（"索引器版本"）；E07 `parcel`（"SDK"，`scale` 0.6，有一个 state attacker）；kit `phone`（用户钱包，屏幕列出"账户 / 程序"，一行陌生程序标红） | seg6 L0–L9 |

**镜头路线（段首 = 上段段尾）**：

| 段 | 起始区 | 结束区 |
|---|---|---|
| seg1 | B（近景：程序机器 + 伪造的"系统账户"护照 + wETH 铸币机） | B（中景：B 关道闸 + 护照一字排开，"相信什么？"） |
| seg2 | B（L0–L4 拉成五关全景） | B（"先看护照这一关"） |
| seg3 | B | B后（Drift 角：时间锁） |
| seg4 | B后（L0 横移到 C） | C后（升级与部署） |
| seg5 | C后（L0 横移到 D） | E（停机闸刀 + 警报灯） |
| seg6 | E（L0 拉到 F） | B，最后拉远到五关全景（结束卡） |

seg2 的游走：L0–L4 B → 全景 → L5 A → L6 B → L7 C → L8 D → L9 E → L10–L14 全景（五关同框，五个关名牌依次亮）→ L15–L16 全景上一件资产（原生 SVG 金色小方块）沿大道连穿几关 → L17 推回 B。seg4 的游走：L0–L1 C 关前 → L2–L10 Cetus 角 → L11–L13 C 岗亭近景（放大镜）→ L14–L17 C后。seg5 的游走：L0–L4 D（索引器）→ L5–L7 闪电角 → L8–L12 Liquid 角 → L13–L14 E（证明卡）→ L15–L17 Jackfruit 角。seg6 的游走：L0–L9 F → L10–L13 B 关（回到开头的护照）→ L14–L15 五关全景。开场在 B 关，结尾回到 B 关再拉全景，形成闭环。

**预计需要的 CAMS 名**（`shared/layout.mjs`）：`wide`（五关全景）、`evmA`（A 关）、`solB`（B 关全景）、`passB`（B 关护照 + 程序近景）、`mintB`（B 关 wETH 铸币机）、`yardB`（B后 账户链 + 可信根）、`driftB`（B后 Drift 角）、`moveC`（C 关）、`cetusC`（Cetus 角）、`verifC`（C 岗亭 + 放大镜近景）、`upgC`（C后 升级与部署）、`btcD`（D 关 + 集装箱 + 两台索引器）、`lnD`（闪电角）、`liquidD`（Liquid 角）、`cosmosE`（E 关 + 证明卡）、`haltE`（Jackfruit 角）、`cexF`（F 接入台全景）、`listF`（F 接入清单近景）。

### 物件比例（复用物件，按 `kit/SEGBASE.md` 常见坑第 1 条）

- **支持 `opts.scale`**：kit `person`（调用者、攻击者 0.7）；E01 `vending`（A 区 0.7）、`miniVend`（A 区 0.6）；E04 `tellerCounter`（F 区 0.8）；E05 `keycard`（C后 0.7）；E06 `shareDispenser`（0.7）、`shareCert`（1.0）；E07 `parcel`（A、C 区 0.8；F 区 0.6）、`oddCoin`（B后 0.6；F 区 0.8）、`returnTag`（1.0）；E08 `ammPool`（0.7）；新补 `passport`、`container`（要支持）。
- **E11 `mintPress`（B 区、D 区都要 0.6）**：SEGBASE 的支持列表没写到 ep11；段代理先查它是否接受 `scale`，不接受就按常见坑第 1 条绕地面点包一层并换算 anchors。
- **不支持 scale，原尺寸用；要缩小就按常见坑第 1 条绕地面点包一层并换算 anchors**：kit `checkpoint`（五座原尺寸）、E01 `signBoard`（用 `size`、`w` 调大小）、E03 `contractMachine`（原尺寸）、E03 `slotCabinet`（缩到 0.6 要包一层）、E01 `pipe`、E02 `proofCard`、E02 `addrPlate`、E02 `sigPaper`、E05 `thresholdMeter`（B后、D 区缩到 0.7 要包一层；C后 原尺寸）、E01 `timeLock`、kit `hourglass`、kit `shield`、E03 `manual`、E03 `byteBlock`、E05 `iceShell`（用 `w` `d` `h` 定尺寸）、kit `magnifier`、E10 `coreModule`（缩到 0.6 要包一层）、kit `key`、kit `chain`、kit `laptop`、kit `clock`（Jackfruit 角缩到 0.5 要包一层）、E01 `mempool`（原尺寸；里面的信封可以 walk，因为没缩放）、E01 `letter`、E01 `balance`、kit `seal`、kit `doc`、kit `safe`、kit `rpc`、kit `knifeSwitch`、kit `beacon`、kit `hsm`、kit `phone`。

### 需要新补的拟物物件（库里没有，按 kit 同一投影补在 `ep13/kit-ext/`，动画助手挂 `window.KITX13`）

| 物件 | 长什么样 | 尺寸量级 | 可动部件 | 状态 | 用在 |
|---|---|---|---|---|---|
| **账户护照** `passport` | 一本立在小黑夹座上的护照（一个主体）：硬封面青蓝色，压一枚圆形徽记和 `title`（默认"账户"）；翻开后内页三行字段 `fields`（默认 ["owner","类型","地址"]），每行右侧一个检查格。opts：`title`、`fields`、`open`（默认 false）、`scale`（要支持，anchors 换算好）。anchors：`top`、`center`、`ground`、`checks[0..2]`（三个检查格中心，供红虚线连线）。 | 约 60×24×80 | `ID-cover`（封面翻开，绕左边铰链）、`ID-check-0..2`（三个检查格：绿勾 / 红叉逐个出现）、`ID-fake`（封面右下角一枚红色"伪造"小戳，默认隐藏） | normal（青蓝封面，检查格空）；attacker（封面和 normal 一样，只有封边一道细红线；`ID-fake` 可显示 = 伪造账户，强调"外观看不出"）；broken（红虚线框 + 红叉 = 被拒收） | seg1 L2–L4、L10；seg2 L6、L12；seg3 L0–L12；seg6 L11 |
| **集装箱** `container` | 一只等距集装箱（一个主体）：瓦楞钢板箱身（墨灰，可选青蓝），+u 端两扇门 + 竖向锁杆，锁杆上挂一枚封条小牌；箱身侧面 `label`（默认"UTXO"）。opts：`label`、`open`（默认 false）、`scale`（要支持）。anchors：`top`、`center`、`ground`、`seal`、`door`。 | 约 200×90×95 | `ID-door`（右门打开）、`ID-seal`（封条牌：绿 / 红）、`ID-inside`（门内露出的货物剪影：几张卡片，默认隐藏） | normal（封条绿）；attacker（封条仍绿，门内货物剪影变红 = 封条对、内容解释错）；broken（红虚线框 + 红叉） | seg2 L8、L13；seg5 L0–L3 |

其余全部复用（导入见 `kit/OBJECTS.md`）：
- **kit（O）**：`checkpoint`、`person`、`key`、`chain`、`seal`、`doc`、`safe`、`hsm`、`rpc`、`laptop`、`phone`、`hourglass`、`clock`、`shield`、`magnifier`、`beacon`、`knifeSwitch`。
- **E01**：`vending`、`miniVend`、`pipe`、`letter`、`mempool`、`balance`、`timeLock`、`signBoard`。
- **E02**：`proofCard`、`addrPlate`、`sigPaper`。**E03**：`contractMachine`、`slotCabinet`、`manual`、`byteBlock`。**E04**：`tellerCounter`。**E05**：`thresholdMeter`、`keycard`、`iceShell`。**E06**：`shareDispenser`、`shareCert`。**E07**：`parcel`、`oddCoin`、`returnTag`。**E08**：`ammPool`。**E10**：`coreModule`。**E11**：`mintPress`。
- 点阵：原生 SVG 圆（SEGBASE 常见坑第 5 条）。seg1 L0：mintPress 托盘冒出红点阵，标签"约 12 万枚 wETH"（每点 = 1000 枚，共 120 点）。seg3 L9：红点阵"约 20 亿枚 CASH"（每点 = 2000 万枚，共 100 点）。seg5 L9：红点阵"约 4000 枚 L-BTC"（每点 = 40 枚，共 100 点）。
- 大道、关后院隔墙、芯片贴、账户链绳子、"无状态"空框：原生 SVG。

## 3. 代码卡（每张只放关键 3–6 行，kit 代码卡样式，红色虚线从某一行连到场景物件；全部标灰标签"示意"）

- **卡 A · Solana 账户五查**（seg3 L1–L5、L11–L12）：
  ```
  require(acct.owner == program_id)      // owner
  require(admin.is_signer)               // 签名
  require(data[0..8] == DISCRIMINATOR)   // 类型
  require(cpi_target == KNOWN_PROGRAM)   // CPI 目标
  require(sysvar.key == SYSVAR_ID)       // 系统账户
  ```
  每行依次连到 `passport` 的一个检查格 / 程序机器；seg1 L10 只亮最后一行，红虚线连到伪造的"系统账户"护照。
- **卡 B · 位移溢出检查**（seg4 L4–L7）：
  ```
  // 先判断 n << 64 会不会溢出
  if (n > LIMIT) abort      // LIMIT 写错 → 本该拦住的值放行
  let liq = n << 64         // Move：溢出直接截断，不中止
  ```
  第 2 行连到 `manual`，第 3 行连到 `byteBlock` 掉出的高位。不写真实常量。
- **卡 C · 非确定性输入**（seg5 L15–L16）：
  ```
  if grant.expiry < local_clock_now()   // 节点本地时钟
      delete(grant)
  // 应改用区块时间
  ```
  第 1 行连到三台 `rpc` 头顶时间不同的 `clock`。

## 4. 各段分镜（按句写；句号见 timing.json 的 lines，从 0 开始）

### seg1 ① 没校验的账户
目标：观众能说出"Wormhole 在 Solana 一侧读了一个伪造的系统账户，没核对它是不是真的，于是绕开了守护者签名、铸出约 12 万枚 wETH"，并带着"账户由谁提供"这个问题往下看。
副标题：程序读了一本假护照
**关键画面**：L3–L4 伪造的"系统账户"护照进入程序机器，三个检查格全空（没有被查），岗亭窗口里的"守护者签名"证明卡变成红虚线空位，铸币机冲头落下吐出红点阵。
镜头：起于 B，止于 B。
- L0 Wormhole 在 Solana 一侧被铸出约 12 万枚 wETH：镜头在 B 关近景，`mintPress`"wETH"冲头落下，托盘冒出红点阵 120 点；右上事件卡"Wormhole · 2022 年 2 月 · Solana 一侧 · 约 12 万枚 wETH"；来源卡"Kudelski 分析 · Halborn 分析"。
- L1 约 3.2 亿美元：事件卡追加"约 3.2 亿美元"，灰标签"事发时估值"。
- L2 传了一个伪造的系统账户：攻击者小人递上一本 `passport`（`title` "系统账户"，state attacker），外观和旁边几本正常护照几乎一样。
- L3 没有核对它是不是真的：护照滑进 `contractMachine`，三个检查格保持空白，旁边问号签"没查"。**关键画面**。
- L4 守护者签名验证被绕开：岗亭窗口 `proofCard`"守护者签名"切 `missing`（红虚线空位），道闸抬起；铸币机托盘的红点阵再闪一下。**关键画面**。
- L5 先猜：题卡"先猜"。
- L6 以太坊上地址写在代码或存储里：画面左侧小插画框（A 关远景）：售货机背后的柜子里一格写着"地址"，灰标签"EVM"。
- L7 Solana 上由谁提供：B 关一排护照上方大问号，题卡下一行"账户由谁提供？"。
- L8 先记住这个问题：题卡缩到右上角下方，停留到段尾（事件卡已退场）。
- L9 弃用的读取函数：代码卡 A 只显示最后一行"sysvar"，红色划线标"已弃用的读取方式"；来源卡"Kudelski 分析 · Halborn 分析"。
- L10 不检查是不是真的系统账户：红虚线从代码卡这一行连到伪造护照，护照 `ID-fake` 红戳出现。
- L11 改用带校验的函数，Jump Crypto 补足：代码卡这一行换成绿色版本；伪造护照变 broken（红虚线框 + 红叉）；小签"Jump Crypto 补足全部 ETH"。
- L12 换一条链换一副样子：镜头拉到 B 关中景，护照一字排开，大道远处另外四座海关的剪影淡入。
- L13 程序到底在相信什么：问号签"相信什么？"。段尾静止。
术语卡：系统账户（"Solana 内置的存放系统信息的特殊账户"，L2）；守护者（"替 Wormhole 跨链消息签名的验证节点"，L4）。

### seg2 ② 五个海关
目标：观众能说出五种执行模型里"输入"分别是什么（参数和外部调用 / 调用者传来的账户 / 对象和数学库 / 链下索引器的解释 / IBC 证明），以及海关比喻在哪里不成立。
副标题：同一个错，五种样子
**关键画面**：L12–L13 五关全景，五个关名牌依次亮起，每关道闸前出现它查的那样东西：行李、护照、带芯片的货物、只看封条的集装箱、盖章的文书。
镜头：起于 B，止于 B。
- L0 准确的说法：镜头从 B 拉成五关全景，标签"准确表述"。
- L1 执行模型定义：全景上方三个关键词依次出现"怎么存状态 · 怎么调用程序 · 谁能改什么"。
- L2 本质一样：五座海关的道闸同时闪一下。
- L3 相信了不该相信的输入：大字"相信了不该相信的输入"。
- L4 变的是样子：大字下方小字"变的是输入的样子"。
- L5 EVM：镜头到 A 关；`slotCabinet` 紧贴售货机亮青蓝框"自己的存储"，攻击者小人伸手被挡；道闸前 `parcel`"参数"、`pipe`"外部调用"依次亮。
- L6 Solana：镜头到 B 关；`contractMachine` 旁"无状态"空框亮起，调用者小人递上一叠 `passport`，标签"账户由调用者传入"。
- L7 Move：镜头到 C 关；`parcel`"资源"顶面芯片贴亮起，标签"带类型的对象"；`manual`"开源数学库"闪一下。
- L8 Bitcoin：镜头到 D 关；`chain`"Bitcoin"亮，`container` 的门开一条缝，两台 `laptop`"索引器"亮屏。
- L9 Cosmos：镜头到 E 关；两条应用链之间画一道青蓝虚线弧，弧上 `proofCard`"Merkle 证明"。
- L10 打个比方：镜头拉回全景，灰标签"比喻"。
- L11 五国海关防走私：五个关名牌一起落下。
- L12 查行李、查护照、防伪芯片：A、B、C 三关道闸前依次弹出对应物件的放大小圈。**关键画面**。
- L13 只查封条、互认海关章：D 关 `container` 封条放大；E 关 `seal` 落章。**关键画面**。
- L14 找最薄弱的一环：一个红色小人影沿大道走，在每关前停一下，五关各有一处闪红。
- L15 比喻不成立：一枚金色小方块（原生 SVG，"同一笔资产"）沿大道连穿 B、C、D 三关；灰标签"比喻不成立处"。
- L16 多一组检查项：每穿过一关，方块旁多叠一张小清单卡，叠成三张。
- L17 先看护照这一关：镜头推回 B 关，护照放大。段尾静止。
术语卡：索引器（"读链上数据、计算元协议余额的链下软件"，L8）；IBC（"Cosmos 生态的跨链通信协议"，L9）。

### seg3 ③ 账户就是输入
目标：观众能列出 Solana 程序对每个账户要查的五件事（owner、签名、类型、CPI 目标、系统账户），知道账户链要锚定到可信根，并知道持久 nonce 让预签名长期有效、管理操作要加时间锁。
副标题：每本护照都要自己查
**关键画面**：L8–L9 B后 三本伪造护照互相用绳子连着、彼此"一致"，链的末端悬空（没有接到"可信根"门牌），无价值代币被铸成约 20 亿枚 CASH 的红点阵。
镜头：起于 B，止于 B后。
- L0 每个账户都是用户输入：B 关近景，一本 `passport` 放大打开，三栏字段亮出；标签"用户输入"。
- L1 owner：代码卡 A 第 1 行亮，红虚线连到护照第 1 个检查格，打绿勾。
- L2 签名：第 2 行亮，调用者小人头顶冒出一支笔，检查格打绿勾。
- L3 类型、判别字段：两本封面一模一样的护照并排，其中一本换上另一个 `title`；代码卡第 3 行亮，护照第 2 格打绿勾、冒充的那本打红叉。
- L4 CPI 目标：程序机器伸出一根 `pipe` 指向另一台小机器，小机器铭牌由调用者填写；第 4 行亮，`pipe` 末端核对为绿。
- L5 系统账户，Wormhole 缺的就是这一件：第 5 行亮，红虚线连到 seg1 那本伪造护照（broken）；小签"Wormhole"。
- L6 信任链没有终点：镜头移到 B后，三本护照用绳子连成一串，末端一截绳子悬空，标签"终点？"。
- L7 Cashio，只检查互相一致：事件卡"Cashio · 2022 年 3 月"；三本护照之间的绳子依次亮绿"一致"。
- L8 mint 字段没锚定到可信根：`addrPlate`"可信根"在旁边亮起，绳子末端与门牌之间红虚线 + 红叉。**关键画面**。
- L9 伪造整条账户链，铸出约 20 亿枚 CASH：三本护照全部 `ID-fake` 红戳出现；攻击者把一叠 `oddCoin`"无价值代币"推入，前方冒出红点阵 100 点，标签"约 20 亿枚 CASH"。**关键画面**。
- L10 两种损失口径：事件卡追加两行"rekt.news：约 4800 万美元""CertiK：约 5280 万美元"；来源卡"rekt.news · CertiK"。
- L11 落在硬编码地址或 PDA：悬空的绳子接到 `addrPlate`，门牌文字切换"硬编码地址 / PDA"，整串绳子变绿。
- L12 规范 bump、CPI 后再次加载：代码卡下方追加两行灰字"规范 bump""CPI 后再次加载"；程序机器读数窗从旧值翻成新值。
- L13 Anchor 约束：`shield`"Anchor 约束"立起，盾面列五个小勾；其中一个勾变红虚线空位，标签"漏写一个 = 没有"。
- L14 签名的有效期也是输入：镜头移到 Drift 角，`hourglass`"约 1 分钟"立着。
- L15 Drift 约 2.85 亿美元：事件卡"Drift · 2026 年 4 月 · 约 2.85 亿美元"；来源卡"Chainalysis 分析"。
- L16 五人两签、时间锁为零：`thresholdMeter`（5 格，2 线）液面升到 2 线；`timeLock` 表盘扇环归零，标签"时间锁 0"。
- L17 签了没理解的审批：两张 `sigPaper` 立起，签名笔迹出现，纸面内容模糊成灰条。
- L18 约 1 分钟过期，持久 nonce 长期有效：沙漏里的沙流完，`sigPaper` 本该变灰却保持亮着，标签"持久 nonce：不过期"。
- L19 未经独立验证：来源卡改写"Chainalysis：描述来自 Drift 自身调查"，灰标签"未经独立验证"。
- L20 时间锁 + 执行前再确认：`timeLock` 扇环重新充满（青蓝），`sigPaper` 旁亮绿勾"执行前再确认"。段尾静止。
术语卡：owner（"有权修改该账户数据的程序"，L1）；判别字段（"账户数据开头标明类型的字段"，L3）；跨程序调用（"Solana 程序调用另一个程序"，L4）；PDA（"由程序和种子派生、没有私钥的地址"，L11）；bump（"派生 PDA 时附加的调整字节"，L12）；持久 nonce（"让预签名交易不随时间过期的机制"，L18）。

### seg4 ④ 资源不等于安全
目标：观众能说出"Move 的类型系统保证代币不被复制或丢弃，但不保证数学、权限和升级正确"，能复述 Cetus 的链条（比较常量写错 → 位移截断不中止 → 约 1 个代币换巨量份额），并知道验证器和部署流程也是风险。
副标题：芯片防伪，不防算错
**关键画面**：L7 `byteBlock` 左移，最高的几格从左端掉落消失（截断），交易机器的指示灯仍是绿色"照常执行"；`shareDispenser` 随即吐出一大叠 `shareCert`。
镜头：起于 B后，止于 C后。
- L0 不能复制、不能丢弃：镜头横移到 C 关；`parcel`"资源"旁出现一个红虚线复制品 + 红叉，另一侧一个"丢弃"箭头被挡住。
- L1 不保证数学、权限、升级：三块小牌"数学""权限""升级"依次挂在关名牌下，均为灰色问号。
- L2 Cetus 被攻击：镜头到 Cetus 角；事件卡"Cetus · Sui · 2025 年 5 月 22 日"。
- L3 漏洞在开源数学库：来源卡"Dedaub 分析 · Cyfrin 分析 · The Block 报道"；`ammPool` 旁的 `manual`"开源数学库"亮红框，Cetus 业务代码（池子本体）保持青蓝。
- L4 左移 64 位，先判断会不会溢出：`byteBlock` 出现，标签"<< 64"；代码卡 B 第 1、2 行亮。
- L5 比较常量写错：代码卡第 2 行的 LIMIT 变红，红虚线连到 `manual`；一个红色数块穿过检查，标签"被放行"。
- L6 会中止吗：题卡"位移溢出 → 中止？"。
- L7 截断，照常执行：`byteBlock` 左移，高位格从左端掉下消失；代码卡第 3 行亮，灰标签"截断"；指示灯绿"照常执行"。**关键画面**。
- L8 约 1 个代币换巨量份额，约 2.23 亿美元：攻击者放入 1 枚小币，`shareDispenser` 吐出高高一叠 `shareCert`；`ammPool` 两罐液面骤降；事件卡追加"约 2.23 亿美元"。**关键画面**。
- L9 冻结约 1.62 亿美元，转入共管多签：一部分金色点阵被 `iceShell` 罩住，标签"冻结 约 1.62 亿美元"；小签"治理投票 → 共管多签 → 赔付"。
- L10 审计覆盖数学库、显式检查：`manual` 外围出现一圈青蓝虚线框"审计范围"；代码卡追加绿色一行"显式检查位移和乘法"。
- L11 验证器本身没写错：镜头到 C 关岗亭近景，`magnifier`"字节码验证器"挂在窗口。
- L12 Zellic 发现超长函数漏掉控制流边：放大镜镜片上出现一张小流程图（原生 SVG 三个方块），其中一条边是红虚线；标签"两道检查被绕过"；来源卡"Zellic"。
- L13 已修复，没有损失：红虚线变绿实线，绿勾"已修复 · 无损失"。
- L14 升级权限和部署流程：镜头移到 C后。
- L15 Nemo 私自部署未审计代码：事件卡"Nemo · Sui · 2025 年 9 月"；`keycard`"审计版本"立在一侧，`coreModule`"未审计版本"被推进位置，变 attacker；来源卡"The Block 报道 · Cointelegraph 报道"。
- L16 闪电贷函数设成公开，单签，约 240 万到约 260 万：`coreModule` 观察窗里一个小门牌从"内部"翻成"公开"；红色 `key`"单签升级"；事件卡追加"约 240 万到约 260 万美元"。
- L17 多签 + 时间锁 + 部署等于审计：`thresholdMeter`"多签"立起，`timeLock` 挂上，`keycard` 与 `coreModule` 之间出现绿色等号。段尾静止。
术语卡：截断（"超出位数的高位被直接丢掉"，L7）；字节码验证器（"部署前检查 Move 字节码安全性的组件"，L12）；单签（"一把私钥就能执行的权限"，L16）。

### seg5 ⑤ 链下与跨链
目标：观众能说出"Bitcoin 生态的风险多在链下软件（索引器、闪电网络的出块时限、桥软件），Cosmos 的风险在 IBC 证明验证和状态机的确定性"，并记住"门限签名只保证多数人同意，不保证状态正确"。
副标题：链只记录，谁来解释
**关键画面**：L10–L12 Liquid 角，`thresholdMeter`"联盟签名"液面满格、绿灯，旁边 `balance`"储备对账"却严重倾斜（L-BTC 发行一侧下沉），大字"签名对了 ≠ 状态对了"。
镜头：起于 C后，止于 E。
- L0 链只记录，链下解释：镜头横移到 D 关；`container` 封条绿，标签"链只记录"；两台 `laptop` 亮屏"链下解释"。
- L1 BRC-20 余额由索引器解释：`container` 门打开，`ID-inside` 货物剪影露出，两条细线分别连到两台 `laptop`。
- L2 先猜：两家平台余额不同：两台 `laptop` 屏幕显示两个不同的余额（示意数字，灰标签"示例"）；题卡"共识能裁决吗？"。
- L3 不能：`chain`"Bitcoin"亮绿勾"交易有效"，但两台 `laptop` 之间的问号不消失；标签"共识不解释铭文"。
- L4 索引器版本不一致、暂停、双花警告：事件卡"BRC-20 索引器分歧 · 2023 到 2024 年"；小签"Magic Eden 暂停交易""UniSat 警告双花风险"；来源卡"Cointelegraph 报道"。
- L5 闪电网络：截止前上链：镜头到闪电角；`clock`"截止时间"指针走动，`letter`"超时交易"在 `mempool` 里排队。
- L6 替换循环，反复挤出：另一封红色 `letter` 插进队列，"超时交易"被挤出栏外，重复两次；事件卡"闪电网络替换循环攻击 · 2023 年 10 月披露"；来源卡"开发者邮件列表"。
- L7 已发布缓解，未见在野利用：绿勾"四家实现已缓解"，灰标签"未见在野利用"。
- L8 BTC 桥靠多签或联盟：镜头到 Liquid 角，`thresholdMeter`"联盟签名"出现。
- L9 Liquid 凭空铸出约 4000 枚 L-BTC，约 3.19 亿美元：`mintPress`"L-BTC"冲头落下，红点阵 100 点；事件卡"Liquid 侧链 · 2026 年 9 月 6 日 · 约 4000 枚 L-BTC · 约 3.19 亿美元"；来源卡"TRM 分析 · The Block 报道"。
- L10 密钥没泄露，联盟正常签名：`thresholdMeter` 液面升满、绿灯；小签"Blockstream 称"。**关键画面**。
- L11 第三方重建根因，未确认：一张灰色卡"范围证明验证缓存：无效输出被当作已验证"，灰标签"第三方重建 · 未确认"。
- L12 门限只保证多数同意，储备要独立对账：`balance` 倾斜，大字"签名对了 ≠ 状态对了"；`balance` 旁一盏青蓝小灯"独立对账 · 实时"。**关键画面**。
- L13 Cosmos 互认状态：镜头到 E 关；两条应用链之间的虚线弧上 `proofCard`"Merkle 证明"、`seal` 落章。
- L14 Dragonberry 伪造不存在证明，伪造超时，掏空托管：证明卡换成 kit `doc`"不存在证明"（attacker），红色 `returnTag`"超时"弹出，`safe`"托管账户"门打开；随后红叉变绿勾"协调修复 · 无损失"；事件卡"Dragonberry · 2022 年 10 月"；来源卡"Cosmos 论坛复盘"。
- L15 确定性：镜头到 Jackfruit 角，三台 `rpc` 并排，标签"同样输入 → 同样结果"。
- L16 Jackfruit 本地时钟：三台 `rpc` 头顶的 `clock` 显示三个不同时间，代码卡 C 第 1 行亮并连到时钟；三台节点算出的结果牌一绿两红；事件卡"Jackfruit · 2021 年 10 月"；来源卡"Cosmos 论坛复盘"。
- L17 BeginBlock / EndBlock panic、无界循环停链：`knifeSwitch`"出块"拉开，`beacon`"停机"旋转，链尾不再长新块。段尾静止。
术语卡：铭文（"写进比特币交易里的数据或资产"，L1）；闪电网络（"比特币之上的链下支付通道网络"，L5）；mempool（"等待打包的交易排队区"，L6）；范围证明（"证明隐藏的金额落在合法范围内"，L11）；轻客户端（"只验证区块头和证明的精简客户端"，L13）；确定性（"所有节点同样输入算出同样结果"，L15）。

### seg6 ⑥ 接入一条新链
目标：观众能说出交易所接入新链要先问的几件事（失败交易、唯一标识、最终性、独立节点、签名算法、索引器、SDK），用户侧的两件事，以及开头问题的答案和它只对 Solana 成立。
副标题：每条链都要重新设计
**关键画面**：L10–L11 回到 B 关，那本伪造的"系统账户"护照和一本正常护照并排，调用者小人递上，程序机器逐格打勾打叉，大字"账户由调用者传入 → 程序自己查"。
镜头：起于 E，止于 B → 全景。
- L0 交易所接入新链：镜头从 E 拉到 F，`tellerCounter`"交易所接入"亮。
- L1 照搬以太坊逻辑：柜台上方三块红牌依次落下"假充值""错账""资金丢失"。
- L2 先问这几件事：`doc`"接入清单"立起，空白。
- L3 失败交易、到账金额：清单写入第 1 行"失败交易上不上链"；`returnTag`"失败"红牌弹出。
- L4 唯一标识、同名假币：第 2 行"唯一标识"；`oddCoin`"同名假币"出现并被打红叉。
- L5 不可回滚、停链历史：第 3 行"最终性"；`hourglass`"不可回滚"。
- L6 独立节点、签名算法：第 4 行"独立节点 · 签名算法"；两台 `rpc` 和 `hsm` 依次亮。
- L7 索引器版本、结果一致：第 5 行"索引器版本"；`laptop` 屏幕两个数合并成一个绿勾。
- L8 SDK 也是供应链，签名服务隔离：第 6 行"SDK 隔离"；三个 `parcel`"SDK"里一个变红，`hsm` 外画一圈青蓝隔离框。
- L9 用户：唯一标识、陌生程序不签：`phone` 屏幕列出"账户 / 程序"，一行陌生程序标红，手指移开；标签"不签"。
- L10 回到开头问题：镜头回到 B 关；题卡"账户由谁提供？"重新出现。
- L11 由调用者传进来，程序自己核对：调用者小人递上两本护照，程序机器逐格检查，正常的打三个绿勾，伪造的打红叉；大字"调用者传入 → 程序自己查"。**关键画面**。
- L12 只对 Solana 成立：其余四座海关在远处亮起，各自道闸前是自己的输入；灰标签"解读"。
- L13 谁决定这个输入可信：五座海关上方同时浮出同一个问号"谁决定可信？"。
- L14 换模型换漏洞：镜头拉远到五关全景，大字"换一种账户模型，换一组漏洞"。
- L15 下一集：`endCard()`：标题"非 EVM 生态：换一种账户模型，换一组漏洞"、收束句"换一种账户模型，就换一组漏洞"、"下一集 · ZK 与证明系统的安全"，最后 2.5 秒静止。
术语卡：denom（"Cosmos 里代币的唯一标识名"，L4）；回滚（"已上链的交易被撤销"，L5）。

## 多音字处理

文本侧已完成（`polyphone_scan.py ep13` 只扫讲稿文本，未配音）。

- 加进 `tools/pron.json`（通用）：调查 → 掉查、协调 → 协条、重建 → 虫建、供应链 → 公应链、披露 → 批路、薄弱 → 博弱、为零 → 维零。
- 加进 `ep13/pron.json`：查行李 → 查型李。
- 已由通用表覆盖：校验、调用、处理、当作。
- 改稿规避（写稿时已处理）："长什么样"改成"输入的样子"（长 zhǎng）；"重新加载"改成"再次加载"（重 chóng）；"还必须"改成"也必须"（还 hái / huán）；"还没有官方复盘确认"改成"官方完整复盘尚未确认"；没写"朝鲜"相关的归因（朝 cháo）。
- 留给试听确认的：提供 / 供应链（gōng）、放行 / 执行 / 运营（xíng）、函数 / 多数 / 数学（shù）、常量 / 巨量（liàng）、一种 / 每种（zhǒng）、互相（xiāng）、称（chēng）、模型 / 模块（mó）、落在（luò）、凭空 / 掏空（kōng）、传进来 / 传入（chuán）、几件 / 几个（jǐ）、披露（pī lù）。

## 时长

（配音完成后由 timing.json 回填。按讲稿字数估算，约 4.2 字/秒。）

| 段 | 胶囊 | 句数 | 字数 | 估算时长 | 起 → 止 |
|---|---|---|---|---|---|
| seg1 | ① 没校验的账户 | 14 | 275 | 约 65 秒 | B → B |
| seg2 | ② 五个海关 | 18 | 379 | 约 90 秒 | B → B |
| seg3 | ③ 账户就是输入 | 21 | 594 | 约 140 秒 | B → B后 |
| seg4 | ④ 资源不等于安全 | 18 | 482 | 约 115 秒 | B后 → C后 |
| seg5 | ⑤ 链下与跨链 | 18 | 645 | 约 155 秒 | C后 → E |
| seg6 | ⑥ 接入一条新链 | 16 | 389 | 约 95 秒 | E → B → 全景 |

全片约 2764 字（不计标点），估算约 11 分钟。
