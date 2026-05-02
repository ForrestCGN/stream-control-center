@echo off
setlocal

set REPO=D:\Git\stream-control-center

echo ============================================================
echo  CONTROL-CENTER - LIVE AUS GITHUB AKTUALISIEREN
echo ============================================================
echo.

if not exist "%REPO%" (
  echo [FEHLER] Repo-Ordner nicht gefunden: %REPO%
  pause
  exit /b 1
)

cd /d "%REPO%"

echo [1/3] Branch dev setzen...
git checkout dev
if errorlevel 1 goto error

echo.
echo [2/3] Neue Dateien von GitHub holen...
git pull origin dev
if errorlevel 1 goto error

echo.
echo [3/3] Nach D:\Streaming\stramAssets deployen mit Backup...
powershell -NoProfile -ExecutionPolicy Bypass -File "%REPO%\tools\deploy_repo_to_streamassets.ps1"
if errorlevel 1 goto error

echo.
echo ============================================================
echo  FERTIG.
echo  Backup liegt unter: D:\Streaming\stramAssets_DEPLOY_BACKUP
echo  Dashboard testen: http://127.0.0.1:8080/dashboard/
echo ============================================================
echo.
pause
exit /b 0

:error
echo.
echo [FEHLER] Vorgang abgebrochen. Bitte Ausgabe kopieren und in ChatGPT senden.
pause
exit /b 1
