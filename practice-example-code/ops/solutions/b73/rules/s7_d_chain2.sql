-- id: s7_d_chain2
-- scenario: S7
-- param: win_min=60
-- 关联规则（两步）：隧道进程 -> 同一员工的云凭证从办公出口之外读取 secret（win_min 分钟内）
SELECT e.user AS staff_id, e.host, e.ts AS ts, c.ts AS fire_ts, c.source_ip AS ip
FROM endpoint_events e
JOIN cloud_audit c
  ON c.identity = e.user
 AND c.action = 'GetSecretValue'
 AND c.source_ip NOT LIKE '192.0.2.%'
 AND c.ts BETWEEN e.ts AND strftime('%Y-%m-%dT%H:%M:%SZ', e.ts, '+' || :win_min || ' minutes')
WHERE e.event_type = 'process_start' AND e.image IN ('ngrok', 'cloudflared', 'rtunnel-agent')
