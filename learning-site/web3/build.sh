#!/bin/sh
# Build the learning-site edition of the Web3 handbook: the handbook's own index.html plus the learning layer.
set -e
cd "$(dirname "$0")"
SRC=../../web3-handbook
OUT=index.html
sed -e 's#<title>Web3 从 0 到 1 学习手册</title>#<title>Web3 从 0 到 1 学习站</title>#' "$SRC/index.html" > "$OUT"
{
  echo '<script>'
  python3 ../ans/emit.py web3
  sed 's#</script#<\\/script#g' ../learn.js
  sed 's#</script#<\\/script#g' config.js
  sed 's#</script#<\\/script#g' ../visual.js
  echo '</script>'
} >> "$OUT"
# Local preview copy with the charset/viewport the artifact skeleton adds at publish time
{ echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px -apple-system,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'; cat "$OUT"; } > preview.html
grep -c '<title>' "$OUT" >/dev/null
echo "built $(wc -c < "$OUT") bytes"
