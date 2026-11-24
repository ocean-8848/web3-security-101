#!/usr/bin/env python3
"""从 timing.json 生成 compositions/captions.html（每组字幕一个静态元素）。用法：gen_captions.py <项目目录>"""
import json,sys,html
d=sys.argv[1]; T=json.load(open(f'{d}/timing.json')); C=T['captions']
for i,c in enumerate(C):
    if i+1<len(C): c['end']=min(c['end'],C[i+1]['start']-0.02)
groups='\n'.join(f'    <div id="cap-{c["id"]}" class="cap-g"><span class="cap-t">{html.escape(c["text"])}</span></div>' for c in C)
tw='\n'.join(f'      tl.set("#cap-{c["id"]}", {{opacity: 1, visibility: "visible"}}, {c["start"]:.3f});\n      tl.set("#cap-{c["id"]}", {{opacity: 0, visibility: "hidden"}}, {c["end"]:.3f});' for c in C)
open(f'{d}/compositions/captions.html','w').write(f'''<template>
  <style>
    #root {{ position: absolute; inset: 0; pointer-events: none; }}
    .cap-g {{ position: absolute; left: 0; right: 0; bottom: var(--cap-bottom, 84px); text-align: center; opacity: 0; visibility: hidden; }}
    .cap-t {{ display: inline-block; font-family: var(--cap-font, "Noto Sans SC"), sans-serif; font-weight: var(--cap-weight, 700);
      font-size: var(--cap-size, 46px); line-height: 1.25; color: var(--cap-ink, #111); letter-spacing: 0.02em;
      padding: var(--cap-pad, 0); background: var(--cap-bg, transparent); border-radius: var(--cap-radius, 0);
      text-shadow: var(--cap-shadow, none); }}
  </style>
  <div id="root" data-composition-id="captions" data-width="1920" data-height="1080">
{groups}
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
{tw}
      window.__timelines["captions"] = tl;
    }})();
  </script>
</template>
''')
print('captions:',len(C))
