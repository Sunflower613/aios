#!/usr/bin/env bash
# Prepare/install the melody backend only. Caddy activation is a separate step.
set -euo pipefail
[[ $(id -u) == 0 ]] || { echo 'Run with sudo'; exit 1; }
SRC=${MELODY_SOURCE:-/home/ubuntu/apps/aios-src}
APP=/home/ubuntu/apps/fingertip-melody
DATA=/var/lib/fingertip-melody
PYTHON=${MELODY_SYSTEM_PYTHON:-python3.12}
command -v "$PYTHON" >/dev/null
/home/ubuntu/.local/node/bin/node -e 'if(Number(process.versions.node.split(".")[0])<22)process.exit(1)'
install -d -o ubuntu -g ubuntu "$APP" "$DATA" "$DATA/media" "$DATA/cache"
rsync -a --exclude media --exclude .venv --exclude .tools --exclude .models --exclude __pycache__ "$SRC/games/fingertip-melody/" "$APP/"
chown -R ubuntu:ubuntu "$APP"
runuser -u ubuntu -- "$PYTHON" -m venv "$APP/.venv"
runuser -u ubuntu -- "$APP/.venv/bin/python" -m pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
runuser -u ubuntu -- "$APP/.venv/bin/python" -m pip install -r "$APP/scripts/requirements.txt"
runuser -u ubuntu -- "$APP/.venv/bin/python" -m pip install --no-deps whisperx==3.8.6
runuser -u ubuntu -- mkdir -p "$APP/.tools" "$APP/.models"
if [[ ! -d "$APP/.tools/SOFA/.git" ]]; then
  runuser -u ubuntu -- git clone https://github.com/qiuqiao/SOFA.git "$APP/.tools/SOFA"
fi
runuser -u ubuntu -- git -C "$APP/.tools/SOFA" checkout 9549c6a86d16019c817eefe4bb8183405da524cc
runuser -u ubuntu -- "$APP/.venv/bin/python" - "$APP" <<'PY'
import sys, urllib.request, zipfile
from pathlib import Path
root=Path(sys.argv[1]) / '.models'
for url, target, marker in [
 ('https://github.com/qiuqiao/SOFA/releases/download/v1.0.1/pretrained_mandarin_singing.zip',root/'sofa','pretrained_mandarin_singing/v1.0.0_mandarin_singing.ckpt'),
 ('https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/tokenizers/punkt_tab.zip',root/'nltk_data/tokenizers','punkt_tab/english')]:
 if (target/marker).exists(): continue
 target.mkdir(parents=True,exist_ok=True)
 archive=root/(target.name+'.zip'); urllib.request.urlretrieve(url,archive)
 with zipfile.ZipFile(archive) as z:
  for member in z.infolist():
   if not (target/member.filename).resolve().is_relative_to(target.resolve()): raise ValueError('Unsafe archive')
  z.extractall(target)
PY
if [[ ! -f "$APP/server.env" ]]; then
  cat > "$APP/server.env" <<'ENV'
MELODY_PORT=8765
MELODY_ORIGINS=https://124.222.183.43:8443,https://sunflower.dpdns.org
MELODY_MEDIA_DIR=/var/lib/fingertip-melody/media
MELODY_PYTHON=/home/ubuntu/apps/fingertip-melody/.venv/bin/python
HF_HOME=/var/lib/fingertip-melody/cache/huggingface
TORCH_HOME=/var/lib/fingertip-melody/cache/torch
NUMBA_CACHE_DIR=/var/lib/fingertip-melody/cache/numba
MPLCONFIGDIR=/var/lib/fingertip-melody/cache/matplotlib
HF_HUB_DISABLE_XET=1
ENV
  chown ubuntu:ubuntu "$APP/server.env"; chmod 600 "$APP/server.env"
fi
# Media is not committed; copy prepared songs only when initializing an empty server library.
if [[ ! -f "$DATA/media/library.json" && -f "$SRC/games/fingertip-melody/media/library.json" ]]; then
  rsync -a --exclude 'local-*' --exclude 'jobs-state*' --exclude '*.vocals.*' "$SRC/games/fingertip-melody/media/" "$DATA/media/"
  chown -R ubuntu:ubuntu "$DATA/media"
  runuser -u ubuntu -- "$APP/.venv/bin/python" - "$DATA/media/library.json" <<'PY'
import json,sys
from pathlib import Path
p=Path(sys.argv[1]); p.write_text(json.dumps([s for s in json.loads(p.read_text()) if s.get('source')!='upload'],ensure_ascii=False,indent=2))
PY
fi
chown -R ubuntu:ubuntu "$DATA"
install -m 644 "$SRC/deploy/fingertip-melody.service" /etc/systemd/system/fingertip-melody.service
systemctl daemon-reload
systemctl enable --now fingertip-melody.service
systemctl restart fingertip-melody.service
curl --fail --silent --retry 10 --retry-connrefused --retry-delay 1 http://127.0.0.1:8765/api/melody/health
echo
echo 'Backend ready. Deploy the frontend and updated aios.Caddyfile, validate Caddy, then reload aios-caddy.'
