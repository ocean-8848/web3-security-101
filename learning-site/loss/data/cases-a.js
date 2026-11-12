/* 独立案件章 · A 组：Coincheck、Poly Network、Ronin、Wormhole、Nomad、Mango */
H.cases.push(
{
 id:"c-coincheck", name:"Coincheck", sub:"一把热钱包私钥丢掉 5.3 亿美元", date:"2018-01-26", type:"CEX", chain:"NEM", attr:"未确认（研究与媒体怀疑 Lazarus）", ev:"P+M",
 loss:530,
 thesis:"Coincheck 把约 5.23 亿 XEM 放在<em>一个单签热钱包</em>里。攻击者用钓鱼邮件进入员工电脑，再进入内网，拿到了这一把私钥。冷钱包和多签都没有用上。",
 figs:[["$5.3 亿","事发时估值（约 5.23 亿 XEM）","red"],["~8.5 小时","首笔转出到平台发现"],["1 把","私钥控制全部 NEM 资产","red"],["¥463 亿","向约 26 万用户赔付（日元）","green"],["5 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"社工/人",name:"钓鱼邮件",when:"2017 年底",ev:["fact"],what:["攻击者向多名员工发送带恶意软件的邮件。","攻击者冒充外部联系人，与员工建立往来。"],how:"鱼叉式钓鱼（Spear Phishing）。Coincheck 在国会听证和公告中确认了这一入口。",block:"邮件附件沙箱；高风险岗位的终端隔离；对外联系人身份核验。"},
  {d:"终端",name:"终端感染",when:"2017 年底 → 2018-01",ev:["fact","unk"],what:["员工电脑运行了恶意软件。","攻击者取得远程控制能力。"],how:"恶意软件家族和持久化方式未公开。",block:"EDR 行为检测；办公终端与生产网络分区。"},
  {d:"云/内部平台",name:"进入内网",when:"2018-01",ev:["infer"],what:["攻击者从员工电脑进入内部网络。","攻击者找到运行 NEM 节点的服务器。"],how:"横向移动的具体路径未公开。",block:"办公网到钱包服务器默认拒绝；跳板机加多因素认证。"},
  {d:"签名/密钥",name:"窃取私钥",when:"2018-01-26 前",ev:["fact"],what:["攻击者在 NEM 服务器侧取得热钱包私钥。","该钱包为单签名。NEM 支持多签，Coincheck 没有启用。"],how:"私钥以可读形式存放在联网服务器上。",block:"大额资产放冷钱包；热钱包启用多签或 MPC；私钥不落盘。",note:"这是整条链的单点故障。只要这一步有第二把钥匙，后面的转账就无法完成。"},
  {d:"链上",name:"批量转出",when:"01-26 00:02–08:26 JST",ev:["fact"],what:["攻击者用私钥签发 9 笔转账。","约 5.23 亿 XEM 转到攻击者地址。"],how:"合法签名的普通转账。链上无法区分。",block:"热钱包余额上限；异常大额转账告警；转出速率限制。"},
  {d:"洗钱",name:"暗网兑换",when:"2018-02 → 03",ev:["fact","infer"],what:["NEM 基金会给攻击者地址打标签。","攻击者在暗网网站把 XEM 换成 BTC、LTC 等。"],how:"利用打标签之外的场外兑换渠道分散资产。",block:"行业共享黑名单；场外兑换商 KYC。"}
 ],
 mermaid:`flowchart LR
  A["攻击者"] -->|"钓鱼邮件"| B["员工电脑"]
  B -->|"横向移动"| C["内部网络"]
  C --> D["NEM 节点服务器"]
  D -->|"读取"| K["单签热钱包私钥"]
  K -->|"9 笔转账"| W["攻击者地址"]
  subgraph 缺失的控制
    X1["冷钱包分层"]
    X2["NEM 多签"]
    X3["余额上限"]
  end
  X2 -.->|"若启用则需第二把钥匙"| K`,
 readpts:["资金从一个热钱包直接流向攻击者。中间没有任何需要第二个人或第二台设备参与的环节。","NEM 协议原生支持多签。风险来自配置选择，不来自协议缺陷。","局限：入侵路径来自平台口述，没有完整取证报告公开。"],
 analogy:"银行把全部现金放在前台抽屉里，钥匙挂在柜员电脑旁边。小偷只要骗柜员打开一封信，就能拿到钥匙。比喻的局限：链上转账不能撤销，银行的电汇可以追回。",
 timeline:[["2018-01-26 00:02","首笔未授权转账","时间为日本时间（JST）。","hot"],["08:26","最后一笔转账","约 8.5 小时内转出 5.23 亿 XEM。","hot"],["11:25","平台发现异常","随后暂停 NEM 充提，之后暂停全部币种提现。"],["01-28","宣布按 88.549 日元/XEM 赔付","约 26 万名持有人，总额约 463 亿日元。","ok"],["01-29","日本金融厅下达业务改善命令","3 月再次下令。"],["2018-04","Monex 集团收购 Coincheck","约 36 亿日元。"],["2021","日本警方以收受赃物等罪名处理约 30 人","他们在暗网折价兑换了被盗 XEM。"]],
 roots:[["终端 ⇄ 内网","办公网可达钱包服务器","员工电脑失陷后，攻击者能一路走到 NEM 节点。"],["服务器 ⇄ 私钥","私钥存放在联网主机","私钥可被读取，没有 HSM 或隔离签名。"],["私钥 ⇄ 资产","一把钥匙控制全部资产","单签 + 无冷钱包 + 无余额上限，三项缺失叠加。"]],
 myths:[["NEM 协议被攻破了","NEM 协议正常运行。被盗的是 Coincheck 自己保管的私钥。"],["交易所赔了钱，所以没有损失","赔付来自 Coincheck 自有资金，损失被转移到了公司。被盗的 XEM 没有追回。"]],
 fixes:[["0","大额资产转入冷钱包。热钱包只保留数小时提现量。","④ ⑤","热钱包余额 / 日均提现量 ≤ 设定倍数。"],["0","热钱包启用多签或 MPC。签名设备与办公网隔离。","④","单台服务器失陷后，无法独立签出交易。"],["1","钱包服务器网络默认拒绝。只允许指定跳板机访问。","③","从办公网直连钱包服务器，连接必须失败。"],["2","钓鱼演练和附件沙箱。","① ②","季度演练点击率逐步下降。"]],
 labs:["l4"],
 sources:[["ScanNetSecurity. 不正アクセスによる仮想通貨外部送金、金融庁から業務改善命令(コインチェック)（2018-01-31）", "https://scan.netsecurity.ne.jp/article/2018/01/31/40549.html"],["Reuters. Japan's Coincheck says hackers stole $530 million（2018-01-26）","https://www.reuters.com/article/us-japan-cryptocurrency-coincheck-idUSKBN1FG0EQ"],["日本金融厅. コインチェック株式会社に対する行政処分について（2018-01-29）", "https://www.fsa.go.jp/news/30/virtual_currency/kasoutuka.html"],["日本金融厅. コインチェック株式会社に対する行政処分について（2018-03-08）", "https://www.fsa.go.jp/news/30/virtual_currency/20180308-1.html"]],
 limits:"入侵路径来自 Coincheck 的公开说明和听证陈述，不是独立取证报告。归因没有执法确认。"
},
{
 id:"c-poly", name:"Poly Network", sub:"一个函数名碰撞换掉了跨链守门人", date:"2021-08-10", type:"跨链桥", chain:"Ethereum / BSC / Polygon", attr:"未知（攻击者自称白帽）", ev:"P+I",
 loss:611,
 thesis:"攻击者没有偷任何私钥。攻击者构造了一条跨链消息，让桥合约<em>调用了它自己的管理函数</em>，把守门人公钥换成攻击者的公钥。之后，攻击者在三条链上给自己签了提款单。",
 figs:[["$6.11 亿","三条链合计（事发时）","red"],["0x41973cd9","被碰撞的 4 字节函数选择器"],["~15 天","资金基本归还完毕","green"],["$3,300 万","USDT 被 Tether 冻结","green"],["4 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"跨链",name:"构造跨链消息",when:"08-10 09:xx UTC",ev:["fact"],what:["攻击者在源链发起一笔跨链交易。","消息的目标合约写成 EthCrossChainData，方法名写成一个特制字符串。","中继者把消息转发到以太坊等目标链。"],how:"中继和目标链合约都没有限制“目标合约不能是桥自己的数据合约”。",block:"跨链消息目标地址白名单；禁止调用桥内部合约。"},
  {d:"合约",name:"函数选择器碰撞",when:"08-10",ev:["fact"],what:["EthCrossChainManager 用 keccak256(方法名 + \"(bytes,bytes,uint64)\") 的前 4 字节作为选择器。","攻击者暴力搜索出方法名 f1121318093。","它的选择器与 putCurEpochConPubKeyBytes(bytes) 相同：0x41973cd9。"],how:"4 字节选择器只有 2^32 种取值。暴力搜索的成本很低。",block:"不要用用户输入拼接函数签名；对外部可调用的目标做显式映射。",note:"EthCrossChainManager 是 EthCrossChainData 的 owner。所以这次“自己调用自己”通过了权限检查。"},
  {d:"签名/密钥",name:"替换守门人公钥",when:"08-10",ev:["fact"],what:["putCurEpochConPubKeyBytes 被执行。","Keeper（守门人）公钥被替换为攻击者控制的公钥。"],how:"桥用 Keeper 签名证明“这笔提款来自合法的跨链消息”。换掉 Keeper 等于拿到了印章。",block:"Keeper 变更走多签和时间锁；变更事件实时告警。"},
  {d:"跨链",name:"三链提款",when:"08-10 约 2 小时内",ev:["fact"],what:["攻击者用自己的 Keeper 私钥签发提款证明。","以太坊约 2.73 亿美元、BSC 约 2.53 亿美元、Polygon 约 8,500 万美元被提走。"],how:"目标链合约验证签名通过，按消息放款。",block:"单链、单资产提款限速；大额提款延迟窗口。"},
  {d:"洗钱",name:"冻结与归还",when:"08-10 → 08-23",ev:["fact"],what:["Tether 冻结约 3,300 万 USDT。","攻击者在链上留言，自称“为了好玩”。","攻击者分批归还资产。Poly 公开称其为“白帽先生”。"],how:"被盗资产高度可见，变现难度大。这是攻击者归还的可能原因。",block:"稳定币发行方冻结；交易所充值黑名单。"}
 ],
 mermaid:`sequenceDiagram
  participant A as 攻击者
  participant S as 源链 + 中继
  participant M as EthCrossChainManager
  participant D as EthCrossChainData
  participant V as 桥资金池
  A->>S: 跨链消息 目标=D 方法="f1121318093"
  S->>M: verifyHeaderAndExecuteTx
  M->>M: selector = keccak256 方法名+参数类型 前4字节
  Note over M: 0x41973cd9 = putCurEpochConPubKeyBytes
  M->>D: 调用 owner 专用函数
  D-->>D: Keeper 公钥 = 攻击者公钥
  A->>V: 用新 Keeper 签名的提款证明
  V-->>A: 放款 约 6.11 亿美元`,
 readpts:["关键一跳是 M → D。M 拥有 D 的管理权，所以 M 被诱导时，权限检查形同虚设。","选择器只有 4 字节。<mark class=\"hl\">任何“用户可控字符串 → 函数选择器”的设计都会被暴力碰撞。</mark>","局限：本图省略了源链的打包和证明细节。"],
 analogy:"公司前台按来信上写的“部门名”转接电话。有人把部门名写成一串乱码，乱码碰巧对应“修改公章”分机。前台转了，因为前台本身有权打这个分机。",
 timeline:[["2021-08-10","攻击开始","约 2 小时内完成三条链的提款。","hot"],["08-10","Poly 公开呼吁归还","交易所和稳定币发行方开始冻结。"],["08-11","攻击者开始归还","通过链上消息与项目方沟通。","ok"],["08-17","Poly 邀请攻击者任“首席安全顾问”","并提供 50 万美元赏金。"],["08-23","除被冻结的 USDT 外，资产基本归还","Poly 称已取回全部私钥控制权。","ok"]],
 roots:[["中继 ⇄ 目标合约","中继不检查调用目标","跨链消息可以指向桥自己的数据合约。"],["Manager ⇄ Data","高权限合约暴露在通用调用路径上","Manager 是 Data 的 owner，又会执行任意外部消息。"],["Keeper ⇄ 资金","守门人变更没有延迟","公钥替换后立刻生效，没有时间锁和人工确认。"]],
 myths:[["私钥被盗了","攻击者没有偷私钥。攻击者用合约逻辑把公钥换成了自己的。"],["钱还了，所以不算事故","归还取决于攻击者的意愿。这次事件仍暴露了同类桥的设计缺陷。"]],
 fixes:[["0","跨链执行器只允许调用白名单合约和白名单方法。","① ②","构造指向 Data 合约的测试消息，执行器必须拒绝。"],["0","Keeper 或验证者集合变更走多签 + 时间锁。","③","变更交易在时间锁内可被取消。"],["1","按链、按资产设置提款速率上限。","④","单小时提款超过阈值时自动暂停。"]],
 labs:["l3"],
 sources:[["Poly Network. Official statement on the attack（2021-08）","https://medium.com/poly-network"],["SlowMist. The Root Cause Of Poly Network Being Hacked（2021-08-10）", "https://slowmist.medium.com/the-root-cause-of-poly-network-being-hacked-ec2ee1b0c68f"],["Kudelski Security. The Poly Network hack explained（2021-08）","https://research.kudelskisecurity.com/2021/08/12/the-poly-network-hack-explained/"],["CNBC. Poly Network hacker returns remaining cryptocurrency（2021-08-23）", "https://www.cnbc.com/2021/08/23/poly-network-hacker-returns-remaining-cryptocurrency.html"]],
 limits:"攻击者身份未知。分链金额来自安全公司统计，各家口径差异约 1%。"
},
{
 id:"c-ronin", name:"Ronin 跨链桥", sub:"9 把钥匙里 5 把握在一家公司手里", date:"2022-03-23", type:"跨链桥", chain:"Ethereum / Ronin", attr:"Lazarus（FBI 确认）", ev:"P+I",
 loss:625,
 thesis:"Ronin 桥要求 9 个验证者中的 5 个签名。看起来是分权。实际上 Sky Mavis 一家掌握 4 把，另有 1 把通过<em>一份没有撤销的临时授权</em>也归它调用。攻击者只需攻破一家公司。",
 figs:[["$6.25 亿","173,600 ETH + 2,550 万 USDC","red"],["5 / 9","签名阈值"],["4 + 1","Sky Mavis 实际可调用的签名"],["6 天","被盗后才被发现","red"],["5 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"社工/人",name:"假招聘",when:"2021 年底 → 2022 初",ev:["fact"],what:["攻击者在 LinkedIn 以招聘名义联系 Sky Mavis 高级工程师。","攻击者安排多轮“面试”，并给出高薪 offer。"],how:"社会工程。The Block 报道了这一细节，Sky Mavis 复盘确认了鱼叉钓鱼入口。",block:"关键岗位员工的外部招聘接触报备；不在工作设备上打开外部文档。"},
  {d:"终端",name:"PDF 恶意软件",when:"2022 初",ev:["fact"],what:["工程师打开了 offer PDF。","恶意代码在其设备上执行。"],how:"文档投毒。",block:"文档在隔离环境中打开；EDR 检测异常子进程。"},
  {d:"云/内部平台",name:"渗透基础设施",when:"2022 初 → 03",ev:["fact","unk"],what:["攻击者进入 Sky Mavis 的 IT 基础设施。","攻击者找到 4 个验证者节点的签名能力。"],how:"横向移动细节未公开。",block:"验证者节点独立网络域；运维访问需要硬件密钥。"},
  {d:"签名/密钥",name:"4 把验证者签名",when:"2022-03",ev:["fact"],what:["攻击者控制 Sky Mavis 运行的 4 个验证者。"],how:"同一家公司运行近半数验证者。阈值 5/9 只差 1 把。",block:"验证者分散到相互独立的组织和基础设施。"},
  {d:"签名/密钥",name:"未撤销的白名单",when:"2021-11 授权 → 2022-03 被利用",ev:["fact"],what:["2021 年 11 月，Axie DAO 允许 Sky Mavis 代其签名，以缓解交易高峰。","这项安排在 12 月停止，但白名单权限没有撤销。","攻击者经 Sky Mavis 的免 Gas RPC 节点取得 Axie DAO 的签名。"],how:"临时授权变成永久后门。",block:"临时授权必须带到期时间；定期审计验证者签名权限。",note:"这是第 5 把钥匙。没有这一步，4 把签名不能达到阈值。"},
  {d:"跨链",name:"两笔伪造提款",when:"2022-03-23",ev:["fact"],what:["攻击者用 5 个签名批准两笔提款。","173,600 ETH 和 2,550 万 USDC 从以太坊侧桥合约转出。"],how:"桥合约只看签名数量，不看签名是否来自独立实体。",block:"大额提款延迟 + 人工复核；提款金额相对 TVL 的比例告警。"},
  {d:"洗钱",name:"6 天后发现",when:"03-29 发现 → 04 月",ev:["fact"],what:["一名用户无法提取 5,000 ETH，团队才发现被盗。","攻击者经 Tornado Cash 和中心化交易所洗钱。","4 月 14 日，FBI 归因 Lazarus。OFAC 制裁相关地址。"],how:"桥没有实时余额监控。",block:"桥合约余额与链上锁定量实时对账。"}
 ],
 mermaid:`flowchart TB
  subgraph SM["Sky Mavis 一家公司"]
    V1["验证者 1"]:::own
    V2["验证者 2"]:::own
    V3["验证者 3"]:::own
    V4["验证者 4"]:::own
    RPC["免 Gas RPC 节点"]:::own
  end
  subgraph DAO["Axie DAO"]
    V5["验证者 5"]:::own
  end
  subgraph OTH["其他 4 个独立验证者"]
    V6["V6"]
    V7["V7"]
    V8["V8"]
    V9["V9"]
  end
  RPC -.->|"未撤销的代签白名单"| V5
  V1 & V2 & V3 & V4 & V5 -->|"5 / 9 达到阈值"| BR["桥合约放款"]
  classDef own fill:#fbe6e4,stroke:#c2362d,color:#111823`,
 readpts:["红色节点是攻击者实际控制的签名。9 把钥匙只分布在 2 个组织，且其中一个组织能调用另一个组织的钥匙。","“签名者数量”和“独立实体数量”是两件事。阈值应按独立实体计算。","局限：图中“其他 4 个验证者”的运营方未逐一列出。"],
 analogy:"保险柜要 5 个股东签字才能打开。9 个股东里有 4 个是同一个人的马甲，还有 1 个曾把印章借给他，借完忘了收回。",
 timeline:[["2021-11","Axie DAO 授权 Sky Mavis 代签","应对交易高峰。"],["2021-12","代签安排停止","白名单没有撤销。"],["2022-03-23","两笔提款，约 6.25 亿美元","","hot"],["03-29","用户报告提款失败，团队发现被盗","距被盗约 6 天。","hot"],["04-14","FBI 归因 Lazarus Group","OFAC 制裁攻击者地址。"],["04-06","Sky Mavis 融资 1.5 亿美元用于赔付","Binance 领投。","ok"],["2022-06-28","桥在审计后重新开放","验证者与阈值重新配置。","ok"],["2022-09","执法部门查扣约 3,000 万美元","Chainalysis 协助。","ok"]],
 roots:[["阈值 ⇄ 组织","签名者不独立","5/9 的阈值在组织层面只等于 2 选 1。"],["授权 ⇄ 时间","临时权限没有到期","代签白名单在停止使用后继续有效。"],["资金 ⇄ 监控","没有余额对账","6 亿美元转出后 6 天没有告警。"]],
 myths:[["多签就安全","多签的安全性取决于签名者是否独立。同一组织持有多把钥匙时，多签退化为单签。"],["是 Axie DAO 被黑","攻击者没有直接攻破 Axie DAO。攻击者利用了 Sky Mavis 对 DAO 签名的代签权限。"]],
 fixes:[["0","按独立实体设计阈值。任何单一组织持有的签名数小于阈值减 1。","④ ⑤","列出每个签名者的运营方，计算最小攻破组织数 ≥ 3。"],["0","所有临时授权写入到期时间，到期自动失效。","⑤","每月导出签名权限清单，与审批单比对。"],["1","桥锁仓余额实时对账；大额提款延迟窗口。","⑥ ⑦","模拟一笔超过 TVL 5% 的提款，必须触发延迟与告警。"],["2","关键岗位员工的招聘社工演练。","① ②","红队投递假 offer，跟踪报告率。"]],
 labs:["l3"],
 sources:[["Ronin. Community Alert: Ronin Validators Compromised（2022-03-29）","https://roninchain.com/blog/posts/community-alert-ronin-validators-compromised-6513cc78a5edc1001b03c364"],["Sky Mavis. Back to Building: Ronin Security Breach Postmortem（2022-04-27）","https://roninchain.com/blog/posts/back-to-building-ronin-security-breach-6513cc78a5edc1001b03c364"],["FBI. Statement on Attribution of Malicious Cyber Activity Posed by DPRK（2022-04-14）","https://www.fbi.gov/news/press-releases/fbi-statement-on-attribution-of-malicious-cyber-activity-posed-by-the-democratic-peoples-republic-of-korea"],["The Block. How a fake job offer took down the world's most popular crypto game（2022-07-06）", "https://www.theblock.co/post/156038/how-a-fake-job-offer-took-down-the-worlds-most-popular-crypto-game"],["Chainalysis. $30 Million Seized（2022-09）","https://www.chainalysis.com/blog/axie-infinity-ronin-bridge-dprk-hack-seizure/"]],
 limits:"假招聘细节来自媒体援引知情人士。Sky Mavis 复盘只确认了“鱼叉式钓鱼”。"
},
{
 id:"c-wormhole", name:"Wormhole", sub:"一张伪造的“验签通过”回执", date:"2022-02-02", type:"跨链桥", chain:"Solana / Ethereum", attr:"未知", ev:"P+I",
 loss:326,
 thesis:"Wormhole 的 Solana 合约要确认“守护者已经签名”。攻击者给它看了一个<em>假的系统账户</em>，合约没有核对这个账户是不是真的系统账户，就相信了里面的“验签结果”。",
 figs:[["$3.26 亿","120,000 wETH 凭空铸造","red"],["93,750 ETH","跨回以太坊"],["< 24 小时","Jump Crypto 补足 120k ETH","green"],["~$1.4 亿","2023 年经法院授权反向取回","green"],["3 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"合约",name:"传入假系统账户",when:"02-02 约 18 时 UTC",ev:["fact"],what:["Solana 合约的 verify_signatures 需要读取 Instructions 系统账户（sysvar）。","攻击者传入一个自己创建的账户，内容伪造成“secp256k1 验签已通过”。"],how:"合约使用已弃用的 load_instruction_at。它不检查传入账户的地址是不是真正的 sysvar。",block:"读取 sysvar 前校验账户地址；使用 load_instruction_at_checked。",note:"Solana 程序的账户由调用者传入。每个账户都要校验“它是谁”。这是 Solana 开发的头号陷阱。"},
  {d:"合约",name:"伪造签名集合",when:"02-02",ev:["fact"],what:["合约生成一个 SignatureSet 账户，标记“守护者签名有效”。"],how:"上一步的假数据被当成真结果记录下来。",block:"签名验证与结果记录放在同一指令内完成。"},
  {d:"跨链",name:"铸造 12 万 wETH",when:"02-02",ev:["fact"],what:["攻击者用伪造的签名集合提交 VAA（跨链消息）。","合约在 Solana 上铸造 120,000 wETH，没有对应的以太坊锁仓。"],how:"桥认为这条消息来自守护者网络。",block:"铸造量与对端锁仓量实时对账；单笔铸造上限。"},
  {d:"跨链",name:"跨回以太坊",when:"02-02",ev:["fact"],what:["攻击者把 93,750 wETH 换回以太坊上的真 ETH。","剩余约 36,000 wETH 在 Solana 上换成 SOL 和 USDC。"],how:"真 ETH 来自桥的以太坊侧资金池。其他用户的 wETH 因此失去 1:1 支撑。",block:"出桥方向的速率限制（后来的 Governor 机制）。"},
  {d:"洗钱",name:"补足与反向取回",when:"02-03 → 2023-02",ev:["fact"],what:["Jump Crypto 在 24 小时内注入 120,000 ETH，恢复 wETH 支撑。","2023 年 2 月，Jump 和 Oasis 依据英国法院命令，从攻击者的 Oasis 金库取回约 1.4 亿美元资产。"],how:"攻击者把资金放进可升级的 DeFi 金库。管理员权限成为取回手段。",block:"—"}
 ],
 mermaid:`sequenceDiagram
  participant A as 攻击者
  participant P as Wormhole Solana 程序
  participant F as 假 sysvar 账户
  participant E as 以太坊侧资金池
  A->>F: 创建账户 内容="secp256k1 已验签"
  A->>P: verify_signatures 账户列表含 F
  P->>F: load_instruction_at 读取
  Note over P,F: 没有检查 F 的地址是否为真 sysvar
  P-->>P: SignatureSet = 有效
  A->>P: post_vaa + complete_wrapped
  P-->>A: 铸造 120,000 wETH
  A->>E: 赎回 93,750 ETH
  E-->>A: 真 ETH`,
 readpts:["<mark class=\"hl\">漏洞在“读取前没有核对账户身份”</mark>。签名算法本身没有被破解。","修复补丁在攻击前已提交到公开代码仓库，但尚未部署到主网。<mark class=\"hl\">公开补丁本身可能给攻击者提示</mark>。","局限：攻击者是否从公开补丁中发现漏洞，没有证据。"],
 analogy:"门卫只看访客手里的“已核验”贴纸，不看贴纸是不是保安室发的。",
 timeline:[["2022-01-13","Solana SDK 弃用 load_instruction_at","推荐使用带校验的新函数。"],["2022-02-01","修复提交到公开 GitHub 仓库","尚未部署。"],["2022-02-02 约 18:24 UTC","攻击发生","分钟级时刻来自二手复盘。","hot"],["02-02 当晚","Wormhole 暂停网络，提出 1,000 万美元赏金",""],["02-03","Jump Crypto 补足 120,000 ETH","","ok"],["2023-02-21","Jump 与 Oasis 反向取回约 1.4 亿美元","依据英国高等法院命令。","ok"]],
 roots:[["程序 ⇄ 账户","输入账户没有身份校验","Solana 模型把账户校验责任交给每个程序。"],["补丁 ⇄ 部署","公开补丁先于主网部署","修复窗口期内漏洞对外可见。"],["铸造 ⇄ 锁仓","两侧没有实时对账","12 万 wETH 无锁仓铸造未被即时拦截。"]],
 myths:[["守护者私钥泄露","守护者没有被攻破。攻击者绕过了“验证守护者签名”这一步。"],["用户亏了 3 亿","Jump 补足后，用户的 wETH 恢复 1:1 支撑。损失由 Jump 承担，之后部分取回。"]],
 fixes:[["0","所有 sysvar 和程序账户在读取前校验地址与 owner。","① ②","用 Anchor 约束或静态分析覆盖全部指令。"],["0","安全补丁在主网部署后再公开合并。","①","发布流程中加入“私有修复分支”步骤。"],["1","按链设置出桥速率上限（Wormhole 后来上线 Governor）。","④","模拟大额出桥，超额部分进入延迟队列。"]],
 labs:["l1"],
 sources:[["Wormhole. Wormhole Incident Report 02/02/22","https://wormholecrypto.medium.com/wormhole-incident-report-02-02-22-ad9b8f21eec6"],["Kudelski Security. Quick Analysis of the Wormhole attack（2022-02）", "https://kudelskisecurity.com/research/quick-analysis-of-the-wormhole-attack"],["The Block. Jump Crypto and Oasis counter-exploit Wormhole hacker（2023-02-24）", ""]],
 limits:"攻击者身份未知。反向取回金额来自媒体对链上数据的统计。"
},
{
 id:"c-nomad", name:"Nomad 跨链桥", sub:"零值成了万能钥匙，数百人一起抢", date:"2022-08-01", type:"跨链桥", chain:"Ethereum / Moonbeam 等", attr:"众包式哄抢；嫌疑人 2025 年被捕", ev:"P+I",
 loss:190,
 thesis:"一次常规升级把“零值根”标记成了已确认。从那一刻起，<em>任何一条从未被证明的消息</em>都会通过校验。第一笔攻击交易公开后，数百个地址只改了收款地址，就复制了攻击。",
 figs:[["$1.9 亿","约 3 小时内被提走","red"],["300+","参与提取的地址"],["~41 天","漏洞从部署到被利用"],["~$3,600 万","白帽和用户归还","green"],["3 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"合约",name:"升级引入缺陷",when:"2022-06-21",ev:["fact"],what:["Nomad 升级 Replica 合约，在初始化时传入可信根 0x00。","合约把 confirmAt[0x00] 设为 1，即“零值根已确认”。"],how:"初始化参数错误。审计报告曾提示过相关风险。",block:"升级前在主网分叉上回放历史消息；初始化参数做不变量检查。",note:"在 Solidity 中，未写入的映射默认值是 0。未证明消息的根恰好也是 0x00。"},
  {d:"跨链",name:"任意消息通过",when:"2022-08-01 ~21:32 UTC",ev:["fact"],what:["process() 检查 messages[hash] 对应的根是否已确认。","未证明消息的根为 0x00，而 0x00 已被确认。","所以任何消息都被当作已证明。"],how:"默认值与“已确认”标记冲突。",block:"把“未知”与“已确认”分开存储；拒绝零值根。"},
  {d:"链上",name:"复制粘贴攻击",when:"08-01 21:32 → 次日凌晨",ev:["fact"],what:["第一笔攻击交易提走 100 WBTC。","其他人复制交易数据，只替换收款地址。","数百个地址在几小时内提空桥合约。"],how:"攻击不需要技术能力。会复制交易数据就能参与。",block:"桥合约暂停开关；按资产的提款速率上限。"},
  {d:"洗钱",name:"白帽归还与追查",when:"08 月起",ev:["fact"],what:["Nomad 设立 10% 赏金，号召归还。","约 3,600 万美元被归还。","部分资金经 Tornado Cash 流转。"],how:"参与者混杂：有攻击者、白帽、套利机器人。",block:"—"}
 ],
 mermaid:`flowchart LR
  U["2022-06-21 升级"] -->|"initialize root=0x00"| C["confirmAt 0x00 = 1"]
  M["任意未证明消息"] --> P["process"]
  P --> Q{"messages hash 对应的根"}
  Q -->|"未写入 默认 0x00"| R{"confirmAt 根 > 0 ?"}
  C --> R
  R -->|"是"| OK["放款"]
  OK --> X["攻击者 1"]
  OK --> Y["复制者 2…300+"]`,
 readpts:["漏洞是“默认值 = 有效值”的经典组合。0 既表示“没有记录”，又表示“已确认的根”。","攻击交易一旦上链，就是公开的攻击模板。这让损失从单人攻击变成群体哄抢。","局限：参与地址中哪些是白帽、哪些是攻击者，无法从链上区分。"],
 analogy:"门禁系统升级时，把“没有门卡”也登记成了一张有效门卡。第一个人发现后，排队的人只要说“我没卡”就能进门。",
 timeline:[["2022-06-21","Replica 升级上线","零值根被确认。"],["08-01 21:32 UTC","第一笔攻击交易","","hot"],["08-01 晚","数百个地址复制攻击","约 3 小时提走约 1.9 亿美元。","hot"],["08-02","Nomad 确认事件，公布归还地址",""],["08-04","Nomad 提出 10% 赏金","归还者视为白帽。","ok"],["2022 年内","约 3,200 万–3,700 万美元被归还","各来源口径不同。","ok"],["2023-08","美国加州北区起诉 Alexander Gurevich","指控其个人取走约 289 万美元。"],["2025-05-01","Gurevich 在以色列被捕","之后被引渡到美国。"]],
 roots:[["升级 ⇄ 状态","初始化参数没有不变量检查","0x00 被写成可信根。"],["存储 ⇄ 语义","默认值与业务含义冲突","“没写过”与“已确认”无法区分。"],["桥 ⇄ 速率","没有速率上限","3 小时内资金被全部提空。"]],
 myths:[["这是一次高水平黑客攻击","第一笔交易之后，参与者只需复制数据。门槛极低，这正是损失扩大的原因。"],["审计没有发现","审计曾提到相关风险。问题出在升级参数与上线流程。"]],
 fixes:[["0","合约升级前在主网分叉上回放历史交易；初始化参数做不变量断言。","①","CI 中加入“零值根必须无效”的单元测试。"],["0","桥合约设置可快速触发的暂停开关。","③","演练：从告警到暂停小于 10 分钟。"],["1","按资产、按时段的提款上限。","③","单小时提款超过 TVL 的设定比例时自动暂停。"]],
 labs:["l1"],
 sources:[["Nomad. Nomad Bridge Hack: Root Cause Analysis（2022-08）","https://medium.com/nomad-xyz-blog/nomad-bridge-hack-root-cause-analysis-875ad2e5aacd"],["samczsun. Twitter 线程：Nomad 漏洞分析（2022-08-01）","https://twitter.com/samczsun/status/1554252024723546112"],["Rekt. Nomad Bridge – REKT（2022-08）","https://rekt.news/nomad-rekt/"]],
 limits:"损失与归还金额来自 Nomad 和第三方统计，各家口径相差数百万美元。"
},
{
 id:"c-mango", cut:4, name:"Mango Markets", sub:"用自己的钱抬价，再用抬起的价格借空金库", date:"2022-10-11", type:"DeFi", chain:"Solana", attr:"Avraham Eisenberg（本人公开承认）", ev:"P+M",
 loss:114,
 thesis:"攻击者没有利用代码漏洞。他在三个市场<em>买高 MNGO 现货</em>，预言机如实报出了新价格，Mango 按这个价格承认了他的浮盈，并让他用浮盈作抵押借走了金库里几乎所有资产。",
 figs:[["$1.14 亿","被借走的资产","red"],["~5 倍+","约 20 分钟内 MNGO 预言机价格涨幅","red"],["$4,700 万","DAO 投票后攻击者保留","warn"],["$6,700 万","归还 DAO","green"],["4 层","攻击路径跨越的信任域"]],
 steps:[
  {d:"链上",name:"准备两个账户",when:"10-11 ~22:00 UTC",ev:["fact"],what:["攻击者向两个 Mango 账户各存入约 500 万 USDC。"],how:"两个账户互为交易对手，盈亏在攻击者内部抵消。",block:"—"},
  {d:"合约",name:"自买自卖开仓",when:"10-11",ev:["fact"],what:["账户 A 卖出 4.83 亿 MNGO 永续合约。","账户 B 买入同等数量。成交价约 0.0382 美元。"],how:"在流动性很薄的市场上，攻击者自己做对手盘。",block:"单一账户、单一市场的持仓上限；低流动性资产的开仓限额。"},
  {d:"预言机/市场",name:"拉高现货",when:"约 20 分钟",ev:["fact"],what:["攻击者在 FTX、AscendEX、Serum 上买入 MNGO 现货。","预言机聚合价从约 0.03 美元升到约 0.91 美元的高点。"],how:"预言机正确报告了被操纵的市场价格。问题在于这几个市场太浅。",block:"使用 TWAP 和多源中位数；单一资产价格偏离阈值时冻结借贷。"},
  {d:"合约",name:"浮盈作抵押",when:"10-11",ev:["fact"],what:["账户 B 的多头浮盈升至约 4 亿美元。","Mango 把未实现盈亏计入抵押品价值。"],how:"协议允许用未实现浮盈借款。",block:"未实现盈亏不计入或打折计入抵押品。"},
  {d:"合约",name:"借空金库",when:"10-11",ev:["fact"],what:["攻击者借出 BTC、SOL、USDC、MSOL 等全部可借资产，合计约 1.14 亿美元。","MNGO 价格随后回落，账户留下坏账。"],how:"借款上限按抵押品价值计算，没有按资产流动性封顶。",block:"每种资产的借款总额上限；抵押品集中度上限。"},
  {d:"治理",name:"DAO 和解投票",when:"10-12 → 10-15",ev:["fact"],what:["攻击者用借来的 MNGO 参与治理，提出和解方案。","DAO 通过方案：攻击者归还约 6,700 万美元，保留约 4,700 万美元，DAO 承诺不追诉。"],how:"攻击者用被盗资产影响受害方的治理。",block:"借入的治理代币不能投票；和解类提案设定更高门槛。"}
 ],
 mermaid:`flowchart LR
  A["攻击者买入 MNGO 现货"] --> P["MNGO 市场价上升"]
  P --> O["预言机报价上升"]
  O --> U["多头浮盈上升"]
  U --> C["抵押品价值上升"]
  C --> B["可借额度上升"]
  B --> D["借走 BTC SOL USDC …"]
  D -.->|"价格回落后"| BAD["协议坏账"]
  A -.->|"成本"| COST["买现货 + 两边保证金 约 1,000 万美元"]`,
 readpts:["这是一个正反馈环：买得越多，借得越多。只要买入成本小于可借金额，攻击就有利可图。","每一环都按设计工作。失效点是“低流动性资产的价格被当成可借款的硬抵押”。","局限：现货买入的精确成本没有公开统一口径。"],
 analogy:"一个人在冷清的拍卖会上用自己的两个号互相抬价，把一幅画抬到 1 亿，然后拿这幅画去银行抵押，借走 1 亿现金。",
 timeline:[["2022-10-11 ~22:00 UTC","攻击开始","","hot"],["~22:20","MNGO 预言机价格到达高点","借款随即完成。","hot"],["10-12","攻击者提出和解提案","",""],["10-15","DAO 通过和解","攻击者归还约 6,700 万美元。","ok"],["10-15","Eisenberg 公开承认参与，称其为“高利润交易策略”",""],["2022-12","Eisenberg 在波多黎各被捕",""],["2024-04","陪审团判定商品欺诈、操纵市场、电汇欺诈成立",""],["2025-05-23","SDNY 一审法官撤销全部定罪","电汇欺诈以审判地不当、缺乏重大虚假陈述改判无罪。检方已向第二巡回法院上诉。SEC、CFTC 民事诉讼仍在进行。"]],
 roots:[["预言机 ⇄ 市场深度","价格来源太浅","几百万美元就能把价格推高数倍。"],["浮盈 ⇄ 抵押","未实现盈亏被当成硬资产","协议允许用账面利润借走真资产。"],["治理 ⇄ 攻击者","攻击者可以投票","借来的治理代币参与了针对自己的和解表决。"]],
 myths:[["预言机被黑了","预言机准确报告了市场价格。被操纵的是市场本身。"],["代码有漏洞","合约按设计运行。漏洞在风险参数和经济模型。"],["“代码即法律”，所以合法","撤销定罪的理由是审判地和缺乏虚假陈述，不是认定行为合法。检方已上诉。"]],
 fixes:[["0","低流动性资产的抵押率、借款上限、持仓上限按市场深度设置。","② ⑤","用 1,000 万美元模拟拉盘，可借金额必须小于拉盘成本。"],["0","预言机使用 TWAP 与多源中位数；偏离阈值时暂停借贷。","③","在测试网把现货价格拉高 3 倍，借款功能必须暂停。"],["1","未实现盈亏不计入可借抵押品。","④","浮盈账户的可借额度只按已实现余额计算。"],["2","治理投票排除借入代币；和解类提案需要更高法定人数。","⑥","快照投票时检查代币是否来自借贷协议。"]],
 labs:["l6"],
 sources:[["The Block. Mango Markets proposes plan to pay back victims after $114 million hack（2022-10-17）", "https://www.theblock.co/news/defi/2022-10-17-mango-markets-proposes-plan-to-pay-back-victims-after-114-million-hack-177736"],["U.S. DOJ. Man Arrested for Alleged Theft of $110 Million from Mango Markets（2022-12-28）","https://www.justice.gov/usao-sdny/pr/man-arrested-alleged-theft-110-million-cryptocurrency-mango-markets"],["The Block. U.S. judge overturns fraud convictions of Mango Markets exploiter Eisenberg, determining improper venue（2025-05-24）", "https://www.theblock.co/news/regulation/2025-05-24-u-s-judge-overturns-fraud-convictions-of-mango-markets-exploiter-eisenberg-determining-improper-venue-355666"],["Rekt. Mango Markets – REKT（2022-10）","https://rekt.news/mango-markets-rekt/"]],
 limits:"价格高点、借款明细来自链上重建和媒体。司法状态以法院最新文书为准。"
}
);
