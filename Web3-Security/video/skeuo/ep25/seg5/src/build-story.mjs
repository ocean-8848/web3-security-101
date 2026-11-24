// ep25/seg5「⑤ 前 6 小时」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.courtD（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：整座追赃城（seg2 L2–L6、L15–L20；seg6 L7–L13 结束卡）
//   heistA       A 被盗现场：热钱包 + 五枚币 + 攻击者 + 暂停闸 + 时间锁 + mETH 机器 + cmETH 份额（seg1 起点 L0–L1；seg3 L1–L4）
//   mintB        B 发行方：两台铸币机 + 攻击者地址牌 + 冻结锁 + 37 分钟钟 + AMM 池 + 点阵（seg1 L2–L12 终点；seg2 起点 L0–L1；seg3 L5–L10）
//   lawB         B 右半法规角：限制令 / 解除冻结 / 公章 / T3 牌 / GENIUS / 6 小时钟，右边缘露出 C 的跨链桥（seg3 L11–L17）
//   exitC        C 出城口：四个出口 + 关卡 + 分散地址 + 国道 + 劫匪（seg2 L7–L14、L21–L22 终点；seg3 起点 L0）
//   counterC     C 交易所柜台 + 风控名单 + 关卡特写（seg3 L18–L20 终点；seg4 起点 L0）
//   chainD       D 链级冻结：链 + 验证者转台 + 多签保险箱 + 安全委员会（seg4 L1–L9）
//   talkD        D 谈判：喊话塔 + 赏金信封 + 归还签 + 点阵（seg4 L10–L15）
//   courtD       D 法院：天平 + 云存储桶 + 私钥 + 沙漏 + 两份文件（seg4 L16–L20 终点；seg5 起点）
//   warE         E 作战室：工位 + 告警灯 + 时钟 + 暂停闸 + 地址清单（seg5 L0–L3、L15–L16）
//   notifyE      E 通知：地址清单 + 五封信 + 五块收件牌 + 登记台（seg5 L4–L6）
//   prepE        E 准备：喊话塔（左）+ 证据保全相机 + 机柜 + 报案 + 安全港盾 + 监控放大镜 + 值守板（seg5 L7–L14、L17 终点；seg6 起点）
//   userE        E 用户角：你 + 手机 + 全新地址 + 新助记词 + 新设备 + 两份记录 + 追回诈骗者（seg6 L0–L6）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
// ends static on CAMS.prepE
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import { ENV, BADGE, checkSvg, matStr } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";

// 段内镜头：在 shared 镜头基础上平移，给左 / 右的代码卡让出一列
const sh = (c, dx) => ({ ...c, x: c.x + dx });
const CAMS = { ...L.CAMS, warR: sh(L.CAMS.warE, 180), notifyR: sh(L.CAMS.notifyE, 500), prepL: sh(L.CAMS.prepE, -520) };
const S = segInit(import.meta.url, { cams: CAMS, ext: [E1, E11] });
const { A, put, add, lb, pin, up, rel, LS, LE, w, we } = S;

/** 不支持 scale 的物件：绕地面点包一层缩放，并换算 anchors */
const putK = (key, o, r, k, dy = 0, hidId) => {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, o, r, dy, { wrap: (svg) => { const g = `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`; return hidId ? S.hid(hidId, g) : g; } });
  const fix = (v) => (Array.isArray(v) && v.length === 2 && typeof v[0] === "number" ? sc(v) : Array.isArray(v) && Array.isArray(v[0]) ? v.map(fix) : v);
  for (const n in A[key]) A[key][n] = fix(A[key][n]);
};

// ---------------------------------------------------------------- 地面：石板路 + 资金管（本段范围）
{
  const R = [[10500, -110], [20000, -110], [20000, 110], [10500, 110]].map(([u, v]) => Wp(u, v));
  add({ u: 10500, v: -3000 }, `<polygon points="${R.map((p) => p.join(",")).join(" ")}" fill="#dcd6cb" stroke="#c9c2b5" stroke-width="2"/>`, -5000);
  const po = { u: 10500, v: 0 };
  put("pipe", po, E1.pipe(po, { id: "pipe", pts: [[0, 0, 4], [9400, 0, 4]], r: 8, flowColor: "#e0453a" }), -4990);
}

// ---------------------------------------------------------------- D 法院（上一段终点画面，开场 2 秒要有东西）
putK("bal", L.BAL, E1.balance(L.BAL, { id: "bal" }), 0.7);
putK("bkt", L.BUCKET, O.bucket(L.BUCKET, { id: "bkt" }), 0.8);
putK("keyd", L.KEY_D, O.key(L.KEY_D, { id: "keyd" }), 0.6);
putK("lockd", L.LOCK_D, O.padlock(L.LOCK_D, { id: "lockd" }), 0.5);
putK("hg", L.HOURGLASS, O.hourglass(L.HOURGLASS, { id: "hg" }), 0.7);
put("dseize", L.DOC_SEIZE, O.doc(L.DOC_SEIZE, { id: "dseize", standing: true, title: "没收", lines: ["约 94636 BTC"] }));
put("dret", L.DOC_RETURN, O.doc(L.DOC_RETURN, { id: "dret", standing: true, title: "实物返还申请", lines: ["法官质疑"] }));
put("sgnD", L.SIGN_D[2], E1.signBoard(L.SIGN_D[2], { id: "sgnD", style: "plate", text: "法院" }));

// ---------------------------------------------------------------- E 作战室
const scrOk = `<rect x="0" y="0" width="148" height="88" fill="#e9f6ee"/><rect x="10" y="14" width="128" height="10" rx="5" fill="#bfe3cc"/><rect x="10" y="34" width="96" height="10" rx="5" fill="#bfe3cc"/><rect x="10" y="54" width="112" height="10" rx="5" fill="#bfe3cc"/>`;
const scrBad = `<rect x="0" y="0" width="148" height="88" fill="#fde6e3"/><text x="74" y="40" font-size="24" font-weight="900" text-anchor="middle" fill="#e0453a">大额流出</text><path d="M20 72L50 62L74 66L100 50L128 30" fill="none" stroke="#e0453a" stroke-width="5" stroke-linecap="round"/>`;
L.DESKS.forEach((q, i) => putK(`dk${i}`, q, O.desk(q, { id: `dk${i}`, screen: scrOk, screen2: scrBad }), q.scale));
L.ENG_E.forEach((q, i) => put(`en${i}`, q, O.person(q, { id: `en${i}`, role: "engineer", scale: q.scale })));
put("bcn", L.BEACON, O.beacon(L.BEACON, { id: "bcn" }));
put("clk", L.CLOCK_E, O.clock(L.CLOCK_E, { id: "clk", h: 12, m: 0 }));
putK("psw", L.PAUSE_E, O.knifeSwitch(L.PAUSE_E, { id: "psw", text: "暂停提币" }), L.PAUSE_E.scale);
put("list", L.LIST, O.doc(L.LIST, { id: "list", standing: true, title: "地址清单", lines: ["被盗地址", "攻击者地址", "下一跳"] }));
put("sgnE", L.SIGN_E[0], E1.signBoard(L.SIGN_E[0], { id: "sgnE", style: "plate", text: "应急作战室" }));
// 时钟外 6 格进度环（T+0 → T+6h）
{
  const [cx, cy] = A.clk.center, R = 118, arc = (i) => {
    const a0 = (-90 + i * 60 + 4) * Math.PI / 180, a1 = (-90 + (i + 1) * 60 - 4) * Math.PI / 180;
    const p = (a) => [f(cx + R * Math.cos(a)), f(cy + R * 0.62 * Math.sin(a))];
    return `M${p(a0)}A${R} ${f(R * 0.62)} 0 0 1 ${p(a1)}`;
  };
  let s = "";
  for (let i = 0; i < 6; i++) s += `<path d="${arc(i)}" fill="none" stroke="#d6d0c4" stroke-width="12" stroke-linecap="round"/><path id="ring-${i}" opacity="0" d="${arc(i)}" fill="none" stroke="#1f9d55" stroke-width="12" stroke-linecap="round"/>`;
  add(rel(L.CLOCK_E, 0, 60), s);
}
// 清单三行的遮罩（L2 依次擦开 = 写出）
{
  const m = A.list.m;
  add(rel(L.LIST, 0, 1), `<g transform="${matStr(m)}">${[0, 1, 2].map((i) => `<rect id="lm-${i}" x="12" y="${70 + 30 * i}" width="176" height="27" fill="#fffdf8"/>`).join("")}</g>`);
}

// ---------------------------------------------------------------- E 通知
const RN = ["稳定币发行方", "交易所风控", "跨链桥 · 兑换服务", "SEAL 911", "链上分析公司"];
L.RECIPS.forEach((q, i) => put(`rc${i}`, q, E1.signBoard(q, { id: `rc${i}`, style: "plate", text: RN[i], size: 34 }), 0, { grow: true }));
L.RECIPS.forEach((q, i) => add(rel(q, 0, 40), checkSvg(`rck${i}`, up(A[`rc${i}`].top, 30), 24, 0)));
put("disp", L.DISPATCH, E7.dispatchDesk(L.DISPATCH, { id: "disp", scale: L.DISPATCH.scale, entries: ["+ 发行方", "+ 交易所", "+ 跨链桥", "+ SEAL 911", "+ 分析公司"], shown: 5 }), 0, { grow: true });
put("dfull", L.DOC_FULL, O.doc(L.DOC_FULL, { id: "dfull", standing: true, title: "完整报告", lines: ["根因分析", "损失统计", "时间线"] }), 0,
  { wrap: (svg) => S.hid("dfullw", `<g style="filter:grayscale(1)">${svg}</g>`) });
// 青蓝虚线：清单 → 五块牌；五封信
{
  const P0 = at(L.LIST, 0, 70, 30);
  add(rel(L.LIST, 0, 2), S.hid("nl", L.RECIPS.map((q) => { const P = at(q, 0, 50); return `<line x1="${f(P0[0])}" y1="${f(P0[1])}" x2="${f(P[0])}" y2="${f(P[1])}" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="12 10"/>`; }).join("")));
  L.RECIPS.forEach((_, i) => { const o = rel(L.LETTER0, 0, 70); add(o, S.hid(`ltw${i}`, E1.letter(o, { id: `lt${i}`, w: 60, h: 40 }).svg), 3 + i); });
}

// ---------------------------------------------------------------- E 准备
putK("tw", L.TOWER_E, O.tower(L.TOWER_E, { id: "tw" }), L.TOWER_E.scale);
put("snap", L.SNAPCAM, E11.snapshotCamera(L.SNAPCAM, { id: "snap", scale: L.SNAPCAM.scale, photo: "服务器镜像", sub: "" }));
putK("rk", L.RACK, O.rack(L.RACK, { id: "rk", tag: "服务器镜像" }), L.RACK.scale);
put("rep", L.DOC_REPORT, O.doc(L.DOC_REPORT, { id: "rep", standing: true, title: "报案", lines: ["地址清单", "交易哈希", "辖区"], stampText: "已受理" }));
putK("shd", L.SHIELD, O.shield(L.SHIELD, { id: "shd" }), L.SHIELD.scale);
put("mag", L.MAGNIFIER, O.magnifier(L.MAGNIFIER, { id: "mag" }), 0, { wrap: (svg) => `<g id="magw">${svg}</g>` });
putK("rb", L.ROLEBOARD, E5.roleBoard(L.ROLEBOARD, { id: "rb", title: "ON-CALL · DRILL", plates: ["值守", "名单", "演练", "联系人"], holders: ["person", "bot", "multisig", "person"], delays: ["每日", "每日", "每季度", "每季度"] }), L.ROLEBOARD.scale);
put("trace", L.DOC_TRACE, O.doc(L.DOC_TRACE, { id: "trace", standing: true, title: "追踪结论", lines: ["规则 · 聚类", "置信度 · 中", "单独作为冻结依据"] }));
add(rel(L.DOC_TRACE, 0, 1), S.hid("trx", `<g transform="${matStr(A.trace.m)}"><rect x="8" y="${130}" width="176" height="30" rx="4" fill="none" stroke="#e0453a" stroke-width="3.5" stroke-dasharray="9 6"/><path d="M14 132L178 158M178 132L14 158" stroke="#e0453a" stroke-width="4" stroke-linecap="round"/></g>`));
put("sgnP", L.SIGN_E[1], E1.signBoard(L.SIGN_E[1], { id: "sgnP", style: "plate", text: "用户角" }));
// L14 白帽：站在盾牌前停住
const WH = { u: L.SHIELD.u - 120, v: L.SHIELD.v + 210 };
put("wh", WH, O.person(WH, { id: "wh", role: "engineer", scale: 0.5 }), 0, { grow: true });
// L13 点阵：100 点，10 金（赏金）+ 90 绿（返回）
{
  const [gx, gy] = at(L.DOTS_E), d = [];
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) d.push(`<circle cx="${gx + c * 20}" cy="${gy + r * 20}" r="7" fill="${r === 0 ? "#d4a017" : "#1f9d55"}"/>`);
  add(L.DOTS_E, S.hid("dots", d.join("")), 400);
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-clk0", up(A.clk.top, 14), "T+0", "lab-ink");
lb("lb-clk6", up(A.clk.top, 15), "T+6h", "lab-g");
lb("lb-bcn", up(A.bcn.top, 10), "发现异常", "lab-r");
lb("lb-list", up(A.list.top, 6), "清单不准 → 拒绝 / 延误", "lab-r", "b");
lb("lb-dfull", up(A.dfull.top, 6), "完整报告 · 可以后补", "lab-ink lab-sm");
lb("lb-snap", up(A.snap.top, 10), "证据保全", "lab-cs");
lb("lb-rk", up(A.rk.top, 8), "恢复会覆盖证据", "lab-r");
lb("lb-rep", up(A.rep.top, 6), "报警 · 按辖区通知监管", "lab-cs");
lb("lb-tw", up(A.tw.top, 4), "链上喊话 · 赏金 + 安全港条件", "lab-cs");
lb("lb-shd", up(A.shd.top, 8), "安全港 · 事先写好", "lab-gs");
lb("lb-dots", [at(L.DOTS_E)[0] + 90, at(L.DOTS_E)[1] + 205], "默认值 · 协议可调整", "lab-ink lab-sm", "t");
lb("lb-wh", up(A.wh.top, 6), "?", "lab-r");
lb("lb-dk", up(A.dk1.top, 10), "实时监控 · 大额流出 / 权限变更", "lab-r");
lb("lb-trace", up(A.trace.top, 6), "标注规则 + 置信度", "lab-cs");
// 值守板四格打勾
const rbTicks = (A.rb.tags || A.rb.holders || []).map((p, i) => checkSvg(`rbk${i}`, p, 16, 0)).join("");
add(rel(L.ROLEBOARD, 0, 5), rbTicks);

// ---------------------------------------------------------------- 屏幕层卡片
const CA = { x: 60, y: 280, w: 620 }, CB = { x: 1180, y: 300, w: 640 };
const cardA = codeCard("ca", { ...CA, head: "第一版地址清单", tag: "示意", rows: [
  `被盗地址　<span class="c-cm">0x…</span>`,
  `攻击者地址　<span class="c-cm">0x…</span>`,
  `已知下一跳　<span class="c-cm">0x…</span> → 跨链桥 / 交易所`,
  `交易哈希　<span class="c-cm">0x…</span>`,
  `发送时间　T+1h 内 · 每小时更新`] });
const cardB = codeCard("cb", { ...CB, head: "安全港默认条款", tag: "示意", rows: [
  `适用　攻击正在发生时`, `授权　事先通过治理`, `返回　72 小时内 · 指定地址`, `赏金　10% · 上限 100 万美元`] });
S.curve("cva0", [CA.x + CA.w + 4, codeRowY(CA.y, 0)], S.scr("warR", A.list.top), { color: "#e0453a" });
S.curve("cva1", [CA.x + CA.w + 4, codeRowY(CA.y, 1)], S.scr("warR", A.list.top), { color: "#e0453a" });
S.curve("cva2", [CA.x + CA.w + 4, codeRowY(CA.y, 2)], S.scr("notifyR", A.rc2.top), { color: "#e0453a" });
S.curve("cvb1", [CB.x - 4, codeRowY(CB.y, 1)], S.scr("prepL", A.shd.top), { color: "#e0453a" });
S.curve("cvb3", [CB.x - 4, codeRowY(CB.y, 3)], S.scr("prepL", [at(L.DOTS_E)[0] + 190, at(L.DOTS_E)[1] + 10]), { color: "#e0453a" });
const queue = `<div class="sb-q hide" id="q"><span class="q-t">排队</span>${ENV().repeat(5)}<div class="q-x" id="q-x">${BADGE("q-b", 64)}</div></div>`;
const html = cardA + cardB + queue
  + kw("kw-pause", `协议暂停 · <b>交易所暂停该链提币</b>`, { x: 60, y: 300, size: 38, accent: "#e0453a" })
  + kw("kw-hash", `只需 <b>地址 + 交易哈希</b>`, { x: 70, y: 700, size: 40 })
  + kw("kw-e0", `<b>交易哈希</b>`, { x: 1440, y: 300, size: 40, accent: "#1d93ba" })
  + kw("kw-e1", `<b>日志</b>`, { x: 1440, y: 390, size: 40, accent: "#1d93ba" })
  + kw("kw-e2", `<b>服务器镜像</b>`, { x: 1440, y: 480, size: 40, accent: "#1d93ba" })
  + ck("ck-a", "先保全 → 再恢复", { x: 1400, y: 600, w: 440, kind: "g" })
  + ck("ck-b", "先恢复 → 证据被覆盖", { x: 1400, y: 690, w: 440, kind: "r" })
  + kw("kw-hr", `T+1h · <b>每小时更新清单</b>`, { x: 1250, y: 320, size: 38, accent: "#1d93ba" })
  + kw("kw-drill", `名单 <b>每日</b> · 演练 <b>每季度</b>`, { x: 1300, y: 300, size: 40 })
  + evt("ev-seal", `SEAL 911 · Security Alliance ${gtag("应急网络")}`)
  + evt("ev-harbor", `Security Alliance 安全港框架 ${gtag("框架原文")}`, { top: 124 });
const css = `
    .sb-q { position: absolute; left: 60px; top: 670px; display: flex; align-items: center; gap: 10px; padding: 12px 22px; background: #f4f1ea; border-radius: 14px; border: 2px dashed #b8b0a1; }
    .sb-q .q-t { font-size: 30px; font-weight: 800; color: #8a8478; margin-right: 6px; }
    .sb-q svg { opacity: 0.6; }
    .sb-q .q-x { position: absolute; right: -24px; top: -24px; opacity: 0; }
    .sb-q .q-x svg { opacity: 1; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  pause: w("先暂停", 1), exch: w("交易所", 1),
  stolen: w("被盗地址", 2), atk: w("攻击者地址", 2), hop: w("下一跳", 2),
  wrong: w("不准", 3), queue: w("排队", 4),
  r0: w("稳定币发行方", 5), r1: w("交易所风控", 5), r2: w("跨链桥", 5), r3: w("SEAL 911", 5), r4: w("链上分析公司", 5), fire: w("同时发出去", 5),
  full: w("完整报告", 6), hash: w("冻结只需要", 6),
  e0: w("交易哈希", 7), e1: w("日志", 7), e2: w("服务器镜像", 7),
  over: w("恢复会覆盖证据", 8), police: w("报警", 9),
  shout: w("链上喊话", 10), hourly: w("每小时更新", 10),
  gov: w("治理", 12), bounty: w("赏金", 13), stop: w("不敢动手", 14),
  mon: w("实时监控", 16), daily: w("每日更新", 16), qtr: w("每季度演练", 16),
  rule: w("规则和置信度", 17), alone: w("单独作为冻结的依据", 17),
};
const t = (x) => f(x);

S.build({
  cam0: "courtD", sub: "先清单，后报告",
  grid: { u0: 10700, u1: 20400, v0: -5100, v1: 4600 }, box: [9090, -6260, 7030, 3390],   // 盖住本段镜头 courtD / warE / notifyE / prepE（含上一段终点）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "下一跳", d: "资金离开后到达的下一个地址", at: w("下一跳", 2) },
    { id: "t1", t: "SEAL 911", d: "Security Alliance 的应急渠道", at: w("SEAL 911", 5) },
    { id: "t2", t: "证据保全", d: "恢复系统前保存日志、镜像和交易记录", at: w("证据保全", 7) },
    { id: "t3", t: "安全港", d: "事先授权白帽抢救资金并约定赏金", at: w("安全港", 11) },
    { id: "t4", t: "启发式", d: "按经验规则推断，可能出错", at: w("启发式", 17) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 这些路走不走得通，要看事发后的前 6 小时。 法院 → 作战室，T+0 时钟 + 6 格环
      cam(${t(LS[0] + 0.1)}, "warR", 1.6, "power2.inOut"); pop("#lb-clk0", ${t(LS[0] + 1.9)}, 0.25);
      // ===== L1 发现异常，先暂停，协议暂停，交易所暂停这条链的提币。
      fadeIn("#bcn-lit, #bcn-beamg", ${t(LS[1])}, 0.3); KIT.beacon(tl, "bcn", ${t(LS[1])}, ${t(LS[2] - LS[1] - 0.4)}, 1.2); pop("#lb-bcn", ${t(LS[1] + 0.2)}, 0.25);
      [0, 1, 2].forEach((i) => fadeIn("#dk" + i + "-scr2", ${t(LS[1] + 0.3)} + i * 0.1, 0.3));
      KIT.toggle(tl, "psw", ${t(TM.pause)}, false, 0.6); pop("#kw-pause", ${t(TM.exch)}, 0.3);
      // ===== L2 接着整理地址清单，被盗地址，攻击者地址，已知的下一跳。
      out("#kw-pause, #lb-bcn", ${t(LS[2] - 0.2)}, 0.2); pop("#ca", ${t(LS[2] + 0.2)}, 0.35);
      [${t(TM.stolen)}, ${t(TM.atk)}, ${t(TM.hop)}].forEach((tt, i) => tl.to("#lm-" + i, { scaleX: 0, transformOrigin: "100% 50%", duration: 0.5, ease: "none" }, tt));
      // ===== L3 清单是所有通知的前提，清单不准，冻结请求就会被拒绝或延误。
      draw("cva0", ${t(LS[3] + 0.3)}, 0.6); draw("cva1", ${t(LS[3] + 0.5)}, 0.6); hot("#ca-r0", ${t(LS[3] + 0.3)}); hot("#ca-r1", ${t(LS[3] + 0.5)});
      pop("#lb-list", ${t(TM.wrong)}, 0.25); bump("#list", ${t(TM.wrong + 0.2)}, 1.06, 2);
      // ===== L4 然后并行通知，不是排队通知。 镜头到 notifyR，五块收件牌长出；排队图示被叉
      out("#cva0, #cva1, #lb-list, #lb-clk0", ${t(LS[4] - 0.25)}, 0.2); hot("#ca-r0", ${t(LS[4] - 0.2)}, "rgba(0,0,0,0)"); hot("#ca-r1", ${t(LS[4] - 0.2)}, "rgba(0,0,0,0)");
      cam(${t(LS[4])}, "notifyR", 1.2, "power2.inOut");
      [0, 1, 2, 3, 4].forEach((i) => grow("rc" + i, ${t(LS[4] + 0.6)} + i * 0.08, 0.5)); grow("disp", ${t(LS[4] + 0.9)}, 0.5);
      pop("#q", ${t(LS[4] + 0.4)}, 0.3); fadeIn("#q-x", ${t(TM.queue)}, 0.25); bump("#q-x", ${t(TM.queue)}, 1.2, 1);
      // ===== L5 五类对象逐个点名，然后同时发出（关键画面）
      draw("cva2", ${t(LS[5] + 0.2)}, 0.6); hot("#ca-r2", ${t(LS[5] + 0.2)});
      [${t(TM.r0)}, ${t(TM.r1)}, ${t(TM.r2)}, ${t(TM.r3)}, ${t(TM.r4)}].forEach((tt, i) => bump("#rc" + i, tt, 1.08, 1));
      pop("#ev-seal", ${t(TM.r3)}, 0.3);
      out("#cva2", ${t(TM.fire - 0.6)}, 0.2); hot("#ca-r2", ${t(TM.fire - 0.6)}, "rgba(0,0,0,0)");
      fadeIn("#nl", ${t(TM.fire - 0.3)}, 0.3);
      [${L.RECIPS.map((q) => { const P = at(q, 0, 50); return `[${f(P[0])},${f(P[1])}]`; }).join(",")}].forEach((P, i) => {
        fadeIn("#ltw" + i, ${t(TM.fire - 0.2)}, 0.2); X1.walk(tl, "lt" + i, ${t(TM.fire)}, 1.1, [P], "power1.inOut");
        fadeIn("#rck" + i, ${t(TM.fire + 1.15)}, 0.2); out("#ltw" + i, ${t(TM.fire + 1.15)}, 0.25);
      });
      // ===== L6 先发清单，不要等完整报告，冻结只需要准确的地址和交易哈希。
      out("#ev-seal, #nl, #q", ${t(LS[6] - 0.2)}, 0.2);
      fadeIn("#dfullw", ${t(TM.full)}, 0.4); pop("#lb-dfull", ${t(TM.full + 0.4)}, 0.25);
      pop("#kw-hash", ${t(TM.hash)}, 0.3); hot("#ca-r3", ${t(TM.hash)});
      // ===== L7 证据保全：镜头到 prepE；相机对机柜闪光；三个关键词
      out("#ca, #kw-hash, #lb-dfull", ${t(LS[7] - 0.2)}, 0.2);
      cam(${t(LS[7])}, "prepE", 1.4, "power2.inOut");
      pop("#lb-snap", ${t(LS[7] + 1.2)}, 0.25); X11.snap(tl, "snap", ${t(TM.e0 - 0.2)}, { photo: true });
      pop("#kw-e0", ${t(TM.e0)}, 0.3); pop("#kw-e1", ${t(TM.e1)}, 0.3); pop("#kw-e2", ${t(TM.e2)}, 0.3);
      // ===== L8 保全先于恢复
      pop("#ck-a", ${t(LS[8] + 0.2)}, 0.3); pop("#ck-b", ${t(LS[8] + 1.2)}, 0.3);
      pop("#lb-rk", ${t(TM.over)}, 0.25); flash("#ck-b", ${t(TM.over + 0.3)}, 2);
      // ===== L9 然后报警，按辖区通知监管。
      out("#kw-e0, #kw-e1, #kw-e2, #ck-a, #ck-b, #lb-rk, #lb-snap", ${t(LS[9] - 0.2)}, 0.2);
      pop("#lb-rep", ${t(TM.police)}, 0.25); fadeIn("#rep-stampmark", ${t(TM.police + 0.6)}, 0.15); bump("#rep", ${t(TM.police + 0.6)}, 1.05, 1);
      // ===== L10 一小时之后链上喊话；每小时更新清单
      out("#lb-rep", ${t(LS[10] - 0.2)}, 0.2);
      KIT.clock(tl, "clk", ${t(LS[10])}, 1.0, 60); fadeIn("#ring-0", ${t(LS[10] + 0.6)}, 0.3);
      pop("#lb-tw", ${t(TM.shout)}, 0.25); [0, 1, 2, 3].forEach((i) => flash("#tw-wave-" + i, ${t(TM.shout + 0.2)} + i * 0.1, 3, 0.15));
      pop("#kw-hr", ${t(TM.hourly)}, 0.3);
      // ===== L11 安全港要事先写好。
      out("#lb-tw, #kw-hr", ${t(LS[11] - 0.2)}, 0.2);
      pop("#lb-shd", ${t(LS[11] + 0.2)}, 0.25); bump("#shd", ${t(LS[11] + 0.3)}, 1.08, 2);
      // ===== L12 SEAL 白帽安全港框架：镜头左移，代码卡 B + 来源卡；"授权"行连到盾牌
      out("#lb-shd", ${t(LS[12] - 0.2)}, 0.2);
      cam(${t(LS[12])}, "prepL", 1.2, "power2.inOut");
      pop("#cb", ${t(LS[12] + 1.0)}, 0.35); pop("#ev-harbor", ${t(LS[12] + 1.3)}, 0.3);
      draw("cvb1", ${t(TM.gov)}, 0.6); hot("#cb-r1", ${t(TM.gov)});
      // ===== L13 72 小时、10%、上限 100 万美元：点阵 + 第 4 行连到点阵
      out("#cvb1", ${t(LS[13] - 0.2)}, 0.2); hot("#cb-r1", ${t(LS[13] - 0.2)}, "rgba(0,0,0,0)");
      hot("#cb-r2", ${t(LS[13] + 0.3)}); fadeIn("#dots", ${t(LS[13] + 0.5)}, 0.5); pop("#lb-dots", ${t(LS[13] + 2.4)}, 0.25);
      draw("cvb3", ${t(LS[13] + 2.8)}, 0.6); hot("#cb-r3", ${t(TM.bounty)}); bump("#lb-dots", ${t(TM.bounty + 0.3)}, 1.1, 1); 
      // ===== L14 事发时再讨论，白帽不敢动手。
      out("#cvb3", ${t(LS[14] - 0.2)}, 0.2);
      grow("wh", ${t(LS[14] + 0.1)}, 0.5); pop("#lb-wh", ${t(TM.stop)}, 0.25); bump("#lb-wh", ${t(TM.stop + 0.3)}, 1.25, 2);
      // ===== L15 平时也要准备：回到作战室；进度环走满 6 格
      out("#cb, #ev-harbor, #lb-dots, #lb-wh", ${t(LS[15] - 0.2)}, 0.2);
      cam(${t(LS[15])}, "warE", 1.4, "power2.inOut");
      KIT.clock(tl, "clk", ${t(LS[15] + 0.3)}, 1.0, 300);
      [1, 2, 3, 4, 5].forEach((i) => fadeIn("#ring-" + i, ${t(LS[15] + 0.4)} + i * 0.15, 0.2)); pop("#lb-clk6", ${t(LS[15] + 1.2)}, 0.25);
      // ===== L16 监控 → 名单每日 → 每季度演练：先看工位屏幕，再到值守板
      flash("#dk0-scr2, #dk1-scr2, #dk2-scr2", ${t(TM.mon)}, 3, 0.2); pop("#lb-dk", ${t(TM.mon + 0.2)}, 0.25);
      out("#lb-dk, #lb-clk6", ${t(TM.daily - 0.6)}, 0.2);
      cam(${t(TM.daily - 0.4)}, "prepE", 1.2, "power2.inOut");
      tl.to("#magw", { x: -40, y: -20, duration: 0.8, ease: "sine.inOut" }, ${t(TM.daily + 0.8)}); tl.to("#magw", { x: 0, y: 0, duration: 0.8, ease: "sine.inOut" }, ${t(TM.daily + 1.6)});
      fadeIn("#rbk0, #rbk1", ${t(TM.daily + 0.9)}, 0.25); fadeIn("#rbk2, #rbk3", ${t(TM.qtr + 0.3)}, 0.25);
      pop("#kw-drill", ${t(TM.qtr)}, 0.3);
      // ===== L17 启发式结论：标注规则 + 置信度；"单独作为冻结依据"被框住打叉
      out("#kw-drill", ${t(LS[17] - 0.2)}, 0.2);
      bump("#trace", ${t(LS[17] + 0.4)}, 1.05, 1); pop("#lb-trace", ${t(TM.rule)}, 0.25);
      fadeIn("#trx", ${t(TM.alone)}, 0.3);
`,
});
