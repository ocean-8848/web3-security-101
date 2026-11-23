-- id: r08_support_bulk_no_ticket
-- scenario: S5
-- param: min_reads=40
-- X08 规则 6（调优版）：客服在没有工单的情况下，一个小时内查看 / 导出的 KYC 超过 40 个账户；导出动作一律告警
SELECT staff_id, substr(ts, 1, 13) AS hour, MIN(ts) AS ts, COUNT(DISTINCT target_account_id) AS accounts, SUM(action = 'export_kyc') AS exports
FROM support_access
WHERE ticket_id IS NULL AND action IN ('view_kyc', 'export_kyc')
GROUP BY staff_id, substr(ts, 1, 13)
HAVING accounts >= :min_reads OR exports > 0
