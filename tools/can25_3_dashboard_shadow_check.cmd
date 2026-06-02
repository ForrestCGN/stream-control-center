@echo off
setlocal EnableExtensions EnableDelayedExpansion

set BASE=http://127.0.0.1:8080

echo.
echo ============================================================
echo CAN-25.3 Dashboard Sound-Shadow Readonly Check
echo Base: %BASE%
echo ============================================================
echo.
echo Dieser Check ist read-only:
echo - kein Sound-Play
echo - keine Queue-Aktion
echo - keine Twitch-/Redemption-Aktion
echo - keine Migration
echo - kein Enable/Disable
echo.

echo ------------------------------------------------------------
echo 1) Backend Health
echo ------------------------------------------------------------
curl -s "%BASE%/api/_status"
echo.

echo.
echo ------------------------------------------------------------
echo 2) Bus Integration Matrix
echo ------------------------------------------------------------
curl -s "%BASE%/api/bus-integration-matrix/status"
echo.

echo.
echo ------------------------------------------------------------
echo 3) Sound-Shadow Auto-Status
echo Erwartung:
echo - enabled false
echo - rewardKey bauernweisheit
echo - executeHookInstalled true
echo - eventSubHookInstalled false
echo - productiveMigration false
echo ------------------------------------------------------------
curl -s "%BASE%/api/channelpoints/bus/sound-shadow-dry-run/auto-status"
echo.

echo.
echo ------------------------------------------------------------
echo 4) Sound-Shadow Evaluation
echo ------------------------------------------------------------
curl -s "%BASE%/api/channelpoints/bus/sound-shadow-dry-run/evaluation"
echo.

echo.
echo ------------------------------------------------------------
echo 5) Sound Migration Candidates
echo ------------------------------------------------------------
curl -s "%BASE%/api/channelpoints/bus/sound-migration-candidates"
echo.

echo.
echo ============================================================
echo Dashboard pruefen:
echo - Bus-Diagnostics / Bus-Matrix oeffnen
echo - Sound-Shadow Status Card sichtbar?
echo - Card ist read-only?
echo - Keine Buttons fuer Enable/Test/Execute/Sound/Migration?
echo - Safety Flags sichtbar?
echo - Deaktivierungs-Hinweis nur als Text?
echo ============================================================
echo.
pause
exit /b 0
