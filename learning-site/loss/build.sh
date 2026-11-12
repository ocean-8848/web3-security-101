#!/bin/sh
# Build the learning-site edition of Web3 行业安全资损 101: the handbook's shell plus the learning layer.
set -e
cd "$(dirname "$0")"
SRC=../../web3-loss-101
OUT=index.html
sed -e 's#<title>Web3 行业安全资损 101</title>#<title>Web3 资损 101 学习站</title>#' "$SRC/index.html" > "$OUT"
rm -rf data labs && cp -R "$SRC/data" data && cp -R "$SRC/labs" labs
{
  # map this handbook's color tokens onto the names the learning layer uses
  echo '<style>:root{--paper:var(--surface);--ground:var(--bg);--ink-2:var(--muted);--rule:var(--line);--tint:var(--surface2);--risk:var(--danger);--risk-soft:var(--danger-soft);--info:var(--accent);--info-soft:var(--accent-soft)}
/* this handbook has its own 本章目录 */.lv-toc,.lv-tocbtn{display:none!important}</style>'
  echo '<script>'
  sed 's#</script#<\\/script#g' ../learn.js
  sed 's#</script#<\\/script#g' config.js
  sed 's#</script#<\\/script#g' ../visual.js
  echo '</script>'
} >> "$OUT"
{ echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px -apple-system,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'; cat "$OUT"; } > preview.html
echo "built $(wc -c < "$OUT") bytes"
