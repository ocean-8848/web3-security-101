# MiniEx 发布清单（B75 参考答案，示例）

> 范围：miniex/wallet-service 与 miniex/exchange-web 的 release 通道。依据：X04 的发布门禁与 SDL 控制项；T04 里适用于服务发布的项（4 权限、8 监控、9 应急预案、10 签名流程）。
> 规则：任一"必须"项为 ❌，发布不得进行。状态与证据由发布负责人在发布当天填写。

## 1. 必须项

| # | 项 | 通过标准 | 对应 | 自动化 | 状态 | 证据 |
|---|---|---|---|---|---|---|
| 1 | 工作流静态检查 | `lint_workflow.py` 对 release.yml 无 HIGH | SDL-11/12/14/15 | 合并门禁 | | 命令输出 |
| 2 | Action 固定 | release 路径上所有 Action 为 40 位提交哈希 | SDL-11 | lint R04 | | |
| 3 | 触发器与权限 | 无 pull_request_target；permissions 只读起步 | SDL-12 | lint R01/R02/R05/R07 | | |
| 4 | 依赖锁定 | npm ci --ignore-scripts；安装哈希与 lockfile 一致 | SDL-6/8 | lint R06 + check_ci_events C1 | | |
| 5 | 发布凭证 | 无长期令牌；OIDC 短期身份 | SDL-14 | lint R08 | | |
| 6 | 环境审批 | 发布 job 绑定 environment，审批人不是提交者 | SDL-15/18 | lint R03 | | |
| 7 | 签名与验证 | 制品已签名；发布前验证通过；release 通道无 signature 为空的发布 | SDL-16/17 | lint R09 + check_ci_events C3 | | |
| 8 | 权限分离（T04 #4） | 构建身份、发布身份、签名身份不是同一个 | SDL-18 | 人工 | | |
| 9 | 监控（T04 #8） | 发布后 30 分钟内有人看告警；回滚命令已演练 | SDL-23 | 人工 | | |
| 10 | 应急预案（T04 #9） | 令牌轮换、撤包、公告联系人已更新 | SDL-24 | 人工 | | |

## 2. 建议项

- [ ] 新依赖版本发布超过 24 小时再引入（SDL-7）
- [ ] 每次发布留存 SBOM（SDL-10）
- [ ] 线上摘要每小时巡检（SDL-21）

## 3. 门禁结论

| 结论 | 可发布 / 附条件发布 / 暂缓 / 否决 |
|---|---|
| 条件（如适用） | |
| 发布负责人 / 批准人 | |
| 日期 | |
