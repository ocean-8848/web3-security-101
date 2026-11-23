-- id: b72_s3_funnel
-- scenario: S3
-- param: min_in_usd=20000
-- param: min_sources=5
-- param: out_ratio=0.9
-- param: only_new=0
-- B72 第 5 步：入金汇聚后快速转出。默认参数是手册示例阈值。
WITH inflow AS (
  SELECT account_id, SUM(amount_usd) AS in_usd, COUNT(*) AS sources, MIN(ts) AS ts
  FROM ledger
  WHERE direction = 'credit' AND sub = 'available' AND entry_type IN ('deposit', 'internal_transfer')
  GROUP BY account_id
), outflow AS (
  SELECT account_id, SUM(amount_usd) AS out_usd
  FROM withdrawals WHERE status = 'completed' GROUP BY account_id
)
SELECT i.account_id, i.ts, ROUND(i.in_usd) AS in_usd, ROUND(o.out_usd) AS out_usd, i.sources, a.risk_tag
FROM inflow i JOIN outflow o USING (account_id) JOIN accounts a USING (account_id)
WHERE i.in_usd >= :min_in_usd AND i.sources >= :min_sources AND o.out_usd >= :out_ratio * i.in_usd
  AND (:only_new = 0 OR a.risk_tag = 'new_user')
