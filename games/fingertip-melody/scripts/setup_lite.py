"""Install the small CPU alignment model. The runtime never downloads weights."""
import hashlib
import shutil
import tarfile
import tempfile
import urllib.request
from pathlib import Path

NAME = 'sherpa-onnx-streaming-zipformer-small-ctc-zh-int8-2025-04-01'
ROOT = Path(__file__).resolve().parents[1] / '.models/lite'
MODEL = ROOT / NAME
FILES = ('model.int8.onnx', 'bbpe.model')

def install():
    if all((MODEL / name).is_file() for name in FILES):
        return
    ROOT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=ROOT) as tmp:
        archive = Path(tmp) / 'model.tar.bz2'
        urllib.request.urlretrieve(f'https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/{NAME}.tar.bz2', archive)
        with archive.open('rb') as f:
            if hashlib.file_digest(f, 'sha256').hexdigest() != 'b3b309f7ce4a737195fcc6963ea19b0653a7d3401580af5ae0d3e284cbb71f0b':
                raise ValueError('Unexpected lite model checksum; rerun setup.')
        with tarfile.open(archive) as tar:
            for name in FILES:
                with tar.extractfile(f'{NAME}/{name}') as src, (Path(tmp) / name).open('wb') as dst:
                    shutil.copyfileobj(src, dst)
        MODEL.mkdir(exist_ok=True)
        for name in FILES:
            (Path(tmp) / name).replace(MODEL / name)

if __name__ == '__main__':
    install()
