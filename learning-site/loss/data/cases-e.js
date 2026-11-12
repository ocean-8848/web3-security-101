/* 独立案件章 · E 组（第二批，2025–2026）：WOO X、SwissBorg/Kiln、Balancer v2、Drift、KelpDAO、Liquid Network */
H.cases.push(
{
 id:"c-woox", name:"WOO X", sub:"一次“帮忙调试”，改掉了 9 个大户的 2FA", date:"2025-07-24", type:"CEX", chain:"BTC / ETH / BNB Chain / Arbitrum", attr:"UNC4899（受害方判断）", ev:"P", arch:"A", fam:["人员与终端","身份与会话","云与内部平台","监控与对账"],
 loss:14,
 thesis:"攻击者在开源论坛请一名开发者帮忙调试。文件经手机 AirDrop 进入公司 MacBook，后门落地。之后的 16 天里，攻击者从 GCP 到 GKE 一路提权，最后<em>直接改数据库里 9 个大户的邮箱、密码和 2FA 种子</em>，再走正常提现。热钱包私钥没有被碰。",
 figs:[["$1,400 万","9 个账户","red"],["16 天","后门落地到首笔盗提"],["~1h 50m","首笔盗提到止损","warn"],["100%","WOO X 国库全额赔付","green"],["5 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"社工/人",name:"开源协作求助",when:"2025-06-28",ev:["fact"],what:["外部人员在开源论坛请 WOO X 开发者帮忙调试一个项目。"],how:"以“开源协作”为名投递恶意文件，不是钓鱼邮件。",block:"外部代码只在沙箱或一次性虚拟机中打开。",att:"T1566"},
  {d:"终端",name:"AirDrop 进公司电脑",when:"07-08",ev:["fact"],what:["开发者在手机上下载文件，AirDrop 到公司 MacBook，用 Cursor 打开。","扫描没有发现问题，后门落地。"],how:"绕过了邮件与下载网关。",block:"公司设备禁用 AirDrop 接收；IDE 禁止打开项目时自动执行任务。",att:"T1204.002"},
  {d:"身份/会话",name:"复用已认证会话",when:"07-09",ev:["fact"],what:["攻击者复用已通过 2FA 的 VPN 会话，进入 GCP。","GCP 会话时长为 24 小时。"],how:"会话劫持。",block:"会话时长缩短并做设备校验（事后改为 8 小时）。",att:"T1550"},
  {d:"云/内部平台",name:"GKE 提权与潜伏",when:"07-10 → 07-24",ev:["fact"],what:["攻击者进入 GKE，侦察 Argo CD 与 Apollo 配置中心。","攻击者用恶意 pod 取得 K8s 管理服务账号令牌，在微服务中留下后门。","攻击者取得数据库凭证。"],how:"—",block:"K8s 最小权限；admission 控制拒绝未签名镜像。",att:"T1610 · T1528"},
  {d:"云/内部平台",name:"改账户安全设置",when:"07-24",ev:["fact"],what:["攻击者直接修改数据库：9 个大户的邮箱、密码与 2FA 种子。"],how:"绕过所有应用层校验。",block:"敏感字段变更必须经应用层并触发二次确认；数据库直写告警。"},
  {d:"签名/密钥",name:"走正常提现",when:"07-24 05:50 UTC",ev:["fact"],what:["攻击者登录这 9 个账户，发起提现。","提现系统按正常流程签名。"],how:"账户已被“合法”接管。",block:"安全设置变更后锁定提现 24–48 小时。"},
  {d:"链上",name:"约 2 小时盗提",when:"05:50 → 07:40 UTC",ev:["fact"],what:["约 1,400 万美元转出。","07:40 UTC 发现并止损，暂停全站提现。"],how:"—",block:"提现行为风控：账户历史与本次提现的偏离度。"}
 ],
 mermaid:`flowchart LR
  F["开源论坛 求助调试"] --> M["手机下载"]
  M -->|"AirDrop"| MAC["公司 MacBook + Cursor"]
  MAC --> V["已过 2FA 的 VPN 会话"]
  V --> G["GCP → GKE"]
  G --> SA["K8s 管理 SA 令牌"]
  SA --> DB["数据库凭证"]
  DB -->|"直写"| ACC["9 个大户 邮箱 密码 2FA"]
  ACC --> W["正常提现 约 1,400 万"]`,
 readpts:["攻击者没有碰钱包。他改的是“谁是这个账户的主人”。","数据库直写绕过了应用层的所有风控。任何“改密码、改 2FA”都应只能经过应用层。","局限：攻击者在 16 天潜伏期内的完整操作未公开。"],
 timeline:[["2025-06-28","开源论坛求助调试",""],["07-08","文件经 AirDrop 进入公司电脑，后门落地",""],["07-09","进入 GCP",""],["07-10","进入 GKE",""],["07-24 05:50 UTC","首笔盗提","","hot"],["07:40 UTC","发现并止损，暂停全站提现","","ok"],["之后","国库 100% 赔付，发布复盘","","ok"]],
 roots:[["设备 ⇄ 传输","AirDrop 绕过网关","文件进入公司设备时没有经过任何检查点。"],["会话 ⇄ 时长","24 小时会话可复用","2FA 只在登录时生效一次。"],["数据库 ⇄ 应用","敏感字段可被直写","账户安全设置的变更没有走应用层。"]],
 myths:[["钓鱼邮件","入口是“开源协作”投递，经 AirDrop 落地。"],["热钱包被盗","热钱包私钥没有被动。攻击者篡改用户账户后走正常提现。"],["已过 2FA 就安全","被复用的正是已通过 2FA 的会话。"]],
 fixes:[["0","账户安全设置变更后锁定提现 24–48 小时","⑥","改 2FA 后立即提现，必须被拒。"],["0","数据库敏感字段直写告警；变更只能经应用层","⑤","直接 UPDATE 用户 2FA 字段，5 分钟内告警。"],["1","公司设备禁用 AirDrop；外部代码只在沙箱打开","① ②","MDM 策略检查。"],["1","云会话 ≤ 8 小时并绑定设备","③","复制会话到另一台设备，访问失败。"]],
 labs:["l1"],
 sources:[["WOO X. July 24th Security Incident Post-Mortem","https://woox.io/blog/july-24th-security-incident-post-mortem"],["The Block. WOO X investigates contained incident resulting in estimated $14 million loss（2025-07）","https://www.theblock.co/post/364188/centralized-exchange-woo-x-investigates-contained-incident-resulting-in-estimated-14-million-loss"],["Rekt. WOO X – REKT","https://rekt.news/woox-rekt"]],
 limits:"归因为受害方判断，文中同时提到 UNC5565 嫌疑。"
},
{
 id:"c-kiln", name:"SwissBorg / Kiln", sub:"质押服务商的 API 在正常交易旁边夹了 8 条指令", date:"2025-08-31", type:"关联服务", chain:"Solana", attr:"未知（Kiln 称手法类似国家级）", ev:"P", arch:"A", fam:["身份与会话","云与内部平台","供应商","前端与界面","签名与密钥"],
 loss:41.5,
 thesis:"SwissBorg 通过 Kiln 的 API 发起一次解除质押。Kiln 的基础设施已被攻破，API 返回的交易里<em>除了正常的 deactivate，还夹带了 8 条 Authorize 指令</em>，把质押账户的提款权限改给攻击者。托管方的多签照常签了名。8 天后，资金被提走。",
 figs:[["~192,600 SOL","约 4,000 万–4,150 万美元","red"],["8 条","夹带的 Authorize 指令","red"],["> 15 万 SOL","只针对这一规模以上的账户"],["8 天","权限被改到被发现"],["6 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"身份/会话",name:"GitHub 令牌被盗",when:"2025-08 前",ev:["fact","unk"],what:["一名 Kiln 基础设施工程师的 GitHub 令牌被盗。","令牌如何被盗，Kiln 也没有查清。"],how:"—",block:"细粒度、短时效令牌；硬件密钥。",att:"T1528"},
  {d:"供应商",name:"借 CI 取凭证",when:"2025-08",ev:["fact"],what:["攻击者在 IaC 仓库里建分支后立即删除，借此触发 CI。","CI 运行时泄露了 secrets 和 AWS / GCP 凭证。"],how:"CI 使用长期 secret，且任何分支都能触发。",block:"受保护分支；CI 用 OIDC 短时凭证。",att:"T1552"},
  {d:"云/内部平台",name:"注入运行中的 pod",when:"2025-08",ev:["fact"],what:["攻击者向运行中的 K8s pod 注入 payload，不留持久化痕迹。","操作来自数千个 IP。"],how:"—",block:"只读容器；运行时检测。"},
  {d:"前端/界面",name:"API 夹带恶意指令",when:"08-31",ev:["fact"],what:["Kiln Connect API 在正常的 deactivate 交易旁附带恶意指令。","只对持有超过 15 万 SOL 的账户生效。"],how:"定向投毒，降低被发现概率。",block:"客户侧独立解码与模拟交易。"},
  {d:"签名/密钥",name:"多签照常签名",when:"08-31",ev:["fact"],what:["托管方多签 quorum 批准了交易。","8 条 Authorize 指令把 stake 账户的提款权限改给攻击者。"],how:"签名者只看到“解除质押”。",block:"权限变更类指令设白名单策略；签名服务逐条解析指令。"},
  {d:"链上",name:"解锁后提走",when:"09-08",ev:["fact"],what:["质押解锁后，攻击者提走约 192,600 SOL。","Kiln 发现异常，SwissBorg 几分钟内察觉。约 100 SOL 打到 Bitget 试探冻结。"],how:"权限 8 天前已改，资金在解锁后才转走。",block:"监控 stake 账户的 withdraw authority 变化。"}
 ],
 mermaid:`sequenceDiagram
  participant A as 攻击者
  participant CI as Kiln CI
  participant API as Kiln Connect API
  participant SB as SwissBorg
  participant MS as 托管方多签
  participant ST as Stake 账户
  A->>CI: 被盗 GitHub 令牌 建分支即删
  CI-->>A: secrets + 云凭证
  A->>API: 注入运行中 pod
  SB->>API: 请求 deactivate
  API-->>SB: deactivate + 8 条 Authorize
  SB->>MS: 提交签名
  MS-->>ST: 提款权限 = 攻击者
  Note over ST: 8 天后解锁
  A->>ST: 提走约 192,600 SOL`,
 readpts:["与 Bybit 同一原理，界面换成了 API：签名者签的是供应商给的数据。","Solana 交易可以包含多条指令。只解析第一条，等于盲签。","局限：攻击者取得 GitHub 令牌的方式未公开。"],
 timeline:[["2025-08-31","恶意交易被签名，提款权限被改","SwissBorg 博客写为 09-08，与 Kiln 不一致。","hot"],["09-08","资金被提走；Kiln 发现异常","","hot"],["09-09/10","Kiln 退出全部 ETH 验证者","预防性措施。"],["10-07","Kiln 发布事件说明",""],["之后","SwissBorg 承诺以自有资金赔付","","ok"]],
 roots:[["CI ⇄ 凭证","CI 暴露长期 secret","任意分支可触发 CI 并拿到云凭证。"],["API ⇄ 签名","签名方信任供应商构造的交易","交易内容没有被独立解析。"],["权限 ⇄ 监控","提款权限变化无告警","权限被改 8 天无人发现。"]],
 myths:[["SwissBorg 被黑","SwissBorg 自身系统没有被入侵。"],["Solana 漏洞","Solana 按规则执行。被改的是 Kiln 的 API 输出。"],["8 月 31 日资金被盗","那天只改了权限。资金在 9 月 8 日解锁后才转走。"]],
 fixes:[["0","签名前逐条解析全部指令；Authorize 类指令默认拒绝","④ ⑤","构造含 Authorize 的交易，签名服务必须拒绝。"],["0","监控 stake 账户 withdraw authority 的任何变化","⑥","权限变化 1 分钟内告警。"],["1","供应商 CI 使用 OIDC、受保护分支（写入供应商评估）","②","供应商问卷要求提供 CI 凭证策略。"]],
 labs:["l2"],
 sources:[["Kiln. Re-enablement of Kiln services and security incident information（2025-10-07）","https://www.kiln.fi/post/re-enablement-of-kiln-services-and-security-incident-information"],["SwissBorg. Security update: Kiln breach（2025-09）","https://swissborg.com/blog/swissborg-security-update-kiln-breach"],["Halborn. Explained: The SwissBorg Hack（2025-09）","https://www.halborn.com/blog/post/explained-the-swissborg-hack-september-2025"],["The Record. European crypto platform SwissBorg to reimburse users after $41 million theft（2025-09-10）", "https://therecord.media/swissborg-platform-solana-cryptocurrency-stolen"]],
 limits:"精确 UTC 时间未公开。签名日期两方说法不一致。"
},
{
 id:"c-balancer", name:"Balancer v2", sub:"每次少算一点点，一笔交易里重复 65 次", date:"2025-11-03", type:"DeFi", chain:"Ethereum / Arbitrum / Base / Polygon / Optimism / Gnosis 等", attr:"未知", ev:"P+I", arch:"B", fam:["合约","熔断"],
 loss:128,
 thesis:"Balancer 的 ComposableStable 池在换算精度时<em>一律向下取整</em>。在“指定输出”的兑换里，这让攻击者需要付出的数量被少算一点。攻击者在一次 batchSwap 里先把余额压到舍入边界，再重复“预备、利用、复位”，把池子不变量 D 压低，BPT 价格随之下跌。",
 figs:[["~$1.28 亿","含分叉项目（Balancer 自身口径约 1.21 亿）","red"],["6+ 条链","同类池被复制攻击"],["~$2,800 万","白帽、内部救援与 StakeWise 追回","green"],["多次审计","合约此前经多家审计","warn"],["3 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"合约",name:"舍入方向错误",when:"长期存在",ev:["fact"],what:["_upscale 一律用 mulDown 向下取整。","在 _swapGivenOut（指定输出）中，这让 amountIn 被少算。"],how:"舍入方向对用户有利，对协议不利。",block:"所有舍入方向始终对协议有利；不变量模糊测试。"},
  {d:"预言机/市场",name:"压到舍入边界",when:"2025-11-03 ~07:46 UTC",ev:["fact"],what:["攻击者在一次 batchSwap 中先把池子某种代币余额压到极小，进入舍入边界。","然后重复“预备 → 利用 → 复位”三步。","每次利用都让不变量 D 下降一点。"],how:"小误差在一笔交易里被放大数十倍。",block:"限制单个 batch 内 D 的变化幅度；设最低余额。"},
  {d:"链上",name:"低价买 BPT 获利",when:"同日",ev:["fact"],what:["D 下降使 BPT 价格被压低。攻击者低价获得 BPT 并赎回。","利用与提款分为两笔交易。研究称利用发生在合约构造函数中。"],how:"—",block:"异常 D 变化的链上监控与暂停。"},
  {d:"链上",name:"多链复制",when:"11-03",ev:["fact"],what:["同类池在 Ethereum、Arbitrum、Base、Polygon、Optimism、Gnosis 及分叉项目上被复制攻击。","该类池已过暂停窗口，无法暂停。"],how:"暂停能力有期限。",block:"暂停能力不应随时间失效。"},
  {d:"治理",name:"救援与追回",when:"11-03 → 后续",ev:["fact","infer"],what:["外部白帽约 386 万美元、Certora 协助的内部救援约 411 万美元、StakeWise 追回约 1,970 万美元 osETH/osGNO。","据报道，部分链采取停链或冻结措施。","BIP-892：白帽赏金 10%，每次上限 100 万美元。"],how:"—",block:"—"}
 ],
 mermaid:`flowchart LR
  A["batchSwap 开始"] --> B["压低余额到舍入边界"]
  B --> P["预备"]
  P --> X["利用 指定输出兑换 amountIn 少算"]
  X --> R["复位"]
  R -->|"重复约 65 次"| P
  R --> D["不变量 D 下降"]
  D --> BPT["BPT 价格被压低"]
  BPT --> G["低价获得 BPT 赎回获利"]`,
 readpts:["单次舍入误差极小。漏洞在于它可以在一笔交易内被无限次重复。","不变量 D 是池子的“总价值尺子”。尺子被缩短，每份 BPT 就显得更便宜。","局限：循环次数与每步数值来自安全公司复盘，各家描述略有差异。"],
 analogy:"收银机每次找零少找 1 分钱，对顾客有利。有人站在柜台前一口气结账 65 次，每次都让收银机的账本少记一点。",
 timeline:[["2025-11-03 ~07:46 UTC","首次利用","OpenZeppelin 记为约 07:40。","hot"],["11-03","多链同类池被复制攻击","","hot"],["11-05","Balancer 初步报告",""],["之后","BIP-892 分配救援资金",""],["之后","后续报告称追回加保护共约 4,570 万美元","据转述，口径与 2,800 万不同。","ok"]],
 roots:[["精度 ⇄ 方向","舍入方向对协议不利","每次计算都向攻击者让利。"],["批处理 ⇄ 放大","batchSwap 允许无限重复","小误差可被放大到全部流动性。"],["暂停 ⇄ 期限","暂停窗口已过","发现攻击后无法止损。"]],
 myths:[["访问控制或预言机问题","根因是数学舍入。"],["审计过就安全","合约经过多次审计，仍有舍入缺陷。"],["1.28 亿都是 Balancer 的损失","1.28 亿包含分叉项目。Balancer 自身口径约 1.21 亿。"]],
 fixes:[["0","舍入方向统一对协议有利；对每个数学函数写方向断言","①","fuzz：任意输入下，池子价值不下降。"],["0","单笔交易内不变量变化幅度上限","②","在一笔 batchSwap 中使 D 下降 > 0.1%，交易必须回滚。"],["1","暂停能力不设失效期，由时间锁控制","④","任何时候都能在 1 小时内暂停任一池。"]],
 labs:["l1"],
 sources:[["Balancer. Nov 3 Exploit Post-Mortem","https://medium.com/balancer-protocol/nov-3-exploit-post-mortem-51dcbeb6b020"],["Balancer Forum. BIP-892 Distribution of rescued funds","https://forum.balancer.fi/t/bip-892-distribution-of-rescued-funds-from-balancer-v2-november-3rd-2025-attacks/6883"],["OpenZeppelin. Understanding the Balancer v2 Exploit","https://www.openzeppelin.com/news/understanding-the-balancer-v2-exploit"],["BlockSec. In-depth analysis: the Balancer v2 exploit","https://blocksec.com/blog/in-depth-analysis-the-balancer-v2-exploit"],["Check Point Research. How an attacker drained $128M from Balancer","https://research.checkpoint.com/2025/how-an-attacker-drained-128m-from-balancer-through-rounding-error-exploitation/"]],
 limits:"损失口径有 9,480 万（初步报告用户资金）、1.211 亿、1.2–1.28 亿等多种。部分链的停链与冻结措施未经本次核实。"
},
{
 id:"c-drift", name:"Drift Protocol", sub:"永不过期的预签名 + 零时间锁", date:"2026-04-01", type:"DeFi", chain:"Solana", attr:"受害方与研究判断朝鲜（UNC4736 关联）", ev:"P+I", arch:"A", fam:["人员与终端","签名与密钥","阈值","经济参数","熔断"],
 loss:283,
 thesis:"攻击者假扮量化公司，线下见面、线上维护关系，还往生态 Vault 存了 100 多万美元建立信任。签名人被诱导<em>预签了绑定 durable nonce 的交易</em>，这种签名不会过期。新多签是 2/5、时间锁为 0。两笔预签交易一提交，admin 就易主了。",
 figs:[["~$2.8 亿","Drift 口径（另有 2.86 亿、2.95 亿）","red"],["2 / 5","新安全委员会多签门槛","red"],["0","timelock","red"],["~12 分钟","31 笔提款"],["6 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"社工/人",name:"假量化公司",when:"2025 秋 → 2026-03",ev:["fact"],what:["攻击者在行业会议上当面接触 Drift 团队，再转到 Telegram。","攻击者向生态 Vault 存入 100 万美元以上，建立信任。"],how:"线下接触 + 线上维护 + 真金白银的信任投资。",block:"对合作方做 KYB；签名人反社工培训。"},
  {d:"终端",name:"恶意仓库与测试版钱包",when:"2026-03",ev:["fact"],what:["恶意仓库的 VS Code tasks.json 设了 folderOpen，打开即执行。","攻击者通过 TestFlight 分发“测试版钱包”。"],how:"IDE 自动任务 + 伪造移动应用。",block:"签名设备与开发设备隔离；禁用打开文件夹自动执行任务。",att:"T1204 · T1195"},
  {d:"签名/密钥",name:"预签 durable nonce 交易",when:"03-23 → 03-27",ev:["fact"],what:["03-23，攻击者建立 4 个 durable nonce 账户。","至少 2 名签名人被误导，预签了绑定 durable nonce 的交易。","03-27，安全委员会迁移到新的 2/5 多签，timelock 为 0。"],how:"Solana 普通交易约 1 分钟过期；durable nonce 交易不会过期。",block:"管理员操作禁用 durable nonce；签名前解码与模拟。",note:"预签名不是私钥泄露。签名人自己签了名，只是不知道签的是什么、何时会被用。"},
  {d:"治理",name:"夺取 admin",when:"04-01 ~16:05 UTC",ev:["fact"],what:["攻击者提交两笔预签交易，相隔 4 个 slot。","2/5 达到门槛，timelock 为 0，admin 立即易主。"],how:"—",block:"提高门槛；任何 admin 变更走时间锁。"},
  {d:"预言机/市场",name:"上架假抵押品",when:"04-01",ev:["fact"],what:["攻击者上架自建代币 CVT（铸约 7.5 亿枚），在 Raydium 刷量把价格做到约 1 美元。","攻击者存入 5 亿枚 CVT 作抵押，并把提款限额调高 20 倍以上。"],how:"admin 权限可以同时改资产列表与风控参数。",block:"上架资产审核流动性；风控参数有硬上限，修改走时间锁。"},
  {d:"链上",name:"12 分钟 31 笔提款",when:"04-01",ev:["fact"],what:["攻击者提走 USDC、JLP（约 4,172 万枚，约 1.55 亿美元）、SOL、cbBTC、wETH 等。"],how:"—",block:"提款熔断。"},
  {d:"洗钱",name:"换 ETH 并跨链",when:"04-01 起",ev:["fact"],what:["全部换成约 12.9 万 ETH。","约 2.32 亿美元 USDC 经 Circle CCTP 跨链，Circle 没有冻结，引发批评与诉讼。","资金经 Wormhole、deBridge 跨到以太坊。"],how:"—",block:"—"}
 ],
 mermaid:`flowchart LR
  C["会议接触 + Telegram + 存入 100 万"] --> R["恶意仓库 / 测试版钱包"]
  R --> PS["签名人预签 durable nonce 交易"]
  M["03-27 新多签 2/5 timelock=0"] --> AD
  PS -->|"04-01 提交 相隔 4 slot"| AD["admin 易主"]
  AD --> CVT["上架假代币 CVT 作抵押"]
  AD --> LIM["提款限额 x20"]
  CVT & LIM --> W["12 分钟 31 笔提款 约 2.8 亿"]`,
 readpts:["durable nonce 让“签名”与“执行”在时间上分离。签名人签名时，攻击者可以等多签配置变弱后再执行。","admin 一旦易主，资产列表、价格、限额都可被改。admin 权限等于全部风控参数。","局限：预签交易的具体内容与诱导话术未完全公开。"],
 analogy:"董事们签了几张没写日期的支票。几天后，公司把需要的签字人从 3 人改成 2 人，且取消了到账等待期。支票当天就兑现了。",
 timeline:[["2025 秋","会议上首次线下接触",""],["2026-03-11","攻击方从 Tornado 提出 10 ETH 做准备",""],["03-23","建立 4 个 durable nonce 账户",""],["03-27","安全委员会迁移到 2/5 多签，timelock 为 0","",""],["04-01 ~16:05 UTC","执行：admin 易主，31 笔提款","","hot"],["04-05 前后","Drift 发布社工复盘",""],["05-05","公布回收计划","资金来自剩余资产、交易所收入、Tether（最多 1.275 亿）等。","ok"]],
 roots:[["签名 ⇄ 时效","签名不会过期","durable nonce 把签名变成可延期兑现的支票。"],["多签 ⇄ 时间锁","2/5 + 0 timelock","没有任何窗口可以发现与撤回。"],["admin ⇄ 风控","admin 可以无限修改风控参数","上架假资产与调限额同时完成。"]],
 myths:[["合约漏洞","Drift 明确否认程序有 bug。"],["私钥泄露","签名人自己签了名。"],["“6 个月线下社工”","实际是线下接触、线上关系维护与恶意软件三者结合。"]],
 fixes:[["0","管理员与多签操作禁用 durable nonce","③","用 durable nonce 构造 admin 交易，签名流程必须拒绝。"],["0","admin 变更与风控参数修改走 ≥ 24 小时时间锁","④ ⑤","timelock 配置值 > 0 的链上检查。"],["1","新资产上架审核链上流动性与持有分布","⑤","上架前自动检查真实成交与持有人数量。"],["1","签名设备与开发设备隔离；IDE 禁止自动任务","②","签名设备不安装 IDE。"]],
 labs:["l3","l6"],
 sources:[["Drift Protocol. 初步声明（2026-04-01）","https://x.com/DriftProtocol/status/2039564437795836039"],["Drift Protocol. 社工复盘（2026-04）","https://x.com/DriftProtocol/status/2040611161121370409"],["BlockSec. Drift Protocol incident: multisig governance compromise via durable nonce","https://blocksec.com/blog/drift-protocol-incident-multisig-governance-compromise-via-durable-nonce-exploitation"],["Range. Inside the Drift exploit","https://range.org/blog/inside-the-drift-exploit-how-to-protect-your-protocol-and-multisigs-against-dprk-threat-actors"],["The Record. Drift confirms $280 million stolen, North Korea suspected","https://therecord.media/drift-crypto-confirms-280-million-stolen-north-korea"]],
 limits:"损失有 2.8 亿、2.853 亿、2.86 亿、2.954 亿等口径。归因为受害方与研究机构判断，没有执法公开归因。"
},
{
 id:"c-kelp", name:"KelpDAO rsETH", sub:"只有一个验证者，它看到的链是假的", date:"2026-04-18", type:"跨链桥", chain:"Unichain → Ethereum（LayerZero）", attr:"研究判断 TraderTraitor（Mandiant、CrowdStrike）", ev:"P+I", arch:"A", fam:["人员与终端","身份与会话","云与内部平台","阈值","经济参数"],
 loss:292,
 thesis:"KelpDAO 的跨链消息只需 <em>1 个 DVN 验证</em>。攻击者攻破一名开发者，在 DVN 依赖的 RPC 节点里做内存注入：对监控返回真实数据，只对 DVN 返回伪造的 burn 记录。再用 DoS 逼系统切换到被投毒的节点。DVN 签了证明，116,500 rsETH 被释放。",
 figs:[["116,500 rsETH","约 2.92 亿美元，约占供应量 18%","red"],["1-of-1","DVN 配置","red"],["~30,766 ETH","Arbitrum 安全委员会冻结","green"],["$1.2–2.3 亿","Aave 坏账估计","warn"],["7 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"社工/人",name:"恶意 terraform 仓库",when:"2026-03-06",ev:["fact"],what:["负责 RPC 的开发者被骗 clone 一个 GitHub 仓库，其中有伪造的 terraform provider。"],how:"开发工具链投毒。",block:"外部仓库只在沙箱运行。",att:"T1195"},
  {d:"终端",name:"macOS 后门",when:"03-06",ev:["fact"],what:["FLATROOF / ROOFDECK 后门植入，EDR 未检测到。"],how:"—",block:"EDR + 应用白名单。",att:"T1204"},
  {d:"身份/会话",name:"绕过 SSO + MFA",when:"03-30 → 04-16",ev:["fact"],what:["攻击者窃取会话密钥，绕过 SSO 与 MFA，再用 VPN 登录 GCP 与 GitHub。","攻击者侦察约两周半。"],how:"会话劫持。",block:"设备绑定的短时凭证。",att:"T1550"},
  {d:"云/内部平台",name:"RPC 内存注入",when:"04-16 → 04-18",ev:["fact"],what:["攻击者在两个区域的 GKE 上对 op-geth 进程做内存注入。","对监控返回真实数据，只对 DVN 返回伪造数据。"],how:"选择性投毒，监控看不到异常。",block:"多个独立来源交叉核对 RPC 结果。"},
  {d:"供应商",name:"DoS 外部 RPC",when:"04-18 16:30 UTC",ev:["fact"],what:["攻击者对外部 RPC 发起 DoS，迫使 DVN 故障切换到被投毒的节点。"],how:"用可用性攻击逼出完整性漏洞。",block:"数据源不足时拒绝签名，而不是降级。"},
  {d:"跨链",name:"DVN 签伪造证明",when:"04-18 17:35 UTC",ev:["fact"],what:["1-of-1 DVN 为一笔伪造的 Unichain burn（nonce 308）签名。","以太坊侧释放 116,500 rsETH。"],how:"DVN 私钥没有泄露。它如实签了它看到的“链”。",block:"多个独立 DVN（不同运营方、不同 RPC）。"},
  {d:"链上",name:"存入借贷借 WETH",when:"04-18",ev:["fact"],what:["攻击者把无背书的 rsETH 存入 Aave、Compound、Euler，借出 WETH。","约 46 分钟后 Kelp 暂停合约，后续两次投递被拦截。"],how:"无背书资产在下游协议仍被当作抵押。",block:"借贷协议对 LRT 设供给上限。"},
  {d:"洗钱",name:"换 BTC",when:"04-18 起",ev:["fact"],what:["经 THORChain、Chainflip、Umbra 等换成 BTC。","04-21 03:26 UTC，Arbitrum 安全委员会 9/12 投票冻结约 30,766 ETH。"],how:"—",block:"—"}
 ],
 mermaid:`flowchart LR
  DEV["开发者 clone 恶意仓库"] --> BD["macOS 后门"]
  BD --> S["会话密钥 绕过 SSO+MFA"]
  S --> GKE["GKE 上的 op-geth"]
  GKE -->|"内存注入"| RPC["投毒 RPC"]
  RPC -->|"真实数据"| MON["监控"]
  RPC -->|"伪造 burn"| DVN["1-of-1 DVN"]
  DOS["DoS 外部 RPC"] -->|"故障切换"| DVN
  DVN --> REL["释放 116,500 rsETH"]
  REL --> LEND["Aave / Compound / Euler 借出 WETH"]`,
 readpts:["这是“验证者数据源”而不是“验证者私钥”被攻破。签名正确，输入是假的。","DoS 被用来制造故障切换。系统在数据源不足时选择“降级继续”，而不是“停止签名”。","1-of-1 的配置责任存在争议：LayerZero 称 Kelp 自行改为 1-of-1 且多次被警告；Kelp 称这是文档默认配置。"],
 analogy:"银行只派一个人去查对方账户是否真的扣了款。小偷先切断他常用的电话，逼他打一个被替换过的号码，那头的人说“扣了”。",
 timeline:[["2026-03-06","开发者被社工，后门植入",""],["03-30 → 04-16","侦察",""],["04-16 → 04-18","横向移动，RPC 投毒",""],["04-18 16:30 UTC","DoS 外部 RPC","","hot"],["04-18 17:35 UTC","伪造 burn 被签名，116,500 rsETH 释放","","hot"],["~18:21","Kelp 暂停合约","","ok"],["04-19 / 04-20","LayerZero 声明；Kelp 反驳",""],["04-21 03:26 UTC","Arbitrum 冻结约 30,766 ETH","","ok"],["05-18","LayerZero 发布正式报告","改为 3-of-3 基线；Kelp 迁到 Chainlink CCIP。"]],
 roots:[["DVN ⇄ 数量","单一验证者","1-of-1 = 单点。"],["RPC ⇄ 独立性","验证者的数据源可被同一攻击者控制","没有多源交叉核对。"],["可用性 ⇄ 完整性","故障时降级而非停止","DoS 被转化为数据投毒。"],["下游 ⇄ 抵押","无背书 rsETH 被借贷协议接受","损失外溢到 Aave 等协议。"]],
 myths:[["DVN 私钥泄露","没有。DVN 如实签了它看到的伪造数据。"],["投毒或 DDoS 二选一","两者同时使用。"],["LayerZero 协议失效","链上协议按配置运行。争议在配置与默认值。"]],
 fixes:[["0","跨链验证使用 ≥ 3 个独立 DVN，各自使用不同运营方的 RPC","⑥","列出每个 DVN 的 RPC 来源，独立来源 ≥ 3。"],["0","数据源不足时拒绝签名","⑤","断开 2 个 RPC，验证者必须停止签名。"],["1","借贷协议对 LRT 设供给上限与暂停开关","⑦","单一 LRT 供给 ≤ 该资产真实流动性的设定倍数。"],["1","开发者终端：外部仓库进沙箱，会话设备绑定","① ② ③","红队投递恶意 terraform provider。"]],
 labs:["l3"],
 sources:[["LayerZero. KelpDAO Incident Report（2026-05-18）","https://layerzero.network/publications/kelpdao-incident-report.pdf"],["LayerZero. KelpDAO incident statement（2026-04-19）","https://layerzero.network/blog/kelpdao-incident-statement"],["KelpDAO. 回应声明（2026-04-20）","https://x.com/KelpDAO/status/2046332070277091807"],["CoinDesk. Kelp DAO claims LayerZero's default settings caused the $290 million disaster（2026-04-20）","https://www.coindesk.com/tech/2026/04/20/kelp-dao-claims-layerzero-s-default-settings-are-what-actually-caused-the-usd290-million-disaster"],["Rekt. KelpDAO – REKT","https://rekt.news/kelpdao-rekt"]],
 limits:"损失有 2.92 亿与 2.937 亿两种口径。被拦截的后续投递金额，Rekt 与 Kelp 说法不同。归因为研究机构判断。"
},
{
 id:"c-liquid", name:"Liquid Network", sub:"修复已经写好，只是没有发布", date:"2026-09-06", type:"跨链桥", chain:"Liquid（BTC 联邦侧链）", attr:"未知（攻击方自称白帽）", ev:"I+M", arch:"B", fam:["合约","熔断","监控与对账"],
 loss:320,
 thesis:"Elements 节点的 range proof 验证缓存，<em>缓存键只包含证明和隐藏金额，不包含资产类型和脚本</em>。攻击者预先铺设 68 个相同的证明，让错误的缓存结果被复用，铸出没有比特币背书的 L-BTC，再通过 peg-out 换回真 BTC。修复代码在一个多月前已提交，但没有进入任何发布版本。",
 figs:[["3,996 BTC","约 3.2 亿美元，联邦钱包余额从 4,205 降到 203","red"],["~85%","归还 3,400 BTC","green"],["598.5 BTC","攻击方索要“10% 赏金”，被拒绝","warn"],["34 天","修复提交到被利用"],["4 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"链上",name:"小额 peg-in 与铺设证明",when:"09-04 → 09-06",ev:["fact"],what:["09-04，攻击者做两笔小额 peg-in。","攻击前约 14 小时，攻击者铺设 68 个相同的 range proof。","09-06 11:30–13:16 UTC，三次 peg-out 试探。"],how:"为缓存命中做准备。",block:"异常模式监测：重复的 range proof。"},
  {d:"合约",name:"缓存键缺字段",when:"09-06",ev:["fact"],what:["range proof 验证结果被缓存，缓存键只含 proof 与隐藏金额。","不同资产与脚本的交易复用了同一个“验证通过”结果。","区块 4,050,336 中铸出无背书的 L-BTC。"],how:"节点级（共识代码）缺陷。",block:"缓存键覆盖完整上下文；安全修复及时进入发布版本。",note:"修复在 08-03 已提交到 Elements master。联邦节点运行的是 23.3.3，不包含修复。"},
  {d:"供应商",name:"经 SideSwap peg-out",when:"09-06 14:28:56 UTC",ev:["fact"],what:["攻击者通过联邦成员 SideSwap 的 peg-out 服务燃烧 L-BTC、申请提币。","SideSwap 自身没有被入侵。"],how:"合法服务被用来兑现伪造资产。",block:"peg-out 限额与人工复核。"},
  {d:"签名/密钥",name:"联邦照常签名",when:"09-06",ev:["fact"],what:["11-of-15 联邦按“有效”链状态签名，放出约 3,996 BTC。","联邦密钥没有泄露。"],how:"联邦信任自己运行的节点软件。",block:"储备与 L-BTC 发行量对账，偏离即熔断。"},
  {d:"洗钱",name:"停链、归还与拒付",when:"09-07 → 09-11",ev:["fact"],what:["09-07 04:49 停止出块；16:09 攻击方归还 3,400 BTC。","攻击方用 OP_RETURN 索要剩余 598.5 BTC 作为“10% 赏金”。09-11 Blockstream 拒绝，称将配合执法。"],how:"—",block:"—"}
 ],
 mermaid:`flowchart LR
  P["铺设 68 个相同 range proof"] --> C{"验证缓存 键 = proof + 隐藏金额"}
  C -->|"缺 asset 与 scriptPubKey"| H["错误命中 视为已验证"]
  H --> M["铸出无背书 L-BTC 约 4,000"]
  M --> S["SideSwap peg-out"]
  S --> F["11-of-15 联邦签名"]
  F --> BTC["放出 3,996 BTC"]
  FIX["08-03 修复已提交 master"] -.->|"未进入 release 23.3.3"| C`,
 readpts:["联邦多签（11-of-15）没有失效。它们如实为节点认为有效的状态签了名。","“修复已提交但未发布”与 Wormhole 2022 相反：Wormhole 是公开补丁先于部署，Liquid 是补丁迟迟没有部署。两者都是补丁管理问题。","局限：一手材料主要是 Blockstream 在 X 上的帖子，铸币时刻有 13:53 与 15:53 两种记录。"],
 timeline:[["2026-08-03","修复提交到 Elements master","未进入发布版本。"],["09-04","两笔小额 peg-in",""],["09-06 11:30–13:16 UTC","三次 peg-out 试探",""],["09-06 13:53（另记 15:53）","区块 4,050,336 铸出无背书 L-BTC","","hot"],["14:28:56","peg-out 完成，约 3,996 BTC 放出","","hot"],["09-07 04:49","停止出块",""],["09-07 16:09","归还 3,400 BTC","","ok"],["09-09","发布 Elements v23.3.4","","ok"],["09-11","Blockstream 拒绝支付剩余赏金",""]],
 roots:[["缓存 ⇄ 上下文","缓存键不完整","不同交易被当成同一笔已验证交易。"],["修复 ⇄ 发布","安全修复停留在主分支","联邦节点没有运行修复版本。"],["发行 ⇄ 储备","没有储备与发行量的实时熔断","4,000 BTC 无背书铸造未被即时拦截。"]],
 myths:[["联邦密钥被盗","没有任何密钥被盗。"],["比特币主链有问题","缺陷在 Liquid 侧链的 Elements 节点。"],["自称白帽就是负责任披露","攻击方先提走资金再索要赏金，与负责任披露流程不同。"]],
 fixes:[["0","安全修复走紧急发布流程，合并后 72 小时内进入发布版本并部署","②","统计“安全提交 → 发布 → 部署”的时间，目标 ≤ 72 小时。"],["0","peg-out 储备与 L-BTC 发行量实时对账，偏离即暂停 peg-out","④","模拟发行量多出 1 BTC，peg-out 必须暂停。"],["1","缓存键做代码审查清单项：必须覆盖全部影响结果的字段","②","审查清单中加入“缓存键完整性”。"]],
 labs:["l1"],
 sources:[["TRM Labs. 2026's biggest hack to date: Liquid Network（2026-09）","https://trmlabs.com/resources/blog/2026s-biggest-hack-to-date-attackers-drained-usd-319-million-in-bitcoin-from-liquid-network-then-returned-85-of-funds"],["The Block. Blockstream refuses ransom demand for remaining 600 BTC（2026-09-11）","https://www.theblock.co/news/ecosystems/2026-09-11-blockstream-refuses-ransom-demand-for-remaining-600-btc-from-liquid-exploit-414247"],["Liquid. 事件公告（2026-09）","https://x.com/Liquid_BTC/status/2097404704028545175"],["crypto.news. Liquid Network $320 million drain: cache bug","https://crypto.news/liquid-network-320-million-drain-cache-bug-unbacked-bitcoin/"],["Halborn. Explained: The Liquid Network Hack（2026-09）","https://www.halborn.com/blog/post/explained-the-liquid-network-hack-september-2026"]],
 limits:"数字主要来自 TRM、The Block 等对 Blockstream 帖子的转述。铸币数有约 4,000 与 3,998.5 两种写法。"
}
);
H.soon=[];
