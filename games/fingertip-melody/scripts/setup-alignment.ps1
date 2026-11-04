param([string]$Python = 'python', [switch]$Advanced)
$ErrorActionPreference = 'Stop'
$gameRoot = Split-Path $PSScriptRoot -Parent
function Run-Checked([string]$Executable, [string[]]$Arguments) {
    & $Executable @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Command failed: $Executable" }
}
Run-Checked $Python @('-m', 'venv', "$gameRoot/.venv")
$venvPython = "$gameRoot/.venv/Scripts/python.exe"
Run-Checked $venvPython @('-m', 'pip', 'install', '-r', "$PSScriptRoot/requirements-lite.txt")
Run-Checked $venvPython @("$PSScriptRoot/setup_lite.py")
if (!$Advanced) {
    Write-Host 'Lite alignment ready. Add -Advanced to install the optional WhisperX worker.'
    exit 0
}
Run-Checked $venvPython @('-m', 'pip', 'install', 'torch', 'torchaudio', '--index-url', 'https://download.pytorch.org/whl/cpu')
Run-Checked $venvPython @('-m', 'pip', 'install', '-r', "$PSScriptRoot/requirements.txt")
# Alignment-only use: ASR/diarization and their GPU dependencies are not imported.
Run-Checked $venvPython @('-m', 'pip', 'install', '--no-deps', 'whisperx==3.8.6')
New-Item -ItemType Directory -Force -Path "$gameRoot/.tools", "$gameRoot/.models/sofa" | Out-Null
if (!(Test-Path -LiteralPath "$gameRoot/.models/nltk_data/tokenizers/punkt_tab/english")) {
    Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/tokenizers/punkt_tab.zip' -OutFile "$gameRoot/.models/punkt_tab.zip"
    Expand-Archive -LiteralPath "$gameRoot/.models/punkt_tab.zip" -DestinationPath "$gameRoot/.models/nltk_data/tokenizers" -Force
}
if (!(Test-Path -LiteralPath "$gameRoot/.tools/SOFA/.git")) {
    Run-Checked 'git' @('clone', 'https://github.com/qiuqiao/SOFA.git', "$gameRoot/.tools/SOFA")
}
Run-Checked 'git' @('-C', "$gameRoot/.tools/SOFA", 'checkout', '9549c6a86d16019c817eefe4bb8183405da524cc')
$checkpoint = "$gameRoot/.models/sofa/pretrained_mandarin_singing/v1.0.0_mandarin_singing.ckpt"
if (!(Test-Path -LiteralPath $checkpoint)) {
    Invoke-WebRequest -Uri 'https://github.com/qiuqiao/SOFA/releases/download/v1.0.1/pretrained_mandarin_singing.zip' -OutFile "$gameRoot/.models/sofa.zip"
    Expand-Archive -LiteralPath "$gameRoot/.models/sofa.zip" -DestinationPath "$gameRoot/.models/sofa" -Force
}
Run-Checked $venvPython @("$PSScriptRoot/prepare_advanced.py")
Write-Host 'Ready. Run .venv/Scripts/python.exe scripts/align.py from the game directory.'
