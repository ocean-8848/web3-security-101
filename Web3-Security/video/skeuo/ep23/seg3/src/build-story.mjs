// ep23/seg3「③ 假充值」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.flowAC（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   intakeA      A 区块链 + 充值地址 ×3 + 扫描放大镜 + 台秤 + 真 / 假代币 + returnTag + Omni 交易（seg3 L0–L17）
//   checksA      A 四道入账检查 ①–④ + 确认数信号 + 两个节点 + 台秤（seg3 L18–L25 终点；seg4 起点）
//   vaultB       B 冷 / 温 / 热三层金库 + 水位表 + 管道（seg2 L12–L15）
//   hotB         B 三只热钱包 + 熔断闸刀 + 暂停闸 + 告警灯 + 时钟 + 点阵（seg1 起点 L0–L9；seg4 L16；seg6 L9）
//   delegB       B ETH 热钱包 + 地址立柱 + 委托挂牌 + 攻击者合约，题卡在右侧（seg1 L10–L14 终点；seg2 起点；seg4 L15；seg6 L0–L6）
//   signC        C 账本 → 风控 → 签名服务 + HSM + 容器 + 提现单 + 三条防线牌（seg4 L0–L6、L20–L24 终点；seg5 起点；seg6 L10）
//   devC         C 三个工位 + 工程师 + 部署令牌 + AI 工具 + 攻击者 + 签名服务 / 容器（seg4 L7–L14、L17–L19）
//   gateD        D 四道合规关卡 + 风险表 + 护照 + 另一家服务商 + 三类攻击者 + 门槛牌（seg5 L0–L14）
//   freezeD      D 冻结锁 + 两行点阵 + 原生币 + 代价天平 + 认罪协议 + 误冻的普通用户（seg5 L15–L23 终点；seg6 起点）
//   userE        E 用户柜台：手机 + 地址簿 + 冷却期时间锁 + 提币白名单 + 用户（seg6 L11–L14）
//   flowAC       A 充值扫描 → C 签名服务 → 回到 B 热钱包的整条流水线（seg2 L16–L24 终点；seg3 起点）
//   airport      A–D 中景，五块机场指示牌都在画内（seg2 L0–L11）
//   A            各区全景（pans pass through them）
//   B            
//   C            
//   D            
//   E            
//   wide         整座机场全景：A → E（seg6 L15–L16 结束卡）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E16 from "../../../ep16/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.checksA

const R = L.world.rects;
const CAMX = {
  ...L.CAMS,
  // 段内专用：台秤近景（L8–L12），右侧留标签位
  scaleA: L.fit([R.scale, R.ret, ...R.oddA, R.omni], [360, 320, 1500, 840], 1.6),
  // 段内专用：四道检查放右边，左侧给代码卡 A（L18–L23）
  checksR: L.fit([R.scale, ...R.ckA, R.fin, ...R.rpc], [720, 300, 1840, 860], 1.4),
};
const S = segInit(import.meta.url, { cams: CAMX, ext: [E1, E2, E7, E16] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 缩放包一层（SEGBASE 常见坑 1）：绕地面点缩放并换算 anchors；hide = 外包透明 <g id=hide>
const scl = (o) => { const k = o.scale ?? 1, [gx, gy] = at(o); return { k, gx, gy, f: (q) => [gx + (q[0] - gx) * k, gy + (q[1] - gy) * k] }; };
const fixA = (v, f) => (Array.isArray(v) && typeof v[0] === "number" ? f(v) : Array.isArray(v) && Array.isArray(v[0]) ? v.map((x) => fixA(x, f)) : v);
function wput(key, o, r, dy = 0) {
  const { k, gx, gy, f } = scl(o);
  put(key, o, r, dy, { wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n in A[key]) A[key][n] = fixA(A[key][n], f);
}
function hput(key, o, r, dy = 0) { A[key] = r.anchors; add(o, S.hid("h-" + key, r.svg), dy); }

// 上段终点 flowAC 里的 B / C 关键物件（首帧不留空）
put("sgB", L.SIGN_B, E1.signBoard(L.SIGN_B, { id: "sgB", style: "plate", text: "金库 · 冷钱包" }));
put("sgC", L.SIGN_C, E1.signBoard(L.SIGN_C, { id: "sgC", style: "plate", text: "登机口 · 提币" }));
put("cold", L.COLD, O.safe(L.COLD, { id: "cold", plate: "冷钱包", gold: true }));
wput("warm", L.WARM, O.safe(L.WARM, { id: "warm", plate: "温钱包" }));
["XRP 热钱包", "BTC 热钱包", "ETH 热钱包"].forEach((pl, i) => wput("hot" + i, L.HOT[i], O.safe(L.HOT[i], { id: "hot" + i, variant: "hot", plate: pl })));
wput("ledger", L.LEDGER, O.dbLedger(L.LEDGER, { id: "ledger", tag: "内部账本" }));
wput("shield", L.SHIELD, O.shield(L.SHIELD, { id: "shield" }));
wput("rack", L.RACK, O.rack(L.RACK, { id: "rack", tag: "签名服务" }));
wput("hsm", L.HSM, O.hsm(L.HSM, { id: "hsm" }));

// A 入境口 · 充值
put("sgA", L.SIGN_A, E1.signBoard(L.SIGN_A, { id: "sgA", style: "plate", text: "入境口 · 充值" }));
wput("chain", L.CHAIN, O.chain(L.CHAIN, { id: "chain", n: 4 }));
put("mag", L.MAG, O.magnifier(L.MAG, { id: "mag" }));
L.ADDR_A.forEach((q, i) => wput("addr" + i, q, E2.addrPlate(q, { id: "addr" + i, text: `充值地址 ${i + 1}` })));
put("sc", L.SCALE, E7.scale(L.SCALE, { id: "sc", scale: L.SCALE.scale }));
hput("rt", L.RETURN_TAG, E7.returnTag(L.RETURN_TAG, { id: "rt", face: "false", scale: L.RETURN_TAG.scale }));
L.ODD_A.forEach((q, i) => hput("odd" + i, q, E7.oddCoin(q, { id: "odd" + i, kind: "plain", scale: q.scale, state: i ? "attacker" : "normal" })));
hput("omni", L.DOC_OMNI, O.doc(L.DOC_OMNI, { id: "omni", title: "Omni-USDT", lines: ["valid = false"], standing: true }));
L.CKPT_A.forEach((q, i) => wput("ck" + i, q, O.checkpoint(q, { id: "ck" + i, n: "①②③④"[i], armUp: true })));
put("fin", L.FINALITY, E16.finalitySignal(L.FINALITY, { id: "fin", scale: L.FINALITY.scale, state: "pending" }));
L.RPC.forEach((q, i) => wput("rpc" + i, q, O.rpc(q, { id: "rpc" + i })));
// 交易信封：L1 一封落进充值地址；L3 红信停在第 3 块
const blk = (i, z) => ({ u: L.CHAIN.u + (i - 1.5) * 180 * 0.7, v: L.CHAIN.v + 40, z });
hput("lt", blk(3), E1.letter(blk(3), { id: "lt", z: 70 }), 60);
hput("lt2", blk(2), E1.letter(blk(2), { id: "lt2", z: 70, state: "attacker" }), 60);
// 假代币红虚线框；两节点之间的复核虚线
{ const [x0, y0, x1, y1] = L.rect(L.ODD_A[1], "oddCoin");
  add(L.ODD_A[1], S.hid("fakebox", `<rect x="${x0 - 10}" y="${y0 - 10}" width="${x1 - x0 + 20}" height="${y1 - y0 + 20}" rx="10" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="10 8"/>`), 20); }
{ const [a, b] = [A.rpc0.tip ?? A.rpc0.top, A.rpc1.tip ?? A.rpc1.top];
  add(L.RPC[1], S.hid("nodeln", `<path d="M${a[0]} ${a[1]} Q${(a[0] + b[0]) / 2} ${Math.min(a[1], b[1]) - 60} ${b[0]} ${b[1]}" fill="none" stroke="#2aa3c9" stroke-width="5" stroke-dasharray="12 9"/>`), 200); }

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const sm = (c) => c + " lab-sm";
lb("lb-fake", up(A.addr1.top, 40), "假充值", "lab-rs");
lb("lb-plus", up(A.addr0.top, 10), "+1 充值", sm("lab-r"), "r");
["失败", "伪造", "金额不符"].forEach((x, i) => lb("lb-k" + i, up(A.chain.blocks[i === 2 ? 3 : i], 30 + (i % 2) * 80), x, sm("lab-r")));
lb("n1", up(A.rt.top, 14), "① 交易失败却上链", sm("lab-ink"));
lb("lb-exist", [A.mag.lens[0] + 90, A.mag.lens[1] - 30], "存在 ✓", sm("lab-gs"), "l");
lb("lb-st0", [A.mag.lens[0] + 90, A.mag.lens[1] + 30], "执行状态 ?", sm("lab-ink"), "l");
lb("lb-st1", [A.mag.lens[0] + 92, A.mag.lens[1] + 32], "执行状态 ✗ 没查", sm("lab-rs"), "l");
lb("lb-same", up(A.chain.top, 40), "TRON · 以太坊 同类", sm("lab-cs"));
lb("n2", up(A.omni.top, 14), "② 无效交易入账", sm("lab-ink"));
lb("lb-valid", [A.omni.center[0] + 70, A.omni.center[1]], "valid = false", sm("lab-rs"), "l");
lb("n3", up(A.sc.top, 14), "③ 部分支付 · XRP", sm("lab-ink"));
const lcd = A.sc.lcd;
lb("lb-req0", [lcd[0] - 70, lcd[1] - 28], "请求 ?", sm("lab-ink"), "r");
lb("lb-got0", [lcd[0] - 70, lcd[1] + 28], "到账 ?", sm("lab-ink"), "r");
lb("lb-req1", [lcd[0] - 72, lcd[1] - 30], "请求 约 150 亿美元 ✗", sm("lab-r"), "r");
lb("lb-got1", [lcd[0] - 72, lcd[1] + 30], "到账 约 0.001 美元", sm("lab-ink"), "r");
lb("lb-got2", [lcd[0] - 74, lcd[1] + 32], "到账 约 0.001 美元 ✓", sm("lab-gs"), "r");
lb("lb-dl", [A.sc.ground[0] + 60, A.sc.ground[1] + 20], "按 delivered_amount 入账", sm("lab-gs"), "t");
lb("n4", up(A.odd1.top, 30), "④ 假代币 · 只认合约地址", sm("lab-ink"));
lb("lb-real", [A.odd0.ground[0] - 50, A.odd0.ground[1]], "合约 ✓", sm("lab-gs"), "r");
lb("lb-fakec", [A.odd1.ground[0] + 50, A.odd1.ground[1] + 10], "合约 ✗", sm("lab-rs"), "l");
lb("n5", up(A.mag.top, 14), "⑤ Transfer 事件 · 来源 ?", sm("lab-ink"));
lb("n5b", up(A.mag.top, 16), "⑤ Transfer 事件 · 没查来源合约", sm("lab-rs"));
lb("n6", up(A.chain.last, 30), "⑥ 区块回滚", sm("lab-rs"));
lb("lb-conf", up(A.fin.top, 14), "确认数不足", sm("lab-r"));
lb("lb-n1", up(A.rpc0.top, 10), "节点 1", sm("lab-cs"));
lb("lb-n2", up(A.rpc1.top, 10), "节点 2", sm("lab-cs"));
lb("lb-n1x", [A.rpc0.top[0] - 70, A.rpc0.top[1] + 40], "篡改 / 不同步 → 错账", sm("lab-r"), "r");

// ---------------------------------------------------------------- 屏幕层卡片
const CA = { x: 60, y: 300, w: 620 };
const cardA = codeCard("ca", { ...CA, head: "入账检查", tag: "示意", rows: [
  { html: "执行状态　成功？", chip: "✓", chipCls: "ok" },
  { html: "代币合约　在白名单内？", chip: "✓", chipCls: "ok" },
  { html: "实际到账　delivered_amount", chip: "✓", chipCls: "ok" },
  { html: "确认数　　达到最终性？", chip: "✓", chipCls: "ok" },
  { html: "复核　　　第二个独立节点", chip: "✓", chipCls: "ok" },
] });
const cvTo = [A.ck0.top, A.ck1.top, A.sc.diff ?? A.sc.lcd, A.ck3.top, A.rpc1.top];
cvTo.forEach((p, i) => S.curve("cv" + i, [CA.x + CA.w + 4, codeRowY(CA.y, i)], S.scr("checksR", p), { color: "#e0453a" }));
const src = (a, b) => `${a}<br><span style="font-size:28px;color:#6b665c">来源 · ${b}</span>`;
const html = cardA
  + evt("ev-eos", src("<b>EOS</b> · 2019 年 3 月", "SlowMist 分析"), { top: 120 })
  + evt("ev-omni", src("<b>Omni-USDT</b> · 2018 年 6 月", "SlowMist 分析"), { top: 124 })
  + evt("ev-bfx", src("<b>Bitfinex</b> · 2024 年 1 月", "XRPL 文档 · Cointelegraph 报道"), { top: 128 })
  + kw("kw-six", "① 失败上链 · ② 无效交易 · ③ 部分支付 · ④ 假代币 · ⑤ 伪造事件 · ⑥ 回滚", { x: 200, y: 790, size: 30 })
  + kw("kw-rule", "以 <b>链上执行结果</b> + <b>实际到账金额</b> 为准", { x: 420, y: 680, size: 46, accent: "#1d93ba" })
  + kw("kw-new", `新链 · 按 <b>它的交易模型</b> 从头设计`, { x: 300, y: 130, size: 38, accent: "#1d93ba" })
  + kw("kw-copy", "<s>照搬以太坊的逻辑</s>", { x: 300, y: 214, size: 32, accent: "#e0453a", cls: "kw-red" });
const css = `.kw-red { color: #c3352b; } .kw-red s { text-decoration-color: #e0453a; text-decoration-thickness: 4px; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  fake: w("假充值", 1), rec: w("记成", 1), k0: w("失败", 2), k1: w("伪造", 2), k2: w("到账", 2),
  st: w("不看", 4), valid: LE[7] - 2.2, xrpReq: w("请求", 9), xrpGot: w("实际", 9),
  amt: w("名义", 11), got: w("实际", 11), ok: w("入账", 12), fakeC: w("照抄", 13),
  src5: w("来自", 14), back: w("回滚", 15), node1: w("篡改", 24), copy: w("照搬", 25),
};
const t = (x) => f(x);

S.build({
  cam0: "flowAC", sub: "只认真正到账的钱",
  grid: { u0: -3100, u1: 8900, v0: -6500, v1: 5600 }, box: [-2100, -3400, 8300, 4800],   // 盖住上段终点 flowAC + intakeA / checksA
  shown: [], css, html,
  terms: [
    { id: "t0", t: "部分支付", d: "XRP 中实际到账可小于请求金额", at: w("部分支付", 8) },
    { id: "t1", t: "确认数", d: "交易所在区块之后又叠了多少块", at: w("确认数", 15) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先看充值这一头。
      cam(${t(LS[0])}, "intakeA", 1.4); bump("#sgA", ${t(LS[0] + 1.2)}, 1.08, 1);
      // ===== L1 假充值，是交易所把一笔不该算数的转账，记成了用户的充值。
      fadeIn("#h-lt", ${t(LS[1])}, 0.3); X1.walk(tl, "lt", ${t(LS[1] + 0.4)}, 1.4, [[${A.addr0.top}]]);
      pop("#lb-fake", ${t(TM.fake)}); pop("#lb-plus", ${t(TM.rec)}); bump("#addr0", ${t(TM.rec)}, 1.08, 1);
      // ===== L2 失败的、伪造的、到账金额不对的，都算。
      pop("#lb-k0", ${t(TM.k0)}); pop("#lb-k1", ${t(TM.k1)}); pop("#lb-k2", ${t(TM.k2)});
      out("#lb-fake, #lb-plus, #lb-k0, #lb-k1, #lb-k2, #h-lt", ${t(LS[3] - 0.2)});
      // ===== L3 第一种，交易失败了，却已经上链。
      fadeIn("#h-lt2", ${t(LS[3] + 0.2)}, 0.3); fadeIn("#h-rt", ${t(LS[3] + 1.0)}, 0.3); pop("#n1", ${t(LS[3] + 1.2)});
      // ===== L4 扫描服务只看交易存不存在，不看执行状态。
      bump("#mag", ${t(LS[4])}, 1.08, 1); pop("#lb-exist", ${t(LS[4] + 0.4)}); pop("#lb-st0", ${t(LS[4] + 0.9)});
      out("#lb-st0", ${t(TM.st)}, 0.15); pop("#lb-st1", ${t(TM.st + 0.1)});
      // ===== L5 2019 年 3 月，SlowMist 披露了 EOS 上的这类手法，TRON 和以太坊也要防。
      pop("#ev-eos", ${t(LS[5] + 0.1)}); pop("#lb-same", ${t(LS[5] + 4.6)});
      out("#ev-eos, #lb-same, #lb-exist, #lb-st1", ${t(LS[6] - 0.2)});
      // ===== L6 第二种，无效交易被入账。
      fadeIn("#h-omni", ${t(LS[6] + 0.2)}, 0.4); pop("#n2", ${t(LS[6] + 0.6)});
      // ===== L7 2018 年 6 月，SlowMist 预警，部分交易所没有校验 Omni-USDT 交易的 valid 字段。
      pop("#ev-omni", ${t(LS[7] + 0.1)}); pop("#lb-valid", ${t(TM.valid)}); bump("#lb-valid", ${t(TM.valid + 0.6)}, 1.1, 2);
      out("#ev-omni, #lb-valid", ${t(LS[8] - 0.2)});
      // ===== L8 第三种，部分支付，这是 XRP 的一个特性。
      cam(${t(LS[8])}, "scaleA", 1.2); pop("#n3", ${t(LS[8] + 0.8)});
      // ===== L9 一笔支付写的请求金额，可以远大于实际到账的金额。
      pop("#lb-req0", ${t(TM.xrpReq)}); pop("#lb-got0", ${t(TM.xrpGot)});
      // ===== L10 2024 年 1 月，有人向 Bitfinex 发起了一笔部分支付。
      pop("#ev-bfx", ${t(LS[10] + 0.1)}); X7.weigh(tl, "sc", ${t(LS[10] + 2.4)});
      // ===== L11 名义金额约 150 亿美元，实际到账约 0.001 美元。（关键画面）
      out("#lb-req0", ${t(TM.amt)}, 0.15); pop("#lb-req1", ${t(TM.amt + 0.1)});
      out("#lb-got0", ${t(TM.got)}, 0.15); pop("#lb-got1", ${t(TM.got + 0.1)}); X7.diff(tl, "sc", ${t(TM.got + 0.4)}, false, "差额");
      bump("#lb-req1", ${t(TM.amt + 1.8)}, 1.08, 1); bump("#lb-req1", ${t(TM.got + 1.4)}, 1.08, 2); bump("#lb-got1", ${t(TM.got + 2.4)}, 1.08, 1);
      // ===== L12 Bitfinex 按实际到账金额入账，攻击没有成功。
      out("#lb-got1", ${t(TM.ok - 0.6)}, 0.15); pop("#lb-got2", ${t(TM.ok - 0.5)}); pop("#lb-dl", ${t(TM.ok)});
      X7.diff(tl, "sc", ${t(TM.ok)}, true, "按到账入账");
      out("#ev-bfx, #lb-req1, #lb-got2, #lb-dl, #n1, #n2, #n3", ${t(LS[13] - 0.2)});
      // ===== L13 第四种，假代币，名字和符号都能照抄。
      cam(${t(LS[13])}, "intakeA", 1.2); fadeIn("#h-odd0, #h-odd1", ${t(LS[13] + 0.6)}, 0.4); pop("#n4", ${t(LS[13] + 1.0)});
      fadeIn("#fakebox", ${t(TM.fakeC)}, 0.3); pop("#lb-real", ${t(TM.fakeC + 0.2)}); pop("#lb-fakec", ${t(TM.fakeC + 0.4)});
      out("#n4, #lb-real, #lb-fakec", ${t(LS[14] - 0.2)});
      // ===== L14 第五种，伪造的转账事件，系统只看 Transfer 事件，不看它来自哪个合约。
      pop("#n5", ${t(LS[14] + 0.2)}); bump("#mag", ${t(LS[14] + 2.6)}, 1.08, 1);
      out("#n5", ${t(TM.src5)}, 0.15); pop("#n5b", ${t(TM.src5 + 0.1)});
      out("#n5b", ${t(LS[15] - 0.2)});
      // ===== L15 第六种，确认数不够就入账，之后区块回滚，这笔充值也跟着消失。
      cam(${t(LS[15])}, "A", 1.4); X16.sig(tl, "fin", ${t(LS[15] + 1.4)}, 0);
      pop("#lb-conf", ${t(LS[15] + 1.8)}); X16.sigBad(tl, "fin", ${t(TM.back)}, true);
      tl.to("#chain-b3, #chain-l2, #h-lt2", { opacity: 0.2, duration: 0.6 }, ${t(TM.back + 0.1)}); pop("#n6", ${t(TM.back + 0.2)});
      // ===== L16 这些形态，可以归成一条原则。
      out("#n6, #lb-conf, #h-rt, #h-omni, #h-odd0, #h-odd1, #fakebox", ${t(LS[16] - 0.2)});
      pop("#kw-six", ${t(LS[16] + 0.2)});
      // ===== L17 以链上执行结果和实际到账金额为准。
      pop("#kw-rule", ${t(LS[17] + 0.1)});
      out("#kw-six, #kw-rule", ${t(LS[18] - 0.2)});
      // ===== L18 入账之前，过四道检查。
      cam(${t(LS[18])}, "checksR", 1.2); [0, 1, 2, 3].forEach((i) => KIT.arm(tl, "ck" + i, ${t(LS[18] + 0.6)} + i * 0.15, false, 0.5));
      pop("#ca", ${t(LS[18] + 1.0)}); pop("#lb-n1", ${t(LS[18] + 1.4)}); pop("#lb-n2", ${t(LS[18] + 1.5)});
      // ===== L19 执行成功了吗。
      draw("cv0", ${t(LS[19])}, 0.5); KIT.arm(tl, "ck0", ${t(LS[19] + 0.4)}, true, 0.5); hot("#ca-r0", ${t(LS[19] + 0.4)}, "#dff3e6"); pop("#ca-c0", ${t(LS[19] + 0.5)}, 0.2);
      // ===== L20 代币合约地址，在白名单里吗。
      out("#cv0", ${t(LS[20] - 0.1)}, 0.2);
      draw("cv1", ${t(LS[20])}, 0.5); KIT.arm(tl, "ck1", ${t(LS[20] + 0.5)}, true, 0.5); hot("#ca-r1", ${t(LS[20] + 0.5)}, "#dff3e6"); pop("#ca-c1", ${t(LS[20] + 0.6)}, 0.2);
      // ===== L21 实际到账多少。
      out("#cv1", ${t(LS[21] - 0.1)}, 0.2);
      draw("cv2", ${t(LS[21])}, 0.5); X7.weigh(tl, "sc", ${t(LS[21] + 0.3)}); KIT.arm(tl, "ck2", ${t(LS[21] + 0.5)}, true, 0.5);
      hot("#ca-r2", ${t(LS[21] + 0.5)}, "#dff3e6"); pop("#ca-c2", ${t(LS[21] + 0.6)}, 0.2);
      // ===== L22 确认数够了吗。
      out("#cv2", ${t(LS[22] - 0.1)}, 0.2);
      draw("cv3", ${t(LS[22])}, 0.4); X16.sigBad(tl, "fin", ${t(LS[22] + 0.2)}, false); X16.sig(tl, "fin", ${t(LS[22] + 0.25)}, 2, 0.4);
      KIT.arm(tl, "ck3", ${t(LS[22] + 0.4)}, true, 0.4); hot("#ca-r3", ${t(LS[22] + 0.4)}, "#dff3e6"); pop("#ca-c3", ${t(LS[22] + 0.5)}, 0.2);
      // ===== L23 最后，用第二个独立节点再复核一遍。
      out("#cv3", ${t(LS[23] - 0.1)}, 0.2);
      draw("cv4", ${t(LS[23] + 0.3)}, 0.5); bump("#rpc1", ${t(LS[23] + 0.8)}, 1.06, 1); fadeIn("#nodeln", ${t(LS[23] + 1.2)}, 0.5);
      hot("#ca-r4", ${t(LS[23] + 1.4)}, "#dff3e6"); pop("#ca-c4", ${t(LS[23] + 1.5)}, 0.2);
      // ===== L24 只靠一个节点，节点被篡改或者不同步，也会记错账。
      out("#cv4", ${t(LS[24] + 0.4)}, 0.2);
      tl.to("#rpc0-wave-0, #rpc0-wave-1, #rpc0-wave-2", { stroke: "#e0453a", duration: 0.2 }, ${t(TM.node1)});
      flash("#rpc0", ${t(TM.node1 + 0.1)}, 2); pop("#lb-n1x", ${t(TM.node1 + 0.2)});
      tl.to("#rpc0-wave-0, #rpc0-wave-1, #rpc0-wave-2", { stroke: "#2aa3c9", duration: 0.3 }, ${t(LS[25] - 0.3)});
      out("#ca, #lb-n1x", ${t(LS[25] - 0.2)});
      // ===== L25 每接入一条新链，都要按这条链的交易模型，从头设计入账校验，不能照搬以太坊的逻辑。
      cam(${t(LS[25])}, "checksA", 1.2); pop("#kw-new", ${t(LS[25] + 1.4)}); pop("#kw-copy", ${t(TM.copy)});
`,
});
