-- id: r09_signing_without_approval
-- scenario: S6
-- X11 签名服务独立校验 / X05 跨域规则：签名请求必须有审批单，且目标地址一致（忽略大小写）、金额不超过审批金额、审批不晚于请求
SELECT s.request_id, s.ts, s.to_address, s.amount_usd, s.approval_id,
       CASE WHEN s.approval_id IS NULL THEN 'no_approval'
            WHEN a.approval_id IS NULL THEN 'approval_not_found'
            WHEN lower(s.to_address) <> lower(a.to_address) THEN 'address_mismatch'
            WHEN s.amount > a.amount * 1.0001 THEN 'amount_exceeds'
            ELSE 'approved_after_request' END AS reason
FROM signing_requests s LEFT JOIN approvals a ON a.approval_id = s.approval_id
WHERE s.signer_result = 'signed'
  AND (s.approval_id IS NULL OR a.approval_id IS NULL OR lower(s.to_address) <> lower(a.to_address)
       OR s.amount > a.amount * 1.0001 OR a.ts > s.ts)
