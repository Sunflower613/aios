"""Check the locally configured WhisperX worker without importing torch or allocating models."""
import importlib.util
import json
import os
from pathlib import Path


def available():
    if not all(importlib.util.find_spec(name) for name in
               ('whisperx', 'torch', 'torchaudio', 'nltk', 'lightning', 'transformers', 'pypinyin', 'librosa')):
        return False
    root = Path(__file__).resolve().parents[1]
    model = root / '.models/sofa/pretrained_mandarin_singing/v1.0.0_mandarin_singing.ckpt'
    cache = Path(os.getenv('XDG_CACHE_HOME', Path.home() / '.cache'))
    hf = Path(os.getenv('HF_HUB_CACHE', Path(os.getenv('HF_HOME', cache / 'huggingface')) / 'hub'))
    repo = hf / 'models--jonatasgrosman--wav2vec2-large-xlsr-53-chinese-zh-cn'
    revision = repo / 'refs/main'
    if not revision.is_file():
        return False
    snapshot = repo / 'snapshots' / revision.read_text().strip()
    torch_home = Path(os.getenv('TORCH_HOME', cache / 'torch'))
    return (model.is_file() and (root / '.tools/SOFA/dictionary/opencpop-extension.txt').is_file()
            and (root / '.models/nltk_data/tokenizers/punkt_tab/english').is_dir()
            and all((snapshot / f).is_file() for f in ('config.json', 'vocab.json', 'preprocessor_config.json'))
            and any((snapshot / f).is_file() for f in ('model.safetensors', 'pytorch_model.bin'))
            and (torch_home / 'hub/torchaudio/models/hdemucs_high_trained.pt').is_file())


if __name__ == '__main__':
    print(json.dumps(available()))
