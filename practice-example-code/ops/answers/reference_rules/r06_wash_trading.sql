-- id: r06_wash_trading
-- scenario: S4-01,S4-02
-- param: min_linked=20
-- param: min_usd=50000
-- param: exclude_mm=0
-- X10 市场监测：成交对手方与自己共 IP 或共设备（“关联成交”）的笔数与金额很大
--   exclude_mm=1 时排除登记为 market_maker 的账户（做市商同机房对冲）
WITH t AS (
  SELECT symbol, buyer_account_id AS account_id, seller_account_id AS peer, quote_qty, ts,
         (buyer_ip = seller_ip OR buyer_device = seller_device) AS linked FROM orders_trades
  UNION ALL
  SELECT symbol, seller_account_id, buyer_account_id, quote_qty, ts,
         (buyer_ip = seller_ip OR buyer_device = seller_device) FROM orders_trades
)
SELECT t.symbol, t.account_id, COUNT(*) AS trades, SUM(t.linked) AS linked_trades, ROUND(SUM(t.quote_qty)) AS usd, COUNT(DISTINCT t.peer) AS peers, MIN(t.ts) AS ts
FROM t JOIN accounts a USING (account_id)
WHERE t.linked = 1 AND (:exclude_mm = 0 OR a.risk_tag <> 'market_maker')
GROUP BY t.symbol, t.account_id
HAVING linked_trades >= :min_linked AND usd >= :min_usd
