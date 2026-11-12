/* 独立案件章 · B 组：Euler、DMM Bitcoin、WazirX、Bybit、Bitget、Binance */
H.cases.push(
{
 id:"c-euler", name:"Euler Finance", sub:"一个“捐赠”函数让账户故意破产", date:"2023-03-13", type:"DeFi", chain:"Ethereum", attr:"未知（误传为朝鲜）", ev:"P+I",
 loss:197,
 thesis:"Euler 新增的 donateToReserves 允许用户把存款“捐”给协议，但<em>捐完不检查账户是否还健康</em>。攻击者先用闪电贷放大杠杆，再把自己捐到资不抵债，然后用另一个地址按折扣清算自己。",
 figs:[["$1.97 亿","DAI、USDC、stETH、WBTC 合计","red"],["3,000 万 DAI","单轮闪电贷本金"],["20%","清算折扣上限"],["~3 周","可追回资金全部归还","green"],["2 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"合约",name:"升级引入函数",when:"2022-07（eIP-14）",ev:["fact"],what:["Euler 通过 eIP-14 新增 donateToReserves。","函数把用户的 eToken（存款凭证）转给储备。","函数没有调用健康度检查 checkLiquidity。"],how:"其他改变余额的函数都检查健康度。新函数遗漏了。",block:"所有改变抵押或负债的函数统一走健康度检查；升级后重新审计。",att:"—"},
  {d:"链上",name:"闪电贷",when:"2023-03-13 ~08:50 UTC",ev:["fact"],what:["攻击者从 Aave 借入 3,000 万 DAI 闪电贷。"],how:"闪电贷让攻击者在一笔交易内拥有大额本金。",block:"—"},
  {d:"合约",name:"自循环加杠杆",when:"同一笔交易",ev:["fact"],what:["攻击者存入 2,000 万 DAI，再用 mint 把存款和负债同时放大约 10 倍。","攻击者偿还 1,000 万 DAI，再次 mint。"],how:"mint 是协议允许的杠杆功能。",block:"单账户杠杆上限。"},
  {d:"合约",name:"捐赠致破产",when:"同一笔交易",ev:["fact"],what:["攻击者把 1 亿 eToken 捐给储备。","账户负债大于抵押，变成可被清算。"],how:"donateToReserves 不检查捐赠后是否资不抵债。",block:"捐赠后调用 checkLiquidity，不健康则回滚。",note:"这是整条链唯一的代码缺陷。其他步骤全部是协议的正常功能。"},
  {d:"合约",name:"自我清算",when:"同一笔交易",ev:["fact"],what:["攻击者用第二个合约清算第一个账户。","清算折扣让清算人拿到的抵押多于承接的负债。","清算人提走差额，再归还闪电贷。"],how:"Euler 的“软清算”折扣随资不抵债程度上升，最高 20%。",block:"清算人与被清算人关联检测；折扣上限按健康度区间封顶。"},
  {d:"洗钱",name:"谈判与归还",when:"03-18 → 04-03",ev:["fact"],what:["攻击者向 Ronin 攻击者地址转了一笔 ETH，引发“朝鲜所为”的猜测。","Euler 提出 100 万美元悬赏并发出链上消息。","攻击者道歉，分批归还全部可追回资金。"],how:"—",block:"—"}
 ],
 mermaid:`flowchart LR
  F["闪电贷 3,000 万 DAI"] --> D["存入 2,000 万"]
  D --> M["mint 放大 10 倍"]
  M --> R["偿还 1,000 万"]
  R --> M2["再次 mint"]
  M2 --> G["donateToReserves 1 亿 eToken"]
  G --> X{"健康度检查?"}
  X -->|"缺失"| I["账户资不抵债"]
  I --> L["第二个合约清算 拿折扣"]
  L --> P["提走差额 归还闪电贷"]`,
 readpts:["图中只有一个节点是缺陷：“健康度检查”这条分支不存在。","闪电贷不是漏洞。它只是把攻击需要的本金在一笔交易里借到。","局限：图省略了 DAI、USDC、stETH、WBTC 四个市场分别执行的细节。"],
 analogy:"一个人故意把自己的存款捐给银行，让自己的贷款变成坏账；再用另一个身份以八折价格买下这笔坏账的抵押物。",
 timeline:[["2022-07","eIP-14 上线 donateToReserves","审计方 Sherlock 后来承认遗漏。"],["2023-03-13 ~08:50 UTC","攻击发生","约 1.97 亿美元。","hot"],["03-14","Euler 提出 100 万美元悬赏",""],["03-18","攻击者开始归还","","ok"],["04-03","可追回资金全部归还","","ok"],["2023-03","Sherlock 赔付 450 万美元","审计保险赔付。"]],
 roots:[["函数 ⇄ 不变量","新函数绕过全局不变量","“任何操作后账户必须健康”没有集中执行。"],["升级 ⇄ 审计","增量审计范围过窄","eIP-14 的审计没有覆盖与清算模块的组合。"],["清算 ⇄ 关联方","允许自我清算","清算折扣奖励了制造坏账的人。"]],
 myths:[["闪电贷攻击","闪电贷只提供本金。根因是缺少健康度检查。"],["朝鲜所为","唯一线索是向 Ronin 地址转了一笔 ETH，没有其他证据。"]],
 fixes:[["0","把“操作后账户必须健康”写成统一修饰器或钩子，所有余额变化函数必须经过。","④","用不变量模糊测试覆盖所有公开函数。"],["1","升级审计范围包含新函数与清算、杠杆模块的组合。","①","审计清单列出新函数调用的全部状态。"],["2","识别清算人与被清算人的资金关联。","⑤","同一交易内清算自身账户时触发告警。"]],
 labs:["l1"],
 sources:[["Euler Labs. War & Peace: Behind the Scenes of Euler's $240M Exploit Recovery（2023-04）","https://www.euler.finance/blog/war-peace-behind-the-scenes-of-eulers-240m-exploit-recovery"],["Chainalysis. Euler Finance Flash Loan Attack（2023-03）","https://www.chainalysis.com/blog/euler-finance-flash-loan-attack/"],["CoinDesk. Euler Finance hacker returns all recoverable funds（2023-04-04）","https://www.coindesk.com/tech/2023/04/04/euler-finance-hacker-returns-all-recoverable-funds/"]],
 limits:"归还资金的美元价值随币价变化。各报道的“归还金额”口径不同。"
},
{
 id:"c-dmm", name:"DMM Bitcoin", sub:"供应商员工的一次“入职测试”", date:"2024-05-31", type:"CEX", chain:"Bitcoin", attr:"TraderTraitor（FBI / DC3 / 日本警察厅）", ev:"P",
 loss:305,
 thesis:"攻击者没有直接攻击 DMM。攻击者攻击的是 DMM 的钱包软件供应商 Ginco 的一名员工，然后<em>在 Ginco 的通信系统里篡改了一笔 DMM 员工发起的合法交易请求</em>。",
 figs:[["4,502.9 BTC","约 482 亿日元 / 约 3.05 亿美元","red"],["~2 个月","首次接触到资金转出"],["¥550 亿","集团筹资补足用户 BTC","green"],["2025-03","账户转移至 SBI VC Trade，DMM 停业","warn"],["5 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"社工/人",name:"假招聘",when:"2024-03 下旬",ev:["fact"],what:["攻击者在 LinkedIn 冒充招聘人员，联系 Ginco 员工。"],how:"社会工程。与 Ronin、Bybit 同一类入口。",block:"关键岗位员工的外部招聘接触报备。",att:"T1566.003"},
  {d:"终端",name:"恶意“入职测试”",when:"2024-03 → 05",ev:["fact"],what:["攻击者发来 GitHub 上的 Python 脚本，称其为入职前测试。","员工把脚本复制到自己的 GitHub 并运行。"],how:"开发工作流投毒。",block:"外部代码只在一次性虚拟机中运行。",att:"T1204.002 · T1195"},
  {d:"身份/会话",name:"窃取会话 Cookie",when:"2024-05 中旬",ev:["fact"],what:["攻击者取得该员工的会话 Cookie。","攻击者冒充该员工，进入 Ginco 的未加密通信系统。"],how:"会话劫持绕过了密码与 MFA。",block:"会话绑定设备；短时会话；敏感系统重新认证。",att:"T1539 · T1550.004"},
  {d:"供应商",name:"进入交易请求通道",when:"2024-05 下旬",ev:["fact","unk"],what:["攻击者在 Ginco 系统中看到 DMM 员工发起的交易请求。"],how:"DMM 的签名流程依赖 Ginco 系统传递交易内容。",block:"交易请求端到端签名；供应商通道不能修改交易内容。"},
  {d:"签名/密钥",name:"篡改合法请求",when:"2024-05-31",ev:["fact"],what:["FBI 称攻击者“很可能”篡改了一笔合法交易请求。","DMM 的签名流程按被篡改后的内容签出交易。"],how:"签名者核对的是被篡改后的界面内容。",block:"在签名设备上独立显示收款地址和金额；收款地址白名单。",note:"这里 FBI 使用了 likely（很可能）一词。具体篡改方式没有公开。"},
  {d:"链上",name:"转出 4,502.9 BTC",when:"2024-05-31",ev:["fact"],what:["4,502.9 BTC 转到攻击者地址。","资金随后被分散到多个地址。"],how:"合法签名的比特币交易。",block:"单笔金额上限与人工复核。"}
 ],
 mermaid:`sequenceDiagram
  participant A as 攻击者
  participant G as Ginco 员工
  participant S as Ginco 通信系统
  participant D as DMM 员工
  participant W as DMM 钱包签名
  A->>G: LinkedIn 招聘 + 入职测试脚本
  G->>G: 运行脚本 会话 Cookie 被窃
  A->>S: 冒充 Ginco 员工登录
  D->>S: 发起合法交易请求
  A-->>S: 篡改收款地址或金额
  S->>W: 传递被篡改的请求
  W-->>A: 4,502.9 BTC`,
 readpts:["受害方的系统没有被直接入侵。攻击发生在供应商传递交易内容的通道上。","如果签名端不能独立核对交易内容，供应商通道就是签名流程的一部分。","局限：篡改的具体字段和时刻未公开。"],
 timeline:[["2024-03 下旬","LinkedIn 首次接触 Ginco 员工","",""],["2024-05 中旬","会话 Cookie 被盗",""],["2024-05-31","4,502.9 BTC 转出","","hot"],["06-01","DMM 公告事件，限制新开户和提现",""],["06 月","集团筹资约 550 亿日元补足用户 BTC","","ok"],["12-02","DMM 宣布停业，账户转移至 SBI VC Trade","2025 年 3 月完成。"],["12-23","FBI、DC3、日本警察厅联合归因 TraderTraitor","",""]],
 roots:[["员工 ⇄ 供应商","供应商员工是签名链的一环","Ginco 员工的会话能触达 DMM 的交易请求。"],["会话 ⇄ 设备","Cookie 可在其他设备复用","会话没有绑定设备。"],["请求 ⇄ 签名","签名端不独立核对","签名依据的是通道传来的内容。"]],
 myths:[["DMM 的系统被黑了","入口在第三方钱包软件商 Ginco。"],["私钥被盗了","私钥没有被盗。被篡改的是交易请求。"]],
 fixes:[["0","交易请求在发起端签名，签名端验证请求签名后才签交易。","④ ⑤","在通道中修改一个字节，签名端必须拒绝。"],["0","签名设备独立显示收款地址与金额；收款地址白名单。","⑤","向非白名单地址发起请求，必须进入人工审批。"],["1","供应商访问使用设备绑定的短时会话。","③","复制 Cookie 到另一台设备，访问必须失败。"],["2","供应商员工纳入招聘社工演练和终端基线要求。","① ②","合同中写明供应商终端安全要求与审计权。"]],
 signals:[["供应商终端","运行来源不明的 Python 脚本；异常外联","隔离终端，吊销会话"],["身份","同一会话 Cookie 出现在新 IP 或新设备","强制重新认证"],["交易请求","请求内容在传输中变化；收款地址首次出现","阻断并人工复核"]],
 labs:["l2"],
 sources:[["FBI. FBI, DC3, and NPA Identification of North Korean Cyber Actors, Tracked as TraderTraitor（2024-12-23）","https://www.fbi.gov/news/press-releases/fbi-dc3-and-npa-identification-of-north-korean-cyber-actors-tracked-as-tradertraitor-responsible-for-theft-of-308-million-from-bitcoindmmcom"],["The Record. FBI: TraderTraitor behind largest crypto hack of 2024（2024-12）","https://therecord.media/fbi-largest-crypto-hack-2024-tradertraitor"],["日本警察庁. 北朝鮮を背景とするサイバー攻撃グループTraderTraitorによる暗号資産関連事業者を標的としたサイバー攻撃について（2024-12-24）", "https://www.npa.go.jp/bureau/cyber/koho/caution/caution20241224.html"]],
 limits:"美元金额有 3.05 亿和 3.08 亿两种口径，取决于估值时点。篡改细节只有 FBI 的“很可能”表述。"
},
{
 id:"c-wazirx", name:"WazirX", sub:"4/6 多签，签名者看到的不是他们签的", date:"2024-07-18", type:"CEX", chain:"Ethereum", attr:"朝鲜（美日韩联合声明）", ev:"P+I",
 loss:235,
 thesis:"WazirX 的多签需要 3 个自己的签名者加 1 个托管商 Liminal 的签名。<em>签名界面显示的是普通转账，实际交易是升级钱包合约</em>。4 个签名全部到齐，钱包控制权交给了攻击者。",
 figs:[["$2.35 亿","约占平台储备 45%","red"],["4 / 6","多签阈值：3 个 WazirX + 1 个 Liminal"],["1 笔","升级交易夺走全部控制权","red"],["2025-10","新加坡重组方案获批","green"],["5 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"终端",name:"签名环境失陷",when:"2024-07 前",ev:["fact","unk"],what:["WazirX 称问题来自 Liminal 平台。","Liminal 和第三方取证称其平台无问题，问题在 WazirX 的 3 台签名设备。"],how:"失陷位置存在争议，没有统一结论。",block:"签名设备专机专用；设备完整性证明。"},
  {d:"前端/界面",name:"界面与交易不一致",when:"2024-07-18",ev:["fact"],what:["签名者在 Liminal 界面看到一笔普通转账。","实际待签数据是对 Safe 钱包实现合约的升级。"],how:"盲签：签名者没有在硬件设备上核对原始交易。",block:"硬件钱包清晰签名（Clear Signing）；独立模拟交易。",att:"—"},
  {d:"签名/密钥",name:"4 个签名到齐",when:"2024-07-18 ~06:18 UTC",ev:["fact"],what:["3 名 WazirX 签名者用 Ledger 签名。","Liminal 作为最后一个签名者完成签名。"],how:"每个签名者都以为别人已经核对过。",block:"每个签名者独立核对 calldata 哈希；升级类交易需要额外审批流程。"},
  {d:"合约",name:"升级为攻击者合约",when:"同一时刻",ev:["fact"],what:["Safe 钱包的实现合约指向攻击者部署的合约。","攻击者取得钱包的完全控制权。"],how:"代理钱包的“实现地址”决定钱包的全部行为。",block:"Safe Guard 禁止 delegatecall 与升级操作。"},
  {d:"链上",name:"转空钱包",when:"07-18",ev:["fact"],what:["攻击者转出 ETH、SHIB、MATIC、PEPE 等约 2.35 亿美元资产。"],how:"攻击者合约直接转账，不再需要多签。",block:"冷钱包分层，限制单钱包资产比例。"},
  {d:"洗钱",name:"换币与混币",when:"07 月起",ev:["fact"],what:["攻击者把代币换成 ETH，再经 Tornado Cash 等洗出。"],how:"—",block:"—"}
 ],
 mermaid:`flowchart LR
  subgraph SEE["签名者看到的"]
    S1["转账 X ETH 到 温钱包"]
  end
  subgraph REAL["实际签名的数据"]
    R1["Safe.upgrade 实现地址 = 攻击者合约"]
  end
  W1["WazirX 签名者 1"] & W2["签名者 2"] & W3["签名者 3"] --> L["Liminal 最终签名"]
  SEE -.->|"界面"| W1
  REAL -->|"calldata"| L
  L --> C["钱包控制权转移"]
  C --> O["攻击者转空资产"]`,
 readpts:["多签防住了“单个签名者作恶”。它防不住“所有签名者看到同一个假界面”。","升级类交易一旦签出，后续转账不再需要多签。损失上限等于钱包全部余额。","局限：界面被篡改的位置（WazirX 设备或 Liminal）存在争议。"],
 analogy:"4 位董事在同一份合同上签字。每个人看到的都是“购买办公用品”，但纸面下压着一份“转让公司全部股权”。",
 timeline:[["2024-07-18 ~06:18 UTC","升级交易执行，资产转出","","hot"],["07-18","WazirX 暂停提现，公告事件",""],["07 月下旬","WazirX 与 Liminal 互相指认失陷位置",""],["2025-01-14","美日韩联合声明点名朝鲜","执法级归因。"],["2025-10","新加坡法院批准重组方案","随后复业并分配资产。","ok"]],
 roots:[["界面 ⇄ 数据","签名者依赖界面","硬件钱包没有解析原始交易，签名者无法发现差异。"],["多签 ⇄ 独立性","签名者共享同一界面","4 个签名来自同一条展示链路。"],["升级 ⇄ 审批","升级与转账走同一流程","最危险的操作没有额外门槛。"]],
 myths:[["多签被破解","多签按设计工作。被欺骗的是签名者的眼睛。"],["阈值是 5/6","核实结果为 4/6：5 个 WazirX 签名者，1 个 Liminal 签名者。"]],
 fixes:[["0","签名设备必须解析并显示交易类型、目标合约和关键参数。","② ③","构造一笔升级交易，硬件设备必须显示“升级”。"],["0","Safe 加 Guard：禁止 delegatecall、禁止修改实现地址。","④","测试网提交升级交易，Guard 必须回滚。"],["1","每个签名者用独立工具计算 safeTxHash 并互相核对。","③","签名 SOP 中加入哈希比对步骤。"],["2","按资产比例拆分多个冷钱包。","⑤","单钱包余额不超过总储备的设定比例。"]],
 signals:[["签名请求","交易类型为升级或 delegatecall","阻断，进入额外审批"],["链上","Safe 实现地址变化","立即告警，冻结相关地址"]],
 labs:["l2","l3"],
 sources:[["WazirX. Cyber Attack on WazirX: Preliminary Report（2024-07）","https://wazirx.com/blog/"],["Cointelegraph. WazirX $230M breach post-mortem（2024-07）","https://cointelegraph.com/news/wazirx-230m-breach-post-mortem"],["Inc42. Liminal's platform not responsible, confirms third-party forensic report","https://inc42.com/buzz/wazirx-hack-liminals-platform-not-responsible-confirms-third-party-forensic-report"],["U.S. Dept. of State. Joint Statement on Cryptocurrency Thefts by the Democratic People's Republic of Korea and Public-Private Collaboration（2025-01-14）", "https://2021-2025.state.gov/office-of-the-spokesperson/releases/2025/01/joint-statement-on-cryptocurrency-thefts-by-the-democratic-peoples-republic-of-korea-and-public-private-collaboration"]],
 limits:"失陷位置存在双方争议。本章不判断责任归属。"
},
{
 id:"c-bybit", name:"Bybit", sub:"一段只对 Bybit 生效的前端代码，签走 14.6 亿美元", date:"2025-02-21", type:"CEX", chain:"Ethereum", attr:"TraderTraitor（FBI 确认）", ev:"P+I",
 loss:1460,
 thesis:"攻击者没有碰 Bybit 的系统。攻击者攻破了多签钱包服务商 Safe{Wallet} 的一名开发者，<em>在 Safe 的网页里放了一段只在 Bybit 冷钱包签名时才生效的代码</em>。签名者看到普通转账，签出的是一次 delegatecall。",
 figs:[["$14.6 亿","401,347 ETH + stETH / mETH / cmETH","red"],["~2 分钟","执行后恶意 JS 被撤回"],["~3.8%","被冻结比例（随时间变化）","warn"],["72 小时","Bybit 补足储备","green"],["8 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"社工/人",name:"伪装开源贡献者",when:"2025-02 初",ev:["fact"],what:["攻击者伪装成开源贡献者，联系 Safe 的一名开发者。","攻击者诱导开发者运行一个项目（报道称是 Docker 项目）。"],how:"社会工程 + 开发工作流投毒。",block:"开发者不在工作机上运行外部项目。",att:"T1566 · T1195"},
  {d:"终端",name:"开发者 macOS 失陷",when:"约 02-04",ev:["fact"],what:["恶意代码在开发者的 macOS 上运行。"],how:"Mandiant 确认为朝鲜国家行为者。",block:"EDR；开发机与生产凭证隔离。",att:"T1204"},
  {d:"身份/会话",name:"劫持 AWS 会话",when:"02-05 起",ev:["fact"],what:["攻击者取得开发者的 AWS 会话令牌。","会话令牌绕过了 MFA。"],how:"窃取已认证会话，不需要密码和 MFA。",block:"短时令牌；令牌与设备绑定；异常地点登录告警。",att:"T1550.001"},
  {d:"云/内部平台",name:"篡改 S3 上的 JS",when:"02-19",ev:["fact"],what:["攻击者修改了 app.safe.global 在 AWS S3 上的前端 JS。","恶意代码只在签名者为 Bybit 冷钱包时激活。"],how:"定向供应链投毒。其他用户不受影响，因此难以被发现。",block:"前端资源完整性校验（SRI）；构建产物签名；S3 写入告警。",att:"T1195.002"},
  {d:"前端/界面",name:"界面显示正常转账",when:"02-21",ev:["fact"],what:["Bybit 从冷钱包向温钱包发起例行转账。","Safe 界面显示收款地址和金额都正常。"],how:"界面显示与发送给钱包的数据不一致。",block:"签名前用独立工具解码 calldata。"},
  {d:"签名/密钥",name:"多签盲签",when:"02-21 ~14:13 UTC",ev:["fact"],what:["多名签名者用硬件钱包签名。","硬件钱包只显示哈希，没有显示 operation = delegatecall。"],how:"盲签。",block:"硬件钱包清晰签名；第二台设备独立计算 safeTxHash。"},
  {d:"合约",name:"delegatecall 改 masterCopy",when:"同一笔交易",ev:["fact"],what:["交易以 delegatecall 调用攻击者合约。","攻击者合约改写 Safe 的 masterCopy（实现地址）。"],how:"delegatecall 在钱包自己的存储上执行外部代码。",block:"Safe Guard 禁止 delegatecall；只允许白名单模块。"},
  {d:"链上",name:"清空冷钱包",when:"02-21 ~14:13–14:15",ev:["fact"],what:["攻击者转出约 401,347 ETH 和 stETH、mETH 等。","约 2 分钟后，攻击者把 S3 上的 JS 改回原样。"],how:"攻击者合约直接控制钱包。",block:"冷钱包按金额拆分；大额冷转温需要额外延迟。"},
  {d:"洗钱",name:"THORChain 换 BTC",when:"02-21 → 03",ev:["fact"],what:["攻击者分散到数百个地址。","经 THORChain、eXch 等把 ETH 换成 BTC。"],how:"无许可跨链协议不封锁地址。",block:"行业共享情报；赏金计划追踪（Bybit 设 10% 赏金）。"}
 ],
 mermaid:`sequenceDiagram
  participant A as 攻击者
  participant D as Safe 开发者
  participant S3 as Safe AWS S3
  participant UI as 签名者浏览器
  participant HW as 硬件钱包
  participant SAFE as Bybit 冷钱包 Safe
  A->>D: 伪装开源贡献者 诱导运行项目
  D-->>A: AWS 会话令牌
  A->>S3: 上传定向恶意 JS 02-19
  UI->>S3: 加载 app.safe.global
  S3-->>UI: 若钱包 = Bybit 则替换交易
  UI->>HW: 待签数据 operation=delegatecall
  Note over UI,HW: 界面显示 普通转账
  HW-->>SAFE: 签名 x 阈值
  SAFE->>SAFE: masterCopy = 攻击者合约
  A->>SAFE: 转出 约 14.6 亿美元
  A->>S3: 约 2 分钟后撤回恶意 JS`,
 readpts:["从开发者到冷钱包，没有一个环节属于 Bybit 自己的系统。Bybit 的风险来自它信任的供应商前端。","定向代码只对一个目标生效，这让常规的前端监控很难发现。","局限：开发者被诱导运行的项目细节来自媒体报道。"],
 analogy:"银行的支票本由印刷厂提供。小偷收买了印刷厂的一台机器，只在印给这家银行的支票上把收款人一栏印成隐形墨水。",
 timeline:[["约 2025-02-04","Safe 开发者 macOS 失陷","日期来自 Safe 与 Mandiant 复盘，二手转引。"],["02-05","攻击者开始使用 AWS 会话",""],["02-19","恶意 JS 上传到 S3","",""],["02-21 ~14:13 UTC","冷钱包签名，约 14.6 亿美元转出","","hot"],["~14:15","恶意 JS 被撤回","","hot"],["02-23","已冻结约 4,289 万美元","","ok"],["02-24","Bybit 称已补足储备","约 72 小时。","ok"],["02-26","FBI 发布公告，归因 TraderTraitor",""]],
 extra:"",
 roots:[["开发者 ⇄ 云","开发者会话可写生产前端","一台开发机的会话可以改全球用户加载的 JS。"],["前端 ⇄ 签名","签名依赖网页","网页决定了签名者看到什么。"],["签名 ⇄ 合约","钱包允许 delegatecall","一次签名可以替换整个钱包逻辑。"],["冷钱包 ⇄ 金额","单一冷钱包金额过大","一次签名的损失上限是 14.6 亿美元。"]],
 myths:[["Bybit 私钥泄露","没有。签名者用真实私钥签了一笔被篡改的交易。"],["Safe 合约有漏洞","Safe 合约按设计运行。被攻破的是 Safe 的前端和云基础设施。"],["用了硬件钱包就安全","硬件钱包只显示哈希时，签名者仍然是盲签。"]],
 fixes:[["0","签名前用独立工具（另一台设备、命令行）解码 calldata 并比对 safeTxHash。","⑤ ⑥","红队在测试环境替换前端数据，签名者必须发现。"],["0","Safe Guard 禁止 delegatecall 和实现地址变更。","⑦","提交一笔 delegatecall 交易，必须回滚。"],["1","冷钱包按金额拆分；冷转温设定单笔上限和延迟窗口。","⑧","单次签名的最大可转出金额 ≤ 设定值。"],["1","前端构建产物签名 + SRI；生产 S3 写入需要双人审批。","④","用开发者凭证直接写 S3，必须失败或告警。"],["2","供应商安全评估：开发者终端、云会话策略、前端发布流程。","① ② ③","年度评估问卷覆盖以上三项。"]],
 signals:[["供应商云","S3 前端文件在非发布时段变化","回滚并通知客户"],["签名请求","Safe 交易 operation = 1（delegatecall）","阻断签名"],["链上","Safe masterCopy 变化；冷钱包大额转出","触发熔断与冻结请求"]],
 labs:["l2","l4"],
 unknowns:["开发者被诱导运行的项目的完整细节。","攻击者在 AWS 内的全部操作记录。","为什么签名者的操作流程没有独立解码 calldata。"],
 sources:[["FBI IC3. North Korea Responsible for $1.5 Billion Bybit Hack（PSA250226，2025-02-26）","https://www.ic3.gov/PSA/2025/PSA250226"],["Cointelegraph. Safe Wallet releases Bybit hack post-mortem（2025-03）","https://cointelegraph.com/news/safe-wallet-releases-bybit-hack-post-mortem"],["The Hacker News. SafeWallet confirms North Korean TraderTraitor hackers（2025-03）","https://thehackernews.com/2025/03/safewallet-confirms-north-korean.html"],["SecurityWeek. How social engineering sparked a billion-dollar supply chain heist","https://www.securityweek.com/how-social-engineering-sparked-a-billion-dollar-supply-chain-cryptocurrency-heist/"],["Sygnia. Bybit – What We Know So Far（2025-03）", "https://www.sygnia.co/blog/sygnia-investigation-bybit-hack/"]],
 limits:"冻结比例随调查更新，从 3% 到 3.8% 不等。本章取最新值。"
},
{
 id:"c-bitget", cut:4, name:"Bitget", sub:"安全产品成了入口，提现工具是攻击者自己写的", date:"2026-09-24", type:"CEX", chain:"9 条链（XRP、ETH、ZEC、ARB、AVAX…）", attr:"研究机构判断朝鲜（未获执法确认）", ev:"P+I",
 loss:387.5,
 thesis:"攻击者先利用一款第三方安全产品的 0day，从环境变量读出数据库密码。随后经另一款管理平台进入生产钱包任务服务器，<em>用自己写的提现工具伪造风控参数</em>。钱包系统按“合法”指令签了名，私钥没有泄露。",
 figs:[["$3.875 亿","修订后金额（初报 3.516 亿）","red"],["24 秒","两波转出合计约 2.9 亿美元","red"],["2h 39m","告警到关停签名服务","warn"],["< 0.3%","被冻结比例（约 110 万美元）"],["5 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"供应商",name:"安全产品 0day",when:"08-31 起",ev:["fact","unk"],what:["第三方“产品 A”的节点服务存在 0day。","攻击者执行隐藏脚本，从环境变量读出数据库密码。","09-23、09-25 在其他节点再次出现同类活动。"],how:"安全产品通常拥有高权限，又很少被当作攻击面监控。",block:"安全产品本身纳入资产监控与网络隔离；密钥不放在环境变量里。",att:"T1190 · T1552.001",note:"SlowMist 日志显示最早活动为 08-31。Mandiant 称特权访问从 09-24 开始。两份报告的口径不同。"},
  {d:"身份/会话",name:"冒用内部员工身份",when:"09-24 16:07 UTC",ev:["fact","unk"],what:["攻击者以一名内部员工的身份登录“产品 B”管理平台。","攻击者做了 3 次命令注入，并通过 Web 执行端点提交代码。"],how:"该员工身份如何被取得，未公开。",block:"管理平台强制 MFA + IP 白名单；命令执行需要审批。",att:"T1078 · T1059"},
  {d:"云/内部平台",name:"横向到钱包服务器",when:"09-24 16:07–17:49",ev:["fact"],what:["攻击者在设备 B 上放置 Web shell 和 C2。","攻击者用管理平台的下发能力，横向移动到生产钱包任务服务器。","攻击者部署恶意软件包。"],how:"安全管理平台能向生产服务器下发命令。",block:"安全管理面与钱包网段隔离；下发命令需要双人确认。",att:"T1505.003 · T1072"},
  {d:"签名/密钥",name:"伪造提现指令",when:"09-24 17:49",ev:["fact"],what:["攻击者启动自制提现工具。","工具伪造风控参数，调用正常的提现流程。","钱包系统把这些请求当作合法提现并签名。"],how:"签名端信任上游的风控结果，不独立核验。",block:"签名端独立核验提现意图，并与账本逐笔对账。",note:"Bitget 和 Mandiant 均排除私钥泄露。"},
  {d:"链上",name:"两波闪电转出",when:"18:31 → 21:23 UTC",ev:["fact"],what:["18:31 先做小额测试（93 TRX、0.84 ETH）。","19:01:20–35，第一波 15 秒转出约 8,760 万美元。","19:16，第二波 9 秒转出约 2.031 亿美元。","21:23:11 最后一笔。"],how:"热钱包和温钱包同时被调用。冷钱包未受影响。",block:"按钱包、按链的速率与金额熔断。"},
  {d:"云/内部平台",name:"响应只停了一半",when:"19:05 → 21:44",ev:["fact"],what:["19:05 对账发现异常。平台停止用户提现，但签名服务继续运行。","19:14 进入最高级应急。","21:44 才关停签名服务。告警后约 2.4 亿美元继续流出。"],how:"“暂停提现”与“停止签名”是两个开关。",block:"一键停止签名服务；演练从告警到停签的时间。",note:"这是本案最可借鉴的一点：告警比损失早，但处置开关选错了。"},
  {d:"洗钱",name:"反取证与换币",when:"21:22 起",ev:["fact"],what:["攻击者尝试篡改提现记录。两笔伪造的 BTC 订单报错。","攻击者删除工具与命令痕迹。","USDT 在 20 分钟内换成 ETH；约 90.5% 的 XRP 经 THORChain 换成 BTC；3,259 ZEC 进入屏蔽池。"],how:"—",block:"日志实时外送到不可篡改存储。"}
 ],
 mermaid:`flowchart LR
  A["攻击者"] -->|"0day"| PA["产品 A 节点"]
  PA -->|"读环境变量"| DB["数据库密码"]
  A -->|"冒用员工身份"| PB["产品 B 管理平台"]
  PB -->|"命令注入 + Web shell"| WS["钱包任务服务器"]
  WS -->|"自制提现工具"| RK["伪造风控参数"]
  RK --> SIG["签名服务"]
  SIG --> HOT["热 / 温钱包 x 12"]
  HOT -->|"15 秒 + 9 秒"| OUT["约 3.9 亿美元"]
  ALERT["19:05 告警"] -.->|"只停用户提现"| WD["提现网关"]
  ALERT -.->|"21:44 才停"| SIG`,
 readpts:["两条虚线是处置路径。19:05 的告警只切断了用户提现网关，没有切断签名服务，攻击者的工具直接调用签名。","两款被利用的产品都属于“安全与运维管理面”。它们的权限高于普通业务系统。","局限：两款产品名称未公开，与 Mandiant 报告中“设备 A/B”的对应关系是推断。"],
 analogy:"小偷先撬开了保安室，用保安的对讲机给金库下令“按风控审批放款”。金库发现账不对后关了柜台窗口，但金库后门的传送带还在运转。",
 timeline:[["2026-08-31","最早的恶意活动（SlowMist 日志）","",""],["09-24 16:07 UTC","冒用员工身份进入产品 B","",""],["17:49","启动自制提现工具","","hot"],["18:31","小额测试转账","","hot"],["19:01:20","第一波：15 秒约 8,760 万美元","","hot"],["19:05","对账发现异常，停用户提现","签名服务仍在运行。"],["19:16","第二波：9 秒约 2.031 亿美元","","hot"],["21:44","关停签名服务","","ok"],["09-25","确认根因；初报 3.516 亿美元",""],["09-26/27","修订为 3.875 亿美元","来自补充核算，不是持续失窃。"],["09-28 → 10-02","分币种恢复提现；保护基金全额覆盖","","ok"],["09-30","Mandiant 与 SlowMist 发布初步报告",""]],
 extra:`<h3>按链分布</h3><div class="bars">${[["XRP",157.8],["ETH 系",126.6],["ZEC",29.4],["Arbitrum",19.7],["AVAX",16.8],["OP",15.4],["BNB",9.9],["TRX",7],["Base",4.2]].map(r=>`<div class="barrow"><span>${r[0]}</span><div class="trk"><div style="width:${r[1]/157.8*100}%"></div></div><span class="v">$${r[1]}M</span></div>`).join("")}</div><p class="note">数据来源：链上追踪汇总（Halborn、TRM）。各链合计约 3.87 亿美元。</p>`,
 roots:[["安全产品 ⇄ 生产","安全管理面可下发到钱包服务器","最高权限的工具成了最短的攻击路径。"],["风控 ⇄ 签名","签名信任上游结果","伪造的风控参数直接变成签名。"],["告警 ⇄ 处置","停提现不等于停签名","处置开关没有覆盖攻击者实际使用的路径。"]],
 myths:[["私钥被盗了","没有。钱包系统被伪造指令驱动后签了名。"],["安全产品保护了系统","被利用的入口正是第三方安全产品。"],["朝鲜已确认","Chainalysis、Elliptic 判断与朝鲜相关；TRM 称尚未确定；Mandiant 不归因；没有政府归因。"]],
 fixes:[["0","签名服务设独立开关，按钱包、链一键停签；纳入应急第一步。","⑥","演练：告警到停签小于 5 分钟。"],["0","签名端独立核验提现请求：与账本订单逐笔比对，不信任上游风控字段。","④","伪造一条无对应订单的提现请求，签名端必须拒绝。"],["1","安全与运维管理面单独分区，不能直接向钱包服务器下发命令。","② ③","从管理平台向钱包服务器下发命令，必须失败。"],["1","第三方安全产品纳入漏洞管理与行为监控；凭据不放环境变量。","①","资产清单包含全部安全产品节点及其凭据位置。"],["2","日志实时外送到不可篡改存储。","⑦","删除本地日志后，远端日志仍完整。"]],
 signals:[["安全产品节点","隐藏脚本读取环境变量","隔离节点，轮换凭据"],["管理平台","命令注入；Web 执行端点被调用","封禁账号，冻结下发"],["钱包任务服务器","未知软件包；未知进程调用提现接口","停签，保全现场"],["链上","15 秒内多链大额转出","停签，通知冻结方"]],
 labs:["l4","l8"],
 unknowns:["产品 A、产品 B 的名称与漏洞编号。","攻击者如何取得内部员工身份。","自制提现工具如何通过风控参数校验。"],
 sources:[["Halborn. Bitget Hack Technical Analysis（2026-09）","https://www.halborn.com/blog/post/bitget-hack-technical-analysis-september-2026"],["TRM Labs. Bitget loses $351.6 million in hot wallet breach","https://www.trmlabs.com/resources/blog/bitget-loses-usd-3516-million-in-hot-wallet-breach-in-likely-north-korea-attack"],["The Hacker News. Bitget confirms third-party zero-day（2026-10）","https://thehackernews.com/2026/10/bitget-confirms-third-party-zero-day.html"],["CNBC. Bitget suspects North Korea in $352 million hack（2026-09-25）","https://www.cnbc.com/2026/09/25/crypto-platform-bitget-suspects-north-korea-in-352-million-hack.html"],["BleepingComputer. Bitget hacked via zero-day in third-party security products（2026-09-30）", "https://www.bleepingcomputer.com/news/security/bitget-hacked-via-zero-day-in-third-party-security-products/"]],
 limits:"截至 2026-11-07 没有最终报告。时间点来自 Mandiant / SlowMist 初步报告的二手汇总，部分时刻存在冲突（发现时间 18:31 或 19:05）。"
},
{
 id:"c-binance", name:"Binance 热钱包事件", sub:"一台员工电脑变成钱包签名权", date:"2026-10-29", type:"CEX", chain:"多链（ETH、BTC、TRON、XRP、SOL…）", attr:"TraderTraitor（FBI 确认）", ev:"P+I",
 loss:6340, embed:"labs/binance-1029.html",
 thesis:"攻击者用 4 个月，经两名员工的终端、内部 AI 工具和容器部署平台，<em>走到了钱包签名服务</em>。最后 4 小时，攻击者用 EIP-7702 委托把以太坊热钱包变成自己的清扫合约。",
 figs:[["$63.4 亿","涉及资产（币安 11-03 披露）","red"],["$28.5 亿","已冻结或拦截","green"],["~4.5 个月","首次入口到转移"],["3h 50m","恶意委托在链上存活","red"],["8 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"社工/人",name:"被篡改的工具",when:"2026-06",ev:["fact"],what:["一名钱包开发工程师安装了被篡改的开发工具。","币安初步报告称是 AI 编码工具，部分报道称是假 Homebrew 安装程序。","币安更换了设备，轮换了凭证。工程师的岗位和同事关系仍然暴露。"],how:"搜索投毒或伪造安装程序。",block:"只从官方源安装工具；失陷处置时把“暴露的组织关系”也当作资产。",att:"T1583.008 · T1204.002"},
  {d:"社工/人",name:"假招聘面试",when:"2026-09",ev:["fact"],what:["第二名工程师在求职中参加假面试，包括与虚构公司“CEO”的视频会议。","工程师在工作电脑上运行了“面试作业”仓库。"],how:"Contagious Interview 模式。",block:"面试作业只在一次性虚拟机中运行。",att:"T1566.003 · T1195"},
  {d:"终端",name:"终端控制",when:"2026-09 → 10-20",ev:["fact"],what:["恶意脚本替换 pyenv，修改符号链接，外联并清除痕迹。","终端安全工具未告警。"],how:"替换合法开发工具的二进制。",block:"开发工具二进制完整性监控。",att:"T1554 · T1036 · T1070"},
  {d:"云/内部平台",name:"内部 AI 工具枢纽",when:"2026-10-20",ev:["fact","unk"],what:["攻击者借内部 AI 工具控制了两名钱包开发者的系统。"],how:"机制未公开。",block:"AI 工具按用户隔离身份；终端执行类工具调用需要人工确认。"},
  {d:"身份/会话",name:"窃取部署令牌",when:"2026-10-20",ev:["fact"],what:["攻击者在一名开发者电脑上找到容器部署令牌。"],how:"读取本地存放的凭证。",block:"终端不存放长期生产部署凭证；凭证与设备绑定。",att:"T1552.001 · T1528"},
  {d:"云/内部平台",name:"部署恶意容器",when:"10-29 17:15–19:56 UTC",ev:["fact"],what:["攻击者在另一名员工的电脑上，用窃取的令牌部署容器并触发恶意脚本。"],how:"部署平台只验证令牌。",block:"生产部署只走 CI/CD；镜像签名准入。",att:"T1610 · T1078"},
  {d:"签名/密钥",name:"滥用签名服务",when:"10-29 20:05 起",ev:["fact"],what:["恶意容器访问钱包签名服务，在提现流程之外发起交易。","20:05–20:09 五个热钱包转出约 2.3346 亿 XRP，随后是 SOL、OP、BTC 等。"],how:"签名服务接受了非预期请求。MPC 正常工作。",block:"MPC 前加独立策略层；签名熔断。"},
  {d:"合约",name:"EIP-7702 委托",when:"10-29 20:20:59",ev:["fact"],what:["签名服务签了 50 个 EIP-7702 授权，1 个生效。","Binance 14 热钱包的执行代码被委托给 sweeper 合约。"],how:"nonce 喷洒：覆盖一段 nonce，保证至少一个命中。",block:"默认拒绝 7702 授权签名。"},
  {d:"链上",name:"清扫与二次提取",when:"20:24 → 23:56",ev:["fact"],what:["sweeper 转出约 167,464 ETH 和 16.15 亿 USDT。","约 1 小时后再提取约 8.23 亿 USDC。","10-30 00:10:35 币安用零地址授权清除委托。"],how:"暂停提现不能撤销链上授权。",block:"监控热钱包委托代码；演练 MPC 撤销流程。"},
  {d:"洗钱",name:"多链分散",when:"10-30 → 11-07",ev:["fact"],what:["Elliptic：资金经过 2 万多个地址、16 条链、至少 36 个服务。","截至 11-07 约 2,300 BTC 经 THORChain 换出。约 31.3 亿美元仍在关联地址未动。"],how:"—",block:"行业冻结协作。"}
 ],
 timeline:[["2026-06","钱包开发工程师安装被篡改的工具",""],["2026-09","第二名工程师参加假面试",""],["10-20","经内部 AI 工具控制两名开发者的系统",""],["10-29 17:15 UTC","部署恶意容器","","hot"],["20:05","签名服务被滥用，XRP 转出","","hot"],["20:20:59","50 个 7702 授权，1 个生效","","hot"],["10-30 00:10:35","零地址授权清除委托","","ok"],["10-31","FBI 归因 TraderTraitor",""],["11-03","币安发布初步调查结果","冻结或拦截 28.5 亿美元。"],["11-04/05","用户资产补足约 98%","第二次储备证明快照覆盖 44 个币种。","ok"],["11-07","Elliptic 更新洗钱追踪","约 31.3 亿美元仍未移动。"]],
 roots:[["终端 ⇄ 身份","凭证可被复制","令牌在另一台设备上可用。"],["员工 ⇄ AI 工具","AI 工具成为权限聚合点","一名员工的会话能操作其他员工的设备。"],["容器 ⇄ 签名服务","工作负载身份过宽","恶意容器触达签名服务，路径未公开。"],["签名 ⇄ 链上","签名不看意图","签名服务签了 7702 授权。"]],
 myths:[["0-day 漏洞攻击","币安说的是“0-day malware”，指未被检测的恶意软件。"],["私钥泄露","币安称没有私钥泄露证据。"],["EIP-7702 有漏洞","7702 按规范运行。约 40% 的损失在与 7702 无关的链上。"],["损失 = 63.4 − 28.5 亿","涉及、冻结、补足、追回是不同的数，不能相减。"]],
 fixes:[["0","MPC 前加独立策略层：校验交易类型、目的地址、金额、速率；默认拒绝 7702 授权。","⑦ ⑧","提交一个 7702 授权，策略层必须拒绝。"],["0","按钱包、链、交易类型设置签名熔断。","⑦","告警到熔断小于 5 分钟。"],["0","生产部署令牌改为短期、限域、设备绑定。","⑤ ⑥","复制令牌到另一台设备，调用必须失败。"],["1","内部 AI 工具每个用户、Agent、连接器独立身份。","④","用 B 的会话访问 A 的工作区，必须被拒绝。"]],
 labs:["l7","l8","l4"],
 sources:[["Binance. 29 October 2026 Binance Security Incident: Initial Findings and Response Update（2026-11-03）","https://www.binance.com/en/blog/community/3229153443759566763"],["FBI. North Korea Responsible for $6 Billion+ Binance Attack（2026-10-31）","https://www.fbi.gov/investigate/cyber/alerts/2026/north-korea-responsible-for-6-billion-binance-attack"],["Chainalysis. Binance exploit: latest findings and response","https://www.chainalysis.com/blog/binance-exploit-latest-findings-and-response/"],["Elliptic. How North Korea is laundering the $6.4 billion stolen from Binance（2026-11-07 更新）","https://elliptic.co/insights/how-north-korea-is-laundering-the-6-4-billion-stolen-from-binance"],["CoinDesk. Binance's $6.3 billion hack began with a fake job interview（2026-11-03）","https://www.coindesk.com/business/2026/11/03/binance-s-usd6-3-billion-hack-began-with-a-fake-job-interview-exchange-says"],["原版交互复盘的完整来源列表见下方嵌入页。",""]],
 limits:"总额有 63 亿、63.4 亿、64 亿、64.3 亿四种口径。6 月入口的工具类型，币安报告与媒体说法不同。"
}
);
