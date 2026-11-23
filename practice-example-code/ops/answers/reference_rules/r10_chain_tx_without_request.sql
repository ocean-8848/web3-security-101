-- id: r10_chain_tx_without_request
-- scenario: S6-01,S6-02
-- X11 三方对账 / X05：热钱包的转出，在提币表里找不到对应的申请，也不是登记的调拨
SELECT t.tx_hash, t.ts, t.to_addr AS to_address, t.amount_usd
FROM chain_txs t
WHERE t.from_tier = 'hot' AND t.kind = 'withdrawal' AND t.wd_id IS NULL
