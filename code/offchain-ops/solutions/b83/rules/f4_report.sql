-- id: f4_report
-- scenario: S15-02
-- param: sla=1800
-- param: asof=2026-03-15T00:00:00Z
SELECT action_id, account_id, action, ts,
       CAST(strftime('%s', :asof) - strftime('%s', ts) AS INTEGER) AS age_s
FROM case_actions
WHERE report_status IS NULL
  AND strftime('%s', :asof) - strftime('%s', ts) > :sla
