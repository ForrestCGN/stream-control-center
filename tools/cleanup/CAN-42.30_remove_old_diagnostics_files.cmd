@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0\..\.."

set "BACKUP_ROOT=project-state\cleanup-backups"
for /f "tokens=1-4 delims=.:-/ " %%a in ("%date% %time%") do (
  set "D1=%%a"
  set "D2=%%b"
  set "D3=%%c"
  set "D4=%%d"
)
set "TS=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "TS=%TS: =0%"
set "BACKUP_DIR=%BACKUP_ROOT%\CAN-42.30_diagnostics_old_files_%TS%"

mkdir "%BACKUP_DIR%" >nul 2>nul

set COUNT_FOUND=0
set COUNT_REMOVED=0

call :backup_and_delete "htdocs\dashboard\modules\diagnostics_generic_details.js"
call :backup_and_delete "htdocs\dashboard\modules\diagnostics_hug_display_fix.js"
call :backup_and_delete "htdocs\dashboard\modules\birthday_readonly_diagnostics.css"
call :backup_and_delete "htdocs\dashboard\modules\birthday_readonly_diagnostics.js"
call :backup_and_delete "htdocs\dashboard\modules\birthday_readonly_safety_ext.css"
call :backup_and_delete "htdocs\dashboard\modules\birthday_readonly_safety_ext.js"
call :backup_and_delete "htdocs\dashboard\modules\message_rotator_readonly_diagnostics.css"
call :backup_and_delete "htdocs\dashboard\modules\message_rotator_readonly_diagnostics.js"
call :backup_and_delete "htdocs\dashboard\modules\tagebuch_readonly_diagnostics.css"
call :backup_and_delete "htdocs\dashboard\modules\tagebuch_readonly_diagnostics.js"
call :backup_and_delete "htdocs\dashboard\modules\todo_readonly_diagnostics.css"
call :backup_and_delete "htdocs\dashboard\modules\todo_readonly_diagnostics.js"

echo.
echo CAN-42.30 Cleanup abgeschlossen.
echo Gefundene Dateien: %COUNT_FOUND%
echo Entfernte Dateien: %COUNT_REMOVED%
echo Backup: %BACKUP_DIR%
echo.
echo Bitte danach testen:
echo   node -c htdocs\dashboard\modules\diagnostics.js
echo   Dashboard hart neu laden: STRG+F5
echo.
exit /b 0

:backup_and_delete
set "TARGET=%~1"
if exist "%TARGET%" (
  set /a COUNT_FOUND+=1
  set "DEST=%BACKUP_DIR%\%TARGET%"
  for %%F in ("!DEST!") do mkdir "%%~dpF" >nul 2>nul
  copy /Y "%TARGET%" "!DEST!" >nul
  if errorlevel 1 (
    echo FEHLER: Backup fehlgeschlagen: %TARGET%
    exit /b 1
  )
  del /F /Q "%TARGET%"
  if errorlevel 1 (
    echo FEHLER: Entfernen fehlgeschlagen: %TARGET%
    exit /b 1
  )
  set /a COUNT_REMOVED+=1
  echo Entfernt: %TARGET%
) else (
  echo Nicht vorhanden, uebersprungen: %TARGET%
)
exit /b 0
