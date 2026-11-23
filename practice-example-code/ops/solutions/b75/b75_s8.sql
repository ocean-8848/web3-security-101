-- id: b75_s8
-- scenario: S8
-- B75 参考规则：三类供应链事件合并成一条规则
SELECT run_id, ts, json_extract(detail, '$.package') AS package, NULL AS action, NULL AS artifact
FROM ci_events
WHERE event_type = 'dependency_install'
  AND json_extract(detail, '$.lock_integrity') IS NOT NULL
  AND json_extract(detail, '$.integrity') <> json_extract(detail, '$.lock_integrity')
UNION ALL
SELECT run_id, ts, NULL, json_extract(detail, '$.action'), NULL
FROM ci_events
WHERE event_type = 'action_use' AND workflow = 'release.yml'
  AND length(json_extract(detail, '$.ref')) <> 40
UNION ALL
SELECT run_id, ts, NULL, NULL, json_extract(detail, '$.artifact')
FROM ci_events
WHERE event_type = 'publish' AND json_extract(detail, '$.channel') = 'release'
  AND json_extract(detail, '$.signature') IS NULL
