-- id: s6_v2_mismatch
-- scenario: S6
-- 第 2 版：加上审批单核对：找不到单、目标地址不一致、金额超出、审批晚于请求
SELECT s.request_id, s.ts, s.to_address, s.amount_usd, s.approval_id,
       CASE WHEN s.approval_id IS NULL THEN 'no_approval'
            WHEN a.approval_id IS NULL THEN 'approval_not_found'
            WHEN s.to_address <> a.to_address THEN 'address_mismatch'
            WHEN s.amount > a.amount * 1.0001 THEN 'amount_exceeds'
            ELSE 'approved_after_request' END AS reason
FROM signing_requests s LEFT JOIN approvals a ON a.approval_id = s.approval_id
WHERE s.signer_result = 'signed'
  AND (s.approval_id IS NULL OR a.approval_id IS NULL OR s.to_address <> a.to_address
       OR s.amount > a.amount * 1.0001 OR a.ts > s.ts)
