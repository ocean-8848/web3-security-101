-- id: r02_recovery_withdraw_naive
-- scenario: S1
-- param: min_usd=1000
-- X08 规则 2（朴素版）：找回成功后 24 小时内提币 >= 1000 美元
SELECT w.account_id, r.ts AS recovery_ts, w.wd_id, w.amount_usd, w.ts
FROM recoveries r JOIN withdrawals w
  ON w.account_id = r.account_id AND w.ts BETWEEN r.ts AND strftime('%Y-%m-%dT%H:%M:%SZ', r.ts, '+24 hours')
WHERE r.result = 'success' AND w.amount_usd >= :min_usd
