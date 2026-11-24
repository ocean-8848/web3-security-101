# 拟物化讲解幻灯片：写 deck.json（每章一个）

背景：学习站要给主线每章一套「活的」幻灯片。幻灯片直接复用该章讲解视频的分段动画页：每页先播放一段动画，再停在结论画面；画面旁边显示标题和要点，旁白自动放进讲稿。你的工作是为分到的每一集写 `epNN/deck.json`，生成并自审。

工作目录：/Users/k/Workon/Learning/web3/web3-security-101/handbook/video/skeuo

## 先读
- 样例（已发布，照它的口径写）：`ep11/deck.json`
- 每集输入：`epNN/script.json`（title、segments）和 `epNN/timing/<segId>.json` 的 `lines`（text、start、speechEnd）。打印行表：
  `python3 -c "import json,glob;e='ep12';[print(f.split('/')[-1], i, round(l['start'],1), l['text']) for f in sorted(glob.glob(e+'/timing/seg*.json')) for i,l in enumerate(json.load(open(f))['lines'])]"`

## deck.json 规则
- 结构：`{"chapter": "sNN", "title": <script.json 的 title>, "slides": [{"seg": 1, "lines": [a, b], "title": "...", "points": ["..."]}]}`。ep29 的分段 id 是字符串（"3a"、"5b"），seg 就写字符串；其他集写数字。
- 全章 25–35 页。每页 = 同一分段里连续的 1–6 行旁白。每个分段的行从 0 到最后一行按顺序全部覆盖，不重不漏。唯一例外：末段最后一行若是「下一集讲……」，不收（最后一页止于它前一行）。
- 页标题 ≤14 字，说出这一页的结论或主题；要点 ≤3 条，每条 ≤40 字，句末不加句号。
- 内容只来自旁白，不加新事实。保留口径：「按 X 报道/分析」写成「（X）」或「X 称」；金额保留「约」。
- 「先猜一道题」这类提问单独成页，答案放下一页，保留悬念。
- 一页的画面 = 下一页首行开始前 0.45 秒的动画状态（分段最后一页 = 段尾）。所以分页点要落在画面「停稳、有内容」的地方。

## 生成与自审（每集）
1. `python3 tools/make_deck.py epNN`
2. `python3 tools/deck_sheet.py epNN /private/tmp/claude-501/-Users-k-Workon-Learning-web3/617485c0-3896-485e-a51f-8b3b7c57dd4d/scratchpad/sheet-epNN.jpg`，用 Read 看这一张联系表（每行 6 张，按页序）。
3. 逐格查：画面与该页标题对得上；不是镜头移动中的空场、纯背景或只剩标题卡（全章最后一页停在收束标题卡可以接受）。不合格就调整分页（与相邻页合并，或换分页点），重新生成，最多再看 1 次。
4. 每集看图 ≤2 张。

## 禁止
- 只改你分到的 `epNN/deck.json`；不改 tools/、其他集、学习站、手册源。
- 不跑 `make_deck.py --fonts`，不构建学习站，不发布，不 git 提交，不用 pkill/killall。

## 回报（简短）
每集：页数、调整过哪些页、仍有的疑点。
