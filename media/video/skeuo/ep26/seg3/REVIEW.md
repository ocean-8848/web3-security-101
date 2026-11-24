start: CAMS.workshopB
end: CAMS.panelB

# ep26 seg3 自审

- 镜头：workshopB（L0–L4）→ injectB（L5–L9）→ memoryB（L10–L14）→ toolB（L15–L18）→ panelB（L19–L24，静止收尾）。起始镜头 = seg2 段尾，结束镜头 = seg4 的 cam0。
- termCards：`术语卡 3 张：NFT@31.74s×3.6s，SSH 私钥@89.7s×3.6s，运维面板@98s×3.6s`（无推迟、无偏短）
- `hyperframes check`：0 error；warning 3 条：composition 文件过大（segbase 产物）、标题卡副标题阅读时间偏短（segbase 标题卡 0–1.6 s）、dead_stretch 28.06–31.73 s（已在 29.4–30.8 s 加 NFT 出现、攻击者 bump、机器人灯，检查仍报，判断为 index 层取样问题）。
- `layout_lint`：版面检查通过（每 0.5 s，全段）。
- 看图：1 张 contact sheet（3/22/33/48/61/79/95/107/127 s）。

## 处理说明
- 提示注入只做概念：L16 工具说明翻开，内页一条灰色模糊条"隐藏指令（不展示）"；L11 伪造历史记录内容是灰色色块。画面无任何可用的注入文本。
- 入口细管、粗管、石板路、红虚线框、20 点点阵为原生 SVG。热钱包无屏幕参数，"transfer / approve" 用标签贴在钱包下方。
- 防火墙（E01）无 broken 状态：L8 用红虚线框 + "重写时被删"标签后淡出。运维面板变红同样用红虚线框 + 闪烁。
- L22 没有镜头右移（panelB 已包含台秤），改为台秤 bump + 标签，保证结尾停在 panelB。
- L21 智能体不在 panelB 画内，"AI 未被说服 · 维护者称"贴在运维面板上方。

## 未解决
- toolB 预设（layout.mjs）画面里运维面板占右半，钥匙靠近字幕区；没改 layout。
- 55.5 ETH 硬币的静止位置在面板左上后方，读得出但不显眼。
