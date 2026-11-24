start: courtD
end: prepE

# ep25 seg5 自审

- 起始：cam0 = courtD（seg4 终点），开场放了 D 法院区物件（天平、云存储桶、私钥、挂锁、沙漏、"没收"/"实物返还申请"、"法院"牌），L0 右移到段内镜头 warR。结束：L16 后半起静止在 prepE（= seg6 cam0）。
- 段内镜头（只在本段）：warR = warE 右移 180px、notifyR = notifyE 右移 500px（给左侧代码卡 A 让列）；prepL = prepE 左移 520px（给右侧代码卡 B 让列）。
- 术语卡：术语卡 5 张：下一跳@15.74s×3.6s，SEAL 911@30.74s×3.6s，证据保全@42.16s×3.6s，安全港@61.88s×3.6s，启发式@94.79s×3.6s（没有推迟或偏短的卡）
- hyperframes check：0 error。剩下的警告：composition_file_too_large（segbase 生成的）、clip_media_fit（音频比时长短 0.06 秒）。
- layout_lint：版面检查通过。
- 看过的图：3 张拼图（共 13 帧）。

## 和 BRIEF 不一样的地方 / 未解决
- L16：放大镜和值守板在 prepE 里（layout.mjs），不在 warE。所以这一句的前半在 warE 让工位屏幕闪"大额流出"，到"每日更新"时切到 prepE：放大镜摆动扫过，值守板四格打勾。
- 代码卡 A 第 5 行没有连到时钟，因为 notifyR 里看不到时钟；L10 改成左上关键词"T+1h · 每小时更新清单"，时钟在画外走 60 分钟，L15 回 warE 时显示进度环 6 格全满 + "T+6h"。
- L7 快照相机的镜头朝 +v，没有正对机柜（物件朝向和 layout 位置的限制）；相片在远景里不太看得清。
- "完整报告"用 grayscale 滤镜做成灰色。
- seg4 还没写完，开场的 D 区物件状态（挂锁开没开、钥匙位置、95 点金色点阵）可能和 seg4 末帧不完全一样；交叉淡化加标题卡可以盖住。
