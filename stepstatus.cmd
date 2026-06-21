@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo.
echo ============================================================
echo [stepstatus] stream-control-center Status
echo ============================================================
echo Repo: %CD%
echo.

echo [Branch]
git branch -vv

echo.
echo [Status]
git status --short --untracked-files=all

echo.
echo [Letzte Commits]
git log --oneline -5

echo.
echo [Remote]
git remote -v

echo.
echo [Live-Backup]
if exist "D:\Streaming\stramAssets_DEPLOY_BACKUP\latest" (
  echo latest vorhanden: D:\Streaming\stramAssets_DEPLOY_BACKUP\latest
) else (
  echo kein latest-Backup gefunden.
)

if exist "D:\Streaming\stramAssets_DEPLOY_BACKUP\history" (
  echo history:
  dir /b /ad "D:\Streaming\stramAssets_DEPLOY_BACKUP\history"
)

echo.
echo [Backend-Aenderungen]
git diff --name-only | findstr /I /R "^backend/ ^backend\\"
if errorlevel 1 echo Keine getrackten backend/-Aenderungen im Diff erkannt.

echo.
exit /b 0
