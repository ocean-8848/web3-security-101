#!/usr/bin/env python3
"""B80 第 4 步参考实现：检查你写的复市计划与对外公告是否"够格"。不看措辞，只查结构与数字。

  python3 code/offchain-ops/solutions/b80/plan_check.py plan my_b80/plan.md
  python3 code/offchain-ops/solutions/b80/plan_check.py announce my_b80/announcement.md

plan（分阶段复市计划）：
  P1 四个阶段（仅撤单、仅平仓、限价交易、全面交易）都有，并且按这个顺序出现
  P2 每个阶段小节（### 开头，标题含阶段名）都写了 门槛、观察、授权、回退，并且门槛里至少有一个数字
  P3 引用了至少 4 个本章算出的数字（见 KEY_NUMBERS）
  P4 写明了"谁批"：出现 指挥官、风控、合规、业务负责人 至少两个角色
announce（对外公告）：
  A1 说明了时间：窗口 14:07 与 14:09（UTC），以及复市分阶段的时间或条件
  A2 说明了范围：BTC-USDT、ETH-USDT、QRS-PERP；账户数 31 或 24 或 8
  A3 说明了做了什么：冲销、ADL、保险基金，三个词都出现
  A4 说明了用户该做什么 / 去哪问：出现 "撤单" 与 "联系" 或 "客服"
  A5 没有未证实的说法：不得出现 黑客、被盗、攻击、完全恢复、保证、不会再发生
  A6 长度 150–900 个字符
"""
import re
import sys

KEY_NUMBERS = ["16", "67409.72", "54703.78", "56", "47516.65", "38853.48", "35625.64", "178985.13", "15"]
STAGES = ["仅撤单", "仅平仓", "限价交易", "全面交易"]


def has_num(text, n):
    plain = text.replace(",", "")
    return re.search(r"(?<![\d.])" + re.escape(n) + r"(?![\d])", plain) is not None


def check_plan(t):
    res = []
    pos = [t.find(s) for s in STAGES]
    res.append(("P1 四个阶段按顺序出现", all(p >= 0 for p in pos) and pos == sorted(pos)))
    secs = re.split(r"(?m)^### ", t)[1:]
    ok = True
    why = []
    for s in STAGES:
        sec = [x for x in secs if x.split("\n", 1)[0].find(s) >= 0]
        if not sec:
            ok = False
            why.append(s + "无小节")
            continue
        body = sec[0]
        miss = [k for k in ("门槛", "观察", "授权", "回退") if k not in body]
        if miss:
            ok = False
            why.append("%s 缺 %s" % (s, "/".join(miss)))
        elif not re.search(r"\d", re.split(r"观察[：:]", body)[0]):
            ok = False
            why.append(s + " 门槛里没有数字")
    res.append(("P2 每个阶段有 门槛/观察/授权/回退，门槛含数字" + ("" if ok else "（%s）" % "；".join(why)), ok))
    got = [n for n in KEY_NUMBERS if has_num(t, n)]
    res.append(("P3 引用至少 4 个本章数字（现有 %d：%s）" % (len(got), ",".join(got)), len(got) >= 4))
    roles = [r for r in ("指挥官", "风控", "合规", "业务负责人") if r in t]
    res.append(("P4 至少两个批准角色（现有：%s）" % ",".join(roles), len(roles) >= 2))
    return res


def check_announce(t):
    res = []
    res.append(("A1 有时间（14:07、14:09 与复市阶段）", "14:07" in t and "14:09" in t and ("阶段" in t or "分步" in t or "分阶段" in t)))
    scope = all(s in t for s in ("BTC-USDT", "ETH-USDT", "QRS-PERP")) and any(re.search(r"(?<!\d)%s(?!\d)" % n, t) for n in ("31", "24", "8"))
    res.append(("A2 有范围（三个品种 + 账户数）", scope))
    res.append(("A3 说明处置（冲销、ADL、保险基金）", all(k in t for k in ("冲销", "ADL", "保险基金"))))
    res.append(("A4 告诉用户怎么做（撤单；联系/客服）", "撤单" in t and ("联系" in t or "客服" in t)))
    bad = [w for w in ("黑客", "被盗", "攻击", "完全恢复", "保证", "不会再发生") if w in t]
    res.append(("A5 没有未证实的说法" + ("" if not bad else "（出现：%s）" % ",".join(bad)), not bad))
    n = len(re.sub(r"\s", "", t))
    res.append(("A6 长度 150–900 字符（现在 %d）" % n, 150 <= n <= 900))
    return res


def main():
    if len(sys.argv) != 3 or sys.argv[1] not in ("plan", "announce"):
        raise SystemExit(__doc__)
    t = open(sys.argv[2], encoding="utf-8").read()
    res = check_plan(t) if sys.argv[1] == "plan" else check_announce(t)
    for name, ok in res:
        print(("通过  " if ok else "不通过  ") + name)
    bad = sum(1 for _, ok in res if not ok)
    print("%d 项通过，%d 项不通过" % (len(res) - bad, bad))
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
