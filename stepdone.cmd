@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"

set "COMMIT_MSG=%~1"
set "DO_DEPLOY=0"
set "TMP_CHANGED=%TEMP%\scc_stepdone_changed_%RANDOM%.txt"
set "TMP_STAGED=%TEMP%\scc_stepdone_staged_%RANDOM%.txt"
set "TMP_JS=%TEMP%\scc_stepdone_js_%RANDOM%.txt"

if /I "%COMMIT_MSG%"=="--deploy" (
  set "COMMIT_MSG="
  set "DO_DEPLOY=1"
)

if /I "%~2"=="--deploy" set "DO_DEPLOY=1"

echo.
echo ============================================================
echo [stepdone] Getesteten Stand finalisieren - Commit + Push
echo ============================================================
echo.

if not exist ".git" (
  echo [error] Kein Git-Repo gefunden. Bitte im Repo-Root ausfuehren.
  exit /b 1
)

for /f "usebackq delims=" %%B in (`git branch --show-current`) do set "BRANCH=%%B"

if /I not "%BRANCH%"=="dev" (
  echo [error] Aktueller Branch ist '%BRANCH%', erwartet: dev
  exit /b 1
)

if "%COMMIT_MSG%"=="" (
  echo.
  set /p COMMIT_MSG=Commit-Beschreibung eingeben:
)

if "%COMMIT_MSG%"=="" (
  echo [error] Keine Commit-Beschreibung angegeben.
  exit /b 1
)

echo [stepdone] Git-Status vor Commit:
git status --short --untracked-files=all
if errorlevel 1 goto fail

(
  git diff --name-only
  git ls-files --others --exclude-standard
) > "%TMP_CHANGED%"

echo.
echo ============================================================
echo [stepdone] JS-Syntaxcheck geaenderter Dateien
echo ============================================================

findstr /I /R "^backend/.*\.js$ ^htdocs/.*\.js$ ^frontend/.*\.js$ ^frontend/.*\.jsx$" "%TMP_CHANGED%" > "%TMP_JS%" 2>nul

if errorlevel 1 (
  echo [info] Keine geaenderten JS/JSX-Dateien in backend/, htdocs/ oder frontend/ gefunden.
) else (
  for /f "usebackq delims=" %%F in ("%TMP_JS%") do (
    if exist "%%F" (
      echo ^> node -c %%F
      node -c "%%F"
      if errorlevel 1 goto fail
    )
  )
)

echo.
echo ============================================================
echo [stepdone] Erlaubte Projektbereiche vormerken
echo ============================================================

if exist "backend" git add backend
if exist "htdocs" git add htdocs
if exist "config" git add config
if exist "docs" git add docs
if exist "project-state" git add project-state
if exist "tools" git add tools
if exist "frontend" git add frontend

if exist "check.cmd" git add check.cmd
if exist "commit.cmd" git add commit.cmd
if exist "deploy.cmd" git add deploy.cmd
if exist "pull.cmd" git add pull.cmd
if exist "restore.cmd" git add restore.cmd
if exist "status.cmd" git add status.cmd
if exist "installstep.cmd" git add installstep.cmd
if exist "testdeploy.cmd" git add testdeploy.cmd
if exist "stepdone.cmd" git add stepdone.cmd
if exist "stepundo.cmd" git add stepundo.cmd
if exist "stepstatus.cmd" git add stepstatus.cmd

echo.
echo ============================================================
echo [stepdone] Sicherheitscheck staged Dateien
echo ============================================================

git diff --cached --name-only > "%TMP_STAGED%"

findstr /I /R "\.env$ \.sqlite$ \.sqlite3$ \.db$ \.zip$ \.7z$ \.bak$ \.old$ \.tmp$ \.temp$ token secret password credential" "%TMP_STAGED%" >nul
if not errorlevel 1 (
  echo [error] Blockierte Datei erkannt:
  findstr /I /R "\.env$ \.sqlite$ \.sqlite3$ \.db$ \.zip$ \.7z$ \.bak$ \.old$ \.tmp$ \.temp$ token secret password credential" "%TMP_STAGED%"
  git reset
  goto fail
)

findstr /I /R "data/sqlite data\\sqlite secrets/ secrets\\" "%TMP_STAGED%" >nul
if not errorlevel 1 (
  echo [error] Blockierter Pfad erkannt:
  findstr /I /R "data/sqlite data\\sqlite secrets/ secrets\\" "%TMP_STAGED%"
  git reset
  goto fail
)

echo [ok] Sicherheitscheck bestanden.

git diff --cached --quiet
if not errorlevel 1 (
  echo [warn] Keine staged Changes gefunden. Commit/Push wird uebersprungen.
) else (
  echo.
  echo ============================================================
  echo [stepdone] Commit und Push nach GitHub/dev
  echo ============================================================
  git status --short
  git commit -m "%COMMIT_MSG%"
  if errorlevel 1 goto fail
  git push origin dev
  if errorlevel 1 goto fail
)

if "%DO_DEPLOY%"=="1" (
  echo.
  echo ============================================================
  echo [stepdone] Optionaler Deploy nach Live
  echo ============================================================
  powershell -NoProfile -ExecutionPolicy Bypass -File "%CD%\tools\deploy_repo_to_streamassets.ps1"
  if errorlevel 1 goto fail
) else (
  echo.
  echo [hinweis] Kein Live-Deploy im stepdone-Standard.
  echo [hinweis] Live wurde vorher mit testdeploy.cmd getestet.
)

echo.
echo ============================================================
echo [stepdone] Abschlussstatus
echo ============================================================

git status --short --untracked-files=all
if errorlevel 1 goto fail

echo.
echo [ok] Fertig. GitHub/dev enthaelt jetzt den getesteten Stand.

del "%TMP_CHANGED%" >nul 2>nul
del "%TMP_STAGED%" >nul 2>nul
del "%TMP_JS%" >nul 2>nul
exit /b 0

:fail
echo.
echo [error] stepdone ist fehlgeschlagen.
del "%TMP_CHANGED%" >nul 2>nul
del "%TMP_STAGED%" >nul 2>nul
del "%TMP_JS%" >nul 2>nul
exit /b 1
