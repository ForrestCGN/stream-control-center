@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "BACKUP=D:\Streaming\stramAssets_DEPLOY_BACKUP\latest"
set "TARGET=D:\Streaming\stramAssets"

echo.
echo ============================================================
echo [stepundo] Test-Deploy zuruecknehmen / Live-Backup wiederherstellen
echo ============================================================
echo Backup: %BACKUP%
echo Ziel:   %TARGET%
echo.

if not exist "%BACKUP%" (
  echo [error] Kein aktuelles Live-Backup gefunden: %BACKUP%
  echo [hinweis] Falls altes Backup-System genutzt wurde, pruefe: D:\Streaming\stramAssets_DEPLOY_BACKUP
  git status --short --untracked-files=all
  exit /b 1
)

echo Optionen:
echo   J = Live-Backup nach D:\Streaming\stramAssets zurueckspielen
echo   N = abbrechen und nur Status anzeigen
choice /C JN /M "Live-Backup wirklich zurueckspielen? J/N"
if errorlevel 2 (
  echo Abgebrochen.
  echo.
  git status --short --untracked-files=all
  exit /b 0
)

robocopy "%BACKUP%" "%TARGET%" /E
if %ERRORLEVEL% LEQ 7 (
  echo.
  echo [ok] Live-Backup wurde zurueckgespielt.
  echo [hinweis] Wenn Backend betroffen war: Node danach neu starten.
  echo.
  echo Lokaler Repo-Status:
  git status --short --untracked-files=all
  echo.
  echo [wichtig] Lokale Repo-Aenderungen wurden NICHT verworfen.
  echo Wenn der Teststand komplett weg soll, erst Status pruefen und dann bewusst git restore/git clean nutzen.
  exit /b 0
)

echo [error] Robocopy meldete Fehlercode %ERRORLEVEL%.
exit /b 1
