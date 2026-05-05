@echo off
setlocal

cd /d "%~dp0\..\.."

echo.
echo [pull] Repo: %CD%
echo [pull] Checkout dev + pull origin/dev. Kein Live-Deploy.
echo.

git checkout dev
if errorlevel 1 goto :fail

git pull origin dev
if errorlevel 1 goto :fail

echo.
echo [pull] Fertig.
endlocal & exit /b 0

:fail
set "EXITCODE=%ERRORLEVEL%"
echo.
echo [pull] Fehler. ExitCode=%EXITCODE%
endlocal & exit /b %EXITCODE%
