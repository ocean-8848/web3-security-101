// ep22/seg2「② 挡不住扳手」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.simC（BRIEF）。
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
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
// ends static on CAMS.linkB

// 段内专用：E 区持币人家门口（海报 + 门牌 + 持币人 + 多签金库 + 攻击者）
const rel = (o, du, dv, extra = {}) => ({ u: o.u + du, v: o.v + dv, ...extra });
const ATK_E = rel(L.MSIG_SAFE, 60, 280, { scale: 0.55 });
const ATK_DOOR = rel(L.DOOR_PLATE, 90, 70, { scale: 0.55 });
const R = L.world.rects;
const doorE = L.fit([R.poster, R.door, R.holder, R.msig, R.homeDesk, L.rect(ATK_E, "personAtk"), L.rect(ATK_DOOR, "personAtk")], [100, 300, 1820, 860], 1.4);

const S = segInit(import.meta.url, { cams: { ...L.CAMS, doorE }, ext: [E1, E2, E7, X] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
// 不支持 scale 的物件：绕地面点包一层，并换算 anchors
const wput = (key, o, r, dy = 0, extra = {}) => {
  const [gx, gy] = at(o), k = o.scale;
  put(key, o, r, dy, { ...extra, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) { const p = A[key][n]; if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number") A[key][n] = [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k]; }
};
const FONT = `font-family="Noto Sans SC, Inter, sans-serif"`;

// 石板路（最底层）
{
  const q = [Wp(L.ROAD.u0, L.ROAD.v0), Wp(L.ROAD.u1, L.ROAD.v0), Wp(L.ROAD.u1, L.ROAD.v1), Wp(L.ROAD.u0, L.ROAD.v1)];
  add({ u: L.ROAD.u0 - 20000, v: -20000 }, `<polygon points="${q.map((p) => p.map((x) => x.toFixed(1)).join(",")).join(" ")}" fill="#ddd8ce" stroke="#cbc5b8" stroke-width="3"/>`);
}

// C 运营商门店（上段终点 simC 的画面）
put("phV", L.PHONE_V, O.phone(L.PHONE_V, { id: "phV", screen: `<rect width="76" height="150" fill="#e8f3f7"/><text x="38" y="66" text-anchor="middle" ${FONT} font-size="14" font-weight="900" fill="#1d93ba">手机号</text><rect x="12" y="80" width="52" height="8" rx="4" fill="#9fd3e5"/>` }));
put("simV", L.SIM_V, X.simCard(L.SIM_V, { id: "simV", tone: "teal" }));
put("simA", L.SIM_A, X.simCard(L.SIM_A, { id: "simA", state: "attacker" }));
put("phA", L.PHONE_A, O.phone(L.PHONE_A, { id: "phA", state: "attacker", screen: `<rect width="76" height="150" fill="#fbe9e7"/><text x="38" y="66" text-anchor="middle" ${FONT} font-size="14" font-weight="900" fill="#e0453a">手机号</text><rect x="12" y="80" width="52" height="8" rx="4" fill="#f2b8b2"/>` }));

// E 家
put("holder", L.HOLDER, O.person(L.HOLDER, { id: "holder", role: "signer", scale: L.HOLDER.scale }));
wput("msig", L.MSIG_SAFE, O.safe(L.MSIG_SAFE, { id: "msig", plate: "多签" }));
wput("hdesk", L.HOME_DESK, O.desk(L.HOME_DESK, { id: "hdesk" }));
put("door", L.DOOR_PLATE, E2.addrPlate(L.DOOR_PLATE, { id: "door", text: "门牌" }));
put("poster", L.POSTER, E1.signBoard(L.POSTER, { id: "poster", style: "wood", text: "海报", size: 34 }), 0, { grow: true });
wput("gpu", L.GPU, E2.gpuRig(L.GPU, { id: "gpu" }), 0, { grow: true });
put("wr", L.WRENCH, X.wrench(L.WRENCH, { id: "wr", scale: L.WRENCH.scale }), 0, { grow: true });
put("atkE", ATK_E, O.person(ATK_E, { id: "atkE", role: "attacker", scale: ATK_E.scale }), 0, { wrap: (svg) => S.hid("atkEg", svg) });
const [dX, dY] = [at(ATK_DOOR)[0] - at(ATK_E)[0], at(ATK_DOOR)[1] - at(ATK_E)[1]];

// A 链上
wput("chain", L.CHAIN, O.chain(L.CHAIN, { id: "chain", n: 4 }));
const exPage = `<rect x="16" y="54" width="348" height="40" rx="8" fill="#f3f0ea"/>
  <text x="30" y="82" ${FONT} font-size="20" font-weight="900" fill="#1c1c1c">地址</text><rect x="86" y="68" width="200" height="12" rx="6" fill="#b8b0a1"/>
  <text x="30" y="128" ${FONT} font-size="18" font-weight="700" fill="#5f5a50">余额</text>
  <rect x="86" y="112" width="270" height="22" rx="11" fill="#e2ddd3"/><rect id="ex-bal" x="86" y="112" width="250" height="22" rx="11" fill="#1d93ba" opacity="0"/>
  ${[0, 1, 2].map((i) => `<rect x="16" y="${156 + i * 44}" width="348" height="34" rx="6" fill="#faf8f4" stroke="#ddd6c9"/><rect x="30" y="${168 + i * 44}" width="${150 - i * 20}" height="10" rx="5" fill="#ddd6c9"/><rect x="${290 - i * 10}" y="${168 + i * 44}" width="${60 + i * 10}" height="10" rx="5" fill="#9fd3e5"/>`).join("")}`;
wput("ex", L.EXPLORER, O.browserWin(L.EXPLORER, { id: "ex", title: "区块浏览器", page: exPage }));
put("mag", L.MAG, O.magnifier(L.MAG, { id: "mag" }), 0, { wrap: (svg) => S.hid("magg", svg) });
put("csign", L.CHAIN_SIGN, E1.signBoard(L.CHAIN_SIGN, { id: "csign", style: "plate", text: "链上数据", size: 34 }));

// B 线索桌
const puzzle = `<rect width="148" height="88" fill="#ffffff"/><rect width="148" height="14" fill="#ece7dd"/>
  <rect x="10" y="22" width="40" height="28" rx="3" fill="#9fd3e5"/><rect x="54" y="22" width="40" height="28" rx="3" fill="#ddd6c9"/><rect x="98" y="22" width="40" height="28" rx="3" fill="#f2b8b2"/>
  <rect x="10" y="54" width="40" height="28" rx="3" fill="#ddd6c9"/><rect x="54" y="54" width="40" height="28" rx="3" fill="#f2b8b2"/><rect x="98" y="54" width="40" height="28" rx="3" fill="#9fd3e5"/>`;
wput("cdesk", L.CLUE_DESK, O.desk(L.CLUE_DESK, { id: "cdesk", screen: puzzle }));
put("atkB", L.ATK_B, O.person(L.ATK_B, { id: "atkB", role: "attacker", scale: L.ATK_B.scale }));
const pubScr2 = `<rect width="76" height="150" fill="#ffffff"/><rect x="6" y="8" width="64" height="56" rx="6" fill="#9fd3e5"/>
  <circle cx="38" cy="30" r="10" fill="#3b3e44"/><path d="M20 64q18-26 36 0z" fill="#3b3e44"/>
  <rect x="6" y="74" width="64" height="44" rx="6" fill="#f3f0ea" stroke="#ddd6c9"/><text x="38" y="92" text-anchor="middle" ${FONT} font-size="11" font-weight="900" fill="#1c1c1c">采访</text>
  <rect x="14" y="100" width="48" height="6" rx="3" fill="#ddd6c9"/><rect x="6" y="126" width="64" height="16" rx="5" fill="#1d93ba"/>`;
wput("pp", L.PUB_PHONE, O.phone(L.PUB_PHONE, { id: "pp", screen2: pubScr2 }));
wput("kyc", L.KYC_DB, O.dbLedger(L.KYC_DB, { id: "kyc", tag: "KYC 数据" }), 0, { grow: true });
put("ord", L.ORDER, E7.parcel(L.ORDER, { id: "ord", scale: L.ORDER.scale }), 0, { grow: true });
put("tkt", L.TICKET, O.doc(L.TICKET, { id: "tkt", title: "客服工单" }), 0, { grow: true });
put("dos", L.DOSSIER, O.ledgerBook(L.DOSSIER, { id: "dos", scale: L.DOSSIER.scale }), 0, { grow: true });
wput("addrB", L.ADDR_B, E2.addrPlate(L.ADDR_B, { id: "addrB", text: "住址" }), 0, { grow: true });
// 三个线索槽（原生 SVG）
const [sx, sy] = at(L.SLOTS_B);
const SLOT = [0, 1, 2].map((i) => [sx - 240 + i * 240, sy - 36]);
add(L.SLOTS_B, S.hid("slots", [0, 1, 2].map((i) => `<rect x="${sx - 340 + i * 240}" y="${sy - 70}" width="200" height="66" rx="12" fill="#fffdf8" stroke="#2aa3c9" stroke-width="3" stroke-dasharray="10 7"/>`).join("")), -200);
// KYC 外框：红（泄露）→ 绿（保护）
const kr = L.rect(L.KYC_DB, "dbLedger"), pad = 14;
const frame = (id, col, dash) => S.hid(id, `<rect x="${kr[0] - pad}" y="${kr[1] - pad}" width="${kr[2] - kr[0] + 2 * pad}" height="${kr[3] - kr[1] + 2 * pad}" rx="14" fill="none" stroke="${col}" stroke-width="4" ${dash ? `stroke-dasharray="12 8"` : ""}/>`);
add(L.KYC_DB, frame("kycR", "#e0453a", true) + frame("kycG", "#1f9d55", false), 400);

// D 账号广场（全景时有东西可指）
wput("tower", L.TOWER, O.tower(L.TOWER, { id: "tower" }));
put("acct", L.ACCT_LAPTOP, O.laptop(L.ACCT_LAPTOP, { id: "acct" }));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
lb("lb-atkE", up(A.atkE.top, 10), "暴力或威胁 → 私钥 / 转账", "lab-r");
lb("lb-gpu", up(A.gpu.top, 10), "算力", "lab-cs");
lb("lb-gpux", up(A.gpu.center, 0), "✕ 破解不了", "lab-rs", "c");
lb("lb-wr", up(A.wr.top, 8), "扳手", "lab-ink lab-sm");
lb("lb-cheap", [A.wr.ground[0], A.wr.ground[1] + 14], "便宜", "lab-g lab-sm", "t");
lb("lb-id", up(A.holder.top, 10), "身份", "lab-cs lab-sm");
lb("lb-home", [A.holder.center[0] - 60, A.holder.center[1]], "住址", "lab-cs lab-sm", "r");
lb("lb-asset", [A.holder.center[0] + 60, A.holder.center[1]], "资产", "lab-cs lab-sm", "l");
lb("lb-lock", up(A.msig.top, 10), "银行级的锁", "lab-gs");
const PR = up(A.poster.top, 10);
["门牌号", "作息时间", "保险柜里的钱"].forEach((s, i) => lb(`lb-p${i}`, [PR[0], PR[1] - (2 - i) * 66], s, "lab-ink lab-sm"));
lb("lb-wait", up(at(ATK_DOOR), 150), "等你回家", "lab-r lab-sm");
lb("lb-ex", up(A.ex.top, 10), "全世界可见", "lab-gs");
lb("lb-slot0", SLOT[0], "公开信息", "lab-cs lab-sm", "c");
lb("lb-slot1", SLOT[1], "数据泄露", "lab-cs lab-sm", "c");
lb("lb-slot2", SLOT[2], "链上数据", "lab-cs lab-sm", "c");
lb("lb-d0", up(A.dos.top, 84), "余额高", "lab-r lab-sm");
lb("lb-d1", up(A.dos.top, 14), "住址已知", "lab-r lab-sm");
lb("lb-dos", [A.dos.ground[0], A.dos.ground[1] + 24], "目标档案", "lab-ink lab-sm", "t");
lb("lb-toE", up(A.door.top, 20), "找上门", "lab-r");
lb("lb-toD", up(A.tower.top, 20), "攻账号", "lab-r");
lb("lb-safe", [kr[0] - pad - 8, (kr[1] + kr[3]) / 2], "保护数据 = 保护人身", "lab-g", "r");

// ---------------------------------------------------------------- 屏幕层曲线
S.curve("cvA", S.scr("chainA", A.ex.center), [1840, S.scr("chainA", A.ex.center)[1] + 40], { c1: [1500, S.scr("chainA", A.ex.center)[1] - 120] });
const sl2 = S.scr("linkB", SLOT[2]);
S.curve("cvIn", [80, 520], [sl2[0] - 100, sl2[1]], { c1: [500, 260], c2: [sl2[0] - 300, sl2[1] - 120] });
const dosP = S.scr("linkB", A.dos.center);
S.curve("cv0", S.scr("linkB", A.pp.screen), dosP);
S.curve("cv1", S.scr("linkB", A.kyc.top), dosP);
S.curve("cv2", sl2, dosP, { c1: [sl2[0] + 60, sl2[1] + 160], c2: [dosP[0] - 40, dosP[1] - 160] });
const wB = S.scr("wide", up(at(L.CLUE_DESK), 60));
const wE = S.scr("wide", A.door.ground), wD = S.scr("wide", A.tower.ground);
S.curve("cvE", wB, wE, { c1: [wB[0] + (wE[0] - wB[0]) * 0.4, wB[1] + 140], c2: [wE[0] - 200, wE[1] + 80] });
S.curve("cvD", wB, wD, { c1: [wB[0] + (wD[0] - wB[0]) * 0.4, wB[1] - 140], c2: [wD[0] - 160, wD[1] - 60] });

// ---------------------------------------------------------------- 屏幕层卡片
const html = evt("ev-comic", `${gtag("漫画")} 名字的来源`, { color: "#8a8478" })
  + evt("ev-meta", `${gtag("比喻")} 家门与海报`, { color: "#8a8478", top: 124 })
  + evt("ev-meta2", `${gtag("比喻 · 不成立处")} 劫匪要先知道你有钱`, { color: "#e0453a", top: 128 })
  + kw("kw-crypto", `密码学 <b>≠</b> 人身安全`, { x: 640, y: 160, size: 52, accent: "#e0453a" })
  + kw("kw-link", `第一步 <b>关联</b>`, { x: 780, y: 170, size: 52, accent: "#e0453a" });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  atk: w("扳手攻击", 1), comic: w("漫画", 2), crack: w("破解不了", 3), cheap: w("便宜", 3), crypto: w("密码学", 4),
  who: w("你是谁", 5), where: w("住在哪", 5), much: w("多少资产", 5), lock: w("银行级", 6),
  plate: w("门牌号", 7), sched: w("作息时间", 7), money: w("保险柜", 7), wait: w("等你回家", 8), fail: w("不成立", 9),
  pub: w("全世界公开", 10), link: w("关联", 11), real: w("真实的人", 12), pubInfo: w("公开信息", 14),
  kyc: w("KYC", 15), order: w("电商订单", 15), ticket: w("客服工单", 15), chainD: w("链上数据", 16),
  hi: w("余额高", 17), addr: w("住址已知", 17), home: w("找上门", 18), acct: w("攻账号", 18), protect: w("保护数据", 19),
};
const t = (x) => f(x);

S.build({
  cam0: "simC", sub: "攻击者先把地址连到你本人",
  grid: { u0: -3700, u1: 16600, v0: -10600, v1: 10300 }, box: [-1600, -5900, 13600, 7900],   // 盖住上段终点 simC + safeE / chainA / linkB / wide
  shown: [], css, html,
  terms: [
    { id: "t0", t: "私钥", d: "控制链上资产的那串密钥", at: w("私钥", 1) },
    { id: "t1", t: "KYC", d: "开户时提交的实名身份资料", at: w("KYC", 15) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 先给准确的说法。 C → E
      cam(${t(LS[0])}, "safeE", 1.5);
      // ===== L1 扳手攻击，就是用暴力或威胁，逼持币的人交出私钥，或者转账。
      fadeIn("#atkEg", ${t(TM.atk)}, 0.5); pop("#lb-atkE", ${t(TM.atk + 0.5)});
      // ===== L2 这个名字来自一幅漫画。
      out("#lb-atkE", ${t(LS[2] - 0.2)}); pop("#ev-comic", ${t(TM.comic)});
      grow("gpu", ${t(TM.comic + 0.2)}); pop("#lb-gpu", ${t(TM.comic + 0.6)}); grow("wr", ${t(TM.comic + 0.5)}); pop("#lb-wr", ${t(TM.comic + 0.9)});
      // ===== L3 花大价钱买算力，破解不了加密，买一把便宜的扳手，就够了。
      pop("#lb-gpux", ${t(TM.crack)}); pop("#lb-cheap", ${t(TM.cheap)}); bump("#lb-wr", ${t(TM.cheap + 0.3)});
      // ===== L4 密码学挡不住扳手。
      pop("#kw-crypto", ${t(TM.crypto)});
      // ===== L5 攻击者知道你是谁，住在哪，有多少资产，最便宜的办法，就是找到你本人。
      out("#kw-crypto, #lb-gpux, #lb-cheap, #lb-gpu, #lb-wr", ${t(LS[5] - 0.2)});
      pop("#lb-id", ${t(TM.who)}); pop("#lb-home", ${t(TM.where)}); pop("#lb-asset", ${t(TM.much)});
      // ===== L6 打个比方，你给家门装了一把银行级的锁。 E 家门口（段内镜头 doorE）
      out("#ev-comic, #lb-id, #lb-home, #lb-asset", ${t(LS[6] - 0.2)}); cam(${t(LS[6])}, "doorE", 1.3);
      pop("#ev-meta", ${t(LS[6] + 0.3)}); pop("#lb-lock", ${t(TM.lock)});
      // ===== L7 可你的门牌号、作息时间、保险柜里有多少钱，都印在一张贴在网上的海报上。
      grow("poster", ${t(LS[7] + 0.1)}); pop("#lb-p0", ${t(TM.plate)}); pop("#lb-p1", ${t(TM.sched)}); pop("#lb-p2", ${t(TM.money)});
      // ===== L8 锁越好，劫匪越不会去撬锁，而是等你回家。
      bump("#lb-lock", ${t(LS[8] + 0.2)}); tl.to("#atkEg", { x: ${dX.toFixed(1)}, y: ${dY.toFixed(1)}, duration: 1.4, ease: "power2.inOut" }, ${t(LS[8] + 0.6)});
      pop("#lb-wait", ${t(TM.wait)});
      // ===== L9 比喻在这里不成立，劫匪要先知道你有钱。
      out("#ev-meta", ${t(LS[9] - 0.2)}); pop("#ev-meta2", ${t(TM.fail)}); tl.to("#lb-p2", { opacity: 0.35, duration: 0.4 }, ${t(TM.fail + 0.6)});
      // ===== L10 而链上资产的特点是，地址一旦和身份连上，余额对全世界公开。 E → A
      out("#ev-meta2, #lb-lock, #lb-p0, #lb-p1, #lb-p2, #lb-wait", ${t(LS[10] - 0.2)}); cam(${t(LS[10])}, "chainA", 2.0);
      fadeIn("#ex-bal", ${t(TM.pub - 0.3)}, 0.5); pop("#lb-ex", ${t(TM.pub)});
      // ===== L11 所以攻击的第一步，是关联。
      pop("#kw-link", ${t(TM.link)});
      // ===== L12 把一个链上地址，连到一个真实的人，一个真实的住址。
      fadeIn("#magg", ${t(LS[12])}, 0.4); tl.fromTo("#magg", { x: 60 }, { x: -60, duration: 1.4, ease: "sine.inOut", immediateRender: false }, ${t(LS[12])});
      draw("cvA", ${t(TM.real)});
      // ===== L13 线索有三类。 A → B
      out("#kw-link, #lb-ex, #cvA, #magg", ${t(LS[13] - 0.2)}); cam(${t(LS[13])}, "linkB", 1.4);
      fadeIn("#slots", ${t(LS[13] + 0.8)}, 0.4);
      // ===== L14 公开信息，比如社交媒体、采访、会议照片。
      fadeIn("#pp-scr2", ${t(TM.pubInfo)}, 0.4); pop("#lb-slot0", ${t(TM.pubInfo + 0.3)});
      // ===== L15 数据泄露，比如 KYC 资料、电商订单、客服工单。
      pop("#lb-slot1", ${t(LS[15] + 0.2)}); grow("kyc", ${t(TM.kyc)}); fadeIn("#kycR", ${t(TM.kyc + 0.4)}, 0.3);
      grow("ord", ${t(TM.order)}); grow("tkt", ${t(TM.ticket)});
      // ===== L16 还有链上数据，地址的余额和交易历史。
      draw("cvIn", ${t(TM.chainD)}); pop("#lb-slot2", ${t(TM.chainD + 0.6)});
      // ===== L17 三类线索拼在一起，就能筛出余额高、住址已知的目标。（关键画面）
      grow("dos", ${t(LS[17])}); pop("#lb-dos", ${t(LS[17] + 0.3)});
      draw("cv0", ${t(LS[17] + 0.4)}); draw("cv1", ${t(LS[17] + 0.6)}); draw("cv2", ${t(LS[17] + 0.8)});
      pop("#lb-d0", ${t(TM.hi)}); pop("#lb-d1", ${t(TM.addr)}); grow("addrB", ${t(TM.addr + 0.2)});
      // ===== L18 接下来有两条路，一条找上门，一条攻账号。 B → 全景
      out("#cv0, #cv1, #cv2, #cvIn, #lb-d0, #lb-d1, #lb-dos, #lb-slot0, #lb-slot1, #lb-slot2", ${t(LS[18] - 0.2)}); cam(${t(LS[18])}, "wide", 1.6);
      draw("cvE", ${t(TM.home)}); pop("#lb-toE", ${t(TM.home + 0.4)}); draw("cvD", ${t(TM.acct)}); pop("#lb-toD", ${t(TM.acct + 0.4)});
      // ===== L19 数据泄露直接交出了住址，所以保护数据，也是在保护人身安全。 全景 → B（段尾静止）
      out("#cvE, #cvD, #lb-toE, #lb-toD", ${t(LS[19] - 0.2)}); cam(${t(LS[19])}, "linkB", 1.4);
      pop("#lb-slot0", ${t(LS[19] + 1.4)}); pop("#lb-slot1", ${t(LS[19] + 1.5)}); pop("#lb-slot2", ${t(LS[19] + 1.6)}); pop("#lb-dos", ${t(LS[19] + 1.7)});
      bump("#kycR", ${t(LS[19] + 1.0)}); out("#kycR", ${t(TM.protect - 0.1)}); fadeIn("#kycG", ${t(TM.protect)}, 0.3); pop("#lb-safe", ${t(TM.protect + 0.3)});
`,
});
