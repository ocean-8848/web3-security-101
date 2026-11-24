#!/usr/bin/env python3
"""给每段写一份基于 kit/segbase.mjs 的 src/build-story.mjs 起稿（已有的不动）。
用法：python3 tools/new_seg.py <epNN> [段 id ...]
在 tools/scaffold.py 之后运行。起稿里已填好：段 id、起始镜头（从 BRIEF / 上一段推断）、术语卡（从 BRIEF 的"术语卡："行解析）、
结束卡（最后一段，从 BRIEF 解析收束句和下一集）、可用的 CAMS 列表、每句一个 // ===== L<i> 占位。段代理只填 // SHOTS 区。
"""
import json, os, re, sys

hf = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if len(sys.argv) < 2:
    sys.exit(__doc__)
ep = sys.argv[1].rstrip("/").split("/")[-1]
want = sys.argv[2:]
epd = os.path.join(hf, ep)
S = json.load(open(os.path.join(epd, "script.json")))
brief = open(os.path.join(epd, "BRIEF.md")).read() if os.path.exists(os.path.join(epd, "BRIEF.md")) else ""
layout_p = os.path.join(epd, "shared", "layout.mjs")
layout = open(layout_p).read() if os.path.exists(layout_p) else ""
# CAMS 键 + 每个键上方的注释（取第一行）
cams, note = [], ""
m = re.search(r"export const CAMS = \{(.*?)\n\};", layout, re.S)
for ln in (m.group(1).splitlines() if m else []):
    s = ln.strip()
    if s.startswith("//"):
        note = note or s[2:].strip()
        continue
    k = re.match(r"(\w+)\s*:", s)
    if k:
        cams.append((k.group(1), note[:110])); note = ""
cam_keys = [c[0] for c in cams]
has_x = os.path.exists(os.path.join(epd, "kit-ext", "objects-ext.mjs"))


def brief_section(sid):
    m = re.search(rf"^### {re.escape(sid)}\b.*?(?=^### |^## |\Z)", brief, re.S | re.M)
    return m.group(0) if m else ""


def guess_cam0(i, sec):
    for k in re.findall(r"CAMS\.(\w+)", sec):
        if k in cam_keys:
            return k, "BRIEF"
    if i > 0:  # 上一段结尾的镜头
        p = os.path.join(epd, S["segments"][i - 1]["id"], "src", "build-story.mjs")
        if os.path.exists(p):
            src = open(p).read()
            m = re.search(r"ends static on CAMS\.(\w+)", src)
            hits = ([m.group(1)] if m else []) + re.findall(r'cam\([^)]*?"(\w+)"', src)[-1:] + re.findall(r"KIT\.cam\(tl,[^)]*?CAMS\.(\w+)", src)[-1:]
            for k in hits:
                if k in cam_keys:
                    return k, "上一段结尾"
    return (cam_keys[0] if cam_keys else "TODO"), "默认（请确认）"


def js_str(s):
    return json.dumps(s, ensure_ascii=False)


for i, seg in enumerate(S["segments"]):
    sid = seg["id"]
    if want and sid not in want:
        continue
    out = os.path.join(epd, sid, "src", "build-story.mjs")
    if os.path.exists(out):
        print(f"{sid}: 已有 src/build-story.mjs，跳过"); continue
    if not os.path.isdir(os.path.join(epd, sid)):
        print(f"{sid}: 段目录不存在，先运行 python3 tools/scaffold.py {ep} {sid}"); continue
    sec = brief_section(sid)
    cam0, why = guess_cam0(i, sec)
    # 术语卡：术语（"定义"，L4）；…
    terms = []
    tl = re.search(r"术语卡[：:](.*)", sec)
    for t, d, ln in re.findall(r"([^：；;（(、，]+?)（[\"“]([^\"”]+)[\"”][，,]\s*L(\d+)）", tl.group(1) if tl else ""):
        t = t.strip()
        terms.append(f'    {{ id: "t{len(terms)}", t: {js_str(t)}, d: {js_str(d)}, at: w({js_str(t)}, {ln}) }},')
    last = i == len(S["segments"]) - 1
    end = "  // end: 只有全集最后一段才有结束卡\n"
    if last:
        line = re.search(r"收束句[\"“]([^\"”]+)[\"”]", sec)
        nxt = re.search(r"下一集\s*·\s*([^\"”）)]+)[\"”）)]", sec)
        end = (f'  end: {{ line: {js_str(line.group(1) if line else "TODO 收束句")}, next: {js_str(nxt.group(1).strip() if nxt else "TODO 下一集主题")}, '
               f'at: LS[{len(seg["lines"]) - 1}], nextAt: w("下一集", {len(seg["lines"]) - 1}) }},\n')
    cont = i > 0 and S["segments"][i - 1].get("pill") == seg.get("pill")
    lines = "\n".join(f"      // ===== L{k} {txt}" for k, txt in enumerate(seg["lines"]))
    cam_doc = "\n".join(f"//   {k:<12} {n}" for k, n in cams) or "//   （本集没有 shared/layout.mjs 的 CAMS：先在 shared/layout.mjs 定好镜头预设）"
    imports = ['import * as O from "../../../kit/objects.mjs";']
    if has_x:
        imports.append('import * as X from "../../kit-ext/objects-ext.mjs";')
    imports.append('// import * as E1 from "../../../ep01/kit-ext/objects-ext.mjs";   // 其他集的物件：import 后加进 ext 列表')
    lay = 'import * as L from "../../shared/layout.mjs";' if layout else "const L = { CAMS: {} };   // TODO: shared/layout.mjs"
    src = f"""// {ep}/{sid}「{seg.get('chapter', seg.get('title'))}」— 画面生成脚本（kit/segbase.mjs）。运行：node src/build-story.mjs
// 读 kit/SEGBASE.md。起始镜头 CAMS.{cam0}（{why}）。{"本段与上一段同章节：自动用小标签过渡，不出大标题卡。" if cont else ""}
// 可用镜头（shared/layout.mjs 的 CAMS）：
{cam_doc}
import {{ segInit, codeCard, codeRowY, ck, kw, evt, gtag, at, Wp, f }} from "../../../kit/segbase.mjs";
{chr(10).join(imports)}
{lay}

const S = segInit(import.meta.url, {{ cams: L.CAMS, ext: [{"X" if has_x else ""}] }});
const {{ A, put, add, lb, pin, up, LS, LE, w, we }} = S;

// ---------------------------------------------------------------- 世界物件（put(key, 位置, 物件(位置, {{ id: key }}))）
// put("vm", L.VEND, E1.vending(L.VEND, {{ id: "vm" }}));

// ---------------------------------------------------------------- 世界标签（默认隐藏，用 pop 出现）
// lb("lb-vm", up(A.vm.top, 8), "借贷合约", "lab-ink");

// ---------------------------------------------------------------- 屏幕层卡片
const html = "";
const css = "";

// ---------------------------------------------------------------- 词语时刻（w("词语", 句号)）
const TM = {{}};
const t = (x) => f(x);

S.build({{
  cam0: {js_str(cam0)}, sub: "TODO 副标题",
  grid: {{ u0: -3600, u1: 4200, v0: -2600, v1: 2600 }}, box: [-3200, -1800, 8400, 3800],   // 按本段镜头覆盖的范围调
  shown: [], css, html,
  terms: [
{chr(10).join(terms) if terms else "    // { id: \"x\", t: \"术语\", d: \"≤24 字定义\", at: w(\"术语\", 3) },"}
  ],
{end}  js: `
      // SHOTS ———— 只写这里。可用：tl CAMS KIT X<NN> $ fadeIn out pop grow draw cam bump flash hot
{lines}
`,
}});
"""
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w").write(src)
    print(f"{sid}: 写入 src/build-story.mjs（cam0 {cam0} · {why}；术语卡 {len(terms)}；{'结束卡' if last else '无结束卡'}{'；续段小标签' if cont else ''}）")
