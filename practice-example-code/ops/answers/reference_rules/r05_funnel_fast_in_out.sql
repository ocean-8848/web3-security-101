-- id: r05_funnel_fast_in_out
-- scenario: S3
-- param: min_in_usd=8000
-- param: min_sources=5
-- param: out_ratio=0.9
-- param: max_kyc=1
-- X13 规则示例 1（调优版）：入金（链上入金 + 内部转入）汇聚，24 小时内转出占比 >= 90%，来源多，且 KYC 低 / 注册不久
WITH inflow AS (
  SELECT account_id, SUM(amount_usd) AS in_usd, COUNT(*) AS sources, MIN(ts) AS ts
  FROM ledger
  WHERE direction = 'credit' AND sub = 'available' AND entry_type IN ('deposit', 'internal_transfer')
  GROUP BY account_id
), outflow AS (
  SELECT account_id, SUM(amount_usd) AS out_usd, COUNT(DISTINCT to_address) AS dst
  FROM withdrawals WHERE status = 'completed' GROUP BY account_id
)
SELECT i.account_id, i.ts, ROUND(i.in_usd) AS in_usd, ROUND(o.out_usd) AS out_usd, i.sources, o.dst
FROM inflow i JOIN outflow o USING (account_id) JOIN accounts a USING (account_id)
WHERE i.in_usd >= :min_in_usd AND i.sources >= :min_sources AND o.out_usd >= :out_ratio * i.in_usd
  AND a.kyc_level <= :max_kyc AND a.risk_tag = 'new_user'
