-- id: s6_v1_no_approval
-- scenario: S6
-- 第 1 版：已签名的请求没有审批单号
SELECT request_id, ts, to_address, amount_usd, approval_id
FROM signing_requests
WHERE signer_result = 'signed' AND approval_id IS NULL
