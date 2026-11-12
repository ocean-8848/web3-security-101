#!/bin/bash
# Render every contract-security episode (A01–A10, EP01–EP13, C00–C03), JOBS in parallel (default 4). Logs go to ../output/logs/.
# Optional filter by file-name prefix:  render-all.sh A   → only A episodes;  render-all.sh EP0 → EP01–EP09;  render-all.sh C0
# Extra args go to render.mjs, e.g.  render-all.sh "" --engine kokoro
# Resumable: an episode already rendered with the same engine (and not edited since) is skipped. FORCE=1 re-renders all.
cd "$(dirname "$0")"
mkdir -p ../output/logs
eng=edge; a=("${@:2}"); for i in "${!a[@]}"; do [ "${a[$i]}" = "--engine" ] && eng="${a[$((i+1))]}"; done
for f in ../slides/A[0-9][0-9]-*.html ../slides/EP[0-9][0-9]-*.html ../slides/C[0-9][0-9]-*.html; do
  [ -e "$f" ] || continue
  case "$(basename "$f")" in "${1:-}"*) ;; *) continue ;; esac
  b=$(basename "$f" .html); ok="../output/logs/$b.ok-$eng"
  if [ -z "$FORCE" ] && [ -e "$ok" ] && [ "$ok" -nt "$f" ] && [ -s "../output/$b.mp4" ]; then echo "$b: 已完成，跳过"; continue; fi
  while [ "$(jobs -rp | wc -l)" -ge "${JOBS:-4}" ]; do sleep 2; done
  echo "$b: 开始"
  ( if node render.mjs "$f" "${@:2}" > "../output/logs/$b.log" 2>&1; then touch "$ok"; echo "$b: 完成 $(tail -1 "../output/logs/$b.log" | grep -o '"minutes":[0-9.]*')"; else echo "$b: 失败，见 output/logs/$b.log"; fi ) &
done
wait
