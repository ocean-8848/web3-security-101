-- id: s7_c_k8s_signing_no_change
-- scenario: S7
-- 单源规则 C：人类账号访问 signing 命名空间，且没有变更单号
SELECT user AS staff_id, ts, source_ip AS ip, verb, resource, subresource, response_code
FROM k8s_audit
WHERE namespace = 'signing' AND user_type = 'human'
  AND json_extract(annotations, '$.change_id') IS NULL
