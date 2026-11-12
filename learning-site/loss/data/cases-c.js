/* 独立案件章 · C 组（第二批，2016–2025）：Bitfinex、BadgerDAO、Cream、Beanstalk、Harmony、Wintermute、Curve/Vyper、CoinsPaid、Multichain、Mixin、Radiant、Cetus */
H.cases.push(
{
 id:"c-bitfinex", name:"Bitfinex", sub:"自动联签服务按“限额”签了 2,000 多笔", date:"2016-08-02", type:"CEX", chain:"Bitcoin", attr:"Ilya Lichtenstein（司法确认）", ev:"P", arch:"A", fam:["云与内部平台","供应商","签名与密钥","监控与对账"],
 loss:72,
 thesis:"Bitfinex 为每个用户分配 2-of-3 多签地址，由 BitGo 自动联签。攻击者进入 Bitfinex 网络后，<em>用 Bitfinex 自己的身份让 BitGo 放宽限额</em>，再发起 2,000 多笔提现。BitGo 按规则签了每一笔。",
 figs:[["119,756 BTC","事发时约 7,200 万美元","red"],["2,072 笔","未授权交易"],["36%","全体用户分摊损失（BFX 代币）","warn"],["~94,000 BTC","2022 年美国司法部查扣","green"],["5 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"云/内部平台",name:"进入 Bitfinex 网络",when:"2016 年中",ev:["fact","unk"],what:["攻击者入侵 Bitfinex 的内部系统。","Lichtenstein 在认罪时称使用了多种高级入侵工具。"],how:"完整初始入口未公开。",block:"内网分区；钱包管理系统单独认证。",att:"T1190 · T1078"},
  {d:"身份/会话",name:"取得联签 API 凭据",when:"2016-08 前",ev:["fact","infer"],what:["攻击者取得 Bitfinex 调用 BitGo 的凭据和权限。"],how:"Bitfinex 持有一把钥匙，并通过 API 指挥 BitGo 联签。",block:"联签 API 凭据存放于 HSM，调用需要第二人批准。",att:"T1552"},
  {d:"供应商",name:"放宽联签限额",when:"2016-08-02",ev:["fact","infer"],what:["BitGo 的联签按 Bitfinex 设定的策略执行（限额、速率）。","攻击者以 Bitfinex 身份修改或绕过了这些策略。","BitGo 称自身系统没有被入侵。"],how:"联签方只验证“请求来自 Bitfinex”，不验证“请求是否合理”。",block:"策略变更必须带外确认，并延迟生效。",note:"多签的第二把钥匙在供应商手里，但供应商听从的仍是第一把钥匙的主人。"},
  {d:"签名/密钥",name:"两把钥匙齐备",when:"2016-08-02",ev:["fact"],what:["Bitfinex 钥匙 + BitGo 联签 = 2-of-3。","攻击者无需离线备份钥匙。"],how:"<mark class=\"hl\">两把在线钥匙受同一身份控制</mark>。",block:"至少一把签名钥匙与业务系统身份完全分离。"},
  {d:"链上",name:"2,072 笔转出",when:"2016-08-02",ev:["fact"],what:["约 119,756 BTC 从用户多签地址转到攻击者地址。"],how:"每笔都是有效的多签交易。",block:"聚合限额：按整个平台而非单地址计算。"},
  {d:"洗钱",name:"长期洗钱与追回",when:"2017 → 2022",ev:["fact"],what:["资金多年缓慢流出，经暗网市场 AlphaBay、链跳转、假身份账户。","2022 年 2 月，美国司法部逮捕 Lichtenstein 与 Heather Morgan，查扣约 94,000 BTC。"],how:"链上每一步都留痕，最终被追踪。",block:"—"}
 ],
 mermaid:`flowchart LR
  A["攻击者"] --> N["Bitfinex 内网"]
  N --> K1["Bitfinex 钥匙"]
  N --> API["BitGo 联签 API 凭据"]
  API -->|"修改或绕过限额"| P["BitGo 策略"]
  P --> K2["BitGo 自动联签"]
  K1 & K2 -->|"2-of-3"| TX["2,072 笔提现"]
  K3["离线备份钥匙"] -.->|"未参与"| TX`,
 readpts:["2-of-3 的两把在线钥匙都受 Bitfinex 身份控制。攻击者只需攻破一个身份。","联签服务商的独立性取决于它是否独立判断请求。","局限：限额被修改的具体方式没有公开。"],
 analogy:"金库要两把钥匙。第二把由保安公司保管，但保安公司只认老板的电话。小偷偷了老板的手机。",
 timeline:[["2016-08-02","约 119,756 BTC 被转出","","hot"],["08-07","全体用户分摊 36% 损失，发放 BFX 代币",""],["2017-04","BFX 代币全部赎回","","ok"],["2022-02-08","Lichtenstein、Morgan 被捕；查扣约 94,000 BTC","","ok"],["2023-08","两人认罪",""],["2024-11","Lichtenstein 被判 5 年",""]],
 roots:[["身份 ⇄ 联签","两把钥匙由同一身份指挥","多签退化为单一身份控制。"],["策略 ⇄ 变更","限额可被即时修改","策略变更没有延迟和带外确认。"],["单地址 ⇄ 平台","限额按地址计","2,000 多个地址各自没超限，合计却是全部资产。"]],
 myths:[["BitGo 被黑了","BitGo 称自身未被入侵。它按收到的指令签名。"],["钱已经追回，所以没损失","查扣发生在 6 年后。期间用户承担了 36% 的折损。"]],
 fixes:[["0","至少一把签名钥匙的持有方独立判断请求，不只验证身份","③ ④","以主账户身份请求大额提现，联签方必须带外确认。"],["0","策略与限额变更延迟生效（例如 24 小时）并通知多方","③","修改限额后立即发起超额提现，必须失败。"],["1","按平台聚合计算提现速率","⑤","1 小时内全平台转出超过阈值时停签。"]],
 labs:["l3","l4"],
 sources:[["U.S. DOJ. Two Arrested for Alleged Conspiracy to Launder $4.5 Billion in Stolen Cryptocurrency（2022-02-08）","https://www.justice.gov/opa/pr/two-arrested-alleged-conspiracy-launder-45-billion-stolen-cryptocurrency"],["U.S. DOJ. Bitfinex Hacker and Wife Plead Guilty（2023-08-03）","https://www.justice.gov/opa/pr/bitfinex-hacker-and-wife-plead-guilty-money-laundering-conspiracy-involving-billions-stolen"],["Reuters. Bitfinex hack: BitGo says its systems were not breached（2016-08）", ""],["U.S. DOJ. Bitfinex Hacker Sentenced in Money Laundering Conspiracy Involving Billions in Stolen Cryptocurrency（2024-11-14）", "https://www.justice.gov/archives/opa/pr/bitfinex-hacker-sentenced-money-laundering-conspiracy-involving-billions-stolen"]],
 limits:"联签限额如何被修改，官方没有公开技术细节。"
},
{
 id:"c-badger", name:"BadgerDAO", sub:"一个没人知道的 Cloudflare 密钥", date:"2021-12-02", type:"DeFi", chain:"Ethereum", attr:"未知", ev:"P", arch:"A", fam:["供应商","前端与界面","签名与密钥","监控与对账"],
 loss:120,
 thesis:"攻击者在 BadgerDAO 的 Cloudflare 账户里拥有一个<em>团队不知道的 API 密钥</em>。他用它在官网前端里插入脚本：用户正常操作时，脚本额外请求把代币授权给攻击者。攻击者等了三周，等大户签下授权。",
 figs:[["$1.2 亿","约 500 个地址受影响","red"],["~3 周","恶意脚本潜伏时间"],["~$5,000 万","单一受害者（约 900 wBTC）","red"],["~$900 万","攻击者未及转出被保住","green"],["5 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"供应商",name:"Cloudflare 账户缺陷",when:"2021-08 → 09",ev:["fact"],what:["<mark class=\"hl\">Cloudflare 存在一个缺陷：账户在邮箱验证前即可创建 API 密钥</mark>。","攻击者利用该缺陷，在 Badger 的账户中预先生成密钥。"],how:"供应商平台的身份校验缺陷。",block:"定期审计 CDN / DNS 账户中的全部 API 密钥。"},
  {d:"身份/会话",name:"隐藏的 API 密钥",when:"2021-11-10 起",ev:["fact"],what:["攻击者使用该密钥修改 Cloudflare Workers。","团队从未创建过这把密钥，也没有发现它。"],how:"合法凭据，没有登录告警。",block:"API 密钥最小权限；密钥创建事件告警。"},
  {d:"前端/界面",name:"注入恶意脚本",when:"11-10 → 12-02",ev:["fact"],what:["脚本被间歇性注入 app.badger.com。","用户发起存取时，脚本附加一笔 approve / increaseAllowance，授权对象是攻击者地址。","脚本只对余额较大的地址生效。"],how:"定向前端投毒。",block:"前端资源 SRI 与构建签名；线上脚本哈希监控。"},
  {d:"签名/密钥",name:"用户签下授权",when:"11 月 → 12 月",ev:["fact"],what:["用户在钱包中确认授权。很多钱包当时不显示授权对象的风险。"],how:"用户以为是官方合约的正常授权。",block:"钱包显示授权对象与额度，对未知地址的无限授权给出警告。"},
  {d:"合约",name:"transferFrom 提走",when:"12-02 ~00:00 UTC",ev:["fact"],what:["攻击者用 transferFrom 从约 500 个地址提走 Badger 金库代币。","Badger 暂停合约，剩余约 900 万美元未被转出。"],how:"授权一旦签出，转账不需要用户再次签名。",block:"协议侧暂停开关；监控异常 transferFrom 模式。"}
 ],
 mermaid:`sequenceDiagram
  participant A as 攻击者
  participant CF as Cloudflare
  participant FE as app.badger.com
  participant U as 用户钱包
  participant V as Badger 金库代币
  A->>CF: 利用缺陷预建 API 密钥
  A->>CF: 修改 Workers 注入脚本
  U->>FE: 存入 / 取出
  FE-->>U: 正常交易 + approve 攻击者
  U->>V: 签名授权
  A->>V: transferFrom 约 500 个地址`,
 readpts:["受害者签名的授权是合法交易。攻击者在三周内只是“收集授权”，12 月 2 日才集中提款。","供应商账户里的一把“影子密钥”就足够。团队的所有代码和合约都没有被改。","局限：Cloudflare 缺陷的具体细节来自 Badger 复盘。"],
 analogy:"商场的广播被人接管，每次播放促销时，顺带说一句“请把您储物柜的备用钥匙交给 3 号柜台”。",
 timeline:[["2021-08/09","攻击者预建 Cloudflare API 密钥",""],["11-10","首次注入恶意脚本",""],["12-02 ~00:00 UTC","集中 transferFrom，约 1.2 亿美元","","hot"],["12-02","Badger 暂停合约","剩余约 900 万美元保住。","ok"],["12-10","Badger 发布技术复盘",""]],
 roots:[["供应商 ⇄ 身份","CDN 账户中存在未知密钥","团队没有清点供应商账户内的凭据。"],["前端 ⇄ 用户","用户信任官网","官网脚本可被替换，用户无法察觉。"],["授权 ⇄ 时间","授权长期有效","三周前签的授权，三周后才被使用。"]],
 myths:[["合约被黑了","Badger 合约没有漏洞。攻击者使用的是用户签出的合法授权。"],["只影响当天的用户","授权从 11 月 10 日开始累积。"]],
 fixes:[["0","每月导出 CDN、DNS、托管平台账户中的全部 API 密钥，逐一确认归属","① ②","发现任何无人认领的密钥，立即吊销。"],["0","前端 SRI + 线上脚本哈希监控","③","修改线上 JS 一个字节，监控必须在 5 分钟内告警。"],["1","dApp 只请求精确额度的授权","④","前端代码中不出现 approve(max)。"],["1","监控“同一 spender 在多地址收集授权”","⑤","同一新地址获得 10 个以上授权时告警。"]],
 labs:["l2"],
 sources:[["BadgerDAO. Technical Post Mortem（2021-12-10）","https://badger.com/technical-post-mortem"],["Rekt. Badger – REKT（2021-12）","https://rekt.news/badger-rekt/"],["The Block. DeFi protocol BadgerDAO exploited for $120 million in front-end attack（2021-12-02）", "https://www.theblock.co/news/regulation/2021-12-02-defi-protocol-badgerdao-exploited-for-120-million-in-front-end-attack-126072"]],
 limits:"受害地址数与金额来自 Badger 复盘与链上统计。"
},
{
 id:"c-cream", name:"Cream Finance", sub:"把一个可以“捐赠”抬价的金库当作抵押", date:"2021-10-27", type:"DeFi", chain:"Ethereum", attr:"未知", ev:"I", arch:"C", fam:["经济参数","合约","熔断"],
 loss:130,
 thesis:"Cream 按 yUSD 金库的“每股净值”给抵押品估值。任何人都可以向金库<em>直接转入资产，让每股净值翻倍</em>。攻击者先用闪电贷堆出巨额 yUSD 抵押，再把净值抬高一倍，借走 Cream 全部可借资产。",
 figs:[["$1.3 亿","Cream 全部可借资产","red"],["~2 倍","yUSD 每股净值被抬高"],["3 次","Cream 在 2021 年第 3 次被盗","warn"],["1 笔","整套操作在一笔交易内完成"],["4 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"链上",name:"闪电贷",when:"2021-10-27",ev:["fact"],what:["攻击者从 MakerDAO 闪电贷借入约 5 亿 DAI，再借入约 2,000 ETH。"],how:"在一笔交易里获得巨额本金。",block:"—"},
  {d:"合约",name:"堆出 crYUSD 抵押",when:"同一笔交易",ev:["fact"],what:["DAI → yDAI → yUSD，存入 Cream 得到 crYUSD。","两个攻击者地址循环借贷与存入，把 crYUSD 抵押放大到约 30 亿美元名义值。"],how:"协议允许同一资产循环抵押。",block:"单资产抵押集中度上限。"},
  {d:"预言机/市场",name:"捐赠抬高净值",when:"同一笔交易",ev:["fact"],what:["攻击者赎回 yUSD 底层资产，再把资产直接转入 yUSD 金库。","金库总资产增加，份额不变，pricePerShare 约翻倍。"],how:"<mark class=\"hl\">预言机读取的是可被任何人改变的链上状态</mark>。",block:"不用可被捐赠改变的数值作价格；使用 TWAP 与外部价格源。"},
  {d:"合约",name:"借空 Cream",when:"同一笔交易",ev:["fact"],what:["crYUSD 抵押价值翻倍，攻击者借出 Cream 全部可借资产，约 1.3 亿美元。","攻击者归还闪电贷。"],how:"借款额度按被操纵的价格计算。",block:"每种抵押品的借款总额上限。"}
 ],
 mermaid:`flowchart LR
  FL["闪电贷 5 亿 DAI"] --> Y["铸 yUSD"]
  Y --> C["存入 Cream 得 crYUSD"]
  C -->|"两地址循环"| C2["crYUSD 抵押 约 30 亿名义"]
  D["直接向 yUSD 金库转入资产"] --> PPS["pricePerShare 约 x2"]
  PPS --> C2
  C2 --> B["借走 1.3 亿美元"]`,
 readpts:["关键节点是 pricePerShare。它等于“金库总资产 ÷ 份额”，任何人转入资产都会让它上升。","捐赠者损失了捐出的资产，但借款收益远大于捐赠成本。","局限：具体金额来自安全公司的链上复盘。"],
 analogy:"当铺按“基金净值”收抵押。小偷往基金里扔了一袋钱，净值翻倍，当铺就借给他双倍现金。扔进去的钱他亏了，但借到的更多。",
 timeline:[["2021-02","Cream 因 Alpha Homora 事件损失约 3,750 万美元",""],["2021-08","Cream 因 AMP 重入损失约 1,900 万美元",""],["2021-10-27","yUSD 价格操纵，约 1.3 亿美元","","hot"]],
 roots:[["预言机 ⇄ 状态","价格来自可捐赠改变的数值","pricePerShare 不是市场价格。"],["抵押 ⇄ 集中度","无抵押集中度上限","单一资产可以撑起全部借款。"],["协议 ⇄ 组合","接入复杂收益代币","每接入一种代币，就接入了它的全部价格机制。"]],
 myths:[["闪电贷攻击","闪电贷提供本金。根因是价格可被捐赠操纵。"],["预言机被黑","预言机正确报告了 pricePerShare，问题在于这个数不该被当作价格。"]],
 fixes:[["0","收益型代币的估值使用 TWAP 和外部价格源，拒绝可被捐赠操纵的读数","③","向金库转入资产，协议使用的价格必须不变。"],["0","每种抵押品设借款总额与集中度上限","② ④","单一抵押品支撑的借款 ≤ 总可借资产的设定比例。"],["1","新资产上线前做经济攻击评审","②","评审表包含“价格能否被单笔交易改变”。"]],
 labs:["l6"],
 sources:[["Rekt. Cream Finance – REKT 2（2021-10）","https://rekt.news/cream-rekt-2/"],["PeckShield / BlockSec 分析线程（2021-10-27）","https://twitter.com/peckshield"],["The Block. Ethereum DeFi protocol Cream Finance hacked for more than $130 million（2021-10-27）", "https://www.theblock.co/news/defi/2021-10-27-ethereum-defi-protocol-cream-finance-hacked-for-115-million-122241"]],
 limits:"循环抵押的名义值各家估算不同。"
},
{
 id:"c-beanstalk", name:"Beanstalk", sub:"一笔交易里借来 2/3 投票权", date:"2022-04-17", type:"DeFi", chain:"Ethereum", attr:"未知", ev:"I", arch:"C", fam:["经济参数","合约"],
 loss:182,
 thesis:"Beanstalk 的紧急治理允许“2/3 投票权”立即执行提案。投票权按存入的资产计算，<em>没有锁定期</em>。攻击者闪电贷约 10 亿美元，换成投票权，在同一笔交易里通过了把金库转给自己的提案。",
 figs:[["$1.82 亿","协议损失","red"],["~$8,000 万","攻击者净获利（约 24,830 ETH）","red"],["~$10 亿","闪电贷本金"],["67%","闪电贷获得的投票权"],["3 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"治理",name:"提前提交提案",when:"2022-04-16",ev:["fact"],what:["攻击者提交 BIP-18（把金库资产转给攻击者合约）和 BIP-19（向乌克兰捐款，用作掩护）。","emergencyCommit 要求提案提交满 24 小时。"],how:"提案内容可被审查，但没有人注意到。",block:"提案代码自动差异检查与告警。"},
  {d:"链上",name:"闪电贷约 10 亿美元",when:"04-17 12:24 UTC",ev:["fact"],what:["攻击者从 Aave 借入约 3.5 亿 DAI、5 亿 USDC、1.5 亿 USDT，再从 Uniswap、SushiSwap 借入 BEAN 和 LUSD。"],how:"一笔交易内借入。",block:"—"},
  {d:"治理",name:"换成投票权",when:"同一笔交易",ev:["fact"],what:["攻击者把资金存入 Curve 池，得到 LP 代币，再存入 Beanstalk Silo。","Silo 按存款给出 Stalk 投票权。攻击者获得约 67%。"],how:"投票权即时生效，没有快照或锁定期。",block:"投票权按提案创建时的快照计算；存款需锁定期才有投票权。"},
  {d:"合约",name:"emergencyCommit 执行",when:"同一笔交易",ev:["fact"],what:["攻击者调用 emergencyCommit，BIP-18 立即执行。","金库中的 BEAN3CRV、BEANLUSD、BEAN 等转给攻击者。","攻击者归还闪电贷，留下约 24,830 ETH，向乌克兰地址捐出 25 万 USDC。"],how:"紧急通道只检查投票比例，不检查投票权来源。",block:"紧急执行需要多签守护者确认。"}
 ],
 mermaid:`flowchart LR
  P["04-16 提交 BIP-18"] -->|"等 24 小时"| E
  F["04-17 闪电贷 约 10 亿美元"] --> L["Curve LP"]
  L --> S["存入 Silo 获得 67% Stalk"]
  S --> E["emergencyCommit"]
  E --> X["金库转给攻击者"]
  X --> R["归还闪电贷 留下 约 8,000 万"]`,
 readpts:["从闪电贷到执行，全部发生在 13 秒的一个区块里。没有任何人工环节可以介入。","治理与经济模型叠加：投票权是一种可以借来的资产。","局限：图中金额为四舍五入值。"],
 analogy:"公司章程规定：持股 2/3 的股东可以当场通过决议。有人借来 2/3 的股票，当场投票把公司账户转给自己，然后把股票还回去。",
 timeline:[["2022-04-16","提交 BIP-18、BIP-19",""],["04-17 12:24 UTC","闪电贷 + 执行，约 1.82 亿美元","","hot"],["04-17","BEAN 价格从约 1 美元跌至约 0.1 美元",""],["2022-08","Beanstalk 在审计后重启","移除 emergencyCommit。","ok"]],
 roots:[["投票权 ⇄ 时间","投票权即时可得","没有快照与锁定期。"],["紧急通道 ⇄ 审查","紧急执行没有人工门槛","2/3 比例是唯一条件。"],["提案 ⇄ 监控","恶意提案公开挂了 24 小时","没有自动化审查。"]],
 myths:[["智能合约漏洞","代码按设计运行。缺陷在治理机制。"],["攻击者捐给乌克兰，所以是行动主义","25 万美元捐款相对 8,000 万美元获利，是掩护。"]],
 fixes:[["0","投票权按提案创建前的快照计算","③","闪电贷存入后投票，投票权必须为 0。"],["0","任何治理执行都经过时间锁；紧急通道需要守护者多签","④","提案通过到执行 ≥ 24 小时。"],["1","提案上链即自动解析与告警","①","提案转移金库资产时，推送告警到社区与团队。"]],
 labs:["l6"],
 sources:[["Beanstalk Farms. Beanstalk Governance Exploit（2022-04）","https://bean.money/blog/beanstalk-governance-exploit"],["Rekt. Beanstalk – REKT（2022-04）","https://rekt.news/beanstalk-rekt/"],["CertiK. Revisiting Beanstalk Farms Exploit（2022-04）","https://www.certik.com/resources/blog/revisiting-beanstalk-farms-exploit"]],
 limits:"协议损失与攻击者获利是两个口径。本手册以协议损失计入门槛。"
},
{
 id:"c-harmony", name:"Harmony Horizon 桥", sub:"5 把钥匙只要 2 把", date:"2022-06-23", type:"跨链桥", chain:"Harmony / Ethereum", attr:"Lazarus（FBI 确认）", ev:"P+I", arch:"A", fam:["云与内部平台","签名与密钥","阈值","监控与对账"],
 loss:100,
 thesis:"Horizon 桥以太坊侧的多签阈值是 <em>2-of-5</em>。攻击者从服务器上取得并解密了 2 把私钥。其中的经济逻辑很简单：一个桥锁了 1 亿美元，守护它的只是 2 个签名。",
 figs:[["$1 亿","11 笔交易","red"],["2 / 5","多签阈值","red"],["2023-01","FBI 归因 Lazarus"],["~$6,350 万","2023-01 经 Railgun 转移","warn"],["3 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"云/内部平台",name:"进入签名服务器",when:"2022-06 前",ev:["fact","unk"],what:["攻击者进入存放桥签名私钥的服务器。"],how:"Harmony 称私钥以加密形式存储，并使用口令和 KMS。初始入口未公开。",block:"签名私钥放在 HSM，不以文件形式存在。"},
  {d:"签名/密钥",name:"解密 2 把私钥",when:"2022-06",ev:["fact","unk"],what:["攻击者解密了 2 把多签私钥。"],how:"加密口令或 KMS 访问也被攻破。",block:"每把签名钥匙由不同团队、不同云账号、不同设备持有。"},
  {d:"跨链",name:"11 笔提款",when:"2022-06-23",ev:["fact"],what:["攻击者用 2 个签名批准 11 笔提款。","ETH、USDC、WBTC、USDT 等约 1 亿美元转出。"],how:"2-of-5 达到阈值。",block:"提高阈值；大额提款延迟窗口。"},
  {d:"洗钱",name:"Tornado 与 Railgun",when:"2022-06 → 2023-01",ev:["fact"],what:["约 85% 资金经 Tornado Cash 混币。","2023 年 1 月，约 6,350 万美元经 Railgun 转移。FBI 同月归因 Lazarus 与 APT38。"],how:"—",block:"—"}
 ],
 mermaid:`flowchart LR
  subgraph MS["以太坊侧 Horizon 多签 2-of-5"]
    K1["钥匙 1"]:::own
    K2["钥匙 2"]:::own
    K3["钥匙 3"]
    K4["钥匙 4"]
    K5["钥匙 5"]
  end
  SRV["签名服务器 加密存储"] -->|"解密"| K1 & K2
  K1 & K2 -->|"2 / 5"| W["11 笔提款 约 1 亿美元"]
  classDef own fill:#fbe6e4,stroke:#c2362d,color:#111823`,
 readpts:["阈值 2/5 意味着 60% 的签名者不需要参与。","两把钥匙存放在可被同一攻击者触达的位置，阈值进一步失效。","局限：服务器入侵路径未公开。"],
 timeline:[["2022-06-23","11 笔提款，约 1 亿美元","","hot"],["06-24","Harmony 公告，悬赏 100 万美元后提高到 1,000 万美元",""],["2023-01-23","FBI 归因 Lazarus Group / APT38",""],["2023-01","约 6,350 万美元经 Railgun 转移",""]],
 roots:[["阈值 ⇄ 金额","阈值与锁仓规模不匹配","1 亿美元由 2 个签名守护。"],["钥匙 ⇄ 存放","多把钥匙可被同一攻击者触达","加密存储不能抵御已进入服务器的攻击者。"]],
 myths:[["多签就安全","阈值与独立性决定安全。2-of-5 且钥匙集中，等于没有多签。"],["私钥加密了就安全","攻击者在服务器上同样拿到了解密能力。"]],
 fixes:[["0","按锁仓金额设阈值：锁仓越大，阈值越高、签名者越独立","③","锁仓 > 1 亿美元时，阈值 ≥ 2/3 且独立组织 ≥ 5。"],["0","签名钥匙放在 HSM，分属不同组织","① ②","任一台服务器失陷，最多暴露 1 把钥匙。"],["1","桥的大额提款延迟窗口","③","单笔超过 TVL 的 5% 时延迟 6 小时。"]],
 labs:["l3"],
 sources:[["Harmony. Harmony's Horizon Bridge Hack（2022-06-24）","https://medium.com/harmony-one/harmonys-horizon-bridge-hack-1e8d283b6d66"],["FBI. FBI Confirms Lazarus Group Cyber Actors Responsible for Harmony's Horizon Bridge Currency Theft（2023-01-23）","https://www.fbi.gov/news/press-releases/fbi-confirms-lazarus-group-cyber-actors-responsible-for-harmonys-horizon-bridge-currency-theft"],["Elliptic. Harmony's $100 Million Bridge Hack（2022-06）","https://www.elliptic.co/blog/"]],
 limits:"服务器入侵细节未公开。"
},
{
 id:"c-wintermute", name:"Wintermute", sub:"靓号地址的私钥只有 32 位随机", date:"2022-09-20", type:"基础设施", chain:"Ethereum", attr:"未知", ev:"P+I", arch:"A", fam:["签名与密钥","监控与对账"],
 loss:160,
 thesis:"Wintermute 金库合约的管理员是一个以 0x0000000 开头的靓号地址，由 Profanity 工具生成。Profanity 只用 <em>32 位随机种子</em>。漏洞公开 5 天后，攻击者从公钥倒推出私钥，用管理员身份清空了金库。",
 figs:[["$1.6 亿","约 90 种资产","red"],["2³²","Profanity 种子空间","red"],["5 天","漏洞公开到被利用"],["偿付能力正常","Wintermute 声明","green"],["3 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"签名/密钥",name:"弱随机生成私钥",when:"早于 2022-09",ev:["fact"],what:["Wintermute 用 Profanity 生成 0x0000000 开头的靓号地址，用来节省 Gas。","该地址被设为 DeFi 金库合约的管理员。"],how:"Profanity 用 32 位种子初始化，私钥空间远小于 2²⁵⁶。",block:"只用经过审计的密钥生成工具；管理员用多签。"},
  {d:"签名/密钥",name:"漏洞公开，处置遗漏",when:"2022-09-15",ev:["fact"],what:["1inch 公开 Profanity 漏洞。","Wintermute 转移了该地址中的 ETH，但没有更换金库合约的管理员角色。"],how:"把“地址里的钱”当作风险，忽略了“地址拥有的权限”。",block:"资产清单包含每个地址拥有的合约权限。"},
  {d:"合约",name:"以管理员身份调用",when:"2022-09-20",ev:["fact"],what:["攻击者暴力还原私钥，以管理员身份调用金库合约。","金库中约 1.6 亿美元资产被转走。"],how:"合法管理员签名。",block:"金库关键函数加时间锁与多签。"},
  {d:"洗钱",name:"转出与沉淀",when:"09-20 起",ev:["fact"],what:["大部分资产留在攻击者地址或换成稳定币。Wintermute 提出 10% 赏金。"],how:"—",block:"—"}
 ],
 mermaid:`flowchart LR
  PR["Profanity 32 位种子"] --> VA["靓号地址 0x0000000…"]
  VA -->|"admin"| V["DeFi 金库合约"]
  D["09-15 漏洞公开"] --> M["转走 ETH"]
  M -.->|"遗漏"| ADM["admin 权限未更换"]
  BF["攻击者暴力还原私钥"] --> ADM
  ADM --> X["金库约 1.6 亿美元转出"]`,
 readpts:["地址的风险包括“它控制的合约权限”，不只是余额。","2³² 的种子空间在 GPU 上数小时到数天即可穷举。见 L9。","局限：攻击者还原私钥所用时间未公开。"],
 analogy:"锁匠的模具只有 40 亿种齿形。你知道后搬走了家里的现金，却忘了这把锁还挂在公司金库上。",
 timeline:[["2022-09-15","1inch 公开 Profanity 漏洞",""],["09-15 → 09-20","Wintermute 转移地址内 ETH","管理员角色未更换。"],["2022-09-20","金库被清空，约 1.6 亿美元","","hot"],["09-20","Wintermute 称仍有偿付能力","","ok"]],
 roots:[["工具 ⇄ 熵","密钥生成工具熵不足","安全依赖于工具作者的实现。"],["地址 ⇄ 权限","权限清单缺失","漏洞公告后只处置了余额。"]],
 myths:[["以太坊私钥被破解","被破解的是 Profanity 的种子，不是 secp256k1。"],["已经转走资产就安全","地址的合约权限同样是资产。"]],
 fixes:[["0","管理员角色只给多签或 MPC，不给单一 EOA","③","金库 admin 为多签合约。"],["0","维护“地址 → 权限”清单，漏洞公告时一并处置","②","任一地址泄露，清单列出它控制的全部合约。"],["1","禁止使用未审计的靓号工具","①","密钥生成工具白名单。"]],
 labs:["l9"],
 sources:[["Wintermute. Evgeny Gaevoy 公告线程（2022-09-20）","https://twitter.com/EvgenyGaevoy/status/1572165542937165824"],["1inch. A vulnerability disclosed in Profanity（2022-09-15）","https://blog.1inch.io/a-vulnerability-disclosed-in-profanity-an-ethereum-vanity-address-tool/"],["Rekt. Wintermute – REKT（2022-09）","https://rekt.news/wintermute-rekt/"]],
 limits:"损失金额来自 Wintermute 公告。"
},
{
 id:"c-curve", name:"Curve / Vyper", sub:"重入锁写对了，编译器把它编错了", date:"2023-07-30", type:"DeFi", chain:"Ethereum", attr:"未知（含白帽与 MEV 机器人）", ev:"P+I", arch:"B", fam:["合约","熔断"],
 loss:70,
 thesis:"多个 Curve 池的代码里有正确的 @nonreentrant 修饰。但 <em>Vyper 0.2.15、0.2.16、0.3.0 编译器</em>给不同函数分配了不同的锁存储槽，锁失效。攻击者在移除流动性的 ETH 回调中重新进入池子。",
 figs:[["~$7,000 万","pETH、msETH、alETH、CRV/ETH 等池","red"],["3 个","受影响的 Vyper 版本"],["~$5,200 万","白帽与攻击者归还","green"],["CRV 抵押","创始人借贷仓位引发连锁担忧","warn"],["2 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"合约",name:"编译器缺陷",when:"2021 → 2023",ev:["fact"],what:["Vyper 0.2.15 起引入的存储槽分配缺陷，使 @nonreentrant(\"lock\") 在不同函数之间不共享锁。","缺陷在 0.3.1 中已被无意修复，但旧版本编译的合约仍在线上。"],how:"供应链：开发者写对的代码，被工具链改变了语义。",block:"对编译产物做字节码级测试；关注编译器安全公告。"},
  {d:"合约",name:"回调中重入",when:"2023-07-30",ev:["fact"],what:["攻击者调用 remove_liquidity，池子发送 ETH 触发回调。","回调中调用 add_liquidity，此时池子余额尚未更新。","攻击者以错误价格获得 LP，再移除。"],how:"经典只读状态不一致重入。",block:"遵循 CEI；对 ETH 发送使用 pull 模式。"},
  {d:"链上",name:"多方抢跑",when:"07-30",ev:["fact"],what:["攻击交易公开后，MEV 机器人与白帽 c0ffeebabe 等复制或抢跑攻击。","JPEG'd、Metronome、Alchemix 与 CRV/ETH 池受损。"],how:"与 Nomad 相同的“攻击模板公开”现象。",block:"池子暂停能力；受影响池列表提前识别。"},
  {d:"洗钱",name:"归还与连锁风险",when:"08 月",ev:["fact"],what:["多方归还，合计约 5,200 万美元。","Curve 创始人以 CRV 抵押的大额借款接近清算线，引发 DeFi 连锁担忧。"],how:"—",block:"—"}
 ],
 mermaid:`flowchart TB
  SRC["源码 @nonreentrant lock"] --> CMP{"Vyper 版本"}
  CMP -->|"0.2.15 / 0.2.16 / 0.3.0"| BAD["各函数锁槽不同 锁失效"]
  CMP -->|"其他版本"| OK["锁正常"]
  BAD --> R["remove_liquidity 发送 ETH"]
  R --> CB["攻击者回调 add_liquidity"]
  CB --> X["以旧余额计价 获得超额 LP"]`,
 readpts:["源码审计看不到这个缺陷。只有对编译后的字节码测试才能发现。","缺陷影响所有用这三个版本编译、并在 ETH 回调前后共享状态的池子。","局限：受影响池子列表来自事后排查。"],
 analogy:"图纸上画了一把锁，工厂按旧版标准件装成了三把互不相通的锁。前门锁了，后门开着。",
 timeline:[["2021-07","Vyper 0.2.15 发布，引入缺陷",""],["2021-11","0.3.1 无意修复",""],["2023-07-30","多池被利用，约 7,000 万美元","","hot"],["07-31","Vyper 团队确认缺陷版本",""],["2023-08","多方归还约 5,200 万美元","","ok"]],
 roots:[["编译器 ⇄ 语义","工具链改变了代码含义","没有字节码级验证。"],["旧合约 ⇄ 补丁","修复不能惠及已部署合约","不可升级合约永久携带缺陷。"]],
 myths:[["Curve 代码写错了","源码正确。缺陷在编译器。"],["只影响 Curve","所有用缺陷版本编译、具有同样模式的合约都受影响。"]],
 fixes:[["0","对编译产物做测试：重入、存储布局","①","用 echidna / foundry 对字节码做重入测试。"],["1","建立“编译器版本 → 已部署合约”清单","①","编译器公告发布时 1 小时内列出受影响合约。"],["1","发送 ETH 的函数遵循 CEI，状态先更新","②","代码审查清单包含 CEI 检查。"]],
 labs:["l1"],
 sources:[["Vyper. Vyper Nonreentrancy Lock Vulnerability Technical Post-Mortem（2023-08）","https://hackmd.io/@vyperlang/HJUgNMhs2"],["LlamaRisk. Curve pools exploit post-mortem（2023-08）","https://hackmd.io/@LlamaRisk/BJzSKHNjn"],["Rekt. Curve, Vyper – REKT（2023-07）","https://rekt.news/curve-vyper-rekt/"]],
 limits:"各池损失与归还金额来自多方统计，合计口径约 6,100 万–7,300 万美元。"
},
{
 id:"c-coinspaid", name:"CoinsPaid", sub:"六个月、三种入口，最后一次假面试成功", date:"2023-07-22", type:"支付", chain:"多链", attr:"Lazarus（受害方判断）", ev:"P", arch:"A", fam:["人员与终端","身份与会话","云与内部平台","签名与密钥"],
 loss:37.3,
 thesis:"攻击者花了半年试探：技术扫描、冒充合作方、收买员工。最后，一名员工在<em>假面试的“技术测试”</em>中安装了恶意代码。攻击者用他的权限进入基础设施，构造合法格式的热钱包提现请求。",
 figs:[["$3,730 万","热钱包损失","red"],["~6 个月","攻击者持续试探"],["$16,000–24,000","假 offer 的月薪","warn"],["2023-07-22","执行日"],["5 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"社工/人",name:"多路试探",when:"2023-03 → 07",ev:["fact"],what:["攻击者尝试技术漏洞扫描、冒充合作伙伴、联系员工提出收买。","这些尝试没有成功。"],how:"长期、多入口侦察。",block:"把失败的社工尝试当作情报，提高告警等级。"},
  {d:"社工/人",name:"假面试",when:"2023-07",ev:["fact"],what:["攻击者以高薪职位接触一名员工。","“技术测试”要求员工安装一个应用。"],how:"Contagious Interview 模式。",block:"招聘接触报备；测试只在隔离设备上做。",att:"T1566.003"},
  {d:"终端",name:"恶意代码执行",when:"2023-07",ev:["fact"],what:["员工在工作设备上安装了恶意代码。","攻击者取得员工的访问凭据与密钥。"],how:"—",block:"工作设备禁止安装非白名单应用。",att:"T1204.002"},
  {d:"云/内部平台",name:"进入基础设施",when:"2023-07",ev:["fact"],what:["攻击者用员工凭据访问 CoinsPaid 基础设施。","攻击者研究了提现请求的格式与流程。"],how:"合法凭据横向移动。",block:"运维访问需要设备证书 + 硬件 MFA。"},
  {d:"签名/密钥",name:"伪造提现请求",when:"2023-07-22",ev:["fact"],what:["攻击者构造合法格式的请求，从热钱包提取资产。"],how:"热钱包系统只校验请求格式和来源凭据。",block:"提现请求与业务订单逐笔对账。"},
  {d:"链上",name:"转出 3,730 万美元",when:"2023-07-22",ev:["fact"],what:["多链资产转出，随后经混币与跨链洗出。"],how:"—",block:"热钱包余额上限；速率熔断。"}
 ],
 mermaid:`flowchart LR
  T1["技术扫描"] -.->|"失败"| X
  T2["冒充合作方"] -.->|"失败"| X
  T3["收买员工"] -.->|"失败"| X
  T4["假面试 技术测试"] -->|"成功"| E["员工设备"]
  E --> I["基础设施访问"]
  I --> R["构造合法格式提现请求"]
  R --> H["热钱包 3,730 万美元"]
  X["CoinsPaid 防线"]`,
 readpts:["前三条路被挡住，第四条路成功。攻击者有充足时间试错。","失败的尝试本身就是告警信号：同一团伙在半年内多次接触公司。","局限：图中未显示攻击者在基础设施内的具体操作。"],
 timeline:[["2023-03","攻击者开始多路试探",""],["2023-07","员工参加假面试并安装恶意代码",""],["2023-07-22","热钱包被提取约 3,730 万美元","","hot"],["2023-07-26","CoinsPaid 公告并归因 Lazarus",""]],
 roots:[["员工 ⇄ 设备","工作设备可安装外部应用","面试测试在工作电脑上完成。"],["凭据 ⇄ 基础设施","单一员工凭据可触达提现系统","缺少设备绑定与第二因素。"],["请求 ⇄ 订单","提现请求不与订单对账","合法格式即被执行。"]],
 myths:[["一次性入侵","攻击者持续了约 6 个月，失败多次后才成功。"]],
 fixes:[["0","提现请求必须对应业务订单，签名端逐笔核对","⑤","无订单的提现请求必须被拒绝。"],["1","记录并关联所有社工接触尝试","①","同一来源多次接触时，提升全员告警等级。"],["1","面试测试只在隔离设备完成","② ③","红队投递假面试，跟踪员工报告率。"]],
 labs:["l1","l8"],
 sources:[["CoinsPaid. Lazarus hackers attack on CoinsPaid（2023-07）","https://coinspaid.com/tpost/coinspaid-hack-investigation"],["The Block. Lazarus Group suspected by CoinsPaid of $37 million hack（2023-07-26）", "https://www.theblock.co/news/regulation/2023-07-26-lazarus-group-suspected-by-coinspaid-of-37-million-hack-241607"]],
 limits:"归因来自受害方，未见执法确认。"
},
{
 id:"c-multichain", name:"Multichain", sub:"所有 MPC 节点都在一个人的云账号里", date:"2023-07-06", type:"跨链桥", chain:"Fantom / Moonriver / Dogechain 等", attr:"疑似内部（未确认）", ev:"I+M", arch:"A", fam:["签名与密钥","阈值","云与内部平台"],
 loss:126,
 thesis:"Multichain 宣称使用 MPC 分布式签名。实际上，<em>MPC 节点服务器都在 CEO 个人控制的云账号下</em>。CEO 在 2023 年 5 月被警方带走后，团队失去对节点的控制。7 月，桥资产被异常转出。",
 figs:[["~$1.26 亿","7 月异常转出","red"],["1 人","实际控制全部 MPC 节点","red"],["2023-05-21","CEO 被警方带走"],["~$6,500 万","USDC/USDT 被发行方冻结（公开报道）","green"],["3 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"云/内部平台",name:"节点集中在一人账号",when:"长期",ev:["fact"],what:["Multichain 的 MPC 节点服务器部署在 CEO 个人的云账号中。","团队其他成员没有服务器访问权限。"],how:"组织与基础设施集中。",block:"MPC 节点分属不同组织、不同云账号。"},
  {d:"签名/密钥",name:"失去控制",when:"2023-05-21 起",ev:["fact"],what:["CEO 被中国警方带走。","团队无法访问节点，跨链服务陆续中断。"],how:"单点人员风险。",block:"密钥托管与应急接管流程。"},
  {d:"跨链",name:"异常转出",when:"2023-07-06 → 07",ev:["fact"],what:["Fantom、Moonriver、Dogechain 桥的 MPC 地址向未知地址转出约 1.26 亿美元。","Circle、Tether 冻结部分稳定币。"],how:"转出者持有 MPC 签名能力。身份未确认。",block:"桥资金速率限制；独立监控。"},
  {d:"洗钱",name:"项目关停",when:"2023-07-14",ev:["fact"],what:["Multichain 宣布停止运营，称 CEO 的家人已被警方带走，资金被转移到安全地址。"],how:"—",block:"—"}
 ],
 mermaid:`flowchart TB
  subgraph CLAIM["宣称：去中心化 MPC"]
    N1["节点 1"] --- N2["节点 2"] --- N3["节点 3"]
  end
  subgraph REAL["实际"]
    ACC["CEO 个人云账号"]
  end
  ACC --> N1 & N2 & N3
  ACC -->|"CEO 被带走"| LOST["团队失去控制"]
  LOST --> OUT["7 月异常转出 约 1.26 亿"]`,
 readpts:["MPC 的密码学是分布式的，但运维可以是集中的。集中运维抵消了 MPC 的全部好处。","这是“签名者独立性”问题的极端形式：所有签名者是同一个人。","局限：7 月转出的操作者身份没有公开确认。"],
 timeline:[["2023-05-21","CEO 被警方带走",""],["2023-05 → 06","跨链服务陆续中断",""],["2023-07-06","约 1.26 亿美元异常转出","","hot"],["2023-07-14","Multichain 宣布停止运营",""]],
 roots:[["MPC ⇄ 运维","密码学分布，运维集中","所有节点在一个账号下。"],["人员 ⇄ 应急","没有关键人员接管预案","一人缺席，全部失控。"]],
 myths:[["MPC 被破解","没有证据显示 MPC 被攻破。问题在节点控制权集中。"],["这是黑客攻击","操作者身份不明，公开信息指向内部或执法相关。"]],
 fixes:[["0","MPC 节点分属至少 3 个独立组织和云账号","① ②","列出每个节点的运营者与云账号，独立实体 ≥ 3。"],["1","关键人员应急预案：密钥分片托管与接管流程","②","演练：任一人员失联 24 小时内恢复服务。"],["1","桥资金独立监控与速率限制","③","单小时出桥超过阈值时暂停。"]],
 labs:["l3"],
 sources:[["Multichain. 官方公告（2023-07-14）","https://twitter.com/MultichainOrg"],["Chainalysis. Multichain Exploit（2023-07）","https://www.chainalysis.com/blog/"],["The Block. Multichain ceases operations as CEO's sister is detained in China while holding $220 million of funds（2023-07-14）", "https://www.theblock.co/news/ecosystems/2023-07-14-multichain-ceases-operations-as-ceos-sister-is-detained-in-china-while-holding-220-million-of-funds-239589"]],
 limits:"转出性质（攻击、内部或执法）没有公开定论。冻结金额来自媒体报道。"
},
{
 id:"c-mixin", name:"Mixin Network", sub:"云服务商的数据库成了热钱包的后门", date:"2023-09-23", type:"钱包", chain:"多链", attr:"未确认（研究怀疑 Lazarus）", ev:"P+I", arch:"A", fam:["供应商","签名与密钥","余额"],
 loss:200,
 thesis:"Mixin 公告称，攻击者入侵了<em>其云服务商的数据库</em>，导致主网部分热钱包资产丢失。损失约 2 亿美元。用户提现暂停，Mixin 提出先赔 50%、其余以债券代币分期偿还。",
 figs:[["$2 亿","热钱包资产损失","red"],["50%","首期赔付比例","warn"],["债券代币","剩余部分的偿付方式"],["SlowMist + Google","参与调查"],["3 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"供应商",name:"云服务商数据库",when:"2023-09-23",ev:["fact","unk"],what:["攻击者入侵 Mixin 云服务商的数据库。","云服务商名称与入侵方式未公开。"],how:"供应链入口。",block:"热钱包密钥材料不存放在第三方可访问的数据库。"},
  {d:"签名/密钥",name:"热钱包失守",when:"2023-09-23",ev:["fact","infer"],what:["攻击者获得热钱包签名能力。"],how:"数据库中可能存有密钥或可推导密钥的数据。",block:"HSM / MPC；密钥材料与业务数据分离。"},
  {d:"链上",name:"多链转出",when:"2023-09-23",ev:["fact"],what:["约 2 亿美元的 ETH、BTC、USDT 等转出。"],how:"—",block:"热钱包余额上限。"},
  {d:"洗钱",name:"赔付方案",when:"2023-09-25 起",ev:["fact"],what:["Mixin 暂停充提。","Mixin 提出：先赔 50%，其余以债券代币按利润分期回购。"],how:"—",block:"—"}
 ],
 timeline:[["2023-09-23","热钱包被盗约 2 亿美元","","hot"],["09-25","Mixin 公告，暂停充提",""],["09-25","提出 50% + 债券代币方案",""]],
 roots:[["供应商 ⇄ 密钥","第三方数据库可触达密钥材料","供应商边界成为钱包边界。"],["热钱包 ⇄ 规模","热钱包余额过大","单次失守即 2 亿美元。"]],
 myths:[["Mixin 主网共识被攻破","公告指向云服务商数据库，不是共识层。"]],
 fixes:[["0","密钥材料只存在于 HSM 或 MPC 节点，不进入任何数据库","②","全库扫描私钥格式字符串，结果必须为 0。"],["0","热钱包余额 ≤ 数小时提现量","③","见 L4。"],["1","供应商访问日志纳入自身 SOC","①","供应商侧异常查询 5 分钟内告警。"]],
 labs:["l4"],
 sources:[["Mixin. 官方公告（2023-09-25）","https://twitter.com/MixinKernel"],["Rekt. Mixin – REKT（2023-09）","https://rekt.news/mixin-rekt/"],["The Block. Mixin Network suspends services after hack involving $200 million in funds（2023-09-24）", "https://www.theblock.co/news/regulation/2023-09-24-mixin-network-suspends-services-after-hack-involving-200-million-in-funds-252698"]],
 limits:"入侵细节未公开。攻击链步骤 2 为推论。本案满足金额门槛，但链路公开程度较低。"
},
{
 id:"c-radiant", name:"Radiant Capital", sub:"三位签名者的屏幕显示正常", date:"2024-10-16", type:"DeFi", chain:"Arbitrum / BSC", attr:"UNC4736（Mandiant 研究判断，朝鲜）", ev:"P+I", arch:"A", fam:["人员与终端","前端与界面","签名与密钥"],
 loss:53,
 thesis:"Radiant 的多签需要 11 人中的 3 人签名。攻击者通过 Telegram 冒充前承包商，发来一个压缩的 PDF。<em>三位签名者的电脑被植入后门</em>：Safe 界面显示正常的排放参数调整，后台签名的是转移合约所有权。",
 figs:[["~$5,000 万","Arbitrum 与 BSC 借贷市场","red"],["3 / 11","多签阈值"],["~5 周","恶意软件潜伏"],["UNC4736","Mandiant 归因（研究）"],["6 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"社工/人",name:"冒充前承包商",when:"2024-09-11",ev:["fact"],what:["攻击者在 Telegram 上冒充一名可信的前承包商。","攻击者发来一个压缩的“PDF 报告”，请开发者审阅。"],how:"利用熟人关系的社工。",block:"外部文件只在隔离环境打开。"},
  {d:"终端",name:"INLETDRIFT 后门",when:"09-11 起",ev:["fact"],what:["文件实为 macOS 后门 INLETDRIFT。","后门在多名开发者设备上建立持久化。"],how:"—",block:"签名设备专机专用，不收发消息。",att:"T1204.002 · T1543"},
  {d:"前端/界面",name:"界面显示正常",when:"10-16",ev:["fact"],what:["签名者在 Safe 界面看到例行的排放参数调整交易。","后台恶意软件替换了发送到硬件钱包的数据。"],how:"终端层的界面欺骗。",block:"第二台设备独立解码 calldata。"},
  {d:"签名/密钥",name:"三个盲签",when:"10-16",ev:["fact"],what:["3 名签名者用硬件钱包签名。设备只显示哈希。","交易失败重试时，恶意软件收集了有效签名。"],how:"盲签 + 签名重试被利用。",block:"硬件钱包清晰签名；对签名失败重试保持警惕。"},
  {d:"合约",name:"转移所有权与升级",when:"10-16",ev:["fact"],what:["签名执行 transferOwnership，LendingPoolAddressesProvider 的所有权转给攻击者。","攻击者把借贷池升级为恶意实现。"],how:"所有权即全部控制权。",block:"所有权转移走时间锁。"},
  {d:"链上",name:"提空市场与用户授权",when:"10-16",ev:["fact"],what:["攻击者提走借贷池资产，并利用用户对 Radiant 合约的历史授权转走用户钱包资产。"],how:"恶意实现继承了用户对原合约的授权。",block:"用户撤销历史授权；协议侧暂停开关。"},
  {d:"洗钱",name:"跨链换 ETH",when:"10 月起",ev:["fact"],what:["资产换成 ETH 并跨链分散。"],how:"—",block:"—"}
 ],
 mermaid:`sequenceDiagram
  participant A as 攻击者 Telegram
  participant D as 签名者电脑
  participant S as Safe 界面
  participant HW as 硬件钱包
  participant P as AddressesProvider
  A->>D: 压缩 PDF 实为 INLETDRIFT
  D->>S: 发起排放参数调整
  Note over D,S: 后门替换待签数据
  S->>HW: transferOwnership 攻击者
  HW-->>D: 显示哈希 签名 x3
  D-->>P: 所有权转给攻击者
  A->>P: 升级为恶意实现 提空`,
 readpts:["与 Bybit 的区别：Bybit 的篡改在供应商云端（S3 上的 JS），Radiant 的篡改在签名者本机。","签名失败重试是危险信号：恶意软件可以让第一次签名“失败”，再收集有效签名。","局限：后门在每台设备上的确切行为来自 Mandiant 分析。"],
 timeline:[["2024-09-11","Telegram 冒充前承包商发送文件",""],["2024-10-16","3 个签名到齐，所有权转移，约 5,000 万美元被盗","","hot"],["10-18","Radiant 发布初步复盘",""],["12-06","Radiant 发布含 Mandiant 结论的复盘","归因 UNC4736。"]],
 roots:[["签名者 ⇄ 日常设备","签名设备也用于沟通","社工文件直接进入签名环境。"],["界面 ⇄ 数据","签名依赖本机界面","本机被控，界面即不可信。"],["所有权 ⇄ 时间","所有权转移立即生效","没有时间锁可撤回。"]],
 myths:[["Safe 有漏洞","Safe 合约按设计运行。篡改发生在签名者本机。"],["3/11 足够分散","3 名签名者的设备在同一个社工活动中被攻破。"]],
 fixes:[["0","签名设备专机专用，与日常沟通设备物理分离","① ②","签名设备上不安装 Telegram、邮件客户端。"],["0","所有权转移、升级等操作走时间锁","⑤","transferOwnership 后 48 小时内可撤销。"],["1","签名 SOP：第二台设备独立计算哈希；签名失败重试时暂停核查","③ ④","红队模拟“签名失败重试”，签名者必须暂停。"]],
 labs:["l2","l3"],
 sources:[["Radiant Capital. Radiant Post-Mortem（2024-12-06）","https://medium.com/@RadiantCapital/radiant-post-mortem-fecd6cd38081"],["Mandiant / Radiant. INLETDRIFT 与 UNC4736 分析（2024-12）","https://medium.com/@RadiantCapital/radiant-post-mortem-fecd6cd38081"],["Rekt. Radiant Capital - Rekt II（2024-10-17）", "https://rekt.news/radiant-capital-rekt2"]],
 limits:"归因为研究机构判断，未见执法确认。"
},
{
 id:"c-cetus", name:"Cetus", sub:"一个溢出检查写错，验证者冻结了攻击者", date:"2025-05-22", type:"DeFi", chain:"Sui", attr:"未知", ev:"P+I", arch:"B", fam:["合约","熔断"],
 loss:223,
 thesis:"Cetus 的数学库函数 checked_shlw 本该检查左移是否溢出，<em>检查条件写错了</em>。攻击者因此用 1 个单位的代币添加了巨额流动性，再全部取出。Sui 验证者随后冻结了攻击者约 1.62 亿美元，引发“链能否冻结资产”的争议。",
 figs:[["$2.23 亿","多个池子被提空","red"],["~$1.62 亿","Sui 验证者冻结","green"],["~$6,000 万","USDC 跨到以太坊","warn"],["1 单位","添加巨额流动性所需代币"],["4 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"链上",name:"闪电兑换压价",when:"05-22 ~10:30 UTC",ev:["fact"],what:["攻击者用闪电兑换把池子价格推到极端区间。"],how:"让后续计算进入溢出边界。",block:"价格区间与 tick 边界检查。"},
  {d:"合约",name:"溢出检查错误",when:"同一交易",ev:["fact"],what:["checked_shlw 用错误的掩码判断左移是否溢出。","超大数值通过检查，左移后被截断成很小的数。"],how:"整数溢出检查实现错误（integer-mate 库）。",block:"数学库形式化验证；边界值模糊测试。"},
  {d:"合约",name:"1 单位换巨额流动性",when:"同一交易",ev:["fact"],what:["协议按截断后的数计算所需代币：只需 1 个单位。","攻击者获得巨额流动性份额，再取出池中真实资产。"],how:"—",block:"添加流动性前后做不变量检查（资产增加 ≥ 份额价值）。"},
  {d:"跨链",name:"跨链转出",when:"05-22",ev:["fact"],what:["攻击者把约 6,000 万美元 USDC 跨到以太坊。"],how:"—",block:"桥侧速率限制。"},
  {d:"治理",name:"验证者冻结",when:"05-22 → 05-29",ev:["fact"],what:["Sui 验证者拒绝处理攻击者地址的交易，冻结约 1.62 亿美元。","Sui 社区投票通过，把冻结资金转入多签托管，用于赔付。"],how:"链级干预。",block:"—",note:"这一步减少了损失，也引发了对去中心化的质疑。"}
 ],
 mermaid:`flowchart LR
  A["闪电兑换 推到极端价格"] --> B["计算所需代币"]
  B --> C{"checked_shlw 检查"}
  C -->|"条件写错 放行"| D["左移溢出 截断为很小的数"]
  D --> E["只需 1 单位代币"]
  E --> F["获得巨额流动性"]
  F --> G["取出真实资产 2.23 亿"]
  G --> H["约 6,000 万跨到以太坊"]
  G --> I["约 1.62 亿 被 Sui 验证者冻结"]`,
 readpts:["溢出检查的存在让开发者以为“已经处理了溢出”。检查本身错了。","冻结只在攻击者尚未把资产跨出 Sui 时有效。","局限：checked_shlw 的具体掩码细节见 Cetus 复盘。"],
 analogy:"计算器的“数字太大”提示灯接错了线。输入一个天文数字，屏幕显示 1，收银员就按 1 块钱收款。",
 timeline:[["2025-05-22 ~10:30 UTC","攻击发生，约 2.23 亿美元","","hot"],["05-22","Sui 验证者冻结约 1.62 亿美元","","ok"],["05-29","Sui 社区投票，冻结资金转入多签托管","","ok"],["2025-06-08","Cetus 重启，以国库与 Sui 基金会贷款补足用户","","ok"]],
 roots:[["检查 ⇄ 正确性","检查代码未被验证","溢出检查本身没有被测试覆盖边界。"],["依赖 ⇄ 审计","数学库作为依赖未被深入审计","审计聚焦业务合约。"],["链 ⇄ 干预","冻结依赖验证者协调","有效，但不可预期。"]],
 myths:[["Sui Move 不安全","Move 语言没有缺陷。问题在一个库函数的检查条件。"],["资金都被冻结了","约 6,000 万美元已跨到以太坊。"]],
 fixes:[["0","数学库函数做形式化验证与边界值模糊测试","②","对 checked_* 系列函数输入 2^k 边界值，全部通过断言。"],["0","流动性变更前后做不变量检查","③","添加流动性后，池子真实资产增加必须 ≥ 份额价值。"],["1","第三方数学库纳入审计范围","②","审计报告列出全部依赖库及其覆盖情况。"]],
 labs:["l1"],
 sources:[["Cetus. Cetus Relaunch Incoming: Recovery Plan and the Road Ahead（2025-06-07）", "https://medium.com/@CetusProtocol/cetus-relaunch-incoming-recovery-plan-and-the-road-ahead-9fc0f8bd5c41"],["Sui. Response to the Cetus Incident – Onchain Community Vote（2025-05-27）", "https://www.sui.io/blog/cetus-incident-response-onchain-community-vote"],["Dedaub / Cyfrin. Cetus checked_shlw analysis（2025-05）","https://dedaub.com/blog/"]],
 limits:"冻结与追回金额以 Cetus 与 Sui 公告为准。"
}
);
