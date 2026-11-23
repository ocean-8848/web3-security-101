-- id: f5_unapplied
-- scenario: S15-04
-- param: allow_retry=1
SELECT a.action_id, a.account_id, a.action, a.scope, a.ts
FROM case_actions a
WHERE a.action IN ('restrict','legal_freeze','revoke_trade')
  AND a.report_status = 'failed'
  AND NOT (:allow_retry = 1 AND EXISTS (
        SELECT 1 FROM case_actions b WHERE b.retry_of = a.action_id AND b.report_status = 'applied'))
