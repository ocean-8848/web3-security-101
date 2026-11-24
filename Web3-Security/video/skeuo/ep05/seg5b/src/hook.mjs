// hook.mjs — Parity 角落（seg1 钩子场景）在 seg5b 世界里的摆位与动画。
// 坐标全部 import 自 seg1 的 layout.mjs（只 import 不改），物件与 seg1 段尾状态一致：
// 库合约 broken、三个钱包冰封、管道熄灭、initialize 护罩位红虚线、kill 读卡器绿灯、用户手持 owner 门卡、挂锁和钥匙在地上。
import { at, f } from "../../../kit/iso.mjs";
import * as O from "../../../kit/objects.mjs";
import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";
import * as E3 from "../../../ep03/kit-ext/objects-ext.mjs";
import * as X from "../../kit-ext/objects-ext.mjs";
import { LIB, LIB_PANEL, LIB_BUTTONS, WALLETS, PIPE_Z, PIPE_IN_Z, LIB_USER, LIB_LOCK, LIB_KEY, ICE_BOX } from "../../seg1/src/layout.mjs";

export { LIB };
const HP = LIB_PANEL, WAL = WALLETS;
export function build({ add, items, A }) {
  add(E3.contractMachine, LIB, { id: "lib", name: "LIB", code: ["owner:", "0x0"], state: "broken", ghost: 0.55 });
  add(X.funcPanel, HP, { id: "hp", buttons: [{ name: LIB_BUTTONS[0], guard: "broken" }, { name: LIB_BUTTONS[1], guard: "card", rd: "green" }] });
  WAL.forEach((o, i) => {
    add(O.hotWallet, o, { id: `hw${i}`, led: "off" });
    const r = X.iceShell(o, { id: `ice${i}`, box: ICE_BOX, seed: "ice" + i });
    items.push({ Y: at(o)[1] + 0.5, svg: r.svg }); A[`ice${i}`] = r.anchors;
  });
  // delegatecall 管道（同 seg1：立管 + 一根总管接库合约 −u 面），画在钱包和冰壳之上；段首流动已熄灭
  const du = (W) => W.u - LIB.u, far = WAL[WAL.length - 1];
  let ps = E1.pipe(LIB, { id: "pm", pts: [[du(far), 0, 232], [du(far), 0, PIPE_Z], [-150, 0, PIPE_Z], [-150, 0, PIPE_IN_Z], [-112, 0, PIPE_IN_Z]] }).svg;
  WAL.slice(0, -1).forEach((W, i) => { ps += E1.pipe(W, { id: "pr" + i, pts: [[0, 0, 232], [0, 0, PIPE_Z]] }).svg; });
  items.push({ Y: at(WAL[0])[1] + 2000, svg: `<g id="pipes">${ps}</g>` });
  add(O.person, LIB_USER, { id: "hu", role: "signer" });
  add(X.keycard, { u: LIB_USER.u + 46, v: LIB_USER.v + 30 }, { id: "hoc", role: "owner", z: 96, scale: 1.5, holder: "0x…user" }, 2);
  add(O.padlock, LIB_LOCK, { id: "hlk" });
  add(O.key, LIB_KEY, { id: "hky" });
}

export function labels({ lab, A, up }) {
  let s = "";
  lab("h-lib", up(A.lib.top, 0), "Library · 库合约", "");
  lab("h-wal", [A.hw2.ground[0] - 40, A.hw2.ground[1] + 30], "Parity 多签钱包", "lab-g", "t");
  lab("h-user", up(A.hu.top, 4), "那个用户", "lab-g");
  lab("h-nochk", [A.hp.plates[0][0] - 20, A.hp.plates[0][1] + 40], "没有权限检查", "lab-rs", "t");
  lab("h-fix", [A.hp.plates[0][0] - 20, A.hp.plates[0][1] + 40], "构造函数里锁死", "lab-gs", "t");
  lab("h-hyp", [A.lib.top[0] + 190, A.lib.top[1] + 20], "假设 · 本可避免", "lab-g", "l");
  return "";
}
// 51 dots (1 dot = 1 万 ETH), the last one half-transparent = "约" — screen layer, left under the question card
export function dotPanel() {
  const dots = Array.from({ length: 51 }, (_, i) => `<span class="dd" id="hd${i}"${i === 50 ? ' style="opacity:0.45"' : ""}></span>`).join("");
  return `<div class="dp hide" id="dpan"><div class="dp-h">约 51 万 ETH · 冻结<span class="dp-tag">Parity 复盘</span></div><div class="dp-d">${dots}</div><div class="dp-n">每点 = 1 万 ETH</div></div>`;
}

export function points(A) {
  return [A.lib.top, A.lib.ground, A.hp.ground, at(HP, 0, 120, 0), A.hu.top, A.hu.ground, A.hlk.ground, A.hky.ground, ...[0, 1, 2].map((i) => A[`hw${i}`].top), at(WAL[2], -120, -100, 0), at(WAL[0], 120, 120, 0)];
}
// 回到开头：右侧留给点阵面板，左上留给问题卡
export const cam = (fit, A) => fit(points(A), 660, 170, 1740, 860);
export const camClose = (fit, A) => fit([at(HP, -200, -120, 200), at(HP, 200, 160, 0), A.lib.top, A.hw2.top, A.hu.top, A.hu.ground], 700, 130, 1760, 740);

export const js0 = () => `
    [0, 1, 2].forEach(function (i) { KIT.led(tl, "hw" + i + "-led", 0, "off"); });
    pop("#h-lib", 0.4);
    out("#h-lib", T.l1 - 0.4, 0.2);`;

export const js = ({ out: outs }) => `
    const t6 = T.l6 - 0.4;
    KIT.cam(tl, t6, C.CH, 1.5);
    out("${outs.join(", ")}", t6, 0.3);
    pop("#h-lib", T.back + 0.6); pop("#h-wal", T.back + 0.9);
    pop("#h-user", T.nocrack - 0.1);
    pop("#hq", T.nocrack + 0.4);
    pop("#dpan", T.freeze - 0.2);
    tl.fromTo(".dd", { scale: 0.4 }, { scale: 1, duration: 0.25, stagger: 0.012, ease: "back.out(2)", immediateRender: false }, T.freeze - 0.1);

    // L7 · 库合约上一个按钮，从来没人回答过谁有权按它
    KIT.cam(tl, T.l7 - 0.3, C.CH2, 1.2);
    out("#hq, #dpan, #h-wal, #h-user", T.l7 - 0.3, 0.25);
    [0, 1, 2].forEach(function (k) { tl.to("#hp-gap-0", { opacity: 0.2, duration: 0.16 }, T.btn + 0.5 + k * 0.42); tl.to("#hp-gap-0", { opacity: 1, duration: 0.16 }, T.btn + 0.71 + k * 0.42); });
    pop("#h-nochk", T.btn + 0.3);
    pop("#hq2", T.whoq - 0.2);

    // L8 · 修复：部署时构造函数锁死初始化（假设）
    out("#hq2, #h-nochk", T.l8 - 0.1, 0.25);
    pop("#h-fix", T.ctor);
    K5.guard(tl, "hp", 0, T.lock - 0.2, "plate", 0.5);
    pop("#h-hyp", T.lock + 0.3);
    [0, 1, 2].forEach(function (i) { K5.thaw(tl, "ice" + i, T.lock + 0.5 + i * 0.15, 0.9); KIT.led(tl, "hw" + i + "-led", T.lock + 1.2 + i * 0.1, "green"); });
    KIT.fixed(tl, "lib", T.lock + 0.4);
    tl.fromTo("#pm-flow, #pr0-flow, #pr1-flow", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, T.lock + 1.0);
    out("#h-fix, #h-hyp, #h-lib", T.l9 - 0.35, 0.25);`;
