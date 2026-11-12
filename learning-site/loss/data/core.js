/* 开始 + 第 0 部分 总论 */
H.soon=[["Drift Protocol 2026","$2.8 亿"],["KelpDAO rsETH 2026","$2.9 亿"],["Liquid Network 2026","$3.2 亿"],["Beanstalk 2022","$1.8 亿"],["Harmony Horizon 2022","$1 亿"],["Wintermute 2022","$1.6 亿"],["BadgerDAO 2021","$1.2 亿"],["Cream Finance 2021","$1.3 亿"],["Mixin 2023","$2 亿"],["CoinsPaid 2023","$37M"],["Multichain 2023","$1.3 亿"],["Curve / Vyper 2023","$70M"],["Radiant 2024","$50M"],["Cetus 2025","$2.2 亿"],["Balancer v2 2025","$1.3 亿"],["SwissBorg / Kiln 2025","$42M"],["WOO X 2025","$14M"],["BitoPro 2025","$12M"],["Coinbase 外包客服 2025","成本 $1.8–4 亿"],["Bitfinex 2016","$72M"]];

(function(){
const D=H.docs;
const evOf=()=>H.events.map(e=>({id:e[0],date:e[1],name:e[2],type:e[3],chain:e[4],loss:e[5],tech:e[6],layers:e[7],mech:e[8],attr:e[9],ev:e[10],ch:e[11]}));
H.evOf=evOf;

/* ---------- home ---------- */
D.push({id:"home",code:"00",group:"start",ord:1,title:"首页与阅读方法",wide:false,render:()=>{
  const {money,esc}=H.util;const E=evOf();const big=E.filter(e=>e.loss>=10);
  const sum=E.reduce((a,e)=>a+(e.loss||0),0);
  const cases=H.docs.filter(d=>d.group==="p1"&&!d.soon);
  return `<div class="eyebrow"><span>HANDBOOK · 2016–2026</span><span>检索截止 2026-11-07</span><span>CEX · DeFi · 跨链桥 · 钱包 · 基础设施</span></div>
  <h1>Web3 行业安全资损 101</h1>
  <p class="thesis">十年里，最大的损失几乎都不来自“代码被破解”。它们来自<em>一个人、一台电脑、一段界面或一把钥匙</em>，被串成了一条通往签名权的路径。本手册把这些路径拆开，一步一步看它在哪里本可以被切断。</p>
  <div class="figs"><div class="fig red"><span class="n">${E.length}</span><span class="l">收录事件（CEX ${E.filter(e=>e.id.startsWith("EX")).length} + 非 CEX ${E.filter(e=>e.id.startsWith("W")).length}）</span></div>
  <div class="fig red"><span class="n">${money(sum)}</span><span class="l">已披露损失合计（事发时估值，口径见 O03）</span></div>
  <div class="fig"><span class="n">${big.length}</span><span class="l">资损 ≥ 1,000 万美元的事件</span></div>
  <div class="fig"><span class="n">${cases.length}</span><span class="l">独立案件章${H.soon.length?`（另有 ${H.soon.length} 章待发布）`:""}</span></div>
  <div class="fig"><span class="n">10</span><span class="l">手法归纳章 + 9 个实验室</span></div></div>

  <h2>1. 怎样判定“单独成章”</h2>
  <div class="tbl-wrap"><table><thead><tr><th>规则</th><th>判定方法</th><th>结果</th></tr></thead><tbody>
  <tr><td>资损 &gt; 1,000 万美元（$10M）</td><td>按事发时估值。冻结、追回、赔付分开列，不从损失中相减。</td><td rowspan="2">满足任一条，<b>且攻击链有公开细节</b> → 独立案件章（第 1 部分）</td></tr>
  <tr><td>攻击路径 &gt; 3 层</td><td>数攻击者从入口到资金离开跨过的<b>信任域</b>个数。“攻击者”与“洗钱”两端不计。定义见 <a href="#o01">O01</a>。</td></tr>
  <tr><td colspan="2">大额但根因未公开</td><td>归入 <a href="#g01">G01 根因未公开的大额热钱包失守</a>，用可排序表格展示</td></tr>
  <tr><td colspan="2">手法雷同、链路简单</td><td>按手法归入 G02–G10（第 2 部分）</td></tr></tbody></table></div>

  <h2>2. 手册结构</h2>
  <div class="mmd-wrap" data-title="手册结构"><pre class="mmd">flowchart LR
  subgraph P0["第 0 部分 · 总论"]
    O0["O00 序章与资损口径"] --> O1["O01 攻击链通用模型"] --> O2["O02 十年数据画像"] --> O3["O03 证据与归因"]
  end
  subgraph P1["第 1 部分 · 独立案件"]
    C["${cases.length} 章<br/>统一模板：档案卡 · 攻击路径 · 时间线 · 手法 · 阻塞点模拟 · 根因 · 改进"]
  end
  subgraph P2["第 2 部分 · 手法归纳"]
    G["G01–G10<br/>共同链路 · 事件表 · 共同阻塞点"]
  end
  subgraph P3["第 3 部分 · 防御与附录"]
    X["D01 防御矩阵 · D02 洗钱与追回 · D03 事件库 · D04 术语表"]
  end
  L["实验室 L1–L9"]
  P0 --> P1 --> P2 --> P3
  P1 -.->|"动手验证"| L
  P2 -.-> L</pre></div>
  <div class="readpts"><b>读图要点</b><ul><li>第 0 部分给出全书共用的模型和口径。先读 O01，再读任何案件章。</li><li>每个独立案件章的“阻塞点模拟器”都直接嵌在章内。实验室收录跨案件的通用实验。</li><li>局限：案件章只收录攻击链有公开细节的事件。其余事件见事件库。</li></ul></div>

  <h2>3. 独立案件章</h2>
  <div class="tbl-wrap"><table data-sort><thead><tr><th class="sortable">编号</th><th class="sortable">日期</th><th>案件</th><th class="sortable">类型</th><th class="sortable">资损</th><th class="sortable">层数</th></tr></thead><tbody>
  ${H.cases.map(c=>`<tr><td class="mono">${c.code}</td><td class="mono">${c.date}</td><td><a href="#${c.id}">${esc(c.name)}</a> <span class="note">${esc(c.sub)}</span></td><td>${esc(c.type)}</td><td class="num" data-v="${c.loss}">${money(c.loss)}</td><td class="num">${c.layers}</td></tr>`).join("")}
  </tbody></table></div>

  <h2>4. 四条阅读路线</h2>
  <div class="tbl-wrap"><table><thead><tr><th>你的角色</th><th>推荐路线</th><th>重点</th></tr></thead><tbody>
  <tr><td>交易所安全 / 钱包团队</td><td>O01 → Bybit → Binance → Bitget → DMM → G01 → G02 → G03 → D01</td><td>签名链、供应商通道、熔断开关</td></tr>
  <tr><td>合约开发与审计</td><td>O01 → Poly → Wormhole → Nomad → Euler → G06 → G07 → L1</td><td>不变量、账户校验、升级流程</td></tr>
  <tr><td>风控 / 产品 / 运营</td><td>O00 → O02 → Mango → Ronin → G04 → G07 → D02</td><td>经济模型、口径、追回</td></tr>
  <tr><td>只有一小时</td><td>本页 → O01 → Bybit → D01</td><td>一个模型 + 一个案件 + 一张防御表</td></tr></tbody></table></div>

  <h2>5. 写作与证据规则</h2>
  <p>本手册 80% 的文字遵循 ASD-STE100 简化技术语言：一句一事，主动语态，一个词只表示一个意思。20% 用比喻和案例。每条结论带证据标签。规则全文见 <a href="#guide">写作规范</a>。</p>
  <blockquote class="warn"><p>⚠️ 警告：本手册用于安全学习与防御建设。事件细节以原始来源和后续更新为准。2026 年事件的部分时间点和金额只有二手汇总，章内已逐条标注。</p></blockquote>`;}});

/* ---------- guide ---------- */
D.push({id:"guide",code:"··",group:"start",ord:2,title:"写作规范与章节模板",html:`<div class="eyebrow"><span>METHOD</span></div><h1>写作规范与章节模板</h1>
<p class="lede">本规范约束全部章节。目标：读者一次读懂，不需要回读。</p>
<h2>1. ASD-STE100（80% 遵循）</h2>
<div class="tbl-wrap"><table><thead><tr><th>编号</th><th>规则</th><th>正例</th><th>反例</th></tr></thead><tbody>
<tr><td>R1</td><td>一句话只表达一个动作或事实</td><td>攻击者取得会话令牌。令牌绕过了 MFA。</td><td>攻击者取得了可以绕过 MFA 的会话令牌并用它登录了云平台然后修改了前端。</td></tr>
<tr><td>R2</td><td>操作句 ≤ 20 字，描述句 ≤ 30 字</td><td>签名者用硬件钱包签名。</td><td>—</td></tr>
<tr><td>R3</td><td>主动语态，主语明确</td><td>Tether 冻结 3,300 万 USDT。</td><td>资金被冻结了一部分。</td></tr>
<tr><td>R4</td><td>一个术语只用一个词</td><td>全书用“签名者”，不混用“签署人 / 签字方”</td><td>—</td></tr>
<tr><td>R5</td><td>首次出现的术语给英文和一句定义</td><td>盲签（Blind Signing）：签名者无法看到交易真实内容就签名。</td><td>—</td></tr>
<tr><td>R6</td><td>不用模糊词：大概、一些、相关</td><td>约 1.46 亿美元（口径见来源）</td><td>损失很大</td></tr>
<tr><td>R7</td><td>条件在前，结果在后</td><td>如果签名端不核对 calldata，界面篡改就能成功。</td><td>—</td></tr>
<tr><td>R8</td><td>数字带单位与时点</td><td>约 4,502.9 BTC（事发时约 3.05 亿美元）</td><td>—</td></tr></tbody></table></div>
<h2>2. 生动部分（约 20%）</h2>
<ul><li><b>比喻</b>：每个案件章 1 个，格式为“🎯 打个比方”。比喻写出局限。</li><li><b>误读澄清</b>：每章列出 2–4 个常见误读，并给出准确说法。</li><li><b>可操作的图</b>：攻击路径可以步进；阻塞点模拟器可以勾选。</li></ul>
<h2>3. 独立案件章模板</h2>
<div class="tbl-wrap"><table><thead><tr><th>节</th><th>内容</th><th>形式</th></tr></thead><tbody>
<tr><td>档案卡</td><td>日期、类型、链、归因、证据等级、关键数字、成章理由</td><td>数字条 + 标签</td></tr>
<tr><td>01 攻击路径</td><td>每一步：信任域、发生了什么、手法、阻塞点、证据</td><td>可步进 SVG，列 = 信任域</td></tr>
<tr><td>02 时间线</td><td>发生、发现、披露、处置、追回</td><td>纵向时间轴</td></tr>
<tr><td>03 手法拆解</td><td>步骤 × 信任域 × 手法 × ATT&amp;CK</td><td>表格</td></tr>
<tr><td>04 阻塞点模拟器</td><td>勾选控制，看断链位置与剩余暴露</td><td>交互</td></tr>
<tr><td>05 机制图</td><td>关键机制的调用链或因果环</td><td>Mermaid + 读图要点 + 比喻</td></tr>
<tr><td>06 根因与误读</td><td>哪段信任缺少独立约束</td><td>卡片</td></tr>
<tr><td>07 改进方向</td><td>P0/P1/P2、切断哪一步、怎样验证</td><td>表格 + 检测信号</td></tr>
<tr><td>08 未知项与来源</td><td>公开资料不能回答的问题；局限；来源</td><td>卡片 + 列表</td></tr></tbody></table></div>
<h2>4. 手法归纳章模板</h2>
<p>共同链路图 → 为什么归为一类 → 事件表（来自事件库，可排序）→ 典型案例速写 → 共同阻塞点 → 动手验证。</p>`});

/* ---------- O00 ---------- */
D.push({id:"o00",code:"O00",group:"p0",ord:1,title:"序章与资损口径",render:()=>`<div class="eyebrow"><span>O00 · PROLOGUE</span></div><h1>序章：两次事故定下的十年基调</h1>
<p class="thesis">2014 年的 Mt.Gox 说明：<em>托管方的钥匙就是用户的钱</em>。2016 年的 The DAO 说明：<em>合约的一个顺序错误也是钱</em>。之后十年的事故，基本沿着这两条线展开。</p>
<h2>1. 两个起点</h2>
<div class="cards"><div class="card"><span class="pair">2014-02 · CEX · BTC</span><b>Mt.Gox：长期失窃，长期未发现</b><p>Mt.Gox 申请破产，称丢失约 85 万 BTC（约 75 万属于用户）。调查显示，<mark class="hl">热钱包私钥在 2011 年前后已被窃取，资金被持续转出数年</mark>。教训：没有链上对账，就没有“发现”。</p></div>
<div class="card"><span class="pair">2016-06 · DeFi · ETH</span><b>The DAO：先转账，后记账</b><p>splitDAO 在更新余额前先发送 ETH。攻击者在收款回调中再次调用 splitDAO，取走约 360 万 ETH。以太坊硬分叉回滚了资金，不同意的链成为 ETC。教训：合约的执行顺序就是安全边界。</p></div></div>
<h2>2. 资损口径：六个数不能互相加减</h2>
<p>同一起事件，媒体会给出多个金额。它们回答不同的问题。</p>
<div class="tbl-wrap"><table><thead><tr><th>口径</th><th>含义</th><th>Binance 热钱包事件 示例</th></tr></thead><tbody>
<tr><td><b>涉及金额</b></td><td>被未授权转出的资产，按事发时价格估值</td><td>约 63.4 亿美元（另有 63 / 64 / 64.3 亿口径）</td></tr>
<tr><td><b>冻结 / 拦截</b></td><td>被发行方、交易所或链冻结，攻击者暂时不能动用</td><td>约 28.5 亿美元</td></tr>
<tr><td><b>追回</b></td><td>已回到受害方控制</td><td>截至 11-07 未公布</td></tr>
<tr><td><b>补足</b></td><td>受害方用自有资金或借款填补用户资产</td><td>约 98%（11-04/05）</td></tr>
<tr><td><b>赔付成本</b></td><td>赔付、应对、法律等费用</td><td>未公布</td></tr>
<tr><td><b>净损失</b></td><td>只有在追查结束后才能确定</td><td>未知</td></tr></tbody></table></div>
<blockquote class="warn"><p>⚠️ 警告：“63.4 − 28.5 = 34.9 亿美元净损失”是错误算法。冻结金额会变化，冻结也不等于追回。</p></blockquote>
<h2>3. 本手册的选值规则</h2>
<ol><li>损失默认取事发时估值。没有估值时，保留原始币量。</li><li>同一事件有多个口径时，取受害方或执法方的最新口径，并在章内列出冲突。</li><li>“1,000 万美元”门槛按上述选值判定。</li><li>赔付成本（例如 Coinbase 2025 外包客服事件）不计入“被盗金额”，单独标注。</li><li>日期区分<b>发生</b>、<b>发现</b>、<b>披露</b>。表格中的“日期”默认指发生日。</li></ol>`});

/* ---------- O01 ---------- */
D.push({id:"o01",code:"O01",group:"p0",ord:2,title:"攻击链通用模型",render:()=>{
  const {esc,money,DOMAINS}=H.util;
  const defs={"社工/人":"员工、开发者、签名者本人。入口通常是假招聘、假贡献者、钓鱼邮件。","终端":"员工电脑、开发机、签名设备的操作系统。","身份/会话":"SSO 会话、Cookie、云令牌、API Key、部署令牌。","云/内部平台":"内网、云账号、容器平台、AI 工具、运维与安全管理面。","供应商":"钱包软件商、托管商、质押服务商、安全产品等第三方。","前端/界面":"用户或签名者看到的网页、App、签名界面。","签名/密钥":"私钥、MPC、多签、验证者、签名服务。","治理":"DAO 投票、管理员权限、时间锁。","合约":"链上程序的逻辑、参数、升级。","预言机/市场":"价格来源、流动性、交易所现货。","跨链":"桥、中继、跨链消息与证明。","链上":"区块链对有效签名或有效交易的执行。"};
  return `<div class="eyebrow"><span>O01 · MODEL</span></div><h1>攻击链通用模型：信任域与层数</h1>
  <p class="thesis">每一起事故都是攻击者在<em>一串信任关系</em>上移动。每跨过一个信任域，攻击者都利用了“上游已经验证过”的假设。层数越多，可以切断的位置越多。</p>
  <h2>1. 六个阶段</h2>
  <div class="mmd-wrap" data-title="攻击链六阶段"><pre class="mmd">flowchart LR
  A["入口<br/>假招聘 · 钓鱼 · 0day · 代码缺陷"] --> B["立足<br/>终端控制 · 持久化"]
  B --> C["横移<br/>会话 · 令牌 · 内网 · 供应商"]
  C --> D["取得签名能力<br/>私钥 · 签名服务 · 界面欺骗 · 合约逻辑"]
  D --> E["链上执行<br/>转账 · 升级 · 委托 · 铸造"]
  E --> F["变现<br/>跨链 · 混币 · 场外"]
  A -.->|"合约类事件<br/>直接跳到"| D</pre></div>
  <div class="readpts"><b>读图要点</b><ul><li>CEX 与钱包类事件通常走完全部六个阶段，耗时数周到数月。</li><li>合约类事件（Poly、Wormhole、Nomad、Euler）从“入口”直接跳到“取得签名能力”：代码缺陷本身就让攻击者获得了放款权。</li><li>“链上执行”通常只需几秒到几小时。<mark class="hl">慢阶段靠检测，快阶段靠预先设定的熔断。</mark></li></ul></div>
  <h2>2. 信任域定义</h2>
  <div class="tbl-wrap"><table><thead><tr><th>信任域</th><th>包含什么</th></tr></thead><tbody>${DOMAINS.filter(d=>defs[d]).map(d=>`<tr><td><b>${d}</b></td><td>${defs[d]}</td></tr>`).join("")}</tbody></table></div>
  <h2>3. 层数的数法</h2>
  <ol><li>列出攻击链的每一步，给每一步标一个信任域。</li><li>去掉“攻击者”和“洗钱”两端。</li><li>剩下的<b>不同</b>信任域个数就是层数。同一信任域出现多次只计一次。</li></ol>
  <blockquote class="analogy"><p>🎯 打个比方：层数像小偷进银行金库要过的门：大门、员工通道、电梯卡、金库门。过的门越多，小偷准备越久，银行发现的机会也越多。比喻的局限：链上执行这扇“门”一旦打开，几秒内就结束，没有“发现”的时间。</p></blockquote>
  <h2>4. 全部独立案件的层数</h2>
  <div class="tbl-wrap"><table data-sort><thead><tr><th>案件</th><th class="sortable">层数</th><th class="sortable">资损</th><th>经过的信任域</th></tr></thead><tbody>
  ${H.cases.slice().sort((a,b)=>b.layers-a.layers).map(c=>`<tr><td><a href="#${c.id}">${esc(c.name)}</a></td><td class="num">${c.layers}</td><td class="num" data-v="${c.loss}">${money(c.loss)}</td><td style="font-size:12.5px">${DOMAINS.filter(d=>d!=="攻击者"&&d!=="洗钱"&&c.steps.some(s=>s.d===d)).join(" → ")}</td></tr>`).join("")}</tbody></table></div>
  <h2>5. 三种原型</h2>
  ${(()=>{const AR={"c-coincheck":"A","c-ronin":"A","c-dmm":"A","c-wazirx":"A","c-bybit":"A","c-bitget":"A","c-binance":"A","c-poly":"B","c-wormhole":"B","c-nomad":"B","c-euler":"B","c-mango":"C"};const arch=c=>c.arch||AR[c.id]||"A";const T={A:["原型 A · 攻破人与签名链","入口是人。路径长（4–8 层）。最终拿到的是“让合法签名系统签错东西”的能力。"],B:["原型 B · 攻破代码","入口是合约或节点代码缺陷。路径短（2–4 层）。没有人被骗。防线在开发、审计和升级流程。"],C:["原型 C · 攻破经济模型","每一步都按设计运行。攻击者利用的是参数和激励：浅市场、浮盈抵押、可捐赠的价格、可借来的投票权。"]};
  return `<div class="cards">${["A","B","C"].map(k=>{const cs=H.cases.filter(c=>arch(c)===k);const sum=cs.reduce((a,c)=>a+c.loss,0);return `<div class="card"><span class="pair">${T[k][0]} · ${cs.length} 起 · ${money(sum)}</span><b>${cs.map(c=>`<a href="#${c.id}">${esc(c.name)}</a>`).join("、")}</b><p>${T[k][1]}</p></div>`;}).join("")}</div>`;})()}
  <p class="note">观察：原型 A 的合计损失占绝大部分。原型 B 的单起损失也可达数亿美元，但层数少，阻断点集中在开发流程。</p>`;}});

/* ---------- O02 ---------- */
D.push({id:"o02",code:"O02",group:"p0",ord:3,title:"十年数据画像",render:()=>`<div class="eyebrow"><span>O02 · DATA</span></div><h1>十年数据画像</h1>
<p class="thesis">按年份、手法、业务类型和团伙看全部事件。下面的图全部由 <a href="#d03">D03 事件库</a> 实时计算，切换口径后会重新绘制。</p>
<div class="filters"><span class="note">口径：</span><div class="seg" id="o2m" role="group"><button type="button" data-m="sum" aria-pressed="true">损失合计</button><button type="button" data-m="cnt" aria-pressed="false">事件数</button></div>
<span class="note">范围：</span><div class="seg" id="o2s" role="group"><button type="button" data-s="all" aria-pressed="true">全部</button><button type="button" data-s="EX" aria-pressed="false">CEX 与关联服务</button><button type="button" data-s="W" aria-pressed="false">非 CEX</button></div>
<label class="note"><input type="checkbox" id="o2x"> 排除 Binance 热钱包事件（单起 63 亿，会压扁其他年份）</label></div>
<h2>1. 按年份</h2><div class="panel pad"><div class="bars" id="o2y"></div></div>
<h2>2. 按手法</h2><div class="panel pad"><div class="bars" id="o2t"></div></div>
<p class="note">“根因未公开”的事件数最多。这说明行业披露不足，不说明这类手法最常见。</p>
<h2>3. 按业务类型</h2><div class="panel pad"><div class="bars" id="o2b"></div></div>
<h2>4. 归因到朝鲜相关团伙的份额</h2><div class="panel pad" id="o2k"></div>
<h2>5. 损失前 15</h2><div class="tbl-wrap"><table><thead><tr><th>#</th><th>日期</th><th>事件</th><th>手法</th><th>损失</th></tr></thead><tbody id="o2top"></tbody></table></div>
<p class="caveat">局限：① 样本是公开事件，不是全部事件。② 2026 年事件的金额多为二手汇总。③ 同一事件不同来源的金额可相差 10–30%。</p>`,
after:root=>{const {money,esc}=H.util;let m="sum",sc="all";
  const draw=()=>{let E=evOf();if(sc!=="all")E=E.filter(e=>e.id.startsWith(sc));if(root.querySelector("#o2x").checked)E=E.filter(e=>e.id!=="EX095");
    const agg=(key)=>{const o={};E.forEach(e=>{const k=key(e);o[k]=o[k]||{s:0,c:0};o[k].s+=e.loss||0;o[k].c++;});return o;};
    const bars=(o,el,sort,cls)=>{const ks=Object.keys(o);if(sort)ks.sort((a,b)=>(m==="sum"?o[b].s-o[a].s:o[b].c-o[a].c));else ks.sort();const mx=Math.max(...ks.map(k=>m==="sum"?o[k].s:o[k].c),1);
      root.querySelector(el).innerHTML=ks.map(k=>{const v=m==="sum"?o[k].s:o[k].c;return `<div class="barrow"><span>${esc(k)}</span><div class="trk"><div class="${cls||""}" style="width:${v/mx*100}%"></div></div><span class="v">${m==="sum"?money(v):v+" 起"}</span></div>`;}).join("");};
    bars(agg(e=>e.date.slice(0,4)),"#o2y",false);
    bars(agg(e=>H.TECH[e.tech]),"#o2t",true,"b");
    bars(agg(e=>e.id.startsWith("EX")?(e.type==="CEX"?"CEX":"关联服务"):e.type),"#o2b",true,"b");
    const k=E.filter(e=>/朝鲜|Lazarus|TraderTraitor|UNC4736|UNC4899|DPRK/.test(e.attr));const kl=k.reduce((a,e)=>a+(e.loss||0),0),tl=E.reduce((a,e)=>a+(e.loss||0),0);
    const ke=k.filter(e=>/执法|FBI|美日韩/.test(e.attr));
    root.querySelector("#o2k").innerHTML=`<div class="figs" style="margin:0"><div class="fig red"><span class="n">${(kl/tl*100).toFixed(0)}%</span><span class="l">损失份额（含研究判断）</span></div><div class="fig"><span class="n">${k.length}</span><span class="l">事件数（含研究判断）</span></div><div class="fig"><span class="n">${ke.length} 起 / ${money(ke.reduce((a,e)=>a+(e.loss||0),0))}</span><span class="l">其中执法确认</span></div></div><p class="note" style="margin-top:10px">归因等级不同，不能把研究判断当作执法结论。见 <a href="#o03">O03</a>。</p>`;
    root.querySelector("#o2top").innerHTML=E.filter(e=>e.loss).sort((a,b)=>b.loss-a.loss).slice(0,15).map((e,i)=>`<tr><td class="mono">${i+1}</td><td class="mono">${e.date}</td><td>${e.ch?`<a href="#${e.ch}">${esc(e.name)}</a>`:esc(e.name)}</td><td>${H.TECH[e.tech]}</td><td class="num">${money(e.loss)}</td></tr>`).join("");};
  root.querySelectorAll("#o2m button").forEach(b=>b.onclick=()=>{m=b.dataset.m;root.querySelectorAll("#o2m button").forEach(x=>x.setAttribute("aria-pressed",x===b));draw();});
  root.querySelectorAll("#o2s button").forEach(b=>b.onclick=()=>{sc=b.dataset.s;root.querySelectorAll("#o2s button").forEach(x=>x.setAttribute("aria-pressed",x===b));draw();});
  root.querySelector("#o2x").onchange=draw;draw();}});

/* ---------- O03 ---------- */
D.push({id:"o03",code:"O03",group:"p0",ord:4,title:"证据与归因的读法",render:()=>{const {TAG,EV}=H.util;return `<div class="eyebrow"><span>O03 · EVIDENCE</span></div><h1>证据与归因的读法</h1>
<p class="thesis">安全事件的公开信息有三个问题：<em>来源不同、时点不同、立场不同</em>。本手册用两套标签把它们分开。</p>
<h2>1. 来源标签（事件级）</h2>
<div class="tbl-wrap"><table><thead><tr><th>标签</th><th>含义</th><th>注意</th></tr></thead><tbody>
<tr><td>${EV.P}</td><td>平台、供应商、监管、司法等原始披露</td><td>原始披露不等于独立验证。受害方可能低估责任。</td></tr>
<tr><td>${EV.I}</td><td>调查机构研究（Chainalysis、TRM、Elliptic、Mandiant、SlowMist 等）</td><td>机构之间口径不同，金额可相差 10–30%。</td></tr>
<tr><td>${EV.M}</td><td>媒体或二手转引</td><td>分钟级时间点常只出现在二手复盘中。</td></tr>
<tr><td>${EV.C}</td><td>仅索引线索</td><td>需要回到原始材料核实。</td></tr></tbody></table></div>
<p>组合标签（例如 P+I）表示不同字段来自不同证据。</p>
<h2>2. 结论标签（步骤级）</h2>
<div class="tbl-wrap"><table><tbody><tr><td>${TAG.fact}</td><td>原始披露明确说明</td></tr><tr><td>${TAG.infer}</td><td>由结果和时间顺序推出</td></tr><tr><td>${TAG.hyp}</td><td>技术上可行，没有直接证据</td></tr><tr><td>${TAG.unk}</td><td>公开资料不足。不要用常见手法补齐。</td></tr></tbody></table></div>
<h2>3. 归因的五个等级</h2>
<div class="mmd-wrap" data-title="归因等级"><pre class="mmd">flowchart LR
  A["执法确认<br/>FBI · DC3 · NPA · 多国联合声明"] --> B["研究判断<br/>Chainalysis · TRM · Elliptic · Mandiant"]
  B --> C["受害方判断<br/>平台公告"]
  C --> D["团伙自称<br/>Predatory Sparrow"]
  D --> E["未知"]</pre></div>
<div class="readpts"><b>读图要点</b><ul><li>从左到右，证据强度递减。</li><li>例：Bybit、DMM、Binance 为执法确认。Bitget 为研究判断：Chainalysis 与 Elliptic 指向朝鲜，TRM 称“尚未确定”，Mandiant 不归因。</li><li>“攻击者向 Ronin 地址转了一笔 ETH”（Euler）不是归因证据。</li></ul></div>
<h2>4. 五个口径陷阱</h2>
<div class="cards"><div class="card myth"><s>“币量 = 美元”</s><p>Coins.ph 是 1,220 万 XRP，不是 1,220 万美元。</p></div><div class="card myth"><s>“冻结 = 追回”</s><p>冻结资产仍可能被解冻或长期悬置。</p></div><div class="card myth"><s>“补足 = 没有损失”</s><p>补足把损失从用户转到公司。</p></div><div class="card myth"><s>“初报金额 = 最终金额”</s><p>Bitget 从 3.516 亿修订到 3.875 亿，来自补充核算，不是持续失窃。</p></div><div class="card myth"><s>“发现日 = 发生日”</s><p>Ronin 被盗 6 天后才被发现；Mt.Gox 失窃持续数年。</p></div></div>`;}});
})();
