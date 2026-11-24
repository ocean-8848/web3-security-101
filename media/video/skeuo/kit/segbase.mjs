// segbase.mjs — 分段画面的共用骨架。段代理只写镜头（物件、标签、卡片、时间线），其余由这里生成。
// 用法与示例见 kit/SEGBASE.md。生成的 compositions/story.html 与 ep08 手写版结构相同：
//   世界 SVG + 网格 + 镜头（#cam）→ 世界标签层（#labels）→ 屏幕层（叠加曲线、卡片、术语卡、胶囊、标题卡、结束卡）
//   时间线：起始镜头、0–1.6 秒标题卡（或同章节续段的小标签）、术语卡、结束卡、末尾静止、注册 window.__timelines["story"]。
//
//   const S = segInit(import.meta.url, { cams: L.CAMS, ext: [E1, X] });   // 读 timing.json / script.json
//   S.put("vm", L.VEND, E1.vending(L.VEND, { id: "vm" }));               // 物件进世界（按纵深排序）
//   S.lb("lb-vm", S.up(S.A.vm.top, 8), "借贷合约", "lab-ink");            // 世界标签（默认隐藏）
//   const TM = { swap: S.w("全部换掉", 2) };
//   S.build({ cam0: "center", sub: "副标题", terms: [...], end: {...}, html, css, js: `...` });
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { at, Wp, f, toScreen, gridSvg, worldSvg, wlab, wpin, dashCurve, kitCss, runtimeJs } from "./iso.mjs";
import { pills } from "./pills.mjs";
import { screenCss, termCards, endCard, ZONE } from "./screen.mjs";
import { loadTiming, wordAt, lineAt } from "./timing.mjs";

export { wordAt, lineAt, f, at, Wp, toScreen, ZONE };

const KIT_DIR = path.dirname(fileURLToPath(import.meta.url));
const r2 = (x) => Math.round(x * 100) / 100;

// ---------------------------------------------------------------- 屏幕层小组件（ep08 反复出现的写法）
/** 关键词卡（墨字白底）。html 里 <b> 着色（accent），可放 gtag()。默认在左上 56,120（与术语卡同区，避开同时出现） */
export const kw = (id, html, { x = 56, y = 120, size = 42, accent = "#1f9d55", hide = true, cls = "" } = {}) =>
  `<div class="sb-kw ${cls}${hide ? " hide" : ""}" id="${id}" style="left:${x}px;top:${y}px;font-size:${size}px;--acc:${accent}">${html}</div>`;
/** 事实分层标签：公开报道 / 项目方称 / 第三方分析 / 解读 / 示例 … */
export const gtag = (text, style = "") => `<span class="sb-gtag"${style ? ` style="${style}"` : ""}>${text}</span>`;
/** 事件卡 / 来源卡：右上 ZONE.event（胶囊下方）。color = 左边条颜色 */
export const evt = (id, html, { color = "#2aa3c9", top = ZONE.event.top, hide = true } = {}) =>
  `<div class="sb-evt${hide ? " hide" : ""}" id="${id}" style="top:${top}px;border-left-color:${color}">${html}</div>`;
/** 勾选卡：一行文字 + 左侧圆形图标。kind g=绿勾 c=青蓝 r=红叉 n=灰（未定）。icon 可换成 "?" 等 */
export const ck = (id, text, { x = 1330, y = 300, w = 500, kind = "g", icon, hide = true } = {}) =>
  `<div class="sb-ck sb-ck-${kind}${hide ? " hide" : ""}" id="${id}" style="left:${x}px;top:${y}px;width:${w}px"><span class="sb-ck-i" id="${id}-i">${icon ?? (kind === "r" ? "✕" : kind === "n" ? "?" : "✓")}</span><span class="sb-ck-t">${text}</span></div>`;
/**
 * 代码卡 / 清单卡（kit.css 的 .k-code）。rows: 字符串（HTML）或 { html, chip, chipCls: "ok"|"x"|"", id }。
 * 每行 id = `${id}-r${i}`，行尾 chip id = `${id}-c${i}`（默认隐藏，pop 出来）。mono=false 用黑体（清单），true 用等宽（代码）。
 * 行中心的屏幕 y：codeRowY(card, i)；用来接 S.curve 的起点。
 */
export function codeCard(id, { x = 60, y = 110, w = 600, head = "", tag = "", rows = [], mono = false, hide = true, rowHide = false }) {
  const R = rows.map((r, i) => {
    const o = typeof r === "string" ? { html: r } : r;
    const chip = o.chip ? `<span class="c-chip ${o.chipCls ?? ""} hide" id="${id}-c${i}">${o.chip}</span>` : "";
    return `<div class="c-row${mono ? "" : " sb-sans"}${rowHide ? " hide" : ""}" id="${o.id ?? `${id}-r${i}`}">${o.html}${chip}</div>`;
  }).join("");
  return `<div class="k-code${hide ? " hide" : ""}" id="${id}" style="left:${x}px;top:${y}px;width:${w}px">${head ? `<div class="c-head">${head}${tag ? `<span class="c-tag">${tag}</span>` : ""}</div>` : ""}${R}</div>`;
}
/** 代码卡第 i 行中心的屏幕 y（有 head 时）：top + padding 24 + head 56 + 50·i + 25 */
export const codeRowY = (y, i, head = true) => y + 24 + (head ? 56 : 0) + 50 * i + 25;

const BASE_CSS = `
    #root { position: absolute; inset: 0; overflow: hidden; background: #efebe3; font-family: "Noto Sans SC", sans-serif; color: #1c1c1c; }
    #ttl-card { left: 460px; top: 300px; min-height: 0; padding: 56px 40px 50px; }
    #ttl-card .t-main { font-size: 84px; }
    #sec { position: absolute; left: 56px; top: 32px; }
    .sb-kw { position: absolute; font-weight: 900; color: #1c1c1c; background: #fffdf8; border-radius: 16px; padding: 10px 28px 14px; box-shadow: 0 10px 24px rgba(70,60,40,0.12); white-space: nowrap; }
    .sb-kw b { color: var(--acc); }
    .sb-gtag { display: inline-block; font-size: 28px; font-weight: 800; color: #6d685e; background: #ebe6dc; border-radius: 8px; padding: 2px 12px 4px; margin-left: 14px; vertical-align: 6px; }
    .sb-evt { position: absolute; right: ${ZONE.event.right}px; max-width: ${ZONE.event.maxW}px; background: #ffffff; border-radius: 16px; padding: 12px 24px 14px; border-left: 6px solid #2aa3c9;
      box-shadow: 0 10px 24px rgba(70,60,40,0.12); font-size: 36px; font-weight: 900; white-space: nowrap; }
    .sb-evt b { color: #1d93ba; }
    .sb-ck { position: absolute; height: 74px; display: flex; align-items: center; gap: 18px; padding: 0 24px; background: #ffffff; border-radius: 14px;
      border-left: 8px solid #1f9d55; box-shadow: 0 8px 20px rgba(70,60,40,0.12); font-size: 36px; font-weight: 900; white-space: nowrap; }
    .sb-ck .sb-ck-i { width: 46px; height: 46px; border-radius: 50%; background: #1f9d55; color: #fff; font-size: 30px; line-height: 46px; text-align: center; flex: none; }
    .sb-ck-c { border-left-color: #1d93ba; } .sb-ck-c .sb-ck-i { background: #1d93ba; }
    .sb-ck-r { border-left-color: #e0453a; } .sb-ck-r .sb-ck-i { background: #e0453a; }
    .sb-ck-n { border-left-color: #8a8478; } .sb-ck-n .sb-ck-i { background: #8a8478; }
    .k-code .c-row.sb-sans { white-space: pre; display: flex; align-items: center; gap: 16px; font-family: "Noto Sans SC", sans-serif; font-weight: 700; }
    .k-code .c-row.sb-sans .c-chip { margin-left: auto; font-family: "Noto Sans SC", sans-serif; }
    .k-code .c-chip.ok { background: #1f9d55; }
    .k-code .c-chip.x { background: #e0453a; }`;

// 浏览器端时间线前置：常用助手。X1 / X3 / X8 … 按 ext 模块自动生成。
const preludeJs = (cams, xs, grown, shown) => `
      const CAMS = ${JSON.stringify(cams)};
      const tl = gsap.timeline({ paused: true });
      const $ = (id) => document.getElementById(id);
      ${xs.map((n) => `const X${+n} = window.KITX${n};`).join(" ")}
      const fadeIn = (sel, t, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || 0.25, ease: "power1.out", immediateRender: false }, t);
      const out = (sel, t, d) => tl.to(sel, { opacity: 0, duration: d || 0.2, ease: "power2.in" }, t);
      const pop = (sel, t, d) => KIT.pop(tl, sel, t, d || 0.3);
      const grow = (id, t, d) => KIT.grow(tl, id, t, d || 0.45);
      const draw = (id, t, d) => KIT.draw(tl, id, t, d || 0.6);
      const cam = (t, name, dur, ease) => KIT.cam(tl, t, CAMS[name], dur || 1.2, ease);
      const bump = (sel, t, s, n) => tl.to(sel, { scale: s || 1.15, duration: 0.2, yoyo: true, repeat: (n || 1) * 2 - 1 }, t);
      const flash = (sel, t, n, lo) => tl.fromTo(sel, { opacity: 1 }, { opacity: lo == null ? 0.25 : lo, duration: 0.16, yoyo: true, repeat: (n || 3) * 2 - 1, ease: "power1.inOut", immediateRender: false }, t);
      const hot = (sel, t, c) => tl.to(sel, { backgroundColor: c || "#fdeae7", duration: 0.2 }, t);
      ${grown.length ? `${JSON.stringify(grown)}.forEach((id) => { const g = $(id); tl.set("#" + id, { scaleY: 0, svgOrigin: g.getAttribute("data-ox") + " " + g.getAttribute("data-oy") }, 0); });` : ""}
      ${shown.length ? `tl.set(${JSON.stringify(shown.join(", "))}, { opacity: 1 }, 0);` : ""}`;

/**
 * segInit(importMetaUrl, { cams, ext, id })
 *   cams : 本集镜头预设（shared/layout.mjs 的 CAMS）；ext : 用到的 kit-ext 模块（需有 runtimeExtJs）
 *   id   : 段 id，默认取段目录名（segN）
 * 返回 S：时间查询、世界收集器、标签收集器、build()。
 */
export function segInit(metaUrl, { cams = {}, ext = [], id } = {}) {
  const srcDir = path.dirname(fileURLToPath(metaUrl));
  const segDir = path.dirname(srcDir), epDir = path.dirname(segDir);
  const T = loadTiming(path.join(segDir, "timing.json"));
  const SCRIPT = JSON.parse(fs.readFileSync(path.join(epDir, "script.json"), "utf8"));
  const sid = id ?? T.id ?? path.basename(segDir);
  const k = SCRIPT.segments.findIndex((s) => s.id === sid);
  if (k < 0) throw new Error(`segbase: script.json 里没有段 ${sid}`);
  const SEG = SCRIPT.segments[k], PREV = SCRIPT.segments[k - 1];
  const LN = T.lines.map((_, i) => lineAt(T, i));

  const items = [], A = {}, labels = [], ov = [], grown = [];
  const S = {
    T, TOTAL: T.total, SCRIPT, SEG, CAMS: cams, LN, LS: LN.map((l) => l.start), LE: LN.map((l) => l.end),
    continued: !!PREV && PREV.pill === SEG.pill,
    /** 第 line 句里第 nth 次出现 term 的开始 / 结束秒 */
    w: (term, line, nth = 0) => wordAt(T, term, { line, nth }).start,
    we: (term, line, nth = 0) => wordAt(T, term, { line, nth }).end,
    f, A, items,
    // ---- 世界
    rel: (o, du, dv) => ({ u: o.u + du, v: o.v + dv }),
    up: (p, d) => [p[0], p[1] - d],
    hid: (gid, svg) => `<g id="${gid}" opacity="0">${svg}</g>`,
    /** 原样 SVG 进世界，按 o 的地面纵深排序（dy 微调前后） */
    add: (o, svg, dy = 0) => { items.push({ y: at(o)[1] + dy, svg }); },
    /** 物件 r = objName(o, opts) 的返回值；anchors 存进 S.A[key]。opts.wrap(svg) 可包一层；opts.grow 加入"从地面长出"列表 */
    put(key, o, r, dy = 0, opts = {}) {
      if (typeof opts === "function") opts = { wrap: opts };
      A[key] = r.anchors; S.add(o, opts.wrap ? opts.wrap(r.svg) : r.svg, dy);
      if (opts.grow) grown.push(opts.grow === true ? key : opts.grow);
      return r;
    },
    /** 开场时 scaleY=0、之后用 grow(id, t) 长出的物件组 id */
    grow: (...ids) => { grown.push(...ids); },
    // ---- 标签（世界层，随镜头移动、反向缩放保持字号）
    lb: (lid, p, html, cls = "", a = "b") => { labels.push(wlab(lid, p, html, `${cls} hide`, a)); },
    pin: (lid, p, html, a = "c") => { labels.push(wpin(lid, p, html, a)); },
    /** 世界层原样 HTML / SVG（例如虚线断口），放在标签层 */
    raw: (html) => { labels.push(html); },
    /** 世界点 p 在镜头 camName 下的屏幕坐标 */
    scr: (camName, p) => toScreen(cams[camName], p),
    /** 屏幕层虚线曲线（代码卡某行 → 场景物件），默认隐藏，用 draw(id, t) 画出 */
    curve: (cid, P0, P3, o = {}) => { ov.push(dashCurve(cid, P0, P3, o).svg); },

    /**
     * build({ cam0, sub, grid, box, extraSvg, css, html, js, terms, end, shown, hold, title })
     *   cam0   : 起始镜头名（CAMS 的键）；sub : 标题卡副标题
     *   grid   : gridSvg 范围 { u0, u1, v0, v1 }；box : worldSvg 画布 [x, y, w, h]
     *   css / html / js : 段自己的样式、屏幕层 HTML、镜头时间线（浏览器端代码串，已有 tl、CAMS、KIT、X<NN> 和助手）
     *   terms  : termCards 列表；end : endCard 参数（title 默认 script.json 的 title，at 默认最后一句开始，total 自动）
     *   shown  : 开场就可见的标签选择器；hold : 末尾静止秒数（无结束卡时检查用，默认 1）
     *   title  : { main, sub, continued, until } 覆盖标题卡 / 小标签
     */
    build(o = {}) {
      const TOTAL = T.total;
      const ttl = { main: SEG.chapter ?? SEG.title, sub: o.sub ?? "", continued: S.continued, ...(o.title || {}) };
      const xs = [];
      for (const m of ext) { const mm = /window\.KITX(\d+)\s*=/.exec(m.runtimeExtJs()); if (mm && !xs.includes(mm[1])) xs.push(mm[1]); }
      items.sort((a, b) => a.y - b.y);
      const world = worldSvg("wsvg", gridSvg(o.grid || {}) + items.map((x) => x.svg).join("\n") + (o.extraSvg || ""), o.box);
      const TC = termCards(o.terms || []);
      const EC = o.end ? endCard({ title: SCRIPT.title, at: S.LS.at(-1), total: TOTAL, ...o.end }) : null;
      const ovSvg = ov.length ? `<svg id="ovl" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">${ov.join("")}</svg>` : "";
      const head = ttl.continued
        ? `<div id="sec"><div class="lab lab-ink hide" id="sec-l">${ttl.main}</div></div>`
        : `<div class="k-title" id="ttl-card"><div class="t-main">${ttl.main}</div>${ttl.sub ? `<div class="t-sub">${ttl.sub}</div>` : ""}</div>`;
      const headJs = ttl.continued
        ? `KIT.pop(tl, "#sec-l", 0.15, 0.3); tl.to("#sec-l", { opacity: 0, duration: 0.25 }, ${r2(ttl.until ?? Math.max(2.5, (S.LS[1] ?? 3) - 0.4))});`
        : `tl.fromTo("#ttl-card", { x: 0, y: 0, scale: 1, opacity: 1 }, { x: 560, y: -330, scale: 0.32, opacity: 0, duration: 0.45, ease: "power3.in", immediateRender: false }, 1.15);`;
      if (!o.cam0 || !cams[o.cam0]) throw new Error(`segbase: cam0 "${o.cam0}" 不在 CAMS 里（${Object.keys(cams).join(", ")}）`);
      const shots = o.js || "";
      // 末尾静止的粗查：镜头代码里出现在最后 hold 秒内的时刻
      const hold = o.hold ?? 1, lateLimit = EC ? TOTAL - 2.5 : TOTAL - hold;
      const late = [...shots.matchAll(/,\s*(\d+(?:\.\d+)?)\s*\)/g)].map((m) => +m[1]).filter((t) => t > lateLimit + 0.01 && t <= TOTAL + 0.5);
      if (late.length) console.warn(`segbase: 注意，镜头代码在最后静止段（> ${r2(lateLimit)}s）里还有动作：${[...new Set(late)].join(", ")}`);

      const html = `<template>
  <style>
${kitCss()}
${screenCss()}
${BASE_CSS}
${o.css || ""}
  </style>
  <div id="root" data-composition-id="story" data-width="1920" data-height="1080">
    <div class="k-stage" id="stage">
      <div id="cam" data-layout-allow-overflow data-layout-ignore>
        ${world}
        <div class="k-layer" id="labels">${labels.join("")}</div>
      </div>
      ${o.html || ""}
      ${ovSvg}
      ${TC.html}
      ${pills(SEG.pill, { sections: SCRIPT.sections })}
      ${head}
      ${EC ? EC.html : ""}
    </div>
  </div>
  <script>
${runtimeJs()}
${ext.map((m) => m.runtimeExtJs()).join("\n")}
    (function () {
${preludeJs(cams, xs, grown, o.shown || [])}
      ${TC.js}
      // ===== 0–1.6 · 起始镜头 + ${ttl.continued ? "小标签（同章节续段）" : "标题卡"}
      KIT.camSet(tl, CAMS[${JSON.stringify(o.cam0)}]);
      ${headJs}
      // ===== SHOTS
${shots}
      // ===== 结束
      ${EC ? EC.js : ""}
      tl.set({}, {}, ${r2(TOTAL)});
      window.__timelines = window.__timelines || {};
      window.__timelines["story"] = tl;
    })();
  </script>
</template>
`;
      fs.mkdirSync(path.join(segDir, "compositions"), { recursive: true });
      fs.mkdirSync(path.join(segDir, "assets"), { recursive: true });
      fs.copyFileSync(path.join(KIT_DIR, "kit.css"), path.join(segDir, "assets", "kit.css"));
      const out = html.replace(/width="-[0-9.]+"/g, 'width="0"');
      fs.writeFileSync(path.join(segDir, "compositions", "story.html"), out);
      console.log(`wrote compositions/story.html ${out.length} bytes · ${sid} · ${r2(TOTAL)}s · cam0 ${o.cam0}${ttl.continued ? " · 续段小标签" : ""}`);
      console.log(TC.report);
      return { html: out, TC, EC };
    },
  };
  return S;
}
