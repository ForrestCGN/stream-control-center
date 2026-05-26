# STEP393A_DIRECT_OVERLAY_RECONNECT_STABLE_PS51_FIX

Status-Fix für den Diagnose-Check aus STEP393.

## Grund

Das STEP393-Quick-Status-Skript nutzte den PowerShell-7-Null-Coalescing-Operator `??`.
Auf Forrests System läuft der Check in Windows PowerShell 5.1, wodurch das Skript bereits beim Parsen fehlschlägt.

## Änderung

Nur Diagnose-Skript ersetzt/ergänzt:

- `tools/diagnostics/STEP393A_quick_status_check_ps51.ps1`

Keine Änderung an:

- `backend/modules/alert_system.js`
- `_overlay-alerts-v2.html`
- Sound-System
- Communication-Bus
- OBS-URL

## Gültiger Produktionsstand bleibt

- Produktiv: `http://127.0.0.1:8080/overlays/_overlay-alerts-v2.html`
- Nicht produktiv: `_overlay-alerts-v2-bus.html?debug=1&mode=bridge`

## Erwartung

`STEP393A_STATUS=PASS`
