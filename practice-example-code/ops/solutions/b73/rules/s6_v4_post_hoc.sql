-- id: s6_v4_post_hoc
-- scenario: S6
-- 补签复核规则（P3）：审批晚于签名请求，但审批单是紧急补签（approved_post_hoc）。要有人在次日核对补签是否真实
SELECT s.request_id, s.ts, s.to_address, s.amount_usd, s.approval_id, a.approved_by
FROM signing_requests s JOIN approvals a ON a.approval_id = s.approval_id
WHERE s.signer_result = 'signed' AND a.ts > s.ts AND a.status = 'approved_post_hoc'
