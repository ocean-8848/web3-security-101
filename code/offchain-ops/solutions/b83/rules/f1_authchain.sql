-- id: f1_authchain
-- scenario: S15-01
-- param: allow_policy=1
SELECT action_id, account_id, actor, authorizer,
       CASE WHEN authorizer IS NULL THEN 'no_authorizer' ELSE 'self_authorized' END AS why
FROM case_actions
WHERE (authorizer IS NULL OR authorizer = actor)
  AND NOT (:allow_policy = 1 AND actor LIKE 'system:%')
