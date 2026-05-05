@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"

set "COMMIT_MSG=%~1"

echo.
echo ============================================================
echo [stepdone] Repo pruefen
echo ============================================================
git status --short --untracked-files=all
if errorlevel 1 goto fail

if "%COMMIT_MSG%"=="" (
  echo.
  set /p COMMIT_MSG=Commit-Beschreibung eingeben: 
)

if "%COMMIT_MSG%"=="" (
  echo [error] Keine Commit-Beschreibung angegeben.
  exit /b 1
)

echo.
echo ============================================================
echo [stepdone] JS-Syntax pruefen
echo ============================================================

if exist "backend\modules\hug.js" (
  echo ^> node -c backend\modules\hug.js
  node -c "backend\modules\hug.js"
  if errorlevel 1 goto fail
)

if exist "htdocs\dashboard\modules\hug.js" (
  echo ^> node -c htdocs\dashboard\modules\hug.js
  node -c "htdocs\dashboard\modules\hug.js"
  if errorlevel 1 goto fail
)

if exist "htdocs\dashboard\modules\tagebuch.js" (
  echo ^> node -c htdocs\dashboard\modules\tagebuch.js
  node -c "htdocs\dashboard\modules\tagebuch.js"
  if errorlevel 1 goto fail
)

if exist "htdocs\dashboard\modules\todo.js" (
  echo ^> node -c htdocs\dashboard\modules\todo.js
  node -c "htdocs\dashboard\modules\todo.js"
  if errorlevel 1 goto fail
)

if exist "htdocs\dashboard\modules\vip.js" (
  echo ^> node -c htdocs\dashboard\modules\vip.js
  node -c "htdocs\dashboard\modules\vip.js"
  if errorlevel 1 goto fail
)

echo.
echo ============================================================
echo [stepdone] Dateien vormerken
echo ============================================================

if exist "backend" git add backend
if exist "htdocs" git add htdocs
if exist "config" git add config
if exist "docs" git add docs
if exist "project-state" git add project-state
if exist "tools" git add tools

if exist "check.cmd" git add check.cmd
if exist "commit.cmd" git add commit.cmd
if exist "deploy.cmd" git add deploy.cmd
if exist "pull.cmd" git add pull.cmd
if exist "restore.cmd" git add restore.cmd
if exist "status.cmd" git add status.cmd
if exist "stepdone.cmd" git add stepdone.cmd

echo.
echo ============================================================
echo [stepdone] Sicherheitscheck staged Dateien
echo ============================================================

git diff --cached --name-only > "%TEMP%\stepdone_staged.txt"
findstr /I /R "\.env$ \.sqlite$ \.sqlite3$ \.db$ \.zip$ \.7z$ \.bak$ \.old$ \.tmp$ \.temp$ token secret password credential" "%TEMP%\stepdone_staged.txt" >nul
if not errorlevel 1 (
  echo [error] Blockierte Datei erkannt:
  findstr /I /R "\.env$ \.sqlite$ \.sqlite3$ \.db$ \.zip$ \.7z$ \.bak$ \.old$ \.tmp$ \.temp$ token secret password credential" "%TEMP%\stepdone_staged.txt"
  git reset
  del "%TEMP%\stepdone_staged.txt" >nul 2>nul
  exit /b 1
)

findstr /I /R "data/sqlite data\\sqlite secrets/ secrets\\" "%TEMP%\stepdone_staged.txt" >nul
if not errorlevel 1 (
  echo [error] Blockierter Pfad erkannt:
  findstr /I /R "data/sqlite data\\sqlite secrets/ secrets\\" "%TEMP%\stepdone_staged.txt"
  git reset
  del "%TEMP%\stepdone_staged.txt" >nul 2>nul
  exit /b 1
)

del "%TEMP%\stepdone_staged.txt" >nul 2>nul

echo [ok] Sicherheitscheck bestanden.

echo.
echo ============================================================
echo [stepdone] Commit und Push
echo ============================================================

git diff --cached --quiet
if not errorlevel 1 (
  echo [warn] Keine staged Changes gefunden. Commit/Push wird uebersprungen.
) else (
  git status --short
  git commit -m "%COMMIT_MSG%"
  if errorlevel 1 goto fail

  git push origin dev
  if errorlevel 1 goto fail
)

echo.
echo ============================================================
echo [stepdone] Live aus GitHub/dev aktualisieren
echo ============================================================

if not exist "tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd" (
  echo [error] Deploy-Script nicht gefunden: tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd
  exit /b 1
)

call "tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd"
if errorlevel 1 goto fail

echo.
echo ============================================================
echo [stepdone] Abschlussstatus
echo ============================================================
git status --short --untracked-files=all
if errorlevel 1 goto fail

echo.
echo [ok] Fertig.
echo [hinweis] Wenn Backend-Dateien geaendert wurden und Node nicht automatisch neu startet: Backend jetzt neu starten.
exit /b 0

:fail
echo.
echo [error] stepdone ist fehlgeschlagen.
exit /b 1
