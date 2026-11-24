# Solana / Anchor 最小安全靶场（solana-vault）

本靶场配套 [C04 Solana：合约与账户安全专题](../../../Web3-Security/chains/C04-solana.md) 与 [B50 Solana 程序审计实战](../../../Web3-Security/bootcamp/B50-solana-audit.md)。代码仅用于本地学习防御原理，不包含主网地址或真实攻击脚本。

## 预埋的 3 类典型漏洞与修复对照

| 函数 | 状态 | 漏洞点 / 修复要点 |
|---|---|---|
| `withdraw_vulnerable` | `// ❌ 漏洞` | 仅比较 `vault.authority == authority.key()`，遗漏 `is_signer` 与 PDA `seeds/bump` 校验 |
| `withdraw_safe` | `// ✅ 修复` | 使用 `Signer<'info>`、规范 PDA `seeds` + `bump` 与 `has_one = authority` |
| `close_vault_vulnerable` | `// ❌ 漏洞` | 仅转空 Lamports 而未清零账户数据，同交易后续指令可补足免租余额触发账户复活（Revival） |
| `close_vault_safe` | `// ✅ 修复` | 使用 Anchor `close = authority` 约束，自动清零数据并写入关闭鉴别器 |
| `cpi_transfer_vulnerable` | `// ❌ 漏洞` | 允许调用方传入任意 `token_program` 并配合 `invoke_signed` 透传 PDA 签名权 |
| `cpi_transfer_safe` | `// ✅ 修复` | 使用 `Program<'info, Token>` 强校验官方 SPL Token Program ID |

## 本地编译与阅读

从 `web3-security-handbook/` 根目录出发（需提前安装 Rust 与 Anchor CLI）：

```bash
cd practice-example-code/non-evm/solana-vault
cargo check
```
