-- id: b72_s4_wash
-- scenario: S4-01,S4-02
-- param: min_linked=20
-- param: min_usd=50000
-- param: exclude_mm=0
-- B72 第 6 步：关联成交（买卖双方同 IP 或同设备）的笔数与金额
WITH sides AS (
  SELECT symbol, buyer_account_id AS account_id, quote_qty, ts FROM orders_trades
   WHERE buyer_ip = seller_ip OR buyer_device = seller_device
  UNION ALL
  SELECT symbol, seller_account_id, quote_qty, ts FROM orders_trades
   WHERE buyer_ip = seller_ip OR buyer_device = seller_device
)
SELECT s.symbol, s.account_id, COUNT(*) AS linked_trades, ROUND(SUM(s.quote_qty)) AS usd, MIN(s.ts) AS ts, a.risk_tag
FROM sides s JOIN accounts a USING (account_id)
WHERE :exclude_mm = 0 OR a.risk_tag <> 'market_maker'
GROUP BY s.symbol, s.account_id
HAVING linked_trades >= :min_linked AND usd >= :min_usd
