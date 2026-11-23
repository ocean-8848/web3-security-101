-- id: x05_rule3_exec_signing
-- scenario: S7
-- X05 规则 3 的直译：signing 命名空间的 exec（Sigma 里的 signer 对应靶场的 signing）
SELECT user AS staff_id, ts, source_ip AS ip, name, response_code
FROM k8s_audit
WHERE verb = 'create' AND resource = 'pods' AND subresource = 'exec' AND namespace = 'signing'
