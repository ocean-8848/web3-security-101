-- id: r11_dev_chain_to_signing
-- scenario: S7
-- param: win_min=90
-- X05 跨日志链式关联：开发机拉起外联隧道工具 -> 同一员工的云凭证从非办公出口使用 -> 访问 signing 命名空间（均在 90 分钟内）
SELECT e.user AS staff_id, e.host, MIN(e.ts) AS ts, c.source_ip AS ip, k.verb, k.resource, k.response_code
FROM endpoint_events e
JOIN cloud_audit c ON c.identity = e.user AND c.source_ip NOT LIKE '192.0.2.%' AND c.action = 'GetSecretValue'
  AND c.ts BETWEEN e.ts AND strftime('%Y-%m-%dT%H:%M:%SZ', e.ts, '+' || :win_min || ' minutes')
JOIN k8s_audit k ON k.user = e.user AND k.namespace = 'signing' AND k.source_ip = c.source_ip
  AND k.ts BETWEEN c.ts AND strftime('%Y-%m-%dT%H:%M:%SZ', c.ts, '+' || :win_min || ' minutes')
WHERE e.event_type = 'process_start' AND e.image NOT IN ('git','node','python3','docker','kubectl','aws','code','npm','make','ssh','cargo','forge','ngrok','cloudflared')
GROUP BY e.user, e.host, c.source_ip
