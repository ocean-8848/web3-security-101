start: CAMS.E
end: CAMS.world（static，结束卡）

# seg6 自审

- 术语卡 report：`术语卡 1 张：不变量测试@8.46s×3.6s`
- `npx hyperframes check`：0 error。剩下的 warning 只有 composition_file_too_large（segbase 单文件）和 clip_media_fit（旁白 57.08s，槽位 57.14s）；info 是结束卡遮住胶囊（本来就该遮住）
- `layout_lint`：版面检查通过（每 0.5s 一次，查到 57.1s）
- 看图：3 张（contact-sheet-1、contact-sheet-2、47.5s 单帧）

## 镜头路线
E（L0 三张角色卡）→ balance（L1 横移回 A：卡 B 第 3 行亮、存/借/取/捐 四张勾选卡，每次后天平回到原位）→ donate（L2 放大镜扫 4 个按钮：3 个读卡器变绿，捐赠格红框闪 + "缺健康检查"）
→ user（段内镜头，A 区左侧的手机 + 借款人：L3 "收益来源?" + 红签，L4 屏幕换成三行清单 + 右侧 3 张勾选卡）
→ fix（段内镜头，入口 + 售货机 + 天平 + 坏账框 + 折扣牌：L5 事件卡、卡 A、天平左翘、坏账框出现；L6 第 4 行红闪后换成绿色 require，捐赠格换成读卡器并刷绿，天平回正；L7 折扣牌长出，红虚线连到坏账框，挂锁锁住 +"有上限"，坏账框缩没）
→ world（L8 六处区域地光 + "守住偿付不变量"）→ 结束卡（52.9s 起，静止到 57.14s）

## 段内改动 / 偏离 BRIEF
- 手机放在 A 区左侧（段内位置 PHONE），L3–L4 不回 E 区，省掉一来一回两次长距离横移。D 区储备保险柜的轮廓淡入没做（user 镜头里看不到 D 区）
- 段内位置 DISC / DLOCK（折扣牌和挂锁）和镜头 user / fix 都写在 build-story.mjs 里，shared/layout.mjs 没有改
- 结束卡比 L9 早 0.8s 出现，这样收束句能读满约 3.5s（craft line_unread）
- 结束卡标题用的是 script.json 的 title「DeFi 经济安全：代码没错，规则错了」，和收束句开头重复；BRIEF 写的是「DeFi 经济安全」。由统筹决定要不要用 `end.title` 覆盖

## 未解决 / 待看
- fix 镜头为了装下折扣牌，倍率偏小，L5–L7 物件看起来不大
- 挂锁降到牌子下沿以后没有再截图确认（lint 通过）
- E 区"暂停"闸刀按 seg5 L14 的状态画成拉下（on:false）
