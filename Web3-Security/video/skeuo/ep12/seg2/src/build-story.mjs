// ep12/seg2「② 一条消息过河」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.valid（默认（请确认））。
// 可用镜头（shared/layout.mjs 的 CAMS）：
//   valid        近景：9 人验证者平台 + 两块分组牌 + 门限表（seg1 起点；seg6 L2、L5–L7 回到这里给答案）
//   bridge       B 桥全景：桥 + 平台 + 岗亭 + 门限表 + 中继者，两岸同框（seg1 终点 "凭什么相信？"；seg2 L0–L3、L8–L9；seg4 L1–L4；seg5 L1–L2）
//   booth        近景：岗亭 + 证明卡 + 门限表（seg2 L12–L15；seg4 L1–L4 证明卡 missing）
//   bankA        A 金库全景：售货机 + 保险柜 + 用户 + 存款事件 + 消息 + 点阵 + A 链（seg2 L4–L7；seg5 L3–L4；seg6 L1）
//   mintB        近景：铸币机 + B 链 + 点阵（seg2 L10–L11、seg2 终点 "信谁？"；seg3 起点）
//   recon        近景：两侧对账天平 + 自动暂停闸刀 + 监控灯 + 延迟队列（seg2 L19；seg5 L8–L9；seg6 L8）
//   hallD        D 四摊全景 + 尽头升级角（seg3 L0、seg4 L0；seg5 L10 远景带过）
//   dMulti       
//   dLight       
//   dOpt         
//   dZk          
//   upgrade      近景：展台尽头 新实现 + 红色升级钥匙 + 时间锁（seg3 终点；seg5 L10）
//   filesE       E 档案墙全景（seg4 L0、L5；seg5 起点 L0、L5–L7）
//   eTree        
//   eSig         
//   eKey         
//   eZero        
//   eRpc         
//   cexF         F 柜台全景（seg5 L11–L12、L17 终点；seg6 起点 L0、L3–L4）
//   cexTag       近景：假币 + 回执 + TRON 区块 + 确认数（seg5 L13–L17）
//   wide         宽景：两岸 = 两座城，A · B · C 前排同框（seg2 L16–L22 两岸 / C→A 反向）
//   world        全景：所有区（seg6 结束卡前拉远）
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.mintB

// 段内镜头：岗亭 + 证明卡 + 门限表 + 信任边界竖幕（右侧留给代码卡）
const boothT = L.fit([L.rect(L.BOOTH_PROOF, "proofCard"), L.rect(L.BOOTH, "booth"), L.rect(L.METER, "thresholdMeter"), L.rect(L.CURTAIN, "curtain")], [160, 400, 1080, 870], 1.4);
const S = segInit(import.meta.url, { cams: { ...L.CAMS, boothT }, ext: [E1, E2, E5, E9, E11, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
const P = (u, v, z = 0) => Wp(u, v, z);
const poly = (pp) => pp.map((q) => q.map((x) => Math.round(x)).join(",")).join(" ");
const quad = (u0, u1, v0, v1) => poly([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]);
const V = L.VALID, V0 = V[0];
const BACK = { u: V0.u + 900, v: V0.v - 900 };            // 地面层
// B：木平台 + Sky Mavis 虚线框 + 9 验证者 + 头顶钥匙 + 分组牌（与 seg1 同几何，正常态）
add(BACK, `<polygon points="${quad(V0.u - 150, V0.u + 630, V0.v - 130, V0.v + 540)}" fill="#dcc7a2" stroke="#a88b5e" stroke-width="2"/>`);
add(BACK, `<polygon points="${quad(V0.u - 115, V0.u + 355, V0.v - 105, V0.v + 305)}" fill="rgba(42,163,201,.10)" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="14 9"/>`, 1);
const keyWrap = (q) => (svg) => { const [gx, gy] = at(q); return `<g transform="translate(0,${-q.lift}) translate(${gx},${gy}) scale(${q.scale}) translate(${-gx},${-gy})">${svg}</g>`; };
V.forEach((q, i) => {
  put("v" + i, q, O.person(q, { id: "v" + i, role: "signer", scale: q.scale }));
  const k = L.VKEYS[i];
  put("kn" + i, k, O.key(k, { id: "knk" + i, stand: true }), 1, { wrap: keyWrap(k) });
});
put("smp", L.SMPLATE, E1.signBoard(L.SMPLATE, { id: "smp", style: "plate", text: "Sky Mavis", size: 24 }));
put("axp", L.AXPLATE, E1.signBoard(L.AXPLATE, { id: "axp", style: "plate", text: "Axie DAO 授权", size: 24 }));
put("br", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "br", river: 170 }));
put("mtr", L.METER, E5.thresholdMeter(L.METER, { id: "mtr", max: 9, th: 5, thText: "5/9" }));
put("pc", L.BOOTH_PROOF, E2.proofCard(L.BOOTH_PROOF, { id: "pc", text: "证明" }), 2, { grow: true });
// 中继者：外包一层 relmv，用 GSAP x/y 带着过桥
put("rel", L.RELAYER, O.person(L.RELAYER, { id: "rel", role: "engineer", scale: L.RELAYER.scale }), 0, { wrap: (svg) => `<g id="relmv">${svg}</g>` });
// 信任边界：河面上沿 v 的青蓝虚线竖幕
const CU = L.CURTAIN, cuv = 170, cuz = 240;
add({ u: CU.u, v: CU.v + 60 }, S.hid("curt", `<polygon points="${poly([P(CU.u, CU.v - cuv), P(CU.u, CU.v + cuv), P(CU.u, CU.v + cuv, cuz), P(CU.u, CU.v - cuv, cuz)])}" fill="rgba(42,163,201,.16)" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="16 10"/>`));

// A：售货机 + 金库 + 用户 + A 链（6 块，后两块 L7 长出）+ 存款事件 + 消息 + 点阵
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm", scale: L.VEND.scale, sign: "桥合约 · A 链" }));
put("sf", L.SAFE, O.safe(L.SAFE, { id: "sf", gold: true }));
put("usr", L.USER, O.person(L.USER, { id: "usr", role: "signer", scale: L.USER.scale }));
put("cha", L.CHAINA, O.chain(L.CHAINA, { id: "cha", n: 6, title: "A 链" }));
put("msg", L.MSG, E9.cheque(L.MSG, { id: "msg", scale: L.MSG.scale, title: "消息", labels: ["用户", "金额", "序号", "源链", "目标链"], vals: ["用户", "100", "#7", "A", "B"] }), 0, { grow: true });
put("lt", L.LETTER, E1.letter(L.LETTER, { id: "lt" }), 0, { grow: true });
const DA = at(L.DOTSA), DC = at(L.DOTSC);
const dots = ([x0, y0], fill) => { const s = []; for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) s.push(`<circle cx="${x0 + 7 + c * 14}" cy="${y0 + 7 + r * 14}" r="4.6" fill="${fill}"/>`); return s.join(""); };
add(L.DOTSA, S.hid("dotsA", dots(DA, "#2aa3c9")), 200);
// 提货单（比喻）：外层 docmv 平移过桥，内层 docsc 放大
const DOCO = S.rel(L.SAFE, 60, 160);
put("doc", DOCO, O.doc(DOCO, { id: "doc", title: "提货单", standing: true, stamp: false, stampText: "签章" }), 300, { wrap: (svg) => `<g id="docmv" opacity="0"><g id="docsc">${svg}</g></g>` });

// C：铸币机 + B 链 + 点阵
put("mp", L.MINTB, E11.mintPress(L.MINTB, { id: "mp", scale: L.MINTB.scale, plate: "映射代币", count: "0", pile: 0 }));
put("chb", L.CHAINB, O.chain(L.CHAINB, { id: "chb", n: 4, title: "B 链" }));
add(L.DOTSC, S.hid("dotsC", dots([DC[0] + 40, DC[1]], "#2aa3c9")), 200);

// 比喻不成立处：两侧金库金光；首选目标：桥上红靶心
const glow = (p, rx) => `<ellipse cx="${p[0]}" cy="${p[1]}" rx="${rx}" ry="${rx * 0.5}" fill="rgba(232,180,40,.35)" stroke="#d9a520" stroke-width="3"/>`;
add(BACK, S.hid("gold", glow(at(L.SAFE), 230) + glow(at(L.MINTB), 190)), 3);
const CR = A.br.crown;
add({ u: L.BRIDGE.u + 400, v: L.BRIDGE.v + 400 }, S.hid("tgt", [70, 48, 26].map((r, i) => `<circle cx="${CR[0]}" cy="${CR[1] - 40}" r="${r}" fill="${i % 2 ? "#fff" : "rgba(224,69,58,.18)"}" stroke="#e0453a" stroke-width="6"/>`).join("") + `<circle cx="${CR[0]}" cy="${CR[1] - 40}" r="8" fill="#e0453a"/>`));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
const NR = A.br.nearRoad, FB = A.br.farBank;
lb("lb-exact", up(A.br.top, 30), "准确表述", "lab-cs");
lb("lb-ach", up(NR, 70), "A 链", "lab-ink");
lb("lb-bch", up(FB, 70), "B 链", "lab-ink");
lb("lb-trust", up(CR, 150), "相信？", "lab-cs");
lb("lb-proof", up(A.pc.top, 6), "证明", "lab-cs lab-sm");
lb("lb-usdt", [DA[0] + 70, DA[1] - 6], "100 USDT", "lab-cs lab-sm");
lb("lb-ex", [DA[0] + 70, DA[1] + 150], "示例", "lab-gs lab-sm", "t");
lb("lb-lock", up(A.sf.top, 8), "锁定", "lab-ink");
lb("lb-evt", up(A.lt.top, 8), "存款事件", "lab-cs lab-sm");
lb("lb-f0", [A.msg.ground[0], A.msg.ground[1] + 14], "用户 · 金额 · 序号", "lab-cs lab-sm", "t");
lb("lb-wait", up(A.cha.last, 30), "等确定", "lab-cs");
const PF = up(FB, 120);
[["sig", "签名"], ["mk", "Merkle 证明"], ["zk", "ZK 证明"]].forEach(([k, s], i) => lb("lb-" + k, [PF[0] + 70, PF[1] - 70 * (2 - i)], s, "lab-cs lab-sm", "l"));
lb("lb-nonce", [A.mp.ground[0] - 140, A.mp.ground[1] - 140], "序号 #7 · 未用过 ✓", "lab-g lab-sm", "r");
lb("lb-musdt", [DC[0] + 110, DC[1] - 8], "映射 USDT", "lab-cs");
lb("lb-tb", up(P(CU.u, CU.v + 40, cuz), 8), "信任边界", "lab-cs");
lb("lb-3", up(A.pc.top, 46), "三查", "lab-ink");
lb("lb-acity", up(A.vm.top, 40), "A 城", "lab-ink");
lb("lb-bcity", up(A.mp.top, 90), "B 城", "lab-ink");
lb("lb-meta", up(A.br.top, 36), "比喻", "lab-gs");
lb("lb-coupon", [A.mp.ground[0] - 150, A.mp.ground[1] - 80], "金券", "lab-g lab-sm", "r");
lb("lb-forge", [A.mp.ground[0], A.mp.ground[1] + 40], "不存在的金子", "lab-r lab-sm", "t");
lb("lb-big", up(CR, 200), "最大的一笔钱", "lab-ink");
lb("lb-nh", up(CR, 370), "比喻不成立处", "lab-gs lab-sm");
lb("lb-tgt", [CR[0], CR[1] + 50], "首选目标", "lab-r", "t");
lb("lb-rev", up(CR, 160), "反向：金额往往更大", "lab-cs");
lb("lb-who", up(A.mp.top, 20), "信谁？", "lab-cs");

// ---------------------------------------------------------------- 屏幕层卡片
const CC = { x: 1040, y: 110, w: 820 };
const card = codeCard("ca", {
  ...CC, head: "消息与验证", tag: "示意", mono: true, rows: [
    { html: "msg = (srcChain, srcBridge, dstChain," },
    { html: "&nbsp;&nbsp;dstBridge, nonce, user, amount)" },
    { html: "require(verifyProof(hash(msg), proof));", chip: "有效", chipCls: "ok" },
    { html: "require(!processed[hash(msg)]);", chip: "没处理过", chipCls: "ok" },
    { html: "require(msg.srcBridge == trustedSource);", chip: "来源正确", chipCls: "ok" },
    { html: "processed[hash(msg)] = true;" },
  ],
});
S.curve("arr", S.scr("bridge", up(FB, 40)), S.scr("bridge", up(NR, 40)), { color: "#2aa3c9" });
S.curve("cv0", [CC.x - 4, codeRowY(CC.y, 0)], S.scr("bankA", A.msg.top), { color: "#e0453a" });
S.curve("cv1", [CC.x - 4, codeRowY(CC.y, 3)], S.scr("mintB", A.mp.front), { color: "#e0453a" });
S.curve("cv2", [CC.x - 4, codeRowY(CC.y, 2)], S.scr("boothT", A.pc.top), { color: "#e0453a" });
const html = card +
  kw("kw-def", `跨链桥 = 在两条链之间转移<b>资产或消息</b>`, { x: 300, y: 150, size: 40 }) +
  kw("kw-lm", `<b>锁定</b> → <b>铸造</b>`, { x: 700, y: 160, size: 48 });
const css = `#ca .c-row { font-size: 24px; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  def: w("跨链桥", 1), ach: w("A 链", 2), bch: w("B 链", 2), trust: w("相信", 2),
  see: w("看不到", 3), proof: w("证明", 3), lm: w("锁定", 4),
  ex: w("例子", 5), dep: w("存进", 5), lock: w("锁起来", 5),
  evt: w("存款事件", 6), f0: w("用户", 6), f1: w("金额", 6), f2: w("序号", 6),
  rly: w("中继者", 7), conf: w("确定", 7),
  sig: w("签名", 9), mk: w("Merkle", 9), zk: w("零知识", 9),
  ver: w("验证", 10), nonce: w("序号", 10), mint: w("铸造", 11),
  tb: w("信任边界", 13), three: w("三件事", 14),
  c1: w("有效", 15), c2: w("处理过", 15), c3: w("源链", 15),
  meta: w("比方", 16), gold: w("金条", 17), bill: w("提货单", 17), coupon: w("金券", 17),
  stamp: w("签章", 18), stolen: w("被偷", 19), forge: w("不存在", 19),
  nh: w("不成立", 20), big: w("最大", 20), tgt: w("首选目标", 21),
  rev: w("反过来", 22), unlock: w("解锁", 22), more: w("金额", 22), who: w("相信谁", 23),
};
const t = (x) => f(x);
// 世界画布位移（GSAP x/y）
const R0 = at(L.RELAYER), LT0 = at(L.LETTER), HAND = [18, -62];
const deck = A.br.deck;
const relPath = [NR, ...deck, FB].map((p) => ({ x: Math.round(p[0] - R0[0]), y: Math.round(p[1] - R0[1]) }));
const ltPath = [NR, ...deck, FB].map((p) => [p[0] + HAND[0], p[1] + HAND[1]]);
const MPF = [A.mp.ground[0] - 120, A.mp.ground[1] + 30];   // 信封最后停在铸币机左前
const DOCD = [A.mp.ground[0] - 210 - at(DOCO)[0], A.mp.ground[1] + 60 - at(DOCO)[1]];
const DCB = [at(L.SAFE)[0] - (DC[0] + 110), at(L.SAFE)[1] - 60 - (DC[1] + 70)];
const DAB = [at(L.SAFE)[0] - (DA[0] + 70), at(L.SAFE)[1] - 60 - (DA[1] + 70)];

S.build({
  cam0: "bridge", sub: "B 链只能相信证明",
  grid: { u0: -3600, u1: 4200, v0: -2600, v1: 2600 }, box: [-3200, -1800, 8400, 3800],   // 按本段镜头覆盖的范围调
  shown: [], css, html,
  terms: [
    { id: "t0", t: "中继者", d: "把消息和证明搬到另一条链的角色", at: w("中继者", 7) },
    { id: "t1", t: "Merkle 证明", d: "证明一条数据在哈希树里的路径", at: w("Merkle 证明", 9) },
    { id: "t2", t: "映射代币", d: "目标链上代表源链资产的代币", at: w("映射", 11) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先给准确的说法：桥全景
      pop("#lb-exact", ${t(LS[0] + 0.3)});
      // ===== L1 跨链桥定义
      pop("#kw-def", ${t(TM.def)}); bump("#kw-def", ${t(TM.def + 2.4)}, 1.05, 1);
      // ===== L2 A 链 / B 链，右岸指向左岸：相信？
      out("#lb-exact", ${t(LS[2] - 0.2)});
      pop("#lb-ach", ${t(TM.ach)}); pop("#lb-bch", ${t(TM.bch)});
      draw("arr", ${t(TM.trust - 0.3)}, 0.8);
      pop("#lb-trust", ${t(TM.trust)});
      // ===== L3 河面竖幕挡住；岗亭亮出证明卡
      out("#kw-def", ${t(LS[3] - 0.2)});
      fadeIn("#curt", ${t(TM.see)}, 0.5); grow("pc", ${t(TM.proof)}); pop("#lb-proof", ${t(TM.proof + 0.4)});
      // ===== L4 移到 A：锁定 → 铸造
      out("#arr, #lb-ach, #lb-bch, #lb-trust, #lb-proof", ${t(LS[4] - 0.2)});
      cam(${t(LS[4])}, "bankA", 1.4); pop("#kw-lm", ${t(TM.lm)});
      // ===== L5 100 个点倒进金库，门关上
      out("#kw-lm", ${t(LS[5] - 0.2)});
      fadeIn("#dotsA", ${t(TM.ex)}, 0.4); pop("#lb-usdt", ${t(TM.ex + 0.2)}); pop("#lb-ex", ${t(TM.ex + 0.4)});
      KIT.door(tl, "sf", ${t(TM.dep - 0.6)}, 105, 0.6);
      out("#lb-usdt, #lb-ex", ${t(TM.dep)});
      tl.to("#dotsA", { x: ${DAB[0]}, y: ${DAB[1]}, scale: 0.25, opacity: 0, transformOrigin: "50% 50%", duration: 1.0, ease: "power2.in" }, ${t(TM.dep)});
      KIT.door(tl, "sf", ${t(TM.lock)}, 0, 0.6); pop("#lb-lock", ${t(TM.lock + 0.3)}); bump("#lb-lock", ${t(TM.lock + 1.6)}, 1.12, 1); bump("#lb-lock", ${t(LS[6] - 1.0)}, 1.12, 1);
      // ===== L6 存款事件 + 消息字段；代码卡第 1 行连到消息
      out("#lb-lock", ${t(LS[6] - 0.2)});
      grow("lt", ${t(TM.evt)}); pop("#lb-evt", ${t(TM.evt + 0.3)});
      pop("#ca", ${t(TM.evt + 0.4)}); hot("#ca-r0, #ca-r1", ${t(TM.evt + 0.8)}); draw("cv0", ${t(TM.evt + 1.0)});
      grow("msg", ${t(TM.f0 - 0.4)});
      X9.field(tl, "msg", ${t(TM.f0)}, 0, "filled"); pop("#lb-f0", ${t(TM.f0)});
      X9.field(tl, "msg", ${t(TM.f1)}, 1, "filled");
      X9.field(tl, "msg", ${t(TM.f2)}, 2, "filled");
      // ===== L7 A 链尾部再长出两块：等确定
      out("#ca, #cv0, #lb-f0, #lb-evt", ${t(LS[7] - 0.2)});
      tl.set("#cha-b4, #cha-b5", { opacity: 0 }, 0);
      fadeIn("#cha-b4", ${t(TM.conf)}, 0.35); fadeIn("#cha-b5", ${t(TM.conf + 0.5)}, 0.35); pop("#lb-wait", ${t(TM.conf + 0.8)});
      // ===== L8 中继者拿着信封过桥
      out("#lb-wait", ${t(LS[8] - 0.2)});
      cam(${t(LS[8])}, "bridge", 1.2);
      X1.walk(tl, "lt", ${t(LS[8])}, 1.1, [[${R0[0] + HAND[0]}, ${R0[1] + HAND[1]}]]);
      tl.to("#relmv", { keyframes: ${JSON.stringify(relPath)}, duration: 2.4, ease: "none" }, ${t(LS[8] + 1.2)});
      X1.walk(tl, "lt", ${t(LS[8] + 1.2)}, 2.4, ${JSON.stringify(ltPath)}, "none");
      // ===== L9 三种证明
      pop("#lb-sig", ${t(TM.sig)}); pop("#lb-mk", ${t(TM.mk)}); pop("#lb-zk", ${t(TM.zk)});
      // ===== L10 到 C：验证证明、查序号；代码卡第 2–3 行
      out("#lb-sig, #lb-mk, #lb-zk", ${t(LS[10] - 0.2)});
      cam(${t(LS[10])}, "mintB", 1.4);
      X1.walk(tl, "lt", ${t(LS[10])}, 1.2, [[${MPF[0]}, ${MPF[1]}]]);
      pop("#ca", ${t(LS[10] + 1.4)}); hot("#ca-r2", ${t(TM.ver)}); hot("#ca-r3", ${t(TM.nonce)});
      draw("cv1", ${t(TM.nonce + 0.2)}); pop("#lb-nonce", ${t(TM.nonce + 0.6)});
      // ===== L11 冲头落下，托盘出现 100 个点：映射 USDT
      X11.mint(tl, "mp", ${t(TM.mint)}, 1.4, 2, 0.5); X11.count(tl, "mp", ${t(TM.mint + 1.2)}, "100");
      fadeIn("#dotsC", ${t(TM.mint + 0.9)}, 0.5); pop("#lb-musdt", ${t(TM.mint + 1.3)});
      // ===== L12 退回岗亭近景
      out("#ca, #cv1, #lb-nonce, #lb-musdt", ${t(LS[12] - 0.2)});
      cam(${t(LS[12])}, "boothT", 1.3);
      // ===== L13 信任边界竖幕亮起
      flash("#curt", ${t(TM.tb)}, 2, 0.35); pop("#lb-tb", ${t(TM.tb + 0.2)});
      // ===== L14 三查
      tl.to("#pc", { scale: 1.25, transformOrigin: "50% 100%", duration: 0.4 }, ${t(TM.three)}); pop("#lb-3", ${t(TM.three + 0.2)});
      // ===== L15 三行依次打绿勾，代码卡第 2–4 行
      pop("#ca", ${t(LS[15] - 0.1)}); draw("cv2", ${t(LS[15] + 0.2)});
      hot("#ca-r2", ${t(TM.c1)}, "#e3f4ea"); pop("#ca-c2", ${t(TM.c1)});
      hot("#ca-r3", ${t(TM.c2)}, "#e3f4ea"); pop("#ca-c3", ${t(TM.c2)});
      hot("#ca-r4", ${t(TM.c3)}, "#e3f4ea"); pop("#ca-c4", ${t(TM.c3)});
      // ===== L16 宽景：A 城 / B 城（比喻）
      out("#cv2, #lb-tb, #lb-3", ${t(LS[16] - 0.2)}); out("#ca", ${t(LS[16] + 0.4)}); tl.to("#pc", { scale: 1, duration: 0.3 }, ${t(LS[16] - 0.2)});
      cam(${t(LS[16])}, "wide", 1.0);
      pop("#lb-acity", ${t(TM.meta)}); pop("#lb-bcity", ${t(Math.max(TM.meta + 0.2, LS[16] + 0.7))}); pop("#lb-meta", ${t(TM.meta + 0.4)});
      // ===== L17 金条 → 提货单过桥 → 金券
      KIT.door(tl, "sf", ${t(TM.gold)}, 105, 0.6);
      fadeIn("#docmv", ${t(TM.bill)}, 0.3); KIT.door(tl, "sf", ${t(TM.bill + 0.4)}, 0, 0.5);
      tl.to("#docmv", { x: ${DOCD[0]}, y: ${DOCD[1]}, duration: 2.0, ease: "power1.inOut" }, ${t(TM.bill + 0.6)});
      pop("#lb-coupon", ${t(TM.coupon)});
      // ===== L18 提货单放大，盖红章
      tl.to("#docsc", { scale: 2.2, transformOrigin: "50% 100%", duration: 0.5 }, ${t(LS[18] + 0.2)});
      fadeIn("#doc-stampmark", ${t(TM.stamp)}, 0.3);
      // ===== L19 印章失效；兑出不存在的金子
      KIT.broke(tl, "doc", ${t(TM.stolen)}, { badge: true });
      X11.spill(tl, "mp", ${t(TM.forge)}, true); pop("#lb-forge", ${t(TM.forge + 0.3)});
      // ===== L20 比喻不成立处：两侧金库金光
      out("#lb-coupon, #lb-forge, #lb-meta", ${t(LS[20] - 0.2)});
      tl.to("#docsc", { scale: 1, duration: 0.4 }, ${t(LS[20] - 0.2)});
      pop("#lb-nh", ${t(TM.nh)}); fadeIn("#gold", ${t(TM.big)}, 0.5); pop("#lb-big", ${t(TM.big + 0.2)});
      // ===== L21 桥上红靶心：首选目标
      fadeIn("#tgt", ${t(TM.tgt - 0.3)}, 0.4); pop("#lb-tgt", ${t(TM.tgt + 0.2)});
      // ===== L22 反向：点阵回流过桥，A 金库门打开
      out("#lb-nh, #lb-big, #gold, #tgt, #lb-tgt, #docmv, #lb-acity, #lb-bcity", ${t(LS[22] - 0.2)});
      X11.spill(tl, "mp", ${t(LS[22])}, false);
      pop("#lb-rev", ${t(TM.rev + 0.2)});
      tl.to("#dotsC", { x: ${DCB[0]}, y: ${DCB[1]}, duration: 2.2, ease: "power1.inOut" }, ${t(TM.rev + 0.4)});
      X11.coins(tl, "mp", ${t(TM.rev + 0.4)}, 0, 1.0);
      KIT.door(tl, "sf", ${t(TM.unlock)}, 105, 0.6);
      out("#dotsC", ${t(TM.unlock + 0.8)}, 0.4);
      bump("#lb-rev", ${t(TM.more)}, 1.12, 1);
      // ===== L23 停在铸币机：信谁？
      out("#lb-rev", ${t(LS[23] - 0.2)});
      cam(${t(LS[23])}, "mintB", 1.2); pop("#lb-who", ${t(TM.who)});
`,
});
