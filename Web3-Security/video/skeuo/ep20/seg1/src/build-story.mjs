// ep20/seg1「① 地址栏是对的」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.userE（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   devA         A 开发者工位：桌 + 开发者 + Docker + 代码仓库 + 会话令牌（seg5 L3–L5）
//   depsB        B 依赖传送带 + npm 牌 + 锁 + 维护者 / 攻击者 / 钓鱼邮件（seg4 L0–L5, L21）
//   buildB       B CI 机柜 + 离职清单 + 传送带（seg4 L6–L13）
//   hostC        C S3 桶（+ 第一台边缘节点、放大镜）（seg5 L6）
//   cdnC         C 边缘节点 ×3 + CDN 牌 + API Key + 5 小时沙漏 + 哈希日志（seg4 L14–L24 终点；seg5 起点）
//   dnsD         D 路牌 + 两台机柜（+ 两张证书）（seg3 L0–L8）
//   regD         D 注册商柜台 + 牌 + 攻击者 + 迁移时钟（seg3 L9–L16）
//   guardD       D 两把锁 + 硬件密钥 + 告警灯 + 备用域名牌 + 路牌（seg3 L17–L21 终点；seg4 起点）
//   userE        E 用户 + 浏览器 + 支票 + 钱包（+ 点阵）（seg1 起点 L0–L5；seg6 L0）
//   barE         E 地址栏 + 锁特写，右侧留题卡位（seg1 L9–L11 终点；seg6 L8）
//   contractE    E 用户 + 浏览器 + 合约（seg1 L6–L8；seg2 起点 L0–L5）
//   bankE        E 银行柜台比喻：柜台 + 金库 + 账本 + 三封汇款（seg2 L6–L10）
//   E            E 全区（seg6 L5–L7、L11 拉开）
//   msigF        F 多签全景（seg5 L0–L2）
//   signF        F 签名人 + 硬件钱包 + Safe 前端 + Bybit 牌（seg5 L7–L10, L17–L19）
//   coreF        F 保险柜 + 实现合约 + 门槛表（seg5 L11–L16）
//   toolF        F 独立工具 + 盾牌 + 关卡（+ 第三台硬件钱包，比哈希）（seg5 L20–L23 终点；seg6 起点）
//   A            各区全景（zone framings; seg5 L0 / L7 pans pass through them）
//   B            
//   C            
//   D            
//   F            
//   wide         发布街全景：A → F 全部（seg2 L11–L15 终点；seg3 起点；seg6 L12 结束卡）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.barE

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [X, E1, E9] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// street: road strip + pipe (continuity with the other segments)
{
  const R = L.ROAD, q = [[R.u0, R.v0], [R.u1, R.v0], [R.u1, R.v1], [R.u0, R.v1]].map(([u, v]) => Wp(u, v).map(f).join(",")).join(" ");
  add(L.BROWSER, `<polygon points="${q}" fill="#dcd7cc" stroke="#c9c2b4" stroke-width="2"/>`, -200000);
}
put("pipe", L.PIPE.o, E1.pipe(L.PIPE.o, { id: "pipe", pts: L.PIPE.pts, r: 7 }), -100000);

// hero browser: address bar typed by hand (title ""), green lock overlay, page = Curve page, page2 = clone (same bar + lock, red 授权)
const DOM = "curve.fi", CW = 10.4, AX = 114;
const lockG = `<rect x="90" y="11" width="20" height="20" fill="#ffffff"/><path d="M96 17v-2a4 4 0 0 1 8 0v2M94 17h12v9h-12z" fill="#e3f4ea" stroke="#1f9d55" stroke-width="2.4"/>`;
const letters = (typed) => [...DOM].map((ch, i) => `<text ${typed ? "" : `id="brw-ch${i}" opacity="0" `}x="${f(AX + i * CW)}" y="27" font-family="JetBrains Mono, Menlo, monospace" font-size="17" font-weight="700" fill="#1c1c1c">${ch}</text>`).join("");
const ticks = [...DOM].map((_, i) => `<path id="brw-tk${i}" opacity="0" d="M${f(AX + i * CW + 1)} 36.5l2.4 2.4l4.4-4.6" fill="none" stroke="#1f9d55" stroke-width="2" stroke-linecap="round"/>`).join("");
const body = (btn) => `<rect x="12" y="54" width="356" height="234" rx="8" fill="#f2f8fb"/>
  <circle cx="44" cy="86" r="16" fill="none" stroke="#1d93ba" stroke-width="5"/><circle cx="44" cy="86" r="7" fill="#1d93ba"/>
  <text x="70" y="96" font-family="Inter, sans-serif" font-size="28" font-weight="900" fill="#1c1c1c">Curve</text>
  <rect x="28" y="120" width="320" height="64" rx="10" fill="#ffffff" stroke="#ddd6c9" stroke-width="2"/>
  <rect x="44" y="136" width="150" height="11" rx="5.5" fill="#ddd6c9"/><rect x="44" y="158" width="210" height="11" rx="5.5" fill="#ddd6c9"/>${btn}`;
const btnSvg = (gid, fill, text, hidden) => `<g id="${gid}"${hidden ? ' opacity="0"' : ""}><rect x="28" y="204" width="320" height="64" rx="12" fill="${fill}"/>
  <text x="188" y="247" text-anchor="middle" font-family="Inter, sans-serif" font-size="28" font-weight="900" fill="#ffffff">${text}</text></g>`;
const page = body(btnSvg("brw-b1", "#1d93ba", "连接钱包") + btnSvg("brw-b2", "#1d93ba", "授权", true)) + letters(false) + ticks + `<g id="brw-lk" opacity="0">${lockG}</g>`;
const page2 = body(btnSvg("brw-b3", "#e0453a", "授权")) + letters(true) + lockG;
put("brw", L.BROWSER, O.browserWin(L.BROWSER, { id: "brw", title: "", page, page2 }));
put("usr", L.USER, O.person(L.USER, { id: "usr", role: "signer", scale: 0.6 }));
const scr1 = `<rect x="0" y="0" width="76" height="26" fill="#ece7dd"/><text x="38" y="18" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#5f5a50">钱包</text>
  <text x="38" y="52" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#5f5a50">余额</text>
  ${[0, 1, 2].map((i) => `<ellipse cx="38" cy="${96 - i * 12}" rx="20" ry="7" fill="#e8b84a" stroke="#a9792a" stroke-width="1.6"/>`).join("")}`;
const scr2 = `<rect x="0" y="0" width="76" height="150" fill="#fdeae7"/><text x="38" y="52" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#c3352b">余额</text>
  <text x="38" y="104" text-anchor="middle" font-family="Inter, sans-serif" font-size="44" font-weight="900" fill="#e0453a">0</text>`;
put("ph", L.PHONE, O.phone(L.PHONE, { id: "ph", screen: scr1, screen2: scr2 }));
put("chq", L.CHEQUE, E9.cheque(L.CHEQUE, { id: "chq", scale: 0.9, title: "授权", amount: "额度", signed: false, labels: ["spender", "额度", "代币", "截止", "用途"] }), 0, { grow: true });
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm", scale: 0.7, sign: "已审计", glow: true }));
// red dashed frame around the hero browser (L7–L8)
{
  const [x0, y0, x1, y1] = L.world.rects.browser;
  add(L.BROWSER, S.hid("brwfr", `<rect x="${f(x0 - 14)}" y="${f(y0 - 14)}" width="${f(x1 - x0 + 28)}" height="${f(y1 - y0 + 28)}" rx="18" fill="none" stroke="#e0453a" stroke-width="6" stroke-dasharray="18 12"/>`), 5000);
}
// 57 red dots (1 dot ≈ 1 万美元), on screen-facing grid at DOTS_E
const [dx, dy] = at(L.DOTS_E);
const DOTS = []; for (let i = 0; i < 57; i++) DOTS.push(`<circle class="dot57" cx="${f(dx + 14 + (i % 15) * 26)}" cy="${f(dy + 14 + Math.floor(i / 15) * 26)}" r="9" fill="#e0453a"/>`);
add(L.DOTS_E, S.hid("dots", DOTS.join("")), 400);
// red coins drifting away from the user (L4)
const [ux, uy] = A.usr.center;
const COINS = [0, 1, 2, 3, 4, 5].map((i) => `<g id="coin${i}"><circle cx="${f(ux + 30 + (i % 3) * 18)}" cy="${f(uy - 10 + Math.floor(i / 3) * 22)}" r="11" fill="#f2b8b2" stroke="#e0453a" stroke-width="3"/></g>`);
add(L.USER, S.hid("coins", COINS.join("")), 300);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-usr", up(A.usr.top, 6), "用户", "lab-cs lab-sm");
lb("lb-warn", up(A.brw.top, 6), "✓ 浏览器无警告", "lab-gs lab-sm");
lb("lb-amt", [dx + 210, dy - 6], "约 57 万美元", "lab-rs");
lb("lb-dot", [dx + 210, dy + 124], "每点约 1 万美元", "lab-r lab-sm", "t");
lb("lb-vm", [A.vm.ground[0], A.vm.ground[1] + 12], "合约 · 已审计 ✓ 没变", "lab-gs lab-sm", "t");
lb("lb-page", [A.brw.top[0] - 120, A.brw.top[1] + 4], "变的是页面", "lab-rs");

// ---------------------------------------------------------------- 屏幕层卡片
// picture-in-picture of zone D's signpost (L8): this street puts D left of E, so it is an inset, not a camera move
const SPo = { u: 0, v: 0 }, sp = X.dnsSignpost(SPo, { id: "dnsP", domain: DOM });
const [sgx, sgy] = at(SPo), [tx, ty] = sp.anchors.tip, [fx, fy] = sp.anchors.tipFlip;
const inset = `<div id="pip" class="pip hide"><div class="pip-h">域名路口 · DNS</div>
  <svg viewBox="${f(sgx - 200)} ${f(sgy - 270)} 400 300" width="320" height="240">${sp.svg}
    <text x="${f(tx + 6)}" y="${f(ty - 22)}" text-anchor="middle" font-family="Inter, sans-serif" font-size="28" font-weight="900" fill="#1f9d55">真服务器</text>
    <text x="${f(fx - 6)}" y="${f(fy - 22)}" text-anchor="middle" font-family="Inter, sans-serif" font-size="28" font-weight="900" fill="#e0453a">克隆站</text></svg>
  <div class="pip-f">${gtag("项目方称")} 很可能是 DNS 服务商被黑</div></div>`;
const quiz = `<div id="qz" class="qz hide"><div class="qz-h">先猜</div>
  <div id="qz-b" class="qz-b hide"><span class="qz-q">?</span><div>域名对 + 锁也在<br>= 页面是真的？</div></div></div>`;
const html = evt("ev", `<b>Curve 域名劫持</b> · 2022 年 8 月`, { color: "#e0453a" })
  + evt("src1", `${gtag("公开报道")} The Block 报道`, { top: 214 })
  + evt("src2", `${gtag("公开报道")} The Block、ForkLog 报道`, { top: 217 })
  + inset + quiz;
const css = `
  .pip { position: absolute; right: 48px; top: 120px; width: 360px; background: #ffffff; border-radius: 16px; padding: 12px 20px 14px; box-shadow: 0 6px 20px rgba(0,0,0,.12); border-left: 6px solid #e0453a; }
  .pip-h { font-size: 26px; font-weight: 900; color: #1c1c1c; }
  .pip svg { display: block; margin: 0 auto; }
  .pip-f { font-size: 28px; font-weight: 700; color: #3a3832; }
  .qz { position: absolute; left: 1352px; top: 360px; width: 500px; background: #ffffff; border-radius: 18px; padding: 18px 26px 22px; box-shadow: 0 6px 20px rgba(0,0,0,.12); border-left: 8px solid #2aa3c9; transform-origin: 100% 0%; }
  .qz-h { font-size: 44px; font-weight: 900; color: #1d93ba; }
  .qz-b { display: flex; align-items: center; gap: 22px; margin-top: 10px; font-size: 38px; font-weight: 900; line-height: 1.35; color: #1c1c1c; }
  .qz-q { font-size: 120px; line-height: 1; color: #e0453a; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  dom: w("域名", 1), lock: w("锁", 2), warn: w("警告", 2), ask: w("授权", 3), sign: w("签了名", 3),
  gone: w("转走", 4), loss: w("损失", 5), same: w("一样", 6), page: w("页面", 7), clone: w("克隆", 8), parse: w("解析", 8),
  noTouch: w("没碰合约", 8), q: w("页面", 10),
};
const t = (x) => f(x);
const TYPE = (TM.dom + 0.1), STEP = Math.min(0.22, (LE[1] - 0.4 - TYPE) / DOM.length);

S.build({
  cam0: "userE", sub: "域名对，锁也在，钱没了",
  grid: { u0: 5400, u1: 9700, v0: -2300, v1: 2100 }, box: [4800, -3000, 2700, 1600],   // 盖住 userE / contractE / barE
  shown: [], css, html,
  terms: [
    { id: "t0", t: "HTTPS", d: "浏览器和网站之间的加密连接", at: w("HTTPS", 2) },
    { id: "t1", t: "授权", d: "允许别人转走你的代币", at: w("授权", 3) },
    { id: "t2", t: "解析", d: "把域名换成服务器的地址", at: w("解析", 8) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      tl.set("#brw-lk", { transformOrigin: "50% 50%" }, 0);
      // ===== L0 2022 年 8 月，一名用户打开 Curve 的官网。
      pop("#lb-usr", ${t(LS[0] + 0.2)}); pop("#ev", ${t(LS[0] + 0.3)}); pop("#src1", ${t(LS[0] + 0.9)});
      // ===== L1 他输入的域名，一个字母都没错。
      ${JSON.stringify([...DOM])}.forEach((_, i) => { fadeIn("#brw-ch" + i, ${t(TYPE)} + i * ${t(STEP)}, 0.08); fadeIn("#brw-tk" + i, ${t(TYPE + 0.08)} + i * ${t(STEP)}, 0.12); });
      // ===== L2 地址栏旁边，HTTPS 的锁标志也在，浏览器没有任何警告。
      pop("#brw-lk", ${t(TM.lock)}); bump("#brw-lk", ${t(TM.lock + 0.35)}, 1.5, 1); pop("#lb-warn", ${t(TM.warn)});
      // ===== L3 页面请他授权，他签了名。
      out("#lb-warn", ${t(LS[3] - 0.2)}); out("[id^=brw-tk]", ${t(LS[3] - 0.2)});
      out("#brw-b1", ${t(TM.ask)}, 0.15); fadeIn("#brw-b2", ${t(TM.ask)}, 0.15); bump("#brw-b2", ${t(TM.ask + 0.2)}, 1.08, 1);
      grow("chq", ${t(TM.ask + 0.3)}); X9.sign(tl, "chq", ${t(TM.sign)}, 0.8);
      // ===== L4 签完之后，他的代币被转走。
      fadeIn("#ph-scr2", ${t(TM.gone)}, 0.3); out("#ph-scr", ${t(TM.gone)}, 0.3);
      fadeIn("#coins", ${t(TM.gone - 0.1)}, 0.15);
      [0, 1, 2, 3, 4, 5].forEach((i) => tl.to("#coin" + i, { x: 520 + i * 60, y: -260 - (i % 3) * 70, opacity: 0, duration: 1.6, ease: "power1.in" }, ${t(TM.gone)} + i * 0.12));
      // ===== L5 这一次，用户合计损失约 57 万美元。
      fadeIn("#dots", ${t(TM.loss - 0.05)}, 0.05); tl.from(".dot57", { opacity: 0, duration: 0.12, stagger: 0.02, immediateRender: false }, ${t(TM.loss)});
      pop("#lb-amt", ${t(TM.loss + 0.4)}); pop("#lb-dot", ${t(TM.loss + 0.9)});
      out("#src1", ${t(TM.loss + 0.6)}); pop("#src2", ${t(TM.loss + 0.8)});
      // ===== L6 Curve 的合约没有任何变化，审计过的代码也没出错，链上的一切都和昨天一样。
      out("#ev, #src2, #dots, #lb-amt, #lb-dot, #lb-usr", ${t(LS[6] - 0.2)});
      cam(${t(LS[6])}, "contractE", 1.2); pop("#lb-vm", ${t(LS[6] + 1.2)}); bump("#lb-vm", ${t(TM.same)}, 1.1, 1);
      // ===== L7 变的是页面。
      fadeIn("#brwfr", ${t(TM.page)}, 0.15); flash("#brwfr", ${t(TM.page + 0.15)}, 2, 0.2); pop("#lb-page", ${t(TM.page + 0.2)});
      // ===== L8 那天，这个域名被解析到一个克隆的前端，攻击者没碰合约，他换掉的是页面。
      pop("#pip", ${t(LS[8] + 0.1)}); X20.hijack(tl, "dnsP", ${t(TM.parse)}, 0.9);
      fadeIn("#brw-page2", ${t(TM.clone)}, 0.35); out("#brw-page", ${t(TM.clone)}, 0.35);
      bump("#lb-vm", ${t(TM.noTouch)}, 1.12, 1);
      // ===== L9 先猜一道题。
      out("#pip, #brwfr, #lb-page, #lb-vm", ${t(LS[9] - 0.2)});
      cam(${t(LS[9])}, "barE", 1.2); pop("#qz", ${t(LS[9] + 0.5)});
      // ===== L10 域名是对的，锁标志也在，这能证明，你看到的页面是真的吗？
      fadeIn("#qz-b", ${t(LS[10] + 0.1)}, 0.3); bump("#brw-lk", ${t(LS[10] + 1.6)}, 1.4, 1); bump(".qz-q", ${t(TM.q)}, 1.2, 1);
      // ===== L11 先记住这个问题。
      tl.to("#qz", { y: -240, scale: 0.7, duration: 0.6, ease: "power2.inOut" }, ${t(LS[11])});
`,
});
