start: CAMS.hashC
end: CAMS.flowC (static; = seg4 cam0)

# ep15 seg3 自审

- 术语卡 report：术语卡 5 张：哈希@6.41s×3.6s，nonce@43.2s×3.59s，重放@46.93s×3.6s，owner@62.64s×3.6s，会话密钥@81.92s×3.6s
- `npx hyperframes check`：0 error。警告：composition_file_too_large（segbase 通病）、标题卡副标题 line_unread（segbase 标题卡 1.6 秒，非本段可改）。
- `layout_lint`：版面检查通过（每 0.5s，至 95.0s）。
- 镜头：hashC（L0–L6）→ payC（L7–L11）→ 段内 `ownerX`（L12–L19，= ownerC 加上链 A 右侧"删除 owner"支票和复印件落点、红信封）→ bicoC（L20–L21）→ flowC（L22–L23，段尾静止）。
- 段内新增位置：DCHQ cz(1720,-380)、DCHQ_B cz(1720,-60)、ATKL cz(440,-40)（C 区相对 px），支票与红信封用 S.hid 包层，开场隐藏。
- 看图：1 张 contact sheet（8 帧：10 / 24.5 / 28.3 / 47 / 56 / 71 / 80 / 93s）。

## 未解决 / 注意

- hashC 下方较挤：L2 的"受保护 / 没进哈希"与 L5–L6 的哈希标签压在支票一角上（lint 不算重叠，可读）。
- accountSafe 沿用 ep05 物件，柜体上的 TRON / USDT 质感字仍在（倍率下看不清）。
- 实现合约（impl）开场为 normal，L20 才切 leverBad + 红铭牌；若 seg2 结尾已画成 broken，段间会有一处状态差。
