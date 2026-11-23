-- id: b72_s1_change_addr
-- scenario: S1
-- param: gap_min=30
-- param: wd_hours=24
-- param: min_usd=1000
-- B72 第 3 步：改手机 / 重置或解绑 MFA 后 30 分钟内新增提币地址，随后 24 小时内向该地址提币
SELECT c.account_id, c.event_type, c.ts AS change_ts, w.wd_id, w.amount_usd, w.ts
FROM account_events c
JOIN account_events b ON b.account_id = c.account_id AND b.event_type = 'add_withdraw_address'
 AND b.ts BETWEEN c.ts AND strftime('%Y-%m-%dT%H:%M:%SZ', c.ts, '+' || :gap_min || ' minutes')
JOIN withdrawals w ON w.account_id = c.account_id AND w.addr_added_ts = b.ts
 AND w.ts BETWEEN b.ts AND strftime('%Y-%m-%dT%H:%M:%SZ', b.ts, '+' || :wd_hours || ' hours')
WHERE c.event_type IN ('phone_change', 'mfa_reset', 'mfa_unbind') AND w.amount_usd >= :min_usd
