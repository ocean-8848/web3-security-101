// pills.mjs — 右上角章节胶囊（段名由每章 script.json 的 sections 决定，可传 opts.sections 覆盖）
// pills(active, opts) → HTML 字符串（样式在 kit.css 的 .k-pills / .k-pill）
//   active : 当前段号 1–5（0 = 都不激活）
//   opts.mode : "compact"（默认）激活段显示全称，其余只显示圆圈编号 —— 宽约 540 px，不压右上角内容
//               "full" 五段都显示全称（宽约 1350 px，只在画面上方空旷时用）
//   opts.id   : 容器 id，默认 "pills"；每个胶囊 id = `${id}-${n}`
//   opts.hidden : true 时容器加 .hide（用 GSAP 淡入）
// 激活者墨底白字，其余白底、0.5 透明；字号 28 px（26–30 范围内）。
export const SECTIONS = ["钥匙还在钱没了", "七道关", "断在哪一关", "三个共同点", "怎么守"];
export const NUMS = ["①", "②", "③", "④", "⑤", "⑥", "⑦"];

export function pills(active, opts = {}) {
  const id = opts.id ?? "pills", mode = opts.mode ?? "compact";
  const items = (opts.sections ?? SECTIONS).map((name, i) => {
    const n = i + 1, on = n === active;
    const full = mode === "full" || on;
    const cls = ["k-pill", on ? "is-on" : "", full ? "" : "is-num"].filter(Boolean).join(" ");
    return `<div class="${cls}" id="${id}-${n}">${full ? `${NUMS[i]} ${name}` : NUMS[i]}</div>`;
  }).join("");
  return `<div class="k-pills${opts.hidden ? " hide" : ""}" id="${id}">${items}</div>`;
}

/** GSAP snippet (string) that switches the active pill at time t inside a scene script (full mode only — compact changes layout). */
export const pillSwitchJs = (id = "pills") => `function pillTo(tl, n, t){ for (let j = 1; j <= 7; j++) tl.to("#${id}-" + j, { backgroundColor: j === n ? "#1c1c1c" : "#ffffff", color: j === n ? "#ffffff" : "#1c1c1c", borderColor: j === n ? "#1c1c1c" : "#e2ddd3", opacity: j === n ? 1 : 0.5, duration: 0.3, ease: "power1.out" }, t); }`;
