// ep18/seg1「① 钥匙都在」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.vaultA（BRIEF）。ends static on CAMS.walletsA
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：钥匙街五个区（seg6 L13–L14 → 结束卡）
//   A            A 冷钱包金库中景：金库 + 门槛表 + 六个签名人（区全景）
//   vaultA       近景：金库 + 门槛表 + 牌子 + 点阵（seg1 起点 L0–L2；seg4 L0–L1；seg6 L9–L12）
//   signersA     A 六个签名人 + 钥匙 + 硬件钱包 + 签名界面（seg1 L3–L7）
//   walletsA     A 六台硬件钱包特写，右上留题卡位（seg1 L8–L11 终点；seg2 起点前）
//   schemesB     B 五个展柜全景（seg2 L0–L4）
//   B            
//   softB        B 软件钱包 + 硬件钱包展柜 + 助记词板 + 密码转盘（seg2 L5–L8；seg6 L5–L8）
//   multiB       B 多签 + MPC 展柜 + 拼图（seg2 L9–L12）
//   hsmB         B HSM 展柜 + 盲签表头（seg2 L13–L17）
//   keyB         B 比喻钥匙（原钥匙 + 红钥匙）+ 多签展柜（seg2 L18–L24 终点；seg3 起点前）
//   lineC        C 流水线全景（seg3 L0–L1）
//   C            
//   genC         C 生成站（seg3 L2–L10）
//   storeC       C 存储站（seg3 L11–L15）
//   releaseC     C 发布站（seg3 L16–L20）
//   backupC      C 备份站：MPC 节点 + 云账户框 + CEO（seg3 L21–L27 终点）
//   D            D 签名台全景
//   uiD          D 签名界面 vs 实际交易 + 恶意合约（seg4 L2–L10）
//   checkD       D 哈希漏斗 + 大号硬件钱包 + 放大镜 + 自己的设备 / 时钟 / 电话（seg4 L11–L17）
//   desksD       D 三个工位 + 两块来源牌（seg4 L18–L19 终点；seg5 起点前）
//   tiersE       E 三层全景：冷 / 温 / 热 + 水位 + 限额 + 用户（seg5 L0–L7）
//   E            
//   hsmE         E HSM + 签名服务器 + 风控盾牌 + 热钱包（seg5 L8–L15）
//   flowE        E 提现单 + 审批记录 + 风控链（seg5 L16–L20 终点）
//   rolesE       E 角色板（seg6 L0–L4）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E5] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 不支持 scale 的物件：绕地面点包一层并换算 anchors（SEGBASE 常见坑 1）
const putK = (key, o, r, k, dy = 0, extra = {}) => {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, r, dy, { ...extra, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) if (Array.isArray(A[key][n]) && typeof A[key][n][0] === "number") A[key][n] = sc(A[key][n]);
};
const loc = (X, Y) => { const q = G(X, Y); return { u: Math.round(q.u), v: Math.round(q.v) }; };
const LONE = loc(-330, 40);            // 段内：L1 单独靠近金库的那把钥匙
const DIAL = loc(640, -60);            // 段内：L7 小号密码转盘（金库右侧，门槛表外）
const SEALP = loc(330, 600);           // 段内：L4 签名界面旁的公章

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
put("safe", L.SAFE_A, O.safe(L.SAFE_A, { id: "safe", gold: false, plate: "WazirX 冷钱包" }));
put("meter", L.METER_A, E5.thresholdMeter(L.METER_A, { id: "meter", max: 6, th: 4, thText: "6 选 4", level: 0 }));
put("board", L.BOARD_A, E1.signBoard(L.BOARD_A, { id: "board", style: "plate", text: "冷钱包 · 大部分资产", size: 34 }), 0, { grow: true });
L.SIGNERS_A.forEach((q, i) => put("sg" + i, q, O.person(q, { id: "sg" + i, role: "signer", scale: q.scale }), 0, { grow: true }));
L.KEYS_A.forEach((q, i) => {
  add(q, S.hid("glow" + i, `<ellipse cx="${at(q)[0]}" cy="${at(q)[1]}" rx="70" ry="30" fill="#1f9d55" opacity="0.35"/>`), -2);
  putK("ky" + i, q, O.key(q, { id: "ky" + i }), q.scale, 0, { grow: true });
});
L.WALLETS_A.forEach((q, i) => put("hw" + i, q, O.hwWallet(q, { id: "hw" + i, screenText: "确认?" }), 0, { grow: true }));
putK("lone", LONE, O.key(LONE, { id: "lone" }), 0.6, 0, { grow: true });
putK("ui", L.UIWIN_A, O.browserWin(L.UIWIN_A, { id: "ui", title: "签名界面", heading: "新交易" }), L.UIWIN_A.scale, 0, { grow: true });
putK("stp", SEALP, O.seal(SEALP, { id: "stp", stamped: false, text: "签名", markText: "核准" }), 0.5, 0, { grow: true });
put("atk", L.ATK_A, O.person(L.ATK_A, { id: "atk", state: "attacker", scale: L.ATK_A.scale }), 0, { grow: true });
putK("dial", DIAL, E2.comboDial(DIAL, { id: "dial", rings: 8 }), 0.55, 0, { grow: true });
// 红信封：从签名界面后方滑进金库
add(L.UIWIN_A, S.hid("ltrH", E1.letter(L.UIWIN_A, { id: "ltr", state: "attacker" }).svg), -10);
// 23 点红点阵（每点约 1000 万美元）
const [dx0, dy0] = at(L.DOTS_A), dots = [];
for (let i = 0; i < 23; i++) dots.push(`<circle cx="${dx0 + 16 + (i % 8) * 32}" cy="${dy0 + 16 + Math.floor(i / 8) * 32}" r="11" fill="#e0453a" stroke="#b8322a" stroke-width="1.5"/>`);
add(L.DOTS_A, S.hid("dotsA", dots.join("")), 300);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-dots", [dx0 + 130, dy0 + 112], "每点约 1000 万美元", "lab-rs lab-sm", "t");
lb("lb-one", up(A.meter.top, 10), "一把不够", "lab-rs lab-sm");
L.KEYS_A.forEach((q, i) => lb("tk" + i, up(A["ky" + i].top, 4), "✓", "lab-gs lab-sm"));
L.WALLETS_A.forEach((q, i) => lb("hwk" + i, up(A["hw" + i].top, 6), "✓ 未泄露", "lab-gs lab-sm"));
lb("lb-atk", up(A.atk.top, 8), "攻击者 · 没碰钥匙", "lab-rs lab-sm");
lb("lb-ui", up(A.ui.top, 6), "签名界面", "lab-cs lab-sm");
lb("lb-dial", up(A.dial.top, 6), `没被破解 ✓${gtag("解读")}`, "lab-gs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const html =
  evt("ev", "<b>WazirX</b> · 2024 年 7 月 · 约 2.3 亿美元") +
  evt("src1", "来源 · Halborn 分析", { top: 206 }) +
  evt("src2", "来源 · 公开材料：未说私钥被导出", { top: 210 }) +
  kw("kw-gone", "钥匙都在 · <b>钱没了</b>", { x: 560, y: 124, accent: "#e0453a" }) +
  kw("kw-guess", "<b>先猜</b>", { x: 1440, y: 130, size: 44, accent: "#1d93ba" }) +
  kw("kw-q", "私钥都没泄露<br>能<b>转走资金</b>吗？", { x: 1440, y: 220, size: 40, accent: "#e0453a" });
const css = "#kw-q { white-space: normal; line-height: 1.3; }";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  board: w("冷钱包", 1), one: w("一把钥匙", 1), six: w("六把钥匙", 2), four: w("四把", 2),
  none: w("没有说", 3), sign: w("一个一个", 4), atk: w("攻击者", 5), signFor: w("替他签了字", 5),
  keys: w("钥匙都在", 6), gone: w("钱没了", 6), dial: w("数学破解", 7), guess: w("先猜", 8),
  hw: w("硬件钱包", 9), leak: w("没有泄露", 9), q: w("转走", 10),
};
const SIGN = [0, 1, 2, 3].map((k) => TM.sign + k * Math.max(0.35, (LE[4] - TM.sign - 0.5) / 4));
const ltrFrom = at(L.UIWIN_A), ltrTo = A.safe.ground;
const t = (x) => f(x);

S.build({
  cam0: "vaultA", sub: "钥匙都在，钱没了",
  grid: { u0: -2900, u1: 3000, v0: -2900, v1: 3200 }, box: [-1800, -1100, 3800, 2300],   // 盖住 vaultA / signersA / walletsA / A
  shown: [], css, html,
  terms: [
    { id: "t0", t: "多签", d: "需要若干个私钥签名才能执行的链上钱包", at: w("多签", 0) },
    { id: "t1", t: "冷钱包", d: "放大部分资产、审批最严的钱包", at: w("冷钱包", 1) },
    { id: "t2", t: "硬件钱包", d: "私钥存在独立芯片里、不离开设备的钱包", at: w("硬件钱包", 9) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 2024 年 7 月，交易所 WazirX 的多签冷钱包，损失约 2.3 亿美元。
      pop("#ev", ${t(LS[0] + 0.3)}); pop("#src1", ${t(LS[0] + 0.7)});
      fadeIn("#dotsA", ${t(w("2.3", 0) - 0.3)}, 0.6); tl.fromTo("#dotsA", { y: 50 }, { y: 0, duration: 1.2, ease: "power2.out", immediateRender: false }, ${t(w("2.3", 0) - 0.3)});
      pop("#lb-dots", ${t(w("2.3", 0) + 0.5)});
      // ===== L1 冷钱包放的是大部分资产，多签就是为了不让一把钥匙说了算。
      out("#dotsA, #lb-dots", ${t(LS[1] - 0.1)}); grow("board", ${t(TM.board)});
      grow("lone", ${t(TM.one - 0.3)}); X5.fly(tl, "lone", ${t(TM.one + 0.2)}, 280, -110, 0.9);
      tl.to("#meter-lamp", { attr: { fill: "#e0453a" }, duration: 0.15 }, ${t(TM.one + 1.1)}); pop("#lb-one", ${t(TM.one + 1.1)});
      // ===== L2 这个钱包有六把钥匙，转账要其中四把签名。
      out("#lone, #lb-one", ${t(LS[2] - 0.2)}); tl.set("#meter-lamp", { attr: { fill: KIT.LEDC.off } }, ${t(LS[2] - 0.2)});
      cam(${t(LS[2])}, "signersA", 1.3);
      [0, 1, 2, 3, 4, 5].forEach((i) => { grow("sg" + i, ${t(LS[2] + 0.4)} + i * 0.12); grow("ky" + i, ${t(TM.six)} + i * 0.12); });
      // ===== L3 公开材料没有说，任何一把私钥被导出。
      out("#src1", ${t(LS[3] - 0.1)}); pop("#src2", ${t(TM.none)});
      [0, 1, 2, 3, 4, 5].forEach((i) => pop("#tk" + i, ${t(TM.none + 0.4)} + i * 0.1, 0.25));
      // ===== L4 签名人按流程，一个一个签了名。
      grow("ui", ${t(LS[4] - 0.1)}); pop("#lb-ui", ${t(LS[4] + 0.3)}); grow("stp", ${t(LS[4] + 0.2)});
      ${JSON.stringify(SIGN.map((x) => +x.toFixed(2)))}.forEach((s, k) => { bump("#sg" + k, s, 1.12, 1); X5.fill(tl, "meter", s + 0.1, k + 1, 0.3); });
      KIT.stamp(tl, "stp", ${t(SIGN[3] - 0.3)});
      // ===== L5 攻击者没有偷走钥匙，却让这些钥匙替他签了字。
      cam(${t(LS[5] - 0.1)}, "A", 1.2); grow("atk", ${t(TM.atk)}); pop("#lb-atk", ${t(TM.atk + 0.4)});
      fadeIn("#ltrH", ${t(TM.signFor - 0.2)}, 0.3);
      X1.walk(tl, "ltr", ${t(TM.signFor)}, 1.3, [[${ltrFrom[0]}, ${ltrFrom[1]}], [${ltrTo[0]}, ${ltrTo[1]}]]);
      out("#ltrH", ${t(TM.signFor + 1.4)}, 0.3);
      // ===== L6 钥匙都在，钱没了。
      out("#lb-ui, #lb-atk", ${t(LS[6] - 0.2)});
      [0, 1, 2, 3, 4, 5].forEach((i) => fadeIn("#glow" + i, ${t(TM.keys)}, 0.4));
      KIT.door(tl, "safe", ${t(TM.gone - 0.1)}, 105, 1.0); pop("#kw-gone", ${t(TM.gone)});
      // ===== L7 多数大额事故，都不是私钥被数学破解。
      grow("dial", ${t(LS[7])}); pop("#lb-dial", ${t(TM.dial)});
      // ===== L8 先猜一道题。
      out("#kw-gone, #ev, #src2, #lb-dial", ${t(LS[8] - 0.2)});
      [0, 1, 2, 3, 4, 5].forEach((i) => out("#tk" + i, ${t(LS[8] - 0.2)}));
      cam(${t(LS[8])}, "walletsA", 1.2); pop("#kw-guess", ${t(TM.guess)});
      // ===== L9 六把私钥都存在硬件钱包里，一把也没有泄露。
      [0, 1, 2, 3, 4, 5].forEach((i) => grow("hw" + i, ${t(TM.hw - 0.2)} + i * 0.1));
      [0, 1, 2, 3, 4, 5].forEach((i) => pop("#hwk" + i, ${t(TM.leak)} + i * 0.08, 0.25));
      // ===== L10 攻击者能转走多签里的资金吗？
      pop("#kw-q", ${t(LS[10])});
      // ===== L11 先记住这个问题。
      out("#kw-guess", ${t(LS[11])});
      tl.to("#kw-q", { x: 40, y: -100, scale: 0.8, transformOrigin: "100% 0%", duration: 0.6, ease: "power2.inOut" }, ${t(LS[11])});
`,
});
