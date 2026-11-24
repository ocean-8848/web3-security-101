# 拟物物件目录（自动生成：node tools/catalog.mjs）

选物件只看这份目录和缩略图 `kit/objects-sheet*.png`，不要读源码；确定要用哪几个后，再去源码里看那几个函数的参数。

调用方式都是 `名称(origin, opts) → { svg, anchors }`；`opts.id` 必填且同一画面唯一；通用 `opts.state` = normal | broken | attacker，`opts.glow` 加绿色地光。
导入：kit 用 `import * as O from "../../../kit/objects.mjs"`，第 NN 集的扩展用 `import * as ENN from "../../../epNN/kit-ext/objects-ext.mjs"`。

共 126 个。缩略图编号与下表 # 列一致。

## kit/objects.mjs（O）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 1 | `O.safe` | 保险柜 safe — 冷钱包 / Safe 多签；variant:"hot" = 热钱包（小、浅色、外挂数字键盘） opts: open (门开角度°, 0 关, 105 全开), core:"blue"／"attacker", gold: | variant gold open plate core | top front center ground hinge core coreLabel coreNow door coreId coreAtkId |
| 2 | `O.hotWallet` | — | screen screen2 off | top front center ground hinge core coreLabel coreNow door coreId coreAtkId |
| 3 | `O.laptop` | — | off screen screen2 | top screen front keyboard ground center screenM scr scr2 |
| 4 | `O.laptopDefaultScreen` | — | screenText | — |
| 5 | `O.hwWallet` | 硬件钱包 hwWallet — 通用小设备：小屏 + 两个按键 + USB 线（无品牌外观） opts.screenText（默认 "确认?"） 可动：ID-scr / ID-scr2（屏幕内容，本地 70×40）, ID-btn-0/1 | screen screenText screen2 key | top screen center ground scr scr2 |
| 6 | `O.padlock` | — | key stand | top center keyhole ground |
| 7 | `O.key` | — | stand | top center ground |
| 8 | `O.seal` | 公章 seal — 木柄圆印章 + 纸 + 红色印痕（"钥匙盖在什么文件上"） opts: paper=true, stamped=true（印痕可见）, text="签名专用", markText 中心两字 "核准" 可动：ID-stam | paper text markText stamped | top mark stamp center ground |
| 9 | `O.doc` | 文件 / 提现单 doc — 带折角、几行字、可盖章的纸 opts: title="提现单", lines=[...]（可选，每行文字），stamp=false（右下角盖红章）, standing=false（立起来） 可动：ID-stam | w h title lines stamp stampText standing | top center stamp ground m |
| 10 | `O.envelope` | — | w h scale | top center ground |
| 11 | `O.ledgerBook` | 账本 ledger — 摊开的厚账簿（ledgerBook）；数据库圆柱 + 账簿（dbLedger） opts.scale（ledgerBook 缩放） | scale | top center ground |
| 12 | `O.dbLedger` | — | leds units tag | top center ground |
| 13 | `O.rack` | 服务器机柜 rack — 签名集群 / MPC 节点：三层服务器，每层指示灯 opts.leds = ["green","green","green"]（"red"/"off"）, opts.units=3, opts.tag 机柜铭牌 可 | units leds tag | top front center ground leds |
| 14 | `O.hsm` | 加密机 HSM — 厚重小机箱：LCD + 小键盘 + 盾形徽记 + 防拆封条 | led | top center ground led |
| 15 | `O.rpc` | RPC 节点 — 小服务器 + 天线 + 信号弧（ID-wave-0..2） | led | top center tip ground led waves |
| 16 | `O.checkpoint` | 关卡 checkpoint — 岗亭 + 道闸（红白横杆）+ 门牌编号；路沿 u 方向，横杆沿 +v 横跨道路 opts: n="④"（门牌）, armUp=false, state normal（默认绿色地光）/ broken 可动：ID | state n armUp road glow | top plate road center armTip ground arm |
| 17 | `O.tower` | 广播塔 tower — 格构发射塔 + 信号弧（ID-wave-0..3） | — | top tip center ground waves |
| 18 | `O.chain` | 区块链 chain — n 个区块沿 +u 排开，相邻用铁链环连接 opts: n=4, labels=["#1","#2",...], blockStates=["normal",...,"attacker"] 可动：ID-b0..b{n | n blockStates state labels title page page2 | top blocks last center ground |
| 19 | `O.browserWin` | 浏览器窗口 browserWin（Safe{Wallet} 网页那种）— 底座 + 立板 + 仿射贴网页 380×300 opts.title, opts.page（自定义 SVG，本地 380×300）, opts.page2（替换内容， | title heading button page page2 | top center ground pageM page page2 |
| 20 | `O.bucket` | 云存储桶 bucket（S3）— 上宽下窄的桶 + 提手 + 露出的文件 | — | top center ground |
| 21 | `O.desk` | 员工工位 desk — 桌子 + 显示器（屏幕插槽 148×88）+ 键盘 + 椅子 + 杯子 手机 phone — 斜靠在小支架上，屏幕插槽 76×150 | screen screen2 | top screen center chair ground scr scr2 |
| 22 | `O.phone` | — | screen screen2 role color | top screen center ground scr scr2 |
| 23 | `O.person` | 人物 person — 极简等距小人（无脸，圆头 + 身体） opts.role = "signer"（墨色）／ "engineer"（青蓝）／ "attacker"（红色帽衫轮廓）；或 opts.color 自定 | state role scale color on | top head center ground |
| 24 | `O.knifeSwitch` | 熔断开关 knifeSwitch — 墙上的大闸刀：底板 + 上方夹口 + 两片闸刀 + 绝缘横把 + 指示灯 opts.on=true（合上）；lampOn="#2bd46f" lampOff="#ff4a3d" 可动：KIT.toggl | on lampOn lampOff text | top center handle ground lamp |
| 25 | `O.beacon` | 警报灯 beacon — 旋转警示灯：KIT.beacon(tl, ID, t, dur, period) 让灯束旋转 + 灯罩明暗 可动：ID-beam（水平面里旋转的光束）, ID-lit（灯罩点亮层） | h m | top center ground beam lit |
| 26 | `O.hourglass` | 沙漏 hourglass — 木框 + 玻璃 + 沙；KIT.sand(tl, ID, t, dur)：上沙下降、下沙堆高 时钟 clock — 双铃闹钟；指针 ID-hh / ID-mh（KIT.clock 推进分钟）；opts.h, o | flowing | top center ground |
| 27 | `O.clock` | — | h m | top center ground hh mh |
| 28 | `O.shield` | 盾牌 shield（策略引擎）— 立在底座上的厚盾 + 白色对勾 放大镜 magnifier（解码/核对）— 厚镜框 + 玻璃高光 + 手柄，悬在地面上方 | — | top center ground |
| 29 | `O.magnifier` | — | z | top lens center ground |

## ep01/kit-ext/objects-ext.mjs（E01）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 30 | `E01.vending` | 自动售货机 vending — 智能合约（全片主角） 200（u）× 150（v）× 300（z）。+v 面：灯箱招牌、玻璃橱窗（三层货架、螺旋弹簧、金条与硬币）、 齿轮观察窗、右侧按钮面板（显示屏、投币口、5 个按钮、退币钮）、出货口（带 | scale maintDoor impl mdoorOpen sign coins glass gears rivets | top center ground front sign glass stock panel coinSlot buttons btnIds tray trayOut gears gearIds side schem maint maintTop impl maintHinge maintFree |
| 31 | `E01.miniVend` | 小售货机 miniVend — 外部合约：kind="token"（硬币）／ "dex"（互换箭头）／ "oracle"（顶上表盘，指针可动）／ "attacker"（红色攻击者合约）／ "plain" 110 × 90 × 180。可动： | kind scale label needle pts | top center ground front icon tray portL portR portF dial btnIds needle |
| 32 | `E01.pipe` | 管道 pipe — 连接合约的金属管（可组合性）。opts.pts=[[du,dv,z],...]（相对 o，世界单位，建议轴向折线）, r=9 可动：ID-flow（管内流动的虚线，KITX.dash 推进；默认隐藏，opacity 动画 | r pts flowColor flow z | start end mid ground center top flow |
| 33 | `E01.letter` | 立着的信封 letter — 交易（排队、上传送带、过桥用）。opts.z（底部高度，如传送带面 78）, lift=10 根元素带 data-px/py（底部中心点），KITX.walk 按世界画布点移动它。state:"attacker | z lift w h | top center ground foot |
| 34 | `E01.mempool` | 内存池排队区 mempool — 伸缩隔离带围成的蛇形通道（栏杆透明），上方龙门架挂牌 "Mempool"，里面排着立起的信封 区域 u −240..240、v −126..126；入口在左前（−u，v=84），出口在右后（+u，v=−84 | n red sign | top sign center ground entry exit slots slotsUV route envIds |
| 35 | `E01.sorter` | 分拣机 sorter — 区块构建者 / 排序器：传送带（沿 +u）+ 龙门立柱上倒挂的两节机械臂 + 末端敞口区块箱 opts: letters=3（带上的信封数）, red=[下标], blockLabel="#N", sealed=f | letters red blockLabel sealed pose | top center ground in out beltZ beltSlots envIds shoulder shoulderUVZ block blockIn blockTop ledIds beltIds |
| 36 | `E01.bridge` | 跨链桥 bridge — 石拱桥（驼峰桥面）沿 u 跨过一条沿 v 流的浅蓝色河，近岸桥头有消息层 / 验证岗亭（带天线） opts: river=170（河半宽）, booth="normal"／"attacker", flow=fals | river booth | top crown center ground deck nearRoad farBank booth boothId river |
| 37 | `E01.firewall` | 防火墙 firewall — 一段砖墙（两截）+ 中间的门禁闸机（两根立柱 + 玻璃翼闸 + 读卡器） opts: len=260（墙半长）, open=false（翼闸打开）, led="green"／"red" 可动：ID-flap-0 | len led open | top center ground gate gateFront reader ledId wallL wallR flapIds |
| 38 | `E01.flashDesk` | 闪电贷柜台 flashDesk — 银色柜台 + 后方玻璃隔断与灯牌（闪电徽记）+ 台面金条堆（4 层）+ 服务铃 opts: gold=true（金条初始可见）, frame=false（青蓝"一笔交易"框）, sign="FLASH L | sign gold frame | top counter pile center ground frameTag frameId pileIds |
| 39 | `E01.balance` | 天平 balance — 不变量：黄铜立柱、刻度弧、秤杆（可倾斜）、两只吊盘 左盘：硬币堆（合约余额）；右盘：一叠存款单（存款之和）。tilt>0 = 左盘下沉（左重，正常） opts: tilt=6, glow 默认 true 可动：ID | tilt | top pivot panL panR panLlow panRlow foot center ground beam |
| 40 | `E01.signBoard` | 牌子 signBoard — style:"wood"（插在地上的木牌，两根桩）／ "plate"（立杆横臂下挂的白底青蓝框牌，六大类挂牌可用） opts: text, sub（第二行小字）, size=40, w（默认按字数）, z（牌底 | style text size sub w h z color ink | top board center ground w h |
| 41 | `E01.timeLock` | 时间锁 timeLock — 挂锁正面嵌一个计时表盘（青蓝剩余时间扇环 + 指针），顶上一枚计时旋钮 opts: frac=0.75（剩余比例）, open=false（锁梁抬起） 可动：ID-arc / ID-hand（KITX.coun | frac open | top dial keyhole center ground hand arc |

## ep02/kit-ext/objects-ext.mjs（E02）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 42 | `E02.lottery` | 摇奖机 lottery — CSPRNG 熵源：青蓝底座 + 两侧支架 + 横轴透明钢丝滚筒，筒里翻滚带数字的小球，前方出球槽和托盘 opts: size "big"(默认) ／ "small", balls（球数）, plate（底座铭牌 | size balls plate angle out | top center ground drum tray chute |
| 43 | `E02.prngCounter` | PRNG 机械计数器 prngCounter — 小号熵源：奶白小机箱，正面一个只有 8 档的转盘 + 指针、读数窗，侧面摇柄 opts: plate（默认 "PRNG"）, window（读数窗文字，默认 "32 位"）, steps（指 | plate window steps rings text | top center ground dial |
| 44 | `E02.comboDial` | 密码转盘 comboDial — 老式保险柜转盘立在底座上 opts.rings = 1（"32 位"，单圈 32 格刻度）／ 8（"256 位"，8 圈同心环叠成的大转盘）; opts.text 覆盖刻字 可动：ID-ring-0..n- | rings text angle | top center ground hub side back rings |
| 45 | `E02.shaft` | 传动轴 shaft — 两点之间的钢轴，两端万向节；转动 = 轴面条纹滚动 opts: a=[du,dv,z], b=[du,dv,z]（相对 origin 的两端）, r=8, color 可动：ID-st（条纹）→ KIT.shaftS | a b r hi | a b center top ground |
| 46 | `E02.die` | — | size z top black | top center ground |
| 47 | `E02.diceCup` | nonce 骰子杯 diceCup — 皮质骰子杯扣在深色毡垫上，杯下两颗白骰子 opts: dice=[3,5]（两颗顶面点数；"重用"就给两次相同）, up=false（杯子掀开）, black=false（偏置：骰子顶面涂黑） 可动： | dice up black | top center ground dice cupUp |
| 48 | `E02.mnemonicPlate` | 金属助记词板 mnemonicPlate — 不锈钢板斜立在支架上，刻 12 个编号单词槽（只用短横线示意，不写真实单词） opts: n=12, filled=true（槽里刻了横线）, title="助记词" 可动：ID-w-0..n- | n title filled | top center plate ground |
| 49 | `E02.seedJar` | 种子罐 seedJar — 玻璃罐 + 钢盖，罐里一颗发光的大种子，罐身贴纸"种子" opts: label="种子", lit=true（种子周围青蓝光晕） 可动：ID-seed（正常）/ ID-seed-atk（红色，泄露）→ KIT. | lit label | top center seed ground |
| 50 | `E02.deriveTree` | 派生树 deriveTree — 等距小树：树干分出 n 根枝，每根枝末端用细绳挂一把黄铜钥匙；树冠是青蓝浅色叶簇 opts: n=3（枝数）, levels=1／2（2 = 每根枝再分两叉，钥匙数 2n）, scale=1.4 可动：每部 | n levels scale | top center ground root keys |
| 51 | `E02.gpuRig` | GPU 枚举机 gpuRig — 黑色机箱，+v 侧板是透明玻璃，露出主板与两张竖装的三风扇显卡；正面电源键与指示灯；可带网线 opts: gpus=2, cable="none"／"on"／"cut"（"cut" = 剪断的网线：离线）, | gpus cable leds | top center glass ground cableEnd cut |
| 52 | `E02.rollCounter` | 滚动计数器 rollCounter — 老式里程表：黑色机身，白色数字轮，飞速滚动 opts: digits=10, value=0, z（放在别的物件顶上时的底高） 可动：ID-dg-0..（每个数字轮，0 是个位）→ KIT.count | digits z value | top center window ground |
| 53 | `E02.curveBoard` | 椭圆曲线板 curveBoard — 画架上的白板：一条光滑椭圆曲线（蛋形 + 一支），曲线上的点和一条割线；不写公式 opts: points=true（显示 P、Q 与割线） 可动：ID-curve（曲线 path，KIT.drawPa | points | top center board ground |
| 54 | `E02.sigPaper` | 签名纸 sigPaper — 立在小座上的签名纸：标题、两行数据条、墨色签名笔迹；右上角夹一个青蓝小签条 "r" opts: tag="r", dup=false（签条变红 = r 值重复）, title="签名", flat=false  | title tag dup | top center tag ground |
| 55 | `E02.cloth` | 遮布 cloth — 深色布盖在一把钥匙上，布面印骰子点数纹样（seg4 比喻） opts: covered=true（false = 布已揭开，只剩钥匙）, keyState（钥匙状态："attacker" 为红钥匙） 可动：ID-clo | keyState covered | top center key ground |
| 56 | `E02.puzzleSet` | 拼图组 puzzleSet — 三块厚拼图平放（三个参与方各持一块）；面上印着一把钥匙的三段，拼合后钥匙才完整 opts: assembled=false, gap=56（分开时间距）, pieces=[0,1,2]（只画其中几块）, pi | size gap pieces pieceStates assembled | top center ground pieces piecesTogether |
| 57 | `E02.proofCard` | 证明卡 proofCard — 立着的白卡：绿勾圆章 + 两行字条 + "证明"；missing 时换成红虚线空位 opts: missing=false, text="证明" 可动：ID-card（卡）/ ID-slot（红虚线空位 +  | missing text | top center ground |
| 58 | `E02.quantum` | 量子计算机 quantum — 门形钢架上倒挂的金色多层"吊灯"（稀释制冷机）：五层金盘 + 金色拉杆 + 铜色同轴线，底部混合腔带冷光 opts: beam=false（底部红色光锥，"对准已公开的公钥"）, plate="量子"（横梁铭 | cold plate beam | top center tip ground beamEnd |
| 59 | `E02.kMachine` | 确定性 k 机器 kMachine — 绿色小机器：顶上两个进料斗，两根管子分别接"私钥"（左）和"消息"（后），正面读数窗 + 齿轮舷窗，出口吐出 k 币 opts: missing=null／"key"／"msg"（缺的那根管子画成红虚 | missing out inner | top center ground inKey inMsg out |
| 60 | `E02.vitrine` | — | w d h plate inner | top center floor ground |
| 61 | `E02.addrPlate` | 地址门牌信箱 addrPlate — 立柱上的拱顶信箱，正面门板钉门牌（"地址 1"），侧面小旗 opts: text="地址 1", flag=false（小旗竖起） 可动：ID-flag（小旗 rotator，KIT.rot(tl,"I | text flag | top center plate ground |
| 62 | `E02.conveyor` | — | len width | top center deck start end ground len |

## ep03/kit-ext/objects-ext.mjs（E03）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 63 | `E03.contractMachine` | 合约机器 contractMachine — 齿轮外露的方形机器（约 220×200×220） opts: name="A"（正面铭牌大字）, tone:"light"／"gray", slotLit=false（投信口亮）, pipe=0 | tone name code screen2 led slotLit pipe pipeZ | top center ground front slot out plate porthole pipeEnd gears led screenM |
| 64 | `E03.byteBlock` | — | bytes cell depth h z color over text n dh | top center ground left right len |
| 65 | `E03.cabinetCell` | — | — | — |
| 66 | `E03.slotCabinet` | — | fill tags open labels title glass | top center ground header drawers drawersOpen drawerLabels cells cellStep openVec maxOut |
| 67 | `E03.hashFunnel` | 哈希漏斗 hashFunnel — 绞肉机样的小机器：顶部金属漏斗、−u 侧摇柄、正面出料孔板 + 斜槽 opts: inputs=["键 k","槽 3"]（上方两张输入卡）, output="哈希位置"（吐出的卡）, text="kec | text inputs done output | top center ground hopper port out inputs crank |
| 68 | `E03.manual` | — | pageTitle pageText open title sub | top center ground page title hinge cover |
| 69 | `E03.frameStack` | 调用帧堆叠 frameStack — 托盘架：底座 + 四根立柱 + 每层导轨，n 层半透明托盘（A 在最下） opts: n=3（层数）, labels=["A","B","C"], filled=labels.length（初始放了几层 | n labels filled items | top center ground trays tabs |
| 70 | `E03.gasGauge` | gas 油表 gasGauge — 汽车式半圆油表，立在短柱上；E 在左、F 在右，表盘下沿写 "gas" opts: value=1（1 = F，0 = E）, label="gas", scale2（替换刻度组的 SVG，可选） 可动： | scale2 label value | top center ground dial hub needle lamp |
| 71 | `E03.selectorKey` | 选择器钥匙 selectorKey — 钥匙齿只有 4 个（4 字节），齿深由选择器每个字节决定；手柄铭牌写函数名 opts: name="transfer(address,uint256)", selector="a9059cbb"（8  | name selector nameSize stand z | top center ground tip bow teeth name len |
| 72 | `E03.signboard` | 告示牌 signboard — 路边木框白色告示牌：两根木柱、顶檐、左上编号、顶上小灯；三行 误解 / 事实 / 影响 opts: n="1"（编号）, myth, fact, impact（三行文字）, struck=false（误解行红 | w h lamp n blank myth fact impact struck | top center ground plate myth fact impact lamp |

## ep04/kit-ext/objects-ext.mjs（E04）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 73 | `E04.callbackArm` | 回调弹簧臂 callbackArm — 攻击合约的 receive：红色底座（顶上接币托盘）+ 钢弹簧 + 红色剪刀伸缩臂 + 指着的小红手 opts: target=[x,y]（世界画布点，手指尖要按到的位置，如 vending anch | scale state coin target maxReach s | top center ground mount pan tip |
| 74 | `E04.tellerCounter` | 银行柜台 tellerCounter — 柜员比喻：木质柜台 + 石材台面 + 玻璃隔板（两个窗口，传声孔 + 拱形递钞口）+ 递钞槽； 台后柜员（kit person engineer），台面上一叠绿色现金、摊开的账本、柜员的笔；右侧立柱 | scale teller sign cash penDown stock z | top center ground teller ledger pen slot cashOut customer window2 window1 stock |
| 75 | `E04.hasp` | — | scale z transient locked shared plate chainTo chainShown sag | top center ground lock eye strapTip plate chainEnd |
| 76 | `E04.pickupLocker` | 取件柜 pickupLocker — 拉取式支付：一排青蓝快递取件柜，左侧控制柱（大屏、扫码窗、键盘），每格小门带编号牌、小屏、拉手 opts: cols=4, rows=3, amounts={i:"1 ETH"}（格门小屏文字）, bl | scale cols rows amounts blank coins open title | top center ground front panel cells inside stand |
| 77 | `E04.oracleGhost` | 预言机幽灵指针 oracleGhost — 叠在 ep01 miniVend({kind:"oracle"}) 上：一根半透明红色"幽灵指针"（带两道残影）偏离墨色正常指针， 正面价格曲线窗叠一条红色尖峰。和那台 miniVend 用同一个 | scale deg real shown | dial tip chart top ground |
| 78 | `E04.punchCard` | — | scale red bytes kind z len s redShown cols title | top center ground start end red |

## ep05/kit-ext/objects-ext.mjs（E05）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 79 | `E05.keycard` | — | scale role pose z blank holder lanyard atk | top center face hole ground |
| 80 | `E05.funcPanel` | — | buttons atk pitch depth height title lamps | top center ground front btns readers slots plates covers |
| 81 | `E05.roleBoard` | — | hooks mode roles holders delays empty title plates colors blank | top center ground hooks cards holders tags |
| 82 | `E05.accountSafe` | — | keys inserted owners coins open gate | top center ground front dials plates keyholes inSlot out window cavity core |
| 83 | `E05.thresholdMeter` | — | max th level r h color pipe pipeDir thText | top center ground lamp th levels |
| 84 | `E05.iceShell` | — | pad box w d h seed on | top center ground front |

## ep06/kit-ext/objects-ext.mjs（E06）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 85 | `E06.certFace` | — | — | — |
| 86 | `E06.roundCutter` | 取整刀 roundCutter — 工业版裁纸铡刀（约 320×180×200，刀柄抬起时约 250 高） 刀床顶面刻等距刻度（每格 = 1 个最小单位，整数刻线加粗，半格细线），刀口在第 cutAt 格； 床上放一根金条：stock 格（ | scale cutAt dir bladeUp labels pileR pileL stock chip load | top center ground cut chip stock trayL trayR trayLTop trayRTop lever leverUp leverDn pivot handle ticks cell blade leverId chipId |
| 87 | `E06.decimalRuler` | 精度刻度尺 decimalRuler — 立在两只木支架上的木框钢尺（尺面 +v 朝前） 尺面被小数点分成两段：左 ints 格整数位（白），右 places 格小数位（青蓝底）。places=18 时格更密、尺更长。 尺头铭牌写链名（只是 | scale places ints cell chain digits slider | top center ground head dot sliderTop cells cellW |
| 88 | `E06.shareDispenser` | — | scale led digits value tickets issued | top center ground counter slot shelf coin lamp led |
| 89 | `E06.shareCert` | 份额凭证 shareCert — 60×36 小卡片：米白卡面、青蓝边框、左圆形徽记（饼图一角）、右"份额" opts: stand=false（立在小卡座上）, n=1（成叠张数；平放时错落叠起，立放时前后排）, scale=1, z=0 | ghost scale n z text stand | top center ground |
| 90 | `E06.pizza` | 披萨 pizza — 打开的纸盒（盒盖在后侧立起，前挡板放平）+ 盒里一块带柄的圆木板 + 整张披萨，切成 slices 块 opts: slices=8（1 = 整张只切成 1 块）, box=true, rot=-22.5（第一刀的角度 | scale slices box rot pulled | top center pizza ground slices lid board |
| 91 | `E06.burnBox` | 死地址投递箱 burnBox — 焊死的钢制投递箱（约 150×120×190）：顶上只有一个投入口；没有门、没有锁孔， 正面原来门的位置一圈焊缝，原锁孔位置被一块圆钢片焊死；正面黑铭牌"死地址"。 opts: plate="死地址", s | scale plate sub cards loaded cardAtk | top center ground slot plate card |

## ep07/kit-ext/objects-ext.mjs（E07）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 92 | `E07.emptyLot` | 荒地 emptyLot — 无代码地址 / 零地址：约 260×200 的夯土地块，碎石、枯草、四角木桩 + 松垂麻绳， 前沿一根门牌桩（白底青蓝框，空白）。地块中心没有建筑，只有青蓝虚线地基轮廓（"这里本该有代码"）。 opts: w=2 | scale w d ghost plateText zero | top center ground plate drop plateTop |
| 93 | `E07.parcel` | 快递包裹 parcel — 瓦楞纸箱（60×48×44）：十字胶带、−u 侧"向上"箭头、+v 面白色面单（条码 + 两行横线）。 opts: stack=1（叠几个）, z=0（离地高度）, state:"lost"（没有送达的包裹：箱体 | scale stack z state | top center ground foot label |
| 94 | `E07.returnTag` | 回执签 returnTag — 从管子回程口弹出的硬卡纸小签（约 70×40，立着，上沿穿绳孔 + 一截棉绳，脚下黑色小夹座） 卡面三种：ok（绿边，墨字 true）、false（红边，false）、empty（灰虚线边，空白，只有一个 ∅ | scale z stand face stamp | top center face ground hole |
| 95 | `E07.dispatchDesk` | 发货登记台 dispatchDesk — 窄长木柜台（约 200×100×112）：竖拼木板正面 + 凸框，台面一本 kit ledgerBook（登记簿）， 右页是一张新页，可逐行写入记录；台前镀铬"回执投入口"，−u 侧挂一盏小灯。 o | scale led book entries shown | top center ground slot book entries led |
| 96 | `E07.oddCoin` | — | scale kind num numLit icon chip | top center face ground base num |
| 97 | `E07.scale` | 到账台秤 scale — 商店电子台秤：低平秤台（不锈钢秤盘）+ 后立柱 + 显示头。显示头正面是青蓝底 LCD， 两行"前 / 后"读数，下面一条"差 = …"（相等绿、不等红）。约 150×110×195。 opts: before（" | scale unit diffOk before after diff pile | top center ground pan lcd diff |
| 98 | `E07.tollClip` | 过路收费夹 tollClip — 夹在 ep01 pipe 上的铸铁管夹（约 70×50×60 + 上部铡刀架）：两半铸铁卡箍 + 侧耳螺栓， 卡箍顶上一侧是铡刀架（两根导柱 + 横梁 + 斜口刀片），另一侧是一个小收费杯（钢杯，杯里金屑堆 | scale axis z r pile rate | top center ground cup clamp cut |
| 99 | `E07.auctionStand` | 拍卖台 auctionStand — 木质拍卖讲台（约 130×90×136）+ 台后"最高出价"翻牌板（两根立柱，约 120 宽，顶高约 240）。 讲台正面雕花板（凸框 + 拱形内板 + 圆形花饰），台面木砧 + 木槌；台前一条镀铬退款 | scale red head name amount gavelUp refund | top center ground board chute chuteTop bidder gavel |

## ep08/kit-ext/objects-ext.mjs（E08）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 100 | `E08.ammPool` | AMM 池 ammPool — 两只立式玻璃储罐（左金币 ETH、右青蓝币 USDC）共用钢底座，底部粗连通管 + 阀门轮；中间短柱顶上半圆"现货价"表（墨针 + 数字窗）；罐顶进料斗、罐前出料口 约 240×130×210。opts: l | scale lvlL lvlR deg labelL labelR read | top center ground tankL tankR dial readout hopL hopR outL outR valve |
| 101 | `E08.twapRecorder` | 均价记录仪 twapRecorder — 老式走纸记录仪：灰色铸铁机箱 + 斜面玻璃窗，窗里白色方格纸从右往左走，墨色记录笔画价格曲线；纸上罩青蓝半透明"窗口框"，上方读数窗显示均值；−u 侧调窗口长度的旋钮 约 200×90×150。op | scale win off spikeAt avg trail spike | top center ground window avg pen spike knob |
| 102 | `E08.marketStall` | 菜市场黄金摊 marketStall — 条纹遮阳篷（米白 + 青蓝）木摊位，台面两堆小金条，摊后小黑板价目牌（白粉笔写价），篷檐挂一盏小灯 约 220×120×275（价目牌立在篷后、高出篷顶，免得被篷挡住）。opts: price（价目 | scale gold price head lamp | top center ground board gold counter lamp |
| 103 | `E08.liqBot` | 清算机器人 liqBot — 小型四轮工厂机器人：墨色底盘、青蓝机身、顶上旋转小灯、正面小屏（读到的价格）、前伸两指夹爪（抓抵押品） 约 70×60×90。opts: scr（小屏文字，默认 "$2,000"）, open=false（夹爪 | scale n gap scr lamp open | top center ground scr claw lamp bots |

## ep09/kit-ext/objects-ext.mjs（E09）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 104 | `E09.cheque` | 支票 / 签名消息 cheque — 立在小木夹座上的横版支票：米白防伪纹纸、青蓝细边框、左上徽记、右上金额框、横排五个带标签的字段槽、右下墨色签名笔迹； 身后可叠 3 张半透明复印件（错位排开，可单独滑出） 约 180×20×112（立着 | scale state missing fields labels vals copies title amount signed | top center ground fields amt sig emblem copies |
| 105 | `E09.rotaWheel` | 出块轮值台 rotaWheel — 低矮圆形木质转台（会议转盘）：深色木底座 + 木鼓身 + 浅色台面，台面边缘一圈小座位，每座一个墨色圆头小人偶； 中心镀铬立柱顶上一根青蓝指针臂，指向"当前出块者"，被指的人偶头顶亮一盏小灯、脚下青蓝光圈 | scale n at red lamp plate speed | top center ground hub plate lamp seats arm |
| 106 | `E09.commitBox` | 提交揭示投标箱 commitBox — 深色木质投标箱：顶上一道窄投信口；正面整块前门（下沿铰链，可翻下），门上磨砂玻璃窗（只看到信封轮廓）和黄铜名牌插槽（写发送者）； −u 侧一把挂锁。投进去的信封口上一枚青蓝火漆封印（印"哈希"）；第二 | scale state name env seal answer open unlocked | top center ground slot drop window name lock door answer |

## ep10/kit-ext/objects-ext.mjs（E10）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 107 | `E10.coreModule` | 实现机芯（散件）coreModule — 售货机维修门里 impl 同款的机芯单独拿出来：竖立的金属机芯盒（青蓝侧板 + 银色前框），前面一扇深色观察窗露出 两枚咬合的黄铜齿轮和一小块绿色电路板；正面上方白底铭牌写版本；顶上一个镀铬拉杆插座 | scale state cart bad lever owner ver skin | top center ground front plate card gears lever socket cart handle wheels |

## ep11/kit-ext/objects-ext.mjs（E11）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 108 | `E11.snapshotCamera` | 快照相机 snapshotCamera — 老式木质箱式相机立在三脚架上：深色木箱 + 黄铜镜头筒 + 前伸（+v）的折叠皮腔，顶上一只闪光灯泡托架（反光碗 + 灯泡）； 木箱正面下沿一道黄铜出片口，吐出一张白边相片（像拍立得那样挂在出片口 | scale state shot photo sub | top center ground front lens bulb flash slot photo body tripod |
| 109 | `E11.mintPress` | 铸币机 mintPress — 工业螺旋冲压机：铸铁门形机架（底座 + 两根立柱 + 横梁），横梁上一只大飞轮（顶面水平转）+ 一根竖立的摇柄； 螺杆带着中间的冲头上下，冲头下方是模座；模座前面一条出币斜槽落进前面的托盘（托盘里几摞硬币，高 | scale state keys keyIn atkKey count limit stop lamp pile | top center ground front plate count keyPanel keys wheel ram die chute tray coins limit stop lamp |

## ep12/kit-ext/objects-ext.mjs（E12）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 110 | `E12.merkleTree` | Merkle 树挂牌架 merkleTree — 木质 A 字形挂牌架：两对斜腿 + 顶上横梁 + 底下一根拉杆；横梁正中挂一块大铭牌 = 根（写 rootText）， 下面两层细绳：中层 2 块、底层 4 块叶子牌（白底青蓝框，牌面三道横 | scale state leaf rootText path | top center ground root mids leaves leaf |

## ep13/kit-ext/objects-ext.mjs（E13）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 111 | `E13.passport` | 账户护照 passport — 一本立在小黑夹座上的护照：硬封面青蓝色，压一枚金色圆形徽记和 title；翻开（封面绕左边铰链向观众一侧转开） 露出内页三行字段 fields，每行右侧一个检查格（空 / 绿勾 / 红叉）。封面正面朝 +v（ | scale state title fields open fake checks | top center ground cover title fake page checks |
| 112 | `E13.container` | 集装箱 container — 一只等距集装箱：瓦楞钢板箱身（墨灰，tone "teal" 时青蓝），侧面（+v，看向观众）写 label； 两扇门在 −u 端（看得见的那一端；+u 端在等距视角里是背面），每扇门两根竖向锁杆，前门（靠观众 | scale state label open inside seal tone | top center ground label door seal inside |

## ep14/kit-ext/objects-ext.mjs（E14）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 113 | `E14.answerSheet` | 答题卡 answerSheet — 一张立在黑色小夹座上的答题卡：米白卡面、青蓝边框，顶部一条青蓝页眉（"答题卡"）；卡面 rows 行 × cols 个椭圆涂格，每行左侧写题号。 约 90×20×140（卡面 90×120，底座 z 0– | scale state rows cols filled blank mark title | top center ground rows mark extra |
| 114 | `E14.gradingMachine` | 阅卷机 / 验证器 gradingMachine — 一台桌面光学阅卷机：浅灰机身，后半是一道向前（+v）下斜的斜面顶，斜面上一道横向进卡口（fed 时露出卡片上沿）； 正面（+v）一块深色显示窗 + 一盏判定灯 + 一道出卡缝，前方一只出 | scale state lamp screen title fed | top center ground slot lamp tray scr plate |

## ep15/kit-ext/objects-ext.mjs（E15）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 115 | `E15.delegateTag` | 委托挂牌 delegateTag — 挂在 E02 addrPlate 立柱上的黄铜行李牌：上沿金属夹扣 + 一小段链子，牌面白底， 第一行小字 prefix（"0xef0100"），第二行"委托 →"，第三行 target（指向的合约名） | scale state target prefix on hang | top center ground clip text |
| 116 | `E15.gasPump` | Gas 加油机 gasPump — 加油站的加油机：水泥小底座 + 竖立的青蓝机身，顶上白色灯箱写 title（+v 面）， +v 面一块小屏显示代付金额、屏旁一盏状态灯，−u 面一扇竖向小窗露出"押金"液位；+v 面右侧挂一把油枪，软管从 | scale state title scr level | top center ground nozzle scr level title grip |

## ep16/kit-ext/objects-ext.mjs（E16）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 117 | `E16.finalitySignal` | 最终性信号柱 finalitySignal — 铁路信号柱：水泥小底座 + 墨色立杆，顶上黑色竖长信号头（正面朝 +v），自上而下三盏圆灯（带遮光檐）， 每盏灯右侧一块白底小铭牌写 labels（自上而下，默认 ["finalized"," | scale state labels lit | top center ground head lamps unsafe safe finalized plates |
| 118 | `E16.forkSwitch` | 道岔扳道器 forkSwitch — 铁路扳道器：水泥小基座上的铸铁机箱；正面（+v）前方一根长扳杆（红白相间握把），绕底部轴在 u-z 面里摆动； 机箱顶上立一块圆形方向牌（白底，正面朝 +v），一支箭头指向原链（右上，往 −v 的后方分 | scale state thrown labels | top center ground disc lamp lever branchA branchB root |

## ep17/kit-ext/objects-ext.mjs（E17）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 119 | `E17.viewWindow` | 看街的窗 viewWindow — 立在地上的一扇木窗：两根短木脚 + 木窗框 + 前伸的窗台，正面朝 +v；窗里不是玻璃而是一块屏幕： 浅色天空 + 一条灰色小街 + 三辆青蓝简笔小车，屏幕下沿一条细进度条；窗台前挂一块白底小牌（labe | scale state mode label | top center ground screen sill label lamp |
| 120 | `E17.peerPanel` | 对等连接插线板 peerPanel — 一块立式网络插线板：墨色金属立板装在小底座上，正面顶部一块白底小铭牌（label），下面一排 n 个网口， 每个网口插一根短线缆垂下、线缆末端一个圆形小标签（来源颜色）；立板顶上一盏状态灯。 约 16 | scale state n label mode anchorsOn colors lamp | top center ground ports tags lamp plate |

## ep20/kit-ext/objects-ext.mjs（E20）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 121 | `E20.dnsSignpost` | 域名路牌 dnsSignpost — 水泥小底座 + 墨色立杆（约 200 高），杆顶一块横向箭头牌（白底青蓝框，约 150×40，写 domain）， 杆身中部一块小方牌"DNS"（朝 +v，看向观众）。箭头牌绕立杆在水平面里转动：dir | scale state domain label dir | top tip tipFlip arm center ground dns pole |

## ep22/kit-ext/objects-ext.mjs（E22）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 122 | `E22.simCard` | SIM 卡 simCard — 一张立在黑色小夹座上的手机 SIM 卡（卡约 60×4×44，正面朝 +v 看向观众）：白色塑料卡身、右上角切一个斜角， 正面中间一块金色六格芯片（细线分格），芯片下方一行小字 label。stand:fal | scale state label stand tone | top center chip ground |
| 123 | `E22.wrench` | 扳手 wrench — 一把银灰色活动扳手斜靠在一块小木垫上（约 120×30×40，扳手在 u 方向的竖直面里，头朝 +u 抬起）： 开口端两颚（上面固定颚、下面活动颚）+ 调节螺纹轮，长柄末端一个挂孔，柄上压一圈深灰防滑纹。只是工具，不 | scale state | top center head ground |

## ep24/kit-ext/objects-ext.mjs（E24）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 124 | `E24.saltShaker` | 盐罐 saltShaker — 等距小盐罐（约 50×50×90）：透明玻璃圆柱罐身，里面白色细颗粒（点阵小圆）占约 2/3，顶上银色钢盖带 5 个小孔； 罐身正面贴一张米白小标签写 label（"盐 · 32 字节" 这类带 " · "  | scale state level label | top center ground spout label |

## ep26/kit-ext/objects-ext.mjs（E26）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 125 | `E26.faceMask` | 换脸面具 faceMask — 一只白色硬质半脸面具（额头到鼻尖，无五官细节：两个眼洞 + 一道浅色鼻梁高光）正对 +v（观众）， 立在墨色小托架上（底座 + 背后一根立杆）；面具背面是一层略大的墨色内壳，边缘露出一圈青蓝细电路纹（= "A | scale state label | top center ground mask plate |

## ep27/kit-ext/objects-ext.mjs（E27）

| # | 名称 | 说明 | 常用 opts | anchors |
|---|---|---|---|---|
| 126 | `E27.planeModel` | 模型飞机 planeModel — 一架白色等距小客机模型：机身沿 u（机头朝 +u），约 160×140×40（机身长 160、翼展 140、机身高约 26 + 垂尾）， 两侧后掠主翼 + 水平尾翼 + 垂直尾翼，机身两侧一条青蓝窗带、机 | scale state label | top center ground wingL wingR nose tail plate |
