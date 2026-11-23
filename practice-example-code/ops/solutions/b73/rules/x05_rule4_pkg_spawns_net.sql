-- id: x05_rule4_pkg_spawns_net
-- scenario: S7
-- X05 规则 4 的直译：node / python3 父进程拉起 curl / wget / nc
SELECT user AS staff_id, host, ts, image, parent_image
FROM endpoint_events
WHERE event_type = 'process_start'
  AND parent_image IN ('node', 'python3')
  AND image IN ('curl', 'wget', 'nc')
