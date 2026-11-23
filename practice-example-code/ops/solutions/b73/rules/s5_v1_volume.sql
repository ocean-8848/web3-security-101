-- id: s5_v1_volume
-- scenario: S5
-- param: min_reads=20
-- 第 1 版：只看数量。同一员工一小时内查看或导出 KYC 的账户数达到阈值
SELECT staff_id, substr(ts, 1, 13) AS hour, MIN(ts) AS ts, COUNT(DISTINCT target_account_id) AS accounts
FROM support_access
WHERE action IN ('view_kyc', 'export_kyc')
GROUP BY staff_id, substr(ts, 1, 13)
HAVING accounts >= :min_reads
