@echo off
setlocal EnableExtensions EnableDelayedExpansion

set BASE=http://127.0.0.1:8080

echo.
echo ============================================================
echo CAN-24.8 Local Route Test
echo Base: %BASE%
echo ============================================================
echo.
echo Voraussetzung:
echo - Node/Backend muss laufen
echo - Dieses Script aus D:\Git\stream-control-center starten
echo - Noch kein produktiver Sound-Test, nur Diagnose-Routen
echo.

call :check "Backend Health" "%BASE%/api/_status"
call :check "Bus Matrix" "%BASE%/api/bus-integration-matrix/status"
call :check "Channelpoints Candidates" "%BASE%/api/channelpoints/bus/sound-migration-candidates"
call :check "Channelpoints Candidate DryRun" "%BASE%/api/channelpoints/bus/sound-migration-candidates/dry-run"
call :check "Shadow Status" "%BASE%/api/channelpoints/bus/sound-shadow-dry-run/status"
call :check "Shadow Evaluation" "%BASE%/api/channelpoints/bus/sound-shadow-dry-run/evaluation"
call :check "Shadow Auto Status" "%BASE%/api/channelpoints/bus/sound-shadow-dry-run/auto-status"
call :check "Sound DryRun Contract" "%BASE%/api/sound/eventbus/command/contract"
call :check "Sound Queue Status" "%BASE%/api/sound/eventbus/command/queue-status"

echo.
echo ============================================================
echo Fertig.
echo Bitte die Ausgabe pruefen:
echo - HTTP 200 ist gut
echo - 404 bedeutet Route fehlt / falscher Stand / Node nicht neu gestartet
echo - 500 bedeutet Backend-Fehler im laufenden System
echo ============================================================
echo.
pause
exit /b 0

:check
set NAME=%~1
set URL=%~2
echo.
echo ------------------------------------------------------------
echo %NAME%
echo %URL%
echo ------------------------------------------------------------
curl -s -o nul -w "HTTP %%{http_code}  Time %%{time_total}s\n" "%URL%"
exit /b 0
