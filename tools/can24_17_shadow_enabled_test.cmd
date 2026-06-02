@echo off
setlocal EnableExtensions EnableDelayedExpansion

set BASE=http://127.0.0.1:8080
set REWARD_KEY=bauernweisheit

echo.
echo ============================================================
echo CAN-24.17 Shadow-Hook enabled=true Local DryRun Test
echo Base: %BASE%
echo Reward: %REWARD_KEY%
echo ============================================================
echo.
echo Sicherheit:
echo - Nur Shadow-DryRun
echo - Kein Sound-Play
echo - Keine Queue
echo - Keine Twitch-/Redemption-Aenderung
echo - Danach wird enabled automatisch wieder auf false gesetzt
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
curl -s "%BASE%/api/channelpoints/bus/sound-shadow-dry-run/auto-config?rewardKey=%REWARD_KEY%&enabled=true&configuredBy=can24_17_local_test"
echo.

echo.
echo ------------------------------------------------------------
echo 3) Auto-Test ausfuehren
echo Erwartung: accepted true, skipped false, queueTouched false, audioTouched false
echo ------------------------------------------------------------
curl -s "%BASE%/api/channelpoints/bus/sound-shadow-dry-run/auto-test?rewardKey=%REWARD_KEY%"
echo.

echo.
echo ------------------------------------------------------------
echo 4) Shadow-Hook wieder deaktivieren
echo ------------------------------------------------------------
curl -s "%BASE%/api/channelpoints/bus/sound-shadow-dry-run/auto-config?rewardKey=%REWARD_KEY%&enabled=false&configuredBy=can24_17_auto_disable"
echo.

echo.
echo ------------------------------------------------------------
echo 5) Status danach
echo Erwartung: enabled false, lastAutoResult accepted true
echo ------------------------------------------------------------
curl -s "%BASE%/api/channelpoints/bus/sound-shadow-dry-run/auto-status"
echo.

echo.
echo ============================================================
echo Fertig.
echo Bitte pruefen:
echo - Auto-Test: skipped false
echo - Auto-Test: accepted true
echo - queueTouched false
echo - audioTouched false
echo - productiveMigration false
echo - Endstatus: enabled false
echo ============================================================
echo.
pause
exit /b 0
