@echo off
setlocal EnableExtensions

set "STEP=RDAP_DESIGN1_REAL_CGN_LOGIN_CLEANUP"
set "REPO=D:\Git\stream-control-center"
set "SRC=%~dp0remote-modboard"
set "DST=%REPO%\remote-modboard"

if not exist "%REPO%\.git" (
  echo [error] Repo nicht gefunden: %REPO%
  echo [hint] Bitte im Script den REPO-Pfad pruefen.
  exit /b 1
)

if not exist "%SRC%\backend\public\index.html" (
  echo [error] Step-Dateien fehlen im entpackten ZIP: %SRC%
  exit /b 1
)

if not exist "%DST%\backend\public\index.html" (
  echo [error] Ziel-Datei nicht gefunden: %DST%\backend\public\index.html
  exit /b 1
)

for /f "tokens=1-4 delims=.:-/ " %%a in ("%date%-%time%") do set "STAMP=%%c%%b%%a_%%d"
set "BACKUP=%REPO%\_handoff\backups\%STEP%_%STAMP%"
mkdir "%BACKUP%\remote-modboard\backend\public\assets" >nul 2>nul

copy /Y "%DST%\backend\public\index.html" "%BACKUP%\remote-modboard\backend\public\index.html" >nul
copy /Y "%DST%\backend\public\assets\remote-modboard.css" "%BACKUP%\remote-modboard\backend\public\assets\remote-modboard.css" >nul

copy /Y "%SRC%\backend\public\index.html" "%DST%\backend\public\index.html" >nul
if errorlevel 1 exit /b 1
copy /Y "%SRC%\backend\public\assets\remote-modboard.css" "%DST%\backend\public\assets\remote-modboard.css" >nul
if errorlevel 1 exit /b 1

cd /d "%REPO%"

echo.
echo ============================================================
echo [ok] %STEP% eingespielt
echo ============================================================
echo Backup:
echo %BACKUP%
echo.
echo Geaenderte Dateien:
git status --short -- remote-modboard/backend/public/index.html remote-modboard/backend/public/assets/remote-modboard.css
echo.
echo Diff-Kurzuebersicht:
git diff --stat -- remote-modboard/backend/public/index.html remote-modboard/backend/public/assets/remote-modboard.css
echo.
echo Naechster Schritt: lokal im Browser pruefen. Bei Erfolg stepdone.cmd ausfuehren.

endlocal
