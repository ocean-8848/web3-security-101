-- id: b72_s1_recovery_naive
-- scenario: S1
-- param: min_usd=1000
-- B72 第 2 步（朴素版）：找回成功后 24 小时内，有大额提币
SELECT w.account_id, w.wd_id, r.ts AS recovery_ts, w.amount_usd, w.ts
FROM recoveries r
JOIN withdrawals w ON w.account_id = r.account_id
 AND w.ts BETWEEN r.ts AND strftime('%Y-%m-%dT%H:%M:%SZ', r.ts, '+24 hours')
WHERE r.result = 'success' AND w.amount_usd >= :min_usd
