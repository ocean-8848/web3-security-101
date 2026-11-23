# PerpLite（本地靶场）

只用于本地 `forge test`。不要部署到任何公开网络。

- `src/PerpLite.sol`：待审计目标，含预埋漏洞。
- `solution/PerpLiteFixed.sol`：修复版。做完审计再看。
- `test/PoC.t.sol`：`PoC` 证明漏洞存在，`FixProofs` 证明修复有效。
- `test/Invariant.t.sol`：对修复版跑偿付和 OI 不变量。
- `demo/InvariantVuln.t.sol`：同一个 Handler 跑漏洞版，预期失败。

```bash
forge test                       # 预期全部通过
FOUNDRY_PROFILE=vuln forge test  # 预期 1 个不变量失败
```

配套章节：[B43 第 7 次审计：PerpLite](../../../handbook/bootcamp/B43-audit-7-perplite.md)。
