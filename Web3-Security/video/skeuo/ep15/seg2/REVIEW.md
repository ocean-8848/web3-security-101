start: bankB
end: flowC

# ep15 seg2 ② 授权书 · 自审

- 术语卡 report：术语卡 2 张：智能账户@66.21s×3.39s，Paymaster@69.75s×3.6s
- hyperframes check：Check passed，0 error。剩 3 条 warning：
  - composition_file_too_large（所有段都有）
  - line_unread：标题卡副标题只停 1.54 秒。时长由 segbase 固定，副标题用的是 BRIEF 原文
  - dead_stretch 20.28–23.52s：这段时间只有 SVG 里的动作（助理长出、授权书标签 bump），取样器看不到
- layout_lint：版面检查通过
- 看过的图：1 张 contact sheet（8 帧：6, 11, 31, 43, 58, 71, 76.5, 83.8s）

## 实现说明
- B 区（L0–L9）：kw 卡依次是"准确表述 / 三个关键词 / 比喻 / 比喻不成立处"。L2 的"一把私钥 = 签一笔"标签加删除线，再配"不再写死"，没有在钥匙和支票之间画等号，因为两者在世界里离得太远。L7 用柜台的 cashOut（4 叠现金）代表"财产被推给助理"，柜台没有金条。
- C 区（L10–L18）：flowC → envC（L11–L16）→ flowC（L17–L18，最后静止）。sorter 设 `letters:0`，三只排队的信封 walk 上传送带进箱，然后盖盖。另加一只大信封 `bdl`（一笔交易）走到道闸，L16 道闸抬起后通过。地面画了"1 验证 / 2 执行"两格，L17 加青蓝分隔线；L18 五个红虚线圈分别圈住交易信封、Bundler、道闸、智能账户、加油机。
- 为了和 seg3 衔接，C 区静态放了 seg3 要用的物件：hashFunnel、两张支票、链 A / 链 B、实现合约（normal）、会话密钥。

## 未解决
- seg3 开场时这些 C 区物件的状态（比如实现合约是否已经 broken）要和本段末尾一致，需要统筹核对。
- 本段末尾仍显示的标签：Bundler、EntryPoint、智能账户、Paymaster、1 验证、2 执行，以及红圈。如果 seg3 开场不显示这些，接缝处会有一次跳变。
