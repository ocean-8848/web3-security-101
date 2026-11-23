-- id: b72_s4_mark
-- scenario: S4-03
-- param: dev=0.05
-- param: min_rows=3
-- param: min_sources=3
-- B72 第 6 步：同一标的在同一小时内，标记价偏离指数超过阈值的采样点数
SELECT symbol, MIN(ts) AS ts, COUNT(*) AS rows_off, ROUND(MAX(ABS(mark_price / index_price - 1)), 3) AS max_dev, MIN(source_count) AS min_sources
FROM marks
WHERE ABS(mark_price / index_price - 1) >= :dev AND source_count >= :min_sources
GROUP BY symbol, substr(ts, 1, 13)
HAVING rows_off >= :min_rows
