-- id: r02b_recovery_withdraw_tuned
-- scenario: S1
-- param: min_usd=1000
-- param: new_addr_hours=24
-- X08 规则 2（调优版）：找回成功 + 24 小时内提币 + 提币地址是找回之后 24 小时内才加的新地址
SELECT w.account_id, r.ts AS recovery_ts, w.wd_id, w.amount_usd, w.ts
FROM recoveries r JOIN withdrawals w
  ON w.account_id = r.account_id AND w.ts BETWEEN r.ts AND strftime('%Y-%m-%dT%H:%M:%SZ', r.ts, '+24 hours')
WHERE r.result = 'success' AND w.amount_usd >= :min_usd
  AND w.addr_added_ts >= strftime('%Y-%m-%dT%H:%M:%SZ', r.ts, '-' || :new_addr_hours || ' hours')
