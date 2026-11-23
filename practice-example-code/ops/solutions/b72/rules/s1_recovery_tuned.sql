-- id: b72_s1_recovery_tuned
-- scenario: S1
-- param: min_usd=1000
-- B72 第 2 步（调优版）：在朴素版上，再要求提币地址是找回之后才加入地址簿的
SELECT w.account_id, w.wd_id, r.ts AS recovery_ts, w.amount_usd, w.ts
FROM recoveries r
JOIN withdrawals w ON w.account_id = r.account_id
 AND w.ts BETWEEN r.ts AND strftime('%Y-%m-%dT%H:%M:%SZ', r.ts, '+24 hours')
WHERE r.result = 'success' AND w.amount_usd >= :min_usd
  AND w.addr_added_ts >= r.ts
