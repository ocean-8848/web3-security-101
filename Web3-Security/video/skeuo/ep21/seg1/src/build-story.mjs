// ep21/seg1「① 一份面试作业」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.inviteA（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   inviteA      A 招聘者 + 手机邀约 + 作业包裹 + 高薪牌（seg1 起点 L0–L3；seg3 L0–L2、L16–L17）
//   laptopC      C 工作电脑特写，右侧留题卡位（x > 1300）（seg1 L9–L11 终点；seg2 起点；seg3 L3；seg6 L8–L10）
//   deskC        C 三张工位 + 工作电脑 + 部署系统机柜 + 部署令牌 + 员工（seg1 L4–L8；seg2 L0–L2；seg3 L8–L14；seg6 L11–L13）
//   isoC         C 隔离环境集装箱 + 三类设备（硬件密钥 / 工作电脑 / 工位）+ 包裹（seg5 L1–L4）
//   signD        D 签名人 + 笔记本 + 多签前端 + 硬件钱包 + 门槛表（seg2 L3–L5、L10；seg3 L18–L21 终点；seg4 起点）
//   vaultD       D 金库三门比喻：金库 + 三名签名人 + 三把钥匙 + 三封信（seg2 L6–L9）
//   flowD        D 支票四角色 + 电话 + 公章 + 签名人（seg5 L5–L10）
//   meetE        E 会议桌 + 笔记本弹窗 + 高管 + 热钱包 + GrassCall（seg4 L0–L9）
//   gateB        B 门禁 + 权限板 + 匿名报告 + 离职清单 + 访问日志（seg5 L11、L13–L19 终点；seg6 起点）
//   hireB        B 护照核验 + 放大镜 + 门禁 + 攻击者（+ 点阵）（seg4 L10–L14；seg5 L12）
//   counterF     F 客服柜台 + 用户数据 + 攻击者 + 运营电脑 + 运营钱包 + 告警灯（seg4 L15–L20 终点；seg5 起点）
//   homeG        G 用户家（seg6 L0–L7）
//   A            各区全景（pans pass through them）
//   B            
//   C            
//   D            
//   wide         园区全景：A → G 全部（seg2 L11–L18 终点；seg3 起点；seg6 L14–L15 结束卡）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
// ends static on CAMS.laptopC
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E5, E7] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件
// 物件不支持 scale 时：绕地面点包一层并换算 anchors（SEGBASE 常见坑 1）
const putW = (key, o, r, dy = 0) => {
  const [gx, gy] = at(o), k = o.scale;
  put(key, o, r, dy, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; }
};
// 石板路（A → C 段，原生 SVG，压在最底下）
{
  const R = L.ROAD, u1 = 5600, P = (u, v) => Wp(u, v).map((x) => Math.round(x)).join(",");
  let s = `<polygon points="${P(R.u0, R.v0)} ${P(u1, R.v0)} ${P(u1, R.v1)} ${P(R.u0, R.v1)}" fill="#dcd8cf" stroke="#cbc5b9" stroke-width="2"/>`;
  for (let u = R.u0 + 160; u < u1; u += 160) s += `<line x1="${Wp(u, R.v0)[0]}" y1="${Wp(u, R.v0)[1]}" x2="${Wp(u, R.v1)[0]}" y2="${Wp(u, R.v1)[1]}" stroke="#cbc5b9" stroke-width="2"/>`;
  add({ u: 0, v: -100000 }, s);
}
const txt = (x, y, s, size, fill = "#1c1c1c", w8 = 700, anc = "middle") => `<text x="${x}" y="${y}" font-size="${size}" font-weight="${w8}" fill="${fill}" text-anchor="${anc}" font-family="PingFang SC, Noto Sans SC, sans-serif">${s}</text>`;
// A 招聘角
const phScr = `<rect x="0" y="0" width="76" height="150" fill="#f6f3ec"/><rect x="0" y="0" width="76" height="24" fill="#1d93ba"/>` + txt(38, 17, "消息", 12, "#fff") +
  `<rect x="6" y="34" width="64" height="66" rx="8" fill="#ffffff" stroke="#cfc8bb"/>` + txt(38, 58, "面试邀约", 13) + txt(38, 80, "高薪岗位", 11, "#5f5a50", 400) +
  `<rect x="10" y="112" width="56" height="24" rx="7" fill="#1f9d55"/>` + txt(38, 129, "接受", 12, "#fff");
const tile = (y, c) => `<rect x="4" y="${y}" width="68" height="68" rx="6" fill="${c}"/><circle cx="38" cy="${y + 26}" r="11" fill="#9aa0a8"/><path d="M18 ${y + 64}Q38 ${y + 34} 58 ${y + 64}Z" fill="#9aa0a8"/>`;
const phScr2 = `<rect x="0" y="0" width="76" height="150" fill="#26272a"/>` + tile(4, "#3a3d43") + tile(78, "#44484f");
put("rec", L.RECRUITER, O.person(L.RECRUITER, { id: "rec", role: "attacker", scale: L.RECRUITER.scale }));
put("hrc", S.rel(L.RECRUITER, 0, 30), E5.keycard({ ...S.rel(L.RECRUITER, 0, 30) }, { id: "hrc", text: "HR", color: "#2aa3c9", scale: 0.35, z: 70 }), 2);
put("ph", L.PHONE_A, O.phone(L.PHONE_A, { id: "ph", screen: phScr, screen2: phScr2 }));
put("hire", L.HIRE_SIGN, E1.signBoard(L.HIRE_SIGN, { id: "hire", style: "wood", text: "高薪岗位", size: 30 }));
const [pax, pay] = at(L.PARCEL_A), [pcx, pcy] = at(L.PARCEL_C);
put("pa", L.PARCEL_A, E7.parcel(L.PARCEL_A, { id: "pa", scale: L.PARCEL_A.scale }), 0, { wrap: (svg) => `<g id="pa-mv" opacity="0">${svg}</g>` });
// B 门禁（包裹路过时道闸抬起）
put("gate", L.GATE, O.checkpoint(L.GATE, { id: "gate", n: "入" }));
// C 工程师工位
put("lap", L.LAPTOP, O.laptop(L.LAPTOP, { id: "lap", screen: `<rect x="0" y="0" width="222" height="146" fill="#1f2328"/><rect x="0" y="0" width="222" height="20" fill="#2d333b"/>` + [0,1,2,3,4,5].map((i) => `<rect x="${14 + (i % 3) * 12}" y="${32 + i * 18}" width="${[120, 90, 140, 70, 110, 60][i]}" height="8" rx="4" fill="${["#2aa3c9", "#9aa0a8", "#1f9d55", "#9aa0a8", "#2aa3c9", "#9aa0a8"][i]}"/>`).join(""), screen2: `<rect x="0" y="0" width="222" height="146" fill="#e0453a"/>` + txt(111, 70, "⚠", 40, "#fff") + txt(111, 112, "已被控制", 22, "#fff") }));
const dkRed = `<rect x="0" y="0" width="148" height="88" fill="#e0453a"/>` + txt(74, 56, "已被控制", 22, "#fff");
L.DESKS.forEach((o, i) => putW("dk" + i, o, O.desk(o, { id: "dk" + i, screen2: dkRed })));
L.ENGS.forEach((o, i) => put("eng" + i, o, O.person(o, { id: "eng" + i, role: "engineer", scale: o.scale })));
putW("rack", L.RACK, O.rack(L.RACK, { id: "rack", tag: "部署系统" }));
put("tok", L.TOKEN, O.key(L.TOKEN, { id: "tok" }), 0, { wrap: (svg) => `<g id="tok-mv">${svg}</g>` });
const ATK = { ...S.rel(L.TOKEN, -40, 110), scale: 0.45 };
put("atk", ATK, O.person(ATK, { id: "atk", role: "attacker", scale: 0.45 }), 0, { wrap: (svg) => S.hid("atk-h", svg) });
// 点阵：63 点，每点约 1 亿美元
{
  const [gx, gy] = at(L.DOTS_C), d = [];
  for (let i = 0; i < 63; i++) d.push(`<circle cx="${gx + 14 + (i % 13) * 30}" cy="${gy + 14 + Math.floor(i / 13) * 25}" r="9" fill="#e0453a"/>`);
  add(L.DOTS_C, S.hid("dots", d.join("")), 60);
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-rec", up(A.rec.top, 6), "招聘者", "lab-ink lab-sm");
lb("lb-plat", up(A.ph.top, 6), "正规平台 · 视频面试", "lab-gs lab-sm");
lb("lb-pa", up(A.pa.top, 6), "作业", "lab-ink lab-sm");
lb("lb-repo", [A.pa.center[0] + 34, A.pa.center[1]], "代码仓库", "lab-cs lab-sm", "l");
lb("lb-lap", up(A.lap.top, 6), "工作电脑", "lab-cs lab-sm");
lb("lb-pc", [pcx + 40, pcy - 20], "作业", "lab-ink lab-sm", "l");
lb("lb-eng", [A.eng0.top[0] - 40, A.eng0.top[1] + 10], "Binance 工程师", "lab-ink lab-sm", "r");
lb("lb-tok", [A.tok.center[0] + 70, A.tok.center[1] + 10], "部署令牌", "lab-ink lab-sm", "l");
lb("lb-dots", [at(L.DOTS_C)[0] + 200, at(L.DOTS_C)[1] + 150], "每点约 1 亿美元 · 受影响资产约 63.4 亿美元", "lab-rs lab-sm", "t");
lb("lb-q", [A.lap.top[0] - 150, A.lap.top[1] + 40], "?", "lab-r q-big");

// ---------------------------------------------------------------- 屏幕层卡片
const pL = S.scr("deskC", A.lap.screen), pD0 = S.scr("deskC", A.dk0.screen), pD1 = S.scr("deskC", A.dk1.screen), pT = S.scr("deskC", A.tok.center);
S.curve("cv0", [pL[0] - 60, pL[1]], [pD0[0] + 30, pD0[1]], { color: "#e0453a" });
S.curve("cv1", [pL[0] + 60, pL[1]], [pD1[0] - 30, pD1[1]], { color: "#e0453a" });
S.curve("cv2", [pD1[0], pD1[1] + 20], [pT[0] - 30, pT[1]], { color: "#e0453a" });
const ckX = Math.round(pL[0] + 150), ckY = Math.round(pL[1] - 170);
const html =
  evt("ev0", `<b>Binance</b> · 2026 年 9 月 ${gtag("Binance 初步报告")}`) +
  ck("ck-pw", "输入密码", { x: ckX, y: ckY, w: 300, kind: "n", icon: "✕" }) +
  ck("ck-ln", "点钓鱼链接", { x: ckX, y: ckY + 70, w: 300, kind: "n", icon: "✕" }) +
  kw("kw-q", `先猜<br><span id="q-b">没密码 + 没链接 = <b>怎么进来？</b></span>`, { x: 1300, y: 360, size: 40, accent: "#e0453a" });
const css = `#ck-pw .sb-ck-t, #ck-ln .sb-ck-t { text-decoration: line-through; color: #8a857b; }
  #kw-q { width: 540px; transform-origin: 100% 0; } #q-b { opacity: 0; font-size: 36px; }
  .q-big { font-size: 110px !important; line-height: 1; padding: 4px 26px !important; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  invite: w("面试邀约", 0), video: w("视频面试", 1), hw: w("作业", 2), repo: w("代码仓库", 3), dl: w("下载", 4),
  pw: w("密码", 5), link: w("钓鱼链接", 5), from: w("工程师的电脑", 6), more: w("更多同事", 6), token: w("部署令牌", 7),
  asset: w("受影响", 8), q: w("靠什么", 10),
};
const t = (x) => f(x);
const PAN = LS[4] + 0.1, PDUR = 2.6;          // A → C 横移，包裹同步滑过 B
const dX = pcx - pax, dY = pcy - pay;

S.build({
  cam0: "inviteA", sub: "没输密码，也没点链接",
  grid: { u0: -1700, u1: 7100, v0: -4700, v1: 4000 }, box: [-1200, -2400, 6400, 3200],   // 盖住 inviteA / deskC / laptopC（A → C 横移）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "代码仓库", d: "存放项目源码和历史的地方", at: w("代码仓库", 3) },
    { id: "t1", t: "部署令牌", d: "让程序发布上线的访问凭证", at: w("部署令牌", 7) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 2026 年 9 月，一名 Binance 工程师接到面试邀约。
      pop("#ev0", ${t(LS[0] + 0.2)}); pop("#lb-rec", ${t(LS[0] + 0.5)}); bump("#ph", ${t(TM.invite)}, 1.06, 1);
      // ===== L1 邀约来自正规的招聘平台，他也参加了视频面试，看上去一切正常。
      KIT.swap(tl, "#ph-scr", "#ph-scr2", ${t(TM.video)}); pop("#lb-plat", ${t(TM.video + 0.2)});
      // ===== L2 面试结束前，对方给了他一份作业。
      fadeIn("#pa-mv", ${t(TM.hw)}, 0.3); pop("#lb-pa", ${t(TM.hw + 0.2)});
      // ===== L3 一个代码仓库，要他下载下来完成。
      pop("#lb-repo", ${t(TM.repo)});
      // ===== L4 他把仓库下载到了工作电脑上。
      out("#ev0, #lb-rec, #lb-plat, #lb-pa, #lb-repo", ${t(PAN - 0.25)}, 0.2);
      cam(${t(PAN)}, "deskC", ${PDUR});
      tl.to("#pa-mv", { x: ${Math.round(dX)}, y: ${Math.round(dY)}, duration: ${PDUR}, ease: "power2.inOut" }, ${t(PAN)});
      KIT.arm(tl, "gate", ${t(PAN + 0.5)}, true, 0.5); KIT.arm(tl, "gate", ${t(PAN + 1.7)}, false, 0.5);
      pop("#lb-lap", ${t(PAN + PDUR - 0.3)}); pop("#lb-pc", ${t(PAN + PDUR)}); pop("#lb-eng", ${t(PAN + PDUR + 0.1)});
      // ===== L5 他没有输入密码，也没有点任何钓鱼链接。
      pop("#ck-pw", ${t(TM.pw)}); pop("#ck-ln", ${t(TM.link)});
      // ===== L6 到了 10 月，攻击者从工程师的电脑出发，控制了更多同事的电脑。
      out("#ck-pw, #ck-ln", ${t(TM.from - 0.1)}, 0.2);
      KIT.swap(tl, "#lap-scr", "#lap-scr2", ${t(TM.from)}, 0.3); bump("#lap", ${t(TM.from)}, 1.04, 1);
      draw("cv0", ${t(TM.more)}, 0.6); draw("cv1", ${t(TM.more + 0.2)}, 0.6);
      KIT.swap(tl, "#dk0-scr", "#dk0-scr2", ${t(TM.more + 0.7)}); KIT.swap(tl, "#dk1-scr", "#dk1-scr2", ${t(TM.more + 0.9)});
      // ===== L7 最后，他们找到了部署令牌。
      pop("#lb-tok", ${t(LS[7])}); draw("cv2", ${t(LS[7] + 0.1)}, 0.6); fadeIn("#atk-h", ${t(TM.token)}, 0.3);
      tl.to("#tok-mv", { x: -30, y: 40, duration: 0.6, ease: "power2.out" }, ${t(TM.token + 0.5)});
      // ===== L8 这次事件里，受影响的资产约 63.4 亿美元。
      fadeIn("#dots", ${t(TM.asset)}, 0.1);
      tl.fromTo("#dots circle", { opacity: 0 }, { opacity: 1, duration: 0.12, stagger: 0.02, immediateRender: false }, ${t(TM.asset)});
      pop("#lb-dots", ${t(TM.asset + 1.0)});
      // ===== L9 先猜一道题。
      out("#cv0, #cv1, #cv2, #lb-tok, #lb-dots, #dots, #atk-h, #lb-eng", ${t(LS[9] - 0.2)}, 0.2);
      KIT.swap(tl, "#lap-scr2", "#lap-scr", ${t(LS[9] - 0.2)}); KIT.swap(tl, "#dk0-scr2", "#dk0-scr", ${t(LS[9] - 0.2)}); KIT.swap(tl, "#dk1-scr2", "#dk1-scr", ${t(LS[9] - 0.2)});
      tl.to("#tok-mv", { x: 0, y: 0, duration: 0.3 }, ${t(LS[9] - 0.2)});
      cam(${t(LS[9])}, "laptopC", 1.0); pop("#kw-q", ${t(LS[9] + 0.6)});
      // ===== L10 没有密码，没有链接，这份作业，是靠什么进入他电脑的？
      tl.to("#q-b", { opacity: 1, duration: 0.3 }, ${t(LS[10] + 0.2)}); pop("#lb-q", ${t(TM.q)});
      // ===== L11 先记住这个问题。
      out("#lb-q", ${t(LS[11])}, 0.2);
      tl.to("#kw-q", { x: ${1920 - 48 - 1300 - 540}, y: ${120 - 360}, scale: 0.8, duration: 0.5, ease: "power2.inOut" }, ${t(LS[11] + 0.1)});
`,
});
