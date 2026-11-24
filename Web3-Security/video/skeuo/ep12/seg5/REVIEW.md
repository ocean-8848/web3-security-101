start: CAMS.eRpc
end: CAMS.cexF (static from LS[15]; last move ends ~92 s)

# seg5 自审

- 术语卡 report：术语卡 4 张：测试向量@31.53s×3.6s，假充值@93.4s×3.6s，幂等键@101.09s×3.6s，重组@106.34s×3.6s
- `hyperframes check`：passed，0 error（warning 只有 composition_file_too_large、narration 时长差 0.06 s）
- `layout_lint`：版面检查通过（每 0.5 s，至 109.3 s）
- 看图：snapshot 12 帧，只看了 2 张 contact sheet

## 镜头路线
eRpc → filesE（L0）→ validL（L1–L2）→ chqA（L3–L4）→ eTreeZ（L5–L6）→ eKeyL（L7）→ cL（L8–L9）→ upgrade（L10）→ cexF（L11–L12）→ cexTag（L13–L14）→ cexF（L15–L17，段尾静止）。
段内专用镜头（validL / chqA / eTreeZ / eKeyL / cL）都是 `L.fit` 就地算的，给左侧代码卡或右侧清单卡让位；没改 shared/layout.mjs。

## 与 seg4 衔接
首帧按 seg4 末帧摆：两台红 RPC、第三台 RPC、两个新验证者、两把已拉下的闸刀、rsETH 前被拦下的红信封、Merkle 树根 "0x00" 红 + 红虚线框 + 路径亮、屏幕关键词卡"数量 + 来源 都要冗余"。L0 第一次移镜时淡出红 RPC 覆盖层、红信封和关键词卡。

## 未解决 / 可再看
- cexF（共享镜头）比较远，F 区物件和回执签偏小，左侧能看到 C 区的闸刀和延迟队列；段尾必须停在 cexF，所以没换。
- L2 用三块色地（组织 / 地域 / 基础设施）表示"独立"，验证者小人本身没有移动。
- L10 时间锁是在升级钥匙旁边长出来，没有真的"套住"钥匙。
- L4 防重放画在 A 区（支票复印件变红 + "已处理 ✕"），没回 B 区岗亭，省一次镜头往返。
- seg4 的红点阵等其他残留在 seg4 末帧已隐藏，没有复刻。
