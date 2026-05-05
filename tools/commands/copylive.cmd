@echo off
setlocal

cd /d "%~dp0\..\.."

powershell -NoProfile -ExecutionPolicy Bypass -File "tools\commands\copy_repo_changes_to_live.ps1" %*

set "EXITCODE=%ERRORLEVEL%"
endlocal & exit /b %EXITCODE%
