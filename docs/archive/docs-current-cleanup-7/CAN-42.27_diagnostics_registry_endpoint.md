# CAN-42.27 Diagnose-Registry Endpoint

## Ziel
Die zentrale Diagnose-Liste soll nicht mehr ausschließlich hart im Frontend gepflegt werden. Dafür wurde ein read-only Registry-Endpunkt im bestehenden Diagnostics-Modul ergänzt.

## Geänderte Dateien
- `backend/modules/diagnostics.js`
- `htdocs/dashboard/modules/diagnostics.js`

## Neuer Endpunkt
- `GET /api/diagnostics/registry`

Zusätzliche Aliase:
- `GET /diag/registry`
- `GET /api/diag/registry`

## Registry-Inhalt
Der Endpunkt liefert die aktuell bekannten Diagnose-Einträge inklusive Label, Gruppe und Statusroute:
- Birthday → `/api/birthday/status`
- Todo → `/api/todo/status`
- Tagebuch → `/api/tagebuch/status`
- Hug-System → `/api/hug/status`
- Commands → `/api/commands/status`
- Message-Rotator → `/api/message-rotator/status`
- Bus-Diagnose → `/api/bus-diagnostics/status`
- Communication-Bus → `/api/communication/status`
- Overlay-Monitor → `/api/overlay-monitor/status`
- OBS → `/api/obs/status`
- Sound-System → `/api/sound/status`
- Medienverwaltung → `/api/media/status`
- VIP-System → `/api/vip-sound/status`
- Alerts → `/api/alerts/status`

## Dashboard-Verhalten
`diagnostics.js` versucht beim Laden zuerst `/api/diagnostics/registry` zu lesen. Wenn der Endpunkt nicht erreichbar ist, nutzt das Dashboard weiterhin die lokale Fallback-Liste. Dadurch bleibt die Diagnose rückwärtskompatibel.

## Nicht geändert
- Keine Statusroute der Fachmodule geändert.
- Keine OBS-/Sound-/Show-/Chat-/Admin-Aktion geändert.
- Keine DB-Migration.
- Keine neue Dashboard-Zusatzdatei.
- Keine Funktionalität entfernt.

## Tests
```powershell
node -c backend\modules\diagnostics.js
node -c htdocs\dashboard\modules\diagnostics.js

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r | Select-Object ok,module,moduleVersion,registryVersion,source
$r.entries | Select-Object key,label,group,status
```
