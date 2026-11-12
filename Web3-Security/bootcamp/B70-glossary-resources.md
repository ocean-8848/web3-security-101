# B70 术语表与资源索引

| 术语 | 英文 | 定义 |
|---|---|---|
| 外部账户 | EOA | 由私钥控制的账户 |
| 函数选择器 | Function Selector | 函数签名 Keccak-256 的前 4 字节 |
| 存储槽 | Storage Slot | 合约永久存储的 32 字节单元 |
| 代理合约 | Proxy | 持有状态并把调用委托给实现合约的合约 |
| 检查-生效-交互 | CEI | 先检查、再改状态、最后外部调用的编码模式 |
| 重入 | Reentrancy | 外部调用期间再次进入合约 |
| 闪电贷 | Flash Loan | 同一交易内借出并归还的贷款 |
| 预言机 | Oracle | 把链外数据带上链的机制 |
| 时间加权均价 | TWAP | 一段时间内价格的平均值 |
| 最大可提取价值 | MEV | 通过安排交易顺序获得的价值 |
| 健康因子 | Health Factor | 风险调整后抵押价值 ÷ 债务 |
| 不变量 | Invariant | 系统在任何操作后都必须成立的性质 |
| 概念验证 | PoC | 证明问题存在的可运行测试 |
| 时间锁 | Timelock | 操作在延迟后才能执行的机制 |
| 多签 | Multisig | 需要 M/N 个签名才能执行的账户 |
| 账户抽象 | Account Abstraction | 由合约逻辑定义账户验证方式 |
| 形式化验证 | Formal Verification | 用数学方法证明代码满足规范 |

## 资源索引（路线图全部条目）

| 阶段 | 资源 |
|---|---|
| 心法与道德 | [慢雾知识库](https://github.com/slowmist/Knowledge-Base)；[FIRST 道德守则](https://www.first.org/global/sigs/ethics/ethics-first) |
| 区块链基础 | [What Is a Blockchain](https://www.investopedia.com/terms/b/blockchain.asp)；[Anders Brownworth Blockchain Demo](https://andersbrownworth.com/blockchain/)（B03 哈希链实验的原型）；慢雾区块链入门科普专栏；3Blue1Brown [《加密货币工作原理》](https://www.youtube.com/watch?v=bBC-nXj3Ng4)；[精通比特币](https://github.com/inoutcode/bitcoin_book_2nd)；[精通以太坊](https://github.com/inoutcode/ethereum_book)（阶段 0 重点读第 1、4、5、6、7、13 章：基础、密码学、钱包、交易、智能合约与 Solidity、EVM） |
| 合约基础 | [Solidity 文档](https://docs.soliditylang.org/)；[ERC 列表](https://eips.ethereum.org/erc)；[OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)；[yAcademy Proxies 源码](https://github.com/yAudit/Proxies-website)（原站 proxies.yacademy.dev 截至 2026 年 11 月域名无法解析）；[WTF Academy](https://www.wtf.academy/)；[Solidity by Example](https://solidity-by-example.org/)；[Foundry Book](https://book.getfoundry.sh/)；[Hardhat](https://hardhat.org/)；[Tenderly](https://tenderly.co/)；[viem](https://viem.sh/) |
| 常见漏洞 | [DASP](https://github.com/CryptoServices/dasp)（官网 dasp.co 截至 2026 年 11 月返回 401）；[SWC](https://swcregistry.io/)；[SCSFG](https://scsfg.io/hackers/)；[Kaden](https://github.com/kadenzipfel/smart-contract-vulnerabilities)；[Quillhash](https://github.com/Quillhash/Solidity-Attack-Vectors)；[RareSkills](https://www.rareskills.io/post/smart-contract-security) |
| 最佳实践 | [Secureum 训练资料](https://secureum.xyz)；[Solidity Patterns](https://fravoll.github.io/solidity-patterns/)；[Solcurity](https://github.com/transmissions11/solcurity)；[ConsenSys](https://github.com/ConsenSys/smart-contract-best-practices)；[Secureum](https://secureum.substack.com/)；[SCSVS](https://github.com/securing/SCSVS)；[EthTrust](https://entethalliance.org/specs/ethtrust-sl/) |
| CTF | [Ethernaut](https://ethernaut.openzeppelin.com/)；Capture the Ether（关卡地图见 [B10](B10-ctf-practice.md)）；[Damn Vulnerable DeFi](https://www.damnvulnerabledefi.xyz/)（关卡地图见 [B24](B24-defi-ctf.md)）；Paradigm CTF 往届题目（[2021](https://github.com/paradigmxyz/paradigm-ctf-2021)、[2022](https://github.com/paradigmxyz/paradigm-ctf-2022)、[2023](https://github.com/paradigmxyz/paradigm-ctf-2023)；原站 ctf.paradigm.xyz 截至 2026 年 11 月域名无法解析）；[Curta](https://www.curta.wtf/) |
| DeFi | [MakerDAO](https://docs.makerdao.com/)；[Aave](https://docs.aave.com/)；[Compound](https://docs.compound.finance/)；[Uniswap](https://docs.uniswap.org/)；[Curve](https://docs.curve.fi/)；[Chainlink](https://docs.chain.link/)；[Convex](https://docs.convexfinance.com/)；[Yearn](https://docs.yearn.fi/)；[GMX](https://docs.gmx.io/)；[Nexus Mutual](https://docs.nexusmutual.io/)；[Seaport](https://github.com/ProjectOpenSea/seaport)；[Lido](https://docs.lido.fi/) |
| 事件与报告 | [SlowMist Hacked](https://hacked.slowmist.io/)；[DeFiHackLabs](https://github.com/SunWeb3Sec/DeFiHackLabs)；[Rekt](https://rekt.news/)；[Solodit](https://solodit.cyfrin.io/)；[Code4rena Reports](https://code4rena.com/reports)（平台已宣布关停，截至 2026 年 11 月页面仍可访问）；[Audit List](https://github.com/0xNazgul/Blockchain-Security-Audit-List) |
| EVM 与 Gas | [evm.codes](https://www.evm.codes/)；[Noxx](https://noxx.substack.com/)；[黄皮书](https://ethereum.github.io/yellowpaper/paper.pdf)；[RareSkills Gas](https://www.rareskills.io/post/gas-optimization) |
| 经济模型 | [DeFi Risk Modelling](https://github.com/engn33r/DeFi-Risk-Modelling-Awesome)；[治理风险论文](https://arxiv.org/abs/2308.04267) |
| 赏金与竞赛 | [Immunefi](https://immunefi.com)；[Code4rena](https://code4rena.com)（2026 年 5 月宣布关停）；[Sherlock](https://www.sherlock.xyz/)；[HackenProof](https://hackenproof.com)；[Hats Finance](https://hats.finance/)（2025 年底已关闭中心化前端与服务器） |
| 原始路线图 | [SlowMist Learning Roadmap](https://github.com/slowmist/SlowMist-Learning-Roadmap-for-Becoming-a-Smart-Contract-Auditor) |

## 按阶段的免费课程与练习

下面的链接都在 2026-11-10 打开核对过。课程内容会变化，以官网为准。阶段编号见 [B00 第 2 节](B00-roadmap.md)。

| 资源 | 用途 | 对应阶段 |
|---|---|---|
| [Cyfrin Updraft：Blockchain Basics](https://updraft.cyfrin.io/courses/blockchain-basics) | 区块链入门视频课 | 0 |
| [Cyfrin Updraft：Solidity](https://updraft.cyfrin.io/courses/solidity) 与 [Foundry](https://updraft.cyfrin.io/courses/foundry) | Solidity 和测试框架 | 0–1 |
| [Cyfrin Updraft：Smart Contract Security](https://updraft.cyfrin.io/courses/security) | 系统的审计课程 | 2–4 |
| [Cyfrin Updraft：Assembly and Formal Verification](https://updraft.cyfrin.io/courses/formal-verification) | 汇编和形式化验证 | 6 |
| [CodeHawks First Flights](https://codehawks.cyfrin.io/first-flights) | 面向新手的练习赛，无奖金，有积分 | 2–4 |
| [Solodit](https://solodit.cyfrin.io) | 公开审计发现的搜索库 | 2 起每天用 |
| [Ethernaut](https://ethernaut.openzeppelin.com) | 逐关的合约安全游戏 | 1–2 |
| [Damn Vulnerable DeFi](https://www.damnvulnerabledefi.xyz) | DeFi 攻防练习 | 3 |
| [Secureum](https://secureum.xyz) | 安全知识与训练资料 | 2–4 |
| [evm.codes](https://www.evm.codes) | 操作码参考和在线演练 | 6 |
| [Foundry 文档](https://www.getfoundry.sh) | 工具手册 | 全程 |
