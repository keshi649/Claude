#!/usr/bin/env bash
# 项目三的完整对照：3 个随机种子 × {不加域随机化, 加域随机化}，每个 100 万步；训完在 4 种环境里测试。
# 4 核笔记本大约半小时（每个进程只用 1 个线程，同时跑 3 个）。
# 用法：bash run_all.sh [输出目录，默认 runs]
set -euo pipefail
cd "$(dirname "$0")"
OUT="${1:-runs}"
PY="${PYTHON:-python}"
mkdir -p "$OUT"
jobs=()
for seed in 1 2 3; do
  jobs+=("--seed $seed" "--seed $seed --dr")
done
printf '%s\n' "${jobs[@]}" | xargs -P 3 -I{} sh -c "$PY ppo.py {} --out $OUT > $OUT/log_\$(echo {} | tr -d ' -').txt 2>&1"
echo "case,policy,seed,mean,std" > "$OUT/eval.csv"
for f in "$OUT"/*.pt; do
  b=$(basename "$f" .pt)
  $PY ppo.py --eval "$f" | while read -r case mean pm std; do
    echo "$case,$(echo "$b" | cut -d_ -f2),$(echo "$b" | sed 's/.*seed//'),$mean,$std" >> "$OUT/eval.csv"
  done
done
cat "$OUT/eval.csv"
