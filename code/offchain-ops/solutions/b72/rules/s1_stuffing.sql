-- id: b72_s1_stuffing
-- scenario: S1
-- param: window_min=10
-- param: min_users=20
-- param: max_ratio=99
-- B72 第 1 步：同一来源 IP 在一个时间窗内，对多少个不同账户输错密码
SELECT ip, MIN(ts) AS ts, COUNT(DISTINCT account_id) AS users, COUNT(*) AS fails,
       ROUND(1.0 * COUNT(*) / COUNT(DISTINCT account_id), 2) AS fails_per_user
FROM logins
WHERE result = 'failed_password'
GROUP BY ip, CAST(strftime('%s', ts) / (:window_min * 60) AS INTEGER)
HAVING users >= :min_users AND fails_per_user <= :max_ratio
