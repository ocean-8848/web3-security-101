-- id: s7_e_chain3
-- scenario: S7
-- param: win_min=60
-- 关联规则（三步）：隧道进程 -> 云凭证外部读 secret -> 同一来源 IP 访问 signing 命名空间
SELECT e.user AS staff_id, e.host, e.ts AS ts, k.ts AS fire_ts, c.source_ip AS ip, k.verb, k.resource, k.response_code
FROM endpoint_events e
JOIN cloud_audit c
  ON c.identity = e.user AND c.action = 'GetSecretValue' AND c.source_ip NOT LIKE '192.0.2.%'
 AND c.ts BETWEEN e.ts AND strftime('%Y-%m-%dT%H:%M:%SZ', e.ts, '+' || :win_min || ' minutes')
JOIN k8s_audit k
  ON k.user = e.user AND k.namespace = 'signing' AND k.source_ip = c.source_ip
 AND k.ts BETWEEN c.ts AND strftime('%Y-%m-%dT%H:%M:%SZ', c.ts, '+' || :win_min || ' minutes')
WHERE e.event_type = 'process_start' AND e.image IN ('ngrok', 'cloudflared', 'rtunnel-agent')
