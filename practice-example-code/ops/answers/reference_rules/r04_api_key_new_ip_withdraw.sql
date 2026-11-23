-- id: r04_api_key_new_ip_withdraw
-- scenario: S2
-- param: gap_min=60
-- X08 规则 4/7（组合版）：Key 新建或加提币权限后 60 分钟内，出现该 Key 此前一天之前从未用过的 IP 的提币类调用；
--   并且开权限 / 建 Key 的操作所用 IP，在此前一天之前从未出现在该账户的登录里
SELECT c.key_id, c.account_id, c.ip, MIN(c.ts) AS ts, e.event_type, e.ip AS op_ip
FROM account_events e
JOIN api_calls c ON c.key_id = substr(e.detail, instr(e.detail, 'key=') + 4, 5)
 AND c.ts BETWEEN e.ts AND strftime('%Y-%m-%dT%H:%M:%SZ', e.ts, '+' || :gap_min || ' minutes')
WHERE e.event_type IN ('api_key_perm_add', 'create_api_key')
  AND c.perm_used = 'withdraw'
  AND NOT EXISTS (SELECT 1 FROM api_calls p WHERE p.key_id = c.key_id AND p.ip = c.ip AND p.ts < strftime('%Y-%m-%dT%H:%M:%SZ', e.ts, '-1 day'))
  AND NOT EXISTS (SELECT 1 FROM logins l WHERE l.account_id = e.account_id AND l.ip = e.ip AND l.ts < strftime('%Y-%m-%dT%H:%M:%SZ', e.ts, '-1 day'))
GROUP BY c.key_id, c.ip
