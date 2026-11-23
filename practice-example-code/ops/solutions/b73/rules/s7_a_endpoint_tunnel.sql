-- id: s7_a_endpoint_tunnel
-- scenario: S7
-- 单源规则 A：开发机上出现隧道类进程（X05 规则 4 的变体）
SELECT user AS staff_id, host, ts, image, parent_image
FROM endpoint_events
WHERE event_type = 'process_start' AND image IN ('ngrok', 'cloudflared', 'rtunnel-agent')
