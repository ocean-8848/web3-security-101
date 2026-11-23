-- id: s7_b_cloud_external_secret
-- scenario: S7
-- 单源规则 B：员工的云凭证在办公出口之外读取 secret
SELECT identity AS staff_id, ts, source_ip AS ip, resource
FROM cloud_audit
WHERE identity_type = 'user' AND action = 'GetSecretValue' AND source_ip NOT LIKE '192.0.2.%'
