# 视频系列：Web3 安全学习视频（三套风格）

> 来源：《Web3 安全学习手册》主线 01–30 章、评估篇 A01–A11、链专题 C00–C03。
> **观看**：用浏览器打开 [index.html](index.html)（选集播放器，`tools/make-player.mjs` 生成）。左侧按篇目选章，每章可在下面几种方式之间切换：
>
> | 方式 | 内容 | 位置 | 覆盖 |
> |---|---|---|---|
> | 视频 · 拟物化 | 等距实物世界，8–12 分钟 | 源工程 [skeuo/](skeuo/PIPELINE.md)，成片 `skeuo/epNN/out/epNN-full.mp4` | 主线 30 集 |
> | 视频 · 3b1b | 深色图形推演，5–8 分钟 | 源工程 [3b1b/](3b1b/README.md)，成片 `3b1b/output/EPNN-*.mp4` | 主线 30 集 |
> | 视频 · 讲解页 | 讲师白板课，9–15 分钟 | 讲解页 `slides/`，成片 `output/` | 主线 13 集 + 评估篇 10 集 + 链专题 4 集（尚未渲染） |
> | 幻灯 · 讲解页 | 上面讲解页的可翻页版，讲稿逐句同步、可自动翻页 | `slides/*.html` | 同上 |
> | 幻灯 · 拟物化 / 3b1b | 两套知识讲解幻灯 | `../decks/skeuomorphic/chNN/`、`../decks/3b1b/chNN.html` | 主线 30 章 |
>
> MP4 / 字幕 / 字体不进 git（见仓库根目录 `.gitignore`），放在主 checkout 的同一路径下。新出片或新增幻灯后，运行 `node tools/make-player.mjs` 刷新 index.html，播放器会自动识别哪些成片存在。双击 `index.html` 即可离线打开；用本地服务器打开时，服务器需要支持 HTTP Range，视频才能拖动进度。
>
> 编号：所有系列都用手册现行章号。讲解页主线原为 EP01–EP13（旧手册编号），已改为 EP01、EP03–EP12、EP27、EP28，与章号一致（例如 EP04 = 第 04 章 重入）。

## 1. 剧集表

### 评估篇（A 系列，10 集）：把"懂漏洞"变成"能做评估"

| 集 | 标题 | 来源 | 交互实验 / 模板 |
|---|---|---|---|
| A01 | 安全评估方法论：从接单到签字 | assessment/A01 | T01、T02、T04 |
| A02 | 风险评级与报告：把发现变成决策依据 | assessment/A02 | severity-calculator、T03 |
| A03 | 交易所自有合约与钱包评估 | assessment/A03 | T04 |
| A04 | DeFi 协议评估：按协议类型下手 | assessment/A04 | oracle-manipulation-lab、vault-inflation-lab |
| A05 | 上币与合作项目尽调 | assessment/A05 | listing-scorecard、T05 |
| A06 | 运营与密钥安全：代码之外的战场 | assessment/A06 | incident-explorer |
| A07 | 外部审计与漏洞赏金管理 | assessment/A07 | T01 |
| A08 | 事故分析与防御性验证 | assessment/A08 | incident-explorer |
| A09 | 应急响应：评估之后，出事了怎么办 | assessment/A09 | T04 |
| A10 | 实例分析：钱包里的 Audit 页是怎么来的 | assessment/A10 | listing-scorecard |

### 主线（EP 系列，13 集，EP 号 = 手册章号）：漏洞机制与防御

| 集 | 标题 | 来源 | 交互实验 |
|---|---|---|---|
| EP01 | 合约安全全景：为什么代码就是金库 | 01 | incident-explorer |
| EP03 | EVM 与 Solidity 安全基础：先看懂这台机器 | 03 | storage-proxy-lab |
| EP04 | 重入攻击：在你记账之前再取一次钱 | 04 | reentrancy-lab |
| EP05 | 访问控制与权限：谁有权按这个按钮 | 05 | storage-proxy-lab |
| EP06 | 算术与精度：差一个 wei，丢一个金库 | 06 | vault-inflation-lab |
| EP07 | 外部调用与代币兼容性：对方未必按标准出牌 | 07 | chain-porting-lab |
| EP08 | 预言机与闪电贷：一笔交易就能改写的价格 | 08 | oracle-manipulation-lab |
| EP09 | MEV 与签名安全：顺序可以被买，签名可以被重放 | 09 | signature-replay-lab |
| EP10 | 可升级合约与代理：维修门的两面 | 10 | storage-proxy-lab |
| EP11 | DeFi 经济安全：代码没错，规则错了 | 11 | oracle-manipulation-lab |
| EP12 | 跨链桥安全：两条链之间的那条缝 | 12 | signature-replay-lab |
| EP27 | 审计、测试与开发流程：把安全写进流水线 | 27 | chain-porting-lab |
| EP28 | 事故案例库：同样的错误，换个名字再来一次 | 28 | incident-explorer |

### 链专题（C 系列，4 集）

| 集 | 标题 | 来源 | 交互实验 |
|---|---|---|---|
| C00 | 以太坊专题：合约案例深潜 | chains/C00 | reentrancy-lab、incident-explorer |
| C01 | BNB Chain 专题：我以为一样的地方 | chains/C01 | chain-porting-lab |
| C02 | TRON 专题：能跑 Solidity，但 TVM 不是 EVM | chains/C02 | chain-porting-lab |
| C03 | Mantle 专题：以太坊 L2 视角 | chains/C03 | chain-porting-lab |

推荐观看顺序（安全评估负责人）：EP01 → EP04–EP12 → A01 → A02 → 按对象选 A03 / A04 / A05 → A06–A10 → C00–C03。

## 2. 讲解风格（技术教学）

沿用 CEX 视频系列的风格，内容口径沿用手册的 [WRITING-GUIDE](../docs/WRITING-GUIDE.md)：

- **讲师口吻**：像一位资深安全工程师在白板前讲课。用"我们""来看""注意这里"。
- **先问题，后机制**：每个知识点先抛出一个具体问题，再拆机制和代码。
- **具体数字推演**：每集至少 2 次用具体数值一步步算（例如金库份额被舍入为 0）。数字标"示例"。
- **一句话一件事**：口播句子短，口语化。
- **比喻要准**：比喻之后立刻回到真实机制，并说明比喻在哪里不成立。
- **事实口径**：公开事实 / 业界通用做法 / 示例。事故金额为事发时美元估值约数。
- **只讲防御**：讲漏洞机制、根因和修复，不演示针对真实合约的攻击步骤。

## 3. 动画讲解页写法

- 播放器与基础样式：`slides/assets/player.css`、`player.js`（与 CEX 系列相同，仅补了 Linux 字体回退）。
- 合约系列共用组件：`slides/assets/contract.css`（源码逐行高亮 `.src .ln`、对比栏 `.vs`、步骤卡 `.steps`、印章 `.stamp` 等）和 `slides/assets/kit.js`（SVG 绘图助手 `K.box / K.arrow`，通用步进函数 `marks`、`rowStep`）。
- 每个 `<section class="scene" data-title="...">` 是一个场景，`data-title` 会成为视频章节名。场景末尾 `<ol class="say">` 的每个 `<li>` 是一步口播。
- 画面元素：`data-step="k"` 第 k 步出现；`data-k="k"`（配合 `data-onstep="marks"`）第 k 步之前变暗、第 k 步高亮；`data-show="a-b"` 只在第 a–b 步显示。
- 浏览器打开讲解页：→ 键逐步播放，N 键显示讲稿。

## 4. 渲染

**不需要 key 的做法（推荐）**：微软免费"云希"语音（edge-tts，和 CEX 系列同一个声音），用 CEX 样音 `voice-samples/D-yunxi-lively.mp3` 的设定（语速 +5%、音调 +3Hz），再逐句变化语速、音调、音量。改基准：`EDGE_RATE=+0% EDGE_PITCH=+0Hz ./render-edge.sh`；关掉逐句变化：`EDGE_PROSODY=0`。**最简单：在访达里双击 `video/渲染视频.command`**（会打开终端窗口，自动安装缺的依赖并渲染全部 27 集，约 3 小时；中途关掉，再次双击会跳过已完成的集）。也可以在终端执行：

```bash
cd handbook/video/tools && ./render-edge.sh EP04   # 先渲染一集试听（约 10 分钟）
./render-edge.sh                                                        # 全部 27 集，3 集并行
```

依赖：Node.js、Google Chrome、`brew install ffmpeg`；脚本会自动安装 edge-tts 和 playwright-core。需要联网。

**有 Azure key 时**：用云希 HD（`zh-CN-Yunxi:DragonHDFlashLatestNeural`，chat 风格，语调更像真人）：

```bash
export AZURE_SPEECH_KEY=<你的 key>  AZURE_SPEECH_REGION=southeastasia   # HD Flash 可用区域：eastus / westeurope / southeastasia
./render-azure.sh --audition   # 先试听：output/audition/ 下 6 段样音
./render-azure.sh              # 全部 27 集
```

**怎样做出"轻重缓急"**（`tools/azure_ssml.mjs`）：

| 句子类型 | 判断依据 | Azure HD 云希的风格 | edge / 标准云希：语速、音调、音量 |
|---|---|---|---|
| 开场、小结 | 第 1 句、最后一个场景 | cheerful（明快） | 音调 +2~4% |
| 普通讲解（约 75%） | 其他 | chat（口语、活泼） | 语速 +3% |
| 提问 | 以"？/吗/呢"结尾 | chat | 音调 +7%，句尾上扬 |
| 提醒 | 注意、千万、必须、不要、红线…… | strict（加重） | 语速 −8%，音调 −3% |
| 结论 | 记住、一句话、本质上、结论……或 7 字以内短句 | news（沉稳） | 语速 −10% |
| 数字多的句子 | 4 个以上数字 | news（放慢、咬字清楚） | 语速 −6% |
| 举例、插话 | 比如、打个比方、其实…… | chat | 语速 +8% |

- 停顿按标点：逗号处 0.16 秒，句号 0.36 秒，问号 0.55 秒；画面换步再加 0.42 秒，换场景再加 0.45 秒。冒号后插入 220 毫秒停顿。
- 风格切换觉得太跳：`AZURE_TTS_PROFILE=chat`（全程 chat，只靠停顿和 HD 模型自身语调）；想更稳：`news`。
- 换声音：`AZURE_TTS_VOICE=zh-CN-YunxiNeural`（标准版，支持语速 / 音调细调）。`node azure_ssml.mjs --voices yunxi` 列出你的区域可用的云希声音和风格。
- HD 声音不支持 `<prosody>`，语调由模型根据文字和风格自己决定；如果某个标签被拒绝，脚本自动退回更简单的 SSML 重试。

**其他引擎：**

| 引擎 | 声音 | 依赖 | 说明 |
|---|---|---|---|
| `azure` | 云希 HD（默认），可换任意 Azure 声音 | `AZURE_SPEECH_KEY`、`AZURE_SPEECH_REGION`，需联网 | 推荐，见上 |
| `edge` | 微软"云希" `zh-CN-YunxiNeural` | `pip install edge-tts`，需联网 | 与 CEX 视频系列同一声音，无风格控制 |
| `kokoro` | Kokoro v1.1-zh 男声（说话人 90） | `pip install sherpa-onnx soundfile cn2an` + 模型，设 `KOKORO_DIR` | 完全离线，语调较平 |
| `say` | macOS 自带，如 `Tingting` | macOS | 离线备选 |

```bash
node render.mjs ../slides/EP04-reentrancy.html --engine edge     # 单集，任意引擎
./render-all.sh "" --engine kokoro                                # 全部，任意引擎
```

输出到 `video/output/`：`*.mp4`（H.264 1080p 15fps，AAC 配音，响度统一到 −16 LUFS，内嵌软字幕和章节）+ `*.srt`。

- Chrome：默认用本机 Google Chrome；Linux 上可设 `CHROME_PATH=/path/to/chromium`。
- 画面字幕：渲染时逐句叠加在画面底部（硬字幕），同时内嵌软字幕轨。
- 想换成真人配音：用 `.srt` 或 `scripts/*.md` 作为提词稿录音，替换音轨即可。

## 5. 口播稿

`scripts/*.md` 由讲解页自动导出（`node tools/export-scripts.mjs`），包含每个场景的口播全文和对应画面步骤，可直接作为真人录制的提词稿。
