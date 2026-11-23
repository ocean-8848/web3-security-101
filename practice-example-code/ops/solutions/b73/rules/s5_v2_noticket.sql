-- id: s5_v2_noticket
-- scenario: S5
-- param: min_reads=40
-- 第 2 版：只统计没有工单的访问；导出动作一律告警
SELECT staff_id, substr(ts, 1, 13) AS hour, MIN(ts) AS ts,
       COUNT(DISTINCT target_account_id) AS accounts, SUM(action = 'export_kyc') AS exports
FROM support_access
WHERE ticket_id IS NULL AND action IN ('view_kyc', 'export_kyc')
GROUP BY staff_id, substr(ts, 1, 13)
HAVING accounts >= :min_reads OR exports > 0
