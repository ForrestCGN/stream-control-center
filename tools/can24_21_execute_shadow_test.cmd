@echo off
setlocal EnableExtensions EnableDelayedExpansion

set BASE=http://127.0.0.1:8080
set REWARD_KEY=bauernweisheit

echo.
echo ============================================================
echo CAN-24.21 Local Execute-Shadow Test
echo Base: %BASE%
echo Reward: %REWARD_KEY%
echo ============================================================
echo.
echo WICHTIG:
echo - Dieser Test ruft den bestehenden Legacy-Execute-Pfad auf.
echo - Dadurch KANN der normale Sound ueber /api/sound/play abgespielt werden.
echo - Das ist KEIN Sound-Bus-Play und KEINE Migration.
echo - Der Shadow-Hook bleibt DryRun/Diagnose.
echo - Danach wird Shadow enabled automatisch wieder auf false gesetzt.
echo.

choice /C JN /N /M "Fortfahren und den Legacy-Execute-Test fuer bauernweisheit starten? [J/N] "
if errorlevel 2 (
  echo.
  echo Abgebrochen. Es wurde nichts ausgefuehrt.
  exit /b 1
)

echo.
echo ------------------------------------------------------------
echo 1) Status vorher
echo ------------------------------------------------------------
curl -s "%BASE%/api/channelpoints/bus/sound-shadow-dry-run/auto-status"
echo.

echo.
echo ------------------------------------------------------------
echo 2) Shadow-Hook fuer genau %REWARD_KEY% aktivieren
echo ------------------------------------------------------------
curl -s "%BASE%/api/channelpoints/bus/sound-shadow-dry-run/auto-config?rewardKey=%REWARD_KEY%&enabled=true&configuredBy=can24_21_local_execute_shadow_test"
echo.

echo.
echo ------------------------------------------------------------
echo 3) Lokalen Legacy-Execute ausfuehren
echo Erwartung:
echo - Legacy kann Sound ueber /api/sound/play ausloesen
echo - Shadow parallel: accepted true, queueTouched false, audioTouched false
echo ------------------------------------------------------------
curl -s "%BASE%/api/channelpoints/execute?reward=%REWARD_KEY%&userLogin=can24_shadow_test&userDisplayName=CAN24ShadowTest&userInput=can24_21_execute_shadow_test"
echo.

echo.
echo ------------------------------------------------------------
echo 4) Shadow-Hook wieder deaktivieren
echo ------------------------------------------------------------
curl -s "%BASE%/api/channelpoints/bus/sound-shadow-dry-run/auto-config?rewardKey=%REWARD_KEY%&enabled=false&configuredBy=can24_21_auto_disable"
echo.

echo.
echo ------------------------------------------------------------
echo 5) Status danach
echo Erwartung:
echo - enabled false
echo - attempts mindestens 1
echo - okCount mindestens 1
echo - lastAutoResult.accepted true
echo - lastAutoResult.queueTouched false
echo - lastAutoResult.audioTouched false
echo - lastAutoResult.productiveMigration false
echo ------------------------------------------------------------
curl -s "%BASE%/api/channelpoints/bus/sound-shadow-dry-run/auto-status"
echo.

echo.
echo ============================================================
echo Fertig.
echo Bitte pruefen:
echo - Legacy Execute ok
echo - Shadow lastAutoResult accepted true
echo - Shadow queueTouched false
echo - Shadow audioTouched false
echo - Shadow productiveMigration false
echo - Endstatus enabled false
echo ============================================================
echo.
pause
exit /b 0
