-- id: r07_mark_deviation
-- scenario: S4-03
-- param: dev=0.05
-- param: min_rows=3
-- param: min_sources=3
-- X14 标记价偏离：标记价偏离指数 >= 5%，连续至少 3 个 5 分钟采样点，且价格来源 >= 3
WITH d AS (
  SELECT symbol, ts, source_count, ABS(mark_price / index_price - 1) AS dev,
         CAST(strftime('%s', ts) / 300 AS INTEGER) AS slot
  FROM marks
  WHERE ABS(mark_price / index_price - 1) >= :dev AND source_count >= :min_sources
), g AS (
  SELECT symbol, ts, dev, slot - ROW_NUMBER() OVER (PARTITION BY symbol ORDER BY slot) AS grp FROM d
)
SELECT symbol, MIN(ts) AS ts, COUNT(*) AS rows_in_a_row, ROUND(MAX(dev), 3) AS max_dev
FROM g GROUP BY symbol, grp HAVING COUNT(*) >= :min_rows
