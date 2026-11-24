// ep12/seg5「⑤ 防御清单」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
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
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as E4 from "../../../ep04/kit-ext/objects-ext.mjs";
import * as E5 from "../../../ep05/kit-ext/objects-ext.mjs";
import * as E7 from "../../../ep07/kit-ext/objects-ext.mjs";
import * as E9 from "../../../ep09/kit-ext/objects-ext.mjs";
import * as E10 from "../../../ep10/kit-ext/objects-ext.mjs";
import * as E11 from "../../../ep11/kit-ext/objects-ext.mjs";
import * as L from "../../shared/layout.mjs";
import { G as L_G } from "../../../kit/iso.mjs";
// ends static on CAMS.cexF

// ---- 段内专用镜头（给左侧代码卡 / 右侧清单卡让位，或拉近 Merkle 树）
const R = (o, k, s) => L.rect(o, k, s);
const LOCAL = {
  validL: L.fit([...L.VALID.map((q) => R(q, "person")), ...L.VKEYS.map((q) => R(q, "key")), R(L.SMPLATE, "plate24"), R(L.AXPLATE, "plate24"), R(L.METER, "thresholdMeter")], [140, 250, 1300, 760], 1.4),
  chqA: L.fit([R(L.MSG, "cheque"), R(L.VEND, "vending"), R(L.SAFE, "safe"), R(L.USER, "person")], [900, 280, 1820, 860], 1.4),
  eTreeZ: L.fit([R(L.TREE, "merkleTree")], [600, 240, 1320, 740], 2.6),
  eKeyL: L.fit([R(L.SELKEY, "selectorKey"), R(L.PSAFE, "safe"), R(L.WLIST, "padlock")], [840, 300, 1800, 860], 1.4),
  cL: L.fit(L.ZONE_RECTS.C, [800, 260, 1840, 860], 1.4),
};
const S = segInit(import.meta.url, { cams: { ...L.CAMS, ...LOCAL }, ext: [X, E1, E5, E7, E9, E11] });
const { A, put, add, lb, pin, up, LS, LE, w, we } = S;

// 不支持 opts.scale 的物件：绕地面点缩放（lift = 整体上抬），并换算 anchors
const putK = (key, o, r, k, dy = 0, lift = 0, extra = {}) => {
  const [gx, gy] = at(o);
  const sc = (p) => [gx + (p[0] - gx) * k, gy + (p[1] - gy) * k - lift];
  put(key, o, r, dy, { ...extra, wrap: (svg) => `<g transform="translate(${gx},${gy - lift}) scale(${k}) translate(${-gx},${-gy})">${svg}</g>` });
  const isP = (v) => Array.isArray(v) && v.length >= 2 && typeof v[0] === "number";
  for (const n of Object.keys(A[key])) {
    const v = A[key][n];
    if (isP(v)) A[key][n] = sc(v); else if (Array.isArray(v) && v.length && isP(v[0])) A[key][n] = v.map(sc);
  }
};
const P = (o, du = 0, dv = 0, z = 0) => at(o, du, dv, z);
const iso = (pts, attrs) => `<polygon points="${pts.map((p) => p.map((x) => x.toFixed(1)).join(",")).join(" ")}" ${attrs}/>`;

// ---------------------------------------------------------------- 世界物件
// E 档案馆：档案墙（原生 SVG，沿 u 的墙板，正面朝 +v）+ 四个抽屉
{
  const W = L.WALL, H = 120, HL = 600;
  const q = (du, z, dv = 0) => Wp(W.u + du, W.v + dv, z);
  let s = iso([q(-HL, 0), q(HL, 0), q(HL, H), q(-HL, H)], `fill="#f7f3ea" stroke="#cfc7b8" stroke-width="3"`);
  s += iso([q(-HL, H), q(HL, H), q(HL, H, -16), q(-HL, H, -16)], `fill="#e3dccd" stroke="#cfc7b8" stroke-width="2"`);
  for (const du of [-420, -140, 140, 420]) {
    s += iso([q(du - 110, 28), q(du + 110, 28), q(du + 110, 96), q(du - 110, 96)], `fill="#fffaf0" stroke="#b9b0a0" stroke-width="2.5"`);
    const [a, b] = [q(du - 30, 40), q(du + 30, 40)];
    s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#8a8174" stroke-width="5" stroke-linecap="round"/>`;
  }
  add(W, s, -200);
}
const DRAWERS = ["私钥", "验证逻辑", "初始化", "存款伪造"];
DRAWERS.forEach((n, i) => {
  const p = Wp(L.WALL.u + [-420, -140, 140, 420][i], L.WALL.v, 66);
  lb(`dr${i}r`, p, n, "lab-r lab-sm", "c");
  lb(`dr${i}g`, p, n, "lab-gs lab-sm", "c");
});
put("mt", L.TREE, X.merkleTree(L.TREE, { id: "mt", path: true }));   // seg4 末帧：根 "0x00" 红 + 红虚线框，路径青蓝亮着
put("wsig", L.WSIG, E2.proofCard(L.WSIG, { id: "wsig", missing: true }));
put("sysacc", L.SYSACC, O.doc(L.SYSACC, { id: "sysacc", standing: true, title: "系统账户" }));
put("selk", L.SELKEY, E3.selectorKey(L.SELKEY, { id: "selk", name: "替换公钥" }));
putK("psafe", L.PSAFE, O.safe(L.PSAFE, { id: "psafe" }), 0.6);
put("wl", L.WLIST, O.padlock(L.WLIST, { id: "wl", glow: true }));
put("lot", L.LOT, E7.emptyLot(L.LOT, { id: "lot", zero: true, scale: 0.6 }));
put("rtE", L.RTAGE, E7.returnTag(L.RTAGE, { id: "rtE", face: "ok" }));
L.RPCS.forEach((q, i) => { put(`rpc${i}`, q, O.rpc(q, { id: `rpc${i}` }));
  add(q, `<g id="rpcR${i}">${O.rpc(q, { id: `rpcr${i}`, state: "attacker" }).svg}</g>`, 1); });   // seg4 末帧：两台 RPC 是红的
// seg4 末帧的冗余状态：第三台 RPC + 两个新验证者 + 两把（已拉下的）闸刀 + 被拦下的第二封红信封
const ePt = (dX, dY) => { const q = L_G(-1900 + dX, -1100 + dY); return { u: Math.round(q.u), v: Math.round(q.v) }; };
put("rpc2", ePt(-260, 330), O.rpc(ePt(-260, 330), { id: "rpc2" }));
[ePt(260, 470), ePt(420, 470)].forEach((q, i) => put(`vn${i}`, q, O.person(q, { id: `vn${i}`, role: "engineer", scale: 0.7 })));
putK("ksw", ePt(-840, 20), O.knifeSwitch(ePt(-840, 20), { id: "ksw", on: false }), 0.6);
putK("ksw2", ePt(720, 330), O.knifeSwitch(ePt(720, 330), { id: "ksw2", on: false }), 0.5);
{ const rs = at(L.RSETH), EL2 = L_G(rs[0] - 70, rs[1] + 45);
  add(EL2, `<g id="el2w">${E1.letter(EL2, { id: "el2", state: "attacker" }).svg}</g>`, 2); }
put("vE", L.VALIDE, O.person(L.VALIDE, { id: "vE", role: "engineer", scale: 0.7 }));
put("rseth", L.RSETH, E1.miniVend(L.RSETH, { id: "rseth", kind: "token", label: "rsETH", scale: 0.6 }));

// B 桥与验证者平台
put("br", L.BRIDGE, E1.bridge(L.BRIDGE, { id: "br", river: 170 }), -300);
put("pf", L.BOOTH_PROOF, E2.proofCard(L.BOOTH_PROOF, { id: "pf" }));
{ // 三色地块（L2 才出现）+ Sky Mavis 虚线框（开场可见，L2 散开）
  const V0 = L.VALID[0];
  const tile = (i, col) => iso([at(V0, 240 * i - 105, -110), at(V0, 240 * i + 105, -110), at(V0, 240 * i + 105, 510), at(V0, 240 * i - 105, 510)],
    `fill="${col}" fill-opacity="0.28" stroke="${col}" stroke-width="3"`);
  add(V0, S.hid("tiles", tile(0, "#2aa3c9") + tile(1, "#1f9d55") + tile(2, "#8a7f6e")), -400);
  add(V0, `<g id="smf">${iso([at(V0, -120, -110), at(V0, 360, -110), at(V0, 360, 310), at(V0, -120, 310)], `fill="none" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="14 10"`)}</g>`, -390);
}
L.VALID.forEach((q, i) => put(`v${i}`, q, O.person(q, { id: `v${i}`, role: "signer", scale: 0.6 })));
L.VKEYS.forEach((q, i) => putK(`k${i}`, q, O.key(q, { id: `k${i}` }), 0.4, 2, q.lift));
put("smp", L.SMPLATE, E1.signBoard(L.SMPLATE, { id: "smp", style: "plate", text: "Sky Mavis", size: 24 }));
put("axp", L.AXPLATE, E1.signBoard(L.AXPLATE, { id: "axp", style: "plate", text: "Axie DAO 授权", size: 24 }));
put("mtr", L.METER, E5.thresholdMeter(L.METER, { id: "mtr", max: 9, th: 5, level: 5, thText: " " }));
put("rel", L.RELAYER, O.person(L.RELAYER, { id: "rel", role: "engineer", scale: 0.7 }));

// A 金库
put("vm", L.VEND, E1.vending(L.VEND, { id: "vm", scale: 0.8, sign: "桥合约 · A 链" }));
put("sf", L.SAFE, O.safe(L.SAFE, { id: "sf", gold: true }));
put("usr", L.USER, O.person(L.USER, { id: "usr", role: "signer", scale: 0.8 }));
put("chA", L.CHAINA, O.chain(L.CHAINA, { id: "chA", n: 4, title: "A 链" }));
put("chq", L.MSG, E9.cheque(L.MSG, { id: "chq", scale: 0.8, title: "消息", labels: ["源链", "源合约", "目标链", "目标合约", "序号"],
  vals: ["A", "0xA1…", "B", "0xB2…", "#7"], fields: ["blank", "blank", "blank", "blank", "blank"], amount: "100" }));

// C 铸币与对账
put("chB", L.CHAINB, O.chain(L.CHAINB, { id: "chB", n: 4, title: "B 链" }));
put("mp", L.MINTB, E11.mintPress(L.MINTB, { id: "mp", scale: 0.8, plate: "映射代币" }));
put("bal", L.BAL, E1.balance(L.BAL, { id: "bal", tilt: 6 }));
put("ks", L.SWITCH, O.knifeSwitch(L.SWITCH, { id: "ks", on: true, text: "自动暂停" }));
put("bcn", L.BEACON, O.beacon(L.BEACON, { id: "bcn" }));
put("q", L.QUEUE, E1.mempool(L.QUEUE, { id: "q", n: L.QLETTERS, sign: "延迟队列" }));
const BIGL = { u: L.MINTB.u + 110, v: L.MINTB.v + 130 };
put("bigL", BIGL, E1.letter(BIGL, { id: "bigL", w: 88, h: 58 }), 400);
{ // 两列点阵：锁定（左）/ 铸造（右，多出两行红点）
  const [ox, oy] = at(L.DOTSC), dots = (x0, rows, col, y0 = 0) => {
    let s = ""; for (let r = 0; r < rows; r++) for (let c = 0; c < 4; c++) s += `<circle cx="${ox + x0 + c * 14}" cy="${oy + 136 - y0 - r * 14}" r="5" fill="${col}"/>`; return s; };
  add(L.DOTSC, S.hid("dotL", dots(10, 8, "#2aa3c9")) + S.hid("dotM", dots(200, 8, "#2aa3c9")) + S.hid("dotR", dots(200, 3, "#e0453a", 8 * 14)), 60);
  lb("lb-dotL", [ox, oy + 90], "锁定", "lab-cs lab-sm", "r");
  lb("lb-dotM", [ox + 262, oy + 90], "铸造", "lab-cs lab-sm", "l");
}

// D 展台（远景带过）+ 升级角
const STXT = ["多签 / MPC", "轻客户端", "乐观证明", "零知识证明"];
L.STALLS.forEach((q, i) => put(`st${i}`, q, E1.signBoard(q, { id: `st${i}`, style: "plate", text: STXT[i], size: 30 })));
putK("msD", L.MSIGD, E5.thresholdMeter(L.MSIGD, { id: "msD", max: 5, th: 3, thText: "M/N" }), 0.7);
put("sealD", L.SEALD, O.seal(L.SEALD, { id: "sealD" }));
put("hdD", L.HEADERS, O.ledgerBook(L.HEADERS, { id: "hdD", scale: 0.7 }));
put("magD", L.MAGD, O.magnifier(L.MAGD, { id: "magD" }));
put("hgD", L.HOURD, O.hourglass(L.HOURD, { id: "hgD" }));
put("chD", L.CHALLENGER, O.person(L.CHALLENGER, { id: "chD", role: "signer", scale: 0.6 }));
put("bcD", L.BEACOND, O.beacon(L.BEACOND, { id: "bcD" }));
put("zkD", L.ZKPROOF, E2.proofCard(L.ZKPROOF, { id: "zkD", text: "ZK 证明" }));
putK("cvD", L.CURVE, E2.curveBoard(L.CURVE, { id: "cvD" }), 0.6);
putK("core", L.COREM, E10.coreModule(L.COREM, { id: "core", ver: "V2" }), 0.6);
put("upk", L.UPKEY, O.key(L.UPKEY, { id: "upk", state: "attacker", stand: true }));
put("tlk", L.TLOCKD, E1.timeLock(L.TLOCKD, { id: "tlk", frac: 1 }), 0, { grow: true });

// F 交易所充值柜台
put("tc", L.TELLER, E4.tellerCounter(L.TELLER, { id: "tc", scale: 0.8, sign: "充值" }));
put("ldF", L.LEDGERF, O.ledgerBook(L.LEDGERF, { id: "ldF", scale: 0.8 }));
const CT5 = { u: L.CHAINT.u + 180, v: L.CHAINT.v };       // n 5、居中：前 3 块正好落在 CHAINT 的 3 块上，后 2 块 L17 才长出
put("ct", CT5, O.chain(CT5, { id: "ct", n: 5, title: "TRON" }));
put("fake", L.FAKE, E7.oddCoin(L.FAKE, { id: "fake", scale: 0.8, state: "attacker" }));
const REAL = { u: L.FAKE.u - 110, v: L.FAKE.v + 40 };
put("real", REAL, E7.oddCoin(REAL, { id: "real", scale: 0.8 }));
put("rtF", L.RTAGF, E7.returnTag(L.RTAGF, { id: "rtF", face: "empty", scale: 1.3 }));
put("idem", L.IDEM, E9.cheque(L.IDEM, { id: "idem", scale: 0.6, title: "幂等键", labels: ["交易哈希", "日志序号", "", "", ""],
  vals: ["0x9f…", "#3", "", "", ""], fields: ["blank", "blank", "blank", "blank", "blank"], amount: "100" }));
put("hgF", L.CONFS, O.hourglass(L.CONFS, { id: "hgF" }));
const FL0 = { u: L.CHAINT.u - 120, v: L.CHAINT.v + 120 };
put("fl", FL0, E1.letter(FL0, { id: "fl" }), 300);
{ // TRON 中间一块：失败交易（红虚线框 + 红叉）
  const b = { u: L.CHAINT.u, v: L.CHAINT.v }, z0 = 0, z1 = 112, r = 62;
  const fr = iso([at(b, -r, r, z0), at(b, r, r, z0), at(b, r, r, z1), at(b, -r, r, z1)], `fill="#e0453a" fill-opacity="0.18" stroke="#e0453a" stroke-width="4" stroke-dasharray="12 8"`);
  const [cx, cy] = at(b, 0, r, z1 / 2);
  add(b, S.hid("ctBad", fr + `<path d="M${cx - 18} ${cy - 18}L${cx + 18} ${cy + 18}M${cx + 18} ${cy - 18}L${cx - 18} ${cy + 18}" stroke="#e0453a" stroke-width="7" stroke-linecap="round"/>`), 120);
}

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
// B
lb("lb-5of9", A.mtr.th, "5/9", "lab-cs lab-sm", "l");
const TH_DY = A.mtr.levels[7][1] - A.mtr.levels[5][1];
lb("lb-23", [A.mtr.th[0], A.mtr.th[1] + TH_DY], "&gt; 2/3", "lab-gs lab-sm", "l");
const V0 = L.VALID[0];
lb("lb-t0", at(V0, 0, 540), "不同组织", "lab-cs lab-sm", "t");
lb("lb-t1", at(V0, 240, 540), "不同地域", "lab-gs lab-sm", "t");
lb("lb-t2", at(V0, 480, 540), "不同基础设施", "lab-ink lab-sm", "t");
// A
lb("lb-chk", up(A.chq.top, 10), "目标侧逐项核对", "lab-gs lab-sm");
lb("lb-done", A.chq.copies[0], "已处理 ✕", "lab-rs lab-sm", "l");
// E 树
lb("lb-aud", up(A.mt.mids[0], 0), "独立审计", "lab-cs lab-sm", "r");
lb("lb-tv", A.mt.leaves[0], "测试向量", "lab-cs lab-sm", "r");
lb("lb-zero", A.mt.root, "零值 ≠ 证明", "lab-rs lab-sm", "l");
A.mt.leaves.forEach((p, i) => lb(`lb-lf${i}`, [p[0], p[1] + 34 + (i % 2) * 60], "0x00", "lab-cs lab-sm", "t"));
lb("lb-md0", [A.mt.mids[0][0] - 40, A.mt.mids[0][1]], "0x01", "lab-ink lab-sm", "r");
lb("lb-md1", [A.mt.mids[1][0] + 40, A.mt.mids[1][1]], "0x01", "lab-ink lab-sm", "l");
lb("lb-pre", up(A.mt.top, 6), "哈希前缀不同", "lab-ink lab-sm");
// E 白名单
lb("lb-wl", up(A.wl.top, 8), "白名单", "lab-gs lab-sm");
lb("lb-ps", up(A.psafe.top, 8), "特权合约 · 禁止", "lab-rs lab-sm");
// C
lb("lb-cap", A.mp.limit, "单笔 / 每日上限", "lab-cs lab-sm", "l");
lb("lb-qd", up(A.q.sign, 30), "超额 → 延迟队列", "lab-cs lab-sm");
lb("lb-bl", A.bal.panL, "A 链锁定", "lab-cs lab-sm", "r");
lb("lb-br", A.bal.panR, "B 链铸造", "lab-cs lab-sm", "l");
lb("lb-stop", up(A.ks.top, 8), "自动暂停", "lab-rs lab-sm");
// D
lb("lb-upk", up(A.upk.top, 6), "升级权限", "lab-rs lab-sm", "r");
lb("lb-tlk", up(A.tlk.top, 8), "时间锁", "lab-cs lab-sm");
lb("lb-init", up(A.core.top, 8), "初始化参数：审计", "lab-gs lab-sm");
// F
lb("lb-cex", up(A.tc.top, 8), "交易所充值", "lab-ink");
lb("lb-led1", up(A.ldF.top, 6), "入账", "lab-gs lab-sm");
lb("lb-bridge", up(A.tc.top, 8), "也是一座桥", "lab-cs lab-sm");
lb("lb-usdtR", up(A.real.top, 6), "USDT", "lab-ink lab-sm", "r");
lb("lb-usdtF", up(A.fake.top, 6), "USDT", "lab-ink lab-sm", "l");
lb("lb-addrR", [A.real.ground[0], A.real.ground[1] + 10], "地址 ✓", "lab-gs lab-sm", "r");
lb("lb-addrF", [A.fake.ground[0], A.fake.ground[1] + 10], "地址 ✕", "lab-rs lab-sm", "l");
lb("lb-fail", up(A.rtF.top, 6), "失败", "lab-rs lab-sm");
lb("lb-ok", up(A.rtF.top, 6), "成功", "lab-gs lab-sm");
lb("lb-energy", up(A.ct.blocks?.[1] ?? A.ct.top, 70), `能量不足 · 仍有交易哈希 ${gtag("公开资料")}`, "lab-r lab-sm");
lb("lb-fake1", up(A.ldF.top, 6), "假充值", "lab-rs lab-sm");
lb("lb-fake2", up(A.ldF.top, 6), "<s>假充值</s>", "lab-r lab-sm");
lb("lb-idem", up(A.idem.top, 8), "交易哈希 + 日志序号", "lab-cs lab-sm");
lb("lb-dup", A.idem.copies[0], "重复 ✕", "lab-rs lab-sm", "l");
lb("lb-conf", up(A.hgF.top, 8), "确认数", "lab-cs lab-sm");
lb("lb-led2", up(A.ldF.top, 6), "等够确认再入账 ✓", "lab-gs lab-sm");

// ---------------------------------------------------------------- 屏幕层卡片
const CA = { x: 60, y: 280, w: 790 }, CC = { x: 60, y: 330, w: 740 }, CD = { x: 60, y: 300, w: 760 };
const cardA = codeCard("cA", { ...CA, mono: true, head: "消息与验证", tag: "示意", rows: [
  { html: "msg = (srcChain, srcBridge,", chip: "五项", chipCls: "ok" },
  "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;dstChain, dstBridge, nonce)",
  "require(verifyProof(hash(msg), proof));",
  { html: "require(!processed[hash(msg)]);", chip: "防重放", chipCls: "ok" },
  "require(msg.srcBridge == trustedSource);",
  "processed[hash(msg)] = true;"] });
const cardC = codeCard("cC", { ...CC, mono: true, head: "消息执行", tag: "示意", rows: [
  { html: "target.call(msg.calldata);", chip: "任意目标", chipCls: "x" },
  { html: "require(okTarget[to] &amp;&amp; okFn[sel]);", chip: "白名单", chipCls: "ok" }] });
const cardD = codeCard("cD", { ...CD, mono: true, head: "限额与对账", tag: "示意", rows: [
  "require(amount &lt;= perTxCap);",
  { html: "require(outToday + amount &lt;= dailyCap);", chip: "否则延迟", chipCls: "ok" },
  { html: "assert(lockedOnA &gt;= mintedOnB);", chip: "否则暂停", chipCls: "x" }] });
const edge = (C, i) => [C.x + C.w + 4, codeRowY(C.y, i)];
S.curve("cvA0", edge(CA, 0), S.scr("chqA", A.chq.top), { color: "#2aa3c9" });
S.curve("cvC1", edge(CC, 1), S.scr("eKeyL", A.wl.top), { color: "#1f9d55" });
S.curve("cvD0", edge(CD, 1), S.scr("cL", A.mp.limit), { color: "#2aa3c9" });
S.curve("cvD2", edge(CD, 2), S.scr("cL", A.bal.top), { color: "#e0453a" });
const html = cardA + cardC + cardD
  + ck("ckList", "签名权清单 · 定期核对", { x: 1360, y: 330, w: 480, kind: "g" })
  + kw("kw-red", `数量 + 来源 <b>都要冗余</b>`, { x: 1180, y: 763, size: 48, accent: "#1f9d55", hide: false })
  + kw("kwAddr", `看<b>合约地址</b> 不看名称`, { x: 560, y: 150, size: 40 });
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {
  th: w("三分之二", 1), org: w("组织", 2), geo: w("地域", 2), inf: w("基础设施", 2), list: w("签名权清单", 2),
  f: ["源链", "源合约", "目标链", "目标合约", "序号"].map((x) => w(x, 3)), chk: w("逐项核对", 3),
  mark: w("标记", 4), replay: w("重放", 4),
  aud: w("独立审计", 5), tv: w("测试向量", 5), zero: w("零值", 5),
  leaf: w("叶子", 6), mid: w("中间节点", 6), pre: w("哈希前缀", 6),
  wl: w("白名单", 7), priv: w("特权合约", 7),
  cap: w("上限", 8), queue: w("延迟队列", 8),
  lock: w("锁定", 9), off: w("对不上", 9), pause: w("自动暂停", 9),
  tlk: w("时间锁", 10), init: w("初始化参数", 10),
  cex: w("交易所", 11), tx: w("转账", 12), led: w("账本", 12), br: w("一座桥", 12),
  same: w("同名", 13), addr: w("合约地址", 13),
  energy: w("能量不足", 14), hash: w("交易哈希", 14),
  fake: w("假充值", 15), ok: w("成功", 15),
  idem: w("幂等键", 16), dup: w("重复入账", 16),
  conf: w("确认数", 17), reorg: w("重组", 17),
};
const t = (x) => f(x);

S.build({
  cam0: "eRpc", sub: "把根因倒过来",
  grid: { u0: -3600, u1: 4200, v0: -2600, v1: 2600 }, box: [-3200, -1800, 8400, 3800],   // 按本段镜头覆盖的范围调
  shown: ["#dr0r", "#dr1r", "#dr2r", "#dr3r", "#lb-5of9"], css, html,
  terms: [
    { id: "t0", t: "测试向量", d: "已知输入和正确输出的测试样例", at: w("测试向量", 5) },
    { id: "t1", t: "假充值", d: "把失败或伪造的转账误记为充值", at: w("假充值", 15) },
    { id: "t2", t: "幂等键", d: "保证同一笔只处理一次的唯一标识", at: w("幂等键", 16) },
    { id: "t3", t: "重组", d: "链回滚最近的区块，换成另一条分叉", at: w("重组", 17) },
  ],
  // end: 只有全集最后一段才有结束卡
  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
      tl.set("#tiles", { opacity: 0 }, 0); tl.set("#bigL, #fl", { opacity: 0 }, 0);
      tl.set("#ct-b3, #ct-b4, #ct-l2, #ct-l3", { opacity: 0 }, 0); tl.set("#wl-glow", { opacity: 0 }, 0);
      X12.rootText(tl, "mt", 0, "0x00", "red"); X12.rootState(tl, "mt", 0, "bad", 0.01);
      // ===== L0 把这些根因倒过来，就是防御。（首个镜头移动中收掉 seg4 的末帧残留：红 RPC、被拦信封、冗余关键词卡）
      out("#kw-red", ${t(LS[0] - 0.2)}, 0.3);
      cam(${t(LS[0])}, "filesE", 1.2); out("#rpcR0, #rpcR1, #el2w", ${t(LS[0] + 0.2)}, 0.6);
      [0, 1, 2, 3].forEach((i) => { out("#dr" + i + "r", ${t(LS[0] + 1.0)} + i * 0.45, 0.2); pop("#dr" + i + "g", ${t(LS[0] + 1.05)} + i * 0.45, 0.25); });
      // ===== L1 先看验证者。门限要高于三分之二。
      out("#dr0g, #dr1g, #dr2g, #dr3g", ${t(LS[1] - 0.2)}, 0.2);
      cam(${t(LS[1])}, "validL", 1.4);
      out("#lb-5of9", ${t(TM.th - 0.1)}, 0.2);
      tl.to("#mtr-th", { y: ${TH_DY.toFixed(1)}, duration: 0.6, ease: "power2.inOut" }, ${t(TM.th)});
      X5.fill(tl, "mtr", ${t(TM.th + 0.2)}, 7, 0.8);
      pop("#lb-23", ${t(TM.th + 0.6)}, 0.25);
      // ===== L2 签名人在组织、地域和基础设施上都要独立，并且定期核对签名权清单。
      tl.to("#smf", { opacity: 0, scale: 1.25, transformOrigin: "50% 50%", duration: 0.6 }, ${t(LS[2] + 0.2)});
      fadeIn("#tiles", ${t(TM.org - 0.2)}, 0.5);
      pop("#lb-t0", ${t(TM.org)}, 0.25); pop("#lb-t1", ${t(TM.geo)}, 0.25); pop("#lb-t2", ${t(TM.inf)}, 0.25);
      pop("#ckList", ${t(TM.list - 0.5)}, 0.3); bump("#ckList-i", ${t(TM.list + 0.5)}, 1.3, 1);
      // ===== L3 再看消息。消息里要写明源链、源合约、目标链、目标合约和序号，目标侧逐项核对。
      out("#lb-23, #lb-t0, #lb-t1, #lb-t2", ${t(LS[3] - 0.2)}, 0.2); out("#ckList", ${t(LS[3] + 0.3)}, 0.2);
      cam(${t(LS[3])}, "chqA", 1.4);
      pop("#cA", ${t(LS[3] + 1.2)}, 0.3); hot("#cA-r0", ${t(TM.f[0] - 0.1)}, "#d7f0f7"); draw("cvA0", ${t(TM.f[0])}, 0.6);
      ${TM.f.map((x, i) => `X9.field(tl, "chq", ${f(x)}, ${i}, "filled");`).join(" ")}
      pop("#cA-c0", ${t(TM.chk)}, 0.25); pop("#lb-chk", ${t(TM.chk)}, 0.25);
      // ===== L4 处理过的消息要打上标记，防止重放。
      out("#cvA0, #lb-chk", ${t(LS[4] - 0.1)}, 0.2);
      hot("#cA-r5", ${t(TM.mark)}, "#d7f0f7"); hot("#cA-r3", ${t(TM.replay - 0.3)}, "#d7f0f7");
      X9.copies(tl, "chq", ${t(TM.replay - 0.3)}, 1, 0.5); X9.copyRed(tl, "chq", ${t(TM.replay + 0.1)}, true);
      pop("#lb-done", ${t(TM.replay + 0.2)}, 0.25); pop("#cA-c3", ${t(TM.replay + 0.3)}, 0.25);
      // ===== L5 证明验证代码要有独立审计和测试向量。零值、空数组、没初始化的根，都不能当作有效证明。
      out("#cA, #lb-done", ${t(LS[5] - 0.2)}, 0.2);
      cam(${t(LS[5])}, "eTreeZ", 1.6);
      pop("#lb-aud", ${t(TM.aud)}, 0.25); pop("#lb-tv", ${t(TM.tv)}, 0.25);
      bump("#mt", ${t(TM.zero)}, 1.04, 1);
      pop("#lb-zero", ${t(TM.zero + 0.5)}, 0.25);
      // ===== L6 Merkle 树的叶子和中间节点，要用不同的哈希前缀。
      out("#lb-aud, #lb-tv, #lb-zero", ${t(LS[6] - 0.2)}, 0.2);
      X12.rootState(tl, "mt", ${t(LS[6])}, "normal"); X12.rootText(tl, "mt", ${t(LS[6])}, "根");
      [0, 1, 2, 3].forEach((i) => pop("#lb-lf" + i, ${t(TM.leaf)} + i * 0.12, 0.25));
      pop("#lb-md0", ${t(TM.mid)}, 0.25); pop("#lb-md1", ${t(TM.mid + 0.12)}, 0.25);
      X12.path(tl, "mt", ${t(LS[6])}, false, 0.2); X12.path(tl, "mt", ${t(TM.pre - 0.3)}, true, 0.8); pop("#lb-pre", ${t(TM.pre)}, 0.25);
      // ===== L7 执行消息时，目标地址和函数走白名单，不许碰特权合约。
      out("#lb-lf0, #lb-lf1, #lb-lf2, #lb-lf3, #lb-md0, #lb-md1, #lb-pre", ${t(LS[7] - 0.2)}, 0.2);
      cam(${t(LS[7])}, "eKeyL", 1.2);
      pop("#cC", ${t(LS[7] + 0.9)}, 0.3); pop("#cC-c0", ${t(LS[7] + 1.2)}, 0.25);
      hot("#cC-r1", ${t(TM.wl - 0.2)}, "#d8f1e2"); draw("cvC1", ${t(TM.wl)}, 0.6); pop("#cC-c1", ${t(TM.wl + 0.2)}, 0.25);
      fadeIn("#wl-glow", ${t(TM.wl + 0.5)}, 0.4); pop("#lb-wl", ${t(TM.wl + 0.5)}, 0.25);
      pop("#lb-ps", ${t(TM.priv)}, 0.25);
      // ===== L8 然后是限额。单笔和单位时间的提款都有上限，超过就进延迟队列。
      out("#cC, #cvC1, #lb-wl, #lb-ps", ${t(LS[8] - 0.2)}, 0.2);
      cam(${t(LS[8])}, "cL", 1.6);
      pop("#cD", ${t(LS[8] + 1.2)}, 0.3); hot("#cD-r0", ${t(TM.cap - 0.6)}, "#d7f0f7"); hot("#cD-r1", ${t(TM.cap - 0.2)}, "#d7f0f7");
      draw("cvD0", ${t(TM.cap)}, 0.5); X11.limit(tl, "mp", ${t(TM.cap + 0.3)}, true); pop("#lb-cap", ${t(TM.cap + 0.4)}, 0.25);
      fadeIn("#bigL", ${t(TM.cap + 0.6)}, 0.3);
      X1.walk(tl, "bigL", ${t(TM.queue - 0.6)}, 1.4, ${JSON.stringify([A.q.entry, ...A.q.route.slice(0, 3)].map((p) => p.map((v) => Math.round(v))))});
      pop("#cD-c1", ${t(TM.queue)}, 0.25); pop("#lb-qd", ${t(TM.queue + 0.2)}, 0.25);
      // ===== L9 监控两侧的总量。A 链锁定的，要不少于 B 链铸造的。对不上，就自动暂停。
      out("#cvD0, #lb-cap, #lb-qd", ${t(LS[9] - 0.1)}, 0.2);
      hot("#cD-r2", ${t(LS[9] + 0.2)}, "#d7f0f7"); draw("cvD2", ${t(LS[9] + 0.3)}, 0.5);
      pop("#lb-bl", ${t(LS[9] + 0.5)}, 0.25); pop("#lb-br", ${t(LS[9] + 0.6)}, 0.25);
      fadeIn("#dotL", ${t(TM.lock - 0.2)}, 0.4); pop("#lb-dotL", ${t(TM.lock)}, 0.25);
      fadeIn("#dotM", ${t(TM.lock + 0.8)}, 0.4); pop("#lb-dotM", ${t(TM.lock + 1.0)}, 0.25);
      fadeIn("#dotR", ${t(TM.off)}, 0.3); X1.tilt(tl, "bal", ${t(TM.off + 0.2)}, -16, 0.6); pop("#cD-c2", ${t(TM.off + 0.3)}, 0.25);
      KIT.beacon(tl, "bcn", ${t(TM.off + 0.4)}, 2.4, 0.8);
      KIT.toggle(tl, "ks", ${t(TM.pause)}, false); X11.lamp(tl, "mp", ${t(TM.pause + 0.2)}, "red"); pop("#lb-stop", ${t(TM.pause + 0.3)}, 0.25);
      // ===== L10 最后是升级。桥合约升级必须经过时间锁，初始化参数必须审计。
      out("#cD, #cvD2, #lb-bl, #lb-br, #lb-dotL, #lb-dotM, #lb-stop", ${t(LS[10] - 0.2)}, 0.2);
      cam(${t(LS[10])}, "upgrade", 1.6);
      pop("#lb-upk", ${t(LS[10] + 1.6)}, 0.25);
      grow("tlk", ${t(TM.tlk - 0.2)}); pop("#lb-tlk", ${t(TM.tlk + 0.3)}, 0.25); X1.countdown(tl, "tlk", ${t(TM.tlk + 0.6)}, 2.0, 0.4);
      pop("#lb-init", ${t(TM.init)}, 0.25);
      // ===== L11 同样的问题，也出现在交易所的充值系统里。
      out("#lb-upk, #lb-tlk, #lb-init", ${t(LS[11] - 0.2)}, 0.2);
      cam(${t(LS[11])}, "cexF", 1.6);
      pop("#lb-cex", ${t(TM.cex + 0.3)}, 0.3); bump("#lb-cex", ${t(TM.cex + 0.9)}, 1.12, 1);
      // ===== L12 交易所相信链上发生了一笔转账，然后在内部账本上记账。这也是一座桥。
      fadeIn("#fl", ${t(TM.tx - 0.3)}, 0.3);
      X1.walk(tl, "fl", ${t(TM.tx)}, 1.6, ${JSON.stringify([at(L.TELLER, 60, 120)].map((p) => p.map((v) => Math.round(v))))});
      out("#fl", ${t(TM.led - 0.2)}, 0.3); pop("#lb-led1", ${t(TM.led + 0.2)}, 0.25);
      out("#lb-cex", ${t(TM.br - 0.2)}, 0.2); pop("#lb-bridge", ${t(TM.br)}, 0.25);
      // ===== L13 假币合约会发出同名的转账事件。所以要核对代币合约地址，不看名称和符号。
      out("#lb-cex, #lb-led1, #lb-bridge", ${t(LS[13] - 0.2)}, 0.2);
      cam(${t(LS[13])}, "cexTag", 1.4);
      pop("#lb-usdtR", ${t(TM.same)}, 0.25); pop("#lb-usdtF", ${t(TM.same + 0.1)}, 0.25);
      pop("#lb-addrR", ${t(TM.addr)}, 0.25); pop("#lb-addrF", ${t(TM.addr + 0.15)}, 0.25);
      pop("#kwAddr", ${t(TM.addr + 0.5)}, 0.3);
      // ===== L14 在 TRON 上，转账失败的交易，比如能量不足，仍然会上链，也有交易哈希。
      out("#lb-usdtR, #lb-usdtF, #lb-addrR, #lb-addrF, #kwAddr", ${t(LS[14] - 0.2)}, 0.2);
      fadeIn("#ctBad", ${t(LS[14] + 1.0)}, 0.4);
      X7.tagFace(tl, "rtF", ${t(LS[14] + 1.4)}, "false"); pop("#lb-fail", ${t(LS[14] + 1.6)}, 0.25);
      pop("#lb-energy", ${t(TM.energy)}, 0.3);
      // ===== L15 只看交易存在就入账，就会出现假充值。要先确认回执状态是成功，再看事件。
      out("#lb-energy", ${t(LS[15] - 0.2)}, 0.2);
      cam(${t(LS[15])}, "cexF", 1.2);
      pop("#lb-fake1", ${t(TM.fake)}, 0.25); out("#lb-fake1", ${t(TM.fake + 1.4)}, 0.15); pop("#lb-fake2", ${t(TM.fake + 1.5)}, 0.25);
      out("#lb-fail", ${t(TM.ok - 0.3)}, 0.2); X7.tagFace(tl, "rtF", ${t(TM.ok - 0.2)}, "ok"); pop("#lb-ok", ${t(TM.ok)}, 0.25);
      X7.tagStamp(tl, "rtF", ${t(TM.ok + 0.4)}, "ok");
      // ===== L16 同一笔交易，用交易哈希加日志序号做幂等键，防止重复入账。
      out("#lb-fake2, #lb-ok, #ctBad", ${t(LS[16] - 0.2)}, 0.2);
      X9.fields(tl, "idem", ${t(LS[16] + 0.8)}, ["filled", "filled", null, null, null], 0.4); pop("#lb-idem", ${t(LS[16] + 1.0)}, 0.25);
      X9.copies(tl, "idem", ${t(TM.dup - 0.3)}, 1, 0.5); X9.copyRed(tl, "idem", ${t(TM.dup + 0.1)}, true); pop("#lb-dup", ${t(TM.dup + 0.2)}, 0.25);
      // ===== L17 入账前等够确认数，防止源链重组把这笔交易抹掉。
      out("#lb-idem, #lb-dup", ${t(LS[17] - 0.2)}, 0.2);
      pop("#lb-conf", ${t(TM.conf)}, 0.25); KIT.sand(tl, "hgF", ${t(TM.conf + 0.2)}, 2.2);
      fadeIn("#ct-l2, #ct-b3", ${t(TM.conf + 0.6)}, 0.4); fadeIn("#ct-l3, #ct-b4", ${t(TM.conf + 1.3)}, 0.4);
      pop("#lb-led2", ${t(TM.reorg + 0.6)}, 0.3);
`,
});
