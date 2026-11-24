start: CAMS.guardD (= seg3 end)
end: CAMS.cdnC (= seg5 cam0), static from ~120.6 s

# ep20 seg4 review

- 段内镜头（只在本段）：Bl（B 全区，右侧留画中画）、BC（B→C 关键画面）、BCd（防线，顶部留代码卡 A）、cdnW（C 全区，右侧留用户卡 / 点阵）
- 路线：guardD → depsB（L0）→ Bl（L4）→ buildB（L6）→ BC（L9）→ Bl（L12）→ cdnW（L14）→ BCd（L21）→ cdnC（L24，静止收尾）
- termCards report：术语卡 6 张：npm@8.16s×3.6s，会话@12.73s×3.6s，DApp@17.01s×3.6s，边缘节点@73.87s×3.6s，API Key@89.11s×3.6s，子资源完整性@110.7s×3.6s
- hyperframes check：0 error；剩余 warning：标题卡副标题停留 1.53 s（segbase 标题卡固有）、3.78–6.93 s dead_stretch（传送带条纹 + 包裹 walk 在动，检查器看不到属性变换）、composition 文件过大（info 级）
- layout_lint：1 处，96.0 s 用户卡 u1 ↔ u1r 交叉淡变的同一瞬间 100% 重叠（有意的 swap，不是问题）
- 截图：3 张拼图（共 15 帧）
- 新增 check warning：carry-over 的 ck "换服务商当天" 只停留 1.77 s（承接 seg3，有意为之）

## 未解决 / 需统筹核对
- 开场 D 区已按 seg3 build-story 终态复刻：路牌指向克隆站、红牌面、DNSSEC 光；两把锁（0.5）挂在立杆上，硬件密钥（0.6）放在柜台上；监控灯、"备用域名"牌、时钟（+180 分钟）、工程师、三块小路牌（compound / …… 为红色，celer 已恢复）、bcn2、两张证书；标签 注册商锁 / 注册局锁 / DNSSEC / 监控 / 提前公布 和 ck "换服务商当天" 一开场就显示，在第一次镜头移动（L0）时淡出。没有做逐像素比对。
- L15–L20 的用户小卡是屏幕层卡片，靠在 cdnW 的边缘节点上方，和 CDN 牌略有挤靠，可读。
- 第 9 句"再流进 E 的浏览器"用右下画中画小窗（pip2）表示，没有把镜头移到 E。
