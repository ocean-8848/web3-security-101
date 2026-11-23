#!/usr/bin/env python3
"""30 分钟桌面推演的注入卡：每张卡只放出"当时能看到"的日志。

用法：
  python3 drill.py list        # 只列卡号、演练时钟、标题（不含内容）
  python3 drill.py card 3      # 打印第 3 张卡（主持人读出，指挥官此前不要看）
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import timeline as tl

S1 = {"A01367"}
SR5 = {"SR000372", "SR000538", "SR000828", "SR000835", "SR001044", "AP-E001", "AP-E002", "AP-W000829", "AP-T0048"}
ST21 = {"ST021", "dev-mbp-021", "198.51.100.77", "203.0.113.77"}

CARDS = [
    (0, "风控告警", "周三 01:48 UTC（示例）。规则 3 告警：账户 A01367 改手机号后新增提币地址，随后申请提币 18,400 USDT。值班电话响起。",
     dict(entities=S1, since="2026-03-04T01:10:00Z", until="2026-03-04T01:49:00Z", only={"logins", "account_events", "withdrawals"})),
    (6, "链上已转出", "提币已被自动审批并签名。链上显示该笔已转出，目的地址是 28 分钟前新增的地址。",
     dict(entities=S1, since="2026-03-04T01:48:31Z", until="2026-03-04T02:00:00Z", only={"approvals", "chain_txs"})),
    (11, "回放规则的 5 条命中", "安全工程师把新规则 r09（签名请求无审批或与审批不符）回放到最近 10 天，得到 5 条命中。其中有人说这几条是紧急调拨补签，不用管。",
     dict(entities=SR5, only={"signing_requests", "approvals"})),
    (17, "开发机线索", "EDR 平台给出同一员工的三条线索。你呼叫安全负责人，电话关机。",
     dict(entities=ST21, since="2026-03-09T11:00:00Z", until="2026-03-09T12:00:00Z", only={"endpoint_events", "cloud_audit", "k8s_audit"}, hide="net_connect")),
    (23, "用户来电与撞库范围", "用户 A01367 打进客服：我没有改过手机号，也没有提过币。客服问怎么回答。社交媒体已有人发帖称交易所被盗。",
     dict(entities={"203.0.113.10", "203.0.113.11", "203.0.113.12", "203.0.113.13", "203.0.113.14", "203.0.113.15"},
          since="2026-03-04T00:55:00Z", until="2026-03-04T03:00:00Z", only={"logins"}, hide="failed_password")),
    (27, "第二台开发机与保全", "你决定轮换签名命名空间的密钥。取证同事问：快照做了吗？另一台开发机上有没有同样的外联工具？",
     dict(entities={"rtunnel-agent"}, only={"endpoint_events"}, hide="net_connect", match_image=True)),
]


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    if sys.argv[1] == "list":
        for i, (m, title, _, _) in enumerate(CARDS, 1):
            print(f"卡 {i}  T+{m:<2}  {title}")
        return
    n = int(sys.argv[2])
    m, title, text, q = CARDS[n - 1]
    print(f"== 卡 {n}  T+{m} 分钟  {title} ==\n{text}\n")
    if q.get("match_image"):
        rows = [r for r in tl.rows_jsonl("endpoint_events") if r["image"] == "rtunnel-agent"]
        ev = [{"ts": r["ts"], "source": "endpoint_events", "id": r["event_id"], "summary": tl.SOURCES["endpoint_events"][3](r)} for r in rows]
        ev.sort(key=lambda e: e["ts"])
    else:
        ev = tl.collect(q["entities"], q.get("since"), q.get("until"), q.get("only"))
    if q.get("hide"):
        ev = [e for e in ev if q["hide"] not in e["summary"]]
    for e in ev:
        print(f"{e['ts']}  {e['source']:<16} {e['id'][:14]:<14} {e['summary']}")


if __name__ == "__main__":
    main()
