"""Explicitly prepare the optional advanced worker; never called by HTTP probes."""
from align import WhisperXAligner, SofaAligner
from pathlib import Path
import nltk
import torchaudio

root = Path(__file__).resolve().parents[1]
nltk.download('punkt_tab', download_dir=str(root / '.models/nltk_data'), raise_on_error=True)
WhisperXAligner(SofaAligner(root / '.tools/SOFA', root / '.models/sofa/pretrained_mandarin_singing/v1.0.0_mandarin_singing.ckpt'))
torchaudio.pipelines.HDEMUCS_HIGH_MUSDB_PLUS.get_model()
