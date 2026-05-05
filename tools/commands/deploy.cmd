@echo off
setlocal

cd /d "%~dp0\..\.."

echo.
echo [deploy] Repo: %CD%
echo [deploy] Starte Live-Aktualisierung von GitHub/dev...
echo.

call "tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd" %*

set "EXITCODE=%ERRORLEVEL%"
echo.
if "%EXITCODE%"=="0" (
  echo [deploy] Fertig.
) else (
  echo [deploy] Fehler. ExitCode=%EXITCODE%
)

endlocal & exit /b %EXITCODE%
