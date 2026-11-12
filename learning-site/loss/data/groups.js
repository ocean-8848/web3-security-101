/* 第 2 部分 手法归纳 G01–G10 + 第 3 部分 防御与附录 */
(function(){
const G=[
{id:"g01",code:"G01",title:"根因未公开的大额热钱包失守",techs:["T13"],big:true,
 intro:"这一类事件的共同点只有结果：热钱包或暖钱包的资产在短时间内被转出，平台没有公开入口。它们数量最多，单起金额常超过 1,000 万美元。因为链路未知，本手册不为它们单独成章。",
 mermaid:`flowchart LR
  E["入口 ?<br/>未公开"] -.-> K["热钱包签名能力<br/>私钥 / 签名服务 / 提现系统"]
  K --> T["多链批量转出<br/>数分钟到数小时"]
  T --> L["跨链 · 混币 · 场外"]
  K -.->|"共同的可控变量"| H["热钱包余额规模"]
  T -.->|"共同的可控变量"| S["发现到停签的时间"]`,
 readpts:["入口未知，但损失大小由两个已知变量决定：热钱包里有多少钱，以及从告警到停止签名要多久。","这两个变量与入口无关。所以即使不知道攻击路径，也可以先做这两件事。","局限：表中部分事件的“热钱包”属性来自受害方描述。"],
 why:["平台只公布“热钱包异常转出”，没有公布入口。","研究机构常给出朝鲜关联判断，但缺少执法确认。","Poloniex、CoinEx、HTX、KuCoin 等的初始入侵方式至今未公开。"],
 examples:[["KuCoin 2020（$2.85 亿）","热钱包私钥受影响。KuCoin 联合项目方冻结与迁移合约，后续口径约 2.85 亿美元，冻结、追回与保险覆盖金额不同。"],["Poloniex 2023（$1.3 亿）","CertiK 按密钥失陷分析，初始入侵未披露。与 HTX、HECO 事件时间相近，研究机构判断与朝鲜关联。"],["Phemex 2025（$69M）","多链热钱包在约 1 小时内被连续转出，各家估算 6,910 万到 8,500 万美元。"]],
 controls:[["0","热钱包余额 ≤ 数小时提现量；限制自动补充","L4 中把余额上限调到 20%，观察损失"],["0","签名服务一键熔断，按链、按钱包","告警到停签 < 5 分钟"],["1","多链转出速率与金额阈值","单钱包 10 分钟内转出超过阈值时自动停签"],["1","链上资产与账本实时对账","任何未对应订单的转出 1 分钟内告警"]],
 labs:["l4","l1"]},
{id:"g02",code:"G02",title:"私钥与签名者失陷",techs:["T1"],
 intro:"攻击者拿到了私钥、MPC 分片或签名服务的调用能力，然后签出“合法”交易。入口多为社工 + 终端恶意软件，也有密钥生成缺陷（Profanity、Ledger 应用 nonce）。",
 mermaid:`flowchart LR
  S["社工<br/>假招聘 · 假客户 · 钓鱼"] --> T["终端失陷"]
  T --> C["会话 / 云凭据"]
  C --> K{"签名能力"}
  G["密钥生成缺陷<br/>弱随机数 · nonce 复用"] --> K
  K -->|"私钥"| X1["直接签名"]
  K -->|"签名服务"| X2["伪造签名请求"]
  X1 & X2 --> OUT["链上转出"]`,
 readpts:["“私钥泄露”与“签名能力被滥用”是两件事。后者私钥完好，但签名系统签了不该签的东西（Binance 热钱包事件、Bitget）。","密钥生成缺陷不需要入侵：Wintermute 的 Profanity 地址可以从公钥暴力还原私钥。","局限：多数事件只公开“私钥受影响”，不公开如何受影响。"],
 why:["攻击者最终都取得了签名能力。","防线在“谁能触达签名”和“签名前谁核对意图”。"],
 examples:[["Wintermute 2022（$1.6 亿）","金库使用 Profanity 工具生成的靓号地址。Profanity 只用 32 位种子，攻击者从公钥暴力还原私钥。见 L9。"],["BitoPro 2025（$11.5M）","云运维人员遭社工，攻击者劫持 AWS 会话，在热钱包升级迁移期间模拟正常运维操作转出资产。"],["WOO X 2025（$14M）","外部协作项目的恶意程序进入开发者终端，再经 Kubernetes 权限和数据库访问，修改账户并提现。5 层，第二批成章。"],["Mixin 2023（$2 亿）","云服务商的数据库被入侵，热钱包密钥外泄。"]],
 controls:[["0","签名设备与办公网隔离；私钥不落盘，使用 HSM 或 MPC","任一台服务器失陷，不能独立签出交易"],["0","签名前独立策略层：交易类型、目的地址、金额、速率","见 L8"],["1","靓号地址与自研密钥工具做熵审计","见 L9"],["1","运维与开发人员的招聘社工演练","红队投递假 offer"]],
 labs:["l8","l9","l1"]},
{id:"g03",code:"G03",title:"盲签、界面篡改与供应商通道",techs:["T2","T12"],
 intro:"签名者看到的内容与实际签名的数据不一致。篡改发生在签名者与链之间的某个环节：网页前端、托管商界面、供应商的交易构造 API 或通信通道。",
 mermaid:`flowchart LR
  I["签名者意图<br/>转账到温钱包"] --> UI["界面 / 供应商通道"]
  UI -->|"被篡改"| D["待签数据<br/>升级 · delegatecall · 改权限"]
  D --> HW["硬件钱包<br/>只显示哈希"]
  HW --> SIG["有效签名"]
  SIG --> CH["链上执行"]
  V["独立核验<br/>第二台设备解码 calldata"] -.->|"本可发现"| D`,
 readpts:["Bybit、WazirX、Radiant 2024、DMM、SwissBorg/Kiln 走的是同一条路：界面或通道被改，签名者照常签名。","硬件钱包只有在“清晰签名”时才是独立核验点。只显示哈希时，它只证明“我签了”，不证明“我签对了”。","局限：Kiln 的恶意交易来自 API，不是网页前端。图中“界面 / 供应商通道”合并表示。"],
 why:["签名者使用真实私钥，签名完全有效。","攻击者不需要接触受害方的系统。"],
 examples:[["Radiant 2024（$50M）","3 名签名者设备被植入恶意软件。Safe 界面正常，后台替换了待签交易。Mandiant 归因 UNC4736。"],["SwissBorg / Kiln 2025（$41.5M）","Kiln 工程师的 GitHub 令牌失窃，攻击者经 CI 取得基础设施凭据。交易构造 API 返回的 unstake 交易夹带了提款权限转移。"],["Fortress Trust 2023（$13.5M）","第三方云工具供应商受影响，托管客户资产被转走。"]],
 controls:[["0","签名前在独立设备上解码 calldata，核对 safeTxHash","见 L2"],["0","Safe Guard 禁止 delegatecall 与实现地址变更","测试网提交升级交易必须回滚"],["1","交易请求端到端签名，通道不能改内容","在通道中修改一个字节，签名端必须拒绝"],["1","供应商安全评估覆盖开发终端、云会话、发布流程","合同写明审计权"]],
 labs:["l2","l1"]},
{id:"g04",code:"G04",title:"多签与验证者阈值",techs:["T3"],
 intro:"桥和多签钱包用“M 个签名者中至少 N 个同意”来分散风险。失效原因几乎都是：签名者并不独立。它们属于同一组织、同一云账号、同一台运维机，或者阈值本身太低。",
 mermaid:`flowchart TB
  subgraph 表面["表面：9 个签名者"]
    A1["S1"] --- A2["S2"] --- A3["S3"] --- A4["S4"] --- A5["S5"] --- A6["S6"] --- A7["S7"] --- A8["S8"] --- A9["S9"]
  end
  subgraph 实际["实际：按组织"]
    O1["组织 A<br/>S1–S4 + 代签 S5"]
    O2["组织 B–E<br/>S6–S9"]
  end
  O1 -->|"攻破 1 个组织"| T["5 / 9 达到阈值"]`,
 readpts:["阈值应按“攻击者需要攻破几个独立组织”计算，不按签名者个数。","Ronin：5/9，实际只需攻破 1 个组织。Harmony：2/5。Orbit：7/10，但签名者私钥同时失陷。","KelpDAO 2026：LayerZero 配置为 1-of-1 DVN。一个验证者的 RPC 被投毒，就等于全部验证者被投毒。"],
 why:["攻击者凑够了阈值。","每一起事件都能用“最少需要攻破几个组织”这一个数解释。"],
 examples:[["Harmony Horizon 2022（$1 亿）","2/5 多签热钱包。攻击者拿到 2 把私钥。FBI 归因 Lazarus。"],["Orbit Bridge 2024（$81.5M）","7/10 签名者私钥失陷。研究机构怀疑朝鲜。"],["Drift 2026（$2.8 亿）","6 个月线下社工后，2/5 签名者预签了 durable nonce 交易，timelock 为 0。第二批成章。"],["KelpDAO 2026（$2.9 亿）","1-of-1 DVN 的 RPC 被投毒，伪造 burn 消息释放 116,500 rsETH。第二批成章。"]],
 controls:[["0","按独立实体设计阈值：最小攻破组织数 ≥ 3","见 L3"],["0","临时授权带到期时间","每月比对签名权限与审批单"],["1","验证者使用不同云、不同 RPC、不同运维团队","列出每个签名者的依赖清单"],["1","阈值变更与管理员操作走时间锁","timelock > 0，变更可被取消"]],
 labs:["l3"]},
{id:"g05",code:"G05",title:"账户接管：钓鱼、2FA 与 API Key",techs:["T8"],
 intro:"攻击者不碰平台钱包，而是接管用户账户：钓鱼取得密码和 2FA、利用账户恢复缺陷、或拿到用户授权给第三方工具的 API Key。单个用户损失小，合计可达数千万美元。",
 mermaid:`flowchart LR
  P["钓鱼站 · 恶意插件 · 数据泄露"] --> C["密码 + 2FA / API Key"]
  R["账户恢复缺陷<br/>SMS 恢复"] --> C
  V["第三方工具泄露<br/>3Commas"] --> C
  C --> A["登录或调用 API"]
  A -->|"提现"| W["外部地址"]
  A -->|"交易权限"| M["对敲拉盘<br/>把价值转到攻击者账户"]`,
 readpts:["只有交易权限、没有提现权限的 API Key 也能造成损失：攻击者用受害账户高价买入自己挂出的代币（Binance VIA 2018）。","阻止外部提现不等于用户零损失。","局限：此类事件的总金额通常未披露。"],
 why:["入口在用户侧或第三方工具。","平台的风控决定损失上限。"],
 examples:[["Binance 2019（7,000 BTC）","钓鱼与恶意代码取得 API Key 和 2FA，多账户协同通过原有检查后一次性提现。"],["Crypto.com 2022（$34M）","2FA 被绕过，483 个账户发生未授权提现。"],["Coinbase 2021","SMS 账户恢复缺陷，至少 6,000 名客户资金被转出。"]],
 controls:[["0","新设备、新 IP 提现冷却期；提现地址白名单","新设备登录后 24 小时内不能提现到新地址"],["0","API Key 默认无提现权限，绑定 IP","无 IP 绑定的 Key 不能交易低流动性币种"],["1","异常交易模式检测：多账户同时买入同一低流动性币","见 G08 的价格操纵模式"]],
 labs:["l1"]},
{id:"g06",code:"G06",title:"前端、DNS 与软件供应链",techs:["T7"],
 intro:"攻击者篡改用户加载的代码：网页前端、第三方统计脚本、npm 包、浏览器扩展、域名解析。用户在“官方”页面上签名或授权。",
 mermaid:`flowchart LR
  subgraph 上游
    N["npm 包维护者"]
    D["域名注册商 / DNS"]
    C["CDN / Cloudflare API"]
    E["扩展商店发布密钥"]
  end
  N & D & C & E -->|"被钓鱼或凭据泄露"| F["用户加载的前端代码"]
  F --> X["替换收款地址 / 请求无限授权"]
  X --> U["用户签名"]
  U --> L["资产转出"]`,
 readpts:["上游任意一个环节被改，所有下游用户同时受影响。影响面大，单笔金额可能小。","BadgerDAO 2021 是最早的大额案例：Cloudflare API 密钥被盗，前端被注入请求无限授权的脚本，损失约 1.2 亿美元。","Trust Wallet 扩展 2025：Shai-Hulud 蠕虫 → GitHub 密钥 → Chrome 商店 API key → 发布恶意版本，5 层。"],
 why:["用户使用的是“官方”渠道。","攻击者控制的是代码分发，不是钱包。"],
 examples:[["Gate.io / StatCounter 2018","统计服务的 JS 被投毒，只在 Gate.io 提现页面替换 BTC 收款地址。"],["Ledger Connect Kit 2023","前员工的 npm 账号被钓鱼，恶意版本影响大量 dApp 约 5 小时。"],["BigONE 2025（$27M）","第三方攻击影响生产环境，账户与风控逻辑被操纵。"],["npm chalk/debug 2025","维护者被钓鱼，18 个包植入地址替换代码。直接资损很小，影响面极大。"]],
 controls:[["0","前端资源 SRI + 构建产物签名","篡改一个 JS 文件，浏览器必须拒绝加载"],["0","域名注册商开启注册商锁与硬件 MFA","每季度检查域名账户的 MFA 状态"],["1","依赖锁定版本 + 发布延迟窗口","新版本依赖在 72 小时后才进入构建"],["1","钱包对“无限授权”做显著警告","前端请求 approve(max) 时，钱包必须显示警告"]],
 labs:["l2"]},
{id:"g07",code:"G07",title:"合约逻辑漏洞",techs:["T4"],
 intro:"合约按代码运行，但代码表达的规则与设计者想要的规则不一致。常见形态：重入、舍入与精度、访问控制、初始化、默认值、溢出、外部调用参数未校验。",
 mermaid:`flowchart TB
  R["重入<br/>The DAO · Fei Rari · Curve/Vyper · GMX v1"]
  P["舍入与精度<br/>Balancer v2 · KyberSwap · Hundred · zkLend"]
  A["访问控制与初始化<br/>Parity · Nomad · Poly"]
  V["输入校验<br/>Wormhole · Qubit · Socket · LI.FI"]
  O["溢出与检查错误<br/>Cetus · Truebit"]
  I["缺失不变量<br/>Euler"]
  R & P & A & V & O & I --> X["合约放款给不该得到的人"]`,
 readpts:["六种形态的共同根因：某个“任何时候都必须成立”的不变量，没有在每条代码路径上被检查。","舍入类漏洞常需要“空池”或“首个存款人”条件。新市场上线时风险最高。","编译器也会出错：Curve 的重入锁本身写对了，Vyper 0.2.15–0.3.0 编译后失效。"],
 why:["没有私钥泄露，没有人被骗。","防线在开发、审计、升级和监控。"],
 examples:[["Cetus 2025（$2.23 亿）","checked_shlw 溢出检查写错。攻击者用极少代币换出巨额流动性。Sui 验证者冻结约 1.62 亿美元，引发去中心化争议。第二批成章。"],["Balancer v2 2025（$1.28 亿）","ComposableStable 池 EXACT_OUT 路径舍入，batchSwap 内压低 BPT 价格。合约此前经过多次审计。第二批成章。"],["Curve / Vyper 2023（$70M）","Vyper 编译器的重入锁缺陷影响多个池。约 5,200 万美元被归还。"]],
 controls:[["0","把不变量写成测试：模糊测试 + 形式化验证覆盖所有公开函数","CI 中每个 PR 运行不变量测试"],["0","升级前在主网分叉上回放历史交易","Nomad 式的初始化错误在回放中必须失败"],["1","新市场上线时预存种子流动性，防止空池舍入","新池首笔存款由协议方完成"],["1","链上监控 + 暂停开关","异常放款 1 分钟内告警，10 分钟内可暂停"]],
 labs:["l1"]},
{id:"g08",code:"G08",title:"预言机、价格操纵与治理攻击",techs:["T5","T6"],
 intro:"每一步都按设计运行。攻击者改变的是输入：市场价格、抵押品估值、投票权。闪电贷让攻击者在一笔交易内拥有巨额资本。",
 mermaid:`flowchart LR
  F["闪电贷 / 自有资金"] --> M["推高浅市场价格"]
  M --> O["预言机报出新价格"]
  O --> C["抵押品估值上升"]
  C --> B["借出真资产"]
  F --> V["买入治理代币"]
  V --> G["当场投票通过恶意提案"]
  G --> T["转走金库"]`,
 readpts:["上半条是价格操纵（Mango、Cream、Harvest、Tectonic），下半条是治理攻击（Beanstalk）。","两条都依赖同一个假设：“当前市场状态代表真实价值”。","Tectonic 2026：TONIC 被拉高约 100–300 倍后借空 9 个市场。Cronos 回滚 10,961 个区块恢复约 1.11 亿美元，又引出“回滚伦理”问题。"],
 why:["没有代码漏洞，没有私钥泄露。","损失上限由风险参数决定。"],
 examples:[["Beanstalk 2022（$1.82 亿）","闪电贷取得 67% 投票权，emergencyCommit 在同一笔交易里执行恶意提案。第二批成章。"],["Cream 2021-10（$1.3 亿）","向 yUSD 金库“捐赠”抬高其价格，再用闪电贷循环借出。"],["Ostium 2026（$23.75M）","报价签名者失陷，攻击者以虚构价格开平仓。"]],
 controls:[["0","低流动性资产的抵押率、借款上限按市场深度设置","可借金额 < 拉盘成本，见 L6"],["0","TWAP + 多源中位数；偏离阈值时暂停借贷","现货拉高 3 倍，借款必须暂停"],["1","治理投票快照在提案前；借入代币不能投票","闪电贷代币投票必须无效"],["1","治理执行走时间锁","提案通过到执行 ≥ 24 小时"]],
 labs:["l6"]},
{id:"g09",code:"G09",title:"链共识、重组与入账缺陷",techs:["T10","T11"],
 intro:"交易所把“链上看到了充值”当作“充值已确定”。如果链可以被重组，或者入账系统识别错了资产，平台就会给不存在的充值记账。",
 mermaid:`flowchart LR
  A["攻击者充值 X"] --> E["交易所入账 → 兑换 → 提走"]
  A2["攻击者私下挖一条更长的链<br/>其中没有这笔充值"] --> R["发布私链 链重组"]
  R --> X["充值消失"]
  E --> L["交易所亏损"]
  X --> L
  F["假资产 / 解析错误<br/>假 APT · 未完成充值"] --> E`,
 readpts:["双花攻击的成本 = 租用算力的时长 × 价格。确认数越多，攻击者要维持的时间越长。见 L5。","ETC 2019 和 2020 多次被 51% 攻击，交易所在 2020 年把 ETC 确认数提高到数千个。","入账缺陷不需要算力：Upbit 2023 把非预期代币记为 APT；Kraken 2024 允许未完成充值形成余额。"],
 why:["攻击对象是交易所的入账逻辑。","链本身按共识规则运行。"],
 examples:[["OKEx / ETC 2020（$5.6M）","ETC 多数算力攻击与重组。交易所确认并兑出的充值随后失效。"],["Kraken 2024（约 $3M）","入账实现缺陷，未完成真实充值即可形成余额。CertiK 研究团队提款引发白帽争议。"],["Flow 2025（$3.9M）","执行层漏洞伪造资产后跨链转出，验证者暂停链。"]],
 controls:[["0","按链的算力成本动态设定确认数","见 L5"],["0","充值识别以合约地址 + 事件签名为准，不以代币名称为准","构造同名假代币，必须不入账"],["1","入账与链上余额逐笔对账","入账总额与链上地址余额每小时比对"]],
 labs:["l5"]},
{id:"g10",code:"G10",title:"内部人员、流程缺陷与争议事件",techs:["T9","T14"],
 intro:"这一组收录三类：内部人员作恶或被收买；流程缺陷（旧地址继续收款、离职权限未收回）；以及成功阻断、性质有争议的事件。成功阻断的案例与失败案例一样有价值。",
 mermaid:`flowchart LR
  I["内部人员<br/>收买 · 离职未收权 · 卧底开发者"] --> P["合法权限"]
  P --> A["数据泄露 / 资金转移"]
  Q["流程缺陷<br/>旧地址 · 二次审核 · 迁移窗口"] --> A
  B["成功阻断<br/>Coinbase 2019 · 2023 · Hotbit"] -.->|"检测在 立足 或 横移 阶段生效"| P`,
 readpts:["内部人员拥有合法权限。技术控制只能限制权限范围，不能判断动机。","Munchables 2024：朝鲜开发者在升级时植入后门存储槽，被发现后全额归还。","Coinbase 2019：两个 Firefox 0day 定向攻击员工，被检测阻断。说明“入口成功”不等于“盗币成功”。"],
 why:["攻击者使用合法权限，或者事件性质有争议。"],
 examples:[["Coinbase 外包客服 2025","部分外包客服被收买，客户数据用于社工诈骗。初步应对与自愿赔付成本 1.8–4 亿美元，不是钱包失窃。"],["Multichain 2023（$1.26 亿）","CEO 被捕后 MPC 密钥失控，资金被转出。性质疑似内部。"],["Infini 2025（$49.5M）","前开发者保留管理权限，提走金库。"],["Coldcard 2026（$88.6M）","2021 年代码改动使种子熵降到约 40–72 bit，被批量推导。性质为产品缺陷。"]],
 controls:[["0","离职与转岗当天收回全部权限，包括合约管理员","每月对比 HR 名单与链上管理员地址"],["0","外包人员的数据访问按工单最小化","单个客服每日可查询客户数上限"],["1","退役钱包地址在所有渠道下线，并持续监控","向旧地址充值时立即告警"],["2","开发者背景核验；关键升级双人复核","升级 diff 由第二人逐行审"]],
 labs:["l1"]}
];
G.forEach((g,i)=>H.docs.push({id:g.id,code:g.code,group:"p2",ord:i,title:g.title,render:()=>renderG(g),after:root=>afterG(g,root)}));

function rowsOf(g){return H.evOf().filter(e=>g.techs.includes(e.tech));}
function renderG(g){const {esc,money,evTags}=H.util;const R=rowsOf(g);const sum=R.reduce((a,e)=>a+(e.loss||0),0);const big=R.filter(e=>e.loss>=10).length;
  return `<div class="eyebrow"><span>${g.code} · 手法归纳</span><span>${g.techs.map(t=>H.TECH[t]).join(" · ")}</span></div><h1>${esc(g.title)}</h1>
  <p class="thesis">${g.intro}</p>
  <div class="figs"><div class="fig red"><span class="n">${R.length}</span><span class="l">收录事件</span></div><div class="fig red"><span class="n">${money(sum)}</span><span class="l">已披露损失合计</span></div><div class="fig"><span class="n">${big}</span><span class="l">其中 ≥ $10M</span></div><div class="fig"><span class="n">${R.filter(e=>e.ch).length}</span><span class="l">已有独立案件章</span></div></div>
  ${H.secHead("01","共同链路","")}<div class="mmd-wrap" data-title="${esc(g.title)}"><pre class="mmd">${esc(g.mermaid)}</pre></div><div class="readpts"><b>读图要点</b><ul>${g.readpts.map(x=>`<li>${x}</li>`).join("")}</ul></div>
  ${H.secHead("02","为什么归为一类","")}<ul>${g.why.map(x=>`<li>${x}</li>`).join("")}</ul>
  ${H.secHead("03","典型案例速写","有独立章的案件见事件表中的链接。")}<div class="cards">${g.examples.map(x=>`<div class="card"><b>${x[0]}</b><p>${x[1]}</p></div>`).join("")}</div>
  ${H.secHead("04","事件表","点击表头排序。金额为事发时估值，空值表示未披露。")}
  <div class="filters">${g.big?`<label class="note"><input type="checkbox" class="gbig" checked> 只看 ≥ $10M</label>`:""}<span class="note gcount"></span></div>
  <div class="tbl-wrap"><table data-sort><thead><tr><th class="sortable">日期</th><th class="sortable">事件</th><th class="sortable">类型</th><th class="sortable">损失</th><th>机制</th><th>归因</th><th>证据</th></tr></thead><tbody class="gbody"></tbody></table></div>
  ${H.secHead("05","共同阻塞点","这些控制与具体入口无关，对整类事件都有效。")}<div class="tbl-wrap"><table><thead><tr><th>优先级</th><th>做什么</th><th>怎样验证</th></tr></thead><tbody>${g.controls.map(c=>`<tr><td><span class="prio p${c[0]}">P${c[0]}</span></td><td>${c[1]}</td><td>${c[2]}</td></tr>`).join("")}</tbody></table></div>
  ${H.secHead("06","动手验证","")}<div class="lab-cards">${g.labs.map(id=>{const d=H.byId[id];return d?`<a class="lab-card" href="#${d.id}"><span class="from">${d.code}</span><b>${esc(d.title)}</b><span>${esc(d.desc||"")}</span></a>`:"";}).join("")}</div>`;}
function afterG(g,root){const {esc,money,evTags}=H.util;const draw=()=>{let R=rowsOf(g);const cb=root.querySelector(".gbig");if(cb&&cb.checked)R=R.filter(e=>e.loss>=10);
  root.querySelector(".gbody").innerHTML=R.sort((a,b)=>(b.loss||0)-(a.loss||0)).map(e=>`<tr><td class="mono">${e.date}</td><td>${e.ch?`<a href="#${e.ch}">${esc(e.name)}</a>`:esc(e.name)}</td><td>${esc(e.type)}</td><td class="num" data-v="${e.loss??-1}">${money(e.loss)}</td><td style="font-size:12.5px">${esc(e.mech)}</td><td style="font-size:12.5px">${esc(e.attr)}</td><td>${evTags(e.ev)}</td></tr>`).join("");
  root.querySelector(".gcount").textContent=`显示 ${R.length} 条`;H.bindTables(root);};
  const cb=root.querySelector(".gbig");if(cb)cb.onchange=draw;draw();}

/* ---------- D01 defense matrix ---------- */
H.docs.push({id:"d01",code:"D01",group:"p3",ord:1,title:"防御矩阵",wide:true,render:()=>{const {esc}=H.util;
  const C=[["人员与终端","面试作业、外部项目只在一次性虚拟机中运行；EDR 监控开发工具二进制","c-binance c-bybit c-dmm c-ronin c-coincheck"],
  ["身份与会话","会话与令牌绑定设备、短时有效；部署令牌不落终端","c-binance c-bybit c-dmm"],
  ["云与内部平台","生产部署只走 CI/CD；安全与运维管理面与钱包网段隔离；AI 工具按用户隔离","c-binance c-bitget c-bybit"],
  ["供应商","供应商终端与发布流程纳入评估；交易请求端到端签名","c-bybit c-dmm c-wazirx c-bitget"],
  ["前端与界面","前端 SRI + 构建签名；签名前在独立设备解码 calldata","c-bybit c-wazirx"],
  ["签名与密钥","MPC/多签前加独立策略层；默认拒绝升级、delegatecall、7702 授权","c-binance c-bitget c-bybit c-wazirx c-coincheck"],
  ["阈值","按独立组织计算阈值；临时授权带到期时间","c-ronin c-wazirx"],
  ["合约","不变量测试覆盖所有公开函数；sysvar / 账户校验；升级前主网分叉回放","c-poly c-wormhole c-nomad c-euler"],
  ["经济参数","低流动性资产的抵押与借款上限；TWAP；治理时间锁","c-mango"],
  ["熔断","按钱包、链一键停签；桥暂停开关；速率上限","c-bitget c-binance c-nomad c-ronin c-wormhole"],
  ["余额","热钱包余额 ≤ 数小时提现量；冷钱包按金额拆分","c-coincheck c-bybit c-binance c-bitget"],
  ["监控与对账","链上余额与账本实时对账；委托代码、实现地址、Keeper 变更告警","c-ronin c-poly c-binance c-wormhole"]];
  const cs=H.cases;const ARCHF={"c-coincheck":["人员与终端","签名与密钥","余额"],"c-poly":["合约","熔断","监控与对账"],"c-ronin":["人员与终端","签名与密钥","阈值","熔断","监控与对账"],"c-wormhole":["合约","熔断","监控与对账"],"c-nomad":["合约","熔断"],"c-mango":["经济参数"],"c-euler":["合约"],"c-dmm":["人员与终端","身份与会话","供应商"],"c-wazirx":["供应商","前端与界面","签名与密钥","阈值"],"c-bybit":["人员与终端","身份与会话","云与内部平台","供应商","前端与界面","签名与密钥","余额"],"c-bitget":["云与内部平台","供应商","签名与密钥","熔断","余额"],"c-binance":["人员与终端","身份与会话","云与内部平台","签名与密钥","熔断","余额","监控与对账"]};const famOf=c=>c.fam||ARCHF[c.id]||[];
  return `<div class="eyebrow"><span>D01 · DEFENSE</span></div><h1>防御矩阵：哪道控制能切断哪起事件</h1>
  <p class="thesis">把 ${cs.length} 起案件的阻塞点汇总到一张表。<em>●</em> 表示该控制能在资金离开前切断攻击链。表格越往下，越接近资金。越靠近资金的控制，覆盖的案件越多。</p>
  <div class="tbl-wrap"><table class="matrix"><thead><tr><th>控制族</th><th>做什么</th>${cs.map(c=>`<th title="${esc(c.name)}" style="writing-mode:vertical-rl;white-space:nowrap;font-size:11.5px"><a href="#${c.id}">${esc(c.name)}</a></th>`).join("")}<th>覆盖</th></tr></thead>
  <tbody>${C.map(r=>{const set=cs.filter(c=>famOf(c).includes(r[0])).map(c=>c.id);return `<tr><td><b>${r[0]}</b></td><td style="font-size:12.5px;min-width:240px">${r[1]}</td>${cs.map(c=>`<td style="text-align:center;color:var(--ok);font-size:15px">${set.includes(c.id)?"●":""}</td>`).join("")}<td class="num">${set.length}</td></tr>`;}).join("")}</tbody></table></div>
  <div class="readpts"><b>读表要点</b><ul><li>“签名与密钥”“熔断”“余额”三行覆盖最多案件。它们不依赖知道入口在哪。</li><li>“人员与终端”只对原型 A 有效，但它是最早的切断点，越早切断，攻击者暴露越少。</li><li>合约类案件只能由“合约”和“熔断”两行切断。</li><li>局限：● 表示“公开信息显示该控制可以切断”，不表示受害方当时没有部署该控制。</li></ul></div>
  <h2>按阶段的检测信号</h2>
  <div class="tbl-wrap"><table><thead><tr><th>阶段</th><th>典型信号</th><th>出现在</th></tr></thead><tbody>
  <tr><td>入口</td><td>员工收到高薪 offer、外部“面试作业”、开源贡献者邀请运行项目</td><td>Ronin、DMM、Bybit、Binance</td></tr>
  <tr><td>立足</td><td>开发工具二进制被替换；异常外联；EDR 未覆盖的 macOS</td><td>Binance、Bybit</td></tr>
  <tr><td>横移</td><td>同一令牌出现在两台设备；非计划部署；安全管理面下发命令</td><td>Binance、Bitget</td></tr>
  <tr><td>取得签名能力</td><td>签名请求类型异常（升级、delegatecall、7702）；无对应订单的提现请求</td><td>Bybit、WazirX、Binance、Bitget</td></tr>
  <tr><td>链上执行</td><td>数秒内多链大额转出；实现地址、Keeper、委托代码变化</td><td>全部</td></tr></tbody></table></div>`;}});

/* ---------- D02 laundering ---------- */
H.docs.push({id:"d02",code:"D02",group:"p3",ord:2,title:"洗钱路径与追回",render:()=>`<div class="eyebrow"><span>D02 · RECOVERY</span></div><h1>洗钱路径与追回</h1>
<p class="thesis">资金离开后，防守方还有几张牌：<em>稳定币冻结、交易所冻结、链级冻结或回滚、法院命令、谈判与赏金、执法扣押</em>。每张牌都有时间窗口。</p>
<h2>1. 典型洗钱路径</h2>
<div class="mmd-wrap" data-title="洗钱路径"><pre class="mmd">flowchart LR
  S["被盗资产<br/>稳定币 · LST · 长尾币"] -->|"数分钟内"| D["DEX 换成 ETH / BTC"]
  D --> X["跨链<br/>THORChain · 桥"]
  D --> M["混币<br/>Tornado · CoinJoin · 屏蔽池"]
  X --> P["分散到上千地址"]
  M --> P
  P -->|"数周到数月"| O["场外 · 中小交易所 · 地下钱庄"]
  F1["稳定币发行方冻结"] -.->|"窗口：分钟级"| S
  F2["交易所冻结"] -.->|"窗口：充值时"| O</pre></div>
<div class="readpts"><b>读图要点</b><ul><li>攻击者第一步通常是把可冻结的稳定币换掉。Bitget 案中 USDT 在 20 分钟内换成 ETH。</li><li>无许可协议（THORChain）不封锁地址。Bybit、Bitget、Binance 案中大量资金经 THORChain 换成 BTC。</li><li>大额资金常长时间不动。Binance 案截至 11-07 约 31.3 亿美元仍在关联地址。</li></ul></div>
<h2>2. 追回手段</h2>
<div class="tbl-wrap"><table><thead><tr><th>手段</th><th>案例</th><th>效果</th><th>争议</th></tr></thead><tbody>
<tr><td>稳定币冻结</td><td>Poly（3,300 万 USDT）、Bitget（约 110 万）</td><td>快，只对未换出的稳定币有效</td><td>发行方的中心化权力</td></tr>
<tr><td>交易所冻结</td><td>Bybit（约 3.8%）、Binance（28.5 亿含拦截）</td><td>依赖行业情报共享</td><td>—</td></tr>
<tr><td>链级冻结</td><td>Cetus（Sui 验证者冻结约 1.62 亿）</td><td>大额有效</td><td>验证者能否冻结用户资产</td></tr>
<tr><td>链回滚</td><td>Tectonic（Cronos 回滚 10,961 个区块）、The DAO（硬分叉）</td><td>可恢复大部分</td><td>不可篡改性</td></tr>
<tr><td>法院命令反向操作</td><td>Wormhole（2023，约 1.4 亿）</td><td>依赖攻击者把资金放在可升级合约中</td><td>—</td></tr>
<tr><td>谈判与赏金</td><td>Poly、Euler、Nomad、GMX v1、Liquid Network</td><td>对“非国家行为者”有效</td><td>是否等于向攻击者付费</td></tr>
<tr><td>执法扣押</td><td>Ronin（约 3,000 万）、Bitfinex（多年后追回）</td><td>慢，可能跨越数年</td><td>—</td></tr></tbody></table></div>
<blockquote class="analogy"><p>🎯 打个比方：追回像追一辆逃逸的车。前 10 分钟有交警（稳定币冻结），出城后靠收费站（交易所），换了车牌就只能靠长期侦查（执法）。比喻的局限：链上每一步都公开可见，难点不在“看到”，在“拦住”。</p></blockquote>`});

/* ---------- D03 event DB ---------- */
H.docs.push({id:"d03",code:"D03",group:"p3",ord:3,title:"全量事件库",wide:true,render:()=>{const yrs=[...new Set(H.events.map(e=>e[1].slice(0,4)))].sort();const types=[...new Set(H.events.map(e=>e[3]))];
 return `<div class="eyebrow"><span>D03 · DATABASE</span><span>${H.events.length} 条</span></div><h1>全量事件库</h1>
 <p class="lede">全部条目来自本手册检索（截止 2026-11-07）。CEX 与关联服务部分参考了《交易所安全04：2016至2026 攻击案例目录》（98 条），目录数据不直接采信，已另行判断、修正与补充；证据标 C 的条目仅有索引线索。每条事件附 1–3 个来源链接（悬停看标题）：<b>✎</b> 表示已按来源更正，<b>＋</b> 表示目录之外补充的事件。点击表头排序，组合筛选。</p>
 <div class="filters"><input id="dq" type="search" placeholder="搜索名称、机制、归因" style="min-width:200px">
 <select id="dy"><option value="">全部年份</option>${yrs.map(y=>`<option>${y}</option>`).join("")}</select>
 <select id="dt"><option value="">全部类型</option>${types.map(y=>`<option>${y}</option>`).join("")}</select>
 <select id="dh"><option value="">全部手法</option>${Object.entries(H.TECH).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select>
 <select id="dl"><option value="0">任意金额</option><option value="10">≥ $10M</option><option value="100">≥ $1 亿</option><option value="1000">≥ $10 亿</option></select>
 <label class="note"><input type="checkbox" id="dc"> 只看有独立章</label><span class="note" id="dn"></span></div>
 <div class="tbl-wrap"><table data-sort><thead><tr><th class="sortable">编号</th><th class="sortable">日期</th><th class="sortable">事件</th><th class="sortable">类型</th><th class="sortable">链</th><th class="sortable">损失</th><th class="sortable">手法</th><th class="sortable">层数</th><th>机制</th><th>归因</th><th>证据</th><th>来源</th></tr></thead><tbody id="db"></tbody></table></div>
 <p class="caveat">金额为事发时估值或原始币量折算，冻结、追回与赔付不混算。层数为本手册按 O01 规则的估计，空值表示链路未公开。</p>`;},
 after:root=>{const {esc,money,evTags}=H.util;const q=s=>root.querySelector(s);
  const VL={corrected:"已按来源更正",unverified:"未找到独立来源",new:"补充事件"};
  const srcCell=id=>{const r=(H.evsrc||{})[id];if(!r||!r.s.length)return `<span class="note">待补</span>`;
   return r.s.slice(0,3).map((x,i)=>x[1]?`<a href="${esc(x[1])}" target="_blank" rel="noopener" title="${esc(x[0])}">[${i+1}]</a>`:`<span title="${esc(x[0])}">[${i+1}]</span>`).join(" ")+(VL[r.v]?` <span class="note" title="${VL[r.v]}">${r.v==="corrected"?"✎":r.v==="new"?"＋":"?"}</span>`:"");};
  const draw=()=>{const t=q("#dq").value.trim().toLowerCase();let R=H.evOf().filter(e=>(!q("#dy").value||e.date.startsWith(q("#dy").value))&&(!q("#dt").value||e.type===q("#dt").value)&&(!q("#dh").value||e.tech===q("#dh").value)&&((e.loss||0)>=+q("#dl").value)&&(!q("#dc").checked||e.ch)&&(!t||(e.name+e.mech+e.attr+e.chain).toLowerCase().includes(t)));
   q("#db").innerHTML=R.map(e=>`<tr><td class="mono" style="font-size:11.5px">${e.id}</td><td class="mono">${e.date}</td><td>${e.ch?`<a href="#${e.ch}">${esc(e.name)}</a>`:esc(e.name)}</td><td>${esc(e.type)}</td><td style="font-size:12.5px">${esc(e.chain)}</td><td class="num" data-v="${e.loss??-1}">${money(e.loss)}</td><td style="font-size:12.5px">${H.TECH[e.tech]}</td><td class="num" data-v="${e.layers??-1}">${e.layers??"—"}</td><td style="font-size:12.5px;min-width:220px">${esc(e.mech)}</td><td style="font-size:12.5px">${esc(e.attr)}</td><td>${evTags(e.ev)}</td><td style="font-size:12px;white-space:nowrap">${srcCell(e.id)}</td></tr>`).join("");
   q("#dn").textContent=`${R.length} 条 · 合计 ${money(R.reduce((a,e)=>a+(e.loss||0),0))}`;};
  ["#dq","#dy","#dt","#dh","#dl","#dc"].forEach(s=>q(s).addEventListener("input",draw));draw();}});

/* ---------- D04 glossary ---------- */
const GL=[["盲签（Blind Signing）","签名者无法看到交易真实内容就签名。硬件钱包只显示哈希时即为盲签。"],["清晰签名（Clear Signing）","签名设备解析并显示交易类型、目标和参数。"],["calldata","发送给合约的调用数据，包含函数选择器和参数。"],["函数选择器（Selector）","函数签名哈希的前 4 字节。只有 2^32 种取值，可被暴力碰撞。"],["delegatecall","在调用方的存储上执行目标合约代码。可以改写钱包自身的状态。"],["masterCopy / 实现合约","代理钱包把调用转发到的逻辑合约地址。改写它等于替换钱包的全部逻辑。"],["MPC（多方计算）","多方各持一个密钥分片，共同计算签名。保护密钥完整性，不判断交易意图。"],["多签（Multisig）","需要 M 个签名者中的 N 个签名才能执行。安全性取决于签名者是否独立。"],["阈值（Threshold）","多签或验证者网络中执行操作所需的最少签名数。"],["验证者（Validator）","为跨链桥或链签名确认消息的节点。"],["DVN","LayerZero 的去中心化验证网络。1-of-1 配置等于单点。"],["EIP-7702","允许 EOA 把执行代码委托给合约的以太坊升级（Pectra，2025-05）。"],["nonce","账户的交易序号。7702 授权只在 nonce 匹配时生效。"],["闪电贷（Flash Loan）","在一笔交易内借入并归还的无抵押贷款。"],["TWAP","时间加权平均价格。比即时价格更难被单笔交易操纵。"],["预言机（Oracle）","向合约提供链外数据（如价格）的机制。"],["sysvar","Solana 的系统账户，存放时钟、指令等系统数据。读取前必须校验地址。"],["VAA","Wormhole 的跨链消息格式，由守护者签名。"],["Keeper","Poly Network 中签署跨链证明的守门人公钥集合。"],["重组（Reorg）","链上出现更长的分支，替换原有区块。可撤销已确认交易。"],["51% 攻击","攻击者掌握多数算力或权益，可以重组链。"],["Contagious Interview","以假招聘和“面试作业”投放恶意代码的攻击活动。"],["TraderTraitor","美国政府对一类朝鲜加密货币攻击活动的命名，也称 Jade Sleet、UNC4899。"],["SRI","子资源完整性。浏览器校验外部脚本哈希，不匹配则拒绝加载。"],["Safe Guard","Safe 钱包的交易前置检查合约，可禁止特定操作。"],["时间锁（Timelock）","操作通过后必须等待一段时间才能执行。"],["热钱包 / 温钱包 / 冷钱包","在线可自动签名 / 在线需人工参与 / 离线签名的钱包分层。"],["熔断（Circuit Breaker）","异常时自动或一键停止签名或交易的机制。"],["THORChain","无许可跨链兑换协议，不封锁地址。"],["Profanity","一款靓号地址生成工具。只用 32 位种子，私钥可被还原。"],["私钥（Private Key）", "控制账户资产的密钥。谁持有私钥，谁就能签名转走资产。"],["助记词（Seed Phrase）", "一组可还原全部私钥的单词。泄露等于私钥泄露。"],["EOA（外部账户）", "由私钥直接控制的普通账户，没有合约代码。"],["代理合约（Proxy）", "只保存状态、把调用转给实现合约的合约。谁能替换实现合约，谁就能改写全部逻辑。"],["重入（Reentrancy）", "合约在更新状态之前调用外部合约，对方回调进来，重复执行同一段逻辑。"],["跨链桥（Bridge）", "在两条链之间锁定和铸造资产的系统。验证方式决定它的安全上限。"],["Tornado Cash", "以太坊上的混币协议。它切断资金来源与去向之间的链上联系。"],["Lazarus", "朝鲜相关黑客组织的统称。多起大额加密资产盗窃被官方归因于它。"],["社会工程（Social Engineering）", "利用信任、紧迫感或冒充身份，诱导人执行操作，而不是攻破系统本身。"],["会话令牌（Session Token）", "登录后发放的凭证。被窃取后，攻击者可绕过密码和 MFA 直接访问。"],["MFA / 2FA", "多因素认证。除密码外再验证一个因素，例如动态码或硬件密钥。"],["SIM 换卡（SIM Swap）", "骗运营商把受害者的号码转到攻击者的 SIM 卡上，从而截获短信验证码。"],["ATT&CK", "MITRE 维护的攻击战术与技术知识库。本手册用它的编号描述手法。"],["Web shell", "植入服务器的网页后门。攻击者用它远程执行命令。"],["0day（零日漏洞）", "厂商尚未修复、也未公开的漏洞。"],["供应链攻击（Supply Chain Attack）", "先攻破目标依赖的软件、供应商或服务，再借它进入目标。"]];
H.GL=GL;
H.docs.push({id:"d04",code:"D04",group:"p3",ord:4,title:"术语表",render:()=>`<div class="eyebrow"><span>D04 · GLOSSARY</span></div><h1>术语表</h1><p class="lede">按出现顺序排列。全书每个术语只用这一个词。</p><div class="tbl-wrap"><table><thead><tr><th>术语</th><th>定义</th></tr></thead><tbody>${GL.map(g=>`<tr><td style="white-space:nowrap"><b>${g[0]}</b></td><td>${g[1]}</td></tr>`).join("")}</tbody></table></div>`});
})();
