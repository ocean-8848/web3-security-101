start: lineC
end: backupC

# ep18 seg3 REVIEW

- 起始镜头 `CAMS.lineC`（starter 的 cam0），止于 `CAMS.backupC`（静止，文件头已写 `ends static on CAMS.backupC`）。镜头路线：lineC → genC (L2) → storeC (L11) → releaseC (L16) → backupC (L21)。
- 术语卡 report：术语卡 5 张：靶号地址@13.51s×3.6s，GPU@20.5s×3.6s，遥测@63.56s×3.6s，GitHub secrets@87.68s×3.6s，CI@92.16s×3.6s（无推迟、无偏短）。
- `npx hyperframes check`：0 error。警告：composition_file_too_large、narration 时长差 0.06s、3 处 dead_stretch（3.5–7.4s 牌子依次长出 + 传送带走动，L7 29–32s 门牌/金币 bump，L18 80–83s 红线淡入；画面里有小动作，采样器判不出，未加 data-hold）。
- `layout_lint`：版面检查通过。
- 看图：1 张 contact sheet（5 / 39.5 / 81.5 / 127.5s）。
- 物件全部复用：kit safe/hwWallet/key/phone/dbLedger/browserWin/rack/person/clock；E01 signBoard/pipe/letter；E02 conveyor/prngCounter/gpuRig/addrPlate；E05 keycard。不支持 scale 的 gpuRig/safe/browserWin/rack 绕地面点包一层并换算 anchors。点阵、金币、支管、闸门、金条、云账户框、分离后的青蓝框为原生 SVG。时钟位置为段内补点（ADMIN_C 右后方）。

## 未解决 / 留意
- shared 镜头 genC / storeC / releaseC / backupC 的缩放约 0.57–0.83，物件在画面中偏小（layout 设计如此，没改）。
- 事件卡里的金额挪到点阵图例里（避免右上卡片出框）：e2/e3/e4 文案已缩短。
- 字幕按逐字估算计时，L0 牌子长出提前 0.5s 对齐口播。
