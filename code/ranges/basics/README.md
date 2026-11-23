# 训练营基础工程（B05–B14）

只包含本地玩具合约。不要部署到任何真实网络。

| 路径 | 用途 | 章节 |
|---|---|---|
| `src/b02/step1..8/Club.sol` | 逐步构建的社团会费合约 | B05 |
| `src/b03/`、`test/b03/`、`demo-fail/` | 积分账本、模糊测试、不变量、只读分叉 | B06、B12 |
| `src/b04/`、`test/b04/`、`script/DeployB04.s.sol` | 代币、小金库和 3 个破坏版本 | B08 |
| `src/b05/LunchPool.sol`、`docs/lunchpool-spec.md` | 审计练习对象和规格 | B09 |
| `solution/LunchPoolFixed.sol`、`test/b05/PoC.t.sol` | 修复版和 PoC | B09、B14 |
| `report/` | 发现模板、模型报告、PDF 生成脚本 | B14 |

```bash
# 27 通过，1 跳过（分叉测试需要 anvil）
forge test
FOUNDRY_PROFILE=demo forge test            # 2 个故意失败的演示
```

`lib/forge-std` 是指向 `../../foundry-demos/lib/forge-std` 的符号链接，需要完整的手册目录。
`lib/openzeppelin-contracts` 是 v5.6.1 的合约子集。
