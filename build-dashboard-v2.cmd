@echo off
setlocal EnableExtensions

cd /d "%~dp0"

echo.
echo ============================================================
echo [dashboard-v2] Build fuer lokalen Server
echo ============================================================
echo.

if not exist "frontend\dashboard-v2\package.json" (
  echo [error] frontend\dashboard-v2\package.json nicht gefunden.
  echo [error] Bitte im Repo-Root ausfuehren.
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo [error] node wurde nicht gefunden.
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [error] npm.cmd wurde nicht gefunden.
  exit /b 1
)

echo [info] Node:
node -v
if errorlevel 1 (
  echo [error] node -v fehlgeschlagen.
  exit /b 1
)

echo [info] npm:
call npm.cmd -v
if errorlevel 1 (
  echo [error] npm.cmd -v fehlgeschlagen.
  exit /b 1
)

echo.
echo [dashboard-v2] Installiere/aktualisiere Dependencies...
pushd frontend\dashboard-v2
call npm.cmd install
if errorlevel 1 (
  popd
  echo [error] npm install fehlgeschlagen.
  exit /b 1
)

echo.
echo [dashboard-v2] Baue React/Vite Frontend...
call npm.cmd run build
if errorlevel 1 (
  popd
  echo [error] npm run build fehlgeschlagen.
  exit /b 1
)

popd

echo.
if not exist "htdocs\dashboard-v2\index.html" (
  echo [error] Build fertig, aber htdocs\dashboard-v2\index.html fehlt.
  exit /b 1
)

echo [ok] Build erstellt:
echo      htdocs\dashboard-v2\index.html
echo.
echo [naechster Test]
echo      http://127.0.0.1:8080/dashboard-v2/
echo.
echo [hinweis] Kein Backend-Neustart noetig, sofern nur statische htdocs-Dateien erzeugt wurden.
exit /b 0
