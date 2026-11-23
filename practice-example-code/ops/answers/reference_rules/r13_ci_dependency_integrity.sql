-- id: r13_ci_dependency_integrity
-- scenario: S8-01
-- X04：安装的依赖哈希必须等于 lockfile 里的哈希（lockfile 没有的实验仓库不看）
SELECT run_id, repo, ts, json_extract(detail, '$.package') AS package, json_extract(detail, '$.version') AS version
FROM ci_events
WHERE event_type = 'dependency_install'
  AND json_extract(detail, '$.lock_integrity') IS NOT NULL
  AND json_extract(detail, '$.integrity') <> json_extract(detail, '$.lock_integrity')
