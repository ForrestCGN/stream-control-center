@echo off
setlocal

set BACKUP=D:\Streaming\stramAssets_DEPLOY_BACKUP
set TARGET=D:\Streaming\stramAssets

echo ============================================================
echo  CONTROL-CENTER - BACKUP ZURUECKSPIELEN
echo ============================================================
echo.
echo Quelle: %BACKUP%
echo Ziel:   %TARGET%
echo.

if not exist "%BACKUP%" (
  echo [FEHLER] Kein Backup gefunden: %BACKUP%
  pause
  exit /b 1
)

echo ACHTUNG: Dies kopiert das letzte Deploy-Backup zurueck ins Live-System.
choice /C JN /M "Wirklich zurueckspielen? J/N"
if errorlevel 2 (
  echo Abgebrochen.
  pause
  exit /b 0
)

robocopy "%BACKUP%" "%TARGET%" /E
if %ERRORLEVEL% LEQ 7 (
  echo.
  echo ============================================================
  echo  FERTIG. Backup wurde zurueckgespielt.
  echo ============================================================
  pause
  exit /b 0
)

echo.
echo [FEHLER] Robocopy meldete Fehlercode %ERRORLEVEL%.
pause
exit /b 1
