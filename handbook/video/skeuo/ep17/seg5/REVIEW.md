start: CAMS.relayD
end: CAMS.quorumE (static from ~79.7s; next segment seg6 starts on quorumE)

# ep17 seg5 自审

- 术语卡 report：术语卡 2 张：法定数@34.06s×3.6s，客户端多样性@62.74s×3.6s
- `npx hyperframes check`：0 error。剩下的 warning：标题副标题 line_unread（segbase 的标题卡时长）；两处 dead_stretch（9.5–12.8s、22.6–25.7s，都是 #cam 里的镜头 / SVG 属性动作，取样器看不到）；text_below_floor（屏幕右侧小框里 peerPanel 铭牌上的小字，只是质感，下面有 22px 的说明文字）。
- `layout_lint`：版面检查通过。
- 看过的图：1 张 contact sheet（5/24/34/37/44/49/57/66/80s）。

## 镜头
relayD → L0 回摇到 bridgeA → L3 推到段内镜头 `quorumEc`（E 区核心物件，右侧留代码卡 A）→ L10 插回 failA → L11 回到 quorumEc → L12 拉到 quorumE，段尾一直停在这里。

## 备注 / 没解决的
- 回摇和推镜（D→A、A→E）会路过 B、C 两区。本段世界里只画了石板路和 C、D 的路牌，B 区路过时是空的。
- 代码卡第 1 行缩成 `src = [自建, 三方A, 三方B]`，原来那行太长会溢出。
- L1 的青蓝管"给别的 IP"是从被替换的节点往 +v 方向接出的一根短管，不是 layout 里的 APIPE.fake1。
- L8 / L9 的讲法是：按运营方算，一共只有 2 个独立来源，法定数 th 为 2。第三方 A 超时后液面从 2 降到 1，刻线不动，所以暂停。镜头切走的 L10 期间，E 区复位，给 L11 的冲突演示用。
- 代码卡第 4 行 `credit(tx)` 按 BRIEF 在 L11 末尾变绿。
