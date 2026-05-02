@echo off
setlocal

set REPO=D:\Git\stream-control-center

echo ============================================================
echo  CONTROL-CENTER - GIT STATUS PRUEFEN
echo ============================================================
echo.

if not exist "%REPO%" (
  echo [FEHLER] Repo-Ordner nicht gefunden: %REPO%
  pause
  exit /b 1
)

cd /d "%REPO%"

echo [Branch]
git branch -vv

echo.
echo [Status]
git status

echo.
echo [Letzte Commits]
git log --oneline -5

echo.
echo [Remote]
git remote -v

echo.
pause
