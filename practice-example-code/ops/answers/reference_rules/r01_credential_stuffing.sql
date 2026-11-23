-- id: r01_credential_stuffing
-- scenario: S1
-- param: window_min=10
-- param: min_users=20
-- param: min_fails=50
-- X08 规则 1：同一来源 IP 在 10 分钟窗口内对大量不同账户登录失败（把时间按窗口取整的近似写法）
SELECT ip, MIN(ts) AS ts, COUNT(DISTINCT account_id) AS users, COUNT(*) AS fails
FROM logins
WHERE result = 'failed_password'
GROUP BY ip, CAST(strftime('%s', ts) / (:window_min * 60) AS INTEGER)
HAVING users >= :min_users AND fails >= :min_fails
