-- id: s5_v3_stream
-- scenario: S5
-- param: min_reads=40
-- 第 3 版：流式触发。没有工单时，一小时内读到第 min_reads 个不同账户的那一刻就触发；导出在导出的那一刻触发
WITH reads AS (
  SELECT staff_id, substr(ts, 1, 13) AS hour, target_account_id, MIN(ts) AS first_ts
  FROM support_access
  WHERE ticket_id IS NULL AND action IN ('view_kyc', 'export_kyc')
  GROUP BY staff_id, substr(ts, 1, 13), target_account_id
), ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY staff_id, hour ORDER BY first_ts) AS rn FROM reads
)
SELECT staff_id, hour, first_ts AS ts, first_ts AS fire_ts, rn AS accounts, 'bulk_read' AS reason
FROM ranked WHERE rn = :min_reads
UNION ALL
SELECT staff_id, substr(ts, 1, 13), ts, ts, 1, 'export_no_ticket'
FROM support_access WHERE ticket_id IS NULL AND action = 'export_kyc'
