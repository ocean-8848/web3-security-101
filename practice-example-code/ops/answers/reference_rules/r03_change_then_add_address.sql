-- id: r03_change_then_add_address
-- scenario: S1
-- param: gap_min=30
-- param: wd_hours=24
-- param: min_usd=1000
-- X08 规则 3（调优版）：改绑 / 重置 MFA 后 30 分钟内新增提币地址，且 24 小时内向该地址提币 >= 1000 美元
SELECT a.account_id, a.ts AS change_ts, b.ts AS addr_ts, w.wd_id, w.amount_usd, w.ts
FROM account_events a
JOIN account_events b ON b.account_id = a.account_id AND b.event_type = 'add_withdraw_address'
  AND b.ts BETWEEN a.ts AND strftime('%Y-%m-%dT%H:%M:%SZ', a.ts, '+' || :gap_min || ' minutes')
JOIN withdrawals w ON w.account_id = a.account_id AND w.addr_added_ts = b.ts
  AND w.ts BETWEEN b.ts AND strftime('%Y-%m-%dT%H:%M:%SZ', b.ts, '+' || :wd_hours || ' hours')
WHERE a.event_type IN ('mfa_reset', 'mfa_unbind', 'phone_change') AND w.amount_usd >= :min_usd
