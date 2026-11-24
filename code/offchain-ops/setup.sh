#!/usr/bin/env bash
# MiniEx 靶场一键生成 + 自检（第一批 S1–S9 + 第二批 S10–S15）。只依赖 python3（>= 3.9）标准库，不联网。
# 用法：在 web3-security-101/ 目录运行  bash code/offchain-ops/setup.sh
#       可选参数：--no-tests 只生成数据；--seed N 换第一批的种子（默认 20260301，答案文件会随之改变，练习章按默认种子写；第二批固定 20260302）
set -euo pipefail
cd "$(dirname "$0")"

RUN_TESTS=1
SEED=20260301
while [ $# -gt 0 ]; do
  case "$1" in
    --no-tests) RUN_TESTS=0 ;;
    --seed) SEED="$2"; shift ;;
    *) echo "未知参数：$1"; exit 2 ;;
  esac
  shift
done

command -v python3 >/dev/null || { echo "需要 python3"; exit 1; }
python3 - <<'PY' || { echo "需要 Python >= 3.9"; exit 1; }
import sys
sys.exit(0 if sys.version_info >= (3, 9) else 1)
PY

echo "== 1/5 生成第一批数据（种子 ${SEED}）"
python3 gen/generate.py --seed "$SEED"
echo "== 2/5 装载 SQLite"
python3 lib/load_sqlite.py
echo "== 3/5 生成第二批数据（S10–S15，固定种子 20260302，写入 data_x/）"
python3 gen/generate_x.py
if [ "$RUN_TESTS" = 1 ]; then
  echo "== 4/5 自检（第一批）"
  python3 -m unittest discover -s tests -p 'test_miniex.py' -v 2>&1 | tail -n 25
  echo "== 参考规则回放汇总"
  python3 lib/replay.py --dir answers/reference_rules
  echo "== 5/5 自检（第二批）"
  python3 -W ignore -m unittest discover -s tests -p 'test_miniex_x.py' -v 2>&1 | tail -n 32
  echo "== 第二批脚本召回自检（默认参数，每条应召回全部目标正例）"
  python3 lib/seqcheck.py --score S10-01,S10-02 --min-recall 1.0 --max-fp 0 --show 0 | grep '^评分'
  python3 lib/ledger_check.py --score S10-03,S10-04,S10-05 --min-recall 1.0 --max-fp 0 --show 0 | grep '^评分'
  python3 lib/replay_match.py --score S12 --min-recall 1.0 --max-fp 0 --show 0 | grep '^评分'
  python3 lib/order_audit.py --score S11 --min-recall 1.0 --max-fp 0 --show 0 | grep '^评分'
  python3 lib/liq_audit.py --score S13 --min-recall 1.0 --show 0 | grep '^评分'
  python3 lib/reserve_check.py --score S14-01 --min-recall 1.0 --show 0 | grep '^评分'
  python3 lib/recon3.py --score S14-02,S14-03,S14-04,S14-05 --min-recall 1.0 --show 0 | grep '^评分'
  python3 lib/state_audit.py --score S14-03,S14-04,S14-05 --min-recall 1.0 --max-fp 0 --show 0 | grep '^评分'
  python3 lib/case_audit.py --score S15 --min-recall 1.0 --max-fp 0 --show 0 | grep '^评分'
fi
echo "靶场已就绪：数据在 code/offchain-ops/data/ 与 data_x/，答案在 code/offchain-ops/answers/（练习做完再看）"
