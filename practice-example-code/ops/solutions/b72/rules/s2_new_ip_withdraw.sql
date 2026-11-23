-- id: b72_s2_new_ip_withdraw
-- scenario: S2
-- param: lookback_hours=24
-- B72 第 3 步（调用视角）：提币权限的调用来自一个 Key 此前从未用过的 IP
SELECT c.key_id, c.account_id, c.ip, MIN(c.ts) AS ts, COUNT(*) AS calls
FROM api_calls c
WHERE c.perm_used = 'withdraw'
  AND NOT EXISTS (
    SELECT 1 FROM api_calls p
    WHERE p.key_id = c.key_id AND p.ip = c.ip
      AND p.ts < strftime('%Y-%m-%dT%H:%M:%SZ', c.ts, '-' || :lookback_hours || ' hours'))
GROUP BY c.key_id, c.ip
