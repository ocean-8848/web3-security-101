// ep18/seg5「⑤ 三层钱包」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.tiersE（BRIEF）。ends static on CAMS.flowE
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
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E5, E7] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 助手
const CM = L.CAMS;
/** 镜头 cn 下屏幕点 (sx, sy) 对应的地面点 */
const fromScr = (cn, sx, sy, extra = {}) => { const c = CM[cn], q = G((sx - c.x) / c.scale, (sy - c.y) / c.scale); return { u: Math.round(q.u), v: Math.round(q.v), ...extra }; };
const isPt = (p) => Array.isArray(p) && p.length === 2 && typeof p[0] === "number";
/** 不支持 scale 的物件：绕地面点缩放 k；hidId 给就整组隐藏（fadeIn("#hidId") 出现） */
function putK(key, o, r, k, hidId, dy = 0) {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, r, dy, { wrap: (svg) => { const g = `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`; return hidId ? S.hid(hidId, g) : g; } });
  for (const n of Object.keys(A[key])) if (isPt(A[key][n])) A[key][n] = sc(A[key][n]);
}
const hidPut = (key, o, r, hidId, dy = 0) => put(key, o, r, dy, { wrap: (svg) => S.hid(hidId, svg) });

// ---------------------------------------------------------------- 世界物件
// 三层钱包 + 管道（画家顺序：hot → 管 wh → warm → 管 cw → cold，同一地面 Y，按插入顺序）
put("hot", L.HOT_E, O.safe(L.HOT_E, { id: "hot", variant: "hot" }));
hidPut("hotA", L.HOT_E, O.safe(L.HOT_E, { id: "hotA", variant: "hot", state: "attacker" }), "g-hotA", 0.5);
put("pwh", L.EPIPE.warmHot.o, E1.pipe(L.EPIPE.warmHot.o, { id: "pwh", pts: L.EPIPE.warmHot.pts, flowColor: "#f0c04a" }), 0.6);
put("warm", L.WARM_E, O.safe(L.WARM_E, { id: "warm" }), 0.7);
put("pcw", L.EPIPE.coldWarm.o, E1.pipe(L.EPIPE.coldWarm.o, { id: "pcw", pts: L.EPIPE.coldWarm.pts, flowColor: "#f0c04a" }), 0.8);
put("cold", L.COLD_E, O.safe(L.COLD_E, { id: "cold", gold: true }), 0.9);
L.TOLL_E.forEach((q, i) => hidPut("toll" + i, q, E7.tollClip(q, { id: "toll" + i, z: 60 }), "g-toll" + i, 30));
putK("tlock", L.TLOCK_E, E1.timeLock(L.TLOCK_E, { id: "tlock", frac: 0.9 }), 0.6, "g-tlock", 40);
putK("meter", L.METER_E, E5.thresholdMeter(L.METER_E, { id: "meter", max: 10, th: 3, thText: "补充线", level: 0 }), 0.8, "g-meter");
// 冷钱包前：三个签名人 + 小硬件钱包（L2）
const CSIG = [[430, 655], [500, 672], [570, 689]].map(([x, y]) => fromScr("tiersE", x, y, { scale: 0.4 }));
CSIG.forEach((q, i) => {
  hidPut("csg" + i, q, O.person(q, { id: "csg" + i, role: "signer", scale: 0.4 }), "g-csg" + i);
  const wq = fromScr("tiersE", [430, 500, 570][i] + 22, [655, 672, 689][i] + 18);
  putK("chw" + i, wq, O.hwWallet(wq, { id: "chw" + i, screenText: "确认?" }), 0.4, "g-chw" + i);
});
// 用户 + 提币信封（L0）
L.USERS_E.forEach((q, i) => {
  put("usr" + i, q, O.person(q, { id: "usr" + i, role: "engineer", scale: 0.5 }));
  const lq = { u: q.u + 40, v: q.v + 20 };
  hidPut("lt" + i, lq, E1.letter(lq, { id: "lt" + i, z: 50 }), "g-lt" + i, 5);
});
// 点阵：冷钱包大部分（30 点）vs 热钱包一小部分（2 点）——示意
const dotsAt = (cn, sx, sy, n, cols, color, gid) => {
  const c = CM[cn], X0 = (sx - c.x) / c.scale, Y0 = (sy - c.y) / c.scale, out = [];
  for (let i = 0; i < n; i++) out.push(`<circle cx="${Math.round(X0 + (i % cols) * 24)}" cy="${Math.round(Y0 + Math.floor(i / cols) * 24)}" r="8" fill="${color}"/>`);
  S.add(fromScr(cn, sx, sy + 200), S.hid(gid, out.join("")));
  return [X0, Y0];
};
const DC = dotsAt("tiersE", 170, 360, 30, 6, "#2aa3c9", "dots-cold");
const DH = dotsAt("tiersE", 1250, 255, 2, 2, "#e0453a", "dots-hot");
// HSM 区
put("rack", L.RACK_E, O.rack(L.RACK_E, { id: "rack", tag: "签名服务器" }));
hidPut("rackA", L.RACK_E, O.rack(L.RACK_E, { id: "rackA", tag: "签名服务器", state: "attacker", leds: ["red", "red", "red"] }), "g-rackA", 0.5);
put("shield", L.SHIELD_E, O.shield(L.SHIELD_E, { id: "shield" }), 0, { grow: true });
put("hsm", L.HSM_E, O.hsm(L.HSM_E, { id: "hsm" }));
put("seal", L.SEAL_E, O.seal(L.SEAL_E, { id: "seal", stamped: false, text: "HSM 签名", markText: "已签" }));
const RD0 = { u: L.RACK_E.u + 130, v: L.RACK_E.v + 60 };
hidPut("rdoc", RD0, O.doc(RD0, { id: "rdoc", state: "attacker", standing: true, w: 120, h: 150, title: "指令" }), "g-rdoc", 200);
const [rdx0, rdy0] = at(RD0), [hX, hY] = at(L.HSM_E);
const RD_DX = Math.round(hX - 70 - rdx0), RD_DY = Math.round(hY + 40 - rdy0);
// 审批流程区（flowE）
put("wdoc", L.DOC_E, O.doc(L.DOC_E, { id: "wdoc", standing: true, title: "提现单" }), 0, { grow: true });
hidPut("wdoc2", L.DOC_E, O.doc(L.DOC_E, { id: "wdoc2", standing: true, title: "提现单", lines: ["用途：大额转出", "金额 · 收款地址"] }), "g-wdoc2", 0.5);
put("ledger", L.LEDGER_E, O.ledgerBook(L.LEDGER_E, { id: "ledger", scale: 0.8 }), 0, { grow: true });
const FSIG = [[110, 585], [195, 598], [280, 611]];
FSIG.forEach(([x, y], i) => {
  const q = fromScr("flowE", x, y, { scale: 0.45 });
  hidPut("fsg" + i, q, O.person(q, { id: "fsg" + i, role: "signer", scale: 0.45 }), "g-fsg" + i);
  const wq = fromScr("flowE", x + 14, y + 36);
  putK("fhw" + i, wq, O.hwWallet(wq, { id: "fhw" + i, screenText: "to ✓" }), 0.42, "g-fhw" + i);
});
const PH = fromScr("flowE", 385, 612);
putK("fph", PH, O.phone(PH, { id: "fph" }), 0.6, "g-fph");
const CH = fromScr("flowE", 150, 640);
putK("fch", CH, O.chain(CH, { id: "fch", n: 3, labels: ["#1", "#2", "#3"] }), 0.45, "g-fch");
const MG = fromScr("flowE", 300, 700);
putK("fmag", MG, O.magnifier(MG, { id: "fmag" }), 0.6, "g-fmag", 300);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-usr", up(A.usr1.top, 14), "用户提币", "lab-cs lab-sm");
lb("lb-hot", up(A.hot.top, 10), "热钱包", "lab-r");
lb("lb-warm", up(A.warm.top, 10), "温钱包", "lab-cs");
lb("lb-cold", up(A.cold.top, 10), "冷钱包", "lab-ink");
lb("lb-csg", up(A.csg1.top, 12), "多签 / MPC · 硬件钱包", "lab-ink lab-sm");
lb("lb-tlock", up(A.tlock.top, 10), "审批 + 时间窗口", "lab-cs lab-sm");
lb("lb-hsm", up(A.hsm.top, 8), "HSM 自动签名", "lab-cs lab-sm");
lb("lb-meter", up(A.meter.top, 10), "水位", "lab-cs lab-sm");
lb("lb-dc", [DC[0] + 60, DC[1] + 130], "大部分资产", "lab-cs lab-sm", "t");
lb("lb-dh", [DH[0] + 44, DH[1]], "一小部分", "lab-r lab-sm", "l");
lb("lb-loss", up(A.hotA.top, 10), "失守 · 损失有上限", "lab-r");
lb("lb-t0", up(A.toll0.top, 8), "限额 + 审批", "lab-cs lab-sm");
lb("lb-t1", up(A.toll1.top, 8), "限额 + 审批", "lab-cs lab-sm");
lb("lb-rack", up(A.rack.top, 8), "签名服务器", "lab-cs lab-sm");
lb("lb-rackA", up(A.rack.top, 8), "签名服务器 · 被控制", "lab-r lab-sm");
lb("lb-nox", up(A.hsm.top, 8), "✓ 私钥不可导出", "lab-gs lab-sm");
lb("lb-seal", up(A.seal.top, 8), "照指令落章", "lab-r lab-sm");
lb("lb-shield", [A.shield.ground[0], A.shield.ground[1] + 14], "风控引擎", "lab-gs lab-sm", "t");
["白名单", "限额", "CALL"].forEach((x, i) => lb("lb-ok" + i, up(A.shield.top, 10 + i * 52), "✓ " + x, "lab-gs lab-sm"));
lb("lb-wdoc", up(A.wdoc.top, 8), "发起人提交", "lab-cs lab-sm");
lb("lb-ledger", up(A.ledger.top, 8), "审批记录", "lab-ink lab-sm");
lb("lb-fsg", up(A.fsg1.top, 12), "各自解码核对", "lab-ink lab-sm");
lb("lb-fph", up(A.fph.top, 8), "电话确认", "lab-cs lab-sm");
lb("lb-fch", up(A.fch.top, 10), "链上结果", "lab-cs lab-sm");
lb("lb-cmp", up(A.fmag.top, 6), "✓ 一致", "lab-gs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const CB = { x: 1180, y: 110, w: 640 };
const cardB = codeCard("cb", { ...CB, head: "签名前的风控", tag: "示意", mono: true, rowHide: true, rows: [
  "if (!whitelist[to])  reject()", "if (amount > limit)  reject()", "if (rate > maxRate)  reject()", "if (op != CALL)      reject()", "hsm.sign(rawBytes)"] });
S.curve("cv0", [CB.x - 4, codeRowY(CB.y, 1)], S.scr("hsmE", A.shield.top), { color: "#1f9d55" });
S.curve("cv4", [CB.x - 4, codeRowY(CB.y, 4)], S.scr("hsmE", A.hsm.top), { color: "#2aa3c9" });
const [shx, shy] = S.scr("hsmE", A.shield.ground);
const here = `<div id="here" class="hide" style="position:absolute;left:${Math.round(shx - 56)}px;top:${Math.round(shy - 196)}px;width:112px;height:210px;border:4px dashed #2aa3c9;border-radius:12px;"></div>`
  + `<div id="here-t" class="lab lab-cs hide" style="position:absolute;left:${Math.round(shx - 40)}px;top:${Math.round(shy - 120)}px;">这里</div>`;
const uiX = `<div id="uix" class="sb-kw hide" style="left:1430px;top:520px;font-size:34px;display:flex;align-items:center;gap:14px;">`
  + `<svg width="62" height="48" viewBox="0 0 62 48"><rect x="2" y="2" width="58" height="44" rx="6" fill="#fff" stroke="#8a8478" stroke-width="3"/><rect x="2" y="2" width="58" height="11" rx="5" fill="#d8d3c9"/>`
  + `<rect x="9" y="20" width="34" height="5" fill="#c9c3b8"/><rect x="9" y="30" width="24" height="5" fill="#c9c3b8"/><path d="M12 8 L50 42 M50 8 L12 42" stroke="#6d685e" stroke-width="6" stroke-linecap="round"/></svg>不看界面</div>`;
const steps = ["提交", "自动检查", "解码核对", "执行"];
const stepBar = `<div id="steps" class="hide" style="position:absolute;left:560px;top:792px;display:flex;align-items:center;gap:10px;">`
  + steps.map((x, i) => `${i ? '<span class="st-ar">→</span>' : ""}<div class="st" id="st${i}">${x}</div>`).join("") + `</div>`;
const html = cardB + here + uiX + stepBar
  + kw("kw-guess", "再猜一道题", { x: 1230, y: 150, size: 52, accent: "#2aa3c9" })
  + kw("kw-q", "HSM 会 <b>拒绝</b> 吗？", { x: 1240, y: 262, size: 46, accent: "#e0453a" })
  + kw("kw-no", "<b>不会</b>", { x: 1300, y: 372, size: 76, accent: "#e0453a" });
const css = `
    .st { font-size: 32px; font-weight: 900; background: #fffdf8; color: #6d685e; border: 3px solid #d8d3c9; border-radius: 12px; padding: 6px 20px 8px; box-shadow: 0 6px 16px rgba(70,60,40,0.10); }
    .st-ar { font-size: 32px; font-weight: 900; color: #8a8478; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  hot: w("热", 1), warm: w("温", 1), cold: w("冷", 1),
  multi: w("多签", 2), hw: w("硬件钱包", 2), tlock: w("时间窗口", 3), hsm4: w("HSM", 4),
  small: w("一小部分", 5), lvl: w("水位", 5), lost: w("失守", 6), cap: w("上限", 6),
  cw: w("冷到温", 7), wh: w("温到热", 7), lim: w("限额", 7),
  nox: w("不能导出", 9), srv: w("服务器", 10), rej: w("拒绝", 10),
  sign12: w("指令签名", 12), before: w("之前", 13), risk: w("风控引擎", 14), wl14: w("白名单", 14),
  raw: w("原始字节", 15), ui: w("界面", 15), submit: w("提交", 17), use: w("用途", 17),
  wl18: w("白名单", 18), call: w("CALL", 18), decode: w("解码核对", 19), phone: w("电话", 19),
  exec: w("执行", 20), chain: w("链上结果", 20), cmp: w("比对", 20),
};
const t = (x) => f(x);

S.build({
  cam0: "desksD", sub: "热钱包失守，损失有上限",
  grid: { u0: 0, u1: 7500, v0: -900, v1: 6400 }, box: [1700, -1100, 5900, 2300],   // 盖住 desksD（L0 起移）/ tiersE / hsmE / flowE / E
  shown: [], css, html,
  terms: [
    { id: "t0", t: "热钱包", d: "联网、自动签名、处理日常提币的钱包", at: w("热", 1) },
    { id: "t1", t: "温钱包", d: "在冷热之间中转补充资金的钱包", at: w("温钱包", 3) },
    { id: "t2", t: "水位", d: "热钱包余额的上限和补充线", at: w("水位", 5) },
    { id: "t3", t: "风控引擎", d: "签名前按规则拦截可疑请求的系统", at: w("风控引擎", 14) },
    { id: "t4", t: "白名单", d: "预先登记、允许转入的地址", at: w("白名单", 18) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 交易所每天都要给用户提币，不能每一笔都等人工签名。
      cam(${t(LS[0])}, "tiersE", 1.6);
      pop("#lb-usr", ${t(LS[0] + 0.3)});
      [0, 1, 2].forEach((i) => { fadeIn("#g-lt" + i, ${t(LS[0] + 0.5)} + i * 0.2, 0.3); });
      [0, 1, 2].forEach((i) => { X1.walk(tl, "lt" + i, ${t(LS[0] + 1.6)} + i * 0.35, 1.8, [[${hX - 260}, ${hY + 60}], [${hX - 40 + 0}, ${hY + 50}]]); });
      out("#g-lt0, #g-lt1, #g-lt2", ${t(LS[0] + 4.3)}, 0.3);
      // ===== L1 热 → 温 → 冷 三层亮牌（从右到左）
      pop("#lb-hot", ${t(TM.hot)}); pop("#lb-warm", ${t(TM.warm)}); pop("#lb-cold", ${t(TM.cold)});
      // ===== L2 冷钱包：多签 / MPC + 签名人各持硬件钱包；大部分资产
      fadeIn("#dots-cold", ${t(LS[2] + 0.2)}, 0.5); pop("#lb-dc", ${t(LS[2] + 0.5)});
      [0, 1, 2].forEach((i) => { fadeIn("#g-csg" + i, ${t(TM.multi)} + i * 0.15, 0.3); fadeIn("#g-chw" + i, ${t(TM.hw)} + i * 0.15, 0.3); });
      pop("#lb-csg", ${t(TM.hw + 0.4)});
      // ===== L3 温钱包：审批 + 时间窗口
      fadeIn("#g-tlock", ${t(LS[3] + 0.3)}, 0.4); pop("#lb-tlock", ${t(TM.tlock)});
      X1.countdown(tl, "tlock", ${t(TM.tlock + 0.2)}, 1.4, 0.35);
      // ===== L4 热钱包：HSM 自动签名
      pop("#lb-hsm", ${t(TM.hsm4)}); bump("#hsm", ${t(TM.hsm4 + 0.1)}, 1.06, 2);
      // ===== L5 一小部分 + 水位
      fadeIn("#dots-hot", ${t(TM.small)}, 0.4); pop("#lb-dh", ${t(TM.small + 0.2)});
      fadeIn("#g-meter", ${t(TM.lvl - 0.3)}, 0.4); pop("#lb-meter", ${t(TM.lvl)}); X5.fill(tl, "meter", ${t(TM.lvl + 0.2)}, 2, 0.8);
      // ===== L6 热钱包失守，损失有上限（冷钱包点阵不动）
      out("#lb-hot, #lb-hsm, #lb-dh, #lb-meter", ${t(TM.lost - 0.2)}, 0.2);
      fadeIn("#g-hotA", ${t(TM.lost)}, 0.4); pop("#lb-loss", ${t(TM.lost + 0.3)}); flash("#dots-hot", ${t(TM.cap)}, 2);
      // ===== L7 冷→温、温→热：每一跳限额 + 审批
      out("#lb-dc, #lb-csg, #lb-tlock", ${t(LS[7] - 0.2)}, 0.2);
      fadeIn("#pcw-flow", ${t(TM.cw)}, 0.3); X1.dash(tl, "pcw-flow", ${t(TM.cw)}, 3.2, -160);
      fadeIn("#pwh-flow", ${t(TM.wh)}, 0.3); X1.dash(tl, "pwh-flow", ${t(TM.wh)}, 2.6, -160);
      fadeIn("#g-toll0", ${t(TM.lim - 0.4)}, 0.3); fadeIn("#g-toll1", ${t(TM.lim - 0.2)}, 0.3);
      pop("#lb-t0", ${t(TM.lim)}); pop("#lb-t1", ${t(TM.lim + 0.15)});
      X7.toll(tl, "toll0", ${t(TM.lim + 0.5)}); X7.toll(tl, "toll1", ${t(TM.lim + 0.7)});
      // ===== L8 镜头到 hsmE；题卡"再猜"
      out("#lb-usr, #lb-warm, #lb-cold, #lb-tlock, #lb-loss, #lb-t0, #lb-t1, #dots-cold, #dots-hot, #pcw-flow, #pwh-flow", ${t(LS[8] - 0.3)}, 0.25);
      out("#usr0, #usr1, #usr2, #g-csg0, #g-csg1, #g-csg2, #g-chw0, #g-chw1, #g-chw2", ${t(LS[8] - 0.3)}, 0.25);
      cam(${t(LS[8] - 0.1)}, "hsmE", 1.1); pop("#kw-guess", ${t(LS[8] + 0.2)}); pop("#lb-rack", ${t(LS[8] + 0.9)});
      // ===== L9 HSM 私钥不能导出
      pop("#lb-nox", ${t(TM.nox)});
      // ===== L10 服务器被攻击者控制；题卡"HSM 会拒绝吗？"
      fadeIn("#g-rackA", ${t(LS[10] + 0.3)}, 0.4); tl.set("#lb-rack", { opacity: 0 }, ${t(LS[10] + 0.5)}); pop("#lb-rackA", ${t(LS[10] + 0.6)}); bump("#lb-rackA", ${t(TM.srv)}, 1.1, 1);
      pop("#kw-q", ${t(TM.rej)}); flash("#g-rackA", ${t(LS[10] + 0.9)}, 3, 0.55);
      // ===== L11 不会
      pop("#kw-no", ${t(LS[11])}, 0.25);
      // ===== L12 红色指令进 HSM，照样落章；"不可导出"仍亮（关键画面）
      fadeIn("#g-rdoc", ${t(LS[12] + 0.1)}, 0.3);
      tl.to("#g-rdoc", { x: ${RD_DX}, y: ${RD_DY}, duration: 1.3, ease: "power2.inOut" }, ${t(LS[12] + 0.5)});
      out("#g-rdoc", ${t(LS[12] + 1.9)}, 0.25);
      KIT.stamp(tl, "seal", ${t(TM.sign12 - 0.6)}); pop("#lb-seal", ${t(TM.sign12 + 0.3)});
      bump("#lb-nox", ${t(LS[12] + 2.2)}, 1.12, 2);
      // ===== L13 安全在进入 HSM 之前：rack 与 hsm 之间的空位"这里"
      out("#kw-guess, #kw-q, #kw-no, #lb-seal", ${t(LS[13] - 0.2)}, 0.2);
      pop("#here", ${t(TM.before - 0.2)}); pop("#here-t", ${t(TM.before)});
      // ===== L14 风控引擎立进空位；卡 B 第 1–3 行 → shield
      grow("shield", ${t(TM.risk - 0.3)}); out("#here, #here-t", ${t(TM.risk)}, 0.3); pop("#lb-shield", ${t(TM.risk + 0.3)});
      pop("#cb", ${t(TM.risk + 0.2)}); [0, 1, 2].forEach((i) => pop("#cb-r" + i, ${t(TM.wl14)} + i * 0.45, 0.25));
      draw("cv0", ${t(TM.wl14 + 1.2)});
      // ===== L15 第 5 行 rawBytes → hsm；界面打灰叉
      pop("#cb-r4", ${t(TM.raw - 0.2)}); draw("cv4", ${t(TM.raw)}); pop("#uix", ${t(TM.ui)});
      // ===== L16 镜头到 flowE；四步审批
      out("#cv0, #cv0-a, #cv0-b, #cv4, #cv4-a, #cv4-b, #uix, #lb-shield, #lb-nox, #lb-rackA", ${t(LS[16] - 0.3)}, 0.25);
      out("#g-rackA", ${t(LS[16] - 0.3)}, 0.3);
      cam(${t(LS[16] - 0.1)}, "flowE", 1.2);
      grow("wdoc", ${t(LS[16] + 0.6)}); grow("ledger", ${t(LS[16] + 0.8)});
      pop("#steps", ${t(LS[16] + 1.2)});
      // ===== L17 提交 + 用途
      hot("#st0", ${t(TM.submit)}, "#cfe9d8"); pop("#lb-wdoc", ${t(TM.submit + 0.1)}); fadeIn("#g-wdoc2", ${t(TM.use)}, 0.3);
      // ===== L18 自动检查：卡 B 第 4 行 + 盾牌三枚绿勾
      hot("#st1", ${t(LS[18])}, "#cfe9d8"); pop("#cb-r3", ${t(TM.wl18)}); hot("#cb-r3", ${t(TM.call)}, "#cfe9d8");
      [0, 1, 2].forEach((i) => pop("#lb-ok" + i, ${t(TM.wl18)} + i * 0.6, 0.25));
      // ===== L19 解码核对 + 电话
      out("#cb", ${t(LS[19] + 0.6)}, 0.25);
      hot("#st2", ${t(LS[19])}, "#cfe9d8");
      [0, 1, 2].forEach((i) => { fadeIn("#g-fsg" + i, ${t(TM.decode - 0.3)} + i * 0.15, 0.3); fadeIn("#g-fhw" + i, ${t(TM.decode)} + i * 0.15, 0.3); });
      pop("#lb-fsg", ${t(TM.decode + 0.5)}); fadeIn("#g-fph", ${t(TM.phone - 0.2)}, 0.3); pop("#lb-fph", ${t(TM.phone)});
      // ===== L20 执行 → 链上结果与审批记录比对
      out("#g-fsg0, #g-fsg1, #g-fsg2, #g-fhw0, #g-fhw1, #g-fhw2, #lb-fsg, #g-fph, #lb-fph, #lb-ok0, #lb-ok1, #lb-ok2", ${t(LS[20] - 0.2)}, 0.25);
      hot("#st3", ${t(TM.exec)}, "#cfe9d8"); KIT.stamp(tl, "seal", ${t(TM.exec + 0.1)});
      fadeIn("#g-fch", ${t(TM.chain - 0.3)}, 0.35); pop("#lb-fch", ${t(TM.chain)}); pop("#lb-ledger", ${t(TM.chain + 0.3)});
      fadeIn("#g-fmag", ${t(TM.cmp - 0.3)}, 0.3); pop("#lb-cmp", ${t(TM.cmp + 0.2)});
`,
});
