-- id: f3_legal_ref
-- scenario: S15-03
SELECT action_id, account_id, action, actor, authorizer
FROM case_actions
WHERE action IN ('legal_freeze','legal_unfreeze') AND authority_ref IS NULL
