// layout.mjs — ep01/seg2「② 代码就是金库」世界布局（世界坐标 u, v；单位 ≈ px @ 相机 1.0）。
// 售货机（全片主角）在广场中央原点 (0,0)。Web2 / 交易所对照场景放在"屏幕正左方"（u,v 同比 −1 : −0.7），
// 这样三列在一个广角镜头里水平排开。与 seg1 对齐：售货机 = seg1 VEND (0,0)；地面轮廓、Bybit 区直接 import ../../seg1/src/layout.mjs。
export * as S1 from "../../seg1/src/layout.mjs";
import { Wp } from "../../../kit/iso.mjs";

export const VM = { u: 0, v: 0 };
export const CHAIN = { u: -260, v: -330 };
// L3 / L7 的人
export const PPL = {
  pA: { u: 240, v: 200, role: "signer" },
  pB: { u: 480, v: 40, role: "engineer" },
  pC: { u: -20, v: 430, role: "signer" },
  pD: { u: -150, v: 360, role: "engineer" },
  pE: { u: 520, v: -110, role: "signer" },
  pF: { u: 470, v: 330, role: "engineer" },
};
export const ATK = { u: -440, v: 190 };            // 红色攻击者（L7 出现）
export const CLOCK = { u: -380, v: -230 };
export const KEY = { u: -300, v: -110 };           // 升级密钥（维修门旁）
export const MAG = { u: -250, v: -40 };            // 放大镜扫电路图
export const BOOTH = { u: 330, v: 470 };           // 客服岗亭
// L13 外部合约
export const TOK = { u: 380, v: -30 }, DEX = { u: 600, v: -30 }, ORC = { u: 820, v: -30 };
// L14 对照列（屏幕水平方向 = (−1, −0.7)）
export const CEX = { u: -600, v: -420 };
export const WEB2 = { u: -1200, v: -840 };
export const FLASH = { u: -230, v: 340 };
export const CROWD = [{ u: -250, v: 250 }, { u: -330, v: 350 }, { u: -170, v: 360 }];  // 社会共识

export const P = (u, v, z = 0) => Wp(u, v, z);
export const add = (a, b) => ({ u: a.u + b.u, v: a.v + b.v });
