// layout.mjs — ep07/seg3「③ 怪代币」world positions, aligned with the episode world fixed by seg1 (../../seg1/src/layout.mjs):
// 我们的合约 VEND 在世界原点，发货登记台 DESK 在它 +u 侧；中区·代币陈列架以 SHELF_ZONE 为中心，收税存款台在陈列架正下方（前方）。
// 本段自有的位置用"屏幕地面坐标"写：P(x, y) = 倍率 1 时世界画布上的地面点 (x, y)；G 是线性的。
import { G, Wp } from "../../../kit/iso.mjs";
import { VEND, DESK, SHELF_ZONE } from "../../seg1/src/layout.mjs";

const add = (b, d) => ({ u: b.u + d.u, v: b.v + d.v });
const SZ = Wp(SHELF_ZONE.u, SHELF_ZONE.v, 0);    // ≈ (1139, 29)
const P = (x, y) => G(SZ[0] + x, SZ[1] + y);       // relative to the shelf zone, screen-ground px
const S = (b, x, y) => add(b, G(x, y));            // screen-ground offset from a world point

export { VEND, DESK };
const TAXU = P(-640, 820);
const SAFE = add(TAXU, { u: 700, v: 0 });
const SCALE_X = add(SAFE, { u: 0, v: 230 });
export const LY = {
  VEND, DESK,
  // 中区·代币陈列架：八个白色展台一字排开（屏幕上从左到右，略向前），每台一枚 oddCoin
  COINS: Array.from({ length: 8 }, (_, i) => P(-480 + 190 * i, -40 + 20 * i)),
  PLAIN: P(170, 230),                 // L1 标准 ERC-20 硬币（大号，陈列架正前方）
  IFACE: P(400, 240),                 // L1 接口卡（kit doc，立着）
  AUDIT: P(-450, 330),                // L27 审计人员（陈列架左前）
  AUDOC: P(-290, 350),                // L27 清单
  // TRON 推送：我们的合约 +u 面伸出两根管子通向用户钱包（陈列架左上方）
  WALLET: add(VEND, { u: 800, v: -60 }),
  GATE: add(VEND, { u: 540, v: -40 }),                // kit checkpoint：道闸横跨推送管
  SCALE_T: add(VEND, { u: 800, v: 150 }),             // L16 到账台秤（钱包前方）
  // 收税存款台（陈列架正前方）：用户 → 管子（过路收费夹）→ 协议金库（kit safe）；旁边一台登记台
  TAXU, SAFE, SCALE_X,
  TOLL: add(TAXU, { u: 330, v: 0 }),
  DESK2: S(TAXU, 170, -250),
  ARM_X: S(SCALE_X, 190, 40),
  OTHERS: [S(TAXU, -130, -50), S(TAXU, -260, -100), S(TAXU, -390, -150)],
};
// pipe polylines [du, dv, z]
export const PUSH = [[100, -40, 50], [700, -40, 50]];      // relative to VEND：推送 合约 → 钱包（低管，从道闸下穿过）
export const PULL = [[700, 10, 140], [100, 10, 140]];      // relative to VEND：拉取 钱包 → 合约（高管）
export const TAXP = [[50, 0, 70], [555, 0, 70]];           // relative to TAXU：用户 → 金库 −u 面
