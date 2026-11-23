-- id: f6_unapplied_orders
-- scenario: S15-04
-- param: grace=60
-- param: min_orders=1
SELECT a.account_id, a.action_id, COUNT(DISTINCT e.order_id) AS orders, MIN(e.ts) AS first_order
FROM case_actions a
JOIN order_events e
  ON e.account_id = a.account_id AND e.event_type = 'new'
 AND CAST(strftime('%s', e.ts) AS INTEGER) > CAST(strftime('%s', a.ts) AS INTEGER) + :grace
WHERE a.action IN ('restrict','revoke_trade','legal_freeze')
  AND a.scope IN ('trade','all')
  AND a.report_status = 'failed'
  AND NOT EXISTS (SELECT 1 FROM case_actions b WHERE b.retry_of = a.action_id AND b.report_status = 'applied')
GROUP BY a.account_id, a.action_id
HAVING orders >= :min_orders
