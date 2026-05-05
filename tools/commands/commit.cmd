@echo off
setlocal

cd /d "%~dp0\..\.."

echo.
echo [commit] Repo: %CD%
echo [commit] Starte Upload/Commit nach GitHub/dev ueber bestehendes Easy-Script...
echo.

call "tools\easy\02_LOKALE_AENDERUNGEN_ZU_GITHUB_HOCHLADEN.cmd" %*

set "EXITCODE=%ERRORLEVEL%"
echo.
if "%EXITCODE%"=="0" (
  echo [commit] Fertig.
) else (
  echo [commit] Fehler. ExitCode=%EXITCODE%
)

endlocal & exit /b %EXITCODE%
