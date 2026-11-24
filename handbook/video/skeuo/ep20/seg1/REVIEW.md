start: userE
end: barE

# ep20 seg1 ① 地址栏是对的 — review

## 改了什么
- 世界：石板路 + E01 pipe（与他段衔接）；主角 browserWin（title 留空，地址栏 `curve.fi` 用等宽字逐字打出 + 每字绿勾；绿锁覆盖层；page = Curve 页「连接钱包」→ L3「授权」；page2 = 克隆页，地址栏和绿锁完全相同，按钮红「授权」）；用户 person 0.6；phone（余额 → 红 0）；E09 cheque 0.9（L3 长出 + X9.sign 签名）；E01 vending 0.7「已审计」常绿光；57 红点阵（每点约 1 万美元）；6 枚红币 L4 飘走；L7–L8 浏览器红虚线框。
- 屏幕层：事件卡「Curve 域名劫持 · 2022 年 8 月」+ 来源卡「The Block 报道」→ L5 换「The Block、ForkLog 报道」；L8 右上画中画：ep20 dnsSignpost 被 X20.hijack 扳向红色「克隆站」，标「项目方称」很可能是 DNS 服务商被黑（layout 注释指出 D 在 E 左下方，单一镜头拍不到，故用画中画）；L9–L11 题卡「先猜 / ? 域名对 + 锁也在 = 页面是真的？」，L11 缩到右上胶囊下方，静止到段尾。
- 镜头：userE（L0–L5）→ contractE（L6–L8）→ barE（L9–段尾，静止）。

## 术语卡 report
术语卡 3 张：HTTPS@9.63s×3.6s，授权@14.86s×3.6s，解析@33.78s×3.6s

## 检查
- `npx hyperframes check`：0 error，通过。剩余 warning：标题卡 line_unread（segbase 自带 1.6 s 标题卡）、text_below_floor（浏览器/路牌/支票上的物件小字，属质感）、文件行数、音频 slot 差 0.06 s。
- `layout_lint`：版面检查通过（修过一次：「合约 · 已审计」标签挪到售货机底部，避开画中画）。
- 看图 2 张：contact sheet（7 帧）+ 36 s 单帧。

## 未解决
- userE 是共享镜头，物件在画面里偏小（用户、支票、点阵都较小），没改 shared/layout.mjs。
- 画中画里「克隆站」字与红箭头尖略贴近。
- seg2 起稿 cam0 是 contractE，本段结尾是 barE（按 BRIEF 第 2 节）；seg2 需从 barE 起再拉到 contractE。
