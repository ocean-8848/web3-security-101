#!/usr/bin/env python3
"""扫描讲稿里的多音字，列出每处上下文，供人工判断要不要加进 pron.json。
用法：python3 tools/polyphone_scan.py <章节目录>
已被 pron.json 覆盖的位置标 ✓；其余标 ?，逐个判断：配音引擎在这个词里会不会读错。
常见易错：助词"地"（地址的地不算）、了（liǎo）、得（děi）、行（háng）、长（zhǎng）、重（chóng）、
还（huán）、调（diào）、处（chǔ）、为（wèi）、角（jué）、待（dāi）、校（jiào）、量（liáng）、
数（shǔ）、发（fà）、种（zhòng）、相（xiàng）、应（yīng）、空（kòng）、几（jī）、模（mú）、
供（gòng）、累（lěi）、度（duó）、薄（bó）、强（qiǎng）、便（pián）、传（zhuàn）、差（chā/chāi）。
"""
import json, os, re, sys

POLY = "地得行长重还调处为角待校量数发种相应空几模供累度薄强便传差参曾朝落背解散冲称露难乐率卡"
# 这些字绝大多数读常见音，只在下列写法里才有风险
PATTERNS = ["不了", "得了", "了解", "了结", "了然", "着急", "着火", "着手", "着陆", "着凉", "只身", "转动", "中奖", "中毒", "结实"]
# 试听用的高风险词：这些写法里的多音字常被读成另一个音
RISK = [r"[\u4e00-\u9fff]{1,3}地[，、 ]", r"地(?=[看说做把将让去来被]|签|执行|检查|运行|处理)", "不了", "了结", "行业", "银行", "一行", "这一行", "每一行", "行情",
        "重新", "重放", "重入", "重签", "重复", "重组", "重算", "重建", "归还", "还款", "偿还", "调用", "调度", "调取", "调查", "调整",
        "处理", "处于", "处置", "为.{0,6}签名", "为空", "为零", "角色", "待在", "校验", "校对", "数一数", "增长", "成长", "长大",
        "测量", "相机", "真相", "应当", "空闲", "填空", "着急", "着手", "背负", "冲着", "曾经", "朝向", "落下", "难民", "率领",
        "卡住", "卡在", "供给", "供应", "累计", "积累", "种植", "揣度", "薄弱", "差事", "出差", "传记", "便宜", "降服", "投降",
        "散开", "解送", "参差", "模样", "几乎", "强迫", "勉强", "倔强"]
SAFE = ["地址", "地方", "地位", "本地", "地图", "地区", "目的地", "了解", "觉得", "得到", "获得", "行为", "执行", "运行",
        "进行", "交易所", "长期", "重要", "重点", "严重", "还是", "还有", "还没", "强大", "强制", "数据", "数量", "参数",
        "发生", "发送", "发布", "开发", "发现", "种类", "相同", "相关", "相信", "响应", "应该", "对应", "应用", "空间",
        "传输", "传递", "差异", "中心", "中间", "其中", "背后", "结果", "结构", "解析", "解释", "解码", "冲突", "转账",
        "转移", "盖章", "系统", "关系", "都是", "都会", "只是", "只有", "泄露", "困难", "难度", "处于",
        "数字", "待签", "还要", "还在", "发到", "发一", "重新", "锁得", "签发", "季度", "为什么", "因为", "以为", "作为",
        "成为", "认为", "特别强", "强调", "还能", "发出", "发起", "长度", "得出", "记得", "值得", "使得", "相比", "应对", "空白"]
if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    chdir = os.path.abspath(sys.argv[1])
    pairs = json.load(open(os.path.join(here, "pron.json")))["pairs"]
    if os.path.exists(os.path.join(chdir, "pron.json")):
        pairs += json.load(open(os.path.join(chdir, "pron.json")))["pairs"]
    S = json.load(open(os.path.join(chdir, "script.json")))
    for seg in S["segments"]:
        for i, line in enumerate(seg["lines"]):
            cover = [(m.start(), m.end()) for a, _ in pairs for m in re.finditer(re.escape(a), line)]
            safe = [(m.start(), m.end()) for w in SAFE for m in re.finditer(w, line)]
            hits = []
            for m in list(re.finditer(f"[{POLY}]", line)) + [m for w in PATTERNS for m in re.finditer(w, line)]:
                k = m.start()
                if any(a <= k < b for a, b in safe):
                    continue
                mark = "✓" if any(a <= k < b for a, b in cover) else "?"
                hits.append(f"{mark}「{line[max(0, k - 4):k + 4]}」")
            if hits:
                print(f"{seg['id']} L{i}: " + "  ".join(hits))
