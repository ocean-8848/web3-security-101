-- id: r14_ci_unsigned_release
-- scenario: S8-03
-- X04：release 通道的发布必须带签名
SELECT run_id, repo, ts, json_extract(detail, '$.artifact') AS artifact
FROM ci_events
WHERE event_type = 'publish' AND json_extract(detail, '$.channel') = 'release' AND json_extract(detail, '$.signature') IS NULL
