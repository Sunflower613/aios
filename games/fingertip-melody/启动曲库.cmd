@echo off
cd /d "%~dp0" || goto :failed
where node.exe >nul 2>nul || goto :missing
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)" || goto :missing
if not exist "node_modules\NeteaseCloudMusicApi\main.js" (
  call npm.cmd ci --ignore-scripts --no-audit || goto :failed
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\restart-local.ps1
if errorlevel 1 goto :failed
pause
exit /b 0
:missing
echo Please install Node.js 22 or later, then reopen this launcher.
:failed
echo Startup failed. See the error above.
pause
exit /b 1
