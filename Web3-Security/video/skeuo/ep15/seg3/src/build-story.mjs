// ep15/seg3「③ 签名盖住什么」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.hashC（BRIEF）。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   A            ---- A 托管机房
//   hotA         
//   clockA       
//   bankB        ---- B 银行柜台
//   flowC        ---- C 4337 流水线
//   hashC        
//   payC         
//   ownerC       
//   bicoC        
//   envC         
//   D            ---- D 7702
//   plateD       
//   chainsD      
//   batchD       
//   devD         
//   E            ---- E 钥匙与守护人
//   passE        
//   sessionE     
//   F            ---- F 意图集市
//   intentF      
//   permitF      
//   EF           ---- across zones
//   wide         
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E10 from "../../../ep10/kit-ext/objects-ext.mjs";
import { G } from "../../../kit/iso.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.flowC

// 段内专用位置（C 区 anchor 4100 的相对 px）
const cz = (X0, Y0) => { const q = G(4100 + X0, Y0); return { u: Math.round(q.u), v: Math.round(q.v) }; };
const DCHQ = cz(1720, -380);            // 链 A 右侧："删除第 2 位 owner" 支票
const DCHQ_B = cz(1720, -60);           // 复印件滑到链 B 右侧
const ATKL = cz(440, -40);              // 红信封（账户左侧）
const ownerX = L.fit([L.rect(L.ACCOUNT, "accountSafe"), L.rect(L.CHAIN_A, "chain3"), L.rect(L.CHAIN_B, "chain3"),
  L.rect(DCHQ, "cheque"), L.rect(DCHQ_B, "cheque"), L.rect(ATKL, "letter")], [300, 300, 1620, 860]);

const S = segInit(import.meta.url, { cams: { ...L.CAMS, ownerX }, ext: [E1, E3, E5, E9, E10, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件
const FL = ["链 ID", "nonce", "有效期", "…", "…"];
put("sgc", L.SIGN_C, E1.signBoard(L.SIGN_C, { id: "sgc", style: "plate", text: "ERC-4337" }));
L.LETTERS.forEach((o, i) => put("l" + i, o, E1.letter(o, { id: "l" + i })));
put("srt", L.SORTER, E1.sorter(L.SORTER, { id: "srt", letters: 3, blockLabel: "一笔交易" }));
put("gate", L.GATE, O.checkpoint(L.GATE, { id: "gate", n: "EntryPoint" }));
put("acct", L.ACCOUNT, E5.accountSafe(L.ACCOUNT, { id: "acct" }));
put("pump", L.PUMP, X.gasPump(L.PUMP, { id: "pump", title: "Paymaster" }));
put("fn", L.FUNNEL, E3.hashFunnel(L.FUNNEL, { id: "fn", inputs: ["字段", "字段"], output: "用户操作哈希" }));
put("uchq", L.UCHEQUE, E9.cheque(L.UCHEQUE, { id: "uchq", title: "用户签名", labels: FL, vals: ["1", "#7", "1h", "—", "—"] }));
put("pchq", L.PCHEQUE, E9.cheque(L.PCHEQUE, { id: "pchq", title: "Paymaster 签名", labels: FL, vals: ["1", "#7", "1h", "—", "—"] }));
put("chA", L.CHAIN_A, O.chain(L.CHAIN_A, { id: "chA", n: 3, title: "链 A" }));
put("chB", L.CHAIN_B, O.chain(L.CHAIN_B, { id: "chB", n: 3, title: "链 B" }));
put("impl", L.IMPL, E10.coreModule(L.IMPL, { id: "impl", ver: "实现", cart: false }));
put("skey", L.SKEY, E5.keycard(L.SKEY, { id: "skey", scale: 0.8, text: "会话" }));
put("dchq", DCHQ, E9.cheque(DCHQ, { id: "dchq", title: "删除 owner", amount: "#2", labels: ["链 A", "owner", "位置", "…", "…"] }), 0,
  { wrap: (svg) => S.hid("dchq-h", svg) });
put("atkL", ATKL, E1.letter(ATKL, { id: "atkL", state: "attacker" }), 0, { wrap: (svg) => S.hid("atkL-h", svg) });

// 账户外一圈红虚线（L14）、链 A / 链 B 之间的绿色挡板（L23）
{
  const r = L.rect(L.ACCOUNT, "accountSafe"), cx = (r[0] + r[2]) / 2, cy = (r[1] + r[3]) / 2;
  add(L.ACCOUNT, S.hid("ring", `<ellipse cx="${cx}" cy="${cy}" rx="${(r[2] - r[0]) / 2 + 40}" ry="${(r[3] - r[1]) / 2 + 40}" fill="none" stroke="#e0453a" stroke-width="5" stroke-dasharray="16 10"/>`), 400);
  const M = [4100 + 1350, -240], du = [0.819 * 270, -0.287 * 270], hz = 46;
  const p1 = [M[0] - du[0], M[1] - du[1]], p2 = [M[0] + du[0], M[1] + du[1]];
  add(cz(1350, -240), S.hid("bar", `<polygon points="${p1} ${p2} ${p2[0]},${p2[1] - hz} ${p1[0]},${p1[1] - hz}" fill="#1f9d55" fill-opacity="0.45" stroke="#1f9d55" stroke-width="4"/>`), 0);
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const R = (p, dx, dy) => [p[0] + dx, p[1] + dy];
lb("lb-b1", up(A.uchq.top, 14), "边界 1 · 用户签名", "lab-cs");
lb("lb-op", up(A.fn.top, 40), "用户操作", "lab-ink lab-sm");
lb("lb-prot", up(A.uchq.fields[1], 40), "受保护", "lab-g lab-sm");
lb("lb-nohash", R(A.uchq.fields[4], 30, 50), "没进哈希", "lab-ink lab-sm", "t");
lb("lb-off", R(A.fn.hopper, 50, -60), "偏移量没检查", "lab-ink lab-sm", "l");
lb("lb-same", up(A.fn.top, 40), "同一操作", "lab-ink lab-sm");
lb("lb-h1", R(A.fn.out, 60, 10), "哈希 0x3a…", "lab-cs", "l");
lb("lb-h2", R(A.fn.out, 60, 90), "哈希 0x9e…", "lab-g", "l");
lb("lb-diff", up(A.fn.top, 40), "操作 A + 操作 B", "lab-ink lab-sm");
lb("lb-h3", R(A.fn.out, 62, 12), "哈希 0x3a…", "lab-rs", "l");
lb("lb-h4", R(A.fn.out, 62, 92), "哈希 0x3a…", "lab-rs", "l");
lb("lb-pq", up(A.pchq.top, 14), `Paymaster 签名`, "lab-ink");
lb("lb-edit", R(A.pchq.fields[3], 0, 40), "签完被改", "lab-r lab-sm", "t");
lb("lb-b2", up(A.pump.top, 14), "边界 2 · Paymaster", "lab-cs");
lb("lb-cov", R(A.pchq.fields[1], 0, 44), "链 ID · nonce · 有效期", "lab-g lab-sm", "t");
lb("lb-replay", R(A.pump.center, -90, 0), "重放 / 抢跑", "lab-r", "r");
lb("lb-b3", up(A.acct.top, 14), "边界 3 · 账户验证", "lab-cs");
lb("lb-sig", R(A.acct.front, 0, -40), "签名 ✓", "lab-gs");
lb("lb-atk", R(at(ATKL), 0, 16), "攻击者的调用", "lab-r lab-sm", "t");
lb("lb-del", R(A.dchq.ground, 0, 24), "删除第 2 位 owner", "lab-ink lab-sm", "t");
lb("lb-del2", R(A.dchq.ground, 0, 24), "删除 owner 地址 · 再核对 ✓", "lab-g lab-sm", "t");
const OWN = { chA: ["丙", "甲", "丁"], chB: ["丙", "乙", "丁"] };
for (const k of ["chA", "chB"]) OWN[k].forEach((n, i) =>
  lb(`lb-${k}-o${i}`, up(A[k].blocks[i], 12), `${i + 1} ${n}`, i === 1 ? "lab-cs lab-sm" : "lab-ink lab-sm"));
lb("lb-x", up(A.chB.blocks[1], 14), "2 乙 ✗", "lab-rs lab-sm");
lb("lb-lock", R(A.acct.front, 0, 20), "✗ 锁死", "lab-rs");
lb("lb-impl", up(A.impl.top, 10), "实现合约 · 可被销毁", "lab-r");
lb("lb-sk", up(A.skey.top, 12), "会话密钥", "lab-ink lab-sm");
lb("lb-one", R(A.skey.center, 50, -20), "单笔 ✓", "lab-g lab-sm", "l");
lb("lb-sum", R(A.skey.center, 50, 26), "累计 ✗", "lab-r lab-sm", "l");
lb("lb-bar", R([4100 + 1350, -240], 0, -60), "防重放", "lab-gs");

// ---------------------------------------------------------------- 屏幕层卡片
const C = { x: 60, y: 620, w: 800 };
const card = codeCard("ca", { ...C, mono: true, head: "签名覆盖什么", tag: "示意", rows: [
  { html: `hash(encode(op), <span id="ca-k">entryPoint, chainId</span>)` },
  { html: `// encode 不唯一 → 同一操作，不同哈希` },
  { html: `sig = sign(hash) // 没进哈希的不受保护` },
] });
S.curve("cv", [C.x + C.w + 4, codeRowY(C.y, 1)], S.scr("hashC", A.fn.hopper), { color: "#e0453a" });
const html = card
  + evt("ev1", `EntryPoint 打包漏洞 · 2023 年 3 月<span id="ev1-fix" style="opacity:0;color:#1f9d55;font-weight:700"> · 已修复 · 无已知损失</span>`)
  + evt("src1", `来源 · Alchemy 披露`, { top: 200 })
  + evt("ev2", `Coinbase Smart Wallet 审计 · 2024 年 3 月`, { top: 122 })
  + evt("src2", `来源 · Code4rena 报告`, { top: 202 })
  + evt("ev3", `Biconomy 审计 · 2023 年`, { top: 124 })
  + evt("src3", `来源 · Code4rena 报告 · Zellic 报告`, { top: 204 })
  + kw("kw-ex", `示例 Paymaster ${gtag("示例")}`, { x: 100, y: 760, size: 34 });
const css = "";

// ---------------------------------------------------------------- 词语时刻
const TM = {};
const t = (x) => f(x);
const L0 = at(L.LETTERS[0]), L1p = at(L.LETTERS[1]), HOP = R(A.fn.hopper, 0, -6);

const BOX = [2300, -1250, 4100, 2150];
const cs = [[BOX[0], BOX[1]], [BOX[0] + BOX[2], BOX[1]], [BOX[0], BOX[1] + BOX[3]], [BOX[0] + BOX[2], BOX[1] + BOX[3]]].map(([x, y]) => G(x, y));
const GRID = { u0: Math.floor(Math.min(...cs.map((q) => q.u))), u1: Math.ceil(Math.max(...cs.map((q) => q.u))),
  v0: Math.floor(Math.min(...cs.map((q) => q.v))), v1: Math.ceil(Math.max(...cs.map((q) => q.v))) };

S.build({
  cam0: "hashC", sub: "没被签名盖住的字段，别人就能改",
  grid: GRID, box: BOX,
  shown: [], css, html,
  terms: [
    { id: "t0", t: "哈希", d: "把任意数据压成固定长度的指纹", at: w("哈希", 1) },
    { id: "t1", t: "nonce", d: "账户递增的序号，防签名被重复使用", at: w("nonce", 10) },
    { id: "t2", t: "重放", d: "把已签的消息拿到别处再用一次", at: w("重放", 11) },
    { id: "t3", t: "owner", d: "有权管理这个账户的签名人", at: w("owner", 16) },
    { id: "t4", t: "会话密钥", d: "范围受限的临时签名密钥", at: w("会话密钥", 21) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS
      // ===== L0 边界 1：用户签名
      pop("#lb-b1", ${t(LS[0] + 0.3)}); bump("#lb-b1", ${t(LS[0] + 1.2)}, 1.08, 1);
      // ===== L1 信封进漏斗，吐出哈希；代码卡 A
      pop("#lb-op", ${t(LS[1])}); X1.walk(tl, "l0", ${t(LS[1] + 0.2)}, 0.8, [[${HOP}]]); out("#l0", ${t(LS[1] + 0.9)}, 0.2);
      X3.hash(tl, "fn", ${t(LS[1] + 0.9)}); out("#lb-op", ${t(LS[2] - 0.2)});
      pop("#ca", ${t(LS[1] + 0.6)});
      // ===== L2 五个字段槽：三绿两灰
      X9.fields(tl, "uchq", ${t(LS[2] + 0.4)}, ["filled", "filled", "filled", null, null]);
      pop("#lb-prot", ${t(LS[2] + 1.4)}); pop("#lb-nohash", ${t(LS[2] + 2.2)});
      // ===== L3 事件卡 + 来源卡
      pop("#ev1", ${t(LS[3] + 0.2)}); pop("#src1", ${t(LS[3] + 0.8)});
      // ===== L4 第 2 行变红，连到入料口
      out("#lb-prot, #lb-nohash", ${t(LS[4] - 0.2)});
      hot("#ca-r1", ${t(LS[4] + 0.4)}, "#fde6e3"); draw("cv", ${t(LS[4] + 0.6)}); pop("#lb-off", ${t(LS[4] + 1.6)});
      // ===== L5 同一操作 → 两张不同哈希
      out("#cv, #lb-off", ${t(LS[5] - 0.2)});
      X1.walk(tl, "l0", ${t(LS[5] - 0.1)}, 0.05, [[${L0}]]); fadeIn("#l0", ${t(LS[5])}, 0.2);
      X3.hashReset(tl, "fn", ${t(LS[5])}); pop("#lb-same", ${t(LS[5] + 0.2)});
      X1.walk(tl, "l0", ${t(LS[5] + 0.3)}, 0.7, [[${HOP}]]); out("#l0", ${t(LS[5] + 1.0)}, 0.2);
      X3.hash(tl, "fn", ${t(LS[5] + 1.0)}); pop("#lb-h1", ${t(LS[5] + 2.4)}); pop("#lb-h2", ${t(LS[5] + 2.9)});
      // ===== L6 不同操作 → 同一哈希（红框）
      out("#lb-same, #lb-h1, #lb-h2", ${t(LS[6] - 0.2)});
      X1.walk(tl, "l0", ${t(LS[6] - 0.1)}, 0.05, [[${L0}]]); fadeIn("#l0", ${t(LS[6])}, 0.2);
      X3.hashReset(tl, "fn", ${t(LS[6])}); pop("#lb-diff", ${t(LS[6] + 0.2)});
      X1.walk(tl, "l0", ${t(LS[6] + 0.3)}, 0.7, [[${HOP}]]); X1.walk(tl, "l1", ${t(LS[6] + 0.3)}, 0.8, [[${HOP}]]);
      out("#l0, #l1", ${t(LS[6] + 1.05)}, 0.2);
      X3.hash(tl, "fn", ${t(LS[6] + 1.05)}); pop("#lb-h3", ${t(LS[6] + 2.4)}); pop("#lb-h4", ${t(LS[6] + 2.6)});
      // ===== L7 镜头到 payC；Paymaster 签名被改
      out("#lb-diff, #lb-h3, #lb-h4, #lb-b1, #ca", ${t(LS[7] - 0.2)});
      cam(${t(LS[7])}, "payC", 1.2); pop("#lb-pq", ${t(LS[7] + 1.0)}); pop("#kw-ex", ${t(LS[7] + 0.9)});
      X9.field(tl, "pchq", ${t(LS[7] + 2.4)}, 3, "bad"); pop("#lb-edit", ${t(LS[7] + 2.6)});
      // ===== L8 已修复 · 无已知损失
      out("#kw-ex", ${t(LS[8] - 0.1)});
      tl.to("#ev1-fix", { opacity: 1, duration: 0.4 }, ${t(LS[8] + 0.3)});
      // ===== L9 边界 2：Paymaster 签名
      out("#ev1, #src1, #lb-edit", ${t(LS[9] - 0.2)}); X9.field(tl, "pchq", ${t(LS[9])}, 3, "blank");
      pop("#lb-b2", ${t(LS[9] + 0.3)}); X15.pumpLamp(tl, "pump", ${t(LS[9] + 0.6)}, "green");
      // ===== L10 链 ID · nonce · 有效期 依次变绿
      X9.fields(tl, "pchq", ${t(LS[10] + 0.6)}, ["filled", "filled", "filled", null, null], 0.5); pop("#lb-cov", ${t(LS[10] + 2.2)});
      // ===== L11 有效期缺 → 复印件重放到加油机
      out("#lb-cov", ${t(LS[11] - 0.1)}); X9.field(tl, "pchq", ${t(LS[11] + 0.1)}, 2, "warn");
      X9.copies(tl, "pchq", ${t(LS[11] + 0.5)}, 1, 0.5, true); X9.copyTo(tl, "pchq", ${t(LS[11] + 1.1)}, 0, [${A.pump.scr}], 0.7);
      X15.pumpState(tl, "pump", ${t(LS[11] + 1.8)}, "attacker"); pop("#lb-replay", ${t(LS[11] + 2.0)});
      // ===== L12 镜头到账户 + 链 A / 链 B；边界 3
      out("#lb-replay, #lb-pq, #lb-b2", ${t(LS[12] - 0.2)}); X9.copies(tl, "pchq", ${t(LS[12])}, 0, 0.3);
      cam(${t(LS[12])}, "ownerX", 1.3); pop("#lb-b3", ${t(LS[12] + 1.3)});
      // ===== L13 签名 ✓
      pop("#lb-sig", ${t(LS[13] + 0.2)});
      // ===== L14 红圈 + 红信封进账户
      fadeIn("#ring", ${t(LS[14] + 0.2)}, 0.4); fadeIn("#atkL-h", ${t(LS[14] + 0.4)}); pop("#lb-atk", ${t(LS[14] + 0.6)});
      X1.walk(tl, "atkL", ${t(LS[14] + 1.2)}, 0.9, [[${A.acct.front}]]); out("#atkL-h", ${t(LS[14] + 2.0)}, 0.3);
      // ===== L15 Coinbase 审计
      out("#ring, #lb-atk, #lb-sig", ${t(LS[15] - 0.2)});
      pop("#ev2", ${t(LS[15] + 0.2)}); pop("#src2", ${t(LS[15] + 0.8)});
      // ===== L16 删除 owner 支票，复印件滑到链 B
      fadeIn("#dchq-h", ${t(LS[16])}, 0.3); pop("#lb-del", ${t(LS[16] + 0.3)});
      X9.copies(tl, "dchq", ${t(LS[16] + 1.0)}, 1, 0.4, true); X9.copyTo(tl, "dchq", ${t(LS[16] + 1.5)}, 0, [${R(at(DCHQ_B), 0, -60)}], 0.8);
      // ===== L17 两条链的 owner 列
      out("#ev2, #src2", ${t(LS[17] - 0.2)});
      [0, 1, 2].forEach((i) => { pop("#lb-chA-o" + i, ${t(LS[17] + 0.3)} + i * 0.15, 0.25); pop("#lb-chB-o" + i, ${t(LS[17] + 0.9)} + i * 0.15, 0.25); });
      bump("#lb-chA-o1, #lb-chB-o1", ${t(LS[17] + 2.0)}, 1.15, 1);
      // ===== L18 删错人 → 锁死
      out("#lb-chB-o1", ${t(LS[18] + 0.3)}); pop("#lb-x", ${t(LS[18] + 0.4)});
      out("#lb-chB-o0, #lb-chB-o2", ${t(LS[18] + 2.0)}, 0.4); pop("#lb-lock", ${t(LS[18] + 2.6)});
      // ===== L19 修复：传 owner 地址再核对
      out("#lb-lock, #lb-x, #lb-del", ${t(LS[19])}); X9.copies(tl, "dchq", ${t(LS[19])}, 0, 0.3);
      pop("#lb-chB-o0, #lb-chB-o1, #lb-chB-o2", ${t(LS[19] + 0.4)}); pop("#lb-del2", ${t(LS[19] + 0.8)});
      // ===== L20 Biconomy：实现合约可被销毁
      out("#lb-del2, #lb-b3, #lb-chA-o0, #lb-chA-o1, #lb-chA-o2, #lb-chB-o0, #lb-chB-o1, #lb-chB-o2", ${t(LS[20] - 0.2)});
      cam(${t(LS[20])}, "bicoC", 1.3); pop("#ev3", ${t(LS[20] + 0.4)}); pop("#src3", ${t(LS[20] + 1.0)});
      X10.leverBad(tl, "impl", ${t(LS[20] + 2.2)}, true); X10.plate(tl, "impl", ${t(LS[20] + 2.2)}, "销毁", "red"); pop("#lb-impl", ${t(LS[20] + 2.4)});
      // ===== L21 会话密钥：单笔 ✓ 累计 ✗
      bump("#ev3", ${t(LS[20] + 3.0)}, 1.05, 1); pop("#lb-sk", ${t(LS[21] + 0.3)}); pop("#lb-one", ${t(LS[21] + 1.4)}); pop("#lb-sum", ${t(LS[21] + 2.4)});
      // ===== L22 拉回全景；代码卡 A 第 1 行变绿
      out("#ev3, #src3, #lb-impl, #lb-sk, #lb-one, #lb-sum", ${t(LS[22] - 0.2)});
      cam(${t(LS[22])}, "flowC", 1.4); tl.set("#ca-r1", { backgroundColor: "transparent" }, ${t(LS[22])});
      pop("#ca", ${t(LS[22] + 1.2)}); tl.to("#ca-k", { color: "#1f9d55", fontWeight: 700, duration: 0.3 }, ${t(LS[22] + 2.0)});
      // ===== L23 链 A / 链 B 之间绿色挡板"防重放"
      fadeIn("#bar", ${t(LS[23] + 0.3)}, 0.4); pop("#lb-bar", ${t(LS[23] + 0.6)});
`,
});
