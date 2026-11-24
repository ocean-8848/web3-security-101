# 返工说明：让每集成为独立的学习素材

频道主 2026-11-15 的新要求：视频要能独立存在，作为单独的学习素材。

## 规则

1. 画面里不出现"手册""本书"这类说法，也不出现"第 N 章 / 第 N 节 / 第 N 集"。
2. 不写编号。结束卡、标题卡、胶囊、预告都只写主题名。例如：
   - "第 29 章 · 签名路径" 改成 "签名路径"。
   - "下一集 · 06 算术与精度" 改成 "下一集 · 算术与精度"。
3. 来源标签直接写原始来源的类型，不再指向手册的章节：
   - 可用的类型：官方复盘、项目方称、公开报道、第三方分析、监管口径、示例、解读、比喻。
   - 例如："手册 6.1 节" 改成 "公开报道"；"手册第 12 章复盘" 改成 "公开复盘"；"手册引 TRON 官方开发文档" 改成 "TRON 官方文档"；"本手册示例架构 · 不是任何交易所公布的方案" 改成 "示例架构 · 不是任何交易所公布的方案"；"截至手册核对日" 改成 "截至 2026 年 11 月"。
   - 判断不了原始来源时，写最保守的"公开资料"。
4. 结束卡写本集主题名（以 script.json 的 title 为准，去掉其中的编号）。结束卡上原来"细节都在手册第 NN 章"的位置，改为本集一句收束，与最后一句配音同义即可；下面一行写"下一集 · <主题名>"。
5. 讲稿里物件名中的"手册"不是指书，保留，例如 ep03 的"规程手册"。

## 已完成的部分（不用重做）

讲稿已经改写，改过的句子已重新配音，新录音不慢于原速，句尾补静音，时间轴不变。各段工程里的 `assets/narration.wav`、`timing.json`、`compositions/captions.html` 都已更新为新版本。

## 要你做的

1. 用 grep 找出本集各段画面源码（`segN/src/*`、`segN/compositions/story.html`）里所有的"手册"、`第\s*\d+\s*[章节集]`、"下一集 · 数字"，按上面的规则改。
2. 重新生成每个改过的段（`node src/build-story.mjs`）。如果段时长有变化（以 `timing.json` 的 `total` 为准），确保 `index.html` 和 `story.html` 的时长与它一致；结束卡最后约 2.5 秒保持静止。
3. 重新渲染两类段：一是画面改过的段，二是下面清单里配音或字幕改过的段（字幕是烧进画面的）。命令是 `npx hyperframes render -o renders/<seg>.mp4`，然后复制到 `out/<seg>.mp4`。
4. 每段渲染前，在改动处和结束卡各抽一帧确认；`npx hyperframes check` 不能有 error。
5. 全部段完成后，在 `hf/` 目录运行 `python3 tools/concat.py epNN`，得到新的 `out/epNN-full.mp4` 和 `.srt`。再用 `grep -c "手册" out/epNN-full.srt` 确认结果为 0，并抽完整版的结束卡帧确认。
6. 最后做 720p 预览：
   ```
   ffmpeg -y -i out/epNN-full.mp4 -vf scale=1280:720 -c:v libx264 -preset slow -b:v 270k -maxrate 400k -bufsize 800k -c:a aac -b:a 64k -ac 1 -movflags +faststart out/epNN-full-preview-720p.mp4
   ```
   预览不能超过 30 MB。

## 各集配音和字幕改过的段（必须重新渲染）

- ep01：seg1、seg2、seg3、seg5、seg6
- ep02：seg2、seg5、seg6
- ep03：seg4、seg5b
- ep04：seg2、seg4、seg5b
- ep05：seg2、seg3、seg5a、seg5b
- ep06：seg2、seg5a、seg5b
- ep29：seg5a、seg5b（流程特殊，见专门说明）

只改本集目录。不改 kit/ 和其他集，不提交 git。
