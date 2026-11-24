// hook.mjs — 「收发站」在 seg5b 里的摆位。坐标全部 import 自 seg1 的 src/layout.mjs（只 import 不改）。
//   远景跨链桥（Qubit，seg1 L0–L4 的段尾状态）：桥 + 以太坊侧桥合约 + 金库 + 两条链 + BNB 侧 + 零地址荒地 + 回执签；
//   中心：我们的合约（vending）+ 发货登记台 + 四根调用码头管道和它们通往的四台机器（seg5b L11 回到这里）。
import { at } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import * as LY from "../../seg1/src/layout.mjs";

export const FROM_SEG1 = true;
export const { VEND, DESK, TAG_DOCK, DOCK, PIPES, GAUGE, BRIDGE, BR_ETH, ETH_VAULT, CHAIN_ETH, BR_BNB, CHAIN_BNB, ZERO_LOT, BR_PIPE, TAG_BR } = LY;

const rel = (o, d) => ({ u: o.u + d[0], v: o.v + d[1] });

export function build({ add, items, A }) {
  // ---- 远景 · 跨链桥
  add(E1.bridge, BRIDGE, { id: "br" });
  add(O.chain, CHAIN_ETH, { id: "ce", n: 3 });
  add(O.chain, CHAIN_BNB, { id: "cb", n: 3 });
  add(E3.contractMachine, BR_ETH, { id: "bm", name: "ETH" });
  add(O.hotWallet, ETH_VAULT, { id: "bv", gold: false });
  add(E3.contractMachine, BR_BNB, { id: "bb", name: "BNB" });
  add(X.emptyLot, ZERO_LOT, { id: "hlot", zero: true, scale: 0.8 });
  const bp = E1.pipe(BR_ETH, { id: "bpp", pts: BR_PIPE });
  items.push({ Y: at(BR_ETH)[1] + 1, svg: bp.svg });
  add(X.returnTag, TAG_BR, { id: "htg", face: "empty", stamp: "ok", scale: 1.5 });
  // L10：回执签旁放一台到账台秤（前后余额都是 0）
  add(X.scale, { u: 1150, v: -1200 }, { id: "hsc", before: null, after: null, scale: 0.95 });

  // ---- 中心 · 我们的合约 + 调用码头
  add(E1.vending, VEND, { id: "vm", sign: "OUR CONTRACT" });
  add(X.dispatchDesk, DESK, { id: "dk", shown: 0 });
  add(E1.miniVend, DOCK.token, { id: "dTok", kind: "token" });
  add(X.emptyLot, DOCK.lot, { id: "dLot" });
  add(E3.contractMachine, DOCK.bomb, { id: "dBomb", name: "C" });
  add(E1.miniVend, DOCK.gas, { id: "dGas", kind: "plain" });
  add(E3.gasGauge, GAUGE, { id: "dGg" });
  for (const [k, pts] of Object.entries(PIPES)) {
    const r = E1.pipe(VEND, { id: "pp-" + k, pts });
    items.push({ Y: at(VEND)[1] + 2, svg: r.svg }); A["pp-" + k] = r.anchors;
  }
  add(X.returnTag, TAG_DOCK, { id: "dtg", face: "ok", scale: 1.6 });
  // L11：回程口旁放一台到账台秤
  add(X.scale, { u: 40, v: 320 }, { id: "vsc", before: 1000, after: 1098, diff: "核对余额", diffOk: true, scale: 1.2 });
}

export const hookPts = (A) => [A.br.top, A.br.crown, A.bm.top, A.bm.ground, A.ce.last, A.ce.blocks[0], A.cb.last, A.bb.top, A.bv.ground, A.htg.ground, A.hlot.ground, A.hlot.plateTop];
export const hookLeft = (A) => [A.br.top, A.br.crown, A.bm.top, A.ce.last, A.ce.blocks[0], A.bv.ground, A.htg.ground, A.hlot.ground, A.hlot.plateTop, A.hsc.ground];
export const closePts = (A) => [A.bm.top, A.htg.top, A.htg.ground, A.hlot.ground, A.hlot.plateTop, A.hsc.ground, A.hsc.top];
export const vendPts = (A) => [A.vm.top, A.dk.top, A.dk.ground, A.dTok.top, A.dLot.ground, A.dBomb.top, A.dGas.ground, A.dGg.top, A.vsc.ground, A.dtg.ground];
export const pipeEnds = (A) => ["token", "lot", "bomb", "gas"].map((k) => A["pp-" + k].end);
