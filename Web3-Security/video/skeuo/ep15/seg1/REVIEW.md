start: hotA
end: bankB

# ep15 seg1 自审

- 术语卡 report：`术语卡 2 张：热钱包@3.96s×3.6s，EIP-7702@12.84s×3.6s`
- `npx hyperframes check`：通过（0 error；warning：composition_file_too_large、标题卡副标题 line_unread——segbase 标题卡固定 1.6 秒，非本段可调）
- `layout_lint`：版面检查通过（每 0.5s，到 42.9s）
- 抽帧：一张 contact sheet（4.5 / 12.5 / 16.5 / 20.3 / 24.5 / 30.5 / 35.5 / 41.5 s）

## 画面
- L0–L3 hotA：热钱包 + 门牌；机柜三灯依次变红、攻击者长出；授权支票（cheque attacker 0.45）从机柜飞到门牌，delegateTag attacker 落下；红虚线连到 coreModule "攻击者合约"。
- L4–L7 clockA：闸刀拉开、标签换"提现服务 · 已关闭"，挂牌轻摆；题卡"先猜 / 服务关了 → 委托失效？"；问号红虚线圈；L7 事件卡退场，题卡缩到右上（x/y/scale 变换），留到段尾。
- L8–L10 横移到 bankB 并静止：转账单（金额 · 收款人）→ 授权书（含地影）→ L10 授权书连影子放大 2 倍；大字卡依次换。
- 石板路（ROAD 带，X −1400..3800）原生 SVG 铺在最底层。

## 未解决 / 注意
- bankB 按整个 B 区（含 seg2 物件位置）取景，本段只放了牌子、柜台、本人、转账单、授权书，画面右上偏空（题卡正好放在那里）；转账单在 0.61 倍镜头里偏小，靠标签"转账单：金额 · 收款人"读。
- 柜台旁的"助理"、印章等 B 区物件留给 seg2 放。
