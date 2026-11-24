// ep18/seg3「③ 钥匙的一生」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.lineC（BRIEF）。
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
// ends static on CAMS.backupC
import { segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f, ZONE } from "../../../kit/segbase.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
import { G as isoG } from "../../../kit/iso.mjs";

const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, E2, E5] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, { id: key }))）
const RED = "#e0453a", CY = "#2aa3c9", GR = "#1f9d55";
const gp = (o) => ({ u: o.u, v: o.v });
/** put an object that ignores opts.scale: wrap around its ground point and rescale anchors (SEGBASE 常见坑 1) */
const wput = (key, o, r, k, opts = {}) => {
  const [gx, gy] = at(o), sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k];
  put(key, gp(o), r, 0, { ...opts, wrap: (svg) => `<g transform="translate(${gx},${gy}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  for (const n of Object.keys(A[key])) if (Array.isArray(A[key][n]) && typeof A[key][n][0] === "number") A[key][n] = sc(A[key][n]);
};
/** native-SVG dot matrix (hidden group), returns [x, y] of its top-left */
const dots = (gid, o, n, cols, color = RED) => {
  const [x, y] = at(o), d = [];
  for (let i = 0; i < n; i++) d.push(`<circle cx="${x + 14 + (i % cols) * 30}" cy="${y + 14 + Math.floor(i / cols) * 30}" r="10" fill="${color}"/>`);
  add(gp(o), S.hid(gid, d.join("")), 3000);
  return [x, y + Math.ceil(n / cols) * 30 + 6];
};
// street band (under everything)
add({ u: 0, v: 0 }, `<path d="M${L.ROAD[0][0]},${L.ROAD[0][1]} L${L.ROAD[1][0]},${L.ROAD[1][1]}" stroke="#d9d4ca" stroke-width="160" opacity="0.55"/>`, -100000);

// 流水线 + 六块牌子
put("conv", gp(L.CONV), E2.conveyor(gp(L.CONV), { id: "conv", len: L.CONV.len }), -2000);
const STEPS = ["生成", "存储", "使用", "备份", "轮换", "销毁"];
L.BOARDS_C.forEach((o, i) => put(`bd${i}`, o, E1.signBoard(o, { id: `bd${i}`, style: "plate", text: STEPS[i], size: 34 }), 0, { grow: true }));
// 生成站
put("prng", L.PRNG_C, E2.prngCounter(L.PRNG_C, { id: "prng", plate: "Profanity", window: "32 位" }));
put("hwg", L.PRNG_C, O.hwWallet(L.PRNG_C, { id: "hwg", screenText: "可信" }), 1, { grow: true });
wput("gpu", L.GPU_C, E2.gpuRig(gp(L.GPU_C), { id: "gpu" }), L.GPU_C.scale);
put("addr", L.ADDR_C, E2.addrPlate(L.ADDR_C, { id: "addr", text: "靶号地址" }), 0, { grow: true });
wput("vlt", L.VAULT_C, O.safe(gp(L.VAULT_C), { id: "vlt", plate: "金库" }), L.VAULT_C.scale);
put("adm", gp(L.ADMIN_C), E5.keycard(gp(L.ADMIN_C), { id: "adm", scale: L.ADMIN_C.scale, role: "owner", text: "管理员" }), 0, { grow: true });
const [ax, ay] = at(L.ADMIN_C);
// clock: right of the keycard, behind it (canvas ≈ ADMIN + (140, −120))
const clkG = isoG(ax + 140, ay - 120), CLOCK_C = { u: Math.round(clkG.u), v: Math.round(clkG.v) };
put("clk", CLOCK_C, O.clock(CLOCK_C, { id: "clk" }), 0, { grow: true });
// ETH 金币（地址里的余额）
const [adx, ady] = at(L.ADDR_C);
add(gp(L.ADDR_C), S.hid("eth", [0, 1, 2].map((i) => `<ellipse cx="${adx + 92}" cy="${ady - 8 - i * 12}" rx="30" ry="13" fill="#d9a92b" stroke="#a87d12" stroke-width="2"/>`).join("") +
  `<text x="${adx + 92}" y="${ady - 26}" text-anchor="middle" font-size="16" font-weight="800" fill="#5b4307" font-family="Noto Sans SC">ETH</text>`), 5);
// GPU → 门牌 红虚线
add(gp(L.ADDR_C), S.hid("gpuln", `<path d="M${A.gpu.top[0] + 40},${A.gpu.top[1] + 40} Q${(A.gpu.top[0] + A.addr.top[0]) / 2},${A.gpu.top[1] - 60} ${A.addr.top[0]},${A.addr.top[1] + 20}" fill="none" stroke="${RED}" stroke-width="5" stroke-dasharray="14 10"/>`), 4000);
const DG = dots("dg", L.DOTS_GEN, 16, 8);
// 存储站
put("ph", L.PHONE_C, O.phone(L.PHONE_C, { id: "ph" }));
put("db", L.DB_C, O.dbLedger(L.DB_C, { id: "db", tag: "日志服务器" }));
put("pl", L.CPIPE.log.o, E1.pipe(L.CPIPE.log.o, { id: "pl", pts: L.CPIPE.log.pts }), 2);
const LT1 = { u: L.PHONE_C.u + 60, v: L.PHONE_C.v };
put("lt1", LT1, E1.letter(LT1, { id: "lt1", z: 70, state: "attacker" }), 3, { wrap: (s) => S.hid("lt1w", s) });
put("lt2", LT1, E1.letter(LT1, { id: "lt2", z: 70 }), 3, { wrap: (s) => S.hid("lt2w", s) });
const DS = dots("ds", L.DOTS_STORE, 4, 4);
const BR0 = A.pl.mid, BRT = [[-2470, 170], [-2470, 320], [-2470, 470]];
add(gp(L.DB_C), S.hid("br", BRT.map((q) => `<path d="M${BR0[0]},${BR0[1]} C${BR0[0] + 120},${BR0[1]} ${q[0] - 160},${q[1]} ${q[0]},${q[1]}" fill="none" stroke="${RED}" stroke-width="5" stroke-dasharray="14 10"/>`).join("")), 4000);
add(gp(L.PHONE_C), S.hid("gate", `<rect x="${A.pl.start[0] - 10}" y="${A.pl.start[1] - 40}" width="20" height="64" rx="4" fill="#1d93ba"/><rect x="${A.pl.start[0] - 22}" y="${A.pl.start[1] - 48}" width="44" height="12" rx="3" fill="${CY}"/>`), 4000);
// 发布站
wput("win", L.WIN_C, O.browserWin(gp(L.WIN_C), { id: "win", title: "Chrome 商店" }), L.WIN_C.scale);
const [wx, wy] = at(L.WIN_C);
put("rkey", gp(L.WIN_C), O.key(gp(L.WIN_C), { id: "rkey" }), 1, { grow: true, wrap: (s) => `<g transform="translate(0,-300)">${s}</g>` });
put("lt3", L.LETTER_C, E1.letter(L.LETTER_C, { id: "lt3", z: 0, state: "attacker" }), 0, { wrap: (s) => S.hid("lt3w", s) });
put("ak", gp(L.APIKEY_C), E5.keycard(gp(L.APIKEY_C), { id: "ak", scale: L.APIKEY_C.scale, role: "owner", text: "API Key" }));
put("ak2", gp(L.APIKEY_C), E5.keycard(gp(L.APIKEY_C), { id: "ak2", scale: L.APIKEY_C.scale, state: "attacker", text: "API Key" }), 1, { wrap: (s) => S.hid("ak2w", s) });
add(gp(L.WIN_C), S.hid("leak", [[-2720, -20], [-2760, 50], [-2750, 120], [-2710, 190]].map((q) =>
  `<path d="M${wx - 60},${wy - 90} L${q[0]},${q[1]}" stroke="${RED}" stroke-width="4" stroke-dasharray="10 8"/><circle cx="${q[0]}" cy="${q[1]}" r="12" fill="#fff" stroke="${RED}" stroke-width="4"/>`).join("")), 4000);
const DR = dots("dr", L.DOTS_REL, 9, 5);
const [kx, ky] = at(L.APIKEY_C);
add(gp(L.APIKEY_C), S.hid("gold", `<polygon points="${kx + 50},${ky - 10} ${kx + 100},${ky - 30} ${kx + 130},${ky - 18} ${kx + 80},${ky + 2}" fill="#f0c64a" stroke="#a87d12" stroke-width="2"/><polygon points="${kx + 50},${ky - 10} ${kx + 80},${ky + 2} ${kx + 80},${ky + 18} ${kx + 50},${ky + 6}" fill="#c99a1c"/><polygon points="${kx + 80},${ky + 2} ${kx + 130},${ky - 18} ${kx + 130},${ky - 2} ${kx + 80},${ky + 18}" fill="#ddb031"/>`), 4000);
// 备份站
L.RACKS_C.forEach((o, i) => wput(`rk${i}`, o, O.rack(gp(o), { id: `rk${i}`, tag: "MPC 节点" }), o.scale));
put("ceo", gp(L.CEO_C), O.person(gp(L.CEO_C), { id: "ceo", role: "signer", scale: L.CEO_C.scale }));
const [cx0, cy0] = at(L.CLOUD_C);
add(gp(L.CLOUD_C), S.hid("cloud", `<rect x="${cx0}" y="${cy0}" width="620" height="660" rx="24" fill="rgba(224,69,58,0.05)" stroke="${RED}" stroke-width="6" stroke-dasharray="22 14"/>`), 6000);
const DB_ = dots("dbk", L.DOTS_BACK, 13, 7);
const RX = L.RACKS_C.map((o) => at(o)), MOVE = [-300, 0, 300];
add(gp(L.CLOUD_C), S.hid("sep", RX.map(([x, y], i) => `<rect x="${x + MOVE[i] - 100}" y="${y - 275}" width="200" height="320" rx="16" fill="none" stroke="${CY}" stroke-width="5" stroke-dasharray="16 10"/>`).join("")), 6000);

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
L.BOARDS_C.forEach((o, i) => lb(`tri${i}`, [A[`bd${i}`].ground[0], A[`bd${i}`].ground[1] + 12], "▲ 事故", "lab-rs lab-sm", "t"));
lb("lb-43", [A.prng.top[0] - 20, A.prng.top[1] - 10], "种子 32 位 · 约 43 亿种", "lab-r lab-sm", "r");
lb("lb-gpu", [A.gpu.top[0] + 20, A.gpu.top[1] - 10], "GPU 反推", "lab-r lab-sm", "l");
lb("lb-eth", [adx + 92, ady + 30], "✓ 余额已转走", "lab-g lab-sm", "t");
lb("lb-adm", [ax + 40, ay - 40], "权限仍在", "lab-rs", "l");
lb("lb-clk", up(A.clk.top, 10), "约 5 天后", "lab-ink lab-sm");
lb("lb-dg", DG, "约 1.6 亿美元 · 每点约 1000 万（16 点）", "lab-ink lab-sm", "t");
lb("lb-hwg", up(A.hwg.top, 10), "可信硬件生成", "lab-g lab-sm");
lb("lb-noaddr", up(A.addr.top, 10), "<s>靶号工具</s>", "lab-r lab-sm");
lb("lb-ph", up(A.ph.top, 10), "Slope 钱包", "lab-ink lab-sm");
lb("lb-mn", up(A.pl.mid, 50), "助记词 · 明文", "lab-rs lab-sm");
lb("lb-ds", DS, "约 410 万美元 · 每点约 100 万（4 点）", "lab-ink lab-sm", "t");
["日志", "崩溃上报", "遥测"].forEach((s, i) => lb(`br${i}`, [BRT[i][0] + 12, BRT[i][1]], s, "lab-r lab-sm", "l"));
lb("lb-gate", [A.pl.start[0], A.pl.start[1] + 40], "采集端屏蔽", "lab-cs lab-sm", "t");
lb("lb-mask", up(A.pl.mid, 50), "****", "lab-gs lab-sm");
lb("lb-win", [wx, wy - 330], "发布链路 = 钥匙", "lab-cs lab-sm");
lb("lb-v", [wx + 140, wy - 60], "v2.68 恶意版本", "lab-rs lab-sm", "l");
lb("lb-dr", DR, "约 850 万美元 · 每点约 100 万（9 点，取整）", "lab-ink lab-sm", "t");
lb("lb-ak", [kx + 40, ky + 20], "API Key", "lab-ink lab-sm", "t");
lb("lb-fund", [kx + 145, ky - 20], "发布凭证 · CI 密钥 = 资金级", "lab-cs lab-sm", "l");
lb("lb-ceo", up(A.ceo.top, 8), "CEO", "lab-ink lab-sm");
lb("lb-cloud", [cx0 + 310, cy0 - 8], "CEO 个人云账户", "lab-rs");
lb("lb-dbk", DB_, "约 1.26 亿美元 · 每点约 1000 万（13 点，取整）", "lab-ink lab-sm", "t");
lb("lb-lock", [A.rk1.top[0], A.rk1.top[1] - 40], "无法登录", "lab-rs lab-sm");
lb("lb-disp", [cx0 + 310, cy0 + 690], "外部攻击？内部转移？" + gtag("未定性"), "lab-ink lab-sm", "t");
lb("big31", [cx0 + 310, cy0 + 300], "3 = 1", "lab-rs", "c");
const SEPL = ["组织 A", "地域 B", "云账户 C"];
RX.forEach(([x, y], i) => lb(`sep${i}`, [x + MOVE[i], y - 285], SEPL[i], "lab-cs lab-sm"));

// ---------------------------------------------------------------- 屏幕层卡片
const ET = (i) => ZONE.event.top + i * 4;
const html = [
  evt("e0", `<b>Profanity</b> · 2022 年 9 月${gtag("1inch 披露")}`, { top: ET(0) }),
  evt("e1", `<b>Wintermute</b> · 约 1.6 亿美元${gtag("SlowMist 分析")}`, { top: ET(1), color: RED }),
  evt("e2", `<b>Slope</b> · 2022 年 8 月${gtag("Solana 官方通报")}`, { top: ET(2), color: RED }),
  evt("e3", `<b>Trust Wallet</b> · 2025 年 12 月`, { top: ET(3), color: RED }),
  evt("e4", `<b>API Key</b> 被拿到${gtag("Trust Wallet 公告")}`, { top: ET(4), color: RED }),
  evt("e5", `<b>Multichain</b> · 2023 年 7 月 · 约 1.26 亿美元${gtag("Blockworks、Cointelegraph 报道")}`, { top: ET(5), color: RED }),
  evt("e6", `全部 MPC 节点在 CEO 个人云账户${gtag("项目方声明")}`, { top: ET(6), color: RED }),
  kw("kw-sl", `约 <b>9231</b> 个钱包`, { x: 1250, y: 640, size: 54, accent: RED }),
].join("");
const css = `#big31 { font-size: 72px; padding: 6px 28px 10px; }`;

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  steps: STEPS.map((s) => w(s, 0)), acc: w("事故", 1),
  aim: w("靶号", 3), seed: w("32", 4), gpu: w("GPU", 4), pub: w("公开", 5),
  adm: w("管理员", 6), eth: w("转走", 7), rev: w("撤销", 7), day: w("天后", 8), loss: w("被盗", 8),
  bal: w("不等于", 9), perm: w("权限", 9), hw: w("可信硬件", 10), nobad: w("不用", 10),
  plain: w("明文", 12), logsv: w("日志服务器", 12), sol: w("官方通报", 13), wal: w("钱包", 13), m13: w("损失", 13),
  br: [w("日志", 14), w("崩溃上报", 14), w("遥测", 14)], mask: w("屏蔽", 15),
  rel: w("发布链路", 16), bad: w("恶意版本", 17), exp: w("导出", 18), m18: w("被盗", 18),
  sec: w("泄露", 19), api: w("拿到", 19), fund: w("资金级", 20),
  mpc: w("异常转出", 22), cloud: w("个人云账户", 23), ceo: w("带走", 24), login: w("无法登录", 24),
  disp: w("争议", 25), nom: w("名义上", 26), sep: [w("不同组织", 27), w("不同地域", 27), w("不同云账户", 27)],
};
const t = (x) => f(x);

S.build({
  cam0: "lineC", sub: "每一步，都出过事故",
  grid: { u0: -8000, u1: 2200, v0: -7000, v1: 2900 }, box: [-7300, -1700, 7500, 3400],   // 盖住 keyB（L0 起移）/ lineC / genC / storeC / releaseC / backupC / C
  shown: [], css, html,
  terms: [
    { id: "t0", t: "靶号地址", d: "首尾字符符合指定模式的地址", at: w("靶号地址", 3) },
    { id: "t1", t: "GPU", d: "擅长大量并行计算的显卡", at: w("GPU", 4) },
    { id: "t2", t: "遥测", d: "软件自动上报的运行数据", at: w("遥测", 14) },
    { id: "t3", t: "GitHub secrets", d: "存在代码仓库里给自动流程用的密钥", at: w("GitHub secrets", 19) },
    { id: "t4", t: "CI", d: "代码提交后自动构建和发布的流程", at: w("CI", 20) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      // ===== L0 一把密钥，要经过生成、存储、使用、备份、轮换和销毁。
      KIT.belt(tl, "conv", ${t(LS[0])}, ${t(LE[1] - LS[0])}, 900);
      ${TM.steps.map((x, i) => `grow("bd${i}", ${t(x - 0.5)}, 0.4);`).join(" ")}
      // ===== L1 每一步，都出过真实事故。
      ${STEPS.map((_, i) => `pop("#tri${i}", ${t(LS[1] + 0.1 + i * 0.12)}, 0.25);`).join(" ")}
      // ===== L2 先看生成。
      out("${STEPS.map((_, i) => `#tri${i}`).join(", ")}", ${t(LS[2] + 0.3)}); cam(${t(LS[2])}, "genC", 1.2);
      // ===== L3 Profanity 是一个靶号地址生成器。
      bump("#prng", ${t(LS[3] + 0.2)}, 1.08, 1); grow("addr", ${t(TM.aim + 0.2)}); fadeIn("#eth", ${t(TM.aim + 0.7)}, 0.4);
      // ===== L4 它的随机种子只有 32 位，约 43 亿种，私钥可以被 GPU 反推。
      KIT.tick(tl, "prng", ${t(TM.seed)}, 5, 1.2); pop("#lb-43", ${t(TM.seed + 0.2)}, 0.25);
      KIT.fans(tl, "gpu", ${t(TM.gpu)}, 4, 3); pop("#lb-gpu", ${t(TM.gpu)}, 0.25); fadeIn("#gpuln", ${t(TM.gpu + 0.5)}, 0.5);
      // ===== L5 2022 年 9 月，1inch 公开了这个问题。
      pop("#e0", ${t(TM.pub - 0.4)}, 0.3);
      // ===== L6 Wintermute 把这样一个地址，用作金库的管理员。
      out("#lb-43, #lb-gpu, #gpuln", ${t(LS[6] - 0.2)}); grow("adm", ${t(TM.adm)}); bump("#vlt", ${t(TM.adm + 0.5)}, 1.04, 1);
      // ===== L7 披露后，它转走了地址里的 ETH，却没有撤销管理员权限。
      bump("#addr", ${t(LS[7] + 0.2)}, 1.08, 1); bump("#eth", ${t(LS[7] + 0.6)}, 1.1, 1);
      tl.to("#eth", { x: 130, y: -90, opacity: 0, duration: 1.0, ease: "power2.in" }, ${t(TM.eth)}); pop("#lb-eth", ${t(TM.eth + 1.0)}, 0.25);
      bump("#adm", ${t(TM.rev + 0.2)}, 1.15, 2);
      // ===== L8 约 5 天后，金库被盗约 1.6 亿美元。
      out("#e0", ${t(LS[8] - 0.2)}); grow("clk", ${t(LS[8])}); pop("#lb-clk", ${t(LS[8] + 0.2)}, 0.25); KIT.clock(tl, "clk", ${t(LS[8] + 0.3)}, 1.6, 720);
      fadeIn("#dg", ${t(TM.loss)}, 0.6); pop("#lb-dg", ${t(TM.loss + 0.4)}, 0.25); pop("#e1", ${t(TM.loss)}, 0.3); bump("#vlt", ${t(TM.loss)}, 1.05, 2);
      // ===== L9 转走余额，不等于消除风险，权限也要撤销。（关键画面：余额已转走 + 权限仍在）
      out("#lb-clk, #clk", ${t(LS[9] - 0.2)}); bump("#lb-eth", ${t(LS[9] + 0.2)}, 1.12, 1);
      pop("#lb-adm", ${t(TM.bal)}, 0.3); flash("#adm", ${t(TM.bal + 0.3)}, 3, 0.3); bump("#lb-adm", ${t(TM.perm)}, 1.15, 2);
      // ===== L10 资金地址要在可信硬件里生成，不用靶号工具。
      out("#dg, #lb-dg, #e1", ${t(LS[10] - 0.2)});
      out("#prng", ${t(TM.hw)}, 0.4); grow("hwg", ${t(TM.hw + 0.3)}); pop("#lb-hwg", ${t(TM.hw + 0.6)}, 0.25); pop("#lb-noaddr", ${t(TM.nobad)}, 0.25);
      // ===== L11 再看存储。
      out("#lb-eth, #lb-adm, #lb-hwg, #lb-noaddr", ${t(LS[11] - 0.2)}); cam(${t(LS[11])}, "storeC", 1.1);
      // ===== L12 2022 年 8 月，Slope 钱包把助记词以明文发到自己的日志服务器。
      pop("#lb-ph", ${t(LS[12] + 0.2)}, 0.25); pop("#e2", ${t(LS[12] + 0.3)}, 0.3);
      fadeIn("#lt1w", ${t(TM.plain - 0.3)}, 0.3); pop("#lb-mn", ${t(TM.plain)}, 0.25);
      X1.walk(tl, "lt1", ${t(TM.plain + 0.1)}, 1.8, [${JSON.stringify(A.pl.mid)}, ${JSON.stringify(A.pl.end)}]); bump("#db", ${t(TM.logsv + 0.3)}, 1.06, 1);
      // ===== L13 Solana 官方通报，约 9231 个钱包受影响，损失约 410 万美元。
      out("#lt1w", ${t(LS[13])}); pop("#kw-sl", ${t(TM.wal - 0.3)}, 0.3); fadeIn("#ds", ${t(TM.m13)}, 0.5); pop("#lb-ds", ${t(TM.m13 + 0.3)}, 0.25);
      // ===== L14 日志、崩溃上报、遥测，都是密钥的泄露通道。
      out("#kw-sl, #ds, #lb-ds", ${t(LS[14] - 0.2)}); fadeIn("#br", ${t(TM.br[0])}, 0.5);
      ${TM.br.map((x, i) => `pop("#br${i}", ${t(x)}, 0.25);`).join(" ")}
      // ===== L15 客户端要在采集这一端，就把密钥材料屏蔽掉。
      fadeIn("#gate", ${t(TM.mask - 0.3)}, 0.3); pop("#lb-gate", ${t(TM.mask)}, 0.25); out("#lb-mn, #br, #br0, #br1, #br2", ${t(TM.mask + 0.2)});
      fadeIn("#lt2w", ${t(TM.mask + 0.4)}, 0.3); X1.walk(tl, "lt2", ${t(TM.mask + 0.5)}, 1.8, [${JSON.stringify(A.pl.mid)}, ${JSON.stringify(A.pl.end)}]); pop("#lb-mask", ${t(TM.mask + 0.6)}, 0.25);
      // ===== L16 钱包的发布链路，也是一把钥匙。
      out("#lt2w, #gate, #lb-gate, #lb-mask, #lb-ph, #e2", ${t(LS[16] - 0.2)}); cam(${t(LS[16])}, "releaseC", 1.1);
      grow("rkey", ${t(TM.rel + 0.3)}); pop("#lb-win", ${t(TM.rel + 0.6)}, 0.25);
      // ===== L17 2025 年 12 月，Trust Wallet 的浏览器扩展，有一个恶意版本出现在 Chrome 商店。
      pop("#e3", ${t(LS[17] + 0.2)}, 0.3); fadeIn("#lt3w", ${t(TM.bad - 0.4)}, 0.3);
      X1.walk(tl, "lt3", ${t(TM.bad)}, 1.2, [[${wx + 40}, ${wy - 30}]]); out("#lt3w", ${t(TM.bad + 1.2)}, 0.3); pop("#lb-v", ${t(TM.bad + 1.2)}, 0.25); bump("#win", ${t(TM.bad + 1.2)}, 1.04, 1);
      // ===== L18 它导出扩展里所有钱包的助记词，约 850 万美元被盗。
      fadeIn("#leak", ${t(TM.exp)}, 0.6); fadeIn("#dr", ${t(TM.m18)}, 0.5); pop("#lb-dr", ${t(TM.m18 + 0.3)}, 0.25);
      // ===== L19 项目方称，攻击者用泄露的 GitHub secrets，拿到商店的 API Key。
      out("#e3", ${t(LS[19] - 0.2)}); pop("#e4", ${t(LS[19])}, 0.3); pop("#lb-ak", ${t(TM.sec)}, 0.25);
      fadeIn("#ak2w", ${t(TM.api)}, 0.4); out("#ak", ${t(TM.api)}, 0.4); bump("#lb-ak", ${t(TM.api + 0.3)}, 1.12, 1);
      // ===== L20 发布凭证和 CI 密钥，本身就是资金级的资产。
      out("#dr, #lb-dr, #leak", ${t(LS[20] - 0.2)}); fadeIn("#gold", ${t(TM.fund - 0.3)}, 0.4); pop("#lb-fund", ${t(TM.fund)}, 0.3);
      // ===== L21 最后看备份和分片。
      out("#lb-win, #lb-v, #lb-ak, #lb-fund, #gold, #e4", ${t(LS[21] - 0.2)}); cam(${t(LS[21])}, "backupC", 1.2); pop("#lb-ceo", ${t(LS[21] + 1.4)}, 0.25);
      // ===== L22 2023 年 7 月，Multichain 的 MPC 地址出现异常转出，约 1.26 亿美元。
      pop("#e5", ${t(LS[22] + 0.2)}, 0.3); fadeIn("#dbk", ${t(TM.mpc)}, 0.6); pop("#lb-dbk", ${t(TM.mpc + 0.4)}, 0.25);
      // ===== L23 项目方声明，全部 MPC 节点服务器，都在 CEO 的个人云账户上。
      out("#e5, #dbk, #lb-dbk", ${t(LS[23] - 0.2)}); pop("#e6", ${t(LS[23])}, 0.3);
      fadeIn("#cloud", ${t(TM.cloud - 0.3)}, 0.6); pop("#lb-cloud", ${t(TM.cloud)}, 0.3);
      // ===== L24 CEO 被警方带走后，团队无法登录。
      out("#ceo, #lb-ceo", ${t(TM.ceo)}, 0.6);
      ${[0, 1, 2].map((r) => [0, 1, 2].map((u) => `KIT.led(tl, "rk${r}-led-${u}", ${t(TM.login)}, "off");`).join(" ")).join(" ")}
      pop("#lb-lock", ${t(TM.login + 0.2)}, 0.25);
      // ===== L25 外部攻击或内部转移，外界有争议，没有官方定性。
      pop("#lb-disp", ${t(TM.disp - 0.3)}, 0.3);
      // ===== L26 MPC 的前提是分片独立，分片都在一个人手里，门限只是名义上的。
      out("#e6", ${t(LS[26] - 0.2)}); pop("#big31", ${t(TM.nom)}, 0.35); bump("#big31", ${t(TM.nom + 0.6)}, 1.1, 1);
      // ===== L27 分片要放在不同组织、不同地域、不同云账户。
      out("#cloud, #lb-cloud, #big31, #lb-lock, #lb-disp", ${t(LS[27] - 0.2)});
      ${MOVE.map((m, i) => `tl.to("#rk${i}", { x: ${f(m / L.RACKS_C[i].scale)}, duration: 0.9, ease: "power2.inOut" }, ${t(LS[27])});`).join(" ")}
      fadeIn("#sep", ${t(TM.sep[0])}, 0.4);
      ${TM.sep.map((x, i) => `pop("#sep${i}", ${t(x)}, 0.25); ${[0, 1, 2].map((u) => `KIT.led(tl, "rk${i}-led-${u}", ${t(x + 0.1)}, "green");`).join(" ")}`).join("\n      ")}
`,
});
