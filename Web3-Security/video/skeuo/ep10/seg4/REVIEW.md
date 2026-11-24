start: CAMS.D
end: CAMS.A (static, last ~1 s)

# seg4 自审

- 术语卡 report：术语卡 4 张：构造函数@2.57s×3.6s，修饰器@39.44s×3.6s，自毁@61.95s×3.6s，回归测试@113.63s×3.6s
- `npx hyperframes check`：0 error。警告：composition_file_too_large、narration 时长差 0.06 s、标题副标题停留 1.53 s（starter 的标题卡）、3 处 dead_stretch（6.2–9.4 / 31.0–34.6 / 51.7–55.1 s，动作在 #cam 内 SVG 上，取样器看不到；已加齿轮转动 / bump）、代码卡字号 22 px 低于 28 px 下限。
- `layout_lint`：版面检查通过。
- 看图：snapshot 10 帧，看了 2 张 contact sheet。

## 镜头
D →（L0）E2 → L14 沿前排经 B 到 A → L15 nomad → L18 A，段尾静止在 A。
段内镜头：E2 = E 区整体右移（左侧留给卡 D），nomad = 检查口近景左移（右侧留给卡 E），都在本文件里定义，未改 shared/layout.mjs。

## 未解决 / 留意
- 卡 D、卡 E 代码行字号压到 22 px 才放得下（check 提示低于 28 px）；卡 D 第 3 行改写为 `new ERC1967Proxy(impl, initCall); // 同一笔`，第 2 行省略参数。
- E 区主人卡（keycard 0.8）在 E2 镜头下约 55 px，能看出颜色，字读不出，靠标签说明。
- D 区的两本手册在 E2 镜头里露在画面顶边（胶囊附近），属于同一世界的背景物件。
- A 区没放 seg1 的复印攻击者人群；B 区只放了主角售货机、存储柜、V2 机芯、工程师、两位用户（L14 经过用）。
- L20 末尾清单卡压住桥身下沿一点。
