@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "STEP_DESC=%~1"
if "%STEP_DESC%"=="" set "STEP_DESC=Test-Deploy"
set "TMP_CHANGED=%TEMP%\scc_testdeploy_changed_%RANDOM%.txt"
set "TMP_JS=%TEMP%\scc_testdeploy_js_%RANDOM%.txt"
set "NEEDS_NODE_RESTART=0"

echo.
echo ============================================================
echo [testdeploy] Lokalen Stand nach Live deployen - ohne Commit/Push
echo ============================================================
echo Beschreibung: %STEP_DESC%
echo Repo: %CD%
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

echo [testdeploy] Git-Status vor Test-Deploy:
git status --short --untracked-files=all
if errorlevel 1 goto fail

(
  git diff --name-only
  git ls-files --others --exclude-standard
) > "%TMP_CHANGED%"

findstr /I /R "\.env$ \.sqlite$ \.sqlite3$ \.db$ \.zip$ \.7z$ \.bak$ \.old$ \.tmp$ \.temp$ token secret password credential" "%TMP_CHANGED%" >nul
if not errorlevel 1 (
  echo.
  echo [error] Blockierte Datei im lokalen Arbeitsstand erkannt:
  findstr /I /R "\.env$ \.sqlite$ \.sqlite3$ \.db$ \.zip$ \.7z$ \.bak$ \.old$ \.tmp$ \.temp$ token secret password credential" "%TMP_CHANGED%"
  goto fail
)

findstr /I /R "data/sqlite data\\sqlite secrets/ secrets\\" "%TMP_CHANGED%" >nul
if not errorlevel 1 (
  echo.
  echo [error] Blockierter Pfad im lokalen Arbeitsstand erkannt:
  findstr /I /R "data/sqlite data\\sqlite secrets/ secrets\\" "%TMP_CHANGED%"
  goto fail
)

findstr /I /R "^backend/ ^backend\\" "%TMP_CHANGED%" >nul
if not errorlevel 1 set "NEEDS_NODE_RESTART=1"

echo.
echo ============================================================
echo [testdeploy] JS-Syntaxcheck geaenderter Dateien
echo ============================================================
findstr /I /R "^backend/.*\.js$ ^htdocs/.*\.js$" "%TMP_CHANGED%" > "%TMP_JS%" 2>nul
if errorlevel 1 (
  echo [info] Keine geaenderten JS-Dateien in backend/ oder htdocs/ gefunden.
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
echo [testdeploy] Deploy nach D:\Streaming\stramAssets mit Backup
echo ============================================================
if not exist "tools\deploy_repo_to_streamassets.ps1" (
  echo [error] Deploy-Script fehlt: tools\deploy_repo_to_streamassets.ps1
  goto fail
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%CD%\tools\deploy_repo_to_streamassets.ps1"
if errorlevel 1 goto fail

echo.
echo ============================================================
echo [testdeploy] Fertig - jetzt live testen
echo ============================================================
echo [ok] Live wurde aus dem lokalen Repo-Stand aktualisiert.
echo [ok] Kein Commit und kein GitHub-Push wurden ausgefuehrt.
if "%NEEDS_NODE_RESTART%"=="1" (
  echo [wichtig] Backend-Dateien wurden geaendert. Node jetzt beenden/neustarten, dann testen.
) else (
  echo [hinweis] Keine backend/-Aenderung erkannt. Node-Neustart ist wahrscheinlich nicht noetig.
)
echo.
echo Wenn Test OK:
echo   .\stepdone.cmd "Beschreibung"
echo Wenn Test kaputt:
echo   .\stepundo.cmd

del "%TMP_CHANGED%" >nul 2>nul
del "%TMP_JS%" >nul 2>nul
exit /b 0

:fail
echo.
echo [error] testdeploy ist fehlgeschlagen. Kein Commit/Push wurde ausgefuehrt.
del "%TMP_CHANGED%" >nul 2>nul
del "%TMP_JS%" >nul 2>nul
exit /b 1
