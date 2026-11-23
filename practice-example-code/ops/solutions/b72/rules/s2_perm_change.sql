-- id: b72_s2_perm_change
-- scenario: S2
-- param: need_no_ticket=0
-- B72 第 3 步（权限变更视角）：新建带提币权限的 Key，或给已有 Key 加提币权限
--   need_no_ticket=1 时只留下没有变更单的操作
SELECT e.account_id, e.ts, e.event_type, e.ip,
       substr(e.detail, instr(e.detail, 'key=') + 4, 5) AS key_id
FROM account_events e
WHERE e.event_type IN ('api_key_perm_add', 'create_api_key')
  AND e.detail LIKE '%withdraw%'
  AND (:need_no_ticket = 0 OR e.detail NOT LIKE '%ticket=%')
