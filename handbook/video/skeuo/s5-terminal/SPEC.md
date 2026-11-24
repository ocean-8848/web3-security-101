# SPEC · s5-terminal（终端 / 代码拆解）

GOAL:    看完的人记住一件事：钥匙没丢，丢的是"签下去的那份文件"——`operation = 1` 这一个字段，断在第 ④ 关「显示与解码」。
OUTPUT:  HyperFrames，1920 × 1080，30 fps
TIME:    47.16 s × 30 = 1415 帧；无音乐，配音为时钟（timing.json）

LOOK:
- 桌面底 `#e9e6df`，平涂无纹理、无暗角。
- 终端窗口：left 135 / top 40 / 1650 × 842 px（86% × 78%），圆角 14 px，底边 y = 882（< 900，字幕区始终在浅色桌面上）。
  投影 `0 28px 60px rgba(60,50,35,.20)` + `0 4px 14px rgba(60,50,35,.10)`。
  标题栏 56 px，`#dcd9d3`，下边线 1 px `#c4c0b8`，标题 "verify-safe-tx — zsh"，Inter 400 28 px `#55524c`，居中；不画红黄绿圆点、无角标。
- 终端内：底 `#15171c`；前景 `#d8dde6`；注释 / 键名 / 提示符 `#7d8594`；强调值 `#ffffff` 700；
  琥珀 `#ffb020` 只给 `+ operation: 1 (DELEGATECALL)` 和第 ④ 关；危险红 `#ff5a4f` 只给 diff 删除行与"攻击者合约"。
- 终端字：JetBrains Mono 38 px / 行高 54 px（字宽 22.8 px），中文回退 Noto Sans SC；关闭连字。内边距 44 px（左右）、30 px（上）。
- 签名路径框：Noto Sans SC 500 32 px，框高 76 px，2 px 描边，圆角 6 px；未点亮 `#4a505c`/`#7d8594`，点亮 `#d8dde6`，④ 反显琥珀底 + `#15171c` 字。
- 桌面大标题：Noto Sans SC 900 168 px `#1a1a1a`；副标签 JetBrains Mono 32 px `#6b675f`；✓/✗ 为 128 px SVG 描边 13 px（✓ 墨色，✗ `#ff5a4f`）。
- 片头卡：主标题 Noto Sans SC 900 156 px `#1a1a1a`，左 230 / 上 330；副标题 Noto Sans SC 500 52 px `#4d4a44`。
- 字幕：Noto Sans SC 700 46 px `#1a1a1a`，无底色，bottom 84 px。

OBJECTS: 一个真实感的终端窗口（标题栏 + 提示符 `$` + 方块光标）；教学用脚本 `./verify.sh <子命令>`（incident / check-keys / show --ui / decode --raw / trace storage / path），不冒充真实 CLI；unified diff（`---`/`+++`/`-`/`+`）；存储槽 `slot[0] implementation`；七段方框签名路径。地址一律 `0x…` 并标「示例」。

MOTION:
- 打字：0.03 s / 字符，`steps(n)` 的 clip-path 揭示，光标同步 `steps(n)` 平移。
- 输出：整行瞬时出现，相邻行间隔 0.05 s（无淡入、无上滑）。
- 光标：闪烁周期 1.0 s（0.5 亮 / 0.5 灭），由时间线逐段 `set` 生成，无 repeat；打字时常亮，命令执行中隐藏。
- 清屏：瞬切（Ctrl+L 语义），不交叉淡化。
- 窗口推近（高潮）：scale 1 → 1.08，origin 50% 92%，0.7 s `power3.inOut`；拉回同参数。
- 窗口缩到左侧：x −470、scale 0.5，0.7 s `power3.inOut`；回位同参数。
- 桌面标题：逐字瞬现 0.035 s / 字；✓/✗ scale 0.6 → 1 + opacity，0.25 s `expo.out`；离场 blur 8 px + 透明 0.2 s `power2.in`。
- 窗口退场：opacity 0 + scale 0.97，0.35 s `power3.in`。

SHOTS（秒 / 帧）:
1. 0–13.55（0–406）屏 A：第 0 帧 `# 2025-02-21` + 闪烁光标；Bybit@2.46、以太坊冷钱包@3.60 依次补上；4.30 打 `incident`；5.23 `loss ≈ 1.5B USD` + `# FBI 口径 · 事发时估值`；6.75 打 `check-keys`；7.53 `private keys`、8.68 `NOT leaked`；9.56 注释；10.25/10.85/11.45 三行 `✓ signer confirmed` + `…`（人数从略）；12.48 `policy threshold met ✓`。
2. 13.55–17.30（406–519）屏 B：`show --ui`；14.40 type token transfer / operation 0 (CALL) / to 0x…（示例）；16.09 `verdict 普通转账 ✓`。
3. 17.30–23.95（519–718）屏 C：`decode --raw`；18.30 to 攻击者合约 / data transfer(address,uint256)；20.08 diff 头 + `- operation: 0 (CALL)`（红）；20.25–20.82 光标在空行闪烁 = 停顿 0.57 s；**20.82 `+ operation: 1 (DELEGATECALL)` 琥珀 + 窗口推近 1.08 + 其余行压暗到 0.32**；21.85 数字 1 琥珀反显；22.15 `# 正常转账是 0 = CALL`；23.10 拉回。
4. 23.95–30.55（718–916）屏 D：`trace storage`；24.90 注释；26.07 code 攻击者合约 / storage Safe 代理；27.00 参数写进 slot[0]；27.77 `slot[0] implementation SafeImpl`；28.63 SafeImpl 划掉 → 攻击者合约（0x… 示例）。
5. 30.55–37.10（916–1113）窗口缩到左；31.40「钥匙」+ private keys · 未泄露；32.53 ✓；33.81「文件」+ signed payload · 被换掉；35.43 ✗（红）；36.95 标题模糊离场。
6. 37.10–43.60（1113–1308）窗口回位，屏 F：`path`；39.58 注释 + 七个空框（只有编号）；41.13→41.97 七段标签逐一点亮（0.14 s 间隔）；42.36 ④ 琥珀反显 + `↑ Bybit 断在这里`。
7. 43.60–47.16（1308–1415）清屏 → 窗口退场 43.62–43.97 → 44.00 主标题逐字、44.38 副标题逐字；44.59 起完全静止（2.57 s）。

BANNED: 深色虚空漂浮小元素；发光/霓虹/粒子；紫蓝渐变；玻璃卡；三卡并排；所有元素淡入上滑；标题落定后漂移；窗口红黄绿圆点与角标/HUD；代码连字；repeat:-1；伪装成真实 CLI；真实地址/哈希/签名人数/ETH 数量。

QA: 3 s 日期 + Bybit 已在；10 s 签名确认行；16 s 普通转账；21.5 s 琥珀行 + 推近（最强时刻）；27 s storage 追踪；35 s 钥匙✓/文件；41 s 七段框点亮中；46 s 片头卡静止。窗口底边全片 < 900 px（推近时 ≈ 887）。
