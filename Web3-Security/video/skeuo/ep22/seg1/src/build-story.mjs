// ep22/seg1「① 一张 SIM 卡」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 postS1（段内近景，BRIEF 的 postD 区域）。ends static on CAMS.simC
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   chainA       A 区块链 + 区块浏览器 + 放大镜 + "链上数据"（seg2 L10–L12）
//   linkB        B 线索桌 + 三类线索 + 目标档案 + 住址牌（seg2 L13–L17、L19 终点；seg3 起点）
//   simC         C SIM 卡 ×2 + 两部手机特写，题卡位置在右侧（seg1 L5–L11 终点；seg2 起点；seg3 L3–L8；seg6 L9–L13）
//   counterC     C 运营商柜台 + 伪造证件 + 号码转移锁 + 受害者手机 / 攻击者新卡（seg3 L0–L2；seg5 L14）
//   postD        D 广播塔 + 官方账号帖子 + 粉丝 + 粉丝钱包 + 入口牌 + 点阵（seg1 起点 L0–L4；seg3 L9–L18）
//   acctD        D 账号设置笔记本 + 硬件密钥 + 关键人员板 + 专用邮箱 + 被盗预案（seg5 L12–L20 终点；seg6 起点 L6–L8）
//   staffD       D 交易所员工工位 + 员工 + 手机 + 交易所金库 + 点阵（seg3 L19–L23 终点；seg4 起点）
//   homeE        E 门牌 + 家（书桌 / 窗）+ 持币人 + 家属 + 海报 + 暗号手机 + 点阵（seg4 L0–L7、L16–L17、L21 终点；seg5 起点 L0–L5；seg6 L0–L5）
//   safeE        E 多签金库 + 时间锁 + 扳手 / 算力机比喻 + 持币人 + 随身设备（seg2 L0–L9；seg5 L6–L11）
//   eventsE      E 门口旁的事件牌（seg4 L8–L15、L18–L20，"镜头稍右移"）
//   remoteF      E 右侧（金库 / 时间锁 / 持币人）到草地对面的 F 异地（门槛表）（seg5 L7、L10）
//   A            各区全景（pans pass through them）
//   B            
//   C            
//   D            
//   E            
//   F            
//   wide         整条街全景：A → F（seg2 L18；seg6 L14–L15 结束卡）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

// 段内镜头 postS1：D 区广播塔 + 帖子 + 粉丝 + 价格小折线的近景（postD 含入口牌 / 点阵，太远，帖子字读不清）
const RW = L.world.rects, [qx, qy] = Wp(L.POST.u, L.POST.v);
const postS1 = L.fit([RW.tower, RW.post, ...RW.fans, [qx + 150, qy - 220, qx + 350, qy - 60]], [240, 260, 1500, 860], 1.6);
const S = segInit(import.meta.url, { cams: { ...L.CAMS, postS1 }, ext: [E1, E4, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 不支持 scale 的物件：绕地面点包一层，并换算 anchors（SEGBASE 常见坑 1）
const wput = (key, o, mk, dy = 0) => {
  const [gx, gy] = at(o), k = o.scale;
  put(key, o, mk(o), dy, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const v = A[key][n]; if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number") A[key][n] = [gx + (v[0] - gx) * k, gy + (v[1] - gy) * k]; }
};
const FONTS = `font-family="Noto Sans SC, sans-serif"`;
const FAN = "#b0aca3";
// D 账号广场：广播塔 + 官方 X 账号帖子 + 五个粉丝
wput("tw", L.TOWER, (o) => O.tower(o, { id: "tw" }));
const feed = `<rect x="0" y="42" width="380" height="258" fill="#ffffff"/>
  <circle cx="44" cy="80" r="20" fill="#1c3f6e"/><text x="74" y="76" ${FONTS} font-size="20" font-weight="900" fill="#1c1c1c">SEC</text>
  <text x="74" y="98" ${FONTS} font-size="15" font-weight="700" fill="#7d776b">官方账号</text>
  <rect x="20" y="124" width="300" height="12" rx="6" fill="#e4dfd5"/><rect x="20" y="148" width="250" height="12" rx="6" fill="#e4dfd5"/>
  <rect x="20" y="190" width="320" height="12" rx="6" fill="#ece8e0"/><rect x="20" y="214" width="210" height="12" rx="6" fill="#ece8e0"/>`;
const post = `<rect x="0" y="42" width="380" height="258" fill="#ffffff"/>
  <rect x="16" y="54" width="348" height="234" rx="12" fill="#ffffff" stroke="#d6cfc2" stroke-width="2"/>
  <circle cx="50" cy="90" r="20" fill="#1c3f6e"/><text x="80" y="86" ${FONTS} font-size="20" font-weight="900" fill="#1c1c1c">SEC</text>
  <text x="80" y="108" ${FONTS} font-size="15" font-weight="700" fill="#7d776b">官方账号 · 刚刚</text>
  <g id="post-txt" opacity="0"><text x="32" y="170" ${FONTS} font-size="44" font-weight="900" fill="#1c1c1c">比特币 ETF</text>
  <text x="32" y="228" ${FONTS} font-size="44" font-weight="900" fill="#1c1c1c">获批</text></g>
  <rect x="32" y="248" width="120" height="10" rx="5" fill="#e4dfd5"/>
  <rect id="post-fake" x="8" y="46" width="364" height="250" rx="14" fill="none" stroke="#e0453a" stroke-width="6" stroke-dasharray="16 10" opacity="0"/>`;
wput("pst", L.POST, (o) => O.browserWin(o, { id: "pst", title: "官方 X 账号", page: feed, page2: post }));
L.FANS.forEach((q, i) => put(`f${i}`, q, O.person(q, { id: `f${i}`, scale: q.scale, color: FAN })));
// 价格小折线（帖子右侧，不标数字）
const [px0, py0] = at(L.POST);
const pxPts = [0, 40, 22, 30, 40, 52, 60, 6, 80, 70, 100, 18, 120, 64, 140, 26, 160, 50].reduce((a2, v, i, arr) => (i % 2 ? a2 : [...a2, `${px0 + 170 + arr[i]},${py0 - 190 + arr[i + 1]}`]), []).join(" ");
add(L.POST, S.hid("px", `<rect x="${px0 + 156}" y="${py0 - 206}" width="188" height="104" rx="10" fill="#ffffff" stroke="#d6cfc2" stroke-width="2"/>
  <polyline id="px-line" points="${pxPts}" fill="none" stroke="#e0453a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`));
// C 运营商门店：柜台 + 牌子 + 两部手机 + 两张 SIM 卡 + 攻击者
put("tel", L.TELLER, E4.tellerCounter(L.TELLER, { id: "tel", scale: L.TELLER.scale }));
put("csg", L.CARRIER_SIGN, E1.signBoard(L.CARRIER_SIGN, { id: "csg", style: "plate", text: "运营商" }));
const num = (y, fill) => `<text x="38" y="${y}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="800" fill="${fill}">•••• 0000</text>`;
const scrV = `<rect x="0" y="0" width="76" height="150" fill="#ffffff"/><rect x="0" y="0" width="76" height="30" fill="#1d93ba"/>
  <text x="38" y="21" text-anchor="middle" ${FONTS} font-size="14" font-weight="900" fill="#ffffff">手机号</text>
  <g id="pv-num">${num(70, "#1c1c1c")}<rect x="16" y="92" width="44" height="7" rx="3.5" fill="#ddd6c9"/></g>
  <text id="pv-none" x="38" y="120" text-anchor="middle" ${FONTS} font-size="13" font-weight="800" fill="#9a958c" opacity="0">无服务</text>`;
const scrA = `<rect x="0" y="0" width="76" height="150" fill="#3a3c40"/><text x="38" y="80" text-anchor="middle" ${FONTS} font-size="13" font-weight="800" fill="#9a958c">无 SIM</text>`;
const scrA2 = `<rect x="0" y="0" width="76" height="150" fill="#ffffff"/><rect x="0" y="0" width="76" height="30" fill="#e0453a"/>
  <text x="38" y="21" text-anchor="middle" ${FONTS} font-size="14" font-weight="900" fill="#ffffff">手机号</text>${num(70, "#c3352b")}`;
put("pv", L.PHONE_V, O.phone(L.PHONE_V, { id: "pv", screen: scrV }));
put("pa", L.PHONE_A, O.phone(L.PHONE_A, { id: "pa", screen: scrA, screen2: scrA2 }));
put("simV", L.SIM_V, X.simCard(L.SIM_V, { id: "simV", tone: "teal" }));
put("simA", L.SIM_A, X.simCard(L.SIM_A, { id: "simA", state: "attacker" }));
put("simA2", L.SIM_A, X.simCard(L.SIM_A, { id: "simA2", state: "attacker", stand: false }));
put("atk", L.ATK_C, O.person(L.ATK_C, { id: "atk", role: "attacker", scale: L.ATK_C.scale }));
const [sx, sy] = at(L.SIM_A), [phx, phy] = at(L.PHONE_A);
const INS = { x: Math.round(phx - sx - 6), y: Math.round(phy - sy + 22) };   // 平放新卡滑到攻击者手机底座前

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-tw", up(A.tw.top, 6), "官方账号", "lab-cs lab-sm");
lb("lb-pst", up(A.pst.top, 6), "SEC 官方 X 账号", "lab-ink lab-sm");
lb("lb-sys", up(A.pst.top, 8), "系统未被破解", "lab-g");
lb("lb-fake", [A.pst.ground[0], A.pst.ground[1] + 12], "假消息", "lab-rs", "t");
lb("lb-btc", [px0 + 250, py0 - 94], "BTC", "lab-ink lab-sm", "t");
L.FANS.forEach((q, i) => lb(`lb-f${i}`, up(A[`f${i}`].top, 4), "✓", "lab-gs lab-sm"));
lb("lb-pv", up(A.pv.top, 6), "受害者的手机号", "lab-cs lab-sm");
lb("lb-pa", up(A.pa.top, 6), "攻击者的新手机", "lab-r lab-sm");
lb("lb-simV", [A.simV.ground[0], A.simV.ground[1] + 14], "原卡", "lab-cs lab-sm", "t");
lb("lb-simA", [A.simA.ground[0], A.simA.ground[1] + 14], "新卡", "lab-rs lab-sm", "t");

// ---------------------------------------------------------------- 屏幕层卡片
S.curve("cv-num", S.scr("simC", A.pv.screen), S.scr("simC", A.simA.chip), { color: "#e0453a" });
const acctPt = [1600, 268];
S.curve("cv-acct", S.scr("simC", A.pa.screen), acctPt, { color: "#e0453a" });
const html = evt("ev-sec", "SEC 官方 X 账号 · 2024 年 1 月", { color: "#e0453a" })
  + evt("src-sec", `来源 · SEC 声明`, { top: 200 })
  + `<div class="s1-acct hide" id="acct">官方 X 账号 →</div>`
  + kw("kw-card", `一张小卡 · <b>整个市场</b>晃一下 ${gtag("解读")}`, { x: 300, y: 150, size: 40, accent: "#e0453a" })
  + `<div class="s1-quiz hide" id="quiz"><div class="q-h">先猜</div><div class="q-b hide" id="quiz-b">监管机构的账号<br>开了多因素认证吗<span class="q-m">？</span></div></div>`
  + `<div class="s1-road hide" id="road"><span>← 链上</span><i></i><span>线下 · 家 →</span></div>`;
const css = `
  .s1-acct { position:absolute; left:1440px; top:206px; padding:8px 20px 10px; background:#fff; border:3px dashed #e0453a; border-radius:12px;
    font:900 30px "Noto Sans SC",sans-serif; color:#c3352b; }
  .s1-quiz { position:absolute; left:1420px; top:330px; width:420px; background:#fffdf8; border-radius:22px; border-top:8px solid #2aa3c9;
    box-shadow:0 14px 30px rgba(70,60,40,.16); padding:22px 30px 30px; font-family:"Noto Sans SC",sans-serif; color:#1c1c1c; transform-origin:100% 0; }
  .s1-quiz .q-h { font-size:44px; font-weight:900; color:#1d93ba; }
  .s1-quiz .q-b { margin-top:12px; font-size:36px; font-weight:800; line-height:1.4; }
  .s1-quiz .q-m { display:block; font-size:110px; font-weight:900; color:#1d93ba; line-height:1.1; text-align:right; }
  .s1-road { position:absolute; left:300px; top:800px; width:1100px; display:flex; align-items:center; gap:22px;
    font:900 34px "Noto Sans SC",sans-serif; color:#1a85a8; }
  .s1-road i { flex:1; height:0; border-top:5px dashed #2aa3c9; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = { fake: w("假的", 2), fan: w("很多人", 3), card: w("SIM", 6), hand: w("接管", 6), ctl: w("控制权", 7) };
const t = (x) => f(x);

S.build({
  cam0: "postS1", sub: "没破解系统，只换了一张卡",
  grid: { u0: 2600, u1: 10000, v0: -4300, v1: 3500 }, box: [2500, -3500, 4700, 3100],   // 盖住 postD / simC（D → C 横移）
  shown: ["#lb-tw", "#lb-pst"], css, html,
  terms: [
    { id: "t0", t: "多因素认证", d: "登录时除了密码还要再验证一样东西", at: w("多因素认证", 10) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      tl.set("#simA2", { opacity: 0 }, 0);
      // ===== L0 塔发帖：信号弧闪，帖子卡弹出，事件卡 + 来源卡
      flash("#tw-wave-0, #tw-wave-1, #tw-wave-2, #tw-wave-3", ${t(S.LS[0] + 0.3)}, 4, 0.2);
      fadeIn("#pst-page2", ${t(S.LS[0] + 1.0)}, 0.4); pop("#ev-sec", ${t(S.LS[0] + 0.6)}); pop("#src-sec", ${t(S.LS[0] + 1.2)});
      // ===== L1 帖子大字
      fadeIn("#post-txt", ${t(S.LS[1] + 0.1)}, 0.35);
      // ===== L2 假消息：红虚线框 + 角标
      fadeIn("#post-fake", ${t(TM.fake)}, 0.3); pop("#lb-fake", ${t(TM.fake + 0.2)});
      // ===== L3 粉丝依次冒对勾
      [0, 1, 2, 3, 4].forEach((i) => { tl.to("#f" + i, { scale: 1.08, duration: 0.18, yoyo: true, repeat: 1, transformOrigin: "50% 100%" }, ${t(TM.fan)} + i * 0.3); pop("#lb-f" + i, ${t(TM.fan + 0.1)} + i * 0.3, 0.25); });
      // ===== L4 BTC 价格小折线剧烈抖动
      fadeIn("#px", ${t(S.LS[4] + 0.1)}, 0.3); pop("#lb-btc", ${t(S.LS[4] + 0.2)});
      tl.fromTo("#px-line", { scaleY: 0.3 }, { scaleY: 1.25, duration: 0.22, repeat: 9, yoyo: true, ease: "sine.inOut", transformOrigin: "50% 50%" }, ${t(S.LS[4] + 0.4)});
      out("#ev-sec, #src-sec", ${t(S.LS[4] + 2.6)});
      // ===== L5 系统未被破解 → 镜头左移到 C
      out("#lb-pst", ${t(S.LS[5])}, 0.2); pop("#lb-sys", ${t(S.LS[5] + 0.15)});
      cam(${t(S.LS[5] + 1.1)}, "simC", 1.8, "power2.inOut");
      out("#lb-sys, #lb-fake, #lb-btc, #lb-f0, #lb-f1, #lb-f2, #lb-f3, #lb-f4", ${t(S.LS[5] + 1.6)}, 0.3);
      pop("#lb-pv", ${t(S.LS[5] + 2.7)}); pop("#lb-pa", ${t(S.LS[5] + 2.8)}); pop("#lb-simV", ${t(S.LS[5] + 2.9)}); pop("#lb-simA", ${t(S.LS[5] + 3.0)});
      // ===== L6 关键画面：号码从受害者手机搬到红色新卡，新卡插进攻击者手机，屏幕亮起同一个号码
      tl.to("#pv-num", { opacity: 0.15, duration: 0.4 }, ${t(TM.card - 0.2)});
      draw("cv-num", ${t(TM.card)}, 0.9); X22.chip(tl, "simA", ${t(TM.card + 0.8)}, true, "red");
      tl.to("#simA", { opacity: 0, duration: 0.3 }, ${t(TM.hand - 0.3)}); tl.set("#simA2", { opacity: 1 }, ${t(TM.hand - 0.3)});
      tl.to("#simA2-mv", { x: ${INS.x}, y: ${INS.y}, duration: 0.9, ease: "power2.inOut" }, ${t(TM.hand - 0.2)});
      out("#lb-simA", ${t(TM.hand - 0.3)}, 0.2);
      fadeIn("#pa-scr2", ${t(TM.hand + 0.8)}, 0.3); fadeIn("#pv-none", ${t(TM.hand + 0.8)}, 0.3); out("#cv-num", ${t(TM.hand + 1.2)}, 0.3);
      // ===== L7 红线从攻击者手机伸回 D 区 → 官方 X 账号
      draw("cv-acct", ${t(S.LS[7] + 0.2)}, 1.0); pop("#acct", ${t(S.LS[7] + 1.1)});
      // ===== L8 新卡强调 + 解读关键词
      out("#cv-acct, #acct", ${t(S.LS[8] - 0.2)}, 0.2);
      tl.to("#simA2-mv", { scale: 1.2, duration: 0.35, ease: "back.out(2)", transformOrigin: "50% 50%" }, ${t(S.LS[8] + 0.2)}); X22.chipFlash(tl, "simA2", ${t(S.LS[8] + 0.2)}, 3, "red");
      pop("#kw-card", ${t(S.LS[8] + 0.6)});
      // ===== L9 题卡
      out("#kw-card", ${t(S.LS[9] - 0.2)}, 0.2); pop("#quiz", ${t(S.LS[9] + 0.1)});
      // ===== L10 题目 + 大问号
      fadeIn("#quiz-b", ${t(S.LS[10] + 0.3)}, 0.35);
      // ===== L11 题卡缩到右上胶囊下方；青蓝箭头沿石板路指向链上和线下
      tl.to("#quiz", { scale: 0.78, y: -210, duration: 0.8, ease: "power2.inOut" }, ${t(S.LS[11] + 0.2)});
      pop("#road", ${t(S.LS[11] + 1.0)}, 0.35);
`,
});
