// hook.mjs — 「整数工坊」在 seg5b 里的摆位。坐标全部 import 自 seg1 的 layout.mjs（只 import 不改）。
//   取整台（CUTTER，seg1 段尾状态：1.5 单位料、拨杆"向下"）+ 计数器（CUT_CTR）—— 做测试的人在这里；
//   金库（VAULT + 出票机）；右区池子（SORTER + POOL + MINI_CUTTER）—— 回到开头在这里；左区抽屉柜和里程表只作远景。
import { at, box, edges, M } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E2 from "../../../ep02/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { CUTTER, CUT_CTR, CUT_CTR_Z, VAULT, SORTER, POOL, MINI_CUTTER, SLOT_CAB, OVF_CTR, OVF_CTR_Z, BRIDGE_ZONE } from "../../seg1/src/layout.mjs";

export { CUTTER, CUT_CTR, VAULT, SORTER, POOL, MINI_CUTTER, BRIDGE_ZONE };
export const FROM_SEG1 = true;

const pedestal = (o, w, d, z) => box(o, -w, w, -d, d, 0, z, M.steel, 1.4);

export function build({ add, items, A }) {
  // 左区远景
  add(E3.slotCabinet, SLOT_CAB, { id: "oc", n: 4 });
  items.push({ Y: at(OVF_CTR)[1], svg: pedestal(OVF_CTR, 170, 34, OVF_CTR_Z) });
  add(E2.rollCounter, OVF_CTR, { id: "oct", digits: 10, z: OVF_CTR_Z }, 0.5);
  // 取整台
  add(X.roundCutter, CUTTER, { id: "rc", dir: "down", stock: 1, chip: 0.5 });
  items.push({ Y: at(CUT_CTR)[1], svg: pedestal(CUT_CTR, 82, 34, CUT_CTR_Z) });
  add(E2.rollCounter, CUT_CTR, { id: "ct", digits: 4, z: CUT_CTR_Z }, 0.5);
  // 金库
  add(O.safe, VAULT, { id: "vault", plate: "ERC-4626" });
  add(X.shareDispenser, X.besideSafe(VAULT), { id: "sd", value: 0, tickets: 0 }, 1);
  // 右区池子：一笔批量交换的分拣机 + 稳定池 + 小取整刀
  add(E1.sorter, SORTER, { id: "hs", letters: 0, sealed: true });
  add(E3.contractMachine, POOL, { id: "hp", name: "POOL" });
  add(X.roundCutter, MINI_CUTTER, { id: "hc", dir: "down", scale: 0.6 });
}

// "一笔交易"线框：罩住分拣机的区块箱和小取整刀（青蓝立方体线框），画在最上层
export function txWire(A) {
  const o = { u: 0, v: 0 };
  const u0 = MINI_CUTTER.u - 150, u1 = SORTER.u + 340, v0 = SORTER.v - 110, v1 = MINI_CUTTER.v + 95;
  A.htx = { top: at(o, u0, v0, 300), corner: at(o, u1, v1, 300), front: at(o, u1, v1, 0), fl: at(o, u0, v1, 300), pts: [at(o, u0, v0, 300), at(o, u1, v1, 0), at(o, u0, v1, 0), at(o, u1, v0, 300)] };
  return `<path id="htx" d="${edges(o, u0, u1, v0, v1, 0, 300)}" fill="rgba(42,163,201,0.05)" stroke="#2aa3c9" stroke-width="4" stroke-dasharray="14 9" stroke-linejoin="round" opacity="0"/>`;
}

export const hookPts = (A) => [A.hs.top, A.hs.ground, at(SORTER, -280, 0, 0), A.hp.top, A.hp.ground, at(POOL, 140, 0, 0), A.hc.top, A.hc.trayL, A.hc.trayR, at(MINI_CUTTER, 0, 110, 0)];
export const panoPts = (A) => [A.vault.top, A.sd.ground, ...hookPts(A)];
