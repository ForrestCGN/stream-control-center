@echo off
setlocal

cd /d "%~dp0\..\.."

echo.
echo [restore] Repo: %CD%
echo [restore] Starte Backup-Restore ueber bestehendes Easy-Script...
echo.

call "tools\easy\04_BACKUP_ZURUECKSPIELEN.cmd" %*

set "EXITCODE=%ERRORLEVEL%"
echo.
if "%EXITCODE%"=="0" (
  echo [restore] Fertig.
) else (
  echo [restore] Fehler. ExitCode=%EXITCODE%
)

endlocal & exit /b %EXITCODE%
