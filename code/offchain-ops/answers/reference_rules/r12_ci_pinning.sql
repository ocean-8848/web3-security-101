-- id: r12_ci_pinning
-- scenario: S8-02
-- X04：Action 必须固定到 40 位提交哈希，且只关心会进入发布的流水线（release.yml）
SELECT run_id, repo, workflow, ts, json_extract(detail, '$.action') AS action, json_extract(detail, '$.ref') AS ref
FROM ci_events
WHERE event_type = 'action_use' AND workflow = 'release.yml'
  AND length(json_extract(detail, '$.ref')) <> 40
