/* 实验室 L1–L9 */
(function(){
const L=[];const add=o=>{o.group="lab";L.push(o);};
const U=()=>H.util;
const head=(o,extra)=>`<div class="eyebrow"><span>${o.code} · 实验室</span><span>${o.tagline}</span></div><h1>${o.title}</h1><p class="lede">${o.desc}</p>${extra||""}`;

/* L1 */
add({id:"l1",code:"L1",title:"阻塞点模拟器",tagline:"全部案件",desc:"选择一个案件，勾选防御控制，看攻击链在哪一步断开、剩余暴露多少。",
 render(){return head(this,`<div class="filters"><label class="note" for="l1c">案件：</label><select id="l1c">${H.cases.map(c=>`<option value="${c.id}">${c.code} ${U().esc(c.name)}（${U().money(c.loss)}）</option>`).join("")}</select></div><div id="l1box"></div>
 <h2>怎样读结果</h2><ul><li>阻断点在“资金离开”之前，损失为 0。</li><li>阻断点在资金离开之后，只影响洗钱与追回。</li><li>纵深 = 勾选的独立控制数。攻击者被一道控制挡住后会换路，纵深越大，换路成本越高。</li></ul>`);},
 after(root){let stop=null;const sel=root.querySelector("#l1c");const go=()=>{if(stop)stop();stop=H.blockSim(root.querySelector("#l1box"),H.cases.find(c=>c.id===sel.value));};sel.onchange=go;go();return ()=>stop&&stop();}});

/* L2 blind signing */
const SC={
 bybit:{n:"Bybit 2025 · Safe 冷钱包",see:"to: Bybit 温钱包 0x1Db9…\nvalue: 401,347 ETH\noperation: CALL（普通转账）",real:'to: 0x9622…（攻击者合约）\nvalue: 0\ndata: transfer(…) → <span class="bad">实际为 sweepETH / masterCopy 改写</span>\noperation: <span class="bad">1 = DELEGATECALL</span>',hash:"0xa9e1…f3c2（与界面期望值不同）"},
 wazirx:{n:"WazirX 2024 · Liminal 4/6 多签",see:"类型：转账\n收款：WazirX 温钱包\n金额：常规补充额度",real:'to: Safe 代理钱包本身\ndata: <span class="bad">changeMasterCopy(0x…攻击者合约)</span>\noperation: CALL',hash:"0x5c07…（界面未显示）"},
 kiln:{n:"SwissBorg / Kiln 2025 · Solana 质押",see:"指令：Deactivate stake（解除质押）\n数量：8,000 SOL",real:'指令 1：Deactivate stake\n<span class="bad">指令 2–9：Authorize（把提款权限改给攻击者）</span>',hash:"交易签名前未逐条展示指令"}};
const MT=[
 {k:"ui",t:"只看网页界面",d:"相信 dApp 显示的内容。",det:{bybit:0,wazirx:0,kiln:0},why:"界面本身就是被篡改的环节。"},
 {k:"blind",t:"硬件钱包（只显示哈希）",d:"设备上只看到一串哈希。",det:{bybit:0,wazirx:0,kiln:0},why:"签名者无法把哈希与意图对应起来。这就是盲签。"},
 {k:"clear",t:"硬件钱包清晰签名",d:"设备解析并显示 operation、目标与函数。",det:{bybit:1,wazirx:1,kiln:1},why:"设备显示 DELEGATECALL 或 changeMasterCopy / Authorize，与“转账”不符。前提：设备支持该合约的解析。"},
 {k:"second",t:"第二台设备独立解码",d:"用命令行工具重新计算 safeTxHash 并解码 calldata。",det:{bybit:1,wazirx:1,kiln:1},why:"独立设备不加载被篡改的前端，算出的哈希与待签哈希不一致。"},
 {k:"guard",t:"Safe Guard / 交易策略",d:"链上或签名服务前的规则：禁止 delegatecall、升级、改权限。",det:{bybit:1,wazirx:1,kiln:0},why:"Guard 在 EVM 上可拦截；Kiln 案在 Solana 上，需要签名服务侧策略检查 Authorize 指令。"},
 {k:"sim",t:"交易模拟",d:"签名前在分叉环境执行，查看资产与权限变化。",det:{bybit:1,wazirx:1,kiln:1},why:"模拟结果显示“钱包实现合约变化”或“提款权限变化”。"}];
add({id:"l2",code:"L2",title:"盲签实验：界面与数据不一致",tagline:"Bybit · WazirX · Kiln",desc:"选择一个真实场景和一种核验方式，看签名者能否在签名前发现篡改。",
 render(){return head(this,`<div class="lab"><div class="ctl"><div class="rng"><label for="l2s">场景</label><select id="l2s">${Object.entries(SC).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join("")}</select></div>
 <div class="ctrls">${MT.map((m,i)=>`<label class="chk"><input type="radio" name="l2m" value="${m.k}" ${i===1?"checked":""}><span>${m.t}<small>${m.d}</small></span><span></span></label>`).join("")}</div></div>
 <div class="out"><div class="two"><div><span class="note">签名者看到的</span><div class="txbox" id="l2see"></div></div><div><span class="note">实际待签数据</span><div class="txbox" id="l2real"></div></div></div><div class="verdict" id="l2v"></div><p class="note" id="l2h"></p></div></div>
 <h2>结论</h2><div class="tbl-wrap"><table><thead><tr><th>核验方式</th><th>Bybit</th><th>WazirX</th><th>Kiln</th></tr></thead><tbody>${MT.map(m=>`<tr><td>${m.t}</td>${["bybit","wazirx","kiln"].map(k=>`<td style="color:var(--${m.det[k]?"ok":"danger"})">${m.det[k]?"能发现":"不能"}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
 <p class="caveat">交易数据为示意，地址已截断。真实交易字段见各案件章来源。</p>`);},
 after(root){const q=s=>root.querySelector(s);const draw=()=>{const s=SC[q("#l2s").value];const m=MT.find(x=>x.k===root.querySelector('input[name="l2m"]:checked').value);
  q("#l2see").textContent=s.see;q("#l2real").innerHTML=s.real;const ok=m.det[q("#l2s").value];const v=q("#l2v");v.className="verdict "+(ok?"good":"bad");
  v.innerHTML=ok?`<b>能发现。</b>${m.why}`:`<b>不能发现。</b>${m.why} 签名有效，资产被转走。`;q("#l2h").textContent="哈希："+s.hash;
  root.querySelectorAll(".chk").forEach(c=>c.classList.toggle("active",c.querySelector("input").checked));};
  root.addEventListener("change",draw);draw();}});

/* L3 threshold */
const PRE={
 ronin:{n:"Ronin 2022：5/9",th:5,orgs:["Sky Mavis","Axie DAO","独立 B","独立 C","独立 D","独立 E"],keys:[0,0,0,0,1,2,3,4,5],dele:{4:0},note:"Axie DAO 的第 5 把钥匙可由 Sky Mavis 代签（白名单未撤销）。"},
 harmony:{n:"Harmony 2022：2/5",th:2,orgs:["Harmony 运维","签名者 B","签名者 C","签名者 D","签名者 E"],keys:[0,1,2,3,4],dele:{},note:"阈值只有 2。攻击者拿到 2 把私钥即可。"},
 wazirx:{n:"WazirX 2024：4/6",th:4,orgs:["WazirX","Liminal"],keys:[0,0,0,0,0,1],dele:{},note:"界面欺骗让全部签名者“自愿”签名，阈值失去意义。勾选两个组织模拟。"},
 kelp:{n:"KelpDAO 2026：1-of-1 DVN",th:1,orgs:["LayerZero DVN"],keys:[0],dele:{},note:"只有一个验证者。它的 RPC 被投毒，就等于全部验证者被投毒。"},
 ideal:{n:"理想：5/9，9 个独立组织",th:5,orgs:["O1","O2","O3","O4","O5","O6","O7","O8","O9"],keys:[0,1,2,3,4,5,6,7,8],dele:{},note:"每个组织 1 把钥匙。攻击者必须攻破 5 个独立组织。"}};
add({id:"l3",code:"L3",title:"多签与验证者阈值",tagline:"Ronin · Harmony · WazirX · KelpDAO",desc:"签名者个数不等于安全性。勾选被攻破的组织，看攻击者能否凑够阈值，以及“最少要攻破几个组织”。",
 render(){return head(this,`<div class="lab"><div class="ctl"><div class="rng"><label for="l3p">预设</label><select id="l3p">${Object.entries(PRE).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join("")}</select></div>
 <div class="rng"><label for="l3t">阈值 M：<b class="mono" id="l3tv"></b></label><input type="range" id="l3t" min="1" max="9" value="5"></div>
 <span class="note">被攻破的组织：</span><div class="orgs" id="l3o"></div><p class="note" id="l3n"></p></div>
 <div class="out"><div><span class="note">签名者（红 = 攻击者可用）</span><div class="keys" id="l3k" style="margin-top:6px"></div></div>
 <div class="verdict" id="l3v"></div><div class="figs" style="margin:0"><div class="fig"><span class="n" id="l3a"></span><span class="l">攻击者可用签名 / 阈值</span></div><div class="fig red"><span class="n" id="l3m"></span><span class="l">最少需攻破的组织数</span></div><div class="fig"><span class="n" id="l3s"></span><span class="l">签名者总数</span></div></div>
 <p class="caveat">“最少需攻破的组织数”按每个组织持有（含代签）的签名数从多到少累加，直到达到阈值。这是攻击者的最优选择。</p></div></div>`);},
 after(root){const q=s=>root.querySelector(s);let P,own=new Set();
  const load=()=>{P=JSON.parse(JSON.stringify(PRE[q("#l3p").value]));own=new Set();q("#l3t").max=P.keys.length;q("#l3t").value=P.th;
   q("#l3o").innerHTML=P.orgs.map((o,i)=>`<label class="chk" style="padding:4px 8px"><input type="checkbox" data-o="${i}"><span>${o}<small>${P.keys.filter(k=>k===i).length} 把</small></span><span></span></label>`).join("");q("#l3n").textContent=P.note;draw();};
  const draw=()=>{const th=+q("#l3t").value;q("#l3tv").textContent=th;
   const avail=P.keys.map((o,i)=>own.has(o)||(P.dele[i]!=null&&own.has(P.dele[i])));const n=avail.filter(Boolean).length;
   q("#l3k").innerHTML=P.keys.map((o,i)=>`<span class="key ${avail[i]?"own":""}" title="${P.orgs[o]}${P.dele[i]!=null?"（可由 "+P.orgs[P.dele[i]]+" 代签）":""}">${i+1}</span>`).join("");
   const per=P.orgs.map((_,oi)=>P.keys.filter((o,i)=>o===oi||P.dele[i]===oi).length).sort((a,b)=>b-a);let acc=0,k=0;for(const c of per){if(acc>=th)break;acc+=c;k++;}
   q("#l3a").textContent=`${n} / ${th}`;q("#l3m").textContent=acc>=th?k:"—";q("#l3s").textContent=P.keys.length;
   const v=q("#l3v");if(n>=th){v.className="verdict bad";v.innerHTML=`<b>达到阈值。</b>攻击者可以签出任意提款。`;}else{v.className="verdict good";v.innerHTML=`还差 <b>${th-n}</b> 个签名。`;}
   root.querySelectorAll("#l3o .chk").forEach(c=>c.classList.toggle("active",c.querySelector("input").checked));};
  q("#l3p").onchange=load;q("#l3t").oninput=draw;q("#l3o").onchange=e=>{const o=+e.target.dataset.o;e.target.checked?own.add(o):own.delete(o);draw();};load();}});

/* L4 hot wallet & breaker */
const P4={bitget:{n:"Bitget 2026（示意）",B:390,R:0,S:12,D:34,mode:"wd",K:5,M:160},binance:{n:"Binance 热钱包事件（示意）",B:6340,R:0,S:40,D:30,mode:"wd",K:5,M:230},coincheck:{n:"Coincheck 2018（示意）",B:530,R:0,S:2,D:560,mode:"sign",K:30,M:600},custom:{n:"自定义",B:200,R:2,S:10,D:10,mode:"sign",K:5,M:120}};
add({id:"l4",code:"L4",title:"热钱包余额与熔断速度",tagline:"Bitget · Binance · Coincheck",desc:"损失 = min(转出速度 × 持续时间, 余额 + 自动补充)。调节余额、告警时间和处置方式，看哪个变量最有效。",
 render(){const r=(id,l,min,max,st,u)=>`<div class="rng"><label for="${id}">${l}：<b class="mono" id="${id}v"></b> ${u}</label><input type="range" id="${id}" min="${min}" max="${max}" step="${st}"></div>`;
 return head(this,`<div class="lab"><div class="ctl"><div class="rng"><label for="l4p">预设</label><select id="l4p">${Object.entries(P4).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join("")}</select></div>
 ${r("l4B","热钱包余额",10,7000,10,"百万美元")}${r("l4R","自动补充速度",0,50,1,"百万美元/分钟")}${r("l4S","攻击者转出速度",1,100,1,"百万美元/分钟")}${r("l4D","从首笔转出到告警",1,600,1,"分钟")}
 <div class="rng"><span>告警后的处置</span><div class="seg" id="l4mode"><button type="button" data-m="sign">停止签名</button><button type="button" data-m="wd">只停用户提现</button></div></div>
 ${r("l4K","停签耗时",1,60,1,"分钟")}${r("l4M","若只停提现：人工停签发生在首笔后",10,600,5,"分钟")}</div>
 <div class="out"><div><span class="note">累计损失</span><div class="big" id="l4L"></div></div><div class="chart"><svg id="l4c" viewBox="0 0 640 260" role="img" aria-label="累计损失曲线"></svg></div><div class="verdict" id="l4v"></div>
 <p class="caveat">示意模型。真实攻击的转出不是匀速，Bitget 案两波共 24 秒转出约 2.9 亿美元。预设参数为按公开时间线粗略换算的示意值。</p></div></div>`);},
 after(root){const q=s=>root.querySelector(s);let mode="sign";const ids=["B","R","S","D","K","M"];
  const load=()=>{const p=P4[q("#l4p").value];ids.forEach(k=>q("#l4"+k).value=p[k]);mode=p.mode;draw();};
  const draw=()=>{const v={};ids.forEach(k=>{v[k]=+q("#l4"+k).value;q("#l4"+k+"v").textContent=v[k];});
   root.querySelectorAll("#l4mode button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===mode));
   const T=mode==="sign"?v.D+v.K:Math.max(v.M,v.D);const loss=t=>Math.min(v.S*t,v.B+v.R*t);const Lt=loss(T);
   q("#l4L").innerHTML=`${U().money(Lt)} <small>停签时刻：首笔后 ${T} 分钟</small>`;
   const s=q("#l4c");s.innerHTML="";const el=U().el;const X0=50,X1=625,Y0=230,Y1=15,tmax=Math.max(T*1.4,60),ymax=Math.max(v.B+v.R*tmax,loss(tmax))*1.05;
   const x=t=>X0+t/tmax*(X1-X0),y=m=>Y0-m/ymax*(Y0-Y1);
   for(let i=0;i<=4;i++){const m=ymax*i/4;el("line",{x1:X0,x2:X1,y1:y(m),y2:y(m),class:"grid-l"},s);el("text",{x:X0-6,y:y(m)+4,"text-anchor":"end",class:"axt"},s,U().money(m));}
   for(let i=0;i<=4;i++){const t=tmax*i/4;el("text",{x:x(t),y:Y0+16,"text-anchor":"middle",class:"axt"},s,Math.round(t)+"m");}
   el("line",{x1:X0,x2:X1,y1:Y0,y2:Y0,class:"ax"},s);
   let d="";for(let i=0;i<=100;i++){const t=Math.min(T,tmax*i/100);d+=(i?"L":"M")+x(t)+","+y(loss(t));}d+=`L${x(tmax)},${y(Lt)}`;
   el("path",{d:d+`L${x(tmax)},${Y0}L${X0},${Y0}Z`,fill:"var(--danger-soft)"},s);el("path",{d,fill:"none",stroke:"var(--danger)","stroke-width":2.4},s);
   el("line",{x1:x(v.D),x2:x(v.D),y1:Y1,y2:Y0,stroke:"var(--warn)","stroke-dasharray":"4 3"},s);el("text",{x:x(v.D)+4,y:Y1+12,class:"axt",fill:"var(--warn)"},s,"告警");
   el("line",{x1:x(T),x2:x(T),y1:Y1,y2:Y0,stroke:"var(--ok)","stroke-dasharray":"4 3"},s);el("text",{x:x(T)+4,y:Y1+26,class:"axt"},s,"停签");
   const vv=q("#l4v");const capped=v.S*T>v.B+v.R*T;
   vv.className="verdict "+(Lt<v.B*0.25?"good":capped?"bad":"mid");
   vv.innerHTML=capped?`<b>余额先耗尽。</b>攻击者在停签前就转空了钱包。此时降低余额是唯一有效的变量。${v.R>0?" 自动补充让损失继续增长。":""}`:`<b>停签先发生。</b>损失由“告警 + 处置”时间决定。${mode==="wd"?" 只停用户提现没有阻止攻击者调用签名，切换到“停止签名”对比。":""}`;};
  q("#l4p").onchange=load;ids.forEach(k=>q("#l4"+k).oninput=draw);root.querySelectorAll("#l4mode button").forEach(b=>b.onclick=()=>{mode=b.dataset.m;draw();});load();}});

/* L5 double spend */
function nak(q,z){if(q>=0.5)return 1;const p=1-q,lam=z*q/p;let s=1;let pois=Math.exp(-lam);for(let k=0;k<=z;k++){if(k>0)pois*=lam/k;s-=pois*(1-Math.pow(q/p,z-k));}return Math.max(0,Math.min(1,s));}
const CH5={btc:{n:"Bitcoin（10 分钟）",bt:600},etc:{n:"Ethereum Classic（约 13 秒）",bt:13},bch:{n:"Bitcoin Cash（10 分钟）",bt:600}};
add({id:"l5",code:"L5",title:"确认数、算力与双花",tagline:"Gate.io · OKEx · ETC",desc:"攻击者掌握 q 比例算力时，充值在 z 个确认后被重组撤销的概率。公式来自比特币白皮书第 11 节。",
 render(){return head(this,`<div class="lab"><div class="ctl"><div class="rng"><label for="l5c">链</label><select id="l5c">${Object.entries(CH5).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join("")}</select></div>
 <div class="rng"><label for="l5q">攻击者算力占比 q：<b class="mono" id="l5qv"></b></label><input type="range" id="l5q" min="1" max="60" value="30"></div>
 <div class="rng"><label for="l5z">交易所要求的确认数 z：<b class="mono" id="l5zv"></b></label><input type="range" id="l5z" min="1" max="200" value="12"></div></div>
 <div class="out"><div style="display:flex;gap:28px;flex-wrap:wrap"><div><span class="note">双花成功概率</span><div class="big" id="l5p"></div></div><div><span class="note">攻击者需维持私链约</span><div class="big" id="l5t" style="font-size:22px"></div></div></div><div class="meter"><div id="l5m"></div></div><div class="verdict" id="l5v"></div>
 <p class="note">2019 年和 2020 年，ETC 多次遭 51% 攻击，单次重组深度达数千个区块。q ≥ 50% 时，无论确认数多少，攻击者最终都能成功；确认数只决定攻击要持续多久、花多少钱租算力。</p></div></div>`);},
 after(root){const q=s=>root.querySelector(s);const draw=()=>{const Q=+q("#l5q").value/100,z=+q("#l5z").value,bt=CH5[q("#l5c").value].bt;q("#l5qv").textContent=Math.round(Q*100)+"%";q("#l5zv").textContent=z;
  const P=nak(Q,z);q("#l5p").textContent=(P<0.0001&&P>0?"< 0.01":(P*100).toFixed(P<0.1?2:1))+"%";q("#l5m").style.width=P*100+"%";const sec=z*bt;q("#l5t").textContent=sec<3600?Math.round(sec/60)+" 分钟":(sec/3600).toFixed(1)+" 小时";
  const v=q("#l5v");v.className="verdict "+(P>0.5?"bad":P>0.01?"mid":"good");v.innerHTML=Q>=0.5?"<b>攻击者占多数算力。</b>确认数不能阻止攻击，只能抬高成本。对策是降低该链的单笔充值上限，或暂停充值。":P>0.01?"<b>风险仍高。</b>提高确认数，或对该链设置单笔与每日充值上限。":"<b>风险较低。</b>前提是攻击者租不到更多算力。";};
  ["#l5c","#l5q","#l5z"].forEach(s=>q(s).addEventListener("input",draw));draw();}});

/* L6 oracle manipulation */
add({id:"l6",code:"L6",title:"预言机操纵与浮盈抵押",tagline:"Mango · Cream · Tectonic",desc:"在一个浅市场里买入代币，价格按恒定乘积公式上升。协议按这个价格给抵押品估值并放款。调节市场深度和防御参数，看攻击是否还有利可图。",
 render(){const r=(id,l,min,max,st,val,u)=>`<div class="rng"><label for="${id}">${l}：<b class="mono" id="${id}v"></b> ${u}</label><input type="range" id="${id}" min="${min}" max="${max}" step="${st}" value="${val}"></div>`;
 return head(this,`<div class="lab"><div class="ctl">${r("l6U","现货池 USD 侧深度",0.2,50,0.1,1,"百万美元")}${r("l6X","攻击者现货买入",0.5,20,0.5,4,"百万美元")}${r("l6Q","攻击者持仓（代币）",10,1000,10,483,"百万枚")}${r("l6p","初始价格",0.01,1,0.001,0.038,"美元")}${r("l6T","金库可借资产",10,300,5,115,"百万美元")}
 <hr style="border:0;border-top:1px solid var(--line);width:100%">${r("l6w","TWAP 窗口（0 = 即时价）",0,240,5,0,"分钟")}${r("l6d","价格被维持的时间",1,120,1,20,"分钟")}${r("l6cap","该资产抵押可借上限",1,300,1,300,"百万美元")}
 <label class="chk"><input type="checkbox" id="l6u" checked><span>允许浮盈计入抵押<small>Mango 的设定</small></span><span></span></label></div>
 <div class="out"><div class="figs" style="margin:0"><div class="fig red"><span class="n" id="l6m"></span><span class="l">现货价格倍数</span></div><div class="fig"><span class="n" id="l6pu"></span><span class="l">协议使用的价格</span></div><div class="fig red"><span class="n" id="l6b"></span><span class="l">可借走</span></div><div class="fig" id="l6pf"><span class="n" id="l6pr"></span><span class="l">攻击者利润（借款 − 买入成本）</span></div></div>
 <div class="verdict" id="l6v"></div>
 <p class="caveat">简化模型：价格倍数 = (1 + 买入额 / 池深度)²；TWAP 价格 = 初始价 + (操纵价 − 初始价) × min(1, 维持时间 / 窗口)。忽略手续费、滑点保护和对手盘。默认值按 Mango 2022 粗略设定。</p></div></div>`);},
 after(root){const q=s=>root.querySelector(s);const ids=["U","X","Q","p","T","w","d","cap"];const draw=()=>{const v={};ids.forEach(k=>{v[k]=+q("#l6"+k).value;q("#l6"+k+"v").textContent=v[k];});
  const mult=Math.pow(1+v.X/v.U,2),pm=v.p*mult;const pu=v.w===0?pm:v.p+(pm-v.p)*Math.min(1,v.d/v.w);
  const val=v.Q*pu,base=v.Q*v.p;const coll=q("#l6u").checked?val:base;const borrow=Math.min(coll,v.T,v.cap);const profit=borrow-v.X-(q("#l6u").checked?0:base);
  q("#l6m").textContent=mult.toFixed(1)+"×";q("#l6pu").textContent="$"+pu.toFixed(3);q("#l6b").textContent=U().money(borrow);q("#l6pr").textContent=U().money(Math.abs(profit)).replace("$",profit<0?"−$":"$");
  q("#l6pf").className="fig "+(profit>0?"red":"green");const vv=q("#l6v");
  vv.className="verdict "+(profit>0?"bad":"good");vv.innerHTML=profit>0?`<b>攻击有利可图。</b>花 ${U().money(v.X)} 拉盘，借走 ${U().money(borrow)}。试试：把 TWAP 窗口调到 60 分钟以上，或把可借上限调到 5。`:`<b>攻击不划算。</b>可借金额小于拉盘成本。`;};
  ids.forEach(k=>q("#l6"+k).oninput=draw);q("#l6u").onchange=draw;draw();}});

/* L7 / L8 embed original */
add({id:"l7",code:"L7",title:"EIP-7702 Nonce 喷洒",tagline:"Binance 热钱包事件",desc:"为什么攻击者签了 50 个授权：调节签名数量、热钱包交易速率和上链延迟，看命中概率和异常信号。",
 render(){return head(this,`<p><a href="labs/binance-1029.html#nonce" target="_blank" rel="noopener">在新标签页打开 ↗</a></p><iframe class="frame" src="labs/binance-1029.html#nonce" title="Nonce 喷洒实验" loading="lazy"></iframe>`);}});
add({id:"l8",code:"L8",title:"MPC 与独立策略层",tagline:"Binance · Bitget",desc:"MPC 保护密钥，不判断意图。选择一个签名请求，比较“仅 MPC”与“MPC + 策略层”。",
 render(){return head(this,`<p><a href="labs/binance-1029.html#mpc" target="_blank" rel="noopener">在新标签页打开 ↗</a></p><iframe class="frame" src="labs/binance-1029.html#mpc" title="MPC 策略层实验" loading="lazy"></iframe>`);}});

/* L9 entropy */
add({id:"l9",code:"L9",title:"熵与私钥暴力还原",tagline:"Wintermute · Coldcard",desc:"私钥的安全来自随机数的位数。Profanity 只用 32 位种子；Coldcard 2026 事件中种子熵降到约 40–72 位。拖动熵的位数，看暴力还原需要多久。",
 render(){return head(this,`<div class="lab"><div class="ctl"><div class="rng"><label for="l9b">有效熵：<b class="mono" id="l9bv"></b> 位</label><input type="range" id="l9b" min="20" max="256" value="32"></div>
 <div class="rng"><label for="l9r">攻击者算力：<b class="mono" id="l9rv"></b></label><input type="range" id="l9r" min="6" max="14" value="9"></div>
 <div class="seg" id="l9p"><button type="button" data-b="32">Profanity 32</button><button type="button" data-b="48">Coldcard ~48</button><button type="button" data-b="72">Coldcard 上限 72</button><button type="button" data-b="128">BIP39 12 词 128</button><button type="button" data-b="256">私钥 256</button></div></div>
 <div class="out"><div><span class="note">平均还原时间（搜索一半空间）</span><div class="big" id="l9t"></div></div><div class="bars" id="l9bars"></div><div class="verdict" id="l9v"></div>
 <p class="caveat">算力单位为“每秒尝试的种子数”，10^9 约等于一张高端 GPU 对简单派生的速度。Wintermute 案中，研究者公开演示了在普通硬件上数十小时还原 Profanity 地址私钥。</p></div></div>`);},
 after(root){const q=s=>root.querySelector(s);const fmt=s=>{if(!isFinite(s)||s>1e30)return "远超宇宙年龄";const u=[[31557600e9,"十亿年"],[31557600,"年"],[86400,"天"],[3600,"小时"],[60,"分钟"],[1,"秒"]];for(const [d,n] of u)if(s>=d)return (s/d<1000?(s/d).toFixed(1):(s/d).toExponential(1))+" "+n;return "< 1 秒";};
  const draw=()=>{const b=+q("#l9b").value,r=+q("#l9r").value;q("#l9bv").textContent=b;q("#l9rv").textContent="10^"+r+" 次/秒";const s=Math.pow(2,b-1)/Math.pow(10,r);q("#l9t").textContent=fmt(s);
   const ref=[["Profanity",32],["Coldcard ~48",48],["Coldcard 72",72],["BIP39 128",128],["私钥 256",256]];q("#l9bars").innerHTML=ref.map(([n,bb])=>{const sec=Math.pow(2,bb-1)/Math.pow(10,r);const lg=Math.max(0,Math.log10(sec)+1);return `<div class="barrow"><span>${n}</span><div class="trk"><div class="${bb>=128?"b":""}" style="width:${Math.min(100,lg/80*100)}%"></div></div><span class="v">${fmt(sec)}</span></div>`;}).join("");
   const v=q("#l9v");v.className="verdict "+(s<31557600?"bad":s<31557600e6?"mid":"good");v.innerHTML=s<31557600?"<b>一年内可还原。</b>该地址的资产随时可能被盗。":s<31557600e6?"<b>需要很长时间，</b>但算力进步会缩短它。":"<b>安全。</b>前提是随机数真的有这么多位。";
   root.querySelectorAll("#l9p button").forEach(x=>x.setAttribute("aria-pressed",+x.dataset.b===b));};
  ["#l9b","#l9r"].forEach(s=>q(s).oninput=draw);root.querySelectorAll("#l9p button").forEach(x=>x.onclick=()=>{q("#l9b").value=x.dataset.b;draw();});draw();}});

L.forEach((o,i)=>{o.ord=i;H.docs.push(o);});
})();
