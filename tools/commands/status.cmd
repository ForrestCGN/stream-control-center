@echo off
setlocal

cd /d "%~dp0\..\.."

echo.
echo [status] Repo: %CD%
echo.

call "tools\easy\03_NUR_STATUS_PRUEFEN.cmd" %*

set "EXITCODE=%ERRORLEVEL%"
echo.
if "%EXITCODE%"=="0" (
  echo [status] Fertig.
) else (
  echo [status] Fehler. ExitCode=%EXITCODE%
)

endlocal & exit /b %EXITCODE%
