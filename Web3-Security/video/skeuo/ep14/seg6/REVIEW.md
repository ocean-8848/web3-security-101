start: l2F
end: wide

# ep14 seg6 自审

- 术语卡 report：`术语卡 2 张：时间锁@21.03s×3.6s，Stage@29.63s×3.6s`
- `hyperframes check`：0 error，Check passed。剩余 warning：composition_file_too_large（整世界内联，同其他段）；标题卡 `line_unread` ×2（segbase 默认 0–1.6 秒标题卡时长，非本段可调）。
- `layout_lint`：版面检查通过。
- 看图：3 张 contact sheet（12 帧 + 3 帧复查）。

## 镜头路线
L0 l2F → wide（四个角色标签：写电路的人 / 写结算合约的人 / 运营 L2 / 桥 / 普通用户）→ L1 ruleA（恶意输入多涂格、阅卷机红灯"不通过"、答题卡红叉、反测试签长出）→ L2 settleE（"证明的公开输入"清单卡，示意；笔数 numRealTxs 行"只读取 没证明"，红线连到笔数字段）→ L3 stageF（时间锁倒计时、安全委员会"紧急权限 · 公开"）→ L4–L5 段内镜头 phoneF（手机屏 Stage ? → Stage 1 → 已弃用 / 取回资产 → 电路审计 ✓ / 赏金计划 ✓，右侧关键词卡）→ L6 aztecE（红点阵 + "只修验证器 够吗？"）→ L7 verifD（验证器绿灯"通过"+"对这些公开输入成立"）→ L8 settleE（"漏洞在业务合约"；笔数字段 → 证明卡红虚线 + 红叉"没绑定"）→ L9 wide（电路 / 设置 / 验证器依次亮 + 解读标签 + "任何一环出错…"）→ L10 wide 大字 → L11 endCard，wide 静止。

## 未解决 / 备注
- 结束卡标题沿用 starter 的"ZK 与证明系统安全"（短主题名），没用 BRIEF 的长标题。
- 笔数字段 rollCounter 显示 1（与 32 格板第 1 格绿对应）。
- L8 的"没绑定"红叉落在结算机正面附近（曲线中点），可读，但略压在机身上。
- 整个世界（A、A后、B、C、D、E、F）按 layout.mjs 在本段重新摆放；各物件的初始状态取默认值，可能和别段末态略有差异。
