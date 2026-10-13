#!/bin/bash
# 搭配音环境：CosyVoice 3（Fun-CosyVoice3-0.5B-2512 的 RL 版）+ FunASR，CPU 版。
# 新容器里没有这套环境，第一次做配音前跑一次（建议放后台，同时写脚本）：
#   bash 工具/setup_tts.sh [目录，默认 /home/user/tts] > /tmp/setup_tts.log 2>&1
# 大约 20~30 分钟，占约 12 GB 磁盘（模型约 7 GB、venv 约 3 GB、FunASR 模型约 2 GB，第一次转写时才下载）。
# 每一步都会先看做没做过，中途断了可以直接重跑。
set -e
T=${1:-/home/user/tts}
mkdir -p "$T" && cd "$T"

# 1. CosyVoice 代码（带子模块 Matcha-TTS）
[ -d CosyVoice/third_party/Matcha-TTS/matcha ] || git clone --depth 1 --recursive https://github.com/FunAudioLLM/CosyVoice.git

# 2. Python 3.11 虚拟环境（用 uv；没有 uv 就先装）
command -v uv > /dev/null || pip install -q uv
[ -x venv/bin/python ] || uv venv -p 3.11 venv

# 3. 依赖：CosyVoice 要的包（torch 2.3.1 CPU 版；openai-whisper 旧版本装不上，放宽到 >=20240930）
#    + FunASR（转写、逐字时间）+ pypinyin（按拼音比对）+ pyworld（看声调）
cat > req-cpu.txt <<'REQ'
torch==2.3.1
torchaudio==2.3.1
conformer==0.3.2
diffusers==0.29.0
hydra-core==1.3.2
HyperPyYAML==1.2.3
inflect==7.3.1
librosa==0.10.2
lightning==2.2.4
matplotlib==3.7.5
modelscope==1.20.0
networkx==3.1
numpy==1.26.4
omegaconf==2.3.0
onnx==1.16.0
onnxruntime==1.18.0
openai-whisper>=20240930
protobuf==4.25
pyarrow==18.1.0
pydantic==2.7.0
rich==13.7.1
soundfile==0.12.1
transformers==4.51.3
x-transformers==2.11.24
wetext==0.0.4
wget==3.2
huggingface_hub
funasr>=1.1
pypinyin
setuptools<70
gdown==5.1.0
pyworld==0.3.4
REQ
venv/bin/python -c "import torch, funasr, pypinyin, pyworld, whisper, wetext" 2> /dev/null || \
  uv pip install --python venv/bin/python --index-strategy unsafe-best-match \
    --extra-index-url https://download.pytorch.org/whl/cpu -r req-cpu.txt

# 4. 模型（huggingface，约 7 GB）。RL 版：把 llm.rl.pt 当 llm.pt 用，链接到 models/CV3-RL/
if [ ! -f models/Fun-CosyVoice3-0.5B/llm.rl.pt ]; then
  venv/bin/python -c "from huggingface_hub import snapshot_download as d; d('FunAudioLLM/Fun-CosyVoice3-0.5B-2512', local_dir='models/Fun-CosyVoice3-0.5B')"
fi
mkdir -p models/CV3-RL
for f in models/Fun-CosyVoice3-0.5B/*; do
  b=$(basename "$f")
  case "$b" in llm.pt|llm.rl.pt) ;; *) ln -sfn "../Fun-CosyVoice3-0.5B/$b" "models/CV3-RL/$b" ;; esac
done
ln -sfn ../Fun-CosyVoice3-0.5B/llm.rl.pt models/CV3-RL/llm.pt
rm -f models/Fun-CosyVoice3-0.5B/llm.pt      # 非 RL 版的 llm 用不上，删掉省 2 GB

# 5. 检查一下能不能加载（只 import，不加载模型）
venv/bin/python -c "
import sys; sys.path[:0] = ['CosyVoice', 'CosyVoice/third_party/Matcha-TTS']
from cosyvoice.cli.cosyvoice import AutoModel
import funasr, pypinyin, pyworld
print('配音环境好了')"
echo "合成：cd 某集/源码 && $T/venv/bin/python narrate_cosy.py $T/CosyVoice $T/models/CV3-RL [编号 ...]"
