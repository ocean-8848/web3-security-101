-- id: f2_role
-- scenario: S15-03
-- param: allow_policy=1
SELECT a.action_id, a.account_id, a.action, a.scope, a.authorizer, r.role AS authorizer_role
FROM case_actions a
LEFT JOIN staff_roles r ON r.staff_id = a.authorizer
WHERE a.authorizer IS NOT NULL
  AND NOT (:allow_policy = 1 AND a.actor LIKE 'system:%' AND a.authorizer LIKE 'policy:%')
  AND (
        (a.action IN ('legal_freeze','legal_unfreeze') AND COALESCE(r.role,'?') <> 'compliance')
     OR (a.action NOT IN ('legal_freeze','legal_unfreeze') AND a.scope = 'all' AND COALESCE(r.role,'?') <> 'compliance')
     OR (a.action NOT IN ('legal_freeze','legal_unfreeze') AND a.scope IN ('trade','withdraw') AND COALESCE(r.role,'?') NOT IN ('security','compliance'))
      )
