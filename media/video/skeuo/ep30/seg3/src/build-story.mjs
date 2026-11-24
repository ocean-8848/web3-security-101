// ep30/seg3「③ 背书与排序」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.roninB（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   wide         全景：A–F 整座联盟大厦（seg6 L8–L10、L13–L14 结束卡）
//   A            分区全景
//   B            
//   C            
//   D            
//   E            
//   F            
//   nodesA       A 四台机柜 + 工牌 + 账本 + 门外门禁与攻击者（seg1 起点 L0–L3）
//   hashA        A 区块链 + 哈希漏斗两路 + 扳道器 + 证明卡 + 四本账本（seg1 L4–L9）
//   hallA        A 大厅全景 + 门外门禁 + 题卡（seg1 L10–L14 终点；seg2 起点）
//   gateB        B 门禁闸机 + 前台 + 工牌堆 + 万能钥匙 + 物业（seg2 L0–L5）
//   metaphorB    B 广场 vs 写字楼 + 监控报警 vs 改写账本（seg2 L6–L12）
//   rolesB       B 资源阶梯 roleBoard（+ 前台 / 万能钥匙在左侧）（seg2 L13–L17）
//   roninB       B Ronin 角：九把钥匙 + 门槛表（seg2 L18–L20 终点；seg3 起点）
//   pipeC        C 三道关：背书节点 + 读写集 + 排序服务 + 关卡 + 世界状态（seg3 L0–L5）
//   policyC      C 策略牌 + 五台 Raft 机柜 + 关卡（seg3 L6–L12）
//   privacyC     C 私有数据保险柜 + 信封 + 哈希漏斗 + 三张哈希签 + 圈外组织 + 盐罐（seg3 L13–L17）
//   detC         C 时钟 + 骰子 + 两张读写集（seg3 L18–L19 终点；seg4 起点）
//   caD          D 根 CA 加密机 + 在线服务器 + 中间 CA 公章 + 身份 / TLS CA + 隔板（seg4 L0–L5）
//   adminD       D 服务商工位 + 三张管理员卡 + 三台自家机柜（seg4 L6–L9）
//   configD      D 通道配置 + 三枚公章 + 变更留痕 + 吊销工牌 + 已分发数据 + 沙漏（seg4 L10–L14）
//   colludeD     D 三名成员 + 红账本 + 账本摘要 → 公链（seg4 L15–L18）
//   cloudD       D 云桶拆分（seg4 L19 终点；seg5 起点）
//   cordaE       E Corda 节点 + 公证人柜台 + 同一状态 + 包裹 + 放大镜 + always-accept（seg5 L0–L7）
//   besuE        E Besu 轮值台 + 铸币机 + 合同（seg5 L8–L14）
//   p2pE         E 插线板 + 防火墙 + 四份本地准入（seg5 L15–L17）
//   legacyE      E 退役机柜 + 牌子 + 扳手 + 迁移箭头（seg5 L18–L21 终点；seg6 起点）
//   deskF        F 问询台 + 安全假设 + 工牌 + 用户 / 手机 + 三块牌子 + 删除更正 / 锚定 / 审计（seg6 L0–L7、L11–L12）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
// ends static on CAMS.detC
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E24 from "../../../ep24/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E3, E5, E24] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 包一层缩放（SEGBASE 常见坑 1）
// wput: o.scale 不被物件支持时，绕地面点缩放并换算 anchors；hide = 外层透明组 id（fadeIn 出现）
function wput(key, o, r, dy = 0, hide) {
  const k = o.scale ?? 1, [gx, gy] = at(o);
  const wrap = (svg) => {
    const g = k === 1 ? svg : `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>`;
    return hide ? S.hid(hide, g) : g;
  };
  put(key, o, r, dy, { wrap });
  for (const n of Object.keys(A[key] || {})) {
    const v = A[key][n];
    if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number") A[key][n] = [gx + (v[0] - gx) * k, gy + (v[1] - gy) * k];
  }
}
const dashBox = (id, rc, pad = 14) =>
  S.hid(id, `<rect x="${rc[0] - pad}" y="${rc[1] - pad}" width="${rc[2] - rc[0] + 2 * pad}" height="${rc[3] - rc[1] + 2 * pad}" rx="10" fill="none" stroke="#e0453a" stroke-width="4" stroke-dasharray="14 9"/>`);
const union = (rs) => [Math.min(...rs.map((q) => q[0])), Math.min(...rs.map((q) => q[1])), Math.max(...rs.map((q) => q[2])), Math.max(...rs.map((q) => q[3]))];

// ---------------------------------------------------------------- B · Ronin 角（上一段结尾画面：五把红钥匙 + 门槛表到 5）
L.B_KEYS.forEach((o, i) => wput("rk" + i, o, O.key(o, { id: "rk" + i, state: i < 5 ? "attacker" : "normal" })));
wput("rmeter", L.B_METER, E5.thresholdMeter(L.B_METER, { id: "rmeter", max: 9, th: 5, level: 5, state: "attacker", thText: "5 / 9" }));
lb("lb-ronin", up(A.rmeter.top, 10), "Ronin 桥", "lab-ink lab-sm");

// ---------------------------------------------------------------- C ① 执行 ② 排序 ③ 验证
L.C_ENDORSERS.forEach((o, i) => wput("en" + i, o, O.rack(o, { id: "en" + i, tag: "Org" + (i + 1) })));
L.C_RWSETS.forEach((o, i) => wput("rw" + i, o, E2.sigPaper(o, { id: "rw" + i, title: "读写集", tag: "✓" }), 0, "rwh" + i));
wput("srt", L.C_SORTER, E1.sorter(L.C_SORTER, { id: "srt", letters: 3, blockLabel: "区块" }));
put("ltok", L.C_LETTER, E1.letter(L.C_LETTER, { id: "ltok" }), 0, { wrap: (s) => S.hid("ltokh", s) });
put("ltbad", L.C_LETTER, E1.letter(L.C_LETTER, { id: "ltbad", state: "attacker" }), 1, { wrap: (s) => S.hid("ltbadh", `<g opacity="0.55">${s}</g>`) });
wput("ck3", L.C_GATE, O.checkpoint(L.C_GATE, { id: "ck3", n: "③" }));
put("wst", L.C_STATE, O.ledgerBook(L.C_STATE, { id: "wst", scale: L.C_STATE.scale }));
lb("lb-tag", at(L.C_TAG), "Fabric 流水线", "lab-ink");
["①", "②", "③"].forEach((n, i) => lb("lb-n" + i, at(L.C_NUMS[i]), n + " " + ["执行", "排序", "验证"][i], "lab-cs lab-sm", "c"));
lb("lb-en", up(A.en0.top, 10), "背书节点", "lab-cs lab-sm");
lb("lb-same", up(A.rw1.top, 10), "一致 ✓", "lab-gs lab-sm");
lb("lb-srt", up(A.srt.top, 10), "排序服务 · 不判断业务", "lab-ink lab-sm");
lb("lb-ck", up(A.ck3.top, 10), "背书策略 · 读集版本", "lab-ink lab-sm");
lb("lb-wst", up(A.wst.top, 6), "世界状态", "lab-cs lab-sm");
lb("lb-inv", up(A.ltbad.top, 8), "无效 · 仍在区块里", "lab-rs lab-sm");

// ---------------------------------------------------------------- C 策略牌 + Raft
L.C_POLICY.forEach((o, i) => put("pol" + i, o, O.doc(o, { id: "pol" + i, standing: true, title: "背书策略", lines: [i ? "任一组织" : "通道成员多数"],
  state: i ? "attacker" : "normal" }), 0, { grow: true }));
{
  const [ox, oy] = at(L.C_ORGDOTS), xs = [-66, -22, 22, 66];
  const dot = (x, c, r = 13) => `<circle cx="${ox + x}" cy="${oy}" r="${r}" fill="${c}" stroke="#ffffff" stroke-width="3"/>`;
  add(L.C_ORGDOTS, S.hid("od0", xs.map((x) => dot(x, "#c9c2b4")).join("")));
  add(L.C_ORGDOTS, S.hid("odg", xs.slice(0, 3).map((x) => dot(x, "#1f9d55")).join("")), 1);
  add(L.C_ORGDOTS, S.hid("odr", dot(xs[0], "#e0453a")), 2);
}
add(L.C_POLICY[1], dashBox("pbox", L.rect(L.C_POLICY[1], "docStanding")), 5);
L.C_RAFT.forEach((o, i) => wput("rf" + i, o, O.rack(o, { id: "rf" + i, tag: "Raft", leds: ["off", "off", "off"] })));
{
  const OPS = ["#2aa3c9", "#1c1c1c", "#b0884a", "#2aa3c9", "#1c1c1c"];
  add(L.C_RAFT[0], S.hid("ops", L.C_RAFT.map((o, i) => { const [x, y] = at(o); return `<rect x="${x - 30}" y="${y + 14}" width="60" height="14" rx="5" fill="${OPS[i]}"/>`; }).join("")), 40);
}
add(L.C_RAFT[2], dashBox("rfbox", L.rect(L.C_RAFT[2], "rack"), 10), 60);
lb("lb-raft", at(L.C_RAFTLBL), "崩溃容错 · 只防宕机", "lab-ink lab-sm", "c");
lb("lb-tol", up(A.rf2.top, 14), "5 个 · 容忍 2 个宕机", "lab-cs lab-sm");
lb("lb-lead", up(A.rf2.top, 14), "一家运营方被攻破", "lab-rs lab-sm");
lb("lb-ord", at(L.C_RAFTLBL), "顺序 3 · 1 · 延迟 2 · 丢弃 4", "lab-r lab-sm", "c");
lb("lb-bft", at(L.C_RAFTLBL), "BFT · 分运营方", "lab-gs lab-sm", "c");
lb("lb-fake", up(A.ck3.top, 10), "伪造背书 · 拦下", "lab-gs lab-sm");
lb("lb-maj", up(A.pol0.top, 8), "多数 ✓", "lab-gs lab-sm");
lb("lb-one", up(A.pol1.top, 8), "一家说了算", "lab-rs lab-sm");

// ---------------------------------------------------------------- C 隐私角
wput("pds", L.C_SAFE, O.safe(L.C_SAFE, { id: "pds", open: 105, plate: "私有数据" }));
put("trn", L.C_TRANSIENT, O.envelope(L.C_TRANSIENT, { id: "trn" }), 0, { wrap: (s) => `<g id="trng">${s}</g>` });
wput("hf", L.C_FUNNEL, E3.hashFunnel(L.C_FUNNEL, { id: "hf", inputs: ["原文"], output: "哈希", text: "哈希" }));
put("out", L.C_OUTSIDER, O.person(L.C_OUTSIDER, { id: "out", role: "attacker", scale: L.C_OUTSIDER.scale, color: "#8f887c" }));
put("salt", L.C_SALT, E24.saltShaker(L.C_SALT, { id: "salt", scale: L.C_SALT.scale, label: "随机盐" }));
{
  const [sx, sy] = A.pds.top ?? up(at(L.C_SAFE), 200);
  const env = (dx, dy) => `<g transform="translate(${sx + dx},${sy + dy})"><rect x="-22" y="-15" width="44" height="30" rx="3" fill="#fff" stroke="#1d93ba" stroke-width="3"/><path d="M-22 -15 L0 3 L22 -15" fill="none" stroke="#1d93ba" stroke-width="3"/></g>`;
  add(L.C_SAFE, S.hid("fly0", env(-20, 0)) + S.hid("fly1", env(30, 10)), 60);
}
lb("lb-pds", up(A.pds.top ?? at(L.C_SAFE), 10), "私有数据集合", "lab-cs lab-sm");
lb("lb-orig", up(A.pds.top ?? at(L.C_SAFE), 70), "原文 → 只发 Org1 · Org2", "lab-cs lab-sm");
lb("lb-onlyh", up(A.hf.top, 10), "其余组织账本：只留哈希", "lab-ink lab-sm");
lb("lb-led", up(A.hf.top, 10), "账本上的哈希 = H(?)", "lab-ink lab-sm");
lb("lb-row", [at(L.C_SAFE)[0], at(L.C_SAFE)[1] + 26], `客户等级 <b style="color:#1d93ba">A</b> · <b style="color:#1d93ba">B</b> · <b style="color:#1d93ba">C</b>`, "lab-ink lab-sm", "t");
["A", "B", "C"].forEach((x, i) => {
  lb("lb-h" + i, at(L.C_HASHTAGS[i]), `H(${x})`, "lab-ink lab-sm", "c");
  lb("lb-hs" + i, at(L.C_HASHTAGS[i]), `H(${x}) ✕`, "lab-r lab-sm", "c");
});
lb("lb-hit", at(L.C_HASHTAGS[1]), "H(B) ✓ 对上", "lab-gs lab-sm", "c");
lb("lb-outn", up(A.out.top, 8), "圈外组织", "lab-ink lab-sm");
lb("lb-leak", [at(L.C_HASHTAGS[2])[0], at(L.C_HASHTAGS[2])[1] + 40], "等级泄露", "lab-rs lab-sm", "t");
lb("lb-salted", up(A.hf.top, 10), "账本上的哈希 = H(B + 盐)", "lab-gs lab-sm");
lb("lb-trn", up(A.trn.top ?? at(L.C_TRANSIENT), 10), "transient", "lab-cs lab-sm");
lb("lb-plain", up(A.trn.top ?? at(L.C_TRANSIENT), 60), "<s>普通参数</s>", "lab-r lab-sm");
add(L.C_HASHTAGS[1], dashBox("lbox", union([...L.C_HASHTAGS.map((q) => L.rect(q, "hashTag")), L.rect(L.C_OUTSIDER, "personAtk")]), 18), 80);

// ---------------------------------------------------------------- C 确定性角
wput("clk", L.C_CLOCK, O.clock(L.C_CLOCK, { id: "clk", h: 10, m: 0 }));
wput("die", L.C_DIE, E2.die(L.C_DIE, { id: "die", top: 3 }));
L.C_DETSETS.forEach((o, i) => wput("ds" + i, o, E2.sigPaper(o, { id: "ds" + i, title: "读写集", tag: String(i + 1) })));
lb("lb-clk", up(A.clk.top, 8), "本地时间", "lab-r lab-sm");
lb("lb-die", up(A.die.top, 8), "随机数", "lab-r lab-sm");
lb("lb-d0", up(A.ds0.top, 10), "结果 X", "lab-r lab-sm");
lb("lb-d1", up(A.ds1.top, 10), "结果 Y", "lab-r lab-sm");
lb("lb-dx", [(A.ds0.top[0] + A.ds1.top[0]) / 2, A.ds0.center?.[1] ?? A.ds0.top[1] + 80], "✕ 过不了背书", "lab-rs lab-sm", "c");
lb("lb-d0g", up(A.ds0.top, 10), "结果 X ✓", "lab-gs lab-sm");
lb("lb-d1g", up(A.ds1.top, 10), "结果 X ✓", "lab-gs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const CA = { x: 60, y: 110, w: 640 }, CB = { x: 380, y: 120, w: 1060 }, CC = { x: 520, y: 120, w: 820 };
const cardA = codeCard("cka", { ...CA, mono: true, head: "背书策略", tag: "示意", rows: [
  { html: `<span class="cm">// 通道成员多数（默认）</span>` },
  { html: `MAJORITY Endorsement`, chip: "多数", chipCls: "ok" },
  { html: `<span class="cm">// 过弱：任一组织单独决定</span>` },
  { html: `OR('Org1MSP.peer','Org2MSP.peer')`, chip: "一家", chipCls: "x" },
] });
const cardB = codeCard("ckb", { ...CB, mono: true, head: "链码确定性", tag: "示意", rows: [
  { html: `ts := time.Now().Unix()`, chip: "各节点不同", chipCls: "x" },
  { html: `t, _ := stub.GetTxTimestamp()`, chip: "各节点一致", chipCls: "ok" },
] });
const cardC = codeCard("ckc", { ...CC, mono: true, head: "私有数据输入", tag: "示意", rows: [
  { html: `transient: { "level": "A", "salt": &lt;随机&gt; }` },
] });
S.curve("cva1", [CA.x + CA.w + 4, codeRowY(CA.y, 1)], S.scr("policyC", A.pol0.top), { color: "#1f9d55" });
S.curve("cva3", [CA.x + CA.w + 4, codeRowY(CA.y, 3)], S.scr("policyC", A.pol1.top), { color: "#e0453a" });
S.curve("cvc0", [CC.x + 120, codeRowY(CC.y, 0) + 26], S.scr("privacyC", A.trn.top ?? at(L.C_TRANSIENT)), { color: "#e0453a" });
S.curve("cvc1", [CC.x + CC.w + 4, codeRowY(CC.y, 0)], S.scr("privacyC", A.salt.top), { color: "#e0453a" });
S.curve("cvb0", [CB.x + 200, codeRowY(CB.y, 0) + 26], S.scr("detC", A.clk.top), { color: "#e0453a" });
S.curve("cvb1", [CB.x + CB.w + 4, codeRowY(CB.y, 1)], S.scr("detC", A.ds1.top), { color: "#1f9d55" });
const html = cardA + cardB + cardC;
const css = `.cm { color: #8f887c; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  ex: w("执行", 1), so: w("排序", 1), va: w("验证", 1), rw: w("读写集", 2), biz: w("不判断业务", 3), rs: w("读集", 4),
  inv: w("无效", 5), maj: w("多数", 7), any: w("任一组织", 8), one: w("单独决定", 8), crash: w("宕机", 10), mal: w("恶意", 10),
  hack: w("被攻破", 11), forge: w("伪造不了背书", 11), ord: w("顺序", 11), bft: w("BFT", 12), ops: w("不同的运营方", 12),
  orig: w("原文", 14), hash: w("哈希", 14), three: w("三档", 15), cmp: w("三个哈希", 16), know: w("就知道了", 16),
  salt: w("随机盐", 17), trn: w("transient", 17), plain: w("普通参数", 17), time: w("本地时间", 19), rnd: w("随机数", 19),
  diff: w("结果不同", 19), fail: w("过不了背书", 19),
};
const t = (x) => f(x);

S.build({
  cam0: "roninB", sub: "三道关，各有各的单点",
  grid: { u0: 3600, u1: 11200, v0: -3600, v1: 4200 }, box: [3600, -3400, 5300, 2800],   // 盖住本段镜头 pipeC · policyC · privacyC · detC（roninB = 上一段结尾）
  shown: [], css, html,
  terms: [
    { id: "t0", t: "读写集", d: "链码模拟执行产生的读取版本和写入值", at: w("读写集", 2) },
    { id: "t1", t: "排序服务", d: "给交易定顺序并打包成区块的服务", at: w("排序服务", 3) },
    { id: "t2", t: "崩溃容错", d: "能容忍节点宕机，不防恶意节点", at: w("崩溃容错", 10) },
    { id: "t3", t: "BFT", d: "能容忍部分节点恶意行为的共识", at: w("BFT", 12) },
    { id: "t4", t: "随机盐", d: "混进数据再算哈希的随机值", at: w("随机盐", 17) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先看 Hyperledger Fabric：从 Ronin 角右移到 pipeC
      out("#lb-ronin", ${t(LS[0] - 0.1)}); cam(${t(LS[0])}, "pipeC", 1.8); pop("#lb-tag", ${t(LS[0] + 1.4)});
      // ===== L1 三道关地面编号依次亮
      bump("#en0, #en1, #srt, #ck3", ${t(w("三道关", 1))}, 1.06, 1); [0, 1, 2].forEach((i) => pop("#lb-n" + i, ${t(w("三道关", 1) + 0.9)} + i * 0.8));
      // ===== L2 背书节点吐出读写集，一致
      pop("#lb-en", ${t(LS[2] + 0.3)}); bump("#en0, #en1", ${t(LS[2] + 1.2)});
      fadeIn("#rwh0", ${t(TM.rw - 0.4)}); fadeIn("#rwh1", ${t(TM.rw - 0.2)}); pop("#lb-same", ${t(TM.rw + 0.8)});
      // ===== L3 排序服务只排顺序
      out("#lb-en, #lb-same", ${t(LS[3] - 0.2)}); pop("#lb-srt", ${t(LS[3] + 0.4)});
      X1.dash(tl, ["srt-belt-0", "srt-belt-1"], ${t(LS[3] + 0.3)}, 2.4, 60);
      X1.reach(tl, "srt", ${t(LS[3] + 0.6)}, -40, 124); out("#srt-env-2", ${t(LS[3] + 1.5)}, 0.2);
      X1.reach(tl, "srt", ${t(LS[3] + 1.5)}, 200, 60); X1.reach(tl, "srt", ${t(LS[3] + 2.6)}, -20, 40);
      bump("#lb-srt", ${t(TM.biz)});
      // ===== L4 记账节点核对背书策略与读集版本，抬杆写账本
      out("#lb-srt", ${t(LS[4] - 0.2)}); fadeIn("#ltokh", ${t(LS[4] + 0.2)}); pop("#lb-ck", ${t(TM.rs - 1.2)});
      KIT.arm(tl, "ck3", ${t(TM.rs + 0.4)}, true); pop("#lb-wst", ${t(TM.rs + 0.8)}); bump("#wst", ${t(TM.rs + 0.8)});
      // ===== L5 被拒绝的交易留在区块里，标成无效
      out("#lb-ck, #lb-wst", ${t(LS[5] - 0.2)}); KIT.arm(tl, "ck3", ${t(LS[5])}, false, 0.5);
      KIT.swap(tl, "#ltokh", "#ltbadh", ${t(TM.inv - 0.6)}, 0.4); pop("#lb-inv", ${t(TM.inv)});
      // ===== L6 背书策略：镜头到 policyC，代码卡 A
      out("#lb-inv, #lb-n0, #lb-n1, #lb-n2, #lb-tag", ${t(LS[6] - 0.2)}); cam(${t(LS[6])}, "policyC", 1.4);
      pop("#cka", ${t(LS[6] + 1.6)}, 0.3);
      // ===== L7 默认：通道成员多数，四个点亮三个
      grow("pol0", ${t(LS[7])}); fadeIn("#od0", ${t(LS[7] + 0.2)});
      pop("#cka-c1", ${t(TM.maj - 0.3)}); draw("cva1", ${t(TM.maj - 0.3)}); fadeIn("#odg", ${t(TM.maj)}); pop("#lb-maj", ${t(TM.maj + 0.3)});
      // ===== L8 任一组织：只亮一个点，红框
      out("#odg", ${t(TM.any - 0.2)}); grow("pol1", ${t(TM.any - 0.1)}); hot("#cka-r3", ${t(TM.any)}, "#fde6e3");
      pop("#cka-c3", ${t(TM.any + 0.2)}); draw("cva3", ${t(TM.any + 0.2)}); fadeIn("#odr", ${t(TM.any + 0.5)});
      fadeIn("#pbox", ${t(TM.one)}); pop("#lb-one", ${t(TM.one + 0.2)});
      // ===== L9 排序服务按威胁选：Raft 五台亮起
      out("#cka, #cva1, #cva3, #lb-maj, #lb-one, #pbox, #odr, #od0", ${t(LS[9] - 0.2)});
      [0, 1, 2, 3, 4].forEach((i) => [0, 1, 2].forEach((j) => KIT.led(tl, "rf" + i + "-led-" + j, ${t(LS[9] + 0.4)} + i * 0.15, "green")));
      // ===== L10 崩溃容错：两台灭灯，网络照常；只防宕机
      pop("#lb-raft", ${t(LS[10] + 0.4)}); pop("#lb-tol", ${t(TM.crash - 0.6)});
      [3, 4].forEach((i) => { [0, 1, 2].forEach((j) => KIT.led(tl, "rf" + i + "-led-" + j, ${t(TM.crash)}, "off")); tl.to("#rf" + i, { opacity: 0.45, duration: 0.3 }, ${t(TM.crash)}); });
      bump("#lb-raft", ${t(TM.mal)});
      // ===== L11 一家运营方被攻破：leader 变红，顺序乱、扣交易；关卡照样拦伪造背书
      out("#lb-raft, #lb-tol", ${t(LS[11] - 0.2)});
      [3, 4].forEach((i) => { [0, 1, 2].forEach((j) => KIT.led(tl, "rf" + i + "-led-" + j, ${t(LS[11])}, "green")); tl.to("#rf" + i, { opacity: 1, duration: 0.3 }, ${t(LS[11])}); });
      [0, 1, 2].forEach((j) => KIT.led(tl, "rf2-led-" + j, ${t(TM.hack)}, "red")); pop("#lb-lead", ${t(TM.hack + 0.2)}); fadeIn("#rfbox", ${t(TM.hack)});
      pop("#lb-fake", ${t(TM.forge)}); bump("#ck3", ${t(TM.forge + 0.2)});
      pop("#lb-ord", ${t(TM.ord)}); bump("#lb-ord", ${t(TM.ord + 1.6)});
      // ===== L12 BFT + 分运营方：三色铭牌
      out("#lb-ord, #lb-fake, #lb-lead, #rfbox", ${t(LS[12] - 0.2)}); pop("#lb-bft", ${t(TM.bft)}); fadeIn("#ops", ${t(TM.ops)}, 0.5);
      // ===== L13 再看隐私：镜头到 privacyC
      out("#lb-bft", ${t(LS[13] - 0.2)}); cam(${t(LS[13])}, "privacyC", 1.3);
      // ===== L14 原文只发两家，其余账本只留哈希
      pop("#lb-pds", ${t(LS[14] + 0.3)}); pop("#lb-orig", ${t(TM.orig)});
      ["#fly0", "#fly1"].forEach((s, i) => { fadeIn(s, ${t(TM.orig + 0.2)} + i * 0.15, 0.2);
        tl.to(s, { x: -260, y: -170, duration: 1.2, ease: "power1.in" }, ${t(TM.orig + 0.4)} + i * 0.15); out(s, ${t(TM.orig + 1.4)} + i * 0.15, 0.25); });
      X3.hash(tl, "hf", ${t(TM.hash - 1.8)}); pop("#lb-onlyh", ${t(TM.hash - 0.2)});
      // ===== L15 客户等级只有三档
      out("#lb-orig", ${t(LS[15] - 0.2)}); out("#lb-onlyh", ${t(LS[16] - 0.3)}); pop("#lb-row", ${t(LS[15] + 0.4)}); bump("#lb-row", ${t(TM.three)});
      // ===== L16 关键画面：圈外组织算三个哈希一比
      pop("#lb-led", ${t(LS[16])}); pop("#lb-outn", ${t(LS[16] + 0.3)});
      [0, 1, 2].forEach((i) => pop("#lb-h" + i, ${t(TM.cmp)} + i * 0.25));
      out("#lb-h1", ${t(TM.know - 0.5)}, 0.15); pop("#lb-hit", ${t(TM.know - 0.4)}); flash("#lb-hit", ${t(TM.know)}, 2);
      fadeIn("#lbox", ${t(TM.know + 0.3)}); pop("#lb-leak", ${t(TM.know + 0.4)});
      // ===== L17 加随机盐 + transient；代码卡 C
      out("#lbox, #lb-leak, #lb-hit, #lb-h0, #lb-h2, #lb-led", ${t(LS[17] - 0.2)});
      X24.shake(tl, "salt", ${t(TM.salt - 0.3)}, [-60, -20]); pop("#lb-salted", ${t(TM.salt + 0.6)});
      [0, 1, 2].forEach((i) => pop("#lb-hs" + i, ${t(TM.salt + 0.9)} + i * 0.2));
      pop("#ckc", ${t(TM.trn - 0.8)}, 0.3); draw("cvc1", ${t(TM.trn - 0.5)}); draw("cvc0", ${t(TM.trn - 0.2)});
      pop("#lb-trn", ${t(TM.trn)}); pop("#lb-plain", ${t(TM.plain)});
      tl.to("#trng", { x: -240, y: -150, opacity: 0, duration: 1.1, ease: "power1.in" }, ${t(TM.plain + 0.6)}); out("#lb-trn", ${t(TM.plain + 0.6)});
      // ===== L18 链码必须确定：镜头到 detC
      out("#ckc, #cvc0, #cvc1, #lb-plain, #lb-salted, #lb-hs0, #lb-hs1, #lb-hs2, #lb-row, #lb-pds, #lb-outn", ${t(LS[18] - 0.2)});
      cam(${t(LS[18])}, "detC", 1.3);
      // ===== L19 本地时间 / 随机数 → 结果不同过不了背书；代码卡 B 第 2 行变绿后一致
      pop("#ckb", ${t(LS[19] - 0.1)}, 0.3);
      pop("#lb-clk", ${t(TM.time)}); KIT.clock(tl, "clk", ${t(TM.time)}, 0.8, 40); hot("#ckb-r0", ${t(TM.time)}, "#fde6e3"); pop("#ckb-c0", ${t(TM.time + 0.2)}); draw("cvb0", ${t(TM.time + 0.2)});
      pop("#lb-die", ${t(TM.rnd)}); KIT.roll(tl, "die-d", ${t(TM.rnd)}, 5);
      pop("#lb-d0", ${t(TM.diff - 0.2)}); pop("#lb-d1", ${t(TM.diff)}); pop("#lb-dx", ${t(TM.fail - 0.3)});
      out("#lb-dx, #lb-d0, #lb-d1, #cvb0, #lb-clk, #lb-die", ${t(TM.fail + 0.35)});
      hot("#ckb-r1", ${t(TM.fail + 0.45)}, "#dff3e6"); pop("#ckb-c1", ${t(TM.fail + 0.5)}); draw("cvb1", ${t(TM.fail + 0.55)});
      pop("#lb-d0g", ${t(TM.fail + 0.9)}); pop("#lb-d1g", ${t(TM.fail + 1.0)});
`,
});
