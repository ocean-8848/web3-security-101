# SPEC · ep05 / seg1「① 没人初始化」

GOAL:    看完能说出"Parity 库合约部署后没人初始化，任何人调用初始化就成了 owner，再调用 kill，依赖它的钱包约 51 万 ETH 被冻结；攻击者没破解任何东西"。
OUTPUT:  HyperFrames，1920 × 1080，30 fps
TIME:    45.54 s；配音是时钟（L0 从 1.6 s 开始），无音乐。源：`src/build-story.mjs` → `compositions/story.html`（`node src/build-story.mjs`）。

## 世界坐标（本集固定，seg2 起对齐它）

常量全部在 `src/layout.mjs`，后面各段直接 `import { … } from "../../seg1/src/layout.mjs"`。投影与 kit 相同：`Wp(u,v,z) = (u·0.819 + v·0.574, −u·0.287 + v·0.410 − z·0.866)`。主合约机器在世界原点。

| 东西 | 世界 (u, v) | 备注 |
| --- | --- | --- |
| 主合约机器（ep03 `contractMachine`，name "APP"） | MAIN (0, 0) | 220×200，含齿轮高约 260 |
| 主按钮台（ep05 `funcPanel`，5 键） | MAIN_PANEL (0, 300) | 568×170，后沿高 150；btn 0..4 = mint / initialize / kill / upgrade / pause |
| Parity 库合约（`contractMachine` name "LIB"，屏显 owner: 0x0） | LIB (−1180, −930) | ≈ 屏幕地面 G(−1500, −40) |
| 库合约按钮台（`funcPanel` 2 键） | LIB_PANEL (−1180, −630) | btn 0 initialize（guard none，L9 起 broken），btn 1 kill（guard card） |
| 依赖钱包（kit `hotWallet` ×3，id w0..w2） | (−1520 / −1790 / −2060, −930) | 正面朝 +v；冰封罩 `iceShell` box `ICE_BOX` |
| delegatecall 管道（ep01 `pipe`） | 立管 z 232→300；总管 z 300 沿 v = −930，到 u = LIB.u−150 落到 z 170，接库合约 −u 面 | id pm（总管）、pr0、pr1（立管） |
| 普通用户（kit `person` signer） | LIB_USER (−1450, −585) | 站在按钮台 −u 端、initialize 旁；手持 owner 门卡（`keycard` owner ×1.5，z 96） |
| 挂锁 / 钥匙（kit `padlock` / `key`） | (−1600, −470) / (−1470, −400) | L8 出场 |
| 建议：用户侧（管理员 + 笔记本） | USER_ZONE (−2510, −1120) | seg2 L16 起 |
| 建议：TRON 街区 | TRON_ZONE (1300, 1200) | seg4 |
| 建议：钥匙管理处 | KEYS_ZONE (940, −905) | seg5a |
| 建议：桥 | BRIDGE_ZONE (2260, −615) | seg5a |

镜头用 `fit(世界包围盒点, 屏幕矩形)` 自动取景（见 build-story `CAMS`）：open0/open1（库 + 钱包）→ user k1.25 → wide k1.03 → panel k1.35 → kill k1.27 → wal k1.02 → ice k≈0.95（世界在左，点阵卡在右）→ safe k1.6 → key k1.65 → far k0.71 → main k1.21（主按钮台在右，大字在左）。

段尾状态（seg2 起手可接）：镜头 main；主机器 + 5 键按钮台，按钮上方 5 个墨色问号；左上大字"访问控制""谁有权按这个按钮？"。Parity 角落停在：库合约 broken（红虚线框 + 红叉）、3 个钱包冰封、initialize 护罩位红虚线、kill 读卡器绿灯、用户持 owner 卡、挂锁和钥匙在地上。

## LOOK

- 第 0 节风格；L0–L1 叠一层 #1d2333 夜色（最高 0.22），L2 结束前退回纸色。
- 颜色：红 = 销毁 / 没有权限检查 / "冻结"字 / 失去代码逻辑；绿 = 只认 owner、破解：无、私钥：未被盗；青蓝 = 中性标签、管道流动；冰封点 = 淡冰蓝（不用红，冻结 ≠ 被盗）；墨 = owner 门卡、问号。
- 字：标签 32 px（lab-sm 28 px），点阵卡大字 60 px，关键词 112 px，结尾问句 76 px，标题卡 92/40 px。

## SHOTS

0–1.6 标题卡压在 Parity 角落，1.25 s 飞向胶囊 · L0 左上"2017 年 11 月 · 以太坊"，管道流动、齿轮转，"库合约 · Library" · L1 按钮台长出（台面落灰），普通用户长出，`initialize()` 标签 · L2 拉开，"Parity 多签钱包""共用同一份代码"，三根管道和钱包灯依次闪 · L3 推近，"owner = 空"，"部署后从未初始化" · L4 按下 initialize，灰尘散开，"owner = 这名用户"，owner 门卡从库合约飞到用户手上 · L5 kill 读卡器刷卡变绿（"只认 owner"），按下 kill，库合约 broken + 灰色烟团，"库合约已销毁"（关键画面）· L6 管道流动从库合约往外依次熄灭，钱包灯变灰，"失去代码逻辑" · L7 三个钱包自下而上冰封，右侧点阵卡"约 51 万 ETH · 冻结"，51 点（最后一点半透明），"1 点 = 1 万 ETH""口径 · Parity 复盘" · L8 挂锁、钥匙长出，"破解：无""私钥：未被盗" · L9 initialize 护罩位变红虚线空位，"没有权限检查"，kill 旁"只认 owner"（关键画面：完好的钥匙 vs 裸按钮）· L10 镜头拉远右移到中区，主机器 + 5 键按钮台长出，"访问控制 / Access Control" · L11 五个问号依次弹出，"谁有权按这个按钮？"，段尾静止约 1 s。

BANNED：黄色荧光笔；屏幕念字幕；地址、哈希、人数等讲稿外事实；冰封用红色。
