@echo off
setlocal

set REPO=D:\Git\stream-control-center
set MSG=Update local StreamAssets changes

echo ============================================================
echo  CONTROL-CENTER - LOKALE AENDERUNGEN ZU GITHUB HOCHLADEN
echo ============================================================
echo.

if not exist "%REPO%" (
  echo [FEHLER] Repo-Ordner nicht gefunden: %REPO%
  pause
  exit /b 1
)

cd /d "%REPO%"

echo [1/5] Branch dev setzen...
git checkout dev
if errorlevel 1 goto error

echo.
echo [2/5] Lokale StreamAssets-Dateien sicher ins Repo kopieren...
powershell -NoProfile -ExecutionPolicy Bypass -File "%REPO%\tools\upload_streamassets_changes.ps1"
if errorlevel 1 goto error

echo.
echo [3/5] Alles erlaubte vormerken...
git add backend config htdocs project-state docs tools
if errorlevel 1 goto error

echo.
echo [4/5] Sicherheitscheck auf verdächtige Dateinamen...
git diff --cached --name-only | findstr /R /I "\.env \.sqlite \.db token secret google_tts_service_account \.bak \.old \.alt \.new \.zip \.7z"
if not errorlevel 1 (
  echo.
  echo [STOP] Verdächtige Datei gefunden. Bitte NICHT committen.
  echo Sende die Ausgabe an ChatGPT.
  pause
  exit /b 1
)

echo OK: Keine verdächtigen Dateinamen.

echo.
echo [5/5] Commit und Push...
git commit -m "%MSG%"
if errorlevel 1 (
  echo.
  echo [INFO] Kein Commit erstellt. Eventuell gab es keine Änderungen.
  git status
  pause
  exit /b 0
)

git push origin dev
if errorlevel 1 goto error

echo.
echo ============================================================
echo  FERTIG. Aenderungen wurden nach GitHub dev gepusht.
echo ============================================================
echo.
pause
exit /b 0

:error
echo.
echo [FEHLER] Vorgang abgebrochen. Bitte Ausgabe kopieren und in ChatGPT senden.
pause
exit /b 1
