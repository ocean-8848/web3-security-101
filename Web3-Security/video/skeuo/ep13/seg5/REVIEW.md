start: upgC
end: haltE

# ep13 seg5 自审

- 术语卡 report：术语卡 6 张：铭文@5.83s×3.6s，闪电网络@39.62s×3.6s，mempool@49.57s×3.6s，范围证明@83.68s×3.6s，轻客户端@101.9s×3.6s，确定性@119.37s×3.6s（无推迟、无偏短）
- `hyperframes check`：0 error。剩余 warning：标题卡 line_unread（segbase 默认 0–1.6 s，L0 从 1.6 s 开始）、composition 文件行数、narration 时长差 0.08 s。
- `layout_lint`：版面检查通过。
- 看图：1 张 contact sheet（1、12、26、52、72、97、115、127、137 s）。

## 镜头
upgC →(L0) btcD →(L5) lnD →(L8) liquidD →(L13) cosmosE →(L15) haltE →(L16) haltR（段内专用，Jackfruit 角右移、左侧放代码卡 C）→(L17) haltE，段尾静止。

## 待统筹确认
1. **段尾和 seg6 起点不一致**：BRIEF 第 2 节、seg5 L17 要求段尾停在 Jackfruit 角（停机闸刀 + 警报灯）= `CAMS.haltE`，但 seg6 starter 的 `cam0` 是 `cosmosE`。建议把 seg6 的 cam0 改成 `haltE`（seg6 L0 本来就要从 E 拉到 F）。另一种做法是在本段 L17 末尾补一个推到 cosmosE 的镜头。
2. **C后开场状态是猜的**（seg4 还没写完）：coreModule 是 attacker（红），keycard 0.7，红钥匙，时间锁 frac 1，多签表 level 2；开场可见标签有"未审计版本""多签""时间锁"，在 L0 收起。需要和 seg4 段尾对齐。
3. 集装箱门开后，门内货物只露出一小条（kit-ext README 已知不足）；L1 用两条青蓝虚线从门内连到两台索引器。
